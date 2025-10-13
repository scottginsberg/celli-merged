/**
 * Fullhand Scene - Ported from merged2.html
 * 
 * Features:
 * - Voxel hand with articulated fingers
 * - Keyboard with keys
 * - Character voxel person
 * - Glowing head/halo effect
 * - Interactive animations
 * - Typing simulation
 */

import * as THREE from 'three';

export class FullhandScene {
  constructor() {
    this.name = 'Fullhand';
    
    this.state = {
      scene: null,
      camera: null,
      renderer: null,
      
      // Objects
      hand: null,
      keyboard: null,
      character: null,
      halo: null,
      
      // Voxels
      handVoxels: [],
      keyboardKeys: [],
      characterVoxels: [],
      
      // Animation
      fingerPositions: [],
      typing: false,
      typingInterval: null,
      
      // State
      running: false,
      
      // Callbacks
      onComplete: null
    };
  }

  /**
   * Initialize scene
   */
  async init() {
    console.log('✋ Initializing Fullhand Scene...');
    
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
    this.state.scene.background = new THREE.Color(0x0a0a0a);
    
    // Create camera
    this.state.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.state.camera.position.set(0, 5, 10);
    this.state.camera.lookAt(0, 0, 0);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.state.scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x00ff88, 1, 50);
    pointLight.position.set(5, 5, 5);
    this.state.scene.add(pointLight);
    
    // Create objects
    this._createHand();
    this._createKeyboard();
    this._createCharacter();
    this._createHalo();
    
    // Handle resize
    window.addEventListener('resize', () => this._handleResize());
    
    console.log('✅ Fullhand Scene initialized');
  }

  /**
   * Create voxel hand
   */
  _createHand() {
    this.state.hand = new THREE.Group();
    
    const voxelSize = 0.2;
    const voxelGeo = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize);
    const voxelMat = new THREE.MeshPhongMaterial({ 
      color: 0xffffff,
      emissive: 0x222222
    });
    
    // Hand data (simplified): palm + 5 fingers
    const handStructure = {
      palm: [
        [0, 0, 0], [0, 0, 1], [0, 0, 2],
        [1, 0, 0], [1, 0, 1], [1, 0, 2],
        [2, 0, 0], [2, 0, 1], [2, 0, 2]
      ],
      fingers: [
        // Thumb
        { base: [0, 1, 1], segments: [[0, 2, 1], [0, 3, 1]] },
        // Index
        { base: [0, 1, 0], segments: [[0, 2, 0], [0, 3, 0], [0, 4, 0]] },
        // Middle
        { base: [1, 1, 0], segments: [[1, 2, 0], [1, 3, 0], [1, 4, 0], [1, 5, 0]] },
        // Ring
        { base: [2, 1, 0], segments: [[2, 2, 0], [2, 3, 0], [2, 4, 0]] },
        // Pinky
        { base: [2, 1, 1], segments: [[2, 2, 1], [2, 3, 1]] }
      ]
    };
    
    // Create palm voxels
    handStructure.palm.forEach(([x, y, z]) => {
      const voxel = new THREE.Mesh(voxelGeo, voxelMat.clone());
      voxel.position.set(x * voxelSize, y * voxelSize, z * voxelSize);
      this.state.hand.add(voxel);
      this.state.handVoxels.push(voxel);
    });
    
    // Create finger voxels
    handStructure.fingers.forEach((finger) => {
      // Base
      const [x, y, z] = finger.base;
      const baseVoxel = new THREE.Mesh(voxelGeo, voxelMat.clone());
      baseVoxel.position.set(x * voxelSize, y * voxelSize, z * voxelSize);
      this.state.hand.add(baseVoxel);
      this.state.handVoxels.push(baseVoxel);
      
      // Segments
      finger.segments.forEach(([sx, sy, sz]) => {
        const segmentVoxel = new THREE.Mesh(voxelGeo, voxelMat.clone());
        segmentVoxel.position.set(sx * voxelSize, sy * voxelSize, sz * voxelSize);
        this.state.hand.add(segmentVoxel);
        this.state.handVoxels.push(segmentVoxel);
      });
    });
    
    this.state.hand.position.set(-3, 1, 0);
    this.state.scene.add(this.state.hand);
    
    console.log(`✋ Created hand with ${this.state.handVoxels.length} voxels`);
  }

  /**
   * Create keyboard
   */
  _createKeyboard() {
    this.state.keyboard = new THREE.Group();
    
    const keySize = 0.15;
    const keyGeo = new THREE.BoxGeometry(keySize, 0.05, keySize);
    const keyMat = new THREE.MeshPhongMaterial({ 
      color: 0x333333,
      emissive: 0x111111
    });
    
    // Simplified keyboard layout (4 rows)
    const rows = 4;
    const keysPerRow = 10;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < keysPerRow; col++) {
        const key = new THREE.Mesh(keyGeo, keyMat.clone());
        key.position.set(
          (col - keysPerRow / 2) * (keySize + 0.02),
          0,
          (row - rows / 2) * (keySize + 0.02)
        );
        this.state.keyboard.add(key);
        this.state.keyboardKeys.push(key);
      }
    }
    
    this.state.keyboard.position.set(0, 0, 0);
    this.state.scene.add(this.state.keyboard);
    
    console.log(`⌨️ Created keyboard with ${this.state.keyboardKeys.length} keys`);
  }

  /**
   * Create character (voxel person)
   */
  _createCharacter() {
    this.state.character = new THREE.Group();
    
    const voxelSize = 0.2;
    const voxelGeo = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize);
    const voxelMat = new THREE.MeshPhongMaterial({ 
      color: 0xffffff,
      emissive: 0x222222
    });
    
    // Character structure: head, body, arms, legs
    const characterStructure = {
      head: [
        [0, 5, 0], [1, 5, 0],
        [0, 6, 0], [1, 6, 0]
      ],
      body: [
        [0, 3, 0], [1, 3, 0],
        [0, 4, 0], [1, 4, 0]
      ],
      arms: [
        [-1, 4, 0], [2, 4, 0],
        [-1, 3, 0], [2, 3, 0]
      ],
      legs: [
        [0, 2, 0], [1, 2, 0],
        [0, 1, 0], [1, 1, 0],
        [0, 0, 0], [1, 0, 0]
      ]
    };
    
    // Create all body parts
    Object.values(characterStructure).flat().forEach(([x, y, z]) => {
      const voxel = new THREE.Mesh(voxelGeo, voxelMat.clone());
      voxel.position.set(x * voxelSize, y * voxelSize, z * voxelSize);
      this.state.character.add(voxel);
      this.state.characterVoxels.push(voxel);
    });
    
    this.state.character.position.set(3, 0, 0);
    this.state.scene.add(this.state.character);
    
    console.log(`🧍 Created character with ${this.state.characterVoxels.length} voxels`);
  }

  /**
   * Create glowing halo
   */
  _createHalo() {
    const haloGeo = new THREE.TorusGeometry(0.5, 0.05, 16, 32);
    const haloMat = new THREE.MeshBasicMaterial({ 
      color: 0xffff00,
      transparent: true,
      opacity: 0.8
    });
    
    this.state.halo = new THREE.Mesh(haloGeo, haloMat);
    this.state.halo.position.set(3.1, 1.6, 0);
    this.state.halo.rotation.x = Math.PI / 2;
    
    this.state.scene.add(this.state.halo);
    
    console.log('😇 Created halo');
  }

  /**
   * Start typing animation
   */
  _startTyping() {
    if (this.state.typing) return;
    
    this.state.typing = true;
    
    // Animate random keys being pressed
    this.state.typingInterval = setInterval(() => {
      if (!this.state.running) {
        this._stopTyping();
        return;
      }
      
      const randomKey = this.state.keyboardKeys[
        Math.floor(Math.random() * this.state.keyboardKeys.length)
      ];
      
      // Press animation
      randomKey.position.y = -0.02;
      setTimeout(() => {
        randomKey.position.y = 0;
      }, 100);
      
      // Move finger (simulate typing)
      if (this.state.hand) {
        this.state.hand.rotation.z = (Math.random() - 0.5) * 0.1;
      }
    }, 200);
    
    console.log('⌨️ Started typing animation');
  }

  /**
   * Stop typing animation
   */
  _stopTyping() {
    if (this.state.typingInterval) {
      clearInterval(this.state.typingInterval);
      this.state.typingInterval = null;
    }
    this.state.typing = false;
  }

  /**
   * Start scene
   */
  async start() {
    console.log('▶️ Starting Fullhand Scene');
    this.state.running = true;
    
    // Start typing animation
    this._startTyping();
  }

  /**
   * Update scene
   */
  update(deltaTime, totalTime) {
    if (!this.state.running) return;
    
    // Animate halo rotation
    if (this.state.halo) {
      this.state.halo.rotation.z += 0.01;
    }
    
    // Gentle camera movement
    if (this.state.camera) {
      this.state.camera.position.x = Math.sin(totalTime * 0.0005) * 2;
      this.state.camera.lookAt(0, 2, 0);
    }
    
    // Pulse hand voxels
    this.state.handVoxels.forEach((voxel, i) => {
      const scale = 1 + Math.sin(totalTime * 0.003 + i * 0.2) * 0.05;
      voxel.scale.set(scale, scale, scale);
    });
    
    // Render
    if (this.state.renderer && this.state.scene && this.state.camera) {
      this.state.renderer.render(this.state.scene, this.state.camera);
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
    console.log('⏹️ Stopping Fullhand Scene');
    this.state.running = false;
    this._stopTyping();
  }

  /**
   * Destroy scene
   */
  destroy() {
    this.stop();
    
    // Dispose geometries and materials
    this.state.handVoxels.forEach(voxel => {
      voxel.geometry.dispose();
      voxel.material.dispose();
    });
    
    this.state.keyboardKeys.forEach(key => {
      key.geometry.dispose();
      key.material.dispose();
    });
    
    this.state.characterVoxels.forEach(voxel => {
      voxel.geometry.dispose();
      voxel.material.dispose();
    });
    
    if (this.state.halo) {
      this.state.halo.geometry.dispose();
      this.state.halo.material.dispose();
    }
    
    // Dispose renderer
    if (this.state.renderer) {
      this.state.renderer.dispose();
      if (this.state.renderer.domElement.parentNode) {
        this.state.renderer.domElement.parentNode.removeChild(this.state.renderer.domElement);
      }
    }
    
    console.log('🗑️ Fullhand Scene destroyed');
  }
}

export default FullhandScene;


