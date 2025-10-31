# 🚨 IMPORTANT: Standalone Templates - NOT Used by Main App

## ⚠️ Critical Information for AI Agents and Developers

**These HTML files are STANDALONE TEMPLATES that are NOT imported or used by the main application (`index.html`).**

If you need to modify the intro sequence behavior, **DO NOT EDIT FILES IN THIS FOLDER**.

---

## What Are These Files?

These are complete, self-contained HTML files that can be:
- Opened directly in a browser
- Linked to from the main app as separate pages
- Used as reference implementations
- Tested independently without the main app

## File Status

| File | Status | Used By Main App? |
|------|--------|------------------|
| `intro-faithful.html` | ❌ **NOT USED** | No - Standalone only |
| `fullhand-complete.html` | ❌ **NOT USED** | No - Standalone only |
| `cellireal-complete.html` | ❌ **NOT USED** | No - Standalone only |
| `theos-sequence.html` | ❌ **NOT USED** | No - Standalone only |
| Other HTML files | ❌ **NOT USED** | No - Standalone only |

---

## Where to Edit Instead

### For Intro Scene Changes
**Edit:** `src/scripts/scenes/IntroSceneComplete.js`

This is the actual scene file used by `index.html`.

### For Other Scenes
All componentized scenes used by the main app are in:
```
src/scripts/scenes/
├── IntroSceneComplete.js  ← Intro sequence
├── VisiCellScene.js       ← Spreadsheet scene
├── CityScene.js           ← City scene
├── CelliRealScene-Full.js ← Voxel world
├── FullhandScene.js       ← Execution environment
├── TheosSequenceScene.js  ← Coordinate lattice
└── LeaveScene.js          ← House of Leaves
```

### How the Main App Works

The main app (`index.html`) imports these scenes as ES6 modules:

```javascript
// From src/scripts/app-enhanced.js
import { IntroSceneComplete } from './scenes/IntroSceneComplete.js';
import { VisiCellScene } from './scenes/VisiCellScene.js';
// etc...
```

The scenes are then registered with the SceneManager and loaded dynamically.

---

## Common Mistakes

### ❌ WRONG: Editing Template Files
```
❌ templates/componentized/intro-faithful.html  (Not used!)
❌ templates/componentized/fullhand-complete.html  (Not used!)
```

### ✅ CORRECT: Editing Scene Modules
```
✅ src/scripts/scenes/IntroSceneComplete.js
✅ src/scripts/scenes/FullhandScene.js
```

---

## Why Do These Templates Exist?

1. **Development History**: These were the original implementations before modularization
2. **Standalone Testing**: Can test features independently
3. **Reference**: Can compare implementations
4. **Alternative Entry Points**: Some users may prefer standalone versions

---

## Architecture Overview

```
Main App Flow:
index.html
  └─> src/scripts/main.js
       └─> src/scripts/app-enhanced.js
            └─> src/scripts/scenes/*.js (THESE ARE USED)

Template Flow (Alternative):
User navigates directly to:
  └─> templates/componentized/*.html (Self-contained)
```

---

## Quick Reference

**Need to change intro behavior?**
→ Edit `src/scripts/scenes/IntroSceneComplete.js`

**Need to change VisiCell behavior?**
→ Edit `src/scripts/scenes/VisiCellScene.js`

**Testing changes?**
→ Open `index.html` in browser (or run dev server)
→ Changes to `src/scripts/scenes/*.js` will be reflected

**Want to test standalone template?**
→ Open `templates/componentized/*.html` directly
→ But remember: changes here won't affect the main app!

---

## Last Updated
October 23, 2025

## Questions?
Check `ARCHITECTURE.md` in the project root for more details.
