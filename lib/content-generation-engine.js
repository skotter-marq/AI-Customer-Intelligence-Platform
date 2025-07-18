// lib/content-generation-engine.js
/**
 * Content Generation Engine
 * Automatically generates marketing content from customer insights and competitive intelligence
 */

const { createClient } = require('@supabase/supabase-js');
const ContentTemplates = require('./content-templates.js');
const AIProvider = require('./ai-provider.js');
const TLDRGenerator = require('./tldr-generator.js');
require('dotenv').config({ path: '.env.local' });

class ContentGenerationEngine {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    this.contentTemplates = new ContentTemplates();
    this.aiProvider = new AIProvider();
    this.tldrGenerator = new TLDRGenerator();
    
    // Content quality thresholds
    this.qualityThresholds = {
      minimum_quality: 0.6,
      minimum_readability: 0.7,
      minimum_engagement: 0.5
    };
    
    // Data source mappings
    this.dataSourceMappings = {
      'customer_meeting': 'meetings',
      'customer_insight': 'insights',
      'competitive_signal': 'intelligence_signals',
      'product_update': 'product_updates',
      'market_research': 'intelligence_reports',
      'customer_feedback': 'insights'
    };
  }

  /**
   * Generate content from data sources
   * @param {Object} request - Content generation request
   * @returns {Object} Generated content
   */
  async generateContent(request) {
    try {
      console.log(`🎯 Generating content: ${request.contentType || 'Unknown'}`);
      
      const {
        templateId,
        contentType,
        dataSources = [],
        customVariables = {},
        targetAudience = 'prospects',
        contentFormat = 'markdown',
        approvalRequired = true,
        campaignId = null,
        priority = 'medium'
      } = request;

      // Step 1: Get or select template
      const template = await this.getTemplate(templateId, contentType);
      
      // Step 2: Gather data from sources
      const sourceData = await this.gatherSourceData(dataSources);
      
      // Step 3: Extract variables from data
      const extractedVariables = await this.extractVariables(sourceData, template);
      
      // Step 4: Merge with custom variables
      const allVariables = { ...extractedVariables, ...customVariables };
      
      // Step 5: Generate content using AI enhancement
      const generatedContent = await this.generateContentWithAI(template, allVariables, sourceData);
      
      // Step 6: Process template with variables
      const processedContent = this.contentTemplates.processTemplate(
        generatedContent.enhanced_content || template.template_content,
        allVariables
      );
      
      // Step 7: Calculate quality scores
      const qualityMetrics = await this.calculateQualityMetrics(processedContent, template);
      
      // Step 8: Save generated content
      const savedContent = await this.saveGeneratedContent({
        template,
        processedContent,
        allVariables,
        sourceData,
        qualityMetrics,
        targetAudience,
        contentFormat,
        approvalRequired,
        campaignId,
        priority,
        generationMetadata: generatedContent.metadata
      });
      
      // Step 9: Generate TLDR summary
      const tldrSummary = await this.generateTLDRSummary(savedContent, template);
      
      // Step 10: Create approval workflow if needed
      if (approvalRequired) {
        await this.createApprovalWorkflow(savedContent, template);
      }
      
      console.log(`✅ Content generated successfully: ${savedContent.id}`);
      
      return {
        success: true,
        content: savedContent,
        tldr: tldrSummary,
        qualityMetrics,
        variables: allVariables,
        sourceData: sourceData.length,
        aiEnhanced: !!generatedContent.enhanced_content
      };

    } catch (error) {
      console.error('❌ Content generation failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get template by ID or type
   * @param {string} templateId - Template ID
   * @param {string} contentType - Content type
   * @returns {Object} Template
   */
  async getTemplate(templateId, contentType) {
    try {
      if (templateId) {
        return await this.contentTemplates.getTemplate(templateId);
      }
      
      if (contentType) {
        const templates = await this.contentTemplates.getTemplates();
        const matchingTemplate = templates.find(t => 
          t.template_type === contentType || 
          t.template_name.toLowerCase().includes(contentType.toLowerCase())
        );
        
        if (matchingTemplate) {
          return matchingTemplate;
        }
      }
      
      throw new Error('No suitable template found');
    } catch (error) {
      throw new Error(`Failed to get template: ${error.message}`);
    }
  }

  /**
   * Gather data from specified sources
   * @param {Array} dataSources - Data source specifications
   * @returns {Array} Gathered data
   */
  async gatherSourceData(dataSources) {
    try {
      const sourceData = [];
      
      for (const source of dataSources) {
        const { type, ids, filters = {} } = source;
        
        if (!this.dataSourceMappings[type]) {
          console.warn(`Unknown data source type: ${type}`);
          continue;
        }
        
        const tableName = this.dataSourceMappings[type];
        let query = this.supabase.from(tableName).select('*');
        
        // Apply ID filters
        if (ids && ids.length > 0) {
          query = query.in('id', ids);
        }
        
        // Apply additional filters
        Object.entries(filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else {
            query = query.eq(key, value);
          }
        });
        
        // Limit results to prevent overwhelming
        query = query.limit(10);
        
        const { data, error } = await query;
        
        if (error) {
          console.warn(`Failed to fetch data from ${tableName}:`, error.message);
          continue;
        }
        
        sourceData.push(...data.map(item => ({
          ...item,
          source_type: type,
          source_table: tableName
        })));
      }
      
      console.log(`📊 Gathered ${sourceData.length} data points from ${dataSources.length} sources`);
      return sourceData;
    } catch (error) {
      console.error('Failed to gather source data:', error.message);
      return [];
    }
  }

  /**
   * Extract variables from source data
   * @param {Array} sourceData - Source data
   * @param {Object} template - Template object
   * @returns {Object} Extracted variables
   */
  async extractVariables(sourceData, template) {
    try {
      const variables = {};
      const templateVariables = template.template_variables || {};
      
      // Extract variables based on source data types
      for (const data of sourceData) {
        switch (data.source_type) {
          case 'customer_meeting':
            await this.extractMeetingVariables(data, variables);
            break;
          case 'customer_insight':
            await this.extractInsightVariables(data, variables);
            break;
          case 'competitive_signal':
            await this.extractCompetitiveVariables(data, variables);
            break;
          case 'product_update':
            await this.extractProductUpdateVariables(data, variables);
            break;
          default:
            await this.extractGenericVariables(data, variables);
        }
      }
      
      // Ensure all required template variables have values
      Object.keys(templateVariables).forEach(varName => {
        if (!variables[varName]) {
          variables[varName] = `[${varName}]`;
        }
      });
      
      console.log(`🔍 Extracted ${Object.keys(variables).length} variables`);
      return variables;
    } catch (error) {
      console.error('Failed to extract variables:', error.message);
      return {};
    }
  }

  /**
   * Extract variables from meeting data
   * @param {Object} meetingData - Meeting data
   * @param {Object} variables - Variables object to populate
   */
  async extractMeetingVariables(meetingData, variables) {
    // Get customer info
    if (meetingData.customer_id) {
      const { data: customer } = await this.supabase
        .from('customers')
        .select('*')
        .eq('id', meetingData.customer_id)
        .single();
      
      if (customer) {
        variables.customer_name = customer.name || customer.company_name;
        variables.customer_description = customer.description || `${customer.name} is a ${customer.industry} company`;
        variables.company_size = customer.company_size;
        variables.industry = customer.industry;
      }
    }
    
    // Extract meeting details
    variables.meeting_title = meetingData.title;
    variables.meeting_date = new Date(meetingData.date || meetingData.meeting_date).toLocaleDateString();
    variables.duration = meetingData.duration_minutes ? `${meetingData.duration_minutes} minutes` : 'N/A';
    
    // Extract participant info
    if (meetingData.participants || meetingData.attendees) {
      const participants = meetingData.participants || meetingData.attendees;
      if (participants.length > 0) {
        const customerContact = participants.find(p => !p.email?.includes('@ourcompany.com'));
        if (customerContact) {
          variables.customer_contact_name = customerContact.name;
          variables.customer_contact_title = customerContact.role || customerContact.title;
          variables.customer_contact_email = customerContact.email;
        }
      }
    }
    
    // Extract content from transcript
    if (meetingData.transcript || meetingData.raw_transcript) {
      const transcript = meetingData.transcript || meetingData.raw_transcript;
      variables.transcript_excerpt = transcript.substring(0, 500) + '...';
    }
  }

  /**
   * Extract variables from insight data
   * @param {Object} insightData - Insight data
   * @param {Object} variables - Variables object to populate
   */
  async extractInsightVariables(insightData, variables) {
    variables.insight_title = insightData.title;
    variables.insight_description = insightData.description;
    variables.insight_type = insightData.insight_type;
    variables.confidence_score = insightData.confidence_score;
    variables.sentiment_score = insightData.sentiment_score;
    variables.priority = insightData.priority;
    
    // Extract specific insights based on type
    switch (insightData.insight_type) {
      case 'pain_point':
        variables.challenge_description = insightData.description;
        variables.impact_area = insightData.tags?.[0] || 'operations';
        break;
      case 'feature_request':
        variables.requested_feature = insightData.title;
        variables.feature_benefit = insightData.description;
        break;
      case 'opportunity':
        variables.opportunity_description = insightData.description;
        variables.potential_value = 'significant business impact';
        break;
    }
    
    // Extract quotes if available
    if (insightData.description && insightData.description.includes('"')) {
      const quoteMatch = insightData.description.match(/"([^"]+)"/);
      if (quoteMatch) {
        variables.customer_quote = quoteMatch[1];
      }
    }
  }

  /**
   * Extract variables from competitive signal data
   * @param {Object} competitiveData - Competitive signal data
   * @param {Object} variables - Variables object to populate
   */
  async extractCompetitiveVariables(competitiveData, variables) {
    // Get competitor info
    if (competitiveData.competitor_id) {
      const { data: competitor } = await this.supabase
        .from('competitors')
        .select('*')
        .eq('id', competitiveData.competitor_id)
        .single();
      
      if (competitor) {
        variables.competitor_name = competitor.name;
        variables.competitor_description = competitor.description;
        variables.threat_level = competitor.threat_level;
        variables.market_position = competitor.market_position;
        variables.their_pricing = competitor.pricing_model;
      }
    }
    
    variables.signal_title = competitiveData.title;
    variables.signal_description = competitiveData.description;
    variables.signal_type = competitiveData.signal_type;
    variables.importance_score = competitiveData.importance_score;
    variables.recent_intelligence = competitiveData.description;
    variables.last_updated = new Date(competitiveData.detected_at).toLocaleDateString();
    
    // Extract specific competitive insights
    switch (competitiveData.signal_type) {
      case 'product_launch':
        variables.competitor_product = competitiveData.title;
        variables.product_features = competitiveData.description;
        break;
      case 'pricing_change':
        variables.pricing_update = competitiveData.description;
        break;
      case 'partnership':
        variables.partnership_details = competitiveData.description;
        break;
    }
  }

  /**
   * Extract variables from product update data
   * @param {Object} productData - Product update data
   * @param {Object} variables - Variables object to populate
   */
  async extractProductUpdateVariables(productData, variables) {
    variables.product_name = 'Our Product'; // Default
    variables.update_title = productData.title;
    variables.update_description = productData.description;
    variables.completion_date = new Date(productData.completion_date).toLocaleDateString();
    variables.priority = productData.priority;
    variables.story_points = productData.story_points;
    
    // Extract JIRA details if available
    if (productData.jira_story_key) {
      variables.jira_key = productData.jira_story_key;
      variables.story_link = `https://jira.company.com/browse/${productData.jira_story_key}`;
    }
    
    // Extract benefits based on update type
    if (productData.description) {
      if (productData.description.toLowerCase().includes('performance')) {
        variables.customer_benefit = 'Improved performance and faster loading times';
      } else if (productData.description.toLowerCase().includes('security')) {
        variables.customer_benefit = 'Enhanced security and data protection';
      } else if (productData.description.toLowerCase().includes('integration')) {
        variables.customer_benefit = 'Better integration capabilities';
      } else {
        variables.customer_benefit = 'Enhanced functionality and user experience';
      }
    }
  }

  /**
   * Extract generic variables from any data
   * @param {Object} data - Data object
   * @param {Object} variables - Variables object to populate
   */
  async extractGenericVariables(data, variables) {
    // Extract common fields
    if (data.title) variables.title = data.title;
    if (data.description) variables.description = data.description;
    if (data.created_at) variables.created_date = new Date(data.created_at).toLocaleDateString();
    if (data.updated_at) variables.updated_date = new Date(data.updated_at).toLocaleDateString();
    if (data.tags) variables.tags = data.tags;
    
    // Extract any additional fields that might be useful
    Object.keys(data).forEach(key => {
      if (!variables[key] && typeof data[key] === 'string' && data[key].length < 200) {
        variables[key] = data[key];
      }
    });
  }

  /**
   * Generate content with AI enhancement
   * @param {Object} template - Template object
   * @param {Object} variables - Variables object
   * @param {Array} sourceData - Source data
   * @returns {Object} AI-enhanced content
   */
  async generateContentWithAI(template, variables, sourceData) {
    try {
      const prompt = `
You are an expert marketing content writer. Please enhance the following content template with the provided data.

TEMPLATE TYPE: ${template.template_type}
TEMPLATE CATEGORY: ${template.template_category}
TARGET AUDIENCE: ${template.target_audience}

TEMPLATE CONTENT:
${template.template_content}

AVAILABLE VARIABLES:
${JSON.stringify(variables, null, 2)}

SOURCE DATA CONTEXT:
${JSON.stringify(sourceData.map(d => ({
  type: d.source_type,
  title: d.title,
  description: d.description?.substring(0, 200)
})), null, 2)}

Please provide:
1. Enhanced content that maintains the template structure but improves readability and engagement
2. Ensure all variables are properly utilized
3. Add compelling details based on the source data
4. Maintain professional tone appropriate for ${template.target_audience}
5. Optimize for clarity and impact

Return the enhanced content in the same format as the original template.
`;

      const aiResponse = await this.aiProvider.generateText(prompt);
      
      return {
        enhanced_content: aiResponse,
        metadata: {
          ai_enhanced: true,
          template_type: template.template_type,
          variables_used: Object.keys(variables).length,
          source_data_points: sourceData.length,
          enhancement_timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.warn('AI enhancement failed, using template as-is:', error.message);
      return {
        enhanced_content: null,
        metadata: {
          ai_enhanced: false,
          enhancement_error: error.message
        }
      };
    }
  }

  /**
   * Calculate quality metrics for generated content
   * @param {string} content - Generated content
   * @param {Object} template - Template object
   * @returns {Object} Quality metrics
   */
  async calculateQualityMetrics(content, template) {
    try {
      const metrics = {
        quality_score: 0,
        readability_score: 0,
        seo_score: 0,
        engagement_prediction: 0,
        word_count: 0,
        character_count: 0,
        estimated_reading_time: 0
      };

      // Basic metrics
      metrics.character_count = content.length;
      metrics.word_count = content.split(/\s+/).filter(word => word.length > 0).length;
      metrics.estimated_reading_time = Math.ceil(metrics.word_count / 200); // ~200 words per minute

      // Quality score (0-1)
      let qualityScore = 0.5; // Base score
      
      // Content length appropriateness
      if (metrics.word_count >= 100 && metrics.word_count <= 2000) {
        qualityScore += 0.1;
      }
      
      // Variable completion check
      const missingVariables = content.match(/\[\w+\]/g) || [];
      if (missingVariables.length === 0) {
        qualityScore += 0.2;
      } else {
        qualityScore -= missingVariables.length * 0.05;
      }
      
      // Structure check (headings, bullets, etc.)
      if (content.includes('#') || content.includes('*') || content.includes('-')) {
        qualityScore += 0.1;
      }
      
      // Readability score (simplified)
      const avgWordsPerSentence = metrics.word_count / (content.split(/[.!?]+/).length || 1);
      if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 20) {
        metrics.readability_score = 0.8;
      } else if (avgWordsPerSentence <= 25) {
        metrics.readability_score = 0.6;
      } else {
        metrics.readability_score = 0.4;
      }
      
      // SEO score (basic keyword density and structure)
      const hasHeadings = content.includes('#');
      const hasKeywords = template.template_type && content.toLowerCase().includes(template.template_type.toLowerCase());
      metrics.seo_score = (hasHeadings ? 0.5 : 0) + (hasKeywords ? 0.3 : 0) + 0.2;
      
      // Engagement prediction (based on content type and structure)
      let engagementScore = 0.5;
      if (content.includes('?')) engagementScore += 0.1; // Questions engage
      if (content.includes('"')) engagementScore += 0.1; // Quotes engage
      if (content.includes('!')) engagementScore += 0.05; // Exclamations
      if (content.includes('you') || content.includes('your')) engagementScore += 0.1; // Personal pronouns
      metrics.engagement_prediction = Math.min(engagementScore, 1.0);
      
      metrics.quality_score = Math.min(Math.max(qualityScore, 0), 1);
      
      return metrics;
    } catch (error) {
      console.error('Failed to calculate quality metrics:', error.message);
      return {
        quality_score: 0.5,
        readability_score: 0.5,
        seo_score: 0.5,
        engagement_prediction: 0.5,
        word_count: content.length,
        character_count: content.length,
        estimated_reading_time: 1
      };
    }
  }

  /**
   * Save generated content to database
   * @param {Object} contentData - Content data to save
   * @returns {Object} Saved content
   */
  async saveGeneratedContent(contentData) {
    try {
      const {
        template,
        processedContent,
        allVariables,
        sourceData,
        qualityMetrics,
        targetAudience,
        contentFormat,
        approvalRequired,
        campaignId,
        priority,
        generationMetadata
      } = contentData;

      const content = {
        template_id: template.id,
        content_title: this.generateContentTitle(template, allVariables),
        content_description: this.generateContentDescription(template, allVariables),
        generated_content: processedContent,
        content_type: template.template_type,
        content_format: contentFormat,
        source_data: {
          variables: allVariables,
          source_count: sourceData.length,
          source_types: [...new Set(sourceData.map(d => d.source_type))]
        },
        generation_metadata: generationMetadata,
        target_audience: targetAudience,
        status: approvalRequired ? 'under_review' : 'approved',
        quality_score: qualityMetrics.quality_score,
        readability_score: qualityMetrics.readability_score,
        seo_score: qualityMetrics.seo_score,
        engagement_prediction: qualityMetrics.engagement_prediction,
        word_count: qualityMetrics.word_count,
        character_count: qualityMetrics.character_count,
        estimated_reading_time: qualityMetrics.estimated_reading_time,
        keywords: this.extractKeywords(processedContent),
        created_by: 'Content Generation Engine'
      };

      const { data: savedContent, error } = await this.supabase
        .from('generated_content')
        .insert(content)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to save content: ${error.message}`);
      }

      // Save data source links
      await this.saveDataSourceLinks(savedContent.id, sourceData);

      // Link to campaign if specified
      if (campaignId) {
        await this.linkToCampaign(savedContent.id, campaignId);
      }

      return savedContent;
    } catch (error) {
      console.error('Failed to save generated content:', error.message);
      throw error;
    }
  }

  /**
   * Generate content title from template and variables
   * @param {Object} template - Template object
   * @param {Object} variables - Variables object
   * @returns {string} Generated title
   */
  generateContentTitle(template, variables) {
    const templateType = template.template_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    if (variables.customer_name) {
      return `${templateType}: ${variables.customer_name}`;
    } else if (variables.competitor_name) {
      return `${templateType}: ${variables.competitor_name}`;
    } else if (variables.product_name) {
      return `${templateType}: ${variables.product_name}`;
    } else if (variables.title) {
      return `${templateType}: ${variables.title}`;
    } else {
      return `${templateType} - ${new Date().toLocaleDateString()}`;
    }
  }

  /**
   * Generate content description
   * @param {Object} template - Template object
   * @param {Object} variables - Variables object
   * @returns {string} Generated description
   */
  generateContentDescription(template, variables) {
    let description = `Auto-generated ${template.template_type} content`;
    
    if (variables.customer_name) {
      description += ` for ${variables.customer_name}`;
    } else if (variables.competitor_name) {
      description += ` about ${variables.competitor_name}`;
    }
    
    description += ` using ${template.template_name} template`;
    
    return description;
  }

  /**
   * Extract keywords from content
   * @param {string} content - Content to analyze
   * @returns {Array} Keywords
   */
  extractKeywords(content) {
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    return Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Save data source links
   * @param {string} contentId - Content ID
   * @param {Array} sourceData - Source data
   */
  async saveDataSourceLinks(contentId, sourceData) {
    try {
      const links = sourceData.map(data => ({
        content_id: contentId,
        source_type: data.source_type,
        source_id: data.id,
        source_table: data.source_table,
        data_excerpt: (data.description || data.title || '').substring(0, 500),
        relevance_score: 0.8, // Default relevance
        usage_context: `Used in ${data.source_type} content generation`
      }));

      if (links.length > 0) {
        await this.supabase
          .from('content_data_sources')
          .insert(links);
      }
    } catch (error) {
      console.warn('Failed to save data source links:', error.message);
    }
  }

  /**
   * Link content to campaign
   * @param {string} contentId - Content ID
   * @param {string} campaignId - Campaign ID
   */
  async linkToCampaign(contentId, campaignId) {
    try {
      await this.supabase
        .from('content_campaign_assignments')
        .insert({
          campaign_id: campaignId,
          content_id: contentId,
          assignment_role: 'primary_content',
          sequence_order: 1
        });
    } catch (error) {
      console.warn('Failed to link content to campaign:', error.message);
    }
  }

  /**
   * Create approval workflow for content
   * @param {Object} content - Content object
   * @param {Object} template - Template object
   */
  async createApprovalWorkflow(content, template) {
    try {
      const approvalSteps = this.getApprovalSteps(template.template_type);
      
      const workflows = approvalSteps.map((step, index) => ({
        content_id: content.id,
        workflow_stage: step.stage,
        reviewer_email: step.reviewer_email,
        reviewer_name: step.reviewer_name,
        review_status: 'pending',
        priority_level: content.priority || 'medium',
        due_date: new Date(Date.now() + (step.days_to_complete || 3) * 24 * 60 * 60 * 1000).toISOString()
      }));

      if (workflows.length > 0) {
        await this.supabase
          .from('content_approval_workflow')
          .insert(workflows);
      }
    } catch (error) {
      console.warn('Failed to create approval workflow:', error.message);
    }
  }

  /**
   * Get approval steps for content type
   * @param {string} contentType - Content type
   * @returns {Array} Approval steps
   */
  getApprovalSteps(contentType) {
    const approvalSteps = {
      'case_study': [
        { stage: 'content_review', reviewer_email: 'marketing@company.com', reviewer_name: 'Marketing Team', days_to_complete: 2 },
        { stage: 'legal_review', reviewer_email: 'legal@company.com', reviewer_name: 'Legal Team', days_to_complete: 3 }
      ],
      'press_release': [
        { stage: 'content_review', reviewer_email: 'marketing@company.com', reviewer_name: 'Marketing Team', days_to_complete: 1 },
        { stage: 'legal_review', reviewer_email: 'legal@company.com', reviewer_name: 'Legal Team', days_to_complete: 2 },
        { stage: 'executive_approval', reviewer_email: 'exec@company.com', reviewer_name: 'Executive Team', days_to_complete: 1 }
      ],
      'battle_card': [
        { stage: 'content_review', reviewer_email: 'sales@company.com', reviewer_name: 'Sales Team', days_to_complete: 1 }
      ],
      'email_campaign': [
        { stage: 'content_review', reviewer_email: 'marketing@company.com', reviewer_name: 'Marketing Team', days_to_complete: 1 }
      ]
    };

    return approvalSteps[contentType] || [
      { stage: 'content_review', reviewer_email: 'marketing@company.com', reviewer_name: 'Marketing Team', days_to_complete: 2 }
    ];
  }

  /**
   * Generate TLDR summary for content
   * @param {Object} content - Generated content
   * @param {Object} template - Template used
   * @returns {Object} TLDR summary
   */
  async generateTLDRSummary(content, template) {
    try {
      console.log('📝 Generating TLDR summary...');
      
      // Prepare content for TLDR generation
      const contentForTLDR = {
        id: content.id,
        title: content.content_title,
        content: content.generated_content,
        content_type: content.content_type,
        target_audience: content.target_audience
      };
      
      // Determine appropriate style based on audience
      const style = this.getTLDRStyleForAudience(content.target_audience);
      
      // Generate TLDR
      const tldrResult = await this.tldrGenerator.generateTLDR(contentForTLDR, {
        style: style,
        maxLength: 400,
        includeMetrics: true,
        includeActionItems: true,
        contextType: template.template_type,
        targetAudience: content.target_audience
      });
      
      // Save TLDR summary to database
      await this.saveTLDRSummary(content.id, tldrResult);
      
      console.log(`✅ TLDR summary generated with ${tldrResult.metadata.compression_ratio.toFixed(2)} compression`);
      
      return tldrResult;
      
    } catch (error) {
      console.warn('⚠️ TLDR generation failed:', error.message);
      return {
        summary: {
          content: 'TLDR generation failed',
          bullet_points: [],
          key_takeaways: [],
          action_items: []
        },
        metadata: {
          error: error.message,
          generated_at: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Get appropriate TLDR style for audience
   * @param {string} audience - Target audience
   * @returns {string} TLDR style
   */
  getTLDRStyleForAudience(audience) {
    const styleMap = {
      'prospects': 'marketing',
      'customers': 'marketing',
      'internal_team': 'technical',
      'media': 'executive',
      'executives': 'executive'
    };
    
    return styleMap[audience] || 'executive';
  }

  /**
   * Save TLDR summary to database
   * @param {string} contentId - Content ID
   * @param {Object} tldrResult - TLDR result
   */
  async saveTLDRSummary(contentId, tldrResult) {
    try {
      // Update the generated content with TLDR summary
      await this.supabase
        .from('generated_content')
        .update({
          tldr_summary: tldrResult.summary.content,
          tldr_bullet_points: tldrResult.summary.bullet_points,
          tldr_key_takeaways: tldrResult.summary.key_takeaways,
          tldr_action_items: tldrResult.summary.action_items,
          tldr_compression_ratio: tldrResult.metadata.compression_ratio,
          tldr_reading_time: tldrResult.metadata.reading_time,
          tldr_confidence_score: tldrResult.metadata.confidence_score
        })
        .eq('id', contentId);
      
      console.log(`💾 TLDR summary saved for content ${contentId}`);
      
    } catch (error) {
      console.warn('⚠️ Failed to save TLDR summary:', error.message);
    }
  }

  /**
   * Get content generation analytics
   * @param {number} days - Number of days to analyze
   * @returns {Object} Analytics data
   */
  async getGenerationAnalytics(days = 30) {
    try {
      const { data: contents, error } = await this.supabase
        .from('generated_content')
        .select('*')
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        throw new Error(`Failed to get generation analytics: ${error.message}`);
      }

      const analytics = {
        total_content: contents.length,
        by_type: {},
        by_status: {},
        avg_quality_score: 0,
        avg_readability_score: 0,
        avg_word_count: 0,
        total_words: 0,
        period_days: days
      };

      contents.forEach(content => {
        // Count by type
        analytics.by_type[content.content_type] = (analytics.by_type[content.content_type] || 0) + 1;
        
        // Count by status
        analytics.by_status[content.status] = (analytics.by_status[content.status] || 0) + 1;
        
        // Accumulate metrics
        analytics.avg_quality_score += content.quality_score || 0;
        analytics.avg_readability_score += content.readability_score || 0;
        analytics.avg_word_count += content.word_count || 0;
        analytics.total_words += content.word_count || 0;
      });

      // Calculate averages
      if (contents.length > 0) {
        analytics.avg_quality_score /= contents.length;
        analytics.avg_readability_score /= contents.length;
        analytics.avg_word_count /= contents.length;
      }

      return analytics;
    } catch (error) {
      console.error('Failed to get generation analytics:', error.message);
      throw error;
    }
  }
}

module.exports = ContentGenerationEngine;