// ==================== EVENT BUS ====================
// Central event system for micro city inter-system communication

export class EventBus {
  constructor() {
    this.listeners = new Map(); // eventName -> Set of callbacks
    this.eventHistory = [];     // Recent events for debugging
    this.maxHistorySize = 100;
  }
  
  /**
   * Subscribe to an event
   * @param {string} eventName - Event to listen for
   * @param {function} callback - Handler function
   * @returns {function} Unsubscribe function
   */
  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(callback);
    
    // Return unsubscribe function
    return () => this.off(eventName, callback);
  }
  
  /**
   * Subscribe to an event once
   * @param {string} eventName - Event to listen for
   * @param {function} callback - Handler function
   */
  once(eventName, callback) {
    const wrapper = (data) => {
      callback(data);
      this.off(eventName, wrapper);
    };
    this.on(eventName, wrapper);
  }
  
  /**
   * Unsubscribe from an event
   * @param {string} eventName - Event name
   * @param {function} callback - Handler to remove
   */
  off(eventName, callback) {
    if (this.listeners.has(eventName)) {
      this.listeners.get(eventName).delete(callback);
    }
  }
  
  /**
   * Emit an event
   * @param {string} eventName - Event to emit
   * @param {*} data - Event data
   */
  emit(eventName, data) {
    // Record for history
    this.recordEvent(eventName, data);
    
    // Call all listeners
    if (this.listeners.has(eventName)) {
      for (const callback of this.listeners.get(eventName)) {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventName}:`, error);
        }
      }
    }
  }
  
  /**
   * Record event in history
   * @param {string} eventName - Event name
   * @param {*} data - Event data
   */
  recordEvent(eventName, data) {
    this.eventHistory.push({
      name: eventName,
      data: data,
      timestamp: Date.now()
    });
    
    // Keep history size limited
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }
  
  /**
   * Get recent event history
   * @param {number} count - Number of recent events
   * @returns {Array} Recent events
   */
  getHistory(count = 10) {
    return this.eventHistory.slice(-count);
  }
  
  /**
   * Clear all listeners
   */
  clear() {
    this.listeners.clear();
  }
  
  /**
   * Get listener count for an event
   * @param {string} eventName - Event name
   * @returns {number} Number of listeners
   */
  getListenerCount(eventName) {
    return this.listeners.has(eventName) ? this.listeners.get(eventName).size : 0;
  }
  
  /**
   * Get all event names with listeners
   * @returns {Array<string>} Event names
   */
  getEventNames() {
    return Array.from(this.listeners.keys());
  }
}

// ===== STANDARD EVENT DEFINITIONS =====
export const MicroCityEvents = {
  // Citizen Events
  CITIZEN_SPAWNED: 'citizen:spawned',
  CITIZEN_DIED: 'citizen:died',
  CITIZEN_REPRODUCED: 'citizen:reproduced',
  CITIZEN_SLEEP_START: 'citizen:sleep:start',
  CITIZEN_SLEEP_END: 'citizen:sleep:end',
  CITIZEN_GATHERED_RESOURCE: 'citizen:gathered',
  CITIZEN_STATE_CHANGE: 'citizen:state:change',
  
  // Generation Events
  GENERATION_ADVANCED: 'generation:advanced',
  GENERATION_STATS_UPDATE: 'generation:stats',
  
  // Construction Events
  CONSTRUCTION_STARTED: 'construction:started',
  CONSTRUCTION_PROGRESS: 'construction:progress',
  CONSTRUCTION_COMPLETED: 'construction:completed',
  CONSTRUCTION_DESTROYED: 'construction:destroyed',
  
  // Time Events
  DAY_CYCLE: 'time:day',
  TIME_DILATION_CHANGED: 'time:dilation:changed',
  
  // Population Events
  POPULATION_THRESHOLD: 'population:threshold',
  MIGRATION_STARTED: 'migration:started',
  MIGRATION_COMPLETED: 'migration:completed',
  
  // Resource Events
  RESOURCE_SPAWNED: 'resource:spawned',
  RESOURCE_DEPLETED: 'resource:depleted',
  RESOURCE_STORED: 'resource:stored',
  
  // System Events
  SYSTEM_INITIALIZED: 'system:initialized',
  SYSTEM_PAUSED: 'system:paused',
  SYSTEM_RESUMED: 'system:resumed',
  PERFORMANCE_WARNING: 'system:performance:warning'
};

// Freeze event definitions
Object.freeze(MicroCityEvents);

// Global event bus singleton
let globalEventBus = null;

/**
 * Get or create global event bus
 * @returns {EventBus} Global event bus instance
 */
export function getGlobalEventBus() {
  if (!globalEventBus) {
    globalEventBus = new EventBus();
  }
  return globalEventBus;
}

/**
 * Reset global event bus (useful for testing)
 */
export function resetGlobalEventBus() {
  if (globalEventBus) {
    globalEventBus.clear();
  }
  globalEventBus = new EventBus();
}

export default EventBus;



