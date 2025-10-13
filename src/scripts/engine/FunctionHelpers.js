/**
 * Function System Helpers
 * Extracted from merged2.html lines 13067-13363 (~296 lines)
 * 
 * Helper functions for the formula/function system including:
 * - Transaction management
 * - Array scope resolution
 * - Cell targeting
 * - Voxel scale calculations
 * - Function policy checking
 */

import { Write } from './Write.js';
import { normalizeMetaKeys } from './CellMeta.js';

/**
 * Functions that are always allowed regardless of fnPolicy
 */
export const ALWAYS = new Set([
  'FUNCTIONS','LOCK','CREATE','ARRAY','PARAMETERS','ADDRESS','ALT_ADDRESS','COMBINE','COLOR','GETCOLOR',
  'ON_SELECT','ON_EVENT','FIRE_EVENT','SET_GLOBAL','GET_GLOBAL','FOCUS_SET','COPY',
  'SOKOBAN','SOKO_STEP','SOKOBAN2','SOKO_STEP2','SSR','SSR_STEP','DEP_VIS','GET_ARRAY_POS','SET_ARRAY_POS','TRANSLATE_ARRAY','ROTATE_ARRAY',
  'INVENTORY','3D_TRANSLATE','3D_ROTATE','DELETE','DEL','REMOVE','LIGHT','CHIME'
]);

/**
 * Function registry: name -> {tags: Set, impl: function}
 */
export const Fn = {};

/**
 * Register a function with tags
 */
export const tag = (name,tags,impl)=>{ Fn[name]={tags:new Set(tags),impl}; };

/**
 * Ensure a transaction exists, creating one if needed
 */
export function ensureTransaction(tx, origin='auto', reason='Formula mutation'){
  if(tx) return { tx, owned:false };
  return { tx: Write.start(origin, reason), owned:true };
}

/**
 * Finalize a transaction if we own it
 */
export function finalizeTransaction(info){
  if(info && info.owned && info.tx){
    Write.commit(info.tx);
  }
}

/**
 * Collect target cells from an argument
 */
export function collectTargetCells(arg, anchor){
  const out = [];
  if(arg && arg.kind === 'range'){
    arg.cells.forEach(cell=>{
      out.push({
        arrId: cell.arrId ?? anchor.arrId,
        x: cell.x,
        y: cell.y,
        z: cell.z
      });
    });
  } else if(arg && arg.kind === 'ref'){
    out.push({
      arrId: arg.arrId ?? anchor.arrId,
      x: arg.x,
      y: arg.y,
      z: arg.z
    });
  } else if(anchor){
    out.push({
      arrId: anchor.arrId,
      x: anchor.x,
      y: anchor.y,
      z: anchor.z
    });
  }
  return out;
}

/**
 * Array scope token for identifying scope objects
 */
export const ARRAY_SCOPE_TOKEN = '__arrayScope';

/**
 * Create an array scope object
 */
export function makeArrayScope(mode='host', ids=[]){
  const uniq = new Set();
  (ids||[]).forEach(id=>{
    const n = Number(id);
    if(Number.isFinite(n)) uniq.add(Math.trunc(n));
  });
  return { [ARRAY_SCOPE_TOKEN]: true, mode, ids: Array.from(uniq) };
}

/**
 * Normalize a scope descriptor
 */
export function normalizeScopeDescriptor(raw, hostId=null){
  if(!raw || typeof raw !== 'object') return null;
  if(raw[ARRAY_SCOPE_TOKEN]){
    const mode = (raw.mode === 'all' || raw.mode === 'limit') ? raw.mode : 'host';
    const ids = Array.isArray(raw.ids) ? raw.ids.map(n=>Math.trunc(Number(n)||0)).filter(n=>Number.isFinite(n)) : [];
    if(mode === 'host' && ids.length === 0 && hostId != null) ids.push(Math.trunc(hostId));
    return { mode, ids };
  }
  if(typeof raw.mode === 'string' && raw.mode.toLowerCase() === 'all'){
    return { mode:'all', ids:[] };
  }
  if(Number.isFinite(raw.arrId)){
    return { mode:'limit', ids:[Math.trunc(raw.arrId)] };
  }
  if(Number.isFinite(raw.id)){
    return { mode:'limit', ids:[Math.trunc(raw.id)] };
  }
  return null;
}

/**
 * Gather array IDs from a value
 */
export function gatherArrayIdsFromValue(value, hostId, idsOut, flags){
  if(!idsOut) idsOut = new Set();
  if(!flags) flags = { all:false };
  if(value == null) return { ids: idsOut, flags };
  
  if(typeof value === 'object'){
    const normalized = normalizeScopeDescriptor(value, hostId);
    if(normalized){
      if(normalized.mode === 'all'){ flags.all = true; }
      normalized.ids.forEach(id=> idsOut.add(id));
      return { ids: idsOut, flags };
    }
    if(Array.isArray(value)){
      value.forEach(v=>{
        const res = gatherArrayIdsFromValue(v, hostId, idsOut, flags);
        idsOut = res.ids; flags = res.flags;
      });
      return { ids: idsOut, flags };
    }
    if(Number.isFinite(value.arrId)){ idsOut.add(Math.trunc(value.arrId)); }
    if(Number.isFinite(value.id)){ idsOut.add(Math.trunc(value.id)); }
    return { ids: idsOut, flags };
  }
  
  if(typeof value === 'string'){
    const trimmed = value.trim();
    if(trimmed.toLowerCase() === 'all'){ flags.all = true; return { ids: idsOut, flags }; }
    const addr = /^@\[(.*)\]$/.exec(trimmed);
    if(addr){
      const parts = addr[1].split(',').map(s=>s.trim()).filter(Boolean);
      if(parts.length >= 4){
        const arrPart = Number(parts[3]);
        if(Number.isFinite(arrPart)) idsOut.add(Math.trunc(arrPart));
      }
      return { ids: idsOut, flags };
    }
    const cleaned = trimmed.replace(/[\[\]\{\}]/g,'');
    cleaned.split(/[,\s]+/).forEach(part=>{
      if(!part) return;
      const n = Number(part);
      if(Number.isFinite(n)) idsOut.add(Math.trunc(n));
    });
    return { ids: idsOut, flags };
  }
  
  if(typeof value === 'number' && Number.isFinite(value)){
    idsOut.add(Math.trunc(value));
  }
  return { ids: idsOut, flags };
}

/**
 * Extract scope from function arguments
 */
export function extractScopeFromArgs(args, anchor, hostId){
  const ids = new Set();
  const flags = { all:false };
  (args||[]).forEach(arg=>{
    if(!arg) return;
    if(arg.kind === 'ref'){
      const id = arg.arrId ?? anchor?.arrId ?? hostId;
      if(Number.isFinite(id)) ids.add(Math.trunc(id));
      return;
    }
    if(arg.kind === 'range'){
      arg.cells.forEach(cell=>{
        const id = cell.arrId ?? anchor?.arrId ?? hostId;
        if(Number.isFinite(id)) ids.add(Math.trunc(id));
      });
      return;
    }
    try{
      const val = window.Formula.valOf(arg);
      const res = gatherArrayIdsFromValue(val, hostId, ids, flags);
      res.ids.forEach(id=> ids.add(id));
      if(res.flags?.all) flags.all = true;
    }catch{}
  });
  if(flags.all) return { mode:'all', ids:[] };
  if(ids.size === 0 && Number.isFinite(hostId)) ids.add(Math.trunc(hostId));
  return { mode:'limit', ids: Array.from(ids) };
}

/**
 * Parse array scope argument
 */
export function parseArrayScopeArg(scopeArg, anchor, hostArr){
  const hostId = hostArr?.id ?? anchor?.arrId ?? null;
  if(scopeArg == null){
    const ids = Number.isFinite(hostId) ? [Math.trunc(hostId)] : [];
    return { mode:'host', ids };
  }
  if(scopeArg && typeof scopeArg === 'object' && scopeArg[ARRAY_SCOPE_TOKEN]){
    return normalizeScopeDescriptor(scopeArg, hostId) || { mode:'host', ids:Number.isFinite(hostId)?[Math.trunc(hostId)]:[] };
  }
  if(scopeArg.kind === 'ref' || scopeArg.kind === 'range'){
    return extractScopeFromArgs([scopeArg], anchor, hostId);
  }
  let val;
  try{ val = window.Formula.valOf(scopeArg); }catch{}
  if(val && typeof val === 'object' && val[ARRAY_SCOPE_TOKEN]){
    return normalizeScopeDescriptor(val, hostId) || { mode:'host', ids:Number.isFinite(hostId)?[Math.trunc(hostId)]:[] };
  }
  if(typeof val === 'string' && val.trim().toLowerCase() === 'all'){
    return { mode:'all', ids:[] };
  }
  const res = gatherArrayIdsFromValue(val, hostId);
  if(res.flags?.all) return { mode:'all', ids:[] };
  const ids = Array.from(res.ids||[]);
  if(ids.length === 0 && Number.isFinite(hostId)) ids.push(Math.trunc(hostId));
  if(ids.length === 1 && ids[0] === Math.trunc(hostId)) return { mode:'host', ids };
  return ids.length ? { mode:'limit', ids } : { mode:'host', ids:Number.isFinite(hostId)?[Math.trunc(hostId)]:[] };
}

/**
 * Resolve array scope targets
 */
export function resolveArrayScopeTargets(hostArr, anchor, scopeArg){
  const scope = parseArrayScopeArg(scopeArg, anchor, hostArr);
  const arrays = window.Store.getState().arrays || {};
  let targets = [];
  if(scope.mode === 'all'){
    targets = Object.values(arrays).filter(Boolean);
  } else if(scope.mode === 'limit'){
    const uniq = new Set(scope.ids||[]);
    targets = Array.from(uniq).map(id=>arrays[id]).filter(Boolean);
  } else {
    if(hostArr) targets = [hostArr];
  }
  if(!targets.length && hostArr) targets = [hostArr];
  return { scope, targets };
}

/**
 * Mutate cell metadata
 */
export function mutateCellMeta(tx, target, updater){
  if(!target) return;
  const coord = {x: target.x, y: target.y, z: target.z};
  const arrId = target.arrId;
  const existing = window.Formula.getCell({arrId, ...coord}) || { value:'', formula:null, meta:{} };
  const baseMeta = {...(existing.meta || {})};
  const nextMeta = normalizeMetaKeys(updater ? updater(baseMeta, existing) || baseMeta : baseMeta) || {};
  Write.set(tx, arrId, coord, {
    value: existing.value,
    formula: existing.formula,
    meta: nextMeta
  });
}

/**
 * Parse vector argument
 */
export function parseVectorArg(arg){
  if(!arg) return null;
  const raw = window.Formula.valOf(arg);
  if(Array.isArray(raw)){
    const nums = raw.map(v=> Number(v));
    if(nums.length >= 3 && nums.every(n=> Number.isFinite(n))){
      return { x: nums[0], y: nums[1], z: nums[2] };
    }
  }
  if(typeof raw === 'string'){
    const vecMatch = raw.match(/@\s*\[\s*([\-0-9.]+)\s*,\s*([\-0-9.]+)\s*,\s*([\-0-9.]+)\s*(?:,\s*[\-0-9.]+\s*)?\]/);
    if(vecMatch){
      const [ , sx, sy, sz ] = vecMatch;
      const vx = parseFloat(sx), vy = parseFloat(sy), vz = parseFloat(sz);
      if([vx,vy,vz].every(n=> Number.isFinite(n))){
        return { x: vx, y: vy, z: vz };
      }
    }
  }
  if(typeof raw === 'object' && raw && Number.isFinite(raw.x) && Number.isFinite(raw.y) && Number.isFinite(raw.z)){
    return { x: Number(raw.x), y: Number(raw.y), z: Number(raw.z) };
  }
  return null;
}

/**
 * Voxel scale helpers
 */
export function arrayScaleUnitsFromLevel(level){
  const lvl = Math.max(1, Math.round(Number(level)||1));
  return Math.pow(2, Math.max(0, lvl-1));
}

export function arrayVoxelScale(arr){
  if(!arr || typeof arr !== 'object') return 1;
  const params = arr.params || {};
  const direct = Number(params.voxelScale);
  if(Number.isFinite(direct) && direct > 0) return direct;
  const level = Number(params.voxelScaleLevel);
  if(Number.isFinite(level) && level >= 1) return arrayScaleUnitsFromLevel(level);
  return 1;
}

export const BASE_VOXEL_GEOMETRY_SIZE = 0.9;
export const BASE_VOXEL_MARGIN = (1 - BASE_VOXEL_GEOMETRY_SIZE) / 2;

export function voxelMargin(scale){
  if(!Number.isFinite(scale) || scale <= 0) return BASE_VOXEL_MARGIN;
  return Math.min(scale * BASE_VOXEL_MARGIN, BASE_VOXEL_MARGIN);
}

export function clampedScaleOffset(scale, coefficient){
  if(!Number.isFinite(scale) || scale <= 0) return coefficient;
  return Math.min(scale * coefficient, coefficient);
}

export function voxelDisplayScale(scale){
  if(!Number.isFinite(scale) || scale <= 0) return 1;
  const spacing = scale;
  const margin = voxelMargin(spacing);
  const width = Math.max(spacing - 2 * margin, spacing * BASE_VOXEL_GEOMETRY_SIZE);
  return width / BASE_VOXEL_GEOMETRY_SIZE;
}

export function voxelHalfExtent(scale, cells=1){
  if(!Number.isFinite(scale) || scale <= 0) return (BASE_VOXEL_GEOMETRY_SIZE * cells) / 2;
  const spacing = scale;
  const margin = voxelMargin(spacing);
  const total = Math.max(cells * spacing - 2 * margin, cells * spacing * BASE_VOXEL_GEOMETRY_SIZE);
  return total / 2;
}

export function avatarPerchOffset(scale){
  const half = voxelHalfExtent(scale, 1);
  const hover = clampedScaleOffset(scale, 0.25);
  return half + hover;
}

/**
 * Check if a function is allowed by fnPolicy
 */
export function isAllowed(arr, fnName){
  if(ALWAYS.has(fnName)) return true;
  const pol=arr.fnPolicy||{mode:'ALLOW_ALL', allow:new Set(), deny:new Set(), tags:new Set()};
  const fnTags = Fn[fnName]?.tags || new Set();

  if(pol.mode==='ALLOW_ONLY'){
    if(pol.allow?.has(fnName)) return true;
    if(pol.tags?.size && [...pol.tags].some(t => fnTags.has(t))) return true;
    return false;
  }
  // ALLOW_ALL with optional deny / tag filter
  if(pol.deny?.has(fnName)) return false;
  if(pol.tags?.size) return [...pol.tags].some(t => fnTags.has(t));
  return true;
}

// Expose globally for runtime use
if(typeof window !== 'undefined'){
  window.arrayVoxelScale = arrayVoxelScale;
  window.ALWAYS = ALWAYS;
  window.Fn = Fn;
  window.tag = tag;
  window.isAllowed = isAllowed;
}

