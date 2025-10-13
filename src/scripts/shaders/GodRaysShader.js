/**
 * God Rays (Volumetric Light) Shader - Ported from merged2.html
 * 
 * Post-processing effect for god rays/volumetric lighting:
 * - Radial blur from light source
 * - Configurable intensity and decay
 * - Screen-space implementation
 */

export const GodRaysShader = {
  uniforms: {
    tDiffuse: { value: null },
    lightPosition: { value: [0.5, 0.5] },
    exposure: { value: 0.8 },
    decay: { value: 0.95 },
    density: { value: 0.5 },
    weight: { value: 0.4 },
    samples: { value: 50 }
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
    uniform vec2 lightPosition;
    uniform float exposure;
    uniform float decay;
    uniform float density;
    uniform float weight;
    uniform int samples;
    
    varying vec2 vUv;
    
    void main() {
      // Calculate vector from pixel to light source
      vec2 deltaTexCoord = vUv - lightPosition;
      deltaTexCoord *= 1.0 / float(samples) * density;
      
      // Store initial sample
      vec2 texCoord = vUv;
      vec3 color = texture2D(tDiffuse, texCoord).rgb;
      
      // Accumulate samples along ray
      float illuminationDecay = 1.0;
      
      for (int i = 0; i < 50; i++) {
        if (i >= samples) break;
        
        texCoord -= deltaTexCoord;
        vec3 sample = texture2D(tDiffuse, texCoord).rgb;
        
        sample *= illuminationDecay * weight;
        color += sample;
        illuminationDecay *= decay;
      }
      
      gl_FragColor = vec4(color * exposure, 1.0);
    }
  `
};

export default GodRaysShader;


