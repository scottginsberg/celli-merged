/**
 * Dynamic Lighting System
 * Extracted from merged2.html lines 22324-22644 (~320 lines)
 * 
 * Cell-based dynamic lighting system with point and spot lights
 * 
 * Components:
 * - upsertCellLight: Create/update dynamic lights at cells
 * - removeCellLight: Remove cell lights
 * - refreshLightsForArray: Update all lights for an array
 * - Base scene lighting setup (three-point lighting)
 * 
 * Dependencies:
 * - THREE.js
 * - Store (state management)
 * - Scene (cellWorldPos, localPos)
 */

import * as THREE from 'three';

// Global light storage
const cellLights = new Map(); // key -> light record
const cellLightTargets = new Map(); // arrId -> Set of light keys targeting it

const LIGHT_GLOW_GEOMETRY = new THREE.SphereGeometry(0.42, 20, 20);

/**
 * Generate light key from cell reference
 */
function lightKey(ref) {
  if (!ref) return '';
  return `${ref.arrId}:${ref.x},${ref.y},${ref.z}`;
}

/**
 * Track light targeting a specific array
 */
function trackLightTarget(key, targetRef) {
  if (!targetRef) return;
  let set = cellLightTargets.get(targetRef.arrId);
  if (!set) {
    set = new Set();
    cellLightTargets.set(targetRef.arrId, set);
  }
  set.add(key);
}

/**
 * Untrack light from target array
 */
function untrackLightTarget(key, targetRef) {
  if (!targetRef) return;
  const set = cellLightTargets.get(targetRef.arrId);
  if (set) {
    set.delete(key);
    if (set.size === 0) cellLightTargets.delete(targetRef.arrId);
  }
}

/**
 * Ensure light instance exists with correct type
 */
function ensureLightInstance(record) {
  if (!record) return;
  
  const wantSpot = record.config?.mode === 'spot';
  const haveSpot = !!record.light?.isSpotLight;
  
  if (!record.light || wantSpot !== haveSpot) {
    // Remove old light
    if (record.light) {
      record.group.remove(record.light);
    }
    if (record.target) {
      record.group.remove(record.target);
      record.target = null;
    }
    
    // Create new light of correct type
    if (wantSpot) {
      const spot = new THREE.SpotLight(0xffffff, 1, 30, Math.PI / 4, 0.35, 2.0);
      spot.castShadow = false;
      const target = new THREE.Object3D();
      record.group.add(spot);
      record.group.add(target);
      spot.target = target;
      record.light = spot;
      record.target = target;
    } else {
      const point = new THREE.PointLight(0xffffff, 1, 30, 2);
      point.castShadow = false;
      record.group.add(point);
      record.light = point;
      record.target = null;
    }
  }
  
  // Create glow sphere if needed
  if (!record.glow) {
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending
    });
    const glow = new THREE.Mesh(LIGHT_GLOW_GEOMETRY, glowMat);
    glow.renderOrder = 1998;
    record.group.add(glow);
    record.glow = glow;
  }
}

/**
 * Attach light to array (parent to array frame or scene)
 */
function attachLightToArray(record) {
  if (!record) return;
  
  const Store = window.Store;
  if (!Store) return;
  
  const arr = Store.getState().arrays[record.source.arrId];
  if (!arr) return;
  
  const localPos = window.Scene?.localPos || ((arr, x, y, z) => new THREE.Vector3(x, y, z));
  const cellWorldPos = window.Scene?.cellWorldPos || ((arr, x, y, z) => new THREE.Vector3(x, y, z));
  
  const local = localPos(arr, record.source.x, record.source.y, record.source.z);
  
  if (arr._frame) {
    if (record.group.parent !== arr._frame) {
      record.group.parent?.remove(record.group);
      arr._frame.add(record.group);
    }
    record.group.position.copy(local);
  } else {
    const world = cellWorldPos(arr, record.source.x, record.source.y, record.source.z);
    const scene = window.scene;
    if (record.group.parent !== scene) {
      record.group.parent?.remove(record.group);
      scene.add(record.group);
    }
    record.group.position.copy(world);
  }
}

/**
 * Update spotlight target direction
 */
function updateLightTarget(record) {
  if (!record?.light?.isSpotLight) return;
  
  const Store = window.Store;
  const cellWorldPos = window.Scene?.cellWorldPos;
  if (!Store || !cellWorldPos) return;
  
  const arr = Store.getState().arrays[record.source.arrId];
  if (!arr) return;
  
  const originWorld = cellWorldPos(arr, record.source.x, record.source.y, record.source.z);
  let dir = new THREE.Vector3(0, -1, 0);
  
  const targetRef = record.config?.targetRef;
  if (targetRef) {
    const tgtArr = Store.getState().arrays[targetRef.arrId];
    if (tgtArr) {
      const targetWorld = cellWorldPos(tgtArr, targetRef.x, targetRef.y, targetRef.z);
      dir = targetWorld.clone().sub(originWorld);
    }
  }
  
  if (dir.lengthSq() < 1e-6) dir.set(0, -1, 0);
  dir.normalize();
  
  // Convert to local space if in array frame
  if (arr._frame) {
    const inv = new THREE.Matrix3().setFromMatrix4(new THREE.Matrix4().copy(arr._frame.matrixWorld).invert());
    dir.applyMatrix3(inv).normalize();
  }
  
  const range = record.config?.beamLength ?? 4.5;
  if (record.target) {
    record.target.position.copy(dir.clone().multiplyScalar(range));
  }
}

/**
 * Update light properties (intensity, color, distance)
 */
function updateLightProperties(record) {
  if (!record?.light) return;
  
  const lumens = Math.max(0, Number(record.config?.lumens ?? 0));
  
  // Convert lumens to intensity (calibrated for present-mode lighting)
  const intensity = lumens <= 0 ? 0 : Math.max(0.8, (lumens / 800) * 2.5);
  const distance = record.config?.distance ?? (lumens <= 0 ? 0 : Math.min(100, 15 + Math.sqrt(lumens || 0) * 0.3));
  const color = record.config?.color || '#ffffff';
  
  try {
    record.light.color.set(color);
  } catch (e) {
    record.light.color.set(0xffffff);
  }
  
  record.light.intensity = intensity;
  record.light.distance = distance;
  record.light.decay = 2;
  
  // Update glow sphere
  if (record.glow && record.glow.material) {
    try {
      record.glow.material.color.set(color);
    } catch (e) {}
    
    const scale = Math.max(0.4, 0.5 + Math.sqrt(Math.max(lumens, 0)) * 0.06);
    record.glow.scale.setScalar(scale);
    record.glow.material.opacity = lumens <= 0 ? 0 : Math.min(0.9, 0.55 + Math.sqrt(lumens) * 0.03);
    record.glow.visible = lumens > 0;
    record.glow.material.needsUpdate = true;
  }
  
  // Update spotlight properties
  if (record.light.isSpotLight) {
    record.light.angle = record.config?.angle ?? (Math.PI / 5);
    record.light.penumbra = record.config?.penumbra ?? 0.4;
    updateLightTarget(record);
  }
}

/**
 * Remove cell light
 * @param {Object|string} ref - Cell reference or light key
 */
export function removeCellLight(ref) {
  const key = typeof ref === 'string' ? ref : lightKey(ref);
  if (!key) return;
  
  const record = cellLights.get(key);
  if (!record) return;
  
  if (record.config?.targetRef) {
    untrackLightTarget(key, record.config.targetRef);
  }
  
  try {
    record.glow?.material?.dispose();
  } catch (e) {}
  
  try {
    record.group?.parent?.remove(record.group);
  } catch (e) {}
  
  cellLights.delete(key);
  
  if (window.needsRender !== undefined) window.needsRender = true;
}

/**
 * Create or update cell light
 * @param {Object} ref - Cell reference {arrId, x, y, z}
 * @param {Object} config - Light configuration
 * @returns {Object|null} Light record
 */
export function upsertCellLight(ref, config) {
  if (!ref) return null;
  
  const Store = window.Store;
  if (!Store) return null;
  
  const arr = Store.getState().arrays[ref.arrId];
  if (!arr) return null;
  
  const key = lightKey(ref);
  
  // Remove if disabled or zero lumens
  if (!config || !config.enabled || (config.lumens != null && config.lumens <= 0)) {
    removeCellLight(key);
    return null;
  }
  
  // Get or create record
  let record = cellLights.get(key);
  if (!record) {
    record = {
      source: { ...ref },
      config: {},
      group: new THREE.Group(),
      light: null,
      target: null,
      glow: null
    };
    record.group.userData.kind = 'cellLight';
    cellLights.set(key, record);
  }
  
  // Untrack old target
  if (record.config?.targetRef) {
    untrackLightTarget(key, record.config.targetRef);
  }
  
  // Update config
  record.source = { ...ref };
  record.config = { ...config };
  
  // Track new target
  if (config.targetRef) {
    trackLightTarget(key, config.targetRef);
  }
  
  // Ensure light instance exists
  ensureLightInstance(record);
  
  // Attach to array
  attachLightToArray(record);
  
  // Update properties
  updateLightProperties(record);
  
  if (window.needsRender !== undefined) window.needsRender = true;
  
  return record;
}

/**
 * Refresh all lights for an array (when array moves/transforms)
 * @param {number} arrId - Array ID
 */
export function refreshLightsForArray(arrId) {
  cellLights.forEach((record) => {
    if (record.source?.arrId === arrId || record.config?.targetRef?.arrId === arrId) {
      attachLightToArray(record);
      updateLightProperties(record);
    }
  });
}

/**
 * Setup base scene lighting (three-point lighting)
 * @param {THREE.Scene} scene - THREE.js scene
 * @param {Object} settings - Lighting settings
 * @returns {THREE.Group} Lighting group
 */
export function setupBaseLighting(scene, settings = {}) {
  const baseLightsGroup = new THREE.Group();
  baseLightsGroup.name = 'BaseLighting';
  
  const strength = settings.lightStrength || 1;
  const defaults = settings.lightDefaults || {
    key: 2.8,
    fill: 1.4,
    rim: 1.0,
    hemi: 0.6
  };
  
  // Key light (main directional light)
  const key = new THREE.DirectionalLight(0xffffff, defaults.key * strength);
  key.position.set(-8, 14, 10);
  key.castShadow = false;
  
  // Fill light
  const fill = new THREE.DirectionalLight(0xffffff, defaults.fill * strength);
  fill.position.set(10, 6, 12);
  fill.castShadow = false;
  
  // Rim/back light
  const rim = new THREE.DirectionalLight(0xffffff, defaults.rim * strength);
  rim.position.set(0, 8, -14);
  rim.castShadow = false;
  
  // Ambient and hemisphere
  const ambient = new THREE.AmbientLight(0xffffff, 0.4 * strength);
  const hemi = new THREE.HemisphereLight(0xdbeafe, 0x0f172a, defaults.hemi * strength);
  
  baseLightsGroup.add(key);
  baseLightsGroup.add(fill);
  baseLightsGroup.add(rim);
  baseLightsGroup.add(ambient);
  baseLightsGroup.add(hemi);
  
  scene.add(baseLightsGroup);
  
  return baseLightsGroup;
}

/**
 * Export cell lights for external access
 */
export function getCellLights() {
  return cellLights;
}

/**
 * Clear all cell lights
 */
export function clearAllCellLights() {
  cellLights.forEach((record, key) => {
    try {
      record.glow?.material?.dispose();
      record.group?.parent?.remove(record.group);
    } catch (e) {}
  });
  cellLights.clear();
  cellLightTargets.clear();
}

// Make functions globally available for integration
if (typeof window !== 'undefined') {
  window.cellLights = cellLights;
  window.cellLightTargets = cellLightTargets;
}

export default {
  upsertCellLight,
  removeCellLight,
  refreshLightsForArray,
  setupBaseLighting,
  getCellLights,
  clearAllCellLights
};

