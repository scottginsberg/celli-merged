// ==================== OFFICE SUPPLIES ASSET CREATORS ====================
// Universal office supply creation functions

import { createPositionedGroup, applyShadows } from '../asset-context.js';

/**
 * Create simple wood texture for pencil
 */
function createWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  // Base wood color
  ctx.fillStyle = '#d4a574';
  ctx.fillRect(0, 0, 64, 64);
  
  // Wood grain lines
  ctx.strokeStyle = 'rgba(139, 90, 43, 0.3)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 64; i += 4) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(64, i + Math.sin(i * 0.5) * 2);
    ctx.stroke();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 10);
  return texture;
}

/**
 * Create pencil asset
 */
function createPencil(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Wooden body section (hexagonal with wood texture)
  const bodyGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.13, 6);
  const woodTexture = createWoodTexture();
  const bodyMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0xffcc00,
    roughness: 0.7,
    map: woodTexture
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.065;
  applyShadows(body);
  group.add(body);
  
  // Exposed wood at tip (tapered cone)
  const woodTipGeo = new THREE.ConeGeometry(0.003, 0.015, 6);
  const woodTipMat = new THREE.MeshStandardMaterial({
    color: 0xd4a574,
    roughness: 0.8
  });
  const woodTip = new THREE.Mesh(woodTipGeo, woodTipMat);
  woodTip.position.y = 0.1375;
  applyShadows(woodTip);
  group.add(woodTip);
  
  // Graphite tip (sharp point)
  const graphiteGeo = new THREE.ConeGeometry(0.0008, 0.008, 6);
  const graphiteMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.3,
    metalness: 0.6
  });
  const graphite = new THREE.Mesh(graphiteGeo, graphiteMat);
  graphite.position.y = 0.149;
  applyShadows(graphite);
  group.add(graphite);
  
  // Metal ferrule (connecting band)
  const ferruleGeo = new THREE.CylinderGeometry(0.0035, 0.004, 0.008, 12);
  const ferruleMat = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    roughness: 0.2,
    metalness: 0.95
  });
  const ferrule = new THREE.Mesh(ferruleGeo, ferruleMat);
  ferrule.position.y = 0.004;
  applyShadows(ferrule);
  group.add(ferrule);
  
  // Eraser (rounded cylinder)
  const eraserGeo = new THREE.CylinderGeometry(0.0038, 0.0038, 0.015, 12);
  const eraserMat = new THREE.MeshStandardMaterial({
    color: 0xffb6c1,
    roughness: 0.95
  });
  const eraser = new THREE.Mesh(eraserGeo, eraserMat);
  eraser.position.y = -0.0035;
  applyShadows(eraser);
  group.add(eraser);
  
  // Rounded cap on eraser
  const capGeo = new THREE.SphereGeometry(0.0038, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const cap = new THREE.Mesh(capGeo, eraserMat);
  cap.position.y = -0.011;
  group.add(cap);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  group.rotation.z = Math.PI / 2; // Lay flat
  
  return context.addObject(group);
}

createPencil.metadata = {
  category: 'office',
  name: 'Pencil',
  description: 'Wooden pencil with eraser',
  dimensions: { width: 0.15, depth: 0.007, height: 0.007 },
  interactive: false
};

/**
 * Create lined paper texture
 */
function createLinedPaperTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  // Paper background
  ctx.fillStyle = '#fffef0';
  ctx.fillRect(0, 0, 128, 256);
  
  // Horizontal lines
  ctx.strokeStyle = 'rgba(150, 180, 220, 0.4)';
  ctx.lineWidth = 1;
  for (let i = 20; i < 256; i += 16) {
    ctx.beginPath();
    ctx.moveTo(10, i);
    ctx.lineTo(118, i);
    ctx.stroke();
  }
  
  // Margin line
  ctx.strokeStyle = 'rgba(255, 100, 100, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(20, 10);
  ctx.lineTo(20, 246);
  ctx.stroke();
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Create notepad asset
 */
function createNotepad(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Cardboard backing
  const backingGeo = new THREE.BoxGeometry(0.1, 0.002, 0.15);
  const backingMat = new THREE.MeshStandardMaterial({
    color: 0xd2b48c,
    roughness: 0.9
  });
  const backing = new THREE.Mesh(backingGeo, backingMat);
  backing.position.y = 0.001;
  applyShadows(backing);
  group.add(backing);
  
  // Pad body (with lined texture on top)
  const padGeo = new THREE.BoxGeometry(0.1, 0.013, 0.15);
  const linedTexture = createLinedPaperTexture(THREE);
  const padMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0xffffdd,
    roughness: 0.95,
    map: linedTexture
  });
  const pad = new THREE.Mesh(padGeo, padMat);
  pad.position.y = 0.0085;
  applyShadows(pad);
  group.add(pad);
  
  // Binding/glue strip (top edge)
  const bindingGeo = new THREE.BoxGeometry(0.102, 0.016, 0.008);
  const bindingMat = new THREE.MeshStandardMaterial({
    color: 0x6a6a6a,
    roughness: 0.7
  });
  const binding = new THREE.Mesh(bindingGeo, bindingMat);
  binding.position.set(0, 0.009, -0.075);
  applyShadows(binding);
  group.add(binding);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createNotepad.metadata = {
  category: 'office',
  name: 'Notepad',
  description: 'Yellow notepad with binding',
  dimensions: { width: 0.1, depth: 0.15, height: 0.015 },
  interactive: false
};

/**
 * Create notebook asset
 */
function createNotebook(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Cover
  const coverGeo = new THREE.BoxGeometry(0.15, 0.025, 0.2);
  const coverMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0x4a4a8a,
    roughness: 0.7
  });
  const cover = new THREE.Mesh(coverGeo, coverMat);
  cover.position.y = 0.0125;
  applyShadows(cover);
  group.add(cover);
  
  // Spiral binding
  for (let i = 0; i < 8; i++) {
    const spiralGeo = new THREE.TorusGeometry(0.005, 0.002, 6, 8);
    const spiralMat = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      roughness: 0.3,
      metalness: 0.8
    });
    const spiral = new THREE.Mesh(spiralGeo, spiralMat);
    spiral.rotation.x = Math.PI / 2;
    spiral.position.set(-0.07, 0.0125, -0.08 + i * 0.023);
    group.add(spiral);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createNotebook.metadata = {
  category: 'office',
  name: 'Notebook',
  description: 'Spiral-bound notebook',
  dimensions: { width: 0.15, depth: 0.2, height: 0.025 },
  interactive: false
};

/**
 * Create sticky notes asset
 */
function createStickyNotes(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Stack of sticky notes (with subtle layers)
  const stackGeo = new THREE.BoxGeometry(0.075, 0.02, 0.075);
  const stackMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0xffff66,
    roughness: 0.95
  });
  const stack = new THREE.Mesh(stackGeo, stackMat);
  stack.position.y = 0.01;
  applyShadows(stack);
  group.add(stack);
  
  // Visible layers (edges)
  for (let i = 0; i < 5; i++) {
    const layerGeo = new THREE.BoxGeometry(0.076, 0.0005, 0.076);
    const layer = new THREE.Mesh(layerGeo, stackMat);
    layer.position.set(
      (Math.random() - 0.5) * 0.0005,
      0.02 - i * 0.004,
      (Math.random() - 0.5) * 0.0005
    );
    group.add(layer);
  }
  
  // Individual note on top (slightly pulled up and curled)
  const noteGeo = new THREE.PlaneGeometry(0.075, 0.075, 8, 8);
  const notePositions = noteGeo.attributes.position;
  
  // Add curl/lift effect
  for (let i = 0; i < notePositions.count; i++) {
    const x = notePositions.getX(i);
    const z = notePositions.getZ(i);
    const distFromEdge = Math.max(Math.abs(x / 0.0375), Math.abs(z / 0.0375));
    if (distFromEdge > 0.6) {
      const liftAmount = (distFromEdge - 0.6) * 0.01;
      notePositions.setZ(i, z + liftAmount);
    }
  }
  noteGeo.computeVertexNormals();
  
  const note = new THREE.Mesh(noteGeo, stackMat);
  note.position.set(0.008, 0.022, -0.008);
  note.rotation.set(-Math.PI / 2 + 0.15, 0.1, 0);
  applyShadows(note);
  group.add(note);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createStickyNotes.metadata = {
  category: 'office',
  name: 'Sticky Notes',
  description: 'Stack of sticky notes',
  dimensions: { width: 0.075, depth: 0.075, height: 0.02 },
  interactive: false
};

/**
 * Create a chiclet keyboard (low-profile, simple keys)
 */
function createChicletKeyboard(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const keyboardWidth = 0.45;
  const keyboardDepth = 0.15;
  const keyboardHeight = 0.015;
  
  // Keyboard base (thin, modern)
  const baseMat = new THREE.MeshStandardMaterial({ 
    color: spec.color || 0x2a2a2a, 
    roughness: 0.4,
    metalness: 0.3
  });
  
  const baseGeo = new THREE.BoxGeometry(keyboardWidth, keyboardHeight, keyboardDepth);
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = keyboardHeight / 2;
  applyShadows(base);
  group.add(base);
  
  // Keys layout (ANSI-style simplified)
  const keyLayout = [
    ['Esc', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Back'],
    ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
    ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', '"', 'Enter'],
    ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
    ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'Fn', 'Ctrl']
  ];
  
  const keyWidths = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5],
    [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5],
    [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25],
    [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75],
    [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25]
  ];
  
  const unit = 0.029; // Key unit size (smaller for laptop-style)
  const gap = 0.002; // Minimal gap between keys
  const keyHeight = 0.003; // Very low profile
  
  const keyMat = new THREE.MeshStandardMaterial({ 
    color: 0x1a1a1a, 
    roughness: 0.5,
    metalness: 0.2
  });
  
  const labelMat = new THREE.MeshStandardMaterial({ 
    color: 0xe0e0e0, 
    roughness: 0.8
  });
  
  let zOff = -keyboardDepth / 2 + 0.015;
  
  for (let row = 0; row < keyLayout.length; row++) {
    const keys = keyLayout[row];
    const widths = keyWidths[row];
    let xOff = -keyboardWidth / 2 + 0.015;
    
    for (let i = 0; i < keys.length; i++) {
      const label = keys[i];
      const w = widths[i];
      
      const keyWidth = w * unit - gap;
      const keyDepth = unit - gap;
      
      // Simple flat key (chiclet style)
      const keyGeo = new THREE.BoxGeometry(keyWidth, keyHeight, keyDepth, 1, 1, 1);
      const key = new THREE.Mesh(keyGeo, keyMat);
      key.position.set(
        xOff + keyWidth / 2,
        keyboardHeight + keyHeight / 2,
        zOff + keyDepth / 2
      );
      applyShadows(key);
      group.add(key);
      
      // Simple label (small text indicator - just a dot or small rectangle)
      if (label !== 'Space') {
        const labelSize = Math.min(keyWidth * 0.3, keyDepth * 0.3, 0.004);
        const labelGeo = new THREE.BoxGeometry(labelSize, 0.0005, labelSize);
        const labelMesh = new THREE.Mesh(labelGeo, labelMat);
        labelMesh.position.set(
          key.position.x,
          key.position.y + keyHeight / 2 + 0.0003,
          key.position.z
        );
        group.add(labelMesh);
      }
      
      xOff += w * unit;
    }
    
    zOff += unit;
  }
  
  // Trackpad (integrated)
  const trackpadWidth = 0.12;
  const trackpadDepth = 0.08;
  const trackpadMat = new THREE.MeshStandardMaterial({ 
    color: 0x3a3a3a, 
    roughness: 0.3,
    metalness: 0.2
  });
  
  const trackpadGeo = new THREE.BoxGeometry(trackpadWidth, 0.001, trackpadDepth);
  const trackpad = new THREE.Mesh(trackpadGeo, trackpadMat);
  trackpad.position.set(0, keyboardHeight + 0.0005, keyboardDepth / 2 - 0.045);
  applyShadows(trackpad);
  group.add(trackpad);
  
  // Trackpad buttons
  for (let i = 0; i < 2; i++) {
    const buttonGeo = new THREE.BoxGeometry(trackpadWidth / 2 - 0.001, 0.001, 0.012);
    const button = new THREE.Mesh(buttonGeo, keyMat);
    button.position.set(
      i === 0 ? -trackpadWidth / 4 : trackpadWidth / 4,
      trackpad.position.y,
      trackpadDepth / 2 + trackpad.position.z
    );
    group.add(button);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createChicletKeyboard.metadata = {
  category: 'office',
  name: 'Chiclet Keyboard',
  description: 'Laptop-style low-profile keyboard with trackpad',
  dimensions: { width: 0.45, height: 0.02, depth: 0.15 },
  interactive: false
};

/**
 * Create a mechanical keyboard with pincushion deformation (EXACT from kb.html)
 */
function createMechanicalKeyboard(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const keyboardColor = spec.color || 0xd7ceb2;
  
  // Create color and bump textures for engraved effect (EXACT from kb.html)
  function makeLabelTextures(text) {
    if (!text || text === 'Space') return { map: null, bump: null };
    const size = 256;
    const base = document.createElement('canvas');
    base.width = size;
    base.height = size;
    const bump = document.createElement('canvas');
    bump.width = size;
    bump.height = size;
    const cctx = base.getContext('2d');
    const bctx = bump.getContext('2d');
    
    // Background color
    cctx.fillStyle = '#d7ceb2';
    cctx.fillRect(0, 0, size, size);
    // Bump base (mid-gray)
    bctx.fillStyle = 'rgb(200,200,200)';
    bctx.fillRect(0, 0, size, size);
    
    // Dynamic font size
    let fontSize = 120;
    if (['Shift', 'Caps', 'Backspace'].includes(text)) fontSize = 80;
    if (text.length >= 3 && fontSize === 120) fontSize = 100;
    
    // Draw text on color map
    cctx.fillStyle = '#222';
    cctx.font = `bold ${fontSize}px sans-serif`;
    cctx.textAlign = 'center';
    cctx.textBaseline = 'middle';
    cctx.fillText(text, size / 2, size / 2);
    
    // Draw darker text to bump to engrave (lower where text appears)
    bctx.fillStyle = 'rgb(120,120,120)';
    bctx.font = `bold ${fontSize}px sans-serif`;
    bctx.textAlign = 'center';
    bctx.textBaseline = 'middle';
    bctx.fillText(text, size / 2, size / 2);
    
    const mapTex = new THREE.CanvasTexture(base);
    mapTex.colorSpace = THREE.SRGBColorSpace;
    const bumpTex = new THREE.CanvasTexture(bump);
    return { map: mapTex, bump: bumpTex };
  }
  
  // Create a single key with pincushion deformation (EXACT from kb.html)
  function createKey(width, depth, height, label) {
    const segmentsX = Math.max(16, Math.ceil(width * 20));
    const segmentsZ = Math.max(16, Math.ceil(depth * 20));
    const geo = new THREE.BoxGeometry(width, height, depth, segmentsX, 8, segmentsZ);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    const hx = width / 2, hy = height / 2, hz = depth / 2;
    
    // Safety check to prevent NaN
    if (hx <= 0 || hy <= 0 || hz <= 0) {
      return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: keyboardColor }));
    }
    
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const ty = (v.y + hy) / (2 * hy);
      const taper = 0.28, concave = 0.06; // stronger taper for trapezoid
      const tilt = 0.12; // forward slant amount
      
      // Only taper the top half, keep bottom flat
      if (v.y > 0) {
        const scale = 1 - taper * ty; // inward sides
        v.x *= scale;
        v.z *= scale;
        // Add forward slant (toward negative Z, front of key)
        v.y -= tilt * (v.z / hz) * ty;
        
        // Add concave dip to top
        const divisorX = hx * (1 - taper);
        const divisorZ = hz * (1 - taper);
        if (divisorX > 0.001 && divisorZ > 0.001) {
          const nx = v.x / divisorX;
          const nz = v.z / divisorZ;
          const r2 = Math.min(nx * nx + nz * nz, 1);
          const concaveAmount = Math.min(width, depth) * 0.06;
          v.y -= concaveAmount * Math.pow(1 - r2, 1.5);
        }
      }
      // Bottom stays flat (no modification)
      
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    
    // Add slight color variance
    const hueShift = (Math.random() - 0.5) * 0.02;
    const lightnessShift = (Math.random() - 0.5) * 0.05;
    const baseColor = new THREE.Color(keyboardColor);
    baseColor.offsetHSL(hueShift, 0, lightnessShift);
    const sideColor = new THREE.Color(keyboardColor === 0xd7ceb2 ? 0xc5b89f : keyboardColor * 0.9);
    sideColor.offsetHSL(hueShift, 0, lightnessShift);
    
    const { map: labelMap, bump: labelBump } = makeLabelTextures(label);
    const topMat = labelMap ?
      new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.6,
        metalness: 0.06,
        envMapIntensity: 1.1,
        map: labelMap,
        bumpMap: labelBump,
        bumpScale: -0.008 // negative for engraved effect
      }) :
      new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.6,
        metalness: 0.06,
        envMapIntensity: 1.1
      });
    const sideMat = new THREE.MeshStandardMaterial({ color: sideColor, roughness: 0.8, metalness: 0.05 });
    const mats = [
      sideMat, sideMat, topMat, sideMat, sideMat, sideMat
    ];
    const mesh = new THREE.Mesh(geo, mats);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    return mesh;
  }
  
  // Key layout (EXACT from kb.html)
  const ANSI60 = [
    ['Esc', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
    ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', '"', 'Enter'],
    ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
    ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'Fn', 'Menu', 'Ctrl']
  ];
  
  const keyWidths = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
    [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5],
    [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25],
    [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75],
    [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25]
  ];
  
  // EXACT units from kb.html but SCALED DOWN to match chiclet keyboard size
  const scale = 0.03; // Scale factor to match chiclet keyboard
  const unit = 1.0 * scale, gap = 0.05 * scale;
  const keyHeight = 0.7 * scale;
  
  // Add keyboard base plate with cutouts (EXACT from kb.html)
  const plateThickness = 0.3 * scale;
  const plateMat = new THREE.MeshStandardMaterial({ color: keyboardColor, roughness: 0.6, metalness: 0.1 });
  
  // Main base plate (will be visually behind keys)
  const baseGeo = new THREE.BoxGeometry(15.5 * scale, 0.5 * scale, 5.5 * scale);
  const basePositions = baseGeo.attributes.position;
  const baseV = new THREE.Vector3();
  const hx = (15.5 * scale) / 2, hy = (0.5 * scale) / 2, hz = (5.5 * scale) / 2;
  const baseTaper = 0.12, baseTilt = 0.06;
  
  // Make base slightly trapezoidal and slanted forward
  for (let i = 0; i < basePositions.count; i++) {
    baseV.fromBufferAttribute(basePositions, i);
    const ty = (baseV.y + hy) / (2 * hy);
    const scaleFactor = 1 - baseTaper * ty;
    baseV.x *= scaleFactor;
    baseV.z *= scaleFactor;
    baseV.y -= baseTilt * (baseV.z / hz) * ty;
    basePositions.setXYZ(i, baseV.x, baseV.y, baseV.z);
  }
  baseGeo.computeVertexNormals();
  
  const basePlate = new THREE.Mesh(
    baseGeo,
    new THREE.MeshStandardMaterial({ color: keyboardColor === 0xd7ceb2 ? 0xb8a68f : keyboardColor * 0.85, roughness: 0.7, metalness: 0.05 })
  );
  basePlate.position.set(7.5 * scale, 0.25 * scale, 2.5 * scale);
  applyShadows(basePlate);
  group.add(basePlate);
  
  // Create keys with cutout walls
  let zOff = 0;
  for (let r = 0; r < ANSI60.length; r++) {
    const row = ANSI60[r];
    const widths = keyWidths[r];
    let xOff = 0;
    
    for (let i = 0; i < row.length; i++) {
      const w = widths[i];
      const label = row[i];
      // Space bar: wider top, slower bevel -> custom depth scaling
      const isSpace = label === 'Space';
      const key = createKey(w * unit - gap, unit - gap * (isSpace ? 0.9 : 1), keyHeight, label);
      const keyX = xOff + w * 0.5;
      const keyZ = zOff;
      key.position.set(keyX * scale, 0.9 * scale, keyZ * scale);
      group.add(key);
      
      // Create cutout frame around this key (4 walls) shaped to tapered keys
      const frameThickness = 0.06 * scale;
      const taperMargin = 0.12; // match key taper to avoid collisions
      const cutoutWidth = Math.max(0.1 * scale, (w * unit - gap) * (1 + taperMargin));
      const cutoutDepth = Math.max(0.1 * scale, (unit - gap) * (1 + taperMargin));
      const wallThickness = Math.max(0.05 * scale, 0.05 * scale);
      
      // Only create walls if dimensions are valid
      if (cutoutWidth > 0.1 * scale && cutoutDepth > 0.1 * scale && wallThickness > 0.01 * scale && plateThickness > 0.01 * scale) {
        // Top wall
        const topWall = new THREE.Mesh(new THREE.BoxGeometry(cutoutWidth, plateThickness, wallThickness), plateMat);
        topWall.position.set(keyX * scale, 0.5 * scale, keyZ * scale - cutoutDepth / 2);
        applyShadows(topWall);
        group.add(topWall);
        
        // Bottom wall
        const bottomWall = new THREE.Mesh(new THREE.BoxGeometry(cutoutWidth, plateThickness, wallThickness), plateMat);
        bottomWall.position.set(keyX * scale, 0.5 * scale, keyZ * scale + cutoutDepth / 2);
        applyShadows(bottomWall);
        group.add(bottomWall);
        
        // Left wall
        const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, plateThickness, cutoutDepth), plateMat);
        leftWall.position.set(keyX * scale - cutoutWidth / 2, 0.5 * scale, keyZ * scale);
        applyShadows(leftWall);
        group.add(leftWall);
        
        // Right wall
        const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, plateThickness, cutoutDepth), plateMat);
        rightWall.position.set(keyX * scale + cutoutWidth / 2, 0.5 * scale, keyZ * scale);
        applyShadows(rightWall);
        group.add(rightWall);
      }
      
      xOff += w;
    }
    zOff += 1;
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createMechanicalKeyboard.metadata = {
  category: 'office',
  name: 'Mechanical Keyboard',
  description: 'Full-size mechanical keyboard with pincushion key deformation (scaled down)',
  dimensions: { width: 0.465, height: 0.027, depth: 0.165 },
  interactive: false
};

/**
 * Create grate/mesh texture for pencil holder
 */
function createGrateTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  
  // Base metal color
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(0, 0, 128, 128);
  
  // Hexagonal mesh pattern
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 2;
  const size = 12;
  const spacing = size * 1.5;
  
  for (let row = 0; row < 12; row++) {
    for (let col = 0; col < 12; col++) {
      const x = col * spacing + (row % 2) * (spacing / 2);
      const y = row * spacing * 0.866;
      
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  return texture;
}

/**
 * Create pencil holder with grate texture
 */
function createPencilHolder(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const radius = 0.04;
  const height = 0.12;
  
  // Main cylinder body with grate texture
  const bodyGeo = new THREE.CylinderGeometry(radius, radius, height, 32);
  const grateTexture = createGrateTexture();
  const bodyMat = new THREE.MeshStandardMaterial({
    color: spec.color || 0x2a2a2a,
    roughness: 0.6,
    metalness: 0.4,
    map: grateTexture
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = height / 2;
  applyShadows(body);
  group.add(body);
  
  // Base (slightly wider)
  const baseGeo = new THREE.CylinderGeometry(radius * 1.1, radius * 1.15, 0.005, 32);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.7,
    metalness: 0.3
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.0025;
  applyShadows(base);
  group.add(base);
  
  // Rim at top
  const rimGeo = new THREE.TorusGeometry(radius, 0.003, 8, 32);
  const rim = new THREE.Mesh(rimGeo, baseMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = height;
  applyShadows(rim);
  group.add(rim);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createPencilHolder.metadata = {
  category: 'office',
  name: 'Pencil Holder',
  description: 'Metal mesh pencil holder with grate texture',
  dimensions: { width: 0.09, height: 0.12, depth: 0.09 },
  interactive: false
};

/**
 * Create ballpoint pen with cap
 */
function createBallpointPen(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const bodyColor = spec.color || 0x2a5ea8;
  const bodyLength = 0.12;
  const bodyRadius = 0.004;
  
  // Main body (tapered slightly)
  const bodyGeo = new THREE.CylinderGeometry(bodyRadius * 0.9, bodyRadius, bodyLength, 12);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: bodyColor,
    roughness: 0.4,
    metalness: 0.1
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = bodyLength / 2;
  applyShadows(body);
  group.add(body);
  
  // Grip section (rubber ridges)
  const gripGeo = new THREE.CylinderGeometry(bodyRadius * 1.1, bodyRadius * 1.1, 0.025, 12);
  const gripMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.95
  });
  const grip = new THREE.Mesh(gripGeo, gripMat);
  grip.position.y = bodyLength * 0.7;
  applyShadows(grip);
  group.add(grip);
  
  // Metal tip
  const tipGeo = new THREE.CylinderGeometry(bodyRadius * 0.5, bodyRadius * 0.3, 0.015, 8);
  const tipMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.2,
    metalness: 0.9
  });
  const tip = new THREE.Mesh(tipGeo, tipMat);
  tip.position.y = bodyLength + 0.0075;
  applyShadows(tip);
  group.add(tip);
  
  // Ball point
  const ballGeo = new THREE.SphereGeometry(bodyRadius * 0.25, 8, 8);
  const ball = new THREE.Mesh(ballGeo, tipMat);
  ball.position.y = bodyLength + 0.015;
  applyShadows(ball);
  group.add(ball);
  
  // Cap (same color as body but slightly darker)
  const capGeo = new THREE.CylinderGeometry(bodyRadius * 1.3, bodyRadius * 1.1, 0.05, 12);
  const capMat = new THREE.MeshStandardMaterial({
    color: bodyColor * 0.8,
    roughness: 0.3,
    metalness: 0.1
  });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.y = 0.025;
  applyShadows(cap);
  group.add(cap);
  
  // Cap clip
  const clipGeo = new THREE.BoxGeometry(0.002, 0.035, 0.003);
  const clipMat = new THREE.MeshStandardMaterial({
    color: 0xaaaaaa,
    roughness: 0.3,
    metalness: 0.8
  });
  const clip = new THREE.Mesh(clipGeo, clipMat);
  clip.position.set(0, 0.0175, bodyRadius * 1.3);
  applyShadows(clip);
  group.add(clip);
  
  // Click button at top
  const buttonGeo = new THREE.CylinderGeometry(bodyRadius * 0.6, bodyRadius * 0.8, 0.008, 12);
  const button = new THREE.Mesh(buttonGeo, capMat);
  button.position.y = 0.004;
  group.add(button);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createBallpointPen.metadata = {
  category: 'office',
  name: 'Ballpoint Pen (with cap)',
  description: 'Ballpoint pen with removable cap and clip',
  dimensions: { width: 0.01, height: 0.135, depth: 0.01 },
  interactive: false
};

/**
 * Create ballpoint pen without cap
 */
function createBallpointPenNoCap(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const bodyColor = spec.color || 0x2a5ea8;
  const bodyLength = 0.12;
  const bodyRadius = 0.004;
  
  // Main body (tapered slightly)
  const bodyGeo = new THREE.CylinderGeometry(bodyRadius * 0.9, bodyRadius, bodyLength, 12);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: bodyColor,
    roughness: 0.4,
    metalness: 0.1
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = bodyLength / 2;
  applyShadows(body);
  group.add(body);
  
  // Grip section (rubber ridges)
  const gripGeo = new THREE.CylinderGeometry(bodyRadius * 1.1, bodyRadius * 1.1, 0.025, 12);
  const gripMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.95
  });
  const grip = new THREE.Mesh(gripGeo, gripMat);
  grip.position.y = bodyLength * 0.7;
  applyShadows(grip);
  group.add(grip);
  
  // Metal tip
  const tipGeo = new THREE.CylinderGeometry(bodyRadius * 0.5, bodyRadius * 0.3, 0.015, 8);
  const tipMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.2,
    metalness: 0.9
  });
  const tip = new THREE.Mesh(tipGeo, tipMat);
  tip.position.y = bodyLength + 0.0075;
  applyShadows(tip);
  group.add(tip);
  
  // Ball point
  const ballGeo = new THREE.SphereGeometry(bodyRadius * 0.25, 8, 8);
  const ball = new THREE.Mesh(ballGeo, tipMat);
  ball.position.y = bodyLength + 0.015;
  applyShadows(ball);
  group.add(ball);
  
  // Click button at top (exposed)
  const buttonGeo = new THREE.CylinderGeometry(bodyRadius * 0.6, bodyRadius * 0.8, 0.008, 12);
  const buttonMat = new THREE.MeshStandardMaterial({
    color: bodyColor * 0.8,
    roughness: 0.3,
    metalness: 0.1
  });
  const button = new THREE.Mesh(buttonGeo, buttonMat);
  button.position.y = 0.004;
  group.add(button);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createBallpointPenNoCap.metadata = {
  category: 'office',
  name: 'Ballpoint Pen (no cap)',
  description: 'Ballpoint pen without cap, ready to write',
  dimensions: { width: 0.01, height: 0.125, depth: 0.01 },
  interactive: false
};

/**
 * Create just a pen cap
 */
function createPenCap(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const bodyColor = spec.color || 0x2a5ea8;
  const bodyRadius = 0.004;
  
  // Cap (same color as body but slightly darker)
  const capGeo = new THREE.CylinderGeometry(bodyRadius * 1.3, bodyRadius * 1.1, 0.05, 12);
  const capMat = new THREE.MeshStandardMaterial({
    color: bodyColor * 0.8,
    roughness: 0.3,
    metalness: 0.1
  });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.y = 0.025;
  applyShadows(cap);
  group.add(cap);
  
  // Cap clip
  const clipGeo = new THREE.BoxGeometry(0.002, 0.035, 0.003);
  const clipMat = new THREE.MeshStandardMaterial({
    color: 0xaaaaaa,
    roughness: 0.3,
    metalness: 0.8
  });
  const clip = new THREE.Mesh(clipGeo, clipMat);
  clip.position.set(0, 0.0175, bodyRadius * 1.3);
  applyShadows(clip);
  group.add(clip);
  
  // Inner grip ring (visible inside)
  const innerGeo = new THREE.CylinderGeometry(bodyRadius * 1.05, bodyRadius * 0.95, 0.015, 12);
  const innerMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.6
  });
  const inner = new THREE.Mesh(innerGeo, innerMat);
  inner.position.y = 0.0425;
  group.add(inner);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createPenCap.metadata = {
  category: 'office',
  name: 'Pen Cap',
  description: 'Pen cap with clip (no pen)',
  dimensions: { width: 0.012, height: 0.05, depth: 0.012 },
  interactive: false
};

/**
 * Create mechanical pencil
 */
function createMechanicalPencil(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  const bodyColor = spec.color || 0x3a3a3a;
  const bodyLength = 0.13;
  const bodyRadius = 0.0035;
  
  // Main body (slim metal/plastic)
  const bodyGeo = new THREE.CylinderGeometry(bodyRadius, bodyRadius, bodyLength, 12);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: bodyColor,
    roughness: 0.3,
    metalness: 0.2
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = bodyLength / 2;
  applyShadows(body);
  group.add(body);
  
  // Grip section (textured/knurled)
  const gripGeo = new THREE.CylinderGeometry(bodyRadius * 1.2, bodyRadius * 1.2, 0.03, 12);
  const gripMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.9
  });
  const grip = new THREE.Mesh(gripGeo, gripMat);
  grip.position.y = bodyLength * 0.65;
  applyShadows(grip);
  group.add(grip);
  
  // Metal tip assembly (conical)
  const tipGeo = new THREE.CylinderGeometry(bodyRadius * 0.3, bodyRadius * 0.8, 0.02, 8);
  const tipMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.2,
    metalness: 0.9
  });
  const tip = new THREE.Mesh(tipGeo, tipMat);
  tip.position.y = bodyLength + 0.01;
  applyShadows(tip);
  group.add(tip);
  
  // Lead sleeve (thin tube)
  const sleeveGeo = new THREE.CylinderGeometry(bodyRadius * 0.25, bodyRadius * 0.25, 0.012, 8);
  const sleeve = new THREE.Mesh(sleeveGeo, tipMat);
  sleeve.position.y = bodyLength + 0.026;
  applyShadows(sleeve);
  group.add(sleeve);
  
  // Exposed lead tip
  const leadGeo = new THREE.CylinderGeometry(0.0003, 0.0003, 0.006, 6);
  const leadMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.4
  });
  const lead = new THREE.Mesh(leadGeo, leadMat);
  lead.position.y = bodyLength + 0.035;
  applyShadows(lead);
  group.add(lead);
  
  // Clip at top
  const clipGeo = new THREE.BoxGeometry(0.0015, 0.025, 0.002);
  const clipMat = new THREE.MeshStandardMaterial({
    color: 0x888888,
    roughness: 0.3,
    metalness: 0.7
  });
  const clip = new THREE.Mesh(clipGeo, clipMat);
  clip.position.set(0, 0.0125, bodyRadius * 1.2);
  applyShadows(clip);
  group.add(clip);
  
  // Eraser holder at top (twist mechanism)
  const eraserHolderGeo = new THREE.CylinderGeometry(bodyRadius * 1.1, bodyRadius * 0.9, 0.012, 12);
  const eraserHolder = new THREE.Mesh(eraserHolderGeo, tipMat);
  eraserHolder.position.y = 0.006;
  group.add(eraserHolder);
  
  // Small eraser (often white or pink)
  const eraserGeo = new THREE.CylinderGeometry(bodyRadius * 0.7, bodyRadius * 0.7, 0.006, 12);
  const eraserMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9
  });
  const eraser = new THREE.Mesh(eraserGeo, eraserMat);
  eraser.position.y = 0;
  group.add(eraser);
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createMechanicalPencil.metadata = {
  category: 'office',
  name: 'Mechanical Pencil',
  description: 'Mechanical pencil with metal tip and grip',
  dimensions: { width: 0.008, height: 0.145, depth: 0.008 },
  interactive: false
};

/**
 * Create pencil holder filled with random pens/pencils
 */
function createPencilHolderFilled(spec, THREE, context) {
  const group = new THREE.Group();
  const gridSize = context.gridSize;
  
  // Create the holder first
  const holder = createPencilHolder({ x: 0, y: 0, z: 0 }, THREE, context);
  group.add(holder);
  
  // Available writing tools
  const writingTools = [
    { type: 'pencil', color: 0xffcc00 },
    { type: 'pencil', color: 0xff9900 },
    { type: 'pen', color: 0x2a5ea8 },
    { type: 'pen', color: 0x1a1a1a },
    { type: 'pen', color: 0xaa2222 },
    { type: 'mechanical', color: 0x3a3a3a },
    { type: 'mechanical', color: 0x4a4a8a }
  ];
  
  // Randomly place 5-8 items in the holder
  const count = 5 + Math.floor(Math.random() * 4);
  const radius = 0.03; // Inner radius for placement
  const baseHeight = 0.01;
  
  for (let i = 0; i < count; i++) {
    const impl = writingTools[Math.floor(Math.random() * writingTools.length)];
    
    // Random position within holder (circular distribution)
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const dist = Math.random() * radius * 0.7;
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;
    
    // Random rotation
    const rotation = (Math.random() - 0.5) * 0.3;
    const tilt = (Math.random() - 0.5) * 0.2;
    
    // Create the implement
    let item;
    if (impl.type === 'pencil') {
      item = new THREE.Group();
      // Simplified pencil
      const bodyGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.1, 6);
      const bodyMat = new THREE.MeshStandardMaterial({ color: impl.color, roughness: 0.7 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.05;
      applyShadows(body);
      item.add(body);
      
      const tipGeo = new THREE.ConeGeometry(0.003, 0.01, 6);
      const tipMat = new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.8 });
      const tip = new THREE.Mesh(tipGeo, tipMat);
      tip.position.y = 0.105;
      item.add(tip);
    } else if (impl.type === 'pen') {
      item = new THREE.Group();
      // Simplified pen
      const bodyGeo = new THREE.CylinderGeometry(0.003, 0.004, 0.11, 12);
      const bodyMat = new THREE.MeshStandardMaterial({ color: impl.color, roughness: 0.4, metalness: 0.1 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.055;
      applyShadows(body);
      item.add(body);
      
      const clipGeo = new THREE.BoxGeometry(0.0015, 0.03, 0.002);
      const clipMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.3, metalness: 0.7 });
      const clip = new THREE.Mesh(clipGeo, clipMat);
      clip.position.set(0, 0.02, 0.005);
      item.add(clip);
    } else { // mechanical
      item = new THREE.Group();
      // Simplified mechanical pencil
      const bodyGeo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.12, 12);
      const bodyMat = new THREE.MeshStandardMaterial({ color: impl.color, roughness: 0.3, metalness: 0.2 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.06;
      applyShadows(body);
      item.add(body);
      
      const clipGeo = new THREE.BoxGeometry(0.0015, 0.02, 0.002);
      const clipMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.3, metalness: 0.7 });
      const clip = new THREE.Mesh(clipGeo, clipMat);
      clip.position.set(0, 0.01, 0.004);
      item.add(clip);
    }
    
    item.position.set(x, baseHeight, z);
    item.rotation.x = tilt;
    item.rotation.y = rotation;
    group.add(item);
  }
  
  group.position.set((spec.x || 0) * gridSize, spec.y || 0, (spec.z || 0) * gridSize);
  group.rotation.y = spec.rotation || 0;
  
  return context.addObject(group);
}

createPencilHolderFilled.metadata = {
  category: 'office',
  name: 'Pencil Holder (filled)',
  description: 'Pencil holder with random assortment of pens and pencils',
  dimensions: { width: 0.09, height: 0.12, depth: 0.09 },
  interactive: false
};

// Export all office creators
export const creators = {
  pencil: createPencil,
  notepad: createNotepad,
  notebook: createNotebook,
  stickynotes: createStickyNotes,
  chicletkeyboard: createChicletKeyboard,
  keyboard: createChicletKeyboard,
  mechanicalkeyboard: createMechanicalKeyboard,
  mechanicalkb: createMechanicalKeyboard,
  pencilholder: createPencilHolder,
  ballpointpen: createBallpointPen,
  ballpointpennocap: createBallpointPenNoCap,
  pencap: createPenCap,
  mechanicalpencil: createMechanicalPencil,
  pencilholderfilled: createPencilHolderFilled
};




