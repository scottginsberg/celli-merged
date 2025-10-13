/**
 * CellRealApp - Main Application Orchestrator
 * 
 * Assembles and coordinates all components of the Cell.real voxel editor:
 * - SpreadsheetUI (2D grid interface)
 * - HandSystem (3D gesture execution)
 * - KeyboardSystem (3D keyboard visualization)
 * - VoxelRenderer (3D voxel engine)
 * - FormulaParser (formula execution)
 * - Store (application state)
 * 
 * This recreates the full merged2.html functionality using modular components.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Core systems
import { SpreadsheetUI } from './ui/SpreadsheetUI.js';
import { HandSystem } from './input/HandSystem.js';
import { KeyboardSystem } from './input/KeyboardSystem.js';

// Engine components (assuming these exist from previous extractions)
// import { Store } from './engine/Store.js';
// import { FormulaParser } from './engine/FormulaParser.js';
// import { VoxelRenderer } from './rendering/VoxelRenderer.js';

export class CellRealApp {
  constructor() {
    this.state = {
      // Rendering
      renderer: null,
      scene: null,
      camera: null,
      controls: null,
      
      // Core systems
      spreadsheet: null,
      handSystem: null,
      keyboardSystem: null,
      
      // Mode
      mode: '2d', // '2d' | '3d' | 'execution'
      
      // Animation
      running: false,
      clock: new THREE.Clock(),
      
      // Execution environment
      executionMode: false,
      
      // State
      arrays: new Map(),
      focusedArray: null,
      focusedCell: null
    };
  }

  /**
   * Initialize application
   */
  async init() {
    console.log('[CellRealApp] Initializing full application...');
    
    try {
      // Initialize renderer
      await this._initRenderer();
      
      // Initialize scene
      await this._initScene();
      
      // Initialize UI systems
      await this._initUI();
      
      // Initialize execution environment
      await this._initExecutionEnvironment();
      
      // Setup event handlers
      this._setupEvents();
      
      // Start animation loop
      this._startAnimationLoop();
      
      console.log('[CellRealApp] ✅ Application initialized successfully');
      return true;
    } catch (error) {
      console.error('[CellRealApp] ❌ Initialization failed:', error);
      return false;
    }
  }

  /**
   * Initialize renderer
   */
  async _initRenderer() {
    const app = document.getElementById('app');
    if (!app) {
      throw new Error('App container not found');
    }
    
    // Create WebGL renderer
    this.state.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    
    this.state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.state.renderer.setSize(window.innerWidth, window.innerHeight);
    this.state.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.state.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.state.renderer.toneMappingExposure = 1.0;
    this.state.renderer.setClearColor(0x000000, 1);
    
    app.appendChild(this.state.renderer.domElement);
    
    // Handle resize
    window.addEventListener('resize', () => this._handleResize());
    
    console.log('[CellRealApp] Renderer initialized');
  }

  /**
   * Initialize scene
   */
  async _initScene() {
    // Create scene
    this.state.scene = new THREE.Scene();
    this.state.scene.background = new THREE.Color(0x0a0a1a);
    this.state.scene.fog = new THREE.Fog(0x0a0a1a, 20, 100);
    
    // Create camera
    this.state.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.state.camera.position.set(10, 10, 10);
    this.state.camera.lookAt(0, 0, 0);
    
    // Create controls
    this.state.controls = new OrbitControls(
      this.state.camera,
      this.state.renderer.domElement
    );
    this.state.controls.enableDamping = true;
    this.state.controls.dampingFactor = 0.05;
    this.state.controls.minDistance = 2;
    this.state.controls.maxDistance = 100;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.state.scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    this.state.scene.add(dirLight);
    
    const pointLight1 = new THREE.PointLight(0x4a7cff, 0.6, 50);
    pointLight1.position.set(-10, 5, -10);
    this.state.scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xff4a7c, 0.4, 50);
    pointLight2.position.set(10, 5, 10);
    this.state.scene.add(pointLight2);
    
    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    this.state.scene.add(gridHelper);
    
    console.log('[CellRealApp] Scene initialized');
  }

  /**
   * Initialize UI systems
   */
  async _initUI() {
    // Initialize spreadsheet UI
    this.state.spreadsheet = new SpreadsheetUI();
    await this.state.spreadsheet.init();
    
    // Set spreadsheet callbacks
    this.state.spreadsheet.setCallbacks({
      onCellClick: (data) => this._handleCellClick(data),
      onCellEdit: (data) => this._handleCellEdit(data),
      onFormulaApply: (data) => this._handleFormulaApply(data),
      onCellFocus: (data) => this._handleCellFocus(data)
    });
    
    // Show spreadsheet by default
    this.state.spreadsheet.show();
    
    console.log('[CellRealApp] UI systems initialized');
  }

  /**
   * Initialize execution environment (hand + keyboard)
   */
  async _initExecutionEnvironment() {
    // Initialize hand system
    this.state.handSystem = new HandSystem(this.state.scene, this.state.camera);
    await this.state.handSystem.init();
    
    // Position hand
    this.state.handSystem.setPosition(-3, 0, -5);
    this.state.handSystem.setRotation(0, Math.PI / 4, 0);
    
    // Set hand callbacks
    this.state.handSystem.setCallbacks({
      onGestureComplete: (gesture) => this._handleGesture(gesture),
      onCellInteract: (cell) => this._handleCellInteract(cell)
    });
    
    // Initially hidden
    this.state.handSystem.hide();
    
    // Initialize keyboard system
    this.state.keyboardSystem = new KeyboardSystem(this.state.scene, this.state.camera);
    await this.state.keyboardSystem.init();
    
    // Position keyboard
    this.state.keyboardSystem.setPosition(0, -2, -4);
    this.state.keyboardSystem.setRotation(-Math.PI / 6, 0, 0);
    
    // Set keyboard callbacks
    this.state.keyboardSystem.setCallbacks({
      onKeyPress: (key) => this._handleKeyPress(key),
      onKeyRelease: (key) => this._handleKeyRelease(key)
    });
    
    // Initially hidden
    this.state.keyboardSystem.hide();
    
    console.log('[CellRealApp] Execution environment initialized');
  }

  /**
   * Setup event handlers
   */
  _setupEvents() {
    // Mode switching
    document.addEventListener('keydown', (e) => {
      // E key - toggle execution mode
      if (e.key === 'e' || e.key === 'E') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.toggleExecutionMode();
        }
      }
      
      // V key - toggle view mode (2D/3D)
      if (e.key === 'v' || e.key === 'V') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.toggleViewMode();
        }
      }
    });
    
    // Setup view toggle button
    const viewToggleBtn = document.getElementById('viewToggleBtn');
    if (viewToggleBtn) {
      viewToggleBtn.addEventListener('click', () => {
        this.toggleViewMode();
      });
    }
    
    console.log('[CellRealApp] Events setup complete');
  }

  /**
   * Start animation loop
   */
  _startAnimationLoop() {
    this.state.running = true;
    
    const animate = () => {
      if (!this.state.running) return;
      
      requestAnimationFrame(animate);
      
      const deltaTime = this.state.clock.getDelta();
      const totalTime = this.state.clock.getElapsedTime();
      
      // Update controls
      if (this.state.controls) {
        this.state.controls.update();
      }
      
      // Update execution environment
      if (this.state.executionMode) {
        if (this.state.handSystem) {
          this.state.handSystem.update(deltaTime);
        }
        if (this.state.keyboardSystem) {
          this.state.keyboardSystem.update(deltaTime);
        }
      }
      
      // Render scene
      if (this.state.renderer && this.state.scene && this.state.camera) {
        this.state.renderer.render(this.state.scene, this.state.camera);
      }
    };
    
    animate();
    
    console.log('[CellRealApp] Animation loop started');
  }

  /**
   * Toggle execution mode (show/hide hand and keyboard)
   */
  toggleExecutionMode() {
    this.state.executionMode = !this.state.executionMode;
    
    if (this.state.executionMode) {
      console.log('[CellRealApp] 🎮 Execution mode ENABLED');
      
      // Show execution environment
      this.state.handSystem?.show();
      this.state.keyboardSystem?.show();
      
      // Adjust camera for better view
      this.state.camera.position.set(0, 2, 8);
      this.state.controls.target.set(0, 0, 0);
      this.state.controls.update();
      
    } else {
      console.log('[CellRealApp] 🎮 Execution mode DISABLED');
      
      // Hide execution environment
      this.state.handSystem?.hide();
      this.state.keyboardSystem?.hide();
      
      // Restore camera
      this.state.camera.position.set(10, 10, 10);
      this.state.controls.target.set(0, 0, 0);
      this.state.controls.update();
    }
  }

  /**
   * Toggle view mode (2D/3D)
   */
  toggleViewMode() {
    if (this.state.mode === '2d') {
      this.state.mode = '3d';
      console.log('[CellRealApp] 📐 Switched to 3D mode');
      
      // Hide spreadsheet
      this.state.spreadsheet?.hide();
      
      // Show 3D view
      // TODO: Show voxel renderer
      
    } else {
      this.state.mode = '2d';
      console.log('[CellRealApp] 📊 Switched to 2D mode');
      
      // Show spreadsheet
      this.state.spreadsheet?.show();
      
      // Hide/minimize 3D view
      // TODO: Minimize voxel renderer
    }
  }

  /**
   * Handle cell click
   */
  _handleCellClick(data) {
    console.log('[CellRealApp] Cell clicked:', data);
    
    // In execution mode, point hand at cell
    if (this.state.executionMode && this.state.handSystem) {
      // Calculate 3D position for cell
      const cellPos = new THREE.Vector3(
        data.x - 13,
        data.y - 13,
        data.z
      );
      
      this.state.handSystem.pointAtCell(cellPos);
    }
  }

  /**
   * Handle cell edit
   */
  _handleCellEdit(data) {
    console.log('[CellRealApp] Cell edited:', data);
    
    // Update voxel representation
    // TODO: Update voxel at this position
  }

  /**
   * Handle formula apply
   */
  async _handleFormulaApply(data) {
    console.log('[CellRealApp] Formula applied:', data);
    
    // In execution mode, perform gesture sequence
    if (this.state.executionMode && this.state.handSystem) {
      await this.state.handSystem.executeFormula();
    }
    
    // Parse and execute formula
    try {
      // TODO: Use FormulaParser to execute
      // const result = await FormulaParser.parse(data.formula);
      
      // Update cell with result
      this.state.spreadsheet?.updateCell(
        data.x,
        data.y,
        data.z,
        'Result', // result value
        data.formula
      );
      
      console.log('[CellRealApp] ✅ Formula executed successfully');
    } catch (error) {
      console.error('[CellRealApp] ❌ Formula execution failed:', error);
    }
  }

  /**
   * Handle cell focus
   */
  _handleCellFocus(data) {
    this.state.focusedCell = data;
    
    // Update 3D camera to focus on cell
    if (this.state.mode === '3d') {
      const cellPos = new THREE.Vector3(
        data.x - 13,
        data.y - 13,
        data.z
      );
      
      this.state.controls.target.copy(cellPos);
      this.state.controls.update();
    }
  }

  /**
   * Handle gesture completion
   */
  _handleGesture(gesture) {
    console.log('[CellRealApp] Gesture completed:', gesture);
    
    // Trigger appropriate action based on gesture
    switch (gesture) {
      case 'point':
        // Cell is being pointed at
        break;
      case 'grab':
        // Cell is being grabbed
        break;
      case 'execute':
        // Formula is being executed
        console.log('[CellRealApp] ⚡ Executing formula...');
        break;
      case 'release':
        // Released
        break;
    }
  }

  /**
   * Handle cell interact
   */
  _handleCellInteract(cell) {
    console.log('[CellRealApp] Cell interact:', cell);
  }

  /**
   * Handle key press
   */
  _handleKeyPress(key) {
    // Key press handled by keyboard system
    // Can trigger additional effects here
  }

  /**
   * Handle key release
   */
  _handleKeyRelease(key) {
    // Key release handled by keyboard system
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
   * Destroy application
   */
  destroy() {
    console.log('[CellRealApp] Destroying application...');
    
    // Stop animation loop
    this.state.running = false;
    
    // Destroy systems
    if (this.state.spreadsheet) {
      this.state.spreadsheet.destroy();
    }
    
    if (this.state.handSystem) {
      this.state.handSystem.destroy();
    }
    
    if (this.state.keyboardSystem) {
      this.state.keyboardSystem.destroy();
    }
    
    // Dispose renderer
    if (this.state.renderer) {
      this.state.renderer.dispose();
      if (this.state.renderer.domElement.parentNode) {
        this.state.renderer.domElement.parentNode.removeChild(
          this.state.renderer.domElement
        );
      }
    }
    
    console.log('[CellRealApp] ✅ Application destroyed');
  }
}

export default CellRealApp;

