/**
 * Sequence Engine - Runtime execution of visual sequence scripts
 * 
 * Executes sequences created in the Sequence Composer (sequence.html)
 * Supports: dialogue, animations, delays, transitions, events, parameters
 * 
 * Designed for narrative-driven sequences in THE.OS, Execution Environment, etc.
 */

import { audioSystem } from './AudioSystem.js';
import { sceneManager } from '../core/SceneManager.js';

export class SequenceEngine {
  constructor() {
    this.sequences = new Map();
    this.activeSequence = null;
    this.currentNodeIndex = 0;
    this.sequenceState = {};
    this.paused = false;
    this.stopRequested = false;
    this.activeAudioSources = new Map();
    this.hooks = {
      onNodeExecute: [],
      onSequenceStart: [],
      onSequenceEnd: [],
      onDialogue: [],
      onAnimation: [],
      onEvent: [],
      onAudio: [],
      onScreenShake: [],
      onSceneTransition: []
    };
    this.nodeExecutors = this._createNodeExecutors();
  }

  /**
   * Register a sequence from JSON
   */
  registerSequence(name, sequenceData) {
    this.sequences.set(name, sequenceData);
    console.log(`📋 Sequence registered: ${name} (${sequenceData.nodes?.length || 0} nodes)`);
  }

  /**
   * Load sequence from URL
   */
  async loadSequence(name, url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      this.registerSequence(name, data);
      return true;
    } catch (error) {
      console.error(`Failed to load sequence "${name}":`, error);
      return false;
    }
  }

  /**
   * Start a sequence
   */
  async startSequence(name, initialState = {}) {
    const sequence = this.sequences.get(name);
    if (!sequence) {
      console.error(`Sequence "${name}" not found`);
      return false;
    }

    if (this.activeSequence) {
      console.warn(`Sequence "${this.activeSequence}" interrupted by request to start "${name}"`);
      this.stop();
      await Promise.resolve();
    }

    this.activeSequence = name;
    this.currentNodeIndex = 0;
    this.sequenceState = { ...initialState };
    this.paused = false;
    this.stopRequested = false;

    console.log(`▶️ Starting sequence: ${name}`);
    this._callHooks('onSequenceStart', { name, state: this.sequenceState });

    await this._executeSequence(sequence);

    return true;
  }

  /**
   * Execute sequence nodes
   */
  async _executeSequence(sequence) {
    if (!sequence.nodes || sequence.nodes.length === 0) {
      console.warn('Sequence has no nodes');
      return;
    }

    // Find start node (or use first node)
    const startNode = sequence.nodes.find(n => n.type === 'start') || sequence.nodes[0];
    
    await this._executeNode(startNode, sequence);

    console.log(`✅ Sequence complete: ${this.activeSequence}`);
    this._callHooks('onSequenceEnd', { name: this.activeSequence });
    
    this.activeSequence = null;
  }

  /**
   * Execute a single node
   */
  async _executeNode(node, sequence) {
    if (!node || this.paused || this.stopRequested) return;

    console.log(`🎬 Executing node: ${node.type} (${node.id})`);
    this._callHooks('onNodeExecute', { node, state: this.sequenceState });

    // Execute node based on type
    const executor = this.nodeExecutors[node.type];
    if (executor) {
      await executor.call(this, node, this.sequenceState);
    } else {
      console.warn(`No executor for node type: ${node.type}`);
    }

    if (this.stopRequested) {
      return;
    }

    // Find and execute next node
    const nextNode = this._findNextNode(node, sequence);
    if (nextNode) {
      await this._executeNode(nextNode, sequence);
    }
  }

  /**
   * Find next connected node
   */
  _findNextNode(currentNode, sequence) {
    // Find connections from this node
    const connection = sequence.connections?.find(c => c.fromNode === currentNode.id);
    if (!connection) return null;

    // Find the target node
    return sequence.nodes.find(n => n.id === connection.toNode);
  }

  /**
   * Create node executors for each node type
   */
  _createNodeExecutors() {
    return {
      // Start node
      start: async (node, state) => {
        console.log('🎬 Sequence start');
      },

      // Dialogue node
      dialogue: async (node, state) => {
        const { speaker, text, duration } = node.params || {};
        console.log(`💬 Dialogue: ${speaker}: "${text}"`);
        
        this._callHooks('onDialogue', { speaker, text, duration, state });
        
        // Wait for duration (if specified)
        if (duration) {
          await this._delay(parseFloat(duration) * 1000);
        }
      },

      // Animation node
      animation: async (node, state) => {
        const { target, property, from, to, duration, easing } = node.params || {};
        console.log(`🎨 Animation: ${target}.${property} from ${from} to ${to}`);
        
        this._callHooks('onAnimation', { target, property, from, to, duration, easing, state });
        
        // Wait for animation duration
        if (duration) {
          await this._delay(parseFloat(duration) * 1000);
        }
      },

      // Delay node
      delay: async (node, state) => {
        const duration = parseFloat(node.params?.duration || 1);
        console.log(`⏰ Delay: ${duration}s`);
        await this._delay(duration * 1000);
      },

      // Transition node (scene transition)
      transition: async (node, state) => {
        const { toScene, effect } = node.params || {};
        console.log(`🎬 Transition: to ${toScene} (${effect})`);

        // This would trigger scene manager transition
        this._callHooks('onEvent', { type: 'transition', toScene, effect, state });
      },

      // Audio node
      audio: async (node) => {
        const { action = 'play', key, url, volume = 1, loop = false } = node.params || {};
        const audioKey = key || url;

        if (!audioKey) {
          console.warn('Audio node missing key/url parameter');
          return;
        }

        if (action === 'play') {
          try {
            if (url) {
              await audioSystem.loadAudioBuffer(url, audioKey);
            }

            const source = audioSystem.playBuffer(audioKey, {
              volume,
              loop,
              onEnded: () => {
                if (!loop) {
                  this.activeAudioSources.delete(audioKey);
                }
              }
            });

            if (source) {
              this.activeAudioSources.set(audioKey, source);
            }

            this._callHooks('onAudio', {
              action: 'play',
              key: audioKey,
              loop,
              volume
            });
          } catch (error) {
            console.error(`Audio playback failed for ${audioKey}:`, error);
          }
        } else if (action === 'stop') {
          const source = this.activeAudioSources.get(audioKey);
          if (source) {
            try {
              source.stop();
            } catch (error) {
              console.warn('Failed to stop audio source:', error);
            }
            this.activeAudioSources.delete(audioKey);
          }

          this._callHooks('onAudio', {
            action: 'stop',
            key: audioKey
          });
        }
      },

      // Screen shake node
      screenShake: async (node, state) => {
        const { intensity = 0.1, duration = 500 } = node.params || {};
        const shaker = state?.screenShake;

        if (shaker && typeof shaker.start === 'function') {
          shaker.start(intensity, duration);
        } else {
          console.warn('Screen shake requested but no screenShake object provided in state');
        }

        this._callHooks('onScreenShake', { intensity, duration, state });

        if (node.params?.waitForCompletion) {
          await this._delay(duration);
        }
      },

      // Scene transition node
      sceneTransition: async (node) => {
        const { toScene, effect, options = {}, waitForCompletion = true } = node.params || {};

        if (!toScene) {
          console.warn('sceneTransition node missing toScene parameter');
          return;
        }

        this._callHooks('onSceneTransition', { toScene, effect, options });
        this._callHooks('onEvent', {
          type: 'sceneTransition',
          toScene,
          effect,
          options
        });

        if (waitForCompletion) {
          await sceneManager.transitionTo(toScene, options);
        } else {
          sceneManager.transitionTo(toScene, options);
        }
      },

      // Event node (trigger custom event)
      event: async (node, state) => {
        const { eventName, eventData } = node.params || {};
        console.log(`⚡ Event: ${eventName}`);
        
        this._callHooks('onEvent', { 
          type: 'custom', 
          name: eventName, 
          data: eventData, 
          state 
        });
      },

      // Parameter node (get/set parameter)
      parameter: async (node, state) => {
        const { entity, path, operation, value } = node.params || {};
        console.log(`📊 Parameter: ${operation} ${entity}.${path}`);
        
        if (operation === 'set') {
          // Set parameter in state
          this._setParameter(state, path, value);
        } else if (operation === 'get') {
          // Get parameter from state
          const currentValue = this._getParameter(state, path);
          console.log(`  Current value: ${currentValue}`);
        }
      },

      // Object node (create/modify object)
      object: async (node, state) => {
        const { objectName, action } = node.params || {};
        console.log(`📦 Object: ${action} ${objectName}`);
        
        this._callHooks('onEvent', { type: 'object', action, objectName, state });
      },

      // Snapshot node (save state)
      snapshot: async (node, state) => {
        const { snapshotName } = node.params || {};
        console.log(`📸 Snapshot: ${snapshotName}`);
        
        // Save current state
        this.savedSnapshots = this.savedSnapshots || {};
        this.savedSnapshots[snapshotName] = { ...state };
      },

      // Condition node (branching)
      condition: async (node, state) => {
        const { condition } = node.params || {};
        console.log(`❓ Condition: ${condition}`);
        
        // Evaluate condition (simple eval for now)
        try {
          const result = this._evaluateCondition(condition, state);
          state._conditionResult = result;
          console.log(`  Result: ${result}`);
        } catch (error) {
          console.error('Condition evaluation error:', error);
          state._conditionResult = false;
        }
      }
    };
  }

  /**
   * Helper: delay
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Helper: set parameter in state
   */
  _setParameter(state, path, value) {
    const keys = path.split('.');
    let obj = state;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    
    obj[keys[keys.length - 1]] = value;
  }

  /**
   * Helper: get parameter from state
   */
  _getParameter(state, path) {
    const keys = path.split('.');
    let obj = state;
    
    for (const key of keys) {
      if (obj === undefined || obj === null) return undefined;
      obj = obj[key];
    }
    
    return obj;
  }

  /**
   * Helper: evaluate condition
   */
  _evaluateCondition(condition, state) {
    // Simple condition evaluation
    // Format: "property operator value" e.g. "health > 50"
    const match = condition.match(/(\w+(?:\.\w+)*)\s*(==|!=|>|<|>=|<=)\s*(.+)/);
    if (!match) return false;

    const [, prop, op, val] = match;
    const propValue = this._getParameter(state, prop);
    const compareValue = isNaN(val) ? val : parseFloat(val);

    switch (op) {
      case '==': return propValue == compareValue;
      case '!=': return propValue != compareValue;
      case '>': return propValue > compareValue;
      case '<': return propValue < compareValue;
      case '>=': return propValue >= compareValue;
      case '<=': return propValue <= compareValue;
      default: return false;
    }
  }

  /**
   * Pause sequence
   */
  pause() {
    this.paused = true;
    console.log('⏸️ Sequence paused');
  }

  /**
   * Resume sequence
   */
  resume() {
    this.paused = false;
    console.log('▶️ Sequence resumed');
  }

  /**
   * Stop sequence
   */
  stop() {
    if (!this.activeSequence && !this.stopRequested) {
      return;
    }

    console.log('⏹️ Sequence stopped');
    this.stopRequested = true;
    this.activeSequence = null;
    this.paused = false;

    this.activeAudioSources.forEach((source, key) => {
      try {
        source.stop();
      } catch (error) {
        console.warn(`Failed to stop audio source ${key}:`, error);
      }
    });
    this.activeAudioSources.clear();
  }

  /**
   * Register hook
   */
  on(event, callback) {
    if (this.hooks[event]) {
      this.hooks[event].push(callback);
    }
  }

  /**
   * Call hooks
   */
  _callHooks(event, data) {
    if (this.hooks[event]) {
      this.hooks[event].forEach(cb => cb(data));
    }
  }

  /**
   * Get active sequence name
   */
  getActiveSequence() {
    return this.activeSequence;
  }

  /**
   * Is sequence running
   */
  isRunning() {
    return this.activeSequence !== null;
  }

  /**
   * List registered sequences
   */
  listSequences() {
    return Array.from(this.sequences.keys());
  }
}

// Export singleton instance
export const sequenceEngine = new SequenceEngine();
export default sequenceEngine;


