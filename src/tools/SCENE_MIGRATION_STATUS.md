# Scene Migration Status
## Sequence Builder Composability

### Legend
- ✅ Compatible - Has timing.phases or can be auto-converted
- 🔄 Needs Update - Requires manual integration
- ❌ Not Started - No composable structure
- 📝 Template - Legacy faithful version (keep as-is)

---

## Scene Status

### IntroSceneComplete
- **Status**: 🔄 Needs Update
- **File**: `src/scripts/scenes/IntroSceneComplete.js`
- **Has introCfg**: ✅ Yes (can auto-convert)
- **Action Needed**: Add `this._initializeSequenceBuilderData()` call to constructor
- **Patch Available**: `src/patches/INTRO_SCENE_PATCH.js`
- **Priority**: HIGH (most commonly used)

### VisiCellScene
- **Status**: ❌ Not Started
- **File**: `src/scripts/scenes/VisiCellScene.js`
- **Action Needed**: Add timing/motion/events structures
- **Priority**: MEDIUM

### CelliRealScene (Modular)
- **Status**: ❌ Not Started
- **File**: `src/scripts/scenes/CelliRealScene-Full.js`
- **Action Needed**: Add timing/motion/events structures
- **Notes**: Interactive scene, may need different approach
- **Priority**: HIGH (commonly used)

### CelliRealScene (Faithful)
- **Status**: 📝 Template  
- **File**: `src/scripts/scenes/CelliRealScene-Faithful.js`
- **Action**: Keep as-is, update modular version instead
- **Priority**: N/A

### FullhandScene (Modular)
- **Status**: ❌ Not Started
- **File**: `src/scripts/scenes/FullhandScene.js`
- **Action Needed**: Add timing/motion/events structures
- **Priority**: HIGH (commonly used)

### FullhandScene (Faithful)
- **Status**: 📝 Template
- **File**: `src/scripts/scenes/FullhandScene-Faithful.js`
- **Action**: Keep as-is
- **Priority**: N/A

### End3Scene
- **Status**: ❌ Not Started
- **File**: `src/scripts/scenes/End3Scene.js`
- **Action Needed**: Add timing/motion/events structures
- **Priority**: MEDIUM

### CityScene
- **Status**: ❌ Not Started  
- **File**: `src/scripts/scenes/CityScene.js`
- **Action Needed**: Add timing/motion/events structures
- **Priority**: LOW

### LeaveScene
- **Status**: ❌ Not Started
- **File**: `src/scripts/scenes/LeaveScene.js`  
- **Action Needed**: Add timing/motion/events structures
- **Priority**: LOW

---

## Quick Migration Steps

### For Scenes with introCfg (like IntroSceneComplete)

**Option 1: Use Helper (Recommended)**
```javascript
import { makeSceneComposable } from '../utils/sceneComposabilityHelper.js';

constructor() {
  // ... existing code with this.introCfg setup ...
  
  // Add at the end:
  makeSceneComposable(this, {
    name: 'Scene Name',
    version: '1.0.0',
    description: 'Scene description'
  });
}
```

**Option 2: Manual Method**
```javascript
constructor() {
  // ... existing code ...
  
  this._initializeSequenceBuilderData();
}

_initializeSequenceBuilderData() {
  // See INTRO_SCENE_PATCH.js for full implementation
}
```

### For Scenes without introCfg

**Use BaseScene pattern:**
```javascript
import { BaseScene } from '../core/BaseScene.js';

export class MyScene extends BaseScene {
  constructor() {
    super();
    
    this.sequenceMetadata = { name: 'My Scene', ... };
    
    // Register phases manually
    this.registerPhase('Intro', 0, 3, 'animation');
    this.registerPhase('Main', 3, 10, 'animation');
    // ... etc
  }
}
```

---

## Testing Checklist

For each migrated scene:

1. [ ] Run scene in main app
2. [ ] Open Sequence Builder (press `\`)
3. [ ] Select scene from dropdown
4. [ ] Click "Auto-Ingest"
5. [ ] Verify nodes appear in Node Graph tab
6. [ ] Check node count matches expected phases
7. [ ] Verify connections between nodes
8. [ ] Check node types/colors are correct

---

## Expected Node Counts

Based on standard scene structures:

| Scene | Expected Nodes | Note |
|-------|---------------|------|
| IntroSceneComplete | 12 | If introCfg has all 12 phases |
| VisiCellScene | 3-5 | TBD based on scene structure |
| CelliRealScene | 1+ | Interactive, fewer phases |
| FullhandScene | 5-8 | TBD based on scene structure |
| End3Scene | 3-5 | TBD based on scene structure |
| CityScene | 3-5 | TBD based on scene structure |
| LeaveScene | 4-6 | TBD based on scene structure |

---

## Next Actions

### Immediate (Priority 1)
1. Update IntroSceneComplete with patch
2. Update CelliRealScene-Full.js with timing structure
3. Update FullhandScene.js with timing structure

### Soon (Priority 2)
4. Update VisiCellScene
5. Update End3Scene
6. Document each scene's timing structure

### Later (Priority 3)
7. Update CityScene
8. Update LeaveScene
9. Create automated testing for all scenes

---

## Auto-Convert Script

Run this in browser console after scene loads to see what it would convert to:

```javascript
function showComposableData(scene) {
  console.log('🔍 Scene Composability Analysis\n');
  console.log('Has timing.phases:', !!scene.timing?.phases);
  console.log('Has introCfg:', !!scene.introCfg);
  console.log('Has motion:', !!scene.motion);
  console.log('Has motionCfg:', !!scene.motionCfg);
  console.log('Has events:', !!scene.events);
  console.log('Has sequence:', !!scene.sequence);
  
  if (scene.introCfg) {
    console.log('\nConvertible introCfg entries:');
    Object.entries(scene.introCfg).forEach(([key, val]) => {
      console.log(`  ${key}: ${val}s`);
    });
  }
  
  if (scene.timing?.phases) {
    console.log('\nComposable phases:', scene.timing.phases.length);
    scene.timing.phases.forEach(p => {
      console.log(`  ${p.name}: ${p.start}s - ${p.end}s (${p.type})`);
    });
  }
}

// Usage:
// showComposableData(window.introScene);
// showComposableData(window.currentScene);
```

