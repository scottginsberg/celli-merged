# Extraction Strategy - Remaining Work

## ✅ Completed: ~675 lines (4.6%)

1. Constants.js - 200 lines ✅
2. CellMeta.js - 80 lines ✅
3. CollisionHelpers.js - 30 lines ✅
4. CameraHelpers.js - 100 lines ✅
5. StoreCore.js - 30 lines ✅
6. History.js - 15 lines ✅
7. Write.js - 220 lines ✅

---

## 🔄 Current Batch: Store & Actions (~1450 lines)

Given the massive size, I'll create a COMPLETE extraction plan that identifies EVERY system location in merged2.html precisely, then extract them systematically.

### Critical Decision
The Store initialization (lines 11318-12195, ~900 lines) and Actions (lines 12507-13065, ~550 lines) are tightly coupled with many global dependencies. These need to be extracted AS IS with minimal refactoring to preserve exact behavior.

Strategy:
1. Extract Store.js with full init state + all actions (saveState, loadState, init) - Keep as monolithic module
2. Extract Actions.js separately
3. Extract helper functions they depend on

---

## 📍 Precise System Locations in merged2.html

### Phase A: Core State & Transactions (~1500 lines)
- ✅ Write.js: 12245-12459 (~220 lines) - DONE
- ⏳ Store.js: 11318-12195 (~900 lines) - NEXT
- ⏳ Actions.js: 12507-13065 (~550 lines)
- ⏳ Selection helpers: 12461-12505 (~50 lines)

### Phase B: Formula Engine (~3000 lines)
- Function helpers: 13067-13365 (~300 lines)
- Function registry setup: 13067-13600 (~500 lines)
- Formula Lexer: ~15000-15500 (~500 lines)
- Formula Parser: ~15500-16500 (~1000 lines)
- Formula Evaluator: ~16500-17500 (~1000 lines)
- Formula Execution: ~14800-15200 (~400 lines)
- Dependency Tracking: ~17500-18000 (~500 lines)

### Phase C: Voxel Rendering Engine (~2500 lines)
- Chunk class: ~18500-19500 (~1000 lines)
- Layer rendering: ~19500-21000 (~1500 lines)
- Value sprites: ~21000-21500 (~500 lines)

### Phase D: Scene & 3D Systems (~2000 lines)
- Array transform: ~21500-22500 (~1000 lines)
- Camera system: ~22500-23000 (~500 lines)
- Scene manager: ~23000-24000 (~1000 lines)

### Phase E: Timed Animation (~1500 lines)
- Timed state: ~24000-25000 (~1000 lines)
- Animation engine: ~25000-25500 (~500 lines)

### Phase F: LOD & Chunking (~1000 lines)
- LOD system: ~25500-26000 (~500 lines)
- ChunkManager: ~26000-26500 (~500 lines)

### Phase G: Physics (~1000 lines)
- RAPIER integration: ~11000-11028 (~30 lines)
- Physics mode: ~28000-29000 (~1000 lines)

### Phase H: Post-Processing (~800 lines)
- Shader pipeline: ~19000-19800 (~800 lines)

### Phase I: Lighting (~400 lines)
- Light management: ~25090-25500 (~400 lines)

### Phase J: Connections (~400 lines)
- Connection system: ~30018-30400 (~400 lines)

### Phase K: UI Integration (~1000 lines)
- Raycasting/picking: ~27000-28000 (~1000 lines)

---

## Extraction Order (Dependency-First)

1. ✅ Foundation helpers (Constants, CellMeta, etc.) - DONE
2. ✅ Write transaction system - DONE
3. ⏳ Store initialization - NEXT (900 lines)
4. ⏳ Actions system (550 lines)
5. ⏳ Function registry & helpers (800 lines)
6. ⏳ Formula Parser (2500 lines)
7. ⏳ Chunk & Voxel Rendering (2500 lines)
8. ⏳ Scene & Transform (2000 lines)
9. ⏳ Timed Animation (1500 lines)
10. ⏳ LOD & ChunkManager (1000 lines)
11. ⏳ Physics (1000 lines)
12. ⏳ Post-Processing (800 lines)
13. ⏳ Lighting (400 lines)
14. ⏳ Connections (400 lines)
15. ⏳ Raycasting (1000 lines)

Total: ~14,600 lines

---

## Current Status
**Extracted**: 675 lines (4.6%)  
**Remaining**: ~13,925 lines (95.4%)  
**Next**: Store.js (900 lines)

