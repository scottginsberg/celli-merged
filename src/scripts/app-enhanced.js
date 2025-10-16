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
import { CelliRealScene } from './scenes/CelliRealScene.js';

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

const CONSTRUCTION_STORAGE_KEY = 'celli:introConstructionComplete';
const INTRO_THEME_STORAGE_KEY = 'celli:introThemeState';
let constructionCompleteCache = null;
let sceneHooksRegistered = false;
let introThemeStateCache = null;

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

function getIntroThemeState() {
  if (introThemeStateCache) {
    return introThemeStateCache;
  }

  let storedState = null;
  try {
    const raw = window.localStorage?.getItem(INTRO_THEME_STORAGE_KEY);
    if (raw) {
      storedState = JSON.parse(raw);
    }
  } catch (error) {
    console.warn('⚠️ Unable to read intro theme state:', error);
  }

  const state = storedState && typeof storedState === 'object'
    ? {
        firstPlayConsumed: Boolean(storedState.firstPlayConsumed),
        defaultTheme: storedState.defaultTheme === 'theme2' ? 'theme2' : 'theme1'
      }
    : {
        firstPlayConsumed: false,
        defaultTheme: 'theme1'
      };

  introThemeStateCache = state;
  return state;
}

function saveIntroThemeState(nextState) {
  const state = {
    firstPlayConsumed: Boolean(nextState.firstPlayConsumed),
    defaultTheme: nextState.defaultTheme === 'theme2' ? 'theme2' : 'theme1'
  };

  introThemeStateCache = state;

  try {
    window.localStorage?.setItem(INTRO_THEME_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('⚠️ Unable to persist intro theme state:', error);
  }

  return state;
}

function selectIntroTheme() {
  const state = { ...getIntroThemeState() };
  let theme = 'theme1';

  if (!state.firstPlayConsumed) {
    theme = 'theme1';
    state.firstPlayConsumed = true;
    state.defaultTheme = 'theme2';
    saveIntroThemeState(state);
  } else {
    theme = state.defaultTheme === 'theme2' ? 'theme2' : 'theme1';
    saveIntroThemeState(state);
  }

  return {
    theme,
    url: `./${theme}.mp3`
  };
}

function setIntroThemeDefault(theme) {
  const normalized = theme === 'theme2' ? 'theme2' : 'theme1';
  const state = { ...getIntroThemeState() };

  if (state.defaultTheme !== normalized) {
    state.defaultTheme = normalized;
    saveIntroThemeState(state);
  }
}

function resetIntroThemeStateCache() {
  introThemeStateCache = null;
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

  // Register CelliReal voxel world scene
  sceneManager.registerScene('cellireal', new CelliRealScene());
  
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
  console.group('%c🚀 STARTING CELLI APP',
    'background: #0f0; color: #000; font-size: 20px; padding: 10px; font-weight: bold;');

  console.time('Celli startApp total time');

  let loomworksHandled = false;
  let loomworksFallbackTimer = null;

  const handleLoomworksReveal = () => {
    if (loomworksHandled) {
      return;
    }

    loomworksHandled = true;
    window.removeEventListener('celli:loomworks-ready', handleLoomworksReveal);
    if (loomworksFallbackTimer) {
      clearTimeout(loomworksFallbackTimer);
      loomworksFallbackTimer = null;
    }

    console.log('🧵 Showing Loomworks system');
    loomworksSystem.show(true);
    loomworksSystem.startReveal();
  };

  try {
    // Hide play overlay immediately to avoid duplicate UIs
    const play = document.getElementById('play');
    if (play) {
      console.log('🪄 Hiding play overlay');
      play.style.display = 'none';
    }

    console.group('🧰 System bootstrap');
    console.log('🧭 Scene registry before init:', sceneManager.listScenes());

    // Initialize all systems (config, assets, etc.)
    console.time('initializeSystems');
    await initializeSystems();
    console.timeEnd('initializeSystems');

    console.groupCollapsed('📦 Asset pool state before preload');
    console.log('Registered assets:', assetPool.assets?.size ?? 0);
    console.log('Total assets counter:', assetPool.totalAssets);
    console.groupEnd();

    // Preload assets with progress
    console.time('preloadAssets');
    const assetsLoaded = await preloadAssets((progress, loaded, total) => {
      console.log(`📦 Loading assets: ${Math.round(progress * 100)}% (${loaded}/${total})`);
    });
    console.timeEnd('preloadAssets');
    console.log('📦 Asset preload result:', assetsLoaded ? 'success' : 'partial/failed');

    // Initialize audio (user interaction happened)
    console.group('🔊 Audio bootstrap');
    audioSystem.init();
    try {
      await audioSystem.resume();
      console.log('🔊 Audio context resumed');
    } catch (audioError) {
      console.warn('⚠️ Audio resume failed (likely autoplay restrictions):', audioError);
    }
    console.groupEnd();

    // Setup sequence engine hooks
    setupSequenceHooks();
    setupSceneHooks();

    // Create player tuning UI (if enabled)
    if (configSystem.get('debug.enablePlayerTuning') !== false) {
      console.log('🎛️ Creating player tuning UI');
      createPlayerTuningUI();
    } else {
      console.log('🎛️ Player tuning UI disabled via config');
    }

    // Initialize debug commands
    initializeDebugCommands();
    console.groupEnd();

    // Start animation loop
    startAnimationLoop();

    // Transition to intro scene - THIS STARTS THE INTRO SEQUENCE!
    console.log('🎬 Starting intro sequence transition...');
    await sceneManager.transitionTo('intro');

    // Mark as initialized after successful transition
    window.celliApp.initialized = true;

    // Show GUI elements (with config timings)
    const quoteDelay = configSystem.get('scene.introQuoteDelay') || 0;
    const loomworksFallbackDelay = configSystem.get('scene.introLoomworksDelay') || 12000;

    setTimeout(() => {
      console.log('🗨️ Showing quote system');
      quoteSystem.show(true);
    }, quoteDelay);

    window.addEventListener('celli:loomworks-ready', handleLoomworksReveal);

    loomworksFallbackTimer = window.setTimeout(() => {
      if (!loomworksHandled) {
        console.warn('⚠️ Loomworks ready event not received in time; triggering fallback reveal.');
        handleLoomworksReveal();
      }
    }, loomworksFallbackDelay);

    console.log('✅ App started successfully! Intro sequence playing...');
    console.log('🎛️ Press `Ctrl+Shift+T` or use tuning button to open tuning panel');

  } catch (error) {
    window.celliApp.initialized = false;
    window.removeEventListener('celli:loomworks-ready', handleLoomworksReveal);
    if (loomworksFallbackTimer) {
      clearTimeout(loomworksFallbackTimer);
      loomworksFallbackTimer = null;
    }
    console.error('❌ Failed to start app:', error);
    alert(`Failed to start Celli: ${error.message}`);
    throw error;
  } finally {
    console.timeEnd('Celli startApp total time');
    console.groupEnd();
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

function hasConstructionCompleted() {
  if (constructionCompleteCache !== null) {
    return constructionCompleteCache;
  }

  try {
    const stored = window.localStorage?.getItem(CONSTRUCTION_STORAGE_KEY);
    constructionCompleteCache = stored === 'true';
  } catch (error) {
    constructionCompleteCache = false;
    console.warn('⚠️ Unable to read construction completion flag:', error);
  }

  return constructionCompleteCache;
}

function setupSceneHooks() {
  if (sceneHooksRegistered) {
    return;
  }
  sceneHooksRegistered = true;

  window.addEventListener('celli:construction-complete', () => {
    constructionCompleteCache = true;
    try {
      window.localStorage?.setItem(CONSTRUCTION_STORAGE_KEY, 'true');
    } catch (error) {
      console.warn('⚠️ Failed to persist construction completion from event:', error);
    }
    setIntroThemeDefault('theme2');
  });

  window.addEventListener('celli:intro-theme-reset', () => {
    resetIntroThemeStateCache();
  });

  window.addEventListener('storage', (event) => {
    if (event.key === INTRO_THEME_STORAGE_KEY) {
      resetIntroThemeStateCache();
    }
  });

  sceneManager.on('onSceneStart', ({ scene }) => {
    if (scene !== 'intro') {
      return;
    }

    const hasCompleted = hasConstructionCompleted();
    if (hasCompleted) {
      setIntroThemeDefault('theme2');
    }

    const { theme: themeKey, url: themeUrl } = selectIntroTheme();

    audioSystem.playMusic({
      key: `music:${themeKey}`,
      url: themeUrl,
      loop: true,
      fadeInDuration: 2.4,
      volume: 0.65
    }).catch((error) => {
      console.warn(`⚠️ Failed to start ${themeKey} music:`, error);
    });
  });
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

