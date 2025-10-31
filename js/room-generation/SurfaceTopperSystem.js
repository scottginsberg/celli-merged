// ==================== SURFACE TOPPER SYSTEM ====================
// Manages placement of small props on surfaces (books on desks, pens on tables, etc.)

/**
 * Define which props can go on which surfaces by room type
 */
export const SURFACE_TOPPER_RULES = {
  // Bedroom surfaces
  bedroom_desk: {
    surface: 'desk',
    toppers: [
      { asset: 'notebook', probability: 0.8, maxCount: 2 },
      { asset: 'pen', probability: 0.7, maxCount: 3 },
      { asset: 'book', probability: 0.6, maxCount: 2 },
      { asset: 'tableLamp', probability: 0.9, maxCount: 1 },
      { asset: 'computerMonitor', probability: 0.5, maxCount: 1 },
      { asset: 'keyboard', probability: 0.5, maxCount: 1 },
      { asset: 'mouse', probability: 0.5, maxCount: 1 }
    ],
    density: 'medium' // 'sparse', 'medium', 'dense'
  },
  
  bedroom_nightstand: {
    surface: 'nightstand',
    toppers: [
      { asset: 'tableLamp', probability: 0.9, maxCount: 1 },
      { asset: 'book', probability: 0.6, maxCount: 1 },
      { asset: 'waterBottle', probability: 0.3, maxCount: 1 },
      { asset: 'alarm clock', probability: 0.5, maxCount: 1 }
    ],
    density: 'sparse'
  },
  
  // Living room surfaces
  livingRoom_coffeeTable: {
    surface: 'coffeeTable',
    toppers: [
      { asset: 'magazine', probability: 0.7, maxCount: 3 },
      { asset: 'book', probability: 0.5, maxCount: 2 },
      { asset: 'remoteControl', probability: 0.8, maxCount: 1 },
      { asset: 'sodaCan', probability: 0.4, maxCount: 1 },
      { asset: 'coaster', probability: 0.6, maxCount: 4 }
    ],
    density: 'medium'
  },
  
  livingRoom_tvStand: {
    surface: 'tvStand',
    toppers: [
      { asset: 'tv', probability: 1.0, maxCount: 1 }, // Mandatory
      { asset: 'gamingConsole', probability: 0.4, maxCount: 1 },
      { asset: 'remoteControl', probability: 0.7, maxCount: 2 }
    ],
    density: 'sparse'
  },
  
  livingRoom_shelf: {
    surface: 'shelf',
    toppers: [
      { asset: 'book', probability: 0.8, maxCount: 5 },
      { asset: 'pottedPlant', probability: 0.4, maxCount: 1 },
      { asset: 'picture frame', probability: 0.5, maxCount: 2 },
      { asset: 'decorative vase', probability: 0.3, maxCount: 1 }
    ],
    density: 'dense'
  },
  
  // Office surfaces
  office_desk: {
    surface: 'desk',
    toppers: [
      { asset: 'computerMonitor', probability: 0.9, maxCount: 2 },
      { asset: 'keyboard', probability: 0.9, maxCount: 1 },
      { asset: 'mouse', probability: 0.9, maxCount: 1 },
      { asset: 'pen', probability: 0.9, maxCount: 3 },
      { asset: 'notebook', probability: 0.8, maxCount: 2 },
      { asset: 'paperClip', probability: 0.6, maxCount: 5 },
      { asset: 'stapler', probability: 0.7, maxCount: 1 },
      { asset: 'tableLamp', probability: 0.8, maxCount: 1 },
      { asset: 'coffee mug', probability: 0.5, maxCount: 1 }
    ],
    density: 'dense'
  },
  
  office_fileCabinet: {
    surface: 'fileCabinet',
    toppers: [
      { asset: 'folder', probability: 0.7, maxCount: 3 },
      { asset: 'binder', probability: 0.6, maxCount: 2 },
      { asset: 'pen holder', probability: 0.5, maxCount: 1 }
    ],
    density: 'medium'
  },
  
  // Kitchen surfaces
  kitchen_counter: {
    surface: 'kitchenCounter',
    toppers: [
      { asset: 'coffeemaker', probability: 0.8, maxCount: 1 },
      { asset: 'toaster', probability: 0.7, maxCount: 1 },
      { asset: 'kitchenKnife', probability: 0.6, maxCount: 3 },
      { asset: 'cuttingBoard', probability: 0.7, maxCount: 1 },
      { asset: 'fruitBowl', probability: 0.5, maxCount: 1 },
      { asset: 'spiceRack', probability: 0.4, maxCount: 1 }
    ],
    density: 'medium'
  },
  
  kitchen_diningTable: {
    surface: 'diningTable',
    toppers: [
      { asset: 'plate', probability: 0.8, maxCount: 4 },
      { asset: 'fork', probability: 0.8, maxCount: 4 },
      { asset: 'knife', probability: 0.8, maxCount: 4 },
      { asset: 'glass', probability: 0.7, maxCount: 4 },
      { asset: 'napkin', probability: 0.6, maxCount: 4 },
      { asset: 'centerpiece', probability: 0.5, maxCount: 1 }
    ],
    density: 'medium'
  },
  
  // Bathroom surfaces
  bathroom_sink: {
    surface: 'bathroomSink',
    toppers: [
      { asset: 'soap', probability: 0.9, maxCount: 1 },
      { asset: 'toothbrush', probability: 0.8, maxCount: 2 },
      { asset: 'toothpaste', probability: 0.8, maxCount: 1 },
      { asset: 'handTowel', probability: 0.7, maxCount: 1 }
    ],
    density: 'sparse'
  },
  
  bathroom_counter: {
    surface: 'bathroomCounter',
    toppers: [
      { asset: 'perfume', probability: 0.5, maxCount: 2 },
      { asset: 'hairbrush', probability: 0.6, maxCount: 1 },
      { asset: 'makeup', probability: 0.4, maxCount: 3 },
      { asset: 'tissue box', probability: 0.7, maxCount: 1 }
    ],
    density: 'medium'
  },
  
  // School surfaces
  school_desk: {
    surface: 'desk',
    toppers: [
      { asset: 'notebook', probability: 0.9, maxCount: 2 },
      { asset: 'textbook', probability: 0.8, maxCount: 2 },
      { asset: 'pen', probability: 0.9, maxCount: 3 },
      { asset: 'pencil', probability: 0.9, maxCount: 3 },
      { asset: 'eraser', probability: 0.7, maxCount: 1 },
      { asset: 'ruler', probability: 0.6, maxCount: 1 },
      { asset: 'calculator', probability: 0.5, maxCount: 1 }
    ],
    density: 'dense'
  }
};

export class SurfaceTopperSystem {
  constructor(hotSpotManager) {
    this.hotSpotManager = hotSpotManager;
    this.surfaces = new Map(); // surfaceId -> surface data
    this.toppers = new Map(); // topperId -> topper data
    this.surfaceToppers = new Map(); // surfaceId -> Set of topper IDs
  }
  
  /**
   * Register a surface that can have toppers
   */
  registerSurface(surfaceAssetId, surfaceType, bounds, roomType) {
    const surface = {
      id: surfaceAssetId,
      type: surfaceType,
      roomType: roomType,
      bounds: bounds, // { x, z, width, depth, height }
      toppers: new Set(),
      capacity: this._calculateCapacity(bounds, roomType, surfaceType)
    };
    
    this.surfaces.set(surfaceAssetId, surface);
    this.surfaceToppers.set(surfaceAssetId, new Set());
    
    return surface;
  }
  
  /**
   * Calculate surface capacity based on size and type
   */
  _calculateCapacity(bounds, roomType, surfaceType) {
    const area = bounds.width * bounds.depth;
    const ruleKey = `${roomType}_${surfaceType}`;
    const rule = SURFACE_TOPPER_RULES[ruleKey];
    
    if (!rule) return Math.floor(area * 10); // Default: ~10 items per m²
    
    const densityMultiplier = {
      'sparse': 5,
      'medium': 10,
      'dense': 20
    };
    
    return Math.floor(area * densityMultiplier[rule.density || 'medium']);
  }
  
  /**
   * Place toppers on a surface according to rules
   */
  placeToppers(surfaceAssetId, roomType) {
    const surface = this.surfaces.get(surfaceAssetId);
    if (!surface) {
      console.warn('Surface not found:', surfaceAssetId);
      return [];
    }
    
    const ruleKey = `${roomType}_${surface.type}`;
    const rule = SURFACE_TOPPER_RULES[ruleKey];
    
    if (!rule) {
      console.warn('No topper rules for:', ruleKey);
      return [];
    }
    
    const placedToppers = [];
    const bounds = surface.bounds;
    
    // Create hotspots grid on surface
    const gridSize = 0.1; // 10cm grid
    const cols = Math.floor(bounds.width / gridSize);
    const rows = Math.floor(bounds.depth / gridSize);
    const occupiedCells = new Set();
    
    // Place each topper type
    for (const topperRule of rule.toppers) {
      if (Math.random() > topperRule.probability) continue;
      
      const count = Math.floor(Math.random() * topperRule.maxCount) + 1;
      
      for (let i = 0; i < count; i++) {
        // Find random unoccupied position on surface
        let attempts = 0;
        let placed = false;
        
        while (attempts < 20 && !placed) {
          const col = Math.floor(Math.random() * cols);
          const row = Math.floor(Math.random() * rows);
          const cellKey = `${col},${row}`;
          
          if (!occupiedCells.has(cellKey)) {
            // Calculate world position
            const x = bounds.x + (col - cols / 2) * gridSize;
            const z = bounds.z + (row - rows / 2) * gridSize;
            const y = bounds.height;
            
            const topper = {
              id: `topper_${Date.now()}_${Math.random()}`,
              assetType: topperRule.asset,
              surfaceId: surfaceAssetId,
              position: { x, y, z },
              rotation: Math.random() * Math.PI * 2,
              gridCell: { col, row }
            };
            
            placedToppers.push(topper);
            this.toppers.set(topper.id, topper);
            this.surfaceToppers.get(surfaceAssetId).add(topper.id);
            occupiedCells.add(cellKey);
            
            // Mark neighboring cells as occupied to prevent overlap
            for (let dc = -1; dc <= 1; dc++) {
              for (let dr = -1; dr <= 1; dr++) {
                occupiedCells.add(`${col + dc},${row + dr}`);
              }
            }
            
            placed = true;
          }
          
          attempts++;
        }
      }
    }
    
    return placedToppers;
  }
  
  /**
   * Get toppers for a surface
   */
  getToppersForSurface(surfaceAssetId) {
    const topperIds = this.surfaceToppers.get(surfaceAssetId);
    if (!topperIds) return [];
    
    return Array.from(topperIds).map(id => this.toppers.get(id)).filter(t => t);
  }
  
  /**
   * Remove topper
   */
  removeTopper(topperId) {
    const topper = this.toppers.get(topperId);
    if (topper) {
      const surfaceToppers = this.surfaceToppers.get(topper.surfaceId);
      if (surfaceToppers) {
        surfaceToppers.delete(topperId);
      }
      this.toppers.delete(topperId);
    }
  }
  
  /**
   * Remove all toppers from surface
   */
  clearSurface(surfaceAssetId) {
    const topperIds = this.surfaceToppers.get(surfaceAssetId);
    if (topperIds) {
      for (const topperId of topperIds) {
        this.toppers.delete(topperId);
      }
      topperIds.clear();
    }
  }
  
  /**
   * Get all surfaces
   */
  getAllSurfaces() {
    return Array.from(this.surfaces.values());
  }
  
  /**
   * Get surface by ID
   */
  getSurface(surfaceAssetId) {
    return this.surfaces.get(surfaceAssetId);
  }
  
  /**
   * Clear all data
   */
  clear() {
    this.surfaces.clear();
    this.toppers.clear();
    this.surfaceToppers.clear();
  }
  
  /**
   * Get statistics
   */
  getStats() {
    let totalToppers = 0;
    const toppersByType = {};
    
    for (const topper of this.toppers.values()) {
      totalToppers++;
      toppersByType[topper.assetType] = (toppersByType[topper.assetType] || 0) + 1;
    }
    
    return {
      surfaces: this.surfaces.size,
      totalToppers: totalToppers,
      toppersByType: toppersByType,
      avgToppersPerSurface: this.surfaces.size > 0 ? (totalToppers / this.surfaces.size).toFixed(2) : 0
    };
  }
}

export default SurfaceTopperSystem;



