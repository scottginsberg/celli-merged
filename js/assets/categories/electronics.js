// ==================== ELECTRONICS ASSET CREATORS ====================
// Universal electronic device creation functions

import { createPositionedGroup, applyShadows } from '../asset-context.js';

/**
 * Create a TV asset
 * @param {Object} spec - Asset specification
 * @param {Object} THREE - Three.js library reference
 * @param {Object} context - Context with scene, objects, gridSize
 * @returns {THREE.Group}
 */
function createTV(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = spec.width || 1.2;
  const height = spec.height || 0.7;
  const depth = 0.05;
  
  // Back panel
  const backGeo = new THREE.BoxGeometry(width, height, depth);
  const backMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6 });
  const back = new THREE.Mesh(backGeo, backMat);
  back.position.y = height / 2;
  applyShadows(back);
  group.add(back);
  
  // Screen (slightly inset)
  const screenGeo = new THREE.BoxGeometry(width * 0.96, height * 0.96, 0.01);
  const screenMat = new THREE.MeshStandardMaterial({
    color: spec.isOn ? 0x0a0a2a : 0x050505,
    roughness: 0.1,
    metalness: 0.3,
    emissive: spec.isOn ? 0x0a0a2a : 0x000000,
    emissiveIntensity: 0.3
  });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.set(0, height / 2, depth / 2 + 0.005);
  applyShadows(screen);
  group.add(screen);
  
  // Frame (bezel)
  const frameThickness = 0.02;
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.4, metalness: 0.2 });
  
  // Slim modern bezel around screen
  const bezelW = width * 0.02;
  const bezelH = height * 0.02;
  
  // Top and bottom bezels
  const hBezelGeo = new THREE.BoxGeometry(width, bezelH, depth + 0.002);
  [height / 2 + height * 0.48, height / 2 - height * 0.48].forEach(y => {
    const bezel = new THREE.Mesh(hBezelGeo, frameMat);
    bezel.position.y = y;
    applyShadows(bezel);
    group.add(bezel);
  });
  
  // Left and right bezels
  const vBezelGeo = new THREE.BoxGeometry(bezelW, height * 0.96, depth + 0.002);
  [-width / 2 + bezelW / 2, width / 2 - bezelW / 2].forEach(x => {
    const bezel = new THREE.Mesh(vBezelGeo, frameMat);
    bezel.position.set(x, height / 2, 0);
    applyShadows(bezel);
    group.add(bezel);
  });
  
  // Power LED (bottom right front)
  const ledGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.008, 12);
  const ledMat = new THREE.MeshStandardMaterial({
    color: spec.isOn ? 0x00ff00 : 0x006600,
    emissive: spec.isOn ? 0x00ff00 : 0x000000,
    emissiveIntensity: spec.isOn ? 0.8 : 0
  });
  const led = new THREE.Mesh(ledGeo, ledMat);
  led.rotation.x = Math.PI / 2;
  led.position.set(width * 0.42, height * 0.05, depth / 2 + 0.006);
  applyShadows(led);
  group.add(led);
  
  // Ports on back (HDMI, USB, Power)
  const portMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.7 });
  const portY = height * 0.3;
  
  // HDMI ports (3x)
  for (let i = 0; i < 3; i++) {
    const hdmiGeo = new THREE.BoxGeometry(0.015, 0.008, 0.02);
    const hdmi = new THREE.Mesh(hdmiGeo, portMat);
    hdmi.position.set(-width * 0.35 + i * 0.025, portY, -depth / 2 - 0.01);
    applyShadows(hdmi);
    group.add(hdmi);
    
    // Port label
    const labelGeo = new THREE.PlaneGeometry(0.012, 0.006);
    const labelMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
    const label = new THREE.Mesh(labelGeo, labelMat);
    label.position.set(-width * 0.35 + i * 0.025, portY - 0.015, -depth / 2 - 0.005);
    group.add(label);
  }
  
  // USB ports (2x)
  for (let i = 0; i < 2; i++) {
    const usbGeo = new THREE.BoxGeometry(0.012, 0.006, 0.02);
    const usb = new THREE.Mesh(usbGeo, portMat);
    usb.position.set(-width * 0.25 + i * 0.02, portY, -depth / 2 - 0.01);
    applyShadows(usb);
    group.add(usb);
  }
  
  // Power port
  const powerGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.02, 12);
  const power = new THREE.Mesh(powerGeo, portMat);
  power.rotation.x = Math.PI / 2;
  power.position.set(-width * 0.42, portY, -depth / 2 - 0.01);
  applyShadows(power);
  group.add(power);
  
  // Stand base
  const standBaseGeo = new THREE.BoxGeometry(0.35, 0.03, 0.25);
  const standBase = new THREE.Mesh(standBaseGeo, frameMat);
  standBase.position.set(0, -0.015, 0);
  applyShadows(standBase);
  group.add(standBase);
  
  // Stand neck
  const standNeckGeo = new THREE.BoxGeometry(0.08, 0.15, 0.06);
  const standNeck = new THREE.Mesh(standNeckGeo, frameMat);
  standNeck.position.set(0, 0.075, -0.03);
  applyShadows(standNeck);
  group.add(standNeck);
  
  // Position the group
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createTV.metadata = {
  category: 'electronics',
  name: 'TV',
  description: 'Flat screen television with stand',
  dimensions: { width: 1.2, height: 0.7, depth: 0.05 },
  interactive: false
};

/**
 * Create a TV stand asset
 * @param {Object} spec - Asset specification
 * @param {Object} THREE - Three.js library reference
 * @param {Object} context - Context with scene, objects, gridSize
 * @returns {THREE.Group}
 */
function createTVStand(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = 1.5;
  const height = 0.5;
  const depth = 0.4;
  
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.7 });
  
  // Top surface
  const topGeo = new THREE.BoxGeometry(width, 0.05, depth);
  const top = new THREE.Mesh(topGeo, woodMat);
  top.position.y = height;
  applyShadows(top);
  group.add(top);
  
  // Legs
  const legGeo = new THREE.BoxGeometry(0.08, height, 0.08);
  [[width / 2 - 0.1, depth / 2 - 0.1], [-width / 2 + 0.1, depth / 2 - 0.1],
   [width / 2 - 0.1, -depth / 2 + 0.1], [-width / 2 + 0.1, -depth / 2 + 0.1]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(legGeo, woodMat);
    leg.position.set(x, height / 2, z);
    applyShadows(leg);
    group.add(leg);
  });
  
  // Shelf
  const shelfGeo = new THREE.BoxGeometry(width - 0.2, 0.03, depth - 0.1);
  const shelf = new THREE.Mesh(shelfGeo, woodMat);
  shelf.position.y = height * 0.4;
  applyShadows(shelf);
  group.add(shelf);
  
  // Position the group
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createTVStand.metadata = {
  category: 'electronics',
  name: 'TV Stand',
  description: 'Wooden stand for television with shelf',
  dimensions: { width: 1.5, height: 0.5, depth: 0.4 },
  interactive: false
};

/**
 * Create a computer desk with computer
 * @param {Object} spec - Asset specification
 * @param {Object} THREE - Three.js library reference
 * @param {Object} context - Context with scene, objects, gridSize
 * @returns {THREE.Group}
 */
function createComputerDesk(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = 1.2;
  const height = 0.75;
  const depth = 0.6;
  
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x5d4e37, roughness: 0.7 });
  
  // Desktop
  const desktopGeo = new THREE.BoxGeometry(width, 0.05, depth);
  const desktop = new THREE.Mesh(desktopGeo, woodMat);
  desktop.position.y = height;
  applyShadows(desktop);
  group.add(desktop);
  
  // Legs
  const legGeo = new THREE.CylinderGeometry(0.03, 0.03, height, 8);
  [[width / 2 - 0.1, depth / 2 - 0.1], [-width / 2 + 0.1, depth / 2 - 0.1],
   [width / 2 - 0.1, -depth / 2 + 0.1], [-width / 2 + 0.1, -depth / 2 + 0.1]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(legGeo, woodMat);
    leg.position.set(x, height / 2, z);
    applyShadows(leg);
    group.add(leg);
  });
  
  // Monitor
  const monitorGeo = new THREE.BoxGeometry(0.5, 0.35, 0.05);
  const monitorMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3, metalness: 0.7 });
  const monitor = new THREE.Mesh(monitorGeo, monitorMat);
  monitor.position.set(0, height + 0.25, -depth * 0.2);
  applyShadows(monitor);
  group.add(monitor);
  
  // Monitor stand
  const standGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.15, 8);
  const stand = new THREE.Mesh(standGeo, monitorMat);
  stand.position.set(0, height + 0.075, -depth * 0.2);
  applyShadows(stand);
  group.add(stand);
  
  // Keyboard
  const keyboardGeo = new THREE.BoxGeometry(0.4, 0.02, 0.15);
  const keyboard = new THREE.Mesh(keyboardGeo, monitorMat);
  keyboard.position.set(0, height + 0.01, depth * 0.1);
  applyShadows(keyboard);
  group.add(keyboard);
  
  // Position the group
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createComputerDesk.metadata = {
  category: 'electronics',
  name: 'Computer Desk',
  description: 'Desk with monitor, keyboard, and computer setup',
  dimensions: { width: 1.2, height: 0.75, depth: 0.6 },
  interactive: false
};

/**
 * Create a computer tower asset
 * @param {Object} spec - Asset specification
 * @param {Object} THREE - Three.js library reference
 * @param {Object} context - Context with scene, objects, gridSize
 * @returns {THREE.Group}
 */
function createComputerTower(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = 0.2;
  const height = 0.45;
  const depth = 0.45;
  
  // Tower case
  const caseGeo = new THREE.BoxGeometry(width, height, depth);
  const caseMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0x1a1a1a,
    roughness: 0.5,
    metalness: 0.6
  });
  const towerCase = new THREE.Mesh(caseGeo, caseMat);
  towerCase.position.y = height / 2;
  applyShadows(towerCase);
  group.add(towerCase);
  
  // Front panel (top section)
  const panelGeo = new THREE.BoxGeometry(width * 0.95, height * 0.25, 0.015);
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.6
  });
  const panel = new THREE.Mesh(panelGeo, panelMat);
  panel.position.set(0, height * 0.75, depth / 2 + 0.008);
  applyShadows(panel);
  group.add(panel);
  
  // Power button (raised circular)
  const powerBtnGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.008, 16);
  const powerBtnMat = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.4,
    metalness: 0.3
  });
  const powerBtn = new THREE.Mesh(powerBtnGeo, powerBtnMat);
  powerBtn.rotation.x = Math.PI / 2;
  powerBtn.position.set(0, height * 0.85, depth / 2 + 0.02);
  applyShadows(powerBtn);
  group.add(powerBtn);
  
  // Power LED (next to button)
  const ledGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.006, 12);
  const ledMat = new THREE.MeshStandardMaterial({
    color: spec.isOn ? 0x00ff00 : 0x004400,
    emissive: spec.isOn ? 0x00ff00 : 0x000000,
    emissiveIntensity: spec.isOn ? 0.7 : 0
  });
  const led = new THREE.Mesh(ledGeo, ledMat);
  led.rotation.x = Math.PI / 2;
  led.position.set(0.03, height * 0.85, depth / 2 + 0.018);
  applyShadows(led);
  group.add(led);
  
  // HDD activity LED
  const hddLedGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.006, 12);
  const hddLedMat = new THREE.MeshStandardMaterial({
    color: 0xff6600,
    emissive: 0xff3300,
    emissiveIntensity: Math.random() * 0.5
  });
  const hddLed = new THREE.Mesh(hddLedGeo, hddLedMat);
  hddLed.rotation.x = Math.PI / 2;
  hddLed.position.set(-0.03, height * 0.85, depth / 2 + 0.018);
  applyShadows(hddLed);
  group.add(hddLed);
  
  // USB ports (front, top section)
  const usbMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7 });
  for (let i = 0; i < 2; i++) {
    const usbGeo = new THREE.BoxGeometry(0.012, 0.006, 0.012);
    const usb = new THREE.Mesh(usbGeo, usbMat);
    usb.position.set(-0.04 + i * 0.018, height * 0.78, depth / 2 + 0.018);
    applyShadows(usb);
    group.add(usb);
    
    // USB interior (blue plastic)
    const usbInnerGeo = new THREE.BoxGeometry(0.008, 0.003, 0.002);
    const usbInnerMat = new THREE.MeshStandardMaterial({ color: 0x0066ff });
    const usbInner = new THREE.Mesh(usbInnerGeo, usbInnerMat);
    usbInner.position.set(-0.04 + i * 0.018, height * 0.78, depth / 2 + 0.024);
    group.add(usbInner);
  }
  
  // Audio jacks (headphone + mic)
  const jackGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.015, 12);
  const jackMat = new THREE.MeshStandardMaterial({ color: 0x00aa00, roughness: 0.6 });
  const jackMat2 = new THREE.MeshStandardMaterial({ color: 0xff88aa, roughness: 0.6 });
  
  const headphoneJack = new THREE.Mesh(jackGeo, jackMat);
  headphoneJack.rotation.x = Math.PI / 2;
  headphoneJack.position.set(0.04, height * 0.78, depth / 2 + 0.02);
  applyShadows(headphoneJack);
  group.add(headphoneJack);
  
  const micJack = new THREE.Mesh(jackGeo, jackMat2);
  micJack.rotation.x = Math.PI / 2;
  micJack.position.set(0.06, height * 0.78, depth / 2 + 0.02);
  applyShadows(micJack);
  group.add(micJack);
  
  // Optical drive bay (DVD)
  const driveGeo = new THREE.BoxGeometry(width * 0.92, 0.03, 0.01);
  const driveMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7 });
  const drive = new THREE.Mesh(driveGeo, driveMat);
  drive.position.set(0, height * 0.65, depth / 2 + 0.006);
  applyShadows(drive);
  group.add(drive);
  
  // Drive eject button
  const ejectGeo = new THREE.BoxGeometry(0.008, 0.006, 0.004);
  const eject = new THREE.Mesh(ejectGeo, new THREE.MeshStandardMaterial({ color: 0x333333 }));
  eject.position.set(width * 0.35, height * 0.65, depth / 2 + 0.012);
  applyShadows(eject);
  group.add(eject);
  
  // Ventilation grills (side panels)
  const ventMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.9 });
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 3; col++) {
      const slotGeo = new THREE.BoxGeometry(0.002, 0.03, 0.004);
      const slot = new THREE.Mesh(slotGeo, ventMat);
      slot.position.set(
        -width / 2 - 0.002,
        height * 0.35 + row * 0.035,
        -depth / 4 + col * 0.025
      );
      applyShadows(slot);
      group.add(slot);
    }
  }
  
  // Back I/O panel
  const ioMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.6 });
  const ioPanelGeo = new THREE.BoxGeometry(width * 0.8, height * 0.15, 0.01);
  const ioPanel = new THREE.Mesh(ioPanelGeo, ioMat);
  ioPanel.position.set(0, height * 0.85, -depth / 2 - 0.005);
  applyShadows(ioPanel);
  group.add(ioPanel);
  
  // Back ports (USB, Ethernet, Display, Audio)
  const backPortY = height * 0.85;
  
  // USB ports (4x)
  for (let i = 0; i < 4; i++) {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const backUsbGeo = new THREE.BoxGeometry(0.012, 0.006, 0.012);
    const backUsb = new THREE.Mesh(backUsbGeo, usbMat);
    backUsb.position.set(-width * 0.25 + col * 0.018, backPortY - row * 0.015, -depth / 2 - 0.012);
    applyShadows(backUsb);
    group.add(backUsb);
  }
  
  // Ethernet port
  const ethGeo = new THREE.BoxGeometry(0.016, 0.012, 0.012);
  const ethMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.6 });
  const eth = new THREE.Mesh(ethGeo, ethMat);
  eth.position.set(0, backPortY, -depth / 2 - 0.012);
  applyShadows(eth);
  group.add(eth);
  
  // Display ports (HDMI, DisplayPort)
  for (let i = 0; i < 2; i++) {
    const dpGeo = new THREE.BoxGeometry(0.015, 0.008, 0.012);
    const dp = new THREE.Mesh(dpGeo, new THREE.MeshStandardMaterial({ color: 0x333333 }));
    dp.position.set(width * 0.15 + i * 0.02, backPortY, -depth / 2 - 0.012);
    applyShadows(dp);
    group.add(dp);
  }
  
  // Audio ports (3x jacks)
  for (let i = 0; i < 3; i++) {
    const audioJackGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.015, 12);
    const audioColors = [0x00ff00, 0xff88aa, 0x0066ff];
    const audioJack = new THREE.Mesh(audioJackGeo, new THREE.MeshStandardMaterial({ color: audioColors[i] }));
    audioJack.rotation.x = Math.PI / 2;
    audioJack.position.set(width * 0.2 + i * 0.012, backPortY - 0.03, -depth / 2 - 0.01);
    applyShadows(audioJack);
    group.add(audioJack);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createComputerTower.metadata = {
  category: 'electronics',
  name: 'Computer Tower',
  description: 'Desktop computer tower case',
  dimensions: { width: 0.2, depth: 0.45, height: 0.45 },
  interactive: false
};

/**
 * Create mechanical keyboard asset (60% ANSI layout from fullhand-complete.html)
 */
function createKeyboard(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const ANSI60 = [
    ['Esc','1','2','3','4','5','6','7','8','9','0','-','=','Backspace'],
    ['Tab','Q','W','E','R','T','Y','U','I','O','P','[',']','\\'],
    ['Caps','A','S','D','F','G','H','J','K','L',';','"','Enter'],
    ['Shift','Z','X','C','V','B','N','M',',','.','/','Shift'],
    ['Ctrl','Win','Alt','Space','Alt','Fn','Menu','Ctrl']
  ];
  
  const keyWidths = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [1.5,1,1,1,1,1,1,1,1,1,1,1,1,1.5],
    [1.75,1,1,1,1,1,1,1,1,1,1,1,2.25],
    [2.25,1,1,1,1,1,1,1,1,1,1,2.75],
    [1.25,1.25,1.25,6.25,1.25,1.25,1.25,1.25]
  ];
  
  // Create at full scale first, then scale down entire group
  // This prevents geometry from becoming "pointy" when deformations are scaled
  const fullScaleUnit = 1.0;
  const fullScaleGap = 0.05;
  const fullScaleKeyHeight = 0.7;
  
  // Base plate at full scale
  const basePlate = new THREE.Mesh(
    new THREE.BoxGeometry(15.5, 0.5, 5.5),
    new THREE.MeshStandardMaterial({color:0xb8a68f, roughness:0.7, metalness:0.05})
  );
  basePlate.position.set(0, 0.25, 0);
  applyShadows(basePlate);
  group.add(basePlate);
  
  let zOff = -2.5;
  
  for (let r = 0; r < ANSI60.length; r++) {
    const row = ANSI60[r];
    const widths = keyWidths[r];
    let xOff = -7.5;
    
    for (let i = 0; i < row.length; i++) {
      const w = widths[i];
      const label = row[i];
      const keyWidth = w * fullScaleUnit - fullScaleGap;
      const keyDepth = fullScaleUnit - fullScaleGap;
      
      // Create individual key with proper geometry at FULL SCALE
      const keyGeo = new THREE.BoxGeometry(keyWidth, fullScaleKeyHeight, keyDepth, 8, 4, 8);
      const keyPositions = keyGeo.attributes.position;
      
      // Add key cap profile (tapered top) - deformation at full scale
      for (let j = 0; j < keyPositions.count; j++) {
        const x = keyPositions.getX(j);
        const y = keyPositions.getY(j);
        const z = keyPositions.getZ(j);
        
        if (y > 0) { // Top half
          const ty = (y + fullScaleKeyHeight / 2) / fullScaleKeyHeight;
          const taper = 0.15;
          const taperScale = 1 - taper * ty;
          keyPositions.setX(j, x * taperScale);
          keyPositions.setZ(j, z * taperScale);
        }
      }
      keyGeo.computeVertexNormals();
      
      const keyMat = new THREE.MeshStandardMaterial({
        color: 0xd7ceb2,
        roughness: 0.6
      });
      const key = new THREE.Mesh(keyGeo, keyMat);
      
      const keyX = xOff + w * fullScaleUnit * 0.5;
      const keyZ = zOff;
      key.position.set(keyX, 0.9, keyZ);
      applyShadows(key);
      group.add(key);
      
      xOff += w * fullScaleUnit;
    }
    zOff += fullScaleUnit;
  }
  
  // Now scale the entire group uniformly - preserves geometry quality
  const finalScale = 0.05;
  group.scale.set(finalScale, finalScale, finalScale);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createKeyboard.metadata = {
  category: 'electronics',
  name: 'Mechanical Keyboard',
  description: '60% ANSI mechanical keyboard',
  dimensions: { width: 0.775, depth: 0.275, height: 0.035 },
  interactive: false
};

/**
 * Create desk lamp asset
 */
function createDeskLamp(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Base
  const baseGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.015, 16);
  const baseMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0x2a2a2a,
    roughness: 0.5,
    metalness: 0.6
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.0075;
  applyShadows(base);
  group.add(base);
  
  // Arm segment 1
  const arm1Geo = new THREE.CylinderGeometry(0.01, 0.01, 0.25, 12);
  const arm1 = new THREE.Mesh(arm1Geo, baseMat);
  arm1.position.set(0, 0.14, 0);
  arm1.rotation.z = -Math.PI / 6;
  applyShadows(arm1);
  group.add(arm1);
  
  // Arm segment 2
  const arm2 = arm1.clone();
  arm2.position.set(0.11, 0.255, 0);
  arm2.rotation.z = Math.PI / 4;
  applyShadows(arm2);
  group.add(arm2);
  
  // Lamp head
  const headGeo = new THREE.ConeGeometry(0.06, 0.08, 16, 1, true);
  const headMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0x2a2a2a,
    roughness: 0.6,
    side: THREE.DoubleSide
  });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.set(0.2, 0.38, 0);
  head.rotation.set(0, 0, Math.PI);
  applyShadows(head);
  group.add(head);
  
  // Bulb (if lit)
  if (spec.lit) {
    const bulbGeo = new THREE.SphereGeometry(0.02, 16, 16);
    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xffffcc,
      emissive: 0xffffcc,
      emissiveIntensity: 0.8
    });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(0.2, 0.35, 0);
    group.add(bulb);
    
    const light = new THREE.PointLight(0xffffcc, 0.5, 1.5);
    light.position.set(0.2, 0.35, 0);
    group.add(light);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createDeskLamp.metadata = {
  category: 'electronics',
  name: 'Desk Lamp',
  description: 'Adjustable desk lamp',
  dimensions: { width: 0.2, depth: 0.2, height: 0.4 },
  interactive: false
};

/**
 * Create TV remote asset
 */
function createRemote(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = 0.05;
  const height = 0.15;
  const depth = 0.02;
  
  // Main body with rounded edges
  const bodyGeo = new THREE.BoxGeometry(width, height, depth, 6, 12, 4);
  const positions = bodyGeo.attributes.position;
  
  // Round corners
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    
    const nx = x / (width / 2);
    const ny = y / (height / 2);
    const nz = z / (depth / 2);
    
    // Round top and bottom more
    if (Math.abs(ny) > 0.8) {
      const factor = 0.85;
      positions.setX(i, x * factor);
      positions.setZ(i, z * factor);
    }
  }
  bodyGeo.computeVertexNormals();
  
  const bodyMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0x2a2a2a,
    roughness: 0.6
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = height / 2;
  applyShadows(body);
  group.add(body);
  
  // D-pad
  const dpadSize = 0.015;
  const dpadMat = new THREE.MeshStandardMaterial({
    color: 0x444444,
    roughness: 0.7
  });
  
  // Center circle
  const centerGeo = new THREE.CylinderGeometry(dpadSize * 0.6, dpadSize * 0.6, 0.002, 12);
  const center = new THREE.Mesh(centerGeo, dpadMat);
  center.position.set(0, height * 0.6, depth / 2 + 0.001);
  center.rotation.x = Math.PI / 2;
  group.add(center);
  
  // Number buttons (3x3 grid)
  const buttonGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.002, 12);
  const buttonMat = new THREE.MeshStandardMaterial({
    color: 0x555555,
    roughness: 0.6
  });
  
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const button = new THREE.Mesh(buttonGeo, buttonMat);
      button.position.set(
        -0.012 + col * 0.012,
        height * 0.35 - row * 0.015,
        depth / 2 + 0.0015
      );
      button.rotation.x = Math.PI / 2;
      group.add(button);
    }
  }
  
  // Power button (red)
  const powerGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.002, 12);
  const powerMat = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    roughness: 0.5
  });
  const power = new THREE.Mesh(powerGeo, powerMat);
  power.position.set(0, height * 0.85, depth / 2 + 0.0015);
  power.rotation.x = Math.PI / 2;
  group.add(power);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.set(spec.rotationX || 0, spec.rotation || 0, spec.rotationZ || 0);
  
  return context.addObject(group);
}

createRemote.metadata = {
  category: 'electronics',
  name: 'TV Remote',
  description: 'Television remote control',
  dimensions: { width: 0.05, depth: 0.02, height: 0.15 },
  interactive: false
};

/**
 * Create game controller asset
 */
function createGameController(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Controller body (ergonomic shape)
  const bodyGeo = new THREE.BoxGeometry(0.15, 0.04, 0.1, 16, 8, 12);
  const positions = bodyGeo.attributes.position;
  
  // Ergonomic grip shaping
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    
    const nx = x / 0.075;
    const nz = z / 0.05;
    
    // Grip handles
    if (Math.abs(nx) > 0.5) {
      const gripFactor = (Math.abs(nx) - 0.5) * 2;
      positions.setY(i, y - gripFactor * 0.015);
      positions.setZ(i, z * (1 + gripFactor * 0.3));
    }
  }
  bodyGeo.computeVertexNormals();
  
  const bodyMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0x2a2a2a,
    roughness: 0.5
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.02;
  applyShadows(body);
  group.add(body);
  
  // D-pad (left side)
  const dpadGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.003, 4);
  const dpadMat = new THREE.MeshStandardMaterial({
    color: 0x444444,
    roughness: 0.7
  });
  const dpad = new THREE.Mesh(dpadGeo, dpadMat);
  dpad.position.set(-0.04, 0.04, 0);
  dpad.rotation.x = Math.PI / 2;
  dpad.rotation.z = Math.PI / 4;
  group.add(dpad);
  
  // Action buttons (right side - ABXY)
  const buttonGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.003, 16);
  const colors = [0xff4444, 0x4444ff, 0xffff44, 0x44ff44]; // ABXY colors
  const positions2 = [
    [0.04, 0.04, -0.015],  // A (bottom)
    [0.055, 0.04, 0],      // B (right)
    [0.04, 0.04, 0.015],   // X (top)
    [0.025, 0.04, 0]       // Y (left)
  ];
  
  positions2.forEach((pos, i) => {
    const buttonMat = new THREE.MeshStandardMaterial({
      color: colors[i],
      roughness: 0.4
    });
    const button = new THREE.Mesh(buttonGeo, buttonMat);
    button.position.set(...pos);
    button.rotation.x = Math.PI / 2;
    group.add(button);
  });
  
  // Analog sticks
  const stickGeo = new THREE.CylinderGeometry(0.01, 0.012, 0.008, 16);
  const stickMat = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.6
  });
  
  [-0.02, 0.02].forEach(x => {
    const stick = new THREE.Mesh(stickGeo, stickMat);
    stick.position.set(x, 0.044, -0.03);
    stick.rotation.x = Math.PI / 2;
    group.add(stick);
  });
  
  // Shoulder buttons
  const shoulderGeo = new THREE.BoxGeometry(0.03, 0.008, 0.015);
  const shoulderMat = new THREE.MeshStandardMaterial({
    color: 0x444444,
    roughness: 0.5
  });
  
  [-0.06, 0.06].forEach(x => {
    const shoulder = new THREE.Mesh(shoulderGeo, shoulderMat);
    shoulder.position.set(x, 0.042, 0.045);
    group.add(shoulder);
  });
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createGameController.metadata = {
  category: 'electronics',
  name: 'Game Controller',
  description: 'Gaming console controller',
  dimensions: { width: 0.15, depth: 0.1, height: 0.04 },
  interactive: false
};

/**
 * Create a piano keyboard asset
 */
function createPiano(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const width = 1.5;
  const height = 0.75;
  const depth = 0.6;
  
  // Piano body
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.2, metalness: 0.1 });
  const bodyGeo = new THREE.BoxGeometry(width, height, depth);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = height / 2;
  applyShadows(body);
  group.add(body);
  
  // Lid/top
  const lidGeo = new THREE.BoxGeometry(width, 0.08, depth);
  const lid = new THREE.Mesh(lidGeo, bodyMat);
  lid.position.y = height + 0.04;
  applyShadows(lid);
  group.add(lid);
  
  // Music stand (back)
  const standGeo = new THREE.BoxGeometry(width * 0.8, 0.4, 0.02);
  const standMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.3 });
  const stand = new THREE.Mesh(standGeo, standMat);
  stand.position.set(0, height + 0.3, -depth / 2 + 0.15);
  stand.rotation.x = -Math.PI / 8;
  applyShadows(stand);
  group.add(stand);
  
  // Keyboard section
  const keyboardWidth = width * 0.9;
  const keyboardDepth = depth * 0.4;
  const keyboardY = height + 0.09;
  
  // White keys (7 octaves = 52 keys)
  const whiteKeyCount = 52;
  const whiteKeyWidth = keyboardWidth / whiteKeyCount;
  const whiteKeyHeight = 0.015;
  const whiteKeyDepth = keyboardDepth * 0.9;
  
  const whiteKeyMat = new THREE.MeshStandardMaterial({ color: 0xfaf0e6, roughness: 0.3 });
  const whiteKeyGeo = new THREE.BoxGeometry(whiteKeyWidth * 0.95, whiteKeyHeight, whiteKeyDepth);
  
  for (let i = 0; i < whiteKeyCount; i++) {
    const whiteKey = new THREE.Mesh(whiteKeyGeo, whiteKeyMat);
    whiteKey.position.set(
      -keyboardWidth / 2 + (i + 0.5) * whiteKeyWidth,
      keyboardY,
      depth / 4
    );
    applyShadows(whiteKey);
    group.add(whiteKey);
  }
  
  // Black keys (5 per octave pattern, 7 octaves minus last = 36 keys)
  const blackKeyMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.2 });
  const blackKeyWidth = whiteKeyWidth * 0.6;
  const blackKeyHeight = whiteKeyHeight * 1.3;
  const blackKeyDepth = whiteKeyDepth * 0.6;
  const blackKeyGeo = new THREE.BoxGeometry(blackKeyWidth, blackKeyHeight, blackKeyDepth);
  
  // Pattern: 2 black, skip, 3 black, skip (repeats)
  const blackKeyPattern = [0, 1, -1, 2, 3, 4, -1]; // -1 means skip
  for (let octave = 0; octave < 7; octave++) {
    for (let i = 0; i < 7; i++) {
      if (blackKeyPattern[i] !== -1 && octave * 7 + i < whiteKeyCount - 1) {
        const blackKey = new THREE.Mesh(blackKeyGeo, blackKeyMat);
        const whiteKeyIndex = octave * 7 + i;
        blackKey.position.set(
          -keyboardWidth / 2 + (whiteKeyIndex + 1) * whiteKeyWidth,
          keyboardY + whiteKeyHeight / 2 + blackKeyHeight / 2,
          depth / 4 - whiteKeyDepth * 0.25
        );
        applyShadows(blackKey);
        group.add(blackKey);
      }
    }
  }
  
  // Pedals (3)
  const pedalMat = new THREE.MeshStandardMaterial({ color: 0xb8860b, roughness: 0.3, metalness: 0.7 });
  for (let i = 0; i < 3; i++) {
    const pedalGeo = new THREE.BoxGeometry(0.08, 0.03, 0.15);
    const pedal = new THREE.Mesh(pedalGeo, pedalMat);
    pedal.position.set(
      (i - 1) * 0.15,
      0.015,
      depth / 2 - 0.1
    );
    pedal.rotation.x = Math.PI / 12;
    applyShadows(pedal);
    group.add(pedal);
    
    // Pedal rod
    const rodGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.25, 8);
    const rod = new THREE.Mesh(rodGeo, pedalMat);
    rod.position.set(
      (i - 1) * 0.15,
      0.125,
      depth / 2 - 0.08
    );
    applyShadows(rod);
    group.add(rod);
  }
  
  // Legs (4)
  const legGeo = new THREE.CylinderGeometry(0.04, 0.05, height, 12);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3 });
  [
    [width / 2 - 0.1, depth / 2 - 0.1],
    [-width / 2 + 0.1, depth / 2 - 0.1],
    [width / 2 - 0.1, -depth / 2 + 0.1],
    [-width / 2 + 0.1, -depth / 2 + 0.1]
  ].forEach(([x, z]) => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(x, height / 2, z);
    applyShadows(leg);
    group.add(leg);
  });
  
  // Brand name plate
  const plateGeo = new THREE.BoxGeometry(0.3, 0.04, 0.01);
  const plateMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.8 });
  const plate = new THREE.Mesh(plateGeo, plateMat);
  plate.position.set(0, height * 0.6, depth / 2 + 0.005);
  applyShadows(plate);
  group.add(plate);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createPiano.metadata = {
  category: 'electronics',
  name: 'Piano Keyboard',
  description: 'Upright piano with 88 keys',
  dimensions: { width: 1.5, depth: 0.6, height: 0.83 },
  interactive: false
};

// Export all electronics creators
export const creators = {
  tv: createTV,
  tvstand: createTVStand,
  computerdesk: createComputerDesk,
  computertower: createComputerTower,
  keyboard: createKeyboard,
  desklamp: createDeskLamp,
  remote: createRemote,
  gamecontroller: createGameController,
  piano: createPiano
};

