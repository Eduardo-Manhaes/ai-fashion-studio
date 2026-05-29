const express = require('express');
const { stripe } = require('../lib/stripe');
const { supabaseAdmin } = require('../middleware/auth');

const router = express.Router();

// ===================================================================
// HELPER: Converte timestamp Unix do Stripe para ISO string seguro
// Timestamps do Stripe são em segundos, new Date() espera milissegundos
// ===================================================================
function toSafeISOString(timestamp) {
  if (!timestamp) return null;
  const date = new Date(typeof timestamp === 'number' ? timestamp * 1000 : timestamp);
  return isNaN(date.getTime()) ? null : date.toISOString();
}

// ===================================================================
// POST /api/stripe/webhook
// IMPORTANTE: monta com express.raw(), não express.json()
// ===================================================================
router.post('/', async (req, res) => {
  console.log('═══════════════════════════════════════════════');
  console.log('[WEBHOOK] 🔔 RECEBIDO EM:', new Date().toISOString());
  console.log('[WEBHOOK] Headers:', {
    'stripe-signature': req.headers['stripe-signature']?.substring(0, 50) + '...',
    'content-type': req.headers['content-type'],
    'content-length': req.headers['content-length']
  });

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('[WEBHOOK] ❌ STRIPE_SECRET_KEY não configurada');
    return res.status(503).json({ error: 'stripe_not_configured', message: 'Stripe não configurado.' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log('[WEBHOOK] ✅ Assinatura válida');
    console.log('[WEBHOOK] Evento tipo:', event.type);
    console.log('[WEBHOOK] Evento ID:', event.id);
    console.log('[WEBHOOK] Metadata:', event.data.object.metadata);
  } catch (err) {
    console.error('[WEBHOOK] ❌ Assinatura inválida:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ============================================================
  // IDEMPOTÊNCIA — não processar o mesmo evento 2x
  // ============================================================
  const { data: existing } = await supabaseAdmin
    .from('stripe_events')
    .select('id')
    .eq('id', event.id)
    .maybeSingle();

  if (existing) {
    console.log(`[WEBHOOK] Evento ${event.id} já processado, ignorando.`);
    return res.json({ received: true, duplicate: true });
  }

  // Insere registro PENDING antes de processar (lock pessimista)
  await supabaseAdmin.from('stripe_events').insert({
    id: event.id,
    type: event.type,
    payload: event.data.object,
    status: 'processed',
  });

  try {
    await handleEvent(event);
    return res.json({ received: true });
  } catch (err) {
    console.error(`[WEBHOOK] Erro processando ${event.type}:`, err);
    
    // Marca como falho pra reprocessamento manual
    await supabaseAdmin
      .from('stripe_events')
      .update({ status: 'failed', error_message: err.message })
      .eq('id', event.id);

    // Retorna 500 pro Stripe re-tentar (com backoff até 3 dias)
    return res.status(500).json({ error: 'event_processing_failed' });
  }
});

// ===================================================================
// HANDLERS por tipo de evento
// ===================================================================
async function handleEvent(event) {
  switch (event.type) {
    case 'checkout.session.completed':
      return handleCheckoutCompleted(event.data.object);

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      return handleSubscriptionUpsert(event.data.object);

    case 'customer.subscription.deleted':
      return handleSubscriptionCanceled(event.data.object);

    case 'invoice.payment_succeeded':
      return handleInvoicePaid(event.data.object);

    case 'invoice.payment_failed':
      return handleInvoicePaymentFailed(event.data.object);

    default:
      console.log(`[WEBHOOK] Evento ignorado: ${event.type}`);
  }
}

// Quando o Checkout é concluído com sucesso (assinatura OU pack)
async function handleCheckoutCompleted(session) {
  const userId = session.metadata?.user_id;
  const type = session.metadata?.type;

  if (!userId) {
    console.error('[WEBHOOK] checkout.session.completed sem user_id:', session.id);
    return;
  }

  if (type === 'pack') {
    const packId = session.metadata.pack_id;
    
    // Busca config do pack
    const { data: offering } = await supabaseAdmin
      .from('credit_pack_offerings')
      .select('*')
      .eq('id', packId)
      .single();

    if (!offering) {
      throw new Error(`Pack offering ${packId} não encontrado`);
    }

    const expiresAt = offering.expires_in_days
      ? new Date(Date.now() + offering.expires_in_days * 24 * 60 * 60 * 1000).toISOString()
      : null;

    await supabaseAdmin.from('credit_packs').insert({
      user_id: userId,
      credits_purchased: offering.credits,
      credits_remaining: offering.credits,
      price_paid_brl: offering.price_brl,
      stripe_payment_id: session.payment_intent,
      expires_at: expiresAt,
    });

    console.log(`[WEBHOOK] Pack ${packId} (${offering.credits} créditos) creditado para user ${userId}`);
  }

  // Para subscription, o evento real de "está ativa" vem em customer.subscription.created
  // que dispara automaticamente após checkout. Não fazemos nada aqui pra subscription.
}

// Cria ou atualiza a row em subscriptions
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
    console.error('[WEBHOOK] subscription sem metadata:', subscription.id);
    return;
  }

  // Log para debug: ver timestamps que chegam do Stripe
  console.log('[WEBHOOK] Subscription timestamps:', {
    id: subscription.id,
    current_period_start: subscription.current_period_start,
    current_period_end: subscription.current_period_end,
    status: subscription.status
  });

  // Fallback: se timestamps vierem null, usa datas razoáveis
  const periodStart = toSafeISOString(subscription.current_period_start) ?? new Date().toISOString();
  const periodEnd = toSafeISOString(subscription.current_period_end) ?? new Date(Date.now() + 30*24*60*60*1000).toISOString();

  const subscriptionData = {
    user_id: userId,
    plan_id: planId,
    status: subscription.status, // 'active', 'past_due', 'canceled', 'trialing', etc
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer,
    current_period_start: periodStart,
    current_period_end: periodEnd,
    canceled_at: toSafeISOString(subscription.canceled_at),
  };

  // Upsert por user_id (UNIQUE constraint)
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
  console.log(`[WEBHOOK] Subscription ${subscription.id} (${subscription.status}) sincronizada para user ${userId}`);

  // ============================================================
  // CRIAR quota_usage IMEDIATAMENTE (não esperar primeiro débito)
  // ============================================================
  console.log('[WEBHOOK] 📝 Buscando plano:', planId);

  const { data: plan, error: planError } = await supabaseAdmin
    .from('plans')
    .select('monthly_quota_credits')
    .eq('id', planId)
    .single();

  if (!plan || planError) {
    console.error('[WEBHOOK] ❌ ERRO: Plano não encontrado:', planId, planError);
    throw new Error(`Plano ${planId} não encontrado no banco`);
  }

  console.log('[WEBHOOK] ✅ Plano encontrado, créditos:', plan.monthly_quota_credits);
  console.log('[WEBHOOK] 📝 Verificando se quota já existe...');

  // Verifica se já existe quota_usage para este período
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

    // Cria nova entrada de quota_usage
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
}

// Quando assinatura é cancelada definitivamente
async function handleSubscriptionCanceled(subscription) {
  const userId = subscription.metadata?.user_id;

  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  console.log(`[WEBHOOK] Subscription ${subscription.id} cancelada para user ${userId}`);
}

// Renovação mensal — cria nova linha em quota_usage automaticamente via RPC
async function handleInvoicePaid(invoice) {
  if (!invoice.subscription) return; // ignora invoices avulsas

  // Busca a subscription pra atualizar período
  const sub = await stripe.subscriptions.retrieve(invoice.subscription);
  await handleSubscriptionUpsert(sub);

  console.log(`[WEBHOOK] Invoice paga, ciclo renovado: ${invoice.id}`);
}

async function handleInvoicePaymentFailed(invoice) {
  if (!invoice.subscription) return;

  // Marca subscription como past_due
  await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', invoice.subscription);

  console.log(`[WEBHOOK] Pagamento falhou, subscription marcada past_due: ${invoice.subscription}`);
}

module.exports = router;
