# Test System Quick Start

Get started with Celli testing in under 5 minutes.

## Step 1: Start HTTP Server

The tests require an HTTP server to load ES6 modules.

**Option A: Python (Recommended)**
```bash
cd C:\Users\Scott\Desktop\celli-refactor
python -m http.server 8000
```

**Option B: Node.js**
```bash
cd C:\Users\Scott\Desktop\celli-refactor
npx http-server -p 8000
```

**Option C: Using RUN_SERVER.bat**
```bash
cd C:\Users\Scott\Desktop\celli-refactor
RUN_SERVER.bat
```

## Step 2: Open Test Runner

Navigate to: **http://localhost:8000/tests/test-runner.html**

## Step 3: Run Tests

Click any of the test buttons:

- **Run All Tests** - Execute all test suites
- **Store Tests** - Test state management
- **Formula Tests** - Test formula parser
- **Function Tests** - Test built-in functions
- **Dependency Tests** - Test dependency tracking
- **Write Tests** - Test transactions
- **Integration Tests** - Test end-to-end scenarios

## What You'll See

```
🧪 CELLI TEST RUNNER
========================================

📦 Store Initialization
────────────────────────────────────────
  ✓ Store should initialize with default state
  ✓ nextArrayId should start at 1
  ✓ arrays should be empty initially

📦 Formula Lexer - Tokenization
────────────────────────────────────────
  ✓ should tokenize simple numbers
  ✓ should tokenize strings

========================================
📊 TEST SUMMARY
========================================
Total:   150
Passed:  150 ✓
Failed:  0 ✗
Skipped: 0 ⊘

100.0% Pass Rate
========================================
```

## Current Status

⚠️ **Most tests are placeholders** waiting for full engine extraction.

✅ **Test framework is fully functional** - You can see this by running the concrete example tests.

## Try the Example Tests

To see real working tests:

1. Open `test-runner.html`
2. Open browser console (F12)
3. Type:
```javascript
const example = await import('./example-concrete.test.js');
await example.default.run();
```

This will run actual working tests that demonstrate the system.

## Next Steps

### For Test Development

1. Open any test file (e.g., `store.test.js`)
2. Find a placeholder test
3. Replace with actual implementation (see `example-concrete.test.js` for patterns)
4. Refresh browser and run tests

### For Engine Development

1. Complete module extraction (FormulaParser, Functions, etc.)
2. Update import paths in test files
3. Implement real tests using actual modules
4. Run tests to verify functionality

## Common Issues

### "Failed to load module"
- Make sure HTTP server is running
- Check you're accessing via `http://` not `file://`
- Verify import paths are correct

### "Cannot find module"
- Check that the module exists
- Verify the path is relative to test file location
- Ensure `.js` extension is included in import

### Tests all passing but seem wrong
- Currently tests are placeholders
- They test the framework itself, not actual functionality
- Replace with real implementations as modules become available

## File Structure

```
tests/
├── test-runner.html          # Browser UI
├── test-runner.js            # Test framework
├── test-runner-cli.js        # CLI runner
├── store.test.js             # Store tests
├── formula.test.js           # Formula tests
├── functions.test.js         # Function tests
├── dependencies.test.js      # Dependency tests
├── write-actions.test.js     # Transaction tests
├── integration.test.js       # Integration tests
├── example-concrete.test.js  # Working example tests
├── README.md                 # Full documentation
└── QUICKSTART.md            # This file
```

## Writing Your First Test

```javascript
import { TestRunner, Assert } from './test-runner.js';

const runner = new TestRunner();

runner.suite('My Feature', ({ test }) => {
  
  test('should do something', () => {
    const result = myFunction(input);
    Assert.equal(result, expected);
  });
  
});

export default runner;
```

## Useful Assertions

```javascript
// Equality
Assert.equal(actual, expected)
Assert.deepEqual(obj1, obj2)

// Truthiness
Assert.true(value)
Assert.truthy(value)
Assert.falsy(value)

// Existence
Assert.exists(value)
Assert.null(value)

// Arrays
Assert.arrayIncludes(array, item)
Assert.arrayLength(array, length)

// Errors
Assert.throws(() => dangerousFunction())
```

## Getting Help

- See `README.md` for full documentation
- Check `example-concrete.test.js` for working examples
- Look at existing test structure for patterns
- Browser console shows detailed error messages

## Tips

1. **Start simple** - Test one thing at a time
2. **Use beforeEach** - Set up fresh state for each test
3. **Keep tests isolated** - Don't depend on other tests
4. **Use descriptive names** - "should calculate sum of range" not "test1"
5. **Test edge cases** - Zero, negative, null, undefined, empty arrays

## Success!

You're ready to use the Celli test system. Happy testing! 🧪

