/**
 * Scene Setup Module
 * Initializes the Three.js scene and camera
 */

import * as THREE from 'three';
import config from '../config.js';

export function initScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(config.scene.backgroundColor);
  
  // Orthographic camera for 2D-style rendering
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 10);
  camera.position.set(0, 0, 2);
  camera.lookAt(0, 0, 0);
  
  console.log('✓ Scene initialized');
  
  return { scene, camera };
}

/**
 * TODO: Extract remaining scene setup from merged2.html:
 * - Black hole mesh and shader
 * - Color triangle shader mesh
 * - Voxel system (CELLI letters)
 * - Shape morphing spheres
 * - Post-processing composer setup
 */


