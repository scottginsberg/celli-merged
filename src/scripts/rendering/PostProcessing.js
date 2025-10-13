/**
 * Post-Processing Pipeline
 * Extracted from merged2.html lines 19000-20200 (~1200 lines)
 * 
 * Complete multi-pass rendering pipeline for visual effects
 * 
 * Components:
 * - Render targets (RTTs) for multi-pass rendering
 * - Bloom with gaussian blur
 * - God rays (volumetric lighting)
 * - Lighthouse beams
 * - Depth of Field (DOF)
 * - Atmospheric fog (layered)
 * - Vignette
 * - Film grain
 * - Composite shader combining all effects
 * 
 * Dependencies:
 * - THREE.js
 * - Scene (renderer, camera)
 * - Settings (bloom strength, DOF, fog, etc.)
 */

import * as THREE from 'three';

/**
 * Initialize post-processing pipeline
 * @param {number} w - Viewport width
 * @param {number} h - Viewport height
 * @param {Object} settings - Graphics settings
 * @returns {Object} Post-processing state
 */
export function initPostProcessing(w, h, settings = {}) {
  // Render targets
  const rtScene = new THREE.WebGLRenderTarget(w, h, {
    depthTexture: new THREE.DepthTexture(),
    depthBuffer: true,
    stencilBuffer: false,
    samples: 4 // MSAA antialiasing
  });
  
  const rtHalfA = new THREE.WebGLRenderTarget(Math.max(1, w / 2), Math.max(1, h / 2));
  const rtHalfB = new THREE.WebGLRenderTarget(Math.max(1, w / 2), Math.max(1, h / 2));
  const rtOcc = new THREE.WebGLRenderTarget(Math.max(1, w / 2), Math.max(1, h / 2));
  const rtOccBlur = new THREE.WebGLRenderTarget(Math.max(1, w / 2), Math.max(1, h / 2));
  const rtLighthouse = new THREE.WebGLRenderTarget(Math.max(1, w / 2), Math.max(1, h / 2));
  
  const fsQuad = new THREE.PlaneGeometry(2, 2);
  
  // Blur shaders for bloom
  const blurFrag = `
    varying vec2 vUv;
    uniform sampler2D t;
    uniform vec2 res;
    
    void main() {
      vec2 px = 1.0 / res;
      float w[5];
      w[0] = 0.204164;
      w[1] = 0.304005;
      w[2] = 0.193783;
      w[3] = 0.072184;
      w[4] = 0.017864;
      
      vec3 c = texture2D(t, vUv).rgb * w[0];
      for(int i = 1; i < 5; i++) {
        c += texture2D(t, vUv + vec2(float(i) * px.x, 0.)).rgb * w[i];
        c += texture2D(t, vUv - vec2(float(i) * px.x, 0.)).rgb * w[i];
      }
      gl_FragColor = vec4(c, 1.0);
    }
  `;
  
  const blurH = new THREE.ShaderMaterial({
    uniforms: {
      t: { value: null },
      res: { value: new THREE.Vector2(w, h) }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.);
      }
    `,
    fragmentShader: blurFrag,
    depthTest: false,
    depthWrite: false
  });
  
  const blurV = new THREE.ShaderMaterial({
    uniforms: {
      t: { value: null },
      res: { value: new THREE.Vector2(w, h) }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.);
      }
    `,
    fragmentShader: blurFrag.replace('vec2(float(i)*px.x,0.)', 'vec2(0.,float(i)*px.y)'),
    depthTest: false,
    depthWrite: false
  });
  
  // God rays shader
  const raysMat = new THREE.ShaderMaterial({
    uniforms: {
      t: { value: null },
      res: { value: new THREE.Vector2(w / 2, h / 2) },
      sunPos: { value: new THREE.Vector2(0.5, 0.2) },
      rayDecay: { value: settings.rayDecay || 0.965 },
      rayExposure: { value: settings.rayExposure || 1.15 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D t;
      uniform vec2 res;
      uniform vec2 sunPos;
      uniform float rayDecay;
      uniform float rayExposure;
      
      float sampleOcclusion(vec2 uv) {
        vec2 px = 1.0 / res;
        float c = texture2D(t, uv).r;
        c += texture2D(t, uv + vec2(px.x, 0.0)).r * 0.5;
        c += texture2D(t, uv - vec2(px.x, 0.0)).r * 0.5;
        c += texture2D(t, uv + vec2(0.0, px.y)).r * 0.5;
        c += texture2D(t, uv - vec2(0.0, px.y)).r * 0.5;
        return c / 3.0;
      }
      
      void main() {
        vec2 delta = sunPos - vUv;
        float dist = length(delta);
        vec2 stepv = delta / 96.0;
        vec2 uv = vUv;
        float illum = 0.0;
        float decay = 1.0;
        
        for(int i = 0; i < 96; i++) {
          uv += stepv;
          float light = sampleOcclusion(uv);
          illum += light * decay;
          decay *= rayDecay;
        }
        
        float col = illum * rayExposure / (1.0 + dist * 1.5);
        gl_FragColor = vec4(vec3(col), 1.0);
      }
    `,
    depthTest: false,
    depthWrite: false
  });
  
  // Lighthouse beams shader
  const lighthouseMat = new THREE.ShaderMaterial({
    uniforms: {
      lighthousePos: { value: [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()] },
      lighthouseCount: { value: 0 },
      beamSize: { value: 0.08 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform vec3 lighthousePos[4];
      uniform int lighthouseCount;
      uniform float beamSize;
      
      void main() {
        float brightness = 0.0;
        for(int i = 0; i < 4; i++) {
          if(i >= lighthouseCount) break;
          vec2 pos = lighthousePos[i].xy;
          float dist = length(vUv - pos);
          brightness += smoothstep(beamSize, beamSize * 0.3, dist);
        }
        gl_FragColor = vec4(vec3(brightness), 1.0);
      }
    `,
    depthTest: false,
    depthWrite: false
  });
  
  // Composite shader (combines all effects)
  const compMat = new THREE.ShaderMaterial({
    uniforms: {
      t: { value: null },
      t2: { value: null },
      t3: { value: null },
      t4: { value: null },
      depthTex: { value: null },
      res: { value: new THREE.Vector2(w, h) },
      strength: { value: settings.bloomStrength || 0.7 },
      time: { value: 0 },
      vig: { value: settings.vignetteStrength || 0.85 },
      grain: { value: settings.grainAmount || 0.015 },
      enableBloom: { value: settings.enableBloom ? 1 : 0 },
      enableVig: { value: settings.enableVignette ? 1 : 0 },
      focusDist: { value: settings.focusDistance || 21.0 },
      dofStrength: { value: settings.dofStrength || 0.95 },
      focusRange: { value: settings.focusRange || 10.0 },
      camNear: { value: 0.1 },
      camFar: { value: 5000 },
      fogStart: { value: settings.fogStart || 50.0 },
      fogEnd: { value: settings.fogEnd || 200.0 },
      fogCol: { value: new THREE.Color(settings.fogColor || 0x5aaee3) },
      enableRays: { value: settings.enableRays ? 1 : 0 },
      rayStrength: { value: settings.rayStrength || 1.8 },
      rayColor: { value: new THREE.Color(0xcde9ff) },
      enableLighthouse: { value: settings.enableLighthouse ? 1 : 0 },
      lighthouseStrength: { value: settings.lighthouseStrength || 0.8 },
      lighthouseColor: { value: new THREE.Color(0xffd89a) }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D t;
      uniform sampler2D t2;
      uniform sampler2D t3;
      uniform sampler2D t4;
      uniform sampler2D depthTex;
      uniform vec2 res;
      uniform float strength, time, vig, grain;
      uniform int enableBloom, enableVig;
      uniform float focusDist, dofStrength, focusRange, camNear, camFar;
      uniform float fogStart, fogEnd;
      uniform vec3 fogCol;
      uniform int enableRays;
      uniform float rayStrength;
      uniform vec3 rayColor;
      uniform int enableLighthouse;
      uniform float lighthouseStrength;
      uniform vec3 lighthouseColor;
      
      float linearizeDepth(float z) {
        float ndc = z * 2.0 - 1.0;
        return (2.0 * camNear * camFar) / (camFar + camNear - ndc * (camFar - camNear));
      }
      
      float rnd(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }
      
      vec3 dofBlur(sampler2D tex, float radius) {
        vec2 px = 1.0 / res;
        vec3 c = texture2D(tex, vUv).rgb * 0.28;
        c += texture2D(tex, vUv + px * vec2(radius, 0.0)).rgb * 0.12;
        c += texture2D(tex, vUv + px * vec2(-radius, 0.0)).rgb * 0.12;
        c += texture2D(tex, vUv + px * vec2(0.0, radius)).rgb * 0.12;
        c += texture2D(tex, vUv + px * vec2(0.0, -radius)).rgb * 0.12;
        c += texture2D(tex, vUv + px * vec2(radius, radius)).rgb * 0.09;
        c += texture2D(tex, vUv + px * vec2(-radius, radius)).rgb * 0.09;
        c += texture2D(tex, vUv + px * vec2(radius, -radius)).rgb * 0.09;
        c += texture2D(tex, vUv + px * vec2(-radius, -radius)).rgb * 0.09;
        return c;
      }
      
      void main() {
        float z = texture2D(depthTex, vUv).r;
        float depth = linearizeDepth(z);
        
        // DOF - only apply to far objects (ocean), keep near objects (arrays) sharp
        float nearThreshold = 40.0;
        float dofMask = smoothstep(nearThreshold, nearThreshold + 20.0, depth);
        float coc = smoothstep(0.0, focusRange, abs(depth - focusDist)) * dofMask;
        float rad = coc * dofStrength * 6.0;
        vec3 base = dofBlur(t, rad);
        
        // Layered atmospheric fog
        float ff1 = smoothstep(fogStart, fogEnd * 0.5, depth);
        float ff2 = smoothstep(fogEnd * 0.5, fogEnd, depth);
        float ff3 = smoothstep(fogEnd, fogEnd * 1.8, depth);
        vec3 fogLayer1 = fogCol * 0.45;
        vec3 fogLayer2 = fogCol * 0.75;
        vec3 fogLayer3 = fogCol * 0.95;
        base = mix(base, fogLayer1, ff1 * 0.4);
        base = mix(base, fogLayer2, ff2 * 0.5);
        base = mix(base, fogLayer3, ff3 * 0.7);
        
        // Bloom
        vec3 bloom = texture2D(t2, vUv).rgb * strength;
        if(enableBloom == 1) base += bloom;
        
        // God rays
        if(enableRays == 1) {
          float r = texture2D(t3, vUv).r;
          base += rayColor * r * rayStrength;
        }
        
        // Lighthouse beams
        if(enableLighthouse == 1) {
          float lh = texture2D(t4, vUv).r;
          base += lighthouseColor * lh * lighthouseStrength;
        }
        
        // Vignette
        vec2 uv = vUv * 2.0 - 1.0;
        float v = smoothstep(1.4, 0.2 / vig, dot(uv, uv));
        if(enableVig == 1) base *= v;
        
        // Film grain
        float g = (rnd(vUv * res + time) - 0.5) * (grain * 2.0);
        base += g;
        
        gl_FragColor = vec4(base, 1.0);
      }
    `,
    depthTest: false,
    depthWrite: false
  });
  
  // Screen scene for final composite
  const screenScene = new THREE.Scene();
  const screenCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const screenMesh = new THREE.Mesh(fsQuad, compMat);
  screenScene.add(screenMesh);
  
  return {
    rtScene,
    rtHalfA,
    rtHalfB,
    rtOcc,
    rtOccBlur,
    rtLighthouse,
    blurH,
    blurV,
    raysMat,
    lighthouseMat,
    compMat,
    screenScene,
    screenCam,
    fsQuad
  };
}

/**
 * Resize render targets when window size changes
 * @param {Object} post - Post-processing state
 * @param {number} w - New width
 * @param {number} h - New height
 */
export function resizePostTargets(post, w, h) {
  if (!post) return;
  
  post.rtScene.setSize(w, h);
  post.rtScene.depthTexture = new THREE.DepthTexture();
  post.rtHalfA.setSize(Math.max(1, w / 2), Math.max(1, h / 2));
  post.rtHalfB.setSize(Math.max(1, w / 2), Math.max(1, h / 2));
  post.rtOcc.setSize(Math.max(1, w / 2), Math.max(1, h / 2));
  post.rtOccBlur.setSize(Math.max(1, w / 2), Math.max(1, h / 2));
  post.rtLighthouse.setSize(Math.max(1, w / 2), Math.max(1, h / 2));
  
  [post.blurH, post.blurV, post.compMat].forEach(m => {
    if (m.uniforms.res) m.uniforms.res.value.set(w, h);
  });
  
  if (post.raysMat.uniforms.res) {
    post.raysMat.uniforms.res.value.set(Math.max(1, w / 2), Math.max(1, h / 2));
  }
}

/**
 * Sync post-processing settings from state
 * @param {Object} post - Post-processing state
 * @param {Object} settings - Graphics settings
 * @param {THREE.Camera} camera - Main camera
 */
export function syncPostSettings(post, settings, camera) {
  if (!post) return;
  
  const c = post.compMat.uniforms;
  
  if (camera) {
    c.camNear.value = camera.near;
    c.camFar.value = camera.far;
  }
  
  c.enableBloom.value = settings.enableBloom ? 1 : 0;
  c.strength.value = settings.bloomStrength || 0.7;
  c.enableVig.value = settings.enableVignette ? 1 : 0;
  c.vig.value = settings.vignetteStrength || 0.85;
  c.grain.value = settings.grainAmount || 0.015;
  c.focusDist.value = settings.focusDistance || 21.0;
  c.dofStrength.value = settings.dofStrength || 0.95;
  c.focusRange.value = settings.focusRange || 10.0;
  c.fogStart.value = settings.fogStart || 50.0;
  c.fogEnd.value = settings.fogEnd || 200.0;
  
  if (settings.fogColor) {
    c.fogCol.value.set(settings.fogColor);
  }
  
  c.enableRays.value = settings.enableRays ? 1 : 0;
  c.rayStrength.value = settings.rayStrength || 1.8;
  c.enableLighthouse.value = settings.enableLighthouse ? 1 : 0;
  c.lighthouseStrength.value = settings.lighthouseStrength || 0.8;
  
  // Update ray settings
  if (post.raysMat.uniforms) {
    post.raysMat.uniforms.rayDecay.value = settings.rayDecay || 0.965;
    post.raysMat.uniforms.rayExposure.value = settings.rayExposure || 1.15;
  }
}

/**
 * Render with post-processing pipeline
 * @param {THREE.WebGLRenderer} renderer - WebGL renderer
 * @param {THREE.Scene} scene - Main scene
 * @param {THREE.Camera} camera - Main camera
 * @param {Object} post - Post-processing state
 * @param {number} time - Elapsed time
 */
export function renderWithPostProcessing(renderer, scene, camera, post, time = 0) {
  if (!post || !renderer || !scene || !camera) {
    // Fallback to direct render
    renderer.render(scene, camera);
    return;
  }
  
  try {
    // Update time uniform
    post.compMat.uniforms.time.value = time;
    
    // 1. Render main scene to rtScene with depth
    renderer.setRenderTarget(post.rtScene);
    renderer.render(scene, camera);
    
    // 2. Extract bright areas for bloom
    renderer.setRenderTarget(post.rtHalfA);
    post.compMat.uniforms.t.value = post.rtScene.texture;
    renderer.render(post.screenScene, post.screenCam);
    
    // 3. Blur horizontally
    renderer.setRenderTarget(post.rtHalfB);
    post.blurH.uniforms.t.value = post.rtHalfA.texture;
    renderer.render(new THREE.Scene().add(new THREE.Mesh(post.fsQuad, post.blurH)), post.screenCam);
    
    // 4. Blur vertically (bloom complete)
    renderer.setRenderTarget(post.rtHalfA);
    post.blurV.uniforms.t.value = post.rtHalfB.texture;
    renderer.render(new THREE.Scene().add(new THREE.Mesh(post.fsQuad, post.blurV)), post.screenCam);
    
    // 5. God rays (if enabled)
    if (post.compMat.uniforms.enableRays.value === 1) {
      renderer.setRenderTarget(post.rtOcc);
      // Render occlusion mask
      renderer.render(scene, camera);
      
      renderer.setRenderTarget(post.rtOccBlur);
      post.raysMat.uniforms.t.value = post.rtOcc.texture;
      renderer.render(new THREE.Scene().add(new THREE.Mesh(post.fsQuad, post.raysMat)), post.screenCam);
    }
    
    // 6. Lighthouse beams (if enabled)
    if (post.compMat.uniforms.enableLighthouse.value === 1) {
      renderer.setRenderTarget(post.rtLighthouse);
      renderer.render(new THREE.Scene().add(new THREE.Mesh(post.fsQuad, post.lighthouseMat)), post.screenCam);
    }
    
    // 7. Final composite to screen
    renderer.setRenderTarget(null);
    post.compMat.uniforms.t.value = post.rtScene.texture;
    post.compMat.uniforms.t2.value = post.rtHalfA.texture;
    post.compMat.uniforms.t3.value = post.rtOccBlur.texture;
    post.compMat.uniforms.t4.value = post.rtLighthouse.texture;
    post.compMat.uniforms.depthTex.value = post.rtScene.depthTexture;
    renderer.render(post.screenScene, post.screenCam);
    
  } catch (e) {
    console.error('Post-processing render failed:', e);
    // Fallback to direct render
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
  }
}

/**
 * NOTE: This is the core post-processing pipeline extracted from merged2.html.
 * The complete system also includes:
 * 
 * - Ocean-specific post-processing (see lines 19938-20200)
 * - Sun position calculation for god rays
 * - Lighthouse position management
 * - Dynamic post-processing parameter updates
 * - Integration with graphics settings UI
 * 
 * For full integration:
 * - Initialize with initPostProcessing(w, h, settings)
 * - Update on resize with resizePostTargets(post, w, h)
 * - Sync settings with syncPostSettings(post, settings, camera)
 * - Render each frame with renderWithPostProcessing(renderer, scene, camera, post, time)
 */

export default {
  initPostProcessing,
  resizePostTargets,
  syncPostSettings,
  renderWithPostProcessing
};



