# Narrative Builder Integration Guide

## Quick Start

### 1. Add to scale-ultra.html

Add this line in the `<head>` section or before the closing `</body>` tag:

```html
<script src="narrative-builder.js"></script>
```

### 2. Initialize the System

```javascript
// Create a new narrative with 20 characters
const narrative = NarrativeBuilder.createNarrative(20);

// Start the 10-minute day loop
NarrativeBuilder.startDayLoop(narrative, (state) => {
  console.log('Day reset! Day', state.dayNumber);
  // Reset UI or notify player
});
```

## Core API

### Setup Functions

- **`createNarrative(characterCount)`** - Generate a new mystery with N characters
- **`startDayLoop(state, onResetCallback)`** - Start the 10-minute timer
- **`stopDayLoop(state)`** - Stop the timer

### Query Functions

- **`getCharacter(state, id)`** - Get character by ID
- **`getAllCharacters(state)`** - Get all characters
- **`getConspiracy(state)`** - Get conspiracy details
- **`getCurrentTime(state)`** - Get current time as "HH:MM"
- **`getCharacterActivity(character, currentTime)`** - Get what character is doing now

### Investigation Functions

- **`interrogate(state, characterId, topic, pressure)`**
  - Topics: `'routine'`, `'conspiracy'`, `'connections'`
  - Pressure: 0-1 (how hard you push)
  - Returns: `{ character, mood, response, suspicion }`

- **`examineEvidence(state, evidenceId)`**
  - Returns: `{ success, evidence, pointsTo, message }`

- **`searchForClues(state, characterId)`**
  - Search character for clues pointing to next person in chain
  - Returns: `{ success, clue, pointsTo, pointsToId, message, hint }`
  - Clues guide investigation toward mastermind

- **`getCharacterPathInfo(state, characterId)`**
  - Get path information for a character
  - Returns: `{ hasPath, degreesFromMastermind, path, pathNames, nextInChain, nextInChainId, totalClues, discoveredClues }`

- **`findPath(characters, fromId, toId)`**
  - Returns: Array of character IDs forming a path

- **`findPathToMastermind(state, startCharId)`**
  - Returns: Path from any character to the conspiracy mastermind

- **`checkVictory(state)`**
  - Returns: `true` if mastermind has been uncovered

### Debug Functions

- **`revealConspiracy(state)`** - Console log the entire conspiracy
- **`printCharacterInfo(state, id)`** - Console log character details (now includes path info)
- **`revealAllPaths(state)`** - Console log all paths to mastermind
- **`revealClues(state, characterId)`** - Console log all clues on a character

## System Features

### Character System

Each character has:
- **Name, occupation** - Generated randomly
- **Social connections** - 3-6 connections to other characters
- **Daily routine** - 6 time slots (07:00, 08:00, 12:00, 15:00, 18:00, 21:00)
- **Mood** (hidden) - calm, nervous, happy, excited, angry, depressed, suspicious
- **Knowledge** - What they know about events
- **Conspiracy role** - Mastermind, Scientist, Courier, etc. (if involved)
- **Path to mastermind** - Shortest path through social network (1-6 degrees)
- **Clues** - 2-4 clues pointing to the next person in their chain

### 6-Degree Clue Chain System

**Every character has a calculated path to the mastermind:**

1. **Path Calculation**: On narrative creation, the system calculates the shortest path from each character to the mastermind through the social network
2. **Degree Tracking**: Each character knows their distance (1-6 degrees) from the mastermind
3. **Directional Clues**: Each character has 2-4 clues that point to the NEXT person in their chain toward the mastermind

**Clue Types:**
- **Meeting records** - Evidence they met with next person
- **Communications** - Texts, emails, phone records, letters
- **Location notes** - References to places the next person frequents
- **Financial records** - Payments between characters
- **Witness accounts** - Mutual connections who saw them together
- **Physical evidence** - Items belonging to next person

**Investigation Flow:**
1. Start with any character
2. Search them for clues using `searchForClues()`
3. Clues reveal the next person to investigate
4. Follow the chain through 1-6 people
5. Eventually reach the mastermind

**Example Chain:**
```
Player starts with Bob (5 degrees from mastermind)
  ↓ [clue: "Email from Bob mentioning Alice"]
Alice (4 degrees)
  ↓ [clue: "Alice's notes mention Coffee Shop - where Carol works"]
Carol (3 degrees)
  ↓ [clue: "Payment of $1,200 from Carol to David"]
David (2 degrees)
  ↓ [clue: "David met with Emma at Town Hall around 15:00"]
Emma (1 degree)
  ↓ [clue: "Emma's business card found in Frank's possession"]
Frank (MASTERMIND)
```

### Conspiracy Templates

Random plots include:
- **Contagion Release** - Spread a disease
- **Computer Virus** - Hack infrastructure
- **Political Coup** - Seize power
- **Industrial Sabotage** - Disable utilities
- **Artifact Theft** - Steal valuable items

Each has 2-5 conspirators with randomized motivations.

### Evidence Chain

- **Direct evidence** - Items held by conspirators
- **Witness accounts** - Connections who saw suspicious activity
- **Red herrings** - False leads to throw off investigation
- **Difficulty ratings** - Some evidence is harder to find

### Social Network

- Everyone connected within **6 degrees of separation**
- Graph is guaranteed connected (no isolated groups)
- Use `findPath()` to trace connections

### Day Loop

- **10-minute real-time** = 1 in-game day (00:00 - 23:59)
- Day resets but player knowledge persists
- Character moods shift based on investigation progress
- Conspirators get more nervous as you close in

## Integration Example for scale-ultra.html

```javascript
// Global narrative state
let gameNarrative = null;

// Initialize on game start
function initGame() {
  gameNarrative = NarrativeBuilder.createNarrative(20);
  
  // Start day loop with callback
  NarrativeBuilder.startDayLoop(gameNarrative, onDayReset);
  
  console.log('Mystery:', gameNarrative.conspiracy.description);
}

// Handle day reset
function onDayReset(state) {
  // Update UI to show new day
  updateTimeDisplay();
  
  // Character moods may have changed
  refreshCharacterVisuals();
}

// Talk to a character
function talkToCharacter(charId) {
  const result = NarrativeBuilder.interrogate(
    gameNarrative, 
    charId, 
    'conspiracy', 
    0.5  // medium pressure
  );
  
  // Display dialogue
  showDialogue(result.character, result.response, result.mood);
  
  // Check if they're acting suspicious
  if (result.suspicion > 0.7) {
    showIndicator('This person seems very nervous...');
  }
}

// Search for evidence on a character
function searchCharacter(charId) {
  const char = gameNarrative.characters[charId];
  
  // Try to find evidence they possess
  for (let evidenceId of char.evidence) {
    const result = NarrativeBuilder.examineEvidence(gameNarrative, evidenceId);
    
    if (result && result.success) {
      showEvidence(result.evidence);
      
      // Check for victory
      if (NarrativeBuilder.checkVictory(gameNarrative)) {
        showVictoryScreen();
      }
      return;
    }
  }
  
  showMessage('Found nothing...');
}

// NEW: Search for clues that point to next person in chain
function searchForClues(charId) {
  const result = NarrativeBuilder.searchForClues(gameNarrative, charId);
  
  if (result.success) {
    showClue(result.clue);
    
    // Show hint about next person
    showHint(`This clue points to ${result.pointsTo}. Investigate them next!`);
    
    // Optionally auto-navigate to next person
    highlightCharacter(result.pointsToId);
    
    return result.pointsToId; // Return ID of next person to investigate
  } else {
    showMessage(result.message);
    return null;
  }
}

// Get path information for a character
function showCharacterPath(charId) {
  const pathInfo = NarrativeBuilder.getCharacterPathInfo(gameNarrative, charId);
  
  if (pathInfo.hasPath) {
    console.log(`Path: ${pathInfo.pathNames.join(' → ')}`);
    console.log(`Degrees from mastermind: ${pathInfo.degreesFromMastermind}`);
    console.log(`Clues: ${pathInfo.discoveredClues}/${pathInfo.totalClues} found`);
    
    if (pathInfo.nextInChain) {
      console.log(`Next to investigate: ${pathInfo.nextInChain}`);
    }
  }
}

// Display current time
function updateTimeDisplay() {
  const time = NarrativeBuilder.getCurrentTime(gameNarrative);
  const day = gameNarrative.dayNumber;
  document.getElementById('gameTime').textContent = `Day ${day} - ${time}`;
}
```

## Accessing Character Data

```javascript
// Get a character
const char = gameNarrative.characters[0];

// Character properties
console.log(char.name);           // "Alice Smith"
console.log(char.occupation);     // "Doctor"
console.log(char.mood.name);      // "calm"
console.log(char.connections);    // [2, 5, 7, 12]
console.log(char.conspiracyRole); // "Mastermind" or null

// Current activity
const activity = NarrativeBuilder.getCharacterActivity(
  char, 
  gameNarrative.currentTime
);
console.log(`${char.name} is ${activity.activity} at ${activity.location}`);

// Check routine
char.routine.forEach(entry => {
  console.log(`${entry.label}: ${entry.activity} at ${entry.location}`);
});
```

## Example: Building a UI Panel

```javascript
function showCharacterPanel(charId) {
  const char = gameNarrative.characters[charId];
  const activity = NarrativeBuilder.getCharacterActivity(char, gameNarrative.currentTime);
  
  return `
    <div class="character-panel">
      <h3>${char.name}</h3>
      <p>Occupation: ${char.occupation}</p>
      <p>Currently: ${activity.activity} at ${activity.location}</p>
      <p>Mood: ${char.mood.name}</p>
      
      <h4>Daily Routine:</h4>
      ${char.routine.map(r => `
        <div>${r.label} - ${r.activity} at ${r.location}</div>
      `).join('')}
      
      <button onclick="interrogate(${charId}, 'routine')">Ask about routine</button>
      <button onclick="interrogate(${charId}, 'conspiracy')">Ask about mystery</button>
      <button onclick="searchCharacter(${charId})">Search for evidence</button>
    </div>
  `;
}
```

## Advanced: Visualizing the Social Network

```javascript
function buildNetworkGraph() {
  const nodes = gameNarrative.characters.map(char => ({
    id: char.id,
    label: char.name,
    color: char.conspiracyRole ? '#ff0000' : '#00ff00'
  }));
  
  const edges = [];
  gameNarrative.characters.forEach(char => {
    char.connections.forEach(connId => {
      if (char.id < connId) { // Avoid duplicates
        edges.push({ from: char.id, to: connId });
      }
    });
  });
  
  // Use with vis.js, d3.js, or your preferred graph library
  return { nodes, edges };
}
```

## Testing Commands

Open browser console after loading:

```javascript
// Create and inspect a narrative
const test = NarrativeBuilder.createNarrative(15);

// See the conspiracy (cheat!)
NarrativeBuilder.revealConspiracy(test);

// NEW: See all paths to mastermind
NarrativeBuilder.revealAllPaths(test);

// Examine a character with path info
NarrativeBuilder.printCharacterInfo(test, 0);

// NEW: See all clues on a character
NarrativeBuilder.revealClues(test, 0);

// Test pathfinding
const path = NarrativeBuilder.findPathToMastermind(test, 0);
console.log('Degrees to mastermind:', path ? path.length - 1 : 'No path');

// Random interrogation
const result = NarrativeBuilder.interrogate(test, 5, 'conspiracy', 0.8);
console.log(result.response);

// NEW: Test clue discovery
const clueResult = NarrativeBuilder.searchForClues(test, 0);
if (clueResult.success) {
  console.log('Found clue:', clueResult.clue.description);
  console.log('Points to:', clueResult.pointsTo);
}

// NEW: Get path info for a character
const pathInfo = NarrativeBuilder.getCharacterPathInfo(test, 5);
console.log('Path:', pathInfo.pathNames.join(' → '));
console.log('Next in chain:', pathInfo.nextInChain);
```

## Walking Through a Complete Investigation

```javascript
// Start investigation
const narrative = NarrativeBuilder.createNarrative(20);

// Pick random starting character
let currentCharId = Math.floor(Math.random() * 20);

// Follow the clue chain
while (true) {
  const char = narrative.characters[currentCharId];
  console.log(`\n=== Investigating ${char.name} ===`);
  
  // Get path info
  const pathInfo = NarrativeBuilder.getCharacterPathInfo(narrative, currentCharId);
  console.log(`Degrees from mastermind: ${pathInfo.degreesFromMastermind}`);
  
  // If this is the mastermind, we're done!
  if (pathInfo.degreesFromMastermind === 0) {
    console.log('🎉 FOUND THE MASTERMIND!');
    break;
  }
  
  // Search for clues
  const clueResult = NarrativeBuilder.searchForClues(narrative, currentCharId);
  
  if (clueResult.success) {
    console.log(`Found: ${clueResult.clue.description}`);
    console.log(`→ Next: ${clueResult.pointsTo}`);
    currentCharId = clueResult.pointsToId;
  } else {
    console.log('No more clues, searching again...');
    // Keep trying until we find a clue
  }
}
```

## Notes

- **Every character has a pre-calculated path to the mastermind** - Investigation is always solvable
- **Clues guide investigation** - Each character has 2-4 clues pointing to the next person in their chain
- **6 degrees maximum** - Shortest path from any character to mastermind is at most 6 hops
- Characters return more info based on **mood** and **dialogue willingness**
- Guilty characters become more nervous as investigation progresses
- Evidence and clues have **difficulty ratings** - may require multiple search attempts
- The 10-minute loop creates urgency but knowledge persists
- Social network guarantees **all conspirators are reachable within 6 degrees**
- **Multiple investigation paths** - You can start from any character and reach the mastermind

