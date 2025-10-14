/**
 * Celli - Main Entry Point
 * Enhanced modular architecture with dynamic scene system
 * Refactored from merged2.html into composable modules
 */

import * as THREE from 'three';
import { 
  startApp, 
  registerAllScenes, 
  initializeGUI, 
  initializeAudio,
  sceneManager,
  transitionToCity,
  getAppContext 
} from './app-enhanced.js';
import { checkWebGL } from './utils/webgl-check.js';
import { SequenceUI } from './sequence/SequenceUI.js';
import { sceneRegistry } from './sequence/SceneRegistry.js';
import { registerSceneComponents } from './sequence/registerComponents.js';

// Import new systems
import { permissionManager } from './systems/PermissionManager.js';
import { inputSystem } from './systems/InputSystem.js';

console.log('%c🎨 Celli v6.0 - Enhanced Scene System 🎨', 
            'background: #8ab4ff; color: #000; font-size: 20px; padding: 10px; font-weight: bold;');
console.log('%c🔧 Dynamic scene loading & composition', 
            'background: #0f0; color: #000; font-size: 14px; padding: 6px;');

// Check WebGL support
if (!checkWebGL()) {
  document.getElementById('fallback').style.display = 'flex';
  throw new Error('WebGL not available');
}

// Initialize when DOM is ready
function init() {
  console.log('🚀 Initializing Celli...');
  
  // Initialize core systems
  inputSystem.init();
  console.log('⌨️ Input system initialized');
  
  // Permission manager is already initialized (singleton)
  console.log('🔐 Permission manager initialized');
  
  // Register all scenes
  registerAllScenes();
  
  // Initialize GUI systems
  initializeGUI();
  
  // Initialize audio system
  initializeAudio();
  
  // Wire up buttons
  setupButtons();

  // Autostart experience if requested via query parameters
  handleAutoStart();

  console.log('✨ Celli initialized - Click Play to start!');
  console.log('📋 Available scenes:', sceneManager.listScenes().join(', '));
}

// Sequence UI instance
let sequenceUI = null;

async function startExperience() {
  await startApp();

  setTimeout(() => {
    const appContext = getAppContext();
    if (appContext) {
      registerSceneComponents(appContext);
      console.log('✅ Scene components registered with sequence system');
    }
  }, 100);
}

function setupButtons() {
  // Play button - starts the app and begins intro sequence
  const playBtn = document.getElementById('playBtn');
  if (playBtn) {
    playBtn.addEventListener('click', async () => {
      console.log('▶️ Play button clicked - Starting intro sequence!');
      await startExperience();
    });
    console.log('✅ Play button initialized');
  }
  
  // Scene Select button - opens scene selection menu
  const sceneSelectBtn = document.getElementById('sceneSelectBtn');
  if (sceneSelectBtn) {
    sceneSelectBtn.addEventListener('click', () => {
      console.log('🎬 Scene Select clicked');
      const sceneSelect = document.getElementById('sceneSelect');
      if (sceneSelect) {
        sceneSelect.classList.add('visible');
      }
    });
    console.log('✅ Scene Select button initialized');
  }
  
  // Sequence Composer button - opens sequence.html in new window
  const sequenceComposerBtn = document.getElementById('sequenceComposerBtn');
  if (sequenceComposerBtn) {
    sequenceComposerBtn.addEventListener('click', () => {
      console.log('🎬 Opening Sequence Composer in new window...');
      window.open('./sequence.html', 'SequenceComposer', 'width=1400,height=900');
    });
    console.log('✅ Sequence Composer button initialized');
  }
  
  // Test button - quick test transition to city
  const testBtn = document.getElementById('testBtn');
  if (testBtn) {
    testBtn.addEventListener('click', async () => {
      console.log('🔊 Test button clicked - Transitioning to City');
      // Hide play overlay
      const play = document.getElementById('play');
      if (play) play.style.display = 'none';
      // Initialize systems if needed
      if (!window.celliApp.initialized) {
        await startApp();
      }
      // Transition to city
      transitionToCity();
    });
    console.log('✅ Test button initialized');
  }
  
  // Close scene select
  const closeSceneSelect = document.getElementById('closeSceneSelect');
  if (closeSceneSelect) {
    closeSceneSelect.addEventListener('click', () => {
      const sceneSelect = document.getElementById('sceneSelect');
      if (sceneSelect) sceneSelect.classList.remove('visible');
    });
    console.log('✅ Scene Select close button initialized');
  }
  
  // Scene selection options
  const sceneOptions = document.querySelectorAll('.scene-option:not(.locked)');
  sceneOptions.forEach(option => {
    option.addEventListener('click', () => {
      const sceneName = option.dataset.scene;
      if (sceneName && sceneManager.listScenes().includes(sceneName)) {
        sceneManager.transitionTo(sceneName);
        document.getElementById('sceneSelect')?.classList.remove('visible');
      }
    });
  });
}

// Open sequence composer
function openSequenceComposer() {
  if (!sequenceUI) {
    sequenceUI = new SequenceUI('sequence-composer-container', sceneRegistry);
    sequenceUI.init();
  }
  
  const container = document.getElementById('sequence-composer-container');
  if (container) {
    container.classList.add('active');
    sequenceUI.show();
  }
  
  // Register components if app is running
  const appContext = getAppContext();
  if (appContext) {
    registerSceneComponents(appContext);
  }
  
  console.log('🎬 Sequence Composer opened');
}

async function handleAutoStart() {
  const params = new URLSearchParams(window.location.search);
  const autostart = params.get('autostart');
  const shouldAutostart = autostart === '' || autostart === '1' || autostart?.toLowerCase() === 'true';

  if (!shouldAutostart) {
    return;
  }

  if (window.celliApp?.initialized) {
    return;
  }

  console.log('⚡ Autostart parameter detected - starting experience automatically.');

  try {
    await startExperience();
  } catch (error) {
    console.error('❌ Failed to autostart experience:', error);
  }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export THREE globally for compatibility
window.THREE = THREE;

console.log('✅ Main entry point loaded');
console.log('🔍 Debug: window.celliApp (scene manager, transitions, etc.)');
console.log('🎮 Debug: window.THREE (Three.js library)');
console.log('🎬 Debug: window.SceneManager (scene manager instance)');
console.log('🎼 Debug: window.SceneRegistry (scene registry for sequences)');

