# VisiCell Layer Gating & State Management Fix

## Issues Fixed

### 1. ✅ Scene Starting at Wrong State (await-search instead of await-leave)
**Problem**: When selecting VisiCell from scene selector, the scene was starting with "Type SEARCH to begin the quest..." prompt, indicating it was in `await-search` state instead of the correct initial `await-leave` state.

**Root Cause**: The scene was preserving state from previous sessions. The initialization logic had conditional reset logic that wasn't catching all cases.

**Solution** (Lines 2391-2417):
- Removed conditional reset logic
- **ALWAYS** clear all previous state on initialization:
  - Clear message cells
  - Clear trail layers
  - Clear resizable cells
- Force reset to `await-leave` state regardless of previous state
- Added comprehensive logging to track state transitions

**Console Output**:
```
📋 Initializing clue trail (skipIntro mode: true/false)
📋 Current clue state before init: await-search await-command
🧹 Clearing all previous clue trail state for fresh start
🔄 Forcing reset to initial await-leave state
```

### 2. ✅ All 3 Layers Appearing Instantly When Typing LEAVE
**Problem**: When entering LEAVE, all 3 layers (Layer 0, Layer 1, Layer 2) appeared instantly with timed delays (0ms, 2200ms, 4400ms), rather than being gated by puzzle progression.

**Root Cause**: The `_startClueTrailSequence()` method was spawning all layers automatically on a timer when LEAVE was entered. Layers should only appear when the corresponding clue is solved.

**Solution**: Decoupled layer spawning from the timed sequence:

#### Part A: Modified `_startClueTrailSequence()` (Lines 3400-3411)
- Changed `_revealClueStep()` calls to pass `skipLayer = true`
- Layers no longer spawn from the timed sequence
- Only cell values (NEXT, DOOR, OPENS) appear on timer

#### Part B: Modified `_revealClueStep()` (Line 3413)
- Added `skipLayer = false` parameter
- Layers only spawn when `skipLayer === false` (explicit command entry)
- Timed reveals skip layer spawning

#### Part C: Added Layer Spawning to Each Command Handler
Each command now spawns its corresponding layer **ONLY** when that command is entered:

| Command | Layer Index | Location | Description |
|---------|-------------|----------|-------------|
| **LEAVE** | 0 | Lines 2747-2760 | Shows "ENTER" and entry cell |
| **SEARCH** | 1 | Lines 2791-2802 | Shows "NEXT → DOOR → OPENS" |
| **KEY** | 2 | Lines 2816-2827 | Shows "KEY + ENTER + CREATION" |
| **SNAKE** | 3 | Lines 2840-2851 | Shows "SNAKE → SNEAK → KING" |
| **BURGER KING** | 4 | Lines 2864-2875 | Shows "BURGER KING + OZYMANDIAS" |
| **RAMSES II** | 5 | Lines 2892-2903 | Shows "RAMSES II + 35 MIN" |

## Correct Flow Now

### Initial State
```
Scene starts → ENTE appears in entry cell
User sees: "FINISH THE WORD IN CELL..."
Prompt: "REQUEST: TYPE LEAVE"
Layers visible: None (0 layers)
```

### After Typing LEAVE
```
User types LEAVE → Clue trail sequence starts
Cells appear on timer: NEXT (0ms), DOOR (2200ms), OPENS (4400ms)
Layer 0 spawns IMMEDIATELY
Layers visible: 1 layer (Entrypoint)
Prompt: "REQUEST: SEARCH"
```

### After Typing SEARCH
```
User types SEARCH → Onion riddle appears
Layer 1 spawns WHEN SEARCH IS ENTERED
Layers visible: 2 layers (Entrypoint + Search)
Prompt: "REQUEST: IDENTIFY KEY"
```

### After Typing KEY
```
User types KEY → Video plays
Layer 2 spawns WHEN KEY IS ENTERED
Layers visible: 3 layers (Entrypoint + Search + Key)
Prompt: "REQUEST: SNAKE"
```

### Progression continues...
Each subsequent command spawns its layer:
- SNAKE → Layer 3
- BURGER KING → Layer 4
- RAMSES II → Layer 5
- Clock adjustment → Layer 6 (if applicable)

## Files Modified

**VisiCellScene.js**:
- **Lines 2391-2417**: Force reset initialization state, remove conditional logic
- **Lines 2747-2760**: LEAVE command spawns Layer 0
- **Lines 2791-2802**: SEARCH command spawns Layer 1
- **Lines 2816-2827**: KEY command spawns Layer 2
- **Lines 2840-2851**: SNAKE command spawns Layer 3
- **Lines 2864-2875**: BURGER KING command spawns Layer 4
- **Lines 2892-2903**: RAMSES II command spawns Layer 5
- **Lines 3400-3411**: Modified sequence to skip layer spawning
- **Line 3413**: Added `skipLayer` parameter to `_revealClueStep()`

## Testing Checklist

- [ ] Scene always starts with ENTE (await-leave state)
- [ ] No layers visible initially
- [ ] Typing LEAVE spawns only Layer 0
- [ ] Typing SEARCH spawns Layer 1 (total: 2 layers)
- [ ] Typing KEY spawns Layer 2 (total: 3 layers)
- [ ] Typing SNAKE spawns Layer 3 (total: 4 layers)
- [ ] Typing BURGER KING spawns Layer 4 (total: 5 layers)
- [ ] Typing RAMSES II spawns Layer 5 (total: 6 layers)
- [ ] Layers stack properly with increasing z-index
- [ ] No layers spawn from timed cell reveals (NEXT, DOOR, OPENS)
- [ ] Scene selector and intro transition both show identical initial state

## Console Logging

New logging added for debugging:
- `📋 Initializing clue trail (skipIntro mode: X)`
- `📋 Current clue state before init: [riddleStage] [stage]`
- `🧹 Clearing all previous clue trail state for fresh start`
- `🔄 Forcing reset to initial await-leave state`
- `⏰ Executing clue step X/Y - cell: [cell], value: [value]`
- `// Don't spawn layers here - they spawn when commands are entered` (in code comment)

## Architecture

### Before (Broken)
```
LEAVE entered
  ↓
_startClueTrailSequence() schedules:
  - Step 0 (0ms): Cell C5 = "NEXT" + SPAWN LAYER 0
  - Step 1 (2200ms): Cell E3 = "DOOR" + SPAWN LAYER 1
  - Step 2 (4400ms): Cell D7 = "OPENS" + SPAWN LAYER 2
  ↓
All 3 layers appear automatically ❌
```

### After (Fixed)
```
LEAVE entered
  ↓
Immediately: SPAWN LAYER 0 ✅
_startClueTrailSequence() schedules:
  - Step 0 (0ms): Cell C5 = "NEXT" (NO LAYER)
  - Step 1 (2200ms): Cell E3 = "DOOR" (NO LAYER)
  - Step 2 (4400ms): Cell D7 = "OPENS" (NO LAYER)
  ↓
User types SEARCH → SPAWN LAYER 1 ✅
User types KEY → SPAWN LAYER 2 ✅
User types SNAKE → SPAWN LAYER 3 ✅
etc.
```

## Key Principle

**Layers are rewards for solving clues, not automatic decorations.**

Each layer represents a "depth" of understanding unlocked by the player. They should only appear when the player demonstrates they've understood the previous clue by entering the correct command.

The timed cell reveals (NEXT, DOOR, OPENS) are narrative hints that guide the player to the next clue, but the layers themselves are unlocked through player action.

