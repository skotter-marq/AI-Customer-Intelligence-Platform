import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CSQueryRequest {
  action: 'search_customer' | 'get_interactions' | 'get_insights' | 'get_history' | 'quick_search' | 'get_context' | 'get_product_impact' | 'get_customers';
  query?: string;
  customer_id?: string;
  email?: string;
  phone?: string;
  ticket_id?: string;
  date_range?: {
    start: string;
    end: string;
  };
  limit?: number;
  include_insights?: boolean;
}

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  segment: string;
  status: 'active' | 'inactive' | 'prospect';
  created_at: string;
  last_interaction: string;
  total_interactions: number;
  satisfaction_score: number;
  tags: string[];
  custom_fields: Record<string, any>;
}

interface CustomerInteraction {
  id: string;
  customer_id: string;
  type: 'call' | 'email' | 'chat' | 'ticket' | 'meeting';
  channel: string;
  direction: 'inbound' | 'outbound';
  subject: string;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  agent_id?: string;
  agent_name?: string;
  resolution_time?: number;
  satisfaction_rating?: number;
  tags: string[];
  metadata: Record<string, any>;
}

interface CustomerInsight {
  id: string;
  customer_id: string;
  type: 'behavior' | 'preference' | 'risk' | 'opportunity' | 'issue';
  title: string;
  description: string;
  confidence: number;
  source: string;
  generated_at: string;
  expires_at?: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  recommendations: string[];
  metadata: Record<string, any>;
}

interface CustomerProductImpact {
  id: string;
  customer_id: string;
  product_update_id: string;
  jira_story_key: string;
  update_title: string;
  update_description: string;
  impact_level: 'low' | 'medium' | 'high';
  impact_type: 'bug_fix' | 'feature_enhancement' | 'new_feature' | 'performance_improvement';
  completion_date: string;
  published_at?: string;
  notification_sent: boolean;
  notification_channels: string[];
  notes?: string;
  status: 'pending_review' | 'approved' | 'published' | 'archived';
  priority: 'low' | 'medium' | 'high';
  labels: string[];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'quick_search';
    const query = searchParams.get('query') || '';
    const customer_id = searchParams.get('customer_id');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    switch (action) {
      case 'quick_search':
        return await quickSearch(query, limit);
      case 'get_customers':
        return await getCustomers(limit);
      case 'get_interactions':
        return await getCustomerInteractions(customer_id!, limit);
      case 'get_insights':
        return await getCustomerInsights(customer_id!);
      case 'get_context':
        return await getCustomerContext(customer_id!);
      case 'get_product_impact':
        return await getCustomerProductImpact(customer_id!, limit);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('CS Query GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: CSQueryRequest = await request.json();
    const { action, ...params } = body;
    
    switch (action) {
      case 'search_customer':
        return await searchCustomer(params);
      case 'get_customers':
        return await getCustomers(params.limit || 10);
      case 'get_interactions':
        return await getCustomerInteractions(params.customer_id!, params.limit || 10);
      case 'get_insights':
        return await getCustomerInsights(params.customer_id!);
      case 'get_history':
        return await getCustomerHistory(params.customer_id!, params.date_range);
      case 'quick_search':
        return await quickSearch(params.query!, params.limit || 10);
      case 'get_context':
        return await getCustomerContext(params.customer_id!);
      case 'get_product_impact':
        return await getCustomerProductImpact(params.customer_id!, params.limit || 10);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('CS Query POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getCustomers(limit: number = 10): Promise<NextResponse> {
  try {
    // Mock customer data - in production, this would query your customer database
    const mockCustomers: CustomerProfile[] = [
      {
        id: 'cust_001',
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+1-555-0123',
        company: 'Tech Corp',
        segment: 'Enterprise',
        status: 'active',
        created_at: '2023-06-15T10:00:00Z',
        last_interaction: '2024-01-15T10:30:00Z',
        total_interactions: 27,
        satisfaction_score: 4.2,
        tags: ['vip', 'enterprise', 'api-user'],
        custom_fields: {
          account_manager: 'Sarah Johnson',
          annual_revenue: 50000,
          support_tier: 'Premium'
        }
      },
      {
        id: 'cust_002',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        phone: '+1-555-0456',
        company: 'Innovation Inc',
        segment: 'SMB',
        status: 'active',
        created_at: '2023-08-22T14:30:00Z',
        last_interaction: '2024-01-14T14:20:00Z',
        total_interactions: 12,
        satisfaction_score: 4.5,
        tags: ['startup', 'growth-potential'],
        custom_fields: {
          account_manager: 'Mike Chen',
          annual_revenue: 15000,
          support_tier: 'Standard'
        }
      },
      {
        id: 'cust_003',
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        phone: '+1-555-0789',
        company: 'Global Solutions',
        segment: 'Enterprise',
        status: 'active',
        created_at: '2023-05-10T09:15:00Z',
        last_interaction: '2024-01-13T16:45:00Z',
        total_interactions: 43,
        satisfaction_score: 4.8,
        tags: ['enterprise', 'long-term', 'high-value'],
        custom_fields: {
          account_manager: 'Lisa Wang',
          annual_revenue: 125000,
          support_tier: 'Premium'
        }
      },
      {
        id: 'cust_004',
        name: 'Alice Brown',
        email: 'alice.brown@example.com',
        phone: '+1-555-0321',
        company: 'Startup Labs',
        segment: 'SMB',
        status: 'active',
        created_at: '2023-09-30T11:20:00Z',
        last_interaction: '2024-01-12T09:15:00Z',
        total_interactions: 8,
        satisfaction_score: 4.1,
        tags: ['startup', 'new-customer'],
        custom_fields: {
          account_manager: 'Tom Wilson',
          annual_revenue: 8000,
          support_tier: 'Standard'
        }
      },
      {
        id: 'cust_005',
        name: 'Charlie Davis',
        email: 'charlie.davis@example.com',
        phone: '+1-555-0654',
        company: 'Enterprise Co',
        segment: 'Enterprise',
        status: 'prospect',
        created_at: '2024-01-05T14:00:00Z',
        last_interaction: '2024-01-11T11:30:00Z',
        total_interactions: 3,
        satisfaction_score: 4.0,
        tags: ['prospect', 'enterprise', 'evaluation'],
        custom_fields: {
          account_manager: 'Sarah Johnson',
          annual_revenue: 0,
          support_tier: 'Trial'
        }
      }
    ];
    
    return NextResponse.json({
      success: true,
      customers: mockCustomers.slice(0, limit),
      total: mockCustomers.length,
      summary: {
        total_customers: mockCustomers.length,
        by_segment: {
          enterprise: mockCustomers.filter(c => c.segment === 'Enterprise').length,
          smb: mockCustomers.filter(c => c.segment === 'SMB').length
        },
        by_status: {
          active: mockCustomers.filter(c => c.status === 'active').length,
          inactive: mockCustomers.filter(c => c.status === 'inactive').length,
          prospect: mockCustomers.filter(c => c.status === 'prospect').length
        },
        avg_satisfaction: mockCustomers.reduce((sum, c) => sum + c.satisfaction_score, 0) / mockCustomers.length
      },
      execution_time: 52
    });
    
  } catch (error) {
    console.error('Error getting customers:', error);
    return NextResponse.json(
      { error: 'Failed to get customers' },
      { status: 500 }
    );
  }
}

async function quickSearch(query: string, limit: number = 10): Promise<NextResponse> {
  try {
    // Mock quick search results - in production, this would search across multiple data sources
    const mockResults = [
      {
        type: 'customer',
        id: 'cust_001',
        name: 'John Smith',
        email: 'john.smith@example.com',
        company: 'Tech Corp',
        match_score: 0.95,
        match_reason: 'Name match',
        last_interaction: '2024-01-15T10:30:00Z',
        status: 'active'
      },
      {
        type: 'customer',
        id: 'cust_002',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        company: 'Innovation Inc',
        match_score: 0.87,
        match_reason: 'Email match',
        last_interaction: '2024-01-14T14:20:00Z',
        status: 'active'
      },
      {
        type: 'interaction',
        id: 'int_001',
        customer_name: 'John Smith',
        subject: 'Login issues with API',
        status: 'resolved',
        created_at: '2024-01-15T09:00:00Z',
        match_score: 0.82,
        match_reason: 'Subject content match'
      }
    ];
    
    // Filter results based on query
    const filteredResults = mockResults.filter(result => 
      result.match_score > 0.7 && 
      (result.type === 'customer' ? 
        result.name?.toLowerCase().includes(query.toLowerCase()) ||
        result.email?.toLowerCase().includes(query.toLowerCase()) ||
        result.company?.toLowerCase().includes(query.toLowerCase()) :
        result.subject?.toLowerCase().includes(query.toLowerCase()) ||
        result.customer_name?.toLowerCase().includes(query.toLowerCase())
      )
    ).slice(0, limit);
    
    return NextResponse.json({
      success: true,
      query,
      results: filteredResults,
      total: filteredResults.length,
      execution_time: 145
    });
    
  } catch (error) {
    console.error('Error in quick search:', error);
    return NextResponse.json(
      { error: 'Failed to perform quick search' },
      { status: 500 }
    );
  }
}

async function searchCustomer(params: Partial<CSQueryRequest>): Promise<NextResponse> {
  try {
    const { query, email, phone, limit = 10 } = params;
    
    // Mock customer search - in production, this would query your customer database
    const mockCustomers: CustomerProfile[] = [
      {
        id: 'cust_001',
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+1-555-0123',
        company: 'Tech Corp',
        segment: 'Enterprise',
        status: 'active',
        created_at: '2023-06-15T10:00:00Z',
        last_interaction: '2024-01-15T10:30:00Z',
        total_interactions: 27,
        satisfaction_score: 4.2,
        tags: ['vip', 'enterprise', 'api-user'],
        custom_fields: {
          account_manager: 'Sarah Johnson',
          annual_revenue: 50000,
          support_tier: 'Premium'
        }
      },
      {
        id: 'cust_002',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        phone: '+1-555-0456',
        company: 'Innovation Inc',
        segment: 'SMB',
        status: 'active',
        created_at: '2023-08-22T14:30:00Z',
        last_interaction: '2024-01-14T14:20:00Z',
        total_interactions: 12,
        satisfaction_score: 4.5,
        tags: ['startup', 'growth-potential'],
        custom_fields: {
          account_manager: 'Mike Chen',
          annual_revenue: 15000,
          support_tier: 'Standard'
        }
      }
    ];
    
    // Filter customers based on search criteria
    let filteredCustomers = mockCustomers;
    
    if (query) {
      filteredCustomers = filteredCustomers.filter(customer =>
        customer.name.toLowerCase().includes(query.toLowerCase()) ||
        customer.email.toLowerCase().includes(query.toLowerCase()) ||
        customer.company?.toLowerCase().includes(query.toLowerCase()) ||
        customer.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    if (email) {
      filteredCustomers = filteredCustomers.filter(customer =>
        customer.email.toLowerCase().includes(email.toLowerCase())
      );
    }
    
    if (phone) {
      filteredCustomers = filteredCustomers.filter(customer =>
        customer.phone?.includes(phone)
      );
    }
    
    return NextResponse.json({
      success: true,
      customers: filteredCustomers.slice(0, limit),
      total: filteredCustomers.length,
      search_criteria: { query, email, phone },
      execution_time: 89
    });
    
  } catch (error) {
    console.error('Error searching customers:', error);
    return NextResponse.json(
      { error: 'Failed to search customers' },
      { status: 500 }
    );
  }
}

async function getCustomerInteractions(customer_id: string, limit: number = 10): Promise<NextResponse> {
  try {
    // Mock interaction data - in production, this would query your interaction database
    const mockInteractions: CustomerInteraction[] = [
      {
        id: 'int_001',
        customer_id,
        type: 'ticket',
        channel: 'email',
        direction: 'inbound',
        subject: 'API Rate Limiting Issues',
        summary: 'Customer experiencing rate limiting on API calls during peak hours',
        sentiment: 'negative',
        priority: 'high',
        status: 'resolved',
        created_at: '2024-01-15T09:00:00Z',
        updated_at: '2024-01-15T15:30:00Z',
        agent_id: 'agent_001',
        agent_name: 'Sarah Johnson',
        resolution_time: 390,
        satisfaction_rating: 4,
        tags: ['api', 'rate-limiting', 'technical'],
        metadata: {
          api_endpoint: '/v1/data/customers',
          error_code: 'RATE_LIMIT_EXCEEDED',
          resolution_type: 'configuration_change'
        }
      },
      {
        id: 'int_002',
        customer_id,
        type: 'call',
        channel: 'phone',
        direction: 'outbound',
        subject: 'Follow-up on API Integration',
        summary: 'Proactive call to ensure API integration is working smoothly',
        sentiment: 'positive',
        priority: 'medium',
        status: 'closed',
        created_at: '2024-01-12T14:00:00Z',
        updated_at: '2024-01-12T14:30:00Z',
        agent_id: 'agent_002',
        agent_name: 'Mike Chen',
        resolution_time: 30,
        satisfaction_rating: 5,
        tags: ['follow-up', 'api', 'proactive'],
        metadata: {
          call_duration: 1800,
          call_outcome: 'successful',
          next_action: 'schedule_review'
        }
      },
      {
        id: 'int_003',
        customer_id,
        type: 'chat',
        channel: 'live_chat',
        direction: 'inbound',
        subject: 'Billing Question',
        summary: 'Customer asked about upcoming invoice and billing cycle',
        sentiment: 'neutral',
        priority: 'low',
        status: 'resolved',
        created_at: '2024-01-10T11:15:00Z',
        updated_at: '2024-01-10T11:45:00Z',
        agent_id: 'agent_003',
        agent_name: 'Lisa Wang',
        resolution_time: 30,
        satisfaction_rating: 4,
        tags: ['billing', 'invoice', 'routine'],
        metadata: {
          chat_duration: 1800,
          issue_type: 'billing_inquiry',
          resolution_type: 'information_provided'
        }
      }
    ];
    
    return NextResponse.json({
      success: true,
      customer_id,
      interactions: mockInteractions.slice(0, limit),
      total: mockInteractions.length,
      summary: {
        total_interactions: mockInteractions.length,
        by_type: {
          ticket: mockInteractions.filter(i => i.type === 'ticket').length,
          call: mockInteractions.filter(i => i.type === 'call').length,
          chat: mockInteractions.filter(i => i.type === 'chat').length,
          email: mockInteractions.filter(i => i.type === 'email').length
        },
        by_status: {
          open: mockInteractions.filter(i => i.status === 'open').length,
          in_progress: mockInteractions.filter(i => i.status === 'in_progress').length,
          resolved: mockInteractions.filter(i => i.status === 'resolved').length,
          closed: mockInteractions.filter(i => i.status === 'closed').length
        },
        avg_satisfaction: 4.3,
        avg_resolution_time: 150
      }
    });
    
  } catch (error) {
    console.error('Error getting customer interactions:', error);
    return NextResponse.json(
      { error: 'Failed to get customer interactions' },
      { status: 500 }
    );
  }
}

async function getCustomerInsights(customer_id: string): Promise<NextResponse> {
  try {
    // Mock AI-generated insights - in production, this would query your AI insights database
    const mockInsights: CustomerInsight[] = [
      {
        id: 'insight_001',
        customer_id,
        type: 'risk',
        title: 'Potential Churn Risk',
        description: 'Customer has experienced multiple technical issues in the past month, satisfaction scores declining',
        confidence: 0.78,
        source: 'interaction_analysis',
        generated_at: '2024-01-15T16:00:00Z',
        expires_at: '2024-02-15T16:00:00Z',
        actionable: true,
        priority: 'high',
        recommendations: [
          'Schedule proactive call with account manager',
          'Review recent technical issues and provide compensation',
          'Offer premium support tier trial'
        ],
        metadata: {
          satisfaction_trend: 'declining',
          issue_frequency: 'increasing',
          last_positive_interaction: '2024-01-05T10:00:00Z'
        }
      },
      {
        id: 'insight_002',
        customer_id,
        type: 'opportunity',
        title: 'Upsell Opportunity',
        description: 'Customer is approaching API rate limits and may benefit from higher tier plan',
        confidence: 0.85,
        source: 'usage_analysis',
        generated_at: '2024-01-14T12:00:00Z',
        expires_at: '2024-02-14T12:00:00Z',
        actionable: true,
        priority: 'medium',
        recommendations: [
          'Present premium plan options',
          'Offer usage analytics dashboard',
          'Schedule technical consultation'
        ],
        metadata: {
          current_usage: '85%',
          usage_trend: 'increasing',
          potential_revenue: 25000
        }
      },
      {
        id: 'insight_003',
        customer_id,
        type: 'behavior',
        title: 'Peak Usage Pattern',
        description: 'Customer consistently uses API during business hours (9-5 EST), rarely on weekends',
        confidence: 0.92,
        source: 'usage_pattern_analysis',
        generated_at: '2024-01-13T08:00:00Z',
        actionable: false,
        priority: 'low',
        recommendations: [
          'Schedule maintenance during off-peak hours',
          'Provide advance notice for any business hour disruptions'
        ],
        metadata: {
          peak_hours: '09:00-17:00 EST',
          weekend_usage: '5%',
          timezone: 'America/New_York'
        }
      }
    ];
    
    return NextResponse.json({
      success: true,
      customer_id,
      insights: mockInsights,
      total: mockInsights.length,
      summary: {
        by_type: {
          risk: mockInsights.filter(i => i.type === 'risk').length,
          opportunity: mockInsights.filter(i => i.type === 'opportunity').length,
          behavior: mockInsights.filter(i => i.type === 'behavior').length,
          preference: mockInsights.filter(i => i.type === 'preference').length,
          issue: mockInsights.filter(i => i.type === 'issue').length
        },
        by_priority: {
          high: mockInsights.filter(i => i.priority === 'high').length,
          medium: mockInsights.filter(i => i.priority === 'medium').length,
          low: mockInsights.filter(i => i.priority === 'low').length
        },
        actionable_insights: mockInsights.filter(i => i.actionable).length,
        avg_confidence: 0.85
      }
    });
    
  } catch (error) {
    console.error('Error getting customer insights:', error);
    return NextResponse.json(
      { error: 'Failed to get customer insights' },
      { status: 500 }
    );
  }
}

async function getCustomerHistory(customer_id: string, date_range?: { start: string; end: string }): Promise<NextResponse> {
  try {
    // Mock historical data - in production, this would query historical databases
    const mockHistory = {
      customer_id,
      date_range: date_range || { start: '2024-01-01', end: '2024-01-31' },
      timeline: [
        {
          date: '2024-01-15',
          events: [
            {
              type: 'interaction',
              time: '09:00',
              title: 'Ticket Created',
              description: 'API Rate Limiting Issues',
              priority: 'high',
              agent: 'Sarah Johnson'
            },
            {
              type: 'interaction',
              time: '15:30',
              title: 'Ticket Resolved',
              description: 'Configuration updated, rate limits increased',
              priority: 'high',
              agent: 'Sarah Johnson'
            }
          ]
        },
        {
          date: '2024-01-12',
          events: [
            {
              type: 'interaction',
              time: '14:00',
              title: 'Proactive Call',
              description: 'Follow-up on API Integration',
              priority: 'medium',
              agent: 'Mike Chen'
            }
          ]
        },
        {
          date: '2024-01-10',
          events: [
            {
              type: 'interaction',
              time: '11:15',
              title: 'Live Chat',
              description: 'Billing Question',
              priority: 'low',
              agent: 'Lisa Wang'
            }
          ]
        }
      ],
      metrics: {
        total_interactions: 3,
        avg_resolution_time: 150,
        satisfaction_score: 4.3,
        escalation_rate: 0.1
      }
    };
    
    return NextResponse.json({
      success: true,
      history: mockHistory
    });
    
  } catch (error) {
    console.error('Error getting customer history:', error);
    return NextResponse.json(
      { error: 'Failed to get customer history' },
      { status: 500 }
    );
  }
}

async function getCustomerContext(customer_id: string): Promise<NextResponse> {
  try {
    // Mock contextual information - in production, this would aggregate data from multiple sources
    const mockContext = {
      customer_id,
      profile: {
        name: 'John Smith',
        email: 'john.smith@example.com',
        company: 'Tech Corp',
        segment: 'Enterprise',
        status: 'active',
        account_manager: 'Sarah Johnson',
        support_tier: 'Premium'
      },
      current_status: {
        active_tickets: 0,
        last_interaction: '2024-01-15T15:30:00Z',
        satisfaction_score: 4.2,
        health_score: 'good',
        risk_level: 'medium'
      },
      quick_stats: {
        total_interactions: 27,
        avg_resolution_time: 150,
        escalation_rate: 0.1,
        satisfaction_trend: 'stable'
      },
      recent_activity: [
        {
          type: 'ticket_resolved',
          title: 'API Rate Limiting Issues',
          date: '2024-01-15T15:30:00Z',
          agent: 'Sarah Johnson'
        },
        {
          type: 'call_completed',
          title: 'Follow-up on API Integration',
          date: '2024-01-12T14:30:00Z',
          agent: 'Mike Chen'
        }
      ],
      ai_insights: [
        {
          type: 'risk',
          title: 'Potential Churn Risk',
          confidence: 0.78,
          priority: 'high'
        },
        {
          type: 'opportunity',
          title: 'Upsell Opportunity',
          confidence: 0.85,
          priority: 'medium'
        }
      ],
      suggested_actions: [
        'Schedule proactive call with account manager',
        'Review recent technical issues',
        'Present premium plan options'
      ]
    };
    
    return NextResponse.json({
      success: true,
      context: mockContext
    });
    
  } catch (error) {
    console.error('Error getting customer context:', error);
    return NextResponse.json(
      { error: 'Failed to get customer context' },
      { status: 500 }
    );
  }
}

async function getCustomerProductImpact(customer_id: string, limit: number = 10): Promise<NextResponse> {
  try {
    // Mock product impact data - in production, this would query the customer_impact_tracking table
    const mockProductImpacts: CustomerProductImpact[] = [
      {
        id: 'impact_001',
        customer_id,
        product_update_id: 'update_001',
        jira_story_key: 'PROJ-123',
        update_title: 'Fix dashboard loading performance',
        update_description: 'Resolved slow loading times in customer dashboard - reduces page load time by 70%',
        impact_level: 'high',
        impact_type: 'performance_improvement',
        completion_date: '2024-01-15T16:00:00Z',
        published_at: '2024-01-15T18:00:00Z',
        notification_sent: true,
        notification_channels: ['email', 'in_app'],
        notes: 'Customer previously reported slow dashboard performance in ticket #12345',
        status: 'published',
        priority: 'high',
        labels: ['performance', 'dashboard', 'customer-impact']
      },
      {
        id: 'impact_002',
        customer_id,
        product_update_id: 'update_002',
        jira_story_key: 'PROJ-124',
        update_title: 'Add export functionality to reports',
        update_description: 'Customers can now export reports to Excel and CSV formats',
        impact_level: 'medium',
        impact_type: 'feature_enhancement',
        completion_date: '2024-01-14T14:30:00Z',
        published_at: '2024-01-14T16:00:00Z',
        notification_sent: true,
        notification_channels: ['email', 'changelog'],
        notes: 'Customer requested this feature in multiple support tickets',
        status: 'published',
        priority: 'medium',
        labels: ['export', 'reports', 'customer-request']
      },
      {
        id: 'impact_003',
        customer_id,
        product_update_id: 'update_003',
        jira_story_key: 'PROJ-125',
        update_title: 'Implement real-time notifications',
        update_description: 'Added email and Slack notifications for threshold alerts',
        impact_level: 'high',
        impact_type: 'new_feature',
        completion_date: '2024-01-13T10:00:00Z',
        published_at: '2024-01-13T12:00:00Z',
        notification_sent: true,
        notification_channels: ['email', 'slack', 'in_app'],
        notes: 'Critical feature for customer\'s monitoring workflow',
        status: 'published',
        priority: 'high',
        labels: ['notifications', 'alerts', 'integrations']
      },
      {
        id: 'impact_004',
        customer_id,
        product_update_id: 'update_004',
        jira_story_key: 'PROJ-126',
        update_title: 'API rate limit optimization',
        update_description: 'Increased API rate limits for enterprise customers by 50%',
        impact_level: 'high',
        impact_type: 'bug_fix',
        completion_date: '2024-01-12T09:00:00Z',
        published_at: '2024-01-12T11:00:00Z',
        notification_sent: true,
        notification_channels: ['email', 'in_app'],
        notes: 'Directly addresses customer\'s API throttling issues',
        status: 'published',
        priority: 'high',
        labels: ['api', 'rate-limiting', 'enterprise']
      }
    ];
    
    // Sort by completion date (most recent first)
    const sortedImpacts = mockProductImpacts.sort((a, b) => 
      new Date(b.completion_date).getTime() - new Date(a.completion_date).getTime()
    );
    
    return NextResponse.json({
      success: true,
      customer_id,
      product_impacts: sortedImpacts.slice(0, limit),
      total: sortedImpacts.length,
      summary: {
        total_impacts: sortedImpacts.length,
        by_impact_level: {
          high: sortedImpacts.filter(i => i.impact_level === 'high').length,
          medium: sortedImpacts.filter(i => i.impact_level === 'medium').length,
          low: sortedImpacts.filter(i => i.impact_level === 'low').length
        },
        by_impact_type: {
          bug_fix: sortedImpacts.filter(i => i.impact_type === 'bug_fix').length,
          feature_enhancement: sortedImpacts.filter(i => i.impact_type === 'feature_enhancement').length,
          new_feature: sortedImpacts.filter(i => i.impact_type === 'new_feature').length,
          performance_improvement: sortedImpacts.filter(i => i.impact_type === 'performance_improvement').length
        },
        notifications_sent: sortedImpacts.filter(i => i.notification_sent).length,
        recent_impacts: sortedImpacts.filter(i => {
          const completionDate = new Date(i.completion_date);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return completionDate > thirtyDaysAgo;
        }).length
      },
      execution_time: 78
    });
    
  } catch (error) {
    console.error('Error getting customer product impact:', error);
    return NextResponse.json(
      { error: 'Failed to get customer product impact' },
      { status: 500 }
    );
  }
}