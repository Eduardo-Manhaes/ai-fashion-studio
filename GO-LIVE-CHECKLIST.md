# ✅ CHECKLIST DE GO-LIVE — Modelo Fácil

**Data de Validação:** 21 de Maio de 2026  
**Ambiente:** Railway Production  
**URL:** https://web-production-6ab20.up.railway.app

---

## 🟢 COMPLETO — Pronto para Produção

### **1. INFRAESTRUTURA** (3/3) ✅
- [x] Servidor online e respondendo (HTTP 200)
- [x] HTTPS ativo (TLS/SSL configurado)
- [x] Security headers configurados (HSTS, X-Frame-Options, etc)

### **2. BANCO DE DADOS** (3/3) ✅
- [x] Supabase conectado e acessível
- [x] Planos configurados (Básico R$35, Starter R$79, Pro R$159)
- [x] Custos de geração atualizados (foto=2, movimento=8, falando=15)

### **3. STRIPE & PAGAMENTOS** (4/4) ✅
- [x] Chaves Stripe configuradas (modo TEST)
- [x] 3 produtos criados no Dashboard
- [x] Webhook configurado (48 eventos)
- [x] Criação de checkout funcional

### **4. APIS DE IA** (4/4) ✅
- [x] FASHN API (geração de fotos V2)
- [x] OpenAI API (GPT Image 2 para fotos V3)
- [x] Fal.ai API (Kling + Veo 3 para vídeos)
- [x] 28 modelos preset carregados

### **5. FUNCIONALIDADES CRÍTICAS** (4/4) ✅
- [x] Landing page acessível
- [x] Página de planos funcional
- [x] App principal (index.html) carrega
- [x] Rate limiting ativo (100 req/janela)

### **6. SISTEMA DE CRÉDITOS** (3/3) ✅
- [x] RPC debit_credits funcional
- [x] RPC refund_credits funcional
- [x] Sistema de quota mandatório (BYPASS removido)

### **7. QUEUE SYSTEM** (1/1) ✅
- [x] MockQueue ativo (processamento inline)
- [ ] Redis/Upstash (opcional - adiado para escala)

### **8. CÓDIGO & DEPLOY** (5/5) ✅
- [x] Git: 5 commits do Dia 3 realizados
- [x] Railway: Deploy automático ativo
- [x] Sem credenciais hardcoded
- [x] .env.example atualizado
- [x] .gitignore protegendo arquivos sensíveis

---

## 🟡 PENDENTE — Ações Antes do Go-Live Real

### **1. TESTE MANUAL COMPLETO**
- [ ] Criar conta de teste
- [ ] Fazer checkout de um plano
- [ ] Gerar uma foto
- [ ] Gerar um vídeo
- [ ] Verificar débito de créditos
- [ ] Verificar webhook recebido (logs Railway)

### **2. STRIPE — MODO LIVE**
⚠️ **IMPORTANTE:** Atualmente em modo TEST. Antes de liberar para clientes reais:
- [ ] Trocar `STRIPE_SECRET_KEY` para `sk_live_...`
- [ ] Trocar `STRIPE_PUBLISHABLE_KEY` para `pk_live_...`
- [ ] Criar produtos no Stripe LIVE Dashboard
- [ ] Atualizar Price IDs no Railway (BASICO, STARTER, PRO)
- [ ] Criar webhook em LIVE apontando para produção
- [ ] Atualizar `STRIPE_WEBHOOK_SECRET` no Railway

### **3. DOMÍNIO CUSTOMIZADO** (Opcional)
- [ ] Configurar `modelofacil.ia.br` ou outro domínio
- [ ] Atualizar DNS (CNAME para Railway)
- [ ] Atualizar `ALLOWED_ORIGINS` no Railway
- [ ] Atualizar URL do webhook no Stripe

### **4. MONITORAMENTO**
- [ ] Configurar alertas no Railway (opcional)
- [ ] Definir processo de monitoramento de logs
- [ ] Criar canal de suporte (WhatsApp/Email)

### **5. DOCUMENTAÇÃO**
- [ ] Preparar FAQ para usuários
- [ ] Documentar processo de suporte
- [ ] Criar guia de troubleshooting interno

---

## 📊 TESTES REALIZADOS

### **Dia 1 — Correções de Código** ✅
- 5/5 bloqueadores resolvidos
- Modal "sem créditos" funcional
- Pipeline V3 (GPT Image 2) ativo no frontend
- Endpoints de status protegidos
- Código limpo e sanitizado

### **Dia 2 — Stripe & Billing** ✅
- 6/6 testes de billing aprovados
- Produtos criados no Stripe
- Custos atualizados no banco
- Webhooks configurados

### **Dia 3 — Deploy & Produção** ✅
- 11/11 testes end-to-end aprovados (100%)
- Infraestrutura validada
- APIs funcionando
- Pagamentos testados

---

## 🚀 COMANDOS ÚTEIS

### **Verificar Status em Produção**
```bash
node --use-system-ca check-production-config.js
```

### **Testar Fluxo Completo**
```bash
node --use-system-ca test-production-e2e.js
```

### **Verificar Webhook**
```bash
node --use-system-ca test-webhook.js
```

### **Testar Billing Localmente**
```bash
node --use-system-ca test-billing-flow.js
```

---

## 📞 SUPORTE

### **Em caso de problemas:**
1. **Logs do Railway:** https://railway.app/dashboard → Logs
2. **Logs do Stripe:** https://dashboard.stripe.com/test/logs
3. **Status do Supabase:** https://status.supabase.com/

### **Contatos:**
- Dev: Eduardo Manhães
- Email: eduardomanhaesmaciel@gmail.com

---

## 🎯 PRÓXIMO PASSO IMEDIATO

**TESTE MANUAL AGORA:**
1. Acesse: https://web-production-6ab20.up.railway.app
2. Crie uma conta
3. Tente fazer checkout de um plano (use cartão teste: 4242 4242 4242 4242)
4. Gere uma foto ou vídeo
5. Verifique se os créditos foram debitados

**Se tudo funcionar → Sistema pronto para anúncio! 🎉**
