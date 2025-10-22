export default {
  name: 'fullhand_cursor_sequence',
  description: 'Voxel cursor emergence sequence for the Fullhand execution environment.',
  version: '1.0.0',
  nodes: [
    {
      id: 'start',
      type: 'start',
      params: {
        label: 'Initialize cursor build'
      }
    },
    {
      id: 'dialogue_boot',
      type: 'dialogue',
      params: {
        speaker: 'THE.OS',
        text: 'Bootstrapping cursor apparition…',
        duration: 2.2
      }
    },
    {
      id: 'audio_glitch',
      type: 'audio',
      params: {
        action: 'play',
        key: 'sfx:cursor-glitch',
        url: './tapout.mp3',
        volume: 0.35
      }
    },
    {
      id: 'cursor_animation',
      type: 'animation',
      params: {
        target: 'fullhand.cursor',
        property: 'scale',
        from: 0.12,
        to: 1.0,
        duration: 1.6,
        easing: 'easeOutBack'
      }
    },
    {
      id: 'cursor_screen_shake',
      type: 'screenShake',
      params: {
        intensity: 0.08,
        duration: 650
      }
    },
    {
      id: 'cursor_delay',
      type: 'delay',
      params: {
        duration: 0.6
      }
    },
    {
      id: 'audio_glitch_stop',
      type: 'audio',
      params: {
        action: 'stop',
        key: 'sfx:cursor-glitch'
      }
    },
    {
      id: 'cursor_event_complete',
      type: 'event',
      params: {
        eventName: 'fullhand_cursor_sequence_complete',
        eventData: {
          stage: 'cursor'
        }
      }
    }
  ],
  connections: [
    { id: 'start->dialogue', fromNode: 'start', toNode: 'dialogue_boot', type: 'flow' },
    { id: 'dialogue->audio', fromNode: 'dialogue_boot', toNode: 'audio_glitch', type: 'flow' },
    { id: 'audio->animation', fromNode: 'audio_glitch', toNode: 'cursor_animation', type: 'flow' },
    { id: 'animation->shake', fromNode: 'cursor_animation', toNode: 'cursor_screen_shake', type: 'flow' },
    { id: 'shake->delay', fromNode: 'cursor_screen_shake', toNode: 'cursor_delay', type: 'flow' },
    { id: 'delay->audioStop', fromNode: 'cursor_delay', toNode: 'audio_glitch_stop', type: 'flow' },
    { id: 'audioStop->event', fromNode: 'audio_glitch_stop', toNode: 'cursor_event_complete', type: 'flow' }
  ],
  metadata: {
    created: '2025-02-12',
    tags: ['fullhand', 'cursor', 'intro']
  }
};
