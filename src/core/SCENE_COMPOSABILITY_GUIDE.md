## Scene Composability Guide
# Making Scenes Compatible with Sequence Builder

## Overview

All componentized scenes should follow the BaseScene pattern for automatic sequence extraction by the Sequence Builder.

## Quick Start

### 1. Extend BaseScene

```javascript
import { BaseScene } from '../core/BaseScene.js';

export class MyScene extends BaseScene {
  constructor() {
    super();  // Initializes timing, motion, events structures
    
    this.sequenceMetadata = {
      name: 'My Scene',
      version: '1.0.0',
      description: 'Scene description'
    };
    
    this.defineSequence();
  }
  
  defineSequence() {
    // Register phases, dialogues, events
  }
}
```

### 2. Register Timing Phases

```javascript
defineSequence() {
  // Register each animation/transition phase
  this.registerPhase('Phase Name', startTime, endTime, 'type');
  
  // Example:
  this.registerPhase('Intro Animation', 0, 2.5, 'animation');
  this.registerPhase('Camera Zoom', 2.5, 4.0, 'transition');
  this.registerPhase('Main Sequence', 4.0, 10.0, 'animation');
}
```

**Phase Types:**
- `'animation'` - Yellow
- `'transition'` - Yellow  
- `'event'` - Orange
- `'dialogue'` - Magenta
- `'delay'` - Yellow

### 3. Register Dialogues

```javascript
this.registerDialogue(speaker, text, timestamp, display);

// Examples:
this.registerDialogue('System', 'Initializing...', 0.5, 'terminal');
this.registerDialogue('Narrator', 'Watch closely', 3.0, 'subtitle');
this.registerDialogue('CELLI', 'Hello World', 5.0, 'notepad');
```

**Display Types:** `'terminal'`, `'subtitle'`, `'notepad'`, `'popup'`

### 4. Register Motion Parameters

```javascript
this.registerMotion(category, key, config);

// Examples:
this.registerMotion('camera', 'flyIn', {
  from: { x: 0, y: 10, z: 20 },
  to: { x: 5, y: 3, z: 8 },
  duration: 3.0
});

this.registerMotion('objects', 'cubeRotate', {
  target: 'mainCube',
  rotation: { y: Math.PI * 2 },
  duration: 5.0
});
```

### 5. Register Events

```javascript
this.registerEvent(name, timestamp, action);

// Examples:
this.registerEvent('glitchStart', 5.0, 'activateGlitchEffect');
this.registerEvent('explosionTrigger', 7.5, 'triggerExplosion');
```

## Data Structures

### timing.phases
```javascript
{
  name: 'Phase Name',
  start: 0,
  end: 3.5,
  type: 'animation',
  duration: 3.5  // Calculated automatically
}
```

### events.dialogues
```javascript
{
  speaker: 'Character Name',
  text: 'Dialogue content',
  timestamp: 2.5,
  display: 'subtitle'
}
```

### motion[category]
```javascript
{
  [key]: {
    // Any motion configuration data
    from: { ... },
    to: { ... },
    duration: 3.0,
    easing: 'easeInOut'
  }
}
```

## Retrofitting Existing Scenes

### Option A: Add Composable Data Alongside Existing Code

```javascript
export class IntroSceneComplete {
  constructor() {
    // Existing code...
    this.introCfg = { ... };
    
    // NEW: Add composable structure
    this.timing = {
      phases: [
        { name: 'Roll Phase', start: 0, end: this.introCfg.rollEnd, type: 'animation', duration: this.introCfg.rollEnd },
        { name: 'Bounce Phase', start: this.introCfg.rollEnd, end: this.introCfg.bounceEnd, type: 'animation', duration: this.introCfg.bounceEnd - this.introCfg.rollEnd },
        // ... etc
      ],
      duration: this.introCfg.doorwayEnd
    };
  }
}
```

### Option B: Use Helper Method

```javascript
export class IntroSceneComplete {
  constructor() {
    this.introCfg = {
      rollEnd: 3.0,
      bounceEnd: 6.0,
      triangleEnd: 9.0,
      // ... etc
    };
    
    // Convert introCfg to composable format
    this.timing = this.convertIntroCfgToTiming();
  }
  
  convertIntroCfgToTiming() {
    return {
      phases: [
        { name: 'Roll Phase', start: 0, end: this.introCfg.rollEnd, type: 'animation', duration: this.introCfg.rollEnd },
        { name: 'Bounce Phase', start: this.introCfg.rollEnd, end: this.introCfg.bounceEnd, type: 'animation', duration: this.introCfg.bounceEnd - this.introCfg.rollEnd },
        { name: 'Triangle Form', start: this.introCfg.bounceEnd, end: this.introCfg.triangleEnd, type: 'animation', duration: this.introCfg.triangleEnd - this.introCfg.bounceEnd },
        // ... etc
      ],
      duration: this.introCfg.doorwayEnd || 0
    };
  }
}
```

### Option C: Extend BaseScene (Full Refactor)

```javascript
import { BaseScene } from '../core/BaseScene.js';

export class IntroSceneComplete extends BaseScene {
  constructor() {
    super();
    
    this.sequenceMetadata = {
      name: 'Intro Scene Complete',
      version: '5.7',
      description: 'Complete intro sequence with all phases'
    };
    
    // Define sequence using helper methods
    this.registerPhase('Roll Phase', 0, 3.0, 'animation');
    this.registerPhase('Bounce Phase', 3.0, 6.0, 'animation');
    this.registerPhase('Triangle Form', 6.0, 9.0, 'animation');
    // ... etc
    
    this.registerDialogue('System', 'LOOMWORKS', 18.0, 'terminal');
    // ... etc
  }
}
```

## Backward Compatibility

The Sequence Builder checks for data in this order:

1. **NEW: `timing.phases`** - Composable structure
2. **OLD: `introCfg`** - Legacy format (auto-converted)
3. **NEW: `motion`** - Composable motion data
4. **OLD: `motionCfg`** - Legacy format
5. **NEW: `events.dialogues`** - Composable dialogues
6. **Both: `sequence`** - Universal array format

This means you can:
- ✅ Add new structure alongside old (both work)
- ✅ Keep old format (still extracts)
- ✅ Gradually migrate to new format
- ✅ Mix and match formats

## Sequence Builder Benefits

When scenes follow this pattern:

✅ **Auto-Ingest** - One click extracts full sequence  
✅ **Visual Timeline** - See all phases at a glance  
✅ **Node Graph** - Connected flow diagram  
✅ **Dialogue Cards** - All dialogue events visible  
✅ **Motion Parameters** - Inspectable parameter nodes  
✅ **Event Triggers** - Time-based event visualization  

## Example: Retrofitting IntroSceneComplete

### Minimal Addition (in constructor)

```javascript
constructor() {
  // ... existing introCfg setup ...
  
  // Add this at the end:
  this.timing = {
    phases: Object.keys(this.introCfg).map((key, i, arr) => {
      const name = key.replace(/End$/, '').replace(/([A-Z])/g, ' $1').trim();
      const end = this.introCfg[key];
      const start = i > 0 ? this.introCfg[arr[i-1]] : 0;
      return {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        start,
        end,
        type: name.includes('transition') ? 'transition' : 
              name.includes('glitch') ? 'event' : 'animation',
        duration: end - start
      };
    }).filter(p => p.duration > 0)
  };
}
```

This automatically converts any `introCfg` to the composable format!

## Helper: Auto-Convert Legacy Scenes

```javascript
// Add this method to any legacy scene
addSequenceBuilderCompatibility() {
  if (this.introCfg && !this.timing) {
    this.timing = {
      phases: Object.entries(this.introCfg)
        .sort((a, b) => a[1] - b[1])
        .map((entry, i, arr) => {
          const [key, endTime] = entry;
          const startTime = i > 0 ? arr[i-1][1] : 0;
          const name = key.replace(/End$/, '').replace(/([A-Z])/g, ' $1').trim();
          
          return {
            name: name.charAt(0).toUpperCase() + name.slice(1),
            start: startTime,
            end: endTime,
            type: this.getPhaseType(name),
            duration: endTime - startTime
          };
        }).filter(p => p.duration > 0),
      duration: Math.max(...Object.values(this.introCfg))
    };
  }
  
  if (this.motionCfg && !this.motion) {
    this.motion = { ...this.motionCfg };
  }
}

getPhaseType(phaseName) {
  const name = phaseName.toLowerCase();
  if (name.includes('transition') || name.includes('orbit')) return 'transition';
  if (name.includes('glitch') || name.includes('collapse')) return 'event';
  if (name.includes('text') || name.includes('loomworks')) return 'dialogue';
  return 'animation';
}
```

Then call it at the end of constructor:
```javascript
constructor() {
  // ... all existing code ...
  
  // Add sequence builder compatibility
  this.addSequenceBuilderCompatibility();
}
```

## Testing

1. Add the composable structure to your scene
2. Run the scene in main app
3. Open Sequence Builder (press `\`)
4. Click "Auto-Ingest"
5. Check console for: `✅ Found timing.phases:`
6. See nodes appear in Node Graph tab

## Migration Checklist

For each componentized scene:

- [ ] Add `timing.phases` structure
- [ ] Add `motion` parameters (if applicable)
- [ ] Add `events.dialogues` (if applicable)
- [ ] Add `events.triggers` (if applicable)
- [ ] Set `sequenceMetadata` (name, version, description)
- [ ] Test with Sequence Builder auto-ingest
- [ ] Verify nodes appear correctly
- [ ] Check node connections are logical

## Scene Standards

### File naming:
- `SceneName-Modular.js` or `SceneName-Full.js` for componentized
- `SceneName-Faithful.js` or `SceneName-Template.js` for legacy

### Exports:
```javascript
export class SceneName extends BaseScene {
  // ... implementation
}

// Also export a pre-configured instance if needed
export const sceneNameInstance = new SceneName();
```

### Documentation:
Add a comment block at the top:
```javascript
/**
 * SceneName - Description
 * 
 * Sequence Builder Compatible: ✅
 * Phases: X
 * Duration: Xs
 * Dialogues: X
 * Events: X
 */
```

