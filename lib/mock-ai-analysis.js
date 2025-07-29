// lib/mock-ai-analysis.js
/**
 * Mock AI Analysis for Development
 * Provides realistic AI responses without API calls
 */

class MockAIAnalysis {
  async analyzeMeetingContent(meetingData) {
    console.log('🤖 Mock AI analyzing meeting:', meetingData.title);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const transcript = meetingData.transcript || '';
    const title = meetingData.title || '';
    
    return {
      overall_analysis: {
        sentiment_score: this.calculateSentimentScore(transcript),
        sentiment_label: this.getSentimentLabel(transcript),
        confidence_score: 0.85,
        summary: this.generateSummary(transcript, title),
        meeting_outcome: this.determineMeetingOutcome(transcript, title)
      },
      insights: this.extractInsights(transcript, title),
      action_items: this.extractActionItems(transcript),
      feature_requests: this.extractFeatureRequests(transcript),
      competitive_intelligence: this.extractCompetitiveIntel(transcript),
      topics_discussed: this.extractTopics(transcript),
      customer_health: {
        satisfaction_level: this.calculateSatisfaction(transcript),
        churn_risk: this.assessChurnRisk(transcript),
        expansion_opportunity: this.assessExpansionOpportunity(transcript)
      }
    };
  }

  calculateSentimentScore(transcript) {
    const positive = ['great', 'excellent', 'love', 'perfect', 'amazing', 'satisfied', 'impressed', 'excited'];
    const negative = ['issue', 'problem', 'frustrated', 'disappointed', 'concerned', 'difficult', 'poor', 'unhappy'];
    
    const text = transcript.toLowerCase();
    const positiveCount = positive.filter(word => text.includes(word)).length;
    const negativeCount = negative.filter(word => text.includes(word)).length;
    
    // Base score of 0.5 (neutral), adjust based on sentiment words
    let score = 0.5;
    score += (positiveCount * 0.1) - (negativeCount * 0.1);
    return Math.max(0, Math.min(1, score));
  }

  getSentimentLabel(transcript) {
    const score = this.calculateSentimentScore(transcript);
    if (score > 0.6) return 'positive';
    if (score < 0.4) return 'negative';
    return 'neutral';
  }

  generateSummary(transcript, title) {
    if (title.toLowerCase().includes('demo')) {
      return 'Product demonstration session with customer showing interest in key features and discussing implementation timeline.';
    } else if (title.toLowerCase().includes('check-in')) {
      return 'Regular customer success check-in covering current usage, satisfaction levels, and addressing any concerns.';
    } else if (title.toLowerCase().includes('feature')) {
      return 'Feature request discussion covering customer needs, technical requirements, and priority assessment.';
    } else {
      return 'Customer meeting covering product discussion, feedback collection, and relationship building.';
    }
  }

  determineMeetingOutcome(transcript, title) {
    if (transcript.includes('price') || transcript.includes('contract')) {
      return 'sales_progression';
    } else if (transcript.includes('issue') || transcript.includes('problem')) {
      return 'support_escalation';
    } else if (transcript.includes('feature') || transcript.includes('request')) {
      return 'feature_discussion';
    } else {
      return 'relationship_building';
    }
  }

  extractInsights(transcript, title) {
    const insights = [];
    
    // Analytics interest
    if (transcript.toLowerCase().includes('analytics') || transcript.toLowerCase().includes('dashboard')) {
      insights.push({
        type: 'feature_interest',
        category: 'product',
        title: 'Strong interest in analytics capabilities',
        description: 'Customer expressed specific interest in analytics features and dashboard customization.',
        quote: 'We need better analytics to understand our data trends.',
        importance_score: 0.8,
        confidence_score: 0.9,
        priority: 'high',
        tags: ['analytics', 'dashboard'],
        affected_feature: 'Analytics Dashboard'
      });
    }

    // Performance concerns
    if (transcript.toLowerCase().includes('performance') || transcript.toLowerCase().includes('slow')) {
      insights.push({
        type: 'pain_point',
        category: 'technical',
        title: 'Performance concerns raised',
        description: 'Customer mentioned performance issues that need addressing.',
        quote: 'The system has been running slower with larger datasets.',
        importance_score: 0.85,
        confidence_score: 0.8,
        priority: 'high',
        tags: ['performance', 'technical'],
        affected_feature: 'System Performance'
      });
    }

    // Enterprise features
    if (transcript.toLowerCase().includes('enterprise') || transcript.toLowerCase().includes('deployment')) {
      insights.push({
        type: 'feature_request',
        category: 'product',
        title: 'Enterprise deployment requirements',
        description: 'Discussion around enterprise-level deployment and configuration needs.',
        quote: 'We need to understand the enterprise deployment options.',
        importance_score: 0.75,
        confidence_score: 0.85,
        priority: 'medium',
        tags: ['enterprise', 'deployment'],
        affected_feature: 'Enterprise Features'
      });
    }

    // Default insight if none detected
    if (insights.length === 0) {
      insights.push({
        type: 'general_feedback',
        category: 'customer',
        title: 'Customer engagement and feedback',
        description: 'General customer discussion covering product usage and experience.',
        quote: 'Overall positive discussion about product direction.',
        importance_score: 0.6,
        confidence_score: 0.7,
        priority: 'medium',
        tags: ['feedback', 'engagement'],
        affected_feature: 'General Product'
      });
    }

    return insights;
  }

  extractActionItems(transcript) {
    const actionItems = [];
    
    if (transcript.toLowerCase().includes('pricing') || transcript.toLowerCase().includes('enterprise')) {
      actionItems.push({
        description: 'Send enterprise pricing information and deployment guide',
        assigned_to: 'Sales Team',
        priority: 'high',
        category: 'sales',
        due_timeframe: 'this_week'
      });
    }

    if (transcript.toLowerCase().includes('technical') || transcript.toLowerCase().includes('integration')) {
      actionItems.push({
        description: 'Schedule technical deep-dive session',
        assigned_to: 'Solutions Engineer',
        priority: 'medium',
        category: 'technical',
        due_timeframe: 'this_week'
      });
    }

    if (transcript.toLowerCase().includes('follow up') || transcript.toLowerCase().includes('next steps')) {
      actionItems.push({
        description: 'Schedule follow-up meeting to review progress',
        assigned_to: 'Customer Success',
        priority: 'medium',
        category: 'relationship',
        due_timeframe: 'this_month'
      });
    }

    return actionItems;
  }

  extractFeatureRequests(transcript) {
    const requests = [];
    
    if (transcript.toLowerCase().includes('customization') || transcript.toLowerCase().includes('dashboard')) {
      requests.push({
        title: 'Dashboard Customization Features',
        description: 'Enhanced dashboard customization capabilities for better user experience',
        business_value: 'Improved user satisfaction and reduced time-to-value',
        urgency: 'high',
        customer_pain_point: 'Current dashboard lacks flexibility for specific use cases',
        estimated_impact: 'High - affects daily workflow efficiency'
      });
    }

    if (transcript.toLowerCase().includes('integration') || transcript.toLowerCase().includes('api')) {
      requests.push({
        title: 'Enhanced API Integration',
        description: 'Improved API capabilities for better third-party integrations',
        business_value: 'Reduced integration complexity and faster implementation',
        urgency: 'medium',
        customer_pain_point: 'Current API limitations slow down integration projects',
        estimated_impact: 'Medium - affects implementation timeline'
      });
    }

    return requests;
  }

  extractCompetitiveIntel(transcript) {
    const competitors = ['salesforce', 'hubspot', 'pipedrive', 'monday'];
    const intel = [];
    
    competitors.forEach(competitor => {
      if (transcript.toLowerCase().includes(competitor)) {
        intel.push({
          competitor: competitor.charAt(0).toUpperCase() + competitor.slice(1),
          mention_type: 'comparison',
          context: `Customer mentioned ${competitor} in context of feature comparison`,
          sentiment: 'neutral',
          threat_level: 'medium',
          quote: `We're also evaluating ${competitor} for this use case`
        });
      }
    });

    return intel;
  }

  extractTopics(transcript) {
    const topics = [];
    const keywords = {
      'Product Features': ['feature', 'functionality', 'capability'],
      'Technical Discussion': ['technical', 'integration', 'api', 'deployment'],
      'Pricing & Commercial': ['pricing', 'cost', 'contract', 'license'],
      'Support & Training': ['support', 'training', 'documentation', 'help'],
      'Performance': ['performance', 'speed', 'scalability', 'optimization']
    };

    Object.entries(keywords).forEach(([topic, words]) => {
      const relevanceScore = words.filter(word => 
        transcript.toLowerCase().includes(word)
      ).length / words.length;

      if (relevanceScore > 0) {
        topics.push({
          topic,
          category: 'discussion',
          relevance_score: Math.min(relevanceScore * 2, 1), // Scale up relevance
          sentiment: this.getSentimentLabel(transcript),
          keywords: words.filter(word => transcript.toLowerCase().includes(word))
        });
      }
    });

    return topics.sort((a, b) => b.relevance_score - a.relevance_score);
  }

  calculateSatisfaction(transcript) {
    const score = this.calculateSentimentScore(transcript);
    if (score > 0.7) return 'high';
    if (score > 0.4) return 'medium';
    return 'low';
  }

  assessChurnRisk(transcript) {
    const riskWords = ['cancel', 'disappointed', 'frustrated', 'switch', 'alternative'];
    const hasRiskWords = riskWords.some(word => transcript.toLowerCase().includes(word));
    
    if (hasRiskWords) return 'high';
    if (this.calculateSentimentScore(transcript) < 0.3) return 'medium';
    return 'low';
  }

  assessExpansionOpportunity(transcript) {
    const expansionWords = ['expand', 'additional', 'more users', 'enterprise', 'upgrade'];
    const hasExpansionWords = expansionWords.some(word => transcript.toLowerCase().includes(word));
    
    if (hasExpansionWords) return 'high';
    if (this.calculateSentimentScore(transcript) > 0.7) return 'medium';
    return 'low';
  }
}

module.exports = MockAIAnalysis;