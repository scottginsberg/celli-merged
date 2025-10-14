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
    this.hooks = {
      beforeTransition: [],
      afterTransition: [],
      onSceneUpdate: []
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
   * Transition to a new scene
   * @param {string} sceneName - Name of scene to transition to
   * @param {Object} options - Transition options
   */
  async transitionTo(sceneName, options = {}) {
    console.group(`[SceneManager] transitionTo → ${sceneName}`);
    console.log('Current scene:', this.activeScene ?? 'none');
    console.log('Options:', options);

    if (this.transitionInProgress) {
      console.warn('Transition already in progress');
      console.groupEnd();
      return false;
    }

    if (!this.scenes.has(sceneName)) {
      console.error(`Scene "${sceneName}" not registered`);
      console.groupEnd();
      return false;
    }

    if (!this.can('transition', sceneName)) {
      console.warn(`Permission denied for scene: ${sceneName}`);
      console.groupEnd();
      return false;
    }

    this.transitionInProgress = true;
    let success = false;

    try {
      await this._callHooks('beforeTransition', { from: this.activeScene, to: sceneName });

      if (this.activeScene) {
        await this._stopScene(this.activeScene);
      }

      await this._startScene(sceneName, options);

      await this._callHooks('afterTransition', { from: this.activeScene, to: sceneName });

      this.activeScene = sceneName;
      console.log(`🎬 Transitioned to scene: ${sceneName}`);
      success = true;
      return true;
    } catch (error) {
      console.error('Scene transition failed:', error);
      return false;
    } finally {
      this.transitionInProgress = false;
      console.log(`🏁 Transition ${success ? 'completed' : 'failed'} for scene: ${sceneName}`);
      console.groupEnd();
    }
  }

  /**
   * Initialize a scene (if not already initialized)
   */
  async _initScene(sceneName) {
    const scene = this.scenes.get(sceneName);
    if (!scene) {
      throw new Error(`Scene "${sceneName}" not found during initialization`);
    }

    if (!scene.initialized) {
      const label = `[SceneManager] init ${sceneName}`;
      console.time(label);
      console.log(`🔧 Initializing scene: ${sceneName}`);

      try {
        if (scene.module.init) {
          await scene.module.init(scene.state);
        }
        scene.initialized = true;
        console.log(`✅ Scene initialized: ${sceneName}`);
      } catch (error) {
        console.error(`❌ Failed to initialize scene "${sceneName}":`, error);
        throw error;
      } finally {
        console.timeEnd(label);
      }
    }
  }

  /**
   * Start a scene
   */
  async _startScene(sceneName, options) {
    await this._initScene(sceneName);
    const scene = this.scenes.get(sceneName);
    if (!scene) {
      throw new Error(`Scene "${sceneName}" not found during start`);
    }

    const label = `[SceneManager] start ${sceneName}`;
    console.time(label);
    console.log(`▶️ Starting scene: ${sceneName}`);

    try {
      if (scene.module.start) {
        await scene.module.start(scene.state, options);
      }
      scene.active = true;
      console.log(`✅ Scene active: ${sceneName}`);
    } catch (error) {
      console.error(`❌ Failed to start scene "${sceneName}":`, error);
      throw error;
    } finally {
      console.timeEnd(label);
    }
  }

  /**
   * Stop a scene
   */
  async _stopScene(sceneName) {
    const scene = this.scenes.get(sceneName);
    if (!scene || !scene.active) {
      console.log(`⏹️ Stop skipped for scene: ${sceneName} (not active)`);
      return;
    }

    const label = `[SceneManager] stop ${sceneName}`;
    console.time(label);
    console.log(`⏹️ Stopping scene: ${sceneName}`);

    try {
      if (scene.module.stop) {
        await scene.module.stop(scene.state);
      }
      scene.active = false;
      console.log(`✅ Scene stopped: ${sceneName}`);
    } catch (error) {
      console.error(`❌ Failed to stop scene "${sceneName}":`, error);
      throw error;
    } finally {
      console.timeEnd(label);
    }
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
    console.log(`💥 Scene destroyed: ${sceneName}`);
  }

  /**
   * Get list of registered scenes
   */
  listScenes() {
    return Array.from(this.scenes.keys());
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


