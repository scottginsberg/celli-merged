/**
 * Animation Loop Manager
 * Extracted from merged2.html (various locations)
 * 
 * Main animation loop and frame management
 * 
 * Components:
 * - Animation loop setup
 * - Frame timing
 * - Render triggers
 * - Loop control (start/stop)
 * 
 * Dependencies:
 * - THREE.js
 * - Scene (renderer, camera, controls)
 */

let isAnimating = false;
let rafId = 0;
let needsRender = false;
let lastFrameTime = 0;

/**
 * Start animation loop
 */
export function startLoop(callback) {
  if (isAnimating) return;
  isAnimating = true;
  lastFrameTime = performance.now();
  
  function animate(time) {
    if (!isAnimating) return;
    
    const deltaTime = time - lastFrameTime;
    lastFrameTime = time;
    
    if (callback) {
      callback(time, deltaTime);
    }
    
    rafId = requestAnimationFrame(animate);
  }
  
  rafId = requestAnimationFrame(animate);
  console.log('[ANIMATION] Loop started');
}

/**
 * Stop animation loop
 */
export function stopLoop() {
  if (!isAnimating) return;
  cancelAnimationFrame(rafId);
  isAnimating = false;
  console.log('[ANIMATION] Loop stopped');
}

/**
 * Request render on next frame
 */
export function requestRender() {
  needsRender = true;
}

/**
 * Check if render is needed
 */
export function isRenderNeeded() {
  return needsRender;
}

/**
 * Clear render request
 */
export function clearRenderRequest() {
  needsRender = false;
}

/**
 * Check if animating
 */
export function isLoopRunning() {
  return isAnimating;
}

/**
 * Get delta time since last frame (ms)
 */
export function getDeltaTime() {
  const now = performance.now();
  const delta = now - lastFrameTime;
  lastFrameTime = now;
  return delta;
}

/**
 * Create standard animation loop with automatic rendering
 * @param {THREE.WebGLRenderer} renderer - Renderer
 * @param {THREE.Scene} scene - Scene
 * @param {THREE.Camera} camera - Camera
 * @param {Object} controls - Orbit controls (optional)
 * @param {Function} updateCallback - Called each frame with (time, delta)
 */
export function createAnimationLoop(renderer, scene, camera, controls, updateCallback) {
  return startLoop((time, deltaTime) => {
    // Update controls
    if (controls && controls.update) {
      controls.update();
    }
    
    // Call user update
    if (updateCallback) {
      updateCallback(time, deltaTime);
    }
    
    // Render if needed
    if (needsRender || (controls && controls.enableDamping)) {
      renderer.render(scene, camera);
      needsRender = false;
    }
  });
}

// Make globally available
if (typeof window !== 'undefined') {
  window.startLoop = startLoop;
  window.stopLoop = stopLoop;
  window.needsRender = needsRender;
  Object.defineProperty(window, 'needsRender', {
    get: () => needsRender,
    set: (v) => { needsRender = v; },
    configurable: true
  });
}

export default {
  startLoop,
  stopLoop,
  requestRender,
  isRenderNeeded,
  clearRenderRequest,
  isLoopRunning,
  getDeltaTime,
  createAnimationLoop
};



