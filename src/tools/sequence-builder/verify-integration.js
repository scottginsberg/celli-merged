/**
 * Sequence Builder Integration Verification
 * Run this in the browser console to check if all required functions are available
 */

export function verifyIntegration() {
  console.log('🔍 Verifying Sequence Builder Integration...\n');
  
  const checks = [];
  
  // Check parent window access
  const hasParent = window.parent && window.parent !== window;
  const hasOpener = !!window.opener;
  
  checks.push({
    name: 'Parent Window Access',
    status: hasParent,
    message: hasParent ? '✅ Can access parent window' : '❌ No parent window'
  });
  
  checks.push({
    name: 'Opener Window Access',
    status: hasOpener,
    message: hasOpener ? '✅ Can access opener window' : '❌ No opener window'
  });
  
  const targetWindow = hasParent ? window.parent : (hasOpener ? window.opener : null);
  
  if (!targetWindow) {
    console.error('❌ No parent or opener window found!');
    return checks;
  }
  
  // Check transitionToScene function
  checks.push({
    name: 'transitionToScene Function',
    status: typeof targetWindow.transitionToScene === 'function',
    message: typeof targetWindow.transitionToScene === 'function' ? 
      '✅ transitionToScene() available' : 
      '❌ transitionToScene() not found'
  });
  
  // Check getSceneByName function
  checks.push({
    name: 'getSceneByName Function',
    status: typeof targetWindow.getSceneByName === 'function',
    message: typeof targetWindow.getSceneByName === 'function' ? 
      '✅ getSceneByName() available' : 
      '❌ getSceneByName() not found'
  });
  
  // Check scenes registry
  checks.push({
    name: 'Scenes Registry',
    status: !!targetWindow.scenes,
    message: targetWindow.scenes ? 
      `✅ Scenes registry available with ${Object.keys(targetWindow.scenes).length} scenes` : 
      '❌ Scenes registry not found'
  });
  
  if (targetWindow.scenes) {
    console.log('Available scenes:', Object.keys(targetWindow.scenes));
  }
  
  // Check currentScene
  checks.push({
    name: 'Current Scene Instance',
    status: !!targetWindow.currentScene,
    message: targetWindow.currentScene ? 
      `✅ currentScene available: ${targetWindow.currentScene.constructor.name}` : 
      '⚠️ No currentScene (may not be running yet)'
  });
  
  // Check introScene
  checks.push({
    name: 'Intro Scene Instance',
    status: !!targetWindow.introScene,
    message: targetWindow.introScene ? 
      `✅ introScene available: ${targetWindow.introScene.constructor.name}` : 
      '⚠️ No introScene (intro not started yet)'
  });
  
  // Print results
  console.log('\n📊 Integration Check Results:\n');
  checks.forEach(check => {
    console.log(`${check.status ? '✅' : '❌'} ${check.name}`);
    console.log(`   ${check.message}\n`);
  });
  
  // Summary
  const passed = checks.filter(c => c.status).length;
  const total = checks.length;
  const critical = checks.slice(0, 4); // First 4 are critical
  const criticalPassed = critical.filter(c => c.status).length;
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Total Checks: ${passed}/${total} passed`);
  console.log(`Critical Checks: ${criticalPassed}/${critical.length} passed`);
  
  if (criticalPassed === critical.length) {
    console.log('\n✅ Integration is COMPLETE - All critical functions available');
    console.log('You can now:');
    console.log('  - Switch scenes via dropdown');
    console.log('  - Auto-ingest scene data');
    console.log('  - Use all sequence builder features');
  } else {
    console.log('\n❌ Integration is INCOMPLETE');
    console.log('Required fixes:');
    
    if (!targetWindow.transitionToScene) {
      console.log('  - Add: window.transitionToScene = transitionToScene; to main index.html');
    }
    if (!targetWindow.getSceneByName) {
      console.log('  - Add: window.getSceneByName = function(name) {...}; to main index.html');
    }
    if (!targetWindow.scenes) {
      console.log('  - Add: window.scenes = scenes; to main index.html');
    }
  }
  
  console.log(`${'='.repeat(50)}\n`);
  
  return checks;
}

// Auto-run if in browser console
if (typeof window !== 'undefined' && !window.location.href.includes('test')) {
  console.log('💡 Integration verification loaded.');
  console.log('💡 Run verifyIntegration() to check if everything is properly exposed.');
}

