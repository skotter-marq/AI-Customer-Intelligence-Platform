import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase-client';

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }
  
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'create_jira_tickets':
        return await createJiraTicketsFromFeatureRequests(params.meetingId);
      case 'prioritize_feature_requests':
        return await prioritizeFeatureRequests(params.timeframe || '30d');
      case 'generate_competitive_report':
        return await generateCompetitiveReport(params.timeframe || '30d');
      case 'update_customer_health':
        return await updateCustomerHealthScores();
      case 'create_changelog_from_insights':
        return await createChangelogFromInsights(params.insightIds);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Meeting insights workflow error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function createJiraTicketsFromFeatureRequests(meetingId?: string) {
  try {
    console.log('🎫 Creating JIRA tickets from feature requests...');
    
    // Build query for feature requests
    let query = supabase
      .from('meeting_feature_requests')
      .select(`
        *,
        meetings (
          title,
          customer_name,
          meeting_date,
          grain_share_url
        )
      `)
      .eq('created_jira_ticket', false)
      .in('urgency', ['high', 'critical'])
      .order('created_at', { ascending: false });

    if (meetingId) {
      query = query.eq('meeting_id', meetingId);
    }

    const { data: featureRequests, error } = await query;

    if (error) {
      throw error;
    }

    const createdTickets = [];

    for (const request of featureRequests || []) {
      // In production, this would create actual JIRA tickets
      const jiraTicket = await createMockJiraTicket(request);
      
      // Update feature request with JIRA ticket key
      await supabase
        .from('meeting_feature_requests')
        .update({
          jira_ticket_key: jiraTicket.key,
          created_jira_ticket: true,
          status: 'evaluating'
        })
        .eq('id', request.id);

      createdTickets.push({
        feature_request_id: request.id,
        jira_ticket_key: jiraTicket.key,
        feature_title: request.feature_title,
        customer: request.meetings.customer_name
      });

      // Send Slack notification
      await notifyJiraTicketCreated(request, jiraTicket);
    }

    console.log(`✅ Created ${createdTickets.length} JIRA tickets from feature requests`);

    return NextResponse.json({
      success: true,
      message: `Created ${createdTickets.length} JIRA tickets`,
      tickets: createdTickets
    });

  } catch (error) {
    console.error('Error creating JIRA tickets:', error);
    return NextResponse.json(
      { error: 'Failed to create JIRA tickets' },
      { status: 500 }
    );
  }
}

async function prioritizeFeatureRequests(timeframe: string) {
  try {
    console.log('📊 Analyzing and prioritizing feature requests...');
    
    // Get feature requests from the specified timeframe
    const cutoffDate = getDateFromTimeframe(timeframe);
    
    const { data: requests, error } = await supabase
      .from('meeting_feature_requests')
      .select(`
        *,
        meetings (
          customer_name,
          meeting_date,
          sentiment_score
        )
      `)
      .gte('created_at', cutoffDate.toISOString());

    if (error) {
      throw error;
    }

    // Group and analyze feature requests
    const featureAnalysis = analyzeFeatureRequests(requests || []);
    
    // Update internal priorities based on analysis
    for (const analysis of featureAnalysis.top_features) {
      await supabase
        .from('meeting_feature_requests')
        .update({
          internal_priority: analysis.recommended_priority,
          feasibility_score: analysis.feasibility_score
        })
        .in('id', analysis.request_ids);
    }

    console.log(`📈 Analyzed ${requests?.length || 0} feature requests`);

    return NextResponse.json({
      success: true,
      analysis: featureAnalysis,
      timeframe,
      total_requests: requests?.length || 0
    });

  } catch (error) {
    console.error('Error prioritizing feature requests:', error);
    return NextResponse.json(
      { error: 'Failed to prioritize feature requests' },
      { status: 500 }
    );
  }
}

async function generateCompetitiveReport(timeframe: string) {
  try {
    console.log('🏢 Generating competitive intelligence report...');
    
    const cutoffDate = getDateFromTimeframe(timeframe);
    
    const { data: competitiveIntel, error } = await supabase
      .from('meeting_competitive_intel')
      .select(`
        *,
        meetings (
          customer_name,
          meeting_date,
          sentiment_score
        )
      `)
      .gte('created_at', cutoffDate.toISOString());

    if (error) {
      throw error;
    }

    const report = analyzeCompetitiveIntel(competitiveIntel || []);
    
    // Send report to Slack
    await sendCompetitiveReport(report, timeframe);

    return NextResponse.json({
      success: true,
      report,
      timeframe,
      total_mentions: competitiveIntel?.length || 0
    });

  } catch (error) {
    console.error('Error generating competitive report:', error);
    return NextResponse.json(
      { error: 'Failed to generate competitive report' },
      { status: 500 }
    );
  }
}

async function updateCustomerHealthScores() {
  try {
    console.log('💊 Updating customer health scores based on meeting sentiment...');
    
    // Get recent meeting outcomes grouped by customer
    const { data: outcomes, error } = await supabase
      .from('meeting_outcomes')
      .select(`
        *,
        meetings (
          customer_name,
          meeting_date,
          sentiment_score
        )
      `)
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      throw error;
    }

    const customerHealthScores = calculateCustomerHealthScores(outcomes || []);
    
    // In production, this would update a customer health table or external CRM
    console.log('📊 Customer health scores calculated:', customerHealthScores.length);

    return NextResponse.json({
      success: true,
      customer_health_scores: customerHealthScores,
      message: `Updated health scores for ${customerHealthScores.length} customers`
    });

  } catch (error) {
    console.error('Error updating customer health scores:', error);
    return NextResponse.json(
      { error: 'Failed to update customer health scores' },
      { status: 500 }
    );
  }
}

async function createChangelogFromInsights(insightIds: string[]) {
  try {
    console.log('📝 Creating changelog entries from meeting insights...');
    
    if (!insightIds || insightIds.length === 0) {
      return NextResponse.json(
        { error: 'No insight IDs provided' },
        { status: 400 }
      );
    }

    // Get the specified insights
    const { data: insights, error } = await supabase
      .from('meeting_insights')
      .select(`
        *,
        meetings (
          customer_name,
          title,
          meeting_date
        )
      `)
      .in('id', insightIds);

    if (error) {
      throw error;
    }

    const changelogEntries = [];

    for (const insight of insights || []) {
      if (insight.insight_type === 'feature_request') {
        // Create changelog entry for implemented feature
        const changelogEntry = await createChangelogEntryFromInsight(insight);
        changelogEntries.push(changelogEntry);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${changelogEntries.length} changelog entries`,
      entries: changelogEntries
    });

  } catch (error) {
    console.error('Error creating changelog from insights:', error);
    return NextResponse.json(
      { error: 'Failed to create changelog entries' },
      { status: 500 }
    );
  }
}

// Helper functions

async function createMockJiraTicket(featureRequest: any) {
  // In production, this would use the JIRA API
  const ticketKey = `FEAT-${Math.floor(Math.random() * 10000)}`;
  
  console.log(`🎫 Created JIRA ticket ${ticketKey} for: ${featureRequest.feature_title}`);
  
  return {
    key: ticketKey,
    url: `https://yourcompany.atlassian.net/browse/${ticketKey}`,
    title: featureRequest.feature_title,
    description: featureRequest.feature_description
  };
}

async function notifyJiraTicketCreated(featureRequest: any, jiraTicket: any) {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/slack`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send_notification',
        message: `🎫 JIRA ticket created: ${jiraTicket.key}\n` +
                `Feature: ${featureRequest.feature_title}\n` +
                `Customer: ${featureRequest.meetings.customer_name}\n` +
                `Urgency: ${featureRequest.urgency}`,
        type: 'success',
        metadata: {
          jira_ticket: jiraTicket.key,
          customer: featureRequest.meetings.customer_name
        }
      })
    });
  } catch (error) {
    console.warn('Failed to send JIRA ticket notification:', error);
  }
}

function analyzeFeatureRequests(requests: any[]) {
  // Group requests by similar features
  const featureGroups = new Map();
  
  requests.forEach(request => {
    const key = request.feature_title.toLowerCase();
    if (!featureGroups.has(key)) {
      featureGroups.set(key, []);
    }
    featureGroups.get(key).push(request);
  });

  // Analyze and prioritize
  const topFeatures = Array.from(featureGroups.entries())
    .map(([featureTitle, requests]) => {
      const avgUrgency = calculateAvgUrgency(requests);
      const customerCount = new Set(requests.map(r => r.meetings.customer_name)).size;
      const totalRequests = requests.length;
      
      return {
        feature_title: featureTitle,
        request_count: totalRequests,
        unique_customers: customerCount,
        avg_urgency: avgUrgency,
        recommended_priority: calculateRecommendedPriority(totalRequests, customerCount, avgUrgency),
        feasibility_score: Math.random() * 0.3 + 0.7, // Mock feasibility
        request_ids: requests.map(r => r.id)
      };
    })
    .sort((a, b) => {
      // Sort by request count and customer count
      return (b.request_count * b.unique_customers) - (a.request_count * a.unique_customers);
    })
    .slice(0, 10);

  return {
    top_features: topFeatures,
    total_unique_features: featureGroups.size,
    total_requests: requests.length,
    analysis_date: new Date().toISOString()
  };
}

function analyzeCompetitiveIntel(intel: any[]) {
  const competitorMap = new Map();
  
  intel.forEach(item => {
    const competitor = item.competitor_name;
    if (!competitorMap.has(competitor)) {
      competitorMap.set(competitor, {
        name: competitor,
        mentions: 0,
        threat_levels: [],
        mention_types: [],
        customers: new Set()
      });
    }
    
    const comp = competitorMap.get(competitor);
    comp.mentions++;
    comp.threat_levels.push(item.threat_level);
    comp.mention_types.push(item.mention_type);
    comp.customers.add(item.meetings.customer_name);
  });

  const competitorAnalysis = Array.from(competitorMap.values())
    .map(comp => ({
      ...comp,
      customers: comp.customers.size,
      avg_threat_level: calculateAvgThreatLevel(comp.threat_levels),
      most_common_mention_type: getMostCommon(comp.mention_types)
    }))
    .sort((a, b) => b.mentions - a.mentions);

  return {
    competitors: competitorAnalysis,
    total_mentions: intel.length,
    timeframe_analysis: new Date().toISOString()
  };
}

function calculateCustomerHealthScores(outcomes: any[]) {
  const customerMap = new Map();
  
  outcomes.forEach(outcome => {
    const customer = outcome.meetings.customer_name;
    if (!customerMap.has(customer)) {
      customerMap.set(customer, {
        customer_name: customer,
        meeting_count: 0,
        sentiment_scores: [],
        churn_risks: [],
        satisfaction_levels: []
      });
    }
    
    const cust = customerMap.get(customer);
    cust.meeting_count++;
    cust.sentiment_scores.push(outcome.meetings.sentiment_score || 0);
    cust.churn_risks.push(outcome.churn_risk_indicator);
    cust.satisfaction_levels.push(outcome.customer_satisfaction);
  });

  return Array.from(customerMap.values())
    .map(customer => ({
      ...customer,
      avg_sentiment: customer.sentiment_scores.reduce((a, b) => a + b, 0) / customer.sentiment_scores.length,
      health_score: calculateHealthScore(customer),
      recommendation: getHealthRecommendation(customer)
    }))
    .sort((a, b) => a.health_score - b.health_score); // Lowest scores first (need attention)
}

async function createChangelogEntryFromInsight(insight: any) {
  // Transform meeting insight into changelog entry
  const changelogEntry = {
    content_title: `${insight.title} - Requested by ${insight.meetings.customer_name}`,
    generated_content: `Based on customer feedback from ${insight.meetings.customer_name}, we've implemented: ${insight.description}`,
    content_type: 'changelog_entry',
    target_audience: 'customers',
    status: 'pending_approval',
    approval_status: 'pending',
    quality_score: 0.85,
    tldr_summary: insight.title,
    tldr_bullet_points: [insight.description],
    update_category: 'added',
    importance_score: insight.importance_score,
    tags: ['customer_feedback', 'meeting_insight', insight.meetings.customer_name.toLowerCase()],
    metadata: {
      source_meeting_id: insight.meeting_id,
      source_insight_id: insight.id,
      customer_name: insight.meetings.customer_name,
      meeting_date: insight.meetings.meeting_date
    }
  };

  // Save to generated_content table
  const { data, error } = await supabase
    .from('generated_content')
    .insert(changelogEntry)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function sendCompetitiveReport(report: any, timeframe: string) {
  try {
    const topCompetitors = report.competitors.slice(0, 5);
    
    let message = `🏢 Competitive Intelligence Report (${timeframe})\n\n`;
    message += `Total Mentions: ${report.total_mentions}\n\n`;
    
    topCompetitors.forEach((comp, index) => {
      message += `${index + 1}. ${comp.name}\n`;
      message += `   • ${comp.mentions} mentions from ${comp.customers} customers\n`;
      message += `   • Threat Level: ${comp.avg_threat_level}\n`;
      message += `   • Common Context: ${comp.most_common_mention_type}\n\n`;
    });

    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/slack`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send_notification',
        message,
        type: 'info',
        metadata: { report_type: 'competitive_intelligence' }
      })
    });
  } catch (error) {
    console.warn('Failed to send competitive report:', error);
  }
}

// Utility functions

function getDateFromTimeframe(timeframe: string): Date {
  const now = new Date();
  
  switch (timeframe) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

function calculateAvgUrgency(requests: any[]): number {
  const urgencyMap = { low: 1, medium: 2, high: 3, critical: 4 };
  const total = requests.reduce((sum, req) => sum + (urgencyMap[req.urgency] || 2), 0);
  return total / requests.length;
}

function calculateRecommendedPriority(requestCount: number, customerCount: number, avgUrgency: number): string {
  const score = (requestCount * 0.4) + (customerCount * 0.4) + (avgUrgency * 0.2);
  
  if (score >= 3.5) return 'critical';
  if (score >= 2.5) return 'high';
  if (score >= 1.5) return 'medium';
  return 'low';
}

function calculateAvgThreatLevel(threatLevels: string[]): string {
  const threatMap = { low: 1, medium: 2, high: 3, critical: 4 };
  const total = threatLevels.reduce((sum, level) => sum + (threatMap[level] || 2), 0);
  const avg = total / threatLevels.length;
  
  if (avg >= 3.5) return 'critical';
  if (avg >= 2.5) return 'high';
  if (avg >= 1.5) return 'medium';
  return 'low';
}

function getMostCommon(items: string[]): string {
  const counts = items.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
}

function calculateHealthScore(customer: any): number {
  // Simple health score calculation (0-100, lower is worse)
  const sentimentWeight = 0.4;
  const churnWeight = 0.3;
  const satisfactionWeight = 0.3;
  
  const sentimentScore = ((customer.avg_sentiment + 1) / 2) * 100; // Convert -1 to 1 range to 0-100
  
  const churnScore = customer.churn_risks.filter(risk => risk === 'low').length / customer.churn_risks.length * 100;
  
  const satisfactionScore = customer.satisfaction_levels.filter(sat => 
    sat === 'satisfied' || sat === 'very_satisfied'
  ).length / customer.satisfaction_levels.length * 100;
  
  return (sentimentScore * sentimentWeight) + (churnScore * churnWeight) + (satisfactionScore * satisfactionWeight);
}

function getHealthRecommendation(customer: any): string {
  const healthScore = calculateHealthScore(customer);
  
  if (healthScore < 30) return 'Immediate attention required - high churn risk';
  if (healthScore < 50) return 'Schedule check-in call - monitor closely';
  if (healthScore < 70) return 'Standard monitoring - maintain relationship';
  return 'Healthy customer - explore expansion opportunities';
}

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }
  
  return NextResponse.json({
    message: 'Meeting Insights Workflow API is active',
    actions: [
      'create_jira_tickets',
      'prioritize_feature_requests', 
      'generate_competitive_report',
      'update_customer_health',
      'create_changelog_from_insights'
    ],
    timestamp: new Date().toISOString()
  });
}