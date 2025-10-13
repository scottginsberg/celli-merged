/**
 * Animation Loop Module
 * Main render loop and time management
 */

import * as THREE from 'three';

const clock = new THREE.Clock();
let running = false;
let totalTime = 0;

export function startAnimationLoop(renderer, scene, camera) {
  running = true;
  
  function animate() {
    if (!running) return;
    
    const delta = clock.getDelta();
    totalTime += delta;
    
    // TODO: Update all animated systems here:
    // - Black hole shader uniforms
    // - Voxel animations
    // - Shape morphing
    // - Post-processing effects
    // - UI animations
    
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  
  animate();
  console.log('✓ Animation loop started');
}

export function stopAnimationLoop() {
  running = false;
}

export function getTotalTime() {
  return totalTime;
}


