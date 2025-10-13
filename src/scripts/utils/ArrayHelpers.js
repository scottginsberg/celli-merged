/**
 * Array Utilities
 * Array manipulation and collection helpers
 */

/**
 * Remove duplicates from array
 */
export function unique(arr) {
  return [...new Set(arr)];
}

/**
 * Flatten nested array
 */
export function flatten(arr, depth = Infinity) {
  if (depth === 0) return arr.slice();
  return arr.reduce((flat, item) => {
    return flat.concat(Array.isArray(item) && depth > 1 ? flatten(item, depth - 1) : item);
  }, []);
}

/**
 * Chunk array into groups
 */
export function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Group by key function
 */
export function groupBy(arr, keyFn) {
  return arr.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});
}

/**
 * Sort by key
 */
export function sortBy(arr, keyFn, descending = false) {
  const sorted = [...arr].sort((a, b) => {
    const aKey = keyFn(a);
    const bKey = keyFn(b);
    if (aKey < bKey) return descending ? 1 : -1;
    if (aKey > bKey) return descending ? -1 : 1;
    return 0;
  });
  return sorted;
}

/**
 * Find index by predicate
 */
export function findIndex(arr, predicate) {
  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i], i, arr)) return i;
  }
  return -1;
}

/**
 * Sum array
 */
export function sum(arr) {
  return arr.reduce((total, val) => total + (+val || 0), 0);
}

/**
 * Average of array
 */
export function average(arr) {
  if (arr.length === 0) return 0;
  return sum(arr) / arr.length;
}

/**
 * Min value in array
 */
export function min(arr) {
  return Math.min(...arr);
}

/**
 * Max value in array
 */
export function max(arr) {
  return Math.max(...arr);
}

/**
 * Range of numbers
 */
export function range(start, end, step = 1) {
  const arr = [];
  for (let i = start; i < end; i += step) {
    arr.push(i);
  }
  return arr;
}

/**
 * Fill array with value
 */
export function fill(length, value) {
  return Array(length).fill(value);
}

/**
 * Remove falsy values
 */
export function compact(arr) {
  return arr.filter(Boolean);
}

/**
 * Take first n elements
 */
export function take(arr, n) {
  return arr.slice(0, n);
}

/**
 * Drop first n elements
 */
export function drop(arr, n) {
  return arr.slice(n);
}

/**
 * Partition array by predicate
 */
export function partition(arr, predicate) {
  const pass = [];
  const fail = [];
  arr.forEach((item, i) => {
    if (predicate(item, i, arr)) pass.push(item);
    else fail.push(item);
  });
  return [pass, fail];
}

/**
 * Zip arrays together
 */
export function zip(...arrays) {
  const length = Math.max(...arrays.map(arr => arr.length));
  return range(0, length).map(i => arrays.map(arr => arr[i]));
}

export default {
  unique,
  flatten,
  chunk,
  groupBy,
  sortBy,
  findIndex,
  sum,
  average,
  min,
  max,
  range,
  fill,
  compact,
  take,
  drop,
  partition,
  zip
};



