/**
 * LEAVE Scene - House of Leaves Sequence
 *
 * Features:
 * - Ozymandias puzzle
 * - House labyrinth
 * - GIR.mp3 transformation
 *
 * Ported from merged2.html
 */

import * as THREE from 'three';
import { sceneManager } from '../core/SceneManager.js';
import { puzzleEventBus } from '../systems/PuzzleEventBus.js';

export class LeaveScene {
  constructor(config = {}) {
    this.config = {
      startPuzzle: 'ozymandias',
      ...config
    };

    this.state = {
      running: false,
      totalTime: 0,
      scene: null,
      camera: null,
      renderer: null,

      // Puzzle state
      ozymandiasActive: false,
      ozymandiasText: '',
      ozymandiasSolved: false,
      ozymandiasOverlay: null,

      // Labyrinth state
      labyrinthActive: false,
      currentRoom: 0,
      rooms: [],
      labyrinthOverlay: null,

      // GIR transformation state
      girActive: false,
      transformProgress: 0
    };

    this._chainReady = false;
    this.subscriptions = [];
  }

  /**
   * Initialize scene
   */
  async init() {
    console.log('🏠 Initializing LEAVE Scene...');

    const app = document.getElementById('app');

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true // Enable screen recording
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    app.appendChild(renderer.domElement);

    // Create scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Store references
    this.state.scene = scene;
    this.state.camera = camera;
    this.state.renderer = renderer;

    // Setup resize handler
    window.addEventListener('resize', () => this._handleResize());

    this._ensurePuzzleChainListeners();

    console.log('✅ LEAVE Scene initialized');
  }

  /**
   * Start scene
   */
  async start(state, options = {}) {
    console.log('▶️ Starting LEAVE Scene');

    const startOptions = {
      ...this.config,
      ...options
    };

    if (startOptions.startPuzzle === 'labyrinth') {
      this._startLabyrinth(startOptions);
    } else {
      this._startOzymandiasSystem(startOptions);
    }

    this.state.running = true;

    console.log('✅ LEAVE Scene started');
  }

  /**
   * Start Ozymandias puzzle system
   */
  _startOzymandiasSystem(options = {}) {
    console.log('📜 Starting Ozymandias puzzle...');
    if (this.state.ozymandiasActive) {
      return;
    }

    this.state.ozymandiasActive = true;
    this.state.ozymandiasSolved = false;

    puzzleEventBus.emitRiddleAvailable('ozymandias', {
      scene: 'leave',
      options
    });

    if (typeof document === 'undefined') {
      return;
    }

    this._removeOverlay(this.state.ozymandiasOverlay);

    const overlay = document.createElement('div');
    overlay.id = 'ozymandias-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      pointer-events: auto;
    `;

    overlay.innerHTML = `
      <div style="max-width: 600px; padding: 40px; text-align: center;">
        <h2 style="color: #0f0; font-family: 'VT323', monospace; font-size: 32px; margin-bottom: 20px;">
          OZYMANDIAS PUZZLE
        </h2>
        <p style="color: #0a8; font-family: 'Courier New', monospace; line-height: 1.6;">
          "I met a traveller from an antique land..."
        </p>
        <p style="color: #0f0; margin-top: 30px; font-family: 'VT323', monospace;">
          Solve the puzzle to proceed to the House of Leaves
        </p>
        <div style="display: flex; gap: 16px; justify-content: center; margin-top: 30px; flex-wrap: wrap;">
          <button id="ozymandias-complete" style="padding: 15px 30px; background: #0f0; color: #000; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
            Mark Puzzle Solved
          </button>
          <button id="ozymandias-skip" style="padding: 15px 30px; background: #0a8; color: #000; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
            Skip Puzzle (For Now)
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.state.ozymandiasOverlay = overlay;

    const resolvePuzzle = (skipped) => {
      this._removeOverlay(this.state.ozymandiasOverlay);
      this.state.ozymandiasOverlay = null;
      this._completeOzymandias({ skipped, options });
    };

    const completeButton = overlay.querySelector('#ozymandias-complete');
    if (completeButton) {
      completeButton.addEventListener('click', () => resolvePuzzle(false));
    }

    const skipButton = overlay.querySelector('#ozymandias-skip');
    if (skipButton) {
      skipButton.addEventListener('click', () => {
        console.log('⏩ Skipping Ozymandias puzzle');
        resolvePuzzle(true);
      });
    }
  }

  _completeOzymandias(context = {}) {
    if (!this.state.ozymandiasActive || this.state.ozymandiasSolved) {
      return;
    }

    this.state.ozymandiasSolved = true;
    this.state.ozymandiasActive = false;

    puzzleEventBus.emitRiddleSolved('ozymandias', {
      scene: 'leave',
      skipped: Boolean(context.skipped),
      options: context.options
    });
  }

  /**
   * Start labyrinth sequence
   */
  _startLabyrinth(options = {}) {
    console.log('🏚️ Starting House of Leaves labyrinth...');
    if (this.state.labyrinthActive) {
      return;
    }

    this.state.labyrinthActive = true;

    puzzleEventBus.emitRiddleAvailable('houseofleaves', {
      scene: 'leave',
      options
    });

    if (typeof document === 'undefined') {
      return;
    }

    this._removeOverlay(this.state.labyrinthOverlay);

    const overlay = document.createElement('div');
    overlay.id = 'labyrinth-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 20, 0.98);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      pointer-events: auto;
    `;

    overlay.innerHTML = `
      <div style="max-width: 700px; padding: 40px; text-align: center;">
        <h2 style="color: #4a90e2; font-family: 'VT323', monospace; font-size: 28px; margin-bottom: 20px;">
          HOUSE OF LEAVES
        </h2>
        <p style="color: #6ba3d8; font-family: 'Courier New', monospace; line-height: 1.8; font-style: italic;">
          The house is bigger on the inside...
        </p>
        <div style="margin-top: 30px; color: #4a90e2; font-family: 'VT323', monospace;">
          Navigation: Arrow Keys<br>
          Escape: Return
        </div>
        <button id="labyrinth-return" style="margin-top: 30px; padding: 15px 30px; background: #4a90e2; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
          Return to Main
        </button>
      </div>
    `;

    document.body.appendChild(overlay);
    this.state.labyrinthOverlay = overlay;

    const returnButton = overlay.querySelector('#labyrinth-return');
    if (returnButton) {
      returnButton.addEventListener('click', () => {
        console.log('🔙 Returning to main');
        this._removeOverlay(this.state.labyrinthOverlay);
        this.state.labyrinthOverlay = null;
        this._completeLabyrinth({ skipped: false, options });
      });
    }
  }

  _completeLabyrinth(context = {}) {
    if (!this.state.labyrinthActive) {
      return;
    }

    this.state.labyrinthActive = false;

    puzzleEventBus.emitRiddleSolved('houseofleaves', {
      scene: 'leave',
      skipped: Boolean(context.skipped),
      options: context.options
    });
  }

  /**
   * Update scene
   */
  update(state, deltaTime, totalTime) {
    if (!this.state.running) return;

    this.state.totalTime += deltaTime;

    // Render
    if (this.state.renderer && this.state.scene && this.state.camera) {
      this.state.renderer.render(this.state.scene, this.state.camera);
    }
  }

  /**
   * Handle window resize
   */
  _handleResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (this.state.renderer) {
      this.state.renderer.setSize(w, h);
    }

    if (this.state.camera) {
      this.state.camera.aspect = w / h;
      this.state.camera.updateProjectionMatrix();
    }
  }

  /**
   * Stop scene
   */
  async stop() {
    console.log('⏹️ Stopping LEAVE Scene');
    this.state.running = false;
    this.state.ozymandiasActive = false;
    this.state.labyrinthActive = false;

    this._cleanupOverlays();
  }

  /**
   * Destroy scene (cleanup)
   */
  async destroy() {
    await this.stop();

    this.subscriptions.forEach(unsub => {
      try {
        unsub();
      } catch (error) {
        console.warn('⚠️ Failed to unsubscribe puzzle listener', error);
      }
    });
    this.subscriptions = [];
    this._chainReady = false;

    this._disposeThreeResources();
  }

  _cleanupOverlays() {
    this._removeOverlay(this.state.ozymandiasOverlay);
    this.state.ozymandiasOverlay = null;
    this._removeOverlay(this.state.labyrinthOverlay);
    this.state.labyrinthOverlay = null;
  }

  _removeOverlay(overlay) {
    if (overlay && overlay.parentNode) {
      overlay.remove();
    }
  }

  _disposeThreeResources() {
    if (this.state.scene) {
      this.state.scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    }

    if (this.state.renderer && this.state.renderer.domElement) {
      this.state.renderer.domElement.remove();
      this.state.renderer.dispose();
    }
  }

  _ensurePuzzleChainListeners() {
    if (this._chainReady) {
      return;
    }

    this._chainReady = true;

    const advanceToOzymandias = (source, { context } = {}) => {
      sceneManager.transitionTo('ozymandias', {
        trigger: source,
        riddleContext: context
      });
    };

    this.subscriptions.push(
      puzzleEventBus.onRiddleSolved('sokoban', payload => advanceToOzymandias('sokoban', payload))
    );

    this.subscriptions.push(
      puzzleEventBus.onRiddleSolved('galaxy', payload => advanceToOzymandias('galaxy', payload))
    );

    this.subscriptions.push(
      puzzleEventBus.onRiddleSolved('ozymandias', ({ context }) => {
        this._startLabyrinth({ trigger: 'ozymandias', context });
      })
    );

    this.subscriptions.push(
      puzzleEventBus.onRiddleSolved('houseofleaves', ({ context }) => {
        sceneManager.transitionTo('cellireal', {
          trigger: 'houseofleaves',
          riddleContext: context
        });
      })
    );
  }
}

export default LeaveScene;
