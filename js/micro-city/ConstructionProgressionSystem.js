// ==================== CONSTRUCTION PROGRESSION SYSTEM ====================
// Manages building evolution from tents to megacities

import { ScaleConstants } from './ScaleConstants.js';
import { getGlobalEventBus, MicroCityEvents } from './EventBus.js';

/**
 * Micro Structure (building)
 */
export class MicroStructure {
  constructor(config) {
    this.id = config.id || `structure_${Date.now()}_${Math.random()}`;
    this.type = config.type;
    this.tier = config.tier;
    this.generation = config.generation;
    this.scale = ScaleConstants.calculateScale(this.generation);
    
    this.position = config.position || { x: 0, y: 0, z: 0 };
    
    // Construction
    const tierConfig = ScaleConstants.BUILDING_TIERS[this.tier];
    this.progress = 0; // 0-1
    this.buildTimeRequired = tierConfig.buildTime;
    this.buildTimeElapsed = 0;
    
    // Resources
    this.resourcesRequired = { ...tierConfig.resources };
    this.resourcesNeeded = { ...tierConfig.resources }; // Decreases as contributed
    
    // Functionality
    this.capacity = tierConfig.capacity;
    this.residents = [];
    
    // Visual
    this.mesh = null;
    this.visible = true;
    
    // Metadata
    this.createdAt = Date.now();
    this.completedAt = null;
    this.contributors = [];
  }
  
  /**
   * Add construction progress
   */
  addProgress(amount, citizenId) {
    this.progress += amount;
    this.buildTimeElapsed += amount;
    
    if (citizenId && !this.contributors.includes(citizenId)) {
      this.contributors.push(citizenId);
    }
    
    return this.isComplete();
  }
  
  /**
   * Check if construction is complete
   */
  isComplete() {
    return this.progress >= 1.0;
  }
  
  /**
   * Mark as completed
   */
  complete() {
    this.progress = 1.0;
    this.completedAt = Date.now();
  }
  
  /**
   * Check if can house more residents
   */
  canHouseMore() {
    return this.residents.length < this.capacity;
  }
  
  /**
   * Add resident
   */
  addResident(citizenId) {
    if (this.canHouseMore() && !this.residents.includes(citizenId)) {
      this.residents.push(citizenId);
      return true;
    }
    return false;
  }
  
  /**
   * Remove resident
   */
  removeResident(citizenId) {
    const index = this.residents.indexOf(citizenId);
    if (index !== -1) {
      this.residents.splice(index, 1);
    }
  }
  
  /**
   * Get structure info
   */
  getInfo() {
    return {
      id: this.id,
      type: this.type,
      tier: this.tier,
      generation: this.generation,
      scale: this.scale,
      progress: (this.progress * 100).toFixed(1) + '%',
      capacity: `${this.residents.length}/${this.capacity}`,
      contributors: this.contributors.length,
      age: this.completedAt ? ((Date.now() - this.completedAt) / 1000).toFixed(1) + 's' : 'building...'
    };
  }
}

/**
 * Construction Progression System
 */
export class ConstructionProgressionSystem {
  constructor(config = {}) {
    this.structures = new Map(); // id -> MicroStructure
    this.structuresByGeneration = new Map(); // generation -> Set of structure ids
    this.activeConstructions = []; // Structures not yet complete
    
    this.eventBus = config.eventBus || getGlobalEventBus();
    
    this.totalStructuresCreated = 0;
    this.totalStructuresCompleted = 0;
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Listen for citizen contributions
    this.eventBus.on(MicroCityEvents.CITIZEN_GATHERED_RESOURCE, (data) => {
      // Could trigger construction planning if enough resources
    });
  }
  
  /**
   * Start new construction
   */
  planConstruction(config) {
    const structure = new MicroStructure({
      ...config,
      id: `structure_${this.totalStructuresCreated++}`
    });
    
    this.structures.set(structure.id, structure);
    this.activeConstructions.push(structure);
    
    // Track by generation
    if (!this.structuresByGeneration.has(structure.generation)) {
      this.structuresByGeneration.set(structure.generation, new Set());
    }
    this.structuresByGeneration.get(structure.generation).add(structure.id);
    
    this.eventBus.emit(MicroCityEvents.CONSTRUCTION_STARTED, {
      structureId: structure.id,
      type: structure.type,
      tier: structure.tier,
      generation: structure.generation,
      position: structure.position
    });
    
    return structure;
  }
  
  /**
   * Update construction progress
   */
  updateConstruction(structure) {
    this.eventBus.emit(MicroCityEvents.CONSTRUCTION_PROGRESS, {
      structureId: structure.id,
      progress: structure.progress,
      resourcesNeeded: structure.resourcesNeeded
    });
    
    // Check if completed
    if (structure.isComplete() && !structure.completedAt) {
      this.completeConstruction(structure);
    }
  }
  
  /**
   * Complete a construction
   */
  completeConstruction(structure) {
    structure.complete();
    this.totalStructuresCompleted++;
    
    // Remove from active constructions
    const index = this.activeConstructions.findIndex(s => s.id === structure.id);
    if (index !== -1) {
      this.activeConstructions.splice(index, 1);
    }
    
    this.eventBus.emit(MicroCityEvents.CONSTRUCTION_COMPLETED, {
      structureId: structure.id,
      structure: structure,
      type: structure.type,
      tier: structure.tier,
      generation: structure.generation,
      contributors: structure.contributors
    });
  }
  
  /**
   * Automatically plan construction based on population and resources
   */
  autoplanConstruction(generation, population, resources) {
    // Don't plan if already building
    if (this.activeConstructions.length > 0) return null;
    
    // Determine next tier to build
    const tierConfig = ScaleConstants.getBuildingTierForGeneration(generation);
    
    // Check if population meets minimum
    if (population < tierConfig.minPopulation) return null;
    
    // Check if resources available
    for (const [resource, amount] of Object.entries(tierConfig.resources)) {
      if ((resources[resource] || 0) < amount * 0.5) {
        return null; // Not enough resources
      }
    }
    
    // Plan it!
    const structure = this.planConstruction({
      type: tierConfig.type,
      tier: tierConfig.tier,
      generation: generation,
      position: this.findBuildingSpot(generation)
    });
    
    return structure;
  }
  
  /**
   * Find suitable building spot
   */
  findBuildingSpot(generation) {
    // Simple: place near origin with some spacing
    const existing = this.getStructuresByGeneration(generation);
    const spread = 0.5 * ScaleConstants.calculateScale(generation);
    
    return {
      x: (Math.random() - 0.5) * spread * existing.length,
      y: 0,
      z: (Math.random() - 0.5) * spread * existing.length
    };
  }
  
  /**
   * Get structure by ID
   */
  getStructure(structureId) {
    return this.structures.get(structureId);
  }
  
  /**
   * Get structures by generation
   */
  getStructuresByGeneration(generation) {
    const ids = this.structuresByGeneration.get(generation);
    if (!ids) return [];
    return Array.from(ids).map(id => this.structures.get(id)).filter(s => s);
  }
  
  /**
   * Get active constructions
   */
  getActiveConstructions() {
    return [...this.activeConstructions];
  }
  
  /**
   * Get completed structures
   */
  getCompletedStructures() {
    return Array.from(this.structures.values()).filter(s => s.isComplete());
  }
  
  /**
   * Remove structure
   */
  removeStructure(structureId) {
    const structure = this.structures.get(structureId);
    if (structure) {
      // Remove from generation tracking
      if (this.structuresByGeneration.has(structure.generation)) {
        this.structuresByGeneration.get(structure.generation).delete(structureId);
      }
      
      // Remove from active constructions
      const index = this.activeConstructions.findIndex(s => s.id === structureId);
      if (index !== -1) {
        this.activeConstructions.splice(index, 1);
      }
      
      this.structures.delete(structureId);
      
      this.eventBus.emit(MicroCityEvents.CONSTRUCTION_DESTROYED, {
        structureId: structureId,
        type: structure.type,
        generation: structure.generation
      });
    }
  }
  
  /**
   * Get all statistics
   */
  getAllStats() {
    return {
      totalStructures: this.structures.size,
      totalCreated: this.totalStructuresCreated,
      totalCompleted: this.totalStructuresCompleted,
      activeConstructions: this.activeConstructions.length,
      structuresByType: this.getStructureCountByType(),
      structuresByGeneration: this.getStructureCountByGeneration()
    };
  }
  
  /**
   * Get structure count by type
   */
  getStructureCountByType() {
    const counts = {};
    for (const structure of this.structures.values()) {
      counts[structure.type] = (counts[structure.type] || 0) + 1;
    }
    return counts;
  }
  
  /**
   * Get structure count by generation
   */
  getStructureCountByGeneration() {
    const counts = {};
    for (const [gen, ids] of this.structuresByGeneration.entries()) {
      counts[gen] = ids.size;
    }
    return counts;
  }
  
  /**
   * Clear all structures
   */
  clear() {
    this.structures.clear();
    this.structuresByGeneration.clear();
    this.activeConstructions = [];
  }
}

export default ConstructionProgressionSystem;



