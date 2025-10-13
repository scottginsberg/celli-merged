/**
 * MainframeSpawn - Initial Spawn Animation
 * 
 * Creates the initial mainframe and Celli's home
 * Spawns behind the gradient canvas
 * 
 * Features:
 * - Mainframe structure (grid/lattice)
 * - Celli's home (safe space)
 * - Spawn animations
 * - Proper z-ordering
 */

import * as THREE from 'three';

export class MainframeSpawn {
  constructor(scene) {
    this.scene = scene;
    
    this.state = {
      // Components
      mainframe: null,
      celliHome: null,
      
      // Animation
      spawnProgress: 0,
      animating: false,
      
      // Visibility
      visible: false
    };
  }

  /**
   * Initialize mainframe and home
   */
  async init() {
    console.log('[MainframeSpawn] Initializing mainframe and home...');
    
    await this._createMainframe();
    await this._createCelliHome();
    
    console.log('[MainframeSpawn] ✅ Initialized');
    return true;
  }

  /**
   * Create mainframe structure
   */
  async _createMainframe() {
    const mainframeGroup = new THREE.Group();
    mainframeGroup.name = 'Mainframe';
    
    // Grid lattice structure
    const gridSize = 10;
    const gridStep = 0.5;
    const lineColor = 0x4a7cff;
    
    // Create grid lines
    const lineMat = new THREE.LineBasicMaterial({ 
      color: lineColor,
      transparent: true,
      opacity: 0.3
    });
    
    // Horizontal lines
    for (let i = -gridSize; i <= gridSize; i++) {
      const points = [];
      points.push(new THREE.Vector3(-gridSize * gridStep, 0, i * gridStep));
      points.push(new THREE.Vector3(gridSize * gridStep, 0, i * gridStep));
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, lineMat);
      mainframeGroup.add(line);
    }
    
    // Vertical lines
    for (let i = -gridSize; i <= gridSize; i++) {
      const points = [];
      points.push(new THREE.Vector3(i * gridStep, 0, -gridSize * gridStep));
      points.push(new THREE.Vector3(i * gridStep, 0, gridSize * gridStep));
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, lineMat);
      mainframeGroup.add(line);
    }
    
    // Vertical posts at corners
    const postGeo = new THREE.CylinderGeometry(0.03, 0.03, 3, 8);
    const postMat = new THREE.MeshStandardMaterial({
      color: lineColor,
      emissive: lineColor,
      emissiveIntensity: 0.5
    });
    
    const corners = [
      [-gridSize * gridStep, 1.5, -gridSize * gridStep],
      [gridSize * gridStep, 1.5, -gridSize * gridStep],
      [-gridSize * gridStep, 1.5, gridSize * gridStep],
      [gridSize * gridStep, 1.5, gridSize * gridStep]
    ];
    
    corners.forEach(([x, y, z]) => {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(x, y, z);
      mainframeGroup.add(post);
    });
    
    mainframeGroup.position.y = -2;
    mainframeGroup.visible = false;
    
    this.scene.add(mainframeGroup);
    this.state.mainframe = mainframeGroup;
    
    console.log('[MainframeSpawn] ✅ Mainframe created');
  }

  /**
   * Create Celli's home
   */
  async _createCelliHome() {
    const homeGroup = new THREE.Group();
    homeGroup.name = 'CelliHome';
    
    // Small platform (home base)
    const platformGeo = new THREE.BoxGeometry(2, 0.2, 2);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.5,
      metalness: 0.2
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = 0;
    platform.castShadow = true;
    platform.receiveShadow = true;
    homeGroup.add(platform);
    
    // Home marker (glowing cube)
    const markerGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const markerMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.9
    });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.y = 0.3;
    homeGroup.add(marker);
    
    // Ambient light at home
    const homeLight = new THREE.PointLight(0xfbbf24, 1, 5);
    homeLight.position.y = 0.5;
    homeGroup.add(homeLight);
    
    homeGroup.position.set(0, -1.9, 0);
    homeGroup.visible = false;
    
    this.scene.add(homeGroup);
    this.state.celliHome = homeGroup;
    
    console.log('[MainframeSpawn] ✅ Celli\'s home created');
  }

  /**
   * Play spawn animation
   */
  async playSpawnAnimation() {
    console.log('[MainframeSpawn] 🎬 Playing spawn animation...');
    
    this.state.animating = true;
    this.state.spawnProgress = 0;
    
    // Show components
    if (this.state.mainframe) this.state.mainframe.visible = true;
    if (this.state.celliHome) this.state.celliHome.visible = true;
    
    // Animate spawn (fade in, rise up)
    const duration = 2000; // 2 seconds
    const startTime = performance.now();
    
    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1.0);
        
        this.state.spawnProgress = progress;
        
        // Ease out
        const t = 1 - Math.pow(1 - progress, 3);
        
        // Fade in
        if (this.state.mainframe) {
          this.state.mainframe.traverse(child => {
            if (child.material) {
              child.material.opacity = t * 0.3;
            }
          });
          this.state.mainframe.position.y = -2 + t * 0.5;
        }
        
        if (this.state.celliHome) {
          this.state.celliHome.traverse(child => {
            if (child.material) {
              if (child.material.opacity !== undefined) {
                child.material.opacity = t;
              }
            }
          });
          this.state.celliHome.position.y = -1.9 + t * 0.3;
        }
        
        if (progress < 1.0) {
          requestAnimationFrame(animate);
        } else {
          this.state.animating = false;
          this.state.visible = true;
          console.log('[MainframeSpawn] ✅ Spawn animation complete');
          resolve();
        }
      };
      
      animate();
    });
  }

  /**
   * Update (called every frame)
   */
  update(deltaTime) {
    if (!this.state.visible) return;
    
    const time = performance.now() * 0.001;
    
    // Gentle pulsing of home marker
    if (this.state.celliHome) {
      const marker = this.state.celliHome.children.find(c => c.geometry?.type === 'BoxGeometry' && c.position.y > 0);
      if (marker) {
        const pulse = Math.sin(time * 2) * 0.1 + 1.0;
        marker.scale.setScalar(pulse);
        marker.material.emissiveIntensity = 0.6 + Math.sin(time * 3) * 0.2;
      }
    }
  }

  /**
   * Show mainframe and home
   */
  show() {
    if (this.state.mainframe) this.state.mainframe.visible = true;
    if (this.state.celliHome) this.state.celliHome.visible = true;
    this.state.visible = true;
  }

  /**
   * Hide mainframe and home
   */
  hide() {
    if (this.state.mainframe) this.state.mainframe.visible = false;
    if (this.state.celliHome) this.state.celliHome.visible = false;
    this.state.visible = false;
  }

  /**
   * Destroy
   */
  destroy() {
    console.log('[MainframeSpawn] Destroying...');
    
    [this.state.mainframe, this.state.celliHome].forEach(obj => {
      if (obj) {
        obj.traverse(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
        this.scene.remove(obj);
      }
    });
    
    console.log('[MainframeSpawn] ✅ Destroyed');
  }
}

export default MainframeSpawn;

