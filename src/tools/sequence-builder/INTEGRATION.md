# Sequence Builder Integration Guide

## Global Exposure in Main App

The main `index.html` now exposes the following globally for the Sequence Builder:

### Functions

```javascript
// Exposed in index.html after line 940
window.transitionToScene = transitionToScene;
window.getSceneByName = function(sceneName) { ... };
window.getScenes = getScenes;
```

### Objects

```javascript
// Updated when scenes load
window.currentScene = currentScene;  // Current running scene instance
window.introScene = introScene;      // Intro scene instance (when intro plays)
window.scenes = scenes;              // Scene registry object
```

## Scene Name Mapping

The sequence builder uses full class names while the main app uses short keys:

| Sequence Builder Name | Main App Key |
|----------------------|--------------|
| IntroSceneComplete   | intro        |
| VisiCalcScene        | visicell     |
| CelliRealScene       | cellireal    |
| FullhandScene        | fullhand     |
| End3Scene            | end3         |
| CityScene            | theos        |
| LeaveScene           | leave        |

## Usage from Sequence Builder

### Get Current Scene
```javascript
// From parent window
const scene = window.parent.currentScene || window.parent.introScene;

// From opener window
const scene = window.opener.currentScene || window.opener.introScene;
```

### Get Specific Scene Class
```javascript
// Using helper function
const SceneClass = window.parent.getSceneByName('IntroSceneComplete');

// Direct from registry
const SceneClass = window.parent.scenes['intro'];
```

### Switch to Different Scene
```javascript
// Using the mapped key
await window.parent.transitionToScene('intro');  // Not 'IntroSceneComplete'

// Or use the SequenceBuilderCore helper (handles mapping automatically)
await window.sequenceBuilder.transitionToScene('IntroSceneComplete');
```

## Auto-Ingest Flow

1. User selects scene from dropdown (e.g., "IntroSceneComplete")
2. Clicks "Auto-Ingest" button
3. System checks for scene instance:
   - `window.parent.currentScene` (if currently running)
   - `window.parent.introScene` (if intro is running)
   - `window.parent.getSceneByName('IntroSceneComplete')` (gets class from registry)
4. If not found or is a class (not instance):
   - Offers to switch to scene
   - Calls `window.parent.transitionToScene('intro')`
   - Waits for scene to load
5. Once scene is running, ingests data from:
   - `scene.introCfg` - timing configuration
   - `scene.motionCfg` - motion parameters
   - `scene.sequence` - sequence array
6. Creates nodes and connections automatically

## Scene Instance Requirements

For a scene to be properly ingested, it must have:

```javascript
class MyScene {
  constructor() {
    // Optional: timing configuration
    this.introCfg = {
      rollEnd: 2.0,
      bounceEnd: 4.0,
      // ... etc
    };
    
    // Optional: motion configuration
    this.motionCfg = {
      cameraMove: { ... },
      objectRotate: { ... }
    };
    
    // Optional: sequence array
    this.sequence = [
      { name: 'Phase 1', type: 'animation', startTime: 0, duration: 2.0 },
      { name: 'Phase 2', type: 'transition', startTime: 2.0, duration: 1.5 }
    ];
  }
}
```

## Debugging

### Check if transitionToScene is available:
```javascript
console.log('transitionToScene available:', !!window.parent?.transitionToScene);
```

### Check if currentScene is available:
```javascript
console.log('currentScene:', window.parent?.currentScene?.constructor?.name);
```

### List all available scenes:
```javascript
console.log('Available scenes:', Object.keys(window.parent?.scenes || {}));
```

### Get scene by name:
```javascript
const scene = window.parent?.getSceneByName?.('IntroSceneComplete');
console.log('Found scene:', scene);
```

## Error Messages Explained

### "Could not switch to scene"
- Main app not running in parent/opener window
- `transitionToScene` function not exposed
- Scene key not in registry

**Fix**: Make sure you opened the sequence builder from the main app (press `\` key)

### "Scene not currently running"
- The selected scene is a class, not an instance
- No scene is currently active

**Fix**: Use the "Switch" button to load the scene first

### "Could not find scene object"
- Scene doesn't exist in any accessible scope
- Wrong scene name in dropdown

**Fix**: Check console to see available scenes, ensure main app is running

## Best Practices

1. **Always open from main app**: Press `\` from any running scene
2. **Check current scene first**: See what's in the scene badge before ingesting
3. **Use Switch button**: Load scenes before trying to ingest them
4. **Check console**: Detailed logging shows exactly what's happening
5. **Wait for scenes**: After switching, wait 1-2 seconds for scene to initialize

## Common Workflows

### Workflow A: Ingest Current Scene
1. Open sequence builder (press `\`)
2. Leave dropdown on "Current Scene"
3. Click "Auto-Ingest"
4. Confirm dialog

### Workflow B: Ingest Different Scene
1. Open sequence builder (press `\`)
2. Select scene from dropdown (e.g., "Intro Scene")
3. Click "Switch" button
4. Wait for scene to load
5. Click "Auto-Ingest"
6. Confirm dialog

### Workflow C: Quick Switch and Ingest
1. Open sequence builder (press `\`)
2. Select scene from dropdown
3. Click "Auto-Ingest" (will offer to switch)
4. Confirm switch
5. Wait for load
6. Click "Auto-Ingest" again

