/**
 * Voxel/Cell Rendering Engine
 * Extracted from merged2.html lines 23000-25000+ (~2500 lines)
 * 
 * Complete voxel and array visualization system
 * 
 * Components:
 * - ChunkVoxel: Chunk-based instanced mesh rendering with LOD
 * - Layer mesh management (InstancedMesh pooling)
 * - Cell coloring and styling
 * - Edge overlay rendering
 * - Value sprite generation and placement
 * - Array axis labels and grab handles
 * - Visibility and occlusion management
 * 
 * Dependencies:
 * - THREE.js
 * - Store (state management)
 * - Constants (COLORS, GEO_VOXEL, CHUNK_SIZE, etc.)
 * - Scene object (global scene, camera, renderer)
 */

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/**
 * Global state for voxel rendering
 * These would ideally be moved into a proper VoxelRenderManager class
 */
export const layerMeshes = new Map(); // InstancedMesh cache by key
export const chunkMeshes = new Map(); // Chunk mesh cache
export const valueSprites = new Map(); // Text sprites showing cell values

/**
 * ChunkVoxel - Manages rendering for a chunk of cells
 * Uses InstancedMesh for efficient rendering of many identical geometries
 */
export class ChunkVoxel {
  constructor(array, coord, cells) {
    this.array = array;
    this.coord = coord;
    this.cells = cells || [];
    this._dirty = true;
    this.currentLOD = null;
    
    // Instanced meshes for different rendering passes
    this.meshLOD1 = null; // High detail (per-cell instances)
    this.meshLOD2 = null; // Low detail (greedy meshed)
    this.meshGhost = null; // Ghost/occluded cells
    this.meshShell = null; // Cell outlines
    
    // Index mapping for picking
    this.index2cell = [];
    this.cellIndexMap = new Map();
    this.instancedMesh = null;
  }

  /**
   * Ensures instanced meshes exist with proper capacity
   * Creates pooled meshes for solid, ghost, and shell passes
   */
  ensureMesh() {
    if (this.instancedMesh && !this._dirty) return this.instancedMesh;
    
    const maxInstances = Math.max(1, this.cells.length);
    
    try {
      // Create or reuse meshes if they don't exist
      if (!this.meshLOD1 || !this.meshGhost || !this.meshShell) {
        // Get or create voxel geometry (must be provided by scene)
        const geom = window.GEO_VOXEL ? window.GEO_VOXEL.clone() : new THREE.BoxGeometry(0.9, 0.9, 0.9);
        
        // Material configuration
        const createMat = (pass) => {
          if (pass === 'ghost') {
            return new THREE.MeshBasicMaterial({
              color: 0xffffff,
              transparent: true,
              opacity: 0.20,
              depthWrite: false,
              depthTest: true,
              vertexColors: true,
              blending: THREE.AdditiveBlending
            });
          }
          // Solid/shell material
          return new THREE.MeshStandardMaterial({
            vertexColors: true,
            metalness: 0.05,
            roughness: 0.85
          });
        };
        
        // Create the three mesh passes
        const meshSolid = new THREE.InstancedMesh(geom, createMat('solid'), maxInstances);
        const meshGhost = new THREE.InstancedMesh(geom.clone(), createMat('ghost'), maxInstances);
        const meshShell = new THREE.InstancedMesh(geom.clone(), createMat('shell'), maxInstances);
        
        // Configure meshes
        [meshSolid, meshGhost, meshShell].forEach(mesh => {
          mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
          mesh.frustumCulled = false;
        });
        
        // Render order for proper layering
        meshSolid.renderOrder = 1;
        meshGhost.renderOrder = 2;
        meshShell.renderOrder = 2;
        
        // Allocate per-instance colors
        try {
          const colBufSolid = new Float32Array(maxInstances * 3);
          const colBufGhost = new Float32Array(maxInstances * 3);
          const colBufShell = new Float32Array(maxInstances * 3);
          
          meshSolid.instanceColor = new THREE.InstancedBufferAttribute(colBufSolid, 3);
          meshGhost.instanceColor = new THREE.InstancedBufferAttribute(colBufGhost, 3);
          meshShell.instanceColor = new THREE.InstancedBufferAttribute(colBufShell, 3);
          
          meshSolid.instanceColor.setUsage(THREE.DynamicDrawUsage);
          meshGhost.instanceColor.setUsage(THREE.DynamicDrawUsage);
          meshShell.instanceColor.setUsage(THREE.DynamicDrawUsage);
        } catch (e) {
          console.warn('Failed to allocate instance colors:', e);
        }
        
        // Parent under array frame or add to scene
        const parent = (this.array && this.array._frame) ? this.array._frame : window.scene;
        if (parent) {
          parent.add(meshSolid);
          parent.add(meshGhost);
          parent.add(meshShell);
        }
        
        // Store references
        this.meshLOD1 = meshSolid;
        this.meshGhost = meshGhost;
        this.meshShell = meshShell;
        this.instancedMesh = meshSolid;
        
        // Set initial visibility
        const lod = (this.currentLOD == null || this.currentLOD < 0) ? 1 : this.currentLOD;
        const fancyGraphics = window.FancyGraphics?.enabled || false;
        this.meshShell.visible = !fancyGraphics && (lod === 1);
        this.meshGhost.visible = true;
        
        // Tag for picking
        try {
          meshSolid.userData = { arrayId: this.array.id, chunk: this };
          meshGhost.userData = { arrayId: this.array.id, chunk: this };
          meshShell.userData = { arrayId: this.array.id, chunk: this };
        } catch (e) {}
      }
      
      // Build stable index map (sorted by z,y,x)
      const sorted = [...this.cells].sort((a, b) => (a.z - b.z) || (a.y - b.y) || (a.x - b.x));
      this.index2cell = sorted;
      this.cellIndexMap.clear();
      
      // Get scale and color functions from scene
      const arrayVoxelScale = window.Scene?.arrayVoxelScale || (() => 1);
      const localPos = window.Scene?.localPos || ((arr, x, y, z) => new THREE.Vector3(x, y, z));
      const baseHexForTypeKey = window.baseHexForTypeKey || (() => 0xffffff);
      
      const scale = arrayVoxelScale(this.array);
      const cellScale = scale * 0.9; // Slightly smaller for visual separation
      
      // Position and color each instance
      for (let i = 0; i < sorted.length; i++) {
        const c = sorted[i];
        this.cellIndexMap.set(`${c.x},${c.y},${c.z}`, i);
        
        // Transform
        const p = localPos(this.array, c.x, c.y, c.z);
        const temp = new THREE.Object3D();
        temp.position.copy(p);
        temp.rotation.set(0, 0, 0);
        temp.scale.set(cellScale, cellScale, cellScale);
        temp.updateMatrix();
        
        this.meshLOD1.setMatrixAt(i, temp.matrix);
        
        // Initialize ghost as hidden (zero scale)
        if (this.meshGhost) {
          const tempM = new THREE.Matrix4();
          tempM.identity();
          tempM.makeScale(0, 0, 0);
          this.meshGhost.setMatrixAt(i, tempM);
        }
        
        if (this.meshShell) {
          this.meshShell.setMatrixAt(i, temp.matrix);
        }
        
        // Color based on cell state
        try {
          const key = `${this.array.id}:${c.x},${c.y},${c.z}`;
          const Store = window.Store?.getState?.() || { sourceByCell: new Map() };
          const emitted = !!(Store.sourceByCell?.get?.(key));
          const isFormula = !!c.formula;
          const custom = c?.meta?.color;
          const hasValue = (c.value !== '' && c.value !== null && c.value !== undefined);
          
          let hex;
          if (isFormula) hex = baseHexForTypeKey('formula');
          else if (emitted) hex = baseHexForTypeKey('emitted');
          else hex = hasValue ? baseHexForTypeKey('value') : baseHexForTypeKey('empty');
          
          const col = new THREE.Color(custom || hex);
          col.convertSRGBToLinear();
          
          this.meshLOD1.setColorAt(i, col);
          
          if (this.meshGhost) {
            const ghostTint = col.clone();
            ghostTint.multiplyScalar(0.6);
            this.meshGhost.setColorAt(i, ghostTint);
          }
          
          if (this.meshShell) {
            const shellCol = col.clone();
            shellCol.offsetHSL(0, 0, -0.22);
            this.meshShell.setColorAt(i, shellCol);
          }
        } catch (e) {
          console.warn('Failed to set cell color:', e);
        }
      }
      
      // Update counts and mark for GPU upload
      this.meshLOD1.count = sorted.length;
      this.meshLOD1.instanceMatrix.needsUpdate = true;
      if (this.meshLOD1.instanceColor) this.meshLOD1.instanceColor.needsUpdate = true;
      
      if (this.meshGhost) {
        this.meshGhost.count = sorted.length;
        this.meshGhost.instanceMatrix.needsUpdate = true;
        if (this.meshGhost.instanceColor) this.meshGhost.instanceColor.needsUpdate = true;
      }
      
      if (this.meshShell) {
        this.meshShell.count = sorted.length;
        this.meshShell.instanceMatrix.needsUpdate = true;
        if (this.meshShell.instanceColor) this.meshShell.instanceColor.needsUpdate = true;
      }
      
      if (window.needsRender !== undefined) window.needsRender = true;
      
    } catch (e) {
      console.error('Failed to ensure mesh:', e);
    }
    
    return this.instancedMesh;
  }

  /**
   * Set Level of Detail for this chunk
   * @param {number} level - 1 for high detail (instanced), 2 for low detail (greedy)
   */
  setLOD(level) {
    if (this.currentLOD === level && !this._dirty) return;
    
    if (level === 1) {
      this.ensureMesh();
    } else if (level === 2) {
      // LOD2 would use greedy meshing - placeholder for now
      this.ensureMesh();
    }
    
    // Update visibility based on LOD level
    if (this.meshLOD1) {
      this.meshLOD1.visible = true;
      if (level === 1) {
        try {
          this.meshLOD1.material.transparent = false;
          this.meshLOD1.material.opacity = 1.0;
          this.meshLOD1.material.colorWrite = true;
          this.meshLOD1.material.depthWrite = true;
        } catch (e) {}
      } else {
        // Keep visible for raycasting but visually transparent
        try {
          this.meshLOD1.material.transparent = true;
          this.meshLOD1.material.opacity = 0.0;
          this.meshLOD1.material.colorWrite = false;
          this.meshLOD1.material.depthWrite = false;
        } catch (e) {}
      }
    }
    
    if (this.meshGhost) {
      this.meshGhost.visible = (level === 1);
    }
    
    if (this.meshShell) {
      const fancyGraphics = window.FancyGraphics?.enabled || false;
      this.meshShell.visible = (level === 1) && !fancyGraphics;
    }
    
    this.currentLOD = level;
    this._dirty = false;
  }
}

/**
 * Helper functions (these would typically be imported from Scene or utils)
 */

export function localPos(arr, x, y, z) {
  if (window.Scene?.localPos) {
    return window.Scene.localPos(arr, x, y, z);
  }
  // Fallback calculation
  const scale = arr.params?.voxelScale || 1;
  const lx = (x - arr.size.x / 2 + 0.5) * scale;
  const ly = ((arr.size.y - 1 - y) - arr.size.y / 2 + 0.5) * scale;
  const lz = ((arr.size.z - 1 - z) - arr.size.z / 2 + 0.5) * scale;
  return new THREE.Vector3(lx, ly, lz);
}

export function arrayVoxelScale(arr) {
  if (window.Scene?.arrayVoxelScale) {
    return window.Scene.arrayVoxelScale(arr);
  }
  return arr.params?.voxelScale || 1;
}

/**
 * Create a text sprite for displaying cell values
 */
export function makeValueSprite(text, options = {}) {
  const {
    fontSize = 48,
    color = '#000000',
    backgroundColor = 'transparent',
    padding = 8
  } = options;
  
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    context.font = `${fontSize}px 'Roboto Mono', monospace`;
    const metrics = context.measureText(text);
    const textWidth = metrics.width;
    
    canvas.width = textWidth + padding * 2;
    canvas.height = fontSize + padding * 2;
    
    // Set background
    if (backgroundColor !== 'transparent') {
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Draw text
    context.font = `${fontSize}px 'Roboto Mono', monospace`;
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    
    const material = new THREE.SpriteMaterial({
      map: texture,
      depthTest: true,
      depthWrite: false,
      transparent: true
    });
    material.toneMapped = false;
    
    const sprite = new THREE.Sprite(material);
    
    // Scale sprite to reasonable world size
    const targetHeight = 0.5;
    const aspect = canvas.width / canvas.height;
    sprite.scale.set(targetHeight * aspect, targetHeight, 1);
    
    return sprite;
  } catch (e) {
    console.error('Failed to create value sprite:', e);
    return null;
  }
}

/**
 * Update or create value sprite for a cell
 */
export function updateValueSprite(arr, x, y, z, cell) {
  if (!cell || cell.value === '' || cell.value === null || cell.value === undefined) {
    // Remove sprite if value is empty
    const key = `${arr.id}:${x},${y},${z}`;
    const sprite = valueSprites.get(key);
    if (sprite) {
      try {
        if (sprite.userData?.billboard && window.unmarkBillboard) {
          window.unmarkBillboard(sprite);
        }
        sprite.parent?.remove(sprite);
        sprite.material?.map?.dispose();
        sprite.material?.dispose();
      } catch (e) {}
      valueSprites.delete(key);
    }
    return;
  }
  
  const key = `${arr.id}:${x},${y},${z}`;
  const text = String(cell.value);
  
  // Create or update sprite
  let sprite = valueSprites.get(key);
  if (!sprite) {
    sprite = makeValueSprite(text);
    if (!sprite) return;
    
    valueSprites.set(key, sprite);
    
    // Add to array frame or scene
    const parent = (arr && arr._frame) ? arr._frame : window.scene;
    if (parent) {
      parent.add(sprite);
    }
    
    // Mark as billboard for camera-facing
    if (window.markBillboard) {
      window.markBillboard(sprite);
    }
    sprite.userData.billboard = true;
  }
  
  // Position sprite above cell
  const pos = localPos(arr, x, y, z);
  const scale = arrayVoxelScale(arr);
  sprite.position.set(pos.x, pos.y + scale * 0.6, pos.z);
  sprite.visible = !arr.hidden;
  
  return sprite;
}

/**
 * NOTE: This is a partial extraction of the voxel rendering system.
 * The complete system in merged2.html includes:
 * 
 * - renderArray() - Main array rendering orchestration
 * - renderCellGroup() - Renders groups of cells by type (filled, empty, formula, ghost)
 * - addEdgeOverlay() - Creates cell outline/border meshes
 * - buildAxes() - Generates coordinate axis labels (A-Z, 1-N, α-ω)
 * - syncVisibility() - Manages visibility state across all meshes
 * - Greedy meshing for LOD2 (buildMeshLOD2)
 * - Ghost cell visualization for formula dependencies
 * - Cell picking and raycasting integration
 * 
 * For full functionality, integrate with:
 * - Scene.js (scene, camera, renderer globals)
 * - Store.js (state management)
 * - Constants.js (COLORS, GEO_VOXEL, CHUNK_SIZE, etc.)
 * - CollisionHelpers.js (raycasting)
 * 
 * See merged2.html lines 23000-25000+ for complete implementation.
 */

export { ChunkVoxel as default };

