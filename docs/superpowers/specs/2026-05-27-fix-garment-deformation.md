# Spec: Corrigir Deformação de Roupa Durante Movimento de Câmera

**Data:** 2026-05-27  
**Autor:** Eduardo Manhães  
**Prioridade:** 🚨 CRÍTICA  
**Status:** Em Análise

---

## 1. PROBLEMA

### Sintoma Observado
**Movimento afetado:** m1 "Natural" (estilo recomendado)  
**Quando ocorre:** Após movimento de câmera (zoom)  
**O que acontece:** A roupa/produto selecionada se deforma visivelmente

### Histórico
- Problema foi verificado inicialmente apenas em "Pose de Modelo" (m7)
- Agora confirmado também em "Natural" (m1)
- **Implicação:** Possivelmente afeta TODOS os movimentos (m1-m7)

### Impacto no Negócio
- ❌ **CRÍTICO:** Deformação de produto é inaceitável para e-commerce de moda
- ❌ Afeta o movimento "recomendado" (m1 Natural)
- ❌ Pode estar afetando todos os 7 estilos de movimento
- ❌ Compromete confiança do usuário na plataforma

---

## 2. ANÁLISE DA CAUSA RAIZ

### Suspeita Principal: MOVEMENT_ZOOM_SUFFIX Universal

**Código atual (linha 864 de `public/app.js`):**
```javascript
const MOVEMENT_ZOOM_SUFFIX = ', then camera performs a moderate zoom toward the garment revealing fabric texture and clothing details clearly without cutting the model, holds on detail for 2 seconds showing texture and fit in context, then snaps back quickly to full body wide shot, model moving at natural real-life speed throughout, no slow motion, no extreme close-up, maintain model in frame during zoom';
```

**Aplicado em:** `buildVideoPrompt()` (linha ~1397) - anexado a TODOS os movimentos

### Por Que Isso Causa Deformação?

**Hipótese 1: Movimento de Câmera Força Redesenho**
- IA de vídeo (Kling v2.6 Pro) tem dificuldade em manter consistência geométrica durante zoom
- Ao aproximar da roupa, a IA "redesenha" detalhes e introduz distorções
- Problema é amplificado no "snap back" rápido

**Hipótese 2: Conflito com Prompt Original**
- m1 "Natural" tem seu próprio prompt: `'camera static then quick pull back'`
- MOVEMENT_ZOOM_SUFFIX adiciona: `'zoom toward... then snaps back'`
- **Conflito:** Dois movimentos de câmera (pull back + zoom + snap back) confundem a IA

**Hipótese 3: Duração vs Complexidade**
- Vídeos são curtos (5s ou 10s)
- Adicionar zoom IN + hold + snap back OUT em vídeo curto sobrecarrega
- IA sacrifica consistência geométrica para completar todos os movimentos

---

## 3. EVIDÊNCIAS A COLETAR

### Teste Diagnóstico Necessário

**Pergunta 1:** O problema ocorre em TODOS os movimentos ou apenas alguns?
- [ ] Testar m1 Natural
- [ ] Testar m2 Vento no look
- [ ] Testar m3 Modelo andando
- [ ] Testar m4 Gesto suave
- [ ] Testar m5 Giro elegante
- [ ] Testar m6 Vista no espelho
- [ ] Testar m7-v1 Atitude Natural
- [ ] Testar m7-v2 Look Completo

**Pergunta 2:** Quando exatamente a deformação acontece?
- [ ] Durante o zoom IN para a roupa?
- [ ] Durante o hold de 2 segundos no detalhe?
- [ ] Durante o snap back para plano aberto?
- [ ] Após o snap back (roupa fica deformada no plano final)?

**Pergunta 3:** A deformação é sutil ou severa?
- [ ] Sutil (pequenas distorções de textura)
- [ ] Moderada (proporções ligeiramente alteradas)
- [ ] Severa (roupa completamente deformada/irreconhecível)

**Pergunta 4:** Movimentos SEM zoom tinham esse problema antes?
- Precisamos confirmar: o problema foi INTRODUZIDO pelo MOVEMENT_ZOOM_SUFFIX?
- Ou já existia e só foi notado agora?

---

## 4. SOLUÇÕES PROPOSTAS

### Opção A: REMOVER Zoom Universal Completamente

**Abordagem:**
```javascript
const MOVEMENT_ZOOM_SUFFIX = ''; // Remove completamente
```

**Prós:**
- ✅ Solução mais simples e rápida
- ✅ Elimina fonte de instabilidade
- ✅ Retorna ao comportamento anterior (que funcionava)

**Contras:**
- ❌ Perde funcionalidade de "revelar detalhes da roupa"
- ❌ Vídeos menos cinematográficos
- ❌ Retrocesso na experiência visual

**Recomendação:** ⚠️ Usar apenas como ROLLBACK de emergência se outras opções falharem

---

### Opção B: Zoom OPCIONAL Apenas em Movimentos Específicos

**Abordagem:**
1. Remover MOVEMENT_ZOOM_SUFFIX universal
2. Adicionar zoom APENAS em prompts individuais que funcionam bem
3. Testar movimento por movimento

**Implementação:**
```javascript
// Remove sufixo universal
const MOVEMENT_ZOOM_SUFFIX = '';

// Adiciona zoom manualmente apenas onde funciona bem
// Exemplo: m7-v2 "Look Completo" (se testar e funcionar)
{
  id: 'v2',
  label: 'Look Completo',
  prompt: '... [prompt existente] ... then camera performs gentle zoom...'
}
```

**Prós:**
- ✅ Controle granular por movimento
- ✅ Permite manter zoom onde funciona
- ✅ Remove zoom onde causa problemas

**Contras:**
- ❌ Mais trabalhoso (testar cada movimento)
- ❌ Inconsistência entre movimentos

**Recomendação:** ✅ **MELHOR OPÇÃO** - Balança segurança e funcionalidade

---

### Opção C: Zoom MAIS SUAVE e Conservador

**Abordagem:**
Manter zoom universal mas torná-lo muito mais sutil e lento.

**Implementação:**
```javascript
const MOVEMENT_ZOOM_SUFFIX = ', then camera very slowly and gently moves slightly closer to show garment texture while maintaining full context and model visibility, holds for 1 second, then very slowly returns to original framing, maintaining garment geometry and consistency throughout, smooth gradual camera movement only, no sudden changes';
```

**Mudanças:**
- "moderate zoom" → "very slowly and gently moves slightly closer"
- "holds 2 seconds" → "holds 1 second" (menos tempo = menos chance de deformação)
- "snaps back quickly" → "very slowly returns" (movimento suave)
- Adiciona: "maintaining garment geometry and consistency throughout"

**Prós:**
- ✅ Mantém funcionalidade de zoom
- ✅ Reduz risco de deformação
- ✅ Aplicação universal consistente

**Contras:**
- ❌ Pode não resolver completamente
- ❌ Vídeos podem ficar "lentos demais"
- ❌ Precisa testar se realmente resolve

**Recomendação:** 🔬 Testar como experimento, mas não garantido

---

### Opção D: Zoom Estático (Sem Movimento de Câmera)

**Abordagem:**
Em vez de mover a câmera, pedir para a modelo se aproximar da câmera naturalmente.

**Implementação:**
```javascript
const MOVEMENT_ZOOM_SUFFIX = ', model takes one small natural step forward toward camera bringing garment closer into view showing more detail, pauses briefly, then takes one small step back to original position, natural walking pace, garment maintains consistent shape and texture throughout';
```

**Prós:**
- ✅ Câmera estática (mais estável para IA)
- ✅ Movimento natural da modelo
- ✅ Menos propenso a artefatos geométricos

**Contras:**
- ❌ Pode não funcionar com todos os estilos (ex: m5 "Giro" já tem movimento)
- ❌ Conflito com prompts que especificam "câmera estática"

**Recomendação:** 🤔 Interessante mas pode causar outros problemas

---

## 5. DECISÃO RECOMENDADA

### Estratégia em 3 Fases

**FASE 1: Diagnóstico (URGENTE - hoje)**
1. Usuário testa TODOS os movimentos (m1-m7) com roupa
2. Identifica quais têm deformação e quando acontece
3. Confirma se problema foi introduzido pelo zoom universal

**FASE 2: Rollback Temporário (se FASE 1 confirmar problema crítico)**
1. Remover MOVEMENT_ZOOM_SUFFIX imediatamente (Opção A)
2. Fazer commit e push
3. Sistema volta ao estado anterior (sem zoom, mas estável)

**FASE 3: Re-implementação Seletiva (após estabilização)**
1. Testar zoom em cada movimento individualmente
2. Aplicar zoom APENAS onde funciona sem deformação (Opção B)
3. Documentar quais movimentos suportam zoom e quais não

---

## 6. PLANO DE IMPLEMENTAÇÃO

### Se Confirmado Problema Crítico:

#### Task 1: Rollback Imediato
**Arquivo:** `public/app.js` linha 864

**ANTES:**
```javascript
const MOVEMENT_ZOOM_SUFFIX = ', then camera performs a moderate zoom toward the garment revealing fabric texture and clothing details clearly without cutting the model, holds on detail for 2 seconds showing texture and fit in context, then snaps back quickly to full body wide shot, model moving at natural real-life speed throughout, no slow motion, no extreme close-up, maintain model in frame during zoom';
```

**DEPOIS:**
```javascript
const MOVEMENT_ZOOM_SUFFIX = ''; // TEMPORARIAMENTE REMOVIDO - deformação de roupa detectada
```

**Commit:**
```bash
git add public/app.js
git commit -m "fix: remove zoom universal temporariamente - deformação de roupa

Problema: zoom causa deformação da roupa em m1 Natural e possivelmente outros
Solução temporária: remover MOVEMENT_ZOOM_SUFFIX completamente
Próximo passo: testar zoom seletivo por movimento

ROLLBACK de segurança - prioridade: estabilidade > features

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push origin main
```

#### Task 2: Teste Seletivo por Movimento
Após rollback, testar zoom em cada movimento individualmente:

1. Escolher movimento (ex: m7-v2 Look Completo)
2. Adicionar zoom APENAS no prompt desse movimento
3. Gerar vídeo de teste
4. Verificar se roupa deforma
5. Se OK → manter zoom nesse movimento
6. Se falha → remover zoom
7. Repetir para cada m1-m7

#### Task 3: Documentação
Criar matriz de compatibilidade:

| Movimento | Suporta Zoom? | Observações |
|-----------|---------------|-------------|
| m1 Natural | ❌ | Deformação confirmada |
| m2 Vento | ? | Não testado |
| m3 Andando | ? | Não testado |
| m4 Gesto | ? | Não testado |
| m5 Giro | ? | Não testado |
| m6 Espelho | ? | Não testado |
| m7-v1 Atitude | ? | Não testado |
| m7-v2 Look | ? | Não testado |

---

## 7. CRITÉRIOS DE SUCESSO

**Para aprovar qualquer solução:**
- [ ] Vídeo gerado com m1 "Natural" NÃO deforma a roupa
- [ ] Vídeo mantém consistência geométrica durante todo o clip
- [ ] Textura e proporções da roupa permanecem corretas
- [ ] Teste com pelo menos 3 roupas diferentes confirma estabilidade
- [ ] Nenhum movimento (m1-m7) apresenta deformação

---

## 8. ROLLBACK PLAN

Se a solução implementada piorar:

```bash
# Reverter último commit
git revert HEAD
git push origin main

# Ou voltar para commit antes do zoom universal (26ba0c1)
git reset --hard 199b7c1  # Antes do primeiro zoom fix
git push --force origin main
```

---

## 9. COMUNICAÇÃO

**Para usuários (se necessário):**
> "Identificamos e corrigimos um problema que causava deformação em roupas durante vídeos de movimento. Sistema atualizado e estável."

**Internamente:**
- Documentar problema e solução
- Atualizar testes de QA para incluir verificação de deformação
- Adicionar ao checklist: "Roupa mantém forma consistente?"

---

## 10. PRÓXIMOS PASSOS IMEDIATOS

**AGORA (Urgente):**
1. **Usuário:** Testar m2, m3, m4, m5, m6, m7-v1, m7-v2 com mesma roupa
2. **Usuário:** Confirmar em qual momento exato a deformação ocorre
3. **Decisão:** Fazer rollback imediato ou investigar mais?

**Após diagnóstico:**
4. Implementar solução escolhida
5. Testar extensivamente
6. Re-aprovar para produção

---

**Status:** ⏳ AGUARDANDO DIAGNÓSTICO COMPLETO DO USUÁRIO

**Ação Requerida:** Testar todos os movimentos e reportar resultados
