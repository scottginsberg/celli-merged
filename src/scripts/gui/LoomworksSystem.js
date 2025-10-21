/**
 * Loomworks System - Animated "LOOK" -> "Loomworks Experience" text transformation
 * Extracted from merged2.html lines ~1292-1376
 */

import { GUIComponent } from './GUIComponent.js';

export class LoomworksSystem extends GUIComponent {
  constructor(containerId = 'loomworks', options = {}) {
    super(containerId, options);
    this.typingTimeout = null;
    this.revealed = false;
  }

  onInit() {
    this.preElement = document.getElementById('loomPre');
    this.coreElement = document.getElementById('loomCore');
    this.postElement = document.getElementById('loomPost');
    this.tailElement = document.getElementById('loomTail');
    
    if (!this.preElement || !this.coreElement || !this.postElement || !this.tailElement) {
      console.error('Loomworks elements not found in DOM');
      return;
    }
  }

  /**
   * Start the full Loomworks reveal animation sequence
   */
  startReveal() {
    if (this.revealed) return;
    this.revealed = true;

    this.container.classList.add('visible');
    this.preElement.textContent = 'L';
    this.coreElement.textContent = 'OO';
    this.postElement.textContent = 'K';
    this.tailElement.innerHTML = '';

    // Animate "OO" -> "oo" selection
    setTimeout(() => {
      this.coreElement.classList.add('selected');
    }, 280);

    setTimeout(() => {
      this.coreElement.textContent = 'oo';
    }, 630);

    setTimeout(() => {
      this.coreElement.classList.remove('selected');
    }, 1080);

    // Animate "K" shift and change to "m"
    setTimeout(() => {
      this.postElement.classList.add('shift-right');
    }, 900);

    setTimeout(() => {
      this.postElement.classList.add('selected');
      this.postElement.style.opacity = '0.2';
    }, 980);

    setTimeout(() => {
      this.postElement.textContent = 'm';
      this.postElement.style.opacity = '1';
      this.postElement.classList.remove('shift-right');
    }, 1340);

    setTimeout(() => {
      this.postElement.classList.remove('selected');
      setTimeout(() => { this.postElement.style.opacity = ''; }, 220);
    }, 1680);

    // Animate "L" -> "a L"
    setTimeout(() => {
      this.preElement.style.opacity = '0';
    }, 920);

    setTimeout(() => {
      this.preElement.textContent = 'a L';
      this.preElement.style.opacity = '1';
    }, 1340);

    // Type out "works Experience."
    setTimeout(() => {
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }
      this.typeTail('works Experience.');
    }, 1380);
  }

  /**
   * Type out text character by character with typing effect
   */
  typeTail(text, index = 0) {
    if (index === 0) {
      this.tailElement.innerHTML = '';
    }

    if (index >= text.length) {
      this.typingTimeout = null;
      this.emit('typeComplete');
      // After typing completes, start untype sequence
      setTimeout(() => this.startUntypeSequence(), 1200);
      return;
    }

    // Wrap each character in a span
    const charSpan = document.createElement('span');
    charSpan.textContent = text[index];
    charSpan.className = 'loomworks-chunk selected';
    this.tailElement.appendChild(charSpan);
    
    // Remove selected class from this character only
    setTimeout(() => {
      charSpan.classList.remove('selected');
    }, 140);
    
    // Calculate delay with jitter
    const baseDelay = index < 3 ? 110 : 65;
    const jitter = Math.random() * 55;
    this.typingTimeout = setTimeout(() => this.typeTail(text, index + 1), baseDelay + jitter);
  }

  /**
   * Untype sequence: revert back to LOOK, flash to GAZE, build quote
   */
  startUntypeSequence() {
    // Untype tail text back to empty
    const tailText = this.tailElement.textContent || '';
    let remaining = tailText.length;
    
    const untypeInterval = setInterval(() => {
      if (remaining <= 0) {
        clearInterval(untypeInterval);
        // Reset to LOOK
        this.preElement.textContent = '';
        this.coreElement.textContent = 'OO';
        this.postElement.textContent = 'K';
        this.container.style.fontSize = '32px';
        this.container.style.fontWeight = '700';
        this.container.style.letterSpacing = '0.2em';
        
        // Flash to GAZE
        setTimeout(() => {
          this.preElement.textContent = 'G';
          this.coreElement.textContent = 'A';
          this.postElement.textContent = 'ZE';
          
          // Flash effect
          this.container.style.opacity = '0';
          setTimeout(() => { this.container.style.opacity = '1'; }, 50);
          setTimeout(() => { this.container.style.opacity = '0'; }, 150);
          setTimeout(() => { this.container.style.opacity = '1'; }, 250);
          
          // Build quote around GAZE
          setTimeout(() => {
            const quoteEl = document.getElementById('quote');
            const quoteBefore = document.getElementById('quoteBefore');
            const quoteAfter = document.getElementById('quoteAfter');
            
            if (quoteBefore && quoteAfter && quoteEl) {
              quoteBefore.textContent = '...if you ';
              quoteBefore.style.display = 'inline';
              quoteAfter.textContent = ' for long into an abyss, the abyss gazes also into you.';
              quoteAfter.style.display = 'inline';
              quoteEl.style.opacity = '1';
            }
            
            this.emit('gazeRevealed');
          }, 600);
        }, 400);
        return;
      }
      
      this.tailElement.textContent = tailText.substring(0, remaining - 1);
      remaining--;
    }, 40);
  }

  /**
   * Set custom text with typing effect
   */
  typeText(text) {
    this.typeTail(text);
  }

  /**
   * Reset to initial "LOOK" state
   */
  reset() {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }

    this.revealed = false;
    this.container.classList.remove('visible');
    
    this.preElement.textContent = 'L';
    this.preElement.style.opacity = '';
    this.coreElement.textContent = 'OO';
    this.coreElement.classList.remove('selected');
    this.postElement.textContent = 'K';
    this.postElement.classList.remove('selected', 'shift-right');
    this.postElement.style.opacity = '';
    this.tailElement.innerHTML = '';
  }

  onDestroy() {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }
}

// Export singleton instance
export const loomworksSystem = new LoomworksSystem();
export default loomworksSystem;


