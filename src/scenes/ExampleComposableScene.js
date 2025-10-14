/**
 * Example Composable Scene
 * Template showing how to make scenes compatible with Sequence Builder
 */

import { BaseScene } from '../core/BaseScene.js';

export class ExampleComposableScene extends BaseScene {
  constructor() {
    super();
    
    // Set metadata
    this.sequenceMetadata = {
      name: 'Example Scene',
      version: '1.0.0',
      description: 'A sample scene showing sequence builder compatibility'
    };
    
    // Define your timing phases
    this.defineSequence();
  }
  
  defineSequence() {
    // Example: 3-phase sequence
    
    // Phase 1: Intro (0s - 3s)
    this.registerPhase('Introduction', 0, 3, 'animation');
    
    // Phase 2: Main Action (3s - 8s)
    this.registerPhase('Main Action', 3, 8, 'animation');
    
    // Phase 3: Transition Out (8s - 10s)
    this.registerPhase('Transition', 8, 10, 'transition');
    
    // Register dialogues
    this.registerDialogue('System', 'Welcome to the scene', 0.5, 'subtitle');
    this.registerDialogue('Narrator', 'Watch this amazing effect', 3.0, 'terminal');
    
    // Register events
    this.registerEvent('glitchStart', 5.0, 'triggerGlitchEffect');
    this.registerEvent('cameraShake', 7.5, 'shakeCameraHeavy');
    
    // Register motion parameters
    this.registerMotion('camera', 'introMove', {
      from: { x: 0, y: 5, z: 10 },
      to: { x: 5, y: 3, z: 5 },
      duration: 3.0,
      easing: 'easeInOut'
    });
    
    this.registerMotion('objects', 'cubeRotate', {
      target: 'mainCube',
      axis: 'y',
      speed: 0.5,
      duration: 8.0
    });
    
    // Set total duration
    this.timing.duration = 10.0;
  }
  
  async init() {
    // Initialize Three.js scene, camera, renderer
    console.log(`🎬 Initializing ${this.sequenceMetadata.name}...`);
    
    // Your initialization code here...
    
    console.log('✅ Scene initialized');
  }
  
  async start(app, config) {
    this.state.running = true;
    console.log('▶️ Scene started');
  }
  
  update(app, deltaTime, totalTime) {
    this.state.totalTime = totalTime;
    
    // Your update logic here...
    // Use this.timing.phases to drive animations at specific times
  }
  
  async destroy() {
    this.state.running = false;
    console.log('🛑 Scene destroyed');
  }
}

