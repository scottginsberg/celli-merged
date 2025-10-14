# Componentized Scene Templates

This folder contains standalone, self-contained HTML templates for each major scene in the Celli project. Each file can run independently without external dependencies (except CDN resources).

## Files

### 📦 cellireal-complete.html (983 KB)
Full Celli Real scene with spreadsheet interface, 3D visualization, formula engine, and all interactive features.

**Features:**
- Complete spreadsheet UI with formula highlighting
- 3D scene rendering with sprites and voxels
- Full formula engine (TRANSPOSE, ARRAY, etc.)
- Terminal and notepad narrative elements
- Crystal glass UI mode
- Touch/mobile optimized

### 📦 fullhand-complete.html (271 KB)
Integrated scene featuring voxel hand creation, keyboard, character bust, and glowing voxel head.

**Features:**
- Voxel hand progressive build animation
- Retro keyboard with god rays and atmospheric dust
- Character bust with ZSphere-based figure
- Glowing animated voxel head (bosscelli)
- Scene composer and debug tools
- Edit mode with transform gizmos

### 📦 end3-complete.html (189 KB) ⭐ NEW
End sequence scene with terminal crawl, floating voxels, and cinematic camera movement.

**Features:**
- Terminal log crawl with golden styling
- Floating voxel particles with physics
- Cable network visualization
- Bloom, DOF, and fog post-processing
- WASD camera controls
- Graphics settings panel
- Skip functionality

### 📦 intro-faithful.html (126 KB) ⭐ NEW
Intro sequence with doorway portal, quote animations, and VisiCell terminal interface.

**Features:**
- Animated doorway portal with light rays
- Quote text animations with glitch effects
- VisiCell spreadsheet-style terminal
- Terminal input with easter eggs
- Character reflection system
- 3D pixel "CELLI" formation
- Skip button with bow transformation

## Usage

Each file can be opened directly in a browser:

```bash
# Open end3 scene
start templates/componentized/end3-complete.html

# Open intro scene
start templates/componentized/intro-faithful.html

# Open celli real
start templates/componentized/cellireal-complete.html

# Open fullhand scene
start templates/componentized/fullhand-complete.html
```

Or use the live server:

```bash
# From project root
cd templates/componentized
python -m http.server 8080
# Then open http://localhost:8080/end3-complete.html
```

## Integration

These templates are designed to be:
- **Standalone**: Can run independently
- **Embeddable**: Can be loaded in iframes
- **Portable**: All dependencies from CDN
- **Self-documenting**: Complete with inline comments

## Dependencies

All scenes use CDN resources:
- THREE.js (r160) - 3D rendering
- THREE.js addons - Post-processing effects
- Google Fonts - Typography
- Twemoji - Emoji rendering
- ES Module Shims - Import map support

## Development

To modify a scene:
1. Open the HTML file in your editor
2. Scene logic is contained within `<script>` tags
3. Styles are in `<style>` tags or inline
4. Test in browser with dev tools open

## Source

Extracted from `merged2.html` using `extract-scenes.ps1`:
- Lines preserved from original source
- Functionality intact
- Performance optimized
- Mobile responsive

---

**Generated:** October 13, 2025  
**Project:** Celli Refactor  
**Version:** Componentized Templates v1.0

