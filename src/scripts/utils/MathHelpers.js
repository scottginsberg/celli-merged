/**
 * Math Helper Functions
 * Extracted from merged2.html (various locations)
 * 
 * Mathematical utilities and easing functions
 */

/**
 * Ease out back (overshoot easing)
 */
export function easeOutBack(t, s = 1.70158) {
  const tt = t - 1;
  return (tt * tt * ((s + 1) * tt + s) + 1);
}

/**
 * Smooth step interpolation
 */
export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Clamp value between min and max
 */
export function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}

/**
 * Linear interpolation
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Normalize vector
 */
export function normalize(v) {
  const l = Math.hypot(v[0], v[1], v[2]);
  return l ? [v[0] / l, v[1] / l, v[2] / l] : [0, 1, 0];
}

/**
 * Cross product
 */
export function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

/**
 * Dot product
 */
export function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * Vector length
 */
export function length(v) {
  return Math.hypot(v[0], v[1], v[2]);
}

/**
 * Rotate vector around X axis
 */
export function rotX(v, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c];
}

/**
 * Rotate vector around Y axis
 */
export function rotY(v, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
}

/**
 * Rotate vector around Z axis
 */
export function rotZ(v, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]];
}

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
 * Convert degrees to radians
 */
export function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function radToDeg(radians) {
  return radians * (180 / Math.PI);
}

/**
 * Snap value to grid
 */
export function snapToGrid(value, gridSize) {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Map value from one range to another
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
  return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
}

export default {
  easeOutBack,
  smoothstep,
  clamp,
  lerp,
  normalize,
  cross,
  dot,
  length,
  rotX,
  rotY,
  rotZ,
  randFloat,
  randInt,
  degToRad,
  radToDeg,
  snapToGrid,
  mapRange
};

