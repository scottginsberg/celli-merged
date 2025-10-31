# Floor Patterns System

## Overview
Comprehensive floor pattern generation system for realistic interior rendering.

## Location
`js/floor-patterns.js`

## Features

### 🏗️ Tile Patterns
- **Bathroom Checkered** - Classic black & white checkered tiles
- **Bathroom Mosaic** - Small 5cm mosaic tiles with color variation
- **Broad Tile** - Modern 60cm x 60cm large format tiles
- **Industrial Tile** - 1m x 1m concrete-look tiles

### 🪵 Hardwood Patterns
- **Long Planks** - 12cm wide planks running full depth
- **Short Planks** - 10cm x 80cm planks with staggered pattern
- **Herringbone** - 45-degree diagonal pattern
- **Parquet** - Small square blocks with alternating grain direction

### 🧶 Carpet Patterns
- **Plush Carpet** - Thick pile with subtle height variation
- **Short Pile** - Commercial/office style low pile
- **Textured Carpet** - Patterned carpet with alternating colors

## Usage

### In Asset Evaluator (`asset-evaluator.html`)
```javascript
import { FloorPatterns } from '../floor-patterns.js';

// The preview renderer now automatically uses floor patterns
// Grid has been removed for professional look
```

### In Room Builder (`interiors.html`)
```javascript
import { FloorPatterns } from './js/floor-patterns.js';

// Automatically integrated - floors generated using pattern system
const bounds = { minX: -5, maxX: 5, minZ: -5, maxZ: 5 };
FloorPatterns.createFloor(scene, bounds, 'hardwood-short', {
  gridSize: 0.6
});
```

### Pattern Names
```javascript
// Tile variants
'tile-bathroom-checkered'
'tile-bathroom-mosaic'
'tile-broad'
'tile-industrial'

// Hardwood variants
'hardwood-long'
'hardwood-short'
'hardwood-herringbone'
'hardwood-parquet'

// Carpet variants
'carpet-plush'
'carpet-short'
'carpet-textured'
```

### Manual Usage
```javascript
import { FloorPatterns } from './js/floor-patterns.js';

// Create specific pattern
const bounds = { minX: -5, maxX: 5, minZ: -5, maxZ: 5 };
const floor = FloorPatterns.createFloor(scene, bounds, 'hardwood-herringbone', {
  gridSize: 1.0,
  color: 0x8b4513  // Optional wood color
});

// Get random pattern
const randomPattern = FloorPatterns.getRandomPattern();

// Change floor pattern
FloorPatterns.createFloor(scene, bounds, randomPattern);
```

## API Reference

### `FloorPatterns.createFloor(scene, bounds, patternName, options)`
Creates a floor with the specified pattern.

**Parameters:**
- `scene` (THREE.Scene) - Three.js scene to add floor to
- `bounds` (Object) - Floor boundaries `{ minX, maxX, minZ, maxZ }`
- `patternName` (string) - Pattern name (see list above)
- `options` (Object) - Optional configuration
  - `gridSize` (number) - Grid cell size (default: 1.0)
  - `color` (hex) - Primary color (for hardwood/carpet)
  - `primaryColor` (hex) - Primary color (for textured carpet)
  - `secondaryColor` (hex) - Secondary color (for textured carpet)

**Returns:**
- `THREE.Group` - Floor group object

### `FloorPatterns.getRandomPattern()`
Returns a random floor pattern name.

**Returns:**
- `string` - Random pattern name

## Integration Status

### ✅ Asset Evaluator
- Grid helper **REMOVED**
- Professional floor patterns **ENABLED**
- Default pattern: `hardwood-short`
- Clean, production-ready appearance

### ✅ Room Builder (Interiors)
- Grid helper **REMOVED**  
- Advanced floor patterns **INTEGRATED**
- Supports all pattern types
- Legacy style mapping maintained

## Technical Details

### Tile Generation
- Tiles created as individual meshes with gaps
- Color variation for realism
- Proper shadow receiving
- Slight height offsets to prevent z-fighting

### Hardwood Generation
- Planks created with wood grain direction
- Color variation across planks
- Realistic dimensions (10-15cm wide)
- Staggered patterns for authenticity

### Carpet Generation
- Vertex displacement for texture
- Multiple subdivision levels
- Proper material properties (high roughness, no metalness)
- Height variation for plush appearance

## Performance

All patterns are optimized for real-time rendering:
- Efficient geometry creation
- Proper material disposal
- Minimal draw calls through grouping
- Shadow optimization

## Future Enhancements

Potential additions:
- Procedural textures for wood grain
- Normal maps for enhanced detail
- Damaged/worn floor variants
- Custom patterns via config
- Area rugs over floors
- Transition strips between materials

---

**Last Updated**: 2025-10-27  
**Status**: Production Ready  
**Integrated**: Asset Evaluator, Room Builder

