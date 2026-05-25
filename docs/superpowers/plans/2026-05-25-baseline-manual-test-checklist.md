# Baseline Manual Test Checklist - Photo Generation Flow

**Purpose:** Verify the photo generation flow works correctly before removing the background upload feature.

**Date:** 2026-05-25  
**Feature:** Photo Generation with Background Upload (Baseline)  
**Tester:** [Human verification required]

---

## Pre-Test Setup

- [ ] Application is running locally or accessible at development URL
- [ ] Browser DevTools console is open (F12)
- [ ] Clear browser cache or use incognito mode
- [ ] Network tab is monitored for API calls

---

## Test Scenario 1: Photo Generation Without Upload (Baseline Success)

**Objective:** Verify photo can be generated using only scenario selection (no background upload required).

### Step 3 - Cenário (Scenario) Verification

- [ ] Navigate to Step 3 (Cenário) in photo generation flow
- [ ] Verify upload zone is visible below scenario grid
  - [ ] Upload zone has text "Ou importe sua própria imagem de cenário (opcional)"
  - [ ] Upload zone has click-to-upload area
  - [ ] File input element exists but is hidden (check with DevTools)
- [ ] Verify scenario grid displays correctly
  - [ ] At least 5 scenarios are visible
  - [ ] Each scenario has a preview image and name

### Scenario Selection (Without Upload)

- [ ] Click on scenario "Loja Moderna" (a scenario WITHOUT variants)
- [ ] Verify scenario card shows "selected" state (visual highlight)
- [ ] Verify upload zone remains visible but scenario is selected
- [ ] Verify "Escolher Pose →" button is ENABLED
- [ ] **Expected Result:** Can advance without uploading background

### Variant Scenario Handling

- [ ] Click on scenario "Parede ao Fundo" (a scenario WITH variants)
- [ ] Verify variant selector appears (radio buttons or similar)
- [ ] Verify at least 3 variants are displayed:
  - [ ] "Branco puro"
  - [ ] "Ripado de madeira"
  - [ ] "Boiserie cinza"
- [ ] Verify "Escolher Pose →" button is DISABLED until variant selected
- [ ] Select variant "Branco puro"
- [ ] Verify button becomes ENABLED
- [ ] **Expected Result:** Variant selection workflow works without upload

---

## Test Scenario 2: Complete Photo Generation Flow

**Objective:** Verify complete flow from model selection to photo generation works.

### Step 1 - Model Selection

- [ ] Navigate to Step 1 (Modelo)
- [ ] Select a model (e.g., "Kafre")
- [ ] Verify model card shows selected state
- [ ] Verify "Escolher Produto →" button is ENABLED
- [ ] Click button to advance to Step 2

### Step 2 - Product Upload

- [ ] Upload a product image (JPG/PNG file)
- [ ] Verify preview image appears below upload zone
- [ ] Verify "Escolher Cenário →" button is ENABLED
- [ ] Click button to advance to Step 3

### Step 3 - Scenario Selection (No Upload)

- [ ] Verify upload zone is visible (baseline state)
- [ ] Select scenario WITHOUT uploading background
- [ ] If scenario has variants, select a variant
- [ ] Verify "Escolher Pose →" button is ENABLED
- [ ] **Expected Result:** Can advance without uploading background

### Step 4 - Pose Selection

- [ ] Verify pose grid displays correctly
- [ ] Select a pose (e.g., "Frontal")
- [ ] Verify pose card shows selected state
- [ ] Verify "Gerar Foto →" button is ENABLED
- [ ] Click button to generate photo

### Photo Generation

- [ ] Observe loading indicator appears
- [ ] Wait for API processing (typically 30-60 seconds)
- [ ] Verify final photo appears in Step 4
- [ ] Verify photo shows product in selected scenario/pose
- [ ] **Expected Result:** ✅ Photo generated successfully WITHOUT background upload

---

## Test Scenario 3: Validation and Error Handling

**Objective:** Verify validation messages guide users correctly.

### Advance Without Scenario Selection

- [ ] Navigate to Step 3 (Cenário)
- [ ] Do NOT select any scenario
- [ ] Do NOT upload background
- [ ] Click "Escolher Pose →" button
- [ ] Verify toast error appears: "Selecione um cenário ou faça upload de fundo."
- [ ] Verify user stays on Step 3
- [ ] **Expected Result:** Scenario or upload is required

### Advance Without Variant (When Required)

- [ ] Select scenario "Parede ao Fundo" (with variants)
- [ ] Do NOT select a variant
- [ ] Click "Escolher Pose →" button
- [ ] Verify toast error appears: "Selecione a variante do cenário."
- [ ] Verify user stays on Step 3
- [ ] Select a variant
- [ ] Verify error is gone and advance is possible
- [ ] **Expected Result:** Variant selection required for variant scenarios

---

## Test Scenario 4: Browser Console Verification

**Objective:** Ensure no JavaScript errors during flow.

### Console Error Check

- [ ] Open DevTools console (F12 → Console tab)
- [ ] Clear console before starting test
- [ ] Navigate through all steps (Steps 1-4)
- [ ] Complete a full photo generation
- [ ] Verify NO red error messages appear
- [ ] Verify NO warnings about undefined elements:
  - [ ] No "Cannot read property of undefined" errors
  - [ ] No "getElementById returned null" errors
  - [ ] No reference errors for bgImageBase64, bgUploadZone, etc.
- [ ] **Expected Result:** Clean console, zero errors

### Network Tab Check

- [ ] Open DevTools Network tab
- [ ] Perform photo generation
- [ ] Verify API requests are made:
  - [ ] POST request to `/api/photo-generation` (or similar)
  - [ ] Request includes: model_image, product_image, scenario, pose
  - [ ] Request does NOT include: background_reference (or background-related fields)
- [ ] Verify response status is 200-201
- [ ] **Expected Result:** API requests are correct

---

## Test Scenario 5: Navigation and State Reset

**Objective:** Verify application state resets correctly when navigating.

### Back Navigation with State Reset

- [ ] Reach Step 3 and select a scenario
- [ ] If scenario has variants, select a variant
- [ ] Click back button to return to Step 2
- [ ] Verify upload zone is still visible in Step 3
- [ ] Navigate back to Step 1
- [ ] Select a DIFFERENT model
- [ ] Advance to Step 2, upload new product, advance to Step 3
- [ ] Verify previously selected scenario is NO LONGER selected
- [ ] Verify upload zone is back to initial state (no preview)
- [ ] **Expected Result:** State resets correctly on model change

### Upload Zone Persistence

- [ ] Do NOT upload any background image
- [ ] Navigate through complete flow
- [ ] Return to Step 3
- [ ] Verify upload zone is still visible but empty
- [ ] **Expected Result:** UI state persists correctly

---

## Test Scenario 6: Different Scenario Types

**Objective:** Verify all scenario types work correctly.

### Test Each Scenario Without Upload

For each scenario, verify:
- [ ] **Parede ao Fundo** (WITH variants)
  - [ ] Variants appear correctly
  - [ ] Selection works
  - [ ] Advance requires variant selection
  
- [ ] **Loja Moderna** (NO variants)
  - [ ] Can select directly
  - [ ] No variant selector appears
  - [ ] Can advance immediately
  
- [ ] **Loja do Brás** (NO variants)
  - [ ] Can select directly
  - [ ] No variant selector appears
  - [ ] Can advance immediately
  
- [ ] **Espelho Corpo Inteiro** (NO variants)
  - [ ] Can select directly
  - [ ] No variant selector appears
  - [ ] Can advance immediately

- [ ] **Expected Result:** All scenarios work without background upload

---

## Test Summary

| Test Scenario | Status | Notes |
|---|---|---|
| Photo generation without upload | [ ] PASS / [ ] FAIL | |
| Complete flow Step 1-4 | [ ] PASS / [ ] FAIL | |
| Validation messages | [ ] PASS / [ ] FAIL | |
| Browser console clean | [ ] PASS / [ ] FAIL | |
| State reset on navigation | [ ] PASS / [ ] FAIL | |
| Scenario variants work | [ ] PASS / [ ] FAIL | |

---

## Critical Acceptance Criteria

For this baseline to be verified, ALL of the following MUST be true:

- [ ] **Photo generates successfully without uploading background** (baseline functionality)
- [ ] **All scenarios are selectable** (Parede ao Fundo, Loja Moderna, etc.)
- [ ] **Variant scenarios require variant selection** (enforced by UI/validation)
- [ ] **Validation messages are clear** (guide user to required selections)
- [ ] **Browser console is clean** (zero errors during complete flow)
- [ ] **API requests are correct** (model_image, product_image, scenario, pose)
- [ ] **Upload zone is visible** (still present in Step 3, even if not required)

---

## Tester Information

**Tester Name:** [Your Name]  
**Test Date:** [Date Tested]  
**Browser:** [Chrome/Firefox/Safari/Edge] v[Version]  
**OS:** [Windows/macOS/Linux]

**Overall Result:**
- [ ] ✅ ALL TESTS PASSED - Baseline verified, ready for implementation
- [ ] ❌ SOME TESTS FAILED - Issues found (document below)
- [ ] ❌ CANNOT TEST - Blocked (document below)

---

## Issues Found (if any)

If any test failed or issue found, document here:

```
Test: [Which test failed]
Issue: [What went wrong]
Error: [Any error message]
Steps to reproduce:
1. ...
2. ...
3. ...

Expected: [What should happen]
Actual: [What actually happened]
```

---

## Notes

- This baseline test verifies current state BEFORE removing background upload feature
- Background upload will be optional in baseline (can proceed without it)
- After implementation, upload zone will be removed entirely
- This checklist can be re-used to verify the feature removal is complete
