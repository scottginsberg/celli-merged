
// ========== DIALOGUE SYSTEM ==========
// Dialogue entries are always tied to a moment and character
// Direct speech: immediate, in-scene
// Delayed send: messages, letters, notes with receipt moment
const dialogues = [
  {
    id: "dlg_penelope_wakeup_1",
    momentId: "moment_wakeup",
    speaker: "char_penelope",
    addressedTo: "self",
    dialogueType: "internal",
    content: "What... what is that light?",
    timestamp: "immediate",
    metadata: {
      emotion: "curious",
      volume: "whisper"
    }
  },
  {
    id: "dlg_penelope_wakeup_2",
    momentId: "moment_wakeup",
    speaker: "char_penelope",
    addressedTo: "self",
    dialogueType: "internal",
    content: "I should probably be scared. Why am I not scared?",
    timestamp: "immediate",
    metadata: {
      emotion: "puzzled"
    }
  },
  {
    id: "dlg_past_greeting",
    momentId: "moment_first_meeting",
    speaker: "deity_past",
    addressedTo: "char_penelope",
    dialogueType: "speech",
    content: "Well, look who finally showed up!",
    timestamp: "immediate",
    metadata: {
      emotion: "enthusiastic",
      volume: "excited"
    }
  },
  {
    id: "dlg_future_calming",
    momentId: "moment_first_meeting",
    speaker: "deity_future",
    addressedTo: "deity_past",
    dialogueType: "speech",
    content: "Past, don't overwhelm her. She's just arrived.",
    timestamp: "immediate",
    metadata: {
      emotion: "gentle",
      volume: "moderate"
    }
  },
  {
    id: "dlg_x_freedom",
    momentId: "moment_xandy_freed",
    speaker: "char_captain_x",
    addressedTo: "char_zeke",
    dialogueType: "speech",
    content: "Freedom! Kid, you have NO idea what you just—",
    timestamp: "immediate",
    metadata: {
      emotion: "elated",
      volume: "shout",
      interrupted: true
    }
  },
  {
    id: "dlg_y_realization",
    momentId: "moment_xandy_freed",
    speaker: "char_captain_y",
    addressedTo: "char_captain_x",
    dialogueType: "speech",
    content: "We're bound. The prison... it bound us to him.",
    timestamp: "immediate",
    metadata: {
      emotion: "resigned",
      volume: "flat"
    }
  },
  {
    id: "dlg_greyma_late",
    momentId: "moment_manor_threshold",
    speaker: "char_grey_ma",
    addressedTo: "char_mindy",
    dialogueType: "speech",
    content: "You're late. I've been holding this burden for you for forty-three years, child. Let's not waste any more time.",
    timestamp: "immediate",
    metadata: {
      emotion: "knowing",
      volume: "moderate"
    }
  },
  {
    id: "dlg_mindy_confusion",
    momentId: "moment_manor_threshold",
    speaker: "char_mindy",
    addressedTo: "char_grey_ma",
    dialogueType: "speech",
    content: "I... I don't understand.",
    timestamp: "immediate",
    metadata: {
      emotion: "confused",
      volume: "stammer"
    }
  },
  {
    id: "dlg_greyma_prophecy",
    momentId: "moment_manor_threshold",
    speaker: "char_grey_ma",
    addressedTo: "char_mindy",
    dialogueType: "speech",
    content: "You will. You're the last one. The prophecy ends with you—or begins, depending on your perspective.",
    timestamp: "immediate",
    metadata: {
      emotion: "sad_knowing",
      volume: "moderate"
    }
  }
];

// Delayed messages (letters, notes, etc) with separate send/receive moments
const delayedMessages = [
  {
    id: "msg_order_warning",
    sendMomentId: "moment_wakeup", // example - would be a different moment
    receiveMomentId: null, // to be created
    speaker: "char_carter_blanche",
    addressedTo: ["faction_the_order"],
    actualRecipient: "char_mindy", // intercepted by Mindy
    messageType: "letter",
    content: "The psychic is awakening faster than anticipated. Recommend immediate observation protocol. Her familiar manifestation could destabilize the Flipside if not properly guided. Advise containment measures be prepared. - CB",
    intercepted: true,
    interceptedBy: "char_mindy",
    metadata: {
      sealed: false,
      condition: "opened by interceptor",
      interceptedHow: "Psychic detection in Flipside"
    }
  }
];

// ========== EVENT OUTCOMES SYSTEM ==========
// Define how events affect character journey traits
// Each outcome tracks: character affected, trait changes (growth/setback), alignment shifts
const eventOutcomes = [
  {
    eventId: "event_timepiece_discovery",
    momentId: "moment_wakeup",
    characterId: "char_penelope",
    traitModifiers: {
      confidence: { change: +1, reason: "Successfully faced the unknown" },
      intuition: { change: +1, reason: "Listened to curiosity over fear" },
      mastery: { change: +1, reason: "First step toward controlling the Timepiece" }
    },
    alignmentModifiers: {
      lawful_chaotic: { change: +1, reason: "Chose spontaneity over routine" }
    },
    outcomeType: "growth", // "growth", "setback", "neutral", "mixed"
    narrativeImpact: "Penelope's first contact with the Timescape set her on the path of the Hero of Time."
  },
  {
    eventId: "event_timepiece_discovery",
    momentId: "moment_first_meeting",
    characterId: "char_penelope",
    traitModifiers: {
      wisdom: { change: +1, reason: "Gained knowledge of Time as a place" },
      confidence: { change: +1, reason: "Accepted by Past and Future" },
      maturity: { change: +1, reason: "Realized greater forces at work" }
    },
    alignmentModifiers: {},
    outcomeType: "growth",
    narrativeImpact: "Meeting Past and Future expanded Penelope's understanding of reality."
  },
  {
    eventId: "event_manors_arrival",
    momentId: "moment_manor_threshold",
    characterId: "char_mindy",
    traitModifiers: {
      scorn: { change: -1, reason: "Found acceptance after rejection" },
      confidence: { change: -1, reason: "Overwhelmed by prophecy revelation" },
      wisdom: { change: +1, reason: "Learned of her true heritage" },
      intuition: { change: +1, reason: "Felt the psychic energy of the Manors" }
    },
    alignmentModifiers: {},
    outcomeType: "mixed",
    narrativeImpact: "Mindy found sanctuary but learned the weight of her destiny."
  },
  {
    eventId: "event_origin_activation",
    momentId: "moment_xandy_freed",
    characterId: "char_ziya",
    traitModifiers: {
      mastery: { change: +1, reason: "Gained the Origin Point artifact" },
      confidence: { change: -1, reason: "Bound to powerful entities beyond her control" },
      maturity: { change: -1, reason: "Impulsive action had major consequences" }
    },
    alignmentModifiers: {
      lawful_chaotic: { change: +2, reason: "Broke cosmic prison through reckless curiosity" }
    },
    outcomeType: "mixed",
    narrativeImpact: "Ziya gained power but lost freedom, bound as ward to X and Y."
  }
];

// ========== EVOLUTION OF DESIRES ==========
// Track critical shifts in what a character wants over time
// Just like motivations change, this shows the progression of desires
const desireEvolution = [
  {
    characterId: "char_ziya",
    desireId: "desire_ziya_freedom",
    momentId: null, // Initial state
    timestamp: "Before Origin Point",
    desire: "Live freely without constraints",
    priority: "high",
    status: "active",
    category: "freedom"
  },
  {
    characterId: "char_ziya",
    desireId: "desire_ziya_bound",
    momentId: "moment_xandy_freed",
    timestamp: "Freeing X and Y",
    desire: "Help X and Y restore powers to earn freedom",
    priority: "critical",
    status: "active",
    category: "obligation",
    replacedDesire: "desire_ziya_freedom",
    reason: "Bound as ward to X and Y after freeing them"
  },
  {
    characterId: "char_ziya",
    desireId: "desire_ziya_penelope_crush",
    momentId: null, // Ongoing
    timestamp: "Throughout Personal Space",
    desire: "Work up courage to talk to Penelope",
    priority: "medium",
    status: "unfulfilled",
    category: "romance",
    conflictsWith: ["desire_ziya_bound"],
    reason: "Has a crush on Penelope but is too shy to act on it, and bound obligations leave little time"
  },
  {
    characterId: "char_captain_x",
    desireId: "desire_x_conquest",
    momentId: null,
    timestamp: "Pre-imprisonment",
    desire: "Expand across the universe, conquer and explore",
    priority: "critical",
    status: "abandoned",
    category: "power",
    reason: "The Outlaws of Physics went on a universe expansion bender"
  },
  {
    characterId: "char_captain_x",
    desireId: "desire_x_freedom",
    momentId: null,
    timestamp: "During imprisonment",
    desire: "Escape the Origin Point prison",
    priority: "critical",
    status: "fulfilled",
    category: "freedom",
    replacedDesire: "desire_x_conquest",
    reason: "Imprisoned by The Matternal for cosmic carnage"
  },
  {
    characterId: "char_captain_x",
    desireId: "desire_x_redemption",
    momentId: "moment_xandy_freed",
    timestamp: "After release",
    desire: "Restore powers and make amends for past damage",
    priority: "high",
    status: "active",
    category: "redemption",
    replacedDesire: "desire_x_freedom",
    reason: "Freed but bound to Ziya, must face consequences"
  },
  {
    characterId: "char_captain_y",
    desireId: "desire_y_conquest",
    momentId: null,
    timestamp: "Pre-imprisonment",
    desire: "Partner with X in universe expansion",
    priority: "critical",
    status: "abandoned",
    category: "power",
    reason: "The Outlaws of Physics went on a conquest together"
  },
  {
    characterId: "char_captain_y",
    desireId: "desire_y_atonement",
    momentId: "moment_xandy_freed",
    timestamp: "After release",
    desire: "Methodically undo damage and guide Ziya",
    priority: "critical",
    status: "active",
    category: "redemption",
    replacedDesire: "desire_y_conquest",
    reason: "More remorseful than X, seeks to make things right"
  },
  {
    characterId: "char_penelope",
    desireId: "desire_penelope_understand",
    momentId: "moment_wakeup",
    timestamp: "Beginning",
    desire: "Understand the forces that shape reality",
    priority: "high",
    status: "active",
    category: "knowledge"
  },
  {
    characterId: "char_penelope",
    desireId: "desire_penelope_individuality",
    momentId: null,
    timestamp: "Season 1",
    desire: "Embrace individuality over conformity",
    priority: "critical",
    status: "fulfilled",
    category: "identity",
    reason: "Faces The Zeitgeist and chooses authentic self"
  },
  {
    characterId: "char_penelope",
    desireId: "desire_penelope_reality",
    momentId: null,
    timestamp: "Quality Control",
    desire: "Break through narrative boundaries and become Reality",
    priority: "critical",
    status: "fulfilled",
    category: "transcendence",
    reason: "Discovers her truest nature as bridge between fiction and reality"
  }
];
