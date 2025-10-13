/**
 * Event Emitter
 * Simple event system for decoupled communication
 * 
 * Extracted pattern from merged2.html event handling
 */

export class EventEmitter {
  constructor() {
    this.events = new Map();
  }
  
  /**
   * Register event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }
  
  /**
   * Register one-time listener
   */
  once(event, callback) {
    const wrapper = (...args) => {
      callback(...args);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }
  
  /**
   * Remove event listener
   */
  off(event, callback) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.events.delete(event);
      }
    }
  }
  
  /**
   * Emit event
   */
  emit(event, ...args) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(cb => {
        try {
          cb(...args);
        } catch (e) {
          console.error(`Event handler error (${event}):`, e);
        }
      });
    }
  }
  
  /**
   * Remove all listeners for event (or all events if not specified)
   */
  clear(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
  
  /**
   * Get listener count for event
   */
  listenerCount(event) {
    return this.events.get(event)?.size || 0;
  }
}

export default EventEmitter;



