#!/usr/bin/env node

/**
 * Command-line test runner for Celli tests
 * Run with: node test-runner-cli.js
 */

// Note: This requires Node.js with ES modules support
// Run with: node --experimental-modules test-runner-cli.js
// Or add "type": "module" to package.json

console.log('\n🧪 Celli Test Runner (CLI)\n');
console.log('========================================\n');

// Check Node version
const nodeVersion = process.versions.node.split('.')[0];
if (parseInt(nodeVersion) < 14) {
  console.error('❌ Node.js 14+ required for ES modules');
  console.error(`   Current version: ${process.versions.node}`);
  process.exit(1);
}

console.log('⚠️  CLI runner requires additional setup\n');
console.log('To run tests via command line:\n');
console.log('1. Add "type": "module" to package.json');
console.log('2. Ensure all imports use .js extensions');
console.log('3. Run: node test-runner-cli.js\n');
console.log('========================================\n');

console.log('💡 Recommended: Use browser test runner instead\n');
console.log('1. Start HTTP server:');
console.log('   python -m http.server 8000');
console.log('   OR');
console.log('   npx http-server -p 8000\n');
console.log('2. Open in browser:');
console.log('   http://localhost:8000/tests/test-runner.html\n');
console.log('========================================\n');

// If "type": "module" is set in package.json, we can proceed
import('fs').then(fs => {
  const packagePath = '../package.json';
  
  fs.readFile(packagePath, 'utf8', (err, data) => {
    if (err) {
      console.log('⚠️  No package.json found in parent directory');
      console.log('   Cannot determine module type\n');
      return;
    }

    try {
      const pkg = JSON.parse(data);
      if (pkg.type === 'module') {
        console.log('✅ ES modules enabled in package.json');
        console.log('   Attempting to load tests...\n');
        runTests();
      } else {
        console.log('⚠️  Add "type": "module" to package.json to enable CLI runner\n');
      }
    } catch (parseErr) {
      console.error('❌ Error parsing package.json:', parseErr.message);
    }
  });
}).catch(err => {
  console.error('❌ Error:', err.message);
});

async function runTests() {
  try {
    // Import test modules
    const storeTests = await import('./store.test.js');
    const formulaTests = await import('./formula.test.js');
    const functionTests = await import('./functions.test.js');
    const dependencyTests = await import('./dependencies.test.js');
    const writeTests = await import('./write-actions.test.js');
    const integrationTests = await import('./integration.test.js');

    // Import test runner
    const { TestRunner } = await import('./test-runner.js');

    // Create master runner
    const masterRunner = new TestRunner();

    // Collect all suites
    if (storeTests.default) {
      masterRunner.suites.push(...storeTests.default.suites);
    }
    if (formulaTests.default) {
      masterRunner.suites.push(...formulaTests.default.suites);
    }
    if (functionTests.default) {
      masterRunner.suites.push(...functionTests.default.suites);
    }
    if (dependencyTests.default) {
      masterRunner.suites.push(...dependencyTests.default.suites);
    }
    if (writeTests.default) {
      masterRunner.suites.push(...writeTests.default.suites);
    }
    if (integrationTests.default) {
      masterRunner.suites.push(...integrationTests.default.suites);
    }

    // Run all tests
    const results = await masterRunner.run();

    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n❌ Error running tests:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

