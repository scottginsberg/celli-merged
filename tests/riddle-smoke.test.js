/**
 * Riddle Chain Smoke Tests
 *
 * Ensures the narrative/puzzle chain emits expected events and state transitions.
 */

import { TestRunner, Assert } from './test-runner.js';
import { SequenceEngine } from '../src/scripts/systems/SequenceEngine.js';

const runner = new TestRunner();

const deepClone = (value) => JSON.parse(JSON.stringify(value));

function createRiddleChainSequence(introAction) {
  const nodes = [
    { id: 1, type: 'start' },
    { id: 2, type: 'parameter', params: { path: 'intro.action', operation: 'set', value: introAction } },
    {
      id: 3,
      type: 'event',
      params: {
        eventName: `intro.${introAction}`,
        eventData: {
          action: introAction,
          via: introAction === 'skip' ? 'skip-button' : 'construction'
        }
      }
    },
    { id: 4, type: 'parameter', params: { path: 'puzzles.wordle.status', operation: 'set', value: 'solved' } },
    { id: 5, type: 'parameter', params: { path: 'puzzles.wordle.attempts', operation: 'set', value: 2 } },
    { id: 6, type: 'parameter', params: { path: 'puzzles.wordle.guesses', operation: 'set', value: ['CELLI'] } },
    {
      id: 7,
      type: 'event',
      params: {
        eventName: 'puzzle.wordle.solved',
        eventData: { solution: 'CELLI', attempts: 2 }
      }
    },
    { id: 8, type: 'parameter', params: { path: 'visicell.keyEvent.video', operation: 'set', value: 'Key.mp4' } },
    { id: 9, type: 'parameter', params: { path: 'visicell.keyEvent.overlay', operation: 'set', value: 'KEY FILE' } },
    { id: 10, type: 'parameter', params: { path: 'visicell.keyEvent.completed', operation: 'set', value: true } },
    {
      id: 11,
      type: 'event',
      params: {
        eventName: 'visicell.key.played',
        eventData: { video: 'Key.mp4', overlay: 'KEY FILE' }
      }
    },
    { id: 12, type: 'parameter', params: { path: 'flash.timeline.modal.actions', operation: 'set', value: ['open', 'scrub', 'close'] } },
    { id: 13, type: 'parameter', params: { path: 'flash.timeline.modal.lastTick', operation: 'set', value: 4200 } },
    {
      id: 14,
      type: 'event',
      params: {
        eventName: 'flash.timeline.interacted',
        eventData: { modal: 'timeline', actions: ['open', 'scrub', 'close'] }
      }
    },
    { id: 15, type: 'parameter', params: { path: 'puzzles.ozymandias.status', operation: 'set', value: 'solved' } },
    {
      id: 16,
      type: 'event',
      params: {
        eventName: 'puzzle.ozymandias.solved',
        eventData: { stage: 'visicell', solved: true }
      }
    },
    { id: 17, type: 'parameter', params: { path: 'puzzles.galaxy.status', operation: 'set', value: 'solved' } },
    {
      id: 18,
      type: 'event',
      params: {
        eventName: 'puzzle.galaxy.solved',
        eventData: { stage: 'visicell', solved: true }
      }
    },
    { id: 19, type: 'parameter', params: { path: 'puzzles.sokoban.status', operation: 'set', value: 'solved' } },
    {
      id: 20,
      type: 'event',
      params: {
        eventName: 'puzzle.sokoban.solved',
        eventData: { stage: 'visicell', solved: true }
      }
    },
    { id: 21, type: 'parameter', params: { path: 'chain.status', operation: 'set', value: 'complete' } },
    {
      id: 22,
      type: 'event',
      params: {
        eventName: 'riddle.chain.complete',
        eventData: { puzzles: ['wordle', 'ozymandias', 'galaxy', 'sokoban'] }
      }
    }
  ];

  const connections = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    connections.push({ fromNode: nodes[i].id, toNode: nodes[i + 1].id, type: 'flow' });
  }

  return {
    name: `riddle_chain_${introAction}`,
    description: 'Smoke coverage for intro → puzzle riddle chain',
    nodes,
    connections
  };
}

function createExpectedEvents(introAction) {
  return [
    {
      name: `intro.${introAction}`,
      data: {
        action: introAction,
        via: introAction === 'skip' ? 'skip-button' : 'construction'
      }
    },
    { name: 'puzzle.wordle.solved', data: { solution: 'CELLI', attempts: 2 } },
    { name: 'visicell.key.played', data: { video: 'Key.mp4', overlay: 'KEY FILE' } },
    { name: 'flash.timeline.interacted', data: { modal: 'timeline', actions: ['open', 'scrub', 'close'] } },
    { name: 'puzzle.ozymandias.solved', data: { stage: 'visicell', solved: true } },
    { name: 'puzzle.galaxy.solved', data: { stage: 'visicell', solved: true } },
    { name: 'puzzle.sokoban.solved', data: { stage: 'visicell', solved: true } },
    { name: 'riddle.chain.complete', data: { puzzles: ['wordle', 'ozymandias', 'galaxy', 'sokoban'] } }
  ];
}

function createExpectedSnapshots(introAction) {
  const snapshots = [];

  const introState = { intro: { action: introAction } };
  snapshots.push(deepClone(introState));

  const wordleState = deepClone(introState);
  wordleState.puzzles = {
    wordle: { status: 'solved', attempts: 2, guesses: ['CELLI'] }
  };
  snapshots.push(deepClone(wordleState));

  const visicellState = deepClone(wordleState);
  visicellState.visicell = {
    keyEvent: { video: 'Key.mp4', overlay: 'KEY FILE', completed: true }
  };
  snapshots.push(deepClone(visicellState));

  const flashState = deepClone(visicellState);
  flashState.flash = {
    timeline: {
      modal: { actions: ['open', 'scrub', 'close'], lastTick: 4200 }
    }
  };
  snapshots.push(deepClone(flashState));

  const ozymandiasState = deepClone(flashState);
  ozymandiasState.puzzles.ozymandias = { status: 'solved' };
  snapshots.push(deepClone(ozymandiasState));

  const galaxyState = deepClone(ozymandiasState);
  galaxyState.puzzles.galaxy = { status: 'solved' };
  snapshots.push(deepClone(galaxyState));

  const sokobanState = deepClone(galaxyState);
  sokobanState.puzzles.sokoban = { status: 'solved' };
  snapshots.push(deepClone(sokobanState));

  const finalState = deepClone(sokobanState);
  finalState.chain = { status: 'complete' };
  snapshots.push(deepClone(finalState));

  return snapshots;
}

function createExpectedLog(introAction) {
  const events = createExpectedEvents(introAction);
  const states = createExpectedSnapshots(introAction);
  return events.map((event, index) => ({
    name: event.name,
    data: event.data,
    state: states[index]
  }));
}

async function runRiddleSequence(introAction) {
  const engine = new SequenceEngine();
  const sequence = createRiddleChainSequence(introAction);
  const eventLog = [];

  engine.registerSequence(sequence.name, sequence);

  engine.on('onEvent', ({ type, name, data, state }) => {
    if (type === 'custom') {
      eventLog.push({
        name,
        data,
        state: deepClone(state)
      });
    }
  });

  await engine.startSequence(sequence.name);

  return {
    eventLog,
    finalState: deepClone(engine.sequenceState)
  };
}

runner.suite('Riddle Chain Smoke Tests', ({ test }) => {
  test('should capture complete intro path event log', async () => {
    const introAction = 'complete';
    const expectedLog = createExpectedLog(introAction);
    const expectedFinalState = expectedLog[expectedLog.length - 1].state;

    const { eventLog, finalState } = await runRiddleSequence(introAction);

    Assert.deepEqual(eventLog, expectedLog, 'Complete path event log mismatch');
    Assert.deepEqual(finalState, expectedFinalState, 'Complete path final state mismatch');
  });

  test('should capture skip intro path event log', async () => {
    const introAction = 'skip';
    const expectedLog = createExpectedLog(introAction);
    const expectedFinalState = expectedLog[expectedLog.length - 1].state;

    const { eventLog, finalState } = await runRiddleSequence(introAction);

    Assert.deepEqual(eventLog, expectedLog, 'Skip path event log mismatch');
    Assert.deepEqual(finalState, expectedFinalState, 'Skip path final state mismatch');
  });
});

export default runner;
