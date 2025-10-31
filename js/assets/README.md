# Universal Asset Library

A modular, context-agnostic 3D asset creation system for creating furniture, fixtures, electronics, and decorative items. Assets can be called from `scale-ultra.html`, `sequence-builder`, preview apps, or AI evaluation tools.

## Architecture

```
js/assets/
├── asset-context.js        # Context management utilities
├── asset-registry.js       # Central asset registry
├── preview-renderer.js     # Standalone asset preview renderer
├── categories/             # Asset creators organized by category
│   ├── furniture.js        # Beds, couches, desks, tables
│   ├── bathroom.js         # Toilets, showers, sinks
│   ├── kitchen.js          # Fridges, microwaves, counters
│   ├── decor.js            # Plants, rugs, art frames, lamps
│   ├── electronics.js      # TVs, computers, appliances
│   └── outdoor.js          # Outdoor items (placeholder)
└── README.md               # This file
```

## Key Concepts

### 1. Context-Agnostic Design

Asset creators accept THREE.js and context as parameters, making them work anywhere:

```javascript
function createBed(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Create geometry...
  
  // Position using context
  group.position.set(spec.x * gridSize, spec.y || 0, spec.z * gridSize);
  
  // Register with context
  return context.addObject(group);
}
```

### 2. Universal Registry

The `asset-registry.js` provides a single entry point for all assets:

```javascript
import { createAsset } from './js/assets/asset-registry.js';

// Create a bed
const bed = createAsset('bed', {
  x: 0,
  z: 0,
  rotation: 0,
  size: 'child',
  color: 'blue'
}, THREE, context);
```

### 3. Metadata Support

Each asset creator includes metadata for cataloging:

```javascript
createBed.metadata = {
  category: 'furniture',
  name: 'Bed',
  description: 'Single or child-size bed',
  dimensions: { width: 1.5, depth: 2, height: 0.5 },
  interactive: false
};
```

## Usage Examples

### In scale-ultra.html (Existing System)

```javascript
import { createAsset } from './js/assets/asset-registry.js';

// Setup context
const context = {
  scene: interiorsGroup,
  objects: interiorRoomObjects,
  interactive: interiorInteractiveObjects,
  gridSize: INTERIORS_GRID_SIZE
};

// Create furniture
const bed = createAsset('bed', { x: 0, z: 5, rotation: 0 }, THREE, context);
const couch = createAsset('couch', { x: -2, z: 0, rotation: Math.PI }, THREE, context);
```

### Standalone Preview

```javascript
import { AssetPreviewRenderer } from './js/assets/preview-renderer.js';

const container = document.getElementById('preview');
const renderer = new AssetPreviewRenderer(container);

// Add assets
renderer.addAsset('bed', { x: 0, z: 0 });
renderer.addAsset('toilet', { x: 2, z: 0 });

// Take screenshot
const screenshot = renderer.takeScreenshot();
```

### AI Geometry Evaluator

```javascript
import { GeometryEvaluator } from './js/evaluator/geometry-evaluator.js';

const evaluator = new GeometryEvaluator({
  apiKey: 'your-api-key',
  apiEndpoint: 'https://api.anthropic.com/v1/messages'
});

evaluator.init(container);

// Evaluate asset
const result = await evaluator.evaluateAsset('bed', { size: 'child' });

console.log('Score:', result.aiResponse.score);
console.log('Issues:', result.aiResponse.criticalIssues);
console.log('Recommendations:', result.aiResponse.recommendations);
```

## Asset Specification Format

### Common Properties

All assets support these base properties:

```javascript
{
  x: 0,           // Grid X position
  y: 0,           // Absolute Y position (height)
  z: 0,           // Grid Z position
  rotation: 0,    // Y-axis rotation in radians
  GRID_SIZE: 1.0  // Optional: Override grid multiplier
}
```

### Asset-Specific Properties

#### Furniture

**Bed:**
```javascript
{
  size: 'child',     // 'child' or default (adult)
  color: 'blue'      // 'blue', 'pink', 'lightpink', 'white'
}
```

**Desk:**
```javascript
{
  shape: 'rectangle'  // 'square', 'rectangle', 'circle'
}
```

**Coffee Table:**
```javascript
{
  shape: 'rectangle'  // 'square', 'rectangle', 'circle'
}
```

#### Decor

**Rug:**
```javascript
{
  width: 2,
  depth: 1.5,
  pattern: 'modern'   // 'modern', 'persian', 'shag'
}
```

**Art Frame:**
```javascript
{
  size: 'medium'      // 'small', 'medium', 'large'
}
```

**Floor Lamp:**
```javascript
{
  lit: true          // Whether the lamp is lit
}
```

#### Electronics

**TV:**
```javascript
{
  width: 1.2,
  height: 0.7
}
```

**Computer Desk:**
```javascript
{
  // No special properties - includes monitor, keyboard
}
```

## Adding New Assets

### 1. Create Asset Function

Add to appropriate category file (e.g., `categories/furniture.js`):

```javascript
function createNewAsset(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Create Three.js geometry
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const mesh = new THREE.Mesh(geo, mat);
  
  applyShadows(mesh);
  group.add(mesh);
  
  // Position
  group.position.set(
    (spec.x || 0) * gridSize,
    spec.y || 0,
    (spec.z || 0) * gridSize
  );
  group.rotation.y = spec.rotation || 0;
  
  // Register interactive elements if needed
  if (spec.interactive) {
    context.registerInteractive(mesh);
  }
  
  // Add to scene
  return context.addObject(group);
}

// Add metadata
createNewAsset.metadata = {
  category: 'furniture',
  name: 'New Asset',
  description: 'Description of the asset',
  dimensions: { width: 1, depth: 1, height: 1 },
  interactive: false
};
```

### 2. Export from Category Module

```javascript
export const creators = {
  existingAsset: createExistingAsset,
  newAsset: createNewAsset  // Add here
};
```

### 3. Import in Registry

The registry automatically imports all category modules.

### 4. Test

```javascript
const asset = createAsset('newAsset', { x: 0, z: 0 }, THREE, context);
```

## AI Evaluation System

The AI Geometry Evaluator captures assets from multiple angles and sends them to Claude API for hyper-specific feedback.

### Features

1. **Multi-Angle Capture**: 6 standard angles (front-right, front-left, back-right, back-left, top, side)
2. **AI Analysis**: Geometric accuracy, realism, consistency, specific corrections
3. **Structured Feedback**: Score, critical issues, recommendations, code suggestions
4. **HTML Reports**: Generate comprehensive evaluation reports

### Using the Evaluator UI

1. Open `asset-evaluator.html` in your browser (requires local server)
2. Select an asset from the dropdown
3. Optionally customize properties in the JSON spec field
4. Click "Load Asset Preview"
5. Click "Capture Multi-Angle" to take screenshots
6. Enter your Anthropic API key
7. Click "🤖 Evaluate with AI"
8. View results and export HTML report

### Evaluation Workflow

```
1. Load Asset → 2. Capture Screenshots → 3. Send to AI → 4. Review Feedback → 5. Iterate
```

The AI provides actionable feedback like:

- "Bowl height should be reduced by 15% (from 0.35m to 0.30m)"
- "Seat radius too large; reduce from 0.24m to 0.21m for realistic proportions"
- "Add subtle bevel to tank edges for more realistic appearance"
- "Legs appear too thin; increase radius from 0.04m to 0.06m"

## Preview Renderer

The `AssetPreviewRenderer` is a lightweight Three.js setup for quick asset visualization:

```javascript
const renderer = new AssetPreviewRenderer(container, {
  width: 800,
  height: 600,
  backgroundColor: 0xf0f0f0,
  gridSize: 1.0
});

// Add assets
renderer.addAsset('bed', { size: 'child' });
renderer.addAsset('plant', { x: 1, z: 0 });

// Screenshot
const png = renderer.takeScreenshot();

// Multi-angle screenshots
const angles = renderer.getStandardAngles();
const screenshots = renderer.takeMultiAngleScreenshots(angles);

// Cleanup
renderer.dispose();
```

## Performance Considerations

- **Instanced Rendering**: For many copies of the same asset, consider THREE.InstancedMesh
- **LOD (Level of Detail)**: Context can include `lod` property for simplified geometry
- **Shared Materials**: Reuse materials across similar assets
- **Geometry Disposal**: Always dispose of geometries and materials when removing assets

## Migration from scale-ultra.html

The old inline asset creation functions are being gradually migrated to this system:

**Old Pattern (Inline):**
```javascript
function createInteriorBed(spec) {
  // Uses global INTERIORS_GRID_SIZE
  // Uses global interiorsGroup
  // Mixed with application logic
}
```

**New Pattern (Universal):**
```javascript
function createBed(spec, THREE, context) {
  // Accepts grid size from context
  // Accepts scene from context
  // Pure asset creation logic
}
```

## Future Enhancements

- [ ] Extract remaining assets from scale-ultra.html
- [ ] Add physics properties to metadata
- [ ] Support for asset variants/themes
- [ ] Asset composition system (combine multiple assets)
- [ ] Animation support for interactive assets
- [ ] Material library with PBR textures
- [ ] Procedural generation helpers
- [ ] Asset validation and testing framework

## Related Files

- `../interiors-constants.js` - Asset specifications and room configs
- `../interiors-main.js` - Interior mode logic
- `../interiors-ui.js` - UI controls for asset placement
- `../evaluator/geometry-evaluator.js` - AI evaluation system
- `../../asset-evaluator.html` - Evaluation UI

## License

Part of the Pockit/Celli project.

