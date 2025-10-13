/**
 * Camera and View-Relative Navigation Helpers
 * Extracted from merged2.html lines 11218-11295
 */

/**
 * Determine camera basis relative to array for view-relative navigation
 * Returns which axis is major (facing camera) and signs for each axis
 */
export function cameraBasisForSelection(arr){
  let major='Z', sign=1, signX=1, signY=1, signZ=1;
  if(!arr) return {major, sign, signX, signY, signZ};
  try{
    if(typeof THREE === 'undefined' || !window.Scene) return {major, sign, signX, signY, signZ};
    const frame = arr._frame || null;
    const cam = Scene?.getCamera ? Scene.getCamera() : null;
    if(frame && cam && cam.position && typeof cam.position.clone === 'function'){
      const arrPos = new THREE.Vector3().setFromMatrixPosition(frame.matrixWorld);
      const camPos = cam.position.clone();
      const toCamW = camPos.sub(arrPos).normalize();
      const inv = new THREE.Matrix4().copy(frame.matrixWorld).invert();
      const toCamL = toCamW.clone().applyMatrix3(new THREE.Matrix3().setFromMatrix4(inv)).normalize();
      const ax=Math.abs(toCamL.x), ay=Math.abs(toCamL.y), az=Math.abs(toCamL.z);
      if(ay>ax && ay>az){ major='Y'; sign=Math.sign(toCamL.y)||1; }
      else if(ax>ay && ax>az){ major='X'; sign=Math.sign(toCamL.x)||1; }
      else { major='Z'; sign=Math.sign(toCamL.z)||1; }
      signX = Math.sign(toCamL.x)||1;
      signY = Math.sign(toCamL.y)||1;
      signZ = Math.sign(toCamL.z)||1;
    }
  }catch{}
  return {major, sign, signX, signY, signZ};
}

/**
 * Resolve view-relative directional step
 * Converts UI direction (up/down/left/right/depthUp/depthDown) to 3D delta
 * relative to camera viewing direction
 */
export function resolveViewRelativeStep(arr, direction, opts={}){
  const depthMode = opts.depthMode || false;
  if(!arr || !direction) return {dx:0,dy:0,dz:0};
  
  // D-pad depth buttons ALWAYS control Z axis toward/away from camera
  if(direction === 'depthUp' || direction === 'depthDown'){
    const basis = cameraBasisForSelection(arr);
    const dz = (direction === 'depthUp') 
      ? (basis.signZ > 0 ? +1 : -1) // toward camera
      : (basis.signZ > 0 ? -1 : +1); // away from camera
    return {dx:0, dy:0, dz};
  }
  
  // D-pad up/down ALWAYS control Y (height) moving upward/downward in visual space
  // In array coords: higher Y = physically higher in 3D space
  if(direction === 'up') return {dx:0, dy:+1, dz:0};
  if(direction === 'down') return {dx:0, dy:-1, dz:0};
  
  // Left/Right are view-relative
  const basis = cameraBasisForSelection(arr);
  let dx=0, dy=0, dz=0;
  
  if(depthMode){
    // Depth mode: left/right control X, but still relative to camera
    if(direction==='left') dx = (basis.signX>0 ? -1 : +1);
    if(direction==='right') dx = (basis.signX>0 ? +1 : -1);
    return {dx,dy,dz};
  }
  
  // Standard mode: left/right are screen-space left/right relative to camera
  if(basis.major==='X'){
    // Viewing along X axis (from east +X or west -X)
    // Left/right control Z axis (north/south)
    // From east (+X): left=north=+Z, right=south=-Z
    // From west (-X): left=south=-Z, right=north=+Z
    if(direction==='left') dz = (basis.sign>0 ? +1 : -1);
    if(direction==='right') dz = (basis.sign>0 ? -1 : +1);
  } else if(basis.major==='Z'){
    // Viewing along Z axis (from south +Z or north -Z)
    // Left/right control X axis (east/west)
    // From south (+Z): left=west=-X, right=east=+X
    // From north (-Z): left=east=+X, right=west=-X
    if(direction==='left') dx = (basis.sign>0 ? -1 : +1);
    if(direction==='right') dx = (basis.sign>0 ? +1 : -1);
  } else { // basis.major === 'Y' (top/bottom view)
    // Viewing from top (+Y) or bottom (-Y)
    // Left/right control X axis (east/west)
    // From top: left=west=-X, right=east=+X
    if(direction==='left') dx = -1;
    if(direction==='right') dx = +1;
  }
  return {dx,dy,dz};
}

