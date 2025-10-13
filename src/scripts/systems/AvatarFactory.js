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

    // Assemble
    group.add(bodyFrame, head, eyeL, eyeR, cheekL, cheekR, eyeLightL, eyeLightR);

    // Store references
    group.userData.head = head;
    group.userData.bodyFrame = bodyFrame;
    group.userData.eyes = [eyeL, eyeR];
    group.userData.eyeLights = [eyeLightL, eyeLightR];
    group.userData.cheeks = [cheekL, cheekR];

    return group;
  }
};

export default AvatarFactory;

