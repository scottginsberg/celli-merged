import cursorSequence from './cursorSequence.js';
import scaleSequence from './scaleSequence.js';
import cityDropSequence from './cityDropSequence.js';
import coordinateGridBoot from './coordinateGridBoot.js';

export const FULLHAND_SEQUENCE_DEFINITIONS = [
  cursorSequence,
  scaleSequence,
  cityDropSequence,
  coordinateGridBoot
];

export const FULLHAND_SEQUENCE_ORDER = FULLHAND_SEQUENCE_DEFINITIONS.map(seq => seq.name);

let registeredEngine = null;

export function registerFullhandSequences(sequenceEngine) {
  if (!sequenceEngine || registeredEngine === sequenceEngine) {
    return;
  }

  FULLHAND_SEQUENCE_DEFINITIONS.forEach(sequence => {
    sequenceEngine.registerSequence(sequence.name, sequence);
  });

  registeredEngine = sequenceEngine;
}

export default {
  FULLHAND_SEQUENCE_DEFINITIONS,
  FULLHAND_SEQUENCE_ORDER,
  registerFullhandSequences
};
