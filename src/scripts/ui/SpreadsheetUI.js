/**
 * SpreadsheetUI - 2D Spreadsheet Interface
 * 
 * Manages the 2D spreadsheet UI including:
 * - Cell grid rendering and interaction
 * - Formula bar
 * - Cell selection and editing
 * - Color coding
 * - Resizing and navigation
 * 
 * Extracted from merged2.html
 */

export class SpreadsheetUI {
  constructor() {
    this.state = {
      // DOM elements
      sheet: null,
      sheetBody: null,
      table: null,
      thead: null,
      tbody: null,
      fx: null,
      fxHighlight: null,
      directEdit: null,
      
      // Grid state
      rows: 26,
      cols: 26,
      layers: 12, // z-depth (greek letters)
      
      // Selection
      focusedCell: null,
      selection: [],
      
      // Array state
      currentArrayId: 0,
      arrays: new Map(),
      
      // Edit mode
      editMode: false,
      editingCell: null,
      
      // Address mode ('local' or 'absolute')
      addressMode: 'local',
      
      // Callbacks
      onCellClick: null,
      onCellEdit: null,
      onFormulaApply: null,
      onCellFocus: null,
      
      // Resize
      resizing: false,
      resizeStart: { x: 0, y: 0, w: 0, h: 0 }
    };
    
    // Greek letters for z-axis (layers)
    this.greekChars = ['α','β','γ','δ','ε','ζ','η','θ','ι','κ','λ','μ','ν','ξ','ο','π','ρ','σ','τ','υ','φ','χ','ψ','ω'];
    
    // Cached DOM references
    this.cells = new Map(); // key: 'x,y,z' -> DOM element
  }

  /**
   * Initialize UI
   */
  async init() {
    console.log('[SpreadsheetUI] Initializing...');
    
    // Get DOM elements
    this.state.sheet = document.getElementById('sheet');
    this.state.table = this.state.sheet?.querySelector('.sheet');
    this.state.thead = this.state.table?.querySelector('thead');
    this.state.tbody = this.state.table?.querySelector('tbody');
    this.state.fx = document.getElementById('fx');
    this.state.fxHighlight = document.getElementById('fxHighlight');
    this.state.directEdit = document.getElementById('directEdit');
    
    if (!this.state.sheet || !this.state.table) {
      console.error('[SpreadsheetUI] Required DOM elements not found');
      return false;
    }
    
    // Build grid
    this._buildGrid();
    
    // Setup event handlers
    this._setupEvents();
    
    // Setup resizer
    this._setupResizer();
    
    // Setup minimize/maximize
    this._setupMinimize();
    
    // Setup formula bar
    this._setupFormulaBar();
    
    // Setup keyboard shortcuts
    this._setupKeyboard();
    
    console.log('[SpreadsheetUI] Initialized');
    return true;
  }

  /**
   * Build cell grid
   */
  _buildGrid() {
    if (!this.state.thead || !this.state.tbody) return;
    
    // Build column headers
    const headerRow = this.state.thead.querySelector('#cols');
    if (headerRow) {
      headerRow.innerHTML = '<th></th>'; // Corner cell
      
      for (let x = 0; x < this.state.cols; x++) {
        const th = document.createElement('th');
        th.className = 'chip';
        th.textContent = this._columnLabel(x);
        th.dataset.col = x;
        headerRow.appendChild(th);
      }
    }
    
    // Build rows
    this.state.tbody.innerHTML = '';
    
    for (let y = 0; y < this.state.rows; y++) {
      const tr = document.createElement('tr');
      
      // Row header
      const rowHeader = document.createElement('th');
      rowHeader.className = 'chip';
      rowHeader.textContent = y + 1;
      rowHeader.dataset.row = y;
      tr.appendChild(rowHeader);
      
      // Cells
      for (let x = 0; x < this.state.cols; x++) {
        const td = document.createElement('td');
        td.className = 'cell';
        td.dataset.x = x;
        td.dataset.y = y;
        td.dataset.z = 0; // Default layer
        td.contentEditable = 'false';
        
        // Cache reference
        const key = `${x},${y},0`;
        this.cells.set(key, td);
        
        tr.appendChild(td);
      }
      
      this.state.tbody.appendChild(tr);
    }
    
    console.log(`[SpreadsheetUI] Built ${this.state.cols}x${this.state.rows} grid`);
  }

  /**
   * Setup event handlers
   */
  _setupEvents() {
    // Cell click
    this.state.tbody?.addEventListener('click', (e) => {
      const cell = e.target.closest('.cell');
      if (!cell) return;
      
      const x = parseInt(cell.dataset.x);
      const y = parseInt(cell.dataset.y);
      const z = parseInt(cell.dataset.z || 0);
      
      this._selectCell(x, y, z);
      
      if (this.state.onCellClick) {
        this.state.onCellClick({ x, y, z, cell });
      }
    });
    
    // Cell double-click to edit
    this.state.tbody?.addEventListener('dblclick', (e) => {
      const cell = e.target.closest('.cell');
      if (!cell) return;
      
      const x = parseInt(cell.dataset.x);
      const y = parseInt(cell.dataset.y);
      const z = parseInt(cell.dataset.z || 0);
      
      this._startEdit(x, y, z);
    });
  }

  /**
   * Setup formula bar
   */
  _setupFormulaBar() {
    if (!this.state.fx) return;
    
    // Formula bar enter
    this.state.fx.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this._applyFormula();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.state.fx.blur();
        this._cancelEdit();
      }
    });
    
    // Apply button
    const applyBtn = document.getElementById('applyFx');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        this._applyFormula();
      });
    }
    
    // Formula bar input
    this.state.fx.addEventListener('input', () => {
      this._updateFxHighlight();
    });
  }

  /**
   * Setup keyboard shortcuts
   */
  _setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      // Don't handle if typing in formula bar
      if (e.target === this.state.fx || e.target === this.state.directEdit) return;
      
      const focused = this.state.focusedCell;
      if (!focused) return;
      
      // Arrow keys
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        this._moveSelection(0, -1, 0);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this._moveSelection(0, 1, 0);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this._moveSelection(-1, 0, 0);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this._moveSelection(1, 0, 0);
      }
      
      // Enter to edit
      else if (e.key === 'Enter') {
        e.preventDefault();
        this._startEdit(focused.x, focused.y, focused.z);
      }
      
      // Backspace to clear
      else if (e.key === 'Backspace') {
        e.preventDefault();
        this._clearCell(focused.x, focused.y, focused.z);
      }
      
      // Tab to move right
      else if (e.key === 'Tab') {
        e.preventDefault();
        this._moveSelection(e.shiftKey ? -1 : 1, 0, 0);
      }
      
      // Page Up/Down for layers
      else if (e.key === 'PageUp') {
        e.preventDefault();
        this._moveSelection(0, 0, 1);
      } else if (e.key === 'PageDown') {
        e.preventDefault();
        this._moveSelection(0, 0, -1);
      }
      
      // Type to start editing
      else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        this._startEdit(focused.x, focused.y, focused.z, e.key);
      }
    });
  }

  /**
   * Setup sheet resizer
   */
  _setupResizer() {
    const resizer = document.getElementById('sheetResizer');
    if (!resizer) return;
    
    resizer.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.state.resizing = true;
      
      const rect = this.state.sheet.getBoundingClientRect();
      this.state.resizeStart = {
        x: e.clientX,
        y: e.clientY,
        w: rect.width,
        h: rect.height
      };
      
      document.addEventListener('mousemove', this._handleResize);
      document.addEventListener('mouseup', this._endResize);
    });
  }

  /**
   * Handle resize drag
   */
  _handleResize = (e) => {
    if (!this.state.resizing) return;
    
    const dx = e.clientX - this.state.resizeStart.x;
    const dy = e.clientY - this.state.resizeStart.y;
    
    const newW = Math.max(400, this.state.resizeStart.w + dx);
    const newH = Math.max(300, this.state.resizeStart.h + dy);
    
    this.state.sheet.style.width = `${newW}px`;
    this.state.sheet.style.height = `${newH}px`;
  }

  /**
   * End resize
   */
  _endResize = () => {
    this.state.resizing = false;
    document.removeEventListener('mousemove', this._handleResize);
    document.removeEventListener('mouseup', this._endResize);
  }

  /**
   * Setup minimize/maximize
   */
  _setupMinimize() {
    const minDot = document.getElementById('minDot');
    if (!minDot) return;
    
    minDot.addEventListener('click', () => {
      this.state.sheet.classList.toggle('minimized');
    });
  }

  /**
   * Select cell
   */
  _selectCell(x, y, z) {
    // Clear previous selection
    this.cells.forEach(cell => cell.classList.remove('selected'));
    
    // Set new selection
    const key = `${x},${y},${z}`;
    const cell = this.cells.get(key);
    
    if (cell) {
      cell.classList.add('selected');
      this.state.focusedCell = { x, y, z, cell };
      
      // Update formula bar
      const formula = cell.dataset.formula || '';
      if (this.state.fx) {
        this.state.fx.value = formula;
        this._updateFxHighlight();
      }
      
      // Update sheet title
      this._updateTitle();
      
      if (this.state.onCellFocus) {
        this.state.onCellFocus({ x, y, z, cell });
      }
    }
  }

  /**
   * Move selection
   */
  _moveSelection(dx, dy, dz) {
    const focused = this.state.focusedCell;
    if (!focused) return;
    
    let newX = focused.x + dx;
    let newY = focused.y + dy;
    let newZ = focused.z + dz;
    
    // Clamp
    newX = Math.max(0, Math.min(this.state.cols - 1, newX));
    newY = Math.max(0, Math.min(this.state.rows - 1, newY));
    newZ = Math.max(0, Math.min(this.state.layers - 1, newZ));
    
    this._selectCell(newX, newY, newZ);
  }

  /**
   * Start editing cell
   */
  _startEdit(x, y, z, initialChar = '') {
    const key = `${x},${y},${z}`;
    const cell = this.cells.get(key);
    if (!cell) return;
    
    this.state.editMode = true;
    this.state.editingCell = { x, y, z, cell };
    
    // Focus formula bar
    if (this.state.fx) {
      this.state.fx.focus();
      
      if (initialChar) {
        this.state.fx.value = initialChar;
      }
      
      this.state.fx.select();
    }
  }

  /**
   * Apply formula
   */
  _applyFormula() {
    const focused = this.state.focusedCell;
    if (!focused) return;
    
    const formula = this.state.fx?.value || '';
    
    if (this.state.onFormulaApply) {
      this.state.onFormulaApply({
        x: focused.x,
        y: focused.y,
        z: focused.z,
        formula
      });
    }
    
    this._endEdit();
  }

  /**
   * Cancel edit
   */
  _cancelEdit() {
    this.state.editMode = false;
    this.state.editingCell = null;
    
    // Restore formula bar to selected cell's formula
    if (this.state.focusedCell) {
      const key = `${this.state.focusedCell.x},${this.state.focusedCell.y},${this.state.focusedCell.z}`;
      const cell = this.cells.get(key);
      if (cell && this.state.fx) {
        this.state.fx.value = cell.dataset.formula || '';
      }
    }
  }

  /**
   * End edit
   */
  _endEdit() {
    this.state.editMode = false;
    this.state.editingCell = null;
    
    // Blur formula bar
    if (this.state.fx) {
      this.state.fx.blur();
    }
  }

  /**
   * Clear cell
   */
  _clearCell(x, y, z) {
    const key = `${x},${y},${z}`;
    const cell = this.cells.get(key);
    if (!cell) return;
    
    // Clear content
    cell.textContent = '';
    cell.dataset.formula = '';
    cell.style.backgroundColor = '';
    
    if (this.state.onCellEdit) {
      this.state.onCellEdit({ x, y, z, value: '', formula: '' });
    }
    
    // Update formula bar
    if (this.state.fx) {
      this.state.fx.value = '';
    }
  }

  /**
   * Update cell content
   */
  updateCell(x, y, z, value, formula = '', color = null) {
    const key = `${x},${y},${z}`;
    const cell = this.cells.get(key);
    if (!cell) return;
    
    // Update content
    cell.textContent = value;
    cell.dataset.formula = formula;
    
    // Update color
    if (color) {
      cell.style.backgroundColor = color;
    } else {
      cell.style.backgroundColor = '';
    }
    
    // Update formula bar if this is the focused cell
    if (this.state.focusedCell && 
        this.state.focusedCell.x === x && 
        this.state.focusedCell.y === y &&
        this.state.focusedCell.z === z) {
      if (this.state.fx) {
        this.state.fx.value = formula;
        this._updateFxHighlight();
      }
    }
  }

  /**
   * Update formula bar highlight
   */
  _updateFxHighlight() {
    if (!this.state.fx || !this.state.fxHighlight) return;
    
    const text = this.state.fx.value;
    
    // Simple syntax highlighting
    let html = text;
    
    // Highlight functions
    html = html.replace(/\b([A-Z_]+)\s*\(/g, '<span class="fn">$1</span>(');
    
    // Highlight strings
    html = html.replace(/"([^"]*)"/g, '<span class="str">"$1"</span>');
    
    // Highlight numbers
    html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="num">$1</span>');
    
    this.state.fxHighlight.innerHTML = html;
  }

  /**
   * Update sheet title
   */
  _updateTitle() {
    const titleEl = document.getElementById('sheetTitle');
    if (!titleEl) return;
    
    const focused = this.state.focusedCell;
    if (focused) {
      const address = this._formatAddress(focused.x, focused.y, focused.z);
      titleEl.textContent = address;
    } else {
      titleEl.textContent = 'Array';
    }
  }

  /**
   * Format cell address
   */
  _formatAddress(x, y, z) {
    const col = this._columnLabel(x);
    const row = y + 1;
    const layer = this.greekChars[z] || '';
    
    if (this.state.addressMode === 'local') {
      return `${col}${row}${layer}`;
    } else {
      // Absolute: @[x+1,y+1,z+1,arrayId]
      return `@[${x+1},${y+1},${z+1},${this.state.currentArrayId}]`;
    }
  }

  /**
   * Get column label (A, B, C, ... Z, AA, AB, ...)
   */
  _columnLabel(n) {
    let s = '';
    let v = n + 1;
    while (v > 0) {
      const r = (v - 1) % 26;
      s = String.fromCharCode(65 + r) + s;
      v = Math.floor((v - 1) / 26);
    }
    return s;
  }

  /**
   * Set callbacks
   */
  setCallbacks(callbacks) {
    if (callbacks.onCellClick) this.state.onCellClick = callbacks.onCellClick;
    if (callbacks.onCellEdit) this.state.onCellEdit = callbacks.onCellEdit;
    if (callbacks.onFormulaApply) this.state.onFormulaApply = callbacks.onFormulaApply;
    if (callbacks.onCellFocus) this.state.onCellFocus = callbacks.onCellFocus;
  }

  /**
   * Show sheet
   */
  show() {
    if (this.state.sheet) {
      this.state.sheet.style.display = '';
    }
  }

  /**
   * Hide sheet
   */
  hide() {
    if (this.state.sheet) {
      this.state.sheet.style.display = 'none';
    }
  }

  /**
   * Destroy
   */
  destroy() {
    // Clear cells
    this.cells.clear();
    
    // Remove event listeners would go here
    // (stored listeners would need to be tracked)
    
    console.log('[SpreadsheetUI] Destroyed');
  }
}

export default SpreadsheetUI;

