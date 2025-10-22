const cursorSequence = {
  name: 'fullhand_cursor_sequence',
  description: 'Voxel cursor growth and reveal for the Fullhand experience.',
  version: '1.0.0',
  nodes: [
    {
      id: 1,
      type: 'event',
      params: {
        eventName: 'fullhand.cursor.prepare',
        eventData: {
          stage: 'prepare'
        }
      }
    },
    {
      id: 2,
      type: 'delay',
      params: {
        duration: 0.6
      }
    },
    {
      id: 3,
      type: 'screen_shake',
      params: {
        intensity: 0.4,
        duration: 0.35,
        axis: 'xy'
      }
    },
    {
      id: 4,
      type: 'event',
      params: {
        eventName: 'fullhand.cursor.spawn',
        eventData: {
          stage: 'spawn'
        }
      }
    },
    {
      id: 5,
      type: 'delay',
      params: {
        duration: 1.2
      }
    },
    {
      id: 6,
      type: 'event',
      params: {
        eventName: 'fullhand.cursor.complete',
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
    tags: ['fullhand', 'cursor', 'sequence'],
    created: '2025-01-01'
  }
};

export default cursorSequence;
export { cursorSequence };
