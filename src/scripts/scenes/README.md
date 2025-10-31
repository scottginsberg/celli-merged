# Scene Modules - Main App Implementation

## ✅ These ARE the Active Scene Files

**These JavaScript modules are imported and used by `index.html` via the main app.**

Any changes made to these files will be reflected in the main application.

---

## Scene Files

| Scene File | Purpose | Scene Name |
|-----------|---------|------------|
| `IntroSceneComplete.js` | Boot sequence with voxel animation | `intro` |
| `VisiCellScene.js` | Spreadsheet/terminal interface | `visicell` |
| `CityScene.js` | Neon city breakout scene | `city` |
| `CelliRealScene-Full.js` | Voxel world exploration | `cellireal` |
| `FullhandScene.js` | Execution environment/puzzle | `fullhand` |
| `TheosSequenceScene.js` | Coordinate lattice grid | `theos` |
| `LeaveScene.js` | House of Leaves sequence | `leave` |

---

## Scene Lifecycle

Each scene implements the following interface:

```javascript
class SceneExample {
  constructor() {
    // Initialize state
  }

  async init() {
    // Setup Three.js objects, event listeners, etc.
  }

  async start(state, options = {}) {
    // Called when scene becomes active
  }

  update(state, deltaTime, totalTime) {
    // Called every frame while scene is active
  }

  render(state) {
    // Optional: Custom rendering logic
  }

  resize(width, height) {
    // Handle window resize
  }

  async stop() {
    // Cleanup when transitioning away
  }

  async destroy() {
    // Complete teardown
  }
}
```

---

## How Scenes Are Loaded

1. **Registration** (`src/scripts/app-enhanced.js`):
   ```javascript
   import { IntroSceneComplete } from './scenes/IntroSceneComplete.js';
   
   sceneManager.registerScene('intro', IntroSceneComplete);
   ```

2. **Activation** (via SceneManager):
   ```javascript
   await sceneManager.transitionTo('intro');
   ```

3. **Animation Loop** (`src/scripts/app-enhanced.js`):
   ```javascript
   function animate() {
     const deltaTime = clock.getDelta();
     sceneManager.update(deltaTime, totalTime);
   }
   ```

---

## Common Patterns

### State Management
```javascript
this.state = {
  running: false,
  totalTime: 0,
  // ... scene-specific state
};
```

### Event Listeners
```javascript
_setupEventListeners() {
  this._clickHandler = (e) => { /* ... */ };
  document.addEventListener('click', this._clickHandler);
}

async destroy() {
  if (this._clickHandler) {
    document.removeEventListener('click', this._clickHandler);
  }
}
```

### Three.js Setup
```javascript
async init() {
  this.state.scene = new THREE.Scene();
  this.state.camera = new THREE.PerspectiveCamera(/* ... */);
  this.state.renderer = new THREE.WebGLRenderer();
  // ...
}
```

---

## Intro Scene Specifics

### File: `IntroSceneComplete.js`

**Key State Properties:**
- `inputText`: Current prompt text (default: `'='`)
- `celliGlitchStarted`: Whether glitch animation has triggered
- `doorwayOpened`: Whether input is available
- `voxels`: Array of CELLI letter voxels

**Key Methods:**
- `_handlePromptBackspace()`: Handles backspace key for letter restoration
- `_triggerCelliGlitchRain()`: Starts the glitch effect when prompt is clicked
- `_restoreOneLetter()`: Restores one letter (C, E, L, L) with animation
- `_handleEndSequenceKey()`: Handles E, N, D key sequence

**Phases:**
1. Roll → Bounce → Triangle → Orbit → Venn
2. Collapse → Glitch → Blackout → Loomworks
3. CELLI voxel drop → Doorway
4. User interaction → Glitch rain → Backspace restoration
5. Yellow transform → END sequence → VisiCell transition

---

## Testing Changes

After editing a scene file:

1. **Refresh** `index.html` in browser
2. **Check console** for errors
3. **Test scene** via:
   - Play button → Scene flow
   - Scene Select menu
   - Direct scene transition (if debugging)

---

## Debugging

### Console Commands
```javascript
// Check active scene
window.SceneManager.getCurrentScene()

// Force scene transition
await window.SceneManager.transitionTo('intro')

// List all scenes
window.SceneManager.listScenes()
```

### Common Issues

**Scene not updating?**
- Check browser console for errors
- Ensure `update()` method exists
- Verify scene is registered in `app-enhanced.js`

**Visual elements not showing?**
- Check HTML elements exist in `index.html`
- Verify Three.js renderer is appending to `#app`
- Check CSS for `display: none` or `visibility: hidden`

**Event handlers not working?**
- Ensure listeners are added in `_setupEventListeners()`
- Verify listeners are removed in `destroy()`
- Check SceneManager permissions

---

## Related Files

- **App Bootstrap**: `src/scripts/app-enhanced.js`
- **Main Entry**: `src/scripts/main.js`
- **Scene Manager**: `src/scripts/core/SceneManager.js`
- **HTML Container**: `index.html`

---

## ⚠️ NOT Related

**DO NOT confuse with standalone templates:**
- `templates/componentized/*.html` ← These are separate, not imported

See `templates/componentized/README.md` for more info.

---

Last Updated: October 23, 2025




