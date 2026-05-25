# Spec: Adicionar Estilo de Movimento "Pose de Modelo" com Variantes + Zoom Universal

**Data:** 2026-05-25  
**Autor:** Eduardo Manhães  
**Status:** Aprovado

## Contexto

A plataforma oferece estilos de movimento (m1-m6) para geração de vídeos de moda, mas atualmente:
1. Nenhum movimento possui variantes (apenas cenários têm essa funcionalidade)
2. Nenhum vídeo de movimento tem zoom cinematográfico final
3. O movimento m6 "Look completo" (espelho) pode confundir com novo estilo similar

**Objetivo:** Adicionar novo estilo "Pose de Modelo" com 2 variantes profissionais + aplicar zoom universal em todos os vídeos de movimento.

## Decisão

**Abordagem escolhida:** Minimal Change - Variant State Separate

**Justificativa:**
- Separa `selectedVariant` (cenários) de `selectedMovementVariant` (movimentos) para prevenir bugs
- Segue exatamente o padrão já implementado em SCENARIOS
- Código mais claro e fácil de debugar
- Extensível para futuros movimentos com variantes

## Mudanças Detalhadas

### 1. Renomear m6 (Evitar Confusão)

**Arquivo:** `public/app.js` (linha ~901)

**ANTES:**
```javascript
{
  id: 'm6',
  icon: '🪞',
  label: 'Look completo',
  sub: 'Frente e costas',
  prompt: 'Fashion model posing in front of a mirror...'
}
```

**DEPOIS:**
```javascript
{
  id: 'm6',
  icon: '🪞',
  label: 'Vista no espelho',
  sub: 'Frente e costas',
  prompt: 'Fashion model posing in front of a mirror...'
}
```

**Motivo:** Novo m7 terá variante "Look Completo" - evitar duplicação de nomes.

### 2. Adicionar Constante de Zoom Universal

**Arquivo:** `public/app.js` (antes da linha 863, antes de MOVEMENT_STYLES)

**ADICIONAR:**
```javascript
// Sufixo de zoom universal para todos os vídeos de movimento
const MOVEMENT_ZOOM_SUFFIX = ', cinematic camera slowly zooming in toward the garment in the final seconds, revealing fabric texture, stitching and clothing details in sharp focus, 4K cinematic finish';
```

**Propósito:** Single source of truth para zoom aplicado em todos os movimentos.

### 3. Adicionar Novo m7 com Variantes

**Arquivo:** `public/app.js` (após linha 906, depois de m6)

**ADICIONAR:**
```javascript
{
  id: 'm7',
  icon: '📸',
  label: 'Pose de Modelo',
  sub: 'Profissional fashion',
  hasVariants: true,
  variants: [
    {
      id: 'v1',
      label: 'Atitude Natural',
      prompt: 'Brazilian fashion model in professional studio, starting with gentle fabric adjustment with fingertips showing garment drape, then gracefully touching hair to frame face, followed by smooth natural turn toward camera with confident eye contact, all in one fluid choreographed sequence, soft diffused studio lighting highlighting fabric texture and fit, warm professional atmosphere, model moves with natural elegance and poise, cinematic slow motion captures each gesture, ending with close engagement with viewer'
    },
    {
      id: 'v2',
      label: 'Look Completo',
      prompt: 'Brazilian fashion model performing elegant slow 360-degree rotation on clean studio floor, full body shot from head to toe, camera starts focused on face and confident expression then gradually zooms out and pans down revealing complete outfit from top to bottom, showing garment from all angles during turn, professional runway-style movement, soft studio lighting, model maintains elegant posture throughout rotation, cinematic choreography showcasing every detail of the clothing, fabric movement visible, seamless fluid motion'
    }
  ]
}
```

**Características:**
- **v1 "Atitude Natural":** Sequência fluida (ajuste tecido → toque cabelo → virada câmera → zoom)
- **v2 "Look Completo":** Rotação 360° + zoom rosto-pés mostrando outfit completo
- **Prompts profissionais:** Cinematográficos, focados em moda brasileira, 600+ caracteres cada

### 4. Adicionar Propriedade de Estado

**Arquivo:** `public/app.js` (linha ~924, após selectedMovement)

**ANTES:**
```javascript
videoStyle: null,         // 'movement' | 'talking'
selectedMovement: null,
selectedSessionImage: null,
```

**DEPOIS:**
```javascript
videoStyle: null,         // 'movement' | 'talking'
selectedMovement: null,
selectedMovementVariant: null,  // NEW - separate from selectedVariant (scenarios)
selectedSessionImage: null,
```

**Motivo:** Separar estado de variantes de movimento das variantes de cenário.

### 5. Atualizar selectCard() para Movimentos com Variantes

**Arquivo:** `public/app.js` (linhas ~1036-1042)

**ANTES:**
```javascript
else if (type === 'movement') {
  state.selectedMovement = MOVEMENT_STYLES.find(m => m.id === id);
  state.videoStyle = 'movement';
  document.getElementById('talkingForm').style.display = 'none';
  document.getElementById('btnSelectTalking').style.display = '';
  document.getElementById('btnNextVideoStep2').disabled = false;
}
```

**DEPOIS:**
```javascript
else if (type === 'movement') {
  const movement = MOVEMENT_STYLES.find(m => m.id === id);
  state.selectedMovement = movement;
  state.selectedMovementVariant = null; // Reset variant when changing movement
  state.videoStyle = 'movement';
  
  document.getElementById('talkingForm').style.display = 'none';
  document.getElementById('btnSelectTalking').style.display = '';
  
  // If movement has variants, show variants container and wait for selection
  if (movement && movement.hasVariants) {
    document.querySelectorAll('.variants-container').forEach(v => v.style.display = 'none');
    const variantsContainer = document.getElementById(`variants_${type}_${id}`);
    if (variantsContainer) {
      variantsContainer.style.display = 'block';
    }
    document.getElementById('btnNextVideoStep2').disabled = true; // Wait for variant selection
  } else {
    // Movement without variants - hide all containers and enable button
    document.querySelectorAll('.variants-container').forEach(v => v.style.display = 'none');
    document.getElementById('btnNextVideoStep2').disabled = false;
  }
}
```

**Lógica:** Espelha exatamente o padrão de cenários (linhas 1015-1035).

### 6. Refatorar selectVariant() para Ambos os Tipos

**Arquivo:** `public/app.js` (linhas 1046-1063)

**ANTES:**
```javascript
function selectVariant(type, scenarioId, variantId) {
  // Remove seleção de todas as variantes
  document.querySelectorAll('.variant-card').forEach(v => v.classList.remove('selected'));

  // Seleciona a variante clicada
  const variantEl = document.getElementById(`${type}_${scenarioId}_${variantId}`);
  if (variantEl) {
    variantEl.classList.add('selected');
  }

  // Atualiza estado
  const scenario = SCENARIOS.find(s => s.id === scenarioId);
  if (scenario && scenario.variants) {
    state.selectedVariant = scenario.variants.find(v => v.id === variantId);
    // Habilita botão de próximo step
    document.getElementById('btnNextStep3').disabled = false;
  }
}
```

**DEPOIS:**
```javascript
function selectVariant(type, parentId, variantId) {
  // Remove seleção de todas as variantes
  document.querySelectorAll('.variant-card').forEach(v => v.classList.remove('selected'));

  // Seleciona a variante clicada
  const variantEl = document.getElementById(`${type}_${parentId}_${variantId}`);
  if (variantEl) {
    variantEl.classList.add('selected');
  }

  // Atualiza estado com base no tipo
  if (type === 'scenario') {
    const scenario = SCENARIOS.find(s => s.id === parentId);
    if (scenario && scenario.variants) {
      state.selectedVariant = scenario.variants.find(v => v.id === variantId);
      document.getElementById('btnNextStep3').disabled = false;
    }
  } else if (type === 'movement') {
    const movement = MOVEMENT_STYLES.find(m => m.id === parentId);
    if (movement && movement.variants) {
      state.selectedMovementVariant = movement.variants.find(v => v.id === variantId);
      document.getElementById('btnNextVideoStep2').disabled = false;
    }
  }
}
```

**Mudança:** Renomear `scenarioId` → `parentId` e adicionar dispatch por tipo.

### 7. Atualizar buildVideoPrompt() para Variantes + Zoom

**Arquivo:** `public/app.js` (linhas 1287-1294)

**ANTES:**
```javascript
else {
  // Vídeo de movimento — usa o prompt do movimento selecionado
  const movement = state.selectedMovement;
  if (!movement || !movement.prompt) {
    return 'Fashion model standing naturally in elegant studio setting, subtle natural movement, professional fashion photography, cinematic quality, soft studio lighting, 4K resolution';
  }
  return movement.prompt;
}
```

**DEPOIS:**
```javascript
else {
  // Vídeo de movimento — suporta variantes + zoom universal
  const movement = state.selectedMovement;
  if (!movement) {
    return 'Fashion model standing naturally in elegant studio setting, subtle natural movement, professional fashion photography, cinematic quality, soft studio lighting, 4K resolution' + MOVEMENT_ZOOM_SUFFIX;
  }
  
  let movementPrompt;
  // Check if movement has variants and one is selected
  if (movement.hasVariants && state.selectedMovementVariant) {
    movementPrompt = state.selectedMovementVariant.prompt;
  } else if (movement.prompt) {
    movementPrompt = movement.prompt;
  } else {
    movementPrompt = 'Fashion model standing naturally in elegant studio setting, subtle natural movement, professional fashion photography, cinematic quality, soft studio lighting, 4K resolution';
  }
  
  // Apply universal zoom to ALL movement videos
  return movementPrompt + MOVEMENT_ZOOM_SUFFIX;
}
```

**Lógica:**
1. Detecta se movimento tem variantes E variante selecionada → usa variant.prompt
2. Caso contrário → usa movement.prompt
3. **Sempre** aplica MOVEMENT_ZOOM_SUFFIX ao final

## Impacto no Fluxo de Usuário

### Antes
```
Vídeo - Passo 2 (Movimento)
├─ Selecionar movimento m1-m6
└─ Gerar vídeo (sem zoom final)
```

### Depois
```
Vídeo - Passo 2 (Movimento)
├─ Opção A: Selecionar m1-m6 (sem variantes)
│   └─ Gerar vídeo (COM zoom final)
├─ Opção B: Selecionar m7 "Pose de Modelo"
│   ├─ Escolher variante: "Atitude Natural" OU "Look Completo"
│   └─ Gerar vídeo (COM zoom final)
```

### Mudanças de Comportamento

**Botão "Gerar Vídeo" (btnNextVideoStep2):**
- **Antes:** Sempre habilitado após selecionar movimento
- **Depois:** 
  - m1-m6: Habilitado imediatamente
  - m7: Desabilitado até selecionar variante

**Prompts de vídeo:**
- **Antes:** Prompt simples do movimento (sem zoom)
- **Depois:** Prompt do movimento/variante + zoom cinematográfico final

**m6 renomeado:**
- **Antes:** "Look completo"
- **Depois:** "Vista no espelho" (evita confusão com m7-v2)

## Verificação de Dependências

**Elementos DOM necessários (já existem):**
- ✅ `btnNextVideoStep2` (botão de próximo step)
- ✅ `.variants-container` (container de variantes - gerado dinamicamente)
- ✅ `.variant-card` (cards de variantes - gerados dinamicamente)

**Funções reutilizadas (sem mudança):**
- ✅ `buildSelectionGrid()` - já é type-agnostic, funciona para movements
- ✅ CSS classes - `.has-variants`, `.variants-container`, `.variant-card`

**Nenhuma mudança no HTML necessária** - UI completamente dinâmica via JavaScript.

## Plano de Testes

### Testes Críticos

1. **Movimento com variantes (m7)**
   - Selecionar m7 → verificar que variants aparecem
   - Tentar avançar sem selecionar variante → deve bloquear
   - Selecionar v1 "Atitude Natural" → botão deve habilitar
   - Gerar vídeo → verificar prompt contém variante + zoom
   - Voltar e selecionar v2 "Look Completo" → verificar mudança

2. **Movimentos sem variantes (m1-m6)**
   - Selecionar m1 → botão deve habilitar imediatamente
   - Gerar vídeo → verificar zoom aplicado ao prompt original
   - Testar cada m1-m6 → todos devem ter zoom

3. **Navegação entre movimentos**
   - Selecionar m7 + v1 → depois selecionar m1 → verificar que variante reseta
   - Selecionar m7 + v2 → depois selecionar m7 novamente → verificar reset
   - Alternar entre m7-v1 e m7-v2 múltiplas vezes

4. **Integração com talking video**
   - Gerar movimento m7-v1 → depois talking → verificar estado limpo
   - Gerar talking → depois m7 → verificar variants aparecem corretamente

5. **Verificação de m6 renomeado**
   - Confirmar label mudou para "Vista no espelho"
   - Confirmar funcionalidade não mudou (ainda gera vídeo de espelho)

6. **Console e erros**
   - Nenhum erro `getElementById` sobre variants
   - Nenhum warning sobre `selectedMovementVariant`
   - State sempre consistente

## Estimativa de Mudanças

| Seção | Linhas Adicionadas | Linhas Modificadas | Linhas Removidas |
|-------|-------------------|-------------------|------------------|
| MOVEMENT_ZOOM_SUFFIX | 2 | 0 | 0 |
| m6 rename | 0 | 1 | 0 |
| m7 entry | 23 | 0 | 0 |
| State property | 1 | 0 | 0 |
| selectCard() movement | 16 | 6 | 6 |
| selectVariant() | 8 | 3 | 0 |
| buildVideoPrompt() | 14 | 2 | 7 |
| **TOTAL** | **64** | **12** | **13** |

**Arquivo modificado:** `public/app.js` (único arquivo)  
**Net change:** +51 linhas

## Riscos e Mitigações

**Risco 1:** Variantes de movimento podem não aparecer na UI
- **Mitigação:** buildSelectionGrid() já é genérica, testada com cenários

**Risco 2:** Confusão entre selectedVariant e selectedMovementVariant
- **Mitigação:** Estados separados, reset explícito ao trocar modo

**Risco 3:** Zoom aplicado incorretamente
- **Mitigação:** Constante única, append ao final sempre, testável

**Risco 4:** m6 renomeado pode confundir usuários existentes
- **Mitigação:** Nome descritivo "Vista no espelho" deixa claro o conceito

## Rollback

Se necessário reverter:
```bash
git revert <commit-hash>
```

Como mudança é aditiva (novo m7 + zoom universal), rollback é seguro:
- m1-m6 voltam a não ter zoom
- m7 desaparece
- m6 volta ao nome "Look completo"

## Próximos Passos

1. ✅ Spec aprovada
2. Criar plano de implementação detalhado (via writing-plans)
3. Executar implementação task-by-task
4. Testar localmente (7 cenários de teste)
5. Commit e deploy para produção
6. Verificar em produção com checklist manual

---

**Status:** Pronto para planejamento de implementação
