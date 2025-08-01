/**
 * Server-side MCP Client for JIRA Integration
 * 
 * This module provides server-side access to MCP functions for JIRA operations.
 * Since MCP tools are typically client-side, this creates a bridge that can be
 * used in API routes and server-side code.
 */

class ServerMCPClient {
  constructor() {
    this.cloudId = process.env.ATLASSIAN_CLOUD_ID || '6877df8d-8ca7-4a00-b3d4-6a10b3d2f3f0';
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  }

  /**
   * Get JIRA issue details using server-side approach
   * @param {string} issueKey - JIRA issue key (e.g., "PRESS-12345")
   * @returns {Promise<Object>} Issue details or error
   */
  async getJiraIssue(issueKey) {
    try {
      console.log(`🔍 Fetching JIRA issue ${issueKey} via server-side MCP...`);

      // For server-side, we need to use the available MCP functions
      // Since we can't directly call MCP functions server-side, we'll implement
      // the functionality using the tools available in the server environment

      // First, try to get issue details using the available MCP bridge approach
      const issueDetails = await this._getIssueViaAvailableMethods(issueKey);
      
      if (issueDetails) {
        console.log(`✅ Successfully retrieved ${issueKey} details`);
        return {
          success: true,
          issue: issueDetails
        };
      }

      console.warn(`⚠️ Could not retrieve ${issueKey} via available methods`);
      return {
        success: false,
        error: `Issue ${issueKey} not found or inaccessible`
      };

    } catch (error) {
      console.error(`❌ Server-side MCP error for ${issueKey}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update JIRA issue using server-side MCP approach
   * @param {string} issueKey - JIRA issue key
   * @param {Object} fields - Fields to update
   * @returns {Promise<Object>} Update result
   */
  async updateJiraIssue(issueKey, fields) {
    try {
      console.log(`🔄 Updating JIRA issue ${issueKey} via server-side MCP...`);
      console.log(`🔧 Fields to update:`, JSON.stringify(fields, null, 2));

      // For server-side JIRA updates, we'll use the available MCP functions
      // This is a placeholder for the actual implementation
      const updateResult = await this._updateIssueViaAvailableMethods(issueKey, fields);
      
      if (updateResult.success) {
        console.log(`✅ Successfully updated ${issueKey}`);
        return {
          success: true,
          issueKey,
          updatedFields: Object.keys(fields)
        };
      }

      console.warn(`⚠️ Failed to update ${issueKey}:`, updateResult.error);
      return updateResult;

    } catch (error) {
      console.error(`❌ Server-side MCP update error for ${issueKey}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update JIRA issue TL;DR field specifically
   * @param {string} issueKey - JIRA issue key
   * @param {string} tldr - TL;DR content
   * @returns {Promise<Object>} Update result
   */
  async updateTLDR(issueKey, tldr) {
    try {
      console.log(`📝 Updating TL;DR for ${issueKey}: "${tldr}"`);
      
      const tldrFieldId = process.env.JIRA_TLDR_FIELD_ID || 'customfield_10087';
      const fields = {
        [tldrFieldId]: tldr
      };

      return await this.updateJiraIssue(issueKey, fields);

    } catch (error) {
      console.error(`❌ TL;DR update error for ${issueKey}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get issue via available server-side methods
   * @private
   */
  async _getIssueViaAvailableMethods(issueKey) {
    // Method 1: Try using cached data
    const cachedIssue = await this._getCachedIssue(issueKey);
    if (cachedIssue) {
      return cachedIssue;
    }

    // Method 2: Try using OAuth if available
    const oauthIssue = await this._getIssueViaOAuth(issueKey);
    if (oauthIssue) {
      return oauthIssue;
    }

    // Method 3: Return placeholder that indicates MCP is needed
    console.log(`⚠️ ${issueKey} not available via server methods, MCP client-side fetch needed`);
    return null;
  }

  /**
   * Update issue via available server-side methods
   * @private
   */
  async _updateIssueViaAvailableMethods(issueKey, fields) {
    // Method 1: Try OAuth-based update
    const oauthResult = await this._updateIssueViaOAuth(issueKey, fields);
    if (oauthResult.success) {
      return oauthResult;
    }

    // Method 2: For now, return success but indicate it needs client-side MCP
    console.log(`⚠️ Server-side update not available for ${issueKey}, would need client-side MCP`);
    return {
      success: false,
      error: 'Server-side JIRA update not available, requires client-side MCP or OAuth',
      requiresClientSideMCP: true
    };
  }

  /**
   * Get cached issue data
   * @private
   */
  async _getCachedIssue(issueKey) {
    try {
      const fs = require('fs');
      const path = require('path');
      const cacheFile = path.join(process.cwd(), 'jira-story-cache.json');
      
      if (fs.existsSync(cacheFile)) {
        const cachedData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        if (cachedData[issueKey]) {
          console.log(`📦 Found cached data for ${issueKey}`);
          return cachedData[issueKey];
        }
      }
    } catch (error) {
      console.warn(`⚠️ Cache read error for ${issueKey}:`, error.message);
    }
    return null;
  }

  /**
   * Get issue via OAuth (if available)
   * @private
   */
  async _getIssueViaOAuth(issueKey) {
    try {
      // Try to use the OAuth integration from the regenerate-changelog approach
      const { createClient } = require('@supabase/supabase-js');
      const AtlassianOAuth = require('./atlassian-oauth.js');
      
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      if (!supabase) {
        return null;
      }

      // Get OAuth tokens
      const { data: tokenData } = await supabase
        .from('atlassian_oauth_tokens')
        .select('*')
        .eq('user_id', 'system')
        .single();

      if (!tokenData) {
        console.log(`⚠️ No OAuth tokens available for ${issueKey}`);
        return null;
      }

      // Check if token is expired
      const now = new Date();
      const expiresAt = new Date(tokenData.expires_at);
      if (now >= expiresAt) {
        console.log(`⚠️ OAuth token expired for ${issueKey}`);
        return null;
      }

      const oauth = new AtlassianOAuth();
      const issueResult = await oauth.getJiraIssue(tokenData.access_token, this.cloudId, issueKey);
      
      if (issueResult.success) {
        const issue = issueResult.issue;
        return {
          key: issue.key,
          id: issue.id,
          summary: issue.fields.summary,
          description: issue.fields.description || '',
          status: issue.fields.status.name,
          priority: issue.fields.priority ? issue.fields.priority.name : 'Medium',
          components: issue.fields.components?.map((c) => c.name) || [],
          labels: issue.fields.labels || [],
          assignee: issue.fields.assignee ? issue.fields.assignee.displayName : null,
          fields: issue.fields // Keep full fields for updates
        };
      }

    } catch (error) {
      console.warn(`⚠️ OAuth fetch error for ${issueKey}:`, error.message);
    }
    return null;
  }

  /**
   * Update issue via OAuth (if available)
   * @private
   */
  async _updateIssueViaOAuth(issueKey, fields) {
    try {
      const { createClient } = require('@supabase/supabase-js');
      const AtlassianOAuth = require('./atlassian-oauth.js');
      
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      if (!supabase) {
        return { success: false, error: 'No database connection' };
      }

      // Get OAuth tokens
      const { data: tokenData } = await supabase
        .from('atlassian_oauth_tokens')
        .select('*')
        .eq('user_id', 'system')
        .single();

      if (!tokenData) {
        return { success: false, error: 'No OAuth tokens available' };
      }

      // Check if token is expired
      const now = new Date();
      const expiresAt = new Date(tokenData.expires_at);
      if (now >= expiresAt) {
        return { success: false, error: 'OAuth token expired' };
      }

      const oauth = new AtlassianOAuth();
      const updateResult = await oauth.updateJiraIssue(tokenData.access_token, this.cloudId, issueKey, fields);
      
      return updateResult;

    } catch (error) {
      console.warn(`⚠️ OAuth update error for ${issueKey}:`, error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = ServerMCPClient;