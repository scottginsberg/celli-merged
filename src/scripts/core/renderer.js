/**
 * Renderer Module
 * Creates and configures the Three.js WebGL renderer
 */

import * as THREE from 'three';
import config from '../config.js';

export function createRenderer() {
  const renderer = new THREE.WebGLRenderer(config.renderer);
  
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, config.renderer.maxPixelRatio));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = config.scene.toneMappingExposure;
  renderer.setClearColor(config.scene.backgroundColor, 1);
  
  // Append to DOM
  const app = document.getElementById('app');
  app.appendChild(renderer.domElement);
  
  // Handle window resize
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    // TODO: Update camera aspect ratio if needed
  });
  
  console.log('✓ Renderer created');
  
  return renderer;
}


