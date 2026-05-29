# 🔧 Troubleshooting - Modelo Fácil

## ⚠️ Problemas Conhecidos e Soluções

### 1. Usuário paga mas não recebe créditos (Erro 402)

**Sintomas:**
- Checkout completa com sucesso
- Usuário é redirecionado para /billing/success
- Dashboard mostra "--" em créditos
- Gerar foto retorna 402 Payment Required

**Causas Comuns:**

#### A) Webhook não configurado no Stripe Dashboard
**Verificar:**
```
https://dashboard.stripe.com/test/webhooks
```
**Deve ter:**
- URL: `https://www.modelofacil.ia.br/api/stripe/webhook`
- Status: Enabled
- Eventos: 
  * `checkout.session.completed`
  * `customer.subscription.created`
  * `customer.subscription.updated`
  * `customer.subscription.deleted`
  * `invoice.payment_succeeded`
  * `invoice.payment_failed`

**Solução:**
1. Criar endpoint se não existir
2. Copiar "Signing secret" (whsec_...)
3. Atualizar Railway env: `STRIPE_WEBHOOK_SECRET`

---

#### B) IDs dos planos desincronizados

**IDs CORRETOS no banco (`plans` table):**
```
starter    → Básico     (20 créditos, R$ 35)
pro        → Iniciante  (50 créditos, R$ 79)
enterprise → Pró        (120 créditos, R$ 159)
```

**Verificar consistência:**

1. **Backend** (`routes/stripe.js` linha 61-67):
```javascript
const priceMap = {
  starter: process.env.STRIPE_PRICE_BASICO,
  pro: process.env.STRIPE_PRICE_STARTER,
  enterprise: process.env.STRIPE_PRICE_PRO,
};
```

2. **Frontend** (`public/planos.html`):
```html
<!-- Básico (20 créditos) -->
<button onclick="selectPlan('starter')">Escolher Básico</button>

<!-- Starter (50 créditos) -->
<button onclick="selectPlan('pro')">Escolher Starter</button>

<!-- Pro (120 créditos) -->
<button onclick="selectPlan('enterprise')">Escolher Pro</button>
```

3. **Banco de dados:**
```sql
SELECT id, name, monthly_quota_credits FROM plans;
-- Deve retornar exatamente: starter, pro, enterprise
```

**⚠️ ATENÇÃO:** Google Translate pode traduzir IDs na UI do Supabase! Desative antes de verificar.

---

#### C) Webhook recebe mas não cria quota_usage

**Verificar logs do Railway:**
```
[WEBHOOK] 🔔 RECEBIDO EM: ...
[WEBHOOK] ✅ Assinatura válida
[WEBHOOK] Evento tipo: customer.subscription.created
[WEBHOOK] ✅✅✅ QUOTA CRIADA COM SUCESSO ✅✅✅  ← deve aparecer
```

**Se webhook recebe mas quota não é criada:**
1. Verificar erro específico nos logs
2. Possíveis causas:
   - RLS (Row Level Security) bloqueando insert
   - FK constraint (plan_id não existe em `plans`)
   - Timestamps inválidos

**Solução RLS:**
```sql
-- Executar no Supabase SQL Editor
CREATE POLICY "Service role can insert quota_usage"
ON quota_usage
FOR INSERT
TO service_role
USING (true);
```

---

### 2. Recovery Manual de Usuários

**Quando usar:**
- Usuário pagou mas webhook falhou antes das correções
- Dados ficaram inconsistentes

**Script SQL:**
```sql
-- 1. Identificar usuários sem quota
SELECT 
  u.email,
  u.id,
  s.plan_id,
  p.monthly_quota_credits
FROM auth.users u
JOIN subscriptions s ON s.user_id = u.id
JOIN plans p ON p.id = s.plan_id
LEFT JOIN quota_usage q ON q.user_id = u.id
WHERE q.id IS NULL
  AND s.status = 'active';

-- 2. Creditar manualmente (ajustar USER_ID)
INSERT INTO quota_usage (
  user_id,
  subscription_id,
  period_start,
  period_end,
  credits_limit,
  credits_used
) VALUES (
  'USER_ID_AQUI',
  (SELECT id FROM subscriptions WHERE user_id = 'USER_ID_AQUI' ORDER BY created_at DESC LIMIT 1),
  NOW(),
  NOW() + INTERVAL '30 days',
  20, -- ajustar conforme plano: starter=20, pro=50, enterprise=120
  0
);
```

---

### 3. Checklist Antes de Deploy

**Sempre verificar:**

- [ ] IDs dos planos no frontend batem com backend
- [ ] IDs dos planos no backend batem com banco
- [ ] Webhook configurado no Stripe Dashboard (TEST e LIVE)
- [ ] `STRIPE_WEBHOOK_SECRET` atualizado no Railway
- [ ] Env vars corretas:
  * `STRIPE_PRICE_BASICO` → price_id do plano starter
  * `STRIPE_PRICE_STARTER` → price_id do plano pro
  * `STRIPE_PRICE_PRO` → price_id do plano enterprise
- [ ] Logs massivos ativos (facilita debug)

---

### 4. Como Debugar Webhook

**Ferramentas:**

1. **Logs do Railway:**
```
https://railway.app → projeto → Deployments → Logs
Procurar por: [WEBHOOK] ou [CHECKOUT]
```

2. **Endpoint de debug:**
```
GET /api/debug/user/:userId
Retorna: subscription, quota_usage, stripe_events
```

3. **Stripe Dashboard:**
```
https://dashboard.stripe.com/test/webhooks
Ver: Recent deliveries, status codes
```

4. **Stripe CLI (local testing):**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger customer.subscription.created
```

---

### 5. Erros Comuns e Soluções Rápidas

| Erro | Causa | Solução |
|------|-------|---------|
| `invalid_plan_id` | Frontend enviando ID errado | Verificar `planos.html` linha 199, 215, 230 |
| `FK violation: plan_id` | ID não existe em `plans` | Verificar com `SELECT id FROM plans` |
| `Webhook Error: invalid signature` | `STRIPE_WEBHOOK_SECRET` errado | Copiar novo do Stripe → Railway env |
| `402 Payment Required` | Quota não existe | Recovery manual ou aguardar webhook |
| `null value violates not-null` | Timestamps null | Já corrigido com fallback, mas verificar logs |

---

## 📋 Histórico de Correções (Maio 2026)

**Commits importantes:**

1. `2bc840a` - toSafeISOString() para validar timestamps
2. `2d2c6a7` - Corrigir nome do evento (invoice.paid → invoice.payment_succeeded)
3. `66b5148` - Fallback para timestamps null
4. `8f0fac1` - Fix redirectTo com www
5. `0a5d93c` - PKCE flow para reset password
6. `f3fdedc` - Criar quota_usage no webhook (não esperar débito)
7. `2358df1` - Logs massivos + endpoint de debug
8. `ac29dc1` - Corrigir IDs dos planos no backend
9. `c67aab7` - Corrigir IDs dos planos no frontend

**Lições aprendidas:**
- Google Translate pode esconder bugs ao traduzir IDs do banco
- Sempre adicionar logs em pontos críticos
- Validar consistência entre frontend ↔ backend ↔ banco
- Webhook deve estar configurado ANTES de ir para produção

---

## 🆘 Suporte

**Se nada funcionar:**

1. Verificar logs do Railway (últimos 10 min)
2. Testar com Stripe CLI localmente
3. Verificar se banco está acessível
4. Confirmar que Railway tem todas as env vars
5. Consultar este documento para erros conhecidos

**Contatos:**
- Dev: eduardomanhaesmaciel@gmail.com
- Stripe Support: https://support.stripe.com

---

**Última atualização:** 29/05/2026  
**Status:** Sistema 100% funcional ✅
