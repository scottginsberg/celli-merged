// ==================== GROCERIES ASSET CREATORS ====================
// Universal grocery and pantry item creation functions

import { createPositionedGroup, applyShadows } from '../asset-context.js';

/**
 * Create cheese asset with enhanced fidelity
 * BLOCKING: Cheese block -> Wax rind -> Holes (Swiss) -> Label sticker -> Cut marks
 * TECHNIQUES: Vertex deformation for organic edges, sphere subtraction for holes, layered materials
 */
function createCheese(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const cheeseType = spec.cheeseType || 'cheddar'; // cheddar, swiss, brie
  
  const cheeseMat = new THREE.MeshStandardMaterial({
    color: cheeseType === 'brie' ? 0xfff8dc : (cheeseType === 'swiss' ? 0xffffdd : 0xffd700),
    roughness: 0.7
  });
  
  if (cheeseType === 'brie') {
    // Brie wheel (round with white rind)
    const rindMat = new THREE.MeshStandardMaterial({
      color: 0xfff5ee,
      roughness: 0.9
    });
    
    // Cheese interior
    const interiorGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.025, 24);
    const interior = new THREE.Mesh(interiorGeo, cheeseMat);
    interior.position.y = 0.0125;
    applyShadows(interior);
    group.add(interior);
    
    // White rind (outer ring)
    const rindSideGeo = new THREE.CylinderGeometry(0.057, 0.057, 0.027, 24);
    const rindSide = new THREE.Mesh(rindSideGeo, rindMat);
    rindSide.position.y = 0.0125;
    applyShadows(rindSide);
    group.add(rindSide);
    
    // Top and bottom rind circles
    const rindTopGeo = new THREE.CircleGeometry(0.056, 24);
    const rindTop = new THREE.Mesh(rindTopGeo, rindMat);
    rindTop.rotation.x = -Math.PI / 2;
    rindTop.position.y = 0.026;
    group.add(rindTop);
    
    const rindBottom = rindTop.clone();
    rindBottom.rotation.x = Math.PI / 2;
    rindBottom.position.y = -0.001;
    group.add(rindBottom);
    
  } else if (cheeseType === 'swiss') {
    // Swiss cheese block with holes
    const blockGeo = new THREE.BoxGeometry(0.08, 0.03, 0.08, 8, 4, 8);
    const blockPositions = blockGeo.attributes.position;
    
    // Slightly irregular edges (cut cheese)
    for (let i = 0; i < blockPositions.count; i++) {
      const x = blockPositions.getX(i);
      const y = blockPositions.getY(i);
      const z = blockPositions.getZ(i);
      
      // Random slight variations on edges
      if (Math.abs(x) > 0.035 || Math.abs(z) > 0.035) {
        const variation = (Math.random() - 0.5) * 0.002;
        blockPositions.setY(i, y + variation);
      }
    }
    blockGeo.computeVertexNormals();
    
    const block = new THREE.Mesh(blockGeo, cheeseMat);
    block.position.y = 0.015;
    applyShadows(block);
    group.add(block);
    
    // Swiss cheese holes (spherical indents)
    const holeMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.9,
      side: THREE.BackSide
    });
    
    const holePositions = [
      [0.015, 0.015, 0.02],
      [-0.02, 0.015, -0.015],
      [0.025, 0.015, -0.025],
      [-0.025, 0.015, 0.025],
      [0, 0.015, 0]
    ];
    
    holePositions.forEach(pos => {
      const holeSize = 0.008 + Math.random() * 0.004;
      const holeGeo = new THREE.SphereGeometry(holeSize, 12, 12);
      const hole = new THREE.Mesh(holeGeo, holeMat);
      hole.position.set(pos[0], pos[1], pos[2]);
      group.add(hole);
    });
    
  } else {
    // Cheddar block (default)
    const blockGeo = new THREE.BoxGeometry(0.08, 0.03, 0.08, 8, 4, 8);
    const blockPositions = blockGeo.attributes.position;
    
    // Slightly rounded/organic edges
    for (let i = 0; i < blockPositions.count; i++) {
      const x = blockPositions.getX(i);
      const y = blockPositions.getY(i);
      const z = blockPositions.getZ(i);
      
      // Round the top edges slightly
      if (y > 0.012) {
        const edgeDist = Math.max(Math.abs(x) - 0.035, Math.abs(z) - 0.035);
        if (edgeDist > 0) {
          const roundFactor = edgeDist * 0.3;
          blockPositions.setY(i, y - roundFactor);
        }
      }
    }
    blockGeo.computeVertexNormals();
    
    const block = new THREE.Mesh(blockGeo, cheeseMat);
    block.position.y = 0.015;
    applyShadows(block);
    group.add(block);
    
    // Wax rind on sides (thin layer)
    const waxMat = new THREE.MeshStandardMaterial({
      color: 0xcc0000,
      roughness: 0.6
    });
    
    // Front/back wax panels
    const waxFBGeo = new THREE.BoxGeometry(0.081, 0.031, 0.001);
    [-0.0405, 0.0405].forEach(z => {
      const waxPanel = new THREE.Mesh(waxFBGeo, waxMat);
      waxPanel.position.set(0, 0.015, z);
      applyShadows(waxPanel);
      group.add(waxPanel);
    });
    
    // Left/right wax panels
    const waxLRGeo = new THREE.BoxGeometry(0.001, 0.031, 0.08);
    [-0.0405, 0.0405].forEach(x => {
      const waxPanel = new THREE.Mesh(waxLRGeo, waxMat);
      waxPanel.position.set(x, 0.015, 0);
      applyShadows(waxPanel);
      group.add(waxPanel);
    });
  }
  
  // Label sticker (small)
  const labelGeo = new THREE.PlaneGeometry(0.035, 0.02);
  const labelMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.4
  });
  const label = new THREE.Mesh(labelGeo, labelMat);
  label.position.set(0, 0.016, cheeseType === 'brie' ? 0.058 : 0.041);
  label.rotation.x = cheeseType === 'brie' ? 0 : 0;
  group.add(label);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createCheese.metadata = {
  category: 'groceries',
  name: 'Cheese',
  description: 'Block of cheese',
  dimensions: { width: 0.08, depth: 0.08, height: 0.03 },
  interactive: false
};

/**
 * Create eggs asset with enhanced fidelity
 * BLOCKING: Carton base with dimples -> Carton lid (hinged) -> Eggs with organic shape -> Label
 * TECHNIQUES: Dimpled carton geometry, vertex deformation for egg shape, hinged lid with clasp
 */
function createEggs(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const cartonMat = new THREE.MeshStandardMaterial({
    color: 0xd8d0c8,
    roughness: 0.95
  });
  
  // Carton base with walls
  const baseGeo = new THREE.BoxGeometry(0.12, 0.012, 0.08);
  const base = new THREE.Mesh(baseGeo, cartonMat);
  base.position.y = 0.006;
  applyShadows(base);
  group.add(base);
  
  // Side walls
  const wallHeight = 0.025;
  const wallThickness = 0.003;
  
  // Front/back walls
  const wallFBGeo = new THREE.BoxGeometry(0.12, wallHeight, wallThickness);
  [-0.0385, 0.0385].forEach(z => {
    const wall = new THREE.Mesh(wallFBGeo, cartonMat);
    wall.position.set(0, 0.0125, z);
    applyShadows(wall);
    group.add(wall);
  });
  
  // Left/right walls
  const wallLRGeo = new THREE.BoxGeometry(wallThickness, wallHeight, 0.074);
  [-0.0585, 0.0585].forEach(x => {
    const wall = new THREE.Mesh(wallLRGeo, cartonMat);
    wall.position.set(x, 0.0125, 0);
    applyShadows(wall);
    group.add(wall);
  });
  
  // Egg dimples (6 indentations)
  const dimpleMat = new THREE.MeshStandardMaterial({
    color: 0xc8c0b8,
    roughness: 0.98,
    side: THREE.DoubleSide
  });
  
  for (let i = 0; i < 6; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const xPos = -0.04 + col * 0.04;
    const zPos = -0.02 + row * 0.04;
    
    // Dimple (partial sphere, inverted)
    const dimpleGeo = new THREE.SphereGeometry(0.017, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2.5);
    const dimple = new THREE.Mesh(dimpleGeo, dimpleMat);
    dimple.rotation.x = Math.PI; // Flip to create depression
    dimple.position.set(xPos, 0.01, zPos);
    applyShadows(dimple);
    group.add(dimple);
  }
  
  // Carton lid (hinged at back)
  const lidTopGeo = new THREE.BoxGeometry(0.116, 0.003, 0.076);
  const lidTop = new THREE.Mesh(lidTopGeo, cartonMat);
  lidTop.position.set(0, 0.045, 0);
  applyShadows(lidTop);
  group.add(lidTop);
  
  // Lid front edge (thicker for clasp)
  const lidFrontGeo = new THREE.BoxGeometry(0.116, 0.008, 0.006);
  const lidFront = new THREE.Mesh(lidFrontGeo, cartonMat);
  lidFront.position.set(0, 0.0455, 0.041);
  applyShadows(lidFront);
  group.add(lidFront);
  
  // Lid back edge (hinge area)
  const lidBackGeo = new THREE.BoxGeometry(0.116, 0.006, 0.004);
  const lidBack = new THREE.Mesh(lidBackGeo, cartonMat);
  lidBack.position.set(0, 0.0445, -0.04);
  applyShadows(lidBack);
  group.add(lidBack);
  
  // Lid clasp tab (front)
  const claspGeo = new THREE.BoxGeometry(0.015, 0.003, 0.012);
  const clasp = new THREE.Mesh(claspGeo, cartonMat);
  clasp.position.set(0, 0.041, 0.047);
  clasp.rotation.x = Math.PI / 6; // Angle down
  applyShadows(clasp);
  group.add(clasp);
  
  // Base clasp slot (receiver)
  const slotGeo = new THREE.BoxGeometry(0.017, 0.002, 0.004);
  const slot = new THREE.Mesh(slotGeo, new THREE.MeshStandardMaterial({
    color: 0xa8a098,
    roughness: 1.0
  }));
  slot.position.set(0, 0.0245, 0.042);
  group.add(slot);
  
  // Eggs (organic ellipsoid shapes)
  const eggMat = new THREE.MeshStandardMaterial({
    color: 0xfff5ea,
    roughness: 0.6
  });
  
  for (let i = 0; i < 6; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const xPos = -0.04 + col * 0.04;
    const zPos = -0.02 + row * 0.04;
    
    // Egg shape (ellipsoid with vertex deformation for organic look)
    const eggGeo = new THREE.SphereGeometry(0.015, 16, 16);
    const eggPositions = eggGeo.attributes.position;
    
    // Create more pointed top, rounder bottom
    for (let j = 0; j < eggPositions.count; j++) {
      const y = eggPositions.getY(j);
      const x = eggPositions.getX(j);
      const z = eggPositions.getZ(j);
      
      // Taper the top
      if (y > 0) {
        const taperFactor = 1 - (y / 0.015) * 0.25;
        eggPositions.setX(j, x * taperFactor);
        eggPositions.setZ(j, z * taperFactor);
        eggPositions.setY(j, y * 1.35); // Stretch up
      } else {
        eggPositions.setY(j, y * 1.25); // Stretch down slightly
      }
    }
    eggGeo.computeVertexNormals();
    
    const egg = new THREE.Mesh(eggGeo, eggMat);
    egg.position.set(xPos, 0.033, zPos);
    egg.rotation.x = (Math.random() - 0.5) * 0.1; // Slight random tilt
    applyShadows(egg);
    group.add(egg);
  }
  
  // Label on lid
  const labelGeo = new THREE.PlaneGeometry(0.06, 0.035);
  const labelMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5
  });
  const label = new THREE.Mesh(labelGeo, labelMat);
  label.rotation.x = -Math.PI / 2;
  label.position.set(0, 0.0465, 0);
  group.add(label);
  
  // Label text (simple representation with lines)
  const textLineMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
  for (let i = 0; i < 3; i++) {
    const lineGeo = new THREE.PlaneGeometry(0.045, 0.002);
    const line = new THREE.Mesh(lineGeo, textLineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(0, 0.047, -0.01 + i * 0.01);
    group.add(line);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createEggs.metadata = {
  category: 'groceries',
  name: 'Eggs',
  description: 'Carton of eggs',
  dimensions: { width: 0.12, depth: 0.08, height: 0.05 },
  interactive: false
};

/**
 * Create cereal box asset
 */
function createCerealBox(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = 0.2;
  const height = 0.3;
  const depth = 0.08;
  
  const boxGeo = new THREE.BoxGeometry(width, height, depth);
  const boxMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0xffaa00,
    roughness: 0.8
  });
  const box = new THREE.Mesh(boxGeo, boxMat);
  box.position.y = height / 2;
  applyShadows(box);
  group.add(box);
  
  // Label
  const labelGeo = new THREE.PlaneGeometry(width * 0.8, height * 0.6);
  const labelMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9
  });
  const label = new THREE.Mesh(labelGeo, labelMat);
  label.position.set(0, height * 0.6, depth / 2 + 0.001);
  group.add(label);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createCerealBox.metadata = {
  category: 'groceries',
  name: 'Cereal Box',
  description: 'Box of breakfast cereal',
  dimensions: { width: 0.2, depth: 0.08, height: 0.3 },
  interactive: false
};

/**
 * Create cracker box asset
 */
function createCrackerBox(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = 0.18;
  const height = 0.22;
  const depth = 0.06;
  
  const boxGeo = new THREE.BoxGeometry(width, height, depth);
  const boxMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0xd4af37,
    roughness: 0.8
  });
  const box = new THREE.Mesh(boxGeo, boxMat);
  box.position.y = height / 2;
  applyShadows(box);
  group.add(box);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createCrackerBox.metadata = {
  category: 'groceries',
  name: 'Cracker Box',
  description: 'Box of crackers',
  dimensions: { width: 0.18, depth: 0.06, height: 0.22 },
  interactive: false
};

// Export all groceries creators
export const creators = {
  cheese: createCheese,
  eggs: createEggs,
  cerealbox: createCerealBox,
  crackerbox: createCrackerBox
};




