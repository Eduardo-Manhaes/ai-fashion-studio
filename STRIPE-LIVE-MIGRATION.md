# 🔄 MIGRAÇÃO STRIPE: TEST → LIVE

**Status Atual:** Modo TEST (chaves sk_test_...)  
**Objetivo:** Ativar pagamentos reais com chaves LIVE  
**Tempo Estimado:** 30 minutos + 1-2 dias de aprovação Stripe

---

## ⚠️ IMPORTANTE — LEIA ANTES DE COMEÇAR

1. **Sistema atual está 100% funcional em TEST**
2. **Produtos TEST não aparecem em LIVE** — você precisará recriá-los
3. **Aprovação do Stripe leva 1-2 dias úteis** após enviar documentação
4. **Tenha em mãos:** CNPJ, dados bancários, documentos da empresa
5. **Faça backup** das chaves TEST antes de trocar

---

## 📋 FASE 1: ATIVAR CONTA STRIPE PARA PRODUÇÃO

### **PASSO 1.1: Completar Onboarding**

1. Acesse: **https://dashboard.stripe.com/account/onboarding**
2. O Stripe vai solicitar:

**Dados da Empresa:**
- Razão social
- CNPJ
- Endereço completo
- Telefone comercial
- Website (pode usar a URL do Railway)
- Descrição do negócio

**Dados Bancários:**
- Banco
- Agência
- Conta corrente (PJ)
- Nome do titular

**Documentos:**
- Cartão CNPJ
- Comprovante de endereço da empresa
- Documento do representante legal (RG/CNH)
- Contrato social (pode ser solicitado)

### **PASSO 1.2: Aguardar Aprovação**

1. Stripe analisa os documentos (**1-2 dias úteis**)
2. Você receberá email quando for aprovado
3. Pode continuar usando TEST enquanto aguarda

**⏸️ NÃO CONTINUE ATÉ RECEBER APROVAÇÃO DO STRIPE**

---

## 📋 FASE 2: OBTER CHAVES LIVE

### **PASSO 2.1: Acessar Dashboard LIVE**

1. Acesse: **https://dashboard.stripe.com/apikeys**
   - ⚠️ **SEM /test/** na URL (modo LIVE)
2. Na parte superior direita, confirme que está em **"View live data"**
3. Você verá:
   - **Publishable key:** começa com `pk_live_...`
   - **Secret key:** clique em "Reveal" para ver, começa com `sk_live_...`

### **PASSO 2.2: Copiar e Guardar as Chaves**

**⚠️ IMPORTANTE: Guarde as chaves em local seguro!**

```
STRIPE_PUBLISHABLE_KEY=[SUA_CHAVE_PUBLISHABLE_LIVE_AQUI]
STRIPE_SECRET_KEY=[SUA_CHAVE_SECRET_LIVE_AQUI]
```

**Dica de Segurança:**
- NÃO commite essas chaves no Git
- NÃO compartilhe em Slack/email
- Guarde em gerenciador de senhas
- Anote em papel se necessário (depois destrua)

**Formato das chaves (exemplo genérico):**
```
STRIPE_PUBLISHABLE_KEY=[COMEÇA_COM_pk_live_]
STRIPE_SECRET_KEY=[COMEÇA_COM_sk_live_]
```

---

## 📋 FASE 3: RECRIAR PRODUTOS EM MODO LIVE

### **Por que recriar?**
Produtos criados em TEST não aparecem em LIVE. Você precisa criar novamente.

### **PASSO 3.1: Criar Plano Básico**

1. Acesse: **https://dashboard.stripe.com/products** (sem /test/)
2. Clique em **"+ Add product"**
3. Configure:

```
Name: Modelo Fácil - Básico
Description: 20 créditos/mês — ~10 fotos ou 2 vídeos de movimento

Pricing model: Standard pricing
Price: R$ 35,00
Billing period: Monthly
Currency: BRL (Brazilian Real)
```

4. Clique em **"Save product"**
5. **⚠️ COPIE O PRICE ID:** `price_xxxxxxxxxxxxxxxxxxxxx`

### **PASSO 3.2: Criar Plano Starter**

Repita o processo:

```
Name: Modelo Fácil - Starter
Description: 50 créditos/mês — ~25 fotos ou 6 vídeos de movimento
Price: R$ 79,00
Billing period: Monthly
```

**⚠️ COPIE O PRICE ID:** `price_xxxxxxxxxxxxxxxxxxxxx`

### **PASSO 3.3: Criar Plano Pro**

```
Name: Modelo Fácil - Pro
Description: 120 créditos/mês — ~60 fotos ou 15 vídeos de movimento
Price: R$ 159,00
Billing period: Monthly
```

**⚠️ COPIE O PRICE ID:** `price_xxxxxxxxxxxxxxxxxxxxx`

### **PASSO 3.4: Anotar os Price IDs**

```
STRIPE_PRICE_BASICO=price_live_xxxxxxxxxxxxx
STRIPE_PRICE_STARTER=price_live_xxxxxxxxxxxxx
STRIPE_PRICE_PRO=price_live_xxxxxxxxxxxxx
```

---

## 📋 FASE 4: RECRIAR WEBHOOK EM MODO LIVE

### **PASSO 4.1: Criar Endpoint**

1. Acesse: **https://dashboard.stripe.com/webhooks** (sem /test/)
2. Clique em **"Add endpoint"**
3. Configure:

**Endpoint URL:**
```
https://web-production-6ab20.up.railway.app/api/stripe/webhook
```

**Description:**
```
Webhook de produção - Modelo Fácil
```

**Events to send:** Selecione exatamente estes 5:
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

4. Clique em **"Add endpoint"**

### **PASSO 4.2: Obter Signing Secret**

1. Na página do webhook recém-criado
2. Role até a seção **"Signing secret"**
3. Clique em **"Reveal"**
4. **⚠️ COPIE O SECRET:** `whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

```
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 📋 FASE 5: ATUALIZAR VARIÁVEIS NO RAILWAY

### **PASSO 5.1: Acessar Railway Dashboard**

1. Acesse: **https://railway.app/dashboard**
2. Selecione o projeto **ai-fashion-studio**
3. Clique na aba **"Variables"**

### **PASSO 5.2: Atualizar 6 Variáveis**

**⚠️ ATENÇÃO: Anote os valores TEST antes de apagar (para rollback)**

Atualize **UMA POR VEZ** na seguinte ordem:

#### **1. STRIPE_SECRET_KEY**
- **Valor antigo (TEST):** `sk_test_51TZI1y2KyFcexK6N...`
- **Novo valor (LIVE):** `sk_live_xxxxxxxxxxxxx` (da Fase 2)

#### **2. STRIPE_PUBLISHABLE_KEY**
- **Valor antigo (TEST):** `pk_test_51TZI1y2KyFcexK6N...`
- **Novo valor (LIVE):** `pk_live_xxxxxxxxxxxxx` (da Fase 2)

#### **3. STRIPE_WEBHOOK_SECRET**
- **Valor antigo (TEST):** `whsec_8aBDcbYnt3N8Z71CVTAK0j0sLRiXEqE3`
- **Novo valor (LIVE):** `whsec_xxxxxxxxxxxxx` (da Fase 4)

#### **4. STRIPE_PRICE_BASICO**
- **Valor antigo (TEST):** `price_1TZI7y2KyFcexK6NDYjNYVHg`
- **Novo valor (LIVE):** `price_xxxxxxxxxxxxx` (Básico da Fase 3)

#### **5. STRIPE_PRICE_STARTER**
- **Valor antigo (TEST):** `price_1TZI7y2KyFcexK6NEi3RWiHS`
- **Novo valor (LIVE):** `price_xxxxxxxxxxxxx` (Starter da Fase 3)

#### **6. STRIPE_PRICE_PRO**
- **Valor antigo (TEST):** `price_1TZI7z2KyFcexK6Nuh6jr52G`
- **Novo valor (LIVE):** `price_xxxxxxxxxxxxx` (Pro da Fase 3)

### **PASSO 5.3: Salvar e Aguardar Deploy**

1. Após atualizar todas as 6 variáveis, clique em **"Save"**
2. Railway fará **redeploy automático** (1-2 minutos)
3. Aguarde até ver **"ACTIVE"** no status do deploy

---

## 📋 FASE 6: VALIDAÇÃO PÓS-MIGRAÇÃO

### **TESTE 1: Verificar Endpoint Público**

```bash
node --use-system-ca -e "
fetch('https://web-production-6ab20.up.railway.app/api/public-config')
  .then(r => r.json())
  .then(d => console.log('✅ Servidor respondendo:', d.supabaseUrl))
"
```

**Esperado:** Servidor responde normalmente

### **TESTE 2: Verificar Webhook no Stripe**

1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique no webhook de produção
3. Clique em **"Send test webhook"**
4. Selecione `checkout.session.completed`
5. Clique em **"Send test webhook"**

**Esperado:**
- Status: `200 OK`
- Se falhar, verifique logs no Railway

### **TESTE 3: Checkout Real (Valor Mínimo)**

**⚠️ ESTE É UM PAGAMENTO REAL — VOCÊ SERÁ COBRADO**

1. Acesse: https://web-production-6ab20.up.railway.app
2. Faça login ou crie conta
3. Clique em **"Assinar Básico"** (R$ 35)
4. Use **SEU CARTÃO REAL** (não o 4242...)
5. Complete o checkout

**Esperado:**
- Checkout completa com sucesso
- Você recebe email do Stripe confirmando
- Créditos aparecem na sua conta (20 créditos)
- Você pode gerar uma foto/vídeo

### **TESTE 4: Verificar Créditos**

1. No app, tente gerar uma **foto** (custa 2 créditos)
2. Verifique se:
   - Foto foi gerada
   - Créditos foram debitados (de 20 → 18)
   - Histórico mostra a geração

### **TESTE 5: Verificar Logs**

**Railway:**
1. Acesse: https://railway.app/dashboard → Logs
2. Procure por: `[STRIPE WEBHOOK]`
3. Deve mostrar: `checkout.session.completed`

**Stripe:**
1. Acesse: https://dashboard.stripe.com/logs
2. Verifique eventos recentes
3. Webhook deve mostrar `200 OK`

---

## 🚨 FASE 7: ROLLBACK (SE NECESSÁRIO)

### **Quando fazer rollback?**
- Webhook não está funcionando
- Checkout retorna erro
- Créditos não são creditados
- Qualquer outro problema crítico

### **Como voltar para TEST:**

1. Acesse Railway Dashboard → Variables
2. Reverta as 6 variáveis para os valores TEST:

```bash
# Valores TEST (backup) - SUBSTITUA PELOS SEUS VALORES REAIS
STRIPE_SECRET_KEY=[CHAVE_TEST_DO_SEU_ENV_LOCAL]
STRIPE_PUBLISHABLE_KEY=[CHAVE_TEST_DO_SEU_ENV_LOCAL]
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXX (copie do seu .env local)
STRIPE_PRICE_BASICO=price_XXXXXXXX (copie do seu .env local)
STRIPE_PRICE_STARTER=price_XXXXXXXX (copie do seu .env local)
STRIPE_PRICE_PRO=price_XXXXXXXX (copie do seu .env local)
```

3. Clique **"Save"** e aguarde redeploy
4. Teste novamente com cartão `4242 4242 4242 4242`

---

## 📊 CHECKLIST FINAL

### **Antes de Migrar**
- [ ] Sistema funcionando 100% em TEST
- [ ] Conta Stripe aprovada para produção
- [ ] Dados bancários cadastrados
- [ ] Chaves TEST anotadas (para rollback)

### **Durante a Migração**
- [ ] Chaves LIVE obtidas (pk_live_, sk_live_)
- [ ] 3 produtos recriados em LIVE
- [ ] 3 Price IDs copiados (Básico, Starter, Pro)
- [ ] Webhook recriado em LIVE
- [ ] Webhook secret copiado (whsec_)
- [ ] 6 variáveis atualizadas no Railway
- [ ] Deploy concluído sem erros

### **Validação**
- [ ] Servidor respondendo normalmente
- [ ] Webhook teste enviado com sucesso (200 OK)
- [ ] Checkout real completado
- [ ] Créditos creditados corretamente
- [ ] Foto/vídeo gerado com sucesso
- [ ] Créditos debitados corretamente
- [ ] Logs do Railway sem erros
- [ ] Logs do Stripe sem erros

---

## 💡 DICAS IMPORTANTES

### **Durante a Migração:**
1. **Faça fora do horário de pico** (madrugada/fim de semana)
2. **Avise usuários** se já tiver clientes
3. **Teste tudo** antes de anunciar
4. **Mantenha backup** das chaves TEST

### **Após a Migração:**
1. **Monitore logs** nas primeiras 24h
2. **Responda rápido** se usuários reportarem problemas
3. **Teste diariamente** nos primeiros dias
4. **Documente qualquer problema** para referência

### **Segurança:**
1. **NUNCA** commite chaves LIVE no Git
2. **Restrinja acesso** ao Railway Dashboard
3. **Use 2FA** no Stripe e Railway
4. **Revise logs** regularmente

---

## 📞 SUPORTE

### **Se algo der errado:**

1. **Rollback imediato** (usar valores TEST)
2. **Verificar logs:**
   - Railway: https://railway.app/dashboard
   - Stripe: https://dashboard.stripe.com/logs
3. **Suporte Stripe:**
   - Email: support@stripe.com
   - Chat: disponível no dashboard
   - Docs: https://stripe.com/docs

### **Problemas Comuns:**

**Webhook retorna 401:**
- Webhook secret errado
- Verificar `STRIPE_WEBHOOK_SECRET` no Railway

**Checkout não carrega:**
- Price ID errado
- Verificar `STRIPE_PRICE_*` no Railway

**Créditos não creditam:**
- Webhook não está disparando
- Verificar eventos selecionados no webhook
- Verificar logs do Railway

---

## ✅ CONCLUSÃO

Após seguir todos os passos e validar que está funcionando:

**🎉 VOCÊ ESTÁ PRONTO PARA ACEITAR PAGAMENTOS REAIS!**

O sistema agora:
- ✅ Processa pagamentos reais via Stripe
- ✅ Credita créditos automaticamente
- ✅ Debita créditos nas gerações
- ✅ Webhooks funcionando em LIVE
- ✅ Pronto para crescer

**Próximos passos:**
1. Divulgar o sistema
2. Monitorar primeiros clientes
3. Coletar feedback
4. Iterar e melhorar

**BOA SORTE COM O LANÇAMENTO! 🚀**

---

**Documento criado em:** 21/05/2026  
**Versão:** 1.0  
**Autor:** Claude Code (Anthropic)
