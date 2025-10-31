// ==================== BAGS & LUGGAGE ASSET CREATORS ====================
// High-fidelity bags, purses, and luggage items

import { createPositionedGroup, applyShadows } from '../asset-context.js';

/**
 * Create a backpack/bookbag
 */
function createBookbag(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = 0.28;
  const height = 0.4;
  const depth = 0.15;
  
  const color = spec.color || 0x2c5f7f;
  const fabricMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.4, metalness: 0.8 });
  
  // Main body (rounded box)
  const bodyGeo = new THREE.BoxGeometry(width, height, depth, 8, 8, 8);
  
  // Round the edges with vertex deformation
  const bodyPositions = bodyGeo.attributes.position;
  for (let i = 0; i < bodyPositions.count; i++) {
    const x = bodyPositions.getX(i);
    const y = bodyPositions.getY(i);
    const z = bodyPositions.getZ(i);
    
    // Round corners
    const nx = Math.abs(x) / (width / 2);
    const ny = Math.abs(y) / (height / 2);
    const nz = Math.abs(z) / (depth / 2);
    const cornerDist = Math.sqrt(nx * nx + ny * ny + nz * nz);
    
    if (cornerDist > 1.2) {
      const factor = 0.95;
      bodyPositions.setX(i, x * factor);
      bodyPositions.setY(i, y * factor);
      bodyPositions.setZ(i, z * factor);
    }
  }
  bodyGeo.computeVertexNormals();
  
  const body = new THREE.Mesh(bodyGeo, fabricMat);
  body.position.y = height / 2;
  applyShadows(body);
  group.add(body);
  
  // Front pocket
  const pocketGeo = new THREE.BoxGeometry(width * 0.7, height * 0.4, 0.05);
  const pocket = new THREE.Mesh(pocketGeo, fabricMat);
  pocket.position.set(0, height * 0.6, depth / 2 + 0.025);
  applyShadows(pocket);
  group.add(pocket);
  
  // Pocket zipper
  const zipperGeo = new THREE.BoxGeometry(width * 0.65, 0.005, 0.008);
  const zipper = new THREE.Mesh(zipperGeo, metalMat);
  zipper.position.set(0, height * 0.78, depth / 2 + 0.055);
  group.add(zipper);
  
  // Zipper pull
  const pullGeo = new THREE.BoxGeometry(0.015, 0.02, 0.008);
  const pull = new THREE.Mesh(pullGeo, metalMat);
  pull.position.set(width * 0.25, height * 0.78, depth / 2 + 0.06);
  group.add(pull);
  
  // Shoulder straps (2)
  [-width * 0.3, width * 0.3].forEach(xOff => {
    // Upper strap attachment
    const strapGeo = new THREE.BoxGeometry(0.04, height * 0.5, 0.01);
    const strap = new THREE.Mesh(strapGeo, darkMat);
    strap.position.set(xOff, height * 0.65, -depth / 2 - 0.005);
    applyShadows(strap);
    group.add(strap);
    
    // Padding on strap
    const padGeo = new THREE.BoxGeometry(0.045, 0.1, 0.015);
    const pad = new THREE.Mesh(padGeo, fabricMat);
    pad.position.set(xOff, height * 0.75, -depth / 2 - 0.01);
    applyShadows(pad);
    group.add(pad);
  });
  
  // Top handle
  const handleGeo = new THREE.TorusGeometry(0.08, 0.012, 8, 16, Math.PI);
  const handle = new THREE.Mesh(handleGeo, darkMat);
  handle.rotation.x = Math.PI / 2;
  handle.position.y = height + 0.08;
  applyShadows(handle);
  group.add(handle);
  
  // Bottom reinforcement
  const bottomGeo = new THREE.BoxGeometry(width * 0.9, 0.02, depth * 0.9);
  const bottom = new THREE.Mesh(bottomGeo, darkMat);
  bottom.position.y = 0.01;
  applyShadows(bottom);
  group.add(bottom);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createBookbag.metadata = {
  category: 'bags',
  name: 'Backpack',
  description: 'School backpack with pockets and straps',
  dimensions: { width: 0.28, height: 0.4, depth: 0.15 },
  interactive: false
};

/**
 * Create a purse/handbag
 */
function createPurse(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = 0.25;
  const height = 0.18;
  const depth = 0.1;
  
  const color = spec.color || 0x8b4513;
  const leatherMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.4, metalness: 0.1 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.9 });
  
  // Main body (trapezoid shape)
  const bodyShape = new THREE.Shape();
  const topWidth = width * 0.9;
  const bottomWidth = width;
  
  bodyShape.moveTo(-bottomWidth / 2, 0);
  bodyShape.lineTo(bottomWidth / 2, 0);
  bodyShape.lineTo(topWidth / 2, height);
  bodyShape.lineTo(-topWidth / 2, height);
  bodyShape.lineTo(-bottomWidth / 2, 0);
  
  const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
    depth: depth,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 4
  });
  
  const body = new THREE.Mesh(bodyGeo, leatherMat);
  body.rotation.x = -Math.PI / 2;
  body.position.z = -depth / 2;
  applyShadows(body);
  group.add(body);
  
  // Flap closure
  const flapGeo = new THREE.BoxGeometry(width * 0.85, 0.01, depth * 0.6);
  const flap = new THREE.Mesh(flapGeo, leatherMat);
  flap.position.set(0, height + 0.005, depth * 0.2);
  applyShadows(flap);
  group.add(flap);
  
  // Clasp
  const claspGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.01, 16);
  const clasp = new THREE.Mesh(claspGeo, metalMat);
  clasp.rotation.x = Math.PI / 2;
  clasp.position.set(0, height * 0.7, depth / 2 + 0.005);
  applyShadows(clasp);
  group.add(clasp);
  
  // Handle (curved arc)
  const handleGeo = new THREE.TorusGeometry(width * 0.4, 0.01, 8, 24, Math.PI);
  const handle = new THREE.Mesh(handleGeo, leatherMat);
  handle.rotation.x = Math.PI / 2;
  handle.position.y = height + width * 0.4;
  applyShadows(handle);
  group.add(handle);
  
  // Stitching detail (small lines around edges)
  const stitchMat = new THREE.MeshStandardMaterial({ color: 0xd2b48c });
  const stitchCount = 20;
  for (let i = 0; i < stitchCount; i++) {
    const stitchGeo = new THREE.BoxGeometry(0.002, 0.004, 0.001);
    const stitch = new THREE.Mesh(stitchGeo, stitchMat);
    const angle = (i / stitchCount) * Math.PI * 2;
    const radius = width * 0.42;
    stitch.position.set(
      Math.cos(angle) * radius,
      height * 0.5,
      Math.sin(angle) * radius * (depth / width)
    );
    group.add(stitch);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createPurse.metadata = {
  category: 'bags',
  name: 'Purse',
  description: 'Leather handbag with handle and clasp',
  dimensions: { width: 0.25, height: 0.18, depth: 0.1 },
  interactive: false
};

/**
 * Create a suitcase
 */
function createSuitcase(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = 0.45;
  const height = 0.65;
  const depth = 0.22;
  
  const color = spec.color || 0x2c3e50;
  const caseMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.6, metalness: 0.2 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.3, metalness: 0.9 });
  
  // Main body with rounded edges
  const bodyGeo = new THREE.BoxGeometry(width, height, depth, 8, 8, 8);
  
  // Slight rounding
  const bodyPositions = bodyGeo.attributes.position;
  for (let i = 0; i < bodyPositions.count; i++) {
    const x = bodyPositions.getX(i);
    const y = bodyPositions.getY(i);
    const z = bodyPositions.getZ(i);
    
    const nx = Math.abs(x) / (width / 2);
    const ny = Math.abs(y) / (height / 2);
    const nz = Math.abs(z) / (depth / 2);
    const cornerDist = Math.sqrt(nx * nx + ny * ny + nz * nz);
    
    if (cornerDist > 1.3) {
      const factor = 0.96;
      bodyPositions.setX(i, x * factor);
      bodyPositions.setY(i, y * factor);
      bodyPositions.setZ(i, z * factor);
    }
  }
  bodyGeo.computeVertexNormals();
  
  const body = new THREE.Mesh(bodyGeo, caseMat);
  body.position.y = height / 2;
  applyShadows(body);
  group.add(body);
  
  // Center seam (where it opens)
  const seamGeo = new THREE.BoxGeometry(width * 1.02, 0.01, depth * 1.02);
  const seam = new THREE.Mesh(seamGeo, metalMat);
  seam.position.y = height / 2;
  applyShadows(seam);
  group.add(seam);
  
  // Corner protectors (8 corners)
  const cornerGeo = new THREE.SphereGeometry(0.02, 8, 8);
  [[width / 2, height, depth / 2], [width / 2, height, -depth / 2],
   [-width / 2, height, depth / 2], [-width / 2, height, -depth / 2],
   [width / 2, 0, depth / 2], [width / 2, 0, -depth / 2],
   [-width / 2, 0, depth / 2], [-width / 2, 0, -depth / 2]].forEach(([x, y, z]) => {
    const corner = new THREE.Mesh(cornerGeo, metalMat);
    corner.position.set(x, y, z);
    applyShadows(corner);
    group.add(corner);
  });
  
  // Handle (retractable style)
  const handlePoleGeo = new THREE.CylinderGeometry(0.012, 0.012, height * 0.8, 12);
  [-width * 0.35, width * 0.35].forEach(xOff => {
    const pole = new THREE.Mesh(handlePoleGeo, metalMat);
    pole.position.set(xOff, height * 0.9, -depth / 2 - 0.015);
    applyShadows(pole);
    group.add(pole);
  });
  
  // Handle grip
  const gripGeo = new THREE.CylinderGeometry(0.015, 0.015, width * 0.5, 12);
  const gripMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
  const grip = new THREE.Mesh(gripGeo, gripMat);
  grip.rotation.z = Math.PI / 2;
  grip.position.set(0, height * 1.3, -depth / 2 - 0.015);
  applyShadows(grip);
  group.add(grip);
  
  // Wheels (4)
  const wheelGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16);
  [[width / 2 - 0.05, depth / 2 - 0.05], [width / 2 - 0.05, -depth / 2 + 0.05],
   [-width / 2 + 0.05, depth / 2 - 0.05], [-width / 2 + 0.05, -depth / 2 + 0.05]].forEach(([x, z]) => {
    const wheel = new THREE.Mesh(wheelGeo, metalMat);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, 0.04, z);
    applyShadows(wheel);
    group.add(wheel);
  });
  
  // Latches (2)
  [-width * 0.15, width * 0.15].forEach(xOff => {
    const latchGeo = new THREE.BoxGeometry(0.04, 0.02, 0.015);
    const latch = new THREE.Mesh(latchGeo, metalMat);
    latch.position.set(xOff, height / 2, depth / 2 + 0.0075);
    applyShadows(latch);
    group.add(latch);
  });
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createSuitcase.metadata = {
  category: 'bags',
  name: 'Suitcase',
  description: 'Rolling suitcase with handle and wheels',
  dimensions: { width: 0.45, height: 0.65, depth: 0.22 },
  interactive: false
};

/**
 * Create a briefcase
 */
function createBriefcase(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = 0.4;
  const height = 0.3;
  const depth = 0.1;
  
  const leatherMat = new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.4, metalness: 0.1 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.3, metalness: 0.9 });
  
  // Main body
  const bodyGeo = new THREE.BoxGeometry(width, height, depth);
  const body = new THREE.Mesh(bodyGeo, leatherMat);
  body.position.y = height / 2;
  applyShadows(body);
  group.add(body);
  
  // Top lid (slightly larger)
  const lidGeo = new THREE.BoxGeometry(width + 0.01, 0.04, depth + 0.01);
  const lid = new THREE.Mesh(lidGeo, leatherMat);
  lid.position.y = height + 0.02;
  applyShadows(lid);
  group.add(lid);
  
  // Handle (top center)
  const handleGeo = new THREE.TorusGeometry(0.08, 0.015, 8, 16, Math.PI);
  const handle = new THREE.Mesh(handleGeo, leatherMat);
  handle.rotation.x = Math.PI / 2;
  handle.position.y = height + 0.12;
  applyShadows(handle);
  group.add(handle);
  
  // Metal frame edges
  const frameThickness = 0.008;
  [[width / 2, 0], [-width / 2, 0], [0, depth / 2], [0, -depth / 2]].forEach(([x, z], i) => {
    const frameGeo = i < 2 
      ? new THREE.BoxGeometry(frameThickness, height, depth)
      : new THREE.BoxGeometry(width, height, frameThickness);
    const frame = new THREE.Mesh(frameGeo, metalMat);
    frame.position.set(x, height / 2, z);
    applyShadows(frame);
    group.add(frame);
  });
  
  // Combination locks (2)
  [-width * 0.2, width * 0.2].forEach(xOff => {
    const lockBodyGeo = new THREE.BoxGeometry(0.04, 0.025, 0.02);
    const lockBody = new THREE.Mesh(lockBodyGeo, metalMat);
    lockBody.position.set(xOff, height + 0.0225, depth / 2 + 0.01);
    applyShadows(lockBody);
    group.add(lockBody);
    
    // Lock dials (3)
    for (let i = 0; i < 3; i++) {
      const dialGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.003, 16);
      const dial = new THREE.Mesh(dialGeo, new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
      dial.rotation.x = Math.PI / 2;
      dial.position.set(xOff - 0.012 + i * 0.012, height + 0.0225, depth / 2 + 0.021);
      group.add(dial);
    }
  });
  
  // Corner reinforcements
  [[width / 2, depth / 2], [width / 2, -depth / 2],
   [-width / 2, depth / 2], [-width / 2, -depth / 2]].forEach(([x, z]) => {
    const cornerGeo = new THREE.CylinderGeometry(0.015, 0.015, height, 8);
    const corner = new THREE.Mesh(cornerGeo, metalMat);
    corner.position.set(x, height / 2, z);
    applyShadows(corner);
    group.add(corner);
  });
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createBriefcase.metadata = {
  category: 'bags',
  name: 'Briefcase',
  description: 'Professional leather briefcase with locks',
  dimensions: { width: 0.4, height: 0.3, depth: 0.1 },
  interactive: false
};

/**
 * Create a metal briefcase
 */
function createMetalBriefcase(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = 0.42;
  const height = 0.32;
  const depth = 0.12;
  
  const aluminumMat = new THREE.MeshStandardMaterial({ color: 0xd0d0d0, roughness: 0.2, metalness: 0.9 });
  const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.4, metalness: 0.8 });
  
  // Main body (aluminum)
  const bodyGeo = new THREE.BoxGeometry(width, height, depth);
  const body = new THREE.Mesh(bodyGeo, aluminumMat);
  body.position.y = height / 2;
  applyShadows(body);
  group.add(body);
  
  // Reinforcement ribs (horizontal lines)
  for (let i = 0; i < 5; i++) {
    const ribGeo = new THREE.BoxGeometry(width * 1.01, 0.01, depth * 1.01);
    const rib = new THREE.Mesh(ribGeo, darkMetalMat);
    rib.position.y = (i / 4) * height;
    applyShadows(rib);
    group.add(rib);
  }
  
  // Corner protectors (8 corners)
  const cornerGeo = new THREE.BoxGeometry(0.03, 0.03, 0.03);
  [[width / 2, height, depth / 2], [width / 2, height, -depth / 2],
   [-width / 2, height, depth / 2], [-width / 2, height, -depth / 2],
   [width / 2, 0, depth / 2], [width / 2, 0, -depth / 2],
   [-width / 2, 0, depth / 2], [-width / 2, 0, -depth / 2]].forEach(([x, y, z]) => {
    const corner = new THREE.Mesh(cornerGeo, darkMetalMat);
    corner.position.set(x, y, z);
    applyShadows(corner);
    group.add(corner);
  });
  
  // Handle (industrial style)
  const handleMount1 = new THREE.BoxGeometry(0.04, 0.04, 0.04);
  [-width * 0.3, width * 0.3].forEach(xOff => {
    const mount = new THREE.Mesh(handleMount1, darkMetalMat);
    mount.position.set(xOff, height + 0.02, 0);
    applyShadows(mount);
    group.add(mount);
  });
  
  const handleGripGeo = new THREE.CylinderGeometry(0.02, 0.02, width * 0.5, 12);
  const handleGrip = new THREE.Mesh(handleGripGeo, new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 }));
  handleGrip.rotation.z = Math.PI / 2;
  handleGrip.position.y = height + 0.08;
  applyShadows(handleGrip);
  group.add(handleGrip);
  
  // Combination lock mechanism (center front)
  const lockPanelGeo = new THREE.BoxGeometry(0.12, 0.06, 0.015);
  const lockPanel = new THREE.Mesh(lockPanelGeo, darkMetalMat);
  lockPanel.position.set(0, height * 0.6, depth / 2 + 0.0075);
  applyShadows(lockPanel);
  group.add(lockPanel);
  
  // Lock dials (3)
  for (let i = 0; i < 3; i++) {
    const dialGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.006, 20);
    const dial = new THREE.Mesh(dialGeo, aluminumMat);
    dial.rotation.x = Math.PI / 2;
    dial.position.set(-0.03 + i * 0.03, height * 0.6, depth / 2 + 0.018);
    applyShadows(dial);
    group.add(dial);
  }
  
  // Latches (2 on sides)
  [-width / 2 - 0.015, width / 2 + 0.015].forEach(xOff => {
    const latchGeo = new THREE.BoxGeometry(0.02, 0.08, 0.02);
    const latch = new THREE.Mesh(latchGeo, darkMetalMat);
    latch.position.set(xOff, height / 2, 0);
    applyShadows(latch);
    group.add(latch);
  });
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createMetalBriefcase.metadata = {
  category: 'bags',
  name: 'Metal Briefcase',
  description: 'Aluminum briefcase with combination locks',
  dimensions: { width: 0.42, height: 0.32, depth: 0.12 },
  interactive: false
};

// Export all bag creators
export const creators = {
  bookbag: createBookbag,
  backpack: createBookbag,
  purse: createPurse,
  handbag: createPurse,
  suitcase: createSuitcase,
  briefcase: createBriefcase,
  metalbriefcase: createMetalBriefcase
};

