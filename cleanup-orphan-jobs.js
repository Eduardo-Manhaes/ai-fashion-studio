// Limpeza de jobs órfãos (soft delete)
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

async function cleanup() {
  console.log('🧹 Iniciando limpeza de jobs órfãos...\n');

  // Busca jobs órfãos (processing/in_queue sem result_url)
  const { data: orphans, error: fetchError } = await supabase
    .from('generation_jobs')
    .select('id, generation_type, status, created_at')
    .in('status', ['processing', 'in_queue'])
    .is('result_url', null)
    .order('created_at', { ascending: false });

  if (fetchError) {
    console.error('❌ Erro ao buscar jobs:', fetchError.message);
    return;
  }

  console.log(`📊 Encontrados ${orphans.length} jobs órfãos\n`);

  if (orphans.length === 0) {
    console.log('✅ Nenhum job órfão encontrado. Banco limpo!');
    return;
  }

  // Mostra preview
  console.log('Jobs que serão marcados como "deleted":');
  orphans.slice(0, 10).forEach(j => {
    const date = new Date(j.created_at).toLocaleString('pt-BR');
    console.log(`  - ${j.generation_type} | ${date}`);
  });
  if (orphans.length > 10) {
    console.log(`  ... e mais ${orphans.length - 10} jobs`);
  }
  console.log('');

  // Confirma
  console.log('⚠️  ATENÇÃO: Esta operação irá marcar estes jobs como "deleted".');
  console.log('   Eles não aparecerão mais na galeria mas permanecerão no banco.\n');

  // Executa soft delete
  const ids = orphans.map(j => j.id);
  const { error: updateError } = await supabase
    .from('generation_jobs')
    .update({ status: 'deleted' })
    .in('id', ids);

  if (updateError) {
    console.error('❌ Erro ao atualizar jobs:', updateError.message);
    return;
  }

  console.log(`✅ ${ids.length} jobs marcados como "deleted" com sucesso!\n`);
  console.log('🎯 Resultado:');
  console.log('   - Cards vazios não aparecerão mais em "Minhas Fotos" e "Meus Vídeos"');
  console.log('   - Filtro isValidJob() já exclui status="deleted"');
  console.log('   - Jobs permanecem no banco para auditoria\n');
}

cleanup().catch(console.error);
