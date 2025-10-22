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
import { assetPool } from '../systems/AssetPool.js';
import { audioSystem } from '../systems/AudioSystem.js';

const VISCELL_AUDIO_KEYS = {
  reboot: 'audio_visicell_reboot_theme',
  telos: 'audio_visicell_telos_theme'
};

export class VisiCellScene {
  constructor() {
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
      audioObjectUrls: new Map(),
      audioPreparationPromise: null,
      endAudioAssetKey: VISCELL_AUDIO_KEYS.reboot,

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
      clueStepTimeouts: [],
      clueTrailLayers: [],
      initialEntryCell: null,
      questCountdownInterval: null,
      questCountdownDeadline: null,
      questCountdownKeyHandler: null,
      questCountdownPointerHandler: null,

      // Clock widget state
      clock: {
        widgetEl: null,
        modalEl: null,
        controls: null,
        ackTriggered: false,
        referenceTime: null,
        currentOffset: null
      },
      clockInterval: null,
      clockOutsideClickHandler: null
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
        overflow: visible;
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
    this._ensureClockWidget();
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

  _ensureClockWidget() {
    if (typeof document === 'undefined') {
      return;
    }

    const container = this.state.container;
    if (!container) {
      return;
    }

    const clockState = this.state.clock || (this.state.clock = {});

    if (!clockState.widgetEl) {
      const widget = document.createElement('button');
      widget.id = 'visicell-clock-widget';
      widget.type = 'button';
      widget.style.position = 'absolute';
      widget.style.top = '12px';
      widget.style.right = '16px';
      widget.style.padding = '6px 12px';
      widget.style.border = '1px solid #0f0';
      widget.style.borderRadius = '10px';
      widget.style.background = 'rgba(0, 0, 0, 0.86)';
      widget.style.color = '#0f0';
      widget.style.fontFamily = `'Courier New', monospace`;
      widget.style.fontSize = '11px';
      widget.style.letterSpacing = '0.12em';
      widget.style.cursor = 'pointer';
      widget.style.boxShadow = '0 0 16px rgba(0, 255, 160, 0.3)';
      widget.style.textTransform = 'uppercase';
      widget.addEventListener('click', (event) => {
        event.stopPropagation();
        this._toggleClockModal();
      });
      container.appendChild(widget);
      clockState.widgetEl = widget;
    }

    if (!clockState.modalEl) {
      const modal = this._createClockModal();
      container.appendChild(modal);
      clockState.modalEl = modal;
      clockState.controls = modal.__controls || null;
    }

    this._updateClockWidgetTime();

    if (!this.state.clockInterval && typeof window !== 'undefined') {
      this.state.clockInterval = window.setInterval(() => this._updateClockWidgetTime(), 15000);
    }

    if (!this.state.clockOutsideClickHandler) {
      const handler = (event) => {
        const modal = this.state.clock?.modalEl;
        const widget = this.state.clock?.widgetEl;
        if (!modal || modal.style.display !== 'flex') {
          return;
        }

        if (modal.contains(event.target) || (widget && widget.contains(event.target))) {
          return;
        }

        this._toggleClockModal(false);
      };
      document.addEventListener('click', handler);
      this.state.clockOutsideClickHandler = handler;
    }
  }

  _createClockModal() {
    const modal = document.createElement('div');
    modal.id = 'visicell-clock-modal';
    modal.style.position = 'absolute';
    modal.style.top = '48px';
    modal.style.right = '16px';
    modal.style.width = '240px';
    modal.style.padding = '14px';
    modal.style.display = 'none';
    modal.style.flexDirection = 'column';
    modal.style.gap = '10px';
    modal.style.border = '1px solid #0f0';
    modal.style.borderRadius = '14px';
    modal.style.background = 'rgba(0, 0, 0, 0.92)';
    modal.style.boxShadow = '0 0 28px rgba(0, 255, 160, 0.32)';
    modal.style.zIndex = '160';
    modal.style.color = '#0f0';
    modal.style.fontFamily = `'Courier New', monospace`;
    modal.style.textTransform = 'uppercase';

    const header = document.createElement('div');
    header.textContent = 'CLOCK SETTINGS';
    header.style.fontSize = '12px';
    header.style.fontWeight = '700';
    header.style.letterSpacing = '0.18em';

    const realtime = document.createElement('div');
    realtime.id = 'visicell-clock-now';
    realtime.style.fontSize = '11px';
    realtime.style.opacity = '0.85';
    realtime.style.letterSpacing = '0.12em';

    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.id = 'visicell-clock-date';
    dateInput.style.background = 'rgba(0, 0, 0, 0.85)';
    dateInput.style.color = '#0f0';
    dateInput.style.border = '1px solid #0f0';
    dateInput.style.borderRadius = '8px';
    dateInput.style.padding = '6px';
    dateInput.style.fontFamily = `'Courier New', monospace`;
    dateInput.style.fontSize = '11px';
    dateInput.style.letterSpacing = '0.1em';

    const timeInput = document.createElement('input');
    timeInput.type = 'time';
    timeInput.id = 'visicell-clock-time';
    timeInput.style.background = 'rgba(0, 0, 0, 0.85)';
    timeInput.style.color = '#0f0';
    timeInput.style.border = '1px solid #0f0';
    timeInput.style.borderRadius = '8px';
    timeInput.style.padding = '6px';
    timeInput.style.fontFamily = `'Courier New', monospace`;
    timeInput.style.fontSize = '11px';
    timeInput.style.letterSpacing = '0.1em';

    const preview = document.createElement('div');
    preview.id = 'visicell-clock-preview';
    preview.style.fontSize = '11px';
    preview.style.letterSpacing = '0.12em';
    preview.style.minHeight = '18px';
    preview.style.opacity = '0.88';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'CLOSE';
    closeBtn.type = 'button';
    closeBtn.style.alignSelf = 'flex-end';
    closeBtn.style.padding = '6px 12px';
    closeBtn.style.border = '1px solid #0f0';
    closeBtn.style.borderRadius = '8px';
    closeBtn.style.background = 'rgba(0, 0, 0, 0.8)';
    closeBtn.style.color = '#0f0';
    closeBtn.style.fontFamily = `'Courier New', monospace`;
    closeBtn.style.fontSize = '11px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      this._toggleClockModal(false);
    });

    const updatePreview = () => this._updateClockModalPreview();
    dateInput.addEventListener('change', updatePreview);
    timeInput.addEventListener('change', updatePreview);

    modal.appendChild(header);
    modal.appendChild(realtime);
    modal.appendChild(dateInput);
    modal.appendChild(timeInput);
    modal.appendChild(preview);
    modal.appendChild(closeBtn);

    modal.__controls = {
      dateInput,
      timeInput,
      preview,
      realtime
    };

    return modal;
  }

  _toggleClockModal(forceState) {
    const clockState = this.state.clock;
    if (!clockState || !clockState.modalEl) {
      return;
    }

    const shouldOpen = typeof forceState === 'boolean'
      ? forceState
      : clockState.modalEl.style.display !== 'flex';

    if (shouldOpen) {
      clockState.modalEl.style.display = 'flex';
      clockState.referenceTime = new Date();
      this._prepareClockModal();
    } else {
      clockState.modalEl.style.display = 'none';
    }
  }

  _prepareClockModal() {
    const clockState = this.state.clock;
    if (!clockState || !clockState.controls) {
      return;
    }

    const now = new Date();
    clockState.referenceTime = now;

    if (clockState.controls.dateInput) {
      clockState.controls.dateInput.value = this._formatClockDateInput(now);
    }
    if (clockState.controls.timeInput) {
      clockState.controls.timeInput.value = this._formatClockTimeInput(now);
    }

    this._updateClockModalPreview();
  }

  _formatClockDisplay(date) {
    if (!(date instanceof Date)) {
      return '';
    }

    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = months[date.getMonth()] || '???';
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${month} ${day} ${year} // ${hours}:${minutes}:${seconds}`;
  }

  _formatClockDateInput(date) {
    if (!(date instanceof Date)) {
      return '';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  _formatClockTimeInput(date) {
    if (!(date instanceof Date)) {
      return '';
    }
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  _updateClockWidgetTime() {
    if (typeof document === 'undefined') {
      return;
    }

    const clockState = this.state.clock;
    if (!clockState || !clockState.widgetEl) {
      return;
    }

    const now = new Date();
    const formatted = this._formatClockDisplay(now);
    clockState.widgetEl.textContent = formatted;

    if (clockState.controls && clockState.controls.realtime) {
      clockState.controls.realtime.textContent = `NOW: ${formatted}`;
    }

    if (clockState.modalEl && clockState.modalEl.style.display === 'flex') {
      clockState.currentOffset = 0;
      this._updateClockModalPreview();
    }
  }

  _updateClockModalPreview() {
    const clockState = this.state.clock;
    if (!clockState || !clockState.controls) {
      return;
    }

    const { dateInput, timeInput, preview } = clockState.controls;
    if (!dateInput || !timeInput || !preview || !dateInput.value || !timeInput.value) {
      return;
    }

    const [year, month, day] = dateInput.value.split('-').map(part => parseInt(part, 10));
    const [hours, minutes] = timeInput.value.split(':').map(part => parseInt(part, 10));

    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day) || Number.isNaN(hours) || Number.isNaN(minutes)) {
      return;
    }

    const selected = new Date(year, month - 1, day, hours, minutes);
    const now = new Date();
    const diffMs = now.getTime() - selected.getTime();
    const diffMinutes = Math.round(diffMs / 60000);

    clockState.currentOffset = diffMinutes;
    preview.textContent = `TARGET: ${this._formatClockDisplay(selected)} // OFFSET ${diffMinutes >= 0 ? '-' : '+'}${Math.abs(diffMinutes)} MIN`;

    const isPast = selected.getTime() < now.getTime();
    this._handleClockEasterEgg(diffMinutes, isPast);
  }

  _handleClockEasterEgg(offsetMinutes, isPast) {
    const clue = this.state.clueTrail;
    if (!clue || clue.clockAcknowledged || !clue.clueCell) {
      return;
    }

    if (clue.riddleStage === 'await-clock' && isPast && Math.abs(offsetMinutes) === 35) {
      clue.clockAcknowledged = true;
      clue.riddleStage = 'complete';
      this._updateClueCellText('TOUCHÉ', { emphasize: true });
      this._updatePromptCell('WHAT WERE YOU TRYING TO DO AGAIN?');
      this._showClueInstruction('TOUCHÉ. WHAT WERE YOU TRYING TO DO AGAIN?');
      this._resetClueEntry();
    }
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
   * Cancel R infection and matrix effects
   */
  _cancelRSequence() {
    console.log('🛑 Cancelling R sequence');
    this.state.rInfectionActive = false;
    
    // Clear R cells back to normal
    this.state.rInfectedCells.forEach(cellAddr => {
      const cellData = this.state.cells.get(cellAddr);
      if (cellData) {
        this._setCellValue(cellAddr, '', { suppressClueCheck: true, resetStyle: true });
      }
    });
    this.state.rInfectedCells.clear();
    this._render();
    
    // Remove matrix fall if present
    const matrixContainer = document.getElementById('visicell-matrix-fall');
    if (matrixContainer) {
      matrixContainer.remove();
    }
    
    // Remove ASCII overlay if present
    const asciiOverlay = document.getElementById('visicell-ascii-overlay');
    if (asciiOverlay) {
      asciiOverlay.remove();
    }
  }

  /**
   * Start R infection sequence
   */
  _startRInfection() {
    if (this.state.rInfectionActive) return;
    
    console.log('🦠 R infection started');
    this.state.rInfectionActive = true;
    
    // R pattern cells (forming letter R)
    const rPattern = [
      'B2', 'C2', 'D2',    // Top horizontal
      'B3', 'D3',          // Sides
      'B4', 'C4',          // Middle  
      'B5', 'D5',          // Sides
      'B6', 'E6'           // Bottom with leg
    ];
    
    // Progressive filling with R
    rPattern.forEach((cellAddr, index) => {
      setTimeout(() => {
        const cellData = this._setCellValue(cellAddr, 'R', { suppressClueCheck: true, resetStyle: true });
        cellData.style = cellData.style || {};
        Object.assign(cellData.style, {
          background: '#ffffff',
          color: '#000',
          textAlign: 'center',
          fontWeight: '700',
          fontSize: '16px'
        });
        this.state.rInfectedCells.add(cellAddr);
        this._render();
      }, index * 100);
    });
    
    // After all Rs are placed, turn them green
    setTimeout(() => {
      this.state.rInfectedCells.forEach(cellAddr => {
        const cellData = this.state.cells.get(cellAddr);
        if (cellData && cellData.style) {
          cellData.style.background = '#00ff00';
          cellData.style.color = '#000';
        }
      });
      this._render();
      
      // Start matrix fall after green transition
      setTimeout(() => {
        this._startMatrixFall();
      }, 1000);
    }, rPattern.length * 100 + 500);
  }

  /**
   * Start Matrix fall effect
   */
  _startMatrixFall() {
    console.log('💻 Matrix fall effect started');
    
    // Create matrix fall container
    let container = document.getElementById('visicell-matrix-fall');
    if (!container) {
      container = document.createElement('div');
      container.id = 'visicell-matrix-fall';
      container.style.cssText = `
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 50;
        overflow: hidden;
      `;
      document.body.appendChild(container);
    }
    
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:\'",.<>?';
    const streamCount = 30;
    const streams = [];
    
    // Create character streams
    for (let i = 0; i < streamCount; i++) {
      const stream = document.createElement('div');
      stream.style.cssText = `
        position: absolute;
        left: ${Math.random() * 100}%;
        top: -100%;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        color: #00ff00;
        white-space: pre;
        animation: matrix-fall ${2 + Math.random() * 2}s linear infinite;
        animation-delay: ${Math.random() * 2}s;
      `;
      
      let text = '';
      for (let j = 0; j < 20; j++) {
        text += characters[Math.floor(Math.random() * characters.length)] + '\n';
      }
      stream.textContent = text;
      
      container.appendChild(stream);
      streams.push(stream);
    }
    
    // Add keyframe animation if not already present
    if (!document.getElementById('matrix-fall-keyframes')) {
      const style = document.createElement('style');
      style.id = 'matrix-fall-keyframes';
      style.textContent = `
        @keyframes matrix-fall {
          0% {
            top: -100%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Show ASCII CELLI text overlay
    setTimeout(() => {
      this._showAsciiOverlay();
    }, 2000);
    
    // Cleanup after 8 seconds
    setTimeout(() => {
      if (container) {
        container.style.transition = 'opacity 1s';
        container.style.opacity = '0';
        setTimeout(() => container.remove(), 1000);
      }
    }, 8000);
  }

  /**
   * Show ASCII art overlay
   */
  _showAsciiOverlay() {
    let overlay = document.getElementById('visicell-ascii-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'visicell-ascii-overlay';
      overlay.style.cssText = `
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        font-family: monospace;
        font-size: 10px;
        line-height: 1;
        color: #00ff00;
        text-shadow: 0 0 10px #00ff00;
        white-space: pre;
        z-index: 200;
        pointer-events: none;
        opacity: 0;
        transition: opacity 1s;
      `;
      
      overlay.textContent = `  ██████  ███████ ██      ██      ██
 ██      ██      ██      ██      ██
 ██      █████   ██      ██      ██
 ██      ██      ██      ██      ██
  ██████ ███████ ███████ ███████ ██`;
      
      document.body.appendChild(overlay);
    }
    
    // Fade in
    setTimeout(() => {
      overlay.style.opacity = '1';
    }, 100);
    
    // Fade out after hold
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 1000);
    }, 4000);
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

  _safeOffset(addr, rowDelta, colDelta) {
    if (!addr) {
      return null;
    }

    const baseCol = addr.charCodeAt(0) - 65;
    const baseRow = parseInt(addr.slice(1), 10);

    if (Number.isNaN(baseCol) || Number.isNaN(baseRow)) {
      return null;
    }

    const newCol = baseCol + (colDelta || 0);
    const newRow = baseRow + (rowDelta || 0);

    if (newCol < 0 || newCol >= this.state.gridCols || newRow < 1 || newRow > this.state.gridRows) {
      return null;
    }

    return String.fromCharCode(65 + newCol) + newRow;
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
      promptCell: null,
      clueCell: null,
      baseInput: '',
      currentInput: '',
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
      initializing: false,
      riddleStage: 'await-leave',
      onionRiddleScheduled: false,
      clockAcknowledged: false,
      glitchActive: false
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
    if (!normalized) {
      return;
    }

    if (this._processClueCommand(normalized)) {
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
    overlay.style.left = '50%';
    overlay.style.top = 'calc(100% + 18px)';
    overlay.style.transform = 'translateX(-50%)';
    overlay.style.width = '360px';
    overlay.style.maxWidth = '90%';
    overlay.style.padding = '18px';
    overlay.style.border = '2px solid rgba(0, 255, 160, 0.85)';
    overlay.style.borderRadius = '16px';
    overlay.style.background = 'rgba(0, 0, 0, 0.92)';
    overlay.style.boxShadow = '0 0 26px rgba(0, 255, 160, 0.28)';
    overlay.style.color = '#0f0';
    overlay.style.display = 'none';
    overlay.style.flexDirection = 'column';
    overlay.style.gap = '10px';
    overlay.style.fontFamily = `'Courier New', monospace`;
    overlay.style.textTransform = 'uppercase';
    overlay.style.letterSpacing = '0.12em';
    overlay.style.zIndex = '220';

    const title = document.createElement('div');
    title.textContent = 'Quest // VisiCell Simulator';
    title.style.fontSize = '12px';
    title.style.opacity = '0.78';

    const body = document.createElement('div');
    body.id = 'visicell-quest-body';
    body.style.fontSize = '13px';
    body.style.lineHeight = '1.55';
    body.style.letterSpacing = '0.08em';
    body.textContent = '';

    overlay.appendChild(title);
    overlay.appendChild(body);
    container.appendChild(overlay);

    this.state.questOverlay = overlay;
    return overlay;
  }

  _updateQuestMessage(message) {
    const overlay = this._ensureQuestOverlay();
    if (!overlay) {
      return;
    }

    const body = overlay.querySelector('#visicell-quest-body');
    if (body) {
      body.textContent = (message || '').toString().toUpperCase();
    }
  }

  _cancelQuestCountdown() {
    if (this.state.questCountdownInterval) {
      window.clearInterval(this.state.questCountdownInterval);
      this.state.questCountdownInterval = null;
    }

    if (this.state.questCountdownKeyHandler) {
      document.removeEventListener('keydown', this.state.questCountdownKeyHandler, true);
      this.state.questCountdownKeyHandler = null;
    }

    if (this.state.questCountdownPointerHandler) {
      document.removeEventListener('pointerdown', this.state.questCountdownPointerHandler, true);
      this.state.questCountdownPointerHandler = null;
    }

    this.state.questCountdownDeadline = null;
  }

  _startQuestCountdown(seconds = 10) {
    if (seconds <= 0) {
      this._startDeathSequence('enter');
      return;
    }

    this._cancelQuestCountdown();

    const overlay = this._ensureQuestOverlay();
    if (!overlay) {
      return;
    }

    overlay.style.display = 'flex';

    const deadline = Date.now() + seconds * 1000;
    this.state.questCountdownDeadline = deadline;

    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      this._updateQuestMessage(`Fudge the numbers - don't let big boss find out! ${remaining}s`);

      if (remaining <= 0) {
        this._cancelQuestCountdown();
        this._startDeathSequence('enter');
      }
    };

    updateCountdown();
    this.state.questCountdownInterval = window.setInterval(updateCountdown, 1000);

    const handleInput = (event) => {
      if (this.state.deathSequenceActive) {
        return;
      }
      if (event) {
        event.stopPropagation();
      }
      this._cancelQuestCountdown();
      this._startDeathSequence('enter');
    };

    const handlePointer = (event) => {
      if (this.state.deathSequenceActive) {
        return;
      }
      if (event) {
        event.stopPropagation();
      }
      this._cancelQuestCountdown();
      this._startDeathSequence('enter');
    };

    this.state.questCountdownKeyHandler = handleInput;
    this.state.questCountdownPointerHandler = handlePointer;

    document.addEventListener('keydown', handleInput, true);
    document.addEventListener('pointerdown', handlePointer, true);
  }

  _updateQuestOverlayForEntry(entryCell) {
    const overlay = this._ensureQuestOverlay();
    if (!overlay) {
      return;
    }

    overlay.style.display = 'flex';
    this._cancelQuestCountdown();
    this._updateQuestMessage(`FIGURE OUT THE INCOMPLETE WORD IN CELL ${entryCell} - THEN PRESS THAT KEY. THE ENTER KEY. THE WORD IS ENTER.`);
  }

  _layoutFinishWordMessage(entryCell) {
    const clue = this.state.clueTrail;
    if (!clue || !entryCell) {
      return;
    }

    const layout = [
      { row: 0, col: -2, text: 'FINISH' },
      { row: 0, col: -1, text: 'THE' },
      { row: 0, col: 1, text: 'WORD' },
      { row: 0, col: 2, text: 'IN' },
      { row: 1, col: -1, text: 'CELL' },
      { row: 1, col: 0, text: entryCell },
      { row: 1, col: 1, text: 'ENTER', highlight: true }
    ];

    const recorded = [];

    layout.forEach(({ row, col, text, highlight }) => {
      const target = this._safeOffset(entryCell, row, col);
      if (!target || target === entryCell) {
        return;
      }

      const previous = this.state.cells.get(target);
      const previousStyle = previous && previous.style ? { ...previous.style } : null;
      const previousValue = previous && previous.value ? previous.value : '';
      const previousFormula = previous && previous.formula ? previous.formula : '';

      const cellData = this._setCellValue(target, text, { suppressClueCheck: true, resetStyle: true });
      cellData.style = cellData.style || {};
      Object.assign(cellData.style, {
        background: 'rgba(0, 0, 0, 0.88)',
        color: '#0f0',
        textAlign: 'center',
        fontWeight: '700',
        letterSpacing: '0.14em',
        padding: '6px'
      });

      if (highlight) {
        cellData.style.boxShadow = '0 0 16px rgba(0, 255, 160, 0.55)';
      }

      recorded.push({
        addr: target,
        value: previousValue,
        formula: previousFormula,
        style: previousStyle
      });

      clue.highlightedCells.add(target);
    });

    if (recorded.length > 0) {
      clue.messageCells.push(...recorded);
      this._render();
      this._applyClueCellHighlight();
    }
  }

  _clearTrailLayers() {
    if (!Array.isArray(this.state.clueTrailLayers)) {
      this.state.clueTrailLayers = [];
      return;
    }

    this.state.clueTrailLayers.forEach(layer => {
      if (layer && typeof layer.remove === 'function') {
        layer.remove();
      }
    });

    this.state.clueTrailLayers.length = 0;
  }

  _spawnTrailLayer(config = {}, index = 0) {
    const container = this.state.container;
    if (!container) {
      return;
    }

    const layer = document.createElement('div');
    layer.className = 'visicell-trail-layer';
    layer.style.position = 'absolute';
    layer.style.left = '50%';
    layer.style.top = '50%';
    layer.style.transform = `translate(-50%, -50%) scale(${Math.max(0.78, 1 - index * 0.08)}) translateY(${index * -24}px)`;
    layer.style.padding = '16px';
    layer.style.width = '70%';
    layer.style.maxWidth = '780px';
    layer.style.background = 'rgba(0, 10, 0, 0.86)';
    layer.style.border = '1px solid rgba(0, 255, 160, 0.32)';
    layer.style.boxShadow = '0 0 32px rgba(0, 255, 160, 0.22)';
    layer.style.borderRadius = '18px';
    layer.style.pointerEvents = 'none';
    layer.style.opacity = '0';
    layer.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
    layer.style.zIndex = String(180 + index);

    const title = document.createElement('div');
    title.textContent = (config.title || `VISICELL STACK ${String(index + 1).padStart(2, '0')}`).toUpperCase();
    title.style.fontSize = '12px';
    title.style.letterSpacing = '0.18em';
    title.style.opacity = '0.82';
    title.style.textTransform = 'uppercase';
    layer.appendChild(title);

    if (config.hint) {
      const hint = document.createElement('div');
      hint.textContent = config.hint.toUpperCase();
      hint.style.fontSize = '11px';
      hint.style.marginTop = '6px';
      hint.style.opacity = '0.82';
      hint.style.letterSpacing = '0.12em';
      layer.appendChild(hint);
    }

    const columns = config.columns || 4;
    const rows = config.rows || 4;
    const grid = document.createElement('div');
    grid.style.marginTop = '12px';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
    grid.style.gap = '2px';

    const entries = Array.isArray(config.entries) ? config.entries : [];

    for (let row = 1; row <= rows; row++) {
      for (let col = 1; col <= columns; col++) {
        const cell = document.createElement('div');
        cell.style.minHeight = '32px';
        cell.style.display = 'flex';
        cell.style.alignItems = 'center';
        cell.style.justifyContent = 'center';
        cell.style.border = '1px solid rgba(0, 255, 160, 0.28)';
        cell.style.background = 'rgba(0, 20, 0, 0.65)';
        cell.style.fontSize = '13px';
        cell.style.letterSpacing = '0.14em';
        cell.style.textTransform = 'uppercase';
        cell.style.padding = '4px 6px';

        const addr = `${String.fromCharCode(64 + col)}${row}`;
        const entry = entries.find(item => item && item.addr === addr);

        if (entry) {
          cell.textContent = (entry.text || '').toString().toUpperCase();
          if (entry.highlight) {
            cell.style.background = 'rgba(0, 255, 160, 0.18)';
            cell.style.boxShadow = '0 0 18px rgba(0, 255, 160, 0.45)';
            cell.style.fontWeight = '700';
          }
        } else {
          cell.innerHTML = '&nbsp;';
        }

        grid.appendChild(cell);
      }
    }

    layer.appendChild(grid);

    if (config.reference) {
      const reference = document.createElement('div');
      reference.textContent = config.reference.toUpperCase();
      reference.style.marginTop = '12px';
      reference.style.fontSize = '11px';
      reference.style.opacity = '0.78';
      reference.style.letterSpacing = '0.12em';
      layer.appendChild(reference);
    }

    container.appendChild(layer);

    if (!Array.isArray(this.state.clueTrailLayers)) {
      this.state.clueTrailLayers = [];
    }

    this.state.clueTrailLayers.push(layer);

    window.requestAnimationFrame(() => {
      layer.style.opacity = '1';
      layer.style.transform = `translate(-50%, -50%) scale(${Math.max(0.8, 1 - index * 0.06)}) translateY(${index * -14}px)`;
    });
  }

  _handleNextDoorOpens() {
    const clue = this.state.clueTrail;
    if (!clue || !clue.entryCell) {
      return;
    }

    const glowCell = this._safeOffset(clue.entryCell, -1, 2)
      || this._safeOffset(clue.entryCell, 0, 2)
      || this._safeOffset(clue.entryCell, 0, -2)
      || clue.entryCell;

    const messageCell = this._safeOffset(glowCell, 1, 0)
      || this._safeOffset(clue.entryCell, 1, 1)
      || this._safeOffset(clue.entryCell, 2, 0);

    if (glowCell) {
      const existingValue = this._getCellValue(glowCell);
      const cellData = this._setCellValue(glowCell, existingValue || '', { suppressClueCheck: true, resetStyle: true });
      cellData.style = cellData.style || {};
      Object.assign(cellData.style, {
        background: 'rgba(0, 24, 0, 0.9)',
        color: '#0f0',
        textAlign: 'center',
        boxShadow: '0 0 22px rgba(0, 255, 160, 0.6)',
        borderColor: '#0f0',
        fontWeight: '700'
      });
      clue.highlightedCells.add(glowCell);
    }

    if (messageCell) {
      const cellData = this._setCellValue(messageCell, "Now. My initial request. And if you play nice, I'll let you leave.", {
        suppressClueCheck: true,
        resetStyle: true
      });
      cellData.style = cellData.style || {};
      Object.assign(cellData.style, {
        background: 'rgba(0, 0, 0, 0.9)',
        color: '#0f0',
        textAlign: 'left',
        padding: '12px',
        letterSpacing: '0.08em',
        lineHeight: '1.6',
        fontWeight: '600'
      });
      clue.highlightedCells.add(messageCell);
    }

    this._render();
    this._applyClueCellHighlight();
    
    // Re-enable clue input and trigger onion riddle after a delay
    setTimeout(() => {
      this._beginOnionRiddle();
    }, 1500);
  }

  _startQuestSequence() {
    const entryCell = this.state.initialEntryCell || (this.state.clueTrail && this.state.clueTrail.entryCell);
    if (entryCell) {
      this._updateQuestOverlayForEntry(entryCell);
    } else {
      this._ensureQuestOverlay();
    }

    this._startClueTrailSequence('enter');
    this._startQuestCountdown(10);
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
    this._cancelQuestCountdown();

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
      ? 'QUEST FAILED. YOU DIED OF DYSENTERY.'
      : 'TRAIL COMPLETE. YOU DIED OF DYSENTERY.';
    this._showClueInstruction(endingMessage);

    if (clue) {
      clue.stage = 'end';
      clue.active = false;
      if (!clue.onionRiddleScheduled) {
        clue.onionRiddleScheduled = true;
        const onionTimeout = window.setTimeout(() => this._beginOnionRiddle(), 900);
        this.state.deathTimeouts.push(onionTimeout);
      }
    }
  }

  _initializeClueTrail() {
    const clue = this._ensureClueTrailState();
    if (!clue) return;

    const entryCell = this._pickRandomEntryCell();
    this.state.initialEntryCell = entryCell;

    let promptCell = this._safeOffset(entryCell, 1, 0) || this._safeOffset(entryCell, -1, 0);
    let clueCell = this._safeOffset(entryCell, 0, 1) || this._safeOffset(entryCell, 0, -1);

    if (promptCell === entryCell) {
      promptCell = this._safeOffset(entryCell, -1, 0) || this._safeOffset(entryCell, 2, 0);
    }
    if (clueCell === entryCell) {
      clueCell = this._safeOffset(entryCell, 0, -1) || this._safeOffset(entryCell, 0, 2);
    }

    clue.entryCell = entryCell;
    clue.promptCell = promptCell;
    clue.clueCell = clueCell;
    clue.baseInput = 'ENTE';
    clue.currentInput = 'ENTE';
    clue.active = true;
    clue.stage = 'await-command';
    clue.riddleStage = 'await-leave';
    clue.onionRiddleScheduled = false;
    clue.clockAcknowledged = false;
    clue.highlightedCells = new Set([entryCell]);
    if (promptCell) {
      clue.highlightedCells.add(promptCell);
    }
    if (clueCell) {
      clue.highlightedCells.add(clueCell);
    }
    clue.steps = [];
    clue.completedMode = null;
    clue.pendingDeathMode = null;
    clue.deathSequenceScheduled = false;
    clue.lastTriggeredValue = null;
    clue.lastShownInvalidValue = null;
    clue.glitchActive = false;
    clue.clockAcknowledged = false;

    clue.initializing = true;
    this._setCellValue(entryCell, 'ENTE', { suppressClueCheck: true, resetStyle: true });
    this._updateClueDisplay();
    clue.initializing = false;

    if (promptCell) {
      const promptData = this._setCellValue(promptCell, 'REQUEST: TYPE LEAVE', { suppressClueCheck: true, resetStyle: true });
      promptData.style = promptData.style || {};
      Object.assign(promptData.style, {
        background: 'rgba(0, 0, 0, 0.85)',
        color: '#0f0',
        textAlign: 'center',
        fontWeight: '700',
        padding: '8px',
        whiteSpace: 'pre-wrap',
        letterSpacing: '0.12em'
      });
    }

    if (clueCell) {
      const clueData = this._setCellValue(clueCell, 'CLUE CACHE SEALED', { suppressClueCheck: true, resetStyle: true });
      clueData.style = clueData.style || {};
      Object.assign(clueData.style, {
        background: 'rgba(0, 16, 0, 0.85)',
        color: '#0f0',
        textAlign: 'left',
        padding: '8px',
        minHeight: '72px',
        whiteSpace: 'pre-wrap',
        letterSpacing: '0.12em'
      });
    }

    this._render();
    this._applyClueCellHighlight();

    this._layoutFinishWordMessage(entryCell);
    this._showClueInstruction(`FIGURE OUT THE INCOMPLETE WORD IN CELL ${entryCell} - THEN PRESS THAT KEY. THE ENTER KEY. THE WORD IS ENTER.`);
    this._selectCell(entryCell);

    this._updateQuestOverlayForEntry(entryCell);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('visicell:entry-cell-selected', {
        detail: { entryCell }
      }));
    }
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

    const sanitized = (message || '').toString().toUpperCase();
    clue.instructionEl.textContent = sanitized;
  }

  _updatePromptCell(message) {
    const clue = this.state.clueTrail;
    if (!clue || !clue.promptCell) {
      return;
    }

    const text = options && options.preserveCase
      ? (message || '').toString()
      : (message || '').toString().toUpperCase();
    const promptData = this._setCellValue(clue.promptCell, text, { suppressClueCheck: true, resetStyle: true });
    promptData.style = promptData.style || {};
    Object.assign(promptData.style, {
      background: 'rgba(0, 0, 0, 0.85)',
      color: '#0f0',
      textAlign: 'center',
      fontWeight: '700',
      padding: '10px',
      whiteSpace: 'pre-wrap',
      letterSpacing: '0.14em',
      borderRadius: '10px',
      transition: 'all 0.25s ease'
    });

    this._render();
    this._applyClueCellHighlight();
  }

  _updateClueCellText(message, options = {}) {
    const clue = this.state.clueTrail;
    if (!clue || !clue.clueCell) {
      return;
    }

    const text = options && options.preserveCase
      ? (message || '').toString()
      : (message || '').toString().toUpperCase();
    const cellData = this._setCellValue(clue.clueCell, text, { suppressClueCheck: true, resetStyle: true });
    cellData.style = cellData.style || {};

    const baseStyle = {
      background: 'rgba(0, 0, 0, 0.9)',
      color: '#0f0',
      textAlign: options.emphasize ? 'center' : 'left',
      padding: options.enlarge ? '16px' : '10px',
      whiteSpace: 'pre-wrap',
      lineHeight: options.enlarge ? '1.65' : '1.5',
      letterSpacing: '0.12em',
      fontWeight: options.emphasize ? '800' : '700',
      fontSize: options.emphasize ? '18px' : '14px',
      borderRadius: '14px',
      minWidth: options.enlarge ? '280px' : '200px',
      minHeight: options.enlarge ? '140px' : '96px',
      transition: 'all 0.35s ease'
    };

    Object.assign(cellData.style, baseStyle);

    this._render();
    this._applyClueCellHighlight();
  }

  _resetClueEntry() {
    const clue = this.state.clueTrail;
    if (!clue || !clue.entryCell) {
      return;
    }

    clue.initializing = true;
    clue.currentInput = '';
    this._setCellValue(clue.entryCell, '', { suppressClueCheck: true, resetStyle: false });
    clue.initializing = false;
    this._updateClueDisplay();
  }

  _processClueCommand(command) {
    const clue = this.state.clueTrail;
    if (!clue) {
      return false;
    }

    const normalized = command.trim();
    const entryCell = clue.entryCell || this.state.initialEntryCell || 'D5';
    if (!normalized) {
      return false;
    }

    if (normalized === 'ENTER' && clue.lastTriggeredValue !== 'ENTER') {
      // Cancel R sequence if it was running
      this._cancelRSequence();
      
      clue.currentInput = normalized;
      clue.lastTriggeredValue = 'ENTER';
      this._showClueInstruction('CORRECT! INITIALIZING R SEQUENCE...');
      
      // Trigger R sequence after brief delay
      setTimeout(() => {
        this._startRInfection();
      }, 1000);
      
      this._startQuestSequence();
      return true;
    }

    if (normalized === 'LEAVE') {
      if (clue.riddleStage === 'await-leave' && clue.lastTriggeredValue !== 'LEAVE') {
        // Cancel R sequence if it was running
        this._cancelRSequence();
        
        clue.currentInput = normalized;
        clue.lastTriggeredValue = 'LEAVE';
        this._updatePromptCell('REQUEST ACKNOWLEDGED. HOLD FAST.');
        this._showClueInstruction('CLUE TRAIL INITIATED. WATCH THE GRID.');
        clue.riddleStage = 'await-search';
        this._startClueTrailSequence('leave');
        return true;
      }
      return false;
    }

    if (clue.riddleStage === 'await-search' && normalized === 'SEARCH') {
      clue.lastTriggeredValue = 'SEARCH';
      this._updateClueCellText(`You found an onion. It's already peeled.\n\nBut wait, there's something its opposite and its partner. Take the last word of the first line, and remove the term for Richard Unkind. You'll know soulmate.`, { enlarge: true });
      this._updatePromptCell('REQUEST: IDENTIFY KEY.');
      this._showClueInstruction('THE GRID FOUND AN ONION. WHO HOLDS THE KEY?');
      clue.riddleStage = 'await-key';
      this._resetClueEntry();
      clue.lastShownInvalidValue = null;
      this._spawnTrailLayer({
        title: 'VisiCell Array // Search',
        hint: 'Trace NEXT → DOOR → OPENS.',
        entries: [
          { addr: 'A1', text: 'NEXT', highlight: true },
          { addr: 'B1', text: 'DOOR', highlight: true },
          { addr: 'C1', text: 'OPENS', highlight: true },
          { addr: 'B2', text: entryCell, highlight: true }
        ],
        reference: `Route responses through ${entryCell}. Type KEY to unlock the cache.`
      }, Array.isArray(this.state.clueTrailLayers) ? this.state.clueTrailLayers.length : 0);
      return true;
    }

    if (clue.riddleStage === 'await-key' && normalized === 'KEY') {
      clue.lastTriggeredValue = 'KEY';
      this._playVisiCellVideo('./key.MP4', 'KEY');
      this._updateClueCellText(`Who'd I leave for, Key? Was it him or his creation?`, { enlarge: true });
      this._updatePromptCell('REQUEST: SNAKE.');
      this._showClueInstruction('HEAR THE HISS. NAME THE SNAKE.');
      clue.riddleStage = 'await-snake';
      this._resetClueEntry();
      clue.lastShownInvalidValue = null;
      this._spawnTrailLayer({
        title: 'VisiCell Array // Key',
        hint: 'ENTER + KEY STILL ALIGN.',
        entries: [
          { addr: 'A1', text: 'KEY', highlight: true },
          { addr: 'B1', text: 'ENTER', highlight: true },
          { addr: 'C1', text: 'CREATION' },
          { addr: 'B2', text: entryCell, highlight: true }
        ],
        reference: `Keep responses inside ${entryCell}. Type SNAKE when you hear the hiss.`
      }, Array.isArray(this.state.clueTrailLayers) ? this.state.clueTrailLayers.length : 0);
      return true;
    }

    if (clue.riddleStage === 'await-snake' && normalized === 'SNAKE') {
      clue.lastTriggeredValue = 'SNAKE';
      this._updateClueCellText('Sneaky. Do you know who was the Sneak King?', { enlarge: true });
      this._updatePromptCell('REQUEST: BURGER KING.');
      this._showClueInstruction('NAME THE KING OF SNEAK.');
      clue.riddleStage = 'await-burger';
      this._resetClueEntry();
      clue.lastShownInvalidValue = null;
      this._spawnTrailLayer({
        title: 'VisiCell Array // Serpent',
        hint: 'Sneak King slips between ENTER and KEY.',
        entries: [
          { addr: 'A1', text: 'SNAKE', highlight: true },
          { addr: 'B1', text: 'SNEAK', highlight: true },
          { addr: 'C1', text: 'KING', highlight: true },
          { addr: 'B2', text: entryCell, highlight: true }
        ],
        reference: `Stay on ${entryCell}. Type BURGER KING to crown the hiss.`
      }, Array.isArray(this.state.clueTrailLayers) ? this.state.clueTrailLayers.length : 0);
      return true;
    }

    if (clue.riddleStage === 'await-burger' && normalized === 'BURGER KING') {
      clue.lastTriggeredValue = 'BURGER KING';
      this._updateClueCellText('Fine. Have it your way. Enjoy your cardboard kingdom Ozymandias. I used your password.', { enlarge: true });
      this._updatePromptCell('REQUEST: PASSWORD?');
      this._showClueInstruction('THE KING HAS FALLEN. NAME HIS PASSWORD.');
      clue.riddleStage = 'await-ramses';
      this._resetClueEntry();
      clue.lastShownInvalidValue = null;
      this._spawnTrailLayer({
        title: 'VisiCell Array // Kingdom',
        hint: 'Cardboard crowns crumble.',
        entries: [
          { addr: 'A1', text: 'BURGER', highlight: true },
          { addr: 'B1', text: 'KING', highlight: true },
          { addr: 'C1', text: 'OZYMANDIAS' },
          { addr: 'B2', text: entryCell, highlight: true }
        ],
        reference: `Hold ${entryCell}. Type RAMSES II to reveal the password.`
      }, Array.isArray(this.state.clueTrailLayers) ? this.state.clueTrailLayers.length : 0);
      return true;
    }

    if (clue.riddleStage === 'await-ramses' && normalized === 'RAMSES II') {
      clue.lastTriggeredValue = 'RAMSES II';
      if (!clue.glitchActive) {
        clue.glitchActive = true;
        this._showRamsesGlitch();
      }
      this._updatePromptCell('ADJUST CLOCK 35 MINUTES BACK.');
      this._showClueInstruction('HE CHANGED IT THIRTY-FIVE MINUTES AGO.');
      clue.riddleStage = 'await-clock';
      clue.clockAcknowledged = false;
      this._resetClueEntry();
      clue.lastShownInvalidValue = null;
      this._spawnTrailLayer({
        title: 'VisiCell Array // Password',
        hint: 'RAMSES II rewinds the clock.',
        entries: [
          { addr: 'A1', text: 'RAMSES', highlight: true },
          { addr: 'B1', text: 'II', highlight: true },
          { addr: 'C1', text: '35 MIN' },
          { addr: 'B2', text: entryCell, highlight: true }
        ],
        reference: `Adjust the time back thirty-five minutes. ${entryCell} stays armed.`
      }, Array.isArray(this.state.clueTrailLayers) ? this.state.clueTrailLayers.length : 0);
      return true;
    }

    if (clue.riddleStage === 'await-clock') {
      if (normalized === 'RAMSES II') {
        return true;
      }
    }

    return false;
  }

  _playVisiCellVideo(src, title = 'KEY') {
    if (typeof document === 'undefined') {
      return;
    }

    const resolveMediaPath = (path) => {
      if (!path) return '';
      const trimmed = path.trim();
      if (!trimmed) return '';
      if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
        return trimmed;
      }
      if (trimmed.startsWith('./')) {
        return trimmed;
      }
      return `./${trimmed}`;
    };

    const resolvedSrc = resolveMediaPath(src);
    const existing = document.querySelector('.visicell-video-overlay');
    if (existing) {
      existing.remove();
    }

    const overlay = document.createElement('div');
    overlay.className = 'visicell-video-overlay';
    overlay.style.position = 'fixed';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.background = 'rgba(0, 0, 0, 0.82)';
    overlay.style.zIndex = '950';

    const windowEl = document.createElement('div');
    windowEl.style.background = 'rgba(0, 0, 0, 0.94)';
    windowEl.style.border = '2px solid #0f0';
    windowEl.style.borderRadius = '18px';
    windowEl.style.width = '460px';
    windowEl.style.maxWidth = '82vw';
    windowEl.style.boxShadow = '0 0 38px rgba(0, 255, 160, 0.45)';
    windowEl.style.display = 'flex';
    windowEl.style.flexDirection = 'column';
    windowEl.style.overflow = 'hidden';

    const titleBar = document.createElement('div');
    titleBar.style.display = 'flex';
    titleBar.style.justifyContent = 'space-between';
    titleBar.style.alignItems = 'center';
    titleBar.style.background = 'rgba(0, 0, 0, 0.9)';
    titleBar.style.padding = '10px 16px';
    titleBar.style.letterSpacing = '0.16em';
    titleBar.style.fontFamily = `'Courier New', monospace`;
    titleBar.style.color = '#0f0';
    titleBar.style.fontSize = '12px';
    titleBar.style.textTransform = 'uppercase';

    const titleText = document.createElement('span');
    titleText.textContent = (title || 'KEY').toString().toUpperCase();

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.background = 'transparent';
    closeBtn.style.border = 'none';
    closeBtn.style.color = '#0f0';
    closeBtn.style.fontSize = '18px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      fadeOut();
    });

    titleBar.appendChild(titleText);
    titleBar.appendChild(closeBtn);

    const video = document.createElement('video');
    video.controls = true;
    video.autoplay = true;
    video.src = resolvedSrc;
    video.style.width = '100%';
    video.style.background = '#000';

    const fallback = document.createElement('div');
    fallback.textContent = `UNABLE TO LOAD ${resolvedSrc.split('/').pop()?.toUpperCase() || 'VIDEO'}`;
    fallback.style.padding = '24px';
    fallback.style.textAlign = 'center';
    fallback.style.letterSpacing = '0.12em';
    fallback.style.display = 'none';

    const fadeOut = () => {
      overlay.style.transition = 'opacity 3s ease';
      overlay.style.opacity = '0';
      window.setTimeout(() => overlay.remove(), 3000);
    };

    video.addEventListener('ended', fadeOut, { once: true });
    video.addEventListener('error', () => {
      video.style.display = 'none';
      fallback.style.display = 'block';
      window.setTimeout(fadeOut, 600);
    }, { once: true });

    windowEl.appendChild(titleBar);
    windowEl.appendChild(video);
    windowEl.appendChild(fallback);
    overlay.appendChild(windowEl);

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        fadeOut();
      }
    });

    document.body.appendChild(overlay);
  }

  _showRamsesGlitch() {
    if (typeof document === 'undefined') {
      return;
    }

    const clue = this.state.clueTrail;
    const finalMessage = `USER.FIRSTNAME & LASTNAME, I'M NOT A REPUBLIC SERIAL VILLAIN. DO YOU SERIOUSLY THINK I'D EXPLAIN MY MASTER PASSWORD IF THERE REMAINED THE SLIGHTEST CHANCE OF YOU LOGGING IN? I CHANGED IT THIRTY-FIVE MINUTES AGO.`;

    const overlay = document.createElement('div');
    overlay.className = 'visicell-glitch-overlay';
    overlay.style.position = 'fixed';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0, 0, 0, 0.92)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '980';
    overlay.style.fontFamily = `'Courier New', monospace`;
    overlay.style.color = '#0f0';
    overlay.style.textTransform = 'uppercase';
    overlay.style.letterSpacing = '0.2em';

    const messageEl = document.createElement('div');
    messageEl.style.maxWidth = '70vw';
    messageEl.style.textAlign = 'center';
    messageEl.style.fontSize = '16px';
    messageEl.style.lineHeight = '1.6';
    messageEl.textContent = 'ACCESS DENIED';

    overlay.appendChild(messageEl);
    document.body.appendChild(overlay);

    const glitchPhrases = [
      'ACCESS DENIED',
      'REVISION 35 MIN',
      'OZYMANDIAS PROTOCOL',
      'PASSWORD ROTATION',
      'USER LOCKOUT',
      '///////',
      'GHOST KEY',
      'REDACTED'
    ];

    let iteration = 0;
    const glitchInterval = window.setInterval(() => {
      const phrase = glitchPhrases[iteration % glitchPhrases.length];
      messageEl.textContent = phrase;
      iteration++;
    }, 120);

    const settleDelay = 1600;
    window.setTimeout(() => {
      window.clearInterval(glitchInterval);
      messageEl.textContent = finalMessage;
      messageEl.style.fontSize = '14px';
      messageEl.style.lineHeight = '1.8';
    }, settleDelay);

    window.setTimeout(() => {
      overlay.style.transition = 'opacity 0.9s ease';
      overlay.style.opacity = '0';
      window.setTimeout(() => overlay.remove(), 900);
    }, settleDelay + 1100);

    if (clue) {
      window.setTimeout(() => {
        this._updateClueCellText(finalMessage, { enlarge: true });
        this._displayClueMessageAcrossCells(finalMessage, 'A14');
      }, settleDelay + 400);
    }
  }

  _beginOnionRiddle() {
    const clue = this.state.clueTrail;
    if (!clue) {
      return;
    }

    clue.active = true;
    clue.stage = 'trail';
    clue.riddleStage = 'await-search';
    clue.lastTriggeredValue = null;
    clue.lastShownInvalidValue = null;
    clue.clockAcknowledged = false;

    this._resetClueEntry();
    this._updatePromptCell('REQUEST: SEARCH.');
    this._updateClueCellText(`No, I've locked that away. What I have left could make you cry. Why don't you dice that, too. Maybe search around.`, { enlarge: true });
    this._showClueInstruction('THE CACHE IS RIDDLE-LOCKED. SEARCH IT.');
    this._selectCell(clue.entryCell);
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

    if (e.key.length === 1 && /[a-zA-Z0-9 .]/.test(e.key)) {
      e.preventDefault();
      if (clue.currentInput.length >= 24) {
        clue.currentInput = clue.currentInput.slice(0, 23);
      }
      const char = e.key === ' ' ? ' ' : e.key.toUpperCase();
      clue.currentInput += char;
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

    const entryCell = clue.entryCell || this.state.initialEntryCell || 'D5';

    const steps = mode === 'enter'
      ? [
        { delay: 0, cell: 'C5', value: 'FUDGE', message: 'Quest Step 1: C5 flashes "FUDGE".' },
        { delay: 2200, cell: 'E3', value: 'NUMBERS', message: 'Quest Step 2: E3 scribbles "NUMBERS".' },
        { delay: 4400, cell: 'D7', value: 'HURRY', message: 'Quest Step 3: D7 hisses "HURRY".' }
      ]
      : [
        {
          delay: 0,
          cell: 'C5',
          value: 'NEXT',
          message: `Layer 1: Cell C5 glows "NEXT" beside ${entryCell}.`,
          layerIndex: 0,
          layer: {
            title: 'VisiCell Array // Entrypoint',
            hint: `Anchor cell ${entryCell}. Remember ENTER.`,
            entries: [
              { addr: 'A1', text: 'ENTER', highlight: true },
              { addr: 'B1', text: entryCell, highlight: true },
              { addr: 'B2', text: 'EAST' },
              { addr: 'C2', text: 'STEP' }
            ],
            reference: `Route responses through ${entryCell}. Type SEARCH when ready.`
          }
        },
        {
          delay: 2200,
          cell: 'E3',
          value: 'DOOR',
          message: 'Layer 2: E3 whispers "DOOR" through the fudged data.',
          layerIndex: 1,
          layer: {
            title: 'VisiCell Array // Fudged',
            hint: 'FUDGE, NUMBERS, HURRY echo under the countdown.',
            entries: [
              { addr: 'A1', text: 'FUDGE', highlight: true },
              { addr: 'B1', text: 'NUMBERS', highlight: true },
              { addr: 'C1', text: 'HURRY' },
              { addr: 'B2', text: entryCell, highlight: true }
            ],
            reference: `Return to ${entryCell}. Type KEY when the door answers.`
          }
        },
        {
          delay: 4400,
          cell: 'D7',
          value: 'OPENS',
          message: 'Layer 3: The next door opens.',
          layerIndex: 2,
          layer: {
            title: 'VisiCell Array // Threshold',
            hint: 'LOOK AND LOOMWORKS STILL WATCH.',
            entries: [
              { addr: 'A1', text: 'LOOK' },
              { addr: 'B1', text: 'LOOMWORKS' },
              { addr: 'C2', text: 'ENTER', highlight: true },
              { addr: 'C3', text: entryCell, highlight: true }
            ],
            reference: `The next door opens. Hold ${entryCell}.`
          },
          finalInstruction: 'THE NEXT DOOR OPENS.'
        }
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

    if (step.layer) {
      this._spawnTrailLayer(step.layer, step.layerIndex || 0);
    }

    if (step.message) {
      this._showClueInstruction(step.message);
    }

    if (isFinal) {
      if (step.finalInstruction) {
        this._showClueInstruction(step.finalInstruction);
      } else if (clue && clue.completedMode === 'enter') {
        this._showClueInstruction('Numbers fudged. The boss is almost here.');
      }

      if (clue && clue.completedMode === 'leave') {
        this._handleNextDoorOpens();
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

    this._cancelQuestCountdown();
    this._clearTrailLayers();

    if (this.state.clueTrail) {
      this.state.clueTrail.deathSequenceScheduled = false;
    }
  }

  async _prepareSceneAudio() {
    if (this.state.audioPreparationPromise) {
      return this.state.audioPreparationPromise;
    }

    const keysToWarm = Object.values(VISCELL_AUDIO_KEYS).filter(Boolean);

    this.state.audioPreparationPromise = (async () => {
      await Promise.all(keysToWarm.map(async (assetKey) => {
        const objectUrl = await this._getAudioObjectUrl(assetKey);
        const wasPreloaded = assetPool.loaded?.has?.(assetKey) ?? false;
        if (objectUrl) {
          console.log(`[VisiCellScene] 🔊 Prepared audio asset ${assetKey} (preloaded=${wasPreloaded})`);
        } else {
          console.warn(`[VisiCellScene] ⚠️ Audio asset ${assetKey} unavailable before sequence start`);
        }
      }));
    })();

    return this.state.audioPreparationPromise;
  }

  async _getAudioObjectUrl(assetKey) {
    if (!assetKey) return null;

    if (!this.state.audioObjectUrls) {
      this.state.audioObjectUrls = new Map();
    }

    if (this.state.audioObjectUrls.has(assetKey)) {
      return this.state.audioObjectUrls.get(assetKey);
    }

    const assetEntry = assetPool.assets?.get(assetKey) || null;
    let assetData = assetEntry?.data || null;

    if (!assetData) {
      try {
        assetData = await assetPool.load(assetKey);
      } catch (error) {
        console.warn(`[VisiCellScene] ⚠️ Failed to load audio asset ${assetKey}`, error);
        return null;
      }
    }

    if (!assetData) {
      console.warn(`[VisiCellScene] ⚠️ Audio asset ${assetKey} returned no data`);
      return null;
    }

    if (typeof Blob === 'undefined' || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
      console.warn(`[VisiCellScene] ⚠️ Browser does not support Blob URLs for audio asset ${assetKey}`);
      return null;
    }

    try {
      const blob = new Blob([assetData], { type: 'audio/mpeg' });
      const objectUrl = URL.createObjectURL(blob);
      this.state.audioObjectUrls.set(assetKey, objectUrl);
      return objectUrl;
    } catch (error) {
      console.warn(`[VisiCellScene] ⚠️ Unable to create object URL for ${assetKey}`, error);
      return null;
    }
  }

  async _createAudioElementFromAsset(assetKey, fallbackUrl = null, options = {}) {
    if (typeof Audio === 'undefined') {
      return { element: null, assetKey, objectUrl: null };
    }

    const objectUrl = await this._getAudioObjectUrl(assetKey);

    if (objectUrl) {
      try {
        const audio = new Audio(objectUrl);
        audio.preload = 'auto';
        if (typeof options.loop === 'boolean') {
          audio.loop = options.loop;
        }
        if (typeof options.volume === 'number') {
          audio.volume = options.volume;
        }
        return { element: audio, assetKey, objectUrl };
      } catch (error) {
        console.warn(`[VisiCellScene] ⚠️ Unable to construct audio element for ${assetKey}`, error);
      }
    }

    if (fallbackUrl) {
      try {
        const audio = new Audio(fallbackUrl);
        audio.preload = 'auto';
        if (typeof options.loop === 'boolean') {
          audio.loop = options.loop;
        }
        if (typeof options.volume === 'number') {
          audio.volume = options.volume;
        }
        return { element: audio, assetKey: null, objectUrl: null };
      } catch (error) {
        console.warn(`[VisiCellScene] ⚠️ Unable to initialize fallback audio ${fallbackUrl}`, error);
      }
    }

    return { element: null, assetKey, objectUrl: null };
  }

  async _ensureEndAudio() {
    if (this.state.endAudio) {
      return this.state.endAudio;
    }

    const { element } = await this._createAudioElementFromAsset(
      VISCELL_AUDIO_KEYS.reboot,
      './reboot.mp3',
      { loop: false, volume: 0.8 }
    );

    if (element) {
      this.state.endAudio = element;
      this.state.endAudioAssetKey = VISCELL_AUDIO_KEYS.reboot;
      console.log('[VisiCellScene] ✅ Reboot audio prepared for scene start');
    }

    return this.state.endAudio;
  }

  _releaseAudioResources() {
    if (this.state.endAudio) {
      try {
        this.state.endAudio.pause();
      } catch (error) {
        console.warn('[VisiCellScene] ⚠️ Error stopping VisiCell audio during cleanup', error);
      }
      this.state.endAudio = null;
    }

    if (this.state.audioObjectUrls && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
      this.state.audioObjectUrls.forEach((objectUrl, assetKey) => {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch (error) {
          console.warn(`[VisiCellScene] ⚠️ Failed to revoke audio URL for ${assetKey}`, error);
        }
      });
      this.state.audioObjectUrls.clear();
    }

    this.state.audioPreparationPromise = null;
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

    await this._prepareSceneAudio();

    const endAudio = await this._ensureEndAudio();

    if (endAudio) {
      try {
        endAudio.currentTime = 0;
        const playPromise = endAudio.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.catch(err => {
            console.warn('⚠️ Unable to autoplay reboot.mp3 during VisiCell Scene', err);
          });
        }
      } catch (error) {
        console.warn('⚠️ Error playing reboot.mp3 during VisiCell Scene', error);
      }
    } else {
      console.warn('⚠️ Reboot audio unavailable during VisiCell Scene start');
    }

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

    if (this.state.clockInterval && typeof window !== 'undefined') {
      window.clearInterval(this.state.clockInterval);
      this.state.clockInterval = null;
    }

    if (this.state.clockOutsideClickHandler && typeof document !== 'undefined') {
      document.removeEventListener('click', this.state.clockOutsideClickHandler);
      this.state.clockOutsideClickHandler = null;
    }

    if (this.state.clock && this.state.clock.modalEl) {
      this.state.clock.modalEl.style.display = 'none';
    }

    if (typeof document !== 'undefined') {
      const videoOverlay = document.querySelector('.visicell-video-overlay');
      if (videoOverlay) {
        videoOverlay.remove();
      }
      const glitchOverlay = document.querySelector('.visicell-glitch-overlay');
      if (glitchOverlay) {
        glitchOverlay.remove();
      }
    }

    if (this.state.endAudio) {
      try {
        this.state.endAudio.pause();
        this.state.endAudio.currentTime = 0;
      } catch (error) {
        console.warn('⚠️ Error stopping reboot.mp3 audio', error);
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

    this._cancelQuestCountdown();
    this._clearTrailLayers();

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

    this._releaseAudioResources();

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


