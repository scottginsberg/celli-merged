/**
 * Configuration System - Fine-tunable, player-exposable configuration
 * 
 * Provides:
 * - Central configuration management
 * - Runtime tweaking
 * - Player-exposed tuning (turn tuning into mechanics)
 * - Save/load configuration
 * - Hot reload support
 * - Configuration presets
 */

export class ConfigSystem {
  constructor() {
    this.config = {};
    this.defaults = {};
    this.listeners = new Map();
    this.locked = new Set();
    this.playerExposed = new Set();
    this.presets = new Map();
    this.history = [];
    this.maxHistory = 50;
  }

  /**
   * Register configuration category
   */
  registerCategory(category, defaultConfig, options = {}) {
    this.defaults[category] = { ...defaultConfig };
    this.config[category] = { ...defaultConfig };

    // Mark player-exposed parameters
    if (options.playerExposed) {
      options.playerExposed.forEach(key => {
        this.playerExposed.add(`${category}.${key}`);
      });
    }

    // Mark locked parameters (dev-only)
    if (options.locked) {
      options.locked.forEach(key => {
        this.locked.add(`${category}.${key}`);
      });
    }

    console.log(`⚙️ Config category registered: ${category}`);
  }

  /**
   * Get configuration value
   */
  get(path) {
    const keys = path.split('.');
    let value = this.config;

    for (const key of keys) {
      if (value === undefined || value === null) return undefined;
      value = value[key];
    }

    return value;
  }

  /**
   * Set configuration value
   */
  set(path, value, options = {}) {
    // Check if locked
    if (this.locked.has(path) && !options.force) {
      console.warn(`Config "${path}" is locked`);
      return false;
    }

    const keys = path.split('.');
    let obj = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }

    const oldValue = obj[keys[keys.length - 1]];
    obj[keys[keys.length - 1]] = value;

    // Add to history
    if (!options.noHistory) {
      this._addToHistory({ path, oldValue, newValue: value });
    }

    // Notify listeners
    this._notifyListeners(path, value, oldValue);

    console.log(`⚙️ Config set: ${path} = ${value}`);
    return true;
  }

  /**
   * Reset to default
   */
  reset(path) {
    const keys = path.split('.');
    let defaultValue = this.defaults;

    for (const key of keys) {
      if (defaultValue === undefined) return false;
      defaultValue = defaultValue[key];
    }

    this.set(path, defaultValue, { noHistory: false });
    return true;
  }

  /**
   * Reset entire category
   */
  resetCategory(category) {
    if (!this.defaults[category]) {
      console.warn(`Category "${category}" not found`);
      return false;
    }

    this.config[category] = { ...this.defaults[category] };
    console.log(`⚙️ Category reset: ${category}`);
    return true;
  }

  /**
   * Watch for changes
   */
  watch(path, callback) {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, []);
    }
    this.listeners.get(path).push(callback);

    // Return unwatch function
    return () => {
      const callbacks = this.listeners.get(path);
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    };
  }

  /**
   * Is config player-exposed
   */
  isPlayerExposed(path) {
    return this.playerExposed.has(path);
  }

  /**
   * Is config locked
   */
  isLocked(path) {
    return this.locked.has(path);
  }

  /**
   * Get all player-exposed config
   */
  getPlayerExposedConfig() {
    const exposed = {};
    
    for (const path of this.playerExposed) {
      const value = this.get(path);
      exposed[path] = value;
    }

    return exposed;
  }

  /**
   * Save preset
   */
  savePreset(name, description = '') {
    this.presets.set(name, {
      name,
      description,
      config: JSON.parse(JSON.stringify(this.config)),
      timestamp: Date.now()
    });

    console.log(`💾 Preset saved: ${name}`);
    return true;
  }

  /**
   * Load preset
   */
  loadPreset(name) {
    const preset = this.presets.get(name);
    if (!preset) {
      console.warn(`Preset "${name}" not found`);
      return false;
    }

    this.config = JSON.parse(JSON.stringify(preset.config));
    console.log(`📂 Preset loaded: ${name}`);
    
    // Notify all listeners
    this._notifyAllListeners();
    return true;
  }

  /**
   * List presets
   */
  listPresets() {
    return Array.from(this.presets.values()).map(p => ({
      name: p.name,
      description: p.description,
      timestamp: p.timestamp
    }));
  }

  /**
   * Delete preset
   */
  deletePreset(name) {
    return this.presets.delete(name);
  }

  /**
   * Save to localStorage
   */
  save(key = 'celli_config') {
    try {
      const data = {
        config: this.config,
        presets: Array.from(this.presets.entries()),
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`💾 Config saved to localStorage`);
      return true;
    } catch (error) {
      console.error('Failed to save config:', error);
      return false;
    }
  }

  /**
   * Load from localStorage
   */
  load(key = 'celli_config') {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return false;

      const data = JSON.parse(saved);
      this.config = data.config;
      this.presets = new Map(data.presets);
      
      console.log(`📂 Config loaded from localStorage`);
      this._notifyAllListeners();
      return true;
    } catch (error) {
      console.error('Failed to load config:', error);
      return false;
    }
  }

  /**
   * Export configuration as JSON
   */
  export() {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Import configuration from JSON
   */
  import(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      this.config = imported;
      console.log(`📥 Config imported`);
      this._notifyAllListeners();
      return true;
    } catch (error) {
      console.error('Failed to import config:', error);
      return false;
    }
  }

  /**
   * Undo last change
   */
  undo() {
    if (this.history.length === 0) {
      console.warn('Nothing to undo');
      return false;
    }

    const lastChange = this.history.pop();
    this.set(lastChange.path, lastChange.oldValue, { noHistory: true });
    return true;
  }

  /**
   * Get configuration tree (for UI)
   */
  getTree() {
    const tree = {};

    for (const [category, values] of Object.entries(this.config)) {
      tree[category] = {
        values: { ...values },
        playerExposed: {},
        locked: {}
      };

      for (const key of Object.keys(values)) {
        const path = `${category}.${key}`;
        tree[category].playerExposed[key] = this.playerExposed.has(path);
        tree[category].locked[key] = this.locked.has(path);
      }
    }

    return tree;
  }

  /**
   * Generate player tuning UI data
   */
  generatePlayerUI() {
    const ui = [];

    for (const path of this.playerExposed) {
      const value = this.get(path);
      const [category, key] = path.split('.');
      
      ui.push({
        path,
        category,
        key,
        value,
        type: typeof value,
        label: this._makeLabel(key),
        description: this._getDescription(path)
      });
    }

    return ui;
  }

  /**
   * Add to history
   */
  _addToHistory(change) {
    this.history.push(change);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  /**
   * Notify listeners
   */
  _notifyListeners(path, newValue, oldValue) {
    const callbacks = this.listeners.get(path);
    if (callbacks) {
      callbacks.forEach(cb => cb(newValue, oldValue));
    }

    // Notify wildcard listeners (e.g., "graphics.*")
    const parts = path.split('.');
    for (let i = parts.length - 1; i > 0; i--) {
      const wildcard = parts.slice(0, i).join('.') + '.*';
      const wildcardCallbacks = this.listeners.get(wildcard);
      if (wildcardCallbacks) {
        wildcardCallbacks.forEach(cb => cb(newValue, oldValue, path));
      }
    }
  }

  /**
   * Notify all listeners (for preset load)
   */
  _notifyAllListeners() {
    for (const [path, callbacks] of this.listeners) {
      if (!path.includes('*')) {
        const value = this.get(path);
        callbacks.forEach(cb => cb(value, undefined));
      }
    }
  }

  /**
   * Make human-readable label
   */
  _makeLabel(key) {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .trim()
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Get description (placeholder - could be from metadata)
   */
  _getDescription(path) {
    // Could load from a descriptions file
    return '';
  }
}

// Export singleton instance
export const configSystem = new ConfigSystem();
export default configSystem;


