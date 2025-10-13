# Function System Extraction Plan

## Overview
The Formula System contains **138 registered functions** across ~10 categories.

Total estimated size: **6,000-8,000 lines** (averaging 43-58 lines per function)

---

## Category Breakdown

### 1. 3D Transforms (10 functions, ~800 lines)
**File**: `functions/3DTransforms.js`
- 3D_TRANSLATE ⭐
- 3D_ROTATE ⭐
- TRANSLATE_ARRAY
- ROTATE_ARRAY
- SCALE
- GET_ARRAY_POS
- SET_ARRAY_POS
- PIVOT
- VECTOR_TO
- EMBED

### 2. Array Operations (15 functions, ~1,000 lines)
**File**: `functions/ArrayOps.js`
- CREATE ⭐
- ARRAY ⭐
- STORE_ARRAY
- DOCK
- SHIFT
- ROTATE
- OFFSET
- TRANSPOSE
- GET
- SET
- NAME
- COPY
- UNPACK
- ENTER
- HUSK

### 3. Lookup/Search/Navigation (10 functions, ~600 lines)
**File**: `functions/Lookup.js`
- INDEX
- MATCH
- XLOOKUP
- SEARCH
- ADDRESS
- SELF
- ALT_ADDRESS
- IS_SELECTED
- GET_PLAYER_FOCUS
- IS_FOCUS_ARRAY

### 4. Logic/Math (15 functions, ~500 lines)
**File**: `functions/Logic.js`
- IF ⭐
- ADD
- MUL
- AND
- OR
- NOT
- EQ
- NEQ
- GT
- GTE
- LT
- LTE
- CLAMP
- REVERSE
- ISNUMBER

### 5. Meta/Interaction (20 functions, ~1,200 lines)
**File**: `functions/Meta.js`
- PRIORITY
- ONCLICK ⭐
- ONCLICK_WRAPPER
- ON_HOLD
- ON_TOUCH
- ON_LAND
- ON_EVENT
- FIRE_EVENT
- ON_SELECT
- BOUNCE
- DISPLAY_AS
- TOAST
- COMBINE
- COLOR
- GETCOLOR
- OCCLUDE
- CA
- CREATE_META
- CANT_TARGET
- OVERLAP

### 6. Parameters/Functions (8 functions, ~400 lines)
**File**: `functions/Parameters.js`
- PARAMETERS
- FUNCTIONS
- LOCK
- FORMULIZE
- FORMULA_TEXT
- VALUE_AT
- DETECT
- GET_NEXT_ID

### 7. Animation/Timed (10 functions, ~800 lines)
**File**: `functions/Animation.js`
- TIMED_TRANSLATION ⭐
- 3D_TIMED_TRANSLATION
- PREVIEW
- DELAY
- REPEAT
- EXEC_AT
- DO
- SEQ
- PIPE
- THEN

### 8. UI/View (10 functions, ~500 lines)
**File**: `functions/UI.js`
- VIEW_MODE
- UI_CONTROL
- MINIMIZE
- AXES
- FOCUS_SET
- SET_SELECTED
- SET_SELECT
- UI_UNMOUNT
- FUNCTION_UI
- CAMERA_LOCK

### 9. Physics/Movement (8 functions, ~600 lines)
**File**: `functions/Physics.js`
- CELL_PHYS
- CELLI_PHYS
- PHYS_CAMERA
- PLATFORMER_PHYSICS
- 2D_PLATFORMER
- 2d_platformer
- PLATFORMER_SPAWN_SCREEN
- FISH

### 10. Game Logic (10 functions, ~800 lines)
**File**: `functions/GameLogic.js`
- SOKOBAN
- SOKOBAN2
- SOKO_STEP
- SOKO_STEP2
- SSR
- SSR_STEP
- GOAL
- ONWIN
- INVENTORY
- ADJACENT

### 11. Scene/State (10 functions, ~500 lines)
**File**: `functions/Scene.js`
- GET_GLOBAL
- SET_GLOBAL
- GROUP
- LIMIT
- ALL
- CONNECT
- SANDBOX
- DELETE
- DEL
- REMOVE

### 12. Advanced/Misc (12 functions, ~500 lines)
**File**: `functions/Advanced.js`
- GALAXY
- OVERLAP
- EVALUATE
- SPLIT
- LIGHT
- CHIME
- DEP_VIS
- STARTINTROEXPERIENCE
- GET_NEXT_ID

---

## Extraction Strategy

### Phase 1: High-Priority Functions (20 functions, ~1,500 lines) ⭐
Extract the most critical functions first:
- 3D_TRANSLATE, 3D_ROTATE (3D transforms)
- CREATE, ARRAY (array creation)
- ONCLICK, ON_EVENT (interaction)
- IF, EQ, AND, OR (logic)
- TIMED_TRANSLATION (animation)
- ADDRESS, SELF (navigation)
- COLOR, PARAMETERS (meta)
- GET_GLOBAL, SET_GLOBAL (state)

### Phase 2: Common Operations (40 functions, ~2,000 lines)
Mid-priority functions used frequently:
- Math operations (ADD, MUL, etc.)
- Array operations (SHIFT, ROTATE, TRANSPOSE, etc.)
- Lookup functions (INDEX, MATCH, XLOOKUP, etc.)
- UI functions (FOCUS_SET, VIEW_MODE, etc.)

### Phase 3: Specialized Systems (40 functions, ~2,000 lines)
Domain-specific functions:
- Physics system (CELL_PHYS, PLATFORMER_PHYSICS, etc.)
- Game logic (SOKOBAN, SSR, INVENTORY, etc.)
- Animation system (DELAY, REPEAT, SEQ, etc.)

### Phase 4: Advanced/Edge Cases (38 functions, ~1,500 lines)
Less common or legacy functions:
- Advanced graphics (GALAXY, LIGHT, etc.)
- Debug/Dev tools (DEP_VIS, EVALUATE, etc.)
- Legacy aliases and wrappers

---

## Progress Tracking

| Category | Functions | Est. Lines | Status |
|----------|-----------|------------|--------|
| 3D Transforms | 10 | 800 | ⏳ Pending |
| Array Ops | 15 | 1,000 | ⏳ Pending |
| Lookup | 10 | 600 | ⏳ Pending |
| Logic/Math | 15 | 500 | ⏳ Pending |
| Meta/Interaction | 20 | 1,200 | ⏳ Pending |
| Parameters | 8 | 400 | ⏳ Pending |
| Animation | 10 | 800 | ⏳ Pending |
| UI/View | 10 | 500 | ⏳ Pending |
| Physics | 8 | 600 | ⏳ Pending |
| Game Logic | 10 | 800 | ⏳ Pending |
| Scene/State | 10 | 500 | ⏳ Pending |
| Advanced | 12 | 500 | ⏳ Pending |
| **TOTAL** | **138** | **~8,000** | **0%** |

---

## Dependencies
- FunctionHelpers.js ✅ (296 lines) - Already extracted
- Write.js ✅ (220 lines) - Already extracted
- Store.js ✅ (880 lines) - Already extracted
- Actions.js ✅ (558 lines) - Already extracted
- Formula.js (parser/evaluator) - Not yet extracted
- Scene.js (3D rendering) - Not yet extracted

---

## Notes
- Functions use runtime `window.Formula`, `window.Scene`, `window.Store`, `window.Actions` to avoid circular imports
- Each function is registered via `tag(name, tags, impl)`
- Functions receive `(anchor, arr, ast)` parameters
- Most functions mutate state via `Write` transactions
- Functions can be pure (`PURE` tag) or have side effects (`ACTION`, `META`, `SCENE` tags)

---

**Next Step**: Start Phase 1 extraction (20 critical functions)

