/**
 * Application Configuration
 * Central configuration for the Celli application
 */

export default {
  version: '6.0-refactored',
  
  // Renderer settings
  renderer: {
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
    maxPixelRatio: 2,
    preserveDrawingBuffer: true // Enable screen recording/capture
  },
  
  // Scene settings
  scene: {
    backgroundColor: 0x000000,
    toneMapping: 'ACESFilmic',
    toneMappingExposure: 1.0
  },
  
  // Animation timing
  timing: {
    loomworksStart: 2.0,
    loomworksEnd: 8.0,
    celliStart: 8.0,
    introDuration: 20.0
  },
  
  // Feature flags
  features: {
    debugMode: false,
    sceneSelect: true,
    audioEnabled: true
  },
  
  // Three.js CDN
  three: {
    version: '0.160.0',
    baseURL: 'https://cdn.jsdelivr.net/npm/three@0.160.0/'
  }
};


