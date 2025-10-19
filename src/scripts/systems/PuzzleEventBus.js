/**
 * Puzzle Event Bus
 *
 * Centralized event system for puzzle/riddle state changes.
 * Enables loose coupling between narrative beats and puzzle controllers.
 */

import EventEmitter from '../utils/EventEmitter.js';

class PuzzleEventBus extends EventEmitter {
  constructor() {
    super();
    this.namespace = 'riddle';
  }

  /**
   * Emit that a riddle became available/unlocked.
   * @param {string} name
   * @param {Object} [context={}] additional metadata
   */
  emitRiddleAvailable(name, context = {}) {
    if (!name) return;
    const payload = { name, context };
    this.emit(`${this.namespace}:available`, payload);
    this.emit(`${this.namespace}:available:${name}`, payload);
  }

  /**
   * Emit that a riddle was solved (or skipped with metadata).
   * @param {string} name
   * @param {Object} [context={}] additional metadata
   */
  emitRiddleSolved(name, context = {}) {
    if (!name) return;
    const payload = { name, context };
    this.emit(`${this.namespace}:solved`, payload);
    this.emit(`${this.namespace}:solved:${name}`, payload);
  }

  /**
   * Subscribe to riddle availability.
   * @param {string} name specific riddle name or `*` for all
   * @param {Function} callback listener
   * @returns {Function} unsubscribe function
   */
  onRiddleAvailable(name, callback) {
    const event = name && name !== '*' ? `${this.namespace}:available:${name}` : `${this.namespace}:available`;
    return this.on(event, callback);
  }

  /**
   * Subscribe to riddle solved events.
   * @param {string} name specific riddle name or `*` for all
   * @param {Function} callback listener
   * @returns {Function} unsubscribe function
   */
  onRiddleSolved(name, callback) {
    const event = name && name !== '*' ? `${this.namespace}:solved:${name}` : `${this.namespace}:solved`;
    return this.on(event, callback);
  }
}

export const puzzleEventBus = new PuzzleEventBus();
export default puzzleEventBus;
