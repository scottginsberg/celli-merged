/**
 * Raycasting & Cell Picking System
 * Extracted from merged2.html lines 26500-27500 (~1000 lines)
 * 
 * Mouse interaction and 3D cell picking system
 * 
 * Components:
 * - onPick: Main click handler for cell selection
 * - Ray-mesh intersection with InstancedMesh
 * - Drag selection in 3D space
 * - Grab handle dragging for array repositioning
 * - Ghost layer filtering
 * - Click action execution
 * - Visual feedback (pulse animations)
 * 
 * Dependencies:
 * - THREE.js (Raycaster)
 * - Store (state management)
 * - Scene (rendering, array management)
 * - Actions (selection, cell updates)
 * - Formula (action execution)
 */

import * as THREE from 'three';

/**
 * Pick cell from mouse click
 * @param {MouseEvent} e - Mouse event
 * @param {THREE.WebGLRenderer} renderer - WebGL renderer
 * @param {THREE.Camera} camera - Camera
 * @param {Object} scene - Scene state
 */
export function onPick(e, renderer, camera, scene) {
  if (!renderer || !camera) return;
  
  try {
    // Calculate normalized mouse coordinates
    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    
    // Create raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    // Get pickable meshes
    const Store = window.Store;
    if (!Store) return;
    
    const state = Store.getState();
    const layerMeshes = window.layerMeshes || new Map();
    
    // Legacy layer meshes (visible, non-ghost)
    const layerPickMeshes = [...layerMeshes.values()]
      .map(r => r.mesh)
      .filter(m => m.visible && !m.userData.isGhost);
    
    // Chunk LOD1 meshes
    const chunkPickMeshes = [];
    const physicsActive = !!state.scene?.physics;
    const physicsDebugActive = !!state.scene?.physicsDebugAll;
    
    try {
      Object.values(state.arrays).forEach(a => {
        if (a.hidden) return;
        
        // Filter physics arrays when physics is active (unless debug mode)
        const hasPhysics = !!a.params?.physics?.enabled;
        const shouldFilter = physicsActive && !physicsDebugActive && hasPhysics;
        
        if (shouldFilter) {
          console.log(`[RAYCAST] Filtering physics array #${a.id} from picking`);
          return;
        }
        
        Object.values(a.chunks || {}).forEach(ch => {
          if (ch?.meshLOD1 && ch.meshLOD1.visible) {
            chunkPickMeshes.push(ch.meshLOD1);
          }
        });
      });
    } catch (err) {
      console.warn('[RAYCAST] Failed to collect chunk meshes:', err);
    }
    
    // Grab handles
    const grabHandles = Object.values(state.arrays)
      .flatMap(a => (a.labels || []).filter(l => l.userData?.type === 'grab'));
    
    // Perform raycast
    const hits = raycaster.intersectObjects([...layerPickMeshes, ...chunkPickMeshes, ...grabHandles], false);
    
    if (!hits.length) return;
    
    // Filter out hits on deleting arrays
    const deleteInteractionLock = window.deleteInteractionLock || false;
    const isArrayDeleting = window.isArrayDeleting || (() => false);
    
    const activeHits = deleteInteractionLock
      ? hits.filter(h => {
          try {
            const arrId = h?.object?.userData?.arrayId
              ?? h?.object?.userData?.chunk?.arrayId
              ?? h?.object?.userData?.chunk?.array?.id;
            if (arrId == null) return true;
            return !isArrayDeleting(arrId);
          } catch {
            return !deleteInteractionLock;
          }
        })
      : hits;
    
    if (!activeHits.length) return;
    
    // Prefer grab handle if hit
    const grabHit = activeHits.find(h => h.object?.userData?.type === 'grab');
    let hit = grabHit || activeHits.find(h => (h.object && h.object.isInstancedMesh && typeof h.instanceId === 'number')) || activeHits[0];
    
    // Handle grab handle (array dragging)
    if (hit.object.userData?.type === 'grab') {
      handleGrabDrag(hit, raycaster, camera, renderer);
      return;
    }
    
    // Handle cell pick
    handleCellPick(hit, raycaster, camera, renderer);
    
  } catch (err) {
    console.error('[PICK] Click selection failed:', err);
  }
}

/**
 * Handle grab handle dragging for array repositioning
 */
function handleGrabDrag(hit, raycaster, camera, renderer) {
  const Store = window.Store;
  if (!Store) return;
  
  const arr = Store.getState().arrays[hit.object.userData.arrayId];
  if (!arr) return;
  
  const startOff = { ...(arr.offset || { x: 0, y: 0, z: 0 }) };
  
  // Determine movement plane from clicked face normal
  const nLocal = hit.face?.normal?.clone() || new THREE.Vector3(0, 1, 0);
  const nWorld = nLocal.clone().transformDirection(hit.object.matrixWorld).normalize();
  
  let planeNormal = new THREE.Vector3(0, 1, 0);
  if (Math.abs(nWorld.x) > Math.abs(nWorld.y) && Math.abs(nWorld.x) > Math.abs(nWorld.z)) {
    planeNormal.set(1, 0, 0); // YZ plane
  } else if (Math.abs(nWorld.y) > Math.abs(nWorld.x) && Math.abs(nWorld.y) > Math.abs(nWorld.z)) {
    planeNormal.set(0, 1, 0); // XZ plane
  } else {
    planeNormal.set(0, 0, 1); // XY plane
  }
  
  const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, hit.point);
  const startPoint = new THREE.Vector3();
  raycaster.ray.intersectPlane(plane, startPoint);
  
  // Suspend orbit controls during drag
  if (window.Scene?.suspendOrbitControls) {
    window.Scene.suspendOrbitControls();
  }
  
  const onMove = (ev) => {
    const r = renderer.domElement.getBoundingClientRect();
    const m = new THREE.Vector2(
      ((ev.clientX - r.left) / r.width) * 2 - 1,
      -((ev.clientY - r.top) / r.height) * 2 + 1
    );
    
    const r2 = new THREE.Raycaster();
    r2.setFromCamera(m, camera);
    
    const p2 = new THREE.Vector3();
    r2.ray.intersectPlane(plane, p2);
    
    // Grid-snapped movement
    const delta = new THREE.Vector3().subVectors(p2, startPoint);
    let nx = startOff.x, ny = startOff.y, nz = startOff.z;
    
    const arrayVoxelScale = window.Scene?.arrayVoxelScale || (() => 1);
    const scale = arrayVoxelScale(arr);
    
    const snap = (axis, raw) => {
      const s = axis === 'x' ? arr.size.x : axis === 'y' ? arr.size.y : arr.size.z;
      const base = (axis === 'z') ? (s / 2 - 0.5) : (-(s / 2) + 0.5);
      return Math.round(raw + base) - base;
    };
    
    if (planeNormal.y === 1 || planeNormal.y === -1) { // XZ plane
      nx = snap('x', startOff.x + delta.x);
      nz = snap('z', startOff.z + delta.z);
    } else if (planeNormal.x === 1 || planeNormal.x === -1) { // YZ plane
      ny = snap('y', startOff.y + delta.y);
      nz = snap('z', startOff.z + delta.z);
    } else { // XY plane
      nx = snap('x', startOff.x + delta.x);
      ny = snap('y', startOff.y + delta.y);
    }
    
    // Apply offset
    if (window.Scene?.setArrayOffset) {
      window.Scene.setArrayOffset(arr, { x: nx, y: ny, z: nz }, { interactive: true });
    }
  };
  
  const onUp = () => {
    // Resume orbit controls
    if (window.Scene?.resumeOrbitControls) {
      window.Scene.resumeOrbitControls();
    }
    
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    
    // Settle animation
    try {
      const cur = arr.offset || { x: 0, y: 0, z: 0 };
      const dir = {
        dx: Math.sign((cur.x || 0) - (startOff.x || 0)),
        dy: Math.sign((cur.y || 0) - (startOff.y || 0)),
        dz: Math.sign((cur.z || 0) - (startOff.z || 0))
      };
      
      if (window.Scene?.settleAfterDrag) {
        window.Scene.settleAfterDrag(arr, dir);
      }
    } catch (e) {}
    
    // Update timed base offset
    try {
      arr.params = arr.params || {};
      const timed = arr.params.timed;
      if (timed) {
        timed.baseOffset = { ...(arr.offset || { x: 0, y: 0, z: 0 }) };
        if (arr._frame && arr._frame.quaternion) {
          try {
            timed.baseQuat = arr._frame.quaternion.clone();
          } catch (e) {}
        }
      }
    } catch (e) {}
  };
  
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
}

/**
 * Handle cell picking and selection
 */
function handleCellPick(hit, raycaster, camera, renderer) {
  const Store = window.Store;
  const Actions = window.Actions;
  const Formula = window.Formula;
  const Write = window.Write;
  
  if (!Store || !Actions) return;
  
  let arrayId = hit.object.userData.arrayId;
  let arr = Store.getState().arrays[arrayId];
  if (!arr) return;
  
  // Extract cell from hit
  let cell = null;
  let z = null;
  
  if (hit.object.userData && hit.object.userData.chunk) {
    const chunk = hit.object.userData.chunk;
    cell = chunk?.index2cell?.[hit.instanceId];
    z = cell?.z;
  } else {
    const z0 = hit.object.userData.z;
    const type0 = hit.object.userData.type;
    const layerMeshes = window.layerMeshes || new Map();
    const rec = layerMeshes.get(`${arrayId}:${z0}:${type0}`);
    cell = rec?.index2cell?.[hit.instanceId];
    z = z0;
  }
  
  if (!cell) return;
  
  // Check if cell is ghosted (occluded)
  try {
    const sel = Store.getState().selection;
    const isFocusArray = (sel?.arrayId === arr.id);
    const occ = arr._occlusionData || {};
    const blocked = occ.blockedLayers || new Set();
    const axis = occ.axis || occ.facing || 'Z';
    const cellLayer = axis === 'X' ? cell.x : axis === 'Y' ? cell.y : cell.z;
    const focusLayer = isFocusArray && sel.focus ? (axis === 'X' ? sel.focus.x : axis === 'Y' ? sel.focus.y : sel.focus.z) : null;
    const isFocusLayer = (focusLayer === cellLayer);
    
    // Reject if blocked and not on focus layer
    if (blocked.has(cellLayer) && !isFocusLayer) {
      console.log(`[PICK] Rejected ghosted cell at (${cell.x},${cell.y},${cell.z})`);
      return;
    }
  } catch (e) {
    console.warn('[PICK] Ghost check failed', e);
  }
  
  // Check for click action
  let hasAction = false;
  let decodedAction = '';
  
  try {
    const UI = window.UI;
    const getMetaAction = window.getMetaAction || (() => null);
    const c2d = UI?.getCell?.(arr.id, { x: cell.x, y: cell.y, z: cell.z });
    let actionRaw = String(getMetaAction(c2d?.meta, 'on_click') || '').trim();
    
    if (actionRaw) {
      hasAction = true;
      // Decode base64 if needed
      if (actionRaw.startsWith('B64:')) {
        try {
          actionRaw = atob(actionRaw.slice(4));
        } catch (e) {}
      } else {
        const colon = actionRaw.indexOf(':');
        if (colon > 0 && /^\d+$/.test(actionRaw.slice(0, colon))) {
          const enc = actionRaw.slice(colon + 1);
          try {
            actionRaw = atob(enc);
          } catch (e) {}
        }
      }
      decodedAction = actionRaw.startsWith('=') ? actionRaw : `=${actionRaw}`;
    }
  } catch (e) {}
  
  // Play click sound (unless action has chime)
  const formulaHasChime = window.formulaHasChime || (() => false);
  const playCellClick = window.playCellClick || (() => {});
  
  if (!(hasAction && formulaHasChime(decodedAction))) {
    playCellClick();
  }
  
  // Execute click action
  try {
    if (hasAction && decodedAction && Formula && Write) {
      const tx = Write.start('onclick.3d', 'Click action (3D)');
      Formula.runOnceAt({ arrId: arr.id, x: cell.x, y: cell.y, z: cell.z }, decodedAction, tx);
      Write.commit(tx);
      
      // Visual feedback
      if (window.pulseCell) {
        window.pulseCell(arr, cell, z);
      }
    }
  } catch (e) {
    console.warn('[PICK] Action execution failed:', e);
  }
  
  // Check collision mode for physics exit
  const physicsActive = !!Store.getState().scene?.physics;
  const physicsDebugActive = !!Store.getState().scene?.physicsDebugAll;
  const determineCollisionMode = window.determineCollisionMode || (() => 'edit');
  const cellCollisionMode = determineCollisionMode(arr, cell, { debugMode: physicsDebugActive });
  
  if (physicsActive && !physicsDebugActive && cellCollisionMode === 'edit') {
    console.log(`[PHYSICS] Clicked edit-mode cell - exiting physics mode`);
    try {
      Actions.setSelection(arr.id, { x: cell.x, y: cell.y, z: cell.z }, null, '3d');
      if (window.Scene?.centerOnArray) {
        window.Scene.centerOnArray(arr);
      }
      const togglePhysicsMode = window.Scene?.togglePhysicsMode || Actions.togglePhysics;
      if (togglePhysicsMode) {
        const res = togglePhysicsMode();
        if (res && typeof res.catch === 'function') {
          res.catch(err => console.warn('[PHYSICS] Exit on click failed', err));
        }
      }
    } catch (e) {
      console.warn('[PHYSICS] Exit on click threw', e);
    }
    return;
  }
  
  // Start drag selection
  const maxLayer = Math.max(0, (arr.size?.z || 1) - 1);
  let startLayer = Number.isFinite(cell?.z) ? Math.round(cell.z) : 0;
  let viewLocked = false;
  
  try {
    const uiState = Store.getState().ui || {};
    if (uiState.lastInteraction === '2d' && Number.isFinite(uiState.zLayer)) {
      startLayer = Math.round(uiState.zLayer);
      viewLocked = true;
    }
  } catch (e) {}
  
  if (!Number.isFinite(startLayer)) startLayer = 0;
  startLayer = Math.min(maxLayer, Math.max(0, startLayer));
  
  // Set selection and start drag
  const dragState = {
    arrayId: arr.id,
    start: { x: cell.x, y: cell.y, z: startLayer },
    lockZ: startLayer,
    viewLock: viewLocked
  };
  
  // Store drag state globally
  window.dragState = dragState;
  
  Actions.setSelection(arr.id, { x: cell.x, y: cell.y, z: startLayer }, null, '3d');
  
  // Visual feedback
  if (window.pulseCell) {
    window.pulseCell(arr, cell, z);
  }
  
  // Suspend orbit controls
  if (window.Scene?.suspendOrbitControls) {
    window.Scene.suspendOrbitControls();
  }
  
  // Set up drag handlers
  setupDragHandlers(dragState, arr, raycaster, camera, renderer);
}

/**
 * Setup drag selection handlers
 */
function setupDragHandlers(dragState, arr, raycaster, camera, renderer) {
  const onMove = (ev) => {
    if (!window.dragState) return;
    
    const r = renderer.domElement.getBoundingClientRect();
    const m = new THREE.Vector2(
      ((ev.clientX - r.left) / r.width) * 2 - 1,
      -((ev.clientY - r.top) / r.height) * 2 + 1
    );
    
    raycaster.setFromCamera(m, camera);
    
    // Get solid meshes (filter ghosts)
    const layerMeshes = window.layerMeshes || new Map();
    const solidLayerMeshes = [...layerMeshes.values()]
      .map(r => r.mesh)
      .filter(m => m.visible && !m.userData.isGhost && m.userData.type !== 'ghost');
    
    const solidChunkMeshes = [];
    const Store = window.Store;
    
    try {
      Object.values(Store.getState().arrays).forEach(a => {
        if (a.hidden) return;
        Object.values(a.chunks || {}).forEach(ch => {
          if (ch?.meshLOD1 && ch.meshLOD1.visible) {
            solidChunkMeshes.push(ch.meshLOD1);
          }
        });
      });
    } catch (e) {}
    
    const h = raycaster.intersectObjects([...solidLayerMeshes, ...solidChunkMeshes], false);
    
    if (h.length) {
      const hh = h[0];
      let aid = hh.object.userData.arrayId;
      let cel = null;
      let z = null;
      
      if (hh.object.userData && hh.object.userData.chunk) {
        const ch = hh.object.userData.chunk;
        aid = ch?.array?.id || aid;
        cel = ch?.index2cell?.[hh.instanceId];
        z = cel?.z;
      } else {
        const z0 = hh.object.userData.z;
        const type0 = hh.object.userData.type;
        
        // Skip ghost meshes
        if (type0 && String(type0).includes('ghost')) return;
        
        const rec2 = layerMeshes.get(`${aid}:${z0}:${type0}`);
        cel = rec2?.index2cell?.[hh.instanceId];
        z = z0;
      }
      
      if (!cel) return;
      
      // Check if ghosted
      try {
        const arrForCheck = Store.getState().arrays[aid];
        if (arrForCheck) {
          const sel = Store.getState().selection;
          const isFocusArray = (sel?.arrayId === aid);
          const occ = arrForCheck._occlusionData || {};
          const blocked = occ.blockedLayers || new Set();
          const axis = occ.axis || occ.facing || 'Z';
          const cellLayer = axis === 'X' ? cel.x : axis === 'Y' ? cel.y : cel.z;
          const focusLayer = isFocusArray && sel.focus ? (axis === 'X' ? sel.focus.x : axis === 'Y' ? sel.focus.y : sel.focus.z) : null;
          const isFocusLayer = (focusLayer === cellLayer);
          
          if (blocked.has(cellLayer) && !isFocusLayer) {
            return;
          }
        }
      } catch (e) {}
      
      if (aid === dragState.arrayId) {
        const arrForDrag = Store.getState().arrays[dragState.arrayId];
        const maxLayer = Math.max(0, (arrForDrag?.size?.z || 1) - 1);
        const clampLayer = (val) => Math.min(maxLayer, Math.max(0, Math.round(val)));
        
        let targetLayer = Number.isFinite(cel?.z) ? clampLayer(cel.z) : dragState.lockZ;
        
        if (dragState.viewLock) {
          if (!Number.isFinite(targetLayer)) {
            targetLayer = clampLayer(dragState.start?.z ?? 0);
          }
        }
        
        if (!Number.isFinite(targetLayer)) targetLayer = clampLayer(dragState.start?.z ?? 0);
        
        const Actions = window.Actions;
        if (Actions) {
          Actions.setSelectionRange(dragState.arrayId, dragState.start, { x: cel.x, y: cel.y, z: targetLayer }, '3d');
        }
        
        // Cache last valid position
        dragState.lastValid = { x: cel.x, y: cel.y, z: targetLayer };
      }
    } else if (dragState.lastValid) {
      // Maintain last valid position during gaps
      const Actions = window.Actions;
      if (Actions) {
        Actions.setSelectionRange(dragState.arrayId, dragState.start, dragState.lastValid, '3d');
      }
    }
  };
  
  const onUp = () => {
    window.dragState = null;
    
    if (window.Scene?.resumeOrbitControls) {
      window.Scene.resumeOrbitControls();
    }
    
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  };
  
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
}

/**
 * Locate array collision from world position (for physics)
 * @param {THREE.Vector3} worldPos - World position
 * @returns {Object|null} Collision hit data
 */
export function locateArrayCollision(worldPos) {
  const Store = window.Store;
  if (!Store) return null;
  
  const state = Store.getState();
  const arrays = Object.values(state.arrays).filter(a => !a.hidden);
  
  for (const arr of arrays) {
    const cellWorldPos = window.Scene?.cellWorldPos || (() => new THREE.Vector3());
    const arrayVoxelScale = window.Scene?.arrayVoxelScale || (() => 1);
    const scale = arrayVoxelScale(arr);
    const halfCell = scale / 2;
    
    // Check each chunk
    for (const chunk of Object.values(arr.chunks || {})) {
      for (const cell of chunk.cells || []) {
        const pos = cellWorldPos(arr, cell.x, cell.y, cell.z);
        const dist = worldPos.distanceTo(pos);
        
        if (dist < halfCell) {
          // Hit!
          const determineCollisionMode = window.determineCollisionMode || (() => 'edit');
          const collisionMode = determineCollisionMode(arr, cell);
          
          return {
            arr,
            cell,
            coord: { x: cell.x, y: cell.y, z: cell.z },
            worldPos: pos,
            distance: dist,
            collisionMode
          };
        }
      }
    }
  }
  
  return null;
}

/**
 * NOTE: This is a partial extraction of the raycasting system.
 * The complete system in merged2.html includes:
 * 
 * - Hover highlighting system
 * - Multi-array picking with priority
 * - Touch input handling
 * - Keyboard navigation integration
 * - Physics collision detection
 * - Click action execution
 * - Drag selection with visual feedback
 * - Grab handle manipulation
 * 
 * For full functionality, integrate with:
 * - Scene.js (suspendOrbitControls, resumeOrbitControls, pulseCell)
 * - Store.js (state management)
 * - Actions.js (setSelection, setSelectionRange)
 * - Formula.js (runOnceAt for actions)
 * 
 * See merged2.html lines 26500-27500+ for complete implementation.
 */

export default {
  onPick,
  locateArrayCollision
};

