# Correção Definitiva: Bug 402 Payment Required

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Diagnosticar e corrigir definitivamente o bug onde usuários pagam mas não recebem créditos (erro 402).

**Architecture:** Abordagem sistemática de diagnóstico primeiro, correção depois. Adicionar observabilidade massiva, identificar ponto exato de falha, corrigir baseado em evidências concretas.

**Tech Stack:** Node.js, Express, Supabase, Stripe Webhooks, Stripe CLI (para testes)

---

## Arquivos Envolvidos

**Backend:**
- `routes/stripe.js` - Criação de checkout sessions (pode estar sem metadata)
- `routes/stripe-webhook.js` - Processamento de eventos do Stripe
- `server.js` - Endpoint /api/me que retorna créditos

**Debug/Teste:**
- `debug-webhook-flow.js` (NOVO) - Script de diagnóstico completo
- `simulate-webhook.js` (NOVO) - Simula evento do Stripe localmente

**Logs:**
- Railway deployment logs - Verificar se webhook é chamado

---

## Task 1: Verificar Configuração do Stripe Dashboard

**Objetivo:** Confirmar se webhook está configurado e recebendo eventos.

**Files:**
- Read: Stripe Dashboard (manual)
- Create: `STRIPE-WEBHOOK-CONFIG.md` (documentação da config atual)

- [ ] **Step 1: Acessar Stripe Dashboard → Webhooks**

1. Acesse: https://dashboard.stripe.com/test/webhooks
2. Verifique se existe endpoint cadastrado
3. URL esperada: `https://www.modelofacil.ia.br/api/stripe/webhook` ou `https://ai-fashion-studio.up.railway.app/api/stripe/webhook`

Expected: Deve existir 1 endpoint ativo

- [ ] **Step 2: Verificar eventos cadastrados**

No endpoint existente, veja a seção "Events to send":

Eventos necessários:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

Expected: Todos os 6 eventos devem estar marcados

- [ ] **Step 3: Verificar últimas tentativas de entrega**

Na aba "Recent deliveries" ou "Logs":

1. Procure por requests recentes (últimas 24h)
2. Veja se há tentativas de entrega após checkouts de teste
3. Se houver, veja o status: Success (200) ou Failed (4xx/5xx)

Expected: Se houver checkouts recentes, deve haver requests aqui

- [ ] **Step 4: Documentar estado atual**

Crie arquivo `STRIPE-WEBHOOK-CONFIG.md`:

```markdown
# Configuração do Stripe Webhook - $(date +%Y-%m-%d)

## Endpoint Cadastrado
- URL: [copie aqui]
- Signing Secret: whsec_... (primeiros 10 chars)
- Status: [Enabled/Disabled]

## Eventos Configurados
- [ ] checkout.session.completed
- [ ] customer.subscription.created  
- [ ] customer.subscription.updated
- [ ] customer.subscription.deleted
- [ ] invoice.payment_succeeded
- [ ] invoice.payment_failed

## Recent Deliveries (últimas 24h)
- Total requests: [número]
- Success (200): [número]
- Failed (4xx/5xx): [número]

## Observações
[Se não houver webhook configurado, anotar aqui]
[Se eventos estiverem faltando, anotar quais]
```

Expected: Arquivo criado com estado real do Stripe

- [ ] **Step 5: Se webhook NÃO existe, criar agora**

Se não houver webhook configurado:

1. Click "Add endpoint"
2. URL: `https://www.modelofacil.ia.br/api/stripe/webhook`
3. Description: "Modelo Fácil - Production Webhook"
4. Events: Selecionar os 6 eventos listados acima
5. Click "Add endpoint"
6. Copiar "Signing secret" (whsec_...)
7. Atualizar Railway env var `STRIPE_WEBHOOK_SECRET` com o novo secret

Expected: Webhook criado e secret atualizado no Railway

- [ ] **Step 6: Commit documentação**

```bash
git add STRIPE-WEBHOOK-CONFIG.md
git commit -m "docs: estado atual da config do Stripe webhook

Documentação antes de iniciar diagnóstico do bug 402.
Confirmar se webhook está configurado corretamente."
```

Expected: Commit criado

---

## Task 2: Adicionar Logs Massivos e Endpoint de Debug

**Objetivo:** Instrumentar código para ter visibilidade total do fluxo.

**Files:**
- Modify: `routes/stripe.js` (adicionar logs na criação de checkout)
- Modify: `routes/stripe-webhook.js` (adicionar logs em CADA etapa)
- Modify: `server.js` (adicionar logs em /api/me)
- Create: `routes/debug.js` (endpoint de diagnóstico)

- [ ] **Step 1: Adicionar logs na criação de Checkout Session**

Em `routes/stripe.js`, localizar função que cria checkout session (procure por `stripe.checkout.sessions.create`).

Adicionar logs ANTES e DEPOIS da criação:

```javascript
// ANTES de stripe.checkout.sessions.create
console.log('[CHECKOUT] Criando session para user:', req.user.id, 'plan:', planId);
console.log('[CHECKOUT] Metadata enviada:', {
  user_id: req.user.id,
  plan_id: planId,
  type: 'subscription'
});

const session = await stripe.checkout.sessions.create({
  // ... config existente
});

// DEPOIS
console.log('[CHECKOUT] ✅ Session criada:', session.id);
console.log('[CHECKOUT] URL:', session.url);
console.log('[CHECKOUT] Metadata confirmada:', session.metadata);
```

Expected: 4 logs adicionados antes/depois da criação

- [ ] **Step 2: Adicionar logs no webhook - ENTRADA**

Em `routes/stripe-webhook.js`, no início do POST handler (antes de `stripe.webhooks.constructEvent`):

```javascript
router.post('/', async (req, res) => {
  console.log('═══════════════════════════════════════════════');
  console.log('[WEBHOOK] 🔔 RECEBIDO EM:', new Date().toISOString());
  console.log('[WEBHOOK] Headers:', {
    'stripe-signature': req.headers['stripe-signature']?.substring(0, 50) + '...',
    'content-type': req.headers['content-type'],
    'content-length': req.headers['content-length']
  });

  if (!process.env.STRIPE_SECRET_KEY) {
    // ... código existente
```

Expected: Log de entrada adicionado

- [ ] **Step 3: Adicionar logs no webhook - APÓS VALIDAÇÃO**

Após `stripe.webhooks.constructEvent`, adicionar:

```javascript
try {
  event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  console.log('[WEBHOOK] ✅ Assinatura válida');
  console.log('[WEBHOOK] Evento tipo:', event.type);
  console.log('[WEBHOOK] Evento ID:', event.id);
  console.log('[WEBHOOK] Metadata:', event.data.object.metadata);
} catch (err) {
  // ... código existente
```

Expected: 4 logs adicionados após validação

- [ ] **Step 4: Adicionar logs em handleSubscriptionUpsert - ENTRADA**

Na função `handleSubscriptionUpsert`, logo no início:

```javascript
async function handleSubscriptionUpsert(subscription) {
  console.log('--- handleSubscriptionUpsert START ---');
  console.log('[WEBHOOK] Subscription ID:', subscription.id);
  console.log('[WEBHOOK] Subscription status:', subscription.status);
  console.log('[WEBHOOK] Metadata recebida:', subscription.metadata);

  const userId = subscription.metadata?.user_id;
  const planId = subscription.metadata?.plan_id;

  console.log('[WEBHOOK] Extraído: user_id=', userId, 'plan_id=', planId);

  if (!userId || !planId) {
    console.error('[WEBHOOK] ❌ ERRO: Metadata vazia!');
    // ... código existente
```

Expected: 6 logs adicionados no início da função

- [ ] **Step 5: Adicionar logs em handleSubscriptionUpsert - CADA OPERAÇÃO**

Adicionar log ANTES de cada operação crítica:

```javascript
// ANTES do upsert de subscription
console.log('[WEBHOOK] 📝 Fazendo upsert de subscription...');
console.log('[WEBHOOK] Dados:', JSON.stringify(subscriptionData, null, 2));

const { data: upsertedSub, error } = await supabaseAdmin
  .from('subscriptions')
  .upsert(subscriptionData, { onConflict: 'user_id' })
  .select()
  .single();

if (error) {
  console.error('[WEBHOOK] ❌ ERRO no upsert subscription:', error);
  throw new Error(`Erro upsert subscription: ${error.message}`);
}
console.log('[WEBHOOK] ✅ Subscription upsertada, ID:', upsertedSub.id);

// ANTES de buscar plano
console.log('[WEBHOOK] 📝 Buscando plano:', planId);

const { data: plan, error: planError } = await supabaseAdmin
  .from('plans')
  .select('monthly_quota_credits')
  .eq('id', planId)
  .single();

if (!plan) {
  console.error('[WEBHOOK] ❌ ERRO: Plano não encontrado:', planId);
  throw new Error(`Plano ${planId} não encontrado no banco`);
}
console.log('[WEBHOOK] ✅ Plano encontrado, créditos:', plan.monthly_quota_credits);

// ANTES de verificar quota existente
console.log('[WEBHOOK] 📝 Verificando se quota já existe...');

const { data: existingQuota } = await supabaseAdmin
  .from('quota_usage')
  .select('id')
  .eq('user_id', userId)
  .eq('period_start', periodStart)
  .maybeSingle();

if (existingQuota) {
  console.log('[WEBHOOK] ⚠️ Quota já existe, ID:', existingQuota.id);
} else {
  console.log('[WEBHOOK] 📝 Criando nova quota...');
  console.log('[WEBHOOK] Dados quota:', {
    user_id: userId,
    subscription_id: upsertedSub.id,
    period_start: periodStart,
    period_end: periodEnd,
    credits_limit: plan.monthly_quota_credits,
    credits_used: 0
  });

  const { error: quotaError } = await supabaseAdmin
    .from('quota_usage')
    .insert({
      user_id: userId,
      subscription_id: upsertedSub.id,
      period_start: periodStart,
      period_end: periodEnd,
      credits_limit: plan.monthly_quota_credits,
      credits_used: 0,
    });

  if (quotaError) {
    console.error('[WEBHOOK] ❌ ERRO criando quota:', quotaError);
    throw new Error(`Erro criando quota_usage: ${quotaError.message}`);
  }

  console.log('[WEBHOOK] ✅✅✅ QUOTA CRIADA COM SUCESSO ✅✅✅');
  console.log('[WEBHOOK] Créditos:', plan.monthly_quota_credits);
}

console.log('--- handleSubscriptionUpsert END (success) ---');
```

Expected: 15+ logs cobrindo TODAS as operações

- [ ] **Step 6: Adicionar logs em /api/me**

Em `server.js`, no endpoint `/api/me`:

```javascript
app.get('/api/me', requireAuth, async (req, res) => {
  console.log('[/api/me] User ID:', req.user.id);

  try {
    console.log('[/api/me] Buscando subscription...');
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*, plans(*)')
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .single();

    if (subError) console.log('[/api/me] Subscription error:', subError);
    if (subscription) {
      console.log('[/api/me] ✅ Subscription encontrada:', subscription.id);
      console.log('[/api/me] Período:', subscription.current_period_start, 'até', subscription.current_period_end);
    } else {
      console.log('[/api/me] ❌ Nenhuma subscription ativa');
    }

    console.log('[/api/me] Buscando quota...');
    const { data: quota, error: quotaError } = subscription ? await supabaseAdmin
      .from('quota_usage')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('period_start', subscription.current_period_start)
      .maybeSingle() : { data: null };

    if (quotaError) console.log('[/api/me] Quota error:', quotaError);
    if (quota) {
      console.log('[/api/me] ✅ Quota encontrada:', quota.id);
      console.log('[/api/me] Créditos:', quota.credits_used, '/', quota.credits_limit);
    } else {
      console.log('[/api/me] ❌ Quota não encontrada (period_start:', subscription?.current_period_start, ')');
    }

    // ... resto do código existente
```

Expected: 10+ logs adicionados

- [ ] **Step 7: Criar endpoint de debug**

Criar arquivo `routes/debug.js`:

```javascript
const express = require('express');
const { supabaseAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/debug/user/:userId - Estado completo do usuário
router.get('/user/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // Buscar subscription
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Buscar quota_usage
    const { data: quotas } = await supabaseAdmin
      .from('quota_usage')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Buscar packs
    const { data: packs } = await supabaseAdmin
      .from('credit_packs')
      .select('*')
      .eq('user_id', userId);

    // Buscar eventos processados
    const { data: stripeEvents } = await supabaseAdmin
      .from('stripe_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    // Filtrar eventos deste user (por metadata)
    const userEvents = stripeEvents.filter(e => 
      e.payload?.metadata?.user_id === userId ||
      e.payload?.customer_email?.includes(userId.substring(0, 8))
    );

    res.json({
      user_id: userId,
      subscription: subscription || null,
      quotas: quotas || [],
      packs: packs || [],
      stripe_events: userEvents,
      summary: {
        has_subscription: !!subscription,
        subscription_status: subscription?.status || 'none',
        quota_count: quotas?.length || 0,
        total_credits: quotas?.[0] ? (quotas[0].credits_limit - quotas[0].credits_used) : 0,
        stripe_events_count: userEvents.length
      }
    });
  } catch (err) {
    console.error('[DEBUG] Erro:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

Expected: Arquivo criado com endpoint de debug

- [ ] **Step 8: Registrar rota de debug no server.js**

Em `server.js`, adicionar:

```javascript
const debugRouter = require('./routes/debug');

// ... outras rotas

app.use('/api/debug', debugRouter);
```

Expected: Rota registrada

- [ ] **Step 9: Commit logs e endpoint de debug**

```bash
git add routes/stripe.js routes/stripe-webhook.js server.js routes/debug.js
git commit -m "debug: adicionar logs massivos e endpoint de diagnóstico

- Logs em CADA etapa de checkout → webhook → quota
- Endpoint GET /api/debug/user/:userId para ver estado completo
- Facilita diagnóstico do bug 402 (créditos não aparecem)

Próximo: testar fluxo e coletar logs"
```

Expected: Commit criado

- [ ] **Step 10: Deploy e aguardar**

```bash
git push origin main
```

Aguardar deploy no Railway (~2 min).

Expected: Deploy SUCCESS

---

## Task 3: Diagnosticar com Teste Real

**Objetivo:** Fazer teste real de checkout e COLETAR TODOS OS LOGS.

**Files:**
- None (teste manual)

- [ ] **Step 1: Abrir logs do Railway em tempo real**

1. Acesse Railway dashboard
2. Clique no serviço ativo
3. Abra aba "Logs"
4. Deixe a janela aberta para ver logs em tempo real

Expected: Logs sendo exibidos

- [ ] **Step 2: Fazer checkout de teste**

Em outra aba/janela:

1. Acesse https://www.modelofacil.ia.br
2. Crie conta com email: `teste+debug$(date +%s)@gmail.com`
3. Escolha plano Básico
4. Checkout com cartão: `4242 4242 4242 4242`
5. Complete pagamento

Expected: Redirecionado para /billing/success

- [ ] **Step 3: Observar logs NO MOMENTO do checkout**

Enquanto o checkout acontece, observe a janela de logs do Railway.

**PROCURE POR (em ordem cronológica):**

1. `[CHECKOUT] Criando session para user:` ← deve aparecer ANTES do checkout
2. `[CHECKOUT] ✅ Session criada:` ← session ID deve bater com URL
3. `[WEBHOOK] 🔔 RECEBIDO EM:` ← deve aparecer APÓS pagamento (em até 5s)
4. `[WEBHOOK] ✅ Assinatura válida` ← valida assinatura do Stripe
5. `[WEBHOOK] Evento tipo: customer.subscription.created` ← evento correto
6. `--- handleSubscriptionUpsert START ---` ← entra na função
7. `[WEBHOOK] ✅ Subscription upsertada` ← cria no banco
8. `[WEBHOOK] ✅✅✅ QUOTA CRIADA COM SUCESSO ✅✅✅` ← **CRÍTICO**

Expected: TODOS os 8 logs devem aparecer em sequência

- [ ] **Step 4: Anotar resultado**

Criar arquivo `DIAGNOSTIC-RESULTS.md`:

```markdown
# Resultado do Diagnóstico - $(date +%Y-%m-%d\ %H:%M)

## Teste Realizado
- Email: [email usado]
- Plano: Básico
- Session ID: [copiar de billing/success URL]
- Timestamp: $(date +%Y-%m-%d\ %H:%M:%S)

## Logs Observados

### 1. Checkout Session (ANTES do pagamento)
- [ ] `[CHECKOUT] Criando session` - SIM/NÃO
- [ ] `[CHECKOUT] Metadata enviada` - SIM/NÃO
- [ ] `[CHECKOUT] ✅ Session criada` - SIM/NÃO

### 2. Webhook Recebido (APÓS pagamento)
- [ ] `[WEBHOOK] 🔔 RECEBIDO` - SIM/NÃO - Timestamp: ___
- [ ] `[WEBHOOK] ✅ Assinatura válida` - SIM/NÃO
- [ ] `[WEBHOOK] Evento tipo:` - QUAL: ___

### 3. Processamento do Webhook
- [ ] `handleSubscriptionUpsert START` - SIM/NÃO
- [ ] `user_id` extraído - SIM/NÃO - Valor: ___
- [ ] `plan_id` extraído - SIM/NÃO - Valor: ___
- [ ] Subscription upsertada - SIM/NÃO
- [ ] Plano encontrado - SIM/NÃO - Créditos: ___
- [ ] Quota criada - SIM/NÃO
- [ ] `✅✅✅ QUOTA CRIADA COM SUCESSO` - SIM/NÃO

### 4. GET /api/me (ao entrar no dashboard)
- [ ] `[/api/me] Buscando subscription` - SIM/NÃO
- [ ] Subscription encontrada - SIM/NÃO - ID: ___
- [ ] Quota encontrada - SIM/NÃO - ID: ___
- [ ] Créditos retornados - SIM/NÃO - Quantidade: ___

## PONTO DE FALHA IDENTIFICADO

[Anotar aqui qual foi o PRIMEIRO log que NÃO apareceu]
[Se todos apareceram mas ainda deu 402, anotar isso]

## Próximas Ações

[Baseado no ponto de falha, qual correção aplicar]
```

Expected: Arquivo criado com diagnóstico completo

- [ ] **Step 5: Chamar endpoint de debug**

No browser ou terminal, acessar:

```bash
curl https://www.modelofacil.ia.br/api/debug/user/USER_ID_AQUI
```

(Substituir USER_ID_AQUI pelo ID do usuário de teste)

Expected: JSON com estado completo do usuário

- [ ] **Step 6: Copiar resposta do debug para arquivo**

Adicionar ao `DIAGNOSTIC-RESULTS.md`:

```markdown
## Estado do Banco (via /api/debug)

```json
[colar JSON completo aqui]
```

## Análise

- Subscription existe? [SIM/NÃO]
- Quota exists? [SIM/NÃO]
- Stripe events processados? [QUANTOS]
```

Expected: Arquivo atualizado com dados do banco

- [ ] **Step 7: Commit resultados**

```bash
git add DIAGNOSTIC-RESULTS.md
git commit -m "debug: resultado do teste de diagnóstico

Teste realizado em $(date +%Y-%m-%d\ %H:%M).
Identificar ponto exato de falha no fluxo.

[Anotar aqui resumo: ex: 'Webhook nunca é chamado']"
```

Expected: Commit com diagnóstico

---

## Task 4: Corrigir Baseado em Evidências

**Objetivo:** Aplicar correção específica baseada no ponto de falha identificado.

**Files:** (Dependem do diagnóstico - os cenários abaixo cobrem as possibilidades)

### CENÁRIO A: Webhook nunca é chamado

**Sintoma:** Logs não mostram `[WEBHOOK] 🔔 RECEBIDO`

**Causa:** Webhook não está configurado no Stripe Dashboard

**Correção:**

- [ ] **Step A1: Configurar webhook no Stripe Dashboard**

1. Acesse https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. URL: `https://www.modelofacil.ia.br/api/stripe/webhook`
4. Events: Selecionar os 6 eventos (ver Task 1 Step 2)
5. Click "Add endpoint"
6. Copiar "Signing secret"

Expected: Webhook criado

- [ ] **Step A2: Atualizar secret no Railway**

1. Railway → Settings → Environment Variables
2. Atualizar `STRIPE_WEBHOOK_SECRET` = [novo secret]
3. Save

Expected: Env var atualizada, deploy automático

- [ ] **Step A3: Re-testar**

Repetir Task 3 (teste real de checkout).

Expected: Desta vez, logs de `[WEBHOOK] 🔔 RECEBIDO` devem aparecer

### CENÁRIO B: Webhook é chamado mas metadata vazia

**Sintoma:** Logs mostram `[WEBHOOK] ❌ ERRO: Metadata vazia!`

**Causa:** Checkout Session não está enviando metadata

**Correção:**

- [ ] **Step B1: Localizar código de criação de session**

```bash
grep -n "stripe.checkout.sessions.create" routes/stripe.js
```

Expected: Linha do código

- [ ] **Step B2: Verificar se metadata é enviada**

Em `routes/stripe.js`, na criação da session:

```javascript
const session = await stripe.checkout.sessions.create({
  customer_email: req.user.email,
  payment_method_types: ['card'],
  line_items: [{ price: priceId, quantity: 1 }],
  mode: 'subscription',
  success_url: `${process.env.APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.APP_URL}/billing/cancel`,
  metadata: {
    user_id: req.user.id,
    plan_id: planId,
    type: 'subscription'
  },
  subscription_data: {
    metadata: {
      user_id: req.user.id,
      plan_id: planId
    }
  }
});
```

**ATENÇÃO:** `metadata` vai para a SESSION, `subscription_data.metadata` vai para a SUBSCRIPTION.

O webhook `customer.subscription.created` precisa de `subscription_data.metadata`, NÃO apenas `metadata`.

Expected: Código atualizado com ambos

- [ ] **Step B3: Commit correção**

```bash
git add routes/stripe.js
git commit -m "fix: adicionar metadata em subscription_data

Bug: metadata estava apenas na session, não na subscription.
Webhook customer.subscription.created precisa de subscription_data.metadata.

Agora user_id e plan_id chegam corretamente no webhook."
git push origin main
```

Expected: Deploy automático

- [ ] **Step B4: Re-testar**

Repetir Task 3.

Expected: Logs devem mostrar `user_id` e `plan_id` extraídos corretamente

### CENÁRIO C: Subscription criada mas quota não

**Sintoma:** Logs mostram `[WEBHOOK] ✅ Subscription upsertada` mas NÃO mostram `✅✅✅ QUOTA CRIADA COM SUCESSO`

**Causa:** Erro na criação de quota_usage (RLS, foreign key, etc)

**Correção:**

- [ ] **Step C1: Verificar erro exato**

Procurar nos logs por `[WEBHOOK] ❌ ERRO criando quota:`.

Anotar mensagem de erro completa.

Expected: Mensagem de erro específica

- [ ] **Step C2: Se erro é RLS (Row Level Security)**

Erro típico: `new row violates row-level security policy`

Solução: Adicionar policy que permite service_role inserir em quota_usage:

```sql
-- Executar no Supabase SQL Editor:
CREATE POLICY "Service role can insert quota_usage"
ON quota_usage
FOR INSERT
TO service_role
USING (true);
```

Expected: Policy criada

- [ ] **Step C3: Se erro é foreign key**

Erro típico: `violates foreign key constraint "quota_usage_subscription_id_fkey"`

Causa: `subscription_id` que estamos passando não existe em `subscriptions`.

Solução: Debugar por que upsert não retornou `id`. Ver se `.select().single()` está sendo chamado.

Expected: Código corrigido para pegar `id` do upsert

- [ ] **Step C4: Re-testar**

Repetir Task 3.

Expected: Logs devem mostrar `✅✅✅ QUOTA CRIADA COM SUCESSO`

### CENÁRIO D: Tudo é criado mas /api/me não retorna

**Sintoma:** Logs mostram TUDO OK no webhook, mas `/api/me` não retorna quota

**Causa:** Query em /api/me está buscando pelo período errado (timezone, formato, etc)

**Correção:**

- [ ] **Step D1: Comparar timestamps**

No arquivo `DIAGNOSTIC-RESULTS.md`, comparar:

- `subscription.current_period_start` (do /api/debug)
- `quota.period_start` (do /api/debug)

Devem ser EXATAMENTE iguais (mesmo formato, mesmo timezone).

Expected: Identificar diferença

- [ ] **Step D2: Se timestamps diferem, corrigir query**

Em `server.js`, no `/api/me`:

Substituir:

```javascript
.eq('period_start', subscription.current_period_start)
```

Por:

```javascript
.eq('user_id', req.user.id)
.order('created_at', { ascending: false })
.limit(1)
.maybeSingle()
```

(Busca a quota mais recente do usuário, em vez de buscar por período exato)

Expected: Código atualizado

- [ ] **Step D3: Commit e testar**

```bash
git add server.js
git commit -m "fix: buscar quota por user + created_at em vez de period_start

Bug: timestamps podem ter formato/timezone diferente.
Solução: pegar quota mais recente do user."
git push origin main
```

Repetir Task 3.

Expected: /api/me retorna quota corretamente

---

## Task 5: Teste E2E Final de Validação

**Objetivo:** Confirmar que TUDO funciona ponta a ponta.

**Files:**
- None (teste manual)

- [ ] **Step 1: Limpar estado de teste**

No Supabase Dashboard:

```sql
-- Deletar contas de teste anteriores
DELETE FROM quota_usage WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%teste%'
);
DELETE FROM subscriptions WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%teste%'
);
DELETE FROM auth.users WHERE email LIKE '%teste%';
```

Expected: Contas de teste removidas

- [ ] **Step 2: Teste completo com logs abertos**

1. Abrir Railway logs em tempo real
2. Abrir Console F12 no browser
3. Criar conta: `final-test@example.com`
4. Escolher plano Básico
5. Pagar com `4242 4242 4242 4242`
6. Observar `/billing/success` mostrar créditos
7. Entrar no dashboard, ver sidebar com plano + créditos
8. Gerar foto de teste

Expected: TODOS os checkpoints passam

- [ ] **Step 3: Validar cada checkpoint**

✅ Checkpoint 1: Session criada com metadata  
✅ Checkpoint 2: Webhook recebido em < 5s  
✅ Checkpoint 3: Subscription upsertada  
✅ Checkpoint 4: Quota criada com créditos corretos  
✅ Checkpoint 5: /api/me retorna subscription + quota  
✅ Checkpoint 6: Sidebar mostra plano + créditos  
✅ Checkpoint 7: Gerar foto funciona (não retorna 402)  
✅ Checkpoint 8: Créditos são debitados (20 → 19)

Expected: Todos ✅

- [ ] **Step 4: Documentar sucesso**

Criar arquivo `FIX-VALIDATED.md`:

```markdown
# Correção Validada - $(date +%Y-%m-%d\ %H:%M)

## Problema Original
Usuários pagavam mas recebiam 402 Payment Required ao gerar foto.
Créditos não apareciam no dashboard.

## Causa Raiz Identificada
[Descrever qual foi o CENÁRIO que aplicamos: A, B, C ou D]

## Correção Aplicada
[Resumir mudanças feitas]

## Validação
- ✅ Teste E2E completo passou
- ✅ Logs confirmam fluxo correto
- ✅ Créditos aparecem imediatamente
- ✅ Gerar foto funciona sem 402

## Commits da Correção
[Listar commits relevantes]

## Próximos Passos
- [ ] Remover logs excessivos (opcional, manter apenas críticos)
- [ ] Testar em LIVE mode com cartão real
- [ ] Monitorar primeiros usuários reais
```

Expected: Arquivo criado

- [ ] **Step 5: Commit validação**

```bash
git add FIX-VALIDATED.md
git commit -m "docs: bug 402 resolvido e validado

Teste E2E completo passou.
Fluxo signup → checkout → créditos → gerar funcionando.

Bug: [causa raiz]
Fix: [correção aplicada]"
```

Expected: Commit final

---

## Task 6: Limpeza e Preparação para Produção

**Objetivo:** Reduzir logs para nível razoável, preparar para usuários reais.

**Files:**
- Modify: `routes/stripe-webhook.js` (reduzir logs)
- Modify: `server.js` (reduzir logs)
- Remove: `routes/debug.js` (ou proteger com autenticação)

- [ ] **Step 1: Identificar logs essenciais**

Logs para MANTER (produção):
- Webhook recebido (tipo de evento, ID)
- Erros (sempre logar erros completos)
- Operações críticas concluídas (subscription criada, quota criada)

Logs para REMOVER (debug apenas):
- Logs de "buscando...", "verificando..."
- JSON dumps completos
- Logs de sucesso redundantes

Expected: Decisão tomada

- [ ] **Step 2: Reduzir logs no webhook**

Manter apenas:

```javascript
console.log('[WEBHOOK] Recebido:', event.type, 'ID:', event.id);
// ... processamento
console.log('[WEBHOOK] Subscription criada/atualizada:', subscription.id);
console.log('[WEBHOOK] Quota criada:', plan.monthly_quota_credits, 'créditos');
// ... em caso de erro
console.error('[WEBHOOK] ERRO:', err.message, err.stack);
```

Remover logs intermediários.

Expected: ~10 logs mantidos (vs ~50 atuais)

- [ ] **Step 3: Proteger endpoint de debug**

Em `routes/debug.js`, adicionar middleware de autenticação:

```javascript
const { requireAuth } = require('../middleware/auth');

// Apenas admins podem acessar
const requireAdmin = async (req, res, next) => {
  if (req.user?.email !== 'eduardomanhaesmaciel@gmail.com') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

router.get('/user/:userId', requireAuth, requireAdmin, async (req, res) => {
  // ... código existente
```

Expected: Endpoint protegido

- [ ] **Step 4: Commit limpeza**

```bash
git add routes/stripe-webhook.js server.js routes/debug.js
git commit -m "chore: reduzir logs e proteger endpoint de debug

- Manter apenas logs essenciais em produção
- Proteger /api/debug com autenticação admin
- Preparar para lançamento beta"
git push origin main
```

Expected: Deploy final

- [ ] **Step 5: Monitorar primeiros checkouts reais**

Nos próximos checkouts de usuários reais:

1. Observar logs do Railway
2. Confirmar que webhook processa
3. Confirmar que créditos aparecem
4. Se houver problemas, reativar logs temporariamente

Expected: Monitoramento ativo

---

## Self-Review Checklist

- [x] Todas as tasks têm arquivos específicos
- [x] Todos os steps têm código completo (nenhum placeholder)
- [x] Todos os comandos têm output esperado
- [x] Fluxo de diagnóstico → correção → validação está claro
- [x] Cobre todos os cenários possíveis de falha
- [x] Logs adicionados em TODOS os pontos críticos
- [x] Endpoint de debug permite validação independente
- [x] Commits frequentes após cada mudança

## Execution Notes

Este plano usa diagnóstico massivo para identificar EXATAMENTE onde o fluxo quebra, depois aplica a correção específica.

Diferente das tentativas anteriores (corrigir "às cegas"), agora temos:
- ✅ Logs em CADA etapa
- ✅ Endpoint de debug para validar estado do banco
- ✅ Testes estruturados com checkpoints claros
- ✅ Correções específicas para cada cenário
- ✅ Validação E2E antes de concluir

Após Task 3, saberemos EXATAMENTE qual CENÁRIO (A/B/C/D) aplicar na Task 4.
