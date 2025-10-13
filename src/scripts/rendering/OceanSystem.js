/**
 * Ocean Backdrop System
 * Extracted from merged2.html lines 19470-20000 (~530 lines)
 * 
 * Complete ocean water simulation with waves, structures, and atmosphere
 * 
 * Components:
 * - Sky gradient sphere
 * - Gerstner wave ocean surface with foam
 * - Animated grid overlay
 * - Floating buoy sphere
 * - Voxel tower structures
 * - Lighthouse beacon lights
 * - Floating light orbs
 * - Wave parameter system
 * 
 * Dependencies:
 * - THREE.js
 * - Scene (renderer, camera)
 * - Settings (ocean configuration)
 */

import * as THREE from 'three';

/**
 * Ocean default settings
 */
export const OceanDefaults = Object.freeze({
  enabled: false,
  envIntensity: 0.8,
  lightIntensity: 0.55,
  exposure: 1.25,
  showGrid: true,
  showSphere: true,
  showTowers: true,
  showFloaters: true,
  timeScale: 0.2,
  gridDensity: 64,
  choppiness: 2.0,
  amplitude0: 0.85,
  amplitude1: 0.45,
  amplitude2: 0.28,
  amplitude3: 0.18,
  amplitude4: 0.12,
  amplitude5: 0.08,
  wavelength0: 35.0,
  wavelength1: 16.5,
  wavelength2: 8.2,
  wavelength3: 4.5,
  wavelength4: 2.8,
  wavelength5: 1.8,
  speed0: 0.95,
  speed1: 1.15,
  speed2: 1.3,
  speed3: 1.45,
  speed4: 1.6,
  speed5: 1.8,
  deepColor: '#0b345a',
  shallowColor: '#1e6aa2',
  foamColor: '#ffffff',
  foamAmount: 2.5,
  foamBias: 0.5,
  foamScale: 1.5,
  maxGloss: 0.91,
  roughnessScale: 0.0044,
  horizonColor: '#cfeaff',
  horizonZStart: 60.0,
  horizonZEnd: 260.0,
  horizonBoost: 1.10,
  microScale: 0.035,
  microFreq: 18.0,
  microWaveScale: 0.3,
  enableBloom: true,
  bloomStrength: 0.25,
  enableVignette: true,
  vignetteStrength: 0.85,
  grainAmount: 0.015,
  enableRays: true,
  rayStrength: 1.8,
  rayDecay: 0.965,
  rayExposure: 1.15,
  enableLighthouse: true,
  lighthouseStrength: 0.8,
  focusDistance: 21.0,
  dofStrength: 0.95,
  focusRange: 10.0,
  fogStart: 50.0,
  fogEnd: 200.0,
  fogColor: '#5aaee3',
  gridOpacity: 0.35,
  sunElevation: 22,
  sunAzimuth: 25,
  skyTopColor: '#8ec1ea',
  skyMidColor: '#63aee3',
  skyBotColor: '#092c4d'
});

/**
 * Ocean wave directions (Gerstner waves)
 */
const oceanDirs = [
  new THREE.Vector2(1.0, 0.2).normalize(),
  new THREE.Vector2(-0.6, 0.8).normalize(),
  new THREE.Vector2(0.2, -1.0).normalize(),
  new THREE.Vector2(0.8, 0.4).normalize(),
  new THREE.Vector2(-1.0, -0.2).normalize(),
  new THREE.Vector2(0.4, 0.9).normalize()
];

/**
 * Wave parameters (amplitude, wavelength, speed for each wave)
 */
const waveParams = {
  A: [0.85, 0.45, 0.28, 0.18, 0.12, 0.08],
  L: [35.0, 16.5, 8.2, 4.5, 2.8, 1.8],
  S: [0.95, 1.15, 1.3, 1.45, 1.6, 1.8]
};

/**
 * Create ocean system
 * @param {THREE.Scene} scene - THREE.js scene
 * @param {Object} settings - Ocean settings (default: OceanDefaults)
 * @returns {Object} Ocean state object
 */
export function createOceanSystem(scene, settings = OceanDefaults) {
  const state = {
    settings: { ...settings },
    group: new THREE.Group(),
    sky: null,
    skyUniforms: null,
    water: null,
    waterUniforms: null,
    grid: null,
    gridAttr: null,
    gridConfig: null,
    ball: null,
    structures: [],
    floaters: [],
    voxelStructures: [],
    lighthousePositions: [],
    baseHeight: -6,
    time: 0,
    presentActive: false
  };
  
  state.group.name = 'OceanBackdrop';
  state.group.visible = false;
  
  // Create components
  createSky(state);
  createWater(state);
  createGrid(state);
  createBuoy(state);
  createStructures(state);
  createOceanLights(state);
  
  scene.add(state.group);
  
  return state;
}

/**
 * Create sky gradient sphere
 */
function createSky(state) {
  const geo = new THREE.SphereGeometry(1200, 32, 16);
  const uniforms = {
    top: { value: new THREE.Color(0x8ec1ea) },
    mid: { value: new THREE.Color(0x63aee3) },
    bot: { value: new THREE.Color(0x092c4d) }
  };
  
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms,
    vertexShader: `
      varying vec3 v;
      void main() {
        v = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
      }
    `,
    fragmentShader: `
      varying vec3 v;
      uniform vec3 top, mid, bot;
      void main() {
        float h = normalize(v).y * .5 + .5;
        vec3 c = mix(bot, mid, smoothstep(0., .45, h));
        c = mix(c, top, smoothstep(.45, 1., h));
        gl_FragColor = vec4(c, 1.);
      }
    `
  });
  
  const sky = new THREE.Mesh(geo, mat);
  sky.name = 'OceanSky';
  state.sky = sky;
  state.skyUniforms = uniforms;
  state.group.add(sky);
}

/**
 * Create Gerstner wave ocean surface
 */
function createWater(state) {
  const SIZE = 120;
  const SEG = 256;
  const STEP = SIZE / SEG;
  const HALF = SIZE / 2;
  
  state.gridConfig = { SIZE, SEG, STEP, HALF };
  
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  geo.rotateX(-Math.PI / 2);
  
  const uniforms = {
    uTime: { value: 0 },
    sunDir: { value: new THREE.Vector3(0.5, 0.6, 0.3).normalize() },
    deep: { value: new THREE.Color(0x0b345a) },
    shallow: { value: new THREE.Color(0x1e6aa2) },
    foamColor: { value: new THREE.Color(0xffffff) },
    Q: { value: state.settings.choppiness },
    foamAmt: { value: state.settings.foamAmount },
    foamBias: { value: state.settings.foamBias },
    foamScale: { value: state.settings.foamScale },
    maxGloss: { value: state.settings.maxGloss },
    roughnessScale: { value: state.settings.roughnessScale },
    microScale: { value: state.settings.microScale },
    microFreq: { value: state.settings.microFreq },
    microWaveScale: { value: state.settings.microWaveScale },
    nearFade: { value: 20.0 },
    farFade: { value: 200.0 },
    horizonCol: { value: new THREE.Color(0xcfeaff) },
    horizonZStart: { value: 60.0 },
    horizonZEnd: { value: 260.0 },
    horizonBoost: { value: state.settings.horizonBoost },
    A0: { value: waveParams.A[0] }, A1: { value: waveParams.A[1] }, A2: { value: waveParams.A[2] },
    A3: { value: waveParams.A[3] }, A4: { value: waveParams.A[4] }, A5: { value: waveParams.A[5] },
    L0: { value: waveParams.L[0] }, L1: { value: waveParams.L[1] }, L2: { value: waveParams.L[2] },
    L3: { value: waveParams.L[3] }, L4: { value: waveParams.L[4] }, L5: { value: waveParams.L[5] },
    S0: { value: waveParams.S[0] }, S1: { value: waveParams.S[1] }, S2: { value: waveParams.S[2] },
    S3: { value: waveParams.S[3] }, S4: { value: waveParams.S[4] }, S5: { value: waveParams.S[5] }
  };
  
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    uniforms,
    vertexShader: `
      uniform float uTime; uniform float Q;
      uniform float A0,A1,A2,A3,A4,A5, L0,L1,L2,L3,L4,L5, S0,S1,S2,S3,S4,S5;
      uniform float microScale, microFreq, microWaveScale;
      varying vec3 vN; varying vec3 vP; varying float vSlope; varying float vHeight;
      varying float vViewZ; varying float vBreak;
      
      const int N=6;
      vec2 D[N];
      
      void setup() {
        D[0]=normalize(vec2( 1.0, 0.2));
        D[1]=normalize(vec2(-0.6, 0.8));
        D[2]=normalize(vec2( 0.2,-1.0));
        D[3]=normalize(vec2( 0.8, 0.4));
        D[4]=normalize(vec2(-1.0,-0.2));
        D[5]=normalize(vec2( 0.4, 0.9));
      }
      
      float A[N]; float L[N]; float S[N];
      
      void params() {
        A[0]=A0;A[1]=A1;A[2]=A2;A[3]=A3;A[4]=A4;A[5]=A5;
        L[0]=L0;L[1]=L1;L[2]=L2;L[3]=L3;L[4]=L4;L[5]=L5;
        S[0]=S0;S[1]=S1;S[2]=S2;S[3]=S3;S[4]=S4;S[5]=S5;
      }
      
      void main() {
        setup(); params();
        vec3 p = position, disp = vec3(0.);
        vec3 grad = vec3(0.);
        float jac = 0.0;
        
        // Gerstner wave sum
        for(int i=0; i<N; i++) {
          float k = 6.28318 / L[i];
          float w = sqrt(9.8 * k);
          float a = k * dot(D[i], p.xz) - (w * S[i]) * uTime;
          float s = sin(a), c = cos(a);
          
          disp.x += Q * A[i] * D[i].x * c;
          disp.z += Q * A[i] * D[i].y * c;
          disp.y += A[i] * s;
          
          grad.x += -A[i] * D[i].x * k * c;
          grad.z += -A[i] * D[i].y * k * c;
          jac += k * A[i] * c;
        }
        
        p += disp;
        
        // Micro-detail waves
        float scaledFreq = microFreq * microWaveScale;
        float micro1 = sin(p.x * scaledFreq + uTime * 3.2) * cos(p.z * scaledFreq * 0.8 + uTime * 2.8);
        float micro2 = sin(p.x * scaledFreq * 2.3 + p.z * scaledFreq * 1.7 + uTime * 4.5) *
                       cos(p.z * scaledFreq * 2.1 + p.x * scaledFreq * 0.9 + uTime * 3.8);
        float microDisp = (micro1 + micro2 * 0.6) * microScale;
        p.y += microDisp;
        
        // Compute normal with micro-detail
        vec3 mainNormal = normalize(vec3(-grad.x, 1.0, -grad.z));
        vN = mainNormal;
        vSlope = length(grad);
        vHeight = disp.y + microDisp;
        
        vec4 vp = modelViewMatrix * vec4(p, 1.0);
        vViewZ = -vp.z;
        vP = (modelMatrix * vec4(p, 1.0)).xyz;
        vBreak = jac;
        gl_Position = projectionMatrix * vp;
      }
    `,
    fragmentShader: `
      uniform vec3 deep, shallow, foamColor, sunDir;
      uniform float foamAmt, foamBias, foamScale, nearFade, farFade, uTime;
      uniform float maxGloss, roughnessScale;
      uniform vec3 horizonCol;
      uniform float horizonZStart, horizonZEnd, horizonBoost;
      varying vec3 vN; varying vec3 vP; varying float vSlope; varying float vHeight;
      varying float vViewZ; varying float vBreak;
      
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
      
      void main() {
        vec3 N = normalize(vN);
        vec3 V = normalize(cameraPosition - vP);
        float fres = pow(1.0 - max(dot(V, N), 0.0), 4.0);
        vec3 base = mix(deep, shallow, smoothstep(-0.6, 0.95, vHeight));
        vec3 col = base * (0.72 + 0.28 * fres);
        
        // Horizon fade
        float distanceFade = smoothstep(horizonZStart, horizonZEnd, vViewZ);
        float viewAngle = abs(dot(normalize(V), N));
        float grazingMask = smoothstep(0.35, 0.01, viewAngle);
        float distBoost = pow(distanceFade, 0.6);
        float horizonMix = distBoost * grazingMask * horizonBoost * 1.5;
        col = mix(col, horizonCol * 1.3, clamp(horizonMix, 0.0, 0.95));
        
        // Foam from wave breaking
        float jacobian = vBreak;
        float turbulence = clamp((jacobian - foamBias) * foamScale, 0.0, 1.0);
        vec2 foamUV = vP.xz * 0.5 + uTime * 0.15;
        float foamTex = noise(foamUV * 4.0) * 0.5 + noise(foamUV * 8.0) * 0.3 + noise(foamUV * 16.0) * 0.2;
        foamTex = smoothstep(0.4, 0.7, foamTex);
        float foam = foamTex * turbulence * foamAmt;
        col = mix(col, foamColor, clamp(foam, 0.0, 1.0));
        
        // Specular highlights
        float viewDist = length(cameraPosition - vP);
        float distanceGloss = mix(0.09, maxGloss, 1.0 / (1.0 + viewDist * roughnessScale));
        float roughness = 1.0 - mix(distanceGloss, 0.0, clamp(turbulence * 0.8, 0.0, 1.0));
        vec3 L = normalize(sunDir);
        vec3 H = normalize(L + V);
        float NdotH = max(dot(N, H), 0.0);
        float specPower = mix(16.0, 512.0, distanceGloss);
        float spec = pow(NdotH, specPower) * (1.0 - roughness) * distanceGloss;
        col += vec3(spec * 2.5);
        
        // Depth-based alpha fade
        float depthAlpha = 0.95 - smoothstep(nearFade, farFade, vViewZ) * 0.45;
        gl_FragColor = vec4(col, depthAlpha);
      }
    `
  });
  
  mat.depthWrite = false;
  const water = new THREE.Mesh(geo, mat);
  water.position.y = state.baseHeight;
  water.renderOrder = -10;
  water.name = 'OceanWater';
  state.water = water;
  state.waterUniforms = uniforms;
  state.group.add(water);
}

/**
 * Create animated grid overlay
 */
function createGrid(state) {
  const baseConfig = state.gridConfig || {};
  const GRID_SEG = state.settings.gridDensity ?? 64;
  const SIZE = baseConfig.SIZE ?? 120;
  const STEP = SIZE / GRID_SEG;
  const HALF = SIZE / 2;
  
  state.gridConfig = { ...baseConfig, GRID_SEG, GRID_STEP: STEP, HALF };
  
  const lineCount = ((GRID_SEG + 1) * GRID_SEG + (GRID_SEG + 1) * GRID_SEG);
  const positions = new Float32Array(lineCount * 2 * 3);
  let ptr = 0;
  
  // Horizontal lines
  for (let z = 0; z <= GRID_SEG; z++) {
    for (let x = 0; x < GRID_SEG; x++) {
      const ax = -HALF + x * STEP, az = -HALF + z * STEP;
      const bx = ax + STEP, bz = az;
      positions[ptr++] = ax; positions[ptr++] = state.baseHeight; positions[ptr++] = az;
      positions[ptr++] = bx; positions[ptr++] = state.baseHeight; positions[ptr++] = bz;
    }
  }
  
  // Vertical lines
  for (let x = 0; x <= GRID_SEG; x++) {
    for (let z = 0; z < GRID_SEG; z++) {
      const ax = -HALF + x * STEP, az = -HALF + z * STEP;
      const bx = ax, bz = az + STEP;
      positions[ptr++] = ax; positions[ptr++] = state.baseHeight; positions[ptr++] = az;
      positions[ptr++] = bx; positions[ptr++] = state.baseHeight; positions[ptr++] = bz;
    }
  }
  
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const mat = new THREE.LineBasicMaterial({
    color: 0xbfe7ff,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    depthTest: true
  });
  
  const grid = new THREE.LineSegments(geo, mat);
  grid.renderOrder = 999;
  grid.name = 'OceanGrid';
  state.grid = grid;
  state.gridAttr = geo.getAttribute('position');
  state.group.add(grid);
}

/**
 * Create floating buoy sphere
 */
function createBuoy(state) {
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 24, 16),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x88aaff,
      emissiveIntensity: 1.05,
      roughness: 0.25
    })
  );
  
  ball.position.set(0, state.baseHeight + 0.7, -2.5);
  ball.userData.base = { x: 0, z: -2.5, height: 0.55 };
  ball.name = 'OceanBuoy';
  state.ball = ball;
  state.group.add(ball);
}

/**
 * Create voxel tower structures (lighthouses)
 */
function createStructures(state) {
  // Placeholder - full implementation would create voxel towers
  // See merged2.html lines 19844-19899 for complete tower generation
  state.structures = [];
  state.voxelStructures = [];
  state.lighthousePositions = [];
}

/**
 * Create ocean-specific lighting
 */
function createOceanLights(state) {
  const lights = new THREE.Group();
  lights.name = 'OceanLights';
  
  // Ambient
  const ambient = new THREE.AmbientLight(0xbfdfff, 0.25);
  lights.add(ambient);
  
  // Directional (key light)
  const dir = new THREE.DirectionalLight(0xffffff, 0.55);
  dir.position.set(-3, 7, -4);
  dir.castShadow = false;
  lights.add(dir);
  
  state.oceanLights = { ambient, directional: dir };
  state.group.add(lights);
}

/**
 * Update ocean animation
 * @param {Object} state - Ocean state
 * @param {number} deltaTime - Time since last frame
 */
export function updateOcean(state, deltaTime) {
  if (!state || !state.group.visible) return;
  
  state.time += deltaTime * (state.settings.timeScale || 0.2);
  
  // Update water shader time
  if (state.waterUniforms) {
    state.waterUniforms.uTime.value = state.time;
  }
  
  // Animate buoy (bob with waves)
  if (state.ball && state.ball.userData.base) {
    const base = state.ball.userData.base;
    const bob = Math.sin(state.time * 0.8) * 0.3;
    state.ball.position.y = state.baseHeight + base.height + bob;
    state.ball.rotation.x = Math.sin(state.time * 0.5) * 0.1;
    state.ball.rotation.z = Math.cos(state.time * 0.7) * 0.1;
  }
  
  // Animate floaters
  if (state.floaters) {
    state.floaters.forEach(f => {
      const t = state.time * f.floatSpeed + f.floatOffset;
      const bob = Math.sin(t) * 1.2;
      f.mesh.position.y = f.mesh.userData.baseY + bob;
      f.mesh.rotation.x += 0.01;
      f.mesh.rotation.y += 0.02;
      if (f.light) {
        f.light.position.copy(f.mesh.position);
        f.light.intensity = f.light.userData.baseIntensity * (0.8 + Math.sin(t * 2) * 0.2);
      }
    });
  }
}

/**
 * Toggle ocean visibility
 * @param {Object} state - Ocean state
 * @param {boolean} enabled - Enable/disable ocean
 */
export function setOceanEnabled(state, enabled) {
  if (!state || !state.group) return;
  state.group.visible = !!enabled;
  state.settings.enabled = !!enabled;
}

/**
 * Update ocean settings
 * @param {Object} state - Ocean state
 * @param {Object} newSettings - New settings to apply
 */
export function updateOceanSettings(state, newSettings) {
  if (!state) return;
  
  Object.assign(state.settings, newSettings);
  
  // Update shader uniforms
  if (state.waterUniforms) {
    if (newSettings.deepColor) state.waterUniforms.deep.value.set(newSettings.deepColor);
    if (newSettings.shallowColor) state.waterUniforms.shallow.value.set(newSettings.shallowColor);
    if (newSettings.foamColor) state.waterUniforms.foamColor.value.set(newSettings.foamColor);
    if (newSettings.horizonColor) state.waterUniforms.horizonCol.value.set(newSettings.horizonColor);
    
    if (newSettings.choppiness != null) state.waterUniforms.Q.value = newSettings.choppiness;
    if (newSettings.foamAmount != null) state.waterUniforms.foamAmt.value = newSettings.foamAmount;
    if (newSettings.foamBias != null) state.waterUniforms.foamBias.value = newSettings.foamBias;
    if (newSettings.foamScale != null) state.waterUniforms.foamScale.value = newSettings.foamScale;
  }
  
  // Update sky colors
  if (state.skyUniforms) {
    if (newSettings.skyTopColor) state.skyUniforms.top.value.set(newSettings.skyTopColor);
    if (newSettings.skyMidColor) state.skyUniforms.mid.value.set(newSettings.skyMidColor);
    if (newSettings.skyBotColor) state.skyUniforms.bot.value.set(newSettings.skyBotColor);
  }
}

export default {
  OceanDefaults,
  createOceanSystem,
  updateOcean,
  setOceanEnabled,
  updateOceanSettings
};

