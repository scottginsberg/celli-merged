/**
 * String Utilities
 * String manipulation and formatting helpers
 */

/**
 * Escape HTML entities
 */
export function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Unescape HTML entities
 */
export function unescapeHTML(str) {
  const div = document.createElement('div');
  div.innerHTML = str;
  return div.textContent;
}

/**
 * Escape string for use in formula
 */
export function escapeForFormula(str) {
  return String(str).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert to title case
 */
export function titleCase(str) {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

/**
 * Convert to camel case
 */
export function camelCase(str) {
  if (!str) return '';
  return str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
}

/**
 * Convert to kebab case
 */
export function kebabCase(str) {
  if (!str) return '';
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Convert to snake case
 */
export function snakeCase(str) {
  if (!str) return '';
  return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str, maxLength, ellipsis = '...') {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Pad string to length
 */
export function pad(str, length, char = ' ', right = false) {
  str = String(str);
  if (str.length >= length) return str;
  const padding = char.repeat(length - str.length);
  return right ? str + padding : padding + str;
}

/**
 * Parse number from string safely
 */
export function parseNumber(str, defaultValue = 0) {
  const num = parseFloat(str);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Parse integer from string safely
 */
export function parseInt(str, defaultValue = 0) {
  const num = Number.parseInt(str, 10);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Check if string is empty or whitespace
 */
export function isEmpty(str) {
  return !str || str.trim().length === 0;
}

/**
 * Check if string contains substring (case-insensitive)
 */
export function containsIgnoreCase(str, search) {
  if (!str || !search) return false;
  return str.toLowerCase().includes(search.toLowerCase());
}

/**
 * Generate random ID string
 */
export function generateId(prefix = '', length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = prefix;
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Format number with commas
 */
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Pluralize word
 */
export function pluralize(word, count) {
  return count === 1 ? word : word + 's';
}

export default {
  escapeHTML,
  unescapeHTML,
  escapeForFormula,
  capitalize,
  titleCase,
  camelCase,
  kebabCase,
  snakeCase,
  truncate,
  pad,
  parseNumber,
  parseInt,
  isEmpty,
  containsIgnoreCase,
  generateId,
  formatNumber,
  pluralize
};



