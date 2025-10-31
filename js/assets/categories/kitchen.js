// ==================== KITCHEN ASSET CREATORS ====================
// Universal kitchen appliance and fixture creation functions

import { createPositionedGroup, applyShadows } from '../asset-context.js';

/**
 * Create a refrigerator asset
 * @param {Object} spec - Asset specification
 * @param {Object} THREE - Three.js library reference
 * @param {Object} context - Context with scene, objects, gridSize
 * @returns {THREE.Group}
 */
function createRefrigerator(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = 0.8;
  const depth = 0.7;
  const height = 1.8;
  
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.3, metalness: 0.6 });
  
  // Main body
  const bodyGeo = new THREE.BoxGeometry(width, height, depth);
  const body = new THREE.Mesh(bodyGeo, metalMat);
  body.position.y = height / 2;
  applyShadows(body);
  group.add(body);
  
  // Center divider
  const dividerGeo = new THREE.BoxGeometry(0.02, height * 0.96, 0.02);
  const divider = new THREE.Mesh(dividerGeo, metalMat);
  divider.position.set(0, height / 2, depth / 2 + 0.01);
  applyShadows(divider);
  group.add(divider);
  
  const hingeMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.5, metalness: 0.7 });
  const handleMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.4, metalness: 0.8 });
  
  // LEFT DOOR (interactive)
  const leftDoorGroup = new THREE.Group();
  const leftDoorGeo = new THREE.BoxGeometry((width / 2) * 0.96, height * 0.96, 0.02);
  const leftDoor = new THREE.Mesh(leftDoorGeo, metalMat);
  applyShadows(leftDoor);
  leftDoorGroup.add(leftDoor);
  
  leftDoorGroup.position.set(-width / 4 - 0.01, height / 2, depth / 2 + 0.01);
  leftDoorGroup.userData.isDoor = true;
  leftDoorGroup.userData.isOpen = false;
  leftDoorGroup.userData.hingeOffset = new THREE.Vector3(width / 4 + 0.01, 0, 0); // Hinge on left edge
  group.add(leftDoorGroup);
  
  // Left door hinges - FIXED: aligned with door edge corners
  for (let i = 0; i < 3; i++) {
    const hingeGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.03, 12);
    const hinge = new THREE.Mesh(hingeGeo, hingeMat);
    const hingeY = i === 0 ? height * 0.85 : i === 1 ? height * 0.5 : height * 0.15; // Top, middle, bottom
    hinge.position.set(
      -width / 2 + 0.01, // FIXED: closer to door edge
      hingeY,
      depth / 2 + 0.015
    );
    applyShadows(hinge);
    group.add(hinge);
  }
  
  // Left door handle (vertical) - SMALLER
  const leftHandleGeo = new THREE.CylinderGeometry(0.01, 0.01, height * 0.25, 12); // REDUCED from 0.4 to 0.25
  const leftHandle = new THREE.Mesh(leftHandleGeo, handleMat);
  leftHandle.position.set(-(width / 2) * 0.08, 0, 0.024);
  applyShadows(leftHandle);
  leftDoorGroup.add(leftHandle);
  
  // LEFT door handle end caps
  [-(height * 0.125), (height * 0.125)].forEach(yOff => { // ADJUSTED spacing
    const capGeo = new THREE.SphereGeometry(0.012, 12, 12); // SMALLER
    const cap = new THREE.Mesh(capGeo, handleMat);
    cap.position.set(-(width / 2) * 0.08, yOff, 0.024);
    applyShadows(cap);
    leftDoorGroup.add(cap);
  });
  
  // RIGHT DOOR (interactive)
  const rightDoorGroup = new THREE.Group();
  const rightDoorGeo = new THREE.BoxGeometry((width / 2) * 0.96, height * 0.96, 0.02);
  const rightDoor = new THREE.Mesh(rightDoorGeo, metalMat);
  applyShadows(rightDoor);
  rightDoorGroup.add(rightDoor);
  
  rightDoorGroup.position.set(width / 4 + 0.01, height / 2, depth / 2 + 0.01);
  rightDoorGroup.userData.isDoor = true;
  rightDoorGroup.userData.isOpen = false;
  rightDoorGroup.userData.hingeOffset = new THREE.Vector3(-(width / 4 + 0.01), 0, 0); // Hinge on right edge
  group.add(rightDoorGroup);
  
  // Right door hinges - FIXED: aligned with door edge corners
  for (let i = 0; i < 3; i++) {
    const hingeGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.03, 12);
    const hinge = new THREE.Mesh(hingeGeo, hingeMat);
    const hingeY = i === 0 ? height * 0.85 : i === 1 ? height * 0.5 : height * 0.15; // Top, middle, bottom
    hinge.position.set(
      width / 2 - 0.01, // FIXED: closer to door edge
      hingeY,
      depth / 2 + 0.015
    );
    applyShadows(hinge);
    group.add(hinge);
  }
  
  // Right door handle (vertical) - SMALLER
  const rightHandleGeo = new THREE.CylinderGeometry(0.01, 0.01, height * 0.25, 12); // REDUCED from 0.4 to 0.25
  const rightHandle = new THREE.Mesh(rightHandleGeo, handleMat);
  rightHandle.position.set((width / 2) * 0.08, 0, 0.024);
  applyShadows(rightHandle);
  rightDoorGroup.add(rightHandle);
  
  // RIGHT door handle end caps
  [-(height * 0.125), (height * 0.125)].forEach(yOff => { // ADJUSTED spacing
    const capGeo = new THREE.SphereGeometry(0.012, 12, 12); // SMALLER
    const cap = new THREE.Mesh(capGeo, handleMat);
    cap.position.set((width / 2) * 0.08, yOff, 0.024);
    applyShadows(cap);
    rightDoorGroup.add(cap);
  });
  
  // Ice/water dispenser panel (left door) - IMPROVED: lower, larger, more detailed
  const dispenserGeo = new THREE.BoxGeometry(0.18, 0.35, 0.01);
  const dispenserMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.5 });
  const dispenser = new THREE.Mesh(dispenserGeo, dispenserMat);
  dispenser.position.set(0, height * 0.65, 0.025); // FIXED: lowered from 0.25 to 0.65
  applyShadows(dispenser);
  leftDoorGroup.add(dispenser);
  
  // Border frame around dispenser
  const frameThickness = 0.01;
  [[0, 0.175], [0, -0.175], [-0.09, 0], [0.09, 0]].forEach(([x, y], i) => {
    const frameGeo = i < 2 
      ? new THREE.BoxGeometry(0.18, frameThickness, 0.005)
      : new THREE.BoxGeometry(frameThickness, 0.35, 0.005);
    const frame = new THREE.Mesh(frameGeo, new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.7 }));
    frame.position.set(x, height * 0.65 + y, 0.03);
    leftDoorGroup.add(frame);
  });
  
  // Ice dispenser opening (larger)
  const iceOpenGeo = new THREE.BoxGeometry(0.12, 0.1, 0.008);
  const iceOpen = new THREE.Mesh(iceOpenGeo, new THREE.MeshStandardMaterial({ color: 0x0a0a0a }));
  iceOpen.position.set(0, height * 0.69, 0.031);
  leftDoorGroup.add(iceOpen);
  
  // Ice chute indicator
  const chuteGeo = new THREE.BoxGeometry(0.08, 0.06, 0.006);
  const chute = new THREE.Mesh(chuteGeo, new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
  chute.position.set(0, height * 0.67, 0.033);
  leftDoorGroup.add(chute);
  
  // Water dispenser area
  const waterAreaGeo = new THREE.BoxGeometry(0.12, 0.12, 0.006);
  const waterArea = new THREE.Mesh(waterAreaGeo, new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
  waterArea.position.set(0, height * 0.58, 0.031);
  leftDoorGroup.add(waterArea);
  
  // Water dispenser buttons (3 buttons: ice, water, crushed)
  const buttonLabels = [-0.04, 0, 0.04];
  buttonLabels.forEach((xOff, i) => {
    const waterBtnGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.008, 16);
    const btnColor = i === 0 ? 0x4444ff : i === 1 ? 0x44ff44 : 0xff4444;
    const waterBtn = new THREE.Mesh(waterBtnGeo, new THREE.MeshStandardMaterial({ color: btnColor }));
    waterBtn.rotation.x = Math.PI / 2;
    waterBtn.position.set(xOff, height * 0.54, 0.032);
    leftDoorGroup.add(waterBtn);
  });
  
  // Register doors as interactive
  context.registerInteractive(leftDoorGroup);
  context.registerInteractive(rightDoorGroup);
  
  // Position the group
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createRefrigerator.metadata = {
  category: 'kitchen',
  name: 'Refrigerator',
  description: 'Standard refrigerator with freezer on top',
  dimensions: { width: 0.8, depth: 0.7, height: 1.8 },
  interactive: false
};

/**
 * Create a microwave asset
 * @param {Object} spec - Asset specification
 * @param {Object} THREE - Three.js library reference
 * @param {Object} context - Context with scene, objects, gridSize
 * @returns {THREE.Group}
 */
function createMicrowave(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = 0.5;
  const height = 0.3;
  const depth = 0.4;
  
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5, metalness: 0.4 });
  
  // Body
  const bodyGeo = new THREE.BoxGeometry(width, height, depth);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = height / 2;
  applyShadows(body);
  group.add(body);
  
  // Interactive door group
  const doorGroup = new THREE.Group();
  
  // Glass window in door (IMPROVED: more transparent)
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x88ccff,
    transparent: true,
    opacity: 0.3, // More transparent
    roughness: 0.1,
    metalness: 0.6
  });
  const doorGeo = new THREE.BoxGeometry(width * 0.6, height * 0.6, 0.008);
  const door = new THREE.Mesh(doorGeo, glassMat);
  applyShadows(door);
  doorGroup.add(door);
  
  // Door frame
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.5, metalness: 0.3 });
  const frameThickness = 0.015;
  
  // Top frame
  const topFrameGeo = new THREE.BoxGeometry(width * 0.7, frameThickness, 0.012);
  const topFrame = new THREE.Mesh(topFrameGeo, frameMat);
  topFrame.position.set(0, height * 0.35, 0.002);
  doorGroup.add(topFrame);
  
  // Bottom frame
  const bottomFrame = topFrame.clone();
  bottomFrame.position.set(0, -height * 0.35, 0.002);
  doorGroup.add(bottomFrame);
  
  // Left frame
  const leftFrameGeo = new THREE.BoxGeometry(frameThickness, height * 0.7, 0.012);
  const leftFrame = new THREE.Mesh(leftFrameGeo, frameMat);
  leftFrame.position.set(-width * 0.35, 0, 0.002);
  doorGroup.add(leftFrame);
  
  // Right frame
  const rightFrame = leftFrame.clone();
  rightFrame.position.set(width * 0.35, 0, 0.002);
  doorGroup.add(rightFrame);
  
  // Door handle
  const doorHandleGeo = new THREE.BoxGeometry(0.02, 0.08, 0.015);
  const doorHandle = new THREE.Mesh(doorHandleGeo, frameMat);
  doorHandle.position.set(width * 0.28, 0, 0.01);
  applyShadows(doorHandle);
  doorGroup.add(doorHandle);
  
  doorGroup.position.set(-width * 0.1, height / 2, depth / 2 + 0.01);
  doorGroup.userData.isDoor = true;
  doorGroup.userData.isOpen = false;
  doorGroup.userData.hingeOffset = new THREE.Vector3(width * 0.35, 0, 0); // Hinge on left
  group.add(doorGroup);
  
  // Door hinges (visible, on left side)
  const hingeMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.5, metalness: 0.7 });
  [height * 0.35, -height * 0.35].forEach(yOff => {
    const hingeGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.025, 12);
    const hinge = new THREE.Mesh(hingeGeo, hingeMat);
    hinge.position.set(-width * 0.1 + width * 0.35, height / 2 + yOff, depth / 2 + 0.015);
    applyShadows(hinge);
    group.add(hinge);
  });
  
  // Register door as interactive
  context.registerInteractive(doorGroup);
  
  // Control panel
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4 });
  const panelGeo = new THREE.BoxGeometry(width * 0.22, height * 0.85, 0.015);
  const panel = new THREE.Mesh(panelGeo, panelMat);
  panel.position.set(width * 0.32, height / 2, depth / 2 + 0.01);
  group.add(panel);
  
  // Digital display
  const displayGeo = new THREE.BoxGeometry(width * 0.16, height * 0.15, 0.005);
  const displayMat = new THREE.MeshStandardMaterial({ 
    color: 0x00ff00, 
    emissive: 0x00aa00, 
    emissiveIntensity: 0.3,
    roughness: 0.8 
  });
  const display = new THREE.Mesh(displayGeo, displayMat);
  display.position.set(width * 0.32, height * 0.75, depth / 2 + 0.02);
  group.add(display);
  
  // Number pad buttons (3x4 grid, SMALLER)
  const buttonMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.6 });
  const buttonGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.005, 12); // SMALLER: 0.008 radius instead of 0.015
  
  const gridStartX = width * 0.26;
  const gridStartY = height * 0.48;
  const buttonSpacingX = 0.025; // Tighter spacing
  const buttonSpacingY = 0.032;
  
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      const button = new THREE.Mesh(buttonGeo, buttonMat);
      button.rotation.x = Math.PI / 2;
      button.position.set(
        gridStartX + col * buttonSpacingX,
        gridStartY - row * buttonSpacingY,
        depth / 2 + 0.023
      );
      group.add(button);
    }
  }
  
  // Start button (larger, green)
  const startButtonMat = new THREE.MeshStandardMaterial({ 
    color: 0x00aa00, 
    roughness: 0.5,
    metalness: 0.2 
  });
  const startButtonGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.01, 16);
  const startButton = new THREE.Mesh(startButtonGeo, startButtonMat);
  startButton.rotation.x = Math.PI / 2;
  startButton.position.set(width * 0.32, height * 0.15, depth / 2 + 0.025);
  group.add(startButton);
  
  // Door handle
  const handleGeo = new THREE.BoxGeometry(0.08, 0.015, 0.02);
  const handleMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.4, metalness: 0.7 });
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.position.set(-width * 0.1, height * 0.15, depth / 2 + 0.025);
  group.add(handle);
  
  // Position the group
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createMicrowave.metadata = {
  category: 'kitchen',
  name: 'Microwave',
  description: 'Countertop microwave oven',
  dimensions: { width: 0.5, height: 0.3, depth: 0.4 },
  interactive: false
};

/**
 * Create a counter with sink
 * @param {Object} spec - Asset specification
 * @param {Object} THREE - Three.js library reference
 * @param {Object} context - Context with scene, objects, gridSize
 * @returns {THREE.Group}
 */
function createCounter(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = spec.width || 2.0;
  const depth = spec.depth || 0.6;
  const height = 0.9;
  const thickness = 0.05;
  
  // Counter base (cabinet body)
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.7 });
  const baseGeo = new THREE.BoxGeometry(width, height - thickness, depth);
  const base = new THREE.Mesh(baseGeo, baseMat);  // Fixed: was using baseGeo as material
  base.position.y = (height - thickness) / 2;
  applyShadows(base);
  group.add(base);
  
  // Cabinet doors with hinges (2-3 doors depending on width)
  const doorCount = Math.max(2, Math.floor(width / 0.6));
  const doorWidth = (width * 0.95) / doorCount;
  const doorHeight = (height - thickness) * 0.85;
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x6b5644, roughness: 0.6 });
  const hingeMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.5, metalness: 0.7 });
  const knobMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.3, metalness: 0.8 });
  
  for (let i = 0; i < doorCount; i++) {
    // Interactive door group
    const doorGroupInteractive = new THREE.Group();
    
    const doorGeo = new THREE.BoxGeometry(doorWidth - 0.02, doorHeight, 0.02);
    const door = new THREE.Mesh(doorGeo, doorMat);
    applyShadows(door);
    doorGroupInteractive.add(door);
    
    // Door panel inset
    const panelGeo = new THREE.BoxGeometry(doorWidth * 0.8, doorHeight * 0.8, 0.008);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x7a6552, roughness: 0.65 });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.z = 0.012;
    applyShadows(panel);
    doorGroupInteractive.add(panel);
    
    // Knob
    const knobGeo = new THREE.CylinderGeometry(0.015, 0.012, 0.025, 16);
    const knob = new THREE.Mesh(knobGeo, knobMat);
    knob.rotation.x = Math.PI / 2;
    knob.position.set(doorWidth * 0.35, 0, 0.025);
    applyShadows(knob);
    doorGroupInteractive.add(knob);
    
    const doorXPos = -width / 2 + doorWidth / 2 + i * doorWidth + 0.01 * i;
    doorGroupInteractive.position.set(doorXPos, (height - thickness) / 2, depth / 2 + 0.01);
    doorGroupInteractive.userData.isDoor = true;
    doorGroupInteractive.userData.isOpen = false;
    doorGroupInteractive.userData.hingeOffset = new THREE.Vector3(-doorWidth / 2, 0, 0); // Hinge on left edge
    group.add(doorGroupInteractive);
    
    // Hinges (2 per door, left side) - attached to cabinet body
    for (let h = 0; h < 2; h++) {
      const hingeGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.025, 12);
      const hinge = new THREE.Mesh(hingeGeo, hingeMat);
      hinge.position.set(
        -width / 2 + i * doorWidth + 0.02 + 0.01 * i,
        (height - thickness) / 2 + (h === 0 ? doorHeight * 0.3 : -doorHeight * 0.3),
        depth / 2 + 0.015
      );
      applyShadows(hinge);
      group.add(hinge);
    }
    
    // Register door as interactive
    context.registerInteractive(doorGroupInteractive);
  }
  
  // Countertop with slight bevel
  const topMat = new THREE.MeshStandardMaterial({ color: 0x2c2c2c, roughness: 0.3, metalness: 0.1 });
  const topGeo = new THREE.BoxGeometry(width, thickness, depth);
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.y = height - thickness / 2;
  applyShadows(top);
  group.add(top);
  
  // Backsplash
  const splashGeo = new THREE.BoxGeometry(width, 0.15, 0.02);
  const splashMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.4 });
  const splash = new THREE.Mesh(splashGeo, splashMat);
  splash.position.set(0, height + 0.075, -depth / 2 + 0.01);
  applyShadows(splash);
  group.add(splash);
  
  // Sink - Deep rounded rectangular basin
  const sinkMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.4, metalness: 0.8 });
  const sinkWidth = 0.5;
  const sinkDepth = 0.4;
  const sinkHeight = 0.2;
  const basinDepth = 0.18;
  
  // Outer basin wall
  const outerBasinGeo = new THREE.BoxGeometry(sinkWidth, sinkHeight, sinkDepth, 20, 20, 20);
  const outerPositions = outerBasinGeo.attributes.position;
  
  // Deform to create rounded rectangular basin shape
  for (let i = 0; i < outerPositions.count; i++) {
    const x = outerPositions.getX(i);
    const y = outerPositions.getY(i);
    const z = outerPositions.getZ(i);
    
    // Only deform top surface down into basin
    if (y > 0) {
      const normalizedX = x / (sinkWidth * 0.5);
      const normalizedZ = z / (sinkDepth * 0.5);
      
      // Rounded rectangular profile (softer corners)
      const distX = Math.abs(normalizedX);
      const distZ = Math.abs(normalizedZ);
      const cornerBlend = Math.max(distX, distZ); // Creates rectangular with rounded corners
      const distFromEdge = Math.min(1, cornerBlend);
      
      // Deep basin deformation
      const depthFactor = 1 - Math.pow(distFromEdge, 2.5);
      const deform = depthFactor * basinDepth;
      
      outerPositions.setY(i, y - deform);
    }
  }
  outerBasinGeo.computeVertexNormals();
  
  const outerBasin = new THREE.Mesh(outerBasinGeo, sinkMat);
  outerBasin.position.set(0, height - sinkHeight / 2 - thickness, 0);
  applyShadows(outerBasin);
  group.add(outerBasin);
  
  // Inner basin wall (for thickness)
  const innerBasinGeo = new THREE.BoxGeometry(sinkWidth * 0.95, sinkHeight * 0.9, sinkDepth * 0.95, 18, 18, 18);
  const innerPositions = innerBasinGeo.attributes.position;
  
  for (let i = 0; i < innerPositions.count; i++) {
    const x = innerPositions.getX(i);
    const y = innerPositions.getY(i);
    const z = innerPositions.getZ(i);
    
    if (y > 0) {
      const normalizedX = x / (sinkWidth * 0.475);
      const normalizedZ = z / (sinkDepth * 0.475);
      const distX = Math.abs(normalizedX);
      const distZ = Math.abs(normalizedZ);
      const cornerBlend = Math.max(distX, distZ);
      const distFromEdge = Math.min(1, cornerBlend);
      const depthFactor = 1 - Math.pow(distFromEdge, 2.5);
      const deform = depthFactor * (basinDepth * 0.98);
      
      innerPositions.setY(i, y - deform);
    }
  }
  innerBasinGeo.computeVertexNormals();
  
  const innerBasinMat = new THREE.MeshStandardMaterial({ 
    color: 0xd0d0d0, 
    roughness: 0.3, 
    metalness: 0.8,
    side: THREE.BackSide 
  });
  const innerBasin = new THREE.Mesh(innerBasinGeo, innerBasinMat);
  innerBasin.position.set(0, height - sinkHeight / 2 - thickness + 0.005, 0);
  group.add(innerBasin);
  
  // Drain tube cutout (actual geometry)
  const drainRadius = 0.04;
  const drainDepth = 0.12;
  
  // Drain opening (dark circle at bottom of basin)
  const drainOpenGeo = new THREE.CircleGeometry(drainRadius, 24);
  const drainOpenMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6 });
  const drainOpen = new THREE.Mesh(drainOpenGeo, drainOpenMat);
  drainOpen.rotation.x = -Math.PI / 2;
  drainOpen.position.set(0, height - sinkHeight - thickness + 0.02, 0);
  group.add(drainOpen);
  
  // Drain tube (cylinder going down)
  const drainTubeGeo = new THREE.CylinderGeometry(drainRadius * 0.9, drainRadius * 0.9, drainDepth, 24, 1, true);
  const drainTubeMat = new THREE.MeshStandardMaterial({ 
    color: 0x2a2a2a, 
    roughness: 0.7,
    side: THREE.DoubleSide 
  });
  const drainTube = new THREE.Mesh(drainTubeGeo, drainTubeMat);
  drainTube.position.set(0, height - sinkHeight - thickness - drainDepth / 2 + 0.02, 0);
  group.add(drainTube);
  
  // Drain grate with holes
  const grateGeo = new THREE.TorusGeometry(drainRadius * 0.7, 0.003, 8, 24);
  const grateMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.5, metalness: 0.7 });
  const grate = new THREE.Mesh(grateGeo, grateMat);
  grate.rotation.x = Math.PI / 2;
  grate.position.set(0, height - sinkHeight - thickness + 0.021, 0);
  group.add(grate);
  
  // Cross bars in drain
  for (let i = 0; i < 2; i++) {
    const barGeo = new THREE.BoxGeometry(drainRadius * 1.4, 0.003, 0.004);
    const bar = new THREE.Mesh(barGeo, grateMat);
    bar.rotation.y = i * Math.PI / 2;
    bar.position.set(0, height - sinkHeight - thickness + 0.021, 0);
    group.add(bar);
  }
  
  // Faucet with spout arc
  const faucetBaseMat = new THREE.MeshStandardMaterial({ color: 0xa0a0a0, roughness: 0.3, metalness: 0.8 });
  
  // Base mount
  const mountGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.04, 16);
  const mount = new THREE.Mesh(mountGeo, faucetBaseMat);
  mount.position.set(0, height, -sinkDepth * 0.35);
  applyShadows(mount);
  group.add(mount);
  
  // Vertical pipe
  const pipeGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.18, 12);
  const pipe = new THREE.Mesh(pipeGeo, faucetBaseMat);
  pipe.position.set(0, height + 0.09, -sinkDepth * 0.35);
  applyShadows(pipe);
  group.add(pipe);
  
  // Curved spout (approximated with torus) - FIXED: arcs FORWARD over sink
  const spoutGeo = new THREE.TorusGeometry(0.05, 0.012, 12, 16, Math.PI);
  const spout = new THREE.Mesh(spoutGeo, faucetBaseMat);
  spout.rotation.x = Math.PI / 2;
  spout.rotation.y = -Math.PI / 2; // FIXED: negative to arc forward, not backward
  spout.position.set(0, height + 0.18, -sinkDepth * 0.35);
  applyShadows(spout);
  group.add(spout);
  
  // Spout end (nozzle pointing down)
  const nozzleGeo = new THREE.CylinderGeometry(0.01, 0.012, 0.03, 12);
  const nozzle = new THREE.Mesh(nozzleGeo, faucetBaseMat);
  nozzle.position.set(0, height + 0.13, -sinkDepth * 0.35 - 0.05); // FIXED: negative Z to be over sink
  applyShadows(nozzle);
  group.add(nozzle);
  
  // Handle (lever style)
  const handleGeo = new THREE.BoxGeometry(0.08, 0.015, 0.025);
  const handle = new THREE.Mesh(handleGeo, faucetBaseMat);
  handle.position.set(0.06, height + 0.185, -sinkDepth * 0.35);
  handle.rotation.z = -Math.PI / 8;
  applyShadows(handle);
  group.add(handle);
  
  // Position the group
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createCounter.metadata = {
  category: 'kitchen',
  name: 'Counter',
  description: 'Kitchen counter with sink and faucet',
  dimensions: { width: 2.0, depth: 0.6, height: 0.9 },
  interactive: false
};

/**
 * Create a chef's knife
 */
function createChefsKnife(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const bladeLength = 0.2;
  const bladeWidth = 0.04;
  const handleLength = 0.12;
  
  // Blade (tapered triangle)
  const bladeGeo = new THREE.BoxGeometry(bladeLength, 0.002, bladeWidth, 10, 1, 4);
  const bladePositions = bladeGeo.attributes.position;
  
  // Taper blade to point
  for (let i = 0; i < bladePositions.count; i++) {
    const x = bladePositions.getX(i);
    const z = bladePositions.getZ(i);
    
    const taperFactor = (x + bladeLength / 2) / bladeLength;
    bladePositions.setZ(i, z * taperFactor);
  }
  bladeGeo.computeVertexNormals();
  
  const bladeMat = new THREE.MeshStandardMaterial({ 
    color: 0xe0e0e0, 
    roughness: 0.15,
    metalness: 0.95
  });
  
  const blade = new THREE.Mesh(bladeGeo, bladeMat);
  blade.position.set(bladeLength / 2 + handleLength / 2, 0.001, 0);
  applyShadows(blade);
  group.add(blade);
  
  // Blade spine (thicker top edge)
  const spineGeo = new THREE.BoxGeometry(bladeLength, 0.003, 0.002);
  const spine = new THREE.Mesh(spineGeo, bladeMat);
  spine.position.set(bladeLength / 2 + handleLength / 2, 0.001, bladeWidth / 2);
  group.add(spine);
  
  // Handle (ergonomic wooden grip)
  const handleMat = new THREE.MeshStandardMaterial({ 
    color: 0x3a2a1a, 
    roughness: 0.8
  });
  
  const handleGeo = new THREE.BoxGeometry(handleLength, 0.025, 0.03, 6, 3, 3);
  const handlePositions = handleGeo.attributes.position;
  
  // Ergonomic curves
  for (let i = 0; i < handlePositions.count; i++) {
    const x = handlePositions.getX(i);
    const y = handlePositions.getY(i);
    const z = handlePositions.getZ(i);
    
    const curve = Math.sin((x / handleLength + 0.5) * Math.PI) * 0.005;
    handlePositions.setY(i, y + curve * Math.abs(y / 0.0125));
    handlePositions.setZ(i, z + curve * Math.abs(z / 0.015));
  }
  handleGeo.computeVertexNormals();
  
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.position.set(0, 0.0125, 0);
  applyShadows(handle);
  group.add(handle);
  
  // Rivets on handle
  const rivetMat = new THREE.MeshStandardMaterial({ 
    color: 0xaaaaaa, 
    roughness: 0.3,
    metalness: 0.8
  });
  
  for (let i = 0; i < 3; i++) {
    const rivetGeo = new THREE.CylinderGeometry(0.002, 0.002, 0.032, 8);
    const rivet = new THREE.Mesh(rivetGeo, rivetMat);
    rivet.rotation.x = Math.PI / 2;
    rivet.position.set(-handleLength / 3 + i * handleLength / 3, 0.0125, 0);
    group.add(rivet);
  }
  
  // Bolster (metal piece between blade and handle)
  const bolsterGeo = new THREE.BoxGeometry(0.015, 0.028, 0.045);
  const bolster = new THREE.Mesh(bolsterGeo, bladeMat);
  bolster.position.set(handleLength / 2, 0.014, 0);
  applyShadows(bolster);
  group.add(bolster);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createChefsKnife.metadata = {
  category: 'kitchen',
  name: "Chef's Knife",
  description: 'Professional chef knife with wooden handle',
  dimensions: { width: 0.32, height: 0.03, depth: 0.05 },
  interactive: false
};

/**
 * Create a cutting board
 */
function createCuttingBoard(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = 0.35;
  const depth = 0.25;
  const thickness = 0.015;
  
  const woodMat = new THREE.MeshStandardMaterial({ 
    color: 0x8b6914, 
    roughness: 0.7
  });
  
  // Main board with raised edges
  const boardGeo = new THREE.BoxGeometry(width, thickness, depth, 8, 2, 6);
  const board = new THREE.Mesh(boardGeo, woodMat);
  board.position.y = thickness / 2;
  applyShadows(board);
  group.add(board);
  
  // Raised edge lips (slightly higher border)
  const lipHeight = 0.003;
  const lipMat = new THREE.MeshStandardMaterial({ 
    color: 0x7a5a0a, 
    roughness: 0.75
  });
  
  // Top and bottom lips
  [[0, depth / 2], [0, -depth / 2]].forEach(([x, z]) => {
    const lipGeo = new THREE.BoxGeometry(width, lipHeight, 0.008);
    const lip = new THREE.Mesh(lipGeo, lipMat);
    lip.position.set(x, thickness + lipHeight / 2, z);
    applyShadows(lip);
    group.add(lip);
  });
  
  // Left and right lips
  [[-width / 2, 0], [width / 2, 0]].forEach(([x, z]) => {
    const lipGeo = new THREE.BoxGeometry(0.008, lipHeight, depth);
    const lip = new THREE.Mesh(lipGeo, lipMat);
    lip.position.set(x, thickness + lipHeight / 2, z);
    applyShadows(lip);
    group.add(lip);
  });
  
  // Handle cutout
  const handleCutout = {
    width: 0.1,
    depth: 0.035,
    x: 0,
    z: -depth / 2 + 0.02
  };
  
  const cutoutGeo = new THREE.BoxGeometry(handleCutout.width, thickness + lipHeight, handleCutout.depth);
  const cutoutMat = new THREE.MeshStandardMaterial({ 
    color: 0x6a4a0a, 
    roughness: 0.8
  });
  const cutout = new THREE.Mesh(cutoutGeo, cutoutMat);
  cutout.position.set(handleCutout.x, (thickness + lipHeight) / 2, handleCutout.z);
  applyShadows(cutout);
  group.add(cutout);
  
  // Handle cutout rounded edges
  const handleEdgeGeo = new THREE.TorusGeometry(handleCutout.width / 2, 0.003, 8, 16, Math.PI);
  const handleEdge1 = new THREE.Mesh(handleEdgeGeo, cutoutMat);
  handleEdge1.rotation.set(0, 0, Math.PI / 2);
  handleEdge1.position.set(0, thickness, handleCutout.z + handleCutout.depth / 2);
  group.add(handleEdge1);
  
  const handleEdge2 = handleEdge1.clone();
  handleEdge2.position.z = handleCutout.z - handleCutout.depth / 2;
  group.add(handleEdge2);
  
  // Wood grain lines (subtle)
  const grainMat = new THREE.MeshStandardMaterial({ 
    color: 0x7a5a0a, 
    roughness: 0.85
  });
  
  for (let i = 0; i < 12; i++) {
    const grainGeo = new THREE.BoxGeometry(width * 0.9, 0.001, 0.002 + Math.random() * 0.003);
    const grain = new THREE.Mesh(grainGeo, grainMat);
    grain.position.set(
      (Math.random() - 0.5) * width * 0.1,
      thickness + 0.001,
      (Math.random() - 0.5) * depth * 0.7
    );
    grain.rotation.y = (Math.random() - 0.5) * 0.1;
    group.add(grain);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createCuttingBoard.metadata = {
  category: 'kitchen',
  name: 'Cutting Board',
  description: 'Wooden cutting board with raised edges and handle cutout',
  dimensions: { width: 0.35, height: 0.018, depth: 0.25 },
  interactive: false
};

/**
 * Create vegetables (cucumber, onion, tomato, carrot) in different states
 */
function createVegetable(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const vegType = spec.vegType || 'cucumber'; // cucumber, onion, tomato, carrot
  const state = spec.state || 'whole'; // whole, sliced, diced
  
  const vegData = {
    cucumber: { 
      color: 0x2d5016, 
      length: 0.2, 
      radius: 0.015,
      bumpy: true
    },
    onion: { 
      color: 0xffffff, 
      radius: 0.04, 
      layers: true,
      layerColor: 0xf5e6d3
    },
    tomato: { 
      color: 0xff4444, 
      radius: 0.04,
      shiny: true
    },
    carrot: { 
      color: 0xff8c00, 
      length: 0.18, 
      radius: 0.012,
      tapered: true
    }
  };
  
  const data = vegData[vegType];
  
  if (state === 'whole') {
    // Create whole vegetable
    if (vegType === 'cucumber' || vegType === 'carrot') {
      // Cylindrical vegetables
      const vegGeo = new THREE.CylinderGeometry(
        data.radius,
        data.tapered ? data.radius * 0.4 : data.radius,
        data.length,
        16,
        8
      );
      const positions = vegGeo.attributes.position;
      
      if (data.bumpy) {
        // Add bumps for cucumber
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const y = positions.getY(i);
          const z = positions.getZ(i);
          const angle = Math.atan2(z, x);
          
          const bump = Math.sin(y * 40) * Math.cos(angle * 8) * 0.002;
          const radius = Math.sqrt(x * x + z * z);
          const newRadius = radius + bump;
          const scale = newRadius / radius;
          
          positions.setX(i, x * scale);
          positions.setZ(i, z * scale);
        }
        vegGeo.computeVertexNormals();
      }
      
      const vegMat = new THREE.MeshStandardMaterial({ 
        color: data.color, 
        roughness: 0.7
      });
      
      const veg = new THREE.Mesh(vegGeo, vegMat);
      veg.rotation.z = Math.PI / 2;
      veg.position.y = data.radius;
      applyShadows(veg);
      group.add(veg);
      
      // End caps
      if (vegType === 'cucumber') {
        const capGeo = new THREE.CircleGeometry(data.radius, 16);
        const capMat = new THREE.MeshStandardMaterial({ 
          color: 0xc8e6c9, 
          roughness: 0.8 
        });
        
        [data.length / 2, -data.length / 2].forEach(x => {
          const cap = new THREE.Mesh(capGeo, capMat);
          cap.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2;
          cap.position.set(x, data.radius, 0);
          group.add(cap);
        });
      } else if (vegType === 'carrot') {
        // Carrot top (greens)
        for (let i = 0; i < 5; i++) {
          const stemGeo = new THREE.CylinderGeometry(0.001, 0.002, 0.04, 6);
          const stemMat = new THREE.MeshStandardMaterial({ color: 0x2d5016, roughness: 0.9 });
          const stem = new THREE.Mesh(stemGeo, stemMat);
          const angle = (i / 5) * Math.PI * 2;
          stem.position.set(
            data.length / 2 + Math.cos(angle) * 0.008,
            data.radius + 0.02,
            Math.sin(angle) * 0.008
          );
          stem.rotation.set(
            Math.cos(angle) * 0.3,
            0,
            Math.sin(angle) * 0.3
          );
          group.add(stem);
        }
      }
      
    } else if (vegType === 'onion' || vegType === 'tomato') {
      // Spherical vegetables
      const vegGeo = new THREE.SphereGeometry(data.radius, 24, 20);
      const vegMat = new THREE.MeshStandardMaterial({ 
        color: data.color, 
        roughness: data.shiny ? 0.3 : 0.8
      });
      
      const veg = new THREE.Mesh(vegGeo, vegMat);
      veg.position.y = data.radius;
      applyShadows(veg);
      group.add(veg);
      
      if (vegType === 'tomato') {
        // Tomato stem star
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x2d5016, roughness: 0.9 });
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2;
          const leafGeo = new THREE.BoxGeometry(0.015, 0.002, 0.005);
          const leaf = new THREE.Mesh(leafGeo, stemMat);
          leaf.position.set(
            Math.cos(angle) * 0.008,
            data.radius * 2 + 0.001,
            Math.sin(angle) * 0.008
          );
          leaf.rotation.y = angle;
          group.add(leaf);
        }
      } else if (vegType === 'onion' && data.layers) {
        // Onion layers (translucent outer layer)
        const layerGeo = new THREE.SphereGeometry(data.radius + 0.002, 24, 20);
        const layerMat = new THREE.MeshStandardMaterial({ 
          color: data.layerColor,
          roughness: 0.9,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide
        });
        const layer = new THREE.Mesh(layerGeo, layerMat);
        layer.position.y = data.radius;
        group.add(layer);
        
        // Root end
        const rootGeo = new THREE.CylinderGeometry(0.005, 0.008, 0.015, 12);
        const rootMat = new THREE.MeshStandardMaterial({ color: 0xd4a76a, roughness: 0.9 });
        const root = new THREE.Mesh(rootGeo, rootMat);
        root.position.y = 0.005;
        group.add(root);
      }
    }
    
  } else if (state === 'sliced') {
    // Create sliced pieces
    const sliceCount = 6;
    const sliceThickness = 0.008;
    const spacing = 0.012;
    
    for (let i = 0; i < sliceCount; i++) {
      const sliceGeo = new THREE.CylinderGeometry(
        vegType === 'carrot' ? data.radius * (0.7 + i * 0.05) : data.radius,
        vegType === 'carrot' ? data.radius * (0.7 + i * 0.05) : data.radius,
        sliceThickness,
        24
      );
      
      const sliceMat = new THREE.MeshStandardMaterial({ 
        color: data.color, 
        roughness: 0.7,
        side: THREE.DoubleSide
      });
      
      const slice = new THREE.Mesh(sliceGeo, sliceMat);
      slice.position.set(
        (i - sliceCount / 2) * spacing,
        sliceThickness / 2,
        (Math.random() - 0.5) * 0.01
      );
      slice.rotation.set(
        (Math.random() - 0.5) * 0.2,
        Math.random() * Math.PI * 2,
        (Math.random() - 0.5) * 0.2
      );
      applyShadows(slice);
      group.add(slice);
      
      // Inner flesh color
      const innerColor = vegType === 'cucumber' ? 0xc8e6c9 : 
                         vegType === 'tomato' ? 0xff6666 :
                         vegType === 'carrot' ? 0xffa500 : 0xf5e6d3;
      
      const innerGeo = new THREE.CircleGeometry(data.radius * 0.8, 24);
      const innerMat = new THREE.MeshStandardMaterial({ color: innerColor, roughness: 0.8 });
      
      const inner1 = new THREE.Mesh(innerGeo, innerMat);
      inner1.rotation.x = Math.PI / 2;
      inner1.position.copy(slice.position);
      inner1.position.y += sliceThickness / 2 + 0.0001;
      group.add(inner1);
      
      const inner2 = inner1.clone();
      inner2.rotation.x = -Math.PI / 2;
      inner2.position.y -= sliceThickness + 0.0002;
      group.add(inner2);
    }
    
  } else if (state === 'diced') {
    // Create diced pieces
    const diceSize = 0.01;
    const diceCount = 25;
    
    for (let i = 0; i < diceCount; i++) {
      const diceGeo = new THREE.BoxGeometry(
        diceSize + Math.random() * 0.003,
        diceSize + Math.random() * 0.003,
        diceSize + Math.random() * 0.003
      );
      
      const diceMat = new THREE.MeshStandardMaterial({ 
        color: data.color, 
        roughness: 0.8
      });
      
      const dice = new THREE.Mesh(diceGeo, diceMat);
      const angle = (i / diceCount) * Math.PI * 2;
      const radius = 0.03 + Math.random() * 0.02;
      
      dice.position.set(
        Math.cos(angle) * radius,
        diceSize / 2,
        Math.sin(angle) * radius
      );
      dice.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      applyShadows(dice);
      group.add(dice);
    }
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createVegetable.metadata = {
  category: 'kitchen',
  name: 'Vegetable',
  description: 'Vegetables in various states (whole, sliced, diced)',
  dimensions: { width: 0.2, height: 0.08, depth: 0.2 },
  interactive: false
};

// Export all kitchen creators
export const creators = {
  fridge: createRefrigerator,
  refrigerator: createRefrigerator,
  microwave: createMicrowave,
  counter: createCounter,
  chefsknife: createChefsKnife,
  knife: createChefsKnife,
  cuttingboard: createCuttingBoard,
  
  // Vegetables - whole
  cucumber: (spec, THREE, context) => createVegetable({ ...spec, vegType: 'cucumber', state: 'whole' }, THREE, context),
  onion: (spec, THREE, context) => createVegetable({ ...spec, vegType: 'onion', state: 'whole' }, THREE, context),
  tomato: (spec, THREE, context) => createVegetable({ ...spec, vegType: 'tomato', state: 'whole' }, THREE, context),
  carrot: (spec, THREE, context) => createVegetable({ ...spec, vegType: 'carrot', state: 'whole' }, THREE, context),
  
  // Vegetables - sliced
  cucumbersliced: (spec, THREE, context) => createVegetable({ ...spec, vegType: 'cucumber', state: 'sliced' }, THREE, context),
  slicedcucumber: (spec, THREE, context) => createVegetable({ ...spec, vegType: 'cucumber', state: 'sliced' }, THREE, context),
  onionsliced: (spec, THREE, context) => createVegetable({ ...spec, vegType: 'onion', state: 'sliced' }, THREE, context),
  slicedonion: (spec, THREE, context) => createVegetable({ ...spec, vegType: 'onion', state: 'sliced' }, THREE, context),
  tomatosliced: (spec, THREE, context) => createVegetable({ ...spec, vegType: 'tomato', state: 'sliced' }, THREE, context),
  slicedtomato: (spec, THREE, context) => createVegetable({ ...spec, vegType: 'tomato', state: 'sliced' }, THREE, context),
  carrotsliced: (spec, THREE, context) => createVegetable({ ...spec, vegType: 'carrot', state: 'sliced' }, THREE, context),
  slicedcarrot: (spec, THREE, context) => createVegetable({ ...spec, vegType: 'carrot', state: 'sliced' }, THREE, context),
  
  // Vegetables - diced
  cucumberdiced: (spec, THREE, context) => createVegetable({ ...spec, vegType: 'cucumber', state: 'diced' }, THREE, context),
  dicedcucumber: (spec, THREE, context) => createVegetable({ ...spec, vegType: 'cucumber', state: 'diced' }, THREE, context),
  oniondiced: (spec, THREE, context) => createVegetable({ ...spec, vegType: 'onion', state: 'diced' }, THREE, context),
  dicedonion: (spec, THREE, context) => createVegetable({ ...spec, vegType: 'onion', state: 'diced' }, THREE, context),
  tomatodiced: (spec, THREE, context) => createVegetable({ ...spec, vegType: 'tomato', state: 'diced' }, THREE, context),
  dicedtomato: (spec, THREE, context) => createVegetable({ ...spec, vegType: 'tomato', state: 'diced' }, THREE, context),
  carrotdiced: (spec, THREE, context) => createVegetable({ ...spec, vegType: 'carrot', state: 'diced' }, THREE, context),
  dicedcarrot: (spec, THREE, context) => createVegetable({ ...spec, vegType: 'carrot', state: 'diced' }, THREE, context)
};

