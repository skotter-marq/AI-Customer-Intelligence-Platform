// lib/ai-provider.js
/**
 * AI Provider Integration
 * Supports both OpenAI and Claude APIs for customer insight analysis
 */

const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config({ path: '.env.local' });

class AIProvider {
  constructor() {
    // Initialize OpenAI if API key is provided
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    }) : null;

    // Initialize Claude if API key is provided
    this.anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    }) : null;

    // Determine which provider to use
    this.provider = this.getPreferredProvider();
  }

  getPreferredProvider() {
    if (process.env.AI_PROVIDER === 'claude' && this.anthropic) {
      return 'claude';
    } else if (process.env.AI_PROVIDER === 'openai' && this.openai) {
      return 'openai';
    } else if (this.openai) {
      return 'openai';
    } else if (this.anthropic) {
      return 'claude';
    } else {
      throw new Error('No AI provider configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY in your environment variables.');
    }
  }

  async testConnection() {
    try {
      console.log(`Testing ${this.provider} connection...`);
      
      if (this.provider === 'openai') {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'Hello! This is a connection test.' }],
          max_tokens: 10
        });
        return {
          success: true,
          provider: 'openai',
          model: 'gpt-4',
          response: response.choices[0].message.content
        };
      } else if (this.provider === 'claude') {
        const response = await this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hello! This is a connection test.' }]
        });
        return {
          success: true,
          provider: 'claude',
          model: 'claude-3-5-sonnet-20241022',
          response: response.content[0].text
        };
      }
    } catch (error) {
      return {
        success: false,
        provider: this.provider,
        error: error.message
      };
    }
  }

  async analyzeTranscript(transcript, meetingContext = {}) {
    const prompt = this.buildTranscriptAnalysisPrompt(transcript, meetingContext);
    
    try {
      if (this.provider === 'openai') {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2000,
          temperature: 0.3
        });
        return this.parseInsights(response.choices[0].message.content);
      } else if (this.provider === 'claude') {
        const response = await this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }]
        });
        return this.parseInsights(response.content[0].text);
      }
    } catch (error) {
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  /**
   * Generic content analysis method for custom prompts
   * @param {string} prompt - Custom analysis prompt
   * @param {Object} options - Analysis options (temperature, maxTokens)
   * @returns {Promise<string>} - Raw AI response text
   */
  async analyzeContent(prompt, options = {}) {
    const { temperature = 0.3, maxTokens = 2000 } = options;
    
    try {
      if (this.provider === 'openai') {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: maxTokens,
          temperature: temperature
        });
        return response.choices[0].message.content;
      } else if (this.provider === 'claude') {
        const response = await this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: maxTokens,
          temperature: temperature,
          messages: [{ role: 'user', content: prompt }]
        });
        return response.content[0].text;
      }
    } catch (error) {
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  buildTranscriptAnalysisPrompt(transcript, context) {
    return `
You are an expert customer intelligence analyst. Analyze the following meeting transcript and extract key insights.

MEETING CONTEXT:
- Company: ${context.company || 'Unknown'}
- Meeting Type: ${context.meetingType || 'Unknown'}
- Date: ${context.date || 'Unknown'}
- Participants: ${context.participants || 'Unknown'}

TRANSCRIPT:
${transcript}

ANALYSIS INSTRUCTIONS:
Please analyze this transcript and provide insights in the following JSON format:

{
  "insights": [
    {
      "type": "pain_point|feature_request|sentiment|opportunity|risk",
      "title": "Brief descriptive title",
      "description": "Detailed description of the insight",
      "sentiment_score": -1.0 to 1.0,
      "confidence_score": 0.0 to 1.0,
      "priority": "high|medium|low",
      "tags": ["tag1", "tag2", "tag3"],
      "quotes": ["relevant quote from transcript"]
    }
  ],
  "overall_sentiment": -1.0 to 1.0,
  "key_topics": ["topic1", "topic2", "topic3"],
  "recommended_actions": [
    {
      "action": "Brief action description",
      "priority": "high|medium|low",
      "urgency": "immediate|this_week|this_month"
    }
  ],
  "summary": "Brief 2-3 sentence summary of the meeting"
}

FOCUS ON:
- Customer pain points and frustrations
- Feature requests and product feedback
- Competitive mentions
- Renewal/expansion opportunities
- Technical issues or blockers
- Positive feedback and satisfaction indicators

Return only the JSON response, no additional text.
`;
  }

  parseInsights(response) {
    try {
      // Clean the response to extract just the JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate the structure
      if (!parsed.insights || !Array.isArray(parsed.insights)) {
        throw new Error('Invalid insights structure in AI response');
      }
      
      return parsed;
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error(`Failed to parse AI insights: ${error.message}`);
    }
  }

  async analyzeHubSpotData(data, analysisType = 'contact') {
    const prompt = this.buildHubSpotAnalysisPrompt(data, analysisType);
    
    try {
      if (this.provider === 'openai') {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000,
          temperature: 0.3
        });
        return this.parseInsights(response.choices[0].message.content);
      } else if (this.provider === 'claude') {
        const response = await this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        });
        return this.parseInsights(response.content[0].text);
      }
    } catch (error) {
      throw new Error(`HubSpot analysis failed: ${error.message}`);
    }
  }

  buildHubSpotAnalysisPrompt(data, type) {
    return `
You are analyzing ${type} data from HubSpot. Extract insights from the following data:

DATA TYPE: ${type}
DATA: ${JSON.stringify(data, null, 2)}

Please provide insights in the same JSON format as transcript analysis, focusing on:
- Customer lifecycle stage changes
- Deal progression patterns
- Support ticket themes
- Engagement patterns
- Risk indicators

Return only the JSON response, no additional text.
`;
  }

  async generateFollowUpActions(insights, customerContext = {}) {
    const prompt = `
Based on the following customer insights, generate specific follow-up actions:

CUSTOMER CONTEXT:
${JSON.stringify(customerContext, null, 2)}

INSIGHTS:
${JSON.stringify(insights, null, 2)}

Generate follow-up actions in JSON format:
{
  "actions": [
    {
      "type": "email|call|meeting|task|escalation",
      "title": "Action title",
      "description": "Detailed description",
      "priority": "high|medium|low",
      "due_date": "YYYY-MM-DD",
      "assigned_to": "role or person",
      "related_insights": ["insight_id1", "insight_id2"]
    }
  ]
}

Focus on actionable, specific recommendations that address the insights.
Return only the JSON response.
`;

    try {
      if (this.provider === 'openai') {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000,
          temperature: 0.3
        });
        return JSON.parse(response.choices[0].message.content);
      } else if (this.provider === 'claude') {
        const response = await this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        });
        return JSON.parse(response.content[0].text);
      }
    } catch (error) {
      throw new Error(`Follow-up generation failed: ${error.message}`);
    }
  }

  async generateChangelogEntry(jiraIssue) {
    const prompt = this.buildChangelogPrompt(jiraIssue);
    
    try {
      if (this.provider === 'openai') {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000,
          temperature: 0.3
        });
        return this.parseChangelogResponse(response.choices[0].message.content);
      } else if (this.provider === 'claude') {
        const response = await this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        });
        return this.parseChangelogResponse(response.content[0].text);
      }
    } catch (error) {
      throw new Error(`Changelog generation failed: ${error.message}`);
    }
  }

  buildChangelogPrompt(jiraIssue) {
    return `
You are a technical writer creating customer-facing changelog entries from JIRA tickets. Transform the following technical JIRA issue into a customer-friendly changelog entry.

JIRA ISSUE:
- Key: ${jiraIssue.key}
- Summary: ${jiraIssue.fields.summary}
- Description: ${jiraIssue.fields.description || 'No description provided'}
- Priority: ${jiraIssue.fields.priority.name}
- Status: ${jiraIssue.fields.status.name}
- Components: ${jiraIssue.fields.components?.map(c => c.name).join(', ') || 'None'}
- Labels: ${jiraIssue.fields.labels?.join(', ') || 'None'}
- Reporter: ${jiraIssue.fields.reporter.displayName}
- Assignee: ${jiraIssue.fields.assignee?.displayName || 'Unassigned'}

GUIDELINES:
- Write from the customer's perspective using "you" and "your"
- Focus on benefits and value, not technical implementation details
- Use clear, jargon-free language
- Highlight what's improved for the user experience
- Be concise but informative

Generate a changelog entry in the following JSON format:

{
  "customer_title": "Customer-facing title (max 80 characters)",
  "customer_description": "2-3 sentences describing the improvement from customer perspective",
  "highlights": [
    "Key benefit or feature point 1",
    "Key benefit or feature point 2",
    "Key benefit or feature point 3"
  ],
  "category": "added|improved|fixed|security|deprecated",
  "breaking_changes": false,
  "migration_notes": "Only if breaking_changes is true, provide migration guidance",
  "estimated_impact": "low|medium|high",
  "user_segments": ["all_users|enterprise|free_tier|developers|admin"],
  "tldr": "One sentence summary of the change"
}

CATEGORY MAPPING:
- "added" - New features, capabilities, or integrations
- "improved" - Performance, usability, or experience enhancements  
- "fixed" - Bug fixes, error corrections, or stability improvements
- "security" - Security updates, authentication, or privacy improvements
- "deprecated" - Features being sunset or removed

Return only the JSON response, no additional text.
`;
  }

  parseChangelogResponse(response) {
    try {
      // Clean the response to extract just the JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      const requiredFields = ['customer_title', 'customer_description', 'highlights', 'category'];
      for (const field of requiredFields) {
        if (!parsed[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
      
      // Ensure highlights is an array
      if (!Array.isArray(parsed.highlights)) {
        parsed.highlights = [parsed.highlights];
      }
      
      // Set defaults for optional fields
      parsed.breaking_changes = parsed.breaking_changes || false;
      parsed.estimated_impact = parsed.estimated_impact || 'medium';
      parsed.user_segments = parsed.user_segments || ['all_users'];
      parsed.tldr = parsed.tldr || parsed.customer_title;
      
      return parsed;
    } catch (error) {
      console.error('Failed to parse changelog response:', error);
      throw new Error(`Failed to parse changelog content: ${error.message}`);
    }
  }

  async analyzeMeetingContent(meetingData) {
    const prompt = this.buildMeetingAnalysisPrompt(meetingData);
    
    try {
      if (this.provider === 'openai') {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2500,
          temperature: 0.2
        });
        return this.parseMeetingAnalysis(response.choices[0].message.content);
      } else if (this.provider === 'claude') {
        const response = await this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2500,
          messages: [{ role: 'user', content: prompt }]
        });
        return this.parseMeetingAnalysis(response.content[0].text);
      }
    } catch (error) {
      throw new Error(`Meeting analysis failed: ${error.message}`);
    }
  }

  buildMeetingAnalysisPrompt(meetingData) {
    return `
You are an expert product intelligence analyst specializing in customer meeting analysis. Analyze the following meeting data to extract actionable product and business insights.

MEETING DATA:
- Title: ${meetingData.title}
- Customer: ${meetingData.customer}
- Duration: ${meetingData.duration}
- Attendees: ${meetingData.attendees?.map(a => `${a.name} (${a.role})`).join(', ') || 'Not specified'}
- Transcript: ${meetingData.transcript || meetingData.summary || 'No transcript provided'}
- Meeting Type: ${meetingData.meetingType || 'General'}

ANALYSIS INSTRUCTIONS:
Extract comprehensive insights and structure them in the following JSON format:

{
  "overall_analysis": {
    "sentiment_score": -1.0 to 1.0,
    "sentiment_label": "positive|neutral|negative",
    "confidence_score": 0.0 to 1.0,
    "meeting_outcome": "successful|neutral|concerning|failed",
    "key_themes": ["theme1", "theme2", "theme3"],
    "summary": "2-3 sentence meeting summary"
  },
  "insights": [
    {
      "type": "feature_request|pain_point|competitive_mention|positive_feedback|risk_indicator|opportunity",
      "category": "product|technical|business|support|sales",
      "title": "Brief insight title",
      "description": "Detailed description of the insight",
      "quote": "Exact quote from transcript if available",
      "importance_score": 0.0 to 1.0,
      "confidence_score": 0.0 to 1.0,
      "priority": "low|medium|high|critical",
      "tags": ["tag1", "tag2"],
      "affected_feature": "specific feature name if applicable",
      "competitor_mentioned": "competitor name if applicable"
    }
  ],
  "action_items": [
    {
      "description": "Specific action to take",
      "assigned_to": "role or person if mentioned",
      "priority": "low|medium|high|critical",
      "category": "follow_up|technical|sales|support|product",
      "due_timeframe": "immediate|this_week|this_month|future"
    }
  ],
  "feature_requests": [
    {
      "title": "Feature request title",
      "description": "Detailed description of requested feature",
      "business_value": "Why customer needs this",
      "urgency": "low|medium|high|critical",
      "customer_pain_point": "Current problem this would solve",
      "estimated_impact": "Description of who would benefit"
    }
  ],
  "competitive_intelligence": [
    {
      "competitor": "Competitor name",
      "mention_type": "comparison|consideration|switching|lost_to|won_against",
      "context": "What was discussed about competitor",
      "sentiment": "positive|negative|neutral",
      "threat_level": "low|medium|high|critical",
      "quote": "Exact quote if available"
    }
  ],
  "customer_health": {
    "satisfaction_level": "very_satisfied|satisfied|neutral|dissatisfied|very_dissatisfied",
    "churn_risk": "low|medium|high",
    "expansion_opportunity": true|false,
    "engagement_level": "high|medium|low",
    "next_meeting_likelihood": "high|medium|low"
  },
  "topics_discussed": [
    {
      "topic": "Topic name",
      "category": "product|pricing|competition|support|integration",
      "relevance_score": 0.0 to 1.0,
      "sentiment": "positive|negative|neutral",
      "keywords": ["keyword1", "keyword2"]
    }
  ]
}

FOCUS AREAS:
- Product feedback and feature requests
- Technical issues and pain points
- Competitive mentions and threats
- Customer satisfaction and health indicators
- Business opportunities and risks
- Support issues and technical blockers
- Integration challenges and requirements

Return only the JSON response, no additional text.
`;
  }

  parseMeetingAnalysis(response) {
    try {
      // Clean the response to extract just the JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate overall structure
      if (!parsed.overall_analysis || !parsed.insights) {
        throw new Error('Invalid meeting analysis structure');
      }
      
      // Set defaults for optional fields
      parsed.action_items = parsed.action_items || [];
      parsed.feature_requests = parsed.feature_requests || [];
      parsed.competitive_intelligence = parsed.competitive_intelligence || [];
      parsed.customer_health = parsed.customer_health || {
        satisfaction_level: 'neutral',
        churn_risk: 'medium',
        expansion_opportunity: false,
        engagement_level: 'medium'
      };
      parsed.topics_discussed = parsed.topics_discussed || [];
      
      // Ensure arrays are properly formatted
      if (!Array.isArray(parsed.insights)) {
        parsed.insights = [parsed.insights];
      }
      
      return parsed;
    } catch (error) {
      console.error('Failed to parse meeting analysis:', error);
      throw new Error(`Failed to parse meeting analysis: ${error.message}`);
    }
  }

  /**
   * Generate enhanced changelog content with related stories context
   * @param {Object} mainStory - The primary JIRA story
   * @param {Array} relatedStories - Array of related JIRA story details
   * @returns {Object} Enhanced changelog content
   */
  async generateEnhancedChangelogWithRelatedStories(mainStory, relatedStories) {
    const prompt = this.buildEnhancedChangelogPrompt(mainStory, relatedStories);
    
    try {
      if (this.provider === 'openai') {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1200,
          temperature: 0.3
        });
        return this.parseChangelogResponse(response.choices[0].message.content);
      } else if (this.provider === 'claude') {
        const response = await this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1200,
          messages: [{ role: 'user', content: prompt }]
        });
        return this.parseChangelogResponse(response.content[0].text);
      }
    } catch (error) {
      throw new Error(`Enhanced changelog generation failed: ${error.message}`);
    }
  }

  buildEnhancedChangelogPrompt(mainStory, relatedStories) {
    const relatedStoriesText = relatedStories.map(story => `
- **${story.key}**: ${story.summary}
  Description: ${story.description || 'No description'}
  Status: ${story.status}
  Priority: ${story.priority}
  Components: ${story.components.join(', ') || 'None'}
  Labels: ${story.labels.join(', ') || 'None'}`).join('\n');

    return `
You are a technical writer creating an enhanced customer-facing changelog entry. You have access to a main JIRA story and several related stories that provide additional context.

MAIN STORY:
- **${mainStory.key}**: ${mainStory.summary}
  Description: ${mainStory.description}
  Priority: ${mainStory.priority}
  Components: ${mainStory.components.join(', ') || 'None'}
  Labels: ${mainStory.labels.join(', ') || 'None'}

RELATED STORIES (for context):
${relatedStoriesText}

INSTRUCTIONS:
1. Analyze all stories together to understand the complete scope and context
2. Create a cohesive changelog entry that reflects the broader initiative
3. Highlight how the related stories enhance or complete the main feature
4. Focus on the combined customer value and benefits
5. Ensure the content flows naturally and tells a complete story

Generate an enhanced changelog entry in the following JSON format:

{
  "customer_title": "Enhanced title that reflects the broader scope (max 80 characters)",
  "customer_description": "2-3 sentences describing the comprehensive improvement, mentioning how related work enhances the main feature",
  "highlights": [
    "Key benefit that considers the broader context",
    "Enhanced capability enabled by related work",
    "Comprehensive improvement across the feature set"
  ],
  "category": "added|improved|fixed|security|deprecated",
  "breaking_changes": false,
  "migration_notes": "Only if breaking_changes is true, provide migration guidance",
  "estimated_impact": "low|medium|high",
  "user_segments": ["all_users|enterprise|free_tier|developers|admin"],
  "tldr": "One sentence summary of the comprehensive changes"
}

CATEGORY MAPPING:
- "added" - New features, capabilities, or integrations
- "improved" - Performance, usability, or experience enhancements  
- "fixed" - Bug fixes, error corrections, or stability improvements
- "security" - Security updates, authentication, or privacy improvements
- "deprecated" - Features being sunset or removed

Consider the collective impact of all stories when determining the category and impact level.

Return only the JSON response, no additional text.
`;
  }
}

module.exports = AIProvider;