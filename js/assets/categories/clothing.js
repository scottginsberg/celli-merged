// ==================== CLOTHING & CHORES ASSET CREATORS ====================
// Laundry, clothing, and footwear creation functions
// COMPLETELY REBUILT with proper garment construction principles

import { createPositionedGroup, applyShadows } from '../asset-context.js';

/**
 * Create a washing machine
 */
function createWashingMachine(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.4, metalness: 0.3 });
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.2, metalness: 0.5 });
  const glassMat = new THREE.MeshStandardMaterial({ 
    color: 0x88ccff, 
    transparent: true, 
    opacity: 0.6, 
    roughness: 0.1 
  });
  
  // Main body
  const bodyGeo = new THREE.BoxGeometry(0.12, 0.15, 0.12);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.075;
  applyShadows(body);
  group.add(body);
  
  // Top panel
  const topGeo = new THREE.BoxGeometry(0.122, 0.01, 0.122);
  const top = new THREE.Mesh(topGeo, bodyMat);
  top.position.y = 0.155;
  applyShadows(top);
  group.add(top);
  
  // Front door frame
  const doorFrameGeo = new THREE.BoxGeometry(0.095, 0.095, 0.008);
  const doorFrame = new THREE.Mesh(doorFrameGeo, doorMat);
  doorFrame.position.set(0, 0.065, 0.062);
  applyShadows(doorFrame);
  group.add(doorFrame);
  
  // Glass window (circular)
  const windowGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.006, 32);
  const window = new THREE.Mesh(windowGeo, glassMat);
  window.rotation.x = Math.PI / 2;
  window.position.set(0, 0.065, 0.063);
  applyShadows(window);
  group.add(window);
  
  // Door seal (rubber ring)
  const sealGeo = new THREE.TorusGeometry(0.038, 0.003, 8, 24);
  const sealMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 });
  const seal = new THREE.Mesh(sealGeo, sealMat);
  seal.position.set(0, 0.065, 0.064);
  applyShadows(seal);
  group.add(seal);
  
  // Control panel
  const panelGeo = new THREE.BoxGeometry(0.1, 0.025, 0.005);
  const panelMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.3 });
  const panel = new THREE.Mesh(panelGeo, panelMat);
  panel.position.set(0, 0.135, 0.062);
  applyShadows(panel);
  group.add(panel);
  
  // Buttons
  const buttonMat = new THREE.MeshStandardMaterial({ color: 0x4169e1, roughness: 0.5 });
  for (let i = 0; i < 4; i++) {
    const buttonGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.003, 12);
    const button = new THREE.Mesh(buttonGeo, buttonMat);
    button.rotation.x = Math.PI / 2;
    button.position.set(-0.035 + i * 0.023, 0.135, 0.065);
    applyShadows(button);
    group.add(button);
  }
  
  // Dial
  const dialGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.004, 24);
  const dial = new THREE.Mesh(dialGeo, new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.4 }));
  dial.rotation.x = Math.PI / 2;
  dial.position.set(0.04, 0.135, 0.065);
  applyShadows(dial);
  group.add(dial);
  
  // Detergent dispenser
  const dispenserGeo = new THREE.BoxGeometry(0.025, 0.015, 0.01);
  const dispenser = new THREE.Mesh(dispenserGeo, new THREE.MeshStandardMaterial({ color: 0x87ceeb, roughness: 0.3 }));
  dispenser.position.set(-0.045, 0.155, 0.055);
  group.add(dispenser);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createWashingMachine.metadata = {
  category: 'clothing',
  name: 'Washing Machine',
  description: 'Front-loading washing machine with control panel',
  dimensions: { width: 0.122, depth: 0.13, height: 0.16 },
  interactive: false
};

/**
 * Create an ironing board
 */
function createIroningBoard(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const boardMat = new THREE.MeshStandardMaterial({ color: 0xf5f5dc, roughness: 0.7 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.4, metalness: 0.7 });
  
  // Board top (tapered)
  const boardGeo = new THREE.BoxGeometry(0.25, 0.01, 0.08);
  const positions = boardGeo.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    if (x < -0.1) {
      const taper = Math.abs(x + 0.125) / 0.025;
      positions.setZ(i, z * (0.5 + taper * 0.5));
    }
  }
  boardGeo.computeVertexNormals();
  
  const board = new THREE.Mesh(boardGeo, boardMat);
  board.position.y = 0.18;
  applyShadows(board);
  group.add(board);
  
  // Legs (X-frame)
  const legGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.2, 8);
  
  // Front left leg
  const leg1 = new THREE.Mesh(legGeo, metalMat);
  leg1.position.set(-0.07, 0.08, -0.03);
  leg1.rotation.set(0.3, 0, 0.1);
  applyShadows(leg1);
  group.add(leg1);
  
  // Front right leg
  const leg2 = new THREE.Mesh(legGeo, metalMat);
  leg2.position.set(-0.07, 0.08, 0.03);
  leg2.rotation.set(-0.3, 0, 0.1);
  applyShadows(leg2);
  group.add(leg2);
  
  // Back left leg
  const leg3 = new THREE.Mesh(legGeo, metalMat);
  leg3.position.set(0.07, 0.08, -0.03);
  leg3.rotation.set(0.3, 0, -0.1);
  applyShadows(leg3);
  group.add(leg3);
  
  // Back right leg
  const leg4 = new THREE.Mesh(legGeo, metalMat);
  leg4.position.set(0.07, 0.08, 0.03);
  leg4.rotation.set(-0.3, 0, -0.1);
  applyShadows(leg4);
  group.add(leg4);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createIroningBoard.metadata = {
  category: 'clothing',
  name: 'Ironing Board',
  description: 'Collapsible ironing board with metal legs',
  dimensions: { width: 0.25, depth: 0.1, height: 0.185 },
  interactive: false
};

/**
 * Create an iron
 */
function createIron(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4169e1, roughness: 0.3, metalness: 0.5 });
  const plateMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 0.8 });
  const handleMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.6 });
  
  // Soleplate (bottom)
  const plateGeo = new THREE.BoxGeometry(0.05, 0.008, 0.08);
  const platePositions = plateGeo.attributes.position;
  for (let i = 0; i < platePositions.count; i++) {
    const z = platePositions.getZ(i);
    if (z < -0.03) {
      const taper = Math.abs(z + 0.04) / 0.01;
      const x = platePositions.getX(i);
      platePositions.setX(i, x * (0.3 + taper * 0.7));
    }
  }
  plateGeo.computeVertexNormals();
  
  const plate = new THREE.Mesh(plateGeo, plateMat);
  plate.position.y = 0.004;
  applyShadows(plate);
  group.add(plate);
  
  // Body
  const bodyGeo = new THREE.BoxGeometry(0.045, 0.035, 0.07);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.025;
  applyShadows(body);
  group.add(body);
  
  // Handle
  const handleGeo = new THREE.TorusGeometry(0.015, 0.006, 8, 16, Math.PI);
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.rotation.x = Math.PI / 2;
  handle.rotation.z = -Math.PI / 6;
  handle.position.set(0, 0.05, 0.01);
  applyShadows(handle);
  group.add(handle);
  
  // Steam vents (tiny holes on bottom)
  const ventMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
  for (let i = 0; i < 6; i++) {
    const ventGeo = new THREE.CylinderGeometry(0.001, 0.001, 0.003, 6);
    const vent = new THREE.Mesh(ventGeo, ventMat);
    vent.position.set(-0.01 + (i % 3) * 0.01, 0.006, -0.02 + Math.floor(i / 3) * 0.02);
    group.add(vent);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createIron.metadata = {
  category: 'clothing',
  name: 'Iron',
  description: 'Steam iron with handle and vents',
  dimensions: { width: 0.05, depth: 0.08, height: 0.06 },
  interactive: false
};

/**
 * Create a laundry basket
 */
function createLaundryBasket(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const isFull = spec.full === true;
  
  const basketMat = new THREE.MeshStandardMaterial({ color: 0x8fbc8f, roughness: 0.7 });
  const clothMat = new THREE.MeshStandardMaterial({ color: 0x87ceeb, roughness: 0.8 });
  
  // Basket body (tapered)
  const bodyGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.12, 24);
  const body = new THREE.Mesh(bodyGeo, basketMat);
  body.position.y = 0.06;
  applyShadows(body);
  group.add(body);
  
  // Rim
  const rimGeo = new THREE.TorusGeometry(0.08, 0.004, 8, 24);
  const rim = new THREE.Mesh(rimGeo, basketMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.12;
  applyShadows(rim);
  group.add(rim);
  
  // Handles
  const handleGeo = new THREE.TorusGeometry(0.018, 0.005, 8, 12, Math.PI);
  for (let i = 0; i < 2; i++) {
    const handle = new THREE.Mesh(handleGeo, basketMat);
    handle.rotation.set(Math.PI / 2, 0, i * Math.PI);
    handle.position.set(i === 0 ? 0.075 : -0.075, 0.11, 0);
    applyShadows(handle);
    group.add(handle);
  }
  
  // Weave pattern (horizontal strips)
  const stripMat = new THREE.MeshStandardMaterial({ color: 0x6b8e6b, roughness: 0.8 });
  for (let i = 0; i < 8; i++) {
    const stripGeo = new THREE.TorusGeometry(0.071 + i * 0.0015, 0.002, 4, 24);
    const strip = new THREE.Mesh(stripGeo, stripMat);
    strip.rotation.x = Math.PI / 2;
    strip.position.y = 0.015 + i * 0.015;
    group.add(strip);
  }
  
  // If full, add rumpled clothes on top
  if (isFull) {
    for (let i = 0; i < 5; i++) {
      const clothGeo = new THREE.PlaneGeometry(0.06, 0.06, 4, 4);
      const clothPositions = clothGeo.attributes.position;
      
      // Add rumples
      for (let j = 0; j < clothPositions.count; j++) {
        const z = clothPositions.getZ(j);
        clothPositions.setZ(j, z + Math.random() * 0.015 - 0.0075);
      }
      clothGeo.computeVertexNormals();
      
      const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xf38181];
      const clothItemMat = new THREE.MeshStandardMaterial({ 
        color: colors[i % colors.length], 
        roughness: 0.9,
        side: THREE.DoubleSide 
      });
      const cloth = new THREE.Mesh(clothGeo, clothItemMat);
      const angle = (i / 5) * Math.PI * 2;
      const radius = Math.random() * 0.03;
      cloth.position.set(
        Math.cos(angle) * radius,
        0.12 + i * 0.008,
        Math.sin(angle) * radius
      );
      cloth.rotation.set(
        Math.random() * 0.5 - 0.25,
        Math.random() * Math.PI * 2,
        Math.random() * 0.5 - 0.25
      );
      group.add(cloth);
    }
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createLaundryBasket.metadata = {
  category: 'clothing',
  name: 'Laundry Basket',
  description: 'Woven laundry basket with handles',
  dimensions: { width: 0.16, depth: 0.16, height: 0.125 },
  interactive: false
};

/**
 * Create an empty laundry basket
 */
function createLaundryBasketEmpty(spec, THREE, context) {
  return createLaundryBasket({ ...spec, full: false }, THREE, context);
}

createLaundryBasketEmpty.metadata = {
  ...createLaundryBasket.metadata,
  name: 'Laundry Basket (Empty)',
  description: 'Empty woven laundry basket'
};

/**
 * Create a full laundry basket
 */
function createLaundryBasketFull(spec, THREE, context) {
  return createLaundryBasket({ ...spec, full: true }, THREE, context);
}

createLaundryBasketFull.metadata = {
  ...createLaundryBasket.metadata,
  name: 'Laundry Basket (Full)',
  description: 'Laundry basket filled with clothes'
};

/**
 * Create a hamper
 */
function createHamper(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const isFull = spec.full === true;
  
  const hamperMat = new THREE.MeshStandardMaterial({ color: 0xd2b48c, roughness: 0.8 });
  
  // Body (rectangular with lid)
  const bodyGeo = new THREE.BoxGeometry(0.1, 0.15, 0.08);
  const body = new THREE.Mesh(bodyGeo, hamperMat);
  body.position.y = 0.075;
  applyShadows(body);
  group.add(body);
  
  // Lid (hinged, slightly open if full)
  const lidGeo = new THREE.BoxGeometry(0.102, 0.008, 0.082);
  const lid = new THREE.Mesh(lidGeo, hamperMat);
  
  if (isFull) {
    lid.rotation.x = -Math.PI / 6; // Open slightly
    lid.position.set(0, 0.155, -0.03);
  } else {
    lid.position.set(0, 0.154, 0);
  }
  applyShadows(lid);
  group.add(lid);
  
  // Slats (decorative)
  const slatMat = new THREE.MeshStandardMaterial({ color: 0xa0826d, roughness: 0.9 });
  for (let i = 0; i < 10; i++) {
    const slatGeo = new THREE.BoxGeometry(0.098, 0.003, 0.001);
    const slat = new THREE.Mesh(slatGeo, slatMat);
    slat.position.set(0, 0.01 + i * 0.015, 0.041);
    group.add(slat);
  }
  
  // If full, add overflowing clothes
  if (isFull) {
    for (let i = 0; i < 4; i++) {
      const clothGeo = new THREE.PlaneGeometry(0.07, 0.07, 5, 5);
      const clothPositions = clothGeo.attributes.position;
      
      for (let j = 0; j < clothPositions.count; j++) {
        const z = clothPositions.getZ(j);
        clothPositions.setZ(j, z + Math.random() * 0.02 - 0.01);
      }
      clothGeo.computeVertexNormals();
      
      const colors = [0xff8fab, 0x6c5ce7, 0xfdcb6e, 0x00b894];
      const clothItemMat = new THREE.MeshStandardMaterial({ 
        color: colors[i], 
        roughness: 0.9,
        side: THREE.DoubleSide 
      });
      const cloth = new THREE.Mesh(clothGeo, clothItemMat);
      cloth.position.set(
        Math.random() * 0.04 - 0.02,
        0.15 + i * 0.012,
        Math.random() * 0.03
      );
      cloth.rotation.set(
        Math.random() * 0.8 - 0.4,
        Math.random() * Math.PI * 2,
        Math.random() * 0.8 - 0.4
      );
      group.add(cloth);
    }
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createHamper.metadata = {
  category: 'clothing',
  name: 'Hamper',
  description: 'Wooden hamper with lid',
  dimensions: { width: 0.1, depth: 0.08, height: 0.16 },
  interactive: false
};

/**
 * Create an empty hamper
 */
function createHamperEmpty(spec, THREE, context) {
  return createHamper({ ...spec, full: false }, THREE, context);
}

createHamperEmpty.metadata = {
  ...createHamper.metadata,
  name: 'Hamper (Empty)',
  description: 'Empty wooden hamper with closed lid'
};

/**
 * Create a full hamper
 */
function createHamperFull(spec, THREE, context) {
  return createHamper({ ...spec, full: true }, THREE, context);
}

createHamperFull.metadata = {
  ...createHamper.metadata,
  name: 'Hamper (Full)',
  description: 'Hamper overflowing with clothes'
};

/**
 * Create T-SHIRT with PROPER construction
 * PRINCIPLE: Shirt is a TUBE with sleeves attached - not flat panels!
 */
function createShirt(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const isRumpled = spec.rumpled === true;
  const shirtColor = spec.color || 0x4169e1;
  
  const shirtMat = new THREE.MeshStandardMaterial({ 
    color: shirtColor, 
    roughness: 0.85,
    side: THREE.DoubleSide
  });
  
  // BODY TUBE - The main garment is ONE CONTINUOUS CYLINDER
  const bodyGeo = new THREE.CylinderGeometry(0.035, 0.038, 0.095, 16, 12, true);
  const bodyPositions = bodyGeo.attributes.position;
  
  // Deform the tube for torso shape + wrinkles
  for (let i = 0; i < bodyPositions.count; i++) {
    const x = bodyPositions.getX(i);
    const y = bodyPositions.getY(i);
    const z = bodyPositions.getZ(i);
    const angle = Math.atan2(z, x);
    const radius = Math.sqrt(x * x + z * z);
    
    // Front/back shaping (torso isn't perfectly round)
    let shapeFactor = 1;
    const normalizedAngle = ((angle + Math.PI) % (Math.PI * 2)) / (Math.PI * 2);
    if (normalizedAngle < 0.3 || normalizedAngle > 0.7) {
      // Front and back: slightly flatter
      shapeFactor = 0.92;
    }
    
    // Wrinkles if rumpled
    if (isRumpled) {
      const wrinkle = Math.sin(y * 40 + angle * 5) * 0.003 + Math.sin(y * 30 + angle * 3) * 0.002;
      shapeFactor += wrinkle / radius;
    }
    
    const newRadius = radius * shapeFactor;
    const scale = newRadius / radius;
    bodyPositions.setX(i, x * scale);
    bodyPositions.setZ(i, z * scale);
  }
  bodyGeo.computeVertexNormals();
  
  const body = new THREE.Mesh(bodyGeo, shirtMat);
  body.position.y = 0.0575;
  applyShadows(body);
  group.add(body);
  
  // SHOULDERS - Connect body to sleeves properly
  for (let side = 0; side < 2; side++) {
    const shoulderGeo = new THREE.SphereGeometry(0.02, 12, 12, 0, Math.PI, 0, Math.PI / 2);
    const shoulder = new THREE.Mesh(shoulderGeo, shirtMat);
    shoulder.rotation.set(Math.PI / 2, 0, side === 0 ? -Math.PI / 2 : Math.PI / 2);
    shoulder.position.set(side === 0 ? -0.035 : 0.035, 0.095, 0);
    applyShadows(shoulder);
    group.add(shoulder);
  }
  
  // SLEEVES - Proper tubes attached to shoulders
  for (let side = 0; side < 2; side++) {
    const sleeveGeo = new THREE.CylinderGeometry(0.012, 0.01, 0.055, 12, 8);
    const sleevePositions = sleeveGeo.attributes.position;
    
    // Add wrinkles
    if (isRumpled) {
      for (let i = 0; i < sleevePositions.count; i++) {
        const x = sleevePositions.getX(i);
        const y = sleevePositions.getY(i);
        const z = sleevePositions.getZ(i);
        const angle = Math.atan2(z, x);
        const wrinkle = Math.sin(y * 45 + angle * 4) * 0.002;
        const radius = Math.sqrt(x * x + z * z);
        const newRadius = radius + wrinkle;
        const scale = newRadius / radius;
        sleevePositions.setX(i, x * scale);
        sleevePositions.setZ(i, z * scale);
      }
      sleeveGeo.computeVertexNormals();
    }
    
    const sleeve = new THREE.Mesh(sleeveGeo, shirtMat);
    sleeve.position.set(side === 0 ? -0.048 : 0.048, 0.0725, 0);
    sleeve.rotation.z = side === 0 ? Math.PI / 10 : -Math.PI / 10;
    applyShadows(sleeve);
    group.add(sleeve);
    
    // Sleeve cuff (hem)
    const cuffGeo = new THREE.TorusGeometry(0.01, 0.0015, 8, 12);
    const cuff = new THREE.Mesh(cuffGeo, shirtMat);
    cuff.rotation.x = Math.PI / 2;
    cuff.position.set(side === 0 ? -0.058 : 0.058, 0.045, side === 0 ? -0.008 : 0.008);
    group.add(cuff);
  }
  
  // NECKLINE - Properly closed collar opening
  const neckGeo = new THREE.TorusGeometry(0.015, 0.0025, 10, 16, Math.PI * 1.8);
  const neck = new THREE.Mesh(neckGeo, shirtMat);
  neck.rotation.set(Math.PI / 2, 0, Math.PI / 2 + 0.1);
  neck.position.y = 0.102;
  applyShadows(neck);
  group.add(neck);
  
  // COLLAR (V-neck style or crew neck)
  for (let side = 0; side < 2; side++) {
    const collarGeo = new THREE.BoxGeometry(0.015, 0.012, 0.002, 2, 2, 1);
    const collar = new THREE.Mesh(collarGeo, shirtMat);
    collar.position.set(side === 0 ? -0.008 : 0.008, 0.104, 0.016);
    collar.rotation.set(Math.PI / 12, side === 0 ? Math.PI / 10 : -Math.PI / 10, 0);
    applyShadows(collar);
    group.add(collar);
  }
  
  // HEM (bottom edge)
  const hemGeo = new THREE.TorusGeometry(0.038, 0.002, 8, 16);
  const hem = new THREE.Mesh(hemGeo, shirtMat);
  hem.rotation.x = Math.PI / 2;
  hem.position.y = 0.01;
  group.add(hem);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createShirt.metadata = {
  category: 'clothing',
  name: 'Shirt',
  description: 'T-shirt with sleeves',
  dimensions: { width: 0.12, depth: 0.08, height: 0.11 },
  interactive: false
};

/**
 * Create a rumpled shirt
 */
function createShirtRumpled(spec, THREE, context) {
  return createShirt({ ...spec, rumpled: true }, THREE, context);
}

createShirtRumpled.metadata = {
  ...createShirt.metadata,
  name: 'Shirt (Rumpled)',
  description: 'Wrinkled T-shirt'
};

/**
 * Create PANTS with PROPER construction
 * PRINCIPLE: Pants are TWO CONNECTED TUBES sharing a crotch seam
 */
function createPants(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const isRumpled = spec.rumpled === true;
  const pantsColor = spec.color || 0x2c3e50;
  
  const pantsMat = new THREE.MeshStandardMaterial({ 
    color: pantsColor, 
    roughness: 0.8,
    side: THREE.DoubleSide
  });
  
  // WAISTBAND - Proper solid band (NOT a torus!)
  const waistGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.012, 24, 2, true);
  const waist = new THREE.Mesh(waistGeo, pantsMat);
  waist.position.y = 0.094;
  applyShadows(waist);
  group.add(waist);
  
  // Waistband top edge
  const waistTopGeo = new THREE.TorusGeometry(0.032, 0.002, 8, 24);
  const waistTop = new THREE.Mesh(waistTopGeo, pantsMat);
  waistTop.rotation.x = Math.PI / 2;
  waistTop.position.y = 0.1;
  group.add(waistTop);
  
  // LEGS - Two separate but connected tubes
  for (let side = 0; side < 2; side++) {
    const legGeo = new THREE.CylinderGeometry(0.016, 0.013, 0.088, 16, 12);
    const legPositions = legGeo.attributes.position;
    
    // Add wrinkles/bunching
    for (let i = 0; i < legPositions.count; i++) {
      const x = legPositions.getX(i);
      const y = legPositions.getY(i);
      const z = legPositions.getZ(i);
      const angle = Math.atan2(z, x);
      const radius = Math.sqrt(x * x + z * z);
      
      if (isRumpled) {
        const wrinkle = Math.sin(y * 38 + angle * 4) * 0.0025 + Math.sin(y * 50) * 0.0015;
        const newRadius = radius + wrinkle;
        const scale = newRadius / radius;
        legPositions.setX(i, x * scale);
        legPositions.setZ(i, z * scale);
      }
    }
    legGeo.computeVertexNormals();
    
    const leg = new THREE.Mesh(legGeo, pantsMat);
    leg.position.set(side === 0 ? -0.018 : 0.018, 0.05, 0);
    applyShadows(leg);
    group.add(leg);
    
    // Leg hem
    const hemGeo = new THREE.TorusGeometry(0.013, 0.0018, 8, 16);
    const hem = new THREE.Mesh(hemGeo, pantsMat);
    hem.rotation.x = Math.PI / 2;
    hem.position.set(side === 0 ? -0.018 : 0.018, 0.006, 0);
    group.add(hem);
  }
  
  // CROTCH/RISE - Connects the two legs properly
  const crotchGeo = new THREE.SphereGeometry(0.022, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const crotch = new THREE.Mesh(crotchGeo, pantsMat);
  crotch.rotation.x = Math.PI;
  crotch.position.y = 0.089;
  applyShadows(crotch);
  group.add(crotch);
  
  // BELT LOOPS - Proper small loops
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const loopGeo = new THREE.BoxGeometry(0.004, 0.01, 0.002);
    const loop = new THREE.Mesh(loopGeo, pantsMat);
    loop.position.set(
      Math.cos(angle) * 0.033,
      0.102,
      Math.sin(angle) * 0.033
    );
    applyShadows(loop);
    group.add(loop);
  }
  
  // ZIPPER
  const zipperMat = new THREE.MeshStandardMaterial({ 
    color: 0xaaaaaa, 
    roughness: 0.3,
    metalness: 0.8 
  });
  
  const zipperGeo = new THREE.BoxGeometry(0.002, 0.022, 0.001);
  const zipper = new THREE.Mesh(zipperGeo, zipperMat);
  zipper.position.set(0, 0.089, 0.033);
  applyShadows(zipper);
  group.add(zipper);
  
  // Button
  const buttonGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.002, 16);
  const buttonMat = new THREE.MeshStandardMaterial({ 
    color: pantsColor, 
    roughness: 0.4,
    metalness: 0.2 
  });
  const button = new THREE.Mesh(buttonGeo, buttonMat);
  button.rotation.x = Math.PI / 2;
  button.position.set(0, 0.1, 0.034);
  applyShadows(button);
  group.add(button);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createPants.metadata = {
  category: 'clothing',
  name: 'Pants',
  description: 'Long pants with belt loops',
  dimensions: { width: 0.07, depth: 0.07, height: 0.1 },
  interactive: false
};

/**
 * Create rumpled pants
 */
function createPantsRumpled(spec, THREE, context) {
  return createPants({ ...spec, rumpled: true }, THREE, context);
}

createPantsRumpled.metadata = {
  ...createPants.metadata,
  name: 'Pants (Rumpled)',
  description: 'Wrinkled long pants'
};

/**
 * Create SHORTS - Shorter version of pants
 */
function createShorts(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const isRumpled = spec.rumpled === true;
  const shortsColor = spec.color || 0x8b4513;
  
  const shortsMat = new THREE.MeshStandardMaterial({ 
    color: shortsColor, 
    roughness: 0.85,
    side: THREE.DoubleSide
  });
  
  // WAISTBAND
  const waistGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.01, 24, 2, true);
  const waist = new THREE.Mesh(waistGeo, shortsMat);
  waist.position.y = 0.054;
  applyShadows(waist);
  group.add(waist);
  
  // Waistband edge
  const waistTopGeo = new THREE.TorusGeometry(0.032, 0.0018, 8, 24);
  const waistTop = new THREE.Mesh(waistTopGeo, shortsMat);
  waistTop.rotation.x = Math.PI / 2;
  waistTop.position.y = 0.059;
  group.add(waistTop);
  
  // LEGS - Shorter tubes
  for (let side = 0; side < 2; side++) {
    const legGeo = new THREE.CylinderGeometry(0.017, 0.0145, 0.048, 16, 8);
    const legPositions = legGeo.attributes.position;
    
    if (isRumpled) {
      for (let i = 0; i < legPositions.count; i++) {
        const x = legPositions.getX(i);
        const y = legPositions.getY(i);
        const z = legPositions.getZ(i);
        const angle = Math.atan2(z, x);
        const wrinkle = Math.sin(y * 42 + angle * 5) * 0.002;
        const radius = Math.sqrt(x * x + z * z);
        const newRadius = radius + wrinkle;
        const scale = newRadius / radius;
        legPositions.setX(i, x * scale);
        legPositions.setZ(i, z * scale);
      }
      legGeo.computeVertexNormals();
    }
    
    const leg = new THREE.Mesh(legGeo, shortsMat);
    leg.position.set(side === 0 ? -0.018 : 0.018, 0.028, 0);
    applyShadows(leg);
    group.add(leg);
    
    // Leg hem
    const hemGeo = new THREE.TorusGeometry(0.0145, 0.002, 8, 16);
    const hem = new THREE.Mesh(hemGeo, shortsMat);
    hem.rotation.x = Math.PI / 2;
    hem.position.set(side === 0 ? -0.018 : 0.018, 0.004, 0);
    group.add(hem);
  }
  
  // CROTCH
  const crotchGeo = new THREE.SphereGeometry(0.022, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const crotch = new THREE.Mesh(crotchGeo, shortsMat);
  crotch.rotation.x = Math.PI;
  crotch.position.y = 0.05;
  applyShadows(crotch);
  group.add(crotch);
  
  // Belt loops
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const loopGeo = new THREE.BoxGeometry(0.004, 0.008, 0.002);
    const loop = new THREE.Mesh(loopGeo, shortsMat);
    loop.position.set(
      Math.cos(angle) * 0.033,
      0.061,
      Math.sin(angle) * 0.033
    );
    applyShadows(loop);
    group.add(loop);
  }
  
  // Button
  const buttonGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.002, 16);
  const button = new THREE.Mesh(buttonGeo, new THREE.MeshStandardMaterial({ 
    color: 0x333333, 
    roughness: 0.4,
    metalness: 0.2 
  }));
  button.rotation.x = Math.PI / 2;
  button.position.set(0, 0.059, 0.034);
  applyShadows(button);
  group.add(button);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createShorts.metadata = {
  category: 'clothing',
  name: 'Shorts',
  description: 'Casual shorts',
  dimensions: { width: 0.07, depth: 0.07, height: 0.063 },
  interactive: false
};

/**
 * Create rumpled shorts
 */
function createShortsRumpled(spec, THREE, context) {
  return createShorts({ ...spec, rumpled: true }, THREE, context);
}

createShortsRumpled.metadata = {
  ...createShorts.metadata,
  name: 'Shorts (Rumpled)',
  description: 'Wrinkled casual shorts'
};

/**
 * Create UNDERWEAR - Simplified, proper construction
 */
function createUnderwear(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const isRumpled = spec.rumpled === true;
  const underwearColor = spec.color || 0x87ceeb;
  
  const underwearMat = new THREE.MeshStandardMaterial({ 
    color: underwearColor, 
    roughness: 0.8,
    side: THREE.DoubleSide
  });
  
  // WAISTBAND - Proper elastic band (solid cylinder slice)
  const waistGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.008, 20, 2, true);
  const waist = new THREE.Mesh(waistGeo, underwearMat);
  waist.position.y = 0.036;
  applyShadows(waist);
  group.add(waist);
  
  // Elastic ribbing
  for (let i = 0; i < 5; i++) {
    const ribbingGeo = new THREE.TorusGeometry(0.0255, 0.0004, 4, 20);
    const ribbing = new THREE.Mesh(ribbingGeo, new THREE.MeshStandardMaterial({ 
      color: underwearColor * 0.9, 
      roughness: 0.85 
    }));
    ribbingGeo.rotation.x = Math.PI / 2;
    ribbing.position.y = 0.033 + i * 0.0008;
    group.add(ribbing);
  }
  
  // MAIN BODY - Single deformed sphere for natural shape
  const bodyGeo = new THREE.SphereGeometry(0.028, 14, 14, 0, Math.PI * 2, 0, Math.PI / 1.8);
  const bodyPositions = bodyGeo.attributes.position;
  
  for (let i = 0; i < bodyPositions.count; i++) {
    const x = bodyPositions.getX(i);
    const y = bodyPositions.getY(i);
    const z = bodyPositions.getZ(i);
    
    // Anatomical shaping
    const angle = Math.atan2(z, x);
    const normalizedAngle = ((angle + Math.PI) % (Math.PI * 2)) / (Math.PI * 2);
    
    // Front is flatter, back is fuller
    let shapeFactor = 1;
    if (normalizedAngle > 0.4 && normalizedAngle < 0.6) {
      shapeFactor = 0.88; // Flatten front
    }
    
    if (isRumpled) {
      const wrinkle = Math.sin(x * 35 + y * 30) * 0.002;
      shapeFactor += wrinkle / Math.sqrt(x * x + z * z);
    }
    
    bodyPositions.setX(i, x * shapeFactor);
    bodyPositions.setZ(i, z * shapeFactor);
  }
  bodyGeo.computeVertexNormals();
  
  const body = new THREE.Mesh(bodyGeo, underwearMat);
  body.rotation.x = Math.PI;
  body.position.y = 0.032;
  applyShadows(body);
  group.add(body);
  
  // LEG ELASTIC BANDS
  for (let side = 0; side < 2; side++) {
    const legElasticGeo = new THREE.TorusGeometry(0.014, 0.0018, 8, 14, Math.PI * 1.2);
    const legElastic = new THREE.Mesh(legElasticGeo, underwearMat);
    legElastic.rotation.set(Math.PI / 2, side === 0 ? Math.PI / 6 : -Math.PI / 6, 0);
    legElastic.position.set(side === 0 ? -0.016 : 0.016, 0.008, 0.002);
    group.add(legElastic);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createUnderwear.metadata = {
  category: 'clothing',
  name: 'Underwear',
  description: 'Basic underwear',
  dimensions: { width: 0.055, depth: 0.055, height: 0.04 },
  interactive: false
};

/**
 * Create rumpled underwear
 */
function createUnderwearRumpled(spec, THREE, context) {
  return createUnderwear({ ...spec, rumpled: true }, THREE, context);
}

createUnderwearRumpled.metadata = {
  ...createUnderwear.metadata,
  name: 'Underwear (Rumpled)',
  description: 'Wrinkled underwear'
};

/**
 * Create BRA - Keep the hemisphere approach (this one was CORRECT!)
 */
function createBra(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const isRumpled = spec.rumpled === true;
  const braColor = spec.color || 0xffc0cb;
  
  const braMat = new THREE.MeshStandardMaterial({ 
    color: braColor, 
    roughness: 0.7,
    side: THREE.DoubleSide
  });
  
  // CUPS - Hemisphere approach is CORRECT for bras!
  for (let side = 0; side < 2; side++) {
    // Main cup (hemisphere)
    const cupGeo = new THREE.SphereGeometry(0.018, 14, 14, 0, Math.PI, 0, Math.PI / 2);
    
    if (isRumpled) {
      const positions = cupGeo.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const wrinkle = Math.random() * 0.0008 - 0.0004;
        positions.setX(i, positions.getX(i) + wrinkle);
        positions.setY(i, positions.getY(i) + wrinkle);
      }
      cupGeo.computeVertexNormals();
    }
    
    const cup = new THREE.Mesh(cupGeo, braMat);
    // Orient hemisphere outward
    cup.rotation.x = Math.PI / 2;
    cup.rotation.z = side === 0 ? Math.PI / 2 : -Math.PI / 2;
    cup.position.set(side === 0 ? -0.018 : 0.018, 0.022, 0.005);
    applyShadows(cup);
    group.add(cup);
    
    // Underwire
    const underwireGeo = new THREE.TorusGeometry(0.019, 0.001, 6, 16, Math.PI);
    const underwireMat = new THREE.MeshStandardMaterial({ 
      color: 0xcccccc, 
      roughness: 0.3,
      metalness: 0.6 
    });
    const underwire = new THREE.Mesh(underwireGeo, underwireMat);
    underwire.rotation.set(Math.PI / 2, 0, side === 0 ? Math.PI / 2 : -Math.PI / 2);
    underwire.position.set(side === 0 ? -0.018 : 0.018, 0.016, 0.004);
    group.add(underwire);
  }
  
  // CENTER GORE
  const goreGeo = new THREE.BoxGeometry(0.004, 0.02, 0.003);
  const gore = new THREE.Mesh(goreGeo, braMat);
  gore.position.set(0, 0.022, 0.005);
  applyShadows(gore);
  group.add(gore);
  
  // STRAPS
  for (let side = 0; side < 2; side++) {
    const strapGeo = new THREE.BoxGeometry(0.005, 0.065, 0.002);
    const strap = new THREE.Mesh(strapGeo, braMat);
    strap.rotation.z = side === 0 ? Math.PI / 10 : -Math.PI / 10;
    strap.position.set(side === 0 ? -0.015 : 0.015, 0.045, 0);
    applyShadows(strap);
    group.add(strap);
    
    // Adjuster
    const adjusterGeo = new THREE.BoxGeometry(0.006, 0.004, 0.0025);
    const adjuster = new THREE.Mesh(adjusterGeo, new THREE.MeshStandardMaterial({ 
      color: 0xcccccc, 
      roughness: 0.4,
      metalness: 0.7 
    }));
    adjuster.position.set(side === 0 ? -0.02 : 0.02, 0.06, -0.015);
    applyShadows(adjuster);
    group.add(adjuster);
  }
  
  // BAND
  const bandGeo = new THREE.TorusGeometry(0.04, 0.0035, 10, 20, Math.PI * 1.1);
  const band = new THREE.Mesh(bandGeo, braMat);
  band.rotation.set(0, Math.PI / 2, 0);
  band.position.set(0, 0.022, 0);
  applyShadows(band);
  group.add(band);
  
  // CLOSURE (back)
  const closureMat = new THREE.MeshStandardMaterial({ 
    color: 0xcccccc, 
    roughness: 0.3,
    metalness: 0.8 
  });
  
  const hooksGeo = new THREE.BoxGeometry(0.006, 0.01, 0.002);
  const hooks = new THREE.Mesh(hooksGeo, closureMat);
  hooks.position.set(0.042, 0.022, 0);
  applyShadows(hooks);
  group.add(hooks);
  
  const eyesGeo = new THREE.BoxGeometry(0.006, 0.01, 0.002);
  const eyes = new THREE.Mesh(eyesGeo, closureMat);
  eyes.position.set(-0.042, 0.022, 0);
  applyShadows(eyes);
  group.add(eyes);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createBra.metadata = {
  category: 'clothing',
  name: 'Bra',
  description: 'Undergarment with cups and straps',
  dimensions: { width: 0.088, depth: 0.025, height: 0.08 },
  interactive: false
};

/**
 * Create a rumpled bra
 */
function createBraRumpled(spec, THREE, context) {
  return createBra({ ...spec, rumpled: true }, THREE, context);
}

createBraRumpled.metadata = {
  ...createBra.metadata,
  name: 'Bra (Rumpled)',
  description: 'Wrinkled bra'
};

/**
 * Create SOCK - Simplified tube construction
 */
function createSock(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const isRumpled = spec.rumpled === true;
  const sockColor = spec.color || 0xffffff;
  
  const sockMat = new THREE.MeshStandardMaterial({ 
    color: sockColor, 
    roughness: 0.9
  });
  
  // FOOT - Ellipsoid base
  const footGeo = new THREE.SphereGeometry(0.024, 14, 14, 0, Math.PI * 2, 0, Math.PI / 2);
  const footPositions = footGeo.attributes.position;
  
  for (let i = 0; i < footPositions.count; i++) {
    const x = footPositions.getX(i);
    const y = footPositions.getY(i);
    const z = footPositions.getZ(i);
    
    // Scale to foot shape (longer in X, narrow in Z)
    footPositions.setX(i, x * 1.8);
    footPositions.setZ(i, z * 0.75);
    
    // Taper toe
    if (x < -0.015) {
      const taper = (x + 0.024) / 0.009;
      footPositions.setZ(i, z * 0.75 * (0.5 + taper * 0.5));
    }
  }
  footGeo.computeVertexNormals();
  
  const foot = new THREE.Mesh(footGeo, sockMat);
  foot.rotation.x = Math.PI;
  foot.position.y = 0.01;
  applyShadows(foot);
  group.add(foot);
  
  // LEG TUBE
  const legGeo = new THREE.CylinderGeometry(0.011, 0.01, 0.055, 16, 10);
  const legPositions = legGeo.attributes.position;
  
  if (isRumpled) {
    for (let i = 0; i < legPositions.count; i++) {
      const x = legPositions.getX(i);
      const y = legPositions.getY(i);
      const z = legPositions.getZ(i);
      const angle = Math.atan2(z, x);
      const scrunch = Math.sin(y * 45 + angle * 4) * 0.003 + Math.sin(y * 35) * 0.002;
      const radius = Math.sqrt(x * x + z * z);
      const newRadius = radius + scrunch;
      const scale = newRadius / radius;
      legPositions.setX(i, x * scale);
      legPositions.setZ(i, z * scale);
    }
    legGeo.computeVertexNormals();
  }
  
  const leg = new THREE.Mesh(legGeo, sockMat);
  leg.position.set(0.022, 0.038, 0);
  applyShadows(leg);
  group.add(leg);
  
  // CUFF - Ribbed elastic top
  const cuffGeo = new THREE.CylinderGeometry(0.0115, 0.011, 0.012, 16, 3);
  const cuff = new THREE.Mesh(cuffGeo, sockMat);
  cuff.position.set(0.022, 0.071, 0);
  applyShadows(cuff);
  group.add(cuff);
  
  // Ribbing detail
  for (let i = 0; i < 6; i++) {
    const ribGeo = new THREE.TorusGeometry(0.0117, 0.0006, 6, 16);
    const rib = new THREE.Mesh(ribGeo, new THREE.MeshStandardMaterial({ 
      color: sockColor === 0xffffff ? 0xe8e8e8 : sockColor * 0.95, 
      roughness: 0.95 
    }));
    rib.rotation.x = Math.PI / 2;
    rib.position.set(0.022, 0.066 + i * 0.0016, 0);
    group.add(rib);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createSock.metadata = {
  category: 'clothing',
  name: 'Sock',
  description: 'Crew sock with ribbed cuff',
  dimensions: { width: 0.06, depth: 0.025, height: 0.078 },
  interactive: false
};

/**
 * Create a rumpled sock
 */
function createSockRumpled(spec, THREE, context) {
  return createSock({ ...spec, rumpled: true }, THREE, context);
}

createSockRumpled.metadata = {
  ...createSock.metadata,
  name: 'Sock (Rumpled)',
  description: 'Scrunched sock with wrinkles'
};

/**
 * Create SNEAKER - Simplified but accurate
 */
function createSneaker(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const sneakerColor = spec.color || 0x4169e1;
  
  const soleMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    roughness: 0.6 
  });
  const upperMat = new THREE.MeshStandardMaterial({ 
    color: sneakerColor, 
    roughness: 0.7 
  });
  const laceMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    roughness: 0.8 
  });
  
  // SOLE - Single tapered box
  const soleGeo = new THREE.BoxGeometry(0.058, 0.014, 0.026, 8, 2, 4);
  const solePositions = soleGeo.attributes.position;
  
  for (let i = 0; i < solePositions.count; i++) {
    const x = solePositions.getX(i);
    const z = solePositions.getZ(i);
    
    // Taper toe
    if (x < -0.022) {
      const taper = (x + 0.029) / 0.007;
      solePositions.setZ(i, z * (0.55 + taper * 0.45));
    }
  }
  soleGeo.computeVertexNormals();
  
  const sole = new THREE.Mesh(soleGeo, soleMat);
  sole.position.y = 0.007;
  applyShadows(sole);
  group.add(sole);
  
  // UPPER - Single deformed sphere for shoe shape
  const upperGeo = new THREE.SphereGeometry(0.026, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.6);
  const upperPositions = upperGeo.attributes.position;
  
  for (let i = 0; i < upperPositions.count; i++) {
    const x = upperPositions.getX(i);
    const y = upperPositions.getY(i);
    const z = upperPositions.getZ(i);
    
    // Elongate in X (foot length)
    upperPositions.setX(i, x * 1.1);
    
    // Flatten slightly
    upperPositions.setY(i, y * 0.9);
  }
  upperGeo.computeVertexNormals();
  
  const upper = new THREE.Mesh(upperGeo, upperMat);
  upper.rotation.x = Math.PI;
  upper.position.y = 0.028;
  applyShadows(upper);
  group.add(upper);
  
  // TONGUE
  const tongueGeo = new THREE.BoxGeometry(0.02, 0.032, 0.004);
  const tongueMat = new THREE.MeshStandardMaterial({ 
    color: 0x87ceeb, 
    roughness: 0.8 
  });
  const tongue = new THREE.Mesh(tongueGeo, tongueMat);
  tongue.position.set(0.002, 0.036, 0.001);
  tongue.rotation.x = Math.PI / 12;
  applyShadows(tongue);
  group.add(tongue);
  
  // LACES - Simple crisscross
  for (let i = 0; i < 4; i++) {
    const laceGeo = new THREE.CylinderGeometry(0.0008, 0.0008, 0.024, 8);
    const lace1 = new THREE.Mesh(laceGeo, laceMat);
    lace1.rotation.z = Math.PI / 5;
    lace1.position.set(0.005 - i * 0.006, 0.027 + i * 0.007, 0.001);
    group.add(lace1);
    
    const lace2 = new THREE.Mesh(laceGeo, laceMat);
    lace2.rotation.z = -Math.PI / 5;
    lace2.position.set(0.005 - i * 0.006, 0.03 + i * 0.007, 0.001);
    group.add(lace2);
  }
  
  // COLLAR (ankle padding)
  const collarGeo = new THREE.TorusGeometry(0.014, 0.003, 8, 16, Math.PI * 1.3);
  const collarMat = new THREE.MeshStandardMaterial({ 
    color: 0x333333, 
    roughness: 0.85 
  });
  const collar = new THREE.Mesh(collarGeo, collarMat);
  collar.rotation.set(0, Math.PI / 2, 0);
  collar.position.set(0.016, 0.048, 0);
  group.add(collar);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createSneaker.metadata = {
  category: 'clothing',
  name: 'Sneaker',
  description: 'Athletic sneaker with laces',
  dimensions: { width: 0.058, depth: 0.03, height: 0.052 },
  interactive: false
};

/**
 * Create a sandal
 */
function createSandal(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const soleMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 });
  const strapMat = new THREE.MeshStandardMaterial({ color: spec.color || 0x654321, roughness: 0.7 });
  
  // Sole
  const soleGeo = new THREE.BoxGeometry(0.05, 0.008, 0.025);
  const solePositions = soleGeo.attributes.position;
  for (let i = 0; i < solePositions.count; i++) {
    const x = solePositions.getX(i);
    if (x < -0.02) {
      const taper = Math.abs(x + 0.025) / 0.005;
      const z = solePositions.getZ(i);
      solePositions.setZ(i, z * (0.7 + taper * 0.3));
    }
  }
  soleGeo.computeVertexNormals();
  
  const sole = new THREE.Mesh(soleGeo, soleMat);
  sole.position.y = 0.004;
  applyShadows(sole);
  group.add(sole);
  
  // Toe strap
  const toeStrapGeo = new THREE.BoxGeometry(0.018, 0.003, 0.004);
  const toeStrap = new THREE.Mesh(toeStrapGeo, strapMat);
  toeStrap.position.set(-0.015, 0.0095, 0);
  applyShadows(toeStrap);
  group.add(toeStrap);
  
  // Ankle straps
  for (let i = 0; i < 2; i++) {
    const strapGeo = new THREE.BoxGeometry(0.025, 0.003, 0.008);
    const strap = new THREE.Mesh(strapGeo, strapMat);
    strap.rotation.set(0, 0, i === 0 ? Math.PI / 8 : -Math.PI / 8);
    strap.position.set(0.005, 0.0095, i === 0 ? -0.012 : 0.012);
    applyShadows(strap);
    group.add(strap);
  }
  
  // Buckle
  const buckleGeo = new THREE.TorusGeometry(0.003, 0.001, 6, 12);
  const buckleMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.3, metalness: 0.8 });
  const buckle = new THREE.Mesh(buckleGeo, buckleMat);
  buckle.rotation.set(0, Math.PI / 2, 0);
  buckle.position.set(0.02, 0.01, 0.013);
  group.add(buckle);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createSandal.metadata = {
  category: 'clothing',
  name: 'Sandal',
  description: 'Open-toe sandal with straps',
  dimensions: { width: 0.05, depth: 0.025, height: 0.015 },
  interactive: false
};

// Export all clothing creators
export const creators = {
  washingmachine: createWashingMachine,
  ironingboard: createIroningBoard,
  iron: createIron,
  laundrybasket: createLaundryBasket,
  laundrybasketempty: createLaundryBasketEmpty,
  laundrybasketfull: createLaundryBasketFull,
  hamper: createHamper,
  hamperempty: createHamperEmpty,
  hamperfull: createHamperFull,
  shirt: createShirt,
  shirtrumpled: createShirtRumpled,
  pants: createPants,
  pantsrumpled: createPantsRumpled,
  shorts: createShorts,
  shortsrumpled: createShortsRumpled,
  underwear: createUnderwear,
  underwearrumpled: createUnderwearRumpled,
  bra: createBra,
  brarumpled: createBraRumpled,
  sock: createSock,
  sockrumpled: createSockRumpled,
  sneaker: createSneaker,
  sandal: createSandal
};
