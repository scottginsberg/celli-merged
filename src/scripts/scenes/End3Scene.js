/**
 * End3 Scene - Ported from merged2.html
 * 
 * Terminal crawl/credits scene:
 * - Scrolling text crawl
 * - Star Wars-style perspective
 * - Credits display
 * - Terminal aesthetic
 * - Fade to next scene
 */

import * as THREE from 'three';

export class End3Scene {
  constructor() {
    this.name = 'End3';
    
    this.state = {
      scene: null,
      camera: null,
      renderer: null,
      
      // Text elements
      textSprites: [],
      crawlSpeed: 0.01,
      scrollPosition: 0,
      
      // Content
      crawlText: [
        '',
        '',
        'CELLI',
        '',
        'A spreadsheet reality',
        '',
        'where formulas',
        'become worlds',
        '',
        '* * *',
        '',
        'Thank you for exploring',
        '',
        'Created by Loomworks',
        '',
        'Made with Three.js',
        'And a lot of R',
        '',
        '* * *',
        '',
        'Press any key',
        'to continue...',
        ''
      ],
      
      // State
      running: false,
      completed: false,
      
      // Callbacks
      onComplete: null
    };
  }

  /**
   * Initialize scene
   */
  async init() {
    console.log('🎬 Initializing End3 Scene...');
    
    const app = document.getElementById('app');
    if (!app) return;
    
    // Create renderer
    this.state.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    this.state.renderer.setSize(window.innerWidth, window.innerHeight);
    this.state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    app.appendChild(this.state.renderer.domElement);
    
    // Create scene
    this.state.scene = new THREE.Scene();
    this.state.scene.background = new THREE.Color(0x000000);
    this.state.scene.fog = new THREE.Fog(0x000000, 10, 50);
    
    // Create camera with perspective for crawl
    this.state.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.state.camera.position.set(0, -2, 5);
    this.state.camera.rotation.x = Math.PI / 6; // Look down slightly
    
    // Create text sprites
    this._createTextCrawl();
    
    // Handle resize
    window.addEventListener('resize', () => this._handleResize());
    
    // Handle keypress to skip
    this._setupSkipHandler();
    
    console.log('✅ End3 Scene initialized');
  }

  /**
   * Create text crawl sprites
   */
  _createTextCrawl() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 128;
    
    this.state.crawlText.forEach((line, index) => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw text
      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(line, canvas.width / 2, canvas.height / 2);
      
      // Create texture
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      
      // Create sprite material
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 1.0
      });
      
      // Create sprite
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(8, 2, 1);
      
      // Position in crawl sequence
      const spacing = 2.5;
      sprite.position.set(0, -(index * spacing), -10);
      
      this.state.scene.add(sprite);
      this.state.textSprites.push(sprite);
    });
    
    console.log(`📜 Created ${this.state.textSprites.length} text sprites for crawl`);
  }

  /**
   * Setup skip handler
   */
  _setupSkipHandler() {
    const handler = (e) => {
      if (this.state.running && !this.state.completed) {
        console.log('⏩ Skipping End3 crawl');
        this._complete();
      }
    };
    
    document.addEventListener('keydown', handler);
    document.addEventListener('click', handler);
    
    // Store for cleanup
    this._skipHandler = handler;
  }

  /**
   * Start scene
   */
  async start() {
    console.log('▶️ Starting End3 Scene');
    this.state.running = true;
    this.state.scrollPosition = 0;
    this.state.completed = false;
  }

  /**
   * Update scene
   */
  update(deltaTime) {
    if (!this.state.running) return;
    
    // Scroll text upward
    this.state.scrollPosition += this.state.crawlSpeed * deltaTime * 60;
    
    // Update sprite positions
    this.state.textSprites.forEach((sprite, index) => {
      const spacing = 2.5;
      sprite.position.y = -(index * spacing) + this.state.scrollPosition;
      
      // Fade based on distance
      const distanceFromCamera = Math.abs(sprite.position.y - this.state.camera.position.y);
      const fadeStart = 20;
      const fadeEnd = 30;
      
      if (distanceFromCamera > fadeStart) {
        sprite.material.opacity = 1 - Math.min((distanceFromCamera - fadeStart) / (fadeEnd - fadeStart), 1);
      } else {
        sprite.material.opacity = 1.0;
      }
    });
    
    // Check if complete (all text scrolled)
    const lastSprite = this.state.textSprites[this.state.textSprites.length - 1];
    if (lastSprite && lastSprite.position.y > 30) {
      this._complete();
    }
    
    // Render
    if (this.state.renderer && this.state.scene && this.state.camera) {
      this.state.renderer.render(this.state.scene, this.state.camera);
    }
  }

  /**
   * Complete scene
   */
  _complete() {
    if (this.state.completed) return;
    
    this.state.completed = true;
    console.log('✅ End3 Scene complete');
    
    if (this.state.onComplete) {
      this.state.onComplete();
    }
  }

  /**
   * Handle window resize
   */
  _handleResize() {
    if (!this.state.camera || !this.state.renderer) return;
    
    this.state.camera.aspect = window.innerWidth / window.innerHeight;
    this.state.camera.updateProjectionMatrix();
    
    this.state.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Stop scene
   */
  stop() {
    console.log('⏹️ Stopping End3 Scene');
    this.state.running = false;
    
    // Remove skip handler
    if (this._skipHandler) {
      document.removeEventListener('keydown', this._skipHandler);
      document.removeEventListener('click', this._skipHandler);
    }
  }

  /**
   * Destroy scene
   */
  destroy() {
    this.stop();
    
    // Dispose sprites
    this.state.textSprites.forEach(sprite => {
      if (sprite.material.map) sprite.material.map.dispose();
      sprite.material.dispose();
      this.state.scene.remove(sprite);
    });
    this.state.textSprites = [];
    
    // Dispose renderer
    if (this.state.renderer) {
      this.state.renderer.dispose();
      if (this.state.renderer.domElement.parentNode) {
        this.state.renderer.domElement.parentNode.removeChild(this.state.renderer.domElement);
      }
    }
    
    console.log('🗑️ End3 Scene destroyed');
  }

  /**
   * Set completion callback
   */
  onCompleteCallback(callback) {
    this.state.onComplete = callback;
  }
}

export default End3Scene;


