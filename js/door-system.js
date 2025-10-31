// ==================== DYNAMIC DOOR FRAME SYSTEM ====================
// Comprehensive door and frame system for 2D walls with room offsets
// Supports variable door styles, opening animations, and automatic frame fitting

import * as THREE from 'three';

/**
 * Door styles with different appearances
 */
export const DOOR_STYLES = {
  modern: {
    panelType: 'flat',
    color: 0xffffff,
    handleStyle: 'horizontal-bar',
    handleColor: 0x888888,
    frameColor: 0xf5f5f5,
    frameThickness: 0.08
  },
  
  traditional: {
    panelType: 'six-panel',
    color: 0xc4a574,
    handleStyle: 'round-knob',
    handleColor: 0xd4af37,
    frameColor: 0xc4a574,
    frameThickness: 0.1
  },
  
  rustic: {
    panelType: 'planks',
    color: 0x8b4513,
    handleStyle: 'lever',
    handleColor: 0x654321,
    frameColor: 0x8b4513,
    frameThickness: 0.12
  },
  
  industrial: {
    panelType: 'metal',
    color: 0x5a5a5a,
    handleStyle: 'pull-handle',
    handleColor: 0x3a3a3a,
    frameColor: 0x6a6a6a,
    frameThickness: 0.06
  },
  
  glass: {
    panelType: 'glass-panel',
    color: 0xffffff,
    opacity: 0.3,
    handleStyle: 'horizontal-bar',
    handleColor: 0xc0c0c0,
    frameColor: 0xf0f0f0,
    frameThickness: 0.05
  },
  
  barn: {
    panelType: 'barn-planks',
    color: 0x704214,
    handleStyle: 'barn-pull',
    handleColor: 0x2a2a2a,
    frameColor: 0x704214,
    frameThickness: 0.15
  }
};

/**
 * Door Frame System
 * Automatically creates frames that fit any opening and hide 2D wall edges
 */
export class DoorFrameSystem {
  
  /**
   * Create a complete door with frame system
   * @param {Object} spec - Door specification
   * @param {number} spec.width - Door opening width
   * @param {number} spec.height - Door opening height (default: 2.0m)
   * @param {number} spec.wallThickness - Wall thickness (default: 0.1m)
   * @param {string} spec.style - Door style (default: 'modern')
   * @param {string} spec.openDirection - 'left' or 'right' (default: 'right')
   * @param {number} spec.x - X position
   * @param {number} spec.z - Z position
   * @param {number} spec.rotation - Y rotation
   * @returns {THREE.Group} Complete door assembly
   */
  static createDoorWithFrame(spec) {
    const group = new THREE.Group();
    
    const width = spec.width || 0.9;
    const height = spec.height || 2.0;
    const wallThickness = spec.wallThickness || 0.1;
    const style = DOOR_STYLES[spec.style] || DOOR_STYLES.modern;
    const openDirection = spec.openDirection || 'right';
    
    // Create door frame (hides wall edges)
    const frame = this.createFrame(width, height, wallThickness, style);
    group.add(frame);
    
    // Create door panel
    const door = this.createDoorPanel(width - 0.08, height - 0.05, style, openDirection);
    door.position.y = 0.025;
    group.add(door);
    
    // Position group
    group.position.set(spec.x || 0, 0, spec.z || 0);
    group.rotation.y = spec.rotation || 0;
    
    // Store metadata
    group.userData.isDoor = true;
    group.userData.isOpen = false;
    group.userData.openDirection = openDirection;
    group.userData.style = spec.style || 'modern';
    group.userData.door = door;
    
    return group;
  }
  
  /**
   * Create door frame that hides 2D wall edges
   */
  static createFrame(width, height, wallThickness, style) {
    const group = new THREE.Group();
    
    const frameThickness = style.frameThickness;
    const frameDepth = wallThickness + 0.04; // Slightly thicker than wall
    const frameMat = new THREE.MeshStandardMaterial({
      color: style.frameColor,
      roughness: 0.6,
      metalness: 0.1
    });
    
    // Top frame (lintel)
    const topGeo = new THREE.BoxGeometry(
      width + frameThickness * 2,
      frameThickness,
      frameDepth
    );
    const topFrame = new THREE.Mesh(topGeo, frameMat);
    topFrame.position.y = height;
    topFrame.castShadow = true;
    topFrame.receiveShadow = true;
    group.add(topFrame);
    
    // Left jamb
    const leftGeo = new THREE.BoxGeometry(
      frameThickness,
      height,
      frameDepth
    );
    const leftFrame = new THREE.Mesh(leftGeo, frameMat);
    leftFrame.position.set(-width / 2 - frameThickness / 2, height / 2, 0);
    leftFrame.castShadow = true;
    leftFrame.receiveShadow = true;
    group.add(leftFrame);
    
    // Right jamb
    const rightGeo = new THREE.BoxGeometry(
      frameThickness,
      height,
      frameDepth
    );
    const rightFrame = new THREE.Mesh(rightGeo, frameMat);
    rightFrame.position.set(width / 2 + frameThickness / 2, height / 2, 0);
    rightFrame.castShadow = true;
    rightFrame.receiveShadow = true;
    group.add(rightFrame);
    
    // Bottom threshold (optional)
    const thresholdGeo = new THREE.BoxGeometry(
      width + frameThickness * 2,
      0.02,
      frameDepth
    );
    const threshold = new THREE.Mesh(thresholdGeo, frameMat);
    threshold.position.y = 0.01;
    threshold.receiveShadow = true;
    group.add(threshold);
    
    return group;
  }
  
  /**
   * Create door panel with style
   */
  static createDoorPanel(width, height, style, openDirection) {
    const group = new THREE.Group();
    
    const doorThickness = 0.04;
    
    // Main door panel
    const panelGeo = new THREE.BoxGeometry(width, height, doorThickness);
    const panelMat = new THREE.MeshStandardMaterial({
      color: style.color,
      roughness: 0.7,
      metalness: 0.1,
      transparent: style.opacity !== undefined,
      opacity: style.opacity || 1.0
    });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.y = height / 2;
    panel.castShadow = true;
    panel.receiveShadow = true;
    group.add(panel);
    
    // Add door details based on panel type
    this.addDoorDetails(group, width, height, doorThickness, style);
    
    // Add handle
    const handle = this.createHandle(style, openDirection);
    const handleSide = openDirection === 'right' ? -width / 2 + 0.1 : width / 2 - 0.1;
    handle.position.set(handleSide, height * 0.45, doorThickness / 2 + 0.02);
    group.add(handle);
    
    // Set pivot point for opening (hinge side)
    const hingeSide = openDirection === 'right' ? width / 2 : -width / 2;
    group.position.x = hingeSide;
    
    return group;
  }
  
  /**
   * Add decorative details to door based on panel type
   */
  static addDoorDetails(doorGroup, width, height, thickness, style) {
    const detailMat = new THREE.MeshStandardMaterial({
      color: style.color - 0x101010, // Slightly darker
      roughness: 0.6,
      metalness: 0.1
    });
    
    switch (style.panelType) {
      case 'six-panel':
        this.addSixPanelDetails(doorGroup, width, height, thickness, detailMat);
        break;
      case 'planks':
        this.addPlankDetails(doorGroup, width, height, thickness, detailMat);
        break;
      case 'barn-planks':
        this.addBarnPlankDetails(doorGroup, width, height, thickness, detailMat);
        break;
      case 'glass-panel':
        this.addGlassPanelDetails(doorGroup, width, height, thickness);
        break;
      case 'metal':
        this.addMetalDetails(doorGroup, width, height, thickness, detailMat);
        break;
    }
  }
  
  /**
   * Six-panel traditional door
   */
  static addSixPanelDetails(group, width, height, thickness, mat) {
    const panelDepth = 0.015;
    const panelInset = 0.08;
    
    // Create 6 raised panels (2 columns x 3 rows)
    const panelWidth = (width - panelInset * 3) / 2;
    const panelHeight = (height - panelInset * 4) / 3;
    
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 2; col++) {
        const panelGeo = new THREE.BoxGeometry(
          panelWidth - 0.04,
          panelHeight - 0.04,
          panelDepth
        );
        const panelMesh = new THREE.Mesh(panelGeo, mat);
        
        const x = (col - 0.5) * (panelWidth + panelInset);
        const y = panelInset + row * (panelHeight + panelInset) + panelHeight / 2;
        
        panelMesh.position.set(x, y, thickness / 2 + panelDepth / 2);
        group.add(panelMesh);
      }
    }
  }
  
  /**
   * Vertical plank door
   */
  static addPlankDetails(group, width, height, thickness, mat) {
    const plankWidth = 0.12;
    const numPlanks = Math.floor(width / plankWidth);
    const actualPlankWidth = width / numPlanks;
    
    for (let i = 0; i < numPlanks; i++) {
      const plankGeo = new THREE.BoxGeometry(actualPlankWidth - 0.004, height, 0.01);
      const plank = new THREE.Mesh(plankGeo, mat);
      plank.position.set(
        -width / 2 + i * actualPlankWidth + actualPlankWidth / 2,
        height / 2,
        thickness / 2 + 0.005
      );
      group.add(plank);
    }
  }
  
  /**
   * Barn door planks with X-brace
   */
  static addBarnPlankDetails(group, width, height, thickness, mat) {
    this.addPlankDetails(group, width, height, thickness, mat);
    
    // Add diagonal X-brace
    const braceWidth = 0.08;
    const braceLength = Math.sqrt(width * width + height * height);
    
    // First diagonal
    const brace1Geo = new THREE.BoxGeometry(braceWidth, braceLength, 0.015);
    const brace1 = new THREE.Mesh(brace1Geo, mat);
    brace1.position.set(0, height / 2, thickness / 2 + 0.01);
    brace1.rotation.z = Math.atan2(height, width);
    group.add(brace1);
    
    // Second diagonal
    const brace2Geo = new THREE.BoxGeometry(braceWidth, braceLength, 0.015);
    const brace2 = new THREE.Mesh(brace2Geo, mat);
    brace2.position.set(0, height / 2, thickness / 2 + 0.01);
    brace2.rotation.z = -Math.atan2(height, width);
    group.add(brace2);
  }
  
  /**
   * Glass panel door
   */
  static addGlassPanelDetails(group, width, height, thickness) {
    const glassGeo = new THREE.BoxGeometry(width - 0.1, height - 0.2, 0.005);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      roughness: 0.1,
      metalness: 0.0,
      transmission: 0.9
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(0, height / 2, thickness / 2);
    group.add(glass);
  }
  
  /**
   * Industrial metal door
   */
  static addMetalDetails(group, width, height, thickness, mat) {
    // Add rivets
    const rivetMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      roughness: 0.3,
      metalness: 0.9
    });
    
    const rivetGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.01, 8);
    const spacing = 0.15;
    
    for (let y = spacing; y < height; y += spacing) {
      for (let x = -width / 2 + spacing; x < width / 2; x += spacing) {
        const rivet = new THREE.Mesh(rivetGeo, rivetMat);
        rivet.rotation.x = Math.PI / 2;
        rivet.position.set(x, y, thickness / 2 + 0.005);
        group.add(rivet);
      }
    }
  }
  
  /**
   * Create door handle based on style
   */
  static createHandle(style, openDirection) {
    const group = new THREE.Group();
    const handleMat = new THREE.MeshStandardMaterial({
      color: style.handleColor,
      roughness: 0.3,
      metalness: 0.8
    });
    
    switch (style.handleStyle) {
      case 'horizontal-bar':
        const barGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.15, 16);
        const bar = new THREE.Mesh(barGeo, handleMat);
        bar.rotation.z = Math.PI / 2;
        group.add(bar);
        break;
        
      case 'round-knob':
        const knobGeo = new THREE.SphereGeometry(0.03, 16, 16);
        const knob = new THREE.Mesh(knobGeo, handleMat);
        group.add(knob);
        break;
        
      case 'lever':
        const leverBaseGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.04, 16);
        const leverBase = new THREE.Mesh(leverBaseGeo, handleMat);
        leverBase.rotation.x = Math.PI / 2;
        group.add(leverBase);
        
        const leverArmGeo = new THREE.BoxGeometry(0.12, 0.02, 0.02);
        const leverArm = new THREE.Mesh(leverArmGeo, handleMat);
        leverArm.position.x = 0.06;
        group.add(leverArm);
        break;
        
      case 'pull-handle':
        const pullGeo = new THREE.TorusGeometry(0.04, 0.01, 8, 16, Math.PI);
        const pull = new THREE.Mesh(pullGeo, handleMat);
        pull.rotation.x = Math.PI / 2;
        group.add(pull);
        break;
        
      case 'barn-pull':
        const barnPullGeo = new THREE.BoxGeometry(0.08, 0.15, 0.03);
        const barnPull = new THREE.Mesh(barnPullGeo, handleMat);
        group.add(barnPull);
        break;
    }
    
    return group;
  }
  
  /**
   * Animate door opening/closing
   * @param {THREE.Group} doorAssembly - Complete door group
   * @param {boolean} open - True to open, false to close
   * @param {number} duration - Animation duration in ms (default: 500)
   */
  static animateDoor(doorAssembly, open, duration = 500) {
    if (!doorAssembly.userData.isDoor) return;
    
    const door = doorAssembly.userData.door;
    if (!door) return;
    
    const openDirection = doorAssembly.userData.openDirection;
    const targetAngle = open ? Math.PI / 2 : 0;
    const startAngle = door.rotation.y;
    const angleDirection = openDirection === 'right' ? -1 : 1;
    
    const startTime = Date.now();
    
    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease-out cubic
      
      door.rotation.y = startAngle + (targetAngle - startAngle) * eased * angleDirection;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        doorAssembly.userData.isOpen = open;
      }
    }
    
    animate();
  }
  
  /**
   * Create room offset configuration
   * Ensures rooms are properly spaced for door transitions
   */
  static createRoomOffset(roomType) {
    const offsets = {
      studio: { x: 0, z: 0 },
      '1br': { x: 15, z: 0 },
      '2br': { x: 30, z: 0 },
      bathroom: { x: 0, z: 15 },
      classroom: { x: 0, z: 30 },
      gymnasium: { x: 45, z: 0 }
    };
    
    return offsets[roomType] || { x: 0, z: 0 };
  }
}

/**
 * Helper function to get random door style
 */
export function getRandomDoorStyle() {
  const styles = Object.keys(DOOR_STYLES);
  return styles[Math.floor(Math.random() * styles.length)];
}

