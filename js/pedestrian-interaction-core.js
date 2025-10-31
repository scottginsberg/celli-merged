/**
 * Pedestrian Interaction Core System
 * Modular system for scale-based pedestrian interactions
 */

class PedestrianInteractionSystem {
    constructor() {
        this.pedestrians = [];
        this.player = {
            x: 400,
            y: 300,
            scale: 1.0, // 1.0 = normal human size (180cm)
            velocity: { x: 0, y: 0 },
            height: 180 // cm
        };
        
        // Scale thresholds
        this.THRESHOLDS = {
            ANT_SIZE: 0.05,        // < 9cm - Will be stomped
            TINY_SIZE: 0.15,        // < 27cm - Mistaken for bug/pest
            TOY_SIZE: 0.4,          // < 72cm - Mistaken for toy/doll
            CHILD_SIZE: 0.7,        // < 126cm - Noticed as small person
            NORMAL_MIN: 0.8,        // 144cm+ - Normal interaction range
        };
        
        this.foodItems = [];
        this.eventCallbacks = [];
    }
    
    /**
     * Add pedestrian to the system
     */
    addPedestrian(pedestrian) {
        pedestrian.id = `ped_${Date.now()}_${Math.random()}`;
        pedestrian.state = pedestrian.state || 'idle';
        pedestrian.awareness = pedestrian.awareness || 0.5; // How observant (0-1)
        pedestrian.personality = pedestrian.personality || this.randomPersonality();
        pedestrian.target = null;
        pedestrian.animation = {
            current: 'idle',
            frame: 0,
            timer: 0
        };
        this.pedestrians.push(pedestrian);
        return pedestrian;
    }
    
    /**
     * Add food item to tracking system
     */
    addFood(food) {
        food.id = `food_${Date.now()}_${Math.random()}`;
        food.passengersOnFood = []; // Track tiny entities on/near food
        this.foodItems.push(food);
        return food;
    }
    
    /**
     * Generate random personality traits
     */
    randomPersonality() {
        const personalities = [
            { type: 'aggressive', stompThreshold: 0.08, curiosity: 0.7 },
            { type: 'curious', stompThreshold: 0.05, curiosity: 0.9 },
            { type: 'indifferent', stompThreshold: 0.03, curiosity: 0.3 },
            { type: 'protective', stompThreshold: 0.06, curiosity: 0.6 },
            { type: 'playful', stompThreshold: 0.04, curiosity: 0.8 }
        ];
        return personalities[Math.floor(Math.random() * personalities.length)];
    }
    
    /**
     * Update system - call this every frame
     */
    update(deltaTime) {
        // Update all pedestrians
        for (let ped of this.pedestrians) {
            this.updatePedestrian(ped, deltaTime);
        }
        
        // Check for food interactions
        this.checkFoodInteractions();
        
        // Check proximity interactions
        this.checkProximityInteractions();
    }
    
    /**
     * Update individual pedestrian logic
     */
    updatePedestrian(ped, deltaTime) {
        // Update animation timer
        ped.animation.timer += deltaTime;
        
        // Check if pedestrian notices player
        const dist = this.distance(ped, this.player);
        const noticeRange = 200 * (1 + ped.awareness);
        
        if (dist < noticeRange && !ped.hasNoticedPlayer) {
            this.pedestrianNoticesPlayer(ped);
        }
        
        // State machine
        switch (ped.state) {
            case 'idle':
                this.updateIdleState(ped, deltaTime);
                break;
            case 'investigating':
                this.updateInvestigatingState(ped, deltaTime);
                break;
            case 'stomp_windup':
                this.updateStompWindup(ped, deltaTime);
                break;
            case 'stomping':
                this.updateStomping(ped, deltaTime);
                break;
            case 'picking_up':
                this.updatePickingUp(ped, deltaTime);
                break;
            case 'eating':
                this.updateEating(ped, deltaTime);
                break;
            case 'walking':
                this.updateWalking(ped, deltaTime);
                break;
        }
    }
    
    /**
     * Pedestrian notices the player
     */
    pedestrianNoticesPlayer(ped) {
        ped.hasNoticedPlayer = true;
        
        const playerScale = this.player.scale;
        const dist = this.distance(ped, this.player);
        
        // Determine reaction based on player size
        if (playerScale < this.THRESHOLDS.ANT_SIZE) {
            // Too small - prepare to stomp
            if (Math.random() < ped.awareness && dist < 100) {
                this.triggerStompReaction(ped);
                this.emitEvent('stomp_initiated', { pedestrian: ped, player: this.player });
            }
        } else if (playerScale < this.THRESHOLDS.TINY_SIZE) {
            // Tiny bug/pest - might stomp or ignore
            if (Math.random() < ped.awareness * 0.7) {
                this.triggerStompReaction(ped);
                this.emitEvent('pest_noticed', { pedestrian: ped, player: this.player });
            }
        } else if (playerScale < this.THRESHOLDS.TOY_SIZE) {
            // Toy size - might pick up
            if (ped.personality.curiosity > 0.5 && dist < 80) {
                this.triggerToyReaction(ped);
                this.emitEvent('toy_noticed', { pedestrian: ped, player: this.player });
            }
        } else if (playerScale < this.THRESHOLDS.CHILD_SIZE) {
            // Small person - curious/concerned
            this.triggerCuriousReaction(ped);
            this.emitEvent('small_person_noticed', { pedestrian: ped, player: this.player });
        } else {
            // Normal interaction
            this.triggerNormalReaction(ped);
        }
    }
    
    /**
     * Trigger stomp reaction
     */
    triggerStompReaction(ped) {
        ped.state = 'stomp_windup';
        ped.animation.current = 'stomp_windup';
        ped.animation.timer = 0;
        ped.target = { x: this.player.x, y: this.player.y };
    }
    
    /**
     * Trigger toy pickup reaction
     */
    triggerToyReaction(ped) {
        ped.state = 'investigating';
        ped.animation.current = 'crouch';
        ped.target = { x: this.player.x, y: this.player.y };
    }
    
    /**
     * Trigger curious reaction
     */
    triggerCuriousReaction(ped) {
        ped.state = 'investigating';
        ped.animation.current = 'walk';
        ped.target = { x: this.player.x, y: this.player.y };
    }
    
    /**
     * Trigger normal reaction
     */
    triggerNormalReaction(ped) {
        // Normal social interaction
        if (Math.random() < ped.personality.curiosity * 0.3) {
            ped.state = 'investigating';
        }
    }
    
    /**
     * Check for food interactions
     */
    checkFoodInteractions() {
        for (let food of this.foodItems) {
            // Check if player is on food
            const distToFood = this.distance(this.player, food);
            if (distToFood < food.radius + 20 && this.player.scale < this.THRESHOLDS.TOY_SIZE) {
                if (!food.passengersOnFood.includes('player')) {
                    food.passengersOnFood.push('player');
                    this.emitEvent('player_on_food', { food, player: this.player });
                }
            } else {
                const index = food.passengersOnFood.indexOf('player');
                if (index > -1) {
                    food.passengersOnFood.splice(index, 1);
                }
            }
            
            // Check if pedestrian is eating this food
            for (let ped of this.pedestrians) {
                if (ped.state === 'eating' && ped.target === food) {
                    this.handleFoodConsumption(ped, food);
                }
            }
        }
    }
    
    /**
     * Handle food consumption with passenger tracking
     */
    handleFoodConsumption(ped, food) {
        if (food.passengersOnFood.length > 0) {
            // Someone is on the food!
            this.emitEvent('eating_with_passenger', { 
                pedestrian: ped, 
                food, 
                passengers: food.passengersOnFood 
            });
        }
        
        // Consume food
        food.bites = (food.bites || 0) + 1;
        if (food.bites > 5) {
            // Food consumed
            this.removeFood(food);
            ped.state = 'idle';
            this.emitEvent('food_consumed', { pedestrian: ped, food });
        }
    }
    
    /**
     * Check proximity-based interactions
     */
    checkProximityInteractions() {
        // Check if player is too close to pedestrian's foot
        for (let ped of this.pedestrians) {
            if (ped.state === 'walking' || ped.state === 'idle') {
                const distToFoot = this.distance(this.player, {
                    x: ped.x,
                    y: ped.y + 40 // foot position
                });
                
                if (distToFoot < 30 && this.player.scale < this.THRESHOLDS.TINY_SIZE) {
                    // Danger of being stepped on
                    if (Math.random() < 0.1) {
                        this.emitEvent('near_miss_step', { pedestrian: ped, player: this.player });
                    }
                }
            }
        }
    }
    
    /**
     * State update methods
     */
    updateIdleState(ped, deltaTime) {
        // Random wandering
        if (Math.random() < 0.01) {
            ped.state = 'walking';
            ped.target = {
                x: Math.random() * 800,
                y: Math.random() * 600
            };
        }
    }
    
    updateInvestigatingState(ped, deltaTime) {
        if (ped.target) {
            this.moveTowards(ped, ped.target, 50 * deltaTime);
            
            const dist = this.distance(ped, ped.target);
            if (dist < 50) {
                ped.state = 'picking_up';
                ped.animation.current = 'crouch';
            }
        }
    }
    
    updateStompWindup(ped, deltaTime) {
        if (ped.animation.timer > 0.5) {
            ped.state = 'stomping';
            ped.animation.current = 'stomp';
            ped.animation.timer = 0;
        }
    }
    
    updateStomping(ped, deltaTime) {
        if (ped.animation.timer > 0.3) {
            // Check if stomp hit player
            const dist = this.distance(ped, this.player);
            if (dist < 40) {
                this.emitEvent('player_stomped', { pedestrian: ped, player: this.player });
            }
            ped.state = 'idle';
        }
    }
    
    updatePickingUp(ped, deltaTime) {
        if (ped.animation.timer > 1.0) {
            this.emitEvent('player_picked_up', { pedestrian: ped, player: this.player });
            ped.state = 'idle';
        }
    }
    
    updateEating(ped, deltaTime) {
        if (ped.animation.timer > 2.0) {
            ped.state = 'idle';
        }
    }
    
    updateWalking(ped, deltaTime) {
        if (ped.target) {
            this.moveTowards(ped, ped.target, 100 * deltaTime);
            
            const dist = this.distance(ped, ped.target);
            if (dist < 10) {
                ped.state = 'idle';
                ped.target = null;
            }
        }
    }
    
    /**
     * Utility methods
     */
    distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    moveTowards(entity, target, speed) {
        const dx = target.x - entity.x;
        const dy = target.y - entity.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            entity.x += (dx / dist) * speed;
            entity.y += (dy / dist) * speed;
        }
    }
    
    removeFood(food) {
        const index = this.foodItems.indexOf(food);
        if (index > -1) {
            this.foodItems.splice(index, 1);
        }
    }
    
    /**
     * Event system
     */
    onEvent(callback) {
        this.eventCallbacks.push(callback);
    }
    
    emitEvent(type, data) {
        for (let callback of this.eventCallbacks) {
            callback(type, data);
        }
    }
    
    /**
     * Get interaction context for dialogue system
     */
    getInteractionContext(pedestrian) {
        const playerScale = this.player.scale;
        const dist = this.distance(pedestrian, this.player);
        
        return {
            playerScale,
            distance: dist,
            pedestrianState: pedestrian.state,
            personality: pedestrian.personality,
            sizeCategory: this.getSizeCategory(playerScale),
            hasNoticedPlayer: pedestrian.hasNoticedPlayer
        };
    }
    
    getSizeCategory(scale) {
        if (scale < this.THRESHOLDS.ANT_SIZE) return 'ant';
        if (scale < this.THRESHOLDS.TINY_SIZE) return 'tiny';
        if (scale < this.THRESHOLDS.TOY_SIZE) return 'toy';
        if (scale < this.THRESHOLDS.CHILD_SIZE) return 'small';
        if (scale < this.THRESHOLDS.NORMAL_MIN) return 'short';
        return 'normal';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PedestrianInteractionSystem;
}

