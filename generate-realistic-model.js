require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Bypass SSL
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

async function generate() {
  // Prompt focado em fotorrealismo máximo com roupa branca simples
  const prompt = `Photorealistic portrait photography of a young Brazilian woman, 25 years old, natural beauty, wearing simple white cotton t-shirt, long dark brown wavy hair, full natural lips, well-defined thick eyebrows, warm morena skin tone with natural skin texture and pores visible, minimal natural makeup, subtle gold chain necklace, relaxed confident pose, neutral gray studio background, soft natural lighting, shot with Canon EOS R5, 85mm f/1.4 lens, shallow depth of field, professional fashion catalog photography, 8K resolution, hyperrealistic, RAW photo quality`;

  const negativePrompt = `illustration, painting, drawing, art, sketch, cartoon, anime, CGI, 3D render, artificial, plastic skin, smooth skin, doll-like, fake, oversaturated, overexposed, blurry, low quality, distorted, deformed`;

  console.log('🎨 Gerando modelo REALISTA com roupa branca...\n');
  console.log('📝 Prompt otimizado para fotorrealismo máximo\n');

  const res = await fetch('https://fal.run/fal-ai/flux-pro/v1.1', {
    method: 'POST',
    headers: {
      'Authorization': 'Key ' + process.env.FAL_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt,
      negative_prompt: negativePrompt,
      image_size: 'portrait_4_3',
      num_inference_steps: 40,
      guidance_scale: 2.5,
      num_images: 1,
      enable_safety_checker: true
    })
  });

  const result = await res.json();

  console.log('📊 NSFW:', result.has_nsfw_concepts?.[0] || false);

  if (result.images && result.images[0] && result.images[0].url) {
    const imageUrl = result.images[0].url;
    console.log('🔗 URL:', imageUrl);

    // Baixa
    console.log('⬇️  Baixando...');
    const imgRes = await fetch(imageUrl);
    const imgBuffer = await imgRes.arrayBuffer();
    const buffer = Buffer.from(imgBuffer);

    // Salva PNG
    const pngPath = path.join(__dirname, 'modelo-realista.png');
    fs.writeFileSync(pngPath, buffer);

    const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
    console.log(`\n✅ Imagem salva: ${pngPath}`);
    console.log(`📏 Tamanho: ${sizeMB} MB`);

    if (parseFloat(sizeMB) < 0.1) {
      console.warn('\n⚠️  Imagem muito pequena, pode estar censurada!');
      return;
    }

    // Cria HTML para visualização
    const base64Image = buffer.toString('base64');
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Modelo Realista - Preview</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: #0a0a0a;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            font-family: 'Segoe UI', Arial, sans-serif;
        }
        h1 {
            color: white;
            margin-bottom: 10px;
            font-size: 24px;
        }
        .subtitle {
            color: #888;
            margin-bottom: 30px;
            font-size: 14px;
        }
        img {
            max-width: 90%;
            max-height: 75vh;
            border: 4px solid #222;
            box-shadow: 0 8px 32px rgba(0,0,0,0.8);
            border-radius: 4px;
        }
        .info {
            color: #666;
            margin-top: 20px;
            text-align: center;
            font-size: 13px;
        }
        .approve {
            margin-top: 30px;
            padding: 15px 40px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            font-weight: bold;
        }
        .approve:hover {
            background: #45a049;
        }
    </style>
</head>
<body>
    <h1>🎨 Nova Modelo Preset - Versão Realista</h1>
    <div class="subtitle">Morena com lábios preenchidos • Roupa branca • Fotorrealismo</div>
    <img src="data:image/png;base64,${base64Image}" alt="Modelo Realista">
    <div class="info">
        <p><strong>Tamanho:</strong> ${sizeMB} MB | <strong>NSFW:</strong> ${result.has_nsfw_concepts?.[0] ? 'Sim' : 'Não'}</p>
        <p>Características: Camiseta branca, cabelo longo ondulado, lábios naturais preenchidos, sobrancelhas grossas</p>
    </div>
</body>
</html>
`;

    const htmlPath = path.join(__dirname, 'preview-realista.html');
    fs.writeFileSync(htmlPath, html);

    console.log('🌐 Abrindo preview no navegador...\n');
    const { exec } = require('child_process');
    exec(`start "" "${htmlPath}"`);

  } else {
    console.error('❌ Erro na geração:', result);
  }
}

generate().catch(console.error);
