/**
 * Validation Utilities
 * Type checking and validation helpers
 */

/**
 * Check if value is defined (not null or undefined)
 */
export function isDefined(value) {
  return value !== null && value !== undefined;
}

/**
 * Check if value is number
 */
export function isNumber(value) {
  return typeof value === 'number' && isFinite(value);
}

/**
 * Check if value is integer
 */
export function isInteger(value) {
  return Number.isInteger(value);
}

/**
 * Check if value is string
 */
export function isString(value) {
  return typeof value === 'string';
}

/**
 * Check if value is boolean
 */
export function isBoolean(value) {
  return typeof value === 'boolean';
}

/**
 * Check if value is function
 */
export function isFunction(value) {
  return typeof value === 'function';
}

/**
 * Check if value is array
 */
export function isArray(value) {
  return Array.isArray(value);
}

/**
 * Check if value is object (not array or null)
 */
export function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value) {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Check if value is in range
 */
export function inRange(value, min, max) {
  return value >= min && value <= max;
}

/**
 * Check if coordinate is valid
 */
export function isValidCoord(coord) {
  return coord &&
         isInteger(coord.x) &&
         isInteger(coord.y) &&
         isInteger(coord.z) &&
         coord.x >= 0 &&
         coord.y >= 0 &&
         coord.z >= 0;
}

/**
 * Check if array reference is valid
 */
export function isValidArrayRef(ref) {
  return ref &&
         isInteger(ref.arrId) &&
         isValidCoord(ref);
}

/**
 * Validate and clamp number
 */
export function validateNumber(value, min = -Infinity, max = Infinity, defaultValue = 0) {
  const num = parseFloat(value);
  if (isNaN(num)) return defaultValue;
  return Math.max(min, Math.min(max, num));
}

/**
 * Validate and parse integer
 */
export function validateInteger(value, min = -Infinity, max = Infinity, defaultValue = 0) {
  const num = parseInt(value, 10);
  if (isNaN(num)) return defaultValue;
  return Math.max(min, Math.min(max, num));
}

/**
 * Validate color string
 */
export function isValidColor(color) {
  if (!color) return false;
  if (typeof color === 'number') return true;
  if (typeof color !== 'string') return false;
  
  // Check hex format
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) return true;
  if (/^#[0-9A-Fa-f]{3}$/.test(color)) return true;
  
  // Check rgb/rgba
  if (/^rgba?\(/.test(color)) return true;
  
  // Check named colors (basic check)
  return true; // Let browser handle validation
}

/**
 * Assert condition
 */
export function assert(condition, message = 'Assertion failed') {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * Type guard for THREE.Vector3
 */
export function isVector3(value) {
  return value && typeof value === 'object' && value.isVector3 === true;
}

/**
 * Type guard for THREE.Color
 */
export function isColor(value) {
  return value && typeof value === 'object' && value.isColor === true;
}

export default {
  isDefined,
  isNumber,
  isInteger,
  isString,
  isBoolean,
  isFunction,
  isArray,
  isObject,
  isEmpty,
  inRange,
  isValidCoord,
  isValidArrayRef,
  validateNumber,
  validateInteger,
  isValidColor,
  assert,
  isVector3,
  isColor
};



