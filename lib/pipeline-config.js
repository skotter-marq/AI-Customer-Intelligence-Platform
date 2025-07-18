// lib/pipeline-config.js
/**
 * Content Pipeline Configuration
 * Centralized configuration for all pipeline components
 */

class PipelineConfig {
  constructor() {
    this.config = {
      // Pipeline settings
      pipeline: {
        autoValidation: true,
        aiEnhancement: true,
        approvalRequired: true,
        qualityThreshold: 0.7,
        maxRetries: 3,
        batchSize: 10,
        parallelProcessing: true,
        enableCaching: true,
        cacheTimeout: 300000, // 5 minutes
        maxConcurrentRequests: 5
      },

      // Content Generation settings
      contentGeneration: {
        defaultTargetAudience: 'prospects',
        defaultContentFormat: 'markdown',
        defaultPriority: 'medium',
        maxVariableSubstitutions: 1000,
        maxContentLength: 50000,
        enableAIEnhancement: true,
        aiEnhancementTimeout: 30000, // 30 seconds
        maxDataSourcesPerRequest: 10
      },

      // Template validation settings
      templateValidation: {
        syntaxValidation: true,
        securityValidation: true,
        performanceValidation: true,
        accessibilityValidation: true,
        businessLogicValidation: true,
        maxTemplateLength: 50000,
        minTemplateLength: 50,
        maxVariableCount: 50,
        maxHeadingLevels: 6,
        maxListDepth: 5,
        minReadabilityScore: 0.6,
        maxDuplicateContent: 0.3
      },

      // Quality thresholds
      qualityThresholds: {
        minimum_quality: 0.6,
        minimum_readability: 0.7,
        minimum_engagement: 0.5,
        minimum_seo: 0.6,
        minimum_security: 0.9,
        minimum_performance: 0.8,
        excellent_threshold: 0.9,
        good_threshold: 0.7,
        fair_threshold: 0.5
      },

      // Data source configurations
      dataSources: {
        customer_meeting: {
          enabled: true,
          priority: 'high',
          defaultLimit: 10,
          maxAge: 90 // days
        },
        customer_insight: {
          enabled: true,
          priority: 'high',
          defaultLimit: 10,
          maxAge: 60 // days
        },
        competitive_signal: {
          enabled: true,
          priority: 'medium',
          defaultLimit: 5,
          maxAge: 30 // days
        },
        product_update: {
          enabled: true,
          priority: 'high',
          defaultLimit: 5,
          maxAge: 30 // days
        },
        market_research: {
          enabled: true,
          priority: 'medium',
          defaultLimit: 5,
          maxAge: 60 // days
        },
        customer_feedback: {
          enabled: true,
          priority: 'medium',
          defaultLimit: 10,
          maxAge: 30 // days
        }
      },

      // AI provider settings
      aiProvider: {
        defaultModel: 'gpt-4',
        maxTokens: 4000,
        temperature: 0.7,
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
        enableFallback: true,
        fallbackModel: 'gpt-3.5-turbo'
      },

      // Approval workflow settings
      approvalWorkflow: {
        enabled: true,
        defaultReviewers: {
          marketing: 'marketing@company.com',
          legal: 'legal@company.com',
          executive: 'exec@company.com'
        },
        workflowTemplates: {
          case_study: ['marketing', 'legal'],
          press_release: ['marketing', 'legal', 'executive'],
          battle_card: ['marketing'],
          email_campaign: ['marketing'],
          blog_post: ['marketing'],
          social_media: ['marketing']
        },
        defaultDueDays: {
          marketing: 2,
          legal: 3,
          executive: 1
        },
        escalationEnabled: true,
        escalationAfterDays: 5,
        escalationRecipient: 'manager@company.com'
      },

      // Performance monitoring
      performance: {
        enableMetrics: true,
        metricsRetention: 30, // days
        slowQueryThreshold: 5000, // ms
        errorRateThreshold: 0.05, // 5%
        alertingEnabled: true,
        alertingEmail: 'alerts@company.com',
        healthCheckInterval: 60000, // 1 minute
        performanceLogging: true
      },

      // Security settings
      security: {
        enableContentSanitization: true,
        enableInputValidation: true,
        enableOutputValidation: true,
        maxRequestSize: 10485760, // 10MB
        rateLimiting: {
          enabled: true,
          maxRequestsPerMinute: 100,
          maxRequestsPerHour: 1000
        },
        contentSecurityPolicy: {
          enableXSSProtection: true,
          enableSQLInjectionProtection: true,
          enableScriptInjectionProtection: true
        },
        sensitiveDataDetection: {
          enabled: true,
          patterns: ['password', 'api_key', 'secret', 'token'],
          redactSensitiveData: true
        }
      },

      // Caching settings
      caching: {
        enabled: true,
        defaultTTL: 300, // 5 minutes
        maxCacheSize: 100, // MB
        cacheStrategies: {
          templates: { ttl: 3600, enabled: true }, // 1 hour
          insights: { ttl: 1800, enabled: true }, // 30 minutes
          validations: { ttl: 600, enabled: true }, // 10 minutes
          analytics: { ttl: 300, enabled: true } // 5 minutes
        },
        enableDistributedCache: false,
        cacheKeyPrefix: 'content_pipeline'
      },

      // Logging settings
      logging: {
        enabled: true,
        level: 'info', // debug, info, warn, error
        enableFileLogging: true,
        enableConsoleLogging: true,
        logRotation: {
          enabled: true,
          maxFileSize: '10MB',
          maxFiles: 10
        },
        sensitiveDataLogging: false,
        performanceLogging: true,
        errorLogging: true
      },

      // Database settings
      database: {
        connectionTimeout: 30000,
        queryTimeout: 60000,
        maxRetries: 3,
        enableConnectionPooling: true,
        maxConnections: 20,
        enableQueryLogging: false,
        enableSlowQueryLogging: true,
        slowQueryThreshold: 5000
      },

      // Feature flags
      featureFlags: {
        enableAIEnhancement: true,
        enableBatchProcessing: true,
        enableParallelProcessing: true,
        enableAdvancedValidation: true,
        enableInsightsGeneration: true,
        enablePerformanceMonitoring: true,
        enableContentCaching: true,
        enableApprovalWorkflows: true,
        enableQualityEnhancement: true,
        enableSecurityScanning: true
      },

      // Content type configurations
      contentTypes: {
        case_study: {
          enabled: true,
          defaultTemplate: 'case_study',
          requiredDataSources: ['customer_meeting', 'customer_insight'],
          approvalRequired: true,
          aiEnhancement: true,
          qualityThreshold: 0.8
        },
        battle_card: {
          enabled: true,
          defaultTemplate: 'battle_card',
          requiredDataSources: ['competitive_signal'],
          approvalRequired: false,
          aiEnhancement: true,
          qualityThreshold: 0.7
        },
        email_campaign: {
          enabled: true,
          defaultTemplate: 'email_campaign',
          requiredDataSources: ['product_update'],
          approvalRequired: false,
          aiEnhancement: true,
          qualityThreshold: 0.7
        },
        blog_post: {
          enabled: true,
          defaultTemplate: 'blog_post',
          requiredDataSources: ['market_research', 'customer_insight'],
          approvalRequired: true,
          aiEnhancement: true,
          qualityThreshold: 0.8
        },
        press_release: {
          enabled: true,
          defaultTemplate: 'press_release',
          requiredDataSources: ['product_update'],
          approvalRequired: true,
          aiEnhancement: true,
          qualityThreshold: 0.9
        },
        social_media: {
          enabled: true,
          defaultTemplate: 'social_media',
          requiredDataSources: ['product_update', 'customer_feedback'],
          approvalRequired: false,
          aiEnhancement: true,
          qualityThreshold: 0.6
        }
      },

      // Target audience configurations
      targetAudiences: {
        prospects: {
          tone: 'professional and engaging',
          keyMessaging: ['value proposition', 'differentiation', 'results'],
          preferredContentTypes: ['case_study', 'demo_script', 'battle_card'],
          qualityThreshold: 0.8
        },
        customers: {
          tone: 'helpful and informative',
          keyMessaging: ['product benefits', 'how-to guidance', 'support'],
          preferredContentTypes: ['email_campaign', 'changelog', 'one_pager'],
          qualityThreshold: 0.7
        },
        internal_team: {
          tone: 'direct and actionable',
          keyMessaging: ['process details', 'action items', 'metrics'],
          preferredContentTypes: ['battle_card', 'demo_script', 'changelog'],
          qualityThreshold: 0.6
        },
        media: {
          tone: 'authoritative and newsworthy',
          keyMessaging: ['news angle', 'company impact', 'industry significance'],
          preferredContentTypes: ['press_release', 'blog_post', 'social_media'],
          qualityThreshold: 0.9
        }
      },

      // Environment-specific settings
      environment: {
        development: {
          enableDebugMode: true,
          enableDetailedLogging: true,
          enableTestMode: true,
          aiEnhancement: false, // Disable AI in dev to save costs
          approvalRequired: false,
          qualityThreshold: 0.5
        },
        staging: {
          enableDebugMode: false,
          enableDetailedLogging: true,
          enableTestMode: true,
          aiEnhancement: true,
          approvalRequired: true,
          qualityThreshold: 0.7
        },
        production: {
          enableDebugMode: false,
          enableDetailedLogging: false,
          enableTestMode: false,
          aiEnhancement: true,
          approvalRequired: true,
          qualityThreshold: 0.8
        }
      }
    };
  }

  /**
   * Get configuration for current environment
   * @returns {Object} Configuration object
   */
  getConfig() {
    const environment = process.env.NODE_ENV || 'development';
    const envConfig = this.config.environment[environment] || this.config.environment.development;
    
    // Merge environment-specific settings with base config
    return {
      ...this.config,
      ...envConfig
    };
  }

  /**
   * Get configuration section
   * @param {string} section - Configuration section name
   * @returns {Object} Configuration section
   */
  getSection(section) {
    return this.config[section] || {};
  }

  /**
   * Update configuration
   * @param {string} section - Configuration section name
   * @param {Object} updates - Configuration updates
   */
  updateConfig(section, updates) {
    if (this.config[section]) {
      this.config[section] = { ...this.config[section], ...updates };
    }
  }

  /**
   * Get data source configuration
   * @param {string} dataSourceType - Data source type
   * @returns {Object} Data source configuration
   */
  getDataSourceConfig(dataSourceType) {
    return this.config.dataSources[dataSourceType] || {
      enabled: false,
      priority: 'low',
      defaultLimit: 5,
      maxAge: 30
    };
  }

  /**
   * Get content type configuration
   * @param {string} contentType - Content type
   * @returns {Object} Content type configuration
   */
  getContentTypeConfig(contentType) {
    return this.config.contentTypes[contentType] || {
      enabled: true,
      defaultTemplate: contentType,
      requiredDataSources: [],
      approvalRequired: false,
      aiEnhancement: true,
      qualityThreshold: 0.7
    };
  }

  /**
   * Get target audience configuration
   * @param {string} audience - Target audience
   * @returns {Object} Audience configuration
   */
  getAudienceConfig(audience) {
    return this.config.targetAudiences[audience] || {
      tone: 'professional',
      keyMessaging: ['general information'],
      preferredContentTypes: ['general'],
      qualityThreshold: 0.7
    };
  }

  /**
   * Get approval workflow configuration
   * @param {string} contentType - Content type
   * @returns {Array} Approval workflow steps
   */
  getApprovalWorkflow(contentType) {
    const workflow = this.config.approvalWorkflow.workflowTemplates[contentType] || ['marketing'];
    
    return workflow.map(role => ({
      role,
      reviewer_email: this.config.approvalWorkflow.defaultReviewers[role] || 'marketing@company.com',
      due_days: this.config.approvalWorkflow.defaultDueDays[role] || 2
    }));
  }

  /**
   * Check if feature is enabled
   * @param {string} feature - Feature name
   * @returns {boolean} Whether feature is enabled
   */
  isFeatureEnabled(feature) {
    return this.config.featureFlags[feature] !== false;
  }

  /**
   * Get quality threshold for content type
   * @param {string} contentType - Content type
   * @returns {number} Quality threshold
   */
  getQualityThreshold(contentType) {
    const contentConfig = this.getContentTypeConfig(contentType);
    return contentConfig.qualityThreshold || this.config.qualityThresholds.minimum_quality;
  }

  /**
   * Get cache configuration
   * @param {string} cacheType - Cache type
   * @returns {Object} Cache configuration
   */
  getCacheConfig(cacheType) {
    const cacheStrategy = this.config.caching.cacheStrategies[cacheType];
    
    return {
      enabled: this.config.caching.enabled && (cacheStrategy?.enabled !== false),
      ttl: cacheStrategy?.ttl || this.config.caching.defaultTTL,
      keyPrefix: `${this.config.caching.cacheKeyPrefix}:${cacheType}`
    };
  }

  /**
   * Validate configuration
   * @returns {Object} Validation result
   */
  validateConfig() {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Validate required sections
    const requiredSections = ['pipeline', 'contentGeneration', 'templateValidation', 'qualityThresholds'];
    requiredSections.forEach(section => {
      if (!this.config[section]) {
        validation.errors.push(`Missing required configuration section: ${section}`);
        validation.isValid = false;
      }
    });

    // Validate quality thresholds
    const thresholds = this.config.qualityThresholds;
    Object.values(thresholds).forEach(threshold => {
      if (typeof threshold !== 'number' || threshold < 0 || threshold > 1) {
        validation.errors.push(`Invalid quality threshold: ${threshold}`);
        validation.isValid = false;
      }
    });

    // Validate data sources
    Object.entries(this.config.dataSources).forEach(([type, config]) => {
      if (!config.enabled && config.priority === 'high') {
        validation.warnings.push(`High priority data source ${type} is disabled`);
      }
    });

    return validation;
  }
}

module.exports = PipelineConfig;