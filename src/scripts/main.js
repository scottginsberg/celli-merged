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
import { screenRecorder } from './tools/ScreenRecorder.js';

// Import new systems
import { permissionManager } from './systems/PermissionManager.js';
import { inputSystem } from './systems/InputSystem.js';

const DEFAULT_AUTOSTART = false;
const ENFORCE_INTERACTIVE_START = true;
const SCENE_MODE_STORAGE_KEY = 'celli:sceneMode';
const CONSTRUCTION_STORAGE_KEY = 'celli:introConstructionComplete';
const INTRO_THEME_STORAGE_KEY = 'celli:introThemePreference';
const DEFAULT_SCENE_MODE = 'template';
const FULL_SEQUENCE_FLAG_KEY = 'celli:fullSequenceActive';
const FULL_SEQUENCE_STAGE_KEY = 'celli:fullSequenceStage';
const FULL_SEQUENCE_REFERRER_STAGE = 'referrer';
const FULL_SEQUENCE_REFERRER_ACTIVE_KEY = 'celli:fullSequenceReferrerActive';
const FULL_SEQUENCE_BETA_STAGE = 'beta';
const FULL_SEQUENCE_INTRO_STAGE = 'intro';
const FULL_SEQUENCE_INTRO_RUNNING_STAGE = 'intro-running';
const FULL_SEQUENCE_INTRO_ACTIVE_STAGE = 'intro-active';
const FULL_SEQUENCE_VOXEL_STAGE = 'voxel';
const EXECUTION_ENV_MODE_STORAGE_KEY = 'fullhand_mode';
const EXECUTION_ENV_DEFAULT_MODE = 'sequence';

const SCENE_OPTION_CONFIG = {
  theos: {
    templateUrl: './templates/componentized/theos-sequence.html',
    badge: {
      template: 'Template'
    },
    indicator: {
      template: 'Standalone coordinate lattice build'
    },
    unlock: {
      template: true
    }
  },
  blackhole: {
    templateUrl: './templates/componentized/theos-sequence.html?start=blackhole',
    badge: {
      template: 'Template'
    },
    indicator: {
      template: 'Standalone singularity sequence'
    },
    unlock: {
      template: true
    }
  },
  cellireal: {
    templateUrl: './templates/componentized/cellireal-complete.html',
    componentScene: 'cellireal',
    badge: {
      template: 'Template',
      component: 'Component'
    },
    indicator: {
      template: 'Opens standalone voxel world',
      component: 'Loads rebuilt voxel world in-app'
    },
    unlock: {
      template: true,
      component: true
    }
  },
  fullhand: {
    templateUrl: './templates/componentized/fullhand-complete.html',
    componentScene: 'fullhand',
    badge: {
      template: 'Template',
      component: 'Component'
    },
    indicator: {
      template: 'Standalone execution environment',
      component: 'In-app execution environment'
    },
    unlock: {
      template: true,
      component: true
    }
  }
};

let currentSceneMode = DEFAULT_SCENE_MODE;
let currentExecutionEnvMode = EXECUTION_ENV_DEFAULT_MODE;

let toastTimeoutId = null;

function readStoredSceneMode() {
  try {
    const stored = window.localStorage?.getItem(SCENE_MODE_STORAGE_KEY);
    if (stored === 'template' || stored === 'component') {
      return stored;
    }
  } catch (error) {
    console.warn('⚠️ Unable to read scene mode preference:', error);
  }

  return DEFAULT_SCENE_MODE;
}

function updateSceneModeButtons() {
  const buttons = document.querySelectorAll('.mode-toggle');
  buttons.forEach((button) => {
    const buttonMode = button.dataset.mode;
    const isActive = buttonMode === currentSceneMode;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    if (isActive) {
      button.style.backgroundColor = '#4a7cff';
      button.style.borderColor = '#6a9cff';
      button.style.color = '#fff';
    } else {
      button.style.backgroundColor = '#2a2a2f';
      button.style.borderColor = '#444';
      button.style.color = '#ddd';
    }
  });
}

function setSceneMode(mode, { persist = true } = {}) {
  if (mode !== 'template' && mode !== 'component') {
    return;
  }

  currentSceneMode = mode;

  if (persist) {
    try {
      window.localStorage?.setItem(SCENE_MODE_STORAGE_KEY, mode);
    } catch (error) {
      console.warn('⚠️ Unable to persist scene mode preference:', error);
    }
  }

  updateSceneModeButtons();
  applySceneModeToSceneOptions();
}

function getSceneMode() {
  return currentSceneMode;
}

function initializeSceneMode() {
  currentSceneMode = readStoredSceneMode();
  updateSceneModeButtons();
  applySceneModeToSceneOptions();
}

window.getCelliSceneMode = getSceneMode;

function readStoredExecutionEnvMode() {
  try {
    const stored = window.localStorage?.getItem(EXECUTION_ENV_MODE_STORAGE_KEY);
    if (stored === 'sequence' || stored === 'debug') {
      return stored;
    }
  } catch (error) {
    console.warn('⚠️ Unable to read execution environment mode:', error);
  }

  return EXECUTION_ENV_DEFAULT_MODE;
}

function updateExecutionModeButtons() {
  const buttons = document.querySelectorAll('.mode-btn[data-scene-target="fullhand"]');
  buttons.forEach((button) => {
    const buttonMode = button.dataset.mode;
    const isActive = buttonMode === currentExecutionEnvMode;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    if (isActive) {
      button.style.backgroundColor = '#4a7cff';
      button.style.borderColor = '#6a9cff';
      button.style.color = '#fff';
    } else {
      button.style.backgroundColor = '#2a2a2f';
      button.style.borderColor = '#444';
      button.style.color = '#ddd';
    }
  });
}

function setExecutionEnvironmentMode(mode, { persist = true, announce = false } = {}) {
  if (mode !== 'sequence' && mode !== 'debug') {
    return;
  }

  currentExecutionEnvMode = mode;

  if (persist) {
    try {
      window.localStorage?.setItem(EXECUTION_ENV_MODE_STORAGE_KEY, mode);
    } catch (error) {
      console.warn('⚠️ Unable to persist execution environment mode:', error);
    }
  }

  updateExecutionModeButtons();

  if (announce) {
    const message = mode === 'debug'
      ? 'Execution environment set to Debug mode'
      : 'Execution environment set to Sequence mode';
    showToast(message);
  }
}

function getExecutionEnvironmentMode() {
  return currentExecutionEnvMode;
}

function initializeExecutionEnvironmentMode() {
  currentExecutionEnvMode = readStoredExecutionEnvMode();
  updateExecutionModeButtons();
}

function applySceneModeToSceneOptions() {
  const container = document.getElementById('sceneOptions');
  if (!container) {
    return;
  }

  const mode = getSceneMode();

  Object.entries(SCENE_OPTION_CONFIG).forEach(([sceneId, config]) => {
    const option = container.querySelector(`.scene-option[data-scene="${sceneId}"]`);
    if (!option) {
      return;
    }

    const badge = option.querySelector('.mode-badge');
    if (badge) {
      const badgeText = (config.badge && config.badge[mode])
        ? config.badge[mode]
        : mode === 'component' ? 'Component' : 'Template';
      badge.textContent = badgeText;
      badge.style.display = 'inline-block';
    }

    const indicator = option.querySelector('.mode-indicator');
    if (indicator) {
      const indicatorText = (config.indicator && config.indicator[mode])
        ? config.indicator[mode]
        : mode === 'component' ? 'Loads inside app' : 'Opens standalone';
      indicator.textContent = indicatorText;
    }

    const unlockConfig = config.unlock || {};
    const shouldUnlock = unlockConfig[mode] ?? false;

    if (shouldUnlock) {
      option.dataset.modeUnlocked = 'true';
      option.classList.remove('locked');
    } else {
      delete option.dataset.modeUnlocked;
      if (option.dataset.debugUnlocked === 'true') {
        option.classList.remove('locked');
      } else if (option.dataset.originalLocked === 'true') {
        option.classList.add('locked');
      }
    }
  });
}

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

function isFullSequenceActive() {
  try {
    return window.sessionStorage?.getItem(FULL_SEQUENCE_FLAG_KEY) === 'true';
  } catch (error) {
    console.warn('⚠️ Unable to read Full Sequence active flag:', error);
    return false;
  }
}

function setFullSequenceActive(active) {
  try {
    if (active) {
      window.sessionStorage?.setItem(FULL_SEQUENCE_FLAG_KEY, 'true');
    } else {
      window.sessionStorage?.removeItem(FULL_SEQUENCE_FLAG_KEY);
      window.sessionStorage?.removeItem(FULL_SEQUENCE_STAGE_KEY);
    }
  } catch (error) {
    console.warn('⚠️ Unable to update Full Sequence active flag:', error);
  }
}

function getFullSequenceStage() {
  try {
    return window.sessionStorage?.getItem(FULL_SEQUENCE_STAGE_KEY) || '';
  } catch (error) {
    console.warn('⚠️ Unable to read Full Sequence stage:', error);
    return '';
  }
}

function setFullSequenceStage(stage) {
  try {
    if (!stage) {
      window.sessionStorage?.removeItem(FULL_SEQUENCE_STAGE_KEY);
      window.sessionStorage?.removeItem(FULL_SEQUENCE_REFERRER_ACTIVE_KEY);
      return;
    }

    if (window.sessionStorage?.getItem(FULL_SEQUENCE_FLAG_KEY) === 'true') {
      window.sessionStorage.setItem(FULL_SEQUENCE_STAGE_KEY, stage);
      if (stage !== FULL_SEQUENCE_REFERRER_STAGE) {
        window.sessionStorage?.removeItem(FULL_SEQUENCE_REFERRER_ACTIVE_KEY);
      }
    }
  } catch (error) {
    console.warn('⚠️ Unable to persist Full Sequence stage:', error);
  }
}

function isReferrerOverlayActive() {
  try {
    return window.sessionStorage?.getItem(FULL_SEQUENCE_REFERRER_ACTIVE_KEY) === 'true';
  } catch (error) {
    console.warn('⚠️ Unable to read referrer overlay active flag:', error);
    return false;
  }
}

function resumeFullSequenceIfNeeded() {
  if (!isFullSequenceActive()) {
    return;
  }

  const stage = getFullSequenceStage();
  if (stage === FULL_SEQUENCE_INTRO_RUNNING_STAGE) {
    setFullSequenceStage(FULL_SEQUENCE_INTRO_STAGE);
  }

  if (stage === FULL_SEQUENCE_REFERRER_STAGE) {
    if (isReferrerOverlayActive()) {
      console.log('🔗 Resuming Full Sequence at referrer stage');
      if (typeof window.triggerOverlay === 'function') {
        try {
          window.triggerOverlay('linkedin');
        } catch (error) {
          console.warn('⚠️ Unable to resume referrer overlay for Full Sequence:', error);
        }
      } else {
        console.warn('⚠️ Referrer overlay trigger unavailable for Full Sequence resume.');
      }
    } else {
      console.log('ℹ️ Referrer stage stored but overlay not marked active — skipping auto-resume.');
    }
  } else if (stage === FULL_SEQUENCE_BETA_STAGE) {
    showToast('Full Sequence: continue the beta focus form to proceed.');
  } else if (stage === FULL_SEQUENCE_INTRO_STAGE) {
    showToast('Full Sequence: launching intro sequence…');
  }
}

console.log('%c🎨 Celli v6.0 - Enhanced Scene System 🎨',
            'background: #8ab4ff; color: #000; font-size: 20px; padding: 10px; font-weight: bold;');
console.log('%c🔧 Dynamic scene loading & composition',
            'background: #0f0; color: #000; font-size: 14px; padding: 6px;');

// Check WebGL support
const webglAvailable = checkWebGL();
if (!webglAvailable) {
  const fallback = document.getElementById('fallback');
  if (fallback) {
    fallback.style.display = 'flex';
  } else {
    console.warn('⚠️ WebGL unavailable and fallback container missing.');
  }

  console.error('WebGL not available — skipping Celli initialization.');
}

// Initialize when DOM is ready
function init() {
  console.group('🚀 Initializing Celli bootstrap');
  console.log('📋 Document ready state:', document.readyState);

  if (screenRecorder) {
    window.screenRecorder = screenRecorder;
  }
  
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

  resumeFullSequenceIfNeeded();

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

let rootVideoPlaylistCache = null;
let rootVideoDiscoveryPromise = null;
let videoPlaylistUI = null;
let activeVideoPlaylist = null;
let voxelWorldRedirectInProgress = false;

const ROOT_VIDEO_FALLBACKS = [
  'intro.mp4',
  'intro2.mp4',
  'intro3.mp4',
  'intro4.mp4',
  'intro5.mp4',
  'intro6.mp4'
];

function normalizeRootMediaPath(path) {
  if (!path) {
    return null;
  }

  const trimmed = path.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  if (trimmed.startsWith('./')) {
    return trimmed;
  }

  return `./${trimmed.replace(/^\.\//, '')}`;
}

function extractMp4CandidatesFromText(text) {
  if (!text) {
    return [];
  }

  const matches = new Set();
  const mp4Regex = /(?:href\s*=\s*|src\s*=\s*)?"?([A-Za-z0-9_\-.\/\%]+\.mp4)"?/gi;
  let match;

  while ((match = mp4Regex.exec(text)) !== null) {
    const candidate = normalizeRootMediaPath(match[1]);
    if (candidate) {
      matches.add(candidate);
    }
  }

  return Array.from(matches);
}

async function discoverRootMp4s() {
  if (rootVideoPlaylistCache) {
    return rootVideoPlaylistCache;
  }

  if (rootVideoDiscoveryPromise) {
    return rootVideoDiscoveryPromise;
  }

  const attemptFetch = async (url, options) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        console.warn('⚠️ Root MP4 discovery request failed', url, response.status);
        return null;
      }
      return response;
    } catch (error) {
      console.warn('⚠️ Root MP4 discovery request error', url, error);
      return null;
    }
  };

  const collectFromSource = async (url) => {
    const response = await attemptFetch(url, { headers: { 'Accept': 'text/plain, text/html;q=0.9,*/*;q=0.8' } });
    if (!response) {
      return [];
    }

    try {
      const text = await response.text();
      return extractMp4CandidatesFromText(text);
    } catch (error) {
      console.warn('⚠️ Failed to parse MP4 listing from source', url, error);
      return [];
    }
  };

  const validateCandidates = async (candidates) => {
    const unique = Array.from(new Set(candidates));
    if (!unique.length) {
      return [];
    }

    const validated = [];

    for (const candidate of unique) {
      try {
        const response = await fetch(candidate, { method: 'HEAD' });
        if (response.ok || response.status === 405) {
          validated.push(candidate);
          continue;
        }

        console.warn('⚠️ MP4 candidate rejected (HTTP status)', candidate, response.status);
      } catch (error) {
        console.warn('⚠️ MP4 candidate HEAD request failed - assuming accessible', candidate, error);
        // Assume accessible in offline/file contexts where HEAD may fail
        validated.push(candidate);
      }
    }

    return validated;
  };

  rootVideoDiscoveryPromise = (async () => {
    const discovered = new Set();

    const directoryCandidates = await collectFromSource('./');
    directoryCandidates.forEach(candidate => discovered.add(candidate));

    if (discovered.size === 0) {
      const indexCandidates = await collectFromSource('./INDEX.txt');
      indexCandidates.forEach(candidate => discovered.add(candidate));
    }

    if (discovered.size === 0) {
      ROOT_VIDEO_FALLBACKS.forEach(candidate => {
        const normalized = normalizeRootMediaPath(candidate);
        if (normalized) {
          discovered.add(normalized);
        }
      });
    }

    const validated = await validateCandidates(Array.from(discovered));
    rootVideoPlaylistCache = validated;
    return validated;
  })()
    .catch(error => {
      console.error('❌ Failed to discover root MP4 playlist', error);
      return [];
    })
    .finally(() => {
      rootVideoDiscoveryPromise = null;
    });

  return rootVideoDiscoveryPromise;
}

function ensureVideoPlaylistUI() {
  if (videoPlaylistUI) {
    return videoPlaylistUI;
  }

  const overlay = document.createElement('div');
  overlay.id = 'rootVideoPlaylistOverlay';
  overlay.style.cssText = 'position:fixed; inset:0; display:none; align-items:center; justify-content:center; background:rgba(0,0,0,0.85); z-index:10000; padding:20px;';

  const container = document.createElement('div');
  container.style.cssText = 'display:flex; flex-direction:column; align-items:center; gap:12px; max-width:90vw;';

  const title = document.createElement('h3');
  title.textContent = 'Root Video Playlist';
  title.style.cssText = 'color:#1abc9c; font-family:"Roboto Mono", monospace; letter-spacing:0.12em; text-transform:uppercase; font-size:16px;';

  const subtitle = document.createElement('div');
  subtitle.style.cssText = 'color:#f0f0f0; font-size:13px; font-family:"Roboto Mono", monospace; opacity:0.85; text-align:center;';

  const video = document.createElement('video');
  video.controls = true;
  video.style.cssText = 'max-width:82vw; max-height:70vh; border:2px solid rgba(26,188,156,0.6); border-radius:10px; box-shadow:0 0 25px rgba(26,188,156,0.4); background:#000;';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.style.cssText = 'padding:8px 18px; background:#f39c12; border:none; border-radius:20px; color:#000; cursor:pointer; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; font-size:11px;';

  const controls = document.createElement('div');
  controls.style.cssText = 'display:flex; gap:12px; align-items:center; flex-wrap:wrap; justify-content:center;';
  controls.appendChild(closeBtn);

  container.appendChild(title);
  container.appendChild(subtitle);
  container.appendChild(video);
  container.appendChild(controls);
  overlay.appendChild(container);

  overlay.addEventListener('click', event => {
    if (event.target === overlay) {
      closeVideoPlaylist();
    }
  });

  closeBtn.addEventListener('click', () => {
    closeVideoPlaylist();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && overlay.style.display !== 'none') {
      closeVideoPlaylist();
    }
  });

  document.body.appendChild(overlay);
  videoPlaylistUI = { overlay, container, title, subtitle, video, closeBtn };
  return videoPlaylistUI;
}

function closeVideoPlaylist(options = {}) {
  const { silent = false } = options;

  if (!videoPlaylistUI) {
    return;
  }

  if (activeVideoPlaylist) {
    try {
      videoPlaylistUI.video.pause();
    } catch (error) {
      console.warn('⚠️ Unable to pause playlist video', error);
    }
    videoPlaylistUI.video.removeAttribute('src');
    videoPlaylistUI.video.load();
    activeVideoPlaylist = null;
  }

  videoPlaylistUI.overlay.style.display = 'none';
  if (!silent) {
    showToast('Video playlist closed');
  }
}

async function startRootVideoPlaylist() {
  const playlist = await discoverRootMp4s();

  if (!playlist.length) {
    showToast('No MP4 files found in root');
    console.warn('⚠️ No MP4 files discovered for playlist');
    return;
  }

  if (activeVideoPlaylist) {
    closeVideoPlaylist({ silent: true });
  }

  const ui = ensureVideoPlaylistUI();
  const uniquePlaylist = Array.from(new Set(playlist));

  let currentIndex = 0;

  const updateSubtitle = (index) => {
    const fileName = uniquePlaylist[index]?.split('/').pop() ?? 'unknown';
    ui.subtitle.textContent = `Playing ${index + 1} / ${uniquePlaylist.length}: ${decodeURIComponent(fileName)}`;
  };

  const playAtIndex = (index) => {
    if (index < 0 || index >= uniquePlaylist.length) {
      closeVideoPlaylist({ silent: true });
      return;
    }

    currentIndex = index;
    const source = uniquePlaylist[index];
    ui.video.src = source;
    updateSubtitle(index);
    ui.video.play().catch(error => {
      console.error('❌ Failed to play video from playlist', source, error);
      showToast(`Unable to play ${source}`);
    });
  };

  ui.video.onended = () => {
    if (currentIndex + 1 < uniquePlaylist.length) {
      playAtIndex(currentIndex + 1);
    } else {
      showToast('Video playlist finished');
      closeVideoPlaylist({ silent: true });
    }
  };

  ui.overlay.style.display = 'flex';
  activeVideoPlaylist = {
    list: uniquePlaylist,
    playAtIndex,
    get current() {
      return currentIndex;
    }
  };

  playAtIndex(0);
  showToast(`Playing ${uniquePlaylist.length} video${uniquePlaylist.length === 1 ? '' : 's'}…`);
}

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

  const modeToggleButtons = Array.from(document.querySelectorAll('.mode-toggle'));
  if (modeToggleButtons.length) {
    initializeSceneMode();

    modeToggleButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const mode = button.dataset.mode || DEFAULT_SCENE_MODE;
        if (mode === getSceneMode()) {
          return;
        }

        setSceneMode(mode);
        const message = mode === 'component'
          ? 'Component mode enabled — scenes will load inside the app.'
          : 'Template mode enabled — scenes will open as standalone templates.';
        showToast(message);
      });
    });
  } else {
    currentSceneMode = DEFAULT_SCENE_MODE;
  }

  initializeExecutionEnvironmentMode();

  const executionModeButtons = document.querySelectorAll('.mode-btn[data-scene-target="fullhand"]');
  executionModeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const mode = button.dataset.mode;
      if (!mode || mode === getExecutionEnvironmentMode()) {
        return;
      }

      setExecutionEnvironmentMode(mode, { announce: true });
    });
  });

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

  const resetThemeBtn = document.getElementById('resetThemeBtn');
  if (resetThemeBtn) {
    resetThemeBtn.addEventListener('click', () => {
      try {
        window.localStorage?.removeItem(INTRO_THEME_STORAGE_KEY);
        window.localStorage?.removeItem(CONSTRUCTION_STORAGE_KEY);
        console.log('🔄 Intro theme preference reset');
        showToast('Intro theme preference reset');
      } catch (error) {
        console.warn('⚠️ Failed to reset intro theme preference:', error);
        showToast('Unable to reset intro theme preference');
      }
    });
    console.log('✅ Intro theme reset button initialized');
  }

  const testVideoBtn = document.getElementById('testVideoBtn');
  if (testVideoBtn) {
    testVideoBtn.addEventListener('click', async () => {
      console.log('🎞️ Test Video Playlist button clicked - discovering MP4 assets');
      try {
        await startRootVideoPlaylist();
      } catch (error) {
        console.error('❌ Failed to start video playlist', error);
        showToast(`Video playlist failed: ${error.message || error}`);
      }
    });
    console.log('✅ Test video playlist button initialized');
  }

  const flashSceneBtn = document.getElementById('flashSceneBtn');
  if (flashSceneBtn) {
    flashSceneBtn.addEventListener('click', () => {
      console.log('⚡ Flash scene button clicked');
      window.open('./flash.html', '_blank');
      showToast('Opening Flash scene…');
    });
    console.log('✅ Flash scene button initialized');
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

  const fullSequenceBtn = document.getElementById('fullSequenceBtn');
  if (fullSequenceBtn) {
    fullSequenceBtn.addEventListener('click', () => {
      setFullSequenceActive(true);
      setFullSequenceStage(FULL_SEQUENCE_REFERRER_STAGE);
      showToast('Launching Full Sequence…');

      try {
        if (typeof window.triggerOverlay === 'function') {
          window.triggerOverlay('linkedin');
        } else {
          console.warn('⚠️ Full Sequence overlay trigger unavailable.');
          showToast('Unable to start Full Sequence — overlay unavailable');
        }
      } catch (error) {
        console.error('❌ Failed to start Full Sequence:', error);
        showToast('Full Sequence failed to launch');
      }
    });
    console.log('✅ Full Sequence button initialized');
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
            delete option.dataset.debugUnlocked;
            if (option.dataset.modeUnlocked === 'true') {
              option.classList.remove('locked');
            } else {
              option.classList.add('locked');
            }
          }
        });

        debugToggleBtn.textContent = debugUnlocked ? 'Debug: Hide Locked' : 'Debug: Show All';
        debugToggleBtn.setAttribute('aria-pressed', debugUnlocked ? 'true' : 'false');

        showToast(debugUnlocked ? 'All scenes unlocked for debug' : 'Scene locks restored');
        applySceneModeToSceneOptions();
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
        showToast('Scene target missing');
        return;
      }

      const sceneConfig = SCENE_OPTION_CONFIG[sceneName];

      const targetUrl = option.dataset.url;
      if (sceneConfig) {
        const mode = getSceneMode();

        if (mode === 'template' && sceneConfig.templateUrl) {
          console.log(`🌐 Opening ${sceneName} template:`, sceneConfig.templateUrl);
          window.open(sceneConfig.templateUrl, '_blank', 'noopener');
          document.getElementById('sceneSelect')?.classList.remove('visible');
          showToast('Opening scene template in new window…');
          return;
        }

        if (mode === 'component' && sceneConfig.componentScene) {
          const registeredScenes = sceneManager.listScenes();
          if (!registeredScenes.includes(sceneConfig.componentScene)) {
            console.warn(`⚠️ Component scene not registered: ${sceneConfig.componentScene}`);
            showToast('Scene not available in component mode yet.');
            return;
          }

          try {
            if (!experienceStarted) {
              await startExperience({ reason: 'scene-select' });
            }

            const transitionOptions = {};
            if (sceneName === 'fullhand') {
              transitionOptions.mode = getExecutionEnvironmentMode();
            }

            const transitioned = await sceneManager.transitionTo(sceneConfig.componentScene, transitionOptions);
            if (transitioned) {
              document.getElementById('sceneSelect')?.classList.remove('visible');
              showToast(`Transitioning to ${sceneName}…`);
            } else {
              showToast(`Failed to transition to ${sceneName}`);
            }
          } catch (error) {
            console.error('❌ Failed to load scene from scene select:', error);
            showToast(`Scene load failed: ${error.message || error}`);
          }
          return;
        }
      }

      if (targetUrl) {
        console.log('🌐 Opening external scene URL:', targetUrl);
        window.open(targetUrl, '_blank');
        document.getElementById('sceneSelect')?.classList.remove('visible');
        showToast('Opening scene in new window…');
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

  const fullSequenceActive = isFullSequenceActive();
  const fullSequenceStage = fullSequenceActive ? getFullSequenceStage() : '';
  if (fullSequenceActive && fullSequenceStage === FULL_SEQUENCE_INTRO_STAGE) {
    console.log('⚡ Full Sequence intro stage detected - starting experience automatically.');
    setFullSequenceStage(FULL_SEQUENCE_INTRO_RUNNING_STAGE);

    try {
      await startExperience({ reason: 'full-sequence-intro' });
      setFullSequenceStage(FULL_SEQUENCE_INTRO_ACTIVE_STAGE);
    } catch (error) {
      console.error('❌ Failed to autostart intro for Full Sequence:', error);
      setFullSequenceStage(FULL_SEQUENCE_INTRO_STAGE);
      const playBtn = document.getElementById('playBtn');
      if (playBtn) {
        playBtn.disabled = false;
      }
    }

    return;
  }

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

window.addEventListener('celli:launchVoxelWorld', async (event) => {
  if (isFullSequenceActive()) {
    setFullSequenceStage(FULL_SEQUENCE_VOXEL_STAGE);
    setFullSequenceActive(false);
  }

  if (voxelWorldRedirectInProgress) {
    return;
  }

  voxelWorldRedirectInProgress = true;

  const requestedMode = event?.detail?.mode;
  const mode = (requestedMode === 'template' || requestedMode === 'component')
    ? requestedMode
    : getSceneMode();

  if (mode === 'component') {
    try {
      if (!experienceStarted && !experienceStarting) {
        await startExperience({ reason: 'voxel-world-request' });
      }

      const transitioned = await sceneManager.transitionTo('cellireal');
      if (!transitioned) {
        console.warn('⚠️ Scene manager refused to transition to cellireal');
        showToast('Unable to launch voxel world scene.');
      }
    } catch (error) {
      console.error('❌ Failed to launch voxel world scene:', error);
      showToast(`Voxel world failed: ${error.message || error}`);
    } finally {
      voxelWorldRedirectInProgress = false;
    }

    return;
  }

  try {
    window.location.href = './templates/componentized/cellireal-complete.html';
    voxelWorldRedirectInProgress = false;
  } catch (error) {
    console.error('❌ Failed to redirect to voxel world template:', error);
    voxelWorldRedirectInProgress = false;
  }
});

window.addEventListener('error', (event) => {
  console.error('💥 Global error captured:', event.message, event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('💥 Unhandled promise rejection:', event.reason);
});

// Start when DOM is ready (only if WebGL is available)
if (webglAvailable) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

// Export THREE globally for compatibility
window.THREE = THREE;

console.log('✅ Main entry point loaded');
console.log('🔍 Debug: window.celliApp (scene manager, transitions, etc.)');
console.log('🎮 Debug: window.THREE (Three.js library)');
console.log('🎬 Debug: window.SceneManager (scene manager instance)');
console.log('🎼 Debug: window.SceneRegistry (scene registry for sequences)');

