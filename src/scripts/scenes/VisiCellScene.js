/**
 * VisiCell Scene - Interactive Spreadsheet Reality
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
import { sceneManager } from '../core/SceneManager.js';
import { puzzleEventBus } from '../systems/PuzzleEventBus.js';

export class VisiCellScene {
  constructor(config = {}) {
    this.config = {
      defaultPuzzle: null,
      ...config
    };

    this.state = {
      running: false,
      scene: null,
      camera: null,
      renderer: null,
      endAudio: null,
      questOverlay: null,
      deathOverlay: null,
      deathSequenceActive: false,
      deathTimeouts: [],
      activePuzzle: null,
      puzzleOverlay: null,

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
      functions: {},

      // Presentation state
      previousBodyBackground: '',
      clueTrail: null,
      clueStepTimeouts: []
    };
    
    this._chainReady = false;
    this.subscriptions = [];

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
    console.log('📊 Initializing VisiCell Scene...');

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

    this._ensurePuzzleChainListeners();

    console.log('✅ VisiCell Scene initialized');
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
        background: rgba(0, 0, 0, 0.96);
        border: 2px solid #0f0;
        border-radius: 20px;
        box-shadow: 0 0 45px rgba(0, 255, 160, 0.35);
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
    this._ensureClueTrailState();
  }

  /**
   * Generate grid HTML
   */
  _generateGridHTML() {
    let html = `
      <div style="padding: 10px; border-bottom: 1px solid #0f0; background: rgba(0, 0, 0, 0.85);">
        <div style="font-size: 14px; letter-spacing: 0.2em;">VISICELL</div>
        <div id="visicalc-cell-display" style="font-size: 11px; opacity: 0.7; margin-top: 4px;">A1: </div>
      </div>
      <div style="display: flex; flex-direction: column; height: calc(100% - 60px); overflow: auto;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="width: 40px; background: rgba(0, 0, 0, 0.85); border: 1px solid #0f0; padding: 4px;"></th>
    `;
    
    // Column headers
    for (let col = 0; col < this.state.gridCols; col++) {
      const letter = String.fromCharCode(65 + col);
      html += `<th style="background: rgba(0, 0, 0, 0.85); border: 1px solid #0f0; padding: 4px; min-width: 80px;">${letter}</th>`;
    }
    html += `</tr></thead><tbody>`;
    
    // Rows
    for (let row = 1; row <= this.state.gridRows; row++) {
      html += `<tr>`;
      html += `<td style="background: rgba(0, 0, 0, 0.85); border: 1px solid #0f0; padding: 4px; text-align: center;">${row}</td>`;
      
      for (let col = 0; col < this.state.gridCols; col++) {
        const letter = String.fromCharCode(65 + col);
        const cellAddr = `${letter}${row}`;
        html += `<td id="cell-${cellAddr}" class="visicalc-cell" data-addr="${cellAddr}" style="border: 1px solid #0f0; padding: 4px; cursor: pointer; transition: background 0.2s;"></td>`;
      }
      
      html += `</tr>`;
    }
    
    html += `</tbody></table></div>`;
    html += `
      <div id="visicalc-terminal" style="display: none; padding: 10px; border-top: 1px solid #0f0; background: rgba(0, 0, 0, 0.92); height: 120px; overflow: auto;">
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

      if (this._handleClueKeydown(e)) return;

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
      const cellAddr = cell.dataset.addr;
      const cellData = this.state.cells.get(cellAddr);
      if (cellData && cellData.style && cellData.style.background) {
        cell.style.background = cellData.style.background;
      } else {
        cell.style.background = 'transparent';
      }
      cell.style.boxShadow = 'none';
      cell.style.outline = 'none';
    });

    const cellEl = document.getElementById(`cell-${addr}`);
    if (cellEl) {
      cellEl.style.outline = '2px solid #0f0';
      cellEl.style.boxShadow = '0 0 12px rgba(0, 255, 160, 0.35)';
    }

    this._applyClueCellHighlight();

    // Update cell display
    const cellData = this.state.cells.get(addr) || {};
    const displayEl = document.getElementById('visicalc-cell-display');
    if (displayEl) {
      displayEl.textContent = `${addr}: ${cellData.formula || cellData.value || ''}`;
    }
  }

  _applyClueCellHighlight() {
    const clue = this.state.clueTrail;
    if (!clue) {
      return;
    }

    const cells = (clue.highlightedCells && clue.highlightedCells.size)
      ? Array.from(clue.highlightedCells)
      : (clue.entryCell ? [clue.entryCell] : []);

    cells.forEach(cellId => {
      const cellEl = document.getElementById(`cell-${cellId}`);
      if (cellEl) {
        cellEl.style.background = 'rgba(0, 0, 0, 0.85)';
        cellEl.style.color = '#0f0';
        cellEl.style.boxShadow = '0 0 16px rgba(0, 255, 160, 0.45)';
        cellEl.style.borderColor = '#0f0';
      }
    });
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
  _setCellValue(addr, value, options = {}) {
    const { suppressClueCheck = false, resetStyle = false, style: overrideStyle } = options;
    const isFormula = typeof value === 'string' && value.startsWith('=');
    const existing = this.state.cells.get(addr);

    const style = (!resetStyle && existing && existing.style)
      ? { ...existing.style }
      : {};

    if (overrideStyle && typeof overrideStyle === 'object') {
      Object.assign(style, overrideStyle);
    }

    const cellData = {
      value: isFormula ? '' : value,
      formula: isFormula ? value : '',
      computed: null,
      style
    };

    this.state.cells.set(addr, cellData);

    if (!suppressClueCheck) {
      this._handleClueCellValueChange(addr);
    }

    return cellData;
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
        if (cellData.style && typeof cellData.style === 'object') {
          Object.entries(cellData.style).forEach(([styleKey, styleValue]) => {
            if (styleKey in cellEl.style) {
              cellEl.style[styleKey] = styleValue;
            }
          });
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

  _ensureClueTrailState() {
    const container = this.state.container;
    if (!container) return null;

    if (this.state.clueTrail && this.state.clueTrail.overlayEl && this.state.clueTrail.overlayEl.isConnected) {
      this.state.clueTrail.overlayEl.style.display = 'flex';
      return this.state.clueTrail;
    }

    const overlay = document.createElement('div');
    overlay.id = 'visicell-clue-overlay';
    overlay.style.position = 'absolute';
    overlay.style.left = '36px';
    overlay.style.bottom = '28px';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.gap = '8px';
    overlay.style.pointerEvents = 'none';
    overlay.style.fontFamily = `'Courier New', monospace`;
    overlay.style.letterSpacing = '0.18em';
    overlay.style.color = '#0f0';
    overlay.style.textTransform = 'uppercase';
    overlay.style.fontSize = '14px';
    overlay.style.zIndex = '101';

    const instruction = document.createElement('div');
    instruction.id = 'visicell-entry-instruction';
    instruction.style.fontSize = '12px';
    instruction.style.opacity = '0.85';
    instruction.style.letterSpacing = '0.12em';

    const display = document.createElement('div');
    display.id = 'visicell-entry-display';
    display.style.fontSize = '18px';
    display.style.letterSpacing = '0.22em';

    overlay.appendChild(instruction);
    overlay.appendChild(display);
    container.appendChild(overlay);

    const clue = {
      entryCell: null,
      baseInput: 'ENTE',
      currentInput: 'ENTE',
      overlayEl: overlay,
      instructionEl: instruction,
      displayEl: display,
      active: true,
      stage: 'await-command',
      highlightedCells: new Set(),
      steps: [],
      messageCells: [],
      lastTriggeredValue: null,
      lastShownInvalidValue: null,
      completedMode: null,
      pendingDeathMode: null,
      deathSequenceScheduled: false,
      initializing: false
    };

    this.state.clueTrail = clue;
    return clue;
  }

  _pickRandomEntryCell() {
    const candidates = ['D5', 'E6', 'F7', 'C8', 'G4', 'H6'];
    const index = Math.floor(Math.random() * candidates.length);
    return candidates[index] || 'D5';
  }

  _clearClueMessageCells() {
    const clue = this.state.clueTrail;
    if (!clue || !Array.isArray(clue.messageCells) || clue.messageCells.length === 0) {
      return;
    }

    clue.messageCells.forEach(cellInfo => {
      if (!cellInfo || !cellInfo.addr) return;

      const { addr, formula, value, style } = cellInfo;
      if (formula) {
        this._setCellValue(addr, formula, { suppressClueCheck: true, resetStyle: true });
      } else if (value) {
        this._setCellValue(addr, value, { suppressClueCheck: true, resetStyle: true });
      } else {
        this._setCellValue(addr, '', { suppressClueCheck: true, resetStyle: true });
      }

      const restored = this.state.cells.get(addr);
      if (restored) {
        restored.style = style ? { ...style } : {};
      }
    });

    clue.messageCells = [];
    this._render();
  }

  _displayClueMessageAcrossCells(message, startCell = 'A10') {
    const clue = this.state.clueTrail;
    if (!clue) {
      return;
    }

    this._clearClueMessageCells();

    const sanitized = (message || '').toUpperCase();
    const totalCols = this.state.gridCols;
    const startCol = Math.max(0, startCell.charCodeAt(0) - 65);
    let colIndex = startCol;
    let rowIndex = parseInt(startCell.slice(1), 10) || 10;

    clue.messageCells = [];

    for (let i = 0; i < sanitized.length; i++) {
      if (rowIndex > this.state.gridRows) break;

      const addr = String.fromCharCode(65 + colIndex) + rowIndex;
      const previous = this.state.cells.get(addr);
      clue.messageCells.push({
        addr,
        value: previous ? previous.value : '',
        formula: previous ? previous.formula : '',
        style: previous && previous.style ? { ...previous.style } : null
      });

      const char = sanitized[i];
      const displayChar = char === ' ' ? '' : char;
      const cellData = this._setCellValue(addr, displayChar, { suppressClueCheck: true, resetStyle: true });
      cellData.style = cellData.style || {};
      Object.assign(cellData.style, {
        background: 'rgba(0, 32, 0, 0.65)',
        color: '#0f0',
        textAlign: 'center',
        fontWeight: '600',
        letterSpacing: '0.08em',
        textTransform: 'uppercase'
      });

      const cellEl = document.getElementById(`cell-${addr}`);
      if (cellEl) {
        cellEl.style.textTransform = 'uppercase';
      }

      colIndex++;
      if (colIndex >= totalCols) {
        colIndex = 0;
        rowIndex++;
      }
    }

    this._render();
  }

  _handleClueCellValueChange(addr, overrideValue) {
    const clue = this.state.clueTrail;
    if (!clue || clue.initializing || clue.completedMode) {
      return;
    }

    if (addr !== clue.entryCell) {
      return;
    }

    const cellData = this.state.cells.get(addr);
    const raw = overrideValue !== undefined
      ? overrideValue
      : (cellData ? (cellData.formula || cellData.value) : '');

    const normalized = (raw || '').toString().trim().toUpperCase();
    if (!normalized || normalized === (clue.baseInput || '').toUpperCase()) {
      return;
    }

    if (normalized === 'LEAVE' && clue.lastTriggeredValue !== 'LEAVE') {
      clue.currentInput = normalized;
      clue.lastTriggeredValue = 'LEAVE';
      this._startClueTrailSequence('leave');
      return;
    }

    if (normalized === 'ENTER' && clue.lastTriggeredValue !== 'ENTER') {
      clue.currentInput = normalized;
      clue.lastTriggeredValue = 'ENTER';
      this._startQuestSequence();
      return;
    }

    if (normalized && clue.lastShownInvalidValue !== normalized) {
      clue.lastShownInvalidValue = normalized;
      this._showClueInstruction('That completion warps the grid. Try another ending.');
    }
  }

  _ensureQuestOverlay() {
    if (this.state.questOverlay && this.state.questOverlay.isConnected) {
      return this.state.questOverlay;
    }

    const container = this.state.container;
    if (!container) {
      return null;
    }

    const overlay = document.createElement('div');
    overlay.id = 'visicell-quest-overlay';
    overlay.style.position = 'absolute';
    overlay.style.top = '40px';
    overlay.style.right = '32px';
    overlay.style.width = '280px';
    overlay.style.padding = '16px';
    overlay.style.border = '2px solid #0f0';
    overlay.style.borderRadius = '12px';
    overlay.style.background = 'rgba(0, 0, 0, 0.94)';
    overlay.style.boxShadow = '0 0 24px rgba(0, 255, 160, 0.28)';
    overlay.style.color = '#0f0';
    overlay.style.display = 'none';
    overlay.style.flexDirection = 'column';
    overlay.style.gap = '8px';
    overlay.style.fontFamily = `'Courier New', monospace`;
    overlay.style.textTransform = 'uppercase';
    overlay.style.letterSpacing = '0.12em';
    overlay.style.zIndex = '120';

    const title = document.createElement('div');
    title.textContent = 'Quest // VisiCell Simulator';
    title.style.fontSize = '12px';
    title.style.opacity = '0.78';

    const body = document.createElement('div');
    body.id = 'visicell-quest-body';
    body.style.fontSize = '13px';
    body.style.lineHeight = '1.5';
    body.style.letterSpacing = '0.06em';
    body.textContent = 'Fudge the numbers before the presentation - make sure boss doesn\'t find out!';

    overlay.appendChild(title);
    overlay.appendChild(body);
    container.appendChild(overlay);

    this.state.questOverlay = overlay;
    return overlay;
  }

  _startQuestSequence() {
    const overlay = this._ensureQuestOverlay();
    if (overlay) {
      overlay.style.display = 'flex';
      const body = overlay.querySelector('#visicell-quest-body');
      if (body) {
        body.textContent = 'Fudge the numbers before the presentation - make sure boss doesn\'t find out!';
      }
    }

    this._startClueTrailSequence('enter');
  }

  _ensureDeathOverlay() {
    if (this.state.deathOverlay && this.state.deathOverlay.isConnected) {
      return this.state.deathOverlay;
    }

    const overlay = document.createElement('div');
    overlay.id = 'visicell-death-overlay';
    overlay.style.position = 'fixed';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.display = 'none';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '999';
    overlay.style.fontSize = '56px';
    overlay.style.fontWeight = '700';
    overlay.style.textTransform = 'uppercase';
    overlay.style.letterSpacing = '0.18em';
    overlay.textContent = 'You died.';

    document.body.appendChild(overlay);
    this.state.deathOverlay = overlay;
    return overlay;
  }

  _applyDeathOverlayStage(stage) {
    const overlay = this._ensureDeathOverlay();
    if (!overlay) {
      return;
    }

    if (stage === 'souls') {
      overlay.style.background = 'radial-gradient(circle, rgba(60, 10, 10, 0.96) 0%, rgba(10, 0, 0, 0.96) 75%)';
      overlay.style.color = '#d73b2f';
      overlay.style.fontFamily = `'Cinzel', serif`;
      overlay.style.textShadow = '0 0 28px rgba(215, 59, 47, 0.8)';
      overlay.textContent = 'You Died.';
    } else if (stage === 'gta') {
      overlay.style.background = 'linear-gradient(140deg, rgba(20, 20, 20, 0.95), rgba(45, 10, 55, 0.92))';
      overlay.style.color = '#ff6ce1';
      overlay.style.fontFamily = `'Impact', sans-serif`;
      overlay.style.textShadow = '2px 2px 0 rgba(0,0,0,0.65), -2px -2px 0 rgba(0,0,0,0.45)';
      overlay.textContent = 'You Died.';
    } else {
      overlay.style.background = 'rgba(0, 0, 0, 0.95)';
      overlay.style.color = '#0f0';
      overlay.style.fontFamily = `'Courier New', monospace`;
      overlay.style.textShadow = '0 0 18px rgba(0, 255, 160, 0.55)';
      overlay.textContent = 'You died.';
    }
  }

  _clearDeathTimeouts() {
    if (!Array.isArray(this.state.deathTimeouts)) {
      this.state.deathTimeouts = [];
      return;
    }

    this.state.deathTimeouts.forEach(timeoutId => window.clearTimeout(timeoutId));
    this.state.deathTimeouts.length = 0;

    if (this.state.deathOverlay) {
      this.state.deathOverlay.style.display = 'none';
      this._applyDeathOverlayStage('visicell');
    }
    this.state.deathSequenceActive = false;
  }

  _startDeathSequence(mode = 'leave') {
    this._clearDeathTimeouts();

    const overlay = this._ensureDeathOverlay();
    if (!overlay) {
      return;
    }

    if (this.state.questOverlay) {
      this.state.questOverlay.style.display = 'none';
    }

    this.state.deathSequenceActive = true;
    overlay.style.display = 'flex';
    this._applyDeathOverlayStage('visicell');

    const stageDurations = [1600, 1600, 1600];
    const soulsTimeout = window.setTimeout(() => this._applyDeathOverlayStage('souls'), stageDurations[0]);
    const gtaTimeout = window.setTimeout(() => this._applyDeathOverlayStage('gta'), stageDurations[0] + stageDurations[1]);
    const resetTimeout = window.setTimeout(() => {
      overlay.style.display = 'none';
      this.state.deathSequenceActive = false;
      this._applyDeathOverlayStage('visicell');
      this._showOregonTrailEnding(mode);
    }, stageDurations[0] + stageDurations[1] + stageDurations[2] + 800);

    this.state.deathTimeouts.push(soulsTimeout, gtaTimeout, resetTimeout);
  }

  _showOregonTrailEnding(mode = 'leave') {
    const clue = this.state.clueTrail;
    const cells = ['H12', 'H13'];
    const values = ['YOU DIED.', 'OF DYSENTERY.'];

    cells.forEach((addr, index) => {
      const timeout = window.setTimeout(() => {
        const cellData = this._setCellValue(addr, values[index], { suppressClueCheck: true, resetStyle: true });
        cellData.style = cellData.style || {};
        Object.assign(cellData.style, {
          background: 'rgba(0, 0, 0, 0.88)',
          color: '#0f0',
          textAlign: 'center',
          fontWeight: '700',
          textTransform: 'uppercase'
        });

        if (clue) {
          clue.highlightedCells.add(addr);
        }

        this._render();
        this._applyClueCellHighlight();
      }, index === 0 ? 180 : 880);

      this.state.deathTimeouts.push(timeout);
    });

    const endingMessage = mode === 'enter'
      ? 'Quest failed. You died of dysentery.'
      : 'Trail complete. You died of dysentery.';
    this._showClueInstruction(endingMessage);

    if (clue) {
      clue.stage = 'end';
      clue.active = false;
    }
  }

  _initializeClueTrail() {
    const clue = this._ensureClueTrailState();
    if (!clue) return;

    const entryCell = this._pickRandomEntryCell();
    clue.entryCell = entryCell;
    clue.currentInput = clue.baseInput;
    clue.active = true;
    clue.stage = 'await-command';
    clue.highlightedCells = new Set([entryCell]);
    clue.steps = [];
    clue.completedMode = null;
    clue.pendingDeathMode = null;
    clue.deathSequenceScheduled = false;
    clue.lastTriggeredValue = null;
    clue.lastShownInvalidValue = null;

    clue.initializing = true;
    this._setCellValue(entryCell, clue.baseInput, { suppressClueCheck: true, resetStyle: true });
    this._updateClueDisplay();
    clue.initializing = false;

    this._displayClueMessageAcrossCells(`Finish the word in cell ${entryCell}.`);

    this._showClueInstruction(`Finish the word in ${entryCell}. Choose compliance or rebellion.`);
    this._selectCell(entryCell);
  }

  _updateClueDisplay() {
    const clue = this.state.clueTrail;
    if (!clue) {
      return;
    }

    if (clue.displayEl) {
      const caret = clue.active ? '_' : '';
      clue.displayEl.textContent = `${clue.currentInput}${caret}`;
    }

    let cellData = this.state.cells.get(clue.entryCell);
    if (!cellData) {
      this._setCellValue(clue.entryCell, clue.currentInput, {
        suppressClueCheck: true,
        resetStyle: true,
        style: {
          background: 'rgba(0, 0, 0, 0.85)',
          color: '#0f0',
          textAlign: 'center',
          fontWeight: '600'
        }
      });
      cellData = this.state.cells.get(clue.entryCell);
    } else {
      cellData.value = clue.currentInput;
      cellData.formula = '';
      cellData.style = cellData.style || {};
      Object.assign(cellData.style, {
        background: 'rgba(0, 0, 0, 0.85)',
        color: '#0f0',
        textAlign: 'center',
        fontWeight: '600'
      });

      if (!clue.initializing) {
        this._handleClueCellValueChange(clue.entryCell, clue.currentInput);
      }
    }

    this._render();
    this._applyClueCellHighlight();
  }

  _showClueInstruction(message) {
    const clue = this.state.clueTrail;
    if (!clue || !clue.instructionEl) {
      return;
    }

    clue.instructionEl.textContent = message;
  }

  _handleClueKeydown(e) {
    const clue = this.state.clueTrail;
    if (!clue || !clue.active) {
      return false;
    }

    if (this.state.focusedCell !== clue.entryCell) {
      return false;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (clue.currentInput.length > 0) {
        clue.currentInput = clue.currentInput.slice(0, -1);
        if (clue.currentInput.length === 0) {
          clue.currentInput = '';
        }
        this._updateClueDisplay();
      }
      return true;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      this._submitClueInput();
      return true;
    }

    if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
      e.preventDefault();
      if (clue.currentInput.length >= 8) {
        clue.currentInput = clue.currentInput.slice(0, 7);
      }
      clue.currentInput += e.key.toUpperCase();
      this._updateClueDisplay();
      return true;
    }

    return false;
  }

  _submitClueInput() {
    const clue = this.state.clueTrail;
    if (!clue) {
      return;
    }

    const value = (clue.currentInput || '').trim();
    if (!value) {
      this._showClueInstruction('The command waits for a completion.');
      return;
    }

    this._handleClueCellValueChange(clue.entryCell, value);
  }

  _startClueTrailSequence(mode = 'leave') {
    const clue = this.state.clueTrail;
    if (!clue) {
      return;
    }

    clue.active = false;
    clue.stage = mode === 'enter' ? 'quest' : 'trail';
    clue.completedMode = mode;
    clue.pendingDeathMode = mode;
    clue.deathSequenceScheduled = false;
    clue.displayEl.textContent = clue.currentInput;
    this._showClueInstruction(mode === 'enter'
      ? 'Quest sequence initiated... fudge quietly.'
      : 'Clue trail initiated... watch the grid.');

    const steps = mode === 'enter'
      ? [
        { delay: 0, cell: 'C5', value: 'FUDGE', message: 'Quest Step 1: C5 flashes "FUDGE".' },
        { delay: 2200, cell: 'E3', value: 'NUMBERS', message: 'Quest Step 2: E3 scribbles "NUMBERS".' },
        { delay: 4400, cell: 'D7', value: 'HURRY', message: 'Quest Step 3: D7 hisses "HURRY".' }
      ]
      : [
        { delay: 0, cell: 'C5', value: 'NEXT', message: 'Clue 1: Cell C5 glows with "NEXT".' },
        { delay: 2200, cell: 'E3', value: 'DOOR', message: 'Clue 2: E3 whispers "DOOR".' },
        { delay: 4400, cell: 'D7', value: 'OPENS', message: 'Clue 3: D7 completes the phrase "OPENS".' }
      ];

    clue.steps = steps;
    this._clearClueTrailTimeouts();

    steps.forEach((step, index) => {
      const timeoutId = window.setTimeout(() => {
        this._revealClueStep(step, index === steps.length - 1);
      }, step.delay);
      this.state.clueStepTimeouts.push(timeoutId);
    });
  }

  _revealClueStep(step, isFinal) {
    if (!step || !step.cell) {
      return;
    }

    this._setCellValue(step.cell, step.value);
    const cellData = this.state.cells.get(step.cell);
    if (cellData) {
      cellData.style = cellData.style || {};
      cellData.style.background = 'rgba(0, 0, 0, 0.85)';
      cellData.style.color = '#0f0';
    }

    const clue = this.state.clueTrail;
    if (clue) {
      clue.highlightedCells.add(step.cell);
    }

    this._render();
    this._applyClueCellHighlight();

    if (step.message) {
      this._showClueInstruction(step.message);
    }

    if (isFinal) {
      const finalMessage = clue && clue.completedMode === 'enter'
        ? 'Numbers fudged. The boss is almost here.'
        : 'The message is complete. Follow it.';
      this._showClueInstruction(finalMessage);

      if (clue && !clue.deathSequenceScheduled) {
        clue.deathSequenceScheduled = true;
        const timeoutId = window.setTimeout(() => {
          this._startDeathSequence(clue.pendingDeathMode || 'leave');
        }, 1600);
        this.state.clueStepTimeouts.push(timeoutId);
      }
    }
  }

  _clearClueTrailTimeouts() {
    if (!Array.isArray(this.state.clueStepTimeouts)) {
      this.state.clueStepTimeouts = [];
      return;
    }

    this.state.clueStepTimeouts.forEach(timeoutId => {
      window.clearTimeout(timeoutId);
    });
    this.state.clueStepTimeouts.length = 0;

    if (typeof this._clearDeathTimeouts === 'function') {
      this._clearDeathTimeouts();
    }

    if (this.state.clueTrail) {
      this.state.clueTrail.deathSequenceScheduled = false;
    }
  }

  /**
   * Start scene
   */
  async start(state, options = {}) {
    console.log('▶️ Starting VisiCell Scene');

    this.state.running = true;

    this._silenceExternalAudio();

    if (typeof document !== 'undefined') {
      this.state.previousBodyBackground = document.body.style.backgroundColor;
      document.body.style.backgroundColor = '#000';
    }

    if (!this.state.endAudio) {
      this.state.endAudio = this._createAudioStream('./end.mp3');
    }

    this._playAudioStream(this.state.endAudio, 'VisiCell Scene');

    // Show spreadsheet
    if (this.state.container) {
      this.state.container.style.display = 'block';
    }

    this._clearClueTrailTimeouts();

    // Initialize with some demo data
    this._setCellValue('A1', 'CELLI');
    this._setCellValue('B2', '=ARRAY("fill", 3, 3, 1, "🟦")');
    this._setCellValue('C3', '=SUM(1, 2, 3)');

    this._recalculate();
    this._initializeClueTrail();

    const startPuzzle = options.puzzle || options.puzzleName || this.config.defaultPuzzle;
    if (startPuzzle) {
      this._activatePuzzle(startPuzzle, options);
    }
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
    console.log('⏹️ Stopping VisiCell Scene');
    this.state.running = false;

    this._removePuzzleOverlay();
    this.state.activePuzzle = null;

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

    if (this.state.questOverlay) {
      this.state.questOverlay.style.display = 'none';
    }

    if (this.state.deathOverlay) {
      this.state.deathOverlay.style.display = 'none';
    }

    if (typeof document !== 'undefined') {
      document.body.style.backgroundColor = this.state.previousBodyBackground || '';
      this.state.previousBodyBackground = '';
    }

    if (this.state.clueTrail && this.state.clueTrail.overlayEl) {
      this.state.clueTrail.overlayEl.style.display = 'none';
    }

    this._clearClueTrailTimeouts();
  }

  /**
   * Destroy scene
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

  _createAudioStream(src) {
    if (!src || typeof src !== 'string') {
      return null;
    }

    if (/^file:/i.test(src)) {
      console.warn('⚠️ Refusing to load audio from forbidden protocol', src);
      return null;
    }

    const normalized = (/^https?:/i.test(src) || src.startsWith('./') || src.startsWith('/'))
      ? src
      : `./${src}`;

    try {
      const audio = new Audio(normalized);
      audio.preload = 'auto';
      if ('crossOrigin' in audio) {
        audio.crossOrigin = 'anonymous';
      }
      return audio;
    } catch (error) {
      console.warn(`⚠️ Failed to create audio stream for ${normalized}`, error);
      return null;
    }
  }

  _playAudioStream(audio, contextLabel = 'VisiCell') {
    if (!audio) {
      return;
    }

    try {
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(err => {
          console.warn(`⚠️ Unable to play audio during ${contextLabel}`, err);
        });
      }
    } catch (error) {
      console.warn(`⚠️ Error playing audio during ${contextLabel}`, error);
    }
  }

  _activatePuzzle(puzzleName, options = {}) {
    if (!puzzleName) {
      return;
    }

    const normalized = String(puzzleName).toLowerCase();
    if (this.state.activePuzzle === normalized) {
      return;
    }

    this.state.activePuzzle = normalized;

    puzzleEventBus.emitRiddleAvailable(normalized, {
      scene: 'visicell',
      options
    });

    this._showPuzzleOverlay(normalized, options);
  }

  _showPuzzleOverlay(puzzleName, options = {}) {
    if (typeof document === 'undefined') {
      return;
    }

    this._removePuzzleOverlay();

    const titles = {
      sokoban: 'SOKOBAN // Warehouse Conundrum',
      galaxy: 'GALAXY // Orbital Focus Puzzle'
    };
    const descriptions = {
      sokoban: 'Reorganize the crates using spreadsheet formulas. Use logic to push every box into position.',
      galaxy: 'Navigate gravitational wells to realign the planetoids. Each formula changes the orbital pull.'
    };

    const title = titles[puzzleName] || puzzleName.toUpperCase();
    const description = descriptions[puzzleName] || 'Solve the riddle to progress.';

    const overlay = document.createElement('div');
    overlay.id = 'visicell-puzzle-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.92);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1200;
      pointer-events: auto;
    `;

    overlay.innerHTML = `
      <div style="max-width: 640px; padding: 40px; text-align: center;">
        <h2 style="color: #0ff; font-family: 'VT323', monospace; font-size: 32px; margin-bottom: 20px;">
          ${title}
        </h2>
        <p style="color: #0cf; font-family: 'Courier New', monospace; line-height: 1.6;">
          ${description}
        </p>
        <div style="display: flex; gap: 16px; justify-content: center; margin-top: 30px; flex-wrap: wrap;">
          <button id="visicell-puzzle-complete" style="padding: 15px 30px; background: #0ff; color: #000; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
            Mark Puzzle Solved
          </button>
          <button id="visicell-puzzle-skip" style="padding: 15px 30px; background: #08f; color: #000; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
            Skip Puzzle
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.state.puzzleOverlay = overlay;

    const resolve = (skipped) => {
      this._removePuzzleOverlay();
      this._completePuzzle(puzzleName, { skipped, options });
    };

    const completeBtn = overlay.querySelector('#visicell-puzzle-complete');
    if (completeBtn) {
      completeBtn.addEventListener('click', () => resolve(false));
    }

    const skipBtn = overlay.querySelector('#visicell-puzzle-skip');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        console.log(`⏩ Skipping ${puzzleName} puzzle`);
        resolve(true);
      });
    }
  }

  _removePuzzleOverlay() {
    if (this.state.puzzleOverlay && this.state.puzzleOverlay.parentNode) {
      this.state.puzzleOverlay.remove();
    }
    this.state.puzzleOverlay = null;
  }

  _completePuzzle(puzzleName, context = {}) {
    const normalized = String(puzzleName).toLowerCase();
    if (!normalized) {
      return;
    }

    if (this.state.activePuzzle === normalized) {
      this.state.activePuzzle = null;
    }

    puzzleEventBus.emitRiddleSolved(normalized, {
      scene: 'visicell',
      skipped: Boolean(context.skipped),
      options: context.options
    });
  }

  _ensurePuzzleChainListeners() {
    if (this._chainReady) {
      return;
    }

    this._chainReady = true;

    const wordleUnsub = puzzleEventBus.onRiddleSolved('wordle', ({ context }) => {
      sceneManager.transitionTo('sokoban', {
        trigger: 'wordle',
        riddleContext: context
      });
    });

    this.subscriptions.push(wordleUnsub);
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
      console.warn('⚠️ Unable to stop background music before VisiCell', error);
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
        console.warn('⚠️ Unable to silence legacy audio before VisiCell', error);
      }
    }
  }
}

export default VisiCellScene;


