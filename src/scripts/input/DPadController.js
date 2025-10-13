/**
 * DPadController - D-Pad Navigation System
 * 
 * Extracted from celli-real.html and merged2.html
 * 
 * Handles:
 * - Up/Down/Left/Right navigation
 * - Depth controls (↥/↧)  
 * - Center button
 * - Present mode button
 * - Grab button
 * - Touch vs desktop modes
 */

export class DPadController {
  constructor(callbacks = {}) {
    this.callbacks = {
      onNavigate: callbacks.onNavigate || null,
      onPresentToggle: callbacks.onPresentToggle || null,
      onDepthModeToggle: callbacks.onDepthModeToggle || null
    };
    
    this.state = {
      dpad: null,
      depthMode: false, // false = height (Y), true = depth (Z)
      presentMode: false
    };
  }

  /**
   * Initialize (must be called after HTML injection)
   */
  init() {
    console.log('[DPadController] Initializing...');
    
    this.state.dpad = document.getElementById('dpad');
    if (!this.state.dpad) {
      console.error('[DPadController] #dpad not found!');
      return false;
    }
    
    this._setupEvents();
    
    console.log('[DPadController] ✅ Initialized');
    return true;
  }

  /**
   * Setup event handlers
   */
  _setupEvents() {
    // Direction buttons
    const dirButtons = this.state.dpad.querySelectorAll('.dp[data-dir]');
    dirButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const dir = btn.dataset.dir;
        this._handleDirection(dir);
      });
    });
    
    // Present button
    const presentBtn = this.state.dpad.querySelector('.dp[data-action="present"]');
    if (presentBtn) {
      presentBtn.addEventListener('click', () => {
        this._togglePresent();
      });
    }
    
    // Center button (toggles depth mode)
    const centerBtn = this.state.dpad.querySelector('.dp.center');
    if (centerBtn) {
      centerBtn.addEventListener('click', () => {
        this._toggleDepthMode();
      });
    }
  }

  /**
   * Handle direction click
   */
  _handleDirection(dir) {
    let dx = 0, dy = 0, dz = 0;
    
    if (dir === 'up') {
      if (this.state.depthMode) dz = -1;
      else dy = -1;
    } else if (dir === 'down') {
      if (this.state.depthMode) dz = 1;
      else dy = 1;
    } else if (dir === 'left') {
      dx = -1;
    } else if (dir === 'right') {
      dx = 1;
    } else if (dir === 'depthUp') {
      dz = 1;
    } else if (dir === 'depthDown') {
      dz = -1;
    }
    
    if (this.callbacks.onNavigate) {
      this.callbacks.onNavigate({ dx, dy, dz });
    }
  }

  /**
   * Toggle depth mode
   */
  _toggleDepthMode() {
    this.state.depthMode = !this.state.depthMode;
    
    // Update center button display
    const centerBtn = this.state.dpad.querySelector('.dp.center');
    const depthModeEl = document.getElementById('depthMode');
    if (depthModeEl) {
      depthModeEl.textContent = this.state.depthMode ? 'V' : 'H';
    }
    
    console.log('[DPadController] Depth mode:', this.state.depthMode ? 'DEPTH' : 'HEIGHT');
    
    if (this.callbacks.onDepthModeToggle) {
      this.callbacks.onDepthModeToggle(this.state.depthMode);
    }
  }

  /**
   * Toggle present mode
   */
  _togglePresent() {
    this.state.presentMode = !this.state.presentMode;
    
    // Update button
    const presentBtn = this.state.dpad.querySelector('.dp[data-action="present"]');
    if (presentBtn) {
      presentBtn.classList.toggle('active', this.state.presentMode);
    }
    
    console.log('[DPadController] Present mode:', this.state.presentMode);
    
    if (this.callbacks.onPresentToggle) {
      this.callbacks.onPresentToggle(this.state.presentMode);
    }
  }

  /**
   * Show D-Pad
   */
  show() {
    if (this.state.dpad) {
      this.state.dpad.style.display = 'grid';
    }
  }

  /**
   * Hide D-Pad
   */
  hide() {
    if (this.state.dpad) {
      this.state.dpad.style.display = 'none';
    }
  }

  /**
   * Destroy
   */
  destroy() {
    this.hide();
    console.log('[DPadController] Destroyed');
  }
}

export default DPadController;

