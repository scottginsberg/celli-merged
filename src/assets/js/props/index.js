import * as THREE from 'three';
import { createFilmCameraProp } from './FilmCameraProp.js';
import { createFilmReelProp } from './FilmReelProp.js';
import { createFilmStripProp } from './FilmStripProp.js';

const PROP_DEFINITIONS = {
  filmCamera: {
    id: 'filmCamera',
    name: 'Film Camera',
    description:
      'Stylized dual-reel film camera inspired by the record button icon, complete with tripod and glowing lens.',
    tags: ['camera', 'cinema', 'hardware'],
    create: (options = {}) => createFilmCameraProp(options),
    defaultOptions: {
      scale: 1,
    },
  },
  filmReel: {
    id: 'filmReel',
    name: 'Film Reel',
    description:
      'Layered cinema reel with wound ribbon and reflective metal discs ready for projection booth dressing.',
    tags: ['cinema', 'prop', 'reel'],
    create: (options = {}) => createFilmReelProp(options),
    defaultOptions: {
      scale: 1,
    },
  },
  filmStrip: {
    id: 'filmStrip',
    name: 'Film Strip',
    description:
      'Connected translucent frames framed by perforated bars, ideal for UI overlays or set dressing.',
    tags: ['cinema', 'ui', 'graphic'],
    create: (options = {}) => createFilmStripProp(options),
    defaultOptions: {
      scale: 1.2,
      cellCount: 4,
    },
  },
};

/**
 * Create a prop instance by id.
 * @param {string} id
 * @param {object} [options]
 * @returns {THREE.Group|null}
 */
export function createProp(id, options = {}) {
  const def = PROP_DEFINITIONS[id];
  if (!def) return null;
  return def.create({ ...def.defaultOptions, ...options });
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
  }));
}

export { THREE };
