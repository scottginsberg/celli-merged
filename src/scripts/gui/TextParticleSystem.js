/**
 * Text Particle System - Interactive click particles that orbit back to spheres
 * Extracted from merged2.html lines ~1378-1518
 */

export class TextParticleSystem {
  constructor() {
    this.particles = [];
    this.manicTexts = ["huh?", "who's there?", "AH!", "HAHA.", "ow.", "ahh...", "oh!", "what?", "why?", "where?", "when?"];
    this.equationTexts = [
      "x +y =r ", "∫f(x)dx", "E=mc²", "∂f/∂x", "S(x)", "v(a +b )",
      "(0,0)", "(x,y,z)", "[1,2,3]", "θ=arctan(y/x)", "∇ F", "dy/dx"
    ];
  }

  /**
   * Get time-based text
   */
  getTimeTexts() {
    const formats = [
      new Date().toLocaleTimeString(),
      new Date().toLocaleDateString(),
      `${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2,'0')}`,
      new Date().getFullYear().toString(),
      `${Math.floor(Date.now()/1000)}`,
      new Date().toISOString().split('T')[0]
    ];
    return formats[Math.floor(Math.random() * formats.length)];
  }

  /**
   * Create a text particle
   */
  createParticle(x, y, text, color, sourceIndex) {
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
      collapsing: false
    };
    
    this.particles.push(particle);
    return particle;
  }

  /**
   * Update all particles
   */
  update(dt, spheres) {
    if (!spheres || spheres.length === 0) return;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      p.age += dt;
      
      // Get source sphere position
      const source = spheres[p.sourceIndex]?.position;
      if (!source) {
        this.particles.splice(i, 1);
        continue;
      }
      
      // Calculate attraction to source (gravitational pull)
      const dx = source.x - p.x;
      const dy = source.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // After 1.8 seconds, begin dramatic collapse
      if (p.age > 1.8 && !p.collapsing) {
        p.collapsing = true;
      }
      
      if (p.collapsing) {
        // Dramatic collapse: strong pull, wild rotation, rapid fade
        const collapseForce = 0.0008 / (dist * dist + 0.01);
        p.vx += (dx / dist) * collapseForce;
        p.vy += (dy / dist) * collapseForce;
        
        // Accelerate rotation
        p.rotationSpeed *= 1.05;
        
        // Rapid fade during collapse
        p.life -= dt * 2.5;
      } else {
        // Normal orbit phase
        if (dist > 0.01) {
          const force = 0.00008 / (dist + 0.1);
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
        
        // Apply orbital motion
        const orbitForce = 0.00012;
        p.vx += -dy * orbitForce;
        p.vy += dx * orbitForce;
        
        // Normal fade
        p.life -= dt * 0.5;
      }
      
      // Update position
      p.x += p.vx;
      p.y += p.vy;
      
      // Damping (less during collapse for dramatic effect)
      const dampFactor = p.collapsing ? 0.97 : 0.99;
      p.vx *= dampFactor;
      p.vy *= dampFactor;
      
      // Update rotation and pulse
      p.rotation += p.rotationSpeed;
      p.pulse += dt * (p.collapsing ? 8 : 4);
      
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Render particles to 2D canvas
   */
  render(ctx, camera) {
    if (!ctx || !camera) return;
    
    ctx.save();
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (const p of this.particles) {
      // Project from world to screen
      const screenX = (p.x / camera.right) * (window.innerWidth / 2) + (window.innerWidth / 2);
      const screenY = (-p.y / camera.top) * (window.innerHeight / 2) + (window.innerHeight / 2);
      
      ctx.save();
      ctx.translate(screenX, screenY);
      ctx.rotate(p.rotation);
      
      const alpha = p.life * p.life;
      const pulseFactor = 0.85 + Math.sin(p.pulse) * 0.15;
      const glowSize = 5 + Math.sin(p.pulse * 0.7) * 3;
      
      // Scale down dramatically during collapse
      const scaleFactor = p.collapsing ? Math.max(0.1, 1.0 - (p.age - 1.8) * 1.2) : 1.0;
      ctx.scale(scaleFactor, scaleFactor);
      
      // Outer colored glow
      const collapseIntensity = p.collapsing ? 1.5 : 1.0;
      ctx.shadowBlur = glowSize * 4 * collapseIntensity;
      ctx.shadowColor = p.color;
      ctx.globalAlpha = alpha * 0.9 * collapseIntensity;
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, 0, 0);
      
      // Mid white glow
      ctx.shadowBlur = glowSize * 2;
      ctx.shadowColor = '#ffffff';
      ctx.globalAlpha = alpha * 0.95;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(p.text, 0, 0);
      
      // Bright white base
      ctx.shadowBlur = glowSize * 0.5;
      ctx.shadowColor = '#ffffff';
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(p.text, 0, 0);
      
      // Colored accent overlay
      ctx.shadowBlur = 0;
      ctx.globalAlpha = alpha * 0.4;
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, 0, 0);
      
      ctx.restore();
    }
    ctx.restore();
  }

  /**
   * Get random manic text
   */
  getManicText() {
    return this.manicTexts[Math.floor(Math.random() * this.manicTexts.length)];
  }

  /**
   * Get random equation text
   */
  getEquationText() {
    return this.equationTexts[Math.floor(Math.random() * this.equationTexts.length)];
  }

  /**
   * Clear all particles
   */
  clear() {
    this.particles.length = 0;
  }

  /**
   * Get particle count
   */
  count() {
    return this.particles.length;
  }
}

// Export singleton instance
export const textParticleSystem = new TextParticleSystem();
export default textParticleSystem;


