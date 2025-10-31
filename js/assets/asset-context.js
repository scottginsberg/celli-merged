// ==================== ASSET CONTEXT MANAGER ====================
// Universal context management for asset creation
// Makes asset creators work across scale-ultra, sequence-builder, and preview apps

/**
 * Get asset creation context
 * Provides a standardized interface for asset creators regardless of which app calls them
 * 
 * @param {Object} spec - Asset specification with optional context overrides
 * @param {Object} THREE - Three.js library reference
 * @param {Object} defaults - Default context values
 * @returns {Object} Context object with gridSize, targetScene, targetObjects, etc.
 */
export function getAssetContext(spec, THREE, defaults = {}) {
  return {
    THREE: THREE,
    gridSize: spec.GRID_SIZE || defaults.gridSize || 1.0,
    targetScene: spec.scene || defaults.scene || null,
    targetObjects: spec.objects || defaults.objects || [],
    targetInteractive: spec.interactive || defaults.interactive || [],
    lod: spec.lod || defaults.lod || 'high',
    
    // Helper to add object to scene and track it
    addObject(obj) {
      if (this.targetScene) {
        this.targetScene.add(obj);
      }
      if (this.targetObjects) {
        this.targetObjects.push(obj);
      }
      return obj;
    },
    
    // Helper to register interactive object
    registerInteractive(obj) {
      if (this.targetInteractive) {
        this.targetInteractive.push(obj);
      }
      return obj;
    }
  };
}

/**
 * Create a positioned group with spec coordinates
 * @param {Object} THREE - Three.js library
 * @param {Object} spec - Spec with x, y, z, rotation
 * @param {number} gridSize - Grid multiplier
 * @returns {THREE.Group}
 */
export function createPositionedGroup(THREE, spec, gridSize) {
  const group = new THREE.Group();
  group.position.set(
    (spec.x || 0) * gridSize,
    spec.y || 0,
    (spec.z || 0) * gridSize
  );
  group.rotation.y = spec.rotation || 0;
  return group;
}

/**
 * Apply shadow settings to mesh
 * @param {THREE.Mesh} mesh
 * @param {boolean} castShadow
 * @param {boolean} receiveShadow
 */
export function applyShadows(mesh, castShadow = true, receiveShadow = true) {
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;
  return mesh;
}

