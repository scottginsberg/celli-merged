/**
 * Glitch Shader - Ported from merged2.html
 * 
 * Post-processing glitch effects:
 * - RGB channel shift
 * - Scan line distortion
 * - Block displacement
 * - Configurable intensity
 */

export const GlitchShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0.0 },
    amount: { value: 0.08 },
    angle: { value: 0.02 },
    seed: { value: 0.02 },
    seedX: { value: 0.02 },
    seedY: { value: 0.02 },
    distortionX: { value: 0.5 },
    distortionY: { value: 0.6 },
    colS: { value: 0.05 },
    byp: { value: 0 }
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
    uniform float time;
    uniform float amount;
    uniform float angle;
    uniform float seed;
    uniform float seedX;
    uniform float seedY;
    uniform float distortionX;
    uniform float distortionY;
    uniform float colS;
    uniform float byp;
    
    varying vec2 vUv;
    
    float rand(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    void main() {
      if (byp > 0.0) {
        gl_FragColor = texture2D(tDiffuse, vUv);
        return;
      }
      
      vec2 uv = vUv;
      float sx = uv.x * seedX;
      float sy = uv.y * seedY;
      
      // Block displacement
      float x = sx + time;
      float y = sy + time;
      float _x = floor(x / 0.01 + seed) * 0.01;
      float _y = floor(y / 0.01 + seed) * 0.01;
      float displaceX = (rand(vec2(_x, _y)) - 0.5) * distortionX * amount;
      float displaceY = (rand(vec2(_x, _y)) - 0.5) * distortionY * amount;
      
      uv.x += displaceX;
      uv.y += displaceY;
      
      // RGB channel shift
      vec4 cr = texture2D(tDiffuse, uv + vec2(colS * amount, 0.0));
      vec4 cga = texture2D(tDiffuse, uv);
      vec4 cb = texture2D(tDiffuse, uv - vec2(colS * amount, 0.0));
      
      gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);
      
      // Scanline
      float scanline = sin(uv.y * 800.0 + time * 10.0) * 0.04;
      gl_FragColor.rgb += scanline;
    }
  `
};

export default GlitchShader;


