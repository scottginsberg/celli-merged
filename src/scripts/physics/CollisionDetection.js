/**
 * Collision Detection System
 * Extracted from merged2.html (various locations)
 * 
 * 3D collision detection between player and arrays
 * 
 * Components:
 * - locateArrayCollision: Find array/cell at world position
 * - Array collider building
 * - Collision mode determination
 * - Bounce physics helpers
 * 
 * Dependencies:
 * - THREE.js
 * - Rapier (physics engine)
 * - Store (state management)
 */

import * as THREE from 'three';

/**
 * Locate array collision at world position
 * @param {THREE.Vector3} worldPos - World position to check
 * @returns {Object|null} Collision hit {arr, cell, coord, worldPos, distance, collisionMode}
 */
export function locateArrayCollision(worldPos) {
  const Store = window.Store;
  if (!Store) return null;
  
  const state = Store.getState();
  const arrays = Object.values(state.arrays).filter(a => !a.hidden);
  
  const cellWorldPos = window.Scene?.cellWorldPos || ((arr, x, y, z) => {
    const scale = arr.params?.voxelScale || 1;
    return new THREE.Vector3(x * scale, y * scale, z * scale);
  });
  
  const arrayVoxelScale = window.Scene?.arrayVoxelScale || ((arr) => arr.params?.voxelScale || 1);
  const determineCollisionMode = window.determineCollisionMode || (() => 'edit');
  
  for (const arr of arrays) {
    const scale = arrayVoxelScale(arr);
    const halfCell = scale / 2;
    
    // Check each chunk
    for (const chunk of Object.values(arr.chunks || {})) {
      for (const cell of chunk.cells || []) {
        const pos = cellWorldPos(arr, cell.x, cell.y, cell.z);
        const dist = worldPos.distanceTo(pos);
        
        if (dist < halfCell) {
          // Hit!
          const collisionMode = determineCollisionMode(arr, cell);
          
          return {
            arr,
            cell,
            coord: { x: cell.x, y: cell.y, z: cell.z },
            worldPos: pos,
            distance: dist,
            collisionMode
          };
        }
      }
    }
  }
  
  return null;
}

/**
 * Parse bounce metadata from cell
 * @param {Object} meta - Cell metadata
 * @returns {Object} Bounce configuration {walk, land, jump}
 */
export function parseBounceMeta(meta) {
  if (!meta) return { walk: 0, land: 0, jump: 0 };
  
  const walk = meta.bounceWalk !== undefined ? +meta.bounceWalk : 0;
  const land = meta.bounceLand !== undefined ? +meta.bounceLand : 0;
  const jump = meta.bounceJump !== undefined ? +meta.bounceJump : 0;
  
  return {
    walk: Math.max(0, walk),
    land: Math.max(0, land),
    jump: Math.max(0, jump)
  };
}

/**
 * Check if cell is solid for physics
 * @param {Object} cell - Cell object
 * @returns {boolean} True if solid
 */
export function isCellSolid(cell) {
  if (!cell) return false;
  
  // Cell is solid if it has value or formula
  return (cell.value !== '' && cell.value !== null && cell.value !== undefined) || !!cell.formula;
}

/**
 * Get cell at coordinates
 * @param {Object} arr - Array object
 * @param {Object} coord - Coordinates {x, y, z}
 * @returns {Object|null} Cell object
 */
export function getCellAt(arr, coord) {
  if (!arr || !coord) return null;
  
  const chunkOf = window.chunkOf || ((x, y, z) => ({ x: Math.floor(x / 16), y: Math.floor(y / 16), z: Math.floor(z / 16) }));
  const keyChunk = window.keyChunk || ((cx, cy, cz) => `${cx}_${cy}_${cz}`);
  
  const chunkCoord = chunkOf(coord.x, coord.y, coord.z);
  const key = keyChunk(chunkCoord.x, chunkCoord.y, chunkCoord.z);
  const chunk = arr.chunks?.[key];
  
  if (!chunk) return null;
  
  if (chunk.cellMap) {
    return chunk.cellMap.get(`${coord.x},${coord.y},${coord.z}`);
  }
  
  return chunk.cells?.find(c => c.x === coord.x && c.y === coord.y && c.z === coord.z);
}

/**
 * Determine collision mode for array
 * @param {Object} arr - Array object
 * @param {Object} cell - Cell object (optional)
 * @param {Object} opts - Options {debugMode, formulaHostedSet}
 * @returns {string} 'physics' or 'edit'
 */
export function determineCollisionMode(arr, cell = null, opts = {}) {
  if (!arr) return 'edit';
  
  const debugMode = opts.debugMode || false;
  
  // In debug mode, ALL arrays with physics.enabled are physics mode
  if (debugMode && arr.params?.physics?.enabled) return 'physics';
  
  // Check if array has formulas (formula-active arrays are physics mode)
  const getFormulaActiveArrayIds = window.getFormulaActiveArrayIds || (() => new Set());
  const hostedSet = opts.formulaHostedSet || getFormulaActiveArrayIds();
  if (hostedSet.has(arr.id)) return 'physics';
  
  if (cell && (cell.formula || (cell.meta && (cell.meta.generated || cell.meta.emitter)))) {
    return 'physics';
  }
  
  // Non-formula arrays are always 'edit' mode
  return 'edit';
}

/**
 * Build axis-aligned bounding box for array
 * @param {Object} arr - Array object
 * @returns {THREE.Box3} Bounding box
 */
export function getArrayBounds(arr) {
  const scale = arr.params?.voxelScale || 1;
  const offset = arr.offset || { x: 0, y: 0, z: 0 };
  
  const halfX = (arr.size.x * scale) / 2;
  const halfY = (arr.size.y * scale) / 2;
  const halfZ = (arr.size.z * scale) / 2;
  
  const min = new THREE.Vector3(
    offset.x - halfX,
    offset.y - halfY,
    offset.z - halfZ
  );
  
  const max = new THREE.Vector3(
    offset.x + halfX,
    offset.y + halfY,
    offset.z + halfZ
  );
  
  return new THREE.Box3(min, max);
}

/**
 * Check if point is inside array bounds
 */
export function isPointInArray(arr, worldPos) {
  const bounds = getArrayBounds(arr);
  return bounds.containsPoint(worldPos);
}

export default {
  locateArrayCollision,
  parseBounceMeta,
  isCellSolid,
  getCellAt,
  determineCollisionMode,
  getArrayBounds,
  isPointInArray
};



