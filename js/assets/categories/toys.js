// ==================== TOYS & GAMES ASSET CREATORS ====================
// Universal toy and game creation functions

import { createPositionedGroup, applyShadows } from '../asset-context.js';

/**
 * Create Jenga tower asset
 */
function createJengaTower(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const blockWidth = 0.015;
  const blockHeight = 0.005;
  const blockDepth = 0.045;
  const levels = spec.levels || 18;
  
  const woodMat = new THREE.MeshStandardMaterial({
    color: 0xd4a574,
    roughness: 0.7
  });
  
  for (let level = 0; level < levels; level++) {
    const isVertical = level % 2 === 0;
    const blocksPerLevel = 3;
    
    for (let i = 0; i < blocksPerLevel; i++) {
      const blockGeo = new THREE.BoxGeometry(
        isVertical ? blockWidth : blockDepth,
        blockHeight,
        isVertical ? blockDepth : blockWidth
      );
      const block = new THREE.Mesh(blockGeo, woodMat);
      
      if (isVertical) {
        block.position.set(
          (i - 1) * (blockWidth + 0.001),
          level * blockHeight + blockHeight / 2,
          0
        );
      } else {
        block.position.set(
          0,
          level * blockHeight + blockHeight / 2,
          (i - 1) * (blockWidth + 0.001)
        );
      }
      
      applyShadows(block);
      group.add(block);
    }
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createJengaTower.metadata = {
  category: 'toys',
  name: 'Jenga Tower',
  description: 'Stacked Jenga block tower',
  dimensions: { width: 0.048, depth: 0.048, height: 0.09 },
  interactive: false
};

/**
 * Create Pixar ball asset
 */
function createPixarBall(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const radius = spec.radius || 0.055;
  
  // Ball (yellow base)
  const ballGeo = new THREE.SphereGeometry(radius, 32, 32);
  const ballMat = new THREE.MeshStandardMaterial({
    color: 0xffdd00,
    roughness: 0.4,
    metalness: 0.1
  });
  const ball = new THREE.Mesh(ballGeo, ballMat);
  ball.position.y = radius;
  applyShadows(ball);
  group.add(ball);
  
  // Red stripe
  const stripeGeo = new THREE.TorusGeometry(radius * 0.9, radius * 0.15, 12, 32);
  const stripeMat = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    roughness: 0.4
  });
  const stripe = new THREE.Mesh(stripeGeo, stripeMat);
  stripe.rotation.x = Math.PI / 2;
  stripe.position.y = radius;
  applyShadows(stripe);
  group.add(stripe);
  
  // Blue star (simple circle on top)
  const starGeo = new THREE.CircleGeometry(radius * 0.3, 5);
  const starMat = new THREE.MeshStandardMaterial({
    color: 0x0066ff,
    roughness: 0.5
  });
  const star = new THREE.Mesh(starGeo, starMat);
  star.position.y = radius + 0.001;
  star.rotation.x = -Math.PI / 2;
  group.add(star);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  
  return context.addObject(group);
}

createPixarBall.metadata = {
  category: 'toys',
  name: 'Pixar Ball',
  description: 'Classic Pixar bouncy ball with star',
  dimensions: { width: 0.11, depth: 0.11, height: 0.11 },
  interactive: false
};

/**
 * Create basketball asset
 */
function createBasketball(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const radius = 0.12;
  
  const ballGeo = new THREE.SphereGeometry(radius, 32, 32);
  const ballMat = new THREE.MeshStandardMaterial({
    color: 0xff8833,
    roughness: 0.8
  });
  const ball = new THREE.Mesh(ballGeo, ballMat);
  ball.position.y = radius;
  applyShadows(ball);
  group.add(ball);
  
  // Black lines (simplified)
  const lineMat = new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 0.9
  });
  
  // Horizontal line
  const hLineGeo = new THREE.TorusGeometry(radius, 0.003, 8, 32);
  const hLine = new THREE.Mesh(hLineGeo, lineMat);
  hLine.rotation.x = Math.PI / 2;
  hLine.position.y = radius;
  group.add(hLine);
  
  // Vertical lines
  for (let i = 0; i < 2; i++) {
    const vLine = new THREE.Mesh(hLineGeo, lineMat);
    vLine.rotation.z = (i * Math.PI / 2) + Math.PI / 4;
    vLine.position.y = radius;
    group.add(vLine);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  
  return context.addObject(group);
}

createBasketball.metadata = {
  category: 'toys',
  name: 'Basketball',
  description: 'Orange basketball with lines',
  dimensions: { width: 0.24, depth: 0.24, height: 0.24 },
  interactive: false
};

/**
 * Create baseball asset
 */
function createBaseball(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const radius = 0.037;
  
  const ballGeo = new THREE.SphereGeometry(radius, 32, 32);
  const ballMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.7
  });
  const ball = new THREE.Mesh(ballGeo, ballMat);
  ball.position.y = radius;
  applyShadows(ball);
  group.add(ball);
  
  // Stitching (red curves)
  const stitchMat = new THREE.MeshStandardMaterial({
    color: 0xcc0000,
    roughness: 0.8
  });
  
  // Simplified stitching as small tori
  for (let i = 0; i < 2; i++) {
    const stitchGeo = new THREE.TorusGeometry(radius * 0.5, 0.002, 6, 16, Math.PI);
    const stitch = new THREE.Mesh(stitchGeo, stitchMat);
    stitch.rotation.y = i * Math.PI;
    stitch.rotation.x = Math.PI / 4;
    stitch.position.y = radius;
    group.add(stitch);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  
  return context.addObject(group);
}

createBaseball.metadata = {
  category: 'toys',
  name: 'Baseball',
  description: 'White baseball with red stitching',
  dimensions: { width: 0.074, depth: 0.074, height: 0.074 },
  interactive: false
};

/**
 * Create messy/fallen Jenga tower
 */
function createJengaTowerMessy(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const blockWidth = 0.015;
  const blockHeight = 0.005;
  const blockDepth = 0.045;
  const totalBlocks = 54; // Full jenga set
  
  const woodMat = new THREE.MeshStandardMaterial({
    color: 0xd4a574,
    roughness: 0.7
  });
  
  // Create scattered/fallen blocks
  for (let i = 0; i < totalBlocks; i++) {
    const blockGeo = new THREE.BoxGeometry(blockWidth, blockHeight, blockDepth);
    const block = new THREE.Mesh(blockGeo, woodMat);
    
    // Random scattered positions
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 0.08;
    block.position.set(
      Math.cos(angle) * dist,
      Math.random() * 0.03,
      Math.sin(angle) * dist
    );
    
    // Random rotations for scattered look
    block.rotation.set(
      (Math.random() - 0.5) * Math.PI,
      Math.random() * Math.PI * 2,
      (Math.random() - 0.5) * Math.PI
    );
    
    applyShadows(block);
    group.add(block);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createJengaTowerMessy.metadata = {
  category: 'toys',
  name: 'Jenga Tower (Messy)',
  description: 'Fallen/scattered Jenga blocks',
  dimensions: { width: 0.16, depth: 0.16, height: 0.03 },
  interactive: false
};

/**
 * Create garbage can asset
 */
function createGarbageCan(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const radius = 0.15;
  const height = 0.35;
  const filled = spec.filled || false;
  
  // Can body (tapered cylinder)
  const canGeo = new THREE.CylinderGeometry(radius, radius * 0.85, height, 24);
  const canMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0x4a4a4a,
    roughness: 0.6,
    metalness: 0.3
  });
  const can = new THREE.Mesh(canGeo, canMat);
  can.position.y = height / 2;
  applyShadows(can);
  group.add(can);
  
  // Rim
  const rimGeo = new THREE.TorusGeometry(radius, 0.008, 8, 24);
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.5,
    metalness: 0.4
  });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = height;
  applyShadows(rim);
  group.add(rim);
  
  // Base ring
  const baseRim = rim.clone();
  baseRim.position.y = 0.008;
  applyShadows(baseRim);
  group.add(baseRim);
  
  // Trash bag if filled
  if (filled) {
    const bagGeo = new THREE.SphereGeometry(radius * 0.9, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const bagMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.8
    });
    const bag = new THREE.Mesh(bagGeo, bagMat);
    bag.position.y = height * 0.85;
    applyShadows(bag);
    group.add(bag);
    
    // Some trash items sticking out
    const trashColors = [0xffffff, 0x8b4513, 0x4a4a8a, 0xffff00];
    for (let i = 0; i < 3; i++) {
      const trashGeo = new THREE.BoxGeometry(0.03, 0.04, 0.02);
      const trashMat = new THREE.MeshStandardMaterial({
        color: trashColors[Math.floor(Math.random() * trashColors.length)],
        roughness: 0.8
      });
      const trash = new THREE.Mesh(trashGeo, trashMat);
      const angle = (i / 3) * Math.PI * 2;
      trash.position.set(
        Math.cos(angle) * radius * 0.6,
        height * 0.95 + Math.random() * 0.05,
        Math.sin(angle) * radius * 0.6
      );
      trash.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      group.add(trash);
    }
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createGarbageCan.metadata = {
  category: 'toys',
  name: 'Garbage Can',
  description: 'Trash can (use spec.filled=true for filled variant)',
  dimensions: { width: 0.3, depth: 0.3, height: 0.35 },
  interactive: false
};

/**
 * Create crumpled paper ball
 */
function createCrumpledPaper(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const size = spec.size || 0.04;
  
  // Irregular sphere for crumpled look
  const paperGeo = new THREE.IcosahedronGeometry(size, 2);
  const positions = paperGeo.attributes.position;
  
  // Deform for crumpled appearance
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    
    // Random deformation
    const noise = (Math.random() - 0.5) * size * 0.4;
    const length = Math.sqrt(x * x + y * y + z * z);
    const scale = (length + noise) / length;
    
    positions.setX(i, x * scale);
    positions.setY(i, y * scale);
    positions.setZ(i, z * scale);
  }
  paperGeo.computeVertexNormals();
  
  const paperMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.95
  });
  const paper = new THREE.Mesh(paperGeo, paperMat);
  paper.position.y = size;
  applyShadows(paper);
  group.add(paper);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );
  
  return context.addObject(group);
}

createCrumpledPaper.metadata = {
  category: 'toys',
  name: 'Crumpled Paper',
  description: 'Crumpled paper ball',
  dimensions: { width: 0.08, depth: 0.08, height: 0.08 },
  interactive: false
};

/**
 * Create toy car asset
 */
function createToyCar(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  const scale = 0.07; // Toy scale
  
  const colors = [0xff0000, 0x0000ff, 0x00ff00, 0xffff00, 0xff00ff, 0x00ffff];
  const carColor = spec.color || colors[Math.floor(Math.random() * colors.length)];
  
  // Body with rounded corners
  const bodyGeo = new THREE.BoxGeometry(1.8 * scale, 0.6 * scale, 4 * scale);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: carColor,
    metalness: 0.7,
    roughness: 0.3
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.5 * scale;
  applyShadows(body);
  group.add(body);
  
  // Cabin
  const cabinGeo = new THREE.BoxGeometry(1.6 * scale, 0.5 * scale, 2 * scale);
  const cabin = new THREE.Mesh(cabinGeo, bodyMat);
  cabin.position.y = 1.05 * scale;
  cabin.position.z = -0.2 * scale;
  applyShadows(cabin);
  group.add(cabin);
  
  // Windows (front and back)
  const windowGeo = new THREE.BoxGeometry(1.5 * scale, 0.4 * scale, 0.8 * scale);
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x88ccff,
    transparent: true,
    opacity: 0.6,
    metalness: 0.8
  });
  
  const frontWindow = new THREE.Mesh(windowGeo, windowMat);
  frontWindow.position.set(0, 1.05 * scale, 0.6 * scale);
  group.add(frontWindow);
  
  const backWindow = new THREE.Mesh(windowGeo, windowMat);
  backWindow.position.set(0, 1.05 * scale, -1 * scale);
  group.add(backWindow);
  
  // Wheels with better detail
  const wheelGeo = new THREE.CylinderGeometry(0.3 * scale, 0.3 * scale, 0.2 * scale, 16);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
  
  // Hub caps
  const hubGeo = new THREE.CylinderGeometry(0.15 * scale, 0.15 * scale, 0.22 * scale, 16);
  const hubMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.6, roughness: 0.4 });
  
  const wheelPositions = [
    [-0.9 * scale, 0.3 * scale, 1.2 * scale],
    [0.9 * scale, 0.3 * scale, 1.2 * scale],
    [-0.9 * scale, 0.3 * scale, -1.2 * scale],
    [0.9 * scale, 0.3 * scale, -1.2 * scale]
  ];
  
  wheelPositions.forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    applyShadows(wheel);
    group.add(wheel);
    
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.rotation.z = Math.PI / 2;
    hub.position.set(x, y, z);
    applyShadows(hub);
    group.add(hub);
  });
  
  // Headlights
  const lightGeo = new THREE.CylinderGeometry(0.15 * scale, 0.15 * scale, 0.05 * scale, 12);
  const lightMat = new THREE.MeshStandardMaterial({ color: 0xffffaa, emissive: 0xffff88, emissiveIntensity: 0.5 });
  
  [-0.6 * scale, 0.6 * scale].forEach(x => {
    const light = new THREE.Mesh(lightGeo, lightMat);
    light.position.set(x, 0.5 * scale, 2.1 * scale);
    light.rotation.x = Math.PI / 2;
    group.add(light);
  });
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createToyCar.metadata = {
  category: 'toys',
  name: 'Toy Car',
  description: 'Colorful toy car with details',
  dimensions: { width: 0.126, depth: 0.28, height: 0.08 },
  interactive: false
};

/**
 * Create toy train asset
 */
function createToyTrain(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const carWidth = 0.06;
  const carHeight = 0.05;
  const carLength = 0.12;
  const carCount = spec.carCount || 3;
  const carColors = [0xff0000, 0x0000ff, 0x00ff00, 0xffff00, 0xff00ff];
  
  for (let i = 0; i < carCount; i++) {
    const carGroup = new THREE.Group();
    const isEngine = i === 0;
    
    // Car body
    const bodyGeo = new THREE.BoxGeometry(carWidth, carHeight, carLength);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: isEngine ? 0x1a1a1a : carColors[i % carColors.length],
      roughness: 0.5,
      metalness: 0.3
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = carHeight / 2 + 0.02;
    applyShadows(body);
    carGroup.add(body);
    
    // Roof
    const roofGeo = new THREE.BoxGeometry(carWidth * 0.8, carHeight * 0.4, carLength * 0.6);
    const roof = new THREE.Mesh(roofGeo, bodyMat);
    roof.position.y = carHeight + carHeight * 0.2;
    applyShadows(roof);
    carGroup.add(roof);
    
    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.015, 12);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    const wheelPositions = [
      [-carWidth / 2 - 0.008, 0.025, carLength / 3],
      [carWidth / 2 + 0.008, 0.025, carLength / 3],
      [-carWidth / 2 - 0.008, 0.025, -carLength / 3],
      [carWidth / 2 + 0.008, 0.025, -carLength / 3]
    ];
    
    wheelPositions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, y, z);
      applyShadows(wheel);
      carGroup.add(wheel);
    });
    
    // Engine smokestack with cap
    if (isEngine) {
      const stackGeo = new THREE.CylinderGeometry(0.02, 0.03, 0.08, 12);
      const stack = new THREE.Mesh(stackGeo, new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.3, metalness: 0.7 }));
      stack.position.set(0, carHeight + carHeight * 0.4 + 0.04, carLength / 3);
      applyShadows(stack);
      carGroup.add(stack);
      
      // Stack cap
      const capGeo = new THREE.CylinderGeometry(0.025, 0.02, 0.01, 12);
      const cap = new THREE.Mesh(capGeo, new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.3, metalness: 0.7 }));
      cap.position.set(0, carHeight + carHeight * 0.4 + 0.085, carLength / 3);
      applyShadows(cap);
      carGroup.add(cap);
      
      // Cowcatcher (front guard)
      const cowGeo = new THREE.CylinderGeometry(0.01, 0.04, 0.03, 6);
      const cow = new THREE.Mesh(cowGeo, new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.4, metalness: 0.6 }));
      cow.position.set(0, 0.035, carLength / 2 + 0.015);
      cow.rotation.x = Math.PI / 2;
      applyShadows(cow);
      carGroup.add(cow);
    }
    
    // Coupling connector between cars
    if (i > 0) {
      const couplingGeo = new THREE.BoxGeometry(0.01, 0.01, 0.03);
      const couplingMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5 });
      const coupling = new THREE.Mesh(couplingGeo, couplingMat);
      coupling.position.set(0, 0.03, -carLength / 2 - 0.015);
      applyShadows(coupling);
      carGroup.add(coupling);
    }
    
    carGroup.position.z = i * (carLength + 0.03);
    group.add(carGroup);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createToyTrain.metadata = {
  category: 'toys',
  name: 'Toy Train',
  description: 'Colorful toy train with multiple cars',
  dimensions: { width: 0.076, depth: 0.45, height: 0.095 },
  interactive: false
};

/**
 * Create train track asset
 */
function createTrainTrack(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const railHeight = 0.008;
  const railWidth = 0.055;
  const segmentLength = 0.15;
  const trackType = spec.trackType || 'straight';
  const segmentCount = spec.segmentCount || 3;
  
  if (trackType === 'straight') {
    for (let i = 0; i < segmentCount; i++) {
      const segmentGroup = new THREE.Group();
      
      // Rails (2 parallel)
      const railGeo = new THREE.BoxGeometry(railHeight, railHeight, segmentLength);
      const railMat = new THREE.MeshStandardMaterial({
        color: 0x8b8b8b,
        roughness: 0.3,
        metalness: 0.7
      });
      
      const leftRail = new THREE.Mesh(railGeo, railMat);
      leftRail.position.set(-railWidth / 2, railHeight / 2, 0);
      applyShadows(leftRail);
      segmentGroup.add(leftRail);
      
      const rightRail = new THREE.Mesh(railGeo, railMat);
      rightRail.position.set(railWidth / 2, railHeight / 2, 0);
      applyShadows(rightRail);
      segmentGroup.add(rightRail);
      
      // Ties (wooden cross pieces)
      const tieGeo = new THREE.BoxGeometry(railWidth + 0.02, railHeight * 0.6, 0.015);
      const tieMat = new THREE.MeshStandardMaterial({
        color: 0x8b4513,
        roughness: 0.9
      });
      
      for (let j = 0; j < 4; j++) {
        const tie = new THREE.Mesh(tieGeo, tieMat);
        tie.position.z = (j - 1.5) * (segmentLength / 3.5);
        tie.position.y = railHeight * 0.3;
        applyShadows(tie);
        segmentGroup.add(tie);
      }
      
      segmentGroup.position.z = i * segmentLength;
      group.add(segmentGroup);
    }
  } else if (trackType === 'curved') {
    const radius = 0.25;
    const angleStep = (Math.PI / 4) / segmentCount;
    
    for (let i = 0; i < segmentCount; i++) {
      const segmentGroup = new THREE.Group();
      const angle = i * angleStep;
      
      // Curved rails using torus segments
      const railGeo = new THREE.TorusGeometry(radius, railHeight / 2, 8, 16, angleStep);
      const railMat = new THREE.MeshStandardMaterial({
        color: 0x8b8b8b,
        roughness: 0.3,
        metalness: 0.7
      });
      
      const leftRail = new THREE.Mesh(railGeo, railMat);
      leftRail.rotation.x = Math.PI / 2;
      leftRail.rotation.z = angle;
      leftRail.position.y = railHeight / 2;
      applyShadows(leftRail);
      segmentGroup.add(leftRail);
      
      const rightRail = leftRail.clone();
      rightRail.scale.set(1 + railWidth / radius, 1 + railWidth / radius, 1);
      applyShadows(rightRail);
      segmentGroup.add(rightRail);
      
      group.add(segmentGroup);
    }
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createTrainTrack.metadata = {
  category: 'toys',
  name: 'Train Track',
  description: 'Toy train track (straight or curved)',
  dimensions: { width: 0.075, depth: 0.45, height: 0.008 },
  interactive: false
};

/**
 * Create teddy bear asset
 */
function createTeddyBear(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const furColor = spec.color || 0x8b5a2b;
  const furMat = new THREE.MeshStandardMaterial({
    color: furColor,
    roughness: 0.95
  });
  
  // Body (slightly egg-shaped)
  const bodyGeo = new THREE.SphereGeometry(0.045, 16, 16);
  const body = new THREE.Mesh(bodyGeo, furMat);
  body.scale.set(1, 1.2, 0.9);
  body.position.y = 0.08;
  applyShadows(body);
  group.add(body);
  
  // Head
  const headGeo = new THREE.SphereGeometry(0.035, 16, 16);
  const head = new THREE.Mesh(headGeo, furMat);
  head.position.y = 0.135;
  applyShadows(head);
  group.add(head);
  
  // Snout
  const snoutGeo = new THREE.SphereGeometry(0.018, 12, 12);
  const snoutMat = new THREE.MeshStandardMaterial({ color: 0xd2b48c, roughness: 0.9 });
  const snout = new THREE.Mesh(snoutGeo, snoutMat);
  snout.scale.set(0.8, 0.7, 1);
  snout.position.set(0, 0.128, 0.028);
  applyShadows(snout);
  group.add(snout);
  
  // Nose
  const noseGeo = new THREE.SphereGeometry(0.006, 12, 12);
  const noseMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7 });
  const nose = new THREE.Mesh(noseGeo, noseMat);
  nose.position.set(0, 0.132, 0.042);
  applyShadows(nose);
  group.add(nose);
  
  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.005, 12, 12);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3 });
  
  [-0.012, 0.012].forEach(x => {
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(x, 0.142, 0.025);
    applyShadows(eye);
    group.add(eye);
  });
  
  // Ears
  const earGeo = new THREE.SphereGeometry(0.015, 12, 12);
  [-0.025, 0.025].forEach(x => {
    const ear = new THREE.Mesh(earGeo, furMat);
    ear.scale.set(0.8, 1, 0.5);
    ear.position.set(x, 0.16, 0.005);
    applyShadows(ear);
    group.add(ear);
  });
  
  // Arms
  const armGeo = new THREE.CylinderGeometry(0.012, 0.015, 0.055, 12);
  [-0.04, 0.04].forEach(x => {
    const arm = new THREE.Mesh(armGeo, furMat);
    arm.position.set(x, 0.09, 0.015);
    arm.rotation.z = x < 0 ? Math.PI / 6 : -Math.PI / 6;
    applyShadows(arm);
    group.add(arm);
    
    // Paws
    const pawGeo = new THREE.SphereGeometry(0.016, 12, 12);
    const paw = new THREE.Mesh(pawGeo, snoutMat);
    paw.scale.set(0.8, 0.6, 0.8);
    paw.position.set(x * 1.15, 0.062, 0.02);
    applyShadows(paw);
    group.add(paw);
  });
  
  // Legs
  const legGeo = new THREE.CylinderGeometry(0.015, 0.018, 0.045, 12);
  [-0.025, 0.025].forEach(x => {
    const leg = new THREE.Mesh(legGeo, furMat);
    leg.position.set(x, 0.035, 0.005);
    applyShadows(leg);
    group.add(leg);
    
    // Feet
    const footGeo = new THREE.SphereGeometry(0.02, 12, 12);
    const foot = new THREE.Mesh(footGeo, snoutMat);
    foot.scale.set(0.7, 0.5, 1.2);
    foot.position.set(x, 0.012, 0.015);
    applyShadows(foot);
    group.add(foot);
  });
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createTeddyBear.metadata = {
  category: 'toys',
  name: 'Teddy Bear',
  description: 'Cute teddy bear plush toy',
  dimensions: { width: 0.11, depth: 0.07, height: 0.17 },
  interactive: false
};

/**
 * Create kids bed (boy themed)
 */
function createKidsBedBoy(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const bedWidth = 1.0;
  const bedLength = 1.8;
  const bedHeight = 0.4;
  
  // Frame (race car theme - blue/red)
  const frameMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0x0066ff,
    roughness: 0.6
  });
  
  // Main bed frame
  const frameGeo = new THREE.BoxGeometry(bedWidth, 0.15, bedLength);
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.y = bedHeight / 2;
  applyShadows(frame);
  group.add(frame);
  
  // Side panels with racing stripes
  const sidePanelGeo = new THREE.BoxGeometry(0.05, bedHeight, bedLength);
  [-bedWidth / 2 - 0.025, bedWidth / 2 + 0.025].forEach(x => {
    const panel = new THREE.Mesh(sidePanelGeo, frameMat);
    panel.position.set(x, bedHeight / 2, 0);
    applyShadows(panel);
    group.add(panel);
    
    // Racing stripes
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffff00, roughness: 0.5 });
    for (let i = 0; i < 3; i++) {
      const stripeGeo = new THREE.BoxGeometry(0.052, 0.03, 0.15);
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.set(x, bedHeight / 2, (i - 1) * 0.5);
      group.add(stripe);
    }
  });
  
  // Headboard (steering wheel design)
  const headboardGeo = new THREE.BoxGeometry(bedWidth + 0.1, bedHeight * 1.2, 0.05);
  const headboard = new THREE.Mesh(headboardGeo, frameMat);
  headboard.position.set(0, bedHeight * 0.6, -bedLength / 2 - 0.025);
  applyShadows(headboard);
  group.add(headboard);
  
  // Steering wheel decoration
  const wheelGeo = new THREE.TorusGeometry(0.15, 0.02, 12, 24);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.4, metalness: 0.6 });
  const wheel = new THREE.Mesh(wheelGeo, wheelMat);
  wheel.position.set(0, bedHeight * 0.6, -bedLength / 2 - 0.02);
  applyShadows(wheel);
  group.add(wheel);
  
  // Mattress with rounded corners
  const mattressCornerRadius = 0.04;
  const mattressShape = new THREE.Shape();
  const mw = (bedWidth - 0.1) / 2 - mattressCornerRadius;
  const ml = (bedLength - 0.1) / 2 - mattressCornerRadius;
  
  mattressShape.moveTo(-mw, -ml);
  mattressShape.lineTo(mw, -ml);
  mattressShape.quadraticCurveTo(mw + mattressCornerRadius, -ml, mw + mattressCornerRadius, -ml + mattressCornerRadius);
  mattressShape.lineTo(mw + mattressCornerRadius, ml);
  mattressShape.quadraticCurveTo(mw + mattressCornerRadius, ml + mattressCornerRadius, mw, ml + mattressCornerRadius);
  mattressShape.lineTo(-mw, ml + mattressCornerRadius);
  mattressShape.quadraticCurveTo(-mw - mattressCornerRadius, ml + mattressCornerRadius, -mw - mattressCornerRadius, ml);
  mattressShape.lineTo(-mw - mattressCornerRadius, -ml + mattressCornerRadius);
  mattressShape.quadraticCurveTo(-mw - mattressCornerRadius, -ml, -mw, -ml);
  
  const mattressExtrudeSettings = { depth: 0.15, bevelEnabled: false };
  const mattressGeo = new THREE.ExtrudeGeometry(mattressShape, mattressExtrudeSettings);
  const mattressMat = new THREE.MeshStandardMaterial({ color: 0x4a90e2, roughness: 0.8 });
  const mattress = new THREE.Mesh(mattressGeo, mattressMat);
  mattress.rotation.x = -Math.PI / 2;
  mattress.position.y = bedHeight;
  applyShadows(mattress);
  group.add(mattress);
  
  // Pillow with puffy rounded geometry
  const pillowWidth = bedWidth * 0.4;
  const pillowHeight = 0.1;
  const pillowDepth = bedLength * 0.15;
  const pillowGeo = new THREE.BoxGeometry(pillowWidth, pillowHeight, pillowDepth, 10, 5, 10);
  const pillowPositions = pillowGeo.attributes.position;
  
  // Add puffy rounded deformation
  for (let j = 0; j < pillowPositions.count; j++) {
    const x = pillowPositions.getX(j);
    const y = pillowPositions.getY(j);
    const z = pillowPositions.getZ(j);
    
    const nx = x / (pillowWidth / 2);
    const ny = y / (pillowHeight / 2);
    const nz = z / (pillowDepth / 2);
    
    const dist = Math.sqrt(nx * nx + ny * ny + nz * nz);
    const puffFactor = Math.max(0, 1 - dist) * 0.18;
    
    pillowPositions.setX(j, x * (1 + puffFactor * Math.abs(nx)));
    pillowPositions.setY(j, y * (1 + puffFactor * Math.abs(ny) * 1.6));
    pillowPositions.setZ(j, z * (1 + puffFactor * Math.abs(nz)));
  }
  pillowGeo.computeVertexNormals();
  
  const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
  const pillow = new THREE.Mesh(pillowGeo, pillowMat);
  pillow.position.set(0, bedHeight + 0.2, -bedLength / 3);
  applyShadows(pillow);
  group.add(pillow);
  
  // Blanket with rumbles/wrinkles
  const blanketGeo = new THREE.PlaneGeometry(bedWidth - 0.15, bedLength * 0.6, 24, 24);
  const blanketPositions = blanketGeo.attributes.position;
  
  // Add wave rumples
  for (let i = 0; i < blanketPositions.count; i++) {
    const x = blanketPositions.getX(i);
    const z = blanketPositions.getZ(i);
    
    const wave1 = Math.sin(x * 10) * 0.012;
    const wave2 = Math.sin(z * 8) * 0.01;
    const wave3 = Math.sin(x * 18 + z * 15) * 0.006;
    const rumple = (Math.sin(x * 30) * Math.cos(z * 35)) * 0.004;
    
    const totalDisplacement = wave1 + wave2 + wave3 + rumple;
    blanketPositions.setZ(i, blanketPositions.getZ(i) + totalDisplacement);
  }
  blanketGeo.computeVertexNormals();
  
  const blanketMat = new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.9, side: THREE.DoubleSide });
  const blanket = new THREE.Mesh(blanketGeo, blanketMat);
  blanket.rotation.x = -Math.PI / 2;
  blanket.position.set(0, bedHeight + 0.17, bedLength * 0.12);
  applyShadows(blanket);
  group.add(blanket);
  
  // Wheels (decorative)
  const wheelDecGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 20);
  const wheelDecMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7 });
  
  const wheelPositions = [
    [-bedWidth / 2 - 0.06, 0.12, bedLength / 2 - 0.3],
    [bedWidth / 2 + 0.06, 0.12, bedLength / 2 - 0.3],
    [-bedWidth / 2 - 0.06, 0.12, -bedLength / 2 + 0.3],
    [bedWidth / 2 + 0.06, 0.12, -bedLength / 2 + 0.3]
  ];
  
  wheelPositions.forEach(([x, y, z]) => {
    const wheelDec = new THREE.Mesh(wheelDecGeo, wheelDecMat);
    wheelDec.rotation.z = Math.PI / 2;
    wheelDec.position.set(x, y, z);
    applyShadows(wheelDec);
    group.add(wheelDec);
    
    // Hub cap
    const hubGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.09, 20);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.7, roughness: 0.3 });
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.rotation.z = Math.PI / 2;
    hub.position.set(x, y, z);
    applyShadows(hub);
    group.add(hub);
  });
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createKidsBedBoy.metadata = {
  category: 'toys',
  name: 'Kids Bed (Boy)',
  description: 'Race car themed kids bed',
  dimensions: { width: 1.1, depth: 1.9, height: 0.6 },
  interactive: false
};

/**
 * Create kids bed (girl themed)
 */
function createKidsBedGirl(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const bedWidth = 1.0;
  const bedLength = 1.8;
  const bedHeight = 0.4;
  
  // Frame (princess theme - pink/purple)
  const frameMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0xff69b4,
    roughness: 0.5
  });
  
  // Main bed frame
  const frameGeo = new THREE.BoxGeometry(bedWidth, 0.15, bedLength);
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.y = bedHeight / 2;
  applyShadows(frame);
  group.add(frame);
  
  // Decorative side rails with heart cutouts
  const sidePanelGeo = new THREE.BoxGeometry(0.05, bedHeight * 0.6, bedLength);
  [-bedWidth / 2 - 0.025, bedWidth / 2 + 0.025].forEach(x => {
    const panel = new THREE.Mesh(sidePanelGeo, frameMat);
    panel.position.set(x, bedHeight * 0.7, 0);
    applyShadows(panel);
    group.add(panel);
    
    // Heart decorations
    const heartMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
    for (let i = 0; i < 3; i++) {
      const heartGeo = new THREE.SphereGeometry(0.03, 16, 16);
      const heart = new THREE.Mesh(heartGeo, heartMat);
      heart.scale.set(1.2, 1, 0.3);
      heart.position.set(x, bedHeight * 0.7, (i - 1) * 0.5);
      group.add(heart);
    }
  });
  
  // Headboard (curved princess style)
  const headboardGeo = new THREE.BoxGeometry(bedWidth + 0.1, bedHeight * 1.5, 0.08);
  const headboard = new THREE.Mesh(headboardGeo, frameMat);
  headboard.position.set(0, bedHeight * 0.75, -bedLength / 2 - 0.04);
  applyShadows(headboard);
  group.add(headboard);
  
  // Crown decoration on headboard
  const crownGeo = new THREE.ConeGeometry(0.12, 0.15, 5);
  const crownMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 });
  const crown = new THREE.Mesh(crownGeo, crownMat);
  crown.position.set(0, bedHeight * 1.4, -bedLength / 2 - 0.04);
  crown.rotation.y = Math.PI / 10;
  applyShadows(crown);
  group.add(crown);
  
  // Mattress with rounded corners
  const mattressCornerRadius = 0.04;
  const mattressShape = new THREE.Shape();
  const mw = (bedWidth - 0.1) / 2 - mattressCornerRadius;
  const ml = (bedLength - 0.1) / 2 - mattressCornerRadius;
  
  mattressShape.moveTo(-mw, -ml);
  mattressShape.lineTo(mw, -ml);
  mattressShape.quadraticCurveTo(mw + mattressCornerRadius, -ml, mw + mattressCornerRadius, -ml + mattressCornerRadius);
  mattressShape.lineTo(mw + mattressCornerRadius, ml);
  mattressShape.quadraticCurveTo(mw + mattressCornerRadius, ml + mattressCornerRadius, mw, ml + mattressCornerRadius);
  mattressShape.lineTo(-mw, ml + mattressCornerRadius);
  mattressShape.quadraticCurveTo(-mw - mattressCornerRadius, ml + mattressCornerRadius, -mw - mattressCornerRadius, ml);
  mattressShape.lineTo(-mw - mattressCornerRadius, -ml + mattressCornerRadius);
  mattressShape.quadraticCurveTo(-mw - mattressCornerRadius, -ml, -mw, -ml);
  
  const mattressExtrudeSettings = { depth: 0.15, bevelEnabled: false };
  const mattressGeo = new THREE.ExtrudeGeometry(mattressShape, mattressExtrudeSettings);
  const mattressMat = new THREE.MeshStandardMaterial({ color: 0xffb6c1, roughness: 0.8 });
  const mattress = new THREE.Mesh(mattressGeo, mattressMat);
  mattress.rotation.x = -Math.PI / 2;
  mattress.position.y = bedHeight;
  applyShadows(mattress);
  group.add(mattress);
  
  // Pillow with puffy rounded geometry
  const pillowWidth = bedWidth * 0.4;
  const pillowHeight = 0.1;
  const pillowDepth = bedLength * 0.15;
  const pillowGeo = new THREE.BoxGeometry(pillowWidth, pillowHeight, pillowDepth, 10, 5, 10);
  const pillowPositions = pillowGeo.attributes.position;
  
  // Add puffy rounded deformation
  for (let j = 0; j < pillowPositions.count; j++) {
    const x = pillowPositions.getX(j);
    const y = pillowPositions.getY(j);
    const z = pillowPositions.getZ(j);
    
    const nx = x / (pillowWidth / 2);
    const ny = y / (pillowHeight / 2);
    const nz = z / (pillowDepth / 2);
    
    const dist = Math.sqrt(nx * nx + ny * ny + nz * nz);
    const puffFactor = Math.max(0, 1 - dist) * 0.18;
    
    pillowPositions.setX(j, x * (1 + puffFactor * Math.abs(nx)));
    pillowPositions.setY(j, y * (1 + puffFactor * Math.abs(ny) * 1.6));
    pillowPositions.setZ(j, z * (1 + puffFactor * Math.abs(nz)));
  }
  pillowGeo.computeVertexNormals();
  
  const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
  const pillow = new THREE.Mesh(pillowGeo, pillowMat);
  pillow.position.set(0, bedHeight + 0.2, -bedLength / 3);
  applyShadows(pillow);
  group.add(pillow);
  
  // Blanket with rumbles/wrinkles
  const blanketGeo = new THREE.PlaneGeometry(bedWidth - 0.15, bedLength * 0.6, 24, 24);
  const blanketPositions = blanketGeo.attributes.position;
  
  // Add wave rumples
  for (let i = 0; i < blanketPositions.count; i++) {
    const x = blanketPositions.getX(i);
    const z = blanketPositions.getZ(i);
    
    const wave1 = Math.sin(x * 10) * 0.012;
    const wave2 = Math.sin(z * 8) * 0.01;
    const wave3 = Math.sin(x * 18 + z * 15) * 0.006;
    const rumple = (Math.sin(x * 30) * Math.cos(z * 35)) * 0.004;
    
    const totalDisplacement = wave1 + wave2 + wave3 + rumple;
    blanketPositions.setZ(i, blanketPositions.getZ(i) + totalDisplacement);
  }
  blanketGeo.computeVertexNormals();
  
  const blanketMat = new THREE.MeshStandardMaterial({ color: 0xdda0dd, roughness: 0.9, side: THREE.DoubleSide });
  const blanket = new THREE.Mesh(blanketGeo, blanketMat);
  blanket.rotation.x = -Math.PI / 2;
  blanket.position.set(0, bedHeight + 0.17, bedLength * 0.12);
  applyShadows(blanket);
  group.add(blanket);
  
  // Decorative posts (princess bed posts)
  const postGeo = new THREE.CylinderGeometry(0.03, 0.04, bedHeight * 1.8, 12);
  const postMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.5 });
  
  const postPositions = [
    [-bedWidth / 2, bedHeight * 0.9, -bedLength / 2],
    [bedWidth / 2, bedHeight * 0.9, -bedLength / 2],
    [-bedWidth / 2, bedHeight * 0.9, bedLength / 2],
    [bedWidth / 2, bedHeight * 0.9, bedLength / 2]
  ];
  
  postPositions.forEach(([x, y, z]) => {
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(x, y, z);
    applyShadows(post);
    group.add(post);
    
    // Finial (decorative top)
    const finialGeo = new THREE.SphereGeometry(0.04, 12, 12);
    const finial = new THREE.Mesh(finialGeo, crownMat);
    finial.position.set(x, bedHeight * 1.8, z);
    applyShadows(finial);
    group.add(finial);
  });
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createKidsBedGirl.metadata = {
  category: 'toys',
  name: 'Kids Bed (Girl)',
  description: 'Princess themed kids bed',
  dimensions: { width: 1.1, depth: 1.9, height: 0.9 },
  interactive: false
};

/**
 * Create a retro ray gun (1950s sci-fi style)
 */
function createRetroRayGun(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const gunColor = spec.color || 0xff4444;
  
  // Main body (cylindrical with bulges)
  const bodyMat = new THREE.MeshStandardMaterial({ 
    color: gunColor, 
    roughness: 0.3,
    metalness: 0.6
  });
  
  const bodyGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.15, 16, 8);
  const positions = bodyGeo.attributes.position;
  
  // Add retro bulges
  for (let i = 0; i < positions.count; i++) {
    const y = positions.getY(i);
    const bulge = Math.sin((y / 0.15 + 0.5) * Math.PI * 3) * 0.005;
    const x = positions.getX(i);
    const z = positions.getZ(i);
    const radius = Math.sqrt(x * x + z * z);
    
    if (radius > 0) {
      const scale = (radius + bulge) / radius;
      positions.setX(i, x * scale);
      positions.setZ(i, z * scale);
    }
  }
  bodyGeo.computeVertexNormals();
  
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.rotation.z = -Math.PI / 2;
  body.position.set(0.075, 0.03, 0);
  applyShadows(body);
  group.add(body);
  
  // Barrel tip (flared cone)
  const barrelGeo = new THREE.CylinderGeometry(0.035, 0.015, 0.04, 16);
  const barrel = new THREE.Mesh(barrelGeo, bodyMat);
  barrel.rotation.z = -Math.PI / 2;
  barrel.position.set(0.17, 0.03, 0);
  applyShadows(barrel);
  group.add(barrel);
  
  // Glowing energy coils (transparent rings)
  const coilMat = new THREE.MeshStandardMaterial({ 
    color: 0x00ffff, 
    emissive: 0x00ffff,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.6,
    roughness: 0.2
  });
  
  for (let i = 0; i < 3; i++) {
    const coilGeo = new THREE.TorusGeometry(0.022 + i * 0.003, 0.003, 8, 16);
    const coil = new THREE.Mesh(coilGeo, coilMat);
    coil.rotation.y = Math.PI / 2;
    coil.position.set(0.1 + i * 0.02, 0.03, 0);
    group.add(coil);
  }
  
  // Handle (pistol grip)
  const handleMat = new THREE.MeshStandardMaterial({ 
    color: 0x333333, 
    roughness: 0.8
  });
  
  const handleGeo = new THREE.BoxGeometry(0.025, 0.06, 0.03, 3, 6, 3);
  const handlePositions = handleGeo.attributes.position;
  
  // Ergonomic curve
  for (let i = 0; i < handlePositions.count; i++) {
    const y = handlePositions.getY(i);
    const curve = (y / 0.06 + 0.5) * 0.015;
    handlePositions.setX(i, handlePositions.getX(i) - curve);
  }
  handleGeo.computeVertexNormals();
  
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.position.set(0.05, -0.01, 0);
  handle.rotation.z = -Math.PI / 8;
  applyShadows(handle);
  group.add(handle);
  
  // Trigger
  const triggerGeo = new THREE.BoxGeometry(0.008, 0.02, 0.012);
  const trigger = new THREE.Mesh(triggerGeo, handleMat);
  trigger.position.set(0.05, 0.01, 0);
  applyShadows(trigger);
  group.add(trigger);
  
  // Trigger guard
  const guardGeo = new THREE.TorusGeometry(0.015, 0.002, 8, 16, Math.PI * 1.5);
  const guardMat = new THREE.MeshStandardMaterial({ 
    color: 0x888888, 
    roughness: 0.3,
    metalness: 0.8
  });
  const guard = new THREE.Mesh(guardGeo, guardMat);
  guard.rotation.set(Math.PI / 2, 0, -Math.PI / 2);
  guard.position.set(0.05, 0.01, 0);
  group.add(guard);
  
  // Power pack (on top)
  const packGeo = new THREE.BoxGeometry(0.035, 0.025, 0.025);
  const packMat = new THREE.MeshStandardMaterial({ 
    color: gunColor, 
    roughness: 0.4,
    metalness: 0.5
  });
  const pack = new THREE.Mesh(packGeo, packMat);
  pack.position.set(0.06, 0.04, 0);
  applyShadows(pack);
  group.add(pack);
  
  // Power indicator lights
  for (let i = 0; i < 3; i++) {
    const lightGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.002, 8);
    const lightMat = new THREE.MeshStandardMaterial({ 
      color: i < 2 ? 0x00ff00 : 0xff0000, 
      emissive: i < 2 ? 0x00ff00 : 0xff0000,
      emissiveIntensity: 0.8
    });
    const light = new THREE.Mesh(lightGeo, lightMat);
    light.rotation.x = Math.PI / 2;
    light.position.set(0.048 + i * 0.008, 0.053, 0.01);
    group.add(light);
  }
  
  // Fins (cooling vents)
  for (let i = 0; i < 4; i++) {
    const finGeo = new THREE.BoxGeometry(0.002, 0.015, 0.02);
    const fin = new THREE.Mesh(finGeo, guardMat);
    fin.position.set(0.08 + i * 0.01, 0.045, 0);
    group.add(fin);
  }
  
  // Muzzle glow
  const muzzleGlowGeo = new THREE.CircleGeometry(0.03, 16);
  const muzzleGlowMat = new THREE.MeshStandardMaterial({ 
    color: 0xffff00, 
    emissive: 0xffff00,
    emissiveIntensity: 1.0,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
  });
  const muzzleGlow = new THREE.Mesh(muzzleGlowGeo, muzzleGlowMat);
  muzzleGlow.rotation.y = Math.PI / 2;
  muzzleGlow.position.set(0.19, 0.03, 0);
  group.add(muzzleGlow);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createRetroRayGun.metadata = {
  category: 'toys',
  name: 'Retro Ray Gun',
  description: '1950s style sci-fi ray gun with glowing coils',
  dimensions: { width: 0.19, height: 0.06, depth: 0.05 },
  interactive: false
};

/**
 * Create a sleek plasma pistol
 */
function createPlasmaPistol(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const gunColor = spec.color || 0x2a2a3a;
  
  // Main body (angular, modern)
  const bodyMat = new THREE.MeshStandardMaterial({ 
    color: gunColor, 
    roughness: 0.2,
    metalness: 0.8
  });
  
  const bodyGeo = new THREE.BoxGeometry(0.12, 0.04, 0.025, 6, 4, 2);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.set(0.06, 0.025, 0);
  applyShadows(body);
  group.add(body);
  
  // Angular front section
  const frontGeo = new THREE.BoxGeometry(0.04, 0.035, 0.02, 4, 3, 2);
  const frontPositions = frontGeo.attributes.position;
  
  // Taper forward
  for (let i = 0; i < frontPositions.count; i++) {
    const x = frontPositions.getX(i);
    const taper = (x / 0.04 + 0.5) * 0.5 + 0.5;
    frontPositions.setY(i, frontPositions.getY(i) * taper);
    frontPositions.setZ(i, frontPositions.getZ(i) * taper);
  }
  frontGeo.computeVertexNormals();
  
  const front = new THREE.Mesh(frontGeo, bodyMat);
  front.position.set(0.14, 0.025, 0);
  applyShadows(front);
  group.add(front);
  
  // Barrel rails (top and bottom)
  const railMat = new THREE.MeshStandardMaterial({ 
    color: 0x666666, 
    roughness: 0.3,
    metalness: 0.9
  });
  
  const topRailGeo = new THREE.BoxGeometry(0.08, 0.004, 0.008);
  const topRail = new THREE.Mesh(topRailGeo, railMat);
  topRail.position.set(0.08, 0.047, 0);
  applyShadows(topRail);
  group.add(topRail);
  
  const bottomRailGeo = new THREE.BoxGeometry(0.06, 0.004, 0.008);
  const bottomRail = new THREE.Mesh(bottomRailGeo, railMat);
  bottomRail.position.set(0.08, 0.003, 0);
  applyShadows(bottomRail);
  group.add(bottomRail);
  
  // Plasma chamber (glowing center)
  const chamberGeo = new THREE.BoxGeometry(0.05, 0.025, 0.015);
  const chamberMat = new THREE.MeshStandardMaterial({ 
    color: 0x0088ff, 
    emissive: 0x0088ff,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.7,
    roughness: 0.1
  });
  const chamber = new THREE.Mesh(chamberGeo, chamberMat);
  chamber.position.set(0.08, 0.025, 0);
  group.add(chamber);
  
  // Energy vents (side slits)
  for (let side = 0; side < 2; side++) {
    for (let i = 0; i < 5; i++) {
      const ventGeo = new THREE.BoxGeometry(0.008, 0.015, 0.001);
      const vent = new THREE.Mesh(ventGeo, new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
      vent.position.set(
        0.06 + i * 0.01,
        0.025,
        side === 0 ? 0.013 : -0.013
      );
      group.add(vent);
    }
  }
  
  // Handle (compact grip)
  const handleMat = new THREE.MeshStandardMaterial({ 
    color: 0x1a1a1a, 
    roughness: 0.9
  });
  
  const handleGeo = new THREE.BoxGeometry(0.02, 0.05, 0.028, 2, 5, 3);
  const handlePositions = handleGeo.attributes.position;
  
  // Ergonomic grip texture
  for (let i = 0; i < handlePositions.count; i++) {
    const y = handlePositions.getY(i);
    const z = handlePositions.getZ(i);
    const gripPattern = Math.sin(y * 30) * 0.002;
    handlePositions.setX(i, handlePositions.getX(i) + gripPattern);
  }
  handleGeo.computeVertexNormals();
  
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.position.set(0.03, 0, 0);
  handle.rotation.z = -Math.PI / 12;
  applyShadows(handle);
  group.add(handle);
  
  // Magazine/power cell
  const magGeo = new THREE.BoxGeometry(0.015, 0.03, 0.022);
  const magMat = new THREE.MeshStandardMaterial({ 
    color: 0x444444, 
    roughness: 0.4,
    metalness: 0.6
  });
  const mag = new THREE.Mesh(magGeo, magMat);
  mag.position.set(0.03, -0.018, 0);
  applyShadows(mag);
  group.add(mag);
  
  // Trigger
  const triggerGeo = new THREE.BoxGeometry(0.006, 0.015, 0.01);
  const trigger = new THREE.Mesh(triggerGeo, railMat);
  trigger.position.set(0.04, 0.01, 0);
  applyShadows(trigger);
  group.add(trigger);
  
  // Scope/sight on top
  const sightGeo = new THREE.BoxGeometry(0.025, 0.008, 0.008);
  const sight = new THREE.Mesh(sightGeo, railMat);
  sight.position.set(0.05, 0.053, 0);
  applyShadows(sight);
  group.add(sight);
  
  // Sight glass (red dot)
  const sightGlassGeo = new THREE.CircleGeometry(0.003, 12);
  const sightGlassMat = new THREE.MeshStandardMaterial({ 
    color: 0xff0000, 
    emissive: 0xff0000,
    emissiveIntensity: 1.0,
    transparent: true,
    opacity: 0.8
  });
  const sightGlass = new THREE.Mesh(sightGlassGeo, sightGlassMat);
  sightGlass.rotation.y = Math.PI / 2;
  sightGlass.position.set(0.0625, 0.053, 0);
  group.add(sightGlass);
  
  // Muzzle (barrel end with glow)
  const muzzleGeo = new THREE.CylinderGeometry(0.012, 0.01, 0.02, 12);
  const muzzle = new THREE.Mesh(muzzleGeo, railMat);
  muzzle.rotation.z = Math.PI / 2;
  muzzle.position.set(0.17, 0.025, 0);
  applyShadows(muzzle);
  group.add(muzzle);
  
  // Muzzle glow
  const muzzleGlowGeo = new THREE.CircleGeometry(0.015, 16);
  const muzzleGlowMat = new THREE.MeshStandardMaterial({ 
    color: 0x00ffff, 
    emissive: 0x00ffff,
    emissiveIntensity: 1.2,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide
  });
  const muzzleGlow = new THREE.Mesh(muzzleGlowGeo, muzzleGlowMat);
  muzzleGlow.rotation.y = Math.PI / 2;
  muzzleGlow.position.set(0.18, 0.025, 0);
  group.add(muzzleGlow);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createPlasmaPistol.metadata = {
  category: 'toys',
  name: 'Plasma Pistol',
  description: 'Sleek futuristic plasma pistol with energy chamber',
  dimensions: { width: 0.18, height: 0.06, depth: 0.03 },
  interactive: false
};

/**
 * Create a heavy blaster cannon
 */
function createBlasterCannon(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Main body (large, bulky)
  const bodyMat = new THREE.MeshStandardMaterial({ 
    color: 0x3a3a3a, 
    roughness: 0.5,
    metalness: 0.7
  });
  
  const bodyGeo = new THREE.BoxGeometry(0.15, 0.08, 0.06, 8, 6, 4);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.set(0.075, 0.05, 0);
  applyShadows(body);
  group.add(body);
  
  // Massive barrel assembly
  const barrelRadius = 0.03;
  const barrelLength = 0.12;
  
  const barrelGeo = new THREE.CylinderGeometry(barrelRadius, barrelRadius * 0.9, barrelLength, 16, 8);
  const barrelMat = new THREE.MeshStandardMaterial({ 
    color: 0x555555, 
    roughness: 0.3,
    metalness: 0.9
  });
  const barrel = new THREE.Mesh(barrelGeo, barrelMat);
  barrel.rotation.z = -Math.PI / 2;
  barrel.position.set(0.18, 0.06, 0);
  applyShadows(barrel);
  group.add(barrel);
  
  // Barrel cooling fins
  for (let i = 0; i < 6; i++) {
    const finGeo = new THREE.TorusGeometry(barrelRadius + 0.005, 0.003, 8, 16);
    const fin = new THREE.Mesh(finGeo, barrelMat);
    fin.rotation.y = Math.PI / 2;
    fin.position.set(0.15 + i * 0.015, 0.06, 0);
    group.add(fin);
  }
  
  // Secondary barrel (under)
  const barrel2Geo = new THREE.CylinderGeometry(0.015, 0.015, barrelLength * 0.8, 12);
  const barrel2 = new THREE.Mesh(barrel2Geo, barrelMat);
  barrel2.rotation.z = -Math.PI / 2;
  barrel2.position.set(0.16, 0.03, 0);
  applyShadows(barrel2);
  group.add(barrel2);
  
  // Power core (glowing reactor)
  const coreGeo = new THREE.SphereGeometry(0.025, 16, 16);
  const coreMat = new THREE.MeshStandardMaterial({ 
    color: 0xff4400, 
    emissive: 0xff4400,
    emissiveIntensity: 0.9,
    transparent: true,
    opacity: 0.8
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.set(0.05, 0.05, 0);
  applyShadows(core);
  group.add(core);
  
  // Core housing (frame around sphere)
  const housingGeo = new THREE.TorusGeometry(0.027, 0.004, 8, 16);
  const housingMat = new THREE.MeshStandardMaterial({ 
    color: 0x666666, 
    roughness: 0.4,
    metalness: 0.8
  });
  
  [0, Math.PI / 2].forEach(angle => {
    const housing = new THREE.Mesh(housingGeo, housingMat);
    housing.rotation.set(angle, 0, 0);
    housing.position.copy(core.position);
    group.add(housing);
  });
  
  // Heat vents (top)
  for (let i = 0; i < 8; i++) {
    const ventGeo = new THREE.BoxGeometry(0.01, 0.003, 0.04);
    const ventMat = new THREE.MeshStandardMaterial({ 
      color: 0xff6600, 
      emissive: 0xff3300,
      emissiveIntensity: 0.5
    });
    const vent = new THREE.Mesh(ventGeo, ventMat);
    vent.position.set(0.04 + i * 0.012, 0.091, 0);
    group.add(vent);
  }
  
  // Handle (under-barrel grip)
  const handleMat = new THREE.MeshStandardMaterial({ 
    color: 0x222222, 
    roughness: 0.9
  });
  
  const handleGeo = new THREE.BoxGeometry(0.025, 0.06, 0.035, 3, 6, 4);
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.position.set(0.06, 0, 0);
  handle.rotation.z = -Math.PI / 10;
  applyShadows(handle);
  group.add(handle);
  
  // Foregrip
  const foregripGeo = new THREE.BoxGeometry(0.02, 0.045, 0.028, 2, 5, 3);
  const foregrip = new THREE.Mesh(foregripGeo, handleMat);
  foregrip.position.set(0.12, 0.005, 0);
  applyShadows(foregrip);
  group.add(foregrip);
  
  // Trigger
  const triggerGeo = new THREE.BoxGeometry(0.008, 0.02, 0.012);
  const trigger = new THREE.Mesh(triggerGeo, new THREE.MeshStandardMaterial({ 
    color: 0xff0000, 
    roughness: 0.5
  }));
  trigger.position.set(0.065, 0.025, 0);
  applyShadows(trigger);
  group.add(trigger);
  
  // Ammo/power indicator (display panel)
  const displayGeo = new THREE.BoxGeometry(0.03, 0.015, 0.002);
  const displayMat = new THREE.MeshStandardMaterial({ 
    color: 0x00ff88, 
    emissive: 0x00ff88,
    emissiveIntensity: 0.8
  });
  const display = new THREE.Mesh(displayGeo, displayMat);
  display.position.set(0.035, 0.055, 0.031);
  group.add(display);
  
  // Muzzle brake (multi-port)
  const brakeGeo = new THREE.CylinderGeometry(barrelRadius + 0.01, barrelRadius + 0.015, 0.025, 6);
  const brake = new THREE.Mesh(brakeGeo, barrelMat);
  brake.rotation.z = -Math.PI / 2;
  brake.position.set(0.24, 0.06, 0);
  applyShadows(brake);
  group.add(brake);
  
  // Port holes in brake
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const portGeo = new THREE.BoxGeometry(0.03, 0.008, 0.005);
    const port = new THREE.Mesh(portGeo, new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
    port.position.set(
      0.24,
      0.06 + Math.sin(angle) * (barrelRadius + 0.013),
      Math.cos(angle) * (barrelRadius + 0.013)
    );
    port.rotation.set(0, Math.PI / 2, angle);
    group.add(port);
  }
  
  // Muzzle flash effect
  const flashGeo = new THREE.ConeGeometry(0.04, 0.06, 8);
  const flashMat = new THREE.MeshStandardMaterial({ 
    color: 0xffff00, 
    emissive: 0xffff00,
    emissiveIntensity: 1.5,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide
  });
  const flash = new THREE.Mesh(flashGeo, flashMat);
  flash.rotation.z = -Math.PI / 2;
  flash.position.set(0.28, 0.06, 0);
  group.add(flash);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createBlasterCannon.metadata = {
  category: 'toys',
  name: 'Blaster Cannon',
  description: 'Heavy duty sci-fi blaster cannon with power core',
  dimensions: { width: 0.28, height: 0.1, depth: 0.06 },
  interactive: false
};

/**
 * Create a laser rifle
 */
function createLaserRifle(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Rifle body (long, tactical)
  const bodyMat = new THREE.MeshStandardMaterial({ 
    color: 0x2a3a2a, 
    roughness: 0.6,
    metalness: 0.4
  });
  
  const bodyGeo = new THREE.BoxGeometry(0.25, 0.035, 0.035, 12, 4, 4);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.set(0.125, 0.035, 0);
  applyShadows(body);
  group.add(body);
  
  // Upper rail system
  const railMat = new THREE.MeshStandardMaterial({ 
    color: 0x1a1a1a, 
    roughness: 0.3,
    metalness: 0.9
  });
  
  const railGeo = new THREE.BoxGeometry(0.2, 0.006, 0.012);
  const rail = new THREE.Mesh(railGeo, railMat);
  rail.position.set(0.125, 0.056, 0);
  applyShadows(rail);
  group.add(rail);
  
  // Rail notches (picatinny style)
  for (let i = 0; i < 15; i++) {
    const notchGeo = new THREE.BoxGeometry(0.008, 0.003, 0.012);
    const notch = new THREE.Mesh(notchGeo, railMat);
    notch.position.set(0.03 + i * 0.013, 0.059, 0);
    group.add(notch);
  }
  
  // Laser emitter assembly
  const emitterGeo = new THREE.CylinderGeometry(0.015, 0.018, 0.06, 12);
  const emitterMat = new THREE.MeshStandardMaterial({ 
    color: 0x444444, 
    roughness: 0.2,
    metalness: 0.9
  });
  const emitter = new THREE.Mesh(emitterGeo, emitterMat);
  emitter.rotation.z = -Math.PI / 2;
  emitter.position.set(0.27, 0.035, 0);
  applyShadows(emitter);
  group.add(emitter);
  
  // Focusing lens (clear blue)
  const lensGeo = new THREE.CircleGeometry(0.014, 16);
  const lensMat = new THREE.MeshStandardMaterial({ 
    color: 0x0088ff, 
    emissive: 0x0088ff,
    emissiveIntensity: 1.0,
    transparent: true,
    opacity: 0.7
  });
  const lens = new THREE.Mesh(lensGeo, lensMat);
  lens.rotation.y = Math.PI / 2;
  lens.position.set(0.301, 0.035, 0);
  group.add(lens);
  
  // Stock (adjustable)
  const stockGeo = new THREE.BoxGeometry(0.08, 0.03, 0.03, 4, 3, 3);
  const stock = new THREE.Mesh(stockGeo, bodyMat);
  stock.position.set(-0.04, 0.035, 0);
  applyShadows(stock);
  group.add(stock);
  
  // Stock pad
  const padGeo = new THREE.BoxGeometry(0.01, 0.04, 0.035);
  const padMat = new THREE.MeshStandardMaterial({ 
    color: 0x333333, 
    roughness: 0.95
  });
  const pad = new THREE.Mesh(padGeo, padMat);
  pad.position.set(-0.085, 0.035, 0);
  applyShadows(pad);
  group.add(pad);
  
  // Stock tube (connecting)
  const tubeGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.08, 8);
  const tube = new THREE.Mesh(tubeGeo, railMat);
  tube.rotation.z = Math.PI / 2;
  tube.position.set(-0.04, 0.038, 0);
  group.add(tube);
  
  // Handle
  const handleMat = new THREE.MeshStandardMaterial({ 
    color: 0x222222, 
    roughness: 0.9
  });
  
  const handleGeo = new THREE.BoxGeometry(0.02, 0.055, 0.03, 2, 6, 3);
  const handlePositions = handleGeo.attributes.position;
  
  // Grip texture
  for (let i = 0; i < handlePositions.count; i++) {
    const y = handlePositions.getY(i);
    const texture = Math.sin(y * 40) * 0.002;
    handlePositions.setX(i, handlePositions.getX(i) + texture);
  }
  handleGeo.computeVertexNormals();
  
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.position.set(0.05, 0.005, 0);
  handle.rotation.z = -Math.PI / 12;
  applyShadows(handle);
  group.add(handle);
  
  // Trigger
  const triggerGeo = new THREE.BoxGeometry(0.006, 0.015, 0.01);
  const trigger = new THREE.Mesh(triggerGeo, railMat);
  trigger.position.set(0.06, 0.025, 0);
  applyShadows(trigger);
  group.add(trigger);
  
  // Trigger guard
  const guardGeo = new THREE.TorusGeometry(0.018, 0.002, 8, 16, Math.PI * 1.6);
  const guard = new THREE.Mesh(guardGeo, railMat);
  guard.rotation.set(Math.PI / 2, 0, -Math.PI / 2);
  guard.position.set(0.06, 0.025, 0);
  group.add(guard);
  
  // Magazine/power cell
  const magGeo = new THREE.BoxGeometry(0.015, 0.04, 0.025);
  const magMat = new THREE.MeshStandardMaterial({ 
    color: 0x00ffff, 
    emissive: 0x00ffff,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.6
  });
  const mag = new THREE.Mesh(magGeo, magMat);
  mag.position.set(0.08, 0.005, 0);
  applyShadows(mag);
  group.add(mag);
  
  // Foregrip
  const foregripGeo = new THREE.CylinderGeometry(0.012, 0.01, 0.045, 12);
  const foregrip = new THREE.Mesh(foregripGeo, handleMat);
  foregrip.position.set(0.15, 0.005, 0);
  applyShadows(foregrip);
  group.add(foregrip);
  
  // Scope
  const scopeBodyGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.08, 12);
  const scopeMat = new THREE.MeshStandardMaterial({ 
    color: 0x1a1a1a, 
    roughness: 0.3,
    metalness: 0.7
  });
  const scopeBody = new THREE.Mesh(scopeBodyGeo, scopeMat);
  scopeBody.rotation.z = Math.PI / 2;
  scopeBody.position.set(0.12, 0.075, 0);
  applyShadows(scopeBody);
  group.add(scopeBody);
  
  // Scope lens (front)
  const scopeLensGeo = new THREE.CircleGeometry(0.009, 16);
  const scopeLensMat = new THREE.MeshStandardMaterial({ 
    color: 0xff4400, 
    emissive: 0xff4400,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.5
  });
  const scopeLens = new THREE.Mesh(scopeLensGeo, scopeLensMat);
  scopeLens.rotation.y = Math.PI / 2;
  scopeLens.position.set(0.16, 0.075, 0);
  group.add(scopeLens);
  
  // Scope mounts
  for (let i = 0; i < 2; i++) {
    const mountGeo = new THREE.BoxGeometry(0.015, 0.015, 0.02);
    const mount = new THREE.Mesh(mountGeo, railMat);
    mount.position.set(0.09 + i * 0.06, 0.065, 0);
    group.add(mount);
  }
  
  // Laser sight (under-barrel)
  const laserGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.03, 8);
  const laser = new THREE.Mesh(laserGeo, railMat);
  laser.rotation.z = Math.PI / 2;
  laser.position.set(0.18, 0.015, -0.02);
  group.add(laser);
  
  // Laser beam indicator (red dot)
  const laserDotGeo = new THREE.CircleGeometry(0.003, 8);
  const laserDotMat = new THREE.MeshStandardMaterial({ 
    color: 0xff0000, 
    emissive: 0xff0000,
    emissiveIntensity: 1.0
  });
  const laserDot = new THREE.Mesh(laserDotGeo, laserDotMat);
  laserDot.rotation.y = Math.PI / 2;
  laserDot.position.set(0.195, 0.015, -0.02);
  group.add(laserDot);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createLaserRifle.metadata = {
  category: 'toys',
  name: 'Laser Rifle',
  description: 'Tactical laser rifle with scope and accessories',
  dimensions: { width: 0.3, height: 0.09, depth: 0.04 },
  interactive: false
};

/**
 * Create a compact zapper pistol
 */
function createZapperPistol(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const gunColor = spec.color || 0xffaa00;
  
  // Compact body (small, toy-like but detailed)
  const bodyMat = new THREE.MeshStandardMaterial({ 
    color: gunColor, 
    roughness: 0.4,
    metalness: 0.3
  });
  
  const bodyGeo = new THREE.BoxGeometry(0.08, 0.03, 0.025, 4, 3, 2);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.set(0.04, 0.025, 0);
  applyShadows(body);
  group.add(body);
  
  // Transparent energy chamber (visible electricity)
  const chamberGeo = new THREE.SphereGeometry(0.012, 16, 16);
  const chamberMat = new THREE.MeshStandardMaterial({ 
    color: 0x00ffff, 
    emissive: 0x00ffff,
    emissiveIntensity: 1.0,
    transparent: true,
    opacity: 0.6
  });
  const chamber = new THREE.Mesh(chamberGeo, chamberMat);
  chamber.position.set(0.05, 0.025, 0);
  group.add(chamber);
  
  // Energy coils around chamber
  for (let i = 0; i < 3; i++) {
    const coilGeo = new THREE.TorusGeometry(0.014 + i * 0.002, 0.001, 8, 16);
    const coilMat = new THREE.MeshStandardMaterial({ 
      color: 0xffff00, 
      emissive: 0xffff00,
      emissiveIntensity: 0.8
    });
    const coil = new THREE.Mesh(coilGeo, coilMat);
    coil.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    coil.position.copy(chamber.position);
    group.add(coil);
  }
  
  // Barrel (short, wide)
  const barrelGeo = new THREE.CylinderGeometry(0.01, 0.015, 0.04, 12);
  const barrelMat = new THREE.MeshStandardMaterial({ 
    color: 0x888888, 
    roughness: 0.2,
    metalness: 0.9
  });
  const barrel = new THREE.Mesh(barrelGeo, barrelMat);
  barrel.rotation.z = -Math.PI / 2;
  barrel.position.set(0.1, 0.025, 0);
  applyShadows(barrel);
  group.add(barrel);
  
  // Handle (compact)
  const handleMat = new THREE.MeshStandardMaterial({ 
    color: 0x1a1a1a, 
    roughness: 0.85
  });
  
  const handleGeo = new THREE.BoxGeometry(0.015, 0.04, 0.022, 2, 4, 2);
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.position.set(0.03, 0.003, 0);
  handle.rotation.z = -Math.PI / 16;
  applyShadows(handle);
  group.add(handle);
  
  // Trigger
  const triggerGeo = new THREE.BoxGeometry(0.005, 0.012, 0.008);
  const trigger = new THREE.Mesh(triggerGeo, new THREE.MeshStandardMaterial({ 
    color: 0xff0000, 
    roughness: 0.6
  }));
  trigger.position.set(0.035, 0.015, 0);
  applyShadows(trigger);
  group.add(trigger);
  
  // LED indicators (3 lights)
  for (let i = 0; i < 3; i++) {
    const ledGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.001, 8);
    const ledColor = i === 0 ? 0x00ff00 : i === 1 ? 0xffff00 : 0xff0000;
    const ledMat = new THREE.MeshStandardMaterial({ 
      color: ledColor, 
      emissive: ledColor,
      emissiveIntensity: 0.9
    });
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.rotation.z = Math.PI / 2;
    led.position.set(0.025 + i * 0.008, 0.041, 0.01);
    group.add(led);
  }
  
  // Barrel rings (decorative)
  for (let i = 0; i < 2; i++) {
    const ringGeo = new THREE.TorusGeometry(0.012, 0.002, 6, 12);
    const ring = new THREE.Mesh(ringGeo, barrelMat);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(0.09 + i * 0.015, 0.025, 0);
    group.add(ring);
  }
  
  // Muzzle flash
  const flashGeo = new THREE.SphereGeometry(0.018, 8, 8);
  const flashMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    emissive: 0xffffff,
    emissiveIntensity: 1.5,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  });
  const flash = new THREE.Mesh(flashGeo, flashMat);
  flash.position.set(0.12, 0.025, 0);
  group.add(flash);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createZapperPistol.metadata = {
  category: 'toys',
  name: 'Zapper Pistol',
  description: 'Compact energy zapper with visible power core',
  dimensions: { width: 0.12, height: 0.045, depth: 0.025 },
  interactive: false
};

// Export all toys creators
export const creators = {
  jengatower: createJengaTower,
  jengatowermessy: createJengaTowerMessy,
  pixarball: createPixarBall,
  basketball: createBasketball,
  baseball: createBaseball,
  garbagecan: createGarbageCan,
  crumpledpaper: createCrumpledPaper,
  toycar: createToyCar,
  toytrain: createToyTrain,
  traintrack: createTrainTrack,
  teddybear: createTeddyBear,
  kidsbedboy: createKidsBedBoy,
  kidsbedgirl: createKidsBedGirl,
  
  // Sci-Fi Ray Guns
  retroraygun: createRetroRayGun,
  raygun: createRetroRayGun,
  plasmapistol: createPlasmaPistol,
  blastercannon: createBlasterCannon,
  heavyblaster: createBlasterCannon,
  laserrifle: createLaserRifle,
  zapperpistol: createZapperPistol,
  zapper: createZapperPistol
};




