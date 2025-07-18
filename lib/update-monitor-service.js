// lib/update-monitor-service.js
/**
 * Update Monitor Service
 * Centralized service for monitoring product updates and triggering content generation
 */

const { createClient } = require('@supabase/supabase-js');
const UpdateContentGenerator = require('./update-content-generator.js');
const PipelineMonitor = require('./pipeline-monitor.js');
const { EventEmitter } = require('events');
require('dotenv').config({ path: '.env.local' });

class UpdateMonitorService extends EventEmitter {
  constructor() {
    super();
    
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    this.updateContentGenerator = new UpdateContentGenerator();
    this.pipelineMonitor = new PipelineMonitor();
    
    // Service configuration
    this.config = {
      enableAutomaticGeneration: true,
      enableRealTimeMonitoring: true,
      webhookNotifications: true,
      slackNotifications: false,
      emailNotifications: false,
      contentApprovalWorkflow: true,
      priorityThreshold: 0.7,
      batchProcessingEnabled: true,
      batchSize: 10,
      processingDelay: 5000, // 5 seconds
      retryAttempts: 3,
      retryDelay: 30000 // 30 seconds
    };
    
    // Service state
    this.isRunning = false;
    this.lastProcessedTimestamp = null;
    this.processingQueue = [];
    this.retryQueue = [];
    this.activeProcessing = false;
    
    // Statistics
    this.stats = {
      totalUpdatesProcessed: 0,
      contentGenerated: 0,
      notificationsSent: 0,
      errorsEncountered: 0,
      averageProcessingTime: 0,
      lastProcessedAt: null,
      serviceStartedAt: null
    };
    
    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Set up event listeners for components
   */
  setupEventListeners() {
    // Listen to update content generator events
    this.updateContentGenerator.on('update_processed', (data) => {
      this.handleUpdateProcessed(data);
    });
    
    this.updateContentGenerator.on('update_error', (data) => {
      this.handleUpdateError(data);
    });
    
    this.updateContentGenerator.on('scan_completed', (data) => {
      this.handleScanCompleted(data);
    });
    
    // Listen to pipeline monitor events
    this.pipelineMonitor.on('health_check_completed', (data) => {
      this.handleHealthCheckCompleted(data);
    });
    
    this.pipelineMonitor.on('alert_triggered', (data) => {
      this.handleAlertTriggered(data);
    });
  }

  /**
   * Start the update monitor service
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️ Update Monitor Service is already running');
      return;
    }

    console.log('🚀 Starting Update Monitor Service...');
    
    try {
      this.isRunning = true;
      this.stats.serviceStartedAt = new Date().toISOString();
      
      // Start pipeline monitoring
      await this.pipelineMonitor.startMonitoring();
      
      // Start update content generator monitoring
      if (this.config.enableAutomaticGeneration) {
        this.updateContentGenerator.startMonitoring();
      }
      
      // Start real-time monitoring if enabled
      if (this.config.enableRealTimeMonitoring) {
        this.startRealTimeMonitoring();
      }
      
      // Start batch processing
      if (this.config.batchProcessingEnabled) {
        this.startBatchProcessing();
      }
      
      console.log('✅ Update Monitor Service started successfully');
      this.emit('service_started');
      
    } catch (error) {
      console.error('❌ Failed to start Update Monitor Service:', error.message);
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * Stop the update monitor service
   */
  async stop() {
    if (!this.isRunning) {
      console.log('⚠️ Update Monitor Service is not running');
      return;
    }

    console.log('🛑 Stopping Update Monitor Service...');
    
    try {
      this.isRunning = false;
      
      // Stop components
      this.updateContentGenerator.stopMonitoring();
      this.pipelineMonitor.stopMonitoring();
      
      // Stop real-time monitoring
      this.stopRealTimeMonitoring();
      
      // Stop batch processing
      this.stopBatchProcessing();
      
      console.log('✅ Update Monitor Service stopped successfully');
      this.emit('service_stopped');
      
    } catch (error) {
      console.error('❌ Failed to stop Update Monitor Service:', error.message);
      throw error;
    }
  }

  /**
   * Start real-time monitoring for database changes
   */
  startRealTimeMonitoring() {
    console.log('🔍 Starting real-time monitoring...');
    
    // Subscribe to product_updates table changes
    this.supabase
      .channel('product_updates_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'product_updates'
      }, (payload) => {
        this.handleNewUpdate(payload.new);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'product_updates'
      }, (payload) => {
        this.handleUpdateChanged(payload.new, payload.old);
      })
      .subscribe();
    
    console.log('✅ Real-time monitoring started');
  }

  /**
   * Stop real-time monitoring
   */
  stopRealTimeMonitoring() {
    console.log('🛑 Stopping real-time monitoring...');
    
    // Unsubscribe from all channels
    this.supabase.removeAllChannels();
    
    console.log('✅ Real-time monitoring stopped');
  }

  /**
   * Start batch processing
   */
  startBatchProcessing() {
    console.log('📦 Starting batch processing...');
    
    this.batchProcessingInterval = setInterval(() => {
      this.processBatch();
    }, this.config.processingDelay);
    
    console.log('✅ Batch processing started');
  }

  /**
   * Stop batch processing
   */
  stopBatchProcessing() {
    console.log('🛑 Stopping batch processing...');
    
    if (this.batchProcessingInterval) {
      clearInterval(this.batchProcessingInterval);
      this.batchProcessingInterval = null;
    }
    
    console.log('✅ Batch processing stopped');
  }

  /**
   * Handle new update detected
   * @param {Object} update - New update object
   */
  async handleNewUpdate(update) {
    try {
      console.log(`🆕 New update detected: ${update.title}`);
      
      // Add to processing queue
      this.addToProcessingQueue(update, 'new');
      
      // Send immediate notification for high priority updates
      if (update.priority === 'high' || update.priority === 'critical') {
        await this.sendImmediateNotification(update, 'new_high_priority_update');
      }
      
      this.emit('new_update_detected', update);
      
    } catch (error) {
      console.error('Failed to handle new update:', error.message);
      this.stats.errorsEncountered++;
    }
  }

  /**
   * Handle update changed
   * @param {Object} newUpdate - Updated update object
   * @param {Object} oldUpdate - Previous update object
   */
  async handleUpdateChanged(newUpdate, oldUpdate) {
    try {
      console.log(`🔄 Update changed: ${newUpdate.title}`);
      
      // Check if priority or status changed
      if (newUpdate.priority !== oldUpdate.priority || 
          newUpdate.status !== oldUpdate.status) {
        
        // Add to processing queue
        this.addToProcessingQueue(newUpdate, 'changed');
        
        // Send notification for significant changes
        if (newUpdate.priority === 'critical' && oldUpdate.priority !== 'critical') {
          await this.sendImmediateNotification(newUpdate, 'priority_escalated');
        }
      }
      
      this.emit('update_changed', { new: newUpdate, old: oldUpdate });
      
    } catch (error) {
      console.error('Failed to handle update change:', error.message);
      this.stats.errorsEncountered++;
    }
  }

  /**
   * Add update to processing queue
   * @param {Object} update - Update object
   * @param {string} action - Action type (new, changed, retry)
   */
  addToProcessingQueue(update, action) {
    const queueItem = {
      id: `${update.id}_${Date.now()}`,
      update: update,
      action: action,
      timestamp: new Date().toISOString(),
      attempts: 0
    };
    
    this.processingQueue.push(queueItem);
    console.log(`📤 Added to processing queue: ${update.title} (${action})`);
  }

  /**
   * Process batch of updates
   */
  async processBatch() {
    if (this.activeProcessing || this.processingQueue.length === 0) {
      return;
    }
    
    this.activeProcessing = true;
    
    try {
      // Get batch of items to process
      const batchSize = Math.min(this.config.batchSize, this.processingQueue.length);
      const batch = this.processingQueue.splice(0, batchSize);
      
      console.log(`📦 Processing batch of ${batch.length} updates...`);
      
      const processingPromises = batch.map(item => this.processQueueItem(item));
      const results = await Promise.allSettled(processingPromises);
      
      // Handle results
      let successCount = 0;
      let failureCount = 0;
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successCount++;
        } else {
          failureCount++;
          // Add to retry queue
          this.addToRetryQueue(batch[index], result.reason);
        }
      });
      
      console.log(`✅ Batch processing completed: ${successCount} successful, ${failureCount} failed`);
      
    } catch (error) {
      console.error('❌ Batch processing failed:', error.message);
      this.stats.errorsEncountered++;
    } finally {
      this.activeProcessing = false;
    }
  }

  /**
   * Process individual queue item
   * @param {Object} item - Queue item
   */
  async processQueueItem(item) {
    const startTime = Date.now();
    
    try {
      console.log(`🔄 Processing update: ${item.update.title} (${item.action})`);
      
      // Analyze update
      const analysis = await this.updateContentGenerator.analyzeUpdate(item.update);
      
      // Check if content should be generated
      if (this.updateContentGenerator.shouldGenerateContent(analysis)) {
        
        // Determine content types
        const contentTypes = this.updateContentGenerator.determineContentTypes(analysis);
        
        // Generate content
        const generationResult = await this.updateContentGenerator.generateContentManually(
          item.update.id,
          contentTypes
        );
        
        if (generationResult.success) {
          // Send notifications
          await this.sendContentGenerationNotifications(item.update, generationResult, analysis);
          
          // Update statistics
          this.stats.contentGenerated += generationResult.content.length;
        }
      }
      
      // Update processing statistics
      const processingTime = Date.now() - startTime;
      this.updateProcessingStats(processingTime);
      
      this.emit('item_processed', {
        item: item,
        processing_time: processingTime,
        success: true
      });
      
    } catch (error) {
      console.error(`❌ Failed to process queue item: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add item to retry queue
   * @param {Object} item - Queue item
   * @param {Error} error - Processing error
   */
  addToRetryQueue(item, error) {
    item.attempts++;
    item.lastError = error.message;
    item.nextRetry = new Date(Date.now() + this.config.retryDelay).toISOString();
    
    if (item.attempts < this.config.retryAttempts) {
      this.retryQueue.push(item);
      console.log(`🔄 Added to retry queue: ${item.update.title} (attempt ${item.attempts})`);
    } else {
      console.error(`❌ Max retry attempts reached for: ${item.update.title}`);
      this.emit('max_retries_reached', item);
    }
  }

  /**
   * Process retry queue
   */
  async processRetryQueue() {
    if (this.retryQueue.length === 0) {
      return;
    }
    
    const now = new Date();
    const readyForRetry = this.retryQueue.filter(item => 
      new Date(item.nextRetry) <= now
    );
    
    if (readyForRetry.length === 0) {
      return;
    }
    
    console.log(`🔄 Processing ${readyForRetry.length} retry items...`);
    
    // Move ready items back to processing queue
    readyForRetry.forEach(item => {
      this.processingQueue.push(item);
      this.retryQueue = this.retryQueue.filter(retryItem => retryItem.id !== item.id);
    });
  }

  /**
   * Send immediate notification
   * @param {Object} update - Update object
   * @param {string} type - Notification type
   */
  async sendImmediateNotification(update, type) {
    try {
      const notification = {
        type: type,
        update: update,
        timestamp: new Date().toISOString(),
        urgent: update.priority === 'critical'
      };
      
      if (this.config.webhookNotifications) {
        await this.sendWebhookNotification(notification);
      }
      
      if (this.config.slackNotifications) {
        await this.sendSlackNotification(notification);
      }
      
      if (this.config.emailNotifications) {
        await this.sendEmailNotification(notification);
      }
      
      this.stats.notificationsSent++;
      console.log(`📧 Immediate notification sent: ${type} for ${update.title}`);
      
    } catch (error) {
      console.error('Failed to send immediate notification:', error.message);
    }
  }

  /**
   * Send content generation notifications
   * @param {Object} update - Update object
   * @param {Object} generationResult - Generation result
   * @param {Object} analysis - Update analysis
   */
  async sendContentGenerationNotifications(update, generationResult, analysis) {
    try {
      const notification = {
        type: 'content_generated',
        update: update,
        content: generationResult.content,
        analysis: analysis,
        timestamp: new Date().toISOString()
      };
      
      if (this.config.webhookNotifications) {
        await this.sendWebhookNotification(notification);
      }
      
      this.stats.notificationsSent++;
      console.log(`📧 Content generation notification sent for ${update.title}`);
      
    } catch (error) {
      console.error('Failed to send content generation notification:', error.message);
    }
  }

  /**
   * Send webhook notification
   * @param {Object} notification - Notification object
   */
  async sendWebhookNotification(notification) {
    // Implementation would send to configured webhook endpoints
    console.log('📡 Webhook notification sent:', notification.type);
  }

  /**
   * Send Slack notification
   * @param {Object} notification - Notification object
   */
  async sendSlackNotification(notification) {
    // Implementation would send to Slack channel
    console.log('💬 Slack notification sent:', notification.type);
  }

  /**
   * Send email notification
   * @param {Object} notification - Notification object
   */
  async sendEmailNotification(notification) {
    // Implementation would send email
    console.log('📧 Email notification sent:', notification.type);
  }

  /**
   * Handle update processed event
   * @param {Object} data - Event data
   */
  handleUpdateProcessed(data) {
    console.log(`✅ Update processed: ${data.update.title}`);
    this.stats.totalUpdatesProcessed++;
    this.stats.lastProcessedAt = new Date().toISOString();
    
    this.emit('update_processed', data);
  }

  /**
   * Handle update error event
   * @param {Object} data - Event data
   */
  handleUpdateError(data) {
    console.error(`❌ Update processing error: ${data.update.title} - ${data.error}`);
    this.stats.errorsEncountered++;
    
    this.emit('update_error', data);
  }

  /**
   * Handle scan completed event
   * @param {Object} data - Event data
   */
  handleScanCompleted(data) {
    console.log(`🔍 Scan completed: ${data.updatesFound} updates found`);
    this.emit('scan_completed', data);
  }

  /**
   * Handle health check completed event
   * @param {Object} data - Event data
   */
  handleHealthCheckCompleted(data) {
    console.log(`💓 Health check completed: ${data.overall_health}`);
    this.emit('health_check_completed', data);
  }

  /**
   * Handle alert triggered event
   * @param {Object} data - Event data
   */
  handleAlertTriggered(data) {
    console.log(`🚨 Alert triggered: ${data.alert.type} - ${data.alert.message}`);
    this.emit('alert_triggered', data);
  }

  /**
   * Update processing statistics
   * @param {number} processingTime - Processing time in milliseconds
   */
  updateProcessingStats(processingTime) {
    const currentAvg = this.stats.averageProcessingTime;
    const count = this.stats.totalUpdatesProcessed;
    
    this.stats.averageProcessingTime = (currentAvg * count + processingTime) / (count + 1);
    this.stats.totalUpdatesProcessed++;
    this.stats.lastProcessedAt = new Date().toISOString();
  }

  /**
   * Get service statistics
   * @returns {Object} Service statistics
   */
  getStatistics() {
    return {
      ...this.stats,
      is_running: this.isRunning,
      processing_queue_length: this.processingQueue.length,
      retry_queue_length: this.retryQueue.length,
      uptime: this.stats.serviceStartedAt ? 
        Date.now() - new Date(this.stats.serviceStartedAt).getTime() : 0
    };
  }

  /**
   * Get service configuration
   * @returns {Object} Service configuration
   */
  getConfiguration() {
    return this.config;
  }

  /**
   * Update service configuration
   * @param {Object} updates - Configuration updates
   */
  updateConfiguration(updates) {
    Object.assign(this.config, updates);
    this.emit('configuration_updated', this.config);
  }

  /**
   * Get service health status
   * @returns {Object} Health status
   */
  getHealthStatus() {
    const stats = this.getStatistics();
    const uptime = stats.uptime;
    const errorRate = stats.errorsEncountered / Math.max(stats.totalUpdatesProcessed, 1);
    
    return {
      status: this.isRunning ? 'running' : 'stopped',
      uptime: uptime,
      error_rate: errorRate,
      processing_queue_length: stats.processing_queue_length,
      retry_queue_length: stats.retry_queue_length,
      last_processed_at: stats.lastProcessedAt,
      average_processing_time: stats.averageProcessingTime,
      health_score: this.calculateHealthScore(stats, errorRate)
    };
  }

  /**
   * Calculate service health score
   * @param {Object} stats - Service statistics
   * @param {number} errorRate - Error rate
   * @returns {number} Health score (0-1)
   */
  calculateHealthScore(stats, errorRate) {
    let score = 1.0;
    
    // Penalize for high error rate
    if (errorRate > 0.1) score -= 0.3;
    else if (errorRate > 0.05) score -= 0.1;
    
    // Penalize for long processing queues
    if (stats.processing_queue_length > 50) score -= 0.2;
    else if (stats.processing_queue_length > 20) score -= 0.1;
    
    // Penalize for high retry queue
    if (stats.retry_queue_length > 10) score -= 0.2;
    else if (stats.retry_queue_length > 5) score -= 0.1;
    
    // Penalize for slow processing
    if (stats.averageProcessingTime > 30000) score -= 0.2; // 30 seconds
    else if (stats.averageProcessingTime > 10000) score -= 0.1; // 10 seconds
    
    return Math.max(score, 0);
  }
}

module.exports = UpdateMonitorService;