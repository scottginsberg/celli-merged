// ==================== MICRO CITY CORE ====================
// Main coordinator for all micro city systems

import { MicroCitizenSystem } from './MicroCitizenSystem.js';
import { GenerationalScaleSystem } from './GenerationalScaleSystem.js';
import { ConstructionProgressionSystem } from './ConstructionProgressionSystem.js';
import { TimeDilationSystem } from './TimeDilationSystem.js';
import { getGlobalEventBus, MicroCityEvents } from './EventBus.js';
import { ScaleConstants } from './ScaleConstants.js';

/**
 * Resource spawner/manager
 */
class ResourceManager {
  constructor() {
    this.resources = new Map(); // id -> resource
    this.nextId = 0;
  }
  
  spawnResource(position, type) {
    const resource = {
      id: `resource_${this.nextId++}`,
      type: type || ScaleConstants.getRandomResourceType(),
      position: position || { x: 0, y: 0, z: 0 },
      amount: 1
    };
    
    this.resources.set(resource.id, resource);
    return resource;
  }
  
  removeResource(id) {
    this.resources.delete(id);
  }
  
  getResources() {
    return Array.from(this.resources.values());
  }
  
  getResourcesNear(position, radius) {
    const nearby = [];
    for (const resource of this.resources.values()) {
      const dx = resource.position.x - position.x;
      const dz = resource.position.z - position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < radius) {
        nearby.push(resource);
      }
    }
    return nearby;
  }
  
  clear() {
    this.resources.clear();
  }
}

/**
 * Micro City Core - Main System Coordinator
 */
export class MicroCityCore {
  constructor(config = {}) {
    this.config = {
      initialCitizens: config.initialCitizens || 5,
      startScale: config.startScale || 0.01,
      startGeneration: config.startGeneration || 0,
      autoResourceSpawn: config.autoResourceSpawn !== false,
      resourceSpawnRate: config.resourceSpawnRate || 0.1,
      ...config
    };
    
    // Event bus
    this.eventBus = getGlobalEventBus();
    
    // Initialize all systems
    this.citizenSystem = new MicroCitizenSystem({ eventBus: this.eventBus });
    this.generationSystem = new GenerationalScaleSystem({ eventBus: this.eventBus });
    this.constructionSystem = new ConstructionProgressionSystem({ eventBus: this.eventBus });
    this.timeSystem = new TimeDilationSystem({ eventBus: this.eventBus });
    this.resourceManager = new ResourceManager();
    
    // State
    this.running = false;
    this.initialized = false;
    
    // Performance tracking
    this.updateCount = 0;
    this.lastPerformanceCheck = Date.now();
    this.averageFPS = 60;
    
    // Setup event listeners
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Listen for reproduction to auto-spawn children
    this.eventBus.on(MicroCityEvents.CITIZEN_REPRODUCED, (data) => {
      // Offspring already spawned in MicroCitizen.reproduce()
    });
    
    // Listen for construction completion
    this.eventBus.on(MicroCityEvents.CONSTRUCTION_COMPLETED, (data) => {
      console.log(`✓ ${data.type} completed (Gen ${data.generation})`);
    });
    
    // Listen for generation advancement
    this.eventBus.on(MicroCityEvents.GENERATION_ADVANCED, (data) => {
      console.log(`→ Generation ${data.generation} emerged! (Scale: ${data.scale.toFixed(4)})`);
    });
  }
  
  /**
   * Initialize the system
   */
  initialize() {
    if (this.initialized) return;
    
    console.log('🏙️  Initializing Micro City System...');
    
    // Spawn initial citizens in corner of room (back-right corner)
    const cornerX = -3; // Corner X position (adjust based on room size)
    const cornerZ = -3; // Corner Z position (adjust based on room size)
    
    for (let i = 0; i < this.config.initialCitizens; i++) {
      this.spawnCitizen({
        generation: this.config.startGeneration,
        scale: this.config.startScale, // Ensure ant-sized (0.01)
        position: {
          x: cornerX + Math.random() * 0.3, // Small cluster in corner
          y: 0,
          z: cornerZ + Math.random() * 0.3
        }
      });
    }
    
    // Spawn initial resources near the corner camp
    for (let i = 0; i < 20; i++) {
      this.resourceManager.spawnResource({
        x: cornerX + (Math.random() - 0.5) * 1.5, // Resources around camp
        y: 0,
        z: cornerZ + (Math.random() - 0.5) * 1.5
      });
    }
    
    this.initialized = true;
    this.eventBus.emit(MicroCityEvents.SYSTEM_INITIALIZED, { system: 'MicroCityCore' });
    
    console.log(`✓ Spawned ${this.config.initialCitizens} initial ant-sized citizens in corner`);
  }
  
  /**
   * Start the simulation
   */
  start() {
    if (!this.initialized) {
      this.initialize();
    }
    
    this.running = true;
    this.eventBus.emit(MicroCityEvents.SYSTEM_RESUMED, { system: 'MicroCityCore' });
    console.log('▶️  Micro City simulation started');
  }
  
  /**
   * Pause the simulation
   */
  pause() {
    this.running = false;
    this.timeSystem.pause();
    this.eventBus.emit(MicroCityEvents.SYSTEM_PAUSED, { system: 'MicroCityCore' });
    console.log('⏸️  Micro City simulation paused');
  }
  
  /**
   * Resume the simulation
   */
  resume() {
    this.running = true;
    this.timeSystem.resume();
    this.eventBus.emit(MicroCityEvents.SYSTEM_RESUMED, { system: 'MicroCityCore' });
  }
  
  /**
   * Main update loop (call each frame)
   */
  update(realDelta) {
    if (!this.running) return;
    
    this.updateCount++;
    
    // Update time system
    this.timeSystem.update(realDelta);
    
    // Update citizens
    const context = {
      resources: this.resourceManager.getResources(),
      activeConstructions: this.constructionSystem.getActiveConstructions(),
      spawnCitizen: (config) => this.spawnCitizen(config),
      removeCitizen: (id) => this.citizenSystem.removeCitizen(id),
      removeResource: (id) => this.resourceManager.removeResource(id),
      updateConstruction: (structure) => this.constructionSystem.updateConstruction(structure),
      citizenById: (id) => this.citizenSystem.getCitizen(id)
    };
    
    this.citizenSystem.update(realDelta, context);
    
    // Update generation system
    this.generationSystem.update(this.citizenSystem);
    
    // Auto-plan constructions
    this.autoplanConstructions();
    
    // Spawn resources
    if (this.config.autoResourceSpawn && Math.random() < this.config.resourceSpawnRate * realDelta) {
      this.resourceManager.spawnResource({
        x: (Math.random() - 0.5) * 5,
        y: 0,
        z: (Math.random() - 0.5) * 5
      });
    }
    
    // Check performance
    this.checkPerformance();
  }
  
  /**
   * Auto-plan constructions for active generations
   */
  autoplanConstructions() {
    for (const generation of this.generationSystem.getAllGenerations()) {
      const citizens = this.citizenSystem.getCitizensByGeneration(generation.number);
      const population = citizens.length;
      
      // Calculate total resources
      const totalResources = {};
      for (const citizen of citizens) {
        for (const [type, amount] of Object.entries(citizen.inventory)) {
          totalResources[type] = (totalResources[type] || 0) + amount;
        }
      }
      
      // Attempt to plan construction
      this.constructionSystem.autoplanConstruction(
        generation.number,
        population,
        totalResources
      );
    }
  }
  
  /**
   * Spawn a new citizen
   */
  spawnCitizen(config) {
    return this.citizenSystem.spawnCitizen(config);
  }
  
  /**
   * Get citizen by ID
   */
  getCitizen(id) {
    return this.citizenSystem.getCitizen(id);
  }
  
  /**
   * Get all citizens
   */
  getCitizens() {
    return Array.from(this.citizenSystem.citizens.values());
  }
  
  /**
   * Get citizens by generation
   */
  getCitizensByGeneration(generation) {
    return this.citizenSystem.getCitizensByGeneration(generation);
  }
  
  /**
   * Get all structures
   */
  getStructures() {
    return Array.from(this.constructionSystem.structures.values());
  }
  
  /**
   * Get structures by generation
   */
  getStructuresByGeneration(generation) {
    return this.constructionSystem.getStructuresByGeneration(generation);
  }
  
  /**
   * Get all resources
   */
  getResources() {
    return this.resourceManager.getResources();
  }
  
  /**
   * Get time info for generation
   */
  getTimeInfo(generation) {
    return this.timeSystem.getTimeInfoString(generation);
  }
  
  /**
   * Check performance and emit warning if needed
   */
  checkPerformance() {
    const now = Date.now();
    const elapsed = (now - this.lastPerformanceCheck) / 1000;
    
    if (elapsed > 1) { // Check every second
      this.averageFPS = this.updateCount / elapsed;
      this.updateCount = 0;
      this.lastPerformanceCheck = now;
      
      if (this.averageFPS < 30) {
        this.eventBus.emit(MicroCityEvents.PERFORMANCE_WARNING, {
          fps: this.averageFPS,
          population: this.citizenSystem.getPopulation(),
          structures: this.constructionSystem.structures.size
        });
      }
    }
  }
  
  /**
   * Get comprehensive statistics
   */
  getStats() {
    return {
      running: this.running,
      fps: this.averageFPS.toFixed(1),
      citizens: this.citizenSystem.getAllStats(),
      generations: this.generationSystem.getAllStats(),
      structures: this.constructionSystem.getAllStats(),
      time: this.timeSystem.getAllStats(),
      resources: {
        total: this.resourceManager.resources.size
      }
    };
  }
  
  /**
   * Get stats summary string
   */
  getStatsSummary() {
    const stats = this.getStats();
    return `Pop: ${stats.citizens.totalPopulation} | Gens: ${stats.generations.length} | Structures: ${stats.structures.totalCompleted} | FPS: ${stats.fps}`;
  }
  
  /**
   * Reset entire system
   */
  reset() {
    this.pause();
    
    this.citizenSystem.clear();
    this.generationSystem.clear();
    this.constructionSystem.clear();
    this.timeSystem.reset();
    this.resourceManager.clear();
    
    this.initialized = false;
    this.updateCount = 0;
    
    console.log('🔄 Micro City system reset');
  }
  
  /**
   * Subscribe to event
   */
  on(eventName, callback) {
    return this.eventBus.on(eventName, callback);
  }
  
  /**
   * Emit event
   */
  emit(eventName, data) {
    this.eventBus.emit(eventName, data);
  }
}

export default MicroCityCore;

