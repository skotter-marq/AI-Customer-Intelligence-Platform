/**
 * Client-side MCP Bridge for Real-time JIRA Updates
 * 
 * This module provides client-side access to MCP functions for JIRA operations.
 * Works in the browser context where MCP tools are available.
 */

export class ClientMCPBridge {
  constructor() {
    this.cloudId = '6877df8d-8ca7-4a00-b3d4-6a10b3d2f3f0';
    
    // Check if MCP tools are available in client context
    // MCP tools may be available globally rather than on window
    this.mcpAvailable = typeof window !== 'undefined' && (
      typeof globalThis.mcp__atlassian__editJiraIssue === 'function' ||
      typeof window.mcp__atlassian__editJiraIssue === 'function'
    );
    
    // Store references to MCP tools
    this.mcpTools = {
      editJiraIssue: globalThis.mcp__atlassian__editJiraIssue || window?.mcp__atlassian__editJiraIssue,
      getJiraIssue: globalThis.mcp__atlassian__getJiraIssue || window?.mcp__atlassian__getJiraIssue
    };
    
    if (!this.mcpAvailable) {
      console.warn('⚠️ MCP tools not available in client context');
      console.log('Debug info:', {
        hasWindow: typeof window !== 'undefined',
        hasGlobalThis: typeof globalThis !== 'undefined',
        hasWindowEdit: typeof window?.mcp__atlassian__editJiraIssue,
        hasGlobalEdit: typeof globalThis.mcp__atlassian__editJiraIssue
      });
    } else {
      console.log('✅ Client-side MCP bridge initialized');
    }
  }

  /**
   * Check if MCP tools are available
   * @returns {boolean} True if MCP tools are available
   */
  isAvailable() {
    return this.mcpAvailable;
  }

  /**
   * Update JIRA issue using client-side MCP tools
   * @param {Object} updateData - Update data from server
   * @param {string} updateData.issueKey - JIRA issue key
   * @param {Object} updateData.fields - Fields to update
   * @param {string} updateData.action - Action type
   * @returns {Promise<Object>} Update result
   */
  async updateJiraIssue(updateData) {
    try {
      console.log(`🔄 Client MCP: Updating JIRA issue ${updateData.issueKey}...`);
      console.log(`🔧 Fields to update:`, JSON.stringify(updateData.fields, null, 2));

      if (!this.mcpAvailable) {
        return {
          success: false,
          error: 'MCP tools not available in client context',
          requiresManualUpdate: true
        };
      }

      // Use client-side MCP tools
      const result = await this.mcpTools.editJiraIssue({
        cloudId: this.cloudId,
        issueIdOrKey: updateData.issueKey,
        fields: updateData.fields
      });

      if (result && !result.error) {
        console.log(`✅ Client MCP: Successfully updated ${updateData.issueKey}`);
        return {
          success: true,
          issueKey: updateData.issueKey,
          updatedFields: Object.keys(updateData.fields),
          action: updateData.action
        };
      } else {
        console.warn(`⚠️ Client MCP: Update failed for ${updateData.issueKey}:`, result.error || result);
        return {
          success: false,
          error: result.error || 'Unknown MCP error',
          issueKey: updateData.issueKey
        };
      }

    } catch (error) {
      console.error(`❌ Client MCP: Error updating ${updateData.issueKey}:`, error.message);
      return {
        success: false,
        error: error.message,
        issueKey: updateData.issueKey
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
    const updateData = {
      issueKey,
      fields: {
        'customfield_10087': tldr
      },
      action: 'updateTLDR',
      tldr
    };

    return await this.updateJiraIssue(updateData);
  }

  /**
   * Get JIRA issue details using client-side MCP tools
   * @param {string} issueKey - JIRA issue key
   * @returns {Promise<Object>} Issue details
   */
  async getJiraIssue(issueKey) {
    try {
      console.log(`🔍 Client MCP: Fetching JIRA issue ${issueKey}...`);

      if (!this.mcpAvailable) {
        return {
          success: false,
          error: 'MCP tools not available in client context'
        };
      }

      const result = await this.mcpTools.getJiraIssue({
        cloudId: this.cloudId,
        issueIdOrKey: issueKey
      });

      if (result && !result.error) {
        console.log(`✅ Client MCP: Successfully retrieved ${issueKey}`);
        return {
          success: true,
          issue: result
        };
      } else {
        console.warn(`⚠️ Client MCP: Fetch failed for ${issueKey}:`, result.error || result);
        return {
          success: false,
          error: result.error || 'Unknown MCP error'
        };
      }

    } catch (error) {
      console.error(`❌ Client MCP: Error fetching ${issueKey}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Handle JIRA update from server response
   * @param {Object} serverResponse - Server response containing jiraUpdateRequired
   * @returns {Promise<Object>} Combined result
   */
  async handleServerJiraUpdate(serverResponse) {
    if (!serverResponse.jiraUpdateRequired) {
      return {
        success: true,
        message: 'No JIRA update required'
      };
    }

    console.log('🌉 Client MCP Bridge: Processing JIRA update from server response...');
    
    const jiraResult = await this.updateJiraIssue(serverResponse.jiraUpdateRequired);
    
    return {
      success: serverResponse.success && jiraResult.success,
      serverResult: {
        success: serverResponse.success,
        message: serverResponse.message,
        entry: serverResponse.entry
      },
      jiraResult: jiraResult,
      combinedMessage: jiraResult.success 
        ? `${serverResponse.message} + JIRA updated successfully`
        : `${serverResponse.message} (JIRA update failed: ${jiraResult.error})`
    };
  }
}

// Create singleton instance for easy import
export const clientMCPBridge = new ClientMCPBridge();