// Monitor em tempo real das gerações
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { supabaseAdmin } = require('./middleware/auth');

async function monitorGeneration() {
  console.log('\n🔍 MONITORANDO GERAÇÕES EM TEMPO REAL\n');
  console.log('Pressione Ctrl+C para parar\n');
  console.log('='.repeat(70));

  let lastJobId = null;
  let iteration = 0;

  setInterval(async () => {
    try {
      iteration++;

      // Busca jobs recentes
      const { data: jobs, error } = await supabaseAdmin
        .from('generation_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('❌ Erro:', error.message);
        return;
      }

      if (!jobs || jobs.length === 0) {
        if (iteration % 10 === 0) {
          console.log(`[${new Date().toLocaleTimeString()}] Aguardando gerações...`);
        }
        return;
      }

      const latestJob = jobs[0];

      // Se é um novo job, mostra detalhes
      if (latestJob.id !== lastJobId) {
        lastJobId = latestJob.id;

        console.log('\n' + '='.repeat(70));
        console.log(`🆕 NOVA GERAÇÃO DETECTADA [${new Date().toLocaleTimeString()}]`);
        console.log('='.repeat(70));
        console.log(`📋 Job ID: ${latestJob.id}`);
        console.log(`📦 Tipo: ${latestJob.generation_type}`);
        console.log(`🔧 Provider: ${latestJob.provider}`);
        console.log(`📊 Status: ${latestJob.status}`);
        console.log(`💰 Créditos: ${latestJob.credits_cost} (fonte: ${latestJob.credit_source})`);
        console.log(`🕐 Criado: ${latestJob.created_at}`);

        if (latestJob.provider_job_id) {
          console.log(`🎫 Provider Job ID: ${latestJob.provider_job_id}`);
        }

        if (latestJob.input_payload) {
          const inputs = latestJob.input_payload.inputs || {};
          console.log('\n📝 Inputs:');
          Object.keys(inputs).forEach(key => {
            if (key.includes('image') || key.includes('url')) {
              const value = inputs[key];
              const preview = typeof value === 'string'
                ? (value.startsWith('http') ? value : value.substring(0, 50) + '...')
                : JSON.stringify(value).substring(0, 50);
              console.log(`   ${key}: ${preview}`);
            } else {
              console.log(`   ${key}: ${inputs[key]}`);
            }
          });
        }

        console.log('='.repeat(70));
      } else {
        // Atualiza status do job atual
        const status = latestJob.status;
        const statusEmoji = {
          'pending': '⏳',
          'processing': '🔄',
          'completed': '✅',
          'failed': '❌',
          'refunded': '↩️'
        };

        process.stdout.write(`\r[${new Date().toLocaleTimeString()}] ${statusEmoji[status] || '❓'} Status: ${status.toUpperCase().padEnd(15)}`);

        if (status === 'completed') {
          console.log('\n');
          console.log('✅ GERAÇÃO CONCLUÍDA!');
          if (latestJob.result_url) {
            console.log(`📹 URL: ${latestJob.result_url}`);
          }
          console.log(`⏱️  Tempo: ${latestJob.started_at} → ${latestJob.completed_at}`);
          console.log('='.repeat(70));
          console.log('\n');
        } else if (status === 'failed') {
          console.log('\n');
          console.log('❌ GERAÇÃO FALHOU!');
          if (latestJob.error_message) {
            console.log(`💬 Erro: ${latestJob.error_message}`);
          }
          console.log('='.repeat(70));
          console.log('\n');
        }
      }

    } catch (err) {
      console.error('\n❌ Erro no monitor:', err.message);
    }
  }, 2000); // Verifica a cada 2 segundos
}

monitorGeneration();
