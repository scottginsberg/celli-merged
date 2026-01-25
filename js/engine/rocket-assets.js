export function createRocket({ THREE, BufferGeometryUtils, scene, physics, world }) {
  const rocketGroup = new THREE.Group();
  
  // Main body (cylinder)
  const bodyRadius = 0.4;
  const bodyHeight = 4;
  const bodyGeo = new THREE.CylinderGeometry(bodyRadius, bodyRadius, bodyHeight, 16);
  const bodyMat = new THREE.MeshStandardMaterial({ 
    color: 0xEEEEEE,
    metalness: 0.6,
    roughness: 0.3
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = bodyHeight / 2;
  body.castShadow = true;
  rocketGroup.add(body);
  
  // Nose cone (green)
  const coneHeight = 1.5;
  const coneGeo = new THREE.ConeGeometry(bodyRadius, coneHeight, 16);
  const coneMat = new THREE.MeshStandardMaterial({ 
    color: 0x22AA44,
    metalness: 0.5,
    roughness: 0.4
  });
  const cone = new THREE.Mesh(coneGeo, coneMat);
  cone.position.y = bodyHeight + coneHeight / 2;
  cone.castShadow = true;
  rocketGroup.add(cone);
  
  // Create fins that attach radially to the cylinder surface
  const finMat = new THREE.MeshStandardMaterial({ 
    color: 0x22AA44,
    metalness: 0.7,
    roughness: 0.3
  });
  
  // Build single fin with two segments, positioned to attach at X=0 (cylinder surface)
  const finThickness = 0.08;
  const segment1Height = 0.8;
  const segment1Width = 0.9;
  const segment2Height = 1.0;
  const segment2Width = 0.7;
  
  // Segment 1: Angled outward section (prism-like) - extends from cylinder surface
  const segment1Geo = new THREE.BoxGeometry(segment1Width, segment1Height, finThickness);
  const segment1Mesh = new THREE.Mesh(segment1Geo);
  // Tilt outward 30 degrees and position so it starts at X=0 (cylinder edge)
  segment1Mesh.rotation.z = -Math.PI / 6;
  segment1Mesh.position.set(segment1Width * 0.5, segment1Height / 2 + 0.4, 0);
  segment1Mesh.updateMatrix();
  
  // Segment 2: Vertical section - extends further out
  const segment2Geo = new THREE.BoxGeometry(segment2Width, segment2Height, finThickness);
  const segment2Mesh = new THREE.Mesh(segment2Geo);
  segment2Mesh.position.set(segment1Width + segment2Width * 0.5, segment2Height / 2, 0);
  segment2Mesh.updateMatrix();
  
  // Merge the two segments into one geometry
  const mergedFinGeo = BufferGeometryUtils.mergeGeometries([
    segment1Mesh.geometry.clone().applyMatrix4(segment1Mesh.matrix),
    segment2Mesh.geometry.clone().applyMatrix4(segment2Mesh.matrix)
  ]);
  
  // Create 3 fin instances in Y formation (120 degrees apart)
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2; // 0°, 120°, 240°
    const fin = new THREE.Mesh(mergedFinGeo, finMat);
    
    // Position fin at rocket body edge and rotate to face radially outward
    // The fin geometry starts at X=0, so we position it at the cylinder radius
    fin.position.x = Math.cos(angle) * bodyRadius;
    fin.position.z = Math.sin(angle) * bodyRadius;
    
    // Rotate to face radially outward - fin extends perpendicular to cylinder surface
    fin.rotation.y = angle;
    fin.castShadow = true;
    
    rocketGroup.add(fin);
  }
  
  // Exhaust system (hidden initially)
  const exhaustGroup = new THREE.Group();
  exhaustGroup.position.y = 0; // At base of rocket
  
  // Main central flame cone (base-to-base with rocket cylinder)
  const mainFlameGeo = new THREE.ConeGeometry(bodyRadius * 0.6, 1.5, 8);
  const mainFlameMat = new THREE.MeshBasicMaterial({ 
    color: 0xFFAA00,
    transparent: true,
    opacity: 0.9
  });
  const mainFlame = new THREE.Mesh(mainFlameGeo, mainFlameMat);
  mainFlame.position.y = -0.75; // Position so base touches rocket base
  exhaustGroup.add(mainFlame);
  
  // Radiating exhaust plumes (8 cones fanning outward)
  const plumeCount = 8;
  const plumeGeo = new THREE.ConeGeometry(bodyRadius * 0.25, 1.2, 6);
  const plumeMat = new THREE.MeshBasicMaterial({ 
    color: 0xFF6600,
    transparent: true,
    opacity: 0.7
  });
  
  for (let i = 0; i < plumeCount; i++) {
    const angle = (i / plumeCount) * Math.PI * 2;
    const plume = new THREE.Mesh(plumeGeo, plumeMat.clone());
    
    // Position around the base in a circle
    const radius = bodyRadius * 0.7;
    plume.position.x = Math.cos(angle) * radius;
    plume.position.z = Math.sin(angle) * radius;
    plume.position.y = -0.6; // Slightly above center cone base
    
    // Tilt outward away from center (pointing outward and down)
    const tiltAngle = Math.PI * 0.15; // 27 degrees outward tilt
    plume.rotation.z = Math.cos(angle) * tiltAngle;
    plume.rotation.x = Math.sin(angle) * tiltAngle;
    
    exhaustGroup.add(plume);
  }
  
  exhaustGroup.visible = false;
  rocketGroup.add(exhaustGroup);
  rocketGroup.userData.exhaustGroup = exhaustGroup;
  
  const rocketMesh = rocketGroup;
  rocketMesh.visible = false;
  scene.add(rocketMesh);
  
  // Create rocket physics body (allow rotation so it can tip over when not thrusting)
  const bodyDesc = physics.RigidBodyDesc.dynamic()
    .setTranslation(0, 5, 0)
    .setLinearDamping(0.1)
    .setAngularDamping(5.0); // Rotation damping to stabilize
  
  const rocketBody = world.createRigidBody(bodyDesc);
  
  // Set initial rotation to upright (identity quaternion = straight up)
  rocketBody.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
  
  const colliderDesc = physics.ColliderDesc.cylinder(bodyHeight / 2, bodyRadius);
  world.createCollider(colliderDesc, rocketBody);
  
  console.log('Rocket created');

  return { rocketMesh, rocketBody };
}


export function createGiantFinger({ THREE, scene }) {
  if (typeof createGiantFingerSystem !== "function") {
    console.warn("⚠️ Giant finger system unavailable; skipping.");
    return;
  }
  // Use external finger system from giant-finger.js (6000x scale for visibility)
  const giantFinger = createGiantFingerSystem(THREE, scene, 6000);
  console.log('☝️ Giant finger loaded from external script');

  return giantFinger || null;
}


export function createAtmosphereLayer({ THREE, scene, atmosphereAltitude }) {
  // Create deformed cloud layer mesh that the rocket passes through
  const radius = 400;
  const geometry = new THREE.SphereGeometry(radius, 32, 32, 0, Math.PI * 2, 0, Math.PI / 4); // Top hemisphere only
  
  // Deform vertices to create cloud-like bumps
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    
    // Add noise for cloud deformation
    const noise = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 20 + 
                  Math.sin(x * 0.05) * Math.cos(z * 0.05) * 10;
    const scale = (radius + noise) / radius;
    
    positions.setXYZ(i, x * scale, y * scale, z * scale);
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  
  // Cloud material - white/grey, transparent
  const material = new THREE.MeshStandardMaterial({
    color: 0xEEEEEE,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
    roughness: 1.0,
    metalness: 0.0
  });
  
  const atmosphereLayer = new THREE.Mesh(geometry, material);
  atmosphereLayer.position.y = atmosphereAltitude - radius * 0.5; // Position at atmosphere altitude
  atmosphereLayer.visible = false;
  scene.add(atmosphereLayer);
  
  console.log('Atmosphere layer created');

  return atmosphereLayer;
}


export function createStarField({ THREE, scene }) {
  // Create instanced stars for better performance
  const starCount = 2000;
  
  // Small box geometry for each star (cheaper than spheres)
  const starGeometry = new THREE.BoxGeometry(2, 2, 2);
  
  // Material with emissive for glow
  const starMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    fog: false // Stars not affected by fog
  });
  
  // Create instanced mesh
  const starField = new THREE.InstancedMesh(starGeometry, starMaterial, starCount);
  starField.visible = false;
  
  // Set up instance matrices and colors
  const matrix = new THREE.Matrix4();
  const color = new THREE.Color();
  
  for (let i = 0; i < starCount; i++) {
    // Random position in a sphere around the scene
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const radius = 800 + Math.random() * 200;
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    
    // Set position and scale
    matrix.setPosition(x, y, z);
    starField.setMatrixAt(i, matrix);
    
    // Star colors - mostly white, some slightly blue or yellow
    const colorChoice = Math.random();
    if (colorChoice < 0.7) {
      color.setRGB(1, 1, 1); // White
    } else if (colorChoice < 0.85) {
      color.setRGB(0.8, 0.9, 1); // Slightly blue
    } else {
      color.setRGB(1, 1, 0.8); // Slightly yellow
    }
    
    starField.setColorAt(i, color);
  }
  
  starField.instanceMatrix.needsUpdate = true;
  if (starField.instanceColor) starField.instanceColor.needsUpdate = true;
  
  scene.add(starField);
  
  console.log('⭐ Star field created with instanced rendering (2000 instances)');

  return starField;
}
