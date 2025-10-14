import * as THREE from 'three';

/**
 * Create a film reel prop with layered discs and wound film ribbon.
 * @param {object} [options]
 * @param {number} [options.scale=1]
 * @param {object} [options.colors]
 * @returns {THREE.Group}
 */
export function createFilmReelProp(options = {}) {
  const { scale = 1, colors = {} } = options;

  const group = new THREE.Group();
  group.name = options.name || 'FilmReelProp';

  const palette = {
    reel: colors.reel || 0xb0bec5,
    core: colors.core || 0x263238,
    film: colors.film || 0x37474f,
    highlight: colors.highlight || 0xe0f7fa,
  };

  const reelMaterial = new THREE.MeshStandardMaterial({
    color: palette.reel,
    metalness: 0.7,
    roughness: 0.35,
  });

  const coreMaterial = new THREE.MeshStandardMaterial({
    color: palette.core,
    metalness: 0.6,
    roughness: 0.4,
  });

  const filmMaterial = new THREE.MeshStandardMaterial({
    color: palette.film,
    metalness: 0.3,
    roughness: 0.55,
    emissive: new THREE.Color(palette.highlight).multiplyScalar(0.05),
  });

  // Outer discs with punched holes
  const discGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.15, 64, 1, false);
  const discInnerGeometry = new THREE.CylinderGeometry(1.15, 1.15, 0.17, 32, 1, false);

  const discFront = new THREE.Mesh(discGeometry, reelMaterial);
  discFront.rotation.x = Math.PI / 2;
  discFront.position.set(0, 0.3, 0);
  group.add(discFront);

  const discBack = discFront.clone();
  discBack.position.set(0, -0.3, 0);
  group.add(discBack);

  const innerFront = new THREE.Mesh(discInnerGeometry, filmMaterial);
  innerFront.rotation.x = Math.PI / 2;
  innerFront.position.set(0, 0.25, 0);
  group.add(innerFront);

  const innerBack = innerFront.clone();
  innerBack.position.set(0, -0.25, 0);
  group.add(innerBack);

  // Spokes (six evenly distributed)
  const spokeGeometry = new THREE.BoxGeometry(0.2, 0.1, 2.0);
  for (let i = 0; i < 6; i++) {
    const spoke = new THREE.Mesh(spokeGeometry, coreMaterial);
    spoke.rotation.y = (Math.PI / 3) * i;
    spoke.position.y = 0;
    group.add(spoke);
  }

  // Core cylinder
  const coreGeometry = new THREE.CylinderGeometry(0.45, 0.45, 0.9, 32);
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  core.rotation.x = Math.PI / 2;
  group.add(core);

  // Wound film ribbon
  const ribbonGeometry = new THREE.TorusGeometry(0.95, 0.18, 16, 48, Math.PI * 1.75);
  const ribbon = new THREE.Mesh(ribbonGeometry, filmMaterial);
  ribbon.rotation.x = Math.PI / 2;
  ribbon.position.z = -0.1;
  group.add(ribbon);

  const ribbonHighlightGeometry = new THREE.TorusGeometry(0.95, 0.06, 8, 48, Math.PI * 1.75);
  const ribbonHighlight = new THREE.Mesh(
    ribbonHighlightGeometry,
    new THREE.MeshStandardMaterial({
      color: palette.highlight,
      emissive: new THREE.Color(palette.highlight).multiplyScalar(0.3),
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.8,
    })
  );
  ribbonHighlight.rotation.x = Math.PI / 2;
  ribbonHighlight.position.z = -0.02;
  group.add(ribbonHighlight);

  group.scale.setScalar(scale);

  group.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  group.userData = {
    type: 'prop',
    propId: 'filmReel',
    label: 'Film Reel',
  };

  return group;
}
