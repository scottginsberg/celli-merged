/**
 * Asset Pool System - Centralized asset management with preloading
 * 
 * Manages loading, caching, and accessing all assets:
 * - Textures
 * - Audio files
 * - Shaders
 * - 3D models
 * - JSON data
 * - Fonts
 */

export class AssetPool {
  constructor() {
    this.assets = new Map();
    this.loading = new Map();
    this.loaded = new Set();
    this.failed = new Set();
    this.loadCallbacks = new Map();
    this.progressCallbacks = [];
    this.totalAssets = 0;
    this.loadedCount = 0;
  }

  /**
   * Register an asset to be loaded
   */
  register(key, url, type = 'auto') {
    if (this.assets.has(key)) {
      console.warn(`Asset "${key}" already registered`);
      return;
    }

    // Auto-detect type from URL if not specified
    if (type === 'auto') {
      type = this._detectType(url);
    }

    this.assets.set(key, {
      key,
      url,
      type,
      data: null,
      loaded: false,
      failed: false
    });

    this.totalAssets++;
  }

  /**
   * Register multiple assets at once
   */
  registerBatch(assets) {
    for (const [key, config] of Object.entries(assets)) {
      const url = typeof config === 'string' ? config : config.url;
      const type = typeof config === 'string' ? 'auto' : (config.type || 'auto');
      this.register(key, url, type);
    }
  }

  /**
   * Load a single asset
   */
  async load(key) {
    const asset = this.assets.get(key);
    if (!asset) {
      console.error(`Asset "${key}" not registered`);
      return null;
    }

    if (asset.loaded) {
      return asset.data;
    }

    if (asset.failed) {
      console.warn(`Asset "${key}" previously failed to load`);
      return null;
    }

    // Check if already loading
    if (this.loading.has(key)) {
      return this.loading.get(key);
    }

    // Start loading
    const loadPromise = this._loadAsset(asset);
    this.loading.set(key, loadPromise);

    try {
      const data = await loadPromise;
      asset.data = data;
      asset.loaded = true;
      this.loaded.add(key);
      this.loadedCount++;
      this.loading.delete(key);

      // Call progress callbacks
      this._notifyProgress();

      // Call specific load callbacks
      if (this.loadCallbacks.has(key)) {
        this.loadCallbacks.get(key).forEach(cb => cb(data));
      }

      return data;
    } catch (error) {
      console.error(`Failed to load asset "${key}":`, error);
      asset.failed = true;
      this.failed.add(key);
      this.loading.delete(key);
      return null;
    }
  }

  /**
   * Load multiple assets
   */
  async loadBatch(keys) {
    return Promise.all(keys.map(key => this.load(key)));
  }

  /**
   * Load all registered assets
   */
  async loadAll() {
    const keys = Array.from(this.assets.keys());
    return this.loadBatch(keys);
  }

  /**
   * Get an asset (must be loaded)
   */
  get(key) {
    const asset = this.assets.get(key);
    if (!asset) {
      console.warn(`Asset "${key}" not found`);
      return null;
    }

    if (!asset.loaded) {
      console.warn(`Asset "${key}" not loaded yet`);
      return null;
    }

    return asset.data;
  }

  /**
   * Check if asset is loaded
   */
  isLoaded(key) {
    return this.loaded.has(key);
  }

  /**
   * Get loading progress (0-1)
   */
  getProgress() {
    if (this.totalAssets === 0) return 1;
    return this.loadedCount / this.totalAssets;
  }

  /**
   * On progress callback
   */
  onProgress(callback) {
    this.progressCallbacks.push(callback);
  }

  /**
   * On specific asset load callback
   */
  onLoad(key, callback) {
    if (!this.loadCallbacks.has(key)) {
      this.loadCallbacks.set(key, []);
    }
    this.loadCallbacks.get(key).push(callback);
  }

  /**
   * Detect asset type from URL
   */
  _detectType(url) {
    const ext = url.split('.').pop().toLowerCase();
    
    const typeMap = {
      // Images
      'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image', 'webp': 'image',
      // Audio
      'mp3': 'audio', 'wav': 'audio', 'ogg': 'audio', 'm4a': 'audio',
      // Shaders
      'glsl': 'shader', 'vert': 'shader', 'frag': 'shader',
      // Models
      'gltf': 'model', 'glb': 'model', 'obj': 'model', 'fbx': 'model',
      // Data
      'json': 'json', 'txt': 'text',
      // Fonts
      'ttf': 'font', 'woff': 'font', 'woff2': 'font'
    };

    return typeMap[ext] || 'text';
  }

  /**
   * Load asset based on type
   */
  async _loadAsset(asset) {
    switch (asset.type) {
      case 'image':
        return this._loadImage(asset.url);
      case 'audio':
        return this._loadAudio(asset.url);
      case 'shader':
      case 'text':
        return this._loadText(asset.url);
      case 'json':
        return this._loadJSON(asset.url);
      case 'model':
        return this._loadModel(asset.url);
      default:
        return this._loadText(asset.url);
    }
  }

  /**
   * Load image
   */
  async _loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  /**
   * Load audio buffer
   */
  async _loadAudio(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const arrayBuffer = await response.arrayBuffer();
    
    // Need audio context to decode - will be decoded later
    return arrayBuffer;
  }

  /**
   * Load text file
   */
  async _loadText(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.text();
  }

  /**
   * Load JSON
   */
  async _loadJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.json();
  }

  /**
   * Load 3D model (basic fetch - loader handles parsing)
   */
  async _loadModel(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.arrayBuffer();
  }

  /**
   * Notify progress callbacks
   */
  _notifyProgress() {
    const progress = this.getProgress();
    this.progressCallbacks.forEach(cb => cb(progress, this.loadedCount, this.totalAssets));
  }

  /**
   * Clear all assets
   */
  clear() {
    this.assets.clear();
    this.loading.clear();
    this.loaded.clear();
    this.failed.clear();
    this.loadCallbacks.clear();
    this.progressCallbacks = [];
    this.totalAssets = 0;
    this.loadedCount = 0;
  }

  /**
   * Get asset manifest (list of all assets)
   */
  getManifest() {
    const manifest = [];
    for (const [key, asset] of this.assets) {
      manifest.push({
        key,
        url: asset.url,
        type: asset.type,
        loaded: asset.loaded,
        failed: asset.failed
      });
    }
    return manifest;
  }
}

// Export singleton instance
export const assetPool = new AssetPool();
export default assetPool;


