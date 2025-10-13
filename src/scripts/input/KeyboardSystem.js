/**
 * KeyboardSystem - 3D Keyboard Visualization
 * 
 * Manages a 3D keyboard that works with the hand system:
 * - Visual 3D keyboard in the scene
 * - Key press animations
 * - Integration with formula input
 * - Interactive typing visualization
 * 
 * This is extracted/reconstructed from merged2.html's execution environment
 */

import * as THREE from 'three';

export class KeyboardSystem {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    
    this.state = {
      // Keyboard components
      keyboardGroup: null,
      keys: new Map(), // keyCode -> mesh
      
      // Layout
      layout: this._getQWERTYLayout(),
      keySize: 0.5,
      keyGap: 0.05,
      
      // Animation
      pressedKeys: new Set(),
      keyAnimations: new Map(), // keyCode -> animation state
      
      // Position
      position: new THREE.Vector3(0, -2, -4),
      rotation: new THREE.Euler(-Math.PI / 6, 0, 0),
      
      // Visual
      baseColor: 0x2a2a3a,
      highlightColor: 0x4a7cff,
      textColor: 0xe0e0e0,
      
      // Interaction
      visible: false,
      
      // Callbacks
      onKeyPress: null,
      onKeyRelease: null
    };
  }

  /**
   * Get QWERTY layout
   */
  _getQWERTYLayout() {
    return [
      // Row 1 (numbers)
      ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
      // Row 2 (QWERTY)
      ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
      // Row 3 (ASDF)
      ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
      // Row 4 (ZXCV)
      ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
      // Row 5 (Space)
      ['Ctrl', 'Alt', 'Space', 'Alt', 'Ctrl']
    ];
  }

  /**
   * Initialize keyboard
   */
  async init() {
    console.log('[KeyboardSystem] Initializing...');
    
    // Create keyboard group
    this.state.keyboardGroup = new THREE.Group();
    this.state.keyboardGroup.position.copy(this.state.position);
    this.state.keyboardGroup.rotation.copy(this.state.rotation);
    
    // Build keyboard
    this._buildKeyboard();
    
    // Add to scene
    this.scene.add(this.state.keyboardGroup);
    
    // Initially hidden
    this.state.keyboardGroup.visible = this.state.visible;
    
    // Setup keyboard listeners
    this._setupKeyboardListeners();
    
    console.log('[KeyboardSystem] Initialized with', this.state.keys.size, 'keys');
    return true;
  }

  /**
   * Build keyboard geometry
   */
  _buildKeyboard() {
    const keySize = this.state.keySize;
    const gap = this.state.keyGap;
    
    let yOffset = 0;
    
    this.state.layout.forEach((row, rowIndex) => {
      let xOffset = 0;
      
      row.forEach((keyLabel, keyIndex) => {
        // Key width (some keys are wider)
        let keyWidth = keySize;
        if (keyLabel === 'Backspace') keyWidth = keySize * 2;
        else if (keyLabel === 'Tab') keyWidth = keySize * 1.5;
        else if (keyLabel === 'Caps') keyWidth = keySize * 1.75;
        else if (keyLabel === 'Enter') keyWidth = keySize * 2.25;
        else if (keyLabel === 'Shift') keyWidth = keySize * 2.5;
        else if (keyLabel === 'Space') keyWidth = keySize * 6;
        else if (keyLabel === 'Ctrl' || keyLabel === 'Alt') keyWidth = keySize * 1.25;
        
        // Create key
        const key = this._createKey(keyLabel, keyWidth, keySize);
        key.position.set(xOffset + keyWidth / 2, yOffset, 0);
        
        this.state.keyboardGroup.add(key);
        this.state.keys.set(keyLabel, key);
        
        xOffset += keyWidth + gap;
      });
      
      yOffset -= keySize + gap;
    });
    
    // Add base plate
    const plateWidth = 8;
    const plateHeight = 3.5;
    const plateGeo = new THREE.BoxGeometry(plateWidth, plateHeight, 0.2);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2a,
      roughness: 0.6,
      metalness: 0.3
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.set(plateWidth / 2 - 0.5, -plateHeight / 2, -0.15);
    this.state.keyboardGroup.add(plate);
    
    console.log('[KeyboardSystem] Built keyboard layout');
  }

  /**
   * Create a key
   */
  _createKey(label, width, height) {
    const keyGroup = new THREE.Group();
    
    // Key cap
    const capGeo = new THREE.BoxGeometry(width - 0.05, height - 0.05, 0.1);
    const capMat = new THREE.MeshStandardMaterial({
      color: this.state.baseColor,
      roughness: 0.4,
      metalness: 0.2
    });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.z = 0.05;
    keyGroup.add(cap);
    
    // Key label (text)
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Draw text
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(0, 0, 128, 128);
    
    ctx.fillStyle = '#e0e0e0';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Truncate long labels
    const displayLabel = label.length > 5 ? label.substring(0, 5) : label;
    ctx.fillText(displayLabel, 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    const labelMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true
    });
    const labelGeo = new THREE.PlaneGeometry(width - 0.1, height - 0.1);
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.z = 0.11;
    keyGroup.add(labelMesh);
    
    // Store references
    keyGroup.userData = {
      label,
      cap,
      labelMesh,
      pressed: false,
      baseZ: 0.05,
      pressedZ: 0.02
    };
    
    return keyGroup;
  }

  /**
   * Setup keyboard listeners
   */
  _setupKeyboardListeners() {
    document.addEventListener('keydown', (e) => {
      this._handleKeyDown(e);
    });
    
    document.addEventListener('keyup', (e) => {
      this._handleKeyUp(e);
    });
  }

  /**
   * Handle key down
   */
  _handleKeyDown(event) {
    if (!this.state.visible) return;
    
    const key = this._normalizeKey(event.key);
    if (!key) return;
    
    // Prevent duplicates
    if (this.state.pressedKeys.has(key)) return;
    
    this.state.pressedKeys.add(key);
    this._animateKeyPress(key);
    
    if (this.state.onKeyPress) {
      this.state.onKeyPress(key, event);
    }
  }

  /**
   * Handle key up
   */
  _handleKeyUp(event) {
    if (!this.state.visible) return;
    
    const key = this._normalizeKey(event.key);
    if (!key) return;
    
    this.state.pressedKeys.delete(key);
    this._animateKeyRelease(key);
    
    if (this.state.onKeyRelease) {
      this.state.onKeyRelease(key, event);
    }
  }

  /**
   * Normalize key name
   */
  _normalizeKey(key) {
    // Map event.key to our keyboard layout
    if (key === ' ') return 'Space';
    if (key === 'Control') return 'Ctrl';
    if (key === 'CapsLock') return 'Caps';
    if (key.length === 1) return key.toUpperCase();
    return key;
  }

  /**
   * Animate key press
   */
  _animateKeyPress(keyLabel) {
    const keyMesh = this.state.keys.get(keyLabel);
    if (!keyMesh) return;
    
    const userData = keyMesh.userData;
    userData.pressed = true;
    
    // Animate cap moving down
    const startTime = performance.now();
    const duration = 100;
    
    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      
      // Move cap down
      const t = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      userData.cap.position.z = userData.baseZ - (userData.baseZ - userData.pressedZ) * t;
      
      // Change color
      const color = new THREE.Color(this.state.baseColor);
      color.lerp(new THREE.Color(this.state.highlightColor), t);
      userData.cap.material.color.copy(color);
      
      if (progress < 1.0) {
        this.state.keyAnimations.set(keyLabel, requestAnimationFrame(animate));
      }
    };
    
    animate();
  }

  /**
   * Animate key release
   */
  _animateKeyRelease(keyLabel) {
    const keyMesh = this.state.keys.get(keyLabel);
    if (!keyMesh) return;
    
    const userData = keyMesh.userData;
    userData.pressed = false;
    
    // Cancel press animation if running
    if (this.state.keyAnimations.has(keyLabel)) {
      cancelAnimationFrame(this.state.keyAnimations.get(keyLabel));
      this.state.keyAnimations.delete(keyLabel);
    }
    
    // Animate cap moving up
    const startTime = performance.now();
    const duration = 150;
    
    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      
      // Move cap up
      const t = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      const currentZ = userData.cap.position.z;
      userData.cap.position.z = currentZ + (userData.baseZ - currentZ) * t;
      
      // Restore color
      const color = userData.cap.material.color;
      color.lerp(new THREE.Color(this.state.baseColor), t);
      
      if (progress < 1.0) {
        this.state.keyAnimations.set(keyLabel, requestAnimationFrame(animate));
      } else {
        this.state.keyAnimations.delete(keyLabel);
      }
    };
    
    animate();
  }

  /**
   * Programmatically press key (visual only)
   */
  pressKey(keyLabel) {
    this._animateKeyPress(keyLabel);
    
    setTimeout(() => {
      this._animateKeyRelease(keyLabel);
    }, 200);
  }

  /**
   * Type string (visual animation)
   */
  async typeString(text, delay = 100) {
    for (let char of text) {
      const key = this._normalizeKey(char);
      if (key) {
        this.pressKey(key);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Show keyboard
   */
  show() {
    if (this.state.keyboardGroup) {
      this.state.keyboardGroup.visible = true;
      this.state.visible = true;
      console.log('[KeyboardSystem] Keyboard visible');
    }
  }

  /**
   * Hide keyboard
   */
  hide() {
    if (this.state.keyboardGroup) {
      this.state.keyboardGroup.visible = false;
      this.state.visible = false;
      console.log('[KeyboardSystem] Keyboard hidden');
    }
  }

  /**
   * Set position
   */
  setPosition(x, y, z) {
    if (this.state.keyboardGroup) {
      this.state.keyboardGroup.position.set(x, y, z);
      this.state.position.set(x, y, z);
    }
  }

  /**
   * Set rotation
   */
  setRotation(x, y, z) {
    if (this.state.keyboardGroup) {
      this.state.keyboardGroup.rotation.set(x, y, z);
      this.state.rotation.set(x, y, z);
    }
  }

  /**
   * Update (called each frame)
   */
  update(deltaTime) {
    if (!this.state.keyboardGroup || !this.state.visible) return;
    
    // Idle animation
    const time = performance.now() * 0.001;
    const float = Math.sin(time * 0.5) * 0.02;
    this.state.keyboardGroup.position.y = this.state.position.y + float;
  }

  /**
   * Set callbacks
   */
  setCallbacks(callbacks) {
    if (callbacks.onKeyPress) this.state.onKeyPress = callbacks.onKeyPress;
    if (callbacks.onKeyRelease) this.state.onKeyRelease = callbacks.onKeyRelease;
  }

  /**
   * Destroy
   */
  destroy() {
    // Cancel all animations
    this.state.keyAnimations.forEach(id => cancelAnimationFrame(id));
    this.state.keyAnimations.clear();
    
    if (this.state.keyboardGroup) {
      // Dispose geometries and materials
      this.state.keyboardGroup.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (obj.material.map) obj.material.map.dispose();
          obj.material.dispose();
        }
      });
      
      this.scene.remove(this.state.keyboardGroup);
      this.state.keyboardGroup = null;
    }
    
    this.state.keys.clear();
    
    console.log('[KeyboardSystem] Destroyed');
  }
}

export default KeyboardSystem;

