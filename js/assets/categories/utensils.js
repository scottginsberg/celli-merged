// ==================== UTENSILS ASSET CREATORS ====================
// Universal utensil and dinnerware creation functions

import { createPositionedGroup, applyShadows } from '../asset-context.js';

/**
 * Create a fork asset with enhanced fidelity
 * BLOCKING: Handle -> Ferrule -> Shoulders -> Neck -> Prongs with end caps
 * TECHNIQUES: Tapered cylinders, rounded caps, smooth transitions, realistic proportions
 */
function createFork(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    roughness: 0.3,
    metalness: 0.9
  });
  
  // Handle (tapered cylinder with subtle curves)
  const handleGeo = new THREE.CylinderGeometry(0.003, 0.005, 0.11, 16, 8);
  const handlePositions = handleGeo.attributes.position;
  
  // Add subtle ergonomic bulge in middle of handle
  for (let i = 0; i < handlePositions.count; i++) {
    const y = handlePositions.getY(i);
    const normalizedY = y / 0.11;
    const bulgeFactor = Math.sin((normalizedY + 0.5) * Math.PI) * 0.0008; // Gentle curve
    
    const x = handlePositions.getX(i);
    const z = handlePositions.getZ(i);
    const radius = Math.sqrt(x * x + z * z);
    
    if (radius > 0) {
      const newRadius = radius + bulgeFactor;
      const scale = newRadius / radius;
      handlePositions.setX(i, x * scale);
      handlePositions.setZ(i, z * scale);
    }
  }
  handleGeo.computeVertexNormals();
  
  const handle = new THREE.Mesh(handleGeo, metalMat);
  handle.position.y = 0.055;
  applyShadows(handle);
  group.add(handle);
  
  // Handle end cap (rounded sphere)
  const endCapGeo = new THREE.SphereGeometry(0.005, 12, 12);
  const endCap = new THREE.Mesh(endCapGeo, metalMat);
  endCap.scale.set(1, 0.8, 1); // Slightly flattened
  endCap.position.y = 0.001;
  applyShadows(endCap);
  group.add(endCap);
  
  // Decorative ring at handle end
  const ringGeo = new THREE.TorusGeometry(0.0045, 0.0008, 8, 16);
  const ring = new THREE.Mesh(ringGeo, metalMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.008;
  group.add(ring);
  
  // Ferrule (decorative band at handle top)
  const ferruleGeo = new THREE.CylinderGeometry(0.0045, 0.004, 0.008, 16);
  const ferrule = new THREE.Mesh(ferruleGeo, metalMat);
  ferrule.position.y = 0.106;
  applyShadows(ferrule);
  group.add(ferrule);
  
  // Transition neck (smooth taper from handle to fork head)
  const neckGeo = new THREE.CylinderGeometry(0.003, 0.0045, 0.012, 16);
  const neck = new THREE.Mesh(neckGeo, metalMat);
  neck.position.y = 0.116;
  applyShadows(neck);
  group.add(neck);
  
  // Fork shoulders (wider flat section where prongs begin)
  const shouldersGeo = new THREE.BoxGeometry(0.02, 0.012, 0.0015, 4, 3, 1);
  const shouldersPositions = shouldersGeo.attributes.position;
  
  // Rounded shoulder shape (oval)
  for (let i = 0; i < shouldersPositions.count; i++) {
    const y = shouldersPositions.getY(i);
    if (Math.abs(y) > 0.004) { // Round the top/bottom edges
      const x = shouldersPositions.getX(i);
      const roundFactor = Math.abs(y / 0.006) - 0.67;
      if (roundFactor > 0) {
        const reduction = Math.pow(roundFactor, 1.5) * 0.003;
        shouldersPositions.setX(i, x * (1 - reduction));
      }
    }
  }
  shouldersGeo.computeVertexNormals();
  
  const shoulders = new THREE.Mesh(shouldersGeo, metalMat);
  shoulders.position.y = 0.128;
  applyShadows(shoulders);
  group.add(shoulders);
  
  // Prongs (4 tines with realistic taper and rounded tips)
  const prongSpacing = 0.0048;
  const prongLength = 0.033;
  const prongBaseRadius = 0.0013;
  const prongTipRadius = 0.0007;
  
  for (let i = 0; i < 4; i++) {
    const xPos = (i - 1.5) * prongSpacing;
    
    // Main prong shaft (tapered)
    const prongGeo = new THREE.CylinderGeometry(prongTipRadius, prongBaseRadius, prongLength, 12);
    const prong = new THREE.Mesh(prongGeo, metalMat);
    prong.position.set(xPos, 0.1395 + prongLength / 2, 0);
    applyShadows(prong);
    group.add(prong);
    
    // Rounded prong tip (sphere cap)
    const tipGeo = new THREE.SphereGeometry(prongTipRadius, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2);
    const tip = new THREE.Mesh(tipGeo, metalMat);
    tip.position.set(xPos, 0.1395 + prongLength, 0);
    applyShadows(tip);
    group.add(tip);
    
    // Prong base reinforcement (small fillet where prong meets shoulders)
    const filletGeo = new THREE.SphereGeometry(prongBaseRadius * 1.2, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const fillet = new THREE.Mesh(filletGeo, metalMat);
    fillet.rotation.x = Math.PI;
    fillet.scale.y = 0.6; // Flatten for smooth transition
    fillet.position.set(xPos, 0.123, 0);
    group.add(fillet);
  }
  
  // Subtle engraving on shoulders (decorative pattern)
  const engraveGeo = new THREE.TorusGeometry(0.006, 0.0003, 6, 12);
  const engraving = new THREE.Mesh(engraveGeo, new THREE.MeshStandardMaterial({
    color: 0xa0a0a0,
    roughness: 0.4,
    metalness: 0.8
  }));
  engraving.rotation.x = Math.PI / 2;
  engraving.position.y = 0.129;
  group.add(engraving);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createFork.metadata = {
  category: 'utensils',
  name: 'Fork',
  description: 'Metal fork with four prongs',
  dimensions: { width: 0.015, depth: 0.002, height: 0.145 },
  interactive: false
};

/**
 * Create a knife asset
 */
function createKnife(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const handleMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.6
  });
  
  const bladeMat = new THREE.MeshStandardMaterial({
    color: 0xe0e0e0,
    roughness: 0.1,
    metalness: 0.95
  });
  
  // Handle (slightly tapered, ergonomic)
  const handleGeo = new THREE.CylinderGeometry(0.0045, 0.005, 0.08, 12);
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.position.y = 0.04;
  applyShadows(handle);
  group.add(handle);
  
  // Bolster (metal band where blade meets handle)
  const bolsterGeo = new THREE.CylinderGeometry(0.006, 0.005, 0.008, 12);
  const bolster = new THREE.Mesh(bolsterGeo, bladeMat);
  bolster.position.y = 0.084;
  applyShadows(bolster);
  group.add(bolster);
  
  // Blade (tapered toward tip)
  const bladeGeo = new THREE.BoxGeometry(0.018, 0.07, 0.0012);
  const blade = new THREE.Mesh(bladeGeo, bladeMat);
  blade.position.y = 0.123;
  // Taper the blade toward the tip
  blade.scale.set(1, 1, 0.5);
  applyShadows(blade);
  group.add(blade);
  
  // Sharp edge (thin line at bottom)
  const edgeGeo = new THREE.BoxGeometry(0.018, 0.07, 0.0003);
  const edge = new THREE.Mesh(edgeGeo, bladeMat);
  edge.position.y = 0.123;
  applyShadows(edge);
  group.add(edge);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createKnife.metadata = {
  category: 'utensils',
  name: 'Knife',
  description: 'Kitchen knife with blade',
  dimensions: { width: 0.015, depth: 0.001, height: 0.14 },
  interactive: false
};

/**
 * Create a spoon asset with enhanced fidelity
 * BLOCKING: Handle -> Ferrule -> Neck (curved) -> Bowl base -> Bowl cavity -> Bowl rim
 * TECHNIQUES: Vertex deformation for bowl depth, curved neck transition, ergonomic handle bulge
 */
function createSpoon(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    roughness: 0.3,
    metalness: 0.9
  });
  
  // Handle (tapered cylinder with ergonomic bulge)
  const handleGeo = new THREE.CylinderGeometry(0.003, 0.005, 0.11, 16, 8);
  const handlePositions = handleGeo.attributes.position;
  
  // Add subtle ergonomic bulge in middle of handle
  for (let i = 0; i < handlePositions.count; i++) {
    const y = handlePositions.getY(i);
    const normalizedY = y / 0.11;
    const bulgeFactor = Math.sin((normalizedY + 0.5) * Math.PI) * 0.0008;
    
    const x = handlePositions.getX(i);
    const z = handlePositions.getZ(i);
    const radius = Math.sqrt(x * x + z * z);
    
    if (radius > 0) {
      const newRadius = radius + bulgeFactor;
      const scale = newRadius / radius;
      handlePositions.setX(i, x * scale);
      handlePositions.setZ(i, z * scale);
    }
  }
  handleGeo.computeVertexNormals();
  
  const handle = new THREE.Mesh(handleGeo, metalMat);
  handle.position.y = 0.055;
  applyShadows(handle);
  group.add(handle);
  
  // Handle end cap (rounded sphere)
  const endCapGeo = new THREE.SphereGeometry(0.005, 12, 12);
  const endCap = new THREE.Mesh(endCapGeo, metalMat);
  endCap.scale.set(1, 0.8, 1);
  endCap.position.y = 0.001;
  applyShadows(endCap);
  group.add(endCap);
  
  // Decorative ring at handle end
  const ringGeo = new THREE.TorusGeometry(0.0045, 0.0008, 8, 16);
  const ring = new THREE.Mesh(ringGeo, metalMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.008;
  group.add(ring);
  
  // Ferrule (decorative band at handle top)
  const ferruleGeo = new THREE.CylinderGeometry(0.0045, 0.004, 0.008, 16);
  const ferrule = new THREE.Mesh(ferruleGeo, metalMat);
  ferrule.position.y = 0.106;
  applyShadows(ferrule);
  group.add(ferrule);
  
  // Curved neck (smooth S-curve from handle to bowl)
  const neckGeo = new THREE.CylinderGeometry(0.0025, 0.004, 0.018, 16, 12);
  const neckPositions = neckGeo.attributes.position;
  
  // Create smooth curve along neck
  for (let i = 0; i < neckPositions.count; i++) {
    const y = neckPositions.getY(i);
    const normalizedY = (y / 0.018) + 0.5; // 0 to 1
    
    // S-curve: gradually bend forward
    const curveFactor = Math.pow(normalizedY, 2) * 0.008;
    const z = neckPositions.getZ(i);
    neckPositions.setZ(i, z + curveFactor);
  }
  neckGeo.computeVertexNormals();
  
  const neck = new THREE.Mesh(neckGeo, metalMat);
  neck.rotation.x = Math.PI / 12;
  neck.position.set(0, 0.119, 0.002);
  applyShadows(neck);
  group.add(neck);
  
  // Bowl base (solid backing)
  const bowlBaseGeo = new THREE.SphereGeometry(0.0095, 20, 20, 0, Math.PI * 2, 0, Math.PI / 1.8);
  const bowlBase = new THREE.Mesh(bowlBaseGeo, metalMat);
  bowlBase.rotation.x = Math.PI;
  bowlBase.position.set(0, 0.132, 0.011);
  bowlBase.scale.set(1.1, 1, 1.3); // Elongate the bowl
  applyShadows(bowlBase);
  group.add(bowlBase);
  
  // Bowl cavity (inner depression with realistic depth)
  const cavityGeo = new THREE.SphereGeometry(0.008, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2.2);
  const cavityPositions = cavityGeo.attributes.position;
  
  // Deform cavity for realistic spoon bowl depth
  for (let i = 0; i < cavityPositions.count; i++) {
    const y = cavityPositions.getY(i);
    const x = cavityPositions.getX(i);
    const z = cavityPositions.getZ(i);
    const radius = Math.sqrt(x * x + z * z);
    
    // Deeper in center, shallow at edges
    const depthFactor = 1 - (radius / 0.008);
    const extraDepth = Math.pow(depthFactor, 1.5) * 0.002;
    
    cavityPositions.setY(i, y - extraDepth);
  }
  cavityGeo.computeVertexNormals();
  
  const cavity = new THREE.Mesh(cavityGeo, new THREE.MeshStandardMaterial({
    color: 0xb0b0b0,
    roughness: 0.25,
    metalness: 0.9,
    side: THREE.DoubleSide
  }));
  cavity.rotation.x = Math.PI;
  cavity.position.set(0, 0.1315, 0.011);
  cavity.scale.set(1.05, 1, 1.25);
  applyShadows(cavity);
  group.add(cavity);
  
  // Bowl rim (smooth torus edge)
  const rimGeo = new THREE.TorusGeometry(0.0075, 0.0005, 12, 24, Math.PI);
  const rim = new THREE.Mesh(rimGeo, metalMat);
  rim.rotation.x = Math.PI / 2;
  rim.rotation.z = Math.PI / 2;
  rim.position.set(0, 0.1295, 0.011);
  rim.scale.set(1.05, 1, 1.25);
  group.add(rim);
  
  // Bowl tip reinforcement (where bowl meets neck)
  const tipGeo = new THREE.SphereGeometry(0.003, 12, 12);
  const tip = new THREE.Mesh(tipGeo, metalMat);
  tip.scale.set(0.8, 1, 1.2);
  tip.position.set(0, 0.128, 0.004);
  group.add(tip);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createSpoon.metadata = {
  category: 'utensils',
  name: 'Spoon',
  description: 'Metal spoon with bowl',
  dimensions: { width: 0.024, depth: 0.012, height: 0.145 },
  interactive: false
};

/**
 * Create a plate asset with enhanced fidelity
 * BLOCKING: Base ring -> Outer slope -> Well -> Inner slope -> Rim -> Decorative bands
 * TECHNIQUES: Multiple tapered cylinders for realistic plate profile, subtle vertex deformation
 */
function createPlate(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const plateMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0xffffff,
    roughness: 0.4,
    metalness: 0.1
  });
  
  const accentMat = new THREE.MeshStandardMaterial({
    color: spec.color ? (parseInt(spec.color.toString().slice(2), 16) * 0.9) : 0xe8e8e8,
    roughness: 0.45,
    metalness: 0.05
  });
  
  // Base foot ring (what plate rests on)
  const footGeo = new THREE.TorusGeometry(0.06, 0.004, 12, 24);
  const foot = new THREE.Mesh(footGeo, plateMat);
  foot.rotation.x = Math.PI / 2;
  foot.position.y = 0.002;
  applyShadows(foot);
  group.add(foot);
  
  // Bottom surface (slightly concave)
  const bottomGeo = new THREE.CylinderGeometry(0.056, 0.062, 0.002, 32);
  const bottom = new THREE.Mesh(bottomGeo, plateMat);
  bottom.position.y = 0.001;
  applyShadows(bottom);
  group.add(bottom);
  
  // Outer slope (from base to rim)
  const outerSlopeGeo = new THREE.CylinderGeometry(0.115, 0.065, 0.008, 40, 4);
  const outerSlopePositions = outerSlopeGeo.attributes.position;
  
  // Create smooth curved slope (not linear)
  for (let i = 0; i < outerSlopePositions.count; i++) {
    const y = outerSlopePositions.getY(i);
    const normalizedY = (y / 0.008) + 0.5; // 0 at bottom, 1 at top
    
    // Gentle S-curve for realistic plate profile
    const curveFactor = Math.pow(normalizedY, 1.8) * 0.001;
    
    const x = outerSlopePositions.getX(i);
    const z = outerSlopePositions.getZ(i);
    const radius = Math.sqrt(x * x + z * z);
    
    if (radius > 0) {
      const newRadius = radius - curveFactor;
      const scale = newRadius / radius;
      outerSlopePositions.setX(i, x * scale);
      outerSlopePositions.setZ(i, z * scale);
    }
  }
  outerSlopeGeo.computeVertexNormals();
  
  const outerSlope = new THREE.Mesh(outerSlopeGeo, plateMat);
  outerSlope.position.y = 0.004;
  applyShadows(outerSlope);
  group.add(outerSlope);
  
  // Decorative band on outer rim (subtle accent line)
  const bandGeo = new THREE.TorusGeometry(0.108, 0.0008, 8, 32);
  const band = new THREE.Mesh(bandGeo, accentMat);
  band.rotation.x = Math.PI / 2;
  band.position.y = 0.0075;
  group.add(band);
  
  // Raised rim edge (rounded torus)
  const rimGeo = new THREE.TorusGeometry(0.113, 0.003, 16, 32);
  const rim = new THREE.Mesh(rimGeo, plateMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.0085;
  applyShadows(rim);
  group.add(rim);
  
  // Inner transition (from rim down to well)
  const transitionGeo = new THREE.CylinderGeometry(0.095, 0.105, 0.004, 36, 3);
  const transitionPositions = transitionGeo.attributes.position;
  
  // Smooth curve into well
  for (let i = 0; i < transitionPositions.count; i++) {
    const y = transitionPositions.getY(i);
    const normalizedY = (y / 0.004) + 0.5;
    
    const curveFactor = Math.sin(normalizedY * Math.PI / 2) * 0.0005;
    
    const x = transitionPositions.getX(i);
    const z = transitionPositions.getZ(i);
    const radius = Math.sqrt(x * x + z * z);
    
    if (radius > 0) {
      const newRadius = radius + curveFactor;
      const scale = newRadius / radius;
      transitionPositions.setX(i, x * scale);
      transitionPositions.setZ(i, z * scale);
    }
  }
  transitionGeo.computeVertexNormals();
  
  const transition = new THREE.Mesh(transitionGeo, plateMat);
  transition.position.y = 0.006;
  applyShadows(transition);
  group.add(transition);
  
  // Inner well (flat eating surface)
  const wellGeo = new THREE.CylinderGeometry(0.093, 0.095, 0.0015, 32);
  const well = new THREE.Mesh(wellGeo, plateMat);
  well.position.y = 0.00475;
  applyShadows(well);
  group.add(well);
  
  // Inner decorative ring (subtle detail)
  const innerRingGeo = new THREE.TorusGeometry(0.085, 0.0006, 8, 32);
  const innerRing = new THREE.Mesh(innerRingGeo, accentMat);
  innerRing.rotation.x = Math.PI / 2;
  innerRing.position.y = 0.0055;
  group.add(innerRing);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0.008, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createPlate.metadata = {
  category: 'utensils',
  name: 'Plate',
  description: 'Dinner plate with raised rim',
  dimensions: { width: 0.24, depth: 0.24, height: 0.015 },
  interactive: false
};

// Export all utensils creators
export const creators = {
  fork: createFork,
  knife: createKnife,
  spoon: createSpoon,
  plate: createPlate
};




