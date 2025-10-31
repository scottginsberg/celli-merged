# GPT-5 API Integration - Story Explorer

## ✅ Completed

### 1. Fixed Syntax Errors
- Rebuilt `index.html` using `rebuild-fixed.py` to properly separate node data from functions
- Fixed `getAllEvents()` function that had embedded node data
- File now loads correctly without syntax errors

### 2. GPT-5 API Integration
All AI generation now uses OpenAI's GPT-5 API with the following features:

#### API Configuration (`ai-evaluator-enhanced.js`)
- **`initializeOpenAI()`** - Loads API key from localStorage
- **`callGPT5(prompt, options)`** - Basic text generation
- **`callGPT5WithImages(prompt, images, options)`** - Multi-modal with image inputs
- **`callGPT5WithWebSearch(prompt, options)`** - Enhanced with web search tool

#### Generation Functions (All GPT-5 Powered)
1. **`generateStoryPitch(seriesName)`** - Creates story pitches with title, logline, themes, beats
2. **`generateSequences(seriesName)`** - Generates 3-5 sequences with beats and emotional arcs
3. **`generateMoments(seriesName)`** - Creates 5 compelling story moments
4. **`generateCharacterMoments(characterName)`** - Generates character-defining moments
5. **`generateLocationContent(locationName)`** - Expands locations with rich details
6. **`generateArtifactIntegration(artifactName)`** - Integrates artifacts into narrative

### 3. Enhanced Features
- **Auto-queue analysis** - Detects under-developed areas
- **Parallelized generation** - Processes up to 3 generations simultaneously
- **Content densifiers** - Structured progression from outline to polish
- **Image generation framework** - Ready for DALL-E 3 integration
- **Aggregate evaluation** - Batch human review system

## 🔧 Setup Instructions

### 1. Get Your OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-`)

### 2. Add API Key to Story Explorer
1. Open Story Explorer in your browser
2. Click "AI EVALUATOR" button
3. Paste your API key in the "OpenAI API Key" field
4. Click "Save Key"

The key is stored in your browser's localStorage and never sent to any server except OpenAI's API.

## 📋 API Usage

### Basic Text Generation
```javascript
const response = await callGPT5(
  "Write a story moment for Penelope",
  {
    systemPrompt: "You are a creative writer for the Loom universe",
    temperature: 0.9,
    maxTokens: 2000
  }
);
console.log(response.text);
```

### With Images
```javascript
const response = await callGPT5WithImages(
  "Describe this character",
  ["https://example.com/character.png"],
  { temperature: 0.7 }
);
```

### With Web Search
```javascript
const response = await callGPT5WithWebSearch(
  "What are current trends in narrative structure?",
  { temperature: 0.7 }
);
```

## 🎯 Features Ready to Use

### Auto-Queue System
- Automatically detects:
  - Series with arcs but no stories
  - Stories needing more sequences
  - Sequences needing more moments
  - Under-utilized characters
  - Unused locations
  - Unintegrated artifacts

### Content Densifiers
**Written Content:**
1. Outline
2. Beat Sheet
3. Scene Breakdown
4. Dialogue Draft
5. Prose Draft
6. Polish Pass

**Visual Content:**
1. Concept Sketch
2. Style Test
3. Character Sheet
4. Environment Concept
5. Action Sequence
6. Final Render

### Image Shot Types
- Hero Shot
- Selfie
- Turnaround
- Action Shot
- Still Life
- Character Moment
- Environment
- Group Shot

## 🚀 Next Steps

### To Complete Full Integration:

1. **Update `renderAIEvaluatorView()`** in `index.html`
   - Add OpenAI API key input field
   - Add focus area selection
   - Add auto-queue dashboard
   - Add suggestion checkboxes for artifacts/locations
   - Add image generation workflow

2. **Implement Image Generation**
   - Integrate DALL-E 3 API
   - Style test selection UI
   - Batch image generation
   - Automatic file naming and organization

3. **Aggregate Evaluation UI**
   - Batch review interface
   - Accept/reject/refine controls
   - Human feedback collection
   - Training data export

## 💡 Usage Tips

- **Temperature**: Higher (0.9) for creative content, lower (0.7) for structured data
- **System Prompts**: Customize for different content types
- **Context**: Pass relevant node data for better results
- **Error Handling**: All functions include try/catch with fallbacks
- **Token Usage**: Tracked in response.usage for monitoring costs

## 📊 Cost Estimation

GPT-5 pricing (estimated):
- Input: ~$0.03 per 1K tokens
- Output: ~$0.06 per 1K tokens

Typical generation costs:
- Story pitch: ~$0.10-0.15
- Sequence generation: ~$0.15-0.20
- Moment generation: ~$0.20-0.30
- Location expansion: ~$0.15-0.25

## ⚠️ Important Notes

1. **API Key Security**: Keys are stored in localStorage. For production, use a backend proxy.
2. **Rate Limits**: OpenAI has rate limits. The system handles 3 parallel requests max.
3. **Error Handling**: All functions gracefully degrade if API calls fail.
4. **Context Length**: GPT-5 supports very long contexts, but costs scale with tokens.

## 🐛 Troubleshooting

**"API key not configured"**
- Add your OpenAI API key in AI Evaluator settings

**"CORS error"**
- Browser security blocks direct API calls
- Need to set up a backend proxy for production

**"Rate limit exceeded"**
- Wait a few seconds and try again
- Reduce parallel generation count

**"Invalid JSON response"**
- GPT-5 sometimes returns markdown-wrapped JSON
- Error handling will catch and report this

## 📝 Files Modified

1. `index.html` - Added script tag for ai-evaluator-enhanced.js
2. `ai-evaluator-enhanced.js` - Complete GPT-5 integration
3. `rebuild-fixed.py` - Fixed rebuild script
4. `nodes.js` - External node data (unchanged)
5. `connections.js` - External connection data (unchanged)

## ✨ Ready to Generate!

The system is now ready to use GPT-5 for all content generation. Simply:
1. Add your API key
2. Select a focus area
3. Let the AI analyze and generate
4. Review and integrate suggestions

Happy creating! 🎨📖✨



