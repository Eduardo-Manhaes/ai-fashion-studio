// Test submitting a FRESH video and checking its status
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testFreshVideo() {
  console.log('\n🎬 TESTANDO VÍDEO FRESCO\n');

  // Use a sample image URL (using a placeholder or one from storage)
  const testImageUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400';

  try {
    // Step 1: Submit new video
    console.log('1. Submetendo novo vídeo para Fal.ai Kling...');
    const submitRes = await fetch(
      'https://queue.fal.run/fal-ai/kling-video/v2.6/pro/image-to-video',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${process.env.FAL_API_KEY}`,
        },
        body: JSON.stringify({
          image_url: testImageUrl,
          prompt: 'test video',
          duration: '5s',
          aspect_ratio: '9:16',
        }),
      }
    );

    const submitData = await submitRes.json();
    console.log('   Resposta:', JSON.stringify(submitData, null, 2));

    if (!submitData.request_id) {
      console.error('   ❌ Falha ao obter request_id');
      return;
    }

    const requestId = submitData.request_id;
    console.log(`   ✅ Request ID: ${requestId}`);
    console.log('');

    // Step 2: Wait a bit then check status
    console.log('2. Aguardando 5 segundos antes de checar status...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('');

    // Step 3: Check status
    console.log('3. Checando status...');
    const statusRes = await fetch(
      `https://queue.fal.run/fal-ai/kling-video/requests/${requestId}/status`,
      {
        headers: { 'Authorization': `Key ${process.env.FAL_API_KEY}` }
      }
    );

    const statusData = await statusRes.json();
    console.log('   Status:', JSON.stringify(statusData, null, 2));
    console.log('');

    // Step 4: If response_url is available, try to fetch from it
    if (statusData.response_url) {
      console.log('4. response_url disponível! Tentando buscar resultado...');
      console.log('   URL:', statusData.response_url);

      const resultRes = await fetch(statusData.response_url, {
        headers: { 'Authorization': `Key ${process.env.FAL_API_KEY}` }
      });

      const resultText = await resultRes.text();
      console.log('   Status HTTP:', resultRes.status);
      console.log('   Conteúdo:', resultText.substring(0, 500));
    } else {
      console.log('4. response_url ainda é null (esperado para job recente)');
    }

    console.log('');
    console.log('✨ Para verificar quando completar, rode:');
    console.log(`   node -e "require('dotenv').config(); fetch('https://queue.fal.run/fal-ai/kling-video/requests/${requestId}/status', {headers:{'Authorization':'Key '+process.env.FAL_API_KEY}}).then(r=>r.json()).then(console.log)"`);

  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
}

testFreshVideo();
