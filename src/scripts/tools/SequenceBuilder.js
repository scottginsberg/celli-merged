/**
 * SequenceBuilder - Modular Wrapper for Unified Sequence Builder
 * 
 * This module provides a way to instantiate the Sequence Builder as an overlay
 * around any scene. It manages the iframe embedding and communication.
 * 
 * Usage:
 *   const builder = new SequenceBuilder(containerElement);
 *   builder.open();
 *   builder.close();
 *   builder.toggle();
 * 
 * Future Refactoring:
 *   - Extract UnifiedSequenceBuilder class from tools/sequence-builder/index.html
 *   - Extract SceneViewport class as separate module
 *   - Extract GlitchVideoPlayer class as separate module
 *   - Create proper ES6 module structure with imports/exports
 *   - Remove iframe dependency and use direct DOM manipulation
 */

export class SequenceBuilder {
  constructor(options = {}) {
    this.options = {
      containerSelector: options.containerSelector || '#sequence-overlay',
      builderUrl: options.builderUrl || './tools/sequence-builder/index.html',
      mode: options.mode || 'overlay', // 'overlay' | 'standalone'
      ...options
    };
    
    this.container = null;
    this.iframe = null;
    this.isOpen = false;
    this.isInitialized = false;
    
    this._messageHandler = this._handleMessage.bind(this);
  }
  
  /**
   * Initialize the sequence builder
   */
  async init() {
    if (this.isInitialized) {
      console.warn('SequenceBuilder already initialized');
      return;
    }
    
    // Get or create container
    this.container = document.querySelector(this.options.containerSelector);
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'sequence-overlay';
      this.container.style.display = 'none';
      document.body.appendChild(this.container);
    }
    
    // Set up message listener for communication with iframe
    window.addEventListener('message', this._messageHandler);
    
    this.isInitialized = true;
    console.log('✅ SequenceBuilder module initialized');
  }
  
  /**
   * Open the sequence builder overlay
   */
  open() {
    if (!this.isInitialized) {
      console.error('SequenceBuilder not initialized. Call init() first.');
      return;
    }
    
    if (this.isOpen) {
      console.warn('SequenceBuilder already open');
      return;
    }
    
    // Create iframe if not exists
    if (!this.iframe) {
      this._createIframe();
    }
    
    // Show container
    this.container.style.display = 'block';
    this.isOpen = true;
    
    console.log('🎬 SequenceBuilder opened');
    this._dispatchEvent('builder:open');
  }
  
  /**
   * Close the sequence builder overlay
   */
  close() {
    if (!this.isOpen) return;
    
    this.container.style.display = 'none';
    this.isOpen = false;
    
    console.log('🎬 SequenceBuilder closed');
    this._dispatchEvent('builder:close');
  }
  
  /**
   * Toggle the sequence builder overlay
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  
  /**
   * Destroy the sequence builder and clean up
   */
  destroy() {
    this.close();
    
    if (this.iframe && this.iframe.parentNode) {
      this.iframe.parentNode.removeChild(this.iframe);
      this.iframe = null;
    }
    
    window.removeEventListener('message', this._messageHandler);
    
    this.isInitialized = false;
    console.log('🗑️ SequenceBuilder destroyed');
  }
  
  /**
   * Send a message to the sequence builder iframe
   */
  sendMessage(type, data = {}) {
    if (!this.iframe || !this.iframe.contentWindow) {
      console.warn('Cannot send message - iframe not ready');
      return;
    }
    
    this.iframe.contentWindow.postMessage({ type, data }, '*');
  }
  
  /**
   * Load a scene into the sequence builder
   */
  loadScene(sceneData) {
    this.sendMessage('loadScene', sceneData);
  }
  
  /**
   * Set the current scene context
   */
  setSceneContext(sceneObject) {
    this.sendMessage('setSceneContext', {
      scene: sceneObject.scene,
      camera: sceneObject.camera,
      renderer: sceneObject.renderer
    });
  }
  
  // ===== Private Methods =====
  
  /**
   * Create the iframe element
   */
  _createIframe() {
    this.iframe = document.createElement('iframe');
    this.iframe.id = 'sequenceBuilderFrame';
    this.iframe.src = this.options.builderUrl;
    this.iframe.style.cssText = `
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      border: none;
      z-index: 10000;
    `;
    this.iframe.setAttribute('allow', 'clipboard-write');
    
    // Add hint overlay
    const hint = document.createElement('div');
    hint.className = 'keyboard-hint';
    hint.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10001;
      color: #3498db;
      font-size: 12px;
      background: rgba(0,0,0,0.9);
      padding: 10px 20px;
      border-radius: 6px;
      pointer-events: none;
      border: 1px solid #3498db;
      box-shadow: 0 4px 16px rgba(52, 152, 219, 0.3);
    `;
    hint.innerHTML = `
      Press <kbd style="background: #2c3e50; padding: 4px 10px; border-radius: 4px; font-family: 'Consolas', monospace; border: 1px solid #3498db; color: #3498db; font-weight: 600;">\\</kbd> to toggle sequence builder | 
      <kbd style="background: #2c3e50; padding: 4px 10px; border-radius: 4px; font-family: 'Consolas', monospace; border: 1px solid #e74c3c; color: #e74c3c; font-weight: 600;">ESC</kbd> to close
    `;
    
    this.container.appendChild(this.iframe);
    this.container.appendChild(hint);
    
    console.log('✅ SequenceBuilder iframe created');
  }
  
  /**
   * Handle messages from the iframe
   */
  _handleMessage(event) {
    const { type, data } = event.data || {};
    
    switch (type) {
      case 'closeSequenceBuilder':
        this.close();
        break;
        
      case 'sequenceExport':
        this._handleSequenceExport(data);
        break;
        
      case 'builderReady':
        console.log('✅ SequenceBuilder iframe ready');
        this._dispatchEvent('builder:ready');
        break;
        
      default:
        // Unknown message type
        break;
    }
  }
  
  /**
   * Handle sequence export from builder
   */
  _handleSequenceExport(data) {
    console.log('📦 Sequence exported:', data);
    this._dispatchEvent('builder:export', data);
  }
  
  /**
   * Dispatch a custom event
   */
  _dispatchEvent(name, detail = {}) {
    const event = new CustomEvent(name, { detail, bubbles: true });
    window.dispatchEvent(event);
  }
}

/**
 * Create and initialize a global sequence builder instance
 * This provides backward compatibility with existing code
 */
export async function initGlobalSequenceBuilder(options = {}) {
  if (window._globalSequenceBuilder) {
    console.warn('Global SequenceBuilder already initialized');
    return window._globalSequenceBuilder;
  }
  
  const builder = new SequenceBuilder(options);
  await builder.init();
  
  // Expose globally
  window._globalSequenceBuilder = builder;
  window.openSequenceBuilder = () => builder.open();
  window.closeSequenceBuilder = () => builder.close();
  window.toggleSequenceBuilder = () => builder.toggle();
  
  console.log('✅ Global SequenceBuilder functions registered');
  return builder;
}

/**
 * FUTURE MODULARIZATION ROADMAP:
 * 
 * Phase 1: Extract Core Classes (Current)
 * - [x] Create SequenceBuilder wrapper module
 * - [ ] Extract UnifiedSequenceBuilder class to UnifiedSequenceBuilder.js
 * - [ ] Extract SceneViewport class to SceneViewport.js
 * - [ ] Extract GlitchVideoPlayer class to GlitchVideoPlayer.js
 * 
 * Phase 2: Modularize UI Components
 * - [ ] Extract AssetManager component
 * - [ ] Extract TimelineEditor component
 * - [ ] Extract DialogueEditor component
 * - [ ] Extract Inspector component
 * - [ ] Extract CodePreview component
 * 
 * Phase 3: Modularize Data Layer
 * - [ ] Create SequenceDataModel.js (stores sequence state)
 * - [ ] Create AssetRegistry.js (manages scene assets)
 * - [ ] Create TimelineModel.js (manages timeline data)
 * 
 * Phase 4: Remove Iframe Dependency
 * - [ ] Convert HTML structure to template strings
 * - [ ] Use direct DOM manipulation instead of iframe
 * - [ ] Implement proper CSS module loading
 * 
 * Phase 5: Integration & Testing
 * - [ ] Update index.html to use modular builder
 * - [ ] Test overlay mode with live scenes
 * - [ ] Test standalone mode
 * - [ ] Document API and usage patterns
 */

export default SequenceBuilder;

