// lib/jira-integration.js
/**
 * JIRA Integration for Product Updates
 * Monitors JIRA stories for customer-impacting changes
 */

const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

class JiraIntegration {
  constructor() {
    this.baseUrl = process.env.JIRA_BASE_URL;
    this.apiToken = process.env.JIRA_API_TOKEN;
    this.projectKey = process.env.JIRA_PROJECT_KEY || 'PRESS';
    
    if (!this.baseUrl || !this.apiToken) {
      console.warn('JIRA integration not configured. Set JIRA_BASE_URL and JIRA_API_TOKEN in environment variables.');
    }
    
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Configure axios for JIRA API
    this.jiraApi = axios.create({
      baseURL: `${this.baseUrl}/rest/api/3`,
      auth: {
        username: process.env.JIRA_USERNAME || 'api-user',
        password: this.apiToken
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  /**
   * Test JIRA connection
   * @returns {Object} Connection test result
   */
  async testConnection() {
    try {
      if (!this.baseUrl || !this.apiToken) {
        return {
          success: false,
          error: 'JIRA credentials not configured'
        };
      }
      
      const response = await this.jiraApi.get('/myself');
      
      return {
        success: true,
        user: response.data.displayName,
        accountId: response.data.accountId,
        baseUrl: this.baseUrl
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: error.response?.data || 'Connection failed'
      };
    }
  }

  /**
   * Get project information
   * @returns {Object} Project details
   */
  async getProject() {
    try {
      const response = await this.jiraApi.get(`/project/${this.projectKey}`);
      
      return {
        success: true,
        project: {
          key: response.data.key,
          name: response.data.name,
          id: response.data.id,
          description: response.data.description
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: error.response?.data || 'Failed to fetch project'
      };
    }
  }

  /**
   * Monitor JIRA stories for customer-impacting changes
   * @param {Object} options - Monitoring options
   * @returns {Array} Stories that have changed
   */
  async monitorStories(options = {}) {
    try {
      const { 
        maxResults = 50, 
        customerImpactTag = 'customer-impact',
        statusFilter = 'Done'
      } = options;
      
      // JQL to find completed stories with customer impact
      const jql = `project = "${this.projectKey}" AND status = "${statusFilter}" AND labels = "${customerImpactTag}" ORDER BY updated DESC`;
      
      const response = await this.jiraApi.get('/search', {
        params: {
          jql,
          maxResults,
          fields: 'summary,description,status,labels,updated,created,assignee,priority,customfield_10016', // customfield_10016 is often story points
          expand: 'changelog'
        }
      });
      
      const stories = response.data.issues.map(issue => ({
        key: issue.key,
        id: issue.id,
        summary: issue.fields.summary,
        description: issue.fields.description,
        status: issue.fields.status.name,
        labels: issue.fields.labels,
        updated: issue.fields.updated,
        created: issue.fields.created,
        assignee: issue.fields.assignee ? {
          displayName: issue.fields.assignee.displayName,
          emailAddress: issue.fields.assignee.emailAddress
        } : null,
        priority: issue.fields.priority ? issue.fields.priority.name : null,
        storyPoints: issue.fields.customfield_10016,
        changelog: issue.changelog
      }));
      
      return {
        success: true,
        stories,
        total: response.data.total,
        maxResults: response.data.maxResults
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: error.response?.data || 'Failed to monitor stories'
      };
    }
  }

  /**
   * Get recent story completions
   * @param {number} days - Number of days to look back
   * @returns {Array} Recently completed stories
   */
  async getRecentCompletions(days = 7) {
    try {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);
      const dateString = dateFrom.toISOString().split('T')[0];
      
      const jql = `project = "${this.projectKey}" AND status changed TO "Done" AFTER "${dateString}" AND labels = "customer-impact" ORDER BY updated DESC`;
      
      const response = await this.jiraApi.get('/search', {
        params: {
          jql,
          maxResults: 100,
          fields: 'summary,description,status,labels,updated,created,assignee,priority,resolution',
          expand: 'changelog'
        }
      });
      
      const completions = response.data.issues.map(issue => ({
        key: issue.key,
        id: issue.id,
        summary: issue.fields.summary,
        description: issue.fields.description,
        status: issue.fields.status.name,
        labels: issue.fields.labels,
        updated: issue.fields.updated,
        created: issue.fields.created,
        assignee: issue.fields.assignee ? {
          displayName: issue.fields.assignee.displayName,
          emailAddress: issue.fields.assignee.emailAddress
        } : null,
        priority: issue.fields.priority ? issue.fields.priority.name : null,
        resolution: issue.fields.resolution ? issue.fields.resolution.name : null,
        completionDate: this.getCompletionDate(issue.changelog)
      }));
      
      return {
        success: true,
        completions,
        total: response.data.total,
        period: `${days} days`
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: error.response?.data || 'Failed to get recent completions'
      };
    }
  }

  /**
   * Extract completion date from changelog
   * @param {Object} changelog - JIRA changelog
   * @returns {string} Completion date
   */
  getCompletionDate(changelog) {
    if (!changelog || !changelog.histories) return null;
    
    // Find the last status change to "Done"
    for (const history of changelog.histories.reverse()) {
      for (const item of history.items) {
        if (item.field === 'status' && item.toString === 'Done') {
          return history.created;
        }
      }
    }
    
    return null;
  }

  /**
   * Create or update product update record
   * @param {Object} story - JIRA story data
   * @returns {Object} Database record
   */
  async createProductUpdate(story) {
    try {
      const updateData = {
        jira_story_key: story.key,
        jira_story_id: story.id,
        title: story.summary,
        description: story.description,
        status: 'pending_review',
        priority: this.mapPriority(story.priority),
        assignee: story.assignee ? story.assignee.displayName : null,
        completion_date: story.completionDate || story.updated,
        labels: story.labels || [],
        story_points: story.storyPoints,
        jira_metadata: {
          project_key: this.projectKey,
          original_status: story.status,
          resolution: story.resolution,
          updated: story.updated,
          created: story.created
        }
      };
      
      const { data: productUpdate, error } = await this.supabase
        .from('product_updates')
        .upsert(updateData, { onConflict: 'jira_story_key' })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to create product update: ${error.message}`);
      }
      
      return {
        success: true,
        productUpdate
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Map JIRA priority to our priority system
   * @param {string} jiraPriority - JIRA priority
   * @returns {string} Our priority
   */
  mapPriority(jiraPriority) {
    const priorityMap = {
      'Highest': 'high',
      'High': 'high',
      'Medium': 'medium',
      'Low': 'low',
      'Lowest': 'low'
    };
    
    return priorityMap[jiraPriority] || 'medium';
  }

  /**
   * Sync recent completions to database
   * @param {number} days - Days to look back
   * @returns {Object} Sync results
   */
  async syncRecentCompletions(days = 7) {
    try {
      console.log(`🔄 Syncing JIRA completions from last ${days} days...`);
      
      const completionsResult = await this.getRecentCompletions(days);
      
      if (!completionsResult.success) {
        throw new Error(`Failed to get completions: ${completionsResult.error}`);
      }
      
      const syncedUpdates = [];
      const errors = [];
      
      for (const story of completionsResult.completions) {
        const updateResult = await this.createProductUpdate(story);
        
        if (updateResult.success) {
          syncedUpdates.push(updateResult.productUpdate);
          console.log(`✅ Synced: ${story.key} - ${story.summary}`);
        } else {
          errors.push({
            story: story.key,
            error: updateResult.error
          });
          console.error(`❌ Failed to sync: ${story.key} - ${updateResult.error}`);
        }
      }
      
      return {
        success: true,
        syncedCount: syncedUpdates.length,
        errorCount: errors.length,
        syncedUpdates,
        errors,
        period: `${days} days`
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update JIRA issue field (e.g., TLDR field)
   * @param {string} issueKey - JIRA issue key (e.g., "PRESS-123")
   * @param {Object} fields - Fields to update
   * @returns {Object} Update result
   */
  async updateIssue(issueKey, fields) {
    try {
      if (!this.baseUrl || !this.apiToken) {
        return {
          success: false,
          error: 'JIRA credentials not configured'
        };
      }

      console.log(`🔄 Updating JIRA issue ${issueKey}...`);
      
      const response = await this.jiraApi.put(`/issue/${issueKey}`, {
        fields: fields
      });
      
      console.log(`✅ Updated JIRA issue ${issueKey}`);
      
      return {
        success: true,
        issueKey: issueKey,
        updatedFields: Object.keys(fields)
      };
      
    } catch (error) {
      console.error(`❌ Failed to update JIRA issue ${issueKey}:`, error.message);
      return {
        success: false,
        error: error.message,
        details: error.response?.data || 'Update failed'
      };
    }
  }

  /**
   * Update JIRA issue TLDR field when changelog is approved
   * @param {string} issueKey - JIRA issue key
   * @param {string} tldr - TLDR summary to set
   * @returns {Object} Update result
   */
  async updateTLDR(issueKey, tldr) {
    try {
      // First get the issue to find the correct TLDR field ID
      const issueResponse = await this.jiraApi.get(`/issue/${issueKey}`, {
        params: {
          fields: 'summary,description'
        }
      });

      // Most common TLDR custom field names/IDs
      // You may need to adjust this based on your JIRA setup
      const tldrFields = {
        // Try different possible TLDR field IDs
        summary: tldr, // Update summary as fallback
        // Uncomment and modify based on your JIRA setup:
        // customfield_10100: tldr, // Example custom field ID for TLDR
        // customfield_10200: tldr, // Another possible ID
      };

      // Try to update with TLDR in description if no custom field
      if (issueResponse.data.fields.description) {
        const currentDescription = issueResponse.data.fields.description;
        
        // Add TLDR section to description if not present
        let newDescription = currentDescription;
        const tldrSection = `\n\n*TLDR (Auto-generated):* ${tldr}`;
        
        // Check if TLDR already exists in description
        if (currentDescription.includes('*TLDR (Auto-generated):*')) {
          // Replace existing TLDR
          newDescription = currentDescription.replace(
            /\*TLDR \(Auto-generated\):\*[^\n]*/g,
            `*TLDR (Auto-generated):* ${tldr}`
          );
        } else {
          // Add new TLDR section
          newDescription = currentDescription + tldrSection;
        }
        
        tldrFields.description = newDescription;
      }

      return await this.updateIssue(issueKey, tldrFields);
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: error.response?.data || 'TLDR update failed'
      };
    }
  }

  /**
   * Get sync analytics
   * @returns {Object} Analytics data
   */
  async getSyncAnalytics() {
    try {
      const { data: totalUpdates } = await this.supabase
        .from('product_updates')
        .select('*');
      
      const { data: pendingUpdates } = await this.supabase
        .from('product_updates')
        .select('*')
        .eq('status', 'pending_review');
      
      const { data: publishedUpdates } = await this.supabase
        .from('product_updates')
        .select('*')
        .eq('status', 'published');
      
      const { data: recentUpdates } = await this.supabase
        .from('product_updates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      return {
        success: true,
        analytics: {
          totalUpdates: totalUpdates?.length || 0,
          pendingUpdates: pendingUpdates?.length || 0,
          publishedUpdates: publishedUpdates?.length || 0,
          recentUpdates: recentUpdates || []
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = JiraIntegration;