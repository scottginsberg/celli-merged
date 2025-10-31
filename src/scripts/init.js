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
import appConfig from './config.js';

const mediaConfig = appConfig.media || {};
const introVideoConfig = mediaConfig.introVideo || {};
const keyMomentsVideoConfig = mediaConfig.keyMoments || {};
const audioConfig = mediaConfig.audio || {};
const themeAudioConfig = audioConfig.theme || {};
const keyAudioConfig = audioConfig.key || {};
const popUpAudioConfig = audioConfig.popUp || {};

const omitPreload = (settings = {}, extra = {}) => {
  const { preload, ...rest } = settings;
  return { ...rest, ...extra };
};

const INTRO_VIDEO_ASSETS = [
  { key: 'video_intro_primary', url: './intro.mp4', label: 'Intro Sequence 1' },
  { key: 'video_intro_variant_2', url: './intro2.mp4', label: 'Intro Sequence 2' },
  { key: 'video_intro_variant_3', url: './intro3.mp4', label: 'Intro Sequence 3' },
  { key: 'video_intro_variant_4', url: './intro4.mp4', label: 'Intro Sequence 4' },
  { key: 'video_intro_variant_5', url: './intro5.mp4', label: 'Intro Sequence 5' },
  { key: 'video_intro_variant_6', url: './intro6.mp4', label: 'Intro Sequence 6' },
  { key: 'video_intro_variant_7', url: './intro7.mp4', label: 'Intro Sequence 7' }
];

const KEY_VIDEO_ASSETS = [
  { key: 'video_key_primary', url: './key.MP4', variant: 'primary' },
  { key: 'video_key_alternate_a', url: './Key2.MP4', variant: 'alternate-a' },
  { key: 'video_key_alternate_b', url: './Key%202.MP4', variant: 'alternate-b' }
];

const THEME_AUDIO_ASSETS = [
  { key: 'audio_theme_primary', url: './theme1.mp3', variant: 'primary' },
  { key: 'audio_theme_secondary', url: './theme2.mp3', variant: 'secondary' }
];

const OPTIONAL_AUDIO_ASSETS = [
  {
    key: 'audio_key_motif',
    url: './key.mp3',
    settings: keyAudioConfig,
    optional: true,
    tags: ['key'],
    variant: 'key-motif'
  },
  {
    key: 'audio_pop_up',
    url: './pop-up.mp3',
    settings: popUpAudioConfig,
    optional: true,
    tags: ['ui'],
    variant: 'pop-up'
  }
];

/**
 * Canonical manifest of static assets used by the application.
 * Build and deployment tooling can import this object (or the helper
 * `getAssetManifest`) to copy/link the real media files without creating
 * placeholder artifacts.
 */
export const assetManifest = {
  shader_blackhole_vert: {
    url: './src/assets/shaders/blackhole.vert.glsl',
    type: 'shader',
    preload: true,
    tags: ['shader', 'core'],
    metadata: { label: 'Blackhole Vertex Shader' }
  },
  shader_blackhole_frag: {
    url: './src/assets/shaders/blackhole.frag.glsl',
    type: 'shader',
    preload: true,
    tags: ['shader', 'core'],
    metadata: { label: 'Blackhole Fragment Shader' }
  },
  quotes: {
    url: './src/data/quotes.json',
    type: 'json',
    preload: true,
    tags: ['data', 'narrative'],
    metadata: { label: 'Quote Data' }
  }
};

INTRO_VIDEO_ASSETS.forEach((asset, index) => {
  assetManifest[asset.key] = {
    url: asset.url,
    type: 'video',
    preload: introVideoConfig.preload ?? true,
    tags: ['video', 'intro'],
    metadata: omitPreload(introVideoConfig, {
      order: index + 1,
      label: asset.label
    })
  };
});

KEY_VIDEO_ASSETS.forEach((asset, index) => {
  assetManifest[asset.key] = {
    url: asset.url,
    type: 'video',
    preload: keyMomentsVideoConfig.preload ?? false,
    tags: ['video', 'key'],
    metadata: omitPreload(keyMomentsVideoConfig, {
      order: index + 1,
      variant: asset.variant
    })
  };
});

THEME_AUDIO_ASSETS.forEach((asset, index) => {
  assetManifest[asset.key] = {
    url: asset.url,
    type: 'audio',
    preload: themeAudioConfig.preload ?? true,
    tags: ['audio', 'theme', 'music'],
    metadata: omitPreload(themeAudioConfig, {
      order: index + 1,
      variant: asset.variant
    })
  };
});

OPTIONAL_AUDIO_ASSETS.forEach(asset => {
  const { settings = {}, optional = false, tags = [] } = asset;
  assetManifest[asset.key] = {
    url: asset.url,
    type: 'audio',
    preload: settings.preload ?? false,
    optional,
    tags: ['audio', ...tags],
    metadata: omitPreload(settings, { variant: asset.variant })
  };
});

export const getAssetManifest = () => JSON.parse(JSON.stringify(assetManifest));

/**
 * Register all default configuration
 */
export function registerDefaultConfig() {
  console.group('⚙️ Registering default configuration...');

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

  console.groupEnd();
  console.log('✅ Configuration registered');
}

/**
 * Register all assets for preloading
 */
export function registerAssets() {
  console.group('📦 Registering assets...');

  assetPool.registerBatch(assetManifest);

  Object.entries(assetManifest).forEach(([key, config]) => {
    const preloadTag = config.preload ? 'preload' : 'lazy';
    const tagLabel = config.tags && config.tags.length
      ? ` tags:[${config.tags.join(', ')}]`
      : '';
    console.log(`➕ ${key} (${config.type}, ${preloadTag})${tagLabel}`);
  });

  console.groupEnd();
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
    await assetPool.loadAll({ preloadOnly: true });
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
  console.group('🔧 Initializing systems...');

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

  console.groupEnd();
  console.log('✅ Systems initialized');
}

/**
 * Setup configuration watchers for hot reload
 */
function setupConfigWatchers() {
  console.groupCollapsed('👀 Setting up config watchers');
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
  console.groupEnd();
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
  console.log('  - celli.exportConfig() (export config)');
  console.log('  - celli.resetConfig() (reset to defaults)');
}

export default {
  initializeSystems,
  preloadAssets,
  initializeDebugCommands,
  registerDefaultConfig,
  registerAssets
};


