require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Bypass SSL
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

async function generate() {
  // Prompt conservador e profissional
  const prompt = `Professional fashion catalog photo, elegant Brazilian female model wearing business casual outfit, long dark wavy hair, natural makeup with defined eyebrows, warm skin tone, gold simple necklace, standing confidently, neutral gray backdrop, studio lighting, commercial photography, professional quality`;

  console.log('🎨 Gerando modelo profissional (prompt conservador)...\n');

  const res = await fetch('https://fal.run/fal-ai/flux-pro', {
    method: 'POST',
    headers: {
      'Authorization': 'Key ' + process.env.FAL_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt,
      image_size: 'portrait_4_3',
      num_inference_steps: 28,
      guidance_scale: 3.5,
      num_images: 1,
      enable_safety_checker: true
    })
  });

  const result = await res.json();

  console.log('📊 has_nsfw_concepts:', result.has_nsfw_concepts);
  console.log('🔗 URL:', result.images?.[0]?.url);

  if (result.images && result.images[0] && result.images[0].url) {
    const imageUrl = result.images[0].url;

    // Baixa
    const imgRes = await fetch(imageUrl);
    const imgBuffer = await imgRes.arrayBuffer();
    const buffer = Buffer.from(imgBuffer);

    // Salva
    const localPath = path.join(__dirname, 'modelo-safe.png');
    fs.writeFileSync(localPath, buffer);

    const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
    console.log(`\n✅ Salva: ${localPath}`);
    console.log(`📏 Tamanho: ${sizeMB} MB`);

    if (parseFloat(sizeMB) < 0.1) {
      console.warn('\n⚠️  AVISO: Imagem muito pequena, pode estar censurada!');
    } else {
      console.log('\n✅ Tamanho OK! Abrindo...');
      const { exec } = require('child_process');
      exec(`start "" "${localPath}"`);
    }

  } else {
    console.error('❌ Erro:', result);
  }
}

generate().catch(console.error);
