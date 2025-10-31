# MADNESS.LOOM Redirect Fix

## Problem
Typing `MADNESS.LOOM` in VisiCell was only playing the `reboot.mp3` audio file, but NOT redirecting to the theos-sequence lattice HTML page as intended.

## Root Cause
The `_launchMadnessSequenceFlow()` method was calling `_startCoordinateGridSequence()`, which attempted to use the sequence engine to run an in-app animation sequence. This is not what was needed - the requirement is to **navigate to a separate HTML page** entirely.

## Solution Implemented

### Changed Method: `_launchMadnessSequenceFlow()` (Lines 841-883)

**Old Behavior:**
```javascript
async _launchMadnessSequenceFlow() {
  // Dispatch event
  await this._startCoordinateGridSequence(); // ❌ Tried to run sequence in-app
  // Dispatch completion event
}
```

**New Behavior:**
```javascript
async _launchMadnessSequenceFlow() {
  // Dispatch madness-loom-init event
  
  // Small delay to let audio/visuals play
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Redirect to theos-sequence HTML page
  const sequenceUrl = './sequence.html'; // ✅ Navigate to external page
  window.location.href = sequenceUrl;
}
```

## Flow Now

```
User types MADNESS.LOOM
  ↓
Trigger detected in _processClueCommand() or _setCellValue()
  ↓
_triggerMadnessSequence() called
  ↓
Visual feedback: "MADNESS.LOOM LOCATED. INITIALIZING THEOS-SEQUENCE LATTICE."
  ↓
Audio plays: reboot.mp3
  ↓
_launchMadnessSequenceFlow() called
  ↓
Dispatch event: celli:madness-loom-init
  ↓
Wait 2 seconds (let audio/visuals complete)
  ↓
window.location.href = './sequence.html'
  ↓
Browser navigates to theos-sequence page ✅
```

## Configuration Required

**⚠️ IMPORTANT**: You need to update the path to match your actual theos-sequence HTML file.

**Location to Update**: Line 875 in `VisiCellScene.js`

```javascript
const sequenceUrl = possiblePaths[0]; // Change array index to match your file
```

**Possible Paths Provided** (Lines 864-871):
```javascript
const possiblePaths = [
  './sequence.html',              // Index 0 (default)
  './theos-sequence.html',        // Index 1
  './lattice.html',               // Index 2
  './coordinate-grid.html',       // Index 3
  './../sequence.html',           // Index 4
  './index.html?scene=theos-sequence' // Index 5 (query param approach)
];
```

### How to Configure:

1. **If your file is named `sequence.html` in the root**: No change needed (default)
2. **If your file is named `theos-sequence.html`**: Change line 875 to:
   ```javascript
   const sequenceUrl = possiblePaths[1];
   ```
3. **If your file is named `lattice.html`**: Change line 875 to:
   ```javascript
   const sequenceUrl = possiblePaths[2];
   ```
4. **If you use a different filename**: Add it to the array and use that index
5. **If you use a query parameter approach**: Use index 5

## Console Logging

When MADNESS.LOOM is triggered, you'll now see:

```
🌀 MADNESS.LOOM command detected - triggering sequence
🌀 MADNESS.LOOM sequence triggered
🔇 Paused end.mp3 for MADNESS.LOOM
🎵 Playing reboot.mp3 for MADNESS.LOOM
🌀 Redirecting to theos-sequence lattice...
🌀 Navigating to: ./sequence.html
🌀 If this is wrong, update the path in _launchMadnessSequenceFlow()
🌀 Possible alternatives: ./theos-sequence.html, ./lattice.html, ...
```

This logging will help you verify:
1. The trigger is detected
2. Audio is playing
3. Redirect is attempted
4. What path it's trying to navigate to

## Testing

1. **Navigate to VisiCell scene** (via scene selector or intro transition)
2. **Type `MADNESS.LOOM`** in the entry cell (or any cell)
3. **Verify console output** shows all the logging above
4. **Verify audio plays** (reboot.mp3)
5. **Verify page redirects** after 2 seconds
6. **If redirect fails**: Check console for the attempted path and update line 875

## Troubleshooting

### If redirect doesn't work:

1. **Check console** for the path being attempted
2. **Verify the HTML file exists** at that path
3. **Check browser console** for any navigation errors (404, etc.)
4. **Try different paths** from the possiblePaths array
5. **Add your custom path** if none of the defaults work:
   ```javascript
   const possiblePaths = [
     './your-custom-path/sequence.html', // Add your path
     './sequence.html',
     // ... rest of paths
   ];
   const sequenceUrl = possiblePaths[0]; // Use index 0
   ```

### If audio doesn't play:

- Check that `reboot.mp3` exists in the root directory
- Check browser console for audio loading errors
- Verify audioSystem is imported and working

## Files Modified

**VisiCellScene.js**:
- **Lines 841-883**: Complete rewrite of `_launchMadnessSequenceFlow()`
  - Removed `_startCoordinateGridSequence()` call
  - Added 2-second delay for audio/visuals
  - Added redirect to external HTML page
  - Added comprehensive logging
  - Added multiple path options

## Technical Notes

- The 2-second delay ensures audio and visual effects complete before navigation
- The `celli:madness-loom-init` event is still dispatched (in case other systems listen)
- The old `_startCoordinateGridSequence()` method remains but is unused (can be removed if needed)
- Window navigation is only attempted if `window` object exists (safety check)

