# Lattice Grid Sequence Integration

## Overview
The THE.OS lattice grid sequence has been integrated as a modular facet that can be used both standalone and within the combined intro system.

## Architecture

### File Structure
```
src/scripts/
├── sequences/
│   └── theosSequence.js         # Core sequence logic (unchanged)
├── scenes/
│   └── TheosSequenceScene.js    # NEW: Component wrapper for integration
└── app-enhanced.js              # Updated: Registers theos scene

templates/componentized/
└── theos-sequence.html           # Standalone template (unchanged)
```

### How It Works

#### 1. Standalone Mode (Template)
- **File**: `templates/componentized/theos-sequence.html`
- **Access**: Scene selector → "THE.OS → Cell Lattice" (Template mode)
- **Behavior**: Opens in new window/tab, runs independently
- **Import**: Directly imports and initializes `theosSequence.js`

#### 2. Component Mode (In-App)
- **File**: `src/scripts/scenes/TheosSequenceScene.js`
- **Access**: Scene selector → "THE.OS → Cell Lattice" (Component mode)
- **Behavior**: Runs within the main app scene system
- **Integration**: Registered with SceneManager, can be sequenced with other scenes

#### 3. Intro Integration (Future)
- The `TheosSequenceScene` component can now be easily integrated into `IntroSceneComplete.js`
- Can be triggered as a phase within the combined intro sequence
- Simply call: `sceneManager.loadScene('theos')` at the appropriate intro phase

## Usage

### Standalone
```javascript
// Already implemented in theos-sequence.html
import { initTheosSequence } from '../../src/scripts/sequences/theosSequence.js';

const sequenceInstance = initTheosSequence({
  container: document.getElementById('sequence-root'),
  startStage: 'intro'  // or 'blackhole'
});

sequenceInstance.start();
```

### Component (In-App)
```javascript
// Automatic via scene selector, or programmatic:
import { sceneManager } from './core/SceneManager.js';

// Load the lattice grid sequence
await sceneManager.loadScene('theos');

// Or with options (e.g., for blackhole variant)
await sceneManager.loadScene('theos', { 
  startStage: 'blackhole' 
});
```

### Within Intro Sequence
```javascript
// In IntroSceneComplete.js (future integration)
async transitionToLatticeGrid() {
  // Fade out intro elements
  await this.fadeOut();
  
  // Load and start lattice grid sequence
  await sceneManager.loadScene('theos');
  
  // Continue with next intro phase after sequence completes
}
```

## Scene Modes

### Template Mode
- **Pros**: 
  - Fully isolated environment
  - No conflicts with main app state
  - Can be opened in separate window
- **Cons**:
  - Requires page load
  - Can't seamlessly integrate with other scenes

### Component Mode  
- **Pros**:
  - Seamless transitions between scenes
  - Shares app context (renderer, scene manager, etc.)
  - Can be part of larger narrative sequence
- **Cons**:
  - Must be careful about state management
  - Shares resources with other scenes

## Configuration

### Main.js Scene Options
```javascript
theos: {
  templateUrl: './templates/componentized/theos-sequence.html',
  componentScene: 'theos',
  badge: {
    template: 'Template',      // Standalone mode badge
    component: 'Component'      // In-app mode badge
  },
  indicator: {
    template: 'Standalone coordinate lattice build',
    component: 'In-app lattice grid sequence'
  },
  unlock: {
    template: true,   // Template mode always available
    component: true   // Component mode always available
  }
}
```

### BlackHole Variant
```javascript
blackhole: {
  templateUrl: './templates/componentized/theos-sequence.html?start=blackhole',
  componentScene: 'theos',
  componentOptions: { startStage: 'blackhole' },  // Starts at singularity phase
  // ... rest of config
}
```

## Next Steps

### For Intro Integration
1. Determine the appropriate phase in `IntroSceneComplete.js` to trigger the lattice grid
2. Add transition logic to fade from current intro state to theos scene
3. Add callback to resume intro sequence after lattice completes
4. Test seamless transitions

### Example Integration Point
```javascript
// In IntroSceneComplete.js
async playPhase() {
  // ... existing intro phases ...
  
  if (this.state.totalTime > LATTICE_TRIGGER_TIME) {
    if (!this.state.latticeShown) {
      this.state.latticeShown = true;
      
      // Transition to lattice grid sequence
      await this.transitionToLattice();
      
      // Return to intro after completion
      await this.resumeFromLattice();
    }
  }
}

async transitionToLattice() {
  // Fade out intro visuals
  // Load theos component scene
  // Wait for completion event
}
```

## Benefits

1. **Modularity**: Lattice grid is now a reusable component
2. **Flexibility**: Can be used standalone OR integrated
3. **Maintainability**: Single source of truth (`theosSequence.js`)
4. **Scalability**: Easy to add to any narrative sequence
5. **Testing**: Can test in isolation (template) or integration (component)

## Files Changed
- ✅ Created: `src/scripts/scenes/TheosSequenceScene.js`
- ✅ Updated: `src/scripts/app-enhanced.js` (import + registration)
- ✅ Updated: `src/scripts/main.js` (scene config)
- ✅ Unchanged: `templates/componentized/theos-sequence.html` (standalone still works)
- ✅ Unchanged: `src/scripts/sequences/theosSequence.js` (core logic unchanged)

