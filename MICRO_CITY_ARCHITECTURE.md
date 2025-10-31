# MICRO CITY SYSTEM - COMPREHENSIVE ARCHITECTURE

## 🎯 CORE CONCEPT
Citizens start ant-sized in apartments and progressively build smaller civilizations across generations. Time accelerates at smaller scales. A magnifying glass tool allows investigation.

---

## 📐 SYSTEM ARCHITECTURE

### **Module Hierarchy**
```
MicroCityCore/
├── systems/
│   ├── MicroCitizenSystem.js       [Citizen lifecycle, AI, reproduction]
│   ├── GenerationalScaleSystem.js  [Size reduction across generations]
│   ├── ConstructionProgressionSystem.js [Building evolution logic]
│   ├── TimeDilationSystem.js       [Scale-based time acceleration]
│   ├── ResourceGatheringSystem.js  [Material collection for building]
│   └── PopulationManagementSystem.js [Birth/death/migration]
│
├── tools/
│   ├── MagnifyingGlassTool.js      [Investigation tool]
│   ├── CameraSystem.js             [Top-down/follow views]
│   └── MeasurementTool.js          [Show scale comparison]
│
├── rendering/
│   ├── MicroCitizenRenderer.js     [Efficient instanced rendering]
│   ├── MicroStructureRenderer.js   [LOD for buildings]
│   └── ScaleVisualizer.js          [Visual scale indicators]
│
├── core/
│   ├── MicroCityCore.js            [Main coordinator]
│   ├── ScaleConstants.js           [Size/time formulas]
│   └── EventBus.js                 [Inter-system communication]
│
└── tests/
    ├── test-micro-citizens.html
    ├── test-construction-progression.html
    ├── test-magnifying-glass.html
    └── test-full-integration.html
```

---

## 🧬 SYSTEM 1: MicroCitizenSystem.js

### **Purpose**
Manages individual citizen lifecycle, behavior, and attributes.

### **Core Data Structure**
```javascript
class MicroCitizen {
  id: string;
  generation: number;
  scale: number;              // Physical size multiplier
  age: number;                // In citizen-local time
  sleepCycles: number;        // Tracks days lived
  position: Vector3;
  velocity: Vector3;
  
  // Behavior State
  state: 'wandering' | 'gathering' | 'building' | 'sleeping' | 'socializing';
  currentTask: Task | null;
  inventory: ResourceInventory;
  
  // Genetics (for variation)
  genes: {
    buildSpeed: number;
    gatherEfficiency: number;
    lifespan: number;
  };
  
  // Relationships
  family: CitizenID[];
  community: CommunityID;
}
```

### **Key Methods**
- `update(deltaTime)` - Main AI loop
- `enterSleepCycle()` - Trigger day calculation, age citizen
- `reproduce()` - Create next-gen citizen (smaller!)
- `gatherResource(type)` - Collect materials
- `contribute ToConstruction(building)` - Add to communal projects

### **Behavior AI**
```
Priority System:
1. Sleep when tired (triggers day cycle)
2. Gather resources if low
3. Contribute to community building
4. Socialize / wander
```

---

## 📏 SYSTEM 2: GenerationalScaleSystem.js

### **Purpose**
Calculates size reduction and manages generational progression.

### **Scale Formula**
```javascript
// Each generation is X% smaller than parent
SCALE_REDUCTION_RATE = 0.75;  // 75% of parent size
MIN_SCALE = 0.0001;            // Smallest possible (1/10000th)

citizenScale(generation) {
  return Math.max(
    Math.pow(SCALE_REDUCTION_RATE, generation),
    MIN_SCALE
  );
}
```

### **Generation Tracking**
```javascript
class Generation {
  number: number;
  avgScale: number;
  population: number;
  structures: Structure[];
  startTime: number;
  culturalLevel: 'nomadic' | 'settled' | 'village' | 'town' | 'city';
}
```

### **Key Methods**
- `calculateScale(generation)` - Returns size multiplier
- `trackGeneration(gen)` - Record metrics
- `triggerGenerationAdvance()` - Create next gen when conditions met

### **Advancement Triggers**
```
Generation N → N+1 when:
- 50+ citizens reach elder age
- Cultural milestone reached (village built, etc.)
- Resource abundance threshold met
```

---

## 🏗️ SYSTEM 3: ConstructionProgressionSystem.js

### **Purpose**
Manages building evolution from tents → cities across generations.

### **Building Progression Tree**
```javascript
CONSTRUCTION_TIERS = {
  0: { type: 'tent',      scale: 1.0,    pop: 1,   time: 10 },
  1: { type: 'hut',       scale: 0.75,   pop: 3,   time: 50 },
  2: { type: 'house',     scale: 0.56,   pop: 8,   time: 150 },
  3: { type: 'village',   scale: 0.42,   pop: 25,  time: 500 },
  4: { type: 'town',      scale: 0.32,   pop: 100, time: 2000 },
  5: { type: 'city',      scale: 0.24,   pop: 500, time: 10000 },
  6: { type: 'megacity',  scale: 0.18,   pop: 2500, time: 50000 }
};
```

### **Building Data Structure**
```javascript
class MicroStructure {
  id: string;
  type: string;              // tent, hut, house, etc.
  tier: number;
  scale: number;
  position: Vector3;
  constructionProgress: number; // 0-1
  contributors: CitizenID[];
  
  // Functionality
  capacity: number;          // How many citizens it houses
  resourcesRequired: ResourceMap;
  resourcesContributed: ResourceMap;
  
  // Visual
  mesh: THREE.Group;
  lodLevel: number;
}
```

### **Key Methods**
- `planConstruction(type, position, generation)` - Start new building
- `contributeToBuilding(building, resources)` - Add progress
- `completeBuilding(building)` - Finalize structure
- `determineNextTier(currentPop, resources)` - Decide upgrade

### **Upgrade Logic**
```
Tent (Gen 0) → Hut (Gen 1):
  - 3+ citizens in community
  - Wood resource × 50
  - Stone resource × 20

Hut (Gen 1) → House (Gen 2):
  - 8+ citizens
  - Advanced materials
  - Multiple huts exist
```

---

## ⏰ SYSTEM 4: TimeDilationSystem.js

### **Purpose**
Accelerates time for smaller scales while maintaining performance.

### **Time Dilation Formula**
```javascript
// Smaller citizens experience time faster
TIME_ACCELERATION_BASE = 1.5;

getTimeDilation(scale) {
  // scale 1.0 → 1x speed
  // scale 0.5 → 2.25x speed
  // scale 0.1 → 15.85x speed
  return Math.pow(1 / scale, Math.log2(TIME_ACCELERATION_BASE));
}
```

### **Dual Time Tracking**
```javascript
class TimeContext {
  realWorldTime: number;      // Actual seconds
  citizenLocalTime: number;   // Accelerated time
  generation: number;
  scale: number;
  
  dayLength: number;          // How many real seconds = 1 day
  currentDay: number;
}
```

### **Key Methods**
- `update(realDelta)` - Convert real time to citizen time
- `triggerDayCycle()` - Fire sleep/wake events
- `getEffectiveTimeForScale(scale)` - Query current dilation

### **Day Cycle Events**
```
citizenLocalTime % dayLength === 0:
  → Trigger all citizens to sleep
  → Increment currentDay
  → Check generation advancement
  → Update resource regeneration
```

---

## 🔍 SYSTEM 5: MagnifyingGlassTool.js

### **Purpose**
Interactive tool to investigate micro cities.

### **Tool Behavior**
```javascript
class MagnifyingGlass {
  position: Vector2;          // Screen space
  worldPosition: Vector3;     // 3D intersection
  zoomLevel: number;          // 1-100x
  radius: number;             // Area of investigation
  
  // Rendering
  portalTexture: RenderTarget;
  topDownCamera: OrthographicCamera;
  
  // Investigation
  focusedGeneration: number;
  visibleCitizens: MicroCitizen[];
  visibleStructures: MicroStructure[];
}
```

### **Rendering Approach**
```
1. Render-to-Texture (Top-Down View):
   - Orthographic camera pointed down
   - Render only objects within magnifier radius
   - High detail (override LOD)

2. Screen Overlay:
   - Circular portal showing RTT
   - Magnification border effect
   - Info panel (population, generation, scale)

3. Interaction:
   - Click to "dive in" to that scale
   - Scroll wheel to adjust zoom
   - Right-click to follow specific citizen
```

### **Key Methods**
- `updatePosition(screenPos)` - Move tool
- `setZoom(level)` - Adjust magnification
- `renderTopDown()` - Generate portal view
- `selectCitizen(citizen)` - Focus on individual
- `getScaleAtPosition()` - Determine which generation visible

---

## 📊 SYSTEM 6: PopulationManagementSystem.js

### **Purpose**
Handle birth, death, migration across scales.

### **Population Dynamics**
```javascript
class PopulationManager {
  populations: Map<generation, CitizenPool>;
  birthRate: number;
  deathRate: number;
  migrationProbability: number;
  
  maxPopulationPerGen: number = 5000;  // Performance limit
}
```

### **Reproduction Rules**
```
Two citizens can reproduce when:
- Both are adult age (20% through lifespan)
- In same community
- Resources available
- Community size < capacity

New citizen:
- generation = parent.generation + 1
- scale = parent.scale × SCALE_REDUCTION_RATE
- inherits 50% of each parent's genes (variation)
```

### **Death Conditions**
```
- Natural: age > lifespan
- Starvation: no food resources for extended time
- Accidents: rare random events
```

---

## 🎨 RENDERING OPTIMIZATIONS

### **LOD Strategy**
```javascript
LOD_LEVELS = {
  FULL: { distance: 0,    scale: 1.0,   detail: 'high' },
  MED:  { distance: 100,  scale: 0.5,   detail: 'medium' },
  LOW:  { distance: 500,  scale: 0.25,  detail: 'low' },
  DOT:  { distance: 2000, scale: 0.1,   detail: 'billboard' }
};
```

### **Instanced Rendering**
- All citizens of same generation = InstancedMesh
- Buildings of same type = InstancedMesh
- Update only changed instances per frame

### **Culling**
- Frustum culling per generation
- Distance culling (don't render tiny cities 1000 units away)
- Occlusion culling (cities behind furniture)

---

## 🧪 TESTING STRATEGY

### **Test 1: test-micro-citizens.html**
```
Focus: Citizen behavior in isolation
- Spawn 10 citizens gen 0
- Verify sleep cycle triggers
- Check gathering behavior
- Confirm reproduction mechanics
- Measure performance (target: 1000 citizens @ 60fps)
```

### **Test 2: test-construction-progression.html**
```
Focus: Building evolution
- Spawn citizens with abundant resources
- Force-advance generations
- Verify tent → hut → village progression
- Check building placement algorithms
- Test construction contribution system
```

### **Test 3: test-magnifying-glass.html**
```
Focus: Investigation tool
- Create pre-built city at gen 5
- Test magnifier movement
- Verify render-to-texture quality
- Check zoom levels
- Test citizen selection
```

### **Test 4: test-full-integration.html**
```
Focus: All systems together
- Start with 5 gen-0 citizens
- Run for 10000 time units
- Verify multi-generation coexistence
- Check time dilation effects
- Test scale-dependent rendering
- Measure total performance
```

---

## 🔧 INTEGRATION PLAN

### **Phase 1: Core Systems (Week 1)**
1. ScaleConstants.js - Define all formulas
2. EventBus.js - Communication layer
3. MicroCitizenSystem.js - Basic AI
4. GenerationalScaleSystem.js - Size calculations

### **Phase 2: Construction & Time (Week 2)**
5. ConstructionProgressionSystem.js - Building logic
6. TimeDilationSystem.js - Time acceleration
7. ResourceGatheringSystem.js - Material system

### **Phase 3: Population & Rendering (Week 3)**
8. PopulationManagementSystem.js - Birth/death
9. MicroCitizenRenderer.js - Efficient rendering
10. MicroStructureRenderer.js - Building visuals

### **Phase 4: Tools & Polish (Week 4)**
11. MagnifyingGlassTool.js - Investigation
12. CameraSystem.js - View controls
13. ScaleVisualizer.js - Visual feedback

### **Phase 5: Testing & Integration (Week 5)**
14. All test HTML files
15. Integration into asset-evaluator.html
16. Performance optimization
17. Port to scale-ultra.html

---

## 📈 PERFORMANCE TARGETS

### **Minimum Viable Performance**
- 1000 active citizens @ 60fps
- 200 structures @ 60fps
- 5 simultaneous generations visible
- Magnifying glass render @ 30fps

### **Optimization Strategies**
1. **Spatial Partitioning**: Octree for citizens/structures
2. **Update Batching**: Only update visible generations each frame
3. **Worker Threads**: Offload AI calculations
4. **GPU Instancing**: All repeated geometry
5. **Temporal Coherence**: Skip updates for distant/tiny citizens

---

## 🎮 USER INTERACTION FLOW

### **Initial State**
```
1. Player in normal apartment scale
2. 5 ant-sized citizens spawn on floor
3. Citizens begin wandering, gathering crumbs
4. Time accelerated 10x for them
```

### **Early Game (Gen 0-2)**
```
1. Citizens build first tent
2. Reproduce → Gen 1 citizens (75% size)
3. Gen 1 builds huts
4. Player can use magnifying glass to investigate
5. Tents and huts coexist
```

### **Mid Game (Gen 3-5)**
```
1. Villages appear (30-40% original size)
2. Multiple generations active simultaneously
3. Player sees "cities within cities" effect
4. Can zoom into village to see individual citizens
5. Time dilation very noticeable (50x+ faster)
```

### **Late Game (Gen 6+)**
```
1. Megacities barely visible to naked eye
2. Magnifying glass essential for investigation
3. Hundreds of generations potentially active
4. Entire civilizations rise/fall in minutes of real time
5. Performance requires aggressive culling
```

---

## 🔮 FUTURE ENHANCEMENTS

### **Short Term**
- Citizen names and personalities
- Historical events log
- Technology tree (stone age → information age)
- Disasters (floods from spilled drinks)

### **Long Term**
- Inter-generational trade
- Wars between communities
- Space exploration (citizens launch micro-rockets)
- Player can "play god" (spawn resources, disasters)
- VR support for magnifying glass

---

## 📝 API DESIGN EXAMPLE

```javascript
// Initialize system
const microCity = new MicroCityCore({
  initialCitizens: 5,
  startScale: 0.01,  // Ant-sized
  sceneRef: threeJsScene,
  apartment: apartmentBounds
});

// Start simulation
microCity.start();

// Listen for events
microCity.on('generation-advance', (gen) => {
  console.log(`Generation ${gen.number} emerged!`);
});

microCity.on('structure-completed', (structure) => {
  console.log(`${structure.type} built at gen ${structure.tier}`);
});

// Use magnifying glass
const magnifier = new MagnifyingGlassTool({
  renderer: renderer,
  scene: scene,
  microCity: microCity
});

magnifier.setPosition(mousePos);
magnifier.setZoom(10);
magnifier.render();

// Query state
const gen5Citizens = microCity.getCitizensAtGeneration(5);
const totalPop = microCity.getTotalPopulation();
const oldestCity = microCity.getOldestStructure();
```

---

## ✅ DEFINITION OF DONE

### **System Complete When:**
- [ ] 1000+ citizens perform @ 60fps
- [ ] 7+ generations coexist
- [ ] Building progression fully automatic
- [ ] Magnifying glass smoothly investigates
- [ ] Time dilation correctly scaled
- [ ] Reproduction creates smaller citizens
- [ ] All test files pass
- [ ] Integrated into scale-ultra.html
- [ ] No memory leaks after 1 hour runtime
- [ ] Documented API with examples

---

## 🚀 GETTING STARTED

1. Read this entire document
2. Start with `ScaleConstants.js` - establish math
3. Build `MicroCitizenSystem.js` - core entity
4. Create `test-micro-citizens.html` - verify basics
5. Iterate through systems in dependency order
6. Test each module before moving forward
7. Integrate incrementally into asset-evaluator.html

---

**This architecture provides a complete blueprint for implementation. All systems are designed to be modular, testable, and performant.**



