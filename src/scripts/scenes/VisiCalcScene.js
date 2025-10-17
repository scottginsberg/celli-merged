/**
 * VisiCalc Scene - Interactive Spreadsheet Reality
 * 
 * Core spreadsheet system with:
 * - Cell grid rendering and navigation
 * - Formula evaluation engine
 * - 3D array visualization  
 * - Cell editing and interactions
 * - Terminal command system
 * - R infection sequence
 * - Function library (ARRAY, TRANSPOSE, OFFSET, etc.)
 * 
 * Ported from merged2.html
 */

import * as THREE from 'three';
import { audioSystem } from '../systems/AudioSystem.js';

export class VisiCalcScene {
  constructor() {
    this.state = {
      running: false,
      scene: null,
      camera: null,
      renderer: null,
      endAudio: null,
      
      // Spreadsheet state
      cells: new Map(), // key: "A1" -> value: { value, formula, computed, style }
      arrays: new Map(), // key: arrayId -> { cells, mesh, anchor }
      focusedCell: 'A1',
      selectedCells: [],
      
      // Grid config
      gridRows: 20,
      gridCols: 10,
      cellWidth: 100,
      cellHeight: 30,
      
      // Visual elements
      cellMeshes: new Map(),
      textSprites: new Map(),
      
      // Terminal state
      terminalActive: false,
      terminalHistory: [],
      terminalInput: '',
      
      // R infection state
      rInfectionActive: false,
      rInfectedCells: new Set(),
      
      // Animation state
      cameraPosition: { x: 0, y: 0, z: 10 },
      cameraTarget: { x: 0, y: 0, z: 0 },
      
      // Functions registry
      functions: {}
    };
    
    this._initFunctions();
  }

  /**
   * Initialize spreadsheet functions
   */
  _initFunctions() {
    this.state.functions = {
      // ARRAY function - creates 2D/3D arrays
      ARRAY: this._fnArray.bind(this),
      
      // TRANSPOSE function - transposes arrays with axis/dir params
      TRANSPOSE: this._fnTranspose.bind(this),
      
      // OFFSET function - references cells with offset
      OFFSET: this._fnOffset.bind(this),
      
      // SUM function
      SUM: this._fnSum.bind(this),
      
      // DELETE function - animated cell deletion
      DELETE: this._fnDelete.bind(this),
      
      // SOKOBAN function - game logic
      SOKOBAN: this._fnSokoban.bind(this),
      
      // Math functions
      IF: this._fnIf.bind(this),
      EQ: this._fnEq.bind(this),
      DO: this._fnDo.bind(this),
      SET: this._fnSet.bind(this)
    };
  }

  /**
   * ARRAY function implementation
   */
  _fnArray(args) {
    // ARRAY(mode, width, height, depth, fill)
    // or ARRAY(x, y, z) for list mode
    // or ARRAY("fill", 3, 3, 1, "🟦")
    // or ARRAY("csv", "a,b,c\nd,e,f")
    
    if (args.length === 0) return '';
    
    const firstArg = args[0];
    const mode = (typeof firstArg === 'string' && ['fill', 'csv', 'list'].includes(firstArg.toLowerCase()))
      ? firstArg.toLowerCase()
      : (typeof firstArg === 'string' ? 'list' : 'fill');
    
    if (mode === 'fill') {
      const width = parseInt(args[1]) || 1;
      const height = parseInt(args[2]) || 1;
      const depth = parseInt(args[3]) || 1;
      const fillValue = args[4] || '';
      
      // Create 3D array
      const array = [];
      for (let z = 0; z < depth; z++) {
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            array.push(fillValue);
          }
        }
      }
      
      return array;
    } else if (mode === 'csv') {
      const csv = args[1] || '';
      const rows = csv.split('\n');
      const array = [];
      rows.forEach(row => {
        const cells = row.split(',');
        array.push(...cells);
      });
      return array;
    } else {
      // List mode - just return args as array
      return args;
    }
  }

  /**
   * TRANSPOSE function implementation
   */
  _fnTranspose(args) {
    // TRANSPOSE(input, axis, dir)
    // axis: 0=XY, 1=XZ, 2=YZ
    // dir: 0=forward (default), 1=reverse
    
    const input = args[0];
    const axis = parseInt(args[1]) || 0;
    const dir = parseInt(args[2]) || 0;
    
    if (!Array.isArray(input)) return input;
    
    // TODO: Implement 3D transpose logic based on axis and dir
    // For now, basic 2D transpose
    return input.reverse();
  }

  /**
   * OFFSET function implementation
   */
  _fnOffset(args) {
    // OFFSET(anchor, rowOffset, colOffset, depthOffset)
    const anchor = args[0];
    const rowOffset = parseInt(args[1]) || 0;
    const colOffset = parseInt(args[2]) || 0;
    const depthOffset = parseInt(args[3]) || 0;
    
    // Calculate offset cell address
    const cellAddr = this._offsetCellAddress(anchor, rowOffset, colOffset);
    return this._getCellValue(cellAddr);
  }

  /**
   * SUM function implementation
   */
  _fnSum(args) {
    let sum = 0;
    args.forEach(arg => {
      if (Array.isArray(arg)) {
        arg.forEach(val => {
          const num = parseFloat(val);
          if (!isNaN(num)) sum += num;
        });
      } else {
        const num = parseFloat(arg);
        if (!isNaN(num)) sum += num;
      }
    });
    return sum;
  }

  /**
   * DELETE function implementation
   */
  _fnDelete(args) {
    // DELETE(arrayIdOrCellRef)
    // Deletes arrays with animated explosion
    const target = args[0];
    
    console.log('🗑️ DELETE:', target);
    
    // TODO: Implement animated deletion
    // - Hide array immediately
    // - Spawn text sprites
    // - Hover/vibrate animation
    // - Explode into raining characters
    // - Remove from scene
    
    return '';
  }

  /**
   * SOKOBAN function implementation
   */
  _fnSokoban(args) {
    // SOKOBAN() creates Rules array with game logic
    // Returns formulas for wall blocking, box pushing, movement
    
    return [
      '=IF(EQ(OFFSET(soko.pos,soko.dy,soko.dx),"#"),"",DO(SET("soko.pos",OFFSET(soko.pos,soko.dy,soko.dx))))',
      '=IF(EQ(OFFSET(soko.pos,soko.dy,soko.dx),"📦"),IF(EQ(OFFSET(soko.pos,soko.dy*2,soko.dx*2),""),"push","blocked"),"move")'
    ];
  }

  /**
   * IF function
   */
  _fnIf(args) {
    const condition = args[0];
    const thenValue = args[1];
    const elseValue = args[2];
    return condition ? thenValue : elseValue;
  }

  /**
   * EQ function
   */
  _fnEq(args) {
    return args[0] === args[1];
  }

  /**
   * DO function
   */
  _fnDo(args) {
    // Execute actions in sequence
    args.forEach(action => {
      if (typeof action === 'function') action();
    });
    return args[args.length - 1];
  }

  /**
   * SET function
   */
  _fnSet(args) {
    const varName = args[0];
    const value = args[1];
    // TODO: Set global variable
    return value;
  }

  /**
   * Initialize scene
   */
  async init() {
    console.log('📊 Initializing VisiCalc Scene...');

    // Create 3D scene for array visualization
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 10);

    // Create renderer (or reuse existing)
    const app = document.getElementById('app');
    let renderer = app.querySelector('canvas')?.renderer;
    
    if (!renderer) {
      renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      app.appendChild(renderer.domElement);
    }

    this.state.scene = scene;
    this.state.camera = camera;
    this.state.renderer = renderer;

    // Create spreadsheet UI
    this._createSpreadsheetUI();

    // Setup event listeners
    this._setupEventListeners();

    console.log('✅ VisiCalc Scene initialized');
  }

  /**
   * Create spreadsheet UI
   */
  _createSpreadsheetUI() {
    // Create spreadsheet container
    let container = document.getElementById('visicalc');
    
    if (!container) {
      container = document.createElement('div');
      container.id = 'visicalc';
      container.style.cssText = `
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 80vw;
        height: 60vh;
        max-width: 1200px;
        background: rgba(0, 20, 10, 0.95);
        border: 2px solid #0f0;
        border-radius: 20px;
        box-shadow: 0 0 30px rgba(0, 255, 160, 0.3);
        font-family: 'Courier New', monospace;
        color: #0f0;
        overflow: hidden;
        display: none;
        z-index: 100;
      `;
      document.body.appendChild(container);
    }

    // Create grid
    const gridHtml = this._generateGridHTML();
    container.innerHTML = gridHtml;

    this.state.container = container;
  }

  /**
   * Generate grid HTML
   */
  _generateGridHTML() {
    let html = `
      <div style="padding: 10px; border-bottom: 1px solid #0f0; background: rgba(0, 30, 20, 0.8);">
        <div style="font-size: 14px; letter-spacing: 0.2em;">VISICALC</div>
        <div id="visicalc-cell-display" style="font-size: 11px; opacity: 0.7; margin-top: 4px;">A1: </div>
      </div>
      <div style="display: flex; flex-direction: column; height: calc(100% - 60px); overflow: auto;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="width: 40px; background: rgba(0, 30, 20, 0.8); border: 1px solid #0f0; padding: 4px;"></th>
    `;
    
    // Column headers
    for (let col = 0; col < this.state.gridCols; col++) {
      const letter = String.fromCharCode(65 + col);
      html += `<th style="background: rgba(0, 30, 20, 0.8); border: 1px solid #0f0; padding: 4px; min-width: 80px;">${letter}</th>`;
    }
    html += `</tr></thead><tbody>`;
    
    // Rows
    for (let row = 1; row <= this.state.gridRows; row++) {
      html += `<tr>`;
      html += `<td style="background: rgba(0, 30, 20, 0.8); border: 1px solid #0f0; padding: 4px; text-align: center;">${row}</td>`;
      
      for (let col = 0; col < this.state.gridCols; col++) {
        const letter = String.fromCharCode(65 + col);
        const cellAddr = `${letter}${row}`;
        html += `<td id="cell-${cellAddr}" class="visicalc-cell" data-addr="${cellAddr}" style="border: 1px solid #0f0; padding: 4px; cursor: pointer; transition: background 0.2s;"></td>`;
      }
      
      html += `</tr>`;
    }
    
    html += `</tbody></table></div>`;
    html += `
      <div id="visicalc-terminal" style="display: none; padding: 10px; border-top: 1px solid #0f0; background: rgba(0, 30, 20, 0.95); height: 120px; overflow: auto;">
        <div id="visicalc-terminal-output" style="font-size: 12px; line-height: 1.4; margin-bottom: 10px;"></div>
        <div style="display: flex; gap: 8px;">
          <span>></span>
          <input id="visicalc-terminal-input" type="text" style="flex: 1; background: transparent; border: none; color: #0f0; font-family: inherit; outline: none;" />
        </div>
      </div>
    `;
    
    return html;
  }

  /**
   * Setup event listeners
   */
  _setupEventListeners() {
    // Cell click handlers
    document.querySelectorAll('.visicalc-cell').forEach(cell => {
      cell.addEventListener('click', (e) => {
        const addr = e.target.dataset.addr;
        this._selectCell(addr);
      });
      
      cell.addEventListener('dblclick', (e) => {
        const addr = e.target.dataset.addr;
        this._editCell(addr);
      });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.state.running) return;
      
      if (e.key === 'ArrowUp') this._moveSelection(0, -1);
      else if (e.key === 'ArrowDown') this._moveSelection(0, 1);
      else if (e.key === 'ArrowLeft') this._moveSelection(-1, 0);
      else if (e.key === 'ArrowRight') this._moveSelection(1, 0);
      else if (e.key === 'Enter') this._editCell(this.state.focusedCell);
      else if (e.key === 'R' || e.key === 'r') this._startRInfection();
    });

    // Window resize
    window.addEventListener('resize', () => this._handleResize());
  }

  /**
   * Select cell
   */
  _selectCell(addr) {
    this.state.focusedCell = addr;
    
    // Update visual selection
    document.querySelectorAll('.visicalc-cell').forEach(cell => {
      cell.style.background = 'transparent';
    });
    
    const cellEl = document.getElementById(`cell-${addr}`);
    if (cellEl) {
      cellEl.style.background = 'rgba(0, 255, 160, 0.2)';
    }
    
    // Update cell display
    const cellData = this.state.cells.get(addr) || {};
    const displayEl = document.getElementById('visicalc-cell-display');
    if (displayEl) {
      displayEl.textContent = `${addr}: ${cellData.formula || cellData.value || ''}`;
    }
  }

  /**
   * Edit cell
   */
  _editCell(addr) {
    const cellData = this.state.cells.get(addr) || {};
    const newValue = prompt(`Edit ${addr}:`, cellData.formula || cellData.value || '');
    
    if (newValue !== null) {
      this._setCellValue(addr, newValue);
      this._recalculate();
      this._render();
    }
  }

  /**
   * Move selection
   */
  _moveSelection(colDelta, rowDelta) {
    const currentAddr = this.state.focusedCell;
    const col = currentAddr.charCodeAt(0) - 65;
    const row = parseInt(currentAddr.slice(1));
    
    const newCol = Math.max(0, Math.min(this.state.gridCols - 1, col + colDelta));
    const newRow = Math.max(1, Math.min(this.state.gridRows, row + rowDelta));
    
    const newAddr = String.fromCharCode(65 + newCol) + newRow;
    this._selectCell(newAddr);
  }

  /**
   * Set cell value
   */
  _setCellValue(addr, value) {
    const isFormula = typeof value === 'string' && value.startsWith('=');
    
    this.state.cells.set(addr, {
      value: isFormula ? '' : value,
      formula: isFormula ? value : '',
      computed: null,
      style: {}
    });
  }

  /**
   * Get cell value
   */
  _getCellValue(addr) {
    const cellData = this.state.cells.get(addr);
    if (!cellData) return '';
    
    if (cellData.computed !== null) return cellData.computed;
    if (cellData.value !== '') return cellData.value;
    
    return '';
  }

  /**
   * Recalculate all formulas
   */
  _recalculate() {
    // Topological sort and evaluation
    // For now, simple single-pass
    this.state.cells.forEach((cellData, addr) => {
      if (cellData.formula) {
        try {
          cellData.computed = this._evaluateFormula(cellData.formula, addr);
        } catch (e) {
          cellData.computed = '#ERROR';
          console.error(`Formula error in ${addr}:`, e);
        }
      }
    });
  }

  /**
   * Evaluate formula
   */
  _evaluateFormula(formula, addr) {
    // Remove leading =
    const expr = formula.slice(1);
    
    // Parse function call: FUNCTION(arg1, arg2, ...)
    const match = expr.match(/^([A-Z_]+)\((.*)\)$/);
    if (match) {
      const fnName = match[1];
      const argsStr = match[2];
      
      // Parse args (simple comma split for now)
      const args = argsStr ? argsStr.split(',').map(arg => {
        arg = arg.trim();
        
        // Cell reference
        if (/^[A-Z]+\d+$/.test(arg)) {
          return this._getCellValue(arg);
        }
        
        // String literal
        if (arg.startsWith('"') && arg.endsWith('"')) {
          return arg.slice(1, -1);
        }
        
        // Number
        if (!isNaN(arg)) {
          return parseFloat(arg);
        }
        
        // Nested function call
        if (arg.includes('(')) {
          return this._evaluateFormula('=' + arg, addr);
        }
        
        return arg;
      }) : [];
      
      // Call function
      const fn = this.state.functions[fnName];
      if (fn) {
        return fn(args);
      } else {
        console.warn(`Unknown function: ${fnName}`);
        return '#NAME?';
      }
    }
    
    // Simple cell reference
    if (/^[A-Z]+\d+$/.test(expr)) {
      return this._getCellValue(expr);
    }
    
    // Literal value
    return expr;
  }

  /**
   * Render cells to UI
   */
  _render() {
    this.state.cells.forEach((cellData, addr) => {
      const cellEl = document.getElementById(`cell-${addr}`);
      if (cellEl) {
        const displayValue = cellData.computed !== null ? cellData.computed : cellData.value;
        cellEl.textContent = displayValue;
        
        // Apply styles
        if (cellData.style.color) {
          cellEl.style.color = cellData.style.color;
        }
        if (cellData.style.background) {
          cellEl.style.background = cellData.style.background;
        }
      }
    });
  }

  /**
   * Start R infection sequence
   */
  _startRInfection() {
    if (this.state.rInfectionActive) return;
    
    console.log('🦠 R infection started');
    this.state.rInfectionActive = true;
    
    // TODO: Implement R infection visual effects
    // - Random cells turn red
    // - R characters appear
    // - Speech R system activates
  }

  /**
   * Offset cell address
   */
  _offsetCellAddress(addr, rowOffset, colOffset) {
    const col = addr.charCodeAt(0) - 65 + colOffset;
    const row = parseInt(addr.slice(1)) + rowOffset;
    
    if (col < 0 || col >= 26 || row < 1) return addr;
    
    return String.fromCharCode(65 + col) + row;
  }

  /**
   * Handle resize
   */
  _handleResize() {
    if (this.state.camera) {
      this.state.camera.aspect = window.innerWidth / window.innerHeight;
      this.state.camera.updateProjectionMatrix();
    }
    
    if (this.state.renderer) {
      this.state.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  /**
   * Start scene
   */
  async start(state, options = {}) {
    console.log('▶️ Starting VisiCalc Scene');

    this.state.running = true;

    this._silenceExternalAudio();

    if (!this.state.endAudio) {
      try {
        this.state.endAudio = new Audio('./end.mp3');
        this.state.endAudio.preload = 'auto';
      } catch (error) {
        console.warn('⚠️ Failed to initialize end.mp3 audio element', error);
        this.state.endAudio = null;
      }
    }

    if (this.state.endAudio) {
      try {
        this.state.endAudio.currentTime = 0;
        const playPromise = this.state.endAudio.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.catch(err => {
            console.warn('⚠️ Unable to play end.mp3 during VisiCalc Scene', err);
          });
        }
      } catch (error) {
        console.warn('⚠️ Error playing end.mp3 during VisiCalc Scene', error);
      }
    }

    // Show spreadsheet
    if (this.state.container) {
      this.state.container.style.display = 'block';
    }
    
    // Initialize with some demo data
    this._setCellValue('A1', 'CELLI');
    this._setCellValue('B2', '=ARRAY("fill", 3, 3, 1, "🟦")');
    this._setCellValue('C3', '=SUM(1, 2, 3)');
    
    this._recalculate();
    this._render();
    
    this._selectCell('A1');
  }

  /**
   * Update scene
   */
  update(state, deltaTime, totalTime) {
    if (!this.state.running) return;

    // Update 3D arrays
    this.state.arrays.forEach((arrayData, arrayId) => {
      // Animate array meshes
      if (arrayData.mesh) {
        arrayData.mesh.rotation.y += deltaTime * 0.5;
      }
    });

    // Render 3D scene
    if (this.state.scene && this.state.camera && this.state.renderer) {
      this.state.renderer.render(this.state.scene, this.state.camera);
    }
  }

  /**
   * Stop scene
   */
  async stop() {
    console.log('⏹️ Stopping VisiCalc Scene');
    this.state.running = false;

    if (this.state.endAudio) {
      try {
        this.state.endAudio.pause();
        this.state.endAudio.currentTime = 0;
      } catch (error) {
        console.warn('⚠️ Error stopping end.mp3 audio', error);
      }
    }

    // Hide spreadsheet
    if (this.state.container) {
      this.state.container.style.display = 'none';
    }
  }

  /**
   * Destroy scene
   */
  async destroy() {
    await this.stop();

    if (this.state.endAudio) {
      try {
        this.state.endAudio.pause();
      } catch (error) {
        console.warn('⚠️ Error pausing end.mp3 audio during destroy', error);
      }
      this.state.endAudio = null;
    }

    // Cleanup
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
    
    if (this.state.container) {
      this.state.container.remove();
    }
  }

  /**
   * Silence any background music that doesn't belong to VisiCell
   */
  _silenceExternalAudio() {
    try {
      if (audioSystem && typeof audioSystem.stopMusic === 'function') {
        audioSystem.stopMusic({ fadeOutDuration: 0.2 });
      }
    } catch (error) {
      console.warn('⚠️ Unable to stop background music before VisiCalc', error);
    }

    if (typeof window !== 'undefined') {
      try {
        if (typeof window.celliStopSongAudio === 'function') {
          window.celliStopSongAudio({ resetTime: true });
        } else if (window.celliSongAudioElement && typeof window.celliSongAudioElement.pause === 'function') {
          window.celliSongAudioElement.pause();
          window.celliSongAudioElement.currentTime = 0;
        }

        if (window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('celli:visicell-audio-muted'));
        }
      } catch (error) {
        console.warn('⚠️ Unable to silence legacy audio before VisiCalc', error);
      }
    }
  }
}

export default VisiCalcScene;


