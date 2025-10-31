// ==================== BATHROOM ASSET CREATORS ====================
// Universal bathroom fixture creation functions

import { createPositionedGroup, applyShadows } from '../asset-context.js';

/**
 * Create a toilet asset with interactive lid
 * @param {Object} spec - Asset specification
 * @param {Object} THREE - Three.js library reference
 * @param {Object} context - Context with scene, objects, gridSize
 * @returns {THREE.Group}
 */
function createToilet(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const t = {
    bowlRadius: 0.22,
    bowlHeight: 0.3, // SHORTENED from 0.35
    seatRadius: 0.24,
    tankWidth: 0.4,
    tankDepth: 0.15,
    tankHeight: 0.3 // SHORTENED from 0.35
  };
  
  const porcelainMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.2,
    metalness: 0.1,
    side: THREE.DoubleSide
  });
  
  // Bowl (stretched back hemisphere)
  const bowlGeo = new THREE.SphereGeometry(t.bowlRadius, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  const bowl = new THREE.Mesh(bowlGeo, porcelainMat);
  bowl.scale.set(1, 1, 1.3);
  bowl.position.set(0, t.bowlHeight, 0);
  applyShadows(bowl);
  group.add(bowl);
  
  // Inner bowl
  const innerBowlGeo = new THREE.SphereGeometry(t.bowlRadius * 0.75, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  const innerBowl = new THREE.Mesh(innerBowlGeo, porcelainMat);
  innerBowl.scale.set(1, 0.8, 1.3);
  innerBowl.position.set(0, t.bowlHeight + 0.02, 0);
  group.add(innerBowl);
  
  // Rim (torus scaled to oval)
  const rimGeo = new THREE.TorusGeometry(t.bowlRadius * 0.9, 0.02, 16, 32);
  const rim = new THREE.Mesh(rimGeo, porcelainMat);
  rim.rotation.x = Math.PI / 2;
  rim.scale.set(1, 1.3, 1);
  rim.position.set(0, t.bowlHeight, 0);
  applyShadows(rim);
  group.add(rim);
  
  // Seat
  const seatGeo = new THREE.TorusGeometry(t.seatRadius, 0.03, 16, 32);
  const seatMat = new THREE.MeshStandardMaterial({ color: 0xf5f5dc, roughness: 0.6 });
  const seat = new THREE.Mesh(seatGeo, seatMat);
  seat.rotation.x = Math.PI / 2;
  seat.scale.set(1, 1.3, 1);
  seat.position.set(0, t.bowlHeight + 0.02, 0);
  applyShadows(seat);
  group.add(seat);
  
  // Lid (interactive, hinged) - FIXED: proper hinge positioning
  const lidGroup = new THREE.Group();
  const lidGeo = new THREE.TorusGeometry(t.seatRadius, 0.025, 16, 32);
  const lid = new THREE.Mesh(lidGeo, seatMat);
  lid.rotation.x = Math.PI / 2;
  lid.scale.set(1, 1.3, 1);
  lid.position.z = t.seatRadius * 1.3; // Position FORWARD from hinge
  applyShadows(lid);
  lidGroup.add(lid);
  
  const lidCoverGeo = new THREE.CircleGeometry(t.seatRadius, 32);
  const lidCover = new THREE.Mesh(lidCoverGeo, seatMat);
  lidCover.rotation.x = -Math.PI / 2;
  lidCover.scale.set(1, 1.3, 1);
  lidCover.position.z = t.seatRadius * 1.3; // Position FORWARD from hinge
  applyShadows(lidCover);
  lidGroup.add(lidCover);
  
  // FIXED: Hinge at back of toilet, lid geometry extends forward
  lidGroup.position.set(0, t.bowlHeight + 0.02, -t.seatRadius * 1.3);
  lidGroup.userData.isLid = true;
  lidGroup.userData.isOpen = false;
  lidGroup.userData.hingePoint = new THREE.Vector3(0, t.bowlHeight + 0.02, -t.seatRadius * 1.3); // Store hinge
  group.add(lidGroup);
  
  // Register as interactive
  context.registerInteractive(lidGroup);
  
  // Base platform on floor (elongated box) - MOVED FORWARD SLIGHTLY
  const baseGeo = new THREE.BoxGeometry(t.bowlRadius * 2, 0.05, t.tankDepth + t.bowlRadius * 1.5);
  const base = new THREE.Mesh(baseGeo, porcelainMat);
  base.position.set(0, 0.025, -t.bowlRadius * 0.3); // FIXED: was -0.5, now -0.3 (moved forward)
  applyShadows(base);
  group.add(base);
  
  // Pedestal cylinder connecting floor to bowl bottom
  const pedestalHeight = t.bowlHeight - t.bowlRadius * 0.5;
  const pedestalGeo = new THREE.CylinderGeometry(t.bowlRadius * 0.6, t.bowlRadius * 0.7, pedestalHeight, 24);
  const pedestal = new THREE.Mesh(pedestalGeo, porcelainMat);
  pedestal.position.set(0, 0.05 + pedestalHeight / 2, -t.bowlRadius * 0.2);
  applyShadows(pedestal);
  group.add(pedestal);
  
  // Tank
  const tankGeo = new THREE.BoxGeometry(t.tankWidth, t.tankHeight, t.tankDepth);
  const tank = new THREE.Mesh(tankGeo, porcelainMat);
  tank.position.set(0, t.bowlHeight + t.tankHeight / 2, -t.bowlRadius * 1.3);
  applyShadows(tank);
  group.add(tank);
  
  // Connecting piece between bowl and tank
  const connectorGeo = new THREE.BoxGeometry(t.tankWidth * 0.6, t.bowlHeight * 0.3, t.tankDepth * 0.8);
  const connector = new THREE.Mesh(connectorGeo, porcelainMat);
  connector.position.set(0, t.bowlHeight - 0.05, -t.bowlRadius * 1.1);
  applyShadows(connector);
  group.add(connector);
  
  // Flush lever
  const leverGroup = new THREE.Group();
  const leverHandleGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.1, 8);
  const leverMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.4, metalness: 0.8 });
  const leverHandle = new THREE.Mesh(leverHandleGeo, leverMat);
  leverHandle.rotation.z = Math.PI / 2;
  leverGroup.add(leverHandle);
  
  const leverPlatformGeo = new THREE.BoxGeometry(0.06, 0.03, 0.02);
  const leverPlatform = new THREE.Mesh(leverPlatformGeo, leverMat);
  leverPlatform.position.set(0.05, 0, 0);
  leverGroup.add(leverPlatform);
  
  leverGroup.position.set(-t.tankWidth / 2 + 0.05, t.bowlHeight + t.tankHeight * 0.7, -t.bowlRadius * 1.3 + t.tankDepth / 2);
  leverGroup.userData.isFlushHandle = true;
  group.add(leverGroup);
  
  context.registerInteractive(leverGroup);
  
  // Position the group
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createToilet.metadata = {
  category: 'bathroom',
  name: 'Toilet',
  description: 'Toilet with interactive lid and flush lever',
  dimensions: { width: 0.5, depth: 0.6, height: 0.7 },
  interactive: true
};

/**
 * Create a shower stall asset
 * @param {Object} spec - Asset specification
 * @param {Object} THREE - Three.js library reference
 * @param {Object} context - Context with scene, objects, gridSize
 * @returns {THREE.Group}
 */
function createShower(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const s = { width: 1, depth: 1, height: 2 };
  
  // Tiled floor
  const tileSize = 0.05;
  const tilesX = Math.floor(s.width / tileSize);
  const tilesZ = Math.floor(s.depth / tileSize);
  
  for (let i = 0; i < tilesX; i++) {
    for (let j = 0; j < tilesZ; j++) {
      const tileGeo = new THREE.BoxGeometry(tileSize * 0.98, 0.01, tileSize * 0.98);
      const tileMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
      const tile = new THREE.Mesh(tileGeo, tileMat);
      tile.position.set(
        -s.width / 2 + i * tileSize + tileSize / 2,
        0.005,
        -s.depth / 2 + j * tileSize + tileSize / 2
      );
      tile.receiveShadow = true;
      group.add(tile);
    }
  }
  
  // Transparent walls with frames
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide
  });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.3, metalness: 0.7 });
  
  const backWallGeo = new THREE.PlaneGeometry(s.width, s.height);
  const backWall = new THREE.Mesh(backWallGeo, wallMat);
  backWall.position.set(0, s.height / 2, -s.depth / 2);
  group.add(backWall);
  
  // Back wall frame
  const frameThick = 0.02;
  [[0, s.height + 0.01, -s.depth / 2, s.width + 0.04, frameThick, frameThick],  // Top
   [0, -0.01, -s.depth / 2, s.width + 0.04, frameThick, frameThick],            // Bottom
   [-s.width / 2 - 0.02, s.height / 2, -s.depth / 2, frameThick, s.height + 0.04, frameThick],  // Left
   [s.width / 2 + 0.02, s.height / 2, -s.depth / 2, frameThick, s.height + 0.04, frameThick]].forEach(([x, y, z, w, h, d]) => {
    const frameGeo = new THREE.BoxGeometry(w, h, d);
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(x, y, z);
    applyShadows(frame);
    group.add(frame);
  });
  
  const leftWallGeo = new THREE.PlaneGeometry(s.depth, s.height);
  const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-s.width / 2, s.height / 2, 0);
  group.add(leftWall);
  
  // Left wall frame
  [[0, s.height + 0.01, 0, frameThick, frameThick, s.depth + 0.04],
   [0, -0.01, 0, frameThick, frameThick, s.depth + 0.04],
   [0, s.height / 2, -s.depth / 2 - 0.02, frameThick, s.height + 0.04, frameThick],
   [0, s.height / 2, s.depth / 2 + 0.02, frameThick, s.height + 0.04, frameThick]].forEach(([x, y, z, w, h, d]) => {
    const frameGeo = new THREE.BoxGeometry(w, h, d);
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(-s.width / 2 + x, y, z);
    applyShadows(frame);
    group.add(frame);
  });
  
  const rightWall = leftWall.clone();
  rightWall.position.set(s.width / 2, s.height / 2, 0);
  group.add(rightWall);
  
  // Right wall frame
  [[0, s.height + 0.01, 0, frameThick, frameThick, s.depth + 0.04],
   [0, -0.01, 0, frameThick, frameThick, s.depth + 0.04],
   [0, s.height / 2, -s.depth / 2 - 0.02, frameThick, s.height + 0.04, frameThick],
   [0, s.height / 2, s.depth / 2 + 0.02, frameThick, s.height + 0.04, frameThick]].forEach(([x, y, z, w, h, d]) => {
    const frameGeo = new THREE.BoxGeometry(w, h, d);
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(s.width / 2 + x, y, z);
    applyShadows(frame);
    group.add(frame);
  });
  
  // Drain (center of floor)
  const drainGeo = new THREE.CylinderGeometry(0.04, 0.035, 0.015, 20);
  const drainMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.4, metalness: 0.6 });
  const drain = new THREE.Mesh(drainGeo, drainMat);
  drain.position.y = 0.005;
  applyShadows(drain);
  group.add(drain);
  
  // Drain grate holes
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const holeGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.02, 8);
    const hole = new THREE.Mesh(holeGeo, new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
    hole.position.set(Math.cos(angle) * 0.025, 0.005, Math.sin(angle) * 0.025);
    group.add(hole);
  }
  
  // Shower head assembly (on back wall)
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd0d0d0, roughness: 0.2, metalness: 0.9 });
  
  // Wall mount
  const mountGeo = new THREE.CylinderGeometry(0.03, 0.035, 0.04, 16);
  const mount = new THREE.Mesh(mountGeo, chromeMat);
  mount.rotation.x = Math.PI / 2;
  mount.position.set(0, s.height * 0.85, -s.depth / 2 + 0.02);
  applyShadows(mount);
  group.add(mount);
  
  // Shower arm
  const armGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 12);
  const arm = new THREE.Mesh(armGeo, chromeMat);
  arm.rotation.x = Math.PI / 2;
  arm.position.set(0, s.height * 0.85, -s.depth / 2 + 0.145);
  applyShadows(arm);
  group.add(arm);
  
  // Shower head - FIXED: angles DOWN and FORWARD
  const headGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.04, 20);
  const head = new THREE.Mesh(headGeo, chromeMat);
  head.rotation.x = -Math.PI / 6;  // FIXED: negative angle to point down and forward
  head.position.set(0, s.height * 0.82, -s.depth / 2 + 0.27);
  applyShadows(head);
  group.add(head);
  
  // Shower head face (with spray pattern) - FIXED: matches head orientation
  const faceGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.005, 20);
  const faceMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.5 });
  const face = new THREE.Mesh(faceGeo, faceMat);
  face.rotation.x = -Math.PI / 6; // FIXED: negative to match head
  face.position.set(0, s.height * 0.8, -s.depth / 2 + 0.288);
  applyShadows(face);
  group.add(face);
  
  // Spray holes - FIXED: rotated to align with head, not flipped vertical
  for (let ring = 0; ring < 3; ring++) {
    const holesInRing = 6 + ring * 4;
    const ringRadius = 0.02 + ring * 0.02;
    for (let i = 0; i < holesInRing; i++) {
      const angle = (i / holesInRing) * Math.PI * 2;
      const holeGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.008, 6);
      const hole = new THREE.Mesh(holeGeo, new THREE.MeshStandardMaterial({ color: 0x2a2a2a }));
      hole.rotation.x = -Math.PI / 6; // FIXED: negative to align with head orientation
      const holeX = Math.cos(angle) * ringRadius;
      const holeY = Math.sin(angle) * ringRadius * Math.cos(-Math.PI / 6); // FIXED: use negative angle
      const holeZ = Math.sin(angle) * ringRadius * Math.sin(-Math.PI / 6); // FIXED: use negative angle
      hole.position.set(holeX, s.height * 0.8 + holeY, -s.depth / 2 + 0.29 + holeZ);
      group.add(hole);
    }
  }
  
  // Control panel (left wall, waist height)
  const panelGeo = new THREE.BoxGeometry(0.15, 0.25, 0.04);
  const panelMat2 = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.4 });
  const panel = new THREE.Mesh(panelGeo, panelMat2);
  panel.rotation.y = Math.PI / 2;
  panel.position.set(-s.width / 2 + 0.02, 1.1, -s.depth / 4);
  applyShadows(panel);
  group.add(panel);
  
  // Hot/cold knobs
  [-0.06, 0.06].forEach((yOff, i) => {
    const knobGeo = new THREE.CylinderGeometry(0.04, 0.035, 0.03, 20);
    const knobMat = new THREE.MeshStandardMaterial({ 
      color: i === 0 ? 0xff6666 : 0x6666ff,
      roughness: 0.3,
      metalness: 0.6
    });
    const knob = new THREE.Mesh(knobGeo, knobMat);
    knob.rotation.z = Math.PI / 2;
    knob.position.set(-s.width / 2 + 0.045, 1.1 + yOff, -s.depth / 4);
    applyShadows(knob);
    group.add(knob);
    
    // Knob indicator line
    const lineGeo = new THREE.BoxGeometry(0.025, 0.003, 0.002);
    const line = new THREE.Mesh(lineGeo, new THREE.MeshStandardMaterial({ color: 0xffffff }));
    line.position.set(-s.width / 2 + 0.06, 1.1 + yOff, -s.depth / 4);
    group.add(line);
  });
  
  // Position the group
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createShower.metadata = {
  category: 'bathroom',
  name: 'Shower',
  description: 'Shower stall with tiled floor and glass walls',
  dimensions: { width: 1, depth: 1, height: 2 },
  interactive: false
};

/**
 * Create a bathroom sink asset
 * @param {Object} spec - Asset specification
 * @param {Object} THREE - Three.js library reference
 * @param {Object} context - Context with scene, objects, gridSize
 * @returns {THREE.Group}
 */
function createBathroomSink(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const sinkWidth = 0.5;
  const sinkDepth = 0.4;
  const sinkHeight = 0.15;
  const height = 0.85;
  
  // Counter/base
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.5 });
  const baseGeo = new THREE.BoxGeometry(sinkWidth + 0.1, 0.05, sinkDepth + 0.1);
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = height;
  applyShadows(base);
  group.add(base);
  
  // Sink basin with proper oval shape - OUTER WALL (DEEPER)
  const porcelainMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.1 });
  const basinDepth = sinkHeight * 0.9; // INCREASED depth from 0.7 to 0.9
  
  // Outer basin (oval shaped)
  const outerBasinGeo = new THREE.SphereGeometry(sinkWidth * 0.45, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
  const outerPositions = outerBasinGeo.attributes.position;
  
  // Deform sphere into oval basin
  for (let i = 0; i < outerPositions.count; i++) {
    const x = outerPositions.getX(i);
    const y = outerPositions.getY(i);
    const z = outerPositions.getZ(i);
    
    // Scale z-axis to make it oval
    outerPositions.setZ(i, z * 0.75);
  }
  outerBasinGeo.computeVertexNormals();
  
  const outerBasin = new THREE.Mesh(outerBasinGeo, porcelainMat);
  outerBasin.scale.set(1, basinDepth / (sinkWidth * 0.45), 1);
  outerBasin.rotation.x = Math.PI;
  outerBasin.position.y = height + 0.02;
  applyShadows(outerBasin);
  group.add(outerBasin);
  
  // Inner basin (for thickness) - slightly smaller, BackSide
  const innerBasinGeo = new THREE.SphereGeometry(sinkWidth * 0.42, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
  const innerPositions = innerBasinGeo.attributes.position;
  
  for (let i = 0; i < innerPositions.count; i++) {
    const z = innerPositions.getZ(i);
    innerPositions.setZ(i, z * 0.75);
  }
  innerBasinGeo.computeVertexNormals();
  
  const innerBasinMat = new THREE.MeshStandardMaterial({ 
    color: 0xf5f5f5, 
    roughness: 0.15, 
    metalness: 0.1,
    side: THREE.BackSide 
  });
  const innerBasin = new THREE.Mesh(innerBasinGeo, innerBasinMat);
  innerBasin.scale.set(1, (basinDepth * 0.98) / (sinkWidth * 0.42), 1);
  innerBasin.rotation.x = Math.PI;
  innerBasin.position.y = height + 0.025;
  group.add(innerBasin);
  
  // Basin rim (oval torus)
  const rimGeo = new THREE.TorusGeometry(sinkWidth * 0.45, 0.015, 16, 32);
  const rim = new THREE.Mesh(rimGeo, porcelainMat);
  rim.scale.set(1, 1, 0.75); // Make oval
  rim.rotation.x = Math.PI / 2;
  rim.position.y = height + 0.02;
  applyShadows(rim);
  group.add(rim);
  
  // Drain with actual depth (3D pipe)
  const drainMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.6 });
  const drainPipeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7 });
  
  // Drain opening (circle at basin bottom)
  const drainGeo = new THREE.CircleGeometry(0.025, 24);
  const drain = new THREE.Mesh(drainGeo, drainMat);
  drain.rotation.x = -Math.PI / 2;
  drain.position.y = height - basinDepth + 0.03;
  group.add(drain);
  
  // Drain pipe (visible tube going down into basin)
  const drainPipeGeo = new THREE.CylinderGeometry(0.022, 0.018, 0.06, 16);
  const drainPipe = new THREE.Mesh(drainPipeGeo, drainPipeMat);
  drainPipe.position.y = height - basinDepth + 0.06;
  applyShadows(drainPipe);
  group.add(drainPipe);
  
  // Drain grate (cross bars)
  const grateBarGeo = new THREE.BoxGeometry(0.04, 0.002, 0.002);
  [0, Math.PI / 2].forEach(rot => {
    const bar = new THREE.Mesh(grateBarGeo, drainMat);
    bar.rotation.y = rot;
    bar.position.y = height - basinDepth + 0.035;
    group.add(bar);
  });
  
  // Faucet
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.3, metalness: 0.9 });
  const faucetBaseGeo = new THREE.CylinderGeometry(0.015, 0.02, 0.1, 8);
  const faucetBase = new THREE.Mesh(faucetBaseGeo, chromeMat);
  faucetBase.position.set(0, height + 0.05, -sinkDepth * 0.3);
  applyShadows(faucetBase);
  group.add(faucetBase);
  
  const faucetSpoutGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.15, 8);
  const faucetSpout = new THREE.Mesh(faucetSpoutGeo, chromeMat);
  faucetSpout.rotation.x = Math.PI / 4;
  faucetSpout.position.set(0, height + 0.15, -sinkDepth * 0.15);
  applyShadows(faucetSpout);
  group.add(faucetSpout);
  
  // Pedestal
  const pedestalGeo = new THREE.CylinderGeometry(0.15, 0.18, height, 8);
  const pedestal = new THREE.Mesh(pedestalGeo, porcelainMat);
  pedestal.position.y = height / 2;
  applyShadows(pedestal);
  group.add(pedestal);
  
  // Position the group
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createBathroomSink.metadata = {
  category: 'bathroom',
  name: 'Bathroom Sink',
  description: 'Pedestal sink with faucet',
  dimensions: { width: 0.5, depth: 0.4, height: 0.85 },
  interactive: false
};

/**
 * Create a bathtub asset with clawfoot feet
 */
function createBathtub(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const length = 1.6;
  const width = 0.75;
  const height = 0.6;
  const wallThickness = 0.04;
  
  const porcelainMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.1 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd0d0d0, roughness: 0.2, metalness: 0.9 });
  const brassFootMat = new THREE.MeshStandardMaterial({ color: 0xb8860b, roughness: 0.3, metalness: 0.8 });
  
  // Outer tub body (stretched hemisphere/ellipsoid) - FLIPPED TO CREATE BOWL
  // SQUASHED: Reduced Y-scale for shallower bowl
  const outerGeo = new THREE.SphereGeometry(width / 2, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
  const outer = new THREE.Mesh(outerGeo, porcelainMat);
  outer.scale.set(1, (height * 0.7) / (width / 2), length / width); // SQUASHED: 0.7 factor
  outer.rotation.x = Math.PI; // FLIP UPRIGHT - Create bowl shape
  outer.position.y = height * 0.35; // Lowered slightly
  applyShadows(outer);
  group.add(outer);
  
  // Inner tub (slightly smaller, BackSide to show thickness)
  const innerGeo = new THREE.SphereGeometry((width / 2) - wallThickness, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
  const innerMat = new THREE.MeshStandardMaterial({ 
    color: 0xf5f5f5, 
    roughness: 0.15, 
    metalness: 0.1,
    side: THREE.BackSide 
  });
  const inner = new THREE.Mesh(innerGeo, innerMat);
  inner.scale.set(1, ((height * 0.7) - wallThickness) / ((width / 2) - wallThickness), (length - wallThickness * 2) / (width - wallThickness * 2)); // SQUASHED
  inner.rotation.x = Math.PI; // FLIP UPRIGHT
  inner.position.y = height * 0.35 - wallThickness / 2;
  group.add(inner);
  
  // Top rim (oval-shaped torus)
  const rimGeo = new THREE.TorusGeometry((width / 2) + wallThickness / 4, wallThickness / 1.5, 16, 32);
  const rim = new THREE.Mesh(rimGeo, porcelainMat);
  rim.rotation.x = Math.PI / 2;
  rim.scale.set(1, length / width, 1);
  rim.position.y = height * 0.35; // Adjusted for squashed bowl
  applyShadows(rim);
  group.add(rim);
  
  // Bottom cap to close geometry (oval disc)
  const bottomCapGeo = new THREE.CircleGeometry(width / 2, 32);
  const bottomCap = new THREE.Mesh(bottomCapGeo, porcelainMat);
  bottomCap.scale.set(1, length / width, 1);
  bottomCap.rotation.x = Math.PI / 2;
  bottomCap.position.y = height * 0.35 - height * 0.7 + 0.01; // Adjusted for squashed bowl
  applyShadows(bottomCap);
  group.add(bottomCap);
  
  // Clawfoot feet (4) - BETTER ALIGNED to tub corners
  const footPositions = [
    [-(length / 2 - 0.1), -(width / 2 - 0.08)], // Back left
    [(length / 2 - 0.1), -(width / 2 - 0.08)],  // Front left
    [-(length / 2 - 0.1), (width / 2 - 0.08)],  // Back right
    [(length / 2 - 0.1), (width / 2 - 0.08)]    // Front right
  ];
  
  footPositions.forEach(([z, x]) => {
    // Leg - taller to account for squashed bowl
    const legGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.18, 12);
    const leg = new THREE.Mesh(legGeo, brassFootMat);
    leg.position.set(x, 0.09, z);
    applyShadows(leg);
    group.add(leg);
    
    // Claw foot
    const clawGeo = new THREE.SphereGeometry(0.04, 12, 12);
    const claw = new THREE.Mesh(clawGeo, brassFootMat);
    claw.scale.set(1.2, 0.6, 1.5);
    claw.position.set(x, 0.024, z);
    applyShadows(claw);
    group.add(claw);
    
    // Claw toes (3 per foot)
    for (let i = 0; i < 3; i++) {
      const toeGeo = new THREE.SphereGeometry(0.015, 8, 8);
      const toe = new THREE.Mesh(toeGeo, brassFootMat);
      const toeAngle = ((i - 1) / 3) * Math.PI / 3;
      toe.scale.set(0.8, 0.5, 1.5);
      toe.position.set(
        x + Math.sin(toeAngle) * 0.035,
        0.01,
        z + (z > 0 ? 0.05 : -0.05) + Math.cos(toeAngle) * 0.02
      );
      group.add(toe);
    }
  });
  
  // Faucet mount (at rim level, near back wall)
  const faucetHeight = height * 0.35; // At rim level (adjusted for squash)
  const mountGeo = new THREE.CylinderGeometry(0.035, 0.04, 0.06, 16);
  const mount = new THREE.Mesh(mountGeo, chromeMat);
  mount.position.set(0, faucetHeight + 0.03, -length / 2 + 0.1);
  applyShadows(mount);
  group.add(mount);
  
  // Hot water pipe
  const hotPipeGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 12);
  const hotPipe = new THREE.Mesh(hotPipeGeo, chromeMat);
  hotPipe.position.set(-0.12, faucetHeight + 0.155, -length / 2 + 0.1);
  applyShadows(hotPipe);
  group.add(hotPipe);
  
  // Cold water pipe
  const coldPipe = hotPipe.clone();
  coldPipe.position.set(0.12, faucetHeight + 0.155, -length / 2 + 0.1);
  applyShadows(coldPipe);
  group.add(coldPipe);
  
  // Hot/Cold knobs
  const hotKnobMat = new THREE.MeshStandardMaterial({ color: 0xcc4444, roughness: 0.3, metalness: 0.7 });
  const coldKnobMat = new THREE.MeshStandardMaterial({ color: 0x4444cc, roughness: 0.3, metalness: 0.7 });
  
  // Hot knob
  const knobGeo = new THREE.CylinderGeometry(0.03, 0.025, 0.025, 16);
  const hotKnob = new THREE.Mesh(knobGeo, hotKnobMat);
  hotKnob.rotation.x = Math.PI / 2;
  hotKnob.position.set(-0.12, faucetHeight + 0.16, -length / 2 + 0.13);
  applyShadows(hotKnob);
  group.add(hotKnob);
  
  // Hot indicator (H)
  const hLabelGeo = new THREE.CircleGeometry(0.012, 16);
  const hLabel = new THREE.Mesh(hLabelGeo, new THREE.MeshStandardMaterial({ color: 0xffffff }));
  hLabel.position.set(-0.12, faucetHeight + 0.16, -length / 2 + 0.145);
  group.add(hLabel);
  
  // Cold knob
  const coldKnob = new THREE.Mesh(knobGeo, coldKnobMat);
  coldKnob.rotation.x = Math.PI / 2;
  coldKnob.position.set(0.12, faucetHeight + 0.16, -length / 2 + 0.13);
  applyShadows(coldKnob);
  group.add(coldKnob);
  
  // Cold indicator (C)
  const cLabel = hLabel.clone();
  cLabel.position.set(0.12, faucetHeight + 0.16, -length / 2 + 0.145);
  group.add(cLabel);
  
  // Spout (curved arc)
  const spoutArcGeo = new THREE.TorusGeometry(0.08, 0.015, 12, 16, Math.PI / 1.5);
  const spoutArc = new THREE.Mesh(spoutArcGeo, chromeMat);
  spoutArc.rotation.x = Math.PI / 2;
  spoutArc.rotation.y = Math.PI;
  spoutArc.position.set(0, faucetHeight + 0.12, -length / 2 + 0.1);
  applyShadows(spoutArc);
  group.add(spoutArc);
  
  // Spout end (downward facing)
  const spoutEndGeo = new THREE.CylinderGeometry(0.018, 0.022, 0.05, 12);
  const spoutEnd = new THREE.Mesh(spoutEndGeo, chromeMat);
  spoutEnd.position.set(0, faucetHeight + 0.05, -length / 2 + 0.18);
  applyShadows(spoutEnd);
  group.add(spoutEnd);
  
  // Drain (center of tub bottom - NOW at actual bottom)
  const drainGeo = new THREE.CylinderGeometry(0.025, 0.02, 0.015, 16);
  const drainMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.4, metalness: 0.6 });
  const drain = new THREE.Mesh(drainGeo, drainMat);
  drain.position.y = height * 0.4 - height + 0.02; // Bottom of bowl
  applyShadows(drain);
  group.add(drain);
  
  // Drain holes (cross pattern)
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const holeGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.02, 8);
    const hole = new THREE.Mesh(holeGeo, new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
    hole.position.set(
      Math.cos(angle) * 0.015,
      height * 0.4 + wallThickness / 2,
      Math.sin(angle) * 0.015
    );
    group.add(hole);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createBathtub.metadata = {
  category: 'bathroom',
  name: 'Bathtub',
  description: 'Clawfoot bathtub with faucet and knobs',
  dimensions: { width: 0.75, depth: 1.6, height: 0.8 },
  interactive: false
};

/**
 * Create a toothbrush with instanced bristles
 */
function createToothbrush(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const handleColor = spec.color || 0x4488ff;
  const handleLength = 0.18;
  
  // Handle (slightly ergonomic curve)
  const handleMat = new THREE.MeshStandardMaterial({ 
    color: handleColor, 
    roughness: 0.4,
    metalness: 0.1 
  });
  
  // Main handle shaft
  const handleGeo = new THREE.CylinderGeometry(0.006, 0.008, handleLength, 12);
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.position.y = handleLength / 2;
  applyShadows(handle);
  group.add(handle);
  
  // Grip texture (rubber ridges)
  const gripMat = new THREE.MeshStandardMaterial({ 
    color: 0x333333, 
    roughness: 0.9 
  });
  for (let i = 0; i < 6; i++) {
    const ringGeo = new THREE.TorusGeometry(0.008, 0.0015, 6, 12);
    const ring = new THREE.Mesh(ringGeo, gripMat);
    ring.position.y = 0.05 + i * 0.012;
    group.add(ring);
  }
  
  // Brush head base
  const headGeo = new THREE.BoxGeometry(0.025, 0.008, 0.012);
  const headMat = new THREE.MeshStandardMaterial({ 
    color: handleColor, 
    roughness: 0.5 
  });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = handleLength + 0.004;
  applyShadows(head);
  group.add(head);
  
  // BRISTLES using InstancedMesh for performance
  const bristleCount = 180;
  const bristleGeo = new THREE.CylinderGeometry(0.0003, 0.0002, 0.01, 4);
  const bristleMat = new THREE.MeshStandardMaterial({ 
    color: 0xeeeeee, 
    roughness: 0.8 
  });
  
  const bristles = new THREE.InstancedMesh(bristleGeo, bristleMat, bristleCount);
  const dummy = new THREE.Object3D();
  
  let bristleIndex = 0;
  const rows = 12;
  const cols = 15;
  const spacing = 0.0015;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (bristleIndex >= bristleCount) break;
      
      const x = -0.011 + col * spacing;
      const z = -0.005 + row * spacing;
      const heightVariation = Math.random() * 0.002;
      const y = handleLength + 0.008 + 0.005 + heightVariation;
      
      dummy.position.set(x, y, z);
      dummy.rotation.set(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        0
      );
      dummy.updateMatrix();
      bristles.setMatrixAt(bristleIndex, dummy.matrix);
      
      bristleIndex++;
    }
  }
  
  bristles.castShadow = true;
  bristles.receiveShadow = true;
  group.add(bristles);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createToothbrush.metadata = {
  category: 'bathroom',
  name: 'Toothbrush',
  description: 'Toothbrush with realistic instanced bristles',
  dimensions: { width: 0.025, height: 0.2, depth: 0.012 },
  interactive: false
};

/**
 * Create a hairbrush with instanced bristles
 */
function createHairbrush(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const handleColor = spec.color || 0x8b4513;
  
  // Handle (wooden)
  const handleMat = new THREE.MeshStandardMaterial({ 
    color: handleColor, 
    roughness: 0.7 
  });
  
  const handleGeo = new THREE.CylinderGeometry(0.012, 0.015, 0.12, 16);
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.position.y = 0.06;
  applyShadows(handle);
  group.add(handle);
  
  // Handle end cap
  const capGeo = new THREE.SphereGeometry(0.015, 12, 12);
  const cap = new THREE.Mesh(capGeo, handleMat);
  cap.position.y = 0.001;
  applyShadows(cap);
  group.add(cap);
  
  // Brush head base (oval)
  const headGeo = new THREE.BoxGeometry(0.08, 0.012, 0.045);
  const positions = headGeo.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    const dist = Math.sqrt(x * x + z * z);
    if (dist > 0.035) {
      const factor = 0.8;
      positions.setX(i, x * factor);
      positions.setZ(i, z * factor);
    }
  }
  headGeo.computeVertexNormals();
  
  const head = new THREE.Mesh(headGeo, handleMat);
  head.position.y = 0.126;
  applyShadows(head);
  group.add(head);
  
  // Cushioned pad
  const padGeo = new THREE.BoxGeometry(0.07, 0.006, 0.04);
  const padMat = new THREE.MeshStandardMaterial({ 
    color: 0x222222, 
    roughness: 0.9 
  });
  const pad = new THREE.Mesh(padGeo, padMat);
  pad.position.y = 0.135;
  group.add(pad);
  
  // BRISTLES using InstancedMesh
  const bristleCount = 320;
  const bristleGeo = new THREE.CylinderGeometry(0.0005, 0.0003, 0.018, 4);
  const bristleMat = new THREE.MeshStandardMaterial({ 
    color: 0x333333, 
    roughness: 0.8 
  });
  
  const bristles = new THREE.InstancedMesh(bristleGeo, bristleMat, bristleCount);
  const dummy = new THREE.Object3D();
  
  let bristleIndex = 0;
  const rows = 16;
  const cols = 20;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (bristleIndex >= bristleCount) break;
      
      const x = -0.03 + (col / cols) * 0.06;
      const z = -0.018 + (row / rows) * 0.036;
      
      // Check if within oval bounds
      const normalizedX = x / 0.035;
      const normalizedZ = z / 0.02;
      if (normalizedX * normalizedX + normalizedZ * normalizedZ > 1) continue;
      
      const heightVariation = Math.random() * 0.003;
      const y = 0.138 + 0.009 + heightVariation;
      
      dummy.position.set(x, y, z);
      dummy.rotation.set(
        (Math.random() - 0.5) * 0.15,
        (Math.random() - 0.5) * 0.15,
        0
      );
      dummy.updateMatrix();
      bristles.setMatrixAt(bristleIndex, dummy.matrix);
      
      bristleIndex++;
    }
  }
  
  bristles.castShadow = true;
  bristles.receiveShadow = true;
  group.add(bristles);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createHairbrush.metadata = {
  category: 'bathroom',
  name: 'Hairbrush',
  description: 'Hairbrush with wooden handle and instanced bristles',
  dimensions: { width: 0.08, height: 0.15, depth: 0.045 },
  interactive: false
};

/**
 * Create a deodorant stick
 */
function createDeodorant(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const height = 0.12;
  const radius = 0.025;
  
  // Main container (plastic)
  const containerMat = new THREE.MeshStandardMaterial({ 
    color: 0x4488ff, 
    roughness: 0.3,
    metalness: 0.2 
  });
  
  const containerGeo = new THREE.CylinderGeometry(radius, radius * 0.95, height, 24);
  const container = new THREE.Mesh(containerGeo, containerMat);
  container.position.y = height / 2;
  applyShadows(container);
  group.add(container);
  
  // Cap (removable look)
  const capGeo = new THREE.CylinderGeometry(radius * 1.05, radius, height * 0.4, 24);
  const capMat = new THREE.MeshStandardMaterial({ 
    color: 0x2255aa, 
    roughness: 0.4 
  });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.y = height + height * 0.2;
  applyShadows(cap);
  group.add(cap);
  
  // Cap top
  const capTopGeo = new THREE.CylinderGeometry(radius * 1.05, radius * 1.05, 0.008, 24);
  const capTop = new THREE.Mesh(capTopGeo, capMat);
  capTop.position.y = height + height * 0.4;
  group.add(capTop);
  
  // Label area
  const labelGeo = new THREE.CylinderGeometry(radius + 0.001, radius + 0.001, height * 0.5, 24);
  const labelMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    roughness: 0.6 
  });
  const label = new THREE.Mesh(labelGeo, labelMat);
  label.position.y = height / 2;
  group.add(label);
  
  // Dial at bottom
  const dialGeo = new THREE.CylinderGeometry(radius * 0.98, radius * 0.98, 0.015, 24);
  const dialMat = new THREE.MeshStandardMaterial({ 
    color: 0xeeeeee, 
    roughness: 0.5 
  });
  const dial = new THREE.Mesh(dialGeo, dialMat);
  dial.position.y = 0.0075;
  applyShadows(dial);
  group.add(dial);
  
  // Grip notches on dial
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const notchGeo = new THREE.BoxGeometry(0.003, 0.015, 0.008);
    const notch = new THREE.Mesh(notchGeo, dialMat);
    notch.position.set(
      Math.cos(angle) * radius * 0.9,
      0.0075,
      Math.sin(angle) * radius * 0.9
    );
    notch.rotation.y = angle;
    group.add(notch);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createDeodorant.metadata = {
  category: 'bathroom',
  name: 'Deodorant',
  description: 'Stick deodorant with twist dial',
  dimensions: { width: 0.05, height: 0.16, depth: 0.05 },
  interactive: false
};

/**
 * Create a lipstick tube
 */
function createLipstick(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const tubeColor = spec.tubeColor || 0xff1493;
  const lipstickColor = spec.lipstickColor || 0xff0066;
  const height = 0.08;
  const radius = 0.008;
  
  // Main tube body (metallic)
  const tubeMat = new THREE.MeshStandardMaterial({ 
    color: tubeColor, 
    roughness: 0.2,
    metalness: 0.8 
  });
  
  const tubeGeo = new THREE.CylinderGeometry(radius, radius, height, 16);
  const tube = new THREE.Mesh(tubeGeo, tubeMat);
  tube.position.y = height / 2;
  applyShadows(tube);
  group.add(tube);
  
  // Cap (shiny)
  const capGeo = new THREE.CylinderGeometry(radius * 1.15, radius, height * 0.5, 16);
  const cap = new THREE.Mesh(capGeo, tubeMat);
  cap.position.y = height + height * 0.25;
  applyShadows(cap);
  group.add(cap);
  
  // Cap top
  const capTopGeo = new THREE.SphereGeometry(radius * 1.15, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const capTop = new THREE.Mesh(capTopGeo, tubeMat);
  capTop.position.y = height + height * 0.5;
  group.add(capTop);
  
  // Lipstick stick (extends from tube)
  const stickHeight = 0.02;
  const lipstickMat = new THREE.MeshStandardMaterial({ 
    color: lipstickColor, 
    roughness: 0.3,
    metalness: 0.1 
  });
  
  const stickGeo = new THREE.CylinderGeometry(radius * 0.7, radius * 0.7, stickHeight, 16);
  const stick = new THREE.Mesh(stickGeo, lipstickMat);
  stick.position.y = height + stickHeight / 2;
  applyShadows(stick);
  group.add(stick);
  
  // Angled top of lipstick
  const topGeo = new THREE.CylinderGeometry(radius * 0.1, radius * 0.7, radius * 0.7, 16);
  const top = new THREE.Mesh(topGeo, lipstickMat);
  top.position.y = height + stickHeight + radius * 0.35;
  group.add(top);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createLipstick.metadata = {
  category: 'bathroom',
  name: 'Lipstick',
  description: 'Lipstick tube with angled tip',
  dimensions: { width: 0.016, height: 0.12, depth: 0.016 },
  interactive: false
};

/**
 * Create a makeup mirror (compact)
 */
function createMakeupMirror(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const size = 0.08;
  const thickness = 0.008;
  
  // Base (bottom half of compact)
  const baseMat = new THREE.MeshStandardMaterial({ 
    color: 0xffc0cb, 
    roughness: 0.4,
    metalness: 0.3 
  });
  
  const baseGeo = new THREE.CylinderGeometry(size / 2, size / 2, thickness, 32);
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = thickness / 2;
  applyShadows(base);
  group.add(base);
  
  // Decorative pattern on base
  const patternGeo = new THREE.TorusGeometry(size / 2 - 0.008, 0.001, 8, 32);
  const patternMat = new THREE.MeshStandardMaterial({ 
    color: 0xffb6c1, 
    roughness: 0.3,
    metalness: 0.5 
  });
  const pattern = new THREE.Mesh(patternGeo, patternMat);
  pattern.rotation.x = Math.PI / 2;
  pattern.position.y = thickness;
  group.add(pattern);
  
  // Hinge (small cylinder)
  const hingeMat = new THREE.MeshStandardMaterial({ 
    color: 0x888888, 
    roughness: 0.3,
    metalness: 0.8 
  });
  const hingeGeo = new THREE.CylinderGeometry(0.003, 0.003, size * 0.3, 12);
  const hinge = new THREE.Mesh(hingeGeo, hingeMat);
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, thickness, -size / 2 + 0.005);
  group.add(hinge);
  
  // Mirror lid (top half - open at angle)
  const lidGroup = new THREE.Group();
  
  const lidGeo = new THREE.CylinderGeometry(size / 2, size / 2, thickness / 2, 32);
  const lid = new THREE.Mesh(lidGeo, baseMat);
  applyShadows(lid);
  lidGroup.add(lid);
  
  // Mirror surface (reflective)
  const mirrorGeo = new THREE.CircleGeometry(size / 2 - 0.004, 32);
  const mirrorMat = new THREE.MeshStandardMaterial({ 
    color: 0xdddddd, 
    roughness: 0.05,
    metalness: 0.95 
  });
  const mirror = new THREE.Mesh(mirrorGeo, mirrorMat);
  mirror.rotation.x = Math.PI / 2;
  mirror.position.y = -thickness / 4;
  lidGroup.add(mirror);
  
  // Position lid (open at 100 degrees)
  lidGroup.position.set(0, thickness, -size / 2 + 0.005);
  lidGroup.rotation.x = -Math.PI * 0.55; // Open angle
  group.add(lidGroup);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createMakeupMirror.metadata = {
  category: 'bathroom',
  name: 'Makeup Mirror',
  description: 'Compact makeup mirror in open position',
  dimensions: { width: 0.08, height: 0.08, depth: 0.08 },
  interactive: false
};

// Export all bathroom creators
export const creators = {
  toilet: createToilet,
  shower: createShower,
  bathroomsink: createBathroomSink,
  bathtub: createBathtub,
  toothbrush: createToothbrush,
  hairbrush: createHairbrush,
  deodorant: createDeodorant,
  lipstick: createLipstick,
  makeupmirror: createMakeupMirror,
  compact: createMakeupMirror
};

