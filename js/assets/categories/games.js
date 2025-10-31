// ==================== GAMES ASSET CREATORS ====================
// Board games, cards, dice, and game pieces

import { createPositionedGroup, applyShadows } from '../asset-context.js';

/**
 * Create playing card asset
 */
function createPlayingCard(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const cardWidth = 0.064;
  const cardHeight = 0.089;
  const cardThickness = 0.001;
  
  // Card body
  const cardGeo = new THREE.BoxGeometry(cardWidth, cardThickness, cardHeight);
  const cardMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.6
  });
  const card = new THREE.Mesh(cardGeo, cardMat);
  card.position.y = cardThickness / 2;
  applyShadows(card);
  group.add(card);
  
  // Card back design (border)
  const borderGeo = new THREE.BoxGeometry(cardWidth * 0.95, cardThickness + 0.0005, cardHeight * 0.95);
  const borderMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0xff0000,
    roughness: 0.5
  });
  const border = new THREE.Mesh(borderGeo, borderMat);
  border.position.y = cardThickness / 2 + 0.0003;
  group.add(border);
  
  // Inner pattern
  const patternGeo = new THREE.BoxGeometry(cardWidth * 0.85, cardThickness + 0.001, cardHeight * 0.85);
  const patternMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.6
  });
  const pattern = new THREE.Mesh(patternGeo, patternMat);
  pattern.position.y = cardThickness / 2 + 0.0006;
  group.add(pattern);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createPlayingCard.metadata = {
  category: 'games',
  name: 'Playing Card',
  description: 'Standard playing card',
  dimensions: { width: 0.064, depth: 0.089, height: 0.001 },
  interactive: false
};

/**
 * Create dice asset
 */
function createDice(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const size = spec.size || 0.016;
  
  // Die body with rounded corners
  const diceGeo = new THREE.BoxGeometry(size, size, size, 4, 4, 4);
  const positions = diceGeo.attributes.position;
  
  // Round corners
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    
    const nx = x / (size / 2);
    const ny = y / (size / 2);
    const nz = z / (size / 2);
    
    const cornerDist = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (cornerDist > 1) {
      const factor = 0.92;
      positions.setX(i, x * factor);
      positions.setY(i, y * factor);
      positions.setZ(i, z * factor);
    }
  }
  diceGeo.computeVertexNormals();
  
  const diceMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0xffffff,
    roughness: 0.4
  });
  const dice = new THREE.Mesh(diceGeo, diceMat);
  dice.position.y = size / 2;
  applyShadows(dice);
  group.add(dice);
  
  // Dots (pips) - simplified representation
  const pipRadius = size * 0.06;
  const pipDepth = size * 0.02;
  const pipMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.8
  });
  
  // Top face - 6 dots (example)
  const pipPositions = [
    [-0.3, 0, -0.3], [-0.3, 0, 0], [-0.3, 0, 0.3],
    [0.3, 0, -0.3], [0.3, 0, 0], [0.3, 0, 0.3]
  ];
  
  pipPositions.forEach(([px, py, pz]) => {
    const pipGeo = new THREE.CylinderGeometry(pipRadius, pipRadius, pipDepth, 8);
    const pip = new THREE.Mesh(pipGeo, pipMat);
    pip.position.set(px * size, size / 2 + pipDepth / 2 + 0.001, pz * size);
    pip.rotation.x = Math.PI / 2;
    group.add(pip);
  });
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.set(
    spec.rotationX || Math.random() * Math.PI,
    spec.rotationY || Math.random() * Math.PI,
    spec.rotationZ || Math.random() * Math.PI
  );
  
  return context.addObject(group);
}

createDice.metadata = {
  category: 'games',
  name: 'Dice',
  description: 'Six-sided die with rounded corners',
  dimensions: { width: 0.016, depth: 0.016, height: 0.016 },
  interactive: false
};

/**
 * Create poker chip asset
 */
function createPokerChip(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const radius = 0.02;
  const thickness = 0.003;
  
  // Main chip body
  const chipGeo = new THREE.CylinderGeometry(radius, radius, thickness, 32);
  const chipMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0xff0000,
    roughness: 0.5,
    metalness: 0.2
  });
  const chip = new THREE.Mesh(chipGeo, chipMat);
  chip.position.y = thickness / 2;
  applyShadows(chip);
  group.add(chip);
  
  // Edge pattern (alternating white stripes)
  const stripeCount = 8;
  const stripeGeo = new THREE.BoxGeometry(0.002, thickness + 0.0005, radius * 0.3);
  const stripeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.6
  });
  
  for (let i = 0; i < stripeCount; i++) {
    const angle = (i / stripeCount) * Math.PI * 2;
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.set(
      Math.cos(angle) * radius * 0.95,
      thickness / 2,
      Math.sin(angle) * radius * 0.95
    );
    stripe.rotation.y = angle;
    group.add(stripe);
  }
  
  // Center circle (value indicator)
  const centerGeo = new THREE.CylinderGeometry(radius * 0.5, radius * 0.5, thickness + 0.001, 32);
  const centerMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.4
  });
  const center = new THREE.Mesh(centerGeo, centerMat);
  center.position.y = thickness / 2;
  group.add(center);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createPokerChip.metadata = {
  category: 'games',
  name: 'Poker Chip',
  description: 'Casino poker chip with edge pattern',
  dimensions: { width: 0.04, depth: 0.04, height: 0.003 },
  interactive: false
};

/**
 * Create game board asset (checkerboard/chessboard)
 */
function createGameBoard(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const boardSize = spec.size || 0.4;
  const squareSize = boardSize / 8;
  const thickness = 0.02;
  
  // Board base
  const baseGeo = new THREE.BoxGeometry(boardSize, thickness, boardSize);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x8b4513,
    roughness: 0.6
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = thickness / 2;
  applyShadows(base);
  group.add(base);
  
  // Checkerboard pattern
  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xf0d9b5,
    roughness: 0.7
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0xb58863,
    roughness: 0.7
  });
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const isLight = (row + col) % 2 === 0;
      const squareGeo = new THREE.BoxGeometry(squareSize, 0.001, squareSize);
      const square = new THREE.Mesh(squareGeo, isLight ? lightMat : darkMat);
      
      const x = -boardSize / 2 + squareSize / 2 + col * squareSize;
      const z = -boardSize / 2 + squareSize / 2 + row * squareSize;
      square.position.set(x, thickness + 0.001, z);
      
      group.add(square);
    }
  }
  
  // Border frame
  const frameThickness = 0.01;
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x3e2723,
    roughness: 0.5
  });
  
  // Four sides
  const frameTop = new THREE.Mesh(
    new THREE.BoxGeometry(boardSize + frameThickness * 2, thickness, frameThickness),
    frameMat
  );
  frameTop.position.set(0, thickness / 2, -boardSize / 2 - frameThickness / 2);
  applyShadows(frameTop);
  group.add(frameTop);
  
  const frameBottom = frameTop.clone();
  frameBottom.position.z = boardSize / 2 + frameThickness / 2;
  applyShadows(frameBottom);
  group.add(frameBottom);
  
  const frameLeft = new THREE.Mesh(
    new THREE.BoxGeometry(frameThickness, thickness, boardSize),
    frameMat
  );
  frameLeft.position.set(-boardSize / 2 - frameThickness / 2, thickness / 2, 0);
  applyShadows(frameLeft);
  group.add(frameLeft);
  
  const frameRight = frameLeft.clone();
  frameRight.position.x = boardSize / 2 + frameThickness / 2;
  applyShadows(frameRight);
  group.add(frameRight);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createGameBoard.metadata = {
  category: 'games',
  name: 'Game Board',
  description: 'Checkerboard/chessboard with frame',
  dimensions: { width: 0.42, depth: 0.42, height: 0.02 },
  interactive: false
};

/**
 * Create chess pawn asset
 */
function createChessPawn(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const pawnMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0xffffff,
    roughness: 0.4,
    metalness: 0.1
  });
  
  // Base
  const baseGeo = new THREE.CylinderGeometry(0.012, 0.015, 0.004, 16);
  const base = new THREE.Mesh(baseGeo, pawnMat);
  base.position.y = 0.002;
  applyShadows(base);
  group.add(base);
  
  // Stem (tapered)
  const stemGeo = new THREE.CylinderGeometry(0.006, 0.009, 0.025, 12);
  const stem = new THREE.Mesh(stemGeo, pawnMat);
  stem.position.y = 0.0165;
  applyShadows(stem);
  group.add(stem);
  
  // Collar
  const collarGeo = new THREE.CylinderGeometry(0.008, 0.006, 0.006, 12);
  const collar = new THREE.Mesh(collarGeo, pawnMat);
  collar.position.y = 0.032;
  applyShadows(collar);
  group.add(collar);
  
  // Head (sphere)
  const headGeo = new THREE.SphereGeometry(0.007, 16, 16);
  const head = new THREE.Mesh(headGeo, pawnMat);
  head.position.y = 0.042;
  applyShadows(head);
  group.add(head);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createChessPawn.metadata = {
  category: 'games',
  name: 'Chess Pawn',
  description: 'Chess pawn game piece',
  dimensions: { width: 0.03, depth: 0.03, height: 0.049 },
  interactive: false
};

/**
 * Create chess board (black and white)
 */
function createChessBoard(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const boardSize = spec.size || 0.4;
  const squareSize = boardSize / 8;
  const thickness = 0.02;
  
  // Board base
  const baseGeo = new THREE.BoxGeometry(boardSize, thickness, boardSize);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x3e2723,
    roughness: 0.6
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = thickness / 2;
  applyShadows(base);
  group.add(base);
  
  // Checkerboard pattern (white and black)
  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xf0f0f0,
    roughness: 0.7
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.7
  });
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const isLight = (row + col) % 2 === 0;
      const squareGeo = new THREE.BoxGeometry(squareSize, 0.001, squareSize);
      const square = new THREE.Mesh(squareGeo, isLight ? lightMat : darkMat);
      
      const x = -boardSize / 2 + squareSize / 2 + col * squareSize;
      const z = -boardSize / 2 + squareSize / 2 + row * squareSize;
      square.position.set(x, thickness + 0.001, z);
      
      group.add(square);
    }
  }
  
  // Border frame
  const frameThickness = 0.01;
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.5
  });
  
  // Four sides
  const frameTop = new THREE.Mesh(
    new THREE.BoxGeometry(boardSize + frameThickness * 2, thickness, frameThickness),
    frameMat
  );
  frameTop.position.set(0, thickness / 2, -boardSize / 2 - frameThickness / 2);
  applyShadows(frameTop);
  group.add(frameTop);
  
  const frameBottom = frameTop.clone();
  frameBottom.position.z = boardSize / 2 + frameThickness / 2;
  applyShadows(frameBottom);
  group.add(frameBottom);
  
  const frameLeft = new THREE.Mesh(
    new THREE.BoxGeometry(frameThickness, thickness, boardSize),
    frameMat
  );
  frameLeft.position.set(-boardSize / 2 - frameThickness / 2, thickness / 2, 0);
  applyShadows(frameLeft);
  group.add(frameLeft);
  
  const frameRight = frameLeft.clone();
  frameRight.position.x = boardSize / 2 + frameThickness / 2;
  applyShadows(frameRight);
  group.add(frameRight);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createChessBoard.metadata = {
  category: 'games',
  name: 'Chess Board',
  description: 'Chess board with black and white squares',
  dimensions: { width: 0.42, depth: 0.42, height: 0.02 },
  interactive: false
};

/**
 * Create checkers board (red and black)
 */
function createCheckersBoard(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const boardSize = spec.size || 0.4;
  const squareSize = boardSize / 8;
  const thickness = 0.02;
  
  // Board base
  const baseGeo = new THREE.BoxGeometry(boardSize, thickness, boardSize);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x6b3410,
    roughness: 0.6
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = thickness / 2;
  applyShadows(base);
  group.add(base);
  
  // Checkerboard pattern (red and black)
  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xcc3333,
    roughness: 0.7
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.7
  });
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const isLight = (row + col) % 2 === 0;
      const squareGeo = new THREE.BoxGeometry(squareSize, 0.001, squareSize);
      const square = new THREE.Mesh(squareGeo, isLight ? lightMat : darkMat);
      
      const x = -boardSize / 2 + squareSize / 2 + col * squareSize;
      const z = -boardSize / 2 + squareSize / 2 + row * squareSize;
      square.position.set(x, thickness + 0.001, z);
      
      group.add(square);
    }
  }
  
  // Border frame
  const frameThickness = 0.01;
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x3e2723,
    roughness: 0.5
  });
  
  // Four sides
  const frameTop = new THREE.Mesh(
    new THREE.BoxGeometry(boardSize + frameThickness * 2, thickness, frameThickness),
    frameMat
  );
  frameTop.position.set(0, thickness / 2, -boardSize / 2 - frameThickness / 2);
  applyShadows(frameTop);
  group.add(frameTop);
  
  const frameBottom = frameTop.clone();
  frameBottom.position.z = boardSize / 2 + frameThickness / 2;
  applyShadows(frameBottom);
  group.add(frameBottom);
  
  const frameLeft = new THREE.Mesh(
    new THREE.BoxGeometry(frameThickness, thickness, boardSize),
    frameMat
  );
  frameLeft.position.set(-boardSize / 2 - frameThickness / 2, thickness / 2, 0);
  applyShadows(frameLeft);
  group.add(frameLeft);
  
  const frameRight = frameLeft.clone();
  frameRight.position.x = boardSize / 2 + frameThickness / 2;
  applyShadows(frameRight);
  group.add(frameRight);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createCheckersBoard.metadata = {
  category: 'games',
  name: 'Checkers Board',
  description: 'Checkers board with red and black squares',
  dimensions: { width: 0.42, depth: 0.42, height: 0.02 },
  interactive: false
};

// Export all game creators
export const creators = {
  playingcard: createPlayingCard,
  dice: createDice,
  pokerchip: createPokerChip,
  gameboard: createGameBoard,
  chessboard: createChessBoard,
  checkersboard: createCheckersBoard,
  chesspawn: createChessPawn
};

