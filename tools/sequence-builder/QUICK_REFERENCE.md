# 🎬 Sequence Builder - Quick Reference

## 🚀 Quick Start

### Open Builder
```
Press \ (backslash) anywhere in main app
```

### Close Builder
```
Press \ or ESC or click "✕ Close"
```

---

## 🎥 Live Scene Viewport

**Location**: Center-left panel

**What You See**: 
- Actual running scene (not sample)
- Real THREE.js objects
- Live updates

**Controls**:
- **Left Drag**: Rotate camera
- **Right Drag**: Pan view
- **Scroll**: Zoom in/out
- **Render**: Normal view
- **Wireframe**: Toggle wireframe
- **Reset**: Reset camera

---

## 📊 Auto-Constructed Nodes

**Location**: Timeline tab (center-right panel)

**What You See**:
- Visual blocks for each sequence phase
- Color-coded by type
- Positioned by timing

**Node Types**:
- 🔵 **Blue** = Animation
- 🔴 **Red** = Effect
- 🟠 **Orange** = Transition
- 🟢 **Green** = Text
- 🟣 **Purple** = Sound

**Example** (IntroSceneComplete):
```
Roll → Bounce → Triangle → Orbit → Normal → Venn → Collapse
[───][──────][────────][─────][──────][────][───────]
0s   2.5s    4.5s      7.5s   9.5s    15.5s 18.0s

Glitch → Blackout → Loomworks → CELLI → Doorway
[─────][────────][─────────][──────][───────]
22.0s  24.5s     26.0s      30.0s   36.0s    44.0s
```

**Actions**:
- **Click node**: View details in inspector
- **Refresh**: Click "🔄 Refresh Nodes" button

---

## 🎮 Common Workflows

### View Scene Sequence
1. Start a scene (e.g., intro)
2. Press `\`
3. Look at Timeline tab
4. See all sequence phases as nodes

### Navigate Scene in 3D
1. Open builder
2. Go to viewport (center-left)
3. Drag to rotate scene
4. Right-drag to pan
5. Scroll to zoom

### Edit Dialogues
1. Switch to Dialogue tab
2. Click "➕ Add"
3. Edit properties
4. Click "💾 Save Changes"

### Close and Return
1. Press `\` or ESC
2. OR click "✕ Close"
3. Returns to main scene

---

## 📋 Buttons

| Button | Action |
|--------|--------|
| 🔍 Analyze | Re-analyze scene assets |
| 🔄 Refresh Nodes | Re-extract sequence nodes |
| 💾 Export | Export dialogues as JSON |
| 📂 Import | Import dialogue sequences |
| ✕ Close | Close builder (sends message to parent) |

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `\` | Toggle builder |
| `ESC` | Close builder |
| `Ctrl+S` | Export data |
| `Ctrl+C` | Copy code |

---

## 🎨 Panel Layout

```
┌─────────────────────────────────────────────┐
│ Header: Buttons                             │
├──────┬─────────────┬──────────┬─────────────┤
│      │             │          │             │
│Asset │   LIVE      │Timeline/ │  Inspector  │
│Mgr   │   SCENE     │Dialogue  │             │
│      │  (3D View)  │          │             │
│      │ [Viewport]  │ [Nodes]  │[Properties] │
│      │             │          │             │
├──────┴─────────────┴──────────┴─────────────┤
│           Code Preview / Export              │
└─────────────────────────────────────────────┘
```

---

## 🔍 Inspector Shows

**When Node Selected**:
- Name
- Type (animation/effect/etc)
- Start Time (seconds)
- Duration (seconds)

**When Dialogue Selected**:
- Speaker
- Text
- Display target
- Timestamp
- Duration

**When Asset Selected**:
- Asset name
- Type
- Line number
- Import source

---

## 🎯 Tips

### View Live Scene
- ✅ Open builder while scene is running
- ✅ Viewport shows actual scene
- ✅ Navigate freely without affecting main view

### See Sequence Structure
- ✅ Timeline auto-populates from scene
- ✅ All phases shown as colored blocks
- ✅ Click to inspect details

### Quick Edits
- ✅ Press `\` to open
- ✅ Make changes
- ✅ Press `\` to close
- ✅ Instant return

### Refresh When Needed
- ✅ Scene changed? Click "🔄 Refresh Nodes"
- ✅ Assets updated? Click "🔍 Analyze"
- ✅ New dialogue? Click "➕ Add"

---

## 🐛 Troubleshooting

### Builder Won't Close
- Try: Press `ESC`
- Try: Press `\`
- Check: Browser console for errors

### No Live Scene
- Check: Scene is running first
- Try: Click "Refresh Nodes"
- Verify: In overlay mode (not standalone)

### No Sequence Nodes
- Check: Scene has `introCfg` or `sequence` property
- Try: Click "🔄 Refresh Nodes"
- Verify: Console shows "Rendered X nodes"

---

## ✅ Quick Checklist

**Starting**:
- [ ] Open main app
- [ ] Start a scene
- [ ] Press `\`
- [ ] Builder opens

**Working**:
- [ ] See live scene in viewport
- [ ] See sequence nodes in timeline
- [ ] Navigate 3D scene
- [ ] Edit dialogues if needed

**Closing**:
- [ ] Press `\` or ESC
- [ ] Builder closes
- [ ] Returns to scene
- [ ] Scene continues running

---

**Press `\` to begin!** 🚀

