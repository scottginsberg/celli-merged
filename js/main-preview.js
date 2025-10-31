/**
 * Main Preview - 3D Version with Day Progression
 * Handles rendering, input, and village building system
 */

// Global systems
let interactionSystem;
let pedestrianAI;
let dialogueSystem;
let foodInteractionSystem;

// THREE.js
let scene, camera, renderer, controls;
let playerMesh;
let lastTime = 0;

// Day system
let currentDay = 1;
let tinyPeople = [];
let structures = [];
let resources = [];

// Input state
const keys = {};
let mouseX = 0;
let mouseY = 0;

// Event log
const eventLog = [];
const MAX_LOG_ITEMS = 10;

/**
 * Initialize all systems
 */
function init() {
    // Setup THREE.js
    setupThreeJS();
    
    // Initialize systems
    interactionSystem = new PedestrianInteractionSystem();
    pedestrianAI = new PedestrianAI(interactionSystem);
    dialogueSystem = new DialogueSystem(interactionSystem);
    foodInteractionSystem = new FoodInteractionSystem(interactionSystem, dialogueSystem);
    
    // Setup event handling
    setupEventHandlers();
    
    // Setup interaction system events
    interactionSystem.onEvent(handleInteractionEvent);
    
    // Initialize world
    createWorld();
    
    // Spawn initial entities
    spawnInitialEntities();
    
    // Start game loop
    requestAnimationFrame(gameLoop);
}

/**
 * Setup THREE.js scene
 */
function setupThreeJS() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 50, 500);
    
    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 15, 30);
    camera.lookAt(0, 0, 0);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('viewport').appendChild(renderer.domElement);
    
    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;
    controls.target.set(0, 0, 0);
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(50, 100, 50);
    dirLight.castShadow = true;
    dirLight.shadow.camera.left = -50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);
    
    // Resize handler
    window.addEventListener('resize', onWindowResize);
}

/**
 * Create world geometry
 */
function createWorld() {
    // Ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x7cbb5f,
        roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Create player
    createPlayer();
}

/**
 * Create player mesh with proper legs
 */
function createPlayer() {
    const scale = 1.0;
    const playerGroup = createCharacterMesh(scale, 0x2ecc71);
    
    playerMesh = playerGroup;
    scene.add(playerMesh);
    
    // Initialize player position in interaction system
    interactionSystem.player.x = 0;
    interactionSystem.player.y = 0;  // Maps to z in 3D world
    interactionSystem.player.z = 0;
}

/**
 * Create character mesh with proper legs and joints
 */
function createCharacterMesh(bodyScale, shirtColor) {
    const group = new THREE.Group();
    
    // Body proportions
    const torsoW = 0.5 * bodyScale;
    const torsoH = 0.8 * bodyScale;
    const torsoD = 0.3 * bodyScale;
    
    // Torso
    const torsoGeo = new THREE.BoxGeometry(torsoW, torsoH, torsoD);
    const torsoMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.6 });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = torsoH / 2;
    torso.castShadow = true;
    group.add(torso);
    
    // Head
    const headSize = 0.38 * bodyScale;
    const headGeo = new THREE.BoxGeometry(headSize, headSize, headSize * 0.9);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xFFE0BD, roughness: 0.7 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = torsoH + headSize / 2 + 0.05 * bodyScale;
    head.castShadow = true;
    group.add(head);
    
    // Arms
    const armW = 0.14 * bodyScale;
    const armH = 0.42 * bodyScale;
    const armMat = new THREE.MeshStandardMaterial({ color: 0x86C7FF, roughness: 0.6 });
    
    // Left arm
    const armL = new THREE.Group();
    const armLUpper = new THREE.Mesh(new THREE.BoxGeometry(armW, armH, armW), armMat);
    armLUpper.position.y = -armH / 2;
    armLUpper.castShadow = true;
    armL.add(armLUpper);
    armL.position.set(-torsoW / 2 - armW / 2 - 0.02 * bodyScale, torsoH * 0.8, 0);
    group.add(armL);
    
    // Right arm
    const armR = new THREE.Group();
    const armRUpper = new THREE.Mesh(new THREE.BoxGeometry(armW, armH, armW), armMat);
    armRUpper.position.y = -armH / 2;
    armRUpper.castShadow = true;
    armR.add(armRUpper);
    armR.position.set(torsoW / 2 + armW / 2 + 0.02 * bodyScale, torsoH * 0.8, 0);
    group.add(armR);
    
    // Legs with knees
    const legW = 0.16 * bodyScale;
    const legH = 0.48 * bodyScale;
    const shinH = 0.46 * bodyScale;
    const legMat = new THREE.MeshStandardMaterial({ color: 0x4A5568, roughness: 0.7 });
    const shinMat = new THREE.MeshStandardMaterial({ color: 0x5A6678, roughness: 0.7 });
    
    // Left leg
    const legL = new THREE.Group();
    const legLThigh = new THREE.Mesh(new THREE.BoxGeometry(legW, legH, legW), legMat);
    legLThigh.position.y = -legH / 2;
    legLThigh.castShadow = true;
    legL.add(legLThigh);
    
    // Knee joint
    const kneeJointSize = legW * 0.75;
    const kneeJointGeo = new THREE.SphereGeometry(kneeJointSize / 2, 8, 8);
    const kneeJointMat = new THREE.MeshStandardMaterial({ color: 0xFFE0BD, roughness: 0.7 });
    const legLKneeJoint = new THREE.Mesh(kneeJointGeo, kneeJointMat);
    legLKneeJoint.position.y = -legH;
    legLKneeJoint.castShadow = true;
    legL.add(legLKneeJoint);
    
    // Shin pivot
    const legLShinPivot = new THREE.Group();
    legLShinPivot.position.y = -legH;
    legLThigh.add(legLShinPivot);
    
    const legLShin = new THREE.Mesh(new THREE.BoxGeometry(legW * 0.85, shinH, legW * 0.85), shinMat);
    legLShin.position.y = -shinH / 2;
    legLShin.castShadow = true;
    legLShinPivot.add(legLShin);
    
    // Left foot
    const footW = 0.24 * bodyScale;
    const footH = 0.08 * bodyScale;
    const footD = 0.32 * bodyScale;
    const footMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.8 });
    const legLFoot = new THREE.Mesh(new THREE.BoxGeometry(footW, footH, footD), footMat);
    legLFoot.position.set(0, -shinH - footH / 2, footD * 0.15);
    legLFoot.castShadow = true;
    legLShinPivot.add(legLFoot);
    
    legL.position.set(-torsoW / 4, 0, 0);
    legL.userData.thigh = legLThigh;
    legL.userData.shinPivot = legLShinPivot;
    legL.userData.foot = legLFoot;
    group.add(legL);
    
    // Right leg
    const legR = new THREE.Group();
    const legRThigh = new THREE.Mesh(new THREE.BoxGeometry(legW, legH, legW), legMat);
    legRThigh.position.y = -legH / 2;
    legRThigh.castShadow = true;
    legR.add(legRThigh);
    
    // Knee joint
    const legRKneeJoint = new THREE.Mesh(kneeJointGeo, kneeJointMat);
    legRKneeJoint.position.y = -legH;
    legRKneeJoint.castShadow = true;
    legR.add(legRKneeJoint);
    
    // Shin pivot
    const legRShinPivot = new THREE.Group();
    legRShinPivot.position.y = -legH;
    legRThigh.add(legRShinPivot);
    
    const legRShin = new THREE.Mesh(new THREE.BoxGeometry(legW * 0.85, shinH, legW * 0.85), shinMat);
    legRShin.position.y = -shinH / 2;
    legRShin.castShadow = true;
    legRShinPivot.add(legRShin);
    
    // Right foot
    const legRFoot = new THREE.Mesh(new THREE.BoxGeometry(footW, footH, footD), footMat);
    legRFoot.position.set(0, -shinH - footH / 2, footD * 0.15);
    legRFoot.castShadow = true;
    legRShinPivot.add(legRFoot);
    
    legR.position.set(torsoW / 4, 0, 0);
    legR.userData.thigh = legRThigh;
    legR.userData.shinPivot = legRShinPivot;
    legR.userData.foot = legRFoot;
    group.add(legR);
    
    // Store references for animation
    group.userData.legLeft = legL;
    group.userData.legRight = legR;
    group.userData.armLeft = armL;
    group.userData.armRight = armR;
    group.userData.bodyScale = bodyScale;
    
    // Position so feet are at ground level
    const feetOffset = legH + shinH;
    group.position.y = feetOffset;
    
    return group;
}

/**
 * Setup event handlers
 */
function setupEventHandlers() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
    });
    
    window.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });
    
    // Mouse
    renderer.domElement.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });
    
    renderer.domElement.addEventListener('click', (e) => {
        handleCanvasClick(e);
    });
}

/**
 * Window resize
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Spawn initial entities
 */
function spawnInitialEntities() {
    // Spawn a few pedestrians
    for (let i = 0; i < 3; i++) {
        spawnPedestrian();
    }
    
    // Spawn some food
    for (let i = 0; i < 2; i++) {
        spawnFood();
    }
    
    // Initialize Day 1 - tiny people gathering
    initializeDay1();
}

/**
 * Day progression system
 */
function advanceDay() {
    currentDay++;
    
    if (currentDay > 3) {
        currentDay = 3;
        addToEventLog('info', 'Village is complete!');
        return;
    }
    
    document.getElementById('day-number').textContent = currentDay;
    
    switch (currentDay) {
        case 2:
            transitionToDay2();
            break;
        case 3:
            transitionToDay3();
            break;
    }
    
    addToEventLog('info', `Advanced to Day ${currentDay}`);
}

/**
 * Day 1: Tiny people gather resources
 */
function initializeDay1() {
    document.getElementById('day-status').textContent = 'Tiny people gathering resources...';
    
    // Spawn resource gathering tiny people
    for (let i = 0; i < 5; i++) {
        spawnTinyPerson('ant');
    }
    
    // Spawn resource piles
    spawnResourcePiles();
}

/**
 * Day 2: Build campsite
 */
function transitionToDay2() {
    document.getElementById('day-status').textContent = 'Building campsite...';
    
    // Spawn more tiny people
    for (let i = 0; i < 3; i++) {
        spawnTinyPerson('toy');
    }
    
    // Build campsite structures
    buildCampsite();
    
    addToEventLog('info', 'Tiny people are building a campsite!');
}

/**
 * Day 3: Build village
 */
function transitionToDay3() {
    document.getElementById('day-status').textContent = 'Village established!';
    
    // Expand to village
    buildVillage();
    
    addToEventLog('info', 'A tiny village has been built!');
}

/**
 * Spawn resource piles
 */
function spawnResourcePiles() {
    const resourceTypes = [
        { name: 'wood', color: 0x8b4513, size: 0.15 },
        { name: 'stone', color: 0x808080, size: 0.12 },
        { name: 'food', color: 0xffa500, size: 0.1 }
    ];
    
    for (let i = 0; i < 8; i++) {
        const type = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
        const x = (Math.random() - 0.5) * 20;
        const z = (Math.random() - 0.5) * 20;
        
        const geometry = new THREE.BoxGeometry(type.size, type.size, type.size);
        const material = new THREE.MeshStandardMaterial({ color: type.color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, type.size / 2, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        
        resources.push({
            type: type.name,
            mesh: mesh,
            collected: false
        });
    }
}

/**
 * Build campsite
 */
function buildCampsite() {
    // Campfire in center
    const campfire = createCampfire();
    campfire.position.set(0, 0, 0);
    scene.add(campfire);
    structures.push({ type: 'campfire', mesh: campfire });
    
    // Small tents around campfire
    for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const radius = 3;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        const tent = createTent();
        tent.position.set(x, 0, z);
        tent.rotation.y = angle + Math.PI;
        scene.add(tent);
        structures.push({ type: 'tent', mesh: tent });
    }
}

/**
 * Build village
 */
function buildVillage() {
    // Small houses
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 6;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        const house = createHouse();
        house.position.set(x, 0, z);
        house.rotation.y = angle + Math.PI;
        scene.add(house);
        structures.push({ type: 'house', mesh: house });
    }
    
    // Central well
    const well = createWell();
    well.position.set(0, 0, 0);
    scene.add(well);
    structures.push({ type: 'well', mesh: well });
    
    // Fences
    createFences();
}

/**
 * Create campfire
 */
function createCampfire() {
    const group = new THREE.Group();
    
    // Stone circle
    const stoneGeometry = new THREE.CylinderGeometry(0.3, 0.35, 0.1, 8);
    const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0x505050 });
    const stones = new THREE.Mesh(stoneGeometry, stoneMaterial);
    stones.receiveShadow = true;
    group.add(stones);
    
    // Fire (logs)
    const logGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 6);
    const logMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    
    for (let i = 0; i < 4; i++) {
        const log = new THREE.Mesh(logGeometry, logMaterial);
        log.position.y = 0.2;
        log.rotation.x = Math.PI / 2;
        log.rotation.z = (i / 4) * Math.PI;
        log.castShadow = true;
        group.add(log);
    }
    
    // Flame effect
    const flameGeometry = new THREE.ConeGeometry(0.15, 0.4, 8);
    const flameMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff6600,
        transparent: true,
        opacity: 0.7
    });
    const flame = new THREE.Mesh(flameGeometry, flameMaterial);
    flame.position.y = 0.4;
    group.add(flame);
    
    return group;
}

/**
 * Create tent
 */
function createTent() {
    const group = new THREE.Group();
    
    // Tent body (pyramid) - ant scale
    const tentGeometry = new THREE.ConeGeometry(0.025, 0.04, 4);
    const tentMaterial = new THREE.MeshStandardMaterial({ color: 0xd2691e });
    const tent = new THREE.Mesh(tentGeometry, tentMaterial);
    tent.position.y = 0.02;
    tent.rotation.y = Math.PI / 4;
    tent.castShadow = true;
    tent.receiveShadow = true;
    group.add(tent);
    
    return group;
}

/**
 * Create house
 */
function createHouse() {
    const group = new THREE.Group();
    
    // Walls - ant scale
    const wallGeometry = new THREE.BoxGeometry(0.04, 0.04, 0.04);
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xd4a574 });
    const walls = new THREE.Mesh(wallGeometry, wallMaterial);
    walls.position.y = 0.02;
    walls.castShadow = true;
    walls.receiveShadow = true;
    group.add(walls);
    
    // Roof
    const roofGeometry = new THREE.ConeGeometry(0.033, 0.025, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 0.053;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);
    
    // Door
    const doorGeometry = new THREE.BoxGeometry(0.0125, 0.02, 0.0025);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 0.01, 0.021);
    group.add(door);
    
    return group;
}

/**
 * Create well
 */
function createWell() {
    const group = new THREE.Group();
    
    // Base
    const baseGeometry = new THREE.CylinderGeometry(0.4, 0.45, 0.5, 12);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.25;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);
    
    // Posts
    const postGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
    const postMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    
    const post1 = new THREE.Mesh(postGeometry, postMaterial);
    post1.position.set(-0.3, 0.65, 0);
    post1.castShadow = true;
    group.add(post1);
    
    const post2 = new THREE.Mesh(postGeometry, postMaterial);
    post2.position.set(0.3, 0.65, 0);
    post2.castShadow = true;
    group.add(post2);
    
    // Roof beam
    const beamGeometry = new THREE.BoxGeometry(0.7, 0.08, 0.08);
    const beam = new THREE.Mesh(beamGeometry, postMaterial);
    beam.position.y = 1.05;
    beam.castShadow = true;
    group.add(beam);
    
    return group;
}

/**
 * Create fences
 */
function createFences() {
    const fenceRadius = 10;
    const fenceCount = 20;
    
    for (let i = 0; i < fenceCount; i++) {
        const angle = (i / fenceCount) * Math.PI * 2;
        const x = Math.cos(angle) * fenceRadius;
        const z = Math.sin(angle) * fenceRadius;
        
        const fenceGeometry = new THREE.BoxGeometry(0.05, 0.5, 0.05);
        const fenceMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const fence = new THREE.Mesh(fenceGeometry, fenceMaterial);
        fence.position.set(x, 0.25, z);
        fence.castShadow = true;
        scene.add(fence);
        
        structures.push({ type: 'fence', mesh: fence });
    }
}

/**
 * Spawn tiny person with proper legs
 */
function spawnTinyPerson(sizeType) {
    const scale = sizeType === 'ant' ? 0.02 : 0.35;
    
    const x = (Math.random() - 0.5) * 15;
    const z = (Math.random() - 0.5) * 15;
    
    // Create tiny person using character mesh function
    const personGroup = createCharacterMesh(scale, Math.random() * 0xffffff);
    personGroup.position.set(x, 0, z);
    scene.add(personGroup);
    
    // Add to interaction system
    const tinyPerson = {
        mesh: personGroup,
        x: x,
        y: z,  // Map z to y for 2D interaction system
        z: z,
        scale: scale,
        sizeType: sizeType,
        state: 'gathering',
        target: null,
        speed: 0.5 + Math.random() * 0.5,
        animTime: Math.random() * Math.PI * 2 // Random start for walk cycle
    };
    
    tinyPeople.push(tinyPerson);
    addToEventLog('info', `Spawned ${sizeType}-sized person`);
    
    return tinyPerson;
}

/**
 * Check if pedestrian notices nearby tiny people
 */
function checkPedestrianNoticesTinyPeople(ped) {
    // Only check occasionally to save performance
    if (Math.random() > 0.05) return;
    
    // Don't check if already in stomp animation
    if (ped.state === 'stomp_windup' || ped.state === 'stomping') return;
    const pedMesh = ped.mesh || ped.group;
    if (pedMesh && pedMesh.userData.stompAnimation) return;
    
    // Check for nearby tiny ant people
    for (let person of tinyPeople) {
        if (person.sizeType === 'ant') {
            const dx = ped.x - person.x;
            const dz = ped.z - person.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            
            // If ant-sized person is very close
            if (dist < 3 && Math.random() < 0.3) {
                // Trigger stomp reaction
                if (pedMesh) {
                    playStompAnimation(pedMesh, Math.random() < 0.5 ? 'left' : 'right');
                    addToEventLog('danger', `Pedestrian noticed ant-sized person at distance ${dist.toFixed(1)}!`);
                }
                break;  // Only stomp at one target at a time
            }
        }
    }
}

/**
 * Animate stomp - knee raise then rapid extension
 */
function playStompAnimation(pedMesh, stompLeg = 'right') {
    if (!pedMesh.userData.stompAnimation) {
        pedMesh.userData.stompAnimation = {
            active: true,
            phase: 0, // 0=raise, 1=hold, 2=stomp down, 3=recover
            time: 0,
            leg: stompLeg
        };
        
        addToEventLog('danger', 'Stomp animation started!');
    }
}

/**
 * Update stomp animation
 */
function updateStompAnimation(pedMesh, deltaTime) {
    const anim = pedMesh.userData.stompAnimation;
    if (!anim || !anim.active) return;
    
    anim.time += deltaTime;
    
    const leg = pedMesh.userData[anim.leg === 'right' ? 'legRight' : 'legLeft'];
    if (!leg) return;
    
    const thigh = leg.userData.thigh;
    const shinPivot = leg.userData.shinPivot;
    
    switch (anim.phase) {
        case 0: // Raise knee
            const raiseProgress = Math.min(anim.time / 0.4, 1);
            const raiseAngle = raiseProgress * Math.PI * 0.55; // 100 degrees forward
            
            // Rotate thigh forward (knee up)
            leg.rotation.x = raiseAngle;
            
            // Bend knee slightly
            if (shinPivot) {
                shinPivot.rotation.x = -raiseAngle * 0.3;
            }
            
            if (raiseProgress >= 1) {
                anim.phase = 1;
                anim.time = 0;
            }
            break;
            
        case 1: // Hold at top
            if (anim.time > 0.15) {
                anim.phase = 2;
                anim.time = 0;
            }
            break;
            
        case 2: // Stomp down rapidly
            const stompProgress = Math.min(anim.time / 0.15, 1);
            const stompAngle = (1 - stompProgress) * Math.PI * 0.55;
            
            // Rapidly extend leg down
            leg.rotation.x = stompAngle;
            
            // Straighten knee
            if (shinPivot) {
                shinPivot.rotation.x = -stompAngle * 0.3;
            }
            
            // Impact effect at end
            if (stompProgress >= 1) {
                // Check if player is under foot
                const footWorldPos = new THREE.Vector3();
                if (leg.userData.foot) {
                    leg.userData.foot.getWorldPosition(footWorldPos);
                    
                    const playerPos = playerMesh.position;
                    const dist = Math.sqrt(
                        Math.pow(footWorldPos.x - playerPos.x, 2) +
                        Math.pow(footWorldPos.z - playerPos.z, 2)
                    );
                    
                    if (dist < 0.5 && interactionSystem.player.scale < 0.1) {
                        addToEventLog('danger', '💥 STOMPED! You were crushed!');
                    }
                }
                
                anim.phase = 3;
                anim.time = 0;
            }
            break;
            
        case 3: // Recover to neutral
            const recoverProgress = Math.min(anim.time / 0.3, 1);
            
            // Smooth return to neutral
            leg.rotation.x = 0;
            if (shinPivot) {
                shinPivot.rotation.x = 0;
            }
            
            if (recoverProgress >= 1) {
                anim.active = false;
                pedMesh.userData.stompAnimation = null;
            }
            break;
    }
}

/**
 * Main game loop
 */
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    const dt = Math.min(deltaTime / 1000, 0.1);
    lastTime = timestamp;
    
    // Update
    update(dt);
    
    // Render
    render();
    
    // Continue loop
    requestAnimationFrame(gameLoop);
}

/**
 * Update all systems
 */
function update(deltaTime) {
    // Update player input
    updatePlayerInput(deltaTime);
    
    // Update tiny people
    updateTinyPeople(deltaTime);
    
    // Update interaction system
    interactionSystem.update(deltaTime);
    
    // Update AI for each pedestrian
    for (let ped of interactionSystem.pedestrians) {
        pedestrianAI.updateAI(ped, deltaTime);
        
        // Check if pedestrian notices tiny ant people
        checkPedestrianNoticesTinyPeople(ped);
        
        // Update stomp animation if active
        if (ped.mesh || ped.group) {
            const pedMesh = ped.mesh || ped.group;
            updateStompAnimation(pedMesh, deltaTime);
            
            // Animate walking if moving
            if (ped.state === 'walking' && ped.target) {
                ped.animTime = (ped.animTime || 0) + deltaTime * 6;
                animateWalking(pedMesh, ped.animTime);
            } else if (!pedMesh.userData.stompAnimation) {
                resetToIdlePose(pedMesh);
            }
        }
    }
    
    // Update controls
    controls.update();
    
    // Update UI
    updateUI();
    
    // Animate structures
    animateStructures(deltaTime);
}

/**
 * Update tiny people behavior
 */
function updateTinyPeople(deltaTime) {
    for (let person of tinyPeople) {
        switch (person.state) {
            case 'gathering':
                updateGatheringBehavior(person, deltaTime);
                break;
            case 'building':
                updateBuildingBehavior(person, deltaTime);
                break;
            case 'idle':
                updateIdleBehavior(person, deltaTime);
                break;
        }
        
        // Update mesh position and sync y with z for 2D interaction system
        person.mesh.position.set(person.x, 0, person.z);
        person.y = person.z;  // Keep y synced with z for interaction detection
        
        // Animate walking
        if (person.target && (person.state === 'gathering' || person.state === 'building')) {
            person.animTime += deltaTime * 8;
            animateWalking(person.mesh, person.animTime);
        } else {
            // Reset to idle pose
            resetToIdlePose(person.mesh);
        }
    }
}

/**
 * Animate walking cycle
 */
function animateWalking(mesh, animTime) {
    const legLeft = mesh.userData.legLeft;
    const legRight = mesh.userData.legRight;
    
    if (legLeft && legRight) {
        // Swing legs opposite
        const leftAngle = Math.sin(animTime) * 0.4;
        const rightAngle = Math.sin(animTime + Math.PI) * 0.4;
        
        legLeft.rotation.x = leftAngle;
        legRight.rotation.x = rightAngle;
        
        // Subtle knee bend
        if (legLeft.userData.shinPivot) {
            legLeft.userData.shinPivot.rotation.x = Math.max(0, -leftAngle * 0.5);
        }
        if (legRight.userData.shinPivot) {
            legRight.userData.shinPivot.rotation.x = Math.max(0, -rightAngle * 0.5);
        }
    }
    
    // Arm swing
    const armLeft = mesh.userData.armLeft;
    const armRight = mesh.userData.armRight;
    
    if (armLeft && armRight) {
        armLeft.rotation.x = Math.sin(animTime + Math.PI) * 0.3;
        armRight.rotation.x = Math.sin(animTime) * 0.3;
    }
}

/**
 * Reset character to idle pose
 */
function resetToIdlePose(mesh) {
    const legLeft = mesh.userData.legLeft;
    const legRight = mesh.userData.legRight;
    const armLeft = mesh.userData.armLeft;
    const armRight = mesh.userData.armRight;
    
    if (legLeft) {
        legLeft.rotation.x = 0;
        if (legLeft.userData.shinPivot) legLeft.userData.shinPivot.rotation.x = 0;
    }
    if (legRight) {
        legRight.rotation.x = 0;
        if (legRight.userData.shinPivot) legRight.userData.shinPivot.rotation.x = 0;
    }
    if (armLeft) armLeft.rotation.x = 0;
    if (armRight) armRight.rotation.x = 0;
}

/**
 * Update gathering behavior
 */
function updateGatheringBehavior(person, deltaTime) {
    if (!person.target) {
        // Find nearest resource
        let nearestResource = null;
        let nearestDist = Infinity;
        
        for (let resource of resources) {
            if (!resource.collected) {
                const dist = Math.sqrt(
                    Math.pow(person.x - resource.mesh.position.x, 2) +
                    Math.pow(person.z - resource.mesh.position.z, 2)
                );
                
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestResource = resource;
                }
            }
        }
        
        if (nearestResource) {
            person.target = nearestResource;
        } else {
            // No more resources, switch to building
            person.state = 'building';
        }
    } else {
        // Move toward target
        const dx = person.target.mesh.position.x - person.x;
        const dz = person.target.mesh.position.z - person.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < 0.2) {
            // Reached resource
            person.target.collected = true;
            person.target.mesh.scale.y *= 0.9;
            if (person.target.mesh.scale.y < 0.1) {
                scene.remove(person.target.mesh);
            }
            person.target = null;
        } else {
            person.x += (dx / dist) * person.speed * deltaTime;
            person.z += (dz / dist) * person.speed * deltaTime;
        }
    }
}

/**
 * Update building behavior
 */
function updateBuildingBehavior(person, deltaTime) {
    // Wander near structures
    if (!person.target || Math.random() < 0.01) {
        if (structures.length > 0) {
            const structure = structures[Math.floor(Math.random() * structures.length)];
            person.target = {
                mesh: {
                    position: {
                        x: structure.mesh.position.x + (Math.random() - 0.5) * 2,
                        z: structure.mesh.position.z + (Math.random() - 0.5) * 2
                    }
                }
            };
        }
    }
    
    if (person.target) {
        const dx = person.target.mesh.position.x - person.x;
        const dz = person.target.mesh.position.z - person.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < 0.1) {
            person.state = 'idle';
            person.target = null;
        } else {
            person.x += (dx / dist) * person.speed * deltaTime * 0.5;
            person.z += (dz / dist) * person.speed * deltaTime * 0.5;
        }
    }
}

/**
 * Update idle behavior
 */
function updateIdleBehavior(person, deltaTime) {
    if (Math.random() < 0.02) {
        person.state = 'building';
    }
}

/**
 * Animate structures
 */
function animateStructures(deltaTime) {
    const time = Date.now() * 0.001;
    
    for (let structure of structures) {
        if (structure.type === 'campfire') {
            // Flicker fire
            const flame = structure.mesh.children[structure.mesh.children.length - 1];
            if (flame) {
                flame.scale.y = 1 + Math.sin(time * 10) * 0.2;
                flame.material.opacity = 0.6 + Math.sin(time * 8) * 0.2;
            }
        }
    }
}

/**
 * Update player from input
 */
function updatePlayerInput(deltaTime) {
    const player = interactionSystem.player;
    const speed = 10 * deltaTime;
    
    // Movement
    if (keys['w'] || keys['arrowup']) {
        player.z -= speed;
        playerMesh.position.z -= speed;
    }
    if (keys['s'] || keys['arrowdown']) {
        player.z += speed;
        playerMesh.position.z += speed;
    }
    if (keys['a'] || keys['arrowleft']) {
        player.x -= speed;
        playerMesh.position.x -= speed;
    }
    if (keys['d'] || keys['arrowright']) {
        player.x += speed;
        playerMesh.position.x += speed;
    }
    
    // Scale change
    if (keys['q']) {
        player.scale = Math.max(0.01, player.scale - 0.5 * deltaTime);
        updatePlayerScale();
    }
    if (keys['e']) {
        player.scale = Math.min(2.0, player.scale + 0.5 * deltaTime);
        updatePlayerScale();
    }
    
    // Update player position - map z to y for 2D interaction system
    player.x = playerMesh.position.x;
    player.y = playerMesh.position.z;  // Map 3D z to 2D y
    player.z = playerMesh.position.z;
    player.height = 180 * player.scale;
}

/**
 * Update player mesh scale
 */
function updatePlayerScale() {
    const scale = interactionSystem.player.scale;
    playerMesh.scale.set(scale, scale, scale);
}

/**
 * Render scene
 */
function render() {
    renderer.render(scene, camera);
}

/**
 * Update UI elements
 */
function updateUI() {
    const player = interactionSystem.player;
    
    // Update player info
    document.getElementById('scale-display').textContent = player.scale.toFixed(2) + 'x';
    document.getElementById('height-display').textContent = Math.round(player.height) + 'cm';
    document.getElementById('pos-display').textContent = 
        `${player.x.toFixed(1)}, ${player.y.toFixed(1)}, ${player.z.toFixed(1)}`;
    
    const sizeCategory = interactionSystem.getSizeCategory(player.scale);
    document.getElementById('status-display').textContent = sizeCategory.toUpperCase();
}

/**
 * Handle interaction events
 */
function handleInteractionEvent(type, data) {
    addToEventLog(type, data);
    
    switch (type) {
        case 'stomp_initiated':
            playSound('stomp_windup');
            showDialogue(type, data);
            break;
        case 'toy_noticed':
            showDialogue(type, data);
            break;
    }
}

/**
 * Show dialogue box
 */
function showDialogue(eventType, context) {
    const dialogue = dialogueSystem.startDialogue(eventType, context);
    
    if (dialogue) {
        displayDialogue(dialogue);
    }
}

function displayDialogue(dialogue) {
    const dialogueBox = document.getElementById('dialogue-box');
    dialogueBox.innerHTML = '';
    
    // Speaker
    if (dialogue.speaker) {
        const speaker = document.createElement('div');
        speaker.className = 'dialogue-speaker';
        speaker.textContent = dialogue.speaker;
        dialogueBox.appendChild(speaker);
    }
    
    // Text
    const text = document.createElement('div');
    text.className = 'dialogue-text';
    text.textContent = dialogue.text;
    dialogueBox.appendChild(text);
    
    // Choices
    if (dialogue.responses && dialogue.responses.length > 0) {
        const choices = document.createElement('div');
        choices.className = 'dialogue-choices';
        
        dialogue.responses.forEach((response, index) => {
            const button = document.createElement('button');
            button.className = 'dialogue-choice';
            button.textContent = response.text;
            button.onclick = () => handleDialogueChoice(index);
            choices.appendChild(button);
        });
        
        dialogueBox.appendChild(choices);
    } else {
        setTimeout(() => {
            dialogueBox.style.display = 'none';
        }, 3000);
    }
    
    dialogueBox.style.display = 'block';
}

function handleDialogueChoice(index) {
    const nextDialogue = dialogueSystem.progressDialogue(index);
    
    if (nextDialogue) {
        displayDialogue(nextDialogue);
    } else {
        document.getElementById('dialogue-box').style.display = 'none';
    }
}

/**
 * Add event to log
 */
function addToEventLog(type, data) {
    const logContent = document.getElementById('log-content');
    
    const eventItem = document.createElement('div');
    eventItem.className = 'event-item';
    
    if (typeof type === 'string' && (type.includes('stomp') || type.includes('consumed'))) {
        eventItem.classList.add('event-danger');
    } else if (typeof type === 'string' && (type.includes('warning') || type.includes('food'))) {
        eventItem.classList.add('event-warning');
    }
    
    const message = formatEventMessage(type, data);
    eventItem.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    
    logContent.insertBefore(eventItem, logContent.firstChild);
    
    while (logContent.children.length > MAX_LOG_ITEMS) {
        logContent.removeChild(logContent.lastChild);
    }
}

function formatEventMessage(type, data) {
    if (typeof type !== 'string') return String(type);
    
    const messages = {
        stomp_initiated: 'Pedestrian preparing to stomp!',
        toy_noticed: 'Pedestrian thinks you\'re a toy!',
        info: data || 'Info event'
    };
    
    return messages[type] || type;
}

/**
 * Handle canvas click
 */
function handleCanvasClick(e) {
    // Raycasting for 3D click detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(mouseX, mouseY);
    
    raycaster.setFromCamera(mouse, camera);
    
    // Check intersections with pedestrians or tiny people
    // (Implementation would go here)
}

/**
 * Global functions for UI buttons
 */
function setPlayerScale(scale) {
    interactionSystem.player.scale = scale;
    updatePlayerScale();
    addToEventLog('info', `Scale set to ${scale}x`);
}

function spawnPedestrian() {
    const x = (Math.random() - 0.5) * 20;
    const z = (Math.random() - 0.5) * 20;
    
    // Create pedestrian with proper legs
    const shirtColors = [0xE53935, 0x1E88E5, 0x43A047]; // Red, Blue, Green
    const shirtColor = shirtColors[Math.floor(Math.random() * shirtColors.length)];
    
    const pedGroup = createCharacterMesh(1.0, shirtColor);
    pedGroup.position.set(x, 0, z);
    scene.add(pedGroup);
    
    const ped = {
        mesh: pedGroup,
        group: pedGroup,
        x: x,
        y: z,  // Map z to y for 2D interaction system
        z: z,
        state: 'idle',
        animTime: 0
    };
    
    interactionSystem.addPedestrian(ped);
    addToEventLog('info', 'Spawned pedestrian');
}

function spawnFood() {
    const x = (Math.random() - 0.5) * 15;
    const z = (Math.random() - 0.5) * 15;
    
    const type = foodInteractionSystem.getRandomFoodType();
    const food = foodInteractionSystem.createFoodItem(type, x, z);
    
    // Create food mesh
    const foodGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16);
    const foodMaterial = new THREE.MeshStandardMaterial({ color: 0xffa500 });
    const foodMesh = new THREE.Mesh(foodGeometry, foodMaterial);
    foodMesh.position.set(x, 0.1, z);
    foodMesh.castShadow = true;
    foodMesh.receiveShadow = true;
    scene.add(foodMesh);
    
    food.mesh = foodMesh;
    
    addToEventLog('info', `Spawned ${type}`);
}

/**
 * Test stomp animation on nearest pedestrian
 */
function testStompAnimation() {
    if (interactionSystem.pedestrians.length === 0) {
        addToEventLog('info', 'No pedestrians to stomp! Spawn one first.');
        return;
    }
    
    // Find nearest pedestrian to player
    let nearestPed = null;
    let nearestDist = Infinity;
    
    for (let ped of interactionSystem.pedestrians) {
        const dx = ped.x - interactionSystem.player.x;
        const dz = ped.z - interactionSystem.player.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < nearestDist) {
            nearestDist = dist;
            nearestPed = ped;
        }
    }
    
    if (nearestPed && (nearestPed.mesh || nearestPed.group)) {
        const pedMesh = nearestPed.mesh || nearestPed.group;
        playStompAnimation(pedMesh, 'right');
        addToEventLog('danger', '⚠️ Stomp animation triggered!');
    }
}

/**
 * Placeholder sound function
 */
function playSound(soundName) {
    console.log('Sound:', soundName);
}

// Start when page loads
window.addEventListener('load', init);
