# Celli Architecture Documentation

## Project Overview

Celli is a 3D voxel-based interactive experience with multiple scenes and a spreadsheet interface. The project has two parallel architectures:

1. **Modular Component System** (ACTIVE - Used by `index.html`)
2. **Standalone Templates** (LEGACY - Separate HTML files)

---

## 🎯 Quick Navigation for AI Agents

### Modifying the Intro Scene?
→ **Edit**: `src/scripts/scenes/IntroSceneComplete.js`
→ **NOT**: `templates/componentized/intro-faithful.html`

### Modifying Other Scenes?
→ **Edit files in**: `src/scripts/scenes/*.js`
→ **NOT**: `templates/componentized/*.html`

### Testing Changes?
→ **Run**: `index.html` (or dev server)
→ Changes to `src/scripts/` will be reflected

---

## Directory Structure

```
celli-merged-main/
├── index.html                          # Main entry point (USES MODULAR SYSTEM)
├── src/
│   ├── scripts/
│   │   ├── main.js                    # Application bootstrap
│   │   ├── app-enhanced.js            # Scene system & initialization
│   │   ├── core/
│   │   │   └── SceneManager.js        # Scene lifecycle management
│   │   ├── scenes/                    # ✅ ACTIVE SCENE MODULES (EDIT THESE)
│   │   │   ├── IntroSceneComplete.js  # ← Intro sequence (ACTIVE)
│   │   │   ├── VisiCellScene.js       # ← Spreadsheet interface
│   │   │   ├── CityScene.js           # ← Neon city
│   │   │   ├── CelliRealScene-Full.js # ← Voxel world
│   │   │   ├── FullhandScene.js       # ← Execution environment
│   │   │   ├── TheosSequenceScene.js  # ← Coordinate lattice
│   │   │   └── LeaveScene.js          # ← House of Leaves
│   │   ├── systems/                   # Core systems (audio, assets, etc.)
│   │   ├── gui/                       # GUI systems
│   │   └── tools/                     # Utilities (recorder, etc.)
│   └── styles/                        # CSS files
├── templates/
│   └── componentized/                 # ❌ STANDALONE TEMPLATES (NOT IMPORTED)
│       ├── intro-faithful.html        # ← NOT used by index.html
│       ├── fullhand-complete.html     # ← NOT used by index.html
│       └── *.html                     # ← All standalone, not imported
└── static/
    └── images/
```

---

## Two Parallel Architectures

### 1. Modular Component System (ACTIVE)

**Entry Point**: `index.html`

**Flow**:
```
index.html
  └─> src/scripts/main.js (Bootstrap)
       └─> src/scripts/app-enhanced.js (Scene registration)
            └─> src/scripts/core/SceneManager.js (Lifecycle)
                 └─> src/scripts/scenes/*.js (Individual scenes)
```

**How It Works**:
- ES6 modules imported dynamically
- SceneManager handles transitions
- Single-page application flow
- Shared Three.js renderer and resources

**Editing**: Modify `src/scripts/scenes/*.js` files

---

### 2. Standalone Templates (LEGACY)

**Entry Points**: `templates/componentized/*.html`

**Flow**:
```
User navigates directly to HTML file
  └─> Self-contained HTML with embedded JavaScript
       └─> Complete scene implementation in single file
```

**How It Works**:
- Each HTML file is a complete, self-contained application
- No imports from `src/scripts/`
- Can be opened directly in browser
- Separate instances, no shared state

**Purpose**:
- Historical reference
- Independent testing
- Alternative distribution
- Proof of concepts

**Editing**: Changes only affect that specific HTML file, NOT `index.html`

---

## Scene System (Modular)

### Scene Registration

In `src/scripts/app-enhanced.js`:

```javascript
import { IntroSceneComplete } from './scenes/IntroSceneComplete.js';
import { VisiCellScene } from './scenes/VisiCellScene.js';
// ... other imports

// Register scenes
sceneManager.registerScene('intro', IntroSceneComplete);
sceneManager.registerScene('visicell', VisiCellScene);
// ...
```

### Scene Lifecycle

```javascript
class SceneModule {
  constructor() { }          // Create instance
  async init() { }           // Setup (called once)
  async start(state) { }     // Scene becomes active
  update(state, dt, t) { }   // Every frame
  render(state) { }          // Custom render (optional)
  resize(w, h) { }           // Window resize
  async stop() { }           // Scene deactivates
  async destroy() { }        // Complete cleanup
}
```

### Animation Loop

In `src/scripts/app-enhanced.js`:

```javascript
function animate() {
  requestAnimationFrame(animate);
  const deltaTime = clock.getDelta();
  const totalTime = clock.getElapsedTime();
  
  sceneManager.update(deltaTime, totalTime);
}
```

---

## Key Concepts

### SceneManager
- Handles scene transitions
- Manages scene lifecycle
- Maintains scene state
- Provides scene registry

### Scene State
Each scene maintains its own state object:

```javascript
this.state = {
  running: false,
  totalTime: 0,
  scene: null,        // Three.js scene
  camera: null,       // Three.js camera
  renderer: null,     // Three.js renderer
  // ... scene-specific properties
};
```

### Event Listeners
Scenes should clean up listeners:

```javascript
async init() {
  this._clickHandler = (e) => { /* ... */ };
  document.addEventListener('click', this._clickHandler);
}

async destroy() {
  if (this._clickHandler) {
    document.removeEventListener('click', this._clickHandler);
  }
}
```

---

## Intro Scene Deep Dive

### File: `src/scripts/scenes/IntroSceneComplete.js`

**Purpose**: Boot sequence with voxel CELLI animation

**Phases**:
1. **Roll** (0-2.5s): Shapes roll into place
2. **Bounce** (2.5-4.5s): Sequential bounces
3. **Triangle** (4.5-7.5s): Form triangle
4. **Orbit** (7.5-9.5s): Eclipse motion
5. **Venn** (9.5-18s): Venn diagram
6. **Collapse** (18-22s): Collapse to circle
7. **Glitch** (22-24.5s): Screen glitch
8. **Blackout** (24.5-26s): Fade to black
9. **Loomworks** (26-30s): Text reveal
10. **CELLI** (30-36s): Voxel letters drop
11. **Doorway** (36s+): Input prompt appears
12. **User Interaction**: Click → Glitch rain → Backspace restoration
13. **Transformation**: Letters turn yellow and rounded
14. **END Sequence**: Type E-N-D → Transition to VisiCell

**Key State**:
```javascript
{
  inputText: '=',                    // Prompt starts with just '='
  celliGlitchStarted: false,        // Glitch animation triggered?
  doorwayOpened: false,             // Is input available?
  voxels: [],                       // CELLI letter voxels
  letterVoxels: { C:[], E:[], ... } // Organized by letter
  restoredLetters: 0,               // Count of restored letters
  allYellowTransformed: false       // Ready for END?
}
```

**Key User Interactions**:

1. **Click Prompt**:
   - Triggers `_triggerCelliGlitchRain()`
   - Voxels glitch and fall away
   - Only 'T' remains

2. **Backspace**:
   - Handled by `_handlePromptBackspace()`
   - Restores letters: C → E → L → L → I
   - Each restoration triggers fritz sound effect

3. **Type "END"**:
   - Each letter changes voxel colors
   - E → Magenta, N → Cyan, D → Green
   - Triggers transition to VisiCell scene

**Input Flow**:
```
Prompt Click
  └─> _promptClickHandler
       └─> Check voxels settled
            └─> _triggerCelliGlitchRain()
                 └─> Sets celliGlitchStarted = true
                 
Keyboard Input
  └─> _keydownHandler (if doorwayOpened)
       └─> _handleDoorwayInput()
            └─> Backspace: _handlePromptBackspace()
            └─> Letters: Update inputText
```

---

## Common Pitfalls (⚠️ READ THIS)

### 1. Editing Wrong File
❌ **WRONG**: `templates/componentized/intro-faithful.html`
✅ **RIGHT**: `src/scripts/scenes/IntroSceneComplete.js`

### 2. Not Cleaning Up Listeners
```javascript
// ❌ WRONG
init() {
  document.addEventListener('click', (e) => { /* ... */ });
}

// ✅ RIGHT
init() {
  this._clickHandler = (e) => { /* ... */ };
  document.addEventListener('click', this._clickHandler);
}
destroy() {
  document.removeEventListener('click', this._clickHandler);
}
```

### 3. Accessing DOM Too Early
```javascript
// ❌ WRONG (in constructor)
constructor() {
  this.element = document.getElementById('myEl'); // May not exist yet!
}

// ✅ RIGHT (in init or start)
async init() {
  this.element = document.getElementById('myEl');
}
```

### 4. Not Checking Scene State
```javascript
// ❌ WRONG
update(state, deltaTime) {
  this.doThing(); // Runs even when scene inactive!
}

// ✅ RIGHT
update(state, deltaTime) {
  if (!this.state.running) return;
  this.doThing();
}
```

---

## Development Workflow

### Making Changes to Intro Scene

1. **Edit**: `src/scripts/scenes/IntroSceneComplete.js`
2. **Save** the file
3. **Refresh** browser with `index.html` open
4. **Test** via Play button or Scene Select

### Debugging

**Browser Console**:
```javascript
// Current scene
window.SceneManager.getCurrentScene()

// Transition to scene
await window.SceneManager.transitionTo('intro')

// List all scenes
window.SceneManager.listScenes()

// Check app context
window.celliApp
```

**Console Logs**:
- Scenes log their lifecycle: `🎬 Starting...`, `⏹️ Stopping...`
- Check for errors during init/start
- Look for cleanup warnings during destroy

### Testing Specific Features

**Test Intro Backspace**:
1. Open `index.html`
2. Play → Intro sequence
3. Wait for CELLI letters to drop
4. Click prompt
5. Press Backspace multiple times
6. Verify letters restore: C, E, L, L, I

**Test Debug Panels Hidden**:
1. Open `index.html`
2. Verify test buttons are hidden on play overlay
3. Press `[` key
4. Verify recorder button appears

---

## Build & Deploy

### Development
```bash
# Serve locally
python -m http.server 8000
# or
npx http-server

# Open in browser
http://localhost:8000/index.html
```

### Production
- All assets are static
- No build process required
- Deploy entire directory to web server
- Ensure proper MIME types for `.js` modules

---

## File Migration History

**October 23, 2025**: 
- Identified confusion between template and modular files
- Created README files to document architecture
- Clarified that `templates/componentized/*.html` are NOT used by `index.html`
- All active development should target `src/scripts/scenes/*.js`

---

## Questions?

**How do I modify the intro sequence?**
→ Edit `src/scripts/scenes/IntroSceneComplete.js`

**Why are there two intro implementations?**
→ `IntroSceneComplete.js` (active) and `intro-faithful.html` (standalone/legacy)

**Which file is actually used by index.html?**
→ `src/scripts/scenes/IntroSceneComplete.js`

**Can I delete the templates folder?**
→ Yes, but they serve as reference and alternative entry points

**How do I test my changes?**
→ Open `index.html` in browser, changes to `src/scripts/` are active

---

**Last Updated**: October 23, 2025

**Maintained by**: Development Team

**For AI Agents**: Please read `src/scripts/scenes/README.md` and `templates/componentized/README.md` before making changes.




