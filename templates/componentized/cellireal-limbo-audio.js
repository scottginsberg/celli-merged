(function () {
  'use strict';

  const AUDIO_PATH = '../../limbo.mp3';
  const AUDIO_VOLUME = 0.6;
  const HOOK_CHECK_INTERVAL_MS = 250;
  const USER_GESTURE_EVENTS = ['pointerdown', 'touchstart', 'keydown'];

  let audioInstance = null;
  let playbackRequested = false;
  let playbackStarted = false;
  let hookInstalled = false;

  function resolveAudioUrl() {
    try {
      const base = document.currentScript?.src ? document.currentScript.src : window.location.href;
      return new URL(AUDIO_PATH, base).href;
    } catch (error) {
      console.warn('[Celli.real] Failed to resolve limbo.mp3 URL:', error);
      return AUDIO_PATH;
    }
  }

  function ensureAudio() {
    if (audioInstance) {
      return audioInstance;
    }

    try {
      audioInstance = new Audio(resolveAudioUrl());
      audioInstance.loop = false;
      audioInstance.volume = AUDIO_VOLUME;
      audioInstance.preload = 'auto';
    } catch (error) {
      console.warn('[Celli.real] Unable to initialize limbo.mp3 audio instance:', error);
      audioInstance = null;
    }

    return audioInstance;
  }

  function logPlaybackStart(source) {
    console.log(`[Celli.real] limbo.mp3 playback started (${source}).`);
  }

  function attemptPlayback(source) {
    if (playbackStarted) {
      return;
    }

    const audio = ensureAudio();
    if (!audio) {
      return;
    }

    playbackRequested = true;

    try {
      const playResult = audio.play();
      if (playResult && typeof playResult.then === 'function') {
        playResult
          .then(() => {
            playbackStarted = true;
            playbackRequested = false;
            logPlaybackStart(source);
          })
          .catch((error) => {
            console.warn('[Celli.real] limbo.mp3 playback blocked:', error);
          });
      } else {
        playbackStarted = true;
        playbackRequested = false;
        logPlaybackStart(source);
      }
    } catch (error) {
      console.warn('[Celli.real] limbo.mp3 playback threw an error:', error);
    }
  }

  function handleUserGesture(event) {
    if (!playbackRequested || playbackStarted) {
      return;
    }

    attemptPlayback(`user-gesture:${event.type}`);
  }

  function registerUserGestureFallbacks() {
    USER_GESTURE_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleUserGesture, { passive: eventName !== 'keydown' });
    });
  }

  function requestPlayback(source) {
    if (playbackStarted) {
      return;
    }

    attemptPlayback(source);
  }

  function afterCollapseSideEffects() {
    try {
      if (typeof window.showMinDot === 'function') {
        window.showMinDot();
      }
    } catch (error) {
      console.warn('[Celli.real] Failed to invoke showMinDot():', error);
    }

    try {
      if (typeof window.updateSheetRestoreIcon === 'function') {
        window.updateSheetRestoreIcon();
      }
    } catch (error) {
      console.warn('[Celli.real] Failed to invoke updateSheetRestoreIcon():', error);
    }
  }

  function hookIntroCollapse() {
    if (hookInstalled) {
      return;
    }

    const ui = window.UI;
    if (!ui || typeof ui.triggerIntroCollapse !== 'function') {
      setTimeout(hookIntroCollapse, HOOK_CHECK_INTERVAL_MS);
      return;
    }

    const originalTrigger = ui.triggerIntroCollapse.bind(ui);
    ui.triggerIntroCollapse = function patchedTriggerIntroCollapse(...args) {
      const result = originalTrigger(...args);
      requestPlayback('UI.triggerIntroCollapse');
      afterCollapseSideEffects();
      return result;
    };

    hookInstalled = true;
    console.log('[Celli.real] Installed limbo.mp3 trigger hook on UI.triggerIntroCollapse');
  }

  function bootstrap() {
    registerUserGestureFallbacks();

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      hookIntroCollapse();
    } else {
      window.addEventListener('DOMContentLoaded', hookIntroCollapse);
    }

    if (!window.CellirealSoundtrack) {
      window.CellirealSoundtrack = {
        requestPlayback: () => requestPlayback('manual'),
        isStarted: () => playbackStarted,
        getAudio: () => audioInstance
      };
    }
  }

  bootstrap();
})();
