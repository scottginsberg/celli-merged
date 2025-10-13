/**
 * DOM Utilities
 * Helper functions for DOM manipulation
 */

/**
 * Get element by ID safely
 */
export function getElement(id) {
  return document.getElementById(id);
}

/**
 * Query selector safely
 */
export function query(selector) {
  return document.querySelector(selector);
}

/**
 * Query all safely
 */
export function queryAll(selector) {
  return Array.from(document.querySelectorAll(selector));
}

/**
 * Create element with attributes
 */
export function createElement(tag, attributes = {}, children = []) {
  const el = document.createElement(tag);
  
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value);
    } else {
      el.setAttribute(key, value);
    }
  });
  
  children.forEach(child => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child) {
      el.appendChild(child);
    }
  });
  
  return el;
}

/**
 * Remove element safely
 */
export function removeElement(el) {
  if (el && el.parentNode) {
    el.parentNode.removeChild(el);
  }
}

/**
 * Add class to element
 */
export function addClass(el, className) {
  if (el && className) {
    el.classList.add(className);
  }
}

/**
 * Remove class from element
 */
export function removeClass(el, className) {
  if (el && className) {
    el.classList.remove(className);
  }
}

/**
 * Toggle class on element
 */
export function toggleClass(el, className, force) {
  if (el && className) {
    if (force !== undefined) {
      el.classList.toggle(className, force);
    } else {
      el.classList.toggle(className);
    }
  }
}

/**
 * Check if element has class
 */
export function hasClass(el, className) {
  return el && className && el.classList.contains(className);
}

/**
 * Set element visibility
 */
export function setVisible(el, visible) {
  if (el) {
    el.style.display = visible ? '' : 'none';
  }
}

/**
 * Wait for element to exist
 */
export function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const el = query(selector);
    if (el) {
      resolve(el);
      return;
    }
    
    const observer = new MutationObserver((mutations, obs) => {
      const el = query(selector);
      if (el) {
        obs.disconnect();
        resolve(el);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

export default {
  getElement,
  query,
  queryAll,
  createElement,
  removeElement,
  addClass,
  removeClass,
  toggleClass,
  hasClass,
  setVisible,
  waitForElement
};



