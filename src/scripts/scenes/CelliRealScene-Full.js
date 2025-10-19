/**
 * CelliRealScene - FULL IMPLEMENTATION
 * 
 * Complete Cell.real spreadsheet scene composed from extracted components.
 * This recreates the full celli-real.html experience using modular architecture.
 * 
 * Components Used (from existing extractions):
 * - SpreadsheetGrid-Complete.js - Full 2D grid system
 * - NarrativeWindows.js - Terminal & Notepad
 * - DPadController.js - D-Pad navigation
 * - AvatarFactory.js - Character creation
 * - Store.js - State management (future integration)
 * - FormulaParser.js - Formula execution (future integration)
 * - VoxelRenderer.js - 3D voxel rendering (future integration)
 * 
 * HTML Elements Created:
 * - #sheet (spreadsheet grid)
 * - #dpad (D-Pad controls)
 * - #terminal (terminal window)
 * - #pad (ty.txt notepad)
 */

import * as THREE from 'three';
import { UIManager } from '../ui/UIManager.js';
import { MainframeSpawn } from './components/MainframeSpawn.js';
import { TerminalSequence } from './components/TerminalSequence.js';
import { IntroExperience } from './components/IntroExperience.js';

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
      
      // UI Manager (orchestrates all UI components)
      uiManager: null,
      
      // Mainframe, intro and terminal
      mainframeSpawn: null,
      introExperience: null,
      terminalSequence: null,
      
      // Spreadsheet state
      arrays: new Map(),
      focusedCell: { x: 0, y: 0, z: 0, arrId: 0 },
      
      // Modes
      viewMode: 'standard', // 'standard' | 'present'
      crystal2D: false,
      physics: false,
      
      // Intro sequence
      introPhase: 'celli-os', // 'celli-os' | 'terminal' | '2d-to-3d' | '3d-world'
      transitionProgress: 0,

      // Audio
      limboAudio: null
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
        alpha: true,
        preserveDrawingBuffer: true // Enable screen recording
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
   * Initialize spreadsheet and UI
   */
  async _initSpreadsheet() {
    console.log('[CelliRealScene-Full] Initializing UI with UIManager...');
    
    // Create UI Manager (orchestrates all UI components)
    this.state.uiManager = new UIManager({
      onCellSelect: (data) => this._handleCellSelect(data),
      onFormulaExecute: (data) => this._handleFormulaApply(data),
      onNavigate: (data) => this._handleDPadNavigate(data),
      onPresentToggle: (enabled) => this._handlePresentToggle(enabled)
    });
    
    // Initialize all UI components
    const success = await this.state.uiManager.init();
    if (!success) {
      console.error('[CelliRealScene-Full] Failed to initialize UI!');
      return;
    }

    // Stage intro experience overlay and 2D layout
    this.state.introExperience = new IntroExperience({
      uiManager: this.state.uiManager,
      sheetId: 'sheet',
      overlayId: 'introOverlay'
    });
    await this.state.introExperience.init();

    // Select first cell
    const spreadsheet = this.state.uiManager.getSpreadsheet();
    if (spreadsheet) {
      spreadsheet.selectCell(0, 0, 0);
    }
    
    console.log('[CelliRealScene-Full] ✅ UI system initialized via UIManager');
  }

  /**
   * Initialize 3D systems
   */
  async _init3DSystems() {
    console.log('[CelliRealScene-Full] Initializing 3D systems...');
    
    // Create mainframe and Celli's home (behind gradient)
    this.state.mainframeSpawn = new MainframeSpawn(this.state.scene);
    await this.state.mainframeSpawn.init();

    if (this.state.introExperience && this.state.mainframeSpawn) {
      this.state.introExperience.setRevealCallback(() =>
        this.state.mainframeSpawn?.beginHomeReveal?.()
      );
    }

    // Create terminal sequence system
    this.state.terminalSequence = new TerminalSequence();
    const terminalEl = document.getElementById('term');
    if (terminalEl) {
      await this.state.terminalSequence.init(terminalEl);
    }

    console.log('[CelliRealScene-Full] ✅ 3D systems initialized');
  }

  /**
   * Setup event handlers
   */
  _setupEvents() {
    // Keyboard navigation (in addition to D-Pad)
    // Note: The UIManager's SpreadsheetGrid already handles formula bar Enter
    // We just need to handle arrow keys for cell navigation
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      const focused = this.state.focusedCell;
      if (!focused) return;
      
      const spreadsheet = this.state.uiManager?.getSpreadsheet();
      if (!spreadsheet) return;
      
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        spreadsheet.selectCell(focused.x, Math.max(0, focused.y - 1), focused.z);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        spreadsheet.selectCell(focused.x, Math.min(25, focused.y + 1), focused.z);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        spreadsheet.selectCell(Math.max(0, focused.x - 1), focused.y, focused.z);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        spreadsheet.selectCell(Math.min(25, focused.x + 1), focused.y, focused.z);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const fxInput = document.getElementById('fx');
        if (fxInput) fxInput.focus();
      }
    });
    
    // Wire terminal icon to show original terminal dialogue
    this._wireTerminalButton();
    
    console.log('[CelliRealScene-Full] ✅ Events setup');
  }
  
  /**
   * Wire terminal and notepad icon buttons
   */
  _wireTerminalButton() {
    const termIcon = document.getElementById('terminal-icon');
    const termClose = document.getElementById('term-close');
    const terminal = document.getElementById('terminal');
    const padIcon = document.getElementById('notepad-icon');
    const padClose = document.getElementById('pad-close');
    const notepad = document.getElementById('pad');
    
    // Terminal icon - shows original Celli_Memory_Leak_Log dialogue
    if (termIcon && !termIcon._wired) {
      termIcon._wired = true;
      termIcon.title = 'Open Celli_Log.txt';
      termIcon.addEventListener('click', async () => {
        console.log('[CelliRealScene-Full] Terminal icon clicked - playing terminal log');
        
        if (terminal && this.state.terminalSequence) {
          terminal.style.display = 'flex';
          await this.state.terminalSequence.playTerminalLog();
        }
      });
    }
    
    if (termClose && !termClose._wired) {
      termClose._wired = true;
      termClose.addEventListener('click', () => {
        console.log('[CelliRealScene-Full] Terminal closed');
        if (terminal) {
          terminal.style.display = 'none';
        }
      });
    }
    
    // Notepad icon - shows ty.txt
    if (padIcon && !padIcon._wired) {
      padIcon._wired = true;
      padIcon.title = 'ty.txt';
      padIcon.addEventListener('click', () => {
        console.log('[CelliRealScene-Full] Notepad icon clicked');
        
        if (notepad) {
          notepad.style.display = 'flex';
        }
      });
    }
    
    if (padClose && !padClose._wired) {
      padClose._wired = true;
      padClose.addEventListener('click', () => {
        console.log('[CelliRealScene-Full] Notepad closed');
        if (notepad) {
          notepad.style.display = 'none';
        }
      });
    }
  }

  /**
   * Handle cell selection
   */
  _handleCellSelect(data) {
    this.state.focusedCell = data;
    console.log(`[CelliRealScene-Full] Cell selected:`, data);
  }

  /**
   * Handle formula apply
   */
  _handleFormulaApply(data) {
    console.log(`[CelliRealScene-Full] Formula applied:`, data);
    // TODO: Integrate with FormulaParser
  }

  /**
   * Handle cell hover
   */
  _handleCellHover(data) {
    // Optional hover effects
  }

  /**
   * Handle D-Pad navigation
   */
  _handleDPadNavigate(data) {
    const { dx, dy, dz } = data;
    const focused = this.state.focusedCell;
    if (!focused) return;
    
    const newX = Math.max(0, Math.min(25, focused.x + dx));
    const newY = Math.max(0, Math.min(25, focused.y + dy));
    const newZ = Math.max(0, Math.min(11, focused.z + dz));
    
    const spreadsheet = this.state.uiManager?.getSpreadsheet();
    spreadsheet?.selectCell(newX, newY, newZ);
  }

  /**
   * Handle present mode toggle
   */
  _handlePresentToggle(enabled) {
    this.state.viewMode = enabled ? 'present' : 'standard';
    console.log(`[CelliRealScene-Full] Present mode: ${enabled}`);
  }

  /**
   * Handle depth mode toggle
   */
  _handleDepthModeToggle(mode) {
    console.log(`[CelliRealScene-Full] Depth mode: ${mode ? 'DEPTH' : 'HEIGHT'}`);
  }

  // Note: Cell selection, D-Pad handling, and formula application
  // are now handled by SpreadsheetGrid-Complete and DPadController components

  /**
   * Load initial state
   */
  _loadInitialState() {
    const spreadsheet = this.state.uiManager?.getSpreadsheet();
    if (!spreadsheet) return;
    
    // Add welcome message
    spreadsheet.updateCell(0, 0, 0, 'Cell.real', null, '#eef2ff');
    
    // Add example formula
    spreadsheet.updateCell(0, 2, 0, '[Array]', '=ARRAY("fill",3,3,1,"🟦")', '#dcfce7');
    
    console.log('[CelliRealScene-Full] ✅ Initial state loaded');
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
    
    // Phase 0: Spawn mainframe and home (behind gradient)
    console.log('[CelliRealScene-Full] Phase 0: Spawning mainframe...');
    if (this.state.mainframeSpawn) {
      await this.state.mainframeSpawn.playSpawnAnimation();
    }
    
    // Phase 1: Celli.OS - show centered sheet
    console.log('[CelliRealScene-Full] Phase 1: Celli.OS screen...');
    this.state.introPhase = 'celli-os';
    this.state.introExperience?.show2DScreen();
    this.state.introExperience?.setStatus('Boot sequence warming up…');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Phase 1.5: Boot sequence in terminal (with pacing, glitch, catharsis)
    console.log('[CelliRealScene-Full] Phase 1.5: Boot sequence...');
    this.state.introPhase = 'terminal';
    
    // Open terminal window and play BOOT sequence
    const terminal = document.getElementById('terminal');
    if (terminal && this.state.terminalSequence) {
      terminal.style.display = 'flex';
      this.state.introExperience?.setStatus('Running boot diagnostics…');
      await this.state.terminalSequence.playBoot();

      // Close terminal after boot sequence
      await new Promise(resolve => setTimeout(resolve, 1000));
      terminal.style.display = 'none';
    }
    
    // Phase 2: Transition to 3D
    console.log('[CelliRealScene-Full] Phase 2: Transition 2D → 3D...');
    this.state.introPhase = '2d-to-3d';
    this.state.introExperience?.setStatus('Handshake complete. Collapsing shell…');
    await this._transition2Dto3D();

    // Phase 3: Full interaction
    console.log('[CelliRealScene-Full] Phase 3: Full interaction enabled...');
    this.state.introPhase = '3d-world';
    const revealResult = this.state.introExperience
      ? await this.state.introExperience.revealWorld()
      : this.state.mainframeSpawn?.beginHomeReveal?.();

    if (revealResult && typeof revealResult.then === 'function') {
      await revealResult;
    } else if (this.state.mainframeSpawn?.beginHomeReveal) {
      await this.state.mainframeSpawn.beginHomeReveal();
    }

    this._playLimboTrack();

    this._enableFullInteraction();

    console.log('[CelliRealScene-Full] ✅ Complete intro sequence finished');
  }

  /**
   * Transition from 2D to 3D
   */
  async _transition2Dto3D() {
    console.log('[CelliRealScene-Full] 🔄 Transitioning 2D → 3D...');

    if (this.state.introExperience) {
      await this.state.introExperience.collapseToCorner();
    } else if (this.state.sheet) {
      this.state.sheet.classList.remove('intro-centered');
      this.state.sheet.style.left = '16px';
      this.state.sheet.style.bottom = '16px';
      this.state.sheet.style.top = 'auto';
      this.state.sheet.style.transform = 'none';
      this.state.sheet.style.width = '760px';
      this.state.sheet.style.height = '440px';
      await new Promise(resolve => setTimeout(resolve, 900));
    }

    console.log('[CelliRealScene-Full] ✅ Transition complete');
  }

  /**
   * Enable full interaction
   */
  _enableFullInteraction() {
    // Show all UI controls via UIManager
    this.state.uiManager?.showDPad();
    this.state.uiManager?.showWindows();

    // Show terminal and notepad icons
    const termIcon = document.getElementById('terminal-icon');
    const padIcon = document.getElementById('notepad-icon');

    if (termIcon) termIcon.style.display = 'flex';
    if (padIcon) padIcon.style.display = 'flex';

    console.log('[CelliRealScene-Full] ✅ Full interaction enabled');
  }

  _playLimboTrack() {
    if (typeof window === 'undefined') {
      return;
    }

    if (!this.state.limboAudio) {
      try {
        this.state.limboAudio = new Audio('./limbo.mp3');
        this.state.limboAudio.loop = true;
        this.state.limboAudio.volume = 0.6;
      } catch (error) {
        console.warn('[CelliRealScene-Full] ⚠️ Unable to initialize limbo.mp3 audio element', error);
        this.state.limboAudio = null;
        return;
      }
    }

    try {
      this.state.limboAudio.currentTime = 0;
      const playPromise = this.state.limboAudio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(error => {
          console.warn('[CelliRealScene-Full] ⚠️ Unable to play limbo.mp3 during reveal', error);
        });
      }
    } catch (error) {
      console.warn('[CelliRealScene-Full] ⚠️ Error while playing limbo.mp3', error);
    }
  }

  _stopLimboTrack() {
    const audio = this.state.limboAudio;
    if (!audio) return;

    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (error) {
      console.warn('[CelliRealScene-Full] ⚠️ Unable to stop limbo.mp3', error);
    }

    this.state.limboAudio = null;
  }

  /**
   * Update scene
   */
  update(params, deltaTime, totalTime) {
    if (!this.state.running) return;
    
    this.state.totalTime = totalTime;
    
    // Update mainframe
    if (this.state.mainframeSpawn) {
      this.state.mainframeSpawn.update(deltaTime);
    }
    
    // Render
    if (this.state.renderer && this.state.scene && this.state.camera) {
      this.state.renderer.render(this.state.scene, this.state.camera);
    }
  }

  /**
   * Stop scene
   */
  stop() {
    this._stopLimboTrack();
    this.state.running = false;
  }

  /**
   * Destroy scene
   */
  async destroy() {
    console.log('[CelliRealScene-Full] 🗑️ Destroying...');
    
    this.stop();
    
    // Destroy UI Manager (handles all UI components)
    this.state.uiManager?.destroy();

    this._stopLimboTrack();

    // Destroy mainframe and terminal
    this.state.mainframeSpawn?.destroy();
    this.state.introExperience?.destroy();
    this.state.terminalSequence?.destroy();
    
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
<div id="sheetHeaderCard" class="sheet-header-card" style="display:none"></div>
<div id="sheet" class="intro-centered" aria-label="2D Sheet" style="display:none">
  <div class="sheet-head">
    <div class="sheet-title-row" style="display:flex;align-items:center;justify-content:space-between;">
      <div class="sheet-title-group" style="display:flex;align-items:center;gap:8px;">
        <button class="layer-btn" id="prevArray" style="display:none" title="Previous array">◀</button>
        <div class="sheet-title" id="sheetTitle" style="font-family:Inter, system-ui; font-weight:600;">Array</div>
        <button class="layer-btn" id="nextArray" style="display:none" title="Next array">▶</button>
      </div>
      <div class="sheet-ctrls" style="display:flex;gap:6px;align-items:center;">
        <button class="btn" id="copyAddress" title="Copy address">@</button>
        <button class="btn" id="toggleAddressMode" title="Toggle Local/Absolute">A1a</button>
        <button class="btn" id="viewToggleBtn" title="Toggle 3D View" style="width:36px;height:36px;padding:6px;display:flex;align-items:center;justify-content:center;">
          <svg id="viewToggleIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
        <button class="btn" id="toggleFxPanel" title="Functions">Fx</button>
      </div>
    </div>
    <div class="sheet-fx" style="display:flex; gap:6px; align-items:center; margin-top:6px;">
      <div class="fx-wrap" style="flex:1; position:relative;">
        <div id="fxHighlight" aria-hidden="true"></div>
        <input type="text" id="fx" placeholder='=ARRAY("Hello","World")' style="width:100%;padding:8px;border-radius:8px;border:1px solid #e5e7eb;font-family:'Roboto Mono',monospace">
      </div>
      <button class="btn primary" id="applyFx" title="Apply">✓</button>
    </div>
  </div>
  <div class="sheet-body" style="flex:1;overflow:auto;margin-top:8px;position:relative;">
    <div class="grid-wrap" style="flex:1;overflow:auto;">
      <table class="sheet">
        <thead><tr id="cols"><th></th></tr></thead>
        <tbody id="rows"></tbody>
      </table>
    </div>
  </div>
  <div class="sheet-resizer" id="sheetResizer" title="Resize" style="display:none"></div>
  <div id="fxPanel" class="fx-panel" style="display:none">
    <div class="fx-head" style="display:flex;align-items:center;justify-content:space-between;">
      <div class="title">Functions</div>
      <button class="btn" id="fxClose">Close</button>
    </div>
    <div class="fx-body" id="fxBody"></div>
  </div>
</div>`;
  }

  _getDPadHTML() {
    return `
<div id="dpad" aria-label="D-Pad" style="display:none">
  <div class="dp grab" title="Drag">☰</div>
  <div class="dp up" data-dir="up">↑</div>
  <div class="dp depthUp desktop-only" data-dir="depthUp">⤴</div>
  <div class="dp jump mobile-only" data-action="jump" style="display:none" title="Jump">⤴</div>
  <div class="dp left" data-dir="left">←</div>
  <div class="dp center desktop-only" title="Arrow mapping" style="display:flex;align-items:center;justify-content:center;gap:6px;">
    <span style="display:inline-block;width:16px;height:12px;border:2px solid #fff;border-radius:3px"></span>
    <span id="depthMode">H</span>
  </div>
  <div class="dp center mobile-only" style="display:none;cursor:default;pointer-events:none;opacity:0.3">•</div>
  <div class="dp depthDown desktop-only" data-dir="depthDown">⤵</div>
  <div class="dp present" role="button" data-action="present" aria-pressed="false" title="Enter Present Mode">◎</div>
  <div class="dp down" data-dir="down">↓</div>
  <div class="dp right" data-dir="right">→</div>
</div>`;
  }

  _getTerminalHTML() {
    return `
<div id="terminal-icon" class="ui-icon" title="Open Celli_Log.txt" style="display:none;position:fixed;bottom:24px;right:24px;z-index:10001;">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
</div>
<div id="terminal" style="display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:720px;height:480px;background:rgba(17,24,39,0.95);border:1px solid rgba(255,255,255,0.12);border-radius:16px;z-index:10002;flex-direction:column;color:#e5e7eb;box-shadow:0 25px 60px rgba(15,23,42,0.4);backdrop-filter:blur(10px);">
  <div class="win-header" style="background:rgba(255,255,255,0.06);padding:10px 16px;border-bottom:1px solid rgba(255,255,255,0.12);display:flex;justify-content:space-between;align-items:center;">
    <span>Terminal</span>
    <div id="term-close" class="close" title="Close"></div>
  </div>
  <pre id="term" style="flex:1;padding:18px;overflow:auto;font-family:'Roboto Mono',monospace;font-size:13px;line-height:1.45;background:rgba(15,23,42,0.65);margin:0;">Welcome to Cell.real terminal\n&gt; </pre>
</div>`;
  }

  _getNotepadHTML() {
    return `
<div id="notepad-icon" class="ui-icon" title="ty.txt" style="display:none;position:fixed;bottom:108px;right:24px;z-index:10001;">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"></path><path d="M12 2v4"></path><path d="M16 2v4"></path><rect x="4" y="4" width="16" height="18" rx="2"></rect><path d="M12 12h.01"></path><path d="M16 16h.01"></path><path d="M8 12h.01"></path><path d="M8 16h.01"></path></svg>
</div>
<div id="pad" style="display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:520px;height:380px;background:#fafafc;border:1px solid #e5e7eb;border-radius:24px;z-index:10002;flex-direction:column;box-shadow:0 25px 60px rgba(15,23,42,0.25);">
  <div class="win-header" style="background:#f2f4f8;padding:10px 16px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;color:#111827">
    <span>ty.txt — Notepad</span>
    <div id="pad-close" class="close" title="Close"></div>
  </div>
  <textarea id="note" style="flex:1;background:#ffffff;color:#111827;border:none;padding:20px;font-family:'Roboto Mono',monospace;font-size:13px;line-height:1.5;resize:none">special thanks:
- Stephen Lavelle (Increpare)
- Arvi Teikari (Hempuli)
- Jonathan Blow
- Hideo Kojima
- Alan Moore

Synthesize what you love, make what you can.

"I don't love all of you, but I would if I could." — increpare, 'Stephen's Sausage Roll'
</textarea>
</div>`;
  }

  _getHUDHTML() {
    return `
<div class="panel stack" id="hud" style="position:fixed;top:16px;left:16px;z-index:10001;padding:0;overflow:hidden;min-width:280px;max-width:340px;">
  <div class="win-header" style="background:rgba(255,255,255,0.06);padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:space-between;">
    <span>DEBUG CONSOLE</span>
    <div id="debug-close" class="close" title="Hide"></div>
  </div>
  <div class="stack" style="padding:12px;gap:10px;">
    <div class="sub">Click cells <span class="kbd">← ↑ ↓ →</span> move <span class="kbd">Enter</span> edit <span class="kbd">P</span> physics</div>
    <div class="row" style="display:flex;flex-wrap:wrap;gap:8px;">
      <button class="btn primary" id="centerHome">🏠 Home</button>
      <button class="btn" id="viewMainframe">🖥 Mainframe</button>
      <button class="btn" id="toggleGrid">Grid</button>
      <button class="btn" id="toggleAxes">Axes</button>
    </div>
    <div class="row" style="display:flex;flex-wrap:wrap;gap:8px;">
      <button class="btn good" id="physicsBtn">⚙ Physics</button>
      <button class="btn" id="toggleChunks">🧱 Chunks</button>
      <button class="btn warn" id="reset">↺ Reset</button>
    </div>
    <div class="row" style="display:flex;flex-wrap:wrap;gap:8px;">
      <button class="btn" id="presentToggleBtn">🎞 Present: OFF</button>
      <button class="btn" id="graphicsSettingsBtn">🎨 Graphics</button>
      <button class="btn" id="oceanSettingsBtn">🌊 Ocean</button>
    </div>
    <label class="row" style="display:flex;align-items:center;justify-content:space-between;font-weight:600;">
      <span>Crystal 2D Style</span>
      <input type="checkbox" id="crystal2DToggle">
    </label>
    <div class="stack" style="gap:6px;font-size:12px;color:var(--muted, #6b7280);">
      <span id="statusChip" class="chip">Booting…</span>
      <span id="physChip" class="chip">Physics: OFF</span>
      <span id="countChip" class="chip">Counts: --</span>
    </div>
  </div>
</div>`;
  }
}

export default CelliRealScene;

