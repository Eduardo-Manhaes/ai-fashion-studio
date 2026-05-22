const express = require('express');
const { supabaseAdmin } = require('../middleware/auth');

const router = express.Router();

// ===================================================================
// GET /api/admin/users
// Lista todos os usuários com informações de plano, assinatura e créditos
// ===================================================================
router.get('/users', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_user_overview')
      .select('*')
      .order('signup_at', { ascending: false });

    if (error) {
      console.error('[ADMIN] Erro ao buscar usuários:', error);
      return res.status(500).json({ error: 'database_error', detail: error.message });
    }

    res.json({ users: data || [], total: data?.length || 0 });
  } catch (err) {
    console.error('[ADMIN] Erro inesperado:', err);
    res.status(500).json({ error: 'internal_error', detail: err.message });
  }
});

// ===================================================================
// GET /api/admin/users/:userId
// Retorna informações detalhadas de um usuário específico
// ===================================================================
router.get('/users/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Busca overview do usuário
    const { data: overview, error: overviewError } = await supabaseAdmin
      .from('admin_user_overview')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (overviewError) {
      console.error('[ADMIN] Erro ao buscar overview:', overviewError);
      return res.status(404).json({ error: 'user_not_found' });
    }

    // Busca últimas gerações do usuário (últimas 20)
    const { data: generations, error: genError } = await supabaseAdmin
      .from('generation_jobs')
      .select('id, type, status, credits_cost, created_at, updated_at, output_url')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (genError) {
      console.error('[ADMIN] Erro ao buscar gerações:', genError);
    }

    // Busca credit packs ativos
    const { data: packs, error: packsError } = await supabaseAdmin
      .from('credit_packs')
      .select('id, credits_total, credits_remaining, expires_at, created_at')
      .eq('user_id', userId)
      .gt('credits_remaining', 0)
      .order('created_at', { ascending: false });

    if (packsError) {
      console.error('[ADMIN] Erro ao buscar packs:', packsError);
    }

    res.json({
      ...overview,
      recent_generations: generations || [],
      active_packs: packs || []
    });

  } catch (err) {
    console.error('[ADMIN] Erro inesperado:', err);
    res.status(500).json({ error: 'internal_error', detail: err.message });
  }
});

// ===================================================================
// GET /api/admin/stats
// Retorna estatísticas gerais da plataforma
// ===================================================================
router.get('/stats', async (req, res) => {
  try {
    // Total de usuários
    const { count: totalUsers, error: usersError } = await supabaseAdmin
      .from('admin_user_overview')
      .select('user_id', { count: 'exact', head: true });

    if (usersError) {
      console.error('[ADMIN] Erro ao contar usuários:', usersError);
    }

    // Usuários com assinatura ativa
    const { count: activeSubscriptions, error: activeError } = await supabaseAdmin
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active');

    if (activeError) {
      console.error('[ADMIN] Erro ao contar assinaturas ativas:', activeError);
    }

    // Total de gerações
    const { count: totalGenerations, error: genError } = await supabaseAdmin
      .from('generation_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'completed');

    if (genError) {
      console.error('[ADMIN] Erro ao contar gerações:', genError);
    }

    // MRR (Monthly Recurring Revenue) — soma price_brl de assinaturas ativas
    const { data: activePlans, error: mrrError } = await supabaseAdmin
      .from('subscriptions')
      .select('plan_id')
      .eq('status', 'active');

    let mrr = 0;
    if (!mrrError && activePlans) {
      const planIds = activePlans.map(s => s.plan_id);
      const { data: plans } = await supabaseAdmin
        .from('plans')
        .select('id, price_brl')
        .in('id', planIds);

      if (plans) {
        mrr = plans.reduce((sum, plan) => sum + (plan.price_brl || 0), 0);
      }
    }

    res.json({
      total_users: totalUsers || 0,
      active_subscriptions: activeSubscriptions || 0,
      total_generations: totalGenerations || 0,
      mrr: mrr
    });

  } catch (err) {
    console.error('[ADMIN] Erro ao calcular stats:', err);
    res.status(500).json({ error: 'internal_error', detail: err.message });
  }
});

// ===================================================================
// POST /api/admin/force-complete-video
// Marca um job de vídeo como completo e define a URL de saída
// Movido de server.js para admin router
// ===================================================================
router.post('/force-complete-video', async (req, res) => {
  const { jobId, outputUrl } = req.body;

  if (!jobId || !outputUrl) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  try {
    console.log(`[ADMIN] Forçando conclusão do job ${jobId} com URL:`, outputUrl);

    const { data: updated, error } = await supabaseAdmin
      .from('generation_jobs')
      .update({
        status: 'completed',
        output_url: outputUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      console.error('[ADMIN] Erro ao atualizar job:', error);
      return res.status(500).json({ error: 'update_failed', detail: error.message });
    }

    console.log('[ADMIN] ✓ Job marcado como completo:', updated);

    res.json({ success: true, job: updated });

  } catch (err) {
    console.error('[ADMIN] Erro inesperado:', err);
    res.status(500).json({ error: 'internal_error', detail: err.message });
  }
});

module.exports = router;
