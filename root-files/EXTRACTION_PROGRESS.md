# Core Engine Extraction Progress

## Summary
**Total Lines to Extract**: ~14,600  
**Lines Extracted**: ~500 (~3%)  
**Status**: In Progress

---

## Phase 1: Foundation ✅ IN PROGRESS

### ✅ Constants.js
- **Source**: merged2.html lines 11028-11297
- **Lines**: ~200
- **Status**: COMPLETE
- **Contents**:
  - CHUNK_SIZE, chunk helpers
  - A1 notation, greek layers
  - aKey, parseAlt, formatLocalAddress
  - parseA1g, showToast
  - Formula active array IDs
  - Physics debug persistence

### ✅ CellMeta.js  
- **Source**: merged2.html lines 11064-11118
- **Lines**: ~80
- **Status**: COMPLETE
- **Contents**:
  - META_KEY_ALIASES
  - normalizeMetaKeys
  - getMetaAction
  - ensureOnSelectHooks

### ✅ CollisionHelpers.js
- **Source**: merged2.html lines 11198-11216
- **Lines**: ~30
- **Status**: COMPLETE
- **Contents**:
  - determineCollisionMode

### ✅ CameraHelpers.js
- **Source**: merged2.html lines 11218-11295
- **Lines**: ~100
- **Status**: COMPLETE
- **Contents**:
  - cameraBasisForSelection
  - resolveViewRelativeStep

### ✅ StoreCore.js
- **Source**: merged2.html lines 11123-11130
- **Lines**: ~30
- **Status**: COMPLETE
- **Contents**:
  - createStore function

### ✅ History.js
- **Source**: merged2.html lines 12202-12205
- **Lines**: ~15
- **Status**: COMPLETE
- **Contents**:
  - History object (dataPast, dataFuture, etc.)

---

## Phase 2: Core Engine ⏳ NEXT

### ⏳ Write.js (Transaction System)
- **Source**: merged2.html lines 12245-12459
- **Lines**: ~220
- **Status**: PENDING
- **Contents**:
  - Write.start(), Write.set(), Write.commit(), Write.rollback()
  - Transaction management
  - Emission tracking
  - Auto-save integration

### ⏳ Store.js (Main State)
- **Source**: merged2.html lines 11318-12195
- **Lines**: ~900
- **Status**: PENDING
- **Contents**:
  - Initial state definition
  - saveState action (~250 lines)
  - loadState action (~480 lines)
  - resetSave action
  - init action (~100 lines)

### ⏳ Actions.js
- **Source**: merged2.html lines 12507-13065
- **Lines**: ~550
- **Status**: PENDING
- **Contents**:
  - createArray
  - deleteArray
  - _setCellRaw
  - setCell
  - resizeArrayIfNeeded
  - offsetGlobalReferences
  - setSelection
  - setSelectionRange
  - moveSelection
  - togglePhysics/Grid/Axes
  - undoData/redoData

### ⏳ Formula Parser & Evaluator
- **Source**: merged2.html lines ~15000-17000
- **Lines**: ~2000
- **Status**: PENDING
- **Contents**:
  - FormulaLexer - Tokenization
  - FormulaParser - AST parsing
  - evaluator - Expression evaluation
  - executeAt - Formula execution
  - setFormula - Formula setting
  - recordDeps - Dependency tracking
  - AST to legacy conversion
  - Function registry

### ⏳ Chunk.js (Chunk System)
- **Source**: Scattered 11028-26000
- **Lines**: ~800
- **Status**: PENDING
- **Contents**:
  - Chunk class definition
  - ChunkManager
  - Chunk lifecycle
  - Chunk visibility culling

### ⏳ VoxelRenderer.js (Cell Rendering)
- **Source**: Scattered 16000-30000
- **Lines**: ~1500
- **Status**: PENDING
- **Contents**:
  - layerMeshes management
  - Cell mesh generation
  - Instanced rendering
  - Color and styling
  - Edge rendering
  - Ghost cells
  - renderLayer, renderArray

---

## Phase 3: Performance Systems (⏳ TODO)

### ⏳ LOD.js
- Lines: ~600
- Status: PENDING

### ⏳ ArrayTransform.js
- Lines: ~1000  
- Status: PENDING

---

## Phase 4: Interaction Systems (⏳ TODO)

### ⏳ Raycasting.js
- Lines: ~500
- Status: PENDING

### ⏳ SelectionSystem.js
- Lines: ~200
- Status: PENDING

---

## Phase 5: Visual/Physics Systems (⏳ TODO)

### ⏳ PostProcessing.js
- Lines: ~800
- Status: PENDING

### ⏳ Lighting.js
- Lines: ~400
- Status: PENDING

### ⏳ Physics.js
- Lines: ~800
- Status: PENDING

### ⏳ Connections.js
- Lines: ~400
- Status: PENDING

---

## Files Created So Far

1. ✅ `src/scripts/engine/Constants.js` (~200 lines)
2. ✅ `src/scripts/engine/CellMeta.js` (~80 lines)
3. ✅ `src/scripts/engine/CollisionHelpers.js` (~30 lines)
4. ✅ `src/scripts/engine/CameraHelpers.js` (~100 lines)
5. ✅ `src/scripts/engine/StoreCore.js` (~30 lines)
6. ✅ `src/scripts/engine/History.js` (~15 lines)

**Total Created**: 6 files, ~455 lines

---

## Next Steps

1. Extract Write.js (Transaction System) - 220 lines
2. Extract Store.js (Main State) - 900 lines
3. Extract Actions.js - 550 lines
4. Extract Formula Parser - 2000 lines
5. Extract Chunk System - 800 lines
6. Extract Voxel Renderer - 1500 lines
7. Continue through all remaining systems...

---

## Progress: 3% Complete

Need to extract ~14,145 more lines across ~15 more files.

