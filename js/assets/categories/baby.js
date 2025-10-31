// ==================== BABY ROOM ASSET CREATORS ====================
// High-fidelity baby room furniture and accessories

import { createPositionedGroup, applyShadows } from '../asset-context.js';

/**
 * Create a baby crib with slatted sides
 */
function createCrib(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = 0.7;
  const length = 1.3;
  const height = 0.9;
  const railHeight = 0.5;
  
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xf5deb3, roughness: 0.7 });
  const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0xd2b48c, roughness: 0.75 });
  
  // Corner posts (4) with decorative finials
  const postPositions = [
    [width / 2, length / 2],
    [-width / 2, length / 2],
    [width / 2, -length / 2],
    [-width / 2, -length / 2]
  ];
  
  postPositions.forEach(([x, z]) => {
    // Main post
    const postGeo = new THREE.CylinderGeometry(0.03, 0.035, height, 12);
    const post = new THREE.Mesh(postGeo, darkWoodMat);
    post.position.set(x, height / 2, z);
    applyShadows(post);
    group.add(post);
    
    // Decorative finial (rounded top)
    const finialGeo = new THREE.SphereGeometry(0.04, 12, 12);
    const finial = new THREE.Mesh(finialGeo, darkWoodMat);
    finial.position.set(x, height + 0.02, z);
    applyShadows(finial);
    group.add(finial);
  });
  
  // Top rails (4 sides)
  const railGeo = new THREE.BoxGeometry(0.04, 0.04, width - 0.1);
  
  // Long side rails
  [-length / 2, length / 2].forEach(z => {
    const rail = new THREE.Mesh(railGeo, darkWoodMat);
    rail.rotation.y = Math.PI / 2;
    rail.position.set(0, railHeight, z);
    applyShadows(rail);
    group.add(rail);
  });
  
  // Short side rails
  const shortRailGeo = new THREE.BoxGeometry(0.04, 0.04, length - 0.1);
  [-width / 2, width / 2].forEach(x => {
    const rail = new THREE.Mesh(shortRailGeo, darkWoodMat);
    rail.position.set(x, railHeight, 0);
    applyShadows(rail);
    group.add(rail);
  });
  
  // Slatted sides (vertical bars, instanced for performance)
  const slatWidth = 0.015;
  const slatSpacing = 0.06; // Safe spacing for baby cribs
  const slatHeight = railHeight - 0.15;
  
  // Long sides
  const slatsPerLongSide = Math.floor((width - 0.12) / slatSpacing);
  const longSlatGeo = new THREE.CylinderGeometry(slatWidth / 2, slatWidth / 2, slatHeight, 8);
  const longSlatMesh = new THREE.InstancedMesh(longSlatGeo, woodMat, slatsPerLongSide * 2);
  
  let slatIndex = 0;
  [-length / 2, length / 2].forEach(z => {
    for (let i = 0; i < slatsPerLongSide; i++) {
      const x = -width / 2 + 0.06 + i * slatSpacing;
      const matrix = new THREE.Matrix4();
      matrix.makeTranslation(x, slatHeight / 2 + 0.1, z);
      longSlatMesh.setMatrixAt(slatIndex++, matrix);
    }
  });
  longSlatMesh.castShadow = true;
  longSlatMesh.receiveShadow = true;
  group.add(longSlatMesh);
  
  // Short sides
  const slatsPerShortSide = Math.floor((length - 0.12) / slatSpacing);
  const shortSlatGeo = new THREE.CylinderGeometry(slatWidth / 2, slatWidth / 2, slatHeight, 8);
  const shortSlatMesh = new THREE.InstancedMesh(shortSlatGeo, woodMat, slatsPerShortSide * 2);
  
  slatIndex = 0;
  [-width / 2, width / 2].forEach(x => {
    for (let i = 0; i < slatsPerShortSide; i++) {
      const z = -length / 2 + 0.06 + i * slatSpacing;
      const matrix = new THREE.Matrix4();
      matrix.makeTranslation(x, slatHeight / 2 + 0.1, z);
      shortSlatMesh.setMatrixAt(slatIndex++, matrix);
    }
  });
  shortSlatMesh.castShadow = true;
  shortSlatMesh.receiveShadow = true;
  group.add(shortSlatMesh);
  
  // Bottom support platform
  const baseHeight = 0.35;
  const baseGeo = new THREE.BoxGeometry(width - 0.08, 0.02, length - 0.08);
  const base = new THREE.Mesh(baseGeo, woodMat);
  base.position.y = baseHeight;
  applyShadows(base);
  group.add(base);
  
  // Support slats underneath mattress
  const supportSlatCount = 8;
  const supportSlatGeo = new THREE.BoxGeometry(0.02, 0.015, length - 0.1);
  for (let i = 0; i < supportSlatCount; i++) {
    const x = -width / 2 + 0.06 + (i / (supportSlatCount - 1)) * (width - 0.12);
    const slat = new THREE.Mesh(supportSlatGeo, woodMat);
    slat.position.set(x, baseHeight - 0.02, 0);
    group.add(slat);
  }
  
  // Mattress with rounded edges
  const mattressWidth = width - 0.12;
  const mattressLength = length - 0.12;
  const mattressHeight = 0.08;
  
  const mattressShape = new THREE.Shape();
  const cornerRadius = 0.03;
  const mw = mattressWidth / 2 - cornerRadius;
  const ml = mattressLength / 2 - cornerRadius;
  
  mattressShape.moveTo(-mw, -ml);
  mattressShape.lineTo(mw, -ml);
  mattressShape.quadraticCurveTo(mw + cornerRadius, -ml, mw + cornerRadius, -ml + cornerRadius);
  mattressShape.lineTo(mw + cornerRadius, ml);
  mattressShape.quadraticCurveTo(mw + cornerRadius, ml + cornerRadius, mw, ml + cornerRadius);
  mattressShape.lineTo(-mw, ml + cornerRadius);
  mattressShape.quadraticCurveTo(-mw - cornerRadius, ml + cornerRadius, -mw - cornerRadius, ml);
  mattressShape.lineTo(-mw - cornerRadius, -ml + cornerRadius);
  mattressShape.quadraticCurveTo(-mw - cornerRadius, -ml, -mw, -ml);
  
  const mattressGeo = new THREE.ExtrudeGeometry(mattressShape, { 
    depth: mattressHeight, 
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 8
  });
  const mattressMat = new THREE.MeshStandardMaterial({ color: 0xe0f0ff, roughness: 0.9 });
  const mattress = new THREE.Mesh(mattressGeo, mattressMat);
  mattress.rotation.x = -Math.PI / 2;
  mattress.position.y = baseHeight + 0.01;
  applyShadows(mattress);
  group.add(mattress);
  
  // Mobile hanger (optional decorative element)
  const mobileArmGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 12);
  const mobileArm = new THREE.Mesh(mobileArmGeo, darkWoodMat);
  mobileArm.position.set(0, height + 0.15, 0);
  applyShadows(mobileArm);
  group.add(mobileArm);
  
  // Cross bars for mobile
  const crossGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.4, 12);
  const cross1 = new THREE.Mesh(crossGeo, darkWoodMat);
  cross1.rotation.z = Math.PI / 2;
  cross1.position.set(0, height + 0.28, 0);
  group.add(cross1);
  
  const cross2 = new THREE.Mesh(crossGeo, darkWoodMat);
  cross2.rotation.x = Math.PI / 2;
  cross2.position.set(0, height + 0.28, 0);
  group.add(cross2);
  
  // Hanging toys (4 colorful shapes)
  const toyColors = [0xff6b9d, 0xffd93d, 0x6bcf7f, 0x6bb6ff];
  const toyPositions = [[0.15, 0], [-0.15, 0], [0, 0.15], [0, -0.15]];
  
  toyPositions.forEach(([x, z], i) => {
    // String
    const stringGeo = new THREE.CylinderGeometry(0.001, 0.001, 0.12, 6);
    const stringMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const string = new THREE.Mesh(stringGeo, stringMat);
    string.position.set(x, height + 0.22, z);
    group.add(string);
    
    // Toy (star shape approximated with sphere + deformation)
    const toyGeo = new THREE.SphereGeometry(0.03, 12, 12);
    const toyMat = new THREE.MeshStandardMaterial({ color: toyColors[i], roughness: 0.5 });
    const toy = new THREE.Mesh(toyGeo, toyMat);
    toy.scale.set(1, 0.7, 1); // Flatten slightly
    toy.position.set(x, height + 0.16, z);
    applyShadows(toy);
    group.add(toy);
  });
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createCrib.metadata = {
  category: 'baby',
  name: 'Baby Crib',
  description: 'Safe baby crib with slatted sides and hanging mobile',
  dimensions: { width: 0.7, length: 1.3, height: 0.9 },
  interactive: false
};

/**
 * Create a baby rattle toy
 */
function createRattle(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const handleLength = 0.12;
  const handleRadius = 0.012;
  const headRadius = 0.04;
  
  // Handle with textured grip
  const handleGeo = new THREE.CylinderGeometry(handleRadius, handleRadius * 0.9, handleLength, 16, 8);
  
  // Add grip ridges via vertex deformation
  const handlePositions = handleGeo.attributes.position;
  for (let i = 0; i < handlePositions.count; i++) {
    const y = handlePositions.getY(i);
    const angle = Math.atan2(handlePositions.getZ(i), handlePositions.getX(i));
    const ridge = Math.sin(y * 40) * 0.002; // Many small ridges
    const currentRadius = Math.sqrt(
      Math.pow(handlePositions.getX(i), 2) + 
      Math.pow(handlePositions.getZ(i), 2)
    );
    const newRadius = currentRadius + ridge;
    handlePositions.setX(i, Math.cos(angle) * newRadius);
    handlePositions.setZ(i, Math.sin(angle) * newRadius);
  }
  handleGeo.computeVertexNormals();
  
  const handleMat = new THREE.MeshStandardMaterial({ color: 0xffd93d, roughness: 0.7 });
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.position.y = handleLength / 2;
  applyShadows(handle);
  group.add(handle);
  
  // Bottom end cap (rounded)
  const bottomCapGeo = new THREE.SphereGeometry(handleRadius * 1.2, 12, 12);
  const bottomCap = new THREE.Mesh(bottomCapGeo, handleMat);
  bottomCap.position.y = 0.01;
  applyShadows(bottomCap);
  group.add(bottomCap);
  
  // Rattle head (sphere with colored rings)
  const headGeo = new THREE.SphereGeometry(headRadius, 16, 16);
  const headMat = new THREE.MeshStandardMaterial({ 
    color: 0xff6b9d, 
    transparent: true, 
    opacity: 0.8,
    roughness: 0.4 
  });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = handleLength + headRadius * 0.8;
  applyShadows(head);
  group.add(head);
  
  // Colored rings around sphere (3 rings)
  const ringColors = [0xff6b9d, 0x6bcf7f, 0x6bb6ff];
  for (let i = 0; i < 3; i++) {
    const ringGeo = new THREE.TorusGeometry(headRadius * 0.85, 0.006, 8, 24);
    const ringMat = new THREE.MeshStandardMaterial({ color: ringColors[i], roughness: 0.5 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = handleLength + headRadius * 0.8;
    ring.rotation.x = Math.PI / 2;
    ring.rotation.z = (i / 3) * Math.PI * 0.3; // Slight variation
    applyShadows(ring);
    group.add(ring);
  }
  
  // Internal beads (visible through transparent head, instanced)
  const beadCount = 8;
  const beadGeo = new THREE.SphereGeometry(0.006, 8, 8);
  const beadMesh = new THREE.InstancedMesh(beadGeo, new THREE.MeshStandardMaterial({ color: 0xffffff }), beadCount);
  
  for (let i = 0; i < beadCount; i++) {
    const angle = (i / beadCount) * Math.PI * 2;
    const radius = headRadius * 0.5;
    const matrix = new THREE.Matrix4();
    matrix.makeTranslation(
      Math.cos(angle) * radius,
      handleLength + headRadius * 0.8 + Math.sin(i * 1.5) * radius * 0.5,
      Math.sin(angle) * radius
    );
    beadMesh.setMatrixAt(i, matrix);
  }
  beadMesh.castShadow = true;
  group.add(beadMesh);
  
  // Connection piece between handle and head
  const neckGeo = new THREE.CylinderGeometry(handleRadius * 1.1, headRadius * 0.6, 0.02, 12);
  const neck = new THREE.Mesh(neckGeo, handleMat);
  neck.position.y = handleLength + 0.01;
  applyShadows(neck);
  group.add(neck);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createRattle.metadata = {
  category: 'baby',
  name: 'Baby Rattle',
  description: 'Colorful baby rattle with textured grip and beads',
  dimensions: { width: 0.08, height: 0.18, depth: 0.08 },
  interactive: false
};

/**
 * Create a changing station/table
 */
function createChangingStation(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = 0.9;
  const depth = 0.5;
  const height = 0.9;
  const surfaceHeight = 0.05;
  
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xf5deb3, roughness: 0.7 });
  const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0xd2b48c, roughness: 0.75 });
  const paddingMat = new THREE.MeshStandardMaterial({ color: 0xe8f4f8, roughness: 0.9 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.3, metalness: 0.8 });
  
  // Main cabinet body
  const cabinetGeo = new THREE.BoxGeometry(width, height - surfaceHeight, depth);
  const cabinet = new THREE.Mesh(cabinetGeo, woodMat);
  cabinet.position.y = (height - surfaceHeight) / 2;
  applyShadows(cabinet);
  group.add(cabinet);
  
  // Top surface (wood)
  const topGeo = new THREE.BoxGeometry(width + 0.02, surfaceHeight, depth + 0.02);
  const top = new THREE.Mesh(topGeo, darkWoodMat);
  top.position.y = height - surfaceHeight / 2;
  applyShadows(top);
  group.add(top);
  
  // Safety rails (3 sides - raised edges)
  const railHeight = 0.12;
  const railThickness = 0.03;
  
  // Back rail
  const backRailGeo = new THREE.BoxGeometry(width, railHeight, railThickness);
  const backRail = new THREE.Mesh(backRailGeo, darkWoodMat);
  backRail.position.set(0, height + railHeight / 2, -depth / 2 - railThickness / 2);
  applyShadows(backRail);
  group.add(backRail);
  
  // Side rails
  const sideRailGeo = new THREE.BoxGeometry(railThickness, railHeight, depth);
  [-width / 2 - railThickness / 2, width / 2 + railThickness / 2].forEach(x => {
    const rail = new THREE.Mesh(sideRailGeo, darkWoodMat);
    rail.position.set(x, height + railHeight / 2, 0);
    applyShadows(rail);
    group.add(rail);
  });
  
  // Padded changing surface (slightly concave)
  const padWidth = width * 0.9;
  const padDepth = depth * 0.9;
  const padGeo = new THREE.BoxGeometry(padWidth, 0.04, padDepth, 16, 1, 16);
  
  // Create slight concave shape for safety
  const padPositions = padGeo.attributes.position;
  for (let i = 0; i < padPositions.count; i++) {
    const x = padPositions.getX(i);
    const z = padPositions.getZ(i);
    const y = padPositions.getY(i);
    
    if (y > 0) { // Top surface
      const nx = x / (padWidth / 2);
      const nz = z / (padDepth / 2);
      const distFromCenter = Math.sqrt(nx * nx + nz * nz);
      const concave = Math.pow(distFromCenter, 2) * -0.012; // Subtle dip
      padPositions.setY(i, y + concave);
    }
  }
  padGeo.computeVertexNormals();
  
  const pad = new THREE.Mesh(padGeo, paddingMat);
  pad.position.y = height + 0.02;
  applyShadows(pad);
  group.add(pad);
  
  // Drawers (3 drawers)
  const drawerHeight = (height - surfaceHeight - 0.15) / 3;
  const drawerWidth = width * 0.9;
  
  for (let i = 0; i < 3; i++) {
    const drawerFrontGeo = new THREE.BoxGeometry(drawerWidth, drawerHeight * 0.9, 0.02);
    const drawerFront = new THREE.Mesh(drawerFrontGeo, darkWoodMat);
    const drawerY = 0.1 + drawerHeight * 0.5 + i * drawerHeight;
    drawerFront.position.set(0, drawerY, depth / 2 + 0.01);
    applyShadows(drawerFront);
    group.add(drawerFront);
    
    // Drawer handles (2 knobs per drawer)
    [-0.15, 0.15].forEach(xOff => {
      const knobGeo = new THREE.CylinderGeometry(0.015, 0.012, 0.025, 12);
      const knob = new THREE.Mesh(knobGeo, metalMat);
      knob.rotation.x = Math.PI / 2;
      knob.position.set(xOff, drawerY, depth / 2 + 0.025);
      applyShadows(knob);
      group.add(knob);
    });
  }
  
  // Side storage caddy (small organizer)
  const caddyWidth = 0.2;
  const caddyDepth = 0.15;
  const caddyHeight = 0.15;
  
  const caddyGeo = new THREE.BoxGeometry(caddyWidth, caddyHeight, caddyDepth);
  const caddy = new THREE.Mesh(caddyGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }));
  caddy.position.set(width / 2 + caddyWidth / 2 + 0.05, height + caddyHeight / 2, -depth / 4);
  applyShadows(caddy);
  group.add(caddy);
  
  // Dividers in caddy
  const dividerGeo = new THREE.BoxGeometry(0.01, caddyHeight * 0.8, caddyDepth * 0.9);
  [-caddyWidth / 4, caddyWidth / 4].forEach(xOff => {
    const divider = new THREE.Mesh(dividerGeo, new THREE.MeshStandardMaterial({ color: 0xf0f0f0 }));
    divider.position.set(width / 2 + caddyWidth / 2 + 0.05 + xOff, height + caddyHeight / 2, -depth / 4);
    group.add(divider);
  });
  
  // Safety strap holders (2 on surface)
  [-padWidth / 4, padWidth / 4].forEach(xOff => {
    const strapGeo = new THREE.BoxGeometry(0.04, 0.01, 0.02);
    const strap = new THREE.Mesh(strapGeo, metalMat);
    strap.position.set(xOff, height + 0.04, 0);
    applyShadows(strap);
    group.add(strap);
    
    // Buckle
    const buckleGeo = new THREE.TorusGeometry(0.015, 0.003, 8, 16);
    const buckle = new THREE.Mesh(buckleGeo, metalMat);
    buckle.rotation.x = Math.PI / 2;
    buckle.position.set(xOff, height + 0.05, 0);
    group.add(buckle);
  });
  
  // Legs (4 corners)
  const legGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.08, 12);
  [[width / 2 - 0.05, depth / 2 - 0.05], 
   [-width / 2 + 0.05, depth / 2 - 0.05],
   [width / 2 - 0.05, -depth / 2 + 0.05], 
   [-width / 2 + 0.05, -depth / 2 + 0.05]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(legGeo, darkWoodMat);
    leg.position.set(x, 0.04, z);
    applyShadows(leg);
    group.add(leg);
  });
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createChangingStation.metadata = {
  category: 'baby',
  name: 'Changing Station',
  description: 'Baby changing table with safety rails, drawers, and storage',
  dimensions: { width: 0.9, depth: 0.5, height: 0.9 },
  interactive: false
};

/**
 * Create an abacus toy
 */
function createAbacus(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = 0.25;
  const height = 0.3;
  const depth = 0.08;
  const rows = 10;
  const beadsPerRow = 10;
  
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.7 });
  const beadColors = [0xff6b9d, 0xffd93d, 0x6bcf7f, 0x6bb6ff, 0xff9d6b, 0x9d6bff, 0xff6b6b, 0x6bffd9, 0xd96bff, 0x6bff9d];
  
  // Frame (4 sides)
  const frameThickness = 0.02;
  
  // Top and bottom
  [height, 0].forEach(y => {
    const frameGeo = new THREE.BoxGeometry(width, frameThickness, depth);
    const frame = new THREE.Mesh(frameGeo, woodMat);
    frame.position.y = y;
    applyShadows(frame);
    group.add(frame);
  });
  
  // Left and right sides
  [-width / 2 + frameThickness / 2, width / 2 - frameThickness / 2].forEach(x => {
    const frameGeo = new THREE.BoxGeometry(frameThickness, height, depth);
    const frame = new THREE.Mesh(frameGeo, woodMat);
    frame.position.set(x, height / 2, 0);
    applyShadows(frame);
    group.add(frame);
  });
  
  // Rods with beads (instanced for performance)
  for (let row = 0; row < rows; row++) {
    const rowY = (row + 0.5) / rows * (height - frameThickness * 2) + frameThickness;
    
    // Rod
    const rodGeo = new THREE.CylinderGeometry(0.003, 0.003, width - frameThickness * 2, 8);
    const rod = new THREE.Mesh(rodGeo, woodMat);
    rod.rotation.z = Math.PI / 2;
    rod.position.y = rowY;
    group.add(rod);
    
    // Beads (instanced)
    const beadGeo = new THREE.SphereGeometry(0.012, 12, 12);
    const beadMat = new THREE.MeshStandardMaterial({ 
      color: beadColors[row % beadColors.length], 
      roughness: 0.5,
      metalness: 0.1
    });
    const beadMesh = new THREE.InstancedMesh(beadGeo, beadMat, beadsPerRow);
    
    const beadSpacing = (width - frameThickness * 2 - 0.05) / (beadsPerRow - 1);
    for (let i = 0; i < beadsPerRow; i++) {
      const matrix = new THREE.Matrix4();
      const x = -width / 2 + frameThickness + 0.025 + i * beadSpacing;
      matrix.makeTranslation(x, rowY, 0);
      beadMesh.setMatrixAt(i, matrix);
    }
    beadMesh.castShadow = true;
    beadMesh.receiveShadow = true;
    group.add(beadMesh);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createAbacus.metadata = {
  category: 'baby',
  name: 'Abacus',
  description: 'Colorful counting toy with beads',
  dimensions: { width: 0.25, height: 0.3, depth: 0.08 },
  interactive: false
};

/**
 * Create a kids coloring table (rainbow colored)
 */
function createColoringTable(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = 0.6;
  const depth = 0.6;
  const height = 0.45;
  
  const rainbowColors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3];
  
  // Tabletop (rainbow gradient)
  const topGeo = new THREE.BoxGeometry(width, 0.04, depth);
  
  // Create rainbow gradient texture
  function createRainbowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Rainbow gradient
    const gradient = ctx.createLinearGradient(0, 0, 512, 0);
    rainbowColors.forEach((color, i) => {
      const r = (color >> 16) & 0xff;
      const g = (color >> 8) & 0xff;
      const b = color & 0xff;
      gradient.addColorStop(i / (rainbowColors.length - 1), `rgb(${r},${g},${b})`);
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    return new THREE.CanvasTexture(canvas);
  }
  
  const rainbowTexture = createRainbowTexture();
  const topMat = new THREE.MeshStandardMaterial({ map: rainbowTexture, roughness: 0.6 });
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.y = height;
  applyShadows(top);
  group.add(top);
  
  // Legs (each a different rainbow color)
  const legGeo = new THREE.CylinderGeometry(0.03, 0.035, height, 12);
  const legPositions = [
    [width / 2 - 0.08, depth / 2 - 0.08],
    [-width / 2 + 0.08, depth / 2 - 0.08],
    [width / 2 - 0.08, -depth / 2 + 0.08],
    [-width / 2 + 0.08, -depth / 2 + 0.08]
  ];
  
  legPositions.forEach(([x, z], i) => {
    const legMat = new THREE.MeshStandardMaterial({ 
      color: rainbowColors[i * 2 % rainbowColors.length], 
      roughness: 0.7 
    });
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(x, height / 2, z);
    applyShadows(leg);
    group.add(leg);
    
    // Foot pad
    const footGeo = new THREE.CylinderGeometry(0.04, 0.045, 0.02, 12);
    const foot = new THREE.Mesh(footGeo, legMat);
    foot.position.set(x, 0.01, z);
    applyShadows(foot);
    group.add(foot);
  });
  
  // Paper roll holder (side mounted)
  const rollerGeo = new THREE.CylinderGeometry(0.02, 0.02, width * 0.8, 12);
  const rollerMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
  const roller = new THREE.Mesh(rollerGeo, rollerMat);
  roller.rotation.z = Math.PI / 2;
  roller.position.set(0, height * 0.7, -depth / 2 - 0.05);
  applyShadows(roller);
  group.add(roller);
  
  // Crayon holders (4 cups around edges)
  const cupPositions = [
    [width / 2 - 0.1, depth / 2 - 0.1],
    [-width / 2 + 0.1, depth / 2 - 0.1],
    [width / 2 - 0.1, -depth / 2 + 0.1],
    [-width / 2 + 0.1, -depth / 2 + 0.1]
  ];
  
  cupPositions.forEach(([x, z], i) => {
    const cupGeo = new THREE.CylinderGeometry(0.03, 0.025, 0.06, 12);
    const cupMat = new THREE.MeshStandardMaterial({ 
      color: rainbowColors[(i + 1) * 2 % rainbowColors.length],
      roughness: 0.5
    });
    const cup = new THREE.Mesh(cupGeo, cupMat);
    cup.position.set(x, height + 0.05, z);
    applyShadows(cup);
    group.add(cup);
    
    // Crayons in cup (simplified)
    for (let c = 0; c < 3; c++) {
      const crayonGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.08, 8);
      const crayonMat = new THREE.MeshStandardMaterial({ 
        color: rainbowColors[(c + i) % rainbowColors.length],
        roughness: 0.8
      });
      const crayon = new THREE.Mesh(crayonGeo, crayonMat);
      const angle = (c / 3) * Math.PI * 2;
      crayon.position.set(
        x + Math.cos(angle) * 0.015,
        height + 0.08,
        z + Math.sin(angle) * 0.015
      );
      crayon.rotation.x = Math.PI / 12;
      group.add(crayon);
    }
  });
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createColoringTable.metadata = {
  category: 'baby',
  name: 'Coloring Table',
  description: 'Rainbow-colored kids activity table with crayon holders',
  dimensions: { width: 0.6, depth: 0.6, height: 0.45 },
  interactive: false
};

/**
 * Create foam puzzle mat
 */
function createFoamPuzzleMat(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const tiles = spec.tiles || 9; // 3x3 default
  const tilesPerSide = Math.sqrt(tiles);
  const tileSize = 0.3;
  const thickness = 0.02;
  
  const foamColors = [0xff6b9d, 0xffd93d, 0x6bcf7f, 0x6bb6ff, 0xff9d6b, 
                      0x9d6bff, 0xff6b6b, 0x6bffd9, 0xd96bff];
  
  const foamMat = new THREE.MeshStandardMaterial({ roughness: 0.9 });
  
  for (let row = 0; row < tilesPerSide; row++) {
    for (let col = 0; col < tilesPerSide; col++) {
      const colorIndex = (row * tilesPerSide + col) % foamColors.length;
      
      // Tile body
      const tileGeo = new THREE.BoxGeometry(tileSize * 0.98, thickness, tileSize * 0.98);
      const tileMat = foamMat.clone();
      tileMat.color.setHex(foamColors[colorIndex]);
      
      const tile = new THREE.Mesh(tileGeo, tileMat);
      tile.position.set(
        (col - tilesPerSide / 2 + 0.5) * tileSize,
        thickness / 2,
        (row - tilesPerSide / 2 + 0.5) * tileSize
      );
      applyShadows(tile);
      group.add(tile);
      
      // Interlocking tabs (simplified as small protrusions)
      const tabSize = 0.03;
      const tabGeo = new THREE.BoxGeometry(tabSize, thickness * 0.8, tabSize * 0.5);
      
      // Right tab (if not last column)
      if (col < tilesPerSide - 1) {
        const rightTab = new THREE.Mesh(tabGeo, tileMat);
        rightTab.position.set(
          (col - tilesPerSide / 2 + 1) * tileSize - tabSize / 2,
          thickness / 2,
          (row - tilesPerSide / 2 + 0.5) * tileSize
        );
        group.add(rightTab);
      }
      
      // Bottom tab (if not last row)
      if (row < tilesPerSide - 1) {
        const bottomTabGeo = new THREE.BoxGeometry(tabSize * 0.5, thickness * 0.8, tabSize);
        const bottomTab = new THREE.Mesh(bottomTabGeo, tileMat);
        bottomTab.position.set(
          (col - tilesPerSide / 2 + 0.5) * tileSize,
          thickness / 2,
          (row - tilesPerSide / 2 + 1) * tileSize - tabSize / 2
        );
        group.add(bottomTab);
      }
      
      // Texture pattern (embossed shapes)
      const shapes = ['circle', 'star', 'heart', 'square'];
      const shapeType = shapes[colorIndex % shapes.length];
      
      if (shapeType === 'circle') {
        const circleGeo = new THREE.CircleGeometry(tileSize * 0.15, 24);
        const circleMat = new THREE.MeshStandardMaterial({ 
          color: foamColors[(colorIndex + 3) % foamColors.length],
          roughness: 0.9
        });
        const circle = new THREE.Mesh(circleGeo, circleMat);
        circle.rotation.x = -Math.PI / 2;
        circle.position.set(
          (col - tilesPerSide / 2 + 0.5) * tileSize,
          thickness + 0.001,
          (row - tilesPerSide / 2 + 0.5) * tileSize
        );
        group.add(circle);
      }
    }
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createFoamPuzzleMat.metadata = {
  category: 'baby',
  name: 'Foam Puzzle Mat',
  description: 'Interlocking foam floor tiles for kids play area',
  dimensions: { width: 0.9, depth: 0.9, height: 0.02 },
  interactive: false
};

// Export all baby room creators
export const creators = {
  crib: createCrib,
  babycrib: createCrib,
  rattle: createRattle,
  babyrattle: createRattle,
  changingstation: createChangingStation,
  changingtable: createChangingStation,
  abacus: createAbacus,
  coloringtable: createColoringTable,
  activitytable: createColoringTable,
  foampuzzlemat: createFoamPuzzleMat,
  playmat: createFoamPuzzleMat
};

