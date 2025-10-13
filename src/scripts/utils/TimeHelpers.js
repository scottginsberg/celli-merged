/**
 * Time & Clock Utilities
 * Timing, delays, and time-based helpers
 */

/**
 * Get current time in milliseconds
 */
export function nowMs() {
  return Date.now();
}

/**
 * Get current time in seconds
 */
export function nowSec() {
  return Date.now() / 1000;
}

/**
 * Performance timestamp
 */
export function perfNow() {
  return performance.now();
}

/**
 * Sleep/delay promise
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wait for condition with timeout
 */
export async function waitFor(condition, timeout = 5000, interval = 100) {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    if (await condition()) {
      return true;
    }
    await sleep(interval);
  }
  
  return false;
}

/**
 * Debounce with timestamp tracking
 */
export function debounceWithTime(fn, delay) {
  let timeoutId = null;
  let lastCall = 0;
  
  return function(...args) {
    lastCall = Date.now();
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Frame delta tracker
 */
export class DeltaTimer {
  constructor() {
    this.lastTime = performance.now();
    this.delta = 0;
    this.elapsed = 0;
  }
  
  update() {
    const now = performance.now();
    this.delta = now - this.lastTime;
    this.lastTime = now;
    this.elapsed += this.delta;
    return this.delta;
  }
  
  getDelta() {
    return this.delta;
  }
  
  getElapsed() {
    return this.elapsed;
  }
  
  reset() {
    this.lastTime = performance.now();
    this.delta = 0;
    this.elapsed = 0;
  }
}

/**
 * Stopwatch
 */
export class Stopwatch {
  constructor() {
    this.startTime = 0;
    this.running = false;
    this.elapsed = 0;
  }
  
  start() {
    if (!this.running) {
      this.startTime = performance.now();
      this.running = true;
    }
  }
  
  stop() {
    if (this.running) {
      this.elapsed = performance.now() - this.startTime;
      this.running = false;
    }
    return this.elapsed;
  }
  
  lap() {
    if (this.running) {
      return performance.now() - this.startTime;
    }
    return this.elapsed;
  }
  
  reset() {
    this.startTime = 0;
    this.elapsed = 0;
    this.running = false;
  }
}

/**
 * Format milliseconds to readable string
 */
export function formatDuration(ms) {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.round((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

/**
 * Timestamp to readable date
 */
export function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString();
}

export default {
  nowMs,
  nowSec,
  perfNow,
  sleep,
  waitFor,
  debounceWithTime,
  DeltaTimer,
  Stopwatch,
  formatDuration,
  formatTimestamp
};



