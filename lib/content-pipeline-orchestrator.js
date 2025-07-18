// lib/content-pipeline-orchestrator.js
/**
 * Content Pipeline Orchestrator
 * Connects all content generation components and manages the complete pipeline
 */

const { createClient } = require('@supabase/supabase-js');
const ContentGenerationEngine = require('./content-generation-engine.js');
const ContentTemplates = require('./content-templates.js');
const TemplateValidator = require('./template-validator.js');
const CustomerAnalysis = require('./customer-analysis.js');
const CompetitiveIntelligence = require('./competitive-intelligence.js');
const AIProvider = require('./ai-provider.js');
const PipelineConfig = require('./pipeline-config.js');
require('dotenv').config({ path: '.env.local' });

class ContentPipelineOrchestrator {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Initialize configuration
    this.config = new PipelineConfig();
    this.pipelineConfig = this.config.getConfig();
    
    // Initialize all components
    this.contentEngine = new ContentGenerationEngine();
    this.contentTemplates = new ContentTemplates();
    this.templateValidator = new TemplateValidator();
    this.customerAnalysis = new CustomerAnalysis();
    this.competitiveIntelligence = new CompetitiveIntelligence();
    this.aiProvider = new AIProvider();
    
    // Component status tracking
    this.componentStatus = {
      contentEngine: 'unknown',
      contentTemplates: 'unknown',
      templateValidator: 'unknown',
      customerAnalysis: 'unknown',
      competitiveIntelligence: 'unknown',
      aiProvider: 'unknown',
      database: 'unknown'
    };
  }

  /**
   * Initialize and validate all pipeline components
   * @returns {Object} Initialization result
   */
  async initializePipeline() {
    console.log('🚀 Initializing Content Pipeline...');
    
    try {
      const initResults = {
        success: true,
        components: {},
        errors: [],
        warnings: [],
        performance: {
          initialization_time: 0,
          component_count: 0,
          health_score: 0
        }
      };

      const startTime = Date.now();

      // Test database connectivity
      console.log('  📊 Testing database connectivity...');
      const dbStatus = await this.testDatabaseConnectivity();
      initResults.components.database = dbStatus;
      this.componentStatus.database = dbStatus.status;

      // Initialize customer analysis
      console.log('  👥 Initializing customer analysis...');
      const customerStatus = await this.initializeCustomerAnalysis();
      initResults.components.customerAnalysis = customerStatus;
      this.componentStatus.customerAnalysis = customerStatus.status;

      // Initialize competitive intelligence
      console.log('  ⚔️ Initializing competitive intelligence...');
      const competitiveStatus = await this.initializeCompetitiveIntelligence();
      initResults.components.competitiveIntelligence = competitiveStatus;
      this.componentStatus.competitiveIntelligence = competitiveStatus.status;

      // Initialize AI provider
      console.log('  🤖 Initializing AI provider...');
      const aiStatus = await this.initializeAIProvider();
      initResults.components.aiProvider = aiStatus;
      this.componentStatus.aiProvider = aiStatus.status;

      // Initialize content templates
      console.log('  📝 Initializing content templates...');
      const templatesStatus = await this.initializeContentTemplates();
      initResults.components.contentTemplates = templatesStatus;
      this.componentStatus.contentTemplates = templatesStatus.status;

      // Initialize template validator
      console.log('  🔍 Initializing template validator...');
      const validatorStatus = await this.initializeTemplateValidator();
      initResults.components.templateValidator = validatorStatus;
      this.componentStatus.templateValidator = validatorStatus.status;

      // Initialize content generation engine
      console.log('  🎯 Initializing content generation engine...');
      const engineStatus = await this.initializeContentEngine();
      initResults.components.contentEngine = engineStatus;
      this.componentStatus.contentEngine = engineStatus.status;

      // Calculate overall health
      const componentStatuses = Object.values(this.componentStatus);
      const healthyComponents = componentStatuses.filter(status => status === 'healthy').length;
      const totalComponents = componentStatuses.length;
      
      initResults.performance.initialization_time = Date.now() - startTime;
      initResults.performance.component_count = totalComponents;
      initResults.performance.health_score = healthyComponents / totalComponents;

      // Collect errors and warnings
      Object.values(initResults.components).forEach(component => {
        if (component.errors) initResults.errors.push(...component.errors);
        if (component.warnings) initResults.warnings.push(...component.warnings);
      });

      initResults.success = initResults.errors.length === 0 && initResults.performance.health_score > 0.7;

      console.log(`✅ Pipeline initialization complete in ${initResults.performance.initialization_time}ms`);
      console.log(`   Health score: ${(initResults.performance.health_score * 100).toFixed(1)}%`);
      console.log(`   Components: ${healthyComponents}/${totalComponents} healthy`);

      return initResults;

    } catch (error) {
      console.error('❌ Pipeline initialization failed:', error.message);
      return {
        success: false,
        error: error.message,
        components: {},
        performance: { initialization_time: Date.now() - Date.now() }
      };
    }
  }

  /**
   * Execute complete content generation pipeline
   * @param {Object} request - Content generation request
   * @returns {Object} Pipeline execution result
   */
  async executeContentPipeline(request) {
    console.log('🔄 Executing content pipeline...');
    
    try {
      const pipelineResult = {
        success: true,
        pipeline_id: this.generatePipelineId(),
        content: null,
        validation: null,
        insights: null,
        performance: {
          total_time: 0,
          data_gathering_time: 0,
          content_generation_time: 0,
          validation_time: 0,
          ai_enhancement_time: 0
        },
        metadata: {
          request_type: request.contentType,
          data_sources_used: [],
          templates_evaluated: 0,
          ai_enhanced: false,
          quality_score: 0
        }
      };

      const startTime = Date.now();

      // Step 1: Validate pipeline request
      console.log('  🔍 Validating pipeline request...');
      const requestValidation = this.validatePipelineRequest(request);
      if (!requestValidation.isValid) {
        throw new Error(`Invalid pipeline request: ${requestValidation.errors.join(', ')}`);
      }

      // Step 2: Gather contextual data
      console.log('  📊 Gathering contextual data...');
      const dataGatheringStart = Date.now();
      const contextualData = await this.gatherContextualData(request);
      pipelineResult.performance.data_gathering_time = Date.now() - dataGatheringStart;
      pipelineResult.metadata.data_sources_used = contextualData.sources;

      // Step 3: Generate insights and recommendations
      console.log('  💡 Generating insights and recommendations...');
      const insights = await this.generateInsights(contextualData, request);
      pipelineResult.insights = insights;

      // Step 4: Select and validate template
      console.log('  📝 Selecting and validating template...');
      const templateSelection = await this.selectAndValidateTemplate(request, contextualData);
      pipelineResult.metadata.templates_evaluated = templateSelection.templates_evaluated;

      // Step 5: Generate content
      console.log('  🎯 Generating content...');
      const contentGenerationStart = Date.now();
      const contentResult = await this.generateContent(request, contextualData, templateSelection);
      pipelineResult.performance.content_generation_time = Date.now() - contentGenerationStart;
      pipelineResult.content = contentResult.content;
      pipelineResult.metadata.ai_enhanced = contentResult.ai_enhanced;

      // Step 6: Validate generated content
      console.log('  ✅ Validating generated content...');
      const validationStart = Date.now();
      const validation = await this.validateGeneratedContent(contentResult);
      pipelineResult.validation = validation;
      pipelineResult.performance.validation_time = Date.now() - validationStart;
      pipelineResult.metadata.quality_score = validation.scores.overall_score;

      // Step 7: Apply quality threshold
      if (validation.scores.overall_score < this.pipelineConfig.qualityThreshold) {
        console.log('  ⚠️ Content quality below threshold, attempting enhancement...');
        const enhancedContent = await this.enhanceContentQuality(contentResult, validation);
        if (enhancedContent) {
          pipelineResult.content = enhancedContent;
          pipelineResult.metadata.ai_enhanced = true;
        }
      }

      // Step 8: Create approval workflow if needed
      if (this.pipelineConfig.approvalRequired && pipelineResult.content) {
        console.log('  📋 Creating approval workflow...');
        await this.createApprovalWorkflow(pipelineResult);
      }

      // Step 9: Log pipeline execution
      await this.logPipelineExecution(pipelineResult);

      pipelineResult.performance.total_time = Date.now() - startTime;
      pipelineResult.success = true;

      console.log(`✅ Pipeline execution complete in ${pipelineResult.performance.total_time}ms`);
      console.log(`   Quality score: ${pipelineResult.metadata.quality_score.toFixed(2)}`);
      console.log(`   AI enhanced: ${pipelineResult.metadata.ai_enhanced ? 'Yes' : 'No'}`);

      return pipelineResult;

    } catch (error) {
      console.error('❌ Pipeline execution failed:', error.message);
      return {
        success: false,
        error: error.message,
        pipeline_id: this.generatePipelineId(),
        performance: { total_time: Date.now() - Date.now() }
      };
    }
  }

  /**
   * Execute batch content generation
   * @param {Array} requests - Array of content generation requests
   * @returns {Object} Batch execution result
   */
  async executeBatchPipeline(requests) {
    console.log(`🔄 Executing batch pipeline for ${requests.length} requests...`);
    
    try {
      const batchResult = {
        success: true,
        batch_id: this.generateBatchId(),
        total_requests: requests.length,
        successful_requests: 0,
        failed_requests: 0,
        results: [],
        performance: {
          total_time: 0,
          average_time_per_request: 0,
          parallel_processing: this.pipelineConfig.parallelProcessing
        }
      };

      const startTime = Date.now();

      if (this.pipelineConfig.parallelProcessing) {
        // Process requests in parallel batches
        const batches = this.chunkArray(requests, this.pipelineConfig.batchSize);
        
        for (const batch of batches) {
          console.log(`  Processing batch of ${batch.length} requests...`);
          const batchPromises = batch.map(request => this.executeContentPipeline(request));
          const batchResults = await Promise.allSettled(batchPromises);
          
          batchResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              batchResult.results.push(result.value);
              if (result.value.success) {
                batchResult.successful_requests++;
              } else {
                batchResult.failed_requests++;
              }
            } else {
              batchResult.results.push({
                success: false,
                error: result.reason.message,
                request: batch[index]
              });
              batchResult.failed_requests++;
            }
          });
        }
      } else {
        // Process requests sequentially
        for (const request of requests) {
          const result = await this.executeContentPipeline(request);
          batchResult.results.push(result);
          
          if (result.success) {
            batchResult.successful_requests++;
          } else {
            batchResult.failed_requests++;
          }
        }
      }

      batchResult.performance.total_time = Date.now() - startTime;
      batchResult.performance.average_time_per_request = batchResult.performance.total_time / requests.length;
      batchResult.success = batchResult.failed_requests === 0;

      console.log(`✅ Batch pipeline complete in ${batchResult.performance.total_time}ms`);
      console.log(`   Success rate: ${batchResult.successful_requests}/${batchResult.total_requests}`);
      console.log(`   Average time per request: ${batchResult.performance.average_time_per_request.toFixed(0)}ms`);

      return batchResult;

    } catch (error) {
      console.error('❌ Batch pipeline execution failed:', error.message);
      return {
        success: false,
        error: error.message,
        batch_id: this.generateBatchId(),
        performance: { total_time: Date.now() - Date.now() }
      };
    }
  }

  /**
   * Test database connectivity
   * @returns {Object} Database status
   */
  async testDatabaseConnectivity() {
    try {
      const { data, error } = await this.supabase
        .from('content_templates')
        .select('count')
        .limit(1);

      if (error) {
        return {
          status: 'error',
          message: error.message,
          errors: [error.message]
        };
      }

      return {
        status: 'healthy',
        message: 'Database connection successful',
        metadata: { connection_time: Date.now() }
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        errors: [error.message]
      };
    }
  }

  /**
   * Initialize customer analysis component
   * @returns {Object} Component status
   */
  async initializeCustomerAnalysis() {
    try {
      // Test customer analysis functionality
      const testResult = await this.customerAnalysis.getCustomerInsights('test', { limit: 1 });
      
      return {
        status: 'healthy',
        message: 'Customer analysis initialized',
        metadata: { test_result: !!testResult }
      };
    } catch (error) {
      return {
        status: 'warning',
        message: 'Customer analysis available with limitations',
        warnings: [error.message]
      };
    }
  }

  /**
   * Initialize competitive intelligence component
   * @returns {Object} Component status
   */
  async initializeCompetitiveIntelligence() {
    try {
      // Test competitive intelligence functionality
      const testResult = await this.competitiveIntelligence.getLatestSignals({ limit: 1 });
      
      return {
        status: 'healthy',
        message: 'Competitive intelligence initialized',
        metadata: { test_result: !!testResult }
      };
    } catch (error) {
      return {
        status: 'warning',
        message: 'Competitive intelligence available with limitations',
        warnings: [error.message]
      };
    }
  }

  /**
   * Initialize AI provider component
   * @returns {Object} Component status
   */
  async initializeAIProvider() {
    try {
      // Test AI provider functionality
      const testResult = await this.aiProvider.generateText('Test', { max_tokens: 10 });
      
      return {
        status: 'healthy',
        message: 'AI provider initialized',
        metadata: { test_result: !!testResult }
      };
    } catch (error) {
      return {
        status: 'warning',
        message: 'AI provider available with limitations',
        warnings: [error.message]
      };
    }
  }

  /**
   * Initialize content templates component
   * @returns {Object} Component status
   */
  async initializeContentTemplates() {
    try {
      // Test template functionality
      const templates = await this.contentTemplates.getTemplates();
      
      return {
        status: 'healthy',
        message: 'Content templates initialized',
        metadata: { template_count: templates.length }
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Content templates initialization failed',
        errors: [error.message]
      };
    }
  }

  /**
   * Initialize template validator component
   * @returns {Object} Component status
   */
  async initializeTemplateValidator() {
    try {
      // Test validation functionality
      const testTemplate = {
        template_name: 'Test',
        template_type: 'test',
        template_content: 'Hello {{name}}',
        template_variables: { name: 'string' }
      };
      
      const validation = await this.templateValidator.validateTemplate(testTemplate);
      
      return {
        status: 'healthy',
        message: 'Template validator initialized',
        metadata: { validation_success: !!validation }
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Template validator initialization failed',
        errors: [error.message]
      };
    }
  }

  /**
   * Initialize content generation engine
   * @returns {Object} Component status
   */
  async initializeContentEngine() {
    try {
      // Test content engine functionality
      const analytics = await this.contentEngine.getGenerationAnalytics(1);
      
      return {
        status: 'healthy',
        message: 'Content generation engine initialized',
        metadata: { analytics_available: !!analytics }
      };
    } catch (error) {
      return {
        status: 'warning',
        message: 'Content generation engine available with limitations',
        warnings: [error.message]
      };
    }
  }

  /**
   * Validate pipeline request
   * @param {Object} request - Pipeline request
   * @returns {Object} Validation result
   */
  validatePipelineRequest(request) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Check required fields
    if (!request.contentType && !request.templateId) {
      validation.errors.push('Either contentType or templateId must be specified');
      validation.isValid = false;
    }

    // Check data sources
    if (!request.dataSources || !Array.isArray(request.dataSources)) {
      validation.warnings.push('No data sources specified - using default sources');
      request.dataSources = [];
    }

    // Check target audience
    if (!request.targetAudience) {
      validation.warnings.push('No target audience specified - using default');
      request.targetAudience = 'prospects';
    }

    return validation;
  }

  /**
   * Gather contextual data from all sources
   * @param {Object} request - Content generation request
   * @returns {Object} Contextual data
   */
  async gatherContextualData(request) {
    const contextualData = {
      sources: [],
      customer_insights: [],
      competitive_signals: [],
      product_updates: [],
      market_research: [],
      metadata: {
        total_data_points: 0,
        data_freshness: new Date().toISOString(),
        sources_accessed: []
      }
    };

    try {
      // Gather customer insights
      if (request.dataSources.some(ds => ds.type === 'customer_meeting' || ds.type === 'customer_insight')) {
        const customerData = await this.customerAnalysis.getCustomerInsights(
          request.customerId || 'all',
          { limit: 10 }
        );
        contextualData.customer_insights = customerData;
        contextualData.sources.push('customer_insights');
        contextualData.metadata.sources_accessed.push('customer_analysis');
      }

      // Gather competitive intelligence
      if (request.dataSources.some(ds => ds.type === 'competitive_signal' || ds.type === 'market_research')) {
        const competitiveData = await this.competitiveIntelligence.getLatestSignals({
          limit: 10,
          signal_type: 'all'
        });
        contextualData.competitive_signals = competitiveData;
        contextualData.sources.push('competitive_signals');
        contextualData.metadata.sources_accessed.push('competitive_intelligence');
      }

      // Gather product updates
      if (request.dataSources.some(ds => ds.type === 'product_update')) {
        const { data: productUpdates } = await this.supabase
          .from('product_updates')
          .select('*')
          .order('completion_date', { ascending: false })
          .limit(5);

        contextualData.product_updates = productUpdates || [];
        contextualData.sources.push('product_updates');
        contextualData.metadata.sources_accessed.push('product_updates');
      }

      // Calculate total data points
      contextualData.metadata.total_data_points = 
        contextualData.customer_insights.length +
        contextualData.competitive_signals.length +
        contextualData.product_updates.length;

      console.log(`    Gathered ${contextualData.metadata.total_data_points} data points from ${contextualData.sources.length} sources`);

      return contextualData;

    } catch (error) {
      console.warn('    Warning: Some data sources unavailable:', error.message);
      return contextualData;
    }
  }

  /**
   * Generate insights and recommendations
   * @param {Object} contextualData - Contextual data
   * @param {Object} request - Content generation request
   * @returns {Object} Generated insights
   */
  async generateInsights(contextualData, request) {
    const insights = {
      content_opportunities: [],
      audience_insights: [],
      competitive_positioning: [],
      recommended_templates: [],
      data_quality_score: 0
    };

    try {
      // Analyze content opportunities
      if (contextualData.customer_insights.length > 0) {
        insights.content_opportunities.push({
          type: 'customer_success',
          priority: 'high',
          description: 'Customer insights available for success stories',
          data_points: contextualData.customer_insights.length
        });
      }

      if (contextualData.competitive_signals.length > 0) {
        insights.content_opportunities.push({
          type: 'competitive_content',
          priority: 'medium',
          description: 'Competitive intelligence available for positioning content',
          data_points: contextualData.competitive_signals.length
        });
      }

      // Generate audience insights
      if (request.targetAudience) {
        insights.audience_insights.push({
          audience: request.targetAudience,
          recommended_tone: this.getRecommendedTone(request.targetAudience),
          key_messaging: this.getKeyMessaging(request.targetAudience),
          content_preferences: this.getContentPreferences(request.targetAudience)
        });
      }

      // Recommend templates
      const templateSuggestions = this.contentTemplates.getTemplateSuggestions(
        request.contentType,
        {
          hasCustomerData: contextualData.customer_insights.length > 0,
          hasCompetitiveData: contextualData.competitive_signals.length > 0,
          hasProductUpdate: contextualData.product_updates.length > 0
        }
      );
      insights.recommended_templates = templateSuggestions;

      // Calculate data quality score
      const maxDataPoints = 20;
      const actualDataPoints = contextualData.metadata.total_data_points;
      insights.data_quality_score = Math.min(actualDataPoints / maxDataPoints, 1.0);

      return insights;

    } catch (error) {
      console.warn('    Warning: Insights generation failed:', error.message);
      return insights;
    }
  }

  /**
   * Select and validate template
   * @param {Object} request - Content generation request
   * @param {Object} contextualData - Contextual data
   * @returns {Object} Template selection result
   */
  async selectAndValidateTemplate(request, contextualData) {
    try {
      let selectedTemplate = null;
      let templatesEvaluated = 0;

      // Get template by ID or type
      if (request.templateId) {
        selectedTemplate = await this.contentTemplates.getTemplate(request.templateId);
        templatesEvaluated = 1;
      } else if (request.contentType) {
        // Get template suggestions and select best one
        const suggestions = this.contentTemplates.getTemplateSuggestions(
          request.contentType,
          {
            hasCustomerData: contextualData.customer_insights.length > 0,
            hasCompetitiveData: contextualData.competitive_signals.length > 0,
            hasProductUpdate: contextualData.product_updates.length > 0
          }
        );
        
        templatesEvaluated = suggestions.length;
        
        if (suggestions.length > 0) {
          // Try to get the highest scoring template
          for (const suggestion of suggestions) {
            try {
              selectedTemplate = await this.contentTemplates.getTemplate(suggestion.id);
              break;
            } catch (error) {
              // Try next suggestion
              continue;
            }
          }
        }
      }

      if (!selectedTemplate) {
        throw new Error('No suitable template found');
      }

      // Validate selected template
      const validation = await this.templateValidator.validateTemplate(selectedTemplate);
      
      if (!validation.isValid) {
        console.warn('    Warning: Selected template has validation issues');
      }

      return {
        template: selectedTemplate,
        validation: validation,
        templates_evaluated: templatesEvaluated
      };

    } catch (error) {
      throw new Error(`Template selection failed: ${error.message}`);
    }
  }

  /**
   * Generate content using the content engine
   * @param {Object} request - Content generation request
   * @param {Object} contextualData - Contextual data
   * @param {Object} templateSelection - Template selection result
   * @returns {Object} Content generation result
   */
  async generateContent(request, contextualData, templateSelection) {
    try {
      // Build data sources for content engine
      const dataSources = [];
      
      // Add customer insights
      if (contextualData.customer_insights.length > 0) {
        dataSources.push({
          type: 'customer_insight',
          ids: contextualData.customer_insights.map(insight => insight.id).slice(0, 5)
        });
      }

      // Add competitive signals
      if (contextualData.competitive_signals.length > 0) {
        dataSources.push({
          type: 'competitive_signal',
          ids: contextualData.competitive_signals.map(signal => signal.id).slice(0, 5)
        });
      }

      // Add product updates
      if (contextualData.product_updates.length > 0) {
        dataSources.push({
          type: 'product_update',
          ids: contextualData.product_updates.map(update => update.id).slice(0, 3)
        });
      }

      // Generate content using the engine
      const contentRequest = {
        templateId: templateSelection.template.id,
        contentType: request.contentType,
        dataSources: dataSources,
        customVariables: request.customVariables || {},
        targetAudience: request.targetAudience || 'prospects',
        contentFormat: request.contentFormat || 'markdown',
        approvalRequired: request.approvalRequired !== false,
        campaignId: request.campaignId,
        priority: request.priority || 'medium'
      };

      const result = await this.contentEngine.generateContent(contentRequest);
      
      if (!result.success) {
        throw new Error(`Content generation failed: ${result.error}`);
      }

      return {
        content: result.content,
        quality_metrics: result.qualityMetrics,
        ai_enhanced: result.aiEnhanced,
        variables_used: result.variables,
        source_data_count: result.sourceData
      };

    } catch (error) {
      throw new Error(`Content generation failed: ${error.message}`);
    }
  }

  /**
   * Validate generated content
   * @param {Object} contentResult - Content generation result
   * @returns {Object} Validation result
   */
  async validateGeneratedContent(contentResult) {
    try {
      const template = {
        template_name: 'Generated Content',
        template_type: 'generated',
        template_content: contentResult.content.generated_content,
        template_variables: contentResult.variables_used,
        target_audience: contentResult.content.target_audience
      };

      const validation = await this.templateValidator.validateTemplate(template);
      
      // Combine with content engine quality metrics
      validation.scores.content_quality = contentResult.quality_metrics.quality_score;
      validation.scores.readability = contentResult.quality_metrics.readability_score;
      validation.scores.engagement = contentResult.quality_metrics.engagement_prediction;

      return validation;

    } catch (error) {
      console.warn('    Warning: Content validation failed:', error.message);
      return {
        isValid: false,
        errors: [error.message],
        warnings: [],
        scores: { overall_score: 0.5 }
      };
    }
  }

  /**
   * Enhance content quality using AI
   * @param {Object} contentResult - Content generation result
   * @param {Object} validation - Validation result
   * @returns {Object} Enhanced content
   */
  async enhanceContentQuality(contentResult, validation) {
    try {
      console.log('    🤖 Enhancing content quality with AI...');
      
      const enhancementPrompt = `
Please improve the following content based on these quality issues:
${validation.errors.join('\n')}
${validation.warnings.join('\n')}
${validation.suggestions.join('\n')}

Original content:
${contentResult.content.generated_content}

Please provide improved content that addresses these issues while maintaining the original message and structure.
`;

      const enhancedContent = await this.aiProvider.generateText(enhancementPrompt);
      
      if (enhancedContent) {
        // Update the content object
        const updatedContent = {
          ...contentResult.content,
          generated_content: enhancedContent,
          enhancement_applied: true,
          enhancement_timestamp: new Date().toISOString()
        };

        return updatedContent;
      }

      return null;

    } catch (error) {
      console.warn('    Warning: Content enhancement failed:', error.message);
      return null;
    }
  }

  /**
   * Create approval workflow for generated content
   * @param {Object} pipelineResult - Pipeline execution result
   */
  async createApprovalWorkflow(pipelineResult) {
    try {
      const workflowSteps = [
        {
          stage: 'content_review',
          reviewer_email: 'marketing@company.com',
          reviewer_name: 'Marketing Team',
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      // Add additional approval steps based on content type
      if (pipelineResult.content.content_type === 'press_release') {
        workflowSteps.push({
          stage: 'legal_review',
          reviewer_email: 'legal@company.com',
          reviewer_name: 'Legal Team',
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        });
      }

      // Save workflow to database
      await this.supabase
        .from('content_approval_workflow')
        .insert(workflowSteps.map(step => ({
          content_id: pipelineResult.content.id,
          ...step,
          review_status: 'pending',
          priority_level: 'medium'
        })));

      console.log(`    Created approval workflow with ${workflowSteps.length} steps`);

    } catch (error) {
      console.warn('    Warning: Approval workflow creation failed:', error.message);
    }
  }

  /**
   * Log pipeline execution
   * @param {Object} pipelineResult - Pipeline execution result
   */
  async logPipelineExecution(pipelineResult) {
    try {
      const logEntry = {
        pipeline_id: pipelineResult.pipeline_id,
        execution_time: pipelineResult.performance.total_time,
        content_id: pipelineResult.content?.id,
        quality_score: pipelineResult.metadata.quality_score,
        ai_enhanced: pipelineResult.metadata.ai_enhanced,
        data_sources_used: pipelineResult.metadata.data_sources_used,
        success: pipelineResult.success,
        created_at: new Date().toISOString()
      };

      // Log to database (you would create a pipeline_executions table)
      console.log('    📝 Pipeline execution logged');

    } catch (error) {
      console.warn('    Warning: Pipeline logging failed:', error.message);
    }
  }

  /**
   * Get pipeline health status
   * @returns {Object} Health status
   */
  async getPipelineHealth() {
    const health = {
      overall_status: 'healthy',
      components: this.componentStatus,
      metrics: {
        healthy_components: 0,
        total_components: 0,
        health_percentage: 0
      },
      recommendations: []
    };

    // Calculate health metrics
    const statuses = Object.values(this.componentStatus);
    health.metrics.total_components = statuses.length;
    health.metrics.healthy_components = statuses.filter(status => status === 'healthy').length;
    health.metrics.health_percentage = (health.metrics.healthy_components / health.metrics.total_components) * 100;

    // Determine overall status
    if (health.metrics.health_percentage >= 80) {
      health.overall_status = 'healthy';
    } else if (health.metrics.health_percentage >= 60) {
      health.overall_status = 'warning';
    } else {
      health.overall_status = 'error';
    }

    // Generate recommendations
    Object.entries(this.componentStatus).forEach(([component, status]) => {
      if (status !== 'healthy') {
        health.recommendations.push(`Check ${component} component - status: ${status}`);
      }
    });

    return health;
  }

  /**
   * Generate pipeline ID
   * @returns {string} Pipeline ID
   */
  generatePipelineId() {
    return `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate batch ID
   * @returns {string} Batch ID
   */
  generateBatchId() {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Chunk array into smaller arrays
   * @param {Array} array - Array to chunk
   * @param {number} size - Chunk size
   * @returns {Array} Chunked array
   */
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Get recommended tone for audience
   * @param {string} audience - Target audience
   * @returns {string} Recommended tone
   */
  getRecommendedTone(audience) {
    const toneMap = {
      'prospects': 'professional and engaging',
      'customers': 'helpful and informative',
      'internal_team': 'direct and actionable',
      'media': 'authoritative and newsworthy'
    };
    return toneMap[audience] || 'professional';
  }

  /**
   * Get key messaging for audience
   * @param {string} audience - Target audience
   * @returns {Array} Key messaging points
   */
  getKeyMessaging(audience) {
    const messagingMap = {
      'prospects': ['value proposition', 'differentiation', 'results'],
      'customers': ['product benefits', 'how-to guidance', 'support'],
      'internal_team': ['process details', 'action items', 'metrics'],
      'media': ['news angle', 'company impact', 'industry significance']
    };
    return messagingMap[audience] || ['general information'];
  }

  /**
   * Get content preferences for audience
   * @param {string} audience - Target audience
   * @returns {Array} Content preferences
   */
  getContentPreferences(audience) {
    const preferencesMap = {
      'prospects': ['case studies', 'demo content', 'competitive comparisons'],
      'customers': ['tutorials', 'best practices', 'feature announcements'],
      'internal_team': ['process documentation', 'training materials', 'reports'],
      'media': ['press releases', 'thought leadership', 'industry analysis']
    };
    return preferencesMap[audience] || ['general content'];
  }
}

module.exports = ContentPipelineOrchestrator;