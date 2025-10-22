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
import { ExecutionEnvironment } from './components/ExecutionEnvironment.js';

const EXECUTION_ENV_MODE_STORAGE_KEY = 'fullhand_mode';
const EXECUTION_ENV_DEFAULT_MODE = 'sequence';
const VISICELL_COMPLETION_EVENT = 'visicell_sequence_complete';
const VISICELL_COMPLETION_STORAGE_KEY = 'fullhand_visicell_completion_handled';

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

      // Completion effects
      visiCellCompletionHandled: false,
      visiCellCompletionActive: false,
      flashOverlay: null,
      activeAudio: [],
      visiCellListener: null,

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
    
    // Load completion state
    this._restoreVisiCellCompletionState();

    // Setup mouse tracking
    this._setupMouseTracking();

    // Handle resize
    window.addEventListener('resize', () => this._handleResize());

    // Listen for VisiCell completion
    this._attachVisiCellCompletionListener();

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
    this._stopActiveAudio();
  }

  /**
   * Destroy scene
   */
  destroy() {
    console.log('[FullhandScene] 🗑️ Destroying...');
    
    this.stop();
    
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

    this._detachVisiCellCompletionListener();
    this._teardownFlashOverlay();
    this._stopActiveAudio();

    console.log('[FullhandScene] ✅ Destroyed');
  }

  /**
   * Reset completion effect flag (manual override)
   */
  resetVisiCellCompletionEffects() {
    this.state.visiCellCompletionHandled = false;

    try {
      window.localStorage?.removeItem(VISICELL_COMPLETION_STORAGE_KEY);
    } catch (error) {
      console.warn('[FullhandScene] Unable to clear VisiCell completion state:', error);
    }
  }

  _restoreVisiCellCompletionState() {
    if (typeof window === 'undefined') {
      this.state.visiCellCompletionHandled = false;
      return;
    }

    try {
      const stored = window.localStorage?.getItem(VISICELL_COMPLETION_STORAGE_KEY);
      this.state.visiCellCompletionHandled = stored === 'true';
    } catch (error) {
      this.state.visiCellCompletionHandled = false;
      console.warn('[FullhandScene] Unable to restore VisiCell completion state:', error);
    }
  }

  _persistVisiCellCompletionState() {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage?.setItem(
        VISICELL_COMPLETION_STORAGE_KEY,
        this.state.visiCellCompletionHandled ? 'true' : 'false'
      );
    } catch (error) {
      console.warn('[FullhandScene] Unable to persist VisiCell completion state:', error);
    }
  }

  _attachVisiCellCompletionListener() {
    if (typeof window === 'undefined' || !window.addEventListener) {
      return;
    }

    if (this.state.visiCellListener) {
      window.removeEventListener(VISICELL_COMPLETION_EVENT, this.state.visiCellListener);
    }

    this.state.visiCellListener = (event) => {
      if (this.state.visiCellCompletionHandled || this.state.visiCellCompletionActive) {
        return;
      }

      this.state.visiCellCompletionActive = true;
      this._playVisiCellCompletionSequence(event?.detail || {})
        .catch((error) => {
          console.warn('[FullhandScene] VisiCell completion sequence failed:', error);
        })
        .finally(() => {
          this.state.visiCellCompletionActive = false;
        });
    };

    window.addEventListener(VISICELL_COMPLETION_EVENT, this.state.visiCellListener);

    // Expose manual reset helper for debugging
    window.celliDebug = window.celliDebug || {};
    window.celliDebug.resetFullhandVisiCell = () => this.resetVisiCellCompletionEffects();
  }

  _detachVisiCellCompletionListener() {
    if (typeof window === 'undefined' || !this.state.visiCellListener) {
      return;
    }

    window.removeEventListener(VISICELL_COMPLETION_EVENT, this.state.visiCellListener);
    this.state.visiCellListener = null;
  }

  async _playVisiCellCompletionSequence(detail) {
    if (!detail || typeof detail !== 'object') {
      detail = {};
    }

    this.state.visiCellCompletionHandled = true;
    this._persistVisiCellCompletionState();

    const overlay = this._ensureFlashOverlay();
    this._animateFlashOverlay(overlay);

    try {
      await this._playAudioSequentially([
        { url: './leopardOS.mp3', volume: 0.82 },
        { url: './clicker.mp3', volume: 0.75 }
      ]);
    } finally {
      this._scheduleFlashOverlayRemoval();
    }
  }

  _ensureFlashStyles() {
    if (typeof document === 'undefined') {
      return;
    }

    const existing = document.getElementById('fullhand-flash-overlay-style');
    if (existing) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'fullhand-flash-overlay-style';
    style.textContent = `
      @keyframes fullhandFlashPulse {
        0% { opacity: 0; filter: brightness(1); }
        6% { opacity: 1; filter: brightness(1.45); }
        35% { opacity: 0.5; filter: brightness(1.2); }
        65% { opacity: 0.25; filter: brightness(1.05); }
        100% { opacity: 0; filter: brightness(1); }
      }

      #fullhand-flash-overlay {
        position: fixed;
        inset: 0;
        background: radial-gradient(circle at center, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.7) 35%, rgba(255, 255, 255, 0) 75%),
          rgba(255, 255, 255, 0.6);
        mix-blend-mode: screen;
        pointer-events: none;
        opacity: 0;
        z-index: 4000;
      }

      #fullhand-flash-overlay.is-active {
        animation: fullhandFlashPulse 1800ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }
    `;

    document.head.appendChild(style);
  }

  _ensureFlashOverlay() {
    if (typeof document === 'undefined') {
      return null;
    }

    if (this.state.flashOverlay && document.body.contains(this.state.flashOverlay)) {
      return this.state.flashOverlay;
    }

    this._ensureFlashStyles();

    const overlay = document.createElement('div');
    overlay.id = 'fullhand-flash-overlay';
    document.body.appendChild(overlay);

    this.state.flashOverlay = overlay;
    return overlay;
  }

  _animateFlashOverlay(overlay) {
    if (!overlay) {
      return;
    }

    overlay.classList.remove('is-active');

    requestAnimationFrame(() => {
      overlay.classList.add('is-active');
    });
  }

  _scheduleFlashOverlayRemoval() {
    if (!this.state.flashOverlay) {
      return;
    }

    if (typeof window === 'undefined') {
      this._teardownFlashOverlay();
      return;
    }

    window.setTimeout(() => {
      this._teardownFlashOverlay();
    }, 2200);
  }

  _teardownFlashOverlay() {
    if (this.state.flashOverlay && this.state.flashOverlay.parentNode) {
      this.state.flashOverlay.classList.remove('is-active');
      this.state.flashOverlay.remove();
    }
    this.state.flashOverlay = null;
  }

  async _playAudioSequentially(clips = []) {
    for (const clip of clips) {
      await this._playAudio(clip);
    }
  }

  _playAudio({ url, volume = 1 }) {
    return new Promise((resolve) => {
      try {
        const audio = new Audio(url);
        audio.volume = volume;
        this.state.activeAudio.push(audio);

        const cleanup = () => {
          audio.removeEventListener('ended', onEnded);
          audio.removeEventListener('error', onError);
          this.state.activeAudio = this.state.activeAudio.filter((item) => item !== audio);
          resolve();
        };

        const onEnded = () => cleanup();
        const onError = (event) => {
          console.warn('[FullhandScene] Audio playback error:', url, event?.error || event);
          cleanup();
        };

        audio.addEventListener('ended', onEnded, { once: true });
        audio.addEventListener('error', onError, { once: true });

        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.catch((error) => {
            console.warn('[FullhandScene] Unable to start audio playback:', url, error);
            cleanup();
          });
        } else {
          window.setTimeout(() => cleanup(), 2500);
        }
      } catch (error) {
        console.warn('[FullhandScene] Failed to play audio clip:', url, error);
        resolve();
      }
    });
  }

  _stopActiveAudio() {
    if (!this.state.activeAudio || this.state.activeAudio.length === 0) {
      return;
    }

    this.state.activeAudio.forEach((audio) => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (error) {
        console.warn('[FullhandScene] Unable to stop audio element:', error);
      }
    });

    this.state.activeAudio = [];
  }
}

export default FullhandScene;


