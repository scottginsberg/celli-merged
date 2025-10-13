/**
 * Camera & Controls System
 * Extracted from merged2.html lines 22665-22800 (~135 lines)
 * 
 * Camera initialization and orbit controls setup
 * 
 * Components:
 * - Camera creation and configuration
 * - OrbitControls setup
 * - Camera persistence (save/load)
 * - View helpers (worldPos, localPos, etc.)
 * 
 * Dependencies:
 * - THREE.js
 * - OrbitControls
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Initialize camera and controls
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @returns {Object} {camera, controls}
 */
export function initCameraControls(canvas) {
  // Create perspective camera
  const camera = new THREE.PerspectiveCamera(
    60, // FOV
    window.innerWidth / window.innerHeight, // aspect
    0.1, // near
    2000 // far
  );
  
  // Position camera for good initial view
  camera.position.set(8, 10, 14);
  
  // Create orbit controls
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 3, 0);
  controls.enableDamping = true;
  controls.enabled = true;
  controls.enableRotate = true;
  controls.enablePan = true;
  
  console.log('[CAMERA] Initialized - position:', camera.position.toArray());
  
  // Setup change listener
  controls.addEventListener('change', () => {
    if (window.needsRender !== undefined) {
      window.needsRender = true;
    }
    
    // Update array value sprite placement on camera change
    try {
      const Store = window.Store;
      if (Store) {
        const arrays = Object.values(Store.getState().arrays || {});
        arrays.forEach(a => {
          if (!a.hidden && a._frame && window.Scene?.updateArrayValueSpritePlacement) {
            window.Scene.updateArrayValueSpritePlacement(a);
          }
        });
      }
    } catch (e) {}
  });
  
  return { camera, controls };
}

/**
 * Capture camera state for persistence
 * @param {THREE.Camera} camera - Camera
 * @param {OrbitControls} controls - Orbit controls
 * @returns {Object} Camera state
 */
export function captureCamera(camera, controls) {
  try {
    return {
      pos: camera?.position?.toArray?.() || [10, 8, 13],
      target: controls?.target?.toArray?.() || [0, 0, 0],
      fov: camera?.fov || 60,
      type: camera?.isPerspectiveCamera ? 'perspective' : 'orthographic'
    };
  } catch (e) {
    return null;
  }
}

/**
 * Restore camera state
 * @param {THREE.Camera} camera - Camera
 * @param {OrbitControls} controls - Orbit controls
 * @param {Object} state - Saved camera state
 */
export function restoreCamera(camera, controls, state) {
  if (!state) return;
  
  try {
    camera.position.fromArray(state.pos || [10, 8, 13]);
    controls.target.fromArray(state.target || [0, 0, 0]);
    
    if (state.fov) {
      camera.fov = +state.fov;
      camera.updateProjectionMatrix();
    }
    
    controls.update();
  } catch (e) {
    console.warn('Failed to restore camera:', e);
  }
}

/**
 * Suspend orbit controls (for drag operations)
 */
let orbitSuspendDepth = 0;
let orbitPrevState = null;

export function suspendOrbitControls(controls) {
  if (!controls) return;
  
  if (orbitSuspendDepth === 0) {
    orbitPrevState = {
      enabled: controls.enabled,
      rotate: controls.enableRotate,
      pan: controls.enablePan,
      zoom: controls.enableZoom
    };
  }
  
  orbitSuspendDepth++;
  controls.enabled = false;
  controls.enableRotate = false;
  controls.enablePan = false;
  if (typeof controls.enableZoom === 'boolean') controls.enableZoom = false;
}

/**
 * Resume orbit controls
 */
export function resumeOrbitControls(controls) {
  if (!controls || orbitSuspendDepth === 0) return;
  
  orbitSuspendDepth--;
  
  if (orbitSuspendDepth === 0 && orbitPrevState) {
    controls.enabled = orbitPrevState.enabled;
    controls.enableRotate = orbitPrevState.rotate;
    controls.enablePan = orbitPrevState.pan;
    if (typeof orbitPrevState.zoom === 'boolean') controls.enableZoom = orbitPrevState.zoom;
    orbitPrevState = null;
  }
}

/**
 * Setup window resize handler
 * @param {THREE.Camera} camera - Camera
 * @param {THREE.WebGLRenderer} renderer - Renderer
 * @param {Function} updateComposer - Optional composer update function
 */
export function setupResizeHandler(camera, renderer, updateComposer) {
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    if (updateComposer) {
      updateComposer(window.innerWidth, window.innerHeight);
    }
    
    if (window.needsRender !== undefined) {
      window.needsRender = true;
    }
  });
}

/**
 * Calculate world position from array cell coordinates
 * @param {Object} arr - Array object
 * @param {number} x - Cell X
 * @param {number} y - Cell Y
 * @param {number} z - Cell Z
 * @returns {THREE.Vector3} World position
 */
export function worldPos(arr, x, y, z) {
  const localPos = window.Scene?.localPos || function(arr, x, y, z) {
    const scale = arr.params?.voxelScale || 1;
    const X = arr.size.x, Y = arr.size.y, Z = arr.size.z;
    return new THREE.Vector3(
      (x - X / 2 + 0.5) * scale,
      ((Y - 1 - y) - Y / 2 + 0.5) * scale,
      ((Z - 1 - z) - Z / 2 + 0.5) * scale
    );
  };
  
  const base = localPos(arr, x, y, z);
  const off = arr.offset || { x: 0, y: 0, z: 0 };
  base.x += off.x;
  base.y += off.y;
  base.z += off.z;
  return base;
}

/**
 * Convert world position to cell coordinates
 * @param {Object} arr - Array object
 * @param {THREE.Vector3} world - World position
 * @returns {Object} Cell coordinates {x, y, z}
 */
export function worldToCellCoord(arr, world) {
  const vec = world.clone ? world.clone() : new THREE.Vector3(world.x, world.y, world.z);
  
  if (arr._frame) {
    arr._frame.worldToLocal(vec);
  } else {
    const off = arr.offset || { x: 0, y: 0, z: 0 };
    vec.x -= off.x;
    vec.y -= off.y;
    vec.z -= off.z;
  }
  
  const X = arr.size.x, Y = arr.size.y, Z = arr.size.z;
  const scale = arr.params?.voxelScale || 1;
  const inv = scale !== 0 ? 1 / scale : 1;
  
  const lx = vec.x * inv;
  const ly = vec.y * inv;
  const lz = vec.z * inv;
  
  const x = Math.round(lx + X / 2 - 0.5);
  const y = Math.round((Y / 2 - 0.5) - ly);
  const z = Math.round((Z / 2 - 0.5) - lz);
  
  return { x, y, z };
}

/**
 * Check if coordinates are within array bounds
 */
export function withinBounds(arr, coord) {
  return coord.x >= 0 && coord.y >= 0 && coord.z >= 0 &&
         coord.x < arr.size.x && coord.y < arr.size.y && coord.z < arr.size.z;
}

// Make globally available for compatibility
if (typeof window !== 'undefined') {
  window.suspendOrbitControls = (controls) => suspendOrbitControls(controls || window.controls);
  window.resumeOrbitControls = (controls) => resumeOrbitControls(controls || window.controls);
}

export default {
  initCameraControls,
  captureCamera,
  restoreCamera,
  suspendOrbitControls,
  resumeOrbitControls,
  setupResizeHandler,
  worldPos,
  worldToCellCoord,
  withinBounds
};

