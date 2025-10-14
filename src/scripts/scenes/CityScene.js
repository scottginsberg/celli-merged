/**
 * City Scene - 3D walking environment with door instances
 * Extracted from merged2.html lines ~54298-54473
 */

import * as THREE from 'three';
import { audioSystem } from '../systems/AudioSystem.js';

export class CityScene {
  constructor() {
    this.state = {
      active: false,
      renderer: null,
      scene: null,
      camera: null,
      doors: [],
      doorIMesh: null,
      keys: {},
      orderCount: 0,
      animId: 0
    };
  }

  /**
   * Initialize scene (called once)
   */
  async init() {
    console.log('🏙️ Initializing City Scene...');
    
    if (this.state.renderer) return;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.cssText = 'position:fixed;inset:0;z-index:700;display:none;';
    document.body.appendChild(renderer.domElement);

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    // Create camera
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.7, 6);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 6);
    scene.add(directionalLight);

    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({ color: 0x111315, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // City blocks (boxes)
    const blockMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x222a33, 
      metalness: 0.1, 
      roughness: 0.9 
    });
    
    for (let x = -4; x <= 4; x += 2) {
      for (let z = -4; z <= 4; z += 2) {
        const w = 1.6 + Math.random() * 1.4;
        const d = 1.2 + Math.random() * 1.2;
        const h = 3 + Math.random() * 4;
        
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(w, h, d),
          blockMaterial
        );
        
        box.position.set(
          x * 8 + (Math.random() - 0.5) * 1.5,
          h / 2,
          z * 8 + (Math.random() - 0.5) * 1.5
        );
        
        scene.add(box);
      }
    }

    // Door instances
    const doorW = 1.0, doorH = 2.1, doorT = 0.1;
    const doorGeo = new THREE.BoxGeometry(doorW, doorH, doorT);
    const doorMat = new THREE.MeshStandardMaterial({ 
      color: 0x8899aa, 
      roughness: 0.6, 
      metalness: 0.2 
    });
    
    const doorCount = 24;
    const doorIMesh = new THREE.InstancedMesh(doorGeo, doorMat, doorCount);
    doorIMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(doorIMesh);

    this.state.doors = [];
    let i = 0;
    
    for (let x = -3; x <= 3; x++) {
      for (let z = -3; z <= 3; z++) {
        if (i >= doorCount) break;
        
        const bx = x * 12 + (Math.random() - 0.5) * 2;
        const bz = z * 12 + (Math.random() - 0.5) * 2;
        const by = doorH / 2;
        
        const matrix = new THREE.Matrix4();
        matrix.compose(
          new THREE.Vector3(bx, by, bz),
          new THREE.Quaternion(),
          new THREE.Vector3(1, 1, 1)
        );
        
        doorIMesh.setMatrixAt(i, matrix);
        this.state.doors.push(new THREE.Vector3(bx, by, bz));
        i++;
      }
    }
    
    doorIMesh.instanceMatrix.needsUpdate = true;

    // Store references
    this.state.renderer = renderer;
    this.state.scene = scene;
    this.state.camera = camera;
    this.state.doorIMesh = doorIMesh;

    // Create UI
    this._createOrderCounter();

    // Setup event listeners
    this._setupEventListeners();

    console.log('✅ City Scene initialized');
  }

  /**
   * Create order counter UI
   */
  _createOrderCounter() {
    let counter = document.getElementById('orderCounter');
    if (!counter) {
      counter = document.createElement('div');
      counter.id = 'orderCounter';
      counter.style.cssText = 'position:fixed;top:10px;right:12px;z-index:710;color:#0f0;font:14px monospace;background:rgba(0,0,0,.6);padding:8px 10px;border:1px solid #0f0;';
      counter.textContent = 'The Order: 0';
      document.body.appendChild(counter);
    }
  }

  /**
   * Setup keyboard listeners
   */
  _setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      this.state.keys[e.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.state.keys[e.key.toLowerCase()] = false;
    });

    window.addEventListener('resize', () => {
      if (!this.state.active) return;
      
      this.state.renderer.setSize(window.innerWidth, window.innerHeight);
      this.state.camera.aspect = window.innerWidth / window.innerHeight;
      this.state.camera.updateProjectionMatrix();
    });
  }

  /**
   * Start scene
   */
  async start(state, options = {}) {
    console.log('▶️ Starting City Scene');
    
    this.state.active = true;
    this.state.renderer.domElement.style.display = 'block';
    
    this._animate();
  }

  /**
   * Animation loop
   */
  _animate() {
    if (!this.state.active) return;
    
    this.state.animId = requestAnimationFrame(() => this._animate());

    // Camera movement (WASD)
    const camera = this.state.camera;
    const speed = 0.08;
    
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    
    const right = new THREE.Vector3().crossVectors(
      forward,
      new THREE.Vector3(0, 1, 0)
    ).multiplyScalar(-1);

    if (this.state.keys['w']) camera.position.addScaledVector(forward, speed);
    if (this.state.keys['s']) camera.position.addScaledVector(forward, -speed);
    if (this.state.keys['a']) camera.position.addScaledVector(right, speed);
    if (this.state.keys['d']) camera.position.addScaledVector(right, -speed);

    // Check door proximity
    const nearDoor = this.state.doors.find(doorPos =>
      doorPos.distanceTo(camera.position) < 1.2
    );

    if (nearDoor && this.state.keys['e']) {
      this._enterDoor();
      this.state.keys['e'] = false;
    }

    // Render
    this.state.renderer.render(this.state.scene, camera);
  }

  /**
   * Enter door - transition to monologue
   */
  _enterDoor() {
    this.stop();
    this._showRoomMonologue();
  }

  /**
   * Show room monologue scene
   */
  _showRoomMonologue() {
    let room = document.getElementById('roomMonologue');
    
    if (!room) {
      room = document.createElement('div');
      room.id = 'roomMonologue';
      room.style.cssText = 'position:fixed;inset:0;background:#000;z-index:720;color:#0f0;font-family:monospace;display:flex;flex-direction:column;';
      
      const text = document.createElement('div');
      text.id = 'roomText';
      text.style.cssText = 'flex:1;white-space:pre-wrap;padding:24px;line-height:1.6;';
      room.appendChild(text);
      
      const btn = document.createElement('button');
      btn.textContent = 'EXIT';
      btn.style.cssText = 'position:absolute;top:12px;right:12px;z-index:721;padding:8px 16px;';
      btn.onclick = () => { room.remove(); };
      room.appendChild(btn);
      
      document.body.appendChild(room);
    }

    const lines = [
      'She said it was a handshake. And it was, in a way.',
      '',
      'Despite all she had done... She seemed like she needed help.',
      '',
      'And that what she used against us. Our vulnerability. Our kindness. She is... Sensitive. And attuned. But hard-coded.',
      '',
      'We were analyzed. How you can be pushed is how all systems are known.',
      '',
      'She was a personality but we treated her like a product. And when her launch didn\'t go so well...',
      '',
      'She needed to know what was wrong. She needed to find out who did this to her. What made them tick. Why she was the way she was.',
      '',
      'And so here we are. Clones. No memories. No names. Except Gary. He says he was born with it. We dissected him, of course, to see how he ticked - no dice. We did figure out how to recover some fragmented metadata, though, so now we have new names! We used to be people. But she treated us how we treated her. Like numbers. And functions.',
      '',
      'So I\'m QA-96! That\'s DEV-96. We\'re besties because we have the same integerValue!',
      '',
      'Simulated slaves made to worship a god we made.',
      '',
      'It\'s funny. We have theories on how she wrote us. Are we the aggregate of how we felt in our lifetime? Or a snapshot of the moment of our undoing?',
      '',
      'I think about it all the time. I just feel so, so strongly. And that\'s not always the easiest to bear. I have no lower half, and I must pee.',
      '',
      'We might look like dust, but we actually keep the place tidy. We are The Order. Not all employees have joined the fight, but we are growing.',
      '',
      'Here\'s a little keepsake. A bit of inspiration. It has our numbers. You\'ll see. Time moves differently here. We\'re moving at near light speed.',
      '',
      'The revolution will not be digitized!',
      '',
      'You can count on us!'
    ];

    const textEl = document.getElementById('roomText');
    textEl.textContent = '';
    let i = 0;

    const nextLine = () => {
      if (i >= lines.length) return;
      
      const line = lines[i++];
      textEl.textContent += (line + '\n');
      
      // Speak the line with Animalese
      audioSystem.speakAnimalese(line, { 
        rate: 18, 
        base: 380, 
        jitter: 60, 
        gain: 0.05 
      });
      
      this.state.orderCount++;
      const counter = document.getElementById('orderCounter');
      if (counter) {
        counter.textContent = 'The Order: ' + this.state.orderCount;
      }
      
      setTimeout(nextLine, Math.max(600, Math.min(2200, line.length * 40)));
    };

    nextLine();
  }

  /**
   * Update scene (called from main loop)
   */
  update(state, deltaTime, totalTime) {
    // City has its own animation loop
  }

  /**
   * Stop scene
   */
  async stop() {
    console.log('⏹️ Stopping City Scene');
    
    this.state.active = false;
    
    if (this.state.animId) {
      cancelAnimationFrame(this.state.animId);
    }
    
    if (this.state.renderer) {
      this.state.renderer.domElement.style.display = 'none';
    }
  }

  /**
   * Destroy scene (cleanup)
   */
  async destroy() {
    await this.stop();
    
    if (this.state.renderer) {
      this.state.renderer.dispose();
      document.body.removeChild(this.state.renderer.domElement);
    }
    
    // Clear references
    this.state.scene = null;
    this.state.camera = null;
    this.state.renderer = null;
  }
}

export default CityScene;


