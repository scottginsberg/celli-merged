// ==================== BUILDING CONSTRUCTOR SYSTEM ====================
// Assembles multiple rooms into coherent buildings with logical connections
// Handles door placement, room adjacency, and architectural coherence

import * as THREE from 'three';
import { DoorFrameSystem, getRandomDoorStyle } from './door-system.js';
import { FloorPatterns } from './floor-patterns.js';
import { createAsset } from './assets/asset-registry.js';
import { 
  FURNITURE_ZONES, 
  PLACEMENT_POLICIES,
  WALL_DECOR_POLICIES,
  FLOOR_PATTERNS_BY_ROOM,
  getSurfaceGrid,
  isPlacementValid,
  selectSurfaceProps
} from './interiors-metadata.js';

/**
 * Room Templates with randomization support
 */
export const ROOM_TEMPLATES = {
  bedroom: {
    name: 'Bedroom',
    dimensions: { width: 4, depth: 4 },
    requiredFurniture: ['bed'],
    optionalFurniture: ['dresser', 'nightstand', 'closet', 'desk', 'chair'],
    doorPositions: ['center-front', 'left-front', 'right-front'],
    floorOptions: ['hardwood-short', 'hardwood-long', 'carpet-plush'],
    zones: {
      sleeping: { priority: 1, furniture: ['bed', 'nightstand'] },
      storage: { priority: 2, furniture: ['dresser', 'closet'] },
      work: { priority: 3, furniture: ['desk', 'chair'] }
    }
  },
  
  bathroom: {
    name: 'Bathroom',
    dimensions: { width: 2.5, depth: 2.5 },
    requiredFurniture: ['toilet', 'sink'],
    optionalFurniture: ['shower', 'bathtub', 'cabinet'],
    doorPositions: ['center-front'],
    floorOptions: ['tile-bathroom-checkered', 'tile-bathroom-mosaic', 'tile-broad'],
    zones: {
      toilet: { priority: 1, furniture: ['toilet'] },
      wash: { priority: 1, furniture: ['sink'] },
      bathing: { priority: 2, furniture: ['shower', 'bathtub'] }
    }
  },
  
  kitchen: {
    name: 'Kitchen',
    dimensions: { width: 4, depth: 3 },
    requiredFurniture: ['counter', 'sink'],
    optionalFurniture: ['refrigerator', 'stove', 'dishwasher', 'cabinet'],
    doorPositions: ['left-front', 'right-front'],
    floorOptions: ['tile-broad', 'tile-industrial', 'hardwood-short'],
    zones: {
      cooking: { priority: 1, furniture: ['stove', 'counter'] },
      storage: { priority: 2, furniture: ['refrigerator', 'cabinet'] },
      cleaning: { priority: 2, furniture: ['sink', 'dishwasher'] }
    }
  },
  
  living: {
    name: 'Living Room',
    dimensions: { width: 5, depth: 4 },
    requiredFurniture: ['couch'],
    optionalFurniture: ['coffeetable', 'tv', 'tvstand', 'bookshelf', 'plant'],
    doorPositions: ['center-front', 'left-front'],
    floorOptions: ['hardwood-short', 'hardwood-long', 'carpet-plush'],
    zones: {
      seating: { priority: 1, furniture: ['couch', 'coffeetable'] },
      entertainment: { priority: 2, furniture: ['tv', 'tvstand'] },
      reading: { priority: 3, furniture: ['bookshelf', 'chair'] }
    }
  },
  
  dining: {
    name: 'Dining Room',
    dimensions: { width: 4, depth: 3.5 },
    requiredFurniture: ['diningtable', 'chair'],
    optionalFurniture: ['cabinet', 'plant'],
    doorPositions: ['center-front', 'right-front'],
    floorOptions: ['hardwood-short', 'hardwood-long', 'tile-broad'],
    zones: {
      dining: { priority: 1, furniture: ['diningtable', 'chair'] },
      storage: { priority: 2, furniture: ['cabinet'] }
    }
  },
  
  office: {
    name: 'Office',
    dimensions: { width: 3.5, depth: 3 },
    requiredFurniture: ['desk', 'chair'],
    optionalFurniture: ['bookshelf', 'filing cabinet', 'lamp', 'plant'],
    doorPositions: ['center-front', 'left-front'],
    floorOptions: ['hardwood-short', 'carpet-short'],
    zones: {
      work: { priority: 1, furniture: ['desk', 'chair'] },
      storage: { priority: 2, furniture: ['bookshelf', 'filingcabinet'] }
    }
  },
  
  hallway: {
    name: 'Hallway',
    dimensions: { width: 2, depth: 6 },
    requiredFurniture: [],
    optionalFurniture: ['plant', 'artframe', 'mirror'],
    doorPositions: ['front', 'back', 'left-middle', 'right-middle'],
    floorOptions: ['hardwood-long', 'tile-broad', 'carpet-short'],
    zones: {
      passage: { priority: 1, furniture: [] }
    }
  },
  
  classroom: {
    name: 'Classroom',
    dimensions: { width: 8, depth: 7 },
    requiredFurniture: ['teacherdesk', 'whiteboard'],
    optionalFurniture: ['studentdesk', 'chair', 'bookshelf', 'clock'],
    doorPositions: ['right-front', 'left-front'],
    floorOptions: ['tile-industrial', 'hardwood-parquet', 'carpet-short'],
    zones: {
      teaching: { priority: 1, furniture: ['teacherdesk', 'whiteboard'] },
      students: { priority: 1, furniture: ['studentdesk', 'chair'], grid: true },
      storage: { priority: 2, furniture: ['bookshelf', 'cabinet'] }
    }
  },
  
  gymnasium: {
    name: 'Gymnasium',
    dimensions: { width: 20, depth: 15 },
    requiredFurniture: [],
    optionalFurniture: ['basketballhoop', 'bench', 'scoreboard'],
    doorPositions: ['center-front', 'left-front', 'right-front'],
    floorOptions: ['hardwood-parquet', 'hardwood-long'],
    zones: {
      court: { priority: 1, furniture: ['basketballhoop'] },
      seating: { priority: 2, furniture: ['bench'] },
      storage: { priority: 3, furniture: ['mat', 'ball'] }
    }
  }
};

/**
 * Building Constructor
 * Assembles rooms into coherent buildings with logical connections
 */
export class BuildingConstructor {
  constructor(scene) {
    this.scene = scene;
    this.rooms = [];
    this.connections = [];
    this.currentOffset = { x: 0, z: 0 };
  }
  
  /**
   * Generate a random house with specified number of rooms
   * @param {number} numRooms - Number of rooms to generate
   * @returns {THREE.Group} Complete building
   */
  generateRandomHouse(numRooms = 5) {
    const building = new THREE.Group();
    this.rooms = [];
    this.connections = [];
    this.currentOffset = { x: 0, z: 0 };
    
    // Generate room chain
    const roomChain = this.generateRoomChain(numRooms);
    
    // Build each room and connect them
    for (let i = 0; i < roomChain.length; i++) {
      const roomType = roomChain[i];
      const room = this.constructRoom(roomType, i);
      
      // Connect to previous room if not first
      if (i > 0) {
        this.connectRooms(this.rooms[i - 1], room);
      }
      
      building.add(room);
      this.rooms.push(room);
    }
    
    return building;
  }
  
  /**
   * Generate logical room chain
   */
  generateRoomChain(numRooms) {
    const chain = [];
    const roomTypes = Object.keys(ROOM_TEMPLATES);
    
    // Start with living room or hallway
    chain.push(Math.random() > 0.5 ? 'living' : 'hallway');
    
    // Add rooms based on logic
    const preferences = {
      living: ['kitchen', 'dining', 'hallway', 'bedroom'],
      kitchen: ['dining', 'hallway', 'pantry'],
      dining: ['living', 'kitchen', 'hallway'],
      bedroom: ['bathroom', 'hallway', 'bedroom', 'office'],
      bathroom: ['bedroom', 'hallway'],
      office: ['hallway', 'bedroom'],
      hallway: ['bedroom', 'bathroom', 'living', 'kitchen'],
      classroom: ['hallway', 'bathroom', 'office'],
      gymnasium: ['hallway', 'locker']
    };
    
    for (let i = 1; i < numRooms; i++) {
      const lastRoom = chain[chain.length - 1];
      const options = preferences[lastRoom] || roomTypes;
      
      // Filter to available room types
      const validOptions = options.filter(opt => ROOM_TEMPLATES[opt]);
      const nextRoom = validOptions[Math.floor(Math.random() * validOptions.length)];
      
      chain.push(nextRoom);
    }
    
    return chain;
  }
  
  /**
   * Construct a single room with full randomization
   */
  constructRoom(roomType, index) {
    const template = ROOM_TEMPLATES[roomType];
    if (!template) return new THREE.Group();
    
    const roomGroup = new THREE.Group();
    const { width, depth } = template.dimensions;
    
    // Position room with offset
    roomGroup.position.set(this.currentOffset.x, 0, this.currentOffset.z);
    
    // Randomize floor
    const floorPattern = template.floorOptions[
      Math.floor(Math.random() * template.floorOptions.length)
    ];
    this.createFloor(roomGroup, width, depth, floorPattern);
    
    // Create walls
    this.createWalls(roomGroup, width, depth);
    
    // Create ceiling
    this.createCeiling(roomGroup, width, depth);
    
    // Randomize and place furniture with zones
    this.placeFurnitureWithZones(roomGroup, template, width, depth);
    
    // Add wall decorations
    this.addWallDecorations(roomGroup, roomType, width, depth);
    
    // Add surface props
    this.addSurfaceProps(roomGroup);
    
    // Store metadata
    roomGroup.userData.roomType = roomType;
    roomGroup.userData.template = template;
    roomGroup.userData.dimensions = { width, depth };
    roomGroup.userData.index = index;
    
    // Update offset for next room
    this.currentOffset.x += width + 2; // 2m spacing between rooms
    
    return roomGroup;
  }
  
  /**
   * Create floor with pattern
   */
  createFloor(group, width, depth, pattern) {
    const bounds = {
      minX: -width / 2,
      maxX: width / 2,
      minZ: -depth / 2,
      maxZ: depth / 2
    };
    
    const floor = FloorPatterns.createFloor(this.scene, bounds, pattern, {
      gridSize: 1.0
    });
    
    // Reposition to local group
    this.scene.remove(floor);
    group.add(floor);
  }
  
  /**
   * Create walls around room with door cutouts
   */
  createWalls(group, width, depth) {
    const wallHeight = 2.5;
    const wallThickness = 0.1;
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      roughness: 0.8
    });
    
    // Door specs
    const doorWidth = 0.9;
    const doorHeight = 2.0;
    const doorPosition = 0; // Center of front wall
    
    // Front wall with door cutout (create two segments)
    const leftSegmentWidth = (width - doorWidth) / 2 - 0.08; // Leave space for door frame
    const rightSegmentWidth = leftSegmentWidth;
    
    // Left segment of front wall
    if (leftSegmentWidth > 0.1) {
      const leftFrontGeo = new THREE.BoxGeometry(leftSegmentWidth, wallHeight, wallThickness);
      const leftFrontWall = new THREE.Mesh(leftFrontGeo, wallMat);
      leftFrontWall.position.set(
        -width / 2 + leftSegmentWidth / 2,
        wallHeight / 2,
        -depth / 2
      );
      leftFrontWall.castShadow = true;
      leftFrontWall.receiveShadow = true;
      group.add(leftFrontWall);
    }
    
    // Right segment of front wall
    if (rightSegmentWidth > 0.1) {
      const rightFrontGeo = new THREE.BoxGeometry(rightSegmentWidth, wallHeight, wallThickness);
      const rightFrontWall = new THREE.Mesh(rightFrontGeo, wallMat);
      rightFrontWall.position.set(
        width / 2 - rightSegmentWidth / 2,
        wallHeight / 2,
        -depth / 2
      );
      rightFrontWall.castShadow = true;
      rightFrontWall.receiveShadow = true;
      group.add(rightFrontWall);
    }
    
    // Top segment above door
    if (wallHeight > doorHeight + 0.1) {
      const topFrontGeo = new THREE.BoxGeometry(doorWidth + 0.16, wallHeight - doorHeight, wallThickness);
      const topFrontWall = new THREE.Mesh(topFrontGeo, wallMat);
      topFrontWall.position.set(
        doorPosition,
        doorHeight + (wallHeight - doorHeight) / 2,
        -depth / 2
      );
      topFrontWall.castShadow = true;
      topFrontWall.receiveShadow = true;
      group.add(topFrontWall);
    }
    
    // Add door with frame
    const doorSpec = {
      width: doorWidth,
      height: doorHeight,
      wallThickness: wallThickness,
      style: getRandomDoorStyle(),
      openDirection: 'right',
      x: doorPosition,
      z: -depth / 2,
      rotation: 0  // Facing forward (into room)
    };
    const doorAssembly = DoorFrameSystem.createDoorWithFrame(doorSpec);
    group.add(doorAssembly);
    
    // Back wall (solid)
    const backGeo = new THREE.BoxGeometry(width, wallHeight, wallThickness);
    const backWall = new THREE.Mesh(backGeo, wallMat);
    backWall.position.set(0, wallHeight / 2, depth / 2);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    group.add(backWall);
    
    // Left wall (solid)
    const sideGeo = new THREE.BoxGeometry(wallThickness, wallHeight, depth);
    const leftWall = new THREE.Mesh(sideGeo, wallMat);
    leftWall.position.set(-width / 2, wallHeight / 2, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    group.add(leftWall);
    
    // Right wall (solid)
    const rightWall = new THREE.Mesh(sideGeo, wallMat);
    rightWall.position.set(width / 2, wallHeight / 2, 0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    group.add(rightWall);
  }
  
  /**
   * Create ceiling
   */
  createCeiling(group, width, depth) {
    const ceilingGeo = new THREE.PlaneGeometry(width, depth);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0xfafafa,
      roughness: 0.9,
      side: THREE.DoubleSide
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 2.5;
    ceiling.receiveShadow = true;
    group.add(ceiling);
  }
  
  /**
   * Place furniture respecting zones and avoiding clipping
   */
  placeFurnitureWithZones(group, template, width, depth) {
    const placedFurniture = [];
    
    // Floor offset constant (matches asset-evaluator.html)
    const FLOOR_OFFSET = 0.02;
    
    // Place required furniture first
    for (const furnitureType of template.requiredFurniture) {
      const placement = this.findValidPlacement(furnitureType, width, depth, placedFurniture);
      if (placement) {
        // Create actual furniture asset
        const furniture = this.createFurniturePlaceholder(furnitureType);
        furniture.position.set(placement.x, FLOOR_OFFSET, placement.z);
        furniture.rotation.y = placement.rotation;
        group.add(furniture);
        
        placedFurniture.push({ type: furnitureType, ...placement });
      }
    }
    
    // Place optional furniture (random selection)
    const numOptional = Math.floor(Math.random() * template.optionalFurniture.length);
    const shuffled = [...template.optionalFurniture].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(numOptional, shuffled.length); i++) {
      const furnitureType = shuffled[i];
      const placement = this.findValidPlacement(furnitureType, width, depth, placedFurniture);
      if (placement) {
        const furniture = this.createFurniturePlaceholder(furnitureType);
        furniture.position.set(placement.x, FLOOR_OFFSET, placement.z);
        furniture.rotation.y = placement.rotation;
        group.add(furniture);
        
        placedFurniture.push({ type: furnitureType, ...placement });
      }
    }
  }
  
  /**
   * Find valid placement for furniture (no clipping)
   */
  findValidPlacement(furnitureType, roomWidth, roomDepth, existing) {
    const maxAttempts = 50;
    const margin = 0.5; // 50cm from walls
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = (Math.random() - 0.5) * (roomWidth - margin * 2);
      const z = (Math.random() - 0.5) * (roomDepth - margin * 2);
      const rotation = Math.random() * Math.PI * 2;
      
      // Check if valid (simplified collision check)
      let valid = true;
      for (const item of existing) {
        const dist = Math.sqrt(Math.pow(x - item.x, 2) + Math.pow(z - item.z, 2));
        if (dist < 1.5) { // Minimum 1.5m spacing
          valid = false;
          break;
        }
      }
      
      if (valid) {
        return { x, z, rotation };
      }
    }
    
    return null;
  }
  
  /**
   * Create actual furniture asset from asset registry
   */
  createFurniturePlaceholder(type) {
    // Map furniture type to asset ID
    const furnitureTypeToAssetId = {
      // Bedroom
      'bed': 'bed',
      'nightstand': 'nightstand',
      'dresser': 'dresser',
      'closet': 'closet',
      
      // Living Room
      'couch': 'couch',
      'coffeetable': 'coffeetable',
      'tv': 'tv',
      'tvstand': 'tvstand',
      'bookshelf': 'bookshelf',
      'chair': 'chair',
      
      // Kitchen
      'counter': 'counter',
      'sink': 'sink',
      'refrigerator': 'refrigerator',
      'stove': 'stove',
      'dishwasher': 'dishwasher',
      'cabinet': 'cabinet',
      
      // Dining
      'diningtable': 'diningtable',
      
      // Bathroom
      'toilet': 'toilet',
      'bathtub': 'bathtub',
      'shower': 'shower',
      
      // Office
      'desk': 'desk',
      'computerdesk': 'computerdesk',
      'filingcabinet': 'filingcabinet',
      
      // Misc
      'plant': 'plant',
      'lamp': 'lamp',
      'desklamp': 'desklamp',
      'floorlamp': 'floorlamp',
      'mirror': 'mirror',
      'towelrack': 'towelrack'
    };
    
    const assetId = furnitureTypeToAssetId[type] || 'box';
    
    // Create asset using asset registry
    const context = {
      scene: this.scene,
      objects: [],
      interactive: [],
      gridSize: 1.0
    };
    
    const asset = createAsset(assetId, { x: 0, z: 0, rotation: 0 }, THREE, context);
    
    if (asset) {
      asset.userData.furnitureType = type;
      return asset;
    }
    
    // Fallback to placeholder if asset not found
    console.warn(`Asset not found for furniture type: ${type}, using placeholder`);
    const geo = new THREE.BoxGeometry(0.6, 0.8, 0.6);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff00ff,
      roughness: 0.7
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0.4;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.furnitureType = type;
    
    return mesh;
  }
  
  /**
   * Add wall decorations
   */
  addWallDecorations(group, roomType, width, depth) {
    const policy = WALL_DECOR_POLICIES[roomType] || WALL_DECOR_POLICIES.living;
    const numDecorations = Math.floor(policy.density * 4); // 4 walls
    
    for (let i = 0; i < numDecorations; i++) {
      const item = policy.items[Math.floor(Math.random() * policy.items.length)];
      const wall = Math.floor(Math.random() * 4);
      const height = policy.height[0] + Math.random() * (policy.height[1] - policy.height[0]);
      
      // Placeholder decoration
      const decorGeo = new THREE.BoxGeometry(0.4, 0.3, 0.02);
      const decorMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
      const decor = new THREE.Mesh(decorGeo, decorMat);
      
      // Position on wall
      switch (wall) {
        case 0: // Front
          decor.position.set((Math.random() - 0.5) * width * 0.8, height, -depth / 2 + 0.06);
          break;
        case 1: // Back
          decor.position.set((Math.random() - 0.5) * width * 0.8, height, depth / 2 - 0.06);
          decor.rotation.y = Math.PI;
          break;
        case 2: // Left
          decor.position.set(-width / 2 + 0.06, height, (Math.random() - 0.5) * depth * 0.8);
          decor.rotation.y = Math.PI / 2;
          break;
        case 3: // Right
          decor.position.set(width / 2 - 0.06, height, (Math.random() - 0.5) * depth * 0.8);
          decor.rotation.y = -Math.PI / 2;
          break;
      }
      
      group.add(decor);
    }
  }
  
  /**
   * Add props to surfaces
   */
  addSurfaceProps(group) {
    // Find surfaces in the room
    group.traverse(child => {
      if (child.userData.furnitureType) {
        const surfaceType = child.userData.furnitureType;
        if (selectSurfaceProps(surfaceType, 0).length > 0) {
          // This is a surface, add props
          const props = selectSurfaceProps(surfaceType, 2);
          for (const propType of props) {
            const propGeo = new THREE.BoxGeometry(0.1, 0.05, 0.1);
            const propMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
            const prop = new THREE.Mesh(propGeo, propMat);
            prop.position.copy(child.position);
            prop.position.y += 0.5;
            prop.position.x += (Math.random() - 0.5) * 0.3;
            prop.position.z += (Math.random() - 0.5) * 0.3;
            prop.castShadow = true;
            group.add(prop);
          }
        }
      }
    });
  }
  
  /**
   * Connect two rooms with a door
   */
  connectRooms(room1, room2) {
    // Find optimal door position between rooms
    const pos1 = room1.position;
    const pos2 = room2.position;
    const dims1 = room1.userData.dimensions;
    const dims2 = room2.userData.dimensions;
    
    // Place door at connection point
    const doorX = pos1.x + dims1.width / 2;
    const doorZ = pos1.z;
    
    const door = DoorFrameSystem.createDoorWithFrame({
      width: 0.9,
      height: 2.0,
      wallThickness: 0.1,
      style: getRandomDoorStyle(),
      openDirection: 'right',
      x: doorX,
      z: doorZ,
      rotation: 0
    });
    
    room1.add(door);
    
    this.connections.push({
      from: room1.userData.index,
      to: room2.userData.index,
      door: door
    });
  }
}

/**
 * Helper function to get random room type
 */
export function getRandomRoomType() {
  const types = Object.keys(ROOM_TEMPLATES);
  return types[Math.floor(Math.random() * types.length)];
}

