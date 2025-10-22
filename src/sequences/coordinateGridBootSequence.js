const coordinateGridBootSequence = {
  name: 'fullhand_coordinate_grid_boot_sequence',
  description: 'Coordinate grid boot sequence with reboot audio playback.',
  version: '1.0.0',
  nodes: [
    {
      id: 1,
      type: 'audio',
      params: {
        action: 'play',
        key: 'fullhand_reboot_audio',
        clip: './reboot.mp3',
        volume: 0.68,
        loop: false
      }
    },
    {
      id: 2,
      type: 'delay',
      params: {
        duration: 0.2
      }
    },
    {
      id: 3,
      type: 'event',
      params: {
        eventName: 'fullhand.grid.boot.start',
        eventData: {
          stage: 'boot'
        }
      }
    },
    {
      id: 4,
      type: 'delay',
      params: {
        duration: 2.8
      }
    },
    {
      id: 5,
      type: 'screen_shake',
      params: {
        intensity: 0.5,
        duration: 0.6,
        axis: 'xyz'
      }
    },
    {
      id: 6,
      type: 'event',
      params: {
        eventName: 'fullhand.grid.boot.complete',
        eventData: {
          stage: 'complete'
        }
      }
    },
    {
      id: 7,
      type: 'audio',
      params: {
        action: 'stop',
        key: 'fullhand_reboot_audio'
      }
    }
  ],
  connections: [
    { id: 1, fromNode: 1, fromSocket: 'output', toNode: 2, toSocket: 'input', type: 'flow' },
    { id: 2, fromNode: 2, fromSocket: 'output', toNode: 3, toSocket: 'input', type: 'flow' },
    { id: 3, fromNode: 3, fromSocket: 'output', toNode: 4, toSocket: 'input', type: 'flow' },
    { id: 4, fromNode: 4, fromSocket: 'output', toNode: 5, toSocket: 'input', type: 'flow' },
    { id: 5, fromNode: 5, fromSocket: 'output', toNode: 6, toSocket: 'input', type: 'flow' },
    { id: 6, fromNode: 6, fromSocket: 'output', toNode: 7, toSocket: 'input', type: 'flow' }
  ],
  metadata: {
    tags: ['fullhand', 'grid', 'boot', 'sequence'],
    created: '2025-01-01'
  }
};

export default coordinateGridBootSequence;
export { coordinateGridBootSequence };
