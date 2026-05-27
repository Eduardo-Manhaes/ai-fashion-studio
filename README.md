# 🎨 Modelo Fácil — AI Fashion Studio

**SaaS brasileiro de geração de fotos e vídeos de moda com IA**

[![Status](https://img.shields.io/badge/status-production-success)](https://web-production-6ab20.up.railway.app)
[![Railway](https://img.shields.io/badge/deploy-Railway-blueviolet)](https://railway.app)
[![Stripe](https://img.shields.io/badge/payments-Stripe-blue)](https://stripe.com)

---

## 📖 Sobre

Modelo Fácil transforma fotos de produtos em imagens e vídeos profissionais de moda usando inteligência artificial. Upload de uma roupa, escolha um cenário e movimento, e gere conteúdo visual de alta qualidade para e-commerce.

**URL de Produção:** https://web-production-6ab20.up.railway.app

---

## ✨ Funcionalidades

### 🖼️ Geração de Fotos
- **Pipeline V2:** FASHN.ai (Kolors)
- **Pipeline V3:** OpenAI GPT Image 2 + Clarity upscale
- **28 modelos preset** brasileiros
- Custo: **2 créditos** por foto

### 🎬 Geração de Vídeos

#### Vídeos de Movimento (Kling v2.6 Pro)
- **6 cenários profissionais:**
  - Parede ao fundo (3 variantes)
  - Boutique brasileira
  - Lojas do Brás (2 variantes)
  - Selfie no espelho
  - Ambiente natural
  - Cenário urbano

- **8 estilos de movimento:**
  - m1 Natural (recomendado)
  - m2 Vento no look
  - m3 Modelo andando
  - m4 Gesto suave
  - m5 Giro elegante
  - m6 Vista no espelho
  - m7 Pose de Modelo (2 variantes cinematográficas)
  - m8 Selfie no espelho (exclusivo para s4)

- Custo: **8 créditos** por vídeo

#### Vídeos Falando (Veo 3.1)
- Lip-sync com áudio customizado
- Prompts dinâmicos com variáveis
- Custo: **15 créditos** por vídeo

---

## 🏗️ Arquitetura

### Stack Tecnológico

**Backend:**
- Node.js + Express
- Supabase (PostgreSQL + Auth + Storage)
- BullMQ + MockQueue (processamento de jobs)
- Stripe (pagamentos recorrentes + webhooks)

**Frontend:**
- Vanilla JavaScript
- HTML5 + CSS3 responsivo
- Interface intuitiva sem frameworks

**APIs de IA:**
- FASHN.ai — Fotos V2 (Kolors)
- OpenAI — Fotos V3 (GPT Image 2 + Clarity)
- Fal.ai — Vídeos movimento (Kling v2.6 Pro)
- Fal.ai — Vídeos falando (Veo 3.1)

**Infraestrutura:**
- Railway (deploy + hosting)
- GitHub (versionamento)
- Stripe (billing)
- Supabase Cloud (database)

---

## 💰 Planos e Preços

| Plano | Preço/mês | Créditos | Equivalente |
|-------|-----------|----------|-------------|
| **Básico** | R$ 35 | 20 | ~10 fotos ou 2 vídeos |
| **Starter** | R$ 79 | 50 | ~25 fotos ou 6 vídeos |
| **Pro** | R$ 159 | 120 | ~60 fotos ou 15 vídeos |

**Custos de geração:**
- Foto: 2 créditos
- Vídeo movimento: 8 créditos
- Vídeo falando: 15 créditos

---

## 🚀 Deploy

### Produção (Railway)

1. **Variáveis de ambiente necessárias:**
```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe
STRIPE_SECRET_KEY=sk_test_... (ou sk_live_...)
STRIPE_PUBLISHABLE_KEY=pk_test_... (ou pk_live_...)
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_BASICO=price_...
STRIPE_PRICE_ID_STARTER=price_...
STRIPE_PRICE_ID_PRO=price_...

# APIs de IA
FASHN_API_KEY=...
OPENAI_API_KEY=sk-...
FAL_API_KEY=...

# Configuração
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://web-production-6ab20.up.railway.app
```

2. **Deploy automático:**
   - Push para `main` → Railway faz deploy automaticamente
   - Logs: https://railway.app/dashboard

3. **Webhook Stripe:**
   - URL: `https://web-production-6ab20.up.railway.app/webhook/stripe`
   - Eventos: `checkout.session.completed`, `customer.subscription.*`

---

## 📂 Estrutura do Projeto

```
modelo-facil/
├── public/
│   ├── index.html          # App principal
│   ├── app.js              # Lógica do frontend (cenários, movimentos)
│   ├── landing.html        # Landing page
│   ├── planos.html         # Página de planos
│   └── lib/
│       ├── auth.js         # Autenticação Supabase
│       └── styles.css      # Estilos globais
├── routes/
│   ├── photo.js            # Geração de fotos
│   ├── video.js            # Geração de vídeos
│   ├── stripe.js           # Checkout e webhooks
│   └── status.js           # Status e health checks
├── docs/
│   ├── CENARIOS_E_MOVIMENTOS.md  # Documentação completa
│   └── superpowers/
│       ├── specs/          # Especificações técnicas
│       └── plans/          # Planos de implementação
├── server.js               # Servidor Express
├── LAUNCH-SUMMARY.md       # Resumo de lançamento
├── GO-LIVE-CHECKLIST.md    # Checklist de produção
└── README.md               # Este arquivo
```

---

## 📚 Documentação

- **[CENARIOS_E_MOVIMENTOS.md](docs/CENARIOS_E_MOVIMENTOS.md)** — Documentação completa de cenários e movimentos
- **[LAUNCH-SUMMARY.md](LAUNCH-SUMMARY.md)** — Resumo executivo do lançamento
- **[GO-LIVE-CHECKLIST.md](GO-LIVE-CHECKLIST.md)** — Checklist de produção
- **[FIX_APLICADO_DEFORMACAO.md](FIX_APLICADO_DEFORMACAO.md)** — Fix de deformação de roupa

**Specs técnicos:**
- `docs/superpowers/specs/2026-05-25-pose-modelo-variants.md`
- `docs/superpowers/specs/2026-05-27-fix-garment-deformation.md`

---

## 🧪 Testes

### Testes Manuais

```bash
# Smoke test
node --use-system-ca check-production-config.js

# Teste end-to-end
node --use-system-ca test-production-e2e.js

# Teste de billing
node --use-system-ca test-billing-flow.js

# Teste de webhook
node --use-system-ca test-webhook.js
```

### Teste Manual no Browser

1. Acesse: https://web-production-6ab20.up.railway.app
2. Crie uma conta
3. Checkout de plano (cartão teste: `4242 4242 4242 4242`)
4. Gere uma foto ou vídeo
5. Verifique débito de créditos

---

## 🔧 Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Configurar .env
cp .env.example .env
# Preencher com suas chaves

# Iniciar servidor
npm start

# Acesse http://localhost:3000
```

**Nota:** Sistema de fila usa MockQueue localmente (processamento inline). Redis é opcional para escala.

---

## 🐛 Troubleshooting

### Erro "switchMenu is not defined"
- **Causa:** Cache do browser com versão antiga
- **Solução:** Scripts usam versioning `?v=5` para cache bust

### Deformação de roupa em vídeos
- **Causa:** Zoom universal causava instabilidade geométrica
- **Solução:** Zoom removido de m1-m6, mantido apenas em m7 (cinematográfico)

### Vídeo em câmera lenta
- **Causa:** Prompt sem instruções de velocidade
- **Solução:** Adicionado "natural real-life speed, no slow motion"

### Vídeo saindo como foto estática
- **Causa:** Prompt focado em câmera, não em movimento da modelo
- **Solução:** Prompts com "moving naturally", "must be visibly moving"

---

## 🎓 Lições Aprendidas

### IA de Vídeo (Kling v2.6 Pro)

1. **Movimento de câmera causa instabilidade**
   - Zoom pode deformar roupas
   - Câmera estática é mais confiável

2. **Velocidade deve ser explícita**
   - "subtle" → interpretado como "lento"
   - Repetir "natural human speed" múltiplas vezes

3. **Evitar conflitos de instruções**
   - "static" vs "movement" confunde IA
   - Prompts devem ser internamente consistentes

4. **Prompts cinematográficos funcionam**
   - Estrutura "SCENE N (Xs-Ys)" é eficaz
   - Marcadores temporais melhoram controle

---

## 📈 Métricas de Qualidade

### Cobertura de Testes
- **Dia 1:** 7/7 tarefas (100%)
- **Dia 2:** 4/4 tarefas (100%)
- **Dia 3:** 7/7 tarefas (100%)
- **Total:** 18/18 tarefas ✅

### Funcionalidades
- ✅ 6 cenários (3 com variantes)
- ✅ 8 movimentos (2 com variantes)
- ✅ Integração cenário + movimento
- ✅ Prompts cinematográficos
- ✅ Realismo fotográfico

---

## 👨‍💻 Autor

**Eduardo Manhães**
- Email: eduardomanhaesmaciel@gmail.com
- Desenvolvido com Claude Code (Anthropic)

---

## 📄 Licença

Projeto proprietário — Modelo Fácil © 2026

---

## 🚀 Status do Projeto

**Produção:** ✅ Online  
**Última atualização:** 27 de Maio de 2026  
**Próximos passos:**
- Migrar Stripe para modo LIVE
- Configurar domínio customizado (opcional)
- Monitoramento e suporte ao cliente
