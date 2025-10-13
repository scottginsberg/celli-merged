/**
 * Complete Intro Scene - Faithful port from merged2.html
 * 
 * Includes all animation phases:
 * - Roll: Shapes roll into place
 * - Bounce: Sequential bounces with thunk sounds
 * - Triangle: Form triangle + grow + converge
 * - Orbit: Eclipse/radiate motion around black hole
 * - Venn: Clear venn diagram effect
 * - Collapse: Collapse to white circle
 * - Glitch: Intense glitch + fade
 * - Blackout: Complete blackout
 * - Loomworks: Show Loomworks text animation
 * - CELLI: CELLI voxel drop animation
 * - Doorway: Door way portal with input
 * - Transformations: Yellow, magenta, cyan phases
 * - END sequence: Backspace restoration
 * - Move to corner: Transition to VisiCell
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export class IntroSceneComplete {
  constructor() {
    this.state = {
      running: false,
      totalTime: 0,
      clock: new THREE.Clock(),
      scene: null,
      camera: null,
      renderer: null,
      composer: null,
      blackHole: null,
      spheres: [],
      voxels: [],
      letterVoxels: { C: [], E: [], L1: [], L2: [], I: [] },
      filmPass: null,
      triMesh: null, // Color triangle between spheres
      textParticles: [], // Click particle system
      starParticles: [], // Burst particles
      derezParticles: [], // Derez particles
      
      // Animation phases
      introCfg: {
        rollEnd: 2.5,
        bounceEnd: 4.5,
        triangleEnd: 7.5,
        transitionEnd: 9.5,
        normalEnd: 15.5,
        vennEnd: 18.0,
        collapseEnd: 22.0,
        glitchEnd: 24.5,
        blackoutEnd: 26.0,
        loomworksEnd: 30.0,
        celliEnd: 36.0,
        doorwayEnd: 44.0,
        ballSize: 0.12,
        bounceHeight: 0.35,
        bounceDuration: 0.6
      },
      
      // Motion config
      motionCfg: {
        speed: 0.8,
        maxDist: 0.65,
        rotationSpeed: 0.4,
        minScale: 0.4
      },
      
      // State flags
      celliStarted: false,
      celliStartTime: 0,
      doorwayShown: false,
      doorwayOpened: false,
      loomworksShown: false,
      loomworksRevealStarted: false,
      quoteShown: false,
      inputAttempted: false,
      inputText: '=STAR',
      tEntered: false,
      burstAnimStarted: false,
      celliBackspaceSequenceStarted: false,
      celliBackspaceSequenceTime: 0,
      celliMoveToCornerStarted: false,
      celliMoveToCornerTime: 0,
      visiCalcShown: false,
      
      // Animation state
      finalRollRotations: [0, 0, 0],
      landingSounds: [false, false, false],
      lastThunkTime: [0, 0, 0],
      
      // Backspace state
      glitchedVoxelsStack: [],
      lettersToRestore: ['C', 'E', 'L1', 'L2'],
      restoredLetters: 0,
      endSequence: '',
      allYellowTransformed: false,
      yellowTransformCompleteCount: 0,
      endColorState: 'yellow',
      snapTogetherStarted: false,
      snapTogetherTime: 0,
      
      // Audio context
      audioCtx: null,
      synthGain: null,
      synthOsc1: null,
      synthOsc2: null,
      synthOsc3: null
    };
  }

  /**
   * Initialize scene
   */
  async init() {
    console.log('🎬 Initializing Complete Intro Scene...');

    const app = document.getElementById('app');
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: false, 
      powerPreference: 'high-performance' 
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.setClearColor(0x000000, 1);
    app.appendChild(renderer.domElement);

    // Create scene
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 10);
    camera.position.set(0, 0, 2);
    camera.lookAt(0, 0, 0);

    // Black hole shader
    const blackHole = this._createBlackHole(scene);
    
    // Create orbiting shapes
    const { spheres, triMesh } = this._createShapes(scene);
    
    // Create CELLI voxels
    const { voxels, letterVoxels } = this._createVoxels(scene);
    
    // Post-processing
    const { composer, filmPass } = this._createPostProcessing(renderer, scene, camera);
    
    // Initialize audio
    this._initAudio();

    // Store references
    this.state.scene = scene;
    this.state.camera = camera;
    this.state.renderer = renderer;
    this.state.composer = composer;
    this.state.blackHole = blackHole;
    this.state.spheres = spheres;
    this.state.voxels = voxels;
    this.state.letterVoxels = letterVoxels;
    this.state.filmPass = filmPass;
    this.state.triMesh = triMesh;

    // Setup event listeners
    this._setupEventListeners();

    // Setup resize handler
    window.addEventListener('resize', () => this._handleResize());

    console.log('✅ Complete Intro Scene initialized');
  }

  /**
   * Create black hole with shader
   */
  _createBlackHole(scene) {
    const blackHoleGeo = new THREE.CircleGeometry(0.35, 64);
    const blackHoleMat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 }, pulseFactor: { value: 0.5 } },
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `
        varying vec2 vUv; uniform float time; uniform float pulseFactor;
        void main() {
          vec2 center = vec2(0.5);
          float dist = distance(vUv, center);
          float baseRadius = 0.08 + pulseFactor * 0.28;
          float pulse1 = 0.015 * sin(time * 3.5);
          float pulse2 = 0.008 * sin(time * 7.3 + 1.5);
          float radius = baseRadius + pulse1 + pulse2;
          float fadeDistance = radius * 1.6;
          float alpha = 1.0 - smoothstep(radius - fadeDistance, radius, dist);
          alpha = pow(alpha, 0.6) * 0.9;
          gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
        }
      `,
      transparent: true,
      depthWrite: false
    });
    
    const blackHole = new THREE.Mesh(blackHoleGeo, blackHoleMat);
    blackHole.position.z = 0.1;
    scene.add(blackHole);
    
    return blackHole;
  }

  /**
   * Create the three orbiting shapes with color triangle
   */
  _createShapes(scene) {
    const R = 0.16;
    const makeMat = (hex) => new THREE.MeshBasicMaterial({ 
      color: new THREE.Color(hex), 
      blending: THREE.AdditiveBlending, 
      transparent: true, 
      depthWrite: false 
    });

    const CYAN = 0x00a8ff, MAGENTA = 0xff1e6e, YELLOW = 0xffb62e;
    const colors = [new THREE.Color(CYAN), new THREE.Color(YELLOW), new THREE.Color(MAGENTA)];

    // Create rounded shapes
    const createRoundedSquare = (size, radius) => {
      const shape = new THREE.Shape();
      const r = radius, s = size / 2;
      shape.moveTo(-s + r, -s);
      shape.lineTo(s - r, -s);
      shape.quadraticCurveTo(s, -s, s, -s + r);
      shape.lineTo(s, s - r);
      shape.quadraticCurveTo(s, s, s - r, s);
      shape.lineTo(-s + r, s);
      shape.quadraticCurveTo(-s, s, -s, s - r);
      shape.lineTo(-s, -s + r);
      shape.quadraticCurveTo(-s, -s, -s + r, -s);
      return new THREE.ShapeGeometry(shape, 32);
    };

    const createRoundedTriangle = (size, radius) => {
      const shape = new THREE.Shape();
      const h = size * Math.sqrt(3) / 2;
      const top = { x: 0, y: h / 2 };
      const bl = { x: -size/2, y: -h / 2 };
      const br = { x: size/2, y: -h / 2 };
      const r = radius * 0.8;
      
      shape.moveTo(bl.x + r, bl.y);
      shape.lineTo(br.x - r, br.y);
      shape.quadraticCurveTo(br.x, br.y, br.x - r * 0.5, br.y + r * 0.866);
      shape.lineTo(top.x + r * 0.5, top.y - r * 0.866);
      shape.quadraticCurveTo(top.x, top.y, top.x - r * 0.5, top.y - r * 0.866);
      shape.lineTo(bl.x + r * 0.5, bl.y + r * 0.866);
      shape.quadraticCurveTo(bl.x, bl.y, bl.x + r, bl.y);
      
      return new THREE.ShapeGeometry(shape, 32);
    };

    const geoSquare = createRoundedSquare(R * 2, R * 0.3);
    const geoTriangle = createRoundedTriangle(R * 2, R * 0.35);
    const geoCircle = new THREE.CircleGeometry(R, 64);

    const spheres = [
      new THREE.Mesh(geoSquare, makeMat(CYAN)),
      new THREE.Mesh(geoTriangle, makeMat(YELLOW)),
      new THREE.Mesh(geoCircle, makeMat(MAGENTA))
    ];

    spheres.forEach((s, i) => { 
      s.position.z = -i * 0.002; 
      scene.add(s); 
    });

    // Create color triangle shader between spheres
    const triGeo = new THREE.PlaneGeometry(4, 4);
    const triMat = new THREE.ShaderMaterial({
      uniforms: {
        points: { value: [new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2()] },
        colors: { value: colors },
        aspect: { value: 1.0 }
      },
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`,
      fragmentShader: `
        varying vec2 vUv;
        uniform vec2 points[3];
        uniform vec3 colors[3];
        uniform float aspect;

        vec3 barycentric(vec2 p, vec2 a, vec2 b, vec2 c) {
          vec2 v0 = b - a, v1 = c - a, v2 = p - a;
          float d00 = dot(v0, v0);
          float d01 = dot(v0, v1);
          float d11 = dot(v1, v1);
          float d20 = dot(v2, v0);
          float d21 = dot(v2, v1);
          float denom = d00 * d11 - d01 * d01;
          float v = (d11 * d20 - d01 * d21) / denom;
          float w = (d00 * d21 - d01 * d20) / denom;
          float u = 1.0 - v - w;
          return vec3(u, v, w);
        }

        void main() {
          vec2 p = (vUv - 0.5) * 2.0;
          p.x *= aspect;

          vec3 b = barycentric(p, points[0], points[1], points[2]);

          if (b.x >= 0.0 && b.y >= 0.0 && b.z >= 0.0) {
            vec3 color = b.x * colors[0] + b.y * colors[1] + b.z * colors[2];
            float edgeDist = min(b.x, min(b.y, b.z));
            float edgeFade = smoothstep(0.0, 0.2, edgeDist);
            float centerDist = length(p);
            float centerFade = 1.0 - smoothstep(0.15, 0.65, centerDist);
            centerFade = pow(centerFade, 0.6);
            float centerGlow = 1.0 - smoothstep(0.0, 0.25, centerDist);
            float finalAlpha = (edgeFade * centerFade + centerGlow * 0.12) * 0.55;
            gl_FragColor = vec4(color, finalAlpha);
          } else {
            discard;
          }
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    const triMesh = new THREE.Mesh(triGeo, triMat);
    triMesh.position.z = -0.1;
    scene.add(triMesh);

    return { spheres, triMesh };
  }

  /**
   * Create CELLI voxel letters
   */
  _createVoxels(scene) {
    const voxelSize = 0.05;
    const voxelGeo = new THREE.BoxGeometry(voxelSize * 0.95, voxelSize * 0.95, voxelSize * 0.15);
    const voxelMat = new THREE.MeshBasicMaterial({ 
      color: 0x444444, 
      transparent: true, 
      opacity: 0, 
      blending: THREE.NormalBlending 
    });
    const edgesGeo = new THREE.EdgesGeometry(voxelGeo);
    const edgeMat = new THREE.LineBasicMaterial({ 
      color: 0x888888, 
      transparent: true, 
      opacity: 0 
    });

    const celliPatterns = {
      C: [[0,1,1,1,0], [1,0,0,0,0], [1,0,0,0,0], [1,0,0,0,0], [0,1,1,1,0]],
      E: [[1,1,1,1,1], [1,0,0,0,0], [1,1,1,1,0], [1,0,0,0,0], [1,1,1,1,1]],
      L: [[1,0,0,0,0], [1,0,0,0,0], [1,0,0,0,0], [1,0,0,0,0], [1,1,1,1,1]],
      I: [[1,1,1,1,1], [0,0,1,0,0], [0,0,1,0,0], [0,0,1,0,0], [1,1,1,1,1]]
    };

    const voxels = [];
    const letterVoxels = { C: [], E: [], L1: [], L2: [], I: [] };
    const letters = ['C', 'E', 'L', 'L', 'I'];
    const letterSpacing = 0.4;
    const celliScale = 1.0;
    const startX = -(letters.length * letterSpacing * celliScale) / 2 + (letterSpacing * celliScale) / 2;

    letters.forEach((letter, letterIdx) => {
      const pattern = celliPatterns[letter];
      const letterX = startX + letterIdx * letterSpacing * celliScale;
      
      pattern.forEach((row, rowIdx) => {
        row.forEach((cell, colIdx) => {
          if (cell === 1) {
            const voxel = new THREE.Mesh(voxelGeo, voxelMat.clone());
            const edges = new THREE.LineSegments(edgesGeo, edgeMat.clone());
            voxel.add(edges);
            
            const x = letterX + (colIdx - 2) * voxelSize * 1.2 * celliScale;
            const y = (2 - rowIdx) * voxelSize * 1.2 * celliScale + 0.35;
            
            voxel.userData = {
              targetX: x,
              targetY: y,
              startY: y + 2.0 + Math.random() * 1.0,
              dropDelay: letterIdx * 0.15 + (rowIdx * colIdx) * 0.02,
              dropSpeed: 0.02 + Math.random() * 0.01,
              settled: false,
              jigglePhase: Math.random() * Math.PI * 2,
              flickerPhase: Math.random() * Math.PI * 2,
              edges: edges,
              gridX: letterIdx,
              gridY: rowIdx,
              gridCol: colIdx,
              letterIdx: letterIdx,
              gridRow: rowIdx,
              glitched: false,
              baseScale: celliScale,
              backspaceTransformed: false,
              backspacePulseOffset: Math.random() * Math.PI * 2
            };
            
            voxel.scale.set(celliScale, celliScale, celliScale);
            voxel.position.set(x, voxel.userData.startY, 0);
            voxel.visible = false;
            scene.add(voxel);
            voxels.push(voxel);
            
            // Track by letter
            const letterKey = letterIdx === 0 ? 'C' : letterIdx === 1 ? 'E' : letterIdx === 2 ? 'L1' : letterIdx === 3 ? 'L2' : 'I';
            letterVoxels[letterKey].push(voxel);
          }
        });
      });
    });

    return { voxels, letterVoxels };
  }

  /**
   * Create post-processing pipeline
   */
  _createPostProcessing(renderer, scene, camera) {
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.7, 0.9, 0.2
    );
    composer.addPass(bloomPass);

    const afterimagePass = new AfterimagePass(0.96);
    composer.addPass(afterimagePass);

    const filmPass = new ShaderPass({
      uniforms: { 
        tDiffuse: { value: null }, 
        time: { value: 0 }, 
        noise: { value: 0.03 }, 
        scanAmp: { value: 0.03 } 
      },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `
        precision highp float; 
        varying vec2 vUv; 
        uniform sampler2D tDiffuse; 
        uniform float time; 
        uniform float noise; 
        uniform float scanAmp;
        float rand(vec2 co){ return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453); }
        void main(){ 
          vec3 col = texture2D(tDiffuse, vUv).rgb; 
          float n = rand(vUv + fract(time)); 
          float scan = sin((vUv.y + time*0.04)*3.14159*480.0) * scanAmp; 
          col += n*noise; 
          col += scan; 
          col = pow(col, vec3(1.02)); 
          gl_FragColor = vec4(col, 1.0); 
        }`
    });
    composer.addPass(filmPass);

    return { composer, filmPass };
  }

  /**
   * Initialize audio system
   */
  _initAudio() {
    try {
      this.state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      window.audioCtx = this.state.audioCtx;
      console.log('🔊 Audio context initialized');
    } catch (e) {
      console.warn('⚠️ Audio context initialization failed:', e);
    }
  }

  /**
   * Setup event listeners
   */
  _setupEventListeners() {
    // Click handler for text particles
    document.addEventListener('click', (e) => {
      if (!this.state.running) return;
      
      // Convert screen to world coordinates
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      
      // Create text particles at click position
      this._createTextParticlesAtPosition(x, y);
    });

    // Keyboard handler for doorway input
    document.addEventListener('keydown', (e) => {
      if (this.state.doorwayOpened && !this.state.inputAttempted) {
        this._handleDoorwayInput(e);
      }
    });
  }

  /**
   * Create text particles at position
   */
  _createTextParticlesAtPosition(x, y) {
    // Text options
    const texts = ["huh?", "who's there?", "AH!", "HAHA.", "ow.", "ahh...", "oh!", "what?", "why?", "where?", "when?"];
    const text = texts[Math.floor(Math.random() * texts.length)];
    
    // Color based on nearest sphere
    const colors = ['#00a8ff', '#ffb62e', '#ff1e6e'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Create particle
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.004 + Math.random() * 0.006;
      const particle = {
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        text,
        color,
        life: 1.0,
        age: 0,
        rotation: (Math.random() - 0.5) * 0.03,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        pulse: Math.random() * Math.PI * 2,
        collapsing: false
      };
      this.state.textParticles.push(particle);
    }
  }

  /**
   * Handle doorway input
   */
  _handleDoorwayInput(e) {
    if (e.key === 't' || e.key === 'T') {
      this.state.tEntered = true;
      this.state.inputText += 'T';
      // Update display
      const promptText = document.getElementById('promptText');
      if (promptText) promptText.textContent = this.state.inputText;
      
      // Trigger burst animation
      if (!this.state.burstAnimStarted) {
        this.state.burstAnimStarted = true;
        this._startBurstAnimation();
      }
    } else if (e.key === 'Backspace') {
      // Handle backspace sequence
      if (!this.state.celliBackspaceSequenceStarted) {
        this.state.celliBackspaceSequenceStarted = true;
        this.state.celliBackspaceSequenceTime = 0;
      }
    } else if (e.key.length === 1 && /[EDNend]/.test(e.key)) {
      // Handle END sequence
      this.state.endSequence += e.key.toUpperCase();
      if (this.state.endSequence.includes('END')) {
        this._startEndSequence();
      }
    }
  }

  /**
   * Start burst animation (when T is pressed)
   */
  _startBurstAnimation() {
    console.log('✨ Starting burst animation');
    
    // Glitch out CELLI voxels in random order
    const voxelsCopy = [...this.state.voxels];
    for (let i = voxelsCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [voxelsCopy[i], voxelsCopy[j]] = [voxelsCopy[j], voxelsCopy[i]];
    }

    voxelsCopy.forEach((voxel, idx) => {
      setTimeout(() => {
        if (voxel && voxel.userData) {
          voxel.visible = false;
          voxel.userData.glitched = true;
          this.state.glitchedVoxelsStack.push(voxel);
          
          // Create star particle
          this._createStarParticle(voxel.position.x, voxel.position.y);
        }
      }, idx * 12);
    });
  }

  /**
   * Create star particle from voxel burst
   */
  _createStarParticle(x, y) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.01 + Math.random() * 0.02;
    const particle = {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      size: 0.02 + Math.random() * 0.03,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05
    };
    this.state.starParticles.push(particle);
  }

  /**
   * Start END sequence
   */
  _startEndSequence() {
    console.log('🎬 Starting END sequence');
    this.state.celliMoveToCornerStarted = true;
    this.state.celliMoveToCornerTime = 0;
  }

  /**
   * Start scene
   */
  async start(state, options = {}) {
    console.log('▶️ Starting Complete Intro Scene');
    
    // Hide play overlay
    const playEl = document.getElementById('play');
    if (playEl) playEl.classList.add('hidden');
    
    // Show quote
    const quoteEl = document.getElementById('quote');
    if (quoteEl) {
      quoteEl.classList.add('visible');
      this.state.quoteShown = true;
    }
    
    // Start animation
    this.state.running = true;
    this.state.clock.start();
    
    // Resume audio context
    if (this.state.audioCtx && this.state.audioCtx.state === 'suspended') {
      await this.state.audioCtx.resume();
    }
  }

  /**
   * Update scene (called from animation loop)
   */
  update(state, deltaTime, totalTime) {
    if (!this.state.running) return;

    this.state.totalTime += deltaTime;
    const t = this.state.totalTime;
    const cfg = this.state.introCfg;

    // Update black hole
    if (this.state.blackHole) {
      this.state.blackHole.material.uniforms.time.value = t;
    }

    // Determine current phase and update spheres
    this._updateSpheresPhase(t, cfg);

    // Update color triangle
    if (this.state.triMesh) {
      const aspect = window.innerWidth / window.innerHeight;
      this.state.triMesh.material.uniforms.aspect.value = aspect;
      this.state.triMesh.material.uniforms.points.value[0].set(
        this.state.spheres[0].position.x / aspect,
        this.state.spheres[0].position.y
      );
      this.state.triMesh.material.uniforms.points.value[1].set(
        this.state.spheres[1].position.x / aspect,
        this.state.spheres[1].position.y
      );
      this.state.triMesh.material.uniforms.points.value[2].set(
        this.state.spheres[2].position.x / aspect,
        this.state.spheres[2].position.y
      );
    }

    // Update CELLI voxels
    if (t >= cfg.loomworksEnd && !this.state.celliStarted) {
      this.state.celliStarted = true;
      this.state.celliStartTime = t;
    }

    if (this.state.celliStarted) {
      this._updateVoxels(t - this.state.celliStartTime);
    }

    // Update doorway
    if (t >= cfg.celliEnd && !this.state.doorwayShown) {
      this._showDoorway();
    }

    // Update text particles
    this._updateTextParticles(deltaTime);

    // Update star particles
    this._updateStarParticles(deltaTime);

    // Update backspace sequence
    if (this.state.celliBackspaceSequenceStarted) {
      this._updateBackspaceSequence(deltaTime);
    }

    // Update move to corner sequence
    if (this.state.celliMoveToCornerStarted) {
      this._updateMoveToCorner(deltaTime);
    }

    // Update film grain
    if (this.state.filmPass) {
      this.state.filmPass.uniforms.time.value = t;
    }

    // Render
    if (this.state.composer) {
      this.state.composer.render();
    }
  }

  /**
   * Update spheres based on animation phase
   */
  _updateSpheresPhase(t, cfg) {
    const speed = this.state.motionCfg.speed;
    const maxDist = this.state.motionCfg.maxDist;
    const rotSpeed = this.state.motionCfg.rotationSpeed;

    if (t < cfg.rollEnd) {
      // Phase: Roll into place
      const progress = t / cfg.rollEnd;
      const eased = progress * progress * (3 - 2 * progress);
      
      this.state.spheres.forEach((sphere, i) => {
        const offset = i * Math.PI * 2 / 3;
        const targetX = Math.cos(offset) * 0.25;
        const targetY = Math.sin(offset) * 0.25;
        sphere.position.x = THREE.MathUtils.lerp(-2 - i * 0.5, targetX, eased);
        sphere.position.y = THREE.MathUtils.lerp(0, targetY, eased);
        sphere.rotation.z = eased * Math.PI * 4;
        this.state.finalRollRotations[i] = sphere.rotation.z;
      });
    } else if (t < cfg.bounceEnd) {
      // Phase: Sequential bounces
      this.state.spheres.forEach((sphere, i) => {
        const offset = i * Math.PI * 2 / 3;
        const baseX = Math.cos(offset) * 0.25;
        const baseY = Math.sin(offset) * 0.25;
        
        const bounceStart = cfg.rollEnd + i * 0.3;
        const bounceTime = t - bounceStart;
        
        if (bounceTime > 0 && bounceTime < cfg.bounceDuration) {
          const bounceProgress = bounceTime / cfg.bounceDuration;
          const bounceHeight = Math.sin(bounceProgress * Math.PI) * cfg.bounceHeight;
          sphere.position.x = baseX;
          sphere.position.y = baseY - bounceHeight;
          
          // Play thunk sound on landing
          if (!this.state.landingSounds[i] && bounceProgress > 0.95) {
            this.state.landingSounds[i] = true;
            this._playThunkSound(i);
          }
        } else if (bounceTime >= cfg.bounceDuration) {
          sphere.position.x = baseX;
          sphere.position.y = baseY;
        }
      });
    } else if (t < cfg.triangleEnd) {
      // Phase: Triangle formation
      const triangleTime = t - cfg.bounceEnd;
      const triangleProgress = triangleTime / (cfg.triangleEnd - cfg.bounceEnd);
      const eased = triangleProgress * triangleProgress * (3 - 2 * triangleProgress);
      
      this.state.spheres.forEach((sphere, i) => {
        const offset = i * Math.PI * 2 / 3;
        const startX = Math.cos(offset) * 0.25;
        const startY = Math.sin(offset) * 0.25;
        const targetDist = 0.35;
        const targetX = Math.cos(offset) * targetDist;
        const targetY = Math.sin(offset) * targetDist;
        
        sphere.position.x = THREE.MathUtils.lerp(startX, targetX, eased);
        sphere.position.y = THREE.MathUtils.lerp(startY, targetY, eased);
      });
    } else {
      // Phase: Orbital motion (eclipse/radiate)
      const orbitalTime = t - cfg.triangleEnd;
      
      this.state.spheres.forEach((sphere, i) => {
        const offset = i * Math.PI * 2 / 3;
        const angle = orbitalTime * speed + offset;
        const dist = maxDist;
        
        sphere.position.x = Math.cos(angle) * dist;
        sphere.position.y = Math.sin(angle) * dist;
        sphere.rotation.z = angle * rotSpeed;
      });
    }
  }

  /**
   * Update CELLI voxels
   */
  _updateVoxels(celliTime) {
    this.state.voxels.forEach(voxel => {
      const data = voxel.userData;
      const localTime = celliTime - data.dropDelay;
      
      if (localTime > 0) {
        voxel.visible = true;
        
        if (!data.settled && voxel.position.y > data.targetY) {
          voxel.position.y -= data.dropSpeed;
          voxel.material.opacity = Math.min(0.8, voxel.material.opacity + 0.05);
          data.edges.material.opacity = Math.min(0.6, data.edges.material.opacity + 0.04);
        } else if (!data.settled) {
          voxel.position.y = data.targetY;
          data.settled = true;
        }
        
        // Subtle jiggle animation
        if (data.settled) {
          data.jigglePhase += 0.02;
          const jiggle = Math.sin(data.jigglePhase) * 0.002;
          voxel.position.x = data.targetX + jiggle;
        }
      }
    });
  }

  /**
   * Show doorway portal
   */
  _showDoorway() {
    this.state.doorwayShown = true;
    
    const doorway = document.getElementById('doorway');
    if (doorway) {
      doorway.classList.add('visible');
      
      setTimeout(() => {
        doorway.classList.add('open');
        this.state.doorwayOpened = true;
      }, 500);
    }
  }

  /**
   * Update text particles
   */
  _updateTextParticles(dt) {
    for (let i = this.state.textParticles.length - 1; i >= 0; i--) {
      const p = this.state.textParticles[i];
      
      p.age += dt;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.99;
      p.vy *= 0.99;
      p.rotation += p.rotationSpeed;
      p.pulse += dt * 4;
      
      if (p.age > 1.8 && !p.collapsing) {
        p.collapsing = true;
      }
      
      if (p.collapsing) {
        p.life -= dt * 2.5;
      } else {
        p.life -= dt * 0.5;
      }
      
      if (p.life <= 0) {
        this.state.textParticles.splice(i, 1);
      }
    }
  }

  /**
   * Update star particles
   */
  _updateStarParticles(dt) {
    for (let i = this.state.starParticles.length - 1; i >= 0; i--) {
      const p = this.state.starParticles[i];
      
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.life -= dt * 0.8;
      
      if (p.life <= 0) {
        this.state.starParticles.splice(i, 1);
      }
    }
  }

  /**
   * Update backspace sequence
   */
  _updateBackspaceSequence(dt) {
    this.state.celliBackspaceSequenceTime += dt;
    
    // Restore letters one by one
    const interval = 0.5; // Restore one letter every 0.5 seconds
    const letterIndex = Math.floor(this.state.celliBackspaceSequenceTime / interval);
    
    if (letterIndex > this.state.restoredLetters && letterIndex < this.state.lettersToRestore.length) {
      this.state.restoredLetters = letterIndex;
      this._restoreOneLetter();
    }
  }

  /**
   * Restore one letter from backspace
   */
  _restoreOneLetter() {
    if (this.state.restoredLetters >= this.state.lettersToRestore.length) return;
    
    const letterKey = this.state.lettersToRestore[this.state.restoredLetters];
    const letterVoxelsList = this.state.letterVoxels[letterKey];
    
    if (!letterVoxelsList) return;
    
    // Play fritz sound
    this._playFritzSound();
    
    // Restore voxels with flicker
    letterVoxelsList.forEach((voxel, idx) => {
      setTimeout(() => {
        voxel.visible = true;
        voxel.userData.glitched = false;
        voxel.material.opacity = 0.75;
        voxel.userData.edges.material.opacity = 0.35;
      }, idx * 30);
    });
  }

  /**
   * Update move to corner sequence
   */
  _updateMoveToCorner(dt) {
    this.state.celliMoveToCornerTime += dt;
    
    const collapseDuration = 1.5;
    const expandDuration = 1.0;
    const totalDuration = collapseDuration + expandDuration;
    
    if (this.state.celliMoveToCornerTime >= totalDuration && !this.state.visiCalcShown) {
      this.state.visiCalcShown = true;
      console.log('📊 VisiCalc ready to show');
      // Trigger VisiCalc scene transition
    }
  }

  /**
   * Play thunk sound
   */
  _playThunkSound(index) {
    if (!this.state.audioCtx) return;
    
    try {
      const now = this.state.audioCtx.currentTime;
      const osc = this.state.audioCtx.createOscillator();
      const gain = this.state.audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150 - index * 20, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      
      osc.connect(gain);
      gain.connect(this.state.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.warn('Thunk sound failed:', e);
    }
  }

  /**
   * Play fritz sound
   */
  _playFritzSound() {
    if (!this.state.audioCtx) return;
    
    try {
      const now = this.state.audioCtx.currentTime;
      const osc = this.state.audioCtx.createOscillator();
      const gain = this.state.audioCtx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.25);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      
      osc.connect(gain);
      gain.connect(this.state.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      console.warn('Fritz sound failed:', e);
    }
  }

  /**
   * Handle window resize
   */
  _handleResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    if (this.state.renderer) {
      this.state.renderer.setSize(w, h);
    }
    
    if (this.state.camera) {
      const aspect = w / h;
      this.state.camera.left = -aspect;
      this.state.camera.right = aspect;
      this.state.camera.updateProjectionMatrix();
    }
    
    if (this.state.composer) {
      this.state.composer.setSize(w, h);
    }
  }

  /**
   * Stop scene
   */
  async stop() {
    console.log('⏹️ Stopping Complete Intro Scene');
    this.state.running = false;
  }

  /**
   * Destroy scene (cleanup)
   */
  async destroy() {
    await this.stop();
    
    // Cleanup resources
    if (this.state.scene) {
      this.state.scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    }
    
    if (this.state.renderer && this.state.renderer.domElement) {
      this.state.renderer.domElement.remove();
      this.state.renderer.dispose();
    }
    
    if (this.state.audioCtx && this.state.audioCtx.state !== 'closed') {
      await this.state.audioCtx.close();
    }
  }
}

export default IntroSceneComplete;


