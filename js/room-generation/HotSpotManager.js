// ==================== HOT SPOT MANAGER ====================
// Manages non-overlapping placement zones for room generation

export class HotSpot {
  constructor(x, z, width, depth, type, metadata = {}) {
    this.x = x;              // Center x
    this.z = z;              // Center z
    this.width = width;
    this.depth = depth;
    this.type = type;        // 'furniture', 'topper', 'wall_decoration', 'reserved'
    this.occupied = false;
    this.metadata = metadata; // Additional data (assetId, parentHotSpot, etc.)
    this.id = `hotspot_${Date.now()}_${Math.random()}`;
  }
  
  /**
   * Check if this hotspot overlaps with another
   */
  overlaps(other, margin = 0.1) {
    const thisLeft = this.x - this.width / 2 - margin;
    const thisRight = this.x + this.width / 2 + margin;
    const thisBack = this.z - this.depth / 2 - margin;
    const thisFront = this.z + this.depth / 2 + margin;
    
    const otherLeft = other.x - other.width / 2 - margin;
    const otherRight = other.x + other.width / 2 + margin;
    const otherBack = other.z - other.depth / 2 - margin;
    const otherFront = other.z + other.depth / 2 + margin;
    
    return !(thisRight < otherLeft || thisLeft > otherRight ||
             thisFront < otherBack || thisBack > otherFront);
  }
  
  /**
   * Check if a point is inside this hotspot
   */
  containsPoint(x, z) {
    return (
      x >= this.x - this.width / 2 &&
      x <= this.x + this.width / 2 &&
      z >= this.z - this.depth / 2 &&
      z <= this.z + this.depth / 2
    );
  }
  
  /**
   * Mark as occupied
   */
  occupy(metadata = {}) {
    this.occupied = true;
    this.metadata = { ...this.metadata, ...metadata };
  }
  
  /**
   * Get corner positions
   */
  getCorners() {
    const halfW = this.width / 2;
    const halfD = this.depth / 2;
    return [
      { x: this.x - halfW, z: this.z - halfD }, // Back-left
      { x: this.x + halfW, z: this.z - halfD }, // Back-right
      { x: this.x + halfW, z: this.z + halfD }, // Front-right
      { x: this.x - halfW, z: this.z + halfD }  // Front-left
    ];
  }
}

export class HotSpotManager {
  constructor() {
    this.hotspots = new Map(); // id -> HotSpot
    this.spatialGrid = new Map(); // For fast spatial queries
    this.gridCellSize = 0.5; // 50cm grid cells
  }
  
  /**
   * Add a hotspot
   */
  addHotSpot(hotspot) {
    // Check for overlaps with existing hotspots
    for (const existing of this.hotspots.values()) {
      if (hotspot.overlaps(existing)) {
        console.warn('HotSpot overlap detected:', hotspot.id, existing.id);
        return null;
      }
    }
    
    this.hotspots.set(hotspot.id, hotspot);
    this._addToSpatialGrid(hotspot);
    return hotspot;
  }
  
  /**
   * Create and add a hotspot
   */
  createHotSpot(x, z, width, depth, type, metadata = {}) {
    const hotspot = new HotSpot(x, z, width, depth, type, metadata);
    return this.addHotSpot(hotspot);
  }
  
  /**
   * Find available hotspots of a specific type
   */
  findAvailableHotSpots(type) {
    return Array.from(this.hotspots.values())
      .filter(hs => hs.type === type && !hs.occupied);
  }
  
  /**
   * Find nearest available hotspot to a position
   */
  findNearestAvailable(x, z, type) {
    const available = this.findAvailableHotSpots(type);
    if (available.length === 0) return null;
    
    let nearest = null;
    let minDist = Infinity;
    
    for (const hs of available) {
      const dx = hs.x - x;
      const dz = hs.z - z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < minDist) {
        minDist = dist;
        nearest = hs;
      }
    }
    
    return nearest;
  }
  
  /**
   * Check if position is available (no overlaps)
   */
  isPositionAvailable(x, z, width, depth, margin = 0.1) {
    const testSpot = new HotSpot(x, z, width, depth, 'test');
    
    for (const existing of this.hotspots.values()) {
      if (testSpot.overlaps(existing, margin)) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Find random available position within bounds
   */
  findRandomAvailablePosition(bounds, width, depth, maxAttempts = 50) {
    const { minX, maxX, minZ, maxZ } = bounds;
    
    for (let i = 0; i < maxAttempts; i++) {
      const x = minX + Math.random() * (maxX - minX);
      const z = minZ + Math.random() * (maxZ - minZ);
      
      if (this.isPositionAvailable(x, z, width, depth)) {
        return { x, z };
      }
    }
    
    return null;
  }
  
  /**
   * Get hotspot by ID
   */
  getHotSpot(id) {
    return this.hotspots.get(id);
  }
  
  /**
   * Get hotspots in area
   */
  getHotSpotsInArea(x, z, radius) {
    const nearby = [];
    
    for (const hs of this.hotspots.values()) {
      const dx = hs.x - x;
      const dz = hs.z - z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist <= radius) {
        nearby.push(hs);
      }
    }
    
    return nearby;
  }
  
  /**
   * Remove hotspot
   */
  removeHotSpot(id) {
    const hotspot = this.hotspots.get(id);
    if (hotspot) {
      this._removeFromSpatialGrid(hotspot);
      this.hotspots.delete(id);
    }
  }
  
  /**
   * Clear all hotspots
   */
  clear() {
    this.hotspots.clear();
    this.spatialGrid.clear();
  }
  
  /**
   * Get statistics
   */
  getStats() {
    const byType = {};
    let occupied = 0;
    
    for (const hs of this.hotspots.values()) {
      byType[hs.type] = (byType[hs.type] || 0) + 1;
      if (hs.occupied) occupied++;
    }
    
    return {
      total: this.hotspots.size,
      occupied: occupied,
      available: this.hotspots.size - occupied,
      byType: byType
    };
  }
  
  // ===== Internal spatial grid methods =====
  
  _getGridKey(x, z) {
    const gx = Math.floor(x / this.gridCellSize);
    const gz = Math.floor(z / this.gridCellSize);
    return `${gx},${gz}`;
  }
  
  _addToSpatialGrid(hotspot) {
    const key = this._getGridKey(hotspot.x, hotspot.z);
    if (!this.spatialGrid.has(key)) {
      this.spatialGrid.set(key, new Set());
    }
    this.spatialGrid.get(key).add(hotspot.id);
  }
  
  _removeFromSpatialGrid(hotspot) {
    const key = this._getGridKey(hotspot.x, hotspot.z);
    const cell = this.spatialGrid.get(key);
    if (cell) {
      cell.delete(hotspot.id);
      if (cell.size === 0) {
        this.spatialGrid.delete(key);
      }
    }
  }
  
  /**
   * Debug visualization helper
   */
  getDebugData() {
    return Array.from(this.hotspots.values()).map(hs => ({
      id: hs.id,
      x: hs.x,
      z: hs.z,
      width: hs.width,
      depth: hs.depth,
      type: hs.type,
      occupied: hs.occupied,
      metadata: hs.metadata
    }));
  }
}

export default HotSpotManager;



