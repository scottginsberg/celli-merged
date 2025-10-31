/**
 * Vantage Point System
 * Creates high-rise buildings with window-mapped rooms
 * Integrates with infinite hallway system
 */

import * as THREE from 'three';

export class VantagePointSystem {
  constructor(scene, camera, hallwaySystem) {
    this.scene = scene;
    this.camera = camera;
    this.hallwaySystem = hallwaySystem;
    
    // State
    this.active = false;
    this.buildingGroup = new THREE.Group();
    this.currentBuilding = null;
    this.currentRoom = null;
    this.windowMappings = new Map(); // Maps window positions to rooms
    
    // Building parameters
    this.floorHeight = 3.0;
    this.windowWidth = 2.0;
    this.windowHeight = 1.5;
    this.windowSpacing = 0.5;
    this.buildingDepth = 15.0;
    
    // Materials
    this.materials = this.createMaterials();
  }
  
  createMaterials() {
    // Create window texture
    const windowCanvas = document.createElement('canvas');
    windowCanvas.width = 256;
    windowCanvas.height = 256;
    const ctx = windowCanvas.getContext('2d');
    
    // Draw window pattern (grid of lit windows)
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 256, 256);
    
    // Create grid of windows (4x4)
    const windowsPerRow = 4;
    const windowSize = 256 / windowsPerRow;
    const windowPadding = windowSize * 0.15;
    
    for (let y = 0; y < windowsPerRow; y++) {
      for (let x = 0; x < windowsPerRow; x++) {
        // Randomly light windows
        if (Math.random() > 0.3) {
          const brightness = 180 + Math.random() * 75;
          const warmth = Math.random() > 0.5 ? brightness : brightness * 0.8;
          ctx.fillStyle = `rgb(${brightness}, ${warmth}, ${brightness * 0.7})`;
          
          ctx.fillRect(
            x * windowSize + windowPadding,
            y * windowSize + windowPadding,
            windowSize - windowPadding * 2,
            windowSize - windowPadding * 2
          );
        }
      }
    }
    
    const windowTexture = new THREE.CanvasTexture(windowCanvas);
    windowTexture.wrapS = THREE.RepeatWrapping;
    windowTexture.wrapT = THREE.RepeatWrapping;
    
    return {
      building: new THREE.MeshStandardMaterial({
        color: 0x2a2a3e,
        roughness: 0.7,
        metalness: 0.3,
        map: windowTexture
      }),
      roomFloor: new THREE.MeshStandardMaterial({
        color: 0x8b7355,
        roughness: 0.9
      }),
      roomWall: new THREE.MeshStandardMaterial({
        color: 0xe8e8e8,
        roughness: 0.8
      }),
      roomCeiling: new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.9
      }),
      window: new THREE.MeshStandardMaterial({
        color: 0x88ccff,
        transparent: true,
        opacity: 0.3,
        roughness: 0.1,
        metalness: 0.1
      })
    };
  }
  
  createBuilding(numStories, x = 0, z = -20) {
    const building = new THREE.Group();
    
    const buildingWidth = 20;
    const buildingHeight = numStories * this.floorHeight;
    
    // Calculate UV repeat for window texture
    const windowsPerFloor = Math.floor(buildingWidth / (this.windowWidth + this.windowSpacing));
    const uvRepeatX = windowsPerFloor / 4; // 4 windows in texture
    const uvRepeatY = numStories / 4;
    
    // Clone material with specific UV repeat
    const buildingMat = this.materials.building.clone();
    buildingMat.map.repeat.set(uvRepeatX, uvRepeatY);
    
    // Main building shell (exterior)
    const buildingGeo = new THREE.BoxGeometry(
      buildingWidth,
      buildingHeight,
      this.buildingDepth
    );
    const buildingMesh = new THREE.Mesh(buildingGeo, buildingMat);
    buildingMesh.position.set(x, buildingHeight / 2, z);
    buildingMesh.castShadow = true;
    buildingMesh.receiveShadow = true;
    buildingMesh.userData.isVantageBuilding = true;
    building.add(buildingMesh);
    
    // Store building data
    building.userData = {
      isVantageBuilding: true,
      width: buildingWidth,
      height: buildingHeight,
      depth: this.buildingDepth,
      numStories: numStories,
      x, z,
      windowPositions: this.calculateWindowPositions(buildingWidth, numStories, x, z)
    };
    
    building.position.set(0, 0, 0);
    this.buildingGroup.add(building);
    this.scene.add(this.buildingGroup);
    
    this.currentBuilding = building;
    
    console.log(`Created ${numStories}-story building at (${x}, ${z})`);
    return building;
  }
  
  calculateWindowPositions(buildingWidth, numStories, buildingX, buildingZ) {
    const positions = [];
    const windowsPerFloor = Math.floor(buildingWidth / (this.windowWidth + this.windowSpacing));
    
    for (let floor = 0; floor < numStories; floor++) {
      for (let windowIdx = 0; windowIdx < windowsPerFloor; windowIdx++) {
        const windowX = buildingX - buildingWidth / 2 + (windowIdx + 0.5) * (buildingWidth / windowsPerFloor);
        const windowY = floor * this.floorHeight + this.floorHeight / 2;
        const windowZ = buildingZ + this.buildingDepth / 2; // Front face
        
        positions.push({
          floor,
          index: windowIdx,
          x: windowX,
          y: windowY,
          z: windowZ,
          occupied: false
        });
      }
    }
    
    return positions;
  }
  
  createRoomAtWindow(windowPos, roomTemplate) {
    // Create room that will be "mapped" to this window
    const roomGroup = new THREE.Group();
    
    // Room dimensions match hallway
    const roomWidth = this.hallwaySystem.HALLWAY_WIDTH;
    const roomHeight = this.hallwaySystem.HALLWAY_HEIGHT;
    const roomDepth = 8.0;
    
    // Position room at the hallway entrance (will be entered from hallway)
    // The room's window wall will align with the building window
    const roomX = windowPos.x;
    const roomY = 0; // Ground level for hallway entrance
    const roomZ = windowPos.z - roomDepth / 2;
    
    // Floor
    const floorGeo = new THREE.BoxGeometry(roomWidth, 0.1, roomDepth);
    const floor = new THREE.Mesh(floorGeo, this.materials.roomFloor);
    floor.position.set(0, 0, -roomDepth / 2);
    floor.receiveShadow = true;
    roomGroup.add(floor);
    
    // Ceiling
    const ceilingGeo = new THREE.BoxGeometry(roomWidth, 0.1, roomDepth);
    const ceiling = new THREE.Mesh(ceilingGeo, this.materials.roomCeiling);
    ceiling.position.set(0, roomHeight, -roomDepth / 2);
    ceiling.receiveShadow = true;
    roomGroup.add(ceiling);
    
    // Walls (with window cutout on far wall)
    this.createRoomWalls(roomGroup, roomWidth, roomHeight, roomDepth, windowPos);
    
    // Window (transparent view to outside)
    this.createRoomWindow(roomGroup, roomWidth, roomHeight, roomDepth, windowPos);
    
    // Add furniture based on template
    if (roomTemplate && roomTemplate.objects) {
      // Will be populated later with actual furniture
    }
    
    roomGroup.position.set(roomX, roomY, roomZ);
    
    // Use clipping planes to prevent room from being visible outside building
    this.setupClippingPlanes(roomGroup, windowPos);
    
    // Store room data
    roomGroup.userData = {
      windowPos,
      template: roomTemplate,
      width: roomWidth,
      height: roomHeight,
      depth: roomDepth
    };
    
    this.scene.add(roomGroup);
    
    // Map this window to this room
    const windowKey = `${windowPos.floor}_${windowPos.index}`;
    this.windowMappings.set(windowKey, roomGroup);
    windowPos.occupied = true;
    
    console.log(`Created room at window ${windowKey}`);
    return roomGroup;
  }
  
  createRoomWalls(roomGroup, width, height, depth, windowPos) {
    const wallThickness = 0.2;
    
    // Left wall
    const leftWallGeo = new THREE.BoxGeometry(wallThickness, height, depth);
    const leftWall = new THREE.Mesh(leftWallGeo, this.materials.roomWall);
    leftWall.position.set(-width / 2, height / 2, -depth / 2);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    roomGroup.add(leftWall);
    
    // Right wall
    const rightWallGeo = new THREE.BoxGeometry(wallThickness, height, depth);
    const rightWall = new THREE.Mesh(rightWallGeo, this.materials.roomWall);
    rightWall.position.set(width / 2, height / 2, -depth / 2);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    roomGroup.add(rightWall);
    
    // Back wall (entrance from hallway)
    const backWallGeo = new THREE.BoxGeometry(width, height, wallThickness);
    const backWall = new THREE.Mesh(backWallGeo, this.materials.roomWall);
    backWall.position.set(0, height / 2, 0);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    roomGroup.add(backWall);
    
    // Front wall with window cutout
    const windowCutoutWidth = this.windowWidth;
    const windowCutoutHeight = this.windowHeight;
    const windowCutoutY = height / 2; // Center vertically
    
    // Wall segments around window
    // Bottom section
    if (windowCutoutY - windowCutoutHeight / 2 > 0) {
      const bottomGeo = new THREE.BoxGeometry(
        width,
        windowCutoutY - windowCutoutHeight / 2,
        wallThickness
      );
      const bottomWall = new THREE.Mesh(bottomGeo, this.materials.roomWall);
      bottomWall.position.set(0, (windowCutoutY - windowCutoutHeight / 2) / 2, -depth);
      bottomWall.castShadow = true;
      roomGroup.add(bottomWall);
    }
    
    // Top section
    const topHeight = height - (windowCutoutY + windowCutoutHeight / 2);
    if (topHeight > 0) {
      const topGeo = new THREE.BoxGeometry(width, topHeight, wallThickness);
      const topWall = new THREE.Mesh(topGeo, this.materials.roomWall);
      topWall.position.set(
        0,
        height - topHeight / 2,
        -depth
      );
      topWall.castShadow = true;
      roomGroup.add(topWall);
    }
    
    // Left side of window
    const leftSideWidth = (width - windowCutoutWidth) / 2;
    if (leftSideWidth > 0) {
      const leftSideGeo = new THREE.BoxGeometry(
        leftSideWidth,
        windowCutoutHeight,
        wallThickness
      );
      const leftSide = new THREE.Mesh(leftSideGeo, this.materials.roomWall);
      leftSide.position.set(
        -width / 2 + leftSideWidth / 2,
        windowCutoutY,
        -depth
      );
      leftSide.castShadow = true;
      roomGroup.add(leftSide);
    }
    
    // Right side of window
    if (leftSideWidth > 0) {
      const rightSideGeo = new THREE.BoxGeometry(
        leftSideWidth,
        windowCutoutHeight,
        wallThickness
      );
      const rightSide = new THREE.Mesh(rightSideGeo, this.materials.roomWall);
      rightSide.position.set(
        width / 2 - leftSideWidth / 2,
        windowCutoutY,
        -depth
      );
      rightSide.castShadow = true;
      roomGroup.add(rightSide);
    }
  }
  
  createRoomWindow(roomGroup, width, height, depth, windowPos) {
    // Transparent window pane
    const windowGeo = new THREE.PlaneGeometry(this.windowWidth, this.windowHeight);
    const windowMesh = new THREE.Mesh(windowGeo, this.materials.window);
    windowMesh.position.set(0, height / 2, -depth - 0.05);
    roomGroup.add(windowMesh);
  }
  
  setupClippingPlanes(roomGroup, windowPos) {
    // Create clipping planes to prevent room geometry from being visible outside the building
    // This ensures that even if room dimensions extend beyond the window, only the window portal is visible
    
    const building = this.currentBuilding;
    if (!building) return;
    
    const buildingBounds = {
      minX: building.userData.x - building.userData.width / 2,
      maxX: building.userData.x + building.userData.width / 2,
      minZ: building.userData.z - building.userData.depth / 2,
      maxZ: building.userData.z + building.userData.depth / 2
    };
    
    // Create clipping planes (will be applied to materials)
    const clippingPlanes = [
      new THREE.Plane(new THREE.Vector3(1, 0, 0), -buildingBounds.minX),  // Left
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), buildingBounds.maxX),  // Right
      new THREE.Plane(new THREE.Vector3(0, 0, 1), -buildingBounds.minZ),  // Back
      new THREE.Plane(new THREE.Vector3(0, 0, -1), buildingBounds.maxZ)   // Front
    ];
    
    // Apply clipping planes to all materials in the room
    roomGroup.traverse(node => {
      if (node.isMesh && node.material) {
        node.material.clippingPlanes = clippingPlanes;
        node.material.clipShadows = true;
        node.material.needsUpdate = true;
      }
    });
    
    // Enable clipping in renderer (will be set externally)
    roomGroup.userData.clippingPlanes = clippingPlanes;
  }
  
  createRoomForDoor(doorMesh, roomTemplate) {
    // Find which window this door corresponds to
    // For now, use first available window on appropriate floor
    
    if (!this.currentBuilding) return null;
    
    const windowPositions = this.currentBuilding.userData.windowPositions;
    const availableWindow = windowPositions.find(w => !w.occupied);
    
    if (!availableWindow) {
      console.warn('No available windows for room');
      return null;
    }
    
    return this.createRoomAtWindow(availableWindow, roomTemplate);
  }
  
  enterRoom(roomGroup) {
    // Transition player into room
    this.currentRoom = roomGroup;
    
    // Hide hallway
    if (this.hallwaySystem.active) {
      this.hallwaySystem.hallwayGroup.visible = false;
    }
    
    // Show room
    roomGroup.visible = true;
    
    console.log('Entered room');
  }
  
  exitRoom() {
    if (!this.currentRoom) return;
    
    // Hide room
    this.currentRoom.visible = false;
    this.currentRoom = null;
    
    // Show hallway
    if (this.hallwaySystem.active) {
      this.hallwaySystem.hallwayGroup.visible = true;
    }
    
    console.log('Exited room');
  }
  
  activate(numStories = 10) {
    if (this.active) return;
    
    // Create building
    this.createBuilding(numStories);
    
    // Initialize hallway system if not already active
    if (!this.hallwaySystem.active) {
      this.hallwaySystem.initialize();
    }
    
    this.active = true;
    console.log('Vantage Point Mode activated');
  }
  
  deactivate() {
    if (!this.active) return;
    
    // Clear all rooms
    this.windowMappings.forEach(room => {
      this.scene.remove(room);
      room.traverse(node => {
        if (node.geometry) node.geometry.dispose();
        if (node.material) {
          if (Array.isArray(node.material)) {
            node.material.forEach(mat => mat.dispose());
          } else {
            node.material.dispose();
          }
        }
      });
    });
    this.windowMappings.clear();
    
    // Clear building
    this.scene.remove(this.buildingGroup);
    this.buildingGroup.clear();
    this.currentBuilding = null;
    this.currentRoom = null;
    
    this.active = false;
    console.log('Vantage Point Mode deactivated');
  }
  
  update() {
    if (!this.active) return;
    
    // Update hallway system
    this.hallwaySystem.update();
    
    // Check for door interactions and create rooms on-demand
    // This would be triggered by player entering a door
  }
  
  dispose() {
    this.deactivate();
    
    // Dispose materials
    Object.values(this.materials).forEach(mat => {
      if (mat.map) mat.map.dispose();
      mat.dispose();
    });
  }
}

