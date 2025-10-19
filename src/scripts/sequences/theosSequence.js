import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const DEFAULT_OPTIONS = {
  gridSize: 16,
  spacing: 6,
  startStage: 'intro'
};

function createAddressTexture(col, row, depth) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const label = `${String.fromCharCode(65 + col)}${row + 1}${depth > 0 ? `:${depth}` : ''}`;

  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = 'bold 60px "Roboto Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = depth === 0 ? '#00ffc3' : '#8ab4ff';
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 6;

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
  sprite.scale.set(4.2, 4.2, 1);
  sprite.position.copy(position);
  sprite.userData = { type: 'address', col, row, depth };
  return sprite;
}

function createCubeForPosition(position) {
  const geometry = new THREE.BoxGeometry(3.2, 3.2, 3.2);
  const material = new THREE.MeshStandardMaterial({
    color: 0x90a4ff,
    emissive: 0x16213f,
    emissiveIntensity: 0.6,
    metalness: 0.15,
    roughness: 0.45
  });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.copy(position);
  cube.scale.setScalar(0.01);
  cube.userData = { type: 'cube', activated: false, spiralAngle: Math.random() * Math.PI * 2 };
  return cube;
}

function createWhiteRoom() {
  const geometry = new THREE.BoxGeometry(120, 90, 120);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x0a0a14,
    emissiveIntensity: 0.08,
    roughness: 0.3,
    metalness: 0.0,
    side: THREE.BackSide
  });
  return new THREE.Mesh(geometry, material);
}

function createBlackHoleCore() {
  const group = new THREE.Group();

  const coreGeometry = new THREE.IcosahedronGeometry(4, 1);
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0x050510,
    emissive: 0x10143a,
    emissiveIntensity: 1.6,
    metalness: 0.8,
    roughness: 0.2
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  group.add(core);

  const horizonGeometry = new THREE.TorusGeometry(10, 1.8, 32, 200);
  const horizonMaterial = new THREE.MeshStandardMaterial({
    color: 0x3f51ff,
    emissive: 0x1526ff,
    emissiveIntensity: 2.4,
    metalness: 0.4,
    roughness: 0.35,
    transparent: true,
    opacity: 0.85
  });
  const horizon = new THREE.Mesh(horizonGeometry, horizonMaterial);
  horizon.rotation.x = Math.PI / 2;
  group.add(horizon);

  const particleGeometry = new THREE.BufferGeometry();
  const particleCount = 600;
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 16 + Math.random() * 12;
    const height = (Math.random() - 0.5) * 6;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = height;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const particleMaterial = new THREE.PointsMaterial({
    color: 0x87d5ff,
    size: 1.6,
    transparent: true,
    opacity: 0.75,
    depthWrite: false
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  particles.userData = { type: 'disk' };
  group.add(particles);

  group.userData = {
    type: 'blackhole',
    core,
    horizon,
    particles
  };

  return group;
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

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 0, -120);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.8, 0.9, 0.2);
  composer.addPass(bloomPass);

  const ambientLight = new THREE.AmbientLight(0x404070, 0.8);
  scene.add(ambientLight);

  const keyLight = new THREE.PointLight(0x88baff, 1.6, 600, 2);
  keyLight.position.set(80, 60, -20);
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0xff758c, 1.2, 400, 2);
  fillLight.position.set(-80, -40, -10);
  scene.add(fillLight);

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
    cubes: [],
    room: null,
    blackHole: null,
    sequenceTime: 0,
    rotationStart: null,
    cubeStart: null,
    cameraTarget: camera.position.clone(),
    cameraLook: new THREE.Vector3(0, 0, 0),
    skipAhead: startStage === 'blackhole'
  };

  const clock = new THREE.Clock();

  function spawnPlaneAddresses(delta) {
    if (state.planeIndex >= planePositions.length) {
      return;
    }
    const spawnCount = Math.ceil(planePositions.length / 8 * delta * 6);
    for (let i = 0; i < spawnCount && state.planeIndex < planePositions.length; i++) {
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
    const spawnCount = Math.ceil(depthPositions.length / 6 * delta * 5);
    for (let i = 0; i < spawnCount && state.depthIndex < depthPositions.length; i++) {
      const pos = depthPositions[state.depthIndex++];
      const sprite = createAddressSprite(pos.col, pos.row, pos.depth, pos.position);
      scene.add(sprite);
      state.addresses.push(sprite);
    }
  }

  function revealAddresses(delta) {
    const fadeSpeed = 1.5;
    state.addresses.forEach((sprite) => {
      sprite.material.opacity = Math.min(1, sprite.material.opacity + fadeSpeed * delta);
    });
  }

  function animateRotation(delta) {
    state.addresses.forEach((sprite) => {
      sprite.rotation.z += delta * 0.1;
    });
    state.cubes.forEach((cube) => {
      cube.rotation.x += delta * 0.15;
      cube.rotation.y += delta * 0.1;
    });
  }

  function convertToCubes(delta) {
    if (!state.cubeStart) {
      state.cubeStart = state.sequenceTime;
    }
    const conversionDuration = 6;
    const progress = THREE.MathUtils.clamp((state.sequenceTime - state.cubeStart) / conversionDuration, 0, 1);
    const targetCount = Math.floor(gridPositions.length * progress);

    while (state.cubes.length < targetCount && state.addresses.length > 0) {
      const sprite = state.addresses.shift();
      const cube = createCubeForPosition(sprite.position.clone());
      scene.add(cube);
      state.cubes.push(cube);
      scene.remove(sprite);
    }

    state.cubes.forEach((cube) => {
      if (!cube.userData.activated) {
        cube.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        if (cube.scale.x > 0.95) {
          cube.userData.activated = true;
        }
      }
    });
  }

  function ensureWhiteRoom() {
    if (state.room) {
      return;
    }
    state.room = createWhiteRoom();
    scene.add(state.room);

    const roomLight = new THREE.PointLight(0xffffff, 1.6, 200, 2);
    roomLight.position.set(0, 10, 0);
    state.room.add(roomLight);
  }

  function ensureBlackHole() {
    if (state.blackHole) {
      return;
    }
    const group = createBlackHoleCore();
    scene.add(group);
    state.blackHole = group;
  }

  function animateBlackHole(delta) {
    if (!state.blackHole) {
      return;
    }
    state.blackHole.rotation.y += delta * 0.2;
    const { core, horizon, particles } = state.blackHole.userData;
    core.rotation.x += delta * 0.4;
    core.rotation.y += delta * 0.35;
    horizon.material.opacity = 0.7 + Math.sin(state.sequenceTime * 3.2) * 0.2;

    const positions = particles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];
      const angle = Math.atan2(z, x) + delta * 0.9;
      const radius = Math.sqrt(x * x + z * z);
      const fall = THREE.MathUtils.lerp(y, 0, delta * 0.15);
      positions[i] = Math.cos(angle) * radius;
      positions[i + 1] = fall;
      positions[i + 2] = Math.sin(angle) * radius;
    }
    particles.geometry.attributes.position.needsUpdate = true;
  }

  function pullCubes(delta) {
    state.cubes.forEach((cube) => {
      const dist = cube.position.length();
      const pull = THREE.MathUtils.clamp(delta * 0.6 * (1 + (60 - dist) * 0.02), 0.01, 0.12);
      cube.position.lerp(new THREE.Vector3(0, 0, 0), pull);
      cube.scale.y = 1 + Math.max(0, (20 - dist) * 0.05);
      cube.scale.x = cube.scale.z = 1 / cube.scale.y;
    });
  }

  function updateCamera(delta) {
    const rumbleStart = 8;
    const rumbleEnd = 10;
    if (state.sequenceTime > rumbleStart && state.sequenceTime < rumbleEnd) {
      const intensity = (state.sequenceTime - rumbleStart) / (rumbleEnd - rumbleStart);
      const offsetX = Math.sin(state.sequenceTime * 25) * intensity * 2;
      const offsetY = Math.cos(state.sequenceTime * 30) * intensity * 1.2;
      camera.position.set(offsetX, offsetY, -120);
      camera.lookAt(0, 0, 0);
    } else if (state.sequenceTime >= 22 && state.sequenceTime < 34) {
      const desired = new THREE.Vector3(0, 0, -90 + Math.sin(state.sequenceTime * 0.5) * 3);
      lerpVector(state.cameraTarget, desired, delta * 0.6);
      lerpVector(camera.position, state.cameraTarget, 0.1);
      camera.lookAt(0, 0, 0);
    } else if (state.sequenceTime >= 34) {
      const desired = new THREE.Vector3(0, 10, 28);
      lerpVector(state.cameraTarget, desired, delta * 0.4);
      lerpVector(camera.position, state.cameraTarget, 0.08);
      lerpVector(state.cameraLook, new THREE.Vector3(0, 4, 0), 0.05);
      camera.lookAt(state.cameraLook);
    }
  }

  function skipToBlackHole() {
    planePositions.forEach((pos) => {
      const sprite = createAddressSprite(pos.col, pos.row, 0, pos.position);
      sprite.material.opacity = 1;
      scene.add(sprite);
      state.addresses.push(sprite);
    });

    depthPositions.forEach((pos) => {
      const sprite = createAddressSprite(pos.col, pos.row, pos.depth, pos.position);
      sprite.material.opacity = 1;
      scene.add(sprite);
      state.addresses.push(sprite);
    });

    convertToCubes(0.016);
    state.cubes.forEach((cube) => {
      cube.scale.set(1, 1, 1);
    });

    ensureWhiteRoom();
    ensureBlackHole();
    state.sequenceTime = 48;
    state.cubeStart = state.sequenceTime - 4;
  }

  if (state.skipAhead) {
    skipToBlackHole();
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

  function animate() {
    const delta = clock.getDelta();
    if (!state.skipAhead) {
      state.sequenceTime += delta;
    } else {
      state.sequenceTime += delta * 0.5;
    }

    if (!state.skipAhead) {
      if (state.sequenceTime < 8) {
        spawnPlaneAddresses(delta);
      }
      if (state.sequenceTime >= 10) {
        spawnDepthAddresses(delta);
      }
      revealAddresses(delta);

      if (state.sequenceTime >= 14) {
        if (state.rotationStart === null) {
          state.rotationStart = state.sequenceTime;
        }
        animateRotation(delta);
      }

      if (state.sequenceTime >= 18) {
        convertToCubes(delta);
      }

      if (state.sequenceTime >= 28) {
        ensureWhiteRoom();
      }

      if (state.sequenceTime >= 34) {
        ensureBlackHole();
        pullCubes(delta);
      }
    } else {
      pullCubes(delta);
      animateRotation(delta);
      ensureWhiteRoom();
      ensureBlackHole();
    }

    if (state.sequenceTime >= 34) {
      pullCubes(delta);
      animateBlackHole(delta);
    }

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
