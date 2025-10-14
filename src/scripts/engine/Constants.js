/**
 * Core Constants & Utility Functions
 * Extracted from merged2.html
 */

// Chunk and performance constants
export const CHUNK_SIZE = 16;
export const INACTIVE_GREEDY_THRESHOLD = 4096; // switch non-focused large arrays to shell + greedy
export const WINDOW_CHUNK_RADIUS = 1; // detailed window radius (in chunk units) around selection

// Greek characters for Z-axis naming
export const greekChars = [
  'α','β','γ','δ','ε','ζ','η','θ','ι','κ','λ','μ','ν','ξ','ο','π','ρ','σ','τ','υ','φ','χ','ψ','ω'
];
export const greek = (i)=>greekChars[i%greekChars.length];

// Column naming (A1 notation)
export const A1 = (n)=>{ 
  let s=''; 
  let v=n+1; 
  while(v>0){ 
    const r=(v-1)%26; 
    s=String.fromCharCode(65+r)+s; 
    v=Math.floor((v-1)/26); 
  } 
  return s; 
};

// Chunk coordinate helpers
export const chunkOf = (x,y,z)=>({
  x:Math.floor(x/CHUNK_SIZE),
  y:Math.floor(y/CHUNK_SIZE),
  z:Math.floor(z/CHUNK_SIZE)
});

export const keyChunk = (cx,cy,cz)=>`${cx}_${cy}_${cz}`;

// Cell key generation
export const aKey = ({arrId,x,y,z})=>`${arrId}:${x},${y},${z}`;

// Device detection
export const isTouchDevice = (('ontouchstart' in window) || (navigator.maxTouchPoints>0) || (navigator.msMaxTouchPoints>0));

// Map/Set <-> POJO conversion
export const toObject = (m)=> Object.fromEntries(m || new Map());
export const toMap = (o)=> new Map(Object.entries(o || {}));

/**
 * Parse absolute reference: @[x,y,z,id]
 * Coordinates are 1-based, 0 means "same as executing cell"
 * Missing coordinates default to 1
 */
export const parseAlt = (s, anchor)=>{
  const m=/^@\[(\-?\d+)?,(\-?\d+)?,(\-?\d+)?,(-?\d+)\]$/.exec(String(s).trim());
  if(!m) return null;
  const cur = anchor || {x:0,y:0,z:0,arrId:0};
  const raw = [m[1], m[2], m[3]].map(v=> (v===undefined || v===null) ? '' : String(v));
  const toOneBased = (val, curComp)=>{
    if(val==='' ) return 1; // missing -> first cell
    const n = +val;
    if(n===0) return (curComp|0)+1; // 0 => same as executing cell (convert to 1-based)
    return n; // already 1-based or negative
  };
  const xb = toOneBased(raw[0], cur.x);
  const yb = toOneBased(raw[1], cur.y);
  const zb = toOneBased(raw[2], cur.z);
  return { x: xb-1, y: yb-1, z: zb-1, arrId: +m[4] };
};

// Format local address (A1α notation)
export const formatLocalAddress = (arrId, coord)=>{ 
  const row = coord.y + 1; 
  return `${A1(coord.x)}${row}${greek(coord.z)}`; 
};

// Debug coordinate logging
export const debugCoord = (label, arrId, coord) => { 
  console.log(`${label}: 3D(${coord.x},${coord.y},${coord.z}) → 2D(${formatLocalAddress(arrId, coord)}) → @[${coord.x+1},${coord.y+1},${coord.z+1},${arrId}]`); 
};

/**
 * Parse A1 notation with greek layer and optional array ID
 * Format: A1α^123 where ^123 is the array ID
 */
export const parseA1g = (s,defId)=>{
  const m=/^([A-Z]+)(\d+)([\u03b1-\u03c9])?(?:\^(-?\d+))?$/.exec(s.trim()); 
  if(!m) return null; 
  let x=0; 
  for(let i=0;i<m[1].length;i++) x=x*26+(m[1].charCodeAt(i)-64); 
  x--; 
  const y=+m[2]-1; 
  const G='αβγδεζηθικλμνξοπρστυφχψω';
  const z=m[3]?G.indexOf(m[3]):null; 
  const arrId=m[4]!==undefined?+m[4]:defId; 
  return {x,y,z,arrId};
};

// Toast notification
export const showToast=(t)=>{
  const el=document.getElementById('toast'); 
  if(!el) return;
  el.textContent=t; 
  el.style.display='block'; 
  setTimeout(()=>el.style.display='none',1200);
};

// Physics debug storage key
export const PHYSICS_DEBUG_STORAGE_KEY = 'celli.physicsDebugAll';

/**
 * Parse array ID from anchor/cell key
 * Key format: "123:4,5,6"
 */
export function parseArrayIdFromKey(key){
  if(key === undefined || key === null) return null;
  const str = typeof key === 'string' ? key : String(key);
  const idx = str.indexOf(':');
  if(idx <= 0) return null;
  const id = Number(str.slice(0, idx));
  return Number.isFinite(id) ? id : null;
}

/**
 * Compute active array IDs from formula tracking
 */
export function computeFormulaActiveArrayIds(sourceByCell, depsByAnchor, extraIds=[]){
  const active = new Set();
  try{
    if(Array.isArray(extraIds)){
      extraIds.forEach(id=>{
        const num = Number(id);
        if(Number.isFinite(num)) active.add(num);
      });
    }
  }catch{}
  try{
    if(sourceByCell && typeof sourceByCell.forEach === 'function'){
      sourceByCell.forEach((_src, cellKey)=>{
        const id = parseArrayIdFromKey(cellKey);
        if(id!=null) active.add(id);
      });
    }
  }catch{}
  try{
    if(depsByAnchor && typeof depsByAnchor.forEach === 'function'){
      depsByAnchor.forEach((_deps, anchorKey)=>{
        const id = parseArrayIdFromKey(anchorKey);
        if(id!=null) active.add(id);
      });
    }
  }catch{}
  return active;
}

export function gatherFormulaActiveArrayIds(sourceByCell, depsByAnchor, extraIds=[]){
  return computeFormulaActiveArrayIds(sourceByCell, depsByAnchor, extraIds);
}

let _gatherFormulaFallbackWarned = false;
export function resolveFormulaActiveArrayIds(sourceByCell, depsByAnchor, extraIds=[]){
  try{
    return gatherFormulaActiveArrayIds(sourceByCell, depsByAnchor, extraIds);
  }catch(err){
    if(!_gatherFormulaFallbackWarned){
      console.warn('gatherFormulaActiveArrayIds unavailable, using fallback computation', err);
      _gatherFormulaFallbackWarned = true;
    }
    return computeFormulaActiveArrayIds(sourceByCell, depsByAnchor, extraIds);
  }
}

export function getFormulaActiveArrayIds(){
  try{
    if(typeof Store === 'undefined' || !Store?.getState) return new Set();
    const state = Store.getState();
    return resolveFormulaActiveArrayIds(state.sourceByCell, state.depsByAnchor);
  }catch{
    return new Set();
  }
}

// Physics debug persistence
export function readPersistedPhysicsDebug(){
  try{
    return typeof localStorage !== 'undefined' && localStorage.getItem(PHYSICS_DEBUG_STORAGE_KEY) === '1';
  }catch(e){
    console.warn('Physics debug persistence read failed', e);
    return false;
  }
}

export function persistPhysicsDebugFlag(enabled){
  try{
    if(typeof localStorage === 'undefined') return;
    if(enabled){
      localStorage.setItem(PHYSICS_DEBUG_STORAGE_KEY, '1');
    } else {
      localStorage.removeItem(PHYSICS_DEBUG_STORAGE_KEY);
    }
  }catch(e){
    console.warn('Physics debug persistence write failed', e);
  }
}

