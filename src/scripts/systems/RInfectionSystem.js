/**
 * R Infection System - Ported from merged2.html
 * 
 * Manages the "Speech R" infection sequence:
 * - Replaces all vowels with 'R' in speech synthesis
 * - Visual matrix rain effects
 * - Progressive infection spread
 * - Text corruption in VisiCalc cells
 * - Restoration sequence
 * - Quote system integration
 */

export class RInfectionSystem {
  constructor() {
    this.state = {
      active: false,
      timeout: null,
      guardTimeout: null,
      
      // Speech synthesis
      voice: null,
      utterance: null,
      hasSpeechSynthesis: typeof window !== 'undefined' && 'speechSynthesis' in window,
      
      // Matrix rain
      matrixInterval: null,
      matrixColumns: [],
      matrixDensity: 30, // Number of columns
      
      // Infection progression
      infectionLevel: 0.0, // 0.0 to 1.0
      infectionSpeed: 0.002,
      
      // Callbacks
      onInfectionStart: null,
      onInfectionComplete: null,
      onRestoration: null
    };
  }

  /**
   * Initialize R infection system
   */
  async init() {
    // Load speech synthesis voice if available
    if (this.state.hasSpeechSynthesis) {
      await this._loadVoice();
    }
    
    console.log('🦠 R Infection system initialized');
  }

  /**
   * Load speech synthesis voice
   */
  async _loadVoice() {
    return new Promise((resolve) => {
      const voices = window.speechSynthesis.getVoices();
      
      if (voices.length > 0) {
        // Prefer certain voices
        this.state.voice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural')) || voices[0];
        console.log(`🎤 Voice loaded: ${this.state.voice.name}`);
        resolve();
      } else {
        // Wait for voices to load
        window.speechSynthesis.onvoiceschanged = () => {
          const newVoices = window.speechSynthesis.getVoices();
          this.state.voice = newVoices.find(v => v.name.includes('Google') || v.name.includes('Natural')) || newVoices[0];
          console.log(`🎤 Voice loaded: ${this.state.voice?.name || 'default'}`);
          resolve();
        };
      }
    });
  }

  /**
   * Start R infection
   */
  start(options = {}) {
    if (this.state.active) return;
    
    this.state.active = true;
    this.state.infectionLevel = 0.0;
    
    console.log('🦠 R Infection starting...');
    
    // Start matrix rain
    this._startMatrixRain();
    
    // Start infection progression
    this._startInfectionProgression();
    
    // Speak infected phrase
    this._speakInfected("Reality is changing");
    
    // Callback
    if (this.state.onInfectionStart) {
      this.state.onInfectionStart();
    }
  }

  /**
   * Stop R infection
   */
  stop() {
    if (!this.state.active) return;
    
    this.state.active = false;
    
    console.log('🦠 R Infection stopping...');
    
    // Stop matrix rain
    this._stopMatrixRain();
    
    // Stop speech
    if (this.state.hasSpeechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    // Clear timeouts
    if (this.state.timeout) clearTimeout(this.state.timeout);
    if (this.state.guardTimeout) clearTimeout(this.state.guardTimeout);
    
    // Reset infection level
    this.state.infectionLevel = 0.0;
    
    // Callback
    if (this.state.onRestoration) {
      this.state.onRestoration();
    }
  }

  /**
   * Start matrix rain effect
   */
  _startMatrixRain() {
    if (this.state.matrixInterval) return;
    
    // Initialize columns
    this.state.matrixColumns = Array.from({ length: this.state.matrixDensity }, () => ({
      x: Math.random(),
      y: -Math.random() * 0.5,
      speed: 0.01 + Math.random() * 0.02,
      length: 10 + Math.floor(Math.random() * 20),
      chars: []
    }));
    
    // Update interval
    this.state.matrixInterval = setInterval(() => {
      this._updateMatrixRain();
    }, 50);
    
    console.log('📺 Matrix rain started');
  }

  /**
   * Update matrix rain
   */
  _updateMatrixRain() {
    this.state.matrixColumns.forEach(col => {
      // Move down
      col.y += col.speed;
      
      // Reset if off screen
      if (col.y > 1.5) {
        col.y = -0.5;
        col.x = Math.random();
      }
      
      // Generate characters
      col.chars = Array.from({ length: col.length }, () => 
        String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96))
      );
    });
  }

  /**
   * Stop matrix rain
   */
  _stopMatrixRain() {
    if (this.state.matrixInterval) {
      clearInterval(this.state.matrixInterval);
      this.state.matrixInterval = null;
    }
    
    this.state.matrixColumns = [];
    console.log('📺 Matrix rain stopped');
  }

  /**
   * Start infection progression
   */
  _startInfectionProgression() {
    const progressInterval = setInterval(() => {
      if (!this.state.active) {
        clearInterval(progressInterval);
        return;
      }
      
      // Increase infection level
      this.state.infectionLevel = Math.min(1.0, this.state.infectionLevel + this.state.infectionSpeed);
      
      // Complete at 100%
      if (this.state.infectionLevel >= 1.0) {
        clearInterval(progressInterval);
        console.log('🦠 R Infection complete');
        
        if (this.state.onInfectionComplete) {
          this.state.onInfectionComplete();
        }
      }
    }, 50);
  }

  /**
   * Speak text with R infection (replace all vowels with R)
   */
  _speakInfected(text) {
    if (!this.state.hasSpeechSynthesis || !this.state.voice) {
      console.warn('⚠️ Speech synthesis not available');
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Replace vowels with R
    const infectedText = text.replace(/[aeiouAEIOU]/g, 'R');
    
    // Create utterance
    this.state.utterance = new SpeechSynthesisUtterance(infectedText);
    this.state.utterance.voice = this.state.voice;
    this.state.utterance.rate = 0.9; // Slightly slower
    this.state.utterance.pitch = 0.8; // Lower pitch
    this.state.utterance.volume = 0.7;
    
    // Guard timeout to prevent hanging
    this.state.guardTimeout = setTimeout(() => {
      console.warn('⚠️ Speech guard timeout - cancelling');
      window.speechSynthesis.cancel();
    }, 10000);
    
    // Clear guard on end
    this.state.utterance.onend = () => {
      if (this.state.guardTimeout) {
        clearTimeout(this.state.guardTimeout);
        this.state.guardTimeout = null;
      }
    };
    
    // Speak
    window.speechSynthesis.speak(this.state.utterance);
    
    console.log(`🗣️ Speaking (infected): "${infectedText}"`);
  }

  /**
   * Infect text (replace vowels with R based on infection level)
   */
  infectText(text) {
    if (!this.state.active || this.state.infectionLevel === 0) {
      return text;
    }
    
    const chars = text.split('');
    return chars.map(char => {
      if (/[aeiouAEIOU]/.test(char)) {
        // Probabilistically replace based on infection level
        if (Math.random() < this.state.infectionLevel) {
          return char === char.toUpperCase() ? 'R' : 'r';
        }
      }
      return char;
    }).join('');
  }

  /**
   * Get matrix rain columns for rendering
   */
  getMatrixColumns() {
    return this.state.matrixColumns;
  }

  /**
   * Get infection level (0.0 to 1.0)
   */
  getInfectionLevel() {
    return this.state.infectionLevel;
  }

  /**
   * Is infection active?
   */
  isActive() {
    return this.state.active;
  }

  /**
   * Set callbacks
   */
  setCallbacks(callbacks) {
    if (callbacks.onInfectionStart) this.state.onInfectionStart = callbacks.onInfectionStart;
    if (callbacks.onInfectionComplete) this.state.onInfectionComplete = callbacks.onInfectionComplete;
    if (callbacks.onRestoration) this.state.onRestoration = callbacks.onRestoration;
  }

  /**
   * Get current state
   */
  getState() {
    return {
      active: this.state.active,
      infectionLevel: this.state.infectionLevel,
      hasSpeech: this.state.hasSpeechSynthesis,
      matrixActive: !!this.state.matrixInterval
    };
  }
}

// Singleton instance
export const rInfectionSystem = new RInfectionSystem();
export default rInfectionSystem;


