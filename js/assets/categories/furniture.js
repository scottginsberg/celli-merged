// ==================== FURNITURE ASSET CREATORS ====================
// Universal furniture creation functions - context-agnostic
// Can be called from scale-ultra, sequence-builder, preview apps, or AI evaluator

import { createPositionedGroup, applyShadows } from '../asset-context.js';

/**
 * Create a bed asset
 * @param {Object} spec - Asset specification { x, z, rotation, size, color, GRID_SIZE, ... }
 * @param {Object} THREE - Three.js library reference
 * @param {Object} context - Context with scene, objects, gridSize
 * @returns {THREE.Group}
 */
function createBed(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Get dimensions based on size
  const isChildBed = spec.size === 'child';
  const dimensions = isChildBed 
    ? { width: 0.9, depth: 1.4, height: 0.35, legHeight: 0.2 }
    : { width: 1.5, depth: 2, height: 0.5, legHeight: 0.3 };
  
  const b = dimensions;
  
  // Color scheme for child bed
  let bedColor = spec.color || 'white';
  if (!spec.color && isChildBed) {
    const positionSeed = Math.abs(Math.sin((spec.x || 0) * 12.9898 + (spec.z || 0) * 78.233) * 43758.5453);
    const seedValue = positionSeed - Math.floor(positionSeed);
    bedColor = seedValue < 0.33 ? 'blue' : seedValue < 0.66 ? 'pink' : 'lightpink';
  }
  
  // Frame
  const frameGeo = new THREE.BoxGeometry(b.width + 0.1, b.legHeight, b.depth + 0.1);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.8 });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.y = b.legHeight / 2;
  applyShadows(frame);
  group.add(frame);
  
  // Mattress with rounded corners
  const cornerRadius = 0.05;
  const mattressShape = new THREE.Shape();
  const w = b.width / 2 - cornerRadius;
  const d = b.depth / 2 - cornerRadius;
  
  mattressShape.moveTo(-w, -d);
  mattressShape.lineTo(w, -d);
  mattressShape.quadraticCurveTo(w + cornerRadius, -d, w + cornerRadius, -d + cornerRadius);
  mattressShape.lineTo(w + cornerRadius, d);
  mattressShape.quadraticCurveTo(w + cornerRadius, d + cornerRadius, w, d + cornerRadius);
  mattressShape.lineTo(-w, d + cornerRadius);
  mattressShape.quadraticCurveTo(-w - cornerRadius, d + cornerRadius, -w - cornerRadius, d);
  mattressShape.lineTo(-w - cornerRadius, -d + cornerRadius);
  mattressShape.quadraticCurveTo(-w - cornerRadius, -d, -w, -d);
  
  const extrudeSettings = { depth: b.height, bevelEnabled: false };
  const mattressGeo = new THREE.ExtrudeGeometry(mattressShape, extrudeSettings);
  const mattressMat = new THREE.MeshStandardMaterial({ color: 0xf5f5dc, roughness: 0.9 });
  const mattress = new THREE.Mesh(mattressGeo, mattressMat);
  mattress.rotation.x = -Math.PI / 2;
  mattress.position.y = b.legHeight;
  applyShadows(mattress);
  group.add(mattress);
  
  // Pillows with rounded/puffy geometry and pillowcase appearance
  const pillowCount = isChildBed ? 1 : 2;
  const pillowWidth = isChildBed ? 0.3 : 0.45; // Made bigger
  const pillowDepth = isChildBed ? 0.2 : 0.3; // Made bigger
  const pillowHeight = isChildBed ? 0.1 : 0.15; // Made bigger
  
  for (let i = 0; i < pillowCount; i++) {
    // Inner pillow (filling)
    const innerPillowGeo = new THREE.BoxGeometry(pillowWidth * 0.95, pillowHeight * 0.9, pillowDepth * 0.95, 12, 6, 12);
    const innerPositions = innerPillowGeo.attributes.position;
    
    // Add puffy rounded deformation to inner pillow
    for (let j = 0; j < innerPositions.count; j++) {
      const x = innerPositions.getX(j);
      const y = innerPositions.getY(j);
      const z = innerPositions.getZ(j);
      
      const nx = x / ((pillowWidth * 0.95) / 2);
      const ny = y / ((pillowHeight * 0.9) / 2);
      const nz = z / ((pillowDepth * 0.95) / 2);
      
      const dist = Math.sqrt(nx * nx + ny * ny + nz * nz);
      const puffFactor = Math.max(0, 1 - dist) * 0.2;
      
      innerPositions.setX(j, x * (1 + puffFactor * Math.abs(nx)));
      innerPositions.setY(j, y * (1 + puffFactor * Math.abs(ny) * 1.8));
      innerPositions.setZ(j, z * (1 + puffFactor * Math.abs(nz)));
    }
    innerPillowGeo.computeVertexNormals();
    
    const innerPillowMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.9 });
    const innerPillow = new THREE.Mesh(innerPillowGeo, innerPillowMat);
    
    // Pillowcase (slightly larger and translucent)
    const casePillowGeo = new THREE.BoxGeometry(pillowWidth, pillowHeight, pillowDepth, 12, 6, 12);
    const casePositions = casePillowGeo.attributes.position;
    
    // Add puffy rounded deformation to case
    for (let j = 0; j < casePositions.count; j++) {
      const x = casePositions.getX(j);
      const y = casePositions.getY(j);
      const z = casePositions.getZ(j);
      
      const nx = x / (pillowWidth / 2);
      const ny = y / (pillowHeight / 2);
      const nz = z / (pillowDepth / 2);
      
      const dist = Math.sqrt(nx * nx + ny * ny + nz * nz);
      const puffFactor = Math.max(0, 1 - dist) * 0.18;
      
      casePositions.setX(j, x * (1 + puffFactor * Math.abs(nx)));
      casePositions.setY(j, y * (1 + puffFactor * Math.abs(ny) * 1.6));
      casePositions.setZ(j, z * (1 + puffFactor * Math.abs(nz)));
    }
    casePillowGeo.computeVertexNormals();
    
    const casePillowMat = new THREE.MeshStandardMaterial({ 
      color: 0xffffff, 
      roughness: 0.75,
      transparent: false
    });
    const casePillow = new THREE.Mesh(casePillowGeo, casePillowMat);
    
    const pillowGroup = new THREE.Group();
    pillowGroup.add(innerPillow);
    pillowGroup.add(casePillow);
    
    const xOffset = pillowCount === 1 ? 0 : (i === 0 ? -b.width / 4 : b.width / 4);
    pillowGroup.position.set(xOffset, b.legHeight + b.height + pillowHeight / 2, -b.depth / 2 + pillowDepth / 2 + 0.05);
    applyShadows(innerPillow);
    applyShadows(casePillow);
    group.add(pillowGroup);
  }
  
  // Top sheet (underneath blanket, folds over at top)
  const sheetWidth = b.width * 1.05;
  const sheetDepth = b.depth * 0.9;
  const sheetGeo = new THREE.PlaneGeometry(sheetWidth, sheetDepth, 40, 40);
  
  // Add subtle wrinkles to sheet
  const sheetPositions = sheetGeo.attributes.position;
  for (let i = 0; i < sheetPositions.count; i++) {
    const x = sheetPositions.getX(i);
    const z = sheetPositions.getZ(i);
    const nx = x / (sheetWidth / 2);
    const nz = z / (sheetDepth / 2);
    
    // Subtle wrinkles
    const wrinkle = Math.sin(x * 12) * 0.008 + Math.sin(z * 10) * 0.006;
    
    // Fold over at head (negative z edge)
    if (nz < -0.6) {
      const foldFactor = Math.pow(Math.abs(nz + 0.6) / 0.4, 1.5);
      const foldHeight = foldFactor * 0.1; // Fold up and back
      const foldBack = foldFactor * 0.15;
      sheetPositions.setZ(i, z + wrinkle + foldHeight);
      sheetPositions.setY(i, -foldBack); // Bend back
    } else {
      sheetPositions.setZ(i, z + wrinkle);
    }
  }
  sheetGeo.computeVertexNormals();
  
  const sheetMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    roughness: 0.85,
    side: THREE.DoubleSide
  });
  const sheet = new THREE.Mesh(sheetGeo, sheetMat);
  sheet.rotation.x = -Math.PI / 2;
  sheet.position.set(0, b.legHeight + b.height + 0.02, b.depth * 0.05);
  applyShadows(sheet);
  group.add(sheet);
  
  // Blanket with thickness (top and bottom layers) with wave rumples and draping over edges
  const blanketWidth = b.width * 1.1; // Extend beyond bed edges
  const blanketDepth = b.depth * 0.85; // Longer to drape
  const blanketThickness = 0.015; // Thicker blanket
  
  // Top layer of blanket
  const blanketTopGeo = new THREE.PlaneGeometry(blanketWidth, blanketDepth, 48, 48);
  const topPositions = blanketTopGeo.attributes.position;
  
  for (let i = 0; i < topPositions.count; i++) {
    const x = topPositions.getX(i);
    const z = topPositions.getZ(i);
    const nx = x / (blanketWidth / 2);
    const nz = z / (blanketDepth / 2);
    
    // Multiple waves at different frequencies for natural look
    const wave1 = Math.sin(x * 8) * 0.015;
    const wave2 = Math.sin(z * 6) * 0.012;
    const wave3 = Math.sin(x * 15 + z * 12) * 0.008;
    const randomRumple = (Math.sin(x * 25) * Math.cos(z * 30)) * 0.005;
    
    let totalDisplacement = wave1 + wave2 + wave3 + randomRumple;
    
    // Add draping effect on edges (sides and foot)
    const edgeDistX = Math.abs(nx);
    const edgeDistZ = nz;
    
    // Side draping (left/right edges)
    if (edgeDistX > 0.9) {
      const drapeFactor = Math.pow((edgeDistX - 0.9) / 0.1, 2);
      totalDisplacement -= drapeFactor * 0.15; // Droop down
    }
    
    // Foot draping (positive z edge)
    if (edgeDistZ > 0.7) {
      const drapeFactor = Math.pow((edgeDistZ - 0.7) / 0.3, 2);
      totalDisplacement -= drapeFactor * 0.12; // Droop down
    }
    
    topPositions.setZ(i, topPositions.getZ(i) + totalDisplacement + blanketThickness / 2);
  }
  blanketTopGeo.computeVertexNormals();
  
  // Bottom layer of blanket (slightly offset, backside)
  const blanketBottomGeo = new THREE.PlaneGeometry(blanketWidth, blanketDepth, 48, 48);
  const bottomPositions = blanketBottomGeo.attributes.position;
  
  for (let i = 0; i < bottomPositions.count; i++) {
    const x = bottomPositions.getX(i);
    const z = bottomPositions.getZ(i);
    const nx = x / (blanketWidth / 2);
    const nz = z / (blanketDepth / 2);
    
    // Same deformation as top but slightly offset
    const wave1 = Math.sin(x * 8) * 0.015;
    const wave2 = Math.sin(z * 6) * 0.012;
    const wave3 = Math.sin(x * 15 + z * 12) * 0.008;
    const randomRumple = (Math.sin(x * 25) * Math.cos(z * 30)) * 0.005;
    
    let totalDisplacement = wave1 + wave2 + wave3 + randomRumple;
    
    const edgeDistX = Math.abs(nx);
    const edgeDistZ = nz;
    
    if (edgeDistX > 0.9) {
      const drapeFactor = Math.pow((edgeDistX - 0.9) / 0.1, 2);
      totalDisplacement -= drapeFactor * 0.15;
    }
    
    if (edgeDistZ > 0.7) {
      const drapeFactor = Math.pow((edgeDistZ - 0.7) / 0.3, 2);
      totalDisplacement -= drapeFactor * 0.12;
    }
    
    bottomPositions.setZ(i, bottomPositions.getZ(i) + totalDisplacement - blanketThickness / 2);
  }
  blanketBottomGeo.computeVertexNormals();
  
  const blanketColors = {
    blue: 0x4488ff,
    pink: 0xff88dd,
    lightpink: 0xffb6c1,
    white: 0x88aacc
  };
  
  const blanketTopMat = new THREE.MeshStandardMaterial({ 
    color: blanketColors[bedColor] || blanketColors.white, 
    roughness: 0.95,
    side: THREE.FrontSide
  });
  const blanketTop = new THREE.Mesh(blanketTopGeo, blanketTopMat);
  blanketTop.rotation.x = -Math.PI / 2;
  blanketTop.position.set(0, b.legHeight + b.height + 0.04, b.depth * 0.075);
  applyShadows(blanketTop);
  group.add(blanketTop);
  
  const blanketBottomMat = new THREE.MeshStandardMaterial({ 
    color: blanketColors[bedColor] || blanketColors.white, 
    roughness: 0.98,
    side: THREE.BackSide
  });
  const blanketBottom = new THREE.Mesh(blanketBottomGeo, blanketBottomMat);
  blanketBottom.rotation.x = -Math.PI / 2;
  blanketBottom.position.set(0, b.legHeight + b.height + 0.04, b.depth * 0.075);
  group.add(blanketBottom);
  
  // Position the group
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createBed.metadata = {
  category: 'furniture',
  name: 'Bed',
  description: 'Single or child-size bed with mattress, pillows, and blanket',
  dimensions: { width: 1.5, depth: 2, height: 0.5 },
  interactive: false
};

/**
 * Create a couch asset
 * @param {Object} spec - Asset specification
 * @param {Object} THREE - Three.js library reference
 * @param {Object} context - Context with scene, objects, gridSize
 * @returns {THREE.Group}
 */
function createCouch(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = 2.0;
  const depth = 0.8;
  const seatHeight = 0.4;
  const backHeight = 0.4;
  const armWidth = 0.15;
  
  // Seat with rounded edges
  const seatGeo = new THREE.BoxGeometry(width, seatHeight, depth, 1, 1, 1);
  const fabricMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.9 });
  const seat = new THREE.Mesh(seatGeo, fabricMat);
  seat.position.y = seatHeight / 2;
  applyShadows(seat);
  group.add(seat);
  
  // Back with padding geometry
  const backGeo = new THREE.BoxGeometry(width, backHeight, 0.15, 4, 4, 1);
  const backPositions = backGeo.attributes.position;
  for (let i = 0; i < backPositions.count; i++) {
    const x = backPositions.getX(i);
    const y = backPositions.getY(i);
    const z = backPositions.getZ(i);
    if (z > 0) {
      const normalizedX = Math.abs(x / (width / 2));
      const normalizedY = Math.abs(y / (backHeight / 2));
      const distFromCenter = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
      backPositions.setZ(i, z + Math.max(0, (1 - distFromCenter * 0.5)) * 0.05);
    }
  }
  backGeo.computeVertexNormals();
  
  const back = new THREE.Mesh(backGeo, fabricMat);
  back.position.set(0, seatHeight + backHeight / 2, -depth / 2 + 0.075);
  applyShadows(back);
  group.add(back);
  
  // Arms with rounded tops
  const armGeo = new THREE.BoxGeometry(armWidth, backHeight * 0.7, depth);
  [-width / 2 + armWidth / 2, width / 2 - armWidth / 2].forEach(xPos => {
    const arm = new THREE.Mesh(armGeo, fabricMat);
    arm.position.set(xPos, seatHeight + backHeight * 0.35, 0);
    applyShadows(arm);
    group.add(arm);
  });
  
  // Cushions with rounded geometry
  const cushionWidth = 0.6;
  const cushionDepth = 0.6;
  const cushionHeight = 0.1;
  const cushionMat = new THREE.MeshStandardMaterial({ color: 0x5a5a5a, roughness: 0.85 });
  
  for (let i = 0; i < 3; i++) {
    const cushionGeo = new THREE.BoxGeometry(cushionWidth, cushionHeight, cushionDepth, 8, 2, 8);
    const cushionPos = cushionGeo.attributes.position;
    
    // Add soft rounded top
    for (let j = 0; j < cushionPos.count; j++) {
      const x = cushionPos.getX(j);
      const y = cushionPos.getY(j);
      const z = cushionPos.getZ(j);
      
      if (y > 0) {
        const nx = x / (cushionWidth / 2);
        const nz = z / (cushionDepth / 2);
        const dist = Math.sqrt(nx * nx + nz * nz);
        cushionPos.setY(j, y + Math.max(0, (1 - dist)) * 0.04);
      }
    }
    cushionGeo.computeVertexNormals();
    
    const cushion = new THREE.Mesh(cushionGeo, cushionMat);
    cushion.position.set(-0.7 + i * 0.7, seatHeight + 0.05, 0);
    applyShadows(cushion);
    group.add(cushion);
  }
  
  // Position the group
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createCouch.metadata = {
  category: 'furniture',
  name: 'Couch',
  description: 'Three-seater sofa with arms and cushions',
  dimensions: { width: 2.0, depth: 0.8, height: 0.8 },
  interactive: false
};

/**
 * Create a desk asset
 * @param {Object} spec - Asset specification
 * @param {Object} THREE - Three.js library reference
 * @param {Object} context - Context with scene, objects, gridSize
 * @returns {THREE.Group}
 */
function createDesk(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const shape = spec.shape || 'rectangle';
  const dimensions = {
    square: { width: 1, depth: 1, height: 0.75, legRadius: 0.04, legHeight: 0.7 },
    rectangle: { width: 1.5, depth: 0.75, height: 0.75, legRadius: 0.04, legHeight: 0.7 },
    circle: { radius: 0.5, height: 0.75, legRadius: 0.04, legHeight: 0.7 }
  };
  
  const d = dimensions[shape] || dimensions.rectangle;
  
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.7 });
  const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.8 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.4, metalness: 0.8 });
  
  // Desktop with beveled edge
  if (shape === 'circle') {
    const desktopGeo = new THREE.CylinderGeometry(d.radius, d.radius, 0.05, 32);
    const desktop = new THREE.Mesh(desktopGeo, woodMat);
    desktop.position.y = d.legHeight;
    applyShadows(desktop);
    group.add(desktop);
    
    // Beveled edge (torus)
    const bevelGeo = new THREE.TorusGeometry(d.radius - 0.02, 0.015, 8, 32);
    const bevel = new THREE.Mesh(bevelGeo, darkWoodMat);
    bevel.rotation.x = Math.PI / 2;
    bevel.position.y = d.legHeight + 0.025;
    applyShadows(bevel);
    group.add(bevel);
  } else {
    const desktopGeo = new THREE.BoxGeometry(d.width, 0.05, d.depth);
    const desktop = new THREE.Mesh(desktopGeo, woodMat);
    desktop.position.y = d.legHeight;
    applyShadows(desktop);
    group.add(desktop);
    
    // Beveled edge strips
    const bevelThickness = 0.015;
    const bevelGeoH = new THREE.BoxGeometry(d.width - 0.02, bevelThickness, bevelThickness);
    const bevelGeoV = new THREE.BoxGeometry(d.depth - 0.02, bevelThickness, bevelThickness);
    
    // Top bevels (4 edges) - TRULY FIXED: side borders use Y rotation to swap X<->Z
    [
      [0, d.depth / 2 - 0.01, 0, null],          // Front (runs left-right)
      [0, -d.depth / 2 + 0.01, 0, null],         // Back (runs left-right)
      [d.width / 2 - 0.01, 0, 0, Math.PI / 2],   // Right (runs front-back) - FIXED: rotate.y swaps X<->Z
      [-d.width / 2 + 0.01, 0, 0, Math.PI / 2]   // Left (runs front-back) - FIXED: rotate.y swaps X<->Z
    ].forEach(([x, z, rotY, rotZ], i) => {
      const bevelGeo = i < 2 ? bevelGeoH : bevelGeoV;
      const bevel = new THREE.Mesh(bevelGeo, darkWoodMat);
      bevel.position.set(x, d.legHeight + 0.025, z);
      if (rotY) bevel.rotation.y = rotY; // TRULY FIXED: Y rotation swaps X and Z directions
      applyShadows(bevel);
      group.add(bevel);
    });
    
    // Drawers (if not circle desk)
    if (shape !== 'circle') {
      const drawerCount = 2;
      const drawerHeight = 0.12;
      const drawerWidth = d.width * 0.85;
      const drawerDepth = d.depth * 0.8;
      
      for (let i = 0; i < drawerCount; i++) {
        const drawerGeo = new THREE.BoxGeometry(drawerWidth, drawerHeight, drawerDepth);
        const drawer = new THREE.Mesh(drawerGeo, darkWoodMat);
        drawer.position.set(
          0,
          d.legHeight - 0.1 - i * (drawerHeight + 0.02), // FIXED: closer spacing (0.02 instead of 0.05)
          0
        );
        applyShadows(drawer);
        group.add(drawer);
        
        // Drawer pull handle
        const handleGeo = new THREE.CylinderGeometry(0.008, 0.008, drawerWidth * 0.3, 12);
        const handle = new THREE.Mesh(handleGeo, metalMat);
        handle.rotation.z = Math.PI / 2;
        handle.position.set(
          0,
          d.legHeight - 0.1 - i * (drawerHeight + 0.02), // FIXED: closer spacing
          drawerDepth / 2 + 0.01
        );
        applyShadows(handle);
        group.add(handle);
        
        // Handle mounts (small cylinders)
        [-drawerWidth * 0.14, drawerWidth * 0.14].forEach(xOff => {
          const mountGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.015, 12);
          const mount = new THREE.Mesh(mountGeo, metalMat);
          mount.position.set(
            xOff,
            d.legHeight - 0.1 - i * (drawerHeight + 0.02), // FIXED: closer spacing
            drawerDepth / 2 + 0.012
          );
          applyShadows(mount);
          group.add(mount);
        });
      }
    }
  }
  
  // Legs with feet
  const footHeight = 0.04;
  const legHeight = d.legHeight - footHeight; // Raise legs to account for feet
  const legGeo = new THREE.CylinderGeometry(d.legRadius, d.legRadius, legHeight, 8);
  const legPositions = shape === 'circle' 
    ? [[d.radius * 0.7, 0], [-d.radius * 0.7, 0], [0, d.radius * 0.7], [0, -d.radius * 0.7]]
    : [[d.width / 2 - 0.1, d.depth / 2 - 0.1], [-d.width / 2 + 0.1, d.depth / 2 - 0.1],
       [d.width / 2 - 0.1, -d.depth / 2 + 0.1], [-d.width / 2 + 0.1, -d.depth / 2 + 0.1]];
  
  legPositions.forEach(([x, z]) => {
    // Leg
    const leg = new THREE.Mesh(legGeo, woodMat);
    leg.position.set(x, footHeight + legHeight / 2, z);
    applyShadows(leg);
    group.add(leg);
    
    // Foot (wider, flatter cylinder at bottom)
    const footGeo = new THREE.CylinderGeometry(d.legRadius * 1.4, d.legRadius * 1.5, footHeight, 12);
    const foot = new THREE.Mesh(footGeo, darkWoodMat);
    foot.position.set(x, footHeight / 2, z);
    applyShadows(foot);
    group.add(foot);
  });
  
  // Position the group
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createDesk.metadata = {
  category: 'furniture',
  name: 'Desk',
  description: 'Simple desk with legs - square, rectangle, or circle shape',
  dimensions: { width: 1.5, depth: 0.75, height: 0.75 },
  interactive: false
};

/**
 * Create a coffee table asset
 * @param {Object} spec - Asset specification
 * @param {Object} THREE - Three.js library reference
 * @param {Object} context - Context with scene, objects, gridSize
 * @returns {THREE.Group}
 */
function createCoffeeTable(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const shape = spec.shape || 'rectangle';
  const height = 0.4;
  const thickness = 0.05;
  const material = spec.material || 'wood'; // wood, glass, darkwood, lightwood
  
  // Material variants
  let woodMat, darkWoodMat;
  
  if (material === 'glass') {
    woodMat = new THREE.MeshStandardMaterial({ 
      color: 0xccddee, 
      transparent: true, 
      opacity: 0.6, 
      roughness: 0.1, 
      metalness: 0.3 
    });
    darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.3, metalness: 0.7 });
  } else if (material === 'darkwood') {
    woodMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.5 });
    darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x1a1000, roughness: 0.6 });
  } else if (material === 'lightwood') {
    woodMat = new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.6 });
    darkWoodMat = new THREE.MeshStandardMaterial({ color: 0xb8945f, roughness: 0.7 });
  } else { // Default wood
    woodMat = new THREE.MeshStandardMaterial({ color: 0x5d4e37, roughness: 0.6 });
    darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.7 });
  }
  
  if (shape === 'square') {
    const size = 0.8;
    const topGeo = new THREE.BoxGeometry(size, thickness, size);
    const top = new THREE.Mesh(topGeo, woodMat);
    top.position.y = height;
    applyShadows(top);
    group.add(top);
    
    // Beveled edge frame
    const bevelWidth = 0.012;
    const framePieces = [
      new THREE.BoxGeometry(size + 0.02, bevelWidth, bevelWidth), // Front
      new THREE.BoxGeometry(size + 0.02, bevelWidth, bevelWidth), // Back
      new THREE.BoxGeometry(bevelWidth, bevelWidth, size),        // Left
      new THREE.BoxGeometry(bevelWidth, bevelWidth, size)         // Right
    ];
    const positions = [
      [0, height + thickness / 2 + bevelWidth / 2, size / 2 + bevelWidth / 2],
      [0, height + thickness / 2 + bevelWidth / 2, -size / 2 - bevelWidth / 2],
      [-size / 2 - bevelWidth / 2, height + thickness / 2 + bevelWidth / 2, 0],
      [size / 2 + bevelWidth / 2, height + thickness / 2 + bevelWidth / 2, 0]
    ];
    framePieces.forEach((geo, i) => {
      const frame = new THREE.Mesh(geo, darkWoodMat);
      frame.position.set(...positions[i]);
      applyShadows(frame);
      group.add(frame);
    });
    
    const legGeo = new THREE.CylinderGeometry(0.03, 0.03, height - thickness, 8);
    [[size / 2 - 0.1, size / 2 - 0.1], [-size / 2 + 0.1, size / 2 - 0.1],
     [size / 2 - 0.1, -size / 2 + 0.1], [-size / 2 + 0.1, -size / 2 + 0.1]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(legGeo, woodMat);
      leg.position.set(x, (height - thickness) / 2, z);
      applyShadows(leg);
      group.add(leg);
    });
  } else if (shape === 'circle') {
    const radius = 0.45;
    const topGeo = new THREE.CylinderGeometry(radius, radius, thickness, 32);
    const top = new THREE.Mesh(topGeo, woodMat);
    top.position.y = height;
    applyShadows(top);
    group.add(top);
    
    // Rounded beveled edge
    const bevelGeo = new THREE.TorusGeometry(radius + 0.01, 0.012, 8, 32);
    const bevel = new THREE.Mesh(bevelGeo, darkWoodMat);
    bevel.rotation.x = Math.PI / 2;
    bevel.position.y = height + thickness / 2 + 0.012;
    applyShadows(bevel);
    group.add(bevel);
    
    const legGeo = new THREE.CylinderGeometry(0.03, 0.03, height - thickness, 8);
    const legRadius = radius * 0.7;
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const leg = new THREE.Mesh(legGeo, woodMat);
      leg.position.set(Math.cos(angle) * legRadius, (height - thickness) / 2, Math.sin(angle) * legRadius);
      applyShadows(leg);
      group.add(leg);
    }
  } else {
    // Rectangle (default)
    const width = 1.2;
    const depth = 0.6;
    const topGeo = new THREE.BoxGeometry(width, thickness, depth);
    const top = new THREE.Mesh(topGeo, woodMat);
    top.position.y = height;
    applyShadows(top);
    group.add(top);
    
    // Beveled edge frame
    const bevelWidth = 0.012;
    const framePieces = [
      new THREE.BoxGeometry(width + 0.02, bevelWidth, bevelWidth), // Front
      new THREE.BoxGeometry(width + 0.02, bevelWidth, bevelWidth), // Back
      new THREE.BoxGeometry(bevelWidth, bevelWidth, depth),        // Left
      new THREE.BoxGeometry(bevelWidth, bevelWidth, depth)         // Right
    ];
    const positions = [
      [0, height + thickness / 2 + bevelWidth / 2, depth / 2 + bevelWidth / 2],
      [0, height + thickness / 2 + bevelWidth / 2, -depth / 2 - bevelWidth / 2],
      [-width / 2 - bevelWidth / 2, height + thickness / 2 + bevelWidth / 2, 0],
      [width / 2 + bevelWidth / 2, height + thickness / 2 + bevelWidth / 2, 0]
    ];
    framePieces.forEach((geo, i) => {
      const frame = new THREE.Mesh(geo, darkWoodMat);
      frame.position.set(...positions[i]);
      applyShadows(frame);
      group.add(frame);
    });
    
    const legGeo = new THREE.CylinderGeometry(0.03, 0.03, height - thickness, 8);
    [[width / 2 - 0.1, depth / 2 - 0.1], [-width / 2 + 0.1, depth / 2 - 0.1],
     [width / 2 - 0.1, -depth / 2 + 0.1], [-width / 2 + 0.1, -depth / 2 + 0.1]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(legGeo, woodMat);
      leg.position.set(x, (height - thickness) / 2, z);
      applyShadows(leg);
      group.add(leg);
    });
  }
  
  // Position the group
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createCoffeeTable.metadata = {
  category: 'furniture',
  name: 'Coffee Table',
  description: 'Low table for living room - square, rectangle, or circle',
  dimensions: { width: 1.2, depth: 0.6, height: 0.4 },
  interactive: false
};

/**
 * Create a nightstand/side table asset - HIGH FIDELITY
 */
function createNightstand(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = 0.45;
  const height = 0.5;
  const depth = 0.35;
  
  const woodMat = new THREE.MeshStandardMaterial({ color: spec.color || 0x8b6914, roughness: 0.7 });
  const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.8 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.4, metalness: 0.8 });
  
  // Body
  const bodyGeo = new THREE.BoxGeometry(width, height, depth);
  const body = new THREE.Mesh(bodyGeo, woodMat);
  body.position.y = height / 2;
  applyShadows(body);
  group.add(body);
  
  // Top surface (slightly larger with beveled edge)
  const topGeo = new THREE.BoxGeometry(width + 0.02, 0.04, depth + 0.02);
  const top = new THREE.Mesh(topGeo, darkWoodMat);
  top.position.y = height + 0.02;
  applyShadows(top);
  group.add(top);
  
  // Top beveled edges (4 sides)
  const bevelSize = 0.01;
  const bevelPositions = [
    [0, depth / 2 + 0.01, width + 0.02, bevelSize],      // Front
    [0, -depth / 2 - 0.01, width + 0.02, bevelSize],     // Back
    [width / 2 + 0.01, 0, bevelSize, depth + 0.02],      // Right
    [-width / 2 - 0.01, 0, bevelSize, depth + 0.02]      // Left
  ];
  
  bevelPositions.forEach(([x, z, w, d]) => {
    const bevelGeo = new THREE.BoxGeometry(w, bevelSize, d);
    const bevel = new THREE.Mesh(bevelGeo, darkWoodMat);
    bevel.position.set(x, height + 0.045, z);
    applyShadows(bevel);
    group.add(bevel);
  });
  
  // Drawers (2) with panel insets
  const drawerHeight = height * 0.32;
  const drawerSpacing = 0.04;
  
  for (let i = 0; i < 2; i++) {
    const drawerY = height * 0.12 + i * (drawerHeight + drawerSpacing);
    
    // Drawer front
    const drawerGeo = new THREE.BoxGeometry(width * 0.88, drawerHeight, 0.025);
    const drawer = new THREE.Mesh(drawerGeo, darkWoodMat);
    drawer.position.set(0, drawerY, depth / 2 + 0.0125);
    applyShadows(drawer);
    group.add(drawer);
    
    // Panel inset (decorative rectangle)
    const panelGeo = new THREE.BoxGeometry(width * 0.75, drawerHeight * 0.75, 0.005);
    const panel = new THREE.Mesh(panelGeo, woodMat);
    panel.position.set(0, drawerY, depth / 2 + 0.028);
    applyShadows(panel);
    group.add(panel);
    
    // Panel inset border
    const borderThickness = 0.008;
    [[0, drawerHeight * 0.375, width * 0.76, borderThickness],
     [0, -drawerHeight * 0.375, width * 0.76, borderThickness],
     [width * 0.375, 0, borderThickness, drawerHeight * 0.75],
     [-width * 0.375, 0, borderThickness, drawerHeight * 0.75]].forEach(([x, y, w, h]) => {
      const borderGeo = new THREE.BoxGeometry(w, h, 0.003);
      const border = new THREE.Mesh(borderGeo, darkWoodMat);
      border.position.set(x, drawerY + y, depth / 2 + 0.031);
      group.add(border);
    });
    
    // Handle with mounts
    const handleGeo = new THREE.CylinderGeometry(0.008, 0.008, width * 0.22, 12);
    const handle = new THREE.Mesh(handleGeo, metalMat);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(0, drawerY, depth / 2 + 0.035);
    applyShadows(handle);
    group.add(handle);
    
    // Handle mounts
    [-width * 0.11, width * 0.11].forEach(xOff => {
      const mountGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.015, 12);
      const mount = new THREE.Mesh(mountGeo, metalMat);
      mount.position.set(xOff, drawerY, depth / 2 + 0.04);
      applyShadows(mount);
      group.add(mount);
    });
  }
  
  // Legs with feet
  const legHeight = 0.06;
  const footHeight = 0.02;
  const legGeo = new THREE.CylinderGeometry(0.02, 0.022, legHeight, 12);
  const footGeo = new THREE.CylinderGeometry(0.024, 0.026, footHeight, 12);
  
  [[width / 2 - 0.05, depth / 2 - 0.05], [-width / 2 + 0.05, depth / 2 - 0.05],
   [width / 2 - 0.05, -depth / 2 + 0.05], [-width / 2 + 0.05, -depth / 2 + 0.05]].forEach(([x, z]) => {
    // Leg
    const leg = new THREE.Mesh(legGeo, darkWoodMat);
    leg.position.set(x, footHeight + legHeight / 2, z);
    applyShadows(leg);
    group.add(leg);
    
    // Foot
    const foot = new THREE.Mesh(footGeo, darkWoodMat);
    foot.position.set(x, footHeight / 2, z);
    applyShadows(foot);
    group.add(foot);
  });
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createNightstand.metadata = {
  category: 'furniture',
  name: 'Nightstand',
  description: 'Bedside table with drawers',
  dimensions: { width: 0.45, depth: 0.35, height: 0.5 },
  interactive: false
};

/**
 * Create a bookshelf asset
 */
function createBookshelf(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = spec.width || 0.8;
  const height = spec.height || 1.8;
  const depth = 0.3;
  const shelfCount = spec.shelves || 5;
  const filled = spec.filled === true; // Auto-fill with books/knickknacks
  
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.7 });
  const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.8 });
  
  // Back panel
  const backGeo = new THREE.BoxGeometry(width, height, 0.01);
  const back = new THREE.Mesh(backGeo, woodMat);
  back.position.set(0, height / 2, -depth / 2 + 0.005);
  applyShadows(back);
  group.add(back);
  
  // Sides (full height, flush with top and bottom)
  const sideGeo = new THREE.BoxGeometry(0.03, height, depth);
  [-width / 2 + 0.015, width / 2 - 0.015].forEach(x => {
    const side = new THREE.Mesh(sideGeo, darkWoodMat);
    side.position.set(x, height / 2, 0);
    applyShadows(side);
    group.add(side);
  });
  
  // Shelves with rounded front edge
  const shelfThickness = 0.025;
  
  for (let i = 0; i <= shelfCount; i++) {
    // Main shelf board (FLUSH with sides - full width)
    const shelfGeo = new THREE.BoxGeometry(width, shelfThickness, depth);
    const shelf = new THREE.Mesh(shelfGeo, woodMat);
    shelf.position.y = (i / shelfCount) * height;
    applyShadows(shelf);
    group.add(shelf);
    
    // Front edge trim (FIXED: simple box instead of torus to avoid spikes)
    const edgeTrimGeo = new THREE.BoxGeometry(width * 0.96, shelfThickness * 1.1, 0.008);
    const edgeTrim = new THREE.Mesh(edgeTrimGeo, darkWoodMat);
    edgeTrim.position.set(0, (i / shelfCount) * height, depth / 2 + 0.004);
    applyShadows(edgeTrim);
    group.add(edgeTrim);
  }
  
  // If filled, add books and knickknacks
  if (filled) {
    const bookColors = [0x8b0000, 0x00008b, 0x006400, 0x8b4513, 0x4b0082, 0x8b008b, 0x2f4f4f];
    const shelfHeight = height / shelfCount;
    
    for (let shelfIdx = 1; shelfIdx <= shelfCount; shelfIdx++) {
      const y = (shelfIdx / shelfCount) * height + shelfThickness;
      const shelfAvailableWidth = width - 0.08; // Leave margin from sides
      let currentX = -shelfAvailableWidth / 2;
      
      // Randomly place books and knickknacks
      const itemCount = Math.floor(Math.random() * 3) + 3; // 3-5 items per shelf
      
      for (let item = 0; item < itemCount; item++) {
        const isKnickknack = Math.random() < 0.2; // 20% chance of knickknack
        
        if (isKnickknack) {
          // Knickknack (small decorative object) - EXPANDED: DVDs, controllers, toys
          const knickType = Math.floor(Math.random() * 7); // Increased variety
          const knickSize = 0.04 + Math.random() * 0.03;
          
          if (knickType === 0) {
            // Vase
            const vaseGeo = new THREE.CylinderGeometry(knickSize * 0.4, knickSize * 0.5, knickSize * 2, 12);
            const vaseMat = new THREE.MeshStandardMaterial({ color: 0x8fbc8f, roughness: 0.4 });
            const vase = new THREE.Mesh(vaseGeo, vaseMat);
            vase.position.set(currentX + knickSize, y + knickSize, 0);
            group.add(vase);
          } else if (knickType === 1) {
            // Sphere/Ball
            const sphereGeo = new THREE.SphereGeometry(knickSize, 12, 12);
            const sphereMat = new THREE.MeshStandardMaterial({ color: 0xffa500, roughness: 0.6 });
            const sphere = new THREE.Mesh(sphereGeo, sphereMat);
            sphere.position.set(currentX + knickSize, y + knickSize, 0);
            group.add(sphere);
          } else if (knickType === 2) {
            // Picture frame (small)
            const frameGeo = new THREE.BoxGeometry(knickSize * 1.5, knickSize * 2, 0.01);
            const frameMat = new THREE.MeshStandardMaterial({ color: 0xdaa520, roughness: 0.6 });
            const frame = new THREE.Mesh(frameGeo, frameMat);
            frame.position.set(currentX + knickSize, y + knickSize, -depth / 2 + 0.02);
            group.add(frame);
          } else if (knickType === 3) {
            // DVD case
            const dvdGeo = new THREE.BoxGeometry(0.015, 0.135, 0.19);
            const dvdMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7 });
            const dvd = new THREE.Mesh(dvdGeo, dvdMat);
            dvd.position.set(currentX + 0.015, y + 0.068, 0);
            group.add(dvd);
          } else if (knickType === 4) {
            // Game Controller
            const controllerBody = new THREE.BoxGeometry(0.08, 0.015, 0.05);
            const controllerMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.6 });
            const controller = new THREE.Mesh(controllerBody, controllerMat);
            controller.position.set(currentX + 0.04, y + 0.01, 0);
            group.add(controller);
            // Buttons (simple dots)
            const buttonGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.002, 8);
            const buttonMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
            for (let btn = 0; btn < 4; btn++) {
              const button = new THREE.Mesh(buttonGeo, buttonMat);
              button.rotation.x = Math.PI / 2;
              button.position.set(currentX + 0.05 + (btn % 2) * 0.008, y + 0.02, (Math.floor(btn / 2) - 0.5) * 0.008);
              group.add(button);
            }
          } else if (knickType === 5) {
            // Toy Car
            const carBody = new THREE.BoxGeometry(0.04, 0.02, 0.025);
            const carMat = new THREE.MeshStandardMaterial({ color: 0xff4444, roughness: 0.5, metalness: 0.3 });
            const car = new THREE.Mesh(carBody, carMat);
            car.position.set(currentX + 0.02, y + 0.01, 0);
            group.add(car);
            // Wheels
            const wheelGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.004, 12);
            const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
            [[0.012, 0.012], [0.012, -0.012], [-0.012, 0.012], [-0.012, -0.012]].forEach(([x, z]) => {
              const wheel = new THREE.Mesh(wheelGeo, wheelMat);
              wheel.rotation.z = Math.PI / 2;
              wheel.position.set(currentX + 0.02 + x, y + 0.008, z);
              group.add(wheel);
            });
          } else {
            // Teddy Bear (simplified)
            const bearMat = new THREE.MeshStandardMaterial({ color: 0xa0826d, roughness: 0.9 });
            const bearBody = new THREE.SphereGeometry(knickSize * 0.6, 12, 12);
            const bear = new THREE.Mesh(bearBody, bearMat);
            bear.position.set(currentX + knickSize, y + knickSize * 0.8, 0);
            group.add(bear);
            // Head
            const headGeo = new THREE.SphereGeometry(knickSize * 0.4, 12, 12);
            const head = new THREE.Mesh(headGeo, bearMat);
            head.position.set(currentX + knickSize, y + knickSize * 1.3, 0);
            group.add(head);
          }
          
          currentX += knickSize * 3 + 0.02;
        } else {
          // Book cluster (2-4 books together)
          const booksInCluster = Math.floor(Math.random() * 3) + 2;
          
          for (let b = 0; b < booksInCluster; b++) {
            const bookWidth = 0.02 + Math.random() * 0.015;
            const bookHeight = shelfHeight * (0.6 + Math.random() * 0.3);
            const bookDepth = depth * (0.6 + Math.random() * 0.2);
            
            const bookGeo = new THREE.BoxGeometry(bookWidth, bookHeight, bookDepth);
            const bookMat = new THREE.MeshStandardMaterial({ 
              color: bookColors[Math.floor(Math.random() * bookColors.length)],
              roughness: 0.8
            });
            const book = new THREE.Mesh(bookGeo, bookMat);
            
            // Slight random tilt
            const tilt = (Math.random() - 0.5) * 0.15;
            book.rotation.z = tilt;
            
            book.position.set(
              currentX + bookWidth / 2,
              y + bookHeight / 2,
              -depth / 2 + bookDepth / 2 + 0.02
            );
            
            applyShadows(book);
            group.add(book);
            
            currentX += bookWidth + 0.002;
          }
          
          currentX += 0.03; // Gap between clusters
        }
        
        // Stop if we run out of space
        if (currentX > shelfAvailableWidth / 2) break;
      }
    }
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createBookshelf.metadata = {
  category: 'furniture',
  name: 'Bookshelf',
  description: 'Wooden bookshelf with adjustable shelves',
  dimensions: { width: 0.8, depth: 0.3, height: 1.8 },
  interactive: false
};

/**
 * Create a filled bookshelf with books and knickknacks
 */
function createBookshelfFilled(spec, THREE, context) {
  return createBookshelf({ ...spec, filled: true }, THREE, context);
}

createBookshelfFilled.metadata = {
  ...createBookshelf.metadata,
  name: 'Bookshelf (Filled)',
  description: 'Bookshelf populated with books and decorative items'
};

/**
 * Create coffee table with glass top material variant
 */
function createCoffeeTableGlass(spec, THREE, context) {
  return createCoffeeTable({ ...spec, material: 'glass' }, THREE, context);
}

createCoffeeTableGlass.metadata = {
  ...createCoffeeTable.metadata,
  name: 'Coffee Table (Glass)',
  description: 'Modern coffee table with glass top'
};

/**
 * Create coffee table with dark wood material variant
 */
function createCoffeeTableDarkWood(spec, THREE, context) {
  return createCoffeeTable({ ...spec, material: 'darkwood' }, THREE, context);
}

createCoffeeTableDarkWood.metadata = {
  ...createCoffeeTable.metadata,
  name: 'Coffee Table (Dark Wood)',
  description: 'Coffee table with dark wood finish'
};

/**
 * Create coffee table with light wood material variant
 */
function createCoffeeTableLightWood(spec, THREE, context) {
  return createCoffeeTable({ ...spec, material: 'lightwood' }, THREE, context);
}

createCoffeeTableLightWood.metadata = {
  ...createCoffeeTable.metadata,
  name: 'Coffee Table (Light Wood)',
  description: 'Coffee table with light wood finish'
};

// Export all creators
export const creators = {
  bed: createBed,
  couch: createCouch,
  desk: createDesk,
  coffeetable: createCoffeeTable,
  coffeetableglass: createCoffeeTableGlass,
  coffeetabledarkwood: createCoffeeTableDarkWood,
  coffeetablelightwood: createCoffeeTableLightWood,
  nightstand: createNightstand,
  sidetable: createNightstand,  // Alias
  bookshelf: createBookshelf,
  bookshelffilled: createBookshelfFilled
};

