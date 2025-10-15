import * as THREE from 'three';
import { renderFlashAnimator } from './FlashAnimatorLoader.js';

let overlayEl = null;
let rootEl = null;
let initialized = false;
let renderer = null;
let camera = null;
let scene = null;
let animationFrameId = null;
let cube = null;
let rehumanizeTimer = null;
let frameDamageInterval = null;

function ensureElements() {
  if (!overlayEl) {
    overlayEl = document.getElementById('flashAnimatorOverlay');
  }
  if (!rootEl) {
    rootEl = document.getElementById('flashAnimatorRoot');
  }
  if (!overlayEl || !rootEl) {
    throw new Error('Flash animator overlay elements are missing from the DOM');
  }
}

function startAnimationLoop() {
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    if (cube) {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.015;
    }
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  };
  animate();
}

function stopAnimationLoop() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function teardownRehumanize() {
  const overlay = document.getElementById('rehumanize-overlay');
  if (overlay) {
    overlay.style.display = 'none';
    overlay.textContent = '';
  }
  if (rehumanizeTimer) {
    clearInterval(rehumanizeTimer);
    rehumanizeTimer = null;
  }
}

function teardownFrameDamage() {
  if (frameDamageInterval) {
    clearInterval(frameDamageInterval);
    frameDamageInterval = null;
  }
  const frameDamageCanvas = document.getElementById('frame-damage-overlay');
  if (frameDamageCanvas) {
    const ctx = frameDamageCanvas.getContext('2d');
    ctx.clearRect(0, 0, frameDamageCanvas.width, frameDamageCanvas.height);
    frameDamageCanvas.style.display = 'none';
  }
}

function drawWeaponOverlay(weapon) {
  const gunCanvas = document.getElementById('gun-overlay');
  if (!gunCanvas) return;
  const ctx = gunCanvas.getContext('2d');
  ctx.clearRect(0, 0, gunCanvas.width, gunCanvas.height);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, gunCanvas.width, gunCanvas.height);

  ctx.fillStyle = '#f1c40f';
  ctx.font = '24px "VT323", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(weapon === 'gatling' ? 'GATLING ONLINE' : 'CURSOR READY', gunCanvas.width / 2, gunCanvas.height / 2);
}

function startFrameDamageEffect() {
  teardownFrameDamage();
  const frameDamageCanvas = document.getElementById('frame-damage-overlay');
  if (!frameDamageCanvas) return;
  frameDamageCanvas.width = window.innerWidth;
  frameDamageCanvas.height = window.innerHeight;
  frameDamageCanvas.style.display = 'block';

  const ctx = frameDamageCanvas.getContext('2d');
  const drawDamage = () => {
    ctx.clearRect(0, 0, frameDamageCanvas.width, frameDamageCanvas.height);
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(0, 0, frameDamageCanvas.width, frameDamageCanvas.height);

    ctx.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 12; i++) {
      const size = 60 + Math.random() * 120;
      ctx.beginPath();
      ctx.arc(Math.random() * frameDamageCanvas.width, Math.random() * frameDamageCanvas.height, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  };

  drawDamage();
  frameDamageInterval = setInterval(drawDamage, 1500);
}

function setupEventHandlers() {
  const fillPicker = document.getElementById('fill-color-picker');
  const strokePicker = document.getElementById('stroke-color-picker');
  const weaponSelect = document.getElementById('weapon-select');
  const fpsBtn = document.getElementById('fps-btn');
  const rehumanizeBtn = document.getElementById('rehumanize-btn');

  if (fillPicker) {
    fillPicker.addEventListener('input', (event) => {
      if (cube) {
        cube.material.color.set(event.target.value);
      }
    });
  }

  if (strokePicker) {
    strokePicker.addEventListener('input', (event) => {
      if (renderer) {
        renderer.setClearColor(new THREE.Color(event.target.value));
      }
    });
  }

  if (weaponSelect) {
    weaponSelect.addEventListener('change', (event) => {
      drawWeaponOverlay(event.target.value);
    });
    drawWeaponOverlay(weaponSelect.value);
  }

  if (fpsBtn) {
    fpsBtn.addEventListener('click', () => {
      const enable = !overlayEl.classList.contains('fps-mode');
      overlayEl.classList.toggle('fps-mode', enable);
      if (enable) {
        const stageWrapper = overlayEl.querySelector('.stage-wrapper');
        const width = stageWrapper ? stageWrapper.clientWidth : 800;
        const height = stageWrapper ? stageWrapper.clientHeight : 600;
        if (renderer && camera) {
          renderer.setSize(width, height);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        }
        const gunOverlay = document.getElementById('gun-overlay');
        if (gunOverlay) {
          gunOverlay.style.display = 'block';
          drawWeaponOverlay(weaponSelect ? weaponSelect.value : 'mouse');
        }
        startFrameDamageEffect();
      } else {
        if (renderer && camera) {
          renderer.setSize(550, 400);
          camera.aspect = 550 / 400;
          camera.updateProjectionMatrix();
        }
        const gunOverlay = document.getElementById('gun-overlay');
        if (gunOverlay) {
          gunOverlay.style.display = 'none';
        }
        teardownFrameDamage();
      }
    });
  }

  if (rehumanizeBtn) {
    rehumanizeBtn.addEventListener('click', () => {
      const overlay = document.getElementById('rehumanize-overlay');
      if (!overlay) return;
      overlay.style.display = 'block';
      overlay.textContent = '';
      const message = 'rehumanize.exe — connecting to distant timeline\n> recovering humanity fragments...';
      let index = 0;
      teardownRehumanize();
      overlay.style.display = 'block';
      rehumanizeTimer = setInterval(() => {
        overlay.textContent = message.slice(0, index);
        index += 2;
        if (index > message.length) {
          clearInterval(rehumanizeTimer);
          rehumanizeTimer = null;
        }
      }, 40);
    });
  }
}

function initializeThreeScene() {
  const canvasContainer = document.getElementById('canvas-container');
  if (!canvasContainer) {
    throw new Error('Canvas container not found for Flash animator');
  }

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(550, 400);
  renderer.setClearColor(new THREE.Color('#333333'));

  canvasContainer.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, 550 / 400, 0.1, 100);
  camera.position.set(0, 0, 4);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
  keyLight.position.set(2, 2, 3);
  scene.add(keyLight);

  const geometry = new THREE.BoxGeometry(1.8, 1.8, 1.8);
  const material = new THREE.MeshStandardMaterial({ color: '#ffffff' });
  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  const grid = new THREE.GridHelper(6, 12, '#444444', '#555555');
  grid.position.y = -1.5;
  scene.add(grid);

  startAnimationLoop();
}

async function initializeAnimator() {
  if (initialized) return;

  await renderFlashAnimator(rootEl);
  initializeThreeScene();
  setupEventHandlers();

  const gunCanvas = document.getElementById('gun-overlay');
  if (gunCanvas) {
    gunCanvas.width = 400;
    gunCanvas.height = 300;
  }

  const gasEscapeCanvas = document.getElementById('gas-escape-overlay');
  if (gasEscapeCanvas) {
    gasEscapeCanvas.width = window.innerWidth;
    gasEscapeCanvas.height = window.innerHeight;
    const ctx = gasEscapeCanvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, gasEscapeCanvas.width, gasEscapeCanvas.height);
    gradient.addColorStop(0, 'rgba(200, 200, 200, 0.0)');
    gradient.addColorStop(1, 'rgba(200, 200, 200, 0.35)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, gasEscapeCanvas.width, gasEscapeCanvas.height);
  }

  window.addEventListener('resize', () => {
    if (!overlayEl.classList.contains('fps-mode') && renderer && camera) {
      renderer.setSize(550, 400);
      camera.aspect = 550 / 400;
      camera.updateProjectionMatrix();
    } else if (overlayEl.classList.contains('fps-mode')) {
      const stageWrapper = overlayEl.querySelector('.stage-wrapper');
      if (stageWrapper) {
        renderer.setSize(stageWrapper.clientWidth, stageWrapper.clientHeight);
        camera.aspect = stageWrapper.clientWidth / stageWrapper.clientHeight;
        camera.updateProjectionMatrix();
      }
    }

    const gasCanvas = document.getElementById('gas-escape-overlay');
    if (gasCanvas) {
      gasCanvas.width = window.innerWidth;
      gasCanvas.height = window.innerHeight;
    }
  });

  overlayEl.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeFlashAnimator();
    }
  });

  initialized = true;
}

export async function openFlashAnimator() {
  ensureElements();
  await initializeAnimator();
  overlayEl.classList.add('is-visible');
  overlayEl.setAttribute('aria-hidden', 'false');
  overlayEl.focus();
}

export function closeFlashAnimator() {
  ensureElements();
  overlayEl.classList.remove('is-visible');
  overlayEl.classList.remove('fps-mode');
  overlayEl.setAttribute('aria-hidden', 'true');
  const gunOverlay = document.getElementById('gun-overlay');
  if (gunOverlay) {
    gunOverlay.style.display = 'none';
  }
  teardownRehumanize();
  teardownFrameDamage();
  if (renderer && camera) {
    renderer.setSize(550, 400);
    camera.aspect = 550 / 400;
    camera.updateProjectionMatrix();
  }
}

export function destroyFlashAnimator() {
  closeFlashAnimator();
  teardownRehumanize();
  stopAnimationLoop();
  if (renderer) {
    renderer.dispose();
    renderer = null;
  }
  scene = null;
  camera = null;
  cube = null;
  initialized = false;
}
