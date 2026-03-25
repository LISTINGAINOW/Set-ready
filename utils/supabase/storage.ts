import { createClient } from './client';

const BUCKET = 'property-images';

export async function uploadPropertyImage(propertyId: string, file: File) {
  const supabase = createClient();
  const ext = file.name.split('.').pop();
  const path = `${propertyId}/${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false });

  if (error) throw error;
  return data.path;
}

export function getPropertyImageUrl(path: string) {
  const supabase = createClient();
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function listPropertyImages(propertyId: string) {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(propertyId, { sortBy: { column: 'created_at', order: 'asc' } });

  if (error) throw error;
  return (data ?? []).map((file) => ({
    name: file.name,
    path: `${propertyId}/${file.name}`,
    url: getPropertyImageUrl(`${propertyId}/${file.name}`),
  }));
}

export async function deletePropertyImage(path: string) {
  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}
