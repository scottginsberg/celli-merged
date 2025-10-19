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
import { VisiCellScene } from './scenes/VisiCellScene.js';
import { CityScene } from './scenes/CityScene.js';
import CelliRealSceneFull from './scenes/CelliRealScene-Full.js';
import { FullhandScene } from './scenes/FullhandScene.js';

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
const INTRO_THEME_STORAGE_KEY = 'celli:introThemePreference';
const INTRO_THEME_DEFAULT = 'theme1';
const INTRO_THEME_SECONDARY = 'theme2';
const INTRO_THEME_SOURCES = {
  [INTRO_THEME_DEFAULT]: './theme1.mp3',
  [INTRO_THEME_SECONDARY]: './theme2.mp3'
};
const INTRO_SEQUENCE_POPUP_AUDIO = './pop-up.mp3';
const INTRO_SEQUENCE_VIDEO_PREFIX = './Intro';
const INTRO_SEQUENCE_VIDEO_SUFFIX = '.mp4';
const INTRO_SEQUENCE_MAX_COUNT = 12;
const INTRO_SEQUENCE_SKIP_HINT = 'CLICK OR TAP TO SKIP';
let constructionCompleteCache = null;
let sceneHooksRegistered = false;
let introSceneMusicManaged = false;

let introSequenceOverlay = null;
let introSequenceActive = false;
let introSequenceMusicKey = null;

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

function resolveIntroThemeKey() {
  const hasCompleted = hasConstructionCompleted();
  let themeKey = INTRO_THEME_DEFAULT;

  try {
    const stored = window.localStorage?.getItem(INTRO_THEME_STORAGE_KEY);
    if (stored === INTRO_THEME_DEFAULT || stored === INTRO_THEME_SECONDARY) {
      themeKey = stored;
    } else if (hasCompleted) {
      themeKey = INTRO_THEME_SECONDARY;
    }
  } catch (error) {
    console.warn('⚠️ Unable to read intro theme preference for sequence playback:', error);
    if (hasCompleted) {
      themeKey = INTRO_THEME_SECONDARY;
    }
  }

  return themeKey;
}

function resolveIntroThemeUrl() {
  const key = resolveIntroThemeKey();
  return {
    key,
    url: INTRO_THEME_SOURCES[key] || INTRO_THEME_SOURCES[INTRO_THEME_DEFAULT]
  };
}

async function probeIntroVideo(url) {
  try {
    const headResponse = await fetch(url, { method: 'HEAD' });
    if (headResponse.ok) {
      return true;
    }
  } catch (error) {
    console.warn('⚠️ HEAD probe failed for intro video', url, error);
  }

  try {
    const response = await fetch(url, { headers: { Range: 'bytes=0-0' } });
    return response.ok;
  } catch (error) {
    console.warn('⚠️ Intro video probe failed', url, error);
    return false;
  }
}

async function discoverIntroSequenceVideos() {
  const playlist = [];

  for (let index = 1; index <= INTRO_SEQUENCE_MAX_COUNT; index += 1) {
    const candidate = `${INTRO_SEQUENCE_VIDEO_PREFIX}${index}${INTRO_SEQUENCE_VIDEO_SUFFIX}`;
    /* eslint-disable no-await-in-loop */
    const exists = await probeIntroVideo(candidate);
    /* eslint-enable no-await-in-loop */

    if (!exists) {
      if (index === 1) {
        playlist.length = 0;
      }
      break;
    }

    playlist.push(candidate);
  }

  return playlist;
}

function buildTrifoldIcon() {
  const icon = document.createElement('div');
  icon.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 18px;
  `;

  const square = document.createElement('span');
  square.style.cssText = `
    width: 22px;
    height: 22px;
    border: 2px solid #0ff;
    background: rgba(0, 40, 40, 0.4);
    box-shadow: 0 0 12px rgba(0, 255, 255, 0.35);
    display: inline-block;
  `;

  const triangle = document.createElement('span');
  triangle.style.cssText = `
    width: 0;
    height: 0;
    border-left: 13px solid transparent;
    border-right: 13px solid transparent;
    border-bottom: 24px solid rgba(0, 255, 0, 0.75);
    filter: drop-shadow(0 0 10px rgba(0, 255, 0, 0.45));
  `;

  const circle = document.createElement('span');
  circle.style.cssText = `
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2px solid #ff6;
    box-shadow: 0 0 12px rgba(255, 255, 102, 0.45);
    background: rgba(30, 30, 0, 0.55);
    display: inline-block;
  `;

  icon.append(square, triangle, circle);
  return icon;
}

function ensureIntroSequenceOverlay() {
  if (introSequenceOverlay && introSequenceOverlay.overlay?.isConnected) {
    introSequenceOverlay.overlay.remove();
    introSequenceOverlay = null;
  }

  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    display: none;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at center, rgba(0, 15, 15, 0.94) 0%, rgba(0, 0, 0, 0.96) 70%);
    z-index: 4000;
    color: #0f0;
    font-family: "Courier New", monospace;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  `;

  const container = document.createElement('div');
  container.style.cssText = `
    width: min(880px, 86vw);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 24px 28px 32px;
    background: rgba(0, 0, 0, 0.85);
    border: 2px solid rgba(0, 255, 0, 0.35);
    box-shadow: 0 0 46px rgba(0, 255, 100, 0.28);
  `;

  const icon = buildTrifoldIcon();

  const title = document.createElement('div');
  title.textContent = 'STANDARD INTRO SEQUENCE';
  title.style.cssText = 'font-size: 18px; color: #0ff;';

  const fileLabel = document.createElement('div');
  fileLabel.style.cssText = 'font-size: 12px; color: #9eff9e;';
  fileLabel.textContent = 'PREPARING PLAYLIST…';

  const video = document.createElement('video');
  video.style.cssText = `
    width: 100%;
    max-height: 60vh;
    background: #000;
    border: 1px solid rgba(0, 255, 0, 0.4);
    box-shadow: inset 0 0 24px rgba(0, 255, 0, 0.25);
  `;
  video.controls = false;
  video.autoplay = true;
  video.playsInline = true;
  video.setAttribute('webkit-playsinline', 'true');

  const skipHint = document.createElement('div');
  skipHint.textContent = INTRO_SEQUENCE_SKIP_HINT;
  skipHint.style.cssText = 'font-size: 11px; opacity: 0.7;';

  container.append(icon, title, fileLabel, video, skipHint);
  overlay.appendChild(container);
  document.body.appendChild(overlay);

  introSequenceOverlay = {
    overlay,
    container,
    title,
    fileLabel,
    video,
    skipHint
  };

  return introSequenceOverlay;
}

async function runIntroVideoSequence() {
  if (introSequenceActive) {
    return;
  }

  const playlist = await discoverIntroSequenceVideos();
  if (!playlist.length) {
    return;
  }

  const ui = ensureIntroSequenceOverlay();
  const { key: themeKey, url: themeUrl } = resolveIntroThemeUrl();

  introSequenceActive = true;
  introSequenceMusicKey = `music:intro-sequence:${themeKey}`;

  window.dispatchEvent(new CustomEvent('celli:intro-music-managed', {
    detail: { managed: true }
  }));

  audioSystem.playMusic({
    key: introSequenceMusicKey,
    url: themeUrl,
    loop: true,
    volume: 0.62,
    fadeInDuration: 2.2
  }).catch((error) => {
    console.warn('⚠️ Failed to start intro sequence music:', error);
  });

  try {
    await audioSystem.loadAudioBuffer(INTRO_SEQUENCE_POPUP_AUDIO, 'sfx:intro-popup');
    audioSystem.playBuffer('sfx:intro-popup', { volume: 0.55 });
  } catch (error) {
    console.warn('⚠️ Unable to play intro popup audio:', error);
  }

  return new Promise((resolve) => {
    let currentIndex = 0;
    let completed = false;

    function cleanupIntroSequenceListeners() {
      ui.video.removeEventListener('ended', handleEnded);
      ui.video.removeEventListener('error', handleError);
      ui.overlay.removeEventListener('click', handleOverlayClick);
      ui.video.removeEventListener('click', handleVideoClick);
      window.removeEventListener('beforeunload', cleanupIntroSequenceListeners);
    }

    const finish = () => {
      if (completed) {
        return;
      }
      completed = true;

      cleanupIntroSequenceListeners();

      const fadeDuration = 420;
      ui.overlay.style.transition = `opacity ${fadeDuration}ms ease`;
      ui.overlay.style.opacity = '0';

      const cleanup = () => {
        ui.overlay.style.display = 'none';
        ui.video.pause();
        ui.video.removeAttribute('src');
        try {
          ui.video.load();
        } catch (error) {
          console.warn('⚠️ Unable to reset intro sequence video element:', error);
        }

        introSequenceActive = false;
        resolve();
      };

      window.setTimeout(cleanup, fadeDuration);
    };

    const updateLabel = (source, index) => {
      const fileName = source.split('/').pop() || source;
      ui.fileLabel.textContent = `INTRO ${index + 1}/${playlist.length}: ${fileName.toUpperCase()}`;
    };

    const playAtIndex = (index) => {
      if (index >= playlist.length) {
        finish();
        return;
      }

      currentIndex = index;
      const source = playlist[index];

      ui.video.pause();
      ui.video.removeAttribute('src');
      try {
        ui.video.load();
      } catch (error) {
        console.warn('⚠️ Unable to clear intro video element before switching sources:', error);
      }

      ui.video.src = source;
      updateLabel(source, index);

      const playPromise = ui.video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch((error) => {
          console.warn('⚠️ Intro video autoplay blocked or failed:', error);
          playAtIndex(index + 1);
        });
      }
    };

    const skipCurrent = () => {
      if (currentIndex + 1 < playlist.length) {
        playAtIndex(currentIndex + 1);
      } else {
        finish();
      }
    };

    const handleEnded = () => {
      playAtIndex(currentIndex + 1);
    };

    const handleError = () => {
      console.warn('⚠️ Error during intro sequence playback, skipping to next video.');
      playAtIndex(currentIndex + 1);
    };

    const handleOverlayClick = (event) => {
      if (event.target === ui.overlay) {
        skipCurrent();
      }
    };

    const handleVideoClick = (event) => {
      event.preventDefault();
      skipCurrent();
    };

    ui.video.addEventListener('ended', handleEnded);
    ui.video.addEventListener('error', handleError);
    ui.overlay.addEventListener('click', handleOverlayClick);
    ui.video.addEventListener('click', handleVideoClick);

    ui.overlay.style.opacity = '0';
    ui.overlay.style.display = 'flex';
    requestAnimationFrame(() => {
      ui.overlay.style.transition = 'opacity 360ms ease';
      ui.overlay.style.opacity = '1';
    });

    playAtIndex(0);

    // Ensure cleanup if user navigates away mid-playlist
    window.addEventListener('beforeunload', cleanupIntroSequenceListeners, { once: true });
  });
}

// ============================================================================
// SCENE REGISTRATION
// ============================================================================

export function registerAllScenes() {
  console.log('📋 Registering all scenes...');

  // Register Complete Intro Scene (use this for faithful port)
  sceneManager.registerScene('intro', new IntroSceneComplete());
  
  // Register VisiCell Scene
  sceneManager.registerScene('visicell', new VisiCellScene());

  // Register City Scene
  sceneManager.registerScene('city', new CityScene());

  // Register CelliReal voxel world scene
  sceneManager.registerScene('cellireal', new CelliRealSceneFull());

  // Register Execution Environment scene
  sceneManager.registerScene('fullhand', new FullhandScene());
  
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

    console.log('🎞️ Preparing standard intro video playlist…');
    try {
      await runIntroVideoSequence();
    } catch (sequenceError) {
      console.warn('⚠️ Intro video sequence failed or was skipped early:', sequenceError);
    }

    // Transition to intro scene - THIS STARTS THE INTRO SEQUENCE!
    console.log('🎬 Starting intro scene transition...');
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

  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('celli:intro-music-managed', (event) => {
      const managed = Boolean(event?.detail?.managed);
      introSceneMusicManaged = managed;

      if (!managed) {
        try {
          audioSystem.stopMusic({ fadeOutDuration: 0.2 });
        } catch (error) {
          console.warn('⚠️ Failed to stop global intro music after scene released control:', error);
        }
      }
    });
  }

  window.addEventListener('celli:construction-complete', () => {
    constructionCompleteCache = true;
    try {
      window.localStorage?.setItem(CONSTRUCTION_STORAGE_KEY, 'true');
    } catch (error) {
      console.warn('⚠️ Failed to persist construction completion from event:', error);
    }

    try {
      window.localStorage?.setItem(INTRO_THEME_STORAGE_KEY, INTRO_THEME_SECONDARY);
    } catch (error) {
      console.warn('⚠️ Failed to persist intro theme preference from construction event:', error);
    }
  });

  sceneManager.on('onSceneStart', ({ scene }) => {
    if (scene !== 'intro') {
      return;
    }

    if (introSceneMusicManaged) {
      console.log('🎵 Intro scene is managing music locally; skipping global intro playback.');
      return;
    }

    const hasCompleted = hasConstructionCompleted();
    let themeKey = INTRO_THEME_DEFAULT;

    try {
      const stored = window.localStorage?.getItem(INTRO_THEME_STORAGE_KEY);
      if (stored === INTRO_THEME_DEFAULT || stored === INTRO_THEME_SECONDARY) {
        themeKey = stored;
      } else if (hasCompleted) {
        themeKey = INTRO_THEME_SECONDARY;
      }
    } catch (error) {
      console.warn('⚠️ Unable to read intro theme preference for music playback:', error);
      if (hasCompleted) {
        themeKey = INTRO_THEME_SECONDARY;
      }
    }

    const themeUrl = INTRO_THEME_SOURCES[themeKey] || INTRO_THEME_SOURCES[INTRO_THEME_DEFAULT];

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

