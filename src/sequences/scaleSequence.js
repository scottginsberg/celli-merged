export default {
  name: 'fullhand_scale_sequence',
  description: 'Expands the Fullhand execution environment scale envelope.',
  version: '1.0.0',
  nodes: [
    { id: 'start', type: 'start' },
    {
      id: 'scale_dialogue',
      type: 'dialogue',
      params: {
        speaker: 'THE.OS',
        text: 'Calibrating reach. Synchronizing finger span to chassis…',
        duration: 2.5
      }
    },
    {
      id: 'scale_audio',
      type: 'audio',
      params: {
        action: 'play',
        key: 'sfx:scale-riser',
        url: './limbo.mp3',
        volume: 0.28
      }
    },
    {
      id: 'scale_animation',
      type: 'animation',
      params: {
        target: 'fullhand.execEnv',
        property: 'scale',
        from: 0.85,
        to: 1.12,
        duration: 2.8,
        easing: 'easeInOutCubic'
      }
    },
    {
      id: 'scale_shake',
      type: 'screenShake',
      params: {
        intensity: 0.12,
        duration: 900
      }
    },
    {
      id: 'scale_delay',
      type: 'delay',
      params: {
        duration: 0.75
      }
    },
    {
      id: 'scale_audio_stop',
      type: 'audio',
      params: {
        action: 'stop',
        key: 'sfx:scale-riser'
      }
    },
    {
      id: 'scale_complete',
      type: 'event',
      params: {
        eventName: 'fullhand_scale_sequence_complete',
        eventData: {
          stage: 'scale'
        }
      }
    }
  ],
  connections: [
    { id: 'start->dialogue', fromNode: 'start', toNode: 'scale_dialogue', type: 'flow' },
    { id: 'dialogue->audio', fromNode: 'scale_dialogue', toNode: 'scale_audio', type: 'flow' },
    { id: 'audio->animation', fromNode: 'scale_audio', toNode: 'scale_animation', type: 'flow' },
    { id: 'animation->shake', fromNode: 'scale_animation', toNode: 'scale_shake', type: 'flow' },
    { id: 'shake->delay', fromNode: 'scale_shake', toNode: 'scale_delay', type: 'flow' },
    { id: 'delay->audioStop', fromNode: 'scale_delay', toNode: 'scale_audio_stop', type: 'flow' },
    { id: 'audioStop->event', fromNode: 'scale_audio_stop', toNode: 'scale_complete', type: 'flow' }
  ],
  metadata: {
    created: '2025-02-12',
    tags: ['fullhand', 'scale']
  }
};
