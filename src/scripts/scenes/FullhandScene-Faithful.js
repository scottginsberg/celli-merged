/**
 * FullhandScene - Faithful Implementation
 * 
 * Loads the complete, exact fullhand scene from merged2.html
 * 
 * This scene uses the extracted fullhand-complete.html which contains:
 * - Complete skeletal finger (MCP, PIP, DIP, TIP bones)
 * - Detailed finger geometry with creases and fingerprints
 * - Full QWERTY keyboard with key shapes and labels
 * - Character bust (ZSphere-based)
 * - Boss Celli head (glowing voxel head)
 * - Dust particles and god rays
 * - OrbitControls and TransformControls
 * - Sequence vs Debug mode toggle
 * - All effects from merged2.html
 * 
 * Source: merged2.html lines 33611-41248 (7,638 lines)
 */

export class FullhandScene {
  constructor() {
    this.name = 'Fullhand';
    
    this.state = {
      iframe: null,
      mode: 'sequence', // 'sequence' | 'debug'
      running: false,
      container: null
    };
  }

  /**
   * Initialize scene by loading faithful implementation
   */
  async init() {
    console.log('[FullhandScene-Faithful] Initializing with complete scene...');
    
    // Create container
    this.state.container = document.createElement('div');
    this.state.container.id = 'fullhand-scene-container';
    this.state.container.style.cssText = 'position:fixed;inset:0;display:none;z-index:9999';
    document.body.appendChild(this.state.container);
    
    console.log('[FullhandScene-Faithful] ✅ Container created');
  }

  /**
   * Start scene
   */
  async start(params, callbacks) {
    console.log('[FullhandScene-Faithful] ▶️ Redirecting to complete fullhand scene...');
    
    // Store mode in localStorage for fullhand-complete.html to read
    localStorage.setItem('fullhand_mode', this.state.mode);
    
    // Redirect to the standalone scene in templates/componentized
    // This avoids iframe issues and loads the exact scene directly
    window.location.href = './templates/componentized/fullhand-complete.html';
    
    console.log('[FullhandScene-Faithful] ✅ Redirecting to fullhand-complete.html (mode: ' + this.state.mode + ')');
  }

  /**
   * Update (not needed - iframe handles its own loop)
   */
  update(params, deltaTime, totalTime) {
    // Scene runs in iframe
  }

  /**
   * Stop scene
   */
  async stop() {
    console.log('[FullhandScene-Faithful] ⏹️ Stopping...');
    this.state.running = false;
  }

  /**
   * Destroy scene
   */
  async destroy() {
    console.log('[FullhandScene-Faithful] 🗑️ Destroying...');
    
    await this.stop();
    
    // Remove iframe
    if (this.state.iframe && this.state.iframe.parentNode) {
      this.state.iframe.parentNode.removeChild(this.state.iframe);
      this.state.iframe = null;
    }
    
    // Remove container
    if (this.state.container && this.state.container.parentNode) {
      this.state.container.parentNode.removeChild(this.state.container);
      this.state.container = null;
    }
    
    console.log('[FullhandScene-Faithful] ✅ Destroyed');
  }

  /**
   * Set mode (sequence vs debug)
   */
  setMode(mode) {
    this.state.mode = mode;
    
    // If already loaded, update iframe
    if (this.state.iframe && this.state.iframe.contentWindow) {
      try {
        this.state.iframe.contentWindow.EXEC_ENV_MODE = mode;
        console.log(`[FullhandScene-Faithful] Mode updated to: ${mode}`);
      } catch (e) {
        console.warn('[FullhandScene-Faithful] Could not update mode:', e);
      }
    }
  }
}

export default FullhandScene;

