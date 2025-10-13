/**
 * Random & Noise Utilities
 * Random number generation and noise functions
 */

/**
 * Random float between min and max
 */
export function randFloat(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Random integer between min and max (inclusive)
 */
export function randInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

/**
 * Random boolean with given probability
 */
export function randBool(probability = 0.5) {
  return Math.random() < probability;
}

/**
 * Random element from array
 */
export function randElement(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Shuffle array (Fisher-Yates)
 */
export function shuffle(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Random hex color
 */
export function randColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

/**
 * Random UUID v4
 */
export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Seeded random number generator
 */
export class SeededRandom {
  constructor(seed = Date.now()) {
    this.seed = seed;
  }
  
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  nextFloat(min, max) {
    return min + this.next() * (max - min);
  }
  
  nextInt(min, max) {
    return Math.floor(min + this.next() * (max - min + 1));
  }
}

/**
 * Perlin noise (simple implementation)
 */
export function noise(x, y = 0) {
  const hash = (n) => {
    n = Math.sin(n) * 43758.5453123;
    return n - Math.floor(n);
  };
  
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  
  const a = hash(ix + iy * 57);
  const b = hash((ix + 1) + iy * 57);
  const c = hash(ix + (iy + 1) * 57);
  const d = hash((ix + 1) + (iy + 1) * 57);
  
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  
  return a * (1 - u) * (1 - v) +
         b * u * (1 - v) +
         c * (1 - u) * v +
         d * u * v;
}

/**
 * Random normal distribution (Box-Muller transform)
 */
export function randNormal(mean = 0, stdDev = 1) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * stdDev + mean;
}

export default {
  randFloat,
  randInt,
  randBool,
  randElement,
  shuffle,
  randColor,
  uuid,
  SeededRandom,
  noise,
  randNormal
};



