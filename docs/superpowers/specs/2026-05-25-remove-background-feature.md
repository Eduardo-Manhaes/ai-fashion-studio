# Spec: Remoção da Funcionalidade de Upload de Fundo Customizado

**Data:** 2026-05-25  
**Autor:** Eduardo Manhães  
**Status:** Implementado

## Contexto

A plataforma oferece no Passo 3 (Cenário) a opção de fazer upload de uma imagem de fundo customizado como alternativa aos cenários pré-definidos. Esta funcionalidade nunca foi lançada para usuários e não está sendo processada pelo backend.

**Objetivo:** Simplificar a interface removendo código não utilizado e focando apenas nos cenários pré-definidos.

## Decisão

**Abordagem escolhida:** Remoção Completa Imediata

Remover todo o código relacionado ao upload de fundo em uma única operação, incluindo UI, state, validação e lógica de envio.

**Justificativa:**
- Funcionalidade nunca foi lançada (zero impacto em usuários)
- Backend já ignora o campo `background_reference`
- Objetivo é simplificar, não manter código morto
- Operação segura com risco zero

## Escopo da Remoção

### Arquivos Modificados

**1. `public/index.html`**
- Remover seção "Ou importe sua própria imagem de cenário (opcional)"
- Remover `<div id="bgUploadZone">` completo
- Remover `<input id="bgFileInput">`
- Remover `<img id="bgPreview">`
- **Linhas afetadas:** ~195-206 (11 linhas removidas)

**2. `public/app.js`**
- Remover `bgImageBase64` do objeto state (linha 916)
- Remover chamada `setupFileInput('bgFileInput', ...)` completa (linhas 963-969)
- Remover reset de bgImage ao trocar modelo (linhas 1028-1030)
- Simplificar validação de cenário (linhas 1167-1175)
- Remover envio de `background_reference` (linha 1448)
- **Total:** ~19 linhas removidas, 8 linhas simplificadas

### Mudanças Detalhadas

#### Mudança 1: State (linha 916)
```javascript
// REMOVER
bgImageBase64: null,
```

#### Mudança 2: Setup de Upload (linhas 963-969)
```javascript
// REMOVER todo este bloco
setupFileInput('bgFileInput', 'bgUploadZone', 'bgPreview', (b64) => {
  state.bgImageBase64 = b64;
  // Se usuário fez upload de bg, desselecionar card de cenário
  document.querySelectorAll('#scenarioGrid .sel-card').forEach(c => c.classList.remove('selected'));
  state.selectedScenario = null;
  document.getElementById('btnNextStep3').disabled = false;
});
```

**Nota:** A função `setupFileInput` é genérica e usada para outros uploads. Apenas esta **chamada** será removida.

#### Mudança 3: Reset ao Trocar Modelo (linhas 1028-1030)
```javascript
// REMOVER estas 3 linhas
state.bgImageBase64 = null;
document.getElementById('bgUploadZone').classList.remove('has-image');
document.getElementById('bgPreview').src = '';
```

#### Mudança 4: Validação Simplificada (linhas 1167-1175)
```javascript
// ANTES (8 linhas)
const hasScenario = state.selectedScenario?.id;
const hasBgUpload = state.bgImageBase64;

if (!hasScenario && !hasBgUpload) {
  showToast('Selecione um cenário ou faça upload de fundo.', 'error');
  return;
}

if (state.selectedScenario?.hasVariants && !state.selectedVariant && !hasBgUpload) {
  showToast('Selecione a variante do cenário.', 'error');
  return;
}

// DEPOIS (6 linhas)
if (!state.selectedScenario?.id) {
  showToast('Selecione um cenário.', 'error');
  return;
}

if (state.selectedScenario?.hasVariants && !state.selectedVariant) {
  showToast('Selecione a variante do cenário.', 'error');
  return;
}
```

#### Mudança 5: Envio para API (linha 1448)
```javascript
// REMOVER
if (state.bgImageBase64) inputs.background_reference = getCleanBase64(state.bgImageBase64);
```

## Impacto no Fluxo de Usuário

### Antes
```
Passo 3 (Cenário)
├─ Opção A: Selecionar cenário pré-definido
│   ├─ Se tem variantes → exige escolher variante
│   └─ Se não tem → pode avançar
├─ Opção B: Upload de fundo customizado
│   └─ Pode avançar direto
└─ Validação: (cenário OU upload) obrigatório
```

### Depois
```
Passo 3 (Cenário)
└─ Selecionar cenário pré-definido (obrigatório)
    ├─ Se tem variantes → exige escolher variante
    └─ Se não tem → pode avançar
```

### Mudanças de Comportamento

**Estado do botão "Escolher Pose →":**
- **Antes:** Habilitado se `(selectedScenario && selectedVariant) || bgImageBase64`
- **Depois:** Habilitado se `selectedScenario && (selectedVariant || !hasVariants)`

**Mensagens de erro:**
- **Antes:** "Selecione um cenário ou faça upload de fundo"
- **Depois:** "Selecione um cenário"

**Ao selecionar modelo (passo 2):**
- **Antes:** Reset de cenário + reset de bgImage
- **Depois:** Reset apenas de cenário

## Verificação Completa

**Análise de dependências realizada:**
- ✅ Nenhuma outra função depende de `bgImageBase64`
- ✅ `setupFileInput` é genérica, apenas a chamada é removida
- ✅ Nenhum drag-and-drop configurado para background
- ✅ Nenhuma referência no backend (já ignora `background_reference`)
- ✅ Nenhuma referência no banco de dados

**Elementos DOM removidos:**
- `bgFileInput` (input file)
- `bgUploadZone` (zona de upload)
- `bgPreview` (preview da imagem)
- `bgPlaceholder` (placeholder do upload)

**Código JavaScript removido:**
- State: `bgImageBase64`
- Setup: callback do `setupFileInput`
- Reset: 3 linhas de limpeza
- Validação: lógica "cenário OU background"
- Envio: `background_reference` nos inputs

## Plano de Testes

### Testes Críticos Pós-Deploy

1. **Fluxo completo de geração**
   - Modelo → Produto → Cenário → Pose → Gerar
   - Verificar geração bem-sucedida

2. **Cenários com variantes**
   - Selecionar "Parede ao fundo"
   - Verificar exigência de variante
   - Testar cada variante

3. **Validações do Passo 3**
   - Avançar sem cenário → deve bloquear
   - Cenário com variantes sem variante → deve bloquear
   - Cenário sem variantes → deve permitir

4. **Navegação entre passos**
   - Avançar até passo 3
   - Voltar e trocar modelo
   - Verificar persistência do cenário

5. **Console do navegador**
   - Verificar ausência de erros `getElementById`
   - Verificar ausência de warnings sobre `bgImageBase64`

## Riscos e Mitigações

**Risco:** Nenhum identificado

**Motivos:**
- Funcionalidade nunca foi lançada
- Zero usuários afetados
- Backend já ignora o campo
- Código é isolado e não tem dependências

## Rollback

Se necessário reverter, basta fazer `git revert` do commit de remoção. Como a funcionalidade nunca funcionou, não há perda de dados ou impacto em usuários.

## Próximos Passos

Após aprovação desta spec:
1. Invocar `writing-plans` skill para criar plano de implementação
2. Executar mudanças em ordem
3. Testar localmente
4. Deploy para produção
5. Executar testes de regressão em produção
