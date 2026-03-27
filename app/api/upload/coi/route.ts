import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getClientIp, writeAuditLog } from '@/lib/security';

const BUCKET = 'booking-documents';
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

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

    const supabase = createAdminClient();
    const ext = file.name.split('.').pop() ?? 'bin';
    const path = `coi/${bookingId}/${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

    if (error) {
      writeAuditLog('upload.coi.error', { ip, bookingId, error: error.message });
      return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
    }

    writeAuditLog('upload.coi.success', { ip, bookingId, path, expiryDate });
    return NextResponse.json({ path, expiryDate }, { status: 200 });
  } catch (err) {
    console.error('COI upload error:', err);
    writeAuditLog('upload.coi.error', { ip, error: err instanceof Error ? err.message : 'unknown' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
