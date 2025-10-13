/**
 * Array Management & 3D Transform System
 * Extracted from merged2.html lines 30000-31000 (~1000 lines)
 * 
 * Complete array positioning, rotation, and transformation system
 * 
 * Components:
 * - setArrayOffset: Position arrays in 3D space
 * - rotateArrayAround: Rotate arrays around a pivot point
 * - cellWorldPos: Convert cell coordinates to world space
 * - refreshArray: Update array visuals
 * - Array spawning and management
 * 
 * Dependencies:
 * - THREE.js
 * - Store (state management)
 * - Scene (rendering)
 */

import * as THREE from 'three';

/**
 * Rotate array around a world-space pivot by 90-degree steps per axis
 * @param {Object} arr - Array object to rotate
 * @param {THREE.Vector3} pivotWorld - World-space pivot point
 * @param {number} stepsX - Number of 90° rotations around X axis
 * @param {number} stepsY - Number of 90° rotations around Y axis
 * @param {number} stepsZ - Number of 90° rotations around Z axis
 */
export function rotateArrayAround(arr, pivotWorld, stepsX = 0, stepsY = 0, stepsZ = 0) {
  if (!arr?._frame) return;
  
  const snap = (v) => Math.round(v);
  
  const apply = (axis, steps) => {
    const n = ((steps % 4) + 4) % 4;
    if (n === 0) return;
    
    const angle = n * (Math.PI / 2);
    const pos = arr._frame.position.clone().sub(pivotWorld);
    pos.applyAxisAngle(axis, angle).add(pivotWorld);
    arr._frame.position.copy(pos);
    arr._frame.rotateOnWorldAxis(axis, angle);
    
    // Snap position to integer grid after each axis to minimize drift
    arr._frame.position.set(
      snap(arr._frame.position.x),
      snap(arr._frame.position.y),
      snap(arr._frame.position.z)
    );
  };
  
  apply(new THREE.Vector3(1, 0, 0), stepsX);
  apply(new THREE.Vector3(0, 1, 0), stepsY);
  apply(new THREE.Vector3(0, 0, 1), stepsZ);
  
  // Persist offset for future renders
  arr.offset = {
    x: arr._frame.position.x,
    y: arr._frame.position.y,
    z: arr._frame.position.z
  };
  
  // Persist rotation for save
  try {
    arr.rotationQuat = arr._frame.quaternion.toArray();
    const rs = arr.rotationSteps || { x: 0, y: 0, z: 0 };
    arr.rotationSteps = {
      x: ((rs.x || 0) + (stepsX | 0)) % 4,
      y: ((rs.y || 0) + (stepsY | 0)) % 4,
      z: ((rs.z || 0) + (stepsZ | 0)) % 4,
    };
  } catch (e) {
    console.warn('Failed to persist rotation:', e);
  }
}

/**
 * Compute world position of a cell, respecting current frame transform
 * @param {Object} arr - Array object
 * @param {number} x - Cell X coordinate
 * @param {number} y - Cell Y coordinate
 * @param {number} z - Cell Z coordinate
 * @returns {THREE.Vector3} World position of the cell
 */
export function cellWorldPos(arr, x, y, z) {
  // Use Scene's localPos if available
  const localPos = window.Scene?.localPos || function(arr, x, y, z) {
    const scale = arr.params?.voxelScale || 1;
    const lx = (x - arr.size.x / 2 + 0.5) * scale;
    const ly = ((arr.size.y - 1 - y) - arr.size.y / 2 + 0.5) * scale;
    const lz = ((arr.size.z - 1 - z) - arr.size.z / 2 + 0.5) * scale;
    return new THREE.Vector3(lx, ly, lz);
  };
  
  const lp = localPos(arr, x, y, z).clone();
  
  if (arr._frame) {
    return arr._frame.localToWorld(lp);
  }
  
  const off = arr.offset || { x: 0, y: 0, z: 0 };
  lp.x += off.x;
  lp.y += off.y;
  lp.z += off.z;
  return lp;
}

/**
 * Convert world position to cell coordinates
 * @param {Object} arr - Array object
 * @param {THREE.Vector3} worldPos - World position
 * @returns {Object} Cell coordinates {x, y, z}
 */
export function worldPosToCell(arr, worldPos) {
  if (!arr) return null;
  
  let local = worldPos.clone();
  
  // Convert world position to local array space
  if (arr._frame) {
    arr._frame.worldToLocal(local);
  } else {
    const off = arr.offset || { x: 0, y: 0, z: 0 };
    local.x -= off.x;
    local.y -= off.y;
    local.z -= off.z;
  }
  
  const scale = arr.params?.voxelScale || 1;
  
  // Convert local position to cell indices
  const x = Math.floor(local.x / scale + arr.size.x / 2);
  const y = arr.size.y - 1 - Math.floor(local.y / scale + arr.size.y / 2);
  const z = arr.size.z - 1 - Math.floor(local.z / scale + arr.size.z / 2);
  
  return { x, y, z };
}

/**
 * Set array offset (position in 3D space)
 * @param {Object} arr - Array object
 * @param {Object} offset - New position {x, y, z}
 * @param {Object} opts - Options {interactive, _skipDock, _skipConnections}
 */
export function setArrayOffset(arr, offset, opts = {}) {
  if (!arr) return;
  
  const { interactive = false, _skipDock = false, _skipConnections = false } = opts;
  
  // Normalize offset
  const newOffset = {
    x: Number.isFinite(+offset.x) ? Math.round(+offset.x) : 0,
    y: Number.isFinite(+offset.y) ? Math.round(+offset.y) : 0,
    z: Number.isFinite(+offset.z) ? Math.round(+offset.z) : 0
  };
  
  // Update array offset
  arr.offset = newOffset;
  
  // Update frame position if it exists
  if (arr._frame) {
    arr._frame.position.set(newOffset.x, newOffset.y, newOffset.z);
  }
  
  // Handle docking (if not skipped)
  if (!_skipDock && window.Store) {
    try {
      const state = window.Store.getState();
      const dockGroupsByAnchor = state.dockGroupsByAnchor || new Map();
      const dockGroups = state.dockGroups || new Map();
      
      // Find dock groups that include this array
      dockGroupsByAnchor.forEach((groupId, anchorKey) => {
        const group = dockGroups.get(groupId);
        if (group && group.members && group.members.includes(arr.id)) {
          // Handle dock transform propagation
          if (group.mode === 'parent' && group.parentId === arr.id) {
            // This array is parent - move children
            group.members.forEach(memberId => {
              if (memberId === arr.id) return;
              const member = state.arrays[memberId];
              if (member) {
                // Propagate transform to child (simplified)
                // Full implementation would handle relative offsets
              }
            });
          }
        }
      });
    } catch (e) {
      console.warn('Dock propagation failed:', e);
    }
  }
  
  // Update connections (if not skipped)
  if (!_skipConnections && window.Scene?.updateConnectionsForArray) {
    try {
      window.Scene.updateConnectionsForArray(arr);
    } catch (e) {}
  }
  
  if (interactive && window.needsRender !== undefined) {
    window.needsRender = true;
  }
}

/**
 * Refresh array label and visuals
 * @param {Object} arr - Array object
 */
export function refreshArray(arr) {
  if (!arr || !arr._frame) return;
  
  try {
    const old = arr._frame.userData?.labelSprite;
    if (old) {
      try {
        if (old?.userData?.billboard && window.unmarkBillboard) {
          window.unmarkBillboard(old);
        }
      } catch (e) {}
      old.parent?.remove(old);
      old.material?.map?.dispose();
      old.material?.dispose();
      old.geometry?.dispose();
    }
    
    // Create new label sprite
    if (window.Scene?.makeArrayLabelSprite) {
      const labelSprite = window.Scene.makeArrayLabelSprite(arr);
      labelSprite.position.set(0, arr.size.y / 2 + 0.8, 0);
      arr._frame.add(labelSprite);
      arr._frame.userData.labelSprite = labelSprite;
    }
  } catch (e) {
    console.warn('Failed to refresh array label:', e);
  }
}

/**
 * Spawn player at specific position (physics mode)
 * @param {number} x - World X coordinate
 * @param {number} y - World Y coordinate
 * @param {number} z - World Z coordinate
 */
export function spawnPlayerAt(x, y, z) {
  const playerBody = window.playerBody;
  
  if (playerBody) {
    try {
      playerBody.setTranslation({ x, y, z }, true);
      playerBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
      playerBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
      
      if (window.cachedPlayerPos) {
        window.cachedPlayerPos.set(x, y, z);
      }
      
      if (window.jumpVelocity !== undefined) window.jumpVelocity = 0;
      if (window.landingSquashTime !== undefined) window.landingSquashTime = 0;
      if (window.physicsSpawnPos !== undefined) window.physicsSpawnPos = { x, y, z };
      
      console.log(`[PHYSICS] Spawned player at (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`);
    } catch (e) {
      console.warn('spawnPlayerAt failed:', e);
    }
  }
}

/**
 * Center camera on array
 * @param {Object} arr - Array to center on
 * @param {Object} opts - Options {distance, height, angle}
 */
export function centerOnArray(arr, opts = {}) {
  if (!arr || !window.camera || !window.controls) return;
  
  const { distance = 15, height = 8, angle = Math.PI / 4 } = opts;
  
  try {
    const offset = arr.offset || { x: 0, y: 0, z: 0 };
    const targetPos = new THREE.Vector3(offset.x, offset.y, offset.z);
    
    // Set controls target
    window.controls.target.copy(targetPos);
    
    // Position camera at an angle
    const camX = targetPos.x + Math.sin(angle) * distance;
    const camY = targetPos.y + height;
    const camZ = targetPos.z + Math.cos(angle) * distance;
    
    window.camera.position.set(camX, camY, camZ);
    window.controls.update();
    
    if (window.needsRender !== undefined) window.needsRender = true;
  } catch (e) {
    console.warn('Failed to center on array:', e);
  }
}

/**
 * Create array snapshot for visual copying
 * @param {Object} arr - Source array
 * @returns {THREE.Group} Group containing snapshot geometry
 */
export function createArraySnapshot(arr) {
  const geometries = [];
  
  // Get layer meshes from window if available
  const layerMeshes = window.layerMeshes || new Map();
  
  // Iterate through all VISIBLE layer meshes of the source array
  layerMeshes.forEach((rec, key) => {
    if (key.startsWith(`${arr.id}:`) && rec.mesh.visible && rec.mesh.count > 0) {
      const mesh = rec.mesh;
      for (let i = 0; i < mesh.count; i++) {
        const geo = mesh.geometry.clone();
        const matrix = new THREE.Matrix4();
        mesh.getMatrixAt(i, matrix);
        geo.applyMatrix4(matrix);
        geometries.push(geo);
      }
    }
  });
  
  if (geometries.length === 0) return null;
  
  // Create group from geometries
  const group = new THREE.Group();
  geometries.forEach(geo => {
    const mesh = new THREE.Mesh(geo, new THREE.MeshNormalMaterial());
    group.add(mesh);
  });
  
  return group;
}

/**
 * Docking offset calculator
 * @param {Object} host - Host array
 * @param {string} port - Docking port ('north', 'south', 'east', 'west', 'top', 'bottom')
 * @param {number} pad - Padding distance
 * @returns {Object} Offset position {x, y, z}
 */
export function dockOffsetFor(host, port = 'east', pad = 1.0) {
  const arrayVoxelScale = window.Scene?.arrayVoxelScale || ((arr) => arr.params?.voxelScale || 1);
  const scale = arrayVoxelScale(host);
  
  const { x: W, y: H, z: D } = host.size;
  const halfW = (W * scale) / 2;
  const halfH = (H * scale) / 2;
  const halfD = (D * scale) / 2;
  const gap = pad * scale;
  const o = host.offset || { x: 0, y: 0, z: 0 };
  
  const P = String(port || 'east').toLowerCase();
  
  const offs = (P === 'north') ? { x: 0, y: 0, z: (halfD + gap) } :
    (P === 'south') ? { x: 0, y: 0, z: -(halfD + gap) } :
    (P === 'east') ? { x: (halfW + gap), y: 0, z: 0 } :
    (P === 'west') ? { x: -(halfW + gap), y: 0, z: 0 } :
    (P === 'top') ? { x: 0, y: (halfH + gap), z: 0 } :
    { x: 0, y: -(halfH + gap), z: 0 }; // bottom
  
  return {
    x: o.x + offs.x,
    y: o.y + offs.y,
    z: o.z + offs.z
  };
}

/**
 * NOTE: This is a partial extraction of the array management system.
 * The complete system in merged2.html includes:
 * 
 * - Docking system (DOCK formula, group management)
 * - Connection system (addConnection, removeConnection, updateConnections)
 * - Array visibility management (syncVisibility)
 * - Array deletion with animations (startDatafallDelete)
 * - Timed animations (addTimedTranslation, addTimedRotation, addTimedScale)
 * - Array label placement and billboarding
 * - Collider rebuilding for physics
 * - Array frame management (_frame creation and parenting)
 * 
 * For full functionality, integrate with:
 * - Scene.js (scene, camera, renderer globals)
 * - Store.js (state management)
 * - VoxelRenderer.js (rendering)
 * - Physics system (collider management)
 * 
 * See merged2.html lines 30000-31000+ for complete implementation.
 */

export default {
  rotateArrayAround,
  cellWorldPos,
  setArrayOffset,
  refreshArray,
  spawnPlayerAt,
  centerOnArray,
  createArraySnapshot,
  dockOffsetFor
};



