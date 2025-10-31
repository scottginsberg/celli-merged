// ==================== INTERIORS METADATA SYSTEM ====================
// Enhanced metadata for furniture and prop placement

import * as THREE from 'three';

/**
 * Surface metadata - defines what can be placed on top of surfaces
 */
export const SURFACE_METADATA = {
  // Tables
  coffeetable: {
    isSurface: true,
    surfaceHeight: 0.4,
    gridSize: 0.15, // 15cm grid cells
    bounds: { width: 1.0, depth: 0.6 },
    validProps: ['book', 'magazine', 'remote', 'plant', 'bowl', 'plate', 'cup', 'mug', 'gameboard', 'dice', 'pokerchip', 'controller'],
    maxProps: 4
  },
  
  sidetable: {
    isSurface: true,
    surfaceHeight: 0.5,
    gridSize: 0.1,
    bounds: { width: 0.4, depth: 0.4 },
    validProps: ['lamp', 'clock', 'book', 'phone', 'alarmclock', 'plant'],
    maxProps: 2
  },
  
  diningtable: {
    isSurface: true,
    surfaceHeight: 0.75,
    gridSize: 0.2,
    bounds: { width: 1.8, depth: 0.9 },
    validProps: ['plate', 'bowl', 'cup', 'mug', 'fork', 'knife', 'spoon', 'napkin', 'vase', 'plant'],
    maxProps: 8,
    arrangement: 'place-settings' // Special arrangement mode
  },
  
  // Kitchen surfaces
  counter: {
    isSurface: true,
    surfaceHeight: 0.9,
    gridSize: 0.15,
    bounds: { width: 2.0, depth: 0.6 },
    validProps: ['microwave', 'toaster', 'blender', 'coffeemachine', 'plate', 'bowl', 'cup', 'fruitbowl', 'cerealbox', 'crackerbox'],
    maxProps: 5
  },
  
  // Office surfaces
  desk: {
    isSurface: true,
    surfaceHeight: 0.75,
    gridSize: 0.15,
    bounds: { width: 1.4, depth: 0.7 },
    validProps: ['laptop', 'monitor', 'keyboard', 'mouse', 'lamp', 'pen', 'pencil', 'notebook', 'phone', 'clock'],
    maxProps: 6,
    zones: {
      center: ['laptop', 'monitor'],
      left: ['lamp', 'notebook'],
      right: ['phone', 'clock']
    }
  },
  
  // Storage surfaces
  shelf: {
    isSurface: true,
    surfaceHeight: 0.8,
    gridSize: 0.2,
    bounds: { width: 1.2, depth: 0.3 },
    validProps: ['book', 'plant', 'clock', 'artframe', 'vase'],
    maxProps: 5
  },
  
  dresser: {
    isSurface: true,
    surfaceHeight: 0.9,
    gridSize: 0.15,
    bounds: { width: 1.0, depth: 0.5 },
    validProps: ['lamp', 'clock', 'plant', 'picture', 'jewelry'],
    maxProps: 3
  },
  
  nightstand: {
    isSurface: true,
    surfaceHeight: 0.5,
    gridSize: 0.1,
    bounds: { width: 0.5, depth: 0.4 },
    validProps: ['lamp', 'alarmclock', 'book', 'phone', 'glass'],
    maxProps: 2
  }
};

/**
 * Furniture zones - areas where furniture can be placed without clipping
 */
export const FURNITURE_ZONES = {
  studio: {
    living: { x: [-4, 0], z: [-4, 2], furniture: ['couch', 'coffeetable', 'tv', 'tvstand', 'plant'] },
    bedroom: { x: [-5, -2], z: [2, 5], furniture: ['bed', 'sidetable', 'dresser', 'plant'] },
    kitchen: { x: [1, 5], z: [-4, 0], furniture: ['counter', 'refrigerator'] },
    bathroom: { x: [3, 5], z: [-4, 1], furniture: ['toilet', 'shower', 'sink'] },
    entrance: { x: [-1, 1], z: [-5, -4], furniture: ['shoe', 'mat'] }
  },
  
  '1br': {
    living: { x: [-6, 2], z: [-5, 1], furniture: ['couch', 'coffeetable', 'tv', 'tvstand', 'plant', 'bookshelf'] },
    bedroom: { x: [-6, 2], z: [3, 7], furniture: ['bed', 'sidetable', 'dresser', 'plant', 'lamp'] },
    kitchen: { x: [3, 6], z: [-5, 1], furniture: ['counter', 'refrigerator', 'diningtable', 'chair'] },
    bathroom: { x: [3, 6], z: [3, 7], furniture: ['toilet', 'shower', 'sink', 'bathtub'] },
    entrance: { x: [-1, 1], z: [-5, -4], furniture: ['shoe', 'mat', 'plant'] }
  },
  
  '2br': {
    living: { x: [-7, 0], z: [-5, 1], furniture: ['couch', 'coffeetable', 'tv', 'tvstand', 'plant', 'bookshelf'] },
    bedroom1: { x: [-8, -4], z: [3, 7], furniture: ['bed', 'sidetable', 'dresser', 'plant'] },
    bedroom2: { x: [4, 8], z: [3, 7], furniture: ['bed', 'sidetable', 'desk', 'chair'] },
    kitchen: { x: [1, 8], z: [-5, 1], furniture: ['counter', 'refrigerator', 'diningtable', 'chair'] },
    bathroom: { x: [1, 3], z: [3, 7], furniture: ['toilet', 'shower', 'sink'] },
    entrance: { x: [-1, 1], z: [-5, -4], furniture: ['shoe', 'mat', 'plant'] }
  },
  
  classroom: {
    teaching: { x: [-6, 6], z: [-4, -2], furniture: ['desk', 'chair', 'whiteboard', 'chalkboard'] },
    students: { x: [-6, 6], z: [0, 6], furniture: ['studentdesk', 'chair'], grid: true },
    storage: { x: [-7, -6], z: [-4, 6], furniture: ['shelf', 'bookshelf', 'cabinet'] },
    back: { x: [6, 7], z: [-4, 6], furniture: ['shelf', 'cabinet', 'plant'] }
  },
  
  gymnasium: {
    center: { x: [-10, 10], z: [-8, 8], furniture: ['basketballhoop'], floor: 'hardwood-parquet' },
    bleachers: { x: [-12, -10], z: [-8, 8], furniture: ['bench'] },
    equipment: { x: [10, 12], z: [-8, 8], furniture: ['storage', 'mat', 'ball'] }
  }
};

/**
 * Relative placement policies - items that should be placed together
 */
export const PLACEMENT_POLICIES = {
  // TV setup
  tv_setup: {
    primary: 'tv',
    requires: ['tvstand'],
    optional: ['couch', 'coffeetable'],
    distance: { tvstand: 0, couch: 2.5, coffeetable: 1.8 },
    facing: true // Couch should face TV
  },
  
  // Bed setup
  bed_setup: {
    primary: 'bed',
    optional: ['sidetable', 'dresser', 'lamp'],
    distance: { sidetable: 0.8, dresser: 2.0 },
    sides: { sidetable: 'beside', dresser: 'opposite-wall' }
  },
  
  // Dining setup
  dining_setup: {
    primary: 'diningtable',
    requires: ['chair'],
    count: { chair: 4 },
    arrangement: 'around',
    distance: { chair: 0.6 }
  },
  
  // Kitchen setup
  kitchen_setup: {
    primary: 'counter',
    optional: ['refrigerator', 'microwave'],
    distance: { refrigerator: 1.5 },
    surfaces: true // Counter is a surface for props
  },
  
  // Bathroom setup
  bathroom_setup: {
    primary: 'toilet',
    optional: ['sink', 'shower'],
    distance: { sink: 1.0, shower: 1.5 },
    wallAligned: true
  },
  
  // Desk setup
  desk_setup: {
    primary: 'desk',
    requires: ['chair'],
    optional: ['lamp', 'computer'],
    distance: { chair: 0.5 },
    surfaces: true
  },
  
  // Seating group
  seating_group: {
    primary: 'couch',
    optional: ['coffeetable', 'plant', 'lamp'],
    distance: { coffeetable: 1.0, plant: 1.5, lamp: 1.2 },
    arrangement: 'conversation'
  }
};

/**
 * Wall decoration policies
 */
export const WALL_DECOR_POLICIES = {
  living: {
    items: ['artframe', 'mirror', 'clock', 'shelf'],
    density: 0.3, // 30% of walls decorated
    height: [1.4, 1.8],
    spacing: 1.5
  },
  
  bedroom: {
    items: ['artframe', 'mirror', 'clock'],
    density: 0.25,
    height: [1.5, 1.7],
    spacing: 2.0
  },
  
  kitchen: {
    items: ['clock', 'shelf'],
    density: 0.2,
    height: [1.6, 1.8],
    spacing: 2.0
  },
  
  bathroom: {
    items: ['mirror', 'shelf'],
    density: 0.3,
    height: [1.2, 1.4],
    spacing: 1.0
  },
  
  classroom: {
    items: ['whiteboard', 'chalkboard', 'clock', 'map', 'poster'],
    density: 0.4,
    height: [1.5, 2.0],
    spacing: 2.5
  },
  
  gymnasium: {
    items: ['clock', 'scoreboard', 'banner'],
    density: 0.15,
    height: [2.5, 3.0],
    spacing: 5.0
  }
};

/**
 * Floor pattern recommendations by room type
 */
export const FLOOR_PATTERNS_BY_ROOM = {
  studio: ['hardwood-short', 'hardwood-long', 'hardwood-parquet'],
  '1br': ['hardwood-short', 'hardwood-long', 'carpet-plush'],
  '2br': ['hardwood-short', 'hardwood-long', 'carpet-plush'],
  bathroom: ['tile-bathroom-checkered', 'tile-bathroom-mosaic', 'tile-broad'],
  kitchen: ['tile-broad', 'tile-industrial', 'hardwood-short'],
  classroom: ['tile-industrial', 'hardwood-parquet', 'carpet-short'],
  gymnasium: ['hardwood-parquet', 'hardwood-long']
};

/**
 * Get surface grid for prop placement
 */
export function getSurfaceGrid(surfaceType, surfacePosition, surfaceRotation) {
  const metadata = SURFACE_METADATA[surfaceType];
  if (!metadata || !metadata.isSurface) return null;
  
  const gridCells = [];
  const { width, depth } = metadata.bounds;
  const cellSize = metadata.gridSize;
  
  const cellsX = Math.floor(width / cellSize);
  const cellsZ = Math.floor(depth / cellSize);
  
  for (let x = 0; x < cellsX; x++) {
    for (let z = 0; z < cellsZ; z++) {
      const localX = (x - cellsX / 2) * cellSize;
      const localZ = (z - cellsZ / 2) * cellSize;
      
      // Transform to world position based on surface rotation
      const worldPos = new THREE.Vector3(localX, 0, localZ);
      worldPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), surfaceRotation);
      worldPos.add(surfacePosition);
      
      gridCells.push({
        x: worldPos.x,
        z: worldPos.z,
        y: metadata.surfaceHeight,
        occupied: false
      });
    }
  }
  
  return {
    cells: gridCells,
    validProps: metadata.validProps,
    maxProps: metadata.maxProps,
    arrangement: metadata.arrangement,
    zones: metadata.zones
  };
}

/**
 * Check if furniture placement is valid (no clipping)
 */
export function isPlacementValid(furniture, x, z, rotation, existingFurniture, zone) {
  const bounds = getFurnitureBounds(furniture, rotation);
  
  // Check zone boundaries
  if (zone) {
    if (x + bounds.width / 2 > zone.x[1] || x - bounds.width / 2 < zone.x[0]) return false;
    if (z + bounds.depth / 2 > zone.z[1] || z - bounds.depth / 2 < zone.z[0]) return false;
  }
  
  // Check collision with existing furniture
  for (const existing of existingFurniture) {
    const existingBounds = getFurnitureBounds(existing.type, existing.rotation);
    
    const dist = Math.sqrt(
      Math.pow(x - existing.x, 2) + 
      Math.pow(z - existing.z, 2)
    );
    
    const minDist = (bounds.width + existingBounds.width) / 2 + 0.3; // 30cm clearance
    
    if (dist < minDist) return false;
  }
  
  return true;
}

/**
 * Get approximate bounds for furniture type
 */
function getFurnitureBounds(type, rotation) {
  const bounds = {
    couch: { width: 1.8, depth: 0.9 },
    bed: { width: 2.0, depth: 1.5 },
    coffeetable: { width: 1.0, depth: 0.6 },
    diningtable: { width: 1.8, depth: 0.9 },
    desk: { width: 1.4, depth: 0.7 },
    counter: { width: 2.0, depth: 0.6 },
    dresser: { width: 1.0, depth: 0.5 },
    sidetable: { width: 0.5, depth: 0.4 },
    chair: { width: 0.5, depth: 0.5 },
    plant: { width: 0.3, depth: 0.3 }
  };
  
  const b = bounds[type] || { width: 0.5, depth: 0.5 };
  
  // Swap width/depth if rotated 90 degrees
  if (rotation === Math.PI / 2 || rotation === -Math.PI / 2) {
    return { width: b.depth, depth: b.width };
  }
  
  return b;
}

/**
 * Select random valid props for a surface
 */
export function selectSurfaceProps(surfaceType, count) {
  const metadata = SURFACE_METADATA[surfaceType];
  if (!metadata) return [];
  
  const maxCount = Math.min(count || metadata.maxProps, metadata.validProps.length);
  const selectedProps = [];
  const availableProps = [...metadata.validProps];
  
  for (let i = 0; i < maxCount; i++) {
    if (availableProps.length === 0) break;
    const index = Math.floor(Math.random() * availableProps.length);
    selectedProps.push(availableProps.splice(index, 1)[0]);
  }
  
  return selectedProps;
}

