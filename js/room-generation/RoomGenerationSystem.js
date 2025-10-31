// ==================== ROOM GENERATION SYSTEM ====================
// Comprehensive room generation with wall-aware placement, surface toppers, and asset marriages

import { HotSpotManager } from './HotSpotManager.js';
import { AssetMarriageSystem, ASSET_MARRIAGES } from './AssetMarriageSystem.js';
import { SurfaceTopperSystem, SURFACE_TOPPER_RULES } from './SurfaceTopperSystem.js';

/**
 * Wall positions for furniture placement
 */
const WALL_POSITIONS = {
  NORTH: 'north',  // -Z (back wall)
  SOUTH: 'south',  // +Z (front wall)
  EAST: 'east',    // +X (right wall)
  WEST: 'west'     // -X (left wall)
};

/**
 * Furniture placement rules by wall
 */
export const WALL_FURNITURE_RULES = {
  bedroom: {
    north: ['bed', 'dresser', 'bookshelf'],
    south: ['desk', 'chair'],
    east: ['nightstand', 'wardrobe'],
    west: ['nightstand', 'shelf'],
    center: ['rug']
  },
  
  livingRoom: {
    north: ['tv', 'tvStand', 'entertainment center'],
    south: ['sofa', 'loveseat'],
    east: ['bookshelf', 'plant'],
    west: ['armchair', 'floor lamp'],
    center: ['coffeeTable', 'rug']
  },
  
  office: {
    north: ['bookshelf', 'filing cabinet'],
    south: ['desk', 'officeChair'],
    east: ['shelf', 'printer'],
    west: ['whiteboard', 'cork board'],
    center: []
  },
  
  kitchen: {
    north: ['refrigerator', 'oven'],
    south: ['dining table', 'diningChair'],
    east: ['kitchenCounter', 'sink'],
    west: ['kitchenCounter', 'microwave'],
    center: []
  },
  
  bathroom: {
    north: ['bathtub', 'shower'],
    south: ['toilet'],
    east: ['bathroomSink', 'mirror'],
    west: ['towel rack', 'shelf'],
    center: ['bath mat']
  }
};

/**
 * Wall decoration rules
 */
export const WALL_DECORATION_RULES = {
  bedroom: [
    { type: 'picture', height: 1.6, probability: 0.7 },
    { type: 'poster', height: 1.7, probability: 0.5 },
    { type: 'mirror', height: 1.5, probability: 0.4 },
    { type: 'clock', height: 2.0, probability: 0.3 }
  ],
  
  livingRoom: [
    { type: 'painting', height: 1.7, probability: 0.8 },
    { type: 'picture', height: 1.6, probability: 0.6 },
    { type: 'clock', height: 2.0, probability: 0.5 },
    { type: 'shelf', height: 1.5, probability: 0.4 }
  ],
  
  office: [
    { type: 'whiteboard', height: 1.5, probability: 0.7 },
    { type: 'cork board', height: 1.6, probability: 0.6 },
    { type: 'calendar', height: 1.7, probability: 0.5 },
    { type: 'certificate', height: 1.8, probability: 0.4 }
  ],
  
  kitchen: [
    { type: 'clock', height: 2.0, probability: 0.6 },
    { type: 'recipe board', height: 1.5, probability: 0.4 },
    { type: 'decorative plate', height: 1.7, probability: 0.3 }
  ],
  
  bathroom: [
    { type: 'mirror', height: 1.4, probability: 0.9 },
    { type: 'towel rack', height: 1.2, probability: 0.8 },
    { type: 'shelf', height: 1.6, probability: 0.5 }
  ]
};

export class RoomGenerationSystem {
  constructor(scene, assetRegistry) {
    this.scene = scene;
    this.assetRegistry = assetRegistry;
    
    // Initialize subsystems
    this.hotSpotManager = new HotSpotManager();
    this.marriageSystem = new AssetMarriageSystem();
    this.surfaceTopperSystem = new SurfaceTopperSystem(this.hotSpotManager);
    
    // Room state
    this.currentRoom = null;
    this.placedAssets = new Map(); // assetId -> asset data
    this.wallDecorations = [];
    
    // Statistics
    this.stats = {
      furniture: 0,
      toppers: 0,
      wallDecorations: 0,
      marriages: 0
    };
  }
  
  /**
   * Generate a complete room
   */
  generateRoom(roomType, dimensions, options = {}) {
    console.log(`🏗️  Generating ${roomType} room:`, dimensions);
    
    // Clear previous room
    this.clear();
    
    // Initialize room
    this.currentRoom = {
      type: roomType,
      dimensions: dimensions,
      walls: this._calculateWalls(dimensions),
      center: { x: 0, y: 0, z: 0 },
      options: options
    };
    
    // 1. Place wall-adjacent furniture
    this._placeFurnitureAlongWalls(roomType, dimensions);
    
    // 2. Place center furniture
    this._placeCenterFurniture(roomType, dimensions);
    
    // 3. Create asset marriages (TV + stand, computer + desk, etc.)
    this._createAssetMarriages();
    
    // 4. Place wall decorations
    this._placeWallDecorations(roomType, dimensions);
    
    // 5. Place surface toppers (books on desks, etc.)
    this._placeSurfaceToppers(roomType);
    
    // 6. Final validation and cleanup
    this._validatePlacement();
    
    console.log(`✓ Room generated:`, this.getStats());
    
    return {
      furniture: Array.from(this.placedAssets.values()),
      toppers: Array.from(this.surfaceTopperSystem.toppers.values()),
      decorations: this.wallDecorations,
      marriages: this.marriageSystem.getAllMarriages(),
      stats: this.getStats()
    };
  }
  
  /**
   * Calculate wall boundaries
   */
  _calculateWalls(dimensions) {
    const { width, depth, height } = dimensions;
    const halfW = width / 2;
    const halfD = depth / 2;
    
    return {
      north: { position: { x: 0, y: height / 2, z: -halfD }, normal: { x: 0, z: 1 }, length: width },
      south: { position: { x: 0, y: height / 2, z: halfD }, normal: { x: 0, z: -1 }, length: width },
      east: { position: { x: halfW, y: height / 2, z: 0 }, normal: { x: -1, z: 0 }, length: depth },
      west: { position: { x: -halfW, y: height / 2, z: 0 }, normal: { x: 1, z: 0 }, length: depth }
    };
  }
  
  /**
   * Place furniture along walls
   */
  _placeFurnitureAlongWalls(roomType, dimensions) {
    const rules = WALL_FURNITURE_RULES[roomType];
    if (!rules) {
      console.warn(`No furniture rules for room type: ${roomType}`);
      return;
    }
    
    const { width, depth } = dimensions;
    const wallMargin = 0.3; // 30cm from wall
    
    // North wall (-Z) - Face into room (south/+Z direction)
    if (rules.north) {
      this._placeFurnitureOnWall(rules.north, 'north', {
        x: 0,
        z: -depth / 2 + wallMargin,
        length: width - 1, // Leave 1m total margin
        facing: Math.PI // Face south (into room)
      }, roomType);
    }
    
    // South wall (+Z) - Face into room (north/-Z direction)
    if (rules.south) {
      this._placeFurnitureOnWall(rules.south, 'south', {
        x: 0,
        z: depth / 2 - wallMargin,
        length: width - 1,
        facing: 0 // Face north (into room)
      }, roomType);
    }
    
    // East wall (+X) - Face into room (west/-X direction)
    if (rules.east) {
      this._placeFurnitureOnWall(rules.east, 'east', {
        x: width / 2 - wallMargin,
        z: 0,
        length: depth - 1,
        facing: Math.PI / 2 // Face west (into room)
      }, roomType);
    }
    
    // West wall (-X) - Face into room (east/+X direction)
    if (rules.west) {
      this._placeFurnitureOnWall(rules.west, 'west', {
        x: -width / 2 + wallMargin,
        z: 0,
        length: depth - 1,
        facing: -Math.PI / 2 // Face east (into room)
      }, roomType);
    }
  }
  
  /**
   * Place furniture items on a specific wall
   */
  _placeFurnitureOnWall(furnitureTypes, wall, wallConfig, roomType) {
    const { x, z, length, facing } = wallConfig;
    const isHorizontal = (wall === 'north' || wall === 'south');
    
    let currentOffset = -length / 2;
    const spacing = 0.2; // 20cm between items
    
    for (const furnitureType of furnitureTypes) {
      // Skip if we've run out of wall space
      if (currentOffset >= length / 2) break;
      
      // Get furniture dimensions (estimate if not available)
      const furnitureDims = this._estimateFurnitureDimensions(furnitureType);
      const furnitureWidth = isHorizontal ? furnitureDims.width : furnitureDims.depth;
      
      // Check if item fits
      if (currentOffset + furnitureWidth > length / 2) break;
      
      // Calculate position
      const itemPos = {
        x: isHorizontal ? (x + currentOffset + furnitureWidth / 2) : x,
        y: 0,
        z: isHorizontal ? z : (z + currentOffset + furnitureWidth / 2)
      };
      
      // Check if position is available
      if (this.hotSpotManager.isPositionAvailable(itemPos.x, itemPos.z, furnitureDims.width, furnitureDims.depth)) {
        // Place the furniture
        const asset = this._placeAsset(furnitureType, itemPos, facing, roomType);
        
        if (asset) {
          // Create hotspot
          this.hotSpotManager.createHotSpot(
            itemPos.x,
            itemPos.z,
            furnitureDims.width,
            furnitureDims.depth,
            'furniture',
            { assetId: asset.id, wall: wall }
          );
          
          this.stats.furniture++;
        }
      }
      
      currentOffset += furnitureWidth + spacing;
    }
  }
  
  /**
   * Place center furniture
   */
  _placeCenterFurniture(roomType, dimensions) {
    const rules = WALL_FURNITURE_RULES[roomType];
    if (!rules || !rules.center) return;
    
    const { width, depth } = dimensions;
    const centerBounds = {
      minX: -width / 4,
      maxX: width / 4,
      minZ: -depth / 4,
      maxZ: depth / 4
    };
    
    for (const furnitureType of rules.center) {
      const furnitureDims = this._estimateFurnitureDimensions(furnitureType);
      
      const pos = this.hotSpotManager.findRandomAvailablePosition(
        centerBounds,
        furnitureDims.width,
        furnitureDims.depth,
        30
      );
      
      if (pos) {
        const asset = this._placeAsset(furnitureType, { ...pos, y: 0 }, 0, roomType);
        
        if (asset) {
          this.hotSpotManager.createHotSpot(
            pos.x,
            pos.z,
            furnitureDims.width,
            furnitureDims.depth,
            'furniture',
            { assetId: asset.id, position: 'center' }
          );
          
          this.stats.furniture++;
        }
      }
    }
  }
  
  /**
   * Place an asset
   */
  _placeAsset(assetType, position, rotation, roomType) {
    // Check if asset exists in registry
    const createFunction = this.assetRegistry[assetType];
    
    if (!createFunction) {
      console.warn(`Asset type "${assetType}" not found in registry`);
      return null;
    }
    
    // Create the asset
    try {
      const mesh = createFunction();
      
      if (!mesh) {
        console.error(`Failed to create asset: ${assetType}`);
        return null;
      }
      
      mesh.position.set(position.x, position.y, position.z);
      mesh.rotation.y = rotation;
      
      this.scene.add(mesh);
      
      const asset = {
        id: `asset_${Date.now()}_${Math.random()}`,
        type: assetType,
        mesh: mesh,
        position: position,
        rotation: rotation,
        roomType: roomType
      };
      
      this.placedAssets.set(asset.id, asset);
      
      return asset;
    } catch (error) {
      console.error(`Error creating asset ${assetType}:`, error);
      return null;
    }
  }
  
  /**
   * Create asset marriages
   */
  _createAssetMarriages() {
    // Find assets that should be married
    for (const asset of this.placedAssets.values()) {
      const marriages = this.marriageSystem.getRecommendedMarriages(asset.type);
      
      for (const marriageRec of marriages) {
        if (marriageRec.priority === 'mandatory' || Math.random() < 0.7) {
          const marriage = this.marriageSystem.createMarriage(
            marriageRec.type,
            asset,
            asset.position,
            asset.rotation
          );
          
          if (marriage) {
            // Place secondary assets
            const template = marriageRec.template;
            for (let i = 0; i < template.secondaries.length; i++) {
              const secondaryType = template.secondaries[i];
              
              // Calculate position for secondary
              const offset = template.secondaryOffsets ? template.secondaryOffsets[i] : { x: 0, y: 0, z: 0 };
              const cos = Math.cos(asset.rotation);
              const sin = Math.sin(asset.rotation);
              
              const secondaryPos = {
                x: asset.position.x + (offset.x * cos - offset.z * sin),
                y: asset.position.y + offset.y,
                z: asset.position.z + (offset.x * sin + offset.z * cos)
              };
              
              const secondaryAsset = this._placeAsset(secondaryType, secondaryPos, asset.rotation, asset.roomType);
              
              if (secondaryAsset) {
                this.marriageSystem.addSecondary(marriage.id, secondaryAsset, i);
              }
            }
            
            this.stats.marriages++;
          }
        }
      }
    }
  }
  
  /**
   * Place wall decorations
   */
  _placeWallDecorations(roomType, dimensions) {
    const decorRules = WALL_DECORATION_RULES[roomType];
    if (!decorRules) return;
    
    const walls = this.currentRoom.walls;
    
    for (const [wallName, wallData] of Object.entries(walls)) {
      const wallLength = wallData.length;
      let currentPos = -wallLength / 2 + 0.5;
      
      for (const decorRule of decorRules) {
        if (Math.random() > decorRule.probability) continue;
        if (currentPos >= wallLength / 2 - 0.5) break;
        
        // Place decoration
        const decorPos = {
          x: wallData.position.x + (wallName === 'north' || wallName === 'south' ? currentPos : 0),
          y: decorRule.height,
          z: wallData.position.z + (wallName === 'east' || wallName === 'west' ? currentPos : 0)
        };
        
        this.wallDecorations.push({
          type: decorRule.type,
          position: decorPos,
          wall: wallName
        });
        
        this.stats.wallDecorations++;
        currentPos += 1.0; // 1m spacing
      }
    }
  }
  
  /**
   * Place surface toppers
   */
  _placeSurfaceToppers(roomType) {
    // Register all surfaces
    for (const asset of this.placedAssets.values()) {
      if (this._isSurfaceType(asset.type)) {
        const surfaceBounds = this._calculateSurfaceBounds(asset);
        
        this.surfaceTopperSystem.registerSurface(
          asset.id,
          asset.type,
          surfaceBounds,
          roomType
        );
        
        // Place toppers
        const toppers = this.surfaceTopperSystem.placeToppers(asset.id, roomType);
        
        // Create meshes for toppers
        for (const topper of toppers) {
          const topperAsset = this._placeAsset(topper.assetType, topper.position, topper.rotation, roomType);
          if (topperAsset) {
            this.stats.toppers++;
          }
        }
      }
    }
  }
  
  /**
   * Check if asset type is a surface
   */
  _isSurfaceType(assetType) {
    const surfaceTypes = ['desk', 'table', 'coffeeTable', 'nightstand', 'dresser', 'counter', 'shelf', 'bookshelf', 'tvStand'];
    return surfaceTypes.some(type => assetType.toLowerCase().includes(type.toLowerCase()));
  }
  
  /**
   * Calculate surface bounds for an asset
   */
  _calculateSurfaceBounds(asset) {
    const dims = this._estimateFurnitureDimensions(asset.type);
    
    return {
      x: asset.position.x,
      z: asset.position.z,
      width: dims.width * 0.8, // Usable surface area (80% of total)
      depth: dims.depth * 0.8,
      height: dims.height
    };
  }
  
  /**
   * Estimate furniture dimensions
   */
  _estimateFurnitureDimensions(furnitureType) {
    const dimensions = {
      // Seating
      bed: { width: 2.0, depth: 2.2, height: 0.6 },
      sofa: { width: 2.0, depth: 0.9, height: 0.8 },
      armchair: { width: 0.8, depth: 0.9, height: 0.9 },
      diningChair: { width: 0.5, depth: 0.5, height: 0.9 },
      officeChair: { width: 0.6, depth: 0.6, height: 1.0 },
      
      // Tables
      desk: { width: 1.5, depth: 0.8, height: 0.75 },
      diningTable: { width: 1.8, depth: 1.0, height: 0.75 },
      coffeeTable: { width: 1.2, depth: 0.6, height: 0.4 },
      nightstand: { width: 0.5, depth: 0.4, height: 0.6 },
      
      // Storage
      dresser: { width: 1.2, depth: 0.5, height: 1.0 },
      wardrobe: { width: 1.5, depth: 0.6, height: 2.0 },
      bookshelf: { width: 1.0, depth: 0.3, height: 1.8 },
      shelf: { width: 0.8, depth: 0.25, height: 0.3 },
      
      // Electronics
      tv: { width: 1.2, depth: 0.1, height: 0.7 },
      tvStand: { width: 1.5, depth: 0.4, height: 0.5 },
      
      // Default
      default: { width: 0.6, depth: 0.6, height: 0.8 }
    };
    
    return dimensions[furnitureType] || dimensions.default;
  }
  
  /**
   * Validate placement
   */
  _validatePlacement() {
    // Check for overlaps and issues
    const issues = [];
    
    // Check hotspot overlaps
    for (const hs1 of this.hotSpotManager.hotspots.values()) {
      for (const hs2 of this.hotSpotManager.hotspots.values()) {
        if (hs1.id !== hs2.id && hs1.overlaps(hs2)) {
          issues.push(`Overlap detected: ${hs1.metadata.assetId} <-> ${hs2.metadata.assetId}`);
        }
      }
    }
    
    if (issues.length > 0) {
      console.warn('Placement issues detected:', issues);
    }
    
    return issues;
  }
  
  /**
   * Clear room
   */
  clear() {
    // Remove meshes
    for (const asset of this.placedAssets.values()) {
      if (asset.mesh) {
        this.scene.remove(asset.mesh);
      }
    }
    
    this.placedAssets.clear();
    this.wallDecorations = [];
    this.hotSpotManager.clear();
    this.marriageSystem.clear();
    this.surfaceTopperSystem.clear();
    
    this.stats = {
      furniture: 0,
      toppers: 0,
      wallDecorations: 0,
      marriages: 0
    };
  }
  
  /**
   * Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      hotspots: this.hotSpotManager.getStats(),
      marriages: this.marriageSystem.getStats(),
      surfaces: this.surfaceTopperSystem.getStats()
    };
  }
}

export default RoomGenerationSystem;

