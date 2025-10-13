/**
 * Skip Button / Bow System - Ported from merged2.html
 * 
 * Manages the skip button's transformation through various states:
 * - Initial double-triangle configuration
 * - Bow shape formation
 * - Rounded bow with connector
 * - Phase colors (white → golden → magenta → cyan)
 * - Illuminating states with jiggle animations
 * - Idle bloom increase
 * - Static glitch distortion
 * - Voxel hidden states
 * - Bow lock during sequences
 */

export class SkipButtonSystem {
  constructor() {
    this.state = {
      element: null,
      triangles: [],
      connector: null,
      
      // Bow transformation state
      bowActive: false,
      bowCurrentCenter: null,
      bowTargetCenter: null,
      bowCurrentRotation: 0,
      bowTargetRotation: 0,
      bowAnimationId: 0,
      bowHasTriggered: false,
      bowVisibleAsVoxel: true,
      pendingRoundedBow: false,
      
      // Phase state
      currentPhase: 'white', // white, golden, magenta, cyan, green
      illuminating: false,
      locked: false,
      voxelHidden: false,
      
      // Idle state
      idleTimer: 0,
      idleBloomActive: false,
      idleGlitchActive: false,
      
      // Callbacks
      onSkip: null
    };
  }

  /**
   * Initialize skip button
   */
  init() {
    this.state.element = document.getElementById('skipBtn');
    
    if (!this.state.element) {
      console.warn('⚠️ Skip button element not found');
      return;
    }
    
    // Get triangle elements
    this.state.triangles = [
      document.getElementById('skipTriangle1'),
      document.getElementById('skipTriangle2')
    ];
    
    this.state.connector = document.getElementById('skipConnector');
    
    // Setup click handler
    this.state.element.addEventListener('click', () => this._handleClick());
    
    // Setup hover handlers for idle reset
    this.state.element.addEventListener('mouseenter', () => this._resetIdle());
    this.state.element.addEventListener('mouseleave', () => this._resetIdle());
    
    console.log('✅ Skip button system initialized');
  }

  /**
   * Show skip button
   */
  show() {
    if (this.state.element) {
      this.state.element.classList.remove('hidden');
    }
  }

  /**
   * Hide skip button
   */
  hide() {
    if (this.state.element) {
      this.state.element.classList.add('hidden');
    }
  }

  /**
   * Animate to bow shape
   */
  animateToBow(options = {}) {
    if (this.state.bowHasTriggered) return;
    if (!this.state.element) return;
    
    this.state.bowHasTriggered = true;
    this.state.bowActive = true;
    
    const duration = options.duration || 1200;
    const delay = options.delay || 0;
    
    setTimeout(() => {
      this.state.element.classList.add('bow-shape');
      
      // After bow shape, transition to rounded
      setTimeout(() => {
        this.state.element.classList.add('rounded-bow');
        this.state.element.classList.add('illuminating');
      }, duration * 0.6);
      
    }, delay);
    
    console.log('🏹 Skip button → Bow shape');
  }

  /**
   * Set phase (white, golden, magenta, cyan, green)
   */
  setPhase(phase) {
    if (!this.state.element) return;
    
    const validPhases = ['white', 'golden', 'magenta', 'cyan', 'green'];
    if (!validPhases.includes(phase)) {
      console.warn(`⚠️ Invalid phase: ${phase}`);
      return;
    }
    
    // Remove old phase classes
    validPhases.forEach(p => {
      this.state.element.classList.remove(`${p}-phase`);
    });
    
    // Add new phase
    if (phase !== 'white') {
      this.state.element.classList.add(`${phase}-phase`);
    }
    
    this.state.currentPhase = phase;
    console.log(`🎨 Skip button phase: ${phase}`);
  }

  /**
   * Set illuminating state
   */
  setIlluminating(enabled) {
    if (!this.state.element) return;
    
    if (enabled) {
      this.state.element.classList.add('illuminating');
    } else {
      this.state.element.classList.remove('illuminating');
    }
    
    this.state.illuminating = enabled;
  }

  /**
   * Lock bow (prevent interactions)
   */
  lock() {
    if (!this.state.element) return;
    
    this.state.element.classList.add('bow-lock');
    this.state.locked = true;
  }

  /**
   * Unlock bow
   */
  unlock() {
    if (!this.state.element) return;
    
    this.state.element.classList.remove('bow-lock');
    this.state.locked = false;
  }

  /**
   * Hide as voxel (during certain sequences)
   */
  hideAsVoxel() {
    if (!this.state.element) return;
    
    this.state.element.classList.add('voxel-hidden');
    this.state.voxelHidden = true;
    this.state.bowVisibleAsVoxel = false;
  }

  /**
   * Show as voxel
   */
  showAsVoxel() {
    if (!this.state.element) return;
    
    this.state.element.classList.remove('voxel-hidden');
    this.state.voxelHidden = false;
    this.state.bowVisibleAsVoxel = true;
    
    // Restore full brightness
    this.state.element.style.opacity = '1';
    this.state.element.style.filter = 'none';
  }

  /**
   * Update (called from animation loop)
   */
  update(deltaTime) {
    if (!this.state.element) return;
    if (this.state.locked) return;
    
    // Update idle timer
    this.state.idleTimer += deltaTime;
    
    // Idle bloom increase after 3 seconds
    if (this.state.idleTimer > 3.0 && !this.state.idleBloomActive) {
      this._startIdleBloom();
    }
    
    // Static glitch after 6 seconds
    if (this.state.idleTimer > 6.0 && !this.state.idleGlitchActive) {
      this._startIdleGlitch();
    }
  }

  /**
   * Start idle bloom increase
   */
  _startIdleBloom() {
    if (!this.state.element) return;
    
    this.state.element.classList.add('idle-bloom-increase');
    this.state.idleBloomActive = true;
    
    console.log('✨ Idle bloom increase');
  }

  /**
   * Start idle glitch distortion
   */
  _startIdleGlitch() {
    if (!this.state.element) return;
    
    this.state.element.classList.add('idle-glitching');
    this.state.idleGlitchActive = true;
    
    console.log('⚡ Idle glitch distortion');
  }

  /**
   * Reset idle state
   */
  _resetIdle() {
    this.state.idleTimer = 0;
    
    if (this.state.idleBloomActive) {
      this.state.element?.classList.remove('idle-bloom-increase');
      this.state.idleBloomActive = false;
    }
    
    if (this.state.idleGlitchActive) {
      this.state.element?.classList.remove('idle-glitching');
      this.state.idleGlitchActive = false;
    }
  }

  /**
   * Handle click
   */
  _handleClick() {
    if (this.state.locked) return;
    
    console.log('⏭️ Skip button clicked');
    
    this._resetIdle();
    
    if (this.state.onSkip) {
      this.state.onSkip();
    }
  }

  /**
   * Set skip callback
   */
  onSkipCallback(callback) {
    this.state.onSkip = callback;
  }

  /**
   * Get current state
   */
  getState() {
    return {
      visible: this.state.element ? !this.state.element.classList.contains('hidden') : false,
      bowActive: this.state.bowActive,
      phase: this.state.currentPhase,
      illuminating: this.state.illuminating,
      locked: this.state.locked,
      voxelHidden: this.state.voxelHidden,
      idleBloom: this.state.idleBloomActive,
      idleGlitch: this.state.idleGlitchActive
    };
  }
}

// Singleton instance
export const skipButtonSystem = new SkipButtonSystem();
export default skipButtonSystem;


