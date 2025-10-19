/**
 * UIManager - Complete UI Orchestration System
 * 
 * Extracted from celli-real.html and merged2.html
 * Orchestrates all UI components for the Cell.real application
 * 
 * Manages:
 * - Spreadsheet grid
 * - Formula bar  
 * - D-Pad controls
 * - Terminal/Notepad windows
 * - Debug console
 * - Toast notifications
 * - Address modes
 * - Color picker
 * - View toggles
 */

import { SpreadsheetGridComplete } from './SpreadsheetGrid-Complete.js';
import { NarrativeWindows } from './NarrativeWindows.js';
import { DPadController } from '../input/DPadController.js';

export class UIManager {
  constructor(callbacks = {}) {
    this.callbacks = {
      onCellSelect: callbacks.onCellSelect || null,
      onFormulaExecute: callbacks.onFormulaExecute || null,
      onNavigate: callbacks.onNavigate || null,
      onPresentToggle: callbacks.onPresentToggle || null
    };
    
    this.state = {
      // Components
      spreadsheet: null,
      windows: null,
      dpad: null,
      
      // UI state
      addressMode: 'local',
      viewMode: 'standard',
      crystal2D: false,
      
      // Elements
      sheet: null,
      fx: null,
      toast: null,
      hud: null
    };
  }

  /**
   * Initialize all UI components
   */
  async init() {
    const canGroup = typeof console.groupCollapsed === 'function';
    if (canGroup) {
      console.groupCollapsed('[UIManager] Initializing complete UI system...');
    } else {
      console.log('[UIManager] Initializing complete UI system...');
    }
    console.log('[UIManager] Document readyState:', document.readyState);
    console.time('[UIManager] Init duration');

    try {
      // Initialize spreadsheet
      this.state.spreadsheet = new SpreadsheetGridComplete({
        onCellSelect: (data) => this._handleCellSelect(data),
        onFormulaApply: (data) => this._handleFormulaApply(data)
      });

      console.time('[UIManager] Spreadsheet build');
      const gridSuccess = this.state.spreadsheet.build();
      console.timeEnd('[UIManager] Spreadsheet build');
      console.log('[UIManager] Spreadsheet build result:', gridSuccess);
      if (!gridSuccess) {
        throw new Error('Failed to build spreadsheet grid (see SpreadsheetGrid-Complete logs above)');
      }

      // Initialize narrative windows
      this.state.windows = new NarrativeWindows();
      const windowsSuccess = this.state.windows.init();
      if (!windowsSuccess) {
        console.warn('[UIManager] Narrative windows initialization failed');
      }
      
      // Initialize D-Pad
      this.state.dpad = new DPadController({
        onNavigate: (data) => this._handleNavigate(data),
        onPresentToggle: (enabled) => this._handlePresentToggle(enabled),
        onDepthModeToggle: (mode) => this._handleDepthModeToggle(mode)
      });
      
      const dpadSuccess = this.state.dpad.init();
      if (!dpadSuccess) {
        console.warn('[UIManager] D-Pad initialization failed');
      }
      
      // Get UI element references
      this.state.sheet = document.getElementById('sheet');
      this.state.fx = document.getElementById('fx');
      this.state.toast = document.getElementById('toast');
      this.state.hud = document.getElementById('hud');
      
      // Setup additional UI handlers
      this._setupUIHandlers();

      console.timeEnd('[UIManager] Init duration');
      console.log('[UIManager] ✅ Complete UI system initialized');
      if (canGroup) {
        console.groupEnd();
      }
      return true;
    } catch (error) {
      console.error('[UIManager] Initialization failed:', error);
      console.timeEnd('[UIManager] Init duration');
      if (canGroup) {
        console.groupEnd();
      }
      return false;
    }
  }

  /**
   * Setup additional UI handlers
   */
  _setupUIHandlers() {
    // Address mode toggle
    const addressModeBtn = document.getElementById('toggleAddressMode');
    if (addressModeBtn) {
      addressModeBtn.addEventListener('click', () => {
        this._toggleAddressMode();
      });
    }
    
    // View toggle button
    const viewToggleBtn = document.getElementById('viewToggleBtn');
    if (viewToggleBtn) {
      viewToggleBtn.addEventListener('click', () => {
        this._toggleView();
      });
    }
    
    // Crystal 2D toggle
    const crystal2DToggle = document.getElementById('crystal2DToggle');
    if (crystal2DToggle) {
      crystal2DToggle.addEventListener('change', (e) => {
        this._toggleCrystal2D(e.target.checked);
      });
    }
  }

  /**
   * Handle cell selection
   */
  _handleCellSelect(data) {
    console.log('[UIManager] Cell selected:', data);
    if (this.callbacks.onCellSelect) {
      this.callbacks.onCellSelect(data);
    }
  }

  /**
   * Handle formula apply
   */
  _handleFormulaApply(data) {
    console.log('[UIManager] Formula applied:', data);
    if (this.callbacks.onFormulaExecute) {
      this.callbacks.onFormulaExecute(data);
    }
  }

  /**
   * Handle navigation
   */
  _handleNavigate(data) {
    if (this.callbacks.onNavigate) {
      this.callbacks.onNavigate(data);
    }
  }

  /**
   * Handle present toggle
   */
  _handlePresentToggle(enabled) {
    this.state.viewMode = enabled ? 'present' : 'standard';
    if (this.callbacks.onPresentToggle) {
      this.callbacks.onPresentToggle(enabled);
    }
  }

  /**
   * Handle depth mode toggle
   */
  _handleDepthModeToggle(mode) {
    console.log('[UIManager] Depth mode:', mode ? 'DEPTH' : 'HEIGHT');
  }

  /**
   * Toggle address mode
   */
  _toggleAddressMode() {
    this.state.addressMode = this.state.addressMode === 'local' ? 'absolute' : 'local';
    this.state.spreadsheet.state.addressMode = this.state.addressMode;
    this.state.spreadsheet._updateTitle();
    console.log('[UIManager] Address mode:', this.state.addressMode);
  }

  /**
   * Toggle view mode
   */
  _toggleView() {
    // Toggle between different view modes
    console.log('[UIManager] View toggle clicked');
  }

  /**
   * Toggle Crystal 2D mode
   */
  _toggleCrystal2D(enabled) {
    this.state.crystal2D = enabled;
    if (enabled) {
      document.body.classList.add('crystal-2d');
    } else {
      document.body.classList.remove('crystal-2d');
    }
    console.log('[UIManager] Crystal 2D:', enabled);
  }

  /**
   * Show toast notification
   */
  showToast(message, duration = 3000) {
    if (!this.state.toast) return;
    
    this.state.toast.textContent = message;
    this.state.toast.style.display = 'block';
    
    setTimeout(() => {
      this.state.toast.style.display = 'none';
    }, duration);
  }

  /**
   * Show spreadsheet
   */
  showSpreadsheet() {
    this.state.spreadsheet?.show();
  }

  /**
   * Hide spreadsheet
   */
  hideSpreadsheet() {
    this.state.spreadsheet?.hide();
  }

  /**
   * Show D-Pad
   */
  showDPad() {
    this.state.dpad?.show();
  }

  /**
   * Hide D-Pad
   */
  hideDPad() {
    this.state.dpad?.hide();
  }

  /**
   * Show windows (Terminal/Notepad icons)
   */
  showWindows() {
    this.state.windows?.showIcons();
  }

  /**
   * Hide windows
   */
  hideWindows() {
    this.state.windows?.hideIcons();
  }

  /**
   * Get spreadsheet component
   */
  getSpreadsheet() {
    return this.state.spreadsheet;
  }

  /**
   * Get windows component
   */
  getWindows() {
    return this.state.windows;
  }

  /**
   * Get D-Pad component
   */
  getDPad() {
    return this.state.dpad;
  }

  /**
   * Destroy all UI components
   */
  destroy() {
    console.log('[UIManager] Destroying UI system...');
    
    this.state.spreadsheet?.destroy();
    this.state.windows?.destroy();
    this.state.dpad?.destroy();
    
    console.log('[UIManager] ✅ UI system destroyed');
  }
}

export default UIManager;

