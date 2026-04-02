import { NextRequest, NextResponse } from 'next/server';
import { requireHostSession } from '@/lib/host-auth';
import { createAdminClient } from '@/utils/supabase/admin';

const BUCKET = 'property-images';
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// POST /api/host/properties/[id]/photos - upload a photo
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ownerEmail = await requireHostSession(request);
  if (typeof ownerEmail !== 'string') return ownerEmail;

  const supabase = createAdminClient();

  // Verify ownership
  const { data: property } = await supabase
    .from('properties')
    .select('id, images')
    .eq('id', params.id)
    .eq('owner_email', ownerEmail)
    .maybeSingle();

  if (!property) {
    return NextResponse.json({ error: 'Property not found or access denied' }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type. Use JPG, PNG, or WebP.' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${params.id}/${Date.now()}.${ext}`;
  const buffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const imageUrl = urlData.publicUrl;

  // Append to property images array
  const existingImages = (property.images as string[]) ?? [];
  const newImages = [...existingImages, imageUrl];

  await supabase
    .from('properties')
    .update({ images: newImages })
    .eq('id', params.id)
    .eq('owner_email', ownerEmail);

  return NextResponse.json({ url: imageUrl, images: newImages });
}

// DELETE /api/host/properties/[id]/photos - delete a photo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ownerEmail = await requireHostSession(request);
  if (typeof ownerEmail !== 'string') return ownerEmail;

  const supabase = createAdminClient();

  // Verify ownership
  const { data: property } = await supabase
    .from('properties')
    .select('id, images')
    .eq('id', params.id)
    .eq('owner_email', ownerEmail)
    .maybeSingle();

  if (!property) {
    return NextResponse.json({ error: 'Property not found or access denied' }, { status: 404 });
  }

  const { imageUrl } = await request.json();
  if (!imageUrl) return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });

  // Extract storage path from URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const storageBase = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/`;
  const storagePath = imageUrl.replace(storageBase, '');

  // Security: verify the path belongs to this property
  if (!storagePath.startsWith(`${params.id}/`)) {
    return NextResponse.json({ error: 'Cannot delete photos from other properties' }, { status: 403 });
  }

  await supabase.storage.from(BUCKET).remove([storagePath]);

  const existingImages = (property.images as string[]) ?? [];
  const newImages = existingImages.filter((img) => img !== imageUrl);

  await supabase
    .from('properties')
    .update({ images: newImages })
    .eq('id', params.id)
    .eq('owner_email', ownerEmail);

  return NextResponse.json({ images: newImages });
}
