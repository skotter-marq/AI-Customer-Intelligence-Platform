/**
 * Server-side MCP Client for JIRA Integration
 * 
 * This module provides server-side JIRA integration that prioritizes MCP tools.
 * Since MCP tools are not available in server-side Next.js context, it falls back 
 * to cached data and indicates when client-side MCP is required.
 * 
 * NO OAUTH DEPENDENCIES - Pure MCP approach with cached fallback.
 */

class ServerMCPClient {
  constructor() {
    this.cloudId = process.env.ATLASSIAN_CLOUD_ID || '6877df8d-8ca7-4a00-b3d4-6a10b3d2f3f0';
    
    // Check for MCP tools in server environment
    // Note: In server context, MCP tools may not be available as global functions
    // This would need to be implemented based on your MCP integration architecture
    this.mcpTools = null; // Will be null in server-side Next.js environment
    
    console.log('📋 Server-side MCP client initialized (MCP tools not available in server context)');
  }

  /**
   * Get JIRA issue details using MCP tools
   * @param {string} issueKey - JIRA issue key (e.g., "PRESS-12345")
   * @returns {Promise<Object>} Issue details or error
   */
  async getJiraIssue(issueKey) {
    try {
      console.log(`🔍 Fetching JIRA issue ${issueKey} via MCP...`);

      // Try to use MCP tools directly if available
      if (this.mcpTools && this.mcpTools.getJiraIssue) {
        const result = await this.mcpTools.getJiraIssue({
          cloudId: this.cloudId,
          issueIdOrKey: issueKey
        });
        
        if (result) {
          console.log(`✅ Successfully retrieved ${issueKey} via MCP`);
          return {
            success: true,
            issue: result
          };
        }
      }

      // Fall back to cached data if MCP not available
      const cachedIssue = await this._getCachedIssue(issueKey);
      if (cachedIssue) {
        console.log(`✅ Successfully retrieved ${issueKey} from cache`);
        return {
          success: true,
          issue: cachedIssue
        };
      }

      console.warn(`⚠️ Could not retrieve ${issueKey}: MCP tools not available and no cached data`);
      return {
        success: false,
        error: `Issue ${issueKey} not found. MCP tools required for JIRA access.`,
        requiresClientSideMCP: true
      };

    } catch (error) {
      console.error(`❌ MCP error for ${issueKey}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update JIRA issue using MCP tools
   * @param {string} issueKey - JIRA issue key
   * @param {Object} fields - Fields to update
   * @returns {Promise<Object>} Update result
   */
  async updateJiraIssue(issueKey, fields) {
    try {
      console.log(`🔄 Updating JIRA issue ${issueKey} via MCP...`);
      console.log(`🔧 Fields to update:`, JSON.stringify(fields, null, 2));

      // Try to use MCP tools directly if available
      if (this.mcpTools && this.mcpTools.editJiraIssue) {
        const result = await this.mcpTools.editJiraIssue({
          cloudId: this.cloudId,
          issueIdOrKey: issueKey,
          fields: fields
        });
        
        if (result && result.success !== false) {
          console.log(`✅ Successfully updated ${issueKey} via MCP`);
          return {
            success: true,
            issueKey,
            updatedFields: Object.keys(fields)
          };
        }
      }

      // No fallback available - MCP required for updates
      console.warn(`⚠️ Failed to update ${issueKey}: MCP tools not available`);
      return {
        success: false,
        error: 'Server-side JIRA update not available, requires MCP tools',
        requiresClientSideMCP: true
      };

    } catch (error) {
      console.error(`❌ MCP update error for ${issueKey}:`, error.message);
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

}

module.exports = ServerMCPClient;