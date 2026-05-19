require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Bypass SSL em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

async function generate() {
  // Prompt simplificado e mais direto
  const prompt = `Full body portrait of a beautiful Brazilian fashion model, 25 years old woman, long wavy dark brown hair, full plump lips, thick eyebrows, light morena skin, gold necklace, slim athletic body, confident pose with hands on hips, gray studio background, professional fashion photography, high quality, 4K`;

  console.log('🎨 Gerando com FLUX Pro (modelo estável)...\n');

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
      enable_safety_checker: false
    })
  });

  const result = await res.json();

  console.log('📊 Resposta completa da API:');
  console.log(JSON.stringify(result, null, 2));

  if (result.images && result.images[0] && result.images[0].url) {
    const imageUrl = result.images[0].url;
    console.log('\n✅ URL da imagem:', imageUrl);

    // Baixa a imagem
    console.log('⬇️  Baixando...');
    const imgRes = await fetch(imageUrl);
    const imgBuffer = await imgRes.arrayBuffer();
    const buffer = Buffer.from(imgBuffer);

    // Salva localmente
    const localPath = path.join(__dirname, 'modelo-flux-stable.png');
    fs.writeFileSync(localPath, buffer);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ IMAGEM SALVA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📁 Local:', localPath);
    console.log('📏 Tamanho:', (buffer.length / 1024 / 1024).toFixed(2), 'MB');
    console.log('');

    // Abre automaticamente
    const { exec } = require('child_process');
    exec(`start "" "${localPath}"`, (error) => {
      if (error) console.error('Erro ao abrir:', error);
    });

  } else {
    console.error('❌ Nenhuma imagem retornada. Resposta completa acima.');
  }
}

generate().catch(console.error);
