// ===== AI Fashion Studio — Server =====
require('dotenv').config();

// Configuração SSL
if (process.env.NODE_ENV === 'production') {
  // Produção: não precisa win-ca (Vercel usa Linux com certificados CA do sistema)
  console.log('[SSL] Produção: usando certificados CA do sistema');
} else {
  // Desenvolvimento: tenta win-ca, se falhar usa bypass temporário
  try {
    require('win-ca/api');
    console.log('[SSL] Certificados CA do Windows carregados');
  } catch (err) {
    // Fallback: desabilita verificação SSL em desenvolvimento
    // TEMPORÁRIO: para permitir conexão com Supabase durante desenvolvimento
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    console.warn('[SSL] ⚠️  Verificação TLS desabilitada (somente desenvolvimento)');
    console.warn('      Instale win-ca ou use certificados válidos em produção');
  }
}

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// ===== FASE 3: Sistema Inteligente de Job Queues =====
// Detecta Redis com teste real de conexão — fallback automático para MockQueue

let photoQueue, videoQueue;

async function initQueues() {
  const REDIS_URL = process.env.REDIS_URL ||
    (process.env.REDIS_HOST && process.env.REDIS_HOST !== 'localhost'
      ? `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT || 6379}`
      : null);

  if (REDIS_URL) {
    try {
      // Testa conexão real com Redis antes de carregar BullMQ
      const Redis = require('ioredis');
      const testClient = new Redis(REDIS_URL, {
        connectTimeout: 3000,
        maxRetriesPerRequest: 1,
        lazyConnect: true,
      });

      await testClient.connect();
      await testClient.ping();
      await testClient.quit();

      // Redis respondeu — usa BullMQ
      const { photoQueue: pq } = require('./queues/photo-queue');
      const { videoQueue: vq } = require('./queues/video-queue');
      photoQueue = pq;
      videoQueue = vq;
      console.log('✅ BullMQ ativo (Redis conectado)');
      console.log('⚠️  IMPORTANTE: Inicie os workers com: npm run workers');
    } catch (err) {
      console.warn(`⚠️  Redis indisponível (${err.message}) — usando MockQueue`);
      useMockQueue();
    }
  } else {
    console.warn('⚠️  REDIS_URL não configurado — usando MockQueue (modo desenvolvimento)');
    useMockQueue();
  }
}

function useMockQueue() {
  const mock = require('./queues/mock-queue');
  photoQueue = mock.photoQueue;
  videoQueue = mock.videoQueue;

  // Registra processadores inline para MockQueue
  const photoProcessorFn = require('./workers/photo-worker-fn');
  const videoProcessorFn = require('./workers/video-worker-fn');

  photoQueue.setProcessor(photoProcessorFn);
  videoQueue.setProcessor(videoProcessorFn);

  console.log('✅ MockQueue ativo com processors inline');
  console.log('   Jobs processam automaticamente em background (sem workers separados)');
}

const app = express();
const PORT = process.env.PORT || 3000;

// ===== FASE 2: Segurança =====
// Helmet - Headers de segurança
app.use(helmet({
  contentSecurityPolicy: false, // Desabilitado para permitir inline scripts (ajuste conforme necessário)
}));

// CORS - Permitir requisições de origens específicas
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Origem não permitida por CORS'));
    }
  },
  credentials: true
}));

// Trust proxy - Railway usa reverse proxy (Nginx)
// Necessário para express-rate-limit ler corretamente o X-Forwarded-For
app.set('trust proxy', 1);

// Rate Limiting - Proteção contra abuso
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // 300 requests por IP (aumentado para suportar polling de variações)
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 tentativas de login
  message: 'Muitas tentativas de autenticação, tente novamente em 15 minutos.'
});

const generationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 gerações por minuto por IP
  message: 'Limite de gerações atingido, aguarde 1 minuto.'
});

// Aplica rate limiting global
app.use('/api/', limiter);

// ===== Config =====
// FASHN.ai — Geração de fotos (já existente)
const FASHN_API_KEY = process.env.FASHN_API_KEY;
const FASHN_BASE_URL = 'https://api.fashn.ai/v1';

// Fal.ai — Vídeos (Kling para movimento + Veo 3 para fala)
// Crie sua conta em: https://fal.ai → Dashboard → API Keys
const FAL_API_KEY = process.env.FAL_API_KEY;

// ===== GOOGLE AI STUDIO NÃO MAIS USADO =====
// Veo 3 foi migrado para Fal.ai (sem limites de quota 429)
// const GOOGLE_AI_KEY = process.env.GOOGLE_AI_KEY;
// const GOOGLE_AI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

// ===== Validação de Configuração =====
const requiredEnvs = ['FASHN_API_KEY', 'FAL_API_KEY'];
const missing = requiredEnvs.filter(k => !process.env[k]);
if (missing.length > 0) {
  console.error('❌ Variáveis de ambiente faltando:', missing.join(', '));
  console.error('Crie um arquivo .env baseado em .env.example');
  process.exit(1);
}

// Stripe — opcionais até Fase 1F
const stripeOptional = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'];
const missingStripe = stripeOptional.filter(k => !process.env[k]);
if (missingStripe.length > 0) {
  console.warn('[STRIPE] Variáveis Stripe ausentes. Funcionalidades de cobrança desabilitadas até Fase 1F.');
}

// ===== Middleware =====
// ===================================================================
// Stripe webhook — DEVE vir antes do express.json() pra ter raw body
// ===================================================================
const stripeWebhookRouter = require('./routes/stripe-webhook');
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhookRouter);

app.use(express.json({ limit: '50mb' }));

// Outras rotas Stripe (que usam JSON normal)
const stripeRouter = require('./routes/stripe');
app.use('/api/stripe', stripeRouter);

app.use(express.static(path.join(__dirname, 'public')));

// ===== Utilitário: Limpar prefixo Base64 =====
const getCleanBase64 = (b64) =>
  b64 && b64.includes(',') ? b64.split(',')[1] : b64;

const { requireAuth, optionalAuth, requireAdmin, supabaseAdmin } = require('./middleware/auth');
const { requireCredits, refundJob, markJobProcessing } = require('./middleware/quota');
const { downloadAndStore, storeFromBase64, getSignedUrl } = require('./lib/storage');

// Admin routes (protegidas com requireAuth + requireAdmin)
const adminRouter = require('./routes/admin');
app.use('/api/admin', requireAuth, requireAdmin, adminRouter);

// Config pública para o frontend (não inclui service_role)
app.get('/api/public-config', (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600');
  res.json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  });
});

// Admin panel UI (served at /admin)
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Modelos preset — retorna todas as modelos ativas ordenadas
app.get('/api/preset-models', optionalAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('preset_models')
      .select('id, name, slug, gender, ethnicity, body_type, age_group, age_range, reference_url, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    res.json({ models: data });
  } catch (err) {
    console.error('[PRESET-MODELS] Erro:', err.message);
    res.status(500).json({ error: 'Erro ao buscar modelos' });
  }
});

// Rota de teste — retorna info do usuário autenticado e estado da cota
app.get('/api/me', requireAuth, async (req, res) => {
  try {
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*, plans(*)')
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .single();

    const { data: quota } = subscription ? await supabaseAdmin
      .from('quota_usage')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('period_start', subscription.current_period_start)
      .maybeSingle() : { data: null };

    const { data: packs } = await supabaseAdmin
      .from('credit_packs')
      .select('credits_remaining')
      .eq('user_id', req.user.id)
      .gt('credits_remaining', 0);

    const packTotal = (packs || []).reduce((sum, p) => sum + p.credits_remaining, 0);

    res.json({
      user: req.user,
      subscription: subscription || null,
      quota: quota ? {
        used: quota.credits_used,
        limit: quota.credits_limit,
        remaining: quota.credits_limit - quota.credits_used,
        period_end: quota.period_end,
      } : null,
      pack_credits_total: packTotal,
    });
  } catch (err) {
    console.error('[/api/me] Erro:', err);
    res.status(500).json({ error: 'failed_to_fetch_user_state' });
  }
});

// ============================================================
// FOTOS — FASHN.ai
// ============================================================

// Iniciar geração de foto
app.post('/api/run-photo', generationLimiter, requireAuth, requireCredits('photo', 'fashn'), async (req, res) => {
  const job = req.generationJob;

  try {
    const response = await fetch(`${FASHN_BASE_URL}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FASHN_API_KEY}`,
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      await refundJob(job.id, `FASHN error: ${JSON.stringify(data)}`);
      return res.status(response.status).json(data);
    }
    
    if (data.id) {
      await markJobProcessing(job.id, data.id);
    }
    
    res.json({ ...data, _job_id: job.id });
  } catch (err) {
    console.error('[FASHN] Run error:', err.message);
    await refundJob(job.id, err.message);
    res.status(500).json({ error: err.message });
  }
});

// ===== PIPELINE V2: Kolors + Clarity (substitui FASHN) =====
app.post('/api/run-photo-v2', generationLimiter, requireAuth, requireCredits('photo', 'kolors'), async (req, res) => {
  const job = req.generationJob;
  try {
    const { model_image, product_image } = req.body.inputs || {};

    if (!model_image || !product_image) {
      await refundJob(job.id, 'Campos obrigatórios ausentes');
      return res.status(400).json({ error: 'model_image e product_image são obrigatórios' });
    }

    // ETAPA 1 — Kolors Virtual Try-On
    console.log('[KOLORS] Iniciando try-on...');
    const kolorsRes = await fetch('https://queue.fal.run/fal-ai/kling/v1-5/kolors-virtual-try-on', {
      method: 'POST',
      headers: { 'Authorization': `Key ${FAL_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ human_image_url: model_image, garment_image_url: product_image })
    });

    const kolorsData = await kolorsRes.json();
    if (!kolorsData.request_id) {
      await refundJob(job.id, `Kolors error: ${JSON.stringify(kolorsData)}`);
      return res.status(500).json({ error: 'Erro no Kolors Try-On' });
    }

    // Polling Kolors
    let kolorsImageUrl = null;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const poll = await fetch(kolorsData.status_url, { headers: { 'Authorization': `Key ${FAL_API_KEY}` } });
      const result = await poll.json();
      console.log(`[KOLORS] Status: ${result.status} (${(i+1)*5}s)`);
      if (result.status === 'COMPLETED') {
        const final = await (await fetch(kolorsData.response_url, { headers: { 'Authorization': `Key ${FAL_API_KEY}` } })).json();
        kolorsImageUrl = final.image?.url || final.images?.[0]?.url || final.output?.[0];
        break;
      }
      if (result.status === 'FAILED') {
        await refundJob(job.id, 'Kolors falhou');
        return res.status(500).json({ error: 'Kolors falhou' });
      }
    }

    if (!kolorsImageUrl) {
      await refundJob(job.id, 'Kolors timeout');
      return res.status(500).json({ error: 'Timeout no Kolors' });
    }

    // ETAPA 2 — Clarity Upscaler (creativity 0.55 aprovado em testes)
    console.log('[CLARITY] Iniciando upscale...');
    const clarityRes = await fetch('https://queue.fal.run/fal-ai/clarity-upscaler', {
      method: 'POST',
      headers: { 'Authorization': `Key ${FAL_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: kolorsImageUrl,
        scale: 2,
        prompt: 'photorealistic fashion photography, visible natural skin pores, subtle skin imperfections, individual hair strands, real fabric texture, natural lighting, Canon EOS R5, unretouched RAW photograph',
        negative_prompt: 'plastic skin, smooth skin, artificial, airbrushed, retouched, fake, CGI',
        creativity: 0.55,
        resemblance: 0.9,
        num_inference_steps: 20
      })
    });

    const clarityData = await clarityRes.json();
    let finalImageUrl = kolorsImageUrl; // fallback

    if (clarityData.request_id) {
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 5000));
        const poll = await fetch(clarityData.status_url, { headers: { 'Authorization': `Key ${FAL_API_KEY}` } });
        const result = await poll.json();
        console.log(`[CLARITY] Status: ${result.status} (${(i+1)*5}s)`);
        if (result.status === 'COMPLETED') {
          const final = await (await fetch(clarityData.response_url, { headers: { 'Authorization': `Key ${FAL_API_KEY}` } })).json();
          finalImageUrl = final.image?.url || final.images?.[0]?.url || kolorsImageUrl;
          break;
        }
        if (result.status === 'FAILED') {
          console.warn('[CLARITY] Falhou — usando imagem Kolors como fallback');
          break;
        }
      }
    } else {
      console.warn('[CLARITY] Submit falhou — usando imagem Kolors como fallback');
    }

    await markJobProcessing(job.id, kolorsData.request_id);
    res.json({ output: [finalImageUrl], _job_id: job.id });

  } catch (err) {
    console.error('[PIPELINE V2] Erro:', err.message);
    await refundJob(job.id, err.message);
    res.status(500).json({ error: err.message });
  }
});

// ===== PIPELINE V3: GPT Image 2 + Clarity (pipeline definitivo) =====
// Pipeline V3 - MIGRADO PARA QUEUE SYSTEM
app.post('/api/run-photo-v3', generationLimiter, requireAuth, requireCredits('photo', 'gpt-image-2'), async (req, res) => {
  const job = req.generationJob;
  try {
    const { model_image, product_image } = req.body.inputs || {};

    if (!model_image || !product_image) {
      await refundJob(job.id, 'Campos obrigatórios ausentes');
      return res.status(400).json({ error: 'model_image e product_image são obrigatórios' });
    }

    // Adiciona job na queue
    await photoQueue.add('generate-photo', {
      jobId: job.id,
      userId: req.user.id,
      inputs: req.body.inputs,
    }, {
      jobId: job.id,
    });

    console.log(`[PHOTO QUEUE] Job ${job.id} adicionado à fila`);

    // Retorna imediatamente
    res.json({ job_id: job.id, status: 'processing' });

  } catch (err) {
    console.error(`[PHOTO QUEUE] Erro ao adicionar job ${job.id}:`, err.message);
    await refundJob(job.id, err.message);
    res.status(500).json({ error: err.message });
  }
});

// ===== ENDPOINT ANTIGO COMENTADO (mantido para referência) =====
/*
app.post('/api/run-photo-v3-OLD-SYNC', requireAuth, requireCredits('photo', 'gpt-image-2'), async (req, res) => {
  const job = req.generationJob;
  try {
    const { model_image, product_image, prompt_pose, prompt_scenario, aspect_ratio } = req.body.inputs || {};

    if (!model_image || !product_image) {
      await refundJob(job.id, 'Campos obrigatórios ausentes');
      return res.status(400).json({ error: 'model_image e product_image são obrigatórios' });
    }

    // Upload do product_image (base64) para Supabase Storage → URL pública
    let productImageUrl = product_image;
    if (product_image.startsWith('data:image')) {
      console.log('[UPLOAD] Fazendo upload do produto para Supabase Storage...');

      // Extrai base64 e converte para buffer
      const base64Data = product_image.includes(',') ? product_image.split(',')[1] : product_image;
      const mimeMatch = product_image.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
      const buffer = Buffer.from(base64Data, 'base64');

      // Upload com URL pública (não expira)
      const fileName = `${req.user.id}/photo/temp-product-${job.id}.png`;
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('generations')
        .upload(fileName, buffer, { contentType: mimeType, upsert: true });

      if (uploadError) throw new Error(`Upload falhou: ${uploadError.message}`);

      const { data: urlData } = supabaseAdmin.storage
        .from('generations')
        .getPublicUrl(fileName);

      productImageUrl = urlData.publicUrl;
    }

    // Monta prompt combinando pose e cenário
    const poseText = prompt_pose || 'standing naturally facing camera, arms relaxed at sides';
    const scenarioText = prompt_scenario || 'pure white studio background, professional studio lighting';

    // ⚠️ CRÍTICO: Detecção de variação vs geração inicial
    // Se prompt_scenario === null → VARIAÇÃO (preserva tudo exceto pose)
    // Se prompt_scenario !== null → GERAÇÃO INICIAL (nova modelo+roupa+cenário)
    const isVariation = !prompt_scenario;
    const editPrompt = isVariation
      ? `Fashion photography variation. Keep EXACTLY the same scene, location, background, lighting, model identity, and clothing. Only change the pose to: ${poseText}. Do not change anything else.`
      : `Fashion virtual try-on photography. Keep the exact same woman — same face, hair, skin tone, body and expression. She is now wearing the garment shown in the reference image. ${poseText}. Background: ${scenarioText}. Professional fashion photography, photorealistic, natural lighting. Do not change the person's identity.`;

    console.log('[GPT-IMAGE-2] Iniciando geração...');

    // ETAPA 1 — GPT Image 2 via Fal.ai
    // ⚠️ PAYLOAD CRÍTICO - Testado e validado em 2026-05-13
    const gptRes = await fetch('https://queue.fal.run/openai/gpt-image-2/edit', {
      method: 'POST',
      headers: { 'Authorization': `Key ${FAL_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // ⚠️ BYOK obrigatório - sem isso retorna 403 "Exhausted balance"
        openai_api_key: process.env.OPENAI_API_KEY,

        // ⚠️ Ordem importa: [modelo, produto]
        // Em variações: model_image = foto já gerada (state.resultImageUrl)
        image_urls: [model_image, productImageUrl],

        // ⚠️ Prompt diferenciado por isVariation (ver acima)
        prompt: editPrompt,

        n: 1,

        // ⚠️ DEVE ser objeto {width, height} - NÃO usar string '1024x1280'
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
      await refundJob(job.id, `GPT Image 2 error: ${JSON.stringify(gptData)}`);
      return res.status(500).json({ error: 'Erro no GPT Image 2' });
    }

    // Polling GPT Image 2
    let gptImageUrl = null;
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const poll = await fetch(gptData.status_url, { headers: { 'Authorization': `Key ${FAL_API_KEY}` } });
      const result = await poll.json();
      console.log(`[GPT-IMAGE-2] Status: ${result.status} (${(i+1)*5}s)`);
      if (result.status === 'COMPLETED') {
        const final = await (await fetch(gptData.response_url, { headers: { 'Authorization': `Key ${FAL_API_KEY}` } })).json();
        gptImageUrl = final.images?.[0]?.url || final.image?.url;
        console.log('[GPT-IMAGE-2] Concluído. URL:', gptImageUrl ? 'OK' : 'undefined');
        break;
      }
      if (result.status === 'FAILED') {
        await refundJob(job.id, 'GPT Image 2 falhou');
        return res.status(500).json({ error: 'GPT Image 2 falhou' });
      }
    }

    if (!gptImageUrl) {
      await refundJob(job.id, 'GPT Image 2 timeout');
      return res.status(500).json({ error: 'Timeout no GPT Image 2' });
    }

    // ETAPA 2 — Clarity Upscaler (creativity 0.55 aprovado)
    console.log('[CLARITY] Iniciando upscale...');
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
        console.log(`[CLARITY] Status: ${result.status} (${(i+1)*5}s)`);
        if (result.status === 'COMPLETED') {
          const final = await (await fetch(clarityData.response_url, { headers: { 'Authorization': `Key ${FAL_API_KEY}` } })).json();
          finalImageUrl = final.image?.url || gptImageUrl;
          break;
        }
        if (result.status === 'FAILED') {
          console.warn('[CLARITY] Falhou — usando GPT Image 2 como fallback');
          break;
        }
      }
    }

    // Persiste resultado no Supabase Storage e marca job como completed
    await markJobProcessing(job.id, gptData.request_id);

    const result = await downloadAndStore(finalImageUrl, req.user.id, 'photo', job.id);

    await supabaseAdmin.from('generation_jobs').update({
      status: 'completed',
      result_url: result.result_url,
      storage_path: result.storage_path,
      file_size_bytes: result.file_size_bytes,
      mime_type: result.mime_type,
      completed_at: new Date().toISOString(),
      input_payload: req.body,
    }).eq('id', job.id);

    res.json({ output: [result.result_url], _job_id: job.id });

  } catch (err) {
    console.error('[PIPELINE V3] Erro:', err.message);
    await refundJob(job.id, err.message);
    res.status(500).json({ error: err.message });
  }
});

*/

// Pipeline V3 ASSÍNCRONO — adiciona job na queue
app.post('/api/run-photo-v3-async', requireAuth, requireCredits('photo', 'gpt-image-2'), async (req, res) => {
  const job = req.generationJob;

  try {
    // Valida inputs
    const { model_image, product_image } = req.body.inputs || {};
    if (!model_image || !product_image) {
      await refundJob(job.id, 'model_image e product_image são obrigatórios');
      return res.status(400).json({ error: 'model_image e product_image são obrigatórios' });
    }

    // Adiciona job na queue
    await photoQueue.add('generate-photo', {
      jobId: job.id,
      userId: req.user.id,
      inputs: req.body.inputs,
    }, {
      jobId: job.id, // Usa o mesmo ID para evitar duplicatas
    });

    console.log(`[PHOTO QUEUE] Job ${job.id} adicionado à fila`);

    // Retorna imediatamente
    res.json({ job_id: job.id, status: 'processing' });

  } catch (err) {
    console.error(`[PHOTO QUEUE] Erro ao adicionar job ${job.id}:`, err.message);
    await refundJob(job.id, err.message);
    res.status(500).json({ error: err.message });
  }
});

// Polling de status — FASHN
app.get('/api/status/fashn/:id', requireAuth, async (req, res) => {
  try {
    const response = await fetch(`${FASHN_BASE_URL}/status/${req.params.id}`, {
      headers: { 'Authorization': `Bearer ${FASHN_API_KEY}` },
    });
    const data = await response.json();
    
    // FASE 1C: Persistir no Storage se completou
    if (data.status === 'completed' && data.output && Array.isArray(data.output) && data.output.length > 0) {
      const userId = req.user?.id; // Nota: atualmente não há auth nessas rotas, então será undefined
      
      if (userId) {
        try {
          const { data: job } = await supabaseAdmin
            .from('generation_jobs')
            .select('id')
            .eq('provider_job_id', req.params.id)
            .eq('user_id', userId)
            .maybeSingle();

          const jobId = job?.id || `unsaved-${Date.now()}`;
          const result = await downloadAndStore(data.output[0], userId, 'photo', jobId);

          if (job) {
            await supabaseAdmin.from('generation_jobs').update({
              status: 'completed',
              result_url: result.result_url,
              storage_path: result.storage_path,
              file_size_bytes: result.file_size_bytes,
              mime_type: result.mime_type,
              completed_at: new Date().toISOString(),
            }).eq('id', job.id);
          }

          data.output = [result.result_url, ...data.output.slice(1)];
          data._storage = 'persisted';
        } catch (storageErr) {
          console.error('[STORAGE] Falha persistindo FASHN result:', storageErr.message);
          data._storage = 'failed_using_provider_url';
        }
      } else {
        data._storage = 'no_user_context'; // Será resolvido na Fase 1D quando plugar auth
      }
    }

    if (!response.ok) return res.status(response.status).json(data);
    res.json(data);
  } catch (err) {
    console.error('[FASHN] Status error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Créditos FASHN
app.get('/api/credits', async (req, res) => {
  try {
    const response = await fetch(`${FASHN_BASE_URL}/credits`, {
      headers: { 'Authorization': `Bearer ${FASHN_API_KEY}` },
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Compatibilidade com rota antiga (mantida para não quebrar nada)
// REMOVIDO: endpoints deprecados sem autenticação
// app.post('/api/run', ...) - FASHN legado, inseguro
// app.get('/api/status/:id', ...) - FASHN legado, inseguro
// Use /api/run-photo-v2 e /api/status/fashn/:id com autenticação

// ============================================================
// VÍDEOS — Roteamento por estilo
// ============================================================

// Vídeos - PROCESSAMENTO DIRETO (sem queue)
app.post('/api/run-video', generationLimiter, requireAuth, async (req, res, next) => {
  console.log('[VIDEO] Requisição recebida');
  console.log('[VIDEO] User:', req.user?.id);
  console.log('[VIDEO] Body:', JSON.stringify(req.body).substring(0, 200));

  const { style, inputs } = req.body;

  if (!style || !inputs) {
    console.log('[VIDEO] Erro: campos faltando');
    return res.status(400).json({ error: 'Campos "style" e "inputs" são obrigatórios.' });
  }

  let generationType, provider;
  if (style === 'movement') {
    generationType = 'video_movement';
    provider = 'kling';  // Kling para movimento (mais rápido, 2-5 min)
  } else if (style === 'talking') {
    generationType = 'video_talking';
    provider = 'veo';  // Veo 3 para fala (com áudio)
  } else {
    console.log('[VIDEO] Erro: estilo inválido:', style);
    return res.status(400).json({ error: `Estilo de vídeo inválido: "${style}". Use "movement" ou "talking".` });
  }

  console.log('[VIDEO] Provider:', provider, 'Type:', generationType);

  return requireCredits(generationType, provider)(req, res, async () => {
    const job = req.generationJob;
    try {
      console.log(`[VIDEO DIRECT] Processando job ${job.id} (${provider}) diretamente`);

      // Processa diretamente (sem queue)
      if (provider === 'kling') {
        await runKlingVideo(inputs, res, job);
      } else if (provider === 'veo') {
        await runVeoVideo(inputs, res, job);
      }

    } catch (err) {
      console.error('[VIDEO DIRECT] Erro:', err.message);
      await refundJob(job.id, err.message);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message });
      }
    }
  });
});

// ============================================================
// KLING AI via Fal.ai — Vídeos de movimento
// ============================================================

async function runKlingVideo(inputs, res, job) {
  // Fal.ai usa o modelo kling-video/v2.5/standard/image-to-video
  // Documentação: https://fal.ai/models/fal-ai/kling-video/v2.5/standard/image-to-video
  const falBody = {
    image_url: inputs.image_url,
    prompt: inputs.prompt || 'Fashion model standing naturally, subtle breathing movement, soft studio lighting, cinematic 4K, elegant and confident posture',
    negative_prompt: 'blurry, low quality, distorted face, unnatural movement, robotic motion, jerky, artifacts, watermark, text overlay',
    duration: '5',
    aspect_ratio: inputs.aspect_ratio || '9:16',
    cfg_scale: 0.5,
  };

  console.log('[KLING] Prompt (primeiros 100 chars):', falBody.prompt.substring(0, 100));
  console.log('[KLING] Negative prompt:', falBody.negative_prompt);

  // Start/End Frames para "frente → costas"
  if (inputs.end_image_url) {
    falBody.tail_image_url = inputs.end_image_url;
  }

  try {
    // Fal.ai: submeter requisição assíncrona
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

    if (!submitRes.ok) {
      console.error('[KLING] Submit error:', submitData.detail || submitData.message || 'Unknown error');
      if (job) await refundJob(job.id, submitData.detail || 'Erro ao iniciar Kling');
      return res.status(submitRes.status).json({ error: submitData.detail || 'Erro ao iniciar geração Kling.' });
    }

    // Fal.ai retorna request_id para polling
    const requestId = submitData.request_id;
    console.log(`[KLING] Started: ${requestId}`);
    if (job) await markJobProcessing(job.id, requestId);

    const response = { id: requestId, provider: 'kling', _job_id: job ? job.id : undefined };
    console.log('[KLING] Enviando resposta ao frontend:', JSON.stringify(response));
    res.json(response);

  } catch (err) {
    console.error('[KLING] Error:', err.message);
    if (job) await refundJob(job.id, err.message);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
}

// Polling de status — Kling (via Fal.ai)
app.get('/api/status/kling/:id', requireAuth, async (req, res) => {
  try {
    // URL simplificada sem versão/variante (conforme API do Fal.ai)
    const statusRes = await fetch(
      `https://queue.fal.run/fal-ai/kling-video/requests/${req.params.id}/status`,
      {
        headers: { 'Authorization': `Key ${FAL_API_KEY}` },
      }
    );

    // Lê response como texto primeiro para evitar "Unexpected end of JSON input"
    const responseText = await statusRes.text();

    // Se resposta vazia ou inválida, assume que está processando
    if (!responseText || responseText.trim() === '') {
      return res.json({ status: 'processing', output: null });
    }

    // Parse com try/catch robusto
    let statusData;
    try {
      statusData = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('[KLING] Parse error:', parseErr.message);
      return res.json({ status: 'processing', output: null });
    }

    // Normalizar para o formato padrão do nosso frontend
    let normalized = { id: req.params.id, status: 'processing', output: null, error: null };

    if (statusData.status === 'COMPLETED') {
      normalized.status = 'completed';

      // Use response_url from status (if available)
      const responseUrl = statusData.response_url;

      if (!responseUrl) {
        console.warn('[KLING] No response_url - job may have expired');
        normalized.error = { message: 'Resultado expirou ou não disponível' };
        return res.json(normalized);
      }

      // Fetch result from response_url
      const resultRes = await fetch(responseUrl, {
        headers: { 'Authorization': `Key ${FAL_API_KEY}` },
      });

      const resultData = await resultRes.json();
      console.log('[KLING] Resultado completo:', JSON.stringify(resultData, null, 2));

      // FASE 1C: Persistir no Storage
      const providerUrl = resultData.video?.url;
      let finalUrl = providerUrl;
      const userId = req.user?.id;

      if (userId && providerUrl) {
        try {
          const { data: job } = await supabaseAdmin
            .from('generation_jobs')
            .select('id')
            .eq('provider_job_id', req.params.id)
            .eq('user_id', userId)
            .maybeSingle();

          const jobId = job?.id || `unsaved-${Date.now()}`;
          const result = await downloadAndStore(providerUrl, userId, 'video_movement', jobId);

          if (job) {
            await supabaseAdmin.from('generation_jobs').update({
              status: 'completed',
              result_url: result.result_url,
              storage_path: result.storage_path,
              file_size_bytes: result.file_size_bytes,
              mime_type: result.mime_type,
              completed_at: new Date().toISOString(),
            }).eq('id', job.id);
          }

          finalUrl = result.result_url;
          normalized._storage = 'persisted';
        } catch (storageErr) {
          console.error('[STORAGE] Falha persistindo KLING result:', storageErr.message);
          normalized._storage = 'failed_using_provider_url';
        }
      } else {
        normalized._storage = 'no_user_context_or_no_url';
      }

      normalized.output = finalUrl ? [finalUrl] : [];

    } else if (statusData.status === 'FAILED' || statusData.status === 'CANCELLED') {
      normalized.status = 'failed';
      normalized.error = { message: statusData.error || 'Geração Kling falhou.' };

    } else if (statusData.status === 'IN_QUEUE') {
      normalized.status = 'in_queue';

    } else {
      normalized.status = 'processing';
    }

    res.json(normalized);
  } catch (err) {
    console.error('[KLING] Status error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// VEO 3 via Fal.ai — Vídeos com fala (text-to-video)
// ============================================================

async function runVeoVideo(inputs, res, job) {
  // Fal.ai — Veo 3 text-to-video (sem necessidade de imagem)
  // Documentação: https://fal.ai/models/fal-ai/veo3
  //
  // Migrado do Google AI Studio para Fal.ai devido a:
  //   - Sem limites de quota 429
  //   - API mais simples (não precisa converter imagem para base64)
  //   - Mesma infraestrutura do Kling (polling unificado)
  //   - Custo: ~$0.35 por vídeo de 8 segundos
  //
  const { prompt, script, duration, aspect_ratio, image_url } = inputs;

  // Prompt cinematográfico inteiramente em português para garantir PT-BR
  let finalPrompt;
  if (script || prompt) {
    const content = script || prompt;
    // Se já veio montado pelo frontend (começa com "Modelo de moda")
    // usa diretamente — o frontend já aplicou todas as variáveis dinâmicas
    finalPrompt = (content.startsWith('Modelo de moda'))
      ? content
      : `Modelo de moda brasileira em plano médio da cintura para cima, mostrando a roupa claramente. A modelo olha diretamente para a câmera e fala em português brasileiro com dicção clara e natural, lábios se movendo de forma realista e perfeitamente sincronizada, sem distorção labial, velocidade de fala pausada e normal. Tom natural e confiante: "${content}". Iluminação de estúdio profissional suave e quente, câmera estática, qualidade cinematográfica 4K.`;
  } else {
    finalPrompt = 'Modelo de moda brasileira em plano médio da cintura para cima. Cenário de loja elegante. Movimentos naturais e fluidos, expressão confiante e acessível. Iluminação suave e quente, câmera estática, qualidade cinematográfica 4K.';
  }

  const veoBody = {
    prompt: finalPrompt,
    aspect_ratio: aspect_ratio || '9:16',
    duration: '8s',
    audio_enabled: true,
  };

  // Adiciona imagem de referência apenas se disponível e válida
  if (image_url && image_url.startsWith('http')) {
    veoBody.image_url = image_url;
  }

  console.log('[VEO-FAL] Prompt (primeiros 150 chars):', finalPrompt.substring(0, 150));
  console.log('[VEO-FAL] Audio enabled:', veoBody.audio_enabled);

  try {
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

    if (!submitRes.ok) {
      console.error('[VEO-FAL] Submit error:', submitData.detail || submitData.message || 'Unknown error');
      if (job) await refundJob(job.id, submitData.detail || 'Erro ao iniciar Veo');
      return res.status(submitRes.status).json({ error: submitData.detail || 'Erro ao iniciar geração Veo.' });
    }

    // Fal.ai retorna request_id para polling (igual ao Kling)
    const requestId = submitData.request_id;
    console.log(`[VEO-FAL] Started: ${requestId}`);
    if (job) await markJobProcessing(job.id, requestId);
    res.json({ id: requestId, provider: 'veo', _job_id: job ? job.id : undefined });

  } catch (err) {
    console.error('[VEO-FAL] Error:', err.message);
    if (job) await refundJob(job.id, err.message);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
}

// Polling de status — Veo 3 (via Fal.ai)
app.get('/api/status/veo/:id', requireAuth, async (req, res) => {
  const requestId = req.params.id;

  try {
    // Estrutura idêntica ao Kling — duas requisições
    // Nota: /fast só é usado no submit, não no polling
    const statusRes = await fetch(
      `https://queue.fal.run/fal-ai/veo3.1/requests/${requestId}/status`,
      {
        headers: { 'Authorization': `Key ${FAL_API_KEY}` },
      }
    );

    // Lê response como texto primeiro para evitar "Unexpected end of JSON input"
    const responseText = await statusRes.text();

    // Se resposta vazia ou inválida, assume que está processando
    if (!responseText || responseText.trim() === '') {
      return res.json({ status: 'processing', output: null });
    }

    // Parse com try/catch robusto
    let statusData;
    try {
      statusData = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('[VEO-FAL] Parse error:', parseErr.message);
      return res.json({ status: 'processing', output: null });
    }

    // Normalizar para o formato padrão do nosso frontend
    let normalized = { id: requestId, status: 'processing', output: null, error: null };

    if (statusData.status === 'COMPLETED') {
      normalized.status = 'completed';

      // Use response_url from status (if available)
      const responseUrl = statusData.response_url;

      if (!responseUrl) {
        console.warn('[VEO] No response_url - job may have expired');
        normalized.error = { message: 'Resultado expirou ou não disponível' };
        return res.json(normalized);
      }

      // Fetch result from response_url
      const resultRes = await fetch(responseUrl, {
        headers: { 'Authorization': `Key ${FAL_API_KEY}` },
      });

      const resultData = await resultRes.json();
      console.log('[VEO] Resultado completo:', JSON.stringify(resultData, null, 2));

      // FASE 1C: Persistir no Storage
      const providerUrl = resultData.video?.url;
      let finalUrl = providerUrl;
      const userId = req.user?.id;

      if (userId && providerUrl) {
        try {
          const { data: job } = await supabaseAdmin
            .from('generation_jobs')
            .select('id')
            .eq('provider_job_id', requestId)
            .eq('user_id', userId)
            .maybeSingle();

          const jobId = job?.id || `unsaved-${Date.now()}`;
          const result = await downloadAndStore(providerUrl, userId, 'video_talking', jobId);

          if (job) {
            await supabaseAdmin.from('generation_jobs').update({
              status: 'completed',
              result_url: result.result_url,
              storage_path: result.storage_path,
              file_size_bytes: result.file_size_bytes,
              mime_type: result.mime_type,
              completed_at: new Date().toISOString(),
            }).eq('id', job.id);
          }

          finalUrl = result.result_url;
          normalized._storage = 'persisted';
        } catch (storageErr) {
          console.error('[STORAGE] Falha persistindo VEO result:', storageErr.message);
          normalized._storage = 'failed_using_provider_url';
        }
      } else {
        normalized._storage = 'no_user_context_or_no_url';
      }

      normalized.output = finalUrl ? [finalUrl] : [];

    } else if (statusData.status === 'FAILED' || statusData.status === 'CANCELLED') {
      normalized.status = 'failed';
      normalized.error = { message: statusData.error || 'Geração Veo falhou.' };

    } else if (statusData.status === 'IN_QUEUE') {
      normalized.status = 'in_queue';

    } else {
      normalized.status = 'processing';
    }

    res.json(normalized);
  } catch (err) {
    console.error('[VEO-FAL] Status error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// HISTÓRICO E REFRESH (Fase 1C)
// ============================================================

// Histórico de gerações do usuário
app.get('/api/me/generations', requireAuth, async (req, res) => {
  try {
    const { data: jobs, error } = await supabaseAdmin
      .from('generation_jobs')
      .select('id, generation_type, provider, status, credits_cost, storage_path, result_url, created_at, completed_at, expires_at, input_payload')
      .eq('user_id', req.user.id)
      .neq('status', 'deleted')  // Exclui soft-deleted
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Regera URL assinada se já expirou (heurística simples: assinada vale 1h)
    const enriched = await Promise.all(jobs.map(async (job) => {
      // Copia explícita de input_payload para garantir que não seja perdido
      const baseJob = {
        id: job.id,
        generation_type: job.generation_type,
        provider: job.provider,
        status: job.status,
        credits_cost: job.credits_cost,
        storage_path: job.storage_path,
        result_url: job.result_url,
        created_at: job.created_at,
        completed_at: job.completed_at,
        expires_at: job.expires_at,
        input_payload: job.input_payload  // Cópia explícita
      };

      if (job.storage_path && job.status === 'completed') {
        try {
          const freshUrl = await getSignedUrl(job.storage_path);
          baseJob.result_url = freshUrl;
        } catch (err) {
          console.error(`[/api/me/generations] Falha regerando URL ${job.id}:`, err.message);
        }
      }
      return baseJob;
    }));

    const responsePayload = { generations: enriched, total: enriched.length };
    res.json(responsePayload);
  } catch (err) {
    console.error('[/api/me/generations]', err);
    res.status(500).json({ error: 'failed_to_fetch_generations' });
  }
});

// TESTE: endpoint sem auth para verificar input_payload
// REMOVIDO: endpoint de debug sem autenticação
// app.get('/api/test/check-input-payload', ...) - INSEGURO, removido em produção

// Regerar URL assinada de uma geração específica
app.get('/api/generations/:id/refresh-url', requireAuth, async (req, res) => {
  try {
    const { data: job } = await supabaseAdmin
      .from('generation_jobs')
      .select('storage_path, user_id')
      .eq('id', req.params.id)
      .single();

    if (!job) return res.status(404).json({ error: 'not_found' });
    if (job.user_id !== req.user.id) return res.status(403).json({ error: 'forbidden' });
    if (!job.storage_path) return res.status(400).json({ error: 'no_storage_path' });

    const freshUrl = await getSignedUrl(job.storage_path);
    res.json({ url: freshUrl, expires_in_seconds: 3600 });
  } catch (err) {
    console.error('[/api/generations/:id/refresh-url]', err);
    res.status(500).json({ error: 'failed_to_refresh' });
  }
});

// Deletar geração (soft delete + remoção do Storage)
app.delete('/api/generations/:id', requireAuth, async (req, res) => {
  try {
    const { data: job } = await supabaseAdmin
      .from('generation_jobs')
      .select('id, user_id, storage_path, status')
      .eq('id', req.params.id)
      .single();

    if (!job) return res.status(404).json({ error: 'not_found' });
    if (job.user_id !== req.user.id) return res.status(403).json({ error: 'forbidden' });
    if (job.status === 'deleted') return res.status(400).json({ error: 'already_deleted' });

    // Soft delete no banco
    const { error: updateErr } = await supabaseAdmin
      .from('generation_jobs')
      .update({ status: 'deleted' })
      .eq('id', req.params.id);

    if (updateErr) throw updateErr;

    // Remover do Storage (se existir)
    if (job.storage_path) {
      const { deleteGeneration } = require('./lib/storage');
      await deleteGeneration(job.storage_path);
    }

    res.json({ success: true, id: req.params.id });
  } catch (err) {
    console.error('[DELETE /api/generations/:id]', err);
    res.status(500).json({ error: 'failed_to_delete' });
  }
});

// ============================================================
// LANDING PAGE - Dados públicos para página de marketing
// ============================================================
app.get('/api/landing-data', async (req, res) => {
  try {
    const [modelsRes, photosRes, videosRes] = await Promise.all([
      supabaseAdmin.from('preset_models')
        .select('slug,name,reference_url,thumbnail_url,ethnicity,body_type,age_group,gender')
        .eq('is_active', true).order('sort_order').limit(12),
      supabaseAdmin.from('generation_jobs')
        .select('id,result_url,generation_type')
        .eq('status','completed').eq('generation_type','photo')
        .not('result_url','is',null).order('created_at',{ascending:false}).limit(6),
      supabaseAdmin.from('generation_jobs')
        .select('id,result_url,generation_type,provider')
        .eq('status','completed').in('generation_type',['video_movement','video_talking'])
        .not('result_url','is',null).order('created_at',{ascending:false}).limit(2),
    ]);

    // Converter para URLs públicas (bucket agora é público)
    const videos = videosRes.data || [];
    const videosWithPublicUrls = videos.map(video => {
      try {
        // Extrair o path do storage do URL antigo
        const urlObj = new URL(video.result_url);
        const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/(?:sign\/)?(.+?)(?:\?|$)/);
        if (pathMatch) {
          const storagePath = pathMatch[1];
          // Gerar URL pública (sem expiração)
          const { data } = supabaseAdmin.storage
            .from('generations')
            .getPublicUrl(storagePath.replace('generations/', ''));

          if (data?.publicUrl) {
            return { ...video, result_url: data.publicUrl };
          }
        }
      } catch (err) {
        console.error('Erro ao gerar URL pública:', err);
      }
      return video;
    });

    res.json({
      models: modelsRes.data || [],
      photos: photosRes.data || [],
      videos: videosWithPublicUrls,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rota raiz — serve a landing page (ponto de entrada para novos usuários)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

// Rota para servir a landing page
app.get('/landing', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

// Rota para login (sem extensão .html)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// START SERVER
// ============================================================

// Inicializa queues de forma assíncrona
initQueues().catch(err => console.error('[INIT] Erro ao inicializar queues:', err));

// Exporta app para Vercel (serverless)
module.exports = app;

// Inicia servidor (Railway, local, produção tradicional)
// Detecta se está rodando no Vercel (serverless) através da variável VERCEL
if (!process.env.VERCEL) {
  const server = app.listen(PORT, async () => {
    if (process.env.NODE_ENV === 'production') {
      // Logs simplificados para produção (Railway, etc)
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
      console.log(`📦 MockQueue: ${!process.env.REDIS_URL ? 'Active' : 'Disabled'}`);
    } else {
      // Logs decorativos para desenvolvimento local
      console.log('');
      console.log('╔══════════════════════════════════════════════════════╗');
      console.log('║          ✨ AI Fashion Studio — Server V2 ✨          ║');
      console.log('╠══════════════════════════════════════════════════════╣');
      console.log(`║  Local:  http://localhost:${PORT}                      ║`);
      console.log('╠══════════════════════════════════════════════════════╣');
      console.log('║  APIs:                                               ║');
      console.log(`║  📸 Fotos (Fal.ai) → ${FAL_API_KEY !== 'COLE_SUA_FAL_API_KEY_AQUI' ? '✅ Configurada' : '⚠️  Pendente'}         ║`);
      console.log(`║  🎬 Vídeos (Kling)  → ${FAL_API_KEY !== 'COLE_SUA_FAL_API_KEY_AQUI' ? '✅ Configurada' : '⚠️  Pendente'}         ║`);
      console.log(`║  🗣️  Vídeos (Veo 3) → ${FAL_API_KEY !== 'COLE_SUA_FAL_API_KEY_AQUI' ? '✅ Configurada' : '⚠️  Pendente'}         ║`);
      console.log('╚══════════════════════════════════════════════════════╝');
      console.log('');

      // Tentar ngrok apenas em desenvolvimento
      try {
        const ngrok = require('ngrok');
        const url = await ngrok.connect(PORT);
        console.log(`🌐 Ngrok: ${url}`);
      } catch (err) {
        console.log('⚠️  Ngrok não conectou. Use http://localhost:3000');
      }

      console.log('');
    }
  });

  // Aumenta timeout para suportar polling longo (GPT Image 2 + Clarity = até 350s)
  server.timeout = 600000; // 10 minutos
  server.keepAliveTimeout = 610000; // 10min + margem
  server.headersTimeout = 620000; // 10min + margem
}
