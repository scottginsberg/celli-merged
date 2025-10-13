/**
 * Permission Manager System - Scene Permission Control
 * 
 * Manages permissions for different gameplay phases:
 * - R-Infection (R key input during certain scenes)
 * - VisiCell click interactions
 * - Dolly/scroll camera control
 * - Other phase-based permissions
 * 
 * Extracted from merged2.html lines 1173-1205
 */

export class PermissionManager {
  constructor() {
    this.phase = 'intro';
    this.permissions = {
      rInfection: false,
      visicellClick: false,
      dolly: true,
      input: true,
      cameraControl: true
    };
    
    this.listeners = [];
  }

  /**
   * Set the current game phase and update permissions accordingly
   * @param {string} phase - Phase name (intro, cellAddressesConstructing, cellAddressesReady, visicell, etc.)
   */
  setPhase(phase) {
    const oldPhase = this.phase;
    this.phase = phase;
    
    console.log(`🔐 Phase transition: ${oldPhase} → ${phase}`);
    
    // Reset permissions based on phase
    switch (phase) {
      case 'intro':
        this.permissions.rInfection = false;
        this.permissions.visicellClick = false;
        this.permissions.dolly = true;
        this.permissions.input = true;
        this.permissions.cameraControl = true;
        break;
        
      case 'cellAddressesConstructing':
        // Lock dolly until grid completes
        this.permissions.dolly = false;
        this.permissions.rInfection = false;
        this.permissions.visicellClick = false;
        this.permissions.input = false;
        this.permissions.cameraControl = false;
        break;
        
      case 'cellAddressesReady':
        this.permissions.dolly = true;
        this.permissions.rInfection = false;
        this.permissions.visicellClick = false;
        this.permissions.input = true;
        this.permissions.cameraControl = true;
        break;
        
      case 'visicell':
        this.permissions.rInfection = true;
        this.permissions.visicellClick = true;
        this.permissions.dolly = false;
        this.permissions.input = true;
        this.permissions.cameraControl = false;
        break;
        
      case 'fullhand':
        this.permissions.rInfection = false;
        this.permissions.visicellClick = false;
        this.permissions.dolly = false;
        this.permissions.input = true;
        this.permissions.cameraControl = true;
        break;
        
      case 'end3':
        this.permissions.rInfection = false;
        this.permissions.visicellClick = false;
        this.permissions.dolly = false;
        this.permissions.input = false;
        this.permissions.cameraControl = false;
        break;
        
      default:
        console.warn(`Unknown phase: ${phase}, keeping current permissions`);
    }
    
    // Notify listeners of permission changes
    this.notifyListeners(oldPhase, phase);
  }

  /**
   * Check if a permission is enabled
   * @param {string} name - Permission name
   * @returns {boolean}
   */
  can(name) {
    return !!this.permissions[name];
  }

  /**
   * Manually set a permission
   * @param {string} name - Permission name
   * @param {boolean} value - Permission value
   */
  setPermission(name, value) {
    if (this.permissions.hasOwnProperty(name)) {
      this.permissions[name] = !!value;
      console.log(`🔐 Permission '${name}' set to ${value}`);
    } else {
      console.warn(`Unknown permission: ${name}`);
    }
  }

  /**
   * Register a listener for permission changes
   * @param {Function} callback - Callback function(oldPhase, newPhase, permissions)
   */
  addListener(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  }

  /**
   * Remove a listener
   * @param {Function} callback - Callback to remove
   */
  removeListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners of phase/permission changes
   */
  notifyListeners(oldPhase, newPhase) {
    for (const listener of this.listeners) {
      try {
        listener(oldPhase, newPhase, { ...this.permissions });
      } catch (error) {
        console.error('Permission listener error:', error);
      }
    }
  }

  /**
   * Get current phase
   * @returns {string}
   */
  getPhase() {
    return this.phase;
  }

  /**
   * Get all current permissions
   * @returns {Object}
   */
  getPermissions() {
    return { ...this.permissions };
  }
}

// Create singleton instance
export const permissionManager = new PermissionManager();

// Block dolly/scroll when disallowed by permission manager
if (typeof document !== 'undefined') {
  document.addEventListener('wheel', (e) => {
    if (!permissionManager.can('dolly')) {
      e.preventDefault();
    }
  }, { passive: false });
}

