/**
 * Meta & Interaction Functions  
 * Extracted from merged2.html (~401 lines combined)
 * 
 * Functions for metadata, interactions, and event handling
 */

import { tag, collectTargetCells, ensureTransaction, finalizeTransaction } from '../FunctionHelpers.js';
import { Write } from '../Write.js';
import { aKey, keyChunk, chunkOf, showToast } from '../Constants.js';
import { normalizeMetaKeys, canonicalMetaKey, META_KEY_ALIASES } from '../CellMeta.js';

// Note: Functions use window.Store, window.Actions, window.Formula, window.Scene, window.UI at runtime

/**
 * SET(target, value, [overwrite]) - Write value to target cell
 * Lines 15937-15963 (~27 lines)
 */
tag('SET',['ACTION'],(anchor,arr,ast,tx)=>{ 
  if(!tx) throw new Error('SET requires an active transaction');
  const valOf = window.Formula.valOf;
  const target=ast.args[0]; 
  const value=ast.args[1]; 
  const overwrite=ast.args[2]!==undefined?!!valOf(ast.args[2]):true;
  let tref=null;
  if(target&&target.kind==='ref'){ 
    tref = {x:target.x,y:target.y,z:target.z,arrId:target.arrId};
  } else if(typeof target==='string'){
    const parsed = window.parseAlt(String(target));
    if(parsed) tref = {x:parsed.x,y:parsed.y,z:parsed.z,arrId:parsed.arrId};
  } else {
    const sval = valOf(target);
    if(typeof sval==='string'){
      const parsed = window.parseAlt(String(sval));
      if(parsed) tref = {x:parsed.x,y:parsed.y,z:parsed.z,arrId:parsed.arrId};
    }
  }
  if(tref){
    const v=valOf(value); 
    const cell=window.Formula.getCell({arrId:tref.arrId,x:tref.x,y:tref.y,z:tref.z});
    const isEmpty = (val) => val === '' || val === null || val === undefined;
    if(overwrite || isEmpty(cell.value)){
      Write.set(tx, tref.arrId, {x:tref.x,y:tref.y,z:tref.z}, { value: v, formula: null });
    }
    return; 
  } 
  throw new Error('SET needs target ref'); 
});

/**
 * DISPLAY_AS(displayText[, refOrSelf]) - Set display text without changing value
 * Lines 15965-15977 (~13 lines)
 */
tag('DISPLAY_AS',['ACTION'],(anchor,arr,ast)=>{
  const valOf = window.Formula.valOf;
  const text = String(valOf(ast.args[0]||''));
  const t = (ast.args[1]&&ast.args[1].kind==='ref')?ast.args[1]:anchor;
  const ch=arr.chunks[keyChunk(...Object.values(chunkOf(t.x,t.y,t.z)))];
  const idx=ch?.cells.findIndex(c=>c.x===t.x&&c.y===t.y&&c.z===t.z) ?? -1;
  if(idx<0||!ch){ 
    window.Actions.setCell(arr.id,anchor,'DISPLAY_AS:FAIL',ast.raw,true); 
    return; 
  }
  const prev=ch.cells[idx];
  ch.cells[idx] = {...prev, meta:{...(prev.meta||{}), displayText:text}};
  window.UI.renderSheetCell(arr, t.x, t.y, t.z);
  window.Scene.updateValueSprite(arr, t.x, t.y, t.z, ch.cells[idx]);
});

/**
 * BOUNCE(mode, height, [targets]) - Configure bounce pads
 * Lines 15978-16060 (~83 lines)
 */
tag('BOUNCE',['ACTION'],(anchor,arr,ast,tx)=>{
  const valOf = window.Formula.valOf;
  const modeRaw = Math.round(Number(valOf(ast.args[0] ?? 0)) || 0);
  const bounceType = modeRaw === 1 ? 'land' : 'walk';
  const heightRaw = Number(valOf(ast.args[1] ?? 0));
  const height = Number.isFinite(heightRaw) ? Math.max(0, heightRaw) : 0;
  const targets = collectTargetCells(ast.args[2], anchor);
  const info = ensureTransaction(tx, 'scene.bounce', 'Configure bounce pads');
  const formatHeight = (value)=>{
    const num = Number(value);
    if(!Number.isFinite(num) || num <= 0) return 'OFF';
    const precision = Math.abs(num) >= 10 ? 1 : 2;
    return num.toFixed(precision).replace(/\.0+$/,'').replace(/(\.[0-9]*?)0+$/,'$1');
  };
  targets.forEach(target=>{
    window.mutateCellMeta(info.tx, target, meta=>{
      const next = {...meta};
      let rawConfig = next.bounceConfig ?? next.bounce ?? null;
      if(typeof rawConfig === 'string'){
        try{ rawConfig = JSON.parse(rawConfig); }catch{}
      }
      const config = {};
      if(rawConfig && typeof rawConfig === 'object'){
        if(Array.isArray(rawConfig)){
          if(Number.isFinite(+rawConfig[0])) config.walk = +rawConfig[0];
          if(Number.isFinite(+rawConfig[1])) config.land = +rawConfig[1];
        } else {
          if(Number.isFinite(+rawConfig.walk)) config.walk = +rawConfig.walk;
          if(Number.isFinite(+rawConfig.land)) config.land = +rawConfig.land;
          if(Number.isFinite(+rawConfig.onWalk)) config.walk = +rawConfig.onWalk;
          if(Number.isFinite(+rawConfig.onLand)) config.land = +rawConfig.onLand;
        }
      }
      if(height > 0){
        config[bounceType] = height;
      } else {
        delete config[bounceType];
      }
      ['walk','land'].forEach(key=>{
        const val = config[key];
        if(!Number.isFinite(val) || val <= 0){
          delete config[key];
        } else {
          config[key] = Number(val);
        }
      });
      if(Object.keys(config).length){
        next.bounceConfig = config;
      } else {
        delete next.bounceConfig;
      }
      if(next.bounce !== undefined) delete next.bounce;
      const labelParts = [];
      if(Number.isFinite(config.walk) && config.walk > 0){
        labelParts.push(`W:${formatHeight(config.walk)}`);
      }
      if(Number.isFinite(config.land) && config.land > 0){
        labelParts.push(`L:${formatHeight(config.land)}`);
      }
      if(labelParts.length){
        next.displayText = `🪂 ${labelParts.join(' ')}`;
        next.bounceLabel = true;
      } else if(next.bounceLabel){
        delete next.displayText;
        delete next.bounceLabel;
      }
      return next;
    });
  });
  finalizeTransaction(info);
  targets.forEach(target=>{
    try{
      const targetArr = window.Store.getState().arrays[target.arrId];
      if(!targetArr) return;
      if(window.UI?.renderSheetCell) window.UI.renderSheetCell(targetArr, target.x, target.y, target.z);
      const updated = window.Formula.getCell({arrId:target.arrId,x:target.x,y:target.y,z:target.z});
      if(updated) window.Scene.updateValueSprite(targetArr, target.x, target.y, target.z, updated);
    }catch{}
  });
  const summary = height > 0 ? formatHeight(height) : 'OFF';
  const suffix = targets.length > 1 ? ` ${targets.length}` : '';
  window.Actions.setCell(arr.id, anchor, `bounce:${bounceType}:${summary}${suffix}`, ast.raw, true);
});

/**
 * Helper: Collect metadata targets
 * Lines 16062-16070 (~9 lines)
 */
function __collectMetaTargets(rangeArg, anchor, arr){
  if(rangeArg && rangeArg.kind==='range'){
    return rangeArg.cells.map(c=>({arrId:c.arrId??arr.id, x:c.x, y:c.y, z:c.z}));
  }
  if(rangeArg && rangeArg.kind==='ref'){
    return [{arrId:rangeArg.arrId??arr.id, x:rangeArg.x, y:rangeArg.y, z:rangeArg.z}];
  }
  return [{arrId:arr.id, x:anchor.x, y:anchor.y, z:anchor.z}];
}

/**
 * Helper: Apply metadata action
 * Lines 16072-16090 (~19 lines)
 */
function __applyMetaAction(cells, key, action){
  const canonicalKey = canonicalMetaKey(key);
  const tx = Write.start(`meta.${canonicalKey}`,'Meta binding');
  cells.forEach(target=>{
    const existing = window.Formula.getCell({arrId:target.arrId, x:target.x, y:target.y, z:target.z});
    let meta = normalizeMetaKeys(existing.meta||{});
    const aliases = META_KEY_ALIASES[canonicalKey] || [];
    if(action===null){
      delete meta[canonicalKey];
      aliases.forEach(alias=>delete meta[alias]);
    }
    else {
      meta[canonicalKey] = action;
      aliases.forEach(alias=>delete meta[alias]);
    }
    Write.set(tx, target.arrId, {x:target.x,y:target.y,z:target.z}, { 
      value: existing.value, 
      formula: existing.formula, 
      meta 
    });
  });
  Write.commit(tx);
}

/**
 * ON_HOLD([targets], action) - Execute action on hold
 * Lines 16092-16109 (~18 lines)
 */
tag('ON_HOLD',['META'],(anchor,arr,ast)=>{
  const valOf = window.Formula.valOf;
  if(ast.args.length===1 && typeof ast.args[0]==='string'){
    const t=ast.args[0].trim().toLowerCase();
    if(['off','none','false','0'].includes(t)){
      __applyMetaAction([{arrId:arr.id,x:anchor.x,y:anchor.y,z:anchor.z}], 'on_hold', null);
      window.Actions.setCell(arr.id, anchor, 'on_hold:OFF', ast.raw, true);
      return;
    }
  }
  let rangeArg=null, actionArgIndex=0;
  if(ast.args.length>=2){ rangeArg=ast.args[0]; actionArgIndex=1; }
  const raw = ast.args[actionArgIndex];
  let action = (typeof raw==='string')? raw : String(valOf(raw)||'');
  if(action && action[0] !== '=') action = `=${action}`;
  const targets = __collectMetaTargets(rangeArg, anchor, arr);
  __applyMetaAction(targets, 'on_hold', action||null);
  window.Actions.setCell(arr.id, anchor, `on_hold:${targets.length}`, ast.raw, true);
});

/**
 * ON_TOUCH([targets], action) - Execute action on touch
 * Lines 16111-16128 (~18 lines)
 */
tag('ON_TOUCH',['META'],(anchor,arr,ast)=>{
  const valOf = window.Formula.valOf;
  if(ast.args.length===1 && typeof ast.args[0]==='string'){
    const t=ast.args[0].trim().toLowerCase();
    if(['off','none','false','0'].includes(t)){
      __applyMetaAction([{arrId:arr.id,x:anchor.x,y:anchor.y,z:anchor.z}], 'on_touch', null);
      window.Actions.setCell(arr.id, anchor, 'on_touch:OFF', ast.raw, true);
      return;
    }
  }
  let rangeArg=null, actionIdx=0;
  if(ast.args.length>=2){ rangeArg=ast.args[0]; actionIdx=1; }
  const raw = ast.args[actionIdx];
  let action = (typeof raw==='string')? raw : String(valOf(raw)||'');
  if(action && action[0] !== '=') action = `=${action}`;
  const targets = __collectMetaTargets(rangeArg, anchor, arr);
  __applyMetaAction(targets, 'on_touch', action||null);
  window.Actions.setCell(arr.id, anchor, `on_touch:${targets.length}`, ast.raw, true);
});

/**
 * ON_LAND([targets], action) - Execute action on land
 * Lines 16130-16147 (~18 lines)
 */
tag('ON_LAND',['META'],(anchor,arr,ast)=>{
  const valOf = window.Formula.valOf;
  if(ast.args.length===1 && typeof ast.args[0]==='string'){
    const t=ast.args[0].trim().toLowerCase();
    if(['off','none','false','0'].includes(t)){
      __applyMetaAction([{arrId:arr.id,x:anchor.x,y:anchor.y,z:anchor.z}], 'on_land', null);
      window.Actions.setCell(arr.id, anchor, 'on_land:OFF', ast.raw, true);
      return;
    }
  }
  let rangeArg=null, actionIdx=0;
  if(ast.args.length>=2){ rangeArg=ast.args[0]; actionIdx=1; }
  const raw = ast.args[actionIdx];
  let action = (typeof raw==='string')? raw : String(valOf(raw)||'');
  if(action && action[0] !== '=') action = `=${action}`;
  const targets = __collectMetaTargets(rangeArg, anchor, arr);
  __applyMetaAction(targets, 'on_land', action||null);
  window.Actions.setCell(arr.id, anchor, `on_land:${targets.length}`, ast.raw, true);
});

/**
 * Helper: Normalize action formula
 * Lines 16150-16166 (~17 lines)
 */
const ACTION_TICK_MS = 1000/60;
function normalizeActionFormula(raw){
  let formula = String(raw==null?'':raw).trim();
  if(!formula) return '';
  if(formula.startsWith('B64:')){
    try{ formula = atob(formula.slice(4)); }catch{}
  } else {
    const colon = formula.indexOf(':');
    if(colon>0 && /^\d+$/.test(formula.slice(0,colon))){
      const enc=formula.slice(colon+1);
      try{ formula = atob(enc); }catch{}
    }
  }
  formula = String(formula||'').trim();
  if(!formula) return '';
  if(!formula.startsWith('=')) formula = `=${formula}`;
  return formula;
}

/**
 * Helper: Execute action formula
 * Lines 16168-16180 (~13 lines)
 */
function executeActionFormula(anchor, action, label){
  const formula = normalizeActionFormula(action);
  if(!formula) return;
  window.warmChimeIfNeeded?.(formula);
  const tx = Write.start(`meta.${label||'action'}`, `${label||'action'} handler`);
  try{
    window.Formula.runOnceAt(anchor, formula, tx);
    Write.commit(tx);
  }catch(err){
    console.warn(`${label||'Action'} execution failed`, err);
    try{ Write.rollback(tx); }catch{}
  }
}

/**
 * ONCLICK([targetRefOrRange], actionFormulaOrBlock) - Bind click action
 * Lines 16182-16286 (~105 lines)
 */
tag('ONCLICK',['ACTION'],(anchor,arr,ast)=>{
  const parseRawArgs=(raw)=>{
    if(!raw || typeof raw!=='string') return [];
    const open=raw.indexOf('(');
    const close=raw.lastIndexOf(')');
    if(open<0||close<=open) return [];
    const inner=raw.slice(open+1, close);
    const args=[];
    let current='';
    let depth=0;
    let quote=null;
    let escape=false;
    for(let i=0;i<inner.length;i++){
      const ch=inner[i];
      if(escape){ current+=ch; escape=false; continue; }
      if(quote){
        current+=ch;
        if(ch==='\\'){ escape=true; continue; }
        if(ch===quote){ quote=null; }
        continue;
      }
      if(ch==='"' || ch==="'"){ quote=ch; current+=ch; continue; }
      if(ch==='('){ depth++; current+=ch; continue; }
      if(ch===')'){
        if(depth>0){ depth--; current+=ch; continue; }
      }
      if(ch===',' && depth===0){ args.push(current.trim()); current=''; continue; }
      current+=ch;
    }
    if(current.trim().length || inner.trim().length===0){ args.push(current.trim()); }
    return args;
  };
  
  const normalizeActionString=(raw)=>{
    if(!raw) return '';
    let trimmed=String(raw).trim();
    if(!trimmed) return '';
    if((trimmed.startsWith('"') && trimmed.endsWith('"'))){
      try{ trimmed = JSON.parse(trimmed); }
      catch{}
    }
    trimmed = String(trimmed||'').trim();
    if(!trimmed) return '';
    if(trimmed.startsWith('=') || /^B64:/i.test(trimmed) || /^\d+:/.test(trimmed)) return trimmed;
    return `=${trimmed}`;
  };
  
  const resolveTargetArg=(arg)=>{
    if(!arg) return null;
    if(arg.kind==='range' || arg.kind==='ref') return arg;
    try{
      const raw = window.Formula.valOf(arg);
      if(raw==null) return null;
      const text = String(raw).trim();
      if(!text) return null;
      if(text.toLowerCase()==='self') return anchor;
      const parsed = window.parseAlt?.(text, anchor) || window.parseA1g?.(text, arr.id);
      if(parsed) return parsed;
    }catch{}
    return null;
  };

  const rawArgs = parseRawArgs(ast?.raw||'');
  const actionRawStr = rawArgs.length>=2 ? rawArgs[1] : (rawArgs[0]||'');
  const actionFormula = normalizeActionString(actionRawStr);
  if(!actionFormula){ return; }

  const targetArg = ast.args.length>=2 ? ast.args[0] : null;
  const resolvedTarget = resolveTargetArg(targetArg) || anchor;

  const register = (t)=>{
    const arrId = t.arrId ?? arr.id;
    const targetArr = window.Store.getState().arrays[arrId];
    if(!targetArr) return;
    const coord = {x:t.x, y:t.y, z:t.z};
    const chKey = keyChunk(...Object.values(chunkOf(coord.x,coord.y,coord.z)));
    const ch=targetArr.chunks[chKey];
    const idx=ch?.cells.findIndex(c=>c.x===coord.x&&c.y===coord.y&&c.z===coord.z) ?? -1;
    if(idx<0||!ch) return;
    const prev=ch.cells[idx];
    const meta = normalizeMetaKeys(prev.meta||{});
    meta.on_click = actionFormula;
    meta.onClickBusy = false;
    ch.cells[idx] = {...prev, meta};
    window.UI.renderSheetCell(targetArr, coord.x, coord.y, coord.z);
    try{ ch.markDirty?.(); window.Scene.renderArray(targetArr); }catch{}
  };

  const markClickable=(coord)=>{
    const td=document.querySelector(`td.cell[data-x="${coord.x}"][data-y="${coord.y}"][data-z="${coord.z}"]`);
    if(td) td.classList.add('clickable');
  };

  if(resolvedTarget && resolvedTarget.kind==='range'){
    const xs=resolvedTarget.cells.map(c=>c.x), ys=resolvedTarget.cells.map(c=>c.y);
    const minX=Math.min(...xs), maxY=Math.max(...ys);
    resolvedTarget.cells.forEach(c=> markClickable(c));
    register({x:minX,y:maxY,z:resolvedTarget.cells[0].z, arrId: resolvedTarget.cells[0].arrId});
  } else if(resolvedTarget && resolvedTarget.kind==='ref'){
    markClickable(resolvedTarget);
    register(resolvedTarget);
  } else {
    if(resolvedTarget && resolvedTarget!==anchor){ markClickable(resolvedTarget); }
    register({...resolvedTarget, arrId: resolvedTarget.arrId ?? arr.id});
  }
});

/**
 * TOAST(message[, duration]) - Show toast notification
 * Lines 16288-16294 (~7 lines)
 */
tag('TOAST',['ACTION'],(anchor,arr,ast)=>{
  const valOf = window.Formula.valOf;
  const message = String(valOf(ast.args[0]||''));
  const duration = (+valOf(ast.args[1])||3000);
  showToast(message);
  setTimeout(()=>{ 
    const toast=document.getElementById('toast'); 
    if(toast) toast.style.display='none'; 
  }, duration);
});

/**
 * ONCLICK_WRAPPER(actionFormulaOrBlock, targetRef?) - Helper for on_click
 * Lines 16296-16311 (~16 lines)
 */
tag('ONCLICK_WRAPPER',['ACTION'],(anchor,arr,ast)=>{
  const valOf = window.Formula.valOf;
  const action = String(valOf(ast.args[0]||''));
  const target = ast.args[1] || anchor;
  const t = (target&&target.kind)? target : anchor;
  const targetArr = window.Store.getState().arrays[t.arrId || arr.id];
  if(!targetArr) return;
  const ch=targetArr.chunks[keyChunk(...Object.values(chunkOf(t.x,t.y,t.z)))]; 
  if(!ch) return;
  const idx=ch.cells.findIndex(c=>c.x===t.x&&c.y===t.y&&c.z===t.z); 
  if(idx<0) return;
  const prev=ch.cells[idx];
  const meta = normalizeMetaKeys(prev.meta||{});
  meta.on_click = action;
  ch.cells[idx] = {...prev, meta};
  const s=window.Store.getState().selection; 
  const currentId = s.arrayId ?? (window.Store.getState().arrays[1]?1:-1);
  if(currentId === (t.arrId||arr.id) && window.UI?.renderSheetCell) {
    window.UI.renderSheetCell(targetArr, t.x, t.y, t.z);
  }
});

/**
 * NOTE(text[, targetRefOrRange]) - Add visible note
 * Lines 16313-16350 (~38 lines)
 */
tag('NOTE',['ACTION'],(anchor,arr,ast)=>{
  const valOf = window.Formula.valOf;
  const noteText = String(valOf(ast.args[0]||''));
  const target = ast.args[1] || anchor;
  const applyNote = (t)=>{
    const targetArr = window.Store.getState().arrays[t.arrId || arr.id];
    if(!targetArr){ console.warn('NOTE: target array missing', t); return; }
    const chKey = keyChunk(...Object.values(chunkOf(t.x,t.y,t.z)));
    let ch = targetArr.chunks[chKey];
    if(!ch){
      window.Actions.resizeArrayIfNeeded(targetArr, t);
      ch = targetArr.chunks[chKey];
      if(!ch){ console.warn('NOTE: chunk still missing', t); return; }
    }
    let idx = ch.cells.findIndex(c=>c.x===t.x&&c.y===t.y&&c.z===t.z);
    if(idx<0){ 
      ch.cells.push({x:t.x, y:t.y, z:t.z, value:'', formula:null, meta:{}}); 
      idx = ch.cells.length - 1; 
    }
    const prev = ch.cells[idx];
    ch.cells[idx] = {...prev, meta:{...(prev.meta||{}), noteText}};
    console.log('NOTE: set meta', {arrId:targetArr.id, x:t.x, y:t.y, z:t.z, meta:ch.cells[idx].meta});
    const s=window.Store.getState().selection; 
    const currentId = s.arrayId ?? (window.Store.getState().arrays[1]?1:-1);
    if(currentId === (t.arrId||arr.id) && window.UI?.renderSheetCell) {
      window.UI.renderSheetCell(targetArr, t.x, t.y, t.z);
    }
  };
  if(target && target.kind==='range'){
    target.cells.forEach(c=>{
      const td=document.querySelector(`td.cell[data-x="${c.x}"][data-y="${c.y}"][data-z="${c.z}"]`);
      if(td) td.classList.add('note-hl');
    });
    const xs=target.cells.map(c=>c.x), ys=target.cells.map(c=>c.y);
    const minX=Math.min(...xs), maxY=Math.max(...ys);
    applyNote({x:minX,y:maxY,z:target.cells[0].z, arrId:target.cells[0].arrId});
  } else if(target && target.kind==='ref'){
    const td=document.querySelector(`td.cell[data-x="${target.x}"][data-y="${target.y}"][data-z="${target.z}"]`);
    if(td) td.classList.add('note-hl');
    applyNote(target);
  } else {
    applyNote({...anchor});
  }
});

// Export helpers
if(typeof window !== 'undefined'){
  window.normalizeActionFormula = normalizeActionFormula;
  window.executeActionFormula = executeActionFormula;
}

