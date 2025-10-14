/**
 * Celli - Enhanced Application with Dynamic Scene System
 * 
 * Complete initialization system with:
 * - Scene Manager for dynamic scene loading
 * - Asset Pool for resource management
 * - Configuration System for fine-tuning
 * - Sequence Engine for narrative sequences
 * - Player-tunable mechanics
 */

import * as THREE from 'three';
import { sceneManager } from './core/SceneManager.js';

// Import scenes
import { IntroSceneComplete } from './scenes/IntroSceneComplete.js';
import { VisiCalcScene } from './scenes/VisiCalcScene.js';
import { CityScene } from './scenes/CityScene.js';

// Import GUI systems
import { quoteSystem } from './gui/QuoteSystem.js';
import { loomworksSystem } from './gui/LoomworksSystem.js';
import { textParticleSystem } from './gui/TextParticleSystem.js';

// Import core systems
import { audioSystem } from './systems/AudioSystem.js';
import { assetPool } from './systems/AssetPool.js';
import { configSystem } from './systems/ConfigSystem.js';
import { sequenceEngine } from './systems/SequenceEngine.js';

// Import initialization
import { 
  initializeSystems, 
  preloadAssets, 
  createPlayerTuningUI, 
  initializeDebugCommands 
} from './init.js';

console.log('%c🎨 Celli - Enhanced Scene System Loading...', 
  'background: #8ab4ff; color: #000; font-size: 18px; padding: 10px; font-weight: bold;');

// Make THREE globally available
window.THREE = THREE;

// ============================================================================
// GLOBAL ANIMATION LOOP
// ============================================================================

let animationFrameId = null;
const clock = new THREE.Clock();

function animate() {
  animationFrameId = requestAnimationFrame(animate);
  
  const deltaTime = clock.getDelta();
  const totalTime = clock.getElapsedTime();
  
  // Update active scene
  sceneManager.update(deltaTime, totalTime);
}

function startAnimationLoop() {
  if (!animationFrameId) {
    clock.start();
    animate();
    console.log('🎬 Animation loop started');
  }
}

function stopAnimationLoop() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    clock.stop();
    console.log('⏹️ Animation loop stopped');
  }
}

// ============================================================================
// SCENE REGISTRATION
// ============================================================================

export function registerAllScenes() {
  console.log('📋 Registering all scenes...');

  // Register Complete Intro Scene (use this for faithful port)
  sceneManager.registerScene('intro', new IntroSceneComplete());
  
  // Register VisiCalc Scene  
  sceneManager.registerScene('visicalc', new VisiCalcScene());
  
  // Register City Scene
  sceneManager.registerScene('city', new CityScene());
  
  // TODO: Register more scenes as they're extracted
  // sceneManager.registerScene('end3', new End3Scene());
  // sceneManager.registerScene('fullhand', new FullhandScene());
  // sceneManager.registerScene('cellireal', new CelliRealScene());

  console.log(`✅ ${sceneManager.listScenes().length} scenes registered`);
}

// ============================================================================
// GUI SYSTEM INITIALIZATION
// ============================================================================

export function initializeGUI() {
  console.log('🎨 Initializing GUI systems...');

  // Initialize all GUI components
  quoteSystem.init();
  loomworksSystem.init();
  
  // Wire up GUI event handlers
  setupGUIHandlers();

  console.log('✅ GUI systems initialized');
}

function setupGUIHandlers() {
  // Quote system events
  quoteSystem.on('show', () => {
    console.log('Quote system shown');
  });

  // Loomworks events  
  loomworksSystem.on('typeComplete', () => {
    console.log('Loomworks typing complete');
  });
}

// ============================================================================
// AUDIO SYSTEM INITIALIZATION
// ============================================================================

export function initializeAudio() {
  console.log('🔊 Initializing audio system...');
  
  // Audio context must be initialized after user interaction
  // We'll init it when Play button is clicked
  
  console.log('✅ Audio system ready (will initialize on user interaction)');
}

// ============================================================================
// MAIN APPLICATION ENTRY POINT
// ============================================================================

export async function startApp() {
  console.log('%c🚀 STARTING CELLI APP', 
    'background: #0f0; color: #000; font-size: 20px; padding: 10px; font-weight: bold;');

  try {
    // Mark as initialized
    window.celliApp.initialized = true;

    // Hide play overlay
    const play = document.getElementById('play');
    if (play) play.style.display = 'none';

    // Initialize all systems (config, assets, etc.)
    await initializeSystems();

    // Preload assets with progress
    await preloadAssets((progress, loaded, total) => {
      console.log(`📦 Loading assets: ${Math.round(progress * 100)}% (${loaded}/${total})`);
    });

    // Initialize audio (user interaction happened)
    audioSystem.init();
    await audioSystem.resume();

    // Setup sequence engine hooks
    setupSequenceHooks();

    // Create player tuning UI (if enabled)
    if (configSystem.get('debug.enablePlayerTuning') !== false) {
      createPlayerTuningUI();
    }

    // Initialize debug commands
    initializeDebugCommands();

    // Start animation loop
    startAnimationLoop();

    // Transition to intro scene - THIS STARTS THE INTRO SEQUENCE!
    console.log('🎬 Starting intro sequence...');
    await sceneManager.transitionTo('intro');

    // Show GUI elements (with config timings)
    const quoteDelay = configSystem.get('scene.introQuoteDelay') || 0;
    const loomworksDelay = configSystem.get('scene.introLoomworksDelay') || 5000;

    setTimeout(() => {
      quoteSystem.show(true);
    }, quoteDelay);
    
    setTimeout(() => {
      loomworksSystem.show(true);
      loomworksSystem.startReveal();
    }, loomworksDelay);

    console.log('✅ App started successfully! Intro sequence playing...');
    console.log('🎛️ Press `Ctrl+Shift+T` or use tuning button to open tuning panel');
    
  } catch (error) {
    console.error('❌ Failed to start app:', error);
    alert(`Failed to start Celli: ${error.message}`);
  }
}

// ============================================================================
// SEQUENCE ENGINE HOOKS
// ============================================================================

function setupSequenceHooks() {
  // Hook dialogue events to GUI
  sequenceEngine.on('onDialogue', ({ speaker, text, duration }) => {
    console.log(`💬 Dialogue: ${speaker}: "${text}"`);
    quoteSystem.setText(text, { duration: duration || 3000 });
    
    // Optional: TTS
    if (configSystem.get('sequence.enableTTS')) {
      audioSystem.speakAnimalese(text);
    }
  });

  // Hook animation events
  sequenceEngine.on('onAnimation', ({ target, property, from, to, duration, easing }) => {
    console.log(`🎨 Animation: ${target}.${property} → ${to}`);
    // Implement animation system hook here
  });

  // Hook custom events
  sequenceEngine.on('onEvent', ({ type, name, data }) => {
    console.log(`⚡ Event: ${type} - ${name}`);
    
    if (type === 'transition') {
      // Scene transition
      sceneManager.transitionTo(data.toScene);
    }
  });

  console.log('🔗 Sequence engine hooks configured');
}

// ============================================================================
// SCENE TRANSITION HELPERS
// ============================================================================

export async function transitionToCity() {
  await sceneManager.transitionTo('city');
}

export async function transitionToIntro() {
  await sceneManager.transitionTo('intro');
}

// ============================================================================
// SCENE CONTEXT FOR SEQUENCE SYSTEM
// ============================================================================

export function getAppContext() {
  // Get current scene state and objects for sequence composition
  const currentScene = sceneManager.getCurrentScene();
  const sceneState = sceneManager.getSceneState(currentScene);
  
  return {
    sceneManager,
    currentScene,
    sceneState,
    scene: sceneState?.scene || null,
    camera: sceneState?.camera || null,
    renderer: sceneState?.renderer || null,
    composer: sceneState?.composer || null,
    spheres: sceneState?.spheres || [],
    voxels: sceneState?.voxels || [],
    gui: {
      quoteSystem,
      loomworksSystem,
      textParticleSystem
    },
    audio: audioSystem
  };
}

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

document.addEventListener('keydown', (e) => {
  // Ctrl+Shift+T: Toggle tuning UI
  if (e.ctrlKey && e.shiftKey && e.key === 'T') {
    e.preventDefault();
    const ui = document.getElementById('playerTuningUI');
    if (ui) {
      ui.style.display = ui.style.display === 'none' ? 'block' : 'none';
    }
  }

  // Ctrl+Shift+D: Toggle debug info
  if (e.ctrlKey && e.shiftKey && e.key === 'D') {
    e.preventDefault();
    console.log('='.repeat(50));
    console.log('🐛 DEBUG INFO');
    console.log('='.repeat(50));
    console.log('Active scene:', sceneManager.getCurrentScene());
    console.log('Config:', configSystem.config);
    console.log('Assets loaded:', assetPool.loadedCount, '/', assetPool.totalAssets);
    console.log('='.repeat(50));
  }
});

// ============================================================================
// EXPORTS
// ============================================================================

export {
  sceneManager,
  quoteSystem,
  loomworksSystem,
  textParticleSystem,
  audioSystem,
  assetPool,
  configSystem,
  sequenceEngine,
  stopAnimationLoop
};

// Global access for debugging and player tuning
window.celliApp = {
  sceneManager,
  quoteSystem,
  loomworksSystem,
  audioSystem,
  assetPool,
  configSystem,
  sequenceEngine,
  startApp,
  transitionToCity,
  transitionToIntro,
  initialized: false  // Track if app has been initialized
};

console.log('✨ Celli Enhanced App Module Loaded!');
console.log('📝 Available scenes:', sceneManager.listScenes());
console.log('🎛️ Configuration system ready');
console.log('📦 Asset pool initialized');
console.log('🎬 Sequence engine ready');
console.log('');
console.log('🔧 Debug: window.celliApp | window.celli');
console.log('⌨️ Shortcuts: Ctrl+Shift+T (tuning) | Ctrl+Shift+D (debug)');

