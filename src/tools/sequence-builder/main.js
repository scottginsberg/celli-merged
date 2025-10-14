/**
 * Celli Sequence Builder - Main Entry Point
 * Initializes and orchestrates all sequence builder components
 */

import { ResizableManager } from './ResizableManager.js';
import { DialogueManager } from './DialogueManager.js';
import { sequenceBuilder } from '../SequenceBuilderCore.js';

console.log('🎬 Celli Sequence Builder - Initializing...');

// Simple initialization function
export async function initSequenceBuilder(overlayMode = false) {
  try {
    console.log(`Mode: ${overlayMode ? 'Overlay' : 'Standalone'}`);
    
    // Show loading
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingDetail = document.getElementById('loadingDetail');
    
    if (loadingOverlay) {
      loadingOverlay.style.display = 'flex';
      console.log('✅ Loading overlay shown');
    } else {
      console.warn('⚠️ Loading overlay not found');
    }
    
    if (loadingDetail) loadingDetail.textContent = 'Initializing managers...';
    
    // Initialize managers
    const container = document.getElementById('builderContainer');
    if (!container) {
      throw new Error('Builder container not found');
    }
    
    const resizableManager = new ResizableManager(container);
    resizableManager.init();
    console.log('✅ Resizable manager initialized');
    
    const dialogueManager = new DialogueManager();
    console.log('✅ Dialogue manager initialized');
    
    // Store globally for now (will be improved)
    window.resizableManager = resizableManager;
    window.dialogueManager = dialogueManager;
    window.sequenceBuilder = sequenceBuilder;
    
    if (loadingDetail) loadingDetail.textContent = 'Detecting scene...';
    
    // Detect scene
    const sceneName = detectCurrentScene();
    const sceneNameEl = document.getElementById('sceneName');
    if (sceneNameEl) {
      sceneNameEl.textContent = sceneName;
      console.log(`✅ Scene detected: ${sceneName}`);
    } else {
      console.warn('⚠️ Scene name element not found');
    }
    
    if (loadingDetail) loadingDetail.textContent = 'Setting up event listeners...';
    
    // Setup basic event listeners
    setupEventListeners();
    console.log('✅ Event listeners set up');
    
    if (loadingDetail) loadingDetail.textContent = 'Ready!';
    
    // Hide loading
    setTimeout(() => {
      if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
        console.log('✅ Sequence Builder Ready');
      }
    }, 300);
    
  } catch (error) {
    console.error('❌ Error initializing Sequence Builder:', error);
    alert(`Failed to initialize Sequence Builder:\n\n${error.message}\n\nCheck console for details.`);
    
    // Hide loading even on error
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.style.display = 'none';
  }
}

function detectCurrentScene() {
  try {
    if (window.parent && window.parent !== window) {
      if (window.parent.currentScene) {
        return window.parent.currentScene.constructor.name;
      }
      if (window.parent.introScene) {
        return 'IntroSceneComplete';
      }
    }
    
    if (window.opener) {
      if (window.opener.currentScene) {
        return window.opener.currentScene.constructor.name;
      }
      if (window.opener.introScene) {
        return 'IntroSceneComplete';
      }
    }
  } catch (e) {
    console.warn('Could not detect scene:', e);
  }
  
  return 'IntroSceneComplete';
}

function setupEventListeners() {
  // Close button
  const closeBtn = document.getElementById('closeBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (confirm('Close Sequence Builder?')) {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'closeSequenceBuilder' }, '*');
        } else {
          window.close();
        }
      }
    });
  }
  
  // Auto-ingest button
  const autoIngestBtn = document.getElementById('autoIngestBtn');
  if (autoIngestBtn) {
    autoIngestBtn.addEventListener('click', async () => {
      console.log('🔄 Auto-ingesting scene...');
      
      const sceneDropdown = document.getElementById('sceneDropdown');
      const selectedScene = sceneDropdown ? sceneDropdown.value : '';
      
      console.log(`Selected scene from dropdown: "${selectedScene}"`);
      
      let sceneObject = null;
      
      try {
        // Try parent window first
        if (window.parent && window.parent !== window) {
          console.log('Checking parent window for scene...');
          
          // PRIORITY 1: Check for running scene instances FIRST
          if (window.parent.introScene) {
            const introSceneName = window.parent.introScene.constructor.name;
            console.log(`Found introScene: ${introSceneName}`);
            
            // If no selection or selection matches intro
            if (!selectedScene || selectedScene === '' || introSceneName === selectedScene || selectedScene === 'IntroSceneComplete') {
              sceneObject = window.parent.introScene;
              console.log(`✅ Using intro scene: ${introSceneName}`);
            }
          }
          
          // PRIORITY 2: Check currentScene
          if (!sceneObject && window.parent.currentScene) {
            const currentSceneName = window.parent.currentScene.constructor.name;
            console.log(`Found currentScene: ${currentSceneName}`);
            
            // If no selection or selection matches current
            if (!selectedScene || selectedScene === '' || currentSceneName === selectedScene) {
              sceneObject = window.parent.currentScene;
              console.log(`✅ Using current scene: ${currentSceneName}`);
            }
          }
          
          // PRIORITY 3: Try direct property lookup (for scene classes)
          if (!sceneObject && selectedScene) {
            sceneObject = window.parent[selectedScene] || 
                         window.parent[selectedScene.toLowerCase()] ||
                         window.parent[selectedScene.charAt(0).toLowerCase() + selectedScene.slice(1)];
            
            if (sceneObject) {
              console.log(`✅ Found scene via property: ${selectedScene}`);
            }
          }
        }
        
        // Try opener window if not found in parent
        if (!sceneObject && window.opener) {
          console.log('Checking opener window for scene...');
          
          // PRIORITY 1: Check for running scene instances FIRST
          if (window.opener.introScene) {
            const introSceneName = window.opener.introScene.constructor.name;
            console.log(`Found opener introScene: ${introSceneName}`);
            
            if (!selectedScene || selectedScene === '' || introSceneName === selectedScene || selectedScene === 'IntroSceneComplete') {
              sceneObject = window.opener.introScene;
              console.log(`✅ Using opener intro scene: ${introSceneName}`);
            }
          }
          
          // PRIORITY 2: Check currentScene
          if (!sceneObject && window.opener.currentScene) {
            const currentSceneName = window.opener.currentScene.constructor.name;
            console.log(`Found opener currentScene: ${currentSceneName}`);
            
            if (!selectedScene || selectedScene === '' || currentSceneName === selectedScene) {
              sceneObject = window.opener.currentScene;
              console.log(`✅ Using opener current scene: ${currentSceneName}`);
            }
          }
          
          // PRIORITY 3: Try direct property lookup
          if (!sceneObject && selectedScene) {
            sceneObject = window.opener[selectedScene] || 
                         window.opener[selectedScene.toLowerCase()] ||
                         window.opener[selectedScene.charAt(0).toLowerCase() + selectedScene.slice(1)];
            
            if (sceneObject) {
              console.log(`✅ Found scene via opener property: ${selectedScene}`);
            }
          }
        }
      } catch (e) {
        console.error('❌ Error accessing scene:', e);
      }
      
      console.log(`Scene object result:`, sceneObject ? sceneObject.constructor.name : 'NULL');
      
      if (!sceneObject) {
        const sceneName = selectedScene || 'current scene';
        
        // Offer to switch to the scene
        if (selectedScene && confirm(`Scene "${sceneName}" is not currently running.\n\nWould you like to switch to this scene first?`)) {
          const transitioned = await window.sequenceBuilder.transitionToScene(selectedScene);
          
          if (transitioned) {
            alert(`Switched to ${selectedScene}. Please wait for the scene to load, then try auto-ingest again.`);
          } else {
            alert(`Could not switch to scene "${selectedScene}".\n\nMake sure:\n1. The main app is running in parent/opener window\n2. The scene is available in the scene registry\n3. The transitionToScene function is available`);
          }
        } else {
          alert(`Could not find scene object for "${sceneName}".\n\nOptions:\n1. Switch to the scene using the dropdown + "Switch to Scene" button\n2. Make sure a scene is running in the parent window\n3. Open this builder from within a running scene`);
        }
        return;
      }
      
      console.log(`Found scene object:`, sceneObject.constructor ? sceneObject.constructor.name : 'unknown');
      
      // Check if it's a class constructor (not instantiated)
      const isClass = typeof sceneObject === 'function';
      
      if (isClass) {
        alert(`Found scene class "${sceneObject.name}" but it's not instantiated.\n\nPlease switch to this scene first, then try auto-ingest.`);
        
        if (confirm(`Would you like to switch to ${sceneObject.name} now?`)) {
          const transitioned = await window.sequenceBuilder.transitionToScene(selectedScene);
          if (transitioned) {
            alert(`Switched to ${sceneObject.name}. Please wait for scene to load, then try auto-ingest again.`);
          }
        }
        return;
      }
      
      if (confirm(`Auto-ingest data from ${sceneObject.constructor ? sceneObject.constructor.name : 'scene'}?`)) {
        const nodes = await window.sequenceBuilder.autoIngestScene(sceneObject, window.nodeGraphManager);
        alert(`Ingested ${nodes ? nodes.length : 0} nodes from scene`);
      }
    });
  }
  
  // Scene dropdown
  const sceneDropdown = document.getElementById('sceneDropdown');
  if (sceneDropdown) {
    sceneDropdown.addEventListener('change', (e) => {
      const sceneName = e.target.value || 'Current Scene';
      document.getElementById('sceneName').textContent = sceneName;
      console.log('Scene selection changed:', sceneName);
    });
  }
  
  // Switch to Scene button
  const switchSceneBtn = document.getElementById('switchSceneBtn');
  if (switchSceneBtn) {
    switchSceneBtn.addEventListener('click', async () => {
      const sceneDropdown = document.getElementById('sceneDropdown');
      const selectedScene = sceneDropdown ? sceneDropdown.value : '';
      
      if (!selectedScene) {
        alert('Please select a scene from the dropdown first.');
        return;
      }
      
      console.log(`🔄 Switching to scene: ${selectedScene}`);
      
      if (confirm(`Switch to ${selectedScene}?`)) {
        const transitioned = await window.sequenceBuilder.transitionToScene(selectedScene);
        
        if (transitioned) {
          alert(`✅ Switched to ${selectedScene}!\n\nYou can now auto-ingest this scene's data.`);
          // Update the scene badge
          document.getElementById('sceneName').textContent = selectedScene;
        } else {
          alert(`❌ Could not switch to ${selectedScene}.\n\nMake sure:\n1. The main app is running in parent/opener window\n2. The scene is available\n3. The transitionToScene function is available`);
        }
      }
    });
  }
  
  // Export button
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const data = {
        scene: document.getElementById('sceneName').textContent,
        dialogues: window.dialogueManager.exportDialogues(),
        timestamp: Date.now()
      };
      
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sequence_${data.scene}_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      navigator.clipboard.writeText(json);
      alert('✅ Exported and copied to clipboard!');
    });
  }
  
  console.log('✅ Event listeners initialized');
}

// Export all functions (initialization is handled by index.html)
export { detectCurrentScene, setupEventListeners, initSequenceBuilder };

