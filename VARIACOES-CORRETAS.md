# Variações de Pose — Implementação Correta ✅

**Data:** 2026-05-13  
**Status:** ✅ FUNCIONANDO PERFEITAMENTE  
**Commits de referência:** `4d85ebe`, `703a92e`, `cd63d39`

---

## 🎯 Objetivo

Gerar 3 variações de pose preservando:
- ✅ Mesma modelo (rosto, cabelo, tom de pele idênticos)
- ✅ Mesmo cenário (exatamente o mesmo local, iluminação, fundo)
- ✅ Mesma roupa
- ❌ Apenas a pose muda

---

## ✅ Implementação Correta (FUNCIONANDO)

### Frontend: `public/app.js` (função `generateVariations()`)

```javascript
async function generateVariations() {
  if (state.isGenerating) return;
  state.isGenerating = true;

  const variationPoses = [
    'side profile, looking sideways elegantly',
    'three-quarter angle, hand on hip, confident',
    'walking pose, natural movement, full body',
  ];

  for (const pose of variationPoses) {
    const res = await window.AuthLib.authFetch('/api/run-photo-v3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputs: {
          // ✅ CRÍTICO: Usa foto gerada como referência
          model_image: state.resultImageUrl,
          
          // ✅ CRÍTICO: Mantém foto original da roupa
          product_image: getCleanBase64(state.productImageBase64),
          
          // ✅ CRÍTICO: Nova pose
          prompt_pose: pose,
          
          // ✅ CRÍTICO: null = não regenera cenário
          prompt_scenario: null,
          
          aspect_ratio: document.getElementById('aspectSelect')?.value || '9:16'
        }
      }),
    });

    // ✅ Aguarda 2s entre chamadas para evitar rate limit
    await new Promise(r => setTimeout(r, 2000));
  }
}
```

**Pontos críticos:**
1. **`model_image: state.resultImageUrl`** — Foto JÁ GERADA (não a foto preset)
2. **`prompt_scenario: null`** — Cenário não é passado (já está na foto)
3. **Loop sequencial com await** — Não paralelo (evita sobrecarga)

---

### Backend: `server.js` (endpoint `/api/run-photo-v3`)

#### Detecção de variação (linha 324):
```javascript
const isVariation = !prompt_scenario;
```

#### Prompt diferenciado (linhas 325-327):
```javascript
const editPrompt = isVariation
  ? `Fashion photography variation. Keep EXACTLY the same scene, location, background, lighting, model identity, and clothing. Only change the pose to: ${poseText}. Do not change anything else.`
  : `Fashion virtual try-on photography. Keep the exact same woman — same face, hair, skin tone, body and expression. She is now wearing the garment shown in the reference image. ${poseText}. Background: ${scenarioText}. Professional fashion photography, photorealistic, natural lighting. Do not change the person's identity.`;
```

**Palavras-chave no prompt de variação:**
- ✅ **"Keep EXACTLY the same"** — Enfatiza preservação
- ✅ **"Only change the pose"** — Instrução explícita
- ✅ **"Do not change anything else"** — Reforço final

#### Payload para GPT Image 2 (linhas 338-356):
```javascript
const gptRes = await fetch('https://queue.fal.run/openai/gpt-image-2/edit', {
  method: 'POST',
  headers: { 'Authorization': `Key ${FAL_API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    // ✅ CRÍTICO: BYOK obrigatório
    openai_api_key: process.env.OPENAI_API_KEY,
    
    // ✅ CRÍTICO: [foto_gerada, roupa_original]
    image_urls: [model_image, productImageUrl],
    
    // ✅ CRÍTICO: Prompt de variação
    prompt: editPrompt,
    
    n: 1,
    
    // ✅ CRÍTICO: Objeto, não string
    image_size: { width: 1024, height: 1280 }
  })
});
```

**Pontos críticos:**
1. **`openai_api_key: process.env.OPENAI_API_KEY`** — BYOK (Bring Your Own Key)
2. **`image_urls: [model_image, productImageUrl]`** — Ordem importa!
3. **`image_size` como objeto** — Não usar string `'1024x1280'`

---

## 🛡️ Salvaguardas Implementadas

### 1. **Timeout do servidor aumentado** (linha 1028)
```javascript
server.timeout = 600000;        // 10 minutos
server.keepAliveTimeout = 610000;
server.headersTimeout = 620000;
```

**Por quê:** Cada variação leva ~170-210s (GPT + Clarity). 3 variações = ~8-10 minutos.

### 2. **Bucket Supabase público** (executado via `fix-bucket-public.js`)
```javascript
await supabase.storage.updateBucket('generations', { public: true });
```

**Por quê:** GPT Image 2 precisa acessar URLs públicas (sem token de expiração).

### 3. **SSL configurado** (linha 6-10)
```javascript
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}
```

**Por quê:** Windows precisa de certificados CA ou bypass em dev.

---

## ❌ ERROS PASSADOS (NÃO FAZER)

### ❌ Usar foto preset como `model_image`
```javascript
// ERRADO: Muda modelo/cenário a cada variação
model_image: presetModel.reference_url
```

### ❌ Passar `prompt_scenario` em variações
```javascript
// ERRADO: Regenera cenário, não preserva
prompt_scenario: 'white studio background'
```

### ❌ Usar `size` como string
```javascript
// ERRADO: Ignorado pela API
size: '1024x1280'

// CORRETO:
image_size: { width: 1024, height: 1280 }
```

### ❌ Esquecer `openai_api_key`
```javascript
// ERRADO: 403 "Exhausted balance"
// openai_api_key ausente

// CORRETO:
openai_api_key: process.env.OPENAI_API_KEY
```

### ❌ Timeout padrão do servidor
```javascript
// ERRADO: Crash após 120s
// Sem configuração de timeout

// CORRETO:
server.timeout = 600000; // 10 minutos
```

---

## 🧪 Como Testar

### Teste de regressão:
```bash
# 1. Inicie o servidor
npm start

# 2. Gere uma foto normalmente (qualquer modelo + roupa)
# 3. Clique em "Criar Variações e Poses"
# 4. Aguarde ~8-10 minutos
# 5. Valide resultado:
```

**Checklist de validação:**
- [ ] 3 imagens geradas com sucesso
- [ ] Mesmo rosto em todas (cor de olho, feições)
- [ ] Mesmo cenário (parede, luz, objetos)
- [ ] Mesma roupa
- [ ] Poses diferentes (side, three-quarter, walking)
- [ ] Sem erro 500 no console do navegador
- [ ] Logs do servidor completos (sem crash)

---

## 📚 Arquivos Relacionados

- **Frontend:** `public/app.js` (linha 1164, função `generateVariations()`)
- **Backend:** `server.js` (linha 285, endpoint `/api/run-photo-v3`)
- **Skills:** `.claude/skills/modelo-facil-fal/SKILL.md` (GPT Image 2)
- **Skills:** `.claude/skills/modelo-facil-api/SKILL.md` (Backend patterns)
- **Arquitetura:** `ARCHITECTURE-GPT-IMAGE-2.md` (Pipeline V3)
- **Checklist:** `PIPELINE-CHECKLIST.md` (Pré-requisitos)

---

## 🔒 Garantia de Qualidade

### Commits de referência (não reverter!):
```bash
4d85ebe Fix: aumenta timeout do servidor para 10 minutos
703a92e Fix: GPT Image 2 — resolve SSL + bucket público + limpa logs
cd63d39 Fix: URL pública no upload do produto
d4a2694 Fix: adiciona openai_api_key no payload do GPT Image 2
773442d Fix: variações usam imagem gerada como referência
```

### Monitoramento:
Se as variações voltarem a mudar modelo/cenário, verificar:
1. `state.resultImageUrl` está sendo passado corretamente?
2. `prompt_scenario` está `null`?
3. Prompt de variação está intacto no servidor?
4. Timeout do servidor está configurado?

---

**Esta implementação foi testada e validada em 2026-05-13. Mantenha como está! ✅**
