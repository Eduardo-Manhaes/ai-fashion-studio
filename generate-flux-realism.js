require('dotenv').config();
const fs = require('fs');
const path = require('path');

if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

async function generate() {
  const prompt = `photorealistic portrait of young Brazilian woman fashion model, 25 years old, extremely long dark wavy voluminous hair, very full plump lips with obvious lip filler, strongly defined cupid's bow, very thick bold eyebrows, prominent cat-eye eyeliner makeup, warm morena skin tone with visible skin texture and pores, wearing simple white cotton t-shirt, confident pose hands on waist, clean pure white studio backdrop, soft natural studio lighting, shot with professional camera 85mm lens, realistic skin details, high resolution fashion photography, natural realistic look`;

  const negativePrompt = `necklace, jewelry, accessories, horns, illustration, cartoon, anime, deformed face, ugly, blurry, low quality, distorted`;

  console.log('🎨 Gerando com FLUX Realism (especializado em fotos)...\n');

  const res = await fetch('https://fal.run/fal-ai/flux-realism', {
    method: 'POST',
    headers: {
      'Authorization': 'Key ' + process.env.FAL_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt,
      negative_prompt: negativePrompt,
      image_size: 'portrait_4_3',
      num_inference_steps: 30,
      guidance_scale: 3.0,
      num_images: 1
    })
  });

  const result = await res.json();

  console.log('📊 Resposta:', JSON.stringify(result, null, 2).substring(0, 500));

  if (result.images && result.images[0]) {
    const imageUrl = result.images[0].url;
    console.log('\n🔗 URL:', imageUrl);

    const imgRes = await fetch(imageUrl);
    const buffer = Buffer.from(await imgRes.arrayBuffer());

    const pngPath = path.join(__dirname, 'modelo-realism.png');
    fs.writeFileSync(pngPath, buffer);

    const sizeKB = (buffer.length / 1024).toFixed(2);
    const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);

    console.log(`\n✅ Salva: modelo-realism.png`);
    console.log(`📏 Tamanho: ${sizeKB} KB (${sizeMB} MB)`);

    if (buffer.length > 50000) {
      // Cria HTML
      const base64 = buffer.toString('base64');
      const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Modelo Realism</title>
<style>
body{margin:0;padding:20px;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:Arial}
h1{color:#fff;font-size:22px}
img{max-width:90%;max-height:80vh;border:3px solid #333;box-shadow:0 4px 30px rgba(255,255,255,0.1)}
.info{color:#888;margin-top:20px;font-size:14px}
</style>
</head>
<body>
<h1>✨ Modelo Realista - FLUX Realism</h1>
<img src="data:image/png;base64,${base64}">
<div class="info">Tamanho: ${sizeKB} KB</div>
</body>
</html>`;

      const htmlPath = path.join(__dirname, 'preview-realism.html');
      fs.writeFileSync(htmlPath, html);

      console.log('🌐 Abrindo no navegador...');
      const { exec } = require('child_process');
      exec(`start "" "${htmlPath}"`);
    } else {
      console.warn('⚠️  Imagem muito pequena (<50KB), provavelmente censurada');
    }
  } else {
    console.error('❌ Nenhuma imagem gerada');
  }
}

generate().catch(console.error);
