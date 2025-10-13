/**
 * Texture Helper Functions
 * Canvas texture creation and manipulation
 */

import * as THREE from 'three';

/**
 * Create canvas texture from text
 * @param {string} text - Text to render
 * @param {Object} options - Rendering options
 * @returns {THREE.CanvasTexture} Canvas texture
 */
export function createTextTexture(text, options = {}) {
  const {
    fontSize = 48,
    fontFamily = 'Roboto Mono, monospace',
    fontWeight = '600',
    color = '#000000',
    backgroundColor = 'transparent',
    padding = 8,
    textAlign = 'center',
    textBaseline = 'middle'
  } = options;
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Measure text
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  
  // Set canvas size
  canvas.width = Math.max(1, Math.ceil(textWidth + padding * 2));
  canvas.height = Math.max(1, Math.ceil(fontSize + padding * 2));
  
  // Draw background
  if (backgroundColor !== 'transparent') {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  // Draw text
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;
  
  const x = textAlign === 'center' ? canvas.width / 2 : padding;
  const y = textBaseline === 'middle' ? canvas.height / 2 : padding + fontSize / 2;
  
  ctx.fillText(text, x, y);
  
  // Create texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  
  return texture;
}

/**
 * Create rounded rectangle canvas
 */
export function createRoundedRectCanvas(width, height, radius, options = {}) {
  const {
    fillStyle = '#ffffff',
    strokeStyle = null,
    lineWidth = 1
  } = options;
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Draw rounded rectangle
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.arcTo(width, 0, width, height, radius);
  ctx.arcTo(width, height, 0, height, radius);
  ctx.arcTo(0, height, 0, 0, radius);
  ctx.arcTo(0, 0, width, 0, radius);
  ctx.closePath();
  
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
  
  return canvas;
}

/**
 * Dispose texture safely
 */
export function disposeTexture(texture) {
  if (texture) {
    try {
      texture.dispose();
    } catch (e) {
      console.warn('Texture disposal failed:', e);
    }
  }
}

/**
 * Clone texture
 */
export function cloneTexture(texture) {
  if (!texture) return null;
  try {
    return texture.clone();
  } catch (e) {
    console.warn('Texture clone failed:', e);
    return null;
  }
}

/**
 * Create sprite from canvas
 */
export function createSpriteFromCanvas(canvas, scale = 1) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: true,
    depthWrite: false
  });
  material.toneMapped = false;
  
  const sprite = new THREE.Sprite(material);
  const aspect = canvas.width / canvas.height;
  sprite.scale.set(scale * aspect, scale, 1);
  
  return sprite;
}

/**
 * Update canvas texture
 */
export function updateCanvasTexture(texture) {
  if (texture && texture.isCanvasTexture) {
    texture.needsUpdate = true;
  }
}

export default {
  createTextTexture,
  createRoundedRectCanvas,
  disposeTexture,
  cloneTexture,
  createSpriteFromCanvas,
  updateCanvasTexture
};



