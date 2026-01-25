// ==================== INTERIORS MAIN SYSTEM ====================
// Main coordination and state management for the interiors system
// Extracted from scale-ultra.html

import { INTERIORS_GRID_SIZE, INTERIORS_WALL_HEIGHT, INTERIORS_ROOM_CONFIGS } from './interiors-constants.js';

// State variables (will be injected by scale-ultra.html)
export let interiorsMode = false;
export let savedCityObjects = null;
export let savedPlayerChunk = null;
export let interiorsGroup = null;
export const interiorRoomObjects = [];
export const interiorInteractiveObjects = [];
export const interactiveInteriorsObjects = [];

// References to external dependencies (injected by scale-ultra.html)
let THREE, scene, worldRoot, playerBody, camera, raycaster;
let generateInteriorRoomImpl; // Will be set by scale-ultra.html
let setupAssetLibraryImpl; // Will be set by scale-ultra.html
let setupRandomizerButtonImpl; // Will be set by scale-ultra.html

// Initialize the interiors system with external dependencies
export function initInteriors(deps) {
  THREE = deps.THREE;
  scene = deps.scene;
  worldRoot = deps.worldRoot;
  playerBody = deps.playerBody;
  camera = deps.camera;
  raycaster = deps.raycaster;
  generateInteriorRoomImpl = deps.generateInteriorRoom;
  setupAssetLibraryImpl = deps.setupAssetLibrary;
  setupRandomizerButtonImpl = deps.setupRandomizerButton;
  
  interiorsGroup = new THREE.Group();
  
  console.log('Interiors system initialized');
}

// Toggle interiors mode on/off
export function toggleInteriorsMode() {
  interiorsMode = !interiorsMode;
  
  if (interiorsMode) {
    console.log('Entering interiors mode...');

    // Save player chunk location
    if (playerBody) {
      const pos = playerBody.translation();
      savedPlayerChunk = { x: pos.x, y: pos.y, z: pos.z };
    }

    // Hide city (keep current chunk only)
    if (worldRoot) {
      worldRoot.visible = false;
    }

    // IMPORTANT: Add interiorsGroup directly to SCENE, not worldRoot
    // Interiors should NOT be affected by world scaling
    scene.add(interiorsGroup);
    
    // Generate interior room
    console.log('Generating interior room...');
    generateInteriorRoom('studio');
    console.log('Interior room generated, children count:', interiorsGroup.children.length);
    
    // Setup asset library and UI
    if (!document.getElementById('asset-library')) {
      setupAssetLibrary();
    }
    if (!document.getElementById('randomize-btn')) {
      setupRandomizerButton();
    }
    
    // Show interior UI
    showInteriorUI();
    
    // Move player into room
    if (playerBody) {
      playerBody.setTranslation({ x: 0, y: 1.7, z: 0 }, true);
      playerBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }
    
    console.log('Entered interiors mode');
  } else {
    console.log('Exiting interiors mode...');
    
    // Hide interior UI
    hideInteriorUI();
    
    // Clear interior
    clearInteriorRoom();
    
    // Remove interiorsGroup from parent
    if (interiorsGroup.parent) {
      interiorsGroup.parent.remove(interiorsGroup);
    }
    
    // Restore city
    if (worldRoot) {
      worldRoot.visible = true;
    }
    
    // Restore player position
    if (playerBody && savedPlayerChunk) {
      playerBody.setTranslation(savedPlayerChunk, true);
    }
    
    console.log('Exited interiors mode');
  }
}

// Show interior UI elements
export function showInteriorUI() {
  const assetLib = document.getElementById('asset-library');
  const randBtn = document.getElementById('randomize-btn');
  if (assetLib) assetLib.style.display = 'none'; // Hidden by default, show with 'B' key
  if (randBtn) randBtn.style.display = 'block';
}

// Hide interior UI elements
export function hideInteriorUI() {
  const assetLib = document.getElementById('asset-library');
  const randBtn = document.getElementById('randomize-btn');
  if (assetLib) assetLib.style.display = 'none';
  if (randBtn) randBtn.style.display = 'none';
}

// Clear the current interior room
export function clearInteriorRoom() {
  if (!interiorsGroup) return;
  
  // Dispose of all objects and their resources
  interiorRoomObjects.forEach(obj => {
    obj.traverse(node => {
      if (node.geometry) node.geometry.dispose();
      if (node.material) {
        if (Array.isArray(node.material)) {
          node.material.forEach(mat => mat.dispose());
        } else {
          node.material.dispose();
        }
      }
    });
  });
  
  // Clear arrays
  interiorRoomObjects.length = 0;
  interiorInteractiveObjects.length = 0;
  interactiveInteriorsObjects.length = 0;  // Clear interactions
  
  // Clear the group's children without removing the group itself
  interiorsGroup.clear();
  
  console.log('Interior room cleared - interiorsGroup ready for new content');
}

// Handle click interactions in interiors mode
export function onInteriorsClick(event) {
  if (!interiorsMode) return;
  
  // Center of screen for raycasting
  const mouseCenter = new THREE.Vector2(0, 0);
  raycaster.setFromCamera(mouseCenter, camera);
  
  // Check interactive objects
  const intersects = raycaster.intersectObjects(interactiveInteriorsObjects, true);
  
  if (intersects.length > 0) {
    let object = intersects[0].object;
    
    // Find parent group with userData
    while (object && !object.userData.isToiletLid && !object.userData.isClosetDoor && !object.userData.isEntranceDoor && !object.userData.isFridgeDoor) {
      object = object.parent;
      if (!object || object === scene) break;
    }
    
    if (object && object.userData) {
      if (object.userData.isToiletLid) {
        toggleToiletLid(object);
      } else if (object.userData.isClosetDoor || object.userData.isEntranceDoor) {
        toggleInteriorDoor(object, 90);
      } else if (object.userData.isFridgeDoor) {
        toggleInteriorDoor(object, 90);
      }
    }
  }
}

// Animate toilet lid opening/closing
function toggleToiletLid(lidGroup) {
  const isOpen = lidGroup.userData.isOpen || false;
  const targetRotation = isOpen ? 0 : -Math.PI * 0.55; // Open upward/backward (negative for up)
  
  // Animate lid rotation
  const startRotation = lidGroup.rotation.x;
  const duration = 500; // ms
  const startTime = Date.now();
  
  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
    
    lidGroup.rotation.x = startRotation + (targetRotation - startRotation) * eased;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      lidGroup.userData.isOpen = !isOpen;
    }
  }
  
  animate();
}

// Animate door opening/closing
function toggleInteriorDoor(doorGroup, maxAngle) {
  const isOpen = doorGroup.userData.isOpen || false;
  const targetRotation = isOpen ? 0 : (maxAngle * Math.PI / 180);
  
  // Animate door rotation
  const startRotation = doorGroup.rotation.y;
  const duration = 600; // ms
  const startTime = Date.now();
  
  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
    
    doorGroup.rotation.y = startRotation + (targetRotation - startRotation) * eased;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      doorGroup.userData.isOpen = !isOpen;
    }
  }
  
  animate();
}

// Wrapper function to call the real generateInteriorRoom from scale-ultra.html
export function generateInteriorRoom(roomType, useRandom = false) {
  if (generateInteriorRoomImpl) {
    return generateInteriorRoomImpl(roomType, useRandom);
  } else {
    console.error('generateInteriorRoom not initialized! Call initInteriors with generateInteriorRoom function.');
  }
}

// Wrapper functions for UI setup
function setupAssetLibrary() {
  if (setupAssetLibraryImpl) {
    return setupAssetLibraryImpl();
  } else {
    console.warn('setupAssetLibrary not initialized');
  }
}

function setupRandomizerButton() {
  if (setupRandomizerButtonImpl) {
    return setupRandomizerButtonImpl();
  } else {
    console.warn('setupRandomizerButton not initialized');
  }
}

