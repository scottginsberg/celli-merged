# Final Complete Extraction Manifest

## Purpose
This document maps EVERY system in merged2.html to its exact extraction target.

---

## ✅ PHASE 1: FOUNDATION (455 lines) - COMPLETE

| File | Lines | Source (merged2.html) | Status |
|------|-------|----------------------|---------|
| Constants.js | 200 | 11028-11297 | ✅ |
| CellMeta.js | 80 | 11064-11118 | ✅ |
| CollisionHelpers.js | 30 | 11198-11216 | ✅ |
| CameraHelpers.js | 100 | 11218-11295 | ✅ |
| StoreCore.js | 30 | 11123-11130 | ✅ |
| History.js | 15 | 12202-12205 | ✅ |
| Write.js | 220 | 12245-12459 | ✅ |

---

## ⏳ PHASE 2: STORE & ACTIONS (1500 lines) - IN PROGRESS

| File | Lines | Source | Status | Priority |
|------|-------|---------|--------|----------|
| Store.js | 900 | 11318-12196 | ⏳ NEXT | P0 |
| SelectionHelpers.js | 50 | 12461-12505 | 📝 | P0 |
| Actions.js | 550 | 12507-13065 | 📝 | P0 |

**Why P0**: Everything depends on Store and Actions existing. Can't extract anything else until these are done.

---

## 📝 PHASE 3: FUNCTION SYSTEM (3500 lines) - PENDING

| File | Lines | Source | Status |
|------|-------|---------|--------|
| FunctionHelpers.js | 300 | 13067-13365 | 📝 |
| FunctionRegistry.js | 200 | 13067-13600 | 📝 |
| Functions/3DTransform.js | 500 | 13366-14000 | 📝 |
| Functions/ArrayOps.js | 500 | 14000-14500 | 📝 |
| Functions/Utility.js | 500 | 14500-15000 | 📝 |
| FormulaLexer.js | 500 | 15000-15500 | 📝 |
| FormulaParser.js | 1000 | 15500-16500 | 📝 |
| FormulaEvaluator.js | 1000 | 16500-17500 | 📝 |
| FormulaDependencies.js | 500 | 17500-18000 | 📝 |

---

## 📝 PHASE 4: VOXEL ENGINE (2500 lines) - PENDING

| File | Lines | Source | Status |
|------|-------|---------|--------|
| Chunk.js | 1000 | 18500-19500 | 📝 |
| LayerRenderer.js | 1500 | 19500-21000 | 📝 |
| ValueSprites.js | 500 | 21000-21500 | 📝 |

---

## 📝 PHASE 5: 3D SCENE (2000 lines) - PENDING

| File | Lines | Source | Status |
|------|-------|---------|--------|
| ArrayTransform.js | 1000 | 21500-22500 | 📝 |
| CameraManager.js | 500 | 22500-23000 | 📝 |
| SceneManager.js | 1000 | 23000-24000 | 📝 |

---

## 📝 PHASE 6: ANIMATION (1500 lines) - PENDING

| File | Lines | Source | Status |
|------|-------|---------|--------|
| TimedState.js | 1000 | 24000-25000 | 📝 |
| AnimationEngine.js | 500 | 25000-25500 | 📝 |

---

## 📝 PHASE 7: PERFORMANCE (1000 lines) - PENDING

| File | Lines | Source | Status |
|------|-------|---------|--------|
| LODSystem.js | 500 | 25500-26000 | 📝 |
| ChunkManager.js | 500 | 26000-26500 | 📝 |

---

## 📝 PHASE 8: INTERACTION (2000 lines) - PENDING

| File | Lines | Source | Status |
|------|-------|---------|--------|
| Raycasting.js | 1000 | 27000-28000 | 📝 |
| PhysicsManager.js | 1000 | 28000-29000 | 📝 |

---

## 📝 PHASE 9: VISUALS (1200 lines) - PENDING

| File | Lines | Source | Status |
|------|-------|---------|--------|
| PostProcessing.js | 800 | 19000-19800 | 📝 |
| Lighting.js | 400 | 25090-25500 | 📝 |

---

## 📝 PHASE 10: UTILITIES (400 lines) - PENDING

| File | Lines | Source | Status |
|------|-------|---------|--------|
| Connections.js | 400 | 30018-30400 | 📝 |

---

## Summary

- ✅ **Complete**: 675 lines (4.6%)
- ⏳ **In Progress**: 900 lines (Store.js)
- 📝 **Pending**: 13,025 lines (89%)

**Total**: 14,600 lines

---

## Next Action
Extract Store.js (900 lines) from merged2.html:11318-12196

