/**
 * Performance Utilities
 * Helpers for optimization and profiling
 */

/**
 * Debounce function calls
 */
export function debounce(fn, delay) {
  let timeoutId = null;
  return function(...args) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttle function calls
 */
export function throttle(fn, limit) {
  let inThrottle = false;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Request idle callback with fallback
 */
export function requestIdleCallback(callback) {
  if (typeof window.requestIdleCallback !== 'undefined') {
    return window.requestIdleCallback(callback);
  }
  return setTimeout(callback, 1);
}

/**
 * Simple performance timer
 */
export class PerfTimer {
  constructor(name) {
    this.name = name;
    this.start = 0;
  }
  
  begin() {
    this.start = performance.now();
  }
  
  end() {
    const duration = performance.now() - this.start;
    console.log(`[PERF] ${this.name}: ${duration.toFixed(2)}ms`);
    return duration;
  }
  
  measure(fn) {
    this.begin();
    const result = fn();
    this.end();
    return result;
  }
}

/**
 * Frame rate counter
 */
export class FPSCounter {
  constructor(sampleSize = 60) {
    this.sampleSize = sampleSize;
    this.frames = [];
    this.lastTime = performance.now();
  }
  
  update() {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;
    
    if (delta > 0) {
      this.frames.push(1000 / delta);
      if (this.frames.length > this.sampleSize) {
        this.frames.shift();
      }
    }
  }
  
  getFPS() {
    if (this.frames.length === 0) return 0;
    const sum = this.frames.reduce((a, b) => a + b, 0);
    return sum / this.frames.length;
  }
}

/**
 * Memory usage helper
 */
export function getMemoryUsage() {
  if (performance.memory) {
    return {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576),
      total: Math.round(performance.memory.totalJSHeapSize / 1048576),
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
    };
  }
  return null;
}

/**
 * RAF with automatic cleanup
 */
export class AnimationFrame {
  constructor(callback) {
    this.callback = callback;
    this.id = null;
    this.running = false;
  }
  
  start() {
    if (this.running) return;
    this.running = true;
    
    const loop = (time) => {
      if (!this.running) return;
      this.callback(time);
      this.id = requestAnimationFrame(loop);
    };
    
    this.id = requestAnimationFrame(loop);
  }
  
  stop() {
    this.running = false;
    if (this.id) {
      cancelAnimationFrame(this.id);
      this.id = null;
    }
  }
}

export default {
  debounce,
  throttle,
  requestIdleCallback,
  PerfTimer,
  FPSCounter,
  getMemoryUsage,
  AnimationFrame
};



