// ==================== SCALE CONSTANTS ====================
// All mathematical formulas and constants for the Micro City system

export const ScaleConstants = {
  // ===== GENERATIONAL SCALING =====
  SCALE_REDUCTION_RATE: 0.75,          // Each generation is 75% of parent size
  MIN_SCALE: 0.0001,                    // Smallest possible (1/10000th of original)
  MAX_GENERATIONS: 20,                  // Practical limit
  
  // ===== TIME DILATION =====
  TIME_ACCELERATION_BASE: 1.5,          // Base for exponential time scaling
  BASE_DAY_LENGTH: 60,                  // Seconds for gen-0 day (real time)
  MIN_DAY_LENGTH: 0.1,                  // Fastest possible day cycle
  
  // ===== CITIZEN PARAMETERS =====
  INITIAL_CITIZEN_SIZE: 0.01,           // Starting size (meters) - ant-sized
  CITIZEN_LIFESPAN_BASE: 100,           // Base lifespan in citizen-days
  REPRODUCTION_AGE_THRESHOLD: 0.2,      // Can reproduce at 20% of lifespan
  REPRODUCTION_COOLDOWN: 10,            // Days between reproductions
  REPRODUCTION_PROBABILITY: 0.3,        // 30% chance per eligible pair per day
  
  // ===== POPULATION DYNAMICS =====
  MAX_CITIZENS_PER_GENERATION: 500,     // Performance cap
  MIGRATION_PROBABILITY: 0.05,          // 5% chance to migrate to new area
  SOCIAL_DISTANCE: 0.02,                // How close citizens cluster (meters at scale 1)
  
  // ===== CONSTRUCTION TIERS =====
  BUILDING_TIERS: [
    {
      tier: 0,
      type: 'tent',
      scale: 1.0,
      minPopulation: 1,
      capacity: 2,
      buildTime: 10,       // Citizen-days
      resources: { wood: 5, fiber: 10 }
    },
    {
      tier: 1,
      type: 'hut',
      scale: 0.75,
      minPopulation: 3,
      capacity: 5,
      buildTime: 50,
      resources: { wood: 50, stone: 20, fiber: 30 }
    },
    {
      tier: 2,
      type: 'house',
      scale: 0.56,
      minPopulation: 8,
      capacity: 10,
      buildTime: 150,
      resources: { wood: 200, stone: 100, clay: 50 }
    },
    {
      tier: 3,
      type: 'village',
      scale: 0.42,
      minPopulation: 25,
      capacity: 50,
      buildTime: 500,
      resources: { wood: 1000, stone: 500, metal: 100 }
    },
    {
      tier: 4,
      type: 'town',
      scale: 0.32,
      minPopulation: 100,
      capacity: 200,
      buildTime: 2000,
      resources: { wood: 5000, stone: 3000, metal: 500 }
    },
    {
      tier: 5,
      type: 'city',
      scale: 0.24,
      minPopulation: 500,
      capacity: 1000,
      buildTime: 10000,
      resources: { stone: 20000, metal: 5000, gems: 100 }
    },
    {
      tier: 6,
      type: 'megacity',
      scale: 0.18,
      minPopulation: 2500,
      capacity: 5000,
      buildTime: 50000,
      resources: { metal: 50000, gems: 5000, tech: 1000 }
    }
  ],
  
  // ===== RESOURCE TYPES =====
  RESOURCE_TYPES: ['wood', 'stone', 'fiber', 'clay', 'metal', 'gems', 'tech', 'food'],
  RESOURCE_SPAWN_RATES: {
    wood: 0.1,      // Per second per unit area
    stone: 0.05,
    fiber: 0.15,
    clay: 0.03,
    metal: 0.01,
    gems: 0.001,
    tech: 0,        // Only produced by advanced citizens
    food: 0.2
  },
  
  // ===== RENDERING & PERFORMANCE =====
  LOD_DISTANCES: {
    FULL: 0,        // Full detail
    MEDIUM: 100,    // Reduced detail
    LOW: 500,       // Simple geometry
    DOT: 2000,      // Billboard/point
    CULL: 5000      // Don't render
  },
  
  INSTANCE_BATCH_SIZE: 100,             // Citizens per instanced mesh
  UPDATE_RADIUS: 200,                   // Only update citizens within this radius
  
  // ===== GENERATION ADVANCEMENT =====
  ADVANCEMENT_CRITERIA: {
    minElders: 50,                      // Minimum citizens at elder age
    minStructures: 5,                   // Minimum completed buildings
    minResourceAbundance: 1000,         // Total resources collected
    minDaysLived: 500                   // Minimum generation lifespan
  },
  
  /**
   * Calculate the scale for a given generation
   * @param {number} generation - Generation number (0, 1, 2, ...)
   * @returns {number} Scale multiplier (1.0 to MIN_SCALE)
   */
  calculateScale(generation) {
    return Math.max(
      Math.pow(this.SCALE_REDUCTION_RATE, generation),
      this.MIN_SCALE
    );
  },
  
  /**
   * Calculate time dilation factor for a given scale
   * Smaller citizens experience time faster
   * @param {number} scale - Scale multiplier
   * @returns {number} Time acceleration factor
   */
  calculateTimeDilation(scale) {
    if (scale <= 0) return 1;
    // Formula: (1/scale)^log2(BASE)
    // scale 1.0 → 1x speed
    // scale 0.5 → 2.25x speed
    // scale 0.1 → 15.85x speed
    return Math.pow(1 / scale, Math.log2(this.TIME_ACCELERATION_BASE));
  },
  
  /**
   * Calculate day length in real seconds for a given scale
   * @param {number} scale - Scale multiplier
   * @returns {number} Day length in real-world seconds
   */
  calculateDayLength(scale) {
    const dilation = this.calculateTimeDilation(scale);
    return Math.max(
      this.BASE_DAY_LENGTH / dilation,
      this.MIN_DAY_LENGTH
    );
  },
  
  /**
   * Convert real time to citizen-local time
   * @param {number} realDelta - Real elapsed time (seconds)
   * @param {number} scale - Citizen scale
   * @returns {number} Citizen-local time elapsed
   */
  realTimeToCitizenTime(realDelta, scale) {
    return realDelta * this.calculateTimeDilation(scale);
  },
  
  /**
   * Get building tier for a generation
   * @param {number} generation - Generation number
   * @returns {object} Building tier config
   */
  getBuildingTierForGeneration(generation) {
    const tier = Math.min(generation, this.BUILDING_TIERS.length - 1);
    return this.BUILDING_TIERS[tier];
  },
  
  /**
   * Calculate citizen size in meters for a generation
   * @param {number} generation - Generation number
   * @returns {number} Size in meters
   */
  calculateCitizenSize(generation) {
    return this.INITIAL_CITIZEN_SIZE * this.calculateScale(generation);
  },
  
  /**
   * Calculate resource gathering efficiency for a scale
   * Smaller citizens gather proportionally less but time moves faster
   * @param {number} scale - Scale multiplier
   * @returns {number} Gathering efficiency multiplier
   */
  calculateGatheringEfficiency(scale) {
    // Smaller = less per action, but more actions per real time
    return scale * 0.5; // 50% efficiency penalty for size
  },
  
  /**
   * Get LOD level for a citizen based on distance
   * @param {number} distance - Distance to camera
   * @returns {string} LOD level name
   */
  getLODLevel(distance) {
    if (distance < this.LOD_DISTANCES.FULL) return 'FULL';
    if (distance < this.LOD_DISTANCES.MEDIUM) return 'MEDIUM';
    if (distance < this.LOD_DISTANCES.LOW) return 'LOW';
    if (distance < this.LOD_DISTANCES.DOT) return 'DOT';
    return 'CULL';
  },
  
  /**
   * Check if generation can advance
   * @param {object} stats - Generation statistics
   * @returns {boolean} Can advance
   */
  canAdvanceGeneration(stats) {
    return (
      stats.elderCount >= this.ADVANCEMENT_CRITERIA.minElders &&
      stats.structureCount >= this.ADVANCEMENT_CRITERIA.minStructures &&
      stats.totalResources >= this.ADVANCEMENT_CRITERIA.minResourceAbundance &&
      stats.daysLived >= this.ADVANCEMENT_CRITERIA.minDaysLived
    );
  },
  
  /**
   * Calculate reproduction probability for a pair
   * @param {number} age1 - First citizen age (as fraction of lifespan)
   * @param {number} age2 - Second citizen age
   * @param {number} lastReproduction - Days since last reproduction
   * @returns {number} Probability (0-1)
   */
  calculateReproductionProbability(age1, age2, lastReproduction) {
    if (age1 < this.REPRODUCTION_AGE_THRESHOLD) return 0;
    if (age2 < this.REPRODUCTION_AGE_THRESHOLD) return 0;
    if (lastReproduction < this.REPRODUCTION_COOLDOWN) return 0;
    
    // Peak fertility at 40-60% of lifespan
    const avgAge = (age1 + age2) / 2;
    const fertilityPeak = 0.5;
    const fertilityWidth = 0.3;
    const fertilityMult = Math.exp(-Math.pow((avgAge - fertilityPeak) / fertilityWidth, 2));
    
    return this.REPRODUCTION_PROBABILITY * fertilityMult;
  },
  
  /**
   * Get random resource type based on spawn rates
   * @returns {string} Resource type
   */
  getRandomResourceType() {
    const rand = Math.random();
    let cumulative = 0;
    const totalRate = Object.values(this.RESOURCE_SPAWN_RATES).reduce((a, b) => a + b, 0);
    
    for (const [type, rate] of Object.entries(this.RESOURCE_SPAWN_RATES)) {
      cumulative += rate / totalRate;
      if (rand < cumulative) return type;
    }
    
    return 'food'; // Default
  }
};

// Freeze to prevent accidental modification
Object.freeze(ScaleConstants);
Object.freeze(ScaleConstants.BUILDING_TIERS);
Object.freeze(ScaleConstants.RESOURCE_SPAWN_RATES);
Object.freeze(ScaleConstants.LOD_DISTANCES);
Object.freeze(ScaleConstants.ADVANCEMENT_CRITERIA);

export default ScaleConstants;



