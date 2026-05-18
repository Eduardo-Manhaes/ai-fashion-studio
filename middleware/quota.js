const { supabaseAdmin } = require('./auth');

/**
 * Cria um job pendente, debita crédito atomicamente.
 * Em caso de sucesso, popula req.generationJob com o registro criado.
 * Em caso de saldo insuficiente, retorna 402 com info de upgrade.
 */
function requireCredits(generationType, provider) {
  return async (req, res, next) => {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'auth_required' });
    }

    // FASE 1: BYPASS REMOVIDO - produto agora debita créditos reais
    // O sistema de RLS foi corrigido e está funcional

    try {
      // 1. Cria o job pendente
      const { data: job, error: jobErr } = await supabaseAdmin
        .from('generation_jobs')
        .insert({
          user_id: req.user.id,
          generation_type: generationType,
          provider,
          status: 'pending',
          credits_cost: 0, // será atualizado pela RPC
          credit_source: 'quota', // placeholder
          input_payload: req.body,
        })
        .select()
        .single();

      if (jobErr) {
        console.error('[QUOTA] Erro criando job:', jobErr);
        return res.status(500).json({ error: 'job_creation_failed' });
      }

      // 2. Tenta debitar
      const { data: result, error: rpcErr } = await supabaseAdmin
        .rpc('debit_credits', {
          p_user_id: req.user.id,
          p_generation_type: generationType,
          p_job_id: job.id,
        });

      if (rpcErr) {
        console.error('[QUOTA] Erro RPC:', rpcErr);
        await supabaseAdmin.from('generation_jobs').delete().eq('id', job.id);
        return res.status(500).json({ error: 'debit_failed', detail: rpcErr.message });
      }

      if (!result.success) {
        await supabaseAdmin.from('generation_jobs').delete().eq('id', job.id);

        if (result.error === 'no_active_subscription') {
          return res.status(402).json({
            error: 'no_active_subscription',
            message: 'Você não tem uma assinatura ativa.',
          });
        }

        if (result.error === 'insufficient_credits' || result.error === 'no_single_pack_covers_cost') {
          // Busca planos pra oferecer upgrade
          const { data: plans } = await supabaseAdmin
            .from('plans')
            .select('*')
            .eq('is_active', true)
            .order('display_order');

          return res.status(402).json({
            error: 'quota_exceeded',
            message: 'Cota insuficiente para esta geração.',
            cost_required: result.cost_required,
            quota_available: result.quota_available,
            pack_available: result.pack_available,
            upgrade_options: plans,
          });
        }

        return res.status(402).json({ error: result.error });
      }

      // 3. Sucesso — popula req e segue
      req.generationJob = { ...job, credits_cost: result.credits_charged, credit_source: result.source };
      next();

    } catch (err) {
      console.error('[QUOTA] Erro inesperado:', err);
      return res.status(500).json({ error: 'quota_check_failed' });
    }
  };
}

/**
 * Marca job como falho e estorna crédito.
 * Use após erro na chamada à API de IA.
 */
async function refundJob(jobId, errorMessage) {
  try {
    await supabaseAdmin.rpc('refund_credits', { p_job_id: jobId });
    await supabaseAdmin
      .from('generation_jobs')
      .update({ error_message: errorMessage })
      .eq('id', jobId);
  } catch (err) {
    console.error('[REFUND] Falha ao estornar:', err);
  }
}

/**
 * Marca job como processando (após enviar pra IA).
 */
async function markJobProcessing(jobId, providerJobId) {
  await supabaseAdmin
    .from('generation_jobs')
    .update({ 
      status: 'processing',
      provider_job_id: providerJobId,
      started_at: new Date().toISOString(),
    })
    .eq('id', jobId);
}

/**
 * Marca job como completo com URL do resultado.
 */
async function markJobCompleted(jobId, resultUrl) {
  await supabaseAdmin
    .from('generation_jobs')
    .update({
      status: 'completed',
      result_url: resultUrl,
      completed_at: new Date().toISOString(),
    })
    .eq('id', jobId);
}

module.exports = { requireCredits, refundJob, markJobProcessing, markJobCompleted };
