/**
 * Initialization System - Complete app setup and configuration
 * 
 * Handles:
 * - Asset registration & preloading
 * - Configuration initialization
 * - System bootstrapping
 * - Default values for all tunable parameters
 */

import { assetPool } from './systems/AssetPool.js';
import { configSystem } from './systems/ConfigSystem.js';
import { sequenceEngine } from './systems/SequenceEngine.js';
import { audioSystem } from './systems/AudioSystem.js';

/**
 * Register all default configuration
 */
export function registerDefaultConfig() {
  console.log('⚙️ Registering default configuration...');

  // Graphics configuration
  configSystem.registerCategory('graphics', {
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    antialias: true,
    toneMappingExposure: 1.0,
    bloomStrength: 0.7,
    bloomRadius: 0.9,
    bloomThreshold: 0.2,
    afterimageStrength: 0.96,
    filmGrainIntensity: 0.03,
    scanlineIntensity: 0.03,
    saturation: 1.06,
    contrast: 1.06,
    brightness: 1.02
  }, {
    playerExposed: [
      'bloomStrength',
      'afterimageStrength',
      'filmGrainIntensity',
      'saturation',
      'contrast',
      'brightness'
    ],
    locked: ['pixelRatio', 'antialias']
  });

  // Animation configuration
  configSystem.registerCategory('animation', {
    sphereOrbitSpeed: 0.5,
    sphereOrbitDistance: 0.25,
    blackHolePulseSpeed: 3.5,
    blackHolePulseFactor: 0.5,
    voxelDropSpeed: 0.02,
    voxelDropDelay: 0.15,
    voxelJiggleIntensity: 0.003,
    voxelFlickerSpeed: 8.0
  }, {
    playerExposed: [
      'sphereOrbitSpeed',
      'blackHolePulseSpeed',
      'voxelDropSpeed',
      'voxelJiggleIntensity'
    ]
  });

  // Audio configuration
  configSystem.registerCategory('audio', {
    masterVolume: 1.0,
    chimeVolume: 0.15,
    animaleseVolume: 0.06,
    animaleseRate: 16,
    animaleseBase: 420,
    animaleseJitter: 40,
    synthVolume: 0.3
  }, {
    playerExposed: [
      'masterVolume',
      'chimeVolume',
      'animaleseVolume',
      'synthVolume'
    ]
  });

  // Scene configuration
  configSystem.registerCategory('scene', {
    introQuoteDelay: 0,
    introLoomworksDelay: 5000,
    introCelliDelay: 30000,
    cityWalkSpeed: 0.08,
    cityDoorProximity: 1.2,
    transitionDuration: 1000
  }, {
    playerExposed: [
      'introCelliDelay',
      'cityWalkSpeed',
      'transitionDuration'
    ]
  });

  // GUI configuration
  configSystem.registerCategory('gui', {
    quoteGlitchDuration: 1100,
    quoteFadeDelay: 3000,
    loomworksTypeSpeed: 65,
    loomworksTypeJitter: 55,
    textParticleLifetime: 1.8,
    textParticleOrbitForce: 0.00012,
    textParticleCollapseForce: 0.0008
  }, {
    playerExposed: [
      'quoteGlitchDuration',
      'loomworksTypeSpeed',
      'textParticleLifetime'
    ]
  });

  // Input configuration
  configSystem.registerCategory('input', {
    keyboardEnabled: true,
    mouseEnabled: true,
    touchEnabled: true,
    scrollSpeed: 1.0,
    clickDelay: 100
  }, {
    playerExposed: [
      'scrollSpeed'
    ],
    locked: ['keyboardEnabled', 'mouseEnabled', 'touchEnabled']
  });

  // Performance configuration
  configSystem.registerCategory('performance', {
    targetFPS: 60,
    maxParticles: 1000,
    maxVoxels: 500,
    lodDistance: 50,
    cullDistance: 100,
    enableOcclusion: true
  }, {
    playerExposed: [
      'maxParticles',
      'maxVoxels'
    ]
  });

  // Sequence configuration
  configSystem.registerCategory('sequence', {
    defaultDialogueDuration: 3000,
    autoAdvanceDialogue: false,
    skipEnabled: true,
    pauseEnabled: true
  }, {
    playerExposed: [
      'autoAdvanceDialogue',
      'skipEnabled'
    ]
  });

  console.log('✅ Configuration registered');
}

/**
 * Register all assets for preloading
 */
export function registerAssets() {
  console.log('📦 Registering assets...');

  // Shaders
  assetPool.register('shader_blackhole_vert', './src/assets/shaders/blackhole.vert.glsl', 'shader');
  assetPool.register('shader_blackhole_frag', './src/assets/shaders/blackhole.frag.glsl', 'shader');
  
  // JSON data
  assetPool.register('quotes', './src/data/quotes.json', 'json');
  
  // Sequences (if they exist)
  // assetPool.register('seq_intro', './src/data/sequences/intro.json', 'json');
  // assetPool.register('seq_theos', './src/data/sequences/theos.json', 'json');

  // Audio (when we have audio files)
  // assetPool.register('audio_chime', './src/assets/audio/chime.mp3', 'audio');

  console.log(`✅ ${assetPool.assets.size} assets registered`);
}

/**
 * Preload essential assets
 */
export async function preloadAssets(onProgress = null) {
  console.log('⏳ Preloading assets...');

  if (onProgress) {
    assetPool.onProgress(onProgress);
  }

  try {
    await assetPool.loadAll();
    console.log('✅ All assets loaded');
    return true;
  } catch (error) {
    console.error('❌ Asset loading failed:', error);
    return false;
  }
}

/**
 * Initialize all systems
 */
export async function initializeSystems() {
  console.log('🔧 Initializing systems...');

  // Register configuration
  registerDefaultConfig();

  // Register assets
  registerAssets();

  // Try to load saved configuration
  configSystem.load();

  // Setup configuration watchers for hot reload
  setupConfigWatchers();

  // Initialize audio system
  // (will be initialized on user interaction)

  console.log('✅ Systems initialized');
}

/**
 * Setup configuration watchers for hot reload
 */
function setupConfigWatchers() {
  // Watch graphics settings
  configSystem.watch('graphics.bloomStrength', (value) => {
    console.log(`🔄 Bloom strength changed: ${value}`);
    // Update bloom pass if it exists
    if (window.celliApp?.bloomPass) {
      window.celliApp.bloomPass.strength = value;
    }
  });

  configSystem.watch('graphics.afterimageStrength', (value) => {
    console.log(`🔄 Afterimage strength changed: ${value}`);
    if (window.celliApp?.afterimagePass) {
      window.celliApp.afterimagePass.uniforms.damp.value = value;
    }
  });

  // Watch animation settings
  configSystem.watch('animation.sphereOrbitSpeed', (value) => {
    console.log(`🔄 Sphere orbit speed changed: ${value}`);
    // Will be picked up by animation loop
  });

  // Watch audio settings
  configSystem.watch('audio.masterVolume', (value) => {
    console.log(`🔄 Master volume changed: ${value}`);
    // Apply to audio system
  });

  // Save configuration on any change
  configSystem.watch('*.*', () => {
    // Debounced save
    clearTimeout(window._configSaveTimeout);
    window._configSaveTimeout = setTimeout(() => {
      configSystem.save();
    }, 1000);
  });
}

/**
 * Create player tuning UI
 */
export function createPlayerTuningUI() {
  const container = document.createElement('div');
  container.id = 'playerTuningUI';
  container.style.cssText = `
    position: fixed;
    top: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.9);
    border: 1px solid #0f0;
    border-radius: 8px;
    padding: 15px;
    max-width: 300px;
    max-height: 80vh;
    overflow-y: auto;
    z-index: 10000;
    font-family: monospace;
    font-size: 12px;
    color: #0f0;
    display: none;
  `;

  const title = document.createElement('h3');
  title.textContent = '🎛️ Tuning Panel';
  title.style.cssText = 'margin: 0 0 10px 0; font-size: 14px; text-align: center;';
  container.appendChild(title);

  // Generate controls for player-exposed config
  const uiData = configSystem.generatePlayerUI();
  
  for (const item of uiData) {
    const group = document.createElement('div');
    group.style.cssText = 'margin-bottom: 12px; padding: 8px; background: rgba(0, 255, 0, 0.05); border-radius: 4px;';

    const label = document.createElement('label');
    label.textContent = item.label;
    label.style.cssText = 'display: block; margin-bottom: 4px; font-weight: bold; font-size: 11px;';
    group.appendChild(label);

    const input = document.createElement('input');
    input.type = item.type === 'boolean' ? 'checkbox' : 'number';
    input.value = item.value;
    input.step = item.type === 'number' ? '0.01' : undefined;
    
    if (item.type === 'boolean') {
      input.checked = item.value;
    }

    input.style.cssText = 'width: 100%; padding: 4px; background: #000; border: 1px solid #0f0; color: #0f0; border-radius: 3px;';
    
    input.addEventListener('change', () => {
      const value = input.type === 'checkbox' ? input.checked : parseFloat(input.value);
      configSystem.set(item.path, value);
    });

    group.appendChild(input);
    container.appendChild(group);
  }

  // Add close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.style.cssText = 'width: 100%; padding: 8px; background: #0f0; color: #000; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; margin-top: 10px;';
  closeBtn.addEventListener('click', () => {
    container.style.display = 'none';
  });
  container.appendChild(closeBtn);

  document.body.appendChild(container);

  // Add toggle button
  const toggleBtn = document.createElement('button');
  toggleBtn.textContent = '🎛️';
  toggleBtn.title = 'Open Tuning Panel';
  toggleBtn.style.cssText = `
    position: fixed;
    top: 10px;
    left: 10px;
    background: rgba(0, 255, 0, 0.2);
    border: 1px solid #0f0;
    color: #0f0;
    font-size: 20px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    z-index: 9999;
  `;
  toggleBtn.addEventListener('click', () => {
    container.style.display = container.style.display === 'none' ? 'block' : 'none';
  });
  document.body.appendChild(toggleBtn);

  console.log('🎛️ Player tuning UI created');
  return { container, toggleBtn };
}

/**
 * Initialize debug console commands
 */
export function initializeDebugCommands() {
  window.celli = window.celli || {};
  
  window.celli.config = configSystem;
  window.celli.assets = assetPool;
  window.celli.sequences = sequenceEngine;
  window.celli.audio = audioSystem;

  window.celli.showTuning = () => {
    const ui = document.getElementById('playerTuningUI');
    if (ui) ui.style.display = 'block';
  };

  window.celli.hideTuning = () => {
    const ui = document.getElementById('playerTuningUI');
    if (ui) ui.style.display = 'none';
  };

  window.celli.exportConfig = () => {
    const json = configSystem.export();
    console.log('📋 Copy this configuration:');
    console.log(json);
    return json;
  };

  window.celli.resetConfig = () => {
    if (confirm('Reset all configuration to defaults?')) {
      for (const category of Object.keys(configSystem.config)) {
        configSystem.resetCategory(category);
      }
      console.log('✅ Configuration reset');
    }
  };

  console.log('🐛 Debug commands available at window.celli');
  console.log('  - celli.config (configuration system)');
  console.log('  - celli.assets (asset pool)');
  console.log('  - celli.sequences (sequence engine)');
  console.log('  - celli.audio (audio system)');
  console.log('  - celli.showTuning() (show tuning UI)');
  console.log('  - celli.exportConfig() (export config)');
  console.log('  - celli.resetConfig() (reset to defaults)');
}

export default {
  initializeSystems,
  preloadAssets,
  createPlayerTuningUI,
  initializeDebugCommands,
  registerDefaultConfig,
  registerAssets
};


