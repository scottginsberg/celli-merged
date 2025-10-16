import * as THREE from 'three';

const PIP_LAYOUTS = {
  1: [[0, 0]],
  2: [[-0.22, -0.22], [0.22, 0.22]],
  3: [[-0.28, -0.28], [0, 0], [0.28, 0.28]],
  4: [[-0.28, -0.28], [-0.28, 0.28], [0.28, -0.28], [0.28, 0.28]],
  5: [[-0.28, -0.28], [-0.28, 0.28], [0, 0], [0.28, -0.28], [0.28, 0.28]],
  6: [[-0.3, -0.3], [-0.3, 0], [-0.3, 0.3], [0.3, -0.3], [0.3, 0], [0.3, 0.3]],
};

function createFace(value, axis, direction, geometry, material) {
  const layout = PIP_LAYOUTS[value] || [];
  const faceGroup = new THREE.Group();

  layout.forEach(([x, y]) => {
    const pip = new THREE.Mesh(geometry, material);

    if (axis === 'z') {
      pip.rotation.x = Math.PI / 2;
      pip.position.set(x, y, 0.52 * direction);
    } else if (axis === 'x') {
      pip.rotation.z = Math.PI / 2;
      pip.position.set(0.52 * direction, x, y);
    } else {
      pip.position.set(x, 0.52 * direction, y);
    }

    pip.castShadow = true;
    pip.receiveShadow = true;
    faceGroup.add(pip);
  });

  return faceGroup;
}

/**
 * Create a stylized dice prop with inset pips.
 * @param {object} [options]
 * @param {number} [options.scale=1]
 * @param {object} [options.colors]
 * @returns {THREE.Group}
 */
export function createDiceProp(options = {}) {
  const { scale = 1, colors = {} } = options;

  const group = new THREE.Group();
  group.name = options.name || 'DiceProp';

  const palette = {
    base: colors.base ?? 0xfafafa,
    edge: colors.edge ?? 0xd4d4d8,
    pip: colors.pip ?? 0x1f2937,
  };

  const cubeMaterial = new THREE.MeshStandardMaterial({
    color: palette.base,
    metalness: 0.25,
    roughness: 0.35,
  });

  const edgeMaterial = new THREE.MeshStandardMaterial({
    color: palette.edge,
    metalness: 0.35,
    roughness: 0.55,
    transparent: true,
    opacity: 0.6,
  });

  const pipMaterial = new THREE.MeshStandardMaterial({
    color: palette.pip,
    metalness: 0.3,
    roughness: 0.25,
  });

  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1, 8, 8, 8);
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.castShadow = true;
  cube.receiveShadow = true;
  group.add(cube);

  const rim = new THREE.Mesh(new THREE.BoxGeometry(1.04, 1.04, 1.04, 4, 4, 4), edgeMaterial);
  rim.castShadow = false;
  rim.receiveShadow = false;
  group.add(rim);

  const pipGeometry = new THREE.CylinderGeometry(0.11, 0.11, 0.08, 24);

  const faces = [
    createFace(1, 'z', 1, pipGeometry, pipMaterial),
    createFace(6, 'z', -1, pipGeometry, pipMaterial),
    createFace(2, 'x', 1, pipGeometry, pipMaterial),
    createFace(5, 'x', -1, pipGeometry, pipMaterial),
    createFace(3, 'y', 1, pipGeometry, pipMaterial),
    createFace(4, 'y', -1, pipGeometry, pipMaterial),
  ];

  faces.forEach((face) => group.add(face));

  const bevelEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.02, 1.02, 1.02, 2, 2, 2));
  const edgeLines = new THREE.LineSegments(
    bevelEdges,
    new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.15, transparent: true })
  );
  group.add(edgeLines);

  group.scale.setScalar(scale);

  group.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  group.userData = {
    type: 'prop',
    propId: 'dice',
    label: 'Dice',
  };

  return group;
}
