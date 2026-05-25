# Pose de Modelo com Variantes + Zoom Universal - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add "Pose de Modelo" movement style with 2 professional variants and apply universal zoom to all movement videos.

**Architecture:** Extend MOVEMENT_STYLES array following the exact pattern used in SCENARIOS (hasVariants + variants array). Add separate state property for movement variants to prevent cross-contamination with scenario variants. Update selectCard(), selectVariant(), and buildVideoPrompt() to support movement variants.

**Tech Stack:** Vanilla JavaScript (ES6), DOM manipulation

---

## File Structure

**Single file modified:**
- `public/app.js` - Main application logic (7 discrete changes)

**No new files created.**
**No HTML/CSS changes needed** - UI is fully dynamic via buildSelectionGrid().

---

### Task 1: Add Universal Zoom Constant

**Files:**
- Modify: `public/app.js:862-863`

- [ ] **Step 1: Add MOVEMENT_ZOOM_SUFFIX constant**

Add this constant immediately before the MOVEMENT_STYLES array (after line 862):

```javascript

// Sufixo de zoom universal para todos os vídeos de movimento
const MOVEMENT_ZOOM_SUFFIX = ', cinematic camera slowly zooming in toward the garment in the final seconds, revealing fabric texture, stitching and clothing details in sharp focus, 4K cinematic finish';

const MOVEMENT_STYLES = [
```

Expected result: Constant defined as single source of truth for zoom suffix.

- [ ] **Step 2: Verify syntax**

Run: `node -c public/app.js`
Expected: No output (syntax valid)

- [ ] **Step 3: Commit**

```bash
git add public/app.js
git commit -m "feat: add universal zoom constant for movement videos

Add MOVEMENT_ZOOM_SUFFIX constant to apply cinematic zoom effect
to all movement video prompts. Single source of truth for zoom.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 2: Rename m6 to Avoid Confusion

**Files:**
- Modify: `public/app.js:903`

- [ ] **Step 1: Change m6 label**

Change line 903 from:
```javascript
    label: 'Look completo',
```

To:
```javascript
    label: 'Vista no espelho',
```

Context: Prevents name collision with new m7 variant 2 "Look Completo". m6 functionality (mirror view) remains unchanged.

- [ ] **Step 2: Verify syntax**

Run: `node -c public/app.js`
Expected: No output (syntax valid)

- [ ] **Step 3: Commit**

```bash
git add public/app.js
git commit -m "refactor: rename m6 from 'Look completo' to 'Vista no espelho'

Prevents confusion with new m7 variant 'Look Completo'. Functionality
unchanged - still generates mirror front/back video.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 3: Add m7 "Pose de Modelo" with Variants

**Files:**
- Modify: `public/app.js:906-907`

- [ ] **Step 1: Add m7 entry with 2 variants**

After line 906 (closing brace of m6), before line 907 (closing bracket of MOVEMENT_STYLES), add:

```javascript
  },
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

**Important:** Keep the comma after m6's closing brace (line 906) and ensure m7 has NO trailing comma.

- [ ] **Step 2: Verify syntax**

Run: `node -c public/app.js`
Expected: No output (syntax valid)

- [ ] **Step 3: Verify structure**

Check that:
- m7 has `hasVariants: true`
- m7 has `variants` array with 2 objects
- Each variant has `id`, `label`, `prompt`
- Prompts are 600+ characters (professional cinematographic descriptions)

- [ ] **Step 4: Commit**

```bash
git add public/app.js
git commit -m "feat: add m7 'Pose de Modelo' movement style with 2 variants

Variant 1 'Atitude Natural': Fluid sequence with fabric adjustment,
hair touch, turn to camera, and zoom engagement.

Variant 2 'Look Completo': 360-degree rotation with zoom from face
to feet revealing complete outfit.

Professional cinematographic prompts focused on Brazilian fashion.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 4: Add Movement Variant State Property

**Files:**
- Modify: `public/app.js:924-925`

- [ ] **Step 1: Add selectedMovementVariant property**

After line 924 (`selectedMovement: null,`), before line 925 (`selectedSessionImage: null,`), add:

```javascript
  selectedMovement: null,
  selectedMovementVariant: null,  // Separate from selectedVariant (scenarios)
  selectedSessionImage: null,
```

Purpose: Separate state for movement variants prevents cross-contamination with scenario variants.

- [ ] **Step 2: Verify syntax**

Run: `node -c public/app.js`
Expected: No output (syntax valid)

- [ ] **Step 3: Commit**

```bash
git add public/app.js
git commit -m "feat: add selectedMovementVariant state property

Separate state property for movement variants prevents confusion
with selectedVariant (used for scenario variants).

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 5: Update selectCard() for Movement Variants

**Files:**
- Modify: `public/app.js:1036-1042`

- [ ] **Step 1: Replace movement branch in selectCard()**

Replace lines 1036-1042 (the `else if (type === 'movement')` block):

**BEFORE:**
```javascript
    } else if (type === 'movement') {
      state.selectedMovement = MOVEMENT_STYLES.find(m => m.id === id);
      state.videoStyle = 'movement';
      document.getElementById('talkingForm').style.display = 'none';
      document.getElementById('btnSelectTalking').style.display = '';
      document.getElementById('btnNextVideoStep2').disabled = false;
    }
```

**AFTER:**
```javascript
    } else if (type === 'movement') {
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

Logic: Mirrors the scenario pattern (lines 1015-1035). Shows variants container if movement has variants, disables button until variant selected.

- [ ] **Step 2: Verify syntax**

Run: `node -c public/app.js`
Expected: No output (syntax valid)

- [ ] **Step 3: Commit**

```bash
git add public/app.js
git commit -m "feat: add variant support to selectCard() movement branch

When movement has variants, show variants container and disable
next button until variant is selected. Mirrors scenario pattern.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 6: Refactor selectVariant() for Both Types

**Files:**
- Modify: `public/app.js:1046-1063`

- [ ] **Step 1: Replace selectVariant() function**

Replace the entire function (lines 1046-1063):

**BEFORE:**
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

**AFTER:**
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

Changes:
- Rename parameter `scenarioId` → `parentId` (more generic)
- Add dispatch logic: if type === 'scenario' use selectedVariant, if type === 'movement' use selectedMovementVariant
- Enable appropriate button based on type

- [ ] **Step 2: Verify syntax**

Run: `node -c public/app.js`
Expected: No output (syntax valid)

- [ ] **Step 3: Commit**

```bash
git add public/app.js
git commit -m "refactor: extend selectVariant() to handle both scenarios and movements

Dispatch on type parameter:
- 'scenario' → updates selectedVariant, enables btnNextStep3
- 'movement' → updates selectedMovementVariant, enables btnNextVideoStep2

Rename scenarioId param to parentId for clarity.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 7: Update buildVideoPrompt() for Variants + Zoom

**Files:**
- Modify: `public/app.js:1287-1294`

- [ ] **Step 1: Replace movement video branch in buildVideoPrompt()**

Replace the `else` block (lines 1287-1294):

**BEFORE:**
```javascript
  } else {
    // Vídeo de movimento — usa o prompt do movimento selecionado
    const movement = state.selectedMovement;
    if (!movement || !movement.prompt) {
      return 'Fashion model standing naturally in elegant studio setting, subtle natural movement, professional fashion photography, cinematic quality, soft studio lighting, 4K resolution';
    }
    return movement.prompt;
  }
```

**AFTER:**
```javascript
  } else {
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

Logic:
1. If movement has variants AND variant is selected → use variant.prompt
2. Else if movement has prompt → use movement.prompt
3. Else → use fallback prompt
4. **Always** append MOVEMENT_ZOOM_SUFFIX to final result

- [ ] **Step 2: Verify syntax**

Run: `node -c public/app.js`
Expected: No output (syntax valid)

- [ ] **Step 3: Commit**

```bash
git add public/app.js
git commit -m "feat: add variant support and universal zoom to buildVideoPrompt()

Movement video prompt logic:
1. Check if movement has variants and one is selected → use variant.prompt
2. Otherwise use movement.prompt
3. Always append MOVEMENT_ZOOM_SUFFIX for cinematic zoom effect

Universal zoom now applies to ALL movement videos (m1-m7).

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 8: Final Validation

**Files:**
- Validate: `public/app.js`

- [ ] **Step 1: Final syntax check**

Run: `node -c public/app.js`
Expected: No output (syntax valid)

If errors appear, review the changes and fix before proceeding.

- [ ] **Step 2: Visual inspection**

Check that all 7 changes are present:
1. ✅ MOVEMENT_ZOOM_SUFFIX constant defined (line ~863)
2. ✅ m6 label changed to "Vista no espelho" (line ~903)
3. ✅ m7 with variants added (after line ~906)
4. ✅ selectedMovementVariant state property added (line ~925)
5. ✅ selectCard() movement branch updated (lines ~1036-1060)
6. ✅ selectVariant() refactored for both types (lines ~1046-1067)
7. ✅ buildVideoPrompt() supports variants + zoom (lines ~1287-1307)

- [ ] **Step 3: Check git status**

Run: `git status`
Expected: Only `public/app.js` should be modified

- [ ] **Step 4: Review diff**

Run: `git diff public/app.js`
Expected: See all 7 changes clearly in the diff

---

### Task 9: Push to Production

**Files:**
- Deploy: `public/app.js`

- [ ] **Step 1: Push to remote**

```bash
git push origin main
```

Expected: Push successful, Railway auto-deploy triggered

- [ ] **Step 2: Monitor Railway deployment**

Check Railway dashboard to confirm:
- Build starts automatically
- Build completes without errors
- Deployment succeeds

- [ ] **Step 3: Verify production**

Open production URL and test:
1. Navigate to Video generation
2. Click "Movimento" tab
3. Verify m6 shows "Vista no espelho"
4. Select m7 "Pose de Modelo" → variants should appear
5. Select variant → button should enable
6. Check console for errors (should be clean)

---

## Testing Checklist (Manual)

After deployment, verify these scenarios in production:

### ✅ m7 with Variants
- [ ] Select m7 → variants "Atitude Natural" and "Look Completo" appear
- [ ] Button "Gerar Vídeo" is disabled until variant selected
- [ ] Select v1 → button enables
- [ ] Select v2 → v1 deselects, v2 selects, button stays enabled
- [ ] Generate video with v1 → check that prompt includes variant text + zoom

### ✅ m1-m6 Without Variants
- [ ] Select m1 → button enables immediately (no variants shown)
- [ ] Generate video with m1 → verify zoom suffix is applied
- [ ] Repeat for m2, m3, m4, m5, m6 → all should have zoom

### ✅ m6 Renamed
- [ ] m6 displays as "Vista no espelho" (not "Look completo")
- [ ] Subtitle still shows "Frente e costas"
- [ ] Generates mirror video correctly

### ✅ Navigation Between Movements
- [ ] m7 v1 selected → switch to m1 → switch back to m7 → variants reset
- [ ] m7 v1 selected → switch to m7 again → variants reset
- [ ] Rapid switching between m1-m7 → no UI glitches

### ✅ Integration with Talking Video
- [ ] Generate m7 v1 → switch to Talking → selectedMovementVariant should clear
- [ ] Talking video → switch to m7 → variants appear correctly

### ✅ Console Errors
- [ ] Open browser console (F12)
- [ ] Navigate through all movement selections
- [ ] Verify: No errors, no warnings about undefined properties

---

## Rollback Plan

If issues are found in production:

```bash
# Find the last good commit
git log --oneline -10

# Revert all 7 commits from this implementation
git revert <commit-hash-task-7>
git revert <commit-hash-task-6>
git revert <commit-hash-task-5>
git revert <commit-hash-task-4>
git revert <commit-hash-task-3>
git revert <commit-hash-task-2>
git revert <commit-hash-task-1>

# Push revert
git push origin main
```

Alternatively, revert to the commit before Task 1:
```bash
git reset --hard <commit-before-task-1>
git push --force origin main
```

**Warning:** Force push should only be used if no other work has been pushed to main.

---

## Success Criteria

- [x] All 7 code changes implemented
- [x] Syntax validation passes (node -c)
- [x] All commits pushed to main
- [ ] Railway deployment successful
- [ ] Production testing: m7 variants work
- [ ] Production testing: m1-m6 have zoom
- [ ] Production testing: m6 renamed correctly
- [ ] Production testing: No console errors

---

**Total estimated time:** 35-45 minutes (7 tasks × 5 min each + testing)
**Files modified:** 1 (public/app.js)
**Net lines changed:** +51 lines
