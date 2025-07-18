// lib/customer-analysis-ai.js
/**
 * Customer Analysis AI Engine
 * Processes meeting transcripts and HubSpot data to extract customer insights
 */

const AIProvider = require('./ai-provider.js');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

class CustomerAnalysisAI {
  constructor() {
    this.ai = new AIProvider();
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  /**
   * Analyze a meeting transcript and save insights to database
   * @param {string} meetingId - Meeting ID from database
   * @param {Object} options - Analysis options
   * @returns {Object} Analysis results
   */
  async analyzeMeeting(meetingId, options = {}) {
    try {
      console.log(`🧠 Analyzing meeting: ${meetingId}`);
      
      // 1. Get meeting data from database
      const { data: meeting, error: meetingError } = await this.supabase
        .from('meetings')
        .select('*')
        .eq('id', meetingId)
        .single();
      
      if (meetingError) {
        throw new Error(`Failed to fetch meeting: ${meetingError.message}`);
      }
      
      if (!meeting.transcript) {
        throw new Error('Meeting has no transcript to analyze');
      }
      
      // 2. Get customer context
      const customerContext = await this.getCustomerContext(meeting.customer_id);
      
      // 3. Prepare meeting context for AI
      const meetingContext = {
        company: customerContext.company_name,
        meetingType: meeting.meeting_type,
        date: meeting.meeting_date,
        participants: meeting.attendees || [],
        duration: meeting.duration_minutes
      };
      
      // 4. Analyze transcript with AI
      const analysis = await this.ai.analyzeTranscript(meeting.transcript, meetingContext);
      
      // 5. Save insights to database
      const savedInsights = await this.saveInsights(analysis.insights, meeting.id, meeting.customer_id);
      
      // 6. Generate follow-up actions
      const followUpActions = await this.generateFollowUpActions(savedInsights, customerContext);
      
      // 7. Update meeting status
      await this.supabase
        .from('meetings')
        .update({ 
          meeting_status: 'analyzed',
          updated_at: new Date().toISOString()
        })
        .eq('id', meetingId);
      
      return {
        success: true,
        meetingId,
        insights: savedInsights,
        followUpActions,
        analysis: {
          overallSentiment: analysis.overall_sentiment,
          keyTopics: analysis.key_topics,
          summary: analysis.summary
        }
      };
      
    } catch (error) {
      console.error('Meeting analysis failed:', error);
      
      // Update meeting status to reflect error
      await this.supabase
        .from('meetings')
        .update({ 
          meeting_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', meetingId);
      
      throw error;
    }
  }

  /**
   * Get customer context for analysis
   * @param {string} customerId - Customer ID
   * @returns {Object} Customer context
   */
  async getCustomerContext(customerId) {
    const { data: customer, error: customerError } = await this.supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();
    
    if (customerError) {
      throw new Error(`Failed to fetch customer: ${customerError.message}`);
    }
    
    // Get recent HubSpot data
    const { data: hubspotContacts } = await this.supabase
      .from('hubspot_contacts')
      .select('*')
      .eq('customer_id', customerId)
      .limit(5);
    
    const { data: hubspotDeals } = await this.supabase
      .from('hubspot_deals')
      .select('*')
      .eq('customer_id', customerId)
      .limit(5);
    
    return {
      ...customer,
      hubspotContacts: hubspotContacts || [],
      hubspotDeals: hubspotDeals || []
    };
  }

  /**
   * Save insights to database
   * @param {Array} insights - AI-generated insights
   * @param {string} meetingId - Source meeting ID
   * @param {string} customerId - Customer ID
   * @returns {Array} Saved insights with IDs
   */
  async saveInsights(insights, meetingId, customerId) {
    const savedInsights = [];
    
    for (const insight of insights) {
      const insightData = {
        customer_id: customerId,
        source_type: 'meeting',
        source_id: meetingId,
        insight_type: insight.type,
        title: insight.title,
        description: insight.description,
        sentiment_score: insight.sentiment_score,
        confidence_score: insight.confidence_score,
        priority: insight.priority,
        tags: insight.tags || [],
        ai_metadata: {
          quotes: insight.quotes || [],
          analysis_version: '1.0',
          processed_at: new Date().toISOString()
        }
      };
      
      const { data: saved, error } = await this.supabase
        .from('insights')
        .insert(insightData)
        .select()
        .single();
      
      if (error) {
        console.error('Failed to save insight:', error);
        continue;
      }
      
      savedInsights.push(saved);
    }
    
    return savedInsights;
  }

  /**
   * Generate follow-up actions based on insights
   * @param {Array} insights - Saved insights
   * @param {Object} customerContext - Customer context
   * @returns {Array} Follow-up actions
   */
  async generateFollowUpActions(insights, customerContext) {
    if (insights.length === 0) return [];
    
    try {
      // Generate actions using AI
      const actions = await this.ai.generateFollowUpActions(insights, customerContext);
      
      // Save actions to database
      const savedActions = [];
      for (const action of actions.actions) {
        const actionData = {
          customer_id: customerContext.id,
          insight_id: insights[0].id, // Link to first insight for now
          action_type: action.type,
          title: action.title,
          description: action.description,
          priority: action.priority,
          due_date: action.due_date,
          assigned_to: action.assigned_to,
          metadata: {
            related_insights: action.related_insights || [],
            generated_at: new Date().toISOString()
          }
        };
        
        const { data: saved, error } = await this.supabase
          .from('follow_ups')
          .insert(actionData)
          .select()
          .single();
        
        if (!error) {
          savedActions.push(saved);
        }
      }
      
      return savedActions;
    } catch (error) {
      console.error('Failed to generate follow-up actions:', error);
      return [];
    }
  }

  /**
   * Analyze HubSpot data for a customer
   * @param {string} customerId - Customer ID
   * @param {Object} options - Analysis options
   * @returns {Object} Analysis results
   */
  async analyzeHubSpotData(customerId, options = {}) {
    try {
      console.log(`🧠 Analyzing HubSpot data for customer: ${customerId}`);
      
      const customerContext = await this.getCustomerContext(customerId);
      
      // Analyze contacts
      const contactInsights = [];
      for (const contact of customerContext.hubspotContacts) {
        const analysis = await this.ai.analyzeHubSpotData(contact, 'contact');
        contactInsights.push(...analysis.insights);
      }
      
      // Analyze deals
      const dealInsights = [];
      for (const deal of customerContext.hubspotDeals) {
        const analysis = await this.ai.analyzeHubSpotData(deal, 'deal');
        dealInsights.push(...analysis.insights);
      }
      
      // Combine and save insights
      const allInsights = [...contactInsights, ...dealInsights];
      const savedInsights = [];
      
      for (const insight of allInsights) {
        const insightData = {
          customer_id: customerId,
          source_type: 'hubspot_contact', // Simplified for now
          source_id: customerContext.hubspotContacts[0]?.id || customerId,
          insight_type: insight.type,
          title: insight.title,
          description: insight.description,
          sentiment_score: insight.sentiment_score,
          confidence_score: insight.confidence_score,
          priority: insight.priority,
          tags: insight.tags || [],
          ai_metadata: {
            source: 'hubspot_analysis',
            analysis_version: '1.0',
            processed_at: new Date().toISOString()
          }
        };
        
        const { data: saved, error } = await this.supabase
          .from('insights')
          .insert(insightData)
          .select()
          .single();
        
        if (!error) {
          savedInsights.push(saved);
        }
      }
      
      return {
        success: true,
        customerId,
        insights: savedInsights,
        contactCount: customerContext.hubspotContacts.length,
        dealCount: customerContext.hubspotDeals.length
      };
      
    } catch (error) {
      console.error('HubSpot analysis failed:', error);
      throw error;
    }
  }

  /**
   * Get customer correlations - find similar patterns across customers
   * @param {string} customerId - Customer ID
   * @returns {Array} Similar customers and patterns
   */
  async findCustomerCorrelations(customerId) {
    try {
      console.log(`🔍 Finding correlations for customer: ${customerId}`);
      
      // Get customer's insights
      const { data: customerInsights } = await this.supabase
        .from('insights')
        .select('*')
        .eq('customer_id', customerId);
      
      if (!customerInsights || customerInsights.length === 0) {
        return [];
      }
      
      // Find similar insights from other customers
      const correlations = [];
      for (const insight of customerInsights) {
        const { data: similarInsights } = await this.supabase
          .from('insights')
          .select('*, customers(company_name)')
          .neq('customer_id', customerId)
          .eq('insight_type', insight.insight_type)
          .limit(5);
        
        if (similarInsights && similarInsights.length > 0) {
          correlations.push({
            sourceInsight: insight,
            similarInsights: similarInsights,
            correlationType: 'similar_pain_point'
          });
        }
      }
      
      // Save correlations to database
      const savedCorrelations = [];
      for (const correlation of correlations) {
        for (const similar of correlation.similarInsights) {
          const correlationData = {
            primary_customer_id: customerId,
            related_customer_id: similar.customer_id,
            correlation_type: correlation.correlationType,
            correlation_score: 0.8, // Simplified scoring
            shared_insights: [correlation.sourceInsight.id, similar.id]
          };
          
          const { data: saved, error } = await this.supabase
            .from('customer_correlations')
            .insert(correlationData)
            .select()
            .single();
          
          if (!error) {
            savedCorrelations.push(saved);
          }
        }
      }
      
      return savedCorrelations;
      
    } catch (error) {
      console.error('Correlation analysis failed:', error);
      return [];
    }
  }

  /**
   * Get analytics for the analysis engine
   * @returns {Object} Analytics data
   */
  async getAnalytics() {
    try {
      const { data: totalInsights } = await this.supabase
        .from('insights')
        .select('count');
      
      const { data: analyzedMeetings } = await this.supabase
        .from('meetings')
        .select('count')
        .eq('meeting_status', 'analyzed');
      
      const { data: pendingMeetings } = await this.supabase
        .from('meetings')
        .select('count')
        .eq('meeting_status', 'pending');
      
      const { data: recentInsights } = await this.supabase
        .from('insights')
        .select('*, customers(company_name)')
        .order('created_at', { ascending: false })
        .limit(10);
      
      return {
        totalInsights: totalInsights?.length || 0,
        analyzedMeetings: analyzedMeetings?.length || 0,
        pendingMeetings: pendingMeetings?.length || 0,
        recentInsights: recentInsights || []
      };
      
    } catch (error) {
      console.error('Analytics fetch failed:', error);
      return {
        totalInsights: 0,
        analyzedMeetings: 0,
        pendingMeetings: 0,
        recentInsights: []
      };
    }
  }
}

module.exports = CustomerAnalysisAI;