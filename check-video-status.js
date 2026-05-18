// Verifica status dos vídeos sendo gerados
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { supabaseAdmin } = require('./middleware/auth');

async function checkVideoStatus() {
  console.log('\n🎬 VERIFICANDO STATUS DOS VÍDEOS\n');

  // Busca jobs de vídeo recentes
  const { data: jobs, error } = await supabaseAdmin
    .from('generation_jobs')
    .select('*')
    .in('generation_type', ['video_movement', 'video_talking'])
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ Erro:', error);
    return;
  }

  if (!jobs || jobs.length === 0) {
    console.log('Nenhum job de vídeo encontrado.');
    return;
  }

  console.log(`Encontrados ${jobs.length} jobs de vídeo:\n`);

  for (const job of jobs) {
    const statusEmoji = {
      'pending': '⏳',
      'processing': '🔄',
      'completed': '✅',
      'failed': '❌'
    };

    console.log('─'.repeat(70));
    console.log(`${statusEmoji[job.status] || '❓'} Job ID: ${job.id}`);
    console.log(`   Tipo: ${job.generation_type}`);
    console.log(`   Provider: ${job.provider}`);
    console.log(`   Status: ${job.status.toUpperCase()}`);
    console.log(`   Criado: ${new Date(job.created_at).toLocaleString()}`);

    if (job.provider_job_id) {
      console.log(`   Provider Job ID: ${job.provider_job_id}`);

      // Tenta buscar status no provider
      if (job.provider === 'kling' && job.status === 'processing') {
        try {
          const response = await fetch(
            `http://localhost:3000/api/status/kling/${job.provider_job_id}`
          );
          const status = await response.json();

          if (status.status === 'completed' && status.output && status.output[0]) {
            console.log(`   🎉 CONCLUÍDO! URL: ${status.output[0]}`);
          } else if (status.status === 'failed') {
            console.log(`   ❌ FALHOU: ${status.error?.message || 'Erro desconhecido'}`);
          } else {
            console.log(`   ⏳ Ainda processando no Kling...`);
          }
        } catch (err) {
          console.log(`   ⚠️  Erro ao verificar status: ${err.message}`);
        }
      }
    }

    if (job.result_url) {
      console.log(`   📹 Resultado: ${job.result_url}`);
    }

    if (job.error_message) {
      console.log(`   ❌ Erro: ${job.error_message}`);
    }
  }

  console.log('─'.repeat(70));
  console.log('\n💡 Dica: Execute novamente para ver atualizações');
  console.log('   node check-video-status.js\n');
}

checkVideoStatus();
