# Remove Background Upload Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the unused background upload feature from photo generation flow to simplify the interface.

**Architecture:** Safe incremental removal starting with UI, then JavaScript logic. Each step verified with manual testing to ensure no regressions. No backend changes needed (already ignores `background_reference`).

**Tech Stack:** HTML, JavaScript (Vanilla), Git

---

## File Structure

**Files to Modify:**
- `public/index.html` - Remove background upload UI elements (lines ~195-206)
- `public/app.js` - Remove state, setup, validation, and API sending logic (~27 lines total)

**No files created or deleted.**

---

## Task 1: Baseline Verification

**Files:**
- Read: `public/index.html:195-206`
- Read: `public/app.js:916,963-969,1028-1030,1167-1175,1448`

**Purpose:** Verify current state and document baseline behavior before making changes.

- [ ] **Step 1: Read and verify HTML section**

Read `public/index.html` lines 195-206 to confirm background upload UI exists:

```bash
# Verify the upload zone exists
grep -n "bgUploadZone" public/index.html
```

Expected: Lines 197-206 containing `<div id="bgUploadZone">`, `bgFileInput`, `bgPreview`

- [ ] **Step 2: Read and verify JavaScript references**

```bash
# Check all bgImageBase64 references
grep -n "bgImageBase64" public/app.js
```

Expected: Lines 916, 964, 1028, 1167, 1448 confirmed

- [ ] **Step 3: Test current photo generation flow**

Manual test:
1. Open application in browser
2. Navigate to photo generation
3. Go to Step 3 (Cenário)
4. Verify upload zone is visible below scenario grid
5. Select a scenario instead of uploading
6. Complete generation successfully

Expected: Photo generates successfully using scenario (not upload)

- [ ] **Step 4: Document baseline**

Create baseline checkpoint:

```bash
git add -A
git commit -m "checkpoint: baseline before removing background upload feature"
```

---

## Task 2: Remove HTML Upload UI

**Files:**
- Modify: `public/index.html:195-206`

**Purpose:** Remove the upload zone UI elements to prevent users from accessing the non-functional feature.

- [ ] **Step 1: Locate the upload section**

Open `public/index.html` and find the background upload section (around line 195):

```html
<!-- Should see this section -->
<div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--borda);">
  <span>Ou importe sua própria imagem de cenário (opcional)</span>
</div>
<div class="upload-zone upload-zone-sm" id="bgUploadZone" onclick="document.getElementById('bgFileInput').click()">
  ...
</div>
```

- [ ] **Step 2: Remove the upload section**

Delete lines ~195-206 completely. Remove:
- The divider with "Ou importe sua própria imagem de cenário (opcional)"
- The entire `<div id="bgUploadZone">` block including:
  - `<input id="bgFileInput">`
  - `<div id="bgPlaceholder">`
  - `<img id="bgPreview">`
  - The "Trocar" button

After removal, the scenario step should end with the scenario grid and navigation buttons, with no upload option.

- [ ] **Step 3: Verify HTML syntax**

Check for any unclosed tags or syntax errors:

```bash
# Basic HTML validation - check for obvious errors
grep -A2 -B2 "photoStep3" public/index.html | tail -20
```

Expected: Clean HTML structure, no references to bgUpload, bgFileInput, or bgPreview

- [ ] **Step 4: Test in browser**

Manual test:
1. Refresh application in browser
2. Navigate to Step 3 (Cenário)
3. Verify upload zone no longer appears
4. Verify scenario grid still displays correctly
5. Verify navigation buttons work

Expected: Only scenario grid visible, no upload option

- [ ] **Step 5: Commit HTML changes**

```bash
git add public/index.html
git commit -m "refactor: remove background upload UI from photo step 3

- Remove upload zone container (bgUploadZone)
- Remove file input (bgFileInput)
- Remove preview image (bgPreview)
- Remove 'import your own scenario' section

Simplifies interface to focus on pre-defined scenarios only."
```

---

## Task 3: Remove JavaScript State

**Files:**
- Modify: `public/app.js:916`

**Purpose:** Remove `bgImageBase64` from state object now that UI is gone.

- [ ] **Step 1: Locate state object**

Open `public/app.js` and find the state object (around line 916):

```javascript
const state = {
  selectedModel: null,
  productImageBase64: null,
  bgImageBase64: null,  // ← REMOVE THIS LINE
  selectedScenario: null,
  // ... rest of state
};
```

- [ ] **Step 2: Remove bgImageBase64 property**

Delete the line:
```javascript
bgImageBase64: null,
```

State object should now have no reference to background images.

- [ ] **Step 3: Verify no syntax errors**

Check JavaScript syntax:

```bash
# Quick syntax check - look for state object
grep -A10 "const state = {" public/app.js | head -15
```

Expected: Clean state object, no `bgImageBase64`, proper commas

- [ ] **Step 4: Test in browser console**

Manual test:
1. Refresh browser
2. Open DevTools console
3. Check for JavaScript errors

Expected: No errors, app loads normally

- [ ] **Step 5: Commit state removal**

```bash
git add public/app.js
git commit -m "refactor: remove bgImageBase64 from state object

Background image upload state is no longer needed after UI removal."
```

---

## Task 4: Remove Upload Setup Function Call

**Files:**
- Modify: `public/app.js:963-969`

**Purpose:** Remove the initialization code that sets up the background file input (now deleted).

- [ ] **Step 1: Locate setupFileInput call**

Find the background upload setup (around line 963):

```javascript
setupFileInput('bgFileInput', 'bgUploadZone', 'bgPreview', (b64) => {
  state.bgImageBase64 = b64;
  // Se usuário fez upload de bg, desselecionar card de cenário
  document.querySelectorAll('#scenarioGrid .sel-card').forEach(c => c.classList.remove('selected'));
  state.selectedScenario = null;
  document.getElementById('btnNextStep3').disabled = false;
});
```

**Note:** The `setupFileInput` function itself should NOT be removed - it's used for product image upload too.

- [ ] **Step 2: Remove the setupFileInput call**

Delete lines 963-969 completely (the entire callback block).

Leave other `setupFileInput` calls untouched (e.g., for `productFileInput`).

- [ ] **Step 3: Verify function calls**

Check that product upload setup remains:

```bash
# Should find setupFileInput for product but not bg
grep -n "setupFileInput.*FileInput" public/app.js
```

Expected: Only `setupFileInput('productFileInput', ...)` remains

- [ ] **Step 4: Test in browser**

Manual test:
1. Refresh browser
2. Open DevTools console
3. Navigate through photo generation steps

Expected: No errors about bgFileInput or bgUploadZone not found

- [ ] **Step 5: Commit setup removal**

```bash
git add public/app.js
git commit -m "refactor: remove background upload setupFileInput call

Removes initialization of background file input since the UI elements
(bgFileInput, bgUploadZone, bgPreview) no longer exist."
```

---

## Task 5: Remove Reset Logic

**Files:**
- Modify: `public/app.js:1028-1030`

**Purpose:** Remove code that resets background upload state when user changes model selection.

- [ ] **Step 1: Locate reset logic**

Find the model selection change handler (around line 1025):

```javascript
const scenario = SCENARIOS.find(s => s.id === id);
state.selectedScenario = scenario;
state.selectedVariant = null;
state.bgImageBase64 = null;  // ← REMOVE
document.getElementById('bgUploadZone').classList.remove('has-image');  // ← REMOVE
document.getElementById('bgPreview').src = '';  // ← REMOVE
```

- [ ] **Step 2: Remove bgImage reset lines**

Delete these 3 lines:
```javascript
state.bgImageBase64 = null;
document.getElementById('bgUploadZone').classList.remove('has-image');
document.getElementById('bgPreview').src = '';
```

Keep the scenario and variant reset logic.

- [ ] **Step 3: Verify reset logic**

Check the function still resets scenario properly:

```bash
# Verify scenario reset remains clean
grep -A5 "state.selectedScenario = scenario" public/app.js | head -10
```

Expected: Only scenario and variant reset, no bgImage references

- [ ] **Step 4: Test scenario selection**

Manual test:
1. Refresh browser
2. Select a model
3. Select a scenario
4. Go back and change model
5. Verify scenario resets correctly

Expected: No console errors, scenario selection works

- [ ] **Step 5: Commit reset removal**

```bash
git add public/app.js
git commit -m "refactor: remove background upload reset logic

Removes bgImageBase64 state reset and DOM manipulation for removed
upload zone when user changes model selection."
```

---

## Task 6: Simplify Validation Logic

**Files:**
- Modify: `public/app.js:1167-1175`

**Purpose:** Simplify scenario validation to require only scenario selection (remove "scenario OR upload" logic).

- [ ] **Step 1: Locate validation code**

Find the step 3 validation (around line 1167):

```javascript
// BEFORE (remove this)
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
```

- [ ] **Step 2: Replace with simplified validation**

Replace lines 1167-1175 with:

```javascript
// AFTER (new code)
if (!state.selectedScenario?.id) {
  showToast('Selecione um cenário.', 'error');
  return;
}

if (state.selectedScenario?.hasVariants && !state.selectedVariant) {
  showToast('Selecione a variante do cenário.', 'error');
  return;
}
```

**Key changes:**
- Remove `hasBgUpload` variable
- Remove "OR upload" logic from both validations
- Simplify error messages
- Scenario is now always required

- [ ] **Step 3: Verify validation logic**

Check the validation is clean:

```bash
# Should not find hasBgUpload or bgImageBase64 in validation
grep -n "hasBgUpload\|bgImageBase64" public/app.js
```

Expected: Only line 1448 remains (will be removed in next task)

- [ ] **Step 4: Test validation**

Manual test:
1. Refresh browser
2. Navigate to Step 3 (Cenário)
3. Try to advance without selecting scenario
4. Verify error message: "Selecione um cenário."
5. Select scenario with variants (e.g., "Parede ao fundo")
6. Try to advance without selecting variant
7. Verify error message: "Selecione a variante do cenário."
8. Select variant and advance
9. Verify advancement works

Expected: Clean validation, scenario now required, no upload option

- [ ] **Step 5: Commit validation simplification**

```bash
git add public/app.js
git commit -m "refactor: simplify scenario validation logic

Remove 'scenario OR upload' validation logic. Scenario selection is
now always required. Simplifies validation from 8 lines to 6 lines.

Updated error messages:
- 'Selecione um cenário ou faça upload de fundo' → 'Selecione um cenário'
- Variant validation no longer checks for upload bypass"
```

---

## Task 7: Remove API Sending Logic

**Files:**
- Modify: `public/app.js:1448`

**Purpose:** Remove code that sends `background_reference` to the API (backend already ignores it).

- [ ] **Step 1: Locate API sending code**

Find the inputs preparation for photo generation (around line 1448):

```javascript
// Build inputs object
const inputs = {
  model_image: state.selectedModel.reference_url,
  product_image: state.productImageBase64,
  prompt_pose: state.selectedPose?.prompt || '',
  prompt_scenario: state.selectedScenario?.prompt || '',
  aspect_ratio: state.aspectRatio || '9:16',
};

if (state.bgImageBase64) inputs.background_reference = getCleanBase64(state.bgImageBase64);  // ← REMOVE THIS
```

- [ ] **Step 2: Remove background_reference line**

Delete the line:
```javascript
if (state.bgImageBase64) inputs.background_reference = getCleanBase64(state.bgImageBase64);
```

The `inputs` object should now only contain the 5 core fields, no conditional background_reference.

- [ ] **Step 3: Verify no bgImage references remain**

Final check that all references are gone:

```bash
# Should return NO matches
grep -n "bgImageBase64\|bgUploadZone\|bgFileInput\|bgPreview\|background_reference" public/app.js
```

Expected: No matches found

```bash
grep -n "bgImageBase64\|bgUploadZone\|bgFileInput\|bgPreview" public/index.html
```

Expected: No matches found

- [ ] **Step 4: Test photo generation**

Manual test - FULL FLOW:
1. Refresh browser
2. Select model
3. Upload product image
4. Select scenario (e.g., "Loja Moderna")
5. Select pose
6. Generate photo
7. Verify photo generates successfully

Expected: Complete generation with no errors, photo displays correctly

- [ ] **Step 5: Commit API sending removal**

```bash
git add public/app.js
git commit -m "refactor: remove background_reference from API inputs

Backend already ignores this field. Removing last reference to
background upload functionality.

All background upload code now fully removed from frontend."
```

---

## Task 8: Final Regression Testing

**Files:**
- Test: `public/index.html`
- Test: `public/app.js`

**Purpose:** Comprehensive testing to verify no regressions and all functionality works correctly.

- [ ] **Step 1: Test scenarios without variants**

Manual test:
1. Select model
2. Upload product
3. Select "Loja Moderna" (no variants)
4. Verify button "Escolher Pose →" is enabled
5. Advance to pose selection
6. Complete generation

Expected: ✅ Works perfectly

- [ ] **Step 2: Test scenarios with variants**

Manual test:
1. Select model
2. Upload product
3. Select "Parede ao fundo" (has variants)
4. Verify button "Escolher Pose →" is DISABLED
5. Select variant "Branco puro"
6. Verify button is now ENABLED
7. Complete generation

Expected: ✅ Variant selection required and works

- [ ] **Step 3: Test validation errors**

Manual test:
1. Navigate to Step 3 (Cenário)
2. Click "Escolher Pose →" without selecting scenario
3. Verify error: "Selecione um cenário."
4. Select "Parede ao fundo" (has variants)
5. Click "Escolher Pose →" without selecting variant
6. Verify error: "Selecione a variante do cenário."

Expected: ✅ Clean error messages, no upload references

- [ ] **Step 4: Test navigation flow**

Manual test:
1. Complete flow up to Step 3
2. Go back to Step 2
3. Change model
4. Verify scenario is reset (expected behavior)
5. Select new scenario
6. Complete generation

Expected: ✅ Navigation works, state resets correctly

- [ ] **Step 5: Test browser console**

Manual test:
1. Open DevTools console
2. Navigate through all photo generation steps
3. Complete a full generation
4. Verify NO errors or warnings

Expected: ✅ Clean console, no getElementById errors for removed elements

- [ ] **Step 6: Test different scenarios**

Test each scenario type:
1. ✅ Parede ao fundo (with variants)
2. ✅ Loja Moderna (no variants)
3. ✅ Loja do Brás (no variants)
4. ✅ Espelho Corpo Inteiro (no variants)
5. ✅ Each generates successfully

- [ ] **Step 7: Document testing results**

Create testing report:

```bash
# Create test report
cat > docs/superpowers/plans/2026-05-25-remove-background-test-results.txt << 'EOF'
Background Upload Removal - Test Results
Date: 2026-05-25

✅ All scenarios without variants work
✅ All scenarios with variants require variant selection
✅ Validation messages are clear and correct
✅ Navigation and state reset works
✅ No console errors or warnings
✅ Photo generation completes successfully
✅ No references to removed elements remain

Tested scenarios:
- Parede ao fundo (variants: Branco puro, Ripado de madeira, Boiserie cinza)
- Loja Moderna
- Loja do Brás
- Espelho Corpo Inteiro

All tests passed. Feature removal complete and verified.
EOF

git add docs/superpowers/plans/2026-05-25-remove-background-test-results.txt
git commit -m "test: document regression testing results for background upload removal

All scenarios tested and verified working. No regressions detected."
```

- [ ] **Step 8: Final verification commit**

Create final checkpoint:

```bash
git add -A
git commit -m "checkpoint: background upload feature fully removed and tested

Summary of changes:
- Removed 11 lines from public/index.html (upload UI)
- Removed ~27 lines from public/app.js (state, setup, validation, API)
- Simplified validation logic from 8 to 6 lines
- All regression tests passed
- Zero console errors

Total reduction: ~38 lines of code removed"
```

---

## Task 9: Documentation and Deployment

**Files:**
- Read: `docs/superpowers/specs/2026-05-25-remove-background-feature.md`
- Modify: `docs/superpowers/plans/2026-05-25-remove-background-feature.md` (this file)

**Purpose:** Update documentation and prepare for production deployment.

- [ ] **Step 1: Update spec status**

Mark spec as implemented:

```bash
# Update spec status
sed -i 's/Status: Aprovado para implementação/Status: Implementado/' docs/superpowers/specs/2026-05-25-remove-background-feature.md

git add docs/superpowers/specs/2026-05-25-remove-background-feature.md
git commit -m "docs: mark background upload removal spec as implemented"
```

- [ ] **Step 2: Update this plan with completion status**

Add completion note at the top of this plan file (after the header):

```markdown
**Status:** ✅ COMPLETED - All tasks executed and tested successfully

**Completion Date:** 2026-05-25

**Implementation Summary:**
- HTML: 11 lines removed (upload UI)
- JavaScript: 27 lines removed (logic)
- Validation: Simplified from 8 to 6 lines
- Total: ~38 lines of code removed
- Zero regressions detected
```

- [ ] **Step 3: Review git log**

Check all commits are clean and descriptive:

```bash
# Review last 10 commits
git log --oneline -10
```

Expected: Clean commit history with descriptive messages for each step

- [ ] **Step 4: Create summary commit**

```bash
git add docs/superpowers/plans/2026-05-25-remove-background-feature.md
git commit -m "docs: mark background upload removal plan as completed

All 9 tasks completed:
✅ Baseline verification
✅ HTML UI removal
✅ JavaScript state removal
✅ Upload setup removal
✅ Reset logic removal
✅ Validation simplification
✅ API sending removal
✅ Regression testing
✅ Documentation update"
```

- [ ] **Step 5: Prepare for production deployment**

Push to main branch for Railway auto-deploy:

```bash
# Push all commits
git push origin main
```

Expected: Railway automatically deploys the changes

- [ ] **Step 6: Monitor deployment**

After Railway deployment completes:
1. Open production URL
2. Test full photo generation flow
3. Check browser console for errors
4. Verify upload option is not visible

Expected: ✅ Production works correctly, no upload option visible

- [ ] **Step 7: Post-deployment verification**

Final production test checklist:
- ✅ Scenario selection works
- ✅ Variant selection works (for scenarios with variants)
- ✅ Validation errors are correct
- ✅ Photo generation succeeds
- ✅ No console errors
- ✅ No upload UI visible

---

## Plan Self-Review

### Spec Coverage Check

**Spec Section → Plan Task Mapping:**

✅ **Escopo da Remoção** → Tasks 2-7 (all removals covered)
- `public/index.html` modifications → Task 2
- `public/app.js` modifications → Tasks 3-7

✅ **Mudanças Detalhadas** → Exact task breakdown
- Mudança 1 (State) → Task 3
- Mudança 2 (Setup) → Task 4
- Mudança 3 (Reset) → Task 5
- Mudança 4 (Validation) → Task 6
- Mudança 5 (API sending) → Task 7

✅ **Plano de Testes** → Task 8
- All 5 test scenarios covered in regression testing

✅ **Verificação Completa** → Task 1 (baseline) + Task 8 (final verification)

**No gaps found.** All spec requirements have corresponding tasks.

### Placeholder Check

Scanning plan for red flags:
- ✅ No "TBD", "TODO", or "implement later"
- ✅ No "add appropriate error handling" without specifics
- ✅ No "write tests for the above" without actual test steps
- ✅ No "similar to Task N" references
- ✅ All code steps include actual code blocks
- ✅ All commands include expected output

**No placeholders found.** All steps are concrete and executable.

### Type Consistency Check

Checking naming consistency across tasks:
- ✅ `bgImageBase64` - consistent throughout
- ✅ `bgUploadZone` - consistent throughout
- ✅ `bgFileInput` - consistent throughout
- ✅ `bgPreview` - consistent throughout
- ✅ `setupFileInput` - consistent throughout
- ✅ `state.selectedScenario` - consistent throughout
- ✅ `showToast` - consistent throughout

**No inconsistencies found.** All references match across tasks.

---

## Summary

**Total Tasks:** 9
**Estimated Time:** 60-90 minutes
**Risk Level:** Low (feature never launched, backend ignores it)

**Key Principles Applied:**
- ✅ **DRY** - No duplicate code or instructions
- ✅ **YAGNI** - Removing unused feature
- ✅ **Frequent Commits** - Every task ends with commit
- ✅ **Bite-sized Steps** - Each step is 2-5 minutes
- ✅ **Manual Testing** - Each task includes verification

**Success Criteria:**
- No references to bgImage, bgUpload, bgPreview in code
- Scenario selection required and working
- No console errors
- Photo generation succeeds
- All regression tests pass
