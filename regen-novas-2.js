require('dotenv').config();

const MODELS = [
  {
    slug: 'modelo-foto1',
    // Baseada na foto 1: morena clara, cabelo ondulado volumoso escuro, rosto redondo, lábios cheios, slim curvilínea
    prompt: 'Three-quarter shot from head to knees, unretouched portrait_studio_20240815_0042.CR2, young Brazilian woman, 25 years old, slim curvy figure with defined waist and proportional hips, light warm caramel skin with golden undertones, visible natural skin pores and texture, long dark brown almost black hair with natural voluminous waves falling past shoulders, individual wavy strands catching studio light, dark brown round eyes with visible iris detail and natural catchlight, full naturally defined lips with natural rosy pigmentation, round face shape with soft full cheeks, high prominent cheekbones, small button nose with natural skin texture, thick defined dark eyebrows with slight arch, subtle natural redness on cheeks, no makeup, slight natural asymmetry between left and right side of face, plain white fitted crew-neck t-shirt with subtle natural fabric wrinkles, plain straight-leg black trousers, standing relaxed facing camera, arms naturally at sides, slight natural weight shift, pure seamless white studio background, single key light at 45 degrees upper left, subtle fill light from right, natural shadow under nose and chin, Canon EOS R5, 85mm f/1.4 lens, ISO 400, 1/200s shutter speed, natural color profile, no retouching, RAW unedited photograph'
  },
  {
    slug: 'modelo-foto2',
    // Baseada na foto 2: mais clara, cabelo ondulado ombro, rosto oval delicado, slim elegante, feições finas
    prompt: 'Three-quarter shot from head to knees, unretouched portrait_studio_20240815_0042.CR2, young Brazilian woman, 26 years old, slim elegant figure with slight curves and defined waist, light olive skin with warm neutral undertones, visible natural skin pores and subtle skin texture, medium-length dark brown hair with natural loose waves falling to shoulders, hair with natural shine and individual strands catching studio light, dark brown almond-shaped eyes with visible iris texture and natural catchlight, defined full lips with natural pigmentation, refined oval face shape with delicate features, slightly high cheekbones, straight narrow nose with natural skin detail, naturally arched dark eyebrows, faint natural redness on cheeks, slight natural asymmetry in face, no makeup, plain white fitted crew-neck t-shirt with subtle natural fabric wrinkles, plain straight-leg black trousers, standing relaxed elegantly facing camera, one hand gently touching collarbone area, pure seamless white studio background, single key light at 45 degrees upper left, subtle fill light from right, natural shadow under nose and chin, Canon EOS R5, 85mm f/1.4 lens, ISO 400, 1/200s shutter speed, natural color profile, no retouching, RAW unedited photograph'
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
        guidance_scale: 2.8,
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
  console.log('🚀 Gerando 2 novas modelos baseadas nas fotos de referência...\n');
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
