// lib/tag-detection-filter.js
/**
 * Tag Detection and Filtering System
 * Advanced content analysis and filtering for competitive intelligence
 */

const { createClient } = require('@supabase/supabase-js');
const AIProvider = require('./ai-provider.js');
require('dotenv').config({ path: '.env.local' });

class TagDetectionFilter {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    this.aiProvider = new AIProvider();
    
    // Predefined tag taxonomies
    this.tagTaxonomies = {
      competitive: {
        tags: [
          'competitive-analysis', 'competitor-research', 'market-positioning',
          'competitive-advantage', 'feature-parity', 'pricing-strategy',
          'market-share', 'benchmarking', 'competitive-response',
          'differentiation', 'positioning', 'competitive-intelligence'
        ],
        keywords: [
          'competitor', 'competitive', 'rival', 'competing', 'market leader',
          'market share', 'benchmark', 'parity', 'advantage', 'differentiation',
          'positioning', 'outperform', 'compare', 'versus', 'alternative'
        ],
        weight: 1.0
      },
      customer: {
        tags: [
          'customer-feedback', 'customer-request', 'user-experience',
          'customer-pain-point', 'customer-satisfaction', 'customer-retention',
          'customer-journey', 'customer-needs', 'customer-insights',
          'customer-research', 'customer-impact', 'customer-value'
        ],
        keywords: [
          'customer', 'client', 'user', 'end-user', 'buyer', 'consumer',
          'feedback', 'request', 'pain point', 'satisfaction', 'experience',
          'journey', 'needs', 'requirements', 'expectations', 'retention'
        ],
        weight: 0.9
      },
      strategic: {
        tags: [
          'strategic-initiative', 'strategic-planning', 'roadmap',
          'strategic-goal', 'strategic-objective', 'strategic-priority',
          'strategic-investment', 'strategic-decision', 'strategic-analysis',
          'strategic-direction', 'strategic-focus', 'strategic-alignment'
        ],
        keywords: [
          'strategic', 'strategy', 'initiative', 'roadmap', 'vision',
          'goal', 'objective', 'priority', 'investment', 'growth',
          'expansion', 'transformation', 'pivot', 'direction', 'alignment'
        ],
        weight: 0.8
      },
      product: {
        tags: [
          'product-feature', 'product-enhancement', 'product-launch',
          'product-development', 'product-roadmap', 'product-strategy',
          'product-improvement', 'product-innovation', 'product-update',
          'product-release', 'product-planning', 'product-management'
        ],
        keywords: [
          'feature', 'enhancement', 'improvement', 'functionality',
          'capability', 'product', 'development', 'innovation',
          'launch', 'release', 'update', 'upgrade', 'new feature'
        ],
        weight: 0.7
      },
      market: {
        tags: [
          'market-analysis', 'market-research', 'market-trends',
          'market-opportunity', 'market-expansion', 'market-penetration',
          'market-dynamics', 'market-conditions', 'market-intelligence',
          'market-insights', 'market-segmentation', 'market-positioning'
        ],
        keywords: [
          'market', 'industry', 'sector', 'segment', 'vertical',
          'trends', 'opportunity', 'expansion', 'penetration',
          'dynamics', 'conditions', 'intelligence', 'insights'
        ],
        weight: 0.6
      },
      technology: {
        tags: [
          'technology-trend', 'technology-adoption', 'technology-stack',
          'technology-innovation', 'technology-disruption', 'technology-evaluation',
          'technology-migration', 'technology-upgrade', 'technology-platform',
          'technology-architecture', 'technology-decision', 'technology-strategy'
        ],
        keywords: [
          'technology', 'tech', 'platform', 'architecture', 'stack',
          'framework', 'tool', 'system', 'infrastructure', 'innovation',
          'disruption', 'adoption', 'migration', 'upgrade', 'integration'
        ],
        weight: 0.5
      }
    };
    
    // Content analysis patterns
    this.contentPatterns = {
      urgency: {
        keywords: ['urgent', 'immediate', 'asap', 'priority', 'critical', 'blocker'],
        weight: 1.2
      },
      impact: {
        keywords: ['impact', 'affect', 'influence', 'consequence', 'result', 'outcome'],
        weight: 1.1
      },
      sentiment: {
        positive: ['excellent', 'great', 'awesome', 'love', 'amazing', 'fantastic'],
        negative: ['terrible', 'awful', 'hate', 'horrible', 'disappointing', 'frustrating'],
        weight: 1.0
      }
    };
  }

  /**
   * Detect and classify tags from content
   * @param {string} content - Text content to analyze
   * @param {Object} options - Analysis options
   * @returns {Object} Detection results
   */
  async detectTags(content, options = {}) {
    try {
      console.log('🔍 Detecting tags from content...');
      
      const {
        useAI = true,
        includeKeywords = true,
        includePatterns = true,
        confidenceThreshold = 0.6
      } = options;

      const results = {
        detected_tags: [],
        tag_scores: {},
        categories: [],
        confidence_scores: {},
        keyword_matches: {},
        pattern_matches: {},
        ai_analysis: null,
        overall_score: 0
      };

      // Normalize content
      const normalizedContent = this.normalizeContent(content);

      // 1. Rule-based tag detection
      const ruleBasedResults = await this.detectTagsByRules(normalizedContent);
      results.detected_tags.push(...ruleBasedResults.tags);
      results.tag_scores = { ...results.tag_scores, ...ruleBasedResults.scores };
      results.keyword_matches = ruleBasedResults.keyword_matches;

      // 2. Pattern-based detection
      if (includePatterns) {
        const patternResults = await this.detectTagsByPatterns(normalizedContent);
        results.pattern_matches = patternResults.patterns;
        results.detected_tags.push(...patternResults.tags);
      }

      // 3. AI-based tag detection
      if (useAI) {
        const aiResults = await this.detectTagsByAI(normalizedContent);
        if (aiResults.success) {
          results.ai_analysis = aiResults.analysis;
          results.detected_tags.push(...aiResults.tags);
        }
      }

      // 4. Deduplicate and score tags
      const uniqueTags = [...new Set(results.detected_tags)];
      results.detected_tags = uniqueTags;

      // 5. Calculate confidence scores
      uniqueTags.forEach(tag => {
        results.confidence_scores[tag] = this.calculateTagConfidence(
          tag, 
          normalizedContent, 
          results.keyword_matches,
          results.pattern_matches,
          results.ai_analysis
        );
      });

      // 6. Filter by confidence threshold
      results.detected_tags = uniqueTags.filter(tag => 
        results.confidence_scores[tag] >= confidenceThreshold
      );

      // 7. Categorize tags
      results.categories = this.categorizeTags(results.detected_tags);

      // 8. Calculate overall score
      results.overall_score = this.calculateOverallScore(results);

      console.log(`✅ Tag detection complete: ${results.detected_tags.length} tags detected`);
      return results;

    } catch (error) {
      console.error('❌ Tag detection failed:', error.message);
      return {
        detected_tags: [],
        tag_scores: {},
        categories: [],
        confidence_scores: {},
        keyword_matches: {},
        pattern_matches: {},
        ai_analysis: null,
        overall_score: 0,
        error: error.message
      };
    }
  }

  /**
   * Detect tags using rule-based approach
   * @param {string} content - Normalized content
   * @returns {Object} Rule-based detection results
   */
  async detectTagsByRules(content) {
    const results = {
      tags: [],
      scores: {},
      keyword_matches: {}
    };

    const contentLower = content.toLowerCase();

    // Check each taxonomy
    Object.entries(this.tagTaxonomies).forEach(([category, taxonomy]) => {
      const categoryMatches = {
        tags: [],
        keywords: [],
        score: 0
      };

      // Check explicit tags
      taxonomy.tags.forEach(tag => {
        if (contentLower.includes(tag.toLowerCase())) {
          categoryMatches.tags.push(tag);
          categoryMatches.score += taxonomy.weight;
        }
      });

      // Check keywords
      taxonomy.keywords.forEach(keyword => {
        if (contentLower.includes(keyword.toLowerCase())) {
          categoryMatches.keywords.push(keyword);
          categoryMatches.score += taxonomy.weight * 0.7; // Keywords have slightly lower weight
        }
      });

      // Add category tags if matches found
      if (categoryMatches.tags.length > 0 || categoryMatches.keywords.length > 0) {
        results.tags.push(...categoryMatches.tags);
        results.tags.push(`${category}-intelligence`);
        results.scores[category] = categoryMatches.score;
        results.keyword_matches[category] = categoryMatches;
      }
    });

    return results;
  }

  /**
   * Detect tags using pattern-based approach
   * @param {string} content - Normalized content
   * @returns {Object} Pattern-based detection results
   */
  async detectTagsByPatterns(content) {
    const results = {
      tags: [],
      patterns: {}
    };

    const contentLower = content.toLowerCase();

    // Check content patterns
    Object.entries(this.contentPatterns).forEach(([pattern, config]) => {
      const patternMatches = {
        matches: [],
        count: 0,
        weight: config.weight
      };

      if (pattern === 'sentiment') {
        // Special handling for sentiment
        const positiveMatches = config.positive.filter(word => 
          contentLower.includes(word.toLowerCase())
        );
        const negativeMatches = config.negative.filter(word => 
          contentLower.includes(word.toLowerCase())
        );

        if (positiveMatches.length > 0) {
          patternMatches.matches.push(...positiveMatches);
          patternMatches.count += positiveMatches.length;
          results.tags.push('positive-sentiment');
        }

        if (negativeMatches.length > 0) {
          patternMatches.matches.push(...negativeMatches);
          patternMatches.count += negativeMatches.length;
          results.tags.push('negative-sentiment');
        }
      } else {
        // Regular pattern matching
        const matches = config.keywords.filter(keyword => 
          contentLower.includes(keyword.toLowerCase())
        );

        if (matches.length > 0) {
          patternMatches.matches.push(...matches);
          patternMatches.count = matches.length;
          results.tags.push(`${pattern}-detected`);
        }
      }

      if (patternMatches.count > 0) {
        results.patterns[pattern] = patternMatches;
      }
    });

    return results;
  }

  /**
   * Detect tags using AI-based approach
   * @param {string} content - Normalized content
   * @returns {Object} AI-based detection results
   */
  async detectTagsByAI(content) {
    try {
      const prompt = `
Analyze the following content and identify relevant tags for competitive intelligence:

CONTENT:
${content}

Please identify tags in the following categories:
1. Competitive Intelligence (competitor analysis, market positioning, etc.)
2. Customer Intelligence (feedback, requests, pain points, etc.)
3. Strategic Intelligence (initiatives, roadmap, priorities, etc.)
4. Product Intelligence (features, enhancements, launches, etc.)
5. Market Intelligence (trends, opportunities, dynamics, etc.)
6. Technology Intelligence (platforms, innovations, disruptions, etc.)

Return your analysis in this format:
TAGS: [comma-separated list of relevant tags]
CONFIDENCE: [overall confidence score 0-1]
REASONING: [brief explanation of why these tags were selected]
PRIORITY: [high/medium/low priority level]
`;

      const aiResponse = await this.aiProvider.generateText(prompt);
      const analysis = this.parseAITagResponse(aiResponse);

      return {
        success: true,
        analysis: analysis,
        tags: analysis.tags || [],
        confidence: analysis.confidence || 0.5
      };

    } catch (error) {
      console.warn('AI tag detection failed:', error.message);
      return {
        success: false,
        analysis: null,
        tags: [],
        confidence: 0,
        error: error.message
      };
    }
  }

  /**
   * Parse AI response for tag detection
   * @param {string} aiResponse - AI response text
   * @returns {Object} Parsed analysis
   */
  parseAITagResponse(aiResponse) {
    const analysis = {
      tags: [],
      confidence: 0.5,
      reasoning: '',
      priority: 'medium'
    };

    try {
      const lines = aiResponse.split('\n');
      
      lines.forEach(line => {
        line = line.trim();
        
        if (line.startsWith('TAGS:')) {
          const tagsText = line.substring(5).trim();
          analysis.tags = tagsText.split(',').map(tag => tag.trim().toLowerCase());
        } else if (line.startsWith('CONFIDENCE:')) {
          const confidenceText = line.substring(11).trim();
          analysis.confidence = parseFloat(confidenceText) || 0.5;
        } else if (line.startsWith('REASONING:')) {
          analysis.reasoning = line.substring(10).trim();
        } else if (line.startsWith('PRIORITY:')) {
          analysis.priority = line.substring(9).trim().toLowerCase();
        }
      });

    } catch (error) {
      console.warn('Failed to parse AI response:', error.message);
    }

    return analysis;
  }

  /**
   * Calculate confidence score for a tag
   * @param {string} tag - Tag to score
   * @param {string} content - Content being analyzed
   * @param {Object} keywordMatches - Keyword matches
   * @param {Object} patternMatches - Pattern matches
   * @param {Object} aiAnalysis - AI analysis results
   * @returns {number} Confidence score
   */
  calculateTagConfidence(tag, content, keywordMatches, patternMatches, aiAnalysis) {
    let confidence = 0;
    
    // Base confidence from rule-based detection
    Object.entries(keywordMatches).forEach(([category, matches]) => {
      if (matches.tags.includes(tag) || matches.keywords.length > 0) {
        confidence += 0.4;
      }
    });

    // Additional confidence from pattern matching
    Object.entries(patternMatches).forEach(([pattern, matches]) => {
      if (matches.count > 0) {
        confidence += 0.2;
      }
    });

    // AI confidence boost
    if (aiAnalysis && aiAnalysis.tags.includes(tag)) {
      confidence += aiAnalysis.confidence * 0.4;
    }

    // Content length adjustment
    const contentLength = content.length;
    if (contentLength > 1000) {
      confidence *= 1.1; // Boost for longer content
    } else if (contentLength < 100) {
      confidence *= 0.8; // Reduce for shorter content
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Categorize tags by type
   * @param {Array} tags - Tags to categorize
   * @returns {Array} Categories
   */
  categorizeTags(tags) {
    const categories = [];
    
    Object.keys(this.tagTaxonomies).forEach(category => {
      const categoryTags = tags.filter(tag => 
        tag.includes(category) || 
        this.tagTaxonomies[category].tags.includes(tag)
      );
      
      if (categoryTags.length > 0) {
        categories.push(category);
      }
    });

    return categories;
  }

  /**
   * Calculate overall relevance score
   * @param {Object} results - Detection results
   * @returns {number} Overall score
   */
  calculateOverallScore(results) {
    let score = 0;
    
    // Score based on number of tags
    score += results.detected_tags.length * 0.1;
    
    // Score based on categories
    score += results.categories.length * 0.2;
    
    // Score based on confidence
    const avgConfidence = Object.values(results.confidence_scores).reduce((a, b) => a + b, 0) / 
                         Object.values(results.confidence_scores).length;
    score += (avgConfidence || 0) * 0.5;
    
    // Score based on AI analysis
    if (results.ai_analysis) {
      score += results.ai_analysis.confidence * 0.2;
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * Filter intelligence signals based on tags and criteria
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered signals
   */
  async filterSignals(filters = {}) {
    try {
      console.log('🔍 Filtering intelligence signals...');
      
      const {
        tags = [],
        categories = [],
        minConfidence = 0.0,
        maxResults = 100,
        dateRange = null,
        competitorIds = null,
        signalTypes = null,
        includeProcessed = true
      } = filters;

      let query = this.supabase
        .from('intelligence_signals')
        .select('*')
        .order('detected_at', { ascending: false });

      // Apply filters
      if (tags.length > 0) {
        query = query.overlaps('tags', tags);
      }

      if (categories.length > 0) {
        query = query.overlaps('tags', categories);
      }

      if (minConfidence > 0) {
        query = query.gte('confidence_score', minConfidence);
      }

      if (dateRange) {
        query = query.gte('detected_at', dateRange.start)
                     .lte('detected_at', dateRange.end);
      }

      if (competitorIds) {
        query = query.in('competitor_id', competitorIds);
      }

      if (signalTypes) {
        query = query.in('signal_type', signalTypes);
      }

      if (!includeProcessed) {
        query = query.eq('is_processed', false);
      }

      query = query.limit(maxResults);

      const { data: signals, error } = await query;

      if (error) {
        throw new Error(`Failed to filter signals: ${error.message}`);
      }

      console.log(`✅ Signal filtering complete: ${signals.length} signals found`);
      return signals;

    } catch (error) {
      console.error('❌ Signal filtering failed:', error.message);
      throw error;
    }
  }

  /**
   * Normalize content for analysis
   * @param {string} content - Raw content
   * @returns {string} Normalized content
   */
  normalizeContent(content) {
    if (!content || typeof content !== 'string') {
      return '';
    }

    return content
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ') // Remove special chars except hyphens
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Get tag detection analytics
   * @param {number} days - Number of days to analyze
   * @returns {Object} Analytics data
   */
  async getTagAnalytics(days = 30) {
    try {
      const { data: signals, error } = await this.supabase
        .from('intelligence_signals')
        .select('tags, confidence_score, detected_at')
        .gte('detected_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        throw new Error(`Failed to get tag analytics: ${error.message}`);
      }

      const analytics = {
        total_signals: signals.length,
        unique_tags: new Set(),
        tag_frequency: {},
        tag_confidence: {},
        category_distribution: {},
        period_days: days
      };

      signals.forEach(signal => {
        if (signal.tags) {
          signal.tags.forEach(tag => {
            analytics.unique_tags.add(tag);
            analytics.tag_frequency[tag] = (analytics.tag_frequency[tag] || 0) + 1;
            
            if (!analytics.tag_confidence[tag]) {
              analytics.tag_confidence[tag] = [];
            }
            analytics.tag_confidence[tag].push(signal.confidence_score);
          });
        }
      });

      // Calculate average confidence per tag
      Object.keys(analytics.tag_confidence).forEach(tag => {
        const confidences = analytics.tag_confidence[tag];
        analytics.tag_confidence[tag] = confidences.reduce((a, b) => a + b, 0) / confidences.length;
      });

      // Category distribution
      Object.keys(this.tagTaxonomies).forEach(category => {
        const categoryTags = Array.from(analytics.unique_tags).filter(tag => 
          tag.includes(category) || 
          this.tagTaxonomies[category].tags.includes(tag)
        );
        
        if (categoryTags.length > 0) {
          analytics.category_distribution[category] = categoryTags.length;
        }
      });

      analytics.unique_tags = Array.from(analytics.unique_tags);

      return analytics;

    } catch (error) {
      console.error('Failed to get tag analytics:', error.message);
      throw error;
    }
  }
}

module.exports = TagDetectionFilter;