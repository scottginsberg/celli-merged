// ==================== FOOD ASSET CREATORS ====================
// Universal food item creation functions

import { createPositionedGroup, applyShadows } from '../asset-context.js';

/**
 * Create an apple asset
 */
function createApple(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Body (squashed sphere with indents)
  const bodyGeo = new THREE.SphereGeometry(0.04, 24, 24);
  const positions = bodyGeo.attributes.position;
  
  // Add top/bottom indents
  for (let i = 0; i < positions.count; i++) {
    const y = positions.getY(i);
    const normalizedY = y / 0.04;
    
    // Top indent
    if (normalizedY > 0.8) {
      const indentFactor = (normalizedY - 0.8) / 0.2;
      positions.setY(i, y - indentFactor * 0.008);
    }
    // Bottom indent (more subtle)
    if (normalizedY < -0.7) {
      const indentFactor = Math.abs(normalizedY + 0.7) / 0.3;
      positions.setY(i, y + indentFactor * 0.004);
    }
  }
  bodyGeo.computeVertexNormals();
  
  const bodyMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0xff3333,
    roughness: 0.6
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.scale.set(1, 0.9, 1);
  body.position.y = 0.04;
  applyShadows(body);
  group.add(body);
  
  // Stem (tiny cylinder with taper)
  const stemGeo = new THREE.CylinderGeometry(0.001, 0.003, 0.015, 6);
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x4a3520, roughness: 0.9 });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.y = 0.075;
  group.add(stem);
  
  // Tiny leaf
  const leafGeo = new THREE.CircleGeometry(0.008, 6);
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x4a7c4a, roughness: 0.7, side: THREE.DoubleSide });
  const leaf = new THREE.Mesh(leafGeo, leafMat);
  leaf.position.set(0.004, 0.08, 0.003);
  leaf.rotation.set(Math.PI / 6, 0, Math.PI / 4);
  group.add(leaf);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  
  return context.addObject(group);
}

createApple.metadata = {
  category: 'food',
  name: 'Apple',
  description: 'Fresh apple with stem',
  dimensions: { width: 0.08, depth: 0.08, height: 0.08 },
  interactive: false
};

/**
 * Create a pear asset
 */
function createPear(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Bottom (sphere)
  const bottomGeo = new THREE.SphereGeometry(0.035, 16, 16);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0xb8d62e,
    roughness: 0.6
  });
  const bottom = new THREE.Mesh(bottomGeo, bodyMat);
  bottom.position.y = 0.035;
  applyShadows(bottom);
  group.add(bottom);
  
  // Top (smaller sphere, stretched)
  const topGeo = new THREE.SphereGeometry(0.02, 16, 16);
  const top = new THREE.Mesh(topGeo, bodyMat);
  top.scale.set(1, 1.3, 1);
  top.position.y = 0.065;
  group.add(top);
  
  // Stem
  const stemGeo = new THREE.CylinderGeometry(0.002, 0.003, 0.02, 6);
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x4a3520 });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.y = 0.095;
  group.add(stem);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  
  return context.addObject(group);
}

createPear.metadata = {
  category: 'food',
  name: 'Pear',
  description: 'Fresh pear with stem',
  dimensions: { width: 0.07, depth: 0.07, height: 0.11 },
  interactive: false
};

/**
 * Create a banana asset
 */
function createBanana(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Banana body (curved cylinder using torus segment)
  const curve = new THREE.TorusGeometry(0.08, 0.02, 8, 16, Math.PI * 0.8);
  const bananaMat = new THREE.MeshStandardMaterial({
    color: 0xffeb3b,
    roughness: 0.7
  });
  const body = new THREE.Mesh(curve, bananaMat);
  body.rotation.x = Math.PI / 2;
  body.rotation.z = -Math.PI / 4;
  body.position.y = 0.05;
  applyShadows(body);
  group.add(body);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createBanana.metadata = {
  category: 'food',
  name: 'Banana',
  description: 'Curved banana fruit',
  dimensions: { width: 0.16, depth: 0.04, height: 0.1 },
  interactive: false
};

/**
 * Create grapes asset
 */
function createGrapes(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const grapeMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0x6a0dad,
    roughness: 0.3,
    metalness: 0.1
  });
  
  // Stem/vine at top
  const stemGeo = new THREE.CylinderGeometry(0.002, 0.003, 0.03, 6);
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x6b5d3c, roughness: 0.9 });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.y = 0.08;
  stem.rotation.z = Math.PI / 8;
  group.add(stem);
  
  // Cluster of spheres
  const positions = [
    [0, 0.06, 0], [0.015, 0.055, 0.01], [-0.015, 0.055, -0.01],
    [0.01, 0.045, -0.015], [-0.01, 0.045, 0.015],
    [0, 0.035, 0], [0.02, 0.03, 0], [-0.02, 0.03, 0],
    [0.01, 0.02, 0.015], [-0.01, 0.02, -0.015],
    [0, 0.01, 0]
  ];
  
  positions.forEach(([x, y, z]) => {
    const grapeGeo = new THREE.SphereGeometry(0.01, 12, 12);
    const grape = new THREE.Mesh(grapeGeo, grapeMat);
    grape.position.set(x, y, z);
    applyShadows(grape);
    group.add(grape);
    
    // Tiny stem connecting each grape
    const tinyStemiGeo = new THREE.CylinderGeometry(0.0008, 0.0008, 0.008, 4);
    const tinyStem = new THREE.Mesh(tinyStemiGeo, stemMat);
    tinyStem.position.set(x, y + 0.008, z);
    group.add(tinyStem);
  });
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  
  return context.addObject(group);
}

createGrapes.metadata = {
  category: 'food',
  name: 'Grapes',
  description: 'Bunch of grapes',
  dimensions: { width: 0.04, depth: 0.04, height: 0.07 },
  interactive: false
};

/**
 * Create a bowl asset
 */
function createBowl(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Bowl outer shell (hemisphere)
  const bowlGeo = new THREE.SphereGeometry(0.12, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  const bowlMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0xf5f5dc,
    roughness: 0.5,
    side: THREE.DoubleSide
  });
  const bowl = new THREE.Mesh(bowlGeo, bowlMat);
  bowl.position.y = 0.05;
  applyShadows(bowl);
  group.add(bowl);
  
  // Inner bowl (slightly smaller for thickness)
  const innerBowlGeo = new THREE.SphereGeometry(0.115, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  const innerBowl = new THREE.Mesh(innerBowlGeo, bowlMat);
  innerBowl.position.y = 0.053;
  group.add(innerBowl);
  
  // Rim (torus for rounded edge)
  const rimGeo = new THREE.TorusGeometry(0.12, 0.006, 8, 32);
  const rim = new THREE.Mesh(rimGeo, bowlMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.05;
  applyShadows(rim);
  group.add(rim);
  
  // Base ring (footed bowl)
  const baseGeo = new THREE.TorusGeometry(0.05, 0.008, 8, 24);
  const base = new THREE.Mesh(baseGeo, bowlMat);
  base.rotation.x = Math.PI / 2;
  base.position.y = 0.008;
  applyShadows(base);
  group.add(base);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  
  return context.addObject(group);
}

createBowl.metadata = {
  category: 'food',
  name: 'Bowl',
  description: 'Empty bowl',
  dimensions: { width: 0.24, depth: 0.24, height: 0.05 },
  interactive: false
};

/**
 * Create a fruit bowl asset with fruits
 */
function createFruitBowl(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Bowl base
  const bowlGeo = new THREE.SphereGeometry(0.15, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
  const bowlMat = new THREE.MeshStandardMaterial({
    color: 0xe8dcc0,
    roughness: 0.6
  });
  const bowl = new THREE.Mesh(bowlGeo, bowlMat);
  bowl.position.y = 0.05;
  applyShadows(bowl);
  group.add(bowl);
  
  // Add fruits inside
  const fruitPositions = [
    { type: 'apple', x: 0, y: 0.08, z: 0, color: 0xff3333 },
    { type: 'apple', x: 0.06, y: 0.09, z: 0.04, color: 0x66ff66 },
    { type: 'banana', x: -0.05, y: 0.1, z: 0.02 },
    { type: 'grapes', x: 0.03, y: 0.08, z: -0.05, color: 0x6a0dad },
    { type: 'pear', x: -0.04, y: 0.08, z: -0.03, color: 0xffeb3b }
  ];
  
  fruitPositions.forEach(fruit => {
    if (fruit.type === 'apple') {
      const bodyGeo = new THREE.SphereGeometry(0.035, 12, 12);
      const bodyMat = new THREE.MeshStandardMaterial({ color: fruit.color, roughness: 0.6 });
      const apple = new THREE.Mesh(bodyGeo, bodyMat);
      apple.scale.set(1, 0.9, 1);
      apple.position.set(fruit.x, fruit.y, fruit.z);
      applyShadows(apple);
      group.add(apple);
    } else if (fruit.type === 'banana') {
      const curve = new THREE.TorusGeometry(0.06, 0.015, 6, 12, Math.PI * 0.7);
      const bananaMat = new THREE.MeshStandardMaterial({ color: 0xffeb3b, roughness: 0.7 });
      const banana = new THREE.Mesh(curve, bananaMat);
      banana.rotation.x = Math.PI / 2;
      banana.rotation.z = -Math.PI / 6;
      banana.position.set(fruit.x, fruit.y, fruit.z);
      applyShadows(banana);
      group.add(banana);
    } else if (fruit.type === 'grapes') {
      for (let i = 0; i < 6; i++) {
        const grapeGeo = new THREE.SphereGeometry(0.008, 6, 6);
        const grapeMat = new THREE.MeshStandardMaterial({ color: fruit.color, roughness: 0.3 });
        const grape = new THREE.Mesh(grapeGeo, grapeMat);
        grape.position.set(
          fruit.x + (Math.random() - 0.5) * 0.025,
          fruit.y + i * 0.012,
          fruit.z + (Math.random() - 0.5) * 0.025
        );
        applyShadows(grape);
        group.add(grape);
      }
    } else if (fruit.type === 'pear') {
      const pearGeo = new THREE.SphereGeometry(0.03, 12, 12);
      const pearMat = new THREE.MeshStandardMaterial({ color: fruit.color, roughness: 0.6 });
      const pear = new THREE.Mesh(pearGeo, pearMat);
      pear.scale.set(0.9, 1.2, 0.9);
      pear.position.set(fruit.x, fruit.y, fruit.z);
      applyShadows(pear);
      group.add(pear);
    }
  });
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createFruitBowl.metadata = {
  category: 'food',
  name: 'Fruit Bowl',
  description: 'Bowl filled with assorted fruits',
  dimensions: { width: 0.3, depth: 0.3, height: 0.2 },
  interactive: false
};

/**
 * Create lunch tray asset
 */
function createLunchTray(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const trayWidth = 0.35;
  const trayDepth = 0.25;
  const trayHeight = 0.03;
  
  const trayMat = new THREE.MeshStandardMaterial({ 
    color: spec.color || 0xff6b35,
    roughness: 0.7
  });
  
  // Main tray base
  const baseGeo = new THREE.BoxGeometry(trayWidth, trayHeight, trayDepth);
  const base = new THREE.Mesh(baseGeo, trayMat);
  base.position.y = trayHeight / 2;
  applyShadows(base);
  group.add(base);
  
  // Raised rim around edges
  const rimHeight = 0.015;
  const rimThickness = 0.01;
  
  // Top rim
  const topRimGeo = new THREE.BoxGeometry(trayWidth, rimHeight, rimThickness);
  const topRim = new THREE.Mesh(topRimGeo, trayMat);
  topRim.position.set(0, trayHeight + rimHeight / 2, trayDepth / 2 - rimThickness / 2);
  group.add(topRim);
  
  // Bottom rim
  const bottomRim = topRim.clone();
  bottomRim.position.z = -trayDepth / 2 + rimThickness / 2;
  group.add(bottomRim);
  
  // Side rims
  const sideRimGeo = new THREE.BoxGeometry(rimThickness, rimHeight, trayDepth);
  [-1, 1].forEach(side => {
    const sideRim = new THREE.Mesh(sideRimGeo, trayMat);
    sideRim.position.set(side * (trayWidth / 2 - rimThickness / 2), trayHeight + rimHeight / 2, 0);
    group.add(sideRim);
  });
  
  // Compartment dividers
  const dividerGeo = new THREE.BoxGeometry(rimThickness * 0.8, rimHeight, trayDepth * 0.7);
  const divider1 = new THREE.Mesh(dividerGeo, trayMat);
  divider1.position.set(-trayWidth * 0.2, trayHeight + rimHeight / 2, 0);
  group.add(divider1);
  
  const divider2 = divider1.clone();
  divider2.position.x = trayWidth * 0.15;
  group.add(divider2);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createLunchTray.metadata = {
  category: 'food',
  name: 'Lunch Tray',
  description: 'Cafeteria lunch tray with compartments',
  dimensions: { width: 0.35, depth: 0.25, height: 0.045 },
  interactive: false
};

/**
 * Create single french fry (crinkled)
 */
function createFrenchFry(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const fryLength = 0.06;
  const fryWidth = 0.006;
  
  const fryMat = new THREE.MeshStandardMaterial({ 
    color: 0xf4c430,
    roughness: 0.8
  });
  
  // Create crinkled fry using multiple segments
  const segments = 8;
  for (let i = 0; i < segments; i++) {
    const segmentGeo = new THREE.BoxGeometry(fryWidth * (i % 2 === 0 ? 1.2 : 0.9), fryLength / segments, fryWidth * (i % 2 === 0 ? 1.2 : 0.9));
    const segment = new THREE.Mesh(segmentGeo, fryMat);
    segment.position.y = (i - segments / 2) * (fryLength / segments);
    applyShadows(segment);
    group.add(segment);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || fryLength / 2, (spec.z || 0) * gridSize);
  group.rotation.set(spec.rotationX || 0, spec.rotation || 0, spec.rotationZ || 0);
  
  return context.addObject(group);
}

createFrenchFry.metadata = {
  category: 'food',
  name: 'French Fry',
  description: 'Single crinkle-cut french fry',
  dimensions: { width: 0.006, depth: 0.006, height: 0.06 },
  interactive: false
};

/**
 * Create french fries in container (instanced)
 */
function createFrenchFries(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const containerMat = new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.6 });
  const fryMat = new THREE.MeshStandardMaterial({ color: 0xf4c430, roughness: 0.8 });
  
  // Container (paper carton style)
  const containerGeo = new THREE.CylinderGeometry(0.04, 0.03, 0.08, 4);
  const container = new THREE.Mesh(containerGeo, containerMat);
  container.position.y = 0.04;
  applyShadows(container);
  group.add(container);
  
  // Fries (instanced for performance)
  const fryCount = 20;
  const fryGeo = new THREE.BoxGeometry(0.004, 0.05, 0.004);
  const fryInstance = new THREE.InstancedMesh(fryGeo, fryMat, fryCount);
  
  const dummy = new THREE.Object3D();
  for (let i = 0; i < fryCount; i++) {
    dummy.position.set(
      (Math.random() - 0.5) * 0.05,
      0.04 + Math.random() * 0.04,
      (Math.random() - 0.5) * 0.05
    );
    dummy.rotation.set(
      (Math.random() - 0.5) * 0.3,
      Math.random() * Math.PI * 2,
      (Math.random() - 0.5) * 0.3
    );
    dummy.updateMatrix();
    fryInstance.setMatrixAt(i, dummy.matrix);
  }
  fryInstance.castShadow = true;
  fryInstance.receiveShadow = true;
  group.add(fryInstance);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createFrenchFries.metadata = {
  category: 'food',
  name: 'French Fries',
  description: 'Container of french fries',
  dimensions: { width: 0.08, depth: 0.08, height: 0.12 },
  interactive: false
};

/**
 * Create burger asset
 */
function createBurger(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const bunRadius = 0.045;
  const pattyRadius = 0.04;
  
  // Bottom bun
  const bottomBunGeo = new THREE.SphereGeometry(bunRadius, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const bunMat = new THREE.MeshStandardMaterial({ color: 0xd2691e, roughness: 0.8 });
  const bottomBun = new THREE.Mesh(bottomBunGeo, bunMat);
  bottomBun.position.y = 0;
  applyShadows(bottomBun);
  group.add(bottomBun);
  
  // Sesame seeds on top bun
  const seedMat = new THREE.MeshStandardMaterial({ color: 0xfaf0e6, roughness: 0.9 });
  
  // Patty
  const pattyGeo = new THREE.CylinderGeometry(pattyRadius, pattyRadius, 0.012, 20);
  const pattyMat = new THREE.MeshStandardMaterial({ color: 0x5d4e37, roughness: 0.9 });
  const patty = new THREE.Mesh(pattyGeo, pattyMat);
  patty.position.y = 0.02;
  applyShadows(patty);
  group.add(patty);
  
  // Cheese
  const cheeseGeo = new THREE.CylinderGeometry(pattyRadius * 1.05, pattyRadius * 1.05, 0.003, 4);
  const cheeseMat = new THREE.MeshStandardMaterial({ color: 0xffa500, roughness: 0.7 });
  const cheese = new THREE.Mesh(cheeseGeo, cheeseMat);
  cheese.position.y = 0.027;
  cheese.rotation.y = Math.PI / 4;
  applyShadows(cheese);
  group.add(cheese);
  
  // Lettuce (ruffled disc)
  const lettuceGeo = new THREE.CylinderGeometry(pattyRadius * 0.95, pattyRadius * 0.95, 0.004, 16);
  const lettuceMat = new THREE.MeshStandardMaterial({ color: 0x90ee90, roughness: 0.85 });
  const lettuce = new THREE.Mesh(lettuceGeo, lettuceMat);
  lettuce.position.y = 0.032;
  
  // Add ruffles to lettuce
  const lettucePos = lettuceGeo.attributes.position;
  for (let i = 0; i < lettucePos.count; i++) {
    const x = lettucePos.getX(i);
    const z = lettucePos.getZ(i);
    const dist = Math.sqrt(x * x + z * z);
    if (dist > pattyRadius * 0.7) {
      const ruffle = Math.sin(Math.atan2(z, x) * 8) * 0.003;
      lettucePos.setY(i, lettucePos.getY(i) + ruffle);
    }
  }
  lettuceGeo.computeVertexNormals();
  applyShadows(lettuce);
  group.add(lettuce);
  
  // Tomato slice
  const tomatoGeo = new THREE.CylinderGeometry(pattyRadius * 0.7, pattyRadius * 0.7, 0.005, 16);
  const tomatoMat = new THREE.MeshStandardMaterial({ color: 0xff6347, roughness: 0.6 });
  const tomato = new THREE.Mesh(tomatoGeo, tomatoMat);
  tomato.position.y = 0.038;
  applyShadows(tomato);
  group.add(tomato);
  
  // Top bun (upper hemisphere - rounded top)
  const topBunGeo = new THREE.SphereGeometry(bunRadius, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const topBun = new THREE.Mesh(topBunGeo, bunMat);
  topBun.position.y = 0.065;
  applyShadows(topBun);
  group.add(topBun);
  
  // Sesame seeds
  for (let i = 0; i < 15; i++) {
    const angle = (i / 15) * Math.PI * 2;
    const radius = bunRadius * (0.4 + Math.random() * 0.4);
    const seedGeo = new THREE.SphereGeometry(0.001, 6, 6);
    const seed = new THREE.Mesh(seedGeo, seedMat);
    seed.position.set(
      Math.cos(angle) * radius,
      0.08 + Math.random() * 0.01,
      Math.sin(angle) * radius
    );
    group.add(seed);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createBurger.metadata = {
  category: 'food',
  name: 'Burger',
  description: 'Cheeseburger with lettuce and tomato',
  dimensions: { width: 0.09, depth: 0.09, height: 0.09 },
  interactive: false
};

/**
 * Create pizza asset (whole or slice)
 */
function createPizza(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const isSlice = spec.slice === true;
  const radius = 0.15;
  const thickness = 0.015;
  
  const crustMat = new THREE.MeshStandardMaterial({ color: 0xdaa520, roughness: 0.8 });
  const sauceMat = new THREE.MeshStandardMaterial({ color: 0xff4500, roughness: 0.7 });
  const cheeseMat = new THREE.MeshStandardMaterial({ color: 0xfff8dc, roughness: 0.6 });
  const pepperoniMat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.7 });
  
  if (isSlice) {
    // Pizza slice
    const sliceAngle = Math.PI / 4;
    const sliceGeo = new THREE.CylinderGeometry(radius, radius, thickness, 16, 1, false, 0, sliceAngle);
    const slice = new THREE.Mesh(sliceGeo, crustMat);
    slice.rotation.x = Math.PI / 2;
    applyShadows(slice);
    group.add(slice);
    
    // Sauce layer
    const sauceGeo = new THREE.CylinderGeometry(radius * 0.95, radius * 0.95, thickness * 0.3, 16, 1, false, 0, sliceAngle);
    const sauce = new THREE.Mesh(sauceGeo, sauceMat);
    sauce.rotation.x = Math.PI / 2;
    sauce.position.y = thickness * 0.35;
    group.add(sauce);
    
    // Cheese layer
    const cheeseGeo = new THREE.CylinderGeometry(radius * 0.93, radius * 0.93, thickness * 0.25, 16, 1, false, 0, sliceAngle);
    const cheese = new THREE.Mesh(cheeseGeo, cheeseMat);
    cheese.rotation.x = Math.PI / 2;
    cheese.position.y = thickness * 0.5;
    group.add(cheese);
    
    // Pepperoni (2-3 on slice)
    for (let i = 0; i < 3; i++) {
      const pepGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.003, 12);
      const pep = new THREE.Mesh(pepGeo, pepperoniMat);
      pep.rotation.x = Math.PI / 2;
      const dist = radius * (0.3 + i * 0.2);
      const angle = sliceAngle * (0.3 + i * 0.15);
      pep.position.set(Math.cos(angle) * dist, thickness * 0.52, Math.sin(angle) * dist);
      group.add(pep);
    }
  } else {
    // Whole pizza
    const pizzaGeo = new THREE.CylinderGeometry(radius, radius, thickness, 32);
    const pizza = new THREE.Mesh(pizzaGeo, crustMat);
    pizza.rotation.x = Math.PI / 2;
    applyShadows(pizza);
    group.add(pizza);
    
    // Sauce
    const sauceGeo = new THREE.CylinderGeometry(radius * 0.92, radius * 0.92, thickness * 0.3, 32);
    const sauce = new THREE.Mesh(sauceGeo, sauceMat);
    sauce.rotation.x = Math.PI / 2;
    sauce.position.y = thickness * 0.35;
    group.add(sauce);
    
    // Cheese
    const cheeseGeo = new THREE.CylinderGeometry(radius * 0.9, radius * 0.9, thickness * 0.25, 32);
    const cheese = new THREE.Mesh(cheeseGeo, cheeseMat);
    cheese.rotation.x = Math.PI / 2;
    cheese.position.y = thickness * 0.5;
    group.add(cheese);
    
    // Pepperoni (scattered)
    const pepperoniCount = 12;
    for (let i = 0; i < pepperoniCount; i++) {
      const angle = (i / pepperoniCount) * Math.PI * 2 + Math.random() * 0.5;
      const dist = radius * (0.3 + Math.random() * 0.5);
      const pepGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.003, 12);
      const pep = new THREE.Mesh(pepGeo, pepperoniMat);
      pep.rotation.x = Math.PI / 2;
      pep.position.set(Math.cos(angle) * dist, thickness * 0.52, Math.sin(angle) * dist);
      group.add(pep);
    }
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createPizza.metadata = {
  category: 'food',
  name: 'Pizza',
  description: 'Pepperoni pizza (whole or slice)',
  dimensions: { width: 0.3, depth: 0.3, height: 0.015 },
  interactive: false
};

/**
 * Create bread loaf/slice
 */
function createBread(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const isSlice = spec.slice === true;
  const breadMat = new THREE.MeshStandardMaterial({ color: 0xdaa520, roughness: 0.85 });
  const crustMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.9 });
  
  if (isSlice) {
    // Bread slice
    const sliceGeo = new THREE.BoxGeometry(0.1, 0.015, 0.1);
    const slice = new THREE.Mesh(sliceGeo, breadMat);
    applyShadows(slice);
    group.add(slice);
    
    // Crust edges
    const crustThickness = 0.003;
    const edges = [
      [0.1, crustThickness, crustThickness, [0, 0, 0.05]],
      [0.1, crustThickness, crustThickness, [0, 0, -0.05]],
      [crustThickness, crustThickness, 0.1, [-0.05, 0, 0]],
      [crustThickness, crustThickness, 0.1, [0.05, 0, 0]]
    ];
    
    edges.forEach(([w, h, d, pos]) => {
      const edgeGeo = new THREE.BoxGeometry(w, h, d);
      const edge = new THREE.Mesh(edgeGeo, crustMat);
      edge.position.set(...pos);
      group.add(edge);
    });
  } else {
    // Whole loaf
    const loafGeo = new THREE.BoxGeometry(0.25, 0.1, 0.12, 16, 8, 8);
    
    // Round the loaf top
    const positions = loafGeo.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      
      if (y > 0) {
        const nx = Math.abs(x / 0.125);
        const nz = Math.abs(z / 0.06);
        const roundFactor = 1 - Math.max(nx, nz);
        if (roundFactor > 0) {
          positions.setY(i, y + roundFactor * 0.03);
        }
      }
    }
    loafGeo.computeVertexNormals();
    
    const loaf = new THREE.Mesh(loafGeo, crustMat);
    loaf.position.y = 0.05;
    applyShadows(loaf);
    group.add(loaf);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || isSlice ? 0.0075 : 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createBread.metadata = {
  category: 'food',
  name: 'Bread',
  description: 'Bread loaf or slice',
  dimensions: { width: 0.25, depth: 0.12, height: 0.1 },
  interactive: false
};

/**
 * Create sandwich asset
 */
function createSandwich(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const breadMat = new THREE.MeshStandardMaterial({ color: 0xdaa520, roughness: 0.85 });
  const meatMat = new THREE.MeshStandardMaterial({ color: 0xcd853f, roughness: 0.7 });
  const cheeseMat = new THREE.MeshStandardMaterial({ color: 0xffa500, roughness: 0.6 });
  const lettuceMat = new THREE.MeshStandardMaterial({ color: 0x90ee90, roughness: 0.85 });
  
  // Bottom bread
  const bottomGeo = new THREE.BoxGeometry(0.1, 0.015, 0.1);
  const bottom = new THREE.Mesh(bottomGeo, breadMat);
  bottom.position.y = 0.0075;
  applyShadows(bottom);
  group.add(bottom);
  
  // Lettuce
  const lettuceGeo = new THREE.BoxGeometry(0.095, 0.003, 0.095);
  const lettuce = new THREE.Mesh(lettuceGeo, lettuceMat);
  lettuce.position.y = 0.017;
  group.add(lettuce);
  
  // Meat (ham/turkey)
  const meatGeo = new THREE.BoxGeometry(0.09, 0.004, 0.09);
  const meat = new THREE.Mesh(meatGeo, meatMat);
  meat.position.y = 0.0215;
  group.add(meat);
  
  // Cheese
  const cheeseGeo = new THREE.BoxGeometry(0.092, 0.003, 0.092);
  const cheese = new THREE.Mesh(cheeseGeo, cheeseMat);
  cheese.position.y = 0.026;
  cheese.rotation.y = Math.PI / 4;
  group.add(cheese);
  
  // Top bread
  const top = bottom.clone();
  top.position.y = 0.042;
  applyShadows(top);
  group.add(top);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createSandwich.metadata = {
  category: 'food',
  name: 'Sandwich',
  description: 'Layered sandwich with meat, cheese, and lettuce',
  dimensions: { width: 0.1, depth: 0.1, height: 0.05 },
  interactive: false
};

/**
 * Create bread with peanut butter
 */
function createPBBread(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const breadMat = new THREE.MeshStandardMaterial({ color: 0xdaa520, roughness: 0.85 });
  const pbMat = new THREE.MeshStandardMaterial({ color: 0xc68e17, roughness: 0.7 });
  
  // Bread slice
  const breadGeo = new THREE.BoxGeometry(0.1, 0.015, 0.1);
  const bread = new THREE.Mesh(breadGeo, breadMat);
  bread.position.y = 0.0075;
  applyShadows(bread);
  group.add(bread);
  
  // Peanut butter layer (slightly uneven)
  const pbGeo = new THREE.BoxGeometry(0.092, 0.006, 0.092, 8, 1, 8);
  const pbPositions = pbGeo.attributes.position;
  
  // Add slight unevenness
  for (let i = 0; i < pbPositions.count; i++) {
    const y = pbPositions.getY(i);
    if (y > 0) {
      pbPositions.setY(i, y + Math.random() * 0.002);
    }
  }
  pbGeo.computeVertexNormals();
  
  const pb = new THREE.Mesh(pbGeo, pbMat);
  pb.position.y = 0.018;
  group.add(pb);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createPBBread.metadata = {
  category: 'food',
  name: 'PB Bread',
  description: 'Bread slice with peanut butter',
  dimensions: { width: 0.1, depth: 0.1, height: 0.024 },
  interactive: false
};

/**
 * Helper: Create waffle texture for cone
 */
function createWaffleTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  
  // Base color
  ctx.fillStyle = '#d2691e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw waffle grid pattern
  ctx.strokeStyle = '#8b4513';
  ctx.lineWidth = 3;
  
  const gridSize = 16;
  // Diagonal lines
  for (let i = -canvas.height; i < canvas.width + canvas.height; i += gridSize) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + canvas.height, canvas.height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i - canvas.height, canvas.height);
    ctx.stroke();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Create ice cream cone
 */
function createIceCreamCone(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const hasSprinkles = spec.sprinkles === true;
  
  const waffleTexture = createWaffleTexture(THREE);
  const coneMat = new THREE.MeshStandardMaterial({ 
    map: waffleTexture,
    color: 0xd2691e, 
    roughness: 0.85 
  });
  const iceCreamMat = new THREE.MeshStandardMaterial({ 
    color: spec.iceCreamColor || 0xfff8dc,
    roughness: 0.6
  });
  
  // Cone (pointing down, flipped)
  const coneGeo = new THREE.ConeGeometry(0.025, 0.08, 20);
  const cone = new THREE.Mesh(coneGeo, coneMat);
  cone.rotation.x = Math.PI; // Flip cone to point down
  cone.position.y = 0.055;
  applyShadows(cone);
  group.add(cone);
  
  // Rim at top of cone
  const rimGeo = new THREE.TorusGeometry(0.026, 0.003, 8, 20);
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xc19a6b, roughness: 0.8 });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.095;
  applyShadows(rim);
  group.add(rim);
  
  // Ice cream scoop with edge puffs
  const scoopGeo = new THREE.SphereGeometry(0.032, 24, 24);
  const scoopPositions = scoopGeo.attributes.position;
  
  // Deform scoop with edge puffs where it meets the cone
  for (let i = 0; i < scoopPositions.count; i++) {
    const x = scoopPositions.getX(i);
    const y = scoopPositions.getY(i);
    const z = scoopPositions.getZ(i);
    const distFromCenter = Math.sqrt(x * x + z * z);
    const normalizedY = y / 0.032;
    
    // Create puffs around the bottom edge where it meets the cone
    if (normalizedY < -0.5) {
      const angle = Math.atan2(z, x);
      const puffFactor = Math.sin(angle * 4) * 0.003;
      const edgePuff = (1 + puffFactor) * (Math.abs(normalizedY + 0.5) * 0.5);
      scoopPositions.setX(i, x * (1 + edgePuff));
      scoopPositions.setZ(i, z * (1 + edgePuff));
    }
    
    // Overall slight bulge for melting effect
    const bulgeFactor = 1 + (1 - Math.abs(normalizedY)) * 0.05;
    scoopPositions.setX(i, x * bulgeFactor);
    scoopPositions.setZ(i, z * bulgeFactor);
  }
  scoopGeo.computeVertexNormals();
  
  const scoop = new THREE.Mesh(scoopGeo, iceCreamMat);
  scoop.position.y = 0.11;
  applyShadows(scoop);
  group.add(scoop);
  
  // Sprinkles
  if (hasSprinkles) {
    const sprinkleColors = [0xff69b4, 0x4169e1, 0xffd700, 0x32cd32, 0xff4500];
    for (let i = 0; i < 30; i++) {
      const sprinkleGeo = new THREE.CylinderGeometry(0.0005, 0.0005, 0.004, 4);
      const sprinkleMat = new THREE.MeshStandardMaterial({ 
        color: sprinkleColors[Math.floor(Math.random() * sprinkleColors.length)],
        roughness: 0.5
      });
      const sprinkle = new THREE.Mesh(sprinkleGeo, sprinkleMat);
      
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI / 2 + Math.PI / 4;
      const r = 0.03;
      
      sprinkle.position.set(
        Math.sin(phi) * Math.cos(theta) * r,
        0.11 + Math.cos(phi) * r,
        Math.sin(phi) * Math.sin(theta) * r
      );
      sprinkle.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(sprinkle);
    }
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createIceCreamCone.metadata = {
  category: 'food',
  name: 'Ice Cream Cone',
  description: 'Ice cream cone with optional sprinkles',
  dimensions: { width: 0.06, depth: 0.06, height: 0.125 },
  interactive: false
};

/**
 * Create a single potato chip asset
 */
function createChip(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Chip shape (irregular ellipse with wave deformation)
  const chipGeo = new THREE.CircleGeometry(0.025, 16);
  const positions = chipGeo.attributes.position;
  
  // Apply wave deformation for natural chip curve
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const distFromCenter = Math.sqrt(x * x + y * y);
    const angle = Math.atan2(y, x);
    
    // Waviness
    const wave = Math.sin(angle * 3) * 0.003 + Math.sin(angle * 5) * 0.002;
    const zOffset = Math.sin(distFromCenter * 30) * 0.005 + wave;
    positions.setZ(i, zOffset);
    
    // Slight irregularity on edges
    if (distFromCenter > 0.018) {
      const edgeVariation = Math.sin(angle * 7) * 0.002;
      positions.setX(i, x * (1 + edgeVariation));
      positions.setY(i, y * (1 + edgeVariation));
    }
  }
  chipGeo.computeVertexNormals();
  
  const chipMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0xf4d03f,
    roughness: 0.6,
    side: THREE.DoubleSide
  });
  const chip = new THREE.Mesh(chipGeo, chipMat);
  chip.position.y = 0.01;
  chip.rotation.x = Math.random() * 0.3 - 0.15; // Slight random tilt
  applyShadows(chip);
  group.add(chip);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || Math.random() * Math.PI * 2;
  
  return context.addObject(group);
}

createChip.metadata = {
  category: 'food',
  name: 'Chip',
  description: 'Single wavy potato chip',
  dimensions: { width: 0.05, depth: 0.05, height: 0.01 },
  interactive: false
};

/**
 * Create a bowl of chips
 */
function createChipBowl(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Bowl (reuse bowl logic but smaller)
  const bowlRadius = 0.05;
  const bowlHeight = 0.04;
  
  const outerGeo = new THREE.SphereGeometry(bowlRadius, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  const bowlMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.6
  });
  const outerBowl = new THREE.Mesh(outerGeo, bowlMat);
  outerBowl.position.y = bowlHeight;
  applyShadows(outerBowl);
  group.add(outerBowl);
  
  // Inner bowl for thickness
  const innerGeo = new THREE.SphereGeometry(bowlRadius - 0.003, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  const innerBowl = new THREE.Mesh(innerGeo, bowlMat);
  innerBowl.position.y = bowlHeight + 0.002;
  innerBowl.material.side = THREE.BackSide;
  group.add(innerBowl);
  
  // Base ring
  const baseGeo = new THREE.TorusGeometry(bowlRadius * 0.6, 0.003, 8, 24);
  const base = new THREE.Mesh(baseGeo, bowlMat);
  base.rotation.x = Math.PI / 2;
  base.position.y = 0.003;
  applyShadows(base);
  group.add(base);
  
  // Chips (instanced for performance)
  const chipGeo = new THREE.CircleGeometry(0.018, 12);
  const chipPositions = chipGeo.attributes.position;
  for (let i = 0; i < chipPositions.count; i++) {
    const x = chipPositions.getX(i);
    const y = chipPositions.getY(i);
    const distFromCenter = Math.sqrt(x * x + y * y);
    const wave = Math.sin(distFromCenter * 40) * 0.003;
    chipPositions.setZ(i, wave);
  }
  chipGeo.computeVertexNormals();
  
  const chipMat = new THREE.MeshStandardMaterial({
    color: 0xf4d03f,
    roughness: 0.6,
    side: THREE.DoubleSide
  });
  
  const chipCount = 15;
  const chipsInstance = new THREE.InstancedMesh(chipGeo, chipMat, chipCount);
  applyShadows(chipsInstance);
  
  const dummy = new THREE.Object3D();
  for (let i = 0; i < chipCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 0.03;
    const height = bowlHeight + 0.01 + i * 0.003;
    
    dummy.position.set(
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    );
    dummy.rotation.set(
      Math.random() * 0.5 - 0.25,
      Math.random() * Math.PI * 2,
      Math.random() * 0.5 - 0.25
    );
    dummy.updateMatrix();
    chipsInstance.setMatrixAt(i, dummy.matrix);
  }
  group.add(chipsInstance);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  
  return context.addObject(group);
}

createChipBowl.metadata = {
  category: 'food',
  name: 'Chip Bowl',
  description: 'Bowl filled with potato chips',
  dimensions: { width: 0.1, depth: 0.1, height: 0.08 },
  interactive: false
};

/**
 * Create a bowl of chip dip
 */
function createChipDipBowl(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Bowl (smaller than chip bowl)
  const bowlRadius = 0.04;
  const bowlHeight = 0.03;
  
  const outerGeo = new THREE.SphereGeometry(bowlRadius, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  const bowlMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.6
  });
  const outerBowl = new THREE.Mesh(outerGeo, bowlMat);
  outerBowl.position.y = bowlHeight;
  applyShadows(outerBowl);
  group.add(outerBowl);
  
  // Inner bowl
  const innerGeo = new THREE.SphereGeometry(bowlRadius - 0.003, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  const innerBowl = new THREE.Mesh(innerGeo, bowlMat);
  innerBowl.position.y = bowlHeight + 0.002;
  innerBowl.material.side = THREE.BackSide;
  group.add(innerBowl);
  
  // Base ring
  const baseGeo = new THREE.TorusGeometry(bowlRadius * 0.6, 0.003, 8, 24);
  const base = new THREE.Mesh(baseGeo, bowlMat);
  base.rotation.x = Math.PI / 2;
  base.position.y = 0.003;
  applyShadows(base);
  group.add(base);
  
  // Dip (creamy substance)
  const dipGeo = new THREE.CircleGeometry(bowlRadius * 0.85, 24);
  const dipMat = new THREE.MeshStandardMaterial({
    color: spec.dipColor || 0xf5e6d3, // Creamy beige
    roughness: 0.4
  });
  const dip = new THREE.Mesh(dipGeo, dipMat);
  dip.rotation.x = -Math.PI / 2;
  dip.position.y = bowlHeight + 0.015;
  applyShadows(dip);
  group.add(dip);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  
  return context.addObject(group);
}

createChipDipBowl.metadata = {
  category: 'food',
  name: 'Chip Dip Bowl',
  description: 'Small bowl filled with creamy dip',
  dimensions: { width: 0.08, depth: 0.08, height: 0.06 },
  interactive: false
};

/**
 * Create an empty bowl (variant)
 */
function createEmptyBowl(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const bowlRadius = 0.05;
  const bowlHeight = 0.04;
  
  // Outer bowl
  const outerGeo = new THREE.SphereGeometry(bowlRadius, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  const bowlMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0xffffff,
    roughness: 0.6
  });
  const outerBowl = new THREE.Mesh(outerGeo, bowlMat);
  outerBowl.position.y = bowlHeight;
  applyShadows(outerBowl);
  group.add(outerBowl);
  
  // Inner bowl for thickness
  const innerGeo = new THREE.SphereGeometry(bowlRadius - 0.003, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  const innerBowl = new THREE.Mesh(innerGeo, bowlMat);
  innerBowl.position.y = bowlHeight + 0.002;
  innerBowl.material.side = THREE.BackSide;
  group.add(innerBowl);
  
  // Rounded rim (torus)
  const rimGeo = new THREE.TorusGeometry(bowlRadius, 0.003, 8, 24);
  const rim = new THREE.Mesh(rimGeo, bowlMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = bowlHeight;
  applyShadows(rim);
  group.add(rim);
  
  // Base ring
  const baseGeo = new THREE.TorusGeometry(bowlRadius * 0.6, 0.003, 8, 24);
  const base = new THREE.Mesh(baseGeo, bowlMat);
  base.rotation.x = Math.PI / 2;
  base.position.y = 0.003;
  applyShadows(base);
  group.add(base);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  
  return context.addObject(group);
}

createEmptyBowl.metadata = {
  category: 'food',
  name: 'Empty Bowl',
  description: 'Empty serving bowl',
  dimensions: { width: 0.1, depth: 0.1, height: 0.08 },
  interactive: false
};

/**
 * Create a salad bowl
 */
function createSaladBowl(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Bowl
  const bowlRadius = 0.06;
  const bowlHeight = 0.05;
  
  const outerGeo = new THREE.SphereGeometry(bowlRadius, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  const bowlMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.6
  });
  const outerBowl = new THREE.Mesh(outerGeo, bowlMat);
  outerBowl.position.y = bowlHeight;
  applyShadows(outerBowl);
  group.add(outerBowl);
  
  // Lettuce leaves (instanced with ruffle)
  const leafGeo = new THREE.CircleGeometry(0.02, 12);
  const leafPositions = leafGeo.attributes.position;
  for (let i = 0; i < leafPositions.count; i++) {
    const x = leafPositions.getX(i);
    const y = leafPositions.getY(i);
    const dist = Math.sqrt(x * x + y * y);
    const angle = Math.atan2(y, x);
    const ruffle = Math.sin(angle * 6) * 0.005 * dist;
    leafPositions.setZ(i, ruffle);
  }
  leafGeo.computeVertexNormals();
  
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x6faa3e,
    roughness: 0.7,
    side: THREE.DoubleSide
  });
  
  const leafCount = 12;
  const leavesInstance = new THREE.InstancedMesh(leafGeo, leafMat, leafCount);
  applyShadows(leavesInstance);
  
  const dummy = new THREE.Object3D();
  for (let i = 0; i < leafCount; i++) {
    const angle = (i / leafCount) * Math.PI * 2 + Math.random() * 0.5;
    const radius = Math.random() * 0.025 + 0.01;
    const height = bowlHeight + 0.015 + Math.random() * 0.01;
    
    dummy.position.set(
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    );
    dummy.rotation.set(
      Math.random() * 0.5,
      Math.random() * Math.PI * 2,
      Math.random() * 0.5
    );
    dummy.updateMatrix();
    leavesInstance.setMatrixAt(i, dummy.matrix);
  }
  group.add(leavesInstance);
  
  // Cherry tomatoes (small red spheres)
  const tomatoGeo = new THREE.SphereGeometry(0.008, 8, 8);
  const tomatoMat = new THREE.MeshStandardMaterial({
    color: 0xff3333,
    roughness: 0.5
  });
  for (let i = 0; i < 3; i++) {
    const tomato = new THREE.Mesh(tomatoGeo, tomatoMat);
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 0.02;
    tomato.position.set(
      Math.cos(angle) * radius,
      bowlHeight + 0.025,
      Math.sin(angle) * radius
    );
    applyShadows(tomato);
    group.add(tomato);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  
  return context.addObject(group);
}

createSaladBowl.metadata = {
  category: 'food',
  name: 'Salad Bowl',
  description: 'Bowl of fresh salad with lettuce and tomatoes',
  dimensions: { width: 0.12, depth: 0.12, height: 0.09 },
  interactive: false
};

/**
 * Create a candy bowl
 */
function createCandyBowl(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Bowl (glass-like)
  const bowlRadius = 0.045;
  const bowlHeight = 0.035;
  
  const outerGeo = new THREE.SphereGeometry(bowlRadius, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  const bowlMat = new THREE.MeshStandardMaterial({
    color: 0xddddff,
    transparent: true,
    opacity: 0.7,
    roughness: 0.1
  });
  const outerBowl = new THREE.Mesh(outerGeo, bowlMat);
  outerBowl.position.y = bowlHeight;
  applyShadows(outerBowl);
  group.add(outerBowl);
  
  // Candies (wrapped, colorful spheres)
  const candyGeo = new THREE.SphereGeometry(0.008, 8, 8);
  const candyColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
  
  for (let i = 0; i < 10; i++) {
    const candyMat = new THREE.MeshStandardMaterial({
      color: candyColors[i % candyColors.length],
      roughness: 0.3,
      metalness: 0.2
    });
    const candy = new THREE.Mesh(candyGeo, candyMat);
    
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 0.025;
    const height = bowlHeight + 0.01 + Math.random() * 0.015;
    
    candy.position.set(
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    );
    applyShadows(candy);
    group.add(candy);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  
  return context.addObject(group);
}

createCandyBowl.metadata = {
  category: 'food',
  name: 'Candy Bowl',
  description: 'Glass bowl filled with colorful candies',
  dimensions: { width: 0.09, depth: 0.09, height: 0.07 },
  interactive: false
};

/**
 * Create a pretzel bowl
 */
function createPretzelBowl(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Bowl
  const bowlRadius = 0.05;
  const bowlHeight = 0.04;
  
  const outerGeo = new THREE.SphereGeometry(bowlRadius, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  const bowlMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.6
  });
  const outerBowl = new THREE.Mesh(outerGeo, bowlMat);
  outerBowl.position.y = bowlHeight;
  applyShadows(outerBowl);
  group.add(outerBowl);
  
  // Pretzels (simplified pretzel shapes)
  const pretzelMat = new THREE.MeshStandardMaterial({
    color: 0x8b4513,
    roughness: 0.8
  });
  
  for (let i = 0; i < 8; i++) {
    const pretzelGroup = new THREE.Group();
    
    // Simplified pretzel as three connected toruses
    const torusGeo = new THREE.TorusGeometry(0.008, 0.003, 8, 12);
    
    const loop1 = new THREE.Mesh(torusGeo, pretzelMat);
    loop1.position.set(-0.006, 0, 0);
    applyShadows(loop1);
    pretzelGroup.add(loop1);
    
    const loop2 = new THREE.Mesh(torusGeo, pretzelMat);
    loop2.position.set(0.006, 0, 0);
    applyShadows(loop2);
    pretzelGroup.add(loop2);
    
    const angle = (i / 8) * Math.PI * 2;
    const radius = Math.random() * 0.02 + 0.01;
    const height = bowlHeight + 0.015 + i * 0.004;
    
    pretzelGroup.position.set(
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    );
    pretzelGroup.rotation.set(
      Math.random() * 0.5,
      Math.random() * Math.PI * 2,
      Math.random() * 0.5
    );
    
    group.add(pretzelGroup);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  
  return context.addObject(group);
}

createPretzelBowl.metadata = {
  category: 'food',
  name: 'Pretzel Bowl',
  description: 'Bowl filled with pretzels',
  dimensions: { width: 0.1, depth: 0.1, height: 0.08 },
  interactive: false
};

/**
 * Create a single pretzel
 */
function createPretzel(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const pretzelMat = new THREE.MeshStandardMaterial({
    color: 0x8b4513,
    roughness: 0.8
  });
  
  // Main curved rope (use torus segments)
  const ropeGeo = new THREE.TorusGeometry(0.015, 0.004, 8, 16, Math.PI);
  
  // Bottom loop
  const bottom = new THREE.Mesh(ropeGeo, pretzelMat);
  bottom.rotation.x = Math.PI / 2;
  bottom.position.y = 0.008;
  applyShadows(bottom);
  group.add(bottom);
  
  // Left loop
  const leftLoop = new THREE.Mesh(ropeGeo, pretzelMat);
  leftLoop.rotation.set(Math.PI / 2, 0, Math.PI / 3);
  leftLoop.position.set(-0.008, 0.02, 0);
  applyShadows(leftLoop);
  group.add(leftLoop);
  
  // Right loop
  const rightLoop = new THREE.Mesh(ropeGeo, pretzelMat);
  rightLoop.rotation.set(Math.PI / 2, 0, -Math.PI / 3);
  rightLoop.position.set(0.008, 0.02, 0);
  applyShadows(rightLoop);
  group.add(rightLoop);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  
  return context.addObject(group);
}

createPretzel.metadata = {
  category: 'food',
  name: 'Pretzel',
  description: 'Single pretzel',
  dimensions: { width: 0.03, depth: 0.03, height: 0.03 },
  interactive: false
};

/**
 * Create a pretzel with salt
 */
function createPretzelWithSalt(spec, THREE, context) {
  const group = createPretzel(spec, THREE, { ...context, addObject: (obj) => obj });
  
  // Add salt crystals (tiny white boxes)
  const saltGeo = new THREE.BoxGeometry(0.0008, 0.0008, 0.0008);
  const saltMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3
  });
  
  for (let i = 0; i < 12; i++) {
    const salt = new THREE.Mesh(saltGeo, saltMat);
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 0.012;
    salt.position.set(
      Math.cos(angle) * radius,
      0.015 + Math.random() * 0.01,
      Math.sin(angle) * radius
    );
    salt.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    applyShadows(salt);
    group.add(salt);
  }
  
  group.position.set((spec.x || 0) * context.gridSize, spec.y || 0, (spec.z || 0) * context.gridSize);
  
  return context.addObject(group);
}

createPretzelWithSalt.metadata = {
  category: 'food',
  name: 'Pretzel with Salt',
  description: 'Single pretzel with visible salt crystals',
  dimensions: { width: 0.03, depth: 0.03, height: 0.03 },
  interactive: false
};

// Export all food creators
export const creators = {
  apple: createApple,
  pear: createPear,
  banana: createBanana,
  grapes: createGrapes,
  bowl: createBowl,
  fruitbowl: createFruitBowl,
  lunchtray: createLunchTray,
  frenchfry: createFrenchFry,
  frenchfries: createFrenchFries,
  burger: createBurger,
  pizza: createPizza,
  bread: createBread,
  sandwich: createSandwich,
  pbbread: createPBBread,
  icecreamcone: createIceCreamCone,
  chip: createChip,
  chipbowl: createChipBowl,
  chipdipbowl: createChipDipBowl,
  emptybowl: createEmptyBowl,
  saladbowl: createSaladBowl,
  candybowl: createCandyBowl,
  pretzelbowl: createPretzelBowl,
  pretzel: createPretzel,
  pretzelwithsalt: createPretzelWithSalt
};



