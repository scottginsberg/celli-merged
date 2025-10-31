// ==================== CLEANING SUPPLIES ASSET CREATORS ====================
// Universal cleaning supply creation functions

import { createPositionedGroup, applyShadows } from '../asset-context.js';

/**
 * Create broom asset
 */
function createBroom(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Handle (long cylinder with rounded end)
  const handleLength = 1.1;
  const handleRadius = 0.012;
  const handleGeo = new THREE.CylinderGeometry(handleRadius, handleRadius, handleLength, 12);
  const handleMat = new THREE.MeshStandardMaterial({
    color: 0x8b7355,
    roughness: 0.8
  });
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.position.y = handleLength / 2 + 0.08;
  applyShadows(handle);
  group.add(handle);
  
  // Rounded end cap on handle (inflated sphere)
  const capGeo = new THREE.SphereGeometry(handleRadius * 1.8, 12, 12);
  const cap = new THREE.Mesh(capGeo, handleMat);
  cap.position.y = handleLength + 0.08;
  applyShadows(cap);
  group.add(cap);
  
  // Bristle base/block (flat box connecting to handle)
  const bristleBaseGeo = new THREE.BoxGeometry(0.22, 0.03, 0.07);
  const bristleBaseMat = new THREE.MeshStandardMaterial({
    color: 0xcc9944,
    roughness: 0.8
  });
  const bristleBase = new THREE.Mesh(bristleBaseGeo, bristleBaseMat);
  bristleBase.position.y = 0.08;
  applyShadows(bristleBase);
  group.add(bristleBase);
  
  // Connection ferrule between handle and base
  const ferruleGeo = new THREE.CylinderGeometry(0.016, 0.022, 0.05, 8);
  const ferruleMat = new THREE.MeshStandardMaterial({
    color: 0x888888,
    roughness: 0.4,
    metalness: 0.6
  });
  const ferrule = new THREE.Mesh(ferruleGeo, ferruleMat);
  ferrule.position.y = 0.085;
  applyShadows(ferrule);
  group.add(ferrule);
  
  // Individual bristles using instanced mesh for performance (MUCH more dense)
  const singleBristleGeo = new THREE.CylinderGeometry(0.0015, 0.001, 0.07, 4);
  const bristleMat = new THREE.MeshStandardMaterial({
    color: 0xffcc66,
    roughness: 0.95
  });
  
  // Much denser bristles: 20x16 = 320 bristles
  const bristleCount = 320;
  const bristleInstances = new THREE.InstancedMesh(singleBristleGeo, bristleMat, bristleCount);
  
  const dummy = new THREE.Object3D();
  let instanceIdx = 0;
  
  for (let x = 0; x < 20; x++) {
    for (let z = 0; z < 16; z++) {
      dummy.position.set(
        -0.1 + x * 0.01,
        0.035,
        -0.03 + z * 0.004
      );
      dummy.rotation.set(
        (Math.random() - 0.5) * 0.15,
        Math.random() * Math.PI * 2,
        (Math.random() - 0.5) * 0.15
      );
      dummy.scale.y = 0.85 + Math.random() * 0.3; // Varied bristle lengths
      dummy.updateMatrix();
      bristleInstances.setMatrixAt(instanceIdx++, dummy.matrix);
    }
  }
  
  bristleInstances.castShadow = true;
  group.add(bristleInstances);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  if (spec.lean) group.rotation.z = Math.PI / 6;
  
  return context.addObject(group);
}

createBroom.metadata = {
  category: 'cleaning',
  name: 'Broom',
  description: 'Household broom with bristles',
  dimensions: { width: 0.2, depth: 0.06, height: 1.28 },
  interactive: false
};

/**
 * Create dustpan asset
 */
function createDustpan(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Pan (angled box)
  const panGeo = new THREE.BoxGeometry(0.25, 0.02, 0.3);
  const panMat = new THREE.MeshStandardMaterial({
    color: 0xff4444,
    roughness: 0.6,
    metalness: 0.2
  });
  const pan = new THREE.Mesh(panGeo, panMat);
  pan.position.y = 0.02;
  pan.rotation.x = -Math.PI / 12;
  applyShadows(pan);
  group.add(pan);
  
  // Handle
  const handleGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.15, 8);
  const handle = new THREE.Mesh(handleGeo, panMat);
  handle.position.set(0, 0.08, -0.17);
  handle.rotation.x = Math.PI / 3;
  group.add(handle);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createDustpan.metadata = {
  category: 'cleaning',
  name: 'Dustpan',
  description: 'Dustpan with handle',
  dimensions: { width: 0.25, depth: 0.3, height: 0.15 },
  interactive: false
};

/**
 * Create vacuum cleaner asset
 */
function createVacuum(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Base/wheels housing
  const baseGeo = new THREE.BoxGeometry(0.32, 0.06, 0.25);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.7
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.03;
  applyShadows(base);
  group.add(base);
  
  // Wheels (4)
  const wheelGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.02, 16);
  const wheelMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.8
  });
  [[0.14, 0.1], [-0.14, 0.1], [0.14, -0.1], [-0.14, -0.1]].forEach(([x, z]) => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.035, z);
    group.add(wheel);
  });
  
  // Body (tapered cylinder)
  const bodyGeo = new THREE.CylinderGeometry(0.13, 0.15, 0.38, 24);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0x6a4c93,
    roughness: 0.5,
    metalness: 0.3
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.25;
  applyShadows(body);
  group.add(body);
  
  // Top cap (rounded)
  const capGeo = new THREE.SphereGeometry(0.13, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const cap = new THREE.Mesh(capGeo, bodyMat);
  cap.position.y = 0.44;
  group.add(cap);
  
  // Handle connector
  const handleBaseGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.08, 12);
  const handleMat = new THREE.MeshStandardMaterial({
    color: 0x4a4a4a,
    roughness: 0.6
  });
  const handleBase = new THREE.Mesh(handleBaseGeo, handleMat);
  handleBase.position.set(0, 0.48, -0.08);
  handleBase.rotation.x = Math.PI / 6;
  group.add(handleBase);
  
  // Handle grip (curved)
  const handleGripGeo = new THREE.TorusGeometry(0.06, 0.015, 8, 16, Math.PI);
  const handleGrip = new THREE.Mesh(handleGripGeo, handleMat);
  handleGrip.rotation.x = Math.PI / 3;
  handleGrip.position.set(0, 0.52, -0.12);
  group.add(handleGrip);
  
  // Hose (flexible corrugated look)
  for (let i = 0; i < 8; i++) {
    const segmentGeo = new THREE.TorusGeometry(0.012, 0.008, 6, 12);
    const hoseMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.7
    });
    const segment = new THREE.Mesh(segmentGeo, hoseMat);
    const angle = (i / 8) * Math.PI * 0.6;
    segment.rotation.y = Math.PI / 2;
    segment.position.set(
      Math.sin(angle) * 0.15,
      0.35 - i * 0.035,
      0.05 + Math.cos(angle) * 0.12
    );
    group.add(segment);
  }
  
  // Nozzle (tapered)
  const nozzleGeo = new THREE.CylinderGeometry(0.018, 0.028, 0.18, 12);
  const nozzle = new THREE.Mesh(nozzleGeo, handleMat);
  nozzle.rotation.x = Math.PI / 2.2;
  nozzle.position.set(0, 0.08, 0.22);
  applyShadows(nozzle);
  group.add(nozzle);
  
  // Nozzle brush strip
  const brushStripGeo = new THREE.BoxGeometry(0.055, 0.015, 0.005);
  const brushMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.95
  });
  const brushStrip = new THREE.Mesh(brushStripGeo, brushMat);
  brushStrip.position.set(0, 0.02, 0.3);
  brushStrip.rotation.x = -Math.PI / 6;
  group.add(brushStrip);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createVacuum.metadata = {
  category: 'cleaning',
  name: 'Vacuum',
  description: 'Upright vacuum cleaner',
  dimensions: { width: 0.3, depth: 0.3, height: 0.65 },
  interactive: false
};

/**
 * Create handheld vacuum asset
 */
function createHandheldVacuum(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Body (tapered cylinder)
  const bodyGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.25, 16);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0x2a2a2a,
    roughness: 0.5,
    metalness: 0.3
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.rotation.z = Math.PI / 2;
  body.position.set(0.125, 0.05, 0);
  applyShadows(body);
  group.add(body);
  
  // Handle
  const handleGeo = new THREE.TorusGeometry(0.035, 0.01, 8, 16, Math.PI);
  const handle = new THREE.Mesh(handleGeo, bodyMat);
  handle.rotation.z = Math.PI / 2;
  handle.position.set(-0.02, 0.08, 0);
  group.add(handle);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createHandheldVacuum.metadata = {
  category: 'cleaning',
  name: 'Handheld Vacuum',
  description: 'Small portable vacuum cleaner',
  dimensions: { width: 0.25, depth: 0.08, height: 0.13 },
  interactive: false
};

/**
 * Create bucket asset
 */
function createBucket(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Bottom (flat base with slight bevel)
  const bottomGeo = new THREE.CylinderGeometry(0.12, 0.125, 0.01, 24);
  const bucketMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0xff6666,
    roughness: 0.6,
    metalness: 0.2
  });
  const bottom = new THREE.Mesh(bottomGeo, bucketMat);
  bottom.position.y = 0.005;
  applyShadows(bottom);
  group.add(bottom);
  
  // Bucket body (tapered cylinder with thickness)
  const bucketGeo = new THREE.CylinderGeometry(0.15, 0.12, 0.24, 24);
  const bucket = new THREE.Mesh(bucketGeo, bucketMat);
  bucket.position.y = 0.13;
  applyShadows(bucket);
  group.add(bucket);
  
  // Inner bucket (slightly smaller for wall thickness)
  const innerBucketGeo = new THREE.CylinderGeometry(0.145, 0.115, 0.235, 24);
  const innerBucket = new THREE.Mesh(innerBucketGeo, bucketMat);
  innerBucket.position.y = 0.1275;
  group.add(innerBucket);
  
  // Rim (torus for rounded edge)
  const rimGeo = new THREE.TorusGeometry(0.15, 0.008, 8, 24);
  const rim = new THREE.Mesh(rimGeo, bucketMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.25;
  applyShadows(rim);
  group.add(rim);
  
  // Handle attachment points (small cylinders)
  const attachmentGeo = new THREE.CylinderGeometry(0.012, 0.015, 0.025, 12);
  const handleMat = new THREE.MeshStandardMaterial({
    color: 0x666666,
    roughness: 0.4,
    metalness: 0.7
  });
  [-0.145, 0.145].forEach(x => {
    const attachment = new THREE.Mesh(attachmentGeo, handleMat);
    attachment.rotation.z = Math.PI / 2;
    attachment.position.set(x, 0.235, 0);
    group.add(attachment);
  });
  
  // Handle (metal wire)
  const handleGeo = new THREE.TorusGeometry(0.13, 0.006, 8, 16, Math.PI);
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.rotation.x = Math.PI / 2;
  handle.position.y = 0.3;
  applyShadows(handle);
  group.add(handle);
  
  // Handle grip (rubber coating in center)
  const gripGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.1, 12);
  const gripMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.95
  });
  const grip = new THREE.Mesh(gripGeo, gripMat);
  grip.rotation.x = Math.PI / 2;
  grip.position.set(0, 0.365, 0.13);
  group.add(grip);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createBucket.metadata = {
  category: 'cleaning',
  name: 'Bucket',
  description: 'Cleaning bucket with handle',
  dimensions: { width: 0.3, depth: 0.3, height: 0.36 },
  interactive: false
};

/**
 * Create porous sponge texture
 */
function createSpongeTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  
  // Base sponge color
  ctx.fillStyle = '#ffff66';
  ctx.fillRect(0, 0, 128, 128);
  
  // Add porous texture (random darker spots)
  for (let i = 0; i < 200; i++) {
    ctx.fillStyle = `rgba(200, 200, 0, ${0.1 + Math.random() * 0.3})`;
    const x = Math.random() * 128;
    const y = Math.random() * 128;
    const size = 1 + Math.random() * 3;
    ctx.fillRect(x, y, size, size);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Create sponge asset
 */
function createSponge(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Soft/porous yellow layer (with rounded corners)
  const spongeGeo = new THREE.BoxGeometry(0.08, 0.03, 0.12, 4, 2, 6);
  const positions = spongeGeo.attributes.position;
  
  // Round corners and add slight irregularity
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    
    // Corner rounding
    const nx = x / 0.04;
    const ny = y / 0.015;
    const nz = z / 0.06;
    const cornerDist = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (cornerDist > 1) {
      const factor = 0.95;
      positions.setX(i, x * factor);
      positions.setY(i, y * factor);
      positions.setZ(i, z * factor);
    }
    
    // Slight surface irregularity
    const noise = (Math.random() - 0.5) * 0.002;
    positions.setY(i, y + noise);
  }
  spongeGeo.computeVertexNormals();
  
  const spongeTexture = createSpongeTexture(THREE);
  const spongeMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0xffff66,
    roughness: 0.98,
    map: spongeTexture
  });
  const sponge = new THREE.Mesh(spongeGeo, spongeMat);
  sponge.position.y = 0.025;
  applyShadows(sponge);
  group.add(sponge);
  
  // Abrasive green layer (scrubbing side)
  const scrubGeo = new THREE.BoxGeometry(0.08, 0.008, 0.12);
  const scrubMat = new THREE.MeshStandardMaterial({
    color: 0x228b22,
    roughness: 0.99
  });
  const scrub = new THREE.Mesh(scrubGeo, scrubMat);
  scrub.position.y = 0.044;
  applyShadows(scrub);
  group.add(scrub);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createSponge.metadata = {
  category: 'cleaning',
  name: 'Sponge',
  description: 'Kitchen sponge',
  dimensions: { width: 0.08, depth: 0.12, height: 0.04 },
  interactive: false
};

/**
 * Create rag asset
 */
function createRag(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const ragGeo = new THREE.PlaneGeometry(0.25, 0.25, 4, 4);
  const positions = ragGeo.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    positions.setY(i, positions.getY(i) + (Math.random() - 0.5) * 0.02);
  }
  ragGeo.computeVertexNormals();
  
  const ragMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0x8888ff,
    roughness: 0.9,
    side: THREE.DoubleSide
  });
  const rag = new THREE.Mesh(ragGeo, ragMat);
  rag.rotation.x = -Math.PI / 2 + Math.random() * 0.3;
  rag.position.y = 0.01;
  rag.receiveShadow = true;
  group.add(rag);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createRag.metadata = {
  category: 'cleaning',
  name: 'Rag',
  description: 'Cleaning cloth',
  dimensions: { width: 0.25, depth: 0.25, height: 0.02 },
  interactive: false
};

/**
 * Create paper towel roll asset
 */
function createPaperTowelRoll(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Outer roll (paper, hollow cylinder using subtraction approach)
  const outerGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.28, 24, 1, true); // Open-ended
  const rollMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.8,
    side: THREE.DoubleSide
  });
  const outer = new THREE.Mesh(outerGeo, rollMat);
  outer.rotation.z = Math.PI / 2;
  applyShadows(outer);
  group.add(outer);
  
  // End caps (paper thickness visible)
  const capGeo = new THREE.RingGeometry(0.025, 0.06, 24);
  [-0.14, 0.14].forEach(x => {
    const cap = new THREE.Mesh(capGeo, rollMat);
    cap.rotation.y = Math.PI / 2;
    cap.position.x = x;
    group.add(cap);
  });
  
  // Cardboard tube (inner, hollow)
  const tubeGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.29, 16, 1, true);
  const tubeMat = new THREE.MeshStandardMaterial({
    color: 0xd4a574,
    roughness: 0.9,
    side: THREE.DoubleSide
  });
  const tube = new THREE.Mesh(tubeGeo, tubeMat);
  tube.rotation.z = Math.PI / 2;
  group.add(tube);
  
  // Tube end caps (cardboard edges)
  const tubeCapGeo = new THREE.RingGeometry(0.022, 0.025, 16);
  [-0.145, 0.145].forEach(x => {
    const tubeCap = new THREE.Mesh(tubeCapGeo, tubeMat);
    tubeCap.rotation.y = Math.PI / 2;
    tubeCap.position.x = x;
    group.add(tubeCap);
  });
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0.06, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createPaperTowelRoll.metadata = {
  category: 'cleaning',
  name: 'Paper Towel Roll',
  description: 'Roll of paper towels',
  dimensions: { width: 0.28, depth: 0.12, height: 0.12 },
  interactive: false
};

/**
 * Create toilet paper roll asset
 */
function createToiletPaperRoll(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Outer roll (paper, hollow cylinder)
  const outerGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.11, 24, 1, true); // Open-ended
  const rollMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.85,
    side: THREE.DoubleSide
  });
  const outer = new THREE.Mesh(outerGeo, rollMat);
  outer.rotation.z = Math.PI / 2;
  applyShadows(outer);
  group.add(outer);
  
  // End caps (paper thickness visible)
  const capGeo = new THREE.RingGeometry(0.02, 0.055, 24);
  [-0.055, 0.055].forEach(x => {
    const cap = new THREE.Mesh(capGeo, rollMat);
    cap.rotation.y = Math.PI / 2;
    cap.position.x = x;
    group.add(cap);
  });
  
  // Cardboard tube (inner, hollow)
  const tubeGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.115, 16, 1, true);
  const tubeMat = new THREE.MeshStandardMaterial({
    color: 0xd4a574,
    roughness: 0.9,
    side: THREE.DoubleSide
  });
  const tube = new THREE.Mesh(tubeGeo, tubeMat);
  tube.rotation.z = Math.PI / 2;
  group.add(tube);
  
  // Tube end caps (cardboard edges)
  const tubeCapGeo = new THREE.RingGeometry(0.018, 0.02, 16);
  [-0.0575, 0.0575].forEach(x => {
    const tubeCap = new THREE.Mesh(tubeCapGeo, tubeMat);
    tubeCap.rotation.y = Math.PI / 2;
    tubeCap.position.x = x;
    group.add(tubeCap);
  });
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0.055, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createToiletPaperRoll.metadata = {
  category: 'cleaning',
  name: 'Toilet Paper Roll',
  description: 'Roll of toilet paper',
  dimensions: { width: 0.11, depth: 0.11, height: 0.11 },
  interactive: false
};

// Export all cleaning creators
export const creators = {
  broom: createBroom,
  dustpan: createDustpan,
  vacuum: createVacuum,
  handheldvacuum: createHandheldVacuum,
  bucket: createBucket,
  sponge: createSponge,
  rag: createRag,
  papertowelroll: createPaperTowelRoll,
  toiletpaperroll: createToiletPaperRoll
};



