# VisiCell Sequence Updates

## File Modified
`src/scripts/scenes/VisiCellScene.js`

## Changes Made

### 1. R Sequence Cancellation
**Lines: 1002-1030, 2242, 2260**
- Added `_cancelRSequence()` method to stop R infection and clean up effects
- R sequence is now cancelled when player enters ENTER or LEAVE
- Clears R cells, removes matrix fall container, removes ASCII overlay

### 2. Initial Cell Value - "ENTE"
**Lines: 1876, 2026-2027**
- Changed initial entry cell value from empty `''` to `'ENTE'`
- Updated `clue.baseInput` and `clue.currentInput` to start with `'ENTE'`

### 3. LEAVE Sequence Fixed
**Lines: 2266, 1850-1853**
- Changed `riddleStage` from 'await-onion' to 'await-search' when LEAVE is entered
- Added timer to call `_beginOnionRiddle()` after LEAVE sequence completes
- This re-enables clue input and prompts for SEARCH
- Full clue trail now works: SEARCH → KEY (with key.mp4 video) → SNAKE → BURGER KING → RAMSES II → Clock puzzle

### 4. Log Message Updated
**Lines: 1434, 1912**
- Changed instruction message to:
  ```
  FIGURE OUT THE INCOMPLETE WORD IN CELL {cellAddr} - THEN PRESS THAT KEY. THE ENTER KEY. THE WORD IS ENTER.
  ```
- Message appears in ALL CAPS as requested
- Shows in both the quest overlay and the clue instruction

### 5. R Sequence Implementation
**Lines: 1033-1081**

#### Progressive R Filling
- Cells fill with letter "R" in sequence to form R shape:
  ```
  . R R R .
  . R . R .
  . R R . .
  . R . R .
  . R . . R
  ```
- Pattern fills progressively with 100ms delay between each cell
- Cells: B2, C2, D2, B3, D3, B4, C4, B5, D5, B6, E6

#### Color Transition
- Initially: White background (#ffffff), black text
- After all Rs placed: Green background (#00ff00), black text
- Transition happens 500ms after last R is placed

#### Trigger
- R sequence automatically starts 1 second after user enters "ENTER"
- Shows message: "CORRECT! INITIALIZING R SEQUENCE..."

### 6. Matrix Fall Effect
**Lines: 1083-1171**
- 30 streams of falling ASCII characters
- Characters include: A-Z, a-z, 0-9, special characters
- Green color (#00ff00)
- Each stream falls at different speeds (2-4 seconds)
- Random delays for staggered effect
- Runs around the entire screen (full viewport)
- Duration: 8 seconds with 1 second fade out

### 7. ASCII Art Overlay
**Lines: 1173-1217**
- Large "CELLI" text in ASCII art format
- Appears 2 seconds into matrix fall
- Green color with glow effect
- Centered on screen
- Fade in: 1 second
- Hold: 3 seconds  
- Fade out: 1 second
- Total duration: 5 seconds

## Sequence Flows

### ENTER Path (R Sequence)
1. **Initial State**: User sees "ENTE" in random cell with log message
2. **User Input**: Types "R" to complete to "ENTER" and presses Enter key
3. **Cancellation**: Any active R sequence is cancelled first
4. **Confirmation**: "CORRECT! INITIALIZING R SEQUENCE..." message
5. **R Pattern Fill**: 11 cells progressively fill with "R" (white background)
6. **Color Shift**: All R cells turn green
7. **Matrix Fall**: 30 streams of falling green characters appear
8. **ASCII Overlay**: "CELLI" ASCII art appears center screen
9. **Cleanup**: Effects fade out after 8-9 seconds
10. **Quest Sequence**: Proceeds to quest countdown

### LEAVE Path (Clue Trail)
1. **Initial State**: User sees "ENTE" in random cell
2. **User Input**: Replaces "ENTE" with "LEAVE" and presses Enter
3. **Cancellation**: Any active R sequence is cancelled first
4. **Trail Sequence**: NEXT → DOOR → OPENS appear in cells
5. **Onion Riddle**: After 1.5s, prompts for SEARCH
6. **SEARCH**: Prompts for KEY
7. **KEY**: Plays key.mp4 video, prompts for SNAKE
8. **SNAKE**: Prompts for BURGER KING
9. **BURGER KING**: Prompts for RAMSES II
10. **RAMSES II**: Glitch effect, prompts to adjust clock 35 minutes back
11. **Clock Puzzle**: Complete to unlock final message

## Testing

To test the sequence:
1. Launch index.html
2. Click "Scene Select"
3. Click "VISICELL → Spreadsheet Emergence"
4. Wait for spreadsheet to appear with "ENTE" in a cell
5. Select that cell and add "R" to make "ENTER"
6. Press Enter key
7. Watch the R sequence, matrix fall, and ASCII overlay

## Notes

- The R sequence is triggered ONLY when user types "ENTER" in the clue cell (not by 'R' key alone)
- R sequence is automatically cancelled if player enters ENTER or LEAVE again
- LEAVE sequence now properly prompts through the full riddle chain (SEARCH → KEY → SNAKE → etc.)
- Matrix fall uses CSS animations for performance
- All effects cleanup automatically
- Green terminal aesthetic (#00ff00) maintained throughout
- LEAVE path re-enables input after trail sequence via `_beginOnionRiddle()` at 1.5s delay

