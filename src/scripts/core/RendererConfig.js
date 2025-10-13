/**
 * Renderer Configuration
 * Extracted from merged2.html lines 22579-22650 (~71 lines)
 * 
 * WebGL renderer setup and configuration
 * 
 * Components:
 * - Renderer initialization
 * - Output color space configuration
 * - Tone mapping setup
 * - Shadow map configuration
 * 
 * Dependencies:
 * - THREE.js
 */

import * as THREE from 'three';

/**
 * Setup renderer with optimal settings
 * @param {THREE.WebGLRenderer} renderer - WebGL renderer
 */
export function setupRenderer(renderer) {
  if (!renderer) return;
  
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = false;
  renderer.setClearColor(0xf6f7fb, 1);
  renderer.autoClear = true;
  renderer.autoClearStencil = true;
  renderer.localClippingEnabled = true;
  
  console.log('[RENDERER] Configured:', {
    colorSpace: renderer.outputColorSpace,
    toneMapping: renderer.toneMapping,
    shadows: renderer.shadowMap.enabled
  });
}

/**
 * Create WebGL renderer
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Object} options - Renderer options
 * @returns {THREE.WebGLRenderer} Renderer
 */
export function createRenderer(canvas, options = {}) {
  const {
    antialias = true,
    stencil = true,
    alpha = false,
    powerPreference = 'high-performance'
  } = options;
  
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias,
    stencil,
    alpha,
    powerPreference
  });
  
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  setupRenderer(renderer);
  
  return renderer;
}

/**
 * Update renderer settings
 * @param {THREE.WebGLRenderer} renderer - Renderer
 * @param {Object} settings - Settings to apply
 */
export function updateRendererSettings(renderer, settings) {
  if (!renderer) return;
  
  if (settings.toneMapping !== undefined) {
    renderer.toneMapping = settings.toneMapping;
  }
  
  if (settings.toneMappingExposure !== undefined) {
    renderer.toneMappingExposure = settings.toneMappingExposure;
  }
  
  if (settings.shadowsEnabled !== undefined) {
    renderer.shadowMap.enabled = settings.shadowsEnabled;
  }
  
  if (settings.clearColor !== undefined) {
    renderer.setClearColor(settings.clearColor);
  }
  
  if (settings.outputColorSpace !== undefined) {
    renderer.outputColorSpace = settings.outputColorSpace;
  }
}

/**
 * Setup resize handler for renderer
 * @param {THREE.WebGLRenderer} renderer - Renderer
 * @param {THREE.Camera} camera - Camera
 * @param {Function} onResize - Optional resize callback
 */
export function setupRendererResize(renderer, camera, onResize) {
  window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    renderer.setSize(width, height);
    
    if (camera.isPerspectiveCamera) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    } else if (camera.isOrthographicCamera) {
      // Update orthographic camera frustum
      const aspect = width / height;
      const viewSize = 10;
      camera.left = -viewSize * aspect;
      camera.right = viewSize * aspect;
      camera.top = viewSize;
      camera.bottom = -viewSize;
      camera.updateProjectionMatrix();
    }
    
    if (onResize) {
      onResize(width, height);
    }
  });
}

export default {
  setupRenderer,
  createRenderer,
  updateRendererSettings,
  setupRendererResize
};



