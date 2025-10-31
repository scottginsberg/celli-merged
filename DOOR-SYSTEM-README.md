# 🚪 Dynamic Door Frame System

## Overview
Comprehensive door and frame system designed for 2D walls with proper room offsets. Automatically creates frames that hide wall edges and supports multiple door styles with opening animations.

## Location
`js/door-system.js`

## Features

### 🎨 Door Styles
1. **Modern** - Flat panel, horizontal bar handle, white finish
2. **Traditional** - Six-panel design, round knob, wood finish
3. **Rustic** - Vertical planks, lever handle, dark wood
4. **Industrial** - Metal with rivets, pull handle, gray finish
5. **Glass** - Transparent panel, horizontal bar, modern frame
6. **Barn** - Plank design with X-brace, barn pull handle

### 🏗️ Frame System
- **Auto-fitting** - Frames automatically adjust to any opening size
- **Edge hiding** - Frames cover 2D wall edges for clean appearance
- **Components**:
  - Top lintel
  - Left/right jambs
  - Bottom threshold
  - All slightly thicker than walls to hide edges

### 🚀 Animation System
- Smooth opening/closing animations
- Configurable swing direction (left/right)
- Eased motion (cubic ease-out)
- Customizable duration

### 📐 Room Offset System
- Proper spacing between rooms
- No clipping between adjacent spaces
- Pre-configured offsets for each room type

## Usage

### Import
```javascript
import { 
  DoorFrameSystem, 
  DOOR_STYLES, 
  getRandomDoorStyle 
} from './js/door-system.js';
```

### Create Door with Frame
```javascript
const doorAssembly = DoorFrameSystem.createDoorWithFrame({
  width: 0.9,              // Door width (default: 0.9m)
  height: 2.0,             // Door height (default: 2.0m)
  wallThickness: 0.1,      // Wall thickness (default: 0.1m)
  style: 'modern',         // Door style (see DOOR_STYLES)
  openDirection: 'right',  // 'left' or 'right' (default: 'right')
  x: 0,                    // X position
  z: 0,                    // Z position
  rotation: 0              // Y rotation
});

scene.add(doorAssembly);
```

### Animate Door
```javascript
// Open door
DoorFrameSystem.animateDoor(doorAssembly, true, 500);

// Close door
DoorFrameSystem.animateDoor(doorAssembly, false, 500);

// Toggle door
const isOpen = doorAssembly.userData.isOpen;
DoorFrameSystem.animateDoor(doorAssembly, !isOpen);
```

### Interactive Door (Click to Open)
```javascript
raycaster.setFromCamera(mouse, camera);
const intersects = raycaster.intersectObjects(scene.children, true);

if (intersects.length > 0) {
  let object = intersects[0].object;
  
  // Find parent door assembly
  while (object.parent && !object.userData.isDoor) {
    object = object.parent;
  }
  
  if (object.userData.isDoor) {
    const isOpen = object.userData.isOpen;
    DoorFrameSystem.animateDoor(object, !isOpen);
  }
}
```

### Room Offsets
```javascript
const offset = DoorFrameSystem.createRoomOffset('1br');
roomGroup.position.set(offset.x, 0, offset.z);
```

### Random Door Style
```javascript
const randomStyle = getRandomDoorStyle();
const door = DoorFrameSystem.createDoorWithFrame({
  width: 0.9,
  height: 2.0,
  style: randomStyle,
  x: 0,
  z: 0
});
```

## Door Styles Reference

### Modern
```javascript
{
  panelType: 'flat',
  color: 0xffffff,              // White
  handleStyle: 'horizontal-bar',
  handleColor: 0x888888,         // Gray
  frameColor: 0xf5f5f5,         // Off-white
  frameThickness: 0.08
}
```

### Traditional
```javascript
{
  panelType: 'six-panel',
  color: 0xc4a574,              // Light wood
  handleStyle: 'round-knob',
  handleColor: 0xd4af37,         // Brass
  frameColor: 0xc4a574,
  frameThickness: 0.1
}
```

### Rustic
```javascript
{
  panelType: 'planks',
  color: 0x8b4513,              // Dark wood
  handleStyle: 'lever',
  handleColor: 0x654321,         // Bronze
  frameColor: 0x8b4513,
  frameThickness: 0.12
}
```

### Industrial
```javascript
{
  panelType: 'metal',
  color: 0x5a5a5a,              // Gray metal
  handleStyle: 'pull-handle',
  handleColor: 0x3a3a3a,         // Dark metal
  frameColor: 0x6a6a6a,
  frameThickness: 0.06
}
```

### Glass
```javascript
{
  panelType: 'glass-panel',
  color: 0xffffff,
  opacity: 0.3,                  // Transparent
  handleStyle: 'horizontal-bar',
  handleColor: 0xc0c0c0,         // Chrome
  frameColor: 0xf0f0f0,
  frameThickness: 0.05
}
```

### Barn
```javascript
{
  panelType: 'barn-planks',
  color: 0x704214,              // Rustic brown
  handleStyle: 'barn-pull',
  handleColor: 0x2a2a2a,         // Black iron
  frameColor: 0x704214,
  frameThickness: 0.15
}
```

## Handle Styles

- **horizontal-bar** - Modern cylindrical bar
- **round-knob** - Traditional round doorknob
- **lever** - Contemporary lever handle
- **pull-handle** - Industrial pull handle (torus)
- **barn-pull** - Rustic rectangular pull

## Room Offsets

Pre-configured spacing for room types:
```javascript
{
  studio: { x: 0, z: 0 },
  '1br': { x: 15, z: 0 },
  '2br': { x: 30, z: 0 },
  bathroom: { x: 0, z: 15 },
  classroom: { x: 0, z: 30 },
  gymnasium: { x: 45, z: 0 }
}
```

## Technical Details

### Frame Construction
1. **Top Lintel** - Horizontal beam above door
2. **Side Jambs** - Vertical posts on left/right
3. **Threshold** - Bottom piece at floor level
4. **All pieces extend beyond wall thickness to hide edges**

### Door Panel Construction
1. **Main panel** - Base door geometry
2. **Decorative details** - Added based on panelType
3. **Handle** - Positioned based on openDirection
4. **Pivot point** - Set at hinge side for rotation

### Animation System
- Uses `requestAnimationFrame` for smooth motion
- Cubic ease-out for natural feel
- Respects swing direction (left/right)
- Updates `userData.isOpen` state

## Best Practices

### Wall Integration
```javascript
// Create wall with door opening
const wallWithOpening = createWallSegment({
  start: { x: 0, z: 0 },
  end: { x: 5, z: 0 },
  doorPosition: 2.5,
  doorWidth: 0.9
});

// Add door at the opening
const door = DoorFrameSystem.createDoorWithFrame({
  width: 0.9,
  height: 2.0,
  wallThickness: 0.1,
  style: 'modern',
  x: 2.5,
  z: 0,
  rotation: 0
});
```

### Multiple Rooms
```javascript
// Room 1
const room1Offset = DoorFrameSystem.createRoomOffset('studio');
room1.position.set(room1Offset.x, 0, room1Offset.z);

// Room 2 (adjacent, no overlap)
const room2Offset = DoorFrameSystem.createRoomOffset('1br');
room2.position.set(room2Offset.x, 0, room2Offset.z);

// Connecting door between rooms
const connectingDoor = DoorFrameSystem.createDoorWithFrame({
  width: 0.9,
  height: 2.0,
  style: 'traditional',
  x: room1Offset.x + 5,
  z: 0
});
```

## Integration with Asset Evaluator

The door system is now part of the asset-evaluator hub:

### Evaluate Doors
```javascript
// Test different door styles
const styles = ['modern', 'traditional', 'rustic', 'industrial', 'glass', 'barn'];

for (const style of styles) {
  const door = DoorFrameSystem.createDoorWithFrame({
    width: 0.9,
    height: 2.0,
    style: style,
    x: 0,
    z: 0
  });
  
  // Add to preview renderer
  evaluator.renderer.scene.add(door);
  
  // Test animation
  DoorFrameSystem.animateDoor(door, true);
}
```

---

**Status**: ✅ Production Ready  
**Hub**: Asset Evaluator (http://localhost:3000/asset-evaluator.html)  
**Last Updated**: 2025-10-27

