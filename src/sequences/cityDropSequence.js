const cityDropSequence = {
  name: 'fullhand_city_drop_sequence',
  description: 'Micro city drop and landing beat used in the Fullhand reveal.',
  version: '1.0.0',
  nodes: [
    {
      id: 1,
      type: 'event',
      params: {
        eventName: 'fullhand.city.drop.prepare',
        eventData: {
          stage: 'prepare'
        }
      }
    },
    {
      id: 2,
      type: 'delay',
      params: {
        duration: 0.4
      }
    },
    {
      id: 3,
      type: 'screen_shake',
      params: {
        intensity: 0.9,
        duration: 0.75,
        axis: 'y'
      }
    },
    {
      id: 4,
      type: 'event',
      params: {
        eventName: 'fullhand.city.drop.commit',
        eventData: {
          stage: 'impact'
        }
      }
    },
    {
      id: 5,
      type: 'delay',
      params: {
        duration: 0.8
      }
    },
    {
      id: 6,
      type: 'event',
      params: {
        eventName: 'fullhand.city.drop.complete',
        eventData: {
          stage: 'complete'
        }
      }
    }
  ],
  connections: [
    { id: 1, fromNode: 1, fromSocket: 'output', toNode: 2, toSocket: 'input', type: 'flow' },
    { id: 2, fromNode: 2, fromSocket: 'output', toNode: 3, toSocket: 'input', type: 'flow' },
    { id: 3, fromNode: 3, fromSocket: 'output', toNode: 4, toSocket: 'input', type: 'flow' },
    { id: 4, fromNode: 4, fromSocket: 'output', toNode: 5, toSocket: 'input', type: 'flow' },
    { id: 5, fromNode: 5, fromSocket: 'output', toNode: 6, toSocket: 'input', type: 'flow' }
  ],
  metadata: {
    tags: ['fullhand', 'city', 'sequence'],
    created: '2025-01-01'
  }
};

export default cityDropSequence;
export { cityDropSequence };
