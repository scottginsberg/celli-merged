/**
 * Loomworks System - Animated "LOOK" -> "Loomworks Experience" text transformation
 * Extracted from merged2.html lines ~1292-1376
 */

import { GUIComponent } from './GUIComponent.js';

export class LoomworksSystem extends GUIComponent {
  constructor(containerId = 'loomworks', options = {}) {
    super(containerId, options);
    this.typingTimeout = null;
    this.eraseDelayTimeout = null;
    this.eraseStepTimeout = null;
    this.postEraseResetTimeout = null;
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
      this._scheduleErase();
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
   * Schedule erasing of the typed tail after a short delay
   */
  _scheduleErase(delay = 2000) {
    if (this.eraseDelayTimeout) {
      clearTimeout(this.eraseDelayTimeout);
    }

    this.eraseDelayTimeout = setTimeout(() => {
      this.eraseDelayTimeout = null;
      this._eraseTail();
    }, delay);
  }

  /**
   * Begin removing the typed characters with selection highlight
   */
  _eraseTail(index = null) {
    if (!this.tailElement) return;

    const children = this.tailElement.children;
    const targetIndex = index === null ? children.length - 1 : index;

    if (targetIndex < 0) {
      this.eraseStepTimeout = null;
      this.emit('eraseComplete');

      // Allow the erase animation to finish before resetting
      this.postEraseResetTimeout = setTimeout(() => {
        this.postEraseResetTimeout = null;
        this.reset();
      }, 240);
      return;
    }

    const span = children[targetIndex];
    if (!span) {
      this._eraseTail(targetIndex - 1);
      return;
    }

    span.classList.add('selected');

    this.eraseStepTimeout = setTimeout(() => {
      span.remove();
      this._eraseTail(targetIndex - 1);
    }, 110);
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

    if (this.eraseDelayTimeout) {
      clearTimeout(this.eraseDelayTimeout);
      this.eraseDelayTimeout = null;
    }

    if (this.eraseStepTimeout) {
      clearTimeout(this.eraseStepTimeout);
      this.eraseStepTimeout = null;
    }

    if (this.postEraseResetTimeout) {
      clearTimeout(this.postEraseResetTimeout);
      this.postEraseResetTimeout = null;
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

    if (this.eraseDelayTimeout) {
      clearTimeout(this.eraseDelayTimeout);
    }

    if (this.eraseStepTimeout) {
      clearTimeout(this.eraseStepTimeout);
    }

    if (this.postEraseResetTimeout) {
      clearTimeout(this.postEraseResetTimeout);
    }
  }
}

// Export singleton instance
export const loomworksSystem = new LoomworksSystem();
export default loomworksSystem;


