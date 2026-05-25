# Background Upload Removal - Deployment Verification Checklist

**Date:** 2026-05-25  
**Feature:** Background Upload Removal  
**Status:** Ready for Production Deployment

## Pre-Deployment Verification

- [ ] **Git Status Clean**
  ```bash
  git status  # Should show nothing to commit
  ```
  Expected: Working tree clean

- [ ] **All Commits Present**
  ```bash
  git log --oneline | head -10
  ```
  Expected: See the feature removal commits starting with "refactor: remove background upload UI"

- [ ] **No Uncommitted Changes**
  ```bash
  git diff
  git diff --cached
  ```
  Expected: No output (clean state)

---

## Deployment Step

Execute deployment to production:

```bash
# Push to main - this triggers Railway auto-deploy
git push origin main
```

Expected: Railway automatically detects the push and starts deployment pipeline

---

## Post-Deployment Verification (Execute in Production)

### Step 1: Monitor Railway Deployment

1. Go to Railway dashboard: https://railway.app
2. Select the "ModeloFacil" project
3. Monitor the deploy progress
4. Wait for deployment to complete (usually 2-5 minutes)
5. Confirm: Status shows "Active" (green)

Expected: ✅ Deployment completes without errors

### Step 2: Test Production URL

Access production application:
```
https://modelofacil.ia.br
# OR
https://[your-railway-domain].railway.app
```

Expected: Page loads successfully, no "Cannot GET" or 500 errors

### Step 3: Test Full Photo Generation Flow

1. **Step 1 (Modelo):** Select a model (e.g., "Kafre")
   - Expected: Model selection works, photo displays

2. **Step 2 (Produto):** Upload a product image
   - Expected: Image uploads and preview shows

3. **Step 3 (Cenário):** Verify background upload is GONE
   - Scroll down on Step 3
   - Expected: **NO upload zone visible** (previously showed "Ou importe sua própria imagem de cenário")
   - Expected: Only scenario grid with pre-defined scenarios shows
   - Select "Parede ao fundo" (has variants)
   - Expected: Variant options appear
   - Select a variant (e.g., "Branco puro")

4. **Step 4 (Pose):** Select a pose
   - Expected: Pose grid displays correctly

5. **Step 5 (Review & Generate):** Generate photo
   - Expected: Photo generates successfully
   - Expected: Final image displays with model wearing product

Expected: ✅ Complete flow works end-to-end

### Step 4: Verify Upload UI is Completely Removed

**Visual Verification:**

1. Inspect Step 3 (Cenário) with DevTools
   ```javascript
   // In browser console, should find nothing:
   document.getElementById('bgUploadZone')
   ```
   Expected: Returns `null`

   ```javascript
   document.getElementById('bgFileInput')
   ```
   Expected: Returns `null`

   ```javascript
   document.getElementById('bgPreview')
   ```
   Expected: Returns `null`

2. Right-click on Step 3 page → "Inspect" → Search for "bgUpload"
   Expected: No results found

3. Text search on page for "importe sua própria"
   Expected: Not found (that text was removed)

### Step 5: Check Browser Console for Errors

1. Open DevTools: `F12`
2. Go to "Console" tab
3. Reload the page: `F5`
4. Complete the full photo generation flow
5. Watch console for any red errors

Expected: ✅ **Zero console errors** (no "Cannot read property of null" or similar)

### Step 6: Test Different Scenarios

Test each scenario type to ensure no regressions:

**Scenario A: Without Variants ("Loja Moderna")**
- [ ] Select model
- [ ] Upload product
- [ ] Select "Loja Moderna"
- [ ] Button "Escolher Pose →" is ENABLED
- [ ] Can advance directly to pose selection
- [ ] Generate photo successfully

Expected: ✅ Works perfectly

**Scenario B: With Variants ("Parede ao fundo")**
- [ ] Select model
- [ ] Upload product
- [ ] Select "Parede ao fundo"
- [ ] Button "Escolher Pose →" is DISABLED
- [ ] Select variant "Branco puro"
- [ ] Button becomes ENABLED
- [ ] Advance to pose selection
- [ ] Generate photo successfully

Expected: ✅ Variant validation works

**Scenario C: Navigation and State Reset**
- [ ] Complete flow through Step 3 (Cenário)
- [ ] Go back to Step 2 (Produto)
- [ ] Change model
- [ ] Return to Step 3
- [ ] Verify scenario selection was reset
- [ ] Select new scenario
- [ ] Complete generation

Expected: ✅ State management works correctly

### Step 7: Validation Error Messages

Test validation to confirm error messages are correct:

1. Go to Step 3 (Cenário)
2. Click "Escolher Pose →" WITHOUT selecting scenario
   - Expected: Toast error: "Selecione um cenário."
   - Expected: ✅ No mention of "upload" in error

3. Select "Parede ao fundo" (scenario with variants)
4. Click "Escolher Pose →" WITHOUT selecting variant
   - Expected: Toast error: "Selecione a variante do cenário."
   - Expected: ✅ No mention of "upload" in error

Expected: ✅ All error messages are clean and correct

---

## Rollback Plan (If Needed)

If any issues are detected, rollback is simple:

```bash
# Find the last good commit (before background removal)
git log --oneline | grep -B5 "remove background"

# Revert the feature removal
git revert f971bd7  # (replace with the commit before removal)

# Force deploy
git push origin main
```

Expected: Railway redeploys to previous state

---

## Post-Deployment Completion

Once all checks pass, mark completion:

```bash
# Verify production is working
echo "✅ Background upload removal successfully deployed to production"
echo "✅ All verification checks passed"
echo "✅ Zero console errors in production"
echo "✅ Photo generation flow works end-to-end"
```

---

## Success Criteria Summary

| Check | Status | Evidence |
|-------|--------|----------|
| Deployment completes | ✅ | Railway shows "Active" |
| App loads in production | ✅ | No 500/404 errors |
| Step 3 upload UI gone | ✅ | bgUploadZone returns null |
| Photo generation works | ✅ | Successfully generates photo |
| Scenario selection works | ✅ | Can select and advance |
| Variant selection works | ✅ | Variants required when needed |
| Error messages correct | ✅ | No "upload" references |
| Console is clean | ✅ | Zero JavaScript errors |
| No regressions | ✅ | All flows work as expected |

---

## Notes

- **Feature Never Shipped:** This was unreleased code, so zero user impact
- **Backend Ignores It:** The API endpoint already ignores `background_reference`
- **Safe Removal:** All code was isolated with no cross-dependencies
- **Git History:** All commits are descriptive and can be reviewed if needed

---

## Verification Completed By

- [ ] **Human Verifier:** Name: ________________  Date: ________
- [ ] **All checks passed:** YES / NO
- [ ] **Issues found:** None / Describe: _____________________________

If issues are found, document them and execute rollback plan above.
