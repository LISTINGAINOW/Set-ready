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

    if (!file || !bookingId) {
      return NextResponse.json({ error: 'Missing file or bookingId' }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10 MB.' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Upload a JPG, PNG, WebP, or PDF.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const ext = file.name.split('.').pop() ?? 'bin';
    const path = `ids/${bookingId}/${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

    if (error) {
      writeAuditLog('upload.id.error', { ip, bookingId, error: error.message });
      return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
    }

    writeAuditLog('upload.id.success', { ip, bookingId, path });
    return NextResponse.json({ path }, { status: 200 });
  } catch (err) {
    console.error('ID upload error:', err);
    writeAuditLog('upload.id.error', { ip, error: err instanceof Error ? err.message : 'unknown' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
