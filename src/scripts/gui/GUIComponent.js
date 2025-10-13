/**
 * GUIComponent - Base class for all GUI components
 * 
 * Provides common functionality for:
 * - Lifecycle management
 * - State management
 * - Event handling
 * - DOM manipulation
 * - Show/hide/animate
 */

export class GUIComponent {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.options = options;
    this.state = {};
    this.visible = false;
    this.initialized = false;
    this.listeners = new Map();
  }

  /**
   * Initialize the component (called once)
   */
  init() {
    if (this.initialized) return;
    this.onInit();
    this.initialized = true;
    console.log(`GUI Component initialized: ${this.containerId}`);
  }

  /**
   * Override in subclass for initialization logic
   */
  onInit() {}

  /**
   * Show the component
   */
  show(animated = true) {
    if (!this.initialized) this.init();
    if (this.visible) return;
    
    this.visible = true;
    this.onShow(animated);
    this.emit('show');
  }

  /**
   * Hide the component
   */
  hide(animated = true) {
    if (!this.visible) return;
    
    this.visible = false;
    this.onHide(animated);
    this.emit('hide');
  }

  /**
   * Toggle visibility
   */
  toggle(animated = true) {
    if (this.visible) {
      this.hide(animated);
    } else {
      this.show(animated);
    }
  }

  /**
   * Override for show logic
   */
  onShow(animated) {
    if (this.container) {
      if (animated) {
        this.container.classList.add('visible');
      } else {
        this.container.style.display = 'block';
      }
    }
  }

  /**
   * Override for hide logic
   */
  onHide(animated) {
    if (this.container) {
      if (animated) {
        this.container.classList.remove('visible');
      } else {
        this.container.style.display = 'none';
      }
    }
  }

  /**
   * Update component state
   */
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.onStateChange(this.state);
  }

  /**
   * Override for state change reactions
   */
  onStateChange(state) {}

  /**
   * Update component (called from animation loop if needed)
   */
  update(deltaTime, totalTime) {
    if (!this.visible) return;
    this.onUpdate(deltaTime, totalTime);
  }

  /**
   * Override for update logic
   */
  onUpdate(deltaTime, totalTime) {}

  /**
   * Add event listener
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Emit event
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    callbacks.forEach(cb => cb(data));
  }

  /**
   * Destroy component
   */
  destroy() {
    this.listeners.clear();
    this.onDestroy();
    console.log(`GUI Component destroyed: ${this.containerId}`);
  }

  /**
   * Override for cleanup logic
   */
  onDestroy() {}
}

export default GUIComponent;


