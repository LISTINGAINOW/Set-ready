/**
 * Supabase Storage setup instructions for SetVenue property images.
 *
 * Run this file for documentation only — bucket creation requires the
 * service role key, which should never be committed. Follow the manual
 * steps below in the Supabase dashboard instead.
 *
 * Dashboard: https://wvqarkjjjngzfkmtkxsa.supabase.co
 */

const BUCKET_NAME = 'property-images';

const steps = [
  {
    step: 1,
    title: 'Create the bucket',
    instructions: [
      `Go to Storage → New bucket`,
      `Name: ${BUCKET_NAME}`,
      `Public bucket: YES (images are served publicly)`,
      `File size limit: 10 MB (recommended)`,
      `Allowed MIME types: image/jpeg, image/png, image/webp, image/gif`,
    ],
  },
  {
    step: 2,
    title: 'RLS policy — allow public reads',
    sql: `
CREATE POLICY "Public read access"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = '${BUCKET_NAME}');
    `.trim(),
  },
  {
    step: 3,
    title: 'RLS policy — allow authenticated uploads',
    sql: `
CREATE POLICY "Authenticated users can upload"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = '${BUCKET_NAME}');
    `.trim(),
  },
  {
    step: 4,
    title: 'RLS policy — allow authenticated deletes',
    sql: `
CREATE POLICY "Authenticated users can delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = '${BUCKET_NAME}');
    `.trim(),
  },
];

console.log('=== Supabase Storage Setup ===\n');
for (const s of steps) {
  console.log(`Step ${s.step}: ${s.title}`);
  if ('instructions' in s && s.instructions) {
    s.instructions.forEach((line) => console.log(`  • ${line}`));
  }
  if ('sql' in s && s.sql) {
    console.log('\n  SQL (run in Supabase SQL Editor or Dashboard → Policies):\n');
    console.log(s.sql.split('\n').map((l) => `  ${l}`).join('\n'));
  }
  console.log();
}

console.log('After completing the above, the property-images bucket is ready.');
console.log('Utility functions are in utils/supabase/storage.ts');
