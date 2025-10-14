import * as THREE from 'three';

/**
 * Create a stylized film camera prop inspired by the record button iconography.
 * @param {object} [options]
 * @param {number} [options.scale=1]
 * @param {object} [options.colors]
 * @returns {THREE.Group}
 */
export function createFilmCameraProp(options = {}) {
  const { scale = 1, colors = {} } = options;

  const group = new THREE.Group();
  group.name = options.name || 'FilmCameraProp';

  const palette = {
    body: colors.body || 0x1c1f26,
    accent: colors.accent || 0x4cc0ff,
    lens: colors.lens || 0x1a8cff,
    trim: colors.trim || 0x111317,
    leg: colors.leg || 0x0d0f12,
  };

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: palette.body,
    metalness: 0.5,
    roughness: 0.4,
  });

  const trimMaterial = new THREE.MeshStandardMaterial({
    color: palette.trim,
    metalness: 0.6,
    roughness: 0.35,
  });

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: palette.accent,
    emissive: new THREE.Color(palette.accent).multiplyScalar(0.25),
    emissiveIntensity: 0.6,
    metalness: 0.3,
    roughness: 0.2,
  });

  const legMaterial = new THREE.MeshStandardMaterial({
    color: palette.leg,
    metalness: 0.4,
    roughness: 0.5,
  });

  const lensMaterial = new THREE.MeshStandardMaterial({
    color: palette.lens,
    metalness: 0.7,
    roughness: 0.15,
    emissive: new THREE.Color(palette.lens).multiplyScalar(0.35),
    emissiveIntensity: 0.5,
  });

  // Main camera body
  const bodyGeometry = new THREE.BoxGeometry(1.8, 1.05, 1.05, 2, 2, 2);
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.set(0, 1.1, 0);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Accent stripe inspired by the record icon highlight
  const accentGeometry = new THREE.BoxGeometry(1.9, 0.14, 1.12);
  const accent = new THREE.Mesh(accentGeometry, accentMaterial);
  accent.position.set(0, 1.45, 0);
  accent.castShadow = true;
  group.add(accent);

  // Lens barrel
  const lensGeometry = new THREE.CylinderGeometry(0.35, 0.4, 1.05, 24, 1, true);
  const lens = new THREE.Mesh(lensGeometry, lensMaterial);
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, 1.1, 0.78);
  lens.castShadow = true;
  group.add(lens);

  // Lens rim
  const lensRimGeometry = new THREE.TorusGeometry(0.4, 0.05, 16, 32);
  const lensRim = new THREE.Mesh(lensRimGeometry, trimMaterial);
  lensRim.rotation.x = Math.PI / 2;
  lensRim.position.set(0, 1.1, 1.3);
  lensRim.castShadow = true;
  group.add(lensRim);

  // Viewfinder hood
  const hoodGeometry = new THREE.BoxGeometry(0.8, 0.35, 0.6);
  const hood = new THREE.Mesh(hoodGeometry, trimMaterial);
  hood.position.set(-1.0, 1.35, -0.2);
  hood.castShadow = true;
  group.add(hood);

  // Dual film reels inspired by the SVG record button
  const reelMaterial = new THREE.MeshStandardMaterial({
    color: 0x202630,
    metalness: 0.55,
    roughness: 0.35,
  });

  const reelCapMaterial = new THREE.MeshStandardMaterial({
    color: 0x0f1216,
    metalness: 0.6,
    roughness: 0.4,
  });

  const createReel = (xOffset) => {
    const reelGroup = new THREE.Group();

    const discGeom = new THREE.CylinderGeometry(0.55, 0.55, 0.18, 48, 1, false);
    const disc = new THREE.Mesh(discGeom, reelMaterial);
    disc.rotation.x = Math.PI / 2;
    disc.castShadow = true;
    reelGroup.add(disc);

    const capGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.3, 32);
    const cap = new THREE.Mesh(capGeom, reelCapMaterial);
    cap.rotation.x = Math.PI / 2;
    cap.position.set(0, 0, 0.18);
    reelGroup.add(cap);

    const spokesGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.95, 16);
    const spokes = new THREE.Mesh(spokesGeom, reelCapMaterial);
    spokes.rotation.z = Math.PI / 2;
    spokes.position.set(0, 0, 0.02);
    reelGroup.add(spokes);

    reelGroup.position.set(xOffset, 1.85, -0.2);
    return reelGroup;
  };

  const reelLeft = createReel(-0.65);
  const reelRight = createReel(0.65);
  group.add(reelLeft);
  group.add(reelRight);

  // Tripod legs
  const legLength = 1.4;
  const legGeom = new THREE.CylinderGeometry(0.05, 0.05, legLength, 12);

  const createLeg = (angleDeg) => {
    const leg = new THREE.Mesh(legGeom, legMaterial);
    leg.castShadow = true;
    leg.geometry.computeBoundingBox();
    const angle = THREE.MathUtils.degToRad(angleDeg);
    leg.position.set(Math.cos(angle) * 0.5, legLength / 2, Math.sin(angle) * 0.5);
    leg.rotation.z = Math.cos(angle) * -0.25;
    leg.rotation.x = Math.sin(angle) * 0.25;
    return leg;
  };

  group.add(createLeg(20));
  group.add(createLeg(160));
  group.add(createLeg(290));

  // Tripod hub
  const hubGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.18, 24);
  const hub = new THREE.Mesh(hubGeometry, legMaterial);
  hub.position.set(0, 0.9, 0);
  hub.castShadow = true;
  group.add(hub);

  // Elevation column
  const columnGeometry = new THREE.CylinderGeometry(0.12, 0.12, 1.2, 24);
  const column = new THREE.Mesh(columnGeometry, legMaterial);
  column.position.set(0, 1.45, 0);
  column.castShadow = true;
  group.add(column);

  // Decorative control panel on camera body
  const controlPanelGeometry = new THREE.BoxGeometry(0.65, 0.4, 0.05);
  const controlPanel = new THREE.Mesh(controlPanelGeometry, trimMaterial);
  controlPanel.position.set(0.7, 1.05, -0.48);
  controlPanel.castShadow = true;
  group.add(controlPanel);

  const indicatorGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.04, 16);
  const indicator = new THREE.Mesh(indicatorGeometry, accentMaterial);
  indicator.rotation.x = Math.PI / 2;
  indicator.position.set(0.85, 1.15, -0.5);
  group.add(indicator);

  group.scale.setScalar(scale);

  group.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  group.userData = {
    type: 'prop',
    propId: 'filmCamera',
    label: 'Film Camera',
  };

  return group;
}
