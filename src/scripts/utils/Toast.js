/**
 * Toast Notification System
 * Simple toast messages for user feedback
 */

let toastElement = null;
let toastTimeout = null;

/**
 * Show toast message
 * @param {string} message - Message to display
 * @param {number} duration - Duration in ms (default: 1200)
 */
export function showToast(message, duration = 1200) {
  // Get or create toast element
  if (!toastElement) {
    toastElement = document.getElementById('toast');
    
    if (!toastElement) {
      toastElement = document.createElement('div');
      toastElement.id = 'toast';
      toastElement.className = 'toast';
      toastElement.style.display = 'none';
      document.body.appendChild(toastElement);
    }
  }
  
  // Clear existing timeout
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }
  
  // Show toast
  toastElement.textContent = message;
  toastElement.style.display = 'block';
  
  // Auto-hide after duration
  toastTimeout = setTimeout(() => {
    toastElement.style.display = 'none';
  }, duration);
}

/**
 * Hide toast immediately
 */
export function hideToast() {
  if (toastElement) {
    toastElement.style.display = 'none';
  }
  if (toastTimeout) {
    clearTimeout(toastTimeout);
    toastTimeout = null;
  }
}

// Make globally available
if (typeof window !== 'undefined') {
  window.showToast = showToast;
  window.hideToast = hideToast;
}

export default {
  showToast,
  hideToast
};



