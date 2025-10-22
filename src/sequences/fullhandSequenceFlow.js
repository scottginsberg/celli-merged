import { sceneManager } from '../scripts/core/SceneManager.js';
import { sequenceEngine } from '../scripts/systems/SequenceEngine.js';
import { registerFullhandSequences, FULLHAND_SEQUENCE_ORDER } from './fullhandSequences.js';

const ALLOWED_FLOW_SCENES = new Set(['fullhand', 'city', 'theos']);

let hooksRegistered = false;
let flowRunning = false;
let stopRequested = false;
let flowPromise = null;

function ensureSetup() {
  registerFullhandSequences(sequenceEngine);

  if (!hooksRegistered) {
    try {
      sceneManager.on('beforeTransition', ({ to }) => {
        if (!flowRunning) {
          return;
        }

        if (!ALLOWED_FLOW_SCENES.has(to)) {
          stopFullhandSequenceFlow();
        }
      });
    } catch (error) {
      console.warn('[FullhandSequenceFlow] Unable to register scene hooks:', error);
    }

    hooksRegistered = true;
  }
}

function buildSequenceState({ reason, index }) {
  const fullhandState = sceneManager.getSceneState('fullhand') || {};
  const activeScene = sceneManager.getCurrentScene();
  const activeSceneState = activeScene ? sceneManager.getSceneState(activeScene) : null;

  return {
    ...fullhandState,
    activeScene,
    activeSceneState,
    reason,
    stepIndex: index,
    timestamp: Date.now()
  };
}

export function runFullhandSequenceFlow({ reason = 'manual' } = {}) {
  ensureSetup();

  if (flowRunning) {
    stopRequested = true;
    sequenceEngine.stop();
  }

  const runner = (async () => {
    stopRequested = false;
    flowRunning = true;

    try {
      for (let index = 0; index < FULLHAND_SEQUENCE_ORDER.length; index += 1) {
        if (stopRequested) {
          break;
        }

        const sequenceName = FULLHAND_SEQUENCE_ORDER[index];
        const sequenceState = buildSequenceState({ reason, index });
        sequenceState.sequenceName = sequenceName;

        await sequenceEngine.startSequence(sequenceName, sequenceState);

        if (stopRequested) {
          break;
        }
      }
    } finally {
      flowRunning = false;
      stopRequested = false;
    }
  })();

  flowPromise = runner.catch((error) => {
    console.error('[FullhandSequenceFlow] Sequence flow encountered an error:', error);
    throw error;
  });

  return runner;
}

export function stopFullhandSequenceFlow() {
  if (!flowRunning) {
    stopRequested = false;
    return Promise.resolve();
  }

  stopRequested = true;
  sequenceEngine.stop();

  return flowPromise || Promise.resolve();
}

export function isFullhandSequenceFlowRunning() {
  return flowRunning;
}
