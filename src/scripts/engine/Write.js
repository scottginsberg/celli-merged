/**
 * Write Transaction System
 * Handles transactional cell updates with rollback support
 * Extracted from merged2.html lines 12245-12459
 */

import { aKey, showToast } from './Constants.js';
import { History } from './History.js';

/**
 * Check win conditions (game system integration)
 */
let checkingWinConditions = false;

export function checkWinConditions() {
  if (checkingWinConditions) return;
  const S = window.Store?.getState?.();
  if (!S || !S.gameState || S.gameState.goals.size === 0 || S.gameState.hasWon) return;

  checkingWinConditions = true;
  try {
    let allGoalsMet = true;
    for (const [key, conditionRef] of S.gameState.goals.entries()) {
      const val = window.Formula?.getCellValue?.(conditionRef);
      if (val !== 1 && val !== '1' && val !== true) {
        allGoalsMet = false;
        break;
      }
    }

    if (allGoalsMet) {
      S.gameState.hasWon = true;
      S.gameState.winCallbacks.forEach(cb => {
        try {
          const tx = Write.start('game.onwin', 'Triggering ONWIN');
          window.Formula?.executeAt?.(cb.anchor, cb.callback, tx);
          Write.commit(tx);
        } catch(e) {
          console.error('ONWIN callback error:', e);
        }
      });
      showToast("🎉 You Win! 🎉");
    }
  } finally {
    checkingWinConditions = false;
  }
}

/**
 * Write Transaction System
 * Provides atomic cell updates with dependency tracking
 */
export const Write = (() => {
  let nextId = 1;
  
  /**
   * Start a new transaction
   */
  function start(origin, reason) {
    return { id: nextId++, ops: [], reason, time: Date.now(), origin };
  }
  
  /**
   * Set a cell value within a transaction
   */
  function set(tx, arrId, coord, next) {
    const Store = window.Store;
    const Actions = window.Actions;
    const Scene = window.Scene;
    const UI = window.UI;
    
    const arr = Store.getState().arrays[arrId];
    if(!arr) return;
    
    // Ensure array is large enough
    Actions.resizeArrayIfNeeded(arr, coord);
    
    const prevCell = UI.getCell(arrId, coord);
    const prev = { 
      value: prevCell.value, 
      formula: prevCell.formula, 
      meta: prevCell.meta || {} 
    };
    
    // If formula is being changed/removed, revert any 3D_ROTATE and clean up emitted cells
    const ak = aKey({arrId, ...coord});
    const skipCleanup = !!(next && next.meta && next.meta.skip_cleanup);
    
    if(!skipCleanup && prev.formula && (next.formula === null || next.formula === '' || next.formula !== prev.formula)) {
      // Attempt 3D_ROTATE auto-revert
      try{
        const S=Store.getState();
        const rec=(S.activeRotations||new Map()).get(ak);
        const suppressed=(S.suppress3DRotateRevert||new Set()).has(ak);
        if(rec && !suppressed){
          const targ=S.arrays[rec.targetId];
          if(targ){
            const pivotWorld = Scene.cellWorldPos(targ, rec.pivot.x, rec.pivot.y, rec.pivot.z);
            const rx=-(rec.steps.sx||0), ry=-(rec.steps.sy||0), rz=-(rec.steps.sz||0);
            (rec.ids||[rec.targetId]).map(id=>S.arrays[id]).filter(Boolean).forEach(a=> Scene.rotateArrayAround(a, pivotWorld, rx, ry, rz));
            (rec.ids||[rec.targetId]).map(id=>S.arrays[id]).filter(Boolean).forEach(a=>{ 
              if(a._frame){ 
                a.offset={ 
                  x:Math.round(a._frame.position.x), 
                  y:Math.round(a._frame.position.y), 
                  z:Math.round(a._frame.position.z) 
                }; 
              }
            });
          }
          const map=new Map(S.activeRotations); 
          map.delete(ak); 
          Store.setState({activeRotations:map});
        }
        if(suppressed){ 
          const sup=new Set(Store.getState().suppress3DRotateRevert); 
          sup.delete(ak); 
          Store.setState({suppress3DRotateRevert:sup}); 
        }
      }catch{}
      
      // Clean up emitted cells
      const S = Store.getState();
      const emitted = S.emittedByAnchor.get(ak);
      if(emitted) {
        tx._clearVisited = tx._clearVisited || new Set();
        emitted.forEach(ck => {
          const [eArrId, coords] = ck.split(':');
          const [x, y, z] = coords.split(',').map(Number);
          const childKey = `${eArrId}:${x},${y},${z}`;
          if(tx._clearVisited.has(childKey)) { 
            S.sourceByCell.delete(ck); 
            return; 
          }
          tx._clearVisited.add(childKey);
          // Clear the emitted cell
          if(eArrId !== arrId || x !== coord.x || y !== coord.y || z !== coord.z) {
            Write.set(tx, +eArrId, {x, y, z}, { 
              value: '', 
              formula: null, 
              meta: { skip_cleanup: true } 
            });
          }
          S.sourceByCell.delete(ck);
        });
        S.emittedByAnchor.delete(ak);
      }
    }
    
    let merged = {
      value: next.value !== undefined ? next.value : prevCell.value,
      formula: next.formula !== undefined ? next.formula : prevCell.formula,
      meta: { ...prev.meta, ...(next.meta || {}), from: tx.origin }
    };
    
    // If clearing a cell, strip visual-emission metadata
    const clearingCell = ((merged.formula==null || merged.formula==='') && 
                          (merged.value==='' || merged.value==null || merged.value===undefined));
    if (clearingCell) {
      const mm = {...(merged.meta||{})};
      delete mm.generated; 
      delete mm.emitter;
      merged = { ...merged, meta: mm };
    }
    
    // Emission tracking for generated blocks
    const S = Store.getState();
    if(merged.meta && merged.meta.emitter){
      const srcAk = merged.meta.emitter;
      const ck = `${arrId}:${coord.x},${coord.y},${coord.z}`;
      if(ck !== srcAk){
        const set = S.emittedByAnchor.get(srcAk) || new Set();
        set.add(ck);
        S.emittedByAnchor.set(srcAk, set);
        S.sourceByCell.set(ck, srcAk);
      }
    }
    
    // Apply to in-memory model immediately
    Actions._setCellRaw(arrId, coord, merged);
    tx.ops.push({ arrId, x: coord.x, y: coord.y, z: coord.z, prev, next: merged });
  }
  
  /**
   * Commit a transaction
   */
  function commit(tx) {
    const Store = window.Store;
    const Actions = window.Actions;
    const Scene = window.Scene;
    const UI = window.UI;
    const Formula = window.Formula;
    
    // Store transaction in data history
    History.dataPast.push(tx);
    if(History.dataPast.length > History.dataMax) History.dataPast.shift();
    History.dataFuture = [];
    
    // Gather changed anchors for recompute
    const changedAnchors = new Set();
    const affectedArrays = new Set();
    
    for (const op of tx.ops) {
      const skip = !!(op.next?.meta && op.next.meta.skip_recompute);
      if(!skip){
        const key = `${op.arrId}:${op.x},${op.y},${op.z}`;
        changedAnchors.add(key);
      }
      affectedArrays.add(op.arrId);
    }
    
    // Trigger dependency recompute
    if(!(Formula?.isRecomputing && Formula.isRecomputing())){
      Formula?.recomputeAnchors?.(Array.from(changedAnchors));
    }
    
    // Collect emitted cells that became empty
    const toRestore = [];
    try{
      const S = Store.getState();
      for(const op of tx.ops){
        const becameEmpty = (op.next.formula==null || op.next.formula==='') && 
                           (op.next.value==='' || op.next.value===null || op.next.value===undefined);
        if(!becameEmpty) continue;
        const ck = `${op.arrId}:${op.x},${op.y},${op.z}`;
        const srcAk = S.sourceByCell.get(ck);
        if(!srcAk) continue;
        const [aId, rest] = srcAk.split(':');
        const [sx, sy, sz] = rest.split(',').map(Number);
        const sc = Formula?.getCell?.({arrId:+aId, x:sx, y:sy, z:sz});
        if(sc && sc.formula) toRestore.push({arrId:+aId,x:sx,y:sy,z:sz});
      }
    }catch{}
    
    // Update visuals for affected arrays
    affectedArrays.forEach(id => {
      const arr = Store.getState().arrays[id];
      if(arr) {
        const affectedLayers = new Set();
        for (const op of tx.ops) {
          if(op.arrId === id) {
            affectedLayers.add(op.z);
            Scene?.updateValueSprite?.(arr, op.x, op.y, op.z, op.next);
          }
        }
        
        // Re-render each affected layer
        affectedLayers.forEach(z => {
          const layerKey = `${arr.id}:${z}`;
          ['empty','ghost','filled','formula','edges'].forEach(type => {
            const rec = Scene?.getLayerMesh?.(`${layerKey}:${type}`);
            if(rec && rec.mesh) {
              rec.mesh.count = 0;
            }
          });
          Scene?.renderLayer?.(arr, z);
        });
        
        Scene?.renderArray?.(arr);
        
        if(id === Store.getState().selection.arrayId && UI?.renderSheet) {
          UI.renderSheet();
        }
      }
    });
    
    // Auto-save (debounced)
    try{
      clearTimeout(window.__AUTO_SAVE_T);
      const statusEl = document.getElementById('saveStatus');
      if(statusEl) statusEl.textContent = 'Auto-save: Pending...';
      
      window.__AUTO_SAVE_T = setTimeout(()=>{ 
        try{ 
          Store.getState().actions.saveState(); 
          const statusEl = document.getElementById('saveStatus');
          if(statusEl) statusEl.textContent = `Auto-save: ${new Date().toLocaleTimeString()}`;
        }catch{
          const statusEl = document.getElementById('saveStatus');
          if(statusEl) statusEl.textContent = 'Auto-save: Failed';
        } 
      }, 600);
    }catch{}
    
    // Check win conditions
    setTimeout(checkWinConditions, 0);
    
    // Restore cleared emitted cells
    if(toRestore.length>0 && !Actions._repairing){
      setTimeout(()=>{
        if(Actions._repairing) return;
        Actions._repairing = true;
        try{
          const rtx = Write.start('emit.restore','Restore cleared emitted cells');
          const uniq = new Set(toRestore.map(r=>`${r.arrId}:${r.x},${r.y},${r.z}`));
          uniq.forEach(k=>{ 
            const [aid,coords]=k.split(':'); 
            const [x,y,z]=coords.split(',').map(Number);
            Formula?.executeAt?.({arrId:+aid,x,y,z}, undefined, rtx);
          });
          Write.commit(rtx);
        }catch(e){ 
          console.warn('Restore emitted failed', e); 
        } finally{ 
          Actions._repairing = false; 
        }
      },0);
    }
  }
  
  /**
   * Rollback a transaction
   */
  function rollback(tx) {
    const Actions = window.Actions;
    for (const op of tx.ops.reverse()) {
      Actions?._setCellRaw?.(op.arrId, {x:op.x, y:op.y, z:op.z}, op.prev);
    }
  }
  
  return { start, set, commit, rollback };
})();

