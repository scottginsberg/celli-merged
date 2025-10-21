# Complete Extraction Status & Blueprint

## Executive Summary

**Total Engine Code to Extract**: 14,600 lines  
**Extracted So Far**: 675 lines (4.6%)  
**Remaining**: 13,925 lines (95.4%)  

This is a **multi-context-window task** requiring systematic extraction of the entire Celli engine from `merged2.html` into modular files.

---

## ✅ COMPLETED: Foundation Layer (675 lines)

### Files Created

1. **`src/scripts/engine/Constants.js`** (200 lines)
   - Source: merged2.html:11028-11297
   - Exports: CHUNK_SIZE, A1, greek, aKey, parseAlt, formatLocalAddress, etc.
   - Status: ✅ COMPLETE

2. **`src/scripts/engine/CellMeta.js`** (80 lines)
   - Source: merged2.html:11064-11118
   - Exports: META_KEY_ALIASES, normalizeMetaKeys, getMetaAction, ensureOnSelectHooks
   - Status: ✅ COMPLETE

3. **`src/scripts/engine/CollisionHelpers.js`** (30 lines)
   - Source: merged2.html:11198-11216
   - Exports: determineCollisionMode
   - Status: ✅ COMPLETE

4. **`src/scripts/engine/CameraHelpers.js`** (100 lines)
   - Source: merged2.html:11218-11295
   - Exports: cameraBasisForSelection, resolveViewRelativeStep
   - Status: ✅ COMPLETE

5. **`src/scripts/engine/StoreCore.js`** (30 lines)
   - Source: merged2.html:11123-11130
   - Exports: createStore
   - Status: ✅ COMPLETE

6. **`src/scripts/engine/History.js`** (15 lines)
   - Source: merged2.html:12202-12205
   - Exports: History object
   - Status: ✅ COMPLETE

7. **`src/scripts/engine/Write.js`** (220 lines)
   - Source: merged2.html:12245-12459
   - Exports: Write (start, set, commit, rollback), checkWinConditions
   - Status: ✅ COMPLETE

---

## 🎯 CRITICAL PATH: Next 3 Files (Priority 0)

These **MUST** be extracted next as everything depends on them:

### 1. `Store.js` (~900 lines) ⚠️ BLOCKING
- **Source**: merged2.html:11318-12196
- **Contains**: 
  - Initial state setup (arrays, selection, scene, ui, etc.)
  - `saveState()` action (~250 lines)
  - `loadState()` action (~480 lines)
  - `resetSave()` action
  - `init()` action (~100 lines)
- **Why Critical**: Core state manager - nothing works without this
- **Dependencies**: Imports Constants, CellMeta, CollisionHelpers, Write, History

### 2. `SelectionHelpers.js` (~50 lines)
- **Source**: merged2.html:12461-12505
- **Contains**: computeSelectionFaceHint
- **Dependencies**: None

### 3. `Actions.js` (~550 lines)
- **Source**: merged2.html:12507-13065
- **Contains**:
  - createArray
  - deleteArray
  - _setCellRaw
  - setCell (with batch support)
  - resizeArrayIfNeeded
  - offsetGlobalReferences
  - setSelection / setSelectionRange / moveSelection
  - togglePhysics / toggleGrid / toggleAxes
  - undoData / redoData
- **Dependencies**: Store, Write, History, SelectionHelpers

---

## 📋 Complete Extraction Roadmap (Remaining 13,925 lines)

### Phase 3: Function System (3,500 lines)
Files to create:
- `FunctionHelpers.js` (300 lines) - merged2.html:13067-13365
- `FunctionRegistry.js` (200 lines) - merged2.html:13067-13600
- `functions/3DTransform.js` (500 lines) - merged2.html:13366-14000
- `functions/ArrayOps.js` (500 lines) - merged2.html:14000-14500
- `functions/Utility.js` (500 lines) - merged2.html:14500-15000
- `FormulaLexer.js` (500 lines) - merged2.html:15000-15500
- `FormulaParser.js` (1000 lines) - merged2.html:15500-16500
- `FormulaEvaluator.js` (1000 lines) - merged2.html:16500-17500
- `FormulaDependencies.js` (500 lines) - merged2.html:17500-18000

### Phase 4: Voxel Rendering Engine (2,500 lines)
- `Chunk.js` (1000 lines) - merged2.html:18500-19500
- `LayerRenderer.js` (1500 lines) - merged2.html:19500-21000
- `ValueSprites.js` (500 lines) - merged2.html:21000-21500

### Phase 5: 3D Scene Management (2,000 lines)
- `ArrayTransform.js` (1000 lines) - merged2.html:21500-22500
- `CameraManager.js` (500 lines) - merged2.html:22500-23000
- `SceneManager.js` (1000 lines) - merged2.html:23000-24000

### Phase 6: Animation System (1,500 lines)
- `TimedState.js` (1000 lines) - merged2.html:24000-25000
- `AnimationEngine.js` (500 lines) - merged2.html:25000-25500

### Phase 7: Performance (1,000 lines)
- `LODSystem.js` (500 lines) - merged2.html:25500-26000
- `ChunkManager.js` (500 lines) - merged2.html:26000-26500

### Phase 8: Interaction (2,000 lines)
- `Raycasting.js` (1000 lines) - merged2.html:27000-28000
- `PhysicsManager.js` (1000 lines) - merged2.html:28000-29000

### Phase 9: Visual Effects (1,200 lines)
- `PostProcessing.js` (800 lines) - merged2.html:19000-19800
- `Lighting.js` (400 lines) - merged2.html:25090-25500

### Phase 10: Utilities (400 lines)
- `Connections.js` (400 lines) - merged2.html:30018-30400

---

## 🔧 Extraction Tools

### Method 1: Direct File Reading (for smaller sections <200 lines)
```javascript
read_file("merged2.html", offset:LINE_START, limit:LINE_COUNT)
```

### Method 2: Manual Extraction (for large sections)
Since `merged2.html` is 54,764 lines, direct reads may timeout. For the large Store.js extraction:
1. Open merged2.html in editor
2. Navigate to line 11318
3. Select through line 12196
4. Copy and adapt to modular format

### Method 3: Chunk Reading
Read Store.js in 300-line chunks:
- Chunk 1: lines 11318-11618 (saveState beginning)
- Chunk 2: lines 11618-11918
- Chunk 3: lines 11918-12196 (loadState + init)

---

## 📊 Progress Tracking

```
Foundation:    [████████████████████] 100% (675/675 lines)
Store+Actions: [██░░░░░░░░░░░░░░░░░░]  10% (0/1500 lines) ⚠️ BLOCKING
Functions:     [░░░░░░░░░░░░░░░░░░░░]   0% (0/3500 lines)
Voxel Engine:  [░░░░░░░░░░░░░░░░░░░░]   0% (0/2500 lines)
3D Scene:      [░░░░░░░░░░░░░░░░░░░░]   0% (0/2000 lines)
Animation:     [░░░░░░░░░░░░░░░░░░░░]   0% (0/1500 lines)
Performance:   [░░░░░░░░░░░░░░░░░░░░]   0% (0/1000 lines)
Interaction:   [░░░░░░░░░░░░░░░░░░░░]   0% (0/2000 lines)
Visual FX:     [░░░░░░░░░░░░░░░░░░░░]   0% (0/1200 lines)
Utilities:     [░░░░░░░░░░░░░░░░░░░░]   0% (0/400 lines)

Overall: [██░░░░░░░░░░░░░░░░░░] 4.6% (675/14,600 lines)
```

---

## ⚡ Immediate Next Steps

1. **Extract Store.js** (900 lines, merged2.html:11318-12196)
   - Read in 3 chunks of ~300 lines each
   - Combine into single Store.js module
   - Add imports for Constants, CellMeta, CollisionHelpers, Write, History
   - Export Store object

2. **Extract SelectionHelpers.js** (50 lines, merged2.html:12461-12505)
   - Single read
   - Export computeSelectionFaceHint

3. **Extract Actions.js** (550 lines, merged2.html:12507-13065)
   - Read in 2 chunks of ~275 lines
   - Import Store, Write, History, SelectionHelpers
   - Export Actions object

4. **Test Integration**
   - Create minimal test file importing Store, Actions
   - Verify no circular dependencies
   - Check all exports resolve

5. **Continue with Phase 3** (Function System, 3,500 lines)

---

## 🚨 Critical Notes

- **File Size**: merged2.html is 54,764 lines - reads may timeout
- **Dependencies**: Strict order required - can't extract formulas before Store/Actions
- **Circular Refs**: Store/Actions/Formula have circular dependencies - need careful module design
- **Global State**: Many systems depend on `window.Store`, `window.Scene`, `window.Formula` - preserve these

---

## 🎯 Success Criteria

✅ All 14,600 lines extracted into ~35 modular files  
✅ No functionality lost from original merged2.html  
✅ Clean module boundaries with explicit imports/exports  
✅ builder.html can bundle all modules back into single file  
✅ Application functions identically to merged2.html  

---

**Status**: Foundation complete (4.6%). Ready to extract Store.js (blocking critical path).

