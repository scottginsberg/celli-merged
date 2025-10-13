/**
 * Input System - Unified Keyboard and Mouse Handling
 * 
 * Manages all input events with:
 * - Keyboard event handling
 * - Mouse event handling
 * - Input permission checking
 * - Event delegation for different game phases
 * 
 * Extracted from merged2.html input handling code
 */

import { permissionManager } from './PermissionManager.js';

export class InputSystem {
  constructor() {
    this.keyHandlers = new Map();
    this.mouseHandlers = [];
    this.keyState = new Map();
    this.mouseState = {
      x: 0,
      y: 0,
      buttons: 0,
      isDown: false
    };
    
    this.enabled = true;
    this.initialized = false;
  }

  /**
   * Initialize input system and attach event listeners
   */
  init() {
    if (this.initialized) {
      console.warn('InputSystem already initialized');
      return;
    }

    // Keyboard events
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));

    // Mouse events
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    document.addEventListener('click', this.handleClick.bind(this));

    this.initialized = true;
    console.log('⌨️ InputSystem initialized');
  }

  /**
   * Register a key handler
   * @param {string} key - Key name (e.g., 'r', 'Escape', 'Enter')
   * @param {Function} handler - Handler function(event)
   * @param {Object} options - Options: { phase: 'visicell', preventDefault: true }
   */
  onKey(key, handler, options = {}) {
    const normalizedKey = key.toLowerCase();
    
    if (!this.keyHandlers.has(normalizedKey)) {
      this.keyHandlers.set(normalizedKey, []);
    }

    this.keyHandlers.get(normalizedKey).push({
      handler,
      phase: options.phase || null,
      preventDefault: options.preventDefault !== false
    });

    console.log(`⌨️ Registered handler for key: ${key}${options.phase ? ` (phase: ${options.phase})` : ''}`);
  }

  /**
   * Remove a key handler
   * @param {string} key - Key name
   * @param {Function} handler - Handler function to remove
   */
  offKey(key, handler) {
    const normalizedKey = key.toLowerCase();
    
    if (this.keyHandlers.has(normalizedKey)) {
      const handlers = this.keyHandlers.get(normalizedKey);
      const index = handlers.findIndex(h => h.handler === handler);
      
      if (index !== -1) {
        handlers.splice(index, 1);
        
        if (handlers.length === 0) {
          this.keyHandlers.delete(normalizedKey);
        }
      }
    }
  }

  /**
   * Register a mouse event handler
   * @param {string} event - Event type ('move', 'down', 'up', 'click')
   * @param {Function} handler - Handler function(mouseState, event)
   * @param {Object} options - Options: { phase: 'visicell' }
   */
  onMouse(event, handler, options = {}) {
    this.mouseHandlers.push({
      event,
      handler,
      phase: options.phase || null
    });

    console.log(`🖱️ Registered handler for mouse: ${event}${options.phase ? ` (phase: ${options.phase})` : ''}`);
  }

  /**
   * Handle keydown events
   */
  handleKeyDown(event) {
    if (!this.enabled) return;

    const key = event.key.toLowerCase();
    this.keyState.set(key, true);

    // Check permission for input
    if (!permissionManager.can('input')) {
      return;
    }

    if (this.keyHandlers.has(key)) {
      const handlers = this.keyHandlers.get(key);
      const currentPhase = permissionManager.getPhase();

      for (const { handler, phase, preventDefault } of handlers) {
        // Check if handler is for this phase (or all phases if phase is null)
        if (phase === null || phase === currentPhase) {
          if (preventDefault) {
            event.preventDefault();
          }

          try {
            handler(event);
          } catch (error) {
            console.error(`Key handler error for '${key}':`, error);
          }
        }
      }
    }
  }

  /**
   * Handle keyup events
   */
  handleKeyUp(event) {
    if (!this.enabled) return;

    const key = event.key.toLowerCase();
    this.keyState.set(key, false);
  }

  /**
   * Handle mouse move events
   */
  handleMouseMove(event) {
    if (!this.enabled) return;

    this.mouseState.x = event.clientX;
    this.mouseState.y = event.clientY;

    this.triggerMouseHandlers('move', event);
  }

  /**
   * Handle mouse down events
   */
  handleMouseDown(event) {
    if (!this.enabled) return;

    this.mouseState.buttons = event.buttons;
    this.mouseState.isDown = true;

    this.triggerMouseHandlers('down', event);
  }

  /**
   * Handle mouse up events
   */
  handleMouseUp(event) {
    if (!this.enabled) return;

    this.mouseState.buttons = event.buttons;
    this.mouseState.isDown = false;

    this.triggerMouseHandlers('up', event);
  }

  /**
   * Handle click events
   */
  handleClick(event) {
    if (!this.enabled) return;

    this.triggerMouseHandlers('click', event);
  }

  /**
   * Trigger mouse handlers for a specific event type
   */
  triggerMouseHandlers(eventType, event) {
    if (!permissionManager.can('cameraControl') && eventType === 'move') {
      return; // Block mouse look when camera control is disabled
    }

    const currentPhase = permissionManager.getPhase();

    for (const { event: handlerEvent, handler, phase } of this.mouseHandlers) {
      if (handlerEvent === eventType) {
        // Check if handler is for this phase (or all phases if phase is null)
        if (phase === null || phase === currentPhase) {
          try {
            handler(this.mouseState, event);
          } catch (error) {
            console.error(`Mouse handler error for '${eventType}':`, error);
          }
        }
      }
    }
  }

  /**
   * Check if a key is currently pressed
   * @param {string} key - Key name
   * @returns {boolean}
   */
  isKeyPressed(key) {
    return this.keyState.get(key.toLowerCase()) === true;
  }

  /**
   * Get current mouse state
   * @returns {Object}
   */
  getMouseState() {
    return { ...this.mouseState };
  }

  /**
   * Enable input system
   */
  enable() {
    this.enabled = true;
    console.log('⌨️ InputSystem enabled');
  }

  /**
   * Disable input system
   */
  disable() {
    this.enabled = false;
    console.log('⌨️ InputSystem disabled');
  }

  /**
   * Clear all handlers
   */
  clearAll() {
    this.keyHandlers.clear();
    this.mouseHandlers = [];
    console.log('⌨️ All input handlers cleared');
  }
}

// Create singleton instance
export const inputSystem = new InputSystem();

