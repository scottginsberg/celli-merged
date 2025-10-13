# Sequence Files

This directory contains narrative sequence definitions for the Celli Sequence Engine.

## What are Sequences?

Sequences are JSON files that define narrative flows, animations, and events. They're created in the visual Sequence Composer (`sequence.html`) and executed at runtime by the Sequence Engine.

## File Format

```json
{
  "name": "Sequence Name",
  "description": "What this sequence does",
  "nodes": [
    {
      "id": 1,
      "type": "dialogue | animation | delay | transition | event | parameter",
      "params": { /* node-specific parameters */ }
    }
  ],
  "connections": [
    {
      "fromNode": 1,
      "toNode": 2,
      "type": "flow | param"
    }
  ]
}
```

## Node Types

### Dialogue
Shows text in the quote system, with optional TTS.
```json
{
  "type": "dialogue",
  "params": {
    "speaker": "THE.OS",
    "text": "Hello, world.",
    "duration": 2.5
  }
}
```

### Animation
Animates object properties over time.
```json
{
  "type": "animation",
  "params": {
    "target": "object.property",
    "from": 0,
    "to": 1,
    "duration": 2.0,
    "easing": "easeInOut"
  }
}
```

### Delay
Pauses sequence execution.
```json
{
  "type": "delay",
  "params": {
    "duration": 1.5
  }
}
```

### Transition
Changes scenes.
```json
{
  "type": "transition",
  "params": {
    "toScene": "city",
    "effect": "fade"
  }
}
```

### Event
Triggers custom events.
```json
{
  "type": "event",
  "params": {
    "eventName": "custom_event",
    "eventData": { "key": "value" }
  }
}
```

### Parameter
Gets or sets configuration values.
```json
{
  "type": "parameter",
  "params": {
    "entity": "graphics",
    "path": "graphics.bloomStrength",
    "operation": "set",
    "value": 1.5
  }
}
```

## Usage

### Load a sequence
```javascript
import { sequenceEngine } from './systems/SequenceEngine.js';

// Load from URL
await sequenceEngine.loadSequence('grid_expansion', './data/sequences/coordinate_grid_expansion.json');
```

### Run a sequence
```javascript
await sequenceEngine.startSequence('grid_expansion', {
  /* initial state */
});
```

### Hook into sequence events
```javascript
sequenceEngine.on('onDialogue', ({ speaker, text }) => {
  console.log(`${speaker}: ${text}`);
});

sequenceEngine.on('onAnimation', ({ target, property, to }) => {
  console.log(`Animating ${target}.${property} to ${to}`);
});
```

## Creating Sequences

1. Open `sequence.html` in your browser
2. Drag nodes from the left sidebar
3. Connect nodes by dragging from outputs to inputs
4. Configure each node's parameters
5. Click "Export" to get the JSON
6. Save JSON file in this directory
7. Load and run in the game!

## Examples

- `coordinate_grid_expansion.json` - THE.OS coordinate grid intro
- (More sequences to come)

## Best Practices

1. **Keep sequences focused** - One sequence per narrative beat
2. **Use meaningful node IDs** - Makes debugging easier
3. **Add metadata** - Author, created date, tags
4. **Test in isolation** - Run sequences independently first
5. **Use delays wisely** - Give players time to read/react
6. **Chain sequences** - Use events to trigger follow-up sequences
7. **Parameterize** - Use parameter nodes for reusable sequences

## Integration with THE.OS

Sequences are perfect for driving THE.OS narrative moments:
- System initialization
- Error messages
- Tutorial prompts
- Story beats
- Visual feedback

## Integration with Execution Environment

Use sequences for:
- Task explanations
- Progress feedback
- State transitions
- Success/failure responses


