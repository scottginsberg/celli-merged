import cursorSequence from './cursorSequence.js';
import scaleSequence from './scaleSequence.js';
import cityDropSequence from './cityDropSequence.js';
import coordinateGridBootSequence from './coordinateGridBootSequence.js';

export const FULLHAND_SEQUENCE_ORDER = [
  { name: cursorSequence.name, label: 'Cursor Sequence' },
  { name: scaleSequence.name, label: 'Scale Sequence' },
  { name: cityDropSequence.name, label: 'City Drop Sequence' },
  { name: coordinateGridBootSequence.name, label: 'Coordinate Grid Boot' }
];

export function registerFullhandSequences(engine) {
  if (!engine) {
    throw new Error('Sequence engine instance is required to register sequences.');
  }

  const registrations = [
    cursorSequence,
    scaleSequence,
    cityDropSequence,
    coordinateGridBootSequence
  ];

  registrations.forEach((sequence) => {
    engine.registerSequence(sequence.name, sequence);
  });

  return FULLHAND_SEQUENCE_ORDER.map((entry) => entry.name);
}

export {
  cursorSequence,
  scaleSequence,
  cityDropSequence,
  coordinateGridBootSequence
};
