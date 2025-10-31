// ==================== LIGHTING ASSET CREATORS ====================
// Universal lighting fixture creation functions

import { createPositionedGroup, applyShadows } from '../asset-context.js';

/**
 * Create desk lamp with adjustable arm
 */
function createDeskLamp(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const lampColor = spec.color || 0x2a5ea8;
  
  // Base (weighted, circular)
  const baseGeo = new THREE.CylinderGeometry(0.04, 0.045, 0.008, 32);
  const baseMat = new THREE.MeshStandardMaterial({
    color: lampColor,
    roughness: 0.4,
    metalness: 0.3
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.004;
  applyShadows(base);
  group.add(base);
  
  // Vertical arm (cylindrical) - proper joint connection
  const armLength = 0.15;
  const armGeo = new THREE.CylinderGeometry(0.008, 0.008, armLength, 12);
  const armMat = new THREE.MeshStandardMaterial({
    color: lampColor * 0.9,
    roughness: 0.3,
    metalness: 0.4
  });
  const arm = new THREE.Mesh(armGeo, armMat);
  arm.position.set(0.02, 0.075, 0);
  arm.rotation.z = -0.3;
  applyShadows(arm);
  group.add(arm);
  
  // Calculate tip of rotated vertical arm
  const armTilt = -0.3; // radians
  const tipX = 0.02 + Math.sin(armTilt) * armLength;
  const tipY = 0.075 + Math.cos(armTilt) * armLength;
  
  // Horizontal arm - FIXED: connected to vertical arm tip
  const arm2Length = 0.12;
  const arm2Geo = new THREE.CylinderGeometry(0.007, 0.007, arm2Length, 12);
  const arm2 = new THREE.Mesh(arm2Geo, armMat);
  arm2.position.set(tipX, tipY, 0); // FIXED: Position at vertical arm tip
  arm2.rotation.z = Math.PI / 2;
  applyShadows(arm2);
  group.add(arm2);
  
  // Calculate lampshade position at tip of horizontal arm
  const shadeX = tipX + arm2Length / 2;
  const shadeY = tipY;
  
  // Lampshade (conical) - FIXED: positioned at horizontal arm tip
  const shadeGeo = new THREE.ConeGeometry(0.04, 0.06, 16, 1, true);
  const shadeMat = new THREE.MeshStandardMaterial({
    color: lampColor,
    roughness: 0.5,
    metalness: 0.2,
    side: THREE.DoubleSide
  });
  const shade = new THREE.Mesh(shadeGeo, shadeMat);
  shade.position.set(shadeX, shadeY - 0.015, 0); // FIXED: At horizontal arm tip
  shade.rotation.z = Math.PI / 6;
  applyShadows(shade);
  group.add(shade);
  
  // Light bulb (visible inside shade) - FIXED: inside lampshade
  const bulbGeo = new THREE.SphereGeometry(0.015, 12, 12);
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xffffcc,
    emissive: 0xffffaa,
    emissiveIntensity: 0.5,
    roughness: 0.1
  });
  const bulb = new THREE.Mesh(bulbGeo, bulbMat);
  bulb.position.set(shadeX, shadeY - 0.04, 0); // FIXED: Inside shade at arm tip
  applyShadows(bulb);
  group.add(bulb);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createDeskLamp.metadata = {
  category: 'lighting',
  name: 'Desk Lamp',
  description: 'Adjustable desk lamp with metal arm',
  dimensions: { width: 0.15, height: 0.15, depth: 0.08 },
  interactive: false
};

/**
 * Create table lamp with fabric shade
 */
function createTableLamp(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const baseColor = spec.color || 0x8b7355;
  
  // Base (wooden or ceramic)
  const baseGeo = new THREE.CylinderGeometry(0.035, 0.05, 0.12, 16);
  const basePositions = baseGeo.attributes.position;
  
  // Add bulge in middle for decorative shape
  for (let i = 0; i < basePositions.count; i++) {
    const y = basePositions.getY(i);
    const x = basePositions.getX(i);
    const z = basePositions.getZ(i);
    const bulge = Math.sin((y / 0.12 + 0.5) * Math.PI) * 0.015;
    const distance = Math.sqrt(x * x + z * z);
    const angle = Math.atan2(z, x);
    const newDistance = distance + bulge;
    basePositions.setX(i, Math.cos(angle) * newDistance);
    basePositions.setZ(i, Math.sin(angle) * newDistance);
  }
  baseGeo.computeVertexNormals();
  
  const baseMat = new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: 0.7,
    metalness: 0.1
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.06;
  applyShadows(base);
  group.add(base);
  
  // Metal neck
  const neckGeo = new THREE.CylinderGeometry(0.008, 0.01, 0.04, 12);
  const neckMat = new THREE.MeshStandardMaterial({
    color: 0xccaa66,
    roughness: 0.3,
    metalness: 0.7
  });
  const neck = new THREE.Mesh(neckGeo, neckMat);
  neck.position.y = 0.14;
  applyShadows(neck);
  group.add(neck);
  
  // Lampshade (drum style with fabric texture)
  const shadeGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.1, 32);
  const shadeMat = new THREE.MeshStandardMaterial({
    color: 0xf5f5dc,
    roughness: 0.9,
    metalness: 0.0,
    side: THREE.DoubleSide
  });
  const shade = new THREE.Mesh(shadeGeo, shadeMat);
  shade.position.y = 0.21;
  applyShadows(shade);
  group.add(shade);
  
  // Shade top rim
  const topRimGeo = new THREE.TorusGeometry(0.08, 0.003, 8, 32);
  const topRim = new THREE.Mesh(topRimGeo, neckMat);
  topRim.rotation.x = Math.PI / 2;
  topRim.position.y = 0.26;
  group.add(topRim);
  
  // Shade bottom rim
  const bottomRim = new THREE.Mesh(topRimGeo, neckMat);
  bottomRim.rotation.x = Math.PI / 2;
  bottomRim.position.y = 0.16;
  group.add(bottomRim);
  
  // Glowing bulb inside
  const bulbGeo = new THREE.SphereGeometry(0.02, 12, 12);
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xffffcc,
    emissive: 0xffffaa,
    emissiveIntensity: 0.6
  });
  const bulb = new THREE.Mesh(bulbGeo, bulbMat);
  bulb.position.y = 0.21;
  applyShadows(bulb);
  group.add(bulb);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createTableLamp.metadata = {
  category: 'lighting',
  name: 'Table Lamp',
  description: 'Classic table lamp with fabric drum shade',
  dimensions: { width: 0.16, height: 0.26, depth: 0.16 },
  interactive: false
};

/**
 * Create lantern (camping/outdoor style)
 */
function createLantern(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const metalColor = spec.color || 0x3a3a3a;
  
  // Base
  const baseGeo = new THREE.CylinderGeometry(0.04, 0.045, 0.01, 16);
  const metalMat = new THREE.MeshStandardMaterial({
    color: metalColor,
    roughness: 0.5,
    metalness: 0.7
  });
  const base = new THREE.Mesh(baseGeo, metalMat);
  base.position.y = 0.005;
  applyShadows(base);
  group.add(base);
  
  // Glass cylinder (glowing)
  const glassGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.12, 16);
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xffffcc,
    emissive: 0xffff88,
    emissiveIntensity: 0.7,
    transparent: true,
    opacity: 0.6,
    roughness: 0.1
  });
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.y = 0.07;
  applyShadows(glass);
  group.add(glass);
  
  // Metal frame (vertical bars)
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const barGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.13, 8);
    const bar = new THREE.Mesh(barGeo, metalMat);
    bar.position.set(
      Math.cos(angle) * 0.038,
      0.075,
      Math.sin(angle) * 0.038
    );
    group.add(bar);
  }
  
  // Top cap
  const topGeo = new THREE.CylinderGeometry(0.04, 0.045, 0.01, 16);
  const top = new THREE.Mesh(topGeo, metalMat);
  top.position.y = 0.145;
  applyShadows(top);
  group.add(top);
  
  // Handle (wire)
  const handleCurve = new THREE.EllipseCurve(
    0, 0,
    0.03, 0.04,
    0, Math.PI,
    false,
    0
  );
  const handlePoints = handleCurve.getPoints(20);
  const handleShape = new THREE.Shape(handlePoints);
  const handleGeo = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(
      handlePoints.map(p => new THREE.Vector3(p.x, 0, p.y))
    ),
    20, 0.002, 8, false
  );
  const handle = new THREE.Mesh(handleGeo, metalMat);
  handle.position.y = 0.15;
  handle.rotation.x = Math.PI / 2;
  group.add(handle);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createLantern.metadata = {
  category: 'lighting',
  name: 'Lantern',
  description: 'Camping-style lantern with glass cylinder and metal frame',
  dimensions: { width: 0.09, height: 0.18, depth: 0.09 },
  interactive: false
};

/**
 * Create lava lamp with flowing blobs
 */
function createLavaLamp(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const lavaColor = spec.color || 0xff4444;
  
  // Base
  const baseGeo = new THREE.CylinderGeometry(0.045, 0.05, 0.03, 32);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.3,
    metalness: 0.6
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.015;
  applyShadows(base);
  group.add(base);
  
  // Glass container (slightly conical)
  const glassGeo = new THREE.CylinderGeometry(0.04, 0.035, 0.25, 32);
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x4444ff,
    transparent: true,
    opacity: 0.3,
    roughness: 0.05,
    metalness: 0.1
  });
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.y = 0.155;
  applyShadows(glass);
  group.add(glass);
  
  // Lava blobs (organic shapes using deformed spheres)
  const lavaMat = new THREE.MeshStandardMaterial({
    color: lavaColor,
    emissive: lavaColor,
    emissiveIntensity: 0.4,
    roughness: 0.2,
    metalness: 0.1
  });
  
  // Bottom blob
  const blob1Geo = new THREE.SphereGeometry(0.025, 16, 16);
  const blob1Positions = blob1Geo.attributes.position;
  for (let i = 0; i < blob1Positions.count; i++) {
    const x = blob1Positions.getX(i);
    const y = blob1Positions.getY(i);
    const z = blob1Positions.getZ(i);
    const noise = Math.sin(x * 10) * Math.cos(y * 8) * Math.sin(z * 12) * 0.003;
    blob1Positions.setX(i, x + noise);
    blob1Positions.setY(i, y + noise * 1.5);
    blob1Positions.setZ(i, z + noise);
  }
  blob1Geo.computeVertexNormals();
  const blob1 = new THREE.Mesh(blob1Geo, lavaMat);
  blob1.position.y = 0.08;
  blob1.scale.set(1, 1.3, 1);
  applyShadows(blob1);
  group.add(blob1);
  
  // Middle blob
  const blob2Geo = new THREE.SphereGeometry(0.03, 16, 16);
  const blob2Positions = blob2Geo.attributes.position;
  for (let i = 0; i < blob2Positions.count; i++) {
    const x = blob2Positions.getX(i);
    const y = blob2Positions.getY(i);
    const z = blob2Positions.getZ(i);
    const noise = Math.sin(x * 12) * Math.cos(y * 10) * Math.sin(z * 15) * 0.004;
    blob2Positions.setX(i, x + noise);
    blob2Positions.setY(i, y + noise * 1.2);
    blob2Positions.setZ(i, z + noise);
  }
  blob2Geo.computeVertexNormals();
  const blob2 = new THREE.Mesh(blob2Geo, lavaMat);
  blob2.position.set(0.01, 0.15, -0.01);
  blob2.scale.set(0.9, 1.5, 0.9);
  applyShadows(blob2);
  group.add(blob2);
  
  // Top blob (stretching upward)
  const blob3Geo = new THREE.SphereGeometry(0.022, 16, 16);
  const blob3Positions = blob3Geo.attributes.position;
  for (let i = 0; i < blob3Positions.count; i++) {
    const x = blob3Positions.getX(i);
    const y = blob3Positions.getY(i);
    const z = blob3Positions.getZ(i);
    const noise = Math.sin(x * 15) * Math.cos(y * 12) * Math.sin(z * 10) * 0.003;
    blob3Positions.setX(i, x + noise);
    blob3Positions.setY(i, y + noise);
    blob3Positions.setZ(i, z + noise);
  }
  blob3Geo.computeVertexNormals();
  const blob3 = new THREE.Mesh(blob3Geo, lavaMat);
  blob3.position.set(-0.01, 0.23, 0.01);
  blob3.scale.set(1.1, 1.2, 1.1);
  applyShadows(blob3);
  group.add(blob3);
  
  // Top cap
  const topGeo = new THREE.CylinderGeometry(0.04, 0.045, 0.02, 32);
  const top = new THREE.Mesh(topGeo, baseMat);
  top.position.y = 0.29;
  applyShadows(top);
  group.add(top);
  
  // Finial (decorative top)
  const finialGeo = new THREE.SphereGeometry(0.015, 12, 12);
  const finial = new THREE.Mesh(finialGeo, baseMat);
  finial.position.y = 0.31;
  group.add(finial);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createLavaLamp.metadata = {
  category: 'lighting',
  name: 'Lava Lamp',
  description: 'Retro lava lamp with flowing blobs',
  dimensions: { width: 0.1, height: 0.32, depth: 0.1 },
  interactive: false
};

/**
 * Create ceiling pendant light
 */
function createPendantLight(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const shadeColor = spec.color || 0xeeeeee;
  
  // Ceiling mount
  const mountGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.01, 16);
  const mountMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3,
    metalness: 0.2
  });
  const mount = new THREE.Mesh(mountGeo, mountMat);
  mount.position.y = 0.005;
  applyShadows(mount);
  group.add(mount);
  
  // Wire/cord
  const cordGeo = new THREE.CylinderGeometry(0.001, 0.001, 0.15, 8);
  const cordMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.8
  });
  const cord = new THREE.Mesh(cordGeo, cordMat);
  cord.position.y = 0.085;
  group.add(cord);
  
  // Shade (dome/hemisphere)
  const shadeGeo = new THREE.SphereGeometry(0.08, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const shadeMat = new THREE.MeshStandardMaterial({
    color: shadeColor,
    roughness: 0.6,
    metalness: 0.1,
    side: THREE.DoubleSide
  });
  const shade = new THREE.Mesh(shadeGeo, shadeMat);
  shade.position.y = 0.16;
  shade.rotation.x = Math.PI;
  applyShadows(shade);
  group.add(shade);
  
  // Rim
  const rimGeo = new THREE.TorusGeometry(0.08, 0.003, 8, 32);
  const rimMat = new THREE.MeshStandardMaterial({
    color: shadeColor * 0.8,
    roughness: 0.4,
    metalness: 0.3
  });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.16;
  group.add(rim);
  
  // Bulb (visible from below)
  const bulbGeo = new THREE.SphereGeometry(0.025, 12, 12);
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xffffcc,
    emissive: 0xffffaa,
    emissiveIntensity: 0.8
  });
  const bulb = new THREE.Mesh(bulbGeo, bulbMat);
  bulb.position.y = 0.145;
  applyShadows(bulb);
  group.add(bulb);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createPendantLight.metadata = {
  category: 'lighting',
  name: 'Pendant Light',
  description: 'Hanging pendant light with dome shade',
  dimensions: { width: 0.16, height: 0.17, depth: 0.16 },
  interactive: false
};

/**
 * Create chandelier with multiple arms
 */
function createChandelier(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const metalColor = spec.color || 0xccaa66;
  
  // Ceiling mount/chain
  const chainGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.15, 8);
  const metalMat = new THREE.MeshStandardMaterial({
    color: metalColor,
    roughness: 0.3,
    metalness: 0.8
  });
  const chain = new THREE.Mesh(chainGeo, metalMat);
  chain.position.y = 0.075;
  applyShadows(chain);
  group.add(chain);
  
  // Central body (decorative sphere)
  const bodyGeo = new THREE.SphereGeometry(0.04, 16, 16);
  const body = new THREE.Mesh(bodyGeo, metalMat);
  body.position.y = 0.15;
  applyShadows(body);
  group.add(body);
  
  // 6 arms with candles/lights
  const numArms = 6;
  for (let i = 0; i < numArms; i++) {
    const angle = (i / numArms) * Math.PI * 2;
    const armGroup = new THREE.Group();
    
    // Curved arm
    const armGeo = new THREE.CylinderGeometry(0.008, 0.006, 0.15, 8);
    const arm = new THREE.Mesh(armGeo, metalMat);
    arm.rotation.z = Math.PI / 3;
    arm.position.set(0.075, -0.02, 0);
    applyShadows(arm);
    armGroup.add(arm);
    
    // Candle holder cup
    const cupGeo = new THREE.CylinderGeometry(0.015, 0.012, 0.015, 16);
    const cup = new THREE.Mesh(cupGeo, metalMat);
    cup.position.set(0.13, -0.065, 0);
    applyShadows(cup);
    armGroup.add(cup);
    
    // Candle flame (glowing)
    const flameGeo = new THREE.SphereGeometry(0.012, 12, 12);
    flameGeo.scale(1, 1.5, 1);
    const flameMat = new THREE.MeshStandardMaterial({
      color: 0xffffaa,
      emissive: 0xffff44,
      emissiveIntensity: 1.0
    });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(0.13, -0.045, 0);
    applyShadows(flame);
    armGroup.add(flame);
    
    // Crystal drop (decorative)
    const crystalGeo = new THREE.ConeGeometry(0.008, 0.03, 6);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      roughness: 0.05,
      metalness: 0.2
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.set(0.13, -0.095, 0);
    applyShadows(crystal);
    armGroup.add(crystal);
    
    armGroup.position.y = 0.15;
    armGroup.rotation.y = angle;
    group.add(armGroup);
  }
  
  // Central decorative crystals hanging down
  for (let i = 0; i < 3; i++) {
    const crystalGeo = new THREE.ConeGeometry(0.01, 0.05, 6);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      roughness: 0.05,
      metalness: 0.2
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    const angle = (i / 3) * Math.PI * 2;
    crystal.position.set(
      Math.cos(angle) * 0.02,
      0.11 - i * 0.02,
      Math.sin(angle) * 0.02
    );
    applyShadows(crystal);
    group.add(crystal);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createChandelier.metadata = {
  category: 'lighting',
  name: 'Chandelier',
  description: 'Elegant chandelier with 6 arms and crystal drops',
  dimensions: { width: 0.28, height: 0.24, depth: 0.28 },
  interactive: false
};

/**
 * Create ceiling flush mount light
 */
function createCeilingLight(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Ceiling mount plate
  const plateGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.01, 32);
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3,
    metalness: 0.2
  });
  const plate = new THREE.Mesh(plateGeo, plateMat);
  plate.position.y = 0.005;
  applyShadows(plate);
  group.add(plate);
  
  // Glass/frosted dome
  const domeGeo = new THREE.SphereGeometry(0.075, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const domeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffee,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.7,
    roughness: 0.8
  });
  const dome = new THREE.Mesh(domeGeo, domeMat);
  dome.position.y = 0.01;
  applyShadows(dome);
  group.add(dome);
  
  // Decorative ring
  const ringGeo = new THREE.TorusGeometry(0.075, 0.005, 8, 32);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.4,
    metalness: 0.6
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.01;
  group.add(ring);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createCeilingLight.metadata = {
  category: 'lighting',
  name: 'Ceiling Light',
  description: 'Flush mount ceiling light with frosted dome',
  dimensions: { width: 0.16, height: 0.08, depth: 0.16 },
  interactive: false
};

/**
 * Create wall sconce
 */
function createWallSconce(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const metalColor = spec.color || 0xccaa66;
  
  // Wall mounting plate
  const plateGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.01, 16);
  const metalMat = new THREE.MeshStandardMaterial({
    color: metalColor,
    roughness: 0.3,
    metalness: 0.8
  });
  const plate = new THREE.Mesh(plateGeo, metalMat);
  plate.rotation.x = Math.PI / 2;
  plate.position.z = 0.005;
  applyShadows(plate);
  group.add(plate);
  
  // Arm extending from wall
  const armGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.08, 12);
  const arm = new THREE.Mesh(armGeo, metalMat);
  arm.position.set(0, 0, 0.05);
  applyShadows(arm);
  group.add(arm);
  
  // Upward curved section
  const curveGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.06, 12);
  const curve = new THREE.Mesh(curveGeo, metalMat);
  curve.rotation.x = Math.PI / 3;
  curve.position.set(0, 0.025, 0.09);
  applyShadows(curve);
  group.add(curve);
  
  // Glass shade (tulip style)
  const shadeGeo = new THREE.SphereGeometry(0.045, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.5);
  const shadeMat = new THREE.MeshStandardMaterial({
    color: 0xffffee,
    emissive: 0xffffaa,
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.6,
    roughness: 0.2
  });
  const shade = new THREE.Mesh(shadeGeo, shadeMat);
  shade.position.set(0, 0.055, 0.11);
  shade.rotation.x = Math.PI;
  applyShadows(shade);
  group.add(shade);
  
  // Shade rim
  const rimGeo = new THREE.TorusGeometry(0.045, 0.003, 8, 16);
  const rim = new THREE.Mesh(rimGeo, metalMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.set(0, 0.055, 0.11);
  group.add(rim);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createWallSconce.metadata = {
  category: 'lighting',
  name: 'Wall Sconce',
  description: 'Wall-mounted light with glass tulip shade',
  dimensions: { width: 0.1, height: 0.11, depth: 0.15 },
  interactive: false
};

/**
 * Create Edison bulb string lights
 */
function createStringLights(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const numBulbs = spec.count || 5;
  const spacing = 0.15;
  const totalLength = (numBulbs - 1) * spacing;
  
  // Main wire/cord
  const cordGeo = new THREE.CylinderGeometry(0.001, 0.001, totalLength, 8);
  const cordMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.8
  });
  const cord = new THREE.Mesh(cordGeo, cordMat);
  cord.rotation.z = Math.PI / 2;
  cord.position.x = totalLength / 2;
  group.add(cord);
  
  // Bulbs along the wire
  for (let i = 0; i < numBulbs; i++) {
    const bulbGroup = new THREE.Group();
    
    // Socket
    const socketGeo = new THREE.CylinderGeometry(0.012, 0.015, 0.015, 12);
    const socketMat = new THREE.MeshStandardMaterial({
      color: 0x3a3a3a,
      roughness: 0.6,
      metalness: 0.4
    });
    const socket = new THREE.Mesh(socketGeo, socketMat);
    socket.position.y = 0.0075;
    applyShadows(socket);
    bulbGroup.add(socket);
    
    // Edison bulb (visible filament)
    const bulbGeo = new THREE.SphereGeometry(0.02, 12, 12);
    bulbGeo.scale(1, 1.3, 1);
    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xffcc88,
      emissive: 0xffaa44,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1
    });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.y = -0.018;
    applyShadows(bulb);
    bulbGroup.add(bulb);
    
    // Filament (simple vertical line)
    const filamentGeo = new THREE.CylinderGeometry(0.0005, 0.0005, 0.025, 6);
    const filamentMat = new THREE.MeshStandardMaterial({
      color: 0xffff88,
      emissive: 0xffff44,
      emissiveIntensity: 1.0
    });
    const filament = new THREE.Mesh(filamentGeo, filamentMat);
    filament.position.y = -0.018;
    bulbGroup.add(filament);
    
    // Drop wire from main cord
    const dropGeo = new THREE.CylinderGeometry(0.0008, 0.0008, 0.03, 6);
    const drop = new THREE.Mesh(dropGeo, cordMat);
    drop.position.y = 0.03;
    bulbGroup.add(drop);
    
    bulbGroup.position.x = i * spacing;
    bulbGroup.position.y = -0.015;
    group.add(bulbGroup);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createStringLights.metadata = {
  category: 'lighting',
  name: 'String Lights',
  description: 'Edison bulb string lights with visible filaments',
  dimensions: { width: 0.6, height: 0.06, depth: 0.04 },
  interactive: false
};

// Export all lighting creators
export const creators = {
  desklamp: createDeskLamp,
  tablelamp: createTableLamp,
  lantern: createLantern,
  lavalamp: createLavaLamp,
  pendantlight: createPendantLight,
  chandelier: createChandelier,
  ceilinglight: createCeilingLight,
  wallsconce: createWallSconce,
  stringlights: createStringLights
};

