/**
 * AvatarFactory - Character Creation System
 * 
 * Creates Celli and Arraya avatars with proper geometry and animations.
 * Extracted from merged2.html lines 27482-28200
 * 
 * Includes:
 * - createCelli() - Main Celli avatar with bow, arms, legs
 * - Arraya avatar system (worm-like character)
 * - Border Celli variant
 * - Proper materials and outlines
 */

const ARRAYA_BASE_SCALE = 0.28;

function enableAccessorySystem(THREE, root, anchorEntries = {}) {
  const accessories = new Map();
  const anchors = new Map();

  if (!root || !THREE) return null;

  anchors.set('root', root);
  if (anchorEntries && typeof anchorEntries === 'object') {
    Object.entries(anchorEntries).forEach(([key, value]) => {
      if (value) anchors.set(key, value);
    });
  }

  const tmpBox = new THREE.Box3();
  const tmpSize = new THREE.Vector3();
  const tmpCenter = new THREE.Vector3();

  const resolveAnchor = (ref) => {
    if (!ref) return anchors.get('root');
    if (typeof ref === 'string') return anchors.get(ref) || null;
    return ref;
  };

  const system = {
    anchors,
    addAnchor(name, object) {
      if (name && object) anchors.set(name, object);
    },
    getAnchor(name) {
      return anchors.get(name) || null;
    },
    addAccessory(name, object, options = {}) {
      if (!name || !object) return null;
      const existing = accessories.get(name);
      if (existing) this.removeAccessory(name);

      const parent = resolveAnchor(options.parent) || root;
      parent.add(object);

      if (options.position) {
        if (options.position.isVector3) {
          object.position.copy(options.position);
        } else {
          const { x = 0, y = 0, z = 0 } = options.position;
          object.position.set(x, y, z);
        }
      }

      if (options.rotation) {
        if (options.rotation.isEuler) {
          object.rotation.copy(options.rotation);
        } else {
          const { x = 0, y = 0, z = 0 } = options.rotation;
          object.rotation.set(x, y, z);
        }
      }

      if (options.scale) {
        if (options.scale.isVector3) {
          object.scale.copy(options.scale);
        } else {
          const { x = 1, y = 1, z = 1 } = options.scale;
          object.scale.set(x, y, z);
        }
      }

      object.userData.accessoryName = name;
      accessories.set(name, { object, parent, options });
      return object;
    },
    removeAccessory(name) {
      const entry = accessories.get(name);
      if (!entry) return null;
      if (entry.object.parent) entry.object.parent.remove(entry.object);
      accessories.delete(name);
      return entry.object;
    },
    getAccessory(name) {
      return accessories.get(name)?.object || null;
    },
    toggleAccessory(name, factory, options = {}) {
      if (accessories.has(name)) {
        this.removeAccessory(name);
        return null;
      }
      const created = typeof factory === 'function' ? factory() : factory;
      return this.addAccessory(name, created, options);
    },
    measureWidth(target = 'root') {
      const anchor = resolveAnchor(target);
      if (!anchor) return 0;
      tmpBox.setFromObject(anchor);
      tmpBox.getSize(tmpSize);
      return tmpSize.x;
    },
    measureBounds(target = 'root') {
      const anchor = resolveAnchor(target);
      if (!anchor) return null;
      tmpBox.setFromObject(anchor);
      tmpBox.getCenter(tmpCenter);
      tmpBox.getSize(tmpSize);
      return {
        box: tmpBox.clone(),
        center: tmpCenter.clone(),
        size: tmpSize.clone()
      };
    },
    fitAccessory(name, width) {
      const entry = accessories.get(name);
      if (!entry) return;
      const targetWidth = (typeof width === 'number' && isFinite(width))
        ? width
        : this.measureWidth(entry.options?.widthAnchor || entry.parent);
      const handler = entry.object?.userData?.setWidth || entry.object?.userData?.fitWidth;
      if (typeof handler === 'function') {
        handler.call(entry.object.userData, targetWidth);
      }
    },
    listAccessories() {
      return Array.from(accessories.keys());
    }
  };

  root.userData = root.userData || {};
  root.userData.accessorySystem = system;
  return system;
}

function createSunglasses(THREE, options = {}) {
  const group = new THREE.Group();
  group.name = options.name || 'SunglassesAccessory';

  const frameColor = options.frameColor ?? 0x111111;
  const lensColor = options.lensColor ?? 0x1b1f30;
  const lensOpacity = options.lensOpacity ?? 0.65;
  const lensRadius = options.lensRadius ?? 0.45;
  const lensThickness = options.lensThickness ?? 0.08;
  const armLength = options.armLength ?? 1.2;
  const minOffset = options.minCenterOffset ?? lensRadius * 0.8;
  const noseDepth = options.noseDepth ?? 0.04;

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: frameColor,
    metalness: 0.75,
    roughness: 0.28
  });

  const lensMaterial = new THREE.MeshStandardMaterial({
    color: lensColor,
    transparent: true,
    opacity: lensOpacity,
    metalness: 0.35,
    roughness: 0.18
  });

  const torusGeo = new THREE.TorusGeometry(lensRadius, lensThickness, 24, 64, Math.PI);
  torusGeo.rotateY(Math.PI / 2);

  const fillRadius = Math.max(0.01, lensRadius - lensThickness * 0.35);
  const fillGeo = new THREE.CircleGeometry(fillRadius, 32, Math.PI / 2, Math.PI);
  fillGeo.rotateY(Math.PI / 2);

  const makeLens = (sign) => {
    const lensGroup = new THREE.Group();
    lensGroup.name = sign < 0 ? 'SunglassesLensLeft' : 'SunglassesLensRight';

    const frame = new THREE.Mesh(torusGeo, frameMaterial.clone());
    if (sign < 0) frame.rotation.z = Math.PI;
    lensGroup.add(frame);

    const fill = new THREE.Mesh(fillGeo, lensMaterial.clone());
    if (sign < 0) fill.rotation.z = Math.PI;
    fill.position.z = noseDepth * 0.25;
    lensGroup.add(fill);

    return { lensGroup, frame, fill };
  };

  const left = makeLens(-1);
  const right = makeLens(1);

  const baseOffset = options.centerOffset ?? lensRadius * 1.1;
  left.lensGroup.position.x = -baseOffset;
  right.lensGroup.position.x = baseOffset;

  const bridgeShape = new THREE.Shape();
  const bridgeRadius = options.bridgeRadius ?? lensRadius * 0.65;
  bridgeShape.absarc(0, 0, bridgeRadius, Math.PI, 0, false);
  bridgeShape.lineTo(bridgeRadius, -bridgeRadius * 0.6);
  bridgeShape.lineTo(-bridgeRadius, -bridgeRadius * 0.6);
  bridgeShape.closePath();
  const bridgeGeo = new THREE.ShapeGeometry(bridgeShape);
  const bridge = new THREE.Mesh(bridgeGeo, frameMaterial.clone());
  bridge.rotation.y = Math.PI / 2;
  bridge.position.z = noseDepth * 0.5;
  const bridgeBaseWidth = bridgeRadius * 2;

  const armGeo = new THREE.BoxGeometry(lensThickness * 1.6, lensThickness * 1.2, armLength);
  const leftArm = new THREE.Mesh(armGeo, frameMaterial.clone());
  const rightArm = new THREE.Mesh(armGeo, frameMaterial.clone());
  leftArm.position.set(-(baseOffset + lensRadius * 0.55), 0, -armLength * 0.35);
  rightArm.position.set(baseOffset + lensRadius * 0.55, 0, -armLength * 0.35);

  group.add(left.lensGroup, right.lensGroup, bridge, leftArm, rightArm);

  const outerRadius = lensRadius + lensThickness;

  const setWidth = (width) => {
    if (!width || !isFinite(width)) return;
    const halfWidth = width * 0.5;
    const centerOffset = Math.max(minOffset, halfWidth - outerRadius * 0.1);
    left.lensGroup.position.x = -centerOffset;
    right.lensGroup.position.x = centerOffset;
    bridge.scale.x = Math.max(0.5, (centerOffset * 2) / (bridgeBaseWidth || 1));
    leftArm.position.x = -(centerOffset + outerRadius * 0.55);
    rightArm.position.x = centerOffset + outerRadius * 0.55;
  };

  group.userData.type = 'sunglasses';
  group.userData.setWidth = setWidth;
  group.userData.fitWidth = setWidth;

  setWidth(options.initialWidth ?? outerRadius * 4);

  return group;
}

export const AvatarFactory = {
  /**
   * Create Celli avatar
   * Requires THREE and RoundedBoxGeometry to be passed in
   */
  createCelli(THREE, RoundedBoxGeometry) {
    const MAT_BODY = new THREE.MeshToonMaterial({ color: 0xf59e0b });
    const MAT_DARK = new THREE.MeshToonMaterial({ color: 0x1f2937 }); // Gray-800
    const MAT_BLUSH = new THREE.MeshToonMaterial({ color: 0xec4899 });
    const MAT_WING = new THREE.MeshToonMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });

    function addOutline(child, scale=1.06){
      const outlineMat = new THREE.MeshBasicMaterial({ 
        color: MAT_DARK.color.getHex(), 
        side: THREE.BackSide 
      });
      const outline = new THREE.Mesh(child.geometry, outlineMat);
      outline.scale.setScalar(scale);
      outline.userData.isAvatarOutline = true;
      outline.renderOrder = 10499;
      child.add(outline);
      return outline;
    }

    function triWing(width=0.22, height=0.16, depth=0.02){
      const shape = new THREE.Shape();
      shape.moveTo(width/2, 0);
      shape.lineTo(-width/2, height/2);
      shape.lineTo(-width/2, -height/2);
      shape.lineTo(width/2, 0);
      const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled:false });
      geo.center();
      geo.computeVertexNormals();
      return geo;
    }

    const root = new THREE.Group();
    root.scale.setScalar(0.40);

    const BW=.8, BH=.8, BD=.3;
    const bodyGroup = new THREE.Group();
    const body = new THREE.Mesh(new RoundedBoxGeometry(BW, BH, BD, 6, .12), MAT_BODY);
    addOutline(body);
    bodyGroup.add(body);
    bodyGroup.position.y = BH/2;

    const faceGroup = new THREE.Group();
    const faceZ = BD/2 + 0.01;
    const eyeGeo = new THREE.SphereGeometry(0.05, 16, 12);
    const eyeL = new THREE.Mesh(eyeGeo, MAT_DARK); 
    addOutline(eyeL); 
    eyeL.scale.set(1, 2, .25); 
    eyeL.position.set(-.12,.13,faceZ);
    
    const eyeR = new THREE.Mesh(eyeGeo, MAT_DARK); 
    addOutline(eyeR); 
    eyeR.scale.set(1, 2, .25); 
    eyeR.position.set(.12,.13,faceZ);
    
    const blushGeo = new THREE.SphereGeometry(0.05, 16, 12);
    const cheekL = new THREE.Mesh(blushGeo, MAT_BLUSH); 
    addOutline(cheekL); 
    cheekL.scale.set(1.2,1,.2); 
    cheekL.position.set(-.25,-.08,faceZ);
    
    const cheekR = new THREE.Mesh(blushGeo, MAT_BLUSH); 
    addOutline(cheekR); 
    cheekR.scale.set(1.2,1,.2); 
    cheekR.position.set(.25,-.08,faceZ);
    
    const smileShape = new THREE.Shape();
    smileShape.moveTo(-0.12, -0.06);
    smileShape.quadraticCurveTo(0, -0.25, 0.12, -0.06);
    smileShape.quadraticCurveTo(0, -0.20, -0.12, -0.06);
    const smile = new THREE.Mesh(new THREE.ShapeGeometry(smileShape), MAT_DARK); 
    addOutline(smile);
    smile.position.z = faceZ;
    faceGroup.add(eyeL, eyeR, cheekL, cheekR, smile);
    bodyGroup.add(faceGroup);

    const bowGroup = new THREE.Group();
    const wingL = new THREE.Mesh(triWing(), MAT_WING); 
    addOutline(wingL);
    const wingR = new THREE.Mesh(triWing(), MAT_WING); 
    addOutline(wingR);
    wingL.rotation.y = 0;
    wingR.rotation.y = Math.PI;
    wingL.position.set(-0.18, 0, 0);
    wingR.position.set(0.18, 0, 0);
    wingL.scale.set(1.3, 1.3, 1.0);
    wingR.scale.set(1.3, 1.3, 1.0);
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 12), MAT_BODY); 
    addOutline(knot);
    knot.scale.set(1.5, 1.5, 1.5);
    bowGroup.add(wingL, wingR, knot);
    bowGroup.position.set(0, BH + 0.15, 0);

    const armRadius = .055;
    const handGeo = new THREE.SphereGeometry(armRadius, 16, 12);
    const shoulderX = BW * 0.38;
    const shoulderY = BH * 0.52;
    const shoulderZ = BD * 0.5 - armRadius * 0.4;
    const armTilt = THREE.MathUtils.degToRad(-8);
    const armSweep = THREE.MathUtils.degToRad(26);
    const armTuck = THREE.MathUtils.degToRad(-4);
    
    function makeArm(sign=1){
      const armRoot = new THREE.Group();
      const armCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, -0.015, 0.02),
        new THREE.Vector3(0.12 * sign, -0.16, 0.05),
        new THREE.Vector3(0.16 * sign, -0.28, 0.015)
      );
      const armGeo = new THREE.TubeGeometry(armCurve, 28, armRadius, 12, false);
      const upper = new THREE.Mesh(armGeo, MAT_BODY); 
      addOutline(upper, 1.04);
      const handGroup = new THREE.Group();
      const hand = new THREE.Mesh(handGeo, MAT_BODY); 
      addOutline(hand, 1.04);
      hand.position.copy(armCurve.getPoint(1));
      handGroup.position.add(new THREE.Vector3(sign * 0.012, -0.008, 0.01));
      handGroup.add(hand);
      armRoot.add(upper, handGroup);
      armRoot.position.set(sign * (shoulderX + armRadius * 0.6), shoulderY - 0.02, shoulderZ * 0.4);
      armRoot.rotation.set(armTilt, sign * armSweep, sign * armTuck);
      return { armRoot, handGroup };
    }
    const L = makeArm(-1), R = makeArm(+1);

    const legRadius = .06;
    const legCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0,0,0), 
      new THREE.Vector3(0,-.10,.022), 
      new THREE.Vector3(0,-.17,.036)
    ]);
    const legGeo = new THREE.TubeGeometry(legCurve, 12, legRadius, 12, false);
    const footGeo = new THREE.SphereGeometry(legRadius, 16, 12);
    
    function makeLeg(x){
      const legRoot = new THREE.Group();
      const leg = new THREE.Mesh(legGeo, MAT_BODY); 
      addOutline(leg, 1.04);
      const footGroup = new THREE.Group();
      const foot = new THREE.Mesh(footGeo, MAT_BODY); 
      addOutline(foot, 1.04);
      foot.position.copy(legCurve.getPoint(1));
      foot.scale.set(1.5,.8,1.2);
      footGroup.add(foot);
      legRoot.add(leg, footGroup);
      legRoot.position.set(x, 0, 0);
      return { legRoot, footGroup };
    }
    const legL = makeLeg(-.20), legR = makeLeg(.20);
    legR.legRoot.position.set(Math.abs(legL.legRoot.position.x), legL.legRoot.position.y, legL.legRoot.position.z);

    root.add(bodyGroup, bowGroup, L.armRoot, R.armRoot, legL.legRoot, legR.legRoot);

    const accessorySystem = enableAccessorySystem(THREE, root, {
      body: bodyGroup,
      face: faceGroup,
      bow: bowGroup
    });
    root.userData.faceGroup = faceGroup;
    root.userData.bodyGroup = bodyGroup;
    root.userData.bodyDimensions = { width: BW, height: BH, depth: BD };
    root.userData.faceForward = faceZ;
    root.userData.accessorySystem = accessorySystem;

    const BASE_RENDER_ORDER = 10500;
    
    // Function to update render order based on graphics settings
    root.userData.updateRenderOrder = function() {
      const hasFrostedGlass = window.FancyGraphics?.enabled && window.FancyGraphics?.settings?.transmission;
      const baseOrder = hasFrostedGlass ? BASE_RENDER_ORDER : (BASE_RENDER_ORDER + 1000);
      root.traverse(obj=>{
        if(!obj.isMesh) return;
        const isOutline = !!obj.userData?.isAvatarOutline;
        const isBowPart = (obj.parent === bowGroup || obj.parent?.parent === bowGroup);
        obj.renderOrder = isOutline ? (baseOrder - 1) : (isBowPart ? baseOrder + 50 : baseOrder);
      });
    };
    
    root.traverse(obj=>{
      if(!obj.isMesh) return;
      const isOutline = !!obj.userData?.isAvatarOutline;
      if(obj.material){
        obj.material.depthTest = true;
        obj.material.depthWrite = !isOutline;
        obj.material.toneMapped = false;
        if(isOutline){
          obj.material.transparent = true;
          obj.material.opacity = 1;
          obj.material.polygonOffset = true;
          obj.material.polygonOffsetFactor = -1;
          obj.material.polygonOffsetUnits = -1;
        } else if(obj.material.polygonOffset){
          obj.material.polygonOffset = false;
        }
      }
    });
    
    // Set initial render order
    root.userData.updateRenderOrder();

    root.userData.components = [
      {name:'Body', group: bodyGroup},
      {name:'Face', group: faceGroup},
      {name:'Eye L', group: eyeL},
      {name:'Eye R', group: eyeR},
      {name:'Cheek L', group: cheekL},
      {name:'Cheek R', group: cheekR},
      {name:'Bow', group: bowGroup},
      {name:'Bow / Left', group: wingL},
      {name:'Bow / Right', group: wingR},
      {name:'Bow / Center', group: knot},
      {name:'Arm L', group: L.armRoot},
      {name:'Arm L / Hand', group: L.handGroup},
      {name:'Arm R', group: R.armRoot},
      {name:'Arm R / Hand', group: R.handGroup},
      {name:'Leg L', group: legL.legRoot},
      {name:'Leg L / Foot', group: legL.legRoot.children[1]},
      {name:'Leg R', group: legR.legRoot},
      {name:'Leg R / Foot', group: legR.legRoot.children[1]},
    ];

    root.userData.bodyGroup = bodyGroup;
    return root;
  },

  /**
   * Create border-style Celli avatar (slab-based head, larger voxels)
   * Used in narrative and certain scenes
   */
  createCelliBorderAvatar(THREE, RoundedBoxGeometry, voxelScaleParam = 2) {
    const voxelScale = voxelScaleParam;
    const group = new THREE.Group();
    group.name = 'CelliBorderAvatar';

    // Colors matching Cell.real aesthetic
    const COLOR_HEAD = 0xf59e0b; // Amber
    const COLOR_CHEEK = 0xffc0cb; // Pink
    const COLOR_DARK = 0x374151; // Gray-700

    // Head (slab-shaped, not cube)
    const headW = 2.4 * voxelScale;
    const headH = 1.8 * voxelScale;
    const headD = 1.2 * voxelScale; // Thinner depth = slab
    const headGeo = new RoundedBoxGeometry(headW, headH, headD, 8, 0.2 * voxelScale);
    const headMat = new THREE.MeshStandardMaterial({
      color: COLOR_HEAD,
      roughness: 0.7,
      metalness: 0.1
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 3 * voxelScale; // Raised higher
    head.castShadow = true;
    head.receiveShadow = true;
    
    // Body frame (hollow border effect)
    const bodyFrame = new THREE.Group();
    bodyFrame.name = 'CelliBodyFrame';
    
    const frameThickness = 0.2 * voxelScale;
    const frameSize = 2 * voxelScale;
    const frameMat = new THREE.MeshStandardMaterial({
      color: COLOR_HEAD,
      roughness: 0.7,
      metalness: 0.1
    });
    
    // Create hollow frame
    const positions = [
      [-frameSize/2, -frameSize/2, 0], [frameSize/2, -frameSize/2, 0],
      [frameSize/2, frameSize/2, 0], [-frameSize/2, frameSize/2, 0]
    ];
    
    for (let i = 0; i < positions.length; i++) {
      const next = (i + 1) % positions.length;
      const start = positions[i];
      const end = positions[next];
      
      const dx = end[0] - start[0];
      const dy = end[1] - start[1];
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(length, frameThickness, frameThickness),
        frameMat
      );
      bar.position.set(
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2,
        0
      );
      bar.rotation.z = angle;
      bar.castShadow = true;
      bodyFrame.add(bar);
    }
    
    bodyFrame.position.y = voxelScale;

    // Eyes (larger voxels)
    const eyeSize = 0.3 * voxelScale;
    const eyeGeo = new THREE.BoxGeometry(eyeSize, eyeSize * 1.5, eyeSize * 0.3);
    const eyeMat = new THREE.MeshStandardMaterial({
      color: COLOR_DARK,
      roughness: 0.8,
      metalness: 0
    });
    
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.6 * voxelScale, 3.2 * voxelScale, headD/2 + 0.1 * voxelScale);
    eyeL.castShadow = true;
    
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.6 * voxelScale, 3.2 * voxelScale, headD/2 + 0.1 * voxelScale);
    eyeR.castShadow = true;

    // Cheeks (pink blush)
    const cheekSize = 0.35 * voxelScale;
    const cheekGeo = new THREE.SphereGeometry(cheekSize, 16, 16);
    const cheekMat = new THREE.MeshStandardMaterial({
      color: COLOR_CHEEK,
      roughness: 0.6,
      metalness: 0.1,
      transparent: true,
      opacity: 0.8
    });
    
    const cheekL = new THREE.Mesh(cheekGeo, cheekMat);
    cheekL.position.set(-0.8 * voxelScale, 2.7 * voxelScale, headD/2 + 0.05 * voxelScale);
    cheekL.scale.set(1, 0.8, 0.3);
    
    const cheekR = new THREE.Mesh(cheekGeo, cheekMat);
    cheekR.position.set(0.8 * voxelScale, 2.7 * voxelScale, headD/2 + 0.05 * voxelScale);
    cheekR.scale.set(1, 0.8, 0.3);

    // Eye lights (glowing effect)
    const eyeLightGeo = new THREE.SphereGeometry(0.08 * voxelScale, 8, 8);
    const eyeLightMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9
    });
    
    const eyeLightL = new THREE.Mesh(eyeLightGeo, eyeLightMat.clone());
    eyeLightL.position.copy(eyeL.position);
    eyeLightL.position.z += 0.1 * voxelScale;
    
    const eyeLightR = new THREE.Mesh(eyeLightGeo, eyeLightMat.clone());
    eyeLightR.position.copy(eyeR.position);
    eyeLightR.position.z += 0.1 * voxelScale;

    const eyes = [eyeL, eyeR];
    const eyeLights = [eyeLightL, eyeLightR];
    const blinkState = {
      countdown: THREE.MathUtils.randFloat(2.5, 5.5),
      minDelay: 2.5,
      maxDelay: 5.5,
      blinkDuration: 0.18,
      minScale: 0.2,
      baseScales: eyes.map(eye => eye.scale.y),
      progress: 0,
      blinking: false,
      lightMin: 0.2,
      lightMax: eyeLightMat.opacity
    };

    const applyBlinkAmount = (amount = 0) => {
      eyes.forEach((eye, index) => {
        const baseScale = blinkState.baseScales[index];
        eye.scale.y = THREE.MathUtils.lerp(baseScale, baseScale * blinkState.minScale, amount);
      });

      eyeLights.forEach(light => {
        if (light.material) {
          light.material.opacity = THREE.MathUtils.lerp(blinkState.lightMax, blinkState.lightMin, amount);
        }
      });
    };

    const updateBlink = (delta = 0.016) => {
      if (!blinkState.blinking) {
        blinkState.countdown -= delta;
        if (blinkState.countdown <= 0) {
          blinkState.blinking = true;
          blinkState.progress = 0;
          blinkState.countdown = THREE.MathUtils.randFloat(blinkState.minDelay, blinkState.maxDelay);
        } else {
          applyBlinkAmount(0);
          return;
        }
      }

      blinkState.progress += delta / blinkState.blinkDuration;
      const progress = Math.min(blinkState.progress, 1);
      const amount = Math.sin(progress * Math.PI);
      applyBlinkAmount(amount);

      if (progress >= 1) {
        blinkState.blinking = false;
        blinkState.progress = 0;
      }
    };

    const resetBlink = () => {
      blinkState.countdown = THREE.MathUtils.randFloat(blinkState.minDelay, blinkState.maxDelay);
      blinkState.progress = 0;
      blinkState.blinking = false;
      applyBlinkAmount(0);
    };

    applyBlinkAmount(0);

    // Assemble
    group.add(bodyFrame, head, eyeL, eyeR, cheekL, cheekR, eyeLightL, eyeLightR);

    // Store references
    group.userData.head = head;
    group.userData.bodyFrame = bodyFrame;
    group.userData.eyes = eyes;
    group.userData.eyeLights = eyeLights;
    group.userData.cheeks = [cheekL, cheekR];
    group.userData.blinkState = blinkState;
    group.userData.updateBlink = updateBlink;
    group.userData.resetBlink = resetBlink;
    group.userData.applyBlink = applyBlinkAmount;

    return group;
  },

  /**
   * Create Bob avatar (voxel block character from rave scene)
   * Pink/cyan voxel character with blocky aesthetic
   */
  createBob(THREE) {
    const voxelSize = 0.5;
    const voxelGeometry = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize);
    
    const bobGroup = new THREE.Group();
    bobGroup.name = 'BobAvatar';
    bobGroup.scale.setScalar(0.4);
    
    // Head material
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6b9d,
      emissive: 0xff1493,
      emissiveIntensity: 0.3,
      roughness: 0.5,
      metalness: 0.3
    });
    
    // Build voxel head (8x8x8)
    const headGroup = new THREE.Group();
    headGroup.name = 'BobHead';
    
    for (let x = -2; x <= 2; x++) {
      for (let y = 0; y <= 4; y++) {
        for (let z = -2; z <= 2; z++) {
          // Create hollow head with face
          const isEdge = Math.abs(x) === 2 || Math.abs(z) === 2 || y === 0 || y === 4;
          const isFace = z === 2 && y >= 1 && y <= 3;
          
          // Eyes
          const isEye = z === 2 && y === 3 && (x === -1 || x === 1);
          
          // Mouth
          const isMouth = z === 2 && y === 1 && Math.abs(x) <= 1;
          
          if (isEdge || (isFace && !isEye && !isMouth)) {
            const voxel = new THREE.Mesh(voxelGeometry, headMaterial.clone());
            voxel.position.set(x * voxelSize, y * voxelSize + 5, z * voxelSize);
            voxel.castShadow = true;
            
            // Make eyes and mouth glow
            if (isEye || isMouth) {
              voxel.material.color.setHex(0x00ffff);
              voxel.material.emissive.setHex(0x00ffff);
              voxel.material.emissiveIntensity = 0.8;
            }
            
            headGroup.add(voxel);
          }
        }
      }
    }
    
    // Body
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a7cff,
      emissive: 0x0066ff,
      emissiveIntensity: 0.2,
      roughness: 0.6,
      metalness: 0.2
    });
    
    const bodyGroup = new THREE.Group();
    bodyGroup.name = 'BobBody';
    
    for (let x = -1.5; x <= 1.5; x++) {
      for (let y = 0; y <= 3; y++) {
        for (let z = -1; z <= 1; z++) {
          if (Math.abs(x) >= 0.5 || Math.abs(z) >= 0.5) {
            const voxel = new THREE.Mesh(voxelGeometry, bodyMaterial.clone());
            voxel.position.set(x * voxelSize, y * voxelSize + 1, z * voxelSize);
            voxel.castShadow = true;
            bodyGroup.add(voxel);
          }
        }
      }
    }
    
    // Arms
    const armMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6b9d,
      emissive: 0xff1493,
      emissiveIntensity: 0.2,
      roughness: 0.5,
      metalness: 0.3
    });
    
    const leftArm = new THREE.Group();
    leftArm.name = 'BobLeftArm';
    const rightArm = new THREE.Group();
    rightArm.name = 'BobRightArm';
    
    for (let y = 0; y <= 2; y++) {
      const leftVoxel = new THREE.Mesh(voxelGeometry, armMaterial.clone());
      leftVoxel.position.set(-2 * voxelSize, (2.5 - y * 0.5) * voxelSize, 0);
      leftVoxel.castShadow = true;
      leftArm.add(leftVoxel);
      
      const rightVoxel = new THREE.Mesh(voxelGeometry, armMaterial.clone());
      rightVoxel.position.set(2 * voxelSize, (2.5 - y * 0.5) * voxelSize, 0);
      rightVoxel.castShadow = true;
      rightArm.add(rightVoxel);
    }
    
    bobGroup.add(headGroup);
    bobGroup.add(bodyGroup);
    bobGroup.add(leftArm);
    bobGroup.add(rightArm);
    
    // Store references for animation
    bobGroup.userData.head = headGroup;
    bobGroup.userData.body = bodyGroup;
    bobGroup.userData.leftArm = leftArm;
    bobGroup.userData.rightArm = rightArm;
    bobGroup.userData.type = 'bob';

    enableAccessorySystem(THREE, bobGroup, {
      root: bobGroup,
      body: bobGroup
    });

    return bobGroup;
  },

  /**
   * Create Pal-ette avatar (3D spreadsheet grid character from rave scene)
   * Animated grid of glowing cells with rainbow colors
   */
  createPalette(THREE) {
    const cellSize = 0.8;
    const gridWidth = 5;
    const gridHeight = 8;
    
    const paletteGroup = new THREE.Group();
    paletteGroup.name = 'PaletteAvatar';
    paletteGroup.scale.setScalar(0.3);
    
    const cells = [];
    
    for (let x = 0; x < gridWidth; x++) {
      for (let y = 0; y < gridHeight; y++) {
        // Cell frame
        const frameGeometry = new THREE.BoxGeometry(cellSize * 0.9, cellSize * 0.9, 0.1);
        const frameMaterial = new THREE.MeshStandardMaterial({
          color: 0x00ff00,
          emissive: 0x00ff00,
          emissiveIntensity: 0.3,
          roughness: 0.3,
          metalness: 0.7,
          transparent: true,
          opacity: 0.7
        });
        
        const cell = new THREE.Mesh(frameGeometry, frameMaterial);
        cell.position.set(
          (x - gridWidth / 2) * cellSize,
          y * cellSize + 1,
          0
        );
        cell.castShadow = true;
        
        // Add random content indicator
        if (Math.random() > 0.5) {
          const contentGeometry = new THREE.BoxGeometry(cellSize * 0.6, cellSize * 0.6, 0.05);
          const contentMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.5
          });
          const content = new THREE.Mesh(contentGeometry, contentMaterial);
          content.position.z = 0.08;
          cell.add(content);
          cell.userData.content = content;
        }
        
        paletteGroup.add(cell);
        cell.userData.originalY = cell.position.y;
        cell.userData.cellIndex = cells.length;
        cells.push(cell);
      }
    }
    
    // Store references for animation
    paletteGroup.userData.cells = cells;
    paletteGroup.userData.gridWidth = gridWidth;
    paletteGroup.userData.gridHeight = gridHeight;
    paletteGroup.userData.type = 'palette';

    enableAccessorySystem(THREE, paletteGroup, {
      grid: paletteGroup
    });

    return paletteGroup;
  },

  enableAccessories(THREE, group, anchors = {}) {
    return enableAccessorySystem(THREE, group, anchors);
  },

  createSunglasses(THREE, options = {}) {
    return createSunglasses(THREE, options);
  }
};

export default AvatarFactory;

