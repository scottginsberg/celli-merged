// ==================== DECOR ASSET CREATORS ====================
// Universal decorative item creation functions

import { createPositionedGroup, applyShadows } from '../asset-context.js';

/**
 * Create a potted plant asset
 * @param {Object} spec - Asset specification
 * @param {Object} THREE - Three.js library reference
 * @param {Object} context - Context with scene, objects, gridSize
 * @returns {THREE.Group}
 */
function createPlant(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Pot
  const potGeo = new THREE.CylinderGeometry(0.12, 0.10, 0.15, 16);
  const potMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 });
  const pot = new THREE.Mesh(potGeo, potMat);
  pot.position.y = 0.075;
  applyShadows(pot);
  group.add(pot);
  
  // Leaves
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x228b22, roughness: 0.9 });
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const leafGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    const radius = 0.05 + Math.random() * 0.05;
    leaf.position.set(
      Math.cos(angle) * radius,
      0.15 + Math.random() * 0.2,
      Math.sin(angle) * radius
    );
    leaf.scale.set(1, 1.5, 0.5);
    applyShadows(leaf);
    group.add(leaf);
  }
  
  // Position the group
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createPlant.metadata = {
  category: 'decor',
  name: 'Plant',
  description: 'Potted plant with leaves',
  dimensions: { width: 0.24, depth: 0.24, height: 0.4 },
  interactive: false
};

/**
 * Create a rug asset with tassels and multiple detailed styles
 * @param {Object} spec - Asset specification
 * @param {Object} THREE - Three.js library reference
 * @param {Object} context - Context with scene, objects, gridSize
 * @returns {THREE.Group}
 */
function createRug(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = spec.width || 2;
  const depth = spec.depth || 1.5;
  const thickness = 0.015;
  
  // Pattern configurations
  const patterns = {
    modern: { base: 0x2c3e50, accent1: 0xecf0f1, accent2: 0x3498db, style: 'geometric' },
    persian: { base: 0x8b0000, accent1: 0xb8860b, accent2: 0x2f4f4f, style: 'ornate' },
    shag: { base: 0xf5f5dc, accent1: 0xe6e6e6, accent2: 0xffffff, style: 'fluffy' },
    tribal: { base: 0x8b4513, accent1: 0xffd700, accent2: 0x000000, style: 'geometric' },
    moroccan: { base: 0x4a235a, accent1: 0xffffff, accent2: 0xff69b4, style: 'ornate' }
  };
  
  const pattern = spec.pattern || 'modern';
  const config = patterns[pattern] || patterns.modern;
  
  // Base rug
  const rugGeo = new THREE.BoxGeometry(width, thickness, depth);
  const rugMat = new THREE.MeshStandardMaterial({ color: config.base, roughness: 0.95 });
  const rug = new THREE.Mesh(rugGeo, rugMat);
  rug.position.y = thickness / 2;
  applyShadows(rug);
  group.add(rug);
  
  // Style-specific patterns
  if (config.style === 'ornate') {
    // Ornate border (persian/moroccan)
    const borderWidth = Math.min(width * 0.12, 0.15);
    const borderGeo = new THREE.BoxGeometry(width * 0.98, thickness + 0.002, borderWidth);
    const borderMat = new THREE.MeshStandardMaterial({ color: config.accent1, roughness: 0.95 });
    
    // Top and bottom borders
    [-depth / 2 + borderWidth / 2, depth / 2 - borderWidth / 2].forEach(z => {
      const border = new THREE.Mesh(borderGeo, borderMat);
      border.position.set(0, thickness + 0.002, z);
      group.add(border);
    });
    
    // Side borders
    const sideBorderGeo = new THREE.BoxGeometry(borderWidth, thickness + 0.002, depth * 0.76);
    [-width / 2 + borderWidth / 2, width / 2 - borderWidth / 2].forEach(x => {
      const sideBorder = new THREE.Mesh(sideBorderGeo, borderMat);
      sideBorder.position.set(x, thickness + 0.002, 0);
      group.add(sideBorder);
    });
    
    // Center medallion
    const medallionGeo = new THREE.CylinderGeometry(Math.min(width, depth) * 0.15, Math.min(width, depth) * 0.15, thickness + 0.003, 8);
    const medallionMat = new THREE.MeshStandardMaterial({ color: config.accent2, roughness: 0.9 });
    const medallion = new THREE.Mesh(medallionGeo, medallionMat);
    medallion.rotation.x = Math.PI / 2;
    medallion.position.y = thickness + 0.0025;
    group.add(medallion);
  } else if (config.style === 'geometric') {
    // Geometric patterns (modern/tribal)
    const stripCount = 5;
    const stripWidth = width / stripCount;
    
    for (let i = 1; i < stripCount; i++) {
      const stripGeo = new THREE.BoxGeometry(0.02, thickness + 0.001, depth * 0.9);
      const stripMat = new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? config.accent1 : config.accent2, roughness: 0.95 });
      const strip = new THREE.Mesh(stripGeo, stripMat);
      strip.position.set(-width / 2 + i * stripWidth, thickness + 0.001, 0);
      group.add(strip);
    }
    
    // Diagonal accents
    for (let i = 0; i < 3; i++) {
      const diagGeo = new THREE.BoxGeometry(0.03, thickness + 0.002, depth * 0.4);
      const diag = new THREE.Mesh(diagGeo, new THREE.MeshStandardMaterial({ color: config.accent2, roughness: 0.95 }));
      diag.position.set((i - 1) * width * 0.3, thickness + 0.002, 0);
      diag.rotation.y = Math.PI / 6;
      group.add(diag);
    }
  } else if (config.style === 'fluffy') {
    // Shag texture simulation with raised loops
    const loopCount = Math.floor(width * depth * 30);
    for (let i = 0; i < loopCount; i++) {
      const loopGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.015, 6);
      const loopMat = new THREE.MeshStandardMaterial({ 
        color: i % 3 === 0 ? config.base : (i % 3 === 1 ? config.accent1 : config.accent2), 
        roughness: 0.98 
      });
      const loop = new THREE.Mesh(loopGeo, loopMat);
      loop.position.set(
        (Math.random() - 0.5) * width * 0.9,
        thickness + 0.01,
        (Math.random() - 0.5) * depth * 0.9
      );
      loop.rotation.x = Math.PI / 2;
      group.add(loop);
    }
  }
  
  // Tassels on all four edges
  const tasselCount = Math.ceil(width / 0.15);
  const tasselMat = new THREE.MeshStandardMaterial({ color: config.accent1, roughness: 0.9 });
  
  // Top and bottom tassels
  for (let i = 0; i < tasselCount; i++) {
    const xPos = -width / 2 + (i + 0.5) * (width / tasselCount);
    
    [-depth / 2, depth / 2].forEach((zPos, idx) => {
      const tasselGroup = new THREE.Group();
      
      // Tassel strands (5 per tassel)
      for (let j = 0; j < 5; j++) {
        const strandGeo = new THREE.CylinderGeometry(0.002, 0.001, 0.04, 4);
        const strand = new THREE.Mesh(strandGeo, tasselMat);
        strand.position.set(
          (j - 2) * 0.006,
          -0.02,
          idx === 0 ? -0.015 : 0.015
        );
        tasselGroup.add(strand);
      }
      
      // Tassel knot
      const knotGeo = new THREE.SphereGeometry(0.008, 8, 8);
      const knot = new THREE.Mesh(knotGeo, tasselMat);
      knot.position.set(0, 0, idx === 0 ? -0.008 : 0.008);
      tasselGroup.add(knot);
      
      tasselGroup.position.set(xPos, thickness / 2, zPos);
      group.add(tasselGroup);
    });
  }
  
  // Side tassels
  const sideTasselCount = Math.ceil(depth / 0.15);
  for (let i = 0; i < sideTasselCount; i++) {
    const zPos = -depth / 2 + (i + 0.5) * (depth / sideTasselCount);
    
    [-width / 2, width / 2].forEach((xPos, idx) => {
      const tasselGroup = new THREE.Group();
      
      // Tassel strands (5 per tassel)
      for (let j = 0; j < 5; j++) {
        const strandGeo = new THREE.CylinderGeometry(0.002, 0.001, 0.04, 4);
        const strand = new THREE.Mesh(strandGeo, tasselMat);
        strand.position.set(
          idx === 0 ? -0.015 : 0.015,
          -0.02,
          (j - 2) * 0.006
        );
        tasselGroup.add(strand);
      }
      
      // Tassel knot
      const knotGeo = new THREE.SphereGeometry(0.008, 8, 8);
      const knot = new THREE.Mesh(knotGeo, tasselMat);
      knot.position.set(idx === 0 ? -0.008 : 0.008, 0, 0);
      tasselGroup.add(knot);
      
      tasselGroup.position.set(xPos, thickness / 2, zPos);
      group.add(tasselGroup);
    });
  }
  
  // Position the group
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createRug.metadata = {
  category: 'decor',
  name: 'Rug',
  description: 'Area rug with patterns (modern, persian, shag)',
  dimensions: { width: 2, depth: 1.5, height: 0.01 },
  interactive: false
};

/**
 * Generate abstract art texture
 * @returns {THREE.CanvasTexture}
 */
function generateAbstractArt(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Random background
  const hue = Math.random() * 360;
  ctx.fillStyle = `hsl(${hue}, 70%, 85%)`;
  ctx.fillRect(0, 0, 512, 512);
  
  // Random shapes
  const shapeCount = 5 + Math.floor(Math.random() * 10);
  for (let i = 0; i < shapeCount; i++) {
    ctx.fillStyle = `hsla(${Math.random() * 360}, 70%, 50%, 0.7)`;
    const shapeType = Math.floor(Math.random() * 3);
    
    if (shapeType === 0) {
      // Circle
      ctx.beginPath();
      ctx.arc(
        Math.random() * 512,
        Math.random() * 512,
        20 + Math.random() * 120,
        0,
        Math.PI * 2
      );
      ctx.fill();
    } else if (shapeType === 1) {
      // Rectangle
      ctx.fillRect(
        Math.random() * 512,
        Math.random() * 512,
        30 + Math.random() * 160,
        30 + Math.random() * 160
      );
    } else {
      // Triangle
      ctx.beginPath();
      ctx.moveTo(Math.random() * 512, Math.random() * 512);
      ctx.lineTo(Math.random() * 512, Math.random() * 512);
      ctx.lineTo(Math.random() * 512, Math.random() * 512);
      ctx.closePath();
      ctx.fill();
    }
  }
  
  // Random lines/strokes
  ctx.strokeStyle = `hsla(${(hue + 180) % 360}, 60%, 30%, 0.5)`;
  ctx.lineWidth = 2 + Math.random() * 4;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 512, Math.random() * 512);
    ctx.lineTo(Math.random() * 512, Math.random() * 512);
    ctx.stroke();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Create an art frame asset
 * @param {Object} spec - Asset specification
 * @param {Object} THREE - Three.js library reference
 * @param {Object} context - Context with scene, objects, gridSize
 * @returns {THREE.Group}
 */
function createArtFrame(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const sizes = {
    small: { width: 0.3, height: 0.4 },
    medium: { width: 0.5, height: 0.6 },
    large: { width: 0.8, height: 1.0 }
  };
  
  const size = sizes[spec.size || 'medium'];
  const thickness = 0.03;
  const frameWidth = 0.05;
  
  // Canvas with procedural art texture
  const artTexture = generateAbstractArt(THREE);
  const canvasGeo = new THREE.BoxGeometry(size.width, size.height, thickness);
  const canvasMat = new THREE.MeshStandardMaterial({
    map: artTexture,
    roughness: 0.8
  });
  const canvas = new THREE.Mesh(canvasGeo, canvasMat);
  applyShadows(canvas);
  group.add(canvas);
  
  // Frame
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.7 });
  
  // Top and bottom
  const hFrameGeo = new THREE.BoxGeometry(size.width + frameWidth * 2, frameWidth, thickness);
  [size.height / 2 + frameWidth / 2, -size.height / 2 - frameWidth / 2].forEach(y => {
    const hFrame = new THREE.Mesh(hFrameGeo, frameMat);
    hFrame.position.y = y;
    applyShadows(hFrame);
    group.add(hFrame);
  });
  
  // Left and right
  const vFrameGeo = new THREE.BoxGeometry(frameWidth, size.height + frameWidth * 2, thickness);
  [size.width / 2 + frameWidth / 2, -size.width / 2 - frameWidth / 2].forEach(x => {
    const vFrame = new THREE.Mesh(vFrameGeo, frameMat);
    vFrame.position.x = x;
    applyShadows(vFrame);
    group.add(vFrame);
  });
  
  // Position the group
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createArtFrame.metadata = {
  category: 'decor',
  name: 'Art Frame',
  description: 'Framed artwork in small, medium, or large sizes',
  dimensions: { width: 0.5, height: 0.6, depth: 0.03 },
  interactive: false
};

/**
 * Create a floor lamp asset
 * @param {Object} spec - Asset specification
 * @param {Object} THREE - Three.js library reference
 * @param {Object} context - Context with scene, objects, gridSize
 * @returns {THREE.Group}
 */
function createFloorLamp(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const height = 1.6;
  
  // Base
  const baseGeo = new THREE.CylinderGeometry(0.15, 0.18, 0.05, 16);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.6, metalness: 0.4 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.025;
  applyShadows(base);
  group.add(base);
  
  // Pole
  const poleGeo = new THREE.CylinderGeometry(0.015, 0.015, height - 0.3, 8);
  const pole = new THREE.Mesh(poleGeo, baseMat);
  pole.position.y = (height - 0.3) / 2 + 0.05;
  applyShadows(pole);
  group.add(pole);
  
  // Shade
  const shadeGeo = new THREE.CylinderGeometry(0.2, 0.3, 0.3, 16, 1, true);
  const shadeMat = new THREE.MeshStandardMaterial({
    color: 0xf5f5dc,
    roughness: 0.9,
    side: THREE.DoubleSide,
    emissive: spec.lit ? 0xffeecc : 0x000000,
    emissiveIntensity: spec.lit ? 0.3 : 0
  });
  const shade = new THREE.Mesh(shadeGeo, shadeMat);
  shade.position.y = height - 0.15;
  applyShadows(shade);
  group.add(shade);
  
  // Light bulb (if lit)
  if (spec.lit) {
    const bulbGeo = new THREE.SphereGeometry(0.05, 16, 16);
    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xffffcc,
      emissive: 0xffffcc,
      emissiveIntensity: 0.8
    });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.y = height - 0.2;
    group.add(bulb);
    
    // Point light
    const light = new THREE.PointLight(0xffffcc, 0.5, 3);
    light.position.y = height - 0.2;
    group.add(light);
  }
  
  // Position the group
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createFloorLamp.metadata = {
  category: 'decor',
  name: 'Floor Lamp',
  description: 'Standing lamp with shade and optional light',
  dimensions: { width: 0.4, depth: 0.4, height: 1.6 },
  interactive: false
};

/**
 * Create a cactus asset
 * @param {Object} spec - Asset specification
 * @param {Object} THREE - Three.js library reference
 * @param {Object} context - Context with scene, objects, gridSize
 * @returns {THREE.Group}
 */
function createCactus(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  const variant = spec.variant || 'rounded'; // 'rounded', 'forked', 'flower', 'tall'
  
  const cactusMat = new THREE.MeshStandardMaterial({
    color: 0x4a7c4a,
    roughness: 0.9
  });
  
  if (variant === 'rounded') {
    // Round barrel cactus
    const bodyGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const body = new THREE.Mesh(bodyGeo, cactusMat);
    body.scale.set(1, 1.2, 1);
    body.position.y = 0.1;
    applyShadows(body);
    group.add(body);
  } else if (variant === 'forked') {
    // Forked saguaro-style cactus
    const mainGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.3, 12);
    const main = new THREE.Mesh(mainGeo, cactusMat);
    main.position.y = 0.15;
    applyShadows(main);
    group.add(main);
    
    // Arms
    for (let i = 0; i < 2; i++) {
      const armGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.15, 12);
      const arm = new THREE.Mesh(armGeo, cactusMat);
      arm.position.set((i - 0.5) * 0.1, 0.2, 0);
      arm.rotation.z = (i - 0.5) * Math.PI / 6;
      applyShadows(arm);
      group.add(arm);
    }
  } else if (variant === 'flower') {
    // Cactus with flower on top
    const bodyGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.2, 12);
    const body = new THREE.Mesh(bodyGeo, cactusMat);
    body.position.y = 0.1;
    applyShadows(body);
    group.add(body);
    
    // Flower
    const flowerGeo = new THREE.SphereGeometry(0.025, 12, 12);
    const flowerMat = new THREE.MeshStandardMaterial({
      color: 0xff6b9d,
      roughness: 0.6
    });
    const flower = new THREE.Mesh(flowerGeo, flowerMat);
    flower.position.y = 0.225;
    applyShadows(flower);
    group.add(flower);
  } else if (variant === 'tall') {
    // Tall columnar cactus
    const bodyGeo = new THREE.CylinderGeometry(0.04, 0.045, 0.4, 12);
    const body = new THREE.Mesh(bodyGeo, cactusMat);
    body.position.y = 0.2;
    applyShadows(body);
    group.add(body);
  }
  
  // Pot
  const potGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.08, 16);
  const potMat = new THREE.MeshStandardMaterial({
    color: 0x8b4513,
    roughness: 0.8
  });
  const pot = new THREE.Mesh(potGeo, potMat);
  pot.position.y = 0.04;
  applyShadows(pot);
  group.add(pot);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createCactus.metadata = {
  category: 'decor',
  name: 'Cactus',
  description: 'Potted cactus (rounded, forked, flower, or tall variant)',
  dimensions: { width: 0.12, depth: 0.12, height: 0.4 },
  interactive: false
};

/**
 * Create a book asset
 */
function createBook(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = spec.width || 0.15;
  const height = spec.height || 0.2;
  const depth = spec.depth || 0.03;
  
  const colors = [0x8b4513, 0x2c5f2d, 0x4a235a, 0x1f618d, 0x922b21, 0x1c2833];
  const bookColor = spec.color || colors[Math.floor(Math.random() * colors.length)];
  
  // Cover
  const coverGeo = new THREE.BoxGeometry(width, height, depth);
  const coverMat = new THREE.MeshStandardMaterial({ color: bookColor, roughness: 0.8 });
  const cover = new THREE.Mesh(coverGeo, coverMat);
  applyShadows(cover);
  group.add(cover);
  
  // Pages (white edges)
  const pagesGeo = new THREE.BoxGeometry(width * 0.95, height * 0.9, depth * 0.98);
  const pagesMat = new THREE.MeshStandardMaterial({ color: 0xf5f5dc, roughness: 0.95 });
  const pages = new THREE.Mesh(pagesGeo, pagesMat);
  applyShadows(pages);
  group.add(pages);
  
  // Spine detail
  const spineGeo = new THREE.BoxGeometry(0.002, height * 0.6, depth);
  const spineMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.4, metalness: 0.3 });
  const spine = new THREE.Mesh(spineGeo, spineMat);
  spine.position.x = -width / 2 - 0.001;
  group.add(spine);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || height / 2, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  if (spec.tilt) group.rotation.z = spec.tilt;
  
  return context.addObject(group);
}

createBook.metadata = {
  category: 'decor',
  name: 'Book',
  description: 'Single book with cover and pages',
  dimensions: { width: 0.15, depth: 0.03, height: 0.2 },
  interactive: false
};

/**
 * Create a trophy asset
 */
function createTrophy(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 0.9 });
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x2c2c2c, roughness: 0.7 });
  
  // Base
  const baseGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.03, 16);
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.015;
  applyShadows(base);
  group.add(base);
  
  // Plaque on base
  const plaqueGeo = new THREE.BoxGeometry(0.08, 0.002, 0.04);
  const plaqueMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.7 });
  const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
  plaque.position.set(0, 0.031, 0.04);
  plaque.rotation.x = Math.PI / 2;
  group.add(plaque);
  
  // Stem
  const stemGeo = new THREE.CylinderGeometry(0.015, 0.02, 0.08, 12);
  const stem = new THREE.Mesh(stemGeo, goldMat);
  stem.position.y = 0.07;
  applyShadows(stem);
  group.add(stem);
  
  // Cup body
  const cupGeo = new THREE.CylinderGeometry(0.045, 0.035, 0.08, 16);
  const cup = new THREE.Mesh(cupGeo, goldMat);
  cup.position.y = 0.15;
  applyShadows(cup);
  group.add(cup);
  
  // Handles (2) - FIXED: rotated 90° around X
  const handleGeo = new THREE.TorusGeometry(0.025, 0.008, 8, 12, Math.PI);
  [-1, 1].forEach(side => {
    const handle = new THREE.Mesh(handleGeo, goldMat);
    handle.rotation.x = Math.PI / 2; // FIXED: Added 90° X rotation
    handle.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
    handle.rotation.z = Math.PI / 2;
    handle.position.set(side * 0.05, 0.15, 0);
    applyShadows(handle);
    group.add(handle);
  });
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createTrophy.metadata = {
  category: 'decor',
  name: 'Trophy',
  description: 'Gold trophy with handles',
  dimensions: { width: 0.14, depth: 0.09, height: 0.19 },
  interactive: false
};

/**
 * Create a picture frame asset
 */
function createPictureFrame(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = spec.width || 0.3;
  const height = spec.height || 0.4;
  const frameWidth = 0.03;
  const depth = 0.02;
  
  const frameMat = new THREE.MeshStandardMaterial({ color: spec.frameColor || 0x8b6914, roughness: 0.6 });
  const glassMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    roughness: 0.1, 
    metalness: 0.1,
    transparent: true,
    opacity: 0.3
  });
  
  // Frame pieces
  const topFrameGeo = new THREE.BoxGeometry(width + frameWidth * 2, frameWidth, depth);
  const sideFrameGeo = new THREE.BoxGeometry(frameWidth, height, depth);
  
  // Top
  const topFrame = new THREE.Mesh(topFrameGeo, frameMat);
  topFrame.position.y = height / 2 + frameWidth / 2;
  applyShadows(topFrame);
  group.add(topFrame);
  
  // Bottom
  const bottomFrame = topFrame.clone();
  bottomFrame.position.y = -height / 2 - frameWidth / 2;
  applyShadows(bottomFrame);
  group.add(bottomFrame);
  
  // Left
  const leftFrame = new THREE.Mesh(sideFrameGeo, frameMat);
  leftFrame.position.x = -width / 2 - frameWidth / 2;
  applyShadows(leftFrame);
  group.add(leftFrame);
  
  // Right
  const rightFrame = leftFrame.clone();
  rightFrame.position.x = width / 2 + frameWidth / 2;
  applyShadows(rightFrame);
  group.add(rightFrame);
  
  // Glass
  const glassGeo = new THREE.PlaneGeometry(width, height);
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.z = depth / 2;
  group.add(glass);
  
  // Image/photo (random color or pattern)
  const imageColors = [0x87ceeb, 0x90ee90, 0xffb6c1, 0xffe4b5, 0xdda0dd];
  const imageColor = spec.imageColor || imageColors[Math.floor(Math.random() * imageColors.length)];
  const imageGeo = new THREE.PlaneGeometry(width * 0.9, height * 0.9);
  const imageMat = new THREE.MeshStandardMaterial({ color: imageColor, roughness: 0.8 });
  const image = new THREE.Mesh(imageGeo, imageMat);
  image.position.z = depth / 2 - 0.001;
  group.add(image);
  
  // Hanging wire (back)
  const wireGeo = new THREE.CylinderGeometry(0.001, 0.001, width * 0.6, 8);
  const wireMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8 });
  const wire = new THREE.Mesh(wireGeo, wireMat);
  wire.rotation.z = Math.PI / 2;
  wire.position.set(0, height / 2 + 0.02, -depth / 2);
  group.add(wire);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || height / 2 + 0.05, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createPictureFrame.metadata = {
  category: 'decor',
  name: 'Picture Frame',
  description: 'Wall-mounted picture frame',
  dimensions: { width: 0.36, depth: 0.02, height: 0.46 },
  interactive: false
};

/**
 * Create a wall clock asset
 */
function createClock(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const radius = spec.radius || 0.15;
  const depth = 0.05;
  
  // Frame
  const frameGeo = new THREE.CylinderGeometry(radius + 0.02, radius + 0.02, depth, 32);
  const frameMat = new THREE.MeshStandardMaterial({ color: spec.frameColor || 0x2c2c2c, roughness: 0.5, metalness: 0.3 });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.rotation.x = Math.PI / 2;
  applyShadows(frame);
  group.add(frame);
  
  // Face
  const faceGeo = new THREE.CircleGeometry(radius, 32);
  const faceMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
  const face = new THREE.Mesh(faceGeo, faceMat);
  face.position.z = depth / 2 + 0.001;
  group.add(face);
  
  // Hour markers
  const markerMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const markerGeo = new THREE.BoxGeometry(0.008, 0.025, 0.003);
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.set(
      Math.cos(angle) * radius * 0.85,
      Math.sin(angle) * radius * 0.85,
      depth / 2 + 0.002
    );
    marker.rotation.z = angle + Math.PI / 2;
    group.add(marker);
  }
  
  // Hour hand
  const hourGeo = new THREE.BoxGeometry(0.006, radius * 0.5, 0.002);
  const hourMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6 });
  const hourHand = new THREE.Mesh(hourGeo, hourMat);
  hourHand.position.set(0, radius * 0.25, depth / 2 + 0.003);
  hourHand.rotation.z = spec.hourAngle || Math.PI / 4;
  group.add(hourHand);
  
  // Minute hand
  const minuteGeo = new THREE.BoxGeometry(0.004, radius * 0.7, 0.002);
  const minuteHand = new THREE.Mesh(minuteGeo, hourMat);
  minuteHand.position.set(0, radius * 0.35, depth / 2 + 0.004);
  minuteHand.rotation.z = spec.minuteAngle || Math.PI / 6;
  group.add(minuteHand);
  
  // Center pin
  const pinGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.008, 12);
  const pin = new THREE.Mesh(pinGeo, new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 }));
  pin.rotation.x = Math.PI / 2;
  pin.position.z = depth / 2 + 0.005;
  group.add(pin);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 1.5, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createClock.metadata = {
  category: 'decor',
  name: 'Wall Clock',
  description: 'Round wall clock with hour markers',
  dimensions: { width: 0.34, depth: 0.05, height: 0.34 },
  interactive: false
};

/**
 * Create a grandfather clock asset
 */
function createGrandfatherClock(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = 0.5;
  const height = 2.0;
  const depth = 0.3;
  
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a2c1a, roughness: 0.7 });
  const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x2c1a0f, roughness: 0.8 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xb8860b, roughness: 0.3, metalness: 0.8 });
  
  // Base cabinet
  const baseGeo = new THREE.BoxGeometry(width, height * 0.3, depth);
  const base = new THREE.Mesh(baseGeo, woodMat);
  base.position.y = height * 0.15;
  applyShadows(base);
  group.add(base);
  
  // Base door
  const baseDoorGeo = new THREE.BoxGeometry(width * 0.8, height * 0.25, 0.02);
  const baseDoor = new THREE.Mesh(baseDoorGeo, darkWoodMat);
  baseDoor.position.set(0, height * 0.15, depth / 2 + 0.01);
  applyShadows(baseDoor);
  group.add(baseDoor);
  
  // Middle body
  const bodyGeo = new THREE.BoxGeometry(width * 0.9, height * 0.4, depth * 0.9);
  const body = new THREE.Mesh(bodyGeo, woodMat);
  body.position.y = height * 0.5;
  applyShadows(body);
  group.add(body);
  
  // Clock face compartment
  const faceBoxGeo = new THREE.BoxGeometry(width * 0.85, height * 0.35, depth * 0.85);
  const faceBox = new THREE.Mesh(faceBoxGeo, darkWoodMat);
  faceBox.position.set(0, height * 0.5, 0);
  applyShadows(faceBox);
  group.add(faceBox);
  
  // Glass door (for clock face)
  const glassGeo = new THREE.BoxGeometry(width * 0.7, height * 0.3, 0.01);
  const glassMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    transparent: true, 
    opacity: 0.3,
    roughness: 0.1
  });
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.set(0, height * 0.5, depth * 0.45 + 0.01);
  group.add(glass);
  
  // Clock face
  const faceGeo = new THREE.CircleGeometry(width * 0.28, 32);
  const faceMat = new THREE.MeshStandardMaterial({ color: 0xfaf0e6, roughness: 0.6 });
  const face = new THREE.Mesh(faceGeo, faceMat);
  face.position.set(0, height * 0.5, depth * 0.45);
  group.add(face);
  
  // Roman numerals (simplified as markers)
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const markerGeo = new THREE.BoxGeometry(0.008, 0.02, 0.002);
    const marker = new THREE.Mesh(markerGeo, new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
    marker.position.set(
      Math.cos(angle) * width * 0.22,
      height * 0.5 + Math.sin(angle) * width * 0.22,
      depth * 0.45 + 0.001
    );
    marker.rotation.z = angle + Math.PI / 2;
    group.add(marker);
  }
  
  // Clock hands
  const hourGeo = new THREE.BoxGeometry(0.008, width * 0.15, 0.002);
  const hourHand = new THREE.Mesh(hourGeo, brassMat);
  hourHand.position.set(0, height * 0.5 + width * 0.075, depth * 0.45 + 0.002);
  hourHand.rotation.z = -Math.PI / 6;
  group.add(hourHand);
  
  const minuteGeo = new THREE.BoxGeometry(0.006, width * 0.22, 0.002);
  const minuteHand = new THREE.Mesh(minuteGeo, brassMat);
  minuteHand.position.set(0, height * 0.5 + width * 0.11, depth * 0.45 + 0.003);
  minuteHand.rotation.z = Math.PI / 4;
  group.add(minuteHand);
  
  // Pendulum (visible through glass)
  const pendulumRodGeo = new THREE.CylinderGeometry(0.003, 0.003, height * 0.25, 8);
  const pendulumRod = new THREE.Mesh(pendulumRodGeo, brassMat);
  pendulumRod.position.set(0, height * 0.38, 0);
  applyShadows(pendulumRod);
  group.add(pendulumRod);
  
  const pendulumBobGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.06, 16);
  const pendulumBob = new THREE.Mesh(pendulumBobGeo, brassMat);
  pendulumBob.position.set(0, height * 0.25, 0);
  applyShadows(pendulumBob);
  group.add(pendulumBob);
  
  // Top crown/bonnet
  const crownGeo = new THREE.BoxGeometry(width, height * 0.15, depth);
  const crown = new THREE.Mesh(crownGeo, woodMat);
  crown.position.y = height * 0.775;
  applyShadows(crown);
  group.add(crown);
  
  // Decorative finial on top
  const finialGeo = new THREE.ConeGeometry(0.04, 0.12, 8);
  const finial = new THREE.Mesh(finialGeo, brassMat);
  finial.position.y = height * 0.85 + 0.06;
  applyShadows(finial);
  group.add(finial);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createGrandfatherClock.metadata = {
  category: 'decor',
  name: 'Grandfather Clock',
  description: 'Traditional tall pendulum clock',
  dimensions: { width: 0.5, depth: 0.3, height: 2.0 },
  interactive: false
};

/**
 * Create curtains with fabric drape
 */
function createCurtains(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const curtainColor = spec.color || 0x8b4789;
  const width = spec.width || 0.8;
  const height = spec.height || 2.0;
  const panels = 2; // Two curtain panels
  
  // Curtain rod
  const rodGeo = new THREE.CylinderGeometry(0.01, 0.01, width + 0.1, 16);
  const rodMat = new THREE.MeshStandardMaterial({
    color: 0x8b7355,
    roughness: 0.5,
    metalness: 0.6
  });
  const rod = new THREE.Mesh(rodGeo, rodMat);
  rod.rotation.z = Math.PI / 2;
  rod.position.set(width / 2, height, 0);
  applyShadows(rod);
  group.add(rod);
  
  // Rod finials (decorative ends)
  const finialGeo = new THREE.SphereGeometry(0.02, 12, 12);
  const leftFinial = new THREE.Mesh(finialGeo, rodMat);
  leftFinial.position.set(-0.05, height, 0);
  applyShadows(leftFinial);
  group.add(leftFinial);
  
  const rightFinial = new THREE.Mesh(finialGeo, rodMat);
  rightFinial.position.set(width + 0.05, height, 0);
  applyShadows(rightFinial);
  group.add(rightFinial);
  
  // Create fabric material
  const fabricMat = new THREE.MeshStandardMaterial({
    color: curtainColor,
    roughness: 0.9,
    metalness: 0.0,
    side: THREE.DoubleSide
  });
  
  // Create each curtain panel with drape
  const panelWidth = width / 2 - 0.05;
  
  for (let p = 0; p < panels; p++) {
    const panelGroup = new THREE.Group();
    const xOffset = p === 0 ? 0 : width / 2 + 0.05;
    
    // Create curtain panel with vertex deformation for drape
    const curtainGeo = new THREE.PlaneGeometry(panelWidth, height, 20, 30);
    const positions = curtainGeo.attributes.position;
    
    // Add realistic fabric drape using sine waves
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      
      // Normalize coordinates
      const nx = (x + panelWidth / 2) / panelWidth; // 0 to 1
      const ny = (y + height / 2) / height; // 0 to 1
      
      // Multiple wave frequencies for realistic drape
      let drape = 0;
      
      // Large vertical folds
      drape += Math.sin(nx * Math.PI * 6) * 0.02 * (1 - ny * 0.5);
      
      // Medium folds
      drape += Math.sin(nx * Math.PI * 12 + ny * 2) * 0.01 * (1 - ny * 0.3);
      
      // Small wrinkles
      drape += Math.sin(nx * Math.PI * 25 + ny * 5) * 0.005 * (1 - ny * 0.7);
      
      // Gravity effect - more drape at bottom
      const gravityDrape = Math.pow(1 - ny, 2) * 0.03;
      drape += gravityDrape * Math.sin(nx * Math.PI * 8);
      
      // Edge gathering (pulled toward rod mounts)
      const edgeFactor = Math.min(nx, 1 - nx) * 4; // 0 at edges, 1 in center
      const gathering = (1 - Math.min(edgeFactor, 1)) * 0.04 * (1 - ny * 0.8);
      
      positions.setZ(i, z + drape + gathering);
    }
    curtainGeo.computeVertexNormals();
    
    const curtainPanel = new THREE.Mesh(curtainGeo, fabricMat);
    curtainPanel.position.set(xOffset + panelWidth / 2, height / 2, 0.01);
    applyShadows(curtainPanel);
    panelGroup.add(curtainPanel);
    
    // Curtain rings/hooks along the top
    const numRings = 10;
    for (let r = 0; r < numRings; r++) {
      const ringGeo = new THREE.TorusGeometry(0.008, 0.002, 8, 12);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        roughness: 0.3,
        metalness: 0.8
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(
        xOffset + (r / (numRings - 1)) * panelWidth,
        height - 0.01,
        0
      );
      ring.rotation.x = Math.PI / 2;
      panelGroup.add(ring);
    }
    
    group.add(panelGroup);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createCurtains.metadata = {
  category: 'decor',
  name: 'Curtains',
  description: 'Window curtains with realistic fabric drape and rod',
  dimensions: { width: 0.9, height: 2.0, depth: 0.1 },
  interactive: false
};

/**
 * Create sheer curtains (lighter, more translucent)
 */
function createSheerCurtains(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const curtainColor = spec.color || 0xffffff;
  const width = spec.width || 0.8;
  const height = spec.height || 2.0;
  
  // Curtain rod
  const rodGeo = new THREE.CylinderGeometry(0.008, 0.008, width + 0.1, 16);
  const rodMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.3,
    metalness: 0.7
  });
  const rod = new THREE.Mesh(rodGeo, rodMat);
  rod.rotation.z = Math.PI / 2;
  rod.position.set(width / 2, height, 0);
  applyShadows(rod);
  group.add(rod);
  
  // Rod finials
  const finialGeo = new THREE.SphereGeometry(0.015, 12, 12);
  const leftFinial = new THREE.Mesh(finialGeo, rodMat);
  leftFinial.position.set(-0.05, height, 0);
  applyShadows(leftFinial);
  group.add(leftFinial);
  
  const rightFinial = new THREE.Mesh(finialGeo, rodMat);
  rightFinial.position.set(width + 0.05, height, 0);
  applyShadows(rightFinial);
  group.add(rightFinial);
  
  // Sheer fabric material
  const fabricMat = new THREE.MeshStandardMaterial({
    color: curtainColor,
    roughness: 0.95,
    metalness: 0.0,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide
  });
  
  // Single full-width panel with gentle waves
  const curtainGeo = new THREE.PlaneGeometry(width, height, 25, 35);
  const positions = curtainGeo.attributes.position;
  
  // Add gentle flowing drape
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    
    const nx = (x + width / 2) / width;
    const ny = (y + height / 2) / height;
    
    // Gentle waves
    let drape = 0;
    drape += Math.sin(nx * Math.PI * 8) * 0.015 * (1 - ny * 0.6);
    drape += Math.sin(nx * Math.PI * 16 + ny * 3) * 0.008 * (1 - ny * 0.4);
    
    // Light gravity effect
    const gravityDrape = Math.pow(1 - ny, 1.5) * 0.02;
    drape += gravityDrape * Math.sin(nx * Math.PI * 6);
    
    positions.setZ(i, z + drape);
  }
  curtainGeo.computeVertexNormals();
  
  const curtainPanel = new THREE.Mesh(curtainGeo, fabricMat);
  curtainPanel.position.set(width / 2, height / 2, 0.01);
  applyShadows(curtainPanel);
  group.add(curtainPanel);
  
  // Delicate rings
  const numRings = 12;
  for (let r = 0; r < numRings; r++) {
    const ringGeo = new THREE.TorusGeometry(0.006, 0.0015, 8, 12);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      roughness: 0.2,
      metalness: 0.6
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(
      (r / (numRings - 1)) * width,
      height - 0.01,
      0
    );
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createSheerCurtains.metadata = {
  category: 'decor',
  name: 'Sheer Curtains',
  description: 'Translucent sheer curtains with gentle drape',
  dimensions: { width: 0.9, height: 2.0, depth: 0.08 },
  interactive: false
};

// Export all decor creators
export const creators = {
  plant: createPlant,
  rug: createRug,
  artframe: createArtFrame,
  floorlamp: createFloorLamp,
  cactus: createCactus,
  book: createBook,
  trophy: createTrophy,
  pictureframe: createPictureFrame,
  clock: createClock,
  grandfatherclock: createGrandfatherClock,
  curtains: createCurtains,
  sheercurtains: createSheerCurtains
};

