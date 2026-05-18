-- ============================================================
-- 007 — Fix RLS para permitir funções RPC acessarem tabelas
-- ============================================================

-- Problema: Funções SECURITY DEFINER rodam como service_role,
-- mas RLS policies bloqueiam acesso (auth.uid() != service_role)

-- Solução: Adicionar policies que permitem acesso via service_role
-- (autenticado via JWT service_role_key) sem comprometer segurança
-- para usuários normais

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE POLICY "subscriptions_service_role_full_access"
  ON subscriptions
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================
-- QUOTA_USAGE
-- ============================================================
CREATE POLICY "quota_service_role_full_access"
  ON quota_usage
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================
-- CREDIT_PACKS (PRINCIPAL PROBLEMA)
-- ============================================================
CREATE POLICY "packs_service_role_full_access"
  ON credit_packs
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================
-- GENERATION_JOBS
-- ============================================================
CREATE POLICY "jobs_service_role_full_access"
  ON generation_jobs
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================
-- Para testar se funcionou, rode:
-- SELECT * FROM credit_packs WHERE user_id = '<uuid-do-usuario>';
-- Deve retornar os pacotes quando chamado via service_role key
