/**
 * Sequence Composer - Visual node-based sequence builder
 * Integrated with SceneManager and component system
 */

export class SequenceComposer {
  constructor(canvasId = 'sequence-canvas') {
    this.canvasId = canvasId;
    this.state = {
      nodes: [],
      connections: [],
      selectedNode: null,
      dragState: null,
      connectionDrag: null,
      canvas: { x: 0, y: 0, zoom: 1 },
      nodeIdCounter: 0,
      connectionIdCounter: 0
    };
    
    this.sceneRegistry = null; // Will be set via setSceneRegistry
    this.nodeTypes = this._initializeNodeTypes();
  }

  /**
   * Set the scene registry for ingestion
   */
  setSceneRegistry(registry) {
    this.sceneRegistry = registry;
    console.log('✅ Scene registry connected to SequenceComposer');
  }

  /**
   * Initialize node type definitions
   */
  _initializeNodeTypes() {
    return {
      dialogue: {
        name: "Dialogue",
        color: "#4a9eff",
        inputs: [{ id: "in", label: "In", type: "flow" }],
        outputs: [{ id: "out", label: "Out", type: "flow" }],
        params: [
          { id: "speaker", label: "Speaker", type: "text", default: "Character" },
          { id: "text", label: "Text", type: "textarea", default: "Dialogue text here..." },
          { id: "duration", label: "Duration (s)", type: "number", default: 2 }
        ]
      },
      animation: {
        name: "Animation",
        color: "#ff6b6b",
        inputs: [
          { id: "in", label: "In", type: "flow" },
          { id: "target", label: "Target", type: "param" }
        ],
        outputs: [{ id: "out", label: "Out", type: "flow" }],
        params: [
          { id: "property", label: "Property", type: "text", default: "position.x" },
          { id: "from", label: "From", type: "text", default: "0" },
          { id: "to", label: "To", type: "text", default: "100" },
          { id: "duration", label: "Duration (s)", type: "number", default: 1 },
          { id: "easing", label: "Easing", type: "select", options: ["linear", "easeIn", "easeOut", "easeInOut", "bounce"], default: "easeInOut" }
        ]
      },
      delay: {
        name: "Delay",
        color: "#9b59b6",
        inputs: [{ id: "in", label: "In", type: "flow" }],
        outputs: [{ id: "out", label: "Out", type: "flow" }],
        params: [
          { id: "duration", label: "Duration (s)", type: "number", default: 1 }
        ]
      },
      parameter: {
        name: "Parameter Ingestor",
        color: "#2ecc71",
        inputs: [],
        outputs: [{ id: "value", label: "Value", type: "param" }],
        params: [
          { id: "entity", label: "Entity", type: "text", default: "", readonly: true },
          { id: "path", label: "Parameter Path", type: "text", default: "", readonly: true },
          { id: "type", label: "Type", type: "text", default: "", readonly: true }
        ]
      },
      object: {
        name: "Scene Object",
        color: "#17a2b8",
        inputs: [{ id: "in", label: "In", type: "flow" }],
        outputs: [
          { id: "out", label: "Out", type: "flow" },
          { id: "object", label: "Object Ref", type: "param" }
        ],
        params: [
          { id: "entityName", label: "Entity Name", type: "text", default: "", readonly: true },
          { id: "category", label: "Category", type: "text", default: "", readonly: true }
        ],
        hasCustomUI: true
      },
      snapshot: {
        name: "State Snapshot",
        color: "#f39c12",
        inputs: [
          { id: "in", label: "In", type: "flow" },
          { id: "object", label: "From Object", type: "param" }
        ],
        outputs: [{ id: "out", label: "Out", type: "flow" }],
        params: [
          { id: "snapshotName", label: "Snapshot Name", type: "text", default: "State 1" },
          { id: "sourceEntity", label: "Source Entity", type: "text", default: "", readonly: true }
        ],
        hasCustomUI: true
      }
    };
  }

  /**
   * Create a new node
   */
  createNode(type, x, y, params = {}) {
    const nodeType = this.nodeTypes[type];
    if (!nodeType) return null;

    const node = {
      id: this.state.nodeIdCounter++,
      type: type,
      x: x,
      y: y,
      params: {}
    };

    // Initialize parameters
    nodeType.params.forEach(param => {
      node.params[param.id] = params[param.id] || param.default;
    });

    this.state.nodes.push(node);
    return node;
  }

  /**
   * Create connection between nodes
   */
  createConnection(fromNode, fromSocket, toNode, toSocket, socketType) {
    const exists = this.state.connections.some(c => 
      c.fromNode === fromNode && c.fromSocket === fromSocket &&
      c.toNode === toNode && c.toSocket === toSocket
    );

    if (exists) return null;

    const connection = {
      id: this.state.connectionIdCounter++,
      fromNode,
      fromSocket,
      toNode,
      toSocket,
      type: socketType
    };

    this.state.connections.push(connection);
    return connection;
  }

  /**
   * Export sequence as JSON
   */
  export() {
    return {
      nodes: this.state.nodes,
      connections: this.state.connections,
      metadata: {
        created: new Date().toISOString(),
        version: '1.0'
      }
    };
  }

  /**
   * Import sequence from JSON
   */
  import(data) {
    if (!data.nodes || !data.connections) {
      throw new Error('Invalid sequence data');
    }

    this.state.nodes = data.nodes;
    this.state.connections = data.connections;
    this.state.nodeIdCounter = Math.max(...this.state.nodes.map(n => n.id), 0) + 1;
    this.state.connectionIdCounter = Math.max(...this.state.connections.map(c => c.id), 0) + 1;
  }

  /**
   * Clear all nodes and connections
   */
  clear() {
    this.state.nodes = [];
    this.state.connections = [];
    this.state.selectedNode = null;
  }

  /**
   * Get node by ID
   */
  getNode(id) {
    return this.state.nodes.find(n => n.id === id);
  }

  /**
   * Delete node
   */
  deleteNode(id) {
    this.state.nodes = this.state.nodes.filter(n => n.id !== id);
    this.state.connections = this.state.connections.filter(
      c => c.fromNode !== id && c.toNode !== id
    );
  }

  /**
   * Compile sequence to executable format
   */
  compile() {
    // Build execution graph
    const graph = {
      nodes: new Map(),
      edges: new Map()
    };

    // Add nodes
    this.state.nodes.forEach(node => {
      graph.nodes.set(node.id, {
        type: node.type,
        params: node.params,
        outgoing: [],
        incoming: []
      });
    });

    // Add edges
    this.state.connections.forEach(conn => {
      const fromNode = graph.nodes.get(conn.fromNode);
      const toNode = graph.nodes.get(conn.toNode);
      
      if (fromNode && toNode) {
        fromNode.outgoing.push({ node: conn.toNode, socket: conn.toSocket });
        toNode.incoming.push({ node: conn.fromNode, socket: conn.fromSocket });
      }
    });

    return graph;
  }
}

export default SequenceComposer;

