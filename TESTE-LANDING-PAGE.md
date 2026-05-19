# 🔍 CHECKLIST - LANDING PAGE NÃO MOSTRA IMAGENS

## ✅ CÓDIGO VERIFICADO:
- ✅ HTML contém URLs das imagens
- ✅ Servidor local responde corretamente  
- ✅ Tamanho: 28.64 KB
- ✅ Último commit: f84548f

---

## 🚂 PASSO 1: VERIFICAR DEPLOY NO RAILWAY

### Aguardar deploy completar:
1. Acesse: https://railway.app/project/...
2. Vá em **Deployments**
3. Aguarde deploy do commit **f84548f** completar
4. Deve mostrar: **COMPLETED** ✅

**Tempo estimado:** 1-2 minutos

---

## 🌐 PASSO 2: LIMPAR CACHE DO NAVEGADOR

### Opção A - Hard Refresh (Recomendado):

**Chrome/Edge:**
- Windows: `Ctrl + Shift + R` ou `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Firefox:**
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### Opção B - Limpar Cache Completo:

**Chrome/Edge:**
1. Pressione `Ctrl + Shift + Delete`
2. Selecione "Imagens e arquivos em cache"
3. Período: "Última hora"
4. Clique em "Limpar dados"

**Firefox:**
1. Pressione `Ctrl + Shift + Delete`
2. Marque "Cache"
3. Clique em "Limpar agora"

### Opção C - Modo Anônimo/Privado:

**Chrome/Edge:** `Ctrl + Shift + N`
**Firefox:** `Ctrl + Shift + P`

Teste a URL em modo anônimo: https://web-production-6ab20.up.railway.app/landing

---

## 🔍 PASSO 3: INSPECIONAR PÁGINA

### Abrir DevTools:
1. Pressione `F12` na página da landing
2. Vá na aba **Console**
3. **Verifique se há erros** (linhas vermelhas)

### Verificar Imagens:
1. Vá na aba **Network** (Rede)
2. Recarregue a página (`F5`)
3. Procure por arquivos começando com `eHMR4an3...`
4. **Status deve ser 200 OK**

Se status for 404 ou 403:
- ❌ As imagens do fal.media podem estar bloqueadas
- ✅ Solução: veja PASSO 4

---

## 🛠️ PASSO 4: TESTE MANUAL DAS IMAGENS

Abra cada URL diretamente no navegador:

### Slider Antes:
```
https://v3b.fal.media/files/b/0a99c8aa/eHMR4an3NETG3LttYqWhK_017a1ac703d2420dbf5
```

### Slider Depois:
```
https://v3b.fal.media/files/b/0a99ca1a/ceAU-OxMIQj-1Kg6OQOJ0_8e29b9cd6f1644988b8
```

### Galeria 1:
```
https://v3b.fal.media/files/b/0a99c8aa/eHMR4an3NETG3LttYqWhK_017a1ac703d2420dbf5
```

**O que deve acontecer:**
- ✅ Imagem da modelo deve carregar
- ❌ Se não carregar = problema no fal.media

---

## 🎯 PASSO 5: VERIFICAR CÓDIGO FONTE

Na página da landing:
1. Clique com botão direito → **"Exibir código-fonte"** (ou `Ctrl + U`)
2. Procure por `slider-before` (Ctrl + F)
3. **Deve conter:**
   ```html
   <img src="https://v3b.fal.media/files/b/0a99c8aa/..."
   ```

Se o código fonte ainda tiver:
```html
<img src="https://placehold.co/..."
```

**Significa:** Railway não deployou a versão nova ainda
**Solução:** Aguarde mais 1-2 minutos e faça hard refresh

---

## 🐛 POSSÍVEIS PROBLEMAS E SOLUÇÕES:

### Problema 1: "Imagens não carregam mas código fonte está correto"
**Causa:** CORS ou firewall bloqueando fal.media
**Solução:** 
- Teste em modo anônimo
- Teste em outro navegador
- Desative extensões (AdBlock, etc)

### Problema 2: "Código fonte ainda tem placeholders"
**Causa:** Deploy não completou ou cache do CDN Railway
**Solução:**
- Aguarde deploy completar no Railway
- Tente: https://web-production-6ab20.up.railway.app/landing?v=2
- (O `?v=2` força bypass do cache)

### Problema 3: "Console mostra erros 404"
**Causa:** URLs das imagens incorretas
**Solução:**
- Copie a mensagem de erro completa
- Me envie para eu corrigir as URLs

### Problema 4: "Vejo placeholder cinza no lugar da imagem"
**Causa:** CSS `display: none` ou `opacity: 0`
**Solução:** 
- Inspecione o elemento (botão direito → Inspecionar)
- Veja se tem `display: none` ou `opacity: 0`
- Se tiver, é bug no CSS (me avise)

---

## 📱 TESTE EM DIFERENTES DISPOSITIVOS:

- 💻 Desktop Chrome
- 💻 Desktop Firefox
- 📱 Mobile Chrome
- 📱 Mobile Safari

---

## 🤖 PROMPT PARA CLAUDE CHROME:

Se nada funcionar, use este prompt:

```
Por favor, acesse a landing page do Railway:
https://web-production-6ab20.up.railway.app/landing

1. Abra o DevTools (F12)
2. Vá em Network (Rede)
3. Recarregue a página
4. Me informe:
   ✅ Quantas requisições para fal.media foram feitas?
   ✅ Status HTTP dessas requisições (200, 404, 403?)
   ✅ Há algum erro no Console?
   ✅ No código-fonte (Ctrl+U), as tags <img> têm URLs do fal.media ou placehold.co?
   
5. Tire screenshot da aba Network mostrando as requisições
```

---

## ✅ CHECKLIST FINAL:

- [ ] Deploy do commit f84548f completou
- [ ] Fiz hard refresh (Ctrl + Shift + R)
- [ ] Testei em modo anônimo
- [ ] Verifiquei código-fonte (tem URLs fal.media)
- [ ] Testei URLs das imagens diretamente
- [ ] Verifiquei Console (F12) - sem erros
- [ ] Verifiquei Network (F12) - status 200

---

**Se todos os checks estiverem OK e ainda não aparecer, me avise com:**
1. Screenshot do DevTools (Console + Network)
2. Print do código-fonte (Ctrl + U)
3. URL completa que está testando
