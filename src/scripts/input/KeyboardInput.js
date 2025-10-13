/**
 * Keyboard Input System
 * Extracted from merged2.html lines 27000-27500 (~500 lines)
 * 
 * Keyboard event handling for navigation and interaction
 * 
 * Components:
 * - Arrow key navigation (view-relative)
 * - WASD physics movement
 * - Platformer input (2D game controls)
 * - Modifier key handling (Shift, Ctrl, Alt)
 * - Undo/Redo shortcuts
 * 
 * Dependencies:
 * - Store (state management)
 * - Actions (setSelection, moveSelection)
 * - Scene (facingFromCamera)
 */

// Input state
export const input = { f: 0, b: 0, l: 0, r: 0, j: 0 };
export const platformerKeyState = {
  left: false,
  right: false,
  up: false,
  down: false,
  jump: false
};

const PLATFORMER_KEY_BINDINGS = {
  arrowleft: 'left',
  a: 'left',
  arrowright: 'right',
  d: 'right',
  arrowup: 'up',
  w: 'up',
  arrowdown: 'down',
  s: 'down',
  ' ': 'jump',
  space: 'jump',
  spacebar: 'jump'
};

/**
 * Normalize platformer key
 */
function normalizePlatformerKey(key) {
  if (!key) return '';
  if (key === ' ') return 'space';
  return key.length === 1 ? key.toLowerCase() : key.toLowerCase();
}

/**
 * Check if platformer mode is active
 */
export function isPlatformerActive(globalState) {
  try {
    const g = globalState || (window.Store ? window.Store.getState().globalState : null);
    if (!g) return false;
    if (typeof g.has === 'function') {
      if (g.has('platformer.active')) return !!g.get('platformer.active');
      return false;
    }
    const active = g.get ? g.get('platformer.active') : null;
    if (active != null) return !!active;
    return false;
  } catch {
    return false;
  }
}

/**
 * Handle platformer key input
 * @param {string} key - Key name
 * @param {boolean} isDown - Key down or up
 * @returns {boolean} True if handled
 */
export function handlePlatformerKey(key, isDown) {
  const dir = PLATFORMER_KEY_BINDINGS[normalizePlatformerKey(key)];
  if (!dir) return false;
  
  platformerKeyState[dir] = !!isDown;
  return true;
}

/**
 * Refresh platformer input in global state
 */
export function refreshPlatformerInput(globalState) {
  try {
    const g = globalState || (window.Store ? window.Store.getState().globalState : null);
    if (!g || typeof g.set !== 'function' || typeof g.get !== 'function') return;
    
    const jumpActive = !!platformerKeyState.jump;
    let dir = 'none';
    
    if (platformerKeyState.left) dir = 'left';
    else if (platformerKeyState.right) dir = 'right';
    else if (platformerKeyState.up) dir = 'up';
    else if (platformerKeyState.down) dir = 'down';
    
    if (g.get('platformer.input') !== dir) {
      g.set('platformer.input', dir);
    }
    
    const prevJump = g.get('platformer.jump');
    const nextJump = jumpActive ? 1 : 0;
    if (prevJump !== nextJump) {
      g.set('platformer.jump', nextJump);
    }
  } catch (e) {
    console.warn('Platformer input sync failed', e);
  }
}

/**
 * Reset physics input state
 */
export function resetPhysicsInputState() {
  input.f = 0;
  input.b = 0;
  input.l = 0;
  input.r = 0;
  input.j = 0;
  
  platformerKeyState.left = false;
  platformerKeyState.right = false;
  platformerKeyState.up = false;
  platformerKeyState.down = false;
  platformerKeyState.jump = false;
  
  try {
    if (window.Store) {
      refreshPlatformerInput(window.Store.getState().globalState);
    }
  } catch (e) {}
}

/**
 * Setup keyboard event listeners
 */
export function setupKeyboardInput() {
  window.addEventListener('keydown', (e) => handleKeyDown(e));
  window.addEventListener('keyup', (e) => handleKeyUp(e));
}

/**
 * Handle key down event
 */
function handleKeyDown(e) {
  const Store = window.Store;
  const Actions = window.Actions;
  const UI = window.UI;
  
  if (!Store || !Actions) return;
  
  const s = Store.getState();
  const activeEl = document.activeElement;
  const activeTag = (activeEl?.tagName || '').toUpperCase();
  const typingElement = (activeTag === 'INPUT' || activeTag === 'TEXTAREA');
  const platformerMode = isPlatformerActive(s.globalState);
  const physicsActive = !!s.scene.physics;
  
  // Physics/Platformer input
  if (platformerMode && !typingElement) {
    if (handlePlatformerKey(e.key, true)) {
      refreshPlatformerInput(s.globalState);
      e.preventDefault();
      return;
    }
  }
  
  if (physicsActive && !typingElement) {
    if (['ArrowUp', 'w', 'W'].includes(e.key)) { input.f = 1; e.preventDefault(); return; }
    if (['ArrowDown', 's', 'S'].includes(e.key)) { input.b = 1; e.preventDefault(); return; }
    if (['ArrowLeft', 'a', 'A'].includes(e.key)) { input.l = 1; e.preventDefault(); return; }
    if (['ArrowRight', 'd', 'D'].includes(e.key)) { input.r = 1; e.preventDefault(); return; }
    if ([' ', 'Spacebar'].includes(e.key)) { input.j = 1; e.preventDefault(); return; }
    if (e.key === 'Escape') {
      Actions.togglePhysics?.();
      e.preventDefault();
      return;
    }
  }
  
  // Arrow navigation in edit mode
  const isArrowKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key);
  
  if (isArrowKey && !platformerMode && !physicsActive && !typingElement) {
    e.preventDefault();
    
    // Ensure selection exists
    let sel = s.selection;
    if (!sel.focus) {
      const fallbackArr = s.arrays[1] || Object.values(s.arrays)[0];
      if (fallbackArr) {
        Actions.setSelection(fallbackArr.id, { x: 0, y: 0, z: 0 }, null, '2d');
        sel = Store.getState().selection;
      }
    }
    
    if (sel.focus) {
      const arr = s.arrays[sel.arrayId];
      if (arr) {
        // View-relative navigation
        handleArrowNavigation(e.key, arr, sel, e.shiftKey);
      }
    }
  }
  
  // Undo/Redo
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) Actions.redoData?.();
      else Actions.undoData?.();
      return;
    }
    if (e.key === 'y') {
      e.preventDefault();
      Actions.redoData?.();
      return;
    }
  }
  
  // Enter to open editor
  if (e.key === 'Enter' && !platformerMode && !typingElement) {
    e.preventDefault();
    UI?.openEditor?.();
  }
  
  // Backspace to clear cell
  if (e.key === 'Backspace' && !platformerMode && !typingElement && s.selection?.focus) {
    e.preventDefault();
    Actions.setCell?.(s.selection.arrayId, s.selection.focus, '', null, true);
  }
}

/**
 * Handle key up event
 */
function handleKeyUp(e) {
  const Store = window.Store;
  if (!Store) return;
  
  const s = Store.getState();
  const platformerMode = isPlatformerActive(s.globalState);
  const physicsActive = !!s.scene.physics;
  
  // Platformer input
  if (platformerMode) {
    if (handlePlatformerKey(e.key, false)) {
      refreshPlatformerInput(s.globalState);
    }
  }
  
  // Physics input
  if (physicsActive) {
    if (['ArrowUp', 'w', 'W'].includes(e.key)) input.f = 0;
    if (['ArrowDown', 's', 'S'].includes(e.key)) input.b = 0;
    if (['ArrowLeft', 'a', 'A'].includes(e.key)) input.l = 0;
    if (['ArrowRight', 'd', 'D'].includes(e.key)) input.r = 0;
    if ([' ', 'Spacebar'].includes(e.key)) input.j = 0;
  }
}

/**
 * Handle arrow key navigation (view-relative)
 */
function handleArrowNavigation(key, arr, sel, shiftKey) {
  const Actions = window.Actions;
  const Scene = window.Scene;
  
  if (!Actions) return;
  
  if (shiftKey) {
    // Extend selection
    if (key === 'ArrowUp') Actions.moveSelection?.(0, 1, 0);
    if (key === 'ArrowDown') Actions.moveSelection?.(0, -1, 0);
    if (key === 'ArrowLeft') Actions.moveSelection?.(1, 0, 0);
    if (key === 'ArrowRight') Actions.moveSelection?.(-1, 0, 0);
  } else {
    // Move focus (view-relative)
    let dx = 0, dy = 0, dz = 0;
    
    // Get facing direction from camera
    let facing = { axis: 2, sign: 1 };
    try {
      if (arr._frame && Scene?.facingFromCamera) {
        facing = Scene.facingFromCamera(arr._frame);
      }
    } catch (e) {}
    
    const axis = facing.axis; // 0=X, 1=Y, 2=Z
    const sign = facing.sign;
    
    // Map keys based on viewing axis
    if (axis === 2) { // Z face
      if (key === 'ArrowUp') dy = -1;
      if (key === 'ArrowDown') dy = 1;
      if (key === 'ArrowLeft') dx = -sign;
      if (key === 'ArrowRight') dx = sign;
    } else if (axis === 0) { // X face
      if (key === 'ArrowUp') dy = -1;
      if (key === 'ArrowDown') dy = 1;
      if (key === 'ArrowLeft') dz = -sign;
      if (key === 'ArrowRight') dz = sign;
    } else { // Y face
      if (key === 'ArrowUp') dz = -1;
      if (key === 'ArrowDown') dz = 1;
      if (key === 'ArrowLeft') dx = -sign;
      if (key === 'ArrowRight') dx = sign;
    }
    
    // Apply movement
    const nx = Math.max(0, Math.min(arr.size.x - 1, sel.focus.x + dx));
    const ny = Math.max(0, Math.min(arr.size.y - 1, sel.focus.y + dy));
    const nz = Math.max(0, Math.min(arr.size.z - 1, sel.focus.z + dz));
    
    Actions.setSelection(arr.id, { x: nx, y: ny, z: nz }, null, '3d');
  }
  
  // Scroll sheet to selection
  if (window.UI?.scrollSheetToSelection) {
    window.UI.scrollSheetToSelection();
  }
}

export default {
  input,
  platformerKeyState,
  isPlatformerActive,
  handlePlatformerKey,
  refreshPlatformerInput,
  resetPhysicsInputState,
  setupKeyboardInput,
  startLoop,
  stopLoop,
  requestRender,
  isRenderNeeded
};



