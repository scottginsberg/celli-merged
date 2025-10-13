/**
 * Complete Particle System - Ported from merged2.html
 * 
 * Unified particle system supporting multiple types:
 * - Text particles (click interactions, manic text, equations, time)
 * - Star particles (burst from voxels)
 * - Derez particles (canvas-rendered squares)
 * - Matrix rain particles (R infection)
 * - Explosion particles (DELETE function)
 * 
 * All particles share common physics and rendering pipeline
 */

export class ParticleSystemComplete {
  constructor() {
    this.state = {
      textParticles: [],
      starParticles: [],
      derezParticles: [],
      matrixParticles: [],
      explosionParticles: [],
      
      // Canvas for derez rendering
      derezCanvas: null,
      derezCtx: null,
      
      // Text options
      manicTexts: ["huh?", "who's there?", "AH!", "HAHA.", "ow.", "ahh...", "oh!", "what?", "why?", "where?", "when?"],
      equationTexts: ["x +y =r ", "∫f(x)dx", "E=mc²", "∂f/∂x", "Σ(x)", "√(a²+b²)", "(0,0)", "(x,y,z)", "[1,2,3]", "θ=arctan(y/x)", "∇·F", "dy/dx"],
      glitchGlyphs: "!<>-_\\/[]{}=+*^?#▓█"
    };
  }

  /**
   * Initialize particle system
   */
  init() {
    // Create derez canvas for particle rendering
    this.state.derezCanvas = document.createElement('canvas');
    this.state.derezCanvas.id = 'derez-canvas';
    this.state.derezCanvas.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 150;
      mix-blend-mode: screen;
    `;
    this.state.derezCanvas.width = window.innerWidth;
    this.state.derezCanvas.height = window.innerHeight;
    this.state.derezCtx = this.state.derezCanvas.getContext('2d');
    
    document.body.appendChild(this.state.derezCanvas);
    
    // Handle resize
    window.addEventListener('resize', () => this._handleResize());
    
    console.log('✨ Particle system initialized');
  }

  /**
   * Create text particle at position
   */
  createTextParticle(x, y, options = {}) {
    const {
      text = this._getRandomManicText(),
      color = this._getRandomColor(),
      sourceIndex = 0,
      type = 'manic'
    } = options;
    
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.004 + Math.random() * 0.006;
    
    const particle = {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      text,
      color,
      life: 1.0,
      age: 0,
      rotation: (Math.random() - 0.5) * 0.03,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      pulse: Math.random() * Math.PI * 2,
      sourceIndex,
      collapsing: false,
      type
    };
    
    this.state.textParticles.push(particle);
    return particle;
  }

  /**
   * Create star particle (from voxel burst)
   */
  createStarParticle(x, y, options = {}) {
    const {
      color = '#ffffff',
      size = 0.02 + Math.random() * 0.03
    } = options;
    
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.01 + Math.random() * 0.02;
    
    const particle = {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      size,
      color,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05
    };
    
    this.state.starParticles.push(particle);
    return particle;
  }

  /**
   * Create derez particle (canvas square)
   */
  createDerezParticle(x, y, options = {}) {
    const {
      color = '#00ffff',
      size = 4 + Math.random() * 8,
      lifespan = 1.0 + Math.random() * 0.5
    } = options;
    
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 1.5;
    
    const particle = {
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.0, // Upward bias
      life: lifespan,
      maxLife: lifespan,
      size,
      color,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1
    };
    
    this.state.derezParticles.push(particle);
    return particle;
  }

  /**
   * Create matrix rain particle (for R infection)
   */
  createMatrixParticle(x, options = {}) {
    const {
      length = 10 + Math.floor(Math.random() * 20),
      speed = 1 + Math.random() * 2
    } = options;
    
    const particle = {
      x,
      y: -length * 20,
      speed,
      length,
      chars: Array.from({ length }, () => 
        String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96))
      ),
      opacity: 0.5 + Math.random() * 0.5
    };
    
    this.state.matrixParticles.push(particle);
    return particle;
  }

  /**
   * Create explosion particles (for DELETE function)
   */
  createExplosion(x, y, options = {}) {
    const {
      count = 30,
      text = '█',
      colors = ['#ff1e6e', '#00a8ff', '#ffb62e', '#0f0']
    } = options;
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const particle = {
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.0,
        gravity: 0.2,
        life: 1.0,
        text,
        color,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        scale: 1.0 + Math.random() * 0.5
      };
      
      this.state.explosionParticles.push(particle);
    }
    
    console.log(`💥 Explosion created (${count} particles)`);
  }

  /**
   * Update all particles
   */
  update(deltaTime, camera) {
    this._updateTextParticles(deltaTime);
    this._updateStarParticles(deltaTime);
    this._updateDerezParticles(deltaTime);
    this._updateMatrixParticles(deltaTime);
    this._updateExplosionParticles(deltaTime);
  }

  /**
   * Update text particles
   */
  _updateTextParticles(dt) {
    for (let i = this.state.textParticles.length - 1; i >= 0; i--) {
      const p = this.state.textParticles[i];
      
      p.age += dt;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.99;
      p.vy *= 0.99;
      p.rotation += p.rotationSpeed;
      p.pulse += dt * 4;
      
      // Collapse after 1.8 seconds
      if (p.age > 1.8 && !p.collapsing) {
        p.collapsing = true;
      }
      
      if (p.collapsing) {
        p.life -= dt * 2.5;
        p.rotationSpeed *= 1.05;
      } else {
        p.life -= dt * 0.5;
      }
      
      if (p.life <= 0) {
        this.state.textParticles.splice(i, 1);
      }
    }
  }

  /**
   * Update star particles
   */
  _updateStarParticles(dt) {
    for (let i = this.state.starParticles.length - 1; i >= 0; i--) {
      const p = this.state.starParticles[i];
      
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.life -= dt * 0.8;
      
      if (p.life <= 0) {
        this.state.starParticles.splice(i, 1);
      }
    }
  }

  /**
   * Update derez particles
   */
  _updateDerezParticles(dt) {
    const dtSeconds = dt * 60; // Assuming 60fps
    
    for (let i = this.state.derezParticles.length - 1; i >= 0; i--) {
      const p = this.state.derezParticles[i];
      
      p.x += p.vx * dtSeconds;
      p.y += p.vy * dtSeconds;
      p.vy += 0.5 * dtSeconds; // Gravity
      p.rotation += p.rotationSpeed * dtSeconds;
      p.life -= dt;
      
      if (p.life <= 0) {
        this.state.derezParticles.splice(i, 1);
      }
    }
  }

  /**
   * Update matrix rain particles
   */
  _updateMatrixParticles(dt) {
    for (let i = this.state.matrixParticles.length - 1; i >= 0; i--) {
      const p = this.state.matrixParticles[i];
      
      p.y += p.speed * dt * 60;
      
      // Randomize characters occasionally
      if (Math.random() < 0.1) {
        const idx = Math.floor(Math.random() * p.chars.length);
        p.chars[idx] = String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96));
      }
      
      // Remove if off screen
      if (p.y > window.innerHeight + p.length * 20) {
        this.state.matrixParticles.splice(i, 1);
      }
    }
  }

  /**
   * Update explosion particles
   */
  _updateExplosionParticles(dt) {
    for (let i = this.state.explosionParticles.length - 1; i >= 0; i--) {
      const p = this.state.explosionParticles[i];
      
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.vy += p.gravity * dt * 60;
      p.rotation += p.rotationSpeed * dt * 60;
      p.life -= dt;
      
      if (p.life <= 0) {
        this.state.explosionParticles.splice(i, 1);
      }
    }
  }

  /**
   * Render all particles
   */
  render(camera) {
    // Render derez particles to canvas
    if (this.state.derezCtx) {
      this._renderDerezParticles();
    }
    
    // Text, star, matrix, and explosion particles need DOM/3D rendering
    // (handled by scene renderers)
  }

  /**
   * Render derez particles to canvas
   */
  _renderDerezParticles() {
    const ctx = this.state.derezCtx;
    const canvas = this.state.derezCanvas;
    
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Render each particle
    this.state.derezParticles.forEach(p => {
      ctx.save();
      
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      
      // Draw square
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      
      // Glow
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      
      ctx.restore();
    });
  }

  /**
   * Get random manic text
   */
  _getRandomManicText() {
    return this.state.manicTexts[Math.floor(Math.random() * this.state.manicTexts.length)];
  }

  /**
   * Get random equation text
   */
  _getRandomEquationText() {
    return this.state.equationTexts[Math.floor(Math.random() * this.state.equationTexts.length)];
  }

  /**
   * Get current time text
   */
  _getTimeText() {
    const formats = [
      new Date().toLocaleTimeString(),
      new Date().toLocaleDateString(),
      `${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, '0')}`,
      new Date().getFullYear().toString(),
      `${Math.floor(Date.now() / 1000)}`,
      new Date().toISOString().split('T')[0]
    ];
    return formats[Math.floor(Math.random() * formats.length)];
  }

  /**
   * Get random particle color
   */
  _getRandomColor() {
    const colors = ['#00a8ff', '#ffb62e', '#ff1e6e'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Handle window resize
   */
  _handleResize() {
    if (this.state.derezCanvas) {
      this.state.derezCanvas.width = window.innerWidth;
      this.state.derezCanvas.height = window.innerHeight;
    }
  }

  /**
   * Clear all particles
   */
  clear() {
    this.state.textParticles = [];
    this.state.starParticles = [];
    this.state.derezParticles = [];
    this.state.matrixParticles = [];
    this.state.explosionParticles = [];
    
    if (this.state.derezCtx) {
      this.state.derezCtx.clearRect(0, 0, this.state.derezCanvas.width, this.state.derezCanvas.height);
    }
  }

  /**
   * Get particle counts
   */
  getCounts() {
    return {
      text: this.state.textParticles.length,
      star: this.state.starParticles.length,
      derez: this.state.derezParticles.length,
      matrix: this.state.matrixParticles.length,
      explosion: this.state.explosionParticles.length,
      total: this.state.textParticles.length + 
             this.state.starParticles.length + 
             this.state.derezParticles.length +
             this.state.matrixParticles.length +
             this.state.explosionParticles.length
    };
  }

  /**
   * Destroy system
   */
  destroy() {
    this.clear();
    
    if (this.state.derezCanvas) {
      this.state.derezCanvas.remove();
      this.state.derezCanvas = null;
      this.state.derezCtx = null;
    }
  }
}

// Singleton instance
export const particleSystem = new ParticleSystemComplete();
export default particleSystem;


