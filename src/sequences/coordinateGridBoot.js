export default {
  name: 'fullhand_coordinate_grid_boot',
  description: 'Boots the coordinate grid lattice with a hard audio reboot.',
  version: '1.0.0',
  nodes: [
    { id: 'start', type: 'start' },
    {
      id: 'grid_audio',
      type: 'audio',
      params: {
        action: 'play',
        key: 'sfx:reboot',
        url: './reboot.mp3',
        volume: 0.5
      }
    },
    {
      id: 'grid_delay',
      type: 'delay',
      params: {
        duration: 1.8
      }
    },
    {
      id: 'grid_dialogue',
      type: 'dialogue',
      params: {
        speaker: 'THE.OS',
        text: 'Coordinate grid reboot confirmed. Elevating lattice to THE.OS.',
        duration: 2.4
      }
    },
    {
      id: 'grid_transition',
      type: 'sceneTransition',
      params: {
        toScene: 'theos',
        effect: 'grid-boot',
        waitForCompletion: true
      }
    },
    {
      id: 'grid_audio_stop',
      type: 'audio',
      params: {
        action: 'stop',
        key: 'sfx:reboot'
      }
    },
    {
      id: 'grid_event_complete',
      type: 'event',
      params: {
        eventName: 'fullhand_coordinate_grid_boot_complete',
        eventData: {
          stage: 'coordinate-grid'
        }
      }
    }
  ],
  connections: [
    { id: 'start->audio', fromNode: 'start', toNode: 'grid_audio', type: 'flow' },
    { id: 'audio->delay', fromNode: 'grid_audio', toNode: 'grid_delay', type: 'flow' },
    { id: 'delay->dialogue', fromNode: 'grid_delay', toNode: 'grid_dialogue', type: 'flow' },
    { id: 'dialogue->transition', fromNode: 'grid_dialogue', toNode: 'grid_transition', type: 'flow' },
    { id: 'transition->audioStop', fromNode: 'grid_transition', toNode: 'grid_audio_stop', type: 'flow' },
    { id: 'audioStop->event', fromNode: 'grid_audio_stop', toNode: 'grid_event_complete', type: 'flow' }
  ],
  metadata: {
    created: '2025-02-12',
    tags: ['theos', 'coordinate-grid', 'audio']
  }
};
