require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Bypass SSL em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

async function generate() {
  const prompt = `Professional fashion model photo, young Brazilian woman, 25 years old, long dark wavy voluminous hair, full lips with lip filler, defined cupid's bow, perfectly shaped thick eyebrows, light morena skin tone, cat-eye eyeliner makeup, gold layered necklace, slim body, confident pose, hands on waist, neutral gray studio background, soft professional studio lighting, full body shot, high fashion photography, Canon EOS R5, 4K, photorealistic`;

  const negativePrompt = `cartoon, anime, illustration, deformed, ugly, blurry, low quality, plastic skin, fake, artificial, overexposed, dark background`;

  console.log('🎨 Gerando nova imagem via FLUX Pro...\n');

  const res = await fetch('https://queue.fal.run/fal-ai/flux-pro/v1.1-ultra', {
    method: 'POST',
    headers: {
      'Authorization': 'Key ' + process.env.FAL_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt,
      negative_prompt: negativePrompt,
      image_size: { width: 832, height: 1216 },
      num_inference_steps: 35,
      guidance_scale: 3.5,
      num_images: 1,
      enable_safety_checker: false,
      raw: true
    })
  });

  const data = await res.json();

  if (!res.ok || !data.request_id) {
    console.error('❌ Erro na API:', data);
    return;
  }

  console.log('⏳ Request ID:', data.request_id);

  // Polling
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const poll = await fetch(data.status_url, {
      headers: { 'Authorization': 'Key ' + process.env.FAL_API_KEY }
    });
    const result = await poll.json();
    console.log(`⏳ Status: ${result.status} (${(i+1)*5}s)`);

    if (result.status === 'COMPLETED') {
      const final = await fetch(data.response_url, {
        headers: { 'Authorization': 'Key ' + process.env.FAL_API_KEY }
      });
      const finalData = await final.json();
      const imageUrl = finalData.images?.[0]?.url;

      if (!imageUrl) {
        console.error('❌ URL da imagem não encontrada');
        return;
      }

      console.log('\n✅ Imagem gerada! Baixando...');
      console.log('🔗 URL original:', imageUrl);

      // Baixa a imagem imediatamente
      const imgRes = await fetch(imageUrl);
      const imgBuffer = await imgRes.arrayBuffer();
      const buffer = Buffer.from(imgBuffer);

      // Salva localmente
      const localPath = path.join(__dirname, 'modelo-morena-lips.png');
      fs.writeFileSync(localPath, buffer);

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ IMAGEM SALVA LOCALMENTE');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📁 Local:', localPath);
      console.log('📏 Tamanho:', (buffer.length / 1024).toFixed(2), 'KB');
      console.log('');

      break;
    }

    if (result.status === 'FAILED') {
      console.error('❌ Geração falhou');
      break;
    }
  }
}

generate().catch(console.error);
