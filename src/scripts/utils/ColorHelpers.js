/**
 * Color Helper Functions
 * Extracted from merged2.html (various locations)
 * 
 * Color manipulation and conversion utilities
 */

import * as THREE from 'three';

/**
 * Color constants for UI and cells
 */
export const COLORS = {
  empty: 0xffffff,        // empty cells: clean white
  emptyBorder: 0xe5e7eb,  // empty border: light gray
  filled: 0x3b82f6,       // data cells: vibrant blue
  formula: 0x16a34a,      // formulas: dark green
  emitted: 0x86efac,      // emitted values: light green
  ghost: 0xf3f4f6,        // ghost layers: very light gray
  ghostBorder: 0xd1d5db,  // ghost border: medium gray
  focus: 0xf59e0b,        // focus highlight: amber
  frame: 0x374151,        // array frame: dark gray
  grab: 0x06b6d4          // grab handle: cyan
};

/**
 * Convert hex color to CSS string
 */
export function hexToCSS(hex) {
  if (typeof hex === 'string') return hex;
  if (typeof hex === 'number') {
    return '#' + hex.toString(16).padStart(6, '0');
  }
  return '#ffffff';
}

/**
 * Convert CSS color string to THREE.Color
 */
export function cssToColor(css) {
  const color = new THREE.Color();
  try {
    color.set(css);
  } catch (e) {
    color.set(0xffffff);
  }
  return color;
}

/**
 * Lighten color (HSL offset)
 */
export function lightenColor(color, amount = 0.2) {
  const c = color.clone();
  c.offsetHSL(0, 0, amount);
  return c;
}

/**
 * Darken color (HSL offset)
 */
export function darkenColor(color, amount = 0.2) {
  const c = color.clone();
  c.offsetHSL(0, 0, -amount);
  return c;
}

/**
 * Saturate color
 */
export function saturateColor(color, amount = 0.2) {
  const c = color.clone();
  c.offsetHSL(0, amount, 0);
  return c;
}

/**
 * Desaturate color
 */
export function desaturateColor(color, amount = 0.2) {
  const c = color.clone();
  c.offsetHSL(0, -amount, 0);
  return c;
}

/**
 * Lerp between two colors
 */
export function lerpColor(color1, color2, t) {
  return color1.clone().lerp(color2, t);
}

/**
 * Get text color (black or white) based on background brightness
 */
export function getTextColor(bgColor) {
  const hex = typeof bgColor === 'number' ? bgColor : parseInt(String(bgColor).replace('#', ''), 16);
  const r = (hex >> 16) & 255;
  const g = (hex >> 8) & 255;
  const b = hex & 255;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#1f2937' : '#ffffff';
}

/**
 * Parse color from various formats
 */
export function parseColor(value) {
  if (typeof value === 'number') {
    return new THREE.Color(value);
  }
  if (typeof value === 'string') {
    try {
      return new THREE.Color(value);
    } catch (e) {
      return new THREE.Color(0xffffff);
    }
  }
  if (value && typeof value === 'object' && value.r !== undefined) {
    return new THREE.Color(value.r, value.g, value.b);
  }
  return new THREE.Color(0xffffff);
}

/**
 * Tint ghost color from base color
 */
export function tintGhostColor(baseColor) {
  const ghost = new THREE.Color(COLORS.ghost);
  ghost.convertSRGBToLinear();
  const base = baseColor.clone();
  base.convertSRGBToLinear();
  return ghost.lerp(base, 0.65);
}

/**
 * Convert color to linear color space
 */
export function toLinearColor(color) {
  const c = parseColor(color);
  c.convertSRGBToLinear();
  return c;
}

/**
 * Convert color to sRGB color space
 */
export function toSRGBColor(color) {
  const c = parseColor(color);
  c.convertLinearToSRGB();
  return c;
}

export default {
  COLORS,
  hexToCSS,
  cssToColor,
  lightenColor,
  darkenColor,
  saturateColor,
  desaturateColor,
  lerpColor,
  getTextColor,
  parseColor,
  tintGhostColor,
  toLinearColor,
  toSRGBColor
};



