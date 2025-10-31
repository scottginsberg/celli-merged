// ==================== PETS ASSET CREATORS ====================
// Pet habitats, accessories, and food items

import { createPositionedGroup, applyShadows } from '../asset-context.js';

/**
 * Create a hamster cage with detailed accessories
 */
function createHamsterCage(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const cageWidth = 0.4;
  const cageHeight = 0.25;
  const cageDepth = 0.25;
  
  // Base tray (plastic)
  const baseMat = new THREE.MeshStandardMaterial({ 
    color: 0x87ceeb, 
    roughness: 0.4,
    metalness: 0.1
  });
  
  const baseGeo = new THREE.BoxGeometry(cageWidth, 0.04, cageDepth);
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.02;
  applyShadows(base);
  group.add(base);
  
  // Base lip/edge
  const lipGeo = new THREE.BoxGeometry(cageWidth + 0.01, 0.01, cageDepth + 0.01);
  const lip = new THREE.Mesh(lipGeo, baseMat);
  lip.position.y = 0.045;
  applyShadows(lip);
  group.add(lip);
  
  // Wire bars (vertical)
  const wireMat = new THREE.MeshStandardMaterial({ 
    color: 0x444444, 
    roughness: 0.3,
    metalness: 0.8
  });
  
  const barRadius = 0.002;
  const barHeight = cageHeight - 0.05;
  const barSpacing = 0.02;
  
  // Front and back bars
  for (let side = 0; side < 2; side++) {
    const z = side === 0 ? cageDepth / 2 : -cageDepth / 2;
    const barCount = Math.floor(cageWidth / barSpacing);
    
    for (let i = 0; i < barCount; i++) {
      const barGeo = new THREE.CylinderGeometry(barRadius, barRadius, barHeight, 8);
      const bar = new THREE.Mesh(barGeo, wireMat);
      bar.position.set(
        -cageWidth / 2 + (i / (barCount - 1)) * cageWidth,
        0.05 + barHeight / 2,
        z
      );
      applyShadows(bar);
      group.add(bar);
    }
  }
  
  // Side bars
  for (let side = 0; side < 2; side++) {
    const x = side === 0 ? cageWidth / 2 : -cageWidth / 2;
    const barCount = Math.floor(cageDepth / barSpacing);
    
    for (let i = 0; i < barCount; i++) {
      const barGeo = new THREE.CylinderGeometry(barRadius, barRadius, barHeight, 8);
      const bar = new THREE.Mesh(barGeo, wireMat);
      bar.position.set(
        x,
        0.05 + barHeight / 2,
        -cageDepth / 2 + (i / (barCount - 1)) * cageDepth
      );
      applyShadows(bar);
      group.add(bar);
    }
  }
  
  // Horizontal cross bars (3 levels)
  for (let level = 0; level < 3; level++) {
    const y = 0.05 + (level / 2) * barHeight;
    
    // Front/back horizontal bars
    for (let side = 0; side < 2; side++) {
      const z = side === 0 ? cageDepth / 2 : -cageDepth / 2;
      const hBarGeo = new THREE.CylinderGeometry(barRadius, barRadius, cageWidth, 8);
      const hBar = new THREE.Mesh(hBarGeo, wireMat);
      hBar.rotation.z = Math.PI / 2;
      hBar.position.set(0, y, z);
      group.add(hBar);
    }
    
    // Side horizontal bars
    for (let side = 0; side < 2; side++) {
      const x = side === 0 ? cageWidth / 2 : -cageWidth / 2;
      const hBarGeo = new THREE.CylinderGeometry(barRadius, barRadius, cageDepth, 8);
      const hBar = new THREE.Mesh(hBarGeo, wireMat);
      hBar.rotation.x = Math.PI / 2;
      hBar.position.set(x, y, 0);
      group.add(hBar);
    }
  }
  
  // Top frame
  const topFrameGeo = new THREE.BoxGeometry(cageWidth + 0.015, 0.008, 0.008);
  [cageDepth / 2, -cageDepth / 2].forEach(z => {
    const frame = new THREE.Mesh(topFrameGeo, wireMat);
    frame.position.set(0, cageHeight, z);
    applyShadows(frame);
    group.add(frame);
  });
  
  const topFrameGeo2 = new THREE.BoxGeometry(0.008, 0.008, cageDepth + 0.015);
  [cageWidth / 2, -cageWidth / 2].forEach(x => {
    const frame = new THREE.Mesh(topFrameGeo2, wireMat);
    frame.position.set(x, cageHeight, 0);
    applyShadows(frame);
    group.add(frame);
  });
  
  // FOOD BOWL (ceramic)
  const bowlMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    roughness: 0.3,
    metalness: 0.1
  });
  
  const bowlRadius = 0.03;
  const bowlHeight = 0.015;
  
  const bowlGeo = new THREE.CylinderGeometry(bowlRadius, bowlRadius * 0.7, bowlHeight, 24);
  const bowl = new THREE.Mesh(bowlGeo, bowlMat);
  bowl.position.set(-cageWidth / 3, 0.04 + bowlHeight / 2, cageDepth / 3);
  applyShadows(bowl);
  group.add(bowl);
  
  // Bowl inner (darker)
  const innerGeo = new THREE.CylinderGeometry(bowlRadius * 0.9, bowlRadius * 0.6, bowlHeight * 0.9, 24, 1, true);
  const innerMat = new THREE.MeshStandardMaterial({ 
    color: 0xf0f0f0, 
    roughness: 0.4,
    side: THREE.DoubleSide
  });
  const inner = new THREE.Mesh(innerGeo, innerMat);
  inner.position.copy(bowl.position);
  group.add(inner);
  
  // WOOD CHIPS - Using InstancedMesh for performance
  const chipCount = 400;
  const chipGeo = new THREE.BoxGeometry(0.005, 0.002, 0.003);
  const chipMat = new THREE.MeshStandardMaterial({ 
    color: 0xd4a76a, 
    roughness: 0.9
  });
  
  const chips = new THREE.InstancedMesh(chipGeo, chipMat, chipCount);
  const dummy = new THREE.Object3D();
  
  for (let i = 0; i < chipCount; i++) {
    // Distribute chips across cage floor
    const x = (Math.random() - 0.5) * (cageWidth - 0.05);
    const z = (Math.random() - 0.5) * (cageDepth - 0.05);
    const y = 0.04 + Math.random() * 0.01;
    
    dummy.position.set(x, y, z);
    dummy.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    dummy.scale.set(
      0.8 + Math.random() * 0.4,
      0.8 + Math.random() * 0.4,
      0.8 + Math.random() * 0.4
    );
    dummy.updateMatrix();
    chips.setMatrixAt(i, dummy.matrix);
  }
  
  chips.castShadow = true;
  chips.receiveShadow = true;
  group.add(chips);
  
  // WATER DISPENSER (bottle)
  const bottleMat = new THREE.MeshStandardMaterial({ 
    color: 0x88ccff, 
    transparent: true,
    opacity: 0.4,
    roughness: 0.1,
    metalness: 0.1
  });
  
  const bottleRadius = 0.02;
  const bottleHeight = 0.12;
  
  const bottleGeo = new THREE.CylinderGeometry(bottleRadius, bottleRadius, bottleHeight, 16);
  const bottle = new THREE.Mesh(bottleGeo, bottleMat);
  bottle.position.set(cageWidth / 2 - 0.01, 0.05 + bottleHeight / 2, 0);
  applyShadows(bottle);
  group.add(bottle);
  
  // Bottle cap (metal)
  const capGeo = new THREE.CylinderGeometry(bottleRadius * 1.1, bottleRadius, 0.015, 16);
  const capMat = new THREE.MeshStandardMaterial({ 
    color: 0xcccccc, 
    roughness: 0.3,
    metalness: 0.8
  });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.set(bottle.position.x, 0.05 + bottleHeight + 0.0075, bottle.position.z);
  applyShadows(cap);
  group.add(cap);
  
  // Water inside bottle
  const waterGeo = new THREE.CylinderGeometry(bottleRadius * 0.9, bottleRadius * 0.9, bottleHeight * 0.7, 16);
  const waterMat = new THREE.MeshStandardMaterial({ 
    color: 0x4488ff, 
    transparent: true,
    opacity: 0.3,
    roughness: 0.1
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.set(bottle.position.x, 0.05 + bottleHeight * 0.35, bottle.position.z);
  group.add(water);
  
  // Metal drinking tube
  const tubeGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.05, 8);
  const tube = new THREE.Mesh(tubeGeo, wireMat);
  tube.position.set(bottle.position.x, 0.05 + 0.025, bottle.position.z - bottleRadius - 0.003);
  applyShadows(tube);
  group.add(tube);
  
  // Ball bearing at tube end
  const ballGeo = new THREE.SphereGeometry(0.004, 12, 12);
  const ball = new THREE.Mesh(ballGeo, wireMat);
  ball.position.set(tube.position.x, 0.05 + 0.002, tube.position.z);
  group.add(ball);
  
  // HAMSTER WHEEL
  const wheelRadius = 0.08;
  const wheelWidth = 0.05;
  const wheelX = cageWidth / 4;
  
  // Wheel outer rim
  const rimGeo = new THREE.TorusGeometry(wheelRadius, 0.003, 12, 24);
  const rim1 = new THREE.Mesh(rimGeo, wireMat);
  rim1.rotation.y = Math.PI / 2;
  rim1.position.set(wheelX, 0.05 + wheelRadius, -cageDepth / 4);
  applyShadows(rim1);
  group.add(rim1);
  
  const rim2 = rim1.clone();
  rim2.position.x = wheelX + wheelWidth;
  group.add(rim2);
  
  // Wheel rungs (bars)
  const rungCount = 24;
  for (let i = 0; i < rungCount; i++) {
    const angle = (i / rungCount) * Math.PI * 2;
    const rungGeo = new THREE.BoxGeometry(wheelWidth, 0.003, 0.008);
    const rung = new THREE.Mesh(rungGeo, wireMat);
    rung.position.set(
      wheelX + wheelWidth / 2,
      0.05 + wheelRadius + Math.sin(angle) * wheelRadius,
      -cageDepth / 4 + Math.cos(angle) * wheelRadius
    );
    rung.rotation.set(0, Math.PI / 2, angle);
    group.add(rung);
  }
  
  // Wheel axle
  const axleGeo = new THREE.CylinderGeometry(0.004, 0.004, wheelWidth + 0.02, 12);
  const axle = new THREE.Mesh(axleGeo, wireMat);
  axle.rotation.z = Math.PI / 2;
  axle.position.set(wheelX + wheelWidth / 2, 0.05 + wheelRadius, -cageDepth / 4);
  applyShadows(axle);
  group.add(axle);
  
  // Wheel stand
  const standGeo = new THREE.CylinderGeometry(0.006, 0.008, 0.08, 8);
  const stand1 = new THREE.Mesh(standGeo, wireMat);
  stand1.position.set(wheelX, 0.05 + 0.04, -cageDepth / 4);
  applyShadows(stand1);
  group.add(stand1);
  
  const stand2 = stand1.clone();
  stand2.position.x = wheelX + wheelWidth;
  group.add(stand2);
  
  // Support bars
  for (let side = 0; side < 2; side++) {
    const supportGeo = new THREE.CylinderGeometry(0.003, 0.003, wheelRadius * 0.7, 8);
    const support = new THREE.Mesh(supportGeo, wireMat);
    support.position.set(
      side === 0 ? wheelX : wheelX + wheelWidth,
      0.05 + wheelRadius * 0.5,
      -cageDepth / 4
    );
    support.rotation.set(0, 0, Math.PI / 6);
    group.add(support);
  }
  
  // Door (wire frame on front)
  const doorWidth = 0.15;
  const doorHeight = 0.15;
  const doorFrameGeo = new THREE.BoxGeometry(doorWidth, doorHeight, 0.004);
  const doorFrameMat = new THREE.MeshStandardMaterial({ 
    color: 0x666666, 
    roughness: 0.4,
    metalness: 0.7
  });
  const doorFrame = new THREE.Mesh(doorFrameGeo, doorFrameMat);
  doorFrame.position.set(0, 0.05 + doorHeight / 2 + 0.02, cageDepth / 2 + 0.002);
  applyShadows(doorFrame);
  group.add(doorFrame);
  
  // Door latch
  const latchGeo = new THREE.BoxGeometry(0.015, 0.03, 0.005);
  const latch = new THREE.Mesh(latchGeo, wireMat);
  latch.position.set(doorWidth / 2 - 0.01, doorFrame.position.y, doorFrame.position.z + 0.003);
  group.add(latch);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createHamsterCage.metadata = {
  category: 'pets',
  name: 'Hamster Cage',
  description: 'Complete hamster cage with wheel, food bowl, water dispenser, and wood chips',
  dimensions: { width: 0.4, height: 0.25, depth: 0.25 },
  interactive: false
};

/**
 * Create a bird cage with detailed bars and perches
 */
function createBirdCage(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const cageRadius = 0.15;
  const cageHeight = 0.35;
  
  // Base tray (removable)
  const baseMat = new THREE.MeshStandardMaterial({ 
    color: 0x2a2a2a, 
    roughness: 0.5,
    metalness: 0.3
  });
  
  const baseGeo = new THREE.CylinderGeometry(cageRadius + 0.01, cageRadius + 0.015, 0.03, 32);
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.015;
  applyShadows(base);
  group.add(base);
  
  // Base rim
  const rimGeo = new THREE.TorusGeometry(cageRadius + 0.01, 0.005, 8, 32);
  const rim = new THREE.Mesh(rimGeo, baseMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.03;
  group.add(rim);
  
  // Vertical bars (wire)
  const wireMat = new THREE.MeshStandardMaterial({ 
    color: 0xdddddd, 
    roughness: 0.2,
    metalness: 0.9
  });
  
  const barCount = 32;
  const barRadius = 0.002;
  const barHeight = cageHeight - 0.03;
  
  for (let i = 0; i < barCount; i++) {
    const angle = (i / barCount) * Math.PI * 2;
    const barGeo = new THREE.CylinderGeometry(barRadius, barRadius, barHeight, 8);
    const bar = new THREE.Mesh(barGeo, wireMat);
    bar.position.set(
      Math.cos(angle) * cageRadius,
      0.03 + barHeight / 2,
      Math.sin(angle) * cageRadius
    );
    applyShadows(bar);
    group.add(bar);
  }
  
  // Horizontal rings (5 levels)
  for (let level = 0; level < 5; level++) {
    const y = 0.03 + (level / 4) * barHeight;
    const ringGeo = new THREE.TorusGeometry(cageRadius, barRadius * 1.5, 8, 32);
    const ring = new THREE.Mesh(ringGeo, wireMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    group.add(ring);
  }
  
  // Domed top
  const domeHeight = 0.12;
  const domeBarCount = 16;
  
  for (let i = 0; i < domeBarCount; i++) {
    const angle = (i / domeBarCount) * Math.PI * 2;
    
    // Create curved bar using multiple segments
    const segments = 12;
    for (let j = 0; j < segments - 1; j++) {
      const t1 = j / segments;
      const t2 = (j + 1) / segments;
      
      const r1 = cageRadius * Math.cos(t1 * Math.PI / 2);
      const y1 = cageHeight + domeHeight * Math.sin(t1 * Math.PI / 2);
      const r2 = cageRadius * Math.cos(t2 * Math.PI / 2);
      const y2 = cageHeight + domeHeight * Math.sin(t2 * Math.PI / 2);
      
      const segLength = Math.sqrt((r2 - r1) ** 2 + (y2 - y1) ** 2);
      const segAngle = Math.atan2(y2 - y1, r2 - r1);
      
      const segGeo = new THREE.CylinderGeometry(barRadius, barRadius, segLength, 6);
      const seg = new THREE.Mesh(segGeo, wireMat);
      
      seg.position.set(
        Math.cos(angle) * (r1 + r2) / 2,
        (y1 + y2) / 2,
        Math.sin(angle) * (r1 + r2) / 2
      );
      seg.rotation.set(0, angle - Math.PI / 2, segAngle);
      
      group.add(seg);
    }
  }
  
  // Top ring
  const topRingGeo = new THREE.TorusGeometry(0.015, 0.008, 8, 16);
  const topRing = new THREE.Mesh(topRingGeo, wireMat);
  topRing.rotation.x = Math.PI / 2;
  topRing.position.y = cageHeight + domeHeight;
  applyShadows(topRing);
  group.add(topRing);
  
  // Hanging hook
  const hookGeo = new THREE.TorusGeometry(0.012, 0.003, 8, 16, Math.PI);
  const hook = new THREE.Mesh(hookGeo, wireMat);
  hook.position.y = cageHeight + domeHeight + 0.015;
  applyShadows(hook);
  group.add(hook);
  
  // Chain link
  const chainGeo = new THREE.TorusGeometry(0.008, 0.002, 6, 12);
  const chain = new THREE.Mesh(chainGeo, wireMat);
  chain.position.y = cageHeight + domeHeight + 0.03;
  group.add(chain);
  
  // PERCHES (wooden dowels)
  const perchMat = new THREE.MeshStandardMaterial({ 
    color: 0x8b6914, 
    roughness: 0.8
  });
  
  // Main perch (center)
  const perch1Geo = new THREE.CylinderGeometry(0.006, 0.006, cageRadius * 1.8, 12);
  const perch1 = new THREE.Mesh(perch1Geo, perchMat);
  perch1.rotation.z = Math.PI / 2;
  perch1.position.y = cageHeight * 0.6;
  applyShadows(perch1);
  group.add(perch1);
  
  // Lower perch
  const perch2 = perch1.clone();
  perch2.position.y = cageHeight * 0.35;
  perch2.rotation.set(0, 0, Math.PI / 2);
  group.add(perch2);
  
  // High perch
  const perch3Geo = new THREE.CylinderGeometry(0.005, 0.005, cageRadius * 1.4, 12);
  const perch3 = new THREE.Mesh(perch3Geo, perchMat);
  perch3.rotation.z = Math.PI / 2;
  perch3.position.y = cageHeight * 0.8;
  applyShadows(perch3);
  group.add(perch3);
  
  // FOOD/WATER DISHES (mounted to bars)
  const dishMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    roughness: 0.3
  });
  
  for (let i = 0; i < 2; i++) {
    const angle = i * Math.PI;
    const dishRadius = 0.025;
    
    // Dish bowl
    const dishGeo = new THREE.CylinderGeometry(dishRadius, dishRadius * 0.7, 0.012, 16);
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.position.set(
      Math.cos(angle) * (cageRadius - 0.02),
      0.08,
      Math.sin(angle) * (cageRadius - 0.02)
    );
    applyShadows(dish);
    group.add(dish);
    
    // Mounting clip
    const clipGeo = new THREE.TorusGeometry(0.008, 0.002, 6, 12);
    const clipMat = new THREE.MeshStandardMaterial({ 
      color: 0x666666, 
      roughness: 0.4,
      metalness: 0.6
    });
    const clip = new THREE.Mesh(clipGeo, clipMat);
    clip.rotation.x = Math.PI / 2;
    clip.position.set(
      Math.cos(angle) * (cageRadius - 0.005),
      dish.position.y,
      Math.sin(angle) * (cageRadius - 0.005)
    );
    group.add(clip);
  }
  
  // SWING
  const swingChainLength = 0.08;
  const swingWidth = 0.06;
  
  for (let side = 0; side < 2; side++) {
    const chainGeo2 = new THREE.CylinderGeometry(0.001, 0.001, swingChainLength, 6);
    const chainLink = new THREE.Mesh(chainGeo2, wireMat);
    chainLink.position.set(
      (side === 0 ? -1 : 1) * swingWidth / 2,
      cageHeight * 0.5 - swingChainLength / 2,
      0
    );
    group.add(chainLink);
  }
  
  // Swing perch
  const swingPerchGeo = new THREE.CylinderGeometry(0.005, 0.005, swingWidth, 12);
  const swingPerch = new THREE.Mesh(swingPerchGeo, perchMat);
  swingPerch.rotation.z = Math.PI / 2;
  swingPerch.position.y = cageHeight * 0.5 - swingChainLength;
  applyShadows(swingPerch);
  group.add(swingPerch);
  
  // Door (on front)
  const doorHeight = 0.12;
  const doorWidth = 0.08;
  
  const doorFrameGeo = new THREE.BoxGeometry(doorWidth, doorHeight, 0.003);
  const doorFrameMat = new THREE.MeshStandardMaterial({ 
    color: 0xaaaaaa, 
    roughness: 0.3,
    metalness: 0.8
  });
  const doorFrame = new THREE.Mesh(doorFrameGeo, doorFrameMat);
  doorFrame.position.set(0, 0.15, cageRadius + 0.002);
  applyShadows(doorFrame);
  group.add(doorFrame);
  
  // Door bars (vertical)
  for (let i = 0; i < 6; i++) {
    const doorBarGeo = new THREE.CylinderGeometry(0.0015, 0.0015, doorHeight * 0.9, 6);
    const doorBar = new THREE.Mesh(doorBarGeo, wireMat);
    doorBar.position.set(
      -doorWidth / 2 + 0.01 + i * (doorWidth - 0.02) / 5,
      doorFrame.position.y,
      doorFrame.position.z
    );
    group.add(doorBar);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createBirdCage.metadata = {
  category: 'pets',
  name: 'Bird Cage',
  description: 'Cylindrical bird cage with dome top, perches, swing, and food dishes',
  dimensions: { width: 0.3, height: 0.5, depth: 0.3 },
  interactive: false
};

/**
 * Create an ant farm with tunnels
 */
function createAntFarm(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const farmWidth = 0.3;
  const farmHeight = 0.25;
  const farmDepth = 0.04;
  
  // Frame (wooden or plastic)
  const frameMat = new THREE.MeshStandardMaterial({ 
    color: 0x3a2a1a, 
    roughness: 0.7
  });
  
  // Back panel
  const backGeo = new THREE.BoxGeometry(farmWidth, farmHeight, 0.008);
  const back = new THREE.Mesh(backGeo, frameMat);
  back.position.set(0, farmHeight / 2, -farmDepth / 2);
  applyShadows(back);
  group.add(back);
  
  // Frame edges
  const frameThickness = 0.015;
  
  // Top and bottom
  [[0, farmHeight, 0], [0, 0, 0]].forEach(([x, y, z]) => {
    const frameGeo = new THREE.BoxGeometry(farmWidth + frameThickness * 2, frameThickness, farmDepth + frameThickness);
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(x, y, z);
    applyShadows(frame);
    group.add(frame);
  });
  
  // Left and right
  [[-farmWidth / 2 - frameThickness / 2, farmHeight / 2, 0], 
   [farmWidth / 2 + frameThickness / 2, farmHeight / 2, 0]].forEach(([x, y, z]) => {
    const frameGeo = new THREE.BoxGeometry(frameThickness, farmHeight, farmDepth + frameThickness);
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(x, y, z);
    applyShadows(frame);
    group.add(frame);
  });
  
  // Front glass/acrylic
  const glassGeo = new THREE.BoxGeometry(farmWidth, farmHeight, 0.003);
  const glassMat = new THREE.MeshStandardMaterial({ 
    color: 0xccffff, 
    transparent: true,
    opacity: 0.3,
    roughness: 0.05,
    metalness: 0.1,
    side: THREE.DoubleSide
  });
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.set(0, farmHeight / 2, farmDepth / 2 + 0.002);
  applyShadows(glass);
  group.add(glass);
  
  // Sand/soil (blue gel or tan sand)
  const soilColor = spec.blueGel ? 0x4488ff : 0xd4a76a;
  const soilMat = new THREE.MeshStandardMaterial({ 
    color: soilColor, 
    roughness: 0.8,
    transparent: spec.blueGel ? true : false,
    opacity: spec.blueGel ? 0.7 : 1.0
  });
  
  const soilGeo = new THREE.BoxGeometry(farmWidth - 0.005, farmHeight - 0.005, farmDepth - 0.01);
  const soil = new THREE.Mesh(soilGeo, soilMat);
  soil.position.set(0, farmHeight / 2, 0);
  applyShadows(soil);
  group.add(soil);
  
  // TUNNEL SYSTEM (carved paths)
  const tunnelMat = new THREE.MeshStandardMaterial({ 
    color: 0x1a1a1a, 
    roughness: 0.9
  });
  
  // Create dynamic tunnel network
  const tunnels = [
    // Main vertical shaft
    { x: 0, y: 0.22, w: 0.015, h: 0.18, d: farmDepth * 0.6 },
    
    // Horizontal chambers/tunnels (left side)
    { x: -0.08, y: 0.19, w: 0.08, h: 0.012, d: farmDepth * 0.5 },
    { x: -0.09, y: 0.14, w: 0.09, h: 0.012, d: farmDepth * 0.5 },
    { x: -0.07, y: 0.09, w: 0.07, h: 0.012, d: farmDepth * 0.5 },
    { x: -0.06, y: 0.04, w: 0.06, h: 0.012, d: farmDepth * 0.5 },
    
    // Horizontal chambers/tunnels (right side)
    { x: 0.08, y: 0.17, w: 0.08, h: 0.012, d: farmDepth * 0.5 },
    { x: 0.09, y: 0.12, w: 0.09, h: 0.012, d: farmDepth * 0.5 },
    { x: 0.07, y: 0.07, w: 0.07, h: 0.012, d: farmDepth * 0.5 },
    
    // Chambers (wider areas)
    { x: -0.1, y: 0.19, w: 0.025, h: 0.025, d: farmDepth * 0.6 },
    { x: -0.12, y: 0.14, w: 0.03, h: 0.02, d: farmDepth * 0.6 },
    { x: 0.11, y: 0.17, w: 0.028, h: 0.022, d: farmDepth * 0.6 },
    { x: 0.12, y: 0.12, w: 0.026, h: 0.02, d: farmDepth * 0.6 },
    
    // Connecting vertical shafts
    { x: -0.08, y: 0.12, w: 0.012, h: 0.08, d: farmDepth * 0.5 },
    { x: 0.08, y: 0.10, w: 0.012, h: 0.08, d: farmDepth * 0.5 }
  ];
  
  tunnels.forEach(tunnel => {
    const tunnelGeo = new THREE.BoxGeometry(tunnel.w, tunnel.h, tunnel.d);
    const tunnelMesh = new THREE.Mesh(tunnelGeo, tunnelMat);
    tunnelMesh.position.set(tunnel.x, tunnel.y, 0);
    group.add(tunnelMesh);
  });
  
  // Add rounded corners to some chambers using small spheres
  const cornerRadius = 0.006;
  [
    { x: -0.1, y: 0.2, z: 0 },
    { x: -0.12, y: 0.15, z: 0 },
    { x: 0.11, y: 0.18, z: 0 },
    { x: 0.12, y: 0.13, z: 0 }
  ].forEach(pos => {
    const cornerGeo = new THREE.SphereGeometry(cornerRadius, 8, 8);
    const corner = new THREE.Mesh(cornerGeo, tunnelMat);
    corner.position.set(pos.x, pos.y, pos.z);
    group.add(corner);
  });
  
  // Feed tube at top
  const feedTubeMat = new THREE.MeshStandardMaterial({ 
    color: 0x666666, 
    roughness: 0.4,
    metalness: 0.5
  });
  
  const feedTubeGeo = new THREE.CylinderGeometry(0.01, 0.012, 0.04, 12);
  const feedTube = new THREE.Mesh(feedTubeGeo, feedTubeMat);
  feedTube.position.set(0, farmHeight + 0.02, 0);
  applyShadows(feedTube);
  group.add(feedTube);
  
  // Feed tube cap (removable)
  const capGeo = new THREE.CylinderGeometry(0.012, 0.01, 0.008, 12);
  const cap = new THREE.Mesh(capGeo, feedTubeMat);
  cap.position.set(0, farmHeight + 0.044, 0);
  applyShadows(cap);
  group.add(cap);
  
  // Air holes in frame (small circles)
  for (let i = 0; i < 8; i++) {
    const holeGeo = new THREE.CircleGeometry(0.002, 8);
    const holeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const hole = new THREE.Mesh(holeGeo, holeMat);
    hole.position.set(
      farmWidth / 2 + frameThickness / 2 + 0.001,
      0.03 + i * 0.028,
      0
    );
    hole.rotation.y = -Math.PI / 2;
    group.add(hole);
  }
  
  // Moisture sponge at bottom (visible through glass)
  const spongeMat = new THREE.MeshStandardMaterial({ 
    color: 0xffff88, 
    roughness: 0.95
  });
  const spongeGeo = new THREE.BoxGeometry(farmWidth * 0.9, 0.015, farmDepth * 0.7);
  const positions = spongeGeo.attributes.position;
  
  // Add texture to sponge
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    const bump = Math.sin(x * 100) * Math.cos(z * 100) * 0.002;
    positions.setY(i, positions.getY(i) + bump);
  }
  spongeGeo.computeVertexNormals();
  
  const sponge = new THREE.Mesh(spongeGeo, spongeMat);
  sponge.position.set(0, 0.01, 0);
  group.add(sponge);
  
  // Information label
  const labelGeo = new THREE.BoxGeometry(farmWidth * 0.6, 0.03, 0.002);
  const labelMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    roughness: 0.6
  });
  const label = new THREE.Mesh(labelGeo, labelMat);
  label.position.set(0, farmHeight + 0.015, -farmDepth / 2 - 0.001);
  group.add(label);
  
  // Label text (simple black rectangle)
  const textGeo = new THREE.BoxGeometry(farmWidth * 0.5, 0.015, 0.001);
  const textMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
  const text = new THREE.Mesh(textGeo, textMat);
  text.position.set(0, farmHeight + 0.015, label.position.z + 0.002);
  group.add(text);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createAntFarm.metadata = {
  category: 'pets',
  name: 'Ant Farm',
  description: 'Ant farm with intricate tunnel system and chambers',
  dimensions: { width: 0.33, height: 0.27, depth: 0.04 },
  interactive: false
};

/**
 * Create a dog food bowl with kibble
 */
function createDogFoodBowl(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const bowlRadius = 0.12;
  const bowlHeight = 0.06;
  const filled = spec.filled !== false; // Default to filled
  
  // Outer bowl (stainless steel)
  const bowlMat = new THREE.MeshStandardMaterial({ 
    color: 0xcccccc, 
    roughness: 0.2,
    metalness: 0.9
  });
  
  const bowlGeo = new THREE.CylinderGeometry(bowlRadius, bowlRadius * 0.7, bowlHeight, 32, 8);
  const positions = bowlGeo.attributes.position;
  
  // Slight curve to bowl shape
  for (let i = 0; i < positions.count; i++) {
    const y = positions.getY(i);
    if (y < 0) {
      const curve = Math.pow(Math.abs(y / (bowlHeight / 2)), 1.5) * 0.01;
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const radius = Math.sqrt(x * x + z * z);
      if (radius > 0) {
        const scale = (radius - curve) / radius;
        positions.setX(i, x * scale);
        positions.setZ(i, z * scale);
      }
    }
  }
  bowlGeo.computeVertexNormals();
  
  const bowl = new THREE.Mesh(bowlGeo, bowlMat);
  bowl.position.y = bowlHeight / 2;
  applyShadows(bowl);
  group.add(bowl);
  
  // Inner bowl surface (slightly darker)
  const innerGeo = new THREE.CylinderGeometry(bowlRadius * 0.95, bowlRadius * 0.65, bowlHeight * 0.9, 32, 8, true);
  const innerMat = new THREE.MeshStandardMaterial({ 
    color: 0xbbbbbb, 
    roughness: 0.25,
    metalness: 0.85,
    side: THREE.DoubleSide
  });
  const inner = new THREE.Mesh(innerGeo, innerMat);
  inner.position.y = bowlHeight / 2;
  group.add(inner);
  
  // Rim (thicker edge)
  const rimGeo = new THREE.TorusGeometry(bowlRadius, 0.008, 12, 32);
  const rim = new THREE.Mesh(rimGeo, bowlMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = bowlHeight;
  applyShadows(rim);
  group.add(rim);
  
  // Bottom ring (anti-slip)
  const bottomRingGeo = new THREE.TorusGeometry(bowlRadius * 0.7, 0.006, 10, 24);
  const rubberMat = new THREE.MeshStandardMaterial({ 
    color: 0x333333, 
    roughness: 0.95
  });
  const bottomRing = new THREE.Mesh(bottomRingGeo, rubberMat);
  bottomRing.rotation.x = Math.PI / 2;
  bottomRing.position.y = 0.003;
  applyShadows(bottomRing);
  group.add(bottomRing);
  
  // KIBBLE - Using InstancedMesh for performance
  if (filled) {
    const kibbleCount = 200;
    
    // Create kibble geometry (irregular nugget shape)
    const kibbleGeo = new THREE.BoxGeometry(0.012, 0.008, 0.01, 2, 2, 2);
    const kibblePositions = kibbleGeo.attributes.position;
    
    // Deform for organic kibble shape
    for (let i = 0; i < kibblePositions.count; i++) {
      const x = kibblePositions.getX(i);
      const y = kibblePositions.getY(i);
      const z = kibblePositions.getZ(i);
      
      const bulge = 1 + Math.sin(x * 30) * Math.cos(y * 25) * Math.sin(z * 28) * 0.2;
      kibblePositions.setX(i, x * bulge);
      kibblePositions.setY(i, y * bulge);
      kibblePositions.setZ(i, z * bulge);
    }
    kibbleGeo.computeVertexNormals();
    
    const kibbleColors = [
      0x8b4513, // Brown
      0xa0522d, // Sienna
      0x654321, // Dark brown
      0x9b7653  // Tan brown
    ];
    
    // Create multiple instanced meshes for color variation
    kibbleColors.forEach(color => {
      const kibbleMat = new THREE.MeshStandardMaterial({ 
        color: color, 
        roughness: 0.8
      });
      
      const kibbles = new THREE.InstancedMesh(kibbleGeo, kibbleMat, Math.floor(kibbleCount / kibbleColors.length));
      const dummy = new THREE.Object3D();
      
      for (let i = 0; i < Math.floor(kibbleCount / kibbleColors.length); i++) {
        // Distribute kibble in bowl with realistic pile
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * bowlRadius * 0.7;
        const height = bowlHeight * 0.3 + Math.random() * bowlHeight * 0.4;
        
        // Pile up towards center
        const pileHeight = (1 - radius / (bowlRadius * 0.7)) * 0.03;
        
        dummy.position.set(
          Math.cos(angle) * radius,
          height + pileHeight,
          Math.sin(angle) * radius
        );
        dummy.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        dummy.scale.set(
          0.8 + Math.random() * 0.4,
          0.8 + Math.random() * 0.4,
          0.8 + Math.random() * 0.4
        );
        dummy.updateMatrix();
        kibbles.setMatrixAt(i, dummy.matrix);
      }
      
      kibbles.castShadow = true;
      kibbles.receiveShadow = true;
      group.add(kibbles);
    });
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createDogFoodBowl.metadata = {
  category: 'pets',
  name: 'Dog Food Bowl',
  description: 'Stainless steel dog bowl filled with kibble',
  dimensions: { width: 0.24, height: 0.06, depth: 0.24 },
  interactive: false
};

/**
 * Create scattered kibble pieces
 */
function createKibble(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const count = spec.count || 8;
  const spread = spec.spread || 0.15;
  
  const kibbleColors = [0x8b4513, 0xa0522d, 0x654321, 0x9b7653];
  
  for (let i = 0; i < count; i++) {
    // Random kibble piece
    const kibbleGeo = new THREE.BoxGeometry(0.012, 0.008, 0.01, 2, 2, 2);
    const positions = kibbleGeo.attributes.position;
    
    // Deform each piece uniquely
    for (let j = 0; j < positions.count; j++) {
      const x = positions.getX(j);
      const y = positions.getY(j);
      const z = positions.getZ(j);
      
      const bulge = 1 + Math.sin(x * 30 + i) * Math.cos(y * 25 + i) * Math.sin(z * 28 + i) * 0.25;
      positions.setX(j, x * bulge);
      positions.setY(j, y * bulge);
      positions.setZ(j, z * bulge);
    }
    kibbleGeo.computeVertexNormals();
    
    const kibbleMat = new THREE.MeshStandardMaterial({ 
      color: kibbleColors[i % kibbleColors.length], 
      roughness: 0.8
    });
    
    const kibble = new THREE.Mesh(kibbleGeo, kibbleMat);
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const radius = Math.random() * spread;
    
    kibble.position.set(
      Math.cos(angle) * radius,
      0.004,
      Math.sin(angle) * radius
    );
    kibble.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    kibble.scale.set(
      0.8 + Math.random() * 0.4,
      0.8 + Math.random() * 0.4,
      0.8 + Math.random() * 0.4
    );
    applyShadows(kibble);
    group.add(kibble);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createKibble.metadata = {
  category: 'pets',
  name: 'Kibble',
  description: 'Scattered dog food kibble pieces',
  dimensions: { width: 0.3, height: 0.008, depth: 0.3 },
  interactive: false
};

// Export all pet creators
export const creators = {
  hamstercage: createHamsterCage,
  birdcage: createBirdCage,
  antfarm: createAntFarm,
  dogfoodbowl: createDogFoodBowl,
  dogbowl: createDogFoodBowl,
  kibble: createKibble,
  straykibble: createKibble
};

