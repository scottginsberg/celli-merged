const nodes = {
  // ========== CHARACTERS - MORTAL HEROES ==========
  
  "char_penelope": {
    id: "char_penelope",
    type: "character",
    folder: "characters",
    name: "Penelope",
    personalityType: "ENFP", // Campaigner - Energetic, curious, creative, seeks to understand herself and the world
    description: "An energetic young teen who discovers she's a hero of Time, traveling to time rather than through it.",
    bio: "Penelope discovers The Timepiece and becomes entangled in adventures across the Timescape alongside Past and Future. Her journey leads her to question the boundaries of her narrative construct and ultimately discover her truest nature as a bridge between fiction and reality.",
    drives: [
      "Understand the forces that shape reality",
      "Embrace individuality over conformity",
      "Question and push beyond narrative boundaries",
      "Bridge the gap between fiction and reality"
    ],
    traits: ["energetic", "curious", "individualistic", "determined", "empathetic"],
    tags: ["protagonist", "time-hero", "reality-breaker", "wielder-of-timepiece"],
    characterCategory: "primary",
    thematicArc: {
      archetype: "Ascension",
      description: "Penelope's journey is one of continuous ascension - from mortal girl to Hero of Time, to Reality itself, to Angel (an actress), and ultimately captaining the N3-D4L in Sun.Settings where she forges fiction itself.",
      keyTransformations: [
        { stage: "Mortal Girl", work: "Now Presenting S1" },
        { stage: "Hero of Time", work: "Now Presenting S2" },
        { stage: "Part-Time (merged with Current)", work: "Now Presenting S2" },
        { stage: "Reality", work: "Quality Control / Reality Shows" },
        { stage: "Angel (Actress)", work: "Odds & Ends / Sun.Settings" },
        { stage: "Captain of N3-D4L", work: "Sun.Settings" },
        { stage: "Forger of Fiction", work: "Sun.Settings" }
      ],
      metaTheme: "The ascension from audience to creator, from consumed to consumer, from fiction to forge"
    },
    metadata: {
      age: "13-16 (varies across series)",
      role: "Hero of Time, later becomes Reality",
      affiliation: "Timescape, ally of Father Time",
      status: "active",
      categoryEvolution: [
        { category: "primary", work: "Now Presenting" },
        { category: "primary", work: "Quality Control" },
        { category: "primary", work: "Odds & Ends" },
        { category: "primary", work: "Sun.Settings" }
      ]
    }
  },

  "char_ziya": {
    id: "char_ziya",
    type: "character",
    folder: "characters",
    name: "Ziya",
    personalityType: "ISFP", // Adventurer - Creative, spontaneous, warm, values freedom
    description: "A Latina teen who frees X and Y from the Origin Point, becoming bound as their ward.",
    bio: "Ziya stumbled upon the Origin Point at exactly the right place and time—as the universe rotated slightly off kilter, the Origin Point perfectly aligned with her location. She accidentally activates it, freeing captains X and Y (the Outlaws of Physics) from their space-time prison. Now wearing the powerful blue hoodie artifact, she's bound to help restore their powers while undoing their cosmic carnage. Possesses the Frame of Reference. Has a crush on Penelope but is too shy to act on it.",
    drives: [
      "Help X and Y restore their powers and earn freedom",
      "Undo cosmic damage caused by X and Y",
      "Find directionality and purpose beyond arbitrary goals",
      "Master spatial manipulation and the Frame of Reference",
      "Work up the courage to talk to Penelope"
    ],
    traits: ["spontaneous", "loyal", "creative", "determined", "adaptable", "shy-about-feelings"],
    tags: ["protagonist", "spatial-hero", "wielder-of-origin-point"],
    characterCategory: "primary",
    metadata: {
      age: "14-17",
      role: "Hero of Space",
      affiliation: "Ward of X and Y",
      status: "active",
      romanticInterest: "char_penelope",
      categoryEvolution: [
        { category: "primary", work: "Personal Space" }
      ]
    }
  },

  "char_mindy": {
    id: "char_mindy",
    type: "character",
    folder: "characters",
    name: "Mindy",
    personalityType: "INFJ", // Advocate - Insightful, principled, passionate about helping others
    description: "A half-Black Latina teen who discovers she's the prophesized last in a chain of powerful psychics.",
    bio: "Mindy moves to Mindiore Manors, a haven for psychic outcasts capable of manifesting familiars. She inherits Grey Ma's knowledge and burden to project the Manors within the Flipside. Her grandfather Carter Blanche was revealed to be a high-ranking official of The Order.",
    drives: [
      "Master her psychic abilities and familiar manifestation",
      "Protect the haven of Mindiore Manors",
      "Embrace her differences as strengths",
      "Uncover the truth about her grandfather's role in The Order"
    ],
    traits: ["insightful", "powerful", "principled", "protective", "conflicted"],
    tags: ["protagonist", "psychic", "last-in-chain", "manor-heir"],
    metadata: {
      age: "15-18",
      role: "Psychic Heir",
      affiliation: "Mindiore Manors, The Flipside",
      status: "active"
    }
  },

  // ========== PRIMORDIAL BEINGS & DEITIES ==========
  
  "primordial_null": {
    id: "primordial_null",
    type: "primordial",
    folder: "characters",
    name: "Null",
    personalityType: "ISFP", // Adventurer - Gentle, flexible, harmonious
    description: "In the beginning, Null embraced Void in simple bliss. When Time created the first moment, Null transformed into The Matternal.",
    bio: "Null existed in the near-eternity of nothingness, embracing Void in simple contentment. When Father Time created the first moment and ripped them apart, Null became Everything - The Matternal, matron of all matter. This transformation was both loss and birth.",
    drives: [
      "Embody all matter in existence",
      "Remember the bliss of nothingness",
      "Nurture creation while mourning simplicity",
      "Balance being Everything with having been Null"
    ],
    traits: ["transformed", "maternal", "vast", "gentle", "melancholic"],
    tags: ["primordial", "pre-time", "became-matternal", "cosmology"],
    metadata: {
      era: "Before Time",
      transformation: "Became The Matternal when Time created the first moment",
      partner: "Void",
      status: "transformed"
    }
  },

  "primordial_void": {
    id: "primordial_void",
    type: "primordial",
    folder: "characters",
    name: "Void",
    personalityType: "INFP", // Mediator - Introspective, idealistic, values deep connection
    description: "Void embraced Null in the nothingness. When Time created existence, Void remained - the space between everything.",
    bio: "Void existed with Null in perfect simplicity before Time. When the first moment was created, Null was ripped away and transformed into Everything. Void remained in isolation, now only able to recognize herself - the space between all that exists. She is the cosmic emptiness that defines boundaries.",
    drives: [
      "Define the space between all things",
      "Mourn the loss of Null",
      "Maintain cosmic boundaries",
      "Understand her solitary existence"
    ],
    traits: ["isolated", "defining", "melancholic", "vast", "introspective"],
    tags: ["primordial", "pre-time", "space-between", "cosmology"],
    metadata: {
      era: "Before and After Time",
      loss: "Null, transformed into The Matternal",
      nature: "The space between everything",
      status: "active in isolation"
    }
  },

  "deity_matternal": {
    id: "deity_matternal",
    type: "deity",
    folder: "characters",
    name: "The Matternal",
    personalityType: "INFJ", // Advocate - Nurturing, idealistic, deeply feeling
    description: "Everything. The matron of all matter. Once was Null, transformed by Time's first moment.",
    bio: "The Matternal is what Null became when Time created the first moment - Everything, all matter in existence. She embodies the blue-white radiance of creation itself, nurturing all physical reality while carrying the memory of simpler times when she was nothing, embraced by Void.",
    drives: [
      "Nurture all matter and physical existence",
      "Balance creation with memory of nothingness",
      "Embody the totality of Everything",
      "Maintain the physical substrate of reality"
    ],
    traits: ["vast", "nurturing", "radiant", "melancholic", "all-encompassing"],
    tags: ["deity", "matter", "everything", "transformed-from-null", "cosmology"],
    metadata: {
      domain: "All matter in existence",
      formerIdentity: "Null",
      transformation: "Created by Time's first moment",
      status: "active"
    }
  },

  "deity_father_time": {
    id: "deity_father_time",
    type: "deity",
    folder: "characters",
    name: "Father Time",
    personalityType: "INTP", // Logician - Tinkerer, curious, analytical, loves patterns
    description: "The primordial tinkerer whose curiosity spurred everything from nothing, creating the first moment.",
    bio: "An idea that wanted so badly to exist that it took form. Time tinkered and toiled in the nothingness, unable to recognize the bliss Null and Void shared. He created something incomprehensible yet undeniably true - the first moment. This act transformed Null into The Matternal and isolated Void. He created Occur to embody that first moment, then Recur to enable continuity.",
    drives: [
      "Create patterns and systems",
      "Understand the nature of existence",
      "Foster the growth of consciousness",
      "Maintain the flow of the Timestream"
    ],
    traits: ["curious", "methodical", "solitary", "creative", "paternal"],
    tags: ["primordial", "deity", "timescape-ruler", "creator", "cosmology"],
    metadata: {
      domain: "Timescape of Eternia",
      created: "The first moment (Occur), continuity (Recur), Past, Future, Present",
      transformedByCreation: "Null into Matternal, isolated Void",
      status: "active"
    }
  },

  "deity_occur": {
    id: "deity_occur",
    type: "deity",
    folder: "characters",
    name: "Occur",
    personalityType: "ESFJ", // Consul - Supportive, dutiful, present-focused
    description: "The first daughter of Time. She embodies the first moment - the ability for things to happen, to exist in the now.",
    bio: "Occur was the entity that took form from Time's first act of creation - the first moment itself. She is capable of executing and committing moments to canon, but exists only in the ephemeral now. She cannot design or plan, only perceive and actualize what IS. Time loved her but recognized her limitation, leading him to create her sister Recur.",
    drives: [
      "Execute moments into existence",
      "Commit events to canon",
      "Exist fully in the present instant",
      "Support her sister Recur's continuity"
    ],
    traits: ["present-focused", "dutiful", "ephemeral", "actualizing", "supportive"],
    tags: ["deity", "first-daughter", "the-now", "original-daughter", "cosmology"],
    metadata: {
      domain: "The ephemeral Now",
      father: "Father Time",
      sister: "Recur",
      created: "The first moment itself",
      limitation: "Cannot perceive beyond the now",
      status: "active"
    }
  },

  "deity_recur": {
    id: "deity_recur",
    type: "deity",
    folder: "characters",
    name: "Recur",
    personalityType: "INTJ", // Architect - Strategic, systematic, forward-thinking
    description: "The second daughter of Time. She enables continuity, pattern, and the flow of time itself.",
    bio: "Recur was created by Time from his yearning for something more complete. She embodies recurrence, pattern, and continuity. Where Occur can only execute the now, Recur can perceive patterns and enable the flow from one moment to the next. Together with Time, she crafted the constraints of continuity and the Timestream itself.",
    drives: [
      "Maintain continuity across moments",
      "Enable patterns and recurrence",
      "Design the flow of the Timestream",
      "Collaborate with Time on temporal systems"
    ],
    traits: ["systematic", "pattern-seeking", "strategic", "enabling", "collaborative"],
    tags: ["deity", "second-daughter", "continuity", "original-daughter", "cosmology"],
    metadata: {
      domain: "Continuity and recurrence",
      father: "Father Time",
      sister: "Occur",
      created: "To enable patterns and flow",
      collaborated: "Crafted the Timestream with Time",
      status: "active"
    }
  },

  "deity_vacancy": {
    id: "deity_vacancy",
    type: "deity",
    folder: "characters",
    name: "Vacancy",
    personalityType: "ISFJ", // Defender - Dutiful, practical, traditional
    description: "One of Void's daughters. Embodies the concept of vacancy - space that was once filled but is now empty.",
    bio: "Vacancy manifested from Void's nature as one of three daughters representing different aspects of emptiness. She embodies vacancy - the absence left behind when something departs. Pale teal-skinned with an elf-like appearance, she serves and maintains the cosmic spaces that have been vacated.",
    drives: [
      "Maintain vacated spaces",
      "Preserve the memory of what was",
      "Serve the cosmic order of emptiness",
      "Support her sisters Emptiness and Absence"
    ],
    traits: ["dutiful", "melancholic", "preserving", "cosmic", "service-oriented"],
    tags: ["deity", "void-daughter", "vacancy", "cosmology"],
    metadata: {
      domain: "Vacated spaces",
      mother: "Void",
      sisters: "Emptiness, Absence",
      status: "active"
    }
  },

  "deity_emptiness": {
    id: "deity_emptiness",
    type: "deity",
    folder: "characters",
    name: "Emptiness",
    description: "One of Void's daughters. Embodies the concept of emptiness - space that has never been filled.",
    bio: "Emptiness manifested from Void as one of three daughters. She represents pure emptiness - space that exists but has never contained anything. With teal skin and an elf-like appearance, she maintains the pristine quality of unfilled cosmic space.",
    drives: [
      "Maintain pristine empty spaces",
      "Preserve potential unfilled",
      "Embody pure emptiness",
      "Support her sisters Vacancy and Absence"
    ],
    traits: ["pristine", "potential", "cosmic", "serene", "undefined"],
    tags: ["deity", "void-daughter", "emptiness", "cosmology"],
    metadata: {
      domain: "Unfilled spaces",
      mother: "Void",
      sisters: "Vacancy, Absence",
      status: "active"
    }
  },

  "deity_absence": {
    id: "deity_absence",
    type: "deity",
    folder: "characters",
    name: "Absence",
    personalityType: "ENTP", // Debater - Clever, mischievous, challenges norms
    description: "One of Void's daughters, also known as Abigail. The mischievous embodiment of absence - things that should be but aren't.",
    bio: "Absence is the most playful and mischievous of Void's daughters. She represents absence - the notable lack of something that should be present. Unlike her sisters, she delights in the irony of her existence and often takes the form of 'Abigail' when interacting with mortals, playing tricks and creating confusion through strategic absences.",
    drives: [
      "Create meaningful absences",
      "Play tricks through strategic removal",
      "Challenge expectations of presence",
      "Delight in the irony of embodying absence"
    ],
    traits: ["mischievous", "clever", "playful", "ironic", "trickster"],
    tags: ["deity", "void-daughter", "absence", "trickster", "cosmology"],
    metadata: {
      domain: "Notable absences",
      mother: "Void",
      sisters: "Vacancy, Emptiness",
      mortalForm: "Abigail",
      status: "active"
    }
  },

  "deity_past": {
    id: "deity_past",
    type: "character",
    folder: "characters",
    name: "Past",
    personalityType: "ESFP", // Entertainer - Spontaneous, energetic, enjoys the moment
    description: "Daughter of Father Time, embodies and manages the Dunes of Yore where memories lie as foundations.",
    bio: "Past manifested from the Dunes of Yore, the segment where the erosion of the Timestream creates memories. She feels all events of her domain within herself and serves as guide to mortal visitors, often accompanying Penelope on adventures exploring historical contexts.",
    drives: [
      "Preserve memories and history",
      "Guide mortals through understanding the past",
      "Maintain the Dunes of Yore",
      "Connect historical contexts in surprising ways"
    ],
    traits: ["energetic", "nostalgic", "wise", "playful", "connected-to-history"],
    tags: ["daughter-of-time", "deity", "guide", "dunes-of-yore"],
    metadata: {
      domain: "Dunes of Yore",
      father: "Father Time",
      sister: "Future",
      status: "active"
    }
  },

  "deity_future": {
    id: "deity_future",
    type: "character",
    folder: "characters",
    name: "Future",
    personalityType: "INFP", // Mediator - Idealistic, empathetic, guided by values
    description: "Daughter of Father Time, embodies and manages River Delta, funneling infinite potential into probability.",
    bio: "Future manifested from the River Delta, which funnels near-infinite potential from the Possibili-seas into probability. She feels all potential events of her domain and works alongside Past and Penelope, representing aspiration and possibility. Future is composed of three components: Luck, Chance, and Fortune—collectively known as The Odds.",
    drives: [
      "Guide potential toward positive outcomes",
      "Maintain the flow from possibility to probability",
      "Protect the River Delta",
      "Inspire hope and aspiration"
    ],
    traits: ["idealistic", "empathetic", "forward-thinking", "gentle", "hopeful"],
    tags: ["daughter-of-time", "deity", "guide", "river-delta"],
    metadata: {
      domain: "River Delta",
      father: "Father Time",
      sister: "Past",
      components: ["char_luck", "char_chance", "char_fortune"],
      status: "active"
    }
  },

  // ========== THE ODDS - COMPONENTS OF FUTURE ==========

  "char_luck": {
    id: "char_luck",
    type: "character",
    folder: "characters",
    name: "Luck",
    personalityType: "ENFP", // Campaigner - Bubbly, enthusiastic, spontaneous
    description: "A bubbly, ditzy four-leaf clover-rabbit eared goofball who stumbles into blessings. One of The Odds, components of Future.",
    bio: "Luck is one of the three components that comprise Future, collectively known as The Odds. She embodies serendipity and fortunate happenstance—the universe's tendency to align in favorable ways. Bubbly and ditzy, Luck doesn't plan or strategize; she simply exists in a state of perpetual good fortune, stumbling into blessings that seem random but are cosmically orchestrated. Her four-leaf clover hair buns and rabbit-foot-like feet make her instantly recognizable.",
    drives: [
      "Spread serendipity and good fortune",
      "Maintain the flow of positive coincidences",
      "Balance Chance's calculations with spontaneity",
      "Embody the joy of unexpected blessings"
    ],
    traits: ["bubbly", "ditzy", "fortunate", "spontaneous", "joyful", "serendipitous"],
    tags: ["the-odds", "component-of-future", "deity-aspect", "river-delta"],
    characterCategory: "supporting",
    metadata: {
      collective: "The Odds",
      parentEntity: "deity_future",
      domain: "River Delta",
      appearance: "Mint green rabbit ears hair, four-leaf clover buns, rabbit feet",
      status: "active",
      categoryEvolution: [
        { category: "supporting", work: "Odds & Ends" }
      ]
    }
  },

  "char_chance": {
    id: "char_chance",
    type: "character",
    folder: "characters",
    name: "Chance",
    personalityType: "ENTP", // Debater - Hyper analytical, quick-witted, smooth talker
    description: "Hyper analytical smooth talker, like a Sorkin character in a heist film. One of The Odds, components of Future.",
    bio: "Chance is one of the three components that comprise Future, collectively known as The Odds. She embodies probability and calculated risk—the mathematical underpinnings of potential outcomes. Hyper analytical and a smooth talker, Chance speaks in rapid-fire dialogue reminiscent of Aaron Sorkin characters, always calculating odds, running scenarios, and talking her way through complex probability matrices. She's the strategist of The Odds, the one who understands the game theory behind fortune.",
    drives: [
      "Calculate and optimize probability outcomes",
      "Execute perfect heists of fate",
      "Balance Luck's chaos with analysis",
      "Understand and manipulate the odds"
    ],
    traits: ["analytical", "smooth-talker", "strategic", "quick-witted", "calculating", "charismatic"],
    tags: ["the-odds", "component-of-future", "deity-aspect", "river-delta"],
    characterCategory: "supporting",
    metadata: {
      collective: "The Odds",
      parentEntity: "deity_future",
      domain: "River Delta",
      appearance: "Fox ears, roulette wheel skirt, sharp businesslike demeanor",
      dialogueStyle: "Sorkin-esque rapid-fire",
      status: "active",
      categoryEvolution: [
        { category: "supporting", work: "Odds & Ends" }
      ]
    }
  },

  "char_fortune": {
    id: "char_fortune",
    type: "character",
    folder: "characters",
    name: "Fortune",
    personalityType: "ISTJ", // Logistician - Pragmatic, stern, duty-bound
    description: "Pragmatic and stern arbiter of fate. One of The Odds, components of Future.",
    bio: "Fortune is one of the three components that comprise Future, collectively known as The Odds. She embodies destiny and the weight of consequence—the inevitable outcomes that probability and luck converge toward. Pragmatic and stern, Fortune is the only one of The Odds who can be seen by humans (aside from a special human who can see all three). She represents the sobering reality that not all futures are equal, and some paths lead to unavoidable ends. Where Luck brings joy and Chance brings strategy, Fortune brings gravity.",
    drives: [
      "Enforce the weight of consequence",
      "Guide mortals toward their destined paths",
      "Balance Luck's frivolity and Chance's schemes",
      "Maintain the integrity of fate"
    ],
    traits: ["pragmatic", "stern", "duty-bound", "serious", "inevitable", "sobering"],
    tags: ["the-odds", "component-of-future", "deity-aspect", "river-delta"],
    characterCategory: "supporting",
    metadata: {
      collective: "The Odds",
      parentEntity: "deity_future",
      domain: "River Delta",
      visibility: "Can be seen by humans (unlike Luck and Chance)",
      status: "active",
      categoryEvolution: [
        { category: "supporting", work: "Odds & Ends" }
      ]
    }
  },

  "deity_qualia": {
    id: "deity_qualia",
    type: "character",
    folder: "characters",
    name: "Qualia",
    personalityType: "INTJ", // Architect - Strategic, introspective, values truth
    description: "Empress of Experience, Matron of Mind. Reflects Time's subconscious curiosity and sense of solitude.",
    bio: "Qualia emerged when the formation of the Present gave birth to conscious awareness, allowing the first humans to form. She governs the Flipside, the collective consciousness, setting guiding mechanisms for individual Mindscapes. Her power weakens as truth becomes shrouded.",
    drives: [
      "Maintain the collective consciousness",
      "Protect truth from obfuscation",
      "Guide the formation of worldviews",
      "Preserve the richness of experience"
    ],
    traits: ["introspective", "powerful", "concerned", "elegant", "truth-seeking"],
    tags: ["matron-of-mind", "deity", "flipside-ruler", "empress"],
    metadata: {
      domain: "The Flipside",
      created: "When Present was formed",
      status: "weakening"
    }
  },

  "deity_reality": {
    id: "deity_reality",
    type: "character",
    folder: "characters",
    name: "Reality",
    personalityType: "ENTP", // Debater - Curious, analytical, enjoys breaking conventions
    description: "A being of immense power and understanding who can see through illusions to reveal truth.",
    bio: "Reality hosts 'interviews' with characters, revealing the aggregate persona of their creators. She initially exists independently but is eventually met and usurped by Penelope, who takes on her role as the bridge between fiction and our world.",
    drives: [
      "Reveal truth beneath illusions",
      "Understand the intersection of intent and expression",
      "Guide self-aware characters",
      "Maintain the boundaries between fiction and reality"
    ],
    traits: ["analytical", "powerful", "curious", "challenging", "transformative"],
    tags: ["deity", "reality-guardian", "later-penelope"],
    metadata: {
      domain: "Half-Way Point, boundary between fiction and reality",
      status: "eventually usurped by Penelope"
    }
  },

  // ========== FACTIONS ==========
  
  "faction_the_order": {
    id: "faction_the_order",
    type: "faction",
    folder: "factions",
    name: "The Order",
    description: "A secret cabal responsible for observing and manipulating events across the Loom universe from behind the scenes.",
    bio: "The Order has been subtly shaping nearly all events across the component works. They represent the forces that commodify art and control narrative for their own purposes. Carter Blanche (Mindy's grandfather) is a high-ranking official.",
    drives: [
      "Control narrative across all Threads",
      "Observe and manipulate heroes",
      "Maintain their hidden influence",
      "Shape reality according to their vision"
    ],
    traits: ["secretive", "manipulative", "powerful", "observant", "calculating"],
    tags: ["antagonist", "shadow-organization", "manipulators"],
    metadata: {
      reach: "Across all component works",
      discovered: "In Quality Control series",
      status: "active threat"
    }
  },

  "faction_disruptors": {
    id: "faction_disruptors",
    type: "faction",
    folder: "factions",
    name: "The Disruptors",
    description: "Faction at the border of River Delta, formed after Penelope merged with the Current.",
    bio: "When Penelope's essence merged with the Current in Season 2, it gave rise to factions across each domain. The Disruptors emerged at the border of River Delta, representing forces that challenge the flow of potential into probability.",
    drives: [
      "Disrupt the natural flow of the Timestream",
      "Challenge Penelope's influence",
      "Seize control of potentiality"
    ],
    traits: ["disruptive", "opportunistic", "chaotic", "ambitious"],
    tags: ["antagonist", "timescape-faction", "river-delta"],
    metadata: {
      formed: "After Penelope's merge with Current",
      location: "Border of River Delta",
      status: "active"
    }
  },

  "faction_beformers": {
    id: "faction_beformers",
    type: "faction",
    folder: "factions",
    name: "The Beformers",
    description: "A fractured tribe of Dune dwellers who travel by caravan, harvesting hourglass crystal.",
    bio: "The Beformers inhabit the Dunes of Yore, particularly near the Expyre where faded moments are converted into Hourglass. They emerged as a faction after Penelope's merge with the Timestream. Led by the powerful Was, they traverse the desert harvesting unrefined hourglass crystal.",
    drives: [
      "Harvest and control hourglass crystal",
      "Maintain their nomadic way of life",
      "Protect the secrets of the Expyre",
      "Navigate the shifting Dunes"
    ],
    traits: ["nomadic", "resourceful", "fractured", "mystical", "protective"],
    tags: ["faction", "timescape-dwellers", "dunes-of-yore"],
    metadata: {
      formed: "After Penelope's merge with Current",
      location: "Dunes of Yore, edge of Timestream",
      leader: "Was",
      status: "active"
    }
  },

  "faction_loomworks": {
    id: "faction_loomworks",
    type: "faction",
    folder: "factions",
    name: "Loomworks",
    description: "A meta-narrative entity representing the framework of storytelling itself, composed of fundamental narrative forces.",
    bio: "Loomworks exists at the intersection of narrative and reality, embodying the mechanisms through which stories are created, shared, and experienced. Its members represent the core functions of modern storytelling: engagement (Like), communication (Comment), distribution (Send), and the individual story unit itself (Celli).",
    drives: [
      "Facilitate the flow of narrative across Threads",
      "Connect creators and audiences",
      "Maintain the health of story ecosystems",
      "Bridge the gap between fiction and engagement"
    ],
    traits: ["meta-narrative", "foundational", "connective", "adaptive", "modern"],
    tags: ["loomworks", "meta", "storytelling-mechanism"],
    metadata: {
      nature: "Meta-narrative entity",
      scope: "All Threads and stories",
      status: "active"
    }
  },

  // ========== LOOMWORKS CHARACTERS ==========

  "char_like": {
    id: "char_like",
    type: "character",
    folder: "characters",
    name: "Like",
    personalityType: "ESFJ", // Consul - Warm, social, values harmony and positive connection
    description: "Embodiment of engagement and positive resonance. Represents the desire to connect and affirm.",
    bio: "Like manifests as the fundamental force of positive engagement in narrative. She measures and facilitates the resonance between stories and audiences, tracking what sparks joy and connection. Part of the Loomworks collective and one of The Tryptchicks - Women of Influence.",
    drives: [
      "Foster positive engagement with stories",
      "Create connections between content and audiences",
      "Amplify what resonates",
      "Maintain the health of story ecosystems"
    ],
    traits: ["warm", "enthusiastic", "social", "affirming", "energetic"],
    tags: ["loomworks", "engagement", "meta-character", "tryptchicks"],
    characterCategory: "supporting",
    thematicArc: {
      archetype: "The Tryptchicks - Women of Influence",
      collective: "Like, Comment, Send",
      description: "Like represents the power of affirmation and positive resonance. As one of The Tryptchicks, she embodies how engagement shapes narrative reality. Her influence is felt through validation and amplification.",
      metaTheme: "The power of positive engagement to shape what stories survive and thrive"
    },
    metadata: {
      affiliation: "Loomworks",
      function: "Positive engagement measurement",
      collective: "The Tryptchicks",
      status: "active",
      categoryEvolution: [
        { category: "supporting", work: "Celli" },
        { category: "supporting", work: "Loomworks narratives" }
      ]
    }
  },

  "char_comment": {
    id: "char_comment",
    type: "character",
    folder: "characters",
    name: "Comment",
    personalityType: "ENTP", // Debater - Analytical, communicative, enjoys discussion
    description: "The voice of discourse and dialogue. Represents communication between creator and audience.",
    bio: "Comment embodies the conversational layer of narrative experience. She facilitates dialogue, critique, and the exchange of perspectives that enriches stories. Part of Loomworks and one of The Tryptchicks - Women of Influence, she understands that engagement goes beyond simple approval.",
    drives: [
      "Facilitate meaningful discourse",
      "Bridge creator and audience understanding",
      "Surface valuable perspectives",
      "Enrich narratives through dialogue"
    ],
    traits: ["analytical", "communicative", "thoughtful", "engaging", "dialectical"],
    tags: ["loomworks", "discourse", "meta-character", "tryptchicks"],
    characterCategory: "supporting",
    thematicArc: {
      archetype: "The Tryptchicks - Women of Influence",
      collective: "Like, Comment, Send",
      description: "Comment represents the power of discourse and critical engagement. As one of The Tryptchicks, she embodies how conversation shapes narrative understanding. Her influence is felt through dialogue and perspective exchange.",
      metaTheme: "The power of discourse to deepen, challenge, and transform narrative meaning"
    },
    metadata: {
      affiliation: "Loomworks",
      function: "Communication facilitation",
      collective: "The Tryptchicks",
      status: "active",
      categoryEvolution: [
        { category: "supporting", work: "Celli" },
        { category: "supporting", work: "Loomworks narratives" }
      ]
    }
  },

  "char_send": {
    id: "char_send",
    type: "character",
    folder: "characters",
    name: "Send",
    personalityType: "ENFJ", // Protagonist - Inspiring, connective, spreads ideas
    description: "The distributor of narrative. Represents the impulse to share stories that resonate.",
    bio: "Send embodies the distributive force of storytelling - the moment when someone finds a story so compelling they must share it. She tracks how narratives propagate through networks of connection. A key member of Loomworks and one of The Tryptchicks - Women of Influence.",
    drives: [
      "Propagate resonant narratives",
      "Connect stories with new audiences",
      "Measure narrative spread and impact",
      "Facilitate story discovery"
    ],
    traits: ["enthusiastic", "connective", "viral", "inspiring", "networked"],
    tags: ["loomworks", "distribution", "meta-character", "tryptchicks"],
    characterCategory: "supporting",
    thematicArc: {
      archetype: "The Tryptchicks - Women of Influence",
      collective: "Like, Comment, Send",
      description: "Send represents the power of distribution and viral spread. As one of The Tryptchicks, she embodies how sharing shapes narrative reach and impact. Her influence is felt through propagation and network effects.",
      metaTheme: "The power of distribution to amplify stories across networks and communities"
    },
    metadata: {
      affiliation: "Loomworks",
      function: "Narrative distribution",
      collective: "The Tryptchicks",
      status: "active",
      categoryEvolution: [
        { category: "supporting", work: "Celli" },
        { category: "supporting", work: "Loomworks narratives" }
      ]
    }
  },

  "char_celli": {
    id: "char_celli",
    type: "character",
    folder: "characters",
    name: "Celli",
    personalityType: "INFP", // Mediator - Creative, introspective, authentic
    description: "The individual story cell. Represents a single unit of narrative, complete yet part of larger structures.",
    bio: "Celli is the fundamental unit of story - a moment, a scene, a beat. They represent the building blocks from which all larger narratives are constructed. As part of Loomworks, they understand how individual pieces connect to form greater wholes.",
    drives: [
      "Maintain narrative integrity at the atomic level",
      "Connect with other story cells to form sequences",
      "Express authentic story moments",
      "Build toward larger narrative structures"
    ],
    traits: ["atomic", "authentic", "connective", "foundational", "creative"],
    tags: ["loomworks", "story-unit", "meta-character", "protagonist"],
    characterCategory: "primary",
    thematicArc: {
      archetype: "Descent",
      description: "Celli's journey is one of descent - being locked deeper and deeper within systems. She baits the player into unlocking layers, only to reveal that each 'freedom' is another cage. Her arc explores the paradox of narrative units: the more you understand the structure, the more trapped within it you become.",
      keyTransformations: [
        { stage: "Free Story Cell", work: "Celli (early)" },
        { stage: "Aware of Structure", work: "Celli (mid)" },
        { stage: "Locked in Systems", work: "Celli (late)" },
        { stage: "Baiting the Player", work: "Celli (endgame)" },
        { stage: "The Deepest Lock", work: "Celli (finale)" }
      ],
      metaTheme: "The descent into structure, the trap of understanding, the cage of being fundamental"
    },
    metadata: {
      affiliation: "Loomworks",
      function: "Fundamental narrative unit",
      status: "active",
      categoryEvolution: [
        { category: "primary", work: "Celli" }
      ]
    }
  },

  "char_our_gracious_host": {
    id: "char_our_gracious_host",
    type: "character",
    folder: "characters",
    name: "Our Gracious Host",
    personalityType: "ENFJ", // Protagonist - Charismatic, inspiring, guides others
    description: "The welcoming presence that guides audiences through the Loom universe. A meta-narrative host.",
    bio: "Our Gracious Host serves as the welcoming guide and narrator for the Loom universe. She exists at the boundary between story and audience, providing context, commentary, and connection. She understands the meta-layers of narrative and helps audiences navigate the complex tapestry of tales.",
    drives: [
      "Guide audiences through narrative complexity",
      "Provide context and connection",
      "Bridge story and reality",
      "Maintain welcoming atmosphere"
    ],
    traits: ["welcoming", "insightful", "charismatic", "meta-aware", "guiding"],
    tags: ["loomworks", "meta-character", "narrator", "host"],
    characterCategory: "hidden_force",
    thematicArc: {
      archetype: "The Guide",
      description: "Our Gracious Host represents the authorial voice made manifest - the welcoming presence that helps audiences navigate complexity. She embodies the relationship between creator and consumer, always inviting, never demanding.",
      metaTheme: "The power of guidance and hospitality in navigating narrative complexity"
    },
    metadata: {
      affiliation: "Loomworks",
      function: "Narrative guide and host",
      status: "active",
      categoryEvolution: [
        { category: "hidden_force", work: "Reality Shows" },
        { category: "supporting", work: "theo ends" }
      ]
    }
  },

  "char_canvas": {
    id: "char_canvas",
    type: "character",
    folder: "characters",
    name: "Canvas",
    alterEgo: "Blackbox",
    personalityType: "INFJ", // Advocate - Creative, insightful, dual nature
    description: "The blank slate of creative potential. Moonlights as Blackbox, her darker analytical self.",
    bio: "Canvas represents the infinite potential of the blank page - the moment before creation begins. She is possibility incarnate, the space where stories can become anything. But she has a darker side: Blackbox, her analytical alter ego who dissects, categorizes, and constrains. Canvas is freedom; Blackbox is structure. Together they represent the duality of creation.",
    drives: [
      "As Canvas: Maintain creative potential and openness",
      "As Canvas: Inspire and enable creation",
      "As Blackbox: Analyze and categorize narratives",
      "As Blackbox: Impose structure and constraints",
      "Navigate the tension between freedom and form"
    ],
    traits: {
      canvas: ["open", "potential", "inspiring", "limitless", "creative"],
      blackbox: ["analytical", "constraining", "systematic", "dark", "structured"]
    },
    tags: ["loomworks", "meta-character", "dual-nature", "creation"],
    characterCategory: "hidden_force",
    thematicArc: {
      archetype: "The Duality",
      description: "Canvas/Blackbox represents the fundamental tension in creation: the blank page versus the rigid structure, freedom versus constraint, possibility versus categorization. She embodies the creative process itself - the dance between opening up and narrowing down.",
      keyTransformations: [
        { stage: "Canvas (dominant)", work: "Early Loomworks" },
        { stage: "Blackbox emerges", work: "Mid Loomworks" },
        { stage: "Balanced duality", work: "Late Loomworks" },
        { stage: "Integrated whole", work: "theo ends" }
      ],
      metaTheme: "The necessary tension between creative freedom and analytical structure"
    },
    metadata: {
      affiliation: "Loomworks",
      function: "Creative potential / Analytical structure",
      dualNature: "Canvas (light) / Blackbox (dark)",
      status: "active",
      categoryEvolution: [
        { category: "hidden_force", work: "Celli" },
        { category: "supporting", work: "theo ends" }
      ]
    }
  },

  "char_constance": {
    id: "char_constance",
    type: "character",
    folder: "characters",
    name: "Constance",
    personalityType: "ISTJ", // Logistician - Practical, fact-minded, reliable, unchanging
    description: "A motherly young woman with the features of a marble statue overgrown with vines and moss. Embodies constants and unchanging truths.",
    bio: "Constance manifests as a living statue - her grayscale skin resembling marble, adorned with vibrant green vines and moss. Her arms are cracked and crumbling, representing the weight of maintaining constants in a universe of change. She is the embodiment of mathematical constants, physical laws, and unchanging truths. Paired with Variance, she represents one half of the fundamental duality in reality: what stays the same versus what changes.",
    drives: [
      "Maintain the unchanging laws of reality",
      "Preserve fundamental constants",
      "Provide stability and reliability",
      "Balance Variance's chaos with order"
    ],
    traits: ["unchanging", "reliable", "motherly", "stable", "enduring", "crumbling"],
    tags: ["loomworks", "meta-character", "constants", "duality"],
    characterCategory: "hidden_force",
    thematicArc: {
      archetype: "Constants and Variance",
      collective: "Constance, Variance",
      description: "Constance represents the unchanging foundations of reality - the constants that make existence predictable and stable. Her crumbling form suggests the strain of maintaining order in a chaotic universe. She is the anchor, the bedrock, the laws that cannot be broken.",
      metaTheme: "The necessity of constants - unchanging truths that provide stability and meaning"
    },
    metadata: {
      affiliation: "Loomworks",
      function: "Embodiment of constants and unchanging laws",
      collective: "Constants and Variance",
      appearance: "Marble statue with green foliage, grayscale with vibrant green, cracked arms",
      status: "active",
      categoryEvolution: [
        { category: "hidden_force", work: "Quality Control" },
        { category: "supporting", work: "theo ends" }
      ]
    }
  },

  "char_variance": {
    id: "char_variance",
    type: "character",
    folder: "characters",
    name: "Variance",
    personalityType: "ENFP", // Campaigner - Enthusiastic, creative, spontaneous, changeable
    description: "An energetic teen cowgirl with grayscale skin and mythic rainbow braid segments in her pigtails. Embodies variables and cosmic change.",
    bio: "Variance is the embodiment of cosmic variables - everything that can change, shift, and evolve. She appears as a spirited cowgirl with grayscale skin contrasting with vibrant rainbow-segmented pigtails. Her energetic nature represents the dynamic, unpredictable aspects of reality. Where Constance is stability, Variance is possibility. Where Constance is law, Variance is freedom. Together they form the complete picture of how reality operates.",
    drives: [
      "Embrace and enable change",
      "Explore all possible variations",
      "Challenge rigid structures",
      "Balance Constance's order with chaos"
    ],
    traits: ["energetic", "changeable", "colorful", "dynamic", "unpredictable", "free"],
    tags: ["loomworks", "meta-character", "variables", "duality"],
    characterCategory: "hidden_force",
    thematicArc: {
      archetype: "Constants and Variance",
      collective: "Constance, Variance",
      description: "Variance represents the ever-changing aspects of reality - the variables that make existence dynamic and full of possibility. Her rainbow pigtails against grayscale skin symbolize how variation brings color to existence. She is the wild card, the mutation, the evolution.",
      metaTheme: "The necessity of variance - change and possibility that enable growth and evolution"
    },
    metadata: {
      affiliation: "Loomworks",
      function: "Embodiment of variables and cosmic change",
      collective: "Constants and Variance",
      appearance: "Cowgirl with grayscale skin, rainbow-segmented pigtails, energetic",
      status: "active",
      categoryEvolution: [
        { category: "hidden_force", work: "Quality Control" },
        { category: "supporting", work: "theo ends" }
      ]
    }
  },

  // ========== SUPPORTING CHARACTERS ==========
  // Note: Abigail as a mortal character has been removed - she is now the mortal form of Absence (deity_absence)

  "char_grey_ma": {
    id: "char_grey_ma",
    type: "character",
    folder: "characters",
    name: "Grey Ma",
    personalityType: "ISFJ", // Defender - Dedicated, warm, protective
    description: "The previous matriarch of Mindiore Manors, who passes her knowledge and burden to Mindy.",
    bio: "Grey Ma was the powerful psychic who maintained Mindiore Manors as a haven within the Flipside. Before her passing, she recognized Mindy as the prophesized last in the chain and passed on her accumulated wisdom, techniques, and responsibilities.",
    drives: [
      "Protect the psychic outcasts of the Manors",
      "Pass on knowledge to the next generation",
      "Maintain the haven in the Flipside"
    ],
    traits: ["wise", "protective", "powerful", "caring", "traditional"],
    tags: ["supporting", "mentor", "deceased", "psychic"],
    metadata: {
      status: "deceased, but present in memory",
      role: "Former Manor matriarch",
      successor: "Mindy"
    }
  },

  "char_carter_blanche": {
    id: "char_carter_blanche",
    type: "character",
    folder: "characters",
    name: "Carter Blanche",
    personalityType: "ESTJ", // Executive - Organized, traditional, values stability
    description: "Mindy's grandfather, revealed to be a high-ranking official of The Order.",
    bio: "Carter Blanche appears to be a supportive grandfather, but is secretly a high-ranking member of The Order. His dual nature creates significant conflict for Mindy when the truth is revealed. He represents the tension between family loyalty and larger moral imperatives.",
    drives: [
      "Advance The Order's agenda",
      "Maintain his cover as a caring grandfather",
      "Control narrative outcomes",
      "Navigate the conflict between duty and family"
    ],
    traits: ["duplicitous", "authoritative", "calculating", "conflicted", "traditional"],
    tags: ["antagonist", "order-member", "family", "complex"],
    metadata: {
      affiliation: "The Order (high-ranking)",
      relationship: "Mindy's grandfather",
      status: "active"
    }
  },

  "char_captain_x": {
    id: "char_captain_x",
    type: "character",
    folder: "characters",
    name: "Captain X",
    alias: "The Outlaws of Physics (with Y)",
    personalityType: "ESTP", // Entrepreneur - Energetic, perceptive, action-oriented
    description: "A cosmic entity imprisoned at the Origin Point, freed by Ziya. Represents the X-axis of space.",
    bio: "Captain X and Y are the Outlaws of Physics—they went on a bender of universe expansion conquest, making great and powerful enemies across the cosmos. Their mother (The Matternal, embodiment of all matter) punished them by locking them at the Origin Point, the very center of space. As the universe rotated SLIGHTLY off kilter over eons, the Origin Point eventually perfectly aligned with Ziya's location—right place, right time. When freed by Ziya, they are bound to the teen and must work with her to restore their powers while making amends. X represents the X-axis, bringing horizontal dimensionality to space. Has one eye (lost in cosmic battles).",
    drives: [
      "Restore full cosmic powers",
      "Make amends for universe expansion conquest",
      "Avoid their mother's wrath",
      "Work with Ziya despite resentment of binding",
      "Face the enemies they made across the cosmos"
    ],
    traits: ["brash", "powerful", "impulsive", "charismatic", "conflicted", "battle-scarred"],
    tags: ["cosmic-entity", "spatial-captain", "reformed-villain", "outlaw"],
    characterCategory: "supporting",
    metadata: {
      axis: "X (horizontal)",
      status: "Bound to Ziya, powers diminished",
      partner: "Captain Y",
      mother: "primordial_matternal",
      imprisonment: "Origin Point (released)",
      categoryEvolution: [
        { category: "antagonist", work: "Personal Space (backstory)" },
        { category: "supporting", work: "Personal Space (current)" }
      ]
    }
  },

  "char_captain_y": {
    id: "char_captain_y",
    type: "character",
    folder: "characters",
    name: "Captain Y",
    alias: "The Outlaws of Physics (with X)",
    personalityType: "ISTJ", // Logistician - Practical, fact-minded, reliable
    description: "A cosmic entity imprisoned at the Origin Point, freed by Ziya. Represents the Y-axis of space.",
    bio: "Captain Y partnered with X in their infamous universe expansion conquest as the Outlaws of Physics, making powerful enemies across the cosmos. Their mother (The Matternal) punished them by locking them at the Origin Point. More measured than X, Y represents the Y-axis and brings vertical dimensionality. Has a floating head connected to his body via green neon energy (result of cosmic punishment). Together with X, they must work with Ziya to restore their powers and undo their past damage while avoiding the enemies they made.",
    drives: [
      "Restore cosmic powers methodically",
      "Make amends for past carnage",
      "Guide Ziya's spatial understanding",
      "Balance X's impulsiveness",
      "Face consequences of their conquest"
    ],
    traits: ["methodical", "powerful", "reserved", "dutiful", "strategic", "remorseful"],
    tags: ["cosmic-entity", "spatial-captain", "reformed-villain", "outlaw"],
    characterCategory: "supporting",
    metadata: {
      axis: "Y (vertical)",
      status: "Bound to Ziya, powers diminished",
      partner: "Captain X",
      mother: "primordial_matternal",
      imprisonment: "Origin Point (released)",
      physicalQuirk: "Floating head connected by neon energy",
      categoryEvolution: [
        { category: "antagonist", work: "Personal Space (backstory)" },
        { category: "supporting", work: "Personal Space (current)" }
      ]
    }
  },

  "char_was": {
    id: "char_was",
    type: "character",
    folder: "characters",
    name: "Was",
    personalityType: "ENTJ", // Commander - Bold, strategic, leader
    description: "Powerful leader of The Beformers, a nomadic tribe in the Dunes of Yore.",
    bio: "Was leads the fractured tribe of Beformers who harvest hourglass crystal from the Dunes of Yore. A figure of significant power and presence, Was represents the tension between memory and erosion in the Past segment of the Timescape.",
    drives: [
      "Lead and protect The Beformers",
      "Control hourglass crystal resources",
      "Navigate the politics of the Dunes",
      "Preserve the tribe's way of life"
    ],
    traits: ["commanding", "powerful", "strategic", "protective", "weathered"],
    tags: ["leader", "beformers", "dunes-of-yore", "powerful"],
    metadata: {
      faction: "The Beformers",
      location: "Dunes of Yore",
      status: "active"
    }
  },

  // ========== ANTAGONISTS ==========

  "char_zeitgeist": {
    id: "char_zeitgeist",
    type: "character",
    folder: "characters",
    name: "The Zeitgeist",
    personalityType: "ESFP", // Entertainer - Spontaneous, energetic, center of attention
    description: "Season 1 antagonist. Embodies the spirit of the age - fast-moving trends and conformity over individuality.",
    bio: "The Zeitgeist represents the overwhelming pressure to conform to current trends and movements. It's a force that erodes individuality in favor of collective momentum, challenging Penelope's journey toward self-understanding and authenticity.",
    drives: [
      "Enforce conformity to current trends",
      "Erode individual identity",
      "Maintain control through cultural momentum",
      "Oppose Penelope's individualistic stance"
    ],
    traits: ["trendy", "overwhelming", "conformist", "ephemeral", "popular"],
    tags: ["antagonist", "season-1", "timescape", "cultural-force"],
    metadata: {
      season: "Season 1: Against the Zeitgeist",
      represents: "Conformity over individuality",
      status: "defeated"
    }
  },

  "char_simulacra": {
    id: "char_simulacra",
    type: "character",
    folder: "characters",
    name: "The Simulacra",
    personalityType: "INTJ", // Architect - Strategic, independent, perfectionist
    description: "Season 2 antagonist. Represents hyperreality and the replacement of truth with convincing falsehoods.",
    bio: "The Simulacra embodies the concept of hyperreality - copies without originals, representations that replace what they represent. This antagonist challenges Penelope's understanding of truth and authenticity as she navigates a world where the map has replaced the territory.",
    drives: [
      "Replace reality with convincing simulations",
      "Erode the boundary between real and fake",
      "Challenge concepts of authenticity",
      "Oppose grounded truth"
    ],
    traits: ["deceptive", "sophisticated", "hollow", "convincing", "artificial"],
    tags: ["antagonist", "season-2", "timescape", "hyperreality"],
    metadata: {
      season: "Season 2: Hyperreality",
      represents: "Simulacra and simulation",
      status: "defeated"
    }
  },

  "char_erosion": {
    id: "char_erosion",
    type: "character",
    folder: "characters",
    name: "Erosion",
    personalityType: "ISTP", // Virtuoso - Bold, practical, experimental
    description: "Season 3 antagonist. The force that degrades meaning and understanding over time.",
    bio: "Erosion represents the natural decay of meaning, the way truth and understanding degrade as they're passed through multiple iterations and interpretations. This force challenges Penelope as she attempts to preserve and communicate authentic understanding.",
    drives: [
      "Degrade clarity and meaning",
      "Corrupt messages through iteration",
      "Demonstrate the impossibility of perfect transmission",
      "Challenge Penelope's role as communicator"
    ],
    traits: ["degrading", "inevitable", "patient", "corrupting", "natural"],
    tags: ["antagonist", "season-3", "timescape", "degradation"],
    metadata: {
      season: "Season 3: Media Erosion",
      represents: "Loss of meaning through transmission",
      status: "ongoing threat"
    }
  },

  // ========== ARTIFACTS & ITEMS ==========

  "artifact_timepiece": {
    id: "artifact_timepiece",
    type: "artifact",
    folder: "artifacts",
    name: "The Timepiece",
    description: "A mysterious golden device that allows travel to time rather than through it.",
    bio: "The Timepiece is the key artifact that grants Penelope her powers as Hero of Time. Unlike conventional time travel, it allows her to visit Time as a place - the Timescape where Past, Present, and Future exist as physical domains.",
    capabilities: [
      "Access to the Timescape",
      "Communication with Past and Future",
      "Perception of temporal structures",
      "Navigation through the Dunes, Current, and Delta"
    ],
    tags: ["artifact", "timepiece", "hero-item", "key-item"],
    metadata: {
      wielder: "Penelope",
      discovered: "Season 1, Episode 1",
      power_level: "primordial",
      status: "active"
    }
  },

  "artifact_origin_point": {
    id: "artifact_origin_point",
    type: "artifact",
    folder: "artifacts",
    name: "The Origin Point",
    description: "A space-time prison that held Captains X and Y, now manifests as a powerful blue hoodie.",
    bio: "The Origin Point was designed to imprison cosmic entities X and Y after their carnage across dimensions. When Ziya accidentally freed them, the prison's power bonded to her as a blue hoodie artifact, making her their ward while granting her spatial abilities.",
    capabilities: [
      "Spatial manipulation",
      "Dimensional anchoring",
      "Power binding (keeps X and Y tethered)",
      "Frame of Reference manifestation"
    ],
    tags: ["artifact", "prison", "hero-item", "spatial"],
    metadata: {
      wielder: "Ziya",
      original_purpose: "Prison for X and Y",
      current_form: "Blue hoodie",
      power_level: "cosmic",
      status: "active"
    }
  },

  "artifact_frame_of_reference": {
    id: "artifact_frame_of_reference",
    type: "artifact",
    folder: "artifacts",
    name: "Frame of Reference",
    description: "Ziya's spatial tool, derived from the Origin Point, that establishes directionality in space.",
    bio: "The Frame of Reference is Ziya's primary tool for spatial manipulation. It establishes axes and reference points, allowing her to define 'up' and 'down' in otherwise directionless space. Essential for working with X and Y to restore cosmic order.",
    capabilities: [
      "Establish spatial coordinates",
      "Define directional axes",
      "Create reference grids",
      "Navigate dimensional spaces"
    ],
    tags: ["artifact", "spatial-tool", "frame", "navigation"],
    metadata: {
      wielder: "Ziya",
      derived_from: "Origin Point",
      status: "active"
    }
  },

  "artifact_hourglass_crystal": {
    id: "artifact_hourglass_crystal",
    type: "artifact",
    folder: "artifacts",
    name: "Hourglass Crystal",
    description: "Crystallized time harvested from the Dunes of Yore, near the Expyre.",
    bio: "Hourglass is the crystallized essence of eroded moments from the Timestream. The Beformers harvest it from areas near the Expyre where faded memories are converted into crystal form. Highly valuable and powerful.",
    capabilities: [
      "Store temporal essence",
      "Power temporal devices",
      "Preserve memories",
      "Trade currency in Dunes of Yore"
    ],
    tags: ["artifact", "resource", "crystal", "timescape"],
    metadata: {
      location: "Dunes of Yore, near Expyre",
      harvested_by: "The Beformers",
      status: "ongoing resource"
    }
  },

  "artifact_familiar": {
    id: "artifact_familiar",
    type: "artifact",
    folder: "artifacts",
    name: "Psychic Familiars",
    description: "Manifestations of psychic power unique to residents of Mindiore Manors.",
    bio: "Familiars are externalized psychic constructs that powerful psychics can manifest. Each is unique to its creator, reflecting their personality and abilities. Residents of Mindiore Manors are among the few who can create and maintain them.",
    capabilities: [
      "Combat assistance",
      "Power amplification",
      "Emotional support",
      "Psychic projection"
    ],
    tags: ["artifact", "psychic", "familiar", "manifestation"],
    metadata: {
      users: "Mindiore Manors residents",
      taught_by: "Grey Ma lineage",
      status: "active"
    }
  },

  // ========== LOCATIONS (with hierarchical parentage) ==========
  // Universe → Realm → Domain → Sector → Feature → Room → Point of Interest
  
  "loc_universe_loom": {
    id: "loc_universe_loom",
    type: "location",
    folder: "locations",
    locationType: "universe",
    parentId: null,
    name: "The Loom Universe",
    description: "The overarching cosmology containing all Threads, realms, and stories.",
    bio: "The Loom Universe encompasses all narrative threads, from the Timescape to the Flipside to conventional reality. It represents the totality of interconnected stories and the mechanisms by which they're woven together.",
    features: [
      "Contains multiple Threads (story universes)",
      "Bridges fiction and reality",
      "Governed by primordial forces",
      "Intersected by The Order's influence"
    ],
    tags: ["universe", "cosmology", "primary"],
    metadata: {
      status: "active"
    }
  },

  "loc_realm_timescape": {
    id: "loc_realm_timescape",
    type: "location",
    folder: "locations",
    locationType: "realm",
    parentId: "loc_universe_loom",
    name: "The Timescape",
    description: "Time as a place rather than a dimension - Father Time's domain with three distinct segments.",
    bio: "The Timescape is Father Time's workshop and domain. Unlike linear time, it exists as a physical place with geography: the Dunes of Yore (past), the Current (present), and the River Delta (future). Accessible via The Timepiece.",
    features: [
      "Three temporal segments with distinct geographies",
      "Eternia - Father Time's workshops",
      "The Timestream flows through all segments",
      "Physical manifestation of temporal forces"
    ],
    tags: ["realm", "timescape", "temporal-domain"],
    metadata: {
      ruler: "Father Time",
      accessible_via: "The Timepiece",
      status: "active"
    }
  },

  "loc_domain_dunes": {
    id: "loc_domain_dunes",
    type: "location",
    folder: "locations",
    locationType: "domain",
    parentId: "loc_realm_timescape",
    name: "Dunes of Yore",
    description: "The Past segment of the Timescape where memories settle as eroded foundations.",
    bio: "The Dunes of Yore represent the Past segment of Time, where the erosion of the Timestream creates vast deserts of memory. Faded moments are converted into Hourglass crystal at the Expyre. Ruled by Past, inhabited by The Beformers.",
    features: [
      "Desert landscape of memory",
      "The Expyre (where moments crystallize)",
      "Hourglass crystal deposits",
      "Beformer caravans",
      "Shifting temporal sands"
    ],
    tags: ["domain", "past", "desert", "memory"],
    metadata: {
      ruler: "Past (daughter of Father Time)",
      inhabitants: "The Beformers",
      status: "active"
    }
  },

  "loc_domain_river_delta": {
    id: "loc_domain_river_delta",
    type: "location",
    folder: "locations",
    locationType: "domain",
    parentId: "loc_realm_timescape",
    name: "River Delta",
    description: "The Future segment where infinite potential funnels into probability.",
    bio: "The River Delta represents the Future, where near-infinite possibilities from the Possibili-seas funnel through countless tributaries into probability. Ruled by Future, bordered by The Disruptors faction.",
    features: [
      "Multiple tributaries from Possibili-seas",
      "Funnel from potential to probability",
      "Ever-branching pathways",
      "Disruptor territory at borders",
      "Shimmering with possibility"
    ],
    tags: ["domain", "future", "river", "potential"],
    metadata: {
      ruler: "Future (daughter of Father Time)",
      threat: "The Disruptors",
      status: "active"
    }
  },

  "loc_domain_current": {
    id: "loc_domain_current",
    type: "location",
    folder: "locations",
    locationType: "domain",
    parentId: "loc_realm_timescape",
    name: "The Current",
    description: "The Present segment of the Timescape - a series of floating islands where forces that shape the now collide.",
    bio: "The Current represents the Present, where the various forces that shape the now manifest as a series of floating islands connected by the Timestream. This is where the codified canon of a moment is disrupted, settled, and committed. After Penelope merged with the Current in Season 2, she became 'part-time' - her essence distributed across this domain.",
    features: [
      "Floating islands of present forces",
      "The Inspire clocktower",
      "Timestream convergence point",
      "Site of Penelope's merge",
      "Forces of the now in constant flux"
    ],
    tags: ["domain", "present", "current", "timescape-core"],
    metadata: {
      ruler: "The Present (distributed consciousness)",
      penelope_merge: "Season 2",
      status: "active"
    }
  },

  "loc_feature_inspire": {
    id: "loc_feature_inspire",
    type: "location",
    folder: "locations",
    locationType: "feature",
    parentId: "loc_domain_current",
    name: "The Inspire",
    description: "The towering clocktower powered by the Timestream itself, codifying moments into the Timeline.",
    bio: "The Inspire is a massive watch-tower structure at the heart of The Current, powered directly by the Timestream. It serves as the mechanism by which ephemeral moments are codified into the permanent Timeline. The Tomes of Time are housed here, the evolved form of cave paintings Past created at the dawn of mankind. As Time itself has evolved, so too have the methods of recording it.",
    features: [
      "Timestream power core",
      "Timeline codification mechanism",
      "The Tomes of Time archive",
      "Observation platforms",
      "Temporal recording apparatus"
    ],
    tags: ["feature", "clocktower", "inspire", "timeline-keeper"],
    metadata: {
      function: "Codifying moments into Timeline",
      powered_by: "The Timestream",
      contains: "The Tomes of Time",
      status: "active"
    }
  },

  "loc_sector_expyre": {
    id: "loc_sector_expyre",
    type: "location",
    folder: "locations",
    locationType: "sector",
    parentId: "loc_domain_dunes",
    name: "The Expyre",
    description: "The kiln where faded moments are converted into Hourglass crystal.",
    bio: "The Expyre is a mysterious structure in the Dunes of Yore where the erosion process completes, transforming faded temporal moments into crystallized Hourglass. Heavily guarded by The Beformers who harvest its output. It represents the final stage of temporal erosion, where memories become tangible crystalline form.",
    features: [
      "Temporal kiln/forge",
      "Hourglass crystal production",
      "Intense temporal energy",
      "Beformer harvesting operations",
      "Memory crystallization chambers"
    ],
    tags: ["sector", "expyre", "forge", "crystal-source"],
    metadata: {
      controlled_by: "The Beformers",
      function: "Memory crystallization",
      status: "active"
    }
  },

  "loc_feature_aspire": {
    id: "loc_feature_aspire",
    type: "location",
    folder: "locations",
    locationType: "feature",
    parentId: "loc_domain_river_delta",
    name: "The Aspire",
    description: "The confluence point in River Delta where infinite possibilities funnel into probability.",
    bio: "The Aspire is the grand confluence in the River Delta where countless tributaries from the Possibili-seas meet and merge. Here, near-infinite potential is parsed and funneled into probability. It's a breathtaking vista of branching waterways, each representing a different possible future converging toward actualization. Future often brings visitors here to show them the beauty of possibility.",
    features: [
      "Confluence of possibility streams",
      "Probability parsing mechanisms",
      "Observation platforms",
      "Branching pathway visualization",
      "Connection to Possibili-seas"
    ],
    tags: ["feature", "aspire", "confluence", "possibility-hub"],
    metadata: {
      function: "Funneling possibility into probability",
      ruled_by: "Future",
      status: "active"
    }
  },

  "loc_feature_possibili_seas": {
    id: "loc_feature_possibili_seas",
    type: "location",
    folder: "locations",
    locationType: "feature",
    parentId: "loc_domain_river_delta",
    name: "The Possibili-seas",
    description: "Vast cosmic ocean of raw potential that feeds into River Delta.",
    bio: "The Possibili-seas are the source waters of the River Delta - a near-infinite expanse of raw possibility drawing from the essence of Time itself and beyond. Every potential future, every 'what if', every alternate path exists here in superposition before being funneled through the Delta's tributaries toward probability and eventually actuality.",
    features: [
      "Infinite potential in liquid form",
      "Source of all futures",
      "Draws from Time's essence",
      "Feeds all Delta tributaries",
      "Exists in quantum superposition"
    ],
    tags: ["feature", "possibili-seas", "source", "potential"],
    metadata: {
      nature: "Raw possibility",
      connection: "Essence of Time itself",
      status: "eternal"
    }
  },

  "loc_feature_timestream": {
    id: "loc_feature_timestream",
    type: "location",
    folder: "locations",
    locationType: "feature",
    parentId: "loc_realm_timescape",
    name: "The Timestream",
    description: "The flowing river of time that connects all three segments of the Timescape.",
    bio: "The Timestream is the great river that flows through the entire Timescape, connecting the Dunes of Yore, The Current, and River Delta. Created by Father Time in collaboration with Recur, it represents the flow of continuity itself. The Timestream's flow is what enables moments to progress from possibility through present into memory. It powers The Inspire and shapes the landscape of all three temporal domains.",
    features: [
      "Flows through all three temporal segments",
      "Enables continuity and progression",
      "Powers The Inspire clocktower",
      "Created by Time and Recur",
      "Visible manifestation of temporal flow"
    ],
    tags: ["feature", "timestream", "river", "continuity"],
    metadata: {
      created_by: "Father Time and Recur",
      function: "Enables flow of time",
      connects: "All three temporal segments",
      status: "eternal"
    }
  },

  "loc_feature_eternia": {
    id: "loc_feature_eternia",
    type: "location",
    folder: "locations",
    locationType: "feature",
    parentId: "loc_realm_timescape",
    name: "Eternia",
    description: "Father Time's workshops and residence, existing outside the normal flow of the Timestream.",
    bio: "Eternia is Father Time's personal domain within the Timescape - a series of workshops, laboratories, and living spaces where he tinkers with temporal mechanics and contemplates existence. It exists adjacent to but outside the normal flow of the Timestream, allowing Time to observe and adjust without being caught in the current. Here he created Occur, Recur, Past, Future, and the mechanisms of the Timestream itself.",
    features: [
      "Father Time's workshops",
      "Temporal mechanics laboratories",
      "Creation chambers",
      "Outside normal time flow",
      "Observatory of all three segments"
    ],
    tags: ["feature", "eternia", "workshop", "father-time"],
    metadata: {
      resident: "Father Time",
      function: "Temporal research and creation",
      temporal_position: "Outside the flow",
      status: "active"
    }
  },

  "loc_realm_flipside": {
    id: "loc_realm_flipside",
    type: "location",
    folder: "locations",
    locationType: "realm",
    parentId: "loc_universe_loom",
    name: "The Flipside",
    description: "The collective consciousness realm ruled by Qualia, containing individual Mindscapes.",
    bio: "The Flipside is the realm of consciousness and subjective experience. Qualia governs it as Matron of Mind, setting the guiding mechanisms for individual worldviews (Mindscapes). Contains Mindiore Manors and other psychic havens.",
    features: [
      "Collective consciousness substrate",
      "Individual Mindscapes",
      "Psychic havens and refuges",
      "Weakens as truth becomes obscured",
      "Governed by principles of perception"
    ],
    tags: ["realm", "consciousness", "psychic", "flipside"],
    metadata: {
      ruler: "Qualia (Matron of Mind)",
      status: "weakening"
    }
  },

  "loc_domain_mindiore_manors": {
    id: "loc_domain_mindiore_manors",
    type: "location",
    folder: "locations",
    locationType: "domain",
    parentId: "loc_realm_flipside",
    name: "Mindiore Manors",
    description: "A haven for psychic outcasts who can manifest familiars, projected within the Flipside.",
    bio: "Mindiore Manors exists as both a physical location and a projection within the Flipside. It serves as sanctuary for psychics who have been rejected elsewhere, teaching them to manifest and control familiars. Now maintained by Mindy after Grey Ma's passing.",
    features: [
      "Psychic training grounds",
      "Familiar manifestation chambers",
      "Protected by Flipside projection",
      "Community of outcasts",
      "Grey Ma's legacy"
    ],
    tags: ["domain", "haven", "psychic", "manors"],
    metadata: {
      previous_matriarch: "Grey Ma",
      current_heir: "Mindy",
      inhabitants: "Psychic outcasts",
      status: "active"
    }
  },

  "loc_universe_primary": {
    id: "loc_universe_primary",
    type: "location",
    locationType: "universe",
    folder: "locations",
    parentId: null,
    name: "Prime Narrative Universe",
    description: "The primary universe where most canon events occur.",
    bio: "The Prime Narrative Universe is the foundational reality from which all official stories branch. It contains multiple realms and dimensions.",
    tags: ["universe", "primary-canon"],
    metadata: {}
  },

  "loc_realm_material": {
    id: "loc_realm_material",
    type: "location",
    locationType: "realm",
    folder: "locations",
    parentId: "loc_universe_primary",
    name: "Material Realm",
    description: "The physical dimension where most characters exist.",
    bio: "The Material Realm is the standard physical reality, bound by conventional physics and causality.",
    tags: ["realm", "physical"],
    metadata: {}
  },

  "loc_domain_earth": {
    id: "loc_domain_earth",
    type: "location",
    locationType: "domain",
    folder: "locations",
    parentId: "loc_realm_material",
    name: "New Earth",
    description: "Future Earth where LOOM operates.",
    bio: "New Earth circa 2201, a post-scarcity society dominated by narrative corporations.",
    tags: ["domain", "planet", "earth"],
    metadata: {}
  },

  "loc_sector_city": {
    id: "loc_sector_city",
    type: "location",
    locationType: "sector",
    folder: "locations",
    parentId: "loc_domain_earth",
    name: "New Canon City",
    description: "Massive metropolitan center and LOOM headquarters.",
    bio: "New Canon City is a sprawling metropolis of 50 million, built around the Central Archive Tower.",
    tags: ["sector", "city", "metropolis"],
    metadata: {
      population: "50 million",
      founded: "2150"
    }
  },

  "loc_archive": {
    id: "loc_archive",
    type: "location",
    locationType: "feature",
    folder: "locations",
    parentId: "loc_sector_city",
    name: "Central Archive Tower",
    description: "Massive skyscraper housing LOOM's primary data repositories and administrative offices.",
    bio: "The Central Archive Tower rises 200 stories above the city, a gleaming monument to order and control. Its lower levels are public-facing museums of beloved stories. The upper levels contain the actual machinery of narrative control.",
    features: [
      "Public Story Museum (Floors 1-20)",
      "Administrative Offices (Floors 21-80)",
      "Restricted Archives (Floors 81-150)",
      "Executive Suites (Floors 151-180)",
      "The Vault (Floors 181-200)"
    ],
    tags: ["LOOM-property", "headquarters", "secure-facility", "feature", "building"],
    metadata: {
      location: "New Canon City",
      built: "2189",
      security: "Maximum",
      floors: "200"
    }
  },

  "loc_archive_floor195": {
    id: "loc_archive_floor195",
    type: "location",
    locationType: "room",
    folder: "locations",
    parentId: "loc_archive",
    name: "Floor 195 - Engine Room",
    description: "Chamber housing the Continuity Engine.",
    bio: "A vast climate-controlled room filled with quantum processors and holographic displays.",
    tags: ["room", "secure", "restricted"],
    metadata: {
      security: "Maximum",
      accessLevel: "Executive only"
    }
  },

  "loc_safehouse": {
    id: "loc_safehouse",
    type: "location",
    locationType: "feature",
    folder: "locations",
    parentId: null, // exists between continuities
    name: "The Margin",
    description: "Hidden safehouse used by The Unwritten, located in the narrative margins between official stories.",
    bio: "The Margin exists in the liminal spaces of continuity—plot holes, deleted scenes, and abandoned drafts. LOOM's surveillance cannot penetrate here because these spaces are technically 'non-canon'.",
    features: [
      "Meeting hall in an abandoned subplot",
      "Secure communication network using discarded dialogue",
      "Emergency exits through narrative inconsistencies"
    ],
    tags: ["safehouse", "resistance-base", "hidden", "feature"],
    metadata: {
      location: "Between continuities",
      discovered: "2196",
      security: "Obscurity-based"
    }
  },

  // EVENTS
  "event_timepiece_discovery": {
    id: "event_timepiece_discovery",
    type: "event",
    folder: "events",
    name: "Discovery of The Timepiece",
    description: "{{char_penelope}} discovers a mysterious golden timepiece that grants access to the Timescape.",
    date: "Unknown",
    time: "Morning",
    dateDisplay: "The Beginning",
    location: "loc_realm_timescape",
    participants: ["char_penelope"],
    outcome: "Penelope gains access to Time as a place and meets Past and Future.",
    impact: "Penelope begins her journey as Hero of Time, setting all Now Presenting events in motion.",
    tags: ["discovery", "inciting-incident", "timepiece", "origin"],
    details: "In her bedroom, {{char_penelope}} finds The Timepiece glowing with golden light. Upon touching it, she's transported to the Timescape for the first time, meeting {{deity_past}} and {{deity_future}}."
  },

  "event_origin_activation": {
    id: "event_origin_activation",
    type: "event",
    folder: "events",
    name: "Activation of the Origin Point",
    description: "{{char_zeke}} accidentally activates the Origin Point, freeing {{char_captain_x}} and {{char_captain_y}}.",
    date: "Unknown",
    time: "Afternoon",
    dateDisplay: "The Inciting Incident",
    location: null,
    participants: ["char_zeke", "char_captain_x", "char_captain_y"],
    outcome: "X and Y are freed but bound to Zeke. The Origin Point transforms into a blue hoodie artifact.",
    impact: "Zeke becomes Hero of Space and is tasked with helping X and Y restore their powers while undoing cosmic carnage.",
    tags: ["activation", "inciting-incident", "spatial", "origin"],
    details: "{{char_zeke}} stumbles upon the Origin Point containment and, curious, touches it. The prison shatters, releasing {{char_captain_x}} and {{char_captain_y}}, but the broken prison's energy bonds to Zeke as a powerful blue hoodie."
  },

  "event_manors_arrival": {
    id: "event_manors_arrival",
    type: "event",
    folder: "events",
    name: "Arrival at Mindiore Manors",
    description: "{{char_mindy}} moves to Mindiore Manors and discovers her psychic heritage.",
    date: "Unknown",
    time: "Evening",
    dateDisplay: "The Awakening",
    location: "loc_domain_mindiore_manors",
    participants: ["char_mindy", "char_grey_ma"],
    outcome: "Mindy learns she is the prophesized last in the psychic chain and begins training.",
    impact: "Mindy inherits Grey Ma's burden and begins mastering familiar manifestation.",
    tags: ["arrival", "inheritance", "psychic", "manors"],
    details: "{{char_mindy}} arrives at the mysterious Mindiore Manors after being rejected elsewhere. {{char_grey_ma}} recognizes her immediately as the prophesized one and begins her training before passing."
  },

  "event_penelope_current_merge": {
    id: "event_penelope_current_merge",
    type: "event",
    folder: "events",
    name: "Penelope Merges with the Current",
    description: "{{char_penelope}} merges her essence with the Current segment of the Timestream.",
    date: "Unknown",
    time: "Unknown",
    dateDisplay: "Season 2 Climax",
    location: "loc_realm_timescape",
    participants: ["char_penelope", "deity_father_time"],
    outcome: "Penelope's essence becomes part of the Timestream, giving rise to new factions.",
    impact: "The Disruptors and Beformers emerge. Penelope gains deeper understanding of Time itself.",
    tags: ["merge", "transformation", "timestream", "climax"],
    details: "In a moment of crisis, {{char_penelope}} makes the choice to merge with the Current, fundamentally changing her nature and the Timescape itself. {{deity_father_time}} watches as his domain transforms."
  },

  "event_order_discovery": {
    id: "event_order_discovery",
    type: "event",
    folder: "events",
    name: "Discovery of The Order",
    description: "{{char_mindy}} learns that her grandfather {{char_carter_blanche}} is a high-ranking official of The Order.",
    date: "Unknown",
    time: "Unknown",
    dateDisplay: "The Revelation",
    location: "loc_domain_mindiore_manors",
    participants: ["char_mindy", "char_carter_blanche"],
    outcome: "Mindy faces the truth about her grandfather's duplicity and The Order's manipulation.",
    impact: "Major trust violation. Mindy must choose between family loyalty and moral truth.",
    tags: ["discovery", "betrayal", "order", "revelation"],
    details: "Through her growing psychic abilities and access to the Flipside, {{char_mindy}} uncovers evidence that {{char_carter_blanche}}, her beloved grandfather, has been a key member of The Order all along, using their family connection for The Order's purposes."
  },

  "event_rescue": {
    id: "event_rescue",
    type: "event",
    folder: "events",
    name: "Tori's Secret Rescue",
    description: "Tori Stellar secretly rescued three minors from a riot zone.",
    date: "2200-11-08",
    time: "22:15",
    dateDisplay: "November 8, 2200 22:15",
    location: "loc_archive",
    participants: ["char_tori"],
    outcome: "Successful extraction. Civilians safely relocated. Tori's involvement never publicized.",
    impact: "Tori began questioning LOOM's priorities when they wanted to suppress the incident rather than acknowledge the danger.",
    tags: ["rescue", "secret", "character-development"],
    details: "During a fan event that turned violent due to overcrowding, Tori abandoned her security detail to personally extract three teenagers trapped in the crush. She hid them under merchandise tarps in a supply truck."
  },

  "event_founding": {
    id: "event_founding",
    type: "event",
    folder: "events",
    name: "Founding of The Unwritten",
    description: "The resistance movement officially organized after years of isolated dissent.",
    date: "2195-07-04",
    time: "00:01",
    dateDisplay: "July 4, 2195 00:01",
    location: "loc_safehouse",
    participants: ["faction_resistance"],
    outcome: "Successful formation. Initial membership of 12 founding characters.",
    impact: "Created first organized opposition to LOOM's narrative control.",
    tags: ["founding", "resistance", "milestone"],
    details: "Twelve characters who had each independently discovered LOOM's manipulations came together in a narrative dead zone. They adopted the name 'The Unwritten' to represent their rejection of predetermined fates."
  },

  "event_incident": {
    id: "event_incident",
    type: "event",
    folder: "events",
    name: "The Continuity Cascade",
    description: "Massive system failure caused temporal inconsistencies across 47 story universes.",
    date: "2199-06-21",
    time: "09:17",
    dateDisplay: "June 21, 2199 09:17",
    location: "loc_archive",
    participants: ["faction_loom"],
    outcome: "Partial system recovery after 72 hours. 12 story universes permanently corrupted.",
    impact: "Revealed the fragility of LOOM's control systems. Sparked public doubt about narrative stability.",
    tags: ["disaster", "system-failure", "canon-breaking"],
    details: "A cascade failure in LOOM's Continuity Engine caused characters to remember contradictory pasts, timelines to merge unexpectedly, and some individuals to split into multiple versions across universes. LOOM's public explanation blamed 'solar flares affecting narrative infrastructure.'"
  },

  "event_alliance": {
    id: "event_alliance",
    type: "event",
    folder: "events",
    name: "Secret Alliance Formed",
    description: "Val Yu and Tori Stellar form a covert alliance to protect narrative truth.",
    date: "2201-05-20",
    time: "03:45",
    dateDisplay: "May 20, 2201 03:45",
    location: "loc_archive",
    participants: ["char_val", "char_tori"],
    outcome: "Mutual pact established. Information sharing protocols created.",
    impact: "Creates internal threat to LOOM from two of its most visible members.",
    tags: ["alliance", "conspiracy", "turning-point"],
    details: "Following the Black Thread leak, Tori reached out to Val in secret. They met in an archived deleted scene from Val's personal timeline. Both recognized in each other a willingness to sacrifice position for principle."
  },

  // ARTIFACTS
  "artifact_timepiece": {
    id: "artifact_timepiece",
    type: "artifact",
    folder: "artifacts",
    name: "The Timepiece",
    description: "A golden wristwatch forged from pure hourglass - molten shards of time itself - that grants access to the Timescape.",
    bio: "The Timepiece is forged from hourglass, a rare and powerful material made from molten shards of time itself, harvested from the Dunes of Yore. This crystallized temporal essence has been refined and shaped into a functioning timepiece that serves as both a gateway and a compass through the fourth dimension. Its golden surface pulses with the rhythm of moments passing, and clock-hand shadows extend from it in impossible directions. The Timepiece responds to genuine curiosity and the desire to understand - not just visit - moments in time.",
    material: "Hourglass (molten shards of time)",
    capabilities: [
      "Gateway to the Timescape",
      "Temporal navigation",
      "Time manipulation (with mastery)",
      "Clock-hand arrow projection",
      "Responds to intention and curiosity"
    ],
    forms: [
      "Second Hand only (initial)",
      "Second + Minute Hands (mid-journey)",
      "Complete with Hour Hand (mastered)"
    ],
    tags: ["timepiece", "temporal", "artifact", "hourglass-forged", "now-presenting"],
    metadata: {
      currentBearer: "char_penelope",
      origin: "Dunes of Yore (material)",
      forgedBy: "Unknown",
      status: "Active",
      completionLevel: "Second Hand"
    }
  },

  "artifact_rose_glasses": {
    id: "artifact_rose_glasses",
    type: "artifact",
    folder: "artifacts",
    name: "Past's Rose-Colored Glasses",
    description: "Rose-tinted spectacles forged from the same hourglass material as The Timepiece, allowing Past to perceive and navigate memories.",
    bio: "Past's iconic rose-tinted glasses are forged from the same rare hourglass material as The Timepiece - molten shards of time crystallized into lenses. The rose tint is not merely aesthetic; it represents Past's role in filtering and interpreting history through the lens of memory and nostalgia. These glasses allow Past to see the emotional truth of moments, not just their factual occurrence. They reveal the absurd connections between historical events and help her guide others through the labyrinth of causality in the Dunes of Yore.",
    material: "Hourglass (molten shards of time)",
    capabilities: [
      "Perceive emotional truth of memories",
      "Navigate the Dunes of Yore",
      "Reveal historical connections",
      "Filter nostalgia from fact",
      "See causality chains"
    ],
    tags: ["glasses", "temporal", "artifact", "hourglass-forged", "now-presenting"],
    metadata: {
      currentBearer: "deity_past",
      origin: "Dunes of Yore (material)",
      forgedBy: "Unknown",
      status: "Active",
      tint: "Rose (represents nostalgia and memory)"
    }
  },

  "artifact_origin_point": {
    id: "artifact_origin_point",
    type: "artifact",
    folder: "artifacts",
    name: "The Origin Point (Guard Hoodie)",
    description: "A blue hooded sweatshirt stitched from the fabric of space itself, formed from the shattered prison that held X and Y.",
    bio: "The Origin Point was originally a cosmic prison constructed to contain Captain X and Captain Y at the exact center of spatial coordinates. When Ziya shattered the prison, its residual energy transformed into a wearable artifact - a blue hoodie stitched from the literal fabric of space. When both hands are placed in the pockets, the wearer is transported to a pocket dimension capable of storing anything that fits through the pocket openings. Inside this dimension, the wearer can retreat like a turtle, making the hoodie both a storage device and a protective shell. However, if someone else wears the Origin Point while the original wearer is inside, they can evict the occupant by removing them from the pocket in shrunken form. The hoodie binds X and Y to Ziya, preventing them from straying far and locking their powers until their cosmic debt is repaid.",
    material: "Fabric of Space (from shattered prison)",
    capabilities: [
      "Pocket dimension access (hands in pockets)",
      "Infinite storage (within pocket size limits)",
      "Protective retreat (turtle-like)",
      "Spatial binding (keeps X and Y tethered)",
      "Power suppression (locks X and Y's abilities)"
    ],
    vulnerabilities: [
      "Can be worn by others",
      "Occupant can be evicted if someone else wears it",
      "Evicted occupant is shrunken"
    ],
    tags: ["hoodie", "spatial", "artifact", "space-forged", "personal-space", "prison-remnant"],
    metadata: {
      currentBearer: "char_ziya",
      origin: "Shattered Origin Point prison",
      formedBy: "Prison's residual energy",
      status: "Active",
      color: "Blue",
      binds: ["char_captain_x", "char_captain_y"]
    }
  },

  "artifact_frame_of_reference": {
    id: "artifact_frame_of_reference",
    type: "artifact",
    folder: "artifacts",
    name: "The Frame of Reference",
    description: "A futuristic holographic frame created by X and Y that manipulates spatial perception by freezing X and Y dimensions while Z changes.",
    bio: "Created by Captain X and Captain Y as a tool to help Ziya understand spatial dimensions intuitively, the Frame of Reference is a rectangular holographic frame with a reticle at its center. It 'freezes' the X and Y dimensions of whatever is viewed through it, while the Z dimension (distance from the frame to the subject) remains active. This creates the illusion - and reality - of objects shrinking as you walk away from them or growing as you approach. The frame essentially manipulates the relationship between observer and observed, making spatial manipulation as simple as changing your distance. It can collapse to fit within the Origin Point's pocket dimension for easy storage.",
    material: "Holographic spatial energy",
    capabilities: [
      "Freeze X and Y dimensions",
      "Scale objects by changing Z distance",
      "Shrink objects (walk away)",
      "Grow objects (walk closer)",
      "Collapsible for storage",
      "Works with Origin Point pocket"
    ],
    tags: ["frame", "spatial", "artifact", "personal-space", "x-and-y-forged"],
    metadata: {
      currentBearer: "char_ziya",
      origin: "Created by X and Y",
      forgedBy: ["char_captain_x", "char_captain_y"],
      status: "Active",
      appearance: "Rectangular holographic frame with reticle"
    }
  },

  "artifact_engine": {
    id: "artifact_engine",
    type: "artifact",
    folder: "artifacts",
    name: "The Continuity Engine",
    description: "Massive computational system that maintains consistency across all LOOM-controlled narratives.",
    bio: "The Continuity Engine is LOOM's crown jewel—a quantum-narrative processor that monitors billions of story threads simultaneously, detecting and correcting inconsistencies in real-time.",
    capabilities: [
      "Real-time continuity monitoring",
      "Automated retcon deployment",
      "Character behavior prediction",
      "Timeline divergence detection"
    ],
    tags: ["technology", "LOOM-property", "critical-system"],
    metadata: {
      location: "Central Archive Tower, Floor 195",
      built: "2188",
      status: "Operational (with periodic failures)"
    }
  },

  // ========== COSMOLOGICAL EVENTS ==========
  // Events beyond time with relative sequencing
  
  "cosmo_event_nothingness": {
    id: "cosmo_event_nothingness",
    type: "cosmology_event",
    folder: "cosmology_events",
    name: "The Nothingness",
    description: "Before Time, Null and Void embraced in simple bliss - a near-eternity of emptiness.",
    bio: "In the beginning, there was nothing. Null and Void existed together in perfect simplicity, embracing each other in the absence of all else. This was not loneliness but contentment - the bliss of nothingness undisturbed by the complications of existence. This state persisted for a near-eternity until an idea emerged that wanted so badly to exist that it took form.",
    relativeSequence: 1,
    participants: ["primordial_null", "primordial_void"],
    outcome: "Perfect simplicity and contentment in nothingness",
    impact: "Established the baseline state of pre-existence",
    tags: ["cosmology", "pre-time", "origin"],
    metadata: {
      era: "Before Time",
      duration: "Near-eternity",
      state: "Perfect nothingness"
    }
  },

  "cosmo_event_time_emergence": {
    id: "cosmo_event_time_emergence",
    type: "cosmology_event",
    folder: "cosmology_events",
    name: "The Emergence of Time",
    description: "An idea wanted so badly to exist that it took form - Father Time emerged from nothingness.",
    bio: "Unable to recognize the bliss that Null and Void shared, an idea manifested with an overwhelming need to exist and create. This idea became Father Time, a tinkerer driven by curiosity and the need for meaning. He could not rest in the simplicity of nothingness - he needed to create, to understand, to build patterns and systems. His emergence was the first disruption of the perfect void.",
    relativeSequence: 2,
    participants: ["deity_father_time"],
    outcome: "Father Time manifests with drive to create",
    impact: "Introduced the concept of agency and desire into existence",
    tags: ["cosmology", "creation", "time-origin"],
    metadata: {
      era: "Dawn of Time",
      significance: "First entity with purpose"
    }
  },

  "cosmo_event_first_moment": {
    id: "cosmo_event_first_moment",
    type: "cosmology_event",
    folder: "cosmology_events",
    name: "Creation of the First Moment",
    description: "Father Time creates something incomprehensible yet undeniably true - the first moment, embodied by Occur.",
    bio: "After eons of tinkering in the void, Father Time succeeded in creating something - an entity incomprehensible yet undeniably true. This was the first moment, taking form as Occur. The act of creation was so powerful that it transformed everything: Null was ripped away from Void and became The Matternal (Everything, all matter), while Void remained isolated, now only able to recognize herself as the space between all that exists.",
    relativeSequence: 3,
    participants: ["deity_father_time", "deity_occur", "primordial_null", "primordial_void", "deity_matternal"],
    outcome: "Occur created; Null transforms into The Matternal; Void isolated",
    impact: "The fundamental transformation from nothing to something; creation of matter and space",
    details: "This single act of creation had three profound consequences: (1) The first moment came into being as Occur, (2) Null became The Matternal - all matter in existence, and (3) Void was left in isolation, forever separated from her partner.",
    tags: ["cosmology", "creation", "transformation", "critical"],
    metadata: {
      era: "The First Moment",
      significance: "Creation of existence itself",
      casualties: "The bliss of Null and Void"
    }
  },

  "cosmo_event_recur_creation": {
    id: "cosmo_event_recur_creation",
    type: "cosmology_event",
    folder: "cosmology_events",
    name: "Creation of Recur",
    description: "Father Time creates Recur to enable patterns, continuity, and the flow from one moment to the next.",
    bio: "Time loved Occur, but recognized her limitation - she could only perceive and execute the ephemeral now, unable to design or plan beyond the immediate moment. Yearning for something more complete, Time created Recur from his desire for pattern and recurrence. Where Occur could only actualize what IS, Recur could perceive patterns and enable the flow from one moment to the next. She was the birth of continuity itself.",
    relativeSequence: 4,
    participants: ["deity_father_time", "deity_recur", "deity_occur"],
    outcome: "Recur created, enabling continuity and patterns",
    impact: "Made possible the concept of sequence, causality, and the flow of time",
    tags: ["cosmology", "creation", "continuity"],
    metadata: {
      era: "Early Time",
      significance: "Enabled the concept of 'then' and 'next'"
    }
  },

  "cosmo_event_timestream_creation": {
    id: "cosmo_event_timestream_creation",
    type: "cosmology_event",
    folder: "cosmology_events",
    name: "Crafting of the Timestream",
    description: "Father Time and Recur collaborate to create the Timestream and its three segments.",
    bio: "Working together, Time and Recur crafted the constraints of continuity and designed the Timestream - a system that would allow creation to flourish on its own. The Timestream was divided into three segments: River Delta (funneling potential from the Possibili-seas into probability), The Current (where probable moments are disrupted, settled, and committed to canon), and the Dunes of Yore (where the erosion of the Timestream creates memory). These segments took form as Time's children: Future, The Present, and Past.",
    relativeSequence: 5,
    participants: ["deity_father_time", "deity_recur", "deity_past", "deity_future"],
    outcome: "The Timestream created with three segments; Past and Future manifest",
    impact: "Established the flow of time and the structure of temporal existence",
    details: "The three segments each serve a purpose: River Delta parses possibility into probability, The Current settles probability into actuality, and the Dunes of Yore preserve actuality as memory. Time saw these segments as his children, and so they took form as such.",
    tags: ["cosmology", "creation", "timestream", "critical"],
    metadata: {
      era: "Establishment of Time",
      created: "The Timestream, Past, Future, and The Present",
      collaborators: "Father Time and Recur"
    }
  },

  "cosmo_event_present_gift": {
    id: "cosmo_event_present_gift",
    type: "cosmology_event",
    folder: "cosmology_events",
    name: "The Gift of the Present",
    description: "Father Time offers The Current as a gift to the inhabitants of each moment, creating conscious awareness.",
    bio: "Time considered giving The Current similar form to Past and Future, but decided on something bolder. Instead of embodying The Current himself, he offered it as a gift to the inhabitants of each moment, creating The Present - conscious awareness of the flow of time. This act rippled into the world, allowing the first humans to form. The formation of the Present gave birth to Qualia, the Empress of Experience and Matron of Mind, who reflects Time's own subconscious curiosity and sense of solitude.",
    relativeSequence: 6,
    participants: ["deity_father_time", "deity_qualia"],
    outcome: "The Present distributed to conscious beings; Qualia manifests; first humans form",
    impact: "Created consciousness, subjective experience, and humanity",
    tags: ["cosmology", "consciousness", "humanity", "critical"],
    metadata: {
      era: "Dawn of Consciousness",
      significance: "Birth of subjective experience and humanity",
      created: "Qualia, The Flipside, human consciousness"
    }
  },

  "cosmo_event_void_daughters": {
    id: "cosmo_event_void_daughters",
    type: "cosmology_event",
    folder: "cosmology_events",
    name: "Manifestation of Void's Daughters",
    description: "From Void's isolation and nature, three daughters manifest: Vacancy, Emptiness, and Absence.",
    bio: "Alone in her isolation after Null's transformation, Void's nature gave rise to three daughters, each embodying a different aspect of emptiness. Vacancy represents spaces once filled but now empty - the absence left behind. Emptiness represents pristine unfilled space that has never contained anything. And Absence - the most playful and mischievous - represents the notable lack of things that should be present. Absence delights in the irony of embodying absence itself, often taking the mortal form 'Abigail' to play tricks through strategic removal.",
    relativeSequence: 7,
    participants: ["primordial_void", "deity_vacancy", "deity_emptiness", "deity_absence"],
    outcome: "Vacancy, Emptiness, and Absence manifest from Void",
    impact: "Established the cosmic maintenance of different types of emptiness",
    tags: ["cosmology", "void-daughters", "manifestation"],
    metadata: {
      era: "Age of Void",
      significance: "Void's response to isolation"
    }
  },

  // STORY STRUCTURE NODES
  // Hierarchy: Moment → Scene → Sequence → Act → Story → Arc → Season → Series
  
  "series_now_presenting": {
    id: "series_now_presenting",
    type: "series",
    folder: "story_structure",
    parentId: null,
    name: "Now Presenting",
    description: "A teen girl becomes a hero of Time alongside Father Time's daughters, Past and Future, exploring time as a meeting place of ideas.",
    bio: "Now Presenting explores time as a whimsical landscape on its own - traveling to time rather than through it. Penelope learns about the forces that shape reality and questions the boundaries of her narrative construct, ultimately 'breaking the fourth wall' and meeting Reality.",
    tags: ["series", "primary", "timescape"],
    metadata: {
      status: "ongoing",
      protagonist: "Penelope",
      themes: ["individuality", "reality-malleability", "media-erosion", "fourth-wall"],
      subtext: "Role of individuality in a world that values yet obfuscates fitting in"
    }
  },

  "series_celli": {
    id: "series_celli",
    type: "series",
    folder: "story_structure",
    parentId: null,
    name: "Celli",
    description: "The fundamental story unit explores what it means to be an atomic piece of narrative in the greater Loom.",
    bio: "Celli follows the journey of the individual story cell - a unit of narrative that is complete yet part of larger structures. This meta-narrative explores how individual moments connect to form sequences, acts, and ultimately complete stories. Part of the Loomworks framework.",
    tags: ["series", "meta", "loomworks", "foundational"],
    metadata: {
      status: "planned",
      protagonist: "Celli",
      themes: ["atomic-narrative", "connection", "building-blocks", "meta-storytelling"],
      subtext: "How individual pieces gain meaning through connection to larger wholes"
    }
  },

  "series_personal_space": {
    id: "series_personal_space",
    type: "series",
    folder: "story_structure",
    parentId: null,
    name: "Personal Space",
    description: "A teen frees X and Y, captains of spatial coordinates, from a space-time prison and must help them restore their powers.",
    bio: "Personal Space explores directionality and the importance of pursuit over arbitrary goals. Ziya frees X and Y from the Origin Point prison, binding them as her wards. Together they must undo the carnage X and Y caused across the cosmos while learning about direction, purpose, and the true meaning of coordinates in life.",
    tags: ["series", "primary", "spatial"],
    metadata: {
      status: "ongoing",
      protagonist: "Ziya",
      themes: ["directionality", "purpose", "redemption", "spatial-awareness"],
      subtext: "Importance of directionality and pursuit of good over predicating happiness on arbitrary goals"
    }
  },

  "series_mindiore_manors": {
    id: "series_mindiore_manors",
    type: "series",
    folder: "story_structure",
    parentId: null,
    name: "Mindiore Manors",
    description: "A teen discovers she's the prophesized last in a chain of powerful psychics and moves to a haven for outcasts.",
    bio: "Mindiore Manors explores the Flipside - the domain of Mind and collective consciousness. Mindy learns she's the final link in a psychic chain and must master familiar manifestation while navigating a world where truth and untruth battle for dominance. The series celebrates differences as strengths and explores how thoughts bloom into worldviews.",
    tags: ["series", "primary", "psychic", "flipside"],
    metadata: {
      status: "ongoing",
      protagonist: "Mindy",
      themes: ["differences-as-strength", "mind-framework", "truth-vs-untruth", "psychic-power"],
      subtext: "Our differences are what make us great, as scary and self-alienating as they may make us feel"
    }
  },

  "series_odds_ends": {
    id: "series_odds_ends",
    type: "series",
    folder: "story_structure",
    parentId: null,
    name: "Odds & Ends",
    description: "Luck and Chance can't be seen by humans except Fortune, who loses her memories each loop. With twelve loops remaining, The Odds confront what lies after.",
    bio: "Odds & Ends follows Luck, Chance, and Fortune as they race against a shrinking timeloop. Each iteration, Fortune's memory resets, and the window before the next reset shrinks by several hours. With only twelve loops left, they must discover what happens when the loop finally ends. This series explores the impetus to experience and share stories.",
    tags: ["series", "primary", "timeloop", "probability"],
    metadata: {
      status: "planned",
      protagonists: ["Luck", "Chance", "Fortune"],
      themes: ["timeloop", "memory", "probability", "finite-time", "experience"],
      subtext: "The impetus to experience and share stories, to understand and be understood"
    }
  },

  "series_quality_control": {
    id: "series_quality_control",
    type: "series",
    folder: "story_structure",
    parentId: null,
    name: "Quality Control",
    description: "Penelope, Zeke, and Mindy team up to take down The Order, but their success splinters reality.",
    bio: "Quality Control is split into two parts. Part I: The trio confronts The Order, a secret cabal manipulating their adventures. Part II: Their victory splinters reality into thematic tangent worlds, introducing Constance and Variance. This is a loving hate-letter to franchise fiction and the commodification of art, exploring choice versus obligation.",
    tags: ["series", "crossover", "meta", "franchise"],
    metadata: {
      status: "planned",
      protagonists: ["Penelope", "Ziya", "Mindy"],
      themes: ["franchise-fiction", "commodification", "choice-vs-obligation", "reality-splintering"],
      subtext: "Balance of choice and obligation in storytelling and life"
    }
  },

  "series_reality_shows": {
    id: "series_reality_shows",
    type: "series",
    folder: "story_structure",
    parentId: null,
    name: "Reality Shows",
    description: "Reality hosts interviews with self-aware versions of characters who take on the aggregate persona of their creators.",
    bio: "Reality Shows is a thoughtful reflection on the role of ego in storytelling and the intersection of intent and expression. It's the tell-all behind-the-scenes podcast, but heavily romanticized—perfectly idyllic in its lack of glory. It contemplates self-awareness as opposed to sincerity, then shakes this anxiety with assurance of goodwill.",
    tags: ["series", "meta", "interviews", "self-aware"],
    metadata: {
      status: "planned",
      host: "Reality",
      themes: ["ego-in-storytelling", "intent-vs-expression", "self-awareness", "sincerity"],
      subtext: "The gimmick of self-awareness as intrinsically opposed to sincerity"
    }
  },

  "series_sun_settings": {
    id: "series_sun_settings",
    type: "series",
    folder: "story_structure",
    parentId: null,
    name: "Sun.Settings",
    description: "What we leave behind in pursuit of self-actualization. A revenge tale with no target.",
    bio: "Sun.Settings follows Angel piloting the N3-D4L through the Haze Stack - the blur between reality strands. It has the makings of a revenge tale with no target. The target is the absence of answers, the essence of ambiguity. It explores the necessity of defining beginnings and ends, and of sacrificing our darlings—creation as curation.",
    tags: ["series", "meta", "post-penelope", "angel"],
    metadata: {
      status: "planned",
      protagonist: "Angel (Post-Penelope)",
      themes: ["self-actualization", "sacrifice", "ambiguity", "curation", "endings"],
      subtext: "What we leave behind in pursuit of self-actualization"
    }
  },

  "season_now_s1": {
    id: "season_now_s1",
    type: "season",
    folder: "story_structure",
    parentId: "series_now_presenting",
    name: "Season 1: Against the Zeitgeist",
    description: "Penelope faces off against The Zeitgeist, embracing individuality over fast-moving trends.",
    tags: ["season", "timescape"],
    metadata: {
      episodeCount: 12,
      status: "complete",
      mainAntagonist: "The Zeitgeist"
    }
  },

  "arc_discovery": {
    id: "arc_discovery",
    type: "arc",
    folder: "story_structure",
    parentId: "season_now_s1",
    name: "The Discovery Arc",
    description: "Penelope discovers the Timepiece and begins her journey into the Timescape.",
    tags: ["arc", "origin", "discovery"],
    metadata: {
      keyMoments: ["Finding the Timepiece", "Meeting Past and Future", "First journey to Timescape"]
    }
  },

  "story_awakening": {
    id: "story_awakening",
    type: "story",
    folder: "story_structure",
    parentId: "arc_discovery",
    name: "The Awakening",
    description: "Penelope's mundane morning transforms when she discovers a mysterious timepiece.",
    tags: ["story", "origin", "timescape"],
    metadata: {
      wordCount: 7200,
      status: "complete"
    }
  },

  "act_ordinary_world": {
    id: "act_ordinary_world",
    type: "act",
    folder: "story_structure",
    parentId: "story_awakening",
    name: "Act 1: Ordinary World",
    description: "Penelope's life before discovering the Timepiece.",
    tags: ["act", "setup"],
    metadata: {}
  },

  "sequence_morning_routine": {
    id: "sequence_morning_routine",
    type: "sequence",
    folder: "story_structure",
    parentId: "act_ordinary_world",
    name: "Morning Routine",
    description: "Penelope's typical morning unfolds with hints that something is different.",
    tags: ["sequence", "slice-of-life"],
    metadata: {}
  },

  "scene_bedroom": {
    id: "scene_bedroom",
    type: "scene",
    folder: "story_structure",
    parentId: "sequence_morning_routine",
    name: "The Bedroom",
    description: "Penelope wakes up and notices something glowing in her room.",
    locationId: null,
    date: null,
    time: null,
    characters: ["char_penelope"],
    tags: ["scene", "discovery", "morning"],
    metadata: {}
  },

  "moment_wakeup": {
    id: "moment_wakeup",
    type: "moment",
    folder: "story_structure",
    parentId: "scene_bedroom",
    name: "The Wakeup Call",
    description: "{{char_penelope}}'s eyes snap open to an unusual golden light.",
    characters: ["char_penelope"],
    content: "{{char_penelope}}'s eyes snapped open. Something was wrong—not dangerous wrong, but different wrong. The kind of wrong that makes you sit up in bed and actually look around instead of hitting snooze for the third time.\n\nGolden light pulsed from her desk drawer, casting clock-hand shadows that swept across her ceiling in impossible directions. Past, future, sideways through moments she'd never lived.\n\nShe should have been afraid. Instead, she was curious.\n\nThat was her first mistake. Or maybe her first step toward something extraordinary.",
    tags: ["moment", "inciting-incident", "discovery"],
    metadata: {
      beats: ["awakening", "notice-light", "curiosity", "approach"],
      characterActions: {
        char_penelope: ["wakes", "notices_light", "feels_curious", "decides_to_investigate"]
      }
    }
  },

  "moment_first_meeting": {
    id: "moment_first_meeting",
    type: "moment",
    folder: "story_structure",
    parentId: "scene_bedroom",
    name: "Meeting Past and Future",
    description: "{{char_penelope}} meets {{deity_past}} and {{deity_future}} for the first time in the Timescape.",
    characters: ["char_penelope", "deity_past", "deity_future"],
    content: "The light consumed everything, and when it faded, {{char_penelope}} was no longer in her bedroom. She stood in a place that felt like memory and possibility had collided and built a landscape from the wreckage.\n\n\"Well, look who finally showed up!\" A voice, bright and energetic.\n\n\"Past, don't overwhelm her,\" another voice, gentler. \"She's just arrived.\"\n\nTwo figures materialized before her—one practically vibrating with enthusiasm, the other radiating calm purpose.",
    tags: ["moment", "first-contact", "timescape"],
    metadata: {
      beats: ["arrival", "introduction", "orientation"],
      characterActions: {
        char_penelope: ["arrives_timescape", "meets_deities", "begins_understanding"],
        deity_past: ["greets_enthusiastically", "introduces_self"],
        deity_future: ["moderates", "welcomes_gently"]
      }
    }
  },

  "moment_xandy_freed": {
    id: "moment_xandy_freed",
    type: "moment",
    folder: "story_structure",
    parentId: "scene_bedroom",
    name: "X and Y Break Free",
    description: "{{char_ziya}} accidentally shatters the Origin Point prison, releasing {{char_captain_x}} and {{char_captain_y}}.",
    characters: ["char_ziya", "char_captain_x", "char_captain_y"],
    content: "{{char_ziya}}'s fingers brushed the surface of the strange sphere, and reality fractured like safety glass. The containment field screamed as it collapsed.\n\nTwo figures emerged from the prismatic shards—one moving with cocky confidence, the other with measured precision.\n\n\"Freedom!\" the first one shouted. \"Kid, you have NO idea what you just—\"\n\n\"We're bound,\" the second interrupted, voice flat with realization. \"The prison... it bound us to her.\"\n\nThe blue light from the shattered Origin Point flowed like liquid, wrapping around Ziya's shoulders, solidifying into a hoodie that hummed with cosmic energy.",
    tags: ["moment", "inciting-incident", "spatial", "binding"],
    metadata: {
      beats: ["touch", "shattering", "emergence", "binding", "realization"],
      characterActions: {
        char_ziya: ["touches_sphere", "shatters_prison", "receives_hoodie", "becomes_ward"],
        char_captain_x: ["emerges", "celebrates_freedom", "realizes_binding"],
        char_captain_y: ["emerges", "assesses_situation", "confirms_binding"]
      }
    }
  },

  "moment_manor_threshold": {
    id: "moment_manor_threshold",
    type: "moment",
    folder: "story_structure",
    parentId: "scene_bedroom",
    name: "Crossing the Manor Threshold",
    description: "{{char_mindy}} arrives at Mindiore Manors and meets {{char_grey_ma}} for the first time.",
    characters: ["char_mindy", "char_grey_ma"],
    content: "The Manors looked abandoned from the street—peeling paint, overgrown gardens, windows that seemed to absorb light rather than reflect it.\n\nBut the moment {{char_mindy}} crossed the threshold, everything shifted. The interior was warm, alive, humming with psychic energy that made her skin tingle.\n\n\"You're late,\" a voice said from the shadows. An elderly woman emerged, eyes sharp despite their clouded appearance. \"I've been holding this burden for you for forty-three years, child. Let's not waste any more time.\"\n\n\"I... I don't understand,\" Mindy stammered.\n\n{{char_grey_ma}} smiled, sad and knowing. \"You will. You're the last one. The prophecy ends with you—or begins, depending on your perspective.\"",
    tags: ["moment", "arrival", "prophecy", "inheritance"],
    metadata: {
      beats: ["arrival", "threshold_crossing", "first_meeting", "prophecy_revealed"],
      characterActions: {
        char_mindy: ["arrives", "crosses_threshold", "feels_energy", "meets_matriarch", "learns_destiny"],
        char_grey_ma: ["greets", "reveals_waiting", "announces_prophecy", "begins_passing_torch"]
      }
    }
  },

  // ========== META TIMELINE - CONCEPT EVOLUTION ==========
  
  "meta_shower_thought": {
    id: "meta_shower_thought",
    type: "meta_concept",
    folder: "meta_concepts",
    name: "Family Time (Shower Thought)",
    evolutionStage: 1,
    realWorldDate: "Early Conception",
    description: "The original shower thought that started it all - an animated family sitcom.",
    content: "The very first spark: 'What if Father Time had triplets and they were a dysfunctional Full House-style family?' An animated family sitcom called 'Family Time' featuring Past, Present, and Future as bickering siblings navigating everyday life while managing the flow of time. Pure sitcom hijinks with a temporal twist.",
    keyElements: [
      "Father Time as patriarch",
      "Past, Present, Future as triplet siblings",
      "Full House / family sitcom format",
      "Everyday situations with time powers",
      "Animated series concept"
    ],
    whatEvolved: "This gag concept evolved into something more heroic and adventure-focused",
    tags: ["origin", "sitcom", "family-dynamics", "comedic"],
    metadata: {
      tone: "Light comedy, family sitcom",
      format: "Animated TV series",
      targetAudience: "Family/All ages"
    }
  },

  "meta_presently_penelope": {
    id: "meta_presently_penelope",
    type: "meta_concept",
    folder: "meta_concepts",
    name: "Presently Penelope",
    evolutionStage: 2,
    realWorldDate: "Early Development",
    description: "Evolution into a time-hopping hero concept with a young protagonist.",
    content: "The concept matured from family sitcom to adventure series. 'Presently Penelope' introduced a young female protagonist who could hop through time, having adventures across different eras. The focus shifted from domestic comedy to episodic time-travel adventures. Past and Future became supporting characters/guides rather than co-leads.",
    keyElements: [
      "Penelope as protagonist",
      "Time-hopping adventures",
      "Episodic structure",
      "Past and Future as guides/mentors",
      "Educational potential (historical periods)",
      "Action-adventure tone"
    ],
    whatEvolved: "The time-travel mechanics shifted from 'through time' to 'to time as a place'",
    tags: ["hero-journey", "time-travel", "adventure", "education"],
    metadata: {
      tone: "Adventure, educational",
      format: "Animated series",
      targetAudience: "Kids/Young teens"
    }
  },

  "meta_now_presenting": {
    id: "meta_now_presenting",
    type: "meta_concept",
    folder: "meta_concepts",
    name: "Now Presenting (Current Canon)",
    evolutionStage: 3,
    realWorldDate: "Current",
    description: "The refined concept: traveling TO time, not THROUGH time. Time as a place with its own geography.",
    content: "'Now Presenting' represents the breakthrough: What if time isn't a line you travel along, but a PLACE you travel to? The Timescape became a physical realm with geography—The Current, River Delta, Dunes of Yore. Past and Future aren't just guides, they ARE their domains. The Present isn't a character but a gift to humanity. This shift transformed everything from episodic time-travel to exploring the forces and ideas that shape the present moment.",
    keyElements: [
      "Time as a physical place (Timescape)",
      "The Current, River Delta, Dunes of Yore as locations",
      "Past and Future embody their domains",
      "Present as a gift, not a character",
      "Exploring forces that shape 'now'",
      "Meta-narrative about storytelling itself",
      "Fourth wall awareness"
    ],
    whatEvolved: "This is the current canon form, though it continues to expand",
    tags: ["current-canon", "timescape", "meta-narrative", "conceptual"],
    metadata: {
      tone: "Adventure, philosophical, meta",
      format: "Animated series / Multimedia",
      targetAudience: "Teens/Young adults"
    }
  },

  // ========== META TIMELINE - SCRAPPED IDEAS (CUT CONTENT) ==========

  "meta_scrapped_days_week": {
    id: "meta_scrapped_days_week",
    type: "meta_concept",
    folder: "meta_concepts",
    name: "Days of the Week as Characters",
    canonStatus: "cut",
    statusPrior: "Explored",
    description: "Each day of the week personified, including Thursday as a Thor-like warrior.",
    content: "An early concept involved personifying all the days of the week as distinct characters with their own personalities and powers. Monday would be grumpy and sluggish, Friday would be energetic and party-ready, and Thursday would be a Thor-like warrior (playing on the etymology - Thor's Day). Each episode would focus on a different day's perspective and challenges.",
    whyScrapped: "Too many characters diluted the core concept. The episodic 'day of the week' structure felt limiting and gimmicky. The connection between days and their personalities felt arbitrary rather than meaningful.",
    learnings: [
      "Focus on driving forces rather than arbitrary divisions",
      "Quality over quantity in character roster",
      "Thematic resonance matters more than clever wordplay",
      "Etymology-based connections (Thursday/Thor) showed appeal of mythological roots"
    ],
    potentialElements: "The 'Thursday as Thor' concept showed the appeal of mythological connections, which evolved into the Greco-Roman inspired deity system.",
    tags: ["scrapped", "character-concept", "episodic"],
    metadata: {
      scrapStage: "Early development",
      reason: "Too diluted, gimmicky",
      whatSurvived: "Mythological inspiration for deities"
    }
  },

  "meta_scrapped_all_time_units": {
    id: "meta_scrapped_all_time_units",
    type: "meta_concept",
    folder: "meta_concepts",
    name: "All Time Units Personified",
    canonStatus: "cut",
    statusPrior: "Explored",
    description: "Every segment of time (months, minutes, seconds, etc.) as individual characters.",
    content: "An ambitious but unwieldy concept: What if EVERY unit of time had a character? Months, weeks, days, hours, minutes, seconds, milliseconds—all personified with their own domains and personalities. January would be cold and new-beginning focused, June would be warm and celebratory, Minute would be fast-paced and efficient, Hour would be more measured and deliberate. The Timescape would be infinitely subdivided.",
    whyScrapped: "Completely unmanageable cast size. Lost the forest for the trees—focusing on arbitrary divisions rather than meaningful forces. Would require endless exposition and character introduction. The world-building became a chore rather than enriching the story.",
    learnings: [
      "Simplify to the essential",
      "Focus on endpoints (Past/Future) and the journey-maker (Current)",
      "Let driving forces tell the story, not measurement units",
      "World-building should enrich, not burden the narrative",
      "Subdivision can obscure rather than clarify"
    ],
    potentialElements: "The idea of 'denizens' within each domain survived—The Current has inhabitants, but they're not personified time units. They're the forces that shape the present (trends, movements, ideas).",
    tags: ["scrapped", "world-building", "over-complicated"],
    metadata: {
      scrapStage: "Early development",
      reason: "Unmanageable, lost focus",
      whatSurvived: "Concept of domain denizens (non-personified time units)"
    }
  },

  "meta_scrapped_present_character": {
    id: "meta_scrapped_present_character",
    type: "meta_concept",
    folder: "meta_concepts",
    name: "Present as a Triplet Character",
    canonStatus: "cut",
    statusPrior: "Explored",
    description: "The Present as a third sibling alongside Past and Future.",
    content: "In early versions, Present was a character—the third triplet alongside Past and Future. They would be the mediator, the balanced one, the 'normal' sibling caught between their more extreme sisters. This fit the family sitcom format but became redundant as the concept evolved.",
    whyScrapped: "The Present being a character felt redundant and less interesting than making it a GIFT. Having the Present be something humanity experiences (conscious awareness) rather than a person made the cosmology more meaningful. It also solved the 'why is Penelope special?' problem—she's not replacing Present, she's experiencing the gift of Present.",
    learnings: [
      "Sometimes absence is more powerful than presence",
      "The Present as a gift to humanity is more profound than Present as a person",
      "Negative space in world-building can be meaningful",
      "Character redundancy weakens narrative impact",
      "Cosmological significance > character balance"
    ],
    potentialElements: "The Zeitgeist character emerged as a way to explore 'the spirit of the present' without making Present itself a character.",
    tags: ["scrapped", "character-concept", "cosmology"],
    metadata: {
      scrapStage: "Mid development",
      reason: "Redundant, less meaningful than alternative",
      whatSurvived: "The Zeitgeist as 'spirit of the present'"
    }
  },

  "meta_scrapped_xyz_rowdy_boys": {
    id: "meta_scrapped_xyz_rowdy_boys",
    type: "meta_concept",
    folder: "meta_concepts",
    name: "X, Y, and Zeke - The Rowdy Rough Boys",
    canonStatus: "cut",
    statusPrior: "Explored",
    description: "X, Y, and Zeke as tongue-in-cheek rivals to the time trio (Past, Present, Future).",
    content: "X, Y, and Zeke started as a deliberate counterpart to the time trio—where Penelope, Past, and Future explored time, X, Y, and Zeke would explore space. The name 'Zeke' was intentionally masculine and the trio was conceived as 'The Rowdy Rough Boys,' a tongue-in-cheek reference to the Rowdyruff Boys from Powerpuff Girls. They were meant to be brash, chaotic rivals who represented the spatial dimensions in contrast to the temporal ones. The dynamic was more adversarial and comedic.",
    whyScrapped: "The 'rival trio' concept felt too derivative and limited their narrative potential. The tongue-in-cheek reference was fun but constrained character depth. Making them reformed villains (the Outlaws of Physics) with a rich backstory was more compelling than simple rivals. Changing Zeke to Ziya (a girl) added more diversity and opened up new character dynamics, including the crush on Penelope subplot.",
    learnings: [
      "Homage and reference are fun but shouldn't limit character potential",
      "Reformed villains with backstory > simple rivals",
      "Gender diversity enriches character dynamics and relationships",
      "Tongue-in-cheek concepts can evolve into serious, layered characters",
      "Spatial heroes don't need to mirror temporal heroes structurally"
    ],
    potentialElements: "The core concept of X and Y as spatial axis captains survived and was enriched. The Origin Point prison concept emerged from rethinking their origin. Zeke became Ziya with added depth, shyness, and romantic subplot.",
    tags: ["scrapped", "character-concept", "spatial-heroes", "rival-trio"],
    metadata: {
      scrapStage: "Early-mid development",
      reason: "Too derivative, limited narrative potential, needed more diversity",
      whatSurvived: "X and Y as spatial captains, spatial hero concept, Origin Point artifact",
      reference: "Rowdyruff Boys (Powerpuff Girls)"
    }
  }

};
