---
name: modelo-facil-fal
description: >
  Padrões de integração com Fal.ai para o projeto Modelo Fácil.
  Use SEMPRE que trabalhar com chamadas ao Fal.ai: geração de imagens
  (FLUX, GPT Image 2, Kolors, IDM-VTON), vídeo (Kling, Veo), upscaling
  (Clarity, AuraSR) ou qualquer outro modelo via Fal.ai. Inclui padrões
  críticos de polling, estrutura de response, parâmetros corretos por modelo,
  e lições aprendidas em produção como BYOK para GPT Image 2 e
  image_size como objeto (não string).
---

# Modelo Fácil — Fal.ai Integration

## Autenticação
```javascript
const FAL_API_KEY = process.env.FAL_API_KEY; // começa com UUID
// Header: 'Authorization': `Key ${FAL_API_KEY}`
```

## Padrão de chamada assíncrona (queue)

```javascript
// 1. Submit
const res = await fetch('https://queue.fal.run/MODEL_SLUG', {
  method: 'POST',
  headers: {
    'Authorization': `Key ${FAL_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
});

const data = await res.json();
// data.request_id, data.status_url, data.response_url

// 2. Polling
for (let i = 0; i < 40; i++) {
  await new Promise(r => setTimeout(r, 5000));
  const poll = await fetch(data.status_url, {
    headers: { 'Authorization': `Key ${FAL_API_KEY}` }
  });
  const result = await poll.json();
  // result.status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'

  if (result.status === 'COMPLETED') {
    const final = await fetch(data.response_url, {
      headers: { 'Authorization': `Key ${FAL_API_KEY}` }
    });
    const finalData = await final.json();
    // Extrair URL conforme modelo (ver abaixo)
    break;
  }
  if (result.status === 'FAILED') throw new Error('Job falhou');
}
```

## Modelos e parâmetros

### GPT Image 2 — `openai/gpt-image-2/edit`
```javascript
{
  openai_api_key: process.env.OPENAI_API_KEY,  // OBRIGATÓRIO — BYOK
  image_urls: ['url_modelo', 'url_produto'],    // URLs PÚBLICAS apenas
  prompt: 'Fashion virtual try-on...',
  n: 1,
  image_size: { width: 1024, height: 1280 }    // OBJETO, não string!
}
// Response: finalData.images[0].url
```

**Armadilhas críticas:**
- Sem `openai_api_key` → 403 "Exhausted balance" (usa conta interna sem saldo)
- `size: '1024x1280'` (string) → ignorado, usa tamanho padrão
- `image_size: { width, height }` (objeto) → correto
- URLs não públicas → erro "URL not accessible or expired"

**Mapeamento de aspect_ratio para image_size:**
```javascript
const sizeMap = {
  '9:16': { width: 1024, height: 1536 },
  '4:5':  { width: 1024, height: 1280 },
  '1:1':  { width: 1024, height: 1024 },
  '16:9': { width: 1536, height: 1024 },
  '3:4':  { width: 1024, height: 1365 },
};
```

### FLUX 1.1 Pro Ultra — `fal-ai/flux-pro/v1.1-ultra`
```javascript
{
  prompt: '...Three-quarter shot...portrait_studio_20240815_0042.CR2...',
  image_size: 'portrait_4_3',
  num_inference_steps: 45,
  guidance_scale: 2.2,   // VALOR MÁGICO — não aumentar acima de 3.0
  enable_safety_checker: false,
  raw: true
}
// Response: finalData.images[0].url
```

### Kolors Virtual Try-On — `fal-ai/kling/v1-5/kolors-virtual-try-on`
```javascript
{
  human_image_url: 'url_da_modelo',    // Pose vem desta foto
  garment_image_url: 'url_da_roupa'   // Flatlay ou cabide
}
// Response: finalData.image.url
// ATENÇÃO: Falha com erro "Failed to detect body pose" em algumas poses
// Funciona melhor com fotos full body de frente
```

### IDM-VTON — `fal-ai/idm-vton`
```javascript
{
  human_image_url: 'url_da_modelo',
  garment_image_url: 'url_da_roupa',
  description: 'sage green casual top',
  num_inference_steps: 30,
  seed: 42
}
// Response: finalData.image.url
// Custo: $0 (gratuito) | Qualidade inferior ao Kolors
```

### Clarity Upscaler — `fal-ai/clarity-upscaler`
```javascript
{
  image_url: inputUrl,
  scale: 2,
  prompt: 'photorealistic fashion photography, visible natural skin pores, individual hair strands, real fabric texture',
  negative_prompt: 'plastic skin, smooth skin, artificial, airbrushed, retouched, fake, CGI',
  creativity: 0.55,    // APROVADO — poros naturais sem distorção
  resemblance: 0.9,
  num_inference_steps: 20
}
// Response: finalData.image.url
```

### Kling Video — `fal-ai/kling-video/v1.6/pro/image-to-video`
```javascript
{
  image_url: inputUrl,
  prompt: 'natural movement...',
  duration: '5',
  aspect_ratio: '9:16'
}
// Response: finalData.video.url
```

### Veo 3.1 — `fal-ai/veo2/image-to-video`
```javascript
{
  image_url: inputUrl,
  prompt: 'em português...',
  duration: '8s'
}
// Polling: GET /api/status/veo/:id (NÃO /api/status/:id — capturado por rota genérica)
```

## Diagnóstico de erros comuns

| HTTP Status | Mensagem | Causa | Solução |
|-------------|----------|-------|---------|
| 403 | "Exhausted balance" | Sem `openai_api_key` no GPT Image 2 | Adicionar BYOK |
| 403 | "User is locked" | Saldo Fal.ai zerado | Recarregar em fal.ai/dashboard/billing |
| 400 | "Failed to detect body pose" | Pose da modelo não detectável pelo Kolors | Usar foto full body ou GPT Image 2 |
| 400 | "Invalid inputs: category not allowed" | Campo não suportado pelo modelo | Remover campo incompatível |
| COMPLETED mas URL undefined | Estrutura do response diferente | Logar `finalData` completo para ver estrutura real |
| 200 mas resultado ruim | Sem BYOK no GPT Image 2 | Adicionar openai_api_key |
