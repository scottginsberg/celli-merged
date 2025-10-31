import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const DEFAULT_OPTIONS = {
  gridSize: 16,
  spacing: 10, // Increased from 6 to 10 for more spread out grid
  startStage: 'intro'
};

const TIMELINE = {
  planeRevealEnd: 2.5,     // Initial plane fully visible
  glitchToModernStart: 2.8, // ASCII -> Modern glitch
  glitchToModernEnd: 3.2,
  depthExpandStart: 3.5,   // Layers begin expanding
  depthExpandEnd: 6,       // All layers expanded
  gridLinesStart: 6.2,     // Debug grid lines appear
  rotationStart: 6.5,      // Begin rotation immediately after grid complete
  dollyOutStart: 6.5,      // Dolly out while rotating
  dollyOutEnd: 9,
  dollyInStart: 9.5,       // Dolly back in
  dollyInEnd: 11,
  cubeGreenStart: 12,
  randomPopStart: 14,      // Random flat shapes start popping in
  glitchStart: 16,         // Glowing versions appear
  pyramidStart: 20,
  sphereStart: 24,
  blueCubeStart: 28,
  whiteCubeStart: 32,
  mergeStart: 36
};

const GREEK_LETTERS = [
  'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ',
  'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ',
  'φ', 'χ', 'ψ', 'ω'
];

const SHAPE_DEFINITIONS = {
  'cube-green': {
    geometry: () => new THREE.BoxGeometry(3.2, 3.2, 3.2),
    material: () => new THREE.MeshStandardMaterial({
      color: 0x3bff85,
      emissive: 0x0d3920,
      emissiveIntensity: 0.8,
      metalness: 0.35,
      roughness: 0.4
    }),
    targetScale: 1.05
  },
  'flat-cone': {
    geometry: () => new THREE.ConeGeometry(3.1, 5.1, 3, 1),
    material: () => new THREE.MeshToonMaterial({
      color: 0xffd447,
      emissive: 0x000000,
      emissiveIntensity: 0
    }),
    targetScale: 1.15
  },
  'flat-sphere': {
    geometry: () => new THREE.SphereGeometry(2.3, 24, 20),
    material: () => new THREE.MeshToonMaterial({
      color: 0xff355e,
      emissive: 0x000000,
      emissiveIntensity: 0
    }),
    targetScale: 0.92
  },
  'flat-cube': {
    geometry: () => new THREE.BoxGeometry(3.2, 3.2, 3.2),
    material: () => new THREE.MeshToonMaterial({
      color: 0x3a8dff,
      emissive: 0x000000,
      emissiveIntensity: 0
    }),
    targetScale: 1.08
  },
  'pyramid-yellow': {
    geometry: () => new THREE.ConeGeometry(3.1, 5.1, 3, 1),
    material: () => {
      const mat = new THREE.MeshToonMaterial({
        color: 0xffd447,
        emissive: 0x5a3100,
        emissiveIntensity: 0.75
      });
      mat.userData.needsOutline = true;
      return mat;
    },
    targetScale: 1.15
  },
  'cube-blue': {
    geometry: () => new RoundedBoxGeometry(3.2, 3.2, 3.2, 4, 0.4),
    material: () => new THREE.MeshStandardMaterial({
      color: 0x3a8dff,
      emissive: 0x0b1d4a,
      emissiveIntensity: 0.9,
      metalness: 0.4,
      roughness: 0.32
    }),
    targetScale: 1.08
  },
  'sphere-red': {
    geometry: () => new THREE.SphereGeometry(2.3, 24, 20),
    material: () => new THREE.MeshStandardMaterial({
      color: 0xff355e,
      emissive: 0x330211,
      emissiveIntensity: 1.1,
      metalness: 0.55,
      roughness: 0.28
    }),
    targetScale: 0.92
  },
  'cube-white': {
    geometry: () => new THREE.BoxGeometry(3.4, 3.4, 3.4),
    material: () => new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xaab4ff,
      emissiveIntensity: 0.6,
      metalness: 0.25,
      roughness: 0.18
    }),
    targetScale: 0.95
  }
};

const GLITCH_PALETTE = [0xff335f, 0x2f8bff, 0x2cff86];
const CONNECTOR_COLORS = [
  new THREE.Color(0xff335f),
  new THREE.Color(0x2f8bff),
  new THREE.Color(0x2cff86),
  new THREE.Color(0xfff066)
];

const ORIGIN = new THREE.Vector3(0, 0, 0);

// Texture cache to avoid recreating identical textures
const textureCache = new Map();

function createAddressTexture(col, row, depth, style = 'modern') {
  const cacheKey = `${col}-${row}-${depth}-${style}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey);
  }

  const canvas = document.createElement('canvas');
  canvas.width = 32; // Reduced from 64 for faster pre-warming
  canvas.height = 32;
  const ctx = canvas.getContext('2d', { willReadFrequently: false, alpha: true });

  const baseLabel = `${String.fromCharCode(65 + col)}${row + 1}`;
  const greekIndex = depth % GREEK_LETTERS.length;
  const suffix = depth > 0 ? `·${GREEK_LETTERS[greekIndex]}` : '';
  const label = `${baseLabel}${suffix}`;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (style === 'ascii') {
    // Pure ASCII: monospace, no glow, simple
    ctx.font = '12px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = depth === 0 ? '#00ff00' : '#00ffff';
    ctx.fillText(label, canvas.width / 2, canvas.height / 2);
  } else {
    // Modern: glow, stroke, Roboto Mono
    ctx.font = 'bold 14px "Roboto Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillStyle = depth === 0 ? '#00ffc3' : '#8ab4ff';
    ctx.strokeText(label, canvas.width / 2, canvas.height / 2);
    ctx.fillText(label, canvas.width / 2, canvas.height / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

function createAddressSprite(col, row, depth, position, style = 'ascii') {
  const texture = createAddressTexture(col, row, depth, style);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
    depthTest: true,
    depthWrite: false
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(6, 6, 1);
  sprite.position.copy(position);
  sprite.userData = { 
    type: 'address', 
    col, 
    row, 
    depth,
    style,
    basePosition: position.clone()
  };
  sprite.frustumCulled = false;
  return sprite;
}

// Geometry pool - create once, reuse
const geometryPool = {};

function getPooledGeometry(stageKey) {
  if (!geometryPool[stageKey]) {
    const definition = SHAPE_DEFINITIONS[stageKey];
    geometryPool[stageKey] = definition.geometry();
  }
  return geometryPool[stageKey];
}

function createMeshForStage(stageKey, position, index) {
  const definition = SHAPE_DEFINITIONS[stageKey];
  const geometry = getPooledGeometry(stageKey); // Reuse geometry
  const material = definition.material();
  material.userData = {
    originalColor: material.color.clone(),
    originalEmissive: material.emissive.clone()
  };

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  mesh.scale.setScalar(0.01);
  mesh.userData = {
    type: stageKey,
    basePosition: position.clone(),
    targetScale: definition.targetScale,
    spawnTime: performance.now(),
    index
  };

  // Add outline for pyramids
  if (material.userData.needsOutline) {
    const outlineMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      side: THREE.BackSide
    });
    const outline = new THREE.Mesh(geometry, outlineMaterial);
    outline.scale.setScalar(1.08);
    mesh.add(outline);
    mesh.userData.outline = outline;
  }

  return mesh;
}

function createConnectorNetwork(meshes) {
  const pairs = [];
  const maxConnections = Math.min(meshes.length * 0.5, 240);
  for (let i = 0; i < maxConnections; i++) {
    const aIndex = Math.floor(Math.random() * meshes.length);
    let bIndex = Math.floor(Math.random() * meshes.length);
    if (aIndex === bIndex) {
      bIndex = (bIndex + 1) % meshes.length;
    }
    pairs.push([aIndex, bIndex]);
  }

  // Create curved neural links with multiple segments per connection
  const segmentsPerLink = 7; // Segments between each pair (creates 8 vertices)
  const totalSegments = pairs.length * segmentsPerLink;
  const positions = new Float32Array(totalSegments * 6); // 2 vertices per segment
  const colors = new Float32Array(totalSegments * 6);
  
  const redColor = new THREE.Color(0xff335f);
  
  // Initialize all colors to red
  for (let i = 0; i < colors.length; i += 3) {
    colors[i] = redColor.r;
    colors[i + 1] = redColor.g;
    colors[i + 2] = redColor.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.LineBasicMaterial({
    color: 0xff335f,
    transparent: true,
    opacity: 0.0,
    linewidth: 1
  });

  const lines = new THREE.LineSegments(geometry, material);
  lines.userData = { pairs, segmentsPerLink };
  return lines;
}

function createNeighborConnections(meshes, gridSize, spacing) {
  // Connect each mesh to its 6 immediate neighbors (±X, ±Y, ±Z)
  const positions = [];
  const half = (gridSize - 1) / 2;
  
  meshes.forEach((mesh, idx) => {
    const basePos = mesh.userData.basePosition;
    
    // Check 6 neighbors
    const neighbors = [
      new THREE.Vector3(basePos.x + spacing, basePos.y, basePos.z),
      new THREE.Vector3(basePos.x - spacing, basePos.y, basePos.z),
      new THREE.Vector3(basePos.x, basePos.y + spacing, basePos.z),
      new THREE.Vector3(basePos.x, basePos.y - spacing, basePos.z),
      new THREE.Vector3(basePos.x, basePos.y, basePos.z + spacing),
      new THREE.Vector3(basePos.x, basePos.y, basePos.z - spacing)
    ];
    
    neighbors.forEach(neighborPos => {
      const neighborMesh = meshes.find(m => 
        m.userData.basePosition.distanceTo(neighborPos) < 0.1
      );
      if (neighborMesh && neighborMesh.userData.index > idx) {
        positions.push(basePos.x, basePos.y, basePos.z);
        positions.push(neighborPos.x, neighborPos.y, neighborPos.z);
      }
    });
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  const material = new THREE.LineBasicMaterial({
    color: 0x3a8dff,
    transparent: true,
    opacity: 0
  });

  const lines = new THREE.LineSegments(geometry, material);
  lines.userData = { type: 'neighbor-grid' };
  return lines;
}

function lerpVector(target, dest, factor) {
  target.x = THREE.MathUtils.lerp(target.x, dest.x, factor);
  target.y = THREE.MathUtils.lerp(target.y, dest.y, factor);
  target.z = THREE.MathUtils.lerp(target.z, dest.z, factor);
}

export function initTheosSequence(options = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const { gridSize, spacing, startStage } = settings;

  const container = settings.container || document.body;
  container.classList.add('theos-sequence-root');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.FogExp2(0x000000, 0.006);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 0, -150);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 1);
  
  // Ensure canvas has proper styles
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  
  container.appendChild(renderer.domElement);

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.8,  // Reduced from 1.35 for performance
    0.6,  // Reduced radius from 0.92
    0.25  // Slightly higher threshold
  );
  composer.addPass(bloomPass);

  const ambientLight = new THREE.AmbientLight(0x4a5dd1, 0.75);
  scene.add(ambientLight);

  const keyLight = new THREE.PointLight(0x7efce2, 1.8, 640, 2);
  keyLight.position.set(90, 80, -40);
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0x3b7bff, 1.45, 540, 2.2);
  fillLight.position.set(-90, -50, -30);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xfff4d6, 0.65);
  rimLight.position.set(-30, 120, 80);
  scene.add(rimLight);

  const gridPositions = [];
  const half = (gridSize - 1) / 2;
  for (let depth = 0; depth < gridSize; depth++) {
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const x = (col - half) * spacing;
        const y = (row - half) * spacing;
        const z = (depth - half) * spacing;
        gridPositions.push({ col, row, depth, position: new THREE.Vector3(x, y, z) });
      }
    }
  }

  // Fisher-Yates shuffle for semi-random spawn order
  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const planeDepth = Math.floor(gridSize / 2);
  const planePositions = shuffleArray(gridPositions.filter((pos) => pos.depth === planeDepth));
  
  // Group depth positions by layer for efficient rendering
  const depthLayers = [];
  for (let d = 0; d < gridSize; d++) {
    if (d === planeDepth) continue; // Skip the initial plane
    const layerPositions = gridPositions.filter((pos) => pos.depth === d);
    depthLayers.push({ depth: d, positions: layerPositions });
  }

  const state = {
    planeIndex: 0,
    depthLayerIndex: 0,
    currentLayerSprites: [],
    addresses: [],
    shapes: [],
    connectors: null,
    connectorPairs: [],
    neighborConnections: null,
    neighborConnectionsPrewarmed: false,
    gridLines: null,
    gridLinesSpawned: false,
    currentShape: 'addresses',
    sequenceTime: 0,
    sequenceStarted: startStage === 'blackhole', // Gate timeline progression
    isGlitching: false,
    randomPopActive: false,
    finalCollapse: false,
    finalCollapseStartTime: 0,
    finalCube: null,
    stageFlags: {
      cubes: false,
      pyramids: false,
      blueCubes: false,
      spheres: false,
      whiteCubes: false,
      randomPop: false
    },
    merging: false,
    mergeProgress: 0,
    cameraTarget: camera.position.clone(),
    cameraLook: new THREE.Vector3(0, 0, 0),
    skipAhead: startStage === 'blackhole'
  };

  const clock = new THREE.Clock();

  // Pre-create all sprites at init (hidden)
  function prewarmAllSprites() {
    console.log('[THEOS] Pre-warming sprites...');
    
    // Create plane sprites (ASCII style)
    planePositions.forEach(pos => {
      const sprite = createAddressSprite(pos.col, pos.row, 0, pos.position, 'ascii');
      sprite.material.opacity = 0;
      sprite.visible = false; // Hidden until revealed
      scene.add(sprite);
      state.addresses.push(sprite);
    });
    
    // Build lookup immediately
    buildPlaneSpriteLookup();
    
    console.log('[THEOS] Pre-warmed', state.addresses.length, 'plane sprites');
  }

  function spawnPlaneAddresses(delta) {
    if (state.planeIndex >= planePositions.length) {
      return;
    }
    
    // Reveal in chunks (they're already created, just show them)
    const rate = Math.ceil((planePositions.length / 2.5) * delta);
    const chunkSize = Math.min(12, Math.max(1, rate)); // Faster chunks
    
    for (let i = 0; i < chunkSize && state.planeIndex < planePositions.length; i++) {
      const sprite = state.addresses[state.planeIndex++];
      sprite.visible = true; // Just toggle visibility (very cheap)
    }
  }

  // Pre-create lookup map for fast plane sprite access
  const planeSpriteLookup = new Map();
  
  function buildPlaneSpriteLookup() {
    state.addresses.forEach(sprite => {
      if (sprite.userData.depth === 0) {
        const key = `${sprite.userData.col}-${sprite.userData.row}`;
        planeSpriteLookup.set(key, sprite);
      }
    });
  }

  function prewarmDepthLayers() {
    console.log('[THEOS] Pre-warming depth layers...');
    
    depthLayers.forEach((layer, layerIdx) => {
      layer.positions.forEach(pos => {
        const key = `${pos.col}-${pos.row}`;
        const baseSprite = planeSpriteLookup.get(key);
        
        if (baseSprite) {
          const sprite = new THREE.Sprite(baseSprite.material.clone());
          sprite.scale.copy(baseSprite.scale);
          sprite.position.copy(pos.position);
          sprite.userData = { 
            type: 'address', 
            col: pos.col, 
            row: pos.row, 
            depth: pos.depth,
            style: 'modern',
            basePosition: pos.position.clone(),
            layerIndex: layerIdx
          };
          sprite.material.map = createAddressTexture(pos.col, pos.row, pos.depth, 'modern');
          sprite.material.opacity = 0;
          sprite.visible = false; // Hidden until layer is revealed
          sprite.frustumCulled = false;
          scene.add(sprite);
          state.addresses.push(sprite);
        }
      });
    });
    
    console.log('[THEOS] Pre-warmed', depthLayers.length, 'depth layers');
  }

  function spawnDepthLayerByLayer(delta) {
    const t = state.sequenceTime;
    
    // Wait for initial plane to be fully revealed
    if (t < TIMELINE.depthExpandStart) return;
    if (state.depthLayerIndex >= depthLayers.length) return;
    
    // Calculate which layers should be visible now
    const expandDuration = TIMELINE.depthExpandEnd - TIMELINE.depthExpandStart;
    const elapsed = t - TIMELINE.depthExpandStart;
    const targetLayerIndex = Math.min(
      depthLayers.length - 1,
      Math.floor((elapsed / expandDuration) * depthLayers.length)
    );
    
    // Reveal layers up to targetLayerIndex (just toggle visibility)
    while (state.depthLayerIndex <= targetLayerIndex && state.depthLayerIndex < depthLayers.length) {
      const layerIdx = state.depthLayerIndex;
      
      // Find all sprites for this layer and reveal them
      state.addresses.forEach(sprite => {
        if (sprite.userData.layerIndex === layerIdx && !sprite.visible) {
          sprite.visible = true;
        }
      });
      
      state.depthLayerIndex++;
      if (state.depthLayerIndex === 1 || state.depthLayerIndex === depthLayers.length) {
        console.log(`[THEOS] Layer ${state.depthLayerIndex}/${depthLayers.length} revealed`);
      }
    }
  }

  function revealAddresses(delta) {
    const fadeSpeed = 3.0; // Faster fade for snappier appearance
    const t = state.sequenceTime;
    const isGlitchActive = t >= TIMELINE.glitchToModernStart && t < TIMELINE.glitchToModernEnd;
    
    // OPTIMIZATION: Only update visible sprites
    for (let i = 0; i < state.addresses.length; i++) {
      const sprite = state.addresses[i];
      
      // Skip if not visible yet
      if (!sprite.visible) continue;
      
      // Skip fully opaque sprites unless glitching
      if (sprite.material.opacity >= 1 && sprite.userData.style !== 'ascii') continue;
      
      // Fade in visible sprites
      sprite.material.opacity = Math.min(1, sprite.material.opacity + fadeSpeed * delta);
      
      // Plane sprites: ASCII glitch transition
      if (sprite.userData.depth === 0 && sprite.userData.style === 'ascii') {
        if (isGlitchActive && Math.random() < 0.2) {
          const jitter = 1.5;
          sprite.position.set(
            sprite.userData.basePosition.x + (Math.random() - 0.5) * jitter,
            sprite.userData.basePosition.y + (Math.random() - 0.5) * jitter,
            sprite.userData.basePosition.z
          );
        } else if (t >= TIMELINE.glitchToModernEnd) {
          sprite.userData.style = 'modern';
          sprite.material.map = createAddressTexture(sprite.userData.col, sprite.userData.row, 0, 'modern');
          sprite.material.needsUpdate = true;
          sprite.position.copy(sprite.userData.basePosition);
        }
      }
    }
  }

  function createDebugGridLines() {
    const positions = [];
    const colors = [];
    const gridColor = new THREE.Color(0x00ffc3);
    const gridRange = (gridSize - 1) * spacing / 2;
    
    // XY grid lines
    for (let i = 0; i < gridSize; i++) {
      const offset = (i - (gridSize - 1) / 2) * spacing;
      // Horizontal lines (along X)
      positions.push(-gridRange, offset, 0, gridRange, offset, 0);
      colors.push(gridColor.r, gridColor.g, gridColor.b, gridColor.r, gridColor.g, gridColor.b);
      // Vertical lines (along Y)
      positions.push(offset, -gridRange, 0, offset, gridRange, 0);
      colors.push(gridColor.r, gridColor.g, gridColor.b, gridColor.r, gridColor.g, gridColor.b);
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0
    });
    
    const lines = new THREE.LineSegments(geometry, material);
    return lines;
  }

  function spawnGridLines(delta) {
    const t = state.sequenceTime;
    
    if (!state.gridLinesSpawned && t >= TIMELINE.gridLinesStart) {
      state.gridLines = createDebugGridLines();
      scene.add(state.gridLines);
      state.gridLinesSpawned = true;
      console.log('[THEOS] Debug grid lines spawned');
    }
    
    if (state.gridLines) {
      // Glitch in the grid lines
      const targetOpacity = t < TIMELINE.cubeGreenStart ? 0.35 : 0;
      state.gridLines.material.opacity = THREE.MathUtils.lerp(
        state.gridLines.material.opacity,
        targetOpacity,
        0.08
      );
    }
  }

  function clearAddresses() {
    state.addresses.forEach((sprite) => scene.remove(sprite));
    state.addresses = [];
    
    if (state.gridLines) {
      scene.remove(state.gridLines);
      state.gridLines.geometry.dispose();
      state.gridLines.material.dispose();
      state.gridLines = null;
      state.gridLinesSpawned = false;
    }
  }

  function instantiateShapes(stageKey) {
    console.log(`[THEOS] Transforming to ${stageKey}...`);
    clearAddresses();
    
    // OPTIMIZATION: Reuse existing meshes, just swap geometry/material
    if (state.shapes.length > 0) {
      const definition = SHAPE_DEFINITIONS[stageKey];
      const geometry = getPooledGeometry(stageKey);
      
      state.shapes.forEach((mesh) => {
        // Dispose old material only (geometry is pooled)
        if (mesh.geometry !== geometry) {
          // Only dispose if not pooled
          const wasPooled = Object.values(geometryPool).includes(mesh.geometry);
          if (!wasPooled) mesh.geometry.dispose();
        }
        mesh.material.dispose();
        
        // Swap to new geometry and material
        mesh.geometry = geometry;
        mesh.material = definition.material();
        mesh.material.userData = {
          originalColor: mesh.material.color.clone(),
          originalEmissive: mesh.material.emissive.clone()
        };
        mesh.scale.setScalar(0.01); // Reset scale for new shape
        mesh.userData.type = stageKey;
        mesh.userData.targetScale = definition.targetScale;
        mesh.userData.spawnTime = state.sequenceTime;
      });
    } else {
      // First time: create all meshes
      gridPositions.forEach((pos, index) => {
        const mesh = createMeshForStage(stageKey, pos.position, index);
        mesh.userData.spawnTime = state.sequenceTime;
        state.shapes.push(mesh);
        scene.add(mesh);
      });
    }
    
    state.currentShape = stageKey;
  }

  function prewarmNeighborConnections() {
    // Pre-create neighbor connections during green cube phase to avoid lag
    if (!state.neighborConnectionsPrewarmed && state.shapes.length > 0) {
      console.log('[THEOS] Pre-warming neighbor connections...');
      const neighborGrid = createNeighborConnections(state.shapes, gridSize, spacing);
      neighborGrid.visible = false; // Hidden until blue cube phase
      scene.add(neighborGrid);
      state.neighborConnections = neighborGrid;
      state.neighborConnectionsPrewarmed = true;
      console.log('[THEOS] Neighbor connections pre-warmed');
    }
  }

  function ensureConnectors() {
    // Red sphere neural network
    if (!state.connectors && state.currentShape === 'sphere-red') {
      const network = createConnectorNetwork(state.shapes);
      if (network && network.userData) {
        state.connectors = network;
        state.connectorPairs = network.userData.pairs || [];
        scene.add(network);
        console.log('[THEOS] Neural network created (red spheres):', state.connectorPairs.length, 'connections');
      }
    }
    
    // Blue cube neighbor grid - just make visible (already pre-created)
    if (state.neighborConnections && state.currentShape === 'cube-blue') {
      state.neighborConnections.visible = true;
    }
  }

  // Connector update throttling
  let connectorUpdateAccum = 0;
  const CONNECTOR_UPDATE_INTERVAL = 1/20; // Update connectors 20fps
  
  function updateConnectors(delta) {
    const t = state.sequenceTime;
    
    // Update red sphere neural connectors
    if (state.connectors) {
      // Update opacity
      if (state.currentShape === 'sphere-red') {
        state.connectors.material.opacity = THREE.MathUtils.lerp(
          state.connectors.material.opacity,
          0.72,
          0.05
        );
      } else {
        state.connectors.material.opacity = THREE.MathUtils.lerp(
          state.connectors.material.opacity,
          0,
          0.1
        );
        if (state.connectors.material.opacity < 0.04) {
          scene.remove(state.connectors);
          state.connectors.geometry.dispose();
          state.connectors.material.dispose();
          state.connectors = null;
          state.connectorPairs = [];
        }
      }
      
      // Update curved neural link positions (throttled)
      connectorUpdateAccum += delta;
      if (connectorUpdateAccum >= CONNECTOR_UPDATE_INTERVAL && state.currentShape === 'sphere-red' && state.connectorPairs) {
        connectorUpdateAccum = 0;
        
        const connectorPairs = state.connectorPairs;
        const segmentsPerLink = state.connectors.userData?.segmentsPerLink || 7;
        
        if (!Array.isArray(connectorPairs) || connectorPairs.length === 0) {
          console.warn('[THEOS] connectorPairs not valid:', connectorPairs);
          return;
        }
        
        const positions = state.connectors.geometry.attributes.position.array;
        
        for (let idx = 0; idx < connectorPairs.length; idx++) {
          const pair = connectorPairs[idx];
          const meshA = state.shapes[pair[0]];
          const meshB = state.shapes[pair[1]];
          if (!meshA || !meshB) continue;
          
          const start = meshA.position;
          const end = meshB.position;
          
          // Create organic curved path with line segments
          for (let seg = 0; seg < segmentsPerLink - 1; seg++) {
            const u1 = seg / (segmentsPerLink - 1);
            const u2 = (seg + 1) / (segmentsPerLink - 1);
            
            // Quadratic bezier with animated control point
            const wavePhase = t * 2 + idx * 0.5;
            const waveAmt = Math.sin(wavePhase) * 3 + Math.cos(wavePhase * 1.3) * 2;
            const midX = (start.x + end.x) / 2 + waveAmt;
            const midY = (start.y + end.y) / 2 + Math.sin(wavePhase * 0.8) * 2;
            const midZ = (start.z + end.z) / 2 + Math.cos(wavePhase * 1.1) * 2.5;
            
            // Point 1
            const t1_1 = 1 - u1;
            const x1 = t1_1 * t1_1 * start.x + 2 * t1_1 * u1 * midX + u1 * u1 * end.x;
            const y1 = t1_1 * t1_1 * start.y + 2 * t1_1 * u1 * midY + u1 * u1 * end.y;
            const z1 = t1_1 * t1_1 * start.z + 2 * t1_1 * u1 * midZ + u1 * u1 * end.z;
            
            // Point 2
            const t1_2 = 1 - u2;
            const x2 = t1_2 * t1_2 * start.x + 2 * t1_2 * u2 * midX + u2 * u2 * end.x;
            const y2 = t1_2 * t1_2 * start.y + 2 * t1_2 * u2 * midY + u2 * u2 * end.y;
            const z2 = t1_2 * t1_2 * start.z + 2 * t1_2 * u2 * midZ + u2 * u2 * end.z;
            
            const offset = (idx * (segmentsPerLink - 1) + seg) * 6;
            positions[offset] = x1;
            positions[offset + 1] = y1;
            positions[offset + 2] = z1;
            positions[offset + 3] = x2;
            positions[offset + 4] = y2;
            positions[offset + 5] = z2;
          }
        }
        state.connectors.geometry.attributes.position.needsUpdate = true;
      }
    }
    
    // Update blue cube neighbor connections
    if (state.neighborConnections) {
      const targetOpacity = state.currentShape === 'cube-blue' ? 0.4 : 0;
      state.neighborConnections.material.opacity = THREE.MathUtils.lerp(
        state.neighborConnections.material.opacity,
        targetOpacity,
        0.08
      );
      
      if (state.neighborConnections.material.opacity < 0.02 && state.currentShape !== 'cube-blue') {
        scene.remove(state.neighborConnections);
        state.neighborConnections.geometry.dispose();
        state.neighborConnections.material.dispose();
        state.neighborConnections = null;
      }
    }
  }

  function applyShapeBehaviours(delta) {
    if (state.shapes.length === 0) {
      return;
    }

    const isSphereStage = state.currentShape === 'sphere-red';
    const isWhiteStage = state.currentShape === 'cube-white';
    const isPyramidStage = state.currentShape === 'pyramid-yellow';
    const isCubeStage = state.currentShape.startsWith('cube');
    const t = state.sequenceTime;

    const scratchScale = new THREE.Vector3();

    state.shapes.forEach((mesh, idx) => {
      const baseColor = mesh.material.userData?.originalColor;
      const baseEmissive = mesh.material.userData?.originalEmissive;

      // Final collapse: hide all individual cubes
      if (state.finalCollapse) {
        const collapseProgress = Math.min(1, (state.sequenceTime - state.finalCollapseStartTime) / 2);
        mesh.scale.lerp(scratchScale.setScalar(0.01), 0.3);
        mesh.material.opacity = 1 - collapseProgress;
        if (!mesh.material.transparent) {
          mesh.material.transparent = true;
          mesh.material.needsUpdate = true;
        }
        return;
      }
      
      // Transition flat shapes to glowing versions at glitch time
      if (state.isGlitching && mesh.userData.type && mesh.userData.type.startsWith('flat-')) {
        const glowIntensity = (t - TIMELINE.glitchStart) / (TIMELINE.pyramidStart - TIMELINE.glitchStart);
        const targetIntensity = THREE.MathUtils.lerp(0, 0.8, glowIntensity);
        
        if (mesh.userData.type === 'flat-cone') {
          mesh.material.emissive.setHex(0x5a3100);
          mesh.material.emissiveIntensity = targetIntensity;
        } else if (mesh.userData.type === 'flat-sphere') {
          mesh.material.emissive.setHex(0x330211);
          mesh.material.emissiveIntensity = targetIntensity;
        } else if (mesh.userData.type === 'flat-cube') {
          mesh.material.emissive.setHex(0x0b1d4a);
          mesh.material.emissiveIntensity = targetIntensity;
        }
      }

      // Glitch effect on remaining green cubes (not popped)
      if (state.isGlitching && mesh.userData.type === 'cube-green' && !mesh.userData.popped) {
        const paletteIndex = (idx + Math.floor(state.sequenceTime * 10)) % GLITCH_PALETTE.length;
        const targetColor = new THREE.Color(GLITCH_PALETTE[paletteIndex]);
        mesh.material.color.lerp(targetColor, 0.6);
        mesh.material.emissive.lerp(targetColor, 0.25);
        mesh.position.set(
          mesh.userData.basePosition.x + Math.sin(state.sequenceTime * 35 + idx) * 0.6,
          mesh.userData.basePosition.y + Math.cos(state.sequenceTime * 38 + idx * 0.6) * 0.6,
          mesh.userData.basePosition.z + Math.sin(state.sequenceTime * 42 + idx * 0.3) * 0.6
        );
      } else {
        if (baseColor) {
          mesh.material.color.lerp(baseColor, 0.08);
        }
        if (baseEmissive) {
          mesh.material.emissive.lerp(baseEmissive, 0.08);
        }
        mesh.position.lerp(mesh.userData.basePosition, 0.12);
      }

      if (isCubeStage || mesh.userData.type === 'flat-cube') {
        const baseSpeed = state.currentShape === 'cube-white' ? 0.12 : 0.28;
        mesh.rotation.x += delta * baseSpeed;
        mesh.rotation.y += delta * baseSpeed * 0.78;
      }

      if (isPyramidStage || mesh.userData.type === 'flat-cone') {
        mesh.rotation.y += delta * 0.65;
        mesh.rotation.z += delta * 0.12;
      }

      if (isSphereStage || mesh.userData.type === 'flat-sphere') {
        const pulse = mesh.userData.targetScale * (1 + Math.sin(state.sequenceTime * 3 + idx * 0.18) * 0.1);
        mesh.scale.lerp(scratchScale.setScalar(pulse), 0.2);
        mesh.rotation.y += delta * 0.15;
      } else if (!isSphereStage && mesh.userData.type !== 'flat-sphere') {
        const desired = mesh.userData.targetScale || 1;
        mesh.scale.lerp(scratchScale.setScalar(desired), 0.16);
      }

      if (isWhiteStage && state.merging) {
        const mergeIntensity = 0.08 + state.mergeProgress * 0.3;
        mesh.position.lerp(ORIGIN, mergeIntensity * delta * 60);
        mesh.userData.targetScale = 0.95 + state.mergeProgress * 0.6;
        const glow = 0.6 + state.mergeProgress * 1.2;
        mesh.material.emissiveIntensity = THREE.MathUtils.lerp(mesh.material.emissiveIntensity, glow, 0.1);
      }
    });
  }
  
  function updateFinalCube(delta) {
    if (!state.finalCube) return;
    
    const scratchScale = new THREE.Vector3();
    const elapsed = state.sequenceTime - state.finalCollapseStartTime;
    const progress = Math.min(1, elapsed / 3);
    const eased = THREE.MathUtils.smootherstep(progress, 0, 1);
    
    // Grow and intensify glow
    const targetScale = 8 + eased * 12;
    state.finalCube.scale.lerp(scratchScale.setScalar(targetScale), 0.15);
    
    // Increase emissive intensity
    const glowIntensity = 2.0 + eased * 4.0;
    state.finalCube.material.emissiveIntensity = glowIntensity;
    
    // Pulse brightness
    state.finalCube.material.emissive.setRGB(
      1.0,
      1.0 - eased * 0.3,
      1.0 - eased * 0.5
    );
    
    // Rotate slowly
    state.finalCube.rotation.x += delta * 0.15;
    state.finalCube.rotation.y += delta * 0.2;
  }
  
  function triggerFinalCollapse() {
    if (state.finalCollapse) return;
    
    console.log('[THEOS] Final collapse initiated - redirecting to fullhand');
    state.finalCollapse = true;
    state.finalCollapseStartTime = state.sequenceTime;
    
    // Create the final glitchy white cube at origin
    const finalGeometry = new RoundedBoxGeometry(1, 1, 1, 6, 0.3);
    const finalMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 2.0,
      metalness: 0.2,
      roughness: 0.1,
      transparent: false
    });
    
    state.finalCube = new THREE.Mesh(finalGeometry, finalMaterial);
    state.finalCube.position.set(0, 0, 0);
    state.finalCube.scale.setScalar(0.1);
    scene.add(state.finalCube);
    
    console.log('[THEOS] Final cube created - starting transition sequence');
    
    // Start transition sequence after cube forms
    setTimeout(() => {
      startFullhandTransition();
    }, 3000);
  }
  
  function startFullhandTransition() {
    console.log('[THEOS] Starting fullhand transition sequence');
    
    // Hide all existing elements
    state.shapes.forEach(mesh => {
      scene.remove(mesh);
    });
    
    // Create glitchy cube to square transition
    const transitionState = {
      phase: 'glitchyCube', // glitchyCube -> flatten -> sputterReveal -> expandCollapse -> spawnCelli
      glitchIntensity: 0,
      flattenProgress: 0,
      sputterLights: [],
      gridSquares: [],
      gridSize: 1,
      gridPhase: 0, // 1x1 -> 2x2 -> 3x3 -> 4x4 -> 5x5 -> 6x6
      startTime: performance.now()
    };
    
    state.transitionState = transitionState;
  }
  
  function updateTransitionSequence(delta) {
    if (!state.transitionState) return;
    
    const ts = state.transitionState;
    const elapsed = (performance.now() - ts.startTime) / 1000;
    
    if (ts.phase === 'glitchyCube') {
      // Glitchy cube phase (2 seconds)
      if (elapsed < 2) {
        ts.glitchIntensity = Math.min(1, elapsed / 2);
        
        if (state.finalCube) {
          // Glitchy jitter
          const jitter = ts.glitchIntensity * 2;
          state.finalCube.position.set(
            (Math.random() - 0.5) * jitter,
            (Math.random() - 0.5) * jitter,
            (Math.random() - 0.5) * jitter
          );
          
          // Random color glitches
          if (Math.random() < 0.3) {
            const colors = [0xffffff, 0xff00ff, 0x00ffff, 0xffff00];
            state.finalCube.material.emissive.setHex(colors[Math.floor(Math.random() * colors.length)]);
          }
        }
      } else {
        // Move to flatten phase
        ts.phase = 'flatten';
        ts.startTime = performance.now();
        console.log('[THEOS] Transition: flatten phase');
      }
    } else if (ts.phase === 'flatten') {
      // Flatten cube into single square (1 second)
      if (elapsed < 1) {
        ts.flattenProgress = elapsed / 1;
        
        if (state.finalCube) {
          // Stop glitching, return to center
          state.finalCube.position.set(0, 0, 0);
          state.finalCube.material.emissive.setHex(0xffffff);
          
          // Flatten Z scale
          const scaleZ = THREE.MathUtils.lerp(1, 0.05, ts.flattenProgress);
          state.finalCube.scale.set(
            state.finalCube.scale.x,
            state.finalCube.scale.y,
            state.finalCube.scale.x * scaleZ
          );
        }
      } else {
        // Convert cube to single square
        if (state.finalCube) {
          scene.remove(state.finalCube);
        }
        
        // Create single flat square
        const squareGeo = new THREE.PlaneGeometry(10, 10);
        const squareMat = new THREE.MeshStandardMaterial({
          color: 0x000000,
          emissive: 0x000000,
          emissiveIntensity: 0,
          side: THREE.DoubleSide
        });
        const square = new THREE.Mesh(squareGeo, squareMat);
        square.position.set(0, 0, 0);
        scene.add(square);
        ts.gridSquares = [square];
        
        // Move to sputter reveal phase
        ts.phase = 'sputterReveal';
        ts.startTime = performance.now();
        console.log('[THEOS] Transition: sputter reveal phase');
      }
    } else if (ts.phase === 'sputterReveal') {
      // Sputtering lights revealing the monitor (2 seconds)
      if (elapsed < 2) {
        const sputterProgress = elapsed / 2;
        
        // Random sputtering effect on square
        if (ts.gridSquares[0]) {
          if (Math.random() < 0.4) {
            const brightness = Math.random();
            ts.gridSquares[0].material.emissiveIntensity = brightness * 0.3;
          } else {
            ts.gridSquares[0].material.emissiveIntensity = 0;
          }
        }
        
        // Gradually increase average brightness
        if (elapsed > 1 && ts.gridSquares[0]) {
          const avgBrightness = (elapsed - 1) * 0.3;
          ts.gridSquares[0].material.emissive.setHex(0xffffff);
          ts.gridSquares[0].material.emissiveIntensity = Math.max(
            ts.gridSquares[0].material.emissiveIntensity,
            avgBrightness
          );
        }
      } else {
        // Monitor revealed, move to expand/collapse grid phase
        ts.phase = 'expandCollapse';
        ts.gridPhase = 0; // Start with 2x2
        ts.startTime = performance.now();
        console.log('[THEOS] Transition: expand/collapse grid phase');
      }
    } else if (ts.phase === 'expandCollapse') {
      // Grid expansion/collapse sequence: 2x2, 3x3, 4x4, 5x5, 6x6
      const gridSizes = [2, 3, 4, 5, 6];
      const phaseTime = 0.8; // 0.8 seconds per grid size
      
      if (ts.gridPhase < gridSizes.length) {
        const phaseElapsed = elapsed % phaseTime;
        const expandProgress = Math.min(1, phaseElapsed / (phaseTime * 0.5));
        const collapseProgress = Math.max(0, (phaseElapsed - phaseTime * 0.5) / (phaseTime * 0.5));
        
        // Check if we need to create new grid
        if (phaseElapsed < 0.05 || ts.gridSquares.length === 0 || ts.gridSquares[0].userData.gridSize !== gridSizes[ts.gridPhase]) {
          // Remove old grid
          ts.gridSquares.forEach(sq => {
            scene.remove(sq);
            sq.geometry.dispose();
            sq.material.dispose();
          });
          ts.gridSquares = [];
          
          // Create new grid
          const gridSize = gridSizes[ts.gridPhase];
          const squareSize = 10 / gridSize * 0.85; // Slightly smaller to show gaps
          const startOffset = -(gridSize - 1) * squareSize / 2;
          
          for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
              const squareGeo = new THREE.PlaneGeometry(squareSize, squareSize);
              const squareMat = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                emissive: 0xffffff,
                emissiveIntensity: 0.3,
                side: THREE.DoubleSide
              });
              const square = new THREE.Mesh(squareGeo, squareMat);
              square.position.set(
                startOffset + col * squareSize,
                startOffset + row * squareSize,
                0
              );
              square.userData.gridSize = gridSize;
              square.userData.baseScale = 0.01;
              square.scale.setScalar(0.01);
              scene.add(square);
              ts.gridSquares.push(square);
            }
          }
          
          console.log(`[THEOS] Created ${gridSize}x${gridSize} grid (${ts.gridSquares.length} squares)`);
        }
        
        // Animate squares
        if (collapseProgress === 0) {
          // Expand phase
          ts.gridSquares.forEach(sq => {
            const targetScale = THREE.MathUtils.lerp(0.01, 1, expandProgress);
            sq.scale.setScalar(targetScale);
          });
        } else {
          // Collapse phase
          ts.gridSquares.forEach(sq => {
            const targetScale = THREE.MathUtils.lerp(1, 0.01, collapseProgress);
            sq.scale.setScalar(targetScale);
          });
        }
        
        // Move to next grid size
        if (elapsed > (ts.gridPhase + 1) * phaseTime) {
          ts.gridPhase++;
          if (ts.gridPhase >= gridSizes.length) {
            // Final collapse complete - redirect to fullhand
            ts.phase = 'redirecting';
            ts.startTime = performance.now();
            console.log('[THEOS] Transition complete - redirecting to fullhand');
          }
        }
      }
    } else if (ts.phase === 'redirecting') {
      // Wait a moment then redirect
      if (elapsed > 0.5) {
        // Clear grid
        ts.gridSquares.forEach(sq => {
          scene.remove(sq);
          sq.geometry.dispose();
          sq.material.dispose();
        });
        
        // Redirect to fullhand sequence mode
        console.log('[THEOS] Redirecting to fullhand sequence...');
        const fullhandUrl = window.location.origin + window.location.pathname.replace('theos-sequence.html', '../componentized/fullhand-complete.html') + '?mode=sequence';
        window.location.href = fullhandUrl;
      }
    }
  }

  function updateCamera(delta) {
    const t = state.sequenceTime;
    
    // Final collapse camera: Focus on single cube
    if (state.finalCollapse) {
      const elapsed = t - state.finalCollapseStartTime;
      const progress = Math.min(1, elapsed / 3);
      const eased = THREE.MathUtils.smootherstep(progress, 0, 1);
      
      // Dolly in close to the final cube
      const rotTime = t - TIMELINE.rotationStart;
      const angle = rotTime * 0.2; // Slower rotation
      const radius = THREE.MathUtils.lerp(50, 25, eased);
      
      camera.position.set(
        Math.cos(angle) * radius,
        8 - eased * 3,
        Math.sin(angle) * radius
      );
      camera.lookAt(0, 0, 0);
      return;
    }
    
    // Phase 1: Dolly IN during plane construction (0-2.5s)
    if (t < TIMELINE.planeRevealEnd) {
      const progress = t / TIMELINE.planeRevealEnd;
      const eased = THREE.MathUtils.smootherstep(progress, 0, 1);
      const z = THREE.MathUtils.lerp(-180, -100, eased);
      const y = THREE.MathUtils.lerp(5, 10, eased);
      camera.position.set(0, y, z);
      camera.lookAt(0, 0, 0);
      return;
    }
    
    // Phase 1.5: HOLD during glitch and Z-axis expansion (2.5-6s)
    if (t >= TIMELINE.planeRevealEnd && t < TIMELINE.depthExpandEnd) {
      camera.position.set(0, 10, -100);
      camera.lookAt(0, 0, 0);
      return;
    }
    
    // Phase 2: Begin rotation + Dolly OUT (6.5-9s)
    if (t >= TIMELINE.rotationStart && t < TIMELINE.dollyOutEnd) {
      const rotTime = t - TIMELINE.rotationStart;
      const angle = rotTime * 0.4;
      
      // Dolly out during rotation
      const dollyProgress = (t - TIMELINE.dollyOutStart) / (TIMELINE.dollyOutEnd - TIMELINE.dollyOutStart);
      const eased = THREE.MathUtils.smootherstep(dollyProgress, 0, 1);
      const radius = THREE.MathUtils.lerp(100, 160, eased); // Start from current position
      
      camera.position.set(
        Math.cos(angle) * radius,
        10 + Math.sin(rotTime * 0.3) * 8,
        Math.sin(angle) * radius
      );
      camera.lookAt(0, 0, 0);
      return;
    }
    
    // Phase 3: Continue rotation + Dolly IN (9.5-11s)
    if (t >= TIMELINE.dollyInStart && t < TIMELINE.dollyInEnd) {
      const rotTime = t - TIMELINE.rotationStart;
      const angle = rotTime * 0.4;
      
      // Dolly in during rotation
      const dollyProgress = (t - TIMELINE.dollyInStart) / (TIMELINE.dollyInEnd - TIMELINE.dollyInStart);
      const eased = THREE.MathUtils.smootherstep(dollyProgress, 0, 1);
      const radius = THREE.MathUtils.lerp(160, 110, eased); // From dolly out end to closer
      
      camera.position.set(
        Math.cos(angle) * radius,
        10 + Math.sin(rotTime * 0.3) * 8,
        Math.sin(angle) * radius
      );
      camera.lookAt(0, 0, 0);
      return;
    }
    
    // Phase 4: Rotation established (11-12s)
    if (t >= TIMELINE.dollyInEnd && t < TIMELINE.cubeGreenStart) {
      const rotTime = t - TIMELINE.rotationStart;
      const angle = rotTime * 0.4;
      camera.position.set(
        Math.cos(angle) * 110,
        10 + Math.sin(rotTime * 0.3) * 8,
        Math.sin(angle) * 110
      );
      camera.lookAt(0, 0, 0);
      return;
    }

    // Phase 5: Continue rotation through transformations (12s+)
    if (t >= TIMELINE.cubeGreenStart && t < TIMELINE.sphereStart) {
      const rotTime = t - TIMELINE.rotationStart; // Use same rotation base
      const angle = rotTime * 0.4;
      const orbitTime = t - TIMELINE.cubeGreenStart;
      const radius = 110 - Math.min(40, orbitTime * 4); // Gradually move closer
      
      camera.position.set(
        Math.cos(angle) * radius,
        12 + Math.sin(rotTime * 0.3) * 12,
        Math.sin(angle) * radius
      );
      camera.lookAt(0, 0, 0);
      return;
    }

    // Phase 6: Spheres - continue rotation, closer radius
    if (t >= TIMELINE.sphereStart && t < TIMELINE.blueCubeStart) {
      const rotTime = t - TIMELINE.rotationStart;
      const angle = rotTime * 0.4;
      const radius = 75;
      
      camera.position.set(
        Math.cos(angle) * radius,
        12 + Math.sin(rotTime * 0.3) * 10,
        Math.sin(angle) * radius
      );
      camera.lookAt(0, 0, 0);
      return;
    }

    // Phase 7: Blue cubes - continue rotation, tighter radius
    if (t >= TIMELINE.blueCubeStart && t < TIMELINE.whiteCubeStart) {
      const rotTime = t - TIMELINE.rotationStart;
      const angle = rotTime * 0.4;
      const radius = 65;
      
      camera.position.set(
        Math.cos(angle) * radius,
        10 + Math.sin(rotTime * 0.3) * 8,
        Math.sin(angle) * radius
      );
      camera.lookAt(0, 0, 0);
      return;
    }

    // Phase 8: White cubes + singularity - slow approach
    const rotTime = t - TIMELINE.rotationStart;
    const angle = rotTime * 0.35; // Slower rotation
    const radius = 50;
    
    camera.position.set(
      Math.cos(angle) * radius,
      8 + Math.sin(rotTime * 0.25) * 6,
      Math.sin(angle) * radius
    );
    camera.lookAt(0, 0, 0);
  }

  function applyRandomPops(delta) {
    const t = state.sequenceTime;
    if (t < TIMELINE.randomPopStart || t >= TIMELINE.glitchStart) return;
    
    const flatShapes = ['flat-cone', 'flat-sphere', 'flat-cube'];
    
    // Pop random cubes to different shapes
    const popsPerFrame = Math.ceil(state.shapes.length * delta * 0.5); // Pop about half over 2 seconds
    
    for (let i = 0; i < popsPerFrame; i++) {
      const randomMesh = state.shapes[Math.floor(Math.random() * state.shapes.length)];
      
      // Only pop if still green cube
      if (randomMesh.userData.type === 'cube-green' && !randomMesh.userData.popped) {
        const randomShape = flatShapes[Math.floor(Math.random() * flatShapes.length)];
        const definition = SHAPE_DEFINITIONS[randomShape];
        
        // Swap geometry and material
        randomMesh.geometry = getPooledGeometry(randomShape);
        if (randomMesh.material) randomMesh.material.dispose();
        randomMesh.material = definition.material();
        randomMesh.material.userData = {
          originalColor: randomMesh.material.color.clone(),
          originalEmissive: randomMesh.material.emissive.clone()
        };
        randomMesh.userData.type = randomShape;
        randomMesh.userData.targetScale = definition.targetScale;
        randomMesh.userData.popped = true;
        randomMesh.scale.setScalar(0.01); // Reset for pop animation
      }
    }
  }

  function triggerStages(delta) {
    const t = state.sequenceTime;
    state.isGlitching = t >= TIMELINE.glitchStart && t < TIMELINE.pyramidStart;

    if (!state.stageFlags.cubes && t >= TIMELINE.cubeGreenStart) {
      instantiateShapes('cube-green');
      state.stageFlags.cubes = true;
      
      // Pre-warm neighbor connections to avoid lag later
      setTimeout(() => prewarmNeighborConnections(), 500);
    }
    
    // Random pop phase
    if (!state.stageFlags.randomPop && t >= TIMELINE.randomPopStart) {
      state.stageFlags.randomPop = true;
      state.randomPopActive = true;
      console.log('[THEOS] Random pop phase activated');
    }

    if (!state.stageFlags.pyramids && t >= TIMELINE.pyramidStart) {
      instantiateShapes('pyramid-yellow');
      state.stageFlags.pyramids = true;
    }

    if (!state.stageFlags.spheres && t >= TIMELINE.sphereStart) {
      instantiateShapes('sphere-red');
      state.stageFlags.spheres = true;
    }

    ensureConnectors();

    if (!state.stageFlags.blueCubes && t >= TIMELINE.blueCubeStart) {
      instantiateShapes('cube-blue');
      state.stageFlags.blueCubes = true;
    }

    if (state.stageFlags.blueCubes && !state.stageFlags.whiteCubes && t >= TIMELINE.whiteCubeStart) {
      state.stageFlags.whiteCubes = true;
      instantiateShapes('cube-white');
    }

    if (state.stageFlags.whiteCubes && !state.merging && t >= TIMELINE.mergeStart) {
      state.merging = true;
    }

    state.mergeProgress = state.merging
      ? Math.min(1, state.mergeProgress + delta * 0.18)
      : state.mergeProgress;
  }

  function skipToFinale() {
    state.planeIndex = planePositions.length;
    state.depthIndex = depthPositions.length;
    clearAddresses();
    instantiateShapes('cube-white');
    state.stageFlags = {
      cubes: true,
      pyramids: true,
      blueCubes: true,
      spheres: true,
      whiteCubes: true
    };
    state.sequenceTime = TIMELINE.mergeStart + 2;
    state.merging = true;
    state.mergeProgress = 0.8;
    camera.position.set(0, 28, 38);
    camera.lookAt(0, 4, 0);
  }

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    composer.setSize(width, height);
  }

  window.addEventListener('resize', resize);

  // Pre-warm plane sprites immediately
  prewarmAllSprites();
  
  // Defer depth layer pre-warming to avoid initial load lag
  setTimeout(() => {
    prewarmDepthLayers();
  }, 100);

  if (state.skipAhead) {
    skipToFinale();
  }

  // Adaptive frame skipping for performance
  let lastFrameTime = performance.now();
  const TARGET_FRAME_TIME = 1000 / 60; // 60fps target
  
  function animate() {
    const now = performance.now();
    const frameTime = now - lastFrameTime;
    lastFrameTime = now;
    
    const delta = clock.getDelta();
    
    // Only progress timeline if sequence has started
    if (state.sequenceStarted) {
      if (!state.skipAhead) {
        state.sequenceTime += delta;
      } else {
        state.sequenceTime += delta * 0.5;
      }
    }

    if (state.sequenceStarted && !state.stageFlags.cubes) {
      spawnPlaneAddresses(delta);
      spawnDepthLayerByLayer(delta);
      spawnGridLines(delta);
    }

    if (state.sequenceStarted) {
      revealAddresses(delta);
      triggerStages(delta);
      
      // Apply random pops during transition phase
      if (state.randomPopActive) {
        applyRandomPops(delta);
      }
    }

    applyShapeBehaviours(delta);
    updateConnectors(delta);
    updateFinalCube(delta);
    updateTransitionSequence(delta);
    updateCamera(delta);

    composer.render();
    requestAnimationFrame(animate);
  }

  animate();

  console.log(`[THEOS] Sequence initialized - ${gridSize}³ grid, spacing: ${spacing}, mode: ${startStage}`);

  return {
    scene,
    camera,
    renderer,
    composer,
    start() {
      console.log('[THEOS] Starting lattice sequence...');
      state.sequenceStarted = true;
    },
    triggerFinalCollapse() {
      triggerFinalCollapse();
    },
    dispose() {
      window.removeEventListener('resize', resize);
      renderer.dispose();
      composer.dispose();
    }
  };
}
