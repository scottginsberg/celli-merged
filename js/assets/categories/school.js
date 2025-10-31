// ==================== SCHOOL & GYMNASIUM ASSET CREATORS ====================
// School furniture and gymnasium equipment

import { createPositionedGroup, applyShadows } from '../asset-context.js';

/**
 * Create a teacher's desk
 */
function createTeacherDesk(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = 1.4;
  const depth = 0.7;
  const height = 0.75;
  
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.7 });
  const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.75 });
  const handleMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.3, metalness: 0.8 });
  
  // Desktop with beveled edge
  const desktopGeo = new THREE.BoxGeometry(width, 0.05, depth);
  const desktop = new THREE.Mesh(desktopGeo, woodMat);
  desktop.position.y = height;
  applyShadows(desktop);
  group.add(desktop);
  
  // Beveled edge (torus around desktop)
  const bevelThickness = 0.015;
  const bevelFrames = [
    new THREE.BoxGeometry(width, bevelThickness, bevelThickness),
    new THREE.BoxGeometry(width, bevelThickness, bevelThickness),
    new THREE.BoxGeometry(bevelThickness, bevelThickness, depth),
    new THREE.BoxGeometry(bevelThickness, bevelThickness, depth)
  ];
  const positions = [
    [0, height + 0.025, depth / 2],
    [0, height + 0.025, -depth / 2],
    [-width / 2, height + 0.025, 0],
    [width / 2, height + 0.025, 0]
  ];
  
  bevelFrames.forEach((geo, i) => {
    const bevel = new THREE.Mesh(geo, darkWoodMat);
    bevel.position.set(...positions[i]);
    group.add(bevel);
  });
  
  // Pedestals (2 sets of drawers on left and right)
  const pedestalWidth = 0.35;
  const pedestalDepth = depth - 0.1;
  const pedestalHeight = height - 0.1;
  
  [-1, 1].forEach(side => {
    const pedestalGeo = new THREE.BoxGeometry(pedestalWidth, pedestalHeight, pedestalDepth);
    const pedestal = new THREE.Mesh(pedestalGeo, woodMat);
    pedestal.position.set(side * (width / 2 - pedestalWidth / 2 - 0.05), pedestalHeight / 2 + 0.05, 0);
    applyShadows(pedestal);
    group.add(pedestal);
    
    // Drawers (3 per pedestal)
    for (let i = 0; i < 3; i++) {
      const drawerHeight = (pedestalHeight - 0.12) / 3;
      const drawerGeo = new THREE.BoxGeometry(pedestalWidth * 0.9, drawerHeight * 0.85, 0.02);
      const drawer = new THREE.Mesh(drawerGeo, darkWoodMat);
      drawer.position.set(
        side * (width / 2 - pedestalWidth / 2 - 0.05),
        0.08 + drawerHeight / 2 + i * (pedestalHeight / 3),
        pedestalDepth / 2 + 0.015
      );
      applyShadows(drawer);
      group.add(drawer);
      
      // Drawer handle
      const handleGeo = new THREE.CylinderGeometry(0.008, 0.008, pedestalWidth * 0.5, 12);
      const handle = new THREE.Mesh(handleGeo, handleMat);
      handle.rotation.z = Math.PI / 2;
      handle.position.set(
        side * (width / 2 - pedestalWidth / 2 - 0.05),
        0.08 + drawerHeight / 2 + i * (pedestalHeight / 3),
        pedestalDepth / 2 + 0.03
      );
      applyShadows(handle);
      group.add(handle);
      
      // Handle mounts
      [-pedestalWidth * 0.22, pedestalWidth * 0.22].forEach(xOff => {
        const mountGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.02, 12);
        const mount = new THREE.Mesh(mountGeo, handleMat);
        mount.rotation.x = Math.PI / 2;
        mount.position.set(
          side * (width / 2 - pedestalWidth / 2 - 0.05) + xOff,
          0.08 + drawerHeight / 2 + i * (pedestalHeight / 3),
          pedestalDepth / 2 + 0.03
        );
        group.add(mount);
      });
    }
  });
  
  // Center modesty panel
  const panelGeo = new THREE.BoxGeometry(width - pedestalWidth * 2 - 0.2, height - 0.15, 0.02);
  const panel = new THREE.Mesh(panelGeo, woodMat);
  panel.position.set(0, (height - 0.15) / 2 + 0.05, -pedestalDepth / 2 - 0.01);
  applyShadows(panel);
  group.add(panel);
  
  // Pencil tray on desktop
  const trayGeo = new THREE.BoxGeometry(0.3, 0.03, 0.08);
  const tray = new THREE.Mesh(trayGeo, darkWoodMat);
  tray.position.set(width / 3, height + 0.04, depth / 4);
  applyShadows(tray);
  group.add(tray);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createTeacherDesk.metadata = {
  category: 'school',
  name: 'Teacher\'s Desk',
  description: 'Large wooden desk with drawers and pencil tray',
  dimensions: { width: 1.4, depth: 0.7, height: 0.75 },
  interactive: false
};

/**
 * Create a teacher's chair (office style)
 */
function createTeacherChair(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const seatRadius = 0.25;
  const seatHeight = 0.45;
  const backHeight = 0.4;
  
  const fabricMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.8 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd0d0d0, roughness: 0.2, metalness: 0.9 });
  const plasticMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6 });
  
  // Base star (5-spoke)
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const spokeGeo = new THREE.BoxGeometry(0.08, 0.03, 0.4);
    const spoke = new THREE.Mesh(spokeGeo, plasticMat);
    spoke.position.set(Math.cos(angle) * 0.15, 0.015, Math.sin(angle) * 0.15);
    spoke.rotation.y = angle;
    applyShadows(spoke);
    group.add(spoke);
    
    // Caster wheel at end
    const wheelGeo = new THREE.SphereGeometry(0.025, 12, 12);
    const wheel = new THREE.Mesh(wheelGeo, plasticMat);
    wheel.position.set(Math.cos(angle) * 0.3, 0.025, Math.sin(angle) * 0.3);
    applyShadows(wheel);
    group.add(wheel);
  }
  
  // Center hub
  const hubGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.05, 16);
  const hub = new THREE.Mesh(hubGeo, plasticMat);
  hub.position.y = 0.025;
  applyShadows(hub);
  group.add(hub);
  
  // Gas lift cylinder
  const cylinderGeo = new THREE.CylinderGeometry(0.03, 0.03, seatHeight - 0.15, 12);
  const cylinder = new THREE.Mesh(cylinderGeo, chromeMat);
  cylinder.position.y = (seatHeight - 0.15) / 2 + 0.05;
  applyShadows(cylinder);
  group.add(cylinder);
  
  // Seat mechanism
  const mechanismGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.08, 16);
  const mechanism = new THREE.Mesh(mechanismGeo, plasticMat);
  mechanism.position.y = seatHeight - 0.04;
  applyShadows(mechanism);
  group.add(mechanism);
  
  // Seat cushion
  const seatGeo = new THREE.CylinderGeometry(seatRadius, seatRadius, 0.08, 32);
  const seat = new THREE.Mesh(seatGeo, fabricMat);
  seat.position.y = seatHeight + 0.04;
  applyShadows(seat);
  group.add(seat);
  
  // Slight seat curve (deformation)
  const seatPositions = seatGeo.attributes.position;
  for (let i = 0; i < seatPositions.count; i++) {
    const y = seatPositions.getY(i);
    const x = seatPositions.getX(i);
    const z = seatPositions.getZ(i);
    const dist = Math.sqrt(x * x + z * z) / seatRadius;
    if (y > 0 && dist < 0.8) {
      const dip = (1 - dist) * 0.02;
      seatPositions.setY(i, y - dip);
    }
  }
  seatGeo.computeVertexNormals();
  
  // Backrest frame
  const backFrameGeo = new THREE.BoxGeometry(seatRadius * 1.8, backHeight, 0.05);
  const backFrame = new THREE.Mesh(backFrameGeo, plasticMat);
  backFrame.position.set(0, seatHeight + backHeight / 2, -seatRadius + 0.05);
  applyShadows(backFrame);
  group.add(backFrame);
  
  // Backrest cushion
  const backCushionGeo = new THREE.BoxGeometry(seatRadius * 1.6, backHeight * 0.9, 0.08);
  const backCushion = new THREE.Mesh(backCushionGeo, fabricMat);
  backCushion.position.set(0, seatHeight + backHeight / 2, -seatRadius + 0.09);
  applyShadows(backCushion);
  group.add(backCushion);
  
  // Lumbar support bulge
  const lumbarGeo = new THREE.SphereGeometry(0.08, 16, 16);
  const lumbar = new THREE.Mesh(lumbarGeo, fabricMat);
  lumbar.scale.set(1.5, 0.8, 0.4);
  lumbar.position.set(0, seatHeight + backHeight * 0.3, -seatRadius + 0.13);
  group.add(lumbar);
  
  // Armrests
  [-1, 1].forEach(side => {
    // Armrest post
    const postGeo = new THREE.CylinderGeometry(0.02, 0.02, backHeight * 0.5, 12);
    const post = new THREE.Mesh(postGeo, chromeMat);
    post.position.set(side * seatRadius * 0.9, seatHeight + backHeight * 0.25, -seatRadius * 0.3);
    applyShadows(post);
    group.add(post);
    
    // Armrest pad
    const padGeo = new THREE.BoxGeometry(0.06, 0.04, 0.25);
    const pad = new THREE.Mesh(padGeo, plasticMat);
    pad.position.set(side * seatRadius * 0.9, seatHeight + backHeight * 0.5, -seatRadius * 0.3);
    applyShadows(pad);
    group.add(pad);
  });
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createTeacherChair.metadata = {
  category: 'school',
  name: 'Teacher\'s Chair',
  description: 'Office chair with armrests and adjustable height',
  dimensions: { width: 0.6, depth: 0.6, height: 0.95 },
  interactive: false
};

/**
 * Create a student desk
 */
function createStudentDesk(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const deskWidth = 0.6;
  const deskDepth = 0.45;
  const deskHeight = 0.7;
  
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.4, metalness: 0.7 });
  const laminateMat = new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.5 });
  
  // Desktop
  const desktopGeo = new THREE.BoxGeometry(deskWidth, 0.03, deskDepth);
  const desktop = new THREE.Mesh(desktopGeo, laminateMat);
  desktop.position.y = deskHeight;
  applyShadows(desktop);
  group.add(desktop);
  
  // Desktop lip (slight raise on edges)
  const lipThickness = 0.01;
  const lipFrames = [
    [deskWidth, lipThickness, lipThickness, [0, deskHeight + 0.015, deskDepth / 2]],
    [deskWidth, lipThickness, lipThickness, [0, deskHeight + 0.015, -deskDepth / 2]],
    [lipThickness, lipThickness, deskDepth, [-deskWidth / 2, deskHeight + 0.015, 0]],
    [lipThickness, lipThickness, deskDepth, [deskWidth / 2, deskHeight + 0.015, 0]]
  ];
  
  lipFrames.forEach(([w, h, d, pos]) => {
    const lipGeo = new THREE.BoxGeometry(w, h, d);
    const lip = new THREE.Mesh(lipGeo, laminateMat);
    lip.position.set(...pos);
    group.add(lip);
  });
  
  // Metal frame legs
  const tubeRadius = 0.015;
  
  // Front legs (slightly angled)
  [-1, 1].forEach(side => {
    const frontLegGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius, deskHeight, 12);
    const frontLeg = new THREE.Mesh(frontLegGeo, metalMat);
    frontLeg.position.set(side * (deskWidth / 2 - 0.05), deskHeight / 2, deskDepth / 2 - 0.05);
    frontLeg.rotation.x = -0.05;
    applyShadows(frontLeg);
    group.add(frontLeg);
  });
  
  // Back legs (straight)
  [-1, 1].forEach(side => {
    const backLegGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius, deskHeight, 12);
    const backLeg = new THREE.Mesh(backLegGeo, metalMat);
    backLeg.position.set(side * (deskWidth / 2 - 0.05), deskHeight / 2, -deskDepth / 2 + 0.05);
    applyShadows(backLeg);
    group.add(backLeg);
  });
  
  // Cross bars
  const frontBarGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius, deskWidth - 0.1, 12);
  const frontBar = new THREE.Mesh(frontBarGeo, metalMat);
  frontBar.rotation.z = Math.PI / 2;
  frontBar.position.set(0, deskHeight * 0.3, deskDepth / 2 - 0.05);
  applyShadows(frontBar);
  group.add(frontBar);
  
  const backBar = frontBar.clone();
  backBar.position.z = -deskDepth / 2 + 0.05;
  applyShadows(backBar);
  group.add(backBar);
  
  // Book basket (wire mesh under desk)
  const basketDepth = deskDepth * 0.8;
  const basketHeight = 0.12;
  
  // Basket frame
  const basketFrameGeo = new THREE.BoxGeometry(deskWidth - 0.15, 0.01, basketDepth);
  const basketFrame = new THREE.Mesh(basketFrameGeo, metalMat);
  basketFrame.position.set(0, deskHeight - 0.2, 0);
  applyShadows(basketFrame);
  group.add(basketFrame);
  
  // Basket wires (simplified as bars)
  for (let i = 0; i < 8; i++) {
    const wireGeo = new THREE.CylinderGeometry(0.003, 0.003, basketDepth, 6);
    const wire = new THREE.Mesh(wireGeo, metalMat);
    wire.rotation.x = Math.PI / 2;
    wire.position.set(-deskWidth / 2 + 0.1 + i * 0.06, deskHeight - 0.2, 0);
    group.add(wire);
  }
  
  // Pencil groove on desktop
  const grooveGeo = new THREE.CylinderGeometry(0.01, 0.01, deskWidth * 0.8, 12);
  const groove = new THREE.Mesh(grooveGeo, new THREE.MeshStandardMaterial({ color: 0xb8956a, roughness: 0.6 }));
  groove.rotation.z = Math.PI / 2;
  groove.position.set(0, deskHeight + 0.016, deskDepth / 2 - 0.06);
  group.add(groove);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createStudentDesk.metadata = {
  category: 'school',
  name: 'Student Desk',
  description: 'Metal frame desk with laminate top and book basket',
  dimensions: { width: 0.6, depth: 0.45, height: 0.7 },
  interactive: false
};

/**
 * Create a student chair
 */
function createStudentChair(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const seatHeight = 0.45;
  const seatWidth = 0.4;
  const seatDepth = 0.38;
  const backHeight = 0.35;
  
  const plasticMat = new THREE.MeshStandardMaterial({ color: spec.color || 0x4a90e2, roughness: 0.6 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.4, metalness: 0.7 });
  
  // Seat (contoured plastic)
  const seatGeo = new THREE.BoxGeometry(seatWidth, 0.05, seatDepth, 16, 1, 16);
  const seatPositions = seatGeo.attributes.position;
  
  // Add contour to seat
  for (let i = 0; i < seatPositions.count; i++) {
    const x = seatPositions.getX(i);
    const z = seatPositions.getZ(i);
    const y = seatPositions.getY(i);
    
    const nx = x / (seatWidth / 2);
    const nz = z / (seatDepth / 2);
    const dist = Math.sqrt(nx * nx + nz * nz);
    
    if (y > 0 && dist < 0.9) {
      const dip = (1 - dist) * 0.025;
      seatPositions.setY(i, y - dip);
    }
  }
  seatGeo.computeVertexNormals();
  
  const seat = new THREE.Mesh(seatGeo, plasticMat);
  seat.position.y = seatHeight;
  applyShadows(seat);
  group.add(seat);
  
  // Backrest (curved plastic)
  const backGeo = new THREE.BoxGeometry(seatWidth, backHeight, 0.05, 16, 16, 1);
  const backPositions = backGeo.attributes.position;
  
  // Add ergonomic curve to back
  for (let i = 0; i < backPositions.count; i++) {
    const y = backPositions.getY(i);
    const z = backPositions.getZ(i);
    const ny = y / (backHeight / 2);
    
    if (z > 0) {
      const curve = Math.pow(ny, 2) * 0.05;
      backPositions.setZ(i, z + curve);
    }
  }
  backGeo.computeVertexNormals();
  
  const backrest = new THREE.Mesh(backGeo, plasticMat);
  backrest.position.set(0, seatHeight + backHeight / 2, -seatDepth / 2 + 0.05);
  applyShadows(backrest);
  group.add(backrest);
  
  // Metal frame legs
  const tubeRadius = 0.012;
  
  // Continuous frame (front legs -> seat supports -> back legs)
  const framePoints = [
    // Left side
    new THREE.Vector3(-seatWidth / 2 + 0.05, 0, seatDepth / 2 - 0.05), // Front left floor
    new THREE.Vector3(-seatWidth / 2 + 0.05, seatHeight, seatDepth / 2 - 0.05), // Front left seat
    new THREE.Vector3(-seatWidth / 2 + 0.05, seatHeight, -seatDepth / 2 + 0.05), // Back left seat
    new THREE.Vector3(-seatWidth / 2 + 0.05, 0, -seatDepth / 2 + 0.15) // Back left floor (angled)
  ];
  
  // Create tubular frame
  [-1, 1].forEach(side => {
    // Front leg
    const frontLegGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius, seatHeight, 12);
    const frontLeg = new THREE.Mesh(frontLegGeo, metalMat);
    frontLeg.position.set(side * (seatWidth / 2 - 0.05), seatHeight / 2, seatDepth / 2 - 0.05);
    applyShadows(frontLeg);
    group.add(frontLeg);
    
    // Back leg (angled)
    const backLegGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius, seatHeight + 0.15, 12);
    const backLeg = new THREE.Mesh(backLegGeo, metalMat);
    backLeg.position.set(side * (seatWidth / 2 - 0.05), (seatHeight + 0.15) / 2, -seatDepth / 2 + 0.1);
    backLeg.rotation.x = -0.15;
    applyShadows(backLeg);
    group.add(backLeg);
    
    // Seat support tube
    const supportGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius, seatDepth - 0.1, 12);
    const support = new THREE.Mesh(supportGeo, metalMat);
    support.rotation.x = Math.PI / 2;
    support.position.set(side * (seatWidth / 2 - 0.05), seatHeight - 0.02, 0);
    applyShadows(support);
    group.add(support);
  });
  
  // Cross bar (front)
  const crossBarGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius, seatWidth - 0.1, 12);
  const crossBar = new THREE.Mesh(crossBarGeo, metalMat);
  crossBar.rotation.z = Math.PI / 2;
  crossBar.position.set(0, seatHeight * 0.3, seatDepth / 2 - 0.05);
  applyShadows(crossBar);
  group.add(crossBar);
  
  // Rubber feet
  [-1, 1].forEach(sideX => {
    [seatDepth / 2 - 0.05, -seatDepth / 2 + 0.15].forEach((z, idx) => {
      const footGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.015, 12);
      const footMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
      const foot = new THREE.Mesh(footGeo, footMat);
      foot.position.set(sideX * (seatWidth / 2 - 0.05), 0.008, z);
      applyShadows(foot);
      group.add(foot);
    });
  });
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createStudentChair.metadata = {
  category: 'school',
  name: 'Student Chair',
  description: 'Molded plastic chair with metal frame',
  dimensions: { width: 0.4, depth: 0.38, height: 0.8 },
  interactive: false
};

/**
 * Create a basketball hoop
 */
function createBasketballHoop(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const poleHeight = 3.05; // Standard 10 feet = 3.05m
  const backboardWidth = 1.8;
  const backboardHeight = 1.05;
  const rimRadius = 0.225; // 18 inch diameter = 0.45m = 0.225m radius
  
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.3, metalness: 0.8 });
  const orangeMat = new THREE.MeshStandardMaterial({ color: 0xff6600, roughness: 0.4, metalness: 0.6 });
  const glassMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    transparent: true, 
    opacity: 0.3,
    roughness: 0.1,
    metalness: 0.1
  });
  const netMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, wireframe: false });
  
  // Pole
  const poleGeo = new THREE.CylinderGeometry(0.08, 0.1, poleHeight - 0.5, 16);
  const pole = new THREE.Mesh(poleGeo, metalMat);
  pole.position.y = (poleHeight - 0.5) / 2;
  applyShadows(pole);
  group.add(pole);
  
  // Base (heavy weighted)
  const baseGeo = new THREE.BoxGeometry(0.6, 0.5, 0.8);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.25;
  applyShadows(base);
  group.add(base);
  
  // Backboard support arm (from pole to backboard)
  const armLength = 1.2;
  const armGeo = new THREE.BoxGeometry(0.12, 0.12, armLength);
  const arm = new THREE.Mesh(armGeo, metalMat);
  arm.position.set(0, poleHeight - 0.5, armLength / 2 - 0.05);
  applyShadows(arm);
  group.add(arm);
  
  // Diagonal support
  const diagGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.7, 12);
  const diag = new THREE.Mesh(diagGeo, metalMat);
  diag.position.set(0, poleHeight - 0.8, 0.4);
  diag.rotation.x = Math.PI / 4;
  applyShadows(diag);
  group.add(diag);
  
  // Backboard (glass/acrylic)
  const backboardGeo = new THREE.BoxGeometry(backboardWidth, backboardHeight, 0.05);
  const backboard = new THREE.Mesh(backboardGeo, glassMat);
  backboard.position.set(0, poleHeight - 0.5, armLength - 0.1);
  applyShadows(backboard);
  group.add(backboard);
  
  // Backboard frame (metal border)
  const frameThickness = 0.04;
  const frameColor = 0xff0000;
  const frameMat = new THREE.MeshStandardMaterial({ color: frameColor, roughness: 0.4, metalness: 0.6 });
  
  // Top frame
  const topFrameGeo = new THREE.BoxGeometry(backboardWidth + frameThickness, frameThickness, frameThickness);
  const topFrame = new THREE.Mesh(topFrameGeo, frameMat);
  topFrame.position.set(0, poleHeight - 0.5 + backboardHeight / 2, armLength - 0.1);
  applyShadows(topFrame);
  group.add(topFrame);
  
  // Bottom frame
  const bottomFrame = topFrame.clone();
  bottomFrame.position.y = poleHeight - 0.5 - backboardHeight / 2;
  applyShadows(bottomFrame);
  group.add(bottomFrame);
  
  // Side frames
  const sideFrameGeo = new THREE.BoxGeometry(frameThickness, backboardHeight + frameThickness, frameThickness);
  [-1, 1].forEach(side => {
    const sideFrame = new THREE.Mesh(sideFrameGeo, frameMat);
    sideFrame.position.set(side * backboardWidth / 2, poleHeight - 0.5, armLength - 0.1);
    applyShadows(sideFrame);
    group.add(sideFrame);
  });
  
  // Target square on backboard
  const squareWidth = 0.61; // 24 inches
  const squareHeight = 0.46; // 18 inches
  const squareGeo = new THREE.BoxGeometry(squareWidth, squareHeight, 0.002);
  const squareMat = new THREE.MeshStandardMaterial({ color: frameColor, roughness: 0.5 });
  const targetSquare = new THREE.Mesh(squareGeo, squareMat);
  targetSquare.position.set(0, poleHeight - 0.5 - 0.15, armLength - 0.075);
  group.add(targetSquare);
  
  // Rim (orange metal ring)
  const rimGeo = new THREE.TorusGeometry(rimRadius, 0.01, 12, 32);
  const rim = new THREE.Mesh(rimGeo, orangeMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.set(0, poleHeight - 0.5 - backboardHeight / 2 + 0.3, armLength + 0.15);
  applyShadows(rim);
  group.add(rim);
  
  // Rim mounting brackets
  [-rimRadius * 0.7, rimRadius * 0.7].forEach(xOff => {
    const bracketGeo = new THREE.BoxGeometry(0.03, 0.05, 0.2);
    const bracket = new THREE.Mesh(bracketGeo, orangeMat);
    bracket.position.set(xOff, poleHeight - 0.5 - backboardHeight / 2 + 0.3, armLength + 0.05);
    applyShadows(bracket);
    group.add(bracket);
  });
  
  // Net (chain-link or rope style)
  const netHeight = 0.4;
  const netSegments = 12;
  
  for (let i = 0; i < netSegments; i++) {
    const angle = (i / netSegments) * Math.PI * 2;
    const topRadius = rimRadius * 0.95;
    const bottomRadius = rimRadius * 0.6;
    
    // Vertical strand
    const strandGeo = new THREE.CylinderGeometry(0.003, 0.003, netHeight, 6);
    const strand = new THREE.Mesh(strandGeo, netMat);
    const avgRadius = (topRadius + bottomRadius) / 2;
    strand.position.set(
      Math.cos(angle) * avgRadius,
      poleHeight - 0.5 - backboardHeight / 2 + 0.3 - netHeight / 2,
      armLength + 0.15 + Math.sin(angle) * avgRadius
    );
    
    // Slight inward angle
    const angleToCenter = Math.atan2(Math.sin(angle), Math.cos(angle));
    strand.rotation.z = Math.sin(angleToCenter) * 0.15;
    strand.rotation.x = Math.cos(angleToCenter) * 0.15;
    
    group.add(strand);
  }
  
  // Horizontal net loops
  for (let ring = 0; ring < 5; ring++) {
    const ringY = poleHeight - 0.5 - backboardHeight / 2 + 0.3 - ring * (netHeight / 5);
    const ringRadius = rimRadius * (0.95 - ring * 0.07);
    const ringGeo = new THREE.TorusGeometry(ringRadius, 0.002, 6, netSegments);
    const ringMesh = new THREE.Mesh(ringGeo, netMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.set(0, ringY, armLength + 0.15);
    group.add(ringMesh);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createBasketballHoop.metadata = {
  category: 'school',
  name: 'Basketball Hoop',
  description: 'Regulation basketball hoop with backboard, rim, and net',
  dimensions: { width: 1.8, depth: 1.2, height: 3.05 },
  interactive: false
};

/**
 * Create bleachers (retractable gymnasium seating)
 */
function createBleachers(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const rows = spec.rows || 5;
  const seatsPerRow = spec.seatsPerRow || 10;
  const rowDepth = 0.8;
  const rowHeight = 0.45;
  const seatWidth = 0.45;
  
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.5, metalness: 0.6 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.8 });
  const blueMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.7 });
  
  for (let row = 0; row < rows; row++) {
    const rowY = row * rowHeight;
    const rowZ = row * rowDepth;
    
    // Seat platform (bench)
    const platformGeo = new THREE.BoxGeometry(seatWidth * seatsPerRow, 0.05, rowDepth * 0.5);
    const platform = new THREE.Mesh(platformGeo, woodMat);
    platform.position.set(0, rowY + 0.025, -rowZ - rowDepth * 0.25);
    applyShadows(platform);
    group.add(platform);
    
    // Footrest platform
    const footrestGeo = new THREE.BoxGeometry(seatWidth * seatsPerRow, 0.04, rowDepth * 0.4);
    const footrest = new THREE.Mesh(footrestGeo, woodMat);
    footrest.position.set(0, rowY, -rowZ - rowDepth * 0.7);
    applyShadows(footrest);
    group.add(footrest);
    
    // Support beams underneath
    for (let s = 0; s <= seatsPerRow; s += 2) {
      const beamGeo = new THREE.BoxGeometry(0.08, rowHeight, 0.08);
      const beam = new THREE.Mesh(beamGeo, metalMat);
      beam.position.set(
        -seatWidth * seatsPerRow / 2 + s * seatWidth,
        rowY - rowHeight / 2,
        -rowZ - rowDepth / 2
      );
      applyShadows(beam);
      group.add(beam);
    }
    
    // Individual seat backs (plastic flip-up style)
    for (let s = 0; s < seatsPerRow; s++) {
      const seatBackGeo = new THREE.BoxGeometry(seatWidth * 0.9, 0.35, 0.04);
      const seatBack = new THREE.Mesh(seatBackGeo, blueMat);
      seatBack.position.set(
        -seatWidth * seatsPerRow / 2 + (s + 0.5) * seatWidth,
        rowY + 0.2,
        -rowZ - rowDepth * 0.48
      );
      seatBack.rotation.x = -0.1;
      applyShadows(seatBack);
      group.add(seatBack);
      
      // Seat number (simplified as small plate)
      const numberGeo = new THREE.BoxGeometry(0.06, 0.04, 0.002);
      const numberMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
      const number = new THREE.Mesh(numberGeo, numberMat);
      number.position.set(
        -seatWidth * seatsPerRow / 2 + (s + 0.5) * seatWidth,
        rowY + 0.35,
        -rowZ - rowDepth * 0.46
      );
      group.add(number);
    }
    
    // Safety rail (top row only)
    if (row === rows - 1) {
      const railGeo = new THREE.CylinderGeometry(0.025, 0.025, seatWidth * seatsPerRow, 12);
      const rail = new THREE.Mesh(railGeo, metalMat);
      rail.rotation.z = Math.PI / 2;
      rail.position.set(0, rowY + 0.9, -rowZ - rowDepth);
      applyShadows(rail);
      group.add(rail);
      
      // Rail posts
      for (let p = 0; p <= seatsPerRow; p += 5) {
        const postGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.9, 12);
        const post = new THREE.Mesh(postGeo, metalMat);
        post.position.set(
          -seatWidth * seatsPerRow / 2 + p * seatWidth,
          rowY + 0.45,
          -rowZ - rowDepth
        );
        applyShadows(post);
        group.add(post);
      }
    }
  }
  
  // Base/wheel system (for retractable bleachers)
  const wheelCount = Math.ceil(seatsPerRow / 2);
  for (let w = 0; w < wheelCount; w++) {
    const wheelGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.1, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7 });
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(
      -seatWidth * seatsPerRow / 2 + (w + 0.5) * (seatWidth * seatsPerRow / wheelCount),
      0.08,
      -rowDepth * 0.3
    );
    applyShadows(wheel);
    group.add(wheel);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createBleachers.metadata = {
  category: 'school',
  name: 'Bleachers',
  description: 'Retractable gymnasium bleachers with safety rail',
  dimensions: { width: 4.5, depth: 4.0, height: 2.7 },
  interactive: false
};

/**
 * Create a marble composition notebook
 */
function createMarbleNotebook(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = 0.2;
  const height = 0.25;
  const thickness = 0.015;
  
  // Create realistic marble texture using procedural noise-based technique
  // Real marble notebooks use water-floating ink technique creating organic swirls
  function createMarbleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Black base
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 512, 512);
    
    // Create noise-based marble pattern (simulating ink on water)
    const imageData = ctx.getImageData(0, 0, 512, 512);
    const data = imageData.data;
    
    // Simple noise function for marbling
    function noise(x, y, scale) {
      return Math.sin(x * scale) * Math.cos(y * scale) * Math.sin((x + y) * scale * 0.5);
    }
    
    // Generate multiple octaves of marble swirls
    for (let y = 0; y < 512; y++) {
      for (let x = 0; x < 512; x++) {
        const idx = (y * 512 + x) * 4;
        
        // Multi-frequency marble pattern
        let value = 0;
        
        // Large swirls (primary pattern)
        value += noise(x, y, 0.015) * 0.5;
        
        // Medium swirls
        value += noise(x * 1.5, y * 1.5, 0.02) * 0.3;
        
        // Fine detail
        value += noise(x * 3, y * 3, 0.03) * 0.2;
        
        // Turbulence effect (creates the characteristic swirling veins)
        const turbulence = noise(x, y, 0.01) * 30 + noise(x, y, 0.02) * 15;
        const distortedX = x + turbulence;
        const distortedY = y + turbulence * 0.5;
        
        // Secondary vein pattern with distortion
        value += noise(distortedX, distortedY, 0.025) * 0.4;
        
        // Add directional flow (simulates ink spreading)
        const flowAngle = Math.atan2(y - 256, x - 256);
        const flowStrength = Math.sqrt((x - 256) * (x - 256) + (y - 256) * (y - 256)) / 256;
        value += Math.sin(flowAngle * 6 + flowStrength * 8) * 0.3;
        
        // Normalize to 0-1 range
        value = (value + 1) * 0.5;
        
        // Apply threshold and feathering for realistic veins
        let intensity = 0;
        if (value > 0.65) {
          // White veins (brightest areas)
          intensity = Math.pow((value - 0.65) / 0.35, 0.7) * 255;
        } else if (value > 0.45) {
          // Gray transitional areas
          intensity = Math.pow((value - 0.45) / 0.2, 1.2) * 180;
        } else if (value > 0.35) {
          // Dark gray veins
          intensity = Math.pow((value - 0.35) / 0.1, 1.5) * 100;
        }
        
        // Add some color variation (slight blue/green tints like real marble)
        data[idx] = intensity; // R
        data[idx + 1] = intensity * 0.95; // G (slightly less)
        data[idx + 2] = intensity * 1.05; // B (slightly more - cool tint)
        data[idx + 3] = 255; // A
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Add organic splatter effects (like real ink droplets)
    ctx.globalCompositeOperation = 'screen';
    
    // Large ink splatters
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = 10 + Math.random() * 25;
      const opacity = 0.1 + Math.random() * 0.3;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
      gradient.addColorStop(0.5, `rgba(200, 200, 200, ${opacity * 0.5})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Add tendrils/streaks from splatter
      for (let j = 0; j < 3 + Math.random() * 4; j++) {
        const angle = Math.random() * Math.PI * 2;
        const length = 5 + Math.random() * 20;
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.4})`;
        ctx.lineWidth = 0.5 + Math.random() * 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(
          x + Math.cos(angle) * length,
          y + Math.sin(angle) * length
        );
        ctx.stroke();
      }
    }
    
    // Medium splatters
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = 5 + Math.random() * 12;
      const opacity = 0.15 + Math.random() * 0.25;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
      gradient.addColorStop(0.7, `rgba(180, 180, 180, ${opacity * 0.3})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Fine speckles
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = 1 + Math.random() * 3;
      const opacity = 0.2 + Math.random() * 0.4;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    return new THREE.CanvasTexture(canvas);
  }
  
  // Cover with marble pattern
  const marbleTexture = createMarbleTexture();
  const coverMat = new THREE.MeshStandardMaterial({ 
    map: marbleTexture,
    roughness: 0.6 
  });
  
  const coverGeo = new THREE.BoxGeometry(width, height, thickness);
  const cover = new THREE.Mesh(coverGeo, coverMat);
  applyShadows(cover);
  group.add(cover);
  
  // Spine (black cloth tape)
  const spineGeo = new THREE.BoxGeometry(0.015, height, thickness + 0.002);
  const spineMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
  const spine = new THREE.Mesh(spineGeo, spineMat);
  spine.position.x = -width / 2 + 0.0075;
  applyShadows(spine);
  group.add(spine);
  
  // Page edges (visible from side)
  const pagesGeo = new THREE.BoxGeometry(width * 0.98, height * 0.96, thickness * 0.8);
  const pagesMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
  const pages = new THREE.Mesh(pagesGeo, pagesMat);
  pages.position.x = 0.002;
  group.add(pages);
  
  // Label area (white rectangle)
  const labelGeo = new THREE.BoxGeometry(width * 0.6, height * 0.3, 0.001);
  const labelMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
  const label = new THREE.Mesh(labelGeo, labelMat);
  label.position.set(0.01, 0, thickness / 2 + 0.001);
  group.add(label);
  
  // Label border lines
  const borderMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const borderThickness = 0.002;
  
  // Top/bottom borders
  [height * 0.15, -height * 0.15].forEach(y => {
    const borderGeo = new THREE.BoxGeometry(width * 0.62, borderThickness, 0.001);
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.position.set(0.01, y, thickness / 2 + 0.0015);
    group.add(border);
  });
  
  // Side borders
  [-width * 0.3, width * 0.3].forEach(x => {
    const borderGeo = new THREE.BoxGeometry(borderThickness, height * 0.3, 0.001);
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.position.set(x + 0.01, 0, thickness / 2 + 0.0015);
    group.add(border);
  });
  
  // Rounded corners on cover
  const cornerRadius = 0.003;
  [[width / 2, height / 2], [width / 2, -height / 2], 
   [-width / 2, height / 2], [-width / 2, -height / 2]].forEach(([x, y]) => {
    const cornerGeo = new THREE.SphereGeometry(cornerRadius, 8, 8);
    const corner = new THREE.Mesh(cornerGeo, spineMat);
    corner.position.set(x, y, 0);
    group.add(corner);
  });
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createMarbleNotebook.metadata = {
  category: 'school',
  name: 'Marble Notebook',
  description: 'Classic composition notebook with marble pattern cover',
  dimensions: { width: 0.2, height: 0.25, depth: 0.015 },
  interactive: false
};

/**
 * Create a paper airplane
 */
function createPaperAirplane(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const length = 0.15;
  const wingspan = 0.12;
  
  const paperMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    roughness: 0.8,
    side: THREE.DoubleSide 
  });
  
  // Main fuselage (triangular prism)
  const fuselageShape = new THREE.Shape();
  fuselageShape.moveTo(0, 0);
  fuselageShape.lineTo(-length, -0.01);
  fuselageShape.lineTo(-length, 0.01);
  fuselageShape.lineTo(0, 0);
  
  const fuselageGeo = new THREE.ExtrudeGeometry(fuselageShape, {
    depth: 0.005,
    bevelEnabled: false
  });
  const fuselage = new THREE.Mesh(fuselageGeo, paperMat);
  fuselage.position.z = -0.0025;
  applyShadows(fuselage);
  group.add(fuselage);
  
  // Wings (angled downward)
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(-length * 0.7, 0);
  wingShape.lineTo(-length * 0.85, -wingspan / 2);
  wingShape.lineTo(0, -wingspan / 2 * 0.3);
  wingShape.lineTo(0, 0);
  
  // Right wing
  const rightWingGeo = new THREE.ShapeGeometry(wingShape);
  const rightWing = new THREE.Mesh(rightWingGeo, paperMat);
  rightWing.rotation.x = -Math.PI / 12; // Slight dihedral angle
  rightWing.position.set(0, 0.01, 0);
  applyShadows(rightWing);
  group.add(rightWing);
  
  // Left wing (mirrored)
  const leftWingGeo = new THREE.ShapeGeometry(wingShape);
  const leftWing = new THREE.Mesh(leftWingGeo, paperMat);
  leftWing.rotation.x = Math.PI / 12; // Opposite dihedral
  leftWing.rotation.y = Math.PI;
  leftWing.position.set(0, 0.01, 0);
  applyShadows(leftWing);
  group.add(leftWing);
  
  // Center fold crease (dark line)
  const creaseGeo = new THREE.BoxGeometry(length, 0.0005, 0.001);
  const creaseMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
  const crease = new THREE.Mesh(creaseGeo, creaseMat);
  crease.position.set(-length / 2, 0.011, 0);
  group.add(crease);
  
  // Nose (sharp point with slight vertical fins)
  const noseShape = new THREE.Shape();
  noseShape.moveTo(0, 0);
  noseShape.lineTo(-0.015, -0.008);
  noseShape.lineTo(-0.015, 0.008);
  noseShape.lineTo(0, 0);
  
  const noseGeo = new THREE.ExtrudeGeometry(noseShape, {
    depth: 0.005,
    bevelEnabled: false
  });
  const nose = new THREE.Mesh(noseGeo, paperMat);
  nose.position.z = -0.0025;
  applyShadows(nose);
  group.add(nose);
  
  // Wing tips (slight upturn)
  [wingspan / 2, -wingspan / 2].forEach((offset, i) => {
    const tipGeo = new THREE.BoxGeometry(0.02, 0.0005, 0.015);
    const tip = new THREE.Mesh(tipGeo, paperMat);
    tip.position.set(-length * 0.8, 0.008, offset * 0.85);
    tip.rotation.x = i === 0 ? -Math.PI / 8 : Math.PI / 8;
    applyShadows(tip);
    group.add(tip);
  });
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createPaperAirplane.metadata = {
  category: 'school',
  name: 'Paper Airplane',
  description: 'Folded paper airplane with realistic creases',
  dimensions: { width: 0.12, length: 0.15, height: 0.03 },
  interactive: false
};

/**
 * Create chewed gum wad
 */
function createChewedGum(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const size = 0.025;
  
  // Irregular blob shape using deformed sphere
  const gumGeo = new THREE.IcosahedronGeometry(size, 2);
  
  // Deform to create irregular, lumpy shape
  const positions = gumGeo.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    
    // Random lumps and irregularity
    const noise = Math.sin(x * 40) * Math.cos(y * 35) * Math.sin(z * 38);
    const deform = 1 + noise * 0.3;
    
    positions.setX(i, x * deform);
    positions.setY(i, y * deform * 0.8); // Flatten slightly
    positions.setZ(i, z * deform);
  }
  gumGeo.computeVertexNormals();
  
  // Pink, slightly glossy material
  const gumMat = new THREE.MeshStandardMaterial({ 
    color: 0xffb6d9, 
    roughness: 0.3,
    metalness: 0.1 
  });
  
  const gum = new THREE.Mesh(gumGeo, gumMat);
  gum.position.y = size * 0.5;
  applyShadows(gum);
  group.add(gum);
  
  // Add some texture variation (small bumps)
  const bumpCount = 8;
  for (let i = 0; i < bumpCount; i++) {
    const angle = (i / bumpCount) * Math.PI * 2;
    const radius = size * 0.6;
    const bumpSize = size * 0.15;
    
    const bumpGeo = new THREE.SphereGeometry(bumpSize, 6, 6);
    const bump = new THREE.Mesh(bumpGeo, gumMat);
    bump.position.set(
      Math.cos(angle) * radius,
      size * 0.5 + Math.sin(i * 2) * size * 0.3,
      Math.sin(angle) * radius
    );
    group.add(bump);
  }
  
  // Slightly stick to surface (flattened bottom)
  const bottomGeo = new THREE.CircleGeometry(size * 0.8, 16);
  const bottomMat = new THREE.MeshStandardMaterial({ 
    color: 0xffb6d9, 
    roughness: 0.4,
    side: THREE.DoubleSide 
  });
  const bottom = new THREE.Mesh(bottomGeo, bottomMat);
  bottom.rotation.x = -Math.PI / 2;
  bottom.position.y = 0.001;
  group.add(bottom);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createChewedGum.metadata = {
  category: 'school',
  name: 'Chewed Gum',
  description: 'Lumpy wad of chewed bubblegum',
  dimensions: { width: 0.05, height: 0.025, depth: 0.05 },
  interactive: false
};

/**
 * Create a classroom globe
 */
function createGlobe(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const globeRadius = 0.2;
  const standHeight = 0.35;
  
  // Globe sphere (Earth colors - blue ocean, green land)
  const globeGeo = new THREE.SphereGeometry(globeRadius, 32, 32);
  
  // Create a textured appearance using vertex colors
  const positions = globeGeo.attributes.position;
  const colors = new Float32Array(positions.count * 3);
  
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    
    // Create land/ocean pattern using noise
    const noise = Math.sin(x * 15) * Math.cos(y * 12) * Math.sin(z * 18);
    const isLand = noise > 0.2;
    
    if (isLand) {
      // Green/brown land
      colors[i * 3] = 0.2 + Math.random() * 0.2;     // R
      colors[i * 3 + 1] = 0.5 + Math.random() * 0.3; // G
      colors[i * 3 + 2] = 0.1 + Math.random() * 0.1; // B
    } else {
      // Blue ocean
      colors[i * 3] = 0.1 + Math.random() * 0.1;     // R
      colors[i * 3 + 1] = 0.3 + Math.random() * 0.2; // G
      colors[i * 3 + 2] = 0.6 + Math.random() * 0.3; // B
    }
  }
  
  globeGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  
  const globeMat = new THREE.MeshStandardMaterial({ 
    vertexColors: true,
    roughness: 0.5,
    metalness: 0.1
  });
  
  const globe = new THREE.Mesh(globeGeo, globeMat);
  globe.position.y = standHeight + globeRadius;
  globe.rotation.z = Math.PI / 12; // Slight tilt like real globes
  applyShadows(globe);
  group.add(globe);
  
  // Metal meridian ring (goes around globe vertically)
  const meridianGeo = new THREE.TorusGeometry(globeRadius + 0.005, 0.008, 12, 32);
  const metalMat = new THREE.MeshStandardMaterial({ 
    color: 0x888888, 
    roughness: 0.4, 
    metalness: 0.7 
  });
  const meridian = new THREE.Mesh(meridianGeo, metalMat);
  meridian.position.y = standHeight + globeRadius;
  meridian.rotation.z = Math.PI / 12;
  applyShadows(meridian);
  group.add(meridian);
  
  // Support arm (metal arc connecting to stand)
  const armGeo = new THREE.TorusGeometry(globeRadius * 0.7, 0.012, 12, 24, Math.PI);
  const arm = new THREE.Mesh(armGeo, metalMat);
  arm.position.y = standHeight + globeRadius;
  arm.rotation.x = Math.PI / 2;
  arm.rotation.z = Math.PI / 12;
  applyShadows(arm);
  group.add(arm);
  
  // Stand base (circular)
  const baseMat = new THREE.MeshStandardMaterial({ 
    color: 0x4a4a4a, 
    roughness: 0.6,
    metalness: 0.3 
  });
  const baseGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.02, 24);
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.01;
  applyShadows(base);
  group.add(base);
  
  // Stand pole
  const poleGeo = new THREE.CylinderGeometry(0.015, 0.018, standHeight - 0.02, 12);
  const pole = new THREE.Mesh(poleGeo, metalMat);
  pole.position.y = standHeight / 2;
  applyShadows(pole);
  group.add(pole);
  
  // Stand middle ring
  const ringGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.015, 16);
  const ring = new THREE.Mesh(ringGeo, baseMat);
  ring.position.y = standHeight / 2;
  applyShadows(ring);
  group.add(ring);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createGlobe.metadata = {
  category: 'school',
  name: 'Globe',
  description: 'Desktop globe with metal stand and meridian ring',
  dimensions: { width: 0.4, height: 0.75, depth: 0.4 },
  interactive: false
};

/**
 * Create a chemistry beaker
 */
function createBeaker(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const radius = 0.04;
  const height = spec.height || 0.12;
  const liquidLevel = spec.liquidLevel || 0.6; // 0 to 1
  const liquidColor = spec.liquidColor || 0x4488ff;
  
  // Glass beaker (cylinder with slight transparency)
  const beakerGeo = new THREE.CylinderGeometry(radius, radius * 0.85, height, 24, 1, true);
  const glassMat = new THREE.MeshStandardMaterial({ 
    color: 0xddffff,
    transparent: true,
    opacity: 0.3,
    roughness: 0.1,
    metalness: 0.1,
    side: THREE.DoubleSide
  });
  
  const beaker = new THREE.Mesh(beakerGeo, glassMat);
  beaker.position.y = height / 2;
  applyShadows(beaker);
  group.add(beaker);
  
  // Bottom of beaker (glass)
  const bottomGeo = new THREE.CircleGeometry(radius * 0.85, 24);
  const bottom = new THREE.Mesh(bottomGeo, glassMat);
  bottom.rotation.x = -Math.PI / 2;
  bottom.position.y = 0.001;
  group.add(bottom);
  
  // Glass rim (thicker top edge)
  const rimGeo = new THREE.TorusGeometry(radius, 0.003, 8, 24);
  const rim = new THREE.Mesh(rimGeo, glassMat);
  rim.position.y = height;
  group.add(rim);
  
  // Measurement markings (etched lines)
  const markMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
  for (let i = 1; i <= 4; i++) {
    const markGeo = new THREE.TorusGeometry(radius + 0.001, 0.0008, 4, 24);
    const mark = new THREE.Mesh(markGeo, markMat);
    mark.position.y = (height / 5) * i;
    group.add(mark);
  }
  
  // Liquid inside (if present)
  if (liquidLevel > 0) {
    const liquidHeight = height * liquidLevel;
    const liquidGeo = new THREE.CylinderGeometry(
      radius * 0.8, 
      radius * 0.75, 
      liquidHeight, 
      24
    );
    const liquidMat = new THREE.MeshStandardMaterial({ 
      color: liquidColor,
      transparent: true,
      opacity: 0.6,
      roughness: 0.2,
      metalness: 0.1
    });
    
    const liquid = new THREE.Mesh(liquidGeo, liquidMat);
    liquid.position.y = liquidHeight / 2 + 0.002;
    applyShadows(liquid);
    group.add(liquid);
    
    // Liquid surface (meniscus)
    const surfaceGeo = new THREE.CircleGeometry(radius * 0.8, 24);
    const surfaceMat = new THREE.MeshStandardMaterial({ 
      color: liquidColor,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    const surface = new THREE.Mesh(surfaceGeo, surfaceMat);
    surface.rotation.x = -Math.PI / 2;
    surface.position.y = liquidHeight + 0.002;
    group.add(surface);
  }
  
  // Spout (small pouring lip)
  const spoutGeo = new THREE.CylinderGeometry(0.008, 0.012, 0.015, 12);
  const spout = new THREE.Mesh(spoutGeo, glassMat);
  spout.position.set(radius + 0.005, height - 0.01, 0);
  spout.rotation.z = Math.PI / 3;
  group.add(spout);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createBeaker.metadata = {
  category: 'school',
  name: 'Beaker',
  description: 'Glass chemistry beaker with measurement markings',
  dimensions: { width: 0.08, height: 0.12, depth: 0.08 },
  interactive: false
};

/**
 * Create a test tube
 */
function createTestTube(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const radius = 0.012;
  const height = 0.15;
  const liquidLevel = spec.liquidLevel || 0.4;
  const liquidColor = spec.liquidColor || 0xff4444;
  
  // Glass tube (cylinder)
  const tubeGeo = new THREE.CylinderGeometry(radius, radius, height * 0.85, 16, 1, true);
  const glassMat = new THREE.MeshStandardMaterial({ 
    color: 0xddffff,
    transparent: true,
    opacity: 0.3,
    roughness: 0.1,
    metalness: 0.1,
    side: THREE.DoubleSide
  });
  
  const tube = new THREE.Mesh(tubeGeo, glassMat);
  tube.position.y = height * 0.85 / 2 + height * 0.075;
  applyShadows(tube);
  group.add(tube);
  
  // Rounded bottom (hemisphere)
  const bottomGeo = new THREE.SphereGeometry(radius, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const bottom = new THREE.Mesh(bottomGeo, glassMat);
  bottom.rotation.x = Math.PI;
  bottom.position.y = height * 0.075;
  applyShadows(bottom);
  group.add(bottom);
  
  // Rim at top
  const rimGeo = new THREE.TorusGeometry(radius, 0.002, 6, 16);
  const rim = new THREE.Mesh(rimGeo, glassMat);
  rim.rotation.x = Math.PI / 2; // Rotate forward to be horizontal
  rim.position.y = height * 0.925;
  group.add(rim);
  
  // Liquid inside (if present)
  if (liquidLevel > 0) {
    const liquidHeight = height * 0.85 * liquidLevel;
    
    // Liquid cylinder
    const liquidGeo = new THREE.CylinderGeometry(radius * 0.85, radius * 0.85, liquidHeight, 16);
    const liquidMat = new THREE.MeshStandardMaterial({ 
      color: liquidColor,
      transparent: true,
      opacity: 0.7,
      roughness: 0.2
    });
    
    const liquid = new THREE.Mesh(liquidGeo, liquidMat);
    liquid.position.y = height * 0.075 + liquidHeight / 2;
    applyShadows(liquid);
    group.add(liquid);
    
    // Liquid bottom hemisphere
    const liquidBottomGeo = new THREE.SphereGeometry(radius * 0.85, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const liquidBottom = new THREE.Mesh(liquidBottomGeo, liquidMat);
    liquidBottom.rotation.x = Math.PI;
    liquidBottom.position.y = height * 0.075 + 0.001;
    group.add(liquidBottom);
    
    // Liquid surface
    const surfaceGeo = new THREE.CircleGeometry(radius * 0.85, 16);
    const surface = new THREE.Mesh(surfaceGeo, liquidMat);
    surface.rotation.x = -Math.PI / 2;
    surface.position.y = height * 0.075 + liquidHeight;
    group.add(surface);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createTestTube.metadata = {
  category: 'school',
  name: 'Test Tube',
  description: 'Glass test tube with rounded bottom',
  dimensions: { width: 0.024, height: 0.15, depth: 0.024 },
  interactive: false
};

/**
 * Create a Bunsen burner
 */
function createBunsenBurner(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const baseRadius = 0.06;
  const burnerHeight = 0.18;
  const flameOn = spec.flameOn !== undefined ? spec.flameOn : true;
  
  // Heavy metal base
  const baseMat = new THREE.MeshStandardMaterial({ 
    color: 0x444444, 
    roughness: 0.6, 
    metalness: 0.5 
  });
  
  const baseGeo = new THREE.CylinderGeometry(baseRadius, baseRadius * 0.9, 0.02, 24);
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.01;
  applyShadows(base);
  group.add(base);
  
  // Gas inlet tube (coming from bottom)
  const inletGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.04, 12);
  const metalMat = new THREE.MeshStandardMaterial({ 
    color: 0x666666, 
    roughness: 0.5, 
    metalness: 0.6 
  });
  const inlet = new THREE.Mesh(inletGeo, metalMat);
  inlet.position.set(baseRadius * 0.6, 0.01, 0);
  inlet.rotation.z = Math.PI / 2;
  applyShadows(inlet);
  group.add(inlet);
  
  // Main barrel (wider at bottom, narrow at top)
  const barrelGeo = new THREE.CylinderGeometry(0.018, 0.025, burnerHeight * 0.7, 16);
  const barrel = new THREE.Mesh(barrelGeo, metalMat);
  barrel.position.y = burnerHeight * 0.35 + 0.02;
  applyShadows(barrel);
  group.add(barrel);
  
  // Air flow control collar (rotatable ring)
  const collarGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.02, 20);
  const collar = new THREE.Mesh(collarGeo, baseMat);
  collar.position.y = burnerHeight * 0.25;
  applyShadows(collar);
  group.add(collar);
  
  // Air holes in collar
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const holeGeo = new THREE.BoxGeometry(0.008, 0.015, 0.003);
    const holeMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const hole = new THREE.Mesh(holeGeo, holeMat);
    hole.position.set(
      Math.cos(angle) * 0.026,
      burnerHeight * 0.25,
      Math.sin(angle) * 0.026
    );
    group.add(hole);
  }
  
  // Top burner head with gas nozzle
  const headGeo = new THREE.CylinderGeometry(0.022, 0.018, 0.04, 16);
  const head = new THREE.Mesh(headGeo, metalMat);
  head.position.y = burnerHeight * 0.7 + 0.05;
  applyShadows(head);
  group.add(head);
  
  // Gas nozzle openings (top grate)
  const grateGeo = new THREE.CylinderGeometry(0.021, 0.021, 0.003, 16);
  const grateMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7 });
  const grate = new THREE.Mesh(grateGeo, grateMat);
  grate.position.y = burnerHeight * 0.7 + 0.07;
  group.add(grate);
  
  // Small holes in grate
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const holeGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.005, 8);
    const hole = new THREE.Mesh(holeGeo, new THREE.MeshStandardMaterial({ color: 0x000000 }));
    hole.position.set(
      Math.cos(angle) * 0.012,
      burnerHeight * 0.7 + 0.07,
      Math.sin(angle) * 0.012
    );
    group.add(hole);
  }
  
  // Gas control valve (small knob on side)
  const valveGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.015, 12);
  const valve = new THREE.Mesh(valveGeo, baseMat);
  valve.position.set(0.025, burnerHeight * 0.4, 0);
  valve.rotation.z = Math.PI / 2;
  applyShadows(valve);
  group.add(valve);
  
  // Flame (if burner is on)
  if (flameOn) {
    // Blue inner cone (hottest part)
    const innerFlameGeo = new THREE.ConeGeometry(0.015, 0.06, 12);
    const innerFlameMat = new THREE.MeshStandardMaterial({ 
      color: 0x4444ff,
      emissive: 0x2222ff,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.7
    });
    const innerFlame = new THREE.Mesh(innerFlameGeo, innerFlameMat);
    innerFlame.position.y = burnerHeight * 0.7 + 0.1;
    group.add(innerFlame);
    
    // Outer flame (cooler, more yellow/orange)
    const outerFlameGeo = new THREE.ConeGeometry(0.022, 0.09, 12);
    const outerFlameMat = new THREE.MeshStandardMaterial({ 
      color: 0xffaa44,
      emissive: 0xff6622,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.5
    });
    const outerFlame = new THREE.Mesh(outerFlameGeo, outerFlameMat);
    outerFlame.position.y = burnerHeight * 0.7 + 0.115;
    group.add(outerFlame);
    
    // Flickering tip
    const tipGeo = new THREE.SphereGeometry(0.008, 8, 8);
    const tipMat = new THREE.MeshStandardMaterial({ 
      color: 0xffff88,
      emissive: 0xffaa00,
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: 0.8
    });
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.position.y = burnerHeight * 0.7 + 0.16;
    group.add(tip);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createBunsenBurner.metadata = {
  category: 'school',
  name: 'Bunsen Burner',
  description: 'Chemistry lab Bunsen burner with adjustable flame',
  dimensions: { width: 0.12, height: 0.25, depth: 0.12 },
  interactive: false
};

/**
 * Create a test tube rack
 */
function createTestTubeRack(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const tubeCount = spec.tubeCount || 6;
  const rows = spec.rows || 1;
  const rackWidth = 0.3;
  const rackDepth = 0.08;
  const rackHeight = 0.12;
  
  // Wood base and frame material
  const woodMat = new THREE.MeshStandardMaterial({ 
    color: 0x8b7355, 
    roughness: 0.7 
  });
  
  // Base platform
  const baseGeo = new THREE.BoxGeometry(rackWidth, 0.015, rackDepth);
  const base = new THREE.Mesh(baseGeo, woodMat);
  base.position.y = 0.0075;
  applyShadows(base);
  group.add(base);
  
  // Back support (angled)
  const backHeight = rackHeight;
  const backGeo = new THREE.BoxGeometry(rackWidth, backHeight, 0.012);
  const back = new THREE.Mesh(backGeo, woodMat);
  back.position.set(0, backHeight / 2, -rackDepth / 2 + 0.006);
  back.rotation.x = -Math.PI / 12; // Slight angle
  applyShadows(back);
  group.add(back);
  
  // Side supports
  const sideGeo = new THREE.BoxGeometry(0.012, backHeight, rackDepth);
  [-rackWidth / 2 + 0.006, rackWidth / 2 - 0.006].forEach(x => {
    const side = new THREE.Mesh(sideGeo, woodMat);
    side.position.set(x, backHeight / 2, 0);
    applyShadows(side);
    group.add(side);
  });
  
  // Create holes for test tubes
  const tubesPerRow = Math.ceil(tubeCount / rows);
  const holeRadius = 0.016;
  const holeSpacing = (rackWidth - 0.04) / (tubesPerRow - 1);
  const rowSpacing = rows > 1 ? (rackDepth - 0.03) / (rows - 1) : 0;
  
  const holeMat = new THREE.MeshStandardMaterial({ 
    color: 0x3a3a3a,
    roughness: 0.8 
  });
  
  for (let row = 0; row < rows; row++) {
    for (let i = 0; i < tubesPerRow; i++) {
      if (row * tubesPerRow + i >= tubeCount) break;
      
      const x = -rackWidth / 2 + 0.02 + i * holeSpacing;
      const z = rows > 1 ? -rackDepth / 2 + 0.015 + row * rowSpacing : 0;
      
      // Hole (dark circle)
      const holeGeo = new THREE.CylinderGeometry(holeRadius, holeRadius, 0.02, 16);
      const hole = new THREE.Mesh(holeGeo, holeMat);
      hole.position.set(x, 0.015, z);
      applyShadows(hole);
      group.add(hole);
      
      // Ring around hole
      const ringGeo = new THREE.TorusGeometry(holeRadius + 0.002, 0.003, 8, 16);
      const ring = new THREE.Mesh(ringGeo, woodMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(x, 0.025, z);
      group.add(ring);
    }
  }
  
  // Add optional test tubes if requested
  if (spec.withTubes) {
    for (let row = 0; row < rows; row++) {
      for (let i = 0; i < tubesPerRow; i++) {
        if (row * tubesPerRow + i >= tubeCount) break;
        
        const x = -rackWidth / 2 + 0.02 + i * holeSpacing;
        const z = rows > 1 ? -rackDepth / 2 + 0.015 + row * rowSpacing : 0;
        
        // Mini test tube
        const tubeRadius = 0.012;
        const tubeHeight = 0.08;
        
        const glassMat = new THREE.MeshStandardMaterial({ 
          color: 0xddffff,
          transparent: true,
          opacity: 0.3,
          roughness: 0.1,
          side: THREE.DoubleSide
        });
        
        // Tube body
        const tubeGeo = new THREE.CylinderGeometry(tubeRadius, tubeRadius, tubeHeight, 12);
        const tube = new THREE.Mesh(tubeGeo, glassMat);
        tube.position.set(x, 0.015 + tubeHeight / 2, z);
        applyShadows(tube);
        group.add(tube);
        
        // Rounded bottom
        const bottomGeo = new THREE.SphereGeometry(tubeRadius, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
        const bottom = new THREE.Mesh(bottomGeo, glassMat);
        bottom.rotation.x = Math.PI;
        bottom.position.set(x, 0.015, z);
        group.add(bottom);
        
        // Random colored liquid
        if (Math.random() > 0.3) {
          const colors = [0xff4444, 0x44ff44, 0x4444ff, 0xffaa44, 0xff44ff, 0x44ffff];
          const liquidColor = colors[Math.floor(Math.random() * colors.length)];
          const liquidLevel = 0.3 + Math.random() * 0.5;
          const liquidHeight = tubeHeight * liquidLevel;
          
          const liquidMat = new THREE.MeshStandardMaterial({ 
            color: liquidColor,
            transparent: true,
            opacity: 0.7
          });
          
          const liquidGeo = new THREE.CylinderGeometry(tubeRadius * 0.85, tubeRadius * 0.85, liquidHeight, 12);
          const liquid = new THREE.Mesh(liquidGeo, liquidMat);
          liquid.position.set(x, 0.015 + liquidHeight / 2, z);
          group.add(liquid);
        }
      }
    }
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createTestTubeRack.metadata = {
  category: 'school',
  name: 'Test Tube Rack',
  description: 'Wooden rack for holding test tubes',
  dimensions: { width: 0.3, height: 0.12, depth: 0.08 },
  interactive: false
};

/**
 * Create a #2 pencil with incredible detail
 * BLOCKING: Hexagonal wood body -> Painted finish -> Ferrule (metal band) -> Eraser -> Graphite core
 * TECHNIQUES: Hex geometry, metallic ferrule, worn eraser with vertex deformation
 */
function createPencil(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const pencilLength = 0.19;
  const pencilRadius = 0.004;
  
  // Hexagonal body (yellow #2 pencil)
  const bodyGeo = new THREE.CylinderGeometry(pencilRadius, pencilRadius, pencilLength * 0.75, 6);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0xffdd55,
    roughness: 0.6
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.rotation.z = Math.PI / 2;
  body.position.set(pencilLength * 0.375, 0.004, 0);
  applyShadows(body);
  group.add(body);
  
  // Painted band near eraser (gold/silver)
  const bandGeo = new THREE.CylinderGeometry(pencilRadius + 0.0002, pencilRadius + 0.0002, 0.008, 6);
  const bandMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    roughness: 0.3,
    metalness: 0.7
  });
  const band = new THREE.Mesh(bandGeo, bandMat);
  band.rotation.z = Math.PI / 2;
  band.position.set(pencilLength * 0.76, 0.004, 0);
  applyShadows(band);
  group.add(band);
  
  // Text printing (brand name, "#2", etc)
  for (let i = 0; i < 3; i++) {
    const textGeo = new THREE.BoxGeometry(0.025, 0.0008, 0.002);
    const textMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const text = new THREE.Mesh(textGeo, textMat);
    text.position.set(0.05 + i * 0.035, 0.0085, 0);
    group.add(text);
  }
  
  // Metal ferrule (crimped band holding eraser)
  const ferruleGeo = new THREE.CylinderGeometry(pencilRadius + 0.0008, pencilRadius + 0.0005, 0.015, 16);
  const ferruleMat = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    roughness: 0.2,
    metalness: 0.9
  });
  const ferrule = new THREE.Mesh(ferruleGeo, ferruleMat);
  ferrule.rotation.z = Math.PI / 2;
  ferrule.position.set(pencilLength * 0.785, 0.004, 0);
  applyShadows(ferrule);
  group.add(ferrule);
  
  // Ferrule crimps (ridged bands)
  for (let i = 0; i < 3; i++) {
    const crimpGeo = new THREE.TorusGeometry(pencilRadius + 0.0009, 0.0002, 6, 16);
    const crimp = new THREE.Mesh(crimpGeo, ferruleMat);
    crimp.rotation.y = Math.PI / 2;
    crimp.position.set(pencilLength * 0.775 + i * 0.005, 0.004, 0);
    group.add(crimp);
  }
  
  // Eraser (pink, slightly worn)
  const eraserGeo = new THREE.CylinderGeometry(pencilRadius + 0.0003, pencilRadius, 0.012, 12);
  const eraserPositions = eraserGeo.attributes.position;
  
  // Add wear marks (deform the eraser top)
  for (let i = 0; i < eraserPositions.count; i++) {
    const x = eraserPositions.getX(i);
    const y = eraserPositions.getY(i);
    const z = eraserPositions.getZ(i);
    
    if (y > 0.004) {
      // Irregular wear pattern on top
      const wearPattern = Math.sin(x * 80) * Math.cos(z * 70) * 0.0015;
      const centerDist = Math.sqrt(x * x + z * z) / pencilRadius;
      const wearAmount = (1 - centerDist) * 0.002 + wearPattern;
      eraserPositions.setY(i, y - wearAmount);
    }
  }
  eraserGeo.computeVertexNormals();
  
  const eraserMat = new THREE.MeshStandardMaterial({
    color: 0xffb6d6,
    roughness: 0.8
  });
  const eraser = new THREE.Mesh(eraserGeo, eraserMat);
  eraser.rotation.z = Math.PI / 2;
  eraser.position.set(pencilLength * 0.8, 0.004, 0);
  applyShadows(eraser);
  group.add(eraser);
  
  // Metal end cap (holds eraser)
  const capGeo = new THREE.CylinderGeometry(pencilRadius + 0.0002, pencilRadius + 0.0004, 0.002, 12);
  const cap = new THREE.Mesh(capGeo, ferruleMat);
  cap.rotation.z = Math.PI / 2;
  cap.position.set(pencilLength * 0.807, 0.004, 0);
  group.add(cap);
  
  // Sharpened wooden tip (exposed wood)
  const tipWoodGeo = new THREE.ConeGeometry(pencilRadius, 0.015, 6);
  const tipWoodMat = new THREE.MeshStandardMaterial({
    color: 0xd4a574,
    roughness: 0.8
  });
  const tipWood = new THREE.Mesh(tipWoodGeo, tipWoodMat);
  tipWood.rotation.z = -Math.PI / 2;
  tipWood.position.set(0.0075, 0.004, 0);
  applyShadows(tipWood);
  group.add(tipWood);
  
  // Graphite core (black, very sharp point)
  const graphiteGeo = new THREE.ConeGeometry(0.0008, 0.008, 8);
  const graphiteMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.7
  });
  const graphite = new THREE.Mesh(graphiteGeo, graphiteMat);
  graphite.rotation.z = -Math.PI / 2;
  graphite.position.set(0.004, 0.004, 0);
  applyShadows(graphite);
  group.add(graphite);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createPencil.metadata = {
  category: 'school',
  name: 'Pencil',
  description: 'Yellow #2 pencil with hexagonal body, metal ferrule, and pink eraser',
  dimensions: { width: 0.19, height: 0.008, depth: 0.008 },
  interactive: false
};

/**
 * Create scissors with incredible detail
 * BLOCKING: Two blade halves -> Pivot screw -> Finger loops -> Sharp cutting edges
 * TECHNIQUES: Beveled blades, metallic materials, ergonomic loops
 */
function createScissors(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    roughness: 0.2,
    metalness: 0.95
  });
  
  const plasticMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0x4488ff,
    roughness: 0.6
  });
  
  // Left blade (upper position)
  const leftBladeGeo = new THREE.BoxGeometry(0.08, 0.015, 0.001, 8, 4, 1);
  const leftBladePositions = leftBladeGeo.attributes.position;
  
  // Taper blade to point and add bevel
  for (let i = 0; i < leftBladePositions.count; i++) {
    const x = leftBladePositions.getX(i);
    const y = leftBladePositions.getY(i);
    const z = leftBladePositions.getZ(i);
    
    // Taper to point
    const normalizedX = (x / 0.08) + 0.5; // 0 to 1
    const taperFactor = 1 - Math.pow(normalizedX, 2) * 0.8;
    leftBladePositions.setY(i, y * taperFactor);
    
    // Bevel the cutting edge
    if (y < -0.006 && z < 0) {
      const bevelAmount = Math.abs(y + 0.006) * 0.3;
      leftBladePositions.setZ(i, z - bevelAmount);
    }
  }
  leftBladeGeo.computeVertexNormals();
  
  const leftBlade = new THREE.Mesh(leftBladeGeo, metalMat);
  leftBlade.position.set(0.05, 0.002, 0.0015);
  applyShadows(leftBlade);
  group.add(leftBlade);
  
  // Right blade (lower position, mirrored)
  const rightBladeGeo = new THREE.BoxGeometry(0.08, 0.015, 0.001, 8, 4, 1);
  const rightBladePositions = rightBladeGeo.attributes.position;
  
  for (let i = 0; i < rightBladePositions.count; i++) {
    const x = rightBladePositions.getX(i);
    const y = rightBladePositions.getY(i);
    const z = rightBladePositions.getZ(i);
    
    const normalizedX = (x / 0.08) + 0.5;
    const taperFactor = 1 - Math.pow(normalizedX, 2) * 0.8;
    rightBladePositions.setY(i, y * taperFactor);
    
    if (y > 0.006 && z > 0) {
      const bevelAmount = Math.abs(y - 0.006) * 0.3;
      rightBladePositions.setZ(i, z + bevelAmount);
    }
  }
  rightBladeGeo.computeVertexNormals();
  
  const rightBlade = new THREE.Mesh(rightBladeGeo, metalMat);
  rightBlade.position.set(0.05, -0.002, -0.0015);
  applyShadows(rightBlade);
  group.add(rightBlade);
  
  // Pivot screw (connects the blades)
  const pivotGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.004, 12);
  const pivot = new THREE.Mesh(pivotGeo, metalMat);
  pivot.rotation.x = Math.PI / 2;
  pivot.position.set(0.02, 0, 0);
  applyShadows(pivot);
  group.add(pivot);
  
  // Screw head details (Phillips head)
  const screwHeadGeo = new THREE.CylinderGeometry(0.0035, 0.003, 0.001, 16);
  const screwHead1 = new THREE.Mesh(screwHeadGeo, metalMat);
  screwHead1.rotation.x = Math.PI / 2;
  screwHead1.position.set(0.02, 0, 0.0025);
  group.add(screwHead1);
  
  const screwHead2 = screwHead1.clone();
  screwHead2.position.z = -0.0025;
  group.add(screwHead2);
  
  // Phillips cross on screw head
  const crossGeo = new THREE.BoxGeometry(0.0025, 0.0004, 0.0004);
  const crossMat = new THREE.MeshStandardMaterial({ color: 0x666666 });
  const cross1 = new THREE.Mesh(crossGeo, crossMat);
  cross1.rotation.x = Math.PI / 2;
  cross1.position.set(0.02, 0, 0.003);
  group.add(cross1);
  
  const cross2 = cross1.clone();
  cross2.rotation.y = Math.PI / 2;
  group.add(cross2);
  
  // Left handle loop (upper)
  const leftLoopGeo = new THREE.TorusGeometry(0.015, 0.005, 12, 16, Math.PI * 1.8);
  const leftLoop = new THREE.Mesh(leftLoopGeo, plasticMat);
  leftLoop.rotation.set(0, Math.PI / 2, 0);
  leftLoop.position.set(-0.015, 0.008, 0);
  applyShadows(leftLoop);
  group.add(leftLoop);
  
  // Right handle loop (lower)
  const rightLoopGeo = new THREE.TorusGeometry(0.018, 0.006, 12, 16, Math.PI * 1.8);
  const rightLoop = new THREE.Mesh(rightLoopGeo, plasticMat);
  rightLoop.rotation.set(0, Math.PI / 2, 0);
  rightLoop.position.set(-0.018, -0.01, 0);
  applyShadows(rightLoop);
  group.add(rightLoop);
  
  // Handle connecting pieces
  const leftConnectGeo = new THREE.BoxGeometry(0.025, 0.005, 0.003);
  const leftConnect = new THREE.Mesh(leftConnectGeo, plasticMat);
  leftConnect.position.set(0.0025, 0.005, 0);
  applyShadows(leftConnect);
  group.add(leftConnect);
  
  const rightConnectGeo = new THREE.BoxGeometry(0.03, 0.006, 0.003);
  const rightConnect = new THREE.Mesh(rightConnectGeo, plasticMat);
  rightConnect.position.set(0, -0.006, 0);
  applyShadows(rightConnect);
  group.add(rightConnect);
  
  // Rubber grip inserts (textured)
  for (let side = 0; side < 2; side++) {
    const gripGeo = new THREE.BoxGeometry(0.012, 0.002, 0.0025, 6, 1, 1);
    const gripMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.95
    });
    const grip = new THREE.Mesh(gripMat, gripMat);
    grip.position.set(-0.013, side === 0 ? 0.008 : -0.01, 0);
    group.add(grip);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createScissors.metadata = {
  category: 'school',
  name: 'Scissors',
  description: 'Safety scissors with plastic handles and steel blades',
  dimensions: { width: 0.09, height: 0.035, depth: 0.005 },
  interactive: false
};

// Export all school asset creators
export const creators = {
  teacherdesk: createTeacherDesk,
  teacherchair: createTeacherChair,
  studentdesk: createStudentDesk,
  studentchair: createStudentChair,
  basketballhoop: createBasketballHoop,
  bleachers: createBleachers,
  marblenotebook: createMarbleNotebook,
  compositionnotebook: createMarbleNotebook,
  paperairplane: createPaperAirplane,
  chewedgum: createChewedGum,
  gumwad: createChewedGum,
  globe: createGlobe,
  beaker: createBeaker,
  testtube: createTestTube,
  testtuberack: createTestTubeRack,
  bunsenburner: createBunsenBurner,
  bunsen: createBunsenBurner,
  pencil: createPencil,
  scissors: createScissors
};

