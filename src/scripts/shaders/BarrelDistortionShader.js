/**
 * Barrel Distortion Shader - Ported from merged2.html
 * 
 * Post-processing effect for lens distortion:
 * - Barrel/pincushion distortion
 * - Configurable strength
 * - Chromatic aberration option
 */

export const BarrelDistortionShader = {
  uniforms: {
    tDiffuse: { value: null },
    strength: { value: 0.5 },
    height: { value: 1.0 },
    aspectRatio: { value: 1.0 },
    cylindricalRatio: { value: 1.0 },
    chromaticAberration: { value: 0.0 }
  },

  vertexShader: `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float strength;
    uniform float height;
    uniform float aspectRatio;
    uniform float cylindricalRatio;
    uniform float chromaticAberration;
    
    varying vec2 vUv;
    
    vec2 distort(vec2 uv, float strength) {
      vec2 h = uv - vec2(0.5);
      float r2 = dot(h, h);
      float f = 1.0 + r2 * (strength * sqrt(r2));
      
      return f * h + 0.5;
    }
    
    void main() {
      vec2 uv = vUv;
      
      // Apply aspect ratio correction
      uv.x *= aspectRatio;
      
      if (chromaticAberration > 0.0) {
        // Chromatic aberration
        vec2 uvR = distort(uv, strength * 1.05) / vec2(aspectRatio, 1.0);
        vec2 uvG = distort(uv, strength) / vec2(aspectRatio, 1.0);
        vec2 uvB = distort(uv, strength * 0.95) / vec2(aspectRatio, 1.0);
        
        float r = texture2D(tDiffuse, uvR).r;
        float g = texture2D(tDiffuse, uvG).g;
        float b = texture2D(tDiffuse, uvB).b;
        
        gl_FragColor = vec4(r, g, b, 1.0);
      } else {
        // Simple distortion
        vec2 distortedUv = distort(uv, strength) / vec2(aspectRatio, 1.0);
        gl_FragColor = texture2D(tDiffuse, distortedUv);
      }
      
      // Vignette
      vec2 center = vUv - 0.5;
      float vignette = 1.0 - dot(center, center) * 0.8;
      gl_FragColor.rgb *= vignette;
    }
  `
};

export default BarrelDistortionShader;


