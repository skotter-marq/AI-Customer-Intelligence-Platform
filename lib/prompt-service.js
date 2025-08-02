/**
 * Universal Prompt and Template Service
 * 
 * This service provides database-driven access to all prompts, templates, and messages
 * used throughout the application. It replaces hardcoded strings and templates.
 */

const { createClient } = require('@supabase/supabase-js');

// Ensure environment variables are loaded
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  require('dotenv').config({ path: '.env.local' });
}

class PromptService {
  constructor() {
    this.supabase = null;
    this.cache = new Map(); // In-memory cache for frequently used templates
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes cache expiry
    
    this.initializeSupabase();
  }

  initializeSupabase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    } else {
      console.warn('⚠️ PromptService: Supabase not configured, using fallback mode');
    }
  }

  /**
   * Get an AI prompt by ID
   * @param {string} promptId - The prompt ID
   * @returns {Promise<Object|null>} Prompt data or null
   */
  async getAIPrompt(promptId) {
    try {
      // Check cache first
      const cacheKey = `ai_prompt_${promptId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      if (!this.supabase) {
        console.warn(`⚠️ No database connection, returning null for AI prompt: ${promptId}`);
        return null;
      }

      const { data, error } = await this.supabase
        .from('ai_prompts')
        .select('*')
        .eq('id', promptId)
        .eq('enabled', true)
        .single();

      if (error) {
        console.error(`❌ Error fetching AI prompt ${promptId}:`, error.message);
        return null;
      }

      // Cache the result
      this.setCache(cacheKey, data);
      
      // Update usage tracking
      this.trackUsage('ai_prompts', promptId);

      return data;
    } catch (error) {
      console.error(`❌ PromptService: Error getting AI prompt ${promptId}:`, error.message);
      return null;
    }
  }

  /**
   * Get a Slack template by ID
   * @param {string} templateId - The template ID
   * @returns {Promise<Object|null>} Template data or null
   */
  async getSlackTemplate(templateId) {
    try {
      // Check cache first
      const cacheKey = `slack_template_${templateId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      if (!this.supabase) {
        console.warn(`⚠️ No database connection, using fallback for Slack template: ${templateId}`);
        return this.getFallbackSlackTemplate(templateId);
      }

      const { data, error } = await this.supabase
        .from('slack_templates')
        .select('*')
        .eq('id', templateId)
        .eq('enabled', true)
        .single();

      if (error) {
        console.warn(`⚠️ Database error for Slack template ${templateId}, using fallback:`, error.message);
        return this.getFallbackSlackTemplate(templateId);
      }

      // Cache the result
      this.setCache(cacheKey, data);
      
      // Update usage tracking
      this.trackUsage('slack_templates', templateId);

      return data;
    } catch (error) {
      console.error(`❌ PromptService: Error getting Slack template ${templateId}:`, error.message);
      return this.getFallbackSlackTemplate(templateId);
    }
  }

  /**
   * Get a system message by ID
   * @param {string} messageId - The message ID
   * @param {Object} variables - Variables to replace in the template
   * @returns {Promise<string>} Processed message
   */
  async getSystemMessage(messageId, variables = {}) {
    try {
      // Check cache first
      const cacheKey = `system_message_${messageId}`;
      const cached = this.getFromCache(cacheKey);
      let template = cached;

      if (!template && this.supabase) {
        const { data, error } = await this.supabase
          .from('system_messages')
          .select('*')
          .eq('id', messageId)
          .eq('enabled', true)
          .single();

        if (!error && data) {
          template = data;
          this.setCache(cacheKey, template);
          this.trackUsage('system_messages', messageId);
        }
      }

      if (!template) {
        console.warn(`⚠️ System message not found: ${messageId}, using fallback`);
        return this.getFallbackSystemMessage(messageId, variables);
      }

      // Process template variables
      return this.processTemplate(template.message_template, variables);
    } catch (error) {
      console.error(`❌ PromptService: Error getting system message ${messageId}:`, error.message);
      return this.getFallbackSystemMessage(messageId, variables);
    }
  }

  /**
   * Process template by replacing variables
   * @param {string} template - Template string with {variable} placeholders
   * @param {Object} variables - Variables to replace
   * @returns {string} Processed template
   */
  processTemplate(template, variables = {}) {
    if (!template || typeof template !== 'string') return '';

    let processed = template;
    
    // Replace all template variables with actual data
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      const cleanValue = value !== null && value !== undefined ? String(value).trim() : '';
      processed = processed.replace(regex, cleanValue);
    });
    
    // Clean up any remaining unreplaced variables (show as empty instead of {missing})
    processed = processed.replace(/\{[^}]+\}/g, '');
    
    // Remove excessive whitespace
    processed = processed.replace(/\n\s*\n\s*\n/g, '\n\n'); // max 2 consecutive newlines
    
    return processed.trim();
  }

  /**
   * Update all hardcoded usage to use database-driven templates
   * This method helps migration by providing consistent access
   */
  async getProcessedSlackTemplate(templateId, variables = {}) {
    const template = await this.getSlackTemplate(templateId);
    if (!template) return null;

    return {
      id: template.id,
      name: template.name,
      channel: template.channel,
      processed_message: this.processTemplate(template.message_template, variables),
      variables: template.variables || [],
      webhook_type: template.webhook_type
    };
  }

  /**
   * Cache management
   */
  getFromCache(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.cacheExpiry
    });
  }

  /**
   * Track usage statistics
   */
  async trackUsage(table, id) {
    if (!this.supabase) return;
    
    // Don't await this - fire and forget for performance  
    setImmediate(async () => {
      try {
        // Get current usage count and increment
        const { data } = await this.supabase
          .from(table)
          .select('usage_count')
          .eq('id', id)
          .single();
        
        const newCount = (data?.usage_count || 0) + 1;
        
        await this.supabase
          .from(table)
          .update({ 
            usage_count: newCount,
            last_used_at: new Date().toISOString()
          })
          .eq('id', id);
      } catch (error) {
        // Silent failure for usage tracking - don't break the main flow
        console.warn(`⚠️ Failed to track usage for ${table}:${id}:`, error.message);
      }
    });
  }

  /**
   * Fallback templates for when database is unavailable
   */
  getFallbackSlackTemplate(templateId) {
    const fallbacks = {
      'product-update-notification': {
        id: templateId,
        name: 'Product Update Published',
        message_template: `📋 **CHANGELOG UPDATE**

**{updateTitle}** is now live

{updateDescription}{whatsNewSection}

👉 *View Details*

{mediaResources}`,
        variables: ['updateTitle', 'updateDescription', 'whatsNewSection', 'mediaResources'],
        channel: '#int-product-updates',
        webhook_type: 'updates'
      },
      'approval-request': {
        id: templateId,
        name: 'Content Approval Request',
        message_template: `📋 **Changelog Entry Ready for Review**

**{jiraKey}** has been completed and needs changelog approval.

**Title:** {contentTitle}
**Category:** {category}
**Summary:** {contentSummary}

👉 **Review & Approve in Dashboard**`,
        variables: ['jiraKey', 'contentTitle', 'category', 'contentSummary'],
        channel: '#product-changelog-approvals',
        webhook_type: 'approvals'
      }
    };

    return fallbacks[templateId] || null;
  }

  getFallbackSystemMessage(messageId, variables = {}) {
    const fallbacks = {
      'api-success-general': 'Operation completed successfully',
      'api-error-general': 'An error occurred while processing your request',
      'api-error-database': 'Database connection not available',
      'approval-success': `Changelog entry approved successfully! ${variables.jiraKey ? `JIRA issue ${variables.jiraKey} updated.` : ''}`,
      'approval-error': 'Failed to approve entry. Please try again.',
      'content-generation-success': `Content generated successfully${variables.qualityScore ? ` with quality score of ${variables.qualityScore}%` : ''}`,
    };

    return fallbacks[messageId] || 'System message not available';
  }

  /**
   * Batch operations for admin interface
   */
  async getAllPrompts() {
    if (!this.supabase) return null;

    try {
      const [aiPrompts, slackTemplates, systemMessages] = await Promise.all([
        this.supabase.from('ai_prompts').select('*').order('category', { ascending: true }),
        this.supabase.from('slack_templates').select('*').order('category', { ascending: true }),
        this.supabase.from('system_messages').select('*').order('category', { ascending: true })
      ]);

      return {
        ai_prompts: aiPrompts.data || [],
        slack_templates: slackTemplates.data || [],
        system_messages: systemMessages.data || []
      };
    } catch (error) {
      console.error('❌ PromptService: Error getting all prompts:', error.message);
      return null;
    }
  }

  /**
   * Clear cache (useful for admin updates)
   */
  clearCache() {
    this.cache.clear();
    console.log('✅ PromptService cache cleared');
  }
}

// Singleton instance
const promptService = new PromptService();

module.exports = {
  PromptService,
  promptService
};