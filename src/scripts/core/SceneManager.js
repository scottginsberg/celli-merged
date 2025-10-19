/**
 * Scene Manager - Dynamic Scene Loading & Composition System
 * 
 * This module provides a framework for:
 * - Loading/unloading scenes dynamically
 * - Managing scene lifecycle (init, start, update, stop, destroy)
 * - Scene transitions
 * - Permission-based scene access (ScenePermissionManager integration)
 * - Composing scenes from reusable components
 */

export class SceneManager {
  constructor() {
    this.scenes = new Map();
    this.activeScene = null;
    this.transitionInProgress = false;
    this.permissions = new Map();
    this.aliases = new Map();
    this.hooks = {
      beforeTransition: [],
      afterTransition: [],
      onSceneUpdate: [],
      onSceneStart: []
    };
  }

  /**
   * Register a scene with the manager
   * @param {string} name - Scene identifier
   * @param {Object} sceneModule - Scene module with lifecycle methods
   */
  registerScene(name, sceneModule) {
    if (this.scenes.has(name)) {
      console.warn(`Scene "${name}" already registered, overwriting`);
    }

    // Validate scene structure
    const requiredMethods = ['init', 'start', 'update', 'stop'];
    for (const method of requiredMethods) {
      if (typeof sceneModule[method] !== 'function') {
        console.warn(`Scene "${name}" missing required method: ${method}`);
      }
    }
    
    this.scenes.set(name, {
      module: sceneModule,
      initialized: false,
      active: false,
      state: {}
    });
    
    console.log(`✅ Scene registered: ${name}`);
  }

  /**
   * Register an alias for an existing scene.
   * Aliases allow shorthand transitions without duplicating scene instances.
   * @param {string} alias - Alias identifier
   * @param {string} target - Registered scene name
   * @param {Object} [defaultOptions={}] - Default transition options applied when alias is used
   */
  registerAlias(alias, target, defaultOptions = {}) {
    if (!target || !this.scenes.has(target)) {
      console.warn(`Cannot register alias "${alias}" → "${target}". Target scene not found.`);
      return;
    }

    this.aliases.set(alias, {
      target,
      options: { ...defaultOptions }
    });

    console.log(`🔗 Scene alias registered: ${alias} → ${target}`);
  }

  /**
   * Resolve scene aliases prior to transition.
   * @param {string} sceneName
   * @param {Object} options
   * @returns {{ name: string, options: Object }}
   */
  _resolveSceneAlias(sceneName, options) {
    if (!this.aliases.has(sceneName)) {
      return { name: sceneName, options };
    }

    const alias = this.aliases.get(sceneName);
    const mergedOptions = { ...alias.options, ...options };
    console.log(`🎯 Resolving scene alias "${sceneName}" → "${alias.target}"`);
    return { name: alias.target, options: mergedOptions };
  }

  /**
   * Transition to a new scene
   * @param {string} sceneName - Name of scene to transition to
   * @param {Object} options - Transition options
   */
  async transitionTo(sceneName, options = {}) {
    if (this.transitionInProgress) {
      console.warn('Transition already in progress');
      return false;
    }

    const requestedScene = sceneName;
    const resolved = this._resolveSceneAlias(sceneName, options);
    sceneName = resolved.name;
    options = resolved.options;

    if (!this.scenes.has(sceneName)) {
      console.error(`Scene "${sceneName}" not registered`);
      return false;
    }

    // Check permissions
    if (!this.can('transition', sceneName)) {
      console.warn(`Permission denied for scene: ${sceneName}`);
      return false;
    }

    this.transitionInProgress = true;

    try {
      // Call before transition hooks
      await this._callHooks('beforeTransition', { from: this.activeScene, to: sceneName, requested: requestedScene });

      // Stop current scene
      if (this.activeScene) {
        await this._stopScene(this.activeScene);
      }

      // Start new scene
      await this._startScene(sceneName, options);

      // Call after transition hooks
      await this._callHooks('afterTransition', { from: this.activeScene, to: sceneName, requested: requestedScene });

      this.activeScene = sceneName;
      if (requestedScene !== sceneName) {
        console.log(`🎬 Transitioned to scene: ${sceneName} (requested: ${requestedScene})`);
      } else {
        console.log(`🎬 Transitioned to scene: ${sceneName}`);
      }

      return true;
    } catch (error) {
      console.error(`Scene transition failed:`, error);
      return false;
    } finally {
      this.transitionInProgress = false;
    }
  }

  /**
   * Initialize a scene (if not already initialized)
   */
  async _initScene(sceneName) {
    const scene = this.scenes.get(sceneName);
    if (!scene.initialized) {
      console.log(`🔧 Initializing scene: ${sceneName}`);
      if (scene.module.init) {
        await scene.module.init(scene.state);
      }
      scene.initialized = true;
    }
  }

  /**
   * Start a scene
   */
  async _startScene(sceneName, options) {
    await this._initScene(sceneName);
    const scene = this.scenes.get(sceneName);
    
    console.log(`▶️ Starting scene: ${sceneName}`);
    if (scene.module.start) {
      await scene.module.start(scene.state, options);
    }
    scene.active = true;

    await this._callHooks('onSceneStart', { scene: sceneName, options });

    if (typeof window !== 'undefined' && window.dispatchEvent) {
      try {
        window.dispatchEvent(new CustomEvent('celli:scene-started', {
          detail: { scene: sceneName, options }
        }));
      } catch (error) {
        console.warn('⚠️ Failed to dispatch scene-started event:', error);
      }
    }
  }

  /**
   * Stop a scene
   */
  async _stopScene(sceneName) {
    const scene = this.scenes.get(sceneName);
    if (!scene || !scene.active) return;

    console.log(`⏹️ Stopping scene: ${sceneName}`);
    if (scene.module.stop) {
      await scene.module.stop(scene.state);
    }
    scene.active = false;
  }

  /**
   * Update active scene (call from animation loop)
   */
  update(deltaTime, totalTime) {
    if (!this.activeScene) return;

    const scene = this.scenes.get(this.activeScene);
    if (scene && scene.active && scene.module.update) {
      scene.module.update(scene.state, deltaTime, totalTime);
      
      // Call update hooks
      this._callHooks('onSceneUpdate', { scene: this.activeScene, deltaTime, totalTime });
    }
  }

  /**
   * Get scene state
   */
  getSceneState(sceneName) {
    const scene = this.scenes.get(sceneName || this.activeScene);
    return scene ? scene.state : null;
  }

  /**
   * Set permission for an action/scene
   */
  setPermission(action, value = true) {
    this.permissions.set(action, value);
    console.log(`🔐 Permission ${action}: ${value}`);
  }

  /**
   * Check if action is permitted
   */
  can(action, ...args) {
    const key = [action, ...args].join(':');
    return this.permissions.get(key) ?? this.permissions.get(action) ?? true;
  }

  /**
   * Register a hook
   */
  on(event, callback) {
    if (this.hooks[event]) {
      this.hooks[event].push(callback);
    }
  }

  /**
   * Call hooks
   */
  async _callHooks(event, data) {
    if (!this.hooks[event]) return;
    for (const callback of this.hooks[event]) {
      await callback(data);
    }
  }

  /**
   * Destroy a scene (cleanup)
   */
  async destroyScene(sceneName) {
    const scene = this.scenes.get(sceneName);
    if (!scene) return;

    if (scene.active) {
      await this._stopScene(sceneName);
    }

    if (scene.module.destroy) {
      await scene.module.destroy(scene.state);
    }

    this.scenes.delete(sceneName);

    for (const [alias, aliasConfig] of Array.from(this.aliases.entries())) {
      if (aliasConfig.target === sceneName) {
        this.aliases.delete(alias);
        console.log(`🧹 Removed scene alias ${alias} (target destroyed)`);
      }
    }

    console.log(`💥 Scene destroyed: ${sceneName}`);
  }

  /**
   * Get list of registered scenes
   */
  listScenes() {
    return [
      ...Array.from(this.scenes.keys()),
      ...Array.from(this.aliases.keys())
    ];
  }

  /**
   * Get current active scene name
   */
  getCurrentScene() {
    return this.activeScene;
  }
}

// Create singleton instance
export const sceneManager = new SceneManager();

// Global access for debugging
if (typeof window !== 'undefined') {
  window.SceneManager = sceneManager;
}

export default sceneManager;


