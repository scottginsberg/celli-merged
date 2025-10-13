/**
 * Register all scene components with the Scene Registry
 * This makes everything "ingestible" by the sequence composer
 */

import { sceneRegistry } from './SceneRegistry.js';

/**
 * Register all scene objects and components
 */
export function registerSceneComponents(app) {
  console.log('📝 Registering scene components...');

  // Register categories
  sceneRegistry.registerCategory('Scene Objects', {
    icon: '🎬',
    description: 'Primary scene objects and characters'
  });

  sceneRegistry.registerCategory('Environment', {
    icon: '🌍',
    description: 'Camera, lighting, and environment'
  });

  sceneRegistry.registerCategory('Effects', {
    icon: '✨',
    description: 'Visual effects and post-processing'
  });

  sceneRegistry.registerCategory('Audio', {
    icon: '🔊',
    description: 'Audio systems and soundscapes'
  });

  // Register spheres (cyan square, yellow triangle, magenta circle)
  if (app.spheres) {
    app.spheres.forEach((sphere, index) => {
      const names = ['square', 'triangle', 'circle'];
      const colors = ['cyan', 'yellow', 'magenta'];
      
      sceneRegistry.registerEntity('Scene Objects', names[index], {
        icon: ['🔷', '🔺', '🟣'][index],
        type: 'mesh',
        reference: sphere,
        components: [
          { name: 'position.x', type: 'number', path: `spheres[${index}].position.x` },
          { name: 'position.y', type: 'number', path: `spheres[${index}].position.y` },
          { name: 'position.z', type: 'number', path: `spheres[${index}].position.z` },
          { name: 'rotation.z', type: 'number', path: `spheres[${index}].rotation.z` },
          { name: 'scale.x', type: 'number', path: `spheres[${index}].scale.x` },
          { name: 'scale.y', type: 'number', path: `spheres[${index}].scale.y` },
          { name: 'visible', type: 'boolean', path: `spheres[${index}].visible` },
          { name: 'opacity', type: 'number', path: `spheres[${index}].material.opacity` },
          { name: 'color', type: 'color', path: `spheres[${index}].material.color` }
        ]
      });
    });
  }

  // Register CELLI voxel system
  if (app.voxels) {
    sceneRegistry.registerEntity('Scene Objects', 'celli', {
      icon: '📦',
      type: 'voxel-system',
      reference: app.voxels,
      components: [
        { name: 'visible', type: 'boolean', path: 'voxels.visible' },
        { name: 'opacity', type: 'number', path: 'voxels.opacity' },
        { name: 'position.y', type: 'number', path: 'voxels.position.y' },
        { name: 'scale', type: 'number', path: 'voxels.scale' }
      ],
      parts: [
        {
          name: 'letter_C',
          components: [
            { name: 'opacity', type: 'number', path: 'voxels.letter[0].opacity' }
          ]
        },
        {
          name: 'letter_E',
          components: [
            { name: 'opacity', type: 'number', path: 'voxels.letter[1].opacity' }
          ]
        },
        {
          name: 'letter_L1',
          components: [
            { name: 'opacity', type: 'number', path: 'voxels.letter[2].opacity' }
          ]
        },
        {
          name: 'letter_L2',
          components: [
            { name: 'opacity', type: 'number', path: 'voxels.letter[3].opacity' }
          ]
        },
        {
          name: 'letter_I',
          components: [
            { name: 'opacity', type: 'number', path: 'voxels.letter[4].opacity' }
          ]
        }
      ]
    });
  }

  // Register Camera
  if (app.camera) {
    sceneRegistry.registerEntity('Environment', 'camera', {
      icon: '📷',
      type: 'camera',
      reference: app.camera,
      components: [
        { name: 'position.x', type: 'number', path: 'camera.position.x' },
        { name: 'position.y', type: 'number', path: 'camera.position.y' },
        { name: 'position.z', type: 'number', path: 'camera.position.z' },
        { name: 'zoom', type: 'number', path: 'camera.zoom' },
        { name: 'near', type: 'number', path: 'camera.near' },
        { name: 'far', type: 'number', path: 'camera.far' }
      ]
    });
  }

  // Register Renderer
  if (app.renderer) {
    sceneRegistry.registerEntity('Environment', 'renderer', {
      icon: '🖼️',
      type: 'renderer',
      reference: app.renderer,
      components: [
        { name: 'toneMappingExposure', type: 'number', path: 'renderer.toneMappingExposure' },
        { name: 'clearColor', type: 'color', path: 'renderer.clearColor' },
        { name: 'clearAlpha', type: 'number', path: 'renderer.clearAlpha' }
      ]
    });
  }

  // Register Post-Processing Effects
  if (app.composer) {
    sceneRegistry.registerEntity('Effects', 'bloom', {
      icon: '✨',
      type: 'effect',
      components: [
        { name: 'strength', type: 'number', path: 'composer.passes[1].strength' },
        { name: 'radius', type: 'number', path: 'composer.passes[1].radius' },
        { name: 'threshold', type: 'number', path: 'composer.passes[1].threshold' }
      ]
    });

    sceneRegistry.registerEntity('Effects', 'afterimage', {
      icon: '👻',
      type: 'effect',
      components: [
        { name: 'damp', type: 'number', path: 'composer.passes[2].uniforms.damp.value' }
      ]
    });

    sceneRegistry.registerEntity('Effects', 'filmGrain', {
      icon: '📺',
      type: 'effect',
      components: [
        { name: 'noise', type: 'number', path: 'composer.passes[3].uniforms.noise.value' },
        { name: 'scanlines', type: 'number', path: 'composer.passes[3].uniforms.scanAmp.value' }
      ]
    });
  }

  // Register Black Hole
  if (app.scene) {
    const blackHole = app.scene.children.find(child => child.material?.uniforms?.pulseFactor);
    if (blackHole) {
      sceneRegistry.registerEntity('Scene Objects', 'blackHole', {
        icon: '⚫',
        type: 'mesh',
        reference: blackHole,
        components: [
          { name: 'pulseFactor', type: 'number', path: 'blackHole.material.uniforms.pulseFactor.value' },
          { name: 'position.x', type: 'number', path: 'blackHole.position.x' },
          { name: 'position.y', type: 'number', path: 'blackHole.position.y' },
          { name: 'position.z', type: 'number', path: 'blackHole.position.z' },
          { name: 'scale', type: 'number', path: 'blackHole.scale.x' },
          { name: 'visible', type: 'boolean', path: 'blackHole.visible' }
        ]
      });
    }
  }

  console.log(`✅ Registered ${sceneRegistry.entities.size} entities across ${sceneRegistry.categories.size} categories`);
}

/**
 * Register GUI components
 */
export function registerGUIComponents(guiComponents) {
  if (!guiComponents) return;

  Object.keys(guiComponents).forEach(name => {
    const component = guiComponents[name];
    if (component) {
      sceneRegistry.registerGUIComponent(name, component);
    }
  });

  console.log(`✅ Registered ${sceneRegistry.guiComponents.size} GUI components`);
}

export default { registerSceneComponents, registerGUIComponents };

