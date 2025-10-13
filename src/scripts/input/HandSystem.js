/**
 * HandSystem - 3D Hand for Formula Execution
 * 
 * Manages a 3D hand model that can be used for:
 * - Gesture-based formula execution
 * - Interactive cell manipulation
 * - Visual feedback for actions
 * 
 * This is extracted/reconstructed from merged2.html's execution environment
 */

import * as THREE from 'three';

export class HandSystem {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    
    this.state = {
      // Hand components
      handGroup: null,
      palm: null,
      fingers: [],
      
      // Animation
      animating: false,
      currentGesture: null,
      gestureProgress: 0,
      
      // Position
      position: new THREE.Vector3(0, 0, -5),
      rotation: new THREE.Euler(0, 0, 0),
      
      // Interaction
      targetCell: null,
      pointing: false,
      grabbing: false,
      
      // Gestures
      gestures: {
        point: { name: 'point', duration: 300 },
        grab: { name: 'grab', duration: 400 },
        release: { name: 'release', duration: 300 },
        execute: { name: 'execute', duration: 500 },
        swipe: { name: 'swipe', duration: 600 }
      },
      
      // Callbacks
      onGestureComplete: null,
      onCellInteract: null,
      
      // Visibility
      visible: false
    };
    
    // Gesture definitions
    this.gestureDefinitions = {
      point: {
        fingerRotations: [
          { curl: 0, spread: 0 },    // Index extended
          { curl: Math.PI/2, spread: 0 },  // Middle curled
          { curl: Math.PI/2, spread: 0 },  // Ring curled
          { curl: Math.PI/2, spread: 0 }   // Pinky curled
        ]
      },
      grab: {
        fingerRotations: [
          { curl: Math.PI/2, spread: 0.2 },
          { curl: Math.PI/2, spread: 0.1 },
          { curl: Math.PI/2, spread: 0 },
          { curl: Math.PI/2, spread: -0.1 }
        ]
      },
      release: {
        fingerRotations: [
          { curl: 0, spread: 0.3 },
          { curl: 0, spread: 0.1 },
          { curl: 0, spread: 0 },
          { curl: 0, spread: -0.1 }
        ]
      }
    };
  }

  /**
   * Initialize hand model
   */
  async init() {
    console.log('[HandSystem] Initializing...');
    
    // Create hand group
    this.state.handGroup = new THREE.Group();
    this.state.handGroup.position.copy(this.state.position);
    this.state.handGroup.rotation.copy(this.state.rotation);
    
    // Build hand geometry
    this._buildHand();
    
    // Add to scene
    this.scene.add(this.state.handGroup);
    
    // Initially hidden
    this.state.handGroup.visible = this.state.visible;
    
    console.log('[HandSystem] Initialized');
    return true;
  }

  /**
   * Build hand geometry
   */
  _buildHand() {
    // Palm
    const palmGeo = new THREE.BoxGeometry(1, 0.3, 1.5);
    const palmMat = new THREE.MeshStandardMaterial({
      color: 0xffd4a3,
      roughness: 0.8,
      metalness: 0.1
    });
    this.state.palm = new THREE.Mesh(palmGeo, palmMat);
    this.state.handGroup.add(this.state.palm);
    
    // Fingers
    const fingerConfigs = [
      { x: -0.35, y: 0, z: -0.6, name: 'pinky' },
      { x: -0.12, y: 0, z: -0.7, name: 'ring' },
      { x: 0.12, y: 0, z: -0.75, name: 'middle' },
      { x: 0.35, y: 0, z: -0.7, name: 'index' }
    ];
    
    fingerConfigs.forEach(config => {
      const finger = this._createFinger();
      finger.position.set(config.x, config.y, config.z);
      finger.userData.name = config.name;
      this.state.palm.add(finger);
      this.state.fingers.push(finger);
    });
    
    // Thumb (different positioning)
    const thumb = this._createFinger(0.8); // Shorter
    thumb.position.set(0.6, 0, 0);
    thumb.rotation.z = Math.PI / 4;
    thumb.userData.name = 'thumb';
    this.state.palm.add(thumb);
    this.state.fingers.push(thumb);
    
    console.log('[HandSystem] Built hand with', this.state.fingers.length, 'fingers');
  }

  /**
   * Create a finger
   */
  _createFinger(length = 1.0) {
    const fingerGroup = new THREE.Group();
    
    // Segments
    const segmentLengths = [0.4, 0.35, 0.25].map(l => l * length);
    const segmentGeo = new THREE.CylinderGeometry(0.08, 0.08, 1, 8);
    const segmentMat = new THREE.MeshStandardMaterial({
      color: 0xffd4a3,
      roughness: 0.8,
      metalness: 0.1
    });
    
    let currentY = 0;
    segmentLengths.forEach((len, idx) => {
      const segment = new THREE.Mesh(segmentGeo, segmentMat);
      segment.scale.y = len;
      segment.position.y = currentY - len / 2;
      segment.userData.segmentIndex = idx;
      fingerGroup.add(segment);
      currentY -= len;
    });
    
    fingerGroup.userData.segments = segmentLengths.length;
    fingerGroup.userData.baseRotation = new THREE.Euler();
    
    return fingerGroup;
  }

  /**
   * Perform gesture
   */
  async performGesture(gestureName) {
    if (this.state.animating) {
      console.warn('[HandSystem] Already animating, skipping gesture:', gestureName);
      return;
    }
    
    const gesture = this.state.gestures[gestureName];
    if (!gesture) {
      console.warn('[HandSystem] Unknown gesture:', gestureName);
      return;
    }
    
    console.log('[HandSystem] Performing gesture:', gestureName);
    
    this.state.animating = true;
    this.state.currentGesture = gestureName;
    this.state.gestureProgress = 0;
    
    const startTime = performance.now();
    const duration = gesture.duration;
    
    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1.0);
        
        this.state.gestureProgress = progress;
        
        // Animate to gesture
        this._applyGestureAnimation(gestureName, progress);
        
        if (progress < 1.0) {
          requestAnimationFrame(animate);
        } else {
          this.state.animating = false;
          this.state.currentGesture = null;
          
          if (this.state.onGestureComplete) {
            this.state.onGestureComplete(gestureName);
          }
          
          resolve();
        }
      };
      
      animate();
    });
  }

  /**
   * Apply gesture animation
   */
  _applyGestureAnimation(gestureName, progress) {
    const definition = this.gestureDefinitions[gestureName];
    if (!definition) return;
    
    // Ease in-out
    const t = progress < 0.5 
      ? 2 * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    
    // Apply finger rotations
    this.state.fingers.forEach((finger, idx) => {
      if (idx >= definition.fingerRotations.length) return;
      
      const target = definition.fingerRotations[idx];
      const base = finger.userData.baseRotation;
      
      // Curl (rotate around X)
      finger.rotation.x = base.x + target.curl * t;
      
      // Spread (rotate around Y)
      finger.rotation.y = base.y + target.spread * t;
    });
  }

  /**
   * Point at cell
   */
  pointAtCell(cellPosition) {
    if (!this.state.handGroup) return;
    
    this.state.targetCell = cellPosition;
    this.state.pointing = true;
    
    // Look at cell
    this.state.handGroup.lookAt(cellPosition);
    
    // Perform point gesture
    this.performGesture('point');
  }

  /**
   * Grab cell
   */
  grabCell(cellPosition) {
    if (!this.state.handGroup) return;
    
    this.state.targetCell = cellPosition;
    this.state.grabbing = true;
    
    // Look at cell
    this.state.handGroup.lookAt(cellPosition);
    
    // Perform grab gesture
    this.performGesture('grab');
  }

  /**
   * Release
   */
  release() {
    this.state.grabbing = false;
    this.state.pointing = false;
    this.state.targetCell = null;
    
    // Perform release gesture
    this.performGesture('release');
  }

  /**
   * Execute formula gesture
   */
  async executeFormula() {
    console.log('[HandSystem] Executing formula gesture');
    
    // Quick sequence: point -> grab -> release
    await this.performGesture('point');
    await new Promise(resolve => setTimeout(resolve, 100));
    await this.performGesture('grab');
    await new Promise(resolve => setTimeout(resolve, 200));
    await this.performGesture('execute');
    await new Promise(resolve => setTimeout(resolve, 100));
    await this.performGesture('release');
    
    console.log('[HandSystem] Formula execution gesture complete');
  }

  /**
   * Show hand
   */
  show() {
    if (this.state.handGroup) {
      this.state.handGroup.visible = true;
      this.state.visible = true;
      console.log('[HandSystem] Hand visible');
    }
  }

  /**
   * Hide hand
   */
  hide() {
    if (this.state.handGroup) {
      this.state.handGroup.visible = false;
      this.state.visible = false;
      console.log('[HandSystem] Hand hidden');
    }
  }

  /**
   * Set position
   */
  setPosition(x, y, z) {
    if (this.state.handGroup) {
      this.state.handGroup.position.set(x, y, z);
      this.state.position.set(x, y, z);
    }
  }

  /**
   * Set rotation
   */
  setRotation(x, y, z) {
    if (this.state.handGroup) {
      this.state.handGroup.rotation.set(x, y, z);
      this.state.rotation.set(x, y, z);
    }
  }

  /**
   * Update (called each frame)
   */
  update(deltaTime) {
    if (!this.state.handGroup || !this.state.visible) return;
    
    // Idle animation when not gesturing
    if (!this.state.animating) {
      const time = performance.now() * 0.001;
      const breathe = Math.sin(time * 2) * 0.05;
      this.state.handGroup.position.y = this.state.position.y + breathe;
    }
  }

  /**
   * Set callbacks
   */
  setCallbacks(callbacks) {
    if (callbacks.onGestureComplete) this.state.onGestureComplete = callbacks.onGestureComplete;
    if (callbacks.onCellInteract) this.state.onCellInteract = callbacks.onCellInteract;
  }

  /**
   * Destroy
   */
  destroy() {
    if (this.state.handGroup) {
      // Dispose geometries and materials
      this.state.handGroup.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
      
      this.scene.remove(this.state.handGroup);
      this.state.handGroup = null;
    }
    
    this.state.fingers = [];
    this.state.palm = null;
    
    console.log('[HandSystem] Destroyed');
  }
}

export default HandSystem;

