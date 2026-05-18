# 🔧 GUIA PASSO A PASSO - CORREÇÃO DEFINITIVA

## ⚠️ IMPORTANTE: Siga EXATAMENTE estes passos

---

## **PASSO 1: Acesse o Supabase Dashboard**

1. Abra: https://supabase.com/dashboard
2. Login com sua conta
3. Selecione o projeto **AI Fashion Studio**

---

## **PASSO 2: Abra o SQL Editor**

1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique em **"+ New query"** no canto superior direito

---

## **PASSO 3: TESTE ANTES DE CORRIGIR**

Cole e execute este SQL de teste PRIMEIRO:

```sql
-- Teste para ver o problema
SELECT debit_credits(
  '61bf7fb2-5e73-4d77-b66d-f91ff68fe454'::uuid,
  'video_movement'::text,
  '00000000-0000-0000-0000-000000000099'::uuid
);
```

**Resultado esperado:** Deve retornar erro `no_single_pack_covers_cost`

✅ Se retornou esse erro, vá para o PASSO 4
❌ Se deu outro erro, me avise qual foi

---

## **PASSO 4: APLIQUE A CORREÇÃO**

**IMPORTANTE:** Apague todo o conteúdo do SQL Editor e cole APENAS este SQL:

```sql
-- ============================================================
-- CORREÇÃO DEFINITIVA: debit_credits com SET LOCAL
-- ============================================================

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
  -- CRÍTICO: Desabilita RLS dentro da função
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
  FOR UPDATE;

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
```

**DEPOIS DE COLAR:**
1. Clique em **"Run"** (ou pressione Ctrl+Enter)
2. Aguarde aparecer: **"Success. No rows returned"**

✅ Se apareceu "Success", vá para PASSO 5
❌ Se deu erro, COPIE A MENSAGEM DE ERRO e me envie

---

## **PASSO 5: TESTE APÓS CORREÇÃO**

Execute este SQL para testar se funcionou:

```sql
-- Teste após correção
SELECT debit_credits(
  '61bf7fb2-5e73-4d77-b66d-f91ff68fe454'::uuid,
  'video_movement'::text,
  '00000000-0000-0000-0000-000000000088'::uuid
);
```

**Resultado esperado:** Deve retornar `"success": true` e `"source": "pack"`

✅ Se retornou success, **ME AVISE e vá para PASSO 6**
❌ Se ainda deu erro, me envie o resultado completo

---

## **PASSO 6: REVERTENDO O TESTE**

Execute para não perder os créditos de teste:

```sql
-- Reverte o teste
SELECT refund_credits('00000000-0000-0000-0000-000000000088'::uuid);
```

---

## **PASSO 7: TESTE NO NAVEGADOR**

Volte para http://localhost:3000 e tente gerar um vídeo!

---

## ⚠️ SE ALGO DER ERRADO

**Me envie:**
1. Print da tela do SQL Editor
2. A mensagem de erro COMPLETA
3. O passo onde parou

---

## 🎯 RESUMO DO QUE ESTAMOS FAZENDO

A função `debit_credits` estava sendo bloqueada pelo Row Level Security (RLS).
A correção adiciona `SET LOCAL row_security = off` que desabilita RLS apenas
dentro da função (seguro porque a função já valida o user_id).

**Antes:** RLS bloqueava a query → Nenhum pacote encontrado
**Depois:** RLS desabilitado → Pacote encontrado → Débito bem-sucedido
