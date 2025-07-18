import { NextResponse } from 'next/server';

// Quick CS lookup API for instant searches and shortcuts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const query = searchParams.get('query');
    
    switch (action) {
      case 'autocomplete':
        return await getAutocompleteResults(query || '');
      case 'recent':
        return await getRecentCustomers();
      case 'favorites':
        return await getFavoriteCustomers();
      case 'alerts':
        return await getCustomerAlerts();
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('CS Quick API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getAutocompleteResults(query: string) {
  // Mock autocomplete suggestions
  const suggestions = [
    { type: 'customer', value: 'John Smith', id: 'cust_001' },
    { type: 'customer', value: 'Jane Doe', id: 'cust_002' },
    { type: 'company', value: 'Tech Corp', id: 'comp_001' },
    { type: 'company', value: 'Innovation Inc', id: 'comp_002' },
    { type: 'email', value: 'john.smith@example.com', id: 'cust_001' },
    { type: 'email', value: 'jane.doe@example.com', id: 'cust_002' },
    { type: 'tag', value: 'vip', id: 'tag_001' },
    { type: 'tag', value: 'enterprise', id: 'tag_002' },
    { type: 'status', value: 'active', id: 'status_001' },
    { type: 'status', value: 'at-risk', id: 'status_002' }
  ];
  
  const filtered = suggestions.filter(s => 
    s.value.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);
  
  return NextResponse.json({
    success: true,
    suggestions: filtered,
    query
  });
}

async function getRecentCustomers() {
  // Mock recent customers
  const recentCustomers = [
    {
      id: 'cust_001',
      name: 'John Smith',
      email: 'john.smith@example.com',
      company: 'Tech Corp',
      last_interaction: '2024-01-15T15:30:00Z',
      status: 'active',
      priority: 'high'
    },
    {
      id: 'cust_002',
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      company: 'Innovation Inc',
      last_interaction: '2024-01-14T14:20:00Z',
      status: 'active',
      priority: 'medium'
    },
    {
      id: 'cust_003',
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      company: 'StartupXYZ',
      last_interaction: '2024-01-13T11:45:00Z',
      status: 'prospect',
      priority: 'low'
    }
  ];
  
  return NextResponse.json({
    success: true,
    customers: recentCustomers
  });
}

async function getFavoriteCustomers() {
  // Mock favorite customers
  const favoriteCustomers = [
    {
      id: 'cust_001',
      name: 'John Smith',
      email: 'john.smith@example.com',
      company: 'Tech Corp',
      reason: 'High-value client',
      tags: ['vip', 'enterprise'],
      satisfaction_score: 4.8
    },
    {
      id: 'cust_004',
      name: 'Alice Wilson',
      email: 'alice.wilson@example.com',
      company: 'Global Solutions',
      reason: 'Long-term partnership',
      tags: ['partner', 'enterprise'],
      satisfaction_score: 4.9
    }
  ];
  
  return NextResponse.json({
    success: true,
    customers: favoriteCustomers
  });
}

async function getCustomerAlerts() {
  // Mock customer alerts
  const alerts = [
    {
      id: 'alert_001',
      customer_id: 'cust_001',
      customer_name: 'John Smith',
      type: 'churn_risk',
      severity: 'high',
      message: 'Customer satisfaction has dropped below 3.5',
      created_at: '2024-01-15T16:00:00Z',
      actionable: true
    },
    {
      id: 'alert_002',
      customer_id: 'cust_005',
      customer_name: 'Sarah Davis',
      type: 'payment_overdue',
      severity: 'medium',
      message: 'Payment overdue by 15 days',
      created_at: '2024-01-15T14:30:00Z',
      actionable: true
    },
    {
      id: 'alert_003',
      customer_id: 'cust_006',
      customer_name: 'Mike Brown',
      type: 'usage_spike',
      severity: 'low',
      message: 'API usage increased by 300% this week',
      created_at: '2024-01-15T12:00:00Z',
      actionable: false
    }
  ];
  
  return NextResponse.json({
    success: true,
    alerts,
    total: alerts.length
  });
}