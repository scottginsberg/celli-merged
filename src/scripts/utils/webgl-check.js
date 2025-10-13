/**
 * WebGL Capability Check
 * Verifies browser WebGL support
 */

export function checkWebGL() {
  try {
    const canvas = document.createElement('canvas');
    const hasWebGL = !!(
      window.WebGLRenderingContext && 
      (canvas.getContext('webgl2') || 
       canvas.getContext('webgl') || 
       canvas.getContext('experimental-webgl'))
    );
    return hasWebGL;
  } catch (e) {
    return false;
  }
}


