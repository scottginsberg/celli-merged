/**
 * Object Utilities
 * Object manipulation and deep operations
 */

/**
 * Deep clone object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (obj instanceof Set) return new Set([...obj].map(item => deepClone(item)));
  if (obj instanceof Map) return new Map([...obj].map(([k, v]) => [k, deepClone(v)]));
  
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * Deep merge objects
 */
export function deepMerge(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();
  
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  
  return deepMerge(target, ...sources);
}

/**
 * Check if value is object
 */
export function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Get nested property safely
 */
export function getProperty(obj, path, defaultValue = undefined) {
  const keys = Array.isArray(path) ? path : path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current == null || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current !== undefined ? current : defaultValue;
}

/**
 * Set nested property safely
 */
export function setProperty(obj, path, value) {
  const keys = Array.isArray(path) ? path : path.split('.');
  const lastKey = keys.pop();
  let current = obj;
  
  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[lastKey] = value;
  return obj;
}

/**
 * Pick properties from object
 */
export function pick(obj, keys) {
  const result = {};
  keys.forEach(key => {
    if (key in obj) result[key] = obj[key];
  });
  return result;
}

/**
 * Omit properties from object
 */
export function omit(obj, keys) {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

/**
 * Map object values
 */
export function mapValues(obj, fn) {
  const result = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = fn(obj[key], key, obj);
    }
  }
  return result;
}

/**
 * Filter object by predicate
 */
export function filterObject(obj, predicate) {
  const result = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && predicate(obj[key], key, obj)) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Convert Map to Object
 */
export function mapToObject(map) {
  return Object.fromEntries(map || new Map());
}

/**
 * Convert Object to Map
 */
export function objectToMap(obj) {
  return new Map(Object.entries(obj || {}));
}

/**
 * Convert Set to Array
 */
export function setToArray(set) {
  return [...(set || new Set())];
}

/**
 * Convert Array to Set
 */
export function arrayToSet(arr) {
  return new Set(arr || []);
}

/**
 * Check if objects are equal (shallow)
 */
export function shallowEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (a[key] !== b[key]) return false;
  }
  
  return true;
}

export default {
  deepClone,
  deepMerge,
  isObject,
  getProperty,
  setProperty,
  pick,
  omit,
  mapValues,
  filterObject,
  mapToObject,
  objectToMap,
  setToArray,
  arrayToSet,
  shallowEqual
};



