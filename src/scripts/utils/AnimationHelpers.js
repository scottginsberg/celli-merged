/**
 * Animation Helper Functions
 * Easing, timing, and animation utilities
 */

/**
 * Easing functions
 */
export const Easing = {
  linear: (t) => t,
  
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => (--t) * t * t + 1,
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  
  easeInQuart: (t) => t * t * t * t,
  easeOutQuart: (t) => 1 - (--t) * t * t * t,
  easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
  
  easeInQuint: (t) => t * t * t * t * t,
  easeOutQuint: (t) => 1 + (--t) * t * t * t * t,
  easeInOutQuint: (t) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
  
  easeInExpo: (t) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: (t) => {
    if (t === 0 || t === 1) return t;
    if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
    return (2 - Math.pow(2, -20 * t + 10)) / 2;
  },
  
  easeInBack: (t, s = 1.70158) => t * t * ((s + 1) * t - s),
  easeOutBack: (t, s = 1.70158) => {
    const tt = t - 1;
    return tt * tt * ((s + 1) * tt + s) + 1;
  },
  easeInOutBack: (t, s = 1.70158) => {
    const s2 = s * 1.525;
    if ((t *= 2) < 1) return 0.5 * (t * t * ((s2 + 1) * t - s2));
    return 0.5 * ((t -= 2) * t * ((s2 + 1) * t + s2) + 2);
  },
  
  easeInElastic: (t) => {
    if (t === 0 || t === 1) return t;
    return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
  },
  easeOutElastic: (t) => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
  },
  
  smoothstep: (t) => t * t * (3 - 2 * t),
  smootherstep: (t) => t * t * t * (t * (t * 6 - 15) + 10)
};

/**
 * Animate value over time
 */
export class ValueAnimator {
  constructor(from, to, duration, easing = Easing.easeOutCubic) {
    this.from = from;
    this.to = to;
    this.duration = duration;
    this.easing = easing;
    this.startTime = null;
    this.value = from;
    this.complete = false;
  }
  
  update(time) {
    if (this.complete) return this.to;
    
    if (this.startTime === null) {
      this.startTime = time;
    }
    
    const elapsed = time - this.startTime;
    const t = Math.min(1, elapsed / this.duration);
    const eased = this.easing(t);
    
    this.value = this.from + (this.to - this.from) * eased;
    
    if (t >= 1) {
      this.value = this.to;
      this.complete = true;
    }
    
    return this.value;
  }
  
  reset() {
    this.startTime = null;
    this.value = this.from;
    this.complete = false;
  }
}

/**
 * Spring animation
 */
export class Spring {
  constructor(value = 0, stiffness = 0.1, damping = 0.8) {
    this.value = value;
    this.target = value;
    this.velocity = 0;
    this.stiffness = stiffness;
    this.damping = damping;
  }
  
  setTarget(target) {
    this.target = target;
  }
  
  update(dt = 1) {
    const force = (this.target - this.value) * this.stiffness;
    this.velocity += force;
    this.velocity *= this.damping;
    this.value += this.velocity * dt;
    return this.value;
  }
}

/**
 * Tween manager
 */
export class TweenManager {
  constructor() {
    this.tweens = [];
  }
  
  add(tween) {
    this.tweens.push(tween);
    return tween;
  }
  
  remove(tween) {
    const index = this.tweens.indexOf(tween);
    if (index !== -1) {
      this.tweens.splice(index, 1);
    }
  }
  
  update(time) {
    for (let i = this.tweens.length - 1; i >= 0; i--) {
      const tween = this.tweens[i];
      tween.update(time);
      if (tween.complete) {
        this.tweens.splice(i, 1);
      }
    }
  }
  
  clear() {
    this.tweens = [];
  }
}

export default {
  Easing,
  ValueAnimator,
  Spring,
  TweenManager
};



