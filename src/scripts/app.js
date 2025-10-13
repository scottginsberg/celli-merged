/**
 * Celli - Complete Application
 * Extracted from merged2.html and modularized
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

console.log('🔥 Celli App Module Loaded');

// Make THREE globally available
window.THREE = THREE;
window.EffectComposer = EffectComposer;
window.RenderPass = RenderPass;
window.UnrealBloomPass = UnrealBloomPass;

// Global animation variables
const clock = new THREE.Clock();
let running = false;
let totalTime = 0;

// DOM elements
const app = document.getElementById('app');
const quoteEl = document.getElementById('quote');
const quoteBefore = document.getElementById('quoteBefore');
const loomworksEl = document.getElementById('loomworks');
const loomPre = document.getElementById('loomPre');
const loomCore = document.getElementById('loomCore');
const loomPost = document.getElementById('loomPost');
const loomTail = document.getElementById('loomTail');

// Initialize renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.setClearColor(0x000000, 1);
app.appendChild(renderer.domElement);

// Initialize scene
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 10);
camera.position.set(0, 0, 2);
camera.lookAt(0, 0, 0);

// Black hole
const blackHoleGeo = new THREE.CircleGeometry(0.35, 64);
const blackHoleMat = new THREE.ShaderMaterial({
  uniforms: { time: { value: 0 }, pulseFactor: { value: 0.5 } },
  vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    varying vec2 vUv; uniform float time; uniform float pulseFactor;
    void main() {
      vec2 center = vec2(0.5);
      float dist = distance(vUv, center);
      float baseRadius = 0.08 + pulseFactor * 0.28;
      float pulse1 = 0.015 * sin(time * 3.5);
      float pulse2 = 0.008 * sin(time * 7.3 + 1.5);
      float radius = baseRadius + pulse1 + pulse2;
      float fadeDistance = radius * 1.6;
      float alpha = 1.0 - smoothstep(radius - fadeDistance, radius, dist);
      alpha = pow(alpha, 0.6) * 0.9;
      gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
    }
  `,
  transparent: true, depthWrite: false
});
const blackHole = new THREE.Mesh(blackHoleGeo, blackHoleMat);
blackHole.position.z = 0.1;
scene.add(blackHole);

// Spheres (cyan square, yellow triangle, magenta circle)
const R = 0.16;
const makeMat = (hex) => new THREE.MeshBasicMaterial({ 
  color: new THREE.Color(hex), 
  blending: THREE.AdditiveBlending, 
  transparent: true, 
  depthWrite: false 
});

const CYAN = 0x00a8ff, MAGENTA = 0xff1e6e, YELLOW = 0xffb62e;
const colors = [new THREE.Color(CYAN), new THREE.Color(YELLOW), new THREE.Color(MAGENTA)];

// Create shapes
const createRoundedSquare = (size, radius) => {
  const shape = new THREE.Shape();
  const r = radius, s = size / 2;
  shape.moveTo(-s + r, -s);
  shape.lineTo(s - r, -s);
  shape.quadraticCurveTo(s, -s, s, -s + r);
  shape.lineTo(s, s - r);
  shape.quadraticCurveTo(s, s, s - r, s);
  shape.lineTo(-s + r, s);
  shape.quadraticCurveTo(-s, s, -s, s - r);
  shape.lineTo(-s, -s + r);
  shape.quadraticCurveTo(-s, -s, -s + r, -s);
  return new THREE.ShapeGeometry(shape, 32);
};

const createRoundedTriangle = (size, radius) => {
  const shape = new THREE.Shape();
  const h = size * Math.sqrt(3) / 2;
  const top = { x: 0, y: h / 2 };
  const bl = { x: -size/2, y: -h / 2 };
  const br = { x: size/2, y: -h / 2 };
  const r = radius * 0.8;
  
  shape.moveTo(bl.x + r, bl.y);
  shape.lineTo(br.x - r, br.y);
  shape.quadraticCurveTo(br.x, br.y, br.x - r * 0.5, br.y + r * 0.866);
  shape.lineTo(top.x + r * 0.5, top.y - r * 0.866);
  shape.quadraticCurveTo(top.x, top.y, top.x - r * 0.5, top.y - r * 0.866);
  shape.lineTo(bl.x + r * 0.5, bl.y + r * 0.866);
  shape.quadraticCurveTo(bl.x, bl.y, bl.x + r, bl.y);
  
  return new THREE.ShapeGeometry(shape, 32);
};

const geoSquare = createRoundedSquare(R * 2, R * 0.3);
const geoTriangle = createRoundedTriangle(R * 2, R * 0.35);
const geoCircle = new THREE.CircleGeometry(R, 64);

const spheres = [
  new THREE.Mesh(geoSquare, makeMat(CYAN)),
  new THREE.Mesh(geoTriangle, makeMat(YELLOW)),
  new THREE.Mesh(geoCircle, makeMat(MAGENTA))
];
spheres.forEach((s, i) => { s.position.z = -i * 0.002; scene.add(s); });

// Voxel system for CELLI
const voxelSize = 0.05;
const voxelGeo = new THREE.BoxGeometry(voxelSize * 0.95, voxelSize * 0.95, voxelSize * 0.15);
const voxelMat = new THREE.MeshBasicMaterial({ color: 0x444444, transparent: true, opacity: 0, blending: THREE.NormalBlending });
const edgesGeo = new THREE.EdgesGeometry(voxelGeo);
const edgeMat = new THREE.LineBasicMaterial({ color: 0x888888, transparent: true, opacity: 0 });

const celliPatterns = {
  C: [[0,1,1,1,0], [1,0,0,0,0], [1,0,0,0,0], [1,0,0,0,0], [0,1,1,1,0]],
  E: [[1,1,1,1,1], [1,0,0,0,0], [1,1,1,1,0], [1,0,0,0,0], [1,1,1,1,1]],
  L: [[1,0,0,0,0], [1,0,0,0,0], [1,0,0,0,0], [1,0,0,0,0], [1,1,1,1,1]],
  I: [[1,1,1,1,1], [0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0], [1,1,1,1,1]]
};

const voxels = [];
const letters = ['C', 'E', 'L', 'L', 'I'];
const letterSpacing = 0.4;
const celliScale = 1.0;
const startX = -(letters.length * letterSpacing * celliScale) / 2 + (letterSpacing * celliScale) / 2;

letters.forEach((letter, letterIdx) => {
  const pattern = celliPatterns[letter];
  const letterX = startX + letterIdx * letterSpacing * celliScale;
  
  pattern.forEach((row, rowIdx) => {
    row.forEach((cell, colIdx) => {
      if (cell === 1) {
        const voxel = new THREE.Mesh(voxelGeo, voxelMat.clone());
        const edges = new THREE.LineSegments(edgesGeo, edgeMat.clone());
        voxel.add(edges);
        
        const x = letterX + (colIdx - 2) * voxelSize * 1.2 * celliScale;
        const y = (2 - rowIdx) * voxelSize * 1.2 * celliScale + 0.35;
        
        voxel.userData = {
          targetX: x,
          targetY: y,
          startY: y + 2.0 + Math.random() * 1.0,
          dropDelay: letterIdx * 0.15 + (rowIdx * colIdx) * 0.02,
          dropSpeed: 0.02 + Math.random() * 0.01,
          settled: false,
          edges: edges,
          gridX: letterIdx,
          gridY: rowIdx,
          gridCol: colIdx
        };
        
        voxel.position.set(x, voxel.userData.startY, 0);
        voxel.visible = false;
        scene.add(voxel);
        voxels.push(voxel);
      }
    });
  });
});

// Composer & post-processing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.7, 0.9, 0.2);
composer.addPass(bloomPass);

const afterimagePass = new AfterimagePass(0.96);
composer.addPass(afterimagePass);

const filmPass = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, time: { value: 0 }, noise: { value: 0.03 }, scanAmp: { value: 0.03 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader: `
    precision highp float; varying vec2 vUv; uniform sampler2D tDiffuse; uniform float time; uniform float noise; uniform float scanAmp;
    float rand(vec2 co){ return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453); }
    void main(){ vec3 col = texture2D(tDiffuse, vUv).rgb; float n = rand(vUv + fract(time)); float scan = sin((vUv.y + time*0.04)*3.14159*480.0) * scanAmp; col += n*noise; col += scan; col = pow(col, vec3(1.02)); gl_FragColor = vec4(col, 1.0); }`
});
composer.addPass(filmPass);

// Intro sequence config
const introCfg = {
  rollEnd: 2.5,
  bounceEnd: 4.5,
  triangleEnd: 7.5,
  transitionEnd: 9.5,
  normalEnd: 15.5,
  vennEnd: 18.0,
  collapseEnd: 22.0,
  glitchEnd: 24.5,
  blackoutEnd: 26.0,
  loomworksEnd: 30.0,
  celliEnd: 36.0,
  doorwayEnd: 44.0
};

// Animation loop
function animate() {
  if (!running) return;
  
  const dt = clock.getDelta();
  totalTime += dt;
  
  // Update black hole
  blackHoleMat.uniforms.time.value = totalTime;
  
  // Simple sphere rotation
  spheres.forEach((sphere, i) => {
    const offset = i * Math.PI * 2 / 3;
    const angle = totalTime * 0.5 + offset;
    const dist = 0.25;
    sphere.position.x = Math.cos(angle) * dist;
    sphere.position.y = Math.sin(angle) * dist;
  });
  
  // Update voxels - simple drop animation
  const celliTime = totalTime - introCfg.loomworksEnd;
  if (celliTime > 0) {
    voxels.forEach(voxel => {
      const data = voxel.userData;
      const localTime = celliTime - data.dropDelay;
      
      if (localTime > 0) {
        voxel.visible = true;
        
        if (!data.settled && voxel.position.y > data.targetY) {
          voxel.position.y -= data.dropSpeed;
          voxel.material.opacity = Math.min(0.8, voxel.material.opacity + 0.05);
          data.edges.material.opacity = Math.min(0.6, data.edges.material.opacity + 0.04);
        } else if (!data.settled) {
          voxel.position.y = data.targetY;
          data.settled = true;
        }
      }
    });
  }
  
  // Update film grain
  filmPass.uniforms.time.value = totalTime;
  
  // Render
  composer.render();
  
  requestAnimationFrame(animate);
}

// Resize handler
window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  camera.left = -w / h;
  camera.right = w / h;
  camera.updateProjectionMatrix();
  composer.setSize(w, h);
});

// Initialize - called when Play button is clicked
export function startApp() {
  console.log('🎮 Starting Celli App!');
  
  // Hide play overlay
  const playEl = document.getElementById('play');
  if (playEl) playEl.classList.add('hidden');
  
  // Show quote
  quoteEl.classList.add('visible');
  
  // Start animation
  running = true;
  clock.start();
  animate();
  
  // Show loomworks after delay
  setTimeout(() => {
    loomworksEl.classList.add('visible');
  }, 5000);
  
  console.log('✅ App started successfully');
}

export { scene, camera, renderer, composer, voxels, spheres };


