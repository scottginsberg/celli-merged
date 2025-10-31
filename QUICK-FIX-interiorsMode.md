# Quick Fix: interiorsMode ReferenceError

## Error
```
Uncaught ReferenceError: interiorsMode is not defined
```

## Cause
When I commented out the local state variables in `scale-ultra.html`, I forgot to import `interiorsMode` from the module. The variable was being used throughout the codebase but was no longer defined.

## Fix
Added `interiorsMode` to the import statement:

```javascript
import {
  initInteriors,
  toggleInteriorsMode,
  onInteriorsClick,
  clearInteriorRoom,
  interiorsMode,              // ← Added this
  interiorsGroup,
  interiorRoomObjects,
  interiorInteractiveObjects,
  interactiveInteriorsObjects
} from './js/interiors-main.js';
```

## How It Works
- `interiorsMode` is exported from `js/interiors-main.js` as `export let interiorsMode = false`
- When imported, it provides a **live read-only binding**
- Code in `scale-ultra.html` can **read** the value
- The module's `toggleInteriorsMode()` function **modifies** the value internally
- All readers see the updated value

## Test
1. Reload the page
2. Press `I` to toggle interiors mode
3. Room should build without errors
4. Console should show: "Entering interiors mode..." followed by room generation logs

