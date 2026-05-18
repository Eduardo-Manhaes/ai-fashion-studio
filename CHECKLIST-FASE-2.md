# ✅ Checklist FASE 2 — Produto Cobrável

Este documento rastreia o progresso da FASE 2: tornar o produto monetizável.

## Status Geral: 🟢 COMPLETO

---

## 1. Segurança de Produção

### Middleware de Segurança ✅
- [x] Helmet instalado e configurado
- [x] CORS configurado com validação de origem
- [x] Rate limiting global (100 req/15min)
- [x] Rate limiting de autenticação (5 req/15min)
- [x] Rate limiting de geração (10 req/min)
- [x] TLS bypass removido

### Endpoints Protegidos ✅
- [x] Endpoints inseguros removidos:
  - `/api/test/check-input-payload`
  - `/api/run` (legacy FASHN)
  - `/api/status/:id` (legacy sem auth)
- [x] Admin endpoints protegidos (requireAuth)
- [x] Rate limiters aplicados a rotas de geração

### Limpeza de Logs ✅
- [x] Debug logs removidos de /api/me/generations
- [x] Console.logs desnecessários limpos

---

## 2. Página de Planos ✅

### Criação da Página ✅
- [x] `public/planos.html` criado
- [x] Design responsivo com 3 tiers
- [x] Integração com Supabase Auth
- [x] Integração com Stripe Checkout

### Planos Configurados ✅
- [x] **Starter**: R$ 49/mês — 50 créditos
- [x] **Pro**: R$ 149/mês — 200 créditos (Mais Popular)
- [x] **Premium**: R$ 349/mês — 500 créditos

### Funcionalidades ✅
- [x] Botões de seleção funcionais
- [x] Verificação de autenticação
- [x] Redirecionamento para login se não autenticado
- [x] Loading state durante processamento
- [x] Link de retorno ao app

---

## 3. Integração Stripe ✅

### Modificações no Backend ✅
- [x] `routes/stripe.js` aceita parâmetro "plan"
- [x] Alias "plan" como "plan_id" para compatibilidade
- [x] "premium" adicionado ao mapeamento de preços
- [x] Auto-detecção de type (subscription vs pack)

### Endpoints ✅
- [x] POST `/api/stripe/create-checkout` — cria sessão
- [x] POST `/api/stripe/portal` — gerenciar assinatura
- [x] GET `/api/stripe/session/:session_id` — detalhes da sessão

### Páginas de Billing ✅
- [x] `public/billing/success.html` criado
- [x] `public/billing/cancel.html` criado
- [x] Success page busca detalhes da sessão
- [x] Success page mostra plano/créditos
- [x] Cancel page oferece voltar ou ver planos novamente

---

## 4. Preparação para Deploy ✅

### Documentação ✅
- [x] `DEPLOY-GUIDE.md` criado com:
  - Instruções Stripe (produtos, preços, webhook)
  - Guia de variáveis de ambiente
  - Instruções Railway/Render/Fly.io
  - Checklist de segurança
  - Configuração de domínio
  - Monitoramento e próximos passos

### Variáveis de Ambiente ✅
- [x] `.env.example` atualizado com:
  - `STRIPE_PRICE_PREMIUM`
  - `ALLOWED_ORIGINS`
  - Comentários explicativos

### Pacotes ✅
- [x] helmet instalado
- [x] cors instalado
- [x] express-rate-limit instalado

---

## Próximos Passos (FASE 3 — quando tiver clientes pagando)

### Redis + BullMQ
- [ ] Configurar Redis (Upstash recomendado)
- [ ] Ativar job queues no código
- [ ] Iniciar workers em processo separado
- [ ] Implementar retry logic robusto

### CDN e Performance
- [ ] Configurar Cloudflare ou Bunny CDN
- [ ] Implementar cache de assets
- [ ] Otimizar imagens/vídeos

### Monitoramento
- [ ] Integrar Sentry para tracking de erros
- [ ] Configurar Uptime Robot
- [ ] Alertas de saldo API (Fal.ai, OpenAI)

---

## Para Ir ao Ar AGORA

1. **Configure Stripe Dashboard**:
   - Crie 3 produtos de assinatura (Starter, Pro, Premium)
   - Crie 3 produtos de pacotes avulsos
   - Copie os Price IDs para o `.env`
   - Configure webhook apontando para `/api/stripe/webhook`
   - Ative Customer Portal

2. **Configure `.env` em Produção**:
   ```bash
   # Use chaves LIVE do Stripe
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   
   # Price IDs dos produtos criados
   STRIPE_PRICE_STARTER=price_...
   STRIPE_PRICE_PRO=price_...
   STRIPE_PRICE_PREMIUM=price_...
   STRIPE_PRICE_PACK_50=price_...
   STRIPE_PRICE_PACK_200=price_...
   STRIPE_PRICE_PACK_500=price_...
   
   # Domínio de produção
   ALLOWED_ORIGINS=https://seu-dominio.com.br
   
   NODE_ENV=production
   ```

3. **Deploy**:
   - Escolha Railway, Render, ou Fly.io
   - Configure todas as variáveis de ambiente
   - Faça o deploy do código atual
   - Teste o fluxo completo de pagamento

4. **Teste em Produção**:
   - Acesse `/planos.html`
   - Faça uma compra teste (use cartão teste do Stripe)
   - Verifique se webhook foi recebido
   - Confirme créditos no banco
   - Gere uma foto para confirmar que está funcionando

---

## 🎉 FASE 2 CONCLUÍDA!

O produto está **pronto para cobrar**. Próximo passo: deploy e primeiros clientes!
