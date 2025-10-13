/**
 * Billboard Manager
 * Extracted from merged2.html (various locations)
 * 
 * Manages camera-facing sprites and labels
 */

import * as THREE from 'three';

// Global billboard tracking
const billboards = new Set();

/**
 * Mark sprite as billboard (camera-facing)
 * @param {THREE.Sprite|THREE.Mesh} object - Object to mark
 * @returns {THREE.Sprite|THREE.Mesh} The object (for chaining)
 */
export function markBillboard(object) {
  if (!object) return object;
  billboards.add(object);
  object.userData = object.userData || {};
  object.userData.billboard = true;
  return object;
}

/**
 * Unmark billboard
 * @param {THREE.Sprite|THREE.Mesh} object - Object to unmark
 */
export function unmarkBillboard(object) {
  if (!object) return;
  billboards.delete(object);
  if (object.userData) {
    object.userData.billboard = false;
  }
}

/**
 * Update all billboards to face camera
 * @param {THREE.Camera} camera - Camera to face
 */
export function updateBillboards(camera) {
  if (!camera) return;
  
  billboards.forEach(obj => {
    try {
      if (obj && obj.parent && obj.lookAt) {
        obj.lookAt(camera.position);
      }
    } catch (e) {
      // Object might have been disposed, remove from set
      billboards.delete(obj);
    }
  });
}

/**
 * Get all billboards
 */
export function getBillboards() {
  return billboards;
}

/**
 * Clear all billboards
 */
export function clearBillboards() {
  billboards.clear();
}

/**
 * Get billboard count
 */
export function getBillboardCount() {
  return billboards.size;
}

// Make globally available for compatibility
if (typeof window !== 'undefined') {
  window.markBillboard = markBillboard;
  window.unmarkBillboard = unmarkBillboard;
  window.updateBillboards = updateBillboards;
}

export default {
  markBillboard,
  unmarkBillboard,
  updateBillboards,
  getBillboards,
  clearBillboards,
  getBillboardCount
};



