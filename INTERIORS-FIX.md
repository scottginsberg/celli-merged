# Interiors System Fix

## Problem
The interiors system wasn't building rooms when pressing 'I'. The issue was that the modular version in `js/interiors-main.js` had only placeholder/stub implementations of key functions.

## Root Cause
When the interiors system was modularized:
1. `generateInteriorRoom` was replaced with a stub that only created a floor and ceiling
2. `setupAssetLibrary` and `setupRandomizerButton` were just console.log stubs
3. The real implementations existed in `scale-ultra.html` but weren't connected to the module

## Solution

### 1. Function Injection Pattern
Modified `js/interiors-main.js` to accept the real implementation functions as dependencies:

```javascript
// In interiors-main.js
let generateInteriorRoomImpl;
let setupAssetLibraryImpl;
let setupRandomizerButtonImpl;

export function initInteriors(deps) {
  // ... existing deps ...
  generateInteriorRoomImpl = deps.generateInteriorRoom;
  setupAssetLibraryImpl = deps.setupAssetLibrary;
  setupRandomizerButtonImpl = deps.setupRandomizerButton;
}

// Wrapper to call the real function
export function generateInteriorRoom(roomType, useRandom = false) {
  if (generateInteriorRoomImpl) {
    return generateInteriorRoomImpl(roomType, useRandom);
  }
}
```

### 2. Updated Initialization
Modified `scale-ultra.html` to pass the real functions to `initInteriors`:

```javascript
initInteriors({
  THREE,
  scene,
  worldRoot,
  playerBody,
  camera,
  raycaster,
  generateInteriorRoom,  // Real implementation
  setupAssetLibrary,     // Real implementation
  setupRandomizerButton  // Real implementation
});
```

### 3. Shared State Variables
Removed duplicate state variable declarations in `scale-ultra.html` and used the exported versions from the module:

**Before:**
```javascript
// In scale-ultra.html
let interiorsGroup = new THREE.Group();
let interiorRoomObjects = [];
```

**After:**
```javascript
// In scale-ultra.html - import from module
import {
  interiorsGroup,
  interiorRoomObjects,
  interiorInteractiveObjects,
  interactiveInteriorsObjects
} from './js/interiors-main.js';
```

## Files Modified

1. **js/interiors-main.js**
   - Added injection points for real functions
   - Created wrapper functions that call injected implementations
   - Maintains state variables that are shared with scale-ultra

2. **scale-ultra.html**
   - Updated `initInteriors` call to pass real functions
   - Removed duplicate state variable declarations
   - Imports state variables from module

## Testing
Press 'I' in scale-ultra.html to toggle interiors mode. The room should now properly generate with:
- Walls
- Floor styling (hardwood/tile)
- Bathroom with tiled floor
- Kitchen partition
- Ceiling
- Furniture
- Lighting

## Future Work
- Extract remaining asset creation functions to the universal asset library
- Move `generateInteriorRoom` implementation to a dedicated module
- Complete the architectural planning system extraction

