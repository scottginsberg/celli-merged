// ==================== ASSET PREVIEW RENDERER ====================
// Lightweight standalone renderer for previewing assets
// Can be used by AI evaluator or as a simple asset viewer

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createAsset } from './asset-registry.js';
import { FloorPatterns } from '../floor-patterns.js';

/**
 * Asset Preview Renderer
 * Creates a simple Three.js scene to preview individual assets
 */
export class AssetPreviewRenderer {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.options = {
      width: options.width || 800,
      height: options.height || 600,
      backgroundColor: options.backgroundColor || 0xf0f0f0,
      gridSize: options.gridSize || 1.0,
      ...options
    };
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.assets = [];
    this.interactiveObjects = [];
    this.currentFloorPattern = null;
    
    // Global orientation gizmo (always visible in corner)
    this.gizmoScene = null;
    this.gizmoCamera = null;
    this.globalGizmo = null;
    
    this.init();
  }
  
  /**
   * Initialize the Three.js scene
   */
  init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.options.backgroundColor);
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(
      50,
      this.options.width / this.options.height,
      0.1,
      1000
    );
    this.camera.position.set(3, 2, 3);
    this.camera.lookAt(0, 0.5, 0);
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setSize(this.options.width, this.options.height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);
    
    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 0.5, 0);

    // Floor with professional patterns (NO GRID)
    this.currentFloorPattern = null;
    this.createFloor('hardwood-short'); // Default floor pattern
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    this.scene.add(directionalLight);
    
    // Global orientation gizmo setup (corner display)
    this.gizmoScene = new THREE.Scene();
    this.gizmoCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 10);
    this.gizmoCamera.position.set(0, 0, 2);
    
    // Create global axes helper (always visible in corner)
    this.globalGizmo = new THREE.AxesHelper(0.8);
    this.globalGizmo.material.depthTest = false;
    this.globalGizmo.material.transparent = true;
    this.globalGizmo.renderOrder = 999;
    this.gizmoScene.add(this.globalGizmo);
    
    // Start animation loop
    this.animate();
  }
  
  /**
   * Add an asset to the scene
   * @param {string} assetId - Asset identifier
   * @param {Object} spec - Asset specification
   * @returns {THREE.Group|null}
   */
  addAsset(assetId, spec = {}) {
    const context = {
      scene: this.scene,
      objects: this.assets,
      interactive: this.interactiveObjects,
      gridSize: this.options.gridSize
    };
    
    const asset = createAsset(assetId, spec, THREE, context);
    
    if (asset) {
      this.assets.push(asset);
      return asset;
    }
    
    return null;
  }
  
  /**
   * Create floor with pattern
   * @param {string} patternName - Floor pattern name
   */
  createFloor(patternName = 'hardwood-short') {
    // Remove existing floor if present
    if (this.currentFloorPattern) {
      this.scene.remove(this.currentFloorPattern);
      this.currentFloorPattern.traverse(node => {
        if (node.geometry) node.geometry.dispose();
        if (node.material) {
          if (Array.isArray(node.material)) {
            node.material.forEach(mat => mat.dispose());
          } else {
            node.material.dispose();
          }
        }
      });
    }
    
    // Create new floor using FloorPatterns module
    const bounds = { minX: -5, maxX: 5, minZ: -5, maxZ: 5 };
    this.currentFloorPattern = FloorPatterns.createFloor(this.scene, bounds, patternName, {
      gridSize: 1.0
    });
  }
  
  /**
   * Change floor pattern
   * @param {string} patternName - New floor pattern name
   */
  changeFloorPattern(patternName) {
    this.createFloor(patternName);
  }
  
  /**
   * Clear all assets from the scene
   */
  clearAssets() {
    this.assets.forEach(asset => {
      this.scene.remove(asset);
      asset.traverse(node => {
        if (node.geometry) node.geometry.dispose();
        if (node.material) {
          if (Array.isArray(node.material)) {
            node.material.forEach(mat => mat.dispose());
          } else {
            node.material.dispose();
          }
        }
      });
    });
    this.assets = [];
    this.interactiveObjects = [];
  }
  
  /**
   * Take a screenshot from current camera angle
   * @returns {string} Base64 encoded PNG image
   */
  takeScreenshot() {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }
  
  /**
   * Take screenshots from multiple angles
   * @param {Array<Object>} angles - Array of {position: [x,y,z], lookAt: [x,y,z]}
   * @returns {Array<string>} Array of base64 encoded images
   */
  takeMultiAngleScreenshots(angles) {
    const originalPosition = this.camera.position.clone();
    const originalTarget = this.controls.target.clone();
    const screenshots = [];
    
    angles.forEach(angle => {
      this.camera.position.set(...angle.position);
      this.controls.target.set(...angle.lookAt);
      this.controls.update();
      screenshots.push(this.takeScreenshot());
    });
    
    // Restore original camera
    this.camera.position.copy(originalPosition);
    this.controls.target.copy(originalTarget);
    this.controls.update();
    
    return screenshots;
  }
  
  /**
   * Generate standard evaluation angles for an asset
   * @returns {Array<Object>} Standard camera angles
   */
  getStandardAngles() {
    return [
      { position: [2, 1, 2], lookAt: [0, 0.5, 0] },     // Front-right view
      { position: [-2, 1, 2], lookAt: [0, 0.5, 0] },    // Front-left view
      { position: [2, 1, -2], lookAt: [0, 0.5, 0] },    // Back-right view
      { position: [-2, 1, -2], lookAt: [0, 0.5, 0] },   // Back-left view
      { position: [0, 3, 0], lookAt: [0, 0, 0] },       // Top view
      { position: [3, 0.5, 0], lookAt: [0, 0.5, 0] },   // Side view
    ];
  }
  
  /**
   * Animation loop
   */
  animate() {
    requestAnimationFrame(() => this.animate());
    
    // Only update controls if they're enabled (prevents interference with first-person mode)
    if (this.controls && this.controls.enabled) {
      this.controls.update();
    }
    
    // Render main scene
    this.renderer.render(this.scene, this.camera);
    
    // Update global gizmo to match camera orientation
    if (this.globalGizmo && this.gizmoCamera) {
      // Copy camera quaternion to gizmo to show current orientation
      this.globalGizmo.quaternion.copy(this.camera.quaternion).invert();
      
      // Render gizmo in corner (bottom-left)
      const gizmoSize = 128; // pixels
      const margin = 16; // pixels from edge
      
      this.renderer.clearDepth();
      this.renderer.setViewport(
        margin,
        margin,
        gizmoSize,
        gizmoSize
      );
      this.renderer.setScissor(
        margin,
        margin,
        gizmoSize,
        gizmoSize
      );
      this.renderer.setScissorTest(true);
      
      this.renderer.render(this.gizmoScene, this.gizmoCamera);
      
      // Reset viewport
      this.renderer.setViewport(0, 0, this.options.width, this.options.height);
      this.renderer.setScissorTest(false);
    }
  }
  
  /**
   * Resize the renderer
   * @param {number} width
   * @param {number} height
   */
  resize(width, height) {
    this.options.width = width;
    this.options.height = height;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
  
  /**
   * Cleanup and dispose
   */
  dispose() {
    this.clearAssets();
    this.controls.dispose();
    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

/**
 * Create a simple preview HTML page
 * @param {string} assetId - Asset to preview
 * @param {Object} spec - Asset specification
 * @returns {string} HTML string
 */
export function generatePreviewHTML(assetId, spec = {}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Asset Preview: ${assetId}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background: #222;
      color: #fff;
    }
    #container {
      width: 100vw;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    #info {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(0,0,0,0.7);
      padding: 10px;
      border-radius: 5px;
    }
    #controls {
      position: absolute;
      bottom: 10px;
      left: 10px;
      background: rgba(0,0,0,0.7);
      padding: 10px;
      border-radius: 5px;
    }
    button {
      margin: 5px;
      padding: 8px 16px;
      background: #4CAF50;
      border: none;
      color: white;
      cursor: pointer;
      border-radius: 4px;
    }
    button:hover {
      background: #45a049;
    }
  </style>
</head>
<body>
  <div id="info">
    <h3>Asset: ${assetId}</h3>
    <p>Use mouse to rotate, zoom, and pan</p>
  </div>
  <div id="controls">
    <button onclick="takeScreenshot()">Screenshot</button>
    <button onclick="takeMultiAngle()">Multi-Angle Screenshots</button>
    <button onclick="resetCamera()">Reset Camera</button>
  </div>
  <div id="container"></div>
  
  <script type="module">
    import { AssetPreviewRenderer } from './js/assets/preview-renderer.js';
    
    const container = document.getElementById('container');
    const renderer = new AssetPreviewRenderer(container, {
      width: window.innerWidth,
      height: window.innerHeight
    });
    
    // Add the asset
    renderer.addAsset('${assetId}', ${JSON.stringify(spec)});
    
    // Global functions for buttons
    window.takeScreenshot = () => {
      const screenshot = renderer.takeScreenshot();
      const link = document.createElement('a');
      link.download = '${assetId}_screenshot.png';
      link.href = screenshot;
      link.click();
    };
    
    window.takeMultiAngle = () => {
      const angles = renderer.getStandardAngles();
      const screenshots = renderer.takeMultiAngleScreenshots(angles);
      screenshots.forEach((screenshot, i) => {
        const link = document.createElement('a');
        link.download = \`${assetId}_angle\${i}.png\`;
        link.href = screenshot;
        link.click();
      });
    };
    
    window.resetCamera = () => {
      renderer.camera.position.set(3, 2, 3);
      renderer.controls.target.set(0, 0.5, 0);
      renderer.controls.update();
    };
    
    // Handle resize
    window.addEventListener('resize', () => {
      renderer.resize(window.innerWidth, window.innerHeight);
    });
  </script>
</body>
</html>
  `;
}

