# Arquitetura — Pipeline GPT Image 2 + Clarity

## 🎯 Objetivo
Gerar fotos realistas de modelos vestindo roupas de lojistas usando IA.

---

## 🔄 Fluxo completo (end-to-end)

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│  • Lojista seleciona modelo preset (27 opções)                  │
│  • Faz upload da roupa (base64)                                  │
│  • Escolhe pose e cenário                                        │
│  • Seleciona aspect ratio (9:16, 4:5, 1:1, etc)                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                     │
│                  Endpoint: POST /api/run-photo-v3                │
│                                                                  │
│  [1] Middleware: requireAuth + requireCredits                   │
│      • Valida token JWT                                          │
│      • Verifica créditos disponíveis                             │
│      • Cria registro generation_jobs (status: pending)           │
│                                                                  │
│  [2] Upload produto → Supabase Storage                           │
│      • Extrai base64 → Buffer                                    │
│      • Upload: generations/{user_id}/photo/temp-product-{id}.png │
│      • Gera URL pública (sem expiração)                          │
│                                                                  │
│  [3] Monta prompt combinado                                      │
│      • Se variação: preserva cena, muda pose                     │
│      • Se geração inicial: prompt completo com pose + cenário    │
│                                                                  │
│  [4] Submit GPT Image 2 via Fal.ai                               │
│      • Endpoint: queue.fal.run/openai/gpt-image-2/edit           │
│      • Payload:                                                  │
│        - openai_api_key: process.env.OPENAI_API_KEY             │
│        - image_urls: [modelo_preset_url, produto_url]            │
│        - prompt: editPrompt                                      │
│        - image_size: {width: 1024, height: 1280} (baseado em AR) │
│      • Retorna: request_id + status_url + response_url           │
│                                                                  │
│  [5] Polling GPT Image 2 (até 40 iterações, 5s cada)            │
│      • Status: IN_QUEUE → IN_PROGRESS → COMPLETED               │
│      • Tempo médio: 160s (~2min 40s)                             │
│      • Extrai: final.images[0].url                               │
│                                                                  │
│  [6] Submit Clarity Upscaler via Fal.ai                          │
│      • Endpoint: queue.fal.run/fal-ai/clarity-upscaler           │
│      • Payload:                                                  │
│        - image_url: gptImageUrl                                  │
│        - scale: 2                                                │
│        - creativity: 0.55 (aprovado em testes)                   │
│        - resemblance: 0.9                                        │
│      • Retorna: request_id + status_url + response_url           │
│                                                                  │
│  [7] Polling Clarity (até 30 iterações, 5s cada)                │
│      • Tempo médio: 15s                                          │
│      • Extrai: final.image.url                                   │
│      • Fallback: se falhar, usa gptImageUrl                      │
│                                                                  │
│  [8] Retorna ao frontend                                         │
│      • { output: [finalImageUrl], _job_id: job.id }              │
│                                                                  │
│  [9] Frontend exibe imagem + botões variações/upscale            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Banco de Dados (Supabase)

### Tabela: `preset_models`
```sql
id              UUID PRIMARY KEY
slug            TEXT UNIQUE (ex: "camila", "jessica")
name            TEXT (ex: "Camila")
gender          TEXT (female/male)
ethnicity       TEXT (caucasian/black/asian/mixed)
body_type       TEXT (slim/athletic/curvy/plus_size)
age_group       TEXT (young_adult/adult/mature)
age_range       TEXT (ex: "20-25")
reference_url   TEXT (URL da foto no Fal.media)
sort_order      INTEGER
is_active       BOOLEAN
```

### Tabela: `generation_jobs`
```sql
id                UUID PRIMARY KEY
user_id           UUID REFERENCES auth.users
generation_type   TEXT (photo/video_movement/video_talking)
provider          TEXT (gpt-image-2/kolors/kling/veo)
status            TEXT (pending/processing/completed/failed/deleted)
provider_job_id   TEXT (request_id do Fal.ai)
credits_cost      INTEGER
storage_path      TEXT (caminho no Supabase Storage)
result_url        TEXT (URL assinada com expiração)
inputs            JSONB (dados da requisição)
created_at        TIMESTAMP
completed_at      TIMESTAMP
expires_at        TIMESTAMP
```

### Bucket Storage: `generations`
- **Configuração crítica:** `public: true` ✅
- **Estrutura de pastas:**
  ```
  generations/
    {user_id}/
      photo/
        temp-product-{job_id}.png  (uploads temporários)
        result-{job_id}.png        (resultado final persistido)
      video/
        ...
  ```

---

## 🔑 Variáveis de Ambiente (.env)

```bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# APIs externas
FAL_API_KEY=xxx-xxx-xxx
OPENAI_API_KEY=sk-proj-xxx...

# Opcional (Fase 1F)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Ambiente
NODE_ENV=development  # ou production
PORT=3000
```

---

## 🛡️ Segurança e Autenticação

### Middleware `requireAuth` (lib/middleware/auth.js)
1. Extrai token JWT do header `Authorization: Bearer <token>`
2. Valida com `supabaseAdmin.auth.getUser(token)`
3. Anexa `req.user` para uso nos handlers

### Middleware `requireCredits` (lib/middleware/quota.js)
1. Verifica se usuário tem créditos suficientes
2. Cria registro `generation_jobs` com status `pending`
3. Se falhar, faz refund automático
4. Anexa `req.generationJob` para rastreamento

---

## 🧪 Testes e Validação

### Teste rápido de pré-requisitos
```bash
node test-gpt-image-final.js
```

### Teste individual de URLs de modelos
```bash
node check-preset-urls.js
```

### Teste SSL
```bash
node test-ssl-fixed.js
```

---

## 📊 Custos estimados (Fal.ai)

| Serviço | Custo por geração | Tempo médio |
|---------|------------------|-------------|
| GPT Image 2 | ~$0.12 | 160s |
| Clarity Upscaler | ~$0.03 | 15s |
| **Total** | **~$0.15** | **~175s** |

**Observação:** Valores aproximados. Verificar pricing atualizado em fal.ai/pricing

---

## 🚨 Troubleshooting

### Erro: "URL not accessible"
- **Causa:** Bucket não público ou URL inválida
- **Fix:** `await supabase.storage.updateBucket('generations', { public: true })`

### Erro: "fetch failed"
- **Causa:** SSL não configurado
- **Fix:** Verificar `NODE_TLS_REJECT_UNAUTHORIZED='0'` em server.js linha 6

### Erro: "undefined URL"
- **Causa:** Parsing incorreto ou API retornou erro
- **Fix:** Adicionar log `console.log(JSON.stringify(final))` e verificar estrutura

### Timeout (>200s sem resposta)
- **Causa:** Fal.ai congestionado ou imagem muito grande
- **Fix:** Aumentar timeout ou implementar webhook

---

## 🔄 Histórico de versões

### v3 (ATUAL) — GPT Image 2 + Clarity
- ✅ Usa GPT Image 2 via Fal.ai (gpt-image-2/edit)
- ✅ Suporta múltiplas imagens de referência (modelo + produto)
- ✅ Aspect ratio configurável (9:16, 4:5, 1:1, etc)
- ✅ Upload de produto → URL pública Supabase
- ✅ Upscale com Clarity (creativity 0.55)

### v2 (DEPRECATED) — Kolors + Clarity
- ❌ Qualidade inferior ao GPT Image 2
- ❌ Não suporta múltiplas referências
- Mantido no código para fallback

### v1 (DEPRECATED) — FASHN.ai
- ❌ Qualidade inferior
- ❌ Custo maior
- Mantido no código para compatibilidade

---

## 📚 Referências

- [Fal.ai Docs - GPT Image 2](https://fal.ai/models/openai/gpt-image-2)
- [Fal.ai Docs - Clarity Upscaler](https://fal.ai/models/fal-ai/clarity-upscaler)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [OpenAI API - Image Edit](https://platform.openai.com/docs/api-reference/images/create-edit)

---

**Última atualização:** 2026-05-13  
**Commit de referência:** `703a92e` — Fix: GPT Image 2 — resolve SSL + bucket público + limpa logs
