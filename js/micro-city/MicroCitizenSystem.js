// ==================== MICRO CITIZEN SYSTEM ====================
// Manages individual citizen lifecycle, behavior, and AI

import { ScaleConstants } from './ScaleConstants.js';
import { getGlobalEventBus, MicroCityEvents } from './EventBus.js';

/**
 * Citizen state machine states
 */
export const CitizenState = {
  WANDERING: 'wandering',
  GATHERING: 'gathering',
  BUILDING: 'building',
  SLEEPING: 'sleeping',
  SOCIALIZING: 'socializing',
  REPRODUCING: 'reproducing'
};

/**
 * Individual micro citizen
 */
export class MicroCitizen {
  constructor(config) {
    this.id = config.id || `citizen_${Date.now()}_${Math.random()}`;
    this.generation = config.generation || 0;
    this.scale = config.scale || ScaleConstants.calculateScale(this.generation);
    
    // Physical properties
    // Default spawn in corner (-3, -3) instead of center (0, 0)
    const defaultCornerX = -3 + Math.random() * 0.3;
    const defaultCornerZ = -3 + Math.random() * 0.3;
    this.position = config.position || { x: defaultCornerX, y: 0, z: defaultCornerZ };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.size = ScaleConstants.calculateCitizenSize(this.generation);
    
    // Life cycle
    this.age = 0;                    // In citizen-local days
    this.sleepCycles = 0;            // Number of days lived
    this.lifespan = ScaleConstants.CITIZEN_LIFESPAN_BASE * (0.8 + Math.random() * 0.4); // Variation
    
    // State
    this.state = CitizenState.WANDERING;
    this.stateTimer = 0;
    this.sleepTimer = 0;
    this.lastSleepTime = 0;
    
    // Genetics (inherited traits)
    this.genes = config.genes || {
      buildSpeed: 0.8 + Math.random() * 0.4,      // 0.8-1.2x
      gatherEfficiency: 0.8 + Math.random() * 0.4,
      socialNeed: 0.5 + Math.random() * 0.5,      // How social they are
      wanderRadius: 0.1 + Math.random() * 0.2     // How far they wander
    };
    
    // Inventory & contributions
    this.inventory = {};
    for (const resource of ScaleConstants.RESOURCE_TYPES) {
      this.inventory[resource] = 0;
    }
    this.totalGathered = 0;
    this.totalContributed = 0;
    
    // Relationships
    this.family = config.family || [];           // Parent/child IDs
    this.partner = null;                         // Current partner ID
    this.lastReproduction = -999;                // Days since last reproduction
    this.communityId = config.communityId || null;
    
    // Tasks
    this.currentTask = null;
    this.taskTarget = null;
    this.wanderTarget = null;
    
    // Needs
    this.energy = 1.0;                           // 0-1, drops over time
    this.hunger = 0.0;                           // 0-1, increases over time
    this.socialFulfillment = 0.5;                // 0-1
    
    // Rendering
    this.mesh = null;                            // Three.js mesh reference
    this.visible = true;
  }
  
  /**
   * Update citizen (called each frame)
   * @param {number} deltaTime - Time elapsed in citizen-local time
   * @param {object} context - World context (other citizens, structures, resources)
   */
  update(deltaTime, context) {
    // Age the citizen
    this.age += deltaTime / ScaleConstants.BASE_DAY_LENGTH;
    
    // Check for death
    if (this.age >= this.lifespan) {
      this.die(context);
      return;
    }
    
    // Update needs
    this.updateNeeds(deltaTime);
    
    // State machine
    switch (this.state) {
      case CitizenState.WANDERING:
        this.updateWandering(deltaTime, context);
        break;
      case CitizenState.GATHERING:
        this.updateGathering(deltaTime, context);
        break;
      case CitizenState.BUILDING:
        this.updateBuilding(deltaTime, context);
        break;
      case CitizenState.SLEEPING:
        this.updateSleeping(deltaTime, context);
        break;
      case CitizenState.SOCIALIZING:
        this.updateSocializing(deltaTime, context);
        break;
      case CitizenState.REPRODUCING:
        this.updateReproducing(deltaTime, context);
        break;
    }
    
    // Update position
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.position.z += this.velocity.z * deltaTime;
    
    // Update state timer
    this.stateTimer += deltaTime;
  }
  
  /**
   * Update citizen needs
   */
  updateNeeds(deltaTime) {
    // Energy depletes over time
    this.energy -= deltaTime * 0.01;
    
    // Hunger increases
    this.hunger += deltaTime * 0.005;
    
    // Social need
    this.socialFulfillment -= deltaTime * 0.002;
    
    // Clamp values
    this.energy = Math.max(0, Math.min(1, this.energy));
    this.hunger = Math.max(0, Math.min(1, this.hunger));
    this.socialFulfillment = Math.max(0, Math.min(1, this.socialFulfillment));
  }
  
  /**
   * Wander behavior
   */
  updateWandering(deltaTime, context) {
    // Decide next action based on needs
    if (this.energy < 0.3) {
      this.enterSleepCycle(context);
      return;
    }
    
    if (this.hunger > 0.7 && this.hasResource('food') < 5) {
      this.transitionTo(CitizenState.GATHERING, context);
      return;
    }
    
    if (this.socialFulfillment < 0.3 && context.nearbyCitizens.length > 0) {
      this.transitionTo(CitizenState.SOCIALIZING, context);
      return;
    }
    
    // Check for construction opportunities
    if (context.activeConstructions && context.activeConstructions.length > 0) {
      if (Math.random() < 0.1) { // 10% chance to help build
        this.transitionTo(CitizenState.BUILDING, context);
        return;
      }
    }
    
    // Just wander
    if (!this.wanderTarget || this.stateTimer > 5) {
      this.pickWanderTarget();
      this.stateTimer = 0;
    }
    
    this.moveToward(this.wanderTarget, deltaTime, 0.02);
  }
  
  /**
   * Gathering behavior
   */
  updateGathering(deltaTime, context) {
    // Find nearest resource
    if (!this.taskTarget && context.resources) {
      const nearest = this.findNearestResource(context.resources);
      if (nearest) {
        this.taskTarget = nearest;
      } else {
        // No resources, go back to wandering
        this.transitionTo(CitizenState.WANDERING, context);
        return;
      }
    }
    
    if (this.taskTarget) {
      // Move toward resource
      const dist = this.distanceTo(this.taskTarget.position);
      if (dist < this.size * 2) {
        // Gather it
        this.gatherResource(this.taskTarget, context);
        this.taskTarget = null;
        
        // Satisfied? Go back to wandering
        if (this.inventory.food >= 5 || this.stateTimer > 30) {
          this.transitionTo(CitizenState.WANDERING, context);
        }
      } else {
        this.moveToward(this.taskTarget.position, deltaTime, 0.03);
      }
    }
  }
  
  /**
   * Building behavior
   */
  updateBuilding(deltaTime, context) {
    if (!this.taskTarget && context.activeConstructions) {
      // Pick a construction to help with
      this.taskTarget = context.activeConstructions[0]; // Simple: pick first
    }
    
    if (this.taskTarget) {
      // Move toward construction site
      const dist = this.distanceTo(this.taskTarget.position);
      if (dist < this.size * 5) {
        // Contribute resources/labor
        this.contributeToConstruction(this.taskTarget, deltaTime, context);
        
        // Work for a while
        if (this.stateTimer > 20 || this.energy < 0.4) {
          this.transitionTo(CitizenState.WANDERING, context);
        }
      } else {
        this.moveToward(this.taskTarget.position, deltaTime, 0.03);
      }
    } else {
      this.transitionTo(CitizenState.WANDERING, context);
    }
  }
  
  /**
   * Sleeping behavior
   */
  updateSleeping(deltaTime, context) {
    this.sleepTimer += deltaTime;
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.velocity.z = 0;
    
    // Restore energy
    this.energy += deltaTime * 0.05;
    this.energy = Math.min(1, this.energy);
    
    // Reduce hunger
    if (this.inventory.food > 0) {
      this.inventory.food -= deltaTime * 0.1;
      this.hunger -= deltaTime * 0.02;
      this.hunger = Math.max(0, this.hunger);
    }
    
    // Wake up when rested
    if (this.energy >= 0.9) {
      this.exitSleepCycle(context);
    }
  }
  
  /**
   * Socializing behavior
   */
  updateSocializing(deltaTime, context) {
    // Find nearest citizen
    if (context.nearbyCitizens && context.nearbyCitizens.length > 0) {
      const other = context.nearbyCitizens[0];
      const dist = this.distanceTo(other.position);
      
      if (dist < this.size * 3) {
        // Close enough, socialize
        this.socialFulfillment += deltaTime * 0.05;
        this.velocity.x *= 0.9; // Slow down
        this.velocity.z *= 0.9;
        
        // Check for reproduction opportunity
        if (this.canReproduce() && other.canReproduce() && !other.partner && !this.partner) {
          const prob = ScaleConstants.calculateReproductionProbability(
            this.age / this.lifespan,
            other.age / other.lifespan,
            this.age - this.lastReproduction
          );
          
          if (Math.random() < prob * deltaTime) {
            this.partner = other.id;
            other.partner = this.id;
            this.transitionTo(CitizenState.REPRODUCING, context);
            other.transitionTo(CitizenState.REPRODUCING, context);
          }
        }
      } else {
        // Move closer
        this.moveToward(other.position, deltaTime, 0.02);
      }
      
      // Satisfied? Go back
      if (this.socialFulfillment > 0.7 || this.stateTimer > 15) {
        this.transitionTo(CitizenState.WANDERING, context);
      }
    } else {
      this.transitionTo(CitizenState.WANDERING, context);
    }
  }
  
  /**
   * Reproduction behavior
   */
  updateReproducing(deltaTime, context) {
    // Takes time
    if (this.stateTimer > 5) {
      this.reproduce(context);
      this.transitionTo(CitizenState.WANDERING, context);
    }
  }
  
  /**
   * Enter sleep cycle (triggers day count)
   */
  enterSleepCycle(context) {
    this.state = CitizenState.SLEEPING;
    this.stateTimer = 0;
    this.sleepTimer = 0;
    this.sleepCycles++;
    this.lastSleepTime = this.age;
    
    getGlobalEventBus().emit(MicroCityEvents.CITIZEN_SLEEP_START, {
      citizenId: this.id,
      generation: this.generation,
      sleepCycle: this.sleepCycles
    });
  }
  
  /**
   * Exit sleep cycle
   */
  exitSleepCycle(context) {
    this.state = CitizenState.WANDERING;
    this.stateTimer = 0;
    
    getGlobalEventBus().emit(MicroCityEvents.CITIZEN_SLEEP_END, {
      citizenId: this.id,
      generation: this.generation,
      sleepCycle: this.sleepCycles
    });
  }
  
  /**
   * Reproduce (create next generation citizen)
   */
  reproduce(context) {
    if (!this.canReproduce()) return null;
    
    this.lastReproduction = this.age;
    
    // Create offspring
    const offspring = context.spawnCitizen({
      generation: this.generation + 1,
      position: {
        x: this.position.x + (Math.random() - 0.5) * this.size * 2,
        y: this.position.y,
        z: this.position.z + (Math.random() - 0.5) * this.size * 2
      },
      genes: this.inheritGenes(),
      family: [this.id, this.partner],
      communityId: this.communityId
    });
    
    // Clear partner
    if (this.partner && context.citizenById) {
      const partner = context.citizenById(this.partner);
      if (partner) {
        partner.partner = null;
        partner.lastReproduction = partner.age;
      }
    }
    this.partner = null;
    
    getGlobalEventBus().emit(MicroCityEvents.CITIZEN_REPRODUCED, {
      parentId: this.id,
      partnerId: this.partner,
      offspringId: offspring.id,
      generation: offspring.generation
    });
    
    return offspring;
  }
  
  /**
   * Check if citizen can reproduce
   */
  canReproduce() {
    const ageRatio = this.age / this.lifespan;
    return (
      ageRatio >= ScaleConstants.REPRODUCTION_AGE_THRESHOLD &&
      ageRatio <= 0.8 &&
      (this.age - this.lastReproduction) >= ScaleConstants.REPRODUCTION_COOLDOWN
    );
  }
  
  /**
   * Inherit genes from parent (with mutation)
   */
  inheritGenes() {
    const mutationRate = 0.1;
    const genes = {};
    
    for (const [key, value] of Object.entries(this.genes)) {
      if (Math.random() < mutationRate) {
        genes[key] = value * (0.9 + Math.random() * 0.2); // ±10% mutation
      } else {
        genes[key] = value;
      }
    }
    
    return genes;
  }
  
  /**
   * Gather resource
   */
  gatherResource(resource, context) {
    const efficiency = this.genes.gatherEfficiency * ScaleConstants.calculateGatheringEfficiency(this.scale);
    const amount = Math.floor(1 + Math.random() * 3 * efficiency);
    
    this.inventory[resource.type] = (this.inventory[resource.type] || 0) + amount;
    this.totalGathered += amount;
    
    getGlobalEventBus().emit(MicroCityEvents.CITIZEN_GATHERED_RESOURCE, {
      citizenId: this.id,
      resourceType: resource.type,
      amount: amount
    });
    
    // Remove resource from world
    if (context.removeResource) {
      context.removeResource(resource.id);
    }
  }
  
  /**
   * Contribute to construction
   */
  contributeToConstruction(construction, deltaTime, context) {
    const contribution = deltaTime * this.genes.buildSpeed * 0.5;
    
    // Transfer resources from inventory
    for (const [resource, needed] of Object.entries(construction.resourcesNeeded)) {
      if (this.inventory[resource] > 0 && needed > 0) {
        const transfer = Math.min(this.inventory[resource], needed);
        this.inventory[resource] -= transfer;
        construction.resourcesNeeded[resource] -= transfer;
        this.totalContributed += transfer;
      }
    }
    
    // Add labor progress
    construction.progress += contribution;
    
    if (context.updateConstruction) {
      context.updateConstruction(construction);
    }
  }
  
  /**
   * Die
   */
  die(context) {
    getGlobalEventBus().emit(MicroCityEvents.CITIZEN_DIED, {
      citizenId: this.id,
      generation: this.generation,
      age: this.age,
      lifespan: this.lifespan,
      totalGathered: this.totalGathered,
      totalContributed: this.totalContributed
    });
    
    if (context.removeCitizen) {
      context.removeCitizen(this.id);
    }
  }
  
  /**
   * Transition to new state
   */
  transitionTo(newState, context) {
    const oldState = this.state;
    this.state = newState;
    this.stateTimer = 0;
    this.taskTarget = null;
    
    getGlobalEventBus().emit(MicroCityEvents.CITIZEN_STATE_CHANGE, {
      citizenId: this.id,
      oldState: oldState,
      newState: newState
    });
  }
  
  /**
   * Pick random wander target
   */
  pickWanderTarget() {
    const radius = this.genes.wanderRadius * this.scale * 10;
    this.wanderTarget = {
      x: this.position.x + (Math.random() - 0.5) * radius,
      y: this.position.y,
      z: this.position.z + (Math.random() - 0.5) * radius
    };
  }
  
  /**
   * Move toward a target position
   */
  moveToward(target, deltaTime, speed) {
    const dx = target.x - this.position.x;
    const dz = target.z - this.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    
    if (dist > 0.001) {
      const effectiveSpeed = speed * this.scale;
      this.velocity.x = (dx / dist) * effectiveSpeed;
      this.velocity.z = (dz / dist) * effectiveSpeed;
    }
  }
  
  /**
   * Calculate distance to target
   */
  distanceTo(target) {
    const dx = target.x - this.position.x;
    const dz = target.z - this.position.z;
    return Math.sqrt(dx * dx + dz * dz);
  }
  
  /**
   * Find nearest resource
   */
  findNearestResource(resources) {
    let nearest = null;
    let minDist = Infinity;
    
    for (const resource of resources) {
      const dist = this.distanceTo(resource.position);
      if (dist < minDist) {
        minDist = dist;
        nearest = resource;
      }
    }
    
    return nearest;
  }
  
  /**
   * Get resource amount from inventory
   */
  hasResource(type) {
    return this.inventory[type] || 0;
  }
  
  /**
   * Get citizen info for debugging
   */
  getInfo() {
    return {
      id: this.id,
      generation: this.generation,
      scale: this.scale,
      age: this.age.toFixed(1),
      lifespan: this.lifespan.toFixed(1),
      state: this.state,
      energy: this.energy.toFixed(2),
      hunger: this.hunger.toFixed(2),
      sleepCycles: this.sleepCycles,
      totalGathered: this.totalGathered,
      totalContributed: this.totalContributed
    };
  }
}

/**
 * Micro Citizen System - Manages all citizens
 */
export class MicroCitizenSystem {
  constructor(config = {}) {
    this.citizens = new Map(); // id -> MicroCitizen
    this.citizensByGeneration = new Map(); // generation -> Set of citizen ids
    this.eventBus = config.eventBus || getGlobalEventBus();
    
    this.totalCitizensSpawned = 0;
    this.totalCitizensDied = 0;
  }
  
  /**
   * Spawn a new citizen
   */
  spawnCitizen(config) {
    const citizen = new MicroCitizen({
      ...config,
      id: config.id || `citizen_${this.totalCitizensSpawned++}`
    });
    
    this.citizens.set(citizen.id, citizen);
    
    // Track by generation
    if (!this.citizensByGeneration.has(citizen.generation)) {
      this.citizensByGeneration.set(citizen.generation, new Set());
    }
    this.citizensByGeneration.get(citizen.generation).add(citizen.id);
    
    this.eventBus.emit(MicroCityEvents.CITIZEN_SPAWNED, {
      citizenId: citizen.id,
      generation: citizen.generation,
      position: citizen.position
    });
    
    return citizen;
  }
  
  /**
   * Update all citizens
   */
  update(realDelta, context) {
    for (const citizen of this.citizens.values()) {
      // Convert real time to citizen-local time
      const citizenDelta = ScaleConstants.realTimeToCitizenTime(realDelta, citizen.scale);
      
      // Get nearby citizens for context
      context.nearbyCitizens = this.getCitizensNear(citizen.position, citizen.scale * 20);
      
      citizen.update(citizenDelta, context);
    }
  }
  
  /**
   * Remove citizen
   */
  removeCitizen(citizenId) {
    const citizen = this.citizens.get(citizenId);
    if (citizen) {
      // Remove from generation tracking
      if (this.citizensByGeneration.has(citizen.generation)) {
        this.citizensByGeneration.get(citizen.generation).delete(citizenId);
      }
      
      this.citizens.delete(citizenId);
      this.totalCitizensDied++;
    }
  }
  
  /**
   * Get citizen by ID
   */
  getCitizen(citizenId) {
    return this.citizens.get(citizenId);
  }
  
  /**
   * Get citizens near a position
   */
  getCitizensNear(position, radius) {
    const nearby = [];
    for (const citizen of this.citizens.values()) {
      const dx = citizen.position.x - position.x;
      const dz = citizen.position.z - position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < radius) {
        nearby.push(citizen);
      }
    }
    return nearby;
  }
  
  /**
   * Get citizens by generation
   */
  getCitizensByGeneration(generation) {
    const ids = this.citizensByGeneration.get(generation);
    if (!ids) return [];
    return Array.from(ids).map(id => this.citizens.get(id)).filter(c => c);
  }
  
  /**
   * Get total population
   */
  getPopulation() {
    return this.citizens.size;
  }
  
  /**
   * Get generation statistics
   */
  getGenerationStats(generation) {
    const citizens = this.getCitizensByGeneration(generation);
    
    return {
      generation: generation,
      population: citizens.length,
      avgAge: citizens.reduce((sum, c) => sum + c.age, 0) / citizens.length || 0,
      elderCount: citizens.filter(c => c.age / c.lifespan > 0.7).length,
      totalGathered: citizens.reduce((sum, c) => sum + c.totalGathered, 0),
      totalContributed: citizens.reduce((sum, c) => sum + c.totalContributed, 0)
    };
  }
  
  /**
   * Get all statistics
   */
  getAllStats() {
    const generations = Array.from(this.citizensByGeneration.keys());
    return {
      totalPopulation: this.getPopulation(),
      totalSpawned: this.totalCitizensSpawned,
      totalDied: this.totalCitizensDied,
      generationCount: generations.length,
      generationStats: generations.map(gen => this.getGenerationStats(gen))
    };
  }
  
  /**
   * Clear all citizens
   */
  clear() {
    this.citizens.clear();
    this.citizensByGeneration.clear();
  }
}

export default MicroCitizenSystem;

