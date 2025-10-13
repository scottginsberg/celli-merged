/**
 * TerminalSequence - Paced Terminal Reveal with Effects
 * 
 * Complete terminal sequence system with:
 * - Paced text reveals (timing control)
 * - Glitch effects (text distortion)
 * - Catharsis moments (visual/audio payoff)
 * - Multi-lane processing display
 * - Mood styles (soft, artifact, catharsis)
 * 
 * Extracted/reconstructed from merged2.html terminal sequence
 */

export class TerminalSequence {
  constructor() {
    this.state = {
      // Terminal element
      terminal: null,
      terminalContent: null,
      
      // Sequence state
      currentLine: 0,
      isPlaying: false,
      isPaused: false,
      
      // Effects
      glitchActive: false,
      catharsis: false,
      
      // Timing
      baseDelay: 50,    // ms per character
      lineDelay: 800,   // ms between lines
      pauseDuration: 1500, // ms for dramatic pauses
      
      // Mood
      currentMood: 'soft', // 'soft' | 'artifact' | 'catharsis'
      
      // Sequence data
      lines: []
    };
  }

  /**
   * Initialize terminal sequence
   */
  async init(terminalElement) {
    console.log('[TerminalSequence] Initializing...');
    
    this.state.terminal = terminalElement || document.getElementById('term');
    if (!this.state.terminal) {
      console.error('[TerminalSequence] Terminal element not found!');
      return false;
    }
    
    // Setup sequence
    this._setupSequence();
    
    console.log('[TerminalSequence] ✅ Initialized');
    return true;
  }

  /**
   * Setup terminal sequence data
   */
  _setupSequence() {
    this.state.lines = [
      {
        text: 'SYSTEM: Initializing...',
        mood: 'soft',
        delay: 30,
        pause: 500,
        glitch: false
      },
      {
        text: 'MAINFRAME: Loading Celli environment...',
        mood: 'soft',
        delay: 40,
        pause: 800,
        glitch: false
      },
      {
        text: 'MEMORY: Allocating voxel buffers...',
        mood: 'soft',
        delay: 35,
        pause: 600,
        glitch: false
      },
      {
        text: '[##############################] 100%',
        mood: 'soft',
        delay: 20,
        pause: 1000,
        glitch: false
      },
      {
        text: 'CELLI.OS: Welcome home...',
        mood: 'artifact',
        delay: 60,
        pause: 1500,
        glitch: true,
        glitchIntensity: 0.3
      },
      {
        text: 'REALITY: Parsing spreadsheet matrix...',
        mood: 'artifact',
        delay: 45,
        pause: 800,
        glitch: true,
        glitchIntensity: 0.5
      },
      {
        text: 'WARNING: Dimensional boundaries unstable',
        mood: 'artifact',
        delay: 50,
        pause: 1200,
        glitch: true,
        glitchIntensity: 0.7
      },
      {
        text: '> CATHARSIS: You are the formula.',
        mood: 'catharsis',
        delay: 80,
        pause: 2500,
        glitch: false,
        catharsis: true
      },
      {
        text: '> Ready.',
        mood: 'catharsis',
        delay: 100,
        pause: 1000,
        glitch: false,
        catharsis: true
      }
    ];
  }

  /**
   * Play terminal sequence
   */
  async play() {
    console.log('[TerminalSequence] 🎬 Playing sequence...');
    
    this.state.isPlaying = true;
    this.state.currentLine = 0;
    
    // Clear terminal
    if (this.state.terminal) {
      this.state.terminal.textContent = '';
    }
    
    // Play each line sequentially
    for (let i = 0; i < this.state.lines.length; i++) {
      if (!this.state.isPlaying) break;
      
      const line = this.state.lines[i];
      await this._revealLine(line);
      
      // Pause between lines
      await this._wait(line.pause || this.state.lineDelay);
      
      this.state.currentLine = i + 1;
    }
    
    this.state.isPlaying = false;
    console.log('[TerminalSequence] ✅ Sequence complete');
  }

  /**
   * Reveal single line with effects
   */
  async _revealLine(lineData) {
    const { text, mood, delay, glitch, glitchIntensity, catharsis } = lineData;
    
    // Set mood
    this.state.currentMood = mood || 'soft';
    this._applyMood(mood);
    
    // Create line element
    const lineEl = document.createElement('div');
    lineEl.className = `term-line ${mood || 'soft'}`;
    
    if (catharsis) {
      lineEl.classList.add('catharsis');
    }
    
    this.state.terminal.appendChild(lineEl);
    
    // Reveal character by character
    for (let i = 0; i < text.length; i++) {
      if (!this.state.isPlaying) break;
      
      const char = text[i];
      const charSpan = document.createElement('span');
      charSpan.textContent = char;
      charSpan.className = 'term-char';
      
      // Apply glitch effect randomly
      if (glitch && Math.random() < (glitchIntensity || 0.3)) {
        charSpan.classList.add('glitch');
        charSpan.setAttribute('data-text', char);
      }
      
      lineEl.appendChild(charSpan);
      
      // Wait before next character (pacing)
      await this._wait(delay || this.state.baseDelay);
      
      // Scroll to bottom
      this.state.terminal.scrollTop = this.state.terminal.scrollHeight;
    }
    
    // Catharsis flash effect
    if (catharsis) {
      this._triggerCatharsis();
    }
  }

  /**
   * Apply mood styling
   */
  _applyMood(mood) {
    if (!this.state.terminal) return;
    
    // Remove all mood classes
    this.state.terminal.classList.remove('soft', 'artifact', 'catharsis');
    
    // Add current mood
    if (mood) {
      this.state.terminal.classList.add(mood);
    }
  }

  /**
   * Trigger catharsis effect
   */
  _triggerCatharsis() {
    console.log('[TerminalSequence] ✨ CATHARSIS!');
    
    if (!this.state.terminal) return;
    
    // Flash effect
    this.state.terminal.style.textShadow = '0 0 20px rgba(147,197,253,0.9), 0 0 40px rgba(59,130,246,0.6)';
    this.state.terminal.style.color = '#e5f2ff';
    
    // Play audio cue if available
    this._playCatharsisSound();
    
    // Reset after duration
    setTimeout(() => {
      this.state.terminal.style.textShadow = '';
      this.state.terminal.style.color = '';
    }, 1500);
  }

  /**
   * Play catharsis sound
   */
  _playCatharsisSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3);
      
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.warn('[TerminalSequence] Audio failed:', e);
    }
  }

  /**
   * Wait helper
   */
  _wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Pause sequence
   */
  pause() {
    this.state.isPaused = true;
  }

  /**
   * Resume sequence
   */
  resume() {
    this.state.isPaused = false;
  }

  /**
   * Stop sequence
   */
  stop() {
    this.state.isPlaying = false;
    this.state.currentLine = 0;
  }

  /**
   * Clear terminal
   */
  clear() {
    if (this.state.terminal) {
      this.state.terminal.textContent = '';
    }
  }

  /**
   * Write line immediately (no pacing)
   */
  writeLine(text, mood = 'soft') {
    if (!this.state.terminal) return;
    
    const lineEl = document.createElement('div');
    lineEl.className = `term-line ${mood}`;
    lineEl.textContent = text;
    this.state.terminal.appendChild(lineEl);
    
    // Scroll to bottom
    this.state.terminal.scrollTop = this.state.terminal.scrollHeight;
  }

  /**
   * Destroy
   */
  destroy() {
    this.stop();
    this.clear();
    console.log('[TerminalSequence] Destroyed');
  }
}

export default TerminalSequence;

