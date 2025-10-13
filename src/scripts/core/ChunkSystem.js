/**
 * Chunk System
 * Extracted from merged2.html lines 23400-23700 (~300 lines)
 * 
 * Chunk-based spatial partitioning for large arrays
 * 
 * Components:
 * - Chunk class for managing cell groups
 * - ChunkManager for visibility culling
 * - LOD switching based on distance
 * - Greedy meshing for LOD2
 * 
 * Dependencies:
 * - THREE.js
 * - Store (state management)
 * - VoxelRenderer (ChunkVoxel class)
 */

import * as THREE from 'three';

const CHUNK_SIZE = 16;
const INACTIVE_GREEDY_THRESHOLD = 4096;
const WINDOW_CHUNK_RADIUS = 1;

/**
 * Chunk class - manages a spatial partition of cells
 */
export class Chunk {
  constructor(array, coord) {
    this.array = array;
    this.coord = coord; // {x, y, z} in chunk units
    this.cells = [];
    this.cellMap = new Map();
    
    // Rendering
    this.meshLOD1 = null; // High detail (instanced)
    this.meshLOD2 = null; // Low detail (greedy meshed)
    this.meshGhost = null; // Ghost pass
    this.meshShell = null; // Shell/outline
    this.instancedMesh = null;
    
    // State
    this._dirty = true;
    this.currentLOD = null;
    this.index2cell = [];
    this.cellIndexMap = new Map();
  }
  
  /**
   * Ensure mesh exists (delegates to ChunkVoxel if available)
   */
  ensureMesh() {
    // If ChunkVoxel class is available, use it
    if (window.ChunkVoxel) {
      const voxel = new window.ChunkVoxel(this.array, this.coord, this.cells);
      const mesh = voxel.ensureMesh();
      this.meshLOD1 = voxel.meshLOD1;
      this.meshGhost = voxel.meshGhost;
      this.meshShell = voxel.meshShell;
      this.instancedMesh = voxel.instancedMesh;
      this.index2cell = voxel.index2cell;
      this.cellIndexMap = voxel.cellIndexMap;
      return mesh;
    }
    
    // Fallback: create basic mesh
    const capacity = Math.max(1, this.cells.length);
    const geo = window.GEO_VOXEL ? window.GEO_VOXEL.clone() : new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const mat = window.createCellMaterial ? window.createCellMaterial('filled') : new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
    
    this.meshLOD1 = new THREE.InstancedMesh(geo, mat, capacity);
    this.meshLOD1.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.meshLOD1.frustumCulled = false;
    this.instancedMesh = this.meshLOD1;
    
    // Add to scene
    const parent = (this.array && this.array._frame) ? this.array._frame : window.scene;
    if (parent) parent.add(this.meshLOD1);
    
    return this.meshLOD1;
  }
  
  /**
   * Set Level of Detail
   */
  setLOD(level) {
    if (this.currentLOD === level && !this._dirty) return;
    
    this.currentLOD = level;
    
    if (level === 1) {
      this.ensureMesh();
    } else if (level === 2) {
      // LOD2 would use greedy meshing
      this.ensureMesh();
    }
    
    this._dirty = false;
  }
}

/**
 * ChunkManager - manages chunk visibility and LOD
 */
export class ChunkManager {
  constructor() {
    this.enabled = true;
    this.warmupFrames = 0;
  }
  
  /**
   * Update chunk LODs based on camera position
   * @param {Object} focusedArray - Currently focused array
   * @param {Object} focus - Focus cell coordinates
   */
  update(focusedArray, focus) {
    if (!this.enabled) return;
    
    // Simplified update - full implementation would:
    // - Calculate chunk distances from focus
    // - Switch LODs based on distance
    // - Cull invisible chunks
  }
}

/**
 * Calculate chunk coordinates from cell coordinates
 * @param {number} x - Cell X
 * @param {number} y - Cell Y
 * @param {number} z - Cell Z
 * @returns {Object} Chunk coordinates {x, y, z}
 */
export function chunkOf(x, y, z) {
  return {
    x: Math.floor(x / CHUNK_SIZE),
    y: Math.floor(y / CHUNK_SIZE),
    z: Math.floor(z / CHUNK_SIZE)
  };
}

/**
 * Generate chunk key from chunk coordinates
 */
export function keyChunk(cx, cy, cz) {
  return `${cx}_${cy}_${cz}`;
}

/**
 * Check if coordinate is within chunk window around focus
 */
export function isInChunkWindow(chunkCoord, focusChunkCoord, radius = WINDOW_CHUNK_RADIUS) {
  const dx = Math.abs(chunkCoord.x - focusChunkCoord.x);
  const dy = Math.abs(chunkCoord.y - focusChunkCoord.y);
  const dz = Math.abs(chunkCoord.z - focusChunkCoord.z);
  return dx <= radius && dy <= radius && dz <= radius;
}

// Export constants
export { CHUNK_SIZE, INACTIVE_GREEDY_THRESHOLD, WINDOW_CHUNK_RADIUS };

// Make globally available for compatibility
if (typeof window !== 'undefined') {
  window.Chunk = Chunk;
  window.ChunkManager = new ChunkManager();
  window.CHUNK_SIZE = CHUNK_SIZE;
  window.chunkOf = chunkOf;
  window.keyChunk = keyChunk;
}

export default {
  Chunk,
  ChunkManager,
  chunkOf,
  keyChunk,
  isInChunkWindow,
  CHUNK_SIZE,
  INACTIVE_GREEDY_THRESHOLD,
  WINDOW_CHUNK_RADIUS
};

