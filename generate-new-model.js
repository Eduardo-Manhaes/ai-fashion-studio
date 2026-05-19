require('dotenv').config();

// Bypass SSL
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

async function generateModel() {
  // TENTATIVA 1 — Ultra realista com FLUX Pro
  const prompt = `Hyperrealistic professional fashion model photograph. Young Brazilian woman, 24 years old. Physical features: long dark brown wavy voluminous shiny hair flowing past shoulders, visibly full lips with lip filler and defined cupid's bow, thick perfectly shaped arched eyebrows, light caramel morena Brazilian skin tone with natural luminosity, subtle cat-eye eyeliner, almond shaped eyes, oval face with soft defined cheekbones, natural flawless skin with visible pores. Wearing a plain white basic t-shirt, fitted. Standing in a neutral frontal pose, arms relaxed at sides, slight confident smile. Pure white seamless studio background with no shadows. Full body shot from head to toe. Professional fashion photography studio lighting, soft diffused light, no harsh shadows. Shot on Canon EOS R5, 85mm lens, f/2.8 aperture, natural skin texture, photorealistic, 8K resolution, RAW photograph, no retouching, no airbrushing`;

  const negativePrompt = `cartoon, anime, CGI, illustration, 3D render, painting, drawing, deformed face, asymmetrical face, ugly, blurry, out of focus, low quality, plastic skin, airbrushed skin, smooth skin, fake, artificial, watermark, text, logo, multiple people, extra limbs, bad anatomy, colored background, dark background, gray background, props, accessories, jewelry, necklace`;

  console.log('Enviando para FLUX Pro Ultra...');
  console.log('Prompt:', prompt.substring(0, 100) + '...\n');

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
      num_inference_steps: 45,
      guidance_scale: 2.5,
      num_images: 1,
      enable_safety_checker: false,
      raw: true,
      seed: 42
    })
  });

  const data = await res.json();
  if (!data.request_id) {
    console.error('Erro ao submeter:', JSON.stringify(data));
    return;
  }
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

      const imageUrl = final.images?.[0]?.url;
      console.log('\n✅ IMAGEM GERADA COM SUCESSO!');
      console.log('URL completa:', imageUrl);
      console.log('\nAbra no navegador para avaliar:');
      console.log(imageUrl);
      break;
    }

    if (result.status === 'FAILED') {
      console.error('❌ Geração falhou');
      break;
    }
  }
}

generateModel().catch(console.error);
