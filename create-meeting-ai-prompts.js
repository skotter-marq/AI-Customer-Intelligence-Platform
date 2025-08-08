#!/usr/bin/env node

/**
 * Script to create comprehensive AI prompts for meeting intelligence analysis
 * Run with: node create-meeting-ai-prompts.js
 */

const prompts = [
  {
    table: 'ai_prompts',
    data: {
      id: 'comprehensive-meeting-analysis',
      name: 'Comprehensive Meeting Intelligence Analysis',
      description: 'Advanced AI analysis that extracts insights, sentiment, action items, competitive intelligence, and feature requests from meeting transcripts',
      category: 'Meeting Analysis',
      type: 'ai_analysis',
      system_instructions: `You are an expert customer intelligence analyst specializing in extracting comprehensive business insights from customer meetings. Your analysis drives strategic decision-making across product, sales, customer success, and competitive intelligence teams.

EXPERTISE AREAS:
- Customer sentiment and satisfaction analysis
- Feature request identification and prioritization
- Competitive intelligence extraction
- Business risk and opportunity detection
- Action item generation and assignment
- Customer journey stage assessment`,
      user_prompt_template: `Analyze this meeting transcript and extract comprehensive business intelligence.

MEETING CONTEXT:
- Customer: {customer_name}
- Meeting Type: {meeting_type}
- Date: {meeting_date}
- Duration: {duration_minutes} minutes
- Participants: {participants}

TRANSCRIPT:
{transcript}

ANALYSIS INSTRUCTIONS:
Provide comprehensive analysis in the following JSON format:

{
  "overall_analysis": {
    "sentiment_score": -1.0 to 1.0,
    "sentiment_label": "positive|neutral|negative",
    "confidence_score": 0.0 to 1.0,
    "meeting_summary": "2-3 sentence executive summary",
    "key_themes": ["theme1", "theme2", "theme3"],
    "customer_health_score": 0.0 to 1.0,
    "business_impact": "high|medium|low"
  },
  "insights": [
    {
      "insight_type": "pain_point|feature_request|competitive_mention|positive_feedback|risk_indicator|opportunity",
      "category": "product|support|sales|technical|business",
      "title": "Brief descriptive title",
      "description": "Detailed description of the insight",
      "quote": "Exact quote from transcript",
      "context": "Additional context around the quote",
      "importance_score": 0.0 to 1.0,
      "confidence_score": 0.0 to 1.0,
      "priority": "critical|high|medium|low",
      "tags": ["tag1", "tag2", "tag3"],
      "affected_feature": "Feature name if applicable",
      "competitor_mentioned": "Competitor name if applicable"
    }
  ],
  "action_items": [
    {
      "description": "Specific action to be taken",
      "assigned_to": "sales|support|product|technical",
      "priority": "critical|high|medium|low",
      "category": "follow_up|technical|sales|support",
      "due_date": "YYYY-MM-DD (estimate based on urgency)",
      "related_quote": "Supporting quote from transcript"
    }
  ],
  "feature_requests": [
    {
      "feature_title": "Clear, concise feature name",
      "feature_description": "Detailed description of requested feature",
      "business_value": "Why this feature is valuable to the customer",
      "urgency": "critical|high|medium|low",
      "customer_pain_point": "Current problem this would solve",
      "current_workaround": "How customer works around this now",
      "estimated_impact": "How many users would benefit",
      "customer_priority": "critical|high|medium|low"
    }
  ],
  "competitive_intelligence": [
    {
      "competitor_name": "Name of competitor mentioned",
      "mention_type": "comparison|consideration|switching|lost_to|won_against",
      "context": "What was said about the competitor",
      "sentiment": "positive|negative|neutral",
      "threat_level": "critical|high|medium|low", 
      "customer_intent": "considering|evaluating|switching|comparing",
      "quote": "Exact competitive mention from transcript"
    }
  ],
  "topics": [
    {
      "topic": "Main discussion topic",
      "topic_category": "product|pricing|competition|support|integration",
      "mentions_count": 1,
      "relevance_score": 0.0 to 1.0,
      "sentiment_score": -1.0 to 1.0,
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "context_snippets": ["relevant quote 1", "relevant quote 2"]
    }
  ],
  "participant_analysis": [
    {
      "name": "Participant name",
      "role": "customer|sales|support|product|technical",
      "is_internal": true|false,
      "engagement_level": "high|medium|low",
      "sentiment_score": -1.0 to 1.0,
      "key_contributions": ["main point 1", "main point 2"]
    }
  ],
  "outcome_assessment": {
    "outcome_type": "deal_progression|support_resolution|feature_demo|discovery",
    "outcome_result": "positive|negative|neutral|needs_follow_up",
    "deal_stage_change": "moved_forward|stalled|no_change|moved_backward",
    "next_steps": ["step1", "step2", "step3"],
    "follow_up_required": true|false,
    "follow_up_date": "YYYY-MM-DD",
    "customer_satisfaction": "very_satisfied|satisfied|neutral|dissatisfied|very_dissatisfied",
    "churn_risk_indicator": "high|medium|low",
    "expansion_opportunity": true|false
  }
}

ANALYSIS GUIDELINES:
1. **Sentiment Analysis**: Consider overall tone, language patterns, and emotional indicators
2. **Feature Requests**: Look for explicit asks, pain points that suggest missing features, and workarounds
3. **Competitive Intelligence**: Identify any competitor mentions, comparisons, or switching considerations
4. **Risk Assessment**: Flag potential churn indicators, satisfaction issues, or blockers
5. **Opportunities**: Identify upsell/expansion possibilities, partnership opportunities, or success indicators
6. **Action Items**: Generate specific, actionable tasks with appropriate owners and timelines
7. **Business Impact**: Assess potential revenue, strategic, or operational implications

Focus on actionable insights that drive business decisions and customer success outcomes.
Return only the JSON response, no additional text.`,
      variables: ['customer_name', 'meeting_type', 'meeting_date', 'duration_minutes', 'participants', 'transcript'],
      parameters: {
        temperature: 0.3,
        maxTokens: 4000,
        model: 'claude-3-5-sonnet-20241022'
      },
      used_in: ['Grain webhook automation', 'Meeting intelligence pipeline', 'Customer insight workflows'],
      version: '3.0',
      enabled: true
    }
  },
  {
    table: 'ai_prompts',
    data: {
      id: 'meeting-sentiment-analysis',
      name: 'Meeting Sentiment & Emotion Analysis',
      description: 'Specialized analysis for customer sentiment, emotional indicators, and satisfaction levels in meetings',
      category: 'Customer Intelligence',
      type: 'ai_analysis',
      system_instructions: `You are a customer sentiment analyst specializing in emotional intelligence and satisfaction assessment from customer conversations. Your analysis helps customer success teams understand relationship health and predict churn risk.`,
      user_prompt_template: `Analyze the sentiment and emotional indicators in this meeting transcript.

MEETING CONTEXT:
- Customer: {customer_name}
- Meeting Type: {meeting_type}
- Previous Interactions: {interaction_history}

TRANSCRIPT:
{transcript}

Provide detailed sentiment analysis in JSON format:

{
  "overall_sentiment": {
    "score": -1.0 to 1.0,
    "label": "very_positive|positive|neutral|negative|very_negative",
    "confidence": 0.0 to 1.0
  },
  "emotional_indicators": [
    {
      "emotion": "satisfaction|frustration|excitement|concern|confusion|appreciation",
      "intensity": "high|medium|low",
      "quote": "Supporting quote from transcript",
      "timestamp_context": "When in conversation this occurred"
    }
  ],
  "satisfaction_assessment": {
    "product_satisfaction": "very_satisfied|satisfied|neutral|dissatisfied|very_dissatisfied",
    "support_satisfaction": "very_satisfied|satisfied|neutral|dissatisfied|very_dissatisfied",
    "overall_experience": "very_satisfied|satisfied|neutral|dissatisfied|very_dissatisfied",
    "confidence_level": 0.0 to 1.0
  },
  "churn_risk_indicators": [
    {
      "risk_type": "pricing_concern|feature_gap|competitor_consideration|poor_support|technical_issues",
      "severity": "high|medium|low",
      "description": "Specific risk factor identified",
      "supporting_evidence": "Quote or behavior that indicates this risk"
    }
  ],
  "positive_signals": [
    {
      "signal_type": "expansion_interest|advocacy_potential|success_achievement|feature_adoption",
      "strength": "high|medium|low", 
      "description": "Positive indicator identified",
      "supporting_evidence": "Quote or behavior that indicates this opportunity"
    }
  ]
}

Focus on nuanced emotional cues, language patterns, and relationship health indicators.
Return only the JSON response.`,
      variables: ['customer_name', 'meeting_type', 'interaction_history', 'transcript'],
      parameters: {
        temperature: 0.2,
        maxTokens: 2000,
        model: 'claude-3-5-sonnet-20241022'
      },
      used_in: ['Customer health scoring', 'Churn prediction', 'Satisfaction monitoring'],
      version: '2.0',
      enabled: true
    }
  },
  {
    table: 'ai_prompts', 
    data: {
      id: 'feature-request-prioritization',
      name: 'Feature Request Analysis & Prioritization',
      description: 'Advanced analysis of feature requests with business impact assessment and prioritization scoring',
      category: 'Product Intelligence',
      type: 'ai_analysis',
      system_instructions: `You are a product analyst specializing in customer feedback analysis and feature prioritization. Your insights help product teams understand customer needs and prioritize development roadmaps based on business impact and customer demand.`,
      user_prompt_template: `Analyze this meeting transcript to identify and prioritize feature requests.

MEETING CONTEXT:
- Customer: {customer_name}
- Customer Segment: {customer_segment}
- ARR: {customer_arr}
- Meeting Type: {meeting_type}

TRANSCRIPT:
{transcript}

Extract and analyze feature requests in JSON format:

{
  "feature_requests": [
    {
      "feature_title": "Clear, specific feature name",
      "category": "ui_ux|integration|automation|analytics|security|performance|mobile",
      "description": "Detailed description of the requested functionality",
      "customer_use_case": "Specific use case described by the customer",
      "business_value": "Business value this would provide to the customer",
      "current_pain_point": "Current problem or limitation",
      "workaround_described": "How customer currently handles this need",
      "urgency_level": "critical|high|medium|low",
      "customer_priority": "must_have|nice_to_have|future_consideration",
      "impact_on_workflow": "blocks_workflow|slows_workflow|improves_efficiency|nice_enhancement",
      "willingness_to_pay": "explicitly_mentioned|implied|not_mentioned",
      "competitive_pressure": "high|medium|low|none",
      "estimated_user_impact": "all_users|power_users|admin_users|specific_segment",
      "implementation_complexity": "simple|moderate|complex|unknown",
      "supporting_quotes": ["quote1", "quote2"],
      "business_case_strength": "strong|moderate|weak"
    }
  ],
  "prioritization_analysis": {
    "high_impact_requests": [
      {
        "feature": "Feature name",
        "business_justification": "Why this should be prioritized",
        "revenue_impact": "potential revenue/retention impact",
        "effort_estimate": "relative effort assessment"
      }
    ],
    "quick_wins": [
      {
        "feature": "Feature name", 
        "why_quick_win": "Low effort, high customer satisfaction impact"
      }
    ]
  },
  "product_strategy_insights": [
    {
      "insight": "Strategic insight for product team",
      "recommendation": "Specific recommendation for product roadmap"
    }
  ]
}

Focus on identifying both explicit requests and implicit needs. Assess business impact beyond just customer satisfaction.
Return only the JSON response.`,
      variables: ['customer_name', 'customer_segment', 'customer_arr', 'meeting_type', 'transcript'],
      parameters: {
        temperature: 0.3,
        maxTokens: 3000,
        model: 'claude-3-5-sonnet-20241022'
      },
      used_in: ['Product roadmap planning', 'Feature prioritization', 'Customer feedback analysis'],
      version: '2.0',
      enabled: true
    }
  },
  {
    table: 'ai_prompts',
    data: {
      id: 'competitive-intelligence-analysis',
      name: 'Competitive Intelligence Extraction',
      description: 'Specialized analysis for competitive mentions, market positioning, and competitive threats in customer meetings',
      category: 'Competitive Intelligence',
      type: 'ai_analysis',
      system_instructions: `You are a competitive intelligence analyst focused on extracting strategic market insights from customer conversations. Your analysis helps sales, product, and marketing teams understand competitive positioning and develop counter-strategies.`,
      user_prompt_template: `Analyze this meeting transcript for competitive intelligence signals.

MEETING CONTEXT:
- Customer: {customer_name}
- Meeting Type: {meeting_type}
- Sales Stage: {sales_stage}
- Known Competitors: {known_competitors}

TRANSCRIPT:
{transcript}

Extract competitive intelligence in JSON format:

{
  "competitive_mentions": [
    {
      "competitor_name": "Exact competitor name mentioned",
      "mention_type": "direct_comparison|consideration|current_vendor|past_experience|switching_consideration",
      "context": "Full context of the mention",
      "customer_sentiment": "positive|negative|neutral",
      "specific_aspects_discussed": ["pricing", "features", "support", "implementation"],
      "competitive_advantage_claimed": "What competitor strength was mentioned",
      "weakness_mentioned": "Any competitor weakness mentioned", 
      "customer_preference": "prefers_competitor|prefers_us|undecided",
      "decision_influence": "high|medium|low|none",
      "supporting_quote": "Exact quote from transcript"
    }
  ],
  "competitive_positioning": {
    "our_strengths_mentioned": ["strength1", "strength2"],
    "our_weaknesses_mentioned": ["weakness1", "weakness2"],
    "differentiation_opportunities": ["opportunity1", "opportunity2"],
    "customer_decision_criteria": ["criteria1", "criteria2", "criteria3"]
  },
  "market_insights": [
    {
      "insight_type": "market_trend|buyer_behavior|decision_process|vendor_evaluation",
      "insight": "Specific market insight gained",
      "strategic_implication": "How this affects our strategy"
    }
  ],
  "threat_assessment": {
    "immediate_competitive_threats": [
      {
        "competitor": "Competitor name",
        "threat_level": "critical|high|medium|low",
        "threat_description": "Specific threat to our position",
        "recommended_response": "Suggested counter-strategy"
      }
    ],
    "competitive_opportunities": [
      {
        "opportunity": "Opportunity to differentiate or win",
        "competitor_weakness": "Competitor weakness to exploit",
        "action_required": "What we need to do to capitalize"
      }
    ]
  },
  "win_loss_factors": [
    {
      "factor": "Specific factor influencing decision",
      "favor": "us|competitor|neutral",
      "importance": "critical|high|medium|low",
      "customer_feedback": "What customer said about this factor"
    }
  ]
}

Focus on strategic intelligence that drives competitive strategy and sales enablement.
Return only the JSON response.`,
      variables: ['customer_name', 'meeting_type', 'sales_stage', 'known_competitors', 'transcript'],
      parameters: {
        temperature: 0.2,
        maxTokens: 2500,
        model: 'claude-3-5-sonnet-20241022'
      },
      used_in: ['Competitive analysis', 'Sales enablement', 'Market intelligence'],
      version: '1.5',
      enabled: true
    }
  }
];

async function createPrompts() {
  console.log('🚀 Creating comprehensive meeting AI prompts...');
  
  for (const prompt of prompts) {
    try {
      const response = await fetch('http://localhost:3000/api/admin/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prompt)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log(`✅ Created: ${prompt.data.name}`);
      
    } catch (error) {
      console.error(`❌ Failed to create ${prompt.data.name}:`, error.message);
    }
  }
  
  console.log('🎉 AI prompts creation complete!');
}

// Run if called directly
if (require.main === module) {
  createPrompts().catch(console.error);
}

module.exports = { createPrompts, prompts };