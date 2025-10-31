// ==================== AI GEOMETRY EVALUATOR ====================
// System for capturing multi-angle screenshots and feeding them to AI
// for hyper-specific geometry and realism correction instructions

import { AssetPreviewRenderer } from '../assets/preview-renderer.js';

/**
 * Geometry Evaluator
 * Captures assets from multiple angles and prepares them for AI evaluation
 */
export class GeometryEvaluator {
  constructor(options = {}) {
    this.options = {
      screenshotWidth: options.screenshotWidth || 1024,
      screenshotHeight: options.screenshotHeight || 1024,
      apiEndpoint: options.apiEndpoint || null,
      apiKey: options.apiKey || null,
      ...options
    };
    
    this.renderer = null;
    this.evaluationResults = [];
  }
  
  /**
   * Initialize the renderer
   * @param {HTMLElement} container - Container element for the renderer
   */
  init(container) {
    this.renderer = new AssetPreviewRenderer(container, {
      width: this.options.screenshotWidth,
      height: this.options.screenshotHeight,
      backgroundColor: 0xffffff
    });
  }
  
  /**
   * Evaluate an asset's geometry and realism
   * @param {string} assetId - Asset identifier
   * @param {Object} spec - Asset specification
   * @param {Object} evaluationOptions - Options for evaluation
   * @returns {Promise<Object>} Evaluation results
   */
  async evaluateAsset(assetId, spec = {}, evaluationOptions = {}) {
    if (!this.renderer) {
      throw new Error('Evaluator not initialized. Call init() first.');
    }
    
    // Clear previous assets
    this.renderer.clearAssets();
    
    // Add asset to scene
    const asset = this.renderer.addAsset(assetId, spec);
    if (!asset) {
      throw new Error(`Failed to create asset: ${assetId}`);
    }
    
    // Take screenshots from standard angles
    const angles = evaluationOptions.customAngles || this.renderer.getStandardAngles();
    const screenshots = this.renderer.takeMultiAngleScreenshots(angles);
    
    // Prepare evaluation data
    const evaluationData = {
      assetId,
      spec,
      timestamp: new Date().toISOString(),
      screenshots: screenshots.map((screenshot, i) => ({
        angle: i,
        angleDescription: this.getAngleDescription(i),
        image: screenshot,
        position: angles[i].position,
        lookAt: angles[i].lookAt
      })),
      metadata: {
        dimensions: asset.userData.dimensions || 'unknown',
        category: asset.userData.category || 'unknown',
        interactive: asset.userData.interactive || false
      }
    };
    
    // Send to AI for evaluation (if API configured)
    let aiResponse = null;
    if (this.options.apiEndpoint && this.options.apiKey) {
      aiResponse = await this.sendToAI(evaluationData);
    }
    
    // Store results
    const result = {
      ...evaluationData,
      aiResponse,
      status: aiResponse ? 'evaluated' : 'captured'
    };
    
    this.evaluationResults.push(result);
    
    return result;
  }
  
  /**
   * Get description for standard angle index
   * @param {number} angleIndex
   * @returns {string}
   */
  getAngleDescription(angleIndex) {
    const descriptions = [
      'Front-right perspective',
      'Front-left perspective',
      'Back-right perspective',
      'Back-left perspective',
      'Top-down view',
      'Side profile'
    ];
    return descriptions[angleIndex] || `Angle ${angleIndex}`;
  }
  
  /**
   * Send evaluation data to AI API
   * @param {Object} evaluationData
   * @returns {Promise<Object>}
   */
  async sendToAI(evaluationData) {
    try {
      // Prepare prompt for AI
      const prompt = this.constructPrompt(evaluationData);
      
      // Prepare image data (convert base64 to appropriate format)
      const images = evaluationData.screenshots.map(s => ({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/png',
          data: s.image.split(',')[1] // Remove data:image/png;base64, prefix
        }
      }));
      
      // API call structure (example for Anthropic Claude)
      const response = await fetch(this.options.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.options.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4096,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                ...images
              ]
            }
          ]
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      return this.parseAIResponse(result);
      
    } catch (error) {
      console.error('AI evaluation failed:', error);
      return {
        error: error.message,
        success: false
      };
    }
  }
  
  /**
   * Construct prompt for AI evaluation
   * @param {Object} evaluationData
   * @returns {string}
   */
  constructPrompt(evaluationData) {
    return `You are an expert 3D geometry and realism evaluator. Analyze these screenshots of a 3D asset from multiple angles.

Asset Information:
- ID: ${evaluationData.assetId}
- Category: ${evaluationData.metadata.category}
- Intended Dimensions: ${JSON.stringify(evaluationData.spec)}

I'm providing ${evaluationData.screenshots.length} screenshots from different angles:
${evaluationData.screenshots.map((s, i) => `${i + 1}. ${s.angleDescription}`).join('\n')}

Please provide hyper-specific feedback on:

1. **Geometric Accuracy**:
   - Are proportions realistic for this type of object?
   - Are there any distorted or unnatural shapes?
   - Do curves and edges look correct from all angles?
   - Are there any topology issues visible?

2. **Realism & Detail**:
   - Does it look like a real-world object?
   - What details are missing that would improve realism?
   - Are materials/colors appropriate?
   - Are there any lighting/shadow issues in the geometry?

3. **Consistency Across Angles**:
   - Does the object maintain visual consistency from all views?
   - Are there any angle-specific issues?

4. **Specific Corrections Needed**:
   - Provide exact measurements or ratios that should be changed
   - Suggest specific geometric modifications with precise values
   - List any additional elements that should be added
   - Recommend removal of any problematic elements

Please format your response as:
- Overall Score: X/10
- Critical Issues: [list]
- Recommended Corrections: [detailed list with specific values]
- Code Suggestions: [if applicable, suggest Three.js geometry modifications]

Be extremely specific and actionable in your feedback.`;
  }
  
  /**
   * Parse AI response into structured format
   * @param {Object} apiResponse
   * @returns {Object}
   */
  parseAIResponse(apiResponse) {
    // Extract text content from API response
    const content = apiResponse.content?.[0]?.text || apiResponse.completion || '';
    
    // Parse score
    const scoreMatch = content.match(/Overall Score:\s*(\d+(?:\.\d+)?)\s*\/\s*10/i);
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : null;
    
    // Parse sections
    const sections = {
      score,
      criticalIssues: this.extractSection(content, 'Critical Issues'),
      recommendations: this.extractSection(content, 'Recommended Corrections'),
      codeSuggestions: this.extractSection(content, 'Code Suggestions'),
      fullResponse: content
    };
    
    return {
      success: true,
      ...sections,
      rawResponse: apiResponse
    };
  }
  
  /**
   * Extract a section from AI response
   * @param {string} content
   * @param {string} sectionName
   * @returns {string}
   */
  extractSection(content, sectionName) {
    const regex = new RegExp(`${sectionName}:\\s*([\\s\\S]*?)(?=\\n\\n[A-Z]|$)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : '';
  }
  
  /**
   * Batch evaluate multiple assets
   * @param {Array<Object>} assets - Array of {assetId, spec}
   * @returns {Promise<Array<Object>>}
   */
  async batchEvaluate(assets) {
    const results = [];
    
    for (const asset of assets) {
      try {
        const result = await this.evaluateAsset(asset.assetId, asset.spec);
        results.push(result);
        
        // Add delay between API calls to avoid rate limiting
        if (this.options.apiEndpoint) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        results.push({
          assetId: asset.assetId,
          error: error.message,
          status: 'failed'
        });
      }
    }
    
    return results;
  }
  
  /**
   * Export evaluation results to JSON
   * @returns {string}
   */
  exportResults() {
    return JSON.stringify(this.evaluationResults, null, 2);
  }
  
  /**
   * Generate HTML report of evaluation results
   * @returns {string}
   */
  generateHTMLReport() {
    let html = `
<!DOCTYPE html>
<html>
<head>
  <title>Asset Evaluation Report</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    .asset { border: 1px solid #ccc; margin: 20px 0; padding: 15px; border-radius: 8px; }
    .asset h2 { margin-top: 0; }
    .score { font-size: 24px; font-weight: bold; color: #4CAF50; }
    .score.low { color: #f44336; }
    .screenshots { display: flex; flex-wrap: wrap; gap: 10px; margin: 15px 0; }
    .screenshots img { width: 200px; height: 200px; object-fit: cover; border: 1px solid #ddd; }
    .section { margin: 15px 0; }
    .section h3 { margin-bottom: 5px; }
    pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>3D Asset Geometry Evaluation Report</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
    `;
    
    this.evaluationResults.forEach(result => {
      const score = result.aiResponse?.score || 'N/A';
      const scoreClass = score < 7 ? 'low' : '';
      
      html += `
      <div class="asset">
        <h2>${result.assetId}</h2>
        <div class="score ${scoreClass}">Score: ${score}/10</div>
        
        <div class="section">
          <h3>Screenshots</h3>
          <div class="screenshots">
            ${result.screenshots.map(s => `
              <div>
                <img src="${s.image}" alt="${s.angleDescription}">
                <p style="text-align: center; font-size: 12px;">${s.angleDescription}</p>
              </div>
            `).join('')}
          </div>
        </div>
        
        ${result.aiResponse ? `
          <div class="section">
            <h3>Critical Issues</h3>
            <pre>${result.aiResponse.criticalIssues || 'None identified'}</pre>
          </div>
          
          <div class="section">
            <h3>Recommended Corrections</h3>
            <pre>${result.aiResponse.recommendations || 'None provided'}</pre>
          </div>
          
          <div class="section">
            <h3>Code Suggestions</h3>
            <pre>${result.aiResponse.codeSuggestions || 'None provided'}</pre>
          </div>
        ` : `
          <div class="section">
            <p><em>No AI evaluation performed</em></p>
          </div>
        `}
      </div>
      `;
    });
    
    html += `
</body>
</html>
    `;
    
    return html;
  }
  
  /**
   * Cleanup
   */
  dispose() {
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
  }
}

/**
 * Standalone function to evaluate a single asset quickly
 * @param {string} assetId
 * @param {Object} spec
 * @param {Object} options
 * @returns {Promise<Object>}
 */
export async function quickEvaluate(assetId, spec = {}, options = {}) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  document.body.appendChild(container);
  
  const evaluator = new GeometryEvaluator(options);
  evaluator.init(container);
  
  const result = await evaluator.evaluateAsset(assetId, spec);
  
  evaluator.dispose();
  document.body.removeChild(container);
  
  return result;
}

