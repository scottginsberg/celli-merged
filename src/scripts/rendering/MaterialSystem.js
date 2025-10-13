/**
 * Material System
 * Extracted from merged2.html lines 22150-22310 (~160 lines)
 * 
 * Cell material creation and management with caching
 * 
 * Components:
 * - createCellMaterial: Creates materials for cells (ghost/solid)
 * - Material caching for performance
 * - Fancy graphics support (MeshPhysicalMaterial with transmission)
 * - Simple mode (MeshBasicMaterial)
 * - Material refreshing and cleanup
 * 
 * Dependencies:
 * - THREE.js
 * - COLORS constants
 */

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// Material cache for performance
const cellMaterialCache = new Map();

// Singleton geometries
export const GEO_VOXEL = new RoundedBoxGeometry(0.9, 0.9, 0.9, 2, 0.1);
const SHELL_SCALE = 1.08;
export const GEO_SHELL = new RoundedBoxGeometry(0.9 * SHELL_SCALE, 0.9 * SHELL_SCALE, 0.9 * SHELL_SCALE, 2, 0.1);

// Add white vertex colors to geometries
function addWhiteVertexColors(geo) {
  try {
    const n = geo.getAttribute('position')?.count | 0;
    if (!geo.getAttribute('color') && n > 0) {
      const arr = new Float32Array(n * 3);
      arr.fill(1.0);
      geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    }
  } catch (e) {}
}

addWhiteVertexColors(GEO_VOXEL);
addWhiteVertexColors(GEO_SHELL);

/**
 * Get material cache key
 */
function materialKeyFor(type) {
  const base = String(type || '').startsWith('ghost') ? 'ghost' : String(type || 'filled');
  const FancyGraphics = window.FancyGraphics || { enabled: false };
  const mode = FancyGraphics.enabled ? 'present' : 'simple';
  const frosted = FancyGraphics.enabled && FancyGraphics.settings?.transmission ? 'frosted' : 'solid';
  return `${mode}:${frosted}:${base}`;
}

/**
 * Create cell material (with caching)
 * @param {string} type - Material type ('filled', 'ghost', 'empty')
 * @returns {THREE.Material} Cached or new material
 */
export function createCellMaterial(type = 'filled') {
  const baseType = String(type || '').startsWith('ghost') ? 'ghost' : String(type || 'filled');
  const key = materialKeyFor(baseType);
  
  if (cellMaterialCache.has(key)) {
    return cellMaterialCache.get(key);
  }
  
  const COLORS = window.COLORS || { empty: 0xffffff };
  const FancyGraphics = window.FancyGraphics || { enabled: false, settings: {} };
  
  let material;
  
  if (baseType === 'ghost') {
    if (FancyGraphics.enabled) {
      // Fancy ghost material
      material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0xffffff),
        vertexColors: true,
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
        depthTest: true,
        roughness: 0.85,
        metalness: 0.05,
        envMapIntensity: 0.35,
        transmission: 0.0,
        clearcoat: 0.0
      });
      material.blending = THREE.NormalBlending;
      material.toneMapped = true;
    } else {
      // Standard ghost material
      material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.35,
        blending: THREE.NormalBlending,
        depthWrite: false,
        depthTest: true,
        vertexColors: true
      });
      material.toneMapped = false;
    }
  } else {
    // Solid material
    if (FancyGraphics.enabled) {
      const frosted = !!FancyGraphics.settings.transmission;
      const params = {
        color: new THREE.Color(0xffffff),
        vertexColors: true,
        roughness: frosted ? 0.78 : 0.32,
        metalness: frosted ? 0.06 : 0.22,
        envMapIntensity: frosted ? 1.3 : 1.2,
        clearcoat: 0.35,
        clearcoatRoughness: frosted ? 0.55 : 0.2,
        reflectivity: 0.5,
        depthWrite: true,
        depthTest: true
      };
      
      if (frosted) {
        Object.assign(params, {
          transparent: true,
          opacity: 0.9,
          transmission: 0.58,
          thickness: 1.4,
          ior: 1.18,
          attenuationColor: new THREE.Color(0xcfe3ff),
          attenuationDistance: 1.25
        });
      } else {
        Object.assign(params, {
          transparent: false,
          transmission: 0.0
        });
      }
      
      material = new THREE.MeshPhysicalMaterial(params);
      material.toneMapped = true;
    } else {
      // Standard solid material
      const isEmpty = (baseType === 'empty');
      material = new THREE.MeshBasicMaterial({
        color: isEmpty ? COLORS.empty : 0xffffff,
        transparent: false,
        depthWrite: true,
        vertexColors: true
      });
      material.toneMapped = false;
    }
  }
  
  material.userData = { ...(material.userData || {}), pass: baseType === 'ghost' ? 'ghost' : 'solid' };
  cellMaterialCache.set(key, material);
  return material;
}

/**
 * Rebuild cell material references for arrays
 */
export function rebuildCellMaterialRefs() {
  try {
    const Store = window.Store;
    if (!Store) return;
    
    const arrays = Store.getState().arrays || {};
    Object.values(arrays).forEach(arr => {
      const collected = new Set();
      Object.values(arr.chunks || {}).forEach(ch => {
        if (ch?.meshLOD1?.material) collected.add(ch.meshLOD1.material);
        if (ch?.meshGhost?.material) collected.add(ch.meshGhost.material);
      });
      arr._cellMaterials = Array.from(collected);
    });
  } catch (e) {
    console.warn('Failed to rebuild material refs:', e);
  }
}

/**
 * Refresh all cell materials (when graphics mode changes)
 */
export function refreshCellMaterials() {
  try {
    const Store = window.Store;
    if (!Store) return;
    
    const visited = new Set();
    const oldMaterials = new Set();
    cellMaterialCache.clear();
    
    const assign = (mesh, type) => {
      if (!mesh || visited.has(mesh.uuid)) return;
      visited.add(mesh.uuid);
      if (mesh.material) oldMaterials.add(mesh.material);
      mesh.material = createCellMaterial(type);
      mesh.material.needsUpdate = true;
    };
    
    // Update chunk meshes
    try {
      Object.values(Store.getState().arrays || {}).forEach(arr => {
        Object.values(arr.chunks || {}).forEach(ch => {
          assign(ch.meshLOD1, 'filled');
          assign(ch.meshGhost, 'ghost');
          if (ch.meshLOD2) assign(ch.meshLOD2, 'filled');
        });
      });
    } catch (e) {}
    
    // Update layer meshes
    const layerMeshes = window.layerMeshes || new Map();
    try {
      layerMeshes.forEach(rec => {
        const mesh = rec?.mesh;
        if (!mesh) return;
        if (mesh.userData?.isGhost) return;
        const base = mesh.userData?.type || 'filled';
        const want = String(base).startsWith('ghost') ? 'ghost' : base;
        assign(mesh, want);
      });
    } catch (e) {}
    
    // Update chunk meshes
    const chunkMeshes = window.chunkMeshes || new Map();
    try {
      chunkMeshes.forEach(mesh => assign(mesh, 'filled'));
    } catch (e) {}
    
    // Dispose old materials
    oldMaterials.forEach(mat => {
      try {
        mat?.dispose?.();
      } catch (e) {}
    });
    
    rebuildCellMaterialRefs();
    
    if (window.needsRender !== undefined) window.needsRender = true;
  } catch (e) {
    console.warn('refreshCellMaterials failed', e);
  }
}

/**
 * Clear material cache
 */
export function clearMaterialCache() {
  cellMaterialCache.forEach(mat => {
    try {
      mat?.dispose?.();
    } catch (e) {}
  });
  cellMaterialCache.clear();
}

// Make globally available
if (typeof window !== 'undefined') {
  window.GEO_VOXEL = GEO_VOXEL;
  window.GEO_SHELL = GEO_SHELL;
  window.createCellMaterial = createCellMaterial;
  window.refreshCellMaterials = refreshCellMaterials;
}

export default {
  GEO_VOXEL,
  GEO_SHELL,
  createCellMaterial,
  rebuildCellMaterialRefs,
  refreshCellMaterials,
  clearMaterialCache
};



