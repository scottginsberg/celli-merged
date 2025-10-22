/**
 * Fullhand Scene - Complete Execution Environment
 * 
 * Full fidelity implementation with all details:
 * - Bust (upper body character model)
 * - Boss Celli (large voxel head with glowing features)
 * - Deforming Finger Tube (tracks keyboard)
 * - Detailed Keyboard (full QWERTY with labels)
 * - Advanced Lighting (per-key, spotlights)
 * - Dust Particles (floating, illuminated)
 */

import * as THREE from 'three';
import { assetPool } from '../systems/AssetPool.js';
import { ExecutionEnvironment } from './components/ExecutionEnvironment.js';

const FULLHAND_AUDIO_KEYS = {
  theme: 'audio_fullhand_leopard_os',
  clicker: 'sfx_fullhand_clicker',
  keySpam: [
    'sfx_fullhand_keyspam_primary',
    'sfx_fullhand_keyspam_variant_a',
    'sfx_fullhand_keyspam_variant_b',
    'sfx_fullhand_keyspam_variant_c'
  ]
};

const EXECUTION_ENV_MODE_STORAGE_KEY = 'fullhand_mode';
const EXECUTION_ENV_DEFAULT_MODE = 'sequence';

export class FullhandScene {
  constructor() {
    this.name = 'Fullhand';
    
    this.state = {
      scene: null,
      camera: null,
      renderer: null,
      
      // Execution environment (complete system)
      execEnv: null,
      
      // Mouse tracking
      mouse: { x: 0.5, y: 0.5 },
      
      // Animation
      typing: false,
      typingInterval: null,

      // State
      running: false,
      totalTime: 0,
      mode: EXECUTION_ENV_DEFAULT_MODE,

      audio: {
        objectUrls: new Map(),
        preparationPromise: null,
        theme: null,
        clicker: null,
        keySpamPool: []
      },

      audioReady: false,

      // Callbacks
      onComplete: null
    };
  }

  /**
   * Initialize scene
   */
  async init() {
    console.log('[FullhandScene] 🎬 Initializing Complete Execution Environment...');
    
    const app = document.getElementById('app');
    if (!app) return;
    
    // Create renderer
    this.state.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true // Enable screen recording
    });
    this.state.renderer.setSize(window.innerWidth, window.innerHeight);
    this.state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.state.renderer.shadowMap.enabled = true;
    this.state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    app.appendChild(this.state.renderer.domElement);
    
    // Create scene
    this.state.scene = new THREE.Scene();
    this.state.scene.background = new THREE.Color(0x0a0a0a);
    this.state.scene.fog = new THREE.Fog(0x0a0a0a, 5, 15);
    
    // Create camera
    this.state.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.state.camera.position.set(0, 3, 8);
    this.state.camera.lookAt(0, 1, 0);
    
    // Base ambient lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.state.scene.add(ambientLight);
    
    // Create complete execution environment
    this.state.execEnv = new ExecutionEnvironment(this.state.scene, this.state.camera);
    await this.state.execEnv.init();
    this.state.execEnv.show();
    if (typeof this.state.execEnv.setMode === 'function') {
      this.state.execEnv.setMode(this.state.mode);
    }
    
    // Setup mouse tracking
    this._setupMouseTracking();
    
    // Handle resize
    window.addEventListener('resize', () => this._handleResize());

    try {
      await this._prepareAudioAssets();
    } catch (error) {
      console.warn('[FullhandScene] ⚠️ Unable to prepare audio assets during init', error);
    }

    console.log('[FullhandScene] ✅ Complete Execution Environment initialized');
  }

  /**
   * Setup mouse tracking for finger
   */
  _setupMouseTracking() {
    window.addEventListener('mousemove', (e) => {
      this.state.mouse.x = e.clientX / window.innerWidth;
      this.state.mouse.y = e.clientY / window.innerHeight;
    });

    // Track keyboard presses
    window.addEventListener('keydown', (e) => {
      if (this.state.execEnv) {
        this.state.execEnv.pressKey(e.key.toUpperCase());
      }
    });
  }

  async _prepareAudioAssets() {
    const audioState = this.state.audio;

    if (audioState.preparationPromise) {
      return audioState.preparationPromise;
    }

    const preparationTasks = [];

    preparationTasks.push(
      this._prepareAudioHandle(FULLHAND_AUDIO_KEYS.theme, {
        storeKey: 'theme',
        loop: true,
        volume: 0.55
      })
    );

    preparationTasks.push(
      this._prepareAudioHandle(FULLHAND_AUDIO_KEYS.clicker, {
        storeKey: 'clicker',
        volume: 0.7
      })
    );

    FULLHAND_AUDIO_KEYS.keySpam.forEach((assetKey, index) => {
      preparationTasks.push(
        this._prepareAudioHandle(assetKey, {
          pushToKeySpam: true,
          volume: 0.65 + (index * 0.02)
        })
      );
    });

    audioState.preparationPromise = (async () => {
      await Promise.all(preparationTasks);
      this.state.audioReady = true;
      console.log('[FullhandScene] 🎧 Audio assets warmed for Fullhand scene');
    })();

    return audioState.preparationPromise;
  }

  async _getAudioObjectUrl(assetKey) {
    if (!assetKey) return null;

    const audioState = this.state.audio;

    if (!audioState.objectUrls) {
      audioState.objectUrls = new Map();
    }

    if (audioState.objectUrls.has(assetKey)) {
      return audioState.objectUrls.get(assetKey);
    }

    const assetEntry = assetPool.assets?.get(assetKey) || null;
    let assetData = assetEntry?.data || null;

    if (!assetData) {
      try {
        assetData = await assetPool.load(assetKey);
      } catch (error) {
        console.warn(`[FullhandScene] ⚠️ Failed to load audio asset ${assetKey}`, error);
        return null;
      }
    }

    if (!assetData) {
      console.warn(`[FullhandScene] ⚠️ Audio asset ${assetKey} returned no data`);
      return null;
    }

    if (typeof Blob === 'undefined' || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
      console.warn(`[FullhandScene] ⚠️ Browser does not support Blob URLs for ${assetKey}`);
      return null;
    }

    try {
      const blob = new Blob([assetData], { type: 'audio/mpeg' });
      const objectUrl = URL.createObjectURL(blob);
      audioState.objectUrls.set(assetKey, objectUrl);
      return objectUrl;
    } catch (error) {
      console.warn(`[FullhandScene] ⚠️ Unable to create object URL for ${assetKey}`, error);
      return null;
    }
  }

  async _prepareAudioHandle(assetKey, options = {}) {
    const objectUrl = await this._getAudioObjectUrl(assetKey);
    const wasPreloaded = assetPool.loaded?.has?.(assetKey) ?? false;

    if (!objectUrl) {
      console.warn(`[FullhandScene] ⚠️ Audio asset ${assetKey} unavailable for scene`);
      return null;
    }

    if (options.pushToKeySpam) {
      const pool = this.state.audio.keySpamPool || [];
      if (!pool.some(item => item.assetKey === assetKey)) {
        pool.push({ assetKey, objectUrl, volume: options.volume });
      }
      this.state.audio.keySpamPool = pool;
    }

    console.log(`[FullhandScene] 🔊 Prepared audio asset ${assetKey} (preloaded=${wasPreloaded})`);

    if (typeof Audio === 'undefined') {
      return null;
    }

    try {
      const audio = new Audio(objectUrl);
      audio.preload = 'auto';

      if (typeof options.loop === 'boolean') {
        audio.loop = options.loop;
      }

      if (typeof options.volume === 'number') {
        audio.volume = options.volume;
      }

      if (options.storeKey) {
        this.state.audio[options.storeKey] = audio;
      }

      return audio;
    } catch (error) {
      console.warn(`[FullhandScene] ⚠️ Unable to construct audio element for ${assetKey}`, error);
      return null;
    }
  }

  _playKeySpamSfx() {
    if (typeof Audio === 'undefined') {
      return;
    }

    const pool = this.state.audio.keySpamPool || [];
    if (!pool.length) {
      return;
    }

    const choice = pool[Math.floor(Math.random() * pool.length)];
    if (!choice?.objectUrl) {
      return;
    }

    try {
      const audio = new Audio(choice.objectUrl);
      audio.preload = 'auto';
      if (typeof choice.volume === 'number') {
        audio.volume = choice.volume;
      } else if (this.state.audio.clicker && typeof this.state.audio.clicker.volume === 'number') {
        audio.volume = this.state.audio.clicker.volume;
      }
      audio.play().catch(() => {});
    } catch (error) {
      console.warn('[FullhandScene] ⚠️ Unable to play key-spam SFX', error);
    }
  }

  async _playThemeTrack() {
    try {
      await this._prepareAudioAssets();
      const theme = this.state.audio.theme;
      if (!theme) {
        console.warn('[FullhandScene] ⚠️ LeopardOS theme not ready for playback');
        return;
      }

      theme.loop = true;
      theme.currentTime = 0;
      const playPromise = theme.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(error => {
          console.warn('[FullhandScene] ⚠️ Unable to autoplay LeopardOS theme', error);
        });
      }
    } catch (error) {
      console.warn('[FullhandScene] ⚠️ Error preparing LeopardOS theme', error);
    }
  }

  _stopThemeTrack() {
    const theme = this.state.audio.theme;
    if (!theme) {
      return;
    }

    try {
      theme.pause();
      theme.currentTime = 0;
    } catch (error) {
      console.warn('[FullhandScene] ⚠️ Error stopping LeopardOS theme', error);
    }
  }

  _cleanupAudioResources() {
    this._stopThemeTrack();

    if (this.state.audio.clicker) {
      try {
        this.state.audio.clicker.pause();
      } catch (error) {
        console.warn('[FullhandScene] ⚠️ Error resetting clicker audio', error);
      }
    }

    this.state.audio.theme = null;
    this.state.audio.clicker = null;
    this.state.audio.keySpamPool = [];
    this.state.audio.preparationPromise = null;
    this.state.audioReady = false;

    if (this.state.audio.objectUrls && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
      this.state.audio.objectUrls.forEach((objectUrl, assetKey) => {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch (error) {
          console.warn(`[FullhandScene] ⚠️ Failed to revoke object URL for ${assetKey}`, error);
        }
      });
      this.state.audio.objectUrls.clear();
    }
  }

  /**
   * Start typing animation
   */
  _startTyping() {
    if (this.state.typing) return;
    
    this.state.typing = true;
    
    // Simulate random key presses
    this.state.typingInterval = setInterval(() => {
      if (!this.state.running) {
        this._stopTyping();
        return;
      }
      
      // Press random key
      const keys = ['A', 'S', 'D', 'F', 'J', 'K', 'L'];
      const randomKey = keys[Math.floor(Math.random() * keys.length)];

      if (this.state.execEnv) {
        this.state.execEnv.pressKey(randomKey);
      }

      this._playKeySpamSfx();
    }, 300 + Math.random() * 200);
    
    console.log('[FullhandScene] ⌨️ Started typing animation');
  }

  /**
   * Stop typing animation
   */
  _stopTyping() {
    if (this.state.typingInterval) {
      clearInterval(this.state.typingInterval);
      this.state.typingInterval = null;
    }
    this.state.typing = false;
  }

  _resolveRequestedMode(requestedMode) {
    if (requestedMode === 'sequence' || requestedMode === 'debug') {
      return requestedMode;
    }

    try {
      const saved = window.localStorage?.getItem(EXECUTION_ENV_MODE_STORAGE_KEY);
      if (saved === 'sequence' || saved === 'debug') {
        return saved;
      }
    } catch (error) {
      console.warn('[FullhandScene] Unable to read stored execution mode:', error);
    }

    if (this.state.mode === 'sequence' || this.state.mode === 'debug') {
      return this.state.mode;
    }

    return EXECUTION_ENV_DEFAULT_MODE;
  }

  setMode(mode) {
    if (mode !== 'sequence' && mode !== 'debug') {
      console.warn('[FullhandScene] Ignoring unsupported mode:', mode);
      mode = EXECUTION_ENV_DEFAULT_MODE;
    }

    this.state.mode = mode;

    try {
      window.localStorage?.setItem(EXECUTION_ENV_MODE_STORAGE_KEY, mode);
    } catch (error) {
      console.warn('[FullhandScene] Unable to persist execution mode:', error);
    }

    if (this.state.execEnv && typeof this.state.execEnv.setMode === 'function') {
      this.state.execEnv.setMode(mode);
    }

    if (!this.state.running) {
      return;
    }

    if (mode === 'sequence') {
      this._startTyping();
    } else {
      this._stopTyping();
    }
  }

  /**
   * Start scene
   */
  async start(_, options = {}) {
    console.log('[FullhandScene] ▶️ Starting Complete Execution Environment');
    this.state.running = true;

    const mode = this._resolveRequestedMode(options.mode);
    this.setMode(mode);

    if (options.playTheme !== false) {
      await this._playThemeTrack();
    } else {
      console.log('[FullhandScene] 🎵 Theme playback skipped via options');
    }
  }

  /**
   * Update scene
   */
  update(deltaTime, totalTime) {
    if (!this.state.running) return;
    
    this.state.totalTime = totalTime;
    
    // Update execution environment (finger tracking, dust, animations)
    if (this.state.execEnv) {
      this.state.execEnv.update(deltaTime || 0.016, this.state.mouse);
    }
    
    // Gentle camera orbit
    if (this.state.camera) {
      const radius = 8;
      const speed = 0.0003;
      this.state.camera.position.x = Math.sin(totalTime * speed) * radius * 0.3;
      this.state.camera.position.y = 3 + Math.sin(totalTime * speed * 0.5) * 0.5;
      this.state.camera.lookAt(0, 1.5, 0);
    }
    
    // Render
    if (this.state.renderer && this.state.scene && this.state.camera) {
      this.state.renderer.render(this.state.scene, this.state.camera);
    }
  }

  /**
   * Handle window resize
   */
  _handleResize() {
    if (!this.state.camera || !this.state.renderer) return;
    
    this.state.camera.aspect = window.innerWidth / window.innerHeight;
    this.state.camera.updateProjectionMatrix();
    
    this.state.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Stop scene
   */
  stop() {
    console.log('⏹️ Stopping Fullhand Scene');
    this.state.running = false;
    this._stopTyping();
    this._stopThemeTrack();
  }

  /**
   * Destroy scene
   */
  destroy() {
    console.log('[FullhandScene] 🗑️ Destroying...');

    this.stop();
    this._cleanupAudioResources();

    // Destroy execution environment
    if (this.state.execEnv) {
      this.state.execEnv.destroy();
    }
    
    // Dispose renderer
    if (this.state.renderer) {
      this.state.renderer.dispose();
      if (this.state.renderer.domElement.parentNode) {
        this.state.renderer.domElement.parentNode.removeChild(this.state.renderer.domElement);
      }
    }
    
    console.log('[FullhandScene] ✅ Destroyed');
  }
}

export default FullhandScene;


