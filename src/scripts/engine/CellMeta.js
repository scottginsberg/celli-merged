/**
 * Cell Metadata System
 * Handles cell action metadata normalization and aliasing
 * Extracted from merged2.html lines 11064-11118
 */

// Metadata key aliases for backward compatibility
export const META_KEY_ALIASES = {
  on_click: ['onClick'],
  on_hold: ['onHold'],
  on_touch: ['onTouch'],
  on_land: ['onLand']
};

// Build reverse lookup for canonical keys
export const META_KEY_CANONICAL = {};
Object.entries(META_KEY_ALIASES).forEach(([canonical, aliases])=>{
  META_KEY_CANONICAL[canonical] = canonical;
  aliases.forEach(alias=>{ META_KEY_CANONICAL[alias] = canonical; });
});

/**
 * Get canonical metadata key
 */
export function canonicalMetaKey(key){
  return META_KEY_CANONICAL[key] || key;
}

/**
 * Normalize metadata keys to canonical form
 * Converts aliases (onClick) to canonical form (on_click)
 */
export function normalizeMetaKeys(meta){
  if(!meta) return {};
  let changed=false;
  const result={};
  Object.entries(meta).forEach(([key,value])=>{
    if(value===undefined) return;
    const canonical = canonicalMetaKey(key);
    if(canonical!==key) changed=true;
    if(result[canonical]===undefined) result[canonical]=value;
  });
  if(!changed && Object.keys(result).length===Object.keys(meta).length){
    return meta;
  }
  return result;
}

/**
 * Get metadata action value with alias fallback
 */
export function getMetaAction(meta, canonical){
  if(!meta) return undefined;
  const canonicalKey = canonicalMetaKey(canonical);
  if(meta[canonicalKey] !== undefined) return meta[canonicalKey];
  const aliases = META_KEY_ALIASES[canonicalKey] || [];
  for(const alias of aliases){
    if(meta[alias] !== undefined){
      const val = meta[alias];
      meta[canonicalKey] = val;
      delete meta[alias];
      return val;
    }
  }
  return undefined;
}

/**
 * Ensure array has on_select_hooks array (with backward compat)
 */
export function ensureOnSelectHooks(arr){
  if(!arr) return [];
  if(Array.isArray(arr.on_select_hooks)) return arr.on_select_hooks;
  if(Array.isArray(arr.onSelectHooks)){
    arr.on_select_hooks = arr.onSelectHooks;
    delete arr.onSelectHooks;
    return arr.on_select_hooks;
  }
  arr.on_select_hooks = [];
  return arr.on_select_hooks;
}

