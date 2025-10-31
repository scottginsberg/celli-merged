// ==================== BEVERAGES ASSET CREATORS ====================
// Universal beverage container creation functions

import { createPositionedGroup, applyShadows } from '../asset-context.js';

/**
 * Create a cup asset with enhanced fidelity
 * BLOCKING: Base ring -> Outer wall -> Inner cavity -> Rim -> Handle with connection points
 * TECHNIQUES: Closed geometry (inner/outer walls), ergonomic handle deformation, decorative bands
 */
function createCup(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const cupMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0xffffff,
    roughness: 0.3,
    metalness: 0.1
  });
  
  const accentMat = new THREE.MeshStandardMaterial({
    color: spec.accentColor || (spec.color ? (spec.color * 0.85) : 0xe8e8e8),
    roughness: 0.35,
    metalness: 0.05
  });
  
  // Base ring (foot)
  const baseRingGeo = new THREE.TorusGeometry(0.027, 0.003, 12, 24);
  const baseRing = new THREE.Mesh(baseRingGeo, cupMat);
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = 0.002;
  applyShadows(baseRing);
  group.add(baseRing);
  
  // Bottom surface
  const bottomGeo = new THREE.CircleGeometry(0.025, 24);
  const bottom = new THREE.Mesh(bottomGeo, cupMat);
  bottom.rotation.x = -Math.PI / 2;
  bottom.position.y = 0.003;
  applyShadows(bottom);
  group.add(bottom);
  
  // Outer wall (tapered)
  const outerWallGeo = new THREE.CylinderGeometry(0.037, 0.03, 0.078, 32);
  const outerWall = new THREE.Mesh(outerWallGeo, cupMat);
  outerWall.position.y = 0.042;
  applyShadows(outerWall);
  group.add(outerWall);
  
  // Inner cavity (slightly smaller)
  const innerCavityGeo = new THREE.CylinderGeometry(0.034, 0.028, 0.074, 32);
  const innerCavity = new THREE.Mesh(innerCavityGeo, new THREE.MeshStandardMaterial({
    color: spec.color || 0xffffff,
    roughness: 0.25,
    metalness: 0.1,
    side: THREE.BackSide
  }));
  innerCavity.position.y = 0.041;
  applyShadows(innerCavity);
  group.add(innerCavity);
  
  // Rim (rounded edge)
  const rimGeo = new THREE.TorusGeometry(0.0355, 0.003, 16, 32);
  const rim = new THREE.Mesh(rimGeo, cupMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.081;
  applyShadows(rim);
  group.add(rim);
  
  // Decorative band (colored stripe)
  const bandGeo = new THREE.CylinderGeometry(0.0375, 0.0365, 0.006, 32);
  const band = new THREE.Mesh(bandGeo, accentMat);
  band.position.y = 0.07;
  group.add(band);
  
  // Handle base connection points (where handle attaches)
  const connectionGeo = new THREE.SphereGeometry(0.006, 12, 12);
  const topConnection = new THREE.Mesh(connectionGeo, cupMat);
  topConnection.position.set(0.035, 0.065, 0);
  topConnection.scale.set(0.8, 1, 1.2);
  applyShadows(topConnection);
  group.add(topConnection);
  
  const bottomConnection = new THREE.Mesh(connectionGeo, cupMat);
  bottomConnection.position.set(0.035, 0.03, 0);
  bottomConnection.scale.set(0.8, 1, 1.2);
  applyShadows(bottomConnection);
  group.add(bottomConnection);
  
  // Handle (C-shape with ergonomic thickness variation)
  const handleGeo = new THREE.TorusGeometry(0.022, 0.006, 12, 24, Math.PI * 1.3);
  const handlePositions = handleGeo.attributes.position;
  
  // Vary thickness along handle for ergonomic grip
  for (let i = 0; i < handlePositions.count; i++) {
    const x = handlePositions.getX(i);
    const y = handlePositions.getY(i);
    const z = handlePositions.getZ(i);
    
    // Calculate angle around the torus
    const angle = Math.atan2(z, x);
    const normalizedAngle = (angle + Math.PI) / (Math.PI * 2); // 0 to 1
    
    // Thicken in the middle (where you grip)
    const thicknessFactor = 1 + Math.sin(normalizedAngle * Math.PI * 1.3) * 0.3;
    
    const radius = Math.sqrt(x * x + z * z);
    if (radius > 0.015) { // Only affect outer surface
      const localRadius = Math.sqrt(Math.pow(x - Math.cos(angle) * 0.022, 2) + 
                                     Math.pow(z - Math.sin(angle) * 0.022, 2));
      const localAngle = Math.atan2(y, localRadius);
      const newLocalRadius = localRadius * thicknessFactor;
      
      const centerDist = 0.022;
      handlePositions.setX(i, Math.cos(angle) * centerDist + Math.cos(localAngle) * newLocalRadius * Math.cos(angle));
      handlePositions.setY(i, Math.sin(localAngle) * newLocalRadius);
      handlePositions.setZ(i, Math.sin(angle) * centerDist + Math.cos(localAngle) * newLocalRadius * Math.sin(angle));
    }
  }
  handleGeo.computeVertexNormals();
  
  const handle = new THREE.Mesh(handleGeo, cupMat);
  handle.rotation.set(Math.PI / 2, 0, -Math.PI / 2);
  handle.position.set(0.042, 0.0475, 0);
  applyShadows(handle);
  group.add(handle);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createCup.metadata = {
  category: 'beverages',
  name: 'Cup',
  description: 'Cup with handle',
  dimensions: { width: 0.08, depth: 0.07, height: 0.08 },
  interactive: false
};

/**
 * Create a mug asset with enhanced fidelity
 * BLOCKING: Base ring -> Outer wall -> Inner cavity -> Rim -> Handle with ergonomic grip
 * TECHNIQUES: Closed geometry, vertex deformation for handle comfort, decorative details
 */
function createMug(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const mugMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0x4a4a8a,
    roughness: 0.6
  });
  
  const accentMat = new THREE.MeshStandardMaterial({
    color: spec.accentColor || (spec.color ? (spec.color * 0.8) : 0x3a3a7a),
    roughness: 0.65
  });
  
  // Base ring (foot)
  const baseRingGeo = new THREE.TorusGeometry(0.032, 0.004, 12, 24);
  const baseRing = new THREE.Mesh(baseRingGeo, mugMat);
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = 0.002;
  applyShadows(baseRing);
  group.add(baseRing);
  
  // Bottom surface
  const bottomGeo = new THREE.CircleGeometry(0.03, 24);
  const bottom = new THREE.Mesh(bottomGeo, mugMat);
  bottom.rotation.x = -Math.PI / 2;
  bottom.position.y = 0.003;
  applyShadows(bottom);
  group.add(bottom);
  
  // Outer wall (slightly tapered)
  const outerWallGeo = new THREE.CylinderGeometry(0.042, 0.037, 0.096, 32);
  const outerWall = new THREE.Mesh(outerWallGeo, mugMat);
  outerWall.position.y = 0.051;
  applyShadows(outerWall);
  group.add(outerWall);
  
  // Inner cavity (for realistic mug thickness)
  const innerCavityGeo = new THREE.CylinderGeometry(0.038, 0.034, 0.092, 32);
  const innerCavity = new THREE.Mesh(innerCavityGeo, new THREE.MeshStandardMaterial({
    color: spec.color || 0x4a4a8a,
    roughness: 0.5,
    side: THREE.BackSide
  }));
  innerCavity.position.y = 0.05;
  applyShadows(innerCavity);
  group.add(innerCavity);
  
  // Rim (rounded edge for comfortable drinking)
  const rimGeo = new THREE.TorusGeometry(0.04, 0.004, 16, 32);
  const rim = new THREE.Mesh(rimGeo, mugMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.099;
  applyShadows(rim);
  group.add(rim);
  
  // Decorative bands
  const topBandGeo = new THREE.CylinderGeometry(0.0425, 0.0415, 0.004, 32);
  const topBand = new THREE.Mesh(topBandGeo, accentMat);
  topBand.position.y = 0.09;
  group.add(topBand);
  
  const bottomBandGeo = new THREE.CylinderGeometry(0.038, 0.0375, 0.004, 32);
  const bottomBand = new THREE.Mesh(bottomBandGeo, accentMat);
  bottomBand.position.y = 0.012;
  group.add(bottomBand);
  
  // Handle connection points
  const connectionGeo = new THREE.SphereGeometry(0.008, 12, 12);
  const topConnection = new THREE.Mesh(connectionGeo, mugMat);
  topConnection.position.set(0.04, 0.075, 0);
  topConnection.scale.set(0.7, 1, 1.3);
  applyShadows(topConnection);
  group.add(topConnection);
  
  const bottomConnection = new THREE.Mesh(connectionGeo, mugMat);
  bottomConnection.position.set(0.04, 0.025, 0);
  bottomConnection.scale.set(0.7, 1, 1.3);
  applyShadows(bottomConnection);
  group.add(bottomConnection);
  
  // Handle (D-shaped with ergonomic thickness variation and finger groove)
  const handleGeo = new THREE.TorusGeometry(0.028, 0.009, 16, 24, Math.PI * 1.35);
  const handlePositions = handleGeo.attributes.position;
  
  // Apply ergonomic shaping
  for (let i = 0; i < handlePositions.count; i++) {
    const x = handlePositions.getX(i);
    const y = handlePositions.getY(i);
    const z = handlePositions.getZ(i);
    
    // Calculate position along the handle arc
    const angle = Math.atan2(z, x);
    const normalizedAngle = (angle + Math.PI) / (Math.PI * 2);
    
    // Thicken at grip point (middle of handle)
    const gripFactor = 1 + Math.sin(normalizedAngle * Math.PI * 1.35) * 0.4;
    
    // Add finger groove on inner surface
    const radius = Math.sqrt(x * x + z * z);
    if (radius < 0.025) { // Inner surface
      const grooveFactor = Math.sin(normalizedAngle * Math.PI * 1.35) * -0.003;
      const localAngle = Math.atan2(y, radius - 0.028);
      
      if (Math.abs(y) < 0.004 && normalizedAngle > 0.3 && normalizedAngle < 0.7) {
        // Create subtle groove
        const newRadius = (radius - 0.028) + grooveFactor;
        const centerDist = 0.028;
        const angleToCenter = Math.atan2(z, x);
        handlePositions.setX(i, Math.cos(angleToCenter) * centerDist + Math.cos(localAngle) * newRadius * Math.cos(angleToCenter));
        handlePositions.setZ(i, Math.sin(angleToCenter) * centerDist + Math.cos(localAngle) * newRadius * Math.sin(angleToCenter));
      }
    } else { // Outer surface - apply thickness variation
      const localRadius = Math.sqrt(Math.pow(x - Math.cos(angle) * 0.028, 2) + 
                                     Math.pow(z - Math.sin(angle) * 0.028, 2));
      const localAngle = Math.atan2(y, localRadius);
      const newLocalRadius = localRadius * gripFactor;
      
      const centerDist = 0.028;
      handlePositions.setX(i, Math.cos(angle) * centerDist + Math.cos(localAngle) * newLocalRadius * Math.cos(angle));
      handlePositions.setY(i, Math.sin(localAngle) * newLocalRadius);
      handlePositions.setZ(i, Math.sin(angle) * centerDist + Math.cos(localAngle) * newLocalRadius * Math.sin(angle));
    }
  }
  handleGeo.computeVertexNormals();
  
  const handle = new THREE.Mesh(handleGeo, mugMat);
  handle.rotation.set(Math.PI / 2, 0, -Math.PI / 2);
  handle.rotation.z += -Math.PI / 12; // Slight ergonomic tilt
  handle.position.set(0.05, 0.05, 0);
  applyShadows(handle);
  group.add(handle);
  
  // Optional: Coffee/tea inside mug
  if (spec.filled) {
    const liquidColor = spec.liquidColor || 0x3d2817; // Coffee brown
    const liquidMat = new THREE.MeshStandardMaterial({
      color: liquidColor,
      roughness: 0.2,
      metalness: 0.1
    });
    
    const liquidGeo = new THREE.CylinderGeometry(0.037, 0.035, 0.001, 24);
    const liquid = new THREE.Mesh(liquidGeo, liquidMat);
    liquid.position.y = 0.085;
    group.add(liquid);
    
    // Liquid surface (with slight meniscus)
    const surfaceGeo = new THREE.CircleGeometry(0.037, 24);
    const surface = new THREE.Mesh(surfaceGeo, liquidMat);
    surface.rotation.x = -Math.PI / 2;
    surface.position.y = 0.086;
    group.add(surface);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createMug.metadata = {
  category: 'beverages',
  name: 'Mug',
  description: 'Coffee or tea mug with C-shaped handle',
  dimensions: { width: 0.095, depth: 0.08, height: 0.1 },
  interactive: false
};

/**
 * Create a jar asset
 */
function createJar(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Jar body
  const jarGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.12, 16);
  const jarMat = new THREE.MeshStandardMaterial({
    color: 0xddddff,
    transparent: true,
    opacity: 0.7,
    roughness: 0.1
  });
  const jar = new THREE.Mesh(jarGeo, jarMat);
  jar.position.y = 0.06;
  applyShadows(jar);
  group.add(jar);
  
  // Lid
  const lidGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.015, 16);
  const lidMat = new THREE.MeshStandardMaterial({
    color: 0x8a8a8a,
    roughness: 0.4,
    metalness: 0.6
  });
  const lid = new THREE.Mesh(lidGeo, lidMat);
  lid.position.y = 0.1275;
  applyShadows(lid);
  group.add(lid);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createJar.metadata = {
  category: 'beverages',
  name: 'Jar',
  description: 'Glass jar with metal lid',
  dimensions: { width: 0.08, depth: 0.08, height: 0.135 },
  interactive: false
};

/**
 * Helper: Create a procedural label texture for soda can
 */
function createSodaLabelTexture(THREE, variant = 'cola') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  // Color schemes based on variant
  const schemes = {
    cola: { bg: '#cc0000', stripe: '#000000', text: '#ffffff', name: 'COLA' },
    lemonlime: { bg: '#00cc00', stripe: '#ffff00', text: '#ffffff', name: 'LEMON-LIME' },
    orange: { bg: '#ff6600', stripe: '#ff9933', text: '#ffffff', name: 'ORANGE' },
    default: { bg: '#cc0000', stripe: '#990000', text: '#ffffff', name: 'SODA' }
  };
  
  const scheme = schemes[variant] || schemes.default;
  
  // Background
  ctx.fillStyle = scheme.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Top stripe
  ctx.fillStyle = scheme.stripe;
  ctx.fillRect(0, 20, canvas.width, 40);
  
  // Bottom stripe
  ctx.fillRect(0, canvas.height - 60, canvas.width, 40);
  
  // Faux logo circle
  ctx.fillStyle = scheme.text;
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 60, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner circle detail
  ctx.fillStyle = scheme.bg;
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
  ctx.fill();
  
  // Brand name
  ctx.fillStyle = scheme.text;
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(scheme.name, canvas.width / 2, canvas.height / 2);
  
  // Decorative stars
  for (let i = 0; i < 3; i++) {
    const x = canvas.width / 2 - 70 + i * 70;
    const y = canvas.height / 2;
    ctx.fillStyle = scheme.text;
    ctx.font = '20px Arial';
    ctx.fillText('★', x, y + 50);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Create a soda can asset with stripes and faux logos
 */
function createSodaCan(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const radius = 0.03;
  const height = 0.12;
  const variant = spec.variant || 'cola'; // cola, lemonlime, orange
  
  // Base color from variant
  const variantColors = {
    cola: 0xcc0000,
    lemonlime: 0x00cc00,
    orange: 0xff6600
  };
  const baseColor = spec.color || variantColors[variant] || 0xcc0000;
  
  // Can body with label texture
  const labelTexture = createSodaLabelTexture(THREE, variant);
  const canGeo = new THREE.CylinderGeometry(radius, radius, height, 32);
  const canMat = new THREE.MeshStandardMaterial({
    map: labelTexture,
    roughness: 0.3,
    metalness: 0.8
  });
  const can = new THREE.Mesh(canGeo, canMat);
  can.position.y = height / 2;
  applyShadows(can);
  group.add(can);
  
  // Bottom base (aluminum)
  const bottomGeo = new THREE.CylinderGeometry(radius, radius - 0.005, 0.005, 32);
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.2,
    metalness: 0.9
  });
  const bottom = new THREE.Mesh(bottomGeo, metalMat);
  bottom.position.y = 0.0025;
  applyShadows(bottom);
  group.add(bottom);
  
  // Top rim
  const topGeo = new THREE.CylinderGeometry(radius + 0.002, radius, 0.008, 32);
  const top = new THREE.Mesh(topGeo, metalMat);
  top.position.y = height;
  applyShadows(top);
  group.add(top);
  
  // Pull tab area (slightly inset circle)
  const tabGeo = new THREE.CylinderGeometry(radius * 0.6, radius * 0.6, 0.002, 24);
  const tab = new THREE.Mesh(tabGeo, metalMat);
  tab.position.y = height + 0.009;
  applyShadows(tab);
  group.add(tab);
  
  // Pull tab ring
  const ringGeo = new THREE.TorusGeometry(0.008, 0.002, 8, 16);
  const ring = new THREE.Mesh(ringGeo, metalMat);
  ring.position.set(0, height + 0.011, 0.005);
  ring.rotation.x = Math.PI / 2;
  applyShadows(ring);
  group.add(ring);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  
  return context.addObject(group);
}

createSodaCan.metadata = {
  category: 'beverages',
  name: 'Soda Can',
  description: 'Aluminum soda/beverage can with customizable variant',
  dimensions: { width: 0.06, depth: 0.06, height: 0.12 },
  interactive: false
};

/**
 * Create a cola can (red variant)
 */
function createColaCan(spec, THREE, context) {
  return createSodaCan({ ...spec, variant: 'cola' }, THREE, context);
}

createColaCan.metadata = {
  category: 'beverages',
  name: 'Cola Can',
  description: 'Red cola soda can with logo',
  dimensions: { width: 0.06, depth: 0.06, height: 0.12 },
  interactive: false
};

/**
 * Create a lemon-lime can (green variant)
 */
function createLemonLimeCan(spec, THREE, context) {
  return createSodaCan({ ...spec, variant: 'lemonlime' }, THREE, context);
}

createLemonLimeCan.metadata = {
  category: 'beverages',
  name: 'Lemon-Lime Can',
  description: 'Green lemon-lime soda can with logo',
  dimensions: { width: 0.06, depth: 0.06, height: 0.12 },
  interactive: false
};

/**
 * Create an orange can (orange variant)
 */
function createOrangeCan(spec, THREE, context) {
  return createSodaCan({ ...spec, variant: 'orange' }, THREE, context);
}

createOrangeCan.metadata = {
  category: 'beverages',
  name: 'Orange Can',
  description: 'Orange soda can with logo',
  dimensions: { width: 0.06, depth: 0.06, height: 0.12 },
  interactive: false
};

/**
 * Create a milk carton asset with enhanced fidelity
 * BLOCKING: Base -> Main body -> Gabled roof (4 triangular faces) -> Spout -> Cap
 * TECHNIQUES: Precise gabled top geometry, creases, layered spout construction
 */
function createMilkCarton(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const cartonMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0xffffff,
    roughness: 0.8
  });
  
  const creaseColor = spec.color ? (spec.color * 0.8) : 0xe8e8e8;
  const creaseMat = new THREE.MeshStandardMaterial({
    color: creaseColor,
    roughness: 0.85
  });
  
  // Base footing
  const baseGeo = new THREE.BoxGeometry(0.071, 0.003, 0.071);
  const base = new THREE.Mesh(baseGeo, cartonMat);
  base.position.y = 0.0015;
  applyShadows(base);
  group.add(base);
  
  // Main carton body (slightly tapered for realism)
  const bodyGeo = new THREE.BoxGeometry(0.07, 0.13, 0.07, 8, 16, 8);
  const bodyPositions = bodyGeo.attributes.position;
  
  // Add subtle taper (wider at bottom)
  for (let i = 0; i < bodyPositions.count; i++) {
    const y = bodyPositions.getY(i);
    const normalizedY = y / 0.13;
    
    const taperFactor = 1 + (normalizedY * -0.02); // Slight taper
    const x = bodyPositions.getX(i);
    const z = bodyPositions.getZ(i);
    
    bodyPositions.setX(i, x * taperFactor);
    bodyPositions.setZ(i, z * taperFactor);
  }
  bodyGeo.computeVertexNormals();
  
  const body = new THREE.Mesh(bodyGeo, cartonMat);
  body.position.y = 0.068;
  applyShadows(body);
  group.add(body);
  
  // Vertical creases (corners)
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const creaseGeo = new THREE.BoxGeometry(0.0015, 0.13, 0.001);
    const crease = new THREE.Mesh(creaseGeo, creaseMat);
    const radius = 0.0495; // Slight distance from corner
    crease.position.set(
      Math.cos(angle + Math.PI / 4) * radius,
      0.068,
      Math.sin(angle + Math.PI / 4) * radius
    );
    crease.rotation.y = angle + Math.PI / 4;
    group.add(crease);
  }
  
  // Gabled top (pitched roof) - Front triangle
  const gabledTopHeight = 0.04;
  const gabledWidth = 0.07;
  const gabledDepth = 0.07;
  
  // Front gable face
  const frontGableGeo = new THREE.BufferGeometry();
  const frontVertices = new Float32Array([
    -gabledWidth / 2, 0, 0,          // Bottom left
    gabledWidth / 2, 0, 0,           // Bottom right
    0, gabledTopHeight, 0            // Top peak
  ]);
  frontGableGeo.setAttribute('position', new THREE.BufferAttribute(frontVertices, 3));
  frontGableGeo.computeVertexNormals();
  
  const frontGable = new THREE.Mesh(frontGableGeo, cartonMat);
  frontGable.position.set(0, 0.133, gabledDepth / 2);
  applyShadows(frontGable);
  group.add(frontGable);
  
  // Back gable face
  const backGable = frontGable.clone();
  backGable.rotation.y = Math.PI;
  backGable.position.z = -gabledDepth / 2;
  applyShadows(backGable);
  group.add(backGable);
  
  // Left roof panel
  const leftRoofGeo = new THREE.PlaneGeometry(gabledDepth, Math.sqrt(Math.pow(gabledWidth / 2, 2) + Math.pow(gabledTopHeight, 2)));
  const leftRoof = new THREE.Mesh(leftRoofGeo, cartonMat);
  const roofAngle = Math.atan2(gabledTopHeight, gabledWidth / 2);
  leftRoof.rotation.set(0, -Math.PI / 2, roofAngle);
  leftRoof.position.set(-gabledWidth / 4, 0.133 + gabledTopHeight / 2, 0);
  applyShadows(leftRoof);
  group.add(leftRoof);
  
  // Right roof panel
  const rightRoof = new THREE.Mesh(leftRoofGeo, cartonMat);
  rightRoof.rotation.set(0, Math.PI / 2, -roofAngle);
  rightRoof.position.set(gabledWidth / 4, 0.133 + gabledTopHeight / 2, 0);
  applyShadows(rightRoof);
  group.add(rightRoof);
  
  // Roof crease (peak line)
  const roofCreaseGeo = new THREE.BoxGeometry(0.001, 0.002, gabledDepth + 0.002);
  const roofCrease = new THREE.Mesh(roofCreaseGeo, creaseMat);
  roofCrease.position.set(0, 0.133 + gabledTopHeight, 0);
  group.add(roofCrease);
  
  // Spout base (where it emerges from carton)
  const spoutBaseGeo = new THREE.BoxGeometry(0.025, 0.015, 0.025);
  const spoutBase = new THREE.Mesh(spoutBaseGeo, cartonMat);
  spoutBase.position.set(0.02, 0.133 + gabledTopHeight - 0.005, gabledDepth / 2 - 0.01);
  applyShadows(spoutBase);
  group.add(spoutBase);
  
  // Spout neck (tapered cylinder)
  const spoutNeckGeo = new THREE.CylinderGeometry(0.008, 0.011, 0.018, 12);
  const spoutNeck = new THREE.Mesh(spoutNeckGeo, cartonMat);
  spoutNeck.position.set(0.02, 0.1375 + gabledTopHeight, gabledDepth / 2 - 0.01);
  applyShadows(spoutNeck);
  group.add(spoutNeck);
  
  // Spout threads (small ridges)
  for (let i = 0; i < 3; i++) {
    const threadGeo = new THREE.TorusGeometry(0.009, 0.0008, 6, 12);
    const thread = new THREE.Mesh(threadGeo, creaseMat);
    thread.rotation.x = Math.PI / 2;
    thread.position.set(0.02, 0.131 + gabledTopHeight + i * 0.004, gabledDepth / 2 - 0.01);
    group.add(thread);
  }
  
  // Spout cap (screw-on)
  const capMat = new THREE.MeshStandardMaterial({
    color: spec.capColor || 0xff3333,
    roughness: 0.6
  });
  
  const capGeo = new THREE.CylinderGeometry(0.011, 0.01, 0.012, 16);
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.set(0.02, 0.152 + gabledTopHeight, gabledDepth / 2 - 0.01);
  applyShadows(cap);
  group.add(cap);
  
  // Cap top
  const capTopGeo = new THREE.CylinderGeometry(0.01, 0.011, 0.002, 16);
  const capTop = new THREE.Mesh(capTopGeo, capMat);
  capTop.position.set(0.02, 0.159 + gabledTopHeight, gabledDepth / 2 - 0.01);
  applyShadows(capTop);
  group.add(capTop);
  
  // Cap grip ridges
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const ridgeGeo = new THREE.BoxGeometry(0.0008, 0.011, 0.002);
    const ridge = new THREE.Mesh(ridgeGeo, new THREE.MeshStandardMaterial({
      color: spec.capColor ? (spec.capColor * 0.9) : 0xdd2222,
      roughness: 0.7
    }));
    ridge.position.set(
      0.02 + Math.cos(angle) * 0.0115,
      0.152 + gabledTopHeight,
      gabledDepth / 2 - 0.01 + Math.sin(angle) * 0.0115
    );
    ridge.rotation.y = -angle;
    group.add(ridge);
  }
  
  // Barcode sticker (on side)
  const barcodeGeo = new THREE.PlaneGeometry(0.035, 0.025);
  const barcodeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.4
  });
  const barcode = new THREE.Mesh(barcodeGeo, barcodeMat);
  barcode.position.set(gabledWidth / 2 + 0.0005, 0.04, -0.015);
  barcode.rotation.y = -Math.PI / 2;
  group.add(barcode);
  
  // Barcode lines (simple representation)
  for (let i = 0; i < 12; i++) {
    const lineGeo = new THREE.PlaneGeometry(0.001 + Math.random() * 0.0015, 0.02);
    const lineMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.position.set(
      gabledWidth / 2 + 0.001,
      0.04,
      -0.025 + i * 0.0028
    );
    line.rotation.y = -Math.PI / 2;
    group.add(line);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createMilkCarton.metadata = {
  category: 'beverages',
  name: 'Milk Carton',
  description: 'Milk or juice carton with spout',
  dimensions: { width: 0.07, depth: 0.07, height: 0.17 },
  interactive: false
};

/**
 * Create an orange juice bottle asset with enhanced fidelity
 * BLOCKING: Base ring -> Body -> Shoulder taper -> Neck -> Threads -> Cap -> Label band
 * TECHNIQUES: Tapered cylinders, threaded cap detail, vertex deformation for organic bottle shape
 */
function createOrangeJuice(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const juiceColor = 0xff8800;
  const bottleGlassMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
    roughness: 0.1,
    metalness: 0.05
  });
  
  const juiceMat = new THREE.MeshStandardMaterial({
    color: juiceColor,
    transparent: true,
    opacity: 0.8,
    roughness: 0.2
  });
  
  // Base footing (raised ring)
  const baseRingGeo = new THREE.TorusGeometry(0.033, 0.003, 12, 24);
  const baseRing = new THREE.Mesh(baseRingGeo, bottleGlassMat);
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = 0.002;
  applyShadows(baseRing);
  group.add(baseRing);
  
  // Bottom cap (indented base)
  const bottomCapGeo = new THREE.CylinderGeometry(0.028, 0.03, 0.008, 24);
  const bottomCap = new THREE.Mesh(bottomCapGeo, bottleGlassMat);
  bottomCap.position.y = 0.004;
  applyShadows(bottomCap);
  group.add(bottomCap);
  
  // Main body (slightly organic bulge for realistic juice bottle)
  const bodyGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.11, 32, 8);
  const bodyPositions = bodyGeo.attributes.position;
  
  // Add subtle bulge in middle for realistic plastic bottle shape
  for (let i = 0; i < bodyPositions.count; i++) {
    const y = bodyPositions.getY(i);
    const normalizedY = y / 0.11; // -0.5 to 0.5
    
    // Slight barrel distortion
    const bulgeFactor = (1 - Math.pow(normalizedY * 2, 2)) * 0.002;
    
    const x = bodyPositions.getX(i);
    const z = bodyPositions.getZ(i);
    const radius = Math.sqrt(x * x + z * z);
    
    if (radius > 0) {
      const newRadius = radius + bulgeFactor;
      const scale = newRadius / radius;
      bodyPositions.setX(i, x * scale);
      bodyPositions.setZ(i, z * scale);
    }
  }
  bodyGeo.computeVertexNormals();
  
  const body = new THREE.Mesh(bodyGeo, bottleGlassMat);
  body.position.y = 0.063;
  applyShadows(body);
  group.add(body);
  
  // Label area (embossed band)
  const labelGeo = new THREE.CylinderGeometry(0.0365, 0.0365, 0.06, 32);
  const labelMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.7,
    opacity: 0.9,
    transparent: true
  });
  const label = new THREE.Mesh(labelGeo, labelMat);
  label.position.y = 0.065;
  group.add(label);
  
  // Juice inside (slightly smaller cylinder)
  const juiceGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.095, 24);
  const juice = new THREE.Mesh(juiceGeo, juiceMat);
  juice.position.y = 0.058;
  group.add(juice);
  
  // Juice surface (top, slightly concave)
  const juiceSurfaceGeo = new THREE.CircleGeometry(0.032, 24);
  const juiceSurface = new THREE.Mesh(juiceSurfaceGeo, juiceMat);
  juiceSurface.rotation.x = -Math.PI / 2;
  juiceSurface.position.y = 0.106;
  group.add(juiceSurface);
  
  // Shoulder (taper from body to neck)
  const shoulderGeo = new THREE.CylinderGeometry(0.022, 0.036, 0.025, 24);
  const shoulder = new THREE.Mesh(shoulderGeo, bottleGlassMat);
  shoulder.position.y = 0.1305;
  applyShadows(shoulder);
  group.add(shoulder);
  
  // Neck (narrow cylinder)
  const neckGeo = new THREE.CylinderGeometry(0.018, 0.022, 0.03, 24);
  const neck = new THREE.Mesh(neckGeo, bottleGlassMat);
  neck.position.y = 0.158;
  applyShadows(neck);
  group.add(neck);
  
  // Thread rings (for screw cap)
  const threadMat = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    roughness: 0.4
  });
  
  for (let i = 0; i < 4; i++) {
    const threadGeo = new THREE.TorusGeometry(0.019, 0.0015, 6, 16);
    const thread = new THREE.Mesh(threadGeo, threadMat);
    thread.rotation.x = Math.PI / 2;
    thread.position.y = 0.165 + i * 0.004;
    group.add(thread);
  }
  
  // Neck rim
  const rimGeo = new THREE.TorusGeometry(0.02, 0.002, 12, 24);
  const rim = new THREE.Mesh(rimGeo, bottleGlassMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.182;
  applyShadows(rim);
  group.add(rim);
  
  // Screw cap (detailed with grip ridges)
  const capMat = new THREE.MeshStandardMaterial({
    color: spec.capColor || 0xff6600,
    roughness: 0.7
  });
  
  // Cap main body
  const capGeo = new THREE.CylinderGeometry(0.023, 0.022, 0.02, 32);
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.y = 0.192;
  applyShadows(cap);
  group.add(cap);
  
  // Cap top
  const capTopGeo = new THREE.CylinderGeometry(0.022, 0.023, 0.003, 32);
  const capTop = new THREE.Mesh(capTopGeo, capMat);
  capTop.position.y = 0.2035;
  applyShadows(capTop);
  group.add(capTop);
  
  // Grip ridges on cap (vertical ribs)
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const ridgeGeo = new THREE.BoxGeometry(0.001, 0.018, 0.003);
    const ridge = new THREE.Mesh(ridgeGeo, new THREE.MeshStandardMaterial({
      color: 0xff5500,
      roughness: 0.8
    }));
    ridge.position.set(
      Math.cos(angle) * 0.0235,
      0.192,
      Math.sin(angle) * 0.0235
    );
    ridge.rotation.y = -angle;
    group.add(ridge);
  }
  
  // Tamper-evident ring (around neck below cap)
  const tamperRingGeo = new THREE.TorusGeometry(0.021, 0.001, 8, 24);
  const tamperRing = new THREE.Mesh(tamperRingGeo, new THREE.MeshStandardMaterial({
    color: spec.capColor || 0xff6600,
    roughness: 0.7
  }));
  tamperRing.rotation.x = Math.PI / 2;
  tamperRing.position.y = 0.18;
  group.add(tamperRing);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createOrangeJuice.metadata = {
  category: 'beverages',
  name: 'Orange Juice',
  description: 'Bottle of orange juice',
  dimensions: { width: 0.07, depth: 0.07, height: 0.15 },
  interactive: false
};

// Export all beverages creators
export const creators = {
  cup: createCup,
  mug: createMug,
  jar: createJar,
  sodacan: createSodaCan,
  colacan: createColaCan,
  lemonlimecan: createLemonLimeCan,
  orangecan: createOrangeCan,
  milkcarton: createMilkCarton,
  orangejuice: createOrangeJuice
};




