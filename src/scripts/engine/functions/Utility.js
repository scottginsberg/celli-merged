/**
 * Utility & Configuration Functions
 * Extracted from merged2.html (~150 lines combined)
 * 
 * Functions for parameters, global state, colors, and misc utilities
 */

import { tag, collectTargetCells, ensureTransaction, finalizeTransaction, mutateCellMeta } from '../FunctionHelpers.js';
import { Write } from '../Write.js';
import { aKey } from '../Constants.js';

// Note: Functions use window.Store, window.Actions, window.Formula, window.Scene at runtime

/**
 * PARAMETERS(json) or PARAMETERS(formula, ...args) - Set array parameters
 * Lines 16372-16379 (~8 lines)
 */
tag('PARAMETERS',['META'],(anchor,arr,ast)=>{
  const valOf = window.Formula.valOf;
  if(ast.args.length===1){ 
    const j=JSON.parse(String(valOf(ast.args[0])||'{}')); 
    arr.params={...(arr.params||{}), ...j}; 
    window.Actions.setCell(arr.id,anchor,'PARAMETERS:OK',ast.raw,true); 
    return; 
  }
  // Pre-bind args
  const formula=String(valOf(ast.args[0])); 
  const boundArgs=ast.args.slice(1).map(valOf);
  const prebound=`${formula}(${boundArgs.map(a=>typeof a==='string'?`"${a}"`:a).join(',')})`;
  window.Actions.setCell(arr.id,anchor,prebound,ast.raw,true);
});

/**
 * FUNCTIONS(mode, ...items) - Configure function policy
 * Lines 16380-16389 (~10 lines)
 */
tag('FUNCTIONS',['META'],(anchor,arr,ast)=>{
  const valOf = window.Formula.valOf;
  const mode=(String(valOf(ast.args[0])||'ALLOW_ALL')).toUpperCase();
  const pol={mode, allow:new Set(), deny:new Set(), tags:new Set()};
  const items=ast.args.slice(1).map(valOf).flat().map(String);
  items.forEach(it=>{ 
    if(it.startsWith(':')) pol.tags.add(it.slice(1).toUpperCase()); 
    else (mode==='ALLOW_ONLY'?pol.allow:pol.deny).add(it.toUpperCase()); 
  });
  arr.fnPolicy=pol;
  window.Actions.setCell(arr.id,anchor,'FUNCTIONS:OK',ast.raw,true);
});

/**
 * LOCK(state, ...refs) - Lock cells from editing
 * Lines 16390-16396 (~7 lines)
 */
tag('LOCK',['META'],(anchor,arr,ast)=>{
  const valOf = window.Formula.valOf;
  const state=!!valOf(ast.args[0]); 
  if(!state){
    arr.locks.clear(); 
    window.Actions.setCell(arr.id,anchor,'LOCK:OFF',ast.raw,true); 
    return;
  }
  const add=(r)=>{ 
    if(r.kind==='ref') arr.locks.add(aKey(r)); 
    if(r.kind==='range') r.cells.forEach(c=>arr.locks.add(aKey(c))); 
  };
  ast.args.slice(1).forEach(a=>{ if(a?.kind) add(a); });
  window.Actions.setCell(arr.id,anchor,`LOCK:${arr.locks.size}`,ast.raw,true);
});

/**
 * CA(type, steps, axis, index) - Cellular automata (toy)
 * Lines 16398-16404 (~7 lines)
 */
tag('CA',['PURE'],(anchor,arr,ast)=>{
  const valOf = window.Formula.valOf;
  const type=String(valOf(ast.args[0])||'life').toLowerCase();
  const steps=+valOf(ast.args[1])||1; 
  const axis=String(valOf(ast.args[2])||'Y').toUpperCase(); 
  const index=+valOf(ast.args[3])|0;
  if(type!=='life') throw new Error('Only life supported');
  window.CA.runLife2D(arr,{axis,index,steps});
  window.Actions.setCell(arr.id,anchor,`CA:life ${steps} ${axis}=${index}`,ast.raw,true);
});

/**
 * OCCLUDE(mode, style, intensity) - Configure occlusion
 * Lines 16406-16412 (~7 lines)
 */
tag('OCCLUDE',['SCENE'],(anchor,arr,ast)=>{
  const valOf = window.Formula.valOf;
  const mode=String(valOf(ast.args[0])||'auto').toLowerCase();
  const style=String(valOf(ast.args[1])||'translucent').toLowerCase();
  const intensity=+valOf(ast.args[2])||0.4;
  arr.occlusionMode={mode,style,intensity};
  window.Actions.setCell(arr.id,anchor,`Occlude:${mode}/${style}/${intensity}`,ast.raw,true);
});

/**
 * CAMERA_LOCK(axis, angle) - Lock camera to axis
 * Lines 16413-16418 (~6 lines)
 */
tag('CAMERA_LOCK',['SCENE'],(anchor,arr,ast)=>{
  const valOf = window.Formula.valOf;
  const axis=String(valOf(ast.args[0])||'').toUpperCase();
  const angle=+valOf(ast.args[1])||0;
  window.Scene.setCameraLock(arr,{axis,angle});
  window.Actions.setCell(arr.id,anchor,`CameraLock:${axis||'free'}/${angle}°`,ast.raw,true);
});

/**
 * GET_GLOBAL(key) - Get global state value
 * Lines 16421-16426 (~6 lines)
 */
tag('GET_GLOBAL',['PURE'],(anchor,arr,ast)=>{
  const valOf = window.Formula.valOf;
  const key = String(valOf(ast.args[0]) || '');
  if(!key) throw new Error('GET_GLOBAL requires a key');
  const value = window.Store.getState().globalState.get(key);
  window.Actions.setCell(arr.id, anchor, value !== undefined ? value : '', ast.raw, true);
});

/**
 * SET_GLOBAL(key, value) - Set global state value
 * Lines 16428-16443 (~16 lines)
 */
tag('SET_GLOBAL',['ACTION'],(anchor,arr,ast)=>{
  const valOf = window.Formula.valOf;
  const key = String(valOf(ast.args[0]) || '');
  const value = valOf(ast.args[1]);
  if(!key) throw new Error('SET_GLOBAL requires a key');
  
  // Write to global state
  window.Store.getState().globalState.set(key, value);
  
  // Trigger re-computation for all dependent anchors
  const dependents = window.Store.getState().anchorsByGlobalKey.get(key) || new Set();
  if(dependents.size > 0) {
    window.Formula.recomputeAnchors([...dependents]);
  }
  
  window.Actions.setCell(arr.id, anchor, `Global[${key}] = ${value}`, ast.raw, true);
});

/**
 * VALUE_AT(x, y, z, arrId) - Get value at absolute coordinates
 * Lines 16452-16463 (~12 lines)
 */
tag('VALUE_AT',["PURE"],(anchor,arr,ast)=>{
  const ax = Number(window.Formula.valOf(ast.args[0]));
  const ay = Number(window.Formula.valOf(ast.args[1]));
  const az = Number(window.Formula.valOf(ast.args[2]));
  const a4 = window.Formula.valOf(ast.args[3]);
  const arrId = Number(a4);
  if(!Number.isFinite(arrId)) return '';
  const x = (ax===0) ? (anchor?.x|0) : (Number.isFinite(ax) ? (ax-1) : (anchor?.x|0));
  const y = (ay===0) ? (anchor?.y|0) : (Number.isFinite(ay) ? (ay-1) : (anchor?.y|0));
  const z = (az===0) ? (anchor?.z|0) : (Number.isFinite(az) ? (az-1) : (anchor?.z|0));
  return window.Formula.getCellValue({arrId, x, y, z});
});

/**
 * COMBINE(enable) - Enable/disable combine mode
 * Lines 16866-16871 (~6 lines)
 */
tag('COMBINE',["ACTION","META"],(anchor,arr,ast)=>{
  const enable = !!window.Formula.valOf(ast.args[0]);
  window.Store.setState(s=>({ 
    interactions:{ ...(s.interactions||{}), gobblingEnabled: enable } 
  }));
  window.Actions.setCell(arr.id, anchor, `Combine Mode: ${enable?'ON':'OFF'}`, ast.raw, true);
});

/**
 * COLOR(hexColor, [targetRefOrRange]) - Set cell background color
 * Lines 16916-16944 (~29 lines)
 */
tag('COLOR',["ACTION"], (anchor, arr, ast, tx) => {
  if (!tx) throw new Error('COLOR requires an active transaction');
  const colorValRaw = window.Formula.valOf(ast.args[0] || '#ffffff');
  const colorVal = String(colorValRaw==null?'#ffffff':colorValRaw).trim();
  if (!/^#[0-9a-fA-F]{6}$/.test(colorVal)) {
    window.Actions.setCell(arr.id, anchor, '!ERR:COLOR_FORMAT', ast.raw, true);
    return;
  }

  const targetArg = ast.args[1] || anchor;
  const targets = [];
  if (targetArg && targetArg.kind === 'range') {
    targets.push(...targetArg.cells);
  } else if (targetArg && targetArg.kind === 'ref') {
    targets.push(targetArg);
  } else {
    targets.push(anchor);
  }

  targets.forEach(t => {
    const cell = window.Formula.getCell(t);
    Write.set(tx, t.arrId, { x: t.x, y: t.y, z: t.z }, {
      value: cell.value,
      formula: (t.arrId===anchor.arrId && t.x === anchor.x && t.y === anchor.y && t.z === anchor.z) ? (cell.formula ?? ast.raw) : cell.formula,
      meta: { ...(cell.meta||{}), color: colorVal }
    });
  });
});

/**
 * GETCOLOR([targetRef]) - Get cell color
 * Lines 16947-16951 (~5 lines)
 */
tag('GETCOLOR',["PURE"], (anchor, arr, ast) => {
  const target = (ast.args[0] && ast.args[0].kind === 'ref') ? ast.args[0] : anchor;
  const cell = window.Formula.getCell(target);
  return (cell && cell.meta && cell.meta.color) ? cell.meta.color : '#3b82f6';
});

/**
 * PIVOT(range) - Flag cells as physics pivots
 * Lines 16954-16965 (~12 lines)
 */
tag('PIVOT',["PHYSICS"], (anchor, arr, ast, tx) => {
  const cells = collectTargetCells(ast.args[0], anchor);
  const info = ensureTransaction(tx, 'physics.pivot', 'Mark physics pivots');
  cells.forEach(target => {
    mutateCellMeta(info.tx, target, meta => ({ ...meta, physicsPivot: true }));
  });
  finalizeTransaction(info);
  try{
    const affected = new Set(cells.map(c=>c.arrId));
    affected.forEach(id=>{ 
      const targetArr = window.Store.getState().arrays[id]; 
      if(targetArr) window.Scene.debounceColliderRebuild?.(targetArr); 
    });
  }catch{}
});

