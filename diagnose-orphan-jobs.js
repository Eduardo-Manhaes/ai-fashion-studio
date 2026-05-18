// Diagnóstico de jobs órfãos no banco
require('dotenv').config();

// SSL fix para desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnose() {
  console.log('🔍 Analisando jobs órfãos...\n');

  // Busca todos os jobs do usuário (substitua pelo user_id real)
  const { data: jobs, error } = await supabase
    .from('generation_jobs')
    .select('id, generation_type, status, result_url, created_at, provider_job_id')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('❌ Erro:', error.message);
    return;
  }

  console.log(`📊 Total de jobs: ${jobs.length}\n`);

  // Análise por status
  const byStatus = {};
  jobs.forEach(j => {
    byStatus[j.status] = (byStatus[j.status] || 0) + 1;
  });

  console.log('📈 Jobs por status:');
  Object.entries(byStatus).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });
  console.log('');

  // Jobs órfãos (processing/in_queue sem result_url)
  const orphans = jobs.filter(j =>
    (j.status === 'processing' || j.status === 'in_queue') && !j.result_url
  );

  console.log(`⚠️  Jobs órfãos (${orphans.length}):`);
  orphans.forEach(j => {
    const date = new Date(j.created_at).toLocaleString('pt-BR');
    console.log(`  - ID ${j.id} | ${j.generation_type} | ${j.status} | ${date}`);
  });
  console.log('');

  // Jobs completos sem URL
  const completedNoUrl = jobs.filter(j => j.status === 'completed' && !j.result_url);
  console.log(`⚠️  Jobs 'completed' sem URL (${completedNoUrl.length}):`);
  completedNoUrl.forEach(j => {
    const date = new Date(j.created_at).toLocaleString('pt-BR');
    console.log(`  - ID ${j.id} | ${j.generation_type} | ${date}`);
  });
  console.log('');

  // Jobs failed
  const failed = jobs.filter(j => j.status === 'failed');
  console.log(`❌ Jobs 'failed' (${failed.length}):`);
  failed.slice(0, 5).forEach(j => {
    const date = new Date(j.created_at).toLocaleString('pt-BR');
    console.log(`  - ID ${j.id} | ${j.generation_type} | ${date}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('💡 RECOMENDAÇÕES:\n');

  if (orphans.length > 0) {
    console.log(`1. Marcar ${orphans.length} jobs órfãos como 'failed'`);
    console.log('   ou soft-delete (status="deleted")\n');
  }

  if (completedNoUrl.length > 0) {
    console.log(`2. Corrigir ${completedNoUrl.length} jobs 'completed' sem URL`);
    console.log('   (marcar como "failed" ou investigar)\n');
  }

  if (failed.length > 0) {
    console.log(`3. Considerar soft-delete de ${failed.length} jobs 'failed'`);
    console.log('   (já estão marcados como falhos)\n');
  }
}

diagnose().catch(console.error);
