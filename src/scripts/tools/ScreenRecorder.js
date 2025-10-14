/**
 * Screen Recorder Module
 * Records the entire viewport to an animated GIF
 * Features: configurable duration, delay start, show/hide cursor and UI
 */

export class ScreenRecorder {
  constructor() {
    this.isRecording = false;
    this.frames = [];
    this.gif = null;
    this.startTime = null;
    this.recordingInterval = null;
    this.delayTimeout = null;
    
    // Default settings
    this.settings = {
      duration: 10,        // seconds
      delay: 0,            // seconds
      fps: 10,             // frames per second
      showCursor: true,
      showUI: false,
      quality: 10,         // GIF quality (1-30, lower is better)
      format: 'gif',       // 'gif' or 'mp4'
      resolution: '1080p'  // '1080p', '720p', or 'native'
    };
    
    // MP4 recording
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.mp4RenderActive = false;
    
    // UI elements
    this.panel = null;
    this.btn = null;
    this.statusText = null;
    this.progressBar = null;
    
    // Cursor tracking
    this.cursorPos = { x: 0, y: 0 };
    this.cursorVisible = true;
    
    // Canvas detection
    this.detectedCanvas = null;
    this.canvasDetectionInterval = null;
    
    this.init();
  }
  
  init() {
    this.createUI();
    this.setupEventListeners();
    this.trackCursor();
    
    // Detect canvas on initialization and periodically
    this.detectCanvas();
    this.canvasDetectionInterval = setInterval(() => this.detectCanvas(), 2000); // Check every 2 seconds
    
    console.log('🎥 Screen Recorder initialized - Persistent across all scenes');
  }
  
  detectCanvas() {
    const canvas = this.findBestCanvas();
    
    if (canvas && canvas !== this.detectedCanvas) {
      this.detectedCanvas = canvas;
      console.log(`📹 Screen Recorder: Using canvas ${canvas.width}x${canvas.height}` + 
                  (canvas.id ? ` (${canvas.id})` : ''));
    }
    
    return this.detectedCanvas;
  }
  
  findBestCanvas() {
    // Try #view first
    let mainCanvas = document.getElementById('view');
    
    // If #view doesn't exist or is just default size, find the actual rendering canvas
    if (!mainCanvas || (mainCanvas.width === 300 && mainCanvas.height === 150)) {
      const allCanvases = document.querySelectorAll('canvas');
      let largestCanvas = null;
      let largestArea = 0;
      
      allCanvases.forEach(canvas => {
        const area = canvas.width * canvas.height;
        const isVisible = getComputedStyle(canvas).display !== 'none';
        
        // Skip tiny canvases (probably not the main renderer)
        if (area > 45000 && isVisible && area > largestArea) {
          largestArea = area;
          largestCanvas = canvas;
        }
      });
      
      if (largestCanvas) {
        return largestCanvas;
      }
    }
    
    return mainCanvas;
  }
  
  getTargetDimensions() {
    // Get target width/height based on resolution setting
    const sourceCanvas = this.detectedCanvas || this.findBestCanvas();
    if (!sourceCanvas) {
      return { width: 1920, height: 1080 };
    }
    
    const sourceWidth = sourceCanvas.width;
    const sourceHeight = sourceCanvas.height;
    const aspectRatio = sourceWidth / sourceHeight;
    
    if (this.settings.resolution === '1080p') {
      return { 
        width: 1920, 
        height: 1080 
      };
    } else if (this.settings.resolution === '720p') {
      return { 
        width: 1280, 
        height: 720 
      };
    } else {
      // Native resolution
      return { 
        width: sourceWidth, 
        height: sourceHeight 
      };
    }
  }
  
  
  createUI() {
    // Create recorder button
    this.btn = document.createElement('button');
    this.btn.id = 'recorderBtn';
    this.btn.className = 'recorder-btn';
    this.btn.innerHTML = '🎥 Record';
    document.body.appendChild(this.btn);
    
    // Create recorder panel
    this.panel = document.createElement('div');
    this.panel.id = 'recorderPanel';
    this.panel.className = 'recorder-panel';
    this.panel.innerHTML = `
      <h3>Screen Recorder</h3>
      
      <div class="recorder-setting">
        <label for="recDuration">Duration (seconds): <span id="durValue">${this.settings.duration}</span>s</label>
        <input type="range" id="recDuration" min="1" max="30" value="${this.settings.duration}" step="1">
      </div>
      
      <div class="recorder-setting">
        <label for="recDelay">Delay Start (seconds): <span id="delayValue">${this.settings.delay}</span>s</label>
        <input type="range" id="recDelay" min="0" max="10" value="${this.settings.delay}" step="1">
      </div>
      
      <div class="recorder-setting">
        <label for="recQuality">Quality (FPS): <span id="qualityValue">${this.settings.fps}</span></label>
        <input type="range" id="recQuality" min="5" max="30" value="${this.settings.fps}" step="5">
      </div>
      
      <div class="recorder-checkbox">
        <input type="checkbox" id="recShowCursor" ${this.settings.showCursor ? 'checked' : ''}>
        <label for="recShowCursor">Show Cursor</label>
      </div>
      
      <div class="recorder-checkbox">
        <input type="checkbox" id="recShowUI" ${this.settings.showUI ? 'checked' : ''}>
        <label for="recShowUI">Show UI Elements (buttons, controls)</label>
      </div>
      
      <div class="recorder-setting">
        <label for="recFormat">Format:</label>
        <select id="recFormat" style="width:100%;padding:8px;background:#191a23;border:1px solid rgba(255,255,255,.1);border-radius:6px;color:#e8e8ee;font-size:13px;margin-top:6px;">
          <option value="gif">GIF (Animated)</option>
          <option value="mp4">MP4 (Video - WebM)</option>
        </select>
      </div>
      
      <div class="recorder-setting">
        <label for="recResolution">Resolution:</label>
        <select id="recResolution" style="width:100%;padding:8px;background:#191a23;border:1px solid rgba(255,255,255,.1);border-radius:6px;color:#e8e8ee;font-size:13px;margin-top:6px;">
          <option value="1080p">1080p (1920x1080) - Standard HD</option>
          <option value="720p">720p (1280x720) - HD</option>
          <option value="native">Native (Full Resolution)</option>
        </select>
      </div>
      
      <div class="recorder-actions">
        <button id="recStart" class="btn btn-start">Start</button>
        <button id="recCancel" class="btn">Close</button>
      </div>
      
      <div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,.1);">
        <button id="recMobilePreview" class="btn" style="width:100%;background:#9b59b6;margin-bottom:8px;">📱 Mobile Preview</button>
        <button id="recClearCache" class="btn" style="width:100%;background:#e74c3c;">🔄 Clear Cache & Reload</button>
        <p style="font-size:11px;color:rgba(255,255,255,.6);margin:8px 0 0 0;text-align:center;">Use if recording shows black screen</p>
      </div>
      
      <div id="recStatus" class="recorder-status">
        <div id="recStatusText">Ready</div>
        <div class="recorder-progress">
          <div id="recProgressBar" class="recorder-progress-bar"></div>
        </div>
      </div>
    `;
    document.body.appendChild(this.panel);
    
    // Cache status elements after panel is in DOM
    setTimeout(() => {
      this.statusText = this.panel?.querySelector('#recStatusText');
      this.progressBar = this.panel?.querySelector('#recProgressBar');
      
      if (!this.statusText || !this.progressBar) {
        console.warn('⚠️ Screen recorder status elements not found');
      }
    }, 0);
  }
  
  setupEventListeners() {
    // Toggle panel
    if (this.btn) {
      this.btn.addEventListener('click', () => this.togglePanel());
    }
    
    // Settings - use querySelector on panel for safety
    const durSlider = this.panel?.querySelector('#recDuration');
    const durValue = this.panel?.querySelector('#durValue');
    if (durSlider && durValue) {
      durSlider.addEventListener('input', (e) => {
        this.settings.duration = parseInt(e.target.value);
        durValue.textContent = this.settings.duration;
      });
    }
    
    const delaySlider = this.panel?.querySelector('#recDelay');
    const delayValue = this.panel?.querySelector('#delayValue');
    if (delaySlider && delayValue) {
      delaySlider.addEventListener('input', (e) => {
        this.settings.delay = parseInt(e.target.value);
        delayValue.textContent = this.settings.delay;
      });
    }
    
    const qualitySlider = this.panel?.querySelector('#recQuality');
    const qualityValue = this.panel?.querySelector('#qualityValue');
    if (qualitySlider && qualityValue) {
      qualitySlider.addEventListener('input', (e) => {
        this.settings.fps = parseInt(e.target.value);
        this.settings.quality = 30 - e.target.value; // Invert for GIF.js quality
        qualityValue.textContent = this.settings.fps;
      });
    }
    
    const showCursor = this.panel?.querySelector('#recShowCursor');
    if (showCursor) {
      showCursor.addEventListener('change', (e) => {
        this.settings.showCursor = e.target.checked;
      });
    }
    
    const showUI = this.panel?.querySelector('#recShowUI');
    if (showUI) {
      showUI.addEventListener('change', (e) => {
        this.settings.showUI = e.target.checked;
      });
    }
    
    const formatSelect = this.panel?.querySelector('#recFormat');
    if (formatSelect) {
      formatSelect.addEventListener('change', (e) => {
        this.settings.format = e.target.value;
        console.log(`📹 Format changed to: ${this.settings.format}`);
      });
    }
    
    const resolutionSelect = this.panel?.querySelector('#recResolution');
    if (resolutionSelect) {
      resolutionSelect.addEventListener('change', (e) => {
        this.settings.resolution = e.target.value;
        console.log(`📐 Resolution changed to: ${this.settings.resolution}`);
      });
    }
    
    // Actions
    const startBtn = this.panel?.querySelector('#recStart');
    const cancelBtn = this.panel?.querySelector('#recCancel');
    const clearCacheBtn = this.panel?.querySelector('#recClearCache');
    const mobilePreviewBtn = this.panel?.querySelector('#recMobilePreview');
    
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startRecording());
    }
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.closePanel());
    }
    
    if (clearCacheBtn) {
      clearCacheBtn.addEventListener('click', () => this.clearCacheAndReload());
    }
    
    if (mobilePreviewBtn) {
      mobilePreviewBtn.addEventListener('click', () => this.openMobilePreview());
    }
  }
  
  openMobilePreview() {
    console.log('📱 Opening mobile preview...');
    
    // Create mobile preview modal
    const modal = document.createElement('div');
    modal.className = 'mobile-preview-overlay';
    modal.innerHTML = `
      <div class="mobile-preview-dialog">
        <div class="mobile-preview-header">
          <h3>📱 Mobile Preview</h3>
          <button class="mobile-preview-close">✕</button>
        </div>
        <div class="mobile-preview-body">
          <p>Resize canvas to mobile-friendly dimensions for testing and recording.</p>
          
          <div class="mobile-preset-grid">
            <button class="mobile-preset" data-width="375" data-height="667">
              <div class="preset-name">iPhone SE</div>
              <div class="preset-size">375 × 667</div>
            </button>
            <button class="mobile-preset" data-width="390" data-height="844">
              <div class="preset-name">iPhone 14</div>
              <div class="preset-size">390 × 844</div>
            </button>
            <button class="mobile-preset" data-width="393" data-height="873">
              <div class="preset-name">Pixel 7</div>
              <div class="preset-size">393 × 873</div>
            </button>
            <button class="mobile-preset" data-width="360" data-height="640">
              <div class="preset-name">Android</div>
              <div class="preset-size">360 × 640</div>
            </button>
            <button class="mobile-preset" data-width="414" data-height="896">
              <div class="preset-name">iPhone Pro Max</div>
              <div class="preset-size">414 × 896</div>
            </button>
            <button class="mobile-preset" data-width="768" data-height="1024">
              <div class="preset-name">iPad</div>
              <div class="preset-size">768 × 1024</div>
            </button>
          </div>
          
          <div style="margin-top:16px;padding:12px;background:rgba(255,255,255,.05);border-radius:8px;">
            <div class="recorder-checkbox" style="margin-bottom:8px;">
              <input type="checkbox" id="enableTouchDevice">
              <label for="enableTouchDevice">Enable Touch Device Mode</label>
            </div>
            <p style="font-size:11px;color:rgba(255,255,255,.6);margin:0;">Triggers mobile-specific behaviors and touch controls in the app.</p>
          </div>
          
          <button class="btn" id="resetToDesktop" style="width:100%;margin-top:12px;background:#3498db;">🖥️ Reset to Desktop</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate in
    requestAnimationFrame(() => {
      modal.classList.add('active');
    });
    
    // Setup handlers
    const closeBtn = modal.querySelector('.mobile-preview-close');
    const presets = modal.querySelectorAll('.mobile-preset');
    const resetBtn = modal.querySelector('#resetToDesktop');
    const touchToggle = modal.querySelector('#enableTouchDevice');
    
    const closeModal = () => {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    };
    
    closeBtn.addEventListener('click', closeModal);
    
    presets.forEach(preset => {
      preset.addEventListener('click', () => {
        const width = parseInt(preset.dataset.width);
        const height = parseInt(preset.dataset.height);
        this.setMobileViewport(width, height, touchToggle.checked);
        closeModal();
      });
    });
    
    resetBtn.addEventListener('click', () => {
      this.resetToDesktop();
      closeModal();
    });
  }
  
  setMobileViewport(width, height, enableTouch = false) {
    console.log(`📱 Setting mobile viewport: ${width}x${height}, touch: ${enableTouch}`);
    
    // Find the actual canvas
    const canvas = this.detectedCanvas || this.findBestCanvas();
    if (!canvas) {
      alert('Canvas not found');
      return;
    }
    
    // Store original dimensions
    if (!this.originalCanvasDimensions) {
      this.originalCanvasDimensions = {
        width: canvas.width,
        height: canvas.height,
        style: canvas.style.cssText
      };
    }
    
    // Resize canvas
    canvas.width = width;
    canvas.height = height;
    canvas.style.maxWidth = width + 'px';
    canvas.style.maxHeight = height + 'px';
    canvas.style.border = '2px solid #9b59b6';
    canvas.style.margin = 'auto';
    
    // Update renderer if available
    if (window.THREE) {
      // Try to find and update the renderer
      const scenes = [window.currentScene, window.introScene];
      scenes.forEach(scene => {
        if (scene?.state?.renderer) {
          scene.state.renderer.setSize(width, height);
          console.log('✅ Renderer resized');
        }
        if (scene?.state?.camera) {
          scene.state.camera.aspect = width / height;
          scene.state.camera.updateProjectionMatrix();
          console.log('✅ Camera updated');
        }
      });
    }
    
    // Enable touch device mode
    if (enableTouch) {
      window.isTouchDevice = true;
      document.body.classList.add('touch-device');
      console.log('📱 Touch device mode enabled');
    }
    
    // Show toast
    this.showToast(`📱 Mobile preview: ${width}x${height}${enableTouch ? ' (Touch enabled)' : ''}`);
  }
  
  resetToDesktop() {
    console.log('🖥️ Resetting to desktop...');
    
    const canvas = this.detectedCanvas || this.findBestCanvas();
    if (!canvas) return;
    
    // Restore original dimensions
    if (this.originalCanvasDimensions) {
      canvas.width = this.originalCanvasDimensions.width;
      canvas.height = this.originalCanvasDimensions.height;
      canvas.style.cssText = this.originalCanvasDimensions.style;
      
      // Update renderer
      if (window.THREE) {
        const scenes = [window.currentScene, window.introScene];
        scenes.forEach(scene => {
          if (scene?.state?.renderer) {
            scene.state.renderer.setSize(canvas.width, canvas.height);
          }
          if (scene?.state?.camera) {
            scene.state.camera.aspect = canvas.width / canvas.height;
            scene.state.camera.updateProjectionMatrix();
          }
        });
      }
      
      this.originalCanvasDimensions = null;
    } else {
      // Fallback to window size
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.cssText = '';
      
      if (window.THREE) {
        const scenes = [window.currentScene, window.introScene];
        scenes.forEach(scene => {
          if (scene?.state?.renderer) {
            scene.state.renderer.setSize(window.innerWidth, window.innerHeight);
          }
          if (scene?.state?.camera) {
            scene.state.camera.aspect = window.innerWidth / window.innerHeight;
            scene.state.camera.updateProjectionMatrix();
          }
        });
      }
    }
    
    // Disable touch mode
    window.isTouchDevice = false;
    document.body.classList.remove('touch-device');
    
    this.showToast('🖥️ Desktop mode restored');
  }
  
  clearCacheAndReload() {
    console.log('🔄 Clearing cache and reloading...');
    
    // Show confirmation
    const confirmed = confirm(
      '🔄 Clear Cache & Reload\n\n' +
      'This will:\n' +
      '• Clear the browser cache\n' +
      '• Force reload all resources\n' +
      '• Reset the WebGL renderer\n\n' +
      'Continue?'
    );
    
    if (!confirmed) return;
    
    // Clear service workers if any
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(reg => reg.unregister());
      });
    }
    
    // Clear cache storage
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }
    
    // Hard reload with cache clear
    window.location.reload(true);
  }
  
  trackCursor() {
    document.addEventListener('mousemove', (e) => {
      this.cursorPos.x = e.clientX;
      this.cursorPos.y = e.clientY;
      this.cursorVisible = true;
    });
    
    document.addEventListener('mouseleave', () => {
      this.cursorVisible = false;
    });
  }
  
  togglePanel() {
    if (this.isRecording) return; // Don't toggle during recording
    
    if (this.panel.classList.contains('active')) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }
  
  openPanel() {
    this.panel.classList.add('active');
    
    // Add test capture button if not already present
    if (!this.panel.querySelector('#recTestCapture')) {
      const testBtn = document.createElement('button');
      testBtn.id = 'recTestCapture';
      testBtn.className = 'btn';
      testBtn.textContent = '🔍 Test Capture';
      testBtn.style.cssText = 'margin-top: 8px; width: 100%; background: #3498db;';
      testBtn.onclick = () => this.testCapture();
      
      const actions = this.panel.querySelector('.recorder-actions');
      if (actions) {
        actions.parentNode.insertBefore(testBtn, actions);
      }
    }
  }
  
  async testCapture() {
    console.log('🧪 Running comprehensive test...');
    
    // Find ALL canvases for debugging
    const allCanvases = document.querySelectorAll('canvas');
    console.log(`📊 Found ${allCanvases.length} canvas element(s)`);
    
    allCanvases.forEach((canvas, i) => {
      const area = canvas.width * canvas.height;
      console.log(`Canvas ${i}:`, {
        id: canvas.id || '(no id)',
        width: canvas.width,
        height: canvas.height,
        area: area,
        visible: getComputedStyle(canvas).display !== 'none'
      });
    });
    
    // Use detected canvas
    const mainCanvas = this.detectCanvas();
    
    if (!mainCanvas) {
      alert('❌ No canvas found!\n\nNo rendering canvas detected.\nCheck console for details.');
      return;
    }
    
    console.log(`✅ Testing canvas: ${mainCanvas.width}x${mainCanvas.height}` + 
                (mainCanvas.id ? ` (${mainCanvas.id})` : ''));
    
    // Check if canvas has a WebGL context
    let hasWebGL = false;
    let preserveDrawingBuffer = false;
    try {
      const testCtx = mainCanvas.getContext('webgl') || mainCanvas.getContext('webgl2');
      hasWebGL = !!testCtx;
      console.log('🎮 WebGL context:', hasWebGL ? 'Available' : 'Not available');
      
      if (testCtx) {
        const params = testCtx.getContextAttributes();
        preserveDrawingBuffer = params.preserveDrawingBuffer;
        console.log('🔧 WebGL attributes:', params);
        console.log(`⚠️ preserveDrawingBuffer: ${preserveDrawingBuffer}`);
        
        if (!preserveDrawingBuffer) {
          console.error('❌ preserveDrawingBuffer is FALSE - this is why recording is black!');
          console.error('💡 Click "🔄 Clear Cache & Reload" to fix this');
        }
      }
    } catch (e) {
      console.error('Error checking WebGL:', e);
    }
    
    // Try to capture
    const testCanvas = document.createElement('canvas');
    const ctx = testCanvas.getContext('2d');
    testCanvas.width = mainCanvas.width;
    testCanvas.height = mainCanvas.height;
    
    try {
      ctx.drawImage(mainCanvas, 0, 0);
      console.log('✅ drawImage succeeded');
      
      // Check for content
      const imageData = ctx.getImageData(0, 0, testCanvas.width, testCanvas.height);
      const nonZero = imageData.data.filter(v => v !== 0).length;
      const percent = (nonZero / imageData.data.length * 100).toFixed(2);
      
      console.log(`📊 Non-zero pixels: ${percent}%`);
      
      // Determine the issue
      let diagnosis = '';
      if (mainCanvas.width === 300 && mainCanvas.height === 150) {
        diagnosis = '❌ CANVAS NOT INITIALIZED!\nRenderer hasn\'t been created yet.\nWait for scene to load or reload page.';
      } else if (!preserveDrawingBuffer) {
        diagnosis = '❌ preserveDrawingBuffer is FALSE!\nThis is why recording is black.\nClick "🔄 Clear Cache & Reload" to fix!';
      } else if (percent === '0.00') {
        diagnosis = '❌ Canvas is black - not rendering!\nScene may not have started yet.';
      } else if (percent < '1') {
        diagnosis = '⚠️ Very little content detected.\nMay need more time to render.';
      } else {
        diagnosis = '✅ Content detected! Recording should work!';
      }
      
      // Create report
      const report = `
🧪 TEST CAPTURE REPORT
━━━━━━━━━━━━━━━━━━━━━━
Canvas ID: ${mainCanvas.id}
Size: ${mainCanvas.width}x${mainCanvas.height}
WebGL: ${hasWebGL ? 'Yes' : 'No'}
preserveDrawingBuffer: ${preserveDrawingBuffer ? 'TRUE ✅' : 'FALSE ❌'}
Non-zero pixels: ${percent}%

${diagnosis}
      `;
      
      console.log(report);
      
      // Create a data URL to display
      const dataUrl = testCanvas.toDataURL('image/png');
      
      // Open in new tab
      const win = window.open();
      if (win) {
        win.document.write(`
          <html>
            <head><title>Test Capture</title></head>
            <body style="margin:0;background:#222;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:monospace;color:#fff;">
              <div style="text-align:center;max-width:90vw;">
                <h2>🧪 Test Capture Result</h2>
                <pre style="text-align:left;background:#111;padding:20px;border-radius:8px;overflow:auto;">${report}</pre>
                <div style="margin-top:20px;background:#000;padding:20px;border-radius:8px;">
                  <img src="${dataUrl}" style="max-width:100%;max-height:60vh;border:2px solid #fff;" />
                </div>
                <p style="margin-top:20px;font-size:12px;opacity:0.7;">Check browser console for detailed diagnostics</p>
              </div>
            </body>
          </html>
        `);
      }
      
      alert(report);
      
    } catch (error) {
      console.error('❌ Test capture failed:', error);
      alert(`Test capture failed: ${error.message}\n\nThis usually means:\n- Canvas has no WebGL context\n- Canvas is tainted (CORS)\n- Canvas is not rendering`);
    }
  }
  
  closePanel() {
    if (!this.isRecording) {
      this.panel.classList.remove('active');
    }
  }
  
  async startRecording() {
    if (this.isRecording) return;
    
    // Detect/refresh canvas and wait if needed
    let mainCanvas = this.detectCanvas();
    
    // If canvas is not ready (300x150), wait up to 5 seconds
    if (!mainCanvas || (mainCanvas.width === 300 && mainCanvas.height === 150)) {
      console.log('⏳ Canvas not ready, waiting up to 5 seconds...');
      
      for (let i = 0; i < 10; i++) {
        await this.sleep(500);
        mainCanvas = this.detectCanvas();
        
        if (mainCanvas && mainCanvas.width !== 300 && mainCanvas.height !== 150) {
          console.log('✅ Canvas ready!');
          break;
        }
      }
    }
    
    if (!mainCanvas) {
      alert('❌ Canvas not found!\n\nNo rendering canvas detected. Make sure the scene is loaded.');
      return;
    }
    
    // Final check
    if (mainCanvas.width === 300 && mainCanvas.height === 150) {
      const proceed = confirm(
        '⚠️ Warning: Canvas Not Initialized\n\n' +
        'The canvas is still at default size (300x150).\n' +
        'Recording will likely be black.\n\n' +
        'Tips:\n' +
        '• Make sure a scene is actually running\n' +
        '• Click "🔄 Clear Cache & Reload" button\n' +
        '• Wait a few seconds after scene loads\n\n' +
        'Continue anyway?'
      );
      
      if (!proceed) return;
    }
    
    console.log('🎬 Starting recording with settings:', this.settings);
    console.log(`📐 Canvas size: ${mainCanvas.width}x${mainCanvas.height}`);
    
    // Show status
    const statusDiv = this.panel?.querySelector('#recStatus');
    if (statusDiv) {
      statusDiv.classList.add('active');
    }
    
    if (this.btn) {
      this.btn.classList.add('recording');
    }
    
    // Delay start if configured
    if (this.settings.delay > 0) {
      if (this.statusText) {
        this.statusText.textContent = `Starting in ${this.settings.delay}s...`;
      }
      
      for (let i = this.settings.delay; i > 0; i--) {
        if (this.statusText) {
          this.statusText.textContent = `Starting in ${i}s...`;
        }
        await this.sleep(1000);
      }
    }
    
    // Hide recorder UI (always hide during recording)
    this.hideRecorderUI();
    
    // Hide other UI if requested
    if (!this.settings.showUI) {
      this.hideAllUI();
    }
    
    // Start recording based on format
    this.isRecording = true;
    this.startTime = Date.now();
    
    if (this.statusText) {
      this.statusText.textContent = 'Recording...';
    }
    
    if (this.settings.format === 'mp4') {
      // MP4 recording using MediaRecorder
      await this.startMP4Recording();
    } else {
      // GIF recording using frame capture
      this.startGIFRecording();
    }
  }
  
  startGIFRecording() {
    this.frames = [];
    const frameInterval = 1000 / this.settings.fps;
    const totalFrames = this.settings.duration * this.settings.fps;
    let frameCount = 0;
    
    this.recordingInterval = setInterval(async () => {
      await this.captureFrame();
      frameCount++;
      
      // Update progress
      const progress = (frameCount / totalFrames) * 100;
      if (this.progressBar) {
        this.progressBar.style.width = `${progress}%`;
      }
      
      // Check if done
      if (frameCount >= totalFrames) {
        this.stopRecording();
      }
    }, frameInterval);
  }
  
  async startMP4Recording() {
    console.log('🎬 Starting MP4 recording...');
    
    try {
      // Use detected canvas or find one
      const sourceCanvas = this.detectedCanvas || this.findBestCanvas();
      
      // Check if we have a proper canvas or need DOM capture
      const isDOMMode = !sourceCanvas || (sourceCanvas.width === 300 && sourceCanvas.height === 150);
      
      if (isDOMMode) {
        console.log('📸 DOM-only mode detected - using frame capture for MP4');
        // Use GIF-style frame capture instead of streaming
        this.startGIFRecording(); // Will be converted to MP4 later
        return;
      }
      
      console.log(`📹 Recording from canvas: ${sourceCanvas.width}x${sourceCanvas.height}`);
      
      // Get target dimensions
      const targetDims = this.getTargetDimensions();
      console.log(`📐 Output resolution: ${targetDims.width}x${targetDims.height}`);
      
      // Create an output canvas at target resolution for scaling
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = targetDims.width;
      outputCanvas.height = targetDims.height;
      const outputCtx = outputCanvas.getContext('2d', { willReadFrequently: true });
      
      // Create a stream from the output canvas
      const stream = outputCanvas.captureStream(this.settings.fps);
      
      // Start a rendering loop to copy and scale from source to output
      this.mp4RenderActive = true;
      const renderFrame = () => {
        if (!this.mp4RenderActive) return;
        
        // Clear
        outputCtx.fillStyle = '#000000';
        outputCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
        
        // Draw scaled source
        outputCtx.drawImage(sourceCanvas, 0, 0, outputCanvas.width, outputCanvas.height);
        
        // Draw cursor if enabled
        if (this.settings.showCursor && this.cursorVisible) {
          const scaleX = targetDims.width / window.innerWidth;
          const scaleY = targetDims.height / window.innerHeight;
          this.drawCursor(outputCtx, scaleX, scaleY);
        }
        
        requestAnimationFrame(renderFrame);
      };
      
      renderFrame();
      
      // Check for codec support
      const mimeTypes = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm'
      ];
      
      let selectedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));
      
      if (!selectedMimeType) {
        throw new Error('No supported video format found');
      }
      
      console.log(`📹 Using codec: ${selectedMimeType}`);
      
      // Create MediaRecorder
      this.recordedChunks = [];
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        videoBitsPerSecond: 2500000 // 2.5 Mbps
      });
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.onstop = () => {
        console.log('🎬 MP4 recording stopped');
        this.processMP4();
      };
      
      this.mediaRecorder.onerror = (error) => {
        console.error('❌ MediaRecorder error:', error);
        this.stopRecording();
      };
      
      // Start recording
      this.mediaRecorder.start();
      console.log('✅ MediaRecorder started');
      
      // Set timeout to stop recording
      setTimeout(() => {
        if (this.isRecording) {
          this.stopRecording();
        }
      }, this.settings.duration * 1000);
      
      // Update progress bar
      const startTime = Date.now();
      const updateProgress = () => {
        if (!this.isRecording) return;
        
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min((elapsed / this.settings.duration) * 100, 100);
        
        if (this.progressBar) {
          this.progressBar.style.width = `${progress}%`;
        }
        
        if (elapsed < this.settings.duration) {
          requestAnimationFrame(updateProgress);
        }
      };
      
      requestAnimationFrame(updateProgress);
      
    } catch (error) {
      console.error('❌ Failed to start MP4 recording:', error);
      alert(`MP4 recording failed: ${error.message}\n\nTry using GIF format instead.`);
      this.isRecording = false;
      this.showRecorderUI();
      if (!this.settings.showUI) {
        this.showAllUI();
      }
    }
  }
  
  async captureFrame() {
    try {
      // Capture the Three.js canvas
      const captureCanvas = await this.captureViewport();
      if (!captureCanvas) {
        console.warn('⚠️ Failed to capture viewport - skipping frame');
        return;
      }
      
      // Get target dimensions (for downscaling)
      const targetDims = this.getTargetDimensions();
      
      // Create output canvas at target resolution
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      canvas.width = targetDims.width;
      canvas.height = targetDims.height;
      
      // Fill with black background to avoid white flash
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw the captured Three.js canvas, scaled to target resolution
      ctx.drawImage(captureCanvas, 0, 0, canvas.width, canvas.height);
      
      // Draw cursor if enabled (scaled)
      if (this.settings.showCursor && this.cursorVisible) {
        const scaleX = targetDims.width / window.innerWidth;
        const scaleY = targetDims.height / window.innerHeight;
        this.drawCursor(ctx, scaleX, scaleY);
      }
      
      // Add frame to collection
      this.frames.push({ canvas });
      
    } catch (error) {
      console.error('❌ Error capturing frame:', error);
    }
  }
  
  async captureViewport() {
    // Use detected canvas or find one
    const mainCanvas = this.detectedCanvas || this.findBestCanvas();
    
    // If no proper canvas found (300x150 or null), try DOM capture
    if (!mainCanvas || (mainCanvas.width === 300 && mainCanvas.height === 150)) {
      console.log('📸 No Three.js canvas detected - using DOM screenshot');
      return await this.captureDOMViewport();
    }
    
    // Create a canvas from the current viewport
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Match the main canvas dimensions exactly
    canvas.width = mainCanvas.width;
    canvas.height = mainCanvas.height;
    
    try {
      // Draw the main Three.js canvas directly
      ctx.drawImage(mainCanvas, 0, 0);
      
      // Only log on first frame to reduce spam
      if (this.frames.length === 0) {
        console.log('✅ Frame captured successfully (Canvas mode)');
        console.log(`📐 Canvas size: ${canvas.width}x${canvas.height}`);
        
        // Test if we actually captured something
        const testData = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1);
        const hasContent = testData.data.some(val => val !== 0);
        if (!hasContent) {
          console.warn('⚠️ Canvas appears blank - switching to DOM capture');
          return await this.captureDOMViewport();
        }
      }
      
      return canvas;
      
    } catch (e) {
      console.error('❌ Error drawing canvas:', e);
      console.log('📸 Falling back to DOM capture...');
      
      // Fallback to DOM capture
      return await this.captureDOMViewport();
    }
  }
  
  async captureDOMViewport() {
    // Create canvas from DOM screenshot
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    try {
      // Use html2canvas if available, otherwise basic DOM rasterization
      if (typeof html2canvas !== 'undefined') {
        const screenshot = await html2canvas(document.body, {
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundColor: null,
          logging: false
        });
        
        ctx.drawImage(screenshot, 0, 0);
        
        if (this.frames.length === 0) {
          console.log('✅ DOM captured successfully (html2canvas)');
        }
      } else {
        // Fallback: render visible elements manually
        await this.renderDOMToCanvas(ctx);
        
        if (this.frames.length === 0) {
          console.log('✅ DOM captured successfully (manual render)');
        }
      }
      
      return canvas;
      
    } catch (e) {
      console.error('❌ DOM capture failed:', e);
      
      // Last resort: fill with black
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('DOM Capture Failed', canvas.width / 2, canvas.height / 2);
      
      return canvas;
    }
  }
  
  async renderDOMToCanvas(ctx) {
    // Basic DOM rasterization for fallback
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    
    // Fill with background color
    ctx.fillStyle = getComputedStyle(document.body).backgroundColor || '#000000';
    ctx.fillRect(0, 0, width, height);
    
    // Render visible text elements
    const textElements = document.querySelectorAll('h1, h2, h3, h4, p, span, div, button');
    
    textElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const styles = getComputedStyle(el);
      
      if (styles.display === 'none' || styles.visibility === 'hidden') return;
      if (rect.width === 0 || rect.height === 0) return;
      
      const text = el.textContent?.trim();
      if (!text || text.length > 200) return; // Skip long text blocks
      
      // Draw element background
      if (styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        ctx.fillStyle = styles.backgroundColor;
        ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
      }
      
      // Draw text
      ctx.fillStyle = styles.color || '#ffffff';
      ctx.font = `${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;
      ctx.fillText(text.substring(0, 100), rect.left + 5, rect.top + 20);
    });
  }
  
  drawCursor(ctx, scaleX = 1, scaleY = 1) {
    const x = this.cursorPos.x * scaleX;
    const y = this.cursorPos.y * scaleY;
    
    // Draw a simple arrow cursor
    ctx.save();
    ctx.strokeStyle = '#FFFFFF';
    ctx.fillStyle = '#000000';
    ctx.lineWidth = 1.5;
    
    // Cursor shape (arrow) - scaled
    const scale = Math.min(scaleX, scaleY);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 12 * scale, y + 16 * scale);
    ctx.lineTo(x + 8 * scale, y + 16 * scale);
    ctx.lineTo(x + 12 * scale, y + 24 * scale);
    ctx.lineTo(x + 8 * scale, y + 20 * scale);
    ctx.lineTo(x, y + 18 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  }
  
  stopRecording() {
    if (!this.isRecording) return;
    
    console.log('🛑 Stopping recording...');
    
    this.isRecording = false;
    
    if (this.settings.format === 'mp4') {
      // Stop MP4 recording
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
        console.log('🎬 MediaRecorder stopped');
      }
    } else {
      // Stop GIF recording
      if (this.recordingInterval) {
        clearInterval(this.recordingInterval);
        this.recordingInterval = null;
      }
      
      if (this.statusText) {
        this.statusText.textContent = 'Processing...';
      }
      
      if (this.progressBar) {
        this.progressBar.style.width = '0%';
      }
      
      // Show UI again
      this.showRecorderUI();
      if (!this.settings.showUI) {
        this.showAllUI();
      }
      
      // Generate GIF
      this.generateGIF();
    }
  }
  
  processMP4() {
    console.log('📦 Processing MP4...');
    
    // Stop the render loop
    this.mp4RenderActive = false;
    
    if (this.statusText) {
      this.statusText.textContent = 'Processing video...';
    }
    
    // Show UI again
    this.showRecorderUI();
    if (!this.settings.showUI) {
      this.showAllUI();
    }
    
    try {
      // Create blob from recorded chunks
      const blob = new Blob(this.recordedChunks, {
        type: 'video/webm'
      });
      
      console.log(`✅ Video processed! Size: ${(blob.size / 1024).toFixed(2)} KB`);
      
      // Show save prompt
      this.showSavePrompt(blob, 'mp4');
      
    } catch (error) {
      console.error('❌ Error processing MP4:', error);
      if (this.statusText) {
        this.statusText.textContent = `Error: ${error.message}`;
      }
      setTimeout(() => this.reset(), 3000);
    }
  }
  
  async generateGIF() {
    console.log(`📦 Generating GIF from ${this.frames.length} frames...`);
    
    if (this.frames.length === 0) {
      console.error('❌ No frames captured!');
      if (this.statusText) {
        this.statusText.textContent = 'Error: No frames captured';
      }
      setTimeout(() => this.reset(), 2000);
      return;
    }
    
    if (this.statusText) {
      this.statusText.textContent = 'Generating GIF...';
    }
    
    if (this.progressBar) {
      this.progressBar.style.width = '0%';
    }
    
    try {
      // Load GIF.js dynamically if not available
      if (typeof GIF === 'undefined') {
        console.log('📥 Loading GIF.js library...');
        await this.loadGIFLibrary();
        console.log('✅ GIF.js loaded');
      }
      
      console.log('🔧 Creating GIF encoder...');
      
      // Get target dimensions
      const targetDims = this.getTargetDimensions();
      console.log(`📐 Encoding at: ${targetDims.width}x${targetDims.height}`);
      
      // Create GIF encoder
      this.gif = new GIF({
        workers: 2,
        quality: this.settings.quality,
        workerScript: 'src/assets/js/gif.worker.js', // Local worker to avoid CORS issues
        width: targetDims.width,
        height: targetDims.height,
        debug: true // Enable debug mode
      });
      
      // Add frames
      const delay = 1000 / this.settings.fps;
      console.log(`➕ Adding ${this.frames.length} frames with ${delay}ms delay...`);
      
      this.frames.forEach((frame, index) => {
        try {
          // Use canvas for better compatibility
          this.gif.addFrame(frame.canvas, { 
            delay: delay,
            copy: true // Copy frame data
          });
          
          if (index === 0) {
            console.log('✅ First frame added successfully');
          }
        } catch (e) {
          console.error(`❌ Error adding frame ${index}:`, e);
        }
      });
      
      console.log('🎬 Starting GIF render...');
      
      // Render GIF
      this.gif.on('start', () => {
        console.log('🚀 GIF rendering started');
      });
      
      this.gif.on('progress', (progress) => {
        const percent = Math.round(progress * 100);
        if (this.progressBar) {
          this.progressBar.style.width = `${percent}%`;
        }
        if (this.statusText) {
          this.statusText.textContent = `Generating GIF... ${percent}%`;
        }
        console.log(`📊 Progress: ${percent}%`);
      });
      
      this.gif.on('finished', (blob) => {
        console.log(`✅ GIF generated successfully! Size: ${(blob.size / 1024).toFixed(2)} KB`);
        this.showSavePrompt(blob, 'gif');
      });
      
      this.gif.on('abort', () => {
        console.error('❌ GIF rendering was aborted');
        if (this.statusText) {
          this.statusText.textContent = 'Error: Rendering aborted';
        }
        setTimeout(() => this.reset(), 2000);
      });
      
      // Start rendering
      this.gif.render();
      
    } catch (error) {
      console.error('❌ Error generating GIF:', error);
      console.error('Error details:', error.message, error.stack);
      if (this.statusText) {
        this.statusText.textContent = `Error: ${error.message}`;
      }
      setTimeout(() => this.reset(), 3000);
    }
  }
  
  async loadGIFLibrary() {
    return new Promise((resolve, reject) => {
      if (typeof GIF !== 'undefined') {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  showSavePrompt(blob, format = 'gif') {
    // Create save prompt overlay
    const overlay = document.createElement('div');
    overlay.className = 'recorder-save-overlay';
    
    const blobUrl = URL.createObjectURL(blob);
    const previewHTML = format === 'mp4' 
      ? `<video src="${blobUrl}" autoplay loop muted style="max-width:100%;max-height:300px;object-fit:contain;border-radius:8px;" />`
      : `<img src="${blobUrl}" alt="Recording preview" />`;
    
    overlay.innerHTML = `
      <div class="recorder-save-dialog">
        <div class="recorder-save-header">
          <h3>🎉 Recording Complete!</h3>
          <button class="recorder-save-close">✕</button>
        </div>
        <div class="recorder-save-body">
          <div class="recorder-save-preview">
            ${previewHTML}
          </div>
          <p>Your screen recording is ready to save!</p>
          <div class="recorder-save-info">
            <div class="recorder-save-stat">
              <span class="recorder-save-label">Format:</span>
              <span class="recorder-save-value">${format.toUpperCase()}</span>
            </div>
            <div class="recorder-save-stat">
              <span class="recorder-save-label">Resolution:</span>
              <span class="recorder-save-value">${this.settings.resolution}</span>
            </div>
            <div class="recorder-save-stat">
              <span class="recorder-save-label">Duration:</span>
              <span class="recorder-save-value">${this.settings.duration}s</span>
            </div>
            <div class="recorder-save-stat">
              <span class="recorder-save-label">Size:</span>
              <span class="recorder-save-value">${this.formatFileSize(blob.size)}</span>
            </div>
          </div>
        </div>
        <div class="recorder-save-actions">
          <button class="btn recorder-save-download">💾 Save to Desktop</button>
          <button class="btn recorder-save-cancel">Cancel</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Animate in
    requestAnimationFrame(() => {
      overlay.classList.add('active');
    });
    
    // Setup button handlers
    const downloadBtn = overlay.querySelector('.recorder-save-download');
    const cancelBtn = overlay.querySelector('.recorder-save-cancel');
    const closeBtn = overlay.querySelector('.recorder-save-close');
    
    const closePrompt = () => {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.remove();
        this.reset();
      }, 300);
    };
    
    downloadBtn.addEventListener('click', () => {
      this.downloadFile(blob, format);
      closePrompt();
    });
    
    cancelBtn.addEventListener('click', closePrompt);
    closeBtn.addEventListener('click', closePrompt);
    
    // Store blob URL for cleanup
    this.currentBlobUrl = URL.createObjectURL(blob);
  }
  
  downloadFile(blob, format = 'gif') {
    const extension = format === 'mp4' ? 'webm' : 'gif';
    const filename = `celli-recording-${Date.now()}.${extension}`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    
    console.log(`💾 ${format.toUpperCase()} saved: ${filename}`);
    
    // Show toast notification
    this.showToast(`${format.toUpperCase()} saved successfully! Check your Downloads folder.`);
  }
  
  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
  
  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'recorder-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
      toast.classList.add('active');
    });
    
    setTimeout(() => {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
  
  reset() {
    this.frames = [];
    this.isRecording = false;
    
    if (this.btn) {
      this.btn.classList.remove('recording');
    }
    
    if (this.statusText) {
      this.statusText.textContent = 'Ready';
    }
    
    if (this.progressBar) {
      this.progressBar.style.width = '0%';
    }
    
    // Hide status after a delay
    setTimeout(() => {
      const statusDiv = this.panel?.querySelector('#recStatus');
      if (statusDiv) {
        statusDiv.classList.remove('active');
      }
    }, 2000);
  }
  
  hideRecorderUI() {
    if (this.btn) this.btn.style.display = 'none';
    if (this.panel) this.panel.style.display = 'none';
  }
  
  showRecorderUI() {
    if (this.btn) this.btn.style.display = 'block';
    if (this.panel && this.panel.classList.contains('active')) {
      this.panel.style.display = 'block';
    }
  }
  
  hideAllUI() {
    // Hide common UI elements (add selectors as needed)
    const selectors = [
      '.hud',
      '#skipBtn',
      '#toast',
      '.scene-badge',
      '.builder-controls',
      '#play',
      '#sceneSelect'
    ];
    
    this.hiddenElements = [];
    
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el.style.display !== 'none' && getComputedStyle(el).display !== 'none') {
          this.hiddenElements.push({ el, display: el.style.display });
          el.style.display = 'none';
        }
      });
    });
  }
  
  showAllUI() {
    if (this.hiddenElements) {
      this.hiddenElements.forEach(({ el, display }) => {
        el.style.display = display || '';
      });
      this.hiddenElements = [];
    }
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  destroy() {
    // Stop any active recording first
    if (this.isRecording) {
      this.stopRecording();
    }
    
    // Clean up intervals
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
    if (this.canvasDetectionInterval) {
      clearInterval(this.canvasDetectionInterval);
      this.canvasDetectionInterval = null;
    }
    if (this.delayTimeout) {
      clearTimeout(this.delayTimeout);
      this.delayTimeout = null;
    }
    
    // Stop MP4 render loop
    this.mp4RenderActive = false;
    
    // Remove UI elements
    if (this.btn) {
      this.btn.remove();
      this.btn = null;
    }
    if (this.panel) {
      this.panel.remove();
      this.panel = null;
    }
    
    // Clear cached canvas
    this.detectedCanvas = null;
    
    console.log('🗑️ Screen Recorder destroyed');
  }
}

/**
 * Global Singleton Instance
 * 
 * This screen recorder instance persists across ALL scene transitions.
 * It automatically detects the active rendering canvas regardless of scene.
 * 
 * Features:
 * - Auto-detects canvas every 2 seconds
 * - Works with any Three.js renderer
 * - Persists across scene changes
 * - UI always accessible (bottom-right button)
 * - Supports both GIF and MP4 recording
 * 
 * Usage:
 *   window.screenRecorder.startRecording()
 *   window.screenRecorder.settings.duration = 15
 */
export const screenRecorder = new ScreenRecorder();


