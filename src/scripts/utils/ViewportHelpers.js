/**
 * Viewport & Screen Helpers
 * Screen space and viewport utilities
 */

/**
 * Convert screen coordinates to normalized device coordinates
 * @param {number} x - Screen X
 * @param {number} y - Screen Y
 * @param {DOMRect} rect - Bounding rectangle
 * @returns {Object} {x, y} in NDC (-1 to 1)
 */
export function screenToNDC(x, y, rect) {
  return {
    x: ((x - rect.left) / rect.width) * 2 - 1,
    y: -((y - rect.top) / rect.height) * 2 + 1
  };
}

/**
 * Convert NDC to screen coordinates
 */
export function ndcToScreen(ndcX, ndcY, rect) {
  return {
    x: ((ndcX + 1) / 2) * rect.width + rect.left,
    y: ((1 - ndcY) / 2) * rect.height + rect.top
  };
}

/**
 * Get viewport dimensions
 */
export function getViewportSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

/**
 * Get canvas bounding rect
 */
export function getCanvasRect(canvas) {
  if (!canvas) return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
  return canvas.getBoundingClientRect();
}

/**
 * Check if point is in viewport
 */
export function isInViewport(x, y) {
  return x >= 0 && x <= window.innerWidth && y >= 0 && y <= window.innerHeight;
}

/**
 * Get mouse position from event
 */
export function getMousePosition(event, element) {
  const rect = element ? element.getBoundingClientRect() : { left: 0, top: 0 };
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    clientX: event.clientX,
    clientY: event.clientY
  };
}

/**
 * Get touch position from event
 */
export function getTouchPosition(event, element) {
  if (!event.touches || !event.touches[0]) return null;
  const touch = event.touches[0];
  const rect = element ? element.getBoundingClientRect() : { left: 0, top: 0 };
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
    clientX: touch.clientX,
    clientY: touch.clientY
  };
}

/**
 * Check if device is touch-capable
 */
export function isTouchDevice() {
  return ('ontouchstart' in window) ||
         (navigator.maxTouchPoints > 0) ||
         (navigator.msMaxTouchPoints > 0);
}

/**
 * Get device pixel ratio
 */
export function getDevicePixelRatio() {
  return window.devicePixelRatio || 1;
}

/**
 * Clamp to viewport bounds
 */
export function clampToViewport(x, y) {
  return {
    x: Math.max(0, Math.min(window.innerWidth, x)),
    y: Math.max(0, Math.min(window.innerHeight, y))
  };
}

export default {
  screenToNDC,
  ndcToScreen,
  getViewportSize,
  getCanvasRect,
  isInViewport,
  getMousePosition,
  getTouchPosition,
  isTouchDevice,
  getDevicePixelRatio,
  clampToViewport
};



