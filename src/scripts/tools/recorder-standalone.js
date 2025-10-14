/**
 * Screen Recorder - Standalone Version
 * Can be included in any HTML file for universal recording support
 * No dependencies on other modules - fully self-contained
 */

(function() {
  'use strict';
  
  // Prevent multiple instances
  if (window.screenRecorder) {
    console.log('🎥 Screen Recorder already loaded');
    return;
  }
  
  class ScreenRecorder {
    constructor() {
      this.isRecording = false;
      this.frames = [];
      this.gif = null;
      this.startTime = null;
      this.recordingInterval = null;
      this.delayTimeout = null;
      
      // Default settings
      this.settings = {
        duration: 10,
        delay: 0,
        fps: 10,
        showCursor: true,
        showUI: false,
        quality: 10,
        format: 'gif',
        resolution: '1080p'
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
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.initNow());
      } else {
        this.initNow();
      }
    }
    
    initNow() {
      this.injectStyles();
      this.createUI();
      this.setupEventListeners();
      this.trackCursor();
      
      // Detect canvas on initialization and periodically
      this.detectCanvas();
      this.canvasDetectionInterval = setInterval(() => this.detectCanvas(), 2000);
      
      console.log('🎥 Screen Recorder initialized (standalone) - Universal recording support');
    }
    
    injectStyles() {
      if (document.getElementById('recorder-styles')) return;
      
      const style = document.createElement('style');
      style.id = 'recorder-styles';
      style.textContent = `
        .recorder-btn{position:fixed;bottom:20px;right:20px;background:#dc2626;color:#fff;border:0;padding:12px 20px;border-radius:10px;cursor:pointer;font-weight:700;font-size:14px;box-shadow:0 4px 12px rgba(220,38,38,.4);z-index:2147483001;transition:all .2s;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif}
        .recorder-btn:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(220,38,38,.6)}
        .recorder-btn.recording{background:#16a34a;animation:recPulse 2s infinite}
        @keyframes recPulse{0%,100%{opacity:1}50%{opacity:.7}}
        .recorder-panel{position:fixed;bottom:80px;right:20px;background:#0b0b10;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:20px;width:320px;box-shadow:0 8px 32px rgba(0,0,0,.6);z-index:2147483001;display:none;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;max-height:85vh;overflow-y:auto}
        .recorder-panel.active{display:block;animation:recSlideIn .3s ease-out}
        @keyframes recSlideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .recorder-panel h3{margin:0 0 16px 0;font-size:16px;font-weight:700;color:#e0e0e0}
        .recorder-setting{margin-bottom:16px}
        .recorder-setting label{display:block;margin-bottom:6px;font-size:13px;color:rgba(255,255,255,.8)}
        .recorder-setting input[type=range]{width:100%;height:32px;cursor:pointer;background:#191a23;border-radius:6px}
        .recorder-setting select{width:100%;padding:8px;background:#191a23;border:1px solid rgba(255,255,255,.1);border-radius:6px;color:#e8e8ee;font-size:13px;margin-top:6px}
        .recorder-checkbox{display:flex;align-items:center;gap:8px;margin-bottom:12px}
        .recorder-checkbox input[type=checkbox]{width:18px;height:18px;cursor:pointer;accent-color:#3498db}
        .recorder-checkbox label{margin:0;cursor:pointer;font-size:13px;color:rgba(255,255,255,.8);user-select:none}
        .recorder-actions{display:flex;gap:8px;margin-top:16px}
        .recorder-actions .btn{flex:1;padding:10px 16px;border:0;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;transition:all .2s;background:#191a23;color:#ddd}
        .recorder-actions .btn:hover{background:#2a2a2f;transform:translateY(-1px)}
        .recorder-actions .btn-start{background:#16a34a;color:#fff}
        .recorder-actions .btn-start:hover{background:#22c55e}
        .recorder-status{margin-top:12px;padding:10px;background:rgba(255,255,255,.05);border-radius:6px;font-size:12px;text-align:center;color:rgba(255,255,255,.7);display:none}
        .recorder-status.active{display:block}
        .recorder-progress{width:100%;height:4px;background:rgba(255,255,255,.1);border-radius:2px;overflow:hidden;margin-top:8px}
        .recorder-progress-bar{height:100%;background:linear-gradient(90deg,#16a34a 0%,#22c55e 100%);width:0%;transition:width .3s}
        .recorder-toast{position:fixed;bottom:100px;left:50%;transform:translateX(-50%) translateY(20px);background:#1a1a1f;color:#fff;padding:14px 24px;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.6);font-size:14px;font-weight:500;z-index:2147483003;opacity:0;transition:all .3s;pointer-events:none;border:1px solid rgba(34,197,94,.3)}
        .recorder-toast.active{opacity:1;transform:translateX(-50%) translateY(0)}
        .recorder-save-overlay{position:fixed;inset:0;background:rgba(0,0,0,.85);backdrop-filter:blur(4px);z-index:2147483002;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .3s;pointer-events:none}
        .recorder-save-overlay.active{opacity:1;pointer-events:auto}
        .recorder-save-dialog{background:#1a1a1f;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.8);max-width:500px;width:90%;overflow:hidden;transform:scale(.9);transition:transform .3s cubic-bezier(.34,1.56,.64,1)}
        .recorder-save-overlay.active .recorder-save-dialog{transform:scale(1)}
        .recorder-save-header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;background:linear-gradient(135deg,#16a34a 0%,#22c55e 100%);border-bottom:1px solid rgba(255,255,255,.1)}
        .recorder-save-header h3{margin:0;font-size:18px;font-weight:700;color:#fff}
        .recorder-save-close{background:rgba(0,0,0,.2);border:none;color:#fff;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all .2s}
        .recorder-save-close:hover{background:rgba(0,0,0,.4);transform:rotate(90deg)}
        .recorder-save-body{padding:24px}
        .recorder-save-preview{width:100%;max-height:300px;overflow:hidden;border-radius:8px;background:#000;margin-bottom:16px;display:flex;align-items:center;justify-content:center}
        .recorder-save-preview img,.recorder-save-preview video{max-width:100%;max-height:300px;object-fit:contain;border-radius:8px}
        .recorder-save-body>p{text-align:center;color:rgba(255,255,255,.9);font-size:14px;margin:0 0 16px 0}
        .recorder-save-info{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;padding:16px;background:rgba(255,255,255,.05);border-radius:8px}
        .recorder-save-stat{display:flex;flex-direction:column;align-items:center;gap:4px}
        .recorder-save-label{font-size:11px;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:.5px}
        .recorder-save-value{font-size:16px;font-weight:600;color:#22c55e}
        .recorder-save-actions{display:flex;gap:12px;padding:20px 24px;background:rgba(0,0,0,.2);border-top:1px solid rgba(255,255,255,.05)}
        .recorder-save-actions .btn{flex:1;padding:12px 20px;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;transition:all .2s}
        .recorder-save-download{background:linear-gradient(135deg,#16a34a 0%,#22c55e 100%);color:#fff;box-shadow:0 4px 12px rgba(34,197,94,.3)}
        .recorder-save-download:hover{transform:translateY(-2px);box-shadow:0 6px 16px rgba(34,197,94,.4)}
        .recorder-save-cancel{background:#2a2a2f;color:#ddd}
        .recorder-save-cancel:hover{background:#35353a}
      `;
      
      document.head.appendChild(style);
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
      // Try common IDs
      const commonIds = ['view', 'canvas', 'game-canvas', 'webgl-canvas', 'three-canvas'];
      for (const id of commonIds) {
        const canvas = document.getElementById(id);
        if (canvas && canvas.width > 300 && canvas.height > 150) {
          return canvas;
        }
      }
      
      // Find largest visible canvas
      const allCanvases = document.querySelectorAll('canvas');
      let largestCanvas = null;
      let largestArea = 0;
      
      allCanvases.forEach(canvas => {
        const area = canvas.width * canvas.height;
        const isVisible = getComputedStyle(canvas).display !== 'none';
        
        if (area > 45000 && isVisible && area > largestArea) {
          largestArea = area;
          largestCanvas = canvas;
        }
      });
      
      return largestCanvas;
    }
    
    getTargetDimensions() {
      const sourceCanvas = this.detectedCanvas || this.findBestCanvas();
      if (!sourceCanvas) {
        return { width: 1920, height: 1080 };
      }
      
      if (this.settings.resolution === '1080p') {
        return { width: 1920, height: 1080 };
      } else if (this.settings.resolution === '720p') {
        return { width: 1280, height: 720 };
      } else {
        return { width: sourceCanvas.width, height: sourceCanvas.height };
      }
    }
    
    createUI() {
      // Create recorder button
      this.btn = document.createElement('button');
      this.btn.className = 'recorder-btn';
      this.btn.innerHTML = '🎥 Record';
      document.body.appendChild(this.btn);
      
      // Create recorder panel  
      this.panel = document.createElement('div');
      this.panel.className = 'recorder-panel';
      this.panel.innerHTML = `
        <h3>Screen Recorder</h3>
        <div class="recorder-setting">
          <label>Duration: <span id="durValue">${this.settings.duration}</span>s</label>
          <input type="range" id="recDuration" min="1" max="30" value="${this.settings.duration}" step="1">
        </div>
        <div class="recorder-setting">
          <label>Delay: <span id="delayValue">${this.settings.delay}</span>s</label>
          <input type="range" id="recDelay" min="0" max="10" value="${this.settings.delay}" step="1">
        </div>
        <div class="recorder-setting">
          <label>FPS: <span id="qualityValue">${this.settings.fps}</span></label>
          <input type="range" id="recQuality" min="5" max="30" value="${this.settings.fps}" step="5">
        </div>
        <div class="recorder-checkbox">
          <input type="checkbox" id="recShowCursor" checked>
          <label for="recShowCursor">Show Cursor</label>
        </div>
        <div class="recorder-checkbox">
          <input type="checkbox" id="recShowUI">
          <label for="recShowUI">Show UI</label>
        </div>
        <div class="recorder-setting">
          <label>Format:</label>
          <select id="recFormat">
            <option value="gif">GIF</option>
            <option value="mp4">MP4 (WebM)</option>
          </select>
        </div>
        <div class="recorder-setting">
          <label>Resolution:</label>
          <select id="recResolution">
            <option value="1080p">1080p (1920x1080)</option>
            <option value="720p">720p (1280x720)</option>
            <option value="native">Native</option>
          </select>
        </div>
        <div class="recorder-actions">
          <button id="recStart" class="btn btn-start">Start</button>
          <button id="recCancel" class="btn">Close</button>
        </div>
        <div id="recStatus" class="recorder-status">
          <div id="recStatusText">Ready</div>
          <div class="recorder-progress">
            <div id="recProgressBar" class="recorder-progress-bar"></div>
          </div>
        </div>
      `;
      
      document.body.appendChild(this.panel);
      
      setTimeout(() => {
        this.statusText = this.panel?.querySelector('#recStatusText');
        this.progressBar = this.panel?.querySelector('#recProgressBar');
      }, 0);
    }
    
    setupEventListeners() {
      if (this.btn) {
        this.btn.addEventListener('click', () => this.togglePanel());
      }
      
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
          this.settings.quality = 30 - e.target.value;
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
        });
      }
      
      const resolutionSelect = this.panel?.querySelector('#recResolution');
      if (resolutionSelect) {
        resolutionSelect.addEventListener('change', (e) => {
          this.settings.resolution = e.target.value;
        });
      }
      
      const startBtn = this.panel?.querySelector('#recStart');
      const cancelBtn = this.panel?.querySelector('#recCancel');
      
      if (startBtn) {
        startBtn.addEventListener('click', () => this.startRecording());
      }
      
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => this.closePanel());
      }
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
      if (this.isRecording) return;
      
      if (this.panel.classList.contains('active')) {
        this.closePanel();
      } else {
        this.openPanel();
      }
    }
    
    openPanel() {
      this.panel.classList.add('active');
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
      
      // If canvas is not ready, wait up to 5 seconds
      if (!mainCanvas || (mainCanvas.width === 300 && mainCanvas.height === 150)) {
        console.log('⏳ Waiting for canvas to initialize...');
        
        for (let i = 0; i < 10; i++) {
          await this.sleep(500);
          mainCanvas = this.detectCanvas();
          
          if (mainCanvas && mainCanvas.width !== 300 && mainCanvas.height !== 150) {
            console.log('✅ Canvas ready!');
            break;
          }
        }
      }
      
      if (!mainCanvas || (mainCanvas.width === 300 && mainCanvas.height === 150)) {
        alert('❌ Canvas not initialized!\n\nThe renderer hasn\'t started yet.\n\nWait for the scene to fully load and try again.');
        return;
      }
      
      console.log(`🎬 Recording: ${mainCanvas.width}x${mainCanvas.height}`);
      
      const statusDiv = this.panel?.querySelector('#recStatus');
      if (statusDiv) statusDiv.classList.add('active');
      if (this.btn) this.btn.classList.add('recording');
      
      if (this.settings.delay > 0) {
        for (let i = this.settings.delay; i > 0; i--) {
          if (this.statusText) this.statusText.textContent = `Starting in ${i}s...`;
          await this.sleep(1000);
        }
      }
      
      this.hideRecorderUI();
      if (!this.settings.showUI) this.hideAllUI();
      
      this.isRecording = true;
      this.startTime = Date.now();
      
      if (this.statusText) this.statusText.textContent = 'Recording...';
      
      if (this.settings.format === 'mp4') {
        await this.startMP4Recording();
      } else {
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
        
        const progress = (frameCount / totalFrames) * 100;
        if (this.progressBar) this.progressBar.style.width = `${progress}%`;
        
        if (frameCount >= totalFrames) {
          this.stopRecording();
        }
      }, frameInterval);
    }
    
    async startMP4Recording() {
      try {
        const canvas = this.detectedCanvas || this.findBestCanvas();
        if (!canvas) throw new Error('Canvas not found');
        
        const targetDims = this.getTargetDimensions();
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = targetDims.width;
        outputCanvas.height = targetDims.height;
        const outputCtx = outputCanvas.getContext('2d');
        
        const stream = outputCanvas.captureStream(this.settings.fps);
        
        this.mp4RenderActive = true;
        const renderFrame = () => {
          if (!this.mp4RenderActive) return;
          
          outputCtx.fillStyle = '#000000';
          outputCtx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
          outputCtx.drawImage(canvas, 0, 0, outputCanvas.width, outputCanvas.height);
          
          if (this.settings.showCursor && this.cursorVisible) {
            const scaleX = targetDims.width / window.innerWidth;
            const scaleY = targetDims.height / window.innerHeight;
            this.drawCursor(outputCtx, scaleX, scaleY);
          }
          
          requestAnimationFrame(renderFrame);
        };
        
        renderFrame();
        
        const mimeType = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
          .find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';
        
        this.recordedChunks = [];
        this.mediaRecorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 2500000
        });
        
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) this.recordedChunks.push(event.data);
        };
        
        this.mediaRecorder.onstop = () => this.processMP4();
        this.mediaRecorder.start();
        
        setTimeout(() => {
          if (this.isRecording) this.stopRecording();
        }, this.settings.duration * 1000);
        
        const startTime = Date.now();
        const updateProgress = () => {
          if (!this.isRecording) return;
          const progress = Math.min((Date.now() - startTime) / (this.settings.duration * 1000) * 100, 100);
          if (this.progressBar) this.progressBar.style.width = `${progress}%`;
          if (progress < 100) requestAnimationFrame(updateProgress);
        };
        requestAnimationFrame(updateProgress);
        
      } catch (error) {
        console.error('❌ MP4 recording failed:', error);
        this.isRecording = false;
        this.showRecorderUI();
      }
    }
    
    async captureFrame() {
      const canvas = this.detectedCanvas || this.findBestCanvas();
      
      // If no canvas or 300x150, use DOM screenshot
      let sourceCanvas;
      if (!canvas || (canvas.width === 300 && canvas.height === 150)) {
        sourceCanvas = await this.captureDOMViewport();
      } else {
        sourceCanvas = canvas;
      }
      
      if (!sourceCanvas) return;
      
      const targetDims = this.getTargetDimensions();
      const outCanvas = document.createElement('canvas');
      const ctx = outCanvas.getContext('2d');
      
      outCanvas.width = targetDims.width;
      outCanvas.height = targetDims.height;
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);
      ctx.drawImage(sourceCanvas, 0, 0, outCanvas.width, outCanvas.height);
      
      if (this.settings.showCursor && this.cursorVisible) {
        const scaleX = targetDims.width / window.innerWidth;
        const scaleY = targetDims.height / window.innerHeight;
        this.drawCursor(ctx, scaleX, scaleY);
      }
      
      this.frames.push({ canvas: outCanvas });
    }
    
    async captureDOMViewport() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      try {
        if (typeof html2canvas !== 'undefined') {
          const screenshot = await html2canvas(document.body, {
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: null,
            logging: false,
            useCORS: true
          });
          
          ctx.drawImage(screenshot, 0, 0);
          
          if (this.frames.length === 0) {
            console.log('✅ DOM captured (html2canvas)');
          }
        } else {
          // Fallback
          ctx.fillStyle = '#0b0b10';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#ffffff';
          ctx.font = '16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('DOM Capture Requires html2canvas', canvas.width / 2, canvas.height / 2);
        }
        
        return canvas;
      } catch (e) {
        console.error('DOM capture error:', e);
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return canvas;
      }
    }
    
    drawCursor(ctx, scaleX = 1, scaleY = 1) {
      const x = this.cursorPos.x * scaleX;
      const y = this.cursorPos.y * scaleY;
      const scale = Math.min(scaleX, scaleY);
      
      ctx.save();
      ctx.strokeStyle = '#FFFFFF';
      ctx.fillStyle = '#000000';
      ctx.lineWidth = 1.5;
      
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
      
      this.isRecording = false;
      
      if (this.settings.format === 'mp4') {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
        }
      } else {
        if (this.recordingInterval) {
          clearInterval(this.recordingInterval);
          this.recordingInterval = null;
        }
        
        if (this.statusText) this.statusText.textContent = 'Processing...';
        if (this.progressBar) this.progressBar.style.width = '0%';
        
        this.showRecorderUI();
        if (!this.settings.showUI) this.showAllUI();
        
        this.generateGIF();
      }
    }
    
    processMP4() {
      this.mp4RenderActive = false;
      
      if (this.statusText) this.statusText.textContent = 'Processing...';
      
      this.showRecorderUI();
      if (!this.settings.showUI) this.showAllUI();
      
      const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
      console.log(`✅ MP4: ${(blob.size / 1024).toFixed(2)} KB`);
      
      this.showSavePrompt(blob, 'mp4');
    }
    
    async generateGIF() {
      if (this.frames.length === 0) {
        if (this.statusText) this.statusText.textContent = 'Error: No frames';
        setTimeout(() => this.reset(), 2000);
        return;
      }
      
      if (this.statusText) this.statusText.textContent = 'Generating GIF...';
      if (this.progressBar) this.progressBar.style.width = '0%';
      
      try {
        if (typeof GIF === 'undefined') {
          await this.loadGIFLibrary();
        }
        
        const targetDims = this.getTargetDimensions();
        
        this.gif = new GIF({
          workers: 2,
          quality: this.settings.quality,
          workerScript: 'src/assets/js/gif.worker.js',
          width: targetDims.width,
          height: targetDims.height,
          debug: false
        });
        
        const delay = 1000 / this.settings.fps;
        this.frames.forEach(frame => {
          this.gif.addFrame(frame.canvas, { delay, copy: true });
        });
        
        this.gif.on('progress', (progress) => {
          const percent = Math.round(progress * 100);
          if (this.progressBar) this.progressBar.style.width = `${percent}%`;
          if (this.statusText) this.statusText.textContent = `Generating... ${percent}%`;
        });
        
        this.gif.on('finished', (blob) => {
          console.log(`✅ GIF: ${(blob.size / 1024).toFixed(2)} KB`);
          this.showSavePrompt(blob, 'gif');
        });
        
        this.gif.render();
        
      } catch (error) {
        console.error('❌ GIF error:', error);
        if (this.statusText) this.statusText.textContent = `Error: ${error.message}`;
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
      const overlay = document.createElement('div');
      overlay.className = 'recorder-save-overlay';
      
      const blobUrl = URL.createObjectURL(blob);
      const previewHTML = format === 'mp4' 
        ? `<video src="${blobUrl}" autoplay loop muted style="max-width:100%;max-height:300px;" />`
        : `<img src="${blobUrl}" />`;
      
      overlay.innerHTML = `
        <div class="recorder-save-dialog">
          <div class="recorder-save-header">
            <h3>🎉 Recording Complete!</h3>
            <button class="recorder-save-close">✕</button>
          </div>
          <div class="recorder-save-body">
            <div class="recorder-save-preview">${previewHTML}</div>
            <p>Ready to save!</p>
            <div class="recorder-save-info">
              <div class="recorder-save-stat">
                <span class="recorder-save-label">Format</span>
                <span class="recorder-save-value">${format.toUpperCase()}</span>
              </div>
              <div class="recorder-save-stat">
                <span class="recorder-save-label">Resolution</span>
                <span class="recorder-save-value">${this.settings.resolution}</span>
              </div>
              <div class="recorder-save-stat">
                <span class="recorder-save-label">Duration</span>
                <span class="recorder-save-value">${this.settings.duration}s</span>
              </div>
              <div class="recorder-save-stat">
                <span class="recorder-save-label">Size</span>
                <span class="recorder-save-value">${this.formatFileSize(blob.size)}</span>
              </div>
            </div>
          </div>
          <div class="recorder-save-actions">
            <button class="btn recorder-save-download">💾 Save</button>
            <button class="btn recorder-save-cancel">Cancel</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(overlay);
      
      requestAnimationFrame(() => overlay.classList.add('active'));
      
      const downloadBtn = overlay.querySelector('.recorder-save-download');
      const cancelBtn = overlay.querySelector('.recorder-save-cancel');
      const closeBtn = overlay.querySelector('.recorder-save-close');
      
      const closePrompt = () => {
        overlay.classList.remove('active');
        setTimeout(() => { overlay.remove(); this.reset(); }, 300);
      };
      
      downloadBtn.addEventListener('click', () => {
        this.downloadFile(blob, format);
        closePrompt();
      });
      
      cancelBtn.addEventListener('click', closePrompt);
      closeBtn.addEventListener('click', closePrompt);
    }
    
    downloadFile(blob, format = 'gif') {
      const ext = format === 'mp4' ? 'webm' : 'gif';
      const filename = `celli-${Date.now()}.${ext}`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      this.showToast(`${format.toUpperCase()} saved!`);
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
      
      requestAnimationFrame(() => toast.classList.add('active'));
      
      setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }
    
    reset() {
      this.frames = [];
      this.isRecording = false;
      
      if (this.btn) this.btn.classList.remove('recording');
      if (this.statusText) this.statusText.textContent = 'Ready';
      if (this.progressBar) this.progressBar.style.width = '0%';
      
      setTimeout(() => {
        const statusDiv = this.panel?.querySelector('#recStatus');
        if (statusDiv) statusDiv.classList.remove('active');
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
      const selectors = ['.hud', '#skipBtn', '#toast', '.scene-badge', '#play', '#sceneSelect'];
      this.hiddenElements = [];
      
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
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
  }
  
  // Create global singleton
  window.screenRecorder = new ScreenRecorder();
  console.log('🎥 Universal Screen Recorder loaded');
  
})();

