// Verifica se o sistema está pronto para teste
require('dotenv').config();

async function checkSystem() {
  console.log('\n🔍 VERIFICAÇÃO DO SISTEMA\n');

  const checks = [];

  // 1. Check environment variables
  console.log('1. Variáveis de ambiente...');
  checks.push({
    name: 'FAL_API_KEY',
    ok: !!process.env.FAL_API_KEY,
    value: process.env.FAL_API_KEY ? '✅ Configurada' : '❌ Faltando'
  });
  checks.push({
    name: 'OPENAI_API_KEY',
    ok: !!process.env.OPENAI_API_KEY,
    value: process.env.OPENAI_API_KEY ? '✅ Configurada' : '❌ Faltando'
  });
  checks.push({
    name: 'SUPABASE_URL',
    ok: !!process.env.SUPABASE_URL,
    value: process.env.SUPABASE_URL ? '✅ Configurada' : '❌ Faltando'
  });

  // 2. Check server
  console.log('\n2. Servidor...');
  try {
    const res = await fetch('http://localhost:3000');
    checks.push({
      name: 'Servidor HTTP',
      ok: res.ok,
      value: res.ok ? '✅ Rodando na porta 3000' : '❌ Não responde'
    });
  } catch (err) {
    checks.push({
      name: 'Servidor HTTP',
      ok: false,
      value: '❌ Não conecta (erro: ' + err.message + ')'
    });
  }

  // 3. Check Fal.ai API
  console.log('\n3. Fal.ai API...');
  try {
    const res = await fetch(
      'https://queue.fal.run/fal-ai/kling-video/v2.6/pro/image-to-video',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${process.env.FAL_API_KEY}`
        },
        body: JSON.stringify({
          image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
          prompt: 'test',
          duration: 5,
          aspect_ratio: '9:16'
        })
      }
    );

    const data = await res.json();
    const apiWorks = res.ok && data.request_id;

    checks.push({
      name: 'Fal.ai Kling API',
      ok: apiWorks,
      value: apiWorks
        ? `✅ Funcionando (request_id: ${data.request_id})`
        : `❌ Erro: ${data.detail || res.status}`
    });

    // Clean up test job if it succeeded
    if (apiWorks && data.cancel_url) {
      await fetch(data.cancel_url, {
        method: 'DELETE',
        headers: { 'Authorization': `Key ${process.env.FAL_API_KEY}` }
      }).catch(() => {});
    }
  } catch (err) {
    checks.push({
      name: 'Fal.ai Kling API',
      ok: false,
      value: '❌ Erro: ' + err.message
    });
  }

  // 4. Print summary
  console.log('\n' + '='.repeat(60));
  console.log('RESUMO:');
  console.log('='.repeat(60));

  checks.forEach(check => {
    console.log(`${check.ok ? '✅' : '❌'} ${check.name}: ${check.value}`);
  });

  const allOk = checks.every(c => c.ok);

  console.log('='.repeat(60));
  if (allOk) {
    console.log('✅ SISTEMA PRONTO PARA TESTE!');
    console.log('\nVocê pode agora:');
    console.log('1. Abrir http://localhost:3000 no navegador');
    console.log('2. Fazer login e gerar um vídeo de movimento');
    console.log('3. Aguardar 2-5 minutos para o vídeo completar');
  } else {
    console.log('❌ SISTEMA COM PROBLEMAS');
    console.log('\nResolva os problemas acima antes de testar.');
  }
  console.log('='.repeat(60) + '\n');
}

checkSystem().catch(console.error);
