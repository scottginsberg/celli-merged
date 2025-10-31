/**
 * Pedestrian AI and Animation System
 * Handles pedestrian behavior, pathfinding, and animations
 */

class PedestrianAI {
    constructor(interactionSystem) {
        this.interactionSystem = interactionSystem;
        this.animationFrames = this.initializeAnimations();
    }
    
    /**
     * Initialize animation frame data
     */
    initializeAnimations() {
        return {
            idle: {
                frames: 4,
                duration: 0.5
            },
            walk: {
                frames: 8,
                duration: 0.8
            },
            crouch: {
                frames: 6,
                duration: 0.4
            },
            stomp_windup: {
                frames: 4,
                duration: 0.5
            },
            stomp: {
                frames: 3,
                duration: 0.3
            },
            pickup: {
                frames: 10,
                duration: 1.0
            },
            eating: {
                frames: 15,
                duration: 2.0
            },
            looking_around: {
                frames: 8,
                duration: 1.0
            }
        };
    }
    
    /**
     * Update pedestrian AI decision making
     */
    updateAI(pedestrian, deltaTime) {
        // Update awareness based on surroundings
        this.updateAwareness(pedestrian);
        
        // Make decisions based on current state and awareness
        switch (pedestrian.state) {
            case 'idle':
                this.decideIdleAction(pedestrian);
                break;
            case 'walking':
                this.updateWalkingBehavior(pedestrian);
                break;
            case 'investigating':
                this.updateInvestigatingBehavior(pedestrian);
                break;
        }
        
        // Update animation
        this.updateAnimation(pedestrian, deltaTime);
    }
    
    /**
     * Update pedestrian awareness of surroundings
     */
    updateAwareness(pedestrian) {
        const player = this.interactionSystem.player;
        const dist = this.interactionSystem.distance(pedestrian, player);
        
        // Awareness increases when player is closer
        const awarenessRange = 300;
        if (dist < awarenessRange) {
            const awarenessIncrease = (1 - dist / awarenessRange) * 0.01;
            pedestrian.awareness = Math.min(1, pedestrian.awareness + awarenessIncrease);
        } else {
            // Awareness slowly decreases over time
            pedestrian.awareness = Math.max(0.3, pedestrian.awareness - 0.001);
        }
        
        // Personality affects base awareness
        if (pedestrian.personality.type === 'curious') {
            pedestrian.awareness = Math.max(0.6, pedestrian.awareness);
        } else if (pedestrian.personality.type === 'indifferent') {
            pedestrian.awareness = Math.min(0.5, pedestrian.awareness);
        }
    }
    
    /**
     * Decide what to do when idle
     */
    decideIdleAction(pedestrian) {
        const random = Math.random();
        
        // Check if there's something interesting nearby
        const player = this.interactionSystem.player;
        const dist = this.interactionSystem.distance(pedestrian, player);
        
        // If player is tiny and nearby, might notice
        if (player.scale < 0.3 && dist < 150 && random < pedestrian.awareness * 0.1) {
            pedestrian.state = 'investigating';
            pedestrian.target = { x: player.x, y: player.y };
            return;
        }
        
        // Check for nearby food
        for (let food of this.interactionSystem.foodItems) {
            const foodDist = this.interactionSystem.distance(pedestrian, food);
            if (foodDist < 100 && random < 0.05) {
                this.startEatingFood(pedestrian, food);
                return;
            }
        }
        
        // Random walking
        if (random < 0.02) {
            this.startRandomWalk(pedestrian);
        } else if (random < 0.03) {
            pedestrian.animation.current = 'looking_around';
        }
    }
    
    /**
     * Start eating food
     */
    startEatingFood(pedestrian, food) {
        pedestrian.state = 'walking';
        pedestrian.target = { x: food.x, y: food.y };
        pedestrian.targetAction = 'eat';
        pedestrian.targetFood = food;
    }
    
    /**
     * Start random walk
     */
    startRandomWalk(pedestrian) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 100 + Math.random() * 200;
        
        pedestrian.state = 'walking';
        pedestrian.target = {
            x: pedestrian.x + Math.cos(angle) * distance,
            y: pedestrian.y + Math.sin(angle) * distance
        };
        pedestrian.targetAction = null;
    }
    
    /**
     * Update walking behavior
     */
    updateWalkingBehavior(pedestrian) {
        if (!pedestrian.target) {
            pedestrian.state = 'idle';
            return;
        }
        
        const dist = this.interactionSystem.distance(pedestrian, pedestrian.target);
        
        // Reached destination
        if (dist < 20) {
            if (pedestrian.targetAction === 'eat' && pedestrian.targetFood) {
                pedestrian.state = 'eating';
                pedestrian.target = pedestrian.targetFood;
                pedestrian.animation.current = 'eating';
                pedestrian.animation.timer = 0;
            } else {
                pedestrian.state = 'idle';
                pedestrian.target = null;
            }
        }
    }
    
    /**
     * Update investigating behavior
     */
    updateInvestigatingBehavior(pedestrian) {
        const player = this.interactionSystem.player;
        const dist = this.interactionSystem.distance(pedestrian, player);
        
        // Update target to current player position
        pedestrian.target = { x: player.x, y: player.y };
        
        // Close enough to interact
        if (dist < 50) {
            const playerScale = player.scale;
            
            // Determine interaction based on size
            if (playerScale < this.interactionSystem.THRESHOLDS.ANT_SIZE) {
                if (Math.random() < 0.7) {
                    pedestrian.state = 'stomp_windup';
                    pedestrian.animation.current = 'stomp_windup';
                    pedestrian.animation.timer = 0;
                    
                    // Trigger 3D stomp animation if mesh exists
                    if (typeof playStompAnimation === 'function' && (pedestrian.mesh || pedestrian.group)) {
                        playStompAnimation(pedestrian.mesh || pedestrian.group);
                    }
                }
            } else if (playerScale < this.interactionSystem.THRESHOLDS.TOY_SIZE) {
                pedestrian.state = 'picking_up';
                pedestrian.animation.current = 'pickup';
                pedestrian.animation.timer = 0;
            } else {
                pedestrian.state = 'idle';
            }
        }
    }
    
    /**
     * Update animation state
     */
    updateAnimation(pedestrian, deltaTime) {
        const animData = this.animationFrames[pedestrian.animation.current];
        
        if (!animData) {
            pedestrian.animation.current = 'idle';
            return;
        }
        
        pedestrian.animation.timer += deltaTime;
        
        // Calculate current frame
        const progress = (pedestrian.animation.timer % animData.duration) / animData.duration;
        pedestrian.animation.frame = Math.floor(progress * animData.frames);
        
        // Loop or end animation
        if (pedestrian.animation.timer >= animData.duration) {
            if (this.isLoopingAnimation(pedestrian.animation.current)) {
                pedestrian.animation.timer = 0;
            } else {
                this.onAnimationComplete(pedestrian);
            }
        }
    }
    
    /**
     * Check if animation should loop
     */
    isLoopingAnimation(animName) {
        return ['idle', 'walk', 'eating', 'looking_around'].includes(animName);
    }
    
    /**
     * Handle animation completion
     */
    onAnimationComplete(pedestrian) {
        switch (pedestrian.animation.current) {
            case 'stomp':
                pedestrian.state = 'idle';
                pedestrian.animation.current = 'idle';
                pedestrian.animation.timer = 0;
                break;
            case 'stomp_windup':
                // Automatically transition to stomp
                pedestrian.animation.current = 'stomp';
                pedestrian.animation.timer = 0;
                break;
            case 'pickup':
                pedestrian.state = 'idle';
                pedestrian.animation.current = 'idle';
                pedestrian.animation.timer = 0;
                break;
            case 'crouch':
                pedestrian.animation.current = 'idle';
                pedestrian.animation.timer = 0;
                break;
            default:
                pedestrian.animation.current = 'idle';
                pedestrian.animation.timer = 0;
        }
    }
    
    /**
     * Get animation render data for current frame
     */
    getAnimationRenderData(pedestrian) {
        const animName = pedestrian.animation.current;
        const frame = pedestrian.animation.frame;
        
        // Return render-specific data (could include sprite offsets, rotations, etc.)
        return {
            animation: animName,
            frame: frame,
            offsetY: this.getAnimationOffsetY(animName, frame),
            scale: this.getAnimationScale(animName, frame),
            rotation: this.getAnimationRotation(animName, frame)
        };
    }
    
    /**
     * Get Y offset for animation frame (for crouch, stomp, etc.)
     */
    getAnimationOffsetY(animName, frame) {
        switch (animName) {
            case 'crouch':
                return 20 * (frame / 6);
            case 'stomp':
                if (frame === 2) return -10; // Impact frame
                return 0;
            case 'stomp_windup':
                return -5 * (frame / 4);
            case 'pickup':
                if (frame < 5) return 15 * (frame / 5);
                return 15;
            default:
                return 0;
        }
    }
    
    /**
     * Get scale for animation frame
     */
    getAnimationScale(animName, frame) {
        if (animName === 'stomp' && frame === 2) {
            return 1.1; // Slightly larger on impact
        }
        return 1.0;
    }
    
    /**
     * Get rotation for animation frame
     */
    getAnimationRotation(animName, frame) {
        if (animName === 'looking_around') {
            return Math.sin(frame / 8 * Math.PI * 2) * 0.3;
        }
        return 0;
    }
    
    /**
     * Force pedestrian to notice player
     */
    forceNotice(pedestrian) {
        pedestrian.hasNoticedPlayer = true;
        pedestrian.awareness = 1.0;
        this.interactionSystem.pedestrianNoticesPlayer(pedestrian);
    }
    
    /**
     * Get pedestrian's current attention target
     */
    getAttentionTarget(pedestrian) {
        if (pedestrian.state === 'investigating' || 
            pedestrian.state === 'stomp_windup' || 
            pedestrian.state === 'stomping') {
            return this.interactionSystem.player;
        }
        
        if (pedestrian.state === 'eating' && pedestrian.target) {
            return pedestrian.target;
        }
        
        return null;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PedestrianAI;
}

