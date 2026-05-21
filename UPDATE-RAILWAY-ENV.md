# ⚠️ AÇÃO NECESSÁRIA: Atualizar STRIPE_WEBHOOK_SECRET no Railway

## Webhook Configurado
- ✅ Endpoint criado: `https://web-production-6ab20.up.railway.app/api/stripe/webhook`
- ✅ ID: `we_1TZWLR2KyFcexK6NSSelfzSk`
- ✅ 48 eventos configurados

## Atualização Necessária

**Acesse Railway Dashboard:**
1. https://railway.app/dashboard
2. Selecione o projeto **ai-fashion-studio**
3. Aba **"Variables"**
4. Encontre `STRIPE_WEBHOOK_SECRET`
5. Atualize o valor para:
   ```
   whsec_8aBDcbYnt3N8Z71CVTAK0j0sLRiXEqE3
   ```
6. Clique em **"Save"** ou **"Deploy"**

**Validação:**
Após atualizar, o Railway fará redeploy automático (1-2 minutos).

## Deletar este arquivo após concluir
Este arquivo contém informação sensível e deve ser deletado após atualizar o Railway.
