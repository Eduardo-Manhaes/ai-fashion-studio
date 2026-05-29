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
      .limit(20);

    // Filtrar eventos deste user (por metadata)
    const userEvents = stripeEvents?.filter(e =>
      e.payload?.metadata?.user_id === userId ||
      e.payload?.customer === subscription?.stripe_customer_id
    ) || [];

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
        pack_credits: packs?.reduce((sum, p) => sum + p.credits_remaining, 0) || 0,
        stripe_events_count: userEvents.length
      }
    });
  } catch (err) {
    console.error('[DEBUG] Erro:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
