// lib/pipeline-monitor.js
/**
 * Pipeline Monitor
 * Real-time monitoring and alerting for the content pipeline
 */

const { createClient } = require('@supabase/supabase-js');
const EventEmitter = require('events');
require('dotenv').config({ path: '.env.local' });

class PipelineMonitor extends EventEmitter {
  constructor() {
    super();
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Monitoring configuration
    this.config = {
      healthCheckInterval: 30000, // 30 seconds
      metricsCollectionInterval: 60000, // 1 minute
      alertThresholds: {
        errorRate: 0.05, // 5%
        responseTime: 5000, // 5 seconds
        queueLength: 100,
        memoryUsage: 0.85, // 85%
        diskUsage: 0.90, // 90%
        cpuUsage: 0.80, // 80%
        healthScore: 0.7 // 70%
      },
      retentionPeriod: 30 * 24 * 60 * 60 * 1000, // 30 days
      maxMetricsInMemory: 1000
    };
    
    // Component monitoring
    this.components = {
      contentEngine: { status: 'unknown', lastCheck: null, metrics: [] },
      contentTemplates: { status: 'unknown', lastCheck: null, metrics: [] },
      templateValidator: { status: 'unknown', lastCheck: null, metrics: [] },
      customerAnalysis: { status: 'unknown', lastCheck: null, metrics: [] },
      competitiveIntelligence: { status: 'unknown', lastCheck: null, metrics: [] },
      aiProvider: { status: 'unknown', lastCheck: null, metrics: [] },
      database: { status: 'unknown', lastCheck: null, metrics: [] },
      orchestrator: { status: 'unknown', lastCheck: null, metrics: [] }
    };
    
    // Real-time metrics
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        inProgress: 0,
        avgResponseTime: 0,
        responseTimes: []
      },
      pipeline: {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        avgExecutionTime: 0,
        executionTimes: []
      },
      quality: {
        avgQualityScore: 0,
        avgReadabilityScore: 0,
        avgEngagementScore: 0,
        qualityDistribution: { excellent: 0, good: 0, fair: 0, poor: 0 }
      },
      resources: {
        memoryUsage: 0,
        cpuUsage: 0,
        diskUsage: 0,
        networkLatency: 0
      },
      errors: {
        total: 0,
        byType: {},
        byComponent: {},
        recent: []
      }
    };
    
    // Active monitoring flags
    this.isMonitoring = false;
    this.healthCheckTimer = null;
    this.metricsTimer = null;
    this.alertsEnabled = true;
    
    // Alert history
    this.alertHistory = [];
    this.maxAlertHistory = 100;
    
    // Performance baselines
    this.baselines = {
      responseTime: 2000,
      executionTime: 10000,
      qualityScore: 0.7,
      errorRate: 0.01
    };
  }

  /**
   * Start monitoring all pipeline components
   */
  async startMonitoring() {
    if (this.isMonitoring) {
      console.log('⚠️ Monitoring already active');
      return;
    }

    console.log('🔍 Starting pipeline monitoring...');
    
    try {
      this.isMonitoring = true;
      
      // Initialize baselines
      await this.initializeBaselines();
      
      // Start health checks
      this.startHealthChecks();
      
      // Start metrics collection
      this.startMetricsCollection();
      
      // Set up event listeners
      this.setupEventListeners();
      
      console.log('✅ Pipeline monitoring started');
      console.log(`   Health checks: every ${this.config.healthCheckInterval}ms`);
      console.log(`   Metrics collection: every ${this.config.metricsCollectionInterval}ms`);
      
      this.emit('monitoring-started');
      
    } catch (error) {
      console.error('❌ Failed to start monitoring:', error.message);
      this.isMonitoring = false;
      throw error;
    }
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) {
      console.log('⚠️ Monitoring not active');
      return;
    }

    console.log('🛑 Stopping pipeline monitoring...');
    
    this.isMonitoring = false;
    
    // Clear timers
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
    
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
      this.metricsTimer = null;
    }
    
    console.log('✅ Pipeline monitoring stopped');
    this.emit('monitoring-stopped');
  }

  /**
   * Initialize performance baselines
   */
  async initializeBaselines() {
    try {
      // Get historical data for baselines
      const { data: recentContent } = await this.supabase
        .from('generated_content')
        .select('quality_score, readability_score, engagement_prediction, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (recentContent && recentContent.length > 0) {
        this.baselines.qualityScore = recentContent.reduce((sum, c) => sum + (c.quality_score || 0), 0) / recentContent.length;
        this.baselines.readabilityScore = recentContent.reduce((sum, c) => sum + (c.readability_score || 0), 0) / recentContent.length;
        this.baselines.engagementScore = recentContent.reduce((sum, c) => sum + (c.engagement_prediction || 0), 0) / recentContent.length;
      }

      console.log('📊 Baselines initialized:', {
        qualityScore: this.baselines.qualityScore.toFixed(3),
        responseTime: this.baselines.responseTime,
        executionTime: this.baselines.executionTime
      });

    } catch (error) {
      console.warn('⚠️ Failed to initialize baselines:', error.message);
    }
  }

  /**
   * Start health checks
   */
  startHealthChecks() {
    this.healthCheckTimer = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error('Health check failed:', error.message);
      }
    }, this.config.healthCheckInterval);
  }

  /**
   * Start metrics collection
   */
  startMetricsCollection() {
    this.metricsTimer = setInterval(async () => {
      try {
        await this.collectMetrics();
      } catch (error) {
        console.error('Metrics collection failed:', error.message);
      }
    }, this.config.metricsCollectionInterval);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    this.on('component-unhealthy', (componentName, status) => {
      this.handleComponentAlert(componentName, status);
    });

    this.on('threshold-exceeded', (metric, value, threshold) => {
      this.handleThresholdAlert(metric, value, threshold);
    });

    this.on('error-spike', (errorRate, threshold) => {
      this.handleErrorSpike(errorRate, threshold);
    });
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck() {
    const healthCheck = {
      timestamp: new Date().toISOString(),
      overallStatus: 'healthy',
      overallScore: 0,
      components: {},
      alerts: []
    };

    let healthyComponents = 0;
    const totalComponents = Object.keys(this.components).length;

    // Check each component
    for (const [componentName, component] of Object.entries(this.components)) {
      try {
        const componentHealth = await this.checkComponentHealth(componentName);
        this.components[componentName].status = componentHealth.status;
        this.components[componentName].lastCheck = new Date().toISOString();
        
        healthCheck.components[componentName] = componentHealth;
        
        if (componentHealth.status === 'healthy') {
          healthyComponents++;
        } else {
          healthCheck.alerts.push({
            type: 'component-unhealthy',
            component: componentName,
            status: componentHealth.status,
            message: componentHealth.message
          });
          
          this.emit('component-unhealthy', componentName, componentHealth);
        }
        
      } catch (error) {
        this.components[componentName].status = 'error';
        healthCheck.components[componentName] = {
          status: 'error',
          message: error.message,
          responseTime: 0
        };
        
        healthCheck.alerts.push({
          type: 'component-error',
          component: componentName,
          message: error.message
        });
      }
    }

    // Calculate overall health score
    healthCheck.overallScore = healthyComponents / totalComponents;
    
    if (healthCheck.overallScore >= 0.9) {
      healthCheck.overallStatus = 'healthy';
    } else if (healthCheck.overallScore >= 0.7) {
      healthCheck.overallStatus = 'warning';
    } else {
      healthCheck.overallStatus = 'critical';
    }

    // Check system resources
    const resourceHealth = await this.checkResourceHealth();
    healthCheck.resources = resourceHealth;

    // Check for threshold violations
    this.checkThresholds(healthCheck);

    // Emit health check event
    this.emit('health-check-complete', healthCheck);

    // Store health check result
    await this.storeHealthCheckResult(healthCheck);

    console.log(`🏥 Health check complete: ${healthCheck.overallStatus} (${(healthCheck.overallScore * 100).toFixed(1)}%)`);
  }

  /**
   * Check individual component health
   */
  async checkComponentHealth(componentName) {
    const startTime = Date.now();
    
    try {
      switch (componentName) {
        case 'database':
          return await this.checkDatabaseHealth();
        
        case 'contentEngine':
          return await this.checkContentEngineHealth();
        
        case 'contentTemplates':
          return await this.checkContentTemplatesHealth();
        
        case 'templateValidator':
          return await this.checkTemplateValidatorHealth();
        
        case 'customerAnalysis':
          return await this.checkCustomerAnalysisHealth();
        
        case 'competitiveIntelligence':
          return await this.checkCompetitiveIntelligenceHealth();
        
        case 'aiProvider':
          return await this.checkAIProviderHealth();
        
        case 'orchestrator':
          return await this.checkOrchestratorHealth();
        
        default:
          return {
            status: 'unknown',
            message: `Unknown component: ${componentName}`,
            responseTime: Date.now() - startTime
          };
      }
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Check database health
   */
  async checkDatabaseHealth() {
    const startTime = Date.now();
    
    try {
      // Simple query to test connectivity
      const { data, error } = await this.supabase
        .from('content_templates')
        .select('count')
        .limit(1);

      if (error) {
        return {
          status: 'error',
          message: error.message,
          responseTime: Date.now() - startTime
        };
      }

      const responseTime = Date.now() - startTime;
      
      return {
        status: responseTime < 1000 ? 'healthy' : 'warning',
        message: `Database responsive in ${responseTime}ms`,
        responseTime: responseTime
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Check content engine health
   */
  async checkContentEngineHealth() {
    const startTime = Date.now();
    
    try {
      // Check if content engine can generate analytics
      const ContentGenerationEngine = require('./content-generation-engine.js');
      const engine = new ContentGenerationEngine();
      
      const analytics = await engine.getGenerationAnalytics(1);
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        message: 'Content engine responsive',
        responseTime: responseTime,
        metadata: { analytics_available: !!analytics }
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Check content templates health
   */
  async checkContentTemplatesHealth() {
    const startTime = Date.now();
    
    try {
      const ContentTemplates = require('./content-templates.js');
      const templates = new ContentTemplates();
      
      const templateList = await templates.getTemplates();
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        message: `Templates accessible (${templateList.length} templates)`,
        responseTime: responseTime,
        metadata: { template_count: templateList.length }
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Check template validator health
   */
  async checkTemplateValidatorHealth() {
    const startTime = Date.now();
    
    try {
      const TemplateValidator = require('./template-validator.js');
      const validator = new TemplateValidator();
      
      // Simple validation test
      const testTemplate = {
        template_name: 'Health Check',
        template_type: 'test',
        template_content: 'Test {{variable}}',
        template_variables: { variable: 'string' }
      };
      
      const validation = await validator.validateTemplate(testTemplate);
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        message: 'Template validator responsive',
        responseTime: responseTime,
        metadata: { validation_successful: !!validation }
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Check customer analysis health
   */
  async checkCustomerAnalysisHealth() {
    const startTime = Date.now();
    
    try {
      const CustomerAnalysis = require('./customer-analysis.js');
      const analysis = new CustomerAnalysis();
      
      // Test basic functionality
      const insights = await analysis.getCustomerInsights('test', { limit: 1 });
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        message: 'Customer analysis responsive',
        responseTime: responseTime,
        metadata: { insights_available: !!insights }
      };
    } catch (error) {
      return {
        status: 'warning',
        message: `Customer analysis degraded: ${error.message}`,
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Check competitive intelligence health
   */
  async checkCompetitiveIntelligenceHealth() {
    const startTime = Date.now();
    
    try {
      const CompetitiveIntelligence = require('./competitive-intelligence.js');
      const intelligence = new CompetitiveIntelligence();
      
      // Test basic functionality
      const signals = await intelligence.getLatestSignals({ limit: 1 });
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        message: 'Competitive intelligence responsive',
        responseTime: responseTime,
        metadata: { signals_available: !!signals }
      };
    } catch (error) {
      return {
        status: 'warning',
        message: `Competitive intelligence degraded: ${error.message}`,
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Check AI provider health
   */
  async checkAIProviderHealth() {
    const startTime = Date.now();
    
    try {
      const AIProvider = require('./ai-provider.js');
      const aiProvider = new AIProvider();
      
      // Test with minimal request
      const response = await aiProvider.generateText('Health check', { max_tokens: 5 });
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        message: 'AI provider responsive',
        responseTime: responseTime,
        metadata: { ai_responsive: !!response }
      };
    } catch (error) {
      return {
        status: 'warning',
        message: `AI provider degraded: ${error.message}`,
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Check orchestrator health
   */
  async checkOrchestratorHealth() {
    const startTime = Date.now();
    
    try {
      const ContentPipelineOrchestrator = require('./content-pipeline-orchestrator.js');
      const orchestrator = new ContentPipelineOrchestrator();
      
      // Test health check method
      const health = await orchestrator.getPipelineHealth();
      const responseTime = Date.now() - startTime;
      
      return {
        status: health.overall_status === 'healthy' ? 'healthy' : 'warning',
        message: `Orchestrator health: ${health.overall_status}`,
        responseTime: responseTime,
        metadata: { health_percentage: health.metrics.health_percentage }
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Check system resource health
   */
  async checkResourceHealth() {
    const memoryUsage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const freeMemory = require('os').freemem();
    
    const memoryUtilization = (totalMemory - freeMemory) / totalMemory;
    
    return {
      memory: {
        utilization: memoryUtilization,
        heap_used: memoryUsage.heapUsed,
        heap_total: memoryUsage.heapTotal,
        external: memoryUsage.external,
        status: memoryUtilization > this.config.alertThresholds.memoryUsage ? 'warning' : 'healthy'
      },
      uptime: process.uptime(),
      node_version: process.version,
      platform: process.platform
    };
  }

  /**
   * Collect detailed metrics
   */
  async collectMetrics() {
    const timestamp = new Date().toISOString();
    
    try {
      // Collect pipeline metrics
      const pipelineMetrics = await this.collectPipelineMetrics();
      
      // Collect quality metrics
      const qualityMetrics = await this.collectQualityMetrics();
      
      // Collect error metrics
      const errorMetrics = await this.collectErrorMetrics();
      
      // Collect performance metrics
      const performanceMetrics = await this.collectPerformanceMetrics();
      
      // Update in-memory metrics
      this.updateMetrics({
        timestamp,
        pipeline: pipelineMetrics,
        quality: qualityMetrics,
        errors: errorMetrics,
        performance: performanceMetrics
      });
      
      // Emit metrics event
      this.emit('metrics-collected', {
        timestamp,
        pipeline: pipelineMetrics,
        quality: qualityMetrics,
        errors: errorMetrics,
        performance: performanceMetrics
      });
      
      console.log(`📊 Metrics collected at ${timestamp}`);
      
    } catch (error) {
      console.error('Metrics collection failed:', error.message);
    }
  }

  /**
   * Collect pipeline metrics
   */
  async collectPipelineMetrics() {
    try {
      const { data: recentContent } = await this.supabase
        .from('generated_content')
        .select('*')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
        .order('created_at', { ascending: false });

      const totalContent = recentContent?.length || 0;
      const approvedContent = recentContent?.filter(c => c.status === 'approved').length || 0;
      const rejectedContent = recentContent?.filter(c => c.status === 'rejected').length || 0;

      return {
        total_content: totalContent,
        approved_content: approvedContent,
        rejected_content: rejectedContent,
        approval_rate: totalContent > 0 ? approvedContent / totalContent : 0,
        content_by_type: this.groupBy(recentContent || [], 'content_type')
      };
    } catch (error) {
      return {
        total_content: 0,
        approved_content: 0,
        rejected_content: 0,
        approval_rate: 0,
        content_by_type: {}
      };
    }
  }

  /**
   * Collect quality metrics
   */
  async collectQualityMetrics() {
    try {
      const { data: recentContent } = await this.supabase
        .from('generated_content')
        .select('quality_score, readability_score, engagement_prediction')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
        .not('quality_score', 'is', null);

      if (!recentContent || recentContent.length === 0) {
        return {
          avg_quality_score: 0,
          avg_readability_score: 0,
          avg_engagement_score: 0,
          quality_distribution: { excellent: 0, good: 0, fair: 0, poor: 0 }
        };
      }

      const avgQuality = recentContent.reduce((sum, c) => sum + (c.quality_score || 0), 0) / recentContent.length;
      const avgReadability = recentContent.reduce((sum, c) => sum + (c.readability_score || 0), 0) / recentContent.length;
      const avgEngagement = recentContent.reduce((sum, c) => sum + (c.engagement_prediction || 0), 0) / recentContent.length;

      const qualityDistribution = { excellent: 0, good: 0, fair: 0, poor: 0 };
      recentContent.forEach(content => {
        const score = content.quality_score || 0;
        if (score >= 0.9) qualityDistribution.excellent++;
        else if (score >= 0.7) qualityDistribution.good++;
        else if (score >= 0.5) qualityDistribution.fair++;
        else qualityDistribution.poor++;
      });

      return {
        avg_quality_score: avgQuality,
        avg_readability_score: avgReadability,
        avg_engagement_score: avgEngagement,
        quality_distribution: qualityDistribution
      };
    } catch (error) {
      return {
        avg_quality_score: 0,
        avg_readability_score: 0,
        avg_engagement_score: 0,
        quality_distribution: { excellent: 0, good: 0, fair: 0, poor: 0 }
      };
    }
  }

  /**
   * Collect error metrics
   */
  async collectErrorMetrics() {
    // In a real implementation, you would collect from error logs
    return {
      total_errors: 0,
      error_rate: 0,
      errors_by_type: {},
      errors_by_component: {},
      recent_errors: []
    };
  }

  /**
   * Collect performance metrics
   */
  async collectPerformanceMetrics() {
    const memoryUsage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const freeMemory = require('os').freemem();
    
    return {
      memory_usage: (memoryUsage.heapUsed / 1024 / 1024), // MB
      memory_utilization: (totalMemory - freeMemory) / totalMemory,
      uptime: process.uptime(),
      cpu_usage: 0, // Would need additional monitoring
      response_time: this.getAverageResponseTime()
    };
  }

  /**
   * Update in-memory metrics
   */
  updateMetrics(newMetrics) {
    // Update metrics object
    Object.assign(this.metrics, {
      pipeline: newMetrics.pipeline,
      quality: newMetrics.quality,
      errors: newMetrics.errors,
      resources: newMetrics.performance
    });

    // Store in component metrics (keep last N entries)
    Object.keys(this.components).forEach(componentName => {
      const component = this.components[componentName];
      component.metrics.push({
        timestamp: newMetrics.timestamp,
        status: component.status,
        responseTime: component.lastResponseTime || 0
      });

      // Keep only recent metrics
      if (component.metrics.length > this.config.maxMetricsInMemory) {
        component.metrics = component.metrics.slice(-this.config.maxMetricsInMemory);
      }
    });
  }

  /**
   * Check thresholds and emit alerts
   */
  checkThresholds(healthCheck) {
    const thresholds = this.config.alertThresholds;
    
    // Check overall health score
    if (healthCheck.overallScore < thresholds.healthScore) {
      this.emit('threshold-exceeded', 'health-score', healthCheck.overallScore, thresholds.healthScore);
    }

    // Check resource utilization
    if (healthCheck.resources.memory.utilization > thresholds.memoryUsage) {
      this.emit('threshold-exceeded', 'memory-usage', healthCheck.resources.memory.utilization, thresholds.memoryUsage);
    }

    // Check response times
    Object.values(healthCheck.components).forEach(component => {
      if (component.responseTime > thresholds.responseTime) {
        this.emit('threshold-exceeded', 'response-time', component.responseTime, thresholds.responseTime);
      }
    });
  }

  /**
   * Handle component alert
   */
  handleComponentAlert(componentName, status) {
    const alert = {
      id: this.generateAlertId(),
      timestamp: new Date().toISOString(),
      type: 'component-alert',
      severity: status.status === 'error' ? 'critical' : 'warning',
      component: componentName,
      message: `Component ${componentName} is ${status.status}: ${status.message}`,
      status: status
    };

    this.addAlert(alert);
    console.log(`🚨 Component Alert: ${alert.message}`);
  }

  /**
   * Handle threshold alert
   */
  handleThresholdAlert(metric, value, threshold) {
    const alert = {
      id: this.generateAlertId(),
      timestamp: new Date().toISOString(),
      type: 'threshold-alert',
      severity: 'warning',
      metric: metric,
      value: value,
      threshold: threshold,
      message: `Threshold exceeded: ${metric} (${value}) > ${threshold}`
    };

    this.addAlert(alert);
    console.log(`⚠️ Threshold Alert: ${alert.message}`);
  }

  /**
   * Handle error spike
   */
  handleErrorSpike(errorRate, threshold) {
    const alert = {
      id: this.generateAlertId(),
      timestamp: new Date().toISOString(),
      type: 'error-spike',
      severity: 'critical',
      errorRate: errorRate,
      threshold: threshold,
      message: `Error rate spike detected: ${(errorRate * 100).toFixed(2)}% > ${(threshold * 100).toFixed(2)}%`
    };

    this.addAlert(alert);
    console.log(`🚨 Error Spike Alert: ${alert.message}`);
  }

  /**
   * Add alert to history
   */
  addAlert(alert) {
    this.alertHistory.unshift(alert);
    
    // Keep only recent alerts
    if (this.alertHistory.length > this.maxAlertHistory) {
      this.alertHistory = this.alertHistory.slice(0, this.maxAlertHistory);
    }

    this.emit('alert-created', alert);
  }

  /**
   * Store health check result
   */
  async storeHealthCheckResult(healthCheck) {
    try {
      // In a real implementation, you would store this in a metrics database
      console.log('💾 Health check result stored (placeholder)');
    } catch (error) {
      console.warn('Failed to store health check result:', error.message);
    }
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      monitoring: this.isMonitoring,
      components: this.components,
      metrics: this.metrics,
      alerts: this.alertHistory.slice(0, 10), // Recent alerts
      uptime: process.uptime(),
      lastHealthCheck: Math.max(...Object.values(this.components).map(c => new Date(c.lastCheck || 0).getTime()))
    };
  }

  /**
   * Get detailed metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      monitoring_active: this.isMonitoring
    };
  }

  /**
   * Get component metrics
   */
  getComponentMetrics(componentName) {
    const component = this.components[componentName];
    if (!component) {
      return null;
    }

    return {
      name: componentName,
      status: component.status,
      lastCheck: component.lastCheck,
      metrics: component.metrics.slice(-100), // Last 100 metrics
      avgResponseTime: this.calculateAverageResponseTime(component.metrics),
      uptime: this.calculateUptime(component.metrics)
    };
  }

  /**
   * Generate alert ID
   */
  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get average response time
   */
  getAverageResponseTime() {
    const allMetrics = Object.values(this.components).flatMap(c => c.metrics);
    if (allMetrics.length === 0) return 0;
    
    const totalResponseTime = allMetrics.reduce((sum, m) => sum + (m.responseTime || 0), 0);
    return totalResponseTime / allMetrics.length;
  }

  /**
   * Calculate average response time for component
   */
  calculateAverageResponseTime(metrics) {
    if (metrics.length === 0) return 0;
    
    const totalResponseTime = metrics.reduce((sum, m) => sum + (m.responseTime || 0), 0);
    return totalResponseTime / metrics.length;
  }

  /**
   * Calculate uptime for component
   */
  calculateUptime(metrics) {
    if (metrics.length === 0) return 0;
    
    const healthyMetrics = metrics.filter(m => m.status === 'healthy').length;
    return healthyMetrics / metrics.length;
  }

  /**
   * Group array by property
   */
  groupBy(array, property) {
    return array.reduce((groups, item) => {
      const key = item[property] || 'unknown';
      groups[key] = (groups[key] || 0) + 1;
      return groups;
    }, {});
  }
}

module.exports = PipelineMonitor;