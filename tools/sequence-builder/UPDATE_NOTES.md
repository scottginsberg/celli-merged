# 🔄 Sequence Builder - Update Notes

## ✅ Updates Applied (Latest)

### 1. **Fixed Close Functionality** 🔧
- Close button now properly closes overlay mode
- Sends `postMessage` to parent window
- Parent window listens for close message
- ESC key also closes overlay
- Standalone mode close still works

**How it works:**
```javascript
// In builder: Send message to parent
window.parent.postMessage({ type: 'closeSequenceBuilder' }, '*');

// In parent: Listen and close
window.addEventListener('message', (event) => {
  if (event.data.type === 'closeSequenceBuilder') {
    toggleSequenceOverlay(); // Closes overlay
  }
});
```

### 2. **Live Scene Integration** 🎥
- Viewport now shows **LIVE running scene**
- Accesses `window.parent.currentScene` or `window.parent.introScene`
- Uses actual scene's THREE.js objects
- Independent viewport camera for navigation
- Falls back to sample scene if no live scene

**Detection Logic:**
```javascript
getLiveScene() {
  // Try parent window
  if (window.parent.currentScene) {
    return {
      scene: parentScene.scene,
      camera: parentScene.camera,
      renderer: parentScene.renderer,
      sceneObject: parentScene
    };
  }
  // Try opener window
  if (window.opener.currentScene) { ... }
  // Fallback to sample
  return null;
}
```

**Benefits:**
- See actual scene while editing
- Real-time preview of changes
- No need to switch windows
- Full 3D navigation

### 3. **Auto-Construct Sequence Nodes** 📊
- **Automatically parses scene** for sequence data
- **Extracts timing from introCfg** (if exists)
- **Renders visual nodes** on timeline
- **Color-coded by type**: animation, effect, transition, text, sound
- Click nodes to inspect properties

**Extracted Data:**
- `introCfg` phases (roll, bounce, triangle, etc.)
- `motionCfg` settings
- `sequence` property arrays
- Falls back to sample nodes

**Visual Timeline:**
```
Roll Phase    Bounce      Triangle    Orbit    Normal    Venn
[─────────]──[──────]───[────────]──[─────]──[──────]──[────]
0s          2.5s       4.5s        7.5s     9.5s      15.5s
```

**Node Types:**
- 🔵 **Animation** - Blue gradient
- 🔴 **Effect** - Red gradient  
- 🟠 **Transition** - Orange gradient
- 🟢 **Text** - Green gradient
- 🟣 **Sound** - Purple gradient

### 4. **Refresh Button** 🔄
- Added "🔄 Refresh Nodes" button
- Re-extracts sequence from live scene
- Updates timeline visualization
- Useful when scene changes

---

## 🎮 How to Use

### Open Builder
1. Press `\` in main app (overlay mode)
2. Or click "🎬 Sequence Builder" button (standalone)

### View Live Scene
- Viewport automatically shows running scene
- If in overlay: sees parent scene
- If standalone: shows sample scene
- Use mouse to navigate:
  - Left drag: Rotate
  - Right drag: Pan
  - Scroll: Zoom

### View Sequence Nodes
1. Open builder while scene is running
2. Timeline automatically shows extracted nodes
3. Color-coded by type
4. Click node to inspect
5. Shows timing and duration

### Refresh Nodes
- Click "🔄 Refresh Nodes" button
- Re-extracts from current scene state
- Updates timeline display

### Close Builder
- Click "✕ Close" button
- Or press `\` again
- Or press `ESC`
- Returns to main app

---

## 🔍 Technical Details

### Live Scene Access

**Priority Order:**
1. `window.parent.currentScene` (overlay mode)
2. `window.parent.introScene` (overlay mode)
3. `window.opener.currentScene` (standalone)
4. `window.opener.introScene` (standalone)
5. Fallback to sample scene

**Viewport Setup:**
- Uses scene's actual `scene`, `camera`, `renderer`
- Creates separate `viewportRenderer` for builder canvas
- Clones `camera` to `viewportCamera` for independent control
- OrbitControls attached to `viewportCamera`

**Why separate renderer?**
- Prevents interfering with main scene rendering
- Allows independent canvas size
- Enables resizing without affecting main scene

### Node Extraction

**From introCfg:**
```javascript
if (sceneObj.introCfg) {
  const cfg = sceneObj.introCfg;
  // Extract timing data
  nodes.push({
    name: 'Roll Phase',
    time: 0,
    duration: cfg.rollEnd,
    type: 'animation'
  });
  // ... more phases
}
```

**From sequence property:**
```javascript
if (sceneObj.sequence && Array.isArray(sceneObj.sequence)) {
  sceneObj.sequence.forEach(seq => {
    nodes.push({
      name: seq.name,
      time: seq.time,
      duration: seq.duration,
      type: seq.type
    });
  });
}
```

**Rendering:**
- Positioned at `time * 50px` (50px per second)
- Width based on `duration * 50px`
- Stacked vertically (5 rows max, then wraps)
- Clickable for inspection

---

## 📊 Scene Data Structure

### What's Extracted

**From IntroSceneComplete:**
```javascript
{
  introCfg: {
    rollEnd: 2.5,
    bounceEnd: 4.5,
    triangleEnd: 7.5,
    transitionEnd: 9.5,
    normalEnd: 15.5,
    vennEnd: 18.0,
    collapseEnd: 22.0,
    glitchEnd: 24.5,
    blackoutEnd: 26.0,
    loomworksEnd: 30.0,
    celliEnd: 36.0,
    doorwayEnd: 44.0
  }
}
```

**Generates Nodes:**
- Roll Phase: 0s - 2.5s
- Bounce Phase: 2.5s - 4.5s
- Triangle Form: 4.5s - 7.5s
- Orbit Transition: 7.5s - 9.5s
- Normal Mode: 9.5s - 15.5s
- Venn Diagram: 15.5s - 18.0s
- Collapse: 18.0s - 22.0s
- Glitch Effect: 22.0s - 24.5s
- Blackout: 24.5s - 26.0s
- Loomworks Text: 26.0s - 30.0s
- CELLI Voxel: 30.0s - 36.0s
- Doorway Portal: 36.0s - 44.0s

**Total Timeline:** 44 seconds

---

## 🎯 Benefits

### Live Scene View
- ✅ See actual running scene
- ✅ No switching windows
- ✅ Real-time updates
- ✅ Full 3D navigation

### Auto Node Construction
- ✅ Instant visualization
- ✅ No manual entry
- ✅ Accurate timing
- ✅ Easy inspection

### Improved Workflow
- ✅ Open builder with `\`
- ✅ See live scene + nodes
- ✅ Edit dialogues
- ✅ Close with `\` or ESC
- ✅ Back to scene instantly

---

## 🐛 Troubleshooting

### Live Scene Not Showing
**Problem**: Viewport shows sample cube instead of live scene

**Solutions:**
- Ensure scene is running before opening builder
- Check console for "Using live scene" message
- Verify `currentScene` or `introScene` exists on parent window
- Try refreshing builder

### Nodes Not Appearing
**Problem**: Timeline empty or shows sample nodes

**Solutions:**
- Click "🔄 Refresh Nodes" button
- Ensure scene has `introCfg` or `sequence` property
- Check console for "Rendered X sequence nodes" message
- Verify scene is accessible from builder

### Close Button Not Working
**Problem**: Builder doesn't close when clicking X

**Solutions:**
- Check browser console for errors
- Try pressing `\` or `ESC` instead
- Verify in overlay mode (not standalone window)
- Refresh main page if issue persists

---

## ✅ Testing Checklist

- [x] Close button sends message to parent
- [x] Parent receives and handles close message
- [x] ESC key closes overlay
- [x] Live scene displays in viewport
- [x] Viewport camera navigates independently
- [x] Sequence nodes extracted from introCfg
- [x] Nodes rendered on timeline
- [x] Nodes color-coded by type
- [x] Click node shows inspector
- [x] Refresh button re-extracts nodes
- [x] Fallback to sample if no live scene

---

## 📝 Code Changes

### Files Modified

1. **`tools/sequence-builder/index.html`**
   - Lines 899-1010: Added `getLiveScene()` method
   - Lines 1012-1024: Updated `animate()` for viewport camera
   - Lines 1577-1588: Added close message posting
   - Lines 1603-1738: Added `_extractSequenceNodes()` and rendering
   - Lines 463-494: Added node styling
   - Line 842-845: Updated timeline HTML

2. **`index.html`**
   - Lines 539-546: Added message listener for close

---

## 🚀 Next Steps

### Potential Enhancements
- [ ] Make nodes draggable to adjust timing
- [ ] Add connection lines between nodes
- [ ] Export nodes as JSON
- [ ] Import node sequences
- [ ] Edit node properties (not readonly)
- [ ] Add/delete nodes manually
- [ ] Snap nodes to grid
- [ ] Multi-track node layout

---

**All updates complete and tested! Press `\` to see live scene with auto-constructed sequence nodes.** 🎬✨

