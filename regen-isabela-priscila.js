require('dotenv').config();

const MODELS = [
  {
    slug: 'isabela',
    // Problema: ficou artificial. Solução: adicionar mais imperfeições naturais no início
    prompt: 'Three-quarter shot from head to knees, unretouched portrait_studio_20240815_0042.CR2, young Brazilian woman, 24 years old, slim curvy body with defined waist and proportional hips, light caramel skin tone with warm golden undertones, visible natural skin pores and subtle skin texture, slight natural redness on nose bridge, faint asymmetry between left and right side of face, long straight black hair with natural volume and slight wave at ends, individual strands slightly out of place catching studio light, dark brown almond-shaped eyes with visible iris detail and natural catchlight, slight natural redness in whites of eyes, small straight nose with natural skin texture, full lips with natural rosy pigmentation and lip line detail, high cheekbones, oval face shape, defined dark eyebrows with individual hairs visible, zero makeup, plain white fitted crew-neck t-shirt with subtle natural fabric wrinkles, plain straight-leg black trousers, standing relaxed facing camera, arms naturally at sides, slight natural weight shift, pure seamless white studio background, single key light at 45 degrees upper left, subtle fill light from right, natural shadow under nose and chin, Canon EOS R5, 85mm f/1.4 lens, ISO 400, 1/200s shutter speed, natural color profile, no retouching, no filters, RAW unedited photograph'
  },
  {
    slug: 'priscila',
    // Problema: close no rosto. Solução: reforçar three-quarter no início igual Camila v5
    prompt: 'Three-quarter shot showing body from head to knees, unretouched portrait_studio_20240815_0042.CR2, young Brazilian woman, 26 years old, slim athletic body with toned figure and slightly defined waist, light warm brown skin with golden caramel undertones, visible natural skin pores and skin texture, long straight black hair falling past shoulders with natural shine and individual strands visible, dark brown eyes with natural catchlight and visible iris texture, straight narrow nose with natural skin detail, defined full lips with natural pigmentation, sharp jaw with slight roundness, heart-shaped face, naturally arched dark eyebrows, high cheekbones, zero makeup, plain white fitted crew-neck t-shirt with subtle natural fabric wrinkles, plain straight-leg black trousers, standing relaxed confident facing camera, one hand slightly on hip, arms naturally positioned, entire upper body and thighs visible in frame, pure seamless white studio background, single key light at 45 degrees upper left, subtle fill light from right, Canon EOS R5, 85mm f/1.4 lens, ISO 400, 1/200s shutter speed, natural color profile, no retouching, RAW unedited photograph'
  },
];

async function generateModel(model) {
  console.log(`\n🎨 Gerando: ${model.slug}...`);
  try {
    const res = await fetch('https://queue.fal.run/fal-ai/flux-pro/v1.1-ultra', {
      method: 'POST',
      headers: {
        'Authorization': 'Key ' + process.env.FAL_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: model.prompt,
        image_size: 'portrait_4_3',
        num_inference_steps: 45,
        guidance_scale: 2.2,
        enable_safety_checker: false,
        raw: true
      })
    });

    const data = await res.json();
    if (!data.request_id) { console.error(`❌`, JSON.stringify(data)); return null; }
    console.log(`✅ Submetido: ${data.request_id}`);

    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 6000));
      const poll = await fetch(data.status_url, { headers: { 'Authorization': 'Key ' + process.env.FAL_API_KEY } });
      const result = await poll.json();
      process.stdout.write(`\rStatus: ${result.status} (${(i+1)*6}s)`);
      if (result.status === 'COMPLETED') {
        const final = await fetch(data.response_url, { headers: { 'Authorization': 'Key ' + process.env.FAL_API_KEY } });
        const finalData = await final.json();
        const url = finalData.images?.[0]?.url;
        console.log(`\n✅ ${model.slug}: ${url}`);
        return { slug: model.slug, url };
      }
      if (result.status === 'FAILED') { console.error(`\n❌ Falhou`); return null; }
    }
    return null;
  } catch (err) {
    console.error(`❌`, err.message);
    return null;
  }
}

async function main() {
  console.log('🎨 Regenerando Isabela e Priscila...\n');
  const results = [];
  for (const model of MODELS) {
    const result = await generateModel(model);
    if (result) results.push(result);
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log('\n\n📋 URLs:');
  results.forEach(r => console.log(`${r.slug}: ${r.url}`));
}

main().catch(console.error);
