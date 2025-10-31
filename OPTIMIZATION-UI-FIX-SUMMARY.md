# Optimization UI Wiring Fix

## Problem
The optimization panel UI was created but not properly wired - toggles and sliders updated config values, but the rendering system didn't respect those values. Sills would render even when fully disabled.

## Solution

### 1. **Window and Sill Rendering Checks** (`addWindow` function, lines 3852-3923)
   - Added checks for `optimizationConfig.windows.enabled` before creating windows
   - Added checks for `optimizationConfig.sills.enabled` before creating sills
   - Added max count limits for both (`optimizationConfig.windows.maxCount`, `optimizationConfig.sills.maxCount`)
   - Implemented counter tracking (`currentCount`) to enforce limits
   - Windows and sills now only render if enabled AND under max count

### 2. **Counter Reset on Rebuild** (lines 19003-19009)
   - When clicking "Apply & Rebuild", all `currentCount` values are reset to 0
   - This ensures accurate counting when regenerating the city

### 3. **Real-time Visibility Control** (lines 19596-19605, in `animate` loop)
   - Added visibility toggling for instanced meshes every frame
   - Windows, sills, and pedestrians LOD meshes now respect enabled flags immediately
   - Toggling OFF hides the instanced mesh, toggling ON shows it
   - This provides instant feedback without requiring a rebuild

### 4. **Proper UI Initialization** (`setupUI` function, lines 18889-19025)
   - All toggle buttons now initialize from `optimizationConfig` values on startup
   - All sliders initialize with correct values from config
   - Fixed event listeners to properly set config values
   - Added comprehensive console logging for all UI interactions:
     - Toggle changes (e.g., "🪟 Windows: ON/OFF")
     - Slider changes (e.g., "🏛️ Sills max: 15000")
     - Apply button with detailed step-by-step progress

## Features Now Working

### Immediate Effects (No Rebuild Required)
- **Toggle Windows ON/OFF**: Instantly shows/hides all windows via instanced mesh visibility
- **Toggle Sills ON/OFF**: Instantly shows/hides all sills via instanced mesh visibility  
- **Toggle Pedestrians ON/OFF**: Instantly shows/hides all pedestrian LODs via instanced mesh visibility
- **Toggle Grass ON/OFF**: Instantly enables/disables grass blades (existing functionality)

### Rebuild Required (Click "Apply & Rebuild")
- **Adjust Max Counts**: Changing slider values for windows, sills, pedestrians, or grass
- **Adjust Skyline Density**: Changing the distant city density multiplier
- **Rebuild Process**:
  1. Resets all counters
  2. Rebuilds instanced managers with new limits
  3. Clears and reloads city chunks
  4. Rebuilds distant skyline with new density
  5. Rebuilds planetoid skyline if in rocket mode
  6. Logs final counts to console

## Console Feedback

All interactions now log clearly:
```
🎮 Setting up UI...
🔧 Initializing optimization controls...
✅ UI setup complete
🪟 Windows: OFF
🏛️ Sills max: 15000
🔧 Applying optimization settings and rebuilding...
  → Resetting counters...
  → Rebuilding instanced managers...
  → Clearing city chunks...
  → Rebuilding distant skyline...
  → Reloading chunks...
✅ Optimization applied successfully!
Final counts - Windows: 4823, Sills: 0
```

## Testing
1. Open browser console
2. Toggle "Window Sills" OFF - sills should disappear immediately
3. Toggle "Windows" OFF - windows should disappear immediately
4. Adjust "Max Count" sliders - see values update in UI
5. Click "Apply & Rebuild" - watch console for progress
6. Verify new limits are respected (check final counts in console)

## Performance Impact
- **Toggles**: Near-zero overhead (single visibility check per frame per instanced mesh)
- **Max Counts**: Reduces draw calls and geometry creation during chunk generation
- **Skyline Density**: Higher density = more distant buildings for depth, with minimal performance impact (instanced + LOD)


