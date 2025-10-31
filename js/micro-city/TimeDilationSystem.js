// ==================== TIME DILATION SYSTEM ====================
// Manages scale-dependent time acceleration

import { ScaleConstants } from './ScaleConstants.js';
import { getGlobalEventBus, MicroCityEvents } from './EventBus.js';

/**
 * Time context for a specific generation/scale
 */
export class TimeContext {
  constructor(generation) {
    this.generation = generation;
    this.scale = ScaleConstants.calculateScale(generation);
    this.dilation = ScaleConstants.calculateTimeDilation(this.scale);
    this.dayLength = ScaleConstants.calculateDayLength(this.scale);
    
    this.realWorldTime = 0;          // Accumulated real seconds
    this.citizenLocalTime = 0;       // Accelerated time for this scale
    this.currentDay = 0;
    this.lastDayTrigger = 0;
  }
  
  /**
   * Update time for this context
   */
  update(realDelta) {
    this.realWorldTime += realDelta;
    this.citizenLocalTime += realDelta * this.dilation;
    
    // Check for day cycle
    const daysPassed = Math.floor(this.citizenLocalTime / this.dayLength);
    if (daysPassed > this.currentDay) {
      this.currentDay = daysPassed;
      this.lastDayTrigger = this.citizenLocalTime;
      return true; // Day cycle triggered
    }
    
    return false;
  }
  
  /**
   * Get time info
   */
  getInfo() {
    return {
      generation: this.generation,
      scale: this.scale,
      dilation: this.dilation.toFixed(2) + 'x',
      dayLength: this.dayLength.toFixed(2) + 's',
      currentDay: this.currentDay,
      realTime: this.realWorldTime.toFixed(1) + 's',
      localTime: this.citizenLocalTime.toFixed(1) + 's'
    };
  }
}

/**
 * Time Dilation System - Manages time for all active generations
 */
export class TimeDilationSystem {
  constructor(config = {}) {
    this.timeContexts = new Map(); // generation -> TimeContext
    this.globalRealTime = 0;
    this.globalDays = 0;
    
    this.eventBus = config.eventBus || getGlobalEventBus();
    this.paused = false;
    this.timeScale = 1.0; // Global time multiplier (for debugging)
    
    // Initialize generation 0
    this.createTimeContext(0);
  }
  
  /**
   * Create time context for a generation
   */
  createTimeContext(generation) {
    if (!this.timeContexts.has(generation)) {
      const context = new TimeContext(generation);
      this.timeContexts.set(generation, context);
      
      this.eventBus.emit(MicroCityEvents.TIME_DILATION_CHANGED, {
        generation: generation,
        dilation: context.dilation,
        dayLength: context.dayLength
      });
      
      return context;
    }
    return this.timeContexts.get(generation);
  }
  
  /**
   * Update time for all contexts
   */
  update(realDelta) {
    if (this.paused) return;
    
    const effectiveDelta = realDelta * this.timeScale;
    this.globalRealTime += effectiveDelta;
    
    // Update each generation's time
    for (const [generation, context] of this.timeContexts.entries()) {
      const dayTriggered = context.update(effectiveDelta);
      
      if (dayTriggered) {
        this.eventBus.emit(MicroCityEvents.DAY_CYCLE, {
          generation: generation,
          day: context.currentDay,
          scale: context.scale,
          dilation: context.dilation
        });
      }
    }
  }
  
  /**
   * Get time context for generation
   */
  getTimeContext(generation) {
    return this.timeContexts.get(generation) || this.createTimeContext(generation);
  }
  
  /**
   * Get citizen-local delta time for a generation
   */
  getCitizenDelta(realDelta, generation) {
    const context = this.getTimeContext(generation);
    return realDelta * context.dilation * this.timeScale;
  }
  
  /**
   * Get time dilation for generation
   */
  getTimeDilation(generation) {
    const context = this.timeContexts.get(generation);
    return context ? context.dilation : 1;
  }
  
  /**
   * Get day length for generation
   */
  getDayLength(generation) {
    const context = this.timeContexts.get(generation);
    return context ? context.dayLength : ScaleConstants.BASE_DAY_LENGTH;
  }
  
  /**
   * Get current day for generation
   */
  getCurrentDay(generation) {
    const context = this.timeContexts.get(generation);
    return context ? context.currentDay : 0;
  }
  
  /**
   * Pause time
   */
  pause() {
    this.paused = true;
    this.eventBus.emit(MicroCityEvents.SYSTEM_PAUSED, { system: 'TimeDilation' });
  }
  
  /**
   * Resume time
   */
  resume() {
    this.paused = false;
    this.eventBus.emit(MicroCityEvents.SYSTEM_RESUMED, { system: 'TimeDilation' });
  }
  
  /**
   * Set global time scale (for debugging/fast-forward)
   */
  setTimeScale(scale) {
    this.timeScale = Math.max(0, scale);
  }
  
  /**
   * Get global time scale
   */
  getTimeScale() {
    return this.timeScale;
  }
  
  /**
   * Reset all time contexts
   */
  reset() {
    this.timeContexts.clear();
    this.globalRealTime = 0;
    this.globalDays = 0;
    this.createTimeContext(0);
  }
  
  /**
   * Get all time statistics
   */
  getAllStats() {
    const contexts = Array.from(this.timeContexts.values()).map(c => c.getInfo());
    
    return {
      globalRealTime: this.globalRealTime.toFixed(1) + 's',
      paused: this.paused,
      timeScale: this.timeScale,
      activeGenerations: this.timeContexts.size,
      contexts: contexts
    };
  }
  
  /**
   * Get time info string for display
   */
  getTimeInfoString(generation) {
    const context = this.timeContexts.get(generation);
    if (!context) return `Gen ${generation}: No data`;
    
    return `Gen ${generation}: Day ${context.currentDay} (${context.dilation.toFixed(1)}x speed, ${context.dayLength.toFixed(1)}s/day)`;
  }
}

export default TimeDilationSystem;



