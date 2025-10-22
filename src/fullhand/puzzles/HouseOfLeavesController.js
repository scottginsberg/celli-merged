/**
 * HouseOfLeavesController
 * -----------------------
 * Stages the "House of Leaves" voxel tableau inside the Fullhand scene.
 * Responsibilities:
 * - Build a 5x8 LEAVES-textured back face constructed from voxel cubes.
 * - Spawn the Pal-ette avatar beside the house with gentle idle motion.
 * - Surface a single-color selector UI that toggles columns of the house.
 * - Validate the selector state against the NYYYYN pattern and resolve the puzzle.
 * - On completion, play the Key2 video and swap active cubes for bored board prisms.
 * - Hook selector clicks to camera shake feedback and keyboard focus.
 */

import * as THREE from 'three';
import AvatarFactory from '../../scripts/systems/AvatarFactory.js';
import { markPuzzleSolved, puzzleStateManager } from '../../scripts/systems/PuzzleStateManager.js';

const PATTERN = ['N', 'Y', 'Y', 'Y', 'Y', 'N'];
const PUZZLE_ID = 'house-of-leaves';

export class HouseOfLeavesController {
  constructor({ scene, camera, uiRoot = document.body } = {}) {
    this.scene = scene;
    this.camera = camera;
    this.uiRoot = uiRoot || document.body;

    this.constants = {
      cellSize: 0.42,
      cellDepth: 0.18,
      columnSpacing: 0.48,
      gridHeight: 8,
      gridWidth: 5
    };

    this.state = {
      root: null,
      paletteAvatar: null,
      columns: [],
      door: null,
      selectorButtons: [],
      selectorStates: PATTERN.map(() => false),
      solved: false,
      shake: {
        active: false,
        duration: 0,
        elapsed: 0,
        intensity: 0,
        origin: null
      },
      textures: new Map(),
      uiContainer: null,
      videoEl: null,
      boredBoards: [],
      hoverLight: null
    };

    this._handleSelectorClick = this._handleSelectorClick.bind(this);
  }

  /**
   * Initialise puzzle assets and attach them to the provided scene.
   */
  async init() {
    if (!this.scene) {
      console.warn('[HouseOfLeavesController] Cannot initialise without a scene');
      return false;
    }

    if (!this.state.root) {
      this.state.root = new THREE.Group();
      this.state.root.name = 'HouseOfLeavesRoot';
      this.state.root.position.set(-1.2, 0.2, -2.6);
      this.state.root.rotation.y = Math.PI * -0.08;
      this.scene.add(this.state.root);
    }

    this._buildBackFace();
    this._spawnPaletteAvatar();
    this._createHoverLight();
    this._createSelectorUi();

    const storedState = puzzleStateManager.getState(PUZZLE_ID);
    if (storedState?.status === 'solved') {
      this.state.selectorStates = PATTERN.map((entry) => entry === 'Y');
      this.state.solved = true;
      this._syncSelectors();
      this._swapRedCubesForBoredBoards();
      this._setUiSolved();
    } else {
      this.state.selectorStates = PATTERN.map(() => false);
      this.state.solved = false;
      this._syncSelectors();
    }

    console.log('[HouseOfLeavesController] ✅ Initialised');
    return true;
  }

  /**
   * Begin interactive state when the surrounding scene transitions to NEW SEQUENCE.
   */
  start() {
    if (!this.state.root) return;

    console.log('[HouseOfLeavesController] ▶️ Starting puzzle session');
    this.state.root.visible = true;
    this._setUiEnabled(true);

    if (!this.state.solved) {
      this.state.selectorStates = PATTERN.map(() => false);
      this._syncSelectors();
    }
  }

  /**
   * Stop interactive state.
   */
  stop() {
    if (!this.state.root) return;

    console.log('[HouseOfLeavesController] ⏹️ Stopping puzzle session');
    this.state.root.visible = false;
    this._setUiEnabled(false);
    this._resetShake();
    this._clearVideo();
  }

  /**
   * Update per-frame behaviour (camera shake + subtle avatar motion).
   */
  update(deltaTime = 0.016, totalTime = 0) {
    this._updateCameraShake(deltaTime, totalTime);
    this._updatePaletteAvatar(totalTime);
  }

  /**
   * Tear down assets and detach from the scene.
   */
  destroy() {
    console.log('[HouseOfLeavesController] 🗑️ Destroying puzzle assets');

    this.stop();

    if (this.state.paletteAvatar) {
      this.state.root.remove(this.state.paletteAvatar);
      this._disposeObject(this.state.paletteAvatar);
      this.state.paletteAvatar = null;
    }

    if (this.state.door) {
      this.state.root.remove(this.state.door.group);
      this._disposeObject(this.state.door.group);
      this.state.door = null;
    }

    this.state.columns.forEach((column) => {
      if (column?.group) {
        this.state.root.remove(column.group);
        this._disposeObject(column.group);
      }
    });
    this.state.columns = [];

    if (this.state.hoverLight) {
      this.state.root.remove(this.state.hoverLight);
      this.state.hoverLight.dispose?.();
      this.state.hoverLight = null;
    }

    if (this.state.root && this.scene) {
      this.scene.remove(this.state.root);
      this.state.root = null;
    }

    this._clearSelectorUi();
    this._clearVideo();
    this._disposeCachedTextures();

    console.log('[HouseOfLeavesController] ✅ Destroyed');
  }

  /**
   * Build the 5x8 back face grid of LEAVES cubes.
   */
  _buildBackFace() {
    const { cellSize, cellDepth, columnSpacing, gridHeight, gridWidth } = this.constants;

    const gridGroup = new THREE.Group();
    gridGroup.name = 'HouseOfLeavesBackFace';
    gridGroup.position.y = cellSize * 0.5;

    const baseTexture = this._getLeavesTexture('green');
    const geometry = new THREE.BoxGeometry(cellSize, cellSize, cellDepth);

    for (let x = 0; x < gridWidth; x++) {
      const columnGroup = new THREE.Group();
      columnGroup.name = `LeavesColumn_${x}`;
      columnGroup.position.x = (x - (gridWidth - 1) / 2) * columnSpacing;

      const cubes = [];
      for (let y = 0; y < gridHeight; y++) {
        const material = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          map: baseTexture,
          emissive: new THREE.Color('#166534'),
          emissiveIntensity: 0.32,
          transparent: true,
          opacity: 0.94
        });

        const cube = new THREE.Mesh(geometry.clone(), material);
        cube.position.y = y * cellSize;
        cube.castShadow = true;
        cube.receiveShadow = true;
        cube.userData = {
          active: false,
          baseTexture,
          redTexture: null
        };

        columnGroup.add(cube);
        cubes.push(cube);
      }

      this.state.columns.push({ group: columnGroup, cubes, active: false });
      gridGroup.add(columnGroup);
    }

    this.state.root.add(gridGroup);

    // Door stack acts as the sixth selector target.
    const doorGroup = new THREE.Group();
    doorGroup.name = 'LeavesDoor';
    doorGroup.position.set(0, 0, columnSpacing * 0.4);

    const doorCubes = [];
    for (let i = 0; i < 4; i++) {
      const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: baseTexture,
        emissive: new THREE.Color('#14532d'),
        emissiveIntensity: 0.28,
        transparent: true,
        opacity: 0.92
      });
      const cube = new THREE.Mesh(new THREE.BoxGeometry(cellSize * 0.9, cellSize, cellDepth * 0.85), material);
      cube.position.set(0, i * cellSize, 0);
      cube.castShadow = true;
      cube.receiveShadow = true;
      cube.userData = {
        active: false,
        baseTexture,
        redTexture: null
      };
      doorGroup.add(cube);
      doorCubes.push(cube);
    }

    this.state.door = { group: doorGroup, cubes: doorCubes, active: false };
    this.state.root.add(doorGroup);
  }

  /**
   * Spawn Pal-ette avatar adjacent to the LEAVES wall.
   */
  _spawnPaletteAvatar() {
    if (!AvatarFactory?.createPalette || !this.state.root) {
      console.warn('[HouseOfLeavesController] Palette avatar factory unavailable');
      return;
    }

    try {
      const palette = AvatarFactory.createPalette(THREE);
      palette.position.set(1.8, 0.4, 0.4);
      palette.rotation.y = Math.PI * 0.25;
      palette.scale.multiplyScalar(1.1);
      palette.userData.idlePhase = Math.random() * Math.PI * 2;
      this.state.root.add(palette);
      this.state.paletteAvatar = palette;
    } catch (error) {
      console.warn('[HouseOfLeavesController] Unable to spawn Palette avatar:', error);
    }
  }

  /**
   * Lightweight point light to keep the LEAVES facade visible.
   */
  _createHoverLight() {
    if (!this.state.root) return;

    const light = new THREE.PointLight('#a7f3d0', 0.9, 6.5, 2.2);
    light.position.set(0.5, this.constants.gridHeight * this.constants.cellSize * 0.6, 0.5);
    this.state.root.add(light);
    this.state.hoverLight = light;
  }

  /**
   * Create the selector UI used to toggle the puzzle state.
   */
  _createSelectorUi() {
    if (this.state.uiContainer) return;

    const container = document.createElement('div');
    container.className = 'house-of-leaves-selector';
    container.style.position = 'fixed';
    container.style.bottom = '32px';
    container.style.right = '32px';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '12px';
    container.style.padding = '18px 22px';
    container.style.background = 'rgba(17, 24, 39, 0.82)';
    container.style.border = '1px solid rgba(74, 222, 128, 0.45)';
    container.style.borderRadius = '18px';
    container.style.backdropFilter = 'blur(12px)';
    container.style.webkitBackdropFilter = 'blur(12px)';
    container.style.color = '#bbf7d0';
    container.style.fontFamily = 'var(--mono-font, "IBM Plex Mono", monospace)';
    container.style.fontSize = '13px';
    container.style.zIndex = '9800';
    container.style.boxShadow = '0 25px 45px rgba(0,0,0,0.35)';

    const title = document.createElement('div');
    title.textContent = 'HOUSE OF LEAVES';
    title.style.letterSpacing = '0.28em';
    title.style.fontWeight = '600';
    title.style.fontSize = '12px';
    title.style.opacity = '0.8';
    container.appendChild(title);

    const swatch = document.createElement('div');
    swatch.textContent = 'Selector: Single Hue';
    swatch.style.padding = '6px 10px';
    swatch.style.borderRadius = '8px';
    swatch.style.background = 'rgba(34, 197, 94, 0.18)';
    swatch.style.border = '1px solid rgba(34, 197, 94, 0.45)';
    container.appendChild(swatch);

    const buttonRow = document.createElement('div');
    buttonRow.style.display = 'flex';
    buttonRow.style.gap = '10px';
    buttonRow.style.flexWrap = 'wrap';
    container.appendChild(buttonRow);

    this.state.selectorButtons = PATTERN.map((_, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.index = String(index);
      btn.textContent = 'N';
      btn.style.minWidth = '44px';
      btn.style.padding = '8px 10px';
      btn.style.border = '1px solid rgba(74, 222, 128, 0.4)';
      btn.style.borderRadius = '10px';
      btn.style.background = 'rgba(30, 64, 175, 0.35)';
      btn.style.color = '#e0f2fe';
      btn.style.cursor = 'pointer';
      btn.style.transition = 'all 0.2s ease';
      btn.style.fontWeight = '600';
      btn.style.textTransform = 'uppercase';
      btn.addEventListener('click', this._handleSelectorClick);
      buttonRow.appendChild(btn);
      return btn;
    });

    const helper = document.createElement('div');
    helper.textContent = 'Pattern target: NYYYYN';
    helper.style.fontSize = '11px';
    helper.style.opacity = '0.7';
    container.appendChild(helper);

    this.uiRoot.appendChild(container);
    this.state.uiContainer = container;
  }

  /**
   * Remove UI from DOM when destroying.
   */
  _clearSelectorUi() {
    this.state.selectorButtons.forEach((btn) => {
      btn.removeEventListener('click', this._handleSelectorClick);
    });
    this.state.selectorButtons = [];

    if (this.state.uiContainer && this.state.uiContainer.parentNode) {
      this.state.uiContainer.parentNode.removeChild(this.state.uiContainer);
    }
    this.state.uiContainer = null;
  }

  /**
   * Handle selector toggles.
   */
  _handleSelectorClick(event) {
    if (this.state.solved) return;

    const index = Number(event.currentTarget?.dataset?.index ?? -1);
    if (index < 0 || index >= this.state.selectorStates.length) return;

    this.state.selectorStates[index] = !this.state.selectorStates[index];
    this._syncSelectors();
    this._validatePattern();
    this.triggerCameraShake();
    this._focusKeyboard();
  }

  /**
   * Sync UI button states with cube materials.
   */
  _syncSelectors() {
    this.state.selectorStates.forEach((active, index) => {
      const button = this.state.selectorButtons[index];
      if (button) {
        button.textContent = active ? 'Y' : 'N';
        button.style.background = active ? 'rgba(220, 38, 38, 0.68)' : 'rgba(30, 64, 175, 0.35)';
        button.style.borderColor = active ? 'rgba(252, 165, 165, 0.9)' : 'rgba(74, 222, 128, 0.4)';
        button.style.color = active ? '#fee2e2' : '#e0f2fe';
      }

      if (index < this.state.columns.length) {
        this._setColumnActive(this.state.columns[index], active);
      } else if (this.state.door && index === this.state.columns.length) {
        this._setColumnActive(this.state.door, active);
      }
    });
  }

  /**
   * Apply texture state to a column entry.
   */
  _setColumnActive(entry, active) {
    if (!entry) return;
    entry.active = active;
    entry.cubes.forEach((cube) => this._applyCubeState(cube, active));
  }

  /**
   * Toggle a cube between base and red LEAVES textures.
   */
  _applyCubeState(cube, active) {
    if (!cube) return;

    if (active) {
      if (!cube.userData.redTexture) {
        cube.userData.redTexture = this._getLeavesTexture('red');
      }
      cube.material.map = cube.userData.redTexture;
      cube.material.emissive = new THREE.Color('#7f1d1d');
      cube.material.emissiveIntensity = 0.45;
    } else {
      cube.material.map = cube.userData.baseTexture;
      cube.material.emissive = new THREE.Color('#14532d');
      cube.material.emissiveIntensity = 0.28;
    }
    cube.material.needsUpdate = true;
    cube.userData.active = active;
  }

  /**
   * Validate the NYYYYN pattern.
   */
  _validatePattern() {
    const current = this.state.selectorStates.map((value) => (value ? 'Y' : 'N')).join('');
    const target = PATTERN.join('');
    if (current === target && !this.state.solved) {
      console.log('[HouseOfLeavesController] 🎉 Pattern matched');
      this._handleSolved();
    }
  }

  /**
   * Mark puzzle as solved and trigger completion choreography.
   */
  _handleSolved() {
    if (this.state.solved) return;
    this.state.solved = true;

    this._swapRedCubesForBoredBoards();
    this._setUiSolved();
    this._playCompletionVideo();

    try {
      markPuzzleSolved(PUZZLE_ID, { pattern: PATTERN.join('') });
    } catch (error) {
      console.warn('[HouseOfLeavesController] Unable to persist puzzle completion:', error);
    }
  }

  /**
   * Replace red LEAVES cubes with bored board prisms using emoticon textures.
   */
  _swapRedCubesForBoredBoards() {
    const replacements = [];

    const convertEntry = (entry) => {
      if (!entry) return;
      entry.cubes = entry.cubes.map((cube) => {
        if (!cube.userData.active) {
          return cube;
        }

        const board = this._createBoredBoard(cube.position);
        entry.group.add(board);
        entry.group.remove(cube);
        this._disposeCube(cube);
        replacements.push(board);
        return board;
      });
    };

    this.state.columns.forEach(convertEntry);
    convertEntry(this.state.door);

    this.state.boredBoards = replacements;
  }

  /**
   * Create a bored board mesh with emoticon texture.
   */
  _createBoredBoard(position) {
    const boardGeometry = new THREE.BoxGeometry(
      this.constants.cellSize * 0.95,
      this.constants.cellSize * 0.95,
      this.constants.cellDepth * 0.4
    );
    const boardTexture = this._getBoredTexture();
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: boardTexture,
      metalness: 0.08,
      roughness: 0.42,
      transparent: true,
      opacity: 0.96
    });

    const mesh = new THREE.Mesh(boardGeometry, material);
    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = {
      board: true,
      texture: boardTexture
    };
    mesh.rotation.y = (Math.random() - 0.5) * 0.2;
    return mesh;
  }

  /**
   * Update UI state for solved puzzle.
   */
  _setUiSolved() {
    this.state.selectorButtons.forEach((btn) => {
      btn.disabled = true;
      btn.style.cursor = 'default';
      btn.style.opacity = '0.6';
    });

    if (this.state.uiContainer) {
      this.state.uiContainer.style.borderColor = 'rgba(248, 250, 252, 0.65)';
      this.state.uiContainer.style.color = '#f8fafc';
      this.state.uiContainer.style.boxShadow = '0 18px 40px rgba(148, 163, 184, 0.35)';
    }
  }

  /**
   * Enable or disable the selector UI.
   */
  _setUiEnabled(enabled) {
    this.state.selectorButtons.forEach((btn) => {
      btn.disabled = !enabled;
      btn.style.opacity = enabled ? '1' : '0.5';
      btn.style.cursor = enabled ? 'pointer' : 'default';
    });
  }

  /**
   * Play Key2.MP4 to celebrate completion.
   */
  _playCompletionVideo() {
    this._clearVideo();

    const video = document.createElement('video');
    video.src = './Key2.MP4';
    video.style.position = 'fixed';
    video.style.left = '50%';
    video.style.top = '50%';
    video.style.transform = 'translate(-50%, -50%)';
    video.style.width = '720px';
    video.style.maxWidth = '90vw';
    video.style.maxHeight = '70vh';
    video.style.borderRadius = '18px';
    video.style.boxShadow = '0 30px 60px rgba(15,23,42,0.55)';
    video.style.zIndex = '10000';
    video.setAttribute('playsinline', '');
    video.setAttribute('controls', '');
    video.autoplay = true;

    const cleanup = () => this._clearVideo();
    video.addEventListener('ended', cleanup, { once: true });
    video.addEventListener('error', cleanup, { once: true });

    this.uiRoot.appendChild(video);
    this.state.videoEl = video;

    const playPromise = video.play();
    if (playPromise?.catch) {
      playPromise.catch((error) => {
        console.warn('[HouseOfLeavesController] Unable to autoplay Key2.MP4:', error);
      });
    }
  }

  /**
   * Remove the completion video overlay.
   */
  _clearVideo() {
    if (this.state.videoEl) {
      this.state.videoEl.pause?.();
      if (this.state.videoEl.parentNode) {
        this.state.videoEl.parentNode.removeChild(this.state.videoEl);
      }
    }
    this.state.videoEl = null;
  }

  /**
   * Trigger a camera shake response.
   */
  triggerCameraShake(intensity = 0.32, duration = 0.45) {
    this.state.shake.active = true;
    this.state.shake.intensity = intensity;
    this.state.shake.duration = duration;
    this.state.shake.elapsed = 0;
    this.state.shake.origin = null;
  }

  /**
   * Reset shake state.
   */
  _resetShake() {
    this.state.shake.active = false;
    this.state.shake.duration = 0;
    this.state.shake.elapsed = 0;
    this.state.shake.intensity = 0;
    if (this.state.shake.origin && this.camera) {
      this.camera.position.copy(this.state.shake.origin);
    }
    this.state.shake.origin = null;
  }

  /**
   * Per-frame camera shake update.
   */
  _updateCameraShake(deltaTime, totalTime) {
    if (!this.state.shake.active || !this.camera) return;

    if (!this.state.shake.origin) {
      this.state.shake.origin = this.camera.position.clone();
    }

    this.state.shake.elapsed += deltaTime;
    const progress = Math.min(1, this.state.shake.elapsed / this.state.shake.duration);
    const damp = 1 - progress;
    const strength = this.state.shake.intensity * damp;

    this.camera.position.copy(this.state.shake.origin);
    this.camera.position.x += Math.sin(totalTime * 32) * strength;
    this.camera.position.y += Math.cos(totalTime * 44) * strength * 0.6;
    this.camera.position.z += Math.sin(totalTime * 38 + Math.PI / 3) * strength * 0.5;

    if (progress >= 1) {
      this.camera.position.copy(this.state.shake.origin);
      this._resetShake();
    }
  }

  /**
   * Gentle idle motion for the Pal-ette avatar.
   */
  _updatePaletteAvatar(totalTime) {
    if (!this.state.paletteAvatar) return;
    const phase = this.state.paletteAvatar.userData.idlePhase || 0;
    this.state.paletteAvatar.position.y = 0.4 + Math.sin(totalTime * 1.1 + phase) * 0.08;
    this.state.paletteAvatar.rotation.z = Math.sin(totalTime * 0.9 + phase) * 0.05;
  }

  /**
   * Focus the Fullhand keyboard element for typing.
   */
  _focusKeyboard() {
    const selectors = [
      '#fullhandKeyboard',
      '#keyboard',
      '[data-role="keyboard"]',
      '[data-component="keyboard"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && typeof element.focus === 'function') {
        if (!element.hasAttribute('tabindex')) {
          element.setAttribute('tabindex', '-1');
        }
        try {
          element.focus({ preventScroll: true });
        } catch (error) {
          element.focus();
        }
        return;
      }
    }

    try {
      window.dispatchEvent(new CustomEvent('fullhand:focus-keyboard'));
    } catch (error) {
      console.warn('[HouseOfLeavesController] Unable to dispatch keyboard focus event:', error);
    }
  }

  /**
   * Acquire or create a LEAVES texture by hue.
   */
  _getLeavesTexture(colorKey) {
    if (this.state.textures.has(colorKey)) {
      return this.state.textures.get(colorKey);
    }

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const background = colorKey === 'red' ? '#450a0a' : '#052e16';
    const foreground = colorKey === 'red' ? '#fca5a5' : '#bbf7d0';
    const border = colorKey === 'red' ? '#f87171' : '#4ade80';

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = border;
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

    ctx.fillStyle = foreground;
    ctx.font = 'bold 64px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('LEAVES', canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    texture.needsUpdate = true;
    this.state.textures.set(colorKey, texture);
    return texture;
  }

  /**
   * Create the bored emoticon texture.
   */
  _getBoredTexture() {
    const cacheKey = 'bored';
    if (this.state.textures.has(cacheKey)) {
      return this.state.textures.get(cacheKey);
    }

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 120px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(':-|', canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    texture.needsUpdate = true;
    this.state.textures.set(cacheKey, texture);
    return texture;
  }

  /**
   * Dispose object geometry/material recursively.
   */
  _disposeObject(object) {
    object.traverse?.((child) => {
      if (child.geometry) {
        child.geometry.dispose();
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => material.dispose?.());
        } else {
          child.material.dispose?.();
        }
      }
      if (child.userData?.texture) {
        child.userData.texture.dispose?.();
      }
    });
  }

  /**
   * Dispose a single cube mesh.
   */
  _disposeCube(cube) {
    if (!cube) return;
    cube.geometry?.dispose?.();
    if (cube.material) {
      if (Array.isArray(cube.material)) {
        cube.material.forEach((material) => material.dispose?.());
      } else {
        cube.material.dispose?.();
      }
    }
    if (cube.userData?.redTexture && cube.userData.redTexture !== cube.userData.baseTexture) {
      cube.userData.redTexture.dispose?.();
    }
  }

  /**
   * Dispose cached textures.
   */
  _disposeCachedTextures() {
    this.state.textures.forEach((texture) => texture.dispose?.());
    this.state.textures.clear();
  }
}

export default HouseOfLeavesController;
