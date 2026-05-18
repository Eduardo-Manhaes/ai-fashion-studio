// Simula exatamente o que o endpoint /api/me/generations faz
require('dotenv').config();

// SSL fix
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getSignedUrl(storagePath) {
  if (!storagePath) return null;
  const { data, error } = await supabaseAdmin.storage
    .from('generations')
    .createSignedUrl(storagePath, 3600);
  if (error) throw error;
  return data.signedUrl;
}

async function testGenerationsAPI() {
  console.log('🧪 Simulando /api/me/generations\n');

  // Pega qualquer user_id que tenha fotos
  const { data: anyJob } = await supabaseAdmin
    .from('generation_jobs')
    .select('user_id')
    .eq('generation_type', 'photo')
    .eq('status', 'completed')
    .limit(1)
    .single();

  if (!anyJob) {
    console.log('⚠️  Nenhuma foto encontrada no banco');
    return;
  }

  const userId = anyJob.user_id;
  console.log(`📝 Usando user_id: ${userId}\n`);

  // Query exata do endpoint
  const { data: jobs, error } = await supabaseAdmin
    .from('generation_jobs')
    .select('id, generation_type, provider, status, credits_cost, storage_path, result_url, created_at, completed_at, expires_at, input_payload')
    .eq('user_id', userId)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('❌ Erro na query:', error.message);
    return;
  }

  console.log(`✅ Query retornou ${jobs.length} jobs\n`);

  // DEBUG: verifica primeiro job antes do enrich
  if (jobs.length > 0) {
    console.log('[DEBUG] Primeiro job DO BANCO tem input_payload?', !!jobs[0].input_payload);
    console.log('[DEBUG] Campos do job do banco:', Object.keys(jobs[0]));
    if (jobs[0].input_payload) {
      console.log('[DEBUG] Tipo do input_payload:', typeof jobs[0].input_payload);
      console.log('[DEBUG] input_payload tem inputs?', !!jobs[0].input_payload.inputs);
      console.log('[DEBUG] input_payload tem product_image?', !!jobs[0].input_payload?.inputs?.product_image);
    }
    console.log('');
  }

  // Regera URL assinada se já expirou (lógica do endpoint)
  const enriched = await Promise.all(jobs.map(async (job) => {
    // DEBUG: log individual do job
    console.log(`[DEBUG MAP] Job ${job.id} tem input_payload?`, !!job.input_payload, 'tipo:', typeof job.input_payload);

    // Copia explícita
    const baseJob = {
      id: job.id,
      generation_type: job.generation_type,
      provider: job.provider,
      status: job.status,
      credits_cost: job.credits_cost,
      storage_path: job.storage_path,
      result_url: job.result_url,
      created_at: job.created_at,
      completed_at: job.completed_at,
      expires_at: job.expires_at,
      input_payload: job.input_payload
    };

    console.log(`[DEBUG MAP] baseJob tem input_payload?`, !!baseJob.input_payload);

    if (job.storage_path && job.status === 'completed') {
      try {
        const freshUrl = await getSignedUrl(job.storage_path);
        baseJob.result_url = freshUrl;
      } catch (err) {
        console.error(`Falha regerando URL ${job.id}:`, err.message);
      }
    }
    return baseJob;
  }));

  console.log('');

  // DEBUG: verifica se input_payload está sendo enviado
  console.log('[DEBUG] Enviando', enriched.length, 'jobs');
  const firstJob = enriched[0];
  if (firstJob) {
    console.log('[DEBUG] Primeiro job tem input_payload?', !!firstJob.input_payload);
    console.log('[DEBUG] Campos do primeiro job:', Object.keys(firstJob));
    if (firstJob.input_payload) {
      console.log('[DEBUG] input_payload tem inputs?', !!firstJob.input_payload.inputs);
      console.log('[DEBUG] Tamanho JSON do input_payload:', JSON.stringify(firstJob.input_payload).length);
    }
  }

  const responsePayload = { generations: enriched, total: enriched.length };
  console.log('[DEBUG] JSON response tem input_payload no primeiro?', !!responsePayload.generations[0]?.input_payload);

  console.log('\n✅ Simulação concluída');
}

testGenerationsAPI().catch(console.error);
