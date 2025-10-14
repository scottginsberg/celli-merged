# Celli Refactor - Agent Documentation

## Project Overview

This is a comprehensive refactoring of the Celli application from a single 54,675-line monolithic HTML file (`merged2.html`) into a modular, maintainable architecture following modern web development best practices.

## Architecture

### Directory Structure

```
celli-refactor/
├── index.html                 # Main entry point
├── src/
│   ├── styles/                # Modular CSS
│   │   ├── main.css          # Main stylesheet (imports all)
│   │   ├── variables.css     # CSS variables & base styles
│   │   ├── animations.css    # Keyframe animations
│   │   ├── hud.css           # HUD components
│   │   ├── doorway.css       # Doorway portal
│   │   ├── skip-button.css   # Skip button & phases
│   │   ├── play-overlay.css  # Play screen
│   │   ├── scene-select.css  # Scene selection menu
│   │   ├── effects.css       # Visual effects (barrel, shatter)
│   │   └── debug.css         # Debug tools & toast
│   ├── scripts/              # JavaScript modules
│   │   ├── main.js           # Application entry point
│   │   ├── config.js         # Configuration
│   │   ├── core/             # Core Three.js systems
│   │   │   ├── scene.js      # Scene setup
│   │   │   ├── renderer.js   # Renderer configuration
│   │   │   └── animation.js  # Animation loop
│   │   ├── ui/               # UI components
│   │   │   ├── hud.js        # Heads-up display
│   │   │   ├── doorway.js    # Portal doorway
│   │   │   └── skip-button.js # Skip button
│   │   ├── effects/          # Visual effects (to be extracted)
│   │   └── utils/            # Utility functions
│   │       ├── webgl-check.js # WebGL capability check
│   │       └── debug.js      # Debug utilities
│   ├── templates/            # HTML partials
│   │   └── partials/
│   │       ├── hud.html
│   │       ├── doorway.html
│   │       ├── skip-button.html
│   │       ├── play-overlay.html
│   │       └── scene-select.html
│   ├── data/                 # Content & configuration
│   │   └── quotes.json       # Quote states & loomworks
│   └── assets/               # Media assets
│       ├── shaders/          # GLSL shader files
│       │   ├── blackhole.vert.glsl
│       │   └── blackhole.frag.glsl
│       └── textures/         # Texture files (if any)
├── docs/                     # Documentation
│   ├── inventory/            # Asset inventory
│   │   └── assets.json       # Complete asset catalog
│   ├── architecture/         # Architecture decisions
│   ├── templates/            # Template documentation
│   ├── testing/              # Test strategies
│   ├── performance/          # Performance budgets
│   ├── assets/               # Asset pipeline docs
│   ├── cleanup/              # Cleanup tracking
│   ├── governance/           # Governance policies
│   ├── qa/                   # QA checklists
│   └── baseline/             # Baseline captures
├── config/                   # Environment configs
└── tests/                    # Test suites
    ├── unit/                 # Unit tests
    └── e2e/                  # End-to-end tests
```

## Refactoring Progress

### ✅ Completed

1. **Phase 0 - Discovery & Baseline**
   - Asset inventory created (`docs/inventory/assets.json`)
   - Directory structure established
   
2. **Phase 3 - CSS Refactor**
   - All inline CSS extracted to modular files
   - Organized by component and concern
   - CSS variables centralized
   - Animations separated
   
3. **Phase 2 - HTML Templates** (Partial)
   - Base HTML template created (`index.html`)
   - Component partials extracted
   - Clean separation of markup
   
4. **Phase 4 - JavaScript Modularization** (Scaffolding)
   - Module structure established
   - Core modules created (scene, renderer, animation)
   - UI modules created (HUD, doorway, skip-button)
   - Utility modules created
   - Configuration module created

### 🚧 In Progress / TODO

**The original `merged2.html` contains over 54,000 lines of JavaScript that still need to be extracted.** The current refactored structure provides the scaffolding and architecture, but the bulk of the functionality needs to be systematically moved into the appropriate modules:

#### Core Systems (High Priority)
- [ ] Black hole shader system & uniforms
- [ ] Color triangle barycentric shader
- [ ] Voxel system (CELLI letter formation)
- [ ] Shape morphing (spheres → circles)
- [ ] Post-processing composer (bloom, afterimage, bokeh, film)
- [ ] Camera controls and transitions

#### UI Systems
- [ ] Quote state management & transitions
- [ ] Loomworks animation system
- [ ] Doorway open/close animations
- [ ] Prompt input handling & command system
- [ ] Skip button phase transitions
- [ ] Scene select functionality

#### Major Features
- [ ] VisiCalc terminal system (massive subsystem)
- [ ] Spreadsheet engine
- [ ] Formula parser
- [ ] END sequence logic
- [ ] HELL transformation
- [ ] R infection sequence
- [ ] Ozymandias puzzle
- [ ] House of Leaves sequence
- [ ] Scene composer
- [ ] Audio synthesis system

#### Effects & Polish
- [ ] Barrel distortion animations
- [ ] Screen shatter effects
- [ ] Derez particle system
- [ ] Matrix data fall
- [ ] Glitch effects

#### Additional Work
- [ ] Extract all shader code to `.glsl` files
- [ ] Externalize all content to JSON/YAML
- [ ] Create comprehensive test suite
- [ ] Implement build tooling (Vite/Parcel)
- [ ] Set up linting and formatting
- [ ] Create development documentation
- [ ] Performance optimization

## Original Source

The refactoring is based on `merged2.html` (54,675 lines) which contained:
- **458 lines** of inline CSS
- **54,075 lines** of inline JavaScript
- Multiple complex subsystems merged into one file
- VisiCalc terminal, spreadsheet engine, formula parser
- Multiple animation sequences and effects
- Scene management and state machines

## Technology Stack

- **Three.js** 0.160.0 - 3D rendering
- **ES6 Modules** - Native JavaScript modules
- **CSS3** - Modern CSS with variables
- **GLSL** - Shader programming
- **Import Maps** - CDN module resolution

## Development Guidelines

### Adding New Features

1. Identify the appropriate module or create new one
2. Follow the established directory structure
3. Use ES6 module syntax
4. Import dependencies explicitly
5. Export only necessary functions/classes
6. Add JSDoc comments for complex functions
7. Update this documentation

### Code Organization Principles

- **Separation of Concerns**: Each module handles one aspect
- **Single Responsibility**: Functions do one thing well
- **Explicit Dependencies**: No implicit global state
- **Configuration**: Centralize in `config.js`
- **Content**: Externalize to JSON/YAML in `src/data/`

### Module Import Convention

```javascript
// External dependencies first
import * as THREE from 'three';

// Internal modules
import { initScene } from './core/scene.js';
import config from './config.js';
```

## Key Systems

### Animation Loop
- Main loop in `src/scripts/core/animation.js`
- Manages time, delta, and render calls
- Coordinates all animated systems

### Scene Management
- Three.js scene setup in `src/scripts/core/scene.js`
- Camera configuration
- Lighting and geometry

### UI Components
- Modular UI in `src/scripts/ui/`
- Each component self-contained
- Event handling localized

### State Management
- Configuration in `config.js`
- Feature flags for different modes
- Timing parameters centralized

## Testing Strategy (To Be Implemented)

- **Unit Tests**: Individual module functionality
- **Integration Tests**: System interactions
- **E2E Tests**: User workflows (Playwright)
- **Visual Regression**: Screenshot comparisons

## Build & Deployment (To Be Implemented)

- **Development**: Local server with hot reload
- **Build**: Bundling and minification
- **Optimization**: Asset pipeline, code splitting
- **CI/CD**: Automated testing and deployment

## Migration Path

The recommended approach for completing the migration:

1. **Extract Systems Incrementally**: Move one subsystem at a time
2. **Maintain Functionality**: Test after each extraction
3. **Refactor as You Go**: Improve code quality during extraction
4. **Document Decisions**: Update this file with architectural choices
5. **Test Continuously**: Ensure nothing breaks

## Notes for Future Development

- The original code has complex interdependencies that need careful untangling
- Some state is shared globally and needs to be properly managed
- Audio system uses Web Audio API and needs modular wrapper
- VisiCalc system is large enough to be its own module tree
- Consider TypeScript for type safety in future iterations

## Contact & Collaboration

This refactoring follows the execution backlog defined in the project requirements. Each phase builds upon the previous, creating a maintainable, testable, and scalable codebase.

---

**Status**: Initial scaffolding complete. Systematic extraction of remaining 54k lines in progress.

**Version**: 6.0-refactored

**Last Updated**: {{ current_date }}


