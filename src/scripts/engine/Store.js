/**
 * Main Store - Application State Management
 * Extracted from merged2.html lines 11318-12196 (~880 lines)
 * 
 * This is the core state manager containing:
 * - Initial state setup (arrays, selection, scene, ui, etc.)
 * - saveState() - Serialize and persist to localStorage
 * - loadState() - Restore from localStorage
 * - resetSave() - Clear saved state
 * - init() - Initialize application
 */

import { createStore } from './StoreCore.js';
import { 
  A1, 
  greek, 
  aKey, 
  CHUNK_SIZE,
  chunkOf,
  keyChunk,
  toMap,
  toObject,
  showToast,
  resolveFormulaActiveArrayIds
} from './Constants.js';
import { normalizeMetaKeys, ensureOnSelectHooks } from './CellMeta.js';
import { determineCollisionMode } from './CollisionHelpers.js';

export const Store = createStore((set,get)=>{
  console.log('[STORE INIT] Creating store with physics:false by default');
  return {
    arrays: {}, 
    nextArrayId:1, 
    lastCreatedArrayId:null,
    selection:{arrayId:null, focus:null, anchor:null, range:null, faceHint:null},
    scene:{physics:false, showGrid:true, showAxes:true, physicsDebugAll:false, ocean:{enabled:false}},
    ui:{zLayer:0, fxOpen:false, addressMode:'local', lastInteraction:'3d', viewMode:'standard', crystal2D:false},
    gridPhase:{x:null,y:null,z:null},
    namedBlocks:new Map(),
    hidden:new Set(),
    namedMacros:new Map(),
    pendingMeta: [],
    globalState: new Map(),
    eventListeners: new Map(),
    anchorsByGlobalKey: new Map(),
    globalKeysByAnchor: new Map(),
    emittedByAnchor: new Map(),
    sourceByCell: new Map(),
    activeProjectiles: [],
    collisionHandlers: new Map(),
    nextProjectileId: 0,
    interactions:{ gobblingEnabled:false },
    gameState: { goals: new Map(), winCallbacks: [], hasWon: false },
    embeddedMeshes: new Map(),
    worldState: { mode: 'normal', parentArr: null, childArr: null },
    dockGroups: new Map(),
    dockGroupsByAnchor: new Map(),
    avatarPhysics:{ enabled:true, jumpCount:1, runMultiplier:1, momentumMode:0 },
    physicsCamera:{ mode:'free', distance:10, allowRotation:false },
    activeRotations: new Map(),
    suppress3DRotateRevert: new Set(),
    activeTranslations: new Map(),
    suppress3DTranslateRevert: new Set(),
    activeScales: new Map(),
    bufferedWrites: [],
    currentTick: 0,
    depsByAnchor:new Map(), 
    anchorsByDep:new Map(),
    
    utils:{
      A1, 
      greek,
      key:(arrId,x,y,z)=>`${arrId}:${x},${y},${z}`,
    },
    
    actions:{
      /**
       * Save state to localStorage
       */
      saveState: ()=>{
        try{
          const s = get();
          console.log('Saving state with', Object.keys(s.arrays).length, 'arrays...');

          const sanitizeTimedParams=(timed)=>{
            if(!timed) return undefined;
            const clone={
              ticks: Number.isFinite(+timed.ticks) ? (+timed.ticks|0) : 60,
              repeat: !!timed.repeat,
              reverse: !!timed.reverse,
              reverseTicks: (timed.reverseTicks==null) ? null : ((+timed.reverseTicks|0) || (+timed.ticks|0) || 60),
              t: 0,
              dir: (timed.dir===-1)?-1:1,
              previewInArray: !!timed.previewInArray,
              smooth: !!timed.smooth
            };
            if(Array.isArray(timed.plan)){
              clone.plan = timed.plan.map(op=>{
                const out={...op};
                if(op.anchor){ out.anchor = { ...op.anchor }; }
                return out;
              });
            } else {
              clone.plan = [];
            }
            if(timed.baseOffset){
              clone.baseOffset = {
                x: Number.isFinite(+timed.baseOffset.x) ? +timed.baseOffset.x : 0,
                y: Number.isFinite(+timed.baseOffset.y) ? +timed.baseOffset.y : 0,
                z: Number.isFinite(+timed.baseOffset.z) ? +timed.baseOffset.z : 0
              };
            }
            if(timed.baseQuat){
              try{
                if(Array.isArray(timed.baseQuat)) clone.baseQuat = timed.baseQuat.slice(0,4);
                else if(typeof timed.baseQuat.toArray==='function') clone.baseQuat = timed.baseQuat.toArray();
                else if(timed.baseQuat && typeof timed.baseQuat.x==='number') clone.baseQuat = [timed.baseQuat.x, timed.baseQuat.y, timed.baseQuat.z, timed.baseQuat.w];
              }catch{}
            }
            if(typeof timed.waitStart==='number') clone.waitStart = timed.waitStart|0;
            if(typeof timed.waitEnd==='number') clone.waitEnd = timed.waitEnd|0;
            return clone;
          };
          
          const cloneParamValue=(val)=>{
            if(val===undefined) return undefined;
            if(val===null) return null;
            if(typeof val==='function') return undefined;
            if(typeof val!=='object') return val;
            try{ return JSON.parse(JSON.stringify(val)); }
            catch{ return undefined; }
          };
          
          const sanitizeTimed3D=(timed)=>{
            if(!timed) return null;
            const scope = timed.scope ? {
              mode: timed.scope.mode || 'all',
              ids: Array.isArray(timed.scope.ids) ? timed.scope.ids.map(n=> Number.isFinite(+n)?(+n|0):null).filter(n=>n!=null) : []
            } : null;
            return {
              configured: !!timed.configured,
              ticks: Number.isFinite(+timed.ticks) ? (+timed.ticks|0) : 60,
              repeat: !!timed.repeat,
              reverse: !!timed.reverse,
              reverseTicks: (timed.reverseTicks==null) ? null : ((+timed.reverseTicks|0) || ((+timed.ticks|0)||60)),
              smooth: !!timed.smooth,
              preview: !!timed.preview,
              waitStart: Number.isFinite(+timed.waitStart) ? (+timed.waitStart|0) : 0,
              waitEnd: Number.isFinite(+timed.waitEnd) ? (+timed.waitEnd|0) : 0,
              hostId: Number.isFinite(+timed.hostId) ? (+timed.hostId|0) : null,
              scope,
              activeHostIds: Array.isArray(timed.activeHostIds) ? timed.activeHostIds.map(n=> Number.isFinite(+n)?(+n|0):null).filter(n=>n!=null) : [],
              t: 0,
              dir: (timed.dir===-1)?-1:1
            };
          };

          const hostedByFormula = resolveFormulaActiveArrayIds(s.sourceByCell, s.depsByAnchor);
          const debugMode = !!s.scene?.physicsDebugAll;
          const arrays = {};
          
          Object.values(s.arrays).forEach(a=>{
            const outA = {
              id:a.id, name:a.name, size:a.size, hidden:a.hidden, sealed:a.sealed, offset:a.offset,
              collisionMode: determineCollisionMode(a, null, { debugMode, formulaHostedSet: hostedByFormula }),
              fnPolicy: a.fnPolicy ? {
                mode: a.fnPolicy.mode,
                allow: Array.from(a.fnPolicy.allow || []),
                deny: Array.from(a.fnPolicy.deny || []),
                tags: Array.from(a.fnPolicy.tags || [])
              } : undefined,
              params: (()=>{
                if(!a.params) return undefined;
                const paramsOut={};
                Object.entries(a.params).forEach(([key,val])=>{
                  if(key==='timed'){
                    const clean = sanitizeTimedParams(val);
                    if(clean) paramsOut.timed = clean;
                  } else {
                    const cloned = cloneParamValue(val);
                    if(cloned!==undefined) paramsOut[key]=cloned;
                  }
                });
                return Object.keys(paramsOut).length ? paramsOut : undefined;
              })(),
              locks: Array.from(a.locks || []),
              chunks:{} 
            };
            
            try{
              const quat = (a._frame?.quaternion?.toArray?.()) || a.rotationQuat || [0,0,0,1];
              outA.transform = {
                offset: a.offset || {x:0,y:0,z:0},
                rotationQuat: quat,
                rotationSteps: a.rotationSteps || {x:0,y:0,z:0}
              };
            }catch{}
            
            if(a.axesVisible !== undefined) outA.axesVisible = !!a.axesVisible;
            const selectHooks = ensureOnSelectHooks(a);
            if(selectHooks.length) outA.on_select_hooks = selectHooks;
            if(a.uiControls) outA.uiControls = a.uiControls;
            if(a.cameraLock) outA.cameraLock = a.cameraLock;
            if(a.viewMode) outA.viewMode = a.viewMode;
            
            Object.entries(a.chunks).forEach(([k,ch])=>{
              const cells = [];
              for(const c of ch.cells){
                const hasVal = !(c.value===''||c.value==null||c.value===undefined);
                const hasFx = !!c.formula;
                const hasMeta = c.meta && Object.keys(c.meta).length > 0;
                
                if(hasVal || hasFx || hasMeta){
                  const normalizedMeta = c.meta ? normalizeMetaKeys(c.meta) : null;
                  if(normalizedMeta && normalizedMeta !== c.meta) c.meta = normalizedMeta;
                  const metaOut = normalizedMeta && Object.keys(normalizedMeta).length ? {...normalizedMeta} : undefined;
                  cells.push({
                    x:c.x, y:c.y, z:c.z,
                    value: c.value,
                    formula: c.formula,
                    meta: metaOut
                  });
                }
              }
              if(cells.length>0) outA.chunks[k] = { coord: ch.coord, cells };
            });
            arrays[a.id] = outA;
          });
          
          const globalStateEntries = Array.from(s.globalState.entries()).filter(([k]) => k !== 'platformer.active' && k !== 'platformer.pos');
          
          const serializable = {
            version: '1.1',
            timestamp: Date.now(),
            arrays,
            nextArrayId: s.nextArrayId,
            globalState: Object.fromEntries(globalStateEntries),
            selection: s.selection,
            ui: s.ui,
            scene: {
              physics: false,
              showGrid: s.scene.showGrid,
              showAxes: s.scene.showAxes,
              arrowMapDepth: s.scene.arrowMapDepth,
              timed3D: sanitizeTimed3D(s.scene?.timed3D)
            },
            avatarPhysics: s.avatarPhysics,
            physicsCamera: s.physicsCamera,
            camera: (window.Scene && window.Scene.captureCamera) ? window.Scene.captureCamera() : undefined,
            gridPhase: s.gridPhase,
            docks: {
              groups: Object.fromEntries([...(s.dockGroups||new Map()).entries()].map(([id,g])=> [id, {mode:g.mode, members:[...g.members], parentId:g.parentId??null}] )),
              byAnchor: Object.fromEntries((s.dockGroupsByAnchor||new Map()).entries())
            },
            chunking: { enabled: !!(window.Scene?.ChunkManager && window.Scene.ChunkManager.enabled) },
            interactions: s.interactions,
            namedBlocks: Object.fromEntries(s.namedBlocks.entries()),
            namedMacros: Object.fromEntries(s.namedMacros.entries())
          };
          
          const data = JSON.stringify(serializable);
          console.log('Serialized state size:', Math.round(data.length/1024), 'KB');
          
          try{
            localStorage.setItem('celliOsState', data);
            showToast(`💾 State Saved (${Math.round(data.length/1024)}KB)`);
          }catch(e){
            if(e.name === 'QuotaExceededError'){
              const compressed = { 
                arrays: Object.fromEntries(Object.entries(arrays).map(([id, a]) => [id, {
                  ...a,
                  chunks: Object.fromEntries(Object.entries(a.chunks).map(([k, ch]) => [k, {
                    ...ch,
                    cells: ch.cells.map(c => {
                      const metaNorm = c.meta ? normalizeMetaKeys(c.meta) : null;
                      if(metaNorm && metaNorm !== c.meta) c.meta = metaNorm;
                      const compressedMeta = metaNorm ? {
                        ...(metaNorm.on_click ? {on_click: metaNorm.on_click} : {}),
                        ...(metaNorm.noteText ? {noteText: metaNorm.noteText} : {}),
                        ...(metaNorm.color ? {color: metaNorm.color} : {})
                      } : undefined;
                      return {
                        x: c.x, y: c.y, z: c.z,
                        value: c.value,
                        formula: c.formula,
                        meta: compressedMeta
                      };
                    })
                  }]))
                }]))
              };
              const compressedData = JSON.stringify(compressed);
              localStorage.setItem('celliOsState', compressedData);
              showToast(`💾 State Saved (Compressed: ${Math.round(compressedData.length/1024)}KB)`);
            } else {
              throw e;
            }
          }
        }catch(e){ 
          console.error('saveState failed', e); 
          showToast('❌ Save failed: ' + e.message); 
        }
      },
      
      /**
       * Load state from localStorage
       */
      loadState: ()=>{
        try{
          const json = localStorage.getItem('celliOsState'); 
          if(!json){ showToast('📂 No saved state found'); return; }
          
          const data = JSON.parse(json);
          
          const rehydrateTimedParams=(timed)=>{
            if(!timed) return undefined;
            const out={
              ticks: Number.isFinite(+timed.ticks) ? (+timed.ticks|0) : 60,
              repeat: !!timed.repeat,
              reverse: !!timed.reverse,
              reverseTicks: (timed.reverseTicks==null) ? null : ((+timed.reverseTicks|0) || ((+timed.ticks|0)||60)),
              t: Number.isFinite(+timed.t) ? (+timed.t|0) : 0,
              dir: (timed.dir===-1)?-1:1,
              previewInArray: !!timed.previewInArray,
              smooth: !!timed.smooth,
              plan: Array.isArray(timed.plan) ? timed.plan.map(op=>{
                const copy={...op};
                if(op.anchor) copy.anchor={...op.anchor};
                return copy;
              }) : []
            };
            if(timed.baseOffset){
              out.baseOffset={
                x: Number.isFinite(+timed.baseOffset.x) ? +timed.baseOffset.x : 0,
                y: Number.isFinite(+timed.baseOffset.y) ? +timed.baseOffset.y : 0,
                z: Number.isFinite(+timed.baseOffset.z) ? +timed.baseOffset.z : 0
              };
            }
            if(timed.baseQuat){
              try{
                const arrQuat = Array.isArray(timed.baseQuat) ? timed.baseQuat : [timed.baseQuat.x, timed.baseQuat.y, timed.baseQuat.z, timed.baseQuat.w];
                if(Array.isArray(arrQuat) && arrQuat.length===4){
                  const quat=new THREE.Quaternion();
                  quat.fromArray(arrQuat);
                  out.baseQuat=quat;
                }
              }catch{ out.baseQuat=null; }
            }
            if(typeof timed.waitStart==='number') out.waitStart = timed.waitStart|0;
            if(typeof timed.waitEnd==='number') out.waitEnd = timed.waitEnd|0;
            return out;
          };
          
          const rehydrateParams=(params)=>{
            if(!params) return {};
            const out={};
            Object.entries(params).forEach(([key,val])=>{
              if(key==='timed'){
                const t = rehydrateTimedParams(val);
                if(t) out.timed = t;
              } else {
                out[key] = val;
              }
            });
            return out;
          };
          
          const rehydrateTimed3D=(timed)=>{
            if(!timed) return null;
            const scope = timed.scope ? {
              mode: timed.scope.mode || 'all',
              ids: Array.isArray(timed.scope.ids) ? timed.scope.ids.map(n=> Number.isFinite(+n)?(+n|0):null).filter(n=>n!=null) : []
            } : null;
            return {
              configured: !!timed.configured,
              ticks: Number.isFinite(+timed.ticks) ? (+timed.ticks|0) : 60,
              repeat: !!timed.repeat,
              reverse: !!timed.reverse,
              reverseTicks: (timed.reverseTicks==null) ? null : ((+timed.reverseTicks|0) || ((+timed.ticks|0)||60)),
              smooth: !!timed.smooth,
              preview: !!timed.preview,
              waitStart: Number.isFinite(+timed.waitStart) ? (+timed.waitStart|0) : 0,
              waitEnd: Number.isFinite(+timed.waitEnd) ? (+timed.waitEnd|0) : 0,
              hostId: Number.isFinite(+timed.hostId) ? (+timed.hostId|0) : null,
              scope,
              t: Number.isFinite(+timed.t) ? (+timed.t|0) : 0,
              dir: (timed.dir===-1)?-1:1,
              _waitCounter: 0,
              activeHostIds: Array.isArray(timed.activeHostIds) ? timed.activeHostIds.map(n=> Number.isFinite(+n)?(+n|0):null).filter(n=>n!=null) : []
            };
          };
          
          const restoreTimedPreviewState=()=>{
            // NOTE: This function requires Scene, setArrayOffset - defined at runtime
            console.log('[Store.loadState] restoreTimedPreviewState will be called after Scene is ready');
          };
          
          try{ window.Scene.restoreTimedPreviewState = restoreTimedPreviewState; }catch{}
          console.log('Loading state version:', data.version, 'from:', new Date(data.timestamp));
          
          Object.values(get().arrays).forEach(arr=>{ 
            try{ window.Scene?.removeArrayGraphics?.(arr); }catch{} 
          });
          
          if(data.gridPhase){
            try{ Store.setState({ gridPhase: { x:+data.gridPhase.x||0, y:+data.gridPhase.y||0, z:+data.gridPhase.z||0 } }); }catch{}
          }
          
          try{
            const docks = data.docks || {};
            Store.setState({
              dockGroups: toMap(docks.groups || {}),
              dockGroupsByAnchor: toMap(docks.byAnchor || {})
            });
          }catch{}
          
          try{ 
            if(data.chunking && data.chunking.enabled===true && window.Scene?.ChunkManager) {
              window.Scene.ChunkManager.enabled = true; 
            }
          }catch{}
          
          const cameraSnapshot = data.camera;
          const arrays={};
          
          Object.values(data.arrays||{}).forEach(a=>{
            arrays[a.id] = {
              id:a.id, 
              name:a.name, 
              size:{...a.size}, 
              hidden:a.hidden, 
              sealed:a.sealed, 
              offset:{...a.offset},
              state:'ACTIVE', 
              stableCount:0, 
              lastHash:null, 
              lastDepSig:null,
              collisionMode: a.collisionMode === 'physics' ? 'physics' : 'edit',
              fnPolicy: a.fnPolicy ? {
                mode: a.fnPolicy.mode || 'ALLOW_ALL',
                allow: new Set(a.fnPolicy.allow || []),
                deny: new Set(a.fnPolicy.deny || []),
                tags: new Set(a.fnPolicy.tags || [])
              } : {mode:'ALLOW_ALL', allow:new Set(), deny:new Set(), tags:new Set()},
              params: rehydrateParams(a.params),
              locks: new Set(a.locks || []),
              chunks:{}, 
              labels:[], 
              _frame:null, 
              _colliders:[], 
              _occluders:null
            };
            
            const T = a.transform || {};
            arrays[a.id].offset = T.offset || a.offset || {x:0,y:0,z:0};
            arrays[a.id].rotationQuat = T.rotationQuat || a.rotationQuat || [0,0,0,1];
            arrays[a.id].rotationSteps = T.rotationSteps || a.rotationSteps || {x:0,y:0,z:0};
            if(a.axesVisible !== undefined) arrays[a.id].axesVisible = !!a.axesVisible;
            
            const loadedHooks = a.on_select_hooks || a.onSelectHooks;
            if(loadedHooks) arrays[a.id].on_select_hooks = loadedHooks;
            if(a.uiControls) arrays[a.id].uiControls = a.uiControls;
            if(a.cameraLock) arrays[a.id].cameraLock = a.cameraLock;
            if(a.viewMode) arrays[a.id].viewMode = a.viewMode;
            
            if((a.id===-1) && arrays[a.id].hidden !== true){ 
              arrays[a.id].hidden = true; 
            }
            
            const savedMode = (a.collisionMode === 'physics') ? 'physics' : (a.collisionMode === 'edit' ? 'edit' : null);
            if(savedMode){
              arrays[a.id].collisionMode = savedMode;
            }
            if(arrays[a.id].collisionMode !== 'physics' && arrays[a.id].params?.physics?.enabled){
              arrays[a.id].collisionMode = 'physics';
            }

            let hasFormulaCell = false;
            Object.entries(a.chunks||{}).forEach(([k,ch])=>{
              const C = new window.Scene.Chunk(arrays[a.id], ch.coord);
              C.cells = (ch.cells||[]).map(c=>{
                const meta = normalizeMetaKeys(c.meta||{});
                if(c.formula) hasFormulaCell = true;
                return {
                  x:c.x, y:c.y, z:c.z,
                  value:c.value,
                  formula:c.formula,
                  meta
                };
              });
              
              C.cellMap = new Map();
              C.cells.forEach(cell => C.cellMap.set(`${cell.x},${cell.y},${cell.z}`, cell));
              arrays[a.id].chunks[k] = C;
              
              try{
                const arrRef = arrays[a.id];
                const minX=C.coord.x*CHUNK_SIZE, minY=C.coord.y*CHUNK_SIZE, minZ=C.coord.z*CHUNK_SIZE;
                const maxX=Math.min(minX+CHUNK_SIZE, arrRef.size.x), maxY=Math.min(minY+CHUNK_SIZE, arrRef.size.y), maxZ=Math.min(minZ+CHUNK_SIZE, arrRef.size.z);
                for(let z=minZ; z<maxZ; z++)
                for(let y=minY; y<maxY; y++)
                for(let x=minX; x<maxX; x++){
                  const key=`${x},${y},${z}`;
                  if(!C.cellMap.has(key)){
                    const cell={x,y,z,value:'',formula:null,meta:{}};
                    C.cells.push(cell);
                    C.cellMap.set(key, cell);
                  }
                }
              }catch{}
            });
            
            arrays[a.id]._hasFormulaCell = hasFormulaCell;
            
            try{
              const arrRef = arrays[a.id];
              const cDims={x:Math.ceil(arrRef.size.x/CHUNK_SIZE), y:Math.ceil(arrRef.size.y/CHUNK_SIZE), z:Math.ceil(arrRef.size.z/CHUNK_SIZE)};
              for(let cz=0; cz<cDims.z; cz++)
              for(let cy=0; cy<cDims.y; cy++)
              for(let cx=0; cx<cDims.x; cx++){
                const key = keyChunk(cx,cy,cz);
                let C = arrRef.chunks[key];
                if(!C){
                  C = new window.Scene.Chunk(arrRef, {x:cx,y:cy,z:cz});
                  arrRef.chunks[key] = C;
                  C.cellMap = new Map();
                }
                const minX=cx*CHUNK_SIZE, minY=cy*CHUNK_SIZE, minZ=cz*CHUNK_SIZE;
                const maxX=Math.min(minX+CHUNK_SIZE, arrRef.size.x), maxY=Math.min(minY+CHUNK_SIZE, arrRef.size.y), maxZ=Math.min(minZ+CHUNK_SIZE, arrRef.size.z);
                for(let z=minZ; z<maxZ; z++)
                for(let y=minY; y<maxY; y++)
                for(let x=minX; x<maxX; x++){
                  const k2=`${x},${y},${z}`;
                  if(!C.cellMap.has(k2)){
                    const cell={x,y,z,value:'',formula:null,meta:{}};
                    C.cells.push(cell);
                    C.cellMap.set(k2, cell);
                  }
                }
              }
            }catch{}
          });
          
          const emittedByAnchor = new Map();
          const sourceByCell = new Map();
          try{
            Object.values(arrays).forEach(a=>{
              Object.values(a.chunks||{}).forEach(ch=>{
                (ch.cells||[]).forEach(cell=>{
                  const src = cell?.meta?.emitter;
                  if(src){
                    const ck = `${a.id}:${cell.x},${cell.y},${cell.z}`;
                    sourceByCell.set(ck, src);
                    const set = emittedByAnchor.get(src) || new Set();
                    set.add(ck);
                    emittedByAnchor.set(src, set);
                  }
                });
              });
            });
          }catch{}

          const extraFormulaIds = [];
          Object.values(arrays).forEach(arr=>{
            if(arr && arr._hasFormulaCell){
              extraFormulaIds.push(arr.id);
            }
          });
          
          const combinedHosted = resolveFormulaActiveArrayIds(sourceByCell, null, extraFormulaIds);
          Object.values(arrays).forEach(arr=>{
            if(!arr) return;
            const mode = determineCollisionMode(arr, null, { debugMode:false, formulaHostedSet: combinedHosted });
            arr.collisionMode = mode;
            if(Object.prototype.hasOwnProperty.call(arr, '_hasFormulaCell')){
              delete arr._hasFormulaCell;
            }
          });

          const restoredUi = {...get().ui, ...(data.ui||{})};
          if(restoredUi.crystal2D !== true){ restoredUi.crystal2D = false; }
          
          const restoredScene = {...get().scene, ...(data.scene||{}), physics: false};
          if(data.scene?.timed3D){ restoredScene.timed3D = rehydrateTimed3D(data.scene.timed3D); }
          console.log('[LOAD STATE] Forcing physics to false, ignoring saved state');
          
          const restoredGlobalState = new Map(Object.entries(data.globalState||{}));
          restoredGlobalState.set('platformer.active', false);
          restoredGlobalState.delete('platformer.pos');
          console.log('[LOAD STATE] Platformer explicitly set to false');
          
          set({
            arrays,
            nextArrayId: data.nextArrayId||get().nextArrayId,
            globalState: restoredGlobalState,
            selection: data.selection||get().selection,
            ui: restoredUi,
            scene: restoredScene,
            avatarPhysics: data.avatarPhysics ? {...get().avatarPhysics, ...data.avatarPhysics} : get().avatarPhysics,
            physicsCamera: data.physicsCamera ? {...get().physicsCamera, ...data.physicsCamera} : get().physicsCamera,
            interactions: {...get().interactions, ...(data.interactions||{})},
            namedBlocks: new Map(Object.entries(data.namedBlocks||{})),
            namedMacros: new Map(Object.entries(data.namedMacros||{})),
            emittedByAnchor,
            sourceByCell,
            activeScales: new Map()
          });
          
          // Rest of loadState handled by Scene/Actions (reconcileAllArrays, etc.)
          console.log('[Store.loadState] State loaded, Scene will handle visual restoration');
          
          showToast(`📂 State Loaded (${Object.keys(arrays).length} arrays)`);
          console.log('Load complete, arrays restored:', Object.keys(arrays));
        }catch(e){ 
          console.error('loadState failed', e); 
          showToast('❌ Load failed: ' + e.message); 
        }
      },
      
      /**
       * Clear saved state and reload
       */
      resetSave: ()=>{
        try{
          const confirmed = confirm('⚠️ Clear saved state and restart?\n\nThis will delete all saved arrays and formulas.');
          if(!confirmed) return;
          
          localStorage.removeItem('celliOsState');
          try{ 
            localStorage.removeItem('VisibilitySettings'); 
            window.VisibilitySettings = JSON.parse(JSON.stringify(window.DEFAULT_VISIBILITY)); 
          }catch{}
          
          showToast('🗑️ Save cleared - restarting...');
          setTimeout(()=> location.reload(), 800);
        }catch(e){ 
          console.warn('resetSave failed', e); 
          showToast('❌ Clear failed: ' + e.message);
        }
      },
      
      /**
       * Initialize application
       */
      init: async ()=>{
        await window.Scene.init(document.getElementById('view'));
        
        try{
          const g = Store.getState().globalState;
          if(g && typeof g.set === 'function'){
            g.set('platformer.active', false);
            console.log('[INIT] Platformer explicitly set to false');
          }
        }catch(e){ console.warn('Platformer init failed', e); }

        const sp = window.Actions.createArray({
          id:-1,
          name:'Mainframe', 
          size:{x:5,y:5,z:5}, 
          hidden:true, 
          sealed:true, 
          offset:{x:-15,y:0,z:-15}
        });

        console.log('Arrays created');
        
        const home = window.Actions.createArray({
          id:1,
          name:"Celli's Home", 
          size:{x:8,y:4,z:8}, 
          hidden:false, 
          offset:{x:0,y:1,z:0}
        });
        
        console.log('Setting up content...');
        window.Actions.setCell(1, {x:0,y:0,z:0}, 'Hello', null, true);
        window.Actions.setCell(1, {x:0,y:1,z:0}, 'World!', null, true);
        
        console.log('Setting up A3 intro meta directly...');
        try{
          window.Actions.resizeArrayIfNeeded(home, {x:0,y:2,z:0});
          const chKey = keyChunk(...Object.values(chunkOf(0,2,0)));
          let ch = home.chunks[chKey];
          if(!ch){ console.warn('A3 chunk missing after resize'); return; }
          let cell = ch.cells.find(c=>c.x===0&&c.y===2&&c.z===0);
          if(!cell){ 
            ch.cells.push({x:0,y:2,z:0,value:'',formula:null,meta:{}}); 
            cell = ch.cells[ch.cells.length-1]; 
          }
          const introMeta = normalizeMetaKeys(cell.meta||{});
          introMeta.noteText = 'Click Me!';
          introMeta.on_click = '=STARTINTROEXPERIENCE()';
          cell.meta = introMeta;
          console.log('A3 meta set:', cell.meta);
        }catch(e){ console.warn('Direct A3 setup failed', e); }

        try {
          window.Actions.setSelection(1, {x:0,y:0,z:0});
          window.Scene.renderArray(home);
          
          if(window.Scene.getCamera && window.Scene.getControls){
            const cam = window.Scene.getCamera();
            const ctrl = window.Scene.getControls();
            if(cam && ctrl){
              const arrayCenter = {x: 0, y: 3, z: 0};
              ctrl.target.set(arrayCenter.x, arrayCenter.y, arrayCenter.z);
              cam.position.set(8, 10, 14);
              ctrl.update();
              console.log('[INIT] Camera positioned at', cam.position, 'looking at', ctrl.target);
            }
          }
        } catch(e) {
          console.error('Home focus failed:', e);
        }

        try {
          window.UI.init();
          console.log('UI init done');
          
          const sheetEl=document.getElementById('sheet');
          const intro=document.getElementById('introOverlay');
          sheetEl.classList.add('intro-centered');
          intro.classList.remove('hidden');
          intro.style.zIndex = '10000';

          window.UI.renderSheet();
          console.log('Sheet rendered');
          
          requestAnimationFrame(()=>{ 
            requestAnimationFrame(()=>{ 
              try{ window.UI.ensureIntroNote?.(); }catch{}
              try{ window.UI.renderSheet?.(); }catch{}
            }); 
          });
          
          if(window.Scene.getCamera && window.Scene.getControls){
            const cam = window.Scene.getCamera();
            const ctrl = window.Scene.getControls();
            if(cam && ctrl){
              cam.position.set(8, 10, 14);
              ctrl.target.set(0, 3, 0);
              ctrl.update();
              console.log('[INIT FINAL] Camera set to', cam.position, 'target', ctrl.target);
            }
          }

          window.__APP_READY = true;
        } catch(e) {
          console.error('Init failed:', e);
        }
      },
    }
  };
});

// Expose Store globally
if(typeof window !== 'undefined'){
  window.Store = Store;
}

