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

// Compact 3x3 patterns for subtitle text
const COMPACT_LETTER_PATTERNS = {
  A: [
    [0, 1, 0],
    [1, 0, 1],
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 1]
  ],
  D: [
    [1, 1, 0],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 0]
  ],
  I: [
    [1, 1, 1],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 1]
  ],
  V: [
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [0, 1, 0],
    [0, 1, 0]
  ],
  N: [
    [1, 0, 0, 1],
    [1, 1, 0, 1],
    [1, 1, 1, 1],
    [1, 0, 1, 1],
    [1, 0, 0, 1]
  ],
  E: [
    [1, 1, 1],
    [1, 0, 0],
    [1, 1, 0],
    [1, 0, 0],
    [1, 1, 1]
  ],
  C: [
    [0, 1, 1],
    [1, 0, 0],
    [1, 0, 0],
    [1, 0, 0],
    [0, 1, 1]
  ],
  O: [
    [0, 1, 0],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [0, 1, 0]
  ],
  M: [
    [1, 0, 0, 0, 1],
    [1, 1, 0, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1]
  ],
  Y: [
    [1, 0, 1],
    [1, 0, 1],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0]
  ],
  T: [
    [1, 1, 1],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0]
  ],
  S: [
    [0, 1, 1],
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 0]
  ],
  '+': [
    [0, 0, 0],
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0],
    [0, 0, 0]
  ],
  ' ': [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ]
};

// Mask patterns for clickable I's
const MASK_PATTERNS = {
  HAPPY: [ // Happy theater mask
    [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0]
  ],
  SAD: [ // Sad theater mask (left-leaning, no nose holes, continuous frown)
    [0, 0, 1, 1, 0, 1, 1, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [1, 1, 0, 1, 1, 1, 1, 0, 0, 0],
    [1, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0, 0, 0]
  ],
  TROLL: [ // Troll face
    [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [0, 1, 1, 0, 0, 0, 0, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0]
  ]
};

// Map each clickable "I" index in "III" to its corresponding mask type
const I_INDEX_MASK_MAP = {
  0: 'SAD',
  1: 'HAPPY',
  2: 'TROLL'
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

const CONSTRUCTION_STORAGE_KEY = 'celli:introConstructionComplete';
const INTRO_THEME_STORAGE_KEY = 'celli:introThemePreference';
const INTRO_THEME_DEFAULT = 'theme1';
const INTRO_THEME_SECONDARY = 'theme2';
const INTRO_THEME_SOURCES = {
  [INTRO_THEME_DEFAULT]: './theme1.mp3',
  [INTRO_THEME_SECONDARY]: './theme2.mp3'
};
const INTRO_AUDIO_LOOP_DELAY_MS = 4000;

export class IntroSceneComplete {
  constructor() {
    // Kill referrer overlay immediately when intro scene initializes
    console.log('🎬 IntroScene constructor - killing referrer overlay');
    if (typeof window.killReferrerOverlay === 'function') {
      window.killReferrerOverlay();
    } else {
      console.warn('⚠️ killReferrerOverlay not available yet');
    }
    
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
      subtitleVoxels: [], // Subtitle text voxels
      showSubtitle: false, // Only show on theme2
      redSquareVoxel: null, // Reference to the red square for hover detection
      redSquareExpanding: false,
      redSquareExpansionStart: 0,
      redSquareExpansionDuration: 3.0, // 3 seconds to fill screen
      redSquareVideoPlayed: false,
      redSquareFading: false,
      redSquareFadeStart: 0,
      redSquareFadeDuration: 2.5,
      raycaster: null,
      mouse: new THREE.Vector2(),
      liquidShaderMaterial: null, // Liquid shader for red square
      mouseTrail: [], // Trail of mouse positions for liquid effect
      maskVoxels: [], // Spawned mask voxels
      iClickTargets: [null, null, null], // Larger invisible hit areas for each I
      iVoxels: [[], [], []], // Arrays of voxels for each of the three I's in III+
      iCenters: [0, 0, 0], // Horizontal centers for each clickable I
      clickedMasks: { 0: false, 1: false, 2: false }, // Track which I's have been clicked
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
      skipRequested: false,
      musicStarted: false,
      inputAttempted: false,
      inputText: '=STAR', // Match the HTML initial content
      tEntered: false,
      burstAnimStarted: false,
      celliBackspaceSequenceStarted: false,
      celliBackspaceSequenceTime: 0,
      celliBackspaceTarget: 0,
      celliMoveToCornerStarted: false,
      celliMoveToCornerTime: 0,
      visiCalcShown: false,
      celliGlitchStarted: false,
      promptBaseText: '=',
      hiddenInput: null,
      doorwayInputActive: false,
      doorwayInputRequiresClick: true,
      yellowTransformationInProgress: false,
      constructionPersisted: false,
      voxelRedirectDispatched: false,

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
      pendingEndKeys: [],
      tRevealActive: false,
      tRevealStartTime: 0,
      hellTransformActive: false,
      hellTransformStart: 0,
      hellTransformDuration: 2.2,
      hellProgress: 0,
      
      // Queued actions before animation completes
      queuedActions: [],
      celliAnimationComplete: false,

      // Audio context
      audioCtx: null,
      synthGain: null,
      synthOsc1: null,
      synthOsc2: null,
      synthOsc3: null,
      introAudio: null,
      introAudioSource: '',
      introAudioTheme: INTRO_THEME_DEFAULT,
      introAudioShouldAutoFlip: false,
      introAudioBuffers: {},
      introAudioReverseBuffers: {},
      introAudioLoadingPromises: {},
      introAudioCurrentSource: null,
      introAudioGainNode: null,
      introAudioLoopTimeout: null,
      introAudioLoopScheduled: false,
      introAudioPlayCount: 0,
      introAudioPaused: false,
      introAudioSavedGain: 0.7,

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

    if (!this.state.doorwayInputActive) {
      return;
    }

    hiddenInput.value = '';

    // Ensure the input is positioned within the viewport so mobile browsers
    // will reliably open the on-screen keyboard. Inputs that sit far offscreen
    // (e.g. at -9999px) are ignored by iOS and some Android builds.
    hiddenInput.style.position = 'fixed';
    hiddenInput.style.top = '50%';
    hiddenInput.style.left = '50%';
    hiddenInput.style.width = '1px';
    hiddenInput.style.height = '1px';
    hiddenInput.style.transform = 'translate(-50%, -50%)';
    hiddenInput.style.opacity = '0';
    hiddenInput.style.pointerEvents = 'none';
    hiddenInput.style.fontSize = '16px';

    try {
      hiddenInput.focus({ preventScroll: true });
    } catch (err) {
      hiddenInput.focus();
    }

    try {
      const length = hiddenInput.value.length;
      hiddenInput.setSelectionRange(length, length);
    } catch (error) {
      // Some mobile browsers do not support programmatic selection on hidden inputs
    }
  }

  _deactivateHiddenInput() {
    const hiddenInput = this.state.hiddenInput;
    if (!hiddenInput) {
      return;
    }

    try {
      hiddenInput.blur();
    } catch (err) {
      // Ignore blur failures (e.g., hidden input already blurred)
    }

    hiddenInput.value = '';
    hiddenInput.style.position = 'absolute';
    hiddenInput.style.top = '-9999px';
    hiddenInput.style.left = '-9999px';
  }

  _broadcastIntroMusicManagement(managed) {
    if (typeof window === 'undefined' || !window.dispatchEvent) {
      return;
    }

    try {
      window.dispatchEvent(new CustomEvent('celli:intro-music-managed', {
        detail: { managed: Boolean(managed) }
      }));
    } catch (error) {
      console.warn('⚠️ Failed to broadcast intro music management state:', error);
    }
  }

  _updateFullSequenceStage(stage) {
    if (!stage) {
      return;
    }

    try {
      if (window.sessionStorage?.getItem('celli:fullSequenceActive') === 'true') {
        window.sessionStorage.setItem('celli:fullSequenceStage', stage);
      }
    } catch (error) {
      console.warn('⚠️ Unable to persist full sequence stage from intro scene:', error);
    }
  }

  _isTouchPrimaryDevice() {
    if (typeof window === 'undefined') {
      return false;
    }

    if (window.matchMedia) {
      try {
        if (window.matchMedia('(pointer: coarse)').matches) {
          return true;
        }
      } catch (error) {
        // Ignore matchMedia failures and fall back to heuristic detection
      }
    }

    const nav = window.navigator;
    return !!(
      ('ontouchstart' in window) ||
      (nav && typeof nav.maxTouchPoints === 'number' && nav.maxTouchPoints > 0) ||
      (nav && typeof nav.msMaxTouchPoints === 'number' && nav.msMaxTouchPoints > 0)
    );
  }

  _handleHiddenInputValue(value) {
    if (!value) {
      return;
    }

    if (!this.state.doorwayInputActive) {
      if (this.state.hiddenInput) {
        this.state.hiddenInput.value = '';
      }
      return;
    }

    this.state.inputAttempted = true;

    for (const char of value) {
      const key = char.toUpperCase();

      if (key === 'T' && this._tryHandleStartCompletion()) {
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

  _getPromptSuffix({ sanitize = false } = {}) {
    const baseLength = (this.state.promptBaseText || '').length;
    const suffix = (this.state.inputText || '').slice(baseLength);

    if (!sanitize) {
      return suffix;
    }

    return suffix.toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  _getStartMatchInfo() {
    const baseWord = 'START';
    const fullSanitized = this._getPromptSuffix({ sanitize: true });
    const sanitizedSuffix = fullSanitized.slice(0, baseWord.length);
    let matchLength = 0;

    for (; matchLength < sanitizedSuffix.length; matchLength += 1) {
      if (sanitizedSuffix[matchLength] !== baseWord[matchLength]) {
        break;
      }
    }

    return { sanitizedSuffix, matchLength, baseWord, fullLength: fullSanitized.length };
  }

  _tryHandleStartCompletion() {
    if (this.state.tEntered) {
      return false;
    }

    const { sanitizedSuffix, matchLength, baseWord, fullLength } = this._getStartMatchInfo();
    const expectedLength = baseWord.length - 1;

    if (sanitizedSuffix.length !== expectedLength) {
      return false;
    }

    if (fullLength !== expectedLength) {
      return false;
    }

    if (matchLength !== expectedLength) {
      return false;
    }

    this._handleTInput();
    return true;
  }

  _handlePromptBackspace() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔙 BACKSPACE HANDLER CALLED');
    console.log('  → celliGlitchStarted:', this.state.celliGlitchStarted);
    console.log('  → restoredLetters:', this.state.restoredLetters);
    console.log('  → inputText BEFORE:', JSON.stringify(this.state.inputText));
    console.log('  → promptBaseText:', JSON.stringify(this.state.promptBaseText));
    
    // Always remove character from input text for visual feedback
    const hasExtraText = this.state.inputText.length > this.state.promptBaseText.length;
    console.log('  → hasExtraText:', hasExtraText);
    console.log('  → inputText.length:', this.state.inputText.length);
    console.log('  → promptBaseText.length:', this.state.promptBaseText.length);
    
    if (hasExtraText) {
      console.log('  ✅ HAS EXTRA TEXT - removing one character');
      
      // Remove one character from the input text (e.g., removing letters from "STAR" or "END")
      this.state.inputText = this.state.inputText.slice(0, -1);
      console.log('  → inputText AFTER slice:', JSON.stringify(this.state.inputText));
      
      this.state.tEntered = false;

      if (this.state.endSequence.length) {
        this.state.endSequence = this.state.endSequence.slice(0, -1);
      }

      if (this.state.inputText.length <= this.state.promptBaseText.length) {
        this.state.endSequence = '';
      }

      // ALWAYS update visual prompt text
      console.log('  → Calling _setPromptText with:', JSON.stringify(this.state.inputText));
      this._setPromptText(this.state.inputText);

      if (this.state.hiddenInput) {
        this.state.hiddenInput.value = '';
        console.log('  → hiddenInput cleared');
      }
    } else {
      console.log('  ⚠️ NO EXTRA TEXT - not removing character');
    }

    // After glitch has started, restore ONE letter at a time
    if (this.state.celliGlitchStarted || this.state.burstAnimStarted) {
      // Check if there are more letters to restore
      const maxLetters = Array.isArray(this.state.lettersToRestore) ? this.state.lettersToRestore.length : 4;
      
      if (this.state.restoredLetters < maxLetters) {
        console.log('✅ Restoring one letter, current count:', this.state.restoredLetters);
        this._restoreOneLetter();
      } else {
        console.log('⚠️ All letters already restored');
      }
    } else {
      console.log('⚠️ Glitch not started yet, cannot restore');
    }

    return true;
  }

  _restoreOneLetter() {
    const letterIndex = this.state.restoredLetters;
    const letterKey = this.state.lettersToRestore[letterIndex];
    
    if (!letterKey) {
      console.log('⚠️ No letter to restore at index', letterIndex);
      return;
    }

    console.log(`🔤 Restoring letter: ${letterKey} (index ${letterIndex})`);
    
    // Restore voxels for this letter
    const letterVoxels = this.state.letterVoxels[letterKey];
    if (letterVoxels && letterVoxels.length) {
      letterVoxels.forEach((voxel, idx) => {
        const data = voxel.userData;
        if (!data) return;
        
        // Mark for restoration
        data.restorePending = true;
        data.restoreStartTime = this.state.totalTime + idx * 0.015; // Stagger slightly
        data.restoreDelay = 0.3 + Math.random() * 0.15;
        
        // Reset rain state
        data.rainActive = false;
        data.burstActive = false;
        data.glitched = false;
      });
    }
    
    // Restore the corresponding DOM letter in doorway SVG
    this._restoreDoorwayLetter(letterKey, letterIndex);
    
    // Increment count
    this.state.restoredLetters++;
    
    // Play restoration sound
    this._playRestoreChime();
  }

  _restoreDoorwayLetter(letterKey, letterIndex) {
    // Map letter keys to DOM IDs
    const letterMap = {
      'C': 'svg-letter-c',
      'E': 'svg-letter-e',
      'L1': 'svg-letter-l1',
      'L2': 'svg-letter-l2',
      'I': 'svg-letter-i'
    };
    
    const letterId = letterMap[letterKey];
    if (!letterId) {
      console.warn('⚠️ Unknown letter key:', letterKey);
      return;
    }
    
    // Restore the letter in doorway
    const letterEl = document.getElementById(letterId);
    if (letterEl) {
      letterEl.style.opacity = '1';
      letterEl.style.transition = 'opacity 0.4s ease-out';
      console.log(`✅ Restored DOM letter: ${letterKey}`);
    } else {
      console.warn(`⚠️ Letter element not found: ${letterId}`);
    }
    
    // Special case: restore bow with C letter (first restoration)
    if (letterKey === 'C') {
      const bow = document.getElementById('svg-bow');
      if (bow) {
        bow.style.opacity = '1';
        bow.style.transition = 'opacity 0.4s ease-out';
        console.log('🎀 Restored bow with C letter');
      } else {
        console.warn('⚠️ Bow element not found');
      }
    }
  }

  _playRestoreChime() {
    if (!this.state.audioCtx) return;
    
    try {
      const now = this.state.audioCtx.currentTime;
      const osc = this.state.audioCtx.createOscillator();
      const gain = this.state.audioCtx.createGain();
      
      // Melodic chime (C major chord notes)
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      const noteIndex = this.state.restoredLetters % notes.length;
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(notes[noteIndex], now);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      
      osc.connect(gain);
      gain.connect(this.state.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {
      console.warn('Restore chime sound failed:', e);
    }
  }

  _handleTInput() {
    if (!this.state.celliGlitchStarted) {
      this._triggerCelliGlitchRain();
    }

    if (this.state.tEntered) {
      return;
    }

    const { sanitizedSuffix, matchLength, baseWord, fullLength } = this._getStartMatchInfo();
    const expectedPrefix = baseWord.slice(0, baseWord.length - 1);

    if (
      sanitizedSuffix !== expectedPrefix ||
      matchLength !== expectedPrefix.length ||
      fullLength !== expectedPrefix.length
    ) {
      return;
    }

    this.state.tEntered = true;

    this.state.inputText = `${this.state.promptBaseText}${baseWord}`;

    this._setPromptText(this.state.inputText);

    this._triggerVoxelWorldRedirect();

    this.state.doorwayInputActive = false;
    this.state.doorwayInputRequiresClick = true;
    this._deactivateHiddenInput();

    console.log('✨ T entered - triggering burst animation');

    if (!this.state.burstAnimStarted) {
      this.state.burstAnimStarted = true;
      this._startBurstAnimation();
    }
  }

  _triggerVoxelWorldRedirect() {
    if (this.state.voxelRedirectDispatched) {
      return;
    }

    const suffix = (this.state.inputText || '').slice(this.state.promptBaseText.length).toUpperCase();
    if (suffix !== 'START') {
      return;
    }

    this.state.voxelRedirectDispatched = true;

    try {
      const modeGetter = typeof window.getCelliSceneMode === 'function' ? window.getCelliSceneMode : null;
      const mode = modeGetter ? modeGetter() : undefined;
      window.dispatchEvent(new CustomEvent('celli:launchVoxelWorld', {
        detail: { mode }
      }));
    } catch (error) {
      console.warn('⚠️ Failed to dispatch voxel world launch event:', error);
      this.state.voxelRedirectDispatched = false;
    }
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
    if (Array.isArray(this.state.pendingEndKeys)) {
      this.state.pendingEndKeys.length = 0;
    }
    this.state.voxelRedirectDispatched = false;
    this.state.celliBackspaceSequenceStarted = false;
    this.state.celliBackspaceSequenceTime = 0;
    this.state.celliBackspaceTarget = 0;

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
      data.hellDropPhase = null;
      data.hellRespawnAt = 0;
      data.hellReturnVelocity = 0;

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

    // Kill referrer overlay to prevent it from showing over intro
    console.log('🎬 IntroScene init - killing referrer overlay');
    if (typeof window.killReferrerOverlay === 'function') {
      window.killReferrerOverlay();
    }

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
    
    // Check if construction is complete to determine if subtitle should show
    const constructionComplete = this._readConstructionCompletionFlag();
    this.state.showSubtitle = constructionComplete;
    
    // Create subtitle voxels if construction is complete (theme2)
    const voxelGeo = new THREE.BoxGeometry(this.voxelSize * 0.95, this.voxelSize * 0.95, this.voxelSize * 0.15);
    const edgesGeo = new THREE.EdgesGeometry(voxelGeo);
    const subtitleVoxels = constructionComplete ? this._createSubtitleVoxels(scene, voxelGeo, edgesGeo) : [];
    
    // Store geometries for mask spawning
    this.state.voxelGeo = voxelGeo;
    this.state.edgesGeo = edgesGeo;
    
    // Post-processing
    const { composer, bloomPass, afterimagePass, filmPass } = this._createPostProcessing(renderer, scene, camera);
    
    // Store circle geometry for morphing
    const circleGeoTarget = new THREE.CircleGeometry(0.16, 64);
    
    // Initialize raycaster for red square hover detection
    const raycaster = new THREE.Raycaster();
    
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
    this.state.subtitleVoxels = subtitleVoxels;
    this.state.raycaster = raycaster;
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
              geometryType: 'flat',
              hellDropPhase: null,
              hellRespawnAt: 0,
              hellReturnVelocity: 0
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

  _createSubtitleVoxels(scene, voxelGeo, edgesGeo) {
    const subtitle = "A DIVINE COMEDY IN III+ ACTS";
    const subtitleVoxels = [];
    this.state.iVoxels = [[], [], []];
    this.state.iCenters = [null, null, null];
    this.state.clickedMasks = { 0: false, 1: false, 2: false };
    if (Array.isArray(this.state.iClickTargets)) {
      this.state.iClickTargets.forEach(target => {
        if (!target) return;
        if (target.parent) {
          target.parent.remove(target);
        }
        if (target.geometry) target.geometry.dispose();
        if (target.material) target.material.dispose();
      });
    }
    this.state.iClickTargets = [null, null, null];
    const compactVoxelSize = this.voxelSize * 0.32; // Even smaller voxels for subtitle
    const compactScale = 0.32;
    const letterSpacing = compactVoxelSize * 5.5; // Spacing between letters (one block apart)
    const iiSpacing = compactVoxelSize * 3.8; // Tighter spacing for consecutive I's
    let iiiCounter = 0; // Track which I in "III+" we're on
    
    // Calculate total width (accounting for reduced spacing between consecutive I's)
    let totalWidth = 0;
    for (let i = 0; i < subtitle.length; i++) {
      const char = subtitle[i];
      const nextChar = i + 1 < subtitle.length ? subtitle[i + 1] : null;
      if (char === 'I' && nextChar === 'I') {
        totalWidth += iiSpacing;
      } else {
        totalWidth += letterSpacing;
      }
    }
    const startX = -totalWidth / 2;
    const startY = -0.20; // Further below CELLI letters (CELLI is centered at ~0.35)
    
    let currentX = startX;
    
    for (let i = 0; i < subtitle.length; i++) {
      const char = subtitle[i];
      const pattern = COMPACT_LETTER_PATTERNS[char];
      
      // Add red square between E and D in "COMEDY" (center row)
      if (subtitle.slice(i, i + 6) === 'COMEDY' && subtitle[i] === 'C') {
        // Between E (i+3) and D (i+4), add red square - calculate based on C position
        // C is at currentX, O at +1, M at +2, E at +3, D at +4
        const redSquareX = currentX + letterSpacing * 3.4; // Slightly to the right of E
        const redSquareY = startY; // Center row
        
        const redMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(0xff0000), // Red
          transparent: true,
          opacity: 0,
          blending: THREE.NormalBlending,
          side: THREE.FrontSide
        });
        const redEdgeMat = new THREE.LineBasicMaterial({
          color: new THREE.Color(0xff4444),
          transparent: true,
          opacity: 0,
          linewidth: 1
        });
        
        const redVoxel = new THREE.Mesh(voxelGeo.clone(), redMat);
        const redEdges = new THREE.LineSegments(edgesGeo.clone(), redEdgeMat);
        redVoxel.add(redEdges);
        
        redVoxel.userData = {
          targetX: redSquareX,
          targetY: redSquareY,
          startY: redSquareY + 1.2 + Math.random() * 0.4,
          dropDelay: 5.5 + (i + 3) * 0.05 + 0.025, // i+3 is position of E
          dropSpeed: 0.018 + Math.random() * 0.006,
          settled: false,
          jigglePhase: Math.random() * Math.PI * 2,
          flickerPhase: Math.random() * Math.PI * 2,
          edges: redEdges,
          baseScale: compactScale,
          baseColor: new THREE.Color(0xaa0000),
          glowColor: new THREE.Color(0xff0000),
          edgesBaseColor: new THREE.Color(0xcc0000),
          edgesGlowColor: new THREE.Color(0xff4444),
          isRedSquare: true
        };
        
        redVoxel.scale.set(compactScale, compactScale, compactScale);
        redVoxel.position.set(redSquareX, redVoxel.userData.startY, -0.001);
        redVoxel.visible = false;
        scene.add(redVoxel);
        subtitleVoxels.push(redVoxel);
        
        // Store reference for hover detection
        this.state.redSquareVoxel = redVoxel;
      }
      
      if (!pattern) {
        currentX += letterSpacing;
        continue;
      }
      
      // Check if this is an I in "III+" (positions 19, 20, 21 in the string)
      const isIInIII = char === 'I' && i >= 19 && i <= 21;
      
      pattern.forEach((row, rowIdx) => {
        row.forEach((cell, colIdx) => {
          if (cell === 1) {
            // Check if this is E and if it's the top or bottom middle square
            const isE = char === 'E';
            const isMiddleColumn = colIdx === 1; // Middle column in 3-column pattern
            const isTopRow = rowIdx === 0;
            const isBottomRow = rowIdx === 4;
            const isDarkerSquare = isE && isMiddleColumn && (isTopRow || isBottomRow);
            
            const baseColor = isDarkerSquare ? new THREE.Color(0x1a1f2a) : COLOR_THEMES.white.base.clone();
            const edgeBaseColor = isDarkerSquare ? new THREE.Color(0x2a3342) : COLOR_THEMES.white.edgeBase.clone();
            
            const mat = new THREE.MeshBasicMaterial({
              color: baseColor,
              transparent: true,
              opacity: 0,
              blending: THREE.NormalBlending,
              side: THREE.FrontSide
            });
            const edgeMat = new THREE.LineBasicMaterial({
              color: edgeBaseColor,
              transparent: true,
              opacity: 0,
              linewidth: 1
            });
            
            const voxel = new THREE.Mesh(voxelGeo.clone(), mat);
            const edges = new THREE.LineSegments(edgesGeo.clone(), edgeMat);
            voxel.add(edges);
            
            // Calculate center offset based on pattern width
            const patternWidth = pattern[0].length;
            const centerOffset = (patternWidth - 1) / 2;
            
            const x = currentX + (colIdx - centerOffset) * compactVoxelSize * 1.3;
            const y = startY + (2 - rowIdx) * compactVoxelSize * 1.3;
            
            const glowColor = isDarkerSquare ? new THREE.Color(0x3a4557) : COLOR_THEMES.white.glow.clone();
            const edgesGlowColor = isDarkerSquare ? new THREE.Color(0x4a5567) : COLOR_THEMES.white.edgeGlow.clone();
            
            voxel.userData = {
              targetX: x,
              targetY: y,
              startY: y + 1.2 + Math.random() * 0.4,
              dropDelay: 5.5 + i * 0.05 + (rowIdx * colIdx) * 0.01, // Start after CELLI finishes spawning (~5.5s)
              dropSpeed: 0.018 + Math.random() * 0.006,
              settled: false,
              jigglePhase: Math.random() * Math.PI * 2,
              flickerPhase: Math.random() * Math.PI * 2,
              edges: edges,
              baseScale: compactScale,
              baseColor: baseColor,
              glowColor: glowColor,
              edgesBaseColor: edgeBaseColor,
              edgesGlowColor: edgesGlowColor,
              isDarkerSquare: isDarkerSquare,
              isClickableI: isIInIII,
              iIndex: isIInIII ? iiiCounter : -1 // Which I in III+ (0, 1, or 2)
            };
            
            voxel.scale.set(compactScale, compactScale, compactScale);
            voxel.position.set(x, voxel.userData.startY, -0.001);
            voxel.visible = false;
            scene.add(voxel);
            subtitleVoxels.push(voxel);
            
            // Store ALL voxels of each I letter for click detection
            if (isIInIII) {
              this.state.iVoxels[iiiCounter].push(voxel);
            }
          }
        });
      });
      
      // Increment iiiCounter after processing each I in "III+"
      if (isIInIII) {
        const voxelsForI = this.state.iVoxels[iiiCounter];
        if (voxelsForI && voxelsForI.length) {
          const sumX = voxelsForI.reduce((acc, voxel) => {
            const targetX = voxel?.userData?.targetX;
            const positionX = voxel?.position?.x;
            if (typeof targetX === 'number' && !Number.isNaN(targetX)) {
              return acc + targetX;
            }
            if (typeof positionX === 'number' && !Number.isNaN(positionX)) {
              return acc + positionX;
            }
            return acc;
          }, 0);
          this.state.iCenters[iiiCounter] = sumX / voxelsForI.length;

          const bounds = new THREE.Box3();
          const scratch = new THREE.Vector3();
          voxelsForI.forEach(voxel => {
            const vData = voxel?.userData || {};
            const vx = typeof vData.targetX === 'number' ? vData.targetX : voxel.position.x;
            const vy = typeof vData.targetY === 'number' ? vData.targetY : voxel.position.y;
            bounds.expandByPoint(scratch.set(vx, vy, 0));
          });

          const width = Math.max(bounds.max.x - bounds.min.x, compactVoxelSize * 1.8) + compactVoxelSize * 1.2;
          const height = Math.max(bounds.max.y - bounds.min.y, compactVoxelSize * 4.2) + compactVoxelSize * 1.2;
          const centerX = (bounds.max.x + bounds.min.x) / 2;
          const centerY = (bounds.max.y + bounds.min.y) / 2;

          const clickGeo = new THREE.PlaneGeometry(width, height);
          const clickMat = new THREE.MeshBasicMaterial({
            color: COLOR_THEMES.white.base.clone(),
            transparent: true,
            opacity: 0,
            depthWrite: false
          });
          clickMat.depthTest = false;
          clickMat.colorWrite = false;

          const clickTarget = new THREE.Mesh(clickGeo, clickMat);
          clickTarget.position.set(centerX, centerY, 0.05);
          clickTarget.visible = true;
          clickTarget.userData = {
            iIndex: iiiCounter,
            isClickableI: true,
            isIClickTarget: true
          };
          clickTarget.renderOrder = -10;

          scene.add(clickTarget);
          this.state.iClickTargets[iiiCounter] = clickTarget;
        } else {
          this.state.iCenters[iiiCounter] = currentX;
          this.state.iClickTargets[iiiCounter] = null;
        }
        console.log(`🔤 Processed I #${iiiCounter} with ${this.state.iVoxels[iiiCounter].length} voxels`);
        iiiCounter++;
      }
      
      // Reduce spacing between consecutive I's in "III"
      const nextChar = i + 1 < subtitle.length ? subtitle[i + 1] : null;
      if (char === 'I' && nextChar === 'I') {
        currentX += compactVoxelSize * 3.8; // Much tighter spacing for I-I
      } else {
        currentX += letterSpacing;
      }
    }
    
    return subtitleVoxels;
  }

  _spawnMaskVoxels(scene, voxelGeo, edgesGeo, maskType, iIndex) {
    const pattern = MASK_PATTERNS[maskType];
    if (!pattern) return;

    const maskVoxels = [];
    const compactVoxelSize = this.voxelSize * 0.32;
    const compactScale = 0.32;
    const patternWidth = pattern[0]?.length || 0;
    const patternHeight = pattern.length;

    let minActiveCol = patternWidth;
    let maxActiveCol = -1;
    let minActiveRow = patternHeight;
    let maxActiveRow = -1;
    pattern.forEach((row, rowIdx) => {
      row.forEach((cell, colIdx) => {
        if (cell === 1) {
          if (colIdx < minActiveCol) minActiveCol = colIdx;
          if (colIdx > maxActiveCol) maxActiveCol = colIdx;
          if (rowIdx < minActiveRow) minActiveRow = rowIdx;
          if (rowIdx > maxActiveRow) maxActiveRow = rowIdx;
        }
      });
    });

    if (maxActiveCol < minActiveCol) {
      minActiveCol = 0;
      maxActiveCol = Math.max(patternWidth - 1, 0);
    }
    if (maxActiveRow < minActiveRow) {
      minActiveRow = 0;
      maxActiveRow = Math.max(patternHeight - 1, 0);
    }

    const activeWidth = maxActiveCol - minActiveCol + 1;
    const activeHeight = maxActiveRow - minActiveRow + 1;
    const activeCenterX = minActiveCol + (activeWidth - 1) / 2;
    const activeCenterY = minActiveRow + (activeHeight - 1) / 2;

    // Position between CELLI (y ~0.35) and subtitle (y ~-0.20)
    const maskY = 0.05;
    let maskX = 0; // Default center
    if (typeof iIndex === 'number' && iIndex >= 0) {
      const centers = this.state.iCenters || [];
      const center = centers[iIndex];
      if (typeof center === 'number' && !Number.isNaN(center)) {
        maskX = center;
      }

      // Slightly offset each mask horizontally so they align with their I
      const maskOffsets = [
        -compactVoxelSize * activeWidth * 0.55,
        0,
        compactVoxelSize * activeWidth * 0.45
      ];
      if (iIndex < maskOffsets.length) {
        maskX += maskOffsets[iIndex];
      }
    }

    pattern.forEach((row, rowIdx) => {
      row.forEach((cell, colIdx) => {
        if (cell === 1) {
          const baseColor = COLOR_THEMES.white.base.clone();
          const edgeBaseColor = COLOR_THEMES.white.edgeBase.clone();

          const mat = new THREE.MeshBasicMaterial({
            color: baseColor,
            transparent: true,
            opacity: 0,
            blending: THREE.NormalBlending,
            side: THREE.FrontSide
          });
          const edgeMat = new THREE.LineBasicMaterial({
            color: edgeBaseColor,
            transparent: true,
            opacity: 0,
            linewidth: 1
          });
          
          const voxel = new THREE.Mesh(voxelGeo.clone(), mat);
          const edges = new THREE.LineSegments(edgesGeo.clone(), edgeMat);
          voxel.add(edges);

          // Center the pattern
          const centerOffsetX = activeCenterX;
          const centerOffsetY = activeCenterY;

          const x = maskX + (colIdx - centerOffsetX) * compactVoxelSize * 1.3;
          const y = maskY + (centerOffsetY - rowIdx) * compactVoxelSize * 1.3;

          const glowColor = COLOR_THEMES.white.glow.clone();
          const edgesGlowColor = COLOR_THEMES.white.edgeGlow.clone();
          
          voxel.userData = {
            targetX: x,
            targetY: y,
            startY: y + 1.5 + Math.random() * 0.5, // Drop from higher
            dropDelay: 0.1 + (rowIdx * patternWidth + colIdx) * 0.025, // Stagger drop
            dropSpeed: 0.022 + Math.random() * 0.008,
            settled: false,
            jigglePhase: Math.random() * Math.PI * 2,
            flickerPhase: Math.random() * Math.PI * 2,
            edges: edges,
            baseScale: compactScale,
            baseColor: baseColor,
            glowColor: glowColor,
            edgesBaseColor: edgeBaseColor,
            edgesGlowColor: edgesGlowColor,
            isMask: true,
            maskType: maskType,
            maskIIndex: iIndex,
            spawnTime: this.state.totalTime || 0 // Track when mask was spawned
          };
          
          voxel.scale.set(compactScale, compactScale, compactScale);
          voxel.position.set(x, voxel.userData.startY, 0.1); // Slightly forward
          voxel.visible = true;
          scene.add(voxel);
          maskVoxels.push(voxel);
          this.state.maskVoxels.push(voxel);
        }
      });
    });
    
    return maskVoxels;
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
    const palette = COLOR_THEMES[theme];
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

  _computePatternPositions(pattern, letterIndex, totalLetters, spacing, offsetY = 0, includeMeta = false) {
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
        if (includeMeta) {
          positions.push({ x, y, row: rowIdx, col: colIdx });
        } else {
          positions.push({ x, y });
        }
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

  _assignHellTargetsToH(positions) {
    if (!positions || !positions.length) {
      return;
    }

    const cPool = [...(this.state.letterVoxels.C || [])];
    const iPool = [...(this.state.letterVoxels.I || [])];

    if (!cPool.length && !iPool.length) {
      return;
    }

    const assigned = new Set();

    const takeVoxel = (pool, predicate) => {
      if (!pool.length) return null;
      if (typeof predicate === 'function') {
        const idx = pool.findIndex(predicate);
        if (idx !== -1) {
          return pool.splice(idx, 1)[0];
        }
      }
      return pool.shift();
    };

    const activateVoxelForHell = (voxel, pos) => {
      if (!voxel || !voxel.userData) {
        return;
      }

      const data = voxel.userData;
      const target = { x: pos.x, y: pos.y };

      voxel.visible = true;
      data.hellStart = { x: voxel.position.x, y: voxel.position.y };
      data.hellTarget = target;
      data.hellStartScale = voxel.scale.x;
      data.hellTargetScale = data.baseScale;
      data.targetX = target.x;
      data.targetY = target.y;
      data.settled = false;
      data.hellRespawnAt = 0;
      data.hellReturnVelocity = 0;

      const isOriginalCVertical = data.letterIdx === 0 && data.gridCol === 0;

      if (!isOriginalCVertical) {
        data.hellDrop = true;
        data.hellDropPhase = 'fall';
        data.dropVelocity = -0.025 - Math.random() * 0.02;
      } else {
        data.hellDrop = false;
        data.hellDropPhase = null;
      }
    };

    const leftPositions = positions
      .filter(pos => pos.col === 0)
      .sort((a, b) => a.row - b.row);

    leftPositions.forEach(pos => {
      let voxel = takeVoxel(cPool, v => v.userData.gridCol === 0 && v.userData.gridRow === pos.row);
      if (!voxel) voxel = takeVoxel(cPool, v => v.userData.gridCol === 0);
      if (!voxel) voxel = takeVoxel(iPool, v => v.userData.gridCol === 2 && v.userData.gridRow === pos.row);
      if (!voxel) voxel = takeVoxel(iPool, v => v.userData.gridCol === 2);
      if (!voxel) voxel = takeVoxel(iPool);
      if (!voxel) voxel = takeVoxel(cPool);

      if (voxel) {
        activateVoxelForHell(voxel, pos);
        assigned.add(pos);
      }
    });

    const crossPositions = positions
      .filter(pos => pos.row === 2 && pos.col > 0 && pos.col < 4)
      .sort((a, b) => a.col - b.col);

    crossPositions.forEach(pos => {
      let voxel = takeVoxel(cPool, v => v.userData.gridRow === 0 && v.userData.gridCol === pos.col);
      if (!voxel) voxel = takeVoxel(cPool, v => v.userData.gridRow === 4 && v.userData.gridCol === pos.col);
      if (!voxel) voxel = takeVoxel(cPool);
      if (!voxel) voxel = takeVoxel(iPool, v => v.userData.gridRow === 2);
      if (!voxel) voxel = takeVoxel(iPool);
      if (!voxel) voxel = takeVoxel(cPool);

      if (voxel) {
        activateVoxelForHell(voxel, pos);
        assigned.add(pos);
      }
    });

    const rightPositions = positions
      .filter(pos => pos.col === 4)
      .sort((a, b) => a.row - b.row);

    rightPositions.forEach(pos => {
      let voxel = takeVoxel(iPool, v => v.userData.gridCol === 2 && v.userData.gridRow === pos.row);
      if (!voxel) voxel = takeVoxel(iPool, v => v.userData.gridRow === pos.row);
      if (!voxel) voxel = takeVoxel(iPool);
      if (!voxel) voxel = takeVoxel(cPool);

      if (voxel) {
        activateVoxelForHell(voxel, pos);
        assigned.add(pos);
      }
    });

    positions.forEach(pos => {
      if (assigned.has(pos)) {
        return;
      }

      let voxel = takeVoxel(cPool) || takeVoxel(iPool);
      if (!voxel) {
        return;
      }

      activateVoxelForHell(voxel, pos);
      assigned.add(pos);
    });

    const markForVanish = (voxel) => {
      if (!voxel || !voxel.userData) return;
      const data = voxel.userData;
      data.hellDrop = true;
      data.hellDropPhase = 'fall';
      data.dropVelocity = -0.025 - Math.random() * 0.02;
      data.hellTarget = null;
      data.settled = false;
      data.hellRespawnAt = 0;
      data.hellReturnVelocity = 0;
    };

    cPool.forEach(markForVanish);
    iPool.forEach(markForVanish);
  }

  _startHellTransform() {
    if (this.state.hellTransformActive) {
      return;
    }

    const hellSpacing = 0.36;
    const totalLetters = 4;

    const hPositions = this._computePatternPositions(LETTER_PATTERNS.H, 0, totalLetters, hellSpacing, 0, true);
    const ePositions = this._computePatternPositions(LETTER_PATTERNS.E, 1, totalLetters, hellSpacing).map(({ x, y }) => ({ x, y }));
    const l1Positions = this._computePatternPositions(LETTER_PATTERNS.L, 2, totalLetters, hellSpacing).map(({ x, y }) => ({ x, y }));
    const l2Positions = this._computePatternPositions(LETTER_PATTERNS.L, 3, totalLetters, hellSpacing).map(({ x, y }) => ({ x, y }));

    this._assignHellTargetsToH(hPositions);

    if (this.state.letterVoxels.E) {
      this._assignHellTargets(this.state.letterVoxels.E, ePositions);
    }
    if (this.state.letterVoxels.L1) {
      this._assignHellTargets(this.state.letterVoxels.L1, l1Positions);
    }
    if (this.state.letterVoxels.L2) {
      this._assignHellTargets(this.state.letterVoxels.L2, l2Positions);
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

  _selectIntroAudioSource() {
    let storedPreference = null;
    try {
      storedPreference = window.localStorage?.getItem(INTRO_THEME_STORAGE_KEY) || null;
    } catch (error) {
      console.warn('⚠️ Unable to read intro theme preference:', error);
      storedPreference = null;
    }

    const hasStoredTheme = storedPreference === INTRO_THEME_DEFAULT || storedPreference === INTRO_THEME_SECONDARY;
    let theme = hasStoredTheme ? storedPreference : INTRO_THEME_DEFAULT;

    if (!hasStoredTheme) {
      const constructionComplete = this._readConstructionCompletionFlag();
      if (constructionComplete) {
        theme = INTRO_THEME_SECONDARY;
      }
      this.state.introAudioShouldAutoFlip = !constructionComplete;
    } else {
      this.state.introAudioShouldAutoFlip = false;
    }

    if (theme !== INTRO_THEME_DEFAULT && theme !== INTRO_THEME_SECONDARY) {
      theme = INTRO_THEME_DEFAULT;
    }

    this.state.introAudioTheme = theme;
    const source = INTRO_THEME_SOURCES[theme] || INTRO_THEME_SOURCES[INTRO_THEME_DEFAULT];
    this.state.introAudioSource = source;
    return { theme, source };
  }

  async _setupIntroAudio() {
    if (!this.state.audioCtx) {
      this._initAudio();
    }

    if (!this.state.audioCtx) {
      return null;
    }

    const selection = this._selectIntroAudioSource();
    if (!selection || !selection.source) {
      return null;
    }

    const { theme, source } = selection;
    const buffer = await this._loadIntroAudioBuffer(theme, source);
    if (!buffer) {
      return null;
    }

    return { theme, buffer };
  }

  async _playIntroAudio() {
    const setup = await this._setupIntroAudio();
    if (!setup) {
      return;
    }

    const { theme, buffer } = setup;

    this._stopIntroAudioPlayback();

    let playbackBuffer = buffer;
    this.state.introAudioPlayCount = (this.state.introAudioPlayCount || 0) + 1;
    const playCount = this.state.introAudioPlayCount;
    const shouldReverse = playCount % 3 === 0;

    if (shouldReverse) {
      playbackBuffer = this._getReversedIntroAudioBuffer(theme, buffer);
    }

    try {
      const sourceNode = this.state.audioCtx.createBufferSource();
      sourceNode.buffer = playbackBuffer;

      const gainNode = this.state.audioCtx.createGain();
      gainNode.gain.value = 0.7;

      sourceNode.connect(gainNode);
      gainNode.connect(this.state.audioCtx.destination);

      sourceNode.onended = () => {
        this.state.introAudioCurrentSource = null;
        if (this.state.introAudioGainNode) {
          try {
            this.state.introAudioGainNode.disconnect();
          } catch (error) {
            console.warn('⚠️ Failed to disconnect intro audio gain node:', error);
          }
          this.state.introAudioGainNode = null;
        }

        if (this.state.running) {
          this._scheduleNextIntroAudioPlayback();
        }
      };

      this.state.introAudioCurrentSource = sourceNode;
      this.state.introAudioGainNode = gainNode;

      sourceNode.start(0);

      if (this.state.introAudioShouldAutoFlip) {
        try {
          window.localStorage?.setItem(INTRO_THEME_STORAGE_KEY, INTRO_THEME_SECONDARY);
        } catch (error) {
          console.warn('⚠️ Unable to persist intro theme auto-flip preference:', error);
        }
        this.state.introAudioShouldAutoFlip = false;
      }
    } catch (error) {
      console.warn('⚠️ Failed to start intro audio playback:', error);
    }
  }

  _readConstructionCompletionFlag() {
    if (this.state.constructionPersisted) {
      return true;
    }

    try {
      return window.localStorage?.getItem(CONSTRUCTION_STORAGE_KEY) === 'true';
    } catch (error) {
      console.warn('⚠️ Unable to read construction completion flag:', error);
      return false;
    }
  }

  async _loadIntroAudioBuffer(theme, source) {
    if (!this.state.audioCtx || !source) {
      return null;
    }

    if (this.state.introAudioBuffers?.[theme]) {
      return this.state.introAudioBuffers[theme];
    }

    if (!this.state.introAudioLoadingPromises) {
      this.state.introAudioLoadingPromises = {};
    }

    if (!this.state.introAudioLoadingPromises[theme]) {
      this.state.introAudioLoadingPromises[theme] = fetch(source)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch intro audio source ${source} (${response.status})`);
          }
          return response.arrayBuffer();
        })
        .then(data => new Promise((resolve, reject) => {
          this.state.audioCtx.decodeAudioData(data, resolve, reject);
        }))
        .then(buffer => {
          this.state.introAudioBuffers[theme] = buffer;
          return buffer;
        })
        .catch(error => {
          console.warn(`⚠️ Unable to load intro audio buffer for ${theme}:`, error);
          return null;
        })
        .finally(() => {
          delete this.state.introAudioLoadingPromises[theme];
        });
    }

    return this.state.introAudioLoadingPromises[theme];
  }

  _getReversedIntroAudioBuffer(theme, buffer) {
    if (!this.state.audioCtx || !buffer) {
      return buffer;
    }

    if (!this.state.introAudioReverseBuffers) {
      this.state.introAudioReverseBuffers = {};
    }

    if (this.state.introAudioReverseBuffers[theme]) {
      return this.state.introAudioReverseBuffers[theme];
    }

    const reversed = this.state.audioCtx.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);

    for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
      const original = buffer.getChannelData(channel);
      const target = reversed.getChannelData(channel);
      const length = original.length;

      for (let i = 0; i < length; i += 1) {
        target[i] = original[length - 1 - i];
      }
    }

    this.state.introAudioReverseBuffers[theme] = reversed;
    return reversed;
  }

  _scheduleNextIntroAudioPlayback() {
    if (this.state.introAudioLoopTimeout) {
      clearTimeout(this.state.introAudioLoopTimeout);
      this.state.introAudioLoopTimeout = null;
    }

    if (!this.state.running || this.state.introAudioLoopScheduled) {
      return;
    }

    this.state.introAudioLoopScheduled = true;
    this.state.introAudioLoopTimeout = window.setTimeout(() => {
      this.state.introAudioLoopTimeout = null;
      this.state.introAudioLoopScheduled = false;

      if (!this.state.running || this.state.introAudioCurrentSource) {
        return;
      }

      this._playIntroAudio().catch(error => {
        console.warn('⚠️ Failed to start intro audio loop playback:', error);
      });
    }, INTRO_AUDIO_LOOP_DELAY_MS);
  }

  _stopIntroAudioPlayback() {
    if (this.state.introAudioLoopTimeout) {
      clearTimeout(this.state.introAudioLoopTimeout);
      this.state.introAudioLoopTimeout = null;
    }
    this.state.introAudioLoopScheduled = false;

    const currentSource = this.state.introAudioCurrentSource;
    if (currentSource) {
      try {
        currentSource.onended = null;
      } catch (error) {
        console.warn('⚠️ Failed to clear intro audio onended callback:', error);
      }

      try {
        const stopAt = this.state.audioCtx ? this.state.audioCtx.currentTime : 0;
        currentSource.stop(stopAt);
      } catch (error) {
        console.warn('⚠️ Failed to stop intro audio source:', error);
      }
      try {
        currentSource.disconnect();
      } catch (error) {
        console.warn('⚠️ Failed to disconnect intro audio source:', error);
      }
      this.state.introAudioCurrentSource = null;
    }

    const gainNode = this.state.introAudioGainNode;
    if (gainNode) {
      try {
        const now = this.state.audioCtx ? this.state.audioCtx.currentTime : 0;
        if (gainNode.gain && typeof gainNode.gain.cancelScheduledValues === 'function') {
          gainNode.gain.cancelScheduledValues(now);
        }
        if (gainNode.gain && typeof gainNode.gain.setTargetAtTime === 'function') {
          gainNode.gain.setTargetAtTime(0, now, 0.05);
        }
      } catch (error) {
        console.warn('⚠️ Failed to cancel intro audio gain automation:', error);
      }

      try {
        gainNode.disconnect();
      } catch (error) {
        console.warn('⚠️ Failed to disconnect intro audio gain node during stop:', error);
      }
      this.state.introAudioGainNode = null;
    }
  }

  /**
   * Setup event listeners
   */
  _setupEventListeners() {
    // Click handler for text particles and I voxel clicks
    this._clickHandler = (e) => {
      if (!this.state.running) return;
      
      // Convert screen to world coordinates
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      
      // Check if clicking on an I voxel (flatten all I voxel arrays)
      const rawIVoxels = Array.isArray(this.state.iVoxels) ? this.state.iVoxels.flat() : [];
      const allIVoxels = rawIVoxels.filter(v => v && v.visible);
      const clickTargets = Array.isArray(this.state.iClickTargets)
        ? this.state.iClickTargets.filter(target => target && target.visible !== false && !target.userData?.disabled)
        : [];
      const clickableObjects = [...allIVoxels, ...clickTargets];
      const iClickDebug = [
        `🖱️ Click detected - ${allIVoxels.length} clickable I voxels available`,
        `${clickTargets.length} extended targets`
      ].join(', ');
      console.log(iClickDebug);

      if (this.state.raycaster && clickableObjects.length > 0) {
        this.state.mouse.set(x, y);
        this.state.raycaster.setFromCamera(this.state.mouse, this.state.camera);

        // Try raycasting with recursive search for child meshes
        const intersects = this.state.raycaster.intersectObjects(clickableObjects, true);
        console.log(`  → ${intersects.length} intersections found`);
        let clickedVoxel = null;
        let iIndex = undefined;

        for (const intersect of intersects) {
          let current = intersect.object;
          while (current) {
            const data = current.userData || {};
            if (data.disabled) {
              current = current.parent;
              continue;
            }
            if (typeof data.iIndex === 'number' && data.iIndex >= 0) {
              clickedVoxel = current;
              iIndex = data.iIndex;
              break;
            }
            if (typeof data.maskIIndex === 'number' && data.maskIIndex >= 0) {
              clickedVoxel = current;
              iIndex = data.maskIIndex;
              break;
            }
            current = current.parent;
          }
          if (typeof iIndex === 'number') {
            break;
          }
        }

        if (typeof iIndex === 'number') {
          console.log(`  → Clicked object: ${clickedVoxel?.name || 'unnamed'}`);
          console.log(`  → Found iIndex: ${iIndex}, already clicked: ${this.state.clickedMasks[iIndex]}`);

          if (iIndex >= 0 && iIndex <= 2 && !this.state.clickedMasks[iIndex]) {
            console.log(`🎭 Clicked I #${iIndex} - spawning mask!`);
            this.state.clickedMasks[iIndex] = true;

            const target = this.state.iClickTargets?.[iIndex];
            if (target) {
              target.userData.disabled = true;
              target.visible = false;
              if (target.parent) {
                target.parent.remove(target);
              }
              if (target.geometry) target.geometry.dispose();
              if (target.material) target.material.dispose();
              this.state.iClickTargets[iIndex] = null;
            }

            // Spawn appropriate mask
            const maskType = I_INDEX_MASK_MAP[iIndex];
            if (maskType) {
              this._spawnMaskVoxels(this.state.scene, this.state.voxelGeo, this.state.edgesGeo, maskType, iIndex);
            } else {
              console.warn(`⚠️ No mask mapping defined for I index ${iIndex}`);
            }
          }
          return; // Don't create text particles if clicking on I
        }
      }

      // Create text particles at click position
      this._createTextParticlesAtPosition(x, y);
    };
    document.addEventListener('click', this._clickHandler);

    // Keyboard handler for doorway input
    this._keydownHandler = (e) => {
      console.log('⌨️ KEYDOWN EVENT:', e.key);
      
      if (!this.state.running) {
        console.log('  → Not running, ignoring');
        return;
      }

      if (this.state.doorwayOpened) {
        console.log('  → Doorway opened, calling _handleDoorwayInput');
        this._handleDoorwayInput(e);
      } else {
        console.log('  → Doorway not opened yet');
      }
    };
    document.addEventListener('keydown', this._keydownHandler);

    const promptContainer = document.querySelector('.prompt-container');
    if (promptContainer) {
      this._promptClickHandler = (event) => {
        if (!this.state.running || !this.state.doorwayOpened) {
          return;
        }

        if (event && typeof event.preventDefault === 'function') {
          event.preventDefault();
        }

        // Check if CELLI animation is complete
        const allSettled = this.state.voxels.every(v => v.userData && v.userData.settled);
        if (!allSettled) {
          console.log('⏳ CELLI animation not complete, queuing click action');
          this.state.queuedActions.push({ type: 'click', event });
          return;
        }

        this.state.inputAttempted = true;

        // Only trigger glitch if not already started
        if (!this.state.celliGlitchStarted) {
          console.log('✨ All voxels settled, triggering glitch');
          this._triggerCelliGlitchRain();
        }

        this.state.doorwayInputRequiresClick = false;
        this.state.doorwayInputActive = true;
        this._focusHiddenInput();
      };

      promptContainer.addEventListener('click', this._promptClickHandler);
      promptContainer.addEventListener('touchstart', this._promptClickHandler, { passive: false });
    }

    const hiddenInput = document.getElementById('hiddenInput');
    if (hiddenInput) {
      this.state.hiddenInput = hiddenInput;

      this._hiddenBeforeInputHandler = (evt) => {
        console.log('📥 HIDDEN INPUT BEFOREINPUT EVENT:', evt.inputType);
        
        if (!this.state.running || !this.state.doorwayOpened) {
          console.log('  → Not running or doorway not opened, ignoring');
          return;
        }

        if (!this.state.doorwayInputActive) {
          console.log('  → doorwayInputActive is false, preventing default');
          if (evt && typeof evt.preventDefault === 'function') {
            evt.preventDefault();
          }
          return;
        }

        if (evt.inputType === 'deleteContentBackward') {
          console.log('  → DELETE CONTENT BACKWARD - calling _handlePromptBackspace');
          evt.preventDefault();
          this._handlePromptBackspace();
        }
      };

      this._hiddenInputHandler = (evt) => {
        if (!this.state.running || !this.state.doorwayOpened) {
          return;
        }

        if (!this.state.doorwayInputActive) {
          if (evt && evt.target) {
            evt.target.value = '';
          }
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
        this.state.skipRequested = true;
        // Skip to doorway phase
        this.state.totalTime = this.state.introCfg.celliEnd;
      };
      skipBtn.addEventListener('click', this._skipClickHandler);
    }
    
    // Mouse move handler for red square hover detection and liquid shader
    this._mouseMoveHandler = (e) => {
      if (!this.state.running) {
        return;
      }
      
      // Always update mouse position for liquid shader
      this.state.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.state.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      
      // Check for hover to start expansion
      if (this.state.raycaster && this.state.showSubtitle && this.state.redSquareVoxel) {
        const voxel = this.state.redSquareVoxel;
        
        // Debug: log status periodically (every 60 frames)
        if (!this._hoverCheckCount) this._hoverCheckCount = 0;
        this._hoverCheckCount++;
        
        if (this._hoverCheckCount % 60 === 0) {
          console.log('🔴 Red square status:', {
            visible: voxel.visible,
            settled: voxel.userData?.settled,
            expanding: this.state.redSquareExpanding,
            played: this.state.redSquareVideoPlayed,
            fading: this.state.redSquareFading,
            position: voxel.position
          });
        }
        
        const isReady = voxel.visible && 
                       voxel.userData && voxel.userData.settled &&
                       !this.state.redSquareExpanding && 
                       !this.state.redSquareVideoPlayed &&
                       !this.state.redSquareFading;
        
        if (isReady) {
          // Detect if on mobile/touch device
          const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
          
          // ONLY use raycasting - cursor must be directly on the voxel (NOT children like edges)
          this.state.raycaster.setFromCamera(this.state.mouse, this.state.camera);
          
          // Raycast ONLY the main voxel mesh, not its children (edges, etc.)
          const intersects = this.state.raycaster.intersectObject(voxel, false);
          
          if (intersects.length > 0) {
            // For mobile: use much more forgiving distance check
            // For desktop: match exact voxel dimensions
            const hitPoint = intersects[0].point;
            const voxelPos = new THREE.Vector3();
            voxel.getWorldPosition(voxelPos);
            const distance = hitPoint.distanceTo(voxelPos);
            
            // Mobile: 3x the voxel diagonal for easy tapping
            // Desktop: Exact voxel size (diagonal = sqrt(3) * VOXEL_SIZE ≈ 0.087)
            const maxDistance = isMobile 
              ? VOXEL_SIZE * Math.sqrt(3) * 3  // ~0.26 for mobile (very forgiving)
              : VOXEL_SIZE * Math.sqrt(3);      // ~0.087 for desktop (exact box dimensions)
            
            if (distance < maxDistance) {
              console.log(`🔴 Red square hovered (${isMobile ? 'mobile' : 'desktop'}, distance: ${distance.toFixed(3)}) - starting expansion`);
            this._startRedSquareExpansion();
            }
          }
        }
      }
    };
    document.addEventListener('mousemove', this._mouseMoveHandler);
    
    // Add touch support for mobile - convert touch to mouse position
    this._touchMoveHandler = (e) => {
      if (!this.state.running) return;
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        // Update mouse position from touch
        this.state.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        this.state.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
        
        // Trigger the same hover detection logic
        this._mouseMoveHandler(touch);
      }
    };
    document.addEventListener('touchmove', this._touchMoveHandler, { passive: true });
    
    // Also check on touchstart for immediate feedback
    this._touchStartHandler = (e) => {
      if (!this.state.running) return;
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        this.state.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        this.state.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
        this._mouseMoveHandler(touch);
      }
    };
    document.addEventListener('touchstart', this._touchStartHandler, { passive: true });
  }

  /**
   * Start red square expansion animation
   */
  _startRedSquareExpansion() {
    if (this.state.redSquareExpanding || this.state.redSquareVideoPlayed) {
      return;
    }
    
    this.state.redSquareExpanding = true;
    this.state.redSquareExpansionStart = performance.now();
    console.log('🔴 Starting red square expansion animation');
    
    // Ensure voxel is visible and brought to front
    this.state.redSquareVoxel.visible = true;
    this.state.redSquareVoxel.renderOrder = 999999; // Extremely high render order to render last
    
    // Store original z position
    if (!this.state.redSquareVoxel.userData.originalZ) {
      this.state.redSquareVoxel.userData.originalZ = this.state.redSquareVoxel.position.z;
    }
    
    // Move to front - camera at z:2 looking toward z:0, so use z:1.5 to be closest to camera
    this.state.redSquareVoxel.position.z = 1.5;
    console.log('🔴 Red square z-position set to 1.5 (closest to camera), renderOrder:', this.state.redSquareVoxel.renderOrder);
    
    // Replace material with liquid shader
    this._applyLiquidShader();
  }
  
  /**
   * Create and apply liquid shader to red square
   */
  _applyLiquidShader() {
    if (!this.state.redSquareVoxel) return;
    
    const liquidMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        baseColor: { value: new THREE.Color(0xff0000) },
        mousePos: { value: new THREE.Vector2(0.5, 0.5) },
        opacity: { value: 0.85 },
        expansionProgress: { value: 0.0 },
        trailPositions: { value: [] }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
      uniform float time;
      uniform vec3 baseColor;
      uniform vec2 mousePos;
      uniform float opacity;
      uniform float expansionProgress;
      varying vec2 vUv;
      varying vec3 vPosition;
        
        // Enhanced noise functions for fluid simulation
        float hash(vec2 p) {
          vec3 p3 = fract(vec3(p.xyx) * 0.13);
          p3 += dot(p3, p3.yzx + 3.333);
          return fract((p3.x + p3.y) * p3.z);
        }
        
        float noise(vec2 x) {
          vec2 i = floor(x);
          vec2 f = fract(x);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }
        
        // Fractal Brownian Motion for organic liquid movement
        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 1.0;
          for(int i = 0; i < 5; i++) {
            value += amplitude * noise(p * frequency);
            frequency *= 2.0;
            amplitude *= 0.5;
          }
          return value;
        }
        
        // Turbulent flow field
        vec2 flowField(vec2 p, float t) {
          float angle = fbm(p + vec2(t * 0.1)) * 6.28318;
          return vec2(cos(angle), sin(angle)) * 0.5;
        }
        
        void main() {
          vec2 uv = vUv;
          
          // Calculate distance and direction from mouse
          vec2 toMouse = mousePos - uv;
          float distToMouse = length(toMouse);
          vec2 dirToMouse = normalize(toMouse);
          
          // SMALLER influence area but LONGER trails
          float viscosity = smoothstep(0.15, 0.0, distToMouse); // Reduced from 0.4 to 0.15
          
          // Flowing turbulence like moving through thick liquid
          vec2 flowOffset = flowField(uv * 3.0, time * 0.3);
          vec2 turbulence = vec2(
            fbm(uv * 4.0 + flowOffset + time * 0.15),
            fbm(uv * 4.0 - flowOffset + time * 0.2)
          ) * 0.03;
          
          // Mouse wake effect - EXTENDED trails with slower decay
          float trailDecay = exp(-distToMouse * 3.0); // Reduced from 8.0 for longer trails
          float wake = trailDecay * sin(distToMouse * 35.0 - time * 2.5); // Increased frequency, slower motion
          vec2 wakeDistortion = dirToMouse * wake * 0.12 * viscosity; // Increased strength
          
          // Radial displacement - tighter but stronger in small area
          float radialPush = smoothstep(0.12, 0.0, distToMouse); // Tighter radius
          vec2 radialDisplace = -dirToMouse * radialPush * 0.08; // Stronger push
          
          // Add persistent trail effect
          float trailEffect = exp(-distToMouse * 2.0) * sin(time * 1.5 + distToMouse * 20.0);
          vec2 trailDistortion = dirToMouse * trailEffect * 0.04;
          
          // Combine all distortions for liquid-like movement with trails
          vec2 distortedUV = uv + turbulence + wakeDistortion + radialDisplace + trailDistortion;
          
          // Multi-layered color variation for depth
          float colorNoise1 = fbm(distortedUV * 5.0 + time * 0.1);
          float colorNoise2 = fbm(distortedUV * 8.0 - time * 0.15);
          float colorNoise3 = fbm(distortedUV * 12.0 + time * 0.2);
          
          // Create rich color variations
          vec3 darkColor = baseColor * 0.4;
          vec3 midColor = baseColor * 0.85;
          vec3 brightColor = baseColor * 1.4;
          
          vec3 color = mix(darkColor, midColor, colorNoise1);
          color = mix(color, brightColor, colorNoise2 * 0.6);
          
          // Swirling highlights like light refracting through liquid
          float swirl = fbm(distortedUV * 6.0 + flowOffset * 2.0 + time * 0.25);
          float highlight = pow(swirl, 3.0) * 0.7;
          color += vec3(highlight * 0.6, highlight * 0.3, highlight * 0.15);
          
          // Mouse trail glow - tighter core but extended trail
          float trailGlowCore = smoothstep(0.08, 0.0, distToMouse); // Tight core
          float trailGlowExtended = smoothstep(0.5, 0.0, distToMouse); // Extended trail
          float glowPulse = 0.5 + 0.5 * sin(time * 2.0);
          
          // Combine core and trail
          float totalGlow = trailGlowCore * 1.5 + trailGlowExtended * 0.4;
          color += vec3(
            totalGlow * (0.8 + glowPulse * 0.2),
            totalGlow * 0.4,
            totalGlow * 0.2
          );
          
          // Caustics-like effect (light patterns through liquid)
          float caustic1 = fbm(uv * 8.0 + time * 0.4);
          float caustic2 = fbm(uv * 12.0 - time * 0.5);
          float caustics = pow(max(caustic1, caustic2), 4.0) * 0.3;
          color += vec3(caustics * 0.5, caustics * 0.3, caustics * 0.1);
          
          // Edge darkening for depth
          float edgeFade = smoothstep(0.0, 0.15, min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y)));
          color *= 0.4 + 0.6 * edgeFade;
          
          // Add subtle shimmer
          float shimmer = noise(uv * 20.0 + time) * 0.1;
          color += vec3(shimmer * viscosity);
          
          // Edge gradient that fades during expansion
          float edgeDist = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
          float edgeGradient = smoothstep(0.0, 0.15, edgeDist); // Gradient from edges
          float gradientStrength = (1.0 - expansionProgress) * 0.6; // Fade out during expansion
          color = mix(color * 0.3, color, edgeGradient + gradientStrength);
          
          gl_FragColor = vec4(color, opacity);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
      depthWrite: false
    });
    
    this.state.liquidShaderMaterial = liquidMaterial;
    
    // Apply material and ensure it's set up correctly
    const oldMaterial = this.state.redSquareVoxel.material;
    this.state.redSquareVoxel.material = liquidMaterial;
    this.state.redSquareVoxel.material.needsUpdate = true;
    
    // Dispose old material
    if (oldMaterial && oldMaterial !== liquidMaterial) {
      oldMaterial.dispose();
    }
    
    console.log('🌊 Liquid shader applied, material:', {
      transparent: liquidMaterial.transparent,
      side: liquidMaterial.side,
      depthWrite: liquidMaterial.depthWrite,
      visible: this.state.redSquareVoxel.visible
    });
    
    // Remove edges during liquid effect for cleaner look
    const edges = this.state.redSquareVoxel.userData.edges;
    if (edges) {
      edges.visible = false;
    }
  }
  
  /**
   * Update red square expansion
   */
  _updateRedSquareExpansion() {
    if (!this.state.redSquareExpanding || !this.state.redSquareVoxel) {
      return;
    }
    
    const elapsed = (performance.now() - this.state.redSquareExpansionStart) / 1000;
    const progress = Math.min(elapsed / this.state.redSquareExpansionDuration, 1);
    
    // Debug log first frame
    if (progress < 0.01 && !this.state.redSquareExpansionLogged) {
      console.log('🔴 First expansion update frame:', {
        visible: this.state.redSquareVoxel.visible,
        position: this.state.redSquareVoxel.position.toArray(),
        scale: this.state.redSquareVoxel.scale.toArray(),
        renderOrder: this.state.redSquareVoxel.renderOrder,
        opacity: this.state.liquidShaderMaterial?.uniforms.opacity.value
      });
      this.state.redSquareExpansionLogged = true;
    }
    
    // Different easing functions for width and height for organic feel
    const easedX = 1 - Math.pow(1 - progress, 2.5); // Faster horizontal expansion
    const easedY = 1 - Math.pow(1 - progress, 3.5); // Slower vertical expansion
    const easedZ = 1 - Math.pow(1 - progress, 3);   // Medium depth
    
    // Calculate target scales to fill screen with different ratios
    const camera = this.state.camera;
    const aspect = window.innerWidth / window.innerHeight;
    const frustumHeight = camera.top - camera.bottom;
    const frustumWidth = (camera.right - camera.left);
    
    // Organic expansion: width expands faster and further than height
    const targetScaleX = frustumWidth * 35;  // Extra wide to ensure coverage
    const targetScaleY = frustumHeight * 28; // Slightly less tall for asymmetry
    const targetScaleZ = Math.max(frustumWidth, frustumHeight) * 25; // Depth
    
    // Apply different expansion rates per axis
    const baseScale = this.state.redSquareVoxel.userData.baseScale;
    const currentScaleX = baseScale + (targetScaleX - baseScale) * easedX;
    const currentScaleY = baseScale + (targetScaleY - baseScale) * easedY;
    const currentScaleZ = baseScale + (targetScaleZ - baseScale) * easedZ;
    
    this.state.redSquareVoxel.scale.set(currentScaleX, currentScaleY, currentScaleZ);
    
    // Move to center of screen with organic path
    const targetX = 0;
    const targetY = 0;
    const startX = this.state.redSquareVoxel.userData.targetX;
    const startY = this.state.redSquareVoxel.userData.targetY;
    
    // Use different easing for position to create curved path
    const posEasedX = 1 - Math.pow(1 - progress, 2.8);
    const posEasedY = 1 - Math.pow(1 - progress, 3.2);
    
    this.state.redSquareVoxel.position.x = startX + (targetX - startX) * posEasedX;
    this.state.redSquareVoxel.position.y = startY + (targetY - startY) * posEasedY;
    // Keep at front - camera at z:2, most objects at z:0-1, so z:1.5 is closest
    this.state.redSquareVoxel.position.z = 1.5; // Closest to camera without being behind it
    
    // Add subtle rotation during expansion for organic feel
    const rotationAmount = Math.sin(progress * Math.PI) * 0.03; // Subtle wave
    this.state.redSquareVoxel.rotation.z = rotationAmount;
    
    // Fade in at start, fade out at end with liquid shader
    const fadeInDuration = 0.3; // 0.3 seconds to fade in
    const fadeOutStart = 0.7; // Start fading out at 70% progress
    
    let targetOpacity;
    if (progress < fadeInDuration / this.state.redSquareExpansionDuration) {
      // Fade in phase
      const fadeInProgress = progress / (fadeInDuration / this.state.redSquareExpansionDuration);
      targetOpacity = 0.3 + fadeInProgress * 0.7; // 0.3 to 1.0
    } else if (progress > fadeOutStart) {
      // Fade out phase (subtle, preparing for video)
      const fadeOutProgress = (progress - fadeOutStart) / (1 - fadeOutStart);
      targetOpacity = 1.0 - fadeOutProgress * 0.15; // 1.0 to 0.85
    } else {
      // Full opacity middle phase
      targetOpacity = 1.0;
    }
    
    // Update liquid shader uniforms if active
    if (this.state.liquidShaderMaterial) {
      this.state.liquidShaderMaterial.uniforms.time.value = elapsed;
      this.state.liquidShaderMaterial.uniforms.expansionProgress.value = progress;
      // Convert mouse screen coordinates to UV space (0-1)
      const mouseUV = new THREE.Vector2(
        (this.state.mouse.x + 1) / 2,  // Convert from -1,1 to 0,1
        (this.state.mouse.y + 1) / 2  // Convert from -1,1 to 0,1 (no flip needed)
      );
      this.state.liquidShaderMaterial.uniforms.mousePos.value = mouseUV;
      this.state.liquidShaderMaterial.uniforms.opacity.value = targetOpacity;
    } else {
      // Fallback for basic material
      this.state.redSquareVoxel.material.opacity = targetOpacity;
    }
    
    // Check if expansion complete
    if (progress >= 1 && !this.state.redSquareVideoPlayed) {
      this.state.redSquareExpanding = false;
      this.state.redSquareVideoPlayed = true;
      this._playTaunt5Video();
    }
  }
  
  /**
   * Play taunt5.mp4 video
   */
  _playTaunt5Video() {
    console.log('🎬 Playing taunt5.mp4');
    
    // Pause intro music
    this._pauseIntroMusic();
    
    // Create shader background canvas for liquid effect during video
    const shaderCanvas = document.createElement('canvas');
    shaderCanvas.id = 'video-shader-bg';
    shaderCanvas.width = window.innerWidth;
    shaderCanvas.height = window.innerHeight;
    shaderCanvas.style.position = 'fixed';
    shaderCanvas.style.top = '0';
    shaderCanvas.style.left = '0';
    shaderCanvas.style.width = '100%';
    shaderCanvas.style.height = '100%';
    shaderCanvas.style.zIndex = '9999'; // Behind video but above everything else
    shaderCanvas.style.pointerEvents = 'none';
    shaderCanvas.style.opacity = '0'; // Start invisible
    shaderCanvas.style.transition = 'opacity 1.2s ease-in-out';
    document.body.appendChild(shaderCanvas);
    
    // Setup WebGL for shader background
    this._setupVideoShaderBackground(shaderCanvas);
    
    // Fade in shader background using requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        shaderCanvas.style.opacity = '1';
        console.log('🌊 Shader background fading in');
      });
    });
    
    // Create video element
    const video = document.createElement('video');
    video.src = './static/video/taunt5.mp4';
    video.style.position = 'fixed';
    video.style.top = '0';
    video.style.left = '0';
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';
    video.style.zIndex = '10000'; // Above shader background
    video.style.opacity = '0'; // Start invisible
    video.style.transition = 'opacity 1.0s ease-in-out';
    video.style.filter = 'contrast(1.1) saturate(1.2)'; // Enhance video slightly
    video.autoplay = true;
    video.controls = false;
    video.crossOrigin = 'anonymous'; // Required for Web Audio API
    video.playbackRate = 0.75; // Slow down by 25%
    
    // Fade in video once it starts playing
    video.addEventListener('loadeddata', () => {
      console.log('🎬 Video loaded (slowed to 75%), fading in');
      requestAnimationFrame(() => {
        video.style.opacity = '0.9'; // More visible to show glitch effects
      });
    }, { once: true });
    
    // Setup audio effects (reverb + echo) with slowdown
    if (this.state.audioCtx) {
      this._setupVideoAudioEffects(video, 0.75); // Slow down audio to match video
    }
    
    // Add glitch styles and apply to video
    this._addVideoGlitchStyles();
    video.classList.add('video-glitch');
    
    // Add to page
    document.body.appendChild(video);
    
    // Remove video when ended and resume music
    video.addEventListener('ended', () => {
      console.log('🎬 Video ended, fading out');
      
      // Fade out video first
      video.style.transition = 'opacity 1.2s ease-out';
      video.style.opacity = '0';
      
      // Fade out shader background simultaneously
      const bgCanvas = document.getElementById('video-shader-bg');
      if (bgCanvas) {
        console.log('🌊 Shader background fading out');
        bgCanvas.style.opacity = '0';
      }
      
      setTimeout(() => {
        console.log('🎬 Removing video and shader elements');
      video.remove();
        
        if (bgCanvas) {
          bgCanvas.remove();
          if (this.state.videoShaderAnimationId) {
            cancelAnimationFrame(this.state.videoShaderAnimationId);
            this.state.videoShaderAnimationId = null;
          }
        }
        
      this._resumeIntroMusic();
      this._startRedSquareFade();
        console.log('🎬 Video cleanup complete - starting red square fade');
      }, 1200);
    });
    
    // Handle errors
    video.addEventListener('error', (e) => {
      console.error('❌ Video error:', e);
      
      // Fade out on error too
      video.style.opacity = '0';
      const bgCanvas = document.getElementById('video-shader-bg');
      if (bgCanvas) {
        bgCanvas.style.opacity = '0';
      }
      
      setTimeout(() => {
      video.remove();
        if (bgCanvas) {
          bgCanvas.remove();
          if (this.state.videoShaderAnimationId) {
            cancelAnimationFrame(this.state.videoShaderAnimationId);
            this.state.videoShaderAnimationId = null;
          }
        }
      this._resumeIntroMusic();
      this._startRedSquareFade();
      }, 1200);
    });
  }
  
  /**
   * Setup shader background for video playback
   */
  _setupVideoShaderBackground(canvas) {
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.warn('WebGL not supported for shader background');
      return;
    }
    
    // Vertex shader
    const vsSource = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;
    
    // Fragment shader (liquid effect)
    const fsSource = `
      precision mediump float;
      uniform float time;
      uniform vec2 mousePos;
      uniform vec2 resolution;
      varying vec2 vUv;
      
      float hash(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * 0.13);
        p3 += dot(p3, p3.yzx + 3.333);
        return fract((p3.x + p3.y) * p3.z);
      }
      
      float noise(vec2 x) {
        vec2 i = floor(x);
        vec2 f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
      
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        for(int i = 0; i < 5; i++) {
          value += amplitude * noise(p * frequency);
          frequency *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }
      
      vec2 flowField(vec2 p, float t) {
        float angle = fbm(p + vec2(t * 0.1)) * 6.28318;
        return vec2(cos(angle), sin(angle)) * 0.5;
      }
      
      void main() {
        vec2 uv = vUv;
        vec2 toMouse = mousePos - uv;
        float distToMouse = length(toMouse);
        vec2 dirToMouse = normalize(toMouse);
        
        // Smaller influence, longer trails
        float viscosity = smoothstep(0.15, 0.0, distToMouse);
        vec2 flowOffset = flowField(uv * 3.0, time * 0.3);
        vec2 turbulence = vec2(
          fbm(uv * 4.0 + flowOffset + time * 0.15),
          fbm(uv * 4.0 - flowOffset + time * 0.2)
        ) * 0.03;
        
        // Extended trails with slower decay
        float trailDecay = exp(-distToMouse * 3.0);
        float wake = trailDecay * sin(distToMouse * 35.0 - time * 2.5);
        vec2 wakeDistortion = dirToMouse * wake * 0.12 * viscosity;
        float radialPush = smoothstep(0.12, 0.0, distToMouse);
        vec2 radialDisplace = -dirToMouse * radialPush * 0.08;
        
        // Persistent trail
        float trailEffect = exp(-distToMouse * 2.0) * sin(time * 1.5 + distToMouse * 20.0);
        vec2 trailDistortion = dirToMouse * trailEffect * 0.04;
        
        vec2 distortedUV = uv + turbulence + wakeDistortion + radialDisplace + trailDistortion;
        
        float colorNoise1 = fbm(distortedUV * 5.0 + time * 0.1);
        float colorNoise2 = fbm(distortedUV * 8.0 - time * 0.15);
        
        vec3 darkColor = vec3(0.6, 0.0, 0.0);
        vec3 midColor = vec3(1.0, 0.0, 0.0);
        vec3 brightColor = vec3(1.0, 0.4, 0.2);
        
        vec3 color = mix(darkColor, midColor, colorNoise1);
        color = mix(color, brightColor, colorNoise2 * 0.6);
        
        float swirl = fbm(distortedUV * 6.0 + flowOffset * 2.0 + time * 0.25);
        float highlight = pow(swirl, 3.0) * 0.7;
        color += vec3(highlight * 0.6, highlight * 0.3, highlight * 0.15);
        
        // Tighter core but extended trail for glow
        float trailGlowCore = smoothstep(0.08, 0.0, distToMouse);
        float trailGlowExtended = smoothstep(0.5, 0.0, distToMouse);
        float glowPulse = 0.5 + 0.5 * sin(time * 2.0);
        float totalGlow = trailGlowCore * 1.5 + trailGlowExtended * 0.4;
        color += vec3(
          totalGlow * (0.8 + glowPulse * 0.2),
          totalGlow * 0.4,
          totalGlow * 0.2
        );
        
        float caustic1 = fbm(uv * 8.0 + time * 0.4);
        float caustic2 = fbm(uv * 12.0 - time * 0.5);
        float caustics = pow(max(caustic1, caustic2), 4.0) * 0.3;
        color += vec3(caustics * 0.5, caustics * 0.3, caustics * 0.1);
        
        float edgeFade = smoothstep(0.0, 0.15, min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y)));
        color *= 0.4 + 0.6 * edgeFade;
        
        float shimmer = noise(uv * 20.0 + time) * 0.1;
        color += vec3(shimmer * viscosity);
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;
    
    // Compile shaders
    function compileShader(source, type) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }
    
    const vertexShader = compileShader(vsSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fsSource, gl.FRAGMENT_SHADER);
    
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    
    // Setup geometry
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    
    const positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    
    // Get uniform locations
    const timeLoc = gl.getUniformLocation(program, 'time');
    const mousePosLoc = gl.getUniformLocation(program, 'mousePos');
    const resolutionLoc = gl.getUniformLocation(program, 'resolution');
    
    gl.useProgram(program);
    gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
    
    // Animation loop
    const startTime = performance.now();
    const animate = () => {
      const currentTime = (performance.now() - startTime) / 1000;
      
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      gl.uniform1f(timeLoc, currentTime);
      gl.uniform2f(mousePosLoc, 
        (this.state.mouse.x + 1) / 2,
        1 - (this.state.mouse.y + 1) / 2
      );
      
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      this.state.videoShaderAnimationId = requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  /**
   * Add video glitch effect styles
   */
  _addVideoGlitchStyles() {
    // Only add styles once
    if (document.getElementById('video-glitch-styles')) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = 'video-glitch-styles';
    style.textContent = `
      @keyframes glitchSlide {
        0%, 100% { 
          clip-path: inset(0 0 0 0);
          transform: translate(0, 0);
        }
        5% { 
          clip-path: inset(10% 0 85% 0);
          transform: translate(-8px, 0);
        }
        10% { 
          clip-path: inset(54% 0 9% 0);
          transform: translate(8px, 0);
        }
        15% {
          clip-path: inset(0 0 0 0);
          transform: translate(0, 0);
        }
        20% { 
          clip-path: inset(11% 0 43% 0);
          transform: translate(-5px, 0);
        }
        25% {
          clip-path: inset(0 0 0 0);
          transform: translate(0, 0);
        }
        30% { 
          clip-path: inset(37% 0 24% 0);
          transform: translate(10px, 0);
        }
        35% {
          clip-path: inset(0 0 0 0);
          transform: translate(0, 0);
        }
        40% { 
          clip-path: inset(76% 0 2% 0);
          transform: translate(-6px, 0);
        }
        50% { 
          clip-path: inset(8% 0 66% 0);
          transform: translate(6px, 0);
        }
        60% { 
          clip-path: inset(44% 0 29% 0);
          transform: translate(-10px, 0);
        }
        70% { 
          clip-path: inset(29% 0 51% 0);
          transform: translate(8px, 0);
        }
        80% { 
          clip-path: inset(61% 0 15% 0);
          transform: translate(-7px, 0);
        }
        90% { 
          clip-path: inset(20% 0 70% 0);
          transform: translate(5px, 0);
        }
      }
      
      @keyframes glitchStatic {
        0%, 100% { 
          background: transparent;
          opacity: 1;
        }
        2%, 8%, 15%, 23%, 31%, 47%, 56%, 68%, 77%, 89%, 95% {
          background: 
            repeating-linear-gradient(
              0deg,
              rgba(255,255,255,0.08) 0px,
              transparent 1px,
              transparent 2px,
              rgba(255,255,255,0.08) 3px
            ),
            repeating-linear-gradient(
              90deg,
              rgba(0,0,0,0.05) 0px,
              transparent 1px,
              transparent 2px,
              rgba(0,0,0,0.05) 3px
            );
          opacity: 0.7;
        }
      }
      
      @keyframes glitchDistort {
        0%, 100% { 
          transform: scaleY(1) translateX(0);
          filter: contrast(1.1) saturate(1.2);
        }
        3% { 
          transform: scaleY(0.98) translateX(-5px);
          filter: contrast(1.3) brightness(1.1);
        }
        7% { 
          transform: scaleY(1.02) translateX(6px);
          filter: contrast(0.9) brightness(0.95);
        }
        12% { 
          transform: scaleY(0.99) translateX(-3px);
          filter: brightness(1.15) contrast(1.2);
        }
        18% {
          transform: scaleY(1) translateX(0);
          filter: contrast(1.1) saturate(1.2);
        }
        25% { 
          transform: scaleY(1.01) translateX(7px);
          filter: contrast(1.25) brightness(0.92);
        }
        34% { 
          transform: scaleY(0.985) translateX(-6px);
          filter: brightness(1.08) contrast(1.15);
        }
        42% {
          transform: scaleY(1) translateX(0);
          filter: contrast(1.1) saturate(1.2);
        }
        51% { 
          transform: scaleY(1.015) translateX(4px);
          filter: contrast(1.35) brightness(0.88);
        }
        63% { 
          transform: scaleY(0.99) translateX(-8px);
          filter: brightness(1.12) contrast(0.95);
        }
        74% {
          transform: scaleY(1) translateX(0);
          filter: contrast(1.1) saturate(1.2);
        }
        82% { 
          transform: scaleY(1.02) translateX(5px);
          filter: brightness(1.05) contrast(1.3);
        }
        91% { 
          transform: scaleY(0.985) translateX(-4px);
          filter: contrast(1.2) brightness(0.97);
        }
      }
      
      @keyframes glitchRGB {
        0%, 100% { 
          filter: contrast(1.1) saturate(1.2);
        }
        10% { 
          filter: 
            drop-shadow(2px 0 0 rgba(255, 0, 0, 0.3)) 
            drop-shadow(-2px 0 0 rgba(0, 255, 255, 0.3));
        }
        20% {
          filter: none;
        }
        30% { 
          filter: 
            drop-shadow(-3px 0 0 rgba(255, 0, 0, 0.6)) 
            drop-shadow(3px 0 0 rgba(0, 255, 0, 0.6));
        }
        40% {
          filter: none;
        }
        50% { 
          filter: 
            drop-shadow(5px 0 0 rgba(0, 0, 255, 0.5)) 
            drop-shadow(-5px 0 0 rgba(255, 255, 0, 0.5));
        }
        60% {
          filter: none;
        }
        70% { 
          filter: 
            drop-shadow(-4px 0 0 rgba(255, 0, 255, 0.6)) 
            drop-shadow(4px 0 0 rgba(0, 255, 255, 0.6));
        }
        80% {
          filter: none;
        }
      }
      
      @keyframes glitchScale {
        0%, 100% { 
          transform: scale(1, 1);
        }
        33% { 
          transform: scale(1.02, 0.98);
        }
        66% { 
          transform: scale(0.98, 1.02);
        }
      }
      
      .video-glitch {
        position: relative;
        animation: 
          glitchSlide 1.2s infinite steps(1),
          glitchRGB 0.6s infinite,
          glitchScale 0.9s infinite,
          glitchDistort 2.1s infinite ease-in-out,
          glitchStatic 0.4s infinite steps(8);
      }
      
      .video-glitch::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: 
          repeating-linear-gradient(
            0deg,
            rgba(0,0,0,0.15) 0px,
            transparent 1px,
            transparent 2px,
            rgba(0,0,0,0.15) 3px
          );
        pointer-events: none;
        z-index: 10001;
        mix-blend-mode: multiply;
        animation: scanlines 0.15s infinite linear;
        opacity: 0.6;
      }
      
      .video-glitch::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: repeating-linear-gradient(
          90deg,
          transparent 0px,
          rgba(255,255,255,0.03) 1px,
          transparent 2px
        );
        pointer-events: none;
        z-index: 10002;
        animation: verticalStatic 0.1s infinite steps(3);
      }
      
      @keyframes scanlines {
        0% { transform: translateY(0); }
        100% { transform: translateY(3px); }
      }
      
      @keyframes verticalStatic {
        0% { transform: translateX(0); }
        33% { transform: translateX(-1px); }
        66% { transform: translateX(1px); }
        100% { transform: translateX(0); }
      }
    `;
    document.head.appendChild(style);
  }
  
  /**
   * Start red square fade out
   */
  _startRedSquareFade() {
    if (!this.state.redSquareVoxel || this.state.redSquareFading) {
      return;
    }
    
    this.state.redSquareFading = true;
    this.state.redSquareFadeStart = performance.now();
    console.log('🔴 Starting red square fade out');
  }
  
  /**
   * Update red square fade
   */
  _updateRedSquareFade() {
    if (!this.state.redSquareFading || !this.state.redSquareVoxel) {
      return;
    }
    
    const elapsed = (performance.now() - this.state.redSquareFadeStart) / 1000;
    const totalDuration = this.state.redSquareFadeDuration + 3.0; // Extra time for pulsation
    const progress = Math.min(elapsed / totalDuration, 1);
    
    let currentOpacity;
    
    if (progress < 0.5) {
      // First half: Fade out
      const fadeProgress = progress / 0.5;
      const eased = 1 - Math.pow(1 - fadeProgress, 2);
      currentOpacity = 1.0 - (1.0 * eased * 0.7); // Fade to 30%
    } else {
      // Second half: Pulsating restoration
      const pulseProgress = (progress - 0.5) / 0.5;
      
      // Multiple pulsations with increasing frequency
      const pulse1 = Math.sin(pulseProgress * Math.PI * 3) * 0.15; // 3 pulses
      const pulse2 = Math.sin(pulseProgress * Math.PI * 7) * 0.08; // 7 faster pulses
      const pulse3 = Math.sin(pulseProgress * Math.PI * 12) * 0.04; // 12 rapid pulses
      
      // Base opacity rises back up during pulsation
      const baseRise = pulseProgress * 0.4; // Rise from 0.3 to 0.7
      
      currentOpacity = 0.3 + baseRise + pulse1 + pulse2 + pulse3;
      currentOpacity = Math.max(0, Math.min(1, currentOpacity));
    }
    
    // Update shader uniform if using liquid shader, otherwise update material directly
    if (this.state.liquidShaderMaterial && this.state.redSquareVoxel.material === this.state.liquidShaderMaterial) {
      this.state.liquidShaderMaterial.uniforms.opacity.value = currentOpacity;
      // Continue updating shader animation during fade and pulsation
      this.state.liquidShaderMaterial.uniforms.time.value = elapsed + (this.state.redSquareExpansionDuration || 0);
      const mouseUV = new THREE.Vector2(
        (this.state.mouse.x + 1) / 2,
        (this.state.mouse.y + 1) / 2
      );
      this.state.liquidShaderMaterial.uniforms.mousePos.value = mouseUV;
    } else {
      this.state.redSquareVoxel.material.opacity = currentOpacity;
    }
    
    if (this.state.redSquareVoxel.userData.edges && this.state.redSquareVoxel.userData.edges.material) {
      const edgeOpacity = currentOpacity * 0.7;
      this.state.redSquareVoxel.userData.edges.material.opacity = edgeOpacity;
    }
    
    // Keep shader animating during pulsation
    if (this.state.liquidShaderMaterial) {
      this.state.liquidShaderMaterial.uniforms.expansionProgress.value = 1.0; // Full expansion
    }
    
    // Hide when fully complete (after pulsations)
    if (progress >= 1) {
      this.state.redSquareVoxel.visible = false;
      this.state.redSquareFading = false;
      console.log('🔴 Red square pulsation complete, faded out');
    }
  }
  
  /**
   * Setup video audio effects (reverb + echo)
   */
  _setupVideoAudioEffects(videoElement, playbackRate = 1.0) {
    try {
      const ctx = this.state.audioCtx;
      
      // Create media element source (playback rate affects audio automatically via video element)
      const source = ctx.createMediaElementSource(videoElement);
      
      // Create convolver for reverb
      const convolver = ctx.createConvolver();
      
      // Create delay for echo
      const delay = ctx.createDelay(1.0);
      delay.delayTime.value = 0.3; // 300ms delay
      
      const delayFeedback = ctx.createGain();
      delayFeedback.gain.value = 0.3; // Echo decay
      
      const delayMix = ctx.createGain();
      delayMix.gain.value = 0.4; // Echo volume
      
      // Create reverb impulse response
      this._createReverbImpulse(convolver, 2.0, 0.4); // 2 second reverb, 40% decay
      
      const reverbMix = ctx.createGain();
      reverbMix.gain.value = 0.5; // Reverb volume
      
      const dryGain = ctx.createGain();
      dryGain.gain.value = 0.7; // Dry signal volume
      
      const masterGain = ctx.createGain();
      masterGain.gain.value = 1.0;
      
      // Connect dry signal
      source.connect(dryGain);
      dryGain.connect(masterGain);
      
      // Connect reverb
      source.connect(convolver);
      convolver.connect(reverbMix);
      reverbMix.connect(masterGain);
      
      // Connect echo/delay with feedback
      source.connect(delay);
      delay.connect(delayFeedback);
      delayFeedback.connect(delay); // Feedback loop
      delay.connect(delayMix);
      delayMix.connect(masterGain);
      
      // Connect to destination
      masterGain.connect(ctx.destination);
      
      console.log(`🎵 Video audio effects applied (reverb + echo) at ${playbackRate}x speed`);
    } catch (error) {
      console.warn('⚠️ Failed to apply video audio effects:', error);
      // Fallback: connect video directly if effects fail
      try {
        const source = this.state.audioCtx.createMediaElementSource(videoElement);
        source.connect(this.state.audioCtx.destination);
      } catch (e) {
        console.warn('⚠️ Fallback audio connection failed:', e);
      }
    }
  }
  
  /**
   * Create reverb impulse response
   */
  _createReverbImpulse(convolver, duration, decay) {
    const ctx = this.state.audioCtx;
    const rate = ctx.sampleRate;
    const length = rate * duration;
    const impulse = ctx.createBuffer(2, length, rate);
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);
    
    for (let i = 0; i < length; i++) {
      const n = i / length;
      impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, decay);
      impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n, decay);
    }
    
    convolver.buffer = impulse;
  }
  
  /**
   * Pause intro music
   */
  _pauseIntroMusic() {
    if (this.state.introAudioCurrentSource) {
      try {
        // Store the current gain for resume
        if (this.state.introAudioGainNode) {
          this.state.introAudioSavedGain = this.state.introAudioGainNode.gain.value;
          
          // Fade out quickly
          const now = this.state.audioCtx.currentTime;
          this.state.introAudioGainNode.gain.cancelScheduledValues(now);
          this.state.introAudioGainNode.gain.setValueAtTime(this.state.introAudioSavedGain, now);
          this.state.introAudioGainNode.gain.linearRampToValueAtTime(0, now + 0.2);
        }
        
        this.state.introAudioPaused = true;
        console.log('🎵 Intro music paused');
      } catch (error) {
        console.warn('⚠️ Failed to pause intro music:', error);
      }
    }
  }
  
  /**
   * Resume intro music
   */
  _resumeIntroMusic() {
    if (this.state.introAudioPaused && this.state.introAudioGainNode) {
      try {
        // Fade back in
        const now = this.state.audioCtx.currentTime;
        const targetGain = this.state.introAudioSavedGain || 0.7;
        this.state.introAudioGainNode.gain.cancelScheduledValues(now);
        this.state.introAudioGainNode.gain.setValueAtTime(0, now);
        this.state.introAudioGainNode.gain.linearRampToValueAtTime(targetGain, now + 0.5);
        
        this.state.introAudioPaused = false;
        console.log('🎵 Intro music resumed');
      } catch (error) {
        console.warn('⚠️ Failed to resume intro music:', error);
      }
    }
  }

  /**
   * Animate skip button to bow shape
   */
  _animateSkipButtonToBow() {
    const skipBtn = document.getElementById('skipBtn');
    if (skipBtn) {
      console.log('🎀 Animating skip button to bow');
      skipBtn.classList.add('bow-shape');
      window.requestAnimationFrame(() => {
        skipBtn.classList.add('bow-docked');
      });
      setTimeout(() => skipBtn.classList.add('rounded-bow'), 400);
      setTimeout(() => skipBtn.classList.add('illuminating'), 800);
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
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⌨️ _handleDoorwayInput called');
    console.log('  → key:', e.key);
    console.log('  → inputAttempted:', this.state.inputAttempted);
    console.log('  → inputText:', JSON.stringify(this.state.inputText));
    console.log('  → celliAnimationComplete:', this.state.celliAnimationComplete);

    // Check if CELLI animation is complete using the state flag
    if (!this.state.celliAnimationComplete) {
      console.log('⏳ CELLI animation not complete, queuing input');
      e.preventDefault();
      this.state.queuedActions.push({ type: 'keydown', key: e.key, event: e });
      return;
    }

    this.state.inputAttempted = true;

    if (e.key === 'Backspace') {
      console.log('  → BACKSPACE key detected, preventing default and calling handler');
      e.preventDefault();
      this._handlePromptBackspace();
      return;
    }

    const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
    console.log('  → Normalized key:', key);

    if (key === 'T' && this._tryHandleStartCompletion()) {
      console.log('  → T key and START completion handled');
      e.preventDefault();
      return;
    }

    if (this._handleEndSequenceKey(key)) {
      console.log('  → END sequence key handled');
      e.preventDefault();
      return;
    }

    if (key.length === 1 && /[A-Z0-9]/.test(key)) {
      console.log('  → Alphanumeric key, adding to inputText');
      e.preventDefault();
      this.state.inputText += key;
      console.log('  → New inputText:', JSON.stringify(this.state.inputText));
      this._setPromptText(this.state.inputText);
    } else {
      console.log('  → Key not handled');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  _handleEndSequenceKey(rawKey) {
    const key = (rawKey || '').toUpperCase();
    const isEndKey = key === 'E' || key === 'N' || key === 'D';

    if (!isEndKey) {
      return false;
    }

    if (!this.state.allYellowTransformed) {
      this.state.pendingEndKeys.push(key);
      return true;
    }

    const suffix = (this.state.inputText || '').slice(this.state.promptBaseText.length).toUpperCase();

    if (key === 'E' && this.state.endSequence === '' && suffix.length === 0) {
      this.state.endSequence = 'E';
      this.state.inputText = `${this.state.promptBaseText}E`;
      this._setPromptText(this.state.inputText);
      this._transformToMagenta();
      this._dropVoxelsForE(); // Drop some I and C voxels
      console.log('🟥 Magenta phase triggered (E) - dropping voxels');
      return true;
    }

    if (key === 'N' && this.state.endSequence === 'E' && suffix === 'E') {
      this.state.endSequence = 'EN';
      this.state.inputText = `${this.state.promptBaseText}EN`;
      this._setPromptText(this.state.inputText);
      this._transformToCyan();
      this._dropVoxelsForN(); // Drop more voxels
      console.log('🟦 Cyan phase triggered (N) - dropping more voxels');
      return true;
    }

    if (key === 'D' && this.state.endSequence === 'EN' && suffix === 'EN') {
      this.state.endSequence = 'END';
      this.state.inputText = `${this.state.promptBaseText}END`;
      this._setPromptText(this.state.inputText);
      this._transformToGreenAndHell();
      this._dropVoxelsForD(); // Drop remaining voxels, form HELL
      console.log('🟩 Green phase triggered (D) - HELL transform starting');
      
      // Hide skip button
      const skipBtn = document.getElementById('skipBtn');
      if (skipBtn) {
        skipBtn.style.display = 'none';
      }
      
      console.log('🎬 END sequence complete - starting transition');
      this._startEndSequence();
      return true;
    }

    return true;
  }

  _dropVoxelsForE() {
    // Drop top and bottom rows of I (keep middle vertical bar)
    const iVoxels = this.state.letterVoxels.I || [];
    iVoxels.forEach(voxel => {
      const data = voxel.userData;
      if (!data) return;
      
      // Drop top and bottom horizontal bars of I
      if (data.gridRow === 0 || data.gridRow === 4) {
        data.hellDrop = true;
        data.hellDropPhase = 'fall';
        data.dropVelocity = -0.03 - Math.random() * 0.02;
        data.settled = false;
      }
    });
    
    // Drop some C voxels (top and bottom curves)
    const cVoxels = this.state.letterVoxels.C || [];
    cVoxels.forEach(voxel => {
      const data = voxel.userData;
      if (!data) return;
      
      // Drop top-right and bottom-right of C
      if ((data.gridRow === 0 || data.gridRow === 4) && data.gridCol > 0) {
        data.hellDrop = true;
        data.hellDropPhase = 'fall';
        data.dropVelocity = -0.025 - Math.random() * 0.015;
        data.settled = false;
      }
    });
  }

  _dropVoxelsForN() {
    // Drop more I voxels (sides of remaining bar)
    const iVoxels = this.state.letterVoxels.I || [];
    iVoxels.forEach(voxel => {
      const data = voxel.userData;
      if (!data) return;
      
      // Drop outer columns of I (keep center column)
      if (data.gridCol !== 2 && !data.hellDrop) {
        data.hellDrop = true;
        data.hellDropPhase = 'fall';
        data.dropVelocity = -0.028 - Math.random() * 0.018;
        data.settled = false;
      }
    });
    
    // Drop middle row of C
    const cVoxels = this.state.letterVoxels.C || [];
    cVoxels.forEach(voxel => {
      const data = voxel.userData;
      if (!data) return;
      
      if (data.gridRow === 2 && data.gridCol > 0 && !data.hellDrop) {
        data.hellDrop = true;
        data.hellDropPhase = 'fall';
        data.dropVelocity = -0.026 - Math.random() * 0.016;
        data.settled = false;
      }
    });
  }

  _dropVoxelsForD() {
    // Final drops - anything not needed for H
    // This is handled by _startHellTransform which marks unused voxels
    // Just ensure the transform starts
  }

  _transformToMagenta() {
    console.log('🟥 Transforming voxels to MAGENTA');
    this._setColorPhase('magenta');
    this._pulseVoxels(0.2);
  }

  _transformToCyan() {
    console.log('🟦 Transforming voxels to CYAN');
    this._setColorPhase('cyan');
    this._pulseVoxels(0.2);
  }

  _transformToGreenAndHell() {
    console.log('🟩 Transforming voxels to GREEN and starting HELL');
    this._setColorPhase('green');
    this._pulseVoxels(0.3);
    
    // Start HELL transformation after a brief delay
    setTimeout(() => {
      this._startHellTransform();
    }, 300);
  }

  _processQueuedActions() {
    if (this.state.queuedActions.length === 0) {
      return;
    }

    console.log(`📋 Processing ${this.state.queuedActions.length} queued actions`);
    const actions = [...this.state.queuedActions];
    this.state.queuedActions = [];

    actions.forEach(action => {
      if (action.type === 'click') {
        console.log('  → Processing queued click');
        this.state.inputAttempted = true;
        if (!this.state.celliGlitchStarted) {
          this._triggerCelliGlitchRain();
        }
        this.state.doorwayInputRequiresClick = false;
        this.state.doorwayInputActive = true;
        this._focusHiddenInput();
      } else if (action.type === 'keydown') {
        console.log(`  → Processing queued keydown: ${action.key}`);
        // Re-trigger the keydown handler
        this._handleDoorwayInput({ key: action.key, preventDefault: () => {} });
      }
    });
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
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 _setPromptText called with value:', JSON.stringify(value));
    
    const promptText = document.getElementById('promptText');
    const promptCursor = document.getElementById('promptCursor');
    const promptEl = document.getElementById('prompt');

    console.log('🔍 promptText element:', promptText);
    console.log('🔍 promptCursor element:', promptCursor);
    console.log('🔍 promptEl element:', promptEl);

    if (promptText) {
      console.log('  → promptText.textContent BEFORE:', JSON.stringify(promptText.textContent));
      
      // Force immediate visual update
      promptText.textContent = '';
      void promptText.offsetHeight; // Force reflow
      promptText.textContent = value;
      void promptText.offsetHeight; // Force reflow again
      
      console.log('  → promptText.textContent AFTER:', JSON.stringify(promptText.textContent));
      console.log('  → promptText COMPUTED STYLE:', window.getComputedStyle(promptText).display);
      console.log('  → promptText VISIBILITY:', window.getComputedStyle(promptText).visibility);
    } else {
      console.warn('  ⚠️ promptText element NOT FOUND');
    }
    
    if (promptCursor) {
      promptCursor.textContent = '_';
      console.log('  → promptCursor updated');
    } else {
      console.warn('  ⚠️ promptCursor element NOT FOUND');
    }
    
    if (promptEl) {
      console.log('  → promptEl.getAttribute("data-text") BEFORE:', promptEl.getAttribute('data-text'));
      
      promptEl.setAttribute('data-text', `${value}_`);
      
      console.log('  → promptEl.getAttribute("data-text") AFTER:', promptEl.getAttribute('data-text'));
      
      // Also update text content if it exists
      const textSpan = promptEl.querySelector('span');
      if (textSpan) {
        console.log('    → Found span inside promptEl');
        console.log('    → span.textContent BEFORE:', JSON.stringify(textSpan.textContent));
        textSpan.textContent = '';
        void textSpan.offsetHeight;
        textSpan.textContent = value;
        console.log('    → span.textContent AFTER:', JSON.stringify(textSpan.textContent));
      } else {
        console.log('    → No span found inside promptEl');
        console.log('    → promptEl.innerHTML:', promptEl.innerHTML);
      }
    } else {
      console.warn('  ⚠️ promptEl element NOT FOUND');
    }
    
    // Check for any elements with class 'prompt-text' or similar
    const allPromptElements = document.querySelectorAll('[id*="prompt"], [class*="prompt"]');
    console.log('🔍 Found', allPromptElements.length, 'elements with "prompt" in id/class:');
    allPromptElements.forEach((el, idx) => {
      console.log(`  ${idx}: id="${el.id}", class="${el.className}", tag="${el.tagName}", text="${el.textContent?.substring(0, 50)}"`);
    });
    
    console.log('✅ _setPromptText complete');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  /**
   * Start END sequence
   */
  _startEndSequence() {
    console.log('🎬 Starting END sequence with HELL → VisiCell transition');
    
    // Wait for HELL transform to complete (letters moving into place + falling voxels)
    setTimeout(() => {
      this._startPromptFlicker();
    }, 3000); // Wait for HELL letters to settle
  }

  _startPromptFlicker() {
    console.log('⚡ Starting prompt flicker');
    const promptContainer = document.querySelector('.prompt-container');
    const doorway = document.getElementById('doorway');
    
    if (!promptContainer) return;

    // Flicker the white box to outline (simulating light going out)
    let flickerCount = 0;
    const maxFlickers = 6;
    
    const flickerInterval = setInterval(() => {
      flickerCount++;
      const isOn = flickerCount % 2 === 0;
      
      if (isOn) {
        promptContainer.style.background = 'rgba(255, 255, 255, 0.08)';
        promptContainer.style.border = '2px solid rgba(255, 255, 255, 0.9)';
      } else {
        promptContainer.style.background = 'rgba(255, 255, 255, 0.02)';
        promptContainer.style.border = '2px solid rgba(255, 255, 255, 0.3)';
      }
      
      if (flickerCount >= maxFlickers) {
        clearInterval(flickerInterval);
        
        // Hide doorway background
        if (doorway) {
          doorway.style.transition = 'opacity 0.5s';
          doorway.style.opacity = '0';
          setTimeout(() => {
            doorway.style.display = 'none';
          }, 500);
        }
        
        // Final state: just outline
        promptContainer.style.background = 'transparent';
        promptContainer.style.border = '2px solid rgba(255, 255, 255, 0.6)';
        
        // Start voxel shrinking and shooting
        setTimeout(() => {
          this._shrinkVoxelsToPixels();
        }, 200);
      }
    }, 100);
  }

  _shrinkVoxelsToPixels() {
    console.log('🔸 Shrinking HELL voxels to pixels');
    
    // Get all visible voxels (HELL letters)
    const hellVoxels = this.state.voxels.filter(v => 
      v.visible && v.userData && !v.userData.hellDropPhase
    );
    
    const promptContainer = document.querySelector('.prompt-container');
    if (!promptContainer) return;
    
    // Get prompt box center in world coordinates
    const promptRect = promptContainer.getBoundingClientRect();
    const promptCenterX = ((promptRect.left + promptRect.width / 2) / window.innerWidth) * 2 - 1;
    const promptCenterY = -((promptRect.top + promptRect.height / 2) / window.innerHeight) * 2 + 1;
    
    // Start lifting the box up while pixels shoot
    setTimeout(() => {
      this._liftBoxToCollectPixels();
    }, 600); // Start lifting after shrink phase
    
    // Shrink each voxel to a pixel
    hellVoxels.forEach((voxel, idx) => {
      setTimeout(() => {
        const startScale = voxel.scale.x;
        const startPos = { x: voxel.position.x, y: voxel.position.y };
        const startTime = performance.now();
        const shrinkDuration = 400;
        const shootDelay = 200; // Delay before shooting
        const shootDuration = 700;
        
        const shrinkAndShoot = () => {
          const elapsed = performance.now() - startTime;
          
          if (elapsed < shrinkDuration) {
            // Phase 1: Shrink
            const progress = elapsed / shrinkDuration;
            const eased = 1 - Math.pow(1 - progress, 3);
            const scale = startScale * (1 - eased * 0.97); // Shrink to 3% of original
            voxel.scale.set(scale, scale, scale);
            requestAnimationFrame(shrinkAndShoot);
          } else if (elapsed < shrinkDuration + shootDelay) {
            // Phase 2: Brief pause
            requestAnimationFrame(shrinkAndShoot);
          } else if (elapsed < shrinkDuration + shootDelay + shootDuration) {
            // Phase 3: Shoot toward rising box
            const shootElapsed = elapsed - shrinkDuration - shootDelay;
            const shootProgress = shootElapsed / shootDuration;
            const eased = shootProgress * shootProgress; // Accelerate toward box
            
            // Target moves up as box lifts (simulating collection)
            const liftOffset = shootProgress * 0.3; // Box rises during shooting
            
            // Move toward prompt center (accounting for lift)
            voxel.position.x = startPos.x + (promptCenterX - startPos.x) * eased;
            voxel.position.y = startPos.y + (promptCenterY + liftOffset - startPos.y) * eased;
            
            // When near target, trigger hit effect
            if (shootProgress > 0.92 && !voxel.userData.hitTriggered) {
              voxel.userData.hitTriggered = true;
              this._triggerPixelHit();
            }
            
            requestAnimationFrame(shrinkAndShoot);
          } else {
            // Phase 4: Hide voxel
            voxel.visible = false;
          }
        };
        
        shrinkAndShoot();
      }, idx * 40);
    });
    
    // Track hits for complete infection
    this.state.pixelHitCount = 0;
    this.state.totalPixels = hellVoxels.length;
  }

  _liftBoxToCollectPixels() {
    console.log('⬆️ Lifting box to collect pixels');
    const promptContainer = document.querySelector('.prompt-container');
    if (!promptContainer) return;
    
    const startTop = promptContainer.offsetTop;
    const liftAmount = -80; // Lift 80px up
    const startTime = performance.now();
    const duration = 700; // Match pixel shooting duration
    
    const liftAnimation = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress * progress; // Ease in (accelerate)
      
      const top = startTop + liftAmount * eased;
      promptContainer.style.top = `${top}px`;
      
      if (progress < 1) {
        requestAnimationFrame(liftAnimation);
      }
    };
    
    liftAnimation();
  }

  _triggerPixelHit() {
    this.state.pixelHitCount = (this.state.pixelHitCount || 0) + 1;
    
    const promptContainer = document.querySelector('.prompt-container');
    if (!promptContainer) return;
    
    // Flash green on each hit
    promptContainer.style.background = 'rgba(0, 255, 0, 0.3)';
    setTimeout(() => {
      promptContainer.style.background = 'rgba(0, 255, 0, 0.05)';
    }, 50);
    
    // Update border color gradually to green
    const greenProgress = this.state.pixelHitCount / this.state.totalPixels;
    const r = Math.floor(255 * (1 - greenProgress));
    const g = 255;
    const b = Math.floor(255 * (1 - greenProgress));
    
    promptContainer.style.border = `2px solid rgba(${r}, ${g}, ${b}, 0.9)`;
    promptContainer.style.boxShadow = `0 0 ${greenProgress * 30}px rgba(0, 255, 0, ${greenProgress})`;
    
    // When all pixels have hit, start final flicker and fade
    if (this.state.pixelHitCount >= this.state.totalPixels) {
      setTimeout(() => {
        this._flickerAndFadeToWireframe();
      }, 300);
    }
  }

  _flickerAndFadeToWireframe() {
    console.log('⚡ Flickering and fading to wireframe');
    const promptContainer = document.querySelector('.prompt-container');
    if (!promptContainer) return;
    
    // Intense flicker effect
    let flickerCount = 0;
    const maxFlickers = 12;
    
    const flickerInterval = setInterval(() => {
      flickerCount++;
      const isOn = flickerCount % 2 === 0;
      
      if (isOn) {
        promptContainer.style.background = 'rgba(0, 255, 0, 0.4)';
        promptContainer.style.boxShadow = '0 0 40px rgba(0, 255, 0, 1)';
      } else {
        promptContainer.style.background = 'rgba(0, 255, 0, 0.05)';
        promptContainer.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.3)';
      }
      
      if (flickerCount >= maxFlickers) {
        clearInterval(flickerInterval);
        
        // Final state: transparent with green wireframe
        promptContainer.style.background = 'transparent';
        promptContainer.style.border = '2px solid rgba(0, 255, 0, 0.8)';
        promptContainer.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.5)';
        
        // Lift up and slide to center
        setTimeout(() => {
          this._liftAndCenter();
        }, 200);
      }
    }, 80);
  }

  _liftAndCenter() {
    console.log('⬆️ Lifting cell up and centering');
    const promptContainer = document.querySelector('.prompt-container');
    if (!promptContainer) return;
    
    // Get current position
    const startTop = promptContainer.offsetTop;
    const startLeft = promptContainer.offsetLeft;
    
    // Target: center of screen, higher up
    const targetTop = window.innerHeight / 2 - promptContainer.offsetHeight / 2 - 100; // Lift 100px higher
    const targetLeft = window.innerWidth / 2 - promptContainer.offsetWidth / 2;
    
    const startTime = performance.now();
    const duration = 1000;
    
    const liftAnimation = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress * progress * (3 - 2 * progress); // Smooth step
      
      const top = startTop + (targetTop - startTop) * eased;
      const left = startLeft + (targetLeft - startLeft) * eased;
      
      promptContainer.style.position = 'fixed';
      promptContainer.style.top = `${top}px`;
      promptContainer.style.left = `${left}px`;
      
      if (progress < 1) {
        requestAnimationFrame(liftAnimation);
      } else {
        // Now expand orthogonally
        this._expandOrthogonally();
      }
    };
    
    liftAnimation();
  }

  _expandOrthogonally() {
    console.log('➕ Expanding orthogonally (cross shape)');
    const promptContainer = document.querySelector('.prompt-container');
    
    if (!promptContainer) return;
    
    // Target dimensions (VisiCell grid size)
    const targetWidth = Math.min(window.innerWidth * 0.8, 800);
    const targetHeight = Math.min(window.innerHeight * 0.7, 600);
    
    const startWidth = promptContainer.offsetWidth;
    const startHeight = promptContainer.offsetHeight;
    const startTime = performance.now();
    const duration = 1200;
    
    const expandAnimation = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      
      // Expand in cross pattern: horizontal first, then vertical
      const horizontalProgress = Math.min(eased * 2, 1);
      const verticalProgress = Math.max(0, (eased - 0.5) * 2);
      
      const width = startWidth + (targetWidth - startWidth) * horizontalProgress;
      const height = startHeight + (targetHeight - startHeight) * verticalProgress;
      
      promptContainer.style.width = `${width}px`;
      promptContainer.style.height = `${height}px`;
      promptContainer.style.left = `${window.innerWidth / 2 - width / 2}px`;
      promptContainer.style.top = `${window.innerHeight / 2 - height / 2}px`;
      
      if (progress < 1) {
        requestAnimationFrame(expandAnimation);
      } else {
        // Fill in diagonals and complete grid
        this._fillDiagonals();
      }
    };
    
    expandAnimation();
  }

  _fillDiagonals() {
    console.log('⬚ Filling diagonal corners');
    const promptContainer = document.querySelector('.prompt-container');
    
    if (!promptContainer) return;
    
    // Animate border radius to 0 (making it rectangular)
    const startTime = performance.now();
    const duration = 600;
    
    const fillAnimation = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const borderRadius = 12 * (1 - progress);
      promptContainer.style.borderRadius = `${borderRadius}px`;
      
      // Intensify green glow
      const glowSize = 20 + progress * 30;
      promptContainer.style.boxShadow = `0 0 ${glowSize}px rgba(0, 255, 0, ${0.8 + progress * 0.2})`;
      
      if (progress < 1) {
        requestAnimationFrame(fillAnimation);
      } else {
        // Transition to VisiCell scene
        this._transitionToVisiCell();
      }
    };
    
    fillAnimation();
  }

  _transitionToVisiCell() {
    console.log('📊 Transitioning to VisiCell scene');
    
    const promptContainer = document.querySelector('.prompt-container');
    let cellState = null;
    
    // Pass the current cell state for seamless transition
    if (promptContainer) {
      const rect = promptContainer.getBoundingClientRect();
      cellState = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        border: promptContainer.style.border,
        boxShadow: promptContainer.style.boxShadow
      };
      
      console.log('📦 Passing cell state to VisiCell:', cellState);
    }
    
    // Fade out intro scene elements
    setTimeout(() => {
      // Hide Three.js canvas
      if (this.state.renderer && this.state.renderer.domElement) {
        this.state.renderer.domElement.style.transition = 'opacity 0.5s';
        this.state.renderer.domElement.style.opacity = '0';
      }
      
      // Hide prompt container
      if (promptContainer) {
        promptContainer.style.transition = 'opacity 0.3s';
        promptContainer.style.opacity = '0';
      }
      
      // Hide doorway
      const doorway = document.getElementById('doorway');
      if (doorway) {
        doorway.style.opacity = '0';
      }
    }, 100);
    
    // Dispatch custom event for scene transition with special entry flag
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('celli:sceneTransition', {
        detail: { 
          scene: 'visicell',
          entry: 'hell-infection', // Special entry mode
          skipIntro: true, // Skip normal VisiCell intro
          cellState: cellState, // Current green cell state
          continueAnimation: true // Continue the expansion animation
        }
      }));
      
      // Stop the intro scene
      setTimeout(() => {
        this.stop();
      }, 500);
    }, 800);
  }

  /**
   * Start scene
   */
  async start(state, options = {}) {
    console.log('▶️ Starting Complete Intro Scene');

    // Kill referrer overlay to prevent it from showing over intro
    console.log('🎬 IntroScene start - killing referrer overlay');
    if (typeof window.killReferrerOverlay === 'function') {
      window.killReferrerOverlay();
    }

    // Hide play overlay
    const playEl = document.getElementById('play');
    if (playEl) playEl.classList.add('hidden');

    this.state.doorwayInputActive = false;
    this.state.doorwayInputRequiresClick = true;
    if (Array.isArray(this.state.pendingEndKeys)) {
      this.state.pendingEndKeys.length = 0;
    }
    this._deactivateHiddenInput();
    
    // Ensure quote starts hidden (will appear during collapse phase)
    const quoteEl = document.getElementById('quote');
    if (quoteEl) {
      quoteEl.classList.add('visible'); // Add visible class for CSS
      quoteEl.style.visibility = 'hidden'; // But hide initially
      quoteEl.style.opacity = '0';
      quoteEl.classList.remove('glitch', 'glitchMedium', 'glitchIntense', 'scrambling', 'quote--loom');
      
      // Reset to initial text (removed - will be re-implemented)
      const quoteBefore = document.getElementById('quoteBefore');
      if (quoteBefore) {
        quoteBefore.textContent = '';
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
      skipBtn.classList.remove('bow-shape', 'rounded-bow', 'illuminating', 'bow-docked');
    }
    
    console.log('✅ UI elements initialized for intro sequence');

    this._broadcastIntroMusicManagement(true);
    this._updateFullSequenceStage('intro-active');

    // Start animation
    this.state.introAudioPlayCount = 0;
    await this._playIntroAudio();
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
    
    // Set celliAnimationComplete and process queued actions
    if (allVoxelsSettled && !this.state.celliAnimationComplete) {
      console.log('✅ CELLI animation complete - processing queued actions');
      this.state.celliAnimationComplete = true;
      this._processQueuedActions();
    }
    
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

    // Update backspace-driven restoration
    if (this.state.celliBackspaceSequenceStarted) {
      this._updateBackspaceSequence(deltaTime);
    }

    // Update move to corner sequence
    if (this.state.celliMoveToCornerStarted) {
      this._updateMoveToCorner(deltaTime);
    }
    
    // Update red square expansion
    if (this.state.redSquareExpanding) {
      this._updateRedSquareExpansion();
    }
    
    // Update red square fade
    if (this.state.redSquareFading) {
      this._updateRedSquareFade();
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
    const celliAge = t - cfg.loomworksEnd;

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
      
      // Update subtitle voxels during CELLI phase (tied to CELLI spawn timing)
      this._updateSubtitleVoxels(celliAge);
      
      // Update mask voxels
      this._updateMaskVoxels(t);
      
      // Animate skip button to bow when voxels settle
      if (celliAge > 3.0 && !this.state.skipBowAnimated) {
        this._animateSkipButtonToBow();
        this.state.skipBowAnimated = true;
      }
      
      // Also trigger bow animation on skip if not yet animated
      if (this.state.skipRequested && !this.state.skipBowAnimated) {
        this._animateSkipButtonToBow();
        this.state.skipBowAnimated = true;
      }
      
    } else if (phase === 'doorway') {
      const doorwayProgress = (t - cfg.celliEnd) / (cfg.doorwayEnd - cfg.celliEnd);
      bloom.strength = THREE.MathUtils.lerp(0.35, 0.55, Math.min(doorwayProgress * 2, 1));
      afterimage.uniforms.damp.value = 0.8;
      film.uniforms.noise.value = 0.005;
      film.uniforms.scanAmp.value = 0.002;
      if (tri) tri.visible = false;
      
      // Continue updating subtitle voxels during doorway phase
      const doorwayAge = t - cfg.loomworksEnd;
      this._updateSubtitleVoxels(doorwayAge);
      
      // Update mask voxels
      this._updateMaskVoxels(t);
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
   * Swap quote text to despair message (removed - will be re-implemented)
   */
  _swapQuoteToDespair() {
    const quoteEl = document.getElementById('quote');
    if (!quoteEl) return;
    
    const quoteBefore = document.getElementById('quoteBefore');
    if (quoteBefore) {
      quoteBefore.textContent = '';
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
        if (!data.hellDropPhase) {
          data.hellDropPhase = 'fall';
        }

        if (data.hellDropPhase === 'fall') {
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
            data.dropVelocity = 0;

            if (data.hellTarget) {
              data.hellDropPhase = 'waiting';
              data.hellRespawnAt = this.state.totalTime + 0.18 + Math.random() * 0.25;
            } else {
              data.hellDropPhase = 'vanish';
            }
          }

          return;
        }

        if (data.hellDropPhase === 'waiting') {
          if (this.state.totalTime < data.hellRespawnAt) {
            return;
          }

          const target = data.hellTarget || { x: data.originalTargetX, y: data.originalTargetY };
          voxel.visible = true;
          voxel.position.x = target.x;
          voxel.position.y = target.y + 3.2;
          voxel.material.opacity = 0;
          if (data.edges && data.edges.material) {
            data.edges.material.opacity = 0;
          }

          data.hellReturnVelocity = 0;
          data.hellDropPhase = 'return';
          return;
        }

        if (data.hellDropPhase === 'return') {
          const target = data.hellTarget || { x: data.originalTargetX, y: data.originalTargetY };
          data.hellReturnVelocity = Math.min((data.hellReturnVelocity || 0) + dt * 0.18, 0.085);
          voxel.position.y = Math.max(target.y, voxel.position.y - data.hellReturnVelocity);
          voxel.material.opacity = Math.min(0.82, voxel.material.opacity + 0.06);
          if (data.edges && data.edges.material) {
            data.edges.material.opacity = Math.min(0.45, data.edges.material.opacity + 0.05);
          }

          if (voxel.position.y <= target.y + 0.01) {
            voxel.position.y = target.y;
            voxel.position.x = target.x;
            voxel.material.opacity = 0.78;
            if (data.edges && data.edges.material) {
              data.edges.material.opacity = 0.32;
            }

            data.settled = true;
            data.hellDrop = false;
            data.hellDropPhase = null;
            data.hellReturnVelocity = 0;
            data.hellRespawnAt = 0;
            data.hellStart = { x: target.x, y: target.y };
            data.hellTarget = target;
          }

          return;
        }

      if (data.hellDropPhase === 'vanish') {
        voxel.visible = false;
        voxel.material.opacity = 0;
        if (data.edges && data.edges.material) {
          data.edges.material.opacity = 0;
        }
        return;
      }

      return;
    }

    if (data.glitched) {
      voxel.visible = false;
      voxel.material.opacity = 0;
      if (data.edges && data.edges.material) {
        data.edges.material.opacity = 0;
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

          if (data.baseColor && data.glowColor && voxel.material.color) {
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

        if (hellActive && data.hellTarget && data.hellStart && !data.hellDropPhase) {
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
        if (voxel.material.color && data.baseColor && data.glowColor) {
        voxel.material.color.lerpColors(data.baseColor, data.glowColor, glowStrength);
        }
        if (data.edges && data.edges.material) {
          data.edges.material.opacity = THREE.MathUtils.lerp(data.edges.material.opacity, 0.75, 0.12);
          if (data.edges.material.color && data.edgesBaseColor && data.edgesGlowColor) {
          data.edges.material.color.lerpColors(data.edgesBaseColor, data.edgesGlowColor, glowStrength);
          }
        }
      }
    });
  }

  _updateSubtitleVoxels(subtitleTime) {
    if (!this.state.showSubtitle || !this.state.subtitleVoxels.length) {
      return;
    }

    this.state.subtitleVoxels.forEach(voxel => {
      const data = voxel.userData;
      const localTime = subtitleTime - data.dropDelay;

      if (localTime <= 0) {
        return;
      }

      voxel.visible = true;

      if (!data.settled && voxel.position.y > data.targetY) {
        voxel.position.y -= data.dropSpeed;
        const targetOpacity = data.isRedSquare ? 0.85 : 0.75;
        voxel.material.opacity = Math.min(targetOpacity, voxel.material.opacity + 0.05);
        if (data.edges && data.edges.material) {
          const edgeOpacity = data.isRedSquare ? 0.65 : 0.55;
          data.edges.material.opacity = Math.min(edgeOpacity, data.edges.material.opacity + 0.04);
        }
      } else if (!data.settled) {
        voxel.position.y = data.targetY;
        voxel.material.opacity = data.isRedSquare ? 0.85 : 0.75;
        if (data.edges && data.edges.material) {
          data.edges.material.opacity = data.isRedSquare ? 0.65 : 0.55;
        }
        data.settled = true;
      }

      if (data.settled) {
        data.jigglePhase += 0.015;
        const jiggle = Math.sin(data.jigglePhase) * 0.001;
        voxel.position.x = data.targetX + jiggle;

        data.flickerPhase += 0.035;
        const flicker = 0.5 + 0.5 * Math.sin(data.flickerPhase);
        
        // Darker E squares pulse between dark gray and full brightness
        if (data.isDarkerSquare) {
          // Slow pulsing cycle (3 second period)
          const pulseSpeed = 0.02;
          if (!data.pulsePhase) data.pulsePhase = 0;
          data.pulsePhase += pulseSpeed;
          const pulseCycle = Math.sin(data.pulsePhase);
          
          // Map cycle: -1 to 0 = stay dark, 0 to 1 = brighten, 1 to 0 = darken back, 0 to -1 = stay dark
          const pulseStrength = Math.max(0, pulseCycle); // 0 to 1 range
          
          // Lerp between dark gray and full white
          const darkColor = data.baseColor; // 0x1a1f2a
          const brightColor = new THREE.Color(0xffffff); // Full white
          if (voxel.material.color && darkColor) {
          voxel.material.color.lerpColors(darkColor, brightColor, pulseStrength);
          }
          
          const targetOpacity = 0.7 + pulseStrength * 0.2; // 0.7 to 0.9
          voxel.material.opacity = THREE.MathUtils.lerp(voxel.material.opacity, targetOpacity, 0.06);
          
          if (data.edges && data.edges.material) {
            const darkEdgeColor = data.edgesBaseColor; // 0x2a3342
            const brightEdgeColor = new THREE.Color(0xffffff);
            if (data.edges.material.color && darkEdgeColor) {
            data.edges.material.color.lerpColors(darkEdgeColor, brightEdgeColor, pulseStrength);
            }
            const edgeOpacity = 0.5 + pulseStrength * 0.3; // 0.5 to 0.8
            data.edges.material.opacity = THREE.MathUtils.lerp(data.edges.material.opacity, edgeOpacity, 0.08);
          }
        } else {
          const glowStrength = THREE.MathUtils.clamp(0.3 + flicker * 0.5, 0, 1);

          // Red square glows more intensely
          const targetOpacity = data.isRedSquare ? 0.9 : 0.8;
          voxel.material.opacity = THREE.MathUtils.lerp(voxel.material.opacity, targetOpacity, 0.06);
          if (voxel.material.color && data.baseColor && data.glowColor) {
          voxel.material.color.lerpColors(data.baseColor, data.glowColor, glowStrength);
          }
          if (data.edges && data.edges.material) {
            const edgeOpacity = data.isRedSquare ? 0.7 : 0.6;
            data.edges.material.opacity = THREE.MathUtils.lerp(data.edges.material.opacity, edgeOpacity, 0.08);
            if (data.edges.material.color && data.edgesBaseColor && data.edgesGlowColor) {
            data.edges.material.color.lerpColors(data.edgesBaseColor, data.edgesGlowColor, glowStrength);
            }
          }
        }
      }
    });
  }

  _updateMaskVoxels(totalTime) {
    if (!this.state.maskVoxels.length) {
      return;
    }

    this.state.maskVoxels.forEach(voxel => {
      const data = voxel.userData;
      const localTime = totalTime - (data.spawnTime || 0) - data.dropDelay;

      if (localTime <= 0) {
        return;
      }

      voxel.visible = true;

      if (!data.settled && voxel.position.y > data.targetY) {
        voxel.position.y -= data.dropSpeed;
        voxel.material.opacity = Math.min(0.75, voxel.material.opacity + 0.05);
        if (data.edges && data.edges.material) {
          data.edges.material.opacity = Math.min(0.55, data.edges.material.opacity + 0.04);
        }
      } else if (!data.settled) {
        voxel.position.y = data.targetY;
        voxel.material.opacity = 0.75;
        if (data.edges && data.edges.material) {
          data.edges.material.opacity = 0.55;
        }
        data.settled = true;
      }

      if (data.settled) {
        data.jigglePhase += 0.015;
        const jiggle = Math.sin(data.jigglePhase) * 0.001;
        voxel.position.x = data.targetX + jiggle;

        data.flickerPhase += 0.035;
        const flicker = 0.5 + 0.5 * Math.sin(data.flickerPhase);
        const glowStrength = THREE.MathUtils.clamp(0.3 + flicker * 0.5, 0, 1);

        voxel.material.opacity = THREE.MathUtils.lerp(voxel.material.opacity, 0.8, 0.06);
        if (voxel.material.color && data.baseColor && data.glowColor) {
        voxel.material.color.lerpColors(data.baseColor, data.glowColor, glowStrength);
        }
        if (data.edges && data.edges.material) {
          data.edges.material.opacity = THREE.MathUtils.lerp(data.edges.material.opacity, 0.6, 0.08);
          if (data.edges.material.color && data.edgesBaseColor && data.edgesGlowColor) {
          data.edges.material.color.lerpColors(data.edgesBaseColor, data.edgesGlowColor, glowStrength);
          }
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
    this.state.doorwayInputActive = false;
    this.state.doorwayInputRequiresClick = true;
    this._deactivateHiddenInput();
    const doorway = document.getElementById('doorway');
    if (doorway) {
      doorway.classList.add('open');
    }

    if (this._isTouchPrimaryDevice()) {
      window.setTimeout(() => {
        if (this.state.doorwayInputActive) {
          this._focusHiddenInput();
        }
      }, 60);
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
    if (!this.state.celliBackspaceSequenceStarted) {
      return;
    }

    if (!Array.isArray(this.state.lettersToRestore) || !this.state.lettersToRestore.length) {
      return;
    }

    const target = Math.min(this.state.celliBackspaceTarget, this.state.lettersToRestore.length);

    if (this.state.restoredLetters >= target) {
      this.state.celliBackspaceSequenceTime = Math.min(this.state.celliBackspaceSequenceTime, 0.5);
      return;
    }

    this.state.celliBackspaceSequenceTime += dt;

    const interval = 0.5;

    while (this.state.celliBackspaceSequenceTime >= interval && this.state.restoredLetters < target) {
      this.state.celliBackspaceSequenceTime -= interval;
      this._restoreOneLetter();
    }
  }

  _updateBackspaceTargetFromPrompt() {
    const totalLetters = Array.isArray(this.state.lettersToRestore)
      ? this.state.lettersToRestore.length
      : 0;

    if (totalLetters === 0) {
      return;
    }

    const { sanitizedSuffix, matchLength, baseWord, fullLength } = this._getStartMatchInfo();
    const hasExtraChars = fullLength > sanitizedSuffix.length;
    const hasMismatch = hasExtraChars || matchLength !== sanitizedSuffix.length;

    let target;

    if (hasMismatch) {
      target = totalLetters;
    } else {
      switch (sanitizedSuffix.length) {
        case baseWord.length:
        case baseWord.length - 1:
          target = 0;
          break;
        case 3:
          target = 1;
          break;
        case 2:
          target = 2;
          break;
        case 1:
          target = 3;
          break;
        default:
          target = totalLetters;
          break;
      }
    }

    this.state.celliBackspaceTarget = Math.max(0, Math.min(target, totalLetters));
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
        data.hellDropPhase = null;
        data.hellRespawnAt = 0;
        data.hellReturnVelocity = 0;
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
      this.state.celliBackspaceSequenceStarted = false;
      this.state.celliBackspaceSequenceTime = 0;
      this.state.celliBackspaceTarget = this.state.restoredLetters;
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
          data.hellDrop = false;
          data.hellDropPhase = null;
          data.hellRespawnAt = 0;
          data.hellReturnVelocity = 0;
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
                  this._processPendingEndKeys();
                  this._setColorPhase('yellow');
                  this.state.yellowTransformationInProgress = false;
                  this._markConstructionComplete();
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

  _processPendingEndKeys() {
    if (!Array.isArray(this.state.pendingEndKeys) || !this.state.pendingEndKeys.length) {
      return;
    }

    const queuedKeys = [...this.state.pendingEndKeys];
    this.state.pendingEndKeys.length = 0;

    queuedKeys.forEach(key => {
      this._handleEndSequenceKey(key);
    });
  }

  _markConstructionComplete() {
    if (this.state.constructionPersisted) {
      return;
    }

    this.state.constructionPersisted = true;

    try {
      window.localStorage?.setItem(CONSTRUCTION_STORAGE_KEY, 'true');
    } catch (error) {
      console.warn('⚠️ Failed to persist CELLI construction completion:', error);
    }

    try {
      window.localStorage?.setItem(INTRO_THEME_STORAGE_KEY, INTRO_THEME_SECONDARY);
    } catch (error) {
      console.warn('⚠️ Failed to persist intro theme preference during construction completion:', error);
    }

    try {
      window.dispatchEvent(new CustomEvent('celli:construction-complete'));
    } catch (error) {
      console.warn('⚠️ Failed to dispatch construction completion event:', error);
    }
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
    this.state.doorwayInputActive = false;
    this.state.doorwayInputRequiresClick = true;
    this._deactivateHiddenInput();
    this._stopIntroAudioPlayback();
    this._broadcastIntroMusicManagement(false);
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
    if (this._mouseMoveHandler) {
      document.removeEventListener('mousemove', this._mouseMoveHandler);
    }
    if (this._promptClickHandler) {
      const promptContainer = document.querySelector('.prompt-container');
      if (promptContainer) {
        promptContainer.removeEventListener('click', this._promptClickHandler);
        promptContainer.removeEventListener('touchstart', this._promptClickHandler);
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

    this._stopIntroAudioPlayback();
    this.state.introAudio = null;
    this.state.introAudioSource = '';
    this.state.introAudioBuffers = {};
    this.state.introAudioReverseBuffers = {};
    this.state.introAudioLoadingPromises = {};

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


