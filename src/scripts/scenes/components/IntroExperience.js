/**
 * IntroExperience orchestrates the 2D → 3D reveal for the componentised build.
 *
 * Responsibilities:
 * - Stage the complete 2D celli.os UI in the centre of the screen.
 * - Provide a gradient overlay card describing the boot process.
 * - Collapse the 2D shell to the corner and fade the overlay to reveal 3D.
 * - Call a reveal callback so the mainframe can begin constructing Celli's home.
 */

export class IntroExperience {
  constructor({ uiManager, sheetId = 'sheet', overlayId = 'introOverlay' } = {}) {
    this.uiManager = uiManager;
    this.sheetId = sheetId;
    this.overlayId = overlayId;

    this.state = {
      overlay: null,
      sheet: null,
      titleEl: null,
      statusEl: null
    };

    this.revealCallback = null;
  }

  async init() {
    this.state.sheet = document.getElementById(this.sheetId);
    this.state.overlay = this._ensureOverlay();
    this.state.titleEl = this.state.overlay?.querySelector('.celli-os-title') || null;
    this.state.statusEl = this.state.overlay?.querySelector('.celli-os-status') || null;

    this.show2DScreen(true);
    return true;
  }

  setRevealCallback(callback) {
    this.revealCallback = typeof callback === 'function' ? callback : null;
  }

  setStatus(message) {
    if (this.state.statusEl) {
      this.state.statusEl.textContent = message;
    }
  }

  show2DScreen(initial = false) {
    if (!this.state.sheet) {
      this.state.sheet = document.getElementById(this.sheetId);
    }
    const sheet = this.state.sheet;
    if (!sheet) return;

    // Allow UI manager to toggle visibility for ancillary elements
    this.uiManager?.showSpreadsheet?.();
    this.uiManager?.hideDPad?.();
    this.uiManager?.hideWindows?.();

    sheet.style.display = 'flex';
    sheet.style.position = 'fixed';
    sheet.style.left = '50%';
    sheet.style.top = '50%';
    sheet.style.bottom = 'auto';
    sheet.style.transform = 'translate(-50%, -50%)';
    sheet.style.width = '860px';
    sheet.style.height = '520px';
    sheet.style.zIndex = '9500';
    sheet.style.transition = 'all 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)';

    if (initial) {
      this.setStatus('Terminal handshake queued.');
    }

    if (this.state.overlay) {
      this.state.overlay.style.display = 'flex';
      this.state.overlay.style.opacity = '1';
      this.state.overlay.style.pointerEvents = 'none';
    }
  }

  async collapseToCorner() {
    const sheet = this.state.sheet || document.getElementById(this.sheetId);
    if (!sheet) return;

    sheet.classList.remove('intro-centered');
    sheet.style.left = '16px';
    sheet.style.top = 'auto';
    sheet.style.bottom = '16px';
    sheet.style.transform = 'translate(0, 0)';
    sheet.style.width = '760px';
    sheet.style.height = '440px';

    this.setStatus('Shell collapsing. Preparing world reveal...');

    await new Promise((resolve) => setTimeout(resolve, 900));
  }

  async revealWorld() {
    let callbackResult = null;
    if (this.revealCallback) {
      try {
        callbackResult = this.revealCallback();
      } catch (err) {
        console.warn('[IntroExperience] Reveal callback failed', err);
      }
    }

    if (this.state.overlay) {
      this.state.overlay.style.opacity = '0';
      this.state.overlay.style.pointerEvents = 'none';
    }

    await new Promise((resolve) => setTimeout(resolve, 900));

    if (this.state.overlay) {
      this.state.overlay.style.display = 'none';
    }

    return callbackResult;
  }

  destroy() {
    if (this.state.overlay && this.state.overlay.parentNode) {
      this.state.overlay.parentNode.removeChild(this.state.overlay);
    }
    this.state.overlay = null;
    this.state.sheet = null;
  }

  _ensureOverlay() {
    let overlay = document.getElementById(this.overlayId);
    if (overlay) {
      return overlay;
    }

    overlay = document.createElement('div');
    overlay.id = this.overlayId;
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'linear-gradient(135deg, rgba(30,58,138,0.92) 0%, rgba(59,130,246,0.88) 45%, rgba(147,197,253,0.72) 100%)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9000';
    overlay.style.pointerEvents = 'none';
    overlay.style.opacity = '1';
    overlay.style.transition = 'opacity 0.9s ease';

    const card = document.createElement('div');
    card.className = 'celli-os-window';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.alignItems = 'center';
    card.style.gap = '12px';
    card.style.padding = '28px 36px';
    card.style.background = 'rgba(15,23,42,0.45)';
    card.style.border = '1px solid rgba(255,255,255,0.18)';
    card.style.borderRadius = '24px';
    card.style.backdropFilter = 'blur(12px)';
    card.style.webkitBackdropFilter = 'blur(12px)';
    card.style.color = '#e5e7eb';
    card.style.boxShadow = '0 25px 60px rgba(15,23,42,0.45)';
    card.style.pointerEvents = 'none';

    card.innerHTML = `
      <div class="celli-os-badge" style="font-size:14px;letter-spacing:0.35em;text-transform:uppercase;opacity:.8;">celli.os</div>
      <div class="celli-os-title" style="font-size:22px;font-weight:600;">Booting console UI</div>
      <p class="celli-os-status" style="margin:0;font-size:14px;max-width:320px;text-align:center;opacity:.75;">
        Terminal handshake queued.
      </p>
    `;

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    return overlay;
  }
}

export default IntroExperience;
