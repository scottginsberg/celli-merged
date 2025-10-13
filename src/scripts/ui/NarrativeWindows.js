/**
 * NarrativeWindows - Terminal and Notepad UI Windows
 * 
 * Extracted from celli-real.html (lines ~940-970) and merged2.html
 * 
 * Provides:
 * - Terminal window (Celli_Log.txt)
 * - Notepad window (ty.txt)
 * - Icon toggles
 * - Window open/close functionality
 * - Draggable windows (optional)
 */

export class NarrativeWindows {
  constructor() {
    this.state = {
      terminalOpen: false,
      notepadOpen: false,
      terminal: null,
      notepad: null,
      terminalIcon: null,
      notepadIcon: null
    };
  }

  /**
   * Initialize windows (must be called after HTML injection)
   */
  init() {
    console.log('[NarrativeWindows] Initializing...');
    
    // Get references
    this.state.terminal = document.getElementById('terminal');
    this.state.notepad = document.getElementById('pad');
    this.state.terminalIcon = document.getElementById('terminal-icon');
    this.state.notepadIcon = document.getElementById('notepad-icon');
    
    if (!this.state.terminal || !this.state.notepad) {
      console.error('[NarrativeWindows] Windows not found in DOM!');
      return false;
    }
    
    // Setup event handlers
    this._setupEvents();
    
    console.log('[NarrativeWindows] ✅ Initialized');
    return true;
  }

  /**
   * Setup event handlers
   */
  _setupEvents() {
    // Terminal icon click
    if (this.state.terminalIcon) {
      this.state.terminalIcon.addEventListener('click', () => {
        this.toggleTerminal();
      });
    }
    
    // Notepad icon click
    if (this.state.notepadIcon) {
      this.state.notepadIcon.addEventListener('click', () => {
        this.toggleNotepad();
      });
    }
    
    // Terminal close button
    const termClose = document.getElementById('term-close');
    if (termClose) {
      termClose.addEventListener('click', () => {
        this.closeTerminal();
      });
    }
    
    // Notepad close button
    const padClose = document.getElementById('pad-close');
    if (padClose) {
      padClose.addEventListener('click', () => {
        this.closeNotepad();
      });
    }
  }

  /**
   * Toggle terminal
   */
  toggleTerminal() {
    if (this.state.terminalOpen) {
      this.closeTerminal();
    } else {
      this.openTerminal();
    }
  }

  /**
   * Open terminal
   */
  openTerminal() {
    if (this.state.terminal) {
      this.state.terminal.style.display = 'flex';
      this.state.terminalOpen = true;
      console.log('[NarrativeWindows] Terminal opened');
    }
  }

  /**
   * Close terminal
   */
  closeTerminal() {
    if (this.state.terminal) {
      this.state.terminal.style.display = 'none';
      this.state.terminalOpen = false;
      console.log('[NarrativeWindows] Terminal closed');
    }
  }

  /**
   * Toggle notepad
   */
  toggleNotepad() {
    if (this.state.notepadOpen) {
      this.closeNotepad();
    } else {
      this.openNotepad();
    }
  }

  /**
   * Open notepad
   */
  openNotepad() {
    if (this.state.notepad) {
      this.state.notepad.style.display = 'flex';
      this.state.notepadOpen = true;
      console.log('[NarrativeWindows] Notepad opened');
    }
  }

  /**
   * Close notepad
   */
  closeNotepad() {
    if (this.state.notepad) {
      this.state.notepad.style.display = 'none';
      this.state.notepadOpen = false;
      console.log('[NarrativeWindows] Notepad closed');
    }
  }

  /**
   * Write to terminal
   */
  writeToTerminal(text) {
    const termEl = document.getElementById('term');
    if (termEl) {
      termEl.textContent += text + '\n';
      // Auto-scroll to bottom
      termEl.scrollTop = termEl.scrollHeight;
    }
  }

  /**
   * Clear terminal
   */
  clearTerminal() {
    const termEl = document.getElementById('term');
    if (termEl) {
      termEl.textContent = 'Welcome to Cell.real terminal\n> ';
    }
  }

  /**
   * Show icons
   */
  showIcons() {
    if (this.state.terminalIcon) {
      this.state.terminalIcon.style.display = 'flex';
    }
    if (this.state.notepadIcon) {
      this.state.notepadIcon.style.display = 'flex';
    }
  }

  /**
   * Hide icons
   */
  hideIcons() {
    if (this.state.terminalIcon) {
      this.state.terminalIcon.style.display = 'none';
    }
    if (this.state.notepadIcon) {
      this.state.notepadIcon.style.display = 'none';
    }
  }

  /**
   * Destroy
   */
  destroy() {
    this.closeTerminal();
    this.closeNotepad();
    this.hideIcons();
    console.log('[NarrativeWindows] Destroyed');
  }
}

export default NarrativeWindows;

