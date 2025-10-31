# 6-Degree Clue Chain System - Quick Reference

## Overview

Every character in the narrative has a **calculated shortest path** to the mastermind through the social network. Each character possesses **2-4 directional clues** that guide investigation toward the next person in their chain.

## Key Features

### 1. Pre-Calculated Paths
- On narrative generation, BFS calculates shortest path from each character to mastermind
- Paths are 1-6 degrees long (guaranteed by social network connectivity)
- Stored in `character.pathToMastermind` array

### 2. Directional Clues
Each character has clues pointing to their `path[1]` (next in chain):
- **Meeting records**: Evidence of meetings with next person
- **Communications**: Texts, emails, phone records
- **Location notes**: References to places next person frequents
- **Financial records**: Payment trails between people
- **Witness accounts**: Mutual connections who saw them together
- **Physical evidence**: Items belonging to next person

### 3. Discovery Mechanics
- Use `searchForClues(state, characterId)` to find clues
- Clues have difficulty ratings (0.25-0.5)
- Failed searches can be retried
- Discovered clues stored with `discovered: true` flag

## API Reference

### New Functions

**searchForClues(state, characterId)**
```javascript
const result = NarrativeBuilder.searchForClues(narrative, characterId);
// Returns:
{
  success: true/false,
  clue: { type, description, pointsTo, difficulty, discovered },
  pointsTo: "Next Person Name",
  pointsToId: nextPersonId,
  message: "Found: [clue description]",
  hint: "This suggests you should investigate [name] next."
}
```

**getCharacterPathInfo(state, characterId)**
```javascript
const info = NarrativeBuilder.getCharacterPathInfo(narrative, characterId);
// Returns:
{
  hasPath: true,
  degreesFromMastermind: 3,
  path: [charId, nextId, ..., mastermindId],
  pathNames: ["Alice", "Bob", "Carol", "Mastermind"],
  nextInChain: "Bob",
  nextInChainId: 1,
  totalClues: 3,
  discoveredClues: 1
}
```

### Debug Functions

**revealAllPaths(state)** - Console log all paths to mastermind
**revealClues(state, charId)** - Console log all clues on a character

## Investigation Flow

### Linear Investigation
```javascript
// Start with any character
let currentId = 0;

while (true) {
  // Check if mastermind
  const pathInfo = NarrativeBuilder.getCharacterPathInfo(narrative, currentId);
  if (pathInfo.degreesFromMastermind === 0) {
    console.log('Found mastermind!');
    break;
  }
  
  // Search for clues
  const result = NarrativeBuilder.searchForClues(narrative, currentId);
  if (result.success) {
    currentId = result.pointsToId; // Move to next in chain
  }
}
```

### Display Character Investigation Status
```javascript
function showInvestigationStatus(charId) {
  const char = narrative.characters[charId];
  const pathInfo = NarrativeBuilder.getCharacterPathInfo(narrative, charId);
  
  console.log(`${char.name}`);
  console.log(`├─ Degrees from mastermind: ${pathInfo.degreesFromMastermind}`);
  console.log(`├─ Clues: ${pathInfo.discoveredClues}/${pathInfo.totalClues}`);
  console.log(`└─ Next: ${pathInfo.nextInChain || 'MASTERMIND'}`);
}
```

### Chain Visualization
```javascript
function visualizePath(charId) {
  const pathInfo = NarrativeBuilder.getCharacterPathInfo(narrative, charId);
  const path = pathInfo.pathNames.join(' → ');
  console.log(`Path: ${path}`);
  console.log(`Length: ${pathInfo.degreesFromMastermind} hops`);
}
```

## Integration Example

```javascript
// In your game's character interaction system
function onCharacterClick(characterId) {
  selectedChar = characterId;
  
  // Show path info in UI
  const pathInfo = NarrativeBuilder.getCharacterPathInfo(narrative, characterId);
  
  updateUI({
    name: narrative.characters[characterId].name,
    degrees: pathInfo.degreesFromMastermind,
    cluesFound: pathInfo.discoveredClues,
    cluesTotal: pathInfo.totalClues,
    nextTarget: pathInfo.nextInChain
  });
}

function onSearchButton() {
  if (!selectedChar) return;
  
  const result = NarrativeBuilder.searchForClues(narrative, selectedChar);
  
  if (result.success) {
    showNotification(`Found: ${result.clue.description}`);
    showHint(`Investigate ${result.pointsTo} next!`);
    
    // Optional: Auto-navigate to next character
    highlightCharacter(result.pointsToId);
  } else {
    showNotification(result.message);
  }
}
```

## Character Data Structure

Each character now has:
```javascript
{
  id: 0,
  name: "Alice Smith",
  occupation: "Doctor",
  // ... existing fields ...
  
  // NEW: Path tracking
  pathToMastermind: [0, 5, 12, 19], // IDs forming path to mastermind
  degreesFromMastermind: 3, // Number of hops
  
  // NEW: Directional clues
  cluesPointingToNext: [
    {
      type: "meeting record",
      description: "Alice met with Bob at Coffee Shop around 12:00",
      pointsTo: 5, // Bob's ID
      difficulty: 0.3,
      discovered: false
    },
    // ... 1-3 more clues
  ]
}
```

## Clue Generation Logic

For each character (except mastermind):
1. Calculate shortest path to mastermind using BFS
2. Identify next person in path: `path[1]`
3. Generate 2-4 clues pointing to that person
4. Clue types vary based on:
   - Character routines (for location/meeting clues)
   - Social connections (for witness accounts)
   - Randomization (for variety)

## Testing

```javascript
// Generate narrative
const narrative = NarrativeBuilder.createNarrative(20);

// Verify all paths exist
NarrativeBuilder.revealAllPaths(narrative);
// Should show 19 paths (all characters → mastermind)

// Test clue discovery on first character
console.log('\nTesting clue discovery:');
NarrativeBuilder.revealClues(narrative, 0);

// Follow a complete path
let current = 0;
console.log('\nFollowing path to mastermind:');
while (true) {
  const pathInfo = NarrativeBuilder.getCharacterPathInfo(narrative, current);
  console.log(`At: ${narrative.characters[current].name} (${pathInfo.degreesFromMastermind} degrees)`);
  
  if (pathInfo.degreesFromMastermind === 0) break;
  
  const result = NarrativeBuilder.searchForClues(narrative, current);
  if (result.success) {
    console.log(`  └─ Clue: ${result.clue.description}`);
    current = result.pointsToId;
  }
}
```

## Benefits

✅ **Always Solvable** - Every character has a guaranteed path to mastermind  
✅ **Guided Investigation** - Clues provide clear direction to next target  
✅ **No Dead Ends** - Players can start from any character  
✅ **Realistic Detective Work** - Follow evidence chains like real investigations  
✅ **Replayability** - Different starting points create different experiences  
✅ **Difficulty Tuning** - Adjust clue difficulty ratings for challenge  

## Advanced Features

### Multiple Paths
Some characters may have multiple valid paths. System chooses shortest path using BFS.

### Red Herrings
The original evidence system still includes red herrings that point to innocent characters. These don't follow the clue chain logic.

### Dynamic Difficulty
Clue difficulty ranges from 0.25 (witness accounts) to 0.5 (location notes). Adjust these values to make investigation easier or harder.

### Progress Tracking
Track player's investigation efficiency:
```javascript
function getInvestigationStats(narrative) {
  let totalClues = 0;
  let discovered = 0;
  
  narrative.characters.forEach(char => {
    if (char.cluesPointingToNext) {
      totalClues += char.cluesPointingToNext.length;
      discovered += char.cluesPointingToNext.filter(c => c.discovered).length;
    }
  });
  
  return {
    progress: (discovered / totalClues) * 100,
    cluesFound: discovered,
    cluesTotal: totalClues
  };
}
```

