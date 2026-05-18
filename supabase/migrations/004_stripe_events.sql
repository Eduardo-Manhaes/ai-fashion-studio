-- ============================================================
-- 004 — Auditoria de eventos Stripe (idempotência) e packs
-- ============================================================

-- Tabela de eventos processados — garante que o mesmo evento não rode 2x
CREATE TABLE stripe_events (
  id TEXT PRIMARY KEY, -- event.id do Stripe (ex: evt_1ABC...)
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'processed', -- 'processed', 'failed', 'ignored'
  error_message TEXT
);

CREATE INDEX idx_stripe_events_type ON stripe_events(type);
CREATE INDEX idx_stripe_events_processed ON stripe_events(processed_at DESC);

-- Catálogo de pacotes de crédito avulso (mesma ideia da tabela plans)
CREATE TABLE credit_pack_offerings (
  id TEXT PRIMARY KEY, -- 'pack_50', 'pack_200', 'pack_500'
  name TEXT NOT NULL,
  description TEXT,
  credits INTEGER NOT NULL,
  price_brl DECIMAL(10,2) NOT NULL,
  stripe_price_id TEXT, -- preenchido depois
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  expires_in_days INTEGER, -- NULL = créditos não expiram
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO credit_pack_offerings (id, name, description, credits, price_brl, display_order, expires_in_days) VALUES
  ('pack_50',  'Pacote 50 créditos',  'Recarga rápida',           50,   29.00, 1, 180),
  ('pack_200', 'Pacote 200 créditos', 'Melhor custo-benefício',  200,  99.00, 2, 365),
  ('pack_500', 'Pacote 500 créditos', 'Para alto volume',        500, 219.00, 3, 365);

-- RLS pública para leitura
ALTER TABLE credit_pack_offerings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pack_offerings_read_all" ON credit_pack_offerings FOR SELECT USING (true);

-- stripe_events não precisa RLS — só backend acessa via service_role
