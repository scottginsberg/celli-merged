/**
 * Scale & Transform Helpers
 * Utilities for array and voxel scaling
 */

/**
 * Get voxel scale for array
 * @param {Object} arr - Array object
 * @returns {number} Voxel scale in world units
 */
export function arrayVoxelScale(arr) {
  if (!arr) return 1;
  return arr.params?.voxelScale || 1;
}

/**
 * Get display scale for voxels (slightly smaller for visual separation)
 */
export function voxelDisplayScale(baseScale) {
  return baseScale * 0.9;
}

/**
 * Get avatar perch offset (height above cell)
 */
export function avatarPerchOffset(scale) {
  return clampedScaleOffset(scale, 0.8);
}

/**
 * Clamp scale offset to reasonable range
 */
export function clampedScaleOffset(scale, base) {
  const minOffset = base * 0.5;
  const maxOffset = base * 2.0;
  const offset = base * scale;
  return Math.max(minOffset, Math.min(maxOffset, offset));
}

/**
 * Get scale level from units
 */
export function arrayScaleLevelFromUnits(units) {
  if (units <= 0.5) return 0; // Tiny
  if (units <= 0.75) return 1; // Small
  if (units <= 1.0) return 2; // Normal
  if (units <= 1.5) return 3; // Large
  return 4; // Huge
}

/**
 * Get scale units from level
 */
export function arrayScaleUnitsFromLevel(level) {
  const levels = [0.4, 0.7, 1.0, 1.3, 1.8];
  return levels[Math.max(0, Math.min(4, level))] || 1.0;
}

/**
 * Snap value to nearest grid
 */
export function snapToGrid(value, gridSize) {
  if (gridSize <= 0) return value;
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Calculate matrix transform from position, rotation, scale
 */
export function composeMatrix(position, rotation, scale) {
  const THREE = window.THREE;
  if (!THREE) return null;
  
  const matrix = new THREE.Matrix4();
  const quat = new THREE.Quaternion();
  
  if (rotation) {
    if (rotation.isEuler) {
      quat.setFromEuler(rotation);
    } else if (rotation.isQuaternion) {
      quat.copy(rotation);
    }
  }
  
  matrix.compose(position, quat, scale);
  return matrix;
}

export default {
  arrayVoxelScale,
  voxelDisplayScale,
  avatarPerchOffset,
  clampedScaleOffset,
  arrayScaleLevelFromUnits,
  arrayScaleUnitsFromLevel,
  snapToGrid,
  composeMatrix
};



