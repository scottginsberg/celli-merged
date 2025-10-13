/**
 * Shatter Overlay Effect
 * 
 * Creates a screen-shatter visual effect with cracks and pixel burst
 * Extracted from merged2.html CSS animations (lines 379-423)
 */

export class ShatterOverlay {
  constructor() {
    this.overlay = null;
    this.active = false;
  }

  /**
   * Initialize the shatter overlay element
   */
  init() {
    if (this.overlay) return;

    // Create overlay container
    this.overlay = document.createElement('div');
    this.overlay.className = 'shatter-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 180;
      opacity: 0;
      mix-blend-mode: screen;
    `;

    // Create cracks layer
    const cracks = document.createElement('div');
    cracks.className = 'shatter-cracks';
    cracks.style.cssText = `
      position: absolute;
      inset: 0;
      background-image: 
        repeating-linear-gradient(0deg, #0ff 0px, #0ff 2px, transparent 2px, transparent 18px),
        repeating-linear-gradient(90deg, #0ff 0px, #0ff 2px, transparent 2px, transparent 18px);
      background-size: 100% 100%;
      opacity: 0;
      filter: drop-shadow(0 0 8px rgba(0,255,255,0.8)) drop-shadow(0 0 20px rgba(0,255,255,0.4));
    `;

    // Create pixels layer
    const pixels = document.createElement('div');
    pixels.className = 'shatter-pixels';
    pixels.style.cssText = `
      position: absolute;
      inset: 0;
      opacity: 0;
      background-image: 
        radial-gradient(circle, #0ff 1px, transparent 1px),
        radial-gradient(circle, #00ffaa 1px, transparent 1px);
      background-size: 8px 8px, 10px 10px;
      background-position: 0 0, 5px 5px;
      filter: blur(0.5px);
    `;

    this.overlay.appendChild(cracks);
    this.overlay.appendChild(pixels);
    document.body.appendChild(this.overlay);

    console.log('✨ ShatterOverlay initialized');
  }

  /**
   * Trigger the shatter effect
   * @param {number} duration - Duration in milliseconds (default: 2000)
   */
  trigger(duration = 2000) {
    if (!this.overlay) {
      this.init();
    }

    if (this.active) {
      console.warn('Shatter effect already active');
      return;
    }

    this.active = true;
    console.log('💥 Shatter effect triggered');

    // Activate overlay
    this.overlay.classList.add('active');

    // Reset and fade out after duration
    setTimeout(() => {
      this.fadeOut();
    }, duration);
  }

  /**
   * Fade out and clean up the effect
   */
  fadeOut() {
    if (!this.overlay) return;

    this.overlay.classList.remove('active');
    this.overlay.classList.add('fade');

    setTimeout(() => {
      this.overlay.classList.remove('fade');
      this.active = false;
    }, 1300);
  }

  /**
   * Clean up and remove overlay
   */
  destroy() {
    if (this.overlay && this.overlay.parentElement) {
      this.overlay.parentElement.removeChild(this.overlay);
    }
    this.overlay = null;
    this.active = false;
  }

  /**
   * Check if effect is currently active
   * @returns {boolean}
   */
  isActive() {
    return this.active;
  }
}

// Create singleton instance
export const shatterOverlay = new ShatterOverlay();

