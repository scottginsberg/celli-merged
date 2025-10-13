/**
 * Connection/Constraint System
 * Extracted from merged2.html lines 30050-30450 (~400 lines)
 * 
 * Visual connection system for linking cells
 * 
 * Components:
 * - addConnection: Create visual connections (lines, platforms, ziplines, grind rails)
 * - removeConnection: Remove connections
 * - Connection rendering with different modes (line, platform, grind, zipline)
 * - Dimension labeling
 * 
 * Dependencies:
 * - THREE.js
 * - Store (state management)
 * - Scene (worldPos)
 */

import * as THREE from 'three';

// Global connections storage
const connections = new Map(); // anchorKey -> connection record

const COLORS = {
  grab: 0x06b6d4,
  warn: 0xf97316,
  danger: 0xef4444,
  safe: 0x22c55e,
  info: 0x38bdf8
};

/**
 * Add connection between two cells
 * @param {Object} anchor - Anchor cell reference
 * @param {Object} ref1 - First cell reference
 * @param {Object} ref2 - Second cell reference
 * @param {Object} options - Connection options {style, mode, dimensionMode, dimensionExplicit}
 */
export function addConnection(anchor, ref1, ref2, options = {}) {
  removeConnection(anchor); // Clear any existing connection
  
  const Store = window.Store;
  const Scene = window.Scene;
  const aKey = window.aKey || (({arrId, x, y, z}) => `${arrId}:${x},${y},${z}`);
  
  if (!Store || !Scene) return;
  
  const r1 = { ...ref1, arrId: ref1.arrId ?? anchor.arrId };
  const r2 = { ...ref2, arrId: ref2.arrId ?? anchor.arrId };
  
  const arr1 = Store.getState().arrays[r1.arrId];
  const arr2 = Store.getState().arrays[r2.arrId];
  
  if (!arr1 || !arr2) return;
  
  const worldPos = Scene.worldPos || ((arr, x, y, z) => new THREE.Vector3(x, y, z));
  const start = worldPos(arr1, r1.x, r1.y, r1.z);
  const end = worldPos(arr2, r2.x, r2.y, r2.z);
  
  const style = options.style ? String(options.style).toLowerCase() : '';
  const mode = (options.dimensionMode || 'line').toLowerCase();
  const dimensionExplicit = !!options.dimensionExplicit;
  
  const dir = new THREE.Vector3().subVectors(end, start);
  const length = Math.max(0.0001, dir.length());
  const dirNorm = length > 0.0001 ? dir.clone().divideScalar(length) : new THREE.Vector3(1, 0, 0);
  const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  
  const colorMap = {
    warn: COLORS.warn,
    danger: COLORS.danger,
    safe: COLORS.safe,
    info: COLORS.info
  };
  const color = colorMap[style] || COLORS.grab;
  
  let visual;
  const scene = window.scene;
  
  if (mode === 'platform' || mode === 'grind') {
    // Platform or grind rail (3D mesh)
    const thickness = mode === 'grind' ? 0.18 : 0.2;
    const width = mode === 'grind' ? 0.35 : 1.1;
    const geo = new THREE.BoxGeometry(1, thickness, width);
    const mat = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.15,
      roughness: 0.55
    });
    visual = new THREE.Mesh(geo, mat);
    visual.castShadow = true;
    visual.receiveShadow = true;
    
    // Orient along connection direction
    const axis = new THREE.Vector3(1, 0, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(axis, dirNorm.clone());
    visual.quaternion.copy(quat);
    visual.position.copy(center);
    visual.scale.set(length, 1, 1);
  } else if (mode === 'zipline') {
    // Zipline (thin cylinder)
    const geo = new THREE.CylinderGeometry(0.05, 0.05, 1, 10);
    const mat = new THREE.MeshBasicMaterial({ color });
    visual = new THREE.Mesh(geo, mat);
    
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirNorm.clone());
    visual.quaternion.copy(quat);
    visual.position.copy(center);
    visual.scale.set(1, length, 1);
  } else {
    // Simple line
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const material = new THREE.LineBasicMaterial({ color, linewidth: 2 });
    visual = new THREE.Line(geometry, material);
    visual.renderOrder = 100;
  }
  
  visual.frustumCulled = false;
  scene.add(visual);
  
  connections.set(aKey(anchor), {
    visual,
    line: visual,
    start,
    end,
    anchor: { ...anchor },
    ref1: r1,
    ref2: r2,
    mode,
    style,
    length,
    color,
    dimensionExplicit
  });
}

/**
 * Remove connection from anchor
 * @param {Object} anchor - Anchor cell reference
 */
export function removeConnection(anchor) {
  const aKey = window.aKey || (({arrId, x, y, z}) => `${arrId}:${x},${y},${z}`);
  const key = aKey(anchor);
  const conn = connections.get(key);
  
  if (conn) {
    try {
      conn.visual?.parent?.remove(conn.visual);
      conn.visual?.geometry?.dispose();
      conn.visual?.material?.dispose();
    } catch (e) {}
    connections.delete(key);
  }
}

/**
 * Get all connections
 */
export function getConnections() {
  return connections;
}

/**
 * Update connections for an array (when array moves)
 * @param {Object} arr - Array that moved
 */
export function updateConnectionsForArray(arr) {
  if (!arr) return;
  
  const Scene = window.Scene;
  if (!Scene?.worldPos) return;
  
  connections.forEach((conn, key) => {
    // Check if this connection involves the moved array
    if (conn.ref1.arrId === arr.id || conn.ref2.arrId === arr.id) {
      // Rebuild connection geometry with new positions
      try {
        const Store = window.Store;
        const arr1 = Store.getState().arrays[conn.ref1.arrId];
        const arr2 = Store.getState().arrays[conn.ref2.arrId];
        
        if (arr1 && arr2) {
          const start = Scene.worldPos(arr1, conn.ref1.x, conn.ref1.y, conn.ref1.z);
          const end = Scene.worldPos(arr2, conn.ref2.x, conn.ref2.y, conn.ref2.z);
          
          // Update connection geometry
          if (conn.visual && conn.visual.geometry) {
            conn.visual.geometry.setFromPoints([start, end]);
            conn.visual.geometry.computeBoundingSphere();
          }
          
          conn.start = start;
          conn.end = end;
          
          // Update center and length
          const dir = new THREE.Vector3().subVectors(end, start);
          conn.length = dir.length();
          const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
          
          if (conn.visual) {
            conn.visual.position.copy(center);
            
            // Update orientation for 3D meshes
            if (conn.mode === 'platform' || conn.mode === 'grind') {
              const dirNorm = dir.clone().normalize();
              const axis = new THREE.Vector3(1, 0, 0);
              const quat = new THREE.Quaternion().setFromUnitVectors(axis, dirNorm);
              conn.visual.quaternion.copy(quat);
              conn.visual.scale.set(conn.length, 1, 1);
            } else if (conn.mode === 'zipline') {
              const dirNorm = dir.clone().normalize();
              const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirNorm);
              conn.visual.quaternion.copy(quat);
              conn.visual.scale.set(1, conn.length, 1);
            }
          }
        }
      } catch (e) {
        console.warn('Failed to update connection:', e);
      }
    }
  });
}

/**
 * Clear all connections
 */
export function clearAllConnections() {
  connections.forEach((conn, key) => {
    try {
      conn.visual?.parent?.remove(conn.visual);
      conn.visual?.geometry?.dispose();
      conn.visual?.material?.dispose();
    } catch (e) {}
  });
  connections.clear();
}

// Make globally available
if (typeof window !== 'undefined') {
  window.connections = connections;
}

export default {
  addConnection,
  removeConnection,
  getConnections,
  updateConnectionsForArray,
  clearAllConnections
};

