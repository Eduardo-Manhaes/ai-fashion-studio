require('dotenv').config();

const REGEN = [
  {
    slug: 'camila',
    prompt: 'Hyperrealistic photography, full body shot, young Brazilian white woman, 22 years old, slim body, long straight dark brown hair with natural shine and individual strands visible, warm honey-brown eyes with visible iris detail and natural reflections, light golden skin with visible pores, subtle skin texture, natural slight imperfections, small straight nose with natural skin texture, full lips with natural lip lines, high cheekbones, oval face, absolutely no makeup, wearing plain white fitted crew-neck t-shirt and plain straight-leg black trousers, white sneakers, standing naturally upright facing camera, arms relaxed at sides, pure seamless white background, soft diffused natural studio lighting, 85mm f/1.8 lens, ultra sharp focus, Canon EOS R5, RAW photo style, skin texture visible, hair texture visible, ultra photorealistic, not AI generated, real photography'
  },
  {
    slug: 'beatriz',
    prompt: 'Hyperrealistic photography, full body shot, young Brazilian white woman, 26 years old, slim body, medium-length wavy blonde hair with natural beach texture, individual hair strands visible, light brown eyes with natural iris detail, fair skin with warm rosy undertones, visible natural pores on nose and cheeks, delicate freckles on nose bridge and cheeks, natural skin imperfections, straight nose, naturally full lips, soft jawline, heart-shaped face, zero makeup, wearing plain white fitted crew-neck t-shirt and plain straight-leg black trousers, white sneakers, standing naturally upright facing camera, arms relaxed at sides, pure seamless white background, soft diffused natural studio lighting, 85mm f/1.8 lens, ultra sharp focus, Canon EOS R5, RAW photo style, ultra photorealistic, not AI generated, real photography'
  },
  {
    slug: 'aline',
    prompt: 'Hyperrealistic photography, full body shot, young Brazilian Black woman, 28 years old, slim athletic body, shoulder-length box braids with golden tips, individual braid texture visible, dark brown eyes with natural iris reflections, warm medium-dark brown skin with golden undertones, visible natural skin texture and pores, wide nose with natural skin detail, full naturally dark lips with lip line detail, strong jawline, oval face, minimal natural look, wearing plain white fitted crew-neck t-shirt and plain straight-leg black trousers, white sneakers, standing naturally upright facing camera, arms relaxed at sides, pure seamless white background, soft diffused natural studio lighting, 85mm f/1.8 lens, ultra sharp focus, Canon EOS R5, RAW photo style, ultra photorealistic, not AI generated, real photography'
  },
  {
    slug: 'larissa',
    prompt: 'Hyperrealistic photography, full body shot, young Brazilian white woman, 29 years old, plus size curvy body with natural fullness, generous bust and hips, natural belly, full arms, long straight black hair with natural shine, individual strands visible, dark brown eyes with natural reflections, light skin with neutral undertones, visible natural skin pores and texture, button nose, defined full lips, square jaw, round face, natural no-makeup look, wearing plain white fitted crew-neck t-shirt and plain straight-leg black trousers that fit naturally on her curves, white sneakers, standing naturally upright facing camera, arms relaxed at sides, pure seamless white background, soft diffused natural studio lighting, 85mm f/1.8 lens, ultra sharp focus, Canon EOS R5, RAW photo style, body positive, ultra photorealistic, not AI generated, real photography'
  },
  {
    slug: 'bruna',
    prompt: 'Hyperrealistic photography, full body shot, young Brazilian Black woman, 25 years old, plus size full figured body with beautiful natural curves, generous bust, full hips and thighs, soft natural belly, long goddess locs hairstyle with natural hair texture visible, dark brown eyes with natural iris detail and lashes, deep chocolate brown skin with warm golden undertones, visible natural skin texture, pores, natural skin luminosity, wide flat nose with skin detail, full naturally dark lips, round full face with prominent cheekbones and soft cheeks, natural no-makeup look, wearing plain white fitted crew-neck t-shirt and plain straight-leg black trousers that fit naturally on her curves, white sneakers, standing naturally upright facing camera, arms relaxed at sides, pure seamless white background, soft diffused natural studio lighting, 85mm f/1.8 lens, ultra sharp focus, Canon EOS R5, RAW photo style, body positive, ultra photorealistic, not AI generated, real photography'
  },
  {
    slug: 'tatiane',
    prompt: 'Hyperrealistic photography, full body shot, young Brazilian Black woman, 27 years old, plus size curvy body with natural fullness, large bust and full rounded hips, soft belly, short natural 4C coily hair with individual curl texture visible, deep dark brown eyes with natural lashes and iris detail, very dark ebony skin with blue-black undertones, visible natural skin texture and luminosity, broad nose with natural skin detail, full dark lips with natural pigmentation, oval full face with strong cheekbones, natural glowing skin no-makeup, wearing plain white fitted crew-neck t-shirt and plain straight-leg black trousers that fit naturally on her curves, white sneakers, standing naturally upright facing camera, arms relaxed at sides, pure seamless white background, soft diffused natural studio lighting, 85mm f/1.8 lens, ultra sharp focus, Canon EOS R5, RAW photo style, body positive, ultra photorealistic, not AI generated, real photography'
  },
  {
    slug: 'sandra',
    prompt: 'Hyperrealistic photography, full body shot, mature elegant Brazilian white woman, 55 years old, slim toned body, short pixie cut silver-gray hair with natural texture and individual strands visible, light blue-gray eyes with natural iris detail and mature crow feet lines, fair skin with natural visible age lines, laugh lines, subtle age spots, forehead lines that add character and dignity, soft facial structure, thin lips with natural aging lines, slim straight nose with skin texture, oval mature face, light sophisticated makeup with subtle foundation, wearing plain white fitted crew-neck t-shirt and plain straight-leg black trousers, white sneakers, standing naturally elegant upright facing camera, arms relaxed at sides, pure seamless white background, soft diffused natural studio lighting, 85mm f/1.8 lens, ultra sharp focus, Canon EOS R5, RAW photo style, natural aging, ultra photorealistic, not AI generated, real photography'
  },
];

async function generateModel(model) {
  console.log(`\n🎨 Regenerando: ${model.slug}...`);

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
        num_inference_steps: 35,
        guidance_scale: 3.5,
        enable_safety_checker: false,
        raw: true
      })
    });

    const data = await res.json();
    if (!data.request_id) {
      console.error(`❌ ${model.slug}:`, JSON.stringify(data));
      return null;
    }

    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 6000));
      const poll = await fetch(data.status_url, {
        headers: { 'Authorization': 'Key ' + process.env.FAL_API_KEY }
      });
      const result = await poll.json();

      if (result.status === 'COMPLETED') {
        const final = await fetch(data.response_url, {
          headers: { 'Authorization': 'Key ' + process.env.FAL_API_KEY }
        });
        const finalData = await final.json();
        const url = finalData.images?.[0]?.url;
        console.log(`✅ ${model.slug}: ${url}`);
        return { slug: model.slug, url };
      }

      if (result.status === 'FAILED') {
        console.error(`❌ ${model.slug}: Falhou`);
        return null;
      }

      process.stdout.write('.');
    }

    console.error(`❌ ${model.slug}: Timeout`);
    return null;

  } catch (err) {
    console.error(`❌ ${model.slug}:`, err.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Regenerando 7 modelos com prompts aprimorados...');
  console.log('💰 Custo estimado: ~$0.42\n');

  const results = [];
  for (const model of REGEN) {
    const result = await generateModel(model);
    if (result) results.push(result);
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log('\n\n📋 SQL para atualizar no Supabase:');
  console.log('=====================================');
  results.forEach(r => {
    console.log(`UPDATE preset_models SET reference_url = '${r.url}' WHERE slug = '${r.slug}';`);
  });
  console.log(`\n✅ ${results.length}/7 regeneradas`);
}

main().catch(console.error);
