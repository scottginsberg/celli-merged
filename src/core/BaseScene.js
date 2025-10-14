/**
 * BaseScene - Standard Interface for Sequence Builder Compatibility
 * All scenes should extend or implement this structure for auto-ingest support
 */

export class BaseScene {
  constructor() {
    // Three.js components
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    
    // Scene state
    this.state = {
      running: false,
      totalTime: 0
    };
    
    // Sequence Builder Compatible Properties
    this.sequenceMetadata = {
      name: 'Base Scene',
      version: '1.0.0',
      description: 'Base scene template'
    };
    
    // Timing configuration (for sequence extraction)
    this.timing = {
      phases: [],      // Array of { name, start, end, type }
      markers: {},     // Named time markers
      duration: 0      // Total scene duration
    };
    
    // Motion configuration (for parameter extraction)
    this.motion = {
      camera: {},
      objects: {},
      animations: {}
    };
    
    // Dialogue/Events (for dialogue extraction)
    this.events = {
      dialogues: [],   // Array of { speaker, text, timestamp, display }
      triggers: [],    // Array of { name, timestamp, action }
      sounds: []       // Array of { file, timestamp, volume }
    };
    
    // Component registry (for object inspection)
    this.components = new Map();
    
    // Sequence data (alternative format)
    this.sequence = [];
  }
  
  /**
   * Register a timing phase for sequence builder
   */
  registerPhase(name, startTime, endTime, type = 'animation') {
    this.timing.phases.push({
      name,
      start: startTime,
      end: endTime,
      type,
      duration: endTime - startTime
    });
    
    console.log(`📌 Registered phase: ${name} (${startTime}s - ${endTime}s)`);
  }
  
  /**
   * Register a motion parameter for sequence builder
   */
  registerMotion(category, key, config) {
    if (!this.motion[category]) {
      this.motion[category] = {};
    }
    this.motion[category][key] = config;
    
    console.log(`🎬 Registered motion: ${category}.${key}`);
  }
  
  /**
   * Register a dialogue for sequence builder
   */
  registerDialogue(speaker, text, timestamp, display = 'subtitle') {
    this.events.dialogues.push({
      speaker,
      text,
      timestamp,
      display
    });
    
    console.log(`💬 Registered dialogue: ${speaker} @ ${timestamp}s`);
  }
  
  /**
   * Register an event trigger for sequence builder
   */
  registerEvent(name, timestamp, action) {
    this.events.triggers.push({
      name,
      timestamp,
      action
    });
    
    console.log(`⚡ Registered event: ${name} @ ${timestamp}s`);
  }
  
  /**
   * Get sequence-builder compatible data
   */
  getSequenceData() {
    return {
      metadata: this.sequenceMetadata,
      timing: this.timing,
      motion: this.motion,
      events: this.events,
      sequence: this.sequence
    };
  }
  
  /**
   * Export timing as introCfg format (for backward compatibility)
   */
  getIntroCfg() {
    const cfg = {};
    this.timing.phases.forEach(phase => {
      const key = phase.name.toLowerCase().replace(/\s+/g, '') + 'End';
      cfg[key] = phase.end;
    });
    return cfg;
  }
  
  // Standard lifecycle methods (to be overridden)
  async init() {}
  async start(app, config) {}
  update(app, deltaTime, totalTime) {}
  async destroy() {}
}

