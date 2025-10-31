/**
 * Dialogue System with Variable Trees
 * Handles context-aware dialogue based on player size and situation
 */

class DialogueSystem {
    constructor(interactionSystem) {
        this.interactionSystem = interactionSystem;
        this.currentDialogue = null;
        this.dialogueHistory = [];
        
        // Dialogue trees organized by context
        this.dialogueTrees = this.initializeDialogueTrees();
    }
    
    /**
     * Initialize all dialogue trees
     */
    initializeDialogueTrees() {
        return {
            // Ant-sized interactions
            ant_noticed: {
                aggressive: [
                    { speaker: "Pedestrian", text: "Ugh! A bug!", responses: [] },
                    { speaker: "Pedestrian", text: "Get away from me!", responses: [] },
                    { speaker: "Pedestrian", text: "Where did that thing go?", responses: [] }
                ],
                curious: [
                    { speaker: "Pedestrian", text: "What is that tiny thing?", responses: [] },
                    { speaker: "Pedestrian", text: "Is that... moving?", responses: [] }
                ],
                indifferent: [
                    { speaker: "Pedestrian", text: "*doesn't notice*", responses: [] }
                ]
            },
            
            // Toy-sized interactions
            toy_noticed: {
                aggressive: [
                    { 
                        speaker: "Pedestrian", 
                        text: "Hmm, someone left a doll here...",
                        responses: [
                            { text: "[Stay still]", next: "toy_picked_up_aggressive" },
                            { text: "[Try to run]", next: "toy_escape_attempt" },
                            { text: "[Wave arms]", next: "toy_wave" }
                        ]
                    }
                ],
                curious: [
                    {
                        speaker: "Pedestrian",
                        text: "Oh! What a detailed little figure! Wait... did it just move?",
                        responses: [
                            { text: "[Wave]", next: "toy_wave_curious" },
                            { text: "[Run away]", next: "toy_escape_attempt" },
                            { text: "[Stay frozen]", next: "toy_frozen" }
                        ]
                    }
                ],
                playful: [
                    {
                        speaker: "Pedestrian",
                        text: "A tiny person! Or the world's best toy? Either way, adorable!",
                        responses: [
                            { text: "[Try to communicate]", next: "toy_communicate_playful" },
                            { text: "[Run]", next: "toy_escape_attempt" },
                            { text: "[Act like a toy]", next: "toy_pretend" }
                        ]
                    }
                ],
                protective: [
                    {
                        speaker: "Pedestrian",
                        text: "Oh no, are you okay? You're so small!",
                        responses: [
                            { text: "[Ask for help]", next: "toy_ask_help" },
                            { text: "[Explain situation]", next: "toy_explain" },
                            { text: "[Thank them]", next: "toy_thank" }
                        ]
                    }
                ]
            },
            
            // Small person interactions  
            small_person_noticed: {
                curious: [
                    {
                        speaker: "Pedestrian",
                        text: "Excuse me, are you alright? You seem... unusually small.",
                        responses: [
                            { text: "I shrunk! Can you help?", next: "small_help_request" },
                            { text: "I'm fine, thanks.", next: "small_polite" },
                            { text: "It's complicated...", next: "small_complicated" }
                        ]
                    }
                ],
                protective: [
                    {
                        speaker: "Pedestrian",
                        text: "Oh my goodness! What happened to you?",
                        responses: [
                            { text: "Science experiment gone wrong", next: "small_science" },
                            { text: "Magic mishap", next: "small_magic" },
                            { text: "I don't want to talk about it", next: "small_avoid" }
                        ]
                    }
                ],
                indifferent: [
                    {
                        speaker: "Pedestrian",
                        text: "...",
                        responses: [
                            { text: "[Wave]", next: "small_ignored" }
                        ]
                    }
                ]
            },
            
            // Follow-up dialogues
            toy_picked_up_aggressive: [
                {
                    speaker: "Pedestrian",
                    text: "I'll just put this in the lost and found.",
                    responses: [
                        { text: "[Squirm]", next: "toy_squirm" },
                        { text: "[Stay still]", next: "toy_still_end" }
                    ]
                }
            ],
            
            toy_escape_attempt: [
                {
                    speaker: "Pedestrian",
                    text: "Wait, it IS moving! What the—?!",
                    responses: [
                        { text: "[Keep running]", next: "toy_escape_success" },
                        { text: "[Stop and explain]", next: "toy_explain_panic" }
                    ]
                }
            ],
            
            toy_wave: [
                {
                    speaker: "Pedestrian",
                    text: "Huh? Must be seeing things...",
                    responses: []
                }
            ],
            
            toy_wave_curious: [
                {
                    speaker: "Pedestrian",
                    text: "You ARE alive! This is incredible! Are you okay?",
                    responses: [
                        { text: "Yes, but I need help getting bigger", next: "toy_need_help" },
                        { text: "Please don't hurt me!", next: "toy_scared" },
                        { text: "Can you help me find something?", next: "toy_quest" }
                    ]
                }
            ],
            
            toy_communicate_playful: [
                {
                    speaker: "Pedestrian",
                    text: "A tiny person! Real actual tiny person! This is the best day ever!",
                    responses: [
                        { text: "Can you help me?", next: "playful_help" },
                        { text: "Please put me down!", next: "playful_put_down" },
                        { text: "Want to be friends?", next: "playful_friends" }
                    ]
                }
            ],
            
            toy_ask_help: [
                {
                    speaker: "Pedestrian",
                    text: "Of course! What do you need?",
                    responses: [
                        { text: "I need to find a lab", next: "help_lab" },
                        { text: "I'm looking for someone", next: "help_person" },
                        { text: "Just keep me safe", next: "help_safety" }
                    ]
                }
            ],
            
            small_help_request: [
                {
                    speaker: "Pedestrian",
                    text: "Shrunk?! That's... actually possible? How can I help?",
                    responses: [
                        { text: "Take me to the science district", next: "help_science_district" },
                        { text: "Do you have a phone I could use?", next: "help_phone" },
                        { text: "Just don't step on me", next: "help_careful" }
                    ]
                }
            ],
            
            // Food-related dialogues
            eating_with_passenger: {
                unaware: [
                    {
                        speaker: "Pedestrian",
                        text: "*takes a bite, completely unaware*",
                        responses: []
                    }
                ],
                notices_movement: [
                    {
                        speaker: "Pedestrian",
                        text: "Wait... did something just move on my food?",
                        responses: [
                            { text: "[Jump off quickly]", next: "food_jump_off" },
                            { text: "[Wave frantically]", next: "food_wave" },
                            { text: "[Hold on tight]", next: "food_hold_on" }
                        ]
                    }
                ],
                too_late: [
                    {
                        speaker: "System",
                        text: "*You've been consumed along with the food*",
                        responses: []
                    }
                ]
            },
            
            // Stomp warning dialogues
            stomp_incoming: [
                {
                    speaker: "System",
                    text: "You notice a shadow growing larger above you!",
                    responses: [
                        { text: "[Roll away]", next: "stomp_dodge" },
                        { text: "[Yell up]", next: "stomp_yell" },
                        { text: "[Freeze]", next: "stomp_freeze" }
                    ]
                }
            ],
            
            stomp_dodge: [
                {
                    speaker: "System",
                    text: "You narrowly avoid being crushed! The ground shakes from the impact.",
                    responses: []
                }
            ],
            
            stomp_yell: [
                {
                    speaker: "Pedestrian",
                    text: "Huh? Did I hear something?",
                    responses: [
                        { text: "[Keep yelling]", next: "stomp_yell_success" },
                        { text: "[Run while they're distracted]", next: "stomp_escape" }
                    ]
                }
            ],
            
            // Near-miss dialogues
            near_miss: [
                {
                    speaker: "System",
                    text: "A massive foot lands just inches away from you!",
                    responses: []
                },
                {
                    speaker: "System", 
                    text: "You feel the shockwave as their heel crashes down nearby!",
                    responses: []
                }
            ]
        };
    }
    
    /**
     * Start a dialogue based on event context
     */
    startDialogue(eventType, context) {
        const { pedestrian, player } = context;
        const personality = pedestrian.personality.type;
        const sizeCategory = this.interactionSystem.getSizeCategory(player.scale);
        
        // Find appropriate dialogue tree
        let dialogueKey = `${sizeCategory}_noticed`;
        let dialogueTree = this.dialogueTrees[dialogueKey];
        
        if (!dialogueTree) {
            dialogueTree = this.dialogueTrees[eventType];
        }
        
        if (!dialogueTree) {
            return null;
        }
        
        // Get dialogue variant based on personality
        let dialogueVariant = dialogueTree[personality];
        
        if (!dialogueVariant) {
            // Fallback to first available personality
            const keys = Object.keys(dialogueTree);
            if (keys.length > 0) {
                dialogueVariant = dialogueTree[keys[0]];
            }
        }
        
        if (!dialogueVariant || !Array.isArray(dialogueVariant)) {
            return null;
        }
        
        // Pick random dialogue from variant
        const dialogue = dialogueVariant[Math.floor(Math.random() * dialogueVariant.length)];
        
        this.currentDialogue = {
            dialogue,
            context,
            history: []
        };
        
        return dialogue;
    }
    
    /**
     * Progress to next dialogue node
     */
    progressDialogue(choiceIndex) {
        if (!this.currentDialogue) return null;
        
        const current = this.currentDialogue.dialogue;
        
        if (!current.responses || current.responses.length === 0) {
            // End of dialogue
            this.endDialogue();
            return null;
        }
        
        const choice = current.responses[choiceIndex];
        if (!choice) return null;
        
        // Save choice to history
        this.currentDialogue.history.push({
            text: current.text,
            choice: choice.text
        });
        
        // Get next dialogue node
        const nextKey = choice.next;
        if (!nextKey) {
            this.endDialogue();
            return null;
        }
        
        const nextDialogue = this.dialogueTrees[nextKey];
        if (!nextDialogue || !Array.isArray(nextDialogue)) {
            this.endDialogue();
            return null;
        }
        
        // Pick random from next set
        const next = nextDialogue[Math.floor(Math.random() * nextDialogue.length)];
        this.currentDialogue.dialogue = next;
        
        return next;
    }
    
    /**
     * Get contextual dialogue for event
     */
    getEventDialogue(eventType, context) {
        const dialogueTree = this.dialogueTrees[eventType];
        
        if (!dialogueTree) return null;
        
        if (Array.isArray(dialogueTree)) {
            return dialogueTree[Math.floor(Math.random() * dialogueTree.length)];
        }
        
        // Get appropriate variant
        const variants = Object.keys(dialogueTree);
        const variant = variants[Math.floor(Math.random() * variants.length)];
        const dialogues = dialogueTree[variant];
        
        if (!Array.isArray(dialogues)) return null;
        
        return dialogues[Math.floor(Math.random() * dialogues.length)];
    }
    
    /**
     * End current dialogue
     */
    endDialogue() {
        if (this.currentDialogue) {
            this.dialogueHistory.push(this.currentDialogue);
        }
        this.currentDialogue = null;
    }
    
    /**
     * Get current dialogue state
     */
    getCurrentDialogue() {
        return this.currentDialogue ? this.currentDialogue.dialogue : null;
    }
    
    /**
     * Check if dialogue is active
     */
    isActive() {
        return this.currentDialogue !== null;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DialogueSystem;
}

