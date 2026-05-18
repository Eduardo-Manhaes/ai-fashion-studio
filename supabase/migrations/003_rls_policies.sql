-- ============================================================
-- 003 — Row Level Security
-- ============================================================

-- Plans e generation_costs são públicos (qualquer um logado pode ler)
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_read_all" ON plans FOR SELECT USING (true);

ALTER TABLE generation_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "costs_read_all" ON generation_costs FOR SELECT USING (true);

-- Subscriptions: usuário só vê a própria
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_read_own" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Quota usage: usuário só vê a própria
ALTER TABLE quota_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quota_read_own" ON quota_usage FOR SELECT USING (auth.uid() = user_id);

-- Credit packs: usuário só vê os próprios
ALTER TABLE credit_packs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "packs_read_own" ON credit_packs FOR SELECT USING (auth.uid() = user_id);

-- Generation jobs: usuário só vê os próprios
ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jobs_read_own" ON generation_jobs FOR SELECT USING (auth.uid() = user_id);

-- Inserções e updates só vão acontecer via service_role no backend, então não precisa de policy de write
