/**
 * THE.OS Lattice Grid Sequence - Component Scene
 * 
 * Wraps the standalone theosSequence.js for integration with the intro system
 * Allows the coordinate lattice build to be used as:
 * - Standalone via templates/componentized/theos-sequence.html
 * - Facet within the combined intro sequence
 */

import { initTheosSequence } from '../sequences/theosSequence.js';

export class TheosSequenceScene {
  constructor() {
    this.state = {
      running: false,
      sequenceInstance: null,
      container: null,
      startStage: 'intro' // 'intro' or 'blackhole'
    };
  }

  /**
   * Initialize the scene
   * @param {Object} options - Configuration options
   * @param {HTMLElement} options.container - Container element for the sequence
   * @param {string} options.startStage - Starting stage ('intro' or 'blackhole')
   */
  async init(options = {}) {
    console.log('[TheosSequence] Initializing component scene...');
    
    this.state.container = options.container || document.getElementById('sequence-root') || document.body;
    this.state.startStage = options.startStage || 'intro';
    
    // Initialize the sequence
    try {
      this.state.sequenceInstance = initTheosSequence({
        container: this.state.container,
        startStage: this.state.startStage
      });
      
      console.log('[TheosSequence] Sequence initialized successfully');
      return { success: true };
    } catch (error) {
      console.error('[TheosSequence] Initialization failed:', error);
      return { success: false, error };
    }
  }

  /**
   * Start the sequence animation
   */
  start() {
    if (!this.state.sequenceInstance) {
      console.warn('[TheosSequence] Cannot start - sequence not initialized');
      return;
    }
    
    console.log('[TheosSequence] Starting sequence...');
    this.state.running = true;
    
    // Start the sequence timeline
    if (this.state.sequenceInstance && this.state.sequenceInstance.start) {
      this.state.sequenceInstance.start();
    }
  }

  /**
   * Stop the sequence
   */
  stop() {
    console.log('[TheosSequence] Stopping sequence...');
    this.state.running = false;
    
    if (this.state.sequenceInstance && this.state.sequenceInstance.stop) {
      this.state.sequenceInstance.stop();
    }
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    console.log('[TheosSequence] Cleaning up...');
    
    this.stop();
    
    if (this.state.sequenceInstance && this.state.sequenceInstance.cleanup) {
      await this.state.sequenceInstance.cleanup();
    }
    
    this.state.sequenceInstance = null;
    this.state.container = null;
  }

  /**
   * Update method (called by animation loop if needed)
   */
  update(deltaTime) {
    if (!this.state.running || !this.state.sequenceInstance) {
      return;
    }
    
    // Delegate to sequence instance if it has an update method
    if (this.state.sequenceInstance.update) {
      this.state.sequenceInstance.update(deltaTime);
    }
  }

  /**
   * Handle window resize
   */
  onResize() {
    if (this.state.sequenceInstance && this.state.sequenceInstance.onResize) {
      this.state.sequenceInstance.onResize();
    }
  }

  /**
   * Get the current state of the sequence
   */
  getState() {
    return {
      running: this.state.running,
      startStage: this.state.startStage,
      hasInstance: !!this.state.sequenceInstance
    };
  }
}

