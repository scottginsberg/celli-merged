/**
 * Test Runner & Assertion Framework
 * Lightweight testing system for Celli subsystems without UI dependencies
 */

class TestRunner {
  constructor() {
    this.suites = [];
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };
  }

  /**
   * Register a test suite
   */
  suite(name, setupFn) {
    const suite = {
      name,
      tests: [],
      beforeEach: null,
      afterEach: null,
      beforeAll: null,
      afterAll: null
    };

    // Pass suite context to setup function
    const context = {
      test: (testName, testFn) => {
        suite.tests.push({ name: testName, fn: testFn, skip: false });
      },
      skip: (testName, testFn) => {
        suite.tests.push({ name: testName, fn: testFn, skip: true });
      },
      beforeEach: (fn) => { suite.beforeEach = fn; },
      afterEach: (fn) => { suite.afterEach = fn; },
      beforeAll: (fn) => { suite.beforeAll = fn; },
      afterAll: (fn) => { suite.afterAll = fn; }
    };

    setupFn(context);
    this.suites.push(suite);
  }

  /**
   * Run all test suites
   */
  async run() {
    console.log('\n========================================');
    console.log('🧪 CELLI TEST RUNNER');
    console.log('========================================\n');

    for (const suite of this.suites) {
      await this.runSuite(suite);
    }

    this.printSummary();
    return this.results;
  }

  /**
   * Run a single test suite
   */
  async runSuite(suite) {
    console.log(`\n📦 ${suite.name}`);
    console.log('─'.repeat(40));

    // Run beforeAll hook
    if (suite.beforeAll) {
      try {
        await suite.beforeAll();
      } catch (error) {
        console.error(`❌ beforeAll hook failed: ${error.message}`);
        return;
      }
    }

    // Run each test
    for (const test of suite.tests) {
      if (test.skip) {
        console.log(`  ⊘ ${test.name} (skipped)`);
        this.results.skipped++;
        continue;
      }

      // Run beforeEach hook
      if (suite.beforeEach) {
        try {
          await suite.beforeEach();
        } catch (error) {
          console.error(`  ❌ beforeEach hook failed: ${error.message}`);
          continue;
        }
      }

      // Run the test
      try {
        await test.fn();
        console.log(`  ✓ ${test.name}`);
        this.results.passed++;
      } catch (error) {
        console.log(`  ✗ ${test.name}`);
        console.error(`    ${error.message}`);
        this.results.failed++;
        this.results.errors.push({
          suite: suite.name,
          test: test.name,
          error: error.message,
          stack: error.stack
        });
      }

      this.results.total++;

      // Run afterEach hook
      if (suite.afterEach) {
        try {
          await suite.afterEach();
        } catch (error) {
          console.error(`  ⚠ afterEach hook failed: ${error.message}`);
        }
      }
    }

    // Run afterAll hook
    if (suite.afterAll) {
      try {
        await suite.afterAll();
      } catch (error) {
        console.error(`⚠ afterAll hook failed: ${error.message}`);
      }
    }
  }

  /**
   * Print test summary
   */
  printSummary() {
    console.log('\n========================================');
    console.log('📊 TEST SUMMARY');
    console.log('========================================');
    console.log(`Total:   ${this.results.total}`);
    console.log(`Passed:  ${this.results.passed} ✓`);
    console.log(`Failed:  ${this.results.failed} ✗`);
    console.log(`Skipped: ${this.results.skipped} ⊘`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ FAILURES:');
      this.results.errors.forEach((err, i) => {
        console.log(`\n${i + 1}. ${err.suite} > ${err.test}`);
        console.log(`   ${err.error}`);
      });
    }

    const passRate = this.results.total > 0 
      ? ((this.results.passed / this.results.total) * 100).toFixed(1)
      : 0;
    
    console.log(`\n${passRate}% Pass Rate`);
    console.log('========================================\n');
  }
}

/**
 * Assertion utilities
 */
class Assert {
  static equal(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(
        message || `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`
      );
    }
  }

  static notEqual(actual, expected, message) {
    if (actual === expected) {
      throw new Error(
        message || `Expected values to be different, but both were ${JSON.stringify(actual)}`
      );
    }
  }

  static deepEqual(actual, expected, message) {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr !== expectedStr) {
      throw new Error(
        message || `Deep equality failed.\nExpected: ${expectedStr}\nActual:   ${actualStr}`
      );
    }
  }

  static true(value, message) {
    if (value !== true) {
      throw new Error(message || `Expected true but got ${value}`);
    }
  }

  static false(value, message) {
    if (value !== false) {
      throw new Error(message || `Expected false but got ${value}`);
    }
  }

  static truthy(value, message) {
    if (!value) {
      throw new Error(message || `Expected truthy value but got ${value}`);
    }
  }

  static falsy(value, message) {
    if (value) {
      throw new Error(message || `Expected falsy value but got ${value}`);
    }
  }

  static exists(value, message) {
    if (value === null || value === undefined) {
      throw new Error(message || `Expected value to exist but got ${value}`);
    }
  }

  static null(value, message) {
    if (value !== null) {
      throw new Error(message || `Expected null but got ${value}`);
    }
  }

  static undefined(value, message) {
    if (value !== undefined) {
      throw new Error(message || `Expected undefined but got ${value}`);
    }
  }

  static throws(fn, expectedError, message) {
    try {
      fn();
      throw new Error(message || 'Expected function to throw but it did not');
    } catch (error) {
      if (expectedError && error.message !== expectedError) {
        throw new Error(
          `Expected error "${expectedError}" but got "${error.message}"`
        );
      }
    }
  }

  static async throwsAsync(fn, expectedError, message) {
    try {
      await fn();
      throw new Error(message || 'Expected async function to throw but it did not');
    } catch (error) {
      if (expectedError && error.message !== expectedError) {
        throw new Error(
          `Expected error "${expectedError}" but got "${error.message}"`
        );
      }
    }
  }

  static arrayIncludes(array, item, message) {
    if (!Array.isArray(array)) {
      throw new Error('First argument must be an array');
    }
    if (!array.includes(item)) {
      throw new Error(
        message || `Expected array to include ${JSON.stringify(item)}`
      );
    }
  }

  static arrayLength(array, length, message) {
    if (!Array.isArray(array)) {
      throw new Error('First argument must be an array');
    }
    if (array.length !== length) {
      throw new Error(
        message || `Expected array length ${length} but got ${array.length}`
      );
    }
  }

  static objectHasProperty(obj, property, message) {
    if (typeof obj !== 'object' || obj === null) {
      throw new Error('First argument must be an object');
    }
    if (!Object.prototype.hasOwnProperty.call(obj, property)) {
      throw new Error(
        message || `Expected object to have property "${property}"`
      );
    }
  }

  static instanceOf(obj, constructor, message) {
    if (!(obj instanceof constructor)) {
      throw new Error(
        message || `Expected instance of ${constructor.name} but got ${typeof obj}`
      );
    }
  }

  static closeTo(actual, expected, delta = 0.001, message) {
    if (Math.abs(actual - expected) > delta) {
      throw new Error(
        message || `Expected ${actual} to be close to ${expected} (±${delta})`
      );
    }
  }

  static match(string, regex, message) {
    if (!regex.test(string)) {
      throw new Error(
        message || `Expected "${string}" to match ${regex}`
      );
    }
  }
}

// Export for use in tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TestRunner, Assert };
} else {
  window.TestRunner = TestRunner;
  window.Assert = Assert;
}

