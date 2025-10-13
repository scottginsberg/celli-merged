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
      
      // Labyrinth state
      labyrinthActive: false,
      currentRoom: 0,
      rooms: [],
      
      // GIR transformation state
      girActive: false,
      transformProgress: 0
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
      alpha: false
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
    
    // Show Ozymandias puzzle
    this._startOzymandiasSystem();
    
    this.state.running = true;
    
    console.log('✅ LEAVE Scene started');
  }

  /**
   * Start Ozymandias puzzle system
   */
  _startOzymandiasSystem() {
    console.log('📜 Starting Ozymandias puzzle...');
    this.state.ozymandiasActive = true;
    
    // Show puzzle UI
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
        <button id="ozymandias-skip" style="margin-top: 30px; padding: 15px 30px; background: #0a8; color: #000; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
          Skip Puzzle (For Now)
        </button>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Skip button handler
    document.getElementById('ozymandias-skip').addEventListener('click', () => {
      console.log('⏩ Skipping Ozymandias puzzle');
      overlay.remove();
      this._startLabyrinth();
    });
  }

  /**
   * Start labyrinth sequence
   */
  _startLabyrinth() {
    console.log('🏚️ Starting House of Leaves labyrinth...');
    this.state.labyrinthActive = true;
    
    // Show labyrinth UI (placeholder)
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
    
    // Return button handler
    document.getElementById('labyrinth-return').addEventListener('click', () => {
      console.log('🔙 Returning to main');
      overlay.remove();
      this.stop();
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
    
    // Clean up overlays
    const ozyOverlay = document.getElementById('ozymandias-overlay');
    if (ozyOverlay) ozyOverlay.remove();
    
    const labOverlay = document.getElementById('labyrinth-overlay');
    if (labOverlay) labOverlay.remove();
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
}

export default LeaveScene;



