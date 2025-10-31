// ==================== CITY & URBAN ASSET CREATORS ====================
// Street props, money, and urban items

import { createPositionedGroup, applyShadows } from '../asset-context.js';

/**
 * Create a newspaper
 */
function createNewspaper(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const isFolded = spec.folded !== false; // Default folded
  
  const paperMat = new THREE.MeshStandardMaterial({ 
    color: 0xf5f5dc, 
    roughness: 0.9,
    side: THREE.DoubleSide
  });
  
  const textMat = new THREE.MeshStandardMaterial({ 
    color: 0x1a1a1a, 
    roughness: 0.95 
  });
  
  if (isFolded) {
    // Folded newspaper
    const width = 0.3;
    const height = 0.4;
    const thickness = 0.015;
    
    // Main folded body
    const bodyGeo = new THREE.BoxGeometry(width, height, thickness, 4, 6, 2);
    const bodyPositions = bodyGeo.attributes.position;
    
    // Add slight curve/rumple
    for (let i = 0; i < bodyPositions.count; i++) {
      const x = bodyPositions.getX(i);
      const y = bodyPositions.getY(i);
      const rumple = Math.sin(x * 8) * 0.003 + Math.sin(y * 6) * 0.002;
      bodyPositions.setZ(i, bodyPositions.getZ(i) + rumple);
    }
    bodyGeo.computeVertexNormals();
    
    const body = new THREE.Mesh(bodyGeo, paperMat);
    body.position.y = thickness / 2;
    applyShadows(body);
    group.add(body);
    
    // Fold crease
    const creaseGeo = new THREE.BoxGeometry(width * 0.95, 0.002, thickness + 0.002);
    const crease = new THREE.Mesh(creaseGeo, new THREE.MeshStandardMaterial({ color: 0xe0e0d0, roughness: 0.95 }));
    crease.position.y = thickness / 2;
    group.add(crease);
    
    // Headline text blocks (fake text)
    for (let i = 0; i < 3; i++) {
      const textGeo = new THREE.BoxGeometry(width * 0.7, 0.03, 0.001);
      const text = new THREE.Mesh(textGeo, textMat);
      text.position.set(0, thickness / 2 + height * 0.35 - i * 0.08, thickness / 2 + 0.001);
      group.add(text);
    }
    
    // Smaller text lines
    for (let i = 0; i < 8; i++) {
      const lineGeo = new THREE.BoxGeometry(width * 0.8, 0.008, 0.0005);
      const line = new THREE.Mesh(lineGeo, textMat);
      line.position.set(0, thickness / 2 + height * 0.15 - i * 0.025, thickness / 2 + 0.001);
      group.add(line);
    }
    
  } else {
    // Open/flat newspaper
    const width = 0.6;
    const height = 0.4;
    
    const flatGeo = new THREE.PlaneGeometry(width, height, 8, 6);
    const flatPositions = flatGeo.attributes.position;
    
    // Slight warping
    for (let i = 0; i < flatPositions.count; i++) {
      const x = flatPositions.getX(i);
      const y = flatPositions.getY(i);
      const warp = Math.sin(x * 5) * 0.005 + Math.sin(y * 4) * 0.003;
      flatPositions.setZ(i, warp);
    }
    flatGeo.computeVertexNormals();
    
    const flat = new THREE.Mesh(flatGeo, paperMat);
    flat.rotation.x = -Math.PI / 2;
    flat.position.y = 0.001;
    applyShadows(flat);
    group.add(flat);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createNewspaper.metadata = {
  category: 'city',
  name: 'Newspaper',
  description: 'Folded or flat newspaper',
  dimensions: { width: 0.3, height: 0.015, depth: 0.4 },
  interactive: false
};

/**
 * Create street trash (crumpled wrapper/bag)
 */
function createStreetTrash(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const trashColor = spec.color || [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3][Math.floor(Math.random() * 4)];
  
  // Crumpled wrapper using deformed sphere
  const trashGeo = new THREE.IcosahedronGeometry(0.04, 2);
  const positions = trashGeo.attributes.position;
  
  // Heavy deformation for crumpled look
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    
    const noise = Math.sin(x * 20) * Math.cos(y * 18) * Math.sin(z * 22);
    const crumple = 1 + noise * 0.4;
    
    positions.setX(i, x * crumple);
    positions.setY(i, y * crumple * 0.7);
    positions.setZ(i, z * crumple);
  }
  trashGeo.computeVertexNormals();
  
  const trashMat = new THREE.MeshStandardMaterial({ 
    color: trashColor, 
    roughness: 0.8,
    metalness: 0.1
  });
  
  const trash = new THREE.Mesh(trashGeo, trashMat);
  trash.position.y = 0.02;
  applyShadows(trash);
  group.add(trash);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createStreetTrash.metadata = {
  category: 'city',
  name: 'Street Trash',
  description: 'Crumpled wrapper or bag on street',
  dimensions: { width: 0.08, height: 0.04, depth: 0.08 },
  interactive: false
};

/**
 * Create a trash bag
 */
function createTrashBag(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const bagColor = spec.color || 0x1a1a1a;
  const size = spec.size || 0.25;
  
  // Bag body (bulgy, lumpy)
  const bagGeo = new THREE.SphereGeometry(size, 16, 12, 0, Math.PI * 2, 0, Math.PI);
  const positions = bagGeo.attributes.position;
  
  // Deform for lumpy garbage bag look
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    
    const lump = Math.sin(x * 12) * Math.cos(z * 10) * 0.08;
    const radius = Math.sqrt(x * x + z * z);
    if (radius > 0) {
      const scale = (radius + lump) / radius;
      positions.setX(i, x * scale);
      positions.setZ(i, z * scale);
    }
    
    // Sag at bottom
    const sag = (1 - y / size) * 0.05;
    positions.setY(i, y - sag);
  }
  bagGeo.computeVertexNormals();
  
  const bagMat = new THREE.MeshStandardMaterial({ 
    color: bagColor, 
    roughness: 0.7,
    side: THREE.DoubleSide
  });
  
  const bag = new THREE.Mesh(bagGeo, bagMat);
  bag.position.y = 0.001;
  applyShadows(bag);
  group.add(bag);
  
  // Tied top (twisted plastic)
  const tieGeo = new THREE.TorusGeometry(size * 0.3, 0.015, 8, 12, Math.PI * 1.5);
  const tie = new THREE.Mesh(tieGeo, bagMat);
  tie.rotation.set(Math.PI / 3, Math.PI / 6, 0);
  tie.position.y = size * 0.8;
  applyShadows(tie);
  group.add(tie);
  
  // Tie ends
  for (let i = 0; i < 2; i++) {
    const endGeo = new THREE.CylinderGeometry(0.012, 0.008, 0.06, 8);
    const end = new THREE.Mesh(endGeo, bagMat);
    end.position.set(
      i === 0 ? -size * 0.25 : size * 0.2,
      size * 0.85,
      i === 0 ? -size * 0.15 : size * 0.18
    );
    end.rotation.set(
      i === 0 ? Math.PI / 4 : -Math.PI / 5,
      i === 0 ? Math.PI / 6 : -Math.PI / 8,
      i === 0 ? Math.PI / 3 : -Math.PI / 4
    );
    applyShadows(end);
    group.add(end);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createTrashBag.metadata = {
  category: 'city',
  name: 'Trash Bag',
  description: 'Black garbage bag tied at top',
  dimensions: { width: 0.5, height: 0.25, depth: 0.5 },
  interactive: false
};

/**
 * Create a Chinese takeout box
 */
function createTakeoutBox(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const boxColor = 0xffffff;
  const height = 0.1;
  const bottomWidth = 0.06;
  const topWidth = 0.075;
  
  // Box body (trapezoid shape)
  const bodyGeo = new THREE.CylinderGeometry(topWidth / 2, bottomWidth / 2, height, 4);
  const bodyMat = new THREE.MeshStandardMaterial({ 
    color: boxColor, 
    roughness: 0.7 
  });
  
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = height / 2;
  applyShadows(body);
  group.add(body);
  
  // Red decorative pattern (iconic design)
  const patternMat = new THREE.MeshStandardMaterial({ 
    color: 0xcc0000, 
    roughness: 0.8 
  });
  
  // Pagoda design on sides
  for (let side = 0; side < 4; side++) {
    const angle = (side / 4) * Math.PI * 2 + Math.PI / 4;
    
    // Vertical red line
    const lineGeo = new THREE.BoxGeometry(0.002, height * 0.7, 0.001);
    const line = new THREE.Mesh(lineGeo, patternMat);
    line.position.set(
      Math.cos(angle) * (bottomWidth / 2 + topWidth / 2) / 2 * 0.9,
      height / 2,
      Math.sin(angle) * (bottomWidth / 2 + topWidth / 2) / 2 * 0.9
    );
    line.rotation.y = -angle + Math.PI / 2;
    group.add(line);
    
    // Small decorative elements
    for (let i = 0; i < 3; i++) {
      const dotGeo = new THREE.BoxGeometry(0.008, 0.003, 0.001);
      const dot = new THREE.Mesh(dotGeo, patternMat);
      dot.position.set(
        Math.cos(angle) * (bottomWidth / 2 + topWidth / 2) / 2 * 0.9,
        height * 0.65 - i * 0.02,
        Math.sin(angle) * (bottomWidth / 2 + topWidth / 2) / 2 * 0.9
      );
      dot.rotation.y = -angle + Math.PI / 2;
      group.add(dot);
    }
  }
  
  // Wire handle
  const handleMat = new THREE.MeshStandardMaterial({ 
    color: 0xdddddd, 
    roughness: 0.3,
    metalness: 0.7 
  });
  
  const handleGeo = new THREE.TorusGeometry(topWidth / 2 + 0.01, 0.002, 6, 16, Math.PI);
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.rotation.x = Math.PI / 2;
  handle.position.y = height + 0.02;
  applyShadows(handle);
  group.add(handle);
  
  // Handle attachment points
  for (let i = 0; i < 2; i++) {
    const attachGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.01, 8);
    const attach = new THREE.Mesh(attachGeo, handleMat);
    attach.position.set(i === 0 ? -(topWidth / 2 + 0.01) : (topWidth / 2 + 0.01), height, 0);
    group.add(attach);
  }
  
  // Top flaps (four trapezoid flaps)
  const flapMat = new THREE.MeshStandardMaterial({ 
    color: boxColor, 
    roughness: 0.7,
    side: THREE.DoubleSide 
  });
  
  for (let i = 0; i < 4; i++) {
    const flapGeo = new THREE.BoxGeometry(topWidth * 0.8, 0.001, 0.025, 1, 1, 2);
    const flap = new THREE.Mesh(flapGeo, flapMat);
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    flap.position.set(
      Math.cos(angle) * topWidth / 2 * 0.7,
      height + 0.001,
      Math.sin(angle) * topWidth / 2 * 0.7
    );
    flap.rotation.y = angle - Math.PI / 2;
    flap.rotation.x = -Math.PI / 6;
    group.add(flap);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createTakeoutBox.metadata = {
  category: 'city',
  name: 'Chinese Takeout Box',
  description: 'White takeout box with red pagoda design',
  dimensions: { width: 0.075, height: 0.12, depth: 0.075 },
  interactive: false
};

/**
 * Create a coin with beveled edges
 */
function createCoin(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const coinType = spec.type || 'quarter'; // penny, nickel, dime, quarter
  const coinData = {
    penny: { radius: 0.0095, color: 0xb87333, value: 0.01 },
    nickel: { radius: 0.0105, color: 0xc0c0c0, value: 0.05 },
    dime: { radius: 0.009, color: 0xd3d3d3, value: 0.10 },
    quarter: { radius: 0.012, color: 0xc0c0c0, value: 0.25 }
  };
  
  const data = coinData[coinType] || coinData.quarter;
  const thickness = 0.0015;
  
  const coinMat = new THREE.MeshStandardMaterial({ 
    color: data.color, 
    roughness: 0.3,
    metalness: 0.8 
  });
  
  // Main coin body
  const bodyGeo = new THREE.CylinderGeometry(data.radius, data.radius, thickness, 32);
  const body = new THREE.Mesh(bodyGeo, coinMat);
  body.position.y = thickness / 2;
  applyShadows(body);
  group.add(body);
  
  // Beveled edge (torus)
  const bevelGeo = new THREE.TorusGeometry(data.radius, thickness / 2, 8, 32);
  const bevel = new THREE.Mesh(bevelGeo, coinMat);
  bevel.rotation.x = Math.PI / 2;
  bevel.position.y = thickness / 2;
  group.add(bevel);
  
  // Edge ridges (reeding)
  const ridgeCount = 50;
  for (let i = 0; i < ridgeCount; i++) {
    const angle = (i / ridgeCount) * Math.PI * 2;
    const ridgeGeo = new THREE.BoxGeometry(0.0002, thickness, 0.0003);
    const ridge = new THREE.Mesh(ridgeGeo, new THREE.MeshStandardMaterial({ 
      color: data.color, 
      roughness: 0.4,
      metalness: 0.75 
    }));
    ridge.position.set(
      Math.cos(angle) * data.radius,
      thickness / 2,
      Math.sin(angle) * data.radius
    );
    ridge.rotation.y = angle;
    group.add(ridge);
  }
  
  // Face details (simple embossed circle)
  const faceGeo = new THREE.CircleGeometry(data.radius * 0.8, 24);
  const faceMat = new THREE.MeshStandardMaterial({ 
    color: data.color, 
    roughness: 0.35,
    metalness: 0.75 
  });
  
  const topFace = new THREE.Mesh(faceGeo, faceMat);
  topFace.rotation.x = -Math.PI / 2;
  topFace.position.y = thickness + 0.0001;
  group.add(topFace);
  
  const bottomFace = new THREE.Mesh(faceGeo, faceMat);
  bottomFace.rotation.x = Math.PI / 2;
  bottomFace.position.y = -0.0001;
  group.add(bottomFace);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createCoin.metadata = {
  category: 'city',
  name: 'Coin',
  description: 'US coin with beveled edges (penny, nickel, dime, quarter)',
  dimensions: { width: 0.024, height: 0.0015, depth: 0.024 },
  interactive: false
};

/**
 * Create paper money
 */
function createPaperMoney(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const denomination = spec.denomination || 20; // 1, 5, 10, 20, 50, 100
  const billColors = {
    1: 0x6b8e6b,
    5: 0x7b8e7b,
    10: 0x8b9e8b,
    20: 0x9bae9b,
    50: 0xabbeab,
    100: 0xbccebc
  };
  
  const billColor = billColors[denomination] || 0x9bae9b;
  const width = 0.156;
  const height = 0.066;
  const thickness = 0.0001;
  
  const billMat = new THREE.MeshStandardMaterial({ 
    color: billColor, 
    roughness: 0.8,
    side: THREE.DoubleSide
  });
  
  // Bill body
  const billGeo = new THREE.BoxGeometry(width, height, thickness, 4, 2, 1);
  const positions = billGeo.attributes.position;
  
  // Slight curl
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const curl = Math.sin(x / width * Math.PI * 2) * 0.003;
    positions.setZ(i, positions.getZ(i) + curl);
  }
  billGeo.computeVertexNormals();
  
  const bill = new THREE.Mesh(billGeo, billMat);
  bill.rotation.x = -Math.PI / 2;
  bill.position.y = thickness;
  applyShadows(bill);
  group.add(bill);
  
  // Decorative border
  const borderMat = new THREE.MeshStandardMaterial({ 
    color: 0x2a4a2a, 
    roughness: 0.9 
  });
  
  // Border rectangles
  const borderThickness = 0.003;
  [
    [width, borderThickness], // top/bottom
    [borderThickness, height]  // left/right
  ].forEach((dims, idx) => {
    if (idx === 0) {
      // Top and bottom
      [-height / 2, height / 2].forEach(y => {
        const border = new THREE.Mesh(
          new THREE.BoxGeometry(dims[0] * 0.95, dims[1], 0.00015),
          borderMat
        );
        border.rotation.x = -Math.PI / 2;
        border.position.set(0, thickness + 0.0001, y);
        group.add(border);
      });
    } else {
      // Left and right
      [-width / 2, width / 2].forEach(x => {
        const border = new THREE.Mesh(
          new THREE.BoxGeometry(dims[1] * 0.95, dims[0], 0.00015),
          borderMat
        );
        border.rotation.x = -Math.PI / 2;
        border.rotation.z = Math.PI / 2;
        border.position.set(x, thickness + 0.0001, 0);
        group.add(border);
      });
    }
  });
  
  // Number in center
  const numberGeo = new THREE.BoxGeometry(width * 0.15, height * 0.3, 0.0002);
  const number = new THREE.Mesh(numberGeo, borderMat);
  number.rotation.x = -Math.PI / 2;
  number.position.set(0, thickness + 0.0002, 0);
  group.add(number);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createPaperMoney.metadata = {
  category: 'city',
  name: 'Paper Money',
  description: 'US dollar bill (specify denomination: 1, 5, 10, 20, 50, 100)',
  dimensions: { width: 0.156, height: 0.0001, depth: 0.066 },
  interactive: false
};

/**
 * Create a credit card
 */
function createCreditCard(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const cardColor = spec.color || 0x4169e1;
  const width = 0.0856;
  const height = 0.0539;
  const thickness = 0.0008;
  
  const cardMat = new THREE.MeshStandardMaterial({ 
    color: cardColor, 
    roughness: 0.3,
    metalness: 0.4
  });
  
  // Card body with rounded corners
  const cardGeo = new THREE.BoxGeometry(width, height, thickness, 8, 5, 1);
  const positions = cardGeo.attributes.position;
  
  // Round corners
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    
    const cornerRadius = 0.004;
    const edgeX = width / 2 - cornerRadius;
    const edgeY = height / 2 - cornerRadius;
    
    if (Math.abs(x) > edgeX && Math.abs(y) > edgeY) {
      const dx = Math.abs(x) - edgeX;
      const dy = Math.abs(y) - edgeY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > cornerRadius) {
        const scale = cornerRadius / dist;
        positions.setX(i, Math.sign(x) * (edgeX + dx * scale));
        positions.setY(i, Math.sign(y) * (edgeY + dy * scale));
      }
    }
  }
  cardGeo.computeVertexNormals();
  
  const card = new THREE.Mesh(cardGeo, cardMat);
  card.rotation.x = -Math.PI / 2;
  card.position.y = thickness;
  applyShadows(card);
  group.add(card);
  
  // Magnetic stripe
  const stripeMat = new THREE.MeshStandardMaterial({ 
    color: 0x1a1a1a, 
    roughness: 0.4,
    metalness: 0.2
  });
  const stripeGeo = new THREE.BoxGeometry(width * 0.95, height * 0.18, 0.0001);
  const stripe = new THREE.Mesh(stripeGeo, stripeMat);
  stripe.rotation.x = -Math.PI / 2;
  stripe.position.set(0, thickness + 0.0001, height * 0.28);
  group.add(stripe);
  
  // Chip (EMV)
  const chipMat = new THREE.MeshStandardMaterial({ 
    color: 0xffd700, 
    roughness: 0.2,
    metalness: 0.9
  });
  const chipGeo = new THREE.BoxGeometry(0.012, 0.01, 0.0002);
  const chip = new THREE.Mesh(chipGeo, chipMat);
  chip.rotation.x = -Math.PI / 2;
  chip.position.set(-width * 0.25, thickness + 0.0002, -height * 0.15);
  group.add(chip);
  
  // Chip grid pattern
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const dotGeo = new THREE.BoxGeometry(0.0015, 0.0015, 0.0001);
      const dot = new THREE.Mesh(dotGeo, new THREE.MeshStandardMaterial({ color: 0xb8860b, roughness: 0.3 }));
      dot.rotation.x = -Math.PI / 2;
      dot.position.set(
        -width * 0.25 - 0.004 + i * 0.004,
        thickness + 0.0003,
        -height * 0.15 - 0.0035 + j * 0.0035
      );
      group.add(dot);
    }
  }
  
  // Card number (embossed rectangles)
  const numberMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    roughness: 0.4
  });
  
  for (let i = 0; i < 16; i++) {
    const digitGeo = new THREE.BoxGeometry(0.004, 0.006, 0.0003);
    const digit = new THREE.Mesh(digitGeo, numberMat);
    digit.rotation.x = -Math.PI / 2;
    const row = Math.floor(i / 4);
    const col = i % 4;
    digit.position.set(
      -width * 0.35 + col * 0.0055 + row * 0.023,
      thickness + 0.0003,
      height * 0.05
    );
    group.add(digit);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createCreditCard.metadata = {
  category: 'city',
  name: 'Credit Card',
  description: 'Credit card with chip and magnetic stripe',
  dimensions: { width: 0.0856, height: 0.0008, depth: 0.0539 },
  interactive: false
};

// Export all city creators
export const creators = {
  newspaper: createNewspaper,
  streettrash: createStreetTrash,
  trashbag: createTrashBag,
  takeoutbox: createTakeoutBox,
  chinesetakeout: createTakeoutBox,
  coin: createCoin,
  penny: (spec, THREE, context) => createCoin({ ...spec, type: 'penny' }, THREE, context),
  nickel: (spec, THREE, context) => createCoin({ ...spec, type: 'nickel' }, THREE, context),
  dime: (spec, THREE, context) => createCoin({ ...spec, type: 'dime' }, THREE, context),
  quarter: (spec, THREE, context) => createCoin({ ...spec, type: 'quarter' }, THREE, context),
  dollar: createPaperMoney,
  papermoney: createPaperMoney,
  creditcard: createCreditCard
};

