# Three Critical Fixes Summary

## 1. ✅ Rocket Controls Fixed - Proper Yaw Steering

### Problem
At certain camera angles during rocket flight, WASD controls would cause twisting instead of proper left/right veering. The rocket would roll when it should yaw.

### Root Cause
Lines 6527-6541 were applying rotation around the `rocketToCamera` vector (camera-to-rocket axis) for A/D keys. When viewing from above/below or certain angles, this axis caused roll instead of yaw.

### Solution
Changed A/D controls to rotate around the **rocket's current "up" axis** (its forward direction):
```javascript
// A: Yaw left (rotate around rocket's current up axis)
const rocketUp = new THREE.Vector3(0, 1, 0).applyQuaternion(currentQuat);
angularVelocity.add(rocketUp.multiplyScalar(rollStrength));

// D: Yaw right (rotate around rocket's current up axis)  
const rocketUp = new THREE.Vector3(0, 1, 0).applyQuaternion(currentQuat);
angularVelocity.add(rocketUp.multiplyScalar(-rollStrength));
```

### Result
- A/D keys now provide consistent left/right steering regardless of camera angle
- Rocket veers properly in all orientations
- No more unexpected twisting

---

## 2. ✅ Pluck Mode Material Restoration Fixed

### Problem
- Pedestrians turned black when hovered in pluck mode but not plucked
- Pedestrians remained black when shrunk/collected
- Yellow highlight wasn't properly removed when objects left the viewport frame

### Root Cause
Lines 9497-9575 in `updatePluckCandidates()` were directly modifying shared material colors without cloning. When materials are shared between multiple meshes (common for pedestrians), modifying one affected all.

The restoration logic only copied color values back, but didn't restore the full material reference, leading to corrupted materials.

### Solution
- **Store original material reference** (not just color)
- **Clone materials** before modification to avoid affecting shared materials
- **Restore full original material** when unhighlighting

```javascript
function updatePluckCandidates() {
  // Restore original materials for previously highlighted objects
  pluckCandidates.forEach(obj => {
    obj.traverse(node => {
      if (node.isMesh && node.userData._originalMaterial) {
        // Restore the full original material (not just color)
        node.material = node.userData._originalMaterial;
        delete node.userData._originalMaterial;
      }
    });
  });
  
  // When highlighting, clone materials to avoid shared material corruption
  if (!node.userData._originalMaterial) {
    node.userData._originalMaterial = node.material;
    node.material = node.material.clone(); // Clone before modifying
  }
  node.material.color.lerp(new THREE.Color(0xffeb3b), 0.3);
}
```

### Result
- Pedestrians maintain correct colors when hovered and unhovered
- Yellow highlight applied only to viewport candidates
- Materials properly restored when objects leave frame
- Shrunk pedestrians in jar keep their original textures and colors

---

## 3. ✅ Dynamic Distant City Expansion

### Problem
- New chunks were loading (confirmed by console logs)
- But the distant city/skyline remained at fixed radius (600m)
- Created a visual "hole" where loaded chunks ended and distant buildings started

### Root Cause
`createDistantSkyline()` (line 1407) created a single fixed-radius ring at initialization and never updated. As player explored and new chunks loaded further out, the skyline didn't expand.

### Solution
Implemented dynamic skyline expansion system:

1. **Track current skyline** with `distantSkylineGroup` variable
2. **Calculate furthest chunk** on each chunk load
3. **Expand skyline** to stay 200m beyond loaded area
4. **Hysteresis**: Only rebuild if radius changes by >100m (prevents excessive rebuilds)
5. **Proper cleanup**: Dispose old skyline geometry/materials before creating new one

```javascript
let distantSkylineGroup = null;
let lastSkylineUpdateRadius = 0;

function updateDistantSkylineRadius() {
  // Find furthest loaded chunk
  let maxChunkDist = 0;
  activeChunks.forEach(key => {
    const [x, z] = key.split(',').map(Number);
    const dist = Math.hypot(x, z);
    if (dist > maxChunkDist) maxChunkDist = dist;
  });
  
  const chunkSize = CONFIG.BLOCK_SIZE + CONFIG.ROAD_WIDTH;
  const loadedRadius = maxChunkDist * chunkSize;
  const skylineRadius = loadedRadius + 200; // 200m beyond loaded area
  
  // Only rebuild if significantly changed (>100m difference)
  if (Math.abs(skylineRadius - lastSkylineUpdateRadius) > 100) {
    lastSkylineUpdateRadius = skylineRadius;
    
    // Dispose old skyline
    if (distantSkylineGroup) {
      worldRoot.remove(distantSkylineGroup);
      // ... dispose geometries and materials ...
    }
    
    // Create new expanded skyline
    distantSkylineGroup = createExpandedDistantSkyline(skylineRadius);
    worldRoot.add(distantSkylineGroup);
    console.log(`📍 Expanded distant skyline to ${skylineRadius}m radius`);
  }
}
```

Called from `loadChunk()` after each chunk loads (line 2307).

### Result
- Distant city always stays just beyond reach
- Skyline expands as player explores
- No visible gaps between loaded chunks and distant buildings
- Building density scales with radius for consistent appearance
- Efficient: Only rebuilds when radius changes by >100m
- Console logs show: `📍 Expanded distant skyline to XXXm radius`

---

## Files Modified

**`scale-ultra.html`:**
- **Lines 6527-6541**: Rocket yaw controls fix
- **Lines 9497-9575**: Pluck mode material restoration fix
- **Lines 2271-2395**: Dynamic skyline expansion system
  - Added `distantSkylineGroup` and `lastSkylineUpdateRadius` tracking
  - Added `updateDistantSkylineRadius()` function
  - Added `createExpandedDistantSkyline(radius)` function
  - Modified `loadChunk()` to call expansion update

---

## Testing Recommendations

1. **Rocket Controls**:
   - Enter rocket mode (`B` key)
   - View from various angles (top, bottom, sides)
   - Press A/D - should always yaw left/right, never twist
   - W/S should pitch forward/back regardless of camera angle

2. **Pluck Mode Materials**:
   - Enable viewport frame (`V` key)
   - Toggle pluck mode
   - Move viewport over pedestrians - should see yellow highlight
   - Move viewport away - pedestrians should restore to original colors
   - Pluck pedestrian into jar - should maintain colors while shrinking

3. **Dynamic Skyline**:
   - Walk/run in one direction
   - Watch console for "Loaded chunk" messages
   - Every few chunks, should see `📍 Expanded distant skyline to XXXm radius`
   - Distant buildings should always be visible on horizon
   - No gaps between loaded area and distant city

---

## Performance Impact

- **Rocket Controls**: Zero impact (just changed rotation axis calculation)
- **Pluck Materials**: Minimal - only clones materials for highlighted objects
- **Skyline Expansion**: Efficient - only rebuilds when radius changes >100m, with proper disposal


