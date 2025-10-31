/**
 * Comprehensive Asset Metadata Registry
 * Contains detailed metadata for all 3D assets including dimensions, categories, rooms, surfaces, and tags
 */

export const ASSET_METADATA = {
  // ==================== FURNITURE ====================
  bed: {
    id: 'bed',
    name: 'Bed',
    category: 'furniture',
    subcategory: 'bedroom',
    rooms: ['bedroom', 'hotel', 'dormitory', 'hospital'],
    surfaces: ['floor'],
    size: 'large', // small, medium, large, xlarge
    dimensions: { width: 2.0, height: 0.6, depth: 1.5 },
    volume: 1.8, // cubic meters
    weight: 'heavy', // light, medium, heavy
    interactive: false,
    tags: ['sleeping', 'furniture', 'comfort', 'bedroom'],
    description: 'Standard single or double bed with frame and mattress',
    price: 500,
    required: true,
    placementRules: ['against-wall', 'needs-clearance']
  },
  
  couch: {
    id: 'couch',
    name: 'Couch',
    category: 'furniture',
    subcategory: 'seating',
    rooms: ['livingroom', 'office', 'lobby', 'lounge'],
    surfaces: ['floor'],
    size: 'large',
    dimensions: { width: 2.0, height: 0.8, depth: 0.9 },
    volume: 1.44,
    weight: 'heavy',
    interactive: false,
    tags: ['seating', 'furniture', 'comfort', 'livingroom'],
    description: 'Comfortable three-seater couch',
    price: 800,
    required: false,
    placementRules: ['against-wall', 'center-piece']
  },
  
  chair: {
    id: 'chair',
    name: 'Chair',
    category: 'furniture',
    subcategory: 'seating',
    rooms: ['dining', 'office', 'bedroom', 'livingroom', 'classroom', 'conference'],
    surfaces: ['floor'],
    size: 'small',
    dimensions: { width: 0.5, height: 0.9, depth: 0.5 },
    volume: 0.225,
    weight: 'light',
    interactive: false,
    tags: ['seating', 'furniture', 'portable'],
    description: 'Standard dining or office chair',
    price: 100,
    required: false,
    placementRules: ['stackable', 'movable']
  },
  
  desk: {
    id: 'desk',
    name: 'Desk',
    category: 'furniture',
    subcategory: 'workspace',
    rooms: ['office', 'bedroom', 'study'],
    surfaces: ['floor'],
    size: 'large',
    dimensions: { width: 1.4, height: 0.75, depth: 0.7 },
    volume: 0.735,
    weight: 'heavy',
    interactive: true,
    tags: ['workspace', 'furniture', 'storage', 'drawers'],
    description: 'Office desk with drawers',
    price: 400,
    required: false,
    placementRules: ['against-wall', 'needs-clearance']
  },
  
  computerdesk: {
    id: 'computerdesk',
    name: 'Computer Desk',
    category: 'furniture',
    subcategory: 'workspace',
    rooms: ['office', 'bedroom', 'study', 'lab'],
    surfaces: ['floor'],
    size: 'large',
    dimensions: { width: 1.2, height: 0.75, depth: 0.6 },
    volume: 0.54,
    weight: 'medium',
    interactive: true,
    tags: ['workspace', 'technology', 'furniture'],
    description: 'Compact computer workstation',
    price: 350,
    required: false,
    placementRules: ['against-wall', 'near-outlet']
  },
  
  coffeetable: {
    id: 'coffeetable',
    name: 'Coffee Table',
    category: 'furniture',
    subcategory: 'tables',
    rooms: ['livingroom', 'lounge', 'lobby'],
    surfaces: ['floor'],
    size: 'medium',
    dimensions: { width: 1.2, height: 0.45, depth: 0.6 },
    volume: 0.324,
    weight: 'medium',
    interactive: false,
    tags: ['table', 'furniture', 'livingroom', 'centerpiece'],
    description: 'Low coffee table for living room',
    price: 250,
    required: false,
    placementRules: ['center-piece', 'clearance-around']
  },
  
  diningtable: {
    id: 'diningtable',
    name: 'Dining Table',
    category: 'furniture',
    subcategory: 'tables',
    rooms: ['dining', 'kitchen', 'cafeteria'],
    surfaces: ['floor'],
    size: 'large',
    dimensions: { width: 1.8, height: 0.75, depth: 0.9 },
    volume: 1.215,
    weight: 'heavy',
    interactive: false,
    tags: ['dining', 'table', 'furniture', 'family'],
    description: 'Large dining table for family meals',
    price: 600,
    required: false,
    placementRules: ['center-room', 'clearance-around']
  },
  
  sidetable: {
    id: 'sidetable',
    name: 'Side Table',
    category: 'furniture',
    subcategory: 'tables',
    rooms: ['livingroom', 'bedroom', 'office', 'lobby'],
    surfaces: ['floor'],
    size: 'small',
    dimensions: { width: 0.5, height: 0.6, depth: 0.5 },
    volume: 0.15,
    weight: 'light',
    interactive: false,
    tags: ['table', 'furniture', 'accent', 'portable'],
    description: 'Small accent or end table',
    price: 80,
    required: false,
    placementRules: ['near-seating', 'movable']
  },
  
  nightstand: {
    id: 'nightstand',
    name: 'Nightstand',
    category: 'furniture',
    subcategory: 'storage',
    rooms: ['bedroom', 'hotel'],
    surfaces: ['floor'],
    size: 'small',
    dimensions: { width: 0.5, height: 0.6, depth: 0.4 },
    volume: 0.12,
    weight: 'light',
    interactive: true,
    tags: ['bedroom', 'storage', 'furniture', 'bedside'],
    description: 'Bedside table with drawer',
    price: 150,
    required: false,
    placementRules: ['beside-bed', 'against-wall']
  },
  
  dresser: {
    id: 'dresser',
    name: 'Dresser',
    category: 'furniture',
    subcategory: 'storage',
    rooms: ['bedroom', 'hotel', 'closet'],
    surfaces: ['floor'],
    size: 'large',
    dimensions: { width: 1.2, height: 1.0, depth: 0.5 },
    volume: 0.6,
    weight: 'heavy',
    interactive: true,
    tags: ['storage', 'bedroom', 'furniture', 'drawers'],
    description: 'Large dresser with multiple drawers',
    price: 500,
    required: false,
    placementRules: ['against-wall']
  },
  
  bookshelf: {
    id: 'bookshelf',
    name: 'Bookshelf',
    category: 'furniture',
    subcategory: 'storage',
    rooms: ['office', 'study', 'library', 'livingroom', 'bedroom'],
    surfaces: ['floor'],
    size: 'large',
    dimensions: { width: 1.0, height: 2.0, depth: 0.3 },
    volume: 0.6,
    weight: 'medium',
    interactive: false,
    tags: ['storage', 'books', 'furniture', 'display'],
    description: 'Tall bookshelf with multiple shelves',
    price: 300,
    required: false,
    placementRules: ['against-wall', 'stable-mount']
  },
  
  tvstand: {
    id: 'tvstand',
    name: 'TV Stand',
    category: 'furniture',
    subcategory: 'entertainment',
    rooms: ['livingroom', 'bedroom', 'hotel', 'lounge'],
    surfaces: ['floor'],
    size: 'medium',
    dimensions: { width: 1.5, height: 0.5, depth: 0.4 },
    volume: 0.3,
    weight: 'medium',
    interactive: true,
    tags: ['entertainment', 'storage', 'furniture', 'media'],
    description: 'Entertainment center with storage',
    price: 250,
    required: false,
    placementRules: ['against-wall', 'cable-management']
  },
  
  // ==================== KITCHEN APPLIANCES ====================
  refrigerator: {
    id: 'refrigerator',
    name: 'Refrigerator',
    category: 'kitchen',
    subcategory: 'appliances',
    rooms: ['kitchen', 'breakroom', 'cafeteria'],
    surfaces: ['floor'],
    size: 'large',
    dimensions: { width: 0.8, height: 1.8, depth: 0.7 },
    volume: 1.008,
    weight: 'heavy',
    interactive: true,
    tags: ['appliance', 'kitchen', 'cooling', 'food-storage'],
    description: 'Full-size refrigerator with freezer',
    price: 1200,
    required: true,
    placementRules: ['against-wall', 'near-outlet', 'ventilation']
  },
  
  microwave: {
    id: 'microwave',
    name: 'Microwave',
    category: 'kitchen',
    subcategory: 'appliances',
    rooms: ['kitchen', 'breakroom', 'office'],
    surfaces: ['countertop', 'shelf'],
    size: 'small',
    dimensions: { width: 0.5, height: 0.3, depth: 0.4 },
    volume: 0.06,
    weight: 'medium',
    interactive: true,
    tags: ['appliance', 'kitchen', 'cooking', 'heating'],
    description: 'Countertop microwave oven',
    price: 200,
    required: false,
    placementRules: ['elevated-surface', 'near-outlet', 'clearance']
  },
  
  counter: {
    id: 'counter',
    name: 'Kitchen Counter',
    category: 'kitchen',
    subcategory: 'fixtures',
    rooms: ['kitchen', 'breakroom', 'cafeteria', 'lab'],
    surfaces: ['floor'],
    size: 'xlarge',
    dimensions: { width: 2.0, height: 0.9, depth: 0.6 },
    volume: 1.08,
    weight: 'heavy',
    interactive: true,
    tags: ['counter', 'kitchen', 'workspace', 'storage'],
    description: 'Kitchen counter with cabinets and drawers',
    price: 800,
    required: true,
    placementRules: ['against-wall', 'plumbing-access']
  },
  
  sink: {
    id: 'sink',
    name: 'Sink',
    category: 'kitchen',
    subcategory: 'fixtures',
    rooms: ['kitchen', 'bathroom', 'lab', 'utility'],
    surfaces: ['countertop', 'built-in'],
    size: 'medium',
    dimensions: { width: 0.6, height: 0.2, depth: 0.5 },
    volume: 0.06,
    weight: 'heavy',
    interactive: false,
    tags: ['plumbing', 'fixture', 'water', 'cleaning'],
    description: 'Stainless steel sink with faucet',
    price: 300,
    required: true,
    placementRules: ['plumbing-required', 'countertop-mount']
  },
  
  // ==================== BATHROOM FIXTURES ====================
  toilet: {
    id: 'toilet',
    name: 'Toilet',
    category: 'bathroom',
    subcategory: 'fixtures',
    rooms: ['bathroom', 'restroom', 'hotel'],
    surfaces: ['floor'],
    size: 'medium',
    dimensions: { width: 0.5, height: 0.75, depth: 0.7 },
    volume: 0.2625,
    weight: 'heavy',
    interactive: true,
    tags: ['bathroom', 'plumbing', 'fixture', 'sanitary'],
    description: 'Standard toilet with tank',
    price: 400,
    required: true,
    placementRules: ['plumbing-required', 'privacy', 'against-wall']
  },
  
  bathtub: {
    id: 'bathtub',
    name: 'Bathtub',
    category: 'bathroom',
    subcategory: 'fixtures',
    rooms: ['bathroom', 'hotel'],
    surfaces: ['floor'],
    size: 'large',
    dimensions: { width: 1.7, height: 0.6, depth: 0.8 },
    volume: 0.816,
    weight: 'heavy',
    interactive: false,
    tags: ['bathroom', 'plumbing', 'bathing', 'relaxation'],
    description: 'Full-size bathtub',
    price: 800,
    required: false,
    placementRules: ['plumbing-required', 'drainage', 'against-wall']
  },
  
  shower: {
    id: 'shower',
    name: 'Shower',
    category: 'bathroom',
    subcategory: 'fixtures',
    rooms: ['bathroom', 'gym', 'hotel'],
    surfaces: ['floor'],
    size: 'medium',
    dimensions: { width: 0.9, height: 2.2, depth: 0.9 },
    volume: 1.782,
    weight: 'heavy',
    interactive: true,
    tags: ['bathroom', 'plumbing', 'bathing', 'hygiene'],
    description: 'Enclosed shower stall',
    price: 600,
    required: false,
    placementRules: ['plumbing-required', 'drainage', 'waterproof']
  },
  
  mirror: {
    id: 'mirror',
    name: 'Mirror',
    category: 'bathroom',
    subcategory: 'fixtures',
    rooms: ['bathroom', 'bedroom', 'hallway', 'dance-studio'],
    surfaces: ['wall'],
    size: 'medium',
    dimensions: { width: 0.8, height: 1.0, depth: 0.05 },
    volume: 0.04,
    weight: 'medium',
    interactive: false,
    tags: ['bathroom', 'decor', 'reflective', 'grooming'],
    description: 'Wall-mounted mirror',
    price: 100,
    required: false,
    placementRules: ['wall-mount', 'above-sink']
  },
  
  towelrack: {
    id: 'towelrack',
    name: 'Towel Rack',
    category: 'bathroom',
    subcategory: 'accessories',
    rooms: ['bathroom', 'gym', 'pool'],
    surfaces: ['wall'],
    size: 'small',
    dimensions: { width: 0.6, height: 0.1, depth: 0.15 },
    volume: 0.009,
    weight: 'light',
    interactive: false,
    tags: ['bathroom', 'storage', 'towels', 'accessory'],
    description: 'Wall-mounted towel bar',
    price: 30,
    required: false,
    placementRules: ['wall-mount', 'near-shower']
  },
  
  // ==================== ELECTRONICS ====================
  tv: {
    id: 'tv',
    name: 'Television',
    category: 'electronics',
    subcategory: 'entertainment',
    rooms: ['livingroom', 'bedroom', 'hotel', 'lounge', 'bar'],
    surfaces: ['wall', 'stand'],
    size: 'large',
    dimensions: { width: 1.2, height: 0.7, depth: 0.1 },
    volume: 0.084,
    weight: 'medium',
    interactive: false,
    tags: ['electronics', 'entertainment', 'media', 'display'],
    description: 'Flat-screen television',
    price: 800,
    required: false,
    placementRules: ['viewing-distance', 'cable-management', 'wall-or-stand']
  },
  
  gameconsole: {
    id: 'gameconsole',
    name: 'Game Console',
    category: 'electronics',
    subcategory: 'entertainment',
    rooms: ['livingroom', 'bedroom', 'gameroom'],
    surfaces: ['shelf', 'stand'],
    size: 'small',
    dimensions: { width: 0.3, height: 0.1, depth: 0.25 },
    volume: 0.0075,
    weight: 'light',
    interactive: false,
    tags: ['electronics', 'gaming', 'entertainment', 'media'],
    description: 'Video game console',
    price: 500,
    required: false,
    placementRules: ['ventilation', 'near-tv', 'cable-access']
  },
  
  // ==================== DECOR & LIGHTING ====================
  lamp: {
    id: 'lamp',
    name: 'Table Lamp',
    category: 'decor',
    subcategory: 'lighting',
    rooms: ['livingroom', 'bedroom', 'office', 'hotel'],
    surfaces: ['table', 'desk', 'nightstand'],
    size: 'small',
    dimensions: { width: 0.2, height: 0.5, depth: 0.2 },
    volume: 0.02,
    weight: 'light',
    interactive: true,
    tags: ['lighting', 'decor', 'ambient', 'portable'],
    description: 'Decorative table lamp',
    price: 60,
    required: false,
    placementRules: ['elevated-surface', 'near-outlet']
  },
  
  desklamp: {
    id: 'desklamp',
    name: 'Desk Lamp',
    category: 'decor',
    subcategory: 'lighting',
    rooms: ['office', 'bedroom', 'study'],
    surfaces: ['desk', 'table'],
    size: 'small',
    dimensions: { width: 0.15, height: 0.4, depth: 0.15 },
    volume: 0.009,
    weight: 'light',
    interactive: true,
    tags: ['lighting', 'workspace', 'task-lighting', 'adjustable'],
    description: 'Adjustable desk lamp for workspace',
    price: 50,
    required: false,
    placementRules: ['desk-mount', 'near-outlet']
  },
  
  floorlamp: {
    id: 'floorlamp',
    name: 'Floor Lamp',
    category: 'decor',
    subcategory: 'lighting',
    rooms: ['livingroom', 'bedroom', 'office', 'corner'],
    surfaces: ['floor'],
    size: 'medium',
    dimensions: { width: 0.3, height: 1.6, depth: 0.3 },
    volume: 0.144,
    weight: 'medium',
    interactive: true,
    tags: ['lighting', 'decor', 'ambient', 'tall'],
    description: 'Standing floor lamp',
    price: 120,
    required: false,
    placementRules: ['corner-placement', 'stable-base', 'near-outlet']
  },
  
  plant: {
    id: 'plant',
    name: 'Potted Plant',
    category: 'decor',
    subcategory: 'plants',
    rooms: ['livingroom', 'office', 'lobby', 'bedroom', 'bathroom'],
    surfaces: ['floor', 'table', 'desk'],
    size: 'small',
    dimensions: { width: 0.3, height: 0.6, depth: 0.3 },
    volume: 0.054,
    weight: 'light',
    interactive: false,
    tags: ['decor', 'nature', 'plants', 'air-quality'],
    description: 'Decorative potted plant',
    price: 40,
    required: false,
    placementRules: ['natural-light', 'stable-surface']
  },
  
  artframe: {
    id: 'artframe',
    name: 'Art Frame',
    category: 'decor',
    subcategory: 'wall-art',
    rooms: ['livingroom', 'bedroom', 'office', 'hallway', 'gallery'],
    surfaces: ['wall'],
    size: 'medium',
    dimensions: { width: 0.8, height: 1.0, depth: 0.05 },
    volume: 0.04,
    weight: 'light',
    interactive: false,
    tags: ['decor', 'art', 'wall-decor', 'aesthetic'],
    description: 'Framed artwork or photograph',
    price: 150,
    required: false,
    placementRules: ['wall-mount', 'eye-level', 'lighting']
  },
  
  clock: {
    id: 'clock',
    name: 'Wall Clock',
    category: 'decor',
    subcategory: 'functional',
    rooms: ['office', 'kitchen', 'livingroom', 'classroom', 'hallway'],
    surfaces: ['wall'],
    size: 'small',
    dimensions: { width: 0.3, height: 0.3, depth: 0.05 },
    volume: 0.0045,
    weight: 'light',
    interactive: false,
    tags: ['time', 'functional', 'decor', 'wall-mount'],
    description: 'Wall-mounted clock',
    price: 30,
    required: false,
    placementRules: ['wall-mount', 'visible', 'battery-access']
  },
  
  rug: {
    id: 'rug',
    name: 'Area Rug',
    category: 'decor',
    subcategory: 'textiles',
    rooms: ['livingroom', 'bedroom', 'office', 'hallway'],
    surfaces: ['floor'],
    size: 'large',
    dimensions: { width: 2.4, height: 0.01, depth: 1.8 },
    volume: 0.0432,
    weight: 'medium',
    interactive: false,
    tags: ['decor', 'textile', 'comfort', 'floor-covering'],
    description: 'Decorative area rug',
    price: 200,
    required: false,
    placementRules: ['under-furniture', 'flat-surface']
  }
};

/**
 * Get all unique categories
 */
export function getCategories() {
  const categories = new Set();
  Object.values(ASSET_METADATA).forEach(asset => {
    categories.add(asset.category);
  });
  return Array.from(categories).sort();
}

/**
 * Get all unique subcategories
 */
export function getSubcategories() {
  const subcategories = new Set();
  Object.values(ASSET_METADATA).forEach(asset => {
    if (asset.subcategory) {
      subcategories.add(asset.subcategory);
    }
  });
  return Array.from(subcategories).sort();
}

/**
 * Get all unique rooms
 */
export function getRooms() {
  const rooms = new Set();
  Object.values(ASSET_METADATA).forEach(asset => {
    if (asset.rooms) {
      asset.rooms.forEach(room => rooms.add(room));
    }
  });
  return Array.from(rooms).sort();
}

/**
 * Get all unique surfaces
 */
export function getSurfaces() {
  const surfaces = new Set();
  Object.values(ASSET_METADATA).forEach(asset => {
    if (asset.surfaces) {
      asset.surfaces.forEach(surface => surfaces.add(surface));
    }
  });
  return Array.from(surfaces).sort();
}

/**
 * Get all unique sizes
 */
export function getSizes() {
  return ['small', 'medium', 'large', 'xlarge'];
}

/**
 * Filter assets by criteria
 */
export function filterAssets(criteria) {
  return Object.values(ASSET_METADATA).filter(asset => {
    if (criteria.category && asset.category !== criteria.category) return false;
    if (criteria.subcategory && asset.subcategory !== criteria.subcategory) return false;
    if (criteria.room && !asset.rooms.includes(criteria.room)) return false;
    if (criteria.surface && !asset.surfaces.includes(criteria.surface)) return false;
    if (criteria.size && asset.size !== criteria.size) return false;
    if (criteria.search) {
      const searchLower = criteria.search.toLowerCase();
      const matchesName = asset.name.toLowerCase().includes(searchLower);
      const matchesTags = asset.tags.some(tag => tag.toLowerCase().includes(searchLower));
      const matchesDescription = asset.description.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesTags && !matchesDescription) return false;
    }
    return true;
  });
}

/**
 * Sort assets by various criteria
 */
export function sortAssets(assets, sortBy = 'name', order = 'asc') {
  const sorted = [...assets].sort((a, b) => {
    let compareA, compareB;
    
    switch (sortBy) {
      case 'name':
        compareA = a.name.toLowerCase();
        compareB = b.name.toLowerCase();
        break;
      case 'size':
        const sizeOrder = { small: 1, medium: 2, large: 3, xlarge: 4 };
        compareA = sizeOrder[a.size] || 0;
        compareB = sizeOrder[b.size] || 0;
        break;
      case 'volume':
        compareA = a.volume || 0;
        compareB = b.volume || 0;
        break;
      case 'price':
        compareA = a.price || 0;
        compareB = b.price || 0;
        break;
      case 'category':
        compareA = a.category.toLowerCase();
        compareB = b.category.toLowerCase();
        break;
      default:
        compareA = a.name.toLowerCase();
        compareB = b.name.toLowerCase();
    }
    
    if (compareA < compareB) return order === 'asc' ? -1 : 1;
    if (compareA > compareB) return order === 'asc' ? 1 : -1;
    return 0;
  });
  
  return sorted;
}

/**
 * Get asset metadata by ID
 */
export function getAssetMetadata(id) {
  return ASSET_METADATA[id] || null;
}

/**
 * Get asset hierarchy (category -> subcategory -> assets)
 */
export function getAssetHierarchy() {
  const hierarchy = {};
  
  Object.values(ASSET_METADATA).forEach(asset => {
    if (!hierarchy[asset.category]) {
      hierarchy[asset.category] = {};
    }
    
    const subcategory = asset.subcategory || 'other';
    if (!hierarchy[asset.category][subcategory]) {
      hierarchy[asset.category][subcategory] = [];
    }
    
    hierarchy[asset.category][subcategory].push(asset);
  });
  
  // Sort assets within each subcategory
  Object.keys(hierarchy).forEach(category => {
    Object.keys(hierarchy[category]).forEach(subcategory => {
      hierarchy[category][subcategory].sort((a, b) => a.name.localeCompare(b.name));
    });
  });
  
  return hierarchy;
}

