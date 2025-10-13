/**
 * Coordinate Helper Functions
 * Extracted from merged2.html (various locations)
 * 
 * Coordinate conversion and manipulation utilities
 */

/**
 * Convert column index to Excel-style letter (A, B, C, ..., Z, AA, AB, ...)
 * @param {number} n - Column index (0-based)
 * @returns {string} Column label
 */
export function A1(n) {
  let s = '';
  let v = n + 1;
  while (v > 0) {
    const r = (v - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    v = Math.floor((v - 1) / 26);
  }
  return s;
}

/**
 * Convert layer index to Greek letter (α, β, γ, ...)
 * @param {number} i - Layer index
 * @returns {string} Greek letter
 */
const greekChars = ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω'];

export function greek(i) {
  return greekChars[i % greekChars.length];
}

/**
 * Generate anchor key from cell reference
 * @param {Object} ref - Cell reference {arrId, x, y, z}
 * @returns {string} Anchor key
 */
export function aKey({ arrId, x, y, z }) {
  return `${arrId}:${x},${y},${z}`;
}

/**
 * Parse anchor key back to components
 * @param {string} key - Anchor key
 * @returns {Object} {arrId, x, y, z}
 */
export function parseAnchorKey(key) {
  const [arrId, coords] = key.split(':');
  const [x, y, z] = coords.split(',').map(Number);
  return { arrId: +arrId, x, y, z };
}

/**
 * Parse absolute cell reference (@[x,y,z,id])
 * @param {string} s - Reference string
 * @param {Object} anchor - Current anchor (for relative refs)
 * @returns {Object|null} {x, y, z, arrId}
 */
export function parseAlt(s, anchor) {
  const m = /^@\[(\-?\d+)?,(\-?\d+)?,(\-?\d+)?,(-?\d+)\]$/.exec(String(s).trim());
  if (!m) return null;
  
  const cur = anchor || { x: 0, y: 0, z: 0, arrId: 0 };
  const raw = [m[1], m[2], m[3]].map(v => (v === undefined || v === null) ? '' : String(v));
  
  const toOneBased = (val, curComp) => {
    if (val === '') return 1; // missing -> first cell
    const n = +val;
    if (n === 0) return (curComp | 0) + 1; // 0 => same as executing cell
    return n; // already 1-based or negative
  };
  
  const xb = toOneBased(raw[0], cur.x);
  const yb = toOneBased(raw[1], cur.y);
  const zb = toOneBased(raw[2], cur.z);
  
  return { x: xb - 1, y: yb - 1, z: zb - 1, arrId: +m[4] };
}

/**
 * Parse A1-style cell reference (A1, B2α, C3^2)
 * @param {string} s - Cell reference string
 * @param {number} defId - Default array ID
 * @returns {Object|null} {x, y, z, arrId}
 */
export function parseA1g(s, defId) {
  const m = /^([A-Z]+)(\d+)([\u03b1-\u03c9])?(?:\^(-?\d+))?$/.exec(s.trim());
  if (!m) return null;
  
  let x = 0;
  for (let i = 0; i < m[1].length; i++) {
    x = x * 26 + (m[1].charCodeAt(i) - 64);
  }
  x--;
  
  const y = +m[2] - 1;
  const G = 'αβγδεζηθικλμνξοπρστυφχψω';
  const z = m[3] ? G.indexOf(m[3]) : null;
  const arrId = m[4] !== undefined ? +m[4] : defId;
  
  return { x, y, z, arrId };
}

/**
 * Format cell as local address (A1α style)
 * @param {number} arrId - Array ID
 * @param {Object} coord - Cell coordinates {x, y, z}
 * @returns {string} Formatted address
 */
export function formatLocalAddress(arrId, coord) {
  const row = coord.y + 1;
  return `${A1(coord.x)}${row}${greek(coord.z)}`;
}

/**
 * Format cell as absolute address (@[x,y,z,id])
 */
export function formatAbsoluteAddress(arrId, coord) {
  return `@[${coord.x + 1},${coord.y + 1},${coord.z + 1},${arrId}]`;
}

/**
 * Debug log coordinate in multiple formats
 */
export function debugCoord(label, arrId, coord) {
  console.log(`${label}: 3D(${coord.x},${coord.y},${coord.z}) → 2D(${formatLocalAddress(arrId, coord)}) → ${formatAbsoluteAddress(arrId, coord)}`);
}

export default {
  A1,
  greek,
  aKey,
  parseAnchorKey,
  parseAlt,
  parseA1g,
  formatLocalAddress,
  formatAbsoluteAddress,
  debugCoord
};

