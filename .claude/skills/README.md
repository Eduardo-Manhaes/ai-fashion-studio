# Claude Code Skills — Modelo Fácil

Skills customizadas instaladas neste projeto para padronizar desenvolvimento e evitar erros recorrentes.

---

## 📦 Skills instaladas

### 1. `modelo-facil-fal` ⭐ PRINCIPAL
**Quando usar:** Sempre que trabalhar com chamadas ao Fal.ai

**Cobre:**
- 🎨 Geração de imagens: GPT Image 2, FLUX, Kolors, IDM-VTON
- 🎬 Geração de vídeos: Kling, Veo 3.1
- ⬆️ Upscaling: Clarity, AuraSR
- 🔄 Padrão de polling assíncrono (queue.fal.run)
- 🚨 Diagnóstico de erros (403, 400, undefined URL)

**Lições críticas incluídas:**
- ✅ BYOK (Bring Your Own Key) para GPT Image 2 → `openai_api_key` obrigatório
- ✅ `image_size: { width, height }` (objeto) → não usar string `'1024x1280'`
- ✅ URLs devem ser públicas → sem URLs assinadas com token
- ✅ Estrutura de response varia por modelo → `finalData.images[0].url` vs `finalData.image.url`

**Arquivo:** `.claude/skills/modelo-facil-fal/skills/modelo-facil-fal/SKILL.md`

---

### 2. `modelo-facil-api` ⭐ PRINCIPAL
**Quando usar:** Sempre que trabalhar em `server.js` ou backend

**Cobre:**
- 🔐 Middleware de autenticação (`requireAuth`)
- 💳 Sistema de créditos (`requireCredits`, `refundJob`)
- 📤 Upload para Supabase Storage (URLs públicas)
- 🔄 Estrutura padrão de endpoints
- 📊 Pipelines de geração (v1 FASHN → v2 Kolors → v3 GPT Image 2)

**Padrões estabelecidos:**
- ✅ Upload → URL pública permanente (`.getPublicUrl()`)
- ✅ Bucket `generations` DEVE ser público
- ✅ Sempre fazer `refundJob()` em caso de erro
- ✅ Polling com timeout configurável (40 iterações, 5s cada)

**Variáveis de ambiente críticas:**
```
FAL_API_KEY=
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

**Arquivo:** `.claude/skills/modelo-facil-api/skills/modelo-facil-api/SKILL.md`

---

### 3. `supabase` (oficial)
**Quando usar:** Trabalho com Supabase Database, Storage, Auth

Skills oficiais do Supabase clonadas do GitHub.

**Localização:** `.claude/skills/supabase/` (não versionado)

---

## 🧠 Como Claude Code usa as skills

As skills são carregadas automaticamente quando você trabalha em:
- `server.js` → carrega `modelo-facil-api`
- Integrações Fal.ai → carrega `modelo-facil-fal`
- Queries/Storage Supabase → carrega `supabase`

**Você não precisa fazer nada** — o Claude Code detecta contexto e aplica os padrões automaticamente.

---

## 🚨 Armadilhas evitadas pelas skills

### Problema: GPT Image 2 retorna 403 "Exhausted balance"
**Causa:** Falta de `openai_api_key` no payload  
**Solução aplicada:** Skill documenta BYOK obrigatório  
**Commit de referência:** `d4a2694`

### Problema: "URL not accessible or has expired"
**Causa:** Bucket não público ou URL assinada  
**Solução aplicada:** Skill documenta uso de `getPublicUrl()`  
**Commit de referência:** `cd63d39`

### Problema: `image_size` ignorado no GPT Image 2
**Causa:** Usando `size: '1024x1280'` (string) ao invés de objeto  
**Solução aplicada:** Skill documenta formato correto  
**Commit de referência:** `773442d`

### Problema: `gptImageUrl = undefined` após COMPLETED
**Causa:** Estrutura de response diferente entre modelos  
**Solução aplicada:** Skill documenta parsing por modelo  
**Commit de referência:** `703a92e`

---

## 📚 Documentação relacionada

- `ARCHITECTURE-GPT-IMAGE-2.md` — Arquitetura completa do pipeline v3
- `PIPELINE-CHECKLIST.md` — Checklist de pré-requisitos
- `CLAUDE.md` — (se existir) Contexto geral do projeto para Claude Code

---

## 🔄 Atualizando skills

### Skills customizadas (modelo-facil-*)
Se encontrar novo padrão ou armadilha:

1. Editar `.claude/skills/modelo-facil-*/SKILL.md`
2. Commitar com mensagem clara: `"Docs(skill): adiciona padrão X para evitar erro Y"`

### Skills do Supabase
```bash
cd .claude/skills/supabase
git pull origin main
```

---

## 🎯 Exemplo de uso

Quando você pedir:
> "Adicione suporte para gerar imagens com FLUX Pro Ultra"

Claude Code vai:
1. Carregar `modelo-facil-fal.skill` automaticamente
2. Aplicar padrão de polling assíncrono
3. Usar parâmetros corretos do FLUX (guidance_scale: 2.2, raw: true)
4. Estruturar endpoint seguindo `modelo-facil-api.skill`
5. Adicionar tratamento de erro e refund

**Sem as skills**, eu poderia:
- ❌ Esquecer de adicionar `requireCredits` middleware
- ❌ Usar parâmetros incorretos do FLUX
- ❌ Esquecer de fazer `refundJob()` em erro
- ❌ Não seguir padrão de polling estabelecido

---

**Skills instaladas em:** 2026-05-13  
**Commit:** `ea02746` — Setup: adiciona skills do Claude Code para Fal.ai e backend
