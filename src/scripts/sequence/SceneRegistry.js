/**
 * Scene Registry - Central registry of all scene objects and components
 * Makes everything "ingestible" by the sequence composer
 */

export class SceneRegistry {
  constructor() {
    this.categories = new Map();
    this.entities = new Map();
    this.components = new Map();
    this.guiComponents = new Map();
  }

  /**
   * Register a scene category
   */
  registerCategory(name, config = {}) {
    this.categories.set(name, {
      name,
      icon: config.icon || '📦',
      description: config.description || '',
      entities: []
    });
  }

  /**
   * Register an entity (3D object, system, etc)
   */
  registerEntity(category, name, config) {
    const entity = {
      name,
      category,
      icon: config.icon || '📦',
      type: config.type || 'object', // object, system, effect, audio, etc
      components: config.components || [],
      parts: config.parts || [],
      reference: config.reference || null, // Actual object reference
      hierarchy: null
    };

    if (!config.disableAutoHierarchy && entity.reference) {
      entity.hierarchy = this._buildHierarchyFromReference(
        entity.reference,
        config.hierarchyOptions || {}
      );
    } else if (config.hierarchy) {
      entity.hierarchy = config.hierarchy;
    }

    this.entities.set(name, entity);

    // Add to category
    if (this.categories.has(category)) {
      this.categories.get(category).entities.push(name);
    }

    console.log(`✅ Registered entity: ${category}/${name}`);
  }

  /**
   * Register a GUI component
   */
  registerGUIComponent(name, component) {
    this.guiComponents.set(name, {
      name,
      component,
      parameters: this._extractGUIParameters(component)
    });
    
    console.log(`✅ Registered GUI component: ${name}`);
  }

  /**
   * Extract parameters from a GUI component
   */
  _extractGUIParameters(component) {
    const params = [];
    
    // Extract from state if available
    if (component.state) {
      Object.keys(component.state).forEach(key => {
        params.push({
          name: key,
          type: this._inferType(component.state[key]),
          path: `state.${key}`,
          value: component.state[key]
        });
      });
    }

    // Extract from options if available
    if (component.options) {
      Object.keys(component.options).forEach(key => {
        params.push({
          name: `option.${key}`,
          type: this._inferType(component.options[key]),
          path: `options.${key}`,
          value: component.options[key]
        });
      });
    }

    return params;
  }

  /**
   * Infer type from value
   */
  _inferType(value) {
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'string') return 'string';
    if (Array.isArray(value)) return 'array';
    if (value && typeof value === 'object') {
      // Check for Three.js types
      if (value.isVector3) return 'vector3';
      if (value.isColor) return 'color';
      if (value.isQuaternion) return 'quaternion';
      return 'object';
    }
    return 'unknown';
  }

  /**
   * Get all entities in a category
   */
  getCategory(name) {
    return this.categories.get(name);
  }

  /**
   * Get entity by name
   */
  getEntity(name) {
    return this.entities.get(name);
  }

  /**
   * Get all categories
   */
  getAllCategories() {
    return Array.from(this.categories.values());
  }

  /**
   * Get scene data formatted for sequence composer
   */
  getSceneData() {
    const sceneData = {};

    this.categories.forEach((category, categoryName) => {
      sceneData[categoryName] = category.entities.map(entityName => {
        const entity = this.entities.get(entityName);
        return {
          name: entity.name,
          icon: entity.icon,
          components: entity.components,
          parts: entity.parts,
          hierarchy: entity.hierarchy
        };
      });
    });

    return sceneData;
  }

  /**
   * Get all GUI components
   */
  getAllGUIComponents() {
    return Array.from(this.guiComponents.values());
  }

  /**
   * Export registry as JSON
   */
  export() {
    return {
      categories: Array.from(this.categories.entries()),
      entities: Array.from(this.entities.entries()).map(([name, entity]) => ({
        name,
        category: entity.category,
        icon: entity.icon,
        type: entity.type,
        components: entity.components,
        parts: entity.parts,
        hierarchy: entity.hierarchy
      })),
      guiComponents: Array.from(this.guiComponents.entries()).map(([name, gui]) => ({
        name,
        parameters: gui.parameters
      }))
    };
  }

  /**
   * Build a lightweight hierarchy from a Three.js object reference
   */
  _buildHierarchyFromReference(reference, options = {}, depth = 0, visited = new Set()) {
    if (!reference) return null;

    const maxDepth = typeof options.maxDepth === 'number' ? options.maxDepth : 6;
    const maxChildren = typeof options.maxChildren === 'number' ? options.maxChildren : 16;
    const maxNodes = typeof options.maxNodes === 'number' ? options.maxNodes : 200;

    if (depth > maxDepth) return null;

    const nodeId = reference.uuid || reference.id || `${reference.name || reference.type || 'node'}-${depth}`;
    if (visited.has(nodeId)) return null;
    visited.add(nodeId);

    const name = reference.userData?.displayName || reference.userData?.name || reference.name || reference.type || 'Object3D';
    const type = reference.type || reference.constructor?.name || 'Object3D';

    const node = {
      name,
      type,
      children: []
    };

    if (Array.isArray(reference.children) && reference.children.length > 0 && visited.size < maxNodes) {
      let count = 0;
      for (const child of reference.children) {
        if (count >= maxChildren || visited.size >= maxNodes) break;
        const childNode = this._buildHierarchyFromReference(child, options, depth + 1, visited);
        if (childNode) {
          node.children.push(childNode);
          count++;
        }
      }
    }

    if (node.children.length === 0) {
      delete node.children;
    }

    return node;
  }
}

// Create singleton instance
export const sceneRegistry = new SceneRegistry();

// Global access for debugging
if (typeof window !== 'undefined') {
  window.SceneRegistry = sceneRegistry;
}

export default sceneRegistry;

