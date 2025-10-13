/**
 * Collision and Physics Mode Helpers
 * Extracted from merged2.html lines 11198-11216
 */

import { getFormulaActiveArrayIds } from './Constants.js';

/**
 * Determine collision mode for an array
 * - 'physics': Formula-active arrays or debug mode physics arrays
 * - 'edit': Non-formula arrays (get colliders but trigger exit)
 */
export function determineCollisionMode(arr, cell=null, opts={}){
  if(!arr) return 'edit';
  const debugMode = Object.prototype.hasOwnProperty.call(opts, 'debugMode')
    ? !!opts.debugMode
    : (typeof Store !== 'undefined' && Store?.getState) ? !!Store.getState().scene?.physicsDebugAll : false;
  
  // In debug mode, ALL arrays with physics.enabled are physics mode
  if(debugMode && arr.params?.physics?.enabled) return 'physics';
  
  // Check if array has formulas (formula-active arrays are physics mode)
  const hostedSet = opts.formulaHostedSet || getFormulaActiveArrayIds();
  if(hostedSet.has(arr.id)) return 'physics';
  if(cell && (cell.formula || (cell.meta && (cell.meta.generated || cell.meta.emitter)))){
    return 'physics';
  }
  
  // Non-formula arrays are always 'edit' mode (they get colliders but trigger exit)
  return 'edit';
}

