# Core Engine Systems - Extraction Map

## Located Systems in merged2.html

### 1. 🏪 Store/State Management System
**Location**: Lines 11120-11900+  
**Size**: ~800 lines  
**Key Components**:
- `createStore` function (line 11123)
- Initial state setup (line 11318)
- `saveState` action (line 11377)
- `loadState` action (line 11602)
- State serialization/deserialization
- LocalStorage persistence

### 2. 🔢 Formula Parser & Evaluator
**Location**: Lines 15000-17000+ (scattered)  
**Size**: ~2000 lines  
**Key Components**:
- `FormulaLexer` - Tokenization
- `FormulaParser` - AST parsing
- `evaluator` - Expression evaluation
- `executeAt` - Formula execution (line 15117)
- `setFormula` - Formula setting (line 14880)
- `recordDeps` - Dependency tracking
- AST to legacy conversion

### 3. 🧊 Voxel/Cell Rendering Engine
**Location**: Scattered throughout 11000-30000  
**Size**: ~1500 lines  
**Key Components**:
- `layerMeshes` - Mesh management
- Cell mesh generation
- Instanced rendering
- Color and styling
- Edge rendering
- Ghost cells

### 4. 📦 Array Management System
**Location**: Lines 14000-16000  
**Size**: ~1000 lines  
**Key Components**:
- `setArrayOffset` - Positioning
- `rotateArrayAround` - 3D rotation (line 30119)
- `worldPos` / `cellWorldPos` - Position calculation
- Array creation/destruction
- Frame management (`_frame`)

### 5. 🗂️ Chunking System
**Location**: Lines 11028-11036, scattered ~25000-26000  
**Size**: ~800 lines  
**Key Components**:
- `CHUNK_SIZE` constant (line 11028)
- `chunkOf` function (line 11034)
- `keyChunk` function (line 11035)
- `ChunkManager` - Chunk lifecycle
- Chunk visibility culling
- Chunk mesh management

### 6. 📊 LOD (Level of Detail) System
**Location**: Lines 25000-26000  
**Size**: ~600 lines  
**Key Components**:
- `meshLOD1` - High detail
- `meshLOD2` - Lower detail
- LOD switching logic
- Distance-based LOD
- Performance optimization

### 7. 🎬 3D Transform Animation System
**Location**: Lines 25000-26500  
**Size**: ~1000 lines  
**Key Components**:
- `addTimedTranslation` (line 25095)
- `TRANSLATE_ARRAY` - Array translation
- `ROTATE_ARRAY` - Array rotation
- `SCALE_ARRAY` - Array scaling
- Timed animation engine
- Preview mode with green overlay
- `ensureTimedState` (line 24985)
- `configTimed` (line 25000)

### 8. 🎨 Post-Processing Pipeline
**Location**: Lines 19000-21000  
**Size**: ~800 lines  
**Key Components**:
- DOF (Depth of Field) shader
- Bloom pass
- God rays shader (line 19950)
- Lighthouse beams shader
- Vignette
- Film grain
- Fog layers
- Composite shader (line 20016)

### 9. 🔦 Lighting System
**Location**: Lines 25090-25095  
**Size**: ~400 lines  
**Key Components**:
- `upsertCellLight` (line 25091)
- `removeCellLight` (line 25092)
- `refreshLightsForArray` (line 25093)
- Dynamic light management
- Light intensity/color

### 10. 🎯 Raycasting/Picking System
**Location**: Scattered 27000-29000  
**Size**: ~500 lines  
**Key Components**:
- Cell picking with mouse
- 3D raycast
- Hit detection
- Hover highlighting
- Click handling

### 11. 🏃 Physics/Movement System
**Location**: Lines 29000-31000  
**Size**: ~800 lines  
**Key Components**:
- RAPIER physics integration (line 11000)
- Character movement
- Collision detection
- Bounce physics (line 30000)
- Jump mechanics
- Walking on arrays
- `determineCollisionMode` (line 11198)

### 12. 🔗 Connection/Constraint System
**Location**: Lines 30018-30090  
**Size**: ~400 lines  
**Key Components**:
- `addConnection` (line 30018)
- `removeConnection`
- Platform/zipline/grind modes
- Dimension labels
- Connection rendering

### 13. 📝 Cell Metadata System
**Location**: Scattered 11060-11120  
**Size**: ~300 lines  
**Key Components**:
- `META_KEY_ALIASES` (line 11064)
- `normalizeMetaKeys` (line 11078)
- `getMetaAction` (line 11093)
- `cell.meta` storage
- Action formulas (on_enter, on_land, etc.)

### 14. 📊 Write Transaction System
**Location**: Lines 15000+  
**Size**: ~400 lines  
**Key Components**:
- `Write.set()` - Transactional writes
- Transaction batching
- Rollback support
- Multi-cell updates

---

## Additional Critical Systems

### 15. 🎮 Actions System
**Location**: Throughout Store definition  
**Key Components**:
- `Actions.setCell`
- `Actions.resizeArrayIfNeeded` (line 15126)
- State mutation actions

### 16. 🔄 Dependency Tracking
**Location**: Lines 15110+  
**Key Components**:
- `recordDeps` - Record dependencies
- `depsByAnchor` - Dependency graph
- `anchorsByDep` - Reverse lookup
- Automatic recalculation

### 17. 🎯 Selection System
**Location**: Throughout Store  
**Key Components**:
- Selection state
- Focus/anchor/range
- Selection change handling

### 18. 📐 Coordinate Systems
**Location**: Lines 11028-11062  
**Key Components**:
- `A1` - Column names (line 11033)
- `greek` - Layer names (line 11032)
- `aKey` - Anchor keys (line 11036)
- `parseA1g` - Address parsing (line 11061)
- `formatLocalAddress` (line 11059)
- Absolute refs `@[x,y,z,id]` (line 11043)

### 19. 🌊 Ocean/Water System
**Location**: Lines 20000-21000  
**Key Components**:
- Ocean rendering
- Water shader
- Lighthouse beams
- Ocean state management

### 20. 📹 Camera System
**Location**: Lines 11218-11295  
**Key Components**:
- `cameraBasisForSelection` (line 11218)
- `resolveViewRelativeStep` (line 11243)
- Camera controls
- View-relative navigation

---

## Extraction Priority (Revised)

### Phase 1: Foundation (CRITICAL)
1. ✅ Store/State Management (~800 lines)
2. ✅ Coordinate Systems (~200 lines)
3. ✅ Cell Metadata System (~300 lines)
4. ✅ Helper Functions (~200 lines)

### Phase 2: Core Engine (CRITICAL)
5. ⏳ Formula Parser & Evaluator (~2000 lines)
6. ⏳ Voxel/Cell Rendering (~1500 lines)
7. ⏳ Array Management (~1000 lines)
8. ⏳ Write Transaction System (~400 lines)

### Phase 3: Performance (HIGH)
9. ⏳ Chunking System (~800 lines)
10. ⏳ LOD System (~600 lines)
11. ⏳ Dependency Tracking (~300 lines)

### Phase 4: Interaction (HIGH)
12. ⏳ Raycasting/Picking (~500 lines)
13. ⏳ Selection System (~200 lines)
14. ⏳ 3D Transform Animation (~1000 lines)

### Phase 5: Visual/Physics (MEDIUM)
15. ⏳ Post-Processing (~800 lines)
16. ⏳ Lighting System (~400 lines)
17. ⏳ Connection System (~400 lines)
18. ⏳ Physics/Movement (~800 lines)

### Phase 6: Advanced (LOW)
19. ⏳ Ocean/Water System (~500 lines)
20. ⏳ Camera System (~300 lines)

---

## Total Lines to Extract

**Core Engine**: ~8,000 lines  
**Performance Systems**: ~1,700 lines  
**Interaction Systems**: ~1,700 lines  
**Visual/Physics**: ~2,400 lines  
**Advanced**: ~800 lines  

**TOTAL**: ~14,600 lines of ENGINE code

---

## Extraction Status

- ❌ Not started: 20 systems
- ⏳ In progress: 0 systems
- ✅ Complete: 0 systems

**Current**: 0% of core engine extracted

---

This is the REAL work. The previous "refactor" was just the presentation layer.


