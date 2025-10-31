/**
 * Map Module
 * Visual navigation map for all sequences in the Celli experience
 * Press 'M' key to toggle map display
 */

class Map {
  constructor() {
    this.isVisible = false;
    this.currentScene = null;
    this.expandedNodes = new Set(); // Track which nodes are expanded
    this.scrollTimeout = null; // For throttling scroll updates
    this.is3DMode = false; // Track 3D view state
    this.threeScene = null;
    this.threeCamera = null;
    this.threeRenderer = null;
    this.threeCanvas = null;
    this.animationFrameId = null;
    
    // Connection colors that cycle: white, blue, yellow, red
    this.connectionColors = [
      'rgba(255, 255, 255, 0.6)', // White
      'rgba(100, 150, 255, 0.6)', // Blue
      'rgba(255, 220, 100, 0.6)', // Yellow
      'rgba(255, 100, 100, 0.6)'  // Red
    ];
    this.connectionColorIndex = 0;
    
    // Soundtrack mapping
    this.soundtrack = [
      { file: 'Chant.mp3', title: 'Call You By My Name', scene: 'intro' },
      { file: 'badboolean.mp3', title: 'Jaunt', scene: 'intro' },
      { file: 'EA.mp3', title: 'Executive Assistance', scene: 'cellireal' },
      { file: 'tapout.mp3', title: 'Executive, Assisted. (v. RAW)', scene: 'cellireal' },
      { file: 'EA3.mp3', title: 'Now.exe', scene: 'cellireal' },
      { file: 'credits.mp3', title: 'Spotted', scene: 'intro' },
      { file: 'end.mp3', title: 'Mankind vs. the Undertaker', scene: 'visicell' },
      { file: 'Flash.mp3', title: 'Spotted Spoken', scene: 'flash' },
      { file: 'Flash2.mp3', title: 'Gone in a Flash', scene: 'flash' },
      { file: 'Hand.mp3', title: 'Curser', scene: 'fullhand' }
    ];
    
    // Define the scene nodes organized into acts
    this.sections = [
      { id: 'prologue', title: 'PROLOGUE', gridY: 1 },
      { id: 'act1', title: 'ACT I', gridY: 3 },
      { id: 'act2', title: 'ACT II', gridY: 5 },
      { id: 'act3', title: 'ACT III', gridY: 7 },
      { id: 'epilogue', title: 'EPILOGUE & BONUS', gridY: 9 }
    ];
    
    this.nodes = [
      // PROLOGUE - Top row
      {
        id: 'landing',
        title: 'Landing',
        subtitle: 'Faux Social Media',
        description: 'The gateway - social media facade',
        gridX: 1,
        gridY: 1,
        section: 'prologue',
        theme: 'social',
        url: './templates/componentized/beta-focus-form.html',
        connections: ['form'],
        isSmall: true,
        subscenes: [
          {
            id: 'landing-reddit',
            title: 'Reddit',
            theme: 'reddit',
            url: './templates/componentized/beta-focus-form.html?ref=reddit'
          },
          {
            id: 'landing-hn',
            title: 'Hacker News',
            theme: 'hackernews',
            url: './templates/componentized/beta-focus-form.html?ref=hackernews'
          },
          {
            id: 'landing-twitter',
            title: 'Twitter',
            theme: 'twitter',
            url: './templates/componentized/beta-focus-form.html?ref=twitter'
          },
          {
            id: 'landing-facebook',
            title: 'Facebook',
            theme: 'facebook',
            url: './templates/componentized/beta-focus-form.html?ref=facebook'
          },
          {
            id: 'landing-linkedin',
            title: 'LinkedIn',
            theme: 'linkedin',
            url: './templates/componentized/beta-focus-form.html?ref=linkedin'
          }
        ]
      },
      {
        id: 'form',
        title: 'Form Over Function',
        subtitle: 'Beta Registration',
        description: 'The form awaits your submission',
        gridX: 2,
        gridY: 1,
        section: 'prologue',
        theme: 'form',
        url: './templates/componentized/beta-focus-form.html',
        connections: ['shipped'],
        isSmall: true
      },
      {
        id: 'shipped',
        title: 'Shipped',
        subtitle: 'Product Launch',
        description: 'The release journey',
        gridX: 3,
        gridY: 1,
        section: 'prologue',
        theme: 'train',
        connections: ['presenting'],
        isSmall: true,
        subscenes: [
          {
            id: 'shipped-train',
            title: 'Release Train',
            description: 'All aboard',
            theme: 'train',
            url: './index.html?sequence=train'
          },
          {
            id: 'shipped-roadmap',
            title: 'Rainbow Roadmap',
            description: 'Feel the Fury of Rocky Road',
            theme: 'roadmap',
            url: './speed.html'
          }
        ]
      },
      {
        id: 'presenting',
        title: 'Now Presenting',
        subtitle: 'The Intro',
        description: 'Boot sequence initialization',
        gridX: 3,
        gridY: 3,
        section: 'act1',
        theme: 'bw',
        scene: 'intro',
        connections: ['celli'],
        isSmall: true
      },
      // CENTRAL NODE - CELLI (larger, central position)
      {
        id: 'celli',
        title: 'Celli',
        subtitle: 'Celli.OS',
        description: 'The spreadsheet reality awakens',
        gridX: 2.5,
        gridY: 5,
        section: 'act1',
        theme: 'glass',
        scene: 'cellireal',
        connections: [],
        isCentral: true
      },
      {
        id: 'visicell',
        title: 'Beginning of the End',
        subtitle: 'VisiCell',
        description: 'Terminal emergence - VisiCalc homage',
        gridX: 1,
        gridY: 5,
        section: 'act1',
        theme: 'terminal',
        scene: 'visicell',
        connections: ['celli'],
        isSmall: true
      },
      // ACT II - Around Celli
      {
        id: 'flash',
        title: 'Flash',
        subtitle: 'Experimental Encounter',
        description: 'The flash sequence awakens',
        gridX: 1,
        gridY: 7,
        section: 'act2',
        theme: 'flash',
        url: './flash.html',
        connections: ['celli'],
        isSmall: true
      },
      {
        id: 'reboot',
        title: 'Reboot',
        subtitle: 'Lattice Grid Initialize',
        description: 'THE.OS coordinate lattice awakens',
        gridX: 4,
        gridY: 5,
        section: 'act2',
        theme: 'reboot',
        scene: 'theos',
        connections: ['celli'],
        isSmall: true
      },
      {
        id: 'execution',
        title: 'Execution Environment',
        subtitle: 'Full Hand Sequence',
        description: 'Integrated execution environment',
        gridX: 3,
        gridY: 7,
        section: 'act2',
        theme: 'execution',
        url: './templates/componentized/fullhand-complete.html',
        connections: ['celli'],
        isSmall: true,
        subscenes: [
          {
            id: 'execution-launch',
            title: 'LAUNCH.EXE',
            description: 'Start of sequence',
            theme: 'execution-sub',
            url: './templates/componentized/fullhand-complete.html'
          },
          {
            id: 'execution-elementary',
            title: 'Elementary',
            description: 'Element puzzle',
            theme: 'execution-sub',
            url: './templates/componentized/fullhand-complete.html?scene=elementary'
          },
          {
            id: 'execution-pocket',
            title: 'pock.it',
            description: 'Pocket Dimension',
            theme: 'execution-sub',
            url: './templates/componentized/fullhand-complete.html?scene=pocket'
          }
        ]
      },
      // ACT III
      {
        id: 'theos',
        title: 'THE.OS',
        subtitle: 'Black Hole Riddle',
        description: 'The void manifests - undefined paradox',
        gridX: 2.5,
        gridY: 8,
        section: 'act3',
        theme: 'blackhole',
        url: './theos.html',
        connections: ['celli'],
        isSmall: true
      },
      // EPILOGUE & BONUS - Around edges
      {
        id: 'sunsettings',
        title: 'Sun Settings',
        subtitle: 'The Myth of Celli',
        description: 'Screens Edition - Theme-Gated',
        gridX: 1,
        gridY: 3,
        section: 'epilogue',
        theme: 'sunset',
        url: './end3.html',
        connections: ['celli'],
        isSmall: true
      },
      {
        id: 'rave',
        title: 'Celli Dance Party',
        subtitle: 'BONUS',
        description: 'Rave scene celebration',
        gridX: 4,
        gridY: 7,
        section: 'epilogue',
        theme: 'rave',
        url: './rave.html',
        connections: ['celli'],
        isSmall: true
      },
      {
        id: 'pockit',
        title: 'Pock.it',
        subtitle: 'Expanded',
        description: 'Scale exploration environment',
        gridX: 4.5,
        gridY: 7,
        section: 'epilogue',
        theme: 'bonus-small',
        url: './scale-ultra.html',
        connections: ['execution'],
        isSmall: true
      },
      {
        id: 'lightbike',
        title: 'LIGHTBIKE',
        subtitle: 'BONUS',
        description: 'Light cycle experience',
        gridX: 4.5,
        gridY: 7.6,
        section: 'epilogue',
        theme: 'bonus-small',
        url: './lightbike.html',
        connections: [],
        isSmall: true
      }
    ];
    
    this.init();
  }
  
  init() {
    this.createMapContainer();
    this.createMapNodes();
    this.createConnections();
    this.setupEventListeners();
    console.log('🗺️ Map module initialized - Press M to toggle');
  }
  
  createMapContainer() {
    // Create main map overlay
    const mapOverlay = document.createElement('div');
    mapOverlay.id = 'mapOverlay';
    mapOverlay.className = 'map-overlay';
    
    // Create starry background canvas
    this.bgCanvas = document.createElement('canvas');
    this.bgCanvas.className = 'map-starfield';
    mapOverlay.appendChild(this.bgCanvas);
    
    const mapContainer = document.createElement('div');
    mapContainer.className = 'map-container';
    
    // Header
    const header = document.createElement('div');
    header.className = 'map-header';
    header.innerHTML = `
      <h2>SEQUENCE MAP</h2>
      <p>Navigate the Celli Experience</p>
      <div class="map-header-icons">
        <button class="map-icon-btn" id="map3DBtn" title="Toggle 3D View">🎲</button>
        <button class="map-icon-btn" id="mapNotesBtn" title="Notes">✏️</button>
        <button class="map-icon-btn" id="mapSoundtrackBtn" title="Soundtrack">🎵</button>
      </div>
    `;
    
    // Grid container for nodes
    const grid = document.createElement('div');
    grid.className = 'map-grid';
    grid.id = 'mapGrid';
    
    // 3D Canvas for Three.js
    const threeCanvas = document.createElement('canvas');
    threeCanvas.id = 'map3DCanvas';
    threeCanvas.className = 'map-3d-canvas';
    threeCanvas.style.display = 'none';
    
    // SVG canvas for connection lines
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'mapConnections';
    svg.setAttribute('class', 'map-connections');
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'map-close-btn';
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', () => this.hide());
    
    mapContainer.appendChild(header);
    mapContainer.appendChild(svg);
    mapContainer.appendChild(grid);
    mapContainer.appendChild(threeCanvas);
    mapContainer.appendChild(closeBtn);
    mapOverlay.appendChild(mapContainer);
    
    // Create Notes Panel
    this.createNotesPanel(mapOverlay);
    
    // Create Soundtrack Panel
    this.createSoundtrackPanel(mapOverlay);
    
    // Tools Panel disabled - production mode
    // this.createToolsPanel(mapOverlay);
    
    document.body.appendChild(mapOverlay);
    
    this.overlay = mapOverlay;
    this.mapContainer = mapContainer;
    this.grid = grid;
    this.svg = svg;
    this.threeCanvas = threeCanvas;
    
    // Initialize starfield after overlay is set
    this.initStarfield();
    
    // Setup icon button listeners
    this.setupPanelListeners();
  }
  
  createMapNodes() {
    // Calculate grid dimensions
    const maxX = Math.max(...this.nodes.map(n => n.gridX));
    const maxY = Math.max(...this.nodes.map(n => n.gridY));
    
    // Set CSS grid properties
    this.grid.style.gridTemplateColumns = `repeat(${maxX}, 1fr)`;
    this.grid.style.gridTemplateRows = `repeat(${maxY + 1}, auto)`;
    this.grid.style.rowGap = '25px';
    
    // Add section headers
    this.sections.forEach(section => {
      const headerEl = document.createElement('div');
      headerEl.className = 'map-section-header';
      headerEl.textContent = section.title;
      headerEl.style.gridColumn = `1 / -1`;
      headerEl.style.gridRow = section.gridY;
      this.grid.appendChild(headerEl);
    });
    
    // Create node elements
    this.nodes.forEach(node => {
      const nodeEl = document.createElement('div');
      let className = `map-node map-node-${node.theme}`;
      if (node.isSmall) className += ' map-node-small';
      if (node.isCentral) className += ' map-node-central';
      nodeEl.className = className;
      nodeEl.dataset.nodeId = node.id;
      if (node.scene) nodeEl.dataset.scene = node.scene;
      nodeEl.style.gridColumn = node.gridX;
      nodeEl.style.gridRow = node.gridY;
      
      // Check if node has subscenes
      const hasSubscenes = node.subscenes && node.subscenes.length > 0;
      const dropdownIcon = hasSubscenes ? '<div class="map-node-dropdown">▼</div>' : '';
      
      nodeEl.innerHTML = `
        <div class="map-node-inner">
          ${dropdownIcon}
          <div class="map-node-title">${node.title}</div>
          <div class="map-node-subtitle">${node.subtitle}</div>
          <div class="map-node-description">${node.description}</div>
        </div>
      `;
      
      // Add click handler
      if (hasSubscenes) {
        // If has subscenes, clicking toggles expansion
        nodeEl.addEventListener('click', (e) => {
          // Don't navigate if clicking the dropdown icon area
          this.toggleNodeExpansion(node, nodeEl);
          e.stopPropagation();
        });
      } else {
        // If no subscenes, clicking navigates directly
        nodeEl.addEventListener('click', () => this.navigateToScene(node));
      }
      
      this.grid.appendChild(nodeEl);
      
      // Create subscene container if needed
      if (hasSubscenes) {
        const subsceneContainer = document.createElement('div');
        subsceneContainer.className = 'map-subscene-container';
        subsceneContainer.dataset.parentId = node.id;
        subsceneContainer.style.gridColumn = node.gridX;
        subsceneContainer.style.gridRow = `${node.gridY} / span 1`;
        subsceneContainer.style.display = 'none';
        subsceneContainer.style.position = 'relative';
        subsceneContainer.style.marginTop = '8px';
        subsceneContainer.style.zIndex = '200';
        
        // Create subscene tiles
        node.subscenes.forEach((subscene, index) => {
          const subsceneEl = document.createElement('div');
          subsceneEl.className = `map-subscene map-subscene-${subscene.theme}`;
          subsceneEl.dataset.subsceneId = subscene.id;
          subsceneEl.innerHTML = `
            <div class="map-subscene-title">${subscene.title}</div>
            ${subscene.description ? `<div class="map-subscene-desc">${subscene.description}</div>` : ''}
          `;
          
          subsceneEl.addEventListener('click', (e) => {
            this.navigateToScene(subscene);
            e.stopPropagation();
          });
          
          subsceneContainer.appendChild(subsceneEl);
        });
        
        this.grid.appendChild(subsceneContainer);
      }
    });
  }
  
  createConnections() {
    // Calculate positions and draw connecting lines
    requestAnimationFrame(() => {
      const gridRect = this.grid.getBoundingClientRect();
      
      // Set SVG size to match the grid's actual size including scroll area
      this.svg.setAttribute('width', this.grid.scrollWidth);
      this.svg.setAttribute('height', this.grid.scrollHeight);
      
      // Position SVG to account for scroll - it moves opposite to scroll
      this.svg.style.transform = `translate(${-this.grid.scrollLeft}px, ${-this.grid.scrollTop}px)`;
      
      // Clear existing paths
      this.svg.innerHTML = '';
      
      // Reset color index for consistent coloring
      this.connectionColorIndex = 0;
      
      // Draw connections between nodes
      this.nodes.forEach(node => {
        const fromEl = this.grid.querySelector(`[data-node-id="${node.id}"]`);
        if (!fromEl) return;
        
        const fromRect = fromEl.getBoundingClientRect();
        // Calculate position relative to grid's content (not viewport)
        const fromX = fromRect.left - gridRect.left + this.grid.scrollLeft + fromRect.width / 2;
        const fromY = fromRect.top - gridRect.top + this.grid.scrollTop + fromRect.height / 2;
        
        node.connections.forEach(targetId => {
          const toEl = this.grid.querySelector(`[data-node-id="${targetId}"]`);
          if (!toEl) return;
          
          const toRect = toEl.getBoundingClientRect();
          const toX = toRect.left - gridRect.left + this.grid.scrollLeft + toRect.width / 2;
          const toY = toRect.top - gridRect.top + this.grid.scrollTop + toRect.height / 2;
          
          // Get node objects to determine routing
          const fromNode = this.nodes.find(n => n.id === node.id);
          const toNode = this.nodes.find(n => n.id === targetId);
          
          // Create path based on position relationship
          const path = this.createSmartPath(fromX, fromY, toX, toY, fromNode, toNode);
          
          // Get color for this connection
          const color = this.connectionColors[this.connectionColorIndex % this.connectionColors.length];
          this.connectionColorIndex++;
          
          const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          pathEl.setAttribute('d', path);
          pathEl.setAttribute('class', 'map-connection-line');
          pathEl.setAttribute('stroke', color);
          pathEl.setAttribute('stroke-width', '3');
          pathEl.setAttribute('fill', 'none');
          pathEl.setAttribute('filter', 'url(#glow)');
          
          this.svg.appendChild(pathEl);
        });
      });
      
      // Add glow filter if not exists
      if (!this.svg.querySelector('#glow')) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', 'glow');
        filter.setAttribute('x', '-50%');
        filter.setAttribute('y', '-50%');
        filter.setAttribute('width', '200%');
        filter.setAttribute('height', '200%');
        
        const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
        feGaussianBlur.setAttribute('stdDeviation', '3');
        feGaussianBlur.setAttribute('result', 'coloredBlur');
        
        const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
        const feMergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        feMergeNode1.setAttribute('in', 'coloredBlur');
        const feMergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
        feMergeNode2.setAttribute('in', 'SourceGraphic');
        
        feMerge.appendChild(feMergeNode1);
        feMerge.appendChild(feMergeNode2);
        filter.appendChild(feGaussianBlur);
        filter.appendChild(feMerge);
        defs.appendChild(filter);
        this.svg.insertBefore(defs, this.svg.firstChild);
      }
    });
  }
  
  createSmartPath(x1, y1, x2, y2, fromNode, toNode) {
    if (!fromNode || !toNode) {
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    }
    
    // Configuration
    const nodeHeight = 130; // Approximate node height
    const nodeWidth = 200; // Approximate node width
    const clearance = 50; // Clearance around nodes
    const cornerRadius = 15; // Radius for rounded corners
    
    // Same row - route above or around with rounded corners
    if (fromNode.gridY === toNode.gridY) {
      // Route above the row with clearance
      const routeY = y1 - nodeHeight/2 - clearance;
      const r = cornerRadius;
      
      // Create path with rounded corners
      return `M ${x1} ${y1} 
              L ${x1} ${routeY + r}
              Q ${x1} ${routeY} ${x1 + r} ${routeY}
              L ${x2 - r} ${routeY}
              Q ${x2} ${routeY} ${x2} ${routeY + r}
              L ${x2} ${y2}`;
    }
    
    // Different rows - use orthogonal routing with clearance and rounded corners
    const dx = x2 - x1;
    const dy = y2 - y1;
    const r = cornerRadius;
    
    // Exit point: bottom of source node + clearance
    const exitY = y1 + nodeHeight/2 + clearance;
    
    // Entry point: top of target node - clearance  
    const entryY = y2 - nodeHeight/2 - clearance;
    
    // Determine if we need to route around horizontally
    const horizontalOverlap = Math.abs(dx) < nodeWidth + clearance * 2;
    
    if (horizontalOverlap) {
      // Route to the side first to avoid overlap with rounded corners
      const sideOffset = dx > 0 ? nodeWidth + clearance : -(nodeWidth + clearance);
      const sideX = x1 + sideOffset;
      const midY = (exitY + entryY) / 2;
      
      return `M ${x1} ${y1}
              L ${x1} ${exitY - r}
              Q ${x1} ${exitY} ${x1 + (sideOffset > 0 ? r : -r)} ${exitY}
              L ${sideX - (sideOffset > 0 ? r : -r)} ${exitY}
              Q ${sideX} ${exitY} ${sideX} ${exitY + r}
              L ${sideX} ${midY - r}
              Q ${sideX} ${midY} ${sideX + (dx > 0 ? r : -r)} ${midY}
              L ${x2 - (dx > 0 ? r : -r)} ${midY}
              Q ${x2} ${midY} ${x2} ${midY + r}
              L ${x2} ${entryY - r}
              Q ${x2} ${entryY} ${x2} ${entryY}
              L ${x2} ${y2}`;
    } else {
      // Direct orthogonal route with clearance and rounded corners
      const midY = (exitY + entryY) / 2;
      
      return `M ${x1} ${y1}
              L ${x1} ${exitY - r}
              Q ${x1} ${exitY} ${x1} ${exitY + r}
              L ${x1} ${midY - r}
              Q ${x1} ${midY} ${x1 + (dx > 0 ? r : -r)} ${midY}
              L ${x2 - (dx > 0 ? r : -r)} ${midY}
              Q ${x2} ${midY} ${x2} ${midY + r}
              L ${x2} ${entryY - r}
              Q ${x2} ${entryY} ${x2} ${entryY}
              L ${x2} ${y2}`;
    }
  }
  
  setupEventListeners() {
    // Global keyboard listener for 'M' key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'M' || e.key === 'm') {
        if (!this.isVisible) {
          this.show();
        } else {
          this.hide();
        }
      }
      
      // ESC to close
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
    
    // Close on overlay click (outside map container)
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.hide();
      }
    });
    
    // Redraw connections on window resize
    window.addEventListener('resize', () => {
      if (this.isVisible) {
        this.createConnections();
      }
    });
    
    // Redraw connections on scroll (throttled for performance)
    this.grid.addEventListener('scroll', () => {
      if (!this.isVisible) return;
      
      // Immediate update for responsive feel
      this.createConnections();
    });
    
    // Also listen on mapContainer in case scrolling happens there
    this.mapContainer.addEventListener('scroll', () => {
      if (!this.isVisible) return;
      
      // Immediate update for responsive feel
      this.createConnections();
    });
  }
  
  show() {
    this.isVisible = true;
    this.overlay.classList.add('visible');
    this.startStarfield();
    this.createConnections(); // Redraw connections when showing
    console.log('🗺️ Map opened');
  }
  
  hide() {
    this.isVisible = false;
    this.overlay.classList.remove('visible');
    this.stopStarfield();
    console.log('🗺️ Map closed');
  }
  
  /* =========================
     Starfield Background
     ========================= */
  initStarfield() {
    const canvas = this.bgCanvas;
    const ctx = canvas.getContext('2d');
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    
    // Star field data
    const stars = [];
    const starCount = 800;
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }
    
    // Ripple effects
    const ripples = [];
    
    // Mouse tracking
    let mouseX = 0;
    let mouseY = 0;
    
    this.overlay.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Create ripple on movement
      if (Math.random() > 0.7) {
        ripples.push({
          x: mouseX,
          y: mouseY,
          radius: 0,
          maxRadius: 150 + Math.random() * 100,
          life: 1.0,
          speed: 2 + Math.random() * 2
        });
      }
    });
    
    // Animation
    let animationId = null;
    const animate = () => {
      if (!this.isVisible) {
        animationId = null;
        return;
      }
      
      ctx.fillStyle = 'rgba(0, 0, 10, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw nebula clouds
      const time = Date.now() * 0.0001;
      const gradient1 = ctx.createRadialGradient(
        canvas.width * 0.3 + Math.sin(time) * 100,
        canvas.height * 0.3 + Math.cos(time * 0.7) * 100,
        0,
        canvas.width * 0.3,
        canvas.height * 0.3,
        canvas.width * 0.6
      );
      gradient1.addColorStop(0, 'rgba(20, 10, 40, 0.3)');
      gradient1.addColorStop(0.5, 'rgba(40, 20, 60, 0.1)');
      gradient1.addColorStop(1, 'rgba(0, 0, 10, 0)');
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const gradient2 = ctx.createRadialGradient(
        canvas.width * 0.7 + Math.cos(time * 0.8) * 100,
        canvas.height * 0.6 + Math.sin(time * 0.6) * 100,
        0,
        canvas.width * 0.7,
        canvas.height * 0.6,
        canvas.width * 0.5
      );
      gradient2.addColorStop(0, 'rgba(10, 20, 50, 0.3)');
      gradient2.addColorStop(0.5, 'rgba(20, 30, 60, 0.1)');
      gradient2.addColorStop(1, 'rgba(0, 0, 10, 0)');
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw and update ripples
      ripples.forEach((ripple, index) => {
        ripple.radius += ripple.speed;
        ripple.life -= 0.008;
        
        if (ripple.life <= 0 || ripple.radius > ripple.maxRadius) {
          ripples.splice(index, 1);
          return;
        }
        
        // Distortion effect
        ctx.save();
        ctx.globalAlpha = ripple.life * 0.3;
        
        // Multiple rings for wave effect
        for (let i = 0; i < 3; i++) {
          const r = ripple.radius - i * 20;
          if (r > 15) { // Ensure r - 10 will be > 0
            const gradient = ctx.createRadialGradient(
              ripple.x, ripple.y, Math.max(0, r - 10),
              ripple.x, ripple.y, r + 10
            );
            gradient.addColorStop(0, 'rgba(100, 150, 255, 0)');
            gradient.addColorStop(0.5, `rgba(100, 150, 255, ${0.4 * ripple.life})`);
            gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, r, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        
        ctx.restore();
        
        // Distort nearby stars
        stars.forEach(star => {
          const dx = star.x - ripple.x;
          const dy = star.y - ripple.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < ripple.radius + 50 && dist > ripple.radius - 50) {
            const force = (1 - Math.abs(dist - ripple.radius) / 50) * ripple.life;
            star.x += (dx / dist) * force * 2;
            star.y += (dy / dist) * force * 2;
            
            // Wrap around screen
            if (star.x < 0) star.x = canvas.width;
            if (star.x > canvas.width) star.x = 0;
            if (star.y < 0) star.y = canvas.height;
            if (star.y > canvas.height) star.y = 0;
          }
        });
      });
      
      // Draw stars with twinkling
      stars.forEach(star => {
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
        
        ctx.save();
        ctx.globalAlpha = star.opacity * twinkle;
        
        // Glow effect
        const gradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.radius * 3
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.4, 'rgba(200, 220, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Core
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    this.starfieldAnimate = animate;
    this.starfieldAnimationId = animationId;
  }
  
  startStarfield() {
    if (this.starfieldAnimate) {
      this.starfieldAnimate();
    }
  }
  
  stopStarfield() {
    if (this.starfieldAnimationId) {
      cancelAnimationFrame(this.starfieldAnimationId);
      this.starfieldAnimationId = null;
    }
  }
  
  toggleNodeExpansion(node, nodeEl) {
    const isExpanded = this.expandedNodes.has(node.id);
    const subsceneContainer = this.grid.querySelector(`[data-parent-id="${node.id}"]`);
    const dropdownIcon = nodeEl.querySelector('.map-node-dropdown');
    
    if (isExpanded) {
      // Collapse
      this.expandedNodes.delete(node.id);
      nodeEl.classList.remove('expanded');
      if (subsceneContainer) {
        subsceneContainer.style.display = 'none';
      }
      if (dropdownIcon) {
        dropdownIcon.textContent = '▼';
      }
      console.log(`🗺️ Collapsed: ${node.title}`);
    } else {
      // Expand
      this.expandedNodes.add(node.id);
      nodeEl.classList.add('expanded');
      if (subsceneContainer) {
        subsceneContainer.style.display = 'flex';
      }
      if (dropdownIcon) {
        dropdownIcon.textContent = '▲';
      }
      console.log(`🗺️ Expanded: ${node.title}`);
    }
    
    // Redraw connections after expansion state changes
    this.createConnections();
  }
  
  navigateToScene(node) {
    console.log(`🗺️ Navigating to: ${node.title}`);
    
    // Hide the map
    this.hide();
    
    // Check if node has a URL (external page)
    if (node.url) {
      console.log(`🗺️ Opening external URL: ${node.url}`);
      window.location.href = node.url;
      return;
    }
    
    // Otherwise, trigger scene navigation based on the scene ID
    if (node.scene) {
      if (window.loadScene) {
        window.loadScene(node.scene);
      } else if (window.navigateToScene) {
        window.navigateToScene(node.scene);
      } else if (window.celliApp && window.celliApp.loadScene) {
        window.celliApp.loadScene(node.scene);
      } else {
        // Fallback: trigger scene select if available
        const sceneOption = document.querySelector(`[data-scene="${node.scene}"]`);
        if (sceneOption) {
          sceneOption.click();
        } else {
          console.warn(`⚠️ Scene navigation not available for: ${node.scene}`);
          this.showNotification(`Scene "${node.title}" navigation not yet implemented`);
        }
      }
    } else {
      console.warn(`⚠️ No scene or URL defined for: ${node.title}`);
      this.showNotification(`Scene "${node.title}" has no navigation target`);
    }
  }
  
  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'map-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('visible');
    }, 10);
    
    setTimeout(() => {
      notification.classList.remove('visible');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  createNotesPanel(parent) {
    const notesPanel = document.createElement('div');
    notesPanel.id = 'mapNotesPanel';
    notesPanel.className = 'map-side-panel';
    notesPanel.innerHTML = `
      <div class="map-panel-header">
        <h3>✏️ NOTES</h3>
        <button class="map-panel-close">×</button>
      </div>
      <div class="map-panel-content" id="mapNotesContent"></div>
    `;
    
    // Populate notes for each scene
    const content = notesPanel.querySelector('#mapNotesContent');
    this.nodes.forEach(node => {
      const noteItem = document.createElement('div');
      noteItem.className = 'map-note-item';
      
      const label = document.createElement('label');
      label.textContent = node.title;
      label.className = 'map-note-label';
      
      const input = document.createElement('textarea');
      input.className = 'map-note-input';
      input.placeholder = 'Add your notes...';
      input.dataset.nodeId = node.id;
      input.value = this.loadNote(node.id);
      
      input.addEventListener('input', (e) => {
        this.saveNote(node.id, e.target.value);
      });
      
      noteItem.appendChild(label);
      noteItem.appendChild(input);
      content.appendChild(noteItem);
    });
    
    parent.appendChild(notesPanel);
    this.notesPanel = notesPanel;
  }
  
  createToolsPanel(parent) {
    const toolsPanel = document.createElement('div');
    toolsPanel.id = 'mapToolsPanel';
    toolsPanel.className = 'map-side-panel';
    toolsPanel.innerHTML = `
      <div class="map-panel-header">
        <h3>🛠️ DEVELOPER TOOLS</h3>
        <button class="map-panel-close">×</button>
      </div>
      <div class="map-panel-content" id="mapToolsContent" style="display: flex; flex-direction: column; gap: 10px;">
        <a href="./index-tools.html" target="_blank" class="map-tool-link" style="
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
          border: 1px solid rgba(143, 180, 255, 0.3);
          border-radius: 8px;
          color: #e8e8ee;
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
        ">
          <span style="font-size: 18px;">🚀</span>
          <div>
            <div style="font-size: 12px; font-weight: 600;">Tools Hub</div>
            <div style="font-size: 10px; opacity: 0.7;">All dev tools in one place</div>
          </div>
        </a>
        <a href="./asset-evaluator.html" target="_blank" class="map-tool-link" style="
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: rgba(102, 126, 234, 0.1);
          border: 1px solid rgba(143, 180, 255, 0.2);
          border-radius: 8px;
          color: #e8e8ee;
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
        ">
          <span style="font-size: 18px;">🎨</span>
          <div>
            <div style="font-size: 12px; font-weight: 600;">Asset Evaluator</div>
            <div style="font-size: 10px; opacity: 0.7;">AI-powered geometry analyzer</div>
          </div>
        </a>
        <a href="./interiors.html" target="_blank" class="map-tool-link" style="
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: rgba(102, 126, 234, 0.1);
          border: 1px solid rgba(143, 180, 255, 0.2);
          border-radius: 8px;
          color: #e8e8ee;
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
        ">
          <span style="font-size: 18px;">🏠</span>
          <div>
            <div style="font-size: 12px; font-weight: 600;">Room Builder</div>
            <div style="font-size: 10px; opacity: 0.7;">Interior design system</div>
          </div>
        </a>
        <a href="./narrative-demo.html" target="_blank" class="map-tool-link" style="
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: rgba(102, 126, 234, 0.1);
          border: 1px solid rgba(143, 180, 255, 0.2);
          border-radius: 8px;
          color: #e8e8ee;
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
        ">
          <span style="font-size: 18px;">📖</span>
          <div>
            <div style="font-size: 12px; font-weight: 600;">Narrative Builder</div>
            <div style="font-size: 10px; opacity: 0.7;">Procedural story system</div>
          </div>
        </a>
        <a href="./tools/sequence-builder/index.html?standalone=true" target="_blank" class="map-tool-link" style="
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: rgba(102, 126, 234, 0.1);
          border: 1px solid rgba(143, 180, 255, 0.2);
          border-radius: 8px;
          color: #e8e8ee;
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
        ">
          <span style="font-size: 18px;">🎬</span>
          <div>
            <div style="font-size: 12px; font-weight: 600;">Sequence Builder</div>
            <div style="font-size: 10px; opacity: 0.7;">Node-based sequence composer</div>
          </div>
        </a>
      </div>
    `;
    
    parent.appendChild(toolsPanel);
    this.toolsPanel = toolsPanel;
    
    // Add hover effects for tool links
    setTimeout(() => {
      const toolLinks = toolsPanel.querySelectorAll('.map-tool-link');
      toolLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
          this.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3))';
          this.style.borderColor = 'rgba(143, 180, 255, 0.5)';
          this.style.transform = 'translateX(5px)';
        });
        link.addEventListener('mouseleave', function() {
          if (this.querySelector('span').textContent === '🚀') {
            this.style.background = 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))';
          } else {
            this.style.background = 'rgba(102, 126, 234, 0.1)';
          }
          this.style.borderColor = this.querySelector('span').textContent === '🚀' ? 'rgba(143, 180, 255, 0.3)' : 'rgba(143, 180, 255, 0.2)';
          this.style.transform = 'translateX(0)';
        });
      });
    }, 0);
  }
  
  createSoundtrackPanel(parent) {
    const soundtrackPanel = document.createElement('div');
    soundtrackPanel.id = 'mapSoundtrackPanel';
    soundtrackPanel.className = 'map-side-panel';
    soundtrackPanel.innerHTML = `
      <div class="map-panel-header">
        <h3>🎵 CELLI SOUNDTRACK</h3>
        <button class="map-panel-close">×</button>
      </div>
      <div class="map-panel-content" id="mapSoundtrackContent"></div>
    `;
    
    // Populate soundtrack
    const content = soundtrackPanel.querySelector('#mapSoundtrackContent');
    const unlockedSongs = this.getUnlockedSongs();
    
    this.soundtrack.forEach((song, index) => {
      const songItem = document.createElement('div');
      songItem.className = 'map-soundtrack-item';
      
      const isUnlocked = unlockedSongs.includes(song.file);
      
      const number = document.createElement('span');
      number.className = 'map-soundtrack-number';
      number.textContent = `${(index + 1).toString().padStart(2, '0')}.`;
      
      const title = document.createElement('span');
      title.className = 'map-soundtrack-title';
      title.textContent = isUnlocked ? song.title : '???';
      
      if (isUnlocked) {
        songItem.classList.add('unlocked');
      } else {
        songItem.classList.add('locked');
      }
      
      songItem.appendChild(number);
      songItem.appendChild(title);
      content.appendChild(songItem);
    });
    
    parent.appendChild(soundtrackPanel);
    this.soundtrackPanel = soundtrackPanel;
  }
  
  setupPanelListeners() {
    // Notes button
    const notesBtn = document.getElementById('mapNotesBtn');
    if (notesBtn) {
      notesBtn.addEventListener('click', () => {
        this.notesPanel.classList.toggle('visible');
        this.soundtrackPanel.classList.remove('visible');
        // Tools panel removed - production mode
      });
    }
    
    // Soundtrack button
    const soundtrackBtn = document.getElementById('mapSoundtrackBtn');
    if (soundtrackBtn) {
      soundtrackBtn.addEventListener('click', () => {
        this.soundtrackPanel.classList.toggle('visible');
        this.notesPanel.classList.remove('visible');
        // Tools panel removed - production mode
      });
    }
    
    // 3D button
    const map3DBtn = document.getElementById('map3DBtn');
    if (map3DBtn) {
      map3DBtn.addEventListener('click', () => {
        this.toggle3DMode();
      });
    }
    
    // Close buttons
    const closeBtns = document.querySelectorAll('.map-panel-close');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.target.closest('.map-side-panel').classList.remove('visible');
      });
    });
  }
  
  loadNote(nodeId) {
    try {
      const notes = JSON.parse(localStorage.getItem('celliMapNotes') || '{}');
      return notes[nodeId] || '';
    } catch (e) {
      console.error('Error loading notes:', e);
      return '';
    }
  }
  
  saveNote(nodeId, text) {
    try {
      const notes = JSON.parse(localStorage.getItem('celliMapNotes') || '{}');
      notes[nodeId] = text;
      localStorage.setItem('celliMapNotes', JSON.stringify(notes));
    } catch (e) {
      console.error('Error saving note:', e);
    }
  }
  
  getUnlockedSongs() {
    try {
      const unlocked = JSON.parse(localStorage.getItem('celliUnlockedSongs') || '[]');
      return unlocked;
    } catch (e) {
      console.error('Error loading unlocked songs:', e);
      return [];
    }
  }
  
  logSongPlay(filename) {
    try {
      const unlocked = this.getUnlockedSongs();
      if (!unlocked.includes(filename)) {
        unlocked.push(filename);
        localStorage.setItem('celliUnlockedSongs', JSON.stringify(unlocked));
        console.log(`🎵 Song unlocked: ${filename}`);
      }
    } catch (e) {
      console.error('Error logging song play:', e);
    }
  }
  
  refreshSoundtrack() {
    const content = document.getElementById('mapSoundtrackContent');
    if (!content) return;
    
    content.innerHTML = '';
    const unlockedSongs = this.getUnlockedSongs();
    
    this.soundtrack.forEach((song, index) => {
      const songItem = document.createElement('div');
      songItem.className = 'map-soundtrack-item';
      
      const isUnlocked = unlockedSongs.includes(song.file);
      
      const number = document.createElement('span');
      number.className = 'map-soundtrack-number';
      number.textContent = `${(index + 1).toString().padStart(2, '0')}.`;
      
      const title = document.createElement('span');
      title.className = 'map-soundtrack-title';
      title.textContent = isUnlocked ? song.title : '???';
      
      if (isUnlocked) {
        songItem.classList.add('unlocked');
      } else {
        songItem.classList.add('locked');
      }
      
      songItem.appendChild(number);
      songItem.appendChild(title);
      content.appendChild(songItem);
    });
  }
  
  toggle3DMode() {
    this.is3DMode = !this.is3DMode;
    
    if (this.is3DMode) {
      // Switch to 3D
      this.grid.style.display = 'none';
      this.svg.style.display = 'none';
      this.threeCanvas.style.display = 'block';
      
      if (!this.threeScene) {
        this.init3DScene();
      }
      
      this.animate3D();
    } else {
      // Switch to 2D
      this.grid.style.display = 'grid';
      this.svg.style.display = 'block';
      this.threeCanvas.style.display = 'none';
      
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    }
  }
  
  init3DScene() {
    // Use existing Three.js from window
    if (!window.THREE) {
      console.error('❌ Three.js not loaded - cannot initialize 3D view');
      return;
    }
    
    const THREE = window.THREE;
    this.THREE = THREE;
    
    // Scene setup
    this.threeScene = new THREE.Scene();
    this.threeScene.background = new THREE.Color(0x0a0a0f);
    this.threeScene.fog = new THREE.Fog(0x0a0a0f, 10, 50);
    
    // Camera setup
    this.threeCamera = new THREE.PerspectiveCamera(
      50,
      this.threeCanvas.clientWidth / this.threeCanvas.clientHeight,
      0.1,
      1000
    );
    this.threeCamera.position.set(0, 15, 25);
    this.threeCamera.lookAt(0, 0, 0);
    
    // Renderer setup
    this.threeRenderer = new THREE.WebGLRenderer({
      canvas: this.threeCanvas,
      antialias: true
    });
    this.threeRenderer.setSize(this.threeCanvas.clientWidth, this.threeCanvas.clientHeight);
    this.threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404050, 0.5);
    this.threeScene.add(ambientLight);
    
    // Directional light
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    this.threeScene.add(dirLight);
    
    // Point light for accent
    const pointLight = new THREE.PointLight(0x00ccff, 1, 30);
    pointLight.position.set(0, 8, 0);
    this.threeScene.add(pointLight);
    
    // Create tablet and voxel scenes
    this.create3DTablet();
    this.createVoxelScenes();
    
    // Handle resize
    window.addEventListener('resize', () => {
      if (this.is3DMode && this.threeCamera && this.threeRenderer) {
        this.threeCamera.aspect = this.threeCanvas.clientWidth / this.threeCanvas.clientHeight;
        this.threeCamera.updateProjectionMatrix();
        this.threeRenderer.setSize(this.threeCanvas.clientWidth, this.threeCanvas.clientHeight);
      }
    });
    
    // Mouse interaction for rotation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    this.threeCanvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    this.threeCanvas.addEventListener('mousemove', (e) => {
      if (isDragging && this.tabletGroup) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        
        this.tabletGroup.rotation.y += deltaX * 0.01;
        this.tabletGroup.rotation.x += deltaY * 0.01;
        
        // Limit vertical rotation
        this.tabletGroup.rotation.x = Math.max(-0.5, Math.min(0.5, this.tabletGroup.rotation.x));
        
        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });
    
    this.threeCanvas.addEventListener('mouseup', () => {
      isDragging = false;
    });
    
    this.threeCanvas.addEventListener('mouseleave', () => {
      isDragging = false;
    });
  }
  
  create3DTablet() {
    const THREE = this.THREE;
    
    // Group for the tablet
    this.tabletGroup = new THREE.Group();
    this.tabletGroup.position.y = 2;
    this.tabletGroup.rotation.x = -0.2;
    
    // Tablet base (slab)
    const tabletGeometry = new THREE.BoxGeometry(18, 0.3, 12);
    const tabletMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.3,
      roughness: 0.7
    });
    const tablet = new THREE.Mesh(tabletGeometry, tabletMaterial);
    this.tabletGroup.add(tablet);
    
    // Tablet frame/bezel
    const frameGeometry = new THREE.BoxGeometry(18.2, 0.4, 12.2);
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f0f1a,
      metalness: 0.5,
      roughness: 0.5
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.y = -0.05;
    this.tabletGroup.add(frame);
    
    // Table surface
    const tableGeometry = new THREE.BoxGeometry(30, 0.5, 20);
    const tableMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a1810,
      roughness: 0.8
    });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.y = -2;
    this.tabletGroup.add(table);
    
    this.threeScene.add(this.tabletGroup);
  }
  
  createVoxelScenes() {
    const THREE = this.THREE;
    
    // Voxel container group
    this.voxelGroup = new THREE.Group();
    this.voxelGroup.position.y = 0.3; // Just above tablet surface
    this.tabletGroup.add(this.voxelGroup);
    
    // Create voxel scenes for each node
    const gridCols = 5;
    const gridRows = 4;
    const spacing = 3.2;
    const offsetX = -(gridCols - 1) * spacing / 2;
    const offsetZ = -(gridRows - 1) * spacing / 2;
    
    // Filter to visible nodes only
    const visibleNodes = this.nodes.filter(n => 
      ['landing', 'form', 'shipped', 'presenting', 'celli', 'visicell', 
       'flash', 'reboot', 'execution', 'theos', 'sunsettings', 'rave', 'pockit'].includes(n.id)
    );
    
    visibleNodes.forEach((node, idx) => {
      const col = idx % gridCols;
      const row = Math.floor(idx / gridCols);
      
      const x = offsetX + col * spacing;
      const z = offsetZ + row * spacing;
      
      // Create voxel scene container
      const sceneGroup = new THREE.Group();
      sceneGroup.position.set(x, 0, z);
      
      // Build scene-specific vignette
      this.buildSceneVignette(sceneGroup, node.id, THREE);
      
      // Store for animation
      sceneGroup.userData.node = node;
      sceneGroup.userData.baseRotation = Math.random() * Math.PI * 2;
      
      this.voxelGroup.add(sceneGroup);
    });
  }
  
  buildSceneVignette(group, sceneId, THREE) {
    const voxelSize = 0.12;
    const createVoxel = (x, y, z, color, emissive = 0.3, animated = false) => {
      const geometry = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize);
      const material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: emissive,
        metalness: 0.2,
        roughness: 0.6
      });
      const voxel = new THREE.Mesh(geometry, material);
      voxel.position.set(x * voxelSize, y * voxelSize, z * voxelSize);
      if (animated) {
        voxel.userData.animated = true;
        voxel.userData.baseY = voxel.position.y;
        voxel.userData.phase = Math.random() * Math.PI * 2;
      }
      group.add(voxel);
      return voxel;
    };
    
    const createCharacter = (x, y, z, bodyColor, headColor) => {
      // Simple character: head + body + arms + legs
      // Body
      for (let by = 0; by < 3; by++) {
        createVoxel(x, y + by, z, bodyColor, 0.3);
      }
      // Head
      createVoxel(x, y + 3, z, headColor, 0.4, true);
      createVoxel(x, y + 4, z, headColor, 0.4);
      // Arms
      createVoxel(x - 1, y + 2, z, bodyColor, 0.3);
      createVoxel(x + 1, y + 2, z, bodyColor, 0.3);
      // Legs
      createVoxel(x, y - 1, z, bodyColor, 0.25);
      createVoxel(x - 0.5, y - 2, z, bodyColor, 0.25);
      createVoxel(x + 0.5, y - 2, z, bodyColor, 0.25);
    };
    
    const createBuilding = (x, z, height, color) => {
      for (let y = 0; y < height; y++) {
        for (let bx = -0.5; bx <= 0.5; bx += 0.5) {
          for (let bz = -0.5; bz <= 0.5; bz += 0.5) {
            const brightness = 0.2 + (y / height) * 0.2;
            createVoxel(x + bx, y, z + bz, color, brightness, y === height - 1);
          }
        }
      }
      // Windows
      if (height > 2) {
        for (let y = 1; y < height - 1; y++) {
          createVoxel(x - 0.5, y, z, 0xffff88, 0.6, true);
          createVoxel(x + 0.5, y, z, 0xffff88, 0.6, true);
        }
      }
    };
    
    switch(sceneId) {
      case 'landing':
        // Simple door/entrance
        for (let y = 0; y < 5; y++) {
          createVoxel(0, y, 0, 0x6699ff, 0.3);
          if (y < 3) createVoxel(-1, y, 0, 0x4466cc, 0.2);
          if (y < 3) createVoxel(1, y, 0, 0x4466cc, 0.2);
        }
        createVoxel(0, 5, 0, 0x88aaff, 0.5, true); // Top light
        break;
        
      case 'form':
        // Form fields (horizontal lines)
        for (let x = -1; x <= 1; x++) {
          createVoxel(x, 1, 0, 0x5588ff, 0.25);
          createVoxel(x, 2, 0, 0x5588ff, 0.25);
          createVoxel(x, 3, 0, 0x5588ff, 0.25);
        }
        createVoxel(-1, 4, 0, 0x88ff88, 0.5, true); // Submit button
        break;
        
      case 'shipped':
        // Package/box
        for (let x = -1; x <= 1; x++) {
          for (let z = -1; z <= 1; z++) {
            createVoxel(x, 1, z, 0x8B4513, 0.2);
          }
        }
        createVoxel(0, 2, 0, 0xDEB887, 0.3);
        createVoxel(-1, 2, 0, 0xDEB887, 0.3);
        createVoxel(1, 2, 0, 0xDEB887, 0.3);
        createVoxel(0, 3, 0, 0xFFD700, 0.5, true); // Shipping label
        break;
        
      case 'presenting':
        // Presentation screen with stand
        for (let x = -2; x <= 2; x++) {
          for (let y = 2; y <= 4; y++) {
            createVoxel(x, y, 0, 0x333355, 0.15);
          }
        }
        createVoxel(-1, 3, 0, 0x00ccff, 0.6, true);
        createVoxel(0, 3, 0, 0x00ccff, 0.6, true);
        createVoxel(1, 3, 0, 0x00ccff, 0.6, true);
        createVoxel(0, 1, 0, 0x666677, 0.1); // Stand
        createVoxel(0, 0, 0, 0x444455, 0.1); // Base
        break;
        
      case 'celli':
        // Spreadsheet grid base (larger, more detailed)
        for (let x = -3; x <= 3; x++) {
          for (let z = -2; z <= 2; z++) {
            const checker = (x + z) % 2 === 0;
            createVoxel(x, 0, z, checker ? 0xffdd00 : 0xffaa00, 0.3);
            if (Math.abs(x) > 1 || Math.abs(z) > 1) {
              createVoxel(x, 1, z, checker ? 0xffcc00 : 0xff9900, 0.25);
            }
          }
        }
        
        // Celli avatar character in center
        createCharacter(0, 2, 0, 0xffdd00, 0xffff00);
        
        // Floating spreadsheet cells around avatar
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const radius = 2.5;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const colors = [0x00ff00, 0x00ffff, 0xff00ff, 0xff8800, 0x8888ff, 0xff0088];
          const voxel = createVoxel(x, 3, z, colors[i], 0.7, true);
          voxel.userData.orbitAngle = angle;
          voxel.userData.orbitRadius = radius;
          voxel.userData.orbitSpeed = 0.3;
        }
        
        // Data particles
        for (let i = 0; i < 8; i++) {
          const x = (Math.random() - 0.5) * 4;
          const y = 1 + Math.random() * 4;
          const z = (Math.random() - 0.5) * 3;
          createVoxel(x, y, z, 0xffffff, 0.8, true);
        }
        break;
        
      case 'visicell':
        // Eye/vision symbol
        for (let x = -2; x <= 2; x++) {
          createVoxel(x, 2, 0, 0x6699ff, 0.3);
        }
        createVoxel(-1, 3, 0, 0x6699ff, 0.3);
        createVoxel(1, 3, 0, 0x6699ff, 0.3);
        createVoxel(-1, 1, 0, 0x6699ff, 0.3);
        createVoxel(1, 1, 0, 0x6699ff, 0.3);
        createVoxel(0, 2, 0, 0x0044ff, 0.6, true); // Pupil
        break;
        
      case 'flash':
        // Blood drips
        createVoxel(0, 4, 0, 0xbb0000, 0.5);
        createVoxel(0, 3, 0, 0xaa0000, 0.4);
        createVoxel(0, 2, 0, 0x990000, 0.4);
        createVoxel(0, 1, 0, 0x880000, 0.3);
        createVoxel(-1, 3, 0, 0xcc0000, 0.5);
        createVoxel(-1, 2, 0, 0xbb0000, 0.4);
        createVoxel(1, 4, 0, 0xdd0000, 0.5);
        createVoxel(1, 3, 0, 0xcc0000, 0.4);
        createVoxel(0, 0, 0, 0x660000, 0.2); // Pool
        createVoxel(-1, 0, 0, 0x660000, 0.2);
        createVoxel(1, 0, 0, 0x660000, 0.2);
        break;
        
      case 'reboot':
        // Terminal/command prompt
        for (let y = 1; y <= 4; y++) {
          for (let x = -2; x <= 2; x++) {
            createVoxel(x, y, 0, 0x001100, 0.1);
          }
        }
        createVoxel(-2, 3, 0, 0x00ff00, 0.6, true);
        createVoxel(-1, 3, 0, 0x00ff00, 0.6, true);
        createVoxel(0, 3, 0, 0x00ff00, 0.6, true);
        createVoxel(-2, 2, 0, 0x00cc00, 0.5);
        createVoxel(-1, 2, 0, 0x00cc00, 0.5);
        createVoxel(1, 1, 0, 0x00ff00, 0.7, true); // Cursor
        break;
        
      case 'execution':
        // Code brackets <>
        createVoxel(-2, 3, 0, 0x00ccff, 0.5);
        createVoxel(-1, 4, 0, 0x00ccff, 0.5);
        createVoxel(-1, 2, 0, 0x00ccff, 0.5);
        createVoxel(2, 3, 0, 0x00ccff, 0.5);
        createVoxel(1, 4, 0, 0x00ccff, 0.5);
        createVoxel(1, 2, 0, 0x00ccff, 0.5);
        createVoxel(0, 3, 0, 0xff8800, 0.6, true);
        createVoxel(0, 2, 0, 0xff8800, 0.6, true);
        break;
        
      case 'theos':
        // Black hole with accretion disk
        createVoxel(0, 2, 0, 0x000000, 0.0); // Black center
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const x = Math.cos(angle) * 1.5;
          const z = Math.sin(angle) * 1.5;
          const voxel = createVoxel(x, 2, z, 0x8844ff, 0.6, true);
          voxel.userData.orbitAngle = angle;
          voxel.userData.orbitRadius = 1.5;
        }
        createVoxel(0, 3, 0, 0x6600ff, 0.4);
        createVoxel(0, 1, 0, 0x6600ff, 0.4);
        break;
        
      case 'sunsettings':
        // Sunset with sun
        createVoxel(0, 4, 0, 0xffcc00, 0.8, true); // Sun
        createVoxel(-1, 4, 0, 0xff9900, 0.6);
        createVoxel(1, 4, 0, 0xff9900, 0.6);
        for (let x = -2; x <= 2; x++) {
          createVoxel(x, 2, 0, 0xff6600, 0.4);
          createVoxel(x, 1, 0, 0xff3300, 0.3);
          createVoxel(x, 0, 0, 0xcc2200, 0.2);
        }
        break;
        
      case 'rave':
        // Pal-ette character (palette with legs/arms)
        const paletteColors = [0xff0000, 0xff7700, 0xffff00, 0x00ff00, 0x0088ff, 0x8800ff, 0xff00ff];
        
        // Palette body (flat round base)
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const x = Math.cos(angle) * 1.2;
          const z = Math.sin(angle) * 1.2;
          createVoxel(x, 2, z, paletteColors[i % paletteColors.length], 0.5, true);
        }
        createVoxel(0, 2, 0, 0xffffff, 0.4);
        
        // Paint spots on palette
        for (let i = 0; i < paletteColors.length; i++) {
          const angle = (i / paletteColors.length) * Math.PI * 2;
          const x = Math.cos(angle) * 0.8;
          const z = Math.sin(angle) * 0.8;
          createVoxel(x, 3, z, paletteColors[i], 0.8, true);
        }
        
        // Legs
        createVoxel(-0.5, 1, 0, 0x666666, 0.3);
        createVoxel(0.5, 1, 0, 0x666666, 0.3);
        createVoxel(-0.5, 0, 0, 0x555555, 0.2);
        createVoxel(0.5, 0, 0, 0x555555, 0.2);
        
        // Arms holding brush
        createVoxel(-1.5, 2, 0, 0x666666, 0.3);
        createVoxel(1.5, 2, 0, 0x666666, 0.3);
        createVoxel(-2, 2.5, 0, 0x8B4513, 0.4); // Brush handle
        createVoxel(-2, 3, 0, 0xff00ff, 0.7, true); // Brush bristles
        
        // Rainbow particles flying around
        for (let i = 0; i < 15; i++) {
          const x = (Math.random() - 0.5) * 5;
          const y = Math.random() * 5 + 1;
          const z = (Math.random() - 0.5) * 3;
          const color = paletteColors[Math.floor(Math.random() * paletteColors.length)];
          const voxel = createVoxel(x, y, z, color, 0.8, true);
          voxel.userData.orbitAngle = Math.random() * Math.PI * 2;
          voxel.userData.orbitRadius = 2 + Math.random() * 2;
          voxel.userData.orbitSpeed = 0.5 + Math.random() * 0.5;
        }
        break;
        
      case 'pockit':
        // City skyline with buildings
        createBuilding(-2, -1, 6, 0x4488ff);
        createBuilding(0, -0.5, 8, 0x6699ff);
        createBuilding(2, -1, 5, 0x5577ff);
        createBuilding(-1, 1, 4, 0x7799ff);
        createBuilding(1, 1, 7, 0x88aaff);
        
        // Ground/street
        for (let x = -3; x <= 3; x++) {
          for (let z = -2; z <= 2; z++) {
            createVoxel(x, -1, z, 0x333333, 0.15);
          }
        }
        
        // Street lights
        createVoxel(-2.5, 0, 2, 0x666666, 0.2);
        createVoxel(-2.5, 1, 2, 0x666666, 0.2);
        createVoxel(-2.5, 2, 2, 0xffff88, 0.7, true);
        createVoxel(2.5, 0, 2, 0x666666, 0.2);
        createVoxel(2.5, 1, 2, 0x666666, 0.2);
        createVoxel(2.5, 2, 2, 0xffff88, 0.7, true);
        
        // Flying data particles
        for (let i = 0; i < 6; i++) {
          const x = (Math.random() - 0.5) * 4;
          const y = 3 + Math.random() * 4;
          const z = (Math.random() - 0.5) * 3;
          createVoxel(x, y, z, 0x00ffff, 0.8, true);
        }
        break;
    }
  }
  
  animate3D() {
    if (!this.is3DMode || !this.threeScene) return;
    
    this.animationFrameId = requestAnimationFrame(() => this.animate3D());
    
    const time = Date.now() * 0.001;
    
    // Animate voxel scenes
    if (this.voxelGroup) {
      this.voxelGroup.children.forEach((sceneGroup) => {
        const nodeId = sceneGroup.userData.node?.id;
        
        // Animate all voxels in scene
        sceneGroup.children.forEach((voxel, idx) => {
          // Animated voxels (marked with userData.animated)
          if (voxel.userData.animated) {
            // Float animation
            voxel.position.y = voxel.userData.baseY + Math.sin(time * 2 + voxel.userData.phase) * 0.015;
            
            // Pulse emissive
            if (voxel.material.emissiveIntensity) {
              const baseIntensity = voxel.userData.baseEmissive || voxel.material.emissiveIntensity;
              voxel.userData.baseEmissive = baseIntensity;
              voxel.material.emissiveIntensity = baseIntensity + Math.sin(time * 3 + voxel.userData.phase) * 0.2;
            }
          }
          
          // Orbital animations (for theos, celli, rave)
          if (voxel.userData.orbitAngle !== undefined && voxel.userData.orbitRadius !== undefined) {
            const speed = voxel.userData.orbitSpeed || 0.5;
            const angle = voxel.userData.orbitAngle + time * speed;
            const radius = voxel.userData.orbitRadius;
            voxel.position.x = Math.cos(angle) * radius * 0.12;
            voxel.position.z = Math.sin(angle) * radius * 0.12;
            
            // Add slight vertical bobbing for rave particles
            if (nodeId === 'rave') {
              voxel.position.y = voxel.userData.baseY + Math.sin(time * 2 + angle) * 0.02;
            }
          }
        });
        
        // Subtle scene group rotation
        sceneGroup.rotation.y = Math.sin(time * 0.3 + sceneGroup.userData.baseRotation) * 0.1;
      });
    }
    
    // Subtle tablet rotation
    if (this.tabletGroup && !this.threeCanvas.matches(':hover')) {
      this.tabletGroup.rotation.y = Math.sin(time * 0.2) * 0.1;
    }
    
    this.threeRenderer.render(this.threeScene, this.threeCamera);
  }
  
  dispose3D() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    if (this.threeScene) {
      this.threeScene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }
    
    if (this.threeRenderer) {
      this.threeRenderer.dispose();
    }
    
    this.threeScene = null;
    this.threeCamera = null;
    this.threeRenderer = null;
  }
  
  destroy() {
    this.dispose3D();
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    console.log('🗺️ Map destroyed');
  }
}

// Create and export map instance
const map = new Map();

// Global function to log song plays (call this when audio plays)
window.logCelliSong = function(filename) {
  if (map && map.logSongPlay) {
    map.logSongPlay(filename);
  }
};

export { map };

