# Story Explorer - Loom Universe Node System

## File Structure

```
story-explorer/
├── index.html        - Main application (UI, visualization, functions)
├── nodes.js          - All node data (characters, locations, events, series, etc.)
├── connections.js    - Relationship data (dialogues, outcomes, desire evolution)
└── README.md         - This file
```

## Data Files

### nodes.js
Contains the complete `nodes` object with all entity definitions:
- Characters (mortal heroes, deities, primordials)
- Locations (hierarchical: Universe → Realm → Domain → Sector → Feature → Room → POI)
- Events (cosmology events, story events)
- Story Structure (hierarchical: Moment → Scene → Sequence → Act → Story → Arc → Season → Series)
- Artifacts
- Meta Concepts (cut content, learnings)

### connections.js
Contains relationship and evolution data:
- `dialogues` - Direct speech tied to moments and characters
- `delayedMessages` - Letters, notes with send/receive tracking
- `eventOutcomes` - Character journey trait modifiers from events
- `desireEvolution` - Tracking shifts in character motivations over time

## Features

### Universe Build Visualization
- 3D Three.js visualization of the entire Loom universe
- Wireframe border boxes for each series (color-coded)
- Domino fall animation (slabs start vertical, fall forward)
- Hierarchical scaling (series are huge, moments are tiny)
- Text labels on all nodes
- Interactive camera controls (orbit, pan, zoom)
- Fractal branching structure

### Node Explorer
- Browse all entities by type
- View relationships and connections
- Edit nodes with questionnaire mode
- Timeline visualization
- Character journey tracking
- Cosmology graph

### AI Integration
- Multi-provider API support (OpenAI, Anthropic, Google, Cohere, Mistral, Groq)
- Story generation and evaluation
- Organic moment standoffs
- Theme banking and resonance scoring

## Usage

Open `index.html` in a web browser. The application will automatically load data from `nodes.js` and `connections.js`.

## Adding New Nodes

Edit `nodes.js` to add new entities. Follow the existing structure:

```javascript
"node_id": {
  id: "node_id",
  type: "character|location|event|series|etc",
  folder: "characters|locations|events|etc",
  parentId: "parent_node_id", // if hierarchical
  name: "Display Name",
  description: "Short description",
  // ... type-specific properties
}
```

## Adding Connections

Edit `connections.js` to add new relationships, dialogues, or outcomes.



