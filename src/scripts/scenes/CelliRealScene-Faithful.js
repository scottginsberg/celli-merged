/**
 * CelliRealScene - Faithful Implementation
 * 
 * Loads the complete, exact Celli.real scene from merged2.html
 * 
 * This scene uses the extracted cellireal-complete.html which contains:
 * - Complete spreadsheet system (unlimited grid)
 * - Full formula engine (all functions)
 * - Complete voxel rendering (chunking, LOD, occlusion)
 * - Store system (state management)
 * - Actions, Write, all operations
 * - Physics integration (Rapier)
 * - Present mode (fancy graphics)
 * - Ocean backdrop system
 * - Terminal sequence with effects
 * - Complete UI (D-Pad, formula bar, etc.)
 * - Save/load functionality
 * - All features from celli-real.html
 * 
 * Source: merged2.html lines 9832-33608 (23,776 lines)
 */

export class CelliRealScene {
  constructor() {
    this.name = 'CelliReal';
    
    this.state = {
      iframe: null,
      running: false,
      container: null,
      clickHandlerAdded: false
    };
  }

  /**
   * Initialize scene by loading faithful implementation
   */
  async init() {
    console.log('[CelliRealScene-Faithful] Initializing with complete scene...');
    
    // Create container
    this.state.container = document.createElement('div');
    this.state.container.id = 'cellireal-scene-container';
    this.state.container.style.cssText = 'position:fixed;inset:0;display:none;z-index:9999;background:#0a0a0a';
    document.body.appendChild(this.state.container);
    
    console.log('[CelliRealScene-Faithful] ✅ Container created');
  }

  /**
   * Start scene
   */
  async start(params, callbacks) {
    console.log('[CelliRealScene-Faithful] ▶️ Redirecting to complete Celli.real scene...');
    
    // Redirect to the standalone scene in templates/componentized
    // This avoids iframe issues and loads the exact scene directly
    window.location.href = './templates/componentized/cellireal-complete.html';
    
    console.log('[CelliRealScene-Faithful] ✅ Redirecting to cellireal-complete.html');
  }

  /**
   * Setup click handler for 3D world reveal
   */
  _setupClickToReveal() {
    if (this.state.clickHandlerAdded) return;
    
    try {
      const iframeDoc = this.state.iframe.contentDocument || this.state.iframe.contentWindow?.document;
      if (!iframeDoc) {
        console.warn('[CelliRealScene-Faithful] Cannot access iframe document');
        return;
      }
      
      // Find the canvas or background element
      const canvas = iframeDoc.getElementById('view') || iframeDoc.querySelector('canvas');
      const world = iframeDoc.getElementById('world');
      
      if (canvas || world) {
        const clickTarget = canvas || world;
        
        clickTarget.addEventListener('click', (e) => {
          console.log('[CelliRealScene-Faithful] Background clicked - revealing 3D world!');
          
          // Call the reveal function in the iframe if it exists
          try {
            const iframeWindow = this.state.iframe.contentWindow;
            
            // Try various reveal functions that might exist
            if (iframeWindow.kickIntroSequence) {
              iframeWindow.kickIntroSequence('background-click');
            } else if (iframeWindow.hideIntroOverlay) {
              iframeWindow.hideIntroOverlay();
            } else if (iframeWindow.triggerIntroCollapse) {
              iframeWindow.triggerIntroCollapse();
            }
            
            // Also try to show the 3D scene
            if (iframeWindow.Scene && iframeWindow.Scene.setGridVisible) {
              iframeWindow.Scene.setGridVisible(true);
            }
            
            console.log('[CelliRealScene-Faithful] ✅ 3D reveal triggered');
          } catch (err) {
            console.warn('[CelliRealScene-Faithful] Could not trigger reveal:', err);
          }
        });
        
        this.state.clickHandlerAdded = true;
        console.log('[CelliRealScene-Faithful] ✅ Click-to-reveal handler added');
      }
    } catch (e) {
      console.warn('[CelliRealScene-Faithful] Could not setup click handler (CORS?):', e);
    }
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
    console.log('[CelliRealScene-Faithful] ⏹️ Stopping...');
    this.state.running = false;
  }

  /**
   * Destroy scene
   */
  async destroy() {
    console.log('[CelliRealScene-Faithful] 🗑️ Destroying...');
    
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
    
    console.log('[CelliRealScene-Faithful] ✅ Destroyed');
  }
}

export default CelliRealScene;

