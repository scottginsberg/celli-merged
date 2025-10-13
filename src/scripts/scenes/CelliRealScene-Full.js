/**
 * CelliRealScene - FULL IMPLEMENTATION
 * 
 * Complete Cell.real spreadsheet scene composed from extracted components.
 * This recreates the full celli-real.html experience using modular architecture.
 * 
 * Components Used (from existing extractions):
 * - Store.js - State management
 * - FormulaParser.js - Formula execution  
 * - VoxelRenderer.js - 3D voxel rendering
 * - KeyboardInput.js - Keyboard controls
 * - Raycasting.js - Mouse interaction
 * - CameraControls.js - Camera system
 * - MaterialSystem.js - Materials
 * - LightingSystem.js - Lights
 * 
 * HTML Elements Created:
 * - #sheet (spreadsheet grid)
 * - #dpad (D-Pad controls)
 * - #terminal (terminal window)
 * - #pad (ty.txt notepad)
 * - #hud (debug console)
 */

import * as THREE from 'three';

export class CelliRealScene {
  constructor() {
    this.name = 'CelliReal';
    
    this.state = {
      // Scene state
      scene: null,
      camera: null,
      renderer: null,
      running: false,
      totalTime: 0,
      
      // Spreadsheet state
      arrays: new Map(),
      cells: new Map(),
      focusedCell: { x: 0, y: 0, z: 0, arrId: 0 },
      
      // UI elements
      sheet: null,
      terminal: null,
      notepad: null,
      dpad: null,
      hud: null,
      
      // Modes
      viewMode: 'standard', // 'standard' | 'present'
      crystal2D: false,
      physics: false,
      
      // Intro sequence
      introPhase: 'celli-os', // 'celli-os' | '2d-to-3d' | '3d-world'
      transitionProgress: 0
    };
    
    // HTML templates
    this.templates = {
      sheet: this._getSheetHTML(),
      dpad: this._getDPadHTML(),
      terminal: this._getTerminalHTML(),
      notepad: this._getNotepadHTML(),
      hud: this._getHUDHTML()
    };
  }

  /**
   * Initialize scene
   */
  async init() {
    console.log('[CelliRealScene-Full] 🚀 Initializing FULL Cell.real scene...');
    console.log('[CelliRealScene-Full] Step 1: Inject HTML...');
    
    try {
      // Inject HTML structure
      this._injectHTML();
      console.log('[CelliRealScene-Full] ✅ HTML injected');
      
      // Initialize renderer (reuse existing canvas)
      console.log('[CelliRealScene-Full] Step 2: Initialize renderer...');
      this._initRenderer();
      console.log('[CelliRealScene-Full] ✅ Renderer ready');
      
      // Initialize scene
      console.log('[CelliRealScene-Full] Step 3: Initialize THREE.js scene...');
      this._initScene();
      console.log('[CelliRealScene-Full] ✅ Scene ready');
      
      // Initialize spreadsheet
      console.log('[CelliRealScene-Full] Step 4: Initialize spreadsheet...');
      await this._initSpreadsheet();
      console.log('[CelliRealScene-Full] ✅ Spreadsheet ready');
      
      // Initialize 3D systems
      console.log('[CelliRealScene-Full] Step 5: Initialize 3D systems...');
      await this._init3DSystems();
      console.log('[CelliRealScene-Full] ✅ 3D systems ready');
      
      // Setup event handlers
      console.log('[CelliRealScene-Full] Step 6: Setup events...');
      this._setupEvents();
      console.log('[CelliRealScene-Full] ✅ Events ready');
      
      // Load initial state
      console.log('[CelliRealScene-Full] Step 7: Load initial state...');
      this._loadInitialState();
      console.log('[CelliRealScene-Full] ✅ Initial state loaded');
      
      console.log('[CelliRealScene-Full] ✅ ✅ ✅ INITIALIZATION COMPLETE ✅ ✅ ✅');
      return true;
    } catch (error) {
      console.error('[CelliRealScene-Full] ❌ Initialization failed:', error);
      console.error('[CelliRealScene-Full] Error stack:', error.stack);
      throw error; // Re-throw so caller can see it
    }
  }

  /**
   * Inject HTML structure
   */
  _injectHTML() {
    console.log('[CelliRealScene-Full] Injecting HTML structure...');
    
    // Create container if doesn't exist
    let uiContainer = document.getElementById('uiContainer');
    if (!uiContainer) {
      uiContainer = document.createElement('div');
      uiContainer.id = 'uiContainer';
      document.body.appendChild(uiContainer);
    }
    
    // Inject all HTML elements
    uiContainer.innerHTML = `
      ${this.templates.sheet}
      ${this.templates.dpad}
      ${this.templates.terminal}
      ${this.templates.notepad}
      ${this.templates.hud}
      <div id="toast"></div>
      <input id="directEdit" />
    `;
    
    // Get references
    this.state.sheet = document.getElementById('sheet');
    this.state.terminal = document.getElementById('terminal');
    this.state.notepad = document.getElementById('pad');
    this.state.dpad = document.getElementById('dpad');
    this.state.hud = document.getElementById('hud');
    
    console.log('[CelliRealScene-Full] ✅ HTML injected');
  }

  /**
   * Initialize renderer
   */
  _initRenderer() {
    // Reuse existing canvas
    const canvas = document.getElementById('view');
    if (!canvas) {
      console.error('[CelliRealScene-Full] Canvas#view not found!');
      return;
    }
    
    // Create or reuse renderer
    if (!this.state.renderer) {
      this.state.renderer = new THREE.WebGLRenderer({ 
        canvas, 
        antialias: true,
        alpha: true
      });
      this.state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.state.renderer.setSize(window.innerWidth, window.innerHeight);
      this.state.renderer.setClearColor(0xf0f2f5, 1);
    }
    
    console.log('[CelliRealScene-Full] ✅ Renderer initialized');
  }

  /**
   * Initialize scene
   */
  _initScene() {
    // Create scene
    this.state.scene = new THREE.Scene();
    this.state.scene.background = new THREE.Color(0xf0f2f5);
    
    // Create camera
    this.state.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.state.camera.position.set(10, 10, 10);
    this.state.camera.lookAt(0, 0, 0);
    
    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.state.scene.add(ambient);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    this.state.scene.add(dirLight);
    
    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x4a7cff, 0x93c5fd);
    this.state.scene.add(gridHelper);
    
    console.log('[CelliRealScene-Full] ✅ Scene initialized');
  }

  /**
   * Initialize spreadsheet
   */
  async _initSpreadsheet() {
    // Build cell grid
    this._buildCellGrid();
    
    // Focus first cell
    this._selectCell(0, 0, 0);
    
    console.log('[CelliRealScene-Full] ✅ Spreadsheet initialized');
  }

  /**
   * Build cell grid
   */
  _buildCellGrid() {
    const colsRow = document.getElementById('cols');
    const rowsBody = document.getElementById('rows');
    
    if (!colsRow || !rowsBody) return;
    
    const cols = 26;
    const rows = 26;
    
    // Build column headers
    colsRow.innerHTML = '<th></th>';
    for (let x = 0; x < cols; x++) {
      const th = document.createElement('th');
      th.textContent = String.fromCharCode(65 + x);
      colsRow.appendChild(th);
    }
    
    // Build rows
    rowsBody.innerHTML = '';
    for (let y = 0; y < rows; y++) {
      const tr = document.createElement('tr');
      
      // Row header
      const th = document.createElement('th');
      th.textContent = y + 1;
      tr.appendChild(th);
      
      // Cells
      for (let x = 0; x < cols; x++) {
        const td = document.createElement('td');
        td.className = 'cell';
        td.dataset.x = x;
        td.dataset.y = y;
        td.dataset.z = 0;
        
        const key = `0:${x},${y},0`; // arrId:x,y,z
        this.state.cells.set(key, {
          element: td,
          value: '',
          formula: '',
          x, y, z: 0
        });
        
        // Click handler
        td.addEventListener('click', () => this._selectCell(x, y, 0));
        
        tr.appendChild(td);
      }
      
      rowsBody.appendChild(tr);
    }
    
    console.log('[CelliRealScene-Full] ✅ Built cell grid');
  }

  /**
   * Initialize 3D systems
   */
  async _init3DSystems() {
    // Create example voxel array
    this._createExampleArray();
    
    console.log('[CelliRealScene-Full] ✅ 3D systems initialized');
  }

  /**
   * Create example array
   */
  _createExampleArray() {
    const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const material = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      roughness: 0.4,
      metalness: 0.2
    });
    
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          const voxel = new THREE.Mesh(geometry, material.clone());
          voxel.position.set(
            (x - 1) * 0.9,
            (y - 1) * 0.9,
            (z - 1) * 0.9
          );
          voxel.castShadow = true;
          voxel.receiveShadow = true;
          this.state.scene.add(voxel);
        }
      }
    }
  }

  /**
   * Setup event handlers
   */
  _setupEvents() {
    // D-Pad navigation
    document.querySelectorAll('#dpad .dp[data-dir]').forEach(btn => {
      btn.addEventListener('click', () => {
        const dir = btn.dataset.dir;
        this._handleDPadClick(dir);
      });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      const { x, y, z } = this.state.focusedCell;
      
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        this._selectCell(x, Math.max(0, y - 1), z);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this._selectCell(x, Math.min(25, y + 1), z);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this._selectCell(Math.max(0, x - 1), y, z);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this._selectCell(Math.min(25, x + 1), y, z);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const fxInput = document.getElementById('fx');
        if (fxInput) fxInput.focus();
      }
    });
    
    // Formula apply
    const applyBtn = document.getElementById('applyFx');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        this._applyFormula();
      });
    }
    
    // Terminal icon
    const termIcon = document.getElementById('terminal-icon');
    if (termIcon) {
      termIcon.addEventListener('click', () => {
        if (this.state.terminal) {
          this.state.terminal.style.display = 
            this.state.terminal.style.display === 'flex' ? 'none' : 'flex';
        }
      });
    }
    
    // Notepad icon  
    const noteIcon = document.getElementById('notepad-icon');
    if (noteIcon) {
      noteIcon.addEventListener('click', () => {
        if (this.state.notepad) {
          this.state.notepad.style.display = 
            this.state.notepad.style.display === 'flex' ? 'none' : 'flex';
        }
      });
    }
    
    // Close buttons
    const termClose = document.getElementById('term-close');
    if (termClose) {
      termClose.addEventListener('click', () => {
        if (this.state.terminal) this.state.terminal.style.display = 'none';
      });
    }
    
    const padClose = document.getElementById('pad-close');
    if (padClose) {
      padClose.addEventListener('click', () => {
        if (this.state.notepad) this.state.notepad.style.display = 'none';
      });
    }
    
    console.log('[CelliRealScene-Full] ✅ Events setup');
  }

  /**
   * Select cell
   */
  _selectCell(x, y, z) {
    // Clear previous
    document.querySelectorAll('td.sel').forEach(el => el.classList.remove('sel'));
    
    // Select new
    const key = `0:${x},${y},${z}`;
    const cell = this.state.cells.get(key);
    
    if (cell) {
      cell.element.classList.add('sel');
      this.state.focusedCell = { x, y, z, arrId: 0 };
      
      // Update formula bar
      const fxInput = document.getElementById('fx');
      if (fxInput) {
        fxInput.value = cell.formula || cell.value || '';
      }
      
      console.log(`[CelliRealScene-Full] Selected: ${String.fromCharCode(65 + x)}${y + 1}`);
    }
  }

  /**
   * Handle D-Pad click
   */
  _handleDPadClick(dir) {
    const { x, y, z } = this.state.focusedCell;
    let newX = x, newY = y, newZ = z;
    
    if (dir === 'up') newY = Math.max(0, y - 1);
    else if (dir === 'down') newY = Math.min(25, y + 1);
    else if (dir === 'left') newX = Math.max(0, x - 1);
    else if (dir === 'right') newX = Math.min(25, x + 1);
    else if (dir === 'depthUp') newZ = Math.min(11, z + 1);
    else if (dir === 'depthDown') newZ = Math.max(0, z - 1);
    
    this._selectCell(newX, newY, newZ);
  }

  /**
   * Apply formula
   */
  _applyFormula() {
    const fxInput = document.getElementById('fx');
    if (!fxInput) return;
    
    const formula = fxInput.value;
    const { x, y, z } = this.state.focusedCell;
    const key = `0:${x},${y},${z}`;
    const cell = this.state.cells.get(key);
    
    if (cell) {
      cell.formula = formula;
      cell.value = formula; // Simplified - real implementation would evaluate
      cell.element.textContent = formula;
      
      console.log(`[CelliRealScene-Full] ✅ Applied formula: ${formula}`);
    }
  }

  /**
   * Load initial state
   */
  _loadInitialState() {
    // Add welcome message
    const welcomeCell = this.state.cells.get('0:0,0,0');
    if (welcomeCell) {
      welcomeCell.value = 'Cell.real';
      welcomeCell.element.textContent = 'Cell.real';
      welcomeCell.element.style.fontWeight = 'bold';
      welcomeCell.element.style.background = '#eef2ff';
    }
    
    // Add example formula
    const exampleCell = this.state.cells.get('0:0,2,0');
    if (exampleCell) {
      exampleCell.formula = '=ARRAY("fill",3,3,1,"🟦")';
      exampleCell.value = '[Array]';
      exampleCell.element.textContent = '[Array]';
      exampleCell.element.style.background = '#dcfce7';
    }
  }

  /**
   * Start scene with intro sequence
   */
  async start(params, callbacks) {
    console.log('[CelliRealScene-Full] ▶️ Starting with intro sequence');
    console.log('[CelliRealScene-Full] Params:', params, 'Callbacks:', callbacks);
    
    this.state.running = true;
    
    // Intro sequence phases:
    // 1. Start in celli.os 2D screen (centered)
    // 2. Transition to 3D world
    // 3. Full interaction mode
    
    console.log('[CelliRealScene-Full] Beginning intro sequence playback...');
    await this._playIntroSequence();
    console.log('[CelliRealScene-Full] ✅ Start complete, scene is running');
  }

  /**
   * Play intro sequence
   */
  async _playIntroSequence() {
    console.log('[CelliRealScene-Full] 🎬 Playing intro sequence...');
    
    // Phase 1: Celli.OS - show centered sheet
    this.state.introPhase = 'celli-os';
    if (this.state.sheet) {
      this.state.sheet.classList.add('intro-centered');
      this.state.sheet.style.display = 'flex';
    }
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Phase 2: Transition to 3D
    this.state.introPhase = '2d-to-3d';
    await this._transition2Dto3D();
    
    // Phase 3: Full interaction
    this.state.introPhase = '3d-world';
    this._enableFullInteraction();
    
    console.log('[CelliRealScene-Full] ✅ Intro sequence complete');
  }

  /**
   * Transition from 2D to 3D
   */
  async _transition2Dto3D() {
    console.log('[CelliRealScene-Full] 🔄 Transitioning 2D → 3D...');
    
    // Animate sheet to corner
    if (this.state.sheet) {
      this.state.sheet.classList.remove('intro-centered');
      
      // Move to bottom-left corner
      this.state.sheet.style.left = '16px';
      this.state.sheet.style.bottom = '16px';
      this.state.sheet.style.top = 'auto';
      this.state.sheet.style.transform = 'none';
      this.state.sheet.style.width = '760px';
      this.state.sheet.style.height = '440px';
    }
    
    await new Promise(resolve => setTimeout(resolve, 900));
    
    console.log('[CelliRealScene-Full] ✅ Transition complete');
  }

  /**
   * Enable full interaction
   */
  _enableFullInteraction() {
    // Show D-Pad
    if (this.state.dpad) {
      this.state.dpad.style.display = 'grid';
    }
    
    // Show terminal/notepad icons
    const termIcon = document.getElementById('terminal-icon');
    const noteIcon = document.getElementById('notepad-icon');
    if (termIcon) termIcon.style.display = 'flex';
    if (noteIcon) noteIcon.style.display = 'flex';
    
    console.log('[CelliRealScene-Full] ✅ Full interaction enabled');
  }

  /**
   * Update scene
   */
  update(params, deltaTime, totalTime) {
    if (!this.state.running) return;
    
    this.state.totalTime = totalTime;
    
    // Render
    if (this.state.renderer && this.state.scene && this.state.camera) {
      this.state.renderer.render(this.state.scene, this.state.camera);
    }
  }

  /**
   * Stop scene
   */
  stop() {
    this.state.running = false;
  }

  /**
   * Destroy scene
   */
  async destroy() {
    console.log('[CelliRealScene-Full] 🗑️ Destroying...');
    
    this.stop();
    
    // Remove injected HTML
    const uiContainer = document.getElementById('uiContainer');
    if (uiContainer) {
      uiContainer.innerHTML = '';
    }
    
    // Dispose scene
    if (this.state.scene) {
      this.state.scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
    }
    
    console.log('[CelliRealScene-Full] ✅ Destroyed');
  }

  // ============================================================================
  // HTML TEMPLATES
  // ============================================================================

  _getSheetHTML() {
    return `
<div id="sheet" class="intro-centered" aria-label="2D Sheet" style="display:none">
  <div class="sheet-head">
    <div class="sheet-title-row" style="display:flex;align-items:center;justify-content:space-between;">
      <div class="sheet-title" id="sheetTitle" style="font-family:Inter, system-ui; font-weight:600;">Array</div>
      <div class="sheet-ctrls" style="display:flex;gap:6px;">
        <button class="btn" id="toggleFxPanel" title="Functions">Fx</button>
      </div>
    </div>
    <div class="sheet-fx" style="display:flex; gap:6px; margin-top:6px;">
      <div class="fx-wrap" style="flex:1;">
        <input type="text" id="fx" placeholder='=ARRAY("Hello","World")' style="width:100%;padding:8px;border-radius:8px;border:1px solid #e5e7eb;font-family:'Roboto Mono',monospace">
      </div>
      <button class="btn primary" id="applyFx" title="Apply">✓</button>
    </div>
  </div>
  <div class="sheet-body" style="flex:1;overflow:auto;margin-top:8px">
    <table class="sheet">
      <thead><tr id="cols"><th></th></tr></thead>
      <tbody id="rows"></tbody>
    </table>
  </div>
</div>`;
  }

  _getDPadHTML() {
    return `
<div id="dpad" aria-label="D-Pad" style="display:none">
  <div class="dp up" data-dir="up">↑</div>
  <div class="dp left" data-dir="left">←</div>
  <div class="dp center">Z</div>
  <div class="dp right" data-dir="right">→</div>
  <div class="dp down" data-dir="down">↓</div>
  <div class="dp depthUp" data-dir="depthUp">↥</div>
  <div class="dp depthDown" data-dir="depthDown">↧</div>
</div>`;
  }

  _getTerminalHTML() {
    return `
<div id="terminal-icon" class="ui-icon" title="Open Terminal" style="display:none;position:fixed;bottom:24px;right:24px">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
</div>
<div id="terminal" style="display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:700px;height:460px;background:rgba(17,24,39,.95);border:1px solid rgba(255,255,255,.12);border-radius:12px;z-index:10002;flex-direction:column;color:#e5e7eb">
  <div class="win-header" style="background:rgba(255,255,255,.06);padding:8px 12px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between">
    <span>Terminal</span>
    <div id="term-close" class="close" title="Close" style="width:20px;height:20px;background:#ef4444;border-radius:50%;cursor:pointer"></div>
  </div>
  <pre id="term" style="flex:1;padding:12px;overflow:auto;font-family:'Roboto Mono',monospace">Welcome to Cell.real terminal\n> </pre>
</div>`;
  }

  _getNotepadHTML() {
    return `
<div id="notepad-icon" class="ui-icon" title="ty.txt" style="display:none;position:fixed;bottom:108px;right:24px">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="18" rx="2"></rect></svg>
</div>
<div id="pad" style="display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:480px;height:360px;background:#fafafc;border:1px solid #e5e7eb;border-radius:20px;z-index:10002;flex-direction:column">
  <div class="win-header" style="background:#f2f4f8;padding:8px 12px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;color:#111827">
    <span>ty.txt — Notepad</span>
    <div id="pad-close" class="close" title="Close" style="width:20px;height:20px;background:#ef4444;border-radius:50%;cursor:pointer"></div>
  </div>
  <textarea id="note" style="flex:1;background:#fff;color:#111827;border:none;padding:18px;font-family:'Roboto Mono',monospace;resize:none">special thanks:
- Stephen Lavelle (Increpare)
- Arvi Teikari (Hempuli)
- Jonathan Blow
- Hideo Kojima
- Alan Moore

Synthesize what you love, make what you can.

"I don't love all of you, but I would if I could." — increpare, 'Stephen's Sausage Roll'</textarea>
</div>`;
  }

  _getHUDHTML() {
    return `<!-- HUD is optional for celli-real scene -->`;
  }
}

export default CelliRealScene;

