/**
 * Vector Utilities
 * THREE.js vector helper functions
 */

import * as THREE from 'three';

/**
 * Create vector from object or array
 */
export function toVector3(input) {
  if (!input) return new THREE.Vector3();
  
  if (input.isVector3) return input.clone();
  if (Array.isArray(input)) return new THREE.Vector3(input[0], input[1], input[2]);
  if (input.x !== undefined) return new THREE.Vector3(input.x, input.y || 0, input.z || 0);
  
  return new THREE.Vector3();
}

/**
 * Vector to array
 */
export function vectorToArray(vec) {
  if (!vec) return [0, 0, 0];
  return [vec.x || 0, vec.y || 0, vec.z || 0];
}

/**
 * Vector to object
 */
export function vectorToObject(vec) {
  if (!vec) return { x: 0, y: 0, z: 0 };
  return { x: vec.x || 0, y: vec.y || 0, z: vec.z || 0 };
}

/**
 * Distance between two points (2D or 3D)
 */
export function distance(a, b) {
  const dx = (b.x || 0) - (a.x || 0);
  const dy = (b.y || 0) - (a.y || 0);
  const dz = (b.z || 0) - (a.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Distance squared (faster, no sqrt)
 */
export function distanceSquared(a, b) {
  const dx = (b.x || 0) - (a.x || 0);
  const dy = (b.y || 0) - (a.y || 0);
  const dz = (b.z || 0) - (a.z || 0);
  return dx * dx + dy * dy + dz * dz;
}

/**
 * Normalize vector
 */
export function normalize(vec) {
  const len = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
  if (len === 0) return { x: 0, y: 0, z: 0 };
  return {
    x: vec.x / len,
    y: vec.y / len,
    z: vec.z / len
  };
}

/**
 * Dot product
 */
export function dot(a, b) {
  return (a.x || 0) * (b.x || 0) + (a.y || 0) * (b.y || 0) + (a.z || 0) * (b.z || 0);
}

/**
 * Cross product
 */
export function cross(a, b) {
  return {
    x: (a.y || 0) * (b.z || 0) - (a.z || 0) * (b.y || 0),
    y: (a.z || 0) * (b.x || 0) - (a.x || 0) * (b.z || 0),
    z: (a.x || 0) * (b.y || 0) - (a.y || 0) * (b.x || 0)
  };
}

/**
 * Linear interpolation between vectors
 */
export function lerp(a, b, t) {
  return {
    x: (a.x || 0) + ((b.x || 0) - (a.x || 0)) * t,
    y: (a.y || 0) + ((b.y || 0) - (a.y || 0)) * t,
    z: (a.z || 0) + ((b.z || 0) - (a.z || 0)) * t
  };
}

/**
 * Add vectors
 */
export function add(a, b) {
  return {
    x: (a.x || 0) + (b.x || 0),
    y: (a.y || 0) + (b.y || 0),
    z: (a.z || 0) + (b.z || 0)
  };
}

/**
 * Subtract vectors
 */
export function subtract(a, b) {
  return {
    x: (a.x || 0) - (b.x || 0),
    y: (a.y || 0) - (b.y || 0),
    z: (a.z || 0) - (b.z || 0)
  };
}

/**
 * Multiply vector by scalar
 */
export function multiply(vec, scalar) {
  return {
    x: (vec.x || 0) * scalar,
    y: (vec.y || 0) * scalar,
    z: (vec.z || 0) * scalar
  };
}

/**
 * Clamp vector components
 */
export function clamp(vec, min, max) {
  return {
    x: Math.max(min.x || 0, Math.min(max.x || 0, vec.x || 0)),
    y: Math.max(min.y || 0, Math.min(max.y || 0, vec.y || 0)),
    z: Math.max(min.z || 0, Math.min(max.z || 0, vec.z || 0))
  };
}

export default {
  toVector3,
  vectorToArray,
  vectorToObject,
  distance,
  distanceSquared,
  normalize,
  dot,
  cross,
  lerp,
  add,
  subtract,
  multiply,
  clamp
};



