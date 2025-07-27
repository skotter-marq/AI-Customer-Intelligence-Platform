import { NextRequest, NextResponse } from 'next/server';

interface AffectedCustomersRequest {
  competitorId: string;
  signalType: 'pricing_change' | 'feature_launch' | 'acquisition' | 'partnership' | 'funding' | 'executive_change';
  filters?: {
    segment?: string;
    tier?: string[];
    industry?: string;
  };
}

// Mock competitor data
const mockCompetitors = {
  'competitor-001': {
    id: 'competitor-001',
    name: 'Salesforce',
    target_industries: ['technology', 'finance', 'healthcare'],
    typical_customer_segments: ['enterprise', 'growth'],
    competitive_overlap: 0.8
  },
  'competitor-002': {
    id: 'competitor-002',
    name: 'HubSpot',
    target_industries: ['technology', 'marketing', 'retail'],
    typical_customer_segments: ['startup', 'growth'],
    competitive_overlap: 0.6
  },
  'competitor-003': {
    id: 'competitor-003',
    name: 'Pipedrive',
    target_industries: ['technology', 'real-estate', 'consulting'],
    typical_customer_segments: ['startup', 'growth'],
    competitive_overlap: 0.4
  }
};

// Mock customer data with competitor relationships
const mockCustomers = [
  {
    id: 'customer-001',
    company_name: 'MarketingCorp',
    industry: 'technology',
    segment: 'enterprise',
    tier: 'growth',
    competitive_exposure: {
      'competitor-001': { mentioned_in_calls: 3, considered_alternative: true, risk_level: 'high' },
      'competitor-002': { mentioned_in_calls: 1, considered_alternative: false, risk_level: 'low' }
    },
    primary_contact: {
      first_name: 'John',
      last_name: 'Smith',
      email: 'john.smith@marketingcorp.com',
      role: 'VP Marketing'
    },
    account_value: 50000,
    renewal_date: '2024-03-15',
    engagement_score: 78
  },
  {
    id: 'customer-002',
    company_name: 'TechStart Inc',
    industry: 'technology',
    segment: 'startup',
    tier: 'starter',
    competitive_exposure: {
      'competitor-002': { mentioned_in_calls: 5, considered_alternative: true, risk_level: 'high' },
      'competitor-003': { mentioned_in_calls: 2, considered_alternative: true, risk_level: 'medium' }
    },
    primary_contact: {
      first_name: 'Lisa',
      last_name: 'Wong',
      email: 'lisa.wong@techstart.com',
      role: 'CEO'
    },
    account_value: 15000,
    renewal_date: '2024-04-20',
    engagement_score: 95
  },
  {
    id: 'customer-003',
    company_name: 'GlobalCorp',
    industry: 'manufacturing',
    segment: 'enterprise',
    tier: 'enterprise',
    competitive_exposure: {
      'competitor-001': { mentioned_in_calls: 2, considered_alternative: false, risk_level: 'medium' }
    },
    primary_contact: {
      first_name: 'David',
      last_name: 'Brown',
      email: 'david.brown@globalcorp.com',
      role: 'Director of Operations'
    },
    account_value: 120000,
    renewal_date: '2024-02-28',
    engagement_score: 32
  },
  {
    id: 'customer-004',
    company_name: 'FinancePlus',
    industry: 'finance',
    segment: 'growth',
    tier: 'growth',
    competitive_exposure: {
      'competitor-001': { mentioned_in_calls: 4, considered_alternative: true, risk_level: 'high' },
      'competitor-002': { mentioned_in_calls: 1, considered_alternative: false, risk_level: 'low' }
    },
    primary_contact: {
      first_name: 'Robert',
      last_name: 'Miller',
      email: 'robert.miller@financeplus.com',
      role: 'CFO'
    },
    account_value: 75000,
    renewal_date: '2024-05-15',
    engagement_score: 58
  }
];

export async function POST(request: NextRequest) {
  try {
    const body: AffectedCustomersRequest = await request.json();
    const { competitorId, signalType, filters = {} } = body;

    console.log('Competitor impact analysis request:', { competitorId, signalType, filters });

    // Get competitor information
    const competitor = mockCompetitors[competitorId as keyof typeof mockCompetitors];
    if (!competitor) {
      return NextResponse.json(
        { success: false, error: 'Competitor not found' },
        { status: 404 }
      );
    }

    // Find customers potentially affected by this competitor signal
    let affectedCustomers = mockCustomers.filter(customer => {
      // Must have competitive exposure to this competitor
      const exposure = customer.competitive_exposure[competitorId as keyof typeof customer.competitive_exposure];
      if (!exposure) {
        return false;
      }

      // Apply industry filter (competitor's target industries)
      if (!competitor.target_industries.includes(customer.industry)) {
        return false;
      }

      // Apply segment filter (competitor's typical segments)
      if (!competitor.typical_customer_segments.includes(customer.segment)) {
        return false;
      }

      // Apply additional filters
      if (filters.segment && customer.segment !== filters.segment) {
        return false;
      }

      if (filters.tier && filters.tier.length > 0) {
        if (!filters.tier.includes(customer.tier)) {
          return false;
        }
      }

      if (filters.industry && customer.industry !== filters.industry) {
        return false;
      }

      return true;
    });

    // Enrich with impact analysis
    const enrichedCustomers = affectedCustomers.map(customer => {
      const exposure = customer.competitive_exposure[competitorId as keyof typeof customer.competitive_exposure];
      const impactScore = calculateImpactScore(customer, competitor, signalType, exposure);
      const recommendedActions = generateCompetitiveActions(customer, signalType, impactScore);

      return {
        ...customer,
        competitive_exposure: exposure,
        impact_score: impactScore,
        risk_level: impactScore > 7 ? 'critical' : impactScore > 4 ? 'high' : 'medium',
        recommended_actions: recommendedActions,
        urgency: calculateUrgency(customer, signalType, impactScore)
      };
    });

    // Sort by impact score (highest first)
    enrichedCustomers.sort((a, b) => b.impact_score - a.impact_score);

    console.log(`Found ${enrichedCustomers.length} customers affected by ${competitor.name} ${signalType}`);

    return NextResponse.json({
      success: true,
      competitor: {
        id: competitor.id,
        name: competitor.name
      },
      signal_type: signalType,
      affected_customers: enrichedCustomers,
      total_affected: enrichedCustomers.length,
      summary: {
        critical_risk: enrichedCustomers.filter(c => c.risk_level === 'critical').length,
        high_risk: enrichedCustomers.filter(c => c.risk_level === 'high').length,
        medium_risk: enrichedCustomers.filter(c => c.risk_level === 'medium').length,
        total_account_value_at_risk: enrichedCustomers.reduce((sum, c) => sum + c.account_value, 0)
      }
    });

  } catch (error) {
    console.error('Error in competitor impact analysis:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateImpactScore(
  customer: any, 
  competitor: any, 
  signalType: string, 
  exposure: any
): number {
  let score = 0;

  // Base competitive exposure score
  score += exposure.mentioned_in_calls || 0;
  
  // Alternative consideration adds significant risk
  if (exposure.considered_alternative) {
    score += 3;
  }

  // Current risk level
  if (exposure.risk_level === 'high') score += 3;
  else if (exposure.risk_level === 'medium') score += 2;
  else score += 1;

  // Signal type impact
  const signalImpact = {
    'pricing_change': 4,
    'feature_launch': 3,
    'acquisition': 2,
    'partnership': 2,
    'funding': 1,
    'executive_change': 1
  };
  score += signalImpact[signalType as keyof typeof signalImpact] || 1;

  // Customer value multiplier
  if (customer.account_value > 100000) score += 2;
  else if (customer.account_value > 50000) score += 1;

  // Engagement score impact (lower engagement = higher risk)
  if (customer.engagement_score < 50) score += 2;
  else if (customer.engagement_score < 70) score += 1;

  // Renewal proximity (closer renewal = higher urgency)
  const renewalDate = new Date(customer.renewal_date);
  const daysToRenewal = Math.ceil((renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysToRenewal < 30) score += 3;
  else if (daysToRenewal < 90) score += 2;
  else if (daysToRenewal < 180) score += 1;

  return Math.min(10, score); // Cap at 10
}

function generateCompetitiveActions(customer: any, signalType: string, impactScore: number): string[] {
  const actions: string[] = [];

  // High impact actions
  if (impactScore > 7) {
    actions.push('immediate_sales_intervention');
    actions.push('schedule_executive_call');
    actions.push('prepare_competitive_battlecard');
  }

  // Signal-specific actions
  if (signalType === 'pricing_change') {
    actions.push('review_pricing_strategy');
    actions.push('prepare_value_justification');
    actions.push('consider_pricing_adjustment');
  } else if (signalType === 'feature_launch') {
    actions.push('demonstrate_equivalent_features');
    actions.push('highlight_unique_differentiators');
    actions.push('accelerate_roadmap_communication');
  }

  // Tier-specific actions
  if (customer.tier === 'enterprise') {
    actions.push('engage_enterprise_team');
    actions.push('prepare_custom_proposal');
  }

  // Engagement-based actions
  if (customer.engagement_score < 70) {
    actions.push('address_engagement_issues');
    actions.push('provide_additional_training');
  }

  // Renewal proximity actions
  const renewalDate = new Date(customer.renewal_date);
  const daysToRenewal = Math.ceil((renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysToRenewal < 90) {
    actions.push('accelerate_renewal_discussion');
    actions.push('present_renewal_incentives');
  }

  return actions;
}

function calculateUrgency(customer: any, signalType: string, impactScore: number): 'immediate' | 'high' | 'medium' | 'low' {
  // Immediate action required
  if (impactScore > 8 && customer.account_value > 100000) {
    return 'immediate';
  }

  // High urgency
  if (impactScore > 6 || customer.account_value > 75000) {
    return 'high';
  }

  // Medium urgency  
  if (impactScore > 4 || customer.account_value > 25000) {
    return 'medium';
  }

  return 'low';
}

export async function GET() {
  // For testing, return example with Salesforce pricing change
  const testRequest = {
    competitorId: 'competitor-001',
    signalType: 'pricing_change' as const,
    filters: {}
  };

  const request = new NextRequest('http://localhost:3000/api/customers/affected-by-competitor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testRequest)
  });

  return POST(request);
}