require('dotenv').config();

// Bypass SSL
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

async function fixMouth(imageUrl) {
  console.log('🎨 Corrigindo apenas a boca com FLUX Kontext Pro...');
  console.log('Imagem de referência:', imageUrl.substring(0, 80) + '...\n');

  const res = await fetch('https://queue.fal.run/fal-ai/flux-pro/kontext', {
    method: 'POST',
    headers: {
      'Authorization': 'Key ' + process.env.FAL_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      image_url: imageUrl,
      prompt: `This is the same woman. Keep everything exactly identical — face, hair, skin, body, clothing, white background. Change only the expression: neutral face, mouth closed, lips together naturally, no smile, serious but soft expression, relaxed jaw.`,
      guidance_scale: 2.0,
      num_inference_steps: 20,
      enable_safety_checker: false,
    })
  });

  const data = await res.json();
  if (!data.request_id) throw new Error(`Erro: ${JSON.stringify(data)}`);
  console.log('Request ID:', data.request_id);

  // Polling
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const poll = await fetch(data.status_url, {
      headers: { 'Authorization': 'Key ' + process.env.FAL_API_KEY }
    });
    const result = await poll.json();
    console.log(`[${(i+1)*5}s] Status: ${result.status}`);

    if (result.status === 'COMPLETED') {
      const final = await (await fetch(data.response_url, {
        headers: { 'Authorization': 'Key ' + process.env.FAL_API_KEY }
      })).json();
      const resultUrl = final.images?.[0]?.url;
      console.log('\n✅ BOCA CORRIGIDA:');
      console.log(resultUrl);
      break;
    }
    if (result.status === 'FAILED') {
      console.error('❌ Falhou');
      break;
    }
  }
}

const imageUrl = 'https://v3b.fal.media/files/b/0a9ae013/Dy8CvX3R3XFzVoFLIDun6_7faa97d9e0874e2785ea37738708f4ef.jpg';
fixMouth(imageUrl).catch(console.error);
