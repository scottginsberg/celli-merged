/**
 * Selection Face Hint Helper
 * Computes which face of a selection should be highlighted based on camera direction
 * Extracted from merged2.html lines 12461-12505
 */

/**
 * Compute which face of a multi-cell selection should show the border
 * Uses camera direction to show the face pointing toward the viewer
 * 
 * @param {Object} anchor - Selection anchor point {x, y, z}
 * @param {Object} focus - Selection focus point {x, y, z}
 * @param {Object} range - Selection range {x1, y1, z1, x2, y2, z2}
 * @returns {Object|null} - {axis: 'x'|'y'|'z', axisIndex: 0|1|2, sign: 1|-1} or null
 */
export function computeSelectionFaceHint(anchor, focus, range){
  try{
    if(!anchor || !focus || !range) return null;
    
    // For multi-cell selections, always use camera direction to show border facing viewer
    try{
      if(window.Scene && typeof window.Scene.getCamera === 'function'){
        const camera = window.Scene.getCamera();
        if(camera){
          const camDir = new THREE.Vector3();
          camera.getWorldDirection(camDir);
          // Reverse direction (we want the face pointing toward camera)
          const vec = { x: -camDir.x, y: -camDir.y, z: -camDir.z };
          const abs = { x: Math.abs(vec.x), y: Math.abs(vec.y), z: Math.abs(vec.z) };
          let axis = 'x';
          let axisIndex = 0;
          let best = abs.x;
          if(abs.y > best){ axis = 'y'; axisIndex = 1; best = abs.y; }
          if(abs.z > best){ axis = 'z'; axisIndex = 2; best = abs.z; }
          const sign = vec[axis] >= 0 ? 1 : -1;
          return { axis, axisIndex, sign };
        }
      }
    }catch{}
    
    // Fallback: use anchor relative to center
    const center = {
      x: (range.x1 + range.x2) / 2,
      y: (range.y1 + range.y2) / 2,
      z: (range.z1 != null && range.z2 != null) ? ((range.z1 + range.z2) / 2) : ((anchor.z + focus.z) / 2)
    };
    const vec = {
      x: anchor.x - center.x,
      y: anchor.y - center.y,
      z: anchor.z - center.z
    };
    const abs = { x: Math.abs(vec.x), y: Math.abs(vec.y), z: Math.abs(vec.z) };
    let axis = 'x';
    let axisIndex = 0;
    let best = abs.x;
    if(abs.y > best){ axis = 'y'; axisIndex = 1; best = abs.y; }
    if(abs.z > best){ axis = 'z'; axisIndex = 2; best = abs.z; }
    if(best < 1e-5) return null;
    const sign = vec[axis] >= 0 ? 1 : -1;
    return { axis, axisIndex, sign };
  }catch(e){ 
    console.warn('computeSelectionFaceHint failed', e); 
    return null; 
  }
}

