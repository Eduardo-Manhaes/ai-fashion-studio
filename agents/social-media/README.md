# 🤖 Sistema de Agentes de Social Media — Modelo Fácil

Sistema automatizado de criação e publicação de posts para Instagram usando 5 agentes inteligentes baseados em Claude Sonnet 4.

## 📋 Visão Geral

O sistema roda **todo dia às 8h** (horário de Brasília) e gera posts automaticamente para publicação às **19h**. Cada dia da semana tem um **pilar de conteúdo** específico:

| Dia | Pilar | Objetivo |
|-----|-------|----------|
| 🔴 Seg | Dor | Conectar com o problema do lojista |
| 🔵 Ter | Plataforma | Mostrar como o Modelo Fácil funciona |
| 🟢 Qua | Atração | Conteúdo viral para novos seguidores |
| 🟡 Qui | Conversão | Transformar seguidores em clientes |
| 🟣 Sex | Atração | Conteúdo viral para novos seguidores |
| 🟠 Sáb | Plataforma | Mostrar como o Modelo Fácil funciona |
| 🔴 Dom | Conversão | Transformar seguidores em clientes |

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     SCHEDULER (cron)                         │
│              Roda todo dia às 8h (11h UTC)                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  ORQUESTRADOR (index.js)                     │
│         Coordena os 5 subagentes em sequência               │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┬──────────────┐
        ▼              ▼              ▼              ▼
   ┌────────┐    ┌──────────┐   ┌─────────┐   ┌──────────┐
   │   1️⃣   │    │    2️⃣    │   │   3️⃣    │   │    4️⃣    │
   │ESTRATÉ-│ => │ROTEI-    │=> │PRODUTOR │=> │  FISCAL  │
   │ GISTA  │    │RISTA     │   │         │   │          │
   └────────┘    └──────────┘   └─────────┘   └──────────┘
   Define o      Cria copy     Gera visual    Revisa tudo
   briefing      + hashtags    com DALL-E     + valida
                                                    │
                                                    ▼
                                            ┌───────────────┐
                                            │ Aprovado? ✅  │
                                            └───────┬───────┘
                                                    │
                                                    ▼
                                            ┌──────────────┐
                                            │      5️⃣      │
                                            │  PUBLICADOR  │
                                            │              │
                                            │  Agenda 19h  │
                                            │  Instagram   │
                                            └──────────────┘
```

## 🤖 Os 5 Subagentes

### 1️⃣ Estrategista (`strategist.js`)
**Papel:** Analisa o pilar do dia e cria briefing estratégico

**Input:** 
- Pilar do dia (dor/plataforma/atração/conversão)
- Configurações dos pilares

**Output:**
```json
{
  "theme": "tema principal do post",
  "angle": "ângulo específico",
  "objective": "o que queremos alcançar",
  "hook": "gancho inicial",
  "cta": "call-to-action",
  "insights": ["insight 1", "insight 2", "insight 3"]
}
```

**Tecnologia:** Claude Sonnet 4 (claude-sonnet-4-20250514)

---

### 2️⃣ Roteirista (`copywriter.js`)
**Papel:** Transforma briefing em copy persuasiva

**Input:** 
- Briefing do Estrategista
- Configurações do pilar

**Output:**
```json
{
  "caption": "texto completo da caption com quebras de linha",
  "hashtags": ["#hashtag1", "#hashtag2", ...],
  "firstLine": "gancho que aparece no feed",
  "wordCount": 120
}
```

**Tecnologia:** Claude Sonnet 4 (claude-sonnet-4-20250514)

---

### 3️⃣ Produtor (`producer.js`)
**Papel:** Cria visual do post

**Processo:**
1. Claude gera prompt otimizado para imagem
2. DALL-E 3 gera a imagem
3. Download e armazenamento local

**Output:**
```json
{
  "type": "image",
  "url": "https://...",
  "path": "/public/generated-posts/post-123.png",
  "prompt": "prompt usado para gerar a imagem"
}
```

**Tecnologia:** 
- Claude Sonnet 4 (prompt generation)
- OpenAI DALL-E 3 (image generation)

---

### 4️⃣ Fiscal (`fiscal.js`)
**Papel:** Revisa tudo antes de publicar

**Critérios de bloqueio:**
- ❌ Informações incorretas sobre a plataforma
- ❌ Promessas impossíveis
- ❌ Tom inadequado
- ❌ Copy mal escrita
- ❌ CTA confuso
- ❌ Hashtags spam
- ❌ Risco legal

**Output:**
```json
{
  "approved": true,
  "issue": null,
  "severity": null,
  "suggestions": [],
  "qualityScore": 8,
  "reasoning": "Post alinhado, copy clara, visual adequado"
}
```

**Notificação Telegram:** Apenas se `approved=false` e `severity` for `critical` ou `moderate`

**Tecnologia:** Claude Sonnet 4 (claude-sonnet-4-20250514)

---

### 5️⃣ Publicador (`publisher.js`)
**Papel:** Agenda e publica no Instagram

**Processo:**
1. Calcula delay até 19h
2. Aguarda horário
3. Inicia Playwright (Chrome automation)
4. Login no Instagram
5. Criar post → Upload imagem → Adicionar caption → Publicar

**Output:**
```json
{
  "scheduled": true,
  "scheduledTime": "2026-06-01T22:00:00.000Z",
  "delayMinutes": 600
}
```

**Tecnologia:** Playwright (Chrome automation)

---

## ⚙️ Configuração

### 1. Variáveis de Ambiente (.env)

Adicione ao arquivo `.env`:

```env
# Claude API — Sistema de Agentes
ANTHROPIC_API_KEY=sk-ant-api03-...

# Instagram — Publicação automática
INSTAGRAM_USERNAME=iamodelofacil
INSTAGRAM_PASSWORD=sua_senha_segura

# Telegram — Notificações do Fiscal
TELEGRAM_BOT_TOKEN=8855616918:AAGZG22ao6mbVFokPLUWG8naP9IxIvucBdw
TELEGRAM_CHAT_ID=seu_chat_id

# OpenAI — Geração de imagens
OPENAI_API_KEY=sk-proj-...
```

### 2. Obter Chat ID do Telegram

Para receber notificações do Fiscal, você precisa do seu Chat ID:

```bash
# 1. Inicie uma conversa com o bot: @Modelo_facil_bot
# 2. Envie qualquer mensagem
# 3. Acesse (substitua o token):
https://api.telegram.org/bot8855616918:AAGZG22ao6mbVFokPLUWG8naP9IxIvucBdw/getUpdates

# 4. Procure por "chat":{"id":123456789}
# 5. Adicione ao .env: TELEGRAM_CHAT_ID=123456789
```

### 3. Instalar Dependências

```bash
npm install

# Instalar navegador Chromium do Playwright
npx playwright install chromium
```

### 4. Iniciar o Sistema

O scheduler inicia automaticamente quando o servidor Node.js roda:

```bash
# Localmente
node agents/social-media/scheduler.js

# No Railway (automático via server.js)
# O sistema já está integrado e vai rodar junto com o servidor
```

## 🚀 Deploy no Railway

O sistema já está configurado para rodar no Railway. Basta adicionar as variáveis de ambiente:

1. Acesse: https://railway.app/project/seu-projeto/settings
2. Vá em **Variables**
3. Adicione:
   - `ANTHROPIC_API_KEY`
   - `INSTAGRAM_PASSWORD`
   - `TELEGRAM_CHAT_ID`
4. Redeploy automático acontecerá

O scheduler rodará automaticamente em background.

## 🧪 Teste Manual

Para testar o sistema sem esperar o cron:

```javascript
// test-agents.js
const { runDailyPost } = require('./agents/social-media/index');

runDailyPost()
  .then(() => console.log('✅ Teste concluído'))
  .catch(err => console.error('❌ Erro:', err));
```

```bash
node test-agents.js
```

## 📊 Monitoramento

### Logs

Todos os agentes logam seu progresso:

```
[SOCIAL MEDIA] 🚀 Iniciando geração do post diário...
[SOCIAL MEDIA] 📅 Dia: 1/6/2026 | Quadro: conversao
[SOCIAL MEDIA] 1/5 Estrategista analisando...
[STRATEGIST] Briefing criado: { theme: '...', angle: '...' }
[SOCIAL MEDIA] ✅ Briefing: Economize 80% com IA
[SOCIAL MEDIA] 2/5 Roteirista criando copy...
[COPYWRITER] Copy criada: { firstLine: '...', wordCount: 120 }
[SOCIAL MEDIA] ✅ Copy criada
[SOCIAL MEDIA] 3/5 Produtor criando visual...
[PRODUCER] Imagem gerada e salva: post-1735761234567.png
[SOCIAL MEDIA] ✅ Visual criado
[SOCIAL MEDIA] 4/5 Fiscal revisando...
[FISCAL] Revisão concluída: { approved: true, qualityScore: 8 }
[SOCIAL MEDIA] ✅ Post aprovado pelo Fiscal
[SOCIAL MEDIA] 5/5 Publicador agendando...
[PUBLISHER] Post agendado para: 01/06/2026, 19:00:00
[SOCIAL MEDIA] ✅ Post agendado com sucesso!
```

### Notificações Telegram

O Fiscal notifica apenas em casos de risco:

- ⚠️ **Severity: moderate** — Post precisa de ajuste mas não é crítico
- 🚨 **Severity: critical** — Post bloqueado, revisão manual necessária

## 🛠️ Customização

### Alterar Horários

Edite `agents/social-media/config.js`:

```javascript
publishTime: '19:00', // Horário de publicação
```

Edite `agents/social-media/scheduler.js`:

```javascript
// Roda todo dia às 8h (11h UTC)
cron.schedule('0 11 * * *', ...);
```

### Alterar Quadros por Dia

Edite `agents/social-media/config.js`:

```javascript
schedule: {
  0: 'conversao',   // Domingo
  1: 'dor',         // Segunda
  2: 'plataforma',  // Terça
  // ...
}
```

### Ajustar Tom dos Pilares

Edite `agents/social-media/config.js` → `pillars`:

```javascript
dor: {
  objetivo: '...',
  tom: 'empático, próximo, brasileiro',
  exemplos: [...]
}
```

## 🔒 Segurança

- ✅ Credenciais em variáveis de ambiente (nunca no código)
- ✅ `.env` no `.gitignore`
- ✅ Fiscal revisa antes de publicar
- ✅ Notificações Telegram para casos críticos
- ⚠️ Instagram pode bloquear automações — use conta de teste primeiro

## 📚 Próximos Passos

- [ ] Adicionar `ANTHROPIC_API_KEY` no Railway
- [ ] Adicionar `INSTAGRAM_PASSWORD` no Railway
- [ ] Obter e adicionar `TELEGRAM_CHAT_ID`
- [ ] Testar sistema localmente
- [ ] Deploy e monitoramento no Railway
- [ ] Ajustar prompts baseado em resultados
- [ ] Implementar analytics de performance dos posts

## 🆘 Troubleshooting

### Erro: "ANTHROPIC_API_KEY não encontrada"
Adicione a chave ao `.env` ou Railway variables.

### Erro: "INSTAGRAM_PASSWORD missing"
Adicione a senha do Instagram ao `.env` ou Railway variables.

### Post não foi publicado no horário
Verifique logs do Railway. Playwright pode precisar de ajustes de timeout.

### Imagem não foi gerada
Verifique `OPENAI_API_KEY`. Sistema usa placeholder se API falhar.

### Fiscal bloqueou um post bom
Ajuste os critérios em `agents/social-media/fiscal.js` ou revise manualmente.

---

**Desenvolvido com ❤️ por Claude Sonnet 4.5 para Modelo Fácil**
