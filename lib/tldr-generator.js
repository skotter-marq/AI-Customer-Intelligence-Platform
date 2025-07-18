// lib/tldr-generator.js
/**
 * TLDR Generator
 * Intelligent summarization system for creating executive-friendly summaries
 */

const { createClient } = require('@supabase/supabase-js');
const AIProvider = require('./ai-provider.js');
require('dotenv').config({ path: '.env.local' });

class TLDRGenerator {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    this.aiProvider = new AIProvider();
    
    // TLDR configuration
    this.config = {
      maxSummaryLength: 500, // characters
      maxBulletPoints: 5,
      targetReadingTime: 30, // seconds
      summaryStyles: {
        executive: {
          tone: 'professional and strategic',
          focus: 'business impact and decisions',
          length: 'ultra-concise'
        },
        technical: {
          tone: 'detailed and analytical',
          focus: 'implementation and metrics',
          length: 'concise'
        },
        marketing: {
          tone: 'engaging and persuasive',
          focus: 'customer benefits and outcomes',
          length: 'moderate'
        },
        sales: {
          tone: 'action-oriented and compelling',
          focus: 'value proposition and next steps',
          length: 'brief'
        }
      },
      confidenceThreshold: 0.8,
      enableAISummarization: true
    };
    
    // Summary templates
    this.summaryTemplates = {
      meeting: {
        structure: ['key_decisions', 'action_items', 'next_steps'],
        maxLength: 300,
        bulletPoints: 3
      },
      insight: {
        structure: ['main_finding', 'impact', 'recommendation'],
        maxLength: 200,
        bulletPoints: 2
      },
      competitive: {
        structure: ['threat_level', 'key_changes', 'response_needed'],
        maxLength: 250,
        bulletPoints: 3
      },
      product_update: {
        structure: ['what_changed', 'customer_impact', 'timeline'],
        maxLength: 200,
        bulletPoints: 2
      },
      campaign: {
        structure: ['performance', 'key_metrics', 'recommendations'],
        maxLength: 300,
        bulletPoints: 4
      }
    };
    
    // Key phrase extraction patterns
    this.keyPhrasePatterns = {
      decisions: /\b(decided|agreed|resolved|concluded|determined)\b/gi,
      actions: /\b(will|should|must|need to|action|task|todo)\b/gi,
      metrics: /\b(\d+%|\$[\d,]+|increased|decreased|improved|reduced)\b/gi,
      priorities: /\b(urgent|critical|high priority|important|asap)\b/gi,
      dates: /\b(today|tomorrow|next week|by \w+day|deadline|due)\b/gi,
      stakeholders: /\b(team|customer|client|user|executive|manager)\b/gi
    };
  }

  /**
   * Generate TLDR summary from content
   * @param {Object} content - Content to summarize
   * @param {Object} options - Summarization options
   * @returns {Object} Generated TLDR summary
   */
  async generateTLDR(content, options = {}) {
    try {
      console.log('📝 Generating TLDR summary...');
      
      const {
        style = 'executive',
        maxLength = this.config.maxSummaryLength,
        includeMetrics = true,
        includeActionItems = true,
        contextType = 'general',
        targetAudience = 'executives'
      } = options;

      // Validate content
      if (!content || typeof content !== 'object') {
        throw new Error('Invalid content provided for TLDR generation');
      }

      // Extract and prepare content
      const extractedContent = this.extractContent(content);
      
      // Generate summary structure
      const summaryStructure = this.determineSummaryStructure(content, contextType);
      
      // Extract key information
      const keyInfo = this.extractKeyInformation(extractedContent);
      
      // Generate AI-powered summary
      const aiSummary = await this.generateAISummary(extractedContent, style, summaryStructure);
      
      // Create structured summary
      const structuredSummary = this.createStructuredSummary(
        keyInfo,
        aiSummary,
        summaryStructure,
        {
          style,
          maxLength,
          includeMetrics,
          includeActionItems,
          targetAudience
        }
      );
      
      // Validate and optimize summary
      const optimizedSummary = this.optimizeSummary(structuredSummary, maxLength);
      
      // Calculate summary metrics
      const summaryMetrics = this.calculateSummaryMetrics(optimizedSummary, extractedContent);
      
      // Format final output
      const tldrResult = {
        summary: optimizedSummary,
        metadata: {
          original_length: extractedContent.length,
          summary_length: optimizedSummary.content.length,
          compression_ratio: extractedContent.length > 0 ? 
            (extractedContent.length - optimizedSummary.content.length) / extractedContent.length : 0,
          reading_time: Math.ceil(optimizedSummary.content.length / 200 * 60), // seconds
          confidence_score: aiSummary.confidence || 0.8,
          key_topics: keyInfo.topics.slice(0, 5),
          style: style,
          target_audience: targetAudience,
          generated_at: new Date().toISOString()
        },
        metrics: summaryMetrics
      };
      
      console.log(`✅ TLDR generated: ${tldrResult.metadata.compression_ratio.toFixed(2)} compression ratio`);
      
      return tldrResult;

    } catch (error) {
      console.error('❌ TLDR generation failed:', error.message);
      return {
        summary: {
          content: 'Summary generation failed. Please try again.',
          bullet_points: [],
          key_takeaways: [],
          action_items: []
        },
        metadata: {
          error: error.message,
          generated_at: new Date().toISOString()
        },
        metrics: { confidence: 0 }
      };
    }
  }

  /**
   * Generate bulk TLDR summaries
   * @param {Array} contents - Array of content objects
   * @param {Object} options - Bulk summarization options
   * @returns {Object} Bulk summary results
   */
  async generateBulkTLDR(contents, options = {}) {
    try {
      console.log(`📝 Generating ${contents.length} TLDR summaries...`);
      
      const results = [];
      const errors = [];
      
      for (const [index, content] of contents.entries()) {
        try {
          const summary = await this.generateTLDR(content, options);
          results.push({
            index: index,
            content_id: content.id,
            summary: summary,
            success: true
          });
        } catch (error) {
          errors.push({
            index: index,
            content_id: content.id,
            error: error.message,
            success: false
          });
        }
      }
      
      return {
        success: true,
        total_processed: contents.length,
        successful_summaries: results.length,
        failed_summaries: errors.length,
        results: results,
        errors: errors,
        batch_id: `batch_${Date.now()}`,
        processed_at: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        total_processed: 0,
        successful_summaries: 0,
        failed_summaries: contents.length
      };
    }
  }

  /**
   * Extract content from various formats
   * @param {Object} content - Content object
   * @returns {string} Extracted text content
   */
  extractContent(content) {
    let extractedText = '';
    
    try {
      // Handle different content types
      if (typeof content === 'string') {
        extractedText = content;
      } else if (content.generated_content) {
        extractedText = content.generated_content;
      } else if (content.content) {
        extractedText = content.content;
      } else if (content.description) {
        extractedText = content.description;
      } else if (content.transcript) {
        extractedText = content.transcript;
      } else if (content.summary) {
        extractedText = content.summary;
      }
      
      // Add additional fields if available
      if (content.title) {
        extractedText = `${content.title}\n\n${extractedText}`;
      }
      
      if (content.key_points && Array.isArray(content.key_points)) {
        extractedText += '\n\nKey Points:\n' + content.key_points.join('\n');
      }
      
      if (content.action_items && Array.isArray(content.action_items)) {
        extractedText += '\n\nAction Items:\n' + content.action_items.join('\n');
      }
      
      // Clean up text
      extractedText = extractedText
        .replace(/\n\s*\n/g, '\n\n') // Clean up multiple newlines
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      return extractedText;

    } catch (error) {
      console.warn('Content extraction failed:', error.message);
      return content.toString ? content.toString() : 'Content extraction failed';
    }
  }

  /**
   * Determine summary structure based on content type
   * @param {Object} content - Content object
   * @param {string} contextType - Context type
   * @returns {Object} Summary structure
   */
  determineSummaryStructure(content, contextType) {
    // Use context type if provided
    if (this.summaryTemplates[contextType]) {
      return this.summaryTemplates[contextType];
    }
    
    // Determine from content type
    if (content.content_type) {
      switch (content.content_type) {
        case 'meeting':
        case 'customer_meeting':
          return this.summaryTemplates.meeting;
        case 'insight':
        case 'customer_insight':
          return this.summaryTemplates.insight;
        case 'competitive_signal':
        case 'competitive_analysis':
          return this.summaryTemplates.competitive;
        case 'product_update':
          return this.summaryTemplates.product_update;
        case 'campaign':
        case 'email_campaign':
          return this.summaryTemplates.campaign;
        default:
          return this.summaryTemplates.insight;
      }
    }
    
    // Default structure
    return {
      structure: ['main_point', 'key_details', 'next_steps'],
      maxLength: 300,
      bulletPoints: 3
    };
  }

  /**
   * Extract key information from content
   * @param {string} content - Content text
   * @returns {Object} Key information
   */
  extractKeyInformation(content) {
    const keyInfo = {
      topics: [],
      metrics: [],
      decisions: [],
      actions: [],
      dates: [],
      stakeholders: [],
      priorities: []
    };
    
    try {
      // Extract using patterns
      Object.entries(this.keyPhrasePatterns).forEach(([key, pattern]) => {
        const matches = content.match(pattern) || [];
        keyInfo[key] = [...new Set(matches.map(m => m.toLowerCase()))];
      });
      
      // Extract topics using simple keyword analysis
      const words = content.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3);
      
      const wordFreq = {};
      words.forEach(word => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      });
      
      keyInfo.topics = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word]) => word);
      
      // Extract sentences with high importance
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
      keyInfo.important_sentences = sentences
        .map(sentence => ({
          text: sentence.trim(),
          importance: this.calculateSentenceImportance(sentence)
        }))
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 3)
        .map(s => s.text);
      
      return keyInfo;

    } catch (error) {
      console.warn('Key information extraction failed:', error.message);
      return keyInfo;
    }
  }

  /**
   * Generate AI-powered summary
   * @param {string} content - Content to summarize
   * @param {string} style - Summary style
   * @param {Object} structure - Summary structure
   * @returns {Object} AI summary
   */
  async generateAISummary(content, style, structure) {
    try {
      if (!this.config.enableAISummarization) {
        return {
          summary: this.generateFallbackSummary(content, structure),
          confidence: 0.6
        };
      }
      
      const styleConfig = this.config.summaryStyles[style] || this.config.summaryStyles.executive;
      
      const prompt = `
Please create a ${styleConfig.tone} TLDR summary of the following content.

REQUIREMENTS:
- Tone: ${styleConfig.tone}
- Focus: ${styleConfig.focus}
- Length: ${styleConfig.length} (max ${structure.maxLength} characters)
- Format: ${structure.bulletPoints} bullet points maximum
- Structure: ${structure.structure.join(', ')}

CONTENT TO SUMMARIZE:
${content}

Please provide:
1. A concise summary paragraph
2. Key bullet points (max ${structure.bulletPoints})
3. Main takeaways
4. Action items (if applicable)

Format your response as a clear, executive-ready summary.
`;

      const aiResponse = await this.aiProvider.generateText(prompt, {
        max_tokens: 400,
        temperature: 0.3
      });
      
      return {
        summary: this.parseAIResponse(aiResponse),
        confidence: 0.85
      };

    } catch (error) {
      console.warn('AI summarization failed, using fallback:', error.message);
      return {
        summary: this.generateFallbackSummary(content, structure),
        confidence: 0.6
      };
    }
  }

  /**
   * Parse AI response into structured format
   * @param {string} aiResponse - AI response text
   * @returns {Object} Parsed response
   */
  parseAIResponse(aiResponse) {
    try {
      const lines = aiResponse.split('\n').filter(line => line.trim());
      
      let summary = '';
      const bulletPoints = [];
      const takeaways = [];
      const actionItems = [];
      
      let currentSection = 'summary';
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
          const point = trimmed.replace(/^[•\-*]\s*/, '');
          if (currentSection === 'summary') {
            bulletPoints.push(point);
          } else if (currentSection === 'takeaways') {
            takeaways.push(point);
          } else if (currentSection === 'actions') {
            actionItems.push(point);
          }
        } else if (trimmed.toLowerCase().includes('takeaway') || trimmed.toLowerCase().includes('key point')) {
          currentSection = 'takeaways';
        } else if (trimmed.toLowerCase().includes('action') || trimmed.toLowerCase().includes('next step')) {
          currentSection = 'actions';
        } else if (trimmed.length > 20 && !summary) {
          summary = trimmed;
        }
      }
      
      return {
        summary: summary || aiResponse.substring(0, 200),
        bullet_points: bulletPoints,
        takeaways: takeaways,
        action_items: actionItems
      };

    } catch (error) {
      return {
        summary: aiResponse.substring(0, 200),
        bullet_points: [],
        takeaways: [],
        action_items: []
      };
    }
  }

  /**
   * Generate fallback summary without AI
   * @param {string} content - Content to summarize
   * @param {Object} structure - Summary structure
   * @returns {Object} Fallback summary
   */
  generateFallbackSummary(content, structure) {
    try {
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
      
      // Get most important sentences
      const importantSentences = sentences
        .map(sentence => ({
          text: sentence.trim(),
          importance: this.calculateSentenceImportance(sentence)
        }))
        .sort((a, b) => b.importance - a.importance)
        .slice(0, structure.bulletPoints)
        .map(s => s.text);
      
      // Create summary
      const summary = sentences.length > 0 ? sentences[0] : content.substring(0, 150);
      
      return {
        summary: summary,
        bullet_points: importantSentences,
        takeaways: importantSentences.slice(0, 2),
        action_items: this.extractActionItems(content)
      };

    } catch (error) {
      return {
        summary: content.substring(0, 150),
        bullet_points: [],
        takeaways: [],
        action_items: []
      };
    }
  }

  /**
   * Calculate sentence importance
   * @param {string} sentence - Sentence to analyze
   * @returns {number} Importance score
   */
  calculateSentenceImportance(sentence) {
    let score = 0;
    const lowerSentence = sentence.toLowerCase();
    
    // Keywords that indicate importance
    const importantKeywords = [
      'important', 'critical', 'key', 'main', 'primary', 'significant',
      'decided', 'agreed', 'concluded', 'result', 'outcome', 'impact',
      'increase', 'decrease', 'improve', 'reduce', 'growth', 'revenue',
      'customer', 'user', 'client', 'market', 'competitive', 'strategic'
    ];
    
    importantKeywords.forEach(keyword => {
      if (lowerSentence.includes(keyword)) {
        score += 1;
      }
    });
    
    // Numbers and percentages are often important
    if (lowerSentence.match(/\d+%/)) score += 2;
    if (lowerSentence.match(/\$[\d,]+/)) score += 2;
    if (lowerSentence.match(/\d+/)) score += 1;
    
    // Shorter sentences are often more impactful
    if (sentence.length < 100) score += 1;
    
    return score;
  }

  /**
   * Extract action items from content
   * @param {string} content - Content text
   * @returns {Array} Action items
   */
  extractActionItems(content) {
    const actionPatterns = [
      /\b(will|shall|must|should|need to|have to|action|task|todo)\s+([^.!?]+)/gi,
      /\b(follow up|next step|action item|deliverable)\s*:?\s*([^.!?]+)/gi
    ];
    
    const actionItems = [];
    
    actionPatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const actionText = match[2] || match[1];
        if (actionText && actionText.trim().length > 10) {
          actionItems.push(actionText.trim());
        }
      }
    });
    
    return [...new Set(actionItems)].slice(0, 3);
  }

  /**
   * Create structured summary
   * @param {Object} keyInfo - Key information
   * @param {Object} aiSummary - AI summary
   * @param {Object} structure - Summary structure
   * @param {Object} options - Options
   * @returns {Object} Structured summary
   */
  createStructuredSummary(keyInfo, aiSummary, structure, options) {
    try {
      const structuredSummary = {
        content: aiSummary.summary.summary || '',
        bullet_points: aiSummary.summary.bullet_points || [],
        key_takeaways: aiSummary.summary.takeaways || [],
        action_items: aiSummary.summary.action_items || [],
        metadata: {
          structure_type: structure.structure.join(', '),
          style: options.style,
          target_audience: options.targetAudience,
          key_topics: keyInfo.topics.slice(0, 5)
        }
      };
      
      // Add metrics if requested
      if (options.includeMetrics && keyInfo.metrics.length > 0) {
        structuredSummary.key_metrics = keyInfo.metrics.slice(0, 3);
      }
      
      // Ensure action items if requested
      if (options.includeActionItems && structuredSummary.action_items.length === 0) {
        structuredSummary.action_items = this.extractActionItems(keyInfo.important_sentences?.join(' ') || '');
      }
      
      return structuredSummary;

    } catch (error) {
      console.warn('Structured summary creation failed:', error.message);
      return {
        content: aiSummary.summary.summary || 'Summary generation failed',
        bullet_points: [],
        key_takeaways: [],
        action_items: [],
        metadata: { error: error.message }
      };
    }
  }

  /**
   * Optimize summary for length and readability
   * @param {Object} summary - Summary object
   * @param {number} maxLength - Maximum length
   * @returns {Object} Optimized summary
   */
  optimizeSummary(summary, maxLength) {
    try {
      let optimizedSummary = { ...summary };
      
      // Trim content if too long
      if (optimizedSummary.content.length > maxLength) {
        optimizedSummary.content = optimizedSummary.content.substring(0, maxLength - 3) + '...';
      }
      
      // Limit bullet points
      if (optimizedSummary.bullet_points.length > this.config.maxBulletPoints) {
        optimizedSummary.bullet_points = optimizedSummary.bullet_points.slice(0, this.config.maxBulletPoints);
      }
      
      // Ensure takeaways are concise
      optimizedSummary.key_takeaways = optimizedSummary.key_takeaways.map(takeaway => 
        takeaway.length > 100 ? takeaway.substring(0, 97) + '...' : takeaway
      );
      
      // Ensure action items are actionable
      optimizedSummary.action_items = optimizedSummary.action_items.map(action => {
        if (!action.toLowerCase().startsWith('action:') && !action.toLowerCase().includes('will') && !action.toLowerCase().includes('should')) {
          return `Action: ${action}`;
        }
        return action;
      });
      
      return optimizedSummary;

    } catch (error) {
      console.warn('Summary optimization failed:', error.message);
      return summary;
    }
  }

  /**
   * Calculate summary metrics
   * @param {Object} summary - Summary object
   * @param {string} originalContent - Original content
   * @returns {Object} Summary metrics
   */
  calculateSummaryMetrics(summary, originalContent) {
    try {
      const summaryText = summary.content + ' ' + summary.bullet_points.join(' ');
      
      return {
        compression_ratio: originalContent.length > 0 ? 
          (originalContent.length - summaryText.length) / originalContent.length : 0,
        readability_score: this.calculateReadabilityScore(summaryText),
        information_density: this.calculateInformationDensity(summaryText),
        actionability_score: this.calculateActionabilityScore(summary),
        completeness_score: this.calculateCompletenessScore(summary),
        confidence: 0.85
      };

    } catch (error) {
      return {
        compression_ratio: 0,
        readability_score: 0.5,
        information_density: 0.5,
        actionability_score: 0.5,
        completeness_score: 0.5,
        confidence: 0.5
      };
    }
  }

  /**
   * Calculate readability score
   * @param {string} text - Text to analyze
   * @returns {number} Readability score (0-1)
   */
  calculateReadabilityScore(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    
    if (sentences.length === 0 || words.length === 0) return 0.5;
    
    const avgWordsPerSentence = words.length / sentences.length;
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    // Ideal: 15-20 words per sentence, 5-6 characters per word
    const sentenceScore = Math.max(0, 1 - Math.abs(avgWordsPerSentence - 17.5) / 17.5);
    const wordScore = Math.max(0, 1 - Math.abs(avgWordLength - 5.5) / 5.5);
    
    return (sentenceScore + wordScore) / 2;
  }

  /**
   * Calculate information density
   * @param {string} text - Text to analyze
   * @returns {number} Information density score (0-1)
   */
  calculateInformationDensity(text) {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    
    // Count information-rich words
    const informationWords = words.filter(word => {
      const w = word.toLowerCase();
      return w.length > 4 && !['that', 'this', 'with', 'from', 'they', 'been', 'have', 'were', 'said', 'each', 'will', 'would', 'could', 'should'].includes(w);
    });
    
    const uniqueRatio = uniqueWords.size / words.length;
    const informationRatio = informationWords.length / words.length;
    
    return (uniqueRatio + informationRatio) / 2;
  }

  /**
   * Calculate actionability score
   * @param {Object} summary - Summary object
   * @returns {number} Actionability score (0-1)
   */
  calculateActionabilityScore(summary) {
    let score = 0;
    
    // Action items present
    if (summary.action_items && summary.action_items.length > 0) {
      score += 0.4;
      
      // Quality of action items
      const actionableItems = summary.action_items.filter(item => {
        const lower = item.toLowerCase();
        return lower.includes('will') || lower.includes('should') || lower.includes('must') || 
               lower.includes('need') || lower.includes('action') || lower.includes('implement');
      });
      
      score += (actionableItems.length / summary.action_items.length) * 0.3;
    }
    
    // Specific next steps
    const nextStepKeywords = ['next', 'follow', 'implement', 'execute', 'deliver', 'complete'];
    const hasNextSteps = summary.content.toLowerCase().split(' ').some(word => 
      nextStepKeywords.includes(word)
    );
    
    if (hasNextSteps) score += 0.3;
    
    return Math.min(score, 1);
  }

  /**
   * Calculate completeness score
   * @param {Object} summary - Summary object
   * @returns {number} Completeness score (0-1)
   */
  calculateCompletenessScore(summary) {
    let score = 0;
    
    // Has main content
    if (summary.content && summary.content.length > 50) score += 0.3;
    
    // Has bullet points
    if (summary.bullet_points && summary.bullet_points.length > 0) score += 0.2;
    
    // Has takeaways
    if (summary.key_takeaways && summary.key_takeaways.length > 0) score += 0.2;
    
    // Has action items
    if (summary.action_items && summary.action_items.length > 0) score += 0.2;
    
    // Has metadata
    if (summary.metadata && Object.keys(summary.metadata).length > 0) score += 0.1;
    
    return score;
  }

  /**
   * Get TLDR template for specific content type
   * @param {string} contentType - Content type
   * @returns {Object} TLDR template
   */
  getTLDRTemplate(contentType) {
    return this.summaryTemplates[contentType] || this.summaryTemplates.insight;
  }

  /**
   * Get available summary styles
   * @returns {Array} Available styles
   */
  getAvailableStyles() {
    return Object.keys(this.config.summaryStyles);
  }

  /**
   * Get TLDR configuration
   * @returns {Object} Configuration
   */
  getConfig() {
    return this.config;
  }

  /**
   * Update TLDR configuration
   * @param {Object} updates - Configuration updates
   */
  updateConfig(updates) {
    Object.assign(this.config, updates);
  }
}

module.exports = TLDRGenerator;