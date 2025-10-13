/**
 * Quote System - Ported from merged2.html
 * 
 * Manages quote display and timing:
 * - Quote text display
 * - Typewriter effect
 * - Quote progression
 * - Despair quotes (after R infection)
 * - Attribution display
 */

export class QuoteSystem {
  constructor() {
    this.state = {
      element: null,
      textElement: null,
      
      shown: false,
      despairShown: false,
      
      // Quote database
      quotes: [
        { text: "The only way out is through.", author: "" },
        { text: "Reality is merely an illusion, albeit a very persistent one.", author: "Einstein" },
        { text: "We're all mad here.", author: "Cheshire Cat" },
        { text: "Hell is empty and all the devils are here.", author: "Shakespeare" },
        { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Edison" }
      ],
      
      despairQuotes: [
        { text: "The R consumes all.", author: "" },
        { text: "There is no escape from the infection.", author: "" },
        { text: "Reality has been corrupted.", author: "" },
        { text: "We are all R now.", author: "" }
      ],
      
      currentQuoteIndex: 0,
      typewriterInterval: null
    };
  }

  /**
   * Initialize quote system
   */
  init() {
    this.state.element = document.getElementById('quote');
    this.state.textElement = document.getElementById('quoteText');
    
    if (!this.state.element) {
      console.warn('⚠️ Quote element not found');
      return;
    }
    
    console.log('💬 Quote system initialized');
  }

  /**
   * Show quote
   */
  show(quoteIndex = 0, options = {}) {
    if (!this.state.element) return;
    
    const useDespair = options.despair || this.state.despairShown;
    const quotes = useDespair ? this.state.despairQuotes : this.state.quotes;
    
    const quote = quotes[quoteIndex % quotes.length];
    this.state.currentQuoteIndex = quoteIndex;
    
    // Display with typewriter effect
    if (options.typewriter) {
      this._typewriterEffect(quote.text, options.typewriterSpeed || 50);
    } else {
      if (this.state.textElement) {
        this.state.textElement.textContent = quote.text;
        if (quote.author) {
          this.state.textElement.textContent += ` — ${quote.author}`;
        }
      }
    }
    
    // Show element
    this.state.element.classList.add('visible');
    this.state.shown = true;
    
    console.log(`💬 Quote shown: "${quote.text}"`);
  }

  /**
   * Show despair quote (post R infection)
   */
  showDespair(quoteIndex = 0, options = {}) {
    this.state.despairShown = true;
    this.show(quoteIndex, { ...options, despair: true });
  }

  /**
   * Hide quote
   */
  hide() {
    if (!this.state.element) return;
    
    this.state.element.classList.remove('visible');
    this.state.shown = false;
    
    // Stop typewriter if running
    if (this.state.typewriterInterval) {
      clearInterval(this.state.typewriterInterval);
      this.state.typewriterInterval = null;
    }
    
    console.log('💬 Quote hidden');
  }

  /**
   * Typewriter effect
   */
  _typewriterEffect(text, speed = 50) {
    if (!this.state.textElement) return;
    
    // Stop any existing typewriter
    if (this.state.typewriterInterval) {
      clearInterval(this.state.typewriterInterval);
    }
    
    let index = 0;
    this.state.textElement.textContent = '';
    
    this.state.typewriterInterval = setInterval(() => {
      if (index < text.length) {
        this.state.textElement.textContent += text[index];
        index++;
      } else {
        clearInterval(this.state.typewriterInterval);
        this.state.typewriterInterval = null;
      }
    }, speed);
  }

  /**
   * Show next quote
   */
  showNext(options = {}) {
    this.state.currentQuoteIndex++;
    this.show(this.state.currentQuoteIndex, options);
  }

  /**
   * Get random quote
   */
  getRandomQuote(despair = false) {
    const quotes = despair ? this.state.despairQuotes : this.state.quotes;
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  /**
   * Get current state
   */
  getState() {
    return {
      shown: this.state.shown,
      despairShown: this.state.despairShown,
      currentQuoteIndex: this.state.currentQuoteIndex
    };
  }
}

// Singleton instance
export const quoteSystem = new QuoteSystem();
export default quoteSystem;


