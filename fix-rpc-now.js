const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const SQL_FIX = `
-- Recria a função debit_credits com SET LOCAL row_security = off
CREATE OR REPLACE FUNCTION debit_credits(
  p_user_id UUID,
  p_generation_type TEXT,
  p_job_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cost INTEGER;
  v_subscription RECORD;
  v_quota RECORD;
  v_pack RECORD;
  v_quota_available INTEGER;
  v_pack_total INTEGER;
BEGIN
  -- CRÍTICO: Desabilita RLS localmente (só para esta transação)
  SET LOCAL row_security = off;

  -- 1. Pega o custo da geração
  SELECT credits_cost INTO v_cost
  FROM generation_costs
  WHERE generation_type = p_generation_type;

  IF v_cost IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_generation_type');
  END IF;

  -- 2. Busca assinatura ativa do usuário
  SELECT * INTO v_subscription
  FROM subscriptions
  WHERE user_id = p_user_id AND status = 'active'
  FOR UPDATE;

  IF v_subscription IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'no_active_subscription');
  END IF;

  -- 3. Busca ou cria registro de quota_usage do ciclo atual
  SELECT * INTO v_quota
  FROM quota_usage
  WHERE user_id = p_user_id
    AND period_start = v_subscription.current_period_start
  FOR UPDATE;

  IF v_quota IS NULL THEN
    INSERT INTO quota_usage (user_id, subscription_id, period_start, period_end, credits_limit, credits_used)
    SELECT
      p_user_id,
      v_subscription.id,
      v_subscription.current_period_start,
      v_subscription.current_period_end,
      p.monthly_quota_credits,
      0
    FROM plans p WHERE p.id = v_subscription.plan_id
    RETURNING * INTO v_quota;
  END IF;

  v_quota_available := v_quota.credits_limit - v_quota.credits_used;

  -- 4. Tenta debitar primeiro da cota
  IF v_quota_available >= v_cost THEN
    UPDATE quota_usage
    SET credits_used = credits_used + v_cost
    WHERE id = v_quota.id;

    UPDATE generation_jobs
    SET credits_cost = v_cost, credit_source = 'quota'
    WHERE id = p_job_id;

    RETURN jsonb_build_object(
      'success', true,
      'source', 'quota',
      'credits_charged', v_cost,
      'remaining_quota', v_quota_available - v_cost
    );
  END IF;

  -- 5. Cota insuficiente: tenta debitar de pacotes avulsos
  SELECT COALESCE(SUM(credits_remaining), 0) INTO v_pack_total
  FROM credit_packs
  WHERE user_id = p_user_id
    AND credits_remaining > 0
    AND (expires_at IS NULL OR expires_at > NOW());

  IF v_pack_total < v_cost THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'insufficient_credits',
      'cost_required', v_cost,
      'quota_available', v_quota_available,
      'pack_available', v_pack_total
    );
  END IF;

  -- 6. Debita do pack mais antigo primeiro
  SELECT * INTO v_pack
  FROM credit_packs
  WHERE user_id = p_user_id
    AND credits_remaining >= v_cost
    AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY purchased_at ASC
  LIMIT 1
  FOR UPDATE;

  IF v_pack IS NOT NULL THEN
    UPDATE credit_packs
    SET credits_remaining = credits_remaining - v_cost
    WHERE id = v_pack.id;

    UPDATE generation_jobs
    SET credits_cost = v_cost, credit_source = 'pack', credit_source_id = v_pack.id
    WHERE id = p_job_id;

    RETURN jsonb_build_object(
      'success', true,
      'source', 'pack',
      'credits_charged', v_cost,
      'pack_id', v_pack.id,
      'pack_remaining', v_pack.credits_remaining - v_cost
    );
  END IF;

  RETURN jsonb_build_object(
    'success', false,
    'error', 'no_single_pack_covers_cost',
    'cost_required', v_cost
  );
END;
$$;
`;

(async () => {
  console.log('🔧 Aplicando correção RPC no Supabase...\n');

  const { data, error } = await supabase.rpc('exec_sql', { sql: SQL_FIX }).catch(() => null);

  if (error || !data) {
    console.log('⚠️  RPC exec_sql não disponível. Você precisa executar manualmente no SQL Editor do Supabase:');
    console.log('\n1. Acesse: https://supabase.com/dashboard/project/..../editor');
    console.log('2. Cole e execute este SQL:\n');
    console.log(SQL_FIX);
  } else {
    console.log('✅ Função debit_credits atualizada com sucesso!');
  }
})();
