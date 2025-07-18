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
          model: 'claude-3-sonnet-20240229',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hello! This is a connection test.' }]
        });
        return {
          success: true,
          provider: 'claude',
          model: 'claude-3-sonnet-20240229',
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
          model: 'claude-3-sonnet-20240229',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }]
        });
        return this.parseInsights(response.content[0].text);
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
          model: 'claude-3-sonnet-20240229',
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
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        });
        return JSON.parse(response.content[0].text);
      }
    } catch (error) {
      throw new Error(`Follow-up generation failed: ${error.message}`);
    }
  }
}

module.exports = AIProvider;