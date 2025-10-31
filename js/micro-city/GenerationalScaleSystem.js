// ==================== GENERATIONAL SCALE SYSTEM ====================
// Manages generation tracking and size progression

import { ScaleConstants } from './ScaleConstants.js';
import { getGlobalEventBus, MicroCityEvents } from './EventBus.js';

/**
 * Generation data tracker
 */
export class Generation {
  constructor(number) {
    this.number = number;
    this.scale = ScaleConstants.calculateScale(number);
    this.startTime = Date.now();
    this.population = 0;
    this.citizensSpawned = 0;
    this.citizensDied = 0;
    this.structures = [];
    this.totalResources = 0;
    this.daysLived = 0;
    this.culturalLevel = this.determineCulturalLevel();
  }
  
  determineCulturalLevel() {
    if (this.number === 0) return 'nomadic';
    if (this.number <= 2) return 'settled';
    if (this.number <= 4) return 'village';
    if (this.number <= 6) return 'town';
    return 'city';
  }
  
  update(stats) {
    this.population = stats.population || 0;
    this.totalResources = stats.totalResources || 0;
    this.daysLived = stats.daysLived || 0;
    this.culturalLevel = this.determineCulturalLevel();
  }
  
  addStructure(structure) {
    this.structures.push(structure.id);
  }
  
  getInfo() {
    return {
      number: this.number,
      scale: this.scale,
      population: this.population,
      structures: this.structures.length,
      culturalLevel: this.culturalLevel,
      daysLived: this.daysLived,
      age: ((Date.now() - this.startTime) / 1000).toFixed(1) + 's'
    };
  }
}

/**
 * Generational Scale System
 */
export class GenerationalScaleSystem {
  constructor(config = {}) {
    this.generations = new Map(); // number -> Generation
    this.currentGeneration = 0;
    this.eventBus = config.eventBus || getGlobalEventBus();
    
    // Initialize generation 0
    this.createGeneration(0);
    
    // Listen for events
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    this.eventBus.on(MicroCityEvents.CITIZEN_SPAWNED, (data) => {
      const gen = this.getOrCreateGeneration(data.generation);
      gen.citizensSpawned++;
      gen.population++;
    });
    
    this.eventBus.on(MicroCityEvents.CITIZEN_DIED, (data) => {
      const gen = this.generations.get(data.generation);
      if (gen) {
        gen.citizensDied++;
        gen.population = Math.max(0, gen.population - 1);
      }
    });
    
    this.eventBus.on(MicroCityEvents.CONSTRUCTION_COMPLETED, (data) => {
      const gen = this.generations.get(data.generation);
      if (gen) {
        gen.addStructure(data.structure);
      }
    });
    
    this.eventBus.on(MicroCityEvents.CITIZEN_GATHERED_RESOURCE, (data) => {
      // Track resources collected per generation
      const citizen = data.citizenId; // Would need to look up generation
      // For now, just increment current gen
      const gen = this.generations.get(this.currentGeneration);
      if (gen) {
        gen.totalResources += data.amount;
      }
    });
  }
  
  /**
   * Create a new generation
   */
  createGeneration(number) {
    const gen = new Generation(number);
    this.generations.set(number, gen);
    this.currentGeneration = Math.max(this.currentGeneration, number);
    
    this.eventBus.emit(MicroCityEvents.GENERATION_ADVANCED, {
      generation: number,
      scale: gen.scale
    });
    
    return gen;
  }
  
  /**
   * Get or create generation
   */
  getOrCreateGeneration(number) {
    if (!this.generations.has(number)) {
      return this.createGeneration(number);
    }
    return this.generations.get(number);
  }
  
  /**
   * Update generation stats
   */
  update(citizenSystem) {
    for (const gen of this.generations.values()) {
      const stats = citizenSystem.getGenerationStats(gen.number);
      gen.update(stats);
      
      // Check for generation advancement
      if (this.shouldAdvanceGeneration(gen, stats)) {
        this.advanceGeneration(gen.number);
      }
    }
    
    // Emit stats update
    this.eventBus.emit(MicroCityEvents.GENERATION_STATS_UPDATE, {
      generations: this.getAllStats()
    });
  }
  
  /**
   * Check if generation should advance
   */
  shouldAdvanceGeneration(gen, stats) {
    return ScaleConstants.canAdvanceGeneration({
      elderCount: stats.elderCount || 0,
      structureCount: gen.structures.length,
      totalResources: gen.totalResources,
      daysLived: gen.daysLived
    });
  }
  
  /**
   * Trigger generation advancement
   */
  advanceGeneration(fromGen) {
    const nextGen = fromGen + 1;
    if (nextGen < ScaleConstants.MAX_GENERATIONS) {
      this.createGeneration(nextGen);
    }
  }
  
  /**
   * Get generation by number
   */
  getGeneration(number) {
    return this.generations.get(number);
  }
  
  /**
   * Get all generations
   */
  getAllGenerations() {
    return Array.from(this.generations.values());
  }
  
  /**
   * Get highest active generation
   */
  getHighestGeneration() {
    return this.currentGeneration;
  }
  
  /**
   * Get scale for generation
   */
  getScale(generation) {
    return ScaleConstants.calculateScale(generation);
  }
  
  /**
   * Get time dilation for generation
   */
  getTimeDilation(generation) {
    const scale = this.getScale(generation);
    return ScaleConstants.calculateTimeDilation(scale);
  }
  
  /**
   * Get all statistics
   */
  getAllStats() {
    return this.getAllGenerations().map(gen => gen.getInfo());
  }
  
  /**
   * Clear all generations
   */
  clear() {
    this.generations.clear();
    this.currentGeneration = 0;
    this.createGeneration(0);
  }
}

export default GenerationalScaleSystem;



