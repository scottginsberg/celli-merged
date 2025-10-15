import * as THREE from 'three';

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const DEFAULT_SETTINGS = {
  maxDimension: 96,
  duration: 3600,
  burstDelay: 650,
  voxelDepth: 80
};

export class VoxelShatter {
  constructor() {
    this.container = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.voxelMesh = null;
    this.whitePlane = null;
    this.flatPlane = null;
    this.animationFrame = null;
    this.clock = null;
    this.resolve = null;
    this.voxelData = [];
    this.duration = DEFAULT_SETTINGS.duration;
    this.burstDelay = DEFAULT_SETTINGS.burstDelay;
    this.active = false;
  }

  async startFromCanvas(canvas, options = {}) {
    if (!canvas) {
      throw new Error('VoxelShatter requires a source canvas');
    }

    if (this.active) {
      this.dispose();
    }

    const settings = { ...DEFAULT_SETTINGS, ...options };
    this.duration = settings.duration;
    this.burstDelay = settings.burstDelay;

    const container = document.createElement('div');
    container.className = 'voxel-shatter-scene';
    container.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 2147483900;
      pointer-events: none;
      background: transparent;
    `;
    document.body.appendChild(container);

    this.container = container;
    document.body.classList.add('voxel-shatter-active');

    await this.#setupRenderer(container);
    this.#setupScene();
    this.#buildPlanes(canvas);
    this.#buildVoxels(canvas, settings.maxDimension, settings.voxelDepth);

    this.active = true;

    return new Promise((resolve) => {
      this.resolve = resolve;
      this.clock = new THREE.Clock();
      this.animationFrame = requestAnimationFrame(() => this.#render());
    });
  }

  async #setupRenderer(container) {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    this.renderer = renderer;

    window.addEventListener('resize', this.#handleResize, { passive: true });
  }

  #setupScene() {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xffffff, 0.012);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 140);

    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xffffff, 0.6);
    directional.position.set(0.4, 0.7, 1.2);
    scene.add(directional);

    this.scene = scene;
    this.camera = camera;
  }

  #buildPlanes(canvas) {
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    const aspect = canvas.width / canvas.height;
    const planeHeight = 70;
    const planeWidth = planeHeight * aspect;

    const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
    const planeMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 1 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.scene.add(plane);
    this.flatPlane = plane;

    const whitePlaneGeometry = new THREE.PlaneGeometry(planeWidth * 1.1, planeHeight * 1.1);
    const whitePlaneMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
    const whitePlane = new THREE.Mesh(whitePlaneGeometry, whitePlaneMaterial);
    whitePlane.position.z = -4;
    this.scene.add(whitePlane);
    this.whitePlane = whitePlane;
  }

  #buildVoxels(canvas, maxDimension, depth) {
    const sourceWidth = canvas.width;
    const sourceHeight = canvas.height;

    const aspect = sourceWidth / sourceHeight;
    let targetWidth = maxDimension;
    let targetHeight = Math.round(targetWidth / aspect);

    if (targetHeight > maxDimension) {
      targetHeight = maxDimension;
      targetWidth = Math.round(targetHeight * aspect);
    }

    const downscale = document.createElement('canvas');
    downscale.width = targetWidth;
    downscale.height = targetHeight;
    const ctx = downscale.getContext('2d');
    ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
    const data = ctx.getImageData(0, 0, targetWidth, targetHeight).data;

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      metalness: 0.1,
      roughness: 0.35,
      transparent: true,
      opacity: 0
    });

    const voxels = [];
    const offsetX = targetWidth / 2;
    const offsetY = targetHeight / 2;

    for (let y = 0; y < targetHeight; y += 1) {
      for (let x = 0; x < targetWidth; x += 1) {
        const index = (y * targetWidth + x) * 4;
        const alpha = data[index + 3];
        if (alpha < 64) {
          continue;
        }

        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];

        voxels.push({
          position: new THREE.Vector3((x - offsetX) * 0.9, (offsetY - y) * 0.9, 0),
          direction: new THREE.Vector3((Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.6, 1).normalize(),
          color: new THREE.Color(r / 255, g / 255, b / 255)
        });
      }
    }

    const mesh = new THREE.InstancedMesh(geometry, material, voxels.length);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(voxels.length * 3), 3);

    const dummy = new THREE.Object3D();
    voxels.forEach((voxel, index) => {
      dummy.position.copy(voxel.position);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
      mesh.instanceColor.setXYZ(index, voxel.color.r, voxel.color.g, voxel.color.b);
    });
    mesh.instanceColor.needsUpdate = true;

    this.scene.add(mesh);
    this.voxelMesh = mesh;
    this.voxelData = voxels;
    this.voxelDepth = depth;
  }

  #render() {
    if (!this.active) {
      return;
    }

    const elapsed = this.clock.getElapsedTime() * 1000;
    const burstStart = this.burstDelay;
    const burstDuration = Math.max(600, this.duration - burstStart);
    const dummy = new THREE.Object3D();

    if (this.voxelMesh && this.voxelMesh.material.opacity < 1) {
      this.voxelMesh.material.opacity = Math.min(1, this.voxelMesh.material.opacity + 0.05);
    }

    const burstProgress = easeOutCubic(Math.min(Math.max(elapsed - burstStart, 0) / burstDuration, 1));
    const planeFade = Math.min(1, elapsed / burstStart);

    if (this.flatPlane) {
      this.flatPlane.material.opacity = Math.max(0, 1 - planeFade);
      this.flatPlane.position.z = -burstProgress * 5;
    }

    if (this.whitePlane) {
      this.whitePlane.material.opacity = Math.min(1, burstProgress * 1.4);
    }

    if (this.voxelMesh) {
      const wobble = Math.sin(elapsed * 0.0018) * 0.6;
      this.voxelData.forEach((voxel, index) => {
        const depth = burstProgress * this.voxelDepth;
        dummy.position.set(
          voxel.position.x + voxel.direction.x * depth,
          voxel.position.y + voxel.direction.y * depth + wobble,
          voxel.position.z + voxel.direction.z * depth
        );
        dummy.rotation.set(
          voxel.direction.y * burstProgress * Math.PI,
          voxel.direction.x * burstProgress * Math.PI,
          voxel.direction.z * burstProgress * 0.6
        );
        const scale = Math.max(0.2, 1 - burstProgress * 0.6);
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        this.voxelMesh.setMatrixAt(index, dummy.matrix);
      });
      this.voxelMesh.instanceMatrix.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);

    if (elapsed >= this.duration + 500) {
      this.#finish();
      return;
    }

    this.animationFrame = requestAnimationFrame(() => this.#render());
  }

  #finish() {
    if (!this.active) {
      return;
    }

    this.dispose();
    if (typeof this.resolve === 'function') {
      this.resolve();
    }
  }

  #handleResize = () => {
    if (!this.renderer || !this.camera) {
      return;
    }
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  };

  dispose() {
    cancelAnimationFrame(this.animationFrame);
    window.removeEventListener('resize', this.#handleResize);

    if (this.voxelMesh) {
      this.voxelMesh.geometry.dispose();
      this.voxelMesh.material.dispose();
    }
    if (this.flatPlane) {
      this.flatPlane.geometry.dispose();
      if (this.flatPlane.material.map) {
        this.flatPlane.material.map.dispose();
      }
      this.flatPlane.material.dispose();
    }
    if (this.whitePlane) {
      this.whitePlane.geometry.dispose();
      this.whitePlane.material.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    document.body.classList.remove('voxel-shatter-active');

    this.container = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.voxelMesh = null;
    this.whitePlane = null;
    this.flatPlane = null;
    this.animationFrame = null;
    this.clock = null;
    this.resolve = null;
    this.voxelData = [];
    this.active = false;
  }
}

export const voxelShatter = new VoxelShatter();

