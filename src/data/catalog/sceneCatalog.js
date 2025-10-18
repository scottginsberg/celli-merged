export const sceneCatalog = [
  {
    id: 'core-narrative',
    title: 'Core Narrative',
    icon: '🌌',
    description: 'Primary beats of the Celli experience in their most complete form.',
    scenes: [
      {
        id: 'IntroSceneComplete',
        name: 'Intro Scene (Complete)',
        path: './src/scripts/scenes/IntroSceneComplete.js',
        summary:
          'Fully reconstructed intro sequence with timing data, dialogue phases, and motion definitions ready for ingestion.',
        tags: ['intro', 'canonical', 'phases'],
      },
      {
        id: 'CityScene',
        name: 'City Scene',
        path: './src/scripts/scenes/CityScene.js',
        summary: 'Mid-sequence transition into the neon city environment with camera travel and ambient effects.',
        tags: ['city', 'transition', 'environment'],
      },
      {
        id: 'LeaveScene',
        name: 'Leave Scene',
        path: './src/scripts/scenes/LeaveScene.js',
        summary: 'Exit moment that gracefully winds down the experience and hands control back to the player.',
        tags: ['outro', 'narrative'],
      },
    ],
  },
  {
    id: 'intro-variants',
    title: 'Intro Variations',
    icon: '🎞️',
    description: 'Alternate takes and faithful reconstructions of the opening sequence.',
    scenes: [
      {
        id: 'IntroScene',
        name: 'Intro Scene (Modular)',
        path: './src/scripts/scenes/IntroScene.js',
        summary: 'Modular rebuild that focuses on composable subsystems and simplified motion presets.',
        tags: ['intro', 'modular'],
      },
      {
        id: 'IntroScene-Faithful',
        name: 'Intro Scene (Faithful Cut)',
        path: './src/scripts/scenes/IntroScene-Faithful.js',
        summary: 'Line-by-line port of the legacy intro for regression testing and reference.',
        tags: ['intro', 'legacy', 'reference'],
      },
      {
        id: 'IntroSceneComplete.backup',
        name: 'Intro Scene (Backup Snapshot)',
        path: './src/scripts/scenes/IntroSceneComplete.backup.js',
        summary: 'Checkpoint snapshot of the complete intro prior to refactors—useful when diffing behaviours.',
        tags: ['intro', 'backup'],
      },
    ],
  },
  {
    id: 'celli-real',
    title: 'Celli Real Variations',
    icon: '🧬',
    description: 'Progressive explorations of the Celli Real reconstruction pipeline.',
    scenes: [
      {
        id: 'CelliRealScene',
        name: 'Celli Real Scene',
        path: './src/scripts/scenes/CelliRealScene.js',
        summary: 'Primary rebuild of the Celli Real reveal complete with voxel orchestration hooks.',
        tags: ['celli', 'voxel', 'reveal'],
      },
      {
        id: 'CelliRealScene-Full',
        name: 'Celli Real Scene (Full Cut)',
        path: './src/scripts/scenes/CelliRealScene-Full.js',
        summary: 'Extended director’s cut including transitional beats and additional motion data.',
        tags: ['celli', 'extended'],
      },
      {
        id: 'CelliRealScene-Faithful',
        name: 'Celli Real Scene (Faithful)',
        path: './src/scripts/scenes/CelliRealScene-Faithful.js',
        summary: 'High-fidelity port that mirrors the original timing, easing, and shader usage.',
        tags: ['celli', 'legacy', 'reference'],
      },
    ],
  },
  {
    id: 'fullhand-suite',
    title: 'Fullhand Suite',
    icon: '🖐️',
    description: 'Sequences focused on the Fullhand puzzle and its dramatic reveal.',
    scenes: [
      {
        id: 'FullhandScene',
        name: 'Fullhand Scene',
        path: './src/scripts/scenes/FullhandScene.js',
        summary: 'Primary Fullhand experience with puzzle state transitions and portal choreography.',
        tags: ['fullhand', 'puzzle'],
      },
      {
        id: 'FullhandScene-Faithful',
        name: 'Fullhand Scene (Faithful)',
        path: './src/scripts/scenes/FullhandScene-Faithful.js',
        summary: 'Legacy-aligned port capturing the original pacing and effects sequencing.',
        tags: ['fullhand', 'legacy'],
      },
      {
        id: 'FullEditorScene',
        name: 'Full Editor Scene',
        path: './src/scripts/scenes/FullEditorScene.js',
        summary: 'Developer-focused scene with tooling hooks and editor overlays for debugging.',
        tags: ['tools', 'debug'],
      },
    ],
  },
  {
    id: 'end-sequence',
    title: 'END Sequence',
    icon: '🚪',
    description: 'Climactic end-of-experience sequences and faithful comparisons.',
    scenes: [
      {
        id: 'End3Scene',
        name: 'End Scene (v3)',
        path: './src/scripts/scenes/End3Scene.js',
        summary: 'Current iteration of the END sequence with modernized triggers and transitions.',
        tags: ['end', 'sequence'],
      },
      {
        id: 'End3Scene-Faithful',
        name: 'End Scene (Faithful)',
        path: './src/scripts/scenes/End3Scene-Faithful.js',
        summary: 'Historical baseline for validating behaviour of the finale sequence.',
        tags: ['end', 'legacy'],
      },
      {
        id: 'VisiCellScene',
        name: 'VisiCell Scene',
        path: './src/scripts/scenes/VisiCellScene.js',
        summary: 'Interactive terminal sequence with spreadsheet mechanics and narrative overlays.',
        tags: ['visicell', 'interactive'],
      },
    ],
  },
];

export function flattenSceneCatalog() {
  return sceneCatalog.flatMap((category) =>
    category.scenes.map((scene) => ({
      ...scene,
      category: category.id,
      categoryTitle: category.title,
    })),
  );
}
