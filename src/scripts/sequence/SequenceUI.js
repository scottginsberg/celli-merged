/**
 * Sequence UI - Visual interface for the sequence composer
 * Renders the node editor and scene manager
 */

import { SequenceComposer } from './SequenceComposer.js';

export class SequenceUI {
  constructor(containerId, sceneRegistry) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.sceneRegistry = sceneRegistry;
    this.composer = new SequenceComposer();
    this.composer.setSceneRegistry(sceneRegistry);
    
    this.elements = {};
    this.sceneManagerState = {
      collapsedCategories: new Set()
    };
  }

  /**
   * Initialize the UI
   */
  init() {
    if (!this.container) {
      console.error(`Container ${this.containerId} not found`);
      return;
    }

    this._createUI();
    this._bindEvents();
    this._renderSceneManager();
    
    console.log('✅ Sequence UI initialized');
  }

  /**
   * Create the UI structure
   */
  _createUI() {
    this.container.innerHTML = `
      <div class="sequence-layout">
        <div class="sequence-sidebar">
          <h2>Scene Manager</h2>
          <div class="scene-manager" id="scene-manager-content"></div>
          
          <div class="section-divider"></div>
          
          <h2>Node Palette</h2>
          <div class="node-palette">
            <button class="node-button" data-node-type="dialogue">💬 Dialogue</button>
            <button class="node-button" data-node-type="animation">🎬 Animation</button>
            <button class="node-button" data-node-type="delay">⏱️ Delay</button>
            <button class="node-button" data-node-type="parameter">📊 Parameter Ingestor</button>
            <button class="node-button" data-node-type="object">🎯 Scene Object</button>
          </div>
        </div>
        
        <div class="sequence-canvas-container">
          <svg id="sequence-connections-svg"></svg>
          <div id="sequence-canvas"></div>
          
          <div class="sequence-toolbar">
            <button id="seq-clear-btn">Clear All</button>
            <button id="seq-export-btn">Export JSON</button>
            <button id="seq-import-btn">Import JSON</button>
            <button id="seq-compile-btn">Compile</button>
          </div>
          
          <div class="sequence-info-panel">
            <div>Nodes: <span id="seq-node-count">0</span> | Connections: <span id="seq-connection-count">0</span></div>
          </div>
        </div>
      </div>
    `;

    // Store element references
    this.elements = {
      sceneManager: document.getElementById('scene-manager-content'),
      canvas: document.getElementById('sequence-canvas'),
      svg: document.getElementById('sequence-connections-svg'),
      nodeCount: document.getElementById('seq-node-count'),
      connectionCount: document.getElementById('seq-connection-count')
    };
  }

  /**
   * Bind event handlers
   */
  _bindEvents() {
    // Node palette buttons
    document.querySelectorAll('.node-button').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.nodeType;
        const x = Math.random() * 400 + 100;
        const y = Math.random() * 300 + 100;
        this.composer.createNode(type, x, y);
        this._updateStats();
        this._renderCanvas();
      });
    });

    // Toolbar buttons
    document.getElementById('seq-clear-btn')?.addEventListener('click', () => {
      if (confirm('Clear all nodes and connections?')) {
        this.composer.clear();
        this._updateStats();
        this._renderCanvas();
      }
    });

    document.getElementById('seq-export-btn')?.addEventListener('click', () => {
      const data = this.composer.export();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sequence.json';
      a.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById('seq-import-btn')?.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const data = JSON.parse(e.target.result);
              this.composer.import(data);
              this._updateStats();
              this._renderCanvas();
            } catch (err) {
              alert('Error parsing JSON: ' + err.message);
            }
          };
          reader.readAsText(file);
        }
      });
      input.click();
    });

    document.getElementById('seq-compile-btn')?.addEventListener('click', () => {
      const compiled = this.composer.compile();
      console.log('📦 Compiled sequence:', compiled);
      alert('Sequence compiled! Check console for output.');
    });
  }

  /**
   * Render the scene manager
   */
  _renderSceneManager() {
    if (!this.elements.sceneManager) return;

    const sceneData = this.sceneRegistry.getSceneData();
    this.elements.sceneManager.innerHTML = '';

    Object.keys(sceneData).forEach(category => {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'scene-category';

      const isCollapsed = this.sceneManagerState.collapsedCategories.has(category);

      const header = document.createElement('div');
      header.className = 'category-header';
      header.innerHTML = `
        <span>${category}</span>
        <span class="category-toggle ${isCollapsed ? 'collapsed' : ''}">▼</span>
      `;
      header.addEventListener('click', () => {
        if (this.sceneManagerState.collapsedCategories.has(category)) {
          this.sceneManagerState.collapsedCategories.delete(category);
        } else {
          this.sceneManagerState.collapsedCategories.add(category);
        }
        this._renderSceneManager();
      });
      categoryDiv.appendChild(header);

      if (!isCollapsed) {
        sceneData[category].forEach(entity => {
          const entityDiv = document.createElement('div');
          entityDiv.className = 'scene-entity';
          entityDiv.innerHTML = `
            <div class="entity-name">
              <span class="entity-icon">${entity.icon || '📦'}</span>
              <span>${entity.name}</span>
            </div>
            <div class="entity-actions">
              <button class="entity-add-btn">Add Node</button>
              <button class="entity-btn ingest-all">Ingest All</button>
            </div>
          `;
          
          entityDiv.querySelector('.entity-add-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this._addObjectNode(entity.name, category);
          });
          
          entityDiv.querySelector('.ingest-all').addEventListener('click', (e) => {
            e.stopPropagation();
            this._ingestAllParameters(entity.name, category, entity);
          });
          
          this._renderEntityHierarchy(entityDiv, entity);

          categoryDiv.appendChild(entityDiv);
        });
      }

      this.elements.sceneManager.appendChild(categoryDiv);
    });

    // Also render GUI components
    this._renderGUIComponents();
  }

  /**
   * Render GUI components section
   */
  _renderGUIComponents() {
    const guiComponents = this.sceneRegistry.getAllGUIComponents();
    if (guiComponents.length === 0) return;

    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'scene-category';
    
    const header = document.createElement('div');
    header.className = 'category-header';
    header.innerHTML = `<span>💻 GUI Components</span><span class="category-toggle">▼</span>`;
    categoryDiv.appendChild(header);

    guiComponents.forEach(gui => {
      const entityDiv = document.createElement('div');
      entityDiv.className = 'scene-entity';
      entityDiv.innerHTML = `
        <div class="entity-name">
          <span class="entity-icon">💻</span>
          <span>${gui.name}</span>
        </div>
        <div class="entity-actions">
          <button class="entity-btn ingest-all">Ingest</button>
        </div>
      `;
      
      entityDiv.querySelector('.ingest-all').addEventListener('click', () => {
        this._ingestGUIComponent(gui);
      });
      
      categoryDiv.appendChild(entityDiv);
    });

    this.elements.sceneManager.appendChild(categoryDiv);
  }

  /**
   * Add object node
   */
  _addObjectNode(entityName, category) {
    const x = Math.random() * 400 + 100;
    const y = Math.random() * 300 + 100;
    
    const node = this.composer.createNode('object', x, y, {
      entityName,
      category
    });
    
    const entity = this.sceneRegistry.getEntity(entityName);
    if (node && entity) {
      node.entityData = entity;
    }
    
    this._updateStats();
    this._renderCanvas();
  }

  /**
   * Ingest all parameters from entity
   */
  _ingestAllParameters(entityName, category, entity) {
    const startX = 100;
    const startY = 100;
    const spacing = 120;
    let index = 0;

    entity.components.forEach(comp => {
      this.composer.createNode('parameter', startX, startY + index * spacing, {
        entity: `${entityName}.${comp.name}`,
        path: comp.path,
        type: comp.type
      });
      index++;
    });

    if (entity.parts) {
      entity.parts.forEach(part => {
        part.components.forEach(comp => {
          this.composer.createNode('parameter', startX, startY + index * spacing, {
            entity: `${entityName}.${part.name}.${comp.name}`,
            path: comp.path,
            type: comp.type
          });
          index++;
        });
      });
    }

    this._updateStats();
    this._renderCanvas();
  }

  /**
   * Render hierarchy block for a scene entity
   */
  _renderEntityHierarchy(container, entity) {
    const hierarchy = entity?.hierarchy;
    if (!hierarchy) return;

    const nodes = Array.isArray(hierarchy) ? hierarchy : [hierarchy];
    if (nodes.length === 0) return;

    const hierarchyContainer = document.createElement('div');
    hierarchyContainer.className = 'entity-hierarchy';

    const title = document.createElement('div');
    title.className = 'hierarchy-title';
    title.textContent = 'Hierarchy';
    hierarchyContainer.appendChild(title);

    const tree = document.createElement('div');
    tree.className = 'hierarchy-tree';

    let nodeCount = 0;
    const maxNodes = 200;

    const renderNode = (node, depth = 0) => {
      if (!node || nodeCount >= maxNodes || depth > 10) return;
      nodeCount++;

      const row = document.createElement('div');
      row.className = 'hierarchy-node';
      row.style.setProperty('--hierarchy-depth', depth);

      const label = document.createElement('span');
      label.className = 'hierarchy-node-label';
      label.textContent = node.name || node.type || 'Object';

      const type = document.createElement('span');
      type.className = 'hierarchy-node-type';
      type.textContent = node.type || '';

      row.appendChild(label);
      row.appendChild(type);
      tree.appendChild(row);

      if (Array.isArray(node.children)) {
        node.children.forEach(child => renderNode(child, depth + 1));
      }
    };

    nodes.forEach(node => renderNode(node, 0));

    hierarchyContainer.appendChild(tree);
    container.appendChild(hierarchyContainer);
  }

  /**
   * Ingest GUI component
   */
  _ingestGUIComponent(gui) {
    const startX = 100;
    const startY = 100;
    const spacing = 100;

    gui.parameters.forEach((param, index) => {
      this.composer.createNode('parameter', startX, startY + index * spacing, {
        entity: `${gui.name}.${param.name}`,
        path: `gui.${gui.name}.${param.path}`,
        type: param.type
      });
    });

    this._updateStats();
    this._renderCanvas();
  }

  /**
   * Render canvas (nodes)
   */
  _renderCanvas() {
    // Simplified for now - would render nodes visually
    console.log('Rendering', this.composer.state.nodes.length, 'nodes');
  }

  /**
   * Update statistics
   */
  _updateStats() {
    if (this.elements.nodeCount) {
      this.elements.nodeCount.textContent = this.composer.state.nodes.length;
    }
    if (this.elements.connectionCount) {
      this.elements.connectionCount.textContent = this.composer.state.connections.length;
    }
  }

  /**
   * Show the UI
   */
  show() {
    if (this.container) {
      this.container.style.display = 'flex';
    }
  }

  /**
   * Hide the UI
   */
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }
}

export default SequenceUI;

