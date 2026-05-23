// Processor function para MockQueue - Photo Pipeline V3
// Extrai lógica do photo-worker.js para uso standalone
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false },
    realtime: {
      transport: ws,
    },
  }
);

const FAL_API_KEY = process.env.FAL_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function refundJob(jobId, reason) {
  console.log(`[REFUND] Job ${jobId}: ${reason}`);
  const { data: job } = await supabaseAdmin
    .from('generation_jobs')
    .select('user_id, credits_cost')
    .eq('id', jobId)
    .single();

  if (job && job.credits_cost > 0) {
    await supabaseAdmin.rpc('add_credits', {
      target_user_id: job.user_id,
      amount: job.credits_cost,
    });
  }

  await supabaseAdmin
    .from('generation_jobs')
    .update({ status: 'failed', completed_at: new Date().toISOString() })
    .eq('id', jobId);
}

async function downloadAndStore(imageUrl, userId, generationType, jobId) {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = response.headers.get('content-type') || 'image/png';
  const ext = contentType.split('/')[1] || 'png';
  const fileName = `${userId}/${generationType}/${jobId}.${ext}`;

  const { data, error } = await supabaseAdmin.storage
    .from('generations')
    .upload(fileName, buffer, { contentType, upsert: true });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: urlData } = supabaseAdmin.storage
    .from('generations')
    .getPublicUrl(fileName);

  return {
    storage_path: fileName,
    result_url: urlData.publicUrl,
    file_size_bytes: buffer.length,
    mime_type: contentType,
  };
}

// Processor function principal
async function processPhoto(job) {
  const { jobId, userId, inputs } = job.data;

  console.log(`[PHOTO PROCESSOR] Processando job ${jobId}`);

  try {
    // Atualiza status para processing
    await supabaseAdmin
      .from('generation_jobs')
      .update({ status: 'processing' })
      .eq('id', jobId);

    const { model_image, product_image, prompt_pose, prompt_scenario, aspect_ratio } = inputs;

    if (!model_image || !product_image) {
      throw new Error('model_image e product_image são obrigatórios');
    }

    // Upload do product_image para Supabase Storage
    let productImageUrl = product_image;
    if (product_image.startsWith('data:image')) {
      const base64Data = product_image.includes(',') ? product_image.split(',')[1] : product_image;
      const mimeMatch = product_image.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
      const buffer = Buffer.from(base64Data, 'base64');

      const fileName = `${userId}/photo/temp-product-${jobId}.png`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from('generations')
        .upload(fileName, buffer, { contentType: mimeType, upsert: true });

      if (uploadError) throw new Error(`Upload falhou: ${uploadError.message}`);

      const { data: urlData } = supabaseAdmin.storage
        .from('generations')
        .getPublicUrl(fileName);

      productImageUrl = urlData.publicUrl;
    }

    // Monta prompt
    const poseText = prompt_pose || 'standing naturally facing camera, arms relaxed at sides';
    const scenarioText = prompt_scenario || 'pure white studio background, professional studio lighting';
    const isVariation = !prompt_scenario;
    const editPrompt = isVariation
      ? `Fashion photography variation. Keep EXACTLY the same scene, location, background, lighting, model identity, and clothing. Only change the pose to: ${poseText}. Do not change anything else.`
      : `Fashion virtual try-on photography. Keep the exact same woman — same face, hair, skin tone, body and expression. She is now wearing the garment shown in the reference image. ${poseText}. Background: ${scenarioText}. Professional fashion photography, photorealistic, natural lighting. Do not change the person's identity.`;

    console.log(`[PROCESSOR ${jobId}] Iniciando GPT Image 2...`);

    // ETAPA 1 — GPT Image 2
    const gptRes = await fetch('https://queue.fal.run/openai/gpt-image-2/edit', {
      method: 'POST',
      headers: { 'Authorization': `Key ${FAL_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        openai_api_key: OPENAI_API_KEY,
        image_urls: [model_image, productImageUrl],
        prompt: editPrompt,
        n: 1,
        image_size: (() => {
          const sizeMap = {
            '9:16': { width: 1024, height: 1536 },
            '4:5':  { width: 1024, height: 1280 },
            '1:1':  { width: 1024, height: 1024 },
            '16:9': { width: 1536, height: 1024 },
            '3:4':  { width: 1024, height: 1365 },
          };
          return sizeMap[aspect_ratio] || { width: 1024, height: 1536 };
        })()
      })
    });

    const gptData = await gptRes.json();
    if (!gptData.request_id) {
      throw new Error(`GPT Image 2 error: ${JSON.stringify(gptData)}`);
    }

    // Atualiza external_id para rastreamento
    await supabaseAdmin
      .from('generation_jobs')
      .update({ external_id: gptData.request_id })
      .eq('id', jobId);

    // Polling GPT Image 2
    let gptImageUrl = null;
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const poll = await fetch(gptData.status_url, { headers: { 'Authorization': `Key ${FAL_API_KEY}` } });
      const result = await poll.json();
      console.log(`[PROCESSOR ${jobId}] GPT Status: ${result.status} (${(i+1)*5}s)`);

      if (result.status === 'COMPLETED') {
        const final = await (await fetch(gptData.response_url, { headers: { 'Authorization': `Key ${FAL_API_KEY}` } })).json();
        gptImageUrl = final.images?.[0]?.url || final.image?.url;
        break;
      }
      if (result.status === 'FAILED') {
        throw new Error('GPT Image 2 falhou');
      }
    }

    if (!gptImageUrl) {
      throw new Error('GPT Image 2 timeout');
    }

    console.log(`[PROCESSOR ${jobId}] Iniciando Clarity Upscaler...`);

    // ETAPA 2 — Clarity Upscaler
    const clarityRes = await fetch('https://queue.fal.run/fal-ai/clarity-upscaler', {
      method: 'POST',
      headers: { 'Authorization': `Key ${FAL_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: gptImageUrl,
        scale: 2,
        prompt: 'photorealistic fashion photography, visible natural skin pores, subtle skin imperfections, individual hair strands, real fabric texture, natural lighting, Canon EOS R5, unretouched RAW photograph',
        negative_prompt: 'plastic skin, smooth skin, artificial, airbrushed, retouched, fake, CGI',
        creativity: 0.55,
        resemblance: 0.9,
        num_inference_steps: 20
      })
    });

    const clarityData = await clarityRes.json();
    let finalImageUrl = gptImageUrl;

    if (clarityData.request_id) {
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 5000));
        const poll = await fetch(clarityData.status_url, { headers: { 'Authorization': `Key ${FAL_API_KEY}` } });
        const result = await poll.json();
        console.log(`[PROCESSOR ${jobId}] Clarity Status: ${result.status} (${(i+1)*5}s)`);

        if (result.status === 'COMPLETED') {
          const final = await (await fetch(clarityData.response_url, { headers: { 'Authorization': `Key ${FAL_API_KEY}` } })).json();
          finalImageUrl = final.image?.url || gptImageUrl;
          break;
        }
        if (result.status === 'FAILED') {
          console.warn(`[PROCESSOR ${jobId}] Clarity falhou — usando GPT Image 2 como fallback`);
          break;
        }
      }
    }

    console.log(`[PROCESSOR ${jobId}] Fazendo download e upload para Storage...`);

    // Download e armazenamento
    const result = await downloadAndStore(finalImageUrl, userId, 'photo', jobId);

    // Marca job como completed
    await supabaseAdmin.from('generation_jobs').update({
      status: 'completed',
      result_url: result.result_url,
      storage_path: result.storage_path,
      file_size_bytes: result.file_size_bytes,
      mime_type: result.mime_type,
      completed_at: new Date().toISOString(),
    }).eq('id', jobId);

    console.log(`[PROCESSOR ${jobId}] ✅ Concluído com sucesso`);

    return { success: true, result_url: result.result_url };

  } catch (err) {
    console.error(`[PROCESSOR ${jobId}] ❌ Erro:`, err.message);
    await refundJob(jobId, err.message);
    throw err;
  }
}

module.exports = processPhoto;
