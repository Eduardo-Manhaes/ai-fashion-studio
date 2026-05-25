# Regression Testing Checklist — Background Upload Removal

**Date:** 2026-05-25  
**Project:** Modelo Fácil — AI Fashion Studio  
**Version:** V2 (Post Background Upload Removal)  
**Objective:** Verify no functionality has been broken after removing background upload feature  

---

## Test Environment

- **Browser:** Chrome / Firefox / Safari (test at least one)
- **Platform:** Desktop or Mobile
- **Network:** Online (server available)
- **User Status:** Authenticated (must be logged in before starting tests)
- **Credentials:** Use test account with available credits

**Test Start Time:** _______________  
**Test End Time:** _______________  
**Tester Name:** _______________  

---

## TEST STEP 1: Scenarios Without Variants

### Objective
Verify photo generation works correctly when NO variant selection is made after generation.

### Test Scenario 1.1: Basic Photo Generation Flow
**Steps:**
1. Navigate to "Gerar Conteúdo" (Generate Content) tab
2. Confirm you're on the "Criação de Foto" (Photo Creation) tab
3. Click on the product upload zone
4. Select any test image (PNG, JPG, or WEBP, max 10MB)
5. Verify the preview shows your image
6. Click "Escolher Modelo →" button
7. Select one model from the grid (e.g., "Kafre")
8. Click "Escolher Cenário →" button
9. Select one scenario (e.g., "Loja Branca")
10. Click "Escolher Pose →" button
11. Select one pose (e.g., "Frontal Neutra")
12. Click "Configurações →" button
13. Leave all settings at defaults (2K, 4:5, Balanceado, PNG)
14. Verify cost shows "2 créditos"
15. Click "🤖 Gerar Foto com IA" button
16. Wait for generation to complete (loading spinner should appear)
17. **DO NOT** click "🎭 Criar Variações e Poses" button
18. Click "Download" button to download the generated image
19. Verify image downloads successfully

**Expected Results:**
- [  ] Product image uploads without errors
- [  ] Model preview displays correctly
- [  ] Scenario options load and display
- [  ] Pose options load and display
- [  ] Cost calculation is correct
- [  ] Loading spinner appears during generation
- [  ] Result screen shows success message
- [  ] Download button works and file downloads
- [  ] No console errors appear

**Issues Found:**
```
[space for documenting issues]
```

---

### Test Scenario 1.2: Navigate Back to Start Without Variants
**Steps:**
1. From the result screen (after successful generation without variants)
2. Click "Nova Foto" button (refresh icon)
3. Verify you return to Step 1 (product upload)
4. Confirm all previous selections are cleared
5. Upload a different product image
6. Complete the flow again (model → scenario → pose → settings → generate)
7. Wait for generation
8. Click "Nova Foto" again
9. Verify the flow restarts cleanly

**Expected Results:**
- [  ] Clicking "Nova Foto" returns to Step 1
- [  ] Previous selections are cleared
- [  ] New upload flow works without issues
- [  ] No state conflicts from previous generation
- [  ] Sidebar navigation still works

**Issues Found:**
```
[space for documenting issues]
```

---

### Test Scenario 1.3: Different Resolution Settings (No Variants)
**Steps:**
1. Complete the flow up to Step 5 (Settings)
2. Change Resolution to "1K — Rápido · 1 crédito"
3. Verify cost updates to "1 créditos"
4. Click "Gerar Foto com IA"
5. Wait for completion
6. Skip variants, download the image
7. Repeat for 4K resolution (cost should be 3 créditos)

**Expected Results:**
- [  ] Cost updates correctly when resolution changes
- [  ] 1K generation works and completes
- [  ] 4K generation works and completes
- [  ] Download works for all resolutions
- [  ] Loading time is appropriate for each resolution

**Issues Found:**
```
[space for documenting issues]
```

---

## TEST STEP 2: Scenarios With Variants

### Objective
Verify variant/pose creation works correctly after initial photo generation.

### Test Scenario 2.1: Create Variants After Generation
**Steps:**
1. Complete a full photo generation (Steps 1-6)
2. On the result screen, scroll down to "Criar Variações de Pose" section
3. Read the description: "Gera 3 variações com a mesma modelo, roupa e cenário — apenas mudando a pose e o ângulo"
4. Click "🎭 Criar Variações e Poses" button
5. Verify loading spinner appears
6. Wait for 3 variant images to load
7. Verify all 3 variants show different poses/angles of the same model and outfit
8. Verify each variant has download capability

**Expected Results:**
- [  ] Variants section is visible on result screen
- [  ] Button text is clear and descriptive
- [  ] Loading state shows during variant generation
- [  ] Exactly 3 variant images are generated
- [  ] Variants display the same model and outfit
- [  ] Variants show different poses/angles
- [  ] Each variant is downloadable
- [  ] Grid layout is responsive

**Issues Found:**
```
[space for documenting issues]
```

---

### Test Scenario 2.2: Download All Variants
**Steps:**
1. From the variants grid (after successful variant generation)
2. Click download button on first variant
3. Verify image downloads with appropriate filename
4. Click download button on second variant
5. Verify image downloads
6. Click download button on third variant
7. Verify image downloads
8. Check all 3 files are in your downloads folder

**Expected Results:**
- [  ] All 3 variant downloads work
- [  ] Files have unique/sequential names
- [  ] File sizes are appropriate
- [  ] Files are valid image formats
- [  ] No download errors in console

**Issues Found:**
```
[space for documenting issues]
```

---

### Test Scenario 2.3: Navigate to Video After Variants
**Steps:**
1. From the result screen with variants displayed
2. Scroll down to "Quer animar essa foto?" section
3. Click "Criar Vídeo com essa Foto" button
4. Verify you navigate to Video Creation (Step 1)
5. Verify the photo from the generation is pre-selected in the session gallery
6. Proceed with video generation (select style → style options → duration → generate)
7. Complete the video generation

**Expected Results:**
- [  ] Navigation to video creation works
- [  ] Generated photo appears in session gallery
- [  ] Photo selection is pre-filled
- [  ] Video generation flow works correctly
- [  ] Video is created successfully

**Issues Found:**
```
[space for documenting issues]
```

---

## TEST STEP 3: Validation Errors

### Objective
Verify all form validation works correctly and error messages are displayed.

### Test Scenario 3.1: Product Upload Validation
**Steps:**
1. Go to Step 1 (Product Upload)
2. Notice "Escolher Modelo →" button is disabled (grayed out)
3. Try clicking the disabled button (nothing should happen)
4. Upload a valid product image
5. Verify "Escolher Modelo →" button becomes enabled
6. Delete the image (click "Trocar imagem" and close without selecting)
7. Verify button becomes disabled again

**Expected Results:**
- [  ] Button starts disabled when no image is selected
- [  ] Button becomes enabled after image upload
- [  ] Button becomes disabled after image removal
- [  ] Upload zone shows clear placeholder text
- [  ] File type validation works (only image/* accepted)

**Issues Found:**
```
[space for documenting issues]
```

---

### Test Scenario 3.2: Model Selection Requirement
**Steps:**
1. Upload a product image (Step 1)
2. Click "Escolher Modelo →"
3. On Step 2, notice no model is pre-selected
4. Try clicking "Escolher Cenário →" without selecting a model
5. Nothing should happen (navigation should be blocked)
6. Select a model by clicking on its card
7. Verify the model card shows as selected (visual highlight)
8. Click "Escolher Cenário →"
9. Verify you advance to Step 3

**Expected Results:**
- [  ] No model is pre-selected by default
- [  ] Navigation is blocked until model is selected
- [  ] Selected model shows visual feedback
- [  ] Navigation works after selection
- [  ] Model choice persists through navigation

**Issues Found:**
```
[space for documenting issues]
```

---

### Test Scenario 3.3: Scenario and Pose Selection
**Steps:**
1. Complete flow up to Step 3 (Scenario selection)
2. Verify "Escolher Pose →" button is disabled
3. Select a scenario
4. Verify button becomes enabled
5. Click "Escolher Pose →"
6. On Step 4, verify no pose is pre-selected
7. Try clicking "Configurações →" without selecting a pose
8. Nothing should happen
9. Select a pose
10. Click "Configurações →"
11. Verify you advance to Step 5

**Expected Results:**
- [  ] Scenario selection enables next button
- [  ] Pose selection is required before advancing
- [  ] No pre-selections exist
- [  ] Selected options show visual feedback
- [  ] Navigation validation works at each step

**Issues Found:**
```
[space for documenting issues]
```

---

### Test Scenario 3.4: Cost Display and Credit Validation
**Steps:**
1. Go to Step 5 (Settings)
2. Note the current cost (e.g., "2 créditos")
3. Change resolution to 4K
4. Verify cost changes to "3 créditos"
5. Change aspect ratio (doesn't affect cost)
6. Change quality to "Máxima"
7. Verify cost remains "3 créditos"
8. Change back to 2K
9. Verify cost updates to "2 créditos"
10. Open browser console (F12)
11. Check that no errors appear in console

**Expected Results:**
- [  ] Cost displays correctly for each resolution
- [  ] Cost updates dynamically when settings change
- [  ] Non-cost settings don't affect price
- [  ] All cost displays are consistent
- [  ] No console warnings or errors

**Issues Found:**
```
[space for documenting issues]
```

---

## TEST STEP 4: Navigation Flow

### Objective
Verify all navigation between steps works correctly in both directions.

### Test Scenario 4.1: Forward Navigation (Photo)
**Steps:**
1. Start at Step 1 (Product)
2. Upload image → Click next
3. Verify Step 2 loads (Model selection)
4. Select model → Click next
5. Verify Step 3 loads (Scenario)
6. Select scenario → Click next
7. Verify Step 4 loads (Pose)
8. Select pose → Click next
9. Verify Step 5 loads (Settings)
10. Scroll to see cost box and generate button

**Expected Results:**
- [  ] Each forward navigation works
- [  ] All form data persists during navigation
- [  ] Step indicators update correctly
- [  ] Progress bar shows correct state
- [  ] All sections load without errors

**Issues Found:**
```
[space for documenting issues]
```

---

### Test Scenario 4.2: Backward Navigation (Photo)
**Steps:**
1. Be at Step 5 (Settings)
2. Click "← Voltar" (back button)
3. Verify Step 4 loads with previous pose selection intact
4. Click "← Voltar"
5. Verify Step 3 loads with scenario selection intact
6. Click "← Voltar"
7. Verify Step 2 loads with model selection intact
8. Click "← Voltar"
9. Verify Step 1 loads with image still selected

**Expected Results:**
- [  ] Each backward navigation works
- [  ] All previous selections are preserved
- [  ] Form data is not lost
- [  ] Step indicators update correctly
- [  ] No console errors during navigation

**Issues Found:**
```
[space for documenting issues]
```

---

### Test Scenario 4.3: Step Indicator Clicking (Photo)
**Steps:**
1. Be at Step 2 (Model selection)
2. Click on the Step 1 indicator (circle with "1")
3. Verify Step 1 loads
4. Select an image
5. Click on Step 3 indicator (should be disabled)
6. Nothing should happen
7. Click on Step 2 indicator
8. Verify Step 2 loads with previous model selection
9. Select model, then click Step 5 indicator (should be disabled)

**Expected Results:**
- [  ] Can click back to previous steps
- [  ] Cannot skip ahead (future steps are disabled)
- [  ] Previous selections are preserved
- [  ] Step indicators show proper state (active/disabled/completed)

**Issues Found:**
```
[space for documenting issues]
```

---

### Test Scenario 4.4: Sidebar Navigation During Photo Flow
**Steps:**
1. Be at Step 3 of photo generation
2. Click "Minhas fotos" in sidebar
3. Verify you navigate to the gallery view
4. Click "Gerar conteúdo" to go back
5. Verify you return to "Criação de Foto" but at Step 1 (not Step 3)
6. Go to Step 4
7. Click "Meus vídeos" in sidebar
8. Verify you navigate to videos gallery
9. Click "Gerar conteúdo"
10. Verify you're back at Step 1 of photo creation

**Expected Results:**
- [  ] Sidebar navigation away from flow works
- [  ] Returning to "Gerar conteúdo" starts fresh
- [  ] Form state is reset when navigating away
- [  ] Gallery views load correctly
- [  ] Navigation is smooth

**Issues Found:**
```
[space for documenting issues]
```

---

### Test Scenario 4.5: Video Menu Navigation
**Steps:**
1. Click on "Criação de Vídeo" tab (next to Photo tab)
2. Verify you're on Video Step 1
3. Verify progress indicator shows Video steps (Foto → Estilo → Config → Resultado)
4. Navigate to Step 2 (if photos exist)
5. Note the two video type sections
6. Try navigating with back/forward buttons
7. Return to "Criação de Foto" tab
8. Verify you're back in photo flow

**Expected Results:**
- [  ] Tab switching works between Photo/Video
- [  ] Each flow has its own step indicators
- [  ] Navigation within video flow works
- [  ] Tab switching preserves flow state
- [  ] Switching between tabs doesn't break state

**Issues Found:**
```
[space for documenting issues]
```

---

## TEST STEP 5: Browser Console Validation

### Objective
Verify no errors, warnings, or suspicious messages appear in the browser console.

### Test Scenario 5.1: Console During Page Load
**Steps:**
1. Open browser developer tools (F12 or right-click → Inspect)
2. Go to the Console tab
3. Load the application homepage
4. Wait for all elements to load
5. Check the console for any error messages (red X icon)
6. Check for warning messages (yellow triangle)
7. Look for any "Uncaught" errors
8. Document any messages that appear

**Expected Console Results (should NOT see):**
- [  ] No JavaScript errors
- [  ] No "Uncaught" exceptions
- [  ] No "Cannot read property" errors
- [  ] No "undefined is not a function" errors
- [  ] No "404" for missing files
- [  ] No CORS errors (unless expected)
- [  ] No "NaN" in calculations

**Console Messages (OK to see):**
- [  ] Auth library messages (expected)
- [  ] "Sidebar initialized" logs (expected)
- [  ] "[Sidebar]" prefixed messages (expected)

**Issues Found:**
```
[space for documenting issues]
```

---

### Test Scenario 5.2: Console During Photo Generation
**Steps:**
1. Clear console (click the circle-slash icon)
2. Complete a full photo generation flow
3. Wait for the result screen to appear
4. Check console for any errors
5. Click "🎭 Criar Variações e Poses"
6. Wait for variants to load
7. Check console for any errors during variant generation

**Expected Results:**
- [  ] No errors appear during generation
- [  ] No errors appear during variant creation
- [  ] No "Failed to fetch" messages
- [  ] No timeout errors
- [  ] All network requests succeed (check Network tab)

**Issues Found:**
```
[space for documenting issues]
```

---

### Test Scenario 5.3: Console During Video Generation
**Steps:**
1. Clear console
2. Go to Video Creation flow
3. If photos exist, select one and proceed
4. If no photos exist, generate a photo first
5. On Video Step 2, select "Modelo em Movimento"
6. Select a movement style
7. Advance to Step 3 and click "Gerar Vídeo com IA"
8. Wait for video generation
9. Check console for errors

**Expected Results:**
- [  ] No errors during video generation
- [  ] No network failures
- [  ] No state-related errors
- [  ] All expected messages appear

**Issues Found:**
```
[space for documenting issues]
```

---

### Test Scenario 5.4: Console During Gallery Loading
**Steps:**
1. Clear console
2. Click "Minhas fotos" in sidebar
3. Wait for photos gallery to load
4. Check console for errors
5. Click "Meus vídeos"
6. Wait for videos gallery to load
7. Check console for errors
8. Try filtering by different categories
9. Check console

**Expected Results:**
- [  ] Gallery loads without console errors
- [  ] Filtering doesn't cause errors
- [  ] No "undefined" errors
- [  ] No async/await rejection errors

**Issues Found:**
```
[space for documenting issues]
```

---

## TEST STEP 6: Different Scenarios and Models

### Objective
Verify generation works correctly with various combination of inputs.

### Test Scenario 6.1: All Model Types
**Steps:**
1. Go to Step 2 (Model selection)
2. Note all available models (e.g., Kafre, etc.)
3. Generate a photo with each model:
   - Select model
   - Proceed to scenario
   - Select scenario
   - Proceed to pose
   - Select pose
   - Generate and verify result
4. Repeat for each model variant

**Expected Results:**
- [  ] All models load correctly
- [  ] Each model generates successfully
- [  ] Results show the correct model
- [  ] No visual glitches in results
- [  ] Model previews are accurate

**Models Tested:**
- [ ] Kafre
- [ ] [Other models if available]

**Issues Found:**
```
[space for documenting issues]
```

---

### Test Scenario 6.2: All Scenario Types
**Steps:**
1. Go to Step 3 (Scenario selection)
2. Note all available scenarios
3. Generate photos with different scenarios:
   - For each scenario, pick a model and pose
   - Generate and verify
4. Document scenario names and their visual representation

**Expected Results:**
- [  ] All scenarios load and display
- [  ] Scenarios render correctly in results
- [  ] Lighting/background is appropriate
- [  ] No visual artifacts in generated images

**Scenarios Tested:**
- [ ] [List scenarios from the app]

**Issues Found:**
```
[space for documenting issues]
```

---

### Test Scenario 6.3: All Pose Options
**Steps:**
1. Go to Step 4 (Pose selection)
2. Note all available poses
3. Generate photos with different poses using the same model/scenario
4. Verify each pose is distinct
5. Compare results to ensure variety

**Expected Results:**
- [  ] All poses are available
- [  ] Each pose is visually distinct
- [  ] Poses match their descriptions
- [  ] No duplicate poses
- [  ] Poses are anatomically reasonable

**Poses Tested:**
- [ ] [List poses from the app]

**Issues Found:**
```
[space for documenting issues]
```

---

### Test Scenario 6.4: All Resolution/Quality Combinations
**Steps:**
1. Generate 3 photos with different combinations:
   - 1K, Rápido
   - 2K, Balanceado (default)
   - 4K, Máxima
2. Verify each completes successfully
3. Download each result
4. Compare file sizes and visual quality
5. Verify cost is correct for each

**Resolution Combinations Tested:**
| Resolution | Quality    | Expected Cost | Actual Cost | Status |
|-----------|-----------|---------------|-----------|--------|
| 1K        | Rápido    | 1 crédito     | ___        | [  ]   |
| 2K        | Balanceado| 2 créditos    | ___        | [  ]   |
| 4K        | Máxima    | 3 créditos    | ___        | [  ]   |

**Expected Results:**
- [  ] All resolutions generate successfully
- [  ] 1K is fastest
- [  ] 4K produces highest quality
- [  ] File sizes are proportional to resolution
- [  ] Cost matches expected values

**Issues Found:**
```
[space for documenting issues]
```

---

### Test Scenario 6.5: Aspect Ratio Variations
**Steps:**
1. Generate photos with different aspect ratios:
   - 3:4 (Retrato)
   - 4:5 (Instagram) — default
   - 9:16 (Stories/Reels)
   - 1:1 (Quadrado)
   - 16:9 (Widescreen)
2. Verify each generates and displays correctly
3. Check that proportions match the selected ratio

**Aspect Ratios Tested:**
- [ ] 3:4 (Retrato)
- [ ] 4:5 (Instagram)
- [ ] 9:16 (Stories/Reels)
- [ ] 1:1 (Quadrado)
- [ ] 16:9 (Widescreen)

**Expected Results:**
- [  ] All aspect ratios render correctly
- [  ] Proportions are accurate
- [  ] Model is centered and well-composed
- [  ] No cropping artifacts
- [  ] Layout adapts to each ratio

**Issues Found:**
```
[space for documenting issues]
```

---

## TEST STEP 7: Video Generation Scenarios

### Objective
Verify video generation works correctly with different video types.

### Test Scenario 7.1: Movement-Based Video (Kling AI)
**Steps:**
1. Navigate to Video Creation (make sure photos exist)
2. Select a previously generated photo
3. Click "Escolher Estilo de Vídeo →"
4. On Step 2, find "Modelo em Movimento" section
5. Select a movement style (e.g., "Caminhada leve")
6. Click "Escolher Estilo de Vídeo →"
7. On Step 3, verify duration options (5s, 10s)
8. Verify resolution options (720p, 1080p)
9. Note cost display
10. Click "Gerar Vídeo com IA"
11. Wait for generation (can take 1-2 minutes)
12. Verify video plays and shows the model moving

**Expected Results:**
- [  ] Movement styles load correctly
- [  ] Duration and resolution options work
- [  ] Cost calculation is correct
- [  ] Video generation completes
- [  ] Video plays without errors
- [  ] Model motion is smooth and natural
- [  ] Product is visible in video

**Issues Found:**
```
[space for documenting issues]
```

---

### Test Scenario 7.2: Talking-Based Video (Veo 3.1)
**Steps:**
1. Navigate to Video Creation
2. Select a previously generated photo
3. Click "Escolher Estilo de Vídeo →"
4. Find "Modelo Falando" section
5. Click "Quero a modelo falando" button
6. In the form that appears, enter a test phrase:
   "Esse look é perfeito para você! Confira nossa coleção."
7. Select a talking tone (e.g., "Apresentação do produto")
8. Click the forward button to proceed
9. On Step 3, select duration and resolution
10. Click "Gerar Vídeo com IA"
11. Wait for generation
12. Verify video shows model talking (lip-sync should be visible)

**Expected Results:**
- [  ] Talking form appears when selected
- [  ] Text input accepts Portuguese text
- [  ] Tone selection works
- [  ] Video generation for talking works
- [  ] Model's lips move while talking
- [  ] Audio (if any) syncs with lips
- [  ] Download works

**Issues Found:**
```
[space for documenting issues]
```

---

### Test Scenario 7.3: Download Video Results
**Steps:**
1. After video generation completes
2. Click "Download" button
3. Verify video file downloads
4. Check file size (should be reasonable for video)
5. Verify file plays in video player
6. Check video quality matches selected resolution

**Expected Results:**
- [  ] Video downloads successfully
- [  ] File format is standard (MP4/WebM)
- [  ] File size is appropriate
- [  ] Video plays in standard player
- [  ] Quality matches resolution setting

**Issues Found:**
```
[space for documenting issues]
```

---

### Test Scenario 7.4: Video Gallery Storage
**Steps:**
1. Generate 2-3 videos (different types/models)
2. Click "Meus vídeos" in sidebar
3. Verify all generated videos appear in gallery
4. Try filtering by type (Movimento, Falando)
5. Verify filters work correctly
6. Click on a video to view details
7. Download a video from the gallery

**Expected Results:**
- [  ] All videos appear in gallery
- [  ] Gallery loads without errors
- [  ] Video filtering works
- [  ] Video details modal displays correctly
- [  ] Download from gallery works
- [  ] Metadata is correct (creation date, type, duration)

**Issues Found:**
```
[space for documenting issues]
```

---

## TEST STEP 8: Settings and Account Features

### Objective
Verify settings and account information display correctly.

### Test Scenario 8.1: Settings View
**Steps:**
1. Click "Configurações" in sidebar
2. Verify the Settings view loads
3. Check "Informações da Conta" section displays:
   - Email address
   - Member since date
4. Check "Assinatura" section displays:
   - Current plan
   - Credit count
   - Renewal date

**Expected Results:**
- [  ] Settings view loads
- [  ] Email is correct
- [  ] Member date is accurate
- [  ] Plan name is correct
- [  ] Credit count matches sidebar
- [  ] Renewal date is shown

**Issues Found:**
```
[space for documenting issues]
```

---

### Test Scenario 8.2: Logout Functionality
**Steps:**
1. Click "Sair" (Logout) in sidebar
2. Verify you're logged out
3. Verify you're redirected to login/home page
4. Log back in with your credentials
5. Verify you're back in the app

**Expected Results:**
- [  ] Logout works
- [  ] Session is cleared
- [  ] Redirect to auth page works
- [  ] Login is successful after logout
- [  ] Previous selections are gone

**Issues Found:**
```
[space for documenting issues]
```

---

## TEST STEP 9: Responsive Design

### Objective
Verify the app works on different screen sizes.

### Test Scenario 9.1: Desktop (1920x1080)
**Steps:**
1. Use desktop browser at full width
2. Complete a photo generation
3. Check that layout is properly arranged
4. Verify sidebar, main content, and right panel are visible
5. Check that buttons and inputs are properly sized
6. Verify text is readable

**Expected Results:**
- [  ] Layout is optimal for desktop
- [  ] All panels are visible
- [  ] No horizontal scrolling needed
- [  ] Buttons are clickable without issues
- [  ] Grid layouts display correctly

**Issues Found:**
```
[space for documenting issues]
```

---

### Test Scenario 9.2: Tablet (768px width)
**Steps:**
1. Use tablet browser or browser developer tools (device emulation)
2. Set width to 768px (iPad/tablet size)
3. Check that sidebar is still accessible (hamburger menu if needed)
4. Complete a photo generation
5. Verify all steps are accessible
6. Check that touch targets are large enough
7. Scroll through the flow and verify layout

**Expected Results:**
- [  ] Layout adapts to tablet size
- [  ] Navigation is still accessible
- [  ] No elements are cut off
- [  ] Touch targets are 44px+ (recommended)
- [  ] No overflow scrolling

**Issues Found:**
```
[space for documenting issues]
```

---

### Test Scenario 9.3: Mobile (375px width)
**Steps:**
1. Use mobile browser or browser developer tools
2. Set width to 375px (mobile size)
3. Check sidebar accessibility (may need to be collapsed)
4. Navigate through photo generation
5. Verify all elements are clickable
6. Check that text doesn't overlap
7. Test download functionality

**Expected Results:**
- [  ] Layout adapts to mobile
- [  ] Sidebar is accessible (menu icon)
- [  ] No horizontal scrolling
- [  ] Touch targets are large
- [  ] Text is readable (no tiny font)
- [  ] Forms are usable

**Issues Found:**
```
[space for documenting issues]
```

---

## TEST STEP 10: Performance and Loading

### Objective
Verify the app performs well and loads efficiently.

### Test Scenario 10.1: Page Load Time
**Steps:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Open browser DevTools Network tab
3. Load the app homepage
4. Measure time to first meaningful paint
5. Note total page load time
6. Check that all resources load (no 404s)
7. Compare to acceptable performance (should be <3 seconds)

**Performance Metrics:**
- Time to First Byte (TTFB): ________ms
- Time to First Paint: ________ms
- Time to Fully Loaded: ________ms
- Total Resources Loaded: ________
- Failed Resources (404): ________

**Expected Results:**
- [  ] Page loads in under 3 seconds
- [  ] No failed resource requests
- [  ] No console errors on load
- [  ] All assets are served

**Issues Found:**
```
[space for documenting issues]
```

---

### Test Scenario 10.2: Gallery Loading Performance
**Steps:**
1. Click "Minhas fotos"
2. Measure how long it takes to load
3. If photos exist, note the load time
4. Switch to "Meus vídeos"
5. Measure load time
6. Note if any lag or delays occur

**Expected Results:**
- [  ] Gallery loads in under 2 seconds
- [  ] No lag when switching galleries
- [  ] Images display progressively
- [  ] No freeze on filter changes

**Issues Found:**
```
[space for documenting issues]
```

---

## FINAL SIGN-OFF

### Overall Test Results Summary

**Total Test Scenarios Run:** _____  
**Scenarios Passed:** _____  
**Scenarios Failed:** _____  
**Pass Rate:** _____%  

---

### Critical Issues Found

If ANY of the following were found, the build should NOT proceed to production:

- [  ] Photo generation doesn't complete
- [  ] Generated images don't display
- [  ] Download functionality broken
- [  ] Variant creation broken
- [  ] Video generation broken
- [  ] Uncaught JavaScript errors in console
- [  ] Navigation broken
- [  ] User logout broken
- [  ] Form validation broken
- [  ] Gallery doesn't load

---

### Medium Issues Found

These should be fixed before production but don't block deployment:

- [  ] Slow loading times (>3 seconds)
- [  ] Minor visual glitches
- [  ] Non-critical console warnings
- [  ] Missing alt text on images
- [  ] Responsive design issues on edge cases

---

### Minor Issues Found

These can be fixed post-production:

- [  ] Typos or grammar issues
- [  ] Minor styling inconsistencies
- [  ] Accessibility improvements
- [  ] UX polish opportunities

---

### Issues Details

**Issue #1:**
- **Severity:** [Critical / Medium / Minor]
- **Description:** 
- **Steps to Reproduce:**
- **Expected Behavior:**
- **Actual Behavior:**
- **Screenshots/Console Output:**

---

**Issue #2:**
- **Severity:** [Critical / Medium / Minor]
- **Description:** 
- **Steps to Reproduce:**
- **Expected Behavior:**
- **Actual Behavior:**
- **Screenshots/Console Output:**

---

### Sign-Off

**Tester Name:** _______________  
**Date Completed:** _______________  
**Overall Status:** [ ] PASS [ ] FAIL [ ] PASS WITH MINOR ISSUES

**Comments:**
```
[Space for overall comments and recommendations]
```

**Recommendation for Production:**
- [ ] Ready for production deployment
- [ ] Ready after fixing critical issues
- [ ] NOT ready — requires additional fixes

**Sign-Off Signature/Email:** _______________  
**Date:** _______________  

---

## Reference: Background Upload Removal Summary

This regression testing checklist verifies that all functionality works correctly after removing the background upload feature. The removed feature included:

1. **Background upload UI components** — Removed from HTML/CSS
2. **Background upload API endpoints** — Removed from backend routes
3. **Background handling in photo generation** — Removed from generation logic
4. **Background storage** — Removed from file system handling
5. **Background selection UI** — Removed from generation steps
6. **Background database operations** — Removed from database queries
7. **Background asset management** — Removed from asset handling

All other functionality should remain fully operational:
- Photo generation with product image only
- Model, scenario, and pose selection
- Variant/pose creation
- Video generation (both movement and talking)
- Download functionality
- Gallery management
- Settings and account features
- User authentication

---

## Test Results File

After completing this checklist, save your responses to:
`docs/testing-results/2026-05-25-regression-results.md`

This will serve as the official record of testing completion before moving to Task 9 (Production Deployment).
