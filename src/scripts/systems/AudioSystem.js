/**
 * Audio System - Synth, chimes, procedural sounds, and Animalese TTS
 * Extracted from merged2.html lines ~1045-1100, ~54266-54296
 */

export class AudioSystem {
  constructor() {
    this.audioCtx = null;
    this.animaleseCtx = null;
    this.audioBuffers = new Map();
    this.initialized = false;
    this.musicState = {
      source: null,
      gain: null,
      key: null,
      volume: 1
    };
  }

  /**
   * Initialize Audio Context (must be called after user interaction)
   */
  init() {
    if (this.initialized) return;
    
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.animaleseCtx = this.audioCtx; // Same context for now
      this.initialized = true;
      console.log('🔊 Audio System initialized');
      
      // Make globally accessible for compatibility
      window.audioCtx = this.audioCtx;
    } catch (e) {
      console.error('Failed to initialize Audio Context:', e);
    }
  }

  /**
   * Ensure context is initialized
   */
  ensureContext() {
    if (!this.audioCtx) this.init();
    return this.audioCtx;
  }

  /**
   * Play a simple chime sound
   */
  playChime(frequency = 880, duration = 0.3, volume = 0.15) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.5, now + duration);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.1);
  }

  /**
   * Play voxel landing chime
   */
  playVoxelChime() {
    this.playChime(880 + Math.random() * 220, 0.3, 0.15);
  }

  /**
   * Play a clunk sound
   */
  playClunk(volume = 0.18) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.06);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.value = 0.6;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  /**
   * Play a thunk sound (shape landing)
   */
  playThunk(frequency = 100, volume = 0.2) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.3, now + 0.15);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.Q.value = 1.0;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  /**
   * Animalese-style Text-To-Speech
   * Creates procedural speech sounds like Animal Crossing
   */
  speakAnimalese(text, options = {}) {
    const {
      rate = 16,
      base = 420,
      jitter = 40,
      gain = 0.06
    } = options;

    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    let t = now + 0.05;
    const chars = String(text || '').split('');

    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      if (ch === ' ') {
        t += 0.02;
        continue;
      }

      const code = ch.charCodeAt(0) || 65;
      const vowelBoost = /[aeiou]/i.test(ch) ? 1.12 : 1.0;
      const freq = base * vowelBoost + ((code % 13) - 6) * 8 + (Math.random() * jitter - jitter / 2);
      const dur = 0.028 + Math.random() * 0.01;

      const osc = ctx.createOscillator();
      const gn = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(Math.max(80, freq), t);

      gn.gain.setValueAtTime(0, t);
      gn.gain.linearRampToValueAtTime(gain, t + 0.005);
      gn.gain.exponentialRampToValueAtTime(0.0008, t + dur);

      osc.connect(gn);
      gn.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.01);

      t += 1 / Math.max(8, rate);
    }
  }

  /**
   * Load audio buffer from URL
   */
  async loadAudioBuffer(url, key) {
    if (this.audioBuffers.has(key)) {
      return this.audioBuffers.get(key);
    }

    const ctx = this.ensureContext();
    if (!ctx) return null;

    try {
      console.log(`🔊 Loading audio: ${url}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      
      this.audioBuffers.set(key, audioBuffer);
      console.log(`✅ Audio loaded: ${key} (${audioBuffer.duration.toFixed(2)}s)`);
      
      return audioBuffer;
    } catch (error) {
      console.error(`❌ Failed to load audio ${url}:`, error);
      return null;
    }
  }

  /**
   * Play audio buffer
   */
  playBuffer(bufferOrKey, options = {}) {
    const ctx = this.ensureContext();
    if (!ctx) return null;

    let buffer;
    if (typeof bufferOrKey === 'string') {
      buffer = this.audioBuffers.get(bufferOrKey);
      if (!buffer) {
        console.error(`Audio buffer not found: ${bufferOrKey}`);
        return null;
      }
    } else {
      buffer = bufferOrKey;
    }

    try {
      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const gainNode = ctx.createGain();
      gainNode.gain.value = options.volume ?? 1.0;

      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      source.start(options.startTime ?? 0);

      if (options.onEnded) {
        source.onended = options.onEnded;
      }

      return source;
    } catch (error) {
      console.error('Failed to play audio buffer:', error);
      return null;
    }
  }

  async playMusic({ key, url, loop = true, volume = 0.6, fadeInDuration = 1.8 } = {}) {
    const ctx = this.ensureContext();
    if (!ctx) return null;

    const cacheKey = key || url;
    if (!cacheKey) {
      console.warn('AudioSystem.playMusic requires a key or url');
      return null;
    }

    let buffer = this.audioBuffers.get(cacheKey);
    if (!buffer) {
      const resolvedUrl = url || cacheKey;
      buffer = await this.loadAudioBuffer(resolvedUrl, cacheKey);
    }

    if (!buffer) {
      return null;
    }

    this.stopMusic({ fadeOutDuration: 0.2 });

    try {
      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();

      source.buffer = buffer;
      source.loop = loop;

      const now = ctx.currentTime;
      const duration = Math.max(0.05, fadeInDuration ?? 0);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + duration);

      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      source.start(now);

      this.musicState = {
        source,
        gain: gainNode,
        key: cacheKey,
        volume
      };

      source.onended = () => {
        if (!source.loop && this.musicState.source === source) {
          this.musicState = {
            source: null,
            gain: null,
            key: null,
            volume: 1
          };
        }
      };

      return source;
    } catch (error) {
      console.error('Failed to start music playback:', error);
      return null;
    }
  }

  stopMusic({ fadeOutDuration = 0.5 } = {}) {
    const ctx = this.audioCtx;
    const { source, gain } = this.musicState;

    if (!ctx || !source || !gain) {
      return;
    }

    const now = ctx.currentTime;
    const duration = Math.max(0.05, fadeOutDuration ?? 0);

    try {
      const currentValue = gain.gain.value;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(currentValue, now);
      gain.gain.linearRampToValueAtTime(0, now + duration);
      source.stop(now + duration);
    } catch (error) {
      console.warn('AudioSystem.stopMusic failed:', error);
    }

    this.musicState = {
      source: null,
      gain: null,
      key: null,
      volume: 1
    };
  }

  /**
   * Create a simple synth tone
   */
  playSynth(frequency, duration, options = {}) {
    const {
      type = 'sine',
      volume = 0.3,
      attack = 0.01,
      release = 0.1
    } = options;

    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + attack);
    gain.gain.linearRampToValueAtTime(0, now + duration - release);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);

    return { osc, gain };
  }

  /**
   * Get or create audio context (for compatibility)
   */
  getContext() {
    return this.ensureContext();
  }

  /**
   * Resume context (for autoplay policy)
   */
  async resume() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
      console.log('🔊 Audio Context resumed');
    }
  }
}

// Export singleton instance
export const audioSystem = new AudioSystem();
export default audioSystem;


