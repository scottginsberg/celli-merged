/**
 * Add Composability to Running Scene
 * 
 * Utility to patch a running scene instance with composable data
 * so it can be immediately ingested by Sequence Builder
 * 
 * Usage in browser console:
 * 
 *   // Copy-paste this entire file into console, then:
 *   addComposabilityToRunningScene(window.introScene);
 *   
 *   // Or for current scene:
 *   addComposabilityToRunningScene(window.currentScene);
 *   
 *   // Then in Sequence Builder, click "Auto-Ingest"
 */

export function addComposabilityToRunningScene(scene) {
  if (!scene) {
    console.error('❌ No scene provided');
    return false;
  }
  
  console.log('🔧 Adding composability to running scene...');
  console.log('Scene:', scene.constructor.name);
  console.log('Current properties:', Object.keys(scene));
  
  // Add metadata if missing
  if (!scene.sequenceMetadata) {
    scene.sequenceMetadata = {
      name: scene.constructor.name || 'Unknown Scene',
      version: '1.0.0',
      description: 'Runtime-patched for Sequence Builder compatibility',
      patchedAt: Date.now()
    };
    console.log('✅ Added sequenceMetadata');
  }
  
  // Convert introCfg to timing.phases
  if (scene.introCfg && !scene.timing) {
    console.log('🔄 Converting introCfg to timing.phases...');
    
    const phases = [];
    const entries = Object.entries(scene.introCfg).sort((a, b) => a[1] - b[1]);
    
    entries.forEach(([key, endTime], i) => {
      const startTime = i > 0 ? entries[i - 1][1] : 0;
      const phaseName = key.replace(/End$/, '').replace(/([A-Z])/g, ' $1').trim();
      const duration = endTime - startTime;
      
      if (duration > 0) {
        phases.push({
          name: phaseName.charAt(0).toUpperCase() + phaseName.slice(1),
          start: startTime,
          end: endTime,
          type: determinePhaseType(phaseName),
          duration
        });
      }
    });
    
    scene.timing = {
      phases,
      markers: {},
      duration: Math.max(...Object.values(scene.introCfg), 0)
    };
    
    console.log(`✅ Created timing.phases with ${phases.length} phases`);
    phases.forEach(p => console.log(`   - ${p.name}: ${p.start}s-${p.end}s (${p.type})`));
  }
  
  // Wrap motionCfg into motion
  if (scene.motionCfg && !scene.motion) {
    scene.motion = {
      camera: {},
      objects: {},
      animations: {},
      ...scene.motionCfg
    };
    console.log('✅ Wrapped motionCfg into motion structure');
  }
  
  // Initialize events if missing
  if (!scene.events) {
    scene.events = {
      dialogues: [],
      triggers: [],
      sounds: []
    };
    console.log('✅ Initialized events structure');
  }
  
  // Initialize motion if still missing
  if (!scene.motion) {
    scene.motion = {
      camera: {},
      objects: {},
      animations: {}
    };
    console.log('✅ Initialized motion structure');
  }
  
  // Initialize timing if still missing
  if (!scene.timing) {
    scene.timing = {
      phases: [],
      markers: {},
      duration: 0
    };
    console.log('⚠️ Initialized empty timing structure (no introCfg to convert)');
  }
  
  // Add helper methods
  if (!scene.registerPhase) {
    scene.registerPhase = function(name, start, end, type = 'animation') {
      if (!this.timing) {
        this.timing = { phases: [], markers: {}, duration: 0 };
      }
      this.timing.phases.push({
        name,
        start,
        end,
        type,
        duration: end - start
      });
      console.log(`📌 Registered phase: ${name}`);
      return this;
    };
    console.log('✅ Added registerPhase() method');
  }
  
  if (!scene.registerDialogue) {
    scene.registerDialogue = function(speaker, text, timestamp, display = 'subtitle') {
      if (!this.events) {
        this.events = { dialogues: [], triggers: [], sounds: [] };
      }
      this.events.dialogues.push({ speaker, text, timestamp, display });
      console.log(`💬 Registered dialogue: ${speaker} @ ${timestamp}s`);
      return this;
    };
    console.log('✅ Added registerDialogue() method');
  }
  
  if (!scene.registerEvent) {
    scene.registerEvent = function(name, timestamp, action) {
      if (!this.events) {
        this.events = { dialogues: [], triggers: [], sounds: [] };
      }
      this.events.triggers.push({ name, timestamp, action });
      console.log(`⚡ Registered event: ${name} @ ${timestamp}s`);
      return this;
    };
    console.log('✅ Added registerEvent() method');
  }
  
  if (!scene.registerMotion) {
    scene.registerMotion = function(category, key, config) {
      if (!this.motion) {
        this.motion = { camera: {}, objects: {}, animations: {} };
      }
      if (!this.motion[category]) {
        this.motion[category] = {};
      }
      this.motion[category][key] = config;
      console.log(`🎬 Registered motion: ${category}.${key}`);
      return this;
    };
    console.log('✅ Added registerMotion() method');
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
    console.log('✅ Added getSequenceData() method');
  }
  
  // Summary
  console.log('\n✅ Scene is now composable!');
  console.log(`\n📊 Current Data:`);
  console.log(`   Phases: ${scene.timing.phases.length}`);
  console.log(`   Dialogues: ${scene.events.dialogues.length}`);
  console.log(`   Events: ${scene.events.triggers.length}`);
  console.log(`   Motion categories: ${Object.keys(scene.motion).length}`);
  
  if (scene.timing.phases.length > 0) {
    console.log(`\n🎬 Ready for Sequence Builder auto-ingest!`);
    console.log(`   Expected nodes: ${scene.timing.phases.length}+`);
  } else {
    console.log(`\n⚠️ No phases found. Add them with:`);
    console.log(`   scene.registerPhase('Phase Name', 0, 3, 'animation');`);
  }
  
  return true;
}

/**
 * Determine phase type from name
 */
function determinePhaseType(phaseName) {
  const name = phaseName.toLowerCase();
  
  if (name.includes('transition') || name.includes('orbit') || name.includes('collapse') || name.includes('doorway')) {
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
 * Quick patch for current intro scene
 * Run in console while intro is playing
 */
export function patchRunningIntro() {
  const intro = window.introScene || window.currentScene;
  
  if (!intro) {
    console.error('❌ No introScene or currentScene found');
    console.log('Make sure a scene is running (click Play first)');
    return false;
  }
  
  console.log('🎬 Patching running intro scene...');
  return addComposabilityToRunningScene(intro);
}

/**
 * Batch patch all accessible scenes
 */
export function patchAllAccessibleScenes() {
  console.log('🔄 Patching all accessible scenes...\n');
  
  let patchedCount = 0;
  
  if (window.introScene) {
    console.log('Patching introScene...');
    if (addComposabilityToRunningScene(window.introScene)) patchedCount++;
    console.log('');
  }
  
  if (window.currentScene && window.currentScene !== window.introScene) {
    console.log('Patching currentScene...');
    if (addComposabilityToRunningScene(window.currentScene)) patchedCount++;
    console.log('');
  }
  
  console.log(`✅ Patched ${patchedCount} scene(s)`);
  return patchedCount;
}

// For direct console usage (non-module)
if (typeof window !== 'undefined') {
  window.addComposabilityToRunningScene = addComposabilityToRunningScene;
  window.patchRunningIntro = patchRunningIntro;
  window.patchAllAccessibleScenes = patchAllAccessibleScenes;
  
  console.log('💡 Composability utilities loaded:');
  console.log('   addComposabilityToRunningScene(scene)');
  console.log('   patchRunningIntro()');
  console.log('   patchAllAccessibleScenes()');
}

