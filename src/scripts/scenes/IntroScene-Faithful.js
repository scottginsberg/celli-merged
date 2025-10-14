/**
 * IntroScene - Faithful Implementation
 * 
 * Loads the complete, exact intro sequence from merged2.html
 * 
 * This scene uses the extracted intro-faithful.html which contains:
 * - Doorway portal animation (bar → rectangle with light rays)
 * - Quote animations (6 stages: idle → visible → glitch → scramble)
 * - VisiCell terminal with green-on-black aesthetic
 * - Terminal input system with character validation
 * - Easter eggs (R-infection, barrel clicks, ENTER command)
 * - 3D pixel "CELLI" text formation with THREE.js
 * - Skip button with bow transformation
 * - Per-character shadows on doorway prompt
 * - Full intro sequence from original merged2.html
 * 
 * Source: merged2.html lines 2700-5500 (~2,800 lines)
 */

export class IntroScene {
  constructor() {
    this.name = 'Intro';
    
    this.state = {
      iframe: null,
      running: false,
      container: null
    };
  }

  /**
   * Initialize scene by loading faithful implementation
   */
  async init() {
    console.log('[IntroScene-Faithful] Initializing with complete intro sequence...');
    
    // Create container
    this.state.container = document.createElement('div');
    this.state.container.id = 'intro-scene-container';
    this.state.container.style.cssText = 'position:fixed;inset:0;display:none;z-index:9999;background:#000';
    document.body.appendChild(this.state.container);
    
    console.log('[IntroScene-Faithful] ✅ Container created');
  }

  /**
   * Start scene
   */
  async start(params, callbacks) {
    console.log('[IntroScene-Faithful] ▶️ Redirecting to faithful intro...');
    
    // Redirect to the faithful standalone intro template
    // Full faithful intro with HELL sequence, bow transform, light jiggle
    window.location.href = './templates/componentized/intro-faithful.html?autostart=1';

    console.log('[IntroScene-Faithful] ✅ Redirecting to intro-faithful template');
  }

  /**
   * Update (not needed - redirect handles everything)
   */
  update(params, deltaTime, totalTime) {
    // Scene is loaded via redirect
  }

  /**
   * Stop scene
   */
  async stop() {
    console.log('[IntroScene-Faithful] ⏹️ Stopping...');
    this.state.running = false;
  }

  /**
   * Destroy scene
   */
  async destroy() {
    console.log('[IntroScene-Faithful] 🗑️ Destroying...');
    
    await this.stop();
    
    // Remove container
    if (this.state.container && this.state.container.parentNode) {
      this.state.container.parentNode.removeChild(this.state.container);
      this.state.container = null;
    }
    
    console.log('[IntroScene-Faithful] ✅ Destroyed');
  }

  /**
   * Set mode (for compatibility)
   */
  setMode(mode) {
    console.log(`[IntroScene-Faithful] Mode set to: ${mode}`);
    // Intro doesn't have modes, but we accept the call
  }
}

