/**
 * CelliReal Scene - Ported from merged2.html
 * 
 * The "spreadsheet becomes reality" scene:
 * - VisiCalc cells become physical 3D objects
 * - Formulas create structures in real-time
 * - Interactive 3D spreadsheet manipulation
 * - Reality bending effects
 * - Transition between 2D and 3D views
 */

import * as THREE from 'three';

export class CelliRealScene {
  constructor() {
    this.name = 'CelliReal';
    
    this.state = {
      scene: null,
      camera: null,
      renderer: null,
      
      // Spreadsheet state
      cellObjects: [],
      cellsVisible: true,
      gridSize: { x: 20, y: 10, z: 5 },
      
      // 3D objects
      cellMeshes: new Map(),
      connectionLines: [],
      
      // Camera modes
      cameraMode: '3d', // '3d' or '2d'
      cameraTarget: new THREE.Vector3(0, 0, 0),
      
      // Animation
      transitionProgress: 0,
      transitioning: false,
      
      // State
      running: false,
      
      // Callbacks
      onCellClick: null,
      onCellUpdate: null
    };
  }

  /**
   * Initialize scene
   */
  async init() {
    console.log('📊 Initializing CelliReal Scene...');
    
    const app = document.getElementById('app');
    if (!app) return;
    
    // Create renderer
    this.state.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true // Enable screen recording
    });
    this.state.renderer.setSize(window.innerWidth, window.innerHeight);
    this.state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    app.appendChild(this.state.renderer.domElement);
    
    // Create scene
    this.state.scene = new THREE.Scene();
    this.state.scene.background = new THREE.Color(0x0a0a1a);
    this.state.scene.fog = new THREE.Fog(0x0a0a1a, 20, 100);
    
    // Create camera
    this.state.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.state.camera.position.set(15, 15, 15);
    this.state.camera.lookAt(0, 0, 0);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.state.scene.add(ambientLight);
    
    const pointLight1 = new THREE.PointLight(0x00ffff, 1, 50);
    pointLight1.position.set(10, 10, 10);
    this.state.scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xff00ff, 0.8, 50);
    pointLight2.position.set(-10, 10, -10);
    this.state.scene.add(pointLight2);
    
    // Create grid of cells
    this._createCellGrid();
    
    // Setup interaction
    this._setupInteraction();
    
    // Handle resize
    window.addEventListener('resize', () => this._handleResize());
    
    console.log('✅ CelliReal Scene initialized');
  }

  /**
   * Create 3D cell grid
   */
  _createCellGrid() {
    const cellSize = 1.0;
    const gap = 0.1;
    const step = cellSize + gap;
    
    const { x: sizeX, y: sizeY, z: sizeZ } = this.state.gridSize;
    
    // Cell geometry (reused)
    const cellGeo = new THREE.BoxGeometry(cellSize, cellSize, cellSize);
    
    // Create cells
    for (let z = 0; z < sizeZ; z++) {
      for (let y = 0; y < sizeY; y++) {
        for (let x = 0; x < sizeX; x++) {
          // Cell material (unique per cell for updates)
          const cellMat = new THREE.MeshPhongMaterial({ 
            color: 0x222233,
            emissive: 0x000033,
            transparent: true,
            opacity: 0.8,
            wireframe: false
          });
          
          const cellMesh = new THREE.Mesh(cellGeo, cellMat);
          
          // Position
          cellMesh.position.set(
            (x - sizeX / 2) * step,
            (y - sizeY / 2) * step,
            (z - sizeZ / 2) * step
          );
          
          // Store cell data
          cellMesh.userData = {
            gridPos: { x, y, z },
            value: '',
            formula: null,
            isEmpty: true
          };
          
          this.state.scene.add(cellMesh);
          this.state.cellMeshes.set(`${x},${y},${z}`, cellMesh);
        }
      }
    }
    
    console.log(`📊 Created ${this.state.cellMeshes.size} 3D cells`);
  }

  /**
   * Setup mouse interaction
   */
  _setupInteraction() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const onMouseMove = (event) => {
      if (!this.state.running) return;
      
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      raycaster.setFromCamera(mouse, this.state.camera);
      const intersects = raycaster.intersectObjects(Array.from(this.state.cellMeshes.values()));
      
      // Reset all cells
      this.state.cellMeshes.forEach(mesh => {
        if (mesh.userData.isEmpty) {
          mesh.material.emissive.setHex(0x000033);
        }
      });
      
      // Highlight hovered cell
      if (intersects.length > 0) {
        const hoveredCell = intersects[0].object;
        if (hoveredCell.userData.isEmpty) {
          hoveredCell.material.emissive.setHex(0x003333);
        }
      }
    };
    
    const onClick = (event) => {
      if (!this.state.running) return;
      
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      raycaster.setFromCamera(mouse, this.state.camera);
      const intersects = raycaster.intersectObjects(Array.from(this.state.cellMeshes.values()));
      
      if (intersects.length > 0) {
        const clickedCell = intersects[0].object;
        console.log('📊 Cell clicked:', clickedCell.userData.gridPos);
        
        if (this.state.onCellClick) {
          this.state.onCellClick(clickedCell.userData);
        }
      }
    };
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);
    
    // Store for cleanup
    this._mouseHandlers = { onMouseMove, onClick };
  }

  /**
   * Update cell value
   */
  updateCell(x, y, z, value, formula = null) {
    const key = `${x},${y},${z}`;
    const cellMesh = this.state.cellMeshes.get(key);
    
    if (!cellMesh) return;
    
    cellMesh.userData.value = value;
    cellMesh.userData.formula = formula;
    cellMesh.userData.isEmpty = !value && !formula;
    
    // Update appearance based on content
    if (cellMesh.userData.isEmpty) {
      cellMesh.material.color.setHex(0x222233);
      cellMesh.material.emissive.setHex(0x000033);
    } else if (formula) {
      // Formula cell - cyan glow
      cellMesh.material.color.setHex(0x0088ff);
      cellMesh.material.emissive.setHex(0x003366);
    } else {
      // Value cell - blue glow
      cellMesh.material.color.setHex(0x4444ff);
      cellMesh.material.emissive.setHex(0x111133);
    }
    
    if (this.state.onCellUpdate) {
      this.state.onCellUpdate(cellMesh.userData);
    }
  }

  /**
   * Transition between 2D and 3D views
   */
  transitionTo2D() {
    if (this.state.transitioning) return;
    
    this.state.transitioning = true;
    this.state.cameraMode = '2d';
    
    // Animate camera to orthographic-like position
    const targetPos = new THREE.Vector3(0, 20, 0);
    this._animateCamera(targetPos, () => {
      this.state.transitioning = false;
    });
    
    console.log('📊 Transitioning to 2D view');
  }

  /**
   * Transition to 3D view
   */
  transitionTo3D() {
    if (this.state.transitioning) return;
    
    this.state.transitioning = true;
    this.state.cameraMode = '3d';
    
    // Animate camera to perspective position
    const targetPos = new THREE.Vector3(15, 15, 15);
    this._animateCamera(targetPos, () => {
      this.state.transitioning = false;
    });
    
    console.log('📊 Transitioning to 3D view');
  }

  /**
   * Animate camera to target position
   */
  _animateCamera(targetPos, onComplete) {
    const startPos = this.state.camera.position.clone();
    const duration = 1000;
    const startTime = performance.now();
    
    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      
      // Ease in-out
      const t = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      this.state.camera.position.lerpVectors(startPos, targetPos, t);
      this.state.camera.lookAt(this.state.cameraTarget);
      
      if (progress < 1.0) {
        requestAnimationFrame(animate);
      } else {
        if (onComplete) onComplete();
      }
    };
    
    animate();
  }

  /**
   * Start scene
   */
  async start() {
    console.log('▶️ Starting CelliReal Scene');
    this.state.running = true;
  }

  /**
   * Update scene
   */
  update(deltaTime, totalTime) {
    if (!this.state.running) return;
    
    // Rotate camera in 3D mode
    if (this.state.cameraMode === '3d' && !this.state.transitioning) {
      const radius = 20;
      const speed = 0.0002;
      this.state.camera.position.x = Math.cos(totalTime * speed) * radius;
      this.state.camera.position.z = Math.sin(totalTime * speed) * radius;
      this.state.camera.lookAt(this.state.cameraTarget);
    }
    
    // Pulse non-empty cells
    this.state.cellMeshes.forEach((mesh, key) => {
      if (!mesh.userData.isEmpty) {
        const pulse = 1 + Math.sin(totalTime * 0.003) * 0.05;
        mesh.scale.set(pulse, pulse, pulse);
      }
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
    console.log('⏹️ Stopping CelliReal Scene');
    this.state.running = false;
  }

  /**
   * Destroy scene
   */
  destroy() {
    this.stop();
    
    // Remove mouse handlers
    if (this._mouseHandlers) {
      window.removeEventListener('mousemove', this._mouseHandlers.onMouseMove);
      window.removeEventListener('click', this._mouseHandlers.onClick);
    }
    
    // Dispose cell meshes
    this.state.cellMeshes.forEach(mesh => {
      mesh.geometry.dispose();
      mesh.material.dispose();
      this.state.scene.remove(mesh);
    });
    this.state.cellMeshes.clear();
    
    // Dispose renderer
    if (this.state.renderer) {
      this.state.renderer.dispose();
      if (this.state.renderer.domElement.parentNode) {
        this.state.renderer.domElement.parentNode.removeChild(this.state.renderer.domElement);
      }
    }
    
    console.log('🗑️ CelliReal Scene destroyed');
  }

  /**
   * Set callbacks
   */
  setCallbacks(callbacks) {
    if (callbacks.onCellClick) this.state.onCellClick = callbacks.onCellClick;
    if (callbacks.onCellUpdate) this.state.onCellUpdate = callbacks.onCellUpdate;
  }
}

export default CelliRealScene;


