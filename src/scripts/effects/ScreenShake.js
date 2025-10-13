/**
 * Screen Shake Effect
 * 
 * Provides camera shake effects for impactful moments
 * Extracted from merged2.html
 */

export class ScreenShake {
  constructor(camera) {
    this.camera = camera;
    this.isShaking = false;
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeTime = 0;
    this.originalPosition = null;
  }

  /**
   * Start a screen shake effect
   * @param {number} intensity - Shake intensity (0-1)
   * @param {number} duration - Duration in milliseconds
   */
  start(intensity = 0.05, duration = 500) {
    if (!this.camera) {
      console.warn('ScreenShake: No camera provided');
      return;
    }

    this.isShaking = true;
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.shakeTime = 0;
    
    if (!this.originalPosition) {
      this.originalPosition = this.camera.position.clone();
    }
    
    console.log(`📳 Screen shake: intensity=${intensity}, duration=${duration}ms`);
  }

  /**
   * Update shake effect (call in animation loop)
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    if (!this.isShaking) return;

    this.shakeTime += deltaTime * 1000; // Convert to ms

    if (this.shakeTime >= this.shakeDuration) {
      this.stop();
      return;
    }

    // Calculate shake progress (0 to 1)
    const progress = this.shakeTime / this.shakeDuration;
    
    // Ease out shake intensity
    const currentIntensity = this.shakeIntensity * (1 - progress);

    // Apply random offset
    const offsetX = (Math.random() - 0.5) * currentIntensity * 2;
    const offsetY = (Math.random() - 0.5) * currentIntensity * 2;
    const offsetZ = (Math.random() - 0.5) * currentIntensity * 0.5;

    if (this.originalPosition) {
      this.camera.position.set(
        this.originalPosition.x + offsetX,
        this.originalPosition.y + offsetY,
        this.originalPosition.z + offsetZ
      );
    }
  }

  /**
   * Stop the shake effect
   */
  stop() {
    if (this.originalPosition && this.camera) {
      this.camera.position.copy(this.originalPosition);
    }
    
    this.isShaking = false;
    this.shakeTime = 0;
    this.originalPosition = null;
  }

  /**
   * Check if currently shaking
   * @returns {boolean}
   */
  active() {
    return this.isShaking;
  }
}

