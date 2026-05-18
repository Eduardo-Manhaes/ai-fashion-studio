-- ============================================================
-- 001 — Schema inicial AI Fashion Studio
-- ============================================================

-- Tabela de planos disponíveis
CREATE TABLE plans (
  id TEXT PRIMARY KEY, -- 'starter', 'pro', 'enterprise'
  name TEXT NOT NULL,
  description TEXT,
  monthly_quota_credits INTEGER NOT NULL,
  price_brl DECIMAL(10,2) NOT NULL,
  stripe_price_id TEXT, -- preenchido quando integrar Stripe
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  features JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed dos 3 planos iniciais
INSERT INTO plans (id, name, description, monthly_quota_credits, price_brl, display_order, features) VALUES
  ('starter', 'Starter', 'Ideal para começar', 50, 49.00, 1, '["50 créditos/mês", "Fotos e vídeos", "Suporte por e-mail"]'::JSONB),
  ('pro', 'Pro', 'Para lojas em crescimento', 200, 149.00, 2, '["200 créditos/mês", "Prioridade de geração", "Suporte WhatsApp"]'::JSONB),
  ('enterprise', 'Enterprise', 'Volume profissional', 1000, 599.00, 3, '["1000 créditos/mês", "Suporte dedicado", "Acesso antecipado a features"]'::JSONB);

-- Pesos de consumo por tipo de geração
CREATE TABLE generation_costs (
  generation_type TEXT PRIMARY KEY,
  credits_cost INTEGER NOT NULL,
  description TEXT
);

INSERT INTO generation_costs (generation_type, credits_cost, description) VALUES
  ('photo', 1, 'Foto estática (FASHN)'),
  ('video_movement', 5, 'Vídeo com movimento (Kling)'),
  ('video_talking', 8, 'Vídeo com fala (Veo 3.1)');

-- Assinatura ativa de cada usuário
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES plans(id),
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'past_due', 'trialing'
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id) -- 1 usuário = 1 assinatura ativa
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Uso de cota no ciclo atual (uma linha por ciclo)
CREATE TABLE quota_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  credits_limit INTEGER NOT NULL,
  credits_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period_start)
);

CREATE INDEX idx_quota_user_period ON quota_usage(user_id, period_end);

-- Pacotes de créditos avulsos (não expiram com o ciclo)
CREATE TABLE credit_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_purchased INTEGER NOT NULL,
  credits_remaining INTEGER NOT NULL,
  price_paid_brl DECIMAL(10,2) NOT NULL,
  stripe_payment_id TEXT,
  expires_at TIMESTAMPTZ, -- NULL = nunca expira
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credit_packs_user_remaining ON credit_packs(user_id, credits_remaining) WHERE credits_remaining > 0;

-- Histórico de gerações (auditoria + sobrevive à aba fechar)
CREATE TABLE generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  generation_type TEXT NOT NULL REFERENCES generation_costs(generation_type),
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'refunded'
  credits_cost INTEGER NOT NULL,
  credit_source TEXT NOT NULL, -- 'quota' ou 'pack'
  credit_source_id UUID, -- referência opcional ao pack debitado
  provider TEXT NOT NULL, -- 'fashn', 'kling', 'veo'
  provider_job_id TEXT, -- ID retornado pela API externa pra polling
  prompt TEXT,
  input_payload JSONB, -- snapshot do request pro debug
  result_url TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_jobs_user_created ON generation_jobs(user_id, created_at DESC);
CREATE INDEX idx_jobs_status ON generation_jobs(status) WHERE status IN ('pending', 'processing');

-- Trigger pra atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_quota_usage_updated_at BEFORE UPDATE ON quota_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
