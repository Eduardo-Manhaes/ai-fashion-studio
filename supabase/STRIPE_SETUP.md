# Setup Stripe — AI Fashion Studio

## 1. Garantir conta em modo TEST
1. Acesse https://dashboard.stripe.com
2. No canto superior, confirme que o toggle está em **"Test mode"** (laranja)
3. Trabalharemos 100% em test até o lançamento

## 2. Criar os 3 produtos de assinatura
Para cada plano (Starter, Pro, Enterprise):

1. Products → Add product
2. Preencher:
   - **Starter**: nome "AI Fashion Studio Starter", descrição "50 créditos/mês"
     - Pricing: Recurring, R$ 49.00 BRL, monthly
   - **Pro**: nome "AI Fashion Studio Pro", descrição "200 créditos/mês"
     - Pricing: Recurring, R$ 149.00 BRL, monthly
   - **Enterprise**: nome "AI Fashion Studio Enterprise", descrição "1000 créditos/mês"
     - Pricing: Recurring, R$ 599.00 BRL, monthly
3. Save product
4. Copie o **Price ID** (formato `price_1ABC...`) de cada um

Cole no `.env`:
```
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_ENTERPRISE=price_...
```

## 3. Criar os 3 pacotes de crédito avulso
Para cada pack (50, 200, 500):

1. Products → Add product
2. Preencher:
   - **Pack 50**: "Pacote 50 créditos AI Fashion"
     - Pricing: One-time, R$ 29.00 BRL
   - **Pack 200**: "Pacote 200 créditos AI Fashion"
     - Pricing: One-time, R$ 99.00 BRL
   - **Pack 500**: "Pacote 500 créditos AI Fashion"
     - Pricing: One-time, R$ 219.00 BRL
3. Copie os Price IDs

Cole no `.env`:
```
STRIPE_PRICE_PACK_50=price_...
STRIPE_PRICE_PACK_200=price_...
STRIPE_PRICE_PACK_500=price_...
```

## 4. Pegar as keys da API
1. Developers → API keys
2. Copie:
   - **Publishable key** (`pk_test_...`) → `STRIPE_PUBLISHABLE_KEY` no `.env`
   - **Secret key** (`sk_test_...`) → `STRIPE_SECRET_KEY` no `.env`

⚠️ Nunca exponha a Secret key no frontend.

## 5. Configurar Customer Portal
1. Settings → Billing → Customer portal
2. Habilitar "Allow customers to..."
   - ✅ Update payment methods
   - ✅ Cancel subscriptions
   - ✅ Switch plans (entre os 3 que você criou)
   - ✅ View invoices
3. Save

## 6. Instalar Stripe CLI (testar webhook localmente)

### Windows (PowerShell):
```powershell
scoop install stripe
# OU baixar de: https://github.com/stripe/stripe-cli/releases
```

### Login:
```bash
stripe login
```

### Iniciar tunneling do webhook pro localhost:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

A CLI vai imprimir um **webhook signing secret** (formato `whsec_...`).
Cole no `.env`:
```
STRIPE_WEBHOOK_SECRET=whsec_...
```

⚠️ Esse secret é diferente do secret que você usaria em produção (que vem do dashboard).

## 7. Configurar webhook em produção (depois)
Quando for pra produção:
1. Developers → Webhooks → Add endpoint
2. URL: `https://seu-dominio.com/api/stripe/webhook`
3. Eventos a escutar:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Copie o signing secret de produção

## 8. Habilitar Pix (opcional, recomendado)
Para que pacotes avulsos aceitem Pix:
1. Settings → Payment methods
2. Localize "Pix" na lista
3. Click "Activate"
4. Pode pedir documentação adicional (CNPJ, dados bancários)
5. Após ativar, descomente em `routes/stripe.js`:
```javascript
   sessionConfig.payment_method_types = ['card', 'pix'];
```

## 9. Testar o fluxo completo

### Cartões de teste:
- Sucesso: `4242 4242 4242 4242`
- Recusa: `4000 0000 0000 0002`
- Requer auth 3DS: `4000 0025 0000 3155`
- Validade: qualquer data futura | CVC: qualquer 3 dígitos

### Fluxo de teste:
1. Aplique migration 004 no Supabase SQL Editor
2. Preencha `.env` com todos os valores
3. Em um terminal: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. Em outro: `npm start`
5. Pegue um JWT do usuário de teste (já criado na Fase 1A)
6. Teste o endpoint:
```bash
   curl -X POST http://localhost:3000/api/stripe/create-checkout \
     -H "Authorization: Bearer SEU_JWT" \
     -H "Content-Type: application/json" \
     -d '{"type":"subscription","plan_id":"pro"}'
```
7. Abra a `url` retornada no navegador, complete checkout com cartão de teste
8. Verifique no terminal da CLI Stripe que os eventos estão chegando
9. Verifique no Supabase que `subscriptions` foi criada/atualizada
10. Teste `/api/me` — deve retornar a subscription Pro ativa
