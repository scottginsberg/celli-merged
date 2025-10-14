import * as THREE from 'three';

/**
 * Create a strip of translucent film cells framed by perforated bars.
 * @param {object} [options]
 * @param {number} [options.scale=1]
 * @param {number} [options.cellCount=4]
 * @param {object} [options.colors]
 * @returns {THREE.Group}
 */
export function createFilmStripProp(options = {}) {
  const { scale = 1, cellCount = 4, colors = {} } = options;

  const group = new THREE.Group();
  group.name = options.name || 'FilmStripProp';

  const palette = {
    frame: colors.frame || 0x111111,
    cell: colors.cell || 0xf0f4f8,
    bar: colors.bar || 0x0a0c0f,
    hole: colors.hole || 0x1f1f1f,
  };

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: palette.frame,
    metalness: 0.45,
    roughness: 0.55,
  });

  const cellMaterial = new THREE.MeshStandardMaterial({
    color: palette.cell,
    transparent: true,
    opacity: 0.75,
    metalness: 0.05,
    roughness: 0.2,
  });

  const barMaterial = new THREE.MeshStandardMaterial({
    color: palette.bar,
    metalness: 0.5,
    roughness: 0.35,
  });

  const holeMaterial = new THREE.MeshStandardMaterial({
    color: palette.hole,
    metalness: 0.3,
    roughness: 0.6,
  });

  const spacing = 0.15;
  const cellWidth = 0.9;
  const totalWidth = cellCount * cellWidth + (cellCount + 1) * spacing;
  const totalHeight = 1.4;
  const depth = 0.08;

  // Background frame
  const frameGeometry = new THREE.BoxGeometry(totalWidth, totalHeight, depth);
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);
  frame.position.set(0, 0, 0);
  group.add(frame);

  // Film cells (rounded rectangles approximated by box segments)
  const cellHeight = 0.85;
  const cellDepth = 0.02;
  for (let i = 0; i < cellCount; i++) {
    const cellGeometry = new THREE.BoxGeometry(cellWidth - 0.08, cellHeight, cellDepth);
    const cell = new THREE.Mesh(cellGeometry, cellMaterial);
    cell.position.set(-totalWidth / 2 + spacing + cellWidth / 2 + i * (cellWidth + spacing), 0, 0.03);
    group.add(cell);

    // Surrounding bezel
    const bezelGeometry = new THREE.BoxGeometry(cellWidth, cellHeight + 0.08, 0.04);
    const bezel = new THREE.Mesh(bezelGeometry, barMaterial);
    bezel.position.copy(cell.position);
    bezel.position.z = 0.02;
    group.add(bezel);
  }

  // Top and bottom perforated bars
  const barGeometry = new THREE.BoxGeometry(totalWidth + 0.12, 0.2, 0.09);
  const topBar = new THREE.Mesh(barGeometry, barMaterial);
  topBar.position.set(0, totalHeight / 2 - 0.1, 0.01);
  group.add(topBar);

  const bottomBar = topBar.clone();
  bottomBar.position.y = -totalHeight / 2 + 0.1;
  group.add(bottomBar);

  // Punch holes across bars
  const holeGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.12, 12);
  const holeCount = Math.max(4, Math.floor(totalWidth / 0.4));
  for (let i = 0; i < holeCount; i++) {
    const ratio = holeCount === 1 ? 0.5 : i / (holeCount - 1);
    const xPos = -totalWidth / 2 + 0.1 + ratio * (totalWidth - 0.2);

    const topHole = new THREE.Mesh(holeGeometry, holeMaterial);
    topHole.rotation.x = Math.PI / 2;
    topHole.position.set(xPos, topBar.position.y, 0.07);
    group.add(topHole);

    const bottomHole = topHole.clone();
    bottomHole.position.y = bottomBar.position.y;
    group.add(bottomHole);
  }

  group.scale.setScalar(scale);

  group.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  group.userData = {
    type: 'prop',
    propId: 'filmStrip',
    label: 'Film Strip',
  };

  return group;
}
