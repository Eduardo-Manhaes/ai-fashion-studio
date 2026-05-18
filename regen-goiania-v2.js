require('dotenv').config();

const MODELS = [
  {
    slug: 'isabela',
    prompt: 'Three-quarter shot from head to knees, unretouched portrait_studio_20240815_0042.CR2, young Brazilian woman, 24 years old, slim curvy body with defined waist and proportional hips, light caramel skin tone with warm golden undertones, long straight black hair with natural volume and slight wave at ends, individual strands visible, dark brown almond-shaped eyes with visible iris detail, small straight nose, full lips with natural rosy tint, high cheekbones, oval face shape, defined dark eyebrows, visible natural skin pores, slight natural redness on cheeks, zero makeup, plain white fitted crew-neck t-shirt with subtle natural fabric wrinkles, plain straight-leg black trousers, standing relaxed facing camera, arms naturally at sides, pure seamless white studio background, single key light at 45 degrees upper left, subtle fill light from right, natural shadow under nose and chin, Canon EOS R5, 85mm f/1.4 lens, ISO 400, 1/200s shutter speed, natural color profile, no retouching, RAW unedited photograph'
  },
  {
    slug: 'valentina',
    prompt: 'Three-quarter shot from head to knees, unretouched portrait_studio_20240815_0042.CR2, young Brazilian woman, 23 years old, slim body with slightly curved hips and defined waist, medium caramel skin with warm undertones, long black wavy hair with natural bounce and volume, loose waves falling past shoulders with individual strands visible, brown eyes with golden flecks and visible iris detail, slightly broader nose with natural skin texture, full lips with natural pigmentation, round face with soft features and dimples, thick defined eyebrows, visible natural skin pores and texture, zero makeup, plain white fitted crew-neck t-shirt with subtle natural fabric wrinkles, plain straight-leg black trousers, standing relaxed facing camera, slight natural smile, arms naturally at sides, pure seamless white studio background, single key light at 45 degrees upper left, subtle fill light from right, Canon EOS R5, 85mm f/1.4 lens, ISO 400, 1/200s shutter speed, natural color profile, no retouching, RAW unedited photograph'
  },
  {
    slug: 'priscila',
    prompt: 'Three-quarter shot from head to knees, unretouched portrait_studio_20240815_0042.CR2, young Brazilian woman, 26 years old, slim athletic body with toned legs and slightly defined waist, light warm brown skin with golden caramel undertones, long straight black hair falling past shoulders with natural shine and individual strands visible, dark brown eyes with natural catchlight and visible iris texture, straight narrow nose, defined full lips, sharp jaw with slight roundness, heart-shaped face, naturally arched dark eyebrows, high cheekbones, visible natural skin pores, zero makeup, plain white fitted crew-neck t-shirt with subtle natural fabric wrinkles, plain straight-leg black trousers, standing relaxed confident facing camera, one hand slightly on hip, arms naturally positioned, pure seamless white studio background, single key light at 45 degrees upper left, subtle fill light from right, Canon EOS R5, 85mm f/1.4 lens, ISO 400, 1/200s shutter speed, natural color profile, no retouching, RAW unedited photograph'
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
    if (!data.request_id) { console.error(`❌ ${model.slug}:`, JSON.stringify(data)); return null; }
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
      if (result.status === 'FAILED') { console.error(`\n❌ ${model.slug}: Falhou`); return null; }
    }
    return null;
  } catch (err) {
    console.error(`❌ ${model.slug}:`, err.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Gerando 3 modelos fenótipo Goiânia v2...\n');
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
