/**
 * Geometry Helper Functions
 * Extracted from merged2.html (various locations)
 * 
 * Utility functions for THREE.js geometry manipulation
 */

import * as THREE from 'three';

/**
 * Add white vertex colors to geometry (for per-instance coloring)
 */
export function addWhiteVertexColors(geo) {
  try {
    const n = geo.getAttribute('position')?.count | 0;
    if (!geo.getAttribute('color') && n > 0) {
      const arr = new Float32Array(n * 3);
      arr.fill(1.0);
      geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    }
  } catch (e) {
    console.warn('Failed to add vertex colors:', e);
  }
}

/**
 * Create rounded frame geometry (for selection borders, etc.)
 */
export function createRoundedFrameGeometry(params) {
  const {
    outerWidth,
    outerHeight,
    innerWidth,
    innerHeight,
    outerRadius,
    innerRadius,
    depth
  } = params;
  
  // Placeholder - full implementation would create extruded shape
  // For now, return a simple box
  return new THREE.BoxGeometry(outerWidth, outerHeight, depth);
}

/**
 * Merge multiple buffer geometries (requires BufferGeometryUtils)
 */
export function mergeGeometries(geometries, useGroups = false) {
  if (typeof window.BufferGeometryUtils !== 'undefined' && window.BufferGeometryUtils.mergeGeometries) {
    return window.BufferGeometryUtils.mergeGeometries(geometries, useGroups);
  }
  
  // Fallback: return first geometry or null
  return geometries.length > 0 ? geometries[0] : null;
}

/**
 * Clone geometry safely
 */
export function cloneGeometry(geo) {
  if (!geo) return null;
  try {
    return geo.clone();
  } catch (e) {
    console.warn('Geometry clone failed:', e);
    return null;
  }
}

/**
 * Dispose geometry safely
 */
export function disposeGeometry(geo) {
  if (!geo) return;
  try {
    geo.dispose();
  } catch (e) {
    console.warn('Geometry disposal failed:', e);
  }
}

/**
 * Compute bounding box for instanced mesh
 */
export function computeInstancedBoundingBox(mesh) {
  if (!mesh || !mesh.isInstancedMesh) return null;
  
  const box = new THREE.Box3();
  const temp = new THREE.Matrix4();
  const geoBounds = new THREE.Box3();
  
  if (mesh.geometry.boundingBox) {
    geoBounds.copy(mesh.geometry.boundingBox);
  } else {
    mesh.geometry.computeBoundingBox();
    geoBounds.copy(mesh.geometry.boundingBox);
  }
  
  for (let i = 0; i < mesh.count; i++) {
    mesh.getMatrixAt(i, temp);
    const instanceBounds = geoBounds.clone();
    instanceBounds.applyMatrix4(temp);
    box.union(instanceBounds);
  }
  
  return box;
}

export default {
  addWhiteVertexColors,
  createRoundedFrameGeometry,
  mergeGeometries,
  cloneGeometry,
  disposeGeometry,
  computeInstancedBoundingBox
};

