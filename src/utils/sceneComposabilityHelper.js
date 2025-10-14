/**
 * Scene Composability Helper
 * Utility to make any scene compatible with Sequence Builder
 * 
 * Usage: Call makeComposable(sceneInstance) after construction
 */

/**
 * Convert introCfg to timing.phases format
 */
export function convertIntroCfgToTiming(introCfg) {
  if (!introCfg) return null;
  
  const phases = [];
  const entries = Object.entries(introCfg).sort((a, b) => a[1] - b[1]);
  
  entries.forEach(([key, endTime], i) => {
    const startTime = i > 0 ? entries[i - 1][1] : 0;
    const phaseName = key.replace(/End$/, '').replace(/([A-Z])/g, ' $1').trim();
    const duration = endTime - startTime;
    
    if (duration > 0) {
      phases.push({
        name: phaseName.charAt(0).toUpperCase() + phaseName.slice(1),
        start: startTime,
        end: endTime,
        type: getPhaseType(phaseName),
        duration
      });
    }
  });
  
  return {
    phases,
    markers: {},
    duration: Math.max(...Object.values(introCfg), 0)
  };
}

/**
 * Determine phase type from name
 */
function getPhaseType(phaseName) {
  const name = phaseName.toLowerCase();
  
  if (name.includes('transition') || name.includes('orbit') || name.includes('collapse')) {
    return 'transition';
  }
  if (name.includes('glitch') || name.includes('blackout')) {
    return 'event';
  }
  if (name.includes('text') || name.includes('loomworks') || name.includes('dialogue')) {
    return 'dialogue';
  }
  if (name.includes('delay') || name.includes('wait') || name.includes('pause')) {
    return 'delay';
  }
  
  return 'animation';
}

/**
 * Make any scene compatible with Sequence Builder
 * Call this in scene constructor or init()
 */
export function makeSceneComposable(scene, metadata = {}) {
  console.log('🔧 Making scene composable for Sequence Builder...');
  
  // Add metadata
  if (!scene.sequenceMetadata) {
    scene.sequenceMetadata = {
      name: scene.constructor.name || 'Unknown Scene',
      version: '1.0.0',
      description: 'Auto-generated sequence metadata',
      ...metadata
    };
  }
  
  // Convert introCfg to timing if present
  if (scene.introCfg && !scene.timing) {
    scene.timing = convertIntroCfgToTiming(scene.introCfg);
    console.log(`✅ Converted introCfg to timing.phases (${scene.timing.phases.length} phases)`);
  }
  
  // Ensure timing structure exists
  if (!scene.timing) {
    scene.timing = {
      phases: [],
      markers: {},
      duration: 0
    };
  }
  
  // Convert motionCfg to motion if present
  if (scene.motionCfg && !scene.motion) {
    scene.motion = {
      camera: {},
      objects: {},
      animations: {},
      ...scene.motionCfg
    };
    console.log(`✅ Wrapped motionCfg into motion structure`);
  }
  
  // Ensure motion structure exists
  if (!scene.motion) {
    scene.motion = {
      camera: {},
      objects: {},
      animations: {}
    };
  }
  
  // Ensure events structure exists
  if (!scene.events) {
    scene.events = {
      dialogues: [],
      triggers: [],
      sounds: []
    };
  }
  
  // Add helper methods if not already present
  if (!scene.registerPhase) {
    scene.registerPhase = function(name, start, end, type = 'animation') {
      this.timing.phases.push({
        name,
        start,
        end,
        type,
        duration: end - start
      });
      console.log(`📌 Registered phase: ${name}`);
    };
  }
  
  if (!scene.registerDialogue) {
    scene.registerDialogue = function(speaker, text, timestamp, display = 'subtitle') {
      this.events.dialogues.push({ speaker, text, timestamp, display });
      console.log(`💬 Registered dialogue: ${speaker} @ ${timestamp}s`);
    };
  }
  
  if (!scene.registerEvent) {
    scene.registerEvent = function(name, timestamp, action) {
      this.events.triggers.push({ name, timestamp, action });
      console.log(`⚡ Registered event: ${name} @ ${timestamp}s`);
    };
  }
  
  if (!scene.registerMotion) {
    scene.registerMotion = function(category, key, config) {
      if (!this.motion[category]) {
        this.motion[category] = {};
      }
      this.motion[category][key] = config;
      console.log(`🎬 Registered motion: ${category}.${key}`);
    };
  }
  
  if (!scene.getSequenceData) {
    scene.getSequenceData = function() {
      return {
        metadata: this.sequenceMetadata,
        timing: this.timing,
        motion: this.motion,
        events: this.events,
        sequence: this.sequence || []
      };
    };
  }
  
  console.log('✅ Scene is now composable by Sequence Builder');
  console.log(`   Phases: ${scene.timing.phases.length}`);
  console.log(`   Dialogues: ${scene.events.dialogues.length}`);
  console.log(`   Events: ${scene.events.triggers.length}`);
  
  return scene;
}

/**
 * Quick integration for existing scenes
 * Just call this in the scene file's constructor
 */
export function quickComposable(scene) {
  return makeSceneComposable(scene);
}

