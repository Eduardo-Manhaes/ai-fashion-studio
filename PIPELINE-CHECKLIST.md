# Pipeline GPT Image 2 — Checklist de Saúde

## ✅ Pré-requisitos obrigatórios

### 1. Bucket Supabase
- [ ] Bucket "generations" configurado como **público**
- [ ] Comando para verificar:
  ```javascript
  const { data } = await supabase.storage.listBuckets();
  const gen = data.find(b => b.name === 'generations');
  console.log('Bucket público:', gen.public); // DEVE ser true
  ```
- [ ] Se falso, corrigir com:
  ```javascript
  await supabase.storage.updateBucket('generations', { public: true });
  ```

### 2. URLs de modelos preset
- [ ] Todas as 27 URLs retornam **200 OK**
- [ ] Comando para validar:
  ```bash
  node check-preset-urls.js
  ```
- [ ] Se alguma URL retornar 404, regenerar com script de upload

### 3. Certificados SSL (Windows)
- [ ] `win-ca` instalado no package.json
- [ ] `NODE_TLS_REJECT_UNAUTHORIZED='0'` em desenvolvimento (server.js linha 6-8)
- [ ] Em produção: remover bypass e usar `win-ca` ou certificados do sistema

### 4. Variáveis de ambiente
- [ ] `OPENAI_API_KEY` presente no `.env`
- [ ] `FAL_API_KEY` presente no `.env`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` presente no `.env`
- [ ] Validar com:
  ```bash
  node -e "require('dotenv').config(); console.log('OPENAI:', !!process.env.OPENAI_API_KEY, 'FAL:', !!process.env.FAL_API_KEY)"
  ```

---

## 🔍 Teste de diagnóstico rápido

Execute antes de cada deploy:

```bash
node test-gpt-image-final.js
```

**Saída esperada:**
```
✅ Bucket "generations" encontrado
   Público: true
✅ Modelo: camila
   Status: 200 OK
✅ Produto uploaded
   Status: 200 OK
✅ Fal.ai API: 404 Not Found (esperado na raiz)
✅ OPENAI_API_KEY presente
✅ TODOS OS PRÉ-REQUISITOS ATENDIDOS!
```

---

## ⚠️ Causas comuns de falha

### Erro: "URL not accessible or has expired"
**Causa:** Bucket não é público ou URL inválida
**Solução:**
1. Verificar `gen.public === true`
2. Testar URL com `curl -I <url>` (deve retornar 200)
3. Se produto for base64, verificar upload no server.js linha 284-307

### Erro: "fetch failed"
**Causa:** Certificados SSL não configurados
**Solução:**
1. Verificar `NODE_TLS_REJECT_UNAUTHORIZED='0'` em dev
2. Em produção, instalar `win-ca` ou certificados CA

### Erro: "undefined URL após COMPLETED"
**Causa:** Parsing incorreto do response ou API retornou erro
**Solução:**
1. Adicionar log temporário: `console.log(JSON.stringify(final))`
2. Verificar estrutura: `final.images?.[0]?.url || final.image?.url`
3. Se API retornou `detail` com erros, corrigir URLs de entrada

---

## 📊 Métricas de sucesso

**Tempo médio de geração:**
- GPT Image 2: ~160s (2min 40s)
- Clarity Upscaler: ~15s
- **Total: ~175s (menos de 3 minutos)**

**Taxa de sucesso esperada:**
- ≥ 95% se todos os pré-requisitos atendidos
- Se < 90%, investigar logs do Fal.ai

---

## 🚀 Próximas otimizações (opcional)

1. **Cache de modelos preset** — Armazenar URLs em Redis para evitar query Supabase
2. **Webhook do Fal.ai** — Substituir polling por callback (reduz latência)
3. **Retry automático** — Se GPT Image 2 falhar, tentar 1x antes de refund
4. **Monitoramento** — Sentry/DataDog para alertar sobre falhas > 10%

---

## 📝 Commit de referência

```
703a92e Fix: GPT Image 2 — resolve SSL + bucket público + limpa logs
```

Este commit contém todas as correções aplicadas. Se algo quebrar, compare com este estado.
