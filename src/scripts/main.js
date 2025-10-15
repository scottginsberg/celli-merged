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

const DEFAULT_AUTOSTART = false;
const ENFORCE_INTERACTIVE_START = true;

let toastTimeoutId = null;

function showToast(message, duration = 3000) {
  const toastEl = document.getElementById('toast');
  if (!toastEl) {
    console.warn('⚠️ Toast requested but toast element not found:', message);
    return;
  }

  toastEl.textContent = message;
  toastEl.style.display = 'block';

  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId);
  }

  toastTimeoutId = window.setTimeout(() => {
    toastEl.style.display = 'none';
  }, duration);
}

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
  console.group('🚀 Initializing Celli bootstrap');
  console.log('📋 Document ready state:', document.readyState);
  
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

  console.log('✨ Celli initialized');
  console.log('📋 Registered scenes:', sceneManager.listScenes().join(', '));
  console.groupEnd();
}

// Sequence UI instance
let sequenceUI = null;
let experienceStarting = false;
let experienceStarted = false;

async function startExperience(options = {}) {
  const { reason = 'manual' } = options;

  if (experienceStarting) {
    console.warn('⚠️ startExperience requested while another start is in progress. Reason:', reason);
    return;
  }

  if (experienceStarted) {
    console.warn('⚠️ startExperience requested but experience already running. Reason:', reason);
    return;
  }

  experienceStarting = true;
  console.group('🎬 Starting Celli experience');
  console.log('🔁 Start reason:', reason);

  try {
    await startApp();
    experienceStarted = true;
    console.log('✅ Core app boot sequence completed');

    setTimeout(() => {
      const appContext = getAppContext();
      if (appContext) {
        registerSceneComponents(appContext);
        console.log('✅ Scene components registered with sequence system');
      }
    }, 100);
  } catch (error) {
    console.error('❌ startExperience failed:', error);
    experienceStarting = false;
    console.groupEnd();
    throw error;
  }

  experienceStarting = false;
  console.groupEnd();
}

function setupButtons() {
  const sceneOptionsContainer = document.getElementById('sceneOptions');

  if (sceneOptionsContainer) {
    const allOptions = sceneOptionsContainer.querySelectorAll('.scene-option');
    allOptions.forEach(option => {
      if (!option.dataset.originalLocked) {
        option.dataset.originalLocked = option.classList.contains('locked') ? 'true' : 'false';
      }
    });
  }

  // Play button - starts the app and begins intro sequence
  const playBtn = document.getElementById('playBtn');
  if (playBtn) {
    playBtn.addEventListener('click', async () => {
      console.log('▶️ Play button clicked - Starting intro sequence!');
      playBtn.disabled = true;
      try {
        await startExperience({ reason: 'play-button' });
      } catch (error) {
        console.error('❌ Failed to start from play button:', error);
        playBtn.disabled = false;
        showToast(`Failed to start: ${error.message || error}`);
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
      showToast('Scene menu opened');
    });
    console.log('✅ Scene Select button initialized');
  }
  
  // Sequence Composer button - opens sequence.html in new window
  const sequenceComposerBtn = document.getElementById('sequenceComposerBtn');
  if (sequenceComposerBtn) {
    sequenceComposerBtn.addEventListener('click', () => {
      console.log('🎬 Opening Sequence Composer in new window...');
      window.open('./sequence.html', 'SequenceComposer', 'width=1400,height=900');
      showToast('Opening Sequence Composer…');
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
      try {
        if (!experienceStarted) {
          await startExperience({ reason: 'test-button' });
        }

        // Transition to city
        await transitionToCity();
        showToast('Transitioning to City scene…');
      } catch (error) {
        console.error('❌ Failed to execute test transition:', error);
        showToast(`Test transition failed: ${error.message || error}`);
      }
    });
    console.log('✅ Test button initialized');
  }

  const testAudioBtn = document.getElementById('testAudioBtn');
  if (testAudioBtn) {
    testAudioBtn.addEventListener('click', async () => {
      console.log('🔊 Test Audio button clicked - attempting to play credits.mp3');
      try {
        const audio = new Audio('./credits.mp3');
        audio.volume = 0.7;

        audio.addEventListener('canplaythrough', () => {
          console.log('✅ credits.mp3 ready to play');
          showToast('Playing credits.mp3');
        }, { once: true });

        audio.addEventListener('ended', () => {
          console.log('✅ credits.mp3 playback complete');
          showToast('Credits playback complete');
        }, { once: true });

        audio.addEventListener('error', (event) => {
          console.error('❌ Error loading credits.mp3:', event);
          showToast('Failed to load credits.mp3');
        }, { once: true });

        await audio.play();
      } catch (error) {
        console.error('❌ Test audio playback failed:', error);
        showToast(`Audio failed: ${error.message || error}`);
      }
    });
    console.log('✅ Test audio button initialized');
  }

  const sequenceBuilderBtn = document.getElementById('sequenceBuilderBtn');
  if (sequenceBuilderBtn) {
    sequenceBuilderBtn.addEventListener('click', () => {
      console.log('🎬 Sequence Builder button clicked');
      window.open('./tools/sequence-builder/index.html?standalone=true', 'SequenceBuilder', 'width=1800,height=1000');
      showToast('Opening Sequence Builder…');
    });
    console.log('✅ Sequence Builder button initialized');
  }

  const singleBuilderBtn = document.getElementById('singleBuilderBtn');
  if (singleBuilderBtn) {
    singleBuilderBtn.addEventListener('click', () => {
      console.log('🛠️ Single Builder button clicked');
      window.open('./builder.html', '_blank');
      showToast('Opening Single Builder…');
    });
    console.log('✅ Single Builder button initialized');
  }

  const testRunnerBtn = document.getElementById('testRunnerBtn');
  if (testRunnerBtn) {
    testRunnerBtn.addEventListener('click', () => {
      console.log('🧪 Test Runner button clicked');
      window.open('./tests/test-runner.html', '_blank');
      showToast('Opening Test Runner…');
    });
    console.log('✅ Test Runner button initialized');
  }

  if (sceneOptionsContainer) {
    const debugToggleBtn = document.getElementById('debugToggle');
    if (debugToggleBtn) {
      let debugUnlocked = false;

      debugToggleBtn.addEventListener('click', () => {
        debugUnlocked = !debugUnlocked;

        sceneOptionsContainer.querySelectorAll('.scene-option').forEach(option => {
          const originallyLocked = option.dataset.originalLocked === 'true';
          if (!originallyLocked) {
            return;
          }

          if (debugUnlocked) {
            option.classList.remove('locked');
            option.dataset.debugUnlocked = 'true';
          } else {
            option.classList.add('locked');
            delete option.dataset.debugUnlocked;
          }
        });

        debugToggleBtn.textContent = debugUnlocked ? 'Debug: Hide Locked' : 'Debug: Show All';
        debugToggleBtn.setAttribute('aria-pressed', debugUnlocked ? 'true' : 'false');

        showToast(debugUnlocked ? 'All scenes unlocked for debug' : 'Scene locks restored');
      });

      console.log('✅ Scene Select debug toggle initialized');
    }

    sceneOptionsContainer.addEventListener('click', async event => {
      const option = event.target.closest('.scene-option');
      if (!option || !sceneOptionsContainer.contains(option)) {
        return;
      }

      if (option.classList.contains('locked')) {
        console.warn('⛔ Scene option is locked:', option.dataset.scene);
        showToast('Scene is locked');
        return;
      }

      const sceneName = option.dataset.scene;
      if (!sceneName) {
        console.warn('⚠️ Scene option clicked without data-scene attribute');
        return;
      }

      if (!sceneManager.listScenes().includes(sceneName)) {
        console.warn(`⚠️ Scene "${sceneName}" is not registered`);
        showToast(`Scene not registered: ${sceneName}`);
        return;
      }

      try {
        if (!experienceStarted) {
          await startExperience({ reason: 'scene-select' });
        }

        const transitionSuccess = await sceneManager.transitionTo(sceneName);
        if (transitionSuccess) {
          document.getElementById('sceneSelect')?.classList.remove('visible');
          showToast(`Transitioning to ${sceneName}…`);
        } else {
          showToast(`Failed to transition to ${sceneName}`);
        }
      } catch (error) {
        console.error('❌ Failed to load scene from scene select:', error);
        showToast(`Scene load failed: ${error.message || error}`);
      }
    });
  }

  const playIntroVideoBtn = document.getElementById('playIntroVideoBtn');
  if (playIntroVideoBtn) {
    playIntroVideoBtn.addEventListener('click', () => {
      console.warn('🎬 Intro video playback not yet implemented in modular bootstrap.');
      showToast('Intro video playback coming soon');
    });
    console.log('⚠️ Intro video button hooked (stub)');
  }

  const playIntroVideoBtn2 = document.getElementById('playIntroVideoBtn2');
  if (playIntroVideoBtn2) {
    playIntroVideoBtn2.addEventListener('click', () => {
      console.warn('🎬 Intro II video playback not yet implemented in modular bootstrap.');
      showToast('Intro II video playback coming soon');
    });
    console.log('⚠️ Intro II video button hooked (stub)');
  }
  
  // Close scene select
  const closeSceneSelect = document.getElementById('closeSceneSelect');
  if (closeSceneSelect) {
    closeSceneSelect.addEventListener('click', () => {
      const sceneSelect = document.getElementById('sceneSelect');
      if (sceneSelect) sceneSelect.classList.remove('visible');
      showToast('Scene menu closed');
    });
    console.log('✅ Scene Select close button initialized');
  }
  
  // Scene selection options
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

function emphasizePlayButton(reason) {
  const playBtn = document.getElementById('playBtn');
  if (!playBtn) {
    console.warn('⚠️ Unable to emphasise play button - element not found.');
    return;
  }

  playBtn.disabled = false;
  playBtn.classList.add('attention');
  playBtn.setAttribute('data-autostart-pending', 'true');
  if (typeof playBtn.focus === 'function') {
    try {
      playBtn.focus({ preventScroll: false });
    } catch (focusError) {
      playBtn.focus();
    }
  }

  console.log(`⏸️ Experience waiting for manual start (${reason}).`);
  showToast('Press Play to launch the experience');

  window.setTimeout(() => {
    playBtn.classList.remove('attention');
    playBtn.removeAttribute('data-autostart-pending');
  }, 4000);
}

async function handleAutoStart() {
  const params = new URLSearchParams(window.location.search);
  const autostartParam = params.get('autostart');
  const explicitDisable = autostartParam?.toLowerCase() === 'false' || autostartParam === '0';
  const explicitEnable = autostartParam === '' || autostartParam === '1' || autostartParam?.toLowerCase() === 'true';
  const shouldAutostart = explicitDisable ? false : (explicitEnable || DEFAULT_AUTOSTART);

  if (!shouldAutostart) {
    console.log('⏸️ Autostart disabled or not requested. Waiting for user interaction.');
    if (autostartParam !== null) {
      emphasizePlayButton('autostart disabled');
    }
    return;
  }

  if (ENFORCE_INTERACTIVE_START) {
    console.log('⏸️ Autostart request detected but interactive gating is enforced.');
    emphasizePlayButton('interactive gating enforced');
    return;
  }

  if (window.celliApp?.initialized) {
    console.log('ℹ️ Autostart skipped: application already initialized.');
    return;
  }

  console.log('⚡ Autostart parameter detected - starting experience automatically.');

  try {
    await startExperience({ reason: explicitEnable ? 'query-param' : 'default-autostart' });
  } catch (error) {
    console.error('❌ Failed to autostart experience:', error);
    const playBtn = document.getElementById('playBtn');
    if (playBtn) {
      playBtn.disabled = false;
    }
  }
}

window.addEventListener('error', (event) => {
  console.error('💥 Global error captured:', event.message, event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('💥 Unhandled promise rejection:', event.reason);
});

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

