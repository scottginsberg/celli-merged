/**
 * ExecutionEnvironment - Complete Hand/Keyboard/Character System
 * 
 * Full fidelity extraction from merged2.html
 * 
 * Includes:
 * - Bust (upper body character model)
 * - Boss Celli (large voxel head with glowing features)
 * - Deforming Finger Tube (tracks keyboard with IK)
 * - Detailed Keyboard (full QWERTY with labels)
 * - Advanced Lighting (per-key, spotlights, atmosphere)
 * - Dust Particles (floating, illuminated)
 */

import * as THREE from 'three';

export class ExecutionEnvironment {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    
    this.state = {
      // Components
      bust: null,
      bossHead: null,
      finger: null,
      keyboard: null,
      dustParticles: [],
      
      // Finger tracking
      fingerCurve: null,
      fingerTube: null,
      fingerTarget: new THREE.Vector3(),
      
      // Keyboard state
      keys: [],
      keyMap: new Map(),
      
      // Lighting
      keyLights: [],
      spotLight: null,
      rimLight: null,
      
      // Animation
      time: 0,
      typing: false,
      
      // Visibility
      visible: false
    };
  }

  /**
   * Initialize complete execution environment
   */
  async init() {
    console.log('[ExecutionEnvironment] 🎬 Initializing complete environment...');
    
    // Create components
    await this._createBust();
    await this._createBossHead();
    await this._createDeformingFinger();
    await this._createDetailedKeyboard();
    await this._createLighting();
    await this._createDustParticles();
    
    console.log('[ExecutionEnvironment] ✅ Complete environment initialized');
    return true;
  }

  /**
   * Create bust (upper body character model)
   */
  async _createBust() {
    console.log('[ExecutionEnvironment] Creating bust...');
    
    const bustGroup = new THREE.Group();
    bustGroup.name = 'Bust';
    
    // Torso (voxel-based, broader)
    const torsoGeo = new THREE.BoxGeometry(1.2, 1.5, 0.6);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: 0x4a7cff,
      roughness: 0.6,
      metalness: 0.2
    });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 0;
    torso.castShadow = true;
    bustGroup.add(torso);
    
    // Shoulders
    const shoulderGeo = new THREE.BoxGeometry(1.8, 0.4, 0.5);
    const shoulder = new THREE.Mesh(shoulderGeo, torsoMat.clone());
    shoulder.position.y = 0.7;
    shoulder.castShadow = true;
    bustGroup.add(shoulder);
    
    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.4, 16);
    const neck = new THREE.Mesh(neckGeo, torsoMat.clone());
    neck.position.y = 1.1;
    neck.castShadow = true;
    bustGroup.add(neck);
    
    bustGroup.position.set(0, -1, 0);
    this.scene.add(bustGroup);
    this.state.bust = bustGroup;
    
    console.log('[ExecutionEnvironment] ✅ Bust created');
  }

  /**
   * Create boss Celli head (large voxel head)
   */
  async _createBossHead() {
    console.log('[ExecutionEnvironment] Creating boss Celli head...');
    
    const headGroup = new THREE.Group();
    headGroup.name = 'BossCelliHead';
    
    // Large head (voxel cube, bigger scale)
    const headSize = 1.2; // Larger than normal
    const headGeo = new THREE.BoxGeometry(headSize, headSize, headSize * 0.8);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Amber
      roughness: 0.5,
      metalness: 0.2,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.3
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.5;
    head.castShadow = true;
    headGroup.add(head);
    
    // Eyes (glowing)
    const eyeGeo = new THREE.BoxGeometry(0.15, 0.25, 0.08);
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.3,
      metalness: 0.1,
      emissive: 0xffffff,
      emissiveIntensity: 0.8
    });
    
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat.clone());
    eyeL.position.set(-0.3, 1.6, 0.5);
    headGroup.add(eyeL);
    
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat.clone());
    eyeR.position.set(0.3, 1.6, 0.5);
    headGroup.add(eyeR);
    
    // Eye lights (glowing orbs)
    const eyeLightGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const eyeLightMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9
    });
    
    const eyeLightL = new THREE.Mesh(eyeLightGeo, eyeLightMat.clone());
    eyeLightL.position.set(-0.3, 1.6, 0.55);
    headGroup.add(eyeLightL);
    
    const eyeLightR = new THREE.Mesh(eyeLightGeo, eyeLightMat.clone());
    eyeLightR.position.set(0.3, 1.6, 0.55);
    headGroup.add(eyeLightR);
    
    // Cheeks (pink, glowing)
    const cheekGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const cheekMat = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      roughness: 0.4,
      metalness: 0.1,
      emissive: 0xec4899,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.9
    });
    
    const cheekL = new THREE.Mesh(cheekGeo, cheekMat.clone());
    cheekL.position.set(-0.45, 1.35, 0.5);
    cheekL.scale.set(1, 0.8, 0.3);
    headGroup.add(cheekL);
    
    const cheekR = new THREE.Mesh(cheekGeo, cheekMat.clone());
    cheekR.position.set(0.45, 1.35, 0.5);
    cheekR.scale.set(1, 0.8, 0.3);
    headGroup.add(cheekR);
    
    // Bow on top (large, glowing)
    const bowGeo = new THREE.TorusGeometry(0.3, 0.08, 16, 32);
    const bowMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.4,
      metalness: 0.3,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.5
    });
    const bow = new THREE.Mesh(bowGeo, bowMat);
    bow.position.y = 2.3;
    bow.rotation.x = Math.PI / 2;
    headGroup.add(bow);
    
    // Store references
    headGroup.userData.eyeLights = [eyeLightL, eyeLightR];
    headGroup.userData.cheeks = [cheekL, cheekR];
    headGroup.userData.bow = bow;
    
    this.scene.add(headGroup);
    this.state.bossHead = headGroup;
    
    console.log('[ExecutionEnvironment] ✅ Boss Celli head created');
  }

  /**
   * Create deforming finger tube (CRITICAL - must deform and track)
   */
  async _createDeformingFinger() {
    console.log('[ExecutionEnvironment] Creating deforming finger tube...');
    
    // Create curve for finger path (will be updated dynamically)
    const fingerPoints = [
      new THREE.Vector3(0, 1.5, 0),    // Start at hand
      new THREE.Vector3(0, 1.3, -0.5), // Bend point
      new THREE.Vector3(0, 1.0, -1.0), // Mid point
      new THREE.Vector3(0, 0.8, -1.5), // Near keyboard
      new THREE.Vector3(0, 0.6, -2.0)  // Touching keyboard
    ];
    
    this.state.fingerCurve = new THREE.CatmullRomCurve3(fingerPoints);
    
    // Create tube geometry that deforms along curve
    const tubeGeo = new THREE.TubeGeometry(
      this.state.fingerCurve,
      32,  // segments (more = smoother)
      0.08, // radius
      16,  // radial segments
      false // not closed
    );
    
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0xffd4a3, // Skin tone
      roughness: 0.8,
      metalness: 0.1
    });
    
    this.state.fingerTube = new THREE.Mesh(tubeGeo, tubeMat);
    this.state.fingerTube.castShadow = true;
    this.state.fingerTube.receiveShadow = true;
    
    this.scene.add(this.state.fingerTube);
    
    // Fingertip (sphere at end)
    const tipGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const tip = new THREE.Mesh(tipGeo, tubeMat.clone());
    tip.castShadow = true;
    this.state.fingerTube.userData.tip = tip;
    this.scene.add(tip);
    
    console.log('[ExecutionEnvironment] ✅ Deforming finger tube created');
  }

  /**
   * Create detailed keyboard with labels
   */
  async _createDetailedKeyboard() {
    console.log('[ExecutionEnvironment] Creating detailed keyboard...');
    
    const keyboardGroup = new THREE.Group();
    keyboardGroup.name = 'DetailedKeyboard';
    
    // QWERTY layout
    const layout = [
      ['Esc', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Bksp'],
      ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
      ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
      ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
      ['Ctrl', 'Alt', 'Space', 'Alt', 'Ctrl']
    ];
    
    const keySize = 0.15;
    const keyHeight = 0.05;
    const gap = 0.02;
    
    let yOffset = 0;
    
    layout.forEach((row, rowIndex) => {
      let xOffset = 0;
      
      row.forEach((keyLabel, keyIndex) => {
        // Key width (some keys wider)
        let keyWidth = keySize;
        if (keyLabel === 'Bksp') keyWidth = keySize * 1.5;
        else if (keyLabel === 'Tab') keyWidth = keySize * 1.3;
        else if (keyLabel === 'Caps') keyWidth = keySize * 1.5;
        else if (keyLabel === 'Enter') keyWidth = keySize * 1.8;
        else if (keyLabel === 'Shift') keyWidth = keySize * 2.0;
        else if (keyLabel === 'Space') keyWidth = keySize * 5;
        else if (keyLabel === 'Ctrl' || keyLabel === 'Alt') keyWidth = keySize * 1.2;
        
        // Create key
        const keyGeo = new THREE.BoxGeometry(keyWidth - 0.01, keyHeight, keySize - 0.01);
        const keyMat = new THREE.MeshStandardMaterial({
          color: 0x2a2a3a,
          roughness: 0.3,
          metalness: 0.6,
          emissive: 0x1a1a2a,
          emissiveIntensity: 0.1
        });
        
        const key = new THREE.Mesh(keyGeo, keyMat);
        key.position.set(xOffset + keyWidth / 2, 0, -yOffset);
        key.castShadow = true;
        key.receiveShadow = true;
        
        // Store key data
        key.userData = {
          label: keyLabel,
          baseY: 0,
          pressed: false,
          velY: 0,
          dustParticles: []
        };
        
        keyboardGroup.add(key);
        this.state.keys.push(key);
        this.state.keyMap.set(keyLabel, key);
        
        // Create key label (text sprite)
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#2a2a3a';
        ctx.fillRect(0, 0, 64, 64);
        
        ctx.fillStyle = '#e0e0e0';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(keyLabel.substring(0, 4), 32, 32); // Truncate long labels
        
        const texture = new THREE.CanvasTexture(canvas);
        const labelMat = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true
        });
        
        const labelGeo = new THREE.PlaneGeometry(keyWidth - 0.02, keySize - 0.02);
        const label = new THREE.Mesh(labelGeo, labelMat);
        label.position.set(xOffset + keyWidth / 2, keyHeight / 2 + 0.001, -yOffset);
        label.rotation.x = -Math.PI / 2;
        keyboardGroup.add(label);
        
        xOffset += keyWidth + gap;
      });
      
      yOffset += keySize + gap;
    });
    
    // Keyboard base
    const baseGeo = new THREE.BoxGeometry(3.5, 0.1, 1.5);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2a,
      roughness: 0.5,
      metalness: 0.4
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(1.5, -0.06, -0.7);
    base.receiveShadow = true;
    keyboardGroup.add(base);
    
    keyboardGroup.position.set(-1.5, 0, 2);
    this.scene.add(keyboardGroup);
    this.state.keyboard = keyboardGroup;
    
    console.log(`[ExecutionEnvironment] ✅ Keyboard created with ${this.state.keys.length} keys`);
  }

  /**
   * Create advanced lighting system
   */
  async _createLighting() {
    console.log('[ExecutionEnvironment] Creating lighting...');
    
    // Spotlight on typing area
    const spotlight = new THREE.SpotLight(0xffffff, 2, 15, Math.PI / 6, 0.5, 2);
    spotlight.position.set(0, 5, 0);
    spotlight.target.position.set(0, 0, 0);
    spotlight.castShadow = true;
    spotlight.shadow.mapSize.width = 1024;
    spotlight.shadow.mapSize.height = 1024;
    this.scene.add(spotlight);
    this.scene.add(spotlight.target);
    this.state.spotLight = spotlight;
    
    // Rim light on character
    const rimLight = new THREE.DirectionalLight(0x4a7cff, 0.8);
    rimLight.position.set(2, 3, -3);
    this.scene.add(rimLight);
    this.state.rimLight = rimLight;
    
    // Per-key lights (subtle point lights)
    this.state.keys.forEach((key, index) => {
      if (index % 3 === 0) { // Not every key, just some
        const keyLight = new THREE.PointLight(0xffffff, 0.3, 0.5);
        keyLight.position.copy(key.position);
        keyLight.position.y += 0.1;
        this.scene.add(keyLight);
        this.state.keyLights.push(keyLight);
      }
    });
    
    console.log('[ExecutionEnvironment] ✅ Lighting created');
  }

  /**
   * Create dust particles
   */
  async _createDustParticles() {
    console.log('[ExecutionEnvironment] Creating dust particles...');
    
    const particleCount = 100;
    const dustGeo = new THREE.SphereGeometry(0.01, 4, 4);
    const dustMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3
    });
    
    for (let i = 0; i < particleCount; i++) {
      const dust = new THREE.Mesh(dustGeo, dustMat.clone());
      
      // Random position in scene
      dust.position.set(
        (Math.random() - 0.5) * 4,
        Math.random() * 3,
        (Math.random() - 0.5) * 4
      );
      
      // Store animation data
      dust.userData = {
        baseX: dust.position.x,
        baseY: dust.position.y,
        baseZ: dust.position.z,
        freq: 0.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        driftSpeed: 0.2 + Math.random() * 0.3
      };
      
      this.scene.add(dust);
      this.state.dustParticles.push(dust);
    }
    
    console.log(`[ExecutionEnvironment] ✅ ${particleCount} dust particles created`);
  }

  /**
   * Update finger tube to track target (keyboard position)
   */
  updateFingerTracking(targetPosition) {
    if (!this.state.fingerCurve || !this.state.fingerTube) return;
    
    // Update target
    this.state.fingerTarget.copy(targetPosition);
    
    // Rebuild curve points to bend toward target
    const start = new THREE.Vector3(0, 1.5, 0); // From hand
    const end = this.state.fingerTarget.clone();
    
    // Calculate intermediate points for smooth curve
    const mid1 = new THREE.Vector3().lerpVectors(start, end, 0.25);
    mid1.y += 0.2; // Arc upward
    
    const mid2 = new THREE.Vector3().lerpVectors(start, end, 0.5);
    mid2.y += 0.1;
    
    const mid3 = new THREE.Vector3().lerpVectors(start, end, 0.75);
    
    // Update curve points
    this.state.fingerCurve.points = [start, mid1, mid2, mid3, end];
    this.state.fingerCurve.needsUpdate = true;
    
    // Rebuild tube geometry
    const newGeo = new THREE.TubeGeometry(
      this.state.fingerCurve,
      32,
      0.08,
      16,
      false
    );
    
    this.state.fingerTube.geometry.dispose();
    this.state.fingerTube.geometry = newGeo;
    
    // Update fingertip position
    if (this.state.fingerTube.userData.tip) {
      this.state.fingerTube.userData.tip.position.copy(end);
    }
  }

  /**
   * Press key (visual animation)
   */
  pressKey(keyLabel) {
    const key = this.state.keyMap.get(keyLabel);
    if (!key) return;
    
    // Animate key press
    key.userData.pressed = true;
    key.userData.velY = -0.02; // Move down
    key.position.y -= 0.01;
    
    // Flash key emissive
    key.material.emissiveIntensity = 0.5;
    setTimeout(() => {
      key.material.emissiveIntensity = 0.1;
    }, 100);
    
    // Create dust burst from key
    this._createDustBurst(key.position);
  }

  /**
   * Create dust burst from position
   */
  _createDustBurst(position) {
    // Create 3-5 temporary dust particles
    const count = 3 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < count; i++) {
      const dustGeo = new THREE.SphereGeometry(0.015, 4, 4);
      const dustMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.6
      });
      
      const burst = new THREE.Mesh(dustGeo, dustMat);
      burst.position.copy(position);
      burst.position.y += 0.05;
      
      burst.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          0.01 + Math.random() * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        lifetime: 1.0,
        age: 0
      };
      
      this.scene.add(burst);
      this.state.dustParticles.push(burst);
    }
  }

  /**
   * Update (called every frame)
   */
  update(deltaTime, mousePosition) {
    if (!this.state.visible) return;
    
    this.state.time += deltaTime;
    const time = this.state.time;
    
    // Update boss head animations
    if (this.state.bossHead) {
      // Gentle bobbing
      this.state.bossHead.position.y = 0.5 + Math.sin(time * 0.5) * 0.05;
      this.state.bossHead.rotation.y = Math.sin(time * 0.3) * 0.1;
      
      // Pulse eye lights
      const eyeLights = this.state.bossHead.userData.eyeLights;
      if (eyeLights) {
        const pulse = Math.sin(time * 2) * 0.5 + 0.5;
        eyeLights.forEach(light => {
          light.material.opacity = 0.7 + pulse * 0.3;
        });
      }
      
      // Animate cheeks
      const cheeks = this.state.bossHead.userData.cheeks;
      if (cheeks) {
        const cheekPulse = Math.sin(time * 1.5) * 0.1 + 1.0;
        cheeks.forEach(cheek => {
          cheek.scale.setScalar(cheekPulse);
        });
      }
      
      // Rotate bow
      const bow = this.state.bossHead.userData.bow;
      if (bow) {
        bow.rotation.z += deltaTime * 0.5;
      }
    }
    
    // Update finger tracking
    if (mousePosition && this.state.finger) {
      // Convert mouse to 3D keyboard position
      const keyboardCenter = this.state.keyboard ? this.state.keyboard.position.clone() : new THREE.Vector3(0, 0, 2);
      const targetPos = keyboardCenter.clone();
      targetPos.x += (mousePosition.x - 0.5) * 2;
      targetPos.z += (mousePosition.y - 0.5) * 0.5;
      
      this.updateFingerTracking(targetPos);
    }
    
    // Update dust particles
    this.state.dustParticles.forEach((dust, index) => {
      if (dust.userData.lifetime !== undefined) {
        // Burst particle
        dust.userData.age += deltaTime;
        if (dust.userData.age > dust.userData.lifetime) {
          this.scene.remove(dust);
          dust.geometry.dispose();
          dust.material.dispose();
          this.state.dustParticles.splice(index, 1);
          return;
        }
        
        // Move with velocity
        dust.position.add(dust.userData.velocity.clone().multiplyScalar(deltaTime));
        
        // Fade out
        const life = dust.userData.age / dust.userData.lifetime;
        dust.material.opacity = 0.6 * (1 - life);
      } else {
        // Floating ambient dust
        const freq = dust.userData.freq;
        const phase = dust.userData.phase;
        
        dust.position.x = dust.userData.baseX + Math.sin(time * freq + phase) * 0.1;
        dust.position.y = dust.userData.baseY + Math.cos(time * freq * 0.7 + phase) * 0.05;
        dust.position.z = dust.userData.baseZ + Math.sin(time * freq * 0.5 + phase) * 0.1;
        
        // Gentle opacity pulse
        const opacity = 0.2 + Math.sin(time * 2 + phase) * 0.1;
        dust.material.opacity = opacity;
      }
    });
  }

  /**
   * Show environment
   */
  show() {
    this.state.visible = true;
    if (this.state.bust) this.state.bust.visible = true;
    if (this.state.bossHead) this.state.bossHead.visible = true;
    if (this.state.fingerTube) this.state.fingerTube.visible = true;
    if (this.state.keyboard) this.state.keyboard.visible = true;
    this.state.dustParticles.forEach(d => d.visible = true);
  }

  /**
   * Hide environment
   */
  hide() {
    this.state.visible = false;
    if (this.state.bust) this.state.bust.visible = false;
    if (this.state.bossHead) this.state.bossHead.visible = false;
    if (this.state.fingerTube) this.state.fingerTube.visible = false;
    if (this.state.keyboard) this.state.keyboard.visible = false;
    this.state.dustParticles.forEach(d => d.visible = false);
  }

  /**
   * Destroy
   */
  destroy() {
    console.log('[ExecutionEnvironment] Destroying...');
    
    // Remove and dispose all components
    [this.state.bust, this.state.bossHead, this.state.fingerTube, this.state.keyboard].forEach(obj => {
      if (obj) {
        obj.traverse(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (child.material.map) child.material.map.dispose();
            child.material.dispose();
          }
        });
        this.scene.remove(obj);
      }
    });
    
    // Dispose dust
    this.state.dustParticles.forEach(dust => {
      dust.geometry.dispose();
      dust.material.dispose();
      this.scene.remove(dust);
    });
    
    // Dispose lights
    this.state.keyLights.forEach(light => this.scene.remove(light));
    if (this.state.spotLight) this.scene.remove(this.state.spotLight);
    if (this.state.rimLight) this.scene.remove(this.state.rimLight);
    
    console.log('[ExecutionEnvironment] ✅ Destroyed');
  }
}

export default ExecutionEnvironment;

