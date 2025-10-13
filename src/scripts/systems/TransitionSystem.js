/**
 * Transition System - Ported from merged2.html
 * 
 * Manages smooth transitions between scenes:
 * - Fade in/out
 * - Cross-fade
 * - Slide transitions
 * - Custom animation curves
 * - Scene state management
 */

export class TransitionSystem {
  constructor() {
    this.state = {
      active: false,
      type: 'fade',
      duration: 1000,
      currentScene: null,
      nextScene: null,
      progress: 0,
      
      // Transition types
      types: {
        fade: this._transitionFade.bind(this),
        crossFade: this._transitionCrossFade.bind(this),
        slide: this._transitionSlide.bind(this),
        instant: this._transitionInstant.bind(this)
      },
      
      // Overlay element
      overlay: null,
      
      // Callbacks
      onTransitionStart: null,
      onTransitionComplete: null
    };
  }

  /**
   * Initialize transition system
   */
  init() {
    // Create overlay element
    this.state.overlay = document.createElement('div');
    this.state.overlay.id = 'transition-overlay';
    this.state.overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: #000;
      opacity: 0;
      pointer-events: none;
      z-index: 9999;
      transition: opacity 0.5s ease;
    `;
    document.body.appendChild(this.state.overlay);
    
    console.log('🔄 Transition system initialized');
  }

  /**
   * Transition to new scene
   */
  async transition(fromScene, toScene, options = {}) {
    if (this.state.active) {
      console.warn('⚠️ Transition already in progress');
      return;
    }
    
    this.state.active = true;
    this.state.currentScene = fromScene;
    this.state.nextScene = toScene;
    this.state.type = options.type || 'fade';
    this.state.duration = options.duration || 1000;
    this.state.progress = 0;
    
    console.log(`🔄 Transitioning: ${fromScene?.name || 'none'} → ${toScene?.name || 'none'} (${this.state.type})`);
    
    // Callback
    if (this.state.onTransitionStart) {
      this.state.onTransitionStart(fromScene, toScene);
    }
    
    // Execute transition
    const transitionFn = this.state.types[this.state.type] || this.state.types.fade;
    await transitionFn(fromScene, toScene, options);
    
    this.state.active = false;
    this.state.progress = 1.0;
    
    // Callback
    if (this.state.onTransitionComplete) {
      this.state.onTransitionComplete(fromScene, toScene);
    }
    
    console.log(`✅ Transition complete: ${toScene?.name || 'none'}`);
  }

  /**
   * Fade transition
   */
  async _transitionFade(fromScene, toScene, options) {
    const overlay = this.state.overlay;
    
    // Fade out (to black)
    if (fromScene) {
      overlay.style.pointerEvents = 'auto';
      overlay.style.transition = `opacity ${this.state.duration / 2}ms ease`;
      overlay.style.opacity = '1';
      
      await this._wait(this.state.duration / 2);
      
      // Stop old scene
      if (fromScene.stop) fromScene.stop();
    }
    
    // Start new scene
    if (toScene) {
      if (toScene.start) await toScene.start();
    }
    
    // Fade in (from black)
    await this._wait(100);
    overlay.style.transition = `opacity ${this.state.duration / 2}ms ease`;
    overlay.style.opacity = '0';
    
    await this._wait(this.state.duration / 2);
    overlay.style.pointerEvents = 'none';
  }

  /**
   * Cross-fade transition
   */
  async _transitionCrossFade(fromScene, toScene, options) {
    // Start new scene with opacity 0
    if (toScene) {
      if (toScene.element) toScene.element.style.opacity = '0';
      if (toScene.start) await toScene.start();
    }
    
    // Cross-fade
    const startTime = performance.now();
    
    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / this.state.duration, 1.0);
        
        // Ease in-out
        const t = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        // Update opacities
        if (fromScene && fromScene.element) {
          fromScene.element.style.opacity = String(1 - t);
        }
        if (toScene && toScene.element) {
          toScene.element.style.opacity = String(t);
        }
        
        this.state.progress = progress;
        
        if (progress < 1.0) {
          requestAnimationFrame(animate);
        } else {
          // Stop old scene
          if (fromScene && fromScene.stop) fromScene.stop();
          resolve();
        }
      };
      
      animate();
    });
  }

  /**
   * Slide transition
   */
  async _transitionSlide(fromScene, toScene, options) {
    const direction = options.direction || 'left'; // left, right, up, down
    
    // Start new scene off-screen
    if (toScene) {
      if (toScene.element) {
        const offset = direction === 'left' ? '100%' :
                      direction === 'right' ? '-100%' :
                      direction === 'up' ? '100%' : '-100%';
        
        toScene.element.style.transform = direction === 'left' || direction === 'right'
          ? `translateX(${offset})`
          : `translateY(${offset})`;
      }
      if (toScene.start) await toScene.start();
    }
    
    // Slide animation
    const startTime = performance.now();
    
    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / this.state.duration, 1.0);
        
        // Ease out
        const t = 1 - Math.pow(1 - progress, 3);
        
        // Update positions
        if (fromScene && fromScene.element) {
          const offset = direction === 'left' ? '-100%' :
                        direction === 'right' ? '100%' :
                        direction === 'up' ? '-100%' : '100%';
          
          fromScene.element.style.transform = direction === 'left' || direction === 'right'
            ? `translateX(${t * parseFloat(offset)}%)`
            : `translateY(${t * parseFloat(offset)}%)`;
        }
        
        if (toScene && toScene.element) {
          toScene.element.style.transform = direction === 'left' || direction === 'right'
            ? `translateX(${(1 - t) * 100}%)`
            : `translateY(${(1 - t) * 100}%)`;
        }
        
        this.state.progress = progress;
        
        if (progress < 1.0) {
          requestAnimationFrame(animate);
        } else {
          // Stop old scene
          if (fromScene && fromScene.stop) fromScene.stop();
          resolve();
        }
      };
      
      animate();
    });
  }

  /**
   * Instant transition (no animation)
   */
  async _transitionInstant(fromScene, toScene, options) {
    if (fromScene && fromScene.stop) fromScene.stop();
    if (toScene && toScene.start) await toScene.start();
  }

  /**
   * Wait helper
   */
  _wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Set callbacks
   */
  setCallbacks(callbacks) {
    if (callbacks.onTransitionStart) this.state.onTransitionStart = callbacks.onTransitionStart;
    if (callbacks.onTransitionComplete) this.state.onTransitionComplete = callbacks.onTransitionComplete;
  }

  /**
   * Get current state
   */
  getState() {
    return {
      active: this.state.active,
      type: this.state.type,
      progress: this.state.progress,
      currentScene: this.state.currentScene?.name || null,
      nextScene: this.state.nextScene?.name || null
    };
  }
}

// Singleton instance
export const transitionSystem = new TransitionSystem();
export default transitionSystem;


