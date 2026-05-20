const express = require('express');
const { stripe } = require('../lib/stripe');
const { requireAuth, supabaseAdmin } = require('../middleware/auth');

const router = express.Router();

// ===================================================================
// HELPER: pega ou cria Stripe Customer pro usuário
// ===================================================================
async function getOrCreateStripeCustomer(userId, email) {
  // Tenta achar customer existente via subscription ativa OU passada
  const { data: existing } = await supabaseAdmin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .not('stripe_customer_id', 'is', null)
    .maybeSingle();

  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id;
  }

  // Cria novo
  const customer = await stripe.customers.create({
    email,
    metadata: { supabase_user_id: userId },
  });

  return customer.id;
}

// ===================================================================
// POST /api/stripe/create-checkout
// Body: { type: 'subscription' | 'pack', plan_id?: string, pack_id?: string }
// ===================================================================
router.post('/create-checkout', requireAuth, async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'stripe_not_configured', message: 'Stripe não configurado.' });
  }
  // FASE 2: Aceita "plan" como alias de "plan_id" para compatibilidade com página de planos
  const { type, plan_id, pack_id, plan } = req.body;
  const planIdFinal = plan || plan_id; // "plan" tem prioridade
  const userId = req.user.id;
  const email = req.user.email;

  // Se não especificou type, assume subscription para planos
  const typeFinal = type || (planIdFinal ? 'subscription' : 'pack');

  if (!['subscription', 'pack'].includes(typeFinal)) {
    return res.status(400).json({ error: 'invalid_type' });
  }

  try {
    const customerId = await getOrCreateStripeCustomer(userId, email);

    let sessionConfig;

    if (typeFinal === 'subscription') {
      // Mapeia plan_id → STRIPE_PRICE_*
      // IDs no banco: starter=Básico, pro=Starter, enterprise=Pro
      const priceMap = {
        starter: process.env.STRIPE_PRICE_BASICO,      // plano Básico (20 créditos)
        pro: process.env.STRIPE_PRICE_STARTER,          // plano Starter (50 créditos)
        enterprise: process.env.STRIPE_PRICE_PRO,       // plano Pro (120 créditos)
      };
      const stripePriceId = priceMap[planIdFinal];
      
      if (!stripePriceId) {
        return res.status(400).json({ error: 'invalid_plan_id' });
      }

      sessionConfig = {
        mode: 'subscription',
        customer: customerId,
        payment_method_types: ['card'], // assinatura: só cartão
        line_items: [{ price: stripePriceId, quantity: 1 }],
        success_url: `${req.headers.origin || 'http://localhost:3000'}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin || 'http://localhost:3000'}/billing/cancel`,
        metadata: { user_id: userId, plan_id: planIdFinal, type: 'subscription' },
        subscription_data: {
          metadata: { user_id: userId, plan_id: planIdFinal },
        },
        locale: 'pt-BR',
      };

    } else {
      // type === 'pack'
      const priceMap = {
        pack_50: process.env.STRIPE_PRICE_PACK_50,
        pack_200: process.env.STRIPE_PRICE_PACK_200,
        pack_500: process.env.STRIPE_PRICE_PACK_500,
      };
      const stripePriceId = priceMap[pack_id];

      if (!stripePriceId) {
        return res.status(400).json({ error: 'invalid_pack_id' });
      }

      sessionConfig = {
        mode: 'payment',
        customer: customerId,
        payment_method_types: ['card'], // pix será adicionado se a conta brasileira tiver habilitado
        // Stripe Brasil: para habilitar Pix, é preciso ativar no painel. Tentamos ambos:
        // Se a conta não tiver Pix ativo, o Stripe ignora e mostra só cartão.
        line_items: [{ price: stripePriceId, quantity: 1 }],
        success_url: `${req.headers.origin || 'http://localhost:3000'}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin || 'http://localhost:3000'}/billing/cancel`,
        metadata: { user_id: userId, pack_id, type: 'pack' },
        locale: 'pt-BR',
      };

      // Tentativa de adicionar Pix (só funciona se a conta tiver habilitado)
      // Comentado por padrão — descomente após habilitar Pix no dashboard Stripe:
      // sessionConfig.payment_method_types = ['card', 'pix'];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.json({ url: session.url, session_id: session.id });

  } catch (err) {
    console.error('[STRIPE] Erro criando checkout:', err);
    res.status(500).json({ error: 'checkout_creation_failed', detail: err.message });
  }
});

// ===================================================================
// POST /api/stripe/portal
// Retorna URL do Customer Portal para o usuário gerenciar assinatura
// ===================================================================
router.post('/portal', requireAuth, async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'stripe_not_configured', message: 'Stripe não configurado.' });
  }
  try {
    const customerId = await getOrCreateStripeCustomer(req.user.id, req.user.email);

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: req.headers.origin || 'http://localhost:3000',
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('[STRIPE] Erro criando portal:', err);
    res.status(500).json({ error: 'portal_creation_failed', detail: err.message });
  }
});

// ===================================================================
// GET /api/stripe/session/:session_id
// Retorna detalhes da sessão de checkout para página de sucesso
// ===================================================================
router.get('/session/:session_id', requireAuth, async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'stripe_not_configured' });
  }
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.session_id);

    if (session.metadata?.user_id !== req.user.id) {
      return res.status(403).json({ error: 'unauthorized' });
    }

    const response = {
      mode: session.mode,
      status: session.payment_status,
    };

    if (session.mode === 'subscription' && session.metadata?.plan_id) {
      const planNames = {
        basico: 'Básico — 20 créditos/mês',
        starter: 'Starter — 50 créditos/mês',
        pro: 'Pro — 120 créditos/mês',
        enterprise: 'Enterprise — Ilimitado',
      };
      const planCredits = { basico: 20, starter: 50, pro: 120, enterprise: 999999 };

      response.plan_name = planNames[session.metadata.plan_id];
      response.credits = planCredits[session.metadata.plan_id];
    } else if (session.mode === 'payment' && session.metadata?.pack_id) {
      const packNames = {
        pack_50: 'Pacote 50 créditos',
        pack_200: 'Pacote 200 créditos',
        pack_500: 'Pacote 500 créditos',
      };
      const packCredits = { pack_50: 50, pack_200: 200, pack_500: 500 };

      response.pack_name = packNames[session.metadata.pack_id];
      response.credits = packCredits[session.metadata.pack_id];
    }

    res.json(response);
  } catch (err) {
    console.error('[STRIPE] Erro buscando sessão:', err);
    res.status(500).json({ error: 'session_fetch_failed' });
  }
});

module.exports = router;
