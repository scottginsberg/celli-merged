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
    this.currentTypingOptions = null;
    this.eraseOptions = null;
    this.miscTimeouts = [];
    this.offsetRaf = null;
    this.revealed = false;
    this.sequencePhase = 'idle';
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
    this.sequencePhase = 'loomworks';

    this.container.classList.add('visible');
    this.preElement.textContent = 'L';
    this.coreElement.textContent = 'OO';
    this.postElement.textContent = 'K';
    this.tailElement.innerHTML = '';
    this.container.style.setProperty('--loomOffsetX', '0px');

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
      this.typeTail('works Experience.', 0, {
        eraseDelay: 2000,
        eraseOptions: {
          autoReset: false,
          stepDelay: 95,
          selectionDuration: 110,
          highlightClass: 'erasing',
          emitEvent: false,
          onComplete: () => {
            this._setBaseWord('LOOK', { highlight: true });
            this._setTimeout(() => this._startQuoteSequence(), 180);
          }
        }
      });
    }, 1380);
  }

  /**
   * Type out text character by character with typing effect
   */
  typeTail(text, index = 0, options = {}) {
    if (index === 0) {
      this.tailElement.innerHTML = '';
      this.currentTypingOptions = { ...options };
    }

    const opts = this.currentTypingOptions || options || {};

    if (index >= text.length) {
      this.typingTimeout = null;
      this.emit('typeComplete');

      if (opts.autoErase !== false) {
        const delay = typeof opts.eraseDelay === 'number' ? opts.eraseDelay : 2000;
        this._scheduleErase(delay, opts.eraseOptions);
      }

      if (typeof opts.onComplete === 'function') {
        opts.onComplete();
      }

      this.currentTypingOptions = null;
      return;
    }

    // Wrap each character in a span
    const charSpan = document.createElement('span');
    charSpan.textContent = text[index];
    charSpan.className = 'loomworks-chunk selected';
    if (opts.charClass) {
      charSpan.classList.add(opts.charClass);
    }
    this.tailElement.appendChild(charSpan);

    // Remove selected class from this character only
    const deselectDelay = typeof opts.selectionDuration === 'number' ? opts.selectionDuration : 140;
    this._setTimeout(() => {
      charSpan.classList.remove('selected');
      if (opts.charClass) {
        charSpan.classList.remove(opts.charClass);
      }
    }, deselectDelay);

    if (typeof opts.onProgress === 'function') {
      opts.onProgress(index + 1, text.length, charSpan);
    }

    if (opts.centerOnTail) {
      this._updateQuoteOffset();
    }

    // Calculate delay with jitter
    const resolveBaseDelay = () => {
      if (typeof opts.baseDelay === 'function') {
        return opts.baseDelay(index);
      }
      if (typeof opts.baseDelay === 'number') {
        return opts.baseDelay;
      }
      return index < 3 ? 110 : 65;
    };

    const baseDelay = resolveBaseDelay();
    const jitterRange = typeof opts.jitter === 'number' ? opts.jitter : 55;
    const jitter = jitterRange > 0 ? Math.random() * jitterRange : 0;
    this.typingTimeout = setTimeout(() => this.typeTail(text, index + 1, opts), baseDelay + jitter);
  }

  /**
   * Schedule erasing of the typed tail after a short delay
   */
  _scheduleErase(delay = 2000, options = {}) {
    if (this.eraseDelayTimeout) {
      clearTimeout(this.eraseDelayTimeout);
    }

    this.eraseOptions = options ? { ...options } : {};

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
    const opts = this.eraseOptions || {};

    if (targetIndex < 0) {
      this.eraseStepTimeout = null;
      if (opts.centerOnTail) {
        this._updateQuoteOffset();
      }

      if (opts.emitEvent !== false) {
        this.emit('eraseComplete');
      }

      const finalize = () => {
        if (typeof opts.onComplete === 'function') {
          opts.onComplete();
        }
        this.eraseOptions = null;
      };

      if (opts.autoReset === false) {
        finalize();
      } else {
        const resetDelay = typeof opts.resetDelay === 'number' ? opts.resetDelay : 240;
        this.postEraseResetTimeout = this._setTimeout(() => {
          this.postEraseResetTimeout = null;
          this.reset();
          finalize();
        }, resetDelay);
      }
      return;
    }

    const span = children[targetIndex];
    if (!span) {
      this._eraseTail(targetIndex - 1);
      return;
    }

    span.classList.add('selected');
    if (opts.highlightClass) {
      span.classList.add(opts.highlightClass);
    }

    const stepDelay = typeof opts.stepDelay === 'number' ? opts.stepDelay : 110;
    this.eraseStepTimeout = setTimeout(() => {
      span.remove();
      if (opts.centerOnTail) {
        this._updateQuoteOffset();
      }
      this._eraseTail(targetIndex - 1);
    }, stepDelay);
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

    this._clearMiscTimeouts();

    if (this.offsetRaf) {
      const cancel = globalThis.cancelAnimationFrame ?? clearTimeout;
      cancel(this.offsetRaf);
      this.offsetRaf = null;
    }

    this.revealed = false;
    this.sequencePhase = 'idle';
    this.container.classList.remove('visible');

    this._setBaseWord('LOOK', { highlight: false });
    this.tailElement.innerHTML = '';
    this.container.style.setProperty('--loomOffsetX', '0px');
    this.currentTypingOptions = null;
    this.eraseOptions = null;
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

    this._clearMiscTimeouts();

    if (this.offsetRaf) {
      const cancel = globalThis.cancelAnimationFrame ?? clearTimeout;
      cancel(this.offsetRaf);
      this.offsetRaf = null;
    }
  }

  _startQuoteSequence() {
    this.sequencePhase = 'quote1';
    this._setBaseWord('LOOK', { highlight: true });
    this.container.style.setProperty('--loomOffsetX', '0px');

    this._setTimeout(() => {
      this.typeTail(' on my Works, ye Mighty, and despair!', 0, {
        autoErase: false,
        baseDelay: 64,
        jitter: 28,
        selectionDuration: 170,
        centerOnTail: true,
        onComplete: () => {
          this._scheduleErase(900, {
            autoReset: false,
            stepDelay: 45,
            selectionDuration: 120,
            highlightClass: 'erasing',
            centerOnTail: true,
            emitEvent: false,
            onComplete: () => {
              this._setBaseWord('LOOK', { highlight: true });
              this._setTimeout(() => this._glitchLookToGaze(), 160);
            }
          });
        }
      });
    }, 140);
  }

  _glitchLookToGaze() {
    this.sequencePhase = 'glitchToGaze';
    this.container.style.setProperty('--loomOffsetX', '0px');

    const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const totalSteps = 10;
    let step = 0;

    const flashElements = [this.preElement, this.coreElement, this.postElement];
    this._flashSelected(flashElements, 220);

    const scramble = () => {
      if (step >= totalSteps) {
        this._setBaseWord('GAZE', { highlight: true });
        this._setTimeout(() => this._startSecondQuote(), 200);
        return;
      }

      this.preElement.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      this.coreElement.textContent = glyphs[Math.floor(Math.random() * glyphs.length)] + glyphs[Math.floor(Math.random() * glyphs.length)];
      this.postElement.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];

      step += 1;
      this._setTimeout(scramble, 45 + Math.random() * 55);
    };

    scramble();
  }

  _startSecondQuote() {
    this.sequencePhase = 'quote2';
    this.container.style.setProperty('--loomOffsetX', '0px');

    this.typeTail(' long into an abyss, the abyss also GAZES into you.', 0, {
      autoErase: false,
      baseDelay: 58,
      jitter: 32,
      selectionDuration: 180,
      centerOnTail: true,
      onComplete: () => {
        this._scheduleErase(2600, {
          autoReset: true,
          stepDelay: 55,
          selectionDuration: 120,
          highlightClass: 'erasing',
          centerOnTail: true,
          emitEvent: true
        });
      }
    });
  }

  _updateQuoteOffset() {
    if (!this.container) return;

    const raf = globalThis.requestAnimationFrame ?? ((fn) => setTimeout(fn, 16));
    const cancel = globalThis.cancelAnimationFrame ?? clearTimeout;

    if (this.offsetRaf) {
      cancel(this.offsetRaf);
    }

    this.offsetRaf = raf(() => {
      this.offsetRaf = null;

      if (!this.tailElement) return;

      const tailWidth = this.tailElement.getBoundingClientRect().width || 0;
      if (!isFinite(tailWidth) || tailWidth <= 0) {
        this.container.style.setProperty('--loomOffsetX', '0px');
        return;
      }

      const offset = -Math.min(tailWidth / 2, 320);
      this.container.style.setProperty('--loomOffsetX', `${offset}px`);
    });
  }

  _setBaseWord(word, { highlight = false } = {}) {
    if (!this.preElement || !this.coreElement || !this.postElement) return;

    if (word === 'GAZE') {
      this.preElement.textContent = 'G';
      this.coreElement.textContent = 'AZ';
      this.postElement.textContent = 'E';
    } else {
      this.preElement.textContent = 'L';
      this.coreElement.textContent = 'OO';
      this.postElement.textContent = 'K';
    }

    this.preElement.style.opacity = '';
    this.coreElement.style.opacity = '';
    this.postElement.style.opacity = '';
    this.preElement.classList.remove('selected');
    this.coreElement.classList.remove('selected');
    this.postElement.classList.remove('selected', 'shift-right');
    this.postElement.style.opacity = '';

    if (highlight) {
      this._flashSelected([this.preElement, this.coreElement, this.postElement], 200);
    }
  }

  _flashSelected(elements, duration = 200) {
    const unique = elements.filter(Boolean);
    unique.forEach((el) => el.classList.add('selected'));
    this._setTimeout(() => {
      unique.forEach((el) => el.classList.remove('selected'));
    }, duration);
  }

  _setTimeout(callback, delay) {
    const id = setTimeout(() => {
      this.miscTimeouts = this.miscTimeouts.filter((timerId) => timerId !== id);
      callback();
    }, delay);
    this.miscTimeouts.push(id);
    return id;
  }

  _clearMiscTimeouts() {
    this.miscTimeouts.forEach((id) => clearTimeout(id));
    this.miscTimeouts = [];
  }
}

// Export singleton instance
export const loomworksSystem = new LoomworksSystem();
export default loomworksSystem;


