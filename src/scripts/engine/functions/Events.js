/**
 * Event & State Management Functions
 * Extracted from merged2.html (~200 lines combined)
 * 
 * Functions for events, focus, selection, and state queries
 */

import { tag } from '../FunctionHelpers.js';
import { Write } from '../Write.js';
import { aKey, keyChunk, chunkOf, showToast } from '../Constants.js';
import { ensureOnSelectHooks } from '../CellMeta.js';

// Note: Functions use window.Store, window.Actions, window.Formula, window.Scene at runtime

/**
 * ON_EVENT(eventName, actionFormula) - Register event listener
 * Lines 17407-17423 (~17 lines)
 */
tag('ON_EVENT',['META'],(anchor,arr,ast)=>{
  const valOf = window.Formula.valOf;
  const eventName = String(valOf(ast.args[0]) || '');
  const actionFormula = String(valOf(ast.args[1]) || '');
  if(!eventName || !actionFormula) throw new Error('ON_EVENT requires eventName and actionFormula');
  
  const listeners = window.Store.getState().eventListeners;
  if(!listeners.has(eventName)) listeners.set(eventName, []);
  
  const listenerObj = {
    anchor: {...anchor},
    actionFormula,
    arrId: arr.id
  };
  
  listeners.get(eventName).push(listenerObj);
  window.Actions.setCell(arr.id, anchor, `Listen[${eventName}]: ${actionFormula}`, ast.raw, true);
});

/**
 * FIRE_EVENT(eventName, [payload]) - Fire event to all listeners
 * Lines 17424-17454 (~31 lines)
 */
tag('FIRE_EVENT',['ACTION'],(anchor,arr,ast,tx)=>{
  const valOf = window.Formula.valOf;
  const eventName = String(valOf(ast.args[0]) || '');
  const payload = ast.args[1] !== undefined ? valOf(ast.args[1]) : null;
  if(!eventName) throw new Error('FIRE_EVENT requires eventName');
  
  // Store payload in global state temporarily
  if(payload !== null) {
    window.Store.getState().globalState.set(`event.payload.${eventName}`, payload);
  }
  
  const listeners = window.Store.getState().eventListeners.get(eventName) || [];
  
  // Execute all listener formulas
  listeners.forEach(listener => {
    try {
      const targetAnchor = {arrId: listener.arrId, ...listener.anchor};
      if(tx){
        window.Formula.executeAt(targetAnchor, listener.actionFormula, tx);
      } else {
        const etx = Write.start(`event.${eventName}`,'Event dispatch');
        window.Formula.executeAt(targetAnchor, listener.actionFormula, etx);
        Write.commit(etx);
      }
    } catch(e) {
      console.error(`Event listener error for ${eventName}:`, e);
    }
  });
  
  window.Actions.setCell(arr.id, anchor, `Fired[${eventName}]${payload ? ` with ${payload}` : ''}`, ast.raw, true);
});

/**
 * GET_PLAYER_FOCUS() - Get current player focus as address
 * Lines 17457-17466 (~10 lines)
 */
tag('GET_PLAYER_FOCUS',['PURE'],(anchor,arr,ast)=>{
  const selection = window.Store.getState().selection;
  if(!selection.focus || !selection.arrayId) {
    window.Actions.setCell(arr.id, anchor, '', ast.raw, true);
    return;
  }
  
  const address = `@[${selection.focus.x},${selection.focus.y},${selection.focus.z},${selection.arrayId}]`;
  window.Actions.setCell(arr.id, anchor, address, ast.raw, true);
});

/**
 * CANT_TARGET(range) - Mark cells as untargetable
 * Lines 17467-17492 (~26 lines)
 */
tag('CANT_TARGET',['META'],(anchor,arr,ast)=>{
  const target = ast.args[0];
  if(!target) throw new Error('CANT_TARGET requires a range or reference');
  
  const markUntargetable = (x, y, z, arrId) => {
    const targetArr = window.Store.getState().arrays[arrId];
    if(!targetArr) return;
    const ch = targetArr.chunks[keyChunk(...Object.values(chunkOf(x, y, z)))];
    if(!ch) return;
    const cell = ch.cells.find(c => c.x === x && c.y === y && c.z === z);
    if(cell) {
      if(!cell.meta) cell.meta = {};
      cell.meta.isTargetable = false;
    }
  };
  
  if(target.kind === 'ref') {
    markUntargetable(target.x, target.y, target.z, target.arrId);
  } else if(target.kind === 'range') {
    target.cells.forEach(cell => {
      markUntargetable(cell.x, cell.y, cell.z, cell.arrId);
    });
  }
  
  window.Actions.setCell(arr.id, anchor, 'Protected cells marked', ast.raw, true);
});

/**
 * GET_ARRAY_POS([ref]) - Get array offset as JSON
 * Lines 17495-17500 (~6 lines)
 */
tag('GET_ARRAY_POS',["PURE"],(anchor,arr,ast)=>{
  const target=ast.args[0]&&ast.args[0].kind==='ref'? window.Store.getState().arrays[ast.args[0].arrId] : arr;
  if(!target){ window.Actions.setCell(arr.id,anchor,'',ast.raw,true); return; }
  const o = target.offset||{x:0,y:0,z:0};
  window.Actions.setCell(arr.id, anchor, `{"x":${o.x},"y":${o.y},"z":${o.z}}`, ast.raw, true);
});

/**
 * SET_ARRAY_POS(target, x, y, z) - Set array offset
 * Lines 17501-17514 (~14 lines)
 */
tag('SET_ARRAY_POS',["SCENE","ACTION"],(anchor,arr,ast)=>{
  const valOf = window.Formula.valOf;
  let target=null;
  if(ast.args[0] && ast.args[0].kind==='ref'){
    target = window.Store.getState().arrays[ast.args[0].arrId];
  } else {
    const maybeId = +valOf(ast.args[0]);
    if(Number.isInteger(maybeId)) target = window.Store.getState().arrays[maybeId];
    if(!target) target = arr;
  }
  const x=(+valOf(ast.args[1])||0), y=(+valOf(ast.args[2])||0), z=(+valOf(ast.args[3])||0);
  if(!target) { window.Actions.setCell(arr.id,anchor,'!ERR:ARR',ast.raw,true); return; }
  window.Scene.setArrayOffset(target,{x,y,z});
  window.Actions.setCell(arr.id,anchor,`Pos:${x},${y},${z}`,ast.raw,true);
});

/**
 * ON_SELECT([targets], action) - Execute action on selection
 * Lines 18216-18250 (~35 lines)
 */
tag('ON_SELECT',['META'],(anchor,arr,ast)=>{
  // Turn off hook for this anchor
  if(ast.args.length===1 && typeof ast.args[0]==='string'){
    const t=String(ast.args[0]||'').toLowerCase();
    if(t==='off'||t==='none'||t==='0'||t==='false'){
      arr.on_select_hooks = ensureOnSelectHooks(arr).filter(h=>!(h.anchor.x===anchor.x && h.anchor.y===anchor.y && h.anchor.z===anchor.z));
      window.Actions.setCell(arr.id, anchor, 'on_select:OFF', ast.raw, true);
      return;
    }
  }

  let rangeArg=null;
  const rawAction = (ast.args.length>=2 ? ast.args[1] : ast.args[0]);
  let action = (typeof rawAction === 'string') ? rawAction : String(rawAction||'');
  if(action && action[0] !== '=') action = `=${action}`;

  // Build cell set for matching
  const cells = new Set();
  if(ast.args.length>=2) rangeArg = ast.args[0];
  if(rangeArg && rangeArg.kind==='range'){
    rangeArg.cells.forEach(c=>cells.add(`${c.x},${c.y},${c.z}`));
  } else if(rangeArg && rangeArg.kind==='ref'){
    cells.add(`${rangeArg.x},${rangeArg.y},${rangeArg.z}`);
  } else {
    cells.add(`${anchor.x},${anchor.y},${anchor.z}`);
  }

  // replace any existing hook at this anchor
  const hooks = ensureOnSelectHooks(arr).filter(h=>!(h.anchor.x===anchor.x && h.anchor.y===anchor.y && h.anchor.z===anchor.z));
  hooks.push({ anchor:{x:anchor.x,y:anchor.y,z:anchor.z}, cells, action });
  arr.on_select_hooks = hooks;
});

/**
 * IS_FOCUS_ARRAY([targetId]) - Check if array is focused
 * Lines 18265-18270 (~6 lines)
 */
tag('IS_FOCUS_ARRAY',['PURE'],(anchor,arr,ast)=>{
  const valOf = window.Formula.valOf;
  const targetId=ast.args[0] ? +valOf(ast.args[0]) : arr.id;
  const s=window.Store.getState().selection;
  const isFocused = s.arrayId === targetId;
  window.Actions.setCell(arr.id, anchor, isFocused?1:0, ast.raw, true);
});

/**
 * AXES(mode) - Toggle array axes visibility
 * Lines 18274-18283 (~10 lines)
 */
tag('AXES',['SCENE'],(anchor,arr,ast)=>{
  const m = String(window.Formula.valOf(ast.args[0] ?? '1')).toLowerCase();
  arr.axesVisible = (m==='1'||m==='true'||m==='on') ? true :
    (m==='0'||m==='false'||m==='off') ? false : undefined;
  window.Scene.syncVisibility(arr);
  window.Actions.setCell(arr.id, anchor, 
    `Axes:${arr.axesVisible===undefined?'AUTO':(arr.axesVisible?'ON':'OFF')}`,
    ast.raw, true
  );
});

/**
 * FOCUS_SET(content) or FOCUS_SET(mode, content) - Set focused cell content
 * Lines 18284-18319 (~36 lines)
 */
tag('FOCUS_SET',['ACTION'],(anchor,arr,ast)=>{
  const valOf = window.Formula.valOf;
  const s = window.Store.getState().selection;
  if(!s?.arrayId || !s.focus) throw new Error('No focus');
  
  let mode = 'text', content = '';
  if(ast.args.length === 1){
    content = String(valOf(ast.args[0]||''));
    mode = content.startsWith('=') ? 'formula' : 'text';
  } else {
    mode = String(valOf(ast.args[0]||'text')).toLowerCase();
    content = String(valOf(ast.args[1]||''));
  }
  
  if(mode === 'clipboard'){
    try {
      navigator.clipboard.writeText(content);
      window.Actions.setCell(arr.id, anchor, `📋 Copied: ${content.slice(0,20)}`, ast.raw, true);
      showToast('Copied to clipboard');
    } catch(e) {
      window.Actions.setCell(arr.id, anchor, '❌ Copy failed', ast.raw, true);
      showToast('Copy failed');
    }
    return;
  }
  
  if(mode === 'formula' || content.startsWith('=')){
    window.Formula.setFormula({arrId:s.arrayId, ...s.focus}, content);
    window.Formula.executeAt({arrId:s.arrayId, ...s.focus});
  } else {
    window.Actions.setCell(s.arrayId, s.focus, content, null, true);
  }
  
  window.Actions.setCell(arr.id, anchor, 'OK', ast.raw, true);
});

/**
 * COPY(text) - Copy text to clipboard
 * Lines 18322-18330 (~9 lines)
 */
tag('COPY',['IO','ACTION'],(anchor,arr,ast)=>{
  const text = String(window.Formula.valOf(ast.args[0]||''));
  try{
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard');
  }catch(e){
    showToast('Copy failed');
  }
});

