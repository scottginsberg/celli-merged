// ========== IMAGE TAGGING SYSTEM (Reinforcement Learning) ==========

// Image tags storage: maps image filenames to entity IDs
const imageTags = {};

// Tagging state
let taggingMode = false;
let currentImageIndex = 0;
let imageFiles = [];
let suggestedEntities = [];

// Load existing tags from localStorage
function loadImageTags() {
  const stored = localStorage.getItem('storyImageTags');
  if (stored) {
    Object.assign(imageTags, JSON.parse(stored));
  }
}

// Save tags to localStorage
function saveImageTags() {
  localStorage.setItem('storyImageTags', JSON.stringify(imageTags));
}

// Initialize image tagging from a folder
async function initializeImageTagger(folderPath) {
  try {
    // In a web environment, we'd need file input or drag-drop
    // For now, we'll use a file input
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';
    input.webkitdirectory = true; // Allow directory selection
    
    input.onchange = (e) => {
      imageFiles = Array.from(e.target.files).filter(f => 
        f.type.startsWith('image/')
      );
      
      if (imageFiles.length > 0) {
        currentImageIndex = 0;
        taggingMode = true;
        renderImageTagger();
      } else {
        alert('No image files found in selected folder');
      }
    };
    
    input.click();
  } catch (error) {
    console.error('Error initializing image tagger:', error);
  }
}

// Get three random character suggestions
function getThreeRandomCharacters() {
  const characters = Object.values(window.NodesData || {}).filter(n => 
    n.type === 'character' || n.type === 'deity' || n.type === 'primordial'
  );
  
  const shuffled = characters.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}

// Render the image tagging interface
function renderImageTagger() {
  if (!taggingMode || imageFiles.length === 0) return;
  
  const container = document.getElementById('imageTaggingContainer');
  if (!container) return;
  
  const currentImage = imageFiles[currentImageIndex];
  const imageUrl = URL.createObjectURL(currentImage);
  const progress = `${currentImageIndex + 1} / ${imageFiles.length}`;
  const isTagged = imageTags[currentImage.name];
  
  // Get suggestions for this image
  if (suggestedEntities.length === 0 || currentImageIndex % 3 === 0) {
    suggestedEntities = getThreeRandomCharacters();
  }
  
  let html = `
    <div style="padding:20px;background:var(--panel);border-radius:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h2 style="margin:0;color:var(--accent);">Image Tagging Mode</h2>
        <div style="display:flex;gap:12px;align-items:center;">
          <span style="font-size:.75rem;color:var(--sub);">${progress}</span>
          <button class="form-btn" onclick="exitTaggingMode()" style="padding:6px 12px;">Exit</button>
        </div>
      </div>
      
      ${isTagged ? `<div style="padding:8px;background:var(--ok);color:var(--bg);border-radius:4px;margin-bottom:12px;font-weight:600;">✓ Already tagged as: ${getNode(imageTags[currentImage.name])?.name || imageTags[currentImage.name]}</div>` : ''}
      
      <div style="display:grid;grid-template-columns:1fr 400px;gap:24px;">
        <div style="background:var(--bg);padding:16px;border-radius:8px;display:flex;align-items:center;justify-content:center;">
          <img src="${imageUrl}" style="max-width:100%;max-height:500px;border-radius:4px;box-shadow:0 4px 12px rgba(0,0,0,0.3);" />
        </div>
        
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div style="font-size:.85rem;color:var(--text);margin-bottom:8px;">
            <strong>Filename:</strong> ${currentImage.name}
          </div>
          
          <div style="font-size:.75rem;color:var(--sub);margin-bottom:8px;">
            Is this one of these characters?
          </div>
          
          ${suggestedEntities.map(entity => `
            <button class="form-btn primary" onclick="tagImageToEntity('${entity.id}')" style="padding:12px;text-align:left;display:flex;align-items:center;gap:8px;">
              <span style="font-size:1.2rem;">👤</span>
              <div>
                <div style="font-weight:600;">${entity.name}</div>
                <div style="font-size:.65rem;opacity:0.8;">${entity.description || ''}</div>
              </div>
            </button>
          `).join('')}
          
          <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--muted);">
            <div style="font-size:.75rem;color:var(--sub);margin-bottom:8px;">
              Or select from explorer (click entity in left panel)
            </div>
          </div>
          
          <button class="form-btn" onclick="skipCurrentImage()" style="padding:8px;">Skip This Image</button>
          <button class="form-btn" onclick="markAsNone()" style="padding:8px;">Not a Character/Entity</button>
          
          ${isTagged ? `<button class="form-btn" onclick="untagCurrentImage()" style="padding:8px;background:var(--danger);color:var(--text);">Remove Tag</button>` : ''}
        </div>
      </div>
      
      <div style="margin-top:16px;display:flex;gap:8px;">
        <button class="form-btn" onclick="previousImage()" ${currentImageIndex === 0 ? 'disabled' : ''}>◀ Previous</button>
        <button class="form-btn primary" onclick="nextImage()" ${currentImageIndex >= imageFiles.length - 1 ? 'disabled' : ''}>Next ▶</button>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}

// Tag current image to an entity
function tagImageToEntity(entityId) {
  if (!taggingMode || !imageFiles[currentImageIndex]) return;
  
  const imageName = imageFiles[currentImageIndex].name;
  imageTags[imageName] = entityId;
  saveImageTags();
  
  // Auto-advance to next image
  nextImage();
}

// Skip current image
function skipCurrentImage() {
  nextImage();
}

// Mark as not a character/entity
function markAsNone() {
  if (!taggingMode || !imageFiles[currentImageIndex]) return;
  
  const imageName = imageFiles[currentImageIndex].name;
  imageTags[imageName] = 'none';
  saveImageTags();
  nextImage();
}

// Untag current image
function untagCurrentImage() {
  if (!taggingMode || !imageFiles[currentImageIndex]) return;
  
  const imageName = imageFiles[currentImageIndex].name;
  delete imageTags[imageName];
  saveImageTags();
  renderImageTagger();
}

// Navigate to next image
function nextImage() {
  if (currentImageIndex < imageFiles.length - 1) {
    currentImageIndex++;
    renderImageTagger();
  } else {
    alert('All images reviewed! Exiting tagging mode.');
    exitTaggingMode();
  }
}

// Navigate to previous image
function previousImage() {
  if (currentImageIndex > 0) {
    currentImageIndex--;
    renderImageTagger();
  }
}

// Exit tagging mode
function exitTaggingMode() {
  taggingMode = false;
  imageFiles = [];
  currentImageIndex = 0;
  suggestedEntities = [];
  
  // Clear the container
  const container = document.getElementById('imageTaggingContainer');
  if (container) {
    container.innerHTML = '';
  }
  
  // Switch back to normal view
  switchView('node');
  
  // Export tags to file
  exportImageTagsToFile();
}

// Export image tags to a text file
function exportImageTagsToFile() {
  let content = '# IMAGE TAGS\n\n';
  content += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  for (const [imageName, entityId] of Object.entries(imageTags)) {
    if (entityId === 'none') {
      content += `${imageName}: [NOT A CHARACTER/ENTITY]\n`;
    } else {
      const entity = getNode(entityId);
      content += `${imageName}: ${entity ? entity.name : entityId} (${entityId})\n`;
    }
  }
  
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'image-tags.txt';
  a.click();
  URL.revokeObjectURL(url);
}

// Get images tagged to a specific entity
function getImagesForEntity(entityId) {
  const images = [];
  for (const [imageName, taggedEntityId] of Object.entries(imageTags)) {
    if (taggedEntityId === entityId) {
      images.push(imageName);
    }
  }
  return images;
}

// Override node selection in tagging mode
const originalSelectNode = window.selectNode;
window.selectNodeInTaggingMode = function(nodeId) {
  if (taggingMode && imageFiles[currentImageIndex]) {
    // Tag the current image to this entity instead of navigating
    tagImageToEntity(nodeId);
  } else {
    // Normal navigation
    if (originalSelectNode) {
      originalSelectNode(nodeId);
    }
  }
};

// Initialize
loadImageTags();

// Export functions
if (typeof window !== 'undefined') {
  window.initializeImageTagger = initializeImageTagger;
  window.taggingMode = () => taggingMode;
  window.tagImageToEntity = tagImageToEntity;
  window.skipCurrentImage = skipCurrentImage;
  window.markAsNone = markAsNone;
  window.untagCurrentImage = untagCurrentImage;
  window.nextImage = nextImage;
  window.previousImage = previousImage;
  window.exitTaggingMode = exitTaggingMode;
  window.getImagesForEntity = getImagesForEntity;
}


