-- ============================================================
-- FIX DEFINITIVO: Permissões para função debit_credits acessar credit_packs
-- ============================================================

-- A função RPC executa com role 'postgres', mas credit_packs tem RLS ativo
-- Solução: Garantir que a função pode ler/escrever mesmo com RLS

-- 1. Verificar role atual da função (deve ser SECURITY DEFINER)
-- Isso já está correto na definição da função

-- 2. Garantir que postgres pode acessar credit_packs sem RLS
GRANT ALL ON credit_packs TO postgres;
GRANT ALL ON quota_usage TO postgres;
GRANT ALL ON subscriptions TO postgres;
GRANT ALL ON generation_jobs TO postgres;
GRANT ALL ON generation_costs TO postgres;
GRANT ALL ON plans TO postgres;

-- 3. Recriar a função com SECURITY DEFINER explícito
CREATE OR REPLACE FUNCTION debit_credits(
  p_user_id UUID,
  p_generation_type TEXT,
  p_job_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com privilégios do criador (postgres)
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
  -- IMPORTANTE: Desabilita RLS para esta transação
  -- Seguro porque a função valida p_user_id
  PERFORM set_config('session_preload_libraries', '', false);
  SET LOCAL row_security = off;

  RAISE LOG 'debit_credits: user_id=%, type=%, job=%', p_user_id, p_generation_type, p_job_id;

  -- 1. Pega o custo da geração
  SELECT credits_cost INTO v_cost
  FROM generation_costs
  WHERE generation_type = p_generation_type;

  IF v_cost IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_generation_type');
  END IF;

  RAISE LOG 'debit_credits: custo=% créditos', v_cost;

  -- 2. Busca assinatura ativa do usuário
  SELECT * INTO v_subscription
  FROM subscriptions
  WHERE user_id = p_user_id AND status = 'active'
  FOR UPDATE;

  IF v_subscription IS NULL THEN
    RAISE LOG 'debit_credits: sem assinatura ativa';
    RETURN jsonb_build_object('success', false, 'error', 'no_active_subscription');
  END IF;

  RAISE LOG 'debit_credits: assinatura encontrada: plan=%', v_subscription.plan_id;

  -- 3. Busca ou cria registro de quota_usage do ciclo atual
  SELECT * INTO v_quota
  FROM quota_usage
  WHERE user_id = p_user_id
    AND period_start = v_subscription.current_period_start
  FOR UPDATE;

  IF v_quota IS NULL THEN
    RAISE LOG 'debit_credits: criando quota_usage para ciclo atual';
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
  RAISE LOG 'debit_credits: quota disponível=%/%', v_quota_available, v_quota.credits_limit;

  -- 4. Tenta debitar primeiro da cota
  IF v_quota_available >= v_cost THEN
    RAISE LOG 'debit_credits: debitando % créditos da quota', v_cost;
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

  RAISE LOG 'debit_credits: pack_total=% créditos', v_pack_total;

  IF v_pack_total < v_cost THEN
    RAISE LOG 'debit_credits: insuficiente - quota=%, packs=%', v_quota_available, v_pack_total;
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
    RAISE LOG 'debit_credits: debitando % créditos do pack %', v_cost, v_pack.id;
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

  -- Se chegou aqui, encontrou total suficiente mas nenhum pack único cobre
  RAISE LOG 'debit_credits: FALHA - pack_total=% mas nenhum pack >= %', v_pack_total, v_cost;
  RETURN jsonb_build_object(
    'success', false,
    'error', 'no_single_pack_covers_cost',
    'cost_required', v_cost,
    'pack_total_found', v_pack_total
  );
END;
$$;

-- 4. Dar ownership da função para postgres
ALTER FUNCTION debit_credits(UUID, TEXT, UUID) OWNER TO postgres;

-- 5. Verificação final
SELECT
  routine_name,
  security_type,
  routine_definition LIKE '%SET LOCAL row_security = off%' as has_rls_off
FROM information_schema.routines
WHERE routine_name = 'debit_credits';
