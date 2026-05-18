// Worker para processar vídeos em background
require('dotenv').config();

const { Worker } = require('bullmq');
const { createClient } = require('@supabase/supabase-js');
const { redisConfig } = require('../queues/photo-queue');

// SSL fix
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const FAL_API_KEY = process.env.FAL_API_KEY;

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

async function downloadAndStore(videoUrl, userId, generationType, jobId) {
  const response = await fetch(videoUrl);
  if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = response.headers.get('content-type') || 'video/mp4';
  const ext = 'mp4';
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

// Worker processor
const videoWorker = new Worker(
  'video-generation',
  async (job) => {
    const { jobId, userId, provider, inputs } = job.data;

    console.log(`[VIDEO WORKER] Processando job ${jobId} (${provider})`);

    try {
      // Atualiza status para processing
      await supabaseAdmin
        .from('generation_jobs')
        .update({ status: 'processing' })
        .eq('id', jobId);

      let requestId, statusUrl, resultUrl;

      if (provider === 'kling') {
        // KLING VIDEO
        const falBody = {
          image_url: inputs.image_url,
          prompt: inputs.prompt || '',
          duration: inputs.duration === '10' ? '10' : '5', // API aceita apenas 5 ou 10
          aspect_ratio: inputs.aspect_ratio || '9:16',
        };

        if (inputs.end_image_url) {
          falBody.tail_image_url = inputs.end_image_url;
        }

        console.log(`[WORKER ${jobId}] Iniciando Kling...`);

        const submitRes = await fetch(
          'https://queue.fal.run/fal-ai/kling-video/v2.6/pro/image-to-video',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Key ${FAL_API_KEY}`,
            },
            body: JSON.stringify(falBody),
          }
        );

        const submitData = await submitRes.json();
        if (!submitRes.ok || !submitData.request_id) {
          throw new Error(submitData.detail || 'Erro ao iniciar Kling');
        }

        requestId = submitData.request_id;
        statusUrl = `https://queue.fal.run/fal-ai/kling-video/requests/${requestId}/status`;
        resultUrl = `https://queue.fal.run/fal-ai/kling-video/requests/${requestId}`;

      } else if (provider === 'veo') {
        // VEO 3 VIDEO
        const veoBody = {
          image_url: inputs.image_url,
          prompt: inputs.prompt || '',
          duration: inputs.duration === '10' ? '10' : '5', // API aceita apenas 5 ou 10
          aspect_ratio: inputs.aspect_ratio || '9:16',
        };

        console.log(`[WORKER ${jobId}] Iniciando Veo 3...`);

        const submitRes = await fetch(
          'https://queue.fal.run/fal-ai/veo3.1/fast/image-to-video',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Key ${FAL_API_KEY}`,
            },
            body: JSON.stringify(veoBody),
          }
        );

        const submitData = await submitRes.json();
        if (!submitRes.ok || !submitData.request_id) {
          throw new Error(submitData.detail || 'Erro ao iniciar Veo');
        }

        requestId = submitData.request_id;
        statusUrl = `https://queue.fal.run/fal-ai/veo3.1/requests/${requestId}/status`;
        resultUrl = `https://queue.fal.run/fal-ai/veo3.1/requests/${requestId}`;

      } else {
        throw new Error(`Provider inválido: ${provider}`);
      }

      // Atualiza external_id
      await supabaseAdmin
        .from('generation_jobs')
        .update({ external_id: requestId })
        .eq('id', jobId);

      console.log(`[WORKER ${jobId}] Polling ${provider} (request_id: ${requestId})...`);

      // Polling (até 20 minutos para vídeos)
      let videoUrl = null;
      const maxAttempts = provider === 'veo' ? 120 : 80; // Veo pode demorar mais

      for (let i = 0; i < maxAttempts; i++) {
        await new Promise(r => setTimeout(r, 10000)); // 10s entre checks

        const poll = await fetch(statusUrl, {
          headers: { 'Authorization': `Key ${FAL_API_KEY}` }
        });

        const result = await poll.json();
        console.log(`[WORKER ${jobId}] ${provider} Status: ${result.status} (${(i+1)*10}s)`);

        if (result.status === 'COMPLETED') {
          const final = await (await fetch(resultUrl, {
            headers: { 'Authorization': `Key ${FAL_API_KEY}` }
          })).json();

          // Debug: ver estrutura da resposta
          console.log(`[WORKER ${jobId}] Resposta final:`, JSON.stringify(final).substring(0, 200));

          // Extrai URL do vídeo (múltiplos formatos possíveis)
          videoUrl = final.video?.url
                  || final.output?.url
                  || final.data?.video?.url
                  || (Array.isArray(final.output) && final.output[0]?.url)
                  || (Array.isArray(final.output) && final.output[0]);

          if (videoUrl) {
            console.log(`[WORKER ${jobId}] ✅ URL do vídeo encontrada`);
            break;
          } else {
            console.log(`[WORKER ${jobId}] ⚠️ URL não encontrada na resposta`);
          }
        }

        if (result.status === 'FAILED') {
          throw new Error(`${provider} falhou`);
        }

        // A cada minuto, atualiza o banco para mostrar que está vivo
        if (i % 6 === 0) {
          await supabaseAdmin
            .from('generation_jobs')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', jobId);
        }
      }

      if (!videoUrl) {
        throw new Error(`${provider} timeout`);
      }

      console.log(`[WORKER ${jobId}] Download e upload para Storage...`);

      // Download e armazenamento
      const generationType = provider === 'kling' ? 'video_movement' : 'video_talking';
      const result = await downloadAndStore(videoUrl, userId, generationType, jobId);

      // Marca job como completed
      await supabaseAdmin.from('generation_jobs').update({
        status: 'completed',
        result_url: result.result_url,
        storage_path: result.storage_path,
        file_size_bytes: result.file_size_bytes,
        mime_type: result.mime_type,
        completed_at: new Date().toISOString(),
      }).eq('id', jobId);

      console.log(`[WORKER ${jobId}] ✅ Vídeo concluído`);

      return { success: true, result_url: result.result_url };

    } catch (err) {
      console.error(`[WORKER ${jobId}] ❌ Erro:`, err.message);
      await refundJob(jobId, err.message);
      throw err;
    }
  },
  {
    connection: redisConfig,
    concurrency: 2, // Vídeos são pesados, menos concorrência
    limiter: {
      max: 5, // Máximo 5 vídeos por minuto
      duration: 60000,
    },
  }
);

// Event handlers
videoWorker.on('completed', (job, result) => {
  console.log(`[VIDEO WORKER] Job ${job.id} completado:`, result);
});

videoWorker.on('failed', (job, err) => {
  console.error(`[VIDEO WORKER] Job ${job?.id} falhou:`, err.message);
});

videoWorker.on('error', (err) => {
  console.error('[VIDEO WORKER] Erro no worker:', err);
});

console.log('🚀 Video Worker iniciado e aguardando jobs...');
console.log(`📊 Concorrência: 2 | Rate limit: 5 jobs/min`);
