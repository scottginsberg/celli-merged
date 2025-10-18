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
    
    console.log('[FullhandScene] ✅ Destroyed');
  }
}

export default FullhandScene;


