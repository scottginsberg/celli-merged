/**
 * Quote System - Animated text display with glitch effects
 * Extracted from merged2.html lines ~1220-1290
 */

import { GUIComponent } from './GUIComponent.js';

export class QuoteSystem extends GUIComponent {
  constructor(containerId = 'quote', options = {}) {
    super(containerId, options);
    
    this.quoteStates = {
      initial: {
        text: '...if you gaze for long into an abyss, the abyss gazes also into you.',
        showLook: false
      },
      look: {
        text: '...if you LOOK for long into an abyss, the abyss LOOKS also into you.',
        showLook: false
      },
      despair: {
        text: 'LOOK on my works, ye Mighty, and despair!',
        showLook: false
      }
    };
    
    this.glitchGlyphs = "!<>-_\\/[]{} =+*^?# ΩΦ";
    this.swapping = false;
  }

  onInit() {
    this.beforeElement = document.getElementById('quoteBefore');
    this.afterElement = document.getElementById('quoteAfter');
    
    if (!this.beforeElement || !this.afterElement) {
      console.error('Quote elements not found in DOM');
      return;
    }
    
    // Apply initial state
    this.applyState('initial', { immediate: true });
  }

  /**
   * Apply a quote state
   */
  applyState(stateName, options = {}) {
    const state = this.quoteStates[stateName];
    if (!state) {
      console.warn(`Quote state "${stateName}" not found`);
      return;
    }

    if (options.immediate) {
      this.beforeElement.textContent = state.text || '';
      this.afterElement.textContent = '';
      this.container.classList.remove('scrambling');
      this.swapping = false;
      if (options.onComplete) options.onComplete();
    } else {
      this.glitchSwap(state, options);
    }
  }

  /**
   * Glitch swap effect - character-by-character transformation
   */
  glitchSwap(targetState, options = {}) {
    const {
      duration = 1100,
      onComplete = null
    } = options;

    if (!targetState) return;
    if (this.swapping) return;

    this.swapping = true;
    this.container.classList.add('scrambling');

    const initialText = this.beforeElement.textContent || '';
    const targetText = targetState.text || '';
    const textMax = Math.max(initialText.length, targetText.length);
    const textDenom = textMax === 0 ? 1 : textMax;
    const start = performance.now();

    const frame = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      let result = '';

      for (let i = 0; i < textMax; i++) {
        if (progress > i / textDenom) {
          result += targetText[i] ?? '';
        } else {
          const fallback = initialText[i] ?? '';
          const randomChar = this.glitchGlyphs[Math.floor(Math.random() * this.glitchGlyphs.length)] || fallback;
          result += randomChar;
        }
      }

      this.beforeElement.textContent = result;

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        this.beforeElement.textContent = targetText;
        this.container.classList.remove('scrambling');
        this.swapping = false;

        if (typeof onComplete === 'function') {
          onComplete();
        }
      }
    };

    requestAnimationFrame(frame);
  }

  /**
   * Set glitch intensity class
   */
  setGlitchIntensity(level = 'none') {
    this.container.classList.remove('glitch', 'glitchMedium', 'glitchIntense');
    
    if (level === 'low') {
      this.container.classList.add('glitch');
    } else if (level === 'medium') {
      this.container.classList.add('glitchMedium');
    } else if (level === 'high') {
      this.container.classList.add('glitchIntense');
    }
  }

  /**
   * Set custom text directly
   */
  setText(text, options = {}) {
    const customState = { text };
    if (options.immediate) {
      this.beforeElement.textContent = text;
      this.swapping = false;
    } else {
      this.glitchSwap(customState, options);
    }
  }

  /**
   * Add a custom quote state
   */
  addState(name, text, metadata = {}) {
    this.quoteStates[name] = { text, ...metadata };
  }

  onShow(animated) {
    if (animated) {
      this.container.classList.add('visible');
    } else {
      this.container.style.opacity = '1';
      this.container.style.visibility = 'visible';
    }
  }

  onHide(animated) {
    if (animated) {
      this.container.classList.remove('visible');
    } else {
      this.container.style.opacity = '0';
      this.container.style.visibility = 'hidden';
    }
  }
}

// Export singleton instance
export const quoteSystem = new QuoteSystem();
export default quoteSystem;


