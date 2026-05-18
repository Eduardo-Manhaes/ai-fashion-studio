// Test complete video generation flow through server
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testCompleteFlow() {
  console.log('\n🎬 TESTE COMPLETO: SUBMIT → POLL → RESULTADO\n');

  const testImageUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400';

  // Step 1: Get auth token (using test user)
  console.log('1. Login...');
  const loginRes = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'eduardomanhaesmaciel@gmail.com',
      password: 'senha_teste_123' // Você pode precisar ajustar isso
    })
  });

  let token;
  if (loginRes.ok) {
    const loginData = await loginRes.json();
    token = loginData.session?.access_token;
    console.log('   ✅ Login OK');
  } else {
    console.log('   ⚠️ Login falhou, tentando sem autenticação...');
    token = null;
  }
  console.log('');

  // Step 2: Submit video
  console.log('2. Submetendo vídeo via /api/run-video...');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const submitRes = await fetch('http://localhost:3000/api/run-video', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      style: 'movement',
      inputs: {
        image_url: testImageUrl,
        prompt: 'test video',
        duration: 5,
        aspect_ratio: '9:16'
      }
    })
  });

  const submitData = await submitRes.json();
  console.log('   Status:', submitRes.status);
  console.log('   Resposta:', JSON.stringify(submitData, null, 2));

  if (submitRes.status !== 200 || !submitData.id) {
    console.error('   ❌ Falha ao submeter vídeo');
    return;
  }

  const videoId = submitData.id;
  const provider = submitData.provider;
  console.log(`   ✅ Vídeo submetido: ${videoId}`);
  console.log('');

  // Step 3: Poll for result
  console.log('3. Aguardando conclusão (polling a cada 3s)...');
  let attempts = 0;
  const maxAttempts = 40; // 2 minutes max

  while (attempts < maxAttempts) {
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 3000));

    const pollRes = await fetch(
      `http://localhost:3000/api/status/${provider}/${videoId}`,
      { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }
    );

    const pollData = await pollRes.json();
    console.log(`   [${attempts}] Status: ${pollData.status}${pollData.output ? ' - Vídeo disponível!' : ''}`);

    if (pollData.status === 'completed') {
      console.log('');
      console.log('✅ SUCESSO! Vídeo completado:');
      console.log(JSON.stringify(pollData, null, 2));
      return;
    }

    if (pollData.status === 'failed') {
      console.log('');
      console.log('❌ FALHA na geração:');
      console.log(JSON.stringify(pollData, null, 2));
      return;
    }
  }

  console.log('');
  console.log('⏱️ Timeout - vídeo não completou em 2 minutos');
}

testCompleteFlow().catch(console.error);
