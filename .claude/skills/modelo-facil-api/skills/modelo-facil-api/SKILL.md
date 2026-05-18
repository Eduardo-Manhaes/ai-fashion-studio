---
name: modelo-facil-api
description: >
  Padrões de backend Node.js/Express para o projeto Modelo Fácil
  (C:\Users\eduar\OneDrive\Área de Trabalho\Nova pasta\server.js).
  Use esta skill SEMPRE que trabalhar em endpoints do server.js,
  middleware de autenticação, sistema de créditos, pipelines de geração
  de imagem, ou qualquer lógica de backend deste projeto. Inclui padrões
  críticos já aprendidos em produção: tratamento de erros, estrutura de
  endpoints, integração com APIs externas (Fal.ai, OpenAI), upload para
  Supabase Storage e sistema de jobs/créditos.
---

# Modelo Fácil — Backend Node.js/Express

## Stack
- Node.js + Express
- Supabase (PostgreSQL + Storage)
- Fal.ai (FLUX, Kolors, GPT Image 2, Kling, Veo)
- OpenAI (gpt-image-1, gpt-image-2 via Fal.ai com BYOK)
- dotenv para variáveis de ambiente

## Variáveis de ambiente críticas
```
FAL_API_KEY=          # Fal.ai — todos os modelos de imagem/vídeo
OPENAI_API_KEY=       # OpenAI — necessário como BYOK no GPT Image 2 via Fal.ai
SUPABASE_URL=         # URL do projeto Supabase
SUPABASE_SERVICE_ROLE_KEY=  # Chave service role (não anon)
FASHN_API_KEY=        # FASHN.ai (legado — créditos esgotados)
```

## Estrutura de endpoint padrão

```javascript
app.post('/api/run-photo-vX', requireAuth, requireCredits('photo', 'provider-name'), async (req, res) => {
  const job = req.generationJob; // populado pelo middleware requireCredits

  try {
    const { campo1, campo2 } = req.body.inputs || {};

    if (!campo1) {
      await refundJob(job.id, 'Campo obrigatório ausente');
      return res.status(400).json({ error: 'campo1 é obrigatório' });
    }

    // ... lógica de geração ...

    await markJobProcessing(job.id, externalJobId);
    res.json({ output: [finalImageUrl], _job_id: job.id });

  } catch (err) {
    console.error('[PIPELINE] Erro:', err.message);
    await refundJob(job.id, err.message);
    res.status(500).json({ error: err.message });
  }
});
```

## Sistema de créditos (middleware/quota.js)
- `requireCredits(generationType, provider)` — debita crédito antes de processar
- `refundJob(jobId, errorMessage)` — estorna crédito em caso de erro
- `markJobProcessing(jobId, providerJobId)` — marca job como processando
- `markJobCompleted(jobId, resultUrl)` — marca job como concluído
- Status codes: 401 (não autenticado), 402 (sem créditos), 500 (erro interno)

## Upload para Supabase Storage — URL PÚBLICA (padrão correto)

```javascript
// CORRETO — URL pública permanente (necessário para APIs externas como GPT Image 2)
const base64Data = product_image.includes(',') ? product_image.split(',')[1] : product_image;
const mimeMatch = product_image.match(/^data:(image\/\w+);base64,/);
const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
const fileName = `${req.user.id}/photo/temp-product-${job.id}.png`;
const buffer = Buffer.from(base64Data, 'base64');

const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
  .from('generations')
  .upload(fileName, buffer, { contentType: mimeType, upsert: true });

if (uploadError) throw new Error(`Upload falhou: ${uploadError.message}`);

const { data: urlData } = supabaseAdmin.storage
  .from('generations')
  .getPublicUrl(fileName);

const publicUrl = urlData.publicUrl;
```

**ATENÇÃO:** O bucket `generations` DEVE ser público. URLs assinadas (`/sign/...?token=...`) expiram e não funcionam com APIs externas. Sempre usar `getPublicUrl`.

## Padrão de polling para Fal.ai

```javascript
// Submit
const res = await fetch('https://queue.fal.run/MODEL_ID', {
  method: 'POST',
  headers: { 'Authorization': `Key ${FAL_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
const data = await res.json();
if (!data.request_id) throw new Error(`Fal.ai error: ${JSON.stringify(data)}`);

// Polling
let resultUrl = null;
for (let i = 0; i < 40; i++) {
  await new Promise(r => setTimeout(r, 5000));
  const poll = await fetch(data.status_url, { headers: { 'Authorization': `Key ${FAL_API_KEY}` } });
  const result = await poll.json();
  if (result.status === 'COMPLETED') {
    const final = await (await fetch(data.response_url, { headers: { 'Authorization': `Key ${FAL_API_KEY}` } })).json();
    resultUrl = final.images?.[0]?.url || final.image?.url;
    break;
  }
  if (result.status === 'FAILED') throw new Error('Job falhou no Fal.ai');
}
if (!resultUrl) throw new Error('Timeout no Fal.ai');
```

## Pipelines de geração ativos

### Pipeline V3 — GPT Image 2 + Clarity (PRINCIPAL)
- Endpoint: `POST /api/run-photo-v3`
- Fluxo: Upload produto → GPT Image 2 → Clarity Upscaler
- Custo: ~$0.07/foto
- Parâmetros GPT Image 2:
  - `openai_api_key: process.env.OPENAI_API_KEY` — OBRIGATÓRIO (BYOK)
  - `image_urls: [model_image, productImageUrl]` — URLs públicas
  - `image_size: { width: 1024, height: 1280 }` — objeto, NÃO string
  - `prompt` — instrução de try-on + pose + cenário

### Clarity Upscaler — parâmetros aprovados
```javascript
{
  image_url: inputUrl,
  scale: 2,
  prompt: 'photorealistic fashion photography, visible natural skin pores...',
  negative_prompt: 'plastic skin, smooth skin, artificial, airbrushed...',
  creativity: 0.55,  // valor aprovado em testes — poros naturais sem distorção
  resemblance: 0.9,
  num_inference_steps: 20
}
```

## Variações de Pose — IMPLEMENTAÇÃO CORRETA ✅

Para gerar variações mantendo modelo/cenário/roupa idênticos (apenas mudando pose):

```javascript
// Frontend envia:
{
  model_image: state.resultImageUrl,        // ✅ Foto JÁ GERADA (não preset!)
  product_image: getCleanBase64(...),       // ✅ Foto original da roupa
  prompt_pose: 'side profile, looking...',  // ✅ Nova pose
  prompt_scenario: null,                    // ✅ NULL = não regenera cenário
  aspect_ratio: '9:16'
}

// Backend detecta variação:
const isVariation = !prompt_scenario;
const editPrompt = isVariation
  ? `Keep EXACTLY the same scene, location, background, lighting, model identity, and clothing. Only change the pose to: ${poseText}.`
  : /* prompt de geração inicial */;
```

**CRÍTICO:** Timeout do servidor DEVE ser ≥ 10 minutos para 3 variações sequenciais:
```javascript
server.timeout = 600000; // 10 minutos
```

Cada variação leva ~170-210s (GPT Image 2 + Clarity). 3 variações = ~8-10min total.

## Armadilhas conhecidas

| Problema | Causa | Solução |
|----------|-------|---------|
| 403 "Exhausted balance" no GPT Image 2 | Falta de `openai_api_key` no payload | Adicionar `openai_api_key: process.env.OPENAI_API_KEY` |
| URL "not accessible" no GPT Image 2 | Bucket não público ou URL assinada | Usar `getPublicUrl` + bucket público |
| `gptImageUrl = undefined` | Estrutura do response diferente | Ver `final.images?.[0]?.url` |
| 429 Too Many Requests | Créditos FASHN zerados | Migrar para GPT Image 2 ou recarregar |
| Servidor crasha sem log | Erro antes do catch | Adicionar `unhandledRejection` handler |
| `image_size` ignorado | Usando `size: '1024x1280'` (string) | Usar `image_size: { width: 1024, height: 1280 }` |
| Variações crasham com 500 no meio | Timeout HTTP padrão (120s) < tempo de polling (~210s) | `server.timeout = 600000` (10min) |
| Variações mudam modelo/cenário | Usando foto preset como `model_image` ou passando `prompt_scenario` | Usar `state.resultImageUrl` + `prompt_scenario: null` |
