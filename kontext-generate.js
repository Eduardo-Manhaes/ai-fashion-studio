require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Bypass SSL
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run(localFilePath) {
  // PASSO 1 — Upload da foto de referência
  console.log('📤 Fazendo upload da referência...');
  const buffer = fs.readFileSync(localFilePath);
  const ext = path.extname(localFilePath).replace('.', '') || 'jpg';
  const fileName = `preset-models/ref-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('generations')
    .upload(fileName, buffer, { contentType: `image/${ext}`, upsert: true });

  if (error) throw new Error(`Upload falhou: ${error.message}`);

  const { data: urlData } = supabase.storage
    .from('generations')
    .getPublicUrl(fileName);

  const referenceUrl = urlData.publicUrl;
  console.log('✅ URL de referência:', referenceUrl);

  // PASSO 2 — FLUX Kontext Pro
  console.log('\n🎨 Gerando com FLUX Kontext Pro...');

  const res = await fetch('https://queue.fal.run/fal-ai/flux-pro/kontext', {
    method: 'POST',
    headers: {
      'Authorization': 'Key ' + process.env.FAL_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      image_url: referenceUrl,
      prompt: `Keep the exact same woman with identical facial features — same dark wavy voluminous hair, same morena Brazilian skin tone, same face shape, same thick arched eyebrows, same natural makeup. Natural relaxed mouth with lips slightly parted showing teeth, natural smile. Change ONLY the clothing to a plain white basic fitted crew neck t-shirt. Change ONLY the background to pure white seamless studio background. Upper body shot from waist up, frontal pose, arms relaxed at sides. Soft professional studio lighting, photorealistic, 4K`,
      guidance_scale: 3.5,
      num_inference_steps: 28,
      enable_safety_checker: false,
    })
  });

  const data = await res.json();
  if (!data.request_id) throw new Error(`Erro: ${JSON.stringify(data)}`);
  console.log('Request ID:', data.request_id);

  // PASSO 3 — Polling
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
      console.log('\n✅ IMAGEM GERADA:');
      console.log(imageUrl);
      break;
    }
    if (result.status === 'FAILED') {
      console.error('❌ Falhou');
      break;
    }
  }
}

// Uso: node kontext-generate.js "C:\caminho\para\foto.jpg"
const filePath = process.argv[2];
if (!filePath || !fs.existsSync(filePath)) {
  console.error('❌ Arquivo não encontrado.');
  console.error('Uso: node kontext-generate.js "C:\\caminho\\para\\foto.jpg"');
  process.exit(1);
}

run(filePath).catch(console.error);
