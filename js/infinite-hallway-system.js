/**
 * Infinite Hallway System
 * Extracted from scale-ultra.html and adapted for asset-evaluator.html
 */

import * as THREE from 'three';

export class InfiniteHallwaySystem {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    
    // Hallway configuration
    this.HALLWAY_WIDTH = 3.0;
    this.HALLWAY_HEIGHT = 3.0;
    this.HALLWAY_SEGMENT_LENGTH = 10.0;
    this.NUM_HALLWAY_SEGMENTS = 5;
    
    // State
    this.hallwayGroup = new THREE.Group();
    this.hallwaySegments = [];
    this.segmentHistory = [];
    this.generatedRooms = [];
    this.nextSegmentId = 0;
    this.active = false;
    
    // Shared materials (create once, reuse)
    this.sharedMaterials = this.createSharedMaterials();
    
    // Player reference (will be set externally)
    this.playerPosition = { x: 0, y: 0, z: 0 };
  }
  
  createSharedMaterials() {
    return {
      floor: new THREE.MeshStandardMaterial({ 
        color: 0x8b7355, 
        roughness: 0.9,
        metalness: 0.0
      }),
      ceiling: new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        roughness: 0.9,
        metalness: 0.0
      }),
      wall: new THREE.MeshStandardMaterial({ 
        color: 0xe8e8e8, 
        roughness: 0.8,
        metalness: 0.0
      }),
      door: new THREE.MeshStandardMaterial({ 
        color: 0x8b4513, 
        roughness: 0.7,
        metalness: 0.1
      }),
      doorFrame: new THREE.MeshStandardMaterial({ 
        color: 0xa0826d, 
        roughness: 0.6
      })
    };
  }
  
  createHallwaySegment(zPosition, hasLeftDoor, hasRightDoor) {
    const segment = new THREE.Group();
    const width = this.HALLWAY_WIDTH;
    const height = this.HALLWAY_HEIGHT;
    const length = this.HALLWAY_SEGMENT_LENGTH;
    
    // Floor
    const floorGeo = new THREE.BoxGeometry(width, 0.1, length);
    const floor = new THREE.Mesh(floorGeo, this.sharedMaterials.floor);
    floor.position.set(0, 0, -length / 2);
    floor.receiveShadow = true;
    floor.userData.isHallwayFloor = true;
    segment.add(floor);
    
    // Ceiling
    const ceilingGeo = new THREE.BoxGeometry(width, 0.1, length);
    const ceiling = new THREE.Mesh(ceilingGeo, this.sharedMaterials.ceiling);
    ceiling.position.set(0, height, -length / 2);
    ceiling.receiveShadow = true;
    ceiling.userData.isHallwayCeiling = true;
    segment.add(ceiling);
    
    // Left wall (with optional door)
    if (hasLeftDoor) {
      this.createWallWithDoor(segment, 'left', zPosition, width, height, length);
    } else {
      this.createSolidWall(segment, 'left', width, height, length);
    }
    
    // Right wall (with optional door)
    if (hasRightDoor) {
      this.createWallWithDoor(segment, 'right', zPosition, width, height, length);
    } else {
      this.createSolidWall(segment, 'right', width, height, length);
    }
    
    segment.position.z = zPosition;
    segment.userData.isHallwaySegment = true;
    segment.userData.segmentZ = zPosition;
    return segment;
  }
  
  createSolidWall(parent, side, width, height, length) {
    const wallThickness = 0.2;
    const wallGeo = new THREE.BoxGeometry(wallThickness, height, length);
    const wall = new THREE.Mesh(wallGeo, this.sharedMaterials.wall);
    
    const xPos = side === 'left' ? -width / 2 : width / 2;
    wall.position.set(xPos, height / 2, -length / 2);
    wall.castShadow = true;
    wall.receiveShadow = true;
    wall.userData.isHallwayWall = true;
    parent.add(wall);
  }
  
  createWallWithDoor(parent, side, zPosition, width, height, length) {
    const wallThickness = 0.2;
    const doorWidth = 1.0;
    const doorHeight = 2.2;
    const doorZ = -length / 2; // Door at center of segment
    
    const xPos = side === 'left' ? -width / 2 : width / 2;
    
    // Wall segments around door
    const wallSegments = [
      // Before door
      { z: -length + doorWidth / 2, len: length - doorWidth },
      // After door
      { z: -doorWidth / 2, len: length - doorWidth }
    ];
    
    wallSegments.forEach(seg => {
      if (seg.len > 0) {
        const wallGeo = new THREE.BoxGeometry(wallThickness, height, seg.len);
        const wall = new THREE.Mesh(wallGeo, this.sharedMaterials.wall);
        wall.position.set(xPos, height / 2, seg.z);
        wall.castShadow = true;
        wall.receiveShadow = true;
        wall.userData.isHallwayWall = true;
        parent.add(wall);
      }
    });
    
    // Wall above door
    const topWallGeo = new THREE.BoxGeometry(wallThickness, height - doorHeight, doorWidth);
    const topWall = new THREE.Mesh(topWallGeo, this.sharedMaterials.wall);
    topWall.position.set(xPos, doorHeight + (height - doorHeight) / 2, doorZ);
    topWall.castShadow = true;
    topWall.userData.isHallwayWall = true;
    parent.add(topWall);
    
    // Door
    const doorGeo = new THREE.BoxGeometry(wallThickness * 0.8, doorHeight, doorWidth);
    const door = new THREE.Mesh(doorGeo, this.sharedMaterials.door);
    door.position.set(xPos, doorHeight / 2, doorZ);
    door.castShadow = true;
    parent.add(door);
    
    // Door frame
    const frameThick = 0.08;
    const frameMat = this.sharedMaterials.doorFrame;
    
    // Vertical frames
    [-doorWidth / 2, doorWidth / 2].forEach(offset => {
      const frameGeo = new THREE.BoxGeometry(wallThickness + 0.02, doorHeight, frameThick);
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.position.set(xPos, doorHeight / 2, doorZ + offset);
      frame.castShadow = true;
      frame.userData.isHallwayWall = true;
      parent.add(frame);
    });
    
    // Top frame
    const topFrameGeo = new THREE.BoxGeometry(wallThickness + 0.02, frameThick, doorWidth + frameThick * 2);
    const topFrame = new THREE.Mesh(topFrameGeo, frameMat);
    topFrame.position.set(xPos, doorHeight, doorZ);
    topFrame.castShadow = true;
    topFrame.userData.isHallwayWall = true;
    parent.add(topFrame);
    
    // Store door metadata with unique ID
    const doorId = `door_${zPosition}_${side}_${Date.now()}_${Math.random()}`;
    door.userData.isDoor = true;
    door.userData.doorId = doorId;
    door.userData.side = side;
    door.userData.segmentZ = zPosition;
    door.userData.isOpen = false;
    door.userData.isDoorPanel = true; // Mark for animation
  }
  
  createSegmentConfiguration(zPosition) {
    const segmentId = this.nextSegmentId++;
    const hasLeftDoor = Math.random() < 0.4; // 40% chance
    const hasRightDoor = Math.random() < 0.4; // 40% chance
    
    return {
      id: segmentId,
      zPosition,
      hasLeftDoor,
      hasRightDoor
    };
  }
  
  initialize() {
    // Clear existing hallway
    this.hallwayGroup.clear();
    this.hallwaySegments = [];
    this.generatedRooms = [];
    this.segmentHistory = [];
    this.nextSegmentId = 0;
    
    // Create initial segments
    for (let i = 0; i < this.NUM_HALLWAY_SEGMENTS; i++) {
      const zPos = -i * this.HALLWAY_SEGMENT_LENGTH;
      const config = this.createSegmentConfiguration(zPos);
      const segment = this.createHallwaySegment(zPos, config.hasLeftDoor, config.hasRightDoor);
      
      segment.userData.segmentId = config.id;
      segment.userData.zPosition = zPos;
      
      this.hallwayGroup.add(segment);
      this.hallwaySegments.push(segment);
      this.segmentHistory.push(config);
    }
    
    // Add hallway group to scene
    this.hallwayGroup.visible = true;
    this.hallwayGroup.position.set(0, 0, 0);
    this.scene.add(this.hallwayGroup);
    
    this.active = true;
    console.log(`Infinite hallway initialized with ${this.NUM_HALLWAY_SEGMENTS} segments`);
  }
  
  update() {
    if (!this.active) return;
    
    const playerZ = this.playerPosition.z;
    
    // Sort segments by Z position
    this.hallwaySegments.sort((a, b) => a.userData.zPosition - b.userData.zPosition);
    
    const furthestBackSegment = this.hallwaySegments[this.hallwaySegments.length - 1];
    const furthestForwardSegment = this.hallwaySegments[0];
    
    // Moving forward: Recycle back segment and create new forward segment
    if (playerZ < furthestForwardSegment.userData.zPosition - this.HALLWAY_SEGMENT_LENGTH) {
      // Remove furthest back segment
      const recycledSegment = this.hallwaySegments.pop();
      this.hallwayGroup.remove(recycledSegment);
      
      // Dispose geometry only (materials are shared)
      recycledSegment.traverse(node => {
        if (node.geometry) {
          node.geometry.dispose();
        }
      });
      
      // Create new segment ahead
      const newZPos = furthestForwardSegment.userData.zPosition - this.HALLWAY_SEGMENT_LENGTH;
      const newConfig = this.createSegmentConfiguration(newZPos);
      const newSegment = this.createHallwaySegment(newZPos, newConfig.hasLeftDoor, newConfig.hasRightDoor);
      
      newSegment.userData.segmentId = newConfig.id;
      newSegment.userData.zPosition = newZPos;
      
      this.hallwayGroup.add(newSegment);
      this.hallwaySegments.unshift(newSegment);
      this.segmentHistory.unshift(newConfig);
      
      // Keep history limited
      if (this.segmentHistory.length > 50) {
        this.segmentHistory.pop();
      }
    }
    
    // Moving backward: Recycle forward segment and restore previous segment
    else if (playerZ > furthestBackSegment.userData.zPosition + this.HALLWAY_SEGMENT_LENGTH) {
      // Remove furthest forward segment
      const recycledSegment = this.hallwaySegments.shift();
      this.hallwayGroup.remove(recycledSegment);
      
      // Dispose geometry only (materials are shared)
      recycledSegment.traverse(node => {
        if (node.geometry) {
          node.geometry.dispose();
        }
      });
      
      // Try to restore previous segment from history
      const newZPos = furthestBackSegment.userData.zPosition + this.HALLWAY_SEGMENT_LENGTH;
      
      // Look for historical segment at this position
      const historicalConfig = this.segmentHistory.find(config => 
        Math.abs(config.zPosition - newZPos) < 0.1
      );
      
      let newConfig;
      if (historicalConfig) {
        newConfig = historicalConfig;
      } else {
        newConfig = this.createSegmentConfiguration(newZPos);
        this.segmentHistory.push(newConfig);
      }
      
      const newSegment = this.createHallwaySegment(newZPos, newConfig.hasLeftDoor, newConfig.hasRightDoor);
      newSegment.userData.segmentId = newConfig.id;
      newSegment.userData.zPosition = newZPos;
      
      this.hallwayGroup.add(newSegment);
      this.hallwaySegments.push(newSegment);
    }
  }
  
  setPlayerPosition(x, y, z) {
    this.playerPosition = { x, y, z };
  }
  
  dispose() {
    // Dispose all geometries
    this.hallwaySegments.forEach(segment => {
      segment.traverse(node => {
        if (node.geometry) {
          node.geometry.dispose();
        }
      });
    });
    
    // Dispose shared materials
    Object.values(this.sharedMaterials).forEach(material => {
      material.dispose();
    });
    
    // Remove from scene
    this.scene.remove(this.hallwayGroup);
    this.hallwayGroup.clear();
    this.hallwaySegments = [];
    this.generatedRooms = [];
    this.segmentHistory = [];
    this.active = false;
    
    console.log('Infinite hallway disposed');
  }
  
  toggle() {
    if (this.active) {
      this.dispose();
    } else {
      this.initialize();
    }
  }
}

