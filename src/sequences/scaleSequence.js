const scaleSequence = {
  name: 'fullhand_scale_sequence',
  description: 'Scale mode activation including lighting shifts and gizmo reveal.',
  version: '1.0.0',
  nodes: [
    {
      id: 1,
      type: 'event',
      params: {
        eventName: 'fullhand.scale.enter',
        eventData: {
          stage: 'enter'
        }
      }
    },
    {
      id: 2,
      type: 'delay',
      params: {
        duration: 0.5
      }
    },
    {
      id: 3,
      type: 'screen_shake',
      params: {
        intensity: 0.25,
        duration: 0.4,
        axis: 'x'
      }
    },
    {
      id: 4,
      type: 'event',
      params: {
        eventName: 'fullhand.scale.lock',
        eventData: {
          stage: 'lock'
        }
      }
    },
    {
      id: 5,
      type: 'delay',
      params: {
        duration: 1.0
      }
    },
    {
      id: 6,
      type: 'event',
      params: {
        eventName: 'fullhand.scale.complete',
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
    tags: ['fullhand', 'scale', 'sequence'],
    created: '2025-01-01'
  }
};

export default scaleSequence;
export { scaleSequence };
