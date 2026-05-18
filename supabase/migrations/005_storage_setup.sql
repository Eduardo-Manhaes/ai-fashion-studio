-- ============================================================
-- 005 — Setup de Storage para gerações
-- ============================================================

-- Adiciona campo de path interno no Storage (caso precise regerar URL)
ALTER TABLE generation_jobs ADD COLUMN storage_path TEXT;
ALTER TABLE generation_jobs ADD COLUMN file_size_bytes BIGINT;
ALTER TABLE generation_jobs ADD COLUMN mime_type TEXT;
ALTER TABLE generation_jobs ADD COLUMN expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days');

CREATE INDEX idx_jobs_expires_at ON generation_jobs(expires_at) WHERE storage_path IS NOT NULL;

-- Comentário para documentar a política
COMMENT ON COLUMN generation_jobs.expires_at IS 'Data de expiração para limpeza automática do Storage. Default 90 dias.';
COMMENT ON COLUMN generation_jobs.storage_path IS 'Caminho interno no bucket generations. Formato: {user_id}/{type}/{job_id}.{ext}';
