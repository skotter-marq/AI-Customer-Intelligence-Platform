import { NextRequest, NextResponse } from 'next/server';

interface HealthCheckRequest {
  healthThreshold?: number;
  daysInactive?: number;
  filters?: {
    segment?: string;
    tier?: string[];
    excludeTags?: string[];
  };
}

// This would typically come from your database
// For now, using the same mock data but filtered for health concerns
const mockCustomers = [
  {
    id: 'customer-001',
    company_name: 'MarketingCorp',
    health_score: 85,
    last_activity_days: 5,
    tier: 'growth',
    segment: 'enterprise',
    tags: ['high-value', 'tech'],
    primary_contact: {
      first_name: 'John',
      last_name: 'Smith',
      email: 'john.smith@marketingcorp.com'
    },
    engagement_metrics: {
      login_frequency: 'daily',
      feature_adoption: 0.8,
      support_tickets: 1
    }
  },
  {
    id: 'customer-003',
    company_name: 'GlobalCorp',
    health_score: 45, // Below threshold
    last_activity_days: 45, // Inactive
    tier: 'enterprise',
    segment: 'enterprise',
    tags: ['enterprise', 'manufacturing'],
    primary_contact: {
      first_name: 'David',
      last_name: 'Brown',
      email: 'david.brown@globalcorp.com'
    },
    engagement_metrics: {
      login_frequency: 'monthly',
      feature_adoption: 0.3,
      support_tickets: 8
    },
    risk_factors: [
      'low_engagement',
      'multiple_support_tickets',
      'infrequent_logins'
    ]
  },
  {
    id: 'customer-005',
    company_name: 'FinancePlus',
    health_score: 65, // Moderate risk
    last_activity_days: 14,
    tier: 'growth',
    segment: 'growth',
    tags: ['finance', 'regulated'],
    primary_contact: {
      first_name: 'Robert',
      last_name: 'Miller',
      email: 'robert.miller@financeplus.com'
    },
    engagement_metrics: {
      login_frequency: 'weekly',
      feature_adoption: 0.5,
      support_tickets: 3
    },
    risk_factors: [
      'declining_usage',
      'moderate_engagement'
    ]
  },
  {
    id: 'customer-006',
    company_name: 'RetailChain Ltd',
    health_score: 35, // High risk
    last_activity_days: 60,
    tier: 'growth',
    segment: 'retail',
    tags: ['retail', 'seasonal'],
    primary_contact: {
      first_name: 'Maria',
      last_name: 'Rodriguez',
      email: 'maria.rodriguez@retailchain.com'
    },
    engagement_metrics: {
      login_frequency: 'rarely',
      feature_adoption: 0.2,
      support_tickets: 12
    },
    risk_factors: [
      'very_low_engagement',
      'excessive_support_tickets',
      'long_periods_inactive',
      'seasonal_business_impact'
    ]
  }
];

export async function POST(request: NextRequest) {
  try {
    const body: HealthCheckRequest = await request.json();
    const { 
      healthThreshold = 70, 
      daysInactive = 30, 
      filters = {} 
    } = body;

    console.log('Health check request:', { healthThreshold, daysInactive, filters });

    // Filter customers based on health criteria
    let atRiskCustomers = mockCustomers.filter(customer => {
      // Must meet health threshold criteria
      const isUnhealthy = customer.health_score < healthThreshold;
      const isInactive = customer.last_activity_days > daysInactive;
      
      if (!isUnhealthy && !isInactive) {
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

      if (filters.excludeTags && filters.excludeTags.length > 0) {
        const hasExcludedTag = customer.tags.some(tag => 
          filters.excludeTags!.includes(tag)
        );
        if (hasExcludedTag) {
          return false;
        }
      }

      return true;
    });

    // Enrich with health insights
    const enrichedCustomers = atRiskCustomers.map(customer => ({
      ...customer,
      health_status: customer.health_score < 40 ? 'critical' : 
                   customer.health_score < 60 ? 'at_risk' : 'needs_attention',
      recommended_actions: generateRecommendedActions(customer),
      priority: calculatePriority(customer)
    }));

    // Sort by priority (critical first)
    enrichedCustomers.sort((a, b) => {
      const priorityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
      return priorityOrder[b.priority as keyof typeof priorityOrder] - 
             priorityOrder[a.priority as keyof typeof priorityOrder];
    });

    console.log(`Found ${enrichedCustomers.length} at-risk customers`);

    return NextResponse.json({
      success: true,
      data: enrichedCustomers,
      total: enrichedCustomers.length,
      summary: {
        critical: enrichedCustomers.filter(c => c.health_status === 'critical').length,
        at_risk: enrichedCustomers.filter(c => c.health_status === 'at_risk').length,
        needs_attention: enrichedCustomers.filter(c => c.health_status === 'needs_attention').length
      },
      criteria: {
        healthThreshold,
        daysInactive,
        filters
      }
    });

  } catch (error) {
    console.error('Error in health check API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateRecommendedActions(customer: any): string[] {
  const actions: string[] = [];

  if (customer.health_score < 40) {
    actions.push('immediate_human_intervention');
    actions.push('schedule_urgent_call');
  }

  if (customer.last_activity_days > 60) {
    actions.push('re_engagement_campaign');
    actions.push('check_technical_issues');
  }

  if (customer.engagement_metrics.support_tickets > 5) {
    actions.push('review_support_history');
    actions.push('product_training_offer');
  }

  if (customer.engagement_metrics.feature_adoption < 0.4) {
    actions.push('feature_adoption_campaign');
    actions.push('onboarding_review');
  }

  // Default action if no specific issues identified
  if (actions.length === 0) {
    actions.push('health_check_call');
    actions.push('send_engagement_survey');
  }

  return actions;
}

function calculatePriority(customer: any): string {
  let score = 0;

  // Health score impact
  if (customer.health_score < 30) score += 3;
  else if (customer.health_score < 50) score += 2;
  else score += 1;

  // Tier impact (enterprise customers are higher priority)
  if (customer.tier === 'enterprise') score += 2;
  else if (customer.tier === 'growth') score += 1;

  // Activity impact
  if (customer.last_activity_days > 90) score += 2;
  else if (customer.last_activity_days > 60) score += 1;

  // Support ticket impact
  if (customer.engagement_metrics.support_tickets > 10) score += 2;
  else if (customer.engagement_metrics.support_tickets > 5) score += 1;

  if (score >= 7) return 'critical';
  if (score >= 5) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

export async function GET() {
  // For testing, return health check with default parameters
  const defaultRequest = {
    healthThreshold: 70,
    daysInactive: 30,
    filters: {}
  };

  const request = new NextRequest('http://localhost:3000/api/customers/health-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(defaultRequest)
  });

  return POST(request);
}