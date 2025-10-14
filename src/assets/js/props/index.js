import * as THREE from 'three';
import { createFilmCameraProp } from './FilmCameraProp.js';
import { createFilmReelProp } from './FilmReelProp.js';
import { createFilmStripProp } from './FilmStripProp.js';
import { PROP_CATALOG } from './propCatalog.js';

const FACTORIES = {
  filmCamera: createFilmCameraProp,
  filmReel: createFilmReelProp,
  filmStrip: createFilmStripProp,
};

const PROP_DEFINITIONS = PROP_CATALOG.reduce((definitions, meta) => {
  const factory = FACTORIES[meta.id];

  if (!factory) {
    return definitions;
  }

  const defaults = meta.defaultOptions ? { ...meta.defaultOptions } : {};

  definitions[meta.id] = {
    ...meta,
    defaultOptions: defaults,
    create: (options = {}) => factory({ ...defaults, ...options }),
  };

  return definitions;
}, {});

/**
 * Create a prop instance by id.
 * @param {string} id
 * @param {object} [options]
 * @returns {THREE.Group|null}
 */
export function createProp(id, options = {}) {
  const def = PROP_DEFINITIONS[id];
  if (!def) return null;
  return def.create(options);
}

/**
 * Get metadata for a prop.
 * @param {string} id
 * @returns {object|null}
 */
export function getPropDefinition(id) {
  return PROP_DEFINITIONS[id] || null;
}

/**
 * List all available props.
 * @returns {Array<object>}
 */
export function listProps() {
  return Object.values(PROP_DEFINITIONS).map((def) => ({
    id: def.id,
    name: def.name,
    description: def.description,
    tags: def.tags,
    category: def.category,
    icon: def.icon,
    defaultOptions: def.defaultOptions,
  }));
}

export { THREE };
