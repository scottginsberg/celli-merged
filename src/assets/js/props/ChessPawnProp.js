import * as THREE from 'three';

/**
 * Create a stylized tabletop pawn.
 * @param {object} [options]
 * @param {number} [options.scale=1]
 * @param {object} [options.colors]
 * @returns {THREE.Group}
 */
export function createChessPawnProp(options = {}) {
  const { scale = 1, colors = {} } = options;

  const group = new THREE.Group();
  group.name = options.name || 'ChessPawnProp';

  const palette = {
    body: colors.body ?? 0xf5d48b,
    collar: colors.collar ?? 0xfff6d6,
    base: colors.base ?? 0x382819,
    highlight: colors.highlight ?? 0xffe4a3,
  };

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: palette.body,
    metalness: 0.2,
    roughness: 0.3,
  });

  const collarMaterial = new THREE.MeshStandardMaterial({
    color: palette.collar,
    metalness: 0.35,
    roughness: 0.25,
    emissive: new THREE.Color(palette.collar).multiplyScalar(0.15),
    emissiveIntensity: 0.45,
  });

  const baseMaterial = new THREE.MeshStandardMaterial({
    color: palette.base,
    metalness: 0.4,
    roughness: 0.6,
  });

  const highlightMaterial = new THREE.MeshStandardMaterial({
    color: palette.highlight,
    metalness: 0.5,
    roughness: 0.2,
  });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.9, 0.18, 48, 1, false), baseMaterial);
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const riser = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.65, 0.2, 48), bodyMaterial);
  riser.position.y = 0.19;
  riser.castShadow = true;
  riser.receiveShadow = true;
  group.add(riser);

  const lathePoints = [
    new THREE.Vector2(0, 0.38),
    new THREE.Vector2(0.32, 0.36),
    new THREE.Vector2(0.42, 0.62),
    new THREE.Vector2(0.36, 0.95),
    new THREE.Vector2(0.24, 1.22),
    new THREE.Vector2(0.18, 1.36),
    new THREE.Vector2(0.28, 1.54),
    new THREE.Vector2(0.18, 1.72),
    new THREE.Vector2(0.08, 1.78),
  ];

  const body = new THREE.Mesh(new THREE.LatheGeometry(lathePoints, 64), bodyMaterial);
  body.position.y = 0.18;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.08, 24, 72), collarMaterial);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 1.02;
  collar.castShadow = true;
  group.add(collar);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 32, 24), highlightMaterial);
  head.position.y = 1.74;
  head.castShadow = true;
  head.receiveShadow = true;
  group.add(head);

  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.04, 16, 48), collarMaterial);
  halo.rotation.x = Math.PI / 2;
  halo.position.y = 1.48;
  halo.castShadow = true;
  group.add(halo);

  group.scale.setScalar(scale);

  group.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  group.userData = {
    type: 'prop',
    propId: 'chessPawn',
    label: 'Chess Pawn',
  };

  return group;
}
