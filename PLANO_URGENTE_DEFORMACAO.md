# 🚨 PLANO URGENTE: Deformação de Roupa

**Problema:** Roupa se deforma após movimento de câmera (zoom)  
**Afetado:** m1 "Natural" confirmado, possivelmente todos m1-m7  
**Causa Suspeita:** MOVEMENT_ZOOM_SUFFIX aplicado universalmente

---

## ⚡ AÇÃO IMEDIATA NECESSÁRIA

### Você Precisa Fazer AGORA (5-10 minutos):

**Teste cada movimento e responda:**

1. **m1 "Natural"** (já testado)
   - Deforma? **SIM** (confirmado)
   - Quando? (Durante zoom? No snap back? Após?)

2. **m2 "Vento no look"**
   - Deforma? SIM / NÃO
   - Quando?

3. **m3 "Modelo andando"**
   - Deforma? SIM / NÃO
   - Quando?

4. **m4 "Gesto suave"**
   - Deforma? SIM / NÃO
   - Quando?

5. **m5 "Giro elegante"**
   - Deforma? SIM / NÃO
   - Quando?

6. **m6 "Vista no espelho"**
   - Deforma? SIM / NÃO
   - Quando?

7. **m7-v1 "Atitude Natural"**
   - Deforma? SIM / NÃO
   - Quando?

8. **m7-v2 "Look Completo"** (já testado)
   - Deforma? ? (você mencionou que foi verificado)
   - Quando?

---

## 🎯 DECISÕES BASEADAS NO RESULTADO

### Se 5+ movimentos deformam:
**→ ROLLBACK IMEDIATO**
- Remover MOVEMENT_ZOOM_SUFFIX completamente
- Push para produção URGENTE
- Sistema volta ao estado anterior (sem zoom)

### Se 2-4 movimentos deformam:
**→ ZOOM SELETIVO**
- Remover zoom universal
- Manter zoom APENAS nos que funcionam
- Atualizar prompts individuais

### Se apenas 1-2 movimentos deformam:
**→ AJUSTE CIRÚRGICO**
- Manter zoom universal
- Adicionar exceção para movimentos problemáticos
- Ou ajustar prompt específico do movimento

---

## 📋 FORMATO DE RESPOSTA

**Copie e preencha:**

```
TESTE DE DEFORMAÇÃO - Resultados

m1 Natural: DEFORMA (durante snap back)
m2 Vento: NÃO DEFORMA
m3 Andando: DEFORMA (durante zoom)
m4 Gesto: NÃO DEFORMA
m5 Giro: DEFORMA (após snap back)
m6 Espelho: NÃO DEFORMA
m7-v1 Atitude: DEFORMA (durante hold)
m7-v2 Look: NÃO DEFORMA

TOTAL AFETADOS: X de 8
SEVERIDADE: SUTIL / MODERADA / SEVERA
```

---

## ⚙️ SOLUÇÕES PRONTAS

### Opção A: Rollback Total (Mais Seguro)
```javascript
// public/app.js linha 864
const MOVEMENT_ZOOM_SUFFIX = ''; // Remove zoom
```
**Quando usar:** Se 50%+ dos movimentos deformam

### Opção B: Zoom Muito Suave (Conservador)
```javascript
const MOVEMENT_ZOOM_SUFFIX = ', camera very slowly moves slightly closer showing garment detail, holds briefly, then very slowly returns to original position, maintaining garment shape and consistency, smooth gradual movement only';
```
**Quando usar:** Se deformação é SUTIL e em poucos movimentos

### Opção C: Sem Movimento de Câmera (Alternativa)
```javascript
const MOVEMENT_ZOOM_SUFFIX = ''; // Remove
// E ajusta prompts individuais para NÃO mencionar zoom
```
**Quando usar:** Se problema é especificamente o movimento de câmera

---

## 🚀 EXECUÇÃO RÁPIDA

**Assim que você responder com os resultados dos testes:**

1. **Eu escolho a solução** baseado nos dados
2. **Eu implemento** a correção
3. **Eu faço commit e push**
4. **Você testa novamente** m1 Natural
5. **Confirmamos** que problema foi resolvido

**Tempo total:** 15-20 minutos da sua resposta até fix em produção

---

## 📞 RESPONDA AGORA

**Me envie os resultados dos 8 testes** ou, se não tiver tempo/créditos para testar tudo:

**Opção Rápida:**
- "Remova o zoom completamente por segurança"
- "Tente zoom mais suave primeiro"
- "Teste apenas m7-v2 e me diga se funciona"

Qualquer resposta me permite agir imediatamente! 🚨
