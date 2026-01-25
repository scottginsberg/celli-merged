import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

export function createRocket({ THREE, scene, world, physics }) {
  const rocketGroup = new THREE.Group();

  const bodyRadius = 0.4;
  const bodyHeight = 4;
  const bodyGeo = new THREE.CylinderGeometry(bodyRadius, bodyRadius, bodyHeight, 16);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xEEEEEE,
    metalness: 0.6,
    roughness: 0.3
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = bodyHeight / 2;
  body.castShadow = true;
  rocketGroup.add(body);

  const coneHeight = 1.5;
  const coneGeo = new THREE.ConeGeometry(bodyRadius, coneHeight, 16);
  const coneMat = new THREE.MeshStandardMaterial({
    color: 0x22AA44,
    metalness: 0.5,
    roughness: 0.4
  });
  const cone = new THREE.Mesh(coneGeo, coneMat);
  cone.position.y = bodyHeight + coneHeight / 2;
  cone.castShadow = true;
  rocketGroup.add(cone);

  const finMat = new THREE.MeshStandardMaterial({
    color: 0x22AA44,
    metalness: 0.7,
    roughness: 0.3
  });

  const finThickness = 0.08;
  const segment1Height = 0.8;
  const segment1Width = 0.9;
  const segment2Height = 1.0;
  const segment2Width = 0.7;

  const segment1Geo = new THREE.BoxGeometry(segment1Width, segment1Height, finThickness);
  const segment1Mesh = new THREE.Mesh(segment1Geo);
  segment1Mesh.rotation.z = -Math.PI / 6;
  segment1Mesh.position.set(segment1Width * 0.5, segment1Height / 2 + 0.4, 0);
  segment1Mesh.updateMatrix();

  const segment2Geo = new THREE.BoxGeometry(segment2Width, segment2Height, finThickness);
  const segment2Mesh = new THREE.Mesh(segment2Geo);
  segment2Mesh.position.set(segment1Width + segment2Width * 0.5, segment2Height / 2, 0);
  segment2Mesh.updateMatrix();

  const mergedFinGeo = BufferGeometryUtils.mergeGeometries([
    segment1Mesh.geometry.clone().applyMatrix4(segment1Mesh.matrix),
    segment2Mesh.geometry.clone().applyMatrix4(segment2Mesh.matrix)
  ]);

  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2;
    const fin = new THREE.Mesh(mergedFinGeo, finMat);
    fin.position.x = Math.cos(angle) * bodyRadius;
    fin.position.z = Math.sin(angle) * bodyRadius;
    fin.rotation.y = angle;
    fin.castShadow = true;
    rocketGroup.add(fin);
  }

  const exhaustGroup = new THREE.Group();
  exhaustGroup.position.y = 0;

  const mainFlameGeo = new THREE.ConeGeometry(bodyRadius * 0.6, 1.5, 8);
  const mainFlameMat = new THREE.MeshBasicMaterial({
    color: 0xFFAA00,
    transparent: true,
    opacity: 0.9
  });
  const mainFlame = new THREE.Mesh(mainFlameGeo, mainFlameMat);
  mainFlame.position.y = -0.75;
  exhaustGroup.add(mainFlame);

  const plumeCount = 8;
  const plumeGeo = new THREE.ConeGeometry(bodyRadius * 0.25, 1.2, 6);
  const plumeMat = new THREE.MeshBasicMaterial({
    color: 0xFF6600,
    transparent: true,
    opacity: 0.7
  });

  for (let i = 0; i < plumeCount; i++) {
    const angle = (i / plumeCount) * Math.PI * 2;
    const plume = new THREE.Mesh(plumeGeo, plumeMat.clone());

    const radius = bodyRadius * 0.7;
    plume.position.x = Math.cos(angle) * radius;
    plume.position.z = Math.sin(angle) * radius;
    plume.position.y = -0.6;

    const tiltAngle = Math.PI * 0.15;
    plume.rotation.z = Math.cos(angle) * tiltAngle;
    plume.rotation.x = Math.sin(angle) * tiltAngle;

    exhaustGroup.add(plume);
  }

  exhaustGroup.visible = false;
  rocketGroup.add(exhaustGroup);
  rocketGroup.userData.exhaustGroup = exhaustGroup;

  rocketGroup.visible = false;
  scene.add(rocketGroup);

  const bodyDesc = physics.RigidBodyDesc.dynamic()
    .setTranslation(0, 5, 0)
    .setLinearDamping(0.1)
    .setAngularDamping(5.0);

  const rocketBody = world.createRigidBody(bodyDesc);
  rocketBody.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);

  const colliderDesc = physics.ColliderDesc.cylinder(bodyHeight / 2, bodyRadius);
  world.createCollider(colliderDesc, rocketBody);

  return { rocketMesh: rocketGroup, rocketBody };
}

export function createGiantFinger({ THREE, scene }) {
  if (typeof createGiantFingerSystem !== 'function') {
    console.warn('⚠️ Giant finger system unavailable; skipping.');
    return null;
  }

  return createGiantFingerSystem(THREE, scene, 6000);
}
