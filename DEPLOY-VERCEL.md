# 🚀 Guia de Deploy no Vercel

## ✅ Pré-requisitos Concluídos

Os seguintes arquivos já foram criados automaticamente:
- ✅ `vercel.json` - Configuração do Vercel para Node.js/Express
- ✅ `.vercelignore` - Arquivos que não devem ser enviados
- ✅ `server.js` - Ajustado para funcionar no Vercel

## 📋 Passos para Deploy

### 1. Commit das Alterações

Primeiro, vamos salvar todas as mudanças no Git:

```bash
git add vercel.json .vercelignore server.js
git commit -m "feat: configuração para deploy no Vercel"
```

### 2. Push para o GitHub

```bash
git push origin master
```

Se ainda não tiver um repositório no GitHub, crie um:
1. Acesse https://github.com/new
2. Crie um repositório (pode ser público ou privado)
3. Execute os comandos que aparecem na tela

### 3. Deploy no Vercel (via Chrome com Claude)

**Use o prompt abaixo para o Claude no Chrome fazer o deploy:**

---

## 🤖 PROMPT PARA O CLAUDE NO CHROME

```
Preciso fazer deploy de um aplicativo Node.js/Express no Vercel. Por favor, siga estes passos:

1. Acesse https://vercel.com e faça login (ou crie conta com GitHub)

2. Clique em "Add New Project"

3. Conecte o repositório GitHub: Eduardo-Manhaes/<nome-do-repositório>

4. Configure as variáveis de ambiente (Environment Variables):

FASHN_API_KEY=fa-8CosPvxpdvED-gMhDeqyzTmS4RlnmDbIlUrAs
FAL_API_KEY=17c89a53-541e-4820-9903-85435b7962f5:28f53419d27412df20b148fd09af0724
GOOGLE_AI_KEY=AIzaSyBmKwD2HMfgm1trViOSmFFHWBxfqp_M9Ug
OPENAI_API_KEY=[COPIAR_DO_ARQUIVO_.ENV]
SUPABASE_URL=https://tlzailaxkofbqyfqhwbx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsemFpbGF4a29mYnF5ZnFod2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NTg4NTQsImV4cCI6MjA5MzMzNDg1NH0.NdMRyKSWHbcM-d_CpMI2czxoMSsA6tsLdSz4QEeS1Mc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsemFpbGF4a29mYnF5ZnFod2J4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzc1ODg1NCwiZXhwIjoyMDkzMzM0ODU0fQ.RvbEyL4BqX81w4QN_DCueG-xV-4Vb9KCaJ13yt3RLdA
NODE_ENV=production
PORT=3000

⚠️ IMPORTANTE: Configure cada variável SEPARADAMENTE no Vercel (Add Another) e aplique para: Production, Preview e Development

5. Em "Build & Development Settings":
   - Framework Preset: Other
   - Build Command: (deixe vazio)
   - Output Directory: (deixe vazio)
   - Install Command: npm install

6. Clique em "Deploy" e aguarde

7. Após o deploy:
   - Copie a URL gerada (algo como: https://seu-projeto.vercel.app)
   - Teste acessando a URL
   - Verifique se a aplicação está funcionando

8. Configure o domínio personalizado (opcional):
   - Vá em Settings → Domains
   - Adicione seu domínio custom se tiver

9. Me retorne:
   - ✅ URL do projeto no Vercel
   - ✅ Status do deploy (sucesso/erro)
   - ✅ Qualquer erro que aparecer nos logs
```

---

## 🔧 Configurações Importantes

### CORS e Origens Permitidas

Após o deploy, você precisa adicionar a URL do Vercel às origens permitidas:

1. No Vercel, vá em Settings → Environment Variables
2. Adicione/edite a variável `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS=https://seu-projeto.vercel.app,http://localhost:3000
   ```
3. Faça redeploy para aplicar

### Stripe Webhook (quando configurar pagamentos)

O Stripe precisa da URL pública para webhooks:
```
https://seu-projeto.vercel.app/api/stripe/webhook
```

Configure isso no dashboard do Stripe em Developers → Webhooks.

## 📊 Monitoramento

Após o deploy, monitore:
- **Logs**: Vercel Dashboard → Deployments → View Logs
- **Funções**: Vercel Dashboard → Functions (tempo de execução)
- **Uso**: Vercel Dashboard → Analytics

## ⚠️ Limitações do Vercel (Free Plan)

- ⏱️ Timeout de 10 segundos para funções serverless
- 💾 100GB de bandwidth por mês
- 🔄 Até 100 deploys por dia
- 💰 Considere upgrade para Pro se precisar de:
  - Timeouts maiores (até 60s)
  - Mais bandwidth
  - Suporte prioritário

## 🐛 Troubleshooting

### Erro: Function timeout
- Reduza o timeout nas requisições de vídeo
- Use polling mais agressivo
- Considere processar em background

### Erro: Module not found
- Verifique se todas as dependências estão no `package.json`
- Execute `npm install` localmente para confirmar

### Erro: Environment variables
- Confirme que todas as variáveis estão configuradas no Vercel
- Verifique se não há espaços extras nos valores

## ✨ Próximos Passos

Após o deploy bem-sucedido:
1. ✅ Teste todas as funcionalidades
2. ✅ Configure monitoramento de erros (Sentry, LogRocket)
3. ✅ Configure analytics (Google Analytics, Mixpanel)
4. ✅ Configure CI/CD para deploys automáticos
5. ✅ Adicione domínio personalizado
