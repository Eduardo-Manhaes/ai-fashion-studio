# 🎬 CENÁRIOS E MOVIMENTOS — Modelo Fácil

**Documentação Técnica Completa**  
**Última atualização:** 27 de Maio de 2026  
**Baseado em:** public/app.js (estado atual do código)

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Cenários (SCENARIOS)](#cenários-scenarios)
3. [Movimentos (MOVEMENT_STYLES)](#movimentos-movement_styles)
4. [Sistema de Variantes](#sistema-de-variantes)
5. [Comportamentos Especiais](#comportamentos-especiais)
6. [Integração Cenário + Movimento](#integração-cenário--movimento)
7. [Histórico de Mudanças](#histórico-de-mudanças)

---

## 🎯 VISÃO GERAL

O sistema de geração de vídeos do Modelo Fácil utiliza:
- **6 cenários** (backgrounds/contextos)
- **8 estilos de movimento** (ações da modelo)
- **Sistema de variantes** (opções dentro de cenários/movimentos)
- **Prompts cinematográficos** profissionais para IA de vídeo (Kling v2.6 Pro)

**Pipeline:** Fal.ai → Kling v2.6 Pro → Vídeos 10s

---

## 🎨 CENÁRIOS (SCENARIOS)

### s1 — Parede ao fundo 🎨
**Tipo:** Com variantes (hasVariants: true)  
**Subtítulo:** "Fundo neutro"

#### Variantes:

**v1 — Branca lisa**
```
smooth white wall background, clean minimal backdrop, professional studio lighting, 
no texture, seamless white surface
```

**v2 — Ripado madeira**
```
wooden slatted panel background, vertical wood slats, natural brown wood texture, 
modern interior design, warm ambient lighting
```

**v3 — Boiserie cinza**
```
gray boiserie wall paneling background, elegant wainscoting, sophisticated gray 
panel molding, classic interior design, soft studio lighting
```

---

### s2 — Boutique brasileira 🏬
**Tipo:** Simples (sem variantes)  
**Subtítulo:** "Shopping/classe média"

**Prompt:**
```
modern Brazilian boutique interior, organized clothing displays, professional 
retail lighting, clean wooden or white furniture, Instagram-friendly store design, 
air-conditioned shopping mall store, elegant but accessible, middle-class fashion retail
```

---

### s3 — Lojas do Brás - SP 🏙️
**Tipo:** Com variantes (hasVariants: true)  
**Subtítulo:** "Comércio popular"

#### Variantes:

**v1 — Loja popular**
```
interior of popular Brás fashion store São Paulo, clothing racks packed with 
products, typical Brás commerce atmosphere, fluorescent lighting, well-displayed 
merchandise, no people in background, focus on model and clothing, wholesale 
district retail style
```

**v2 — Loja organizada**
```
organized Brás fashion store interior São Paulo, same popular store style but 
tidier, organized clothing racks, folded garment displays, improved lighting, 
clean retail space, no people in background, professional but accessible commerce 
environment
```

---

### s4 — Selfie no espelho 🤳
**Tipo:** Simples (sem variantes)  
**Subtítulo:** "Instagram/TikTok"  
**⚠️ ESPECIAL:** Exclusivo para m8 "Selfie no espelho"

**Prompt:**
```
mirror selfie photo style, model holding smartphone aimed at mirror throughout 
entire video from start to finish, phone never moves or lowers, phone stays fixed 
pointing at mirror the entire time, model visible in mirror reflection holding 
phone up, casual Instagram selfie atmosphere, fitting room or bedroom mirror, 
natural lighting, phone hand remains raised and steady for the complete duration 
of the video
```

**Aviso exibido na UI:**
> ⚠️ Este cenário funciona melhor com fotos tiradas no espelho segurando o celular.

---

### s5 — Ambiente natural 🌿
**Tipo:** Simples (sem variantes)  
**Subtítulo:** "Jardim"

**Prompt:**
```
natural outdoor setting, soft green background, daylight
```

---

### s6 — Cenário urbano 🏙️
**Tipo:** Simples (sem variantes)  
**Subtítulo:** "Cidade"

**Prompt:**
```
urban cityscape background, modern city
```

---

## 💃 MOVIMENTOS (MOVEMENT_STYLES)

### m1 — Natural ✨
**Badge:** "Melhor resultado"  
**Subtítulo:** "Recomendado"  
**Status:** ✅ EM PRODUÇÃO

**Prompt:**
```
Brazilian fashion model in professional studio, moving naturally as if standing in 
real life, subtle confident movements at normal human speed including slight body 
sway, natural arm movement, occasional hair touch, weight shifting naturally between 
feet, camera completely static, full body shot showing complete outfit from head to 
toe, soft warm studio lighting, no zoom, no slow motion, no freezing, model must be 
visibly moving throughout the entire video at real human speed
```

**Características:**
- Movimento natural e vivo (não foto estática)
- Velocidade humana normal
- Câmera estática
- Plano aberto corpo inteiro
- Recomendado como padrão

**Histórico de fixes:**
- Adicionado "moving naturally as if standing in real life" para evitar foto estática
- Enfatizado "normal human speed" para evitar câmera lenta
- "Must be visibly moving throughout" para garantir movimento contínuo

---

### m2 — Vento no look 💨
**Subtítulo:** "Tecido em movimento"  
**Status:** ✅ EM PRODUÇÃO

**Prompt:**
```
Fashion model posing outdoors, fabric and hair flowing gracefully in a gentle 
breeze, golden hour lighting, fabric texture clearly visible, model maintaining 
elegant composure, soft bokeh background, camera static then quick orbit, natural 
real-life speed, no slow motion
```

---

### m3 — Modelo andando 🚶
**Subtítulo:** "Deslocamento suave"  
**Status:** ✅ EM PRODUÇÃO

**Prompt:**
```
High-fashion model walking confidently toward camera on a clean studio floor, 
fluid natural stride at real walking pace, arms swinging slightly, garment in 
full view showing fit and movement, soft diffused studio lighting, camera at eye 
level tracking forward at natural speed, no slow motion
```

---

### m4 — Gesto suave 🙆
**Subtítulo:** "Movimento de braço"  
**Status:** ✅ EM PRODUÇÃO

**Prompt:**
```
Fashion model making a graceful hand gesture, touching hair or adjusting collar 
with delicate movement at natural pace, close-medium shot showing garment detail, 
warm soft lighting, cinematic depth of field, elegant and natural expression, 
subtle smile, camera static then quick zoom, natural real-life speed, no slow motion
```

---

### m5 — Giro elegante 🔄
**Subtítulo:** "Mostra todos os ângulos"  
**Status:** ✅ EM PRODUÇÃO

**Prompt:**
```
Fashion model doing elegant 360-degree turn at natural rotation speed showing 
all angles of the garment, full body shot, clean white studio background, 
professional fashion show lighting, smooth rotation, fabric movement visible, 
camera stationary at medium distance, natural real-life speed, no slow motion
```

---

### m6 — Vista no espelho 🪞
**Subtítulo:** "Frente e costas"  
**Status:** ✅ EM PRODUÇÃO

**Prompt:**
```
Fashion model posing in front of a mirror, showing front and back of the garment 
simultaneously, boutique interior setting, warm ambient lighting, model adjusting 
outfit at natural pace, cinematic composition, camera static then quick pan to 
reveal both angles, natural real-life speed, no slow motion
```

---

### m7 — Pose de Modelo 📸
**Tipo:** Com variantes (hasVariants: true)  
**Subtítulo:** "Profissional fashion"  
**Status:** ✅ EM PRODUÇÃO

#### Variantes:

**v1 — Atitude Natural**

**Prompt cinematográfico (6 cenas):**
```
Brazilian fashion model in professional studio with warm soft lighting, 
SCENE 1 (0-2s): camera static in medium shot framing model from waist to head, 
model looks slightly to the side with relaxed confident expression, 
SCENE 2 (2-4s): model naturally raises right hand and runs fingers through hair 
tilting head slightly, camera remains static, 
SCENE 3 (4-6s): model lowers hand and gently adjusts garment neckline or hem with 
fingertips looking briefly downward showing fabric drape and fit, 
SCENE 4 (6-7s): model turns head directly toward camera with soft natural smile 
and direct eye contact, 
SCENE 5 (7-9s): camera performs moderate zoom directly onto garment fabric showing 
texture and drape without cutting model out of frame, holds on detail for 2 seconds, 
SCENE 6 (9-10s): camera slowly and smoothly pulls back to medium shot revealing 
model standing still in confident natural pose looking directly at camera, slow 
gradual pull back not a snap, model face consistent and unchanged throughout, 
same identical model from start to finish
```

**Características:**
- Prompt estruturado em cenas temporais
- Zoom cinematográfico no tecido (7-9s)
- Recuo suave ao final (não snap)
- Ênfase em consistência facial

---

**v2 — Look Completo**

**Prompt cinematográfico (5 cenas):**
```
Brazilian fashion model on clean white studio floor with professional lighting, 
SCENE 1 (0-1s): camera static wide shot showing complete outfit head to toe, model 
standing still upright posture looking forward, 
SCENE 2 (1-6s): model performs single smooth 360-degree rotation at natural walking 
pace showing complete outfit from all angles front right-side back left-side then 
front again, camera remains completely static and wide throughout rotation, no 
gestures or expressions during rotation, 
SCENE 3 (6-7s): model stops after completing one full rotation standing in confident 
frontal pose looking directly at camera, 
SCENE 4 (7-9s): camera performs moderate zoom directly onto garment fabric not face 
revealing fabric texture stitching and clothing details while keeping model partially 
in frame, holds on detail for 2 seconds, 
SCENE 5 (9-10s): camera snaps back quickly to full body wide shot with model in 
final standing pose, no second rotation, same identical model throughout entire 
video, natural real-life speed, no slow motion, professional runway showcase mood
```

**Características:**
- Rotação 360° completa (1-6s)
- Zoom no tecido (não no rosto)
- Snap back rápido ao final
- Mood de runway profissional

---

### m8 — Selfie no espelho 🤳
**Tipo:** Exclusivo de cenário (scenarioOnly: 's4')  
**Subtítulo:** "Celular no espelho"  
**Status:** ✅ EM PRODUÇÃO

**Prompt:**
```
A real person actively taking a mirror selfie, photorealistic human face with 
natural skin texture, visible pores, natural skin imperfections, no beauty filter, 
no skin smoothing, no AI appearance, real human face, subtle continuous natural 
body movement including breathing and slight sway, one arm raised holding smartphone 
pointed at mirror, arm stays raised throughout video, casual everyday selfie moment, 
natural room lighting, reflection visible in mirror showing outfit, person visibly 
alive and moving at all times, no freeze frames, cinematic realism, shot on iPhone, 
raw unfiltered natural appearance, natural real-life speed, no slow motion, movements 
at normal everyday human pace, casual and spontaneous timing
```

**Características:**
- **Exclusivo:** Só aparece quando s4 "Selfie no espelho" está selecionado
- **Realismo fotográfico:** Textura de pele, poros visíveis, sem filtros
- **Movimento contínuo:** Respiração, balanço corporal
- **Velocidade natural:** Ênfase em "natural real-life speed"
- **Bypass de cenário:** m8 ignora o prompt de s4 para evitar conflitos

**Histórico de fixes:**
- Adicionado realismo fotográfico (skin texture, no filters)
- Adicionado "natural real-life speed, no slow motion" para corrigir câmera lenta
- m8 ignora s4 em buildVideoPrompt() para evitar instruções conflitantes

---

## 🔀 SISTEMA DE VARIANTES

### Cenários com Variantes

**s1 "Parede ao fundo":**
- 3 variantes (Branca lisa, Ripado madeira, Boiserie cinza)
- Usuário escolhe qual variante ao selecionar o cenário

**s3 "Lojas do Brás":**
- 2 variantes (Loja popular, Loja organizada)
- Diferença: nível de organização do ambiente

### Movimentos com Variantes

**m7 "Pose de Modelo":**
- 2 variantes (Atitude Natural, Look Completo)
- Diferença: m7-v1 foca em expressão e atitude, m7-v2 foca em rotação 360°

### Lógica de Seleção

```javascript
if (item.hasVariants && item.variants) {
  // Exibe dropdown de variantes
  // Usuário deve selecionar uma variante antes de gerar
}
```

---

## ⚙️ COMPORTAMENTOS ESPECIAIS

### scenarioOnly (m8)

**Conceito:** Movimento exclusivo de um cenário específico

**Implementação:**
```javascript
{
  id: 'm8',
  scenarioOnly: 's4'  // Só aparece se s4 estiver selecionado
}
```

**Lógica de filtragem:**
```javascript
const visibleMovements = MOVEMENT_STYLES.filter(m => {
  if (m.scenarioOnly) {
    return state.selectedScenario?.id === m.scenarioOnly;
  }
  if (state.selectedScenario?.id === 's4') {
    return false;  // Oculta m1-m7 quando s4 selecionado
  }
  return true;
});
```

**Regras:**
- Se s4 selecionado → apenas m8 é exibido
- Se m8 selecionado e usuário troca para outro cenário → seleção de movimento é resetada
- Se outro cenário (s1, s2, s3, s5, s6) → m1-m7 exibidos, m8 oculto

---

### MOVEMENT_ZOOM_SUFFIX

**Estado atual:**
```javascript
const MOVEMENT_ZOOM_SUFFIX = '';  // VAZIO
```

**Histórico:**
- **Antes:** Continha instruções de zoom universal aplicadas a todos os movimentos
- **Problema detectado:** Zoom causava deformação de roupa em m1-m6
- **Solução:** Removido completamente (commit fa4d9f0)
- **Zoom mantido em:** m7-v1 e m7-v2 (descritos explicitamente nos prompts das variantes)

**Motivo da remoção:**
> Zoom universal causava instabilidade geométrica na IA de vídeo. Movimento de câmera 
> forçava redesenho da roupa, introduzindo distorções. Solução: câmera estática para 
> m1-m6, zoom seletivo apenas em m7 onde foi cuidadosamente projetado.

---

### Realismo de Pele Especial (s4 + m1)

**Quando:** Cenário s4 + Movimento m1 são combinados

**Prompt adicional:**
```javascript
if (state.selectedScenario?.id === 's4' && movement.id === 'm1') {
  const skinRealism = ', natural skin texture with visible pores, realistic skin ' +
    'imperfections, no skin smoothing, no beauty filter, photorealistic human skin, ' +
    'raw unfiltered appearance';
  return fullPrompt + skinRealism + MOVEMENT_ZOOM_SUFFIX;
}
```

**Motivo:** Selfie no espelho (s4) demanda realismo fotográfico para parecer autêntico.

---

## 🔗 INTEGRAÇÃO CENÁRIO + MOVIMENTO

### buildVideoPrompt() — Lógica de Combinação

**Localização:** public/app.js linha ~1368

**Fluxo:**

1. **Extração do cenário:**
```javascript
let scenarioPrompt = null;
if (state.selectedScenario) {
  if (state.selectedScenario.hasVariants && state.selectedVariant) {
    scenarioPrompt = state.selectedVariant.prompt;
  } else if (state.selectedScenario.prompt) {
    scenarioPrompt = state.selectedScenario.prompt;
  }
}
```

2. **Extração do movimento:**
```javascript
let movementPrompt = movement.prompt;
if (movement.hasVariants && state.selectedMovementVariant) {
  movementPrompt = state.selectedMovementVariant.prompt;
}
```

3. **Exceção m8:**
```javascript
if (movement.id === 'm8') {
  return movementPrompt + MOVEMENT_ZOOM_SUFFIX;
  // m8 ignora scenarioPrompt para evitar conflito
}
```

4. **Combinação padrão:**
```javascript
const fullPrompt = scenarioPrompt
  ? `${scenarioPrompt}. ${movementPrompt}`
  : movementPrompt;
```

5. **Realismo de pele (s4 + m1):**
```javascript
if (state.selectedScenario?.id === 's4' && movement.id === 'm1') {
  return fullPrompt + skinRealism + MOVEMENT_ZOOM_SUFFIX;
}
```

6. **Retorno padrão:**
```javascript
return fullPrompt + MOVEMENT_ZOOM_SUFFIX;
```

---

## 📜 HISTÓRICO DE MUDANÇAS

### 2026-05-27
- ✅ **m8 realismo fotográfico:** Adicionado skin texture, poros visíveis, sem filtros
- ✅ **m8 câmera lenta corrigida:** Adicionado "natural real-life speed, no slow motion"

### 2026-05-26
- ✅ **m8 bypass s4:** m8 agora ignora prompt de s4 para evitar conflitos de instruções estáticas
- ✅ **m8 movimento contínuo:** Prompt reforçado com "continuous subtle natural movement"

### 2026-05-25
- ✅ **m8 implementado:** Novo movimento "Selfie no espelho" exclusivo para s4
- ✅ **scenarioOnly:** Sistema de filtragem dinâmica de movimentos
- ✅ **s4 warning:** Aviso orientativo para cenário de selfie
- ✅ **Cenários integrados:** buildVideoPrompt() agora combina cenário + movimento
- ✅ **Realismo s4+m1:** Skin realism adicionado para combinação específica

### 2026-05-24
- ✅ **m1 movimento natural:** Terceira iteração do prompt para forçar movimento vivo
- ✅ **m1 velocidade corrigida:** Adicionado "normal human speed" múltiplas vezes

### 2026-05-23
- ✅ **m1 fix foto estática:** Substituído prompt de câmera por movimento explícito da modelo
- ✅ **MOVEMENT_ZOOM_SUFFIX removido:** Corrige deformação de roupa em m1-m6

### 2026-05-22
- ✅ **m7 implementado:** Pose de Modelo com 2 variantes cinematográficas
- ✅ **m7-v1 Atitude Natural:** Prompt estruturado em 6 cenas temporais
- ✅ **m7-v2 Look Completo:** Rotação 360° + zoom cinematográfico

### Anteriores
- ✅ **s1 variantes:** Parede ao fundo com 3 opções (Branca, Madeira, Boiserie)
- ✅ **s3 variantes:** Lojas do Brás com 2 opções (Popular, Organizada)
- ✅ **Sistema de variantes:** hasVariants flag implementado

---

## 🎓 LIÇÕES APRENDIDAS

### IA de Vídeo (Kling v2.6 Pro)

1. **Movimento de câmera causa instabilidade geométrica**
   - Zoom pode deformar roupas
   - Câmera estática é mais confiável para e-commerce

2. **Instruções de velocidade devem ser explícitas**
   - "subtle" pode ser interpretado como "lento demais"
   - "natural human speed" deve ser repetido
   - "no slow motion" previne câmera lenta

3. **Conflitos de instruções**
   - Instruções opostas ("static" vs "movement") confundem IA
   - IA prioriza instruções anteriores no prompt
   - Prompts devem ser internamente consistentes

4. **Prompts cinematográficos funcionam**
   - Estrutura "SCENE N (Xs-Ys)" é eficaz
   - Marcadores temporais melhoram controle
   - Zoom deve ser descrito cena-por-cena

---

## 📞 REFERÊNCIAS

**Código fonte:**
- `public/app.js` linha 781-938 (arrays SCENARIOS e MOVEMENT_STYLES)
- `public/app.js` linha 1368-1414 (função buildVideoPrompt)
- `public/app.js` linha 1066-1088 (lógica de filtragem scenarioOnly)

**Specs:**
- `docs/superpowers/specs/2026-05-25-pose-modelo-variants.md`
- `docs/superpowers/specs/2026-05-27-fix-garment-deformation.md`

**Documentos de fix:**
- `FIX_APLICADO_DEFORMACAO.md`
- `PLANO_URGENTE_DEFORMACAO.md`

---

**Última revisão:** 27 de Maio de 2026  
**Mantido por:** Eduardo Manhães  
**Status:** ✅ Documentação completa e atualizada
