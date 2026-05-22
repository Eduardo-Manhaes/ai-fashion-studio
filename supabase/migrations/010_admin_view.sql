-- Migration 010: Admin User Overview View
-- Cria uma view que agrega dados de usuários, assinaturas, planos, quotas e gerações
-- Para facilitar queries do painel admin

CREATE OR REPLACE VIEW admin_user_overview AS
SELECT
  u.id AS user_id,
  u.email,
  u.created_at AS signup_at,
  s.plan_id,
  p.name AS plan_name,
  p.price_brl,
  s.status AS subscription_status,
  s.current_period_start,
  s.current_period_end,
  s.stripe_customer_id,
  s.stripe_subscription_id,

  -- Créditos do plano (quota mensal)
  COALESCE(q.credits_limit, p.monthly_quota_credits, 0) AS credits_limit,
  COALESCE(q.credits_used, 0) AS credits_used,
  COALESCE(q.credits_limit, p.monthly_quota_credits, 0) - COALESCE(q.credits_used, 0) AS credits_remaining,

  -- Créditos de packs avulsos (soma dos packs ativos)
  COALESCE(
    (SELECT SUM(credits_remaining)
     FROM credit_packs
     WHERE user_id = u.id
       AND credits_remaining > 0
       AND (expires_at IS NULL OR expires_at > NOW())
    ),
    0
  ) AS pack_credits,

  -- Total de créditos gastos (histórico completo)
  COALESCE(
    (SELECT SUM(credits_cost)
     FROM generation_jobs
     WHERE user_id = u.id
       AND status IN ('completed', 'processing')
    ),
    0
  ) AS total_credits_spent,

  -- Total de gerações completadas
  COALESCE(
    (SELECT COUNT(*)
     FROM generation_jobs
     WHERE user_id = u.id
       AND status = 'completed'
    ),
    0
  ) AS total_generations,

  -- Última geração
  (SELECT created_at
   FROM generation_jobs
   WHERE user_id = u.id
   ORDER BY created_at DESC
   LIMIT 1
  ) AS last_generation_at

FROM auth.users u
LEFT JOIN subscriptions s ON s.user_id = u.id
LEFT JOIN plans p ON p.id = s.plan_id
LEFT JOIN quota_usage q ON q.user_id = u.id
  AND q.period_start = s.current_period_start;

-- Comentário sobre a view
COMMENT ON VIEW admin_user_overview IS
'View agregada para painel admin - combina dados de usuários, assinaturas, quotas e gerações. Atualizada em tempo real (não é materializada).';
