# 🚀 Guia de Deploy — Modelo Fácil

Este guia orienta a configuração do Modelo Fácil para produção, incluindo deployment em plataformas populares.

## Pré-requisitos

- [ ] Conta Supabase (postgresql + auth + storage)
- [ ] Conta Stripe (receber pagamentos)
- [ ] Conta Fal.ai (geração de vídeos)
- [ ] Conta OpenAI (geração de fotos)
- [ ] Domínio próprio (opcional, mas recomendado)

---

## 1. Configurar Stripe

### 1.1 Criar Produtos e Preços

Acesse o [Stripe Dashboard](https://dashboard.stripe.com/) e crie:

#### Assinaturas Mensais:
1. **Starter — R$ 49/mês**
   - Produto: "Plano Starter"
   - Preço: R$ 49,00 BRL
   - Tipo: Recorrente (mensal)
   - Copie o **Price ID** (começa com `price_...`)
   - Cole no `.env` como `STRIPE_PRICE_STARTER`

2. **Pro — R$ 149/mês**
   - Produto: "Plano Pro"
   - Preço: R$ 149,00 BRL
   - Tipo: Recorrente (mensal)
   - Copie o **Price ID**
   - Cole no `.env` como `STRIPE_PRICE_PRO`

3. **Premium — R$ 349/mês**
   - Produto: "Plano Premium"
   - Preço: R$ 349,00 BRL
   - Tipo: Recorrente (mensal)
   - Copie o **Price ID**
   - Cole no `.env` como `STRIPE_PRICE_PREMIUM`

#### Pacotes Avulsos (pagamento único):
1. **Pacote 50 créditos — R$ 29**
   - Produto: "Pacote 50 créditos"
   - Preço: R$ 29,00 BRL
   - Tipo: Pagamento único (one-time)
   - Copie o **Price ID** → `STRIPE_PRICE_PACK_50`

2. **Pacote 200 créditos — R$ 99**
   - Produto: "Pacote 200 créditos"
   - Preço: R$ 99,00 BRL
   - Tipo: Pagamento único
   - Copie o **Price ID** → `STRIPE_PRICE_PACK_200`

3. **Pacote 500 créditos — R$ 199**
   - Produto: "Pacote 500 créditos"
   - Preço: R$ 199,00 BRL
   - Tipo: Pagamento único
   - Copie o **Price ID** → `STRIPE_PRICE_PACK_500`

### 1.2 Configurar Webhook

O webhook processa eventos de pagamento (assinatura criada, renovada, cancelada, etc.).

1. Acesse **Developers → Webhooks** no Stripe Dashboard
2. Clique em **Add endpoint**
3. URL do endpoint: `https://seu-dominio.com/api/stripe/webhook`
4. Selecione os eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copie o **Signing secret** (começa com `whsec_...`)
6. Cole no `.env` como `STRIPE_WEBHOOK_SECRET`

### 1.3 Habilitar Customer Portal

Permite que clientes gerenciem suas assinaturas:

1. Acesse **Settings → Billing → Customer Portal**
2. Ative o portal e configure:
   - ✅ Permitir cancelar assinatura
   - ✅ Permitir atualizar método de pagamento
   - ✅ Permitir ver faturas
3. Salve as configurações

### 1.4 Habilitar PIX (opcional, mas recomendado)

Para aceitar Pix nos pacotes avulsos:

1. Acesse **Settings → Payment methods**
2. Ative **Pix** (disponível apenas para contas brasileiras)
3. No arquivo `routes/stripe.js`, linha 115, descomente:
   ```javascript
   sessionConfig.payment_method_types = ['card', 'pix'];
   ```

---

## 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (baseado no `.env.example`):

```bash
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe (use as chaves LIVE em produção)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (copie dos produtos criados)
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_PREMIUM=price_...
STRIPE_PRICE_PACK_50=price_...
STRIPE_PRICE_PACK_200=price_...
STRIPE_PRICE_PACK_500=price_...

# APIs de IA
FAL_API_KEY=...
OPENAI_API_KEY=sk-...

# Servidor
PORT=3000
NODE_ENV=production

# Segurança
ALLOWED_ORIGINS=https://seu-dominio.com.br,https://www.seu-dominio.com.br
```

---

## 3. Deployment na Nuvem

Escolha uma das plataformas abaixo:

### Opção A: Railway (Recomendado para iniciantes)

1. Acesse [Railway.app](https://railway.app/) e crie uma conta
2. Clique em **New Project → Deploy from GitHub**
3. Conecte seu repositório
4. Railway detectará automaticamente Node.js
5. Configure as variáveis de ambiente:
   - Acesse o projeto → **Variables**
   - Cole todas as variáveis do `.env`
6. **Importante**: Adicione variável `PORT` com valor `3000`
7. Deploy será automático — copie a URL gerada
8. Configure domínio customizado (opcional):
   - Vá em **Settings → Domains**
   - Adicione seu domínio e configure DNS

**Custo**: ~$5-20/mês dependendo do tráfego

---

### Opção B: Render.com

1. Acesse [Render.com](https://render.com/) e crie uma conta
2. Clique em **New → Web Service**
3. Conecte seu repositório GitHub
4. Configurações:
   - **Name**: modelo-facil
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Starter ($7/mês) ou Free (com limitações)
5. Adicione as variáveis de ambiente (mesmo do `.env`)
6. Clique em **Create Web Service**

**Custo**: Grátis (com sleep após inatividade) ou $7/mês (Starter)

---

### Opção C: Fly.io

1. Instale o CLI do Fly:
   ```bash
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. Faça login:
   ```bash
   fly auth login
   ```

3. Na raiz do projeto, execute:
   ```bash
   fly launch
   ```

4. Siga o assistente:
   - Nome do app: modelo-facil
   - Região: São Paulo (gru)
   - Não adicione PostgreSQL (já usa Supabase)
   - Não adicione Redis (ainda não necessário)

5. Configure secrets (variáveis de ambiente):
   ```bash
   fly secrets set SUPABASE_URL=https://...
   fly secrets set SUPABASE_ANON_KEY=eyJ...
   fly secrets set STRIPE_SECRET_KEY=sk_live_...
   # ... repita para todas as variáveis
   ```

6. Deploy:
   ```bash
   fly deploy
   ```

**Custo**: ~$5-10/mês (inclui 256MB RAM)

---

## 4. Pós-Deployment

### 4.1 Testar Pagamentos

1. Acesse `https://seu-dominio.com/planos.html`
2. Clique em "Escolher Starter"
3. Use cartão de teste do Stripe:
   - Número: `4242 4242 4242 4242`
   - Validade: qualquer data futura
   - CVC: qualquer 3 dígitos
4. Complete o pagamento
5. Verifique:
   - Redirecionamento para `/billing/success`
   - Créditos creditados no banco (tabela `subscriptions`)
   - Email de confirmação enviado (se configurado no Stripe)

### 4.2 Configurar Domínio Customizado

Se você ainda não tem domínio:
1. Compre em [Registro.br](https://registro.br/) (R$ 40/ano para .com.br)
2. Configure os DNS apontando para seu servidor:
   - **Railway**: `A` record → IP fornecido pelo Railway
   - **Render**: `CNAME` record → `seu-app.onrender.com`
   - **Fly**: `CNAME` record → `seu-app.fly.dev`

3. Atualize `ALLOWED_ORIGINS` no `.env`:
   ```
   ALLOWED_ORIGINS=https://modelofacil.com.br,https://www.modelofacil.com.br
   ```

### 4.3 Configurar SSL/HTTPS

- **Railway/Render/Fly**: SSL automático ✅ (nada a fazer)
- Se usar servidor próprio: instale Let's Encrypt com Certbot

### 4.4 Monitoramento

Configure alertas para:
- **Saldo Fal.ai**: monitore em [fal.ai/dashboard](https://fal.ai/dashboard)
- **Saldo OpenAI**: configure alertas em [platform.openai.com](https://platform.openai.com/account/billing/overview)
- **Stripe balance**: acompanhe em [dashboard.stripe.com](https://dashboard.stripe.com)

Considere integrar:
- **Sentry** (monitoramento de erros): [sentry.io](https://sentry.io/)
- **Uptime monitoring**: [UptimeRobot](https://uptimerobot.com/) (grátis)

---

## 5. Segurança (Checklist Final)

- [ ] `.env` **NUNCA** commitado no git
- [ ] `node_modules` no `.gitignore`
- [ ] Stripe em modo **LIVE** (não test)
- [ ] `NODE_ENV=production` configurado
- [ ] `ALLOWED_ORIGINS` apenas com seu domínio
- [ ] SSL/HTTPS ativo
- [ ] Webhook Stripe configurado e testado
- [ ] Rate limiting ativo (já configurado no código)
- [ ] CORS configurado com origens específicas

---

## 6. Redis — Desenvolvimento vs Produção (FASE 3)

### Como Funciona o Sistema de Filas

O sistema detecta automaticamente se Redis está disponível:

- **Sem Redis (desenvolvimento):** Usa MockQueue — jobs processam inline automaticamente
- **Com Redis (produção):** Usa BullMQ — jobs entram na fila e workers processam em paralelo

### Desenvolvimento Local (Sem Redis)

Não precisa configurar nada! O sistema usa MockQueue automaticamente:

```bash
npm start
# Jobs processam inline — nenhuma configuração adicional necessária
```

### Produção (Com Redis)

Configure Redis e inicie 2 processos separados:

#### Passo 1: Configure Redis (Upstash — Grátis)

1. Acesse https://console.upstash.com/
2. Crie uma conta (grátis)
3. **Redis → Create Database**
4. Escolha região mais próxima (ex: São Paulo)
5. Copie a **Redis URL** (começa com `rediss://`)
6. Adicione ao `.env`:
   ```bash
   REDIS_URL=rediss://default:password@endpoint.upstash.io:6379
   ```

**Custo:** Grátis até 10.000 comandos/dia (suficiente para 100-200 jobs/dia)

#### Passo 2: Inicie Server + Workers

Em produção, rode 2 processos:

**Terminal 1 — Servidor Web:**
```bash
npm start
```

**Terminal 2 — Workers:**
```bash
npm run workers
```

**OU em plataformas cloud:**

Railway/Render/Fly.io suportam múltiplos processos. Configure:

- **Web:** `npm start`
- **Worker:** `npm run workers`

#### Escala Horizontal

- **1 worker** = ~3 fotos + 2 vídeos em paralelo
- **3 workers** = ~9 fotos + 6 vídeos em paralelo
- **10 workers** = ~30 fotos + 20 vídeos em paralelo

Todos os workers conectam ao mesmo Redis. Para escalar:
```bash
# Servidor 1
npm run workers

# Servidor 2 (outro container/VM)
npm run workers

# Servidor 3
npm run workers
```

---

## 7. Próximos Passos (Escala Avançada)

Após ter clientes pagando e Redis ativo, considere:

1. **CDN**: Para servir assets rapidamente
   - Cloudflare (grátis)
   - Bunny CDN ($1/mês)

2. **Backup automático**: Supabase já faz, mas configure exportações periódicas

3. **Analytics**: Google Analytics ou Plausible (GDPR-friendly)

4. **Monitoramento de Filas**: BullBoard para visualizar jobs
   ```bash
   npm install -g @bull-board/express
   ```

---

## 8. Suporte

Se encontrar problemas:
1. Confira logs do servidor (`fly logs` / Railway/Render dashboard)
2. Teste webhooks do Stripe no dashboard (Developers → Webhooks → Testing)
3. Verifique se todas as variáveis de ambiente estão corretas

**Boa sorte no lançamento! 🚀**
