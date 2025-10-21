# Visicell Sequence Implementation

## Created File
- `src/data/sequences/visicell.json` - The visicell sequence definition

## Sequence Flow

### Phase 1: Word Puzzle (ENTE → ENTER)
1. **Cell Population**: Places "ENTE" in a random cell
2. **Log Message**: Displays beneath spreadsheet:
   ```
   FIGURE OUT THE INCOMPLETE WORD IN CELL {{targetCell}} - THEN PRESS THAT KEY. 
   THE ENTER KEY. THE WORD IS ENTER.
   ```
3. **Wait for Input**: Waits for user to press Enter key (30 second timeout)
4. **Confirmation**: Shows "CORRECT! INITIALIZING R SEQUENCE..."

### Phase 2: R Sequence
1. **Progressive R Fill**: Cells fill with letter "R" in sequence to form the shape of letter R:
   ```
   Pattern formation:
   . R R R .
   . R . R .
   . R R . .
   . R . R .
   . R . . R
   ```
2. **Color Transition**: All R-pattern cells animate from white (#ffffff) to green (#00ff00)

### Phase 3: Matrix Fall Effect
1. **ASCII Matrix Fall**: 30 streams of falling characters around the sheet
   - Characters: A-Z, a-z, 0-9, special characters
   - Speed: 2.0
   - Color: Green (#00ff00) fading to dark green (#003300)
   - Duration: 8 seconds
   
2. **ASCII Art Overlay**: "CELLI" text in ASCII art appears center screen:
   ```
     ██████  ███████ ██      ██      ██
    ██      ██      ██      ██      ██
    ██      █████   ██      ██      ██
    ██      ██      ██      ██      ██
     ██████ ███████ ███████ ███████ ██
   ```
   - Fade in: 1 second
   - Hold: 3 seconds
   - Fade out: 1 second

3. **Completion Event**: Fires `visicell_sequence_complete` event

## Integration Points Needed

### 1. Sequence Loading (in main app)
```javascript
// Load the visicell sequence
await sequenceEngine.loadSequence('visicell', './src/data/sequences/visicell.json');

// Start the sequence
sequenceEngine.startSequence('visicell');
```

### 2. Required Node Type Handlers

The following custom node types need implementation in your sequence engine:

#### `cell_populate`
```javascript
{
  type: 'cell_populate',
  params: {
    target: 'randomCell',  // or specific cell like 'C5'
    value: 'ENTE',
    storeAs: 'targetCell'  // variable to store cell reference
  }
}
```

#### `log_message`
```javascript
{
  type: 'log_message',
  params: {
    target: 'sheetLog',     // log element beneath spreadsheet
    text: 'MESSAGE TEXT',
    duration: 5.0
  }
}
```

#### `wait_for_key`
```javascript
{
  type: 'wait_for_key',
  params: {
    key: 'Enter',
    timeout: 30.0
  }
}
```

#### `cell_fill_sequence`
```javascript
{
  type: 'cell_fill_sequence',
  params: {
    pattern: 'progressive',
    value: 'R',
    cells: [{x: 2, y: 2}, {x: 3, y: 2}, ...],
    delay: 0.1,            // delay between each cell
    duration: 2.0          // total animation time
  }
}
```

#### `matrix_fall`
```javascript
{
  type: 'matrix_fall',
  params: {
    target: 'sheet.surroundings',
    characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789...',
    streams: 30,
    speed: 2.0,
    color: '#00ff00',
    fadeColor: '#003300',
    duration: 8.0
  }
}
```

#### `ascii_text_overlay`
```javascript
{
  type: 'ascii_text_overlay',
  params: {
    target: 'sheet.overlay',
    text: ['line 1', 'line 2', ...],
    position: 'center',
    fadeIn: 1.0,
    hold: 3.0,
    fadeOut: 1.0
  }
}
```

## HTML Elements Required

### Sheet Log Element
Add below the spreadsheet in your HTML:
```html
<div id="sheetLog" class="sheet-log">
  <!-- Log messages will appear here -->
</div>
```

### CSS for Log
```css
.sheet-log {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: #00ff00;
  padding: 15px 30px;
  border-radius: 8px;
  font-family: 'Roboto Mono', monospace;
  font-size: 14px;
  text-align: center;
  z-index: 10000;
  max-width: 80%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sheet-log.visible {
  opacity: 1;
}
```

### Matrix Fall Container
```html
<div id="matrixFallContainer" class="matrix-fall-container">
  <!-- Falling character streams will be created here -->
</div>
```

### ASCII Overlay
```html
<div id="asciiOverlay" class="ascii-overlay">
  <pre id="asciiText"></pre>
</div>
```

## Testing

To test the sequence:
1. Ensure all node type handlers are implemented
2. Load the visicell.json sequence
3. Start the sequence: `sequenceEngine.startSequence('visicell')`
4. Watch for console logs and event firing

## Next Steps

1. Implement the custom node type handlers in your sequence engine
2. Add the required HTML elements
3. Test each phase independently
4. Hook up event listener for `visicell_sequence_complete` event

