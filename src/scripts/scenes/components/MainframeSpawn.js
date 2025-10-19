/**
 * MainframeSpawn - Initial Spawn Animation
 *
 * Builds the mainframe scaffolding along with Celli's home array.
 * When the world reveal triggers we animate every voxel from a
 * distant arc into place, morphing from flat squares into the
 * rounded cube shells seen in the standalone HTML experience.
 */

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// Simulated mainframe (#-1) formula that stores Celli's home dimensions.
// In the faithful build this lives inside array -1. We mirror it here so
// the componentised scene reads the same source of truth.
const MAINFRAME_HOME_FORMULA = {
  id: -1,
  cells: [
    {
      coord: { x: 0, y: 0, z: 0 },
      value: 'HOME_DIM',
      formula: '=ARRAY({8,4,8})'
    }
  ]
};

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export class MainframeSpawn {
  constructor(scene) {
    this.scene = scene;

    this.config = {
      platformThickness: 0.24,
      platformPadding: 0.6,
      cellSpacing: 0.42,
      cellSize: 0.36,
      verticalGap: 0.05,
      spawnRadius: 6,
      spawnHeight: 3.2,
      arcHeight: 1.6,
      flightDuration: 1.8,
      shakeDuration: 0.35,
      morphDuration: 0.5,
      initialScale: 0.35,
      shakeMagnitude: 0.06
    };

    this.resources = {
      squareGeometry: null,
      roundedGeometry: null
    };

    this.state = {
      mainframe: null,
      celliHome: null,
      homeCells: [],
      spawnProgress: 0,
      animating: false,
      visible: false,
      homeConstructionActive: false,
      homeConstructionPromise: null,
      homeConstructionResolve: null
    };

    this._tmpA = new THREE.Vector3();
    this._tmpB = new THREE.Vector3();
    this._tmpC = new THREE.Vector3();
  }

  /**
   * Initialize mainframe and home
   */
  async init() {
    console.log('[MainframeSpawn] Initializing mainframe and home...');

    await this._createMainframe();
    await this._createCelliHome();

    console.log('[MainframeSpawn] ✅ Initialized');
    return true;
  }

  /**
   * Create mainframe structure
   */
  async _createMainframe() {
    const mainframeGroup = new THREE.Group();
    mainframeGroup.name = 'Mainframe';

    const gridSize = 10;
    const gridStep = 0.5;
    const lineColor = 0x4a7cff;

    const lineMat = new THREE.LineBasicMaterial({
      color: lineColor,
      transparent: true,
      opacity: 0.0
    });

    for (let i = -gridSize; i <= gridSize; i++) {
      const horizontalPoints = [
        new THREE.Vector3(-gridSize * gridStep, 0, i * gridStep),
        new THREE.Vector3(gridSize * gridStep, 0, i * gridStep)
      ];
      const hGeom = new THREE.BufferGeometry().setFromPoints(horizontalPoints);
      mainframeGroup.add(new THREE.Line(hGeom, lineMat.clone()));

      const verticalPoints = [
        new THREE.Vector3(i * gridStep, 0, -gridSize * gridStep),
        new THREE.Vector3(i * gridStep, 0, gridSize * gridStep)
      ];
      const vGeom = new THREE.BufferGeometry().setFromPoints(verticalPoints);
      mainframeGroup.add(new THREE.Line(vGeom, lineMat.clone()));
    }

    const postGeo = new THREE.CylinderGeometry(0.03, 0.03, 3, 10);
    const postMat = new THREE.MeshStandardMaterial({
      color: lineColor,
      emissive: lineColor,
      emissiveIntensity: 0.0,
      transparent: true,
      opacity: 0.0
    });

    const corners = [
      [-gridSize * gridStep, 1.5, -gridSize * gridStep],
      [gridSize * gridStep, 1.5, -gridSize * gridStep],
      [-gridSize * gridStep, 1.5, gridSize * gridStep],
      [gridSize * gridStep, 1.5, gridSize * gridStep]
    ];

    corners.forEach(([x, y, z]) => {
      const post = new THREE.Mesh(postGeo, postMat.clone());
      post.position.set(x, y, z);
      mainframeGroup.add(post);
    });

    mainframeGroup.position.y = -2;
    mainframeGroup.visible = false;

    this.scene.add(mainframeGroup);
    this.state.mainframe = mainframeGroup;

    console.log('[MainframeSpawn] ✅ Mainframe created');
  }

  /**
   * Derive home dimensions from the simulated mainframe formula
   */
  _readHomeDimensionsFromMainframe() {
    const cell = MAINFRAME_HOME_FORMULA.cells.find((entry) => entry.value === 'HOME_DIM');
    if (!cell || typeof cell.formula !== 'string') {
      return { x: 8, y: 4, z: 8 };
    }
    const match = /\{(\d+),(\d+),(\d+)\}/.exec(cell.formula);
    if (!match) {
      return { x: 8, y: 4, z: 8 };
    }
    return { x: +match[1], y: +match[2], z: +match[3] };
  }

  /**
   * Create Celli's home platform and staged voxels
   */
  async _createCelliHome() {
    const dims = this._readHomeDimensionsFromMainframe();
    this.config.homeSize = dims;

    const homeGroup = new THREE.Group();
    homeGroup.name = 'CelliHome';

    const platformWidth = dims.x * this.config.cellSpacing + this.config.platformPadding;
    const platformDepth = dims.z * this.config.cellSpacing + this.config.platformPadding;

    const platformGeo = new RoundedBoxGeometry(
      platformWidth,
      this.config.platformThickness,
      platformDepth,
      8,
      0.18
    );
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.45,
      metalness: 0.15,
      transparent: true,
      opacity: 0.0
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = 0;
    platform.castShadow = true;
    platform.receiveShadow = true;
    homeGroup.add(platform);

    const beaconGeo = new THREE.SphereGeometry(0.2, 24, 24);
    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.0,
      transparent: true,
      opacity: 0.0
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.y = 0.4;
    beacon.name = 'CelliHomeBeacon';
    homeGroup.add(beacon);

    const homeLight = new THREE.PointLight(0xfbbf24, 0.0, 6);
    homeLight.position.y = 0.5;
    homeGroup.add(homeLight);

    homeGroup.position.set(0, -1.9, 0);
    homeGroup.visible = false;

    this._buildHomeCells(homeGroup, dims);

    this.scene.add(homeGroup);
    this.state.celliHome = homeGroup;

    console.log('[MainframeSpawn] ✅ Celli\'s home staged');
  }

  _buildHomeCells(homeGroup, dims) {
    const { cellSpacing, cellSize, verticalGap } = this.config;

    if (!this.resources.squareGeometry) {
      this.resources.squareGeometry = new THREE.BoxGeometry(cellSize, cellSize, cellSize * 0.12);
    }
    if (!this.resources.roundedGeometry) {
      this.resources.roundedGeometry = new RoundedBoxGeometry(cellSize, cellSize, cellSize, 4, cellSize * 0.22);
    }

    const layerColors = [0xf8fafc, 0xfde68a, 0xbfdbfe, 0xa7f3d0];
    this.state.homeCells = [];

    for (let y = 0; y < dims.y; y++) {
      for (let z = 0; z < dims.z; z++) {
        for (let x = 0; x < dims.x; x++) {
          const material = new THREE.MeshStandardMaterial({
            color: layerColors[y % layerColors.length],
            roughness: 0.45,
            metalness: 0.18,
            transparent: true,
            opacity: 0.0
          });

          const mesh = new THREE.Mesh(this.resources.squareGeometry, material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.visible = false;

          const offsetX = (x - (dims.x - 1) / 2) * cellSpacing;
          const offsetY = (y * (cellSize + verticalGap)) + this.config.platformThickness / 2 + cellSize / 2;
          const offsetZ = (z - (dims.z - 1) / 2) * cellSpacing;

          const target = new THREE.Vector3(offsetX, offsetY, offsetZ);
          const start = target.clone().add(new THREE.Vector3(
            (Math.random() - 0.5) * this.config.spawnRadius * 2,
            this.config.spawnHeight + Math.random() * 1.2,
            -this.config.spawnRadius - Math.random() * 2
          ));
          const control = start.clone().lerp(target, 0.5);
          control.y += this.config.arcHeight + Math.random() * 0.5;

          mesh.position.copy(start);
          mesh.scale.setScalar(this.config.initialScale);

          homeGroup.add(mesh);

          this.state.homeCells.push({
            mesh,
            target,
            start,
            control,
            progress: 0,
            phase: 'idle'
          });
        }
      }
    }
  }

  /**
   * Play spawn animation for the lattice + platform
   */
  async playSpawnAnimation() {
    console.log('[MainframeSpawn] 🎬 Playing spawn animation...');

    this.state.animating = true;
    this.state.spawnProgress = 0;

    if (this.state.mainframe) this.state.mainframe.visible = true;
    if (this.state.celliHome) this.state.celliHome.visible = true;

    const duration = 2000;
    const startTime = performance.now();

    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1.0);

        this.state.spawnProgress = progress;
        const t = easeOutCubic(progress);

        if (this.state.mainframe) {
          this.state.mainframe.traverse((child) => {
            if (child.material && child.material.opacity !== undefined) {
              child.material.opacity = t * 0.35;
              if (child.material.emissiveIntensity !== undefined) {
                child.material.emissiveIntensity = t * 0.6;
              }
            }
          });
          this.state.mainframe.position.y = -2 + t * 0.5;
        }

        if (this.state.celliHome) {
          this.state.celliHome.traverse((child) => {
            if (child.material && child.material.opacity !== undefined) {
              child.material.opacity = Math.min(1, t * 1.1);
              if (child.material.emissiveIntensity !== undefined) {
                child.material.emissiveIntensity = 0.8 * t;
              }
            }
            if (child.isLight) {
              child.intensity = 0.4 * t;
            }
          });
          this.state.celliHome.position.y = -1.9 + t * 0.3;
        }

        if (progress < 1.0) {
          requestAnimationFrame(animate);
        } else {
          this.state.animating = false;
          this.state.visible = true;
          console.log('[MainframeSpawn] ✅ Spawn animation complete');
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * Begin the voxel construction arc animation
   */
  beginHomeReveal() {
    if (!this.state.celliHome || !this.state.homeCells.length) {
      return Promise.resolve();
    }
    if (this.state.homeConstructionActive) {
      return this.state.homeConstructionPromise || Promise.resolve();
    }

    this.state.homeConstructionActive = true;
    this.state.homeConstructionPromise = new Promise((resolve) => {
      this.state.homeConstructionResolve = resolve;
    });

    this.state.homeCells.forEach((cell, index) => {
      const delay = (index % this.config.homeSize.x) * 0.02;
      cell.phase = 'queued';
      cell.progress = -delay; // negative progress to stagger start
      cell.mesh.visible = true;
      cell.mesh.geometry = this.resources.squareGeometry;
      cell.mesh.position.copy(cell.start);
      cell.mesh.scale.set(
        this.config.initialScale,
        this.config.initialScale,
        this.config.initialScale * 0.35
      );
      if (cell.mesh.material) {
        cell.mesh.material.opacity = 0.0;
      }
    });

    return this.state.homeConstructionPromise;
  }

  _updateHomeConstruction(deltaTime) {
    // `deltaTime` from the scene update loop is provided in seconds.
    // This routine originally assumed milliseconds which slowed the
    // animation to an imperceptible crawl (and blocked the intro from
    // finishing). Treat it as seconds so progress advances correctly.
    const dt = deltaTime;
    let allComplete = true;

    this.state.homeCells.forEach((cell) => {
      if (!cell.mesh) return;

      if (cell.phase === 'queued') {
        cell.progress += dt;
        if (cell.progress >= 0) {
          cell.phase = 'flying';
          cell.progress = 0;
        } else {
          allComplete = false;
          return;
        }
      }

      if (cell.phase === 'flying') {
        cell.progress = Math.min(1, cell.progress + (dt / this.config.flightDuration));
        const t = easeOutCubic(cell.progress);

        const position = this._quadraticBezier(cell.start, cell.control, cell.target, t);
        cell.mesh.position.copy(position);

        const scale = THREE.MathUtils.lerp(this.config.initialScale, 1, t);
        cell.mesh.scale.set(scale, scale, THREE.MathUtils.lerp(this.config.initialScale * 0.35, scale, t));

        if (cell.mesh.material) {
          cell.mesh.material.opacity = Math.min(1, t * 1.25);
        }

        if (cell.progress >= 1) {
          cell.phase = 'shaking';
          cell.progress = 0;
          cell.mesh.position.copy(cell.target);
        } else {
          allComplete = false;
          return;
        }
      }

      if (cell.phase === 'shaking') {
        cell.progress += dt;
        const shakeT = Math.min(1, cell.progress / this.config.shakeDuration);
        const wobble = Math.sin(shakeT * Math.PI * 8) * this.config.shakeMagnitude * (1 - shakeT);
        cell.mesh.position.y = cell.target.y + wobble;
        cell.mesh.position.x = cell.target.x + Math.sin(shakeT * Math.PI * 6) * wobble * 0.35;
        cell.mesh.position.z = cell.target.z + Math.cos(shakeT * Math.PI * 5) * wobble * 0.35;

        if (cell.progress >= this.config.shakeDuration) {
          cell.phase = 'morphing';
          cell.progress = 0;
          cell.mesh.position.copy(cell.target);
          cell.mesh.geometry = this.resources.roundedGeometry;
          if (cell.mesh.material) {
            cell.mesh.material.opacity = 1;
          }
        } else {
          allComplete = false;
          return;
        }
      }

      if (cell.phase === 'morphing') {
        cell.progress = Math.min(1, cell.progress + (dt / this.config.morphDuration));
        const s = easeOutBack(cell.progress);
        const scale = THREE.MathUtils.lerp(0.92, 1, s);
        cell.mesh.scale.set(scale, scale, scale);
        if (cell.progress >= 1) {
          cell.phase = 'complete';
        } else {
          allComplete = false;
          return;
        }
      }

      if (cell.phase !== 'complete') {
        allComplete = false;
      }
    });

    if (allComplete && this.state.homeConstructionActive) {
      this.state.homeConstructionActive = false;
      if (this.state.homeConstructionResolve) {
        this.state.homeConstructionResolve();
        this.state.homeConstructionResolve = null;
      }
    }
  }

  _quadraticBezier(start, control, end, t) {
    const invT = 1 - t;
    this._tmpA.copy(start).multiplyScalar(invT * invT);
    this._tmpB.copy(control).multiplyScalar(2 * invT * t);
    this._tmpC.copy(end).multiplyScalar(t * t);
    return this._tmpA.add(this._tmpB).add(this._tmpC);
  }

  /**
   * Update (called every frame)
   */
  update(deltaTime) {
    if (!this.state.visible) return;

    const time = performance.now() * 0.001;

    if (this.state.celliHome) {
      const beacon = this.state.celliHome.getObjectByName('CelliHomeBeacon');
      if (beacon && beacon.material) {
        const pulse = Math.sin(time * 2) * 0.15 + 1.0;
        beacon.scale.setScalar(pulse);
        beacon.material.emissiveIntensity = 0.4 + Math.sin(time * 3) * 0.2;
        if (beacon.material.opacity !== undefined) {
          beacon.material.opacity = 0.75 + Math.sin(time * 1.5) * 0.1;
        }
      }
    }

    if (this.state.homeConstructionActive) {
      this._updateHomeConstruction(deltaTime);
    }
  }

  show() {
    if (this.state.mainframe) this.state.mainframe.visible = true;
    if (this.state.celliHome) this.state.celliHome.visible = true;
    this.state.visible = true;
  }

  hide() {
    if (this.state.mainframe) this.state.mainframe.visible = false;
    if (this.state.celliHome) this.state.celliHome.visible = false;
    this.state.visible = false;
  }

  destroy() {
    console.log('[MainframeSpawn] Destroying...');

    [this.state.mainframe, this.state.celliHome].forEach((obj) => {
      if (obj) {
        obj.traverse((child) => {
          if (child.geometry && child.geometry.dispose) child.geometry.dispose();
          if (child.material && child.material.dispose) child.material.dispose();
        });
        this.scene.remove(obj);
      }
    });

    this.resources.squareGeometry?.dispose?.();
    this.resources.roundedGeometry?.dispose?.();

    this.state.homeCells = [];

    console.log('[MainframeSpawn] ✅ Destroyed');
  }
}

export default MainframeSpawn;
