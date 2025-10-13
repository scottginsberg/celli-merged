/**
 * Example Concrete Test Implementation
 * 
 * This file demonstrates how to implement actual tests once modules are available.
 * Replace placeholder tests with implementations like these.
 */

import { TestRunner, Assert } from './test-runner.js';

const runner = new TestRunner();

// ============================================================================
// Example 1: Testing a pure utility function
// ============================================================================

runner.suite('Utility Functions - Concrete Example', ({ test }) => {
  
  // Mock implementation of a key generator
  function generateKey(arrId, x, y, z) {
    return `${arrId}:${x},${y},${z}`;
  }

  test('should generate correct key format', () => {
    const key = generateKey(1, 5, 10, 2);
    Assert.equal(key, '1:5,10,2');
  });

  test('should handle zero coordinates', () => {
    const key = generateKey(1, 0, 0, 0);
    Assert.equal(key, '1:0,0,0');
  });

  test('should handle negative coordinates', () => {
    const key = generateKey(1, -5, -10, -2);
    Assert.equal(key, '1:-5,-10,-2');
  });

  test('should handle large array IDs', () => {
    const key = generateKey(999999, 0, 0, 0);
    Assert.equal(key, '999999:0,0,0');
  });
});

// ============================================================================
// Example 2: Testing state management
// ============================================================================

runner.suite('State Management - Concrete Example', ({ test, beforeEach }) => {
  
  // Mock store implementation
  class MockStore {
    constructor() {
      this.state = {
        arrays: {},
        nextArrayId: 1,
        selection: { arrayId: null, focus: null }
      };
    }

    getState() {
      return this.state;
    }

    setState(updates) {
      this.state = { ...this.state, ...updates };
    }

    createArray(options = {}) {
      const id = this.state.nextArrayId;
      const newArray = {
        id,
        data: {},
        meta: {},
        anchor: options.anchor || { x: 0, y: 0, z: 0 },
        name: options.name || `Array${id}`
      };
      
      this.setState({
        arrays: { ...this.state.arrays, [id]: newArray },
        nextArrayId: id + 1
      });
      
      return newArray;
    }

    deleteArray(arrayId) {
      const { [arrayId]: removed, ...remaining } = this.state.arrays;
      this.setState({ arrays: remaining });
    }
  }

  let store;

  beforeEach(() => {
    store = new MockStore();
  });

  test('should initialize with empty arrays', () => {
    const state = store.getState();
    Assert.equal(Object.keys(state.arrays).length, 0);
  });

  test('should create array with correct ID', () => {
    const arr = store.createArray();
    Assert.equal(arr.id, 1);
    Assert.exists(arr.data);
    Assert.exists(arr.meta);
  });

  test('should increment nextArrayId after creation', () => {
    store.createArray();
    const state = store.getState();
    Assert.equal(state.nextArrayId, 2);
  });

  test('should create multiple arrays with sequential IDs', () => {
    const arr1 = store.createArray();
    const arr2 = store.createArray();
    const arr3 = store.createArray();
    
    Assert.equal(arr1.id, 1);
    Assert.equal(arr2.id, 2);
    Assert.equal(arr3.id, 3);
  });

  test('should store array with custom name', () => {
    const arr = store.createArray({ name: 'MyArray' });
    Assert.equal(arr.name, 'MyArray');
  });

  test('should delete array from state', () => {
    store.createArray();
    store.createArray();
    store.deleteArray(1);
    
    const state = store.getState();
    Assert.falsy(state.arrays[1]);
    Assert.exists(state.arrays[2]);
  });
});

// ============================================================================
// Example 3: Testing formula evaluation
// ============================================================================

runner.suite('Formula Evaluation - Concrete Example', ({ test, beforeEach }) => {
  
  // Mock formula evaluator
  class MockEvaluator {
    constructor(store) {
      this.store = store;
    }

    eval(formula, arrayId, cell) {
      // Simple evaluator that handles basic cases
      if (!formula.startsWith('=')) {
        return formula; // Not a formula, return as-is
      }

      const expr = formula.substring(1).trim();

      // Handle simple numbers
      if (/^\d+$/.test(expr)) {
        return parseInt(expr, 10);
      }

      // Handle simple arithmetic: =5+10
      if (/^\d+[+\-*/]\d+$/.test(expr)) {
        return eval(expr); // DEMO ONLY - never use eval in production
      }

      // Handle cell references: =A1
      if (/^[A-Z]\d+$/.test(expr)) {
        const cellKey = this.cellRefToKey(expr, arrayId);
        return this.store.getCellValue(cellKey) || null;
      }

      return '#ERROR';
    }

    cellRefToKey(ref, arrayId) {
      const match = ref.match(/^([A-Z])(\d+)$/);
      if (!match) return null;
      
      const x = match[1].charCodeAt(0) - 'A'.charCodeAt(0);
      const y = parseInt(match[2], 10) - 1;
      
      return `${arrayId}:${x},${y},0`;
    }
  }

  class MockCellStore {
    constructor() {
      this.cells = {};
    }

    setCellValue(key, value) {
      this.cells[key] = value;
    }

    getCellValue(key) {
      return this.cells[key];
    }
  }

  let store, evaluator;

  beforeEach(() => {
    store = new MockCellStore();
    evaluator = new MockEvaluator(store);
  });

  test('should return non-formula values as-is', () => {
    const result = evaluator.eval('Hello', 1, { x: 0, y: 0 });
    Assert.equal(result, 'Hello');
  });

  test('should evaluate simple number formula', () => {
    const result = evaluator.eval('=42', 1, { x: 0, y: 0 });
    Assert.equal(result, 42);
  });

  test('should evaluate simple arithmetic', () => {
    const result = evaluator.eval('=5+10', 1, { x: 0, y: 0 });
    Assert.equal(result, 15);
  });

  test('should evaluate cell reference', () => {
    store.setCellValue('1:0,0,0', 100);
    const result = evaluator.eval('=A1', 1, { x: 1, y: 0 });
    Assert.equal(result, 100);
  });

  test('should return null for undefined cell reference', () => {
    const result = evaluator.eval('=A1', 1, { x: 1, y: 0 });
    Assert.null(result);
  });

  test('should handle multi-letter columns correctly', () => {
    const key = evaluator.cellRefToKey('B5', 1);
    Assert.equal(key, '1:1,4,0');
  });
});

// ============================================================================
// Example 4: Testing dependency tracking
// ============================================================================

runner.suite('Dependency Tracking - Concrete Example', ({ test, beforeEach }) => {
  
  // Mock dependency tracker
  class DependencyTracker {
    constructor() {
      this.depsByAnchor = new Map(); // cell -> Set of dependents
      this.anchorsByDep = new Map(); // dependent -> Set of dependencies
    }

    addDependency(sourceKey, dependentKey) {
      // Add to depsByAnchor
      if (!this.depsByAnchor.has(sourceKey)) {
        this.depsByAnchor.set(sourceKey, new Set());
      }
      this.depsByAnchor.get(sourceKey).add(dependentKey);

      // Add to anchorsByDep
      if (!this.anchorsByDep.has(dependentKey)) {
        this.anchorsByDep.set(dependentKey, new Set());
      }
      this.anchorsByDep.get(dependentKey).add(sourceKey);
    }

    removeDependency(sourceKey, dependentKey) {
      if (this.depsByAnchor.has(sourceKey)) {
        this.depsByAnchor.get(sourceKey).delete(dependentKey);
      }
      if (this.anchorsByDep.has(dependentKey)) {
        this.anchorsByDep.get(dependentKey).delete(sourceKey);
      }
    }

    getDependents(sourceKey) {
      return Array.from(this.depsByAnchor.get(sourceKey) || []);
    }

    getDependencies(dependentKey) {
      return Array.from(this.anchorsByDep.get(dependentKey) || []);
    }

    hasCircular(sourceKey, dependentKey, visited = new Set()) {
      if (visited.has(dependentKey)) {
        return dependentKey === sourceKey;
      }
      visited.add(dependentKey);

      const deps = this.getDependencies(dependentKey);
      for (const dep of deps) {
        if (dep === sourceKey) return true;
        if (this.hasCircular(sourceKey, dep, visited)) return true;
      }
      return false;
    }
  }

  let tracker;

  beforeEach(() => {
    tracker = new DependencyTracker();
  });

  test('should add simple dependency', () => {
    tracker.addDependency('A1', 'B1');
    const dependents = tracker.getDependents('A1');
    Assert.arrayIncludes(dependents, 'B1');
  });

  test('should track multiple dependents', () => {
    tracker.addDependency('A1', 'B1');
    tracker.addDependency('A1', 'C1');
    tracker.addDependency('A1', 'D1');
    
    const dependents = tracker.getDependents('A1');
    Assert.arrayLength(dependents, 3);
  });

  test('should track multiple dependencies', () => {
    tracker.addDependency('A1', 'D1');
    tracker.addDependency('B1', 'D1');
    tracker.addDependency('C1', 'D1');
    
    const deps = tracker.getDependencies('D1');
    Assert.arrayLength(deps, 3);
  });

  test('should remove dependency', () => {
    tracker.addDependency('A1', 'B1');
    tracker.removeDependency('A1', 'B1');
    
    const dependents = tracker.getDependents('A1');
    Assert.arrayLength(dependents, 0);
  });

  test('should detect simple circular dependency', () => {
    tracker.addDependency('A1', 'B1');
    tracker.addDependency('B1', 'A1');
    
    Assert.true(tracker.hasCircular('A1', 'B1'));
  });

  test('should detect indirect circular dependency', () => {
    tracker.addDependency('A1', 'B1');
    tracker.addDependency('B1', 'C1');
    tracker.addDependency('C1', 'A1');
    
    Assert.true(tracker.hasCircular('A1', 'C1'));
  });

  test('should not detect false circular', () => {
    tracker.addDependency('A1', 'B1');
    tracker.addDependency('B1', 'C1');
    tracker.addDependency('C1', 'D1');
    
    Assert.false(tracker.hasCircular('A1', 'D1'));
  });
});

// ============================================================================
// Example 5: Integration test with multiple components
// ============================================================================

runner.suite('Integration - Concrete Example', ({ test }) => {
  
  // Bring together store, evaluator, and dependency tracker
  class IntegratedSystem {
    constructor() {
      this.cells = {};
      this.deps = new DependencyTracker();
    }

    setCell(key, value) {
      this.cells[key] = value;
      
      // Trigger recalculation of dependents
      const dependents = this.deps.getDependents(key);
      for (const depKey of dependents) {
        this.recalculate(depKey);
      }
    }

    getCell(key) {
      return this.cells[key];
    }

    setFormula(key, formula) {
      // Parse dependencies (simplified)
      const deps = this.extractDeps(formula);
      
      // Remove old dependencies
      const oldDeps = this.deps.getDependencies(key);
      for (const oldDep of oldDeps) {
        this.deps.removeDependency(oldDep, key);
      }
      
      // Add new dependencies
      for (const dep of deps) {
        this.deps.addDependency(dep, key);
      }
      
      // Store and evaluate
      this.setCell(key, formula);
      this.recalculate(key);
    }

    extractDeps(formula) {
      // Simple extraction: find A1, B2, etc.
      const matches = formula.match(/[A-Z]\d+/g) || [];
      return matches.map(ref => this.refToKey(ref));
    }

    refToKey(ref) {
      const x = ref.charCodeAt(0) - 'A'.charCodeAt(0);
      const y = parseInt(ref.substring(1), 10) - 1;
      return `${x},${y}`;
    }

    recalculate(key) {
      const formula = this.cells[key];
      if (formula && formula.startsWith('=')) {
        const result = this.evaluate(formula, key);
        this.cells[key + ':computed'] = result;
      }
    }

    evaluate(formula, contextKey) {
      // Very simple evaluator for demo
      const expr = formula.substring(1);
      
      // Replace cell references with values
      const evaluated = expr.replace(/[A-Z]\d+/g, (match) => {
        const key = this.refToKey(match);
        const value = this.cells[key + ':computed'] || this.cells[key] || 0;
        return value;
      });
      
      // Evaluate (DEMO ONLY)
      try {
        return eval(evaluated);
      } catch {
        return '#ERROR';
      }
    }
  }

  test('should calculate simple dependency chain', () => {
    const sys = new IntegratedSystem();
    
    // A1 = 5
    sys.setCell('0,0', 5);
    
    // B1 = =A1+10
    sys.setFormula('1,0', '=A1+10');
    
    // Check B1 computed value
    Assert.equal(sys.getCell('1,0:computed'), 15);
  });

  test('should recalculate on source change', () => {
    const sys = new IntegratedSystem();
    
    sys.setCell('0,0', 5);
    sys.setFormula('1,0', '=A1*2');
    
    Assert.equal(sys.getCell('1,0:computed'), 10);
    
    // Change A1
    sys.setCell('0,0', 10);
    
    // B1 should update
    Assert.equal(sys.getCell('1,0:computed'), 20);
  });

  test('should handle multi-level dependency chain', () => {
    const sys = new IntegratedSystem();
    
    // A1 = 1
    sys.setCell('0,0', 1);
    
    // B1 = =A1+1
    sys.setFormula('1,0', '=A1+1');
    
    // C1 = =B1+1
    sys.setFormula('2,0', '=B1+1');
    
    Assert.equal(sys.getCell('1,0:computed'), 2);
    Assert.equal(sys.getCell('2,0:computed'), 3);
  });
});

// For dependency tracker used in integration test
class DependencyTracker {
  constructor() {
    this.depsByAnchor = new Map();
    this.anchorsByDep = new Map();
  }

  addDependency(sourceKey, dependentKey) {
    if (!this.depsByAnchor.has(sourceKey)) {
      this.depsByAnchor.set(sourceKey, new Set());
    }
    this.depsByAnchor.get(sourceKey).add(dependentKey);

    if (!this.anchorsByDep.has(dependentKey)) {
      this.anchorsByDep.set(dependentKey, new Set());
    }
    this.anchorsByDep.get(dependentKey).add(sourceKey);
  }

  removeDependency(sourceKey, dependentKey) {
    if (this.depsByAnchor.has(sourceKey)) {
      this.depsByAnchor.get(sourceKey).delete(dependentKey);
    }
    if (this.anchorsByDep.has(dependentKey)) {
      this.anchorsByDep.get(dependentKey).delete(sourceKey);
    }
  }

  getDependents(sourceKey) {
    return Array.from(this.depsByAnchor.get(sourceKey) || []);
  }

  getDependencies(dependentKey) {
    return Array.from(this.anchorsByDep.get(dependentKey) || []);
  }
}

export default runner;

