# 🎬 TESTE O VÍDEO AGORA

## ✅ O QUE FOI CORRIGIDO:

1. **Duration:** Agora envia `5` (integer) ao invés de `'8s'` (string) ✅
2. **Polling:** Usa `response_url` da API ao invés de construir URL manualmente ✅
3. **Jobs expirados:** Detecta e retorna erro apropriado ✅

---

## 🚀 COMO TESTAR:

### Opção 1: Via Interface Web (RECOMENDADO)

1. Abra: **http://localhost:3000**
2. Faça login: **eduardomanhaesmaciel@gmail.com**
3. Clique em **"Vídeos"** no menu
4. Escolha **"Movimento"**
5. Selecione uma foto
6. Clique em **"Gerar Vídeo"**
7. Aguarde 2-5 minutos ⏱️

**Resultado esperado:** Vídeo aparece automaticamente quando completar

---

### Opção 2: Via API Direta (TESTE RÁPIDO)

Se você não conseguir fazer login ou quiser testar direto na API:

```bash
# 1. Gerar vídeo diretamente no Fal.ai (sem passar pelo servidor)
node test-fresh-video.js

# 2. Vai retornar um request_id
# 3. Aguarde alguns minutos
# 4. O vídeo vai completar (status: COMPLETED)
```

---

## 🔍 SE DER ERRO:

### Erro: "missing_auth_token"
**Solução:** Faça login no navegador primeiro

### Erro: "Unexpected end of JSON input"
**Causa:** Job expirou (>1h)  
**Solução:** Gere um vídeo NOVO, não tente usar jobs antigos

### Erro: HTTP 422 - "duration should be 5 or 10"
**Causa:** Ainda enviando string ao invés de integer  
**Solução:** Já corrigido no código, reinicie o servidor

### Erro: "response_url is null"
**Causa:** Job muito antigo (>1h) expirou  
**Solução:** Gere vídeo novo

---

## 📊 MONITORAR PROGRESSO:

### Ver logs do servidor:
```bash
tail -f server-debug.log
```

### Checar se servidor está rodando:
```bash
curl http://localhost:3000
```

### Ver jobs no banco:
```bash
node -e "
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
supabase.from('generation_jobs')
  .select('*')
  .eq('user_id', '61bf7fb2-5e73-4d77-b66d-f91ff68fe454')
  .order('created_at', { ascending: false })
  .limit(5)
  .then(r => console.log(JSON.stringify(r.data, null, 2)));
"
```

---

## ⏱️ TEMPO ESPERADO:

- **Kling (movimento):** 2-5 minutos
- **Veo (talking):** 5-10 minutos

Se passar de 10 minutos, algo está errado.

---

## 🎯 CONFIANÇA:

**95%** - Baseado em:
- ✅ Teste direto com Fal.ai funcionou
- ✅ Parâmetros corrigidos conforme docs
- ✅ Jobs frescos retornam response_url válido

---

## 💡 DICA:

Se você quer ver o vídeo MAIS RÁPIDO para testar:
- Use uma imagem simples (foto de rosto limpa)
- Deixe o prompt vazio
- Aspect ratio 9:16
- Isso vai processar mais rápido

---

**BOA SORTE! 🚀**

Se der certo, me avise. Se der erro, copie a mensagem de erro exata e me envie.
