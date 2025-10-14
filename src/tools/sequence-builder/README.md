# Celli Sequence Builder - Modular Architecture

## Overview

The Sequence Builder has been refactored into a modular architecture with separation of concerns. The original monolithic `index.html` is now broken down into focused component files.

**NEW**: Scenes can now implement a composable structure for automatic sequence extraction. See `src/core/BaseScene.js` and `src/core/SCENE_COMPOSABILITY_GUIDE.md` for details.

## File Structure

```
celli-refactor/
├── tools/sequence-builder/
│   ├── index.html              # Original monolithic version
│   └── index-modular.html      # New modular entry point
│
└── src/tools/sequence-builder/
    ├── main.js                 # Main entry point & initialization
    ├── styles.css              # Core UI styles
    ├── node-styles.css         # Node graph visual styles
    ├── ResizableManager.js     # Panel resizing functionality
    ├── DialogueManager.js      # Dialogue/sequence management
    ├── SequenceBuilderCore.js  # Core scene ingestion logic
    └── README.md               # This file
```

## Component Responsibilities

### `index-modular.html`
- Minimal HTML structure
- Links to CSS stylesheets
- Imports main.js module
- Basic inline styles for layout

### `main.js`
- Application entry point
- Initializes all managers
- Sets up event listeners
- Coordinates between modules

### `styles.css`
- Core UI styling (panels, buttons, inputs)
- Layout and grid system
- Loading states
- Scrollbars

### `node-styles.css`
- Node graph visual styles
- Node type colors (Cyan parameters, Orange events, Yellow delays, etc.)
- Connection lines
- Socket styling
- Execute-after panel styles

### `ResizableManager.js`
- Handles panel resize functionality
- Mouse drag interactions
- Grid layout updates

### `DialogueManager.js`
- CRUD operations for dialogues
- Export/import functionality
- Dialogue state management

### `SequenceBuilderCore.js`
- Auto-ingest scene data
- Extract timing configurations
- Generate node hierarchies
- Scene detection utilities

## Color Scheme

Node types are color-coded for easy identification:

- **Dialogue**: Magenta/Pink (#e91e63)
- **Parameter**: Cyan (#00e5ff) 
- **Event**: Orange (#ff9800)
- **Object**: Blue (#2196f3)
- **Animation/Transition**: Yellow (#ffc107)
- **Delay**: Yellow (#ffc107)
- **Snapshot/Parallel**: Purple (#ba68c8)

## Features

### Auto-Ingest Scene
- Automatically extracts sequence data from running scenes
- Supports `introCfg`, `motionCfg`, and `sequence` properties
- Creates connected node graph automatically
- **Uses selected scene from dropdown** - picks the scene you want to ingest
- Falls back to current scene if no selection made
- Multiple scene object lookup strategies:
  - Direct property name (e.g., `window.parent.IntroSceneComplete`)
  - Lowercase variants (e.g., `introscenecomplete`)
  - camelCase variants (e.g., `introSceneComplete`)
  - Constructor name matching (e.g., `currentScene.constructor.name === 'IntroSceneComplete'`)
  - Special handling for `introScene` global

### Scene Dropdown
- Select different scenes to inspect
- **Integrates with Auto-Ingest** - choose which scene to extract data from
- Lists all available scenes (Intro, VisiCalc, CelliReal, Fullhand, End3, City, Leave)
- Updates scene badge when changed
- Works with both parent window and opener window contexts

### Parallel Nodes
- Support multiple outputs (default: 3)
- Add/remove outputs dynamically
- Visual output management

### Execute-After Panel
- Hierarchical view of connected next nodes
- Checkbox selection for batch operations
- "All" and "None" quick select buttons
- Depth indication (up to 3 levels)

## Usage

### Standalone Mode
```javascript
// Open in new window
window.open('./tools/sequence-builder/index-modular.html?standalone=true', ...);
```

### Overlay Mode
```javascript
// Embed as iframe
const iframe = document.createElement('iframe');
iframe.src = './tools/sequence-builder/index-modular.html';
```

### From Any Scene
The sequence builder is accessible via the backslash key (`\`) from any scene:

```javascript
document.addEventListener('keydown', (e) => {
  if (e.key === '\\') {
    toggleSequenceBuilder();
  }
});
```

## Development

### Adding New Node Types

1. Add color scheme in `node-styles.css`:
```css
.graph-node.type-custom {
  background: linear-gradient(135deg, #... 0%, #1a1a1a 100%);
  border-color: #...;
}
```

2. Add default in `main.js` or node creation logic:
```javascript
const nodeDefaults = {
  custom: {
    speaker: 'Custom Node',
    text: 'Description...'
  }
};
```

3. Add button in `index-modular.html`:
```html
<button class="node-tool-btn" data-node-type="custom">🔷 Custom</button>
```

### Extending Scene Auto-Ingest

Add scene-specific logic in `SequenceBuilderCore.js`:

```javascript
// In autoIngestScene method
if (sceneObject.customCfg) {
  // Extract custom configuration
  // Create nodes
  // Connect nodes
}
```

## Future Improvements

- [ ] NodeGraphManager.js module
- [ ] SceneViewportManager.js module  
- [ ] GlitchVideoPlayer.js module
- [ ] Complete node connection drag-and-drop
- [ ] Node position persistence
- [ ] Undo/redo system
- [ ] Real-time scene synchronization
- [ ] Export to executable sequence format

## Migration Path

1. **Phase 1** (Current): Dual files - keep `index.html`, add `index-modular.html`
2. **Phase 2**: Extract remaining classes into modules
3. **Phase 3**: Replace `index.html` with `index-modular.html`
4. **Phase 4**: Full component isolation with tests

## Notes

- ES6 modules require a server (can't be loaded via `file://`)
- Use `python -m http.server` or similar for local development
- All global references (window.*) will be phased out in favor of proper module imports

