# Pedestrian Interaction System - Integration Guide

## Overview

This modular pedestrian interaction system provides size-based dynamic interactions between a player and NPCs. The system includes:

- **Size-based threat detection** (stomp animations for ant-sized entities)
- **Toy mistaken identity** (pedestrians picking up toy-sized players)
- **Robust dialogue trees** with branching conversations
- **Food interaction tracking** (eating with passengers)
- **Dynamic AI behaviors** with personality types

## Files Created

### Core System Files (in `/js/`)

1. **pedestrian-interaction-core.js** - Main interaction system
   - Manages pedestrians, player, and food items
   - Handles size thresholds and state machines
   - Event system for triggering interactions

2. **pedestrian-ai.js** - AI and animation system
   - Pedestrian behavior logic
   - Animation frame management
   - Awareness and decision-making

3. **dialogue-system.js** - Dialogue tree manager
   - Context-aware dialogue selection
   - Branching conversation trees
   - Personality-based responses

4. **food-interaction.js** - Food consumption tracking
   - Tracks entities on/near food
   - Handles consumption events
   - Danger level calculations

5. **main-preview.js** - Preview integration
   - Rendering system
   - Input handling
   - System coordination

### Preview File

- **pedestrian-interaction-preview.html** - Standalone demo

## Size Thresholds

```javascript
ANT_SIZE: 0.05      // < 9cm - Will be stomped
TINY_SIZE: 0.15     // < 27cm - Mistaken for bug/pest
TOY_SIZE: 0.4       // < 72cm - Mistaken for toy/doll
CHILD_SIZE: 0.7     // < 126cm - Noticed as small person
NORMAL_MIN: 0.8     // 144cm+ - Normal interaction range
```

## Integration into scale-ultra.html

### Step 1: Include Scripts

Add these script tags before the closing `</body>` tag:

```html
<script src="js/pedestrian-interaction-core.js"></script>
<script src="js/pedestrian-ai.js"></script>
<script src="js/dialogue-system.js"></script>
<script src="js/food-interaction.js"></script>
```

### Step 2: Initialize Systems

In your main initialization code:

```javascript
// Create systems
const pedestrianSystem = new PedestrianInteractionSystem();
const pedestrianAI = new PedestrianAI(pedestrianSystem);
const dialogueSystem = new DialogueSystem(pedestrianSystem);
const foodSystem = new FoodInteractionSystem(pedestrianSystem, dialogueSystem);

// Link player to system
pedestrianSystem.player = {
    x: yourPlayer.x,
    y: yourPlayer.y,
    scale: yourPlayer.scale,
    height: yourPlayer.height
};
```

### Step 3: Update Loop Integration

In your existing update/render loop:

```javascript
function update(deltaTime) {
    // ... your existing code ...
    
    // Update pedestrian systems
    pedestrianSystem.update(deltaTime);
    
    for (let ped of pedestrianSystem.pedestrians) {
        pedestrianAI.updateAI(ped, deltaTime);
    }
    
    // Check food interactions
    for (let food of pedestrianSystem.foodItems) {
        if (foodSystem.checkPlayerOnFood(food)) {
            foodSystem.trackPlayerBoardFood(food);
        }
    }
}
```

### Step 4: Event Handling

Subscribe to interaction events:

```javascript
pedestrianSystem.onEvent((type, data) => {
    switch(type) {
        case 'stomp_initiated':
            // Handle stomp warning
            console.log('Stomp incoming!');
            break;
            
        case 'toy_noticed':
            // Show dialogue
            const dialogue = dialogueSystem.startDialogue(type, data);
            displayDialogue(dialogue);
            break;
            
        case 'player_consumed':
            // Game over or respawn
            handleGameOver();
            break;
            
        case 'eating_with_passenger':
            // Player is on food being eaten
            showWarning('You\'re on the food!');
            break;
    }
});
```

### Step 5: Add Pedestrians

```javascript
// Spawn a pedestrian
const pedestrian = pedestrianSystem.addPedestrian({
    x: 500,
    y: 300,
    state: 'idle'
});

// Pedestrian properties are auto-generated:
// - id: unique identifier
// - personality: { type, stompThreshold, curiosity }
// - awareness: 0-1 (how observant)
// - animation: { current, frame, timer }
```

### Step 6: Add Food Items

```javascript
// Create food item
const food = foodSystem.createFoodItem('sandwich', x, y);

// Or manually:
const customFood = pedestrianSystem.addFood({
    type: 'custom',
    x: 100,
    y: 200,
    radius: 30,
    description: 'A custom food item'
});
```

## Personality Types

Pedestrians have 5 personality types that affect behavior:

1. **aggressive** - Quick to stomp, low curiosity
2. **curious** - Investigates thoroughly, high awareness
3. **indifferent** - Rarely notices, low engagement
4. **protective** - Helpful, cautious with small entities
5. **playful** - Friendly, enjoys interaction

## Dialogue Tree Structure

Dialogues are context-aware and branch based on:
- Player size category
- Pedestrian personality
- Current situation
- Player choices

Example dialogue flow:

```
Pedestrian notices toy-sized player
  └─> "What a detailed little figure!"
      ├─> [Wave] → Realizes you're alive
      ├─> [Run away] → Chases in confusion
      └─> [Stay frozen] → Picks you up
```

## API Reference

### PedestrianInteractionSystem

```javascript
// Add entities
addPedestrian(pedestrian)
addFood(food)

// Update
update(deltaTime)

// Query
getSizeCategory(scale)
getInteractionContext(pedestrian)

// Events
onEvent(callback)
emitEvent(type, data)
```

### PedestrianAI

```javascript
// Update AI
updateAI(pedestrian, deltaTime)

// Animation
getAnimationRenderData(pedestrian)

// Control
forceNotice(pedestrian)
```

### DialogueSystem

```javascript
// Start dialogue
startDialogue(eventType, context)

// Progress
progressDialogue(choiceIndex)

// Query
getCurrentDialogue()
isActive()
```

### FoodInteractionSystem

```javascript
// Check interactions
checkPlayerOnFood(food)
getDangerLevel(food)

// Track
trackPlayerBoardFood(food)
trackPlayerLeaveFood(food)

// Consumption
beginConsumption(pedestrian, food)
processBite(consumptionEvent)

// Create
createFoodItem(type, x, y)
```

## Event Types

The system emits these events:

- `stomp_initiated` - Pedestrian starting stomp
- `stomping` - Stomp in progress
- `player_stomped` - Player was stomped
- `toy_noticed` - Mistaken for toy
- `pest_noticed` - Seen as pest/bug
- `small_person_noticed` - Noticed as tiny person
- `player_picked_up` - Picked up by pedestrian
- `player_on_food` - Player climbed on food
- `eating_with_passenger` - Food eaten with player on it
- `player_consumed` - Player eaten with food
- `food_consumed` - Food completely eaten
- `near_miss_step` - Almost stepped on

## Customization

### Add Custom Dialogue

```javascript
dialogueSystem.dialogueTrees.custom_event = {
    curious: [
        {
            speaker: "Pedestrian",
            text: "Your custom dialogue",
            responses: [
                { text: "Choice 1", next: "next_node" },
                { text: "Choice 2", next: "other_node" }
            ]
        }
    ]
};
```

### Add Custom Personality

```javascript
const customPed = pedestrianSystem.addPedestrian({
    x: 300,
    y: 400,
    personality: {
        type: 'custom',
        stompThreshold: 0.07,
        curiosity: 0.85
    }
});
```

### Modify Thresholds

```javascript
pedestrianSystem.THRESHOLDS.ANT_SIZE = 0.03;  // More sensitive
pedestrianSystem.THRESHOLDS.TOY_SIZE = 0.5;   // Larger toy range
```

## Testing the Preview

1. Open `pedestrian-interaction-preview.html` in a browser
2. Use WASD to move
3. Use Q/E to change scale
4. Click "Ant Size" to test stomp behavior
5. Click "Toy Size" to test pickup behavior
6. Click pedestrians to force interactions
7. Watch the event log for system feedback

## Performance Considerations

- System is lightweight (minimal overhead per pedestrian)
- Suitable for 10-50 pedestrians simultaneously
- Food tracking scales well with multiple items
- Dialogue system has negligible impact

## Future Enhancements

Possible additions for integration:

- Voice synthesis for dialogue
- Particle effects for stomps/impacts
- More complex pathfinding
- Group behaviors (crowds)
- Memory system (pedestrians remember player)
- Dynamic relationship building
- Multi-language dialogue support

## Support & Modification

All code is modular and commented. Each system can be:
- Used independently
- Extended with new features
- Integrated into existing codebases
- Modified without breaking other systems

## License

Free to use and modify for your project.

