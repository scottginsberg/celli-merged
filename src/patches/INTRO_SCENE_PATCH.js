/**
 * IntroSceneComplete Sequence Builder Compatibility Patch
 * 
 * Add this to IntroSceneComplete.js to make it immediately compatible
 * with the Sequence Builder's auto-ingest feature.
 * 
 * USAGE:
 * ------
 * 1. Import at top of IntroSceneComplete.js:
 *    import { makeSceneComposable } from '../utils/sceneComposabilityHelper.js';
 * 
 * 2. Add at END of constructor:
 *    makeSceneComposable(this, {
 *      name: 'Intro Scene Complete',
 *      version: '5.7',
 *      description: 'Complete intro sequence with voxel formation, glitch, and portal'
 *    });
 * 
 * That's it! The helper will auto-convert introCfg to timing.phases.
 */

// ALTERNATIVE: Manual implementation
// If you prefer not to use the helper, add this code directly:

export const INTRO_SCENE_TIMING_PATCH = `
  // Add this method to IntroSceneComplete class
  _initializeSequenceBuilderData() {
    // Convert introCfg to composable timing structure
    if (this.introCfg) {
      this.timing = {
        phases: [
          { name: 'Roll Phase', start: 0, end: this.introCfg.rollEnd, type: 'animation', duration: this.introCfg.rollEnd },
          { name: 'Bounce Phase', start: this.introCfg.rollEnd, end: this.introCfg.bounceEnd, type: 'animation', duration: this.introCfg.bounceEnd - this.introCfg.rollEnd },
          { name: 'Triangle Form', start: this.introCfg.bounceEnd, end: this.introCfg.triangleEnd, type: 'animation', duration: this.introCfg.triangleEnd - this.introCfg.bounceEnd },
          { name: 'Orbit Transition', start: this.introCfg.triangleEnd, end: this.introCfg.transitionEnd, type: 'transition', duration: this.introCfg.transitionEnd - this.introCfg.triangleEnd },
          { name: 'Normal Mode', start: this.introCfg.transitionEnd, end: this.introCfg.normalEnd, type: 'animation', duration: this.introCfg.normalEnd - this.introCfg.transitionEnd },
          { name: 'Venn Diagram', start: this.introCfg.normalEnd, end: this.introCfg.vennEnd, type: 'animation', duration: this.introCfg.vennEnd - this.introCfg.normalEnd },
          { name: 'Collapse', start: this.introCfg.vennEnd, end: this.introCfg.collapseEnd, type: 'transition', duration: this.introCfg.collapseEnd - this.introCfg.vennEnd },
          { name: 'Glitch Effect', start: this.introCfg.collapseEnd, end: this.introCfg.glitchEnd, type: 'event', duration: this.introCfg.glitchEnd - this.introCfg.collapseEnd },
          { name: 'Blackout', start: this.introCfg.glitchEnd, end: this.introCfg.blackoutEnd, type: 'transition', duration: this.introCfg.blackoutEnd - this.introCfg.glitchEnd },
          { name: 'Loomworks Text', start: this.introCfg.blackoutEnd, end: this.introCfg.loomworksEnd, type: 'dialogue', duration: this.introCfg.loomworksEnd - this.introCfg.blackoutEnd },
          { name: 'CELLI Voxel', start: this.introCfg.loomworksEnd, end: this.introCfg.celliEnd, type: 'animation', duration: this.introCfg.celliEnd - this.introCfg.loomworksEnd },
          { name: 'Doorway Portal', start: this.introCfg.celliEnd, end: this.introCfg.doorwayEnd, type: 'transition', duration: this.introCfg.doorwayEnd - this.introCfg.celliEnd }
        ].filter(p => p.duration > 0),
        markers: {},
        duration: this.introCfg.doorwayEnd || 0
      };
      
      console.log(\`✅ IntroSceneComplete: timing.phases initialized (\${this.timing.phases.length} phases)\`);
    }
    
    // Wrap motionCfg if it exists
    if (this.motionCfg && !this.motion) {
      this.motion = { ...this.motionCfg };
    }
    
    // Set metadata
    this.sequenceMetadata = {
      name: 'Intro Scene Complete',
      version: '5.7',
      description: 'Complete intro sequence with voxel formation, glitch effects, and portal transition'
    };
  }
  
  // Call this at the END of constructor:
  // this._initializeSequenceBuilderData();
`;

// Export for reference
export default INTRO_SCENE_TIMING_PATCH;

