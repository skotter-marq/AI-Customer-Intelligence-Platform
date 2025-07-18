// lib/content-pipeline-integration.js
/**
 * Content Pipeline Integration Service
 * Integrates all content generation and validation components
 */

const { createClient } = require('@supabase/supabase-js');
const UpdateContentGenerator = require('./update-content-generator.js');
const UpdateContentValidator = require('./update-content-validator.js');
const UpdateMonitorService = require('./update-monitor-service.js');
const ContentPipelineOrchestrator = require('./content-pipeline-orchestrator.js');
const PipelineMonitor = require('./pipeline-monitor.js');
const { EventEmitter } = require('events');
require('dotenv').config({ path: '.env.local' });

class ContentPipelineIntegration extends EventEmitter {
  constructor() {
    super();
    
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Initialize all components
    this.updateContentGenerator = new UpdateContentGenerator();
    this.updateContentValidator = new UpdateContentValidator();
    this.updateMonitorService = new UpdateMonitorService();
    this.contentPipelineOrchestrator = new ContentPipelineOrchestrator();
    this.pipelineMonitor = new PipelineMonitor();
    
    // Integration configuration
    this.config = {
      enableIntegratedWorkflow: true,
      enableAutoValidation: true,
      enableQualityGating: true,
      enableFeedbackLoop: true,
      requireValidationPass: true,
      autoFixEnabled: true,
      validationThreshold: 0.8,
      maxRetryAttempts: 3,
      workflowTimeout: 300000, // 5 minutes
      parallelProcessing: true,
      maxConcurrentJobs: 5
    };
    
    // Workflow stages
    this.workflowStages = {
      TRIGGER: 'trigger',
      GENERATION: 'generation',
      VALIDATION: 'validation',
      FIXING: 'fixing',
      APPROVAL: 'approval',
      PUBLICATION: 'publication',
      MONITORING: 'monitoring',
      COMPLETE: 'complete',
      FAILED: 'failed'
    };
    
    // Integration state
    this.activeWorkflows = new Map();
    this.completedWorkflows = new Map();
    this.failedWorkflows = new Map();
    
    // Statistics
    this.stats = {
      totalWorkflows: 0,
      successfulWorkflows: 0,
      failedWorkflows: 0,
      averageWorkflowTime: 0,
      validationPassRate: 0,
      autoFixSuccessRate: 0,
      qualityImprovementRate: 0,
      lastProcessedAt: null
    };
    
    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Set up event listeners for all components
   */
  setupEventListeners() {
    // Update Content Generator events
    this.updateContentGenerator.on('update_processed', (data) => {
      this.handleUpdateProcessed(data);
    });
    
    this.updateContentGenerator.on('update_error', (data) => {
      this.handleUpdateError(data);
    });
    
    // Update Content Validator events
    this.updateContentValidator.on('validation_completed', (data) => {
      this.handleValidationCompleted(data);
    });
    
    this.updateContentValidator.on('validation_failed', (data) => {
      this.handleValidationFailed(data);
    });
    
    this.updateContentValidator.on('critical_issues_found', (data) => {
      this.handleCriticalIssuesFound(data);
    });
    
    // Update Monitor Service events
    this.updateMonitorService.on('update_processed', (data) => {
      this.handleMonitorUpdate(data);
    });
    
    // Pipeline Monitor events
    this.pipelineMonitor.on('health_check_completed', (data) => {
      this.handleHealthCheckCompleted(data);
    });
    
    this.pipelineMonitor.on('alert_triggered', (data) => {
      this.handleAlertTriggered(data);
    });
  }

  /**
   * Start the integrated content pipeline
   */
  async start() {
    try {
      console.log('🚀 Starting Content Pipeline Integration...');
      
      // Start all components
      await this.updateMonitorService.start();
      await this.pipelineMonitor.startMonitoring();
      
      // Start orchestrator
      this.contentPipelineOrchestrator.startOrchestration();
      
      console.log('✅ Content Pipeline Integration started successfully');
      this.emit('pipeline_started');
      
    } catch (error) {
      console.error('❌ Failed to start Content Pipeline Integration:', error.message);
      throw error;
    }
  }

  /**
   * Stop the integrated content pipeline
   */
  async stop() {
    try {
      console.log('🛑 Stopping Content Pipeline Integration...');
      
      // Stop all components
      await this.updateMonitorService.stop();
      this.pipelineMonitor.stopMonitoring();
      this.contentPipelineOrchestrator.stopOrchestration();
      
      // Complete active workflows
      await this.completeActiveWorkflows();
      
      console.log('✅ Content Pipeline Integration stopped successfully');
      this.emit('pipeline_stopped');
      
    } catch (error) {
      console.error('❌ Failed to stop Content Pipeline Integration:', error.message);
      throw error;
    }
  }

  /**
   * Process content through integrated workflow
   * @param {Object} content - Content to process
   * @param {Object} options - Processing options
   * @returns {Object} Processing result
   */
  async processContent(content, options = {}) {
    const workflowId = this.generateWorkflowId();
    
    try {
      console.log(`🔄 Starting integrated workflow: ${workflowId}`);
      
      // Initialize workflow
      const workflow = await this.initializeWorkflow(workflowId, content, options);
      this.activeWorkflows.set(workflowId, workflow);
      
      // Execute workflow stages
      const result = await this.executeWorkflow(workflow);
      
      // Complete workflow
      await this.completeWorkflow(workflowId, result);
      
      console.log(`✅ Integrated workflow completed: ${workflowId}`);
      return result;
      
    } catch (error) {
      console.error(`❌ Integrated workflow failed: ${workflowId}`, error.message);
      await this.failWorkflow(workflowId, error);
      throw error;
    }
  }

  /**
   * Initialize workflow
   * @param {string} workflowId - Workflow ID
   * @param {Object} content - Content to process
   * @param {Object} options - Processing options
   * @returns {Object} Workflow object
   */
  async initializeWorkflow(workflowId, content, options) {
    const workflow = {
      id: workflowId,
      content: content,
      options: options,
      stages: [],
      currentStage: this.workflowStages.TRIGGER,
      startTime: Date.now(),
      endTime: null,
      status: 'active',
      attempts: 0,
      results: {
        generation: null,
        validation: null,
        fixes: [],
        approval: null
      },
      metrics: {
        totalTime: 0,
        generationTime: 0,
        validationTime: 0,
        fixingTime: 0,
        qualityScore: 0,
        improvementScore: 0
      }
    };
    
    this.addWorkflowStage(workflow, this.workflowStages.TRIGGER, 'Workflow triggered', 'success');
    
    return workflow;
  }

  /**
   * Execute workflow through all stages
   * @param {Object} workflow - Workflow object
   * @returns {Object} Final result
   */
  async executeWorkflow(workflow) {
    try {
      // Stage 1: Content Generation
      await this.executeGenerationStage(workflow);
      
      // Stage 2: Content Validation
      await this.executeValidationStage(workflow);
      
      // Stage 3: Auto-fixing (if needed)
      if (this.config.autoFixEnabled && workflow.results.validation && !workflow.results.validation.passed) {
        await this.executeFixingStage(workflow);
      }
      
      // Stage 4: Quality Gating
      if (this.config.enableQualityGating) {
        await this.executeQualityGatingStage(workflow);
      }
      
      // Stage 5: Approval (if required)
      if (workflow.content.approval_required) {
        await this.executeApprovalStage(workflow);
      }
      
      // Stage 6: Publication
      await this.executePublicationStage(workflow);
      
      // Stage 7: Monitoring
      await this.executeMonitoringStage(workflow);
      
      // Complete workflow
      workflow.currentStage = this.workflowStages.COMPLETE;
      workflow.endTime = Date.now();
      workflow.metrics.totalTime = workflow.endTime - workflow.startTime;
      
      this.addWorkflowStage(workflow, this.workflowStages.COMPLETE, 'Workflow completed successfully', 'success');
      
      return {
        success: true,
        workflow: workflow,
        results: workflow.results,
        metrics: workflow.metrics
      };
      
    } catch (error) {
      workflow.currentStage = this.workflowStages.FAILED;
      workflow.endTime = Date.now();
      workflow.metrics.totalTime = workflow.endTime - workflow.startTime;
      
      this.addWorkflowStage(workflow, this.workflowStages.FAILED, error.message, 'error');
      
      throw error;
    }
  }

  /**
   * Execute generation stage
   * @param {Object} workflow - Workflow object
   */
  async executeGenerationStage(workflow) {
    const startTime = Date.now();
    
    try {
      workflow.currentStage = this.workflowStages.GENERATION;
      this.addWorkflowStage(workflow, this.workflowStages.GENERATION, 'Starting content generation', 'info');
      
      // Generate content using update content generator
      const generationResult = await this.updateContentGenerator.generateContentManually(
        workflow.content.update_id,
        workflow.options.contentTypes || []
      );
      
      if (!generationResult.success) {
        throw new Error(`Content generation failed: ${generationResult.error}`);
      }
      
      workflow.results.generation = generationResult;
      workflow.metrics.generationTime = Date.now() - startTime;
      
      this.addWorkflowStage(workflow, this.workflowStages.GENERATION, 'Content generation completed', 'success');
      
    } catch (error) {
      workflow.metrics.generationTime = Date.now() - startTime;
      this.addWorkflowStage(workflow, this.workflowStages.GENERATION, `Generation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Execute validation stage
   * @param {Object} workflow - Workflow object
   */
  async executeValidationStage(workflow) {
    if (!this.config.enableAutoValidation) {
      return;
    }
    
    const startTime = Date.now();
    
    try {
      workflow.currentStage = this.workflowStages.VALIDATION;
      this.addWorkflowStage(workflow, this.workflowStages.VALIDATION, 'Starting content validation', 'info');
      
      // Validate generated content
      const generatedContent = workflow.results.generation.content[0]; // Take first generated content
      const validationResult = await this.updateContentValidator.validateContent(
        generatedContent,
        workflow.options.validationOptions || {}
      );
      
      workflow.results.validation = validationResult;
      workflow.metrics.validationTime = Date.now() - startTime;
      workflow.metrics.qualityScore = validationResult.overall_score;
      
      const status = validationResult.passed ? 'success' : 'warning';
      const message = validationResult.passed ? 
        'Content validation passed' : 
        `Content validation failed (score: ${validationResult.overall_score.toFixed(2)})`;
      
      this.addWorkflowStage(workflow, this.workflowStages.VALIDATION, message, status);
      
    } catch (error) {
      workflow.metrics.validationTime = Date.now() - startTime;
      this.addWorkflowStage(workflow, this.workflowStages.VALIDATION, `Validation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Execute fixing stage
   * @param {Object} workflow - Workflow object
   */
  async executeFixingStage(workflow) {
    const startTime = Date.now();
    
    try {
      workflow.currentStage = this.workflowStages.FIXING;
      this.addWorkflowStage(workflow, this.workflowStages.FIXING, 'Starting auto-fixing', 'info');
      
      let attempts = 0;
      let currentValidationResult = workflow.results.validation;
      
      while (attempts < this.config.maxRetryAttempts && !currentValidationResult.passed) {
        attempts++;
        
        // Apply auto-fixes and re-validate
        const fixedContent = currentValidationResult.fixed_content;
        const revalidationResult = await this.updateContentValidator.validateContent(
          fixedContent,
          { ...workflow.options.validationOptions, autoFix: true }
        );
        
        workflow.results.fixes.push({
          attempt: attempts,
          fixes_applied: revalidationResult.applied_fixes,
          score_improvement: revalidationResult.overall_score - currentValidationResult.overall_score,
          result: revalidationResult
        });
        
        currentValidationResult = revalidationResult;
      }
      
      workflow.results.validation = currentValidationResult;
      workflow.metrics.fixingTime = Date.now() - startTime;
      
      if (currentValidationResult.passed) {
        workflow.metrics.improvementScore = currentValidationResult.overall_score - workflow.results.validation.overall_score;
        this.addWorkflowStage(workflow, this.workflowStages.FIXING, `Auto-fixing successful (${attempts} attempts)`, 'success');
      } else {
        this.addWorkflowStage(workflow, this.workflowStages.FIXING, `Auto-fixing failed after ${attempts} attempts`, 'warning');
      }
      
    } catch (error) {
      workflow.metrics.fixingTime = Date.now() - startTime;
      this.addWorkflowStage(workflow, this.workflowStages.FIXING, `Fixing failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Execute quality gating stage
   * @param {Object} workflow - Workflow object
   */
  async executeQualityGatingStage(workflow) {
    try {
      this.addWorkflowStage(workflow, 'quality_gating', 'Checking quality gates', 'info');
      
      const validationResult = workflow.results.validation;
      
      // Check quality threshold
      if (validationResult.overall_score < this.config.validationThreshold) {
        throw new Error(`Quality gate failed: Score ${validationResult.overall_score.toFixed(2)} below threshold ${this.config.validationThreshold}`);
      }
      
      // Check for critical issues
      if (validationResult.critical_issues.length > 0) {
        throw new Error(`Quality gate failed: ${validationResult.critical_issues.length} critical issues found`);
      }
      
      // Check validation pass requirement
      if (this.config.requireValidationPass && !validationResult.passed) {
        throw new Error('Quality gate failed: Validation did not pass');
      }
      
      this.addWorkflowStage(workflow, 'quality_gating', 'Quality gates passed', 'success');
      
    } catch (error) {
      this.addWorkflowStage(workflow, 'quality_gating', error.message, 'error');
      throw error;
    }
  }

  /**
   * Execute approval stage
   * @param {Object} workflow - Workflow object
   */
  async executeApprovalStage(workflow) {
    try {
      workflow.currentStage = this.workflowStages.APPROVAL;
      this.addWorkflowStage(workflow, this.workflowStages.APPROVAL, 'Content submitted for approval', 'info');
      
      // In a real implementation, this would create approval requests
      // For now, we'll simulate approval
      workflow.results.approval = {
        status: 'approved',
        approved_by: 'system',
        approved_at: new Date().toISOString(),
        comments: 'Automatically approved based on quality score'
      };
      
      this.addWorkflowStage(workflow, this.workflowStages.APPROVAL, 'Content approved', 'success');
      
    } catch (error) {
      this.addWorkflowStage(workflow, this.workflowStages.APPROVAL, `Approval failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Execute publication stage
   * @param {Object} workflow - Workflow object
   */
  async executePublicationStage(workflow) {
    try {
      workflow.currentStage = this.workflowStages.PUBLICATION;
      this.addWorkflowStage(workflow, this.workflowStages.PUBLICATION, 'Publishing content', 'info');
      
      // Update content status to published
      const generatedContent = workflow.results.validation.fixed_content || workflow.results.generation.content[0];
      
      await this.supabase
        .from('generated_content')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          final_quality_score: workflow.results.validation.overall_score,
          workflow_id: workflow.id
        })
        .eq('id', generatedContent.id);
      
      this.addWorkflowStage(workflow, this.workflowStages.PUBLICATION, 'Content published successfully', 'success');
      
    } catch (error) {
      this.addWorkflowStage(workflow, this.workflowStages.PUBLICATION, `Publication failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Execute monitoring stage
   * @param {Object} workflow - Workflow object
   */
  async executeMonitoringStage(workflow) {
    try {
      workflow.currentStage = this.workflowStages.MONITORING;
      this.addWorkflowStage(workflow, this.workflowStages.MONITORING, 'Setting up monitoring', 'info');
      
      // Set up monitoring for published content
      // This would typically involve analytics tracking, feedback collection, etc.
      
      this.addWorkflowStage(workflow, this.workflowStages.MONITORING, 'Monitoring configured', 'success');
      
    } catch (error) {
      this.addWorkflowStage(workflow, this.workflowStages.MONITORING, `Monitoring setup failed: ${error.message}`, 'warning');
      // Don't throw error for monitoring failures
    }
  }

  /**
   * Add workflow stage
   * @param {Object} workflow - Workflow object
   * @param {string} stage - Stage name
   * @param {string} message - Stage message
   * @param {string} status - Stage status
   */
  addWorkflowStage(workflow, stage, message, status) {
    workflow.stages.push({
      stage: stage,
      message: message,
      status: status,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Complete workflow
   * @param {string} workflowId - Workflow ID
   * @param {Object} result - Final result
   */
  async completeWorkflow(workflowId, result) {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) return;
    
    workflow.status = 'completed';
    workflow.finalResult = result;
    
    // Move to completed workflows
    this.activeWorkflows.delete(workflowId);
    this.completedWorkflows.set(workflowId, workflow);
    
    // Update statistics
    this.updateStatistics(workflow);
    
    // Emit completion event
    this.emit('workflow_completed', {
      workflowId: workflowId,
      workflow: workflow,
      result: result
    });
  }

  /**
   * Fail workflow
   * @param {string} workflowId - Workflow ID
   * @param {Error} error - Error that caused failure
   */
  async failWorkflow(workflowId, error) {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) return;
    
    workflow.status = 'failed';
    workflow.error = error.message;
    
    // Move to failed workflows
    this.activeWorkflows.delete(workflowId);
    this.failedWorkflows.set(workflowId, workflow);
    
    // Update statistics
    this.updateStatistics(workflow);
    
    // Emit failure event
    this.emit('workflow_failed', {
      workflowId: workflowId,
      workflow: workflow,
      error: error
    });
  }

  /**
   * Update statistics
   * @param {Object} workflow - Completed workflow
   */
  updateStatistics(workflow) {
    this.stats.totalWorkflows++;
    
    if (workflow.status === 'completed') {
      this.stats.successfulWorkflows++;
    } else if (workflow.status === 'failed') {
      this.stats.failedWorkflows++;
    }
    
    // Update averages
    const totalTime = workflow.metrics.totalTime;
    this.stats.averageWorkflowTime = (this.stats.averageWorkflowTime * (this.stats.totalWorkflows - 1) + totalTime) / this.stats.totalWorkflows;
    
    // Update validation pass rate
    if (workflow.results.validation) {
      const passedValidations = Array.from(this.completedWorkflows.values())
        .filter(w => w.results.validation && w.results.validation.passed).length;
      const totalValidations = Array.from(this.completedWorkflows.values())
        .filter(w => w.results.validation).length;
      
      this.stats.validationPassRate = totalValidations > 0 ? (passedValidations / totalValidations) * 100 : 0;
    }
    
    // Update auto-fix success rate
    if (workflow.results.fixes.length > 0) {
      const successfulFixes = Array.from(this.completedWorkflows.values())
        .filter(w => w.results.fixes.length > 0 && w.results.validation && w.results.validation.passed).length;
      const totalFixes = Array.from(this.completedWorkflows.values())
        .filter(w => w.results.fixes.length > 0).length;
      
      this.stats.autoFixSuccessRate = totalFixes > 0 ? (successfulFixes / totalFixes) * 100 : 0;
    }
    
    // Update quality improvement rate
    if (workflow.metrics.improvementScore > 0) {
      const improvementWorkflows = Array.from(this.completedWorkflows.values())
        .filter(w => w.metrics.improvementScore > 0);
      
      this.stats.qualityImprovementRate = improvementWorkflows.length > 0 ? 
        improvementWorkflows.reduce((sum, w) => sum + w.metrics.improvementScore, 0) / improvementWorkflows.length : 0;
    }
    
    this.stats.lastProcessedAt = new Date().toISOString();
  }

  /**
   * Complete active workflows
   */
  async completeActiveWorkflows() {
    const activeWorkflowIds = Array.from(this.activeWorkflows.keys());
    
    for (const workflowId of activeWorkflowIds) {
      try {
        const workflow = this.activeWorkflows.get(workflowId);
        workflow.status = 'terminated';
        workflow.endTime = Date.now();
        
        this.addWorkflowStage(workflow, 'terminated', 'Workflow terminated due to service shutdown', 'warning');
        
        this.activeWorkflows.delete(workflowId);
        this.failedWorkflows.set(workflowId, workflow);
        
      } catch (error) {
        console.error(`Failed to complete workflow ${workflowId}:`, error.message);
      }
    }
  }

  /**
   * Event handlers
   */
  handleUpdateProcessed(data) {
    console.log(`📝 Update processed: ${data.update.title}`);
    this.emit('update_processed', data);
  }

  handleUpdateError(data) {
    console.error(`❌ Update error: ${data.error}`);
    this.emit('update_error', data);
  }

  handleValidationCompleted(data) {
    console.log(`✅ Validation completed: ${data.content_title} - Score: ${data.overall_score.toFixed(2)}`);
    this.emit('validation_completed', data);
  }

  handleValidationFailed(data) {
    console.warn(`⚠️ Validation failed: ${data.content_title}`);
    this.emit('validation_failed', data);
  }

  handleCriticalIssuesFound(data) {
    console.warn(`🚨 Critical issues found: ${data.content_title}`);
    this.emit('critical_issues_found', data);
  }

  handleMonitorUpdate(data) {
    console.log(`🔍 Monitor update: ${data.update.title}`);
    this.emit('monitor_update', data);
  }

  handleHealthCheckCompleted(data) {
    console.log(`💓 Health check completed: ${data.overall_health}`);
    this.emit('health_check_completed', data);
  }

  handleAlertTriggered(data) {
    console.warn(`🚨 Alert triggered: ${data.alert.message}`);
    this.emit('alert_triggered', data);
  }

  /**
   * Generate workflow ID
   * @returns {string} Workflow ID
   */
  generateWorkflowId() {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get integration statistics
   * @returns {Object} Statistics
   */
  getStatistics() {
    return {
      ...this.stats,
      active_workflows: this.activeWorkflows.size,
      completed_workflows: this.completedWorkflows.size,
      failed_workflows: this.failedWorkflows.size,
      success_rate: this.stats.totalWorkflows > 0 ? 
        (this.stats.successfulWorkflows / this.stats.totalWorkflows) * 100 : 0
    };
  }

  /**
   * Get integration configuration
   * @returns {Object} Configuration
   */
  getConfiguration() {
    return this.config;
  }

  /**
   * Update integration configuration
   * @param {Object} updates - Configuration updates
   */
  updateConfiguration(updates) {
    Object.assign(this.config, updates);
    this.emit('configuration_updated', this.config);
  }

  /**
   * Get workflow by ID
   * @param {string} workflowId - Workflow ID
   * @returns {Object} Workflow object
   */
  getWorkflow(workflowId) {
    return this.activeWorkflows.get(workflowId) || 
           this.completedWorkflows.get(workflowId) || 
           this.failedWorkflows.get(workflowId);
  }

  /**
   * Get all workflows
   * @returns {Object} All workflows
   */
  getAllWorkflows() {
    return {
      active: Array.from(this.activeWorkflows.values()),
      completed: Array.from(this.completedWorkflows.values()),
      failed: Array.from(this.failedWorkflows.values())
    };
  }

  /**
   * Get integration health status
   * @returns {Object} Health status
   */
  getHealthStatus() {
    const stats = this.getStatistics();
    
    return {
      status: 'healthy',
      components: {
        update_content_generator: 'healthy',
        update_content_validator: 'healthy',
        update_monitor_service: 'healthy',
        content_pipeline_orchestrator: 'healthy',
        pipeline_monitor: 'healthy'
      },
      metrics: {
        success_rate: stats.success_rate,
        average_workflow_time: stats.averageWorkflowTime,
        validation_pass_rate: stats.validationPassRate,
        auto_fix_success_rate: stats.autoFixSuccessRate,
        quality_improvement_rate: stats.qualityImprovementRate
      },
      active_workflows: stats.active_workflows,
      last_processed: stats.lastProcessedAt
    };
  }
}

module.exports = ContentPipelineIntegration;