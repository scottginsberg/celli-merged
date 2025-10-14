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
  handleAutoStart()
    .then((autoStarted) => {
      if (autoStarted) {
        console.log('⚙️ Auto-start completed via query parameter.');
        return true;
      }

      console.log('🎯 No auto-start parameter detected - starting intro animation immediately.');
      return startExperience('init-default');
    })
    .catch((error) => {
      console.error('❌ Failed to orchestrate auto-start flow:', error);
    });

  console.log('✨ Celli initialized - experience will auto-start when ready (Play button still available).');
  console.log('📋 Available scenes:', sceneManager.listScenes().join(', '));
}

// Sequence UI instance
let sequenceUI = null;

let experienceStartInProgress = false;

async function startExperience(triggerSource = 'unknown') {
  console.group('[Celli] startExperience');
  console.log(`🔁 Trigger source: ${triggerSource}`);

  if (window.celliApp?.initialized) {
    console.warn('⚠️ startExperience called but app is already initialized.');
    console.groupEnd();
    return true;
  }

  if (window.celliApp?.initializing || experienceStartInProgress) {
    console.warn('⚠️ App start already in progress - ignoring duplicate start request.');
    console.groupEnd();
    return false;
  }

  experienceStartInProgress = true;
  const timerLabel = `[Celli] startApp (${triggerSource})`;
  console.time(timerLabel);

  let success = false;

  try {
    await startApp();
    success = true;
    console.log('✅ startExperience completed without errors.');

    setTimeout(() => {
      const appContext = getAppContext();
      if (appContext) {
        registerSceneComponents(appContext);
        console.log('✅ Scene components registered with sequence system');
      } else {
        console.warn('⚠️ App context not available after start - sequence components not registered yet.');
      }
    }, 100);
  } catch (error) {
    console.error('❌ startExperience failed:', error);
  } finally {
    console.timeEnd(timerLabel);
    experienceStartInProgress = false;
    console.groupEnd();
  }

  return success;
}

function setupButtons() {
  // Play button - starts the app and begins intro sequence
  const playBtn = document.getElementById('playBtn');
  if (playBtn) {
    playBtn.addEventListener('click', async () => {
      console.log('▶️ Play button clicked - Starting intro sequence!');
      const started = await startExperience('play-button');
      if (!started) {
        console.warn('⚠️ Play button start request did not complete successfully.');
      }
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
      const started = await startExperience('test-button');
      if (!started) {
        console.warn('⚠️ Test button was unable to start the app cleanly - attempting city transition anyway.');
      }

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
    console.log('ℹ️ Autostart parameter not present or disabled.');
    return false;
  }

  if (window.celliApp?.initialized) {
    console.log('ℹ️ Autostart requested but app is already initialized.');
    return true;
  }

  console.log('⚡ Autostart parameter detected - starting experience automatically.');

  try {
    const started = await startExperience('query-parameter');
    if (!started) {
      console.warn('⚠️ Autostart attempt did not complete successfully.');
    }
    return started;
  } catch (error) {
    console.error('❌ Failed to autostart experience:', error);
    return false;
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

