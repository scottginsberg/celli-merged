// ==================== INTERIORS SYSTEM CONSTANTS ====================
// Extracted from scale-ultra.html - Constants, assets, and room configurations

// Grid and sizing constants
export const INTERIORS_GRID_SIZE = 0.6;
export const INTERIORS_WALL_HEIGHT = 2.5;
export const INTERIORS_WALL_THICKNESS = 0.1;

// Asset specifications
export const INTERIORS_ASSETS = {
  desk: {
    square: { width: 1, depth: 1, height: 0.75, legRadius: 0.04, legHeight: 0.7 },
    rectangle: { width: 1.5, depth: 0.75, height: 0.75, legRadius: 0.04, legHeight: 0.7 },
    circle: { radius: 0.5, height: 0.75, legRadius: 0.04, legHeight: 0.7 }
  },
  bed: { width: 1.5, depth: 2, height: 0.5, legHeight: 0.3 },
  childbed: { width: 0.9, depth: 1.4, height: 0.35, legHeight: 0.2 },
  toilet: { 
    bowlRadius: 0.22, 
    bowlHeight: 0.35,
    seatRadius: 0.24,
    tankWidth: 0.4,
    tankDepth: 0.15,
    tankHeight: 0.35
  },
  shower: { width: 1, depth: 1, height: 2 },
  counter: {
    width: 2.0,
    depth: 0.6,
    height: 0.9,
    thickness: 0.05,
    sinkWidth: 0.5,
    sinkDepth: 0.4,
    sinkHeight: 0.15
  },
  letterblock: { size: 0.08 },
  xylophone: { width: 0.35, depth: 0.15, height: 0.02 },
  toycar: { scale: 0.08 },
  toytrain: { carLength: 0.08, carWidth: 0.05, carHeight: 0.06 },
  traintrack: { segmentLength: 0.12, railWidth: 0.03, railHeight: 0.004 }
};

// Room configurations with proper shower/bathroom floor placement
export const INTERIORS_ROOM_CONFIGS = {
  studio: {
    name: 'Studio Apartment',
    mainRoom: 'studio',
    floorBounds: { minX: -6, maxX: 6, minZ: -6, maxZ: 6 },
    bathroom: { x: 4.5, z: -2, width: 3, depth: 6 },
    walls: [
      { x: -6, z: -6, dir: 'h', length: 12 },
      { x: -6, z: 6, dir: 'h', length: 12 },
      { x: -6, z: -6, dir: 'v', length: 12 },
      { x: 6, z: -6, dir: 'v', length: 12 },
      { x: 3, z: -6, dir: 'v', length: 5.2 },
      { x: 3, z: -0.8, dir: 'h', length: 3, hasDoor: true },
      { x: 6, z: -0.8, dir: 'v', length: 3.2 }
    ],
    kitchenPartition: { x: 1, z: -2, width: 3, depth: 2.4 },
    furniture: [
      // Bathroom (corner layout with sink)
      { type: 'toilet', x: 4.5, z: -4.5, rotation: 0 },
      { type: 'shower', x: 5.4, z: 0.5, rotation: 0 },
      { type: 'bathroomsink', x: 3.8, z: -4.5, rotation: Math.PI / 2 },
      
      // Living area
      { type: 'rug', x: -2, z: -1.5, width: 2.5, depth: 3, pattern: 'modern', rotation: 0 },
      { type: 'couch', x: -2, z: 0, rotation: Math.PI },
      { type: 'coffeetable', shape: 'rectangle', x: -2, z: -1.5, rotation: 0 },
      { type: 'tvstand', x: -2, z: -4.5, rotation: 0 },
      { type: 'tv', x: -2, z: -4.5, y: 0.55, rotation: 0 },
      { type: 'plant', x: -4, z: 2, rotation: 0 },
      { type: 'wallshelf', x: -5.8, z: -1, y: 1.6, rotation: Math.PI / 2 },
      { type: 'shelfunit', x: -5.5, z: 4.5, rotation: 0, height: 1.8, width: 0.8 },
      
      // Kitchen area with appliances
      { type: 'counter', x: 1, z: -2, rotation: Math.PI },
      { type: 'microwave', x: 2.2, z: -2, y: 0.95, rotation: Math.PI },
      { type: 'fridge', x: 2.8, z: -3.2, rotation: 0 },
      { type: 'fruitbowl', x: 1, z: -2, y: 0.95, rotation: 0 },
    ]
  },
  '1br': {
    name: '1 Bedroom',
    mainRoom: 'living',
    floorBounds: { minX: -7, maxX: 7, minZ: -6, maxZ: 8 },
    bathroom: { x: 5.5, z: -3.5, width: 3, depth: 5 },
    walls: [
      // Outer perimeter with EXIT DOOR
      { x: -7, z: -6, dir: 'h', length: 5 },
      { x: -2, z: -6, dir: 'h', length: 7, hasDoor: true }, // EXIT DOOR to outside
      { x: 5, z: -6, dir: 'h', length: 2 },
      { x: -7, z: 8, dir: 'h', length: 14 },  // Back
      { x: -7, z: -6, dir: 'v', length: 14 }, // Left
      { x: 7, z: -6, dir: 'v', length: 14 },  // Right
      
      // Living/Bedroom divider with DOOR TO MAIN ROOM
      { x: -7, z: 2, dir: 'h', length: 5 },
      { x: -2, z: 2, dir: 'h', length: 7, hasDoor: true },  // Bedroom door to living
      { x: 5, z: 2, dir: 'h', length: 2 },
      
      // Bathroom walls with DOOR TO MAIN ROOM (expanded for full tile coverage + clearance)
      { x: 4, z: -6, dir: 'v', length: 4.8 },
      { x: 4, z: -1.2, dir: 'h', length: 3, hasDoor: true }  // Bathroom door to living
    ],
    windows: [
      { x: -3, z: -6, dir: 'h', length: 2 },  // Living room window
      { x: -1.5, z: 8, dir: 'h', length: 3 }    // Bedroom window
    ],
    furniture: [
      // Entrance door
      { type: 'entrancedoor', x: 1, z: -6.2, rotation: 0 },
      
      // Living room (main)
      { type: 'rug', x: -2, z: -2.5, width: 2.5, depth: 3.5, pattern: 'persian', rotation: 0 },
      { type: 'couch', x: -2, z: -1, rotation: Math.PI },
      { type: 'coffeetable', shape: 'rectangle', x: -2, z: -2.5, rotation: 0 },
      { type: 'tvstand', x: -2, z: -5, rotation: 0 },
      { type: 'tv', x: -2, z: -5, y: 0.55, rotation: 0 },
      
      // Games on coffee table
      { type: 'gameboard', x: -2.3, z: -2.5, y: 0.42, rotation: 0.4, variant: 'chess' },
      { type: 'chesspawn', x: -2, z: -2.3, y: 0.42, color: 0xffffff },
      { type: 'chesspawn', x: -1.8, z: -2.6, y: 0.42, color: 0x1a1a1a },
      
      // Kitchen area with appliances
      { type: 'counter', x: -4, z: -1, rotation: 0 },
      { type: 'microwave', x: -3.2, z: -1, y: 0.95, rotation: 0 },
      { type: 'fridge', x: -6, z: -2.5, rotation: 0 },
      { type: 'fruitbowl', x: -4, z: -1, y: 0.95, rotation: 0 },
      { type: 'plate', x: -3.5, z: -1, y: 0.91, rotation: 0 },
      
      // Living room decorations
      { type: 'plant', x: -6, z: 0, rotation: 0 },
      { type: 'floorlamp', x: -5, z: -4, rotation: 0, lit: true },
      { type: 'artframe', size: 'large', x: -6.9, z: -2, y: 1.6, rotation: Math.PI / 2, wallMount: true },
      { type: 'wallshelf', x: 6.8, z: -1, y: 1.6, rotation: -Math.PI / 2 },
      
      // Bedroom (3 decorations required)
      { type: 'rug', x: 0, z: 5, width: 3, depth: 2.5, pattern: 'shag', rotation: 0 },
      { type: 'bed', x: 0, z: 5, rotation: 0 },
      { type: 'sidetable', x: -1.8, z: 5, rotation: 0 },
      { type: 'alarmclock', x: -1.8, z: 5, y: 0.55, rotation: 0, color: 0x4444ff },
      { type: 'closet', x: -6, z: 7, rotation: 0 },
      { type: 'computerdesk', x: 4, z: 6, rotation: -Math.PI / 2 },
      { type: 'shelfunit', x: 6.5, z: 6, rotation: Math.PI, height: 1.5, width: 0.6 },
      { type: 'plant', x: -3, z: 6, rotation: 0 },
      { type: 'artframe', size: 'medium', x: -6.9, z: 5, y: 1.5, rotation: Math.PI / 2, wallMount: true },
      { type: 'artframe', size: 'small', x: 2, z: 7.9, y: 1.4, rotation: Math.PI, wallMount: true },
      { type: 'clock', x: 5, z: 7.9, y: 2.0, rotation: Math.PI },
      
      // Bathroom (corner layout with sink)
      { type: 'toilet', x: 5.5, z: -4.5, rotation: 0 },
      { type: 'shower', x: 6.4, z: -1.2, rotation: 0 },
      { type: 'bathroomsink', x: 4.8, z: -4.5, rotation: Math.PI / 2 }
    ]
  },
  
  '2br': {
    name: '2 Bedroom',
    mainRoom: 'living',
    floorBounds: { minX: -9, maxX: 9, minZ: -6, maxZ: 8 },
    bathroom: { x: 7.5, z: -3.5, width: 3, depth: 5 },
    walls: [
      // Outer perimeter with EXIT DOOR
      { x: -9, z: -6, dir: 'h', length: 6 },
      { x: -3, z: -6, dir: 'h', length: 9, hasDoor: true },  // EXIT DOOR to outside
      { x: 6, z: -6, dir: 'h', length: 3 },
      { x: -9, z: 8, dir: 'h', length: 18 },
      { x: -9, z: -6, dir: 'v', length: 14 },
      { x: 9, z: -6, dir: 'v', length: 14 },
      
      // Living/Hallway divider (hallway connects to main)
      { x: -9, z: 2, dir: 'h', length: 6 },
      { x: -3, z: 2, dir: 'h', length: 10, hasDoor: true },  // Hallway door to living
      { x: 7, z: 2, dir: 'h', length: 2 },
      
      // Bedroom divider (middle wall)
      { x: 0, z: 2, dir: 'v', length: 6 },
      
      // Bedroom 1 door TO MAIN (hallway)
      { x: -9, z: 4.5, dir: 'h', length: 3.5, hasDoor: true },
      
      // Bedroom 2 door TO MAIN (hallway)
      { x: 1, z: 4.5, dir: 'h', length: 3.5, hasDoor: true },
      
      // Bathroom walls with DOOR TO MAIN (expanded for full tile coverage + clearance)
      { x: 6, z: -6, dir: 'v', length: 4.8 },
      { x: 6, z: -1.2, dir: 'h', length: 3, hasDoor: true }  // Bathroom door to living
    ],
    windows: [
      { x: -4, z: -6, dir: 'h', length: 2 },  // Living
      { x: -5, z: 8, dir: 'h', length: 3 },   // Bedroom 1
      { x: 3, z: 8, dir: 'h', length: 3 }     // Bedroom 2
    ],
    furniture: [
      // Entrance door
      { type: 'entrancedoor', x: 1, z: -6.2, rotation: 0 },
      
      // Living room (main)
      { type: 'couch', x: 0, z: -1, rotation: Math.PI },
      { type: 'coffeetable', shape: 'square', x: 0, z: -2.5, rotation: 0 },
      { type: 'tvstand', x: 0, z: -5, rotation: 0 },
      { type: 'tv', x: 0, z: -5, y: 0.55, rotation: 0 },
      
      // Games on coffee table
      { type: 'gameboard', x: -0.2, z: -2.5, y: 0.42, rotation: 0.1, variant: 'checkers' },
      { type: 'dice', x: 0.3, z: -2.3, y: 0.41, rotation: 0 },
      { type: 'pokerchip', x: 0.2, z: -2.7, y: 0.41, color: 0x1a1a1a },
      
      // Kitchen area with appliances
      { type: 'counter', x: -5, z: -2, rotation: 0 },
      { type: 'microwave', x: -4.2, z: -2, y: 0.95, rotation: 0 },
      { type: 'fridge', x: -8, z: -3, rotation: 0 },
      { type: 'fruitbowl', x: -5, z: -2, y: 0.95, rotation: 0 },
      { type: 'plate', x: -4.5, z: -2, y: 0.91, rotation: 0 },
      { type: 'bowl', x: -5.5, z: -2, y: 0.91, rotation: 0 },
      
      // Living room decorations
      { type: 'plant', x: 3, z: -1, rotation: 0 },
      { type: 'plant', x: -7, z: 0, rotation: 0 },
      { type: 'floorlamp', x: 4, z: -4, rotation: 0, lit: true },
      { type: 'artframe', size: 'large', x: -8.9, z: -2, y: 1.6, rotation: Math.PI / 2, wallMount: true },
      { type: 'artframe', size: 'medium', x: 8.9, z: -2, y: 1.5, rotation: -Math.PI / 2, wallMount: true },
      { type: 'wallshelf', x: -8.8, z: 0, y: 1.6, rotation: Math.PI / 2 },
      
      // Bedroom 1 (3 decorations required + closet) - LEFT side
      { type: 'rug', x: -4.5, z: 5, width: 3, depth: 2.5, pattern: 'persian', rotation: 0 },
      { type: 'bed', x: -4.5, z: 5, rotation: 0 },
      { type: 'sidetable', x: -6.5, z: 5, rotation: 0 },
      { type: 'alarmclock', x: -6.5, z: 5, y: 0.55, rotation: 0, color: 0xff4444 },
      { type: 'closet', x: -7.5, z: 3.5, rotation: 0 },
      { type: 'plant', x: -2.5, z: 6.5, rotation: 0 },
      { type: 'shelfunit', x: -2, z: 3, rotation: Math.PI, height: 1.8, width: 0.8 },
      { type: 'artframe', size: 'medium', x: -8.9, z: 4.5, y: 1.5, rotation: Math.PI / 2, wallMount: true },
      { type: 'artframe', size: 'small', x: -4.5, z: 7.9, y: 1.4, rotation: Math.PI, wallMount: true },
      { type: 'clock', x: -6.5, z: 7.9, y: 2.0, rotation: Math.PI },
      
      // Bedroom 2 (3 decorations required + closet + computer desk) - RIGHT side
      { type: 'rug', x: 4.5, z: 5, width: 3, depth: 2.5, pattern: 'shag', rotation: 0 },
      { type: 'bed', x: 4.5, z: 5, rotation: Math.PI },
      { type: 'sidetable', x: 6.5, z: 5, rotation: 0 },
      { type: 'alarmclock', x: 6.5, z: 5, y: 0.55, rotation: 0, color: 0x44ff44 },
      { type: 'closet', x: 7.5, z: 3.5, rotation: Math.PI },
      { type: 'computerdesk', x: 2, z: 6, rotation: Math.PI / 2 },
      { type: 'plant', x: 2.5, z: 6.5, rotation: 0 },
      { type: 'artframe', size: 'medium', x: 8.9, z: 4.5, y: 1.5, rotation: -Math.PI / 2, wallMount: true },
      { type: 'artframe', size: 'small', x: 4.5, z: 7.9, y: 1.4, rotation: Math.PI, wallMount: true },
      { type: 'clock', x: 6.5, z: 7.9, y: 2.0, rotation: Math.PI },
      
      // Bathroom (corner layout with sink)
      { type: 'toilet', x: 7.5, z: -4.5, rotation: 0 },
      { type: 'shower', x: 8.4, z: -1.2, rotation: 0 },
      { type: 'bathroomsink', x: 6.8, z: -4.5, rotation: Math.PI / 2 }
    ]
  },
  
  '3br': {
    name: '3 Bedroom (with Child Room)',
    mainRoom: 'living',
    floorBounds: { minX: -11, maxX: 11, minZ: -6, maxZ: 10 },
    walls: [
      // Outer perimeter with EXIT DOOR
      { x: -11, z: -6, dir: 'h', length: 7 },
      { x: -4, z: -6, dir: 'h', length: 11, hasDoor: true },  // EXIT DOOR to outside
      { x: 7, z: -6, dir: 'h', length: 4 },
      { x: -11, z: 10, dir: 'h', length: 22 },
      { x: -11, z: -6, dir: 'v', length: 16 },
      { x: 11, z: -6, dir: 'v', length: 16 },
      
      // Living/Hallway divider
      { x: -11, z: 2, dir: 'h', length: 7 },
      { x: -4, z: 2, dir: 'h', length: 13, hasDoor: true },  // Hallway door to living
      { x: 9, z: 2, dir: 'h', length: 2 },
      
      // Bedroom dividers (middle walls)
      { x: -2, z: 2, dir: 'v', length: 8 },  // Divider between bedroom 1 & 2
      { x: 5, z: 2, dir: 'v', length: 8 },   // Divider between bedroom 2 & 3
      
      // Bedroom doors TO MAIN (hallway)
      { x: -11, z: 5, dir: 'h', length: 4, hasDoor: true },  // Bedroom 1 door
      { x: -1, z: 5, dir: 'h', length: 4, hasDoor: true },   // Bedroom 2 door (child's room)
      { x: 6, z: 5, dir: 'h', length: 4, hasDoor: true },    // Bedroom 3 door
      
      // Bathroom walls with DOOR TO MAIN
      { x: 7, z: -6, dir: 'v', length: 4 },
      { x: 7, z: -2, dir: 'h', length: 4, hasDoor: true }  // Bathroom door to living
    ],
    windows: [
      { x: -5, z: -6, dir: 'h', length: 2 },   // Living
      { x: -7, z: 10, dir: 'h', length: 3 },   // Bedroom 1
      { x: 1, z: 10, dir: 'h', length: 3 },    // Bedroom 2 (child)
      { x: 8, z: 10, dir: 'h', length: 3 }     // Bedroom 3
    ],
    furniture: [
      // Entrance door
      { type: 'entrancedoor', x: 1, z: -6.2, rotation: 0 },
      
      // Living room (main)
      { type: 'couch', x: 0, z: -1, rotation: Math.PI },
      { type: 'coffeetable', shape: 'rectangle', x: 0, z: -2.8, rotation: 0 },
      { type: 'tvstand', x: 0, z: -5.2, rotation: 0 },
      { type: 'tv', x: 0, z: -5.2, y: 0.55, rotation: 0 },
      
      // Games on coffee table
      { type: 'gameboard', x: -0.3, z: -2.8, y: 0.42, rotation: 0.2, variant: 'chess' },
      { type: 'dice', x: 0.4, z: -2.6, y: 0.41, rotation: 0 },
      
      // Kitchen area with appliances
      { type: 'counter', x: -6, z: -2, rotation: 0 },
      { type: 'microwave', x: -5.2, z: -2, y: 0.95, rotation: 0 },
      { type: 'fridge', x: -9, z: -3.5, rotation: 0 },
      { type: 'fruitbowl', x: -6, z: -2, y: 0.95, rotation: 0 },
      { type: 'plate', x: -5.5, z: -2, y: 0.91, rotation: 0 },
      
      // Living room decorations
      { type: 'plant', x: 4, z: -1, rotation: 0 },
      { type: 'plant', x: -8, z: 0, rotation: 0 },
      { type: 'floorlamp', x: 5, z: -4.5, rotation: 0, lit: true },
      { type: 'artframe', size: 'large', x: -10.9, z: -2, y: 1.6, rotation: Math.PI / 2, wallMount: true },
      
      // Bedroom 1 (Master) - LEFT side
      { type: 'rug', x: -6, z: 6, width: 3.5, depth: 3, pattern: 'persian', rotation: 0 },
      { type: 'bed', x: -6, z: 6, rotation: 0 },
      { type: 'sidetable', x: -8.2, z: 6, rotation: 0 },
      { type: 'alarmclock', x: -8.2, z: 6, y: 0.55, rotation: 0, color: 0xff4444 },
      { type: 'closet', x: -9.5, z: 4, rotation: 0 },
      { type: 'plant', x: -3.5, z: 7.5, rotation: 0 },
      { type: 'artframe', size: 'medium', x: -10.9, z: 6, y: 1.5, rotation: Math.PI / 2, wallMount: true },
      { type: 'clock', x: -6, z: 9.9, y: 2.0, rotation: Math.PI },
      
      // Bedroom 2 (Children's Room with TWO beds) - MIDDLE
      { type: 'rug', x: 1.5, z: 6, width: 2.5, depth: 2.5, color: 0x88ccff, rotation: 0 },
      { type: 'bed', x: 0.3, z: 6.5, size: 'child', color: 'blue', rotation: 0 },  // Blue child bed (boy) with stars
      { type: 'bed', x: 2.7, z: 6.5, size: 'child', color: 'pink', rotation: 0 },  // Pink child bed (girl) with hearts
      { type: 'sidetable', x: -0.8, z: 6.5, rotation: 0 },
      { type: 'alarmclock', x: -0.8, z: 6.5, y: 0.55, rotation: 0, color: 0x4488ff },
      { type: 'closet', x: -1, z: 3.5, rotation: 0 },
      
      // Toys scattered around child's room
      { type: 'letterblock', x: 1.5, z: 4, y: 0, letters: ['A'], rotation: 0 },
      { type: 'letterblock', x: 1.7, z: 4.1, y: 0.08, letters: ['B'], rotation: 0.3 },
      { type: 'letterblock', x: 1.3, z: 4.15, y: 0.08, letters: ['C'], rotation: -0.2 },
      { type: 'xylophone', x: 3, z: 4.5, y: 0, rotation: Math.PI / 4 },
      { type: 'toycar', x: 2.5, z: 5.5, y: 0, color: 0xff0000, rotation: Math.PI / 3 },
      { type: 'toycar', x: 2.8, z: 5.3, y: 0, color: 0x0000ff, rotation: -Math.PI / 6 },
      { type: 'toytrain', x: 0.5, z: 8.5, y: 0, carCount: 3, rotation: Math.PI / 2 },
      { type: 'traintrack', x: 0.5, z: 8, y: 0, trackType: 'straight', segmentCount: 3, rotation: Math.PI / 2 },
      { type: 'traintrack', x: 2, z: 9.2, y: 0, trackType: 'curved', radius: 0.5, rotation: 0 },
      { type: 'pixarball', x: 3.5, z: 6, y: 0, rotation: 0 },
      
      // Child's room decorations
      { type: 'artframe', size: 'small', x: 1.5, z: 9.9, y: 1.2, rotation: Math.PI, wallMount: true },
      { type: 'plant', x: 3.5, z: 3, rotation: 0 },
      
      // Bedroom 3 (Guest/Teen Room) - RIGHT side
      { type: 'rug', x: 8, z: 6, width: 3, depth: 2.5, pattern: 'modern', rotation: 0 },
      { type: 'bed', x: 8, z: 6, rotation: Math.PI },
      { type: 'sidetable', x: 10, z: 6, rotation: 0 },
      { type: 'alarmclock', x: 10, z: 6, y: 0.55, rotation: 0, color: 0x44ff44 },
      { type: 'closet', x: 10, z: 3.5, rotation: Math.PI },
      { type: 'computerdesk', x: 6, z: 7, rotation: Math.PI / 2 },
      { type: 'desklamp', x: 6, z: 7, y: 0.75, lit: true, rotation: 0 },
      { type: 'plant', x: 6.5, z: 8, rotation: 0 },
      { type: 'artframe', size: 'medium', x: 10.9, z: 6, y: 1.5, rotation: -Math.PI / 2, wallMount: true },
      { type: 'clock', x: 8, z: 9.9, y: 2.0, rotation: Math.PI },
      
      // Bathroom (corner layout with sink)
      { type: 'toilet', x: 9, z: -4.5, rotation: 0 },
      { type: 'shower', x: 10, z: -1.2, rotation: 0 },
      { type: 'bathroomsink', x: 8, z: -4.5, rotation: Math.PI / 2 }
    ]
  }
};

// Furniture-to-props marriage system
// Each furniture type has an associated pool of surface props that can be placed on/near it
export const furniturePropsPool = {
  tvstand: [
    { type: 'tvremote', weight: 10 },
    { type: 'gamecontroller', controllerType: 'modern', weight: 8 },
    { type: 'gamecontroller', controllerType: 'retro', weight: 5 },
    { type: 'sodacan', weight: 4 },
    { type: 'dvdcase', weight: 3 }
  ],
  counter: [
    { type: 'plate', weight: 6 },
    { type: 'bowl', weight: 6 },
    { type: 'mug', weight: 8 },
    { type: 'fruitbowl', weight: 5 },
    { type: 'sodacan', weight: 4 },
    { type: 'papertowelroll', weight: 3 }
  ],
  computerdesk: [
    { type: 'mug', weight: 8 },
    { type: 'sodacan', weight: 6 },
    { type: 'desklamp', weight: 5 },
    { type: 'pen', weight: 4 },
    { type: 'notebook', weight: 4 }
  ],
  sidetable: [
    { type: 'alarmclock', weight: 8 },
    { type: 'desklamp', weight: 6 },
    { type: 'book', weight: 5 },
    { type: 'mug', weight: 4 },
    { type: 'tvremote', weight: 6 }
  ],
  coffeetable: [
    { type: 'sodacan', weight: 10 },
    { type: 'tvremote', weight: 8 },
    { type: 'gamecontroller', controllerType: 'modern', weight: 6 },
    { type: 'magazine', weight: 5 },
    { type: 'bowl', weight: 4 }
  ],
  couch: [  // Props on couch arms
    { type: 'sodacan', weight: 10, placement: 'arm' },
    { type: 'tvremote', weight: 8, placement: 'arm' },
    { type: 'gamecontroller', controllerType: 'modern', weight: 5, placement: 'arm' },
    { type: 'pillow', weight: 6, placement: 'seat' }
  ],
  bed: [
    { type: 'pillow', weight: 10 },
    { type: 'book', weight: 4 }
  ]
};

// Random props pool for variety (floor/general items)
export const miscPropsPool = [
  // Small decorative items
  { type: 'pixarball', weight: 5 },
  { type: 'basketball', weight: 3 },
  { type: 'toycar', weight: 4 },
  { type: 'buildingblocks', weight: 4 },
  { type: 'plant', weight: 8 },
  { type: 'artframe', size: 'small', weight: 6, wallMount: true },
  { type: 'clock', weight: 3, wallMount: true },
  // Medium items
  { type: 'rug', width: 2, depth: 1.5, pattern: 'modern', weight: 5 },
  { type: 'shoeRack', weight: 3 },
  { type: 'wastebasket', weight: 4 },
  { type: 'umbrella', weight: 2 },
  { type: 'umbrellastand', weight: 2 },
  // Pet items
  { type: 'dogfoodbowl', weight: 2 },
  { type: 'waterbowl', weight: 2 },
  { type: 'petbed', weight: 2 },
  { type: 'dogtoy', toyType: 'ball', weight: 3 },
  { type: 'cattower', weight: 1 },
  { type: 'litterbox', weight: 1 }
];


