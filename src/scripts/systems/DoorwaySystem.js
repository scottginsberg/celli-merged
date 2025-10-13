/**
 * Doorway System - Ported from merged2.html
 * 
 * Manages the doorway portal and input sequences:
 * - Doorway appearance and opening animation
 * - Input handling (START, END sequences)
 * - Character transformation (T input → burst)
 * - Backspace restoration sequence
 * - END sequence (snap together, move to corner)
 * - Integration with CELLI voxel system
 */

export class DoorwaySystem {
  constructor() {
    this.state = {
      element: null,
      promptText: null,
      promptCursor: null,
      hiddenInput: null,
      
      // State flags
      shown: false,
      opened: false,
      inputAttempted: false,
      
      // Input state
      baseText: '=STAR',
      inputText: '=STAR',
      tEntered: false,
      
      // Callbacks
      onInputComplete: null,
      onBurstStart: null,
      onBackspace: null,
      onEndSequence: null
    };
  }

  /**
   * Initialize doorway system
   */
  init() {
    this.state.element = document.getElementById('doorway');
    this.state.promptText = document.getElementById('promptText');
    this.state.promptCursor = document.getElementById('promptCursor');
    this.state.hiddenInput = document.getElementById('hiddenInput');
    
    if (!this.state.element) {
      console.warn('⚠️ Doorway element not found');
      return;
    }
    
    // Setup click handler to focus hidden input
    if (this.state.element && this.state.hiddenInput) {
      this.state.element.addEventListener('click', () => {
        if (this.state.opened) {
          this.state.hiddenInput.focus();
        }
      });
    }
    
    // Setup input handlers
    this._setupInputHandlers();
    
    console.log('🚪 Doorway system initialized');
  }

  /**
   * Setup input handlers
   */
  _setupInputHandlers() {
    if (!this.state.hiddenInput) return;
    
    // Keyboard input
    document.addEventListener('keydown', (e) => {
      if (!this.state.opened || this.state.inputAttempted) return;
      
      this._handleKeyPress(e);
    });
    
    // Hidden input (for mobile)
    this.state.hiddenInput.addEventListener('input', (e) => {
      if (!this.state.opened || this.state.inputAttempted) return;
      
      const value = e.target.value;
      if (value.length > this.state.inputText.length) {
        // Character added
        const newChar = value[value.length - 1];
        this._handleCharacterInput(newChar);
      } else if (value.length < this.state.inputText.length) {
        // Character removed (backspace)
        this._handleBackspace();
      }
    });
  }

  /**
   * Handle key press
   */
  _handleKeyPress(e) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      this._handleBackspace();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      this._handleEnter();
    } else if (e.key.length === 1) {
      e.preventDefault();
      this._handleCharacterInput(e.key);
    }
  }

  /**
   * Handle character input
   */
  _handleCharacterInput(char) {
    const upperChar = char.toUpperCase();
    
    // Check for T (triggers burst)
    if ((upperChar === 'T') && !this.state.tEntered) {
      this.state.tEntered = true;
      this.state.inputText += 'T';
      this._updateDisplay();
      
      // Trigger burst animation
      if (this.state.onBurstStart) {
        this.state.onBurstStart();
      }
      
      console.log('✨ T entered - burst sequence starting');
      return;
    }
    
    // Check for END sequence (after burst)
    if (this.state.tEntered && /[END]/i.test(upperChar)) {
      this.state.inputText += upperChar;
      this._updateDisplay();
      
      // Check if complete END entered
      if (this.state.inputText.includes('END')) {
        this._handleEndSequence();
      }
    }
  }

  /**
   * Handle backspace
   */
  _handleBackspace() {
    if (!this.state.tEntered) return;
    
    console.log('⌫ Backspace - restoration sequence');
    
    if (this.state.onBackspace) {
      this.state.onBackspace();
    }
  }

  /**
   * Handle enter key
   */
  _handleEnter() {
    if (this.state.onInputComplete) {
      this.state.onInputComplete(this.state.inputText);
    }
  }

  /**
   * Handle END sequence
   */
  _handleEndSequence() {
    console.log('🎬 END sequence triggered');
    
    this.state.inputAttempted = true;
    
    if (this.state.onEndSequence) {
      this.state.onEndSequence();
    }
  }

  /**
   * Update display
   */
  _updateDisplay() {
    if (this.state.promptText) {
      this.state.promptText.textContent = this.state.inputText;
    }
  }

  /**
   * Show doorway
   */
  show(options = {}) {
    if (!this.state.element) return;
    
    this.state.element.classList.add('visible');
    this.state.shown = true;
    
    const delay = options.delay || 0;
    
    setTimeout(() => {
      this.open();
    }, delay);
    
    console.log('🚪 Doorway shown');
  }

  /**
   * Open doorway
   */
  open() {
    if (!this.state.element) return;
    
    this.state.element.classList.add('open');
    this.state.opened = true;
    
    // Focus hidden input for keyboard entry
    setTimeout(() => {
      if (this.state.hiddenInput) {
        this.state.hiddenInput.focus();
      }
    }, 1500);
    
    console.log('🚪 Doorway opened');
  }

  /**
   * Close doorway
   */
  close() {
    if (!this.state.element) return;
    
    this.state.element.classList.remove('open');
    this.state.opened = false;
    
    console.log('🚪 Doorway closed');
  }

  /**
   * Hide doorway
   */
  hide() {
    if (!this.state.element) return;
    
    this.state.element.classList.remove('visible');
    this.state.shown = false;
    
    console.log('🚪 Doorway hidden');
  }

  /**
   * Reset input state
   */
  resetInput() {
    this.state.inputText = this.state.baseText;
    this.state.tEntered = false;
    this.state.inputAttempted = false;
    
    this._updateDisplay();
    
    if (this.state.hiddenInput) {
      this.state.hiddenInput.value = '';
    }
  }

  /**
   * Set callbacks
   */
  setCallbacks(callbacks) {
    if (callbacks.onInputComplete) this.state.onInputComplete = callbacks.onInputComplete;
    if (callbacks.onBurstStart) this.state.onBurstStart = callbacks.onBurstStart;
    if (callbacks.onBackspace) this.state.onBackspace = callbacks.onBackspace;
    if (callbacks.onEndSequence) this.state.onEndSequence = callbacks.onEndSequence;
  }

  /**
   * Get current state
   */
  getState() {
    return {
      shown: this.state.shown,
      opened: this.state.opened,
      inputAttempted: this.state.inputAttempted,
      inputText: this.state.inputText,
      tEntered: this.state.tEntered
    };
  }
}

// Singleton instance
export const doorwaySystem = new DoorwaySystem();
export default doorwaySystem;


