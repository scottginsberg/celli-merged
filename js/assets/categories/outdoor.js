// ==================== OUTDOOR ASSET CREATORS ====================
// Universal outdoor object creation functions (placeholder module)

import { createPositionedGroup, applyShadows } from '../asset-context.js';

/**
 * Create a simple outdoor asset placeholder
 * @param {Object} spec - Asset specification
 * @param {Object} THREE - Three.js library reference
 * @param {Object} context - Context with scene, objects, gridSize
 * @returns {THREE.Group}
 */
function createOutdoorPlaceholder(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Simple placeholder cube
  const cubeGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const cubeMat = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.7 });
  const cube = new THREE.Mesh(cubeGeo, cubeMat);
  cube.position.y = 0.25;
  applyShadows(cube);
  group.add(cube);
  
  // Position the group
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createOutdoorPlaceholder.metadata = {
  category: 'outdoor',
  name: 'Outdoor Placeholder',
  description: 'Placeholder for outdoor assets',
  dimensions: { width: 0.5, depth: 0.5, height: 0.5 },
  interactive: false
};

// Export all outdoor creators (placeholder)
export const creators = {
  outdoor: createOutdoorPlaceholder
};

