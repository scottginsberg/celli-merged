// ==================== ENHANCED AI EVALUATOR SYSTEM ====================
// Comprehensive parallelized generator with auto-queue, image generation, and aggregate evaluation
// Uses OpenAI GPT-5 API for all generation

// ========== GPT-5 API CONFIGURATION ==========
let openaiClient = null;

function initializeOpenAI() {
  const apiKey = localStorage.getItem('openai_api_key');
  if (!apiKey) {
    console.warn('OpenAI API key not configured');
    return false;
  }
  
  // Note: In browser, we'll need to proxy through a server for security
  // This is a placeholder for the client-side structure
  openaiClient = {
    apiKey: apiKey,
    model: 'gpt-5',
    endpoint: 'https://api.openai.com/v1/chat/completions'
  };
  
  return true;
}

async function callGPT5(prompt, options = {}) {
  if (!openaiClient) {
    if (!initializeOpenAI()) {
      throw new Error('OpenAI API key not configured. Please add your API key in the AI Evaluator settings.');
    }
  }
  
  const requestBody = {
    model: options.model || 'gpt-5',
    messages: [
      {
        role: 'system',
        content: options.systemPrompt || 'You are a creative writing assistant helping to develop a rich narrative universe.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: options.temperature || 0.8,
    max_tokens: options.maxTokens || 2000,
    stream: options.stream || false
  };
  
  try {
    const response = await fetch(openaiClient.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiClient.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`GPT-5 API Error: ${error.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return {
      text: data.choices[0].message.content,
      usage: data.usage,
      model: data.model
    };
  } catch (error) {
    console.error('GPT-5 API call failed:', error);
    throw error;
  }
}

async function callGPT5WithImages(prompt, images, options = {}) {
  if (!openaiClient) {
    if (!initializeOpenAI()) {
      throw new Error('OpenAI API key not configured');
    }
  }
  
  const content = [
    {
      type: 'input_text',
      text: prompt
    }
  ];
  
  // Add images
  images.forEach(imageUrl => {
    content.push({
      type: 'input_image',
      image_url: imageUrl
    });
  });
  
  const requestBody = {
    model: 'gpt-5',
    messages: [
      {
        role: 'user',
        content: content
      }
    ],
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 1500
  };
  
  try {
    const response = await fetch(openaiClient.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiClient.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`GPT-5 API Error: ${error.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return {
      text: data.choices[0].message.content,
      usage: data.usage
    };
  } catch (error) {
    console.error('GPT-5 API call with images failed:', error);
    throw error;
  }
}

async function callGPT5WithWebSearch(prompt, options = {}) {
  if (!openaiClient) {
    if (!initializeOpenAI()) {
      throw new Error('OpenAI API key not configured');
    }
  }
  
  const requestBody = {
    model: 'gpt-5',
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    tools: [
      { type: 'web_search' }
    ],
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 2000
  };
  
  try {
    const response = await fetch(openaiClient.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiClient.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`GPT-5 API Error: ${error.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return {
      text: data.choices[0].message.content,
      usage: data.usage,
      toolCalls: data.choices[0].message.tool_calls
    };
  } catch (error) {
    console.error('GPT-5 API call with web search failed:', error);
    throw error;
  }
}

// ========== STATE MANAGEMENT ==========
const aiState = {
  // Generation queue
  generationQueue: [],
  activeGenerations: [],
  completedGenerations: [],
  
  // Focus areas
  currentFocus: null,
  focusAreas: [
    { id: 'characters', name: 'Character Development', icon: '👤' },
    { id: 'locations', name: 'Location Expansion', icon: '🗺️' },
    { id: 'artifacts', name: 'Artifact Creation', icon: '⚡' },
    { id: 'moments', name: 'Story Moments', icon: '📖' },
    { id: 'arcs', name: 'Story Arcs', icon: '🌟' },
    { id: 'sequences', name: 'Sequences', icon: '🎬' },
    { id: 'dialogue', name: 'Dialogue', icon: '💬' },
    { id: 'images', name: 'Visual Assets', icon: '🎨' }
  ],
  
  // Under-developed tracking
  underDevelopedAreas: [],
  
  // Image generation
  imageQueue: [],
  imageStyles: [],
  selectedStyle: null,
  imageShotTypes: [
    { id: 'hero_shot', name: 'Hero Shot', desc: 'Dramatic, full-body character pose' },
    { id: 'selfie', name: 'Selfie', desc: 'Close-up, casual character portrait' },
    { id: 'turnaround', name: 'Turnaround', desc: 'Front, side, back reference views' },
    { id: 'action_shot', name: 'Action Shot', desc: 'Character in dynamic action pose' },
    { id: 'still_life', name: 'Still Life', desc: 'Artifact or location detail shot' },
    { id: 'character_moment', name: 'Character Moment', desc: 'Emotional scene capture' },
    { id: 'environment', name: 'Environment', desc: 'Location establishing shot' },
    { id: 'group_shot', name: 'Group Shot', desc: 'Multiple characters together' }
  ],
  
  // Aggregate evaluation
  pendingEvaluationBatch: [],
  evaluationHistory: []
};

// ========== AUTO-QUEUE ANALYSIS ==========
function analyzeUnderDevelopedAreas() {
  const analysis = [];
  
  // Analyze story structure depth
  const allSeries = Object.values(nodes).filter(n => n.type === 'series');
  allSeries.forEach(series => {
    const arcs = Object.values(nodes).filter(n => n.type === 'arc' && n.parentId === series.id);
    const stories = Object.values(nodes).filter(n => n.type === 'story' && arcs.some(a => a.id === n.parentId));
    const sequences = Object.values(nodes).filter(n => n.type === 'sequence' && stories.some(s => s.id === n.parentId));
    const scenes = Object.values(nodes).filter(n => n.type === 'scene' && sequences.some(seq => seq.id === n.parentId));
    const moments = Object.values(nodes).filter(n => n.type === 'moment' && scenes.some(sc => sc.id === n.parentId));
    
    const depth = {
      series: series.name,
      arcs: arcs.length,
      stories: stories.length,
      sequences: sequences.length,
      scenes: scenes.length,
      moments: moments.length
    };
    
    // Identify gaps
    if (arcs.length > 0 && stories.length === 0) {
      analysis.push({
        type: 'missing_stories',
        severity: 'high',
        area: series.name,
        message: `Series "${series.name}" has ${arcs.length} arc(s) but no stories`,
        suggestion: 'Generate story pitches for existing arcs',
        autoGenerate: true
      });
    }
    
    if (stories.length > 0 && sequences.length < stories.length * 3) {
      analysis.push({
        type: 'thin_sequences',
        severity: 'medium',
        area: series.name,
        message: `Series "${series.name}" needs more sequences (has ${sequences.length}, expected ~${stories.length * 3})`,
        suggestion: 'Generate beat sheets and sequences',
        autoGenerate: true
      });
    }
    
    if (sequences.length > 0 && moments.length < sequences.length * 5) {
      analysis.push({
        type: 'sparse_moments',
        severity: 'medium',
        area: series.name,
        message: `Series "${series.name}" needs more moments (has ${moments.length}, expected ~${sequences.length * 5})`,
        suggestion: 'Generate detailed moments for sequences',
        autoGenerate: true
      });
    }
  });
  
  // Analyze character coverage
  const allCharacters = Object.values(nodes).filter(n => n.type === 'character');
  allCharacters.forEach(char => {
    const charMoments = Object.values(nodes).filter(n => 
      n.type === 'moment' && n.characters && n.characters.includes(char.id)
    );
    
    if (charMoments.length < 3) {
      analysis.push({
        type: 'underdeveloped_character',
        severity: 'low',
        area: char.name,
        message: `Character "${char.name}" appears in only ${charMoments.length} moment(s)`,
        suggestion: 'Generate character-focused moments',
        autoGenerate: true
      });
    }
  });
  
  // Analyze location usage
  const allLocations = Object.values(nodes).filter(n => n.type === 'location');
  allLocations.forEach(loc => {
    const locMoments = Object.values(nodes).filter(n => 
      n.type === 'moment' && n.locationId === loc.id
    );
    
    if (locMoments.length === 0 && !loc.description) {
      analysis.push({
        type: 'unused_location',
        severity: 'low',
        area: loc.name,
        message: `Location "${loc.name}" is unused and undescribed`,
        suggestion: 'Generate location description and suggest scenes',
        autoGenerate: true
      });
    }
  });
  
  // Analyze artifact integration
  const allArtifacts = Object.values(nodes).filter(n => n.type === 'artifact');
  allArtifacts.forEach(artifact => {
    const artifactMentions = Object.values(nodes).filter(n => 
      n.type === 'moment' && n.content && n.content.includes(artifact.id)
    );
    
    if (artifactMentions.length === 0) {
      analysis.push({
        type: 'unused_artifact',
        severity: 'low',
        area: artifact.name,
        message: `Artifact "${artifact.name}" hasn't been integrated into story`,
        suggestion: 'Generate moments featuring this artifact',
        autoGenerate: true
      });
    }
  });
  
  aiState.underDevelopedAreas = analysis;
  return analysis;
}

// ========== CONTENT DENSIFIERS ==========
const contentDensifiers = {
  written: [
    { id: 'outline', name: 'Outline', order: 1, desc: 'High-level structure' },
    { id: 'beat_sheet', name: 'Beat Sheet', order: 2, desc: 'Key story beats' },
    { id: 'scene_breakdown', name: 'Scene Breakdown', order: 3, desc: 'Scene-by-scene details' },
    { id: 'dialogue_draft', name: 'Dialogue Draft', order: 4, desc: 'Character dialogue' },
    { id: 'prose_draft', name: 'Prose Draft', order: 5, desc: 'Full narrative prose' },
    { id: 'polish', name: 'Polish Pass', order: 6, desc: 'Refinement and style' }
  ],
  
  visual: [
    { id: 'concept_sketch', name: 'Concept Sketch', order: 1, desc: 'Rough visual concept' },
    { id: 'style_test', name: 'Style Test', order: 2, desc: 'Test different art styles' },
    { id: 'character_sheet', name: 'Character Sheet', order: 3, desc: 'Full character reference' },
    { id: 'environment_concept', name: 'Environment Concept', order: 4, desc: 'Location design' },
    { id: 'action_sequence', name: 'Action Sequence', order: 5, desc: 'Dynamic poses' },
    { id: 'final_render', name: 'Final Render', order: 6, desc: 'Polished final art' }
  ]
};

// ========== GENERATION FUNCTIONS ==========
async function generateContentForGap(gap) {
  const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const generation = {
    id: generationId,
    type: gap.type,
    area: gap.area,
    status: 'queued',
    createdAt: new Date().toISOString(),
    results: [],
    densifierStage: 1,
    totalStages: 6
  };
  
  aiState.generationQueue.push(generation);
  return generation;
}

async function processGenerationQueue() {
  // Process up to 3 generations in parallel
  const maxParallel = 3;
  const available = maxParallel - aiState.activeGenerations.length;
  
  if (available > 0 && aiState.generationQueue.length > 0) {
    const toProcess = aiState.generationQueue.splice(0, available);
    toProcess.forEach(gen => {
      aiState.activeGenerations.push(gen);
      processGeneration(gen);
    });
  }
}

async function processGeneration(generation) {
  generation.status = 'processing';
  
  // Simulate AI generation (replace with actual API calls)
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate content based on type
  let content = {};
  switch (generation.type) {
    case 'missing_stories':
      content = await generateStoryPitch(generation.area);
      break;
    case 'thin_sequences':
      content = await generateSequences(generation.area);
      break;
    case 'sparse_moments':
      content = await generateMoments(generation.area);
      break;
    case 'underdeveloped_character':
      content = await generateCharacterMoments(generation.area);
      break;
    case 'unused_location':
      content = await generateLocationContent(generation.area);
      break;
    case 'unused_artifact':
      content = await generateArtifactIntegration(generation.area);
      break;
  }
  
  generation.results.push(content);
  generation.status = 'completed';
  
  // Move to completed
  aiState.activeGenerations = aiState.activeGenerations.filter(g => g.id !== generation.id);
  aiState.completedGenerations.push(generation);
  
  // Add to pending evaluation batch
  aiState.pendingEvaluationBatch.push({
    generationId: generation.id,
    content: content,
    timestamp: new Date().toISOString()
  });
  
  // Continue processing queue
  processGenerationQueue();
}

// ========== GPT-5 GENERATION FUNCTIONS ==========
async function generateStoryPitch(seriesName) {
  const series = Object.values(nodes).find(n => n.name === seriesName && n.type === 'series');
  const seriesContext = series ? `Series: ${series.name}\nDescription: ${series.description}\nThemes: ${series.themes?.join(', ') || 'N/A'}` : '';
  
  const prompt = `Generate a compelling story pitch for the series "${seriesName}".

${seriesContext}

Provide:
1. A catchy title
2. A one-sentence logline
3. 3-5 core themes
4. Estimated length in sequences (typically 3-7)
5. Key story beats

Format as JSON with keys: title, logline, themes (array), estimatedLength, keyBeats (array)`;

  try {
    const response = await callGPT5(prompt, {
      systemPrompt: 'You are a creative story architect helping develop narrative arcs for the Loom universe, a metafictional exploration of storytelling itself.',
      temperature: 0.9
    });
    
    const parsed = JSON.parse(response.text);
    return {
      type: 'story',
      ...parsed,
      confidence: 8.5,
      generatedBy: 'gpt-5',
      usage: response.usage
    };
  } catch (error) {
    console.error('Story pitch generation failed:', error);
    return {
      type: 'story',
      title: `New Story for ${seriesName}`,
      logline: 'Generation failed - please try again',
      themes: [],
      estimatedLength: '5 sequences',
      confidence: 0,
      error: error.message
    };
  }
}

async function generateSequences(seriesName) {
  const prompt = `Generate 3-5 sequences for a story in the series "${seriesName}".

Each sequence should have:
- A descriptive title
- 3-5 key story beats
- Emotional arc (rising/falling tension)

Format as JSON with key: sequences (array of {title, beats, emotionalArc})`;

  try {
    const response = await callGPT5(prompt, {
      systemPrompt: 'You are a narrative structure expert for the Loom universe.',
      temperature: 0.85
    });
    
    const parsed = JSON.parse(response.text);
    return {
      type: 'sequence',
      count: parsed.sequences.length,
      ...parsed,
      confidence: 8.2,
      generatedBy: 'gpt-5',
      usage: response.usage
    };
  } catch (error) {
    console.error('Sequence generation failed:', error);
    return { type: 'sequence', count: 0, sequences: [], confidence: 0, error: error.message };
  }
}

async function generateMoments(seriesName) {
  const prompt = `Generate 5 compelling story moments for the series "${seriesName}".

Each moment should have:
- A title
- Content (2-3 sentences describing the scene)
- Characters involved (suggest from existing cast)
- Emotional tone

Format as JSON with key: moments (array of {title, content, characters, emotionalTone})`;

  try {
    const response = await callGPT5(prompt, {
      systemPrompt: 'You are a scene writer for the Loom universe, focusing on character-driven moments.',
      temperature: 0.9
    });
    
    const parsed = JSON.parse(response.text);
    return {
      type: 'moment',
      count: parsed.moments.length,
      ...parsed,
      confidence: 8.0,
      generatedBy: 'gpt-5',
      usage: response.usage
    };
  } catch (error) {
    console.error('Moment generation failed:', error);
    return { type: 'moment', count: 0, moments: [], confidence: 0, error: error.message };
  }
}

async function generateCharacterMoments(characterName) {
  const character = Object.values(nodes).find(n => n.name === characterName && n.type === 'character');
  const charContext = character ? `Character: ${character.name}\nBio: ${character.bio}\nTraits: ${character.traits?.join(', ')}` : '';
  
  const prompt = `Generate 3 defining moments for the character "${characterName}".

${charContext}

Each moment should:
- Reveal character depth
- Create growth opportunity
- Be emotionally resonant

Format as JSON with key: moments (array of {title, content, growthAxis, emotionalImpact})`;

  try {
    const response = await callGPT5(prompt, {
      systemPrompt: 'You are a character development specialist for the Loom universe.',
      temperature: 0.88
    });
    
    const parsed = JSON.parse(response.text);
    return {
      type: 'character_moment',
      character: characterName,
      ...parsed,
      confidence: 8.3,
      generatedBy: 'gpt-5',
      usage: response.usage
    };
  } catch (error) {
    console.error('Character moment generation failed:', error);
    return { type: 'character_moment', character: characterName, moments: [], confidence: 0, error: error.message };
  }
}

async function generateLocationContent(locationName) {
  const location = Object.values(nodes).find(n => n.name === locationName && n.type === 'location');
  const locContext = location ? `Location: ${location.name}\nCurrent description: ${location.description || 'None'}` : '';
  
  const prompt = `Expand the location "${locationName}" with rich details.

${locContext}

Provide:
- Vivid description (2-3 paragraphs)
- 5-7 notable features
- Atmospheric details (sounds, smells, lighting)
- 2-3 suggested scene setups

Format as JSON with keys: description, features (array), atmosphere, suggestedScenes (array of {title, setup})`;

  try {
    const response = await callGPT5(prompt, {
      systemPrompt: 'You are a world-building expert for the Loom universe, creating immersive locations.',
      temperature: 0.87
    });
    
    const parsed = JSON.parse(response.text);
    return {
      type: 'location_expansion',
      location: locationName,
      ...parsed,
      confidence: 8.4,
      generatedBy: 'gpt-5',
      usage: response.usage
    };
  } catch (error) {
    console.error('Location expansion failed:', error);
    return { type: 'location_expansion', location: locationName, description: '', features: [], confidence: 0, error: error.message };
  }
}

async function generateArtifactIntegration(artifactName) {
  const artifact = Object.values(nodes).find(n => n.name === artifactName && n.type === 'artifact');
  const artContext = artifact ? `Artifact: ${artifact.name}\nDescription: ${artifact.description}\nPowers: ${artifact.powers?.join(', ')}` : '';
  
  const prompt = `Create 3 story moments that integrate the artifact "${artifactName}" into the narrative.

${artContext}

Each moment should:
- Showcase the artifact's unique properties
- Create narrative tension
- Advance character or plot development

Format as JSON with key: moments (array of {title, content, artifactRole, narrativeImpact})`;

  try {
    const response = await callGPT5(prompt, {
      systemPrompt: 'You are a narrative integration specialist for the Loom universe.',
      temperature: 0.86
    });
    
    const parsed = JSON.parse(response.text);
    return {
      type: 'artifact_integration',
      artifact: artifactName,
      ...parsed,
      confidence: 8.1,
      generatedBy: 'gpt-5',
      usage: response.usage
    };
  } catch (error) {
    console.error('Artifact integration failed:', error);
    return { type: 'artifact_integration', artifact: artifactName, moments: [], confidence: 0, error: error.message };
  }
}

// ========== IMAGE GENERATION ==========
async function generateImageStyleTests(subject, count = 4) {
  const styles = [
    { id: 'anime', name: 'Anime Style', prompt: 'anime style, cel shaded' },
    { id: 'comic', name: 'Comic Book', prompt: 'comic book style, bold lines' },
    { id: 'realistic', name: 'Realistic', prompt: 'realistic, detailed' },
    { id: 'stylized', name: 'Stylized', prompt: 'stylized, modern illustration' }
  ];
  
  return styles.map(style => ({
    ...style,
    subject: subject,
    status: 'pending',
    imageUrl: null // Will be populated by actual generation
  }));
}

async function generateImageSet(character, shotTypes, style) {
  const images = [];
  
  for (const shotType of shotTypes) {
    const imageId = `img_${character.id}_${shotType.id}_${Date.now()}`;
    images.push({
      id: imageId,
      characterId: character.id,
      characterName: character.name,
      shotType: shotType.id,
      shotName: shotType.name,
      style: style,
      status: 'generating',
      filename: `${character.name.replace(/\s+/g, '_')}_${shotType.id}_${images.length + 1}.png`,
      prompt: `${character.description}, ${shotType.desc}, ${style.prompt}`,
      imageUrl: null
    });
  }
  
  return images;
}

// Export for use in main file
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    aiState,
    analyzeUnderDevelopedAreas,
    generateContentForGap,
    processGenerationQueue,
    generateImageStyleTests,
    generateImageSet,
    contentDensifiers
  };
}

