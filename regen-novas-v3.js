require('dotenv').config();

const MODELS = [
  {
    slug: 'modelo-foto1-v3',
    // Foto 1: cabelo preto MUITO ondulado/encaracolado volumoso longo, pele morena média, rosto redondo cheio, sobrancelhas bem feitas, maquiagem leve, corpo curvilíneo
    prompt: 'Three-quarter shot from head to knees, unretouched portrait_studio_20240815_0042.CR2, young Brazilian woman, 25 years old, curvy slim body with defined waist, medium warm brown skin with golden undertones, visible natural skin pores, long dark black hair with voluminous loose curls and waves falling past chest, very voluminous curly wavy hair with lots of body and individual curl strands catching light, dark brown eyes with visible iris detail, slightly rounder wider nose with natural skin texture, full naturally defined lips with rosy tint, full round face shape with soft cheeks and defined chin, prominent high cheekbones, thick groomed dark eyebrows with slight arch, light natural makeup with subtle lip color, slight natural weight shift, plain white fitted crew-neck t-shirt with natural fabric wrinkles hugging her curves, plain straight-leg black trousers, standing relaxed facing camera, arms naturally at sides, pure seamless white studio background, single key light at 45 degrees upper left, subtle fill light from right, natural shadow under nose and chin, Canon EOS R5, 85mm f/1.4 lens, ISO 400, 1/200s shutter speed, natural color profile, no retouching, RAW unedited photograph'
  },
  {
    slug: 'modelo-foto2-v3',
    // Foto 2: cabelo preto ondulado até ombro, pele morena clara quase branca, rosto oval delicado, corpo slim elegante com cintura, pose de mão no peito
    prompt: 'Three-quarter shot from head to knees, unretouched portrait_studio_20240815_0042.CR2, young Brazilian woman, 26 years old, slim elegant body with defined waist and slight feminine curves, light beige skin with warm olive undertones, visible natural skin pores and texture, medium-length dark brown almost black hair with natural loose waves, voluminous wave pattern falling just past shoulders, individual hair strands catching studio light, dark brown almond-shaped eyes with natural iris detail and long natural lashes, straight refined nose, defined full lips with natural nude pigmentation, oval face shape with delicate refined features, slightly high cheekbones, defined jawline, naturally arched dark eyebrows, light natural makeup, plain white fitted crew-neck t-shirt with subtle natural fabric wrinkles, plain straight-leg black trousers, standing relaxed elegantly facing camera, one hand gently touching chest, slight natural weight shift, pure seamless white studio background, single key light at 45 degrees upper left, subtle fill light from right, natural shadow under nose and chin, Canon EOS R5, 85mm f/1.4 lens, ISO 400, 1/200s shutter speed, natural color profile, no retouching, RAW unedited photograph'
  },
];

async function generateModel(model) {
  console.log(`\n🎨 Gerando: ${model.slug}...`);
  try {
    const res = await fetch('https://queue.fal.run/fal-ai/flux-pro/v1.1-ultra', {
      method: 'POST',
      headers: { 'Authorization': 'Key ' + process.env.FAL_API_KEY, 'Content-Type': 'application/json' },
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
  } catch (err) { console.error(`❌`, err.message); return null; }
}

async function main() {
  console.log('🚀 Gerando v3 das 2 modelos de referência...\n');
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
