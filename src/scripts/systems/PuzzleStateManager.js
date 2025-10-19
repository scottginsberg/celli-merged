const STORAGE_KEY = 'celli:puzzle-state';
const SESSION_PREFIX = 'celli:puzzle:';

function readStoredState() {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch (error) {
    console.warn('[PuzzleStateManager] Failed to parse stored state:', error);
  }

  return {};
}

function persistState(state) {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return;
  }

  try {
    const payload = JSON.stringify(state);
    window.localStorage.setItem(STORAGE_KEY, payload);
  } catch (error) {
    console.warn('[PuzzleStateManager] Failed to persist state:', error);
  }
}

function persistSessionFlag(puzzleId, status) {
  if (typeof window === 'undefined' || typeof window.sessionStorage === 'undefined') {
    return;
  }

  const key = `${SESSION_PREFIX}${puzzleId}`;
  try {
    if (status) {
      window.sessionStorage.setItem(key, status);
    } else {
      window.sessionStorage.removeItem(key);
    }
  } catch (error) {
    console.warn('[PuzzleStateManager] Failed to persist session flag:', error);
  }
}

function cloneMetadata(meta) {
  if (!meta || typeof meta !== 'object') {
    return {};
  }

  try {
    return structuredClone(meta);
  } catch (_) {
    return JSON.parse(JSON.stringify(meta));
  }
}

class PuzzleStateManager {
  constructor() {
    this._state = readStoredState();
    this._listeners = new Map();
    this._handleStorageEvent = this._handleStorageEvent.bind(this);

    if (typeof window !== 'undefined') {
      if (!window.celliPuzzleState || window.celliPuzzleState === this) {
        window.celliPuzzleState = this;
      }
      try {
        window.addEventListener('storage', this._handleStorageEvent);
      } catch (error) {
        console.warn('[PuzzleStateManager] Unable to subscribe to storage events:', error);
      }
    }
  }

  _emitSolved(puzzleId, entry) {
    const detail = {
      puzzleId,
      status: entry.status,
      solvedAt: entry.solvedAt,
      metadata: cloneMetadata(entry.metadata || {})
    };

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('celli:puzzle-solved', { detail }));
      } catch (error) {
        console.warn('[PuzzleStateManager] Unable to dispatch puzzle solved event:', error);
      }
    }

    const listeners = this._listeners.get(puzzleId);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(detail);
        } catch (error) {
          console.warn('[PuzzleStateManager] Listener threw an error:', error);
        }
      });
    }
  }

  _handleStorageEvent(event) {
    if (!event || event.key !== STORAGE_KEY) {
      return;
    }

    const nextState = readStoredState();
    this._state = nextState;
  }

  isSolved(puzzleId) {
    const entry = this._state[puzzleId];
    return entry ? entry.status === 'solved' : false;
  }

  getState(puzzleId) {
    return this._state[puzzleId] || null;
  }

  markSolved(puzzleId, metadata = {}) {
    if (!puzzleId) {
      return null;
    }

    const solvedAt = Date.now();
    const entry = {
      status: 'solved',
      solvedAt,
      metadata: cloneMetadata(metadata)
    };

    this._state = {
      ...this._state,
      [puzzleId]: entry
    };

    persistState(this._state);
    persistSessionFlag(puzzleId, 'solved');
    this._emitSolved(puzzleId, entry);

    return entry;
  }

  reset(puzzleId) {
    if (!puzzleId || !this._state[puzzleId]) {
      return;
    }

    const next = { ...this._state };
    delete next[puzzleId];
    this._state = next;
    persistState(this._state);
    persistSessionFlag(puzzleId, '');
  }

  subscribe(puzzleId, listener) {
    if (!puzzleId || typeof listener !== 'function') {
      return () => {};
    }

    if (!this._listeners.has(puzzleId)) {
      this._listeners.set(puzzleId, new Set());
    }
    const bucket = this._listeners.get(puzzleId);
    bucket.add(listener);

    return () => {
      bucket.delete(listener);
      if (bucket.size === 0) {
        this._listeners.delete(puzzleId);
      }
    };
  }
}

export const puzzleStateManager = new PuzzleStateManager();
export const markPuzzleSolved = (puzzleId, metadata) => puzzleStateManager.markSolved(puzzleId, metadata);

export default puzzleStateManager;
