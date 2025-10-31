// ==================== UNIVERSAL ASSET REGISTRY ====================
// Central registry for all 3D asset creators
// Can be used by scale-ultra, sequence-builder, preview apps, and AI evaluator

import { getAssetContext } from './asset-context.js';

// Import asset creators from categories
import * as FurnitureAssets from './categories/furniture.js';
import * as BathroomAssets from './categories/bathroom.js';
import * as KitchenAssets from './categories/kitchen.js';
import * as DecorAssets from './categories/decor.js';
import * as ElectronicsAssets from './categories/electronics.js';
import * as OutdoorAssets from './categories/outdoor.js';
import * as FoodAssets from './categories/food.js';
import * as UtensilsAssets from './categories/utensils.js';
import * as BeveragesAssets from './categories/beverages.js';
import * as GroceriesAssets from './categories/groceries.js';
import * as OfficeAssets from './categories/office.js';
import * as CleaningAssets from './categories/cleaning.js';
import * as ToysAssets from './categories/toys.js';
import * as GamesAssets from './categories/games.js';
import * as SchoolAssets from './categories/school.js';
import * as ClothingAssets from './categories/clothing.js';
import * as BabyAssets from './categories/baby.js';
import * as BagsAssets from './categories/bags.js';
import * as CityAssets from './categories/city.js';
import * as PetsAssets from './categories/pets.js';
import * as LightingAssets from './categories/lighting.js';
import * as InstitutionalAssets from './categories/institutional.js';

/**
 * Asset Registry - maps asset IDs to creator functions
 * Each creator accepts: (spec, THREE, context)
 */
const ASSET_CREATORS = {
  // Furniture
  ...FurnitureAssets.creators,
  
  // Bathroom
  ...BathroomAssets.creators,
  
  // Kitchen
  ...KitchenAssets.creators,
  
  // Decor
  ...DecorAssets.creators,
  
  // Electronics
  ...ElectronicsAssets.creators,
  
  // Outdoor
  ...OutdoorAssets.creators,
  
  // Food
  ...FoodAssets.creators,
  
  // Utensils
  ...UtensilsAssets.creators,
  
  // Beverages
  ...BeveragesAssets.creators,
  
  // Groceries
  ...GroceriesAssets.creators,
  
  // Office Supplies
  ...OfficeAssets.creators,
  
  // Cleaning Supplies
  ...CleaningAssets.creators,
  
  // Toys & Games
  ...ToysAssets.creators,
  
  // Board Games
  ...GamesAssets.creators,
  
  // School & Gymnasium
  ...SchoolAssets.creators,
  
  // Clothing & Chores
  ...ClothingAssets.creators,
  
  // Baby Room
  ...BabyAssets.creators,
  
  // Bags & Luggage
  ...BagsAssets.creators,
  
  // City & Urban
  ...CityAssets.creators,
  
  // Pets
  ...PetsAssets.creators,
  
  // Lighting
  ...LightingAssets.creators,
  
  // Institutional (Schools, Gyms, Locker Rooms)
  ...InstitutionalAssets.creators
};

/**
 * Create an asset from the registry
 * @param {string} assetId - Asset identifier (e.g., 'bed', 'toilet', 'fridge')
 * @param {Object} spec - Asset specification with position, rotation, properties
 * @param {Object} THREE - Three.js library reference
 * @param {Object} context - Context with scene, objects, gridSize, etc.
 * @returns {THREE.Group|null} Created asset or null if not found
 */
export function createAsset(assetId, spec, THREE, context = {}) {
  const creator = ASSET_CREATORS[assetId];
  
  if (!creator) {
    console.warn(`Asset creator not found: ${assetId}`);
    return null;
  }
  
  // Build full context with defaults
  const fullContext = getAssetContext(spec, THREE, context);
  
  // Create and return the asset
  return creator(spec, THREE, fullContext);
}

/**
 * Get list of all available asset IDs
 * @returns {Array<string>}
 */
export function getAvailableAssets() {
  return Object.keys(ASSET_CREATORS);
}

/**
 * Get asset metadata
 * @param {string} assetId
 * @returns {Object|null}
 */
export function getAssetMetadata(assetId) {
  const creator = ASSET_CREATORS[assetId];
  return creator?.metadata || null;
}

/**
 * Check if asset exists in registry
 * @param {string} assetId
 * @returns {boolean}
 */
export function hasAsset(assetId) {
  return assetId in ASSET_CREATORS;
}

/**
 * Bulk create assets from array of specs
 * @param {Array<Object>} specs - Array of {assetId, ...spec}
 * @param {Object} THREE
 * @param {Object} context
 * @returns {Array<THREE.Group>}
 */
export function createAssets(specs, THREE, context = {}) {
  return specs
    .map(spec => createAsset(spec.assetId || spec.id, spec, THREE, context))
    .filter(asset => asset !== null);
}

