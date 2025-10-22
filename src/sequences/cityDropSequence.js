export default {
  name: 'fullhand_city_drop_sequence',
  description: 'Drops the City vista into place following the Fullhand calibration.',
  version: '1.0.0',
  nodes: [
    { id: 'start', type: 'start' },
    {
      id: 'city_dialogue',
      type: 'dialogue',
      params: {
        speaker: 'THE.OS',
        text: 'Locking in drop coordinates. Routing skyline lattice…',
        duration: 2.0
      }
    },
    {
      id: 'city_screen_shake',
      type: 'screenShake',
      params: {
        intensity: 0.18,
        duration: 1100
      }
    },
    {
      id: 'city_transition',
      type: 'sceneTransition',
      params: {
        toScene: 'city',
        effect: 'drop',
        waitForCompletion: true
      }
    },
    {
      id: 'city_event_complete',
      type: 'event',
      params: {
        eventName: 'fullhand_city_drop_complete',
        eventData: {
          stage: 'city-drop'
        }
      }
    }
  ],
  connections: [
    { id: 'start->dialogue', fromNode: 'start', toNode: 'city_dialogue', type: 'flow' },
    { id: 'dialogue->shake', fromNode: 'city_dialogue', toNode: 'city_screen_shake', type: 'flow' },
    { id: 'shake->transition', fromNode: 'city_screen_shake', toNode: 'city_transition', type: 'flow' },
    { id: 'transition->event', fromNode: 'city_transition', toNode: 'city_event_complete', type: 'flow' }
  ],
  metadata: {
    created: '2025-02-12',
    tags: ['fullhand', 'city', 'transition']
  }
};
