import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const DEFAULT_OPTIONS = {
  gridSize: 16,
  spacing: 6,
  startStage: 'intro'
};

const TIMELINE = {
  planeRevealEnd: 6,
  depthRevealStart: 6,
  rotationStart: 10,
  cubeGreenStart: 14,
  glitchStart: 18,
  pyramidStart: 22,
  blueCubeStart: 26,
  sphereStart: 30,
  whiteCubeStart: 36,
  mergeStart: 40
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
  'pyramid-yellow': {
    geometry: () => new THREE.ConeGeometry(3.1, 5.1, 3, 1),
    material: () => new THREE.MeshStandardMaterial({
      color: 0xffd447,
      emissive: 0x5a3100,
      emissiveIntensity: 0.65,
      roughness: 0.35,
      metalness: 0.25
    }),
    targetScale: 1.15
  },
  'cube-blue': {
    geometry: () => new THREE.BoxGeometry(3.2, 3.2, 3.2),
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

function createAddressTexture(col, row, depth) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const baseLabel = `${String.fromCharCode(65 + col)}${row + 1}`;
  const greekIndex = depth % GREEK_LETTERS.length;
  const suffix = depth > 0 ? `·${GREEK_LETTERS[greekIndex]}` : '';
  const label = `${baseLabel}${suffix}`;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.font = 'bold 58px "Roboto Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillStyle = depth === 0 ? '#00ffc3' : '#8ab4ff';

  ctx.strokeText(label, canvas.width / 2, canvas.height / 2);
  ctx.fillText(label, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  return texture;
}

function createAddressSprite(col, row, depth, position) {
  const texture = createAddressTexture(col, row, depth);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: 0
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(4.4, 4.4, 1);
  sprite.position.copy(position);
  sprite.userData = { type: 'address', col, row, depth };
  return sprite;
}

function createMeshForStage(stageKey, position, index) {
  const definition = SHAPE_DEFINITIONS[stageKey];
  const geometry = definition.geometry();
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

  if (stageKey === 'pyramid-yellow') {
    mesh.rotation.x = Math.PI;
  }

  return mesh;
}

function createConnectorNetwork(meshes) {
  const pairs = [];
  const maxConnections = Math.min(meshes.length * 1.5, 480);
  for (let i = 0; i < maxConnections; i++) {
    const aIndex = Math.floor(Math.random() * meshes.length);
    let bIndex = Math.floor(Math.random() * meshes.length);
    if (aIndex === bIndex) {
      bIndex = (bIndex + 1) % meshes.length;
    }
    pairs.push([aIndex, bIndex]);
  }

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(pairs.length * 6);
  const colors = new Float32Array(pairs.length * 6);

  pairs.forEach((pair, i) => {
    const color = CONNECTOR_COLORS[i % CONNECTOR_COLORS.length];
    colors.set([color.r, color.g, color.b, color.r, color.g, color.b], i * 6);
  });

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.0
  });

  const lines = new THREE.LineSegments(geometry, material);
  lines.userData = { pairs };
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
  scene.background = new THREE.Color(0x04050c);
  scene.fog = new THREE.FogExp2(0x04050c, 0.0075);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 0, -150);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setClearColor(0x04050c, 1);
  container.appendChild(renderer.domElement);

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.1,
    0.9,
    0.2
  );
  composer.addPass(bloomPass);

  const ambientLight = new THREE.AmbientLight(0x5260a8, 0.9);
  scene.add(ambientLight);

  const keyLight = new THREE.PointLight(0x7efce2, 1.6, 600, 2);
  keyLight.position.set(90, 80, -40);
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0x3b7bff, 1.25, 520, 2);
  fillLight.position.set(-90, -50, -30);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xfff6b7, 0.45);
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

  const planeDepth = Math.floor(gridSize / 2);
  const planePositions = gridPositions.filter((pos) => pos.depth === planeDepth);
  const depthPositions = gridPositions.filter((pos) => pos.depth !== planeDepth);

  const state = {
    planeIndex: 0,
    depthIndex: 0,
    addresses: [],
    shapes: [],
    connectors: null,
    connectorPairs: [],
    currentShape: 'addresses',
    sequenceTime: 0,
    isGlitching: false,
    stageFlags: {
      cubes: false,
      pyramids: false,
      blueCubes: false,
      spheres: false,
      whiteCubes: false
    },
    merging: false,
    mergeProgress: 0,
    cameraTarget: camera.position.clone(),
    cameraLook: new THREE.Vector3(0, 0, 0),
    skipAhead: startStage === 'blackhole'
  };

  const clock = new THREE.Clock();

  function spawnPlaneAddresses(delta) {
    if (state.planeIndex >= planePositions.length) {
      return;
    }
    const rate = Math.ceil((planePositions.length / 6) * delta * 5);
    for (let i = 0; i < rate && state.planeIndex < planePositions.length; i++) {
      const pos = planePositions[state.planeIndex++];
      const sprite = createAddressSprite(pos.col, pos.row, 0, pos.position);
      scene.add(sprite);
      state.addresses.push(sprite);
    }
  }

  function spawnDepthAddresses(delta) {
    if (state.depthIndex >= depthPositions.length) {
      return;
    }
    const rate = Math.ceil((depthPositions.length / 6) * delta * 4.5);
    for (let i = 0; i < rate && state.depthIndex < depthPositions.length; i++) {
      const pos = depthPositions[state.depthIndex++];
      const sprite = createAddressSprite(pos.col, pos.row, pos.depth, pos.position);
      scene.add(sprite);
      state.addresses.push(sprite);
    }
  }

  function revealAddresses(delta) {
    const fadeSpeed = 1.6;
    state.addresses.forEach((sprite) => {
      sprite.material.opacity = Math.min(1, sprite.material.opacity + fadeSpeed * delta);
    });
  }

  function clearAddresses() {
    state.addresses.forEach((sprite) => scene.remove(sprite));
    state.addresses = [];
  }

  function instantiateShapes(stageKey) {
    clearAddresses();
    state.shapes.forEach((mesh) => {
      scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
    state.shapes = [];

    gridPositions.forEach((pos, index) => {
      const mesh = createMeshForStage(stageKey, pos.position, index);
      mesh.userData.spawnTime = state.sequenceTime;
      state.shapes.push(mesh);
      scene.add(mesh);
    });
    state.currentShape = stageKey;
  }

  function ensureConnectors() {
    if (!state.connectors && state.currentShape === 'sphere-red') {
      const network = createConnectorNetwork(state.shapes);
      state.connectors = network;
      state.connectorPairs = network.userData.pairs;
      scene.add(network);
    }
  }

  function updateConnectors(delta) {
    if (!state.connectors) {
      return;
    }
    const { connectorPairs } = state;
    const positions = state.connectors.geometry.attributes.position.array;
    connectorPairs.forEach((pair, idx) => {
      const meshA = state.shapes[pair[0]];
      const meshB = state.shapes[pair[1]];
      if (!meshA || !meshB) {
        return;
      }
      const offset = idx * 6;
      positions[offset] = meshA.position.x;
      positions[offset + 1] = meshA.position.y;
      positions[offset + 2] = meshA.position.z;
      positions[offset + 3] = meshB.position.x;
      positions[offset + 4] = meshB.position.y;
      positions[offset + 5] = meshB.position.z;
    });
    state.connectors.geometry.attributes.position.needsUpdate = true;

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
  }

  function applyShapeBehaviours(delta) {
    if (state.shapes.length === 0) {
      return;
    }

    const isSphereStage = state.currentShape === 'sphere-red';
    const isWhiteStage = state.currentShape === 'cube-white';
    const isPyramidStage = state.currentShape === 'pyramid-yellow';
    const isCubeStage = state.currentShape.startsWith('cube');

    const scratchScale = new THREE.Vector3();

    state.shapes.forEach((mesh, idx) => {
      const baseColor = mesh.material.userData?.originalColor;
      const baseEmissive = mesh.material.userData?.originalEmissive;

      if (state.isGlitching && state.currentShape === 'cube-green') {
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

      if (isCubeStage) {
        const baseSpeed = state.currentShape === 'cube-white' ? 0.12 : 0.28;
        mesh.rotation.x += delta * baseSpeed;
        mesh.rotation.y += delta * baseSpeed * 0.78;
      }

      if (isPyramidStage) {
        mesh.rotation.y += delta * 0.65;
        mesh.rotation.z += delta * 0.12;
      }

      if (isSphereStage) {
        const pulse = mesh.userData.targetScale * (1 + Math.sin(state.sequenceTime * 3 + idx * 0.18) * 0.1);
        mesh.scale.lerp(scratchScale.setScalar(pulse), 0.2);
        mesh.rotation.y += delta * 0.15;
      } else if (!isSphereStage) {
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

  function updateCamera(delta) {
    const t = state.sequenceTime;
    if (t < TIMELINE.cubeGreenStart) {
      const progress = THREE.MathUtils.smootherstep(t / TIMELINE.cubeGreenStart);
      const desired = new THREE.Vector3(0, 12 * progress, -150 + 70 * progress);
      lerpVector(state.cameraTarget, desired, delta * 0.7);
      lerpVector(camera.position, state.cameraTarget, 0.12);
      camera.lookAt(0, 0, 0);
      return;
    }

    if (t >= TIMELINE.cubeGreenStart && t < TIMELINE.sphereStart) {
      const orbitTime = t - TIMELINE.cubeGreenStart;
      const radius = 110 - Math.min(40, orbitTime * 6);
      const angle = orbitTime * 0.55;
      const desired = new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(orbitTime * 0.4) * 24,
        Math.sin(angle) * radius
      );
      lerpVector(camera.position, desired, 0.06);
      lerpVector(state.cameraLook, new THREE.Vector3(0, Math.sin(orbitTime * 0.3) * 10, 0), 0.08);
      camera.lookAt(state.cameraLook);
      return;
    }

    if (t >= TIMELINE.sphereStart && t < TIMELINE.whiteCubeStart) {
      const sweep = t - TIMELINE.sphereStart;
      const radius = 65 - Math.min(18, sweep * 2.4);
      const desired = new THREE.Vector3(
        Math.cos(sweep * 0.35) * radius,
        22 + Math.sin(sweep * 0.6) * 12,
        Math.sin(sweep * 0.35) * radius
      );
      lerpVector(camera.position, desired, 0.08);
      lerpVector(state.cameraLook, new THREE.Vector3(0, 6, 0), 0.06);
      camera.lookAt(state.cameraLook);
      return;
    }

    const desired = new THREE.Vector3(0, 28, 38);
    lerpVector(camera.position, desired, 0.05);
    lerpVector(state.cameraLook, new THREE.Vector3(0, 4, 0), 0.08);
    camera.lookAt(state.cameraLook);
  }

  function triggerStages(delta) {
    const t = state.sequenceTime;
    state.isGlitching = t >= TIMELINE.glitchStart && t < TIMELINE.pyramidStart;

    if (!state.stageFlags.cubes && t >= TIMELINE.cubeGreenStart) {
      instantiateShapes('cube-green');
      state.stageFlags.cubes = true;
    }

    if (!state.stageFlags.pyramids && t >= TIMELINE.pyramidStart) {
      instantiateShapes('pyramid-yellow');
      state.stageFlags.pyramids = true;
    }

    if (!state.stageFlags.blueCubes && t >= TIMELINE.blueCubeStart) {
      instantiateShapes('cube-blue');
      state.stageFlags.blueCubes = true;
    }

    if (!state.stageFlags.spheres && t >= TIMELINE.sphereStart) {
      instantiateShapes('sphere-red');
      state.stageFlags.spheres = true;
    }

    ensureConnectors();

    if (state.stageFlags.spheres && !state.stageFlags.whiteCubes && t >= TIMELINE.whiteCubeStart) {
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

  if (state.skipAhead) {
    skipToFinale();
  }

  function animate() {
    const delta = clock.getDelta();
    if (!state.skipAhead) {
      state.sequenceTime += delta;
    } else {
      state.sequenceTime += delta * 0.5;
    }

    if (!state.stageFlags.cubes) {
      spawnPlaneAddresses(delta);
    }

    if (state.sequenceTime >= TIMELINE.depthRevealStart && !state.stageFlags.cubes) {
      spawnDepthAddresses(delta);
    }

    revealAddresses(delta);

    triggerStages(delta);
    applyShapeBehaviours(delta);
    updateConnectors(delta);
    updateCamera(delta);

    composer.render();
    requestAnimationFrame(animate);
  }

  animate();

  return {
    scene,
    camera,
    renderer,
    composer,
    dispose() {
      window.removeEventListener('resize', resize);
      renderer.dispose();
      composer.dispose();
    }
  };
}
