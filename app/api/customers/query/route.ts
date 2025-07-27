import { NextRequest, NextResponse } from 'next/server';

interface CustomerQueryFilters {
  segment?: string;
  status?: string[];
  tier?: string[];
  excludeTags?: string[];
  healthThreshold?: number;
  daysInactive?: number;
  renewalDueInDays?: number;
}

interface CustomerQueryRequest {
  filters: CustomerQueryFilters;
  include?: string[];
  limit?: number;
}

// Mock customer data (in real app, this would be from your database)
const mockCustomers = [
  {
    id: 'customer-001',
    company_name: 'MarketingCorp',
    segment: 'enterprise',
    status: 'active',
    tier: 'growth',
    tags: ['high-value', 'tech'],
    health_score: 85,
    last_activity_days: 5,
    renewal_date: '2024-03-15',
    primary_contact: {
      id: 'contact-001',
      first_name: 'John',
      last_name: 'Smith',
      email: 'john.smith@marketingcorp.com',
      role: 'VP Marketing'
    },
    contacts: [
      {
        id: 'contact-001',
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@marketingcorp.com',
        role: 'VP Marketing'
      },
      {
        id: 'contact-002',
        first_name: 'Sarah',
        last_name: 'Johnson',
        email: 'sarah.johnson@marketingcorp.com',
        role: 'Marketing Manager'
      }
    ],
    engagement_score: 78,
    account_tier: 'growth',
    industry: 'technology',
    created_date: '2023-06-15T10:00:00Z',
    last_interaction: '2024-01-10T14:30:00Z'
  },
  {
    id: 'customer-002',
    company_name: 'TechStart Inc',
    segment: 'startup',
    status: 'active',
    tier: 'starter',
    tags: ['startup', 'tech'],
    health_score: 92,
    last_activity_days: 2,
    renewal_date: '2024-04-20',
    primary_contact: {
      id: 'contact-003',
      first_name: 'Lisa',
      last_name: 'Wong',
      email: 'lisa.wong@techstart.com',
      role: 'CEO'
    },
    contacts: [
      {
        id: 'contact-003',
        first_name: 'Lisa',
        last_name: 'Wong',
        email: 'lisa.wong@techstart.com',
        role: 'CEO'
      }
    ],
    engagement_score: 95,
    account_tier: 'starter',
    industry: 'technology',
    created_date: '2023-08-20T09:15:00Z',
    last_interaction: '2024-01-12T16:45:00Z'
  },
  {
    id: 'customer-003',
    company_name: 'GlobalCorp',
    segment: 'enterprise',
    status: 'at_risk',
    tier: 'enterprise',
    tags: ['enterprise', 'manufacturing'],
    health_score: 45,
    last_activity_days: 45,
    renewal_date: '2024-02-28',
    primary_contact: {
      id: 'contact-004',
      first_name: 'David',
      last_name: 'Brown',
      email: 'david.brown@globalcorp.com',
      role: 'Director of Operations'
    },
    contacts: [
      {
        id: 'contact-004',
        first_name: 'David',
        last_name: 'Brown',
        email: 'david.brown@globalcorp.com',
        role: 'Director of Operations'
      },
      {
        id: 'contact-005',
        first_name: 'Emma',
        last_name: 'Davis',
        email: 'emma.davis@globalcorp.com',
        role: 'Operations Manager'
      }
    ],
    engagement_score: 32,
    account_tier: 'enterprise',
    industry: 'manufacturing',
    created_date: '2023-01-10T08:00:00Z',
    last_interaction: '2023-11-28T11:20:00Z'
  },
  {
    id: 'customer-004',
    company_name: 'InnovateTech',
    segment: 'startup',
    status: 'onboarding',
    tier: 'starter',
    tags: ['new', 'tech'],
    health_score: 88,
    last_activity_days: 1,
    renewal_date: '2024-12-01',
    primary_contact: {
      id: 'contact-006',
      first_name: 'Anna',
      last_name: 'Taylor',
      email: 'anna.taylor@innovatetech.com',
      role: 'Founder'
    },
    contacts: [
      {
        id: 'contact-006',
        first_name: 'Anna',
        last_name: 'Taylor',
        email: 'anna.taylor@innovatetech.com',
        role: 'Founder'
      }
    ],
    engagement_score: 90,
    account_tier: 'starter',
    industry: 'technology',
    created_date: '2024-01-01T10:00:00Z',
    last_interaction: '2024-01-11T09:30:00Z'
  },
  {
    id: 'customer-005',
    company_name: 'FinancePlus',
    segment: 'growth',
    status: 'active',
    tier: 'growth',
    tags: ['finance', 'regulated'],
    health_score: 65,
    last_activity_days: 14,
    renewal_date: '2024-05-15',
    primary_contact: {
      id: 'contact-007',
      first_name: 'Robert',
      last_name: 'Miller',
      email: 'robert.miller@financeplus.com',
      role: 'CFO'
    },
    contacts: [
      {
        id: 'contact-007',
        first_name: 'Robert',
        last_name: 'Miller',
        email: 'robert.miller@financeplus.com',
        role: 'CFO'
      },
      {
        id: 'contact-008',
        first_name: 'Jennifer',
        last_name: 'Garcia',
        email: 'jennifer.garcia@financeplus.com',
        role: 'Finance Manager'
      }
    ],
    engagement_score: 58,
    account_tier: 'growth',
    industry: 'finance',
    created_date: '2023-03-20T14:15:00Z',
    last_interaction: '2023-12-28T13:45:00Z'
  }
];

function filterCustomers(customers: any[], filters: CustomerQueryFilters) {
  return customers.filter(customer => {
    // Filter by segment
    if (filters.segment && customer.segment !== filters.segment) {
      return false;
    }

    // Filter by status (array of statuses)
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(customer.status)) {
        return false;
      }
    }

    // Filter by tier (array of tiers)
    if (filters.tier && filters.tier.length > 0) {
      if (!filters.tier.includes(customer.tier)) {
        return false;
      }
    }

    // Exclude customers with certain tags
    if (filters.excludeTags && filters.excludeTags.length > 0) {
      const hasExcludedTag = customer.tags.some((tag: string) => 
        filters.excludeTags!.includes(tag)
      );
      if (hasExcludedTag) {
        return false;
      }
    }

    // Filter by health score threshold
    if (filters.healthThreshold !== undefined) {
      if (customer.health_score >= filters.healthThreshold) {
        return false; // For health check, we want customers BELOW threshold
      }
    }

    // Filter by days inactive
    if (filters.daysInactive !== undefined) {
      if (customer.last_activity_days < filters.daysInactive) {
        return false; // For health check, we want customers inactive for MORE than X days
      }
    }

    // Filter by renewal due in X days
    if (filters.renewalDueInDays !== undefined) {
      const renewalDate = new Date(customer.renewal_date);
      const today = new Date();
      const daysUntilRenewal = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      
      if (daysUntilRenewal > filters.renewalDueInDays || daysUntilRenewal < 0) {
        return false; // Only include customers with renewal due within X days
      }
    }

    return true;
  });
}

function includeFields(customers: any[], include: string[] = []) {
  if (include.length === 0) {
    return customers;
  }

  return customers.map(customer => {
    const result: any = {
      id: customer.id,
      company_name: customer.company_name,
      status: customer.status,
      tier: customer.tier
    };

    // Add requested fields
    if (include.includes('contacts')) {
      result.contacts = customer.contacts;
      result.primary_contact = customer.primary_contact;
    }

    if (include.includes('renewal_date')) {
      result.renewal_date = customer.renewal_date;
    }

    if (include.includes('engagement_score')) {
      result.engagement_score = customer.engagement_score;
      result.health_score = customer.health_score;
    }

    if (include.includes('account_tier')) {
      result.account_tier = customer.account_tier;
    }

    if (include.includes('industry')) {
      result.industry = customer.industry;
    }

    if (include.includes('tags')) {
      result.tags = customer.tags;
    }

    if (include.includes('last_interaction')) {
      result.last_interaction = customer.last_interaction;
      result.last_activity_days = customer.last_activity_days;
    }

    return result;
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: CustomerQueryRequest = await request.json();
    const { filters, include = [], limit = 100 } = body;

    console.log('Customer query request:', { filters, include, limit });

    // Filter customers based on criteria
    let filteredCustomers = filterCustomers(mockCustomers, filters);

    // Apply limit
    if (limit > 0) {
      filteredCustomers = filteredCustomers.slice(0, limit);
    }

    // Include only requested fields
    const result = includeFields(filteredCustomers, include);

    console.log(`Found ${result.length} customers matching criteria`);

    return NextResponse.json({
      success: true,
      data: result,
      total: result.length,
      filters_applied: filters
    });

  } catch (error) {
    console.error('Error in customer query API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // For testing purposes, return all customers
  const result = includeFields(mockCustomers, ['contacts', 'renewal_date', 'engagement_score', 'account_tier']);
  
  return NextResponse.json({
    success: true,
    data: result,
    total: result.length
  });
}