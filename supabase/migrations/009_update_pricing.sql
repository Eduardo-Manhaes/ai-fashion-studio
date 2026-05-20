-- Migration 009: Atualizar custos de crédito e planos
-- Data: 2026-05-20

-- 1. Atualizar custos por tipo de geração
UPDATE generation_costs SET credits_cost = 2, description = 'Foto com IA (GPT Image 2 + Clarity)' WHERE generation_type = 'photo';
UPDATE generation_costs SET credits_cost = 8, description = 'Vídeo com movimento (Kling)' WHERE generation_type = 'video_movement';
UPDATE generation_costs SET credits_cost = 15, description = 'Vídeo com fala (Veo 3.1)' WHERE generation_type = 'video_talking';

-- 2. Atualizar planos existentes
UPDATE plans SET
  monthly_quota_credits = 20,
  price_brl = 35.00,
  description = 'Ideal para começar — ~10 fotos ou 2 vídeos'
WHERE id = 'starter';

UPDATE plans SET
  monthly_quota_credits = 50,
  price_brl = 79.00,
  name = 'Starter',
  description = 'Para lojas em crescimento — ~25 fotos ou 6 vídeos'
WHERE id = 'pro';

UPDATE plans SET
  monthly_quota_credits = 120,
  price_brl = 159.00,
  name = 'Pro',
  description = 'Volume profissional — ~60 fotos ou 15 vídeos'
WHERE id = 'enterprise';

-- 3. Renomear IDs dos planos para corresponder aos nomes
-- Não é possível renomear PKs com UPDATE, então fazemos via swap
ALTER TABLE plans DISABLE TRIGGER ALL;

-- Backup temporário
CREATE TEMP TABLE plans_backup AS SELECT * FROM plans;

-- Remove os planos antigos
DELETE FROM plans WHERE id IN ('starter', 'pro', 'enterprise');

-- Insere com novos IDs
INSERT INTO plans (id, name, description, monthly_quota_credits, price_brl, display_order, features, stripe_price_id)
SELECT
  CASE
    WHEN id = 'starter' THEN 'basico'
    WHEN id = 'pro' THEN 'starter'
    WHEN id = 'enterprise' THEN 'pro'
  END,
  CASE
    WHEN id = 'starter' THEN 'Básico'
    WHEN id = 'pro' THEN 'Starter'
    WHEN id = 'enterprise' THEN 'Pro'
  END,
  CASE
    WHEN id = 'starter' THEN 'Ideal para começar — ~10 fotos ou 2 vídeos'
    WHEN id = 'pro' THEN 'Para lojas em crescimento — ~25 fotos ou 6 vídeos'
    WHEN id = 'enterprise' THEN 'Volume profissional — ~60 fotos ou 15 vídeos'
  END,
  CASE
    WHEN id = 'starter' THEN 20
    WHEN id = 'pro' THEN 50
    WHEN id = 'enterprise' THEN 120
  END,
  CASE
    WHEN id = 'starter' THEN 35.00
    WHEN id = 'pro' THEN 79.00
    WHEN id = 'enterprise' THEN 159.00
  END,
  display_order,
  CASE
    WHEN id = 'starter' THEN '["20 créditos/mês", "~10 fotos ou 2 vídeos", "Suporte por e-mail"]'::JSONB
    WHEN id = 'pro' THEN '["50 créditos/mês", "~25 fotos ou 6 vídeos", "Suporte WhatsApp"]'::JSONB
    WHEN id = 'enterprise' THEN '["120 créditos/mês", "~60 fotos ou 15 vídeos", "Suporte dedicado"]'::JSONB
  END,
  CASE
    WHEN id = 'starter' THEN 'price_1TZI7y2KyFcexK6NDYjNYVHg'
    WHEN id = 'pro' THEN 'price_1TZI7y2KyFcexK6NEi3RWiHS'
    WHEN id = 'enterprise' THEN 'price_1TZI7z2KyFcexK6Nuh6jr52G'
  END
FROM plans_backup;

ALTER TABLE plans ENABLE TRIGGER ALL;

-- 4. Comentário sobre o plano Enterprise
COMMENT ON TABLE plans IS 'Planos de assinatura. Enterprise (ilimitado) será tratado via consulta WhatsApp - não está no catálogo público.';
