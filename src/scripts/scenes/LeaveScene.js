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
import { puzzleStateManager } from '../systems/PuzzleStateManager.js';

const PIN_DIALOGUE_STORAGE_KEY = 'leave_pin_dialogue_shown';

export class LeaveScene {
  constructor() {
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
      ozymandiasPromptEl: null,

      // Labyrinth state
      labyrinthActive: false,
      currentRoom: 0,
      rooms: [],
      
      // GIR transformation state
      girActive: false,
      transformProgress: 0,

      // PIN dialogue state
      pinDialogueShown: false,
      pinDialogueActive: false,
      pinDialogueTimeouts: [],
      pinDialogueOverlay: null,
      pinDialoguePromise: null,
      pinDialogueResolve: null
    };
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

    console.log('✅ LEAVE Scene initialized');
  }

  /**
   * Start scene
   */
  async start(state, options = {}) {
    console.log('▶️ Starting LEAVE Scene');

    this._restorePinDialogueState();

    const wordleSolved = typeof puzzleStateManager?.isSolved === 'function'
      ? puzzleStateManager.isSolved('wordle-beta')
      : false;
    if (wordleSolved) {
      console.log('🧩 Beta Wordle flag detected — preparing Ozymandias handshake before the House of Leaves riddles.');
    } else {
      console.log('ℹ️ Beta Wordle flag not found in session; Ozymandias can still be attempted in story mode.');
    }

    // Show Ozymandias puzzle
    this._startOzymandiasSystem();

    this.state.running = true;
    
    console.log('✅ LEAVE Scene started');
  }

  /**
   * Start Ozymandias puzzle system
   */
  _startOzymandiasSystem() {
    if (this.state.ozymandiasSolved) {
      console.log('📜 Ozymandias already solved — entering labyrinth.');
      this._startLabyrinth();
      return;
    }

    if (typeof puzzleStateManager?.isSolved === 'function' && puzzleStateManager.isSolved('ozymandias')) {
      console.log('📜 Persisted Ozymandias flag detected — skipping puzzle overlay.');
      this.state.ozymandiasSolved = true;
      this._startLabyrinth();
      return;
    }

    console.log('📜 Starting Ozymandias puzzle...');
    this.state.ozymandiasActive = true;

    const overlay = document.createElement('div');
    overlay.id = 'ozymandias-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.98), rgba(8, 30, 16, 0.94));
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      pointer-events: auto;
      padding: 20px;
    `;

    overlay.innerHTML = `
      <div style="max-width: 640px; width: 100%; padding: 40px; text-align: center; border: 1px solid rgba(46, 194, 126, 0.35); border-radius: 18px; background: rgba(0, 8, 4, 0.88); box-shadow: 0 24px 48px rgba(0, 0, 0, 0.45);">
        <h2 style="color: #2ec27e; font-family: 'VT323', monospace; font-size: 34px; letter-spacing: 0.12em; margin-bottom: 16px;">
          OZYMANDIAS SIGNAL
        </h2>
        <p style="color: #9ef5c6; font-family: 'Courier New', monospace; line-height: 1.6; margin-bottom: 14px;">
          Encore resonance confirmed. The Beta Wordle flag lit the desert. Recite the traveller's final line to unlock the House of Leaves riddles.
        </p>
        <p id="ozymandiasPrompt" style="color: #64ffc0; font-family: 'VT323', monospace; font-size: 18px; margin-bottom: 22px;">
          Finish the incantation — punctuation optional.
        </p>
        <form id="ozymandiasForm" style="display: flex; flex-direction: column; gap: 16px;">
          <label for="ozymandiasAnswer" style="color: #c8ffe6; font-family: 'Inter', sans-serif; font-size: 16px; letter-spacing: 0.06em;">
            Look on my works, ye Mighty, and
          </label>
          <input
            id="ozymandiasAnswer"
            name="ozymandiasAnswer"
            type="text"
            autocomplete="off"
            placeholder="despair."
            style="padding: 14px 16px; border-radius: 10px; border: 1px solid rgba(46, 194, 126, 0.45); background: rgba(0, 0, 0, 0.65); color: #e9fff3; font-size: 18px; text-align: center; letter-spacing: 0.08em;"
            aria-describedby="ozymandiasHint"
          />
          <small id="ozymandiasHint" style="color: rgba(158, 245, 198, 0.75); font-family: 'Courier New', monospace;">
            Try the full proclamation — case-insensitive, spaces and commas optional. "Despair" alone also counts.
          </small>
          <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; margin-top: 8px;">
            <button type="submit" style="padding: 12px 26px; border-radius: 999px; border: 1px solid #2ec27e; background: #2ec27e; color: #00170c; font-weight: 600; letter-spacing: 0.08em; cursor: pointer;">
              Recite Incantation
            </button>
            <button type="button" id="ozymandiasSkip" style="padding: 12px 24px; border-radius: 999px; border: 1px solid rgba(158, 245, 198, 0.35); background: transparent; color: #9ef5c6; font-weight: 500; letter-spacing: 0.08em; cursor: pointer;">
              Skip (Story Mode)
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    const form = overlay.querySelector('#ozymandiasForm');
    const input = overlay.querySelector('#ozymandiasAnswer');
    const skipButton = overlay.querySelector('#ozymandiasSkip');
    this.state.ozymandiasOverlay = overlay;
    this.state.ozymandiasPromptEl = overlay.querySelector('#ozymandiasPrompt');

    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        this._validateOzymandiasAnswer(input ? input.value : '', { input });
      });
    }

    if (input) {
      input.addEventListener('input', () => {
        this._updateOzymandiasPrompt('Finish the traveller\'s warning to proceed.', 'info');
      });
      window.setTimeout(() => input.focus(), 0);
    }

    if (skipButton) {
      skipButton.addEventListener('click', () => {
        console.log('⏩ Skipping Ozymandias puzzle (story mode)');
        this._completeOzymandiasPuzzle({ resolution: 'skip' });
      });
    }
  }

  _updateOzymandiasPrompt(message, tone = 'info') {
    const promptEl = this.state.ozymandiasPromptEl;
    if (!promptEl) {
      return;
    }

    let color = '#64ffc0';
    if (tone === 'error') {
      color = '#ff7aa5';
    } else if (tone === 'success') {
      color = '#2ec27e';
    }

    promptEl.textContent = message;
    promptEl.style.color = color;
  }

  _validateOzymandiasAnswer(rawInput, context = {}) {
    const normalized = String(rawInput || '').trim();
    const canonical = normalized.toLowerCase().replace(/[^a-z]/g, '');
    const accepted = new Set([
      'lookonmyworksyemightyanddespair',
      'anddespair',
      'despair'
    ]);

    if (!canonical) {
      this._updateOzymandiasPrompt('Whisper the full line before the walls will open.', 'info');
      if (context.input) {
        context.input.focus();
      }
      return;
    }

    if (!accepted.has(canonical)) {
      this._updateOzymandiasPrompt('The traveller shakes their head — try the final proclamation again.', 'error');
      if (context.input) {
        context.input.focus();
        context.input.select?.();
      }
      return;
    }

    this._updateOzymandiasPrompt('Incantation confirmed. Hold tight — the house shifts.', 'success');
    this._completeOzymandiasPuzzle({
      resolution: canonical === 'despair' ? 'keyword' : 'recital',
      entry: normalized
    });
  }

  _completeOzymandiasPuzzle(metadata = {}) {
    if (this.state.ozymandiasSolved) {
      if (this.state.ozymandiasOverlay && this.state.ozymandiasOverlay.parentNode) {
        this.state.ozymandiasOverlay.remove();
      }
      this.state.ozymandiasOverlay = null;
      return;
    }

    this.state.ozymandiasSolved = true;
    this.state.ozymandiasActive = false;

    if (this.state.ozymandiasOverlay && this.state.ozymandiasOverlay.parentNode) {
      this.state.ozymandiasOverlay.remove();
    }
    this.state.ozymandiasOverlay = null;
    this.state.ozymandiasPromptEl = null;

    let recorded = false;
    try {
      if (typeof puzzleStateManager?.markSolved === 'function') {
        puzzleStateManager.markSolved('ozymandias', {
          source: 'leave-scene',
          ...metadata
        });
        recorded = true;
      }
    } catch (error) {
      console.warn('⚠️ Unable to persist Ozymandias puzzle state:', error);
    }

    if (!recorded && typeof window !== 'undefined') {
      try {
        window.dispatchEvent(
          new CustomEvent('celli:puzzle-solved', {
            detail: {
              puzzleId: 'ozymandias',
              status: 'solved',
              metadata: { source: 'leave-scene', ...metadata }
            }
          })
        );
      } catch (error) {
        console.warn('⚠️ Unable to broadcast Ozymandias completion event:', error);
      }
    }

    console.log('🗿 Ozymandias cipher resolved — releasing House of Leaves riddles.');
    this._startLabyrinth();
  }

  /**
   * Start labyrinth sequence
   */
  async _startLabyrinth() {
    if (this.state.labyrinthActive) {
      return;
    }

    console.log('🏚️ Starting House of Leaves labyrinth...');

    if (!this.state.pinDialogueShown) {
      try {
        const completed = await this._playPinDialogueSequence();
        if (completed) {
          this.state.pinDialogueShown = true;
          this._persistPinDialogueState();
        }
      } catch (error) {
        console.warn('⚠️ PIN dialogue sequence interrupted:', error);
      }
    }

    this.state.labyrinthActive = true;
    this._showLabyrinthOverlay();
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
    this.state.labyrinthActive = false;

    // Clean up overlays
    const ozyOverlay = document.getElementById('ozymandias-overlay');
    if (ozyOverlay) ozyOverlay.remove();
    this.state.ozymandiasOverlay = null;
    this.state.ozymandiasPromptEl = null;

    const labOverlay = document.getElementById('labyrinth-overlay');
    if (labOverlay) labOverlay.remove();

    this._clearPinDialogueSequence();
  }

  /**
   * Destroy scene (cleanup)
   */
  async destroy() {
    await this.stop();

    // Cleanup resources
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

  _restorePinDialogueState() {
    if (typeof window === 'undefined') {
      this.state.pinDialogueShown = false;
      return;
    }

    try {
      const stored = window.localStorage?.getItem(PIN_DIALOGUE_STORAGE_KEY);
      this.state.pinDialogueShown = stored === 'true';
    } catch (error) {
      this.state.pinDialogueShown = false;
      console.warn('⚠️ Unable to restore PIN dialogue state:', error);
    }
  }

  _persistPinDialogueState() {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage?.setItem(
        PIN_DIALOGUE_STORAGE_KEY,
        this.state.pinDialogueShown ? 'true' : 'false'
      );
    } catch (error) {
      console.warn('⚠️ Unable to persist PIN dialogue state:', error);
    }
  }

  _playPinDialogueSequence() {
    if (this.state.pinDialogueActive && this.state.pinDialoguePromise) {
      return this.state.pinDialoguePromise;
    }

    if (typeof document === 'undefined') {
      return Promise.resolve();
    }

    this.state.pinDialogueActive = true;

    this._clearPinDialogueSequence();

    const overlay = document.createElement('div');
    overlay.id = 'pin-dialogue-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(3, 6, 18, 0.85);
      backdrop-filter: blur(6px);
      color: #e4ecff;
      z-index: 1200;
      pointer-events: none;
      transition: opacity 360ms ease;
      opacity: 0;
    `;

    overlay.innerHTML = `
      <div style="max-width: 620px; width: 90%; text-align: center; font-family: 'Courier New', monospace; line-height: 1.8; letter-spacing: 0.08em;">
        <p id="pin-dialogue-line" style="font-size: 20px; color: #9bb6ff; margin: 0;"></p>
      </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });

    this.state.pinDialogueOverlay = overlay;

    const lines = [
      { text: 'Fine. I\'ll give you the PIN…', delay: 0 },
      { text: 'But you\'re responsible for what happens next.', delay: 2300 },
      { text: 'Memorize it. The house doesn\'t like repeats.', delay: 4600 }
    ];

    const captionEl = overlay.querySelector('#pin-dialogue-line');
    const timeouts = [];

    lines.forEach((line) => {
      const timeout = window.setTimeout(() => {
        if (captionEl) {
          captionEl.textContent = line.text;
        }
      }, line.delay);
      timeouts.push(timeout);
    });

    const totalDuration = lines[lines.length - 1].delay + 2800;

    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
      this.state.pinDialogueResolve = resolve;
    });

    const completionTimeout = window.setTimeout(() => {
      overlay.style.opacity = '0';
      window.setTimeout(() => {
        if (overlay.parentNode) {
          overlay.remove();
        }
        this.state.pinDialogueOverlay = null;
        this.state.pinDialogueActive = false;
        this.state.pinDialogueTimeouts = [];
        if (typeof resolvePromise === 'function') {
          resolvePromise(true);
        }
        this.state.pinDialogueResolve = null;
      }, 420);
    }, totalDuration);

    timeouts.push(completionTimeout);
    this.state.pinDialogueTimeouts = timeouts;

    this.state.pinDialoguePromise = promise;
    return promise.finally(() => {
      this.state.pinDialoguePromise = null;
      this.state.pinDialogueResolve = null;
    });
  }

  _clearPinDialogueSequence() {
    if (this.state.pinDialogueTimeouts.length) {
      this.state.pinDialogueTimeouts.forEach((id) => clearTimeout(id));
      this.state.pinDialogueTimeouts = [];
    }

    if (this.state.pinDialogueOverlay && this.state.pinDialogueOverlay.parentNode) {
      this.state.pinDialogueOverlay.remove();
    }

    this.state.pinDialogueOverlay = null;
    this.state.pinDialogueActive = false;

    if (typeof this.state.pinDialogueResolve === 'function') {
      try {
        this.state.pinDialogueResolve(false);
      } catch (error) {
        console.warn('⚠️ Unable to resolve PIN dialogue promise during cleanup:', error);
      }
    }

    this.state.pinDialoguePromise = null;
    this.state.pinDialogueResolve = null;
  }

  _showLabyrinthOverlay() {
    if (typeof document === 'undefined') {
      return;
    }

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
          The house is bigger on the inside... Encore's intro flag lights the path for the riddles ahead.
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

    const button = overlay.querySelector('#labyrinth-return');
    if (button) {
      button.addEventListener('click', () => {
        console.log('🔙 Returning to main');
        overlay.remove();
        this.stop();
      });
    }
  }
}

export default LeaveScene;



