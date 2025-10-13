/**
 * Actions - Array and Selection Management
 * Extracted from merged2.html lines 12507-13065 (~558 lines)
 * 
 * Core actions for managing arrays, cells, and selections
 */

import { Write } from './Write.js';
import { History } from './History.js';
import {
  aKey,
  CHUNK_SIZE,
  chunkOf,
  keyChunk,
  formatLocalAddress,
  showToast
} from './Constants.js';
import { normalizeMetaKeys, ensureOnSelectHooks } from './CellMeta.js';
import { computeSelectionFaceHint } from './SelectionHelpers.js';

// Note: Actions uses window.Store, window.Scene, window.UI, window.Formula at runtime
// These are global dependencies to avoid circular imports

export const Actions = {
  // Batch write system for dependency propagation
  _batch: null,
  _repairing: false,
  
  begin: function() { 
    if(!this._batch) this._batch = { 
      changed:new Set(), 
      tx: Write.start('actions.batch','Grouped setCell') 
    }; 
  },
  
  end: function() {
    if(!this._batch) return;
    try{
      if(this._batch.tx){ Write.commit(this._batch.tx); }
      
      const affectedArrays = new Set();
      for (const k of this._batch.changed) {
        const [arrId, rest] = k.split(':');
        const [x,y,z] = rest.split(',').map(Number);
        const numArrId = +arrId;
        affectedArrays.add(numArrId);
        const arr = window.Store.getState().arrays[numArrId];
        if(arr && window.UI?.renderSheetCell) window.UI.renderSheetCell(arr, x, y, z);
      }
      
      const currentArrayId = window.Store.getState().selection.arrayId;
      if(affectedArrays.has(currentArrayId) && window.UI?.renderSheet) {
        window.UI.renderSheet();
      }
      
      affectedArrays.forEach(id=>{ 
        const arr=window.Store.getState().arrays[id]; 
        if(arr) window.Scene.renderArray(arr); 
      });
    } finally {
      this._batch = null;
    }
  },

  createArray: ({id,name='Array',size={x:6,y:4,z:6},hidden=false,sealed=false,offset={x:0,y:0,z:0}})=>{
    const S0 = window.Store.getState();
    let arrId;
    
    if(id !== undefined){
      if(!Number.isInteger(id)) throw new Error('Array ID must be an integer');
      if(id>0 && S0.arrays[id]) throw new Error(`Array with ID ${id} already exists.`);
      arrId = id;
    } else {
      const used = Object.values(S0.arrays).map(a=>a.id).filter(n=>Number.isInteger(n) && n>0);
      const sorted = [...new Set(used)].sort((a,b)=>a-b);
      let next = 1;
      for(const n of sorted){ 
        if(n===next) next++; 
        else if(n>next) break; 
      }
      arrId = next;
    }
    
    const arr = {
      id:arrId, name, size:{...size}, hidden, sealed,
      state:'ACTIVE', stableCount:0, lastHash:null, lastDepSig:null,
      collisionMode:'edit',
      fnPolicy:{mode:'ALLOW_ALL', allow:new Set(), deny:new Set(), tags:new Set()},
      params:{}, locks:new Set(),
      chunks:{}, labels:[], _frame:null, _colliders:[], offset:{...offset}, _occluders:null
    };
    
    // Build chunks sparsely
    const cDims={
      x:Math.ceil(size.x/CHUNK_SIZE), 
      y:Math.ceil(size.y/CHUNK_SIZE), 
      z:Math.ceil(size.z/CHUNK_SIZE)
    };
    
    for(let cz=0;cz<cDims.z;cz++)
    for(let cy=0;cy<cDims.y;cy++)
    for(let cx=0;cx<cDims.x;cx++){
      const ch = new window.Scene.Chunk(arr, {x:cx,y:cy,z:cz});
      for(let z=0;z<CHUNK_SIZE;z++)
      for(let y=0;y<CHUNK_SIZE;y++)
      for(let x=0;x<CHUNK_SIZE;x++){
        const wx=cx*CHUNK_SIZE+x, wy=cy*CHUNK_SIZE+y, wz=cz*CHUNK_SIZE+z;
        if(wx<size.x&&wy<size.y&&wz<size.z){
          const cell={x:wx,y:wy,z:wz,value:'',formula:null,meta:{}};
          ch.cells.push(cell);
          ch.cellMap.set(`${wx},${wy},${wz}`, cell);
        }
      }
      arr.chunks[keyChunk(cx,cy,cz)] = ch;
    }

    const S=window.Store.getState();
    
    // Initialize global grid phase on first array
    if(!S.gridPhase.x&&S.gridPhase.x!==0){
      const phase={x:Math.round(offset.x), y:Math.round(offset.y), z:Math.round(offset.z)};
      window.Store.setState({gridPhase:phase});
    }
    
    // Snap offset to global grid phase
    const arrScale = window.arrayVoxelScale ? window.arrayVoxelScale(arr) : 1;
    const snapAxis=(axis,val,sz)=>{
      const phase = window.Store.getState().gridPhase[axis]||0;
      const half = (sz * arrScale) / 2;
      const base = (axis==='z') ? (half - arrScale/2) : (-(half) + arrScale/2);
      return Math.round((val - base - phase)/arrScale) * arrScale + base + phase;
    };
    
    arr.offset={ 
      x:snapAxis('x', offset.x, size.x), 
      y:snapAxis('y', offset.y, size.y), 
      z:snapAxis('z', offset.z, size.z) 
    };
    
    window.Store.setState({ 
      arrays:{...S.arrays,[arrId]:arr}, 
      nextArrayId:Math.max(S.nextArrayId, arrId+1), 
      lastCreatedArrayId:arrId 
    });
    
    window.Scene.renderArray(arr);
    
    // Immediately construct LOD1 meshes
    try{
      Object.values(arr.chunks).forEach(ch=>{ 
        ch.ensureMesh?.(); 
        ch.setLOD?.(1); 
        window.rehydrateChunkInstances?.(arr, ch); 
      });
      arr._warmupFrames = 6;
      try{ window.forceRenderOrderRefresh?.(false); }catch{}
    }catch{}
    
    // Snap array beyond existing arrays with gap
    try{
      const arrays = Object.values(window.Store.getState().arrays).filter(a=>a && a.id!==arr.id);
      if(arrays.length){
        let maxX=-Infinity;
        arrays.forEach(a=>{
          const x=a.offset?.x||0;
          const s=window.arrayVoxelScale ? window.arrayVoxelScale(a) : 1;
          maxX=Math.max(maxX, x + (a.size.x*s)/2);
        });
        const desired = {
          x: Math.round(maxX + arrScale + (arr.size.x*arrScale)/2),
          y: arr.offset.y,
          z: arr.offset.z
        };
        window.setArrayOffset?.(arr, desired, {interactive:true});
      }
    }catch{}
    
    // Force shell creation
    try{
      const currentSel = window.Store.getState().selection;
      if(!currentSel.arrayId || !window.Store.getState().arrays[currentSel.arrayId] || 
         window.Store.getState().arrays[currentSel.arrayId].hidden){
        Actions.setSelection(arrId, {x:0,y:0,z:0});
      }
    }catch{}
    
    // Apply pending meta
    try{
      const St=window.Store.getState();
      if(Array.isArray(St.pendingMeta) && St.pendingMeta.length){
        const remain=[]; 
        const ptx=Write.start('pending.meta','Apply pending meta');
        St.pendingMeta.forEach(item=>{
          if(item?.target?.arrId===arrId){
            try{
              const t=item.target; 
              const prior=window.Formula.getCell({arrId:arrId,x:t.x,y:t.y,z:t.z})||{};
              const mergedMeta = normalizeMetaKeys({...(prior.meta||{}), ...(item.meta||{})});
              Write.set(ptx, arrId, {x:t.x,y:t.y,z:t.z}, { 
                value: prior.value??'', 
                formula: prior.formula??null, 
                meta:mergedMeta 
              });
            }catch(e){ remain.push(item); }
          } else { remain.push(item); }
        });
        Write.commit(ptx);
        window.Store.setState({pendingMeta:remain});
        if(remain.length !== St.pendingMeta.length){ 
          try{ window.UI.renderSheet?.(); }catch{} 
        }
      }
    }catch{}
    
    try{
      if(window.Store.getState().scene?.physicsDebugAll){
        window.Scene.setPhysicsDebugAll(true);
      }
    }catch(e){ console.warn('Reapplying physics debug overrides for new array failed', e); }
    
    return arr;
  },

  deleteArray: (arrId, opts={})=>{
    const S = window.Store.getState();
    const arr = S.arrays[arrId];
    if(!arr) return false;

    arr.hidden = true;
    window.Scene.syncVisibility(arr);
    try{ window.Scene.removeArrayGraphics?.(arr); }catch{}

    // Clean emitted tracking
    try{
      const emitted = S.emittedByAnchor;
      const source = S.sourceByCell;
      [...emitted.keys()].forEach(ak=>{
        if(ak.startsWith(`${arrId}:`)) emitted.delete(ak);
      });
      [...source.keys()].forEach(ck=>{
        if(ck.startsWith(`${arrId}:`)) source.delete(ck);
      });
    }catch{}

    // Clean dependency graph
    try{
      const newDepsByAnchor = new Map();
      S.depsByAnchor.forEach((deps, ak)=>{
        if(!ak.startsWith(`${arrId}:`)) newDepsByAnchor.set(ak, deps);
      });
      const newAnchorsByDep = new Map();
      S.anchorsByDep.forEach((anchors, dk)=>{
        if(dk.startsWith(`${arrId}:`)) return;
        const filtered = new Set([...anchors].filter(a => !String(a).startsWith(`${arrId}:`)));
        if(filtered.size) newAnchorsByDep.set(dk, filtered);
      });
      window.Store.setState({ depsByAnchor:newDepsByAnchor, anchorsByDep:newAnchorsByDep });
    }catch{}

    // Remove from dock groups
    try{
      const ng = new Map(S.dockGroups||new Map());
      ng.forEach((g,k)=>{
        g.members = g.members.filter(id=> id!==arrId);
        if(g.members.length === 0) ng.delete(k);
      });
      window.Store.setState({ dockGroups: ng });
    }catch{}

    // Clean embedded meshes
    try{
      const map = window.__cloneEmbeddedMap?.(window.Store.getState().embeddedMeshes);
      if(map){
        let changed=false;
        map.forEach((rec, key)=>{
          if(rec?.hostArrId===arrId || rec?.sourceArrId===arrId){
            window.__disposeEmbeddedRecord?.(rec);
            map.delete(key);
            changed=true;
          }
        });
        if(changed) window.Store.setState({ embeddedMeshes: map });
      }
    }catch{}

    // Remove from registry
    const arrays = { ...S.arrays };
    delete arrays[arrId];
    window.Store.setState({ arrays });

    // Reroute selection
    try{
      const sel = window.Store.getState().selection;
      if(sel.arrayId === arrId){
        const next = Object.values(window.Store.getState().arrays).find(a=>!a.hidden) || null;
        if(next) Actions.setSelection(next.id, {x:0,y:Math.max(0,next.size.y-1),z:0}, null, '3d');
        else window.Store.setState(s=>({ 
          selection:{ arrayId:null, focus:null, anchor:null, range:null, faceHint:null } 
        }));
      }
      window.UI?.renderSheet?.();
    }catch{}

    showToast(`Deleted #${arrId}`);
    return true;
  },

  _setCellRaw: (arrayId, coord, cellData)=>{
    const S=window.Store.getState();
    const arr=S.arrays[arrayId]; 
    if(!arr) return;
    
    Actions.resizeArrayIfNeeded(arr, coord);
    const c = chunkOf(coord.x,coord.y,coord.z); 
    const k=keyChunk(c.x,c.y,c.z);
    const ch=arr.chunks[k]; 
    if(!ch) return;
    
    let cell = ch.cellMap?.get(`${coord.x},${coord.y},${coord.z}`);
    if(!cell){
      cell = {x:coord.x, y:coord.y, z:coord.z, value:'', formula:null, meta:{}};
      ch.cells.push(cell);
      ch.cellMap?.set(`${coord.x},${coord.y},${coord.z}`, cell);
    }
    
    // Auto-revert 3D_ROTATE on clear
    try{
      const ak = `${arrayId}:${coord.x},${coord.y},${coord.z}`;
      const clearing = (cellData.formula===null || cellData.formula==='');
      if(clearing){
        const rec=(S.activeRotations||new Map()).get(ak);
        const suppressed=(S.suppress3DRotateRevert||new Set()).has(ak);
        if(rec && !suppressed){
          const targ=S.arrays[rec.targetId];
          if(targ){
            const ids=rec.ids||[rec.targetId];
            ids.map(id=>S.arrays[id]).filter(Boolean).forEach(a=>{ 
              if(!a._frame) window.Scene.renderArray(a); 
            });
            const pivotWorld = window.Scene.cellWorldPos(targ, rec.pivot.x, rec.pivot.y, rec.pivot.z);
            const rx=-(rec.steps.sx||0), ry=-(rec.steps.sy||0), rz=-(rec.steps.sz||0);
            ids.map(id=>S.arrays[id]).filter(Boolean).forEach(a=> 
              window.Scene.rotateArrayAround(a, pivotWorld, rx, ry, rz)
            );
            ids.map(id=>S.arrays[id]).filter(Boolean).forEach(a=>{ 
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
          window.Store.setState({activeRotations:map});
          if(suppressed){ 
            const sup=new Set(window.Store.getState().suppress3DRotateRevert); 
            sup.delete(ak); 
            window.Store.setState({suppress3DRotateRevert:sup}); 
          }
        }
      }
    }catch{}
    
    Object.assign(cell, cellData);
    try{ ch.markDirty?.(); }catch{}
    arr.state='ACTIVE'; 
    arr.stableCount=0;
  },

  setCell: (arrayId, coord, value, formula=null, noRender=false)=>{
    const activeTx = Actions._batch?.tx;
    if(activeTx){
      try{
        Write.set(activeTx, arrayId, coord, { value, formula });
        Actions._batch.changed.add(aKey({arrId:arrayId, ...coord}));
        return;
      } catch(e){ console.error('batched setCell failed, falling back', e); }
    }
    
    const tx = Write.start('actions.setCell','single op');
    Write.set(tx, arrayId, coord, { value, formula });
    Write.commit(tx);
  },

  resizeArrayIfNeeded: (arr, coord)=>{
    let changed=false; 
    const newSize={...arr.size};
    if(coord.x>=arr.size.x){ newSize.x=coord.x+1; changed=true; }
    if(coord.y>=arr.size.y){ newSize.y=coord.y+1; changed=true; }
    if(coord.z>=arr.size.z){ newSize.z=coord.z+1; changed=true; }
    if(!changed) return;
    
    const oldSize={...arr.size}; 
    arr.size=newSize;
    const cDims={
      x:Math.ceil(newSize.x/CHUNK_SIZE), 
      y:Math.ceil(newSize.y/CHUNK_SIZE), 
      z:Math.ceil(newSize.z/CHUNK_SIZE)
    };
    
    for(let cz=0;cz<cDims.z;cz++)
    for(let cy=0;cy<cDims.y;cy++)
    for(let cx=0;cx<cDims.x;cx++){
      const k=keyChunk(cx,cy,cz); 
      if(arr.chunks[k]) continue;
      const ch = new window.Scene.Chunk(arr, {x:cx,y:cy,z:cz});
      for(let z=0;z<CHUNK_SIZE;z++)
      for(let y=0;y<CHUNK_SIZE;y++)
      for(let x=0;x<CHUNK_SIZE;x++){
        const wx=cx*CHUNK_SIZE+x, wy=cy*CHUNK_SIZE+y, wz=cz*CHUNK_SIZE+z;
        if(wx<newSize.x&&wy<newSize.y&&wz<newSize.z) {
          ch.cells.push({x:wx,y:wy,z:wz,value:'',formula:null,meta:{}});
        }
      }
      arr.chunks[k] = ch;
    }
    
    for(let z=0; z<arr.size.z; z++){ window.Scene.renderLayer(arr,z); }
    window.Scene.renderArray(arr);
    
    if(changed) {
      Actions.offsetGlobalReferences(arr.id, oldSize, newSize);
    }
    
    // Auto-repair emitted cells in expanded area
    if(!Actions._repairing) {
      const S = window.Store.getState();
      S.emittedByAnchor.forEach((emittedSet, sourceAk) => {
        const hasEmptyInExpansion = Array.from(emittedSet).some(ck => {
          const [eArrId, coords] = ck.split(':');
          if(+eArrId !== arr.id) return false;
          const [x, y, z] = coords.split(',').map(Number);
          const isInExpansion = x >= oldSize.x || y >= oldSize.y || z >= oldSize.z;
          if(isInExpansion) {
            const cell = window.UI.getCell(arr.id, {x, y, z});
            return cell.value === '' || cell.value === null || cell.value === undefined;
          }
          return false;
        });
        
        if(hasEmptyInExpansion) {
          const [aId, rest] = sourceAk.split(':');
          const [sx, sy, sz] = rest.split(',').map(Number);
          setTimeout(() => {
            if(!Actions._repairing) {
              Actions._repairing = true;
              try {
                const tx = Write.start('expand.refill', 'Refill after array expansion');
                window.Formula.executeAt({arrId: +aId, x: sx, y: sy, z: sz}, undefined, tx);
                Write.commit(tx);
              } finally {
                Actions._repairing = false;
              }
            }
          }, 10);
        }
      });
    }
  },
  
  offsetGlobalReferences: (arrayId, oldSize, newSize) => {
    const S = window.Store.getState();
    const dx = newSize.x - oldSize.x;
    const dy = newSize.y - oldSize.y; 
    const dz = newSize.z - oldSize.z;
    
    if(dx === 0 && dy === 0 && dz === 0) return;
    
    console.log(`Offsetting references for array ${arrayId}: expansion (${dx},${dy},${dz})`);
    
    Object.values(S.arrays).forEach(arr => {
      Object.values(arr.chunks).forEach(chunk => {
        chunk.cells.forEach(cell => {
          if(cell.formula) {
            const refs = cell.formula.match(/@\[(-?\d+),(-?\d+),(-?\d+),(-?\d+)\]/g);
            if(refs) {
              let newFormula = cell.formula;
              refs.forEach(ref => {
                const match = ref.match(/@\[(-?\d+),(-?\d+),(-?\d+),(-?\d+)\]/);
                if(match && +match[4] === arrayId) {
                  const refX = +match[1], refY = +match[2], refZ = +match[3];
                  if(refX >= oldSize.x || refY >= oldSize.y || refZ >= oldSize.z) {
                    const newRef = `@[${refX + (refX >= oldSize.x ? dx : 0)},${refY + (refY >= oldSize.y ? dy : 0)},${refZ + (refZ >= oldSize.z ? dz : 0)},${arrayId}]`;
                    newFormula = newFormula.replace(ref, newRef);
                  }
                }
              });
              
              if(newFormula !== cell.formula) {
                cell.formula = newFormula;
                console.log(`Updated formula: ${cell.formula}`);
              }
            }
          }
        });
      });
    });
    
    // Update dependency graph keys
    const newDepsByAnchor = new Map();
    const newAnchorsByDep = new Map();
    
    S.depsByAnchor.forEach((deps, anchorKey) => {
      const [aId, coords] = anchorKey.split(':');
      if(+aId === arrayId) {
        const [x, y, z] = coords.split(',').map(Number);
        if(x >= oldSize.x || y >= oldSize.y || z >= oldSize.z) {
          const newX = x + (x >= oldSize.x ? dx : 0);
          const newY = y + (y >= oldSize.y ? dy : 0);
          const newZ = z + (z >= oldSize.z ? dz : 0);
          const newKey = `${aId}:${newX},${newY},${newZ}`;
          newDepsByAnchor.set(newKey, deps);
        } else {
          newDepsByAnchor.set(anchorKey, deps);
        }
      } else {
        newDepsByAnchor.set(anchorKey, deps);
      }
    });
    
    S.anchorsByDep.forEach((anchors, depKey) => {
      const [aId, coords] = depKey.split(':');
      if(+aId === arrayId) {
        const [x, y, z] = coords.split(',').map(Number);
        if(x >= oldSize.x || y >= oldSize.y || z >= oldSize.z) {
          const newX = x + (x >= oldSize.x ? dx : 0);
          const newY = y + (y >= oldSize.y ? dy : 0);
          const newZ = z + (z >= oldSize.z ? dz : 0);
          const newKey = `${aId}:${newX},${newY},${newZ}`;
          newAnchorsByDep.set(newKey, anchors);
        } else {
          newAnchorsByDep.set(depKey, anchors);
        }
      } else {
        newAnchorsByDep.set(depKey, anchors);
      }
    });
    
    window.Store.setState({ depsByAnchor: newDepsByAnchor, anchorsByDep: newAnchorsByDep });
  },

  setSelection:(arrayId, focus, anchor=null, interactionSource='3d')=>{
    console.log(`[ACTIONS.setSelection] Called with: arrayId=${arrayId}, focus=(${focus.x}, ${focus.y}, ${focus.z}), source=${interactionSource}`);
    window.Store.setState(s=>({ 
      selection:{arrayId, focus, anchor:anchor||focus, range:null, faceHint:null}, 
      ui:{...s.ui, zLayer:focus.z, lastInteraction:interactionSource} 
    }));
    
    const actualSelection = window.Store.getState().selection;
    console.log(`[ACTIONS.setSelection] After setState, actual focus=(${actualSelection.focus.x}, ${actualSelection.focus.y}, ${actualSelection.focus.z})`);
    
    window.Scene.updateFocus(window.Store.getState().selection);
    window.Scene.resetContactCache?.();
    window.UI.updateFocusChip();
    window.UI.renderSheet();

    // ON_SELECT dispatch
    try {
      const arr=window.Store.getState().arrays[arrayId];
      const hooks = ensureOnSelectHooks(arr);
      if(!hooks.length) return;

      if(Actions._handlingOnSelect) return;
      Actions._handlingOnSelect = true;

      const {x,y,z}=focus; 
      const addr=formatLocalAddress(arrayId,{x,y,z});
      const tx=Write.start('hook.on_select','ON_SELECT actions');
      for(const h of hooks){
        if(h.cells.has(`${x},${y},${z}`)){
          const action = String(h.action||'').replaceAll('$ADDR',addr);
          window.Formula.runOnceAt({arrId:arrayId, x:h.anchor.x, y:h.anchor.y, z:h.anchor.z}, action, tx);
        }
      }
      Write.commit(tx);
    } catch(e) {
      console.warn('ON_SELECT hooks failed', e);
    } finally {
      Actions._handlingOnSelect = false;
    }
  },

  setSelectionRange:(arrayId, anchor, focus, interactionSource='3d')=>{
    const xs=[anchor.x,focus.x].map(v=>Number.isFinite(v)?v:0).sort((a,b)=>a-b);
    const ys=[anchor.y,focus.y].map(v=>Number.isFinite(v)?v:0).sort((a,b)=>a-b);
    const zs=[anchor.z,focus.z].map(v=>Number.isFinite(v)?v:0).sort((a,b)=>a-b);
    const focusZ = Number.isFinite(focus.z) ? focus.z : (Number.isFinite(anchor.z) ? anchor.z : 0);
    const range={x1:xs[0],y1:ys[0],x2:xs[1],y2:ys[1],z:focusZ,z1:zs[0],z2:zs[1]};
    const faceHint = computeSelectionFaceHint(anchor, focus, range);
    window.Store.setState(s=>({ 
      selection:{arrayId, focus, anchor, range, faceHint}, 
      ui:{...s.ui, zLayer:focusZ, lastInteraction:interactionSource} 
    }));
    window.Scene.updateFocus(window.Store.getState().selection);
    window.UI.updateFocusChip();
    window.UI.renderSheet();
  },

  moveSelection:(dx,dy,dz=0)=>{
    const s=window.Store.getState().selection; 
    if(!s.arrayId||!s.focus) return;
    const arr=window.Store.getState().arrays[s.arrayId]; 
    if(!arr) return;
    const lastInteraction = window.Store.getState().ui?.lastInteraction || '3d';
    const newFocus={
      x:Math.max(0,Math.min(arr.size.x-1,s.focus.x+dx)), 
      y:Math.max(0,Math.min(arr.size.y-1,s.focus.y+dy)), 
      z:Math.max(0,Math.min(arr.size.z-1,s.focus.z+dz))
    };
    if(s.range){
      const newAnchor={
        x:Math.max(0,Math.min(arr.size.x-1,s.anchor.x+dx)), 
        y:Math.max(0,Math.min(arr.size.y-1,s.anchor.y+dy)), 
        z:Math.max(0,Math.min(arr.size.z-1,s.anchor.z+dz))
      };
      Actions.setSelectionRange(s.arrayId, newAnchor, newFocus, lastInteraction);
    } else {
      Actions.setSelection(s.arrayId, newFocus);
    }
  },

  togglePhysics: ()=>{
    try{
      const result = window.Scene.togglePhysicsMode?.();
      if(result && typeof result.catch === 'function'){
        result.catch(e=>console.warn('[PHYSICS] togglePhysics failed', e));
      }
    }catch(e){ console.warn('[PHYSICS] togglePhysics threw', e); }
  },
  
  toggleGrid: ()=>{ 
    window.Store.setState(s=>({scene:{...s.scene, showGrid:!s.scene.showGrid}})); 
    window.Scene.setGridVisible(window.Store.getState().scene.showGrid); 
  },
  
  toggleAxes: ()=>{ 
    window.Store.setState(s=>({scene:{...s.scene, showAxes:!s.scene.showAxes}})); 
    window.Scene.setAxesVisible(window.Store.getState().scene.showAxes); 
  },
  
  setCrystal2D: (enabled)=>{
    const next = !!enabled;
    window.Store.setState(s=>({ ui:{...s.ui, crystal2D: next} }));
    window.UI?.applyCrystalStyle?.(next);
    return next;
  },
  
  toggleCrystal2D: ()=>{
    const prev = !!window.Store.getState().ui?.crystal2D;
    const next = !prev;
    Actions.setCrystal2D(next);
    window.UI?.renderSheet?.();
    return next;
  },
  
  togglePresentMode: ()=> window.Scene.togglePresentMode(),
  updateGraphicsSettings: (patch)=> window.Scene.updateGraphicsSettings(patch || {}),
  setOceanEnabled: (enabled)=> window.Scene.setOceanEnabled(enabled),
  updateOceanSettings: (patch)=> window.Scene.updateOceanSettings(patch || {}),
  
  undoData: ()=>{
    if(History.dataPast.length === 0) return;
    const tx = History.dataPast.pop();
    History.dataFuture.push(tx);
    Write.rollback(tx);
    const changed = tx.ops.map(op => `${op.arrId}:${op.x},${op.y},${op.z}`);
    window.Formula.recomputeAnchors(changed);
    const affectedArrays = new Set(tx.ops.map(op => op.arrId));
    affectedArrays.forEach(id => { 
      const arr = window.Store.getState().arrays[id]; 
      if(arr){ 
        window.Scene.renderArray(arr); 
        if(id===window.Store.getState().selection.arrayId) window.UI.renderSheet(); 
      } 
    });
  },

  redoData: ()=>{
    if(History.dataFuture.length === 0) return;
    const tx = History.dataFuture.pop();
    History.dataPast.push(tx);
    tx.ops.forEach(op => { 
      Actions._setCellRaw(op.arrId, {x:op.x, y:op.y, z:op.z}, op.next); 
    });
    const changed = tx.ops.map(op => `${op.arrId}:${op.x},${op.y},${op.z}`);
    window.Formula.recomputeAnchors(changed);
    const affectedArrays = new Set(tx.ops.map(op => op.arrId));
    affectedArrays.forEach(id => { 
      const arr = window.Store.getState().arrays[id]; 
      if(arr){ 
        window.Scene.renderArray(arr); 
        if(id===window.Store.getState().selection.arrayId) window.UI.renderSheet(); 
      } 
    });
  },
};

// Expose Actions globally
if(typeof window !== 'undefined'){
  window.Actions = Actions;
}

