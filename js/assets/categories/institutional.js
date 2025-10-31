// ==================== INSTITUTIONAL ASSET CREATORS ====================
// School, gym, locker room, and institutional furniture
// Context-agnostic - can be used in any application

import { createPositionedGroup, applyShadows } from '../asset-context.js';

/**
 * Create a locker asset
 */
function createLocker(spec, THREE, context) {
  const group = new THREE.Group();
  
  // Dimensions
  const width = 0.3;
  const height = 1.8;
  const depth = 0.45;
  
  // Color variations
  const colors = [0x4a90e2, 0xe74c3c, 0x2ecc71, 0xf39c12, 0x9b59b6, 0x34495e];
  const positionSeed = Math.abs(Math.sin((spec.x || 0) * 12.9898 + (spec.z || 0) * 78.233) * 43758.5453);
  const color = colors[Math.floor(positionSeed * colors.length)];
  
  // Main locker body
  const bodyGeo = new THREE.BoxGeometry(width, height, depth);
  const bodyMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.6, metalness: 0.4 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = height / 2;
  applyShadows(body);
  group.add(body);
  
  // Door (slightly inset)
  const doorGeo = new THREE.BoxGeometry(width - 0.02, height - 0.1, 0.02);
  const doorMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.5, metalness: 0.5 });
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(0, height / 2, depth / 2 + 0.01);
  applyShadows(door);
  group.add(door);
  
  // Handle
  const handleGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.08, 8);
  const handleMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.3, metalness: 0.8 });
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.rotation.z = Math.PI / 2;
  handle.position.set(width / 4, height * 0.6, depth / 2 + 0.03);
  applyShadows(handle);
  group.add(handle);
  
  // Vents (top)
  const ventMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
  for (let i = 0; i < 5; i++) {
    const ventGeo = new THREE.BoxGeometry(width - 0.1, 0.01, 0.005);
    const vent = new THREE.Mesh(ventGeo, ventMat);
    vent.position.set(0, height - 0.2 - i * 0.03, depth / 2 + 0.015);
    group.add(vent);
  }
  
  return group;
}

/**
 * Create a bench asset
 */
function createBench(spec, THREE, context) {
  const group = new THREE.Group();
  
  const length = spec.size === 'long' ? 2.0 : 1.2;
  const width = 0.35;
  const height = 0.45;
  const legHeight = 0.4;
  
  // Seat
  const seatGeo = new THREE.BoxGeometry(length, 0.05, width);
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.7 });
  const seat = new THREE.Mesh(seatGeo, woodMat);
  seat.position.y = legHeight;
  applyShadows(seat);
  group.add(seat);
  
  // Legs (4)
  const legGeo = new THREE.BoxGeometry(0.08, legHeight, 0.08);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.8 });
  
  const positions = [
    [-length / 2 + 0.1, legHeight / 2, -width / 2 + 0.1],
    [-length / 2 + 0.1, legHeight / 2, width / 2 - 0.1],
    [length / 2 - 0.1, legHeight / 2, -width / 2 + 0.1],
    [length / 2 - 0.1, legHeight / 2, width / 2 - 0.1]
  ];
  
  positions.forEach(pos => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(...pos);
    applyShadows(leg);
    group.add(leg);
  });
  
  return group;
}

/**
 * Create gym mat
 */
function createGymMat(spec, THREE, context) {
  const group = new THREE.Group();
  
  const width = 2.0;
  const depth = 1.0;
  const thickness = 0.05;
  
  // Mat colors
  const colors = [0x0066cc, 0xcc0000, 0x00cc00, 0xffaa00];
  const positionSeed = Math.abs(Math.sin((spec.x || 0) * 12.9898 + (spec.z || 0) * 78.233) * 43758.5453);
  const color = colors[Math.floor(positionSeed * colors.length)];
  
  const matGeo = new THREE.BoxGeometry(width, thickness, depth);
  const matMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.8 });
  const mat = new THREE.Mesh(matGeo, matMat);
  mat.position.y = thickness / 2;
  applyShadows(mat);
  group.add(mat);
  
  return group;
}

/**
 * Create basketball hoop
 */
function createBasketballHoop(spec, THREE, context) {
  const group = new THREE.Group();
  
  const poleHeight = 3.0;
  const rimHeight = 3.05;
  
  // Pole
  const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, poleHeight, 16);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.5, metalness: 0.6 });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.y = poleHeight / 2;
  applyShadows(pole);
  group.add(pole);
  
  // Backboard
  const backboardGeo = new THREE.BoxGeometry(1.8, 1.05, 0.05);
  const backboardMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.1 });
  const backboard = new THREE.Mesh(backboardGeo, backboardMat);
  backboard.position.set(0, rimHeight - 0.3, -0.3);
  applyShadows(backboard);
  group.add(backboard);
  
  // Rim (torus)
  const rimGeo = new THREE.TorusGeometry(0.225, 0.015, 16, 32);
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xff6600, roughness: 0.3, metalness: 0.8 });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.set(0, rimHeight, 0);
  applyShadows(rim);
  group.add(rim);
  
  // Net (simplified)
  const netGeo = new THREE.CylinderGeometry(0.2, 0.15, 0.4, 8, 1, true);
  const netMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    roughness: 0.9,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide
  });
  const net = new THREE.Mesh(netGeo, netMat);
  net.position.set(0, rimHeight - 0.2, 0);
  group.add(net);
  
  return group;
}

/**
 * Create chalkboard/whiteboard
 */
function createChalkboard(spec, THREE, context) {
  const group = new THREE.Group();
  
  const width = 3.0;
  const height = 1.2;
  const thickness = 0.05;
  
  const isWhiteboard = spec.variant === 'whiteboard';
  
  // Board
  const boardGeo = new THREE.BoxGeometry(width, height, thickness);
  const boardMat = new THREE.MeshStandardMaterial({ 
    color: isWhiteboard ? 0xffffff : 0x1a3a1a,
    roughness: isWhiteboard ? 0.2 : 0.7
  });
  const board = new THREE.Mesh(boardGeo, boardMat);
  board.position.set(0, 1.5, 0);
  applyShadows(board);
  group.add(board);
  
  // Frame
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6 });
  
  // Top frame
  const topFrameGeo = new THREE.BoxGeometry(width + 0.1, 0.08, 0.08);
  const topFrame = new THREE.Mesh(topFrameGeo, frameMat);
  topFrame.position.set(0, 1.5 + height / 2 + 0.04, 0);
  applyShadows(topFrame);
  group.add(topFrame);
  
  // Bottom tray
  const trayGeo = new THREE.BoxGeometry(width, 0.05, 0.1);
  const tray = new THREE.Mesh(trayGeo, frameMat);
  tray.position.set(0, 1.5 - height / 2 - 0.05, 0.05);
  applyShadows(tray);
  group.add(tray);
  
  return group;
}

/**
 * Create school desk (student desk)
 */
function createSchoolDesk(spec, THREE, context) {
  const group = new THREE.Group();
  
  const width = 0.6;
  const depth = 0.45;
  const height = 0.75;
  
  // Desktop
  const deskGeo = new THREE.BoxGeometry(width, 0.03, depth);
  const deskMat = new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 });
  const desk = new THREE.Mesh(deskGeo, deskMat);
  desk.position.y = height;
  applyShadows(desk);
  group.add(desk);
  
  // Legs (metal frame)
  const legMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.5, metalness: 0.6 });
  
  // Front legs
  const frontLegGeo = new THREE.CylinderGeometry(0.015, 0.015, height, 8);
  const frontLeftLeg = new THREE.Mesh(frontLegGeo, legMat);
  frontLeftLeg.position.set(-width / 2 + 0.05, height / 2, depth / 2 - 0.05);
  applyShadows(frontLeftLeg);
  group.add(frontLeftLeg);
  
  const frontRightLeg = new THREE.Mesh(frontLegGeo, legMat);
  frontRightLeg.position.set(width / 2 - 0.05, height / 2, depth / 2 - 0.05);
  applyShadows(frontRightLeg);
  group.add(frontRightLeg);
  
  // Back legs (angled)
  const backLegGeo = new THREE.CylinderGeometry(0.015, 0.015, height + 0.1, 8);
  const backLeftLeg = new THREE.Mesh(backLegGeo, legMat);
  backLeftLeg.position.set(-width / 2 + 0.05, height / 2 - 0.05, -depth / 2 + 0.15);
  backLeftLeg.rotation.x = -0.1;
  applyShadows(backLeftLeg);
  group.add(backLeftLeg);
  
  const backRightLeg = new THREE.Mesh(backLegGeo, legMat);
  backRightLeg.position.set(width / 2 - 0.05, height / 2 - 0.05, -depth / 2 + 0.15);
  backRightLeg.rotation.x = -0.1;
  applyShadows(backRightLeg);
  group.add(backRightLeg);
  
  // Storage basket (under desk)
  const basketGeo = new THREE.BoxGeometry(width - 0.1, 0.15, depth - 0.1);
  const basketMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.8 });
  const basket = new THREE.Mesh(basketGeo, basketMat);
  basket.position.y = height - 0.25;
  applyShadows(basket);
  group.add(basket);
  
  return group;
}

/**
 * Create water fountain
 */
function createWaterFountain(spec, THREE, context) {
  const group = new THREE.Group();
  
  // Base pedestal
  const baseGeo = new THREE.CylinderGeometry(0.25, 0.3, 1.0, 16);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.6, metalness: 0.3 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.5;
  applyShadows(base);
  group.add(base);
  
  // Bowl
  const bowlGeo = new THREE.CylinderGeometry(0.2, 0.15, 0.15, 16);
  const bowlMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.4, metalness: 0.5 });
  const bowl = new THREE.Mesh(bowlGeo, bowlMat);
  bowl.position.y = 1.0;
  applyShadows(bowl);
  group.add(bowl);
  
  // Spout
  const spoutGeo = new THREE.CylinderGeometry(0.015, 0.02, 0.08, 8);
  const spoutMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.3, metalness: 0.7 });
  const spout = new THREE.Mesh(spoutGeo, spoutMat);
  spout.rotation.x = Math.PI / 4;
  spout.position.set(0, 1.05, 0.1);
  applyShadows(spout);
  group.add(spout);
  
  return group;
}

/**
 * Create teacher's desk
 */
function createTeacherDesk(spec, THREE, context) {
  const group = new THREE.Group();
  
  const width = 1.4;
  const depth = 0.7;
  const height = 0.75;
  
  // Desktop
  const deskGeo = new THREE.BoxGeometry(width, 0.05, depth);
  const deskMat = new THREE.MeshStandardMaterial({ color: 0x8b6f47, roughness: 0.6 });
  const desk = new THREE.Mesh(deskGeo, deskMat);
  desk.position.y = height;
  applyShadows(desk);
  group.add(desk);
  
  // Legs
  const legGeo = new THREE.BoxGeometry(0.08, height, 0.08);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x654321, roughness: 0.7 });
  
  const positions = [
    [-width / 2 + 0.1, height / 2, -depth / 2 + 0.1],
    [-width / 2 + 0.1, height / 2, depth / 2 - 0.1],
    [width / 2 - 0.1, height / 2, -depth / 2 + 0.1],
    [width / 2 - 0.1, height / 2, depth / 2 - 0.1]
  ];
  
  positions.forEach(pos => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(...pos);
    applyShadows(leg);
    group.add(leg);
  });
  
  // Drawers (left side)
  const drawerMat = new THREE.MeshStandardMaterial({ color: 0x7a5c3e, roughness: 0.7 });
  for (let i = 0; i < 3; i++) {
    const drawerGeo = new THREE.BoxGeometry(width * 0.4, 0.12, depth - 0.1);
    const drawer = new THREE.Mesh(drawerGeo, drawerMat);
    drawer.position.set(-width / 4, height - 0.15 - i * 0.2, 0);
    applyShadows(drawer);
    group.add(drawer);
    
    // Drawer handle
    const handleGeo = new THREE.BoxGeometry(0.08, 0.02, 0.02);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.4, metalness: 0.7 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.set(-width / 4, height - 0.15 - i * 0.2, depth / 2 + 0.01);
    group.add(handle);
  }
  
  return group;
}

/**
 * Create filing cabinet
 */
function createFilingCabinet(spec, THREE, context) {
  const group = new THREE.Group();
  
  const width = 0.45;
  const height = 1.3;
  const depth = 0.6;
  
  // Cabinet body
  const bodyGeo = new THREE.BoxGeometry(width, height, depth);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8b8b8b, roughness: 0.5, metalness: 0.5 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = height / 2;
  applyShadows(body);
  group.add(body);
  
  // Drawers (4)
  const drawerMat = new THREE.MeshStandardMaterial({ color: 0x7a7a7a, roughness: 0.6, metalness: 0.4 });
  for (let i = 0; i < 4; i++) {
    const drawerGeo = new THREE.BoxGeometry(width - 0.02, height / 4 - 0.05, 0.02);
    const drawer = new THREE.Mesh(drawerGeo, drawerMat);
    drawer.position.set(0, 0.1 + i * (height / 4), depth / 2 + 0.01);
    applyShadows(drawer);
    group.add(drawer);
    
    // Drawer handle
    const handleGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.08, 8);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.3, metalness: 0.8 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(0, 0.1 + i * (height / 4), depth / 2 + 0.05);
    group.add(handle);
  }
  
  return group;
}

/**
 * Create trophy case
 */
function createTrophyCase(spec, THREE, context) {
  const group = new THREE.Group();
  
  const width = 1.5;
  const height = 2.0;
  const depth = 0.45;
  
  // Case frame
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6 });
  
  // Base
  const baseGeo = new THREE.BoxGeometry(width, 0.1, depth);
  const base = new THREE.Mesh(baseGeo, frameMat);
  base.position.y = 0.05;
  applyShadows(base);
  group.add(base);
  
  // Top
  const top = new THREE.Mesh(baseGeo, frameMat);
  top.position.y = height - 0.05;
  applyShadows(top);
  group.add(top);
  
  // Glass front
  const glassGeo = new THREE.BoxGeometry(width - 0.05, height - 0.2, 0.02);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
    roughness: 0.1,
    metalness: 0.0,
    transmission: 0.9
  });
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.set(0, height / 2, depth / 2);
  group.add(glass);
  
  // Back panel
  const backGeo = new THREE.BoxGeometry(width, height, 0.02);
  const backMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.8 });
  const back = new THREE.Mesh(backGeo, backMat);
  back.position.set(0, height / 2, -depth / 2);
  applyShadows(back);
  group.add(back);
  
  // Shelves
  const shelfGeo = new THREE.BoxGeometry(width - 0.1, 0.02, depth - 0.05);
  const shelfMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.7 });
  for (let i = 1; i < 4; i++) {
    const shelf = new THREE.Mesh(shelfGeo, shelfMat);
    shelf.position.y = i * (height / 4);
    group.add(shelf);
  }
  
  return group;
}

// Export creators
export const creators = {
  locker: createLocker,
  bench: createBench,
  gymmat: createGymMat,
  basketballhoop: createBasketballHoop,
  chalkboard: createChalkboard,
  whiteboard: (spec, THREE, ctx) => createChalkboard({...spec, variant: 'whiteboard'}, THREE, ctx),
  schooldesk: createSchoolDesk,
  waterfountain: createWaterFountain,
  teacherdesk: createTeacherDesk,
  filingcabinet: createFilingCabinet,
  trophycase: createTrophyCase
};

export default creators;



