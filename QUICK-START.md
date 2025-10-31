# 🚀 Pockit Tools - Quick Start Guide

## ✅ Integration Complete!

All tools are now unified and accessible through a central hub.

## How to Start

Run either:
```batch
START.bat
```
or
```batch
start-server.bat
```

This will:
1. Start HTTP server on **port 3000**
2. Open the **Tools Hub** in your browser

## Available Tools

### 🌐 **Tools Hub** 
**URL**: http://localhost:3000/index-tools.html

Central landing page with links to all tools:

| Tool | URL | Description |
|------|-----|-------------|
| **🌍 Scale Ultra** | http://localhost:3000/scale-ultra.html | Main Pockit application with full physics |
| **🎨 Asset Evaluator** | http://localhost:3000/asset-evaluator.html | AI-powered geometry analyzer (Q/E navigation) |
| **🏠 Room Builder** | http://localhost:3000/interiors.html | Interior design system (Studio/1BR/2BR) |
| **📖 Narrative Builder** | http://localhost:3000/narrative-demo.html | Procedural story/mystery generator |
| **🎬 Sequence Builder** | http://localhost:3000/sequence-builder.html | Cinematic composer |
| **🔨 Standalone Builder** | http://localhost:3000/builder.html | Bundle tool for single-file builds |

## What's Wired Together

### ✅ Scale Ultra Integration
`scale-ultra.html` now has access to:
- **Asset Registry** - Shared 3D asset system
- **Room Builder** - Interiors system modules
- **Narrative Builder** - Procedural story system
- **Giant Finger** - Interactive physics system

### ✅ Asset Registry
- **Location**: `./js/assets/asset-registry.js`
- **Categories**: 18+ asset categories (furniture, kitchen, bathroom, etc.)
- **Accessible from**: All tools including Asset Evaluator

```javascript
// In Scale Ultra (globally available):
window.assetRegistry.getAvailableAssets();
window.assetRegistry.getAssetMetadata('asset-id');
window.assetRegistry.createAsset('asset-id', spec, THREE, context);
```

### ✅ Room Builder
- **Location**: `interiors.html`
- **Modules**: 
  - `js/interiors-constants.js` - Asset specs & configs
  - `js/interiors-main.js` - Core functionality
  - `js/interiors-ui.js` - UI controls
- **Features**: Wall placement, furniture, doors, windows

## Quick Tips

1. **Asset Evaluator**: Use **Q** (previous) and **E** (next) to navigate assets
2. **Room Builder**: Use **1/2/3** keys for different apartment sizes
3. **All tools share the same asset registry** - changes propagate everywhere!

## Files Modified/Created

### ✅ Created:
- `index-tools.html` - Tools Hub landing page
- `START.bat` - Simplified startup script
- `TOOLS-INTEGRATION.md` - Detailed integration docs
- `QUICK-START.md` - This file

### ✅ Modified:
- `start-server.bat` - Updated to port 3000, opens Tools Hub
- `scale-ultra.html` - Added asset registry + narrative-builder imports

## Verification

All required files confirmed present:
```
✓ index-tools.html exists
✓ asset-evaluator.html exists
✓ interiors.html exists
✓ scale-ultra.html exists
✓ narrative-builder.js exists
✓ START.bat exists
✓ start-server.bat exists
✓ Asset registry exists
✓ Interiors system modules exist
```

## Next Steps

1. **Start the server**: Run `START.bat`
2. **Visit Tools Hub**: http://localhost:3000/index-tools.html
3. **Explore tools**: Everything is connected and ready to use!

---

**Status**: ✅ Fully Integrated  
**Port**: 3000  
**Date**: 2025-10-27

