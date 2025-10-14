/**
 * Celli Sequence Builder Core
 * Componentized module for sequence building functionality
 */

export class SequenceBuilderCore {
  constructor() {
    this.currentScene = null;
    this.sceneList = [
      'IntroSceneComplete',
      'VisiCalcScene',
      'CelliRealScene',
      'FullhandScene',
      'End3Scene',
      'CityScene',
      'LeaveScene'
    ];
  }

  /**
   * Auto-ingest current scene and create sequence nodes
   */
  async autoIngestScene(sceneObject, nodeGraphManager) {
    console.log('🔍 Auto-ingesting scene:', sceneObject);
    console.log('Scene properties:', Object.keys(sceneObject));
    
    if (!sceneObject) {
      console.warn('No scene object provided');
      return [];
    }

    const nodes = [];
    let xPos = 100;
    let yPos = 100;
    const xSpacing = 300;
    const ySpacing = 150;

    // NEW: Extract from timing.phases (BaseScene compatible)
    if (sceneObject.timing && sceneObject.timing.phases && sceneObject.timing.phases.length > 0) {
      console.log('✅ Found timing.phases:', sceneObject.timing.phases);
      
      sceneObject.timing.phases.forEach((phase, index) => {
        const node = nodeGraphManager.createNode(
          phase.type || 'animation',
          xPos,
          yPos,
          {
            speaker: phase.name,
            text: `Duration: ${phase.duration.toFixed(2)}s | Start: ${phase.start.toFixed(2)}s`,
            timestamp: phase.start,
            duration: phase.duration.toFixed(2) + 's'
          }
        );
        nodes.push(node);
        
        // Connect to previous node
        if (index > 0 && nodes[index - 1]) {
          nodeGraphManager.connections.push({
            from: nodes[index - 1].id,
            to: node.id,
            fromSocket: 'output-0',
            toSocket: 'input-0'
          });
        }
        
        yPos += ySpacing;
        if (index % 5 === 0 && index > 0) {
          xPos += xSpacing;
          yPos = 100;
        }
      });
    }
    // OLD: Extract timing configuration from introCfg (backward compatibility)
    else if (sceneObject.introCfg) {
      console.log('✅ Found introCfg:', sceneObject.introCfg);
      const cfg = sceneObject.introCfg;
      const phases = [
        { name: 'Roll Phase', start: 0, end: cfg.rollEnd, type: 'animation' },
        { name: 'Bounce Phase', start: cfg.rollEnd, end: cfg.bounceEnd, type: 'animation' },
        { name: 'Triangle Form', start: cfg.bounceEnd, end: cfg.triangleEnd, type: 'animation' },
        { name: 'Orbit Transition', start: cfg.triangleEnd, end: cfg.transitionEnd, type: 'transition' },
        { name: 'Normal Mode', start: cfg.transitionEnd, end: cfg.normalEnd, type: 'animation' },
        { name: 'Venn Diagram', start: cfg.normalEnd, end: cfg.vennEnd, type: 'animation' },
        { name: 'Collapse', start: cfg.vennEnd, end: cfg.collapseEnd, type: 'transition' },
        { name: 'Glitch Effect', start: cfg.collapseEnd, end: cfg.glitchEnd, type: 'event' },
        { name: 'Blackout', start: cfg.glitchEnd, end: cfg.blackoutEnd, type: 'transition' },
        { name: 'Loomworks Text', start: cfg.blackoutEnd, end: cfg.loomworksEnd, type: 'dialogue' },
        { name: 'CELLI Voxel', start: cfg.loomworksEnd, end: cfg.celliEnd, type: 'animation' },
        { name: 'Doorway Portal', start: cfg.celliEnd, end: cfg.doorwayEnd, type: 'transition' }
      ];

      phases.forEach((phase, index) => {
        if (phase.end && phase.end > (phase.start || 0)) {
          const duration = phase.end - (phase.start || 0);
          const node = nodeGraphManager.createNode(
            phase.type,
            xPos,
            yPos,
            {
              speaker: phase.name,
              text: `Duration: ${duration.toFixed(2)}s | Start: ${(phase.start || 0).toFixed(2)}s`,
              timestamp: phase.start || 0,
              duration: duration.toFixed(2) + 's'
            }
          );
          nodes.push(node);
          
          // Connect to previous node
          if (index > 0 && nodes[index - 1]) {
            nodeGraphManager.connections.push({
              from: nodes[index - 1].id,
              to: node.id,
              fromSocket: 'output-0',
              toSocket: 'input-0'
            });
          }
          
          yPos += ySpacing;
          if (index % 5 === 0 && index > 0) {
            xPos += xSpacing;
            yPos = 100;
          }
        }
      });
    } else {
      console.log('⚠️ No introCfg found');
    }

    // NEW: Extract dialogues from events.dialogues
    if (sceneObject.events && sceneObject.events.dialogues && sceneObject.events.dialogues.length > 0) {
      console.log('✅ Found events.dialogues:', sceneObject.events.dialogues);
      
      sceneObject.events.dialogues.forEach((dialogue) => {
        const node = nodeGraphManager.createNode(
          'dialogue',
          xPos + xSpacing,
          yPos,
          {
            speaker: dialogue.speaker,
            text: dialogue.text,
            timestamp: dialogue.timestamp,
            display: dialogue.display || 'subtitle'
          }
        );
        nodes.push(node);
        yPos += ySpacing;
      });
      
      // Reset position for next category
      xPos += xSpacing;
      yPos = 100;
    }
    
    // NEW: Extract events from events.triggers
    if (sceneObject.events && sceneObject.events.triggers && sceneObject.events.triggers.length > 0) {
      console.log('✅ Found events.triggers:', sceneObject.events.triggers);
      
      sceneObject.events.triggers.forEach((trigger) => {
        const node = nodeGraphManager.createNode(
          'event',
          xPos + xSpacing,
          yPos,
          {
            speaker: trigger.name,
            text: `Action: ${trigger.action}\nTimestamp: ${trigger.timestamp}s`,
            timestamp: trigger.timestamp
          }
        );
        nodes.push(node);
        yPos += ySpacing;
      });
      
      xPos += xSpacing;
      yPos = 100;
    }
    
    // NEW: Extract from motion (BaseScene compatible)
    if (sceneObject.motion && Object.keys(sceneObject.motion).length > 0) {
      console.log('✅ Found motion:', sceneObject.motion);
      
      Object.keys(sceneObject.motion).forEach(category => {
        const motions = sceneObject.motion[category];
        if (motions && typeof motions === 'object') {
          Object.keys(motions).forEach(key => {
            const node = nodeGraphManager.createNode(
              'parameter',
              xPos,
              yPos,
              {
                speaker: `${category}.${key}`,
                text: JSON.stringify(motions[key]).substring(0, 80) + '...',
                path: `motion.${category}.${key}`
              }
            );
            nodes.push(node);
            yPos += ySpacing;
          });
        }
      });
    }
    // OLD: Extract motion configuration (backward compatibility)
    else if (sceneObject.motionCfg) {
      console.log('✅ Found motionCfg:', sceneObject.motionCfg);
      const cfg = sceneObject.motionCfg;
      Object.keys(cfg).forEach((key) => {
        const motion = cfg[key];
        if (motion && typeof motion === 'object') {
          const node = nodeGraphManager.createNode(
            'parameter',
            xPos + xSpacing,
            yPos,
            {
              speaker: `Motion: ${key}`,
              text: JSON.stringify(motion).substring(0, 80) + '...',
              path: `motionCfg.${key}`
            }
          );
          nodes.push(node);
          yPos += ySpacing;
        }
      });
    } else {
      console.log('⚠️ No motionCfg found');
    }

    // Extract sequence array
    if (sceneObject.sequence && Array.isArray(sceneObject.sequence)) {
      console.log('✅ Found sequence array:', sceneObject.sequence);
      sceneObject.sequence.forEach((seq, index) => {
        const node = nodeGraphManager.createNode(
          seq.type || 'animation',
          xPos + xSpacing * 2,
          yPos,
          {
            speaker: seq.name || `Sequence ${index + 1}`,
            text: `Duration: ${seq.duration || 1.0}s | Start: ${seq.startTime || seq.time || 0}s`,
            timestamp: seq.startTime || seq.time || 0,
            duration: seq.duration || 1.0
          }
        );
        nodes.push(node);
        yPos += ySpacing;
      });
    } else {
      console.log('⚠️ No sequence array found');
    }
    
    // If still no nodes, scan all properties
    if (nodes.length === 0) {
      console.log('⚠️ No standard properties found, scanning all properties...');
      
      const sceneProps = Object.keys(sceneObject);
      console.log(`Scene has ${sceneProps.length} properties:`, sceneProps);
      
      // Look for config-like objects
      sceneProps.forEach(prop => {
        const value = sceneObject[prop];
        if (value && typeof value === 'object' && (!value.constructor || value.constructor.name === 'Object')) {
          const configKeys = Object.keys(value);
          if (configKeys.length > 0 && configKeys.length < 50) {
            console.log(`Found potential config object: ${prop}`, value);
            
            const node = nodeGraphManager.createNode(
              'parameter',
              xPos,
              yPos,
              {
                speaker: prop,
                text: `Config with ${configKeys.length} properties: ${configKeys.slice(0, 3).join(', ')}...`
              }
            );
            nodes.push(node);
            yPos += ySpacing;
          }
        }
      });
    }
    
    // Absolute fallback - create a sample node
    if (nodes.length === 0) {
      console.log('⚠️ No data could be extracted. Creating sample node...');
      const sceneName = sceneObject.constructor ? sceneObject.constructor.name : 'Unknown Scene';
      
      const node = nodeGraphManager.createNode(
        'object',
        xPos,
        yPos,
        {
          speaker: sceneName,
          text: `Scene object found but no extractable sequence data.\n\nProperties: ${Object.keys(sceneObject).slice(0, 5).join(', ')}...`
        }
      );
      nodes.push(node);
    }

    nodeGraphManager._updateConnections();
    console.log(`✅ Auto-ingested ${nodes.length} nodes from scene`);
    console.log(`Total nodes in graph: ${nodeGraphManager.nodes.length}`);
    console.log(`Nodes in DOM: ${nodeGraphManager.nodesContainer.children.length}`);
    
    // Switch to graph tab to show nodes (if tab element exists)
    if (typeof document !== 'undefined') {
      const graphTab = document.querySelector('.tab-btn[data-tab="graph"]');
      if (graphTab) {
        graphTab.click();
        console.log('✅ Switched to Node Graph tab');
      }
    }
    
    return nodes;
  }

  /**
   * Get scene object or scene class from parent window or opener
   */
  getSceneObject(sceneName) {
    try {
      // Try parent window
      if (window.parent && window.parent !== window) {
        if (sceneName) {
          // First, check if parent has getSceneByName helper
          if (window.parent.getSceneByName) {
            const scene = window.parent.getSceneByName(sceneName);
            if (scene) {
              console.log(`✅ Found scene via getSceneByName: ${sceneName}`);
              return scene;
            }
          }
          
          // Try to get scene instance first
          let scene = window.parent[sceneName] || 
                     window.parent[sceneName.toLowerCase()] ||
                     window.parent[sceneName.charAt(0).toLowerCase() + sceneName.slice(1)];
          
          // Check for introScene first (common case)
          if (!scene && window.parent.introScene) {
            const introSceneName = window.parent.introScene.constructor.name;
            console.log(`Checking introScene: ${introSceneName} vs requested: ${sceneName}`);
            if (introSceneName === sceneName || sceneName === 'IntroSceneComplete') {
              scene = window.parent.introScene;
              console.log(`✅ Found intro scene instance: ${introSceneName}`);
            }
          }
          
          // Check if it's the currently running scene
          if (!scene && window.parent.currentScene) {
            const currentSceneName = window.parent.currentScene.constructor.name;
            console.log(`Checking currentScene: ${currentSceneName} vs requested: ${sceneName}`);
            if (currentSceneName === sceneName) {
              scene = window.parent.currentScene;
              console.log(`✅ Found current running scene: ${sceneName}`);
            }
          }
          
          // Try to get from scene registry/scenes object
          if (!scene && window.parent.scenes) {
            const sceneKey = Object.keys(window.parent.scenes).find(key => 
              window.parent.scenes[key].name === sceneName || key === sceneName.toLowerCase()
            );
            if (sceneKey) {
              scene = window.parent.scenes[sceneKey];
              console.log(`✅ Found scene class in registry: ${sceneName} (key: ${sceneKey})`);
            }
          }
          
          if (scene) return scene;
        }
        
        // Default to current scene
        console.log('⚠️ No specific scene found, using current scene');
        return window.parent.currentScene || window.parent.introScene;
      }

      // Try opener window
      if (window.opener) {
        if (sceneName) {
          // Check if opener has getSceneByName helper
          if (window.opener.getSceneByName) {
            const scene = window.opener.getSceneByName(sceneName);
            if (scene) {
              console.log(`✅ Found scene via getSceneByName: ${sceneName}`);
              return scene;
            }
          }
          
          let scene = window.opener[sceneName] || 
                     window.opener[sceneName.toLowerCase()] ||
                     window.opener[sceneName.charAt(0).toLowerCase() + sceneName.slice(1)];
          
          // Check for introScene first (common case)
          if (!scene && window.opener.introScene) {
            const introSceneName = window.opener.introScene.constructor.name;
            console.log(`Checking opener introScene: ${introSceneName} vs requested: ${sceneName}`);
            if (introSceneName === sceneName || sceneName === 'IntroSceneComplete') {
              scene = window.opener.introScene;
              console.log(`✅ Found intro scene instance: ${introSceneName}`);
            }
          }
          
          if (!scene && window.opener.currentScene) {
            const currentSceneName = window.opener.currentScene.constructor.name;
            console.log(`Checking opener currentScene: ${currentSceneName} vs requested: ${sceneName}`);
            if (currentSceneName === sceneName) {
              scene = window.opener.currentScene;
              console.log(`✅ Found current running scene: ${sceneName}`);
            }
          }
          
          // Try to get from scene registry
          if (!scene && window.opener.scenes) {
            const sceneKey = Object.keys(window.opener.scenes).find(key => 
              window.opener.scenes[key].name === sceneName || key === sceneName.toLowerCase()
            );
            if (sceneKey) {
              scene = window.opener.scenes[sceneKey];
              console.log(`✅ Found scene class in registry: ${sceneName} (key: ${sceneKey})`);
            }
          }
          
          if (scene) return scene;
        }
        
        console.log('⚠️ No specific scene found, using current scene');
        return window.opener.currentScene || window.opener.introScene;
      }
    } catch (e) {
      console.warn('Could not access scene object:', e);
    }
    
    console.error(`❌ Could not find scene: ${sceneName}`);
    return null;
  }
  
  /**
   * Request scene transition in parent window
   */
  async transitionToScene(sceneName) {
    try {
      // Map scene class names to scene keys used in main app
      const sceneKeyMap = {
        'IntroSceneComplete': 'intro',
        'VisiCalcScene': 'visicell',
        'CelliRealScene': 'cellireal',
        'FullhandScene': 'fullhand',
        'End3Scene': 'end3',
        'CityScene': 'theos',
        'LeaveScene': 'leave'
      };
      
      const sceneKey = sceneKeyMap[sceneName] || sceneName.toLowerCase();
      
      console.log(`🔄 Attempting to transition to scene: ${sceneName} (key: ${sceneKey})`);
      
      // Try parent window
      if (window.parent && window.parent !== window) {
        if (window.parent.transitionToScene) {
          await window.parent.transitionToScene(sceneKey);
          console.log(`✅ Transitioned to scene: ${sceneName}`);
          return true;
        }
        
        // Try custom event as fallback
        if (window.parent.dispatchEvent) {
          window.parent.dispatchEvent(new CustomEvent('celli:sceneTransition', { 
            detail: { scene: sceneKey } 
          }));
          console.log(`✅ Dispatched scene transition event: ${sceneKey}`);
          return true;
        }
      }
      
      // Try opener window
      if (window.opener) {
        if (window.opener.transitionToScene) {
          await window.opener.transitionToScene(sceneKey);
          console.log(`✅ Transitioned to scene: ${sceneName}`);
          return true;
        }
        
        // Try custom event as fallback
        if (window.opener.dispatchEvent) {
          window.opener.dispatchEvent(new CustomEvent('celli:sceneTransition', { 
            detail: { scene: sceneKey } 
          }));
          console.log(`✅ Dispatched scene transition event: ${sceneKey}`);
          return true;
        }
      }
      
      console.warn('❌ No parent/opener window with transitionToScene function found');
      return false;
    } catch (e) {
      console.error('❌ Could not transition to scene:', e);
      return false;
    }
  }

  /**
   * Generate execute-after hierarchy data
   */
  generateExecuteAfterHierarchy(nodeId, nodeGraphManager) {
    const hierarchy = [];
    const visited = new Set();

    const traverse = (id, depth = 0) => {
      if (visited.has(id)) return;
      visited.add(id);

      const node = nodeGraphManager.nodes.find(n => n.id === id);
      if (!node) return;

      const connections = nodeGraphManager.connections.filter(c => c.from === id);
      
      connections.forEach(conn => {
        const targetNode = nodeGraphManager.nodes.find(n => n.id === conn.to);
        if (targetNode) {
          hierarchy.push({
            id: targetNode.id,
            title: targetNode.data.title || 'Untitled',
            type: targetNode.type,
            depth: depth,
            checked: false
          });
          traverse(targetNode.id, depth + 1);
        }
      });
    };

    traverse(nodeId);
    return hierarchy;
  }
}

// Export singleton instance
export const sequenceBuilder = new SequenceBuilderCore();

