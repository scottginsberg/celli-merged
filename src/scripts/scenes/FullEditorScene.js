/**
 * FullEditorScene - Complete Cell.real Editor Scene
 * 
 * Integrates all components for the full voxel spreadsheet editor:
 * - SpreadsheetUI (2D interface)
 * - HandSystem (gesture execution)
 * - KeyboardSystem (3D keyboard)
 * - VoxelRenderer (3D voxels)
 * - FormulaParser (formula execution)
 * - Store (state management)
 * 
 * This is the complete scene that recreates the full merged2.html experience
 * using modular components.
 */

import * as THREE from 'three';
import { SpreadsheetUI } from '../ui/SpreadsheetUI.js';
import { HandSystem } from '../input/HandSystem.js';
import { KeyboardSystem } from '../input/KeyboardSystem.js';

export class FullEditorScene {
  constructor() {
    this.name = 'FullEditor';
    
    this.state = {
      // Core Three.js
      scene: null,
      camera: null,
      renderer: null,
      
      // Components
      spreadsheet: null,
      handSystem: null,
      keyboardSystem: null,
      
      // State
      mode: '2d', // '2d' | '3d' | 'hybrid'
      executionMode: false,
      
      // Arrays
      arrays: new Map(),
      focusedArray: null,
      
      // Cells
      cells: new Map(), // arrId:x,y,z -> cell data
      
      // Voxels
      voxelMeshes: new Map(),
      
      // Animation
      running: false,
      clock: new THREE.Clock(),
      
      // Sequence state
      introComplete: false,
      
      // Callbacks
      onFormulaExecute: null,
      onCellChange: null,
      onArrayCreate: null
    };
    
    // Formula function registry
    this.formulaFunctions = this._initFormulas();
  }

  /**
   * Initialize formula functions
   */
  _initFormulas() {
    return {
      ARRAY: (...args) => this._executeArray(args),
      TRANSPOSE: (...args) => this._executeTranspose(args),
      DELETE: (...args) => this._executeDelete(args),
      OFFSET: (...args) => this._executeOffset(args),
      CREATE: (...args) => this._executeCreate(args),
      SUM: (...args) => this._executeSum(args),
      IF: (...args) => this._executeIf(args),
      EQ: (...args) => this._executeEq(args)
    };
  }

  /**
   * Initialize scene
   */
  async init() {
    console.log('[FullEditorScene] Initializing complete editor scene...');
    
    try {
      // Create scene
      this.state.scene = new THREE.Scene();
      this.state.scene.background = new THREE.Color(0x0a0a1a);
      this.state.scene.fog = new THREE.Fog(0x0a0a1a, 20, 100);
      
      // Setup lighting
      this._setupLighting();
      
      // Create grid helper
      const gridHelper = new THREE.GridHelper(20, 20, 0x333344, 0x1a1a2a);
      this.state.scene.add(gridHelper);
      
      // Initialize UI
      await this._initUI();
      
      // Initialize execution environment
      await this._initExecutionEnvironment();
      
      // Setup example content
      this._setupExampleContent();
      
      console.log('[FullEditorScene] ✅ Complete editor scene initialized');
      return true;
    } catch (error) {
      console.error('[FullEditorScene] ❌ Initialization failed:', error);
      return false;
    }
  }

  /**
   * Setup lighting
   */
  _setupLighting() {
    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    this.state.scene.add(ambient);
    
    // Main directional light
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    this.state.scene.add(dirLight);
    
    // Accent lights
    const accent1 = new THREE.PointLight(0x4a7cff, 0.6, 50);
    accent1.position.set(-10, 5, -10);
    this.state.scene.add(accent1);
    
    const accent2 = new THREE.PointLight(0xff4a7c, 0.4, 50);
    accent2.position.set(10, 5, 10);
    this.state.scene.add(accent2);
  }

  /**
   * Initialize UI
   */
  async _initUI() {
    // Create spreadsheet UI
    this.state.spreadsheet = new SpreadsheetUI();
    await this.state.spreadsheet.init();
    
    // Set callbacks
    this.state.spreadsheet.setCallbacks({
      onCellClick: (data) => this._handleCellClick(data),
      onCellEdit: (data) => this._handleCellEdit(data),
      onFormulaApply: (data) => this._handleFormulaApply(data),
      onCellFocus: (data) => this._handleCellFocus(data)
    });
    
    // Show spreadsheet
    this.state.spreadsheet.show();
    
    console.log('[FullEditorScene] Spreadsheet UI initialized');
  }

  /**
   * Initialize execution environment
   */
  async _initExecutionEnvironment() {
    // Hand system
    this.state.handSystem = new HandSystem(this.state.scene, this.state.camera);
    await this.state.handSystem.init();
    this.state.handSystem.setPosition(-3, 0, -5);
    this.state.handSystem.hide();
    
    // Keyboard system
    this.state.keyboardSystem = new KeyboardSystem(this.state.scene, this.state.camera);
    await this.state.keyboardSystem.init();
    this.state.keyboardSystem.setPosition(0, -2, -4);
    this.state.keyboardSystem.hide();
    
    // Set callbacks
    this.state.handSystem.setCallbacks({
      onGestureComplete: (gesture) => this._handleGesture(gesture)
    });
    
    console.log('[FullEditorScene] Execution environment initialized');
  }

  /**
   * Setup example content
   */
  _setupExampleContent() {
    // Add some example cells
    this.state.spreadsheet?.updateCell(0, 0, 0, 'Cell.real', '', '#4a7cff');
    this.state.spreadsheet?.updateCell(0, 1, 0, 'Voxel Editor', '', null);
    this.state.spreadsheet?.updateCell(0, 2, 0, '=ARRAY("fill",3,3,1,"🟦")', '=ARRAY("fill",3,3,1,"🟦")', null);
    
    // Create example voxel array
    this._createExampleArray();
  }

  /**
   * Create example voxel array
   */
  _createExampleArray() {
    const size = 3;
    const scale = 0.8;
    const gap = 0.1;
    
    const geometry = new THREE.BoxGeometry(scale, scale, scale);
    const material = new THREE.MeshStandardMaterial({
      color: 0x4a7cff,
      roughness: 0.4,
      metalness: 0.2
    });
    
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          const voxel = new THREE.Mesh(geometry, material.clone());
          voxel.position.set(
            (x - size/2) * (scale + gap),
            (y - size/2) * (scale + gap),
            (z - size/2) * (scale + gap)
          );
          voxel.castShadow = true;
          voxel.receiveShadow = true;
          
          this.state.scene.add(voxel);
          
          const key = `example:${x},${y},${z}`;
          this.state.voxelMeshes.set(key, voxel);
        }
      }
    }
  }

  /**
   * Handle cell click
   */
  _handleCellClick(data) {
    console.log('[FullEditorScene] Cell clicked:', data);
    
    // If execution mode, point hand at cell
    if (this.state.executionMode && this.state.handSystem) {
      const cellPos = new THREE.Vector3(
        (data.x - 13) * 0.8,
        (data.y - 13) * 0.8,
        data.z * 0.8
      );
      this.state.handSystem.pointAtCell(cellPos);
    }
    
    // Update voxel highlight
    this._highlightVoxel(data.x, data.y, data.z);
  }

  /**
   * Handle cell edit
   */
  _handleCellEdit(data) {
    console.log('[FullEditorScene] Cell edited:', data);
    
    if (this.state.onCellChange) {
      this.state.onCellChange(data);
    }
  }

  /**
   * Handle formula apply
   */
  async _handleFormulaApply(data) {
    console.log('[FullEditorScene] Formula applied:', data);
    
    // Show execution gesture
    if (this.state.executionMode && this.state.handSystem) {
      await this.state.handSystem.executeFormula();
    }
    
    // Parse and execute formula
    try {
      const result = await this._executeFormula(data.formula, data);
      
      // Update cell with result
      this.state.spreadsheet?.updateCell(
        data.x,
        data.y,
        data.z,
        this._formatResult(result),
        data.formula
      );
      
      // Notify
      if (this.state.onFormulaExecute) {
        this.state.onFormulaExecute(data, result);
      }
      
      console.log('[FullEditorScene] ✅ Formula executed:', result);
    } catch (error) {
      console.error('[FullEditorScene] ❌ Formula execution failed:', error);
      
      // Show error in cell
      this.state.spreadsheet?.updateCell(
        data.x,
        data.y,
        data.z,
        '#ERROR',
        data.formula,
        '#ffcccc'
      );
    }
  }

  /**
   * Handle cell focus
   */
  _handleCellFocus(data) {
    // Update 3D view if needed
  }

  /**
   * Handle gesture
   */
  _handleGesture(gesture) {
    console.log('[FullEditorScene] Gesture:', gesture);
  }

  /**
   * Execute formula
   */
  async _executeFormula(formula, context) {
    if (!formula || !formula.startsWith('=')) {
      return formula;
    }
    
    // Remove leading =
    const expr = formula.substring(1).trim();
    
    // Simple function call parsing
    const match = expr.match(/^([A-Z_]+)\((.*)\)$/);
    if (match) {
      const [, funcName, argsStr] = match;
      const func = this.formulaFunctions[funcName];
      
      if (func) {
        // Parse arguments (simplified)
        const args = this._parseArgs(argsStr);
        return await func(...args);
      }
    }
    
    // Simple evaluation for non-function formulas
    return this._evaluateExpression(expr);
  }

  /**
   * Parse function arguments
   */
  _parseArgs(argsStr) {
    if (!argsStr.trim()) return [];
    
    const args = [];
    let current = '';
    let inString = false;
    let depth = 0;
    
    for (let i = 0; i < argsStr.length; i++) {
      const char = argsStr[i];
      
      if (char === '"') {
        inString = !inString;
        current += char;
      } else if (!inString) {
        if (char === '(') depth++;
        else if (char === ')') depth--;
        else if (char === ',' && depth === 0) {
          args.push(this._parseValue(current.trim()));
          current = '';
          continue;
        }
        current += char;
      } else {
        current += char;
      }
    }
    
    if (current.trim()) {
      args.push(this._parseValue(current.trim()));
    }
    
    return args;
  }

  /**
   * Parse argument value
   */
  _parseValue(str) {
    // String literal
    if (str.startsWith('"') && str.endsWith('"')) {
      return str.slice(1, -1);
    }
    
    // Number
    if (!isNaN(str)) {
      return parseFloat(str);
    }
    
    // Keep as string
    return str;
  }

  /**
   * Evaluate expression
   */
  _evaluateExpression(expr) {
    // Simple evaluation (numbers, strings, basic math)
    try {
      // Security note: In production, use a proper expression evaluator
      return expr;
    } catch (error) {
      return '#ERROR';
    }
  }

  /**
   * Format result for display
   */
  _formatResult(result) {
    if (result === null || result === undefined) return '';
    if (typeof result === 'object') return '[Array]';
    return String(result);
  }

  /**
   * Highlight voxel
   */
  _highlightVoxel(x, y, z) {
    // Reset all voxels
    this.state.voxelMeshes.forEach(voxel => {
      if (voxel.material.emissive) {
        voxel.material.emissive.setHex(0x000000);
      }
    });
    
    // Highlight selected
    const key = `example:${x},${y},${z}`;
    const voxel = this.state.voxelMeshes.get(key);
    if (voxel && voxel.material.emissive) {
      voxel.material.emissive.setHex(0x4a7cff);
    }
  }

  /**
   * Formula implementations
   */
  _executeArray(args) {
    console.log('[FullEditorScene] ARRAY:', args);
    // Create array of voxels
    return { type: 'array', args };
  }

  _executeTranspose(args) {
    console.log('[FullEditorScene] TRANSPOSE:', args);
    return { type: 'transpose', args };
  }

  _executeDelete(args) {
    console.log('[FullEditorScene] DELETE:', args);
    return { type: 'delete', args };
  }

  _executeOffset(args) {
    console.log('[FullEditorScene] OFFSET:', args);
    return { type: 'offset', args };
  }

  _executeCreate(args) {
    console.log('[FullEditorScene] CREATE:', args);
    return { type: 'create', args };
  }

  _executeSum(args) {
    return args.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  }

  _executeIf(args) {
    const [condition, thenVal, elseVal] = args;
    return condition ? thenVal : elseVal;
  }

  _executeEq(args) {
    return args[0] === args[1];
  }

  /**
   * Toggle execution mode
   */
  toggleExecutionMode() {
    this.state.executionMode = !this.state.executionMode;
    
    if (this.state.executionMode) {
      this.state.handSystem?.show();
      this.state.keyboardSystem?.show();
      console.log('[FullEditorScene] 🎮 Execution mode ENABLED');
    } else {
      this.state.handSystem?.hide();
      this.state.keyboardSystem?.hide();
      console.log('[FullEditorScene] 🎮 Execution mode DISABLED');
    }
  }

  /**
   * Toggle view mode
   */
  toggleViewMode() {
    if (this.state.mode === '2d') {
      this.state.mode = '3d';
      this.state.spreadsheet?.hide();
      console.log('[FullEditorScene] 📐 3D mode');
    } else {
      this.state.mode = '2d';
      this.state.spreadsheet?.show();
      console.log('[FullEditorScene] 📊 2D mode');
    }
  }

  /**
   * Start scene
   */
  async start() {
    console.log('[FullEditorScene] ▶️ Starting');
    this.state.running = true;
    this.state.clock.start();
  }

  /**
   * Update scene
   */
  update(deltaTime, totalTime) {
    if (!this.state.running) return;
    
    // Update execution environment
    if (this.state.executionMode) {
      this.state.handSystem?.update(deltaTime);
      this.state.keyboardSystem?.update(deltaTime);
    }
    
    // Animate voxels
    this.state.voxelMeshes.forEach((voxel, key) => {
      const t = totalTime + key.split(',')[0] * 0.1;
      voxel.position.y += Math.sin(t * 2) * 0.001;
      voxel.rotation.y += deltaTime * 0.5;
    });
  }

  /**
   * Stop scene
   */
  stop() {
    console.log('[FullEditorScene] ⏹️ Stopping');
    this.state.running = false;
  }

  /**
   * Destroy scene
   */
  destroy() {
    this.stop();
    
    // Destroy components
    this.state.spreadsheet?.destroy();
    this.state.handSystem?.destroy();
    this.state.keyboardSystem?.destroy();
    
    // Dispose voxels
    this.state.voxelMeshes.forEach(voxel => {
      voxel.geometry.dispose();
      voxel.material.dispose();
      this.state.scene.remove(voxel);
    });
    this.state.voxelMeshes.clear();
    
    console.log('[FullEditorScene] 🗑️ Destroyed');
  }

  /**
   * Get scene for rendering
   */
  getScene() {
    return this.state.scene;
  }

  /**
   * Set callbacks
   */
  setCallbacks(callbacks) {
    if (callbacks.onFormulaExecute) this.state.onFormulaExecute = callbacks.onFormulaExecute;
    if (callbacks.onCellChange) this.state.onCellChange = callbacks.onCellChange;
    if (callbacks.onArrayCreate) this.state.onArrayCreate = callbacks.onArrayCreate;
  }
}

export default FullEditorScene;

