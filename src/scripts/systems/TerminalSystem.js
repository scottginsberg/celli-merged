/**
 * Terminal System - Ported from merged2.html
 * 
 * Manages the VisiCalc terminal input:
 * - Command input with validation
 * - Prompt auto-correction to "ENTE"
 * - Valid commands: ENTER, EXIT, LEAVE, SEARCH, KEY, SNAKE, BURGER KING,
 *   RAMSES II, MYHOUSE.WAD, OURHOUSE.LOOM, MADNESS.LOOM
 * - Response system
 * - Integration with R infection
 */

export class TerminalSystem {
  constructor() {
    this.state = {
      active: false,
      input: '',
      promptResetting: false,
      promptClearInterval: null,
      promptFillInterval: null,
      
      // Valid commands
      validCommands: [
        'ENTER',
        'EXIT',
        'LEAVE',
        'SEARCH',
        'KEY',
        'SNAKE',
        'BURGER KING',
        'RAMSES II',
        'MYHOUSE.WAD',
        'OURHOUSE.LOOM',
        'MADNESS.LOOM'
      ],
      
      // DOM elements
      promptElement: null,
      inputElement: null,
      warningElement: null,
      
      // R infection hover tracking
      rPromptHoverCount: 0,
      
      // Callbacks
      onCommandExecute: null,
      onInputChange: null
    };
  }

  /**
   * Initialize terminal
   */
  init() {
    this.state.promptElement = document.getElementById('visicellprompt');
    this.state.inputElement = document.getElementById('visicellinput');
    this.state.warningElement = document.getElementById('visicellwarning');
    
    if (!this.state.promptElement) {
      console.warn('⚠️ Terminal prompt element not found');
      return;
    }
    
    // Setup keyboard handler
    this._setupKeyboardHandlers();
    
    // Setup hover handler for R prompt
    this._setupHoverHandlers();
    
    console.log('💻 Terminal system initialized');
  }

  /**
   * Setup keyboard handlers
   */
  _setupKeyboardHandlers() {
    document.addEventListener('keydown', (e) => {
      if (!this.state.active) return;
      
      // Cancel prompt reset on any key
      if (this.state.promptResetting) {
        this._cancelPromptReset();
      }
      
      if (e.key === 'Backspace') {
        e.preventDefault();
        this._handleBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this._handleEnter();
      } else if (e.key.length === 1 && /[a-zA-Z0-9._]/.test(e.key)) {
        e.preventDefault();
        this._handleCharacterInput(e.key.toUpperCase());
      }
    });
  }

  /**
   * Setup hover handlers
   */
  _setupHoverHandlers() {
    const visiCalc = document.getElementById('visicalc-frame');
    if (!visiCalc) return;
    
    visiCalc.addEventListener('mouseenter', () => {
      if (!this.state.active) return;
      
      this.state.rPromptHoverCount++;
      this._updateWarning();
    });
    
    visiCalc.addEventListener('mouseleave', () => {
      if (!this.state.active) return;
      
      if (this.state.rPromptHoverCount < 8 && this.state.warningElement) {
        this.state.warningElement.style.opacity = '0.3';
      }
    });
  }

  /**
   * Update warning text based on hover count
   */
  _updateWarning() {
    if (!this.state.warningElement) return;
    
    if (this.state.rPromptHoverCount >= 8) {
      // Post-madness: Despair messages
      const dontClickMessages = [
        "Please don't click anywhere.",
        "Really, don't click.",
        "I'm begging you.",
        "It's not worth it.",
        "The R will consume us.",
        "Last warning.",
        "Seriously, STOP.",
        "Ah, who am I kidding?"
      ];
      this.state.warningElement.textContent = dontClickMessages[
        Math.min(this.state.rPromptHoverCount - 8, dontClickMessages.length - 1)
      ];
    } else {
      // Pre-madness: Sarcastic R prompts
      const rPrompts = [
        "You could type R...",
        "Type R. Just saying.",
        "R. Type it.",
        "TYPE R ALREADY.",
        "R!!!",
        "JUST TYPE THE LETTER R.",
        "Fine, explore the void.",
        "Or don't. See if I care."
      ];
      this.state.warningElement.textContent = rPrompts[
        Math.min(this.state.rPromptHoverCount - 1, rPrompts.length - 1)
      ];
    }
    
    // Increase glow with hover count
    this.state.warningElement.style.opacity = '1';
    const glowIntensity = Math.min(this.state.rPromptHoverCount * 3, 15);
    this.state.warningElement.style.textShadow = 
      `0 0 ${glowIntensity}px #0f0, 0 0 ${glowIntensity * 2}px #0f0`;
  }

  /**
   * Handle backspace
   */
  _handleBackspace() {
    if (this.state.input.length > 0) {
      this.state.input = this.state.input.slice(0, -1);
      this._updatePrompt();
      this._evaluateInputDrift();
    }
  }

  /**
   * Handle enter (execute command)
   */
  _handleEnter() {
    const cmd = this.state.input.trim();
    console.log('💻 Terminal command:', cmd);
    
    if (this.state.onCommandExecute) {
      this.state.onCommandExecute(cmd);
    }
    
    this.state.input = '';
    this._updatePrompt();
  }

  /**
   * Handle character input
   */
  _handleCharacterInput(char) {
    this.state.input += char;
    this._updatePrompt();
    this._evaluateInputDrift();
    
    if (this.state.onInputChange) {
      this.state.onInputChange(this.state.input);
    }
  }

  /**
   * Update prompt display
   */
  _updatePrompt() {
    if (!this.state.promptElement) return;
    
    this.state.promptElement.innerHTML = 
      this.state.input + '<span style="animation: blink 1s step-end infinite;">_</span>';
  }

  /**
   * Cancel prompt reset
   */
  _cancelPromptReset() {
    if (this.state.promptClearInterval) {
      clearInterval(this.state.promptClearInterval);
      this.state.promptClearInterval = null;
    }
    if (this.state.promptFillInterval) {
      clearInterval(this.state.promptFillInterval);
      this.state.promptFillInterval = null;
    }
    this.state.promptResetting = false;
  }

  /**
   * Schedule prompt to reset to "ENTE"
   */
  schedulePromptToEnte(options = {}) {
    if (!this.state.active) return;
    
    this._cancelPromptReset();
    this.state.promptResetting = true;
    
    const target = 'ENTE';
    const immediateFill = options.immediateFill || false;
    
    const startFill = () => {
      let index = 0;
      this.state.promptFillInterval = setInterval(() => {
        if (!this.state.active) {
          this._cancelPromptReset();
          return;
        }
        
        if (index < target.length) {
          this.state.input += target[index];
          index++;
          this._updatePrompt();
        } else {
          this._cancelPromptReset();
        }
      }, 240);
    };
    
    if (!immediateFill && this.state.input.length > 0) {
      // Clear current input first
      this.state.promptClearInterval = setInterval(() => {
        if (!this.state.active) {
          this._cancelPromptReset();
          return;
        }
        
        if (this.state.input.length > 0) {
          this.state.input = this.state.input.slice(0, -1);
          this._updatePrompt();
        } else {
          clearInterval(this.state.promptClearInterval);
          this.state.promptClearInterval = null;
          startFill();
        }
      }, 260);
    } else {
      // Fill immediately
      this.state.input = '';
      this._updatePrompt();
      startFill();
    }
    
    console.log('💻 Prompt resetting to ENTE...');
  }

  /**
   * Check if input is a valid command prefix
   */
  _isValidPrefix(value) {
    if (!value) return true;
    const upper = value.toUpperCase();
    return this.state.validCommands.some(cmd => cmd.startsWith(upper));
  }

  /**
   * Evaluate input drift (reset to ENTE if invalid)
   */
  _evaluateInputDrift() {
    if (!this.state.active || this.state.promptResetting) return;
    
    const value = this.state.input.toUpperCase();
    if (!value || this._isValidPrefix(value)) {
      return;
    }
    
    // Input is not a valid prefix - reset to ENTE
    this.schedulePromptToEnte();
  }

  /**
   * Activate terminal
   */
  activate() {
    this.state.active = true;
    
    // Initialize with ENTE if empty
    if (this.state.input !== 'ENTE') {
      this.schedulePromptToEnte({ immediateFill: true });
    }
    
    console.log('💻 Terminal activated');
  }

  /**
   * Deactivate terminal
   */
  deactivate() {
    this.state.active = false;
    this._cancelPromptReset();
    
    console.log('💻 Terminal deactivated');
  }

  /**
   * Set input value
   */
  setInput(value) {
    this.state.input = value;
    this._updatePrompt();
  }

  /**
   * Get current input
   */
  getInput() {
    return this.state.input;
  }

  /**
   * Check if command is valid
   */
  isValidCommand(cmd) {
    const upper = cmd.toUpperCase();
    return this.state.validCommands.some(validCmd => validCmd === upper);
  }

  /**
   * Set callbacks
   */
  setCallbacks(callbacks) {
    if (callbacks.onCommandExecute) this.state.onCommandExecute = callbacks.onCommandExecute;
    if (callbacks.onInputChange) this.state.onInputChange = callbacks.onInputChange;
  }

  /**
   * Get current state
   */
  getState() {
    return {
      active: this.state.active,
      input: this.state.input,
      resetting: this.state.promptResetting,
      hoverCount: this.state.rPromptHoverCount
    };
  }
}

// Singleton instance
export const terminalSystem = new TerminalSystem();
export default terminalSystem;


