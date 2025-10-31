/**
 * Food Interaction System
 * Tracks player/entity interactions with food items
 * Handles consumption events and passenger tracking
 */

class FoodInteractionSystem {
    constructor(interactionSystem, dialogueSystem) {
        this.interactionSystem = interactionSystem;
        this.dialogueSystem = dialogueSystem;
        this.consumptionHistory = [];
    }
    
    /**
     * Check if player is on or near food
     */
    checkPlayerOnFood(food) {
        const player = this.interactionSystem.player;
        const dist = this.interactionSystem.distance(player, food);
        const threshold = food.radius + 20;
        
        return dist < threshold && player.scale < this.interactionSystem.THRESHOLDS.TOY_SIZE;
    }
    
    /**
     * Track player boarding food
     */
    trackPlayerBoardFood(food) {
        if (!food.passengersOnFood.includes('player')) {
            food.passengersOnFood.push('player');
            
            this.interactionSystem.emitEvent('player_on_food', {
                food,
                player: this.interactionSystem.player,
                timestamp: Date.now()
            });
            
            return true;
        }
        return false;
    }
    
    /**
     * Track player leaving food
     */
    trackPlayerLeaveFood(food) {
        const index = food.passengersOnFood.indexOf('player');
        if (index > -1) {
            food.passengersOnFood.splice(index, 1);
            
            this.interactionSystem.emitEvent('player_left_food', {
                food,
                player: this.interactionSystem.player
            });
            
            return true;
        }
        return false;
    }
    
    /**
     * Begin food consumption by pedestrian
     */
    beginConsumption(pedestrian, food) {
        const consumptionEvent = {
            pedestrian,
            food,
            startTime: Date.now(),
            bitesTaken: 0,
            passengersAtStart: [...food.passengersOnFood],
            completed: false,
            playerConsumed: false
        };
        
        // Check if player is on food
        if (food.passengersOnFood.includes('player')) {
            this.handleConsumptionWithPassenger(consumptionEvent);
        }
        
        this.consumptionHistory.push(consumptionEvent);
        return consumptionEvent;
    }
    
    /**
     * Handle consumption when passenger is present
     */
    handleConsumptionWithPassenger(consumptionEvent) {
        const { pedestrian, food } = consumptionEvent;
        
        // Show warning
        this.interactionSystem.emitEvent('consumption_warning', {
            pedestrian,
            food,
            passengers: food.passengersOnFood
        });
        
        // Check if pedestrian notices
        const noticeChance = pedestrian.awareness * 0.3;
        
        if (Math.random() < noticeChance) {
            // Pedestrian notices movement
            this.pedestrianNoticesPassenger(pedestrian, food);
        } else {
            // Pedestrian doesn't notice - danger!
            consumptionEvent.unaware = true;
        }
    }
    
    /**
     * Pedestrian notices something on food
     */
    pedestrianNoticesPassenger(pedestrian, food) {
        pedestrian.state = 'investigating';
        pedestrian.animation.current = 'looking_around';
        
        // Trigger dialogue
        const context = {
            pedestrian,
            food,
            player: this.interactionSystem.player
        };
        
        const dialogue = this.dialogueSystem.getEventDialogue('notices_movement', context);
        if (dialogue) {
            this.dialogueSystem.startDialogue('notices_movement', context);
        }
        
        this.interactionSystem.emitEvent('passenger_noticed', { pedestrian, food });
    }
    
    /**
     * Process a bite of food
     */
    processBite(consumptionEvent) {
        const { pedestrian, food } = consumptionEvent;
        
        consumptionEvent.bitesTaken++;
        
        // Check if passenger is still there
        if (food.passengersOnFood.includes('player')) {
            const escapeChance = 0.2; // 20% chance to escape each bite
            
            if (Math.random() < escapeChance) {
                // Player manages to avoid the bite
                this.interactionSystem.emitEvent('bite_avoided', {
                    pedestrian,
                    food,
                    biteNumber: consumptionEvent.bitesTaken
                });
            } else {
                // Danger increases with each bite
                if (consumptionEvent.bitesTaken >= 3) {
                    // Critical - player is consumed
                    this.playerConsumed(consumptionEvent);
                } else {
                    this.interactionSystem.emitEvent('bite_close_call', {
                        pedestrian,
                        food,
                        biteNumber: consumptionEvent.bitesTaken
                    });
                }
            }
        }
        
        // Check if food is finished
        if (consumptionEvent.bitesTaken >= 5) {
            this.completeConsumption(consumptionEvent);
        }
    }
    
    /**
     * Player gets consumed with food
     */
    playerConsumed(consumptionEvent) {
        consumptionEvent.playerConsumed = true;
        
        this.interactionSystem.emitEvent('player_consumed', {
            pedestrian: consumptionEvent.pedestrian,
            food: consumptionEvent.food,
            bitesTaken: consumptionEvent.bitesTaken
        });
        
        // Trigger game over or special state
        const context = {
            pedestrian: consumptionEvent.pedestrian,
            food: consumptionEvent.food,
            player: this.interactionSystem.player
        };
        
        const dialogue = this.dialogueSystem.getEventDialogue('too_late', context);
        if (dialogue) {
            this.dialogueSystem.startDialogue('eating_with_passenger', context);
        }
    }
    
    /**
     * Complete food consumption
     */
    completeConsumption(consumptionEvent) {
        consumptionEvent.completed = true;
        consumptionEvent.endTime = Date.now();
        
        const { pedestrian, food } = consumptionEvent;
        
        // Remove food
        this.interactionSystem.removeFood(food);
        
        // Reset pedestrian state
        pedestrian.state = 'idle';
        pedestrian.targetFood = null;
        
        this.interactionSystem.emitEvent('food_consumed', {
            pedestrian,
            food,
            duration: consumptionEvent.endTime - consumptionEvent.startTime,
            playerConsumed: consumptionEvent.playerConsumed
        });
    }
    
    /**
     * Get active consumptions
     */
    getActiveConsumptions() {
        return this.consumptionHistory.filter(c => !c.completed);
    }
    
    /**
     * Get consumption event for pedestrian
     */
    getConsumptionForPedestrian(pedestrian) {
        return this.consumptionHistory.find(
            c => c.pedestrian === pedestrian && !c.completed
        );
    }
    
    /**
     * Check danger level for player on food
     */
    getDangerLevel(food) {
        if (!food.passengersOnFood.includes('player')) {
            return 0;
        }
        
        // Check if any pedestrian is approaching or eating
        let maxDanger = 0;
        
        for (let ped of this.interactionSystem.pedestrians) {
            if (ped.targetFood === food) {
                const dist = this.interactionSystem.distance(ped, food);
                
                if (ped.state === 'eating') {
                    maxDanger = Math.max(maxDanger, 1.0); // Maximum danger
                } else if (ped.state === 'walking' && dist < 100) {
                    maxDanger = Math.max(maxDanger, 0.5 + (1 - dist / 100) * 0.5);
                }
            }
        }
        
        return maxDanger;
    }
    
    /**
     * Generate food item template
     */
    createFoodItem(type, x, y) {
        const foodTemplates = {
            sandwich: {
                type: 'sandwich',
                x, y,
                radius: 40,
                bites: 0,
                maxBites: 5,
                description: 'A large sandwich'
            },
            apple: {
                type: 'apple',
                x, y,
                radius: 30,
                bites: 0,
                maxBites: 6,
                description: 'A red apple'
            },
            cookie: {
                type: 'cookie',
                x, y,
                radius: 25,
                bites: 0,
                maxBites: 3,
                description: 'A chocolate chip cookie'
            },
            pizza_slice: {
                type: 'pizza_slice',
                x, y,
                radius: 45,
                bites: 0,
                maxBites: 4,
                description: 'A slice of pizza'
            },
            donut: {
                type: 'donut',
                x, y,
                radius: 28,
                bites: 0,
                maxBites: 4,
                description: 'A glazed donut'
            }
        };
        
        const template = foodTemplates[type] || foodTemplates.sandwich;
        return this.interactionSystem.addFood({ ...template });
    }
    
    /**
     * Get random food type
     */
    getRandomFoodType() {
        const types = ['sandwich', 'apple', 'cookie', 'pizza_slice', 'donut'];
        return types[Math.floor(Math.random() * types.length)];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FoodInteractionSystem;
}

