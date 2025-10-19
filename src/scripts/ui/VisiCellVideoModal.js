import { audioSystem } from '../systems/AudioSystem.js';

let activeModal = null;

function clampVolume(value, fallback = 0.85) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }
  return Math.min(1, Math.max(0, value));
}

function createOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'visicell-video-overlay';
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = 'rgba(0, 0, 0, 0.82)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '2400';
  overlay.style.opacity = '1';
  overlay.style.transition = 'opacity 0.6s ease';
  overlay.dataset.active = 'true';
  return overlay;
}

function createWindow({ title }) {
  const windowEl = document.createElement('div');
  windowEl.style.background = '#000';
  windowEl.style.border = '2px solid #0f0';
  windowEl.style.boxShadow = '0 0 32px rgba(0, 255, 120, 0.45)';
  windowEl.style.width = 'min(680px, 88vw)';
  windowEl.style.maxHeight = '90vh';
  windowEl.style.display = 'flex';
  windowEl.style.flexDirection = 'column';
  windowEl.style.overflow = 'hidden';

  const titleBar = document.createElement('div');
  titleBar.style.background = '#001a00';
  titleBar.style.color = '#0f0';
  titleBar.style.padding = '12px 16px';
  titleBar.style.fontFamily = `'Courier New', monospace`;
  titleBar.style.fontSize = '13px';
  titleBar.style.letterSpacing = '0.24em';
  titleBar.style.display = 'flex';
  titleBar.style.alignItems = 'center';
  titleBar.style.justifyContent = 'space-between';

  const titleSpan = document.createElement('span');
  titleSpan.textContent = (title || 'KEY FILE').toUpperCase();

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.textContent = '✕';
  closeBtn.style.background = 'transparent';
  closeBtn.style.color = '#0f0';
  closeBtn.style.border = '1px solid rgba(0, 255, 0, 0.35)';
  closeBtn.style.borderRadius = '6px';
  closeBtn.style.width = '32px';
  closeBtn.style.height = '24px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.fontSize = '14px';
  closeBtn.style.display = 'grid';
  closeBtn.style.placeItems = 'center';
  closeBtn.style.backgroundImage = 'radial-gradient(circle at 50% 50%, rgba(0,255,0,0.25), rgba(0,0,0,0))';

  titleBar.appendChild(titleSpan);
  titleBar.appendChild(closeBtn);
  windowEl.appendChild(titleBar);

  return { windowEl, closeBtn };
}

function createVideoElement(source) {
  const video = document.createElement('video');
  video.style.width = '100%';
  video.style.height = 'auto';
  video.style.background = '#000';
  video.controls = true;
  video.autoplay = true;
  video.playsInline = true;
  video.src = source;
  return video;
}

function attachAudioToVideo(video, audioUrl, { volume = 0.85 } = {}) {
  const ctx = audioSystem?.ensureContext?.();
  if (!ctx || !audioUrl) {
    return { cleanup: () => {} };
  }

  const audioEl = new Audio(audioUrl);
  audioEl.crossOrigin = 'anonymous';
  audioEl.preload = 'auto';
  audioEl.loop = false;
  audioEl.volume = clampVolume(volume);

  let mediaSource = null;
  let gainNode = null;

  try {
    mediaSource = ctx.createMediaElementSource(audioEl);
    gainNode = ctx.createGain();
    gainNode.gain.value = clampVolume(volume);
    mediaSource.connect(gainNode);
    gainNode.connect(ctx.destination);
  } catch (error) {
    console.warn('⚠️ Failed to connect audio element to Web Audio context', error);
  }

  const syncPlayback = () => {
    if (!audioEl || audioEl.ended) {
      return;
    }

    try {
      const difference = Math.abs(audioEl.currentTime - video.currentTime);
      if (difference > 0.06) {
        audioEl.currentTime = video.currentTime;
      }
      const playPromise = audioEl.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(err => {
          console.warn('⚠️ Unable to start VisiCell audio playback', err);
        });
      }
    } catch (error) {
      console.warn('⚠️ Error syncing VisiCell audio playback', error);
    }
  };

  const handlePause = () => {
    try {
      audioEl.pause();
    } catch (error) {
      console.warn('⚠️ Error pausing VisiCell audio playback', error);
    }
  };

  const handleSeeked = () => {
    try {
      audioEl.currentTime = video.currentTime;
    } catch (error) {
      console.warn('⚠️ Error seeking VisiCell audio playback', error);
    }
  };

  video.addEventListener('play', syncPlayback);
  video.addEventListener('pause', handlePause);
  video.addEventListener('seeking', handleSeeked);
  video.addEventListener('ended', handlePause);

  const cleanup = () => {
    video.removeEventListener('play', syncPlayback);
    video.removeEventListener('pause', handlePause);
    video.removeEventListener('seeking', handleSeeked);
    video.removeEventListener('ended', handlePause);

    try {
      audioEl.pause();
      audioEl.src = '';
    } catch (error) {
      console.warn('⚠️ Error stopping VisiCell audio playback', error);
    }

    try {
      if (mediaSource) mediaSource.disconnect();
      if (gainNode) gainNode.disconnect();
    } catch (error) {
      console.warn('⚠️ Error disconnecting VisiCell audio nodes', error);
    }
  };

  return { cleanup, audioEl };
}

export function showVisiCellVideo(options = {}) {
  const {
    video,
    audio,
    title = 'KEY FILE',
    onComplete,
    onClose,
    audioVolume
  } = options;

  if (typeof document === 'undefined') {
    console.warn('⚠️ VisiCell video modal unavailable in this environment');
    if (typeof onComplete === 'function') onComplete('unavailable');
    if (typeof onClose === 'function') onClose('unavailable');
    return Promise.resolve(null);
  }

  if (!video) {
    if (typeof onComplete === 'function') onComplete('missing-video');
    if (typeof onClose === 'function') onClose('missing-video');
    return Promise.resolve(null);
  }

  if (activeModal && typeof activeModal.close === 'function') {
    activeModal.close({ reason: 'replace' });
  }

  return new Promise((resolve) => {
    const overlay = createOverlay();
    const { windowEl, closeBtn } = createWindow({ title });
    const videoEl = createVideoElement(video);
    let resolved = false;

    const { cleanup: cleanupAudio } = attachAudioToVideo(videoEl, audio, { volume: audioVolume });

    const finish = (reason) => {
      if (resolved) return;
      resolved = true;
      if (typeof onComplete === 'function') onComplete(reason);
      if (typeof onClose === 'function') onClose(reason);
      resolve({ reason });
    };

    const closeOverlay = ({ reason = 'complete' } = {}) => {
      if (!overlay.isConnected || overlay.dataset.active !== 'true') {
        return;
      }

      overlay.dataset.active = 'false';
      videoEl.pause();
      cleanupAudio();

      overlay.style.opacity = '0';
      window.setTimeout(() => {
        overlay.remove();
        if (activeModal === modalState) {
          activeModal = null;
        }
        if (reason !== 'replace') {
          finish(reason);
        }
      }, 600);
    };

    const modalState = {
      close: closeOverlay,
      overlay,
      video: videoEl
    };

    activeModal = modalState;

    closeBtn.addEventListener('click', () => closeOverlay({ reason: 'dismissed' }));
    videoEl.addEventListener('ended', () => closeOverlay({ reason: 'ended' }), { once: true });
    videoEl.addEventListener('error', () => closeOverlay({ reason: 'error' }), { once: true });

    windowEl.appendChild(videoEl);
    overlay.appendChild(windowEl);
    document.body.appendChild(overlay);

    const playPromise = videoEl.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(err => {
        console.warn('⚠️ Autoplay blocked for VisiCell video', err);
      });
    }
  });
}

export default showVisiCellVideo;
