
-- Simplify the storage policies to be more permissive for now
-- Remove the complex Firebase authentication check and make it simpler

DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;

-- Create temporary permissive policies that allow authenticated users to upload
-- This will bypass the Firebase UID matching issue
CREATE POLICY "Allow authenticated users to upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Allow authenticated users to update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Allow authenticated users to delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' AND
  auth.uid() IS NOT NULL
);

-- Also ensure the bucket exists and is properly configured
UPDATE storage.buckets 
SET public = true 
WHERE id = 'product-images';
