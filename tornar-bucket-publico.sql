-- ================================================
-- TORNAR BUCKET GENERATIONS PÚBLICO
-- Execute este SQL no Supabase SQL Editor
-- ================================================

-- 1. Tornar o bucket público
UPDATE storage.buckets
SET public = true
WHERE name = 'generations';

-- 2. Criar policy para permitir leitura pública
CREATE POLICY IF NOT EXISTS "Public Access to Generations"
ON storage.objects
FOR SELECT
USING (bucket_id = 'generations');

-- 3. Verificar se funcionou
SELECT id, name, public
FROM storage.buckets
WHERE name = 'generations';
