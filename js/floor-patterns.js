// ==================== FLOOR PATTERNS MODULE ====================
// Comprehensive floor pattern generation system
// Supports: tiles (multiple variants), hardwood (multiple patterns), carpet (with texture)

import * as THREE from 'three';

export const FloorPatterns = {
  
  // ==================== TILE PATTERNS ====================
  
  /**
   * Create bathroom tile floor - classic checkered or mosaic
   */
  createBathroomTile(scene, bounds, variant = 'checkered') {
    const group = new THREE.Group();
    
    const width = (bounds.maxX - bounds.minX);
    const depth = (bounds.maxZ - bounds.minZ);
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerZ = (bounds.minZ + bounds.maxZ) / 2;
    
    if (variant === 'checkered') {
      const tileSize = 0.3; // 30cm tiles
      const tilesX = Math.ceil(width / tileSize);
      const tilesZ = Math.ceil(depth / tileSize);
      
      for (let x = 0; x < tilesX; x++) {
        for (let z = 0; z < tilesZ; z++) {
          const isWhite = (x + z) % 2 === 0;
          const tileGeo = new THREE.BoxGeometry(tileSize - 0.005, 0.01, tileSize - 0.005);
          const tileMat = new THREE.MeshStandardMaterial({
            color: isWhite ? 0xf5f5f5 : 0x888888,
            roughness: 0.2,
            metalness: 0.1
          });
          const tile = new THREE.Mesh(tileGeo, tileMat);
          tile.position.set(
            bounds.minX + x * tileSize + tileSize / 2,
            0.005,
            bounds.minZ + z * tileSize + tileSize / 2
          );
          tile.receiveShadow = true;
          group.add(tile);
        }
      }
    } else if (variant === 'mosaic') {
      // Small mosaic tiles - 5cm each
      const tileSize = 0.05;
      const tilesX = Math.ceil(width / tileSize);
      const tilesZ = Math.ceil(depth / tileSize);
      const colors = [0xe8f4f8, 0xd4e9f0, 0xc0dde8, 0xacd2e0];
      
      for (let x = 0; x < tilesX; x++) {
        for (let z = 0; z < tilesZ; z++) {
          const color = colors[Math.floor(Math.random() * colors.length)];
          const tileGeo = new THREE.BoxGeometry(tileSize - 0.001, 0.008, tileSize - 0.001);
          const tileMat = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.3,
            metalness: 0.05
          });
          const tile = new THREE.Mesh(tileGeo, tileMat);
          tile.position.set(
            bounds.minX + x * tileSize + tileSize / 2,
            0.004,
            bounds.minZ + z * tileSize + tileSize / 2
          );
          tile.receiveShadow = true;
          group.add(tile);
        }
      }
    }
    
    group.position.set(0, 0, 0);
    scene.add(group);
    return group;
  },
  
  /**
   * Create large format tile - modern broad tiles
   */
  createBroadTile(scene, bounds, color = 0xd4d4d4) {
    const group = new THREE.Group();
    
    const width = (bounds.maxX - bounds.minX);
    const depth = (bounds.maxZ - bounds.minZ);
    
    // Large tiles: 60cm x 60cm
    const tileSize = 0.6;
    const tilesX = Math.ceil(width / tileSize);
    const tilesZ = Math.ceil(depth / tileSize);
    
    // Slight color variation for realism
    const colorVariations = [
      color,
      color - 0x0a0a0a,
      color + 0x0a0a0a,
      color - 0x050505
    ];
    
    for (let x = 0; x < tilesX; x++) {
      for (let z = 0; z < tilesZ; z++) {
        const tileColor = colorVariations[Math.floor(Math.random() * colorVariations.length)];
        const tileGeo = new THREE.BoxGeometry(tileSize - 0.008, 0.012, tileSize - 0.008);
        const tileMat = new THREE.MeshStandardMaterial({
          color: tileColor,
          roughness: 0.4,
          metalness: 0.1
        });
        const tile = new THREE.Mesh(tileGeo, tileMat);
        tile.position.set(
          bounds.minX + x * tileSize + tileSize / 2,
          0.006,
          bounds.minZ + z * tileSize + tileSize / 2
        );
        tile.receiveShadow = true;
        group.add(tile);
      }
    }
    
    scene.add(group);
    return group;
  },
  
  /**
   * Create industrial tile - concrete/cement look
   */
  createIndustrialTile(scene, bounds) {
    const group = new THREE.Group();
    
    const width = (bounds.maxX - bounds.minX);
    const depth = (bounds.maxZ - bounds.minZ);
    
    // Large industrial tiles: 1m x 1m
    const tileSize = 1.0;
    const tilesX = Math.ceil(width / tileSize);
    const tilesZ = Math.ceil(depth / tileSize);
    
    const baseColor = 0x7a7a7a;
    
    for (let x = 0; x < tilesX; x++) {
      for (let z = 0; z < tilesZ; z++) {
        // Add random variation for industrial look
        const variation = Math.random() * 0x181818;
        const tileColor = baseColor - variation;
        
        const tileGeo = new THREE.BoxGeometry(tileSize - 0.01, 0.015, tileSize - 0.01);
        const tileMat = new THREE.MeshStandardMaterial({
          color: tileColor,
          roughness: 0.9,
          metalness: 0.05
        });
        const tile = new THREE.Mesh(tileGeo, tileMat);
        tile.position.set(
          bounds.minX + x * tileSize + tileSize / 2,
          0.0075,
          bounds.minZ + z * tileSize + tileSize / 2
        );
        tile.receiveShadow = true;
        group.add(tile);
      }
    }
    
    scene.add(group);
    return group;
  },
  
  // ==================== HARDWOOD PATTERNS ====================
  
  /**
   * Create hardwood floor - long planks running along Z axis
   */
  createHardwoodLongPlanks(scene, bounds, woodColor = 0x8b4513) {
    const group = new THREE.Group();
    
    const width = (bounds.maxX - bounds.minX);
    const depth = (bounds.maxZ - bounds.minZ);
    
    const plankWidth = 0.12; // 12cm wide planks
    const plankLength = depth; // Full depth
    const numPlanks = Math.ceil(width / plankWidth);
    
    const woodColors = [
      woodColor,
      woodColor - 0x0a0a0a,
      woodColor + 0x050505,
      woodColor - 0x050505
    ];
    
    for (let i = 0; i < numPlanks; i++) {
      const color = woodColors[Math.floor(Math.random() * woodColors.length)];
      const plankGeo = new THREE.BoxGeometry(plankWidth - 0.002, 0.02, plankLength);
      const plankMat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.7,
        metalness: 0.1
      });
      
      const plank = new THREE.Mesh(plankGeo, plankMat);
      plank.position.set(
        bounds.minX + i * plankWidth + plankWidth / 2,
        0.01,
        (bounds.minZ + bounds.maxZ) / 2
      );
      plank.receiveShadow = true;
      group.add(plank);
    }
    
    scene.add(group);
    return group;
  },
  
  /**
   * Create hardwood floor - short planks with staggered pattern
   */
  createHardwoodShortPlanks(scene, bounds, woodColor = 0xa0522d) {
    const group = new THREE.Group();
    
    const width = (bounds.maxX - bounds.minX);
    const depth = (bounds.maxZ - bounds.minZ);
    
    const plankWidth = 0.10; // 10cm wide
    const plankLength = 0.8; // 80cm long
    const numRows = Math.ceil(depth / plankWidth);
    
    const woodColors = [
      woodColor,
      woodColor - 0x0f0f0f,
      woodColor + 0x080808,
      woodColor - 0x050505
    ];
    
    for (let row = 0; row < numRows; row++) {
      let xPos = bounds.minX;
      const offsetPattern = (row % 2 === 0) ? 0 : plankLength / 2;
      xPos += offsetPattern;
      
      while (xPos < bounds.maxX) {
        const remainingWidth = bounds.maxX - xPos;
        const actualLength = Math.min(plankLength, remainingWidth);
        
        if (actualLength < 0.1) break; // Don't create tiny planks
        
        const color = woodColors[Math.floor(Math.random() * woodColors.length)];
        const plankGeo = new THREE.BoxGeometry(actualLength - 0.002, 0.02, plankWidth - 0.002);
        const plankMat = new THREE.MeshStandardMaterial({
          color: color,
          roughness: 0.65,
          metalness: 0.15
        });
        
        const plank = new THREE.Mesh(plankGeo, plankMat);
        plank.position.set(
          xPos + actualLength / 2,
          0.01,
          bounds.minZ + row * plankWidth + plankWidth / 2
        );
        plank.receiveShadow = true;
        group.add(plank);
        
        xPos += actualLength;
      }
    }
    
    scene.add(group);
    return group;
  },
  
  /**
   * Create herringbone hardwood pattern
   */
  createHardwoodHerringbone(scene, bounds, woodColor = 0x8b6914) {
    const group = new THREE.Group();
    
    const width = (bounds.maxX - bounds.minX);
    const depth = (bounds.maxZ - bounds.minZ);
    
    const plankWidth = 0.08; // 8cm wide
    const plankLength = 0.5; // 50cm long
    const angle = Math.PI / 4; // 45 degrees
    
    const woodColors = [
      woodColor,
      woodColor - 0x0a0a0a,
      woodColor + 0x050505
    ];
    
    // Simplified herringbone - alternating diagonal planks
    const spacing = plankWidth * 1.5;
    const numRows = Math.ceil(depth / spacing);
    const numCols = Math.ceil(width / spacing);
    
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const color = woodColors[Math.floor(Math.random() * woodColors.length)];
        const plankGeo = new THREE.BoxGeometry(plankLength, 0.02, plankWidth - 0.002);
        const plankMat = new THREE.MeshStandardMaterial({
          color: color,
          roughness: 0.7,
          metalness: 0.1
        });
        
        const plank = new THREE.Mesh(plankGeo, plankMat);
        const rotationAngle = ((row + col) % 2 === 0) ? angle : -angle;
        plank.rotation.y = rotationAngle;
        plank.position.set(
          bounds.minX + col * spacing + spacing / 2,
          0.01,
          bounds.minZ + row * spacing + spacing / 2
        );
        plank.receiveShadow = true;
        group.add(plank);
      }
    }
    
    scene.add(group);
    return group;
  },
  
  /**
   * Create parquet hardwood pattern (small squares)
   */
  createHardwoodParquet(scene, bounds, woodColor = 0x704214) {
    const group = new THREE.Group();
    
    const width = (bounds.maxX - bounds.minX);
    const depth = (bounds.maxZ - bounds.minZ);
    
    const blockSize = 0.4; // 40cm square blocks
    const numBlocksX = Math.ceil(width / blockSize);
    const numBlocksZ = Math.ceil(depth / blockSize);
    
    const woodColors = [
      woodColor,
      woodColor - 0x0c0c0c,
      woodColor + 0x060606
    ];
    
    for (let bx = 0; bx < numBlocksX; bx++) {
      for (let bz = 0; bz < numBlocksZ; bz++) {
        // Each block has 4-5 mini planks
        const numPlanks = 4 + Math.floor(Math.random() * 2);
        const plankWidth = blockSize / numPlanks;
        const rotation = (bx + bz) % 2 === 0 ? 0 : Math.PI / 2;
        
        for (let p = 0; p < numPlanks; p++) {
          const color = woodColors[Math.floor(Math.random() * woodColors.length)];
          const plankGeo = new THREE.BoxGeometry(
            rotation === 0 ? blockSize - 0.004 : plankWidth - 0.002,
            0.02,
            rotation === 0 ? plankWidth - 0.002 : blockSize - 0.004
          );
          const plankMat = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.75,
            metalness: 0.1
          });
          
          const plank = new THREE.Mesh(plankGeo, plankMat);
          plank.position.set(
            bounds.minX + bx * blockSize + blockSize / 2,
            0.01,
            bounds.minZ + bz * blockSize + (rotation === 0 ? p * plankWidth + plankWidth / 2 : blockSize / 2)
          );
          if (rotation !== 0) {
            plank.position.x = bounds.minX + bx * blockSize + p * plankWidth + plankWidth / 2;
            plank.position.z = bounds.minZ + bz * blockSize + blockSize / 2;
          }
          plank.receiveShadow = true;
          group.add(plank);
        }
      }
    }
    
    scene.add(group);
    return group;
  },
  
  // ==================== CARPET PATTERNS ====================
  
  /**
   * Create plush carpet with subtle texture
   */
  createCarpetPlush(scene, bounds, color = 0x8b7355) {
    const group = new THREE.Group();
    
    const width = (bounds.maxX - bounds.minX);
    const depth = (bounds.maxZ - bounds.minZ);
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerZ = (bounds.minZ + bounds.maxZ) / 2;
    
    // Base carpet
    const carpetGeo = new THREE.PlaneGeometry(width, depth, 50, 50);
    
    // Add subtle height variation for texture
    const positions = carpetGeo.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      positions.setY(i, Math.random() * 0.008);
    }
    positions.needsUpdate = true;
    carpetGeo.computeVertexNormals();
    
    const carpetMat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.95,
      metalness: 0.0,
      flatShading: false
    });
    
    const carpet = new THREE.Mesh(carpetGeo, carpetMat);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(centerX, 0.005, centerZ);
    carpet.receiveShadow = true;
    group.add(carpet);
    
    scene.add(group);
    return group;
  },
  
  /**
   * Create short pile carpet (commercial/office style)
   */
  createCarpetShortPile(scene, bounds, color = 0x606060) {
    const group = new THREE.Group();
    
    const width = (bounds.maxX - bounds.minX);
    const depth = (bounds.maxZ - bounds.minZ);
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerZ = (bounds.minZ + bounds.maxZ) / 2;
    
    // Base carpet with minimal texture
    const carpetGeo = new THREE.PlaneGeometry(width, depth, 30, 30);
    
    // Very subtle height variation
    const positions = carpetGeo.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      positions.setY(i, Math.random() * 0.003);
    }
    positions.needsUpdate = true;
    carpetGeo.computeVertexNormals();
    
    const carpetMat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.9,
      metalness: 0.0
    });
    
    const carpet = new THREE.Mesh(carpetGeo, carpetMat);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(centerX, 0.003, centerZ);
    carpet.receiveShadow = true;
    group.add(carpet);
    
    scene.add(group);
    return group;
  },
  
  /**
   * Create textured carpet with pattern
   */
  createCarpetTextured(scene, bounds, primaryColor = 0x9b6b4f, secondaryColor = 0x7a5438) {
    const group = new THREE.Group();
    
    const width = (bounds.maxX - bounds.minX);
    const depth = (bounds.maxZ - bounds.minZ);
    
    // Create pattern using small segments
    const segmentSize = 0.15;
    const segmentsX = Math.ceil(width / segmentSize);
    const segmentsZ = Math.ceil(depth / segmentSize);
    
    for (let x = 0; x < segmentsX; x++) {
      for (let z = 0; z < segmentsZ; z++) {
        // Alternating pattern
        const useSecondary = (x + z) % 4 < 2;
        const color = useSecondary ? secondaryColor : primaryColor;
        
        const segGeo = new THREE.PlaneGeometry(segmentSize - 0.001, segmentSize - 0.001, 3, 3);
        
        // Add texture
        const positions = segGeo.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          positions.setY(i, Math.random() * 0.006);
        }
        positions.needsUpdate = true;
        segGeo.computeVertexNormals();
        
        const segMat = new THREE.MeshStandardMaterial({
          color: color,
          roughness: 0.92,
          metalness: 0.0
        });
        
        const segment = new THREE.Mesh(segGeo, segMat);
        segment.rotation.x = -Math.PI / 2;
        segment.position.set(
          bounds.minX + x * segmentSize + segmentSize / 2,
          0.004 + Math.random() * 0.002,
          bounds.minZ + z * segmentSize + segmentSize / 2
        );
        segment.receiveShadow = true;
        group.add(segment);
      }
    }
    
    scene.add(group);
    return group;
  },
  
  // ==================== HELPER FUNCTIONS ====================
  
  /**
   * Get random floor pattern
   */
  getRandomPattern() {
    const patterns = [
      'hardwood-long',
      'hardwood-short',
      'hardwood-herringbone',
      'hardwood-parquet',
      'tile-broad',
      'tile-industrial',
      'carpet-plush',
      'carpet-short',
      'carpet-textured'
    ];
    return patterns[Math.floor(Math.random() * patterns.length)];
  },
  
  /**
   * Create floor from pattern name
   */
  createFloor(scene, bounds, patternName, options = {}) {
    const gridSize = options.gridSize || 1;
    
    // Convert grid bounds to world bounds
    const worldBounds = {
      minX: bounds.minX * gridSize,
      maxX: bounds.maxX * gridSize,
      minZ: bounds.minZ * gridSize,
      maxZ: bounds.maxZ * gridSize
    };
    
    switch (patternName) {
      case 'hardwood-long':
        return this.createHardwoodLongPlanks(scene, worldBounds, options.color);
      case 'hardwood-short':
        return this.createHardwoodShortPlanks(scene, worldBounds, options.color);
      case 'hardwood-herringbone':
        return this.createHardwoodHerringbone(scene, worldBounds, options.color);
      case 'hardwood-parquet':
        return this.createHardwoodParquet(scene, worldBounds, options.color);
      case 'tile-bathroom-checkered':
        return this.createBathroomTile(scene, worldBounds, 'checkered');
      case 'tile-bathroom-mosaic':
        return this.createBathroomTile(scene, worldBounds, 'mosaic');
      case 'tile-broad':
        return this.createBroadTile(scene, worldBounds, options.color);
      case 'tile-industrial':
        return this.createIndustrialTile(scene, worldBounds);
      case 'carpet-plush':
        return this.createCarpetPlush(scene, worldBounds, options.color);
      case 'carpet-short':
        return this.createCarpetShortPile(scene, worldBounds, options.color);
      case 'carpet-textured':
        return this.createCarpetTextured(scene, worldBounds, options.primaryColor, options.secondaryColor);
      default:
        return this.createHardwoodLongPlanks(scene, worldBounds);
    }
  }
};

