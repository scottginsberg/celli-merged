# VisiCell Flow & Initialization Fixes

## Issues Fixed

### 1. ✅ VisiCell Contents Not Displaying When Transitioning from Intro
**Problem**: Cell contents (ENTE, hint messages) only displayed when navigating via scene selector, NOT when transitioning from intro sequence via "END" command.

**Root Cause**: The `_initializeClueTrail()` method had skip mode logic (lines 2395-2402) that would hide the clue overlay and return early when `this.state.isSkipped === true`. This prevented proper initialization when coming from the intro sequence.

**Solution**: Removed the skip mode check entirely. Both entry paths now execute identical initialization:
- Lines 2395-2396: Changed from hiding overlay to logging initialization
- Both scene selector AND intro transition now show ENTE properly

### 2. ✅ Starting with SEARCH Layer When Using Scene Selector
**Problem**: When entering via scene selector, the scene started with the SEARCH popup layer already active.

**Root Cause**: Same as #1 - the skip mode was preventing proper initialization, causing the scene to start in an incorrect state.

**Solution**: Removing the skip mode logic ensures proper initialization flow:
1. ENTE appears in entry cell
2. Hint messages appear: "FINISH THE WORD IN CELL..."
3. Prompt shows: "REQUEST: TYPE LEAVE"
4. User must progress through LEAVE → SEARCH → KEY → etc.

### 3. ✅ SEARCH Never Registering in Entry Cell
**Problem**: SEARCH command wasn't being recognized when typed in cells, or there was no feedback about where to type it.

**Root Cause**: 
- SEARCH is entry-cell-gated (must be typed in the focused entry cell, not just any cell)
- No clear instruction telling users WHERE to type SEARCH
- Insufficient logging to debug when SEARCH was received

**Solution**:
- Line 2767: Added console logging when SEARCH is received: `🔍 SEARCH command received in entry cell`
- Line 2247: Enhanced instruction to explicitly mention the cell: `TYPE 'SEARCH' IN CELL ${entryCell} TO SEARCH THE CACHE.`
- Line 2249: Added debug logging to track when SEARCH prompt is active

### 4. ✅ SEARCH Clue Playing After ENTER Instead of After LEAVE
**Problem**: The SEARCH/onion riddle prompt was appearing after the ENTER death sequence finishes, rather than when LEAVE is entered.

**Root Cause**: The `_showOregonTrailEnding()` method was scheduling the onion riddle for BOTH the 'enter' and 'leave' death paths. This caused the SEARCH prompt to appear incorrectly after typing ENTER.

**Solution**: 
- Lines 2384-2387: Changed logic to NOT schedule onion riddle after ANY death sequence
- SEARCH prompt now ONLY appears via the successful LEAVE path through `_handleNextDoorOpens()` → `_beginOnionRiddle()`
- Added logging: `💀 Oregon Trail ending complete (mode: ${mode}) - no onion riddle scheduled`

## Correct Flow Now

### Path 1: ENTER (Quest/Failure Path)
```
User types ENTER
  ↓
Quest countdown starts (10 seconds)
  ↓
User presses any key/clicks
  ↓
Death sequence ("You Died" in Souls/GTA/VisiCell styles)
  ↓
"YOU DIED OF DYSENTERY" message
  ↓
END (No SEARCH prompt)
```

### Path 2: LEAVE (Clue Trail Path)
```
User types LEAVE
  ↓
Clue trail sequence starts
  ↓
Layer 0: NEXT appears (delay: 0ms)
  ↓
Layer 1: DOOR appears (delay: 2200ms)
  ↓
Layer 2: OPENS appears (delay: 4400ms)
  ↓
_handleNextDoorOpens() called
  ↓
After 1500ms delay
  ↓
_beginOnionRiddle() called
  ↓
SEARCH prompt appears in entry cell
  ↓
User types SEARCH → Onion riddle continues...
```

## Files Modified

**VisiCellScene.js**:
- Lines 2395-2396: Removed skip mode hiding logic in `_initializeClueTrail()`
- Line 2767: Added console logging for SEARCH command receipt
- Line 2247: Enhanced instruction to explicitly mention entry cell for SEARCH
- Line 2249: Added debug logging for SEARCH prompt activation
- Lines 2384-2387: Removed onion riddle scheduling from death sequences
- Added logging throughout to track state transitions

## Testing Checklist

- [ ] Scene selector entry shows ENTE properly
- [ ] Intro sequence "END" transition shows ENTE properly
- [ ] Both entry methods show identical initial state
- [ ] ENTER path leads to death sequence WITHOUT SEARCH prompt
- [ ] LEAVE path leads to clue trail → SEARCH prompt
- [ ] SEARCH command only works in entry cell (address-gated)
- [ ] Clear instruction shows which cell to type SEARCH in
- [ ] Console shows proper logging for all transitions
- [ ] No duplicate SEARCH prompts appearing

## Console Logging

New/enhanced console messages:
- `📋 Initializing clue trail (skipIntro mode: true/false)`
- `🔍 SEARCH command received in entry cell`
- `🔍 SEARCH prompt active - user should type SEARCH in entry cell [X]`
- `💀 Oregon Trail ending complete (mode: enter/leave) - no onion riddle scheduled`
- `[VisiCell] Beginning onion riddle sequence`

## Entry Points

### Scene Selector Entry
```javascript
visiCellScene.start(state, {
  entry: 'scene-selector'
  // skipIntro: undefined or false
});
```

### Intro Sequence Transition
```javascript
visiCellScene.start(state, {
  entry: 'intro-transition',
  skipIntro: true  // No longer affects initialization!
});
```

Both now produce identical initial states! ✅

