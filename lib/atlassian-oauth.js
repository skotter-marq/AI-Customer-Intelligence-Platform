// lib/atlassian-oauth.js
/**
 * Atlassian OAuth 2.0 (3LO) Integration
 * Handles OAuth flow for secure API access
 */

const axios = require('axios');
const crypto = require('crypto');

class AtlassianOAuth {
  constructor() {
    this.clientId = process.env.ATLASSIAN_CLIENT_ID;
    this.clientSecret = process.env.ATLASSIAN_CLIENT_SECRET;
    this.redirectUri = process.env.ATLASSIAN_REDIRECT_URI || 'http://localhost:3000/api/auth/atlassian/callback';
    this.baseAuthUrl = 'https://auth.atlassian.com';
    this.baseApiUrl = 'https://api.atlassian.com';
    
    if (!this.clientId || !this.clientSecret) {
      console.warn('Atlassian OAuth not configured. Set ATLASSIAN_CLIENT_ID and ATLASSIAN_CLIENT_SECRET in environment variables.');
    }
  }

  /**
   * Generate authorization URL for OAuth flow
   * @param {string} state - CSRF protection state
   * @returns {string} Authorization URL
   */
  getAuthorizationUrl(state = null) {
    if (!state) {
      state = crypto.randomBytes(32).toString('hex');
    }

    const params = new URLSearchParams({
      audience: 'api.atlassian.com',
      client_id: this.clientId,
      scope: 'read:jira-work write:jira-work read:jira-user offline_access',
      redirect_uri: this.redirectUri,
      state: state,
      response_type: 'code',
      prompt: 'consent'
    });

    return {
      url: `${this.baseAuthUrl}/authorize?${params.toString()}`,
      state: state
    };
  }

  /**
   * Exchange authorization code for access token
   * @param {string} code - Authorization code from callback
   * @returns {Object} Token response
   */
  async exchangeCodeForToken(code) {
    try {
      const response = await axios.post(`${this.baseAuthUrl}/oauth/token`, {
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: code,
        redirect_uri: this.redirectUri
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        tokens: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Object} New token response
   */
  async refreshAccessToken(refreshToken) {
    try {
      const response = await axios.post(`${this.baseAuthUrl}/oauth/token`, {
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        tokens: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get accessible Atlassian resources (sites)
   * @param {string} accessToken - Access token
   * @returns {Array} Available resources/sites
   */
  async getAccessibleResources(accessToken) {
    try {
      const response = await axios.get(`${this.baseApiUrl}/oauth/token/accessible-resources`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      return {
        success: true,
        resources: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Fetch JIRA issue using OAuth token
   * @param {string} accessToken - Access token
   * @param {string} cloudId - Atlassian cloud ID
   * @param {string} issueKey - JIRA issue key
   * @returns {Object} Issue data
   */
  async getJiraIssue(accessToken, cloudId, issueKey) {
    try {
      const response = await axios.get(
        `${this.baseApiUrl}/ex/jira/${cloudId}/rest/api/3/issue/${issueKey}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          },
          params: {
            fields: 'summary,description,status,priority,components,labels,assignee'
          }
        }
      );

      return {
        success: true,
        issue: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Search JIRA issues using JQL
   * @param {string} accessToken - Access token
   * @param {string} cloudId - Atlassian cloud ID
   * @param {string} jql - JQL query
   * @param {number} maxResults - Maximum results to return
   * @returns {Object} Search results
   */
  async searchJiraIssues(accessToken, cloudId, jql, maxResults = 50) {
    try {
      const response = await axios.get(
        `${this.baseApiUrl}/ex/jira/${cloudId}/rest/api/3/search`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          },
          params: {
            jql: jql,
            maxResults: maxResults,
            fields: 'summary,description,status,priority,components,labels,assignee'
          }
        }
      );

      return {
        success: true,
        results: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }
}

module.exports = AtlassianOAuth;