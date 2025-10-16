import * as THREE from 'three';

function createRoundedRectShape(width, height, radius) {
  const shape = new THREE.Shape();
  const hw = width / 2;
  const hh = height / 2;

  shape.moveTo(-hw + radius, -hh);
  shape.lineTo(hw - radius, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + radius);
  shape.lineTo(hw, hh - radius);
  shape.quadraticCurveTo(hw, hh, hw - radius, hh);
  shape.lineTo(-hw + radius, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - radius);
  shape.lineTo(-hw, -hh + radius);
  shape.quadraticCurveTo(-hw, -hh, -hw + radius, -hh);

  return shape;
}

function createDiamondShape(width, height) {
  const diamond = new THREE.Shape();
  const hw = width / 2;
  const hh = height / 2;
  diamond.moveTo(0, hh);
  diamond.lineTo(-hw, 0);
  diamond.lineTo(0, -hh);
  diamond.lineTo(hw, 0);
  diamond.closePath();
  return diamond;
}

/**
 * Create a generic playing card prop with rounded corners.
 * @param {object} [options]
 * @param {number} [options.scale=1]
 * @param {object} [options.colors]
 * @returns {THREE.Group}
 */
export function createPlayingCardProp(options = {}) {
  const { scale = 1, colors = {} } = options;

  const group = new THREE.Group();
  group.name = options.name || 'PlayingCardProp';

  const palette = {
    front: colors.front ?? 0xffffff,
    back: colors.back ?? 0x111827,
    edge: colors.edge ?? 0xd4d4d8,
    accent: colors.accent ?? 0xdc2626,
    glyph: colors.glyph ?? 0x111827,
  };

  const cardWidth = 2.1;
  const cardHeight = 3.2;
  const cornerRadius = 0.28;
  const thickness = 0.08;

  const shape = createRoundedRectShape(cardWidth, cardHeight, cornerRadius);

  const edgeGeometry = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: false,
    steps: 1,
  });
  edgeGeometry.center();

  const frontGeometry = new THREE.ShapeGeometry(shape);
  const backGeometry = frontGeometry.clone();

  const edgeMaterial = new THREE.MeshStandardMaterial({
    color: palette.edge,
    metalness: 0.25,
    roughness: 0.45,
  });

  const frontMaterial = new THREE.MeshStandardMaterial({
    color: palette.front,
    metalness: 0.1,
    roughness: 0.4,
  });

  const backMaterial = new THREE.MeshStandardMaterial({
    color: palette.back,
    metalness: 0.35,
    roughness: 0.45,
  });

  const edgeMesh = new THREE.Mesh(edgeGeometry, edgeMaterial);
  edgeMesh.castShadow = true;
  edgeMesh.receiveShadow = true;

  const frontFace = new THREE.Mesh(frontGeometry, frontMaterial);
  frontFace.position.z = thickness / 2;
  frontFace.castShadow = true;
  frontFace.receiveShadow = true;

  const backFace = new THREE.Mesh(backGeometry, backMaterial);
  backFace.position.z = -thickness / 2;
  backFace.rotation.y = Math.PI;
  backFace.castShadow = true;
  backFace.receiveShadow = true;

  group.add(edgeMesh, frontFace, backFace);

  const pipShape = createDiamondShape(0.36, 0.6);
  const pipGeometry = new THREE.ShapeGeometry(pipShape);
  const pipMaterial = new THREE.MeshStandardMaterial({
    color: palette.accent,
    metalness: 0.35,
    roughness: 0.3,
    emissive: new THREE.Color(palette.accent).multiplyScalar(0.2),
    emissiveIntensity: 0.4,
  });

  const pipTop = new THREE.Mesh(pipGeometry, pipMaterial);
  pipTop.position.set(-0.7, 0.95, thickness / 2 + 0.001);
  group.add(pipTop);

  const pipBottom = pipTop.clone();
  pipBottom.rotation.z = Math.PI;
  pipBottom.position.set(0.7, -0.95, thickness / 2 + 0.001);
  group.add(pipBottom);

  const centerDiamond = new THREE.Mesh(pipGeometry.clone(), pipMaterial.clone());
  centerDiamond.scale.set(1.4, 1.4, 1.4);
  centerDiamond.position.set(0, 0, thickness / 2 + 0.002);
  group.add(centerDiamond);

  const glyphMaterial = new THREE.MeshStandardMaterial({
    color: palette.glyph,
    metalness: 0.25,
    roughness: 0.25,
  });

  const glyphShape = createDiamondShape(0.4, 0.4);
  const glyphMesh = new THREE.Mesh(new THREE.ShapeGeometry(glyphShape), glyphMaterial);
  glyphMesh.scale.set(0.65, 0.85, 1);
  glyphMesh.rotation.z = Math.PI / 4;
  glyphMesh.position.set(0, 0, -thickness / 2 - 0.001);
  group.add(glyphMesh);

  group.rotation.x = -Math.PI / 2.2;
  group.rotation.z = Math.PI / 16;
  group.scale.setScalar(scale);

  group.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  group.userData = {
    type: 'prop',
    propId: 'playingCard',
    label: 'Playing Card',
  };

  return group;
}
