/**
 * Store & State Management Tests
 * Tests for Store initialization, state management, and array operations
 */

import { Store } from '../src/scripts/engine/Store.js';
import { TestRunner, Assert } from './test-runner.js';

const runner = new TestRunner();

runner.suite('Store Initialization', ({ test, beforeEach }) => {
  
  test('Store should initialize with default state', () => {
    Assert.exists(Store.getState, 'Store should have getState method');
    const state = Store.getState();
    
    Assert.exists(state.arrays, 'State should have arrays object');
    Assert.exists(state.selection, 'State should have selection object');
    Assert.exists(state.scene, 'State should have scene object');
    Assert.exists(state.ui, 'State should have ui object');
  });

  test('nextArrayId should start at 1', () => {
    const state = Store.getState();
    Assert.equal(state.nextArrayId, 1, 'nextArrayId should be 1');
  });

  test('arrays should be empty initially', () => {
    const state = Store.getState();
    Assert.equal(Object.keys(state.arrays).length, 0, 'arrays should be empty');
  });

  test('selection should have null values initially', () => {
    const state = Store.getState();
    Assert.null(state.selection.arrayId, 'selection.arrayId should be null');
    Assert.null(state.selection.focus, 'selection.focus should be null');
    Assert.null(state.selection.anchor, 'selection.anchor should be null');
  });

  test('scene physics should be disabled by default', () => {
    const state = Store.getState();
    Assert.equal(state.scene.physics, false, 'physics should be disabled');
  });

  test('globalState should be a Map', () => {
    const state = Store.getState();
    Assert.instanceOf(state.globalState, Map, 'globalState should be a Map');
  });
});

runner.suite('Array Management', ({ test, beforeEach }) => {
  let initialState;

  beforeEach(() => {
    // Get fresh state for each test
    initialState = Store.getState();
  });

  test('should be able to add arrays to state', () => {
    const state = Store.getState();
    const arrayId = state.nextArrayId;
    
    // Simulate adding an array
    Store.setState({
      arrays: {
        ...state.arrays,
        [arrayId]: {
          id: arrayId,
          data: {},
          meta: {},
          anchor: { x: 0, y: 0, z: 0 }
        }
      },
      nextArrayId: arrayId + 1
    });

    const newState = Store.getState();
    Assert.exists(newState.arrays[arrayId], 'Array should be added');
    Assert.equal(newState.nextArrayId, arrayId + 1, 'nextArrayId should increment');
  });

  test('array should have required properties', () => {
    const state = Store.getState();
    const arrayId = 1;
    
    const newArray = {
      id: arrayId,
      data: {},
      meta: {},
      anchor: { x: 0, y: 0, z: 0 }
    };

    Store.setState({
      arrays: { ...state.arrays, [arrayId]: newArray },
      nextArrayId: arrayId + 1
    });

    const arr = Store.getState().arrays[arrayId];
    Assert.objectHasProperty(arr, 'id', 'Array should have id');
    Assert.objectHasProperty(arr, 'data', 'Array should have data');
    Assert.objectHasProperty(arr, 'meta', 'Array should have meta');
    Assert.objectHasProperty(arr, 'anchor', 'Array should have anchor');
  });
});

runner.suite('Selection State', ({ test }) => {
  
  test('should be able to set selection', () => {
    const state = Store.getState();
    
    Store.setState({
      selection: {
        ...state.selection,
        arrayId: 1,
        focus: { x: 0, y: 0, z: 0 }
      }
    });

    const newSelection = Store.getState().selection;
    Assert.equal(newSelection.arrayId, 1, 'arrayId should be set');
    Assert.exists(newSelection.focus, 'focus should be set');
    Assert.equal(newSelection.focus.x, 0, 'focus.x should be 0');
  });

  test('selection should handle cell addresses', () => {
    const state = Store.getState();
    
    Store.setState({
      selection: {
        ...state.selection,
        arrayId: 1,
        focus: { x: 5, y: 10, z: 2 },
        anchor: { x: 5, y: 10, z: 2 }
      }
    });

    const sel = Store.getState().selection;
    Assert.equal(sel.focus.x, 5, 'focus x coordinate');
    Assert.equal(sel.focus.y, 10, 'focus y coordinate');
    Assert.equal(sel.focus.z, 2, 'focus z coordinate');
  });
});

runner.suite('Global State Management', ({ test }) => {
  
  test('should be able to set global variables', () => {
    const state = Store.getState();
    const newGlobalState = new Map(state.globalState);
    newGlobalState.set('testVar', 42);
    
    Store.setState({ globalState: newGlobalState });
    
    const globals = Store.getState().globalState;
    Assert.equal(globals.get('testVar'), 42, 'Global variable should be set');
  });

  test('should be able to clear global variables', () => {
    const state = Store.getState();
    const newGlobalState = new Map(state.globalState);
    newGlobalState.set('testVar', 42);
    Store.setState({ globalState: newGlobalState });
    
    const clearedState = new Map();
    Store.setState({ globalState: clearedState });
    
    const globals = Store.getState().globalState;
    Assert.falsy(globals.has('testVar'), 'Global variable should be cleared');
  });
});

runner.suite('Named Blocks and Macros', ({ test }) => {
  
  test('namedBlocks should be a Map', () => {
    const state = Store.getState();
    Assert.instanceOf(state.namedBlocks, Map, 'namedBlocks should be a Map');
  });

  test('namedMacros should be a Map', () => {
    const state = Store.getState();
    Assert.instanceOf(state.namedMacros, Map, 'namedMacros should be a Map');
  });

  test('should be able to add named blocks', () => {
    const state = Store.getState();
    const newBlocks = new Map(state.namedBlocks);
    newBlocks.set('myBlock', { arrayId: 1, cells: [] });
    
    Store.setState({ namedBlocks: newBlocks });
    
    const blocks = Store.getState().namedBlocks;
    Assert.truthy(blocks.has('myBlock'), 'Named block should be added');
  });
});

runner.suite('Event System', ({ test }) => {
  
  test('eventListeners should be a Map', () => {
    const state = Store.getState();
    Assert.instanceOf(state.eventListeners, Map, 'eventListeners should be a Map');
  });

  test('should be able to register event listeners', () => {
    const state = Store.getState();
    const newListeners = new Map(state.eventListeners);
    newListeners.set('testEvent', [{ arrayId: 1, cell: { x: 0, y: 0, z: 0 } }]);
    
    Store.setState({ eventListeners: newListeners });
    
    const listeners = Store.getState().eventListeners;
    Assert.truthy(listeners.has('testEvent'), 'Event listener should be registered');
    Assert.arrayLength(listeners.get('testEvent'), 1, 'Should have one listener');
  });
});

runner.suite('Anchor Tracking', ({ test }) => {
  
  test('anchorsByGlobalKey should be a Map', () => {
    const state = Store.getState();
    Assert.instanceOf(state.anchorsByGlobalKey, Map);
  });

  test('globalKeysByAnchor should be a Map', () => {
    const state = Store.getState();
    Assert.instanceOf(state.globalKeysByAnchor, Map);
  });

  test('should track anchor-to-global-key relationships', () => {
    const state = Store.getState();
    const anchorKey = '1:0,0,0';
    const globalKey = 'X:0,0,0';
    
    const newAnchors = new Map(state.anchorsByGlobalKey);
    newAnchors.set(globalKey, new Set([anchorKey]));
    
    Store.setState({ anchorsByGlobalKey: newAnchors });
    
    const anchors = Store.getState().anchorsByGlobalKey;
    Assert.truthy(anchors.has(globalKey), 'Should track global key');
  });
});

runner.suite('Physics and Camera State', ({ test }) => {
  
  test('avatarPhysics should have default values', () => {
    const state = Store.getState();
    Assert.equal(state.avatarPhysics.enabled, true, 'avatarPhysics should be enabled');
    Assert.equal(state.avatarPhysics.jumpCount, 1, 'jumpCount should be 1');
  });

  test('physicsCamera should have default mode', () => {
    const state = Store.getState();
    Assert.equal(state.physicsCamera.mode, 'free', 'Camera mode should be free');
    Assert.equal(state.physicsCamera.distance, 10, 'Camera distance should be 10');
  });

  test('should be able to modify avatar physics', () => {
    const state = Store.getState();
    
    Store.setState({
      avatarPhysics: {
        ...state.avatarPhysics,
        jumpCount: 2,
        runMultiplier: 1.5
      }
    });

    const physics = Store.getState().avatarPhysics;
    Assert.equal(physics.jumpCount, 2, 'jumpCount should be updated');
    Assert.equal(physics.runMultiplier, 1.5, 'runMultiplier should be updated');
  });
});

runner.suite('Utility Functions', ({ test }) => {
  
  test('utils.key should generate cell keys', () => {
    const state = Store.getState();
    const key = state.utils.key(1, 5, 10, 2);
    Assert.equal(key, '1:5,10,2', 'Key should be formatted correctly');
  });

  test('utils.A1 should convert to A1 notation', () => {
    const state = Store.getState();
    const a1 = state.utils.A1(0, 0);
    Assert.equal(a1, 'A1', 'Should convert to A1 notation');
  });

  test('utils.greek should convert to Greek notation', () => {
    const state = Store.getState();
    const greek = state.utils.greek(0);
    Assert.equal(typeof greek, 'string', 'Should return a string');
  });
});

// Export the runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = runner;
} else {
  window.StoreTestRunner = runner;
}

