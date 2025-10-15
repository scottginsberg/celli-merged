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

const VOXEL_SIZE = 0.05;

const LETTER_PATTERNS = {
  C: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [0, 1, 1, 1, 0]
  ],
  E: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1]
  ],
  L: [
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1]
  ],
  I: [
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1]
  ],
  H: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1]
  ],
  T: [
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0]
  ]
};

const COLOR_THEMES = {
  white: {
    base: new THREE.Color(0x2f3547),
    glow: new THREE.Color(0xffffff),
    edgeBase: new THREE.Color(0x4a5d7c),
    edgeGlow: new THREE.Color(0xffffff)
  },
  yellow: {
    base: new THREE.Color(0x3b2a00),
    glow: new THREE.Color(0xffb62e),
    edgeBase: new THREE.Color(0x5c3c00),
    edgeGlow: new THREE.Color(0xffe2a1)
  },
  magenta: {
    base: new THREE.Color(0x3b0015),
    glow: new THREE.Color(0xff1e6e),
    edgeBase: new THREE.Color(0x590026),
    edgeGlow: new THREE.Color(0xff8ab5)
  },
  cyan: {
    base: new THREE.Color(0x002338),
    glow: new THREE.Color(0x00a8ff),
    edgeBase: new THREE.Color(0x00354f),
    edgeGlow: new THREE.Color(0x7fd8ff)
  },
  green: {
    base: new THREE.Color(0x003206),
    glow: new THREE.Color(0x19ff7a),
    edgeBase: new THREE.Color(0x005515),
    edgeGlow: new THREE.Color(0x7dffb5)
  }
};

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
      bloomPass: null, // Bloom post-processing
      afterimagePass: null, // Afterimage post-processing
      blackHole: null,
      spheres: [],
      voxels: [],
      letterVoxels: { C: [], E: [], L1: [], L2: [], I: [] },
      filmPass: null,
      triMesh: null, // Color triangle between spheres
      circleGeoTarget: null, // Target circle geometry for morphing
      morphedToCircles: false, // Track if shapes morphed
      textParticles: [], // Click particle system
      starParticles: [], // Burst particles
      derezParticles: [], // Derez particles
      tVoxels: [],

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
      glitchStarted: false,
      mediumGlitchStarted: false,
      intenseGlitchStarted: false,
      screenGlitchStarted: false,
      quoteDespairShown: false,
      blackoutStarted: false,
      chimePlayed: false,
      skipShown: false,
      skipBowAnimated: false,
      musicStarted: false,
      inputAttempted: false,
      inputText: '=STAR',
      tEntered: false,
      burstAnimStarted: false,
      celliBackspaceSequenceStarted: false,
      celliBackspaceSequenceTime: 0,
      celliMoveToCornerStarted: false,
      celliMoveToCornerTime: 0,
      visiCalcShown: false,
      celliGlitchStarted: false,
      promptBaseText: '=',
      hiddenInput: null,
      yellowTransformationInProgress: false,
      
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
      tRevealActive: false,
      tRevealStartTime: 0,
      hellTransformActive: false,
      hellTransformStart: 0,
      hellTransformDuration: 2.2,
      hellProgress: 0,

      // Audio context
      audioCtx: null,
      synthGain: null,
      synthOsc1: null,
      synthOsc2: null,
      synthOsc3: null,

      // Color theme
      currentTheme: 'white'
    };

    this.colorThemes = COLOR_THEMES;
    this.voxelSize = VOXEL_SIZE;
  }

  _focusHiddenInput() {
    const hiddenInput = this.state.hiddenInput;
    if (!hiddenInput) {
      return;
    }

    hiddenInput.value = '';

    try {
      hiddenInput.focus({ preventScroll: true });
    } catch (err) {
      hiddenInput.focus();
    }
  }

  _handleHiddenInputValue(value) {
    if (!value) {
      return;
    }

    for (const char of value) {
      const key = char.toUpperCase();

      if (key === 'T') {
        this._handleTInput();
        continue;
      }

      if (this._handleEndSequenceKey(key)) {
        continue;
      }

      if (/^[A-Z0-9]$/.test(key)) {
        this.state.inputText += key;
        this._setPromptText(this.state.inputText);
      }
    }

    if (this.state.hiddenInput) {
      this.state.hiddenInput.value = '';
    }
  }

  _handlePromptBackspace() {
    if (this.state.inputText.length <= this.state.promptBaseText.length) {
      return false;
    }

    this.state.inputText = this.state.inputText.slice(0, -1);
    this.state.tEntered = false;

    if (this.state.endSequence.length) {
      this.state.endSequence = this.state.endSequence.slice(0, -1);
    }

    if (this.state.inputText.length <= this.state.promptBaseText.length) {
      this.state.endSequence = '';
    }

    this._setPromptText(this.state.inputText);

    if (this.state.hiddenInput) {
      this.state.hiddenInput.value = '';
    }

    if (!this.state.burstAnimStarted) {
      return true;
    }

    if (this.state.restoredLetters < this.state.lettersToRestore.length) {
      this._restoreOneLetter();
    }

    return true;
  }

  _handleTInput() {
    if (!this.state.celliGlitchStarted) {
      this._triggerCelliGlitchRain();
    }

    if (this.state.tEntered) {
      return;
    }

    this.state.tEntered = true;

    if (this.state.inputText.length <= this.state.promptBaseText.length) {
      this.state.inputText = `${this.state.promptBaseText}T`;
    } else {
      this.state.inputText += 'T';
    }

    this._setPromptText(this.state.inputText);

    console.log('✨ T entered - triggering burst animation');

    if (!this.state.burstAnimStarted) {
      this.state.burstAnimStarted = true;
      this._startBurstAnimation();
    }
  }

  _handleEndSequenceKey(key) {
    if (this.state.inputText !== this.state.promptBaseText || !this.state.allYellowTransformed) {
      return false;
    }

    if (key === 'E' && this.state.endSequence === '') {
      this.state.endSequence = 'E';
      this.state.inputText = '=E';
      this._setPromptText(this.state.inputText);
      this._transformToMagenta();
      console.log('🟥 Magenta phase triggered (E)');
      return true;
    }

    if (key === 'N' && this.state.endSequence === 'E') {
      this.state.endSequence = 'EN';
      this.state.inputText = '=EN';
      this._setPromptText(this.state.inputText);
      this._transformToCyan();
      console.log('🟦 Cyan phase triggered (N)');
      return true;
    }

    if (key === 'D' && this.state.endSequence === 'EN') {
      this.state.endSequence = 'END';
      this.state.inputText = '=END';
      this._setPromptText(this.state.inputText);
      this._transformToGreenAndHell();
      console.log('🟩 Green phase triggered (D) - HELL transform starting');
      console.log('🎬 END sequence complete - starting transition');
      this._startEndSequence();
      return true;
    }

    return false;
  }

  _triggerCelliGlitchRain() {
    if (this.state.celliGlitchStarted) {
      return;
    }

    this.state.celliGlitchStarted = true;
    this.state.restoredLetters = 0;
    this.state.allYellowTransformed = false;
    this.state.yellowTransformCompleteCount = 0;
    this.state.endSequence = '';

    this._playFritzSound();

    this.state.voxels.forEach(voxel => {
      const data = voxel.userData;
      if (!data) {
        return;
      }

      if (this._isVoxelPartOfT(data)) {
        voxel.visible = true;
        data.settled = true;
        voxel.material.opacity = 0.85;
        if (data.edges && data.edges.material) {
          data.edges.material.opacity = 0.45;
        }
        return;
      }

      this.state.glitchedVoxelsStack.push(voxel);

      data.glitched = true;
      data.settled = false;
      data.rainActive = true;
      data.rainStart = this.state.totalTime + Math.random() * 0.25;
      data.rainVelocity = 0.02 + Math.random() * 0.02;
      data.rainDrift = (Math.random() - 0.5) * 0.015;
      data.rainSpin = (Math.random() - 0.5) * 0.2;
      data.rainFade = 0.035 + Math.random() * 0.03;

      voxel.visible = true;
      voxel.material.opacity = 0.8;
      voxel.material.color.setRGB(0.6, 0.6, 0.66);

      if (data.edges && data.edges.material) {
        data.edges.material.opacity = 0.4;
        data.edges.material.color.setRGB(0.62, 0.62, 0.7);
      }
    });
  }

  _isVoxelPartOfT(data) {
    if (!data) return false;
    if (data.gridX !== 4) return false;
    if (data.gridY === 0) return true;
    return data.gridCol === 2 && data.gridY >= 1 && data.gridY <= 4;
  }

  _glitchVoxelsToFlat(coverage = 1) {
    const clamped = THREE.MathUtils.clamp(coverage, 0, 1);
    const candidates = this.state.voxels.filter(voxel => {
      const data = voxel.userData;
      if (!data) return false;
      if (!data.backspaceTransformed) return false;
      return data.geometryType === 'rounded';
    });

    if (!candidates.length || clamped <= 0) {
      return;
    }

    const total = Math.ceil(candidates.length * clamped);
    const shuffled = [...candidates];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const startTime = this.state.totalTime;

    shuffled.slice(0, total).forEach((voxel, idx) => {
      const data = voxel.userData;
      if (!data) return;

      data.flattenState = 'toFlat';
      data.flattenStartTime = startTime + idx * 0.05;
      data.flattenDuration = 0.4 + Math.random() * 0.25;
    });
  }

  _updateVoxelFlatten(voxel, data, dt) {
    if (!data.flattenState) {
      return;
    }

    const now = this.state.totalTime;

    if (data.flattenState === 'toFlat') {
      const elapsed = now - data.flattenStartTime;
      if (elapsed < 0) {
        return;
      }

      const duration = Math.max(data.flattenDuration, 0.01);
      const progress = THREE.MathUtils.clamp(elapsed / duration, 0, 1);
      const eased = progress * progress * (3 - 2 * progress);

      const targetScaleZ = data.baseScale * 0.2;
      voxel.scale.z = THREE.MathUtils.lerp(data.baseScale, targetScaleZ, eased);

      const shimmer = 0.4 + Math.sin((now + data.backspacePulseOffset) * 8) * 0.2;
      voxel.material.opacity = THREE.MathUtils.lerp(voxel.material.opacity, 0.55 + shimmer * 0.15, 0.08);
      if (data.edges && data.edges.material) {
        data.edges.material.opacity = THREE.MathUtils.lerp(data.edges.material.opacity, 0.25 + shimmer * 0.1, 0.1);
      }

      if (progress >= 1) {
        this._applyFlatGeometry(voxel);
        data.flattenState = 'flat';
      }

      return;
    }

    if (data.flattenState === 'flat') {
      data.shimmerPhase = (data.shimmerPhase || 0) + (dt || 0.016) * 6;
      const shimmer = 0.5 + Math.sin(data.shimmerPhase) * 0.15;
      voxel.material.opacity = THREE.MathUtils.lerp(voxel.material.opacity, 0.6 + shimmer * 0.12, 0.08);
      if (data.edges && data.edges.material) {
        data.edges.material.opacity = THREE.MathUtils.lerp(data.edges.material.opacity, 0.2 + shimmer * 0.08, 0.1);
      }
    }
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
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true // Enable screen recording
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
    
    // Create orthographic camera with proper aspect ratio
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 2;
    const camera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.01,
      10
    );
    camera.position.set(0, 0, 2);
    camera.lookAt(0, 0, 0);

    // Black hole shader
    const blackHole = this._createBlackHole(scene);
    
    // Create orbiting shapes
    const { spheres, triMesh } = this._createShapes(scene);
    
    // Create CELLI voxels
    const { voxels, letterVoxels, tVoxels } = this._createVoxels(scene);
    
    // Post-processing
    const { composer, bloomPass, afterimagePass, filmPass } = this._createPostProcessing(renderer, scene, camera);
    
    // Store circle geometry for morphing
    const circleGeoTarget = new THREE.CircleGeometry(0.16, 64);
    
    // Initialize audio
    this._initAudio();

    // Store references
    this.state.scene = scene;
    this.state.camera = camera;
    this.state.renderer = renderer;
    this.state.composer = composer;
    this.state.bloomPass = bloomPass;
    this.state.afterimagePass = afterimagePass;
    this.state.blackHole = blackHole;
    this.state.spheres = spheres;
    this.state.voxels = voxels;
    this.state.letterVoxels = letterVoxels;
    this.state.tVoxels = tVoxels;
    this.state.filmPass = filmPass;
    this.state.triMesh = triMesh;
    this.state.circleGeoTarget = circleGeoTarget;

    this._setColorPhase('white');

    // Setup event listeners
    this._setupEventListeners();

    // Setup resize handler
    window.addEventListener('resize', () => this._handleResize());
    
    // Call resize immediately to set correct aspect ratio on init
    this._handleResize();

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
        colors: { value: colors }
      },
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`,
      fragmentShader: `
        varying vec2 vUv;
        uniform vec2 points[3];
        uniform vec3 colors[3];

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
    const voxelSize = this.voxelSize;
    const voxelGeo = new THREE.BoxGeometry(voxelSize * 0.95, voxelSize * 0.95, voxelSize * 0.15);
    const edgesGeo = new THREE.EdgesGeometry(voxelGeo);

    const voxels = [];
    const letterVoxels = { C: [], E: [], L1: [], L2: [], I: [] };
    const letters = ['C', 'E', 'L', 'L', 'I'];
    const letterSpacing = 0.4;
    const celliScale = 1.0;
    const startX = -(letters.length * letterSpacing * celliScale) / 2 + (letterSpacing * celliScale) / 2;

    letters.forEach((letter, letterIdx) => {
      const pattern = LETTER_PATTERNS[letter];
      const letterX = startX + letterIdx * letterSpacing * celliScale;
      
      pattern.forEach((row, rowIdx) => {
        row.forEach((cell, colIdx) => {
          if (cell === 1) {
            // Create individual materials for each voxel
            const voxelMat = new THREE.MeshBasicMaterial({
              color: 0x2f3547,
              transparent: true,
              opacity: 0,
              blending: THREE.NormalBlending,
              side: THREE.FrontSide
            });
            const edgeMat = new THREE.LineBasicMaterial({
              color: 0x4a5d7c,
              transparent: true,
              opacity: 0,
              linewidth: 1
            });

            const voxel = new THREE.Mesh(voxelGeo, voxelMat);
            const edges = new THREE.LineSegments(edgesGeo, edgeMat);
            voxel.add(edges);

            const x = letterX + (colIdx - 2) * voxelSize * 1.2 * celliScale;
            const y = (2 - rowIdx) * voxelSize * 1.2 * celliScale + 0.35;

            voxel.userData = {
              targetX: x,
              targetY: y,
              originalTargetX: x,
              originalTargetY: y,
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
              backspacePulseOffset: Math.random() * Math.PI * 2,
              baseColor: COLOR_THEMES.white.base.clone(),
              glowColor: COLOR_THEMES.white.glow.clone(),
              edgesBaseColor: COLOR_THEMES.white.edgeBase.clone(),
              edgesGlowColor: COLOR_THEMES.white.edgeGlow.clone(),
              burstActive: false,
              burstVelocity: new THREE.Vector2(
                (Math.random() - 0.5) * 0.02,
                -0.03 - Math.random() * 0.02
              ),
              burstRotation: (Math.random() - 0.5) * 0.1,
              patternIndex: 0,
              rainActive: false,
              rainStart: 0,
              rainVelocity: 0,
              rainDrift: 0,
              rainSpin: 0,
              rainFade: 0.04,
              restorePending: false,
              restoreStartTime: 0,
              restoreDelay: 0,
              yellowPopActive: false,
              yellowPopStart: 0,
              neonPulseActive: false,
              neonPulseStart: 0,
              flattenState: null,
              flattenStartTime: 0,
              flattenDuration: 0,
              shimmerPhase: Math.random() * Math.PI * 2,
              geometryType: 'flat'
            };

            voxel.scale.set(celliScale, celliScale, celliScale);
            voxel.position.set(x, voxel.userData.startY, 0);
            voxel.visible = false;
            scene.add(voxel);
            voxels.push(voxel);

            // Track by letter
            const letterKey = letterIdx === 0 ? 'C' : letterIdx === 1 ? 'E' : letterIdx === 2 ? 'L1' : letterIdx === 3 ? 'L2' : 'I';
            voxel.userData.patternIndex = letterVoxels[letterKey].length;
            letterVoxels[letterKey].push(voxel);
          }
        });
      });
    });

    const tVoxels = this._createTVoxels(scene, voxelGeo, edgesGeo);

    return { voxels, letterVoxels, tVoxels };
  }

  _createTVoxels(scene, voxelGeo, edgesGeo) {
    const tPattern = LETTER_PATTERNS.T;
    const tVoxels = [];
    const scale = 1.0;
    const startX = 0;
    const voxelSize = this.voxelSize;

    tPattern.forEach((row, rowIdx) => {
      row.forEach((cell, colIdx) => {
        if (cell !== 1) {
          return;
        }

        const mat = new THREE.MeshBasicMaterial({
          color: COLOR_THEMES.white.base.clone(),
          transparent: true,
          opacity: 0,
          blending: THREE.NormalBlending,
          side: THREE.FrontSide
        });
        const edgeMat = new THREE.LineBasicMaterial({
          color: COLOR_THEMES.white.edgeBase.clone(),
          transparent: true,
          opacity: 0,
          linewidth: 1
        });

        const voxel = new THREE.Mesh(voxelGeo.clone(), mat);
        const edges = new THREE.LineSegments(edgesGeo.clone(), edgeMat);
        voxel.add(edges);

        const x = startX + (colIdx - 2) * voxelSize * 1.2 * scale;
        const y = (2 - rowIdx) * voxelSize * 1.2 * scale + 0.35;

        voxel.userData = {
          targetX: x,
          targetY: y,
          startY: y + 2.2 + Math.random() * 0.6,
          dropDelay: rowIdx * 0.05 + colIdx * 0.04,
          dropSpeed: 0.03 + Math.random() * 0.015,
          settled: false,
          jigglePhase: Math.random() * Math.PI * 2,
          flickerPhase: Math.random() * Math.PI * 2,
          edges,
          baseScale: scale,
          baseColor: COLOR_THEMES.white.base.clone(),
          glowColor: COLOR_THEMES.white.glow.clone(),
          edgesBaseColor: COLOR_THEMES.white.edgeBase.clone(),
          edgesGlowColor: COLOR_THEMES.white.edgeGlow.clone(),
          glitched: false,
          backspaceTransformed: false,
          rainActive: false,
          rainStart: 0,
          rainVelocity: 0,
          rainDrift: 0,
          rainSpin: 0,
          rainFade: 0.04,
          flattenState: null,
          flattenStartTime: 0,
          flattenDuration: 0,
          shimmerPhase: Math.random() * Math.PI * 2,
          geometryType: 'flat'
        };

        voxel.scale.set(scale, scale, scale);
        voxel.position.set(x, voxel.userData.startY, 0);
        voxel.visible = false;
        scene.add(voxel);
        tVoxels.push(voxel);
      });
    });

    this.state.tVoxels = tVoxels;
    return tVoxels;
  }

  _createFlatVoxelGeometry() {
    const size = this.voxelSize * 0.95;
    return new THREE.BoxGeometry(size, size, this.voxelSize * 0.15);
  }

  _createRoundedVoxelGeometry() {
    const size = this.voxelSize * 0.95;
    return new RoundedBoxGeometry(size, size, this.voxelSize * 0.18, 5, this.voxelSize * 0.22);
  }

  _applyRoundedGeometry(voxel) {
    if (!voxel || !voxel.userData) return;

    const data = voxel.userData;
    const previousEdges = data.edges;

    if (voxel.geometry) {
      voxel.geometry.dispose();
    }

    const roundedGeo = this._createRoundedVoxelGeometry();
    voxel.geometry = roundedGeo;

    if (previousEdges) {
      voxel.remove(previousEdges);
      if (previousEdges.geometry) previousEdges.geometry.dispose();
      if (previousEdges.material) previousEdges.material.dispose();
    }

    const edgeMaterial = new THREE.LineBasicMaterial({
      color: data.edgesGlowColor ? data.edgesGlowColor.clone() : new THREE.Color(0xffe2a1),
      transparent: true,
      opacity: previousEdges && previousEdges.material ? previousEdges.material.opacity : 0.5,
      linewidth: 1
    });

    const roundedEdges = new THREE.LineSegments(new THREE.EdgesGeometry(roundedGeo), edgeMaterial);
    voxel.add(roundedEdges);

    data.edges = roundedEdges;
    data.geometryType = 'rounded';
    data.roundedApplied = true;
  }

  _applyFlatGeometry(voxel) {
    if (!voxel || !voxel.userData) return;

    const data = voxel.userData;
    const previousEdges = data.edges;

    if (voxel.geometry) {
      voxel.geometry.dispose();
    }

    const flatGeo = this._createFlatVoxelGeometry();
    voxel.geometry = flatGeo;

    if (previousEdges) {
      voxel.remove(previousEdges);
      if (previousEdges.geometry) previousEdges.geometry.dispose();
      if (previousEdges.material) previousEdges.material.dispose();
    }

    const edgeMaterial = new THREE.LineBasicMaterial({
      color: data.edgesBaseColor ? data.edgesBaseColor.clone() : new THREE.Color(0x4a5d7c),
      transparent: true,
      opacity: 0.3,
      linewidth: 1
    });

    const flatEdges = new THREE.LineSegments(new THREE.EdgesGeometry(flatGeo), edgeMaterial);
    voxel.add(flatEdges);

    data.edges = flatEdges;
    data.geometryType = 'flat';
    data.roundedApplied = false;
  }

  _applyPaletteToVoxel(voxel, palette) {
    if (!voxel || !voxel.userData) return;
    const data = voxel.userData;

    if (!data.baseColor) data.baseColor = new THREE.Color();
    if (!data.glowColor) data.glowColor = new THREE.Color();
    if (!data.edgesBaseColor) data.edgesBaseColor = new THREE.Color();
    if (!data.edgesGlowColor) data.edgesGlowColor = new THREE.Color();

    data.baseColor.copy(palette.base);
    data.glowColor.copy(palette.glow);
    data.edgesBaseColor.copy(palette.edgeBase);
    data.edgesGlowColor.copy(palette.edgeGlow);
  }

  _setColorPhase(theme) {
    const palette = this.colorThemes[theme];
    if (!palette) {
      return;
    }

    this.state.currentTheme = theme;

    this.state.voxels.forEach(voxel => this._applyPaletteToVoxel(voxel, palette));
    this.state.tVoxels.forEach(voxel => this._applyPaletteToVoxel(voxel, palette));
  }

  _pulseVoxels(intensity = 0.1) {
    this.state.voxels.forEach(voxel => {
      if (!voxel.userData) return;
      voxel.userData.flickerPhase += Math.random() * intensity;
    });
  }

  _computePatternPositions(pattern, letterIndex, totalLetters, spacing, offsetY = 0) {
    const positions = [];
    const startX = -(totalLetters * spacing) / 2 + spacing / 2;
    const letterX = startX + letterIndex * spacing;

    pattern.forEach((row, rowIdx) => {
      row.forEach((cell, colIdx) => {
        if (cell !== 1) {
          return;
        }

        const x = letterX + (colIdx - 2) * this.voxelSize * 1.2;
        const y = (2 - rowIdx) * this.voxelSize * 1.2 + 0.35 + offsetY;
        positions.push({ x, y });
      });
    });

    return positions;
  }

  _assignHellTargets(voxels, positions) {
    voxels.forEach((voxel, idx) => {
      const target = positions[idx] || positions[positions.length - 1] || {
        x: voxel.userData.targetX,
        y: voxel.userData.targetY
      };

      voxel.visible = true;
      voxel.userData.hellStart = {
        x: voxel.position.x,
        y: voxel.position.y
      };
      voxel.userData.hellTarget = target;
      voxel.userData.hellStartScale = voxel.scale.x;
      voxel.userData.hellTargetScale = voxel.userData.baseScale;
      voxel.userData.targetX = target.x;
      voxel.userData.targetY = target.y;
    });
  }

  _startHellTransform() {
    if (this.state.hellTransformActive) {
      return;
    }

    const hellSpacing = 0.36;
    const totalLetters = 4;

    const hPositions = this._computePatternPositions(LETTER_PATTERNS.H, 0, totalLetters, hellSpacing);
    const ePositions = this._computePatternPositions(LETTER_PATTERNS.E, 1, totalLetters, hellSpacing);
    const l1Positions = this._computePatternPositions(LETTER_PATTERNS.L, 2, totalLetters, hellSpacing);
    const l2Positions = this._computePatternPositions(LETTER_PATTERNS.L, 3, totalLetters, hellSpacing);

    if (this.state.letterVoxels.C) {
      this._assignHellTargets(this.state.letterVoxels.C, hPositions);
    }
    if (this.state.letterVoxels.E) {
      this._assignHellTargets(this.state.letterVoxels.E, ePositions);
    }
    if (this.state.letterVoxels.L1) {
      this._assignHellTargets(this.state.letterVoxels.L1, l1Positions);
    }
    if (this.state.letterVoxels.L2) {
      this._assignHellTargets(this.state.letterVoxels.L2, l2Positions);
    }

    if (this.state.letterVoxels.I) {
      this.state.letterVoxels.I.forEach(voxel => {
        voxel.userData.hellDrop = true;
        voxel.userData.dropVelocity = -0.025 - Math.random() * 0.02;
      });
    }

    this.state.tRevealActive = false;
    this.state.tVoxels.forEach(voxel => {
      voxel.visible = false;
    });

    this.state.hellTransformStart = performance.now();
    this.state.hellTransformActive = true;
    this.state.hellProgress = 0;
  }

  _transformToMagenta() {
    this._setColorPhase('magenta');
    this._pulseVoxels(0.2);
    this._glitchVoxelsToFlat(0.35);
  }

  _transformToCyan() {
    this._setColorPhase('cyan');
    this._pulseVoxels(0.25);
    this._glitchVoxelsToFlat(0.65);
  }

  _transformToGreenAndHell() {
    this._setColorPhase('green');
    this._glitchVoxelsToFlat(1);
    this._startHellTransform();
  }

  /**
   * Create post-processing pipeline
   */
  _createPostProcessing(renderer, scene, camera) {
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.4, // Start at 0.4 for roll phase
      0.9, 
      0.2
    );
    composer.addPass(bloomPass);

    const afterimagePass = new AfterimagePass(0.75); // Start at 0.75 for roll
    composer.addPass(afterimagePass);

    const filmPass = new ShaderPass({
      uniforms: { 
        tDiffuse: { value: null }, 
        time: { value: 0 }, 
        noise: { value: 0.005 }, // Start minimal
        scanAmp: { value: 0.003 } // Start minimal
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

    return { composer, bloomPass, afterimagePass, filmPass };
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
    this._clickHandler = (e) => {
      if (!this.state.running) return;
      
      // Convert screen to world coordinates
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      
      // Create text particles at click position
      this._createTextParticlesAtPosition(x, y);
    };
    document.addEventListener('click', this._clickHandler);

    // Keyboard handler for doorway input
    this._keydownHandler = (e) => {
      if (!this.state.running) return;

      if (this.state.doorwayOpened) {
        this._handleDoorwayInput(e);
      }
    };
    document.addEventListener('keydown', this._keydownHandler);

    const promptContainer = document.querySelector('.prompt-container');
    if (promptContainer) {
      this._promptClickHandler = () => {
        if (!this.state.running || !this.state.doorwayOpened) {
          return;
        }

        this.state.inputAttempted = true;

        if (!this.state.celliGlitchStarted) {
          this._triggerCelliGlitchRain();
        }

        this._focusHiddenInput();
      };

      promptContainer.addEventListener('click', this._promptClickHandler);
    }

    const hiddenInput = document.getElementById('hiddenInput');
    if (hiddenInput) {
      this.state.hiddenInput = hiddenInput;

      this._hiddenBeforeInputHandler = (evt) => {
        if (!this.state.running || !this.state.doorwayOpened) {
          return;
        }

        if (evt.inputType === 'deleteContentBackward') {
          evt.preventDefault();
          this._handlePromptBackspace();
        }
      };

      this._hiddenInputHandler = (evt) => {
        if (!this.state.running || !this.state.doorwayOpened) {
          return;
        }

        this._handleHiddenInputValue((evt.target.value || '').toUpperCase());
      };

      hiddenInput.addEventListener('beforeinput', this._hiddenBeforeInputHandler);
      hiddenInput.addEventListener('input', this._hiddenInputHandler);
    }

    // Skip button handler
    const skipBtn = document.getElementById('skipBtn');
    if (skipBtn) {
      this._skipClickHandler = () => {
        console.log('⏩ Skip button clicked');
        // Skip to doorway phase
        this.state.totalTime = this.state.introCfg.celliEnd;
      };
      skipBtn.addEventListener('click', this._skipClickHandler);
    }
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
    console.log('⌨️ Doorway input:', e.key);

    if (e.key === 'Backspace') {
      e.preventDefault();
      this._handlePromptBackspace();
      return;
    }

    const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;

    if (key === 'T') {
      e.preventDefault();
      this._handleTInput();
      return;
    }

    if (this._handleEndSequenceKey(key)) {
      e.preventDefault();
      return;
    }

    if (key.length === 1 && /[A-Z0-9]/.test(key)) {
      e.preventDefault();
      this.state.inputText += key;
      this._setPromptText(this.state.inputText);
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
          const data = voxel.userData;
          if (!data.glitched) {
            this.state.glitchedVoxelsStack.push(voxel);
          }

          data.glitched = true;
          data.settled = false;
          data.burstActive = true;
          data.burstVelocity = new THREE.Vector2(
            (Math.random() - 0.5) * 0.025,
            -0.05 - Math.random() * 0.025
          );
          data.burstRotation = (Math.random() - 0.5) * 0.12;
          voxel.visible = true;
          voxel.material.opacity = 0.85;
          if (data.edges && data.edges.material) {
            data.edges.material.opacity = 0.7;
          }

          this._createStarParticle(voxel.position.x, voxel.position.y);
        }
      }, idx * 12);
    });

    // Reset T voxels and schedule reveal
    const revealDelay = 900;
    this.state.tRevealActive = false;
    this.state.tVoxels.forEach(voxel => {
      const data = voxel.userData;
      voxel.visible = false;
      voxel.material.opacity = 0;
      if (data.edges && data.edges.material) {
        data.edges.material.opacity = 0;
      }
      data.settled = false;
      voxel.position.set(data.targetX, data.startY, 0);
    });

    window.setTimeout(() => {
      this.state.tRevealStartTime = performance.now();
      this.state.tRevealActive = true;
    }, revealDelay);
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

  _setPromptText(value) {
    const promptText = document.getElementById('promptText');
    const promptCursor = document.getElementById('promptCursor');
    const promptEl = document.getElementById('prompt');

    if (promptText) {
      promptText.textContent = value;
    }
    if (promptCursor) {
      promptCursor.textContent = '_';
    }
    if (promptEl) {
      promptEl.setAttribute('data-text', `${value}_`);
    }
  }

  /**
   * Start END sequence
   */
  _startEndSequence() {
    console.log('🎬 Starting END sequence');
    this.state.celliMoveToCornerStarted = true;
    this.state.celliMoveToCornerTime = 0;
    
    // Trigger transition to VisiCalc after animation
    setTimeout(() => {
      console.log('📊 Transitioning to VisiCalc scene...');
      // Dispatch custom event for scene transition
      window.dispatchEvent(new CustomEvent('celli:sceneTransition', {
        detail: { scene: 'visicell' }
      }));
    }, 2500); // After END animation completes
  }

  /**
   * Start scene
   */
  async start(state, options = {}) {
    console.log('▶️ Starting Complete Intro Scene');
    
    // Hide play overlay
    const playEl = document.getElementById('play');
    if (playEl) playEl.classList.add('hidden');
    
    // Ensure quote starts hidden (will appear during collapse phase)
    const quoteEl = document.getElementById('quote');
    if (quoteEl) {
      quoteEl.classList.add('visible'); // Add visible class for CSS
      quoteEl.style.visibility = 'hidden'; // But hide initially
      quoteEl.style.opacity = '0';
      quoteEl.classList.remove('glitch', 'glitchMedium', 'glitchIntense', 'scrambling', 'quote--loom');
      
      // Reset to initial text
      const quoteBefore = document.getElementById('quoteBefore');
      if (quoteBefore) {
        quoteBefore.textContent = '...if you gaze for long into an abyss, the abyss gazes also into you.';
      }
    }
    
    // Hide loomworks initially
    const loomEl = document.getElementById('loomworks');
    if (loomEl) {
      loomEl.style.display = 'block';
      loomEl.classList.remove('visible');
      loomEl.style.opacity = '1';
    }
    
    // Ensure doorway starts hidden
    const doorwayEl = document.getElementById('doorway');
    if (doorwayEl) {
      doorwayEl.classList.remove('visible', 'open');
    }
    
    // Show skip button from start (will animate to bow later)
    const skipBtn = document.getElementById('skipBtn');
    if (skipBtn) {
      skipBtn.classList.remove('hidden');
      skipBtn.classList.remove('bow-shape', 'rounded-bow', 'illuminating');
    }
    
    console.log('✅ UI elements initialized for intro sequence');
    
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

    // Determine current phase
    const phase = this._getCurrentPhase(t, cfg);

    // Update post-processing effects based on phase
    this._updateEffectsForPhase(t, phase, cfg);

    // Update black hole
    if (this.state.blackHole) {
      this.state.blackHole.material.uniforms.time.value = t;
    }

    // Update spheres based on phase
    this._updateSpheresPhase(t, cfg, phase);

    // Update color triangle points (always update, visibility controlled separately)
    if (this.state.triMesh) {
      this.state.triMesh.material.uniforms.points.value[0].set(
        this.state.spheres[0].position.x,
        this.state.spheres[0].position.y
      );
      this.state.triMesh.material.uniforms.points.value[1].set(
        this.state.spheres[1].position.x,
        this.state.spheres[1].position.y
      );
      this.state.triMesh.material.uniforms.points.value[2].set(
        this.state.spheres[2].position.x,
        this.state.spheres[2].position.y
      );
    }

    // Update CELLI voxels (starts at loomworksEnd)
    if (t >= cfg.loomworksEnd) {
      const celliTime = t - cfg.loomworksEnd;
      this._updateVoxels(celliTime, deltaTime);
    }

    // Update doorway (wait for voxels to settle)
    const celliAge = t - cfg.loomworksEnd;
    const allVoxelsSettled = celliAge > 5.0;
    
    if (phase === 'doorway' && !this.state.doorwayShown && allVoxelsSettled) {
      const doorwayProgress = (t - cfg.celliEnd) / (cfg.doorwayEnd - cfg.celliEnd);
      if (doorwayProgress > 0.05) {
        this._showDoorway();
      }
    }
    
    if (this.state.doorwayShown && !this.state.doorwayOpened) {
      const doorwayProgress = (t - cfg.celliEnd) / (cfg.doorwayEnd - cfg.celliEnd);
      if (doorwayProgress > 0.15) {
        this._openDoorway();
      }
    }

    // Update text particles
    this._updateTextParticles(deltaTime);

    // Update star particles
    this._updateStarParticles(deltaTime);

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
   * Determine current animation phase
   */
  _getCurrentPhase(t, cfg) {
    if (t < cfg.rollEnd) return 'roll';
    if (t < cfg.bounceEnd) return 'bounce';
    if (t < cfg.triangleEnd) return 'triangle';
    if (t < cfg.transitionEnd) return 'transition';
    if (t < cfg.normalEnd) return 'normal';
    if (t < cfg.vennEnd) return 'venn';
    if (t < cfg.collapseEnd) return 'collapse';
    if (t < cfg.glitchEnd) return 'glitch';
    if (t < cfg.blackoutEnd) return 'blackout';
    if (t < cfg.loomworksEnd) return 'loomworks';
    if (t < cfg.celliEnd) return 'celli';
    return 'doorway';
  }

  /**
   * Update post-processing effects based on phase
   */
  _updateEffectsForPhase(t, phase, cfg) {
    const bloom = this.state.bloomPass;
    const afterimage = this.state.afterimagePass;
    const film = this.state.filmPass;
    const tri = this.state.triMesh;

    if (phase === 'roll') {
      bloom.strength = 0.4;
      afterimage.uniforms.damp.value = 0.75;
      film.uniforms.noise.value = 0.005;
      film.uniforms.scanAmp.value = 0.003;
      if (tri) tri.visible = false;
      
    } else if (phase === 'bounce') {
      bloom.strength = 0.25; // Reduced glow
      afterimage.uniforms.damp.value = 0.75;
      film.uniforms.noise.value = 0.005;
      film.uniforms.scanAmp.value = 0.003;
      if (tri) tri.visible = false;
      
    } else if (phase === 'triangle') {
      const triangleProgress = (t - cfg.bounceEnd) / (cfg.triangleEnd - cfg.bounceEnd);
      bloom.strength = THREE.MathUtils.lerp(0.25, 0.7, triangleProgress);
      afterimage.uniforms.damp.value = THREE.MathUtils.lerp(0.75, 0.92, triangleProgress);
      film.uniforms.noise.value = THREE.MathUtils.lerp(0.005, 0.015, triangleProgress);
      film.uniforms.scanAmp.value = THREE.MathUtils.lerp(0.003, 0.015, triangleProgress);
      if (tri) tri.visible = false; // Hidden during triangle phase
      
    } else if (phase === 'transition') {
      const transProgress = (t - cfg.triangleEnd) / (cfg.transitionEnd - cfg.triangleEnd);
      bloom.strength = 0.7;
      afterimage.uniforms.damp.value = THREE.MathUtils.lerp(0.92, 0.96, transProgress);
      film.uniforms.noise.value = THREE.MathUtils.lerp(0.015, 0.03, transProgress);
      film.uniforms.scanAmp.value = THREE.MathUtils.lerp(0.015, 0.03, transProgress);
      if (tri) {
        tri.visible = false;
        tri.material.opacity = 0;
      }
      
    } else if (phase === 'normal') {
      const normalT = t - cfg.transitionEnd;
      const convergeDuration = 2.2;
      const pulseDuration = 3.0;
      const totalAnimDuration = convergeDuration + pulseDuration;
      
      if (normalT < convergeDuration) {
        // Converge phase
        const convergeProgress = THREE.MathUtils.clamp(normalT / convergeDuration, 0, 1);
        const convergeEased = convergeProgress * convergeProgress * (3 - 2 * convergeProgress);
        bloom.strength = THREE.MathUtils.lerp(0.7, 0.9, convergeEased);
        if (tri) tri.visible = false;
        
      } else if (normalT < totalAnimDuration) {
        // Pulse phase - triangle appears during expansion
        const pulseT = normalT - convergeDuration;
        const pulseProgress = pulseT / pulseDuration;
        const pulseCycle = Math.sin(pulseProgress * Math.PI);
        
        bloom.strength = THREE.MathUtils.lerp(0.9, 0.72, pulseCycle);
        if (tri) {
          tri.visible = pulseCycle > 0.3; // Show during expansion
          tri.material.opacity = THREE.MathUtils.clamp(pulseCycle * 1.5, 0, 0.7);
        }
        
      } else {
        // Hold phase
        const holdT = normalT - totalAnimDuration;
        const holdDuration = (cfg.normalEnd - cfg.transitionEnd) - totalAnimDuration;
        const holdProgress = holdT / holdDuration;
        bloom.strength = THREE.MathUtils.lerp(0.9, 0.85, holdProgress);
        if (tri) tri.visible = false;
      }
      
      afterimage.uniforms.damp.value = 0.96;
      film.uniforms.noise.value = 0.03;
      film.uniforms.scanAmp.value = 0.03;
      
    } else if (phase === 'venn') {
      const vennProgress = (t - cfg.normalEnd) / (cfg.vennEnd - cfg.normalEnd);
      bloom.strength = THREE.MathUtils.lerp(0.7, 0.8, vennProgress);
      afterimage.uniforms.damp.value = THREE.MathUtils.lerp(0.96, 0.7, vennProgress);
      film.uniforms.noise.value = THREE.MathUtils.lerp(0.03, 0.02, vennProgress);
      film.uniforms.scanAmp.value = THREE.MathUtils.lerp(0.03, 0.02, vennProgress);
      if (tri) {
        tri.visible = true;
        tri.material.opacity = THREE.MathUtils.lerp(0.7, 0.85, vennProgress);
      }
      
    } else if (phase === 'collapse') {
      const collapseProgress = (t - cfg.vennEnd) / (cfg.collapseEnd - cfg.vennEnd);
      bloom.strength = THREE.MathUtils.lerp(0.8, 1.2, collapseProgress);
      afterimage.uniforms.damp.value = THREE.MathUtils.lerp(0.7, 0.6, collapseProgress);
      film.uniforms.noise.value = THREE.MathUtils.lerp(0.02, 0.015, collapseProgress);
      film.uniforms.scanAmp.value = THREE.MathUtils.lerp(0.02, 0.015, collapseProgress);
      if (tri) {
        tri.visible = true;
        tri.material.opacity = THREE.MathUtils.lerp(0.85, 0.3, collapseProgress);
      }
      
      // Quote glitch progression
      this._updateQuoteGlitch(collapseProgress, 'collapse');
      
    } else if (phase === 'glitch') {
      const glitchProgress = (t - cfg.collapseEnd) / (cfg.glitchEnd - cfg.collapseEnd);
      bloom.strength = THREE.MathUtils.lerp(1.2, 0.5, glitchProgress);
      afterimage.uniforms.damp.value = 0.3;
      film.uniforms.noise.value = THREE.MathUtils.lerp(0.015, 0.5, glitchProgress);
      film.uniforms.scanAmp.value = THREE.MathUtils.lerp(0.015, 0.3, glitchProgress);
      if (tri) {
        tri.visible = true;
        tri.material.opacity = THREE.MathUtils.lerp(0.3, 0, glitchProgress);
      }
      
      // Quote glitch progression
      this._updateQuoteGlitch(glitchProgress, 'glitch');
      
    } else if (phase === 'blackout') {
      const blackoutProgress = (t - cfg.glitchEnd) / (cfg.blackoutEnd - cfg.glitchEnd);
      bloom.strength = THREE.MathUtils.lerp(0.5, 0, blackoutProgress);
      afterimage.uniforms.damp.value = 0.1;
      film.uniforms.noise.value = 0;
      film.uniforms.scanAmp.value = 0;
      if (tri) tri.visible = false;
      
      if (!this.state.blackoutStarted) {
        const quoteEl = document.getElementById('quote');
        if (quoteEl) {
          quoteEl.classList.remove('glitch', 'glitchMedium', 'glitchIntense', 'scrambling');
          quoteEl.style.visibility = 'hidden';
          quoteEl.style.opacity = '0';
          quoteEl.classList.remove('quote--loom');
        }
        const screenGlitch = document.getElementById('screenGlitch');
        if (screenGlitch) screenGlitch.classList.remove('active');
        this.state.blackoutStarted = true;
      }
      
    } else if (phase === 'loomworks') {
      bloom.strength = 0;
      afterimage.uniforms.damp.value = 0;
      film.uniforms.noise.value = 0;
      film.uniforms.scanAmp.value = 0;
      if (tri) tri.visible = false;

      if (!this.state.loomworksRevealStarted) {
        this.state.loomworksRevealStarted = true;
        window.dispatchEvent(new CustomEvent('celli:loomworks-ready'));
      }

      if (!this.state.loomworksShown) {
        this._startLoomworksReveal();
        this.state.loomworksShown = true;
      }

      if (!this.state.chimePlayed) {
        this._playStartupChime();
        this.state.chimePlayed = true;
      }
      
      // Fade out loomworks near end
      const loomProgress = (t - cfg.blackoutEnd) / (cfg.loomworksEnd - cfg.blackoutEnd);
      if (loomProgress > 0.85) {
        const loomEl = document.getElementById('loomworks');
        if (loomEl) {
          loomEl.style.opacity = THREE.MathUtils.lerp(1, 0, (loomProgress - 0.85) / 0.15);
        }
      }
      
    } else if (phase === 'celli') {
      bloom.strength = 0.35;
      afterimage.uniforms.damp.value = 0.85;
      film.uniforms.noise.value = 0.008;
      film.uniforms.scanAmp.value = 0.003;
      if (tri) tri.visible = false;
      
      if (!this.state.celliStarted) {
        const loomEl = document.getElementById('loomworks');
        if (loomEl) loomEl.style.display = 'none';
        this.state.celliStarted = true;
        this.state.celliStartTime = t;
      }
      
      // Animate skip button to bow when voxels settle
      if (celliAge > 3.0 && !this.state.skipBowAnimated) {
        const skipBtn = document.getElementById('skipBtn');
        if (skipBtn) {
          skipBtn.classList.add('bow-shape');
          setTimeout(() => skipBtn.classList.add('rounded-bow'), 400);
          setTimeout(() => skipBtn.classList.add('illuminating'), 800);
        }
        this.state.skipBowAnimated = true;
      }
      
    } else if (phase === 'doorway') {
      const doorwayProgress = (t - cfg.celliEnd) / (cfg.doorwayEnd - cfg.celliEnd);
      bloom.strength = THREE.MathUtils.lerp(0.35, 0.55, Math.min(doorwayProgress * 2, 1));
      afterimage.uniforms.damp.value = 0.8;
      film.uniforms.noise.value = 0.005;
      film.uniforms.scanAmp.value = 0.002;
      if (tri) tri.visible = false;
    }
  }

  /**
   * Get current phase name
   */
  _getCurrentPhase(t, cfg) {
    if (t < cfg.rollEnd) return 'roll';
    if (t < cfg.bounceEnd) return 'bounce';
    if (t < cfg.triangleEnd) return 'triangle';
    if (t < cfg.transitionEnd) return 'transition';
    if (t < cfg.normalEnd) return 'normal';
    if (t < cfg.vennEnd) return 'venn';
    if (t < cfg.collapseEnd) return 'collapse';
    if (t < cfg.glitchEnd) return 'glitch';
    if (t < cfg.blackoutEnd) return 'blackout';
    if (t < cfg.loomworksEnd) return 'loomworks';
    if (t < cfg.celliEnd) return 'celli';
    return 'doorway';
  }

  /**
   * Update quote glitch effects
   */
  _updateQuoteGlitch(progress, phase) {
    const quoteEl = document.getElementById('quote');
    if (!quoteEl) return;
    
    if (phase === 'collapse') {
      if (progress > 0.15 && !this.state.glitchStarted) {
        quoteEl.style.visibility = 'visible';
        quoteEl.style.opacity = '0.85';
        quoteEl.classList.add('glitch');
        this.state.glitchStarted = true;
        this.state.quoteShown = true;
      }
      
      if (progress > 0.6 && !this.state.mediumGlitchStarted) {
        quoteEl.classList.remove('glitch');
        quoteEl.classList.add('glitchMedium');
        this.state.mediumGlitchStarted = true;
      }
      
    } else if (phase === 'glitch') {
      if (progress > 0.05 && !this.state.intenseGlitchStarted) {
        quoteEl.classList.remove('glitch', 'glitchMedium');
        quoteEl.classList.add('glitchIntense');
        this.state.intenseGlitchStarted = true;
      }
      
      if (progress > 0.25 && !this.state.quoteDespairShown) {
        this._swapQuoteToDespair();
        this.state.quoteDespairShown = true;
      }
      
      if (progress > 0.4 && !this.state.screenGlitchStarted) {
        const screenGlitch = document.getElementById('screenGlitch');
        if (screenGlitch) screenGlitch.classList.add('active');
        this.state.screenGlitchStarted = true;
      }
    }
  }

  /**
   * Swap quote text to despair message
   */
  _swapQuoteToDespair() {
    const quoteEl = document.getElementById('quote');
    if (!quoteEl) return;
    
    const quoteBefore = document.getElementById('quoteBefore');
    if (quoteBefore) {
      quoteBefore.textContent = 'LOOK on my works, ye Mighty, and despair!';
    }
    quoteEl.classList.add('quote--loom');
  }

  /**
   * Start Loomworks text reveal
   */
  _startLoomworksReveal() {
    const quoteEl = document.getElementById('quote');
    if (quoteEl) {
      quoteEl.style.visibility = 'hidden';
      quoteEl.style.opacity = '0';
      quoteEl.classList.remove('glitch', 'glitchMedium', 'glitchIntense', 'scrambling');
    }
    
    const loomEl = document.getElementById('loomworks');
    if (loomEl) {
      loomEl.classList.add('visible');
    }
  }

  /**
   * Play startup chime jingle
   */
  _playStartupChime() {
    if (!this.state.audioCtx) return;
    
    try {
      const now = this.state.audioCtx.currentTime;
      const melody = [
        { freq: 261.63, time: 0.0, duration: 0.25 },
        { freq: 329.63, time: 0.15, duration: 0.25 },
        { freq: 392.00, time: 0.30, duration: 0.25 },
        { freq: 523.25, time: 0.45, duration: 0.5 }
      ];
      
      melody.forEach((note) => {
        const osc = this.state.audioCtx.createOscillator();
        const gain = this.state.audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, now + note.time);
        
        gain.gain.setValueAtTime(0, now + note.time);
        gain.gain.linearRampToValueAtTime(0.12, now + note.time + 0.02);
        gain.gain.linearRampToValueAtTime(0.08, now + note.time + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.duration);
        
        osc.connect(gain);
        gain.connect(this.state.audioCtx.destination);
        osc.start(now + note.time);
        osc.stop(now + note.time + note.duration);
      });
    } catch (e) {
      console.warn('Chime sound failed:', e);
    }
  }

  /**
   * Update spheres based on animation phase
   */
  _updateSpheresPhase(t, cfg, phase) {
    const speed = this.state.motionCfg.speed;
    const maxDist = this.state.motionCfg.maxDist;
    const rotSpeed = this.state.motionCfg.rotationSpeed;
    const R = 0.16;

    if (t < cfg.rollEnd) {
      // Phase: Roll into place - shapes roll from off-screen left
      const rollProgress = t / cfg.rollEnd;
      const eased = rollProgress < 0.5 ? 
        2 * rollProgress * rollProgress : 
        1 - Math.pow(-2 * rollProgress + 2, 2) / 2;
      
      // Hide triangle gradient and black hole during roll
      if (this.state.triMesh) this.state.triMesh.visible = false;
      if (this.state.blackHole) this.state.blackHole.visible = false;
      
      for (let i = 0; i < 3; i++) {
        const targetX = (i - 1) * 0.35;
        const startX = targetX - 2.0; // Start off-screen left
        const x = THREE.MathUtils.lerp(startX, targetX, eased);
        const y = -0.3;
        
        // Calculate rolling rotation based on distance traveled
        const distance = x - startX;
        let rotation = 0;
        
        if (i === 0) {
          // Square: snap to flat (multiple of π/2)
          const squarePerimeter = R * 2 * 4;
          const naturalRotation = -(distance / squarePerimeter) * (Math.PI * 2);
          rotation = rollProgress > 0.95 ? Math.round(naturalRotation / (Math.PI / 2)) * (Math.PI / 2) : naturalRotation;
        } else if (i === 1) {
          // Triangle: snap to flat (multiple of 2π/3)
          const trianglePerimeter = R * 2 * 3;
          const naturalRotation = -(distance / trianglePerimeter) * (Math.PI * 2);
          rotation = rollProgress > 0.95 ? Math.round(naturalRotation / (Math.PI * 2 / 3)) * (Math.PI * 2 / 3) : naturalRotation;
        } else {
          // Circle: any rotation is flat
          rotation = -(distance / (2 * Math.PI * R)) * (Math.PI * 2);
        }
        
        if (rollProgress > 0.98) {
          this.state.finalRollRotations[i] = rotation;
        }
        
        // Play rolling thunks
        const rollDist = Math.abs(x - startX);
        const expectedThunks = Math.floor(rollDist / 0.15);
        if (expectedThunks > this.state.lastThunkTime[i]) {
          this._playRollingThunk(0.06);
          this.state.lastThunkTime[i] = expectedThunks;
        }
        
        this.state.spheres[i].position.set(x, y, -i * 0.002);
        this.state.spheres[i].rotation.z = rotation;
        this.state.spheres[i].scale.set(cfg.ballSize, cfg.ballSize, cfg.ballSize);
        
        // Play final landing thunk
        if (!this.state.landingSounds[i] && Math.abs(x - targetX) < 0.02) {
          this._playRollingThunk(0.12);
            this.state.landingSounds[i] = true;
        }
      }
      
    } else if (t < cfg.bounceEnd) {
      // Phase: Sequential bounces (left, right, middle)
      const bounceT = t - cfg.rollEnd;
      const baseY = -0.3;
      
      if (this.state.triMesh) this.state.triMesh.visible = false;
      if (this.state.blackHole) this.state.blackHole.visible = false;
      
      const bounceOrder = [0, 2, 1]; // left, right, middle
      
      for (let i = 0; i < 3; i++) {
        const x = (i - 1) * 0.35;
        let y = baseY;
        
        const bounceIndex = bounceOrder.indexOf(i);
        const bounceStart = bounceIndex * cfg.bounceDuration;
        const bounceEnd = bounceStart + cfg.bounceDuration;
        
        if (bounceT >= bounceStart && bounceT <= bounceEnd) {
          const localT = (bounceT - bounceStart) / cfg.bounceDuration;
          const bounce = Math.sin(localT * Math.PI) * cfg.bounceHeight;
          y = baseY + bounce;
          
          // Play bounce sounds
          if (!window['bounceJump_' + i] && localT < 0.05) {
            this._playBounceThud(0.12);
            window['bounceJump_' + i] = true;
          }
          if (!window['bounceLand_' + i] && localT > 0.95) {
            this._playBounceThud(0.15);
            window['bounceLand_' + i] = true;
          }
        }
        
        this.state.spheres[i].position.set(x, y, -i * 0.002);
        this.state.spheres[i].rotation.z = this.state.finalRollRotations[i];
        this.state.spheres[i].scale.set(cfg.ballSize, cfg.ballSize, cfg.ballSize);
      }
      
    } else if (t < cfg.triangleEnd) {
      // Phase: Triangle formation + grow
      const triangleProgress = (t - cfg.bounceEnd) / (cfg.triangleEnd - cfg.bounceEnd);
      const smoothEase = (p) => p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      
      const formProgress = Math.min(triangleProgress / 0.35, 1.0);
      const formEased = smoothEase(formProgress);
      
      const convergeStart = 0.35;
      const convergeProgress = triangleProgress > convergeStart ? Math.min((triangleProgress - convergeStart) / 0.25, 1.0) : 0;
      const convergeEased = smoothEase(convergeProgress);
      
      const growStart = 0.6;
      const growProgress = triangleProgress > growStart ? (triangleProgress - growStart) / 0.4 : 0;
      const growEased = smoothEase(growProgress);
      
      const centerY = 0;
      const triangleRadius = 0.42;
      const triangleAngles = [
        Math.PI / 2 + (2 * Math.PI / 3) * 0,
        Math.PI / 2 + (2 * Math.PI / 3) * 1,
        Math.PI / 2 + (2 * Math.PI / 3) * 2
      ];
      
      const rotationAmount = growEased * 0.2;
      const pulseSpeed = 2.0;
      const pulsePhase = (t - cfg.bounceEnd - growStart * (cfg.triangleEnd - cfg.bounceEnd)) * pulseSpeed;
      const pulseFactor = growProgress > 0 ? 1 + Math.sin(pulsePhase) * 0.08 : 1;
      const convergeFactor = convergeEased * 0.12;
      
      const triangleMapping = [1, 0, 2];
      
      for (let i = 0; i < 3; i++) {
        const startX = (i - 1) * 0.35;
        const startY = -0.3;
        
        const angleIndex = triangleMapping[i];
        const angle = triangleAngles[angleIndex] + rotationAmount;
        const targetRadius = triangleRadius * (1 - convergeFactor) * pulseFactor;
        const targetX = Math.cos(angle) * targetRadius;
        const targetY = Math.sin(angle) * targetRadius + centerY;
        
        const x = THREE.MathUtils.lerp(startX, targetX, formEased);
        const y = THREE.MathUtils.lerp(startY, targetY, formEased);
        
        this.state.spheres[i].position.set(x, y, -i * 0.002);
        this.state.spheres[i].rotation.z = 0;
        
        let scale = cfg.ballSize;
        if (formEased < 1) {
          scale = THREE.MathUtils.lerp(cfg.ballSize, cfg.ballSize * 1.0, formEased);
    } else {
          const overshoot = Math.sin(growEased * Math.PI) * 0.08;
          scale = THREE.MathUtils.lerp(cfg.ballSize * 1.0, cfg.ballSize * 2.2, growEased) + overshoot;
        }
        
        this.state.spheres[i].scale.set(scale, scale, scale);
      }
      
      if (this.state.blackHole) {
        this.state.blackHole.visible = true;
        this.state.blackHole.material.uniforms.pulseFactor.value = formEased * 0.4;
      }
      
    } else if (phase === 'transition') {
      // Phase: Transition to orbit - morph shapes to circles
      const transProgress = (t - cfg.triangleEnd) / (cfg.transitionEnd - cfg.triangleEnd);
      const eased = transProgress < 0.5 ? 
        4 * transProgress * transProgress * transProgress : 
        1 - Math.pow(-2 * transProgress + 2, 3) / 2;
      
      // Morph shapes to circles at 50% progress
      if (transProgress > 0.5 && !this.state.morphedToCircles) {
        const mat0 = this.state.spheres[0].material;
        const mat1 = this.state.spheres[1].material;
        
        this.state.spheres[0].geometry.dispose();
        this.state.spheres[0].geometry = this.state.circleGeoTarget;
        this.state.spheres[0].material = mat0;
        
        this.state.spheres[1].geometry.dispose();
        this.state.spheres[1].geometry = this.state.circleGeoTarget.clone();
        this.state.spheres[1].material = mat1;
        
        this.state.morphedToCircles = true;
      }
      
      const centerY = 0;
      const triangleRadius = 0.42;
      const triangleAngles = [
        Math.PI / 2 + (2 * Math.PI / 3) * 0,
        Math.PI / 2 + (2 * Math.PI / 3) * 1,
        Math.PI / 2 + (2 * Math.PI / 3) * 2
      ];
      
      const startRadius = triangleRadius * (1 - 0.12);
      const triangleEndRotation = 0.2;
      const rotation = triangleEndRotation + (eased * Math.PI * 2);
      const targetDist = maxDist * 0.5;
      const currentDist = THREE.MathUtils.lerp(startRadius, targetDist, eased);
      const triangleMapping = [1, 0, 2];
      
      for (let i = 0; i < 3; i++) {
        const angleIndex = triangleMapping[i];
        const angle = triangleAngles[angleIndex] + rotation;
        const x = Math.cos(angle) * currentDist;
        const y = Math.sin(angle) * currentDist + centerY;
        
        this.state.spheres[i].position.set(x, y, -i * 0.002);
        this.state.spheres[i].rotation.z = 0;
        const scale = THREE.MathUtils.lerp(cfg.ballSize * 2.2, 1.0, eased);
        this.state.spheres[i].scale.set(scale, scale, scale);
      }
      
      if (this.state.blackHole) {
        this.state.blackHole.visible = true;
        this.state.blackHole.material.uniforms.pulseFactor.value = THREE.MathUtils.lerp(0.4, 0.5, eased);
      }
      
    } else if (phase === 'normal' || phase === 'venn') {
      // Phase: Normal orbit with converge/pulse, then venn
      const isVenn = phase === 'venn';
      const normalT = isVenn ? (cfg.vennEnd - cfg.transitionEnd) : (t - cfg.transitionEnd);
      
      const convergeDuration = 2.2;
      const pulseDuration = 3.0;
      const totalAnimDuration = convergeDuration + pulseDuration;
      const transitionEndDist = maxDist * 0.5;
      const closeConvergeDist = 0.02;
      const triangleExpandDist = maxDist * 0.65;
      
      const centerY = 0;
      const triangleAngles = [
        Math.PI / 2 + (2 * Math.PI / 3) * 0,
        Math.PI / 2 + (2 * Math.PI / 3) * 1,
        Math.PI / 2 + (2 * Math.PI / 3) * 2
      ];
      const transitionEndRotation = 0.2 + Math.PI * 2;
      const rotation = transitionEndRotation + (normalT * this.state.motionCfg.rotationSpeed * (isVenn ? 0.3 : 1.0));
      const triangleMapping = [1, 0, 2];
      
      let currentDist = transitionEndDist;
      let scale = 1.0;
      let pulseFactorValue = 0.5;
      
      if (!isVenn && normalT < convergeDuration) {
        const convergeProgress = THREE.MathUtils.clamp(normalT / convergeDuration, 0, 1);
        const convergeEased = convergeProgress * convergeProgress * (3 - 2 * convergeProgress);
        currentDist = THREE.MathUtils.lerp(transitionEndDist, closeConvergeDist, convergeEased);
        scale = THREE.MathUtils.lerp(1.0, 0.82, convergeEased);
        pulseFactorValue = THREE.MathUtils.lerp(0.5, 0.95, convergeEased);
      } else if (!isVenn && normalT < totalAnimDuration) {
        const pulseT = normalT - convergeDuration;
        const pulseProgress = pulseT / pulseDuration;
        const pulseCycle = Math.sin(pulseProgress * Math.PI);
        currentDist = THREE.MathUtils.lerp(closeConvergeDist, triangleExpandDist, pulseCycle);
        scale = THREE.MathUtils.lerp(0.82, 1.0, pulseCycle);
        pulseFactorValue = THREE.MathUtils.lerp(0.95, 0.6, pulseCycle);
      } else if (!isVenn) {
        currentDist = closeConvergeDist;
        scale = 0.82;
        pulseFactorValue = 0.95;
      } else {
        // Venn phase - expand to clean triangle
        const vennT = t - cfg.normalEnd;
        const vennProgress = vennT / (cfg.vennEnd - cfg.normalEnd);
        const vennEased = vennProgress * vennProgress * (3 - 2 * vennProgress);
        currentDist = THREE.MathUtils.lerp(closeConvergeDist, 0.08, vennEased);
        scale = THREE.MathUtils.lerp(0.82, 0.7, vennEased);
        pulseFactorValue = THREE.MathUtils.lerp(0.95, 0.65, vennEased);
      }
      
      for (let i = 0; i < 3; i++) {
        const angleIndex = triangleMapping[i];
        const angle = triangleAngles[angleIndex] + rotation;
        const x = Math.cos(angle) * currentDist;
        const y = Math.sin(angle) * currentDist + centerY;
        
        this.state.spheres[i].position.set(x, y, -i * 0.002);
        this.state.spheres[i].rotation.z = 0;
        this.state.spheres[i].scale.set(scale, scale, scale);
      }
      
      if (this.state.blackHole) {
        this.state.blackHole.visible = true;
        this.state.blackHole.material.uniforms.pulseFactor.value = pulseFactorValue;
      }
      
    } else if (phase === 'collapse' || phase === 'glitch' || phase === 'blackout' || phase === 'loomworks' || phase === 'celli' || phase === 'doorway') {
      // Collapse to white circle, then fade during later phases
      const baseT = phase === 'collapse' ? (t - cfg.vennEnd) : 
                    phase === 'glitch' ? (cfg.collapseEnd - cfg.vennEnd) :
                    (cfg.collapseEnd - cfg.vennEnd);
      const baseDuration = cfg.collapseEnd - cfg.vennEnd;
      let collapseProgress = baseT / baseDuration;
      if (phase !== 'collapse') collapseProgress = 1.0;
      
      const eased = collapseProgress * collapseProgress * (3 - 2 * collapseProgress);
      
      const centerY = 0;
      const triangleAngles = [
        Math.PI / 2 + (2 * Math.PI / 3) * 0,
        Math.PI / 2 + (2 * Math.PI / 3) * 1,
        Math.PI / 2 + (2 * Math.PI / 3) * 2
      ];
      
      const normalDuration = cfg.normalEnd - cfg.transitionEnd;
      const vennDuration = cfg.vennEnd - cfg.normalEnd;
      const baseRotation = 0.2 + Math.PI * 2 + 
                          (normalDuration * this.state.motionCfg.rotationSpeed) + 
                          (vennDuration * this.state.motionCfg.rotationSpeed * 0.3);
      const collapseT = phase === 'collapse' ? (t - cfg.vennEnd) : baseDuration;
      const rotation = baseRotation + (collapseT * this.state.motionCfg.rotationSpeed * 0.15);
      
      const startDist = 0.08;
      const targetDist = 0.005;
      const currentDist = THREE.MathUtils.lerp(startDist, targetDist, eased);
      const scale = THREE.MathUtils.lerp(0.7, 0.85, eased);
      const triangleMapping = [1, 0, 2];
      
      // Fade out spheres during glitch
      let sphereOpacity = 1.0;
      if (phase === 'glitch') {
        const glitchProgress = (t - cfg.collapseEnd) / (cfg.glitchEnd - cfg.collapseEnd);
        sphereOpacity = THREE.MathUtils.lerp(1.0, 0, glitchProgress);
      } else if (phase === 'blackout' || phase === 'loomworks' || phase === 'celli' || phase === 'doorway') {
        sphereOpacity = 0;
      }
      
      for (let i = 0; i < 3; i++) {
        const angleIndex = triangleMapping[i];
        const angle = triangleAngles[angleIndex] + rotation;
        const x = Math.cos(angle) * currentDist;
        const y = Math.sin(angle) * currentDist + centerY;
        
        this.state.spheres[i].position.set(x, y, -i * 0.002);
        this.state.spheres[i].rotation.z = 0;
        this.state.spheres[i].scale.set(scale, scale, scale);
        this.state.spheres[i].material.opacity = sphereOpacity;
      }
      
      if (this.state.blackHole) {
        this.state.blackHole.visible = phase === 'collapse' || phase === 'glitch';
        if (phase === 'collapse') {
          this.state.blackHole.material.uniforms.pulseFactor.value = THREE.MathUtils.lerp(0.65, 0.85, eased);
        } else if (phase === 'glitch') {
          const glitchProgress = (t - cfg.collapseEnd) / (cfg.glitchEnd - cfg.collapseEnd);
          this.state.blackHole.material.uniforms.pulseFactor.value = THREE.MathUtils.lerp(0.85, 0, glitchProgress);
        }
      }
      
    } else {
      // Fallback: Orbital motion
      const orbitalTime = t - cfg.triangleEnd;
      
      this.state.spheres.forEach((sphere, i) => {
        const offset = i * Math.PI * 2 / 3;
        const angle = orbitalTime * speed + offset;
        const dist = maxDist;
        
        sphere.position.x = Math.cos(angle) * dist;
        sphere.position.y = Math.sin(angle) * dist;
        sphere.rotation.z = angle * rotSpeed;
      });
      
      if (this.state.blackHole) this.state.blackHole.visible = true;
      if (this.state.triMesh) this.state.triMesh.visible = true;
    }
  }

  /**
   * Update CELLI voxels
   */
  _updateVoxels(celliTime, deltaTime) {
    const hellActive = this.state.hellTransformActive;
    if (hellActive) {
      const elapsed = (performance.now() - this.state.hellTransformStart) / 1000;
      const duration = Math.max(0.1, this.state.hellTransformDuration);
      this.state.hellProgress = THREE.MathUtils.clamp(elapsed / duration, 0, 1);
      if (this.state.hellProgress >= 1) {
        this.state.hellTransformActive = false;
      }
    } else {
      this.state.hellProgress = 0;
    }

    const dt = deltaTime || 0.016;
    const now = this.state.totalTime;

    this.state.voxels.forEach(voxel => {
      const data = voxel.userData;
      const localTime = celliTime - data.dropDelay;

      if (data.rainActive) {
        if (now < data.rainStart) {
          return;
        }

        voxel.visible = true;
        data.rainVelocity += dt * 0.35;
        voxel.position.y -= data.rainVelocity;
        voxel.position.x += data.rainDrift;
        voxel.rotation.z += data.rainSpin * dt * 6;

        const fade = data.rainFade || 0.04;
        voxel.material.opacity = Math.max(0, voxel.material.opacity - fade);
        if (data.edges && data.edges.material) {
          data.edges.material.opacity = Math.max(0, data.edges.material.opacity - fade * 1.2);
        }

        if (voxel.position.y < data.originalTargetY - 2 || voxel.material.opacity <= 0.05) {
          voxel.visible = false;
          data.rainActive = false;
        }
        return;
      }

      if (data.burstActive) {
        voxel.visible = true;
        data.burstVelocity.y -= 0.0015;
        voxel.position.x += data.burstVelocity.x;
        voxel.position.y += data.burstVelocity.y;
        voxel.rotation.z += data.burstRotation;

        voxel.material.opacity = Math.max(0, voxel.material.opacity - 0.035);
        if (data.edges && data.edges.material) {
          data.edges.material.opacity = Math.max(0, data.edges.material.opacity - 0.045);
        }

        if (voxel.position.y < data.originalTargetY - 1.2 || voxel.material.opacity <= 0.05) {
          voxel.visible = false;
          voxel.rotation.z = 0;
          data.burstActive = false;
        }
        return;
      }

      if (data.hellDrop) {
        if (!data.dropVelocity) {
          data.dropVelocity = -0.02 - Math.random() * 0.02;
        }
        voxel.position.y += data.dropVelocity;
        voxel.material.opacity = Math.max(0, voxel.material.opacity - 0.03);
        if (data.edges && data.edges.material) {
          data.edges.material.opacity = Math.max(0, data.edges.material.opacity - 0.04);
        }
        if (voxel.position.y < data.originalTargetY - 2.5) {
          voxel.visible = false;
          data.hellDrop = false;
        }
        return;
      }

      if (localTime > 0) {
        voxel.visible = true;

        if (!data.settled && voxel.position.y > data.targetY) {
          // Dropping
          voxel.position.y -= data.dropSpeed;

          // Gradually increase opacity
          const newOpacity = Math.min(0.8, voxel.material.opacity + 0.05);
          voxel.material.opacity = newOpacity;
          voxel.material.needsUpdate = true;
          
          const newEdgeOpacity = Math.min(0.6, data.edges.material.opacity + 0.04);
          data.edges.material.opacity = newEdgeOpacity;
          data.edges.material.needsUpdate = true;
          
        } else if (!data.settled) {
          // Just landed
          voxel.position.y = data.targetY;
          voxel.material.opacity = 0.8;
          data.edges.material.opacity = 0.6;
          data.settled = true;
          
          // Play chime sound on landing
          this._playVoxelChime();
        }
        
        // Subtle jiggle animation when settled
        if (data.settled) {
          data.jigglePhase += 0.02;
          const jiggle = Math.sin(data.jigglePhase) * 0.002;
          voxel.position.x = data.targetX + jiggle;

          data.flickerPhase += 0.045;
          const flicker = 0.5 + 0.5 * Math.sin(data.flickerPhase + celliTime * 0.4);
          let glowStrength = THREE.MathUtils.clamp(0.35 + flicker * 0.55, 0, 1);

          if (data.backspaceTransformed && this.state.currentTheme === 'yellow') {
            glowStrength = Math.min(1, glowStrength + 0.25);
          }

          const targetOpacity = 0.82 + glowStrength * (data.backspaceTransformed ? 0.28 : 0.18);
          voxel.material.opacity = THREE.MathUtils.lerp(voxel.material.opacity, targetOpacity, 0.08);
          voxel.material.needsUpdate = true;

          if (data.baseColor && data.glowColor) {
            voxel.material.color.lerpColors(data.baseColor, data.glowColor, glowStrength);
          }

          if (data.edges && data.edges.material) {
            const edgeTargetOpacity = (data.backspaceTransformed ? 0.5 : 0.6) + glowStrength * (data.backspaceTransformed ? 0.4 : 0.35);
            data.edges.material.opacity = THREE.MathUtils.lerp(data.edges.material.opacity, edgeTargetOpacity, 0.1);
            data.edges.material.needsUpdate = true;

            if (data.edgesBaseColor && data.edgesGlowColor && data.edges.material.color) {
              data.edges.material.color.lerpColors(data.edgesBaseColor, data.edgesGlowColor, glowStrength);
            }
          }
        }

        if (hellActive && data.hellTarget && data.hellStart) {
          const progress = this.state.hellProgress;
          const eased = progress * progress * (3 - 2 * progress);
          voxel.position.x = THREE.MathUtils.lerp(data.hellStart.x, data.hellTarget.x, eased);
          voxel.position.y = THREE.MathUtils.lerp(data.hellStart.y, data.hellTarget.y, eased);
          voxel.scale.setScalar(THREE.MathUtils.lerp(data.hellStartScale, data.hellTargetScale, eased));
        }
      }

      this._updateVoxelFlatten(voxel, data, dt);
    });

    this._updateTVoxels();
  }

  _updateTVoxels() {
    if (!this.state.tRevealActive) {
      return;
    }

    const elapsed = (performance.now() - this.state.tRevealStartTime) / 1000;

    this.state.tVoxels.forEach(voxel => {
      const data = voxel.userData;
      const localTime = elapsed - data.dropDelay;

      if (localTime <= 0) {
        return;
      }

      voxel.visible = true;

      if (!data.settled && voxel.position.y > data.targetY) {
        voxel.position.y -= data.dropSpeed;
        voxel.material.opacity = Math.min(0.85, voxel.material.opacity + 0.06);
        if (data.edges && data.edges.material) {
          data.edges.material.opacity = Math.min(0.7, data.edges.material.opacity + 0.05);
        }
      } else if (!data.settled) {
        voxel.position.y = data.targetY;
        voxel.material.opacity = 0.85;
        if (data.edges && data.edges.material) {
          data.edges.material.opacity = 0.7;
        }
        data.settled = true;
      }

      if (data.settled) {
        data.jigglePhase += 0.03;
        const jiggle = Math.sin(data.jigglePhase) * 0.0025;
        voxel.position.x = data.targetX + jiggle;

        data.flickerPhase += 0.05;
        const flicker = 0.5 + 0.5 * Math.sin(data.flickerPhase);
        const glowStrength = THREE.MathUtils.clamp(0.4 + flicker * 0.5, 0, 1);

        voxel.material.opacity = THREE.MathUtils.lerp(voxel.material.opacity, 0.92, 0.1);
        voxel.material.color.lerpColors(data.baseColor, data.glowColor, glowStrength);
        if (data.edges && data.edges.material) {
          data.edges.material.opacity = THREE.MathUtils.lerp(data.edges.material.opacity, 0.75, 0.12);
          data.edges.material.color.lerpColors(data.edgesBaseColor, data.edgesGlowColor, glowStrength);
        }
      }
    });
  }

  /**
   * Play voxel landing chime
   */
  _playVoxelChime() {
    if (!this.state.audioCtx) return;
    
    try {
      const now = this.state.audioCtx.currentTime;
      const pentatonicNotes = [523.25, 587.33, 659.25, 783.99, 880];
      const freq = pentatonicNotes[Math.floor(Math.random() * pentatonicNotes.length)];
      
      const osc1 = this.state.audioCtx.createOscillator();
      const osc2 = this.state.audioCtx.createOscillator();
      const gain = this.state.audioCtx.createGain();
      
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, now);
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 3, now);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.03, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.state.audioCtx.destination);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.2);
      osc2.stop(now + 1.2);
    } catch (e) {
      console.warn('Voxel chime failed:', e);
    }
  }

  /**
   * Show doorway portal (just make visible)
   */
  _showDoorway() {
    this.state.doorwayShown = true;
    const doorway = document.getElementById('doorway');
    if (doorway) {
      doorway.classList.add('visible');
    }
  }

  /**
   * Open doorway portal (expand it)
   */
  _openDoorway() {
        this.state.doorwayOpened = true;
    const doorway = document.getElementById('doorway');
    if (doorway) {
      doorway.classList.add('open');
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
    if (this.state.restoredLetters >= this.state.lettersToRestore.length) {
      return;
    }

    const letterKey = this.state.lettersToRestore[this.state.restoredLetters];
    const letterVoxelsList = this.state.letterVoxels[letterKey];

    if (!letterVoxelsList || letterVoxelsList.length === 0) {
      this.state.restoredLetters += 1;
      return;
    }

    this._playFritzSound();

    letterVoxelsList.forEach((voxel, idx) => {
      const data = voxel.userData;
      const delay = idx * 30;

      window.setTimeout(() => {
        if (!data) return;

        voxel.visible = true;
        data.glitched = false;
        data.rainActive = false;
        data.burstActive = false;
        data.hellDrop = false;
        data.settled = false;
        data.flattenState = null;
        data.backspaceTransformed = false;
        voxel.rotation.z = 0;
        voxel.position.set(data.originalTargetX, data.originalTargetY + 0.6, 0);
        voxel.material.color.setRGB(0.2, 0.2, 0.2);
        voxel.material.opacity = 0.2;
        if (data.edges && data.edges.material) {
          data.edges.material.opacity = 0.12;
        }

        let flickers = 0;
        const maxFlickers = 6;
        const flickerInterval = window.setInterval(() => {
          flickers += 1;
          const on = flickers % 2 === 1;
          const brightness = on ? 0.9 : 0.35;
          voxel.material.color.setRGB(brightness, brightness, brightness);
          voxel.material.opacity = on ? 0.85 : 0.35;
          if (data.edges && data.edges.material) {
            data.edges.material.opacity = on ? 0.55 : 0.2;
          }

          if (flickers >= maxFlickers) {
            window.clearInterval(flickerInterval);
            voxel.position.y = data.originalTargetY;
            voxel.material.color.setRGB(0.82, 0.82, 0.82);
            voxel.material.opacity = 0.78;
            if (data.edges && data.edges.material) {
              data.edges.material.opacity = 0.32;
            }
            data.settled = true;
          }
        }, 70);
      }, delay);
    });

    this.state.restoredLetters += 1;

    if (this.state.restoredLetters >= this.state.lettersToRestore.length) {
      window.setTimeout(() => {
        this._restoreIAndTransform();
      }, 800);
    }
  }

  _restoreIAndTransform() {
    const iVoxels = this.state.letterVoxels.I || [];

    if (iVoxels.length) {
      this._playFritzSound();

      iVoxels.forEach((voxel, idx) => {
        const data = voxel.userData;
        const delay = idx * 20;

        window.setTimeout(() => {
          if (!data) return;

          voxel.visible = true;
          data.glitched = false;
          data.rainActive = false;
          data.burstActive = false;
          data.settled = true;
          voxel.position.set(data.originalTargetX, data.originalTargetY, 0);
          voxel.material.color.setRGB(0.82, 0.82, 0.82);
          voxel.material.opacity = 0.78;
          if (data.edges && data.edges.material) {
            data.edges.material.opacity = 0.32;
          }
        }, delay);
      });
    }

    window.setTimeout(() => {
      this._startYellowTransformation();
    }, 600);
  }

  _startYellowTransformation() {
    if (this.state.yellowTransformationInProgress) {
      return;
    }

    this.state.yellowTransformationInProgress = true;
    this.state.yellowTransformCompleteCount = 0;
    this.state.allYellowTransformed = false;

    const totalVoxels = this.state.voxels.length || 1;

    this.state.voxels.forEach((voxel, idx) => {
      const data = voxel.userData;
      const delay = idx * 15;

      window.setTimeout(() => {
        if (!data) return;

        const baseScale = data.baseScale;
        const shrinkStart = performance.now();
        const shrinkDuration = 150;

        const shrinkInterval = window.setInterval(() => {
          const progress = (performance.now() - shrinkStart) / shrinkDuration;
          if (progress >= 1) {
            window.clearInterval(shrinkInterval);

            this._applyRoundedGeometry(voxel);

            const burstStart = performance.now();
            const burstDuration = 300;

            const burstInterval = window.setInterval(() => {
              const burstProgress = (performance.now() - burstStart) / burstDuration;

              if (burstProgress >= 1) {
                window.clearInterval(burstInterval);

                voxel.scale.set(baseScale, baseScale, baseScale);
                voxel.material.color.setRGB(1.0, 0.95, 0.35);
                voxel.material.opacity = 0.9;

                if (data.edges && data.edges.material) {
                  data.edges.material.color.setRGB(1.0, 0.9, 0.4);
                  data.edges.material.opacity = 0.65;
                }

                if (data.baseColor) data.baseColor.setRGB(0.35, 0.24, 0.0);
                if (data.glowColor) data.glowColor.setRGB(1.0, 0.92, 0.36);
                if (data.edgesBaseColor) data.edgesBaseColor.setRGB(0.55, 0.36, 0.0);
                if (data.edgesGlowColor) data.edgesGlowColor.setRGB(1.0, 0.9, 0.4);

                data.backspaceTransformed = true;
                data.settled = true;

                this.state.yellowTransformCompleteCount += 1;

                if (this.state.yellowTransformCompleteCount >= totalVoxels) {
                  this.state.allYellowTransformed = true;
                  this._setColorPhase('yellow');
                  this.state.yellowTransformationInProgress = false;
                }
              } else {
                const eased = Math.sin(THREE.MathUtils.clamp(burstProgress, 0, 1) * Math.PI);
                const scale = THREE.MathUtils.lerp(baseScale * 0.5, baseScale * 1.15, eased);
                voxel.scale.set(scale, scale, scale);

                const r = THREE.MathUtils.lerp(0.85, 1.0, burstProgress);
                const g = THREE.MathUtils.lerp(0.85, 0.95, burstProgress);
                const b = THREE.MathUtils.lerp(0.8, 0.3, burstProgress);
                voxel.material.color.setRGB(r, g, b);
                voxel.material.opacity = THREE.MathUtils.lerp(0.4, 0.92, burstProgress);

                if (data.edges && data.edges.material) {
                  data.edges.material.opacity = THREE.MathUtils.lerp(0.2, 0.65, burstProgress);
                }
              }
            }, 16);
          } else {
            const clamped = THREE.MathUtils.clamp(progress, 0, 1);
            const scale = baseScale * THREE.MathUtils.lerp(1.0, 0.5, clamped);
            voxel.scale.set(scale, scale, scale);
            voxel.material.opacity = THREE.MathUtils.lerp(voxel.material.opacity, 0.4, 0.2);
          }
        }, 16);
      }, delay);
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
   * Play rolling thunk sound (gentle, for rolling motion)
   */
  _playRollingThunk(volume = 0.08) {
    if (!this.state.audioCtx) return;
    
    try {
      const now = this.state.audioCtx.currentTime;
      const osc = this.state.audioCtx.createOscillator();
      const gain = this.state.audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      
      osc.connect(gain);
      gain.connect(this.state.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {
      console.warn('Rolling thunk sound failed:', e);
    }
  }

  /**
   * Play bounce thud sound (deeper, for bouncing)
   */
  _playBounceThud(volume = 0.12) {
    if (!this.state.audioCtx) return;
    
    try {
      const now = this.state.audioCtx.currentTime;
      const osc = this.state.audioCtx.createOscillator();
      const gain = this.state.audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      
      osc.connect(gain);
      gain.connect(this.state.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      console.warn('Bounce thud sound failed:', e);
    }
  }

  /**
   * Play thunk sound (legacy method for backward compatibility)
   */
  _playThunkSound(index) {
    this._playBounceThud(0.15);
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
    const aspect = w / h;
    
    if (this.state.renderer) {
      this.state.renderer.setSize(w, h);
    }
    
    if (this.state.composer) {
      this.state.composer.setSize(w, h);
    }
    
    if (this.state.camera) {
      if (aspect > 1) {
        // Landscape
        this.state.camera.left = -aspect;
        this.state.camera.right = aspect;
        this.state.camera.top = 1;
        this.state.camera.bottom = -1;
        if (this.state.blackHole) this.state.blackHole.scale.set(1, 1, 1);
      } else {
        // Portrait
        this.state.camera.left = -1;
        this.state.camera.right = 1;
        this.state.camera.top = 1 / aspect;
        this.state.camera.bottom = -1 / aspect;
        if (this.state.blackHole) this.state.blackHole.scale.set(aspect, aspect, 1);
      }
      this.state.camera.updateProjectionMatrix();
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
    
    // Remove event listeners
    if (this._clickHandler) {
      document.removeEventListener('click', this._clickHandler);
    }
    if (this._keydownHandler) {
      document.removeEventListener('keydown', this._keydownHandler);
    }
    if (this._promptClickHandler) {
      const promptContainer = document.querySelector('.prompt-container');
      if (promptContainer) {
        promptContainer.removeEventListener('click', this._promptClickHandler);
      }
    }
    if (this.state.hiddenInput && this._hiddenBeforeInputHandler) {
      this.state.hiddenInput.removeEventListener('beforeinput', this._hiddenBeforeInputHandler);
    }
    if (this.state.hiddenInput && this._hiddenInputHandler) {
      this.state.hiddenInput.removeEventListener('input', this._hiddenInputHandler);
    }
    this.state.hiddenInput = null;
    if (this._skipClickHandler) {
      const skipBtn = document.getElementById('skipBtn');
      if (skipBtn) skipBtn.removeEventListener('click', this._skipClickHandler);
    }
    
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


