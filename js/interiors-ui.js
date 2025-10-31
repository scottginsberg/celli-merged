// ==================== INTERIORS UI SYSTEM ====================
// UI components for the interiors system (asset menu, randomizer button, etc.)
// Extracted from scale-ultra.html

import { INTERIORS_ROOM_CONFIGS } from './interiors-constants.js';

// State
let assetMenuOpen = false;
let currentRoomIndex = 0;
const allRoomTypes = ['studio', '1br', '2br', '3br'];

// External dependencies (injected)
let interiorsMode = false;
let generateInteriorRoom = null;
let clearInteriorRoom = null;
let spawnAssetInInterior = null;

// Initialize UI with dependencies
export function initInteriorsUI(deps) {
  interiorsMode = deps.interiorsMode;
  generateInteriorRoom = deps.generateInteriorRoom;
  clearInteriorRoom = deps.clearInteriorRoom;
  spawnAssetInInterior = deps.spawnAssetInInterior;
}

// Setup the randomizer button
export function setupRandomizerButton() {
  const btn = document.createElement('button');
  btn.id = 'randomize-btn';
  btn.innerHTML = '🎲 Randomize';
  btn.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(180deg, #ff6b9d 0%, #ef5b8d 100%);
    border: 2px solid rgba(255,107,157,.6);
    border-radius: 8px;
    padding: 12px 24px;
    color: white;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    z-index: 100;
    transition: all 0.2s;
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    box-shadow: 0 4px 12px rgba(255,107,157,0.3);
    display: none;
  `;
  
  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'translateY(-2px) scale(1.05)';
    btn.style.boxShadow = '0 6px 20px rgba(255,107,157,0.4)';
  });
  
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translateY(0) scale(1)';
    btn.style.boxShadow = '0 4px 12px rgba(255,107,157,0.3)';
  });
  
  btn.addEventListener('click', () => {
    randomizeRoom();
  });
  
  document.body.appendChild(btn);
}

// Randomize room type and regenerate
export function randomizeRoom() {
  // Clear current interior
  if (clearInteriorRoom) clearInteriorRoom();
  
  // Cycle through room types in order
  const roomType = allRoomTypes[currentRoomIndex];
  currentRoomIndex = (currentRoomIndex + 1) % allRoomTypes.length;
  
  // Regenerate with selected type using RANDOM layout
  if (generateInteriorRoom) {
    generateInteriorRoom(roomType, true); // true = use random generation
  }
  
  console.log(`Loaded RANDOM room: ${roomType} (layout ${currentRoomIndex}/${allRoomTypes.length})`);
}

// Setup the asset library/menu
// NOTE: This is a stub - the actual implementation is in scale-ultra.html
// export function setupAssetLibrary() {
//   // Asset menu will be toggled with 'B' key
//   console.log('Asset library setup - ready to toggle with B key');
// }

// Toggle the asset menu on/off
export function toggleAssetMenu() {
  assetMenuOpen = !assetMenuOpen;
  
  let assetMenu = document.getElementById('asset-menu');
  
  if (!assetMenu) {
    // Create asset menu UI
    assetMenu = document.createElement('div');
    assetMenu.id = 'asset-menu';
    assetMenu.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(26, 33, 48, 0.95);
      border: 2px solid rgba(106, 156, 255, 0.6);
      border-radius: 12px;
      padding: 20px;
      max-width: 600px;
      max-height: 70vh;
      overflow-y: auto;
      z-index: 10000;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
    `;
    
    const title = document.createElement('h2');
    title.textContent = 'Asset Library (Interior Mode)';
    title.style.cssText = 'margin: 0 0 15px 0; color: #6a9cff; font-size: 18px;';
    assetMenu.appendChild(title);
    
    const info = document.createElement('p');
    info.textContent = 'Press ESC or B to close • Assets spawn in front of camera';
    info.style.cssText = 'margin: 0 0 15px 0; color: rgba(255,255,255,0.6); font-size: 12px;';
    assetMenu.appendChild(info);
    
    const assetGrid = document.createElement('div');
    assetGrid.style.cssText = 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;';
    
    const commonAssets = [
      { name: 'Couch', type: 'couch' },
      { name: 'TV', type: 'tv' },
      { name: 'Coffee Table', type: 'coffeetable' },
      { name: 'Plant', type: 'plant' },
      { name: 'Floor Lamp', type: 'floorlamp' },
      { name: 'Bookshelf', type: 'shelf' },
      { name: 'Desk', type: 'computerdesk' },
      { name: 'Chair', type: 'chair' },
      { name: 'Rug', type: 'rug' },
      { name: 'Clock', type: 'clock' },
      { name: 'Painting', type: 'artframe' },
      { name: 'Cactus', type: 'cactus' }
    ];
    
    commonAssets.forEach(asset => {
      const btn = document.createElement('button');
      btn.textContent = asset.name;
      btn.style.cssText = 'padding: 12px; font-size: 13px; background: rgba(74, 124, 255, 0.3); border: 1px solid rgba(106, 156, 255, 0.5); color: white; border-radius: 4px; cursor: pointer;';
      btn.onclick = () => {
        if (spawnAssetInInterior) {
          spawnAssetInInterior(asset.type);
        }
        toggleAssetMenu(); // Close menu after spawning
      };
      assetGrid.appendChild(btn);
    });
    
    assetMenu.appendChild(assetGrid);
    document.body.appendChild(assetMenu);
  }
  
  // Toggle visibility
  assetMenu.style.display = assetMenuOpen ? 'block' : 'none';
  
  console.log('Asset menu:', assetMenuOpen ? 'opened' : 'closed');
}

// Check if asset menu is currently open
export function isAssetMenuOpen() {
  return assetMenuOpen;
}

