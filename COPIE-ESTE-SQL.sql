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
  SET LOCAL row_security = off;

  SELECT credits_cost INTO v_cost
  FROM generation_costs
  WHERE generation_type = p_generation_type;

  IF v_cost IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_generation_type');
  END IF;

  SELECT * INTO v_subscription
  FROM subscriptions
  WHERE user_id = p_user_id AND status = 'active'
  FOR UPDATE; -- lock pessimista pra evitar race

  IF v_subscription IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'no_active_subscription');
  END IF;

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

CREATE OR REPLACE FUNCTION refund_credits(p_job_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job RECORD;
  v_subscription RECORD;
BEGIN
  SET LOCAL row_security = off;

  SELECT * INTO v_job
  FROM generation_jobs
  WHERE id = p_job_id
  FOR UPDATE;

  IF v_job IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'job_not_found');
  END IF;

  IF v_job.status = 'refunded' THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_refunded');
  END IF;

  IF v_job.credit_source = 'quota' THEN
    SELECT * INTO v_subscription FROM subscriptions WHERE user_id = v_job.user_id AND status = 'active';

    UPDATE quota_usage
    SET credits_used = GREATEST(0, credits_used - v_job.credits_cost)
    WHERE user_id = v_job.user_id
      AND period_start = v_subscription.current_period_start;

  ELSIF v_job.credit_source = 'pack' AND v_job.credit_source_id IS NOT NULL THEN
    UPDATE credit_packs
    SET credits_remaining = credits_remaining + v_job.credits_cost
    WHERE id = v_job.credit_source_id;
  END IF;

  UPDATE generation_jobs
  SET status = 'refunded', completed_at = NOW()
  WHERE id = p_job_id;

  RETURN jsonb_build_object('success', true, 'credits_refunded', v_job.credits_cost);
END;
$$;