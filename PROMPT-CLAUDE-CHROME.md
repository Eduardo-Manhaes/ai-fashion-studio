# 🤖 PROMPT PARA CLAUDE NO CHROME - DEPLOY VERCEL

## 📋 Copie e cole este prompt completo no Claude (Chrome)

```
Olá! Preciso que você faça o deploy de uma aplicação Node.js/Express no Vercel. Por favor, siga EXATAMENTE estes passos:

═══════════════════════════════════════════════════════════
PASSO 1: ACESSAR VERCEL
═══════════════════════════════════════════════════════════

1. Abra uma nova aba e acesse: https://vercel.com
2. Clique em "Login" no canto superior direito
3. Escolha "Continue with GitHub"
4. Faça login com a conta do GitHub (usuário: Eduardo-Manhaes)

═══════════════════════════════════════════════════════════
PASSO 2: CRIAR NOVO PROJETO
═══════════════════════════════════════════════════════════

1. No dashboard do Vercel, clique no botão "Add New..."
2. Selecione "Project"
3. Na lista de repositórios:
   - Procure por repositórios do usuário Eduardo-Manhaes
   - Encontre o repositório do projeto (provavelmente algo como "ai-fashion-studio" ou similar)
   - Clique em "Import" neste repositório

═══════════════════════════════════════════════════════════
PASSO 3: CONFIGURAR O PROJETO
═══════════════════════════════════════════════════════════

**Framework Preset:**
- Selecione: "Other"

**Root Directory:**
- Deixe como "./" (raiz do projeto)

**Build & Development Settings:**
- Build Command: deixe VAZIO
- Output Directory: deixe VAZIO  
- Install Command: npm install
- Development Command: npm start

═══════════════════════════════════════════════════════════
PASSO 4: VARIÁVEIS DE AMBIENTE (MUITO IMPORTANTE!)
═══════════════════════════════════════════════════════════

Na seção "Environment Variables", adicione CADA UMA destas variáveis:

⚠️ PARA CADA VARIÁVEL:
- Clique em "Add" ou "Add Another"
- Digite o nome da variável (Key)
- Cole o valor (Value) - SEM ASPAS, SEM ESPAÇOS EXTRAS
- Certifique-se que está marcado: Production, Preview e Development
- Clique em "Add" para confirmar

**Lista de Variáveis:**

1. Key: FASHN_API_KEY
   Value: fa-8CosPvxpdvED-gMhDeqyzTmS4RlnmDbIlUrAs

2. Key: FAL_API_KEY
   Value: 17c89a53-541e-4820-9903-85435b7962f5:28f53419d27412df20b148fd09af0724

3. Key: GOOGLE_AI_KEY
   Value: AIzaSyBmKwD2HMfgm1trViOSmFFHWBxfqp_M9Ug

4. Key: OPENAI_API_KEY
   Value: [USAR_CHAVE_DO_ARQUIVO_.ENV]

5. Key: SUPABASE_URL
   Value: https://tlzailaxkofbqyfqhwbx.supabase.co

6. Key: SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsemFpbGF4a29mYnF5ZnFod2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NTg4NTQsImV4cCI6MjA5MzMzNDg1NH0.NdMRyKSWHbcM-d_CpMI2czxoMSsA6tsLdSz4QEeS1Mc

7. Key: SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsemFpbGF4a29mYnF5ZnFod2J4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzc1ODg1NCwiZXhwIjoyMDkzMzM0ODU0fQ.RvbEyL4BqX81w4QN_DCueG-xV-4Vb9KCaJ13yt3RLdA

8. Key: NODE_ENV
   Value: production

9. Key: PORT
   Value: 3000

10. Key: BYPASS_CREDIT_CHECK
    Value: false

═══════════════════════════════════════════════════════════
PASSO 5: FAZER DEPLOY
═══════════════════════════════════════════════════════════

1. Após adicionar TODAS as variáveis, role até o final da página
2. Clique no botão azul "Deploy"
3. Aguarde o processo de build e deploy (pode levar 2-5 minutos)
4. Observe os logs em tempo real

═══════════════════════════════════════════════════════════
PASSO 6: VERIFICAR DEPLOY
═══════════════════════════════════════════════════════════

Após o deploy concluir:

1. Você verá uma tela de sucesso com confetes 🎉
2. Clique em "Visit" ou "Go to Dashboard"
3. Copie a URL gerada (será algo como: https://seu-projeto-xxx.vercel.app)
4. Abra a URL em uma nova aba para testar
5. Verifique se a página inicial carrega corretamente

═══════════════════════════════════════════════════════════
PASSO 7: CONFIGURAR CORS (IMPORTANTE!)
═══════════════════════════════════════════════════════════

1. No dashboard do projeto no Vercel, clique em "Settings"
2. Vá em "Environment Variables"
3. Procure por "ALLOWED_ORIGINS" (se não existir, adicione)
4. Clique em "Edit"
5. Atualize o valor para incluir a URL do Vercel:
   
   https://SEU-PROJETO.vercel.app,http://localhost:3000
   
   (substitua SEU-PROJETO pela URL real que foi gerada)
   
6. Marque: Production, Preview e Development
7. Clique em "Save"
8. Vá em "Deployments" e clique em "Redeploy" no deployment mais recente

═══════════════════════════════════════════════════════════
PASSO 8: ME RETORNE AS INFORMAÇÕES
═══════════════════════════════════════════════════════════

Por favor, me forneça:

✅ URL do projeto: https://_________.vercel.app
✅ Status do deploy: (Sucesso / Erro)
✅ Página inicial carrega? (Sim / Não)
✅ Se houver erros, copie a mensagem completa dos logs

Se houver QUALQUER erro durante o processo:
- Tire um screenshot
- Copie a mensagem de erro completa
- Me informe em qual passo parou

═══════════════════════════════════════════════════════════
⚠️ PROBLEMAS COMUNS E SOLUÇÕES
═══════════════════════════════════════════════════════════

**Erro: "Module not found"**
→ Verificar se package.json está correto
→ Tentar redeploy

**Erro: "Function timeout"**
→ Normal para vídeos longos
→ Considerar upgrade do plano

**Página não carrega (404)**
→ Verificar se vercel.json está no repositório
→ Verificar se server.js está exportando o app

**Build falhou**
→ Verificar logs de build
→ Garantir que todas as variáveis estão configuradas
→ Verificar se não há erros de sintaxe

═══════════════════════════════════════════════════════════

Vamos começar! Me avise quando terminar cada passo ou se encontrar algum problema.
```

---

## 📝 Notas Importantes

### Após o Deploy Bem-Sucedido:

1. **Teste completo da aplicação:**
   - Login/Registro
   - Geração de fotos
   - Geração de vídeos
   - Galeria
   - Sistema de créditos

2. **Configure domínio personalizado (opcional):**
   - Settings → Domains
   - Adicione seu domínio
   - Configure DNS conforme instruções

3. **Monitore o uso:**
   - Dashboard → Analytics
   - Dashboard → Functions
   - Dashboard → Deployments → Logs

4. **Backups:**
   - O código está no GitHub ✅
   - Banco de dados está no Supabase ✅
   - Arquivos estão no Supabase Storage ✅

### Variáveis Sensíveis

⚠️ **SEGURANÇA:** As chaves API expostas neste prompt são para desenvolvimento/teste. 

Em produção, você deve:
- Rotacionar todas as chaves API
- Usar secrets management
- Configurar rate limiting
- Habilitar monitoramento de uso

### Limitações do Plano Free

- ⏱️ 10s timeout por função
- 💾 100GB bandwidth/mês
- 📦 12MB function size
- 🔄 100 deployments/dia

Para remover limitações: upgrade para Vercel Pro ($20/mês)

---

## 🆘 Suporte

Se algo der errado:
1. Verifique os logs no Vercel Dashboard
2. Verifique as variáveis de ambiente
3. Teste localmente primeiro com `npm start`
4. Consulte: https://vercel.com/docs
