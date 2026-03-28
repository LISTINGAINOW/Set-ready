import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getClientIp, writeAuditLog } from '@/lib/security';
import { requireUserSession } from '@/lib/auth-middleware';

const BUCKET = 'booking-documents';
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

// MED-7: Magic byte signatures for allowed file types
const MAGIC_BYTES: Array<{ mime: string; bytes: number[]; offset?: number }> = [
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { mime: 'image/png',  bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }, // "RIFF"
  { mime: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46] }, // "%PDF"
];

function detectMimeFromBytes(buf: Uint8Array): string | null {
  for (const sig of MAGIC_BYTES) {
    const offset = sig.offset ?? 0;
    const match = sig.bytes.every((b, i) => buf[offset + i] === b);
    if (match) return sig.mime;
  }
  return null;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // CRIT-5: Require authentication before accepting any upload
  const userId = requireUserSession(request);
  if (userId instanceof NextResponse) return userId;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bookingId = formData.get('bookingId') as string | null;
    const expiryDate = formData.get('expiryDate') as string | null;

    if (!file || !bookingId) {
      return NextResponse.json({ error: 'Missing file or bookingId' }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10 MB.' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Upload a JPG, PNG, WebP, or PDF.' }, { status: 400 });
    }

    // Validate COI expiry is in the future
    if (expiryDate) {
      const expiry = new Date(expiryDate);
      if (expiry <= new Date()) {
        return NextResponse.json({ error: 'Certificate of Insurance must not be expired.' }, { status: 400 });
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const buf = new Uint8Array(arrayBuffer);

    // MED-7: Verify actual file content via magic bytes
    const detectedMime = detectMimeFromBytes(buf);
    if (!detectedMime || !ALLOWED_TYPES.includes(detectedMime)) {
      return NextResponse.json({ error: 'File content does not match the declared file type.' }, { status: 400 });
    }

    // CRIT-5: Verify the uploader owns the booking
    const supabase = createAdminClient();
    const { data: user } = await supabase.from('users').select('email').eq('id', userId).single();
    if (user) {
      const { data: booking } = await supabase
        .from('booking_requests')
        .select('id, guest_email')
        .eq('id', bookingId)
        .maybeSingle();
      if (booking && booking.guest_email !== user.email) {
        writeAuditLog('upload.coi.forbidden', { ip, bookingId, userId });
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const ext = file.name.split('.').pop() ?? 'bin';
    const path = `coi/${bookingId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, arrayBuffer, { contentType: detectedMime, upsert: false });

    if (error) {
      writeAuditLog('upload.coi.error', { ip, bookingId, error: error.message });
      return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
    }

    writeAuditLog('upload.coi.success', { ip, bookingId, path, expiryDate, userId });
    return NextResponse.json({ path, expiryDate }, { status: 200 });
  } catch (err) {
    console.error('COI upload error:', err);
    writeAuditLog('upload.coi.error', { ip, error: err instanceof Error ? err.message : 'unknown' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
