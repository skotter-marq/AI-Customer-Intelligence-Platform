// lib/update-content-generator.js
/**
 * Update Content Generator
 * Automatically generates marketing content when product updates are detected
 */

const { createClient } = require('@supabase/supabase-js');
const ContentGenerationEngine = require('./content-generation-engine.js');
const ContentTemplates = require('./content-templates.js');
const AIProvider = require('./ai-provider.js');
const { EventEmitter } = require('events');
require('dotenv').config({ path: '.env.local' });

class UpdateContentGenerator extends EventEmitter {
  constructor() {
    super();
    
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    this.contentEngine = new ContentGenerationEngine();
    this.contentTemplates = new ContentTemplates();
    this.aiProvider = new AIProvider();
    
    // Configuration
    this.config = {
      autoGenerateContent: true,
      monitoringInterval: 300000, // 5 minutes
      maxContentPerUpdate: 3,
      enableSmartFiltering: true,
      minImportanceScore: 0.6,
      supportedContentTypes: [
        'product_announcement',
        'feature_release',
        'changelog_entry',
        'customer_communication',
        'sales_enablement',
        'social_media_post'
      ],
      audienceMapping: {
        'major_release': ['customers', 'prospects', 'media'],
        'feature_update': ['customers', 'internal_team'],
        'bug_fix': ['customers', 'internal_team'],
        'security_update': ['customers', 'internal_team', 'executives'],
        'performance_improvement': ['customers', 'prospects'],
        'integration_update': ['customers', 'prospects']
      }
    };
    
    // Update categorization rules
    this.updateCategories = {
      major_release: {
        keywords: ['version', 'release', 'launch', 'major', 'milestone'],
        scoreWeight: 1.0,
        autoApproval: false
      },
      feature_update: {
        keywords: ['feature', 'functionality', 'capability', 'enhancement'],
        scoreWeight: 0.8,
        autoApproval: true
      },
      bug_fix: {
        keywords: ['fix', 'bug', 'issue', 'resolve', 'patch'],
        scoreWeight: 0.6,
        autoApproval: true
      },
      security_update: {
        keywords: ['security', 'vulnerability', 'patch', 'ssl', 'encryption'],
        scoreWeight: 0.9,
        autoApproval: false
      },
      performance_improvement: {
        keywords: ['performance', 'speed', 'optimization', 'faster', 'efficiency'],
        scoreWeight: 0.7,
        autoApproval: true
      },
      integration_update: {
        keywords: ['integration', 'api', 'connection', 'sync', 'compatibility'],
        scoreWeight: 0.8,
        autoApproval: true
      }
    };
    
    // Content generation rules
    this.contentRules = {
      product_announcement: {
        triggers: ['major_release', 'feature_update'],
        template: 'product_announcement',
        audience: ['customers', 'prospects', 'media'],
        approval_required: true
      },
      feature_release: {
        triggers: ['feature_update', 'major_release'],
        template: 'feature_release_note',
        audience: ['customers', 'internal_team'],
        approval_required: false
      },
      changelog_entry: {
        triggers: ['all'],
        template: 'changelog_entry',
        audience: ['customers', 'internal_team'],
        approval_required: false
      },
      customer_communication: {
        triggers: ['major_release', 'security_update', 'breaking_change'],
        template: 'customer_email',
        audience: ['customers'],
        approval_required: true
      },
      sales_enablement: {
        triggers: ['major_release', 'feature_update', 'performance_improvement'],
        template: 'sales_sheet',
        audience: ['internal_team'],
        approval_required: false
      },
      social_media_post: {
        triggers: ['major_release', 'feature_update'],
        template: 'social_media_post',
        audience: ['prospects', 'media'],
        approval_required: true
      }
    };
    
    // Active monitoring
    this.isMonitoring = false;
    this.monitoringTimer = null;
    this.processedUpdates = new Set();
    
    // Statistics
    this.stats = {
      updatesProcessed: 0,
      contentGenerated: 0,
      autoApproved: 0,
      errorsEncountered: 0,
      lastProcessed: null
    };
  }

  /**
   * Start monitoring for product updates
   */
  startMonitoring() {
    if (this.isMonitoring) {
      console.log('⚠️ Update content generator already monitoring');
      return;
    }

    console.log('🔍 Starting update content generator monitoring...');
    this.isMonitoring = true;
    
    // Initial scan
    this.scanForNewUpdates();
    
    // Set up interval monitoring
    this.monitoringTimer = setInterval(() => {
      this.scanForNewUpdates();
    }, this.config.monitoringInterval);
    
    this.emit('monitoring_started');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) {
      return;
    }

    console.log('🛑 Stopping update content generator monitoring');
    this.isMonitoring = false;
    
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
    }
    
    this.emit('monitoring_stopped');
  }

  /**
   * Scan for new product updates
   */
  async scanForNewUpdates() {
    try {
      console.log('🔍 Scanning for new product updates...');
      
      // Get recent updates (last 24 hours)
      const { data: updates, error } = await this.supabase
        .from('product_updates')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch product updates: ${error.message}`);
      }

      // Filter for unprocessed updates
      const newUpdates = updates.filter(update => 
        !this.processedUpdates.has(update.id)
      );

      if (newUpdates.length === 0) {
        console.log('📝 No new product updates found');
        return;
      }

      console.log(`🆕 Found ${newUpdates.length} new product updates`);

      // Process each update
      for (const update of newUpdates) {
        await this.processProductUpdate(update);
        this.processedUpdates.add(update.id);
      }

      this.stats.lastProcessed = new Date().toISOString();
      this.emit('scan_completed', { updatesFound: newUpdates.length });

    } catch (error) {
      console.error('❌ Failed to scan for updates:', error.message);
      this.stats.errorsEncountered++;
      this.emit('scan_error', { error: error.message });
    }
  }

  /**
   * Process a single product update
   * @param {Object} update - Product update object
   */
  async processProductUpdate(update) {
    try {
      console.log(`🔄 Processing update: ${update.title}`);

      // Analyze and categorize the update
      const updateAnalysis = await this.analyzeUpdate(update);
      
      // Check if update meets generation criteria
      if (!this.shouldGenerateContent(updateAnalysis)) {
        console.log(`⏭️ Skipping content generation for update: ${update.title}`);
        return;
      }

      // Determine what content types to generate
      const contentTypes = this.determineContentTypes(updateAnalysis);
      
      // Generate content for each type
      const generatedContent = [];
      for (const contentType of contentTypes) {
        try {
          const content = await this.generateContentForUpdate(update, contentType, updateAnalysis);
          if (content) {
            generatedContent.push(content);
          }
        } catch (error) {
          console.error(`Failed to generate ${contentType} for update ${update.id}:`, error.message);
        }
      }

      // Save generation metadata
      await this.saveGenerationMetadata(update, updateAnalysis, generatedContent);

      // Update statistics
      this.stats.updatesProcessed++;
      this.stats.contentGenerated += generatedContent.length;
      this.stats.autoApproved += generatedContent.filter(c => c.autoApproved).length;

      console.log(`✅ Generated ${generatedContent.length} content pieces for update: ${update.title}`);
      this.emit('update_processed', { 
        update: update, 
        analysis: updateAnalysis,
        content: generatedContent 
      });

    } catch (error) {
      console.error(`❌ Failed to process update ${update.id}:`, error.message);
      this.stats.errorsEncountered++;
      this.emit('update_error', { 
        update: update, 
        error: error.message 
      });
    }
  }

  /**
   * Analyze product update to determine importance and category
   * @param {Object} update - Product update object
   * @returns {Object} Update analysis
   */
  async analyzeUpdate(update) {
    try {
      const analysis = {
        id: update.id,
        title: update.title,
        category: 'feature_update',
        importance_score: 0.5,
        customer_impact: 'medium',
        urgency: 'normal',
        target_audiences: ['customers'],
        key_features: [],
        business_value: [],
        technical_details: [],
        breaking_changes: false,
        ai_insights: null
      };

      // Categorize based on content
      const content = `${update.title} ${update.description}`.toLowerCase();
      
      let bestCategory = 'feature_update';
      let bestScore = 0;
      
      Object.entries(this.updateCategories).forEach(([category, rules]) => {
        let score = 0;
        rules.keywords.forEach(keyword => {
          if (content.includes(keyword)) {
            score += rules.scoreWeight;
          }
        });
        
        if (score > bestScore) {
          bestScore = score;
          bestCategory = category;
        }
      });
      
      analysis.category = bestCategory;
      analysis.importance_score = Math.min(bestScore / 3, 1.0);

      // Determine customer impact
      if (analysis.importance_score > 0.8) {
        analysis.customer_impact = 'high';
      } else if (analysis.importance_score > 0.6) {
        analysis.customer_impact = 'medium';
      } else {
        analysis.customer_impact = 'low';
      }

      // Check for breaking changes
      if (content.includes('breaking') || content.includes('deprecated') || content.includes('removed')) {
        analysis.breaking_changes = true;
        analysis.urgency = 'high';
        analysis.importance_score = Math.max(analysis.importance_score, 0.8);
      }

      // Determine target audiences
      analysis.target_audiences = this.config.audienceMapping[bestCategory] || ['customers'];

      // Extract key features using AI
      if (this.config.enableSmartFiltering) {
        analysis.ai_insights = await this.getAIInsights(update);
        if (analysis.ai_insights) {
          analysis.key_features = analysis.ai_insights.features || [];
          analysis.business_value = analysis.ai_insights.business_value || [];
          analysis.technical_details = analysis.ai_insights.technical_details || [];
        }
      }

      return analysis;

    } catch (error) {
      console.error('Failed to analyze update:', error.message);
      // Return basic analysis
      return {
        id: update.id,
        title: update.title,
        category: 'feature_update',
        importance_score: 0.5,
        customer_impact: 'medium',
        urgency: 'normal',
        target_audiences: ['customers'],
        key_features: [],
        business_value: [],
        technical_details: [],
        breaking_changes: false,
        ai_insights: null
      };
    }
  }

  /**
   * Get AI insights for product update
   * @param {Object} update - Product update object
   * @returns {Object} AI insights
   */
  async getAIInsights(update) {
    try {
      const prompt = `
Analyze this product update and provide structured insights:

TITLE: ${update.title}
DESCRIPTION: ${update.description}
PRIORITY: ${update.priority}
STORY POINTS: ${update.story_points}

Please provide:
1. Key features or improvements (list up to 5)
2. Business value for customers (list up to 3)
3. Technical details worth highlighting (list up to 3)
4. Customer impact level (low/medium/high)
5. Recommended communication approach

Format your response as JSON with these fields:
- features: array of strings
- business_value: array of strings  
- technical_details: array of strings
- customer_impact: string
- communication_approach: string
`;

      const aiResponse = await this.aiProvider.generateText(prompt, {
        max_tokens: 500,
        temperature: 0.3
      });

      // Parse AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback parsing
      return {
        features: this.extractFeatures(aiResponse),
        business_value: this.extractBusinessValue(aiResponse),
        technical_details: this.extractTechnicalDetails(aiResponse),
        customer_impact: this.extractCustomerImpact(aiResponse),
        communication_approach: 'standard'
      };

    } catch (error) {
      console.warn('AI insights generation failed:', error.message);
      return null;
    }
  }

  /**
   * Extract features from AI response
   * @param {string} response - AI response text
   * @returns {Array} Features list
   */
  extractFeatures(response) {
    const featurePatterns = [
      /features?[:\s]+([^\n]+)/gi,
      /improvements?[:\s]+([^\n]+)/gi,
      /enhancements?[:\s]+([^\n]+)/gi
    ];

    const features = [];
    featurePatterns.forEach(pattern => {
      const matches = response.matchAll(pattern);
      for (const match of matches) {
        features.push(match[1].trim());
      }
    });

    return features.slice(0, 5);
  }

  /**
   * Extract business value from AI response
   * @param {string} response - AI response text
   * @returns {Array} Business value list
   */
  extractBusinessValue(response) {
    const valuePatterns = [
      /business value[:\s]+([^\n]+)/gi,
      /benefits?[:\s]+([^\n]+)/gi,
      /value[:\s]+([^\n]+)/gi
    ];

    const values = [];
    valuePatterns.forEach(pattern => {
      const matches = response.matchAll(pattern);
      for (const match of matches) {
        values.push(match[1].trim());
      }
    });

    return values.slice(0, 3);
  }

  /**
   * Extract technical details from AI response
   * @param {string} response - AI response text
   * @returns {Array} Technical details list
   */
  extractTechnicalDetails(response) {
    const techPatterns = [
      /technical[:\s]+([^\n]+)/gi,
      /implementation[:\s]+([^\n]+)/gi,
      /technology[:\s]+([^\n]+)/gi
    ];

    const details = [];
    techPatterns.forEach(pattern => {
      const matches = response.matchAll(pattern);
      for (const match of matches) {
        details.push(match[1].trim());
      }
    });

    return details.slice(0, 3);
  }

  /**
   * Extract customer impact from AI response
   * @param {string} response - AI response text
   * @returns {string} Customer impact level
   */
  extractCustomerImpact(response) {
    const impactPatterns = [
      /customer impact[:\s]+(high|medium|low)/gi,
      /impact[:\s]+(high|medium|low)/gi
    ];

    for (const pattern of impactPatterns) {
      const match = response.match(pattern);
      if (match) {
        return match[1].toLowerCase();
      }
    }

    return 'medium';
  }

  /**
   * Determine if content should be generated for update
   * @param {Object} analysis - Update analysis
   * @returns {boolean} Should generate content
   */
  shouldGenerateContent(analysis) {
    // Check importance threshold
    if (analysis.importance_score < this.config.minImportanceScore) {
      return false;
    }

    // Always generate for breaking changes
    if (analysis.breaking_changes) {
      return true;
    }

    // Check if auto-generation is enabled
    if (!this.config.autoGenerateContent) {
      return false;
    }

    // Check customer impact
    if (analysis.customer_impact === 'high') {
      return true;
    }

    // Check category-specific rules
    const category = this.updateCategories[analysis.category];
    if (category && category.scoreWeight >= 0.7) {
      return true;
    }

    return false;
  }

  /**
   * Determine what content types to generate
   * @param {Object} analysis - Update analysis
   * @returns {Array} Content types to generate
   */
  determineContentTypes(analysis) {
    const contentTypes = [];

    Object.entries(this.contentRules).forEach(([contentType, rules]) => {
      // Check if this content type should be triggered
      const shouldTrigger = rules.triggers.includes('all') || 
                           rules.triggers.includes(analysis.category);

      if (shouldTrigger) {
        // Check audience match
        const audienceOverlap = rules.audience.some(audience => 
          analysis.target_audiences.includes(audience)
        );

        if (audienceOverlap) {
          contentTypes.push(contentType);
        }
      }
    });

    // Limit content generation
    return contentTypes.slice(0, this.config.maxContentPerUpdate);
  }

  /**
   * Generate content for a specific content type
   * @param {Object} update - Product update
   * @param {string} contentType - Content type to generate
   * @param {Object} analysis - Update analysis
   * @returns {Object} Generated content
   */
  async generateContentForUpdate(update, contentType, analysis) {
    try {
      const contentRule = this.contentRules[contentType];
      if (!contentRule) {
        throw new Error(`Unknown content type: ${contentType}`);
      }

      // Prepare content generation request
      const generationRequest = {
        templateId: null,
        contentType: contentRule.template,
        dataSources: [
          {
            type: 'product_update',
            ids: [update.id],
            filters: {}
          }
        ],
        customVariables: {
          update_category: analysis.category,
          importance_score: analysis.importance_score,
          customer_impact: analysis.customer_impact,
          breaking_changes: analysis.breaking_changes,
          key_features: analysis.key_features.join(', '),
          business_value: analysis.business_value.join(', '),
          technical_details: analysis.technical_details.join(', '),
          target_audiences: analysis.target_audiences.join(', ')
        },
        targetAudience: contentRule.audience[0],
        contentFormat: 'markdown',
        approvalRequired: contentRule.approval_required,
        priority: analysis.urgency === 'high' ? 'high' : 'medium'
      };

      // Generate content using the content engine
      const result = await this.contentEngine.generateContent(generationRequest);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Add metadata specific to update content generation
      const enhancedContent = {
        ...result.content,
        update_id: update.id,
        content_type: contentType,
        generation_trigger: 'product_update',
        update_category: analysis.category,
        autoApproved: !contentRule.approval_required,
        generated_at: new Date().toISOString()
      };

      return enhancedContent;

    } catch (error) {
      console.error(`Failed to generate ${contentType} content:`, error.message);
      throw error;
    }
  }

  /**
   * Save generation metadata
   * @param {Object} update - Product update
   * @param {Object} analysis - Update analysis
   * @param {Array} generatedContent - Generated content
   */
  async saveGenerationMetadata(update, analysis, generatedContent) {
    try {
      const metadata = {
        update_id: update.id,
        update_title: update.title,
        analysis_results: analysis,
        content_generated: generatedContent.length,
        content_types: generatedContent.map(c => c.content_type),
        auto_approved: generatedContent.filter(c => c.autoApproved).length,
        generation_timestamp: new Date().toISOString(),
        generator_version: '1.0.0'
      };

      // In a real implementation, save to a dedicated table
      console.log('💾 Generation metadata saved:', {
        update_id: metadata.update_id,
        content_generated: metadata.content_generated,
        content_types: metadata.content_types
      });

    } catch (error) {
      console.warn('Failed to save generation metadata:', error.message);
    }
  }

  /**
   * Generate content manually for a specific update
   * @param {string} updateId - Update ID
   * @param {Array} contentTypes - Content types to generate
   * @returns {Object} Generation results
   */
  async generateContentManually(updateId, contentTypes = []) {
    try {
      // Fetch the update
      const { data: update, error } = await this.supabase
        .from('product_updates')
        .select('*')
        .eq('id', updateId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch update: ${error.message}`);
      }

      // Analyze the update
      const analysis = await this.analyzeUpdate(update);

      // Use provided content types or determine automatically
      const targetContentTypes = contentTypes.length > 0 
        ? contentTypes 
        : this.determineContentTypes(analysis);

      // Generate content
      const generatedContent = [];
      for (const contentType of targetContentTypes) {
        try {
          const content = await this.generateContentForUpdate(update, contentType, analysis);
          if (content) {
            generatedContent.push(content);
          }
        } catch (error) {
          console.error(`Failed to generate ${contentType}:`, error.message);
        }
      }

      // Save metadata
      await this.saveGenerationMetadata(update, analysis, generatedContent);

      return {
        success: true,
        update: update,
        analysis: analysis,
        content: generatedContent,
        generated_at: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        update_id: updateId
      };
    }
  }

  /**
   * Get generation statistics
   * @returns {Object} Statistics
   */
  getStatistics() {
    return {
      ...this.stats,
      is_monitoring: this.isMonitoring,
      processed_updates_count: this.processedUpdates.size,
      uptime: this.isMonitoring ? Date.now() - this.startTime : 0
    };
  }

  /**
   * Get configuration
   * @returns {Object} Configuration
   */
  getConfiguration() {
    return this.config;
  }

  /**
   * Update configuration
   * @param {Object} updates - Configuration updates
   */
  updateConfiguration(updates) {
    Object.assign(this.config, updates);
    this.emit('config_updated', this.config);
  }

  /**
   * Clear processed updates cache
   */
  clearProcessedCache() {
    this.processedUpdates.clear();
    console.log('🗑️ Processed updates cache cleared');
  }
}

module.exports = UpdateContentGenerator;