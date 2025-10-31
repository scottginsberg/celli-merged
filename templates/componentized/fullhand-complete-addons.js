// ===== HAND VOXELIZER WITH AUTO BACKGROUND DETECTION + EXIF METADATA GAG =====

// Add to cursor-file-input event listener (around line 1900-2000)
document.getElementById('cursor-file-input').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  console.log('[HandVoxelizer] File selected:', file.name);
  
  const reader = new FileReader();
  reader.onload = function(event) {
    const img = new Image();
    img.onload = function() {
      console.log('[HandVoxelizer] Image loaded:', img.width, 'x', img.height);
      
      // Read EXIF metadata first
      readEXIFAndShowGag(file, img, () => {
        // After gag sequence, voxelize the hand
        voxelizeHandWithBackgroundRemoval(img);
      });
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// ===== EXIF METADATA READER AND GAG SEQUENCE =====
function readEXIFAndShowGag(file, img, callback) {
  console.log('[EXIF] Reading metadata from image...');
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const arrayBuffer = e.target.result;
    
    try {
      // Simple EXIF parser - look for common smartphone markers
      const view = new DataView(arrayBuffer);
      let metadata = {
        hasExif: false,
        deviceModel: 'Unknown',
        location: null,
        timestamp: null,
        software: null
      };
      
      // Check for EXIF marker (0xFFE1)
      if (view.getUint16(0) === 0xFFD8) { // JPEG
        let offset = 2;
        while (offset < view.byteLength) {
          const marker = view.getUint16(offset);
          if (marker === 0xFFE1) { // EXIF marker
            metadata.hasExif = true;
            console.log('[EXIF] EXIF data detected!');
            
            // Try to extract basic info (simplified parsing)
            try {
              const exifLength = view.getUint16(offset + 2);
              const exifString = new TextDecoder().decode(arrayBuffer.slice(offset, offset + Math.min(exifLength, 200)));
              
              // Look for common smartphone indicators
              if (exifString.includes('iPhone') || exifString.includes('Apple')) {
                metadata.deviceModel = 'iPhone';
              } else if (exifString.includes('Samsung') || exifString.includes('Galaxy')) {
                metadata.deviceModel = 'Samsung Galaxy';
              } else if (exifString.includes('Pixel')) {
                metadata.deviceModel = 'Google Pixel';
              } else if (exifString.includes('Android')) {
                metadata.deviceModel = 'Android Device';
              }
              
              // Check for GPS tags (simplified)
              if (exifString.includes('GPS') || arrayBuffer.byteLength > 0) {
                metadata.location = 'GPS coordinates detected';
              }
              
            } catch (err) {
              console.warn('[EXIF] Error parsing EXIF details:', err);
            }
            break;
          }
          offset += 2 + view.getUint16(offset + 2);
        }
      }
      
      // Get file timestamp
      if (file.lastModified) {
        metadata.timestamp = new Date(file.lastModified).toLocaleString();
      }
      
      console.log('[EXIF] Metadata:', metadata);
      
      // Show gag sequence if phone detected
      if (metadata.hasExif && metadata.deviceModel !== 'Unknown') {
        showMetadataGagSequence(metadata, callback);
      } else {
        console.log('[EXIF] No smartphone metadata detected - skipping gag');
        callback();
      }
      
    } catch (error) {
      console.error('[EXIF] Error reading metadata:', error);
      callback();
    }
  };
  reader.readAsArrayBuffer(file);
}

async function showMetadataGagSequence(metadata, callback) {
  console.log('[EXIF Gag] Starting metadata gag sequence');
  
  // Dramatic reveal
  await showDialogue(`📱 Analyzing image...`, 1500);
  await new Promise(r => setTimeout(r, 1800));
  
  await showDialogue(`🔍 Metadata detected!`, 2000);
  await new Promise(r => setTimeout(r, 2200));
  
  // Show the "identifying" information
  const messages = [
    `📱 Device: <strong>${metadata.deviceModel}</strong>`,
    metadata.location ? `📍 Location data: <strong>${metadata.location}</strong>` : null,
    metadata.timestamp ? `📅 Captured: <strong>${metadata.timestamp}</strong>` : null,
    `⚠️ This information is embedded in every photo you take.`
  ].filter(m => m !== null);
  
  for (const msg of messages) {
    await showDialogue(msg, 3000);
    await new Promise(r => setTimeout(r, 3200));
  }
  
  // Warning
  await showDialogue(`<strong style="color: #ff6b6b;">Anyone you share photos with can see this data.</strong>`, 3500);
  await new Promise(r => setTimeout(r, 3800));
  
  // Celli's reassurance
  await showDialogue(`But don't worry...`, 2000);
  await new Promise(r => setTimeout(r, 2200));
  
  await showDialogue(`<strong style="color: #4affb0;">It's a good thing you're in Celli's hands.</strong> 💚`, 4000);
  await new Promise(r => setTimeout(r, 4200));
  
  console.log('[EXIF Gag] Sequence complete');
  callback();
}

// ===== IMPROVED HAND VOXELIZER WITH BACKGROUND REMOVAL =====
function voxelizeHandWithBackgroundRemoval(img) {
  console.log('[HandVoxelizer] Starting voxelization with background removal...');
  
  const resolution = 96; // High resolution
  const canvas = document.createElement('canvas');
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext('2d');
  
  // Draw image
  ctx.drawImage(img, 0, 0, resolution, resolution);
  const imageData = ctx.getImageData(0, 0, resolution, resolution);
  const pixels = imageData.data;
  
  // Auto-detect background color (sample corners)
  const cornerSamples = [
    [0, 0], // top-left
    [resolution - 1, 0], // top-right
    [0, resolution - 1], // bottom-left
    [resolution - 1, resolution - 1] // bottom-right
  ];
  
  let bgR = 0, bgG = 0, bgB = 0;
  cornerSamples.forEach(([x, y]) => {
    const idx = (y * resolution + x) * 4;
    bgR += pixels[idx];
    bgG += pixels[idx + 1];
    bgB += pixels[idx + 2];
  });
  bgR = Math.floor(bgR / cornerSamples.length);
  bgG = Math.floor(bgG / cornerSamples.length);
  bgB = Math.floor(bgB / cornerSamples.length);
  
  console.log('[HandVoxelizer] Detected background color:', `rgb(${bgR}, ${bgG}, ${bgB})`);
  
  const colorThreshold = 40; // Threshold for "similar" colors
  
  function isBackground(r, g, b) {
    const dr = r - bgR;
    const dg = g - bgG;
    const db = b - bgB;
    const distance = Math.sqrt(dr * dr + dg * dg + db * db);
    return distance < colorThreshold;
  }
  
  // Create voxels
  const voxelGroup = new THREE.Group();
  voxelGroup.name = 'CustomHandVoxels';
  voxelGroup.position.set(-2, 2, 2); // Position in scene
  
  const voxelSize = 0.03;
  const geometry = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize);
  
  let voxelCount = 0;
  const voxels = [];
  
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      const idx = (y * resolution + x) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];
      const a = pixels[idx + 3];
      
      // Skip if transparent or background
      if (a < 30 || isBackground(r, g, b)) continue;
      
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(r / 255, g / 255, b / 255),
        metalness: 0.2,
        roughness: 0.6,
        emissive: new THREE.Color(r / 255, g / 255, b / 255),
        emissiveIntensity: 0.3
      });
      
      const cube = new THREE.Mesh(geometry, material);
      const px = (x / resolution - 0.5) * 3;
      const py = -(y / resolution - 0.5) * 3;
      cube.position.set(px, py, 0);
      cube.userData.startDelay = Math.random() * 2000;
      cube.scale.setScalar(0.01);
      
      voxelGroup.add(cube);
      voxels.push(cube);
      voxelCount++;
    }
  }
  
  scene.add(voxelGroup);
  console.log('[HandVoxelizer] Created', voxelCount, 'hand voxels (background removed)');
  
  showDialogue(`✋ Hand voxelized! ${voxelCount} voxels created`, 3000);
  
  // Animate build
  const startTime = Date.now();
  voxels.forEach(cube => {
    setTimeout(() => {
      const duration = 800;
      const start = Date.now();
      const animate = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        cube.scale.setScalar(0.01 + eased * 0.99);
        if (progress < 1) requestAnimationFrame(animate);
      };
      animate();
    }, cube.userData.startDelay);
  });
}

// ===== POCKET DIMENSION VIDEO DISPLAY WITH REVERB =====
// Add to dropPlayer() function or pocket dimension activation

function createPocketDimensionVideoDisplay() {
  if (!dropModeActive) return;
  
  console.log('[PocketDim] Creating video display in sky...');
  
  // Create video element
  const video = document.createElement('video');
  video.src = '../../static/video/taunt.mp4';
  video.loop = true;
  video.muted = false;
  video.volume = 0.6;
  video.crossOrigin = 'anonymous';
  
  // Create audio context for reverb
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const audioSource = audioContext.createMediaElementSource(video);
  
  // Create convolver (reverb) node
  const convolver = audioContext.createConvolver();
  
  // Generate reverb impulse response
  const sampleRate = audioContext.sampleRate;
  const length = sampleRate * 3; // 3 seconds of reverb
  const impulse = audioContext.createBuffer(2, length, sampleRate);
  
  for (let channel = 0; channel < 2; channel++) {
    const channelData = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
    }
  }
  convolver.buffer = impulse;
  
  // Connect audio chain: source -> convolver -> destination
  audioSource.connect(convolver);
  convolver.connect(audioContext.destination);
  
  // Create video texture
  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  
  // Create giant display frame in sky
  const displayWidth = 20;
  const displayHeight = 20 * (9 / 16); // 16:9 aspect
  
  // Frame geometry
  const frameThickness = 0.5;
  const frameGeo = new THREE.BoxGeometry(
    displayWidth + frameThickness * 2,
    displayHeight + frameThickness * 2,
    frameThickness
  );
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1f,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0x4a7cff,
    emissiveIntensity: 0.3
  });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  
  // Screen geometry
  const screenGeo = new THREE.PlaneGeometry(displayWidth, displayHeight);
  const screenMat = new THREE.MeshBasicMaterial({
    map: videoTexture,
    side: THREE.DoubleSide,
    toneMapped: false
  });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.z = frameThickness / 2 + 0.01;
  
  // Group and position
  const videoGroup = new THREE.Group();
  videoGroup.add(frame);
  videoGroup.add(screen);
  videoGroup.position.set(0, 15, 0); // High in the sky
  videoGroup.lookAt(camera.position); // Face camera initially
  
  scene.add(videoGroup);
  
  // Play video
  video.play().catch(err => console.warn('[PocketDim] Video play failed:', err));
  
  console.log('[PocketDim] Video display created in sky with reverb audio!');
  
  // Store reference for cleanup
  window.pocketDimensionVideo = {
    group: videoGroup,
    video: video,
    audioContext: audioContext
  };
  
  showDialogue('🎬 The sky watches...', 3000);
}

// Call this when entering pocket dimension/drop mode
// Add to dropPlayer() function after line that sets dropModeActive = true
// createPocketDimensionVideoDisplay();













