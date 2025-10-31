// ==================== ASSET MARRIAGE SYSTEM ====================
// Manages permanent pairs/groups of assets that should always be placed together

export const ASSET_MARRIAGES = {
  // TV + Stand (TV goes ON TOP of stand)
  tv_and_stand: {
    primary: 'tvStand',
    secondaries: ['tv'],
    secondaryOffsets: [
      { x: 0, y: 0.5, z: 0 }  // TV on top of stand
    ],
    arrangement: 'stacked',
    mandatory: true
  },
  
  // Living Room Full Set: Couch + Coffee Table + TV Stand + TV + Rug
  living_room_set: {
    primary: 'couch',
    secondaries: ['rug', 'coffeeTable', 'tvStand', 'tv'],
    secondaryOffsets: [
      { x: 0, y: -0.01, z: 0.3 },      // Rug UNDER couch (front feet outward)
      { x: 0, y: 0, z: -1.2 },          // Coffee table in front
      { x: 0, y: 0, z: -2.5 },          // TV stand further out
      { x: 0, y: 0.5, z: -2.5 }         // TV on stand
    ],
    arrangement: 'frontal',
    mandatory: false
  },
  
  // Couch + Side Tables
  couch_with_sides: {
    primary: 'couch',
    secondaries: ['endTable', 'endTable', 'tableLamp', 'tableLamp'],
    secondaryOffsets: [
      { x: -1.2, y: 0, z: 0 },          // Left side table
      { x: 1.2, y: 0, z: 0 },           // Right side table
      { x: -1.2, y: 0.5, z: 0 },        // Lamp on left table
      { x: 1.2, y: 0.5, z: 0 }          // Lamp on right table
    ],
    arrangement: 'side-by-side',
    mandatory: false
  },
  
  // Bed + Nightstands + Lamps + Rug
  bed_full_set: {
    primary: 'bed',
    secondaries: ['rug', 'nightstand', 'nightstand', 'tableLamp', 'tableLamp'],
    secondaryOffsets: [
      { x: 0, y: -0.01, z: 0 },         // Rug UNDER bed
      { x: -1.1, y: 0, z: 0.3 },        // Left nightstand
      { x: 1.1, y: 0, z: 0.3 },         // Right nightstand
      { x: -1.1, y: 0.5, z: 0.3 },      // Left lamp on nightstand
      { x: 1.1, y: 0.5, z: 0.3 }        // Right lamp on nightstand
    ],
    arrangement: 'bedroom',
    mandatory: false
  },
  
  // Computer setup
  computer_setup: {
    primary: 'computerMonitor',
    secondaries: ['keyboard', 'mouse'],
    secondaryOffsets: [
      { x: 0, y: -0.15, z: 0.15 },     // Keyboard in front
      { x: 0.15, y: -0.15, z: 0.15 }   // Mouse to side
    ],
    arrangement: 'grouped',
    mandatory: false
  },
  
  // Lamp on nightstand
  nightstand_lamp: {
    primary: 'nightstand',
    secondaries: ['tableLamp'],
    secondaryOffsets: [
      { x: 0, y: 0.5, z: 0 }
    ],
    arrangement: 'stacked',
    mandatory: false
  },
  
  // Books on bookshelf
  bookshelf_books: {
    primary: 'bookshelf',
    secondaries: ['book', 'book', 'book'],
    secondaryOffsets: [
      { x: -0.2, y: 0.8, z: 0 },
      { x: 0, y: 0.8, z: 0 },
      { x: 0.2, y: 0.8, z: 0 }
    ],
    arrangement: 'grouped',
    mandatory: false
  },
  
  // Desk setup
  desk_setup: {
    primary: 'desk',
    secondaries: ['pen', 'notebook', 'paperClip'],
    secondaryOffsets: [
      { x: -0.15, y: 0.4, z: 0 },
      { x: 0, y: 0.4, z: 0.05 },
      { x: 0.15, y: 0.4, z: -0.05 }
    ],
    arrangement: 'grouped',
    mandatory: false
  },
  
  // Coffee table items
  coffee_table_set: {
    primary: 'coffeeTable',
    secondaries: ['magazine', 'remoteControl'],
    secondaryOffsets: [
      { x: -0.1, y: 0.3, z: 0 },
      { x: 0.1, y: 0.3, z: 0 }
    ],
    arrangement: 'grouped',
    mandatory: false
  },
  
  // Dining table with chairs
  dining_set: {
    primary: 'diningTable',
    secondaries: ['diningChair', 'diningChair', 'diningChair', 'diningChair'],
    secondaryOffsets: [
      { x: 0, y: 0, z: -0.8 },  // Back
      { x: 0, y: 0, z: 0.8 },   // Front
      { x: -0.6, y: 0, z: 0 },  // Left
      { x: 0.6, y: 0, z: 0 }    // Right
    ],
    arrangement: 'surrounding',
    mandatory: true
  },
  
  // Bed with nightstands
  bedroom_set: {
    primary: 'bed',
    secondaries: ['nightstand', 'nightstand'],
    secondaryOffsets: [
      { x: -1, y: 0, z: 0 },    // Left
      { x: 1, y: 0, z: 0 }      // Right
    ],
    arrangement: 'side-by-side',
    mandatory: false
  },
  
  // Kitchen counter appliances
  kitchen_counter: {
    primary: 'kitchenCounter',
    secondaries: ['coffeemaker', 'toaster', 'kitchenKnife'],
    secondaryOffsets: [
      { x: -0.3, y: 0.5, z: 0 },
      { x: 0, y: 0.5, z: 0 },
      { x: 0.3, y: 0.5, z: 0 }
    ],
    arrangement: 'grouped',
    mandatory: false
  },
  
  // Office setup
  office_desk: {
    primary: 'officeDesk',
    secondaries: ['officeChair', 'computerMonitor', 'keyboard', 'mouse', 'pen'],
    secondaryOffsets: [
      { x: 0, y: 0, z: 0.8 },       // Chair in front
      { x: 0, y: 0.4, z: 0 },        // Monitor on desk
      { x: 0, y: 0.4, z: 0.3 },      // Keyboard
      { x: 0.2, y: 0.4, z: 0.3 },    // Mouse
      { x: -0.3, y: 0.4, z: 0.1 }    // Pen
    ],
    arrangement: 'grouped',
    mandatory: true
  },
  
  // Bookshelf with books (corner placement)
  bookshelf_full: {
    primary: 'bookshelf',
    secondaries: ['book', 'book', 'book', 'book', 'book'],
    secondaryOffsets: [
      { x: -0.2, y: 0.4, z: 0.05 },
      { x: 0, y: 0.4, z: 0.05 },
      { x: 0.2, y: 0.4, z: 0.05 },
      { x: -0.1, y: 0.8, z: 0.05 },
      { x: 0.1, y: 0.8, z: 0.05 }
    ],
    arrangement: 'grouped',
    mandatory: false,
    preferCorner: true  // Hint for placement system
  },
  
  // Kids Room Toy Set
  kids_toy_collection: {
    primary: 'toyBox',
    secondaries: ['teddyBear', 'toyTruck', 'toyDoll', 'blocks'],
    secondaryOffsets: [
      { x: 0.3, y: 0, z: 0.3 },
      { x: -0.3, y: 0, z: 0.3 },
      { x: 0.3, y: 0, z: -0.3 },
      { x: -0.3, y: 0, z: -0.3 }
    ],
    arrangement: 'scattered',
    mandatory: false,
    roomTypes: ['bedroom']  // Only in bedrooms
  },
  
  // Children's Desk + Chair + Supplies
  kids_desk_set: {
    primary: 'desk',
    secondaries: ['chair', 'notebook', 'crayonBox', 'pencilCase'],
    secondaryOffsets: [
      { x: 0, y: 0, z: 0.6 },      // Chair
      { x: -0.15, y: 0.4, z: 0 },   // Notebook
      { x: 0.15, y: 0.4, z: 0 },    // Crayons
      { x: 0, y: 0.4, z: 0.15 }     // Pencil case
    ],
    arrangement: 'grouped',
    mandatory: false,
    roomTypes: ['bedroom', 'classroom']
  },
  
  // Bathroom Set
  bathroom_vanity: {
    primary: 'bathroomSink',
    secondaries: ['mirror', 'toothbrush', 'soap', 'towel'],
    secondaryOffsets: [
      { x: 0, y: 0.8, z: -0.05 },    // Mirror on wall above
      { x: -0.15, y: 0.5, z: 0.1 },  // Toothbrush
      { x: 0, y: 0.5, z: 0.1 },      // Soap
      { x: 0.3, y: 0.4, z: 0 }       // Towel on side
    ],
    arrangement: 'grouped',
    mandatory: false,
    roomTypes: ['bathroom']
  },
  
  // Kitchen Counter Full Set
  kitchen_prep_station: {
    primary: 'counter',
    secondaries: ['cuttingBoard', 'knife', 'mixingBowl', 'utensils'],
    secondaryOffsets: [
      { x: 0, y: 0.5, z: 0 },
      { x: 0.15, y: 0.5, z: 0 },
      { x: -0.2, y: 0.5, z: 0.1 },
      { x: 0.3, y: 0.5, z: 0.05 }
    ],
    arrangement: 'grouped',
    mandatory: false,
    roomTypes: ['kitchen']
  },
  
  // Refrigerator with magnets/photos
  fridge_decorated: {
    primary: 'refrigerator',
    secondaries: ['magnet', 'photo', 'shoppingList'],
    secondaryOffsets: [
      { x: 0, y: 1.2, z: 0.31 },     // Front face, upper
      { x: 0.1, y: 0.9, z: 0.31 },   // Front face, middle
      { x: -0.1, y: 1.4, z: 0.31 }   // Front face, top
    ],
    arrangement: 'grouped',
    mandatory: false,
    roomTypes: ['kitchen']
  },
  
  // Reading Corner
  reading_nook: {
    primary: 'armchair',
    secondaries: ['floorLamp', 'sideTable', 'book', 'magazine'],
    secondaryOffsets: [
      { x: 0.8, y: 0, z: 0 },        // Floor lamp beside
      { x: -0.7, y: 0, z: 0.2 },     // Side table on other side
      { x: -0.7, y: 0.5, z: 0.2 },   // Book on table
      { x: -0.6, y: 0.5, z: 0.3 }    // Magazine on table
    ],
    arrangement: 'corner',
    mandatory: false
  },
  
  // Gaming Setup
  gaming_station: {
    primary: 'desk',
    secondaries: ['gamingChair', 'computerMonitor', 'keyboard', 'mouse', 'gameController', 'headphones'],
    secondaryOffsets: [
      { x: 0, y: 0, z: 0.8 },
      { x: 0, y: 0.4, z: -0.1 },
      { x: -0.15, y: 0.4, z: 0.25 },
      { x: 0.2, y: 0.4, z: 0.25 },
      { x: 0.35, y: 0.4, z: 0.1 },
      { x: -0.35, y: 0.4, z: 0.05 }
    ],
    arrangement: 'grouped',
    mandatory: false,
    roomTypes: ['bedroom', 'office']
  },
  
  // Dresser with Mirror and Items
  dresser_set: {
    primary: 'dresser',
    secondaries: ['mirror', 'perfume', 'jewelry', 'hairbrush'],
    secondaryOffsets: [
      { x: 0, y: 0.8, z: -0.05 },    // Mirror on wall
      { x: -0.2, y: 0.5, z: 0.1 },
      { x: 0, y: 0.5, z: 0.15 },
      { x: 0.2, y: 0.5, z: 0.1 }
    ],
    arrangement: 'grouped',
    mandatory: false,
    roomTypes: ['bedroom']
  },
  
  // Dining Table Full Set (6 chairs)
  dining_table_large: {
    primary: 'diningTable',
    secondaries: ['chair', 'chair', 'chair', 'chair', 'chair', 'chair', 'centerpiece'],
    secondaryOffsets: [
      { x: 0, y: 0, z: -1 },
      { x: 0, y: 0, z: 1 },
      { x: -0.7, y: 0, z: -0.5 },
      { x: -0.7, y: 0, z: 0.5 },
      { x: 0.7, y: 0, z: -0.5 },
      { x: 0.7, y: 0, z: 0.5 },
      { x: 0, y: 0.4, z: 0 }         // Centerpiece on table
    ],
    arrangement: 'surrounding',
    mandatory: false,
    roomTypes: ['dining', 'kitchen']
  },
  
  // Plant Corner
  plant_display: {
    primary: 'plantStand',
    secondaries: ['plant', 'plant', 'wateringCan'],
    secondaryOffsets: [
      { x: 0, y: 0.6, z: 0 },
      { x: 0.4, y: 0, z: 0.3 },
      { x: -0.3, y: 0, z: 0.2 }
    ],
    arrangement: 'grouped',
    mandatory: false,
    preferCorner: true
  },
  
  // Workspace with Storage
  workspace_organized: {
    primary: 'desk',
    secondaries: ['chair', 'laptop', 'deskLamp', 'pen', 'pen', 'notebook', 'paperTray', 'stapler'],
    secondaryOffsets: [
      { x: 0, y: 0, z: 0.7 },
      { x: -0.1, y: 0.4, z: 0.1 },
      { x: 0.4, y: 0.4, z: -0.1 },
      { x: 0.1, y: 0.4, z: 0.2 },
      { x: 0.15, y: 0.4, z: 0.25 },
      { x: -0.25, y: 0.4, z: 0.15 },
      { x: -0.4, y: 0.4, z: 0 },
      { x: 0.3, y: 0.4, z: 0.2 }
    ],
    arrangement: 'grouped',
    mandatory: false,
    roomTypes: ['office', 'bedroom']
  }
};

export class AssetMarriageSystem {
  constructor() {
    this.marriages = new Map(); // marriage ID -> marriage instance
    this.marriagesByPrimary = new Map(); // assetId -> Set of marriage IDs
    this.marriedAssets = new Set(); // Track which assets are in a marriage
  }
  
  /**
   * Create a marriage instance
   */
  createMarriage(marriageType, primaryAsset, position, rotation = 0) {
    const template = ASSET_MARRIAGES[marriageType];
    if (!template) {
      console.error(`Marriage type ${marriageType} not found`);
      return null;
    }
    
    const marriage = {
      id: `marriage_${Date.now()}_${Math.random()}`,
      type: marriageType,
      template: template,
      primary: {
        assetId: primaryAsset.id,
        assetType: template.primary,
        position: position,
        rotation: rotation,
        mesh: primaryAsset.mesh
      },
      secondaries: [],
      complete: false
    };
    
    this.marriages.set(marriage.id, marriage);
    
    if (!this.marriagesByPrimary.has(primaryAsset.id)) {
      this.marriagesByPrimary.set(primaryAsset.id, new Set());
    }
    this.marriagesByPrimary.get(primaryAsset.id).add(marriage.id);
    this.marriedAssets.add(primaryAsset.id);
    
    return marriage;
  }
  
  /**
   * Add a secondary asset to a marriage
   */
  addSecondary(marriageId, secondaryAsset, index) {
    const marriage = this.marriages.get(marriageId);
    if (!marriage) return false;
    
    const template = marriage.template;
    const offset = template.secondaryOffsets ? template.secondaryOffsets[index] : { x: 0, y: 0, z: 0 };
    
    // Calculate position relative to primary
    const primaryPos = marriage.primary.position;
    const primaryRot = marriage.primary.rotation;
    
    // Apply rotation to offset
    const cos = Math.cos(primaryRot);
    const sin = Math.sin(primaryRot);
    const rotatedX = offset.x * cos - offset.z * sin;
    const rotatedZ = offset.x * sin + offset.z * cos;
    
    const secondary = {
      assetId: secondaryAsset.id,
      assetType: template.secondaries[index],
      position: {
        x: primaryPos.x + rotatedX,
        y: primaryPos.y + offset.y,
        z: primaryPos.z + rotatedZ
      },
      rotation: primaryRot,
      mesh: secondaryAsset.mesh,
      index: index
    };
    
    marriage.secondaries.push(secondary);
    this.marriedAssets.add(secondaryAsset.id);
    
    // Check if marriage is complete
    if (marriage.secondaries.length === template.secondaries.length) {
      marriage.complete = true;
    }
    
    return secondary;
  }
  
  /**
   * Check if an asset is part of a marriage
   */
  isMarried(assetId) {
    return this.marriedAssets.has(assetId);
  }
  
  /**
   * Get marriage for an asset
   */
  getMarriageForAsset(assetId) {
    const marriageIds = this.marriagesByPrimary.get(assetId);
    if (!marriageIds || marriageIds.size === 0) {
      // Check if asset is a secondary in any marriage
      for (const marriage of this.marriages.values()) {
        for (const secondary of marriage.secondaries) {
          if (secondary.assetId === assetId) {
            return marriage;
          }
        }
      }
      return null;
    }
    
    // Return first marriage (typically only one)
    const marriageId = Array.from(marriageIds)[0];
    return this.marriages.get(marriageId);
  }
  
  /**
   * Get recommended marriages for an asset type
   */
  getRecommendedMarriages(assetType) {
    const recommendations = [];
    
    for (const [marriageType, template] of Object.entries(ASSET_MARRIAGES)) {
      if (template.primary === assetType) {
        recommendations.push({
          type: marriageType,
          template: template,
          priority: template.mandatory ? 'mandatory' : 'optional'
        });
      }
    }
    
    return recommendations;
  }
  
  /**
   * Get all marriages
   */
  getAllMarriages() {
    return Array.from(this.marriages.values());
  }
  
  /**
   * Get incomplete marriages
   */
  getIncompleteMarriages() {
    return Array.from(this.marriages.values()).filter(m => !m.complete);
  }
  
  /**
   * Remove a marriage
   */
  removeMarriage(marriageId) {
    const marriage = this.marriages.get(marriageId);
    if (!marriage) return;
    
    // Remove from tracking
    this.marriedAssets.delete(marriage.primary.assetId);
    for (const secondary of marriage.secondaries) {
      this.marriedAssets.delete(secondary.assetId);
    }
    
    const primaryId = marriage.primary.assetId;
    if (this.marriagesByPrimary.has(primaryId)) {
      this.marriagesByPrimary.get(primaryId).delete(marriageId);
    }
    
    this.marriages.delete(marriageId);
  }
  
  /**
   * Clear all marriages
   */
  clear() {
    this.marriages.clear();
    this.marriagesByPrimary.clear();
    this.marriedAssets.clear();
  }
  
  /**
   * Get statistics
   */
  getStats() {
    let complete = 0;
    let incomplete = 0;
    const byType = {};
    
    for (const marriage of this.marriages.values()) {
      if (marriage.complete) complete++;
      else incomplete++;
      
      byType[marriage.type] = (byType[marriage.type] || 0) + 1;
    }
    
    return {
      total: this.marriages.size,
      complete: complete,
      incomplete: incomplete,
      byType: byType,
      totalAssets: this.marriedAssets.size
    };
  }
}

export default AssetMarriageSystem;

