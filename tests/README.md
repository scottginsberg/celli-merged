# Celli Testing System

Automated unit and regression testing framework for Celli subsystems without UI dependencies.

## Overview

This testing system provides comprehensive test coverage for the core Celli engine:

- **Store Tests** - State management, arrays, selections, global state
- **Formula Tests** - Parser, evaluator, tokenization, AST generation
- **Function Tests** - Built-in functions (TRANSPOSE, ARRAY, DELETE, etc.)
- **Dependency Tests** - Dependency tracking, circular detection, recalculation
- **Write/Actions Tests** - Transactions, batching, history, metadata
- **Integration Tests** - End-to-end scenarios with complex formulas

## Running Tests

### Browser (Recommended)

1. Open `test-runner.html` in a browser
2. Click "Run All Tests" or select specific test suites
3. View results in real-time

**Note:** Must be served via HTTP server (not `file://`) for ES6 modules:

```bash
# Using Python
python -m http.server 8000

# Using Node.js http-server
npx http-server -p 8000

# Navigate to:
# http://localhost:8000/tests/test-runner.html
```

### Command Line (Node.js)

```bash
node test-runner-cli.js
```

## Test Structure

### Test Files

- `test-runner.js` - Core test framework and assertions
- `store.test.js` - Store and state management tests
- `formula.test.js` - Formula parser and evaluator tests
- `functions.test.js` - Function library tests
- `dependencies.test.js` - Dependency tracking tests
- `write-actions.test.js` - Write/Actions transaction tests
- `integration.test.js` - Integration and end-to-end tests

### Writing Tests

```javascript
import { TestRunner, Assert } from './test-runner.js';

const runner = new TestRunner();

runner.suite('My Test Suite', ({ test, beforeEach, afterEach }) => {
  
  beforeEach(() => {
    // Setup before each test
  });

  test('should do something', () => {
    const result = myFunction();
    Assert.equal(result, expectedValue);
  });

  test('should handle edge cases', () => {
    Assert.throws(() => myFunction(invalidInput));
  });
});

export default runner;
```

## Assertion Methods

### Equality
- `Assert.equal(actual, expected, message?)` - Strict equality (===)
- `Assert.notEqual(actual, expected, message?)` - Strict inequality (!==)
- `Assert.deepEqual(actual, expected, message?)` - Deep JSON equality

### Boolean
- `Assert.true(value, message?)` - Value is exactly true
- `Assert.false(value, message?)` - Value is exactly false
- `Assert.truthy(value, message?)` - Value is truthy
- `Assert.falsy(value, message?)` - Value is falsy

### Existence
- `Assert.exists(value, message?)` - Not null or undefined
- `Assert.null(value, message?)` - Value is null
- `Assert.undefined(value, message?)` - Value is undefined

### Errors
- `Assert.throws(fn, expectedError?, message?)` - Function throws
- `Assert.throwsAsync(fn, expectedError?, message?)` - Async function throws

### Arrays
- `Assert.arrayIncludes(array, item, message?)` - Array contains item
- `Assert.arrayLength(array, length, message?)` - Array has specific length

### Objects
- `Assert.objectHasProperty(obj, property, message?)` - Object has property
- `Assert.instanceOf(obj, constructor, message?)` - Instance check

### Numbers
- `Assert.closeTo(actual, expected, delta?, message?)` - Numeric proximity

### Strings
- `Assert.match(string, regex, message?)` - String matches regex

## Test Lifecycle Hooks

- `beforeAll(fn)` - Runs once before all tests in suite
- `beforeEach(fn)` - Runs before each test
- `afterEach(fn)` - Runs after each test
- `afterAll(fn)` - Runs once after all tests in suite

## Current Status

### Implementation Status

Most tests are currently **placeholder tests** that validate the test framework itself. They need to be filled in with actual implementation once the Celli engine modules are fully extracted and available.

### What's Working

✅ Test runner framework  
✅ Assertion library  
✅ Test suite organization  
✅ Browser test runner UI  
✅ Test structure and placeholders  

### What Needs Implementation

⏳ Actual test implementations (currently placeholders)  
⏳ Integration with Celli Store module  
⏳ Integration with Celli Formula module  
⏳ Integration with Celli Write/Actions module  

## Next Steps

1. **Extract remaining engine modules** - Complete the extraction of FormulaParser, Functions, etc.
2. **Implement actual tests** - Replace placeholder tests with real implementations
3. **Add mock utilities** - Create helpers for mocking Store, Scene, etc.
4. **Expand coverage** - Add more edge cases and regression tests
5. **Performance tests** - Add benchmarks for large arrays and complex formulas
6. **CI Integration** - Setup automated test runs on changes

## Architecture Notes

### Sans UI Design

Tests are designed to run without UI dependencies:

- No DOM manipulation in tests
- No Three.js scene requirements
- No Babylon.js dependencies
- Pure JavaScript engine testing

### Module System

Tests use ES6 modules:

```javascript
import { Store } from '../src/scripts/engine/Store.js';
import { TestRunner, Assert } from './test-runner.js';
```

### Test Isolation

Each test should:

- Not depend on other tests
- Clean up after itself
- Use fresh state when needed
- Mock external dependencies

## Test Coverage Goals

| Subsystem | Target Coverage | Current Status |
|-----------|----------------|----------------|
| Store | 90%+ | Framework ready |
| Formula Parser | 90%+ | Framework ready |
| Functions | 80%+ | Framework ready |
| Dependencies | 85%+ | Framework ready |
| Write/Actions | 85%+ | Framework ready |
| Integration | 70%+ | Framework ready |

## Contributing

When adding new tests:

1. Follow existing test structure
2. Use descriptive test names
3. Keep tests focused and atomic
4. Add comments for complex scenarios
5. Update this README if adding new test files

## Example Test Session

```
🧪 CELLI TEST RUNNER
========================================

📦 Store Initialization
────────────────────────────────────────
  ✓ Store should initialize with default state
  ✓ nextArrayId should start at 1
  ✓ arrays should be empty initially
  ✓ selection should have null values initially

📦 Formula Lexer - Tokenization
────────────────────────────────────────
  ✓ should tokenize simple numbers
  ✓ should tokenize strings
  ✓ should tokenize cell references

========================================
📊 TEST SUMMARY
========================================
Total:   150
Passed:  145 ✓
Failed:  5 ✗
Skipped: 0 ⊘

96.7% Pass Rate
========================================
```

## Troubleshooting

### Tests won't load in browser
- Ensure you're using an HTTP server, not `file://`
- Check browser console for module loading errors
- Verify all import paths are correct

### Import errors
- Make sure all test files export their runner as default
- Check that test-runner.js is accessible from test files
- Verify relative import paths

### Store/Formula not found
- Ensure engine modules are fully extracted
- Check import paths point to correct module locations
- Verify modules are exported correctly

## License

Part of the Celli project.

