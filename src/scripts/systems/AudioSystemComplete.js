/**
 * Complete Audio System - Ported from merged2.html
 * 
 * Features:
 * - Web Audio API context management
 * - Audio buffer loading and playback
 * - Synthesizer (sustained tones with harmonics)
 * - Thunk sounds (shape landing)
 * - Fritz sounds (electrical restoration)
 * - Chime sounds
 * - Animalese TTS (Animal Crossing-style speech)
 * - Audio visualization hooks
 */

export class AudioSystemComplete {
  constructor() {
    this.state = {
      audioCtx: null,
      audioBuffers: {},
      
      // Synth system
      synthGain: null,
      synthOsc1: null,
      synthOsc2: null,
      synthOsc3: null,
      synthActive: false,
      
      // State tracking
      landingSounds: [false, false, false],
      lastThunkTime: [0, 0, 0],
      
      // Animalese TTS
      speechActive: false,
      speechQueue: []
    };
  }

  /**
   * Initialize audio context
   */
  async init() {
    if (this.state.audioCtx) return;
    
    try {
      this.state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      window.audioCtx = this.state.audioCtx; // Global access for compatibility
      
      console.log('🔊 Audio system initialized');
      console.log('   Sample rate:', this.state.audioCtx.sampleRate);
      console.log('   State:', this.state.audioCtx.state);
      
      return true;
    } catch (e) {
      console.error('❌ Audio initialization failed:', e);
      return false;
    }
  }

  /**
   * Resume audio context (needed after user interaction)
   */
  async resume() {
    if (!this.state.audioCtx) await this.init();
    
    if (this.state.audioCtx.state === 'suspended') {
      await this.state.audioCtx.resume();
      console.log('▶️ Audio context resumed');
    }
  }

  /**
   * Load audio buffer from URL
   */
  async loadAudioBuffer(url, key) {
    if (!this.state.audioCtx) await this.init();
    
    try {
      console.log(`🔊 Loading audio: ${url}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.state.audioCtx.decodeAudioData(arrayBuffer);
      
      this.state.audioBuffers[key] = audioBuffer;
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
  playAudioBuffer(keyOrBuffer, options = {}) {
    const buffer = typeof keyOrBuffer === 'string' 
      ? this.state.audioBuffers[keyOrBuffer]
      : keyOrBuffer;
    
    if (!buffer) {
      console.error('❌ Audio buffer not found:', keyOrBuffer);
      return null;
    }
    
    if (!this.state.audioCtx) {
      console.error('❌ Audio context not initialized');
      return null;
    }
    
    try {
      const source = this.state.audioCtx.createBufferSource();
      source.buffer = buffer;
      
      // Apply options
      const gainNode = this.state.audioCtx.createGain();
      gainNode.gain.value = options.volume !== undefined ? options.volume : 1.0;
      
      source.connect(gainNode);
      gainNode.connect(this.state.audioCtx.destination);
      
      if (options.loop) {
        source.loop = true;
      }
      
      const startTime = options.delay ? this.state.audioCtx.currentTime + options.delay : 0;
      source.start(startTime);
      
      if (options.duration) {
        source.stop(startTime + options.duration);
      }
      
      return { source, gainNode };
    } catch (error) {
      console.error('❌ Error playing audio:', error);
      return null;
    }
  }

  /**
   * Play thunk sound (shape landing)
   */
  playThunk(index = 0, options = {}) {
    if (!this.state.audioCtx) return;
    
    // Check rate limiting
    const now = this.state.audioCtx.currentTime;
    if (now - this.state.lastThunkTime[index] < 0.1) return;
    this.state.lastThunkTime[index] = now;
    
    try {
      const osc = this.state.audioCtx.createOscillator();
      const gain = this.state.audioCtx.createGain();
      
      osc.type = 'sine';
      
      // Frequency based on shape index (lower for later shapes)
      const baseFreq = options.frequency || (150 - index * 20);
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
      
      // Volume envelope
      const volume = options.volume !== undefined ? options.volume : 0.3;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      
      osc.connect(gain);
      gain.connect(this.state.audioCtx.destination);
      
      osc.start(now);
      osc.stop(now + 0.3);
      
      console.log(`🔊 Thunk ${index} (${baseFreq}Hz)`);
    } catch (e) {
      console.warn('⚠️ Thunk sound failed:', e);
    }
  }

  /**
   * Play fritz sound (electrical restoration)
   */
  playFritz(options = {}) {
    if (!this.state.audioCtx) return;
    
    try {
      const now = this.state.audioCtx.currentTime;
      const osc = this.state.audioCtx.createOscillator();
      const gain = this.state.audioCtx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.25);
      
      const volume = options.volume !== undefined ? options.volume : 0.1;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      
      osc.connect(gain);
      gain.connect(this.state.audioCtx.destination);
      
      osc.start(now);
      osc.stop(now + 0.25);
      
      console.log('⚡ Fritz sound');
    } catch (e) {
      console.warn('⚠️ Fritz sound failed:', e);
    }
  }

  /**
   * Play chime sound
   */
  playChime(pitch = 1.0, options = {}) {
    if (!this.state.audioCtx) return;
    
    try {
      const now = this.state.audioCtx.currentTime;
      
      // Multiple oscillators for richer tone
      const oscs = [
        { freq: 523.25 * pitch, type: 'sine', gain: 0.3 },      // C5
        { freq: 659.25 * pitch, type: 'sine', gain: 0.2 },      // E5
        { freq: 783.99 * pitch, type: 'sine', gain: 0.15 },     // G5
        { freq: 1046.50 * pitch, type: 'sine', gain: 0.1 }      // C6
      ];
      
      const masterGain = this.state.audioCtx.createGain();
      const volume = options.volume !== undefined ? options.volume : 0.4;
      
      masterGain.gain.setValueAtTime(volume, now);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
      masterGain.connect(this.state.audioCtx.destination);
      
      oscs.forEach(({ freq, type, gain }) => {
        const osc = this.state.audioCtx.createOscillator();
        const oscGain = this.state.audioCtx.createGain();
        
        osc.type = type;
        osc.frequency.value = freq;
        oscGain.gain.value = gain;
        
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        
        osc.start(now);
        osc.stop(now + 2.0);
      });
      
      console.log('🔔 Chime');
    } catch (e) {
      console.warn('⚠️ Chime failed:', e);
    }
  }

  /**
   * Start synth (sustained tone with harmonics)
   */
  startSynth(baseFreq = 220, options = {}) {
    if (!this.state.audioCtx) return;
    if (this.state.synthActive) this.stopSynth();
    
    try {
      const now = this.state.audioCtx.currentTime;
      
      // Create gain node
      this.state.synthGain = this.state.audioCtx.createGain();
      this.state.synthGain.gain.setValueAtTime(0, now);
      this.state.synthGain.gain.linearRampToValueAtTime(0.15, now + 0.1);
      this.state.synthGain.connect(this.state.audioCtx.destination);
      
      // Three oscillators for rich harmonic content
      const createOsc = (freq, type, detune, gain) => {
        const osc = this.state.audioCtx.createOscillator();
        const oscGain = this.state.audioCtx.createGain();
        
        osc.type = type;
        osc.frequency.value = freq;
        osc.detune.value = detune;
        oscGain.gain.value = gain;
        
        osc.connect(oscGain);
        oscGain.connect(this.state.synthGain);
        osc.start(now);
        
        return osc;
      };
      
      this.state.synthOsc1 = createOsc(baseFreq, 'sine', 0, 1.0);
      this.state.synthOsc2 = createOsc(baseFreq * 2, 'sine', 5, 0.3);
      this.state.synthOsc3 = createOsc(baseFreq * 3, 'sine', -5, 0.15);
      
      this.state.synthActive = true;
      console.log(`🎵 Synth started (${baseFreq}Hz)`);
      
    } catch (e) {
      console.warn('⚠️ Synth start failed:', e);
    }
  }

  /**
   * Stop synth
   */
  stopSynth() {
    if (!this.state.synthActive) return;
    
    try {
      const now = this.state.audioCtx.currentTime;
      
      // Fade out
      if (this.state.synthGain) {
        this.state.synthGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      }
      
      // Stop oscillators after fade
      setTimeout(() => {
        if (this.state.synthOsc1) this.state.synthOsc1.stop();
        if (this.state.synthOsc2) this.state.synthOsc2.stop();
        if (this.state.synthOsc3) this.state.synthOsc3.stop();
        
        this.state.synthOsc1 = null;
        this.state.synthOsc2 = null;
        this.state.synthOsc3 = null;
        this.state.synthGain = null;
        this.state.synthActive = false;
      }, 350);
      
      console.log('🎵 Synth stopped');
    } catch (e) {
      console.warn('⚠️ Synth stop failed:', e);
    }
  }

  /**
   * Speak text using Animalese (Animal Crossing-style TTS)
   */
  speakAnimalese(text, options = {}) {
    if (!this.state.audioCtx) return;
    if (!text) return;
    
    try {
      const now = this.state.audioCtx.currentTime;
      const chars = text.toLowerCase().split('');
      const charDuration = options.charDuration || 0.05; // 50ms per character
      const pitchBase = options.pitch || 300;
      const pitchVariation = options.pitchVariation || 100;
      
      chars.forEach((char, i) => {
        // Skip spaces and punctuation
        if (!/[a-z0-9]/.test(char)) return;
        
        const startTime = now + (i * charDuration);
        const osc = this.state.audioCtx.createOscillator();
        const gain = this.state.audioCtx.createGain();
        
        // Vary pitch based on character
        const charCode = char.charCodeAt(0);
        const pitch = pitchBase + ((charCode % 10) * pitchVariation / 10);
        
        osc.type = 'square';
        osc.frequency.value = pitch;
        
        // Envelope
        const volume = options.volume !== undefined ? options.volume : 0.1;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
        gain.gain.linearRampToValueAtTime(0, startTime + charDuration);
        
        osc.connect(gain);
        gain.connect(this.state.audioCtx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + charDuration);
      });
      
      console.log(`🗣️ Animalese: "${text}"`);
    } catch (e) {
      console.warn('⚠️ Animalese failed:', e);
    }
  }

  /**
   * Play explosion sound
   */
  playExplosion(options = {}) {
    if (!this.state.audioCtx) return;
    
    try {
      const now = this.state.audioCtx.currentTime;
      
      // Noise-based explosion
      const bufferSize = this.state.audioCtx.sampleRate * 0.5;
      const buffer = this.state.audioCtx.createBuffer(1, bufferSize, this.state.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Generate white noise with decay
      for (let i = 0; i < bufferSize; i++) {
        const decay = 1 - (i / bufferSize);
        data[i] = (Math.random() * 2 - 1) * decay;
      }
      
      const source = this.state.audioCtx.createBufferSource();
      source.buffer = buffer;
      
      const gain = this.state.audioCtx.createGain();
      const volume = options.volume !== undefined ? options.volume : 0.3;
      gain.gain.value = volume;
      
      // Low-pass filter for "boom" quality
      const filter = this.state.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 500;
      
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.state.audioCtx.destination);
      
      source.start(now);
      
      console.log('💥 Explosion');
    } catch (e) {
      console.warn('⚠️ Explosion sound failed:', e);
    }
  }

  /**
   * Get audio context state
   */
  getState() {
    return {
      initialized: !!this.state.audioCtx,
      contextState: this.state.audioCtx?.state || 'not-initialized',
      synthActive: this.state.synthActive,
      buffersLoaded: Object.keys(this.state.audioBuffers).length
    };
  }

  /**
   * Cleanup
   */
  async destroy() {
    this.stopSynth();
    
    if (this.state.audioCtx && this.state.audioCtx.state !== 'closed') {
      await this.state.audioCtx.close();
      console.log('🔇 Audio system closed');
    }
    
    this.state.audioCtx = null;
    this.state.audioBuffers = {};
  }
}

// Singleton instance
export const audioSystem = new AudioSystemComplete();
export default audioSystem;


