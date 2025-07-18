import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const contentType = searchParams.get('contentType');
    const category = searchParams.get('category');
    const audience = searchParams.get('audience');
    const timeRange = searchParams.get('timeRange');

    // Mock data for now - in production, this would come from Supabase
    const mockEntries = [
      {
        id: 'entry_001',
        content_title: 'New Dashboard Analytics Feature',
        generated_content: 'We\'ve launched a comprehensive analytics dashboard that provides real-time insights into your product usage. This new feature includes interactive charts, customizable filters, and automated reporting capabilities.',
        content_type: 'feature_release',
        target_audience: 'customers',
        status: 'published',
        quality_score: 0.92,
        published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        tldr_summary: 'New analytics dashboard with real-time insights and customizable reports',
        tldr_bullet_points: ['Interactive charts and graphs', 'Customizable date ranges and filters', 'Automated report generation', 'Export data to CSV/PDF'],
        update_category: 'feature_update',
        importance_score: 0.8,
        breaking_changes: false,
        tags: ['analytics', 'dashboard', 'reporting'],
        is_public: true,
        public_changelog_visible: true
      },
      {
        id: 'entry_002',
        content_title: 'API Rate Limit Optimization',
        generated_content: 'We\'ve significantly improved our API performance by optimizing rate limiting algorithms. Enterprise customers now enjoy 50% higher rate limits, and we\'ve reduced response times by 30% across all endpoints.',
        content_type: 'performance_improvement',
        target_audience: 'customers',
        status: 'published',
        quality_score: 0.88,
        published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        tldr_summary: 'API performance improvements with higher rate limits and faster response times',
        tldr_bullet_points: ['50% higher rate limits for enterprise users', '30% faster response times', 'Improved error handling', 'Better caching mechanisms'],
        update_category: 'performance_improvement',
        importance_score: 0.7,
        breaking_changes: false,
        tags: ['api', 'performance', 'enterprise'],
        is_public: true,
        public_changelog_visible: true
      },
      {
        id: 'entry_003',
        content_title: 'Security Update: Enhanced Authentication',
        generated_content: 'We\'ve implemented enhanced security measures including multi-factor authentication (MFA), improved session management, and advanced threat detection. All users are encouraged to enable MFA from their account settings.',
        content_type: 'security_update',
        target_audience: 'customers',
        status: 'published',
        quality_score: 0.95,
        published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        tldr_summary: 'Enhanced security with MFA, better session management, and threat detection',
        tldr_bullet_points: ['Multi-factor authentication available', 'Improved session security', 'Advanced threat detection', 'Automatic security alerts'],
        update_category: 'security_update',
        importance_score: 0.9,
        breaking_changes: false,
        tags: ['security', 'authentication', 'mfa'],
        is_public: true,
        public_changelog_visible: true
      },
      {
        id: 'entry_004',
        content_title: 'New Slack Integration',
        generated_content: 'Connect your workspace with Slack for seamless notifications and updates. Get instant alerts for important events, approval requests, and system updates directly in your Slack channels.',
        content_type: 'integration_update',
        target_audience: 'customers',
        status: 'published',
        quality_score: 0.85,
        published_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        tldr_summary: 'New Slack integration for notifications and workspace updates',
        tldr_bullet_points: ['Real-time Slack notifications', 'Customizable alert preferences', 'Channel-specific updates', 'Easy one-click setup'],
        update_category: 'integration_update',
        importance_score: 0.6,
        breaking_changes: false,
        tags: ['slack', 'integration', 'notifications'],
        is_public: true,
        public_changelog_visible: true
      },
      {
        id: 'entry_005',
        content_title: 'Customer Success Query Interface',
        generated_content: 'Introducing our new CS Query interface that allows customer success teams to quickly search and analyze customer data, interactions, and insights. This powerful tool includes advanced filtering, AI-powered recommendations, and comprehensive customer profiles.',
        content_type: 'feature_release',
        target_audience: 'internal_team',
        status: 'published',
        quality_score: 0.90,
        published_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        tldr_summary: 'New CS Query interface for customer success teams with AI-powered insights',
        tldr_bullet_points: ['Advanced customer search and filtering', 'AI-powered recommendations', 'Comprehensive customer profiles', 'Integration with support tickets'],
        update_category: 'feature_update',
        importance_score: 0.8,
        breaking_changes: false,
        tags: ['customer-success', 'ai', 'search'],
        is_public: false,
        public_changelog_visible: false
      }
    ];

    // Apply filters to mock data
    let filteredEntries = [...mockEntries];

    // Apply filters
    if (contentType && contentType !== 'all') {
      filteredEntries = filteredEntries.filter(entry => entry.content_type === contentType);
    }

    if (audience && audience !== 'all') {
      filteredEntries = filteredEntries.filter(entry => entry.target_audience === audience);
    }

    if (category && category !== 'all') {
      filteredEntries = filteredEntries.filter(entry => entry.update_category === category);
    }

    // Apply time range filter
    if (timeRange && timeRange !== 'all') {
      const now = new Date();
      const timeRangeInDays: { [key: string]: number } = {
        '7d': 7,
        '30d': 30,
        '90d': 90
      };
      
      const days = timeRangeInDays[timeRange];
      if (days) {
        const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        filteredEntries = filteredEntries.filter(entry => new Date(entry.published_at) >= cutoffDate);
      }
    }

    // Sort by published date (newest first)
    filteredEntries.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

    // Apply pagination
    const totalCount = filteredEntries.length;
    const paginatedEntries = filteredEntries.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      entries: paginatedEntries,
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: (offset + limit) < totalCount
      },
      metadata: {
        totalPublished: totalCount,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Changelog API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'get_stats':
        return await getChangelogStats();
      
      case 'get_categories':
        return await getChangelogCategories();
      
      case 'mark_viewed':
        return await markEntryViewed(params.entryId, params.userId);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Changelog POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getChangelogStats() {
  try {
    const { data: entries, error } = await supabase
      .from('generated_content')
      .select('content_type, published_at, quality_score')
      .eq('status', 'published')
      .eq('approval_status', 'approved')
      .not('published_at', 'is', null);

    if (error) {
      throw error;
    }

    const stats = {
      totalEntries: entries?.length || 0,
      entriesThisMonth: 0,
      entriesThisWeek: 0,
      averageQualityScore: 0,
      contentTypeBreakdown: {} as { [key: string]: number },
      recentActivity: [] as any[]
    };

    if (entries && entries.length > 0) {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      stats.entriesThisWeek = entries.filter(e => 
        new Date(e.published_at) >= oneWeekAgo
      ).length;

      stats.entriesThisMonth = entries.filter(e => 
        new Date(e.published_at) >= oneMonthAgo
      ).length;

      stats.averageQualityScore = entries.reduce((sum, e) => 
        sum + (e.quality_score || 0), 0
      ) / entries.length;

      // Content type breakdown
      entries.forEach(entry => {
        const type = entry.content_type || 'unknown';
        stats.contentTypeBreakdown[type] = (stats.contentTypeBreakdown[type] || 0) + 1;
      });

      // Recent activity (last 7 days)
      stats.recentActivity = entries
        .filter(e => new Date(e.published_at) >= oneWeekAgo)
        .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
        .slice(0, 10);
    }

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error getting changelog stats:', error);
    return NextResponse.json(
      { error: 'Failed to get changelog stats' },
      { status: 500 }
    );
  }
}

async function getChangelogCategories() {
  try {
    const { data: entries, error } = await supabase
      .from('generated_content')
      .select('content_type, target_audience')
      .eq('status', 'published')
      .eq('approval_status', 'approved')
      .not('published_at', 'is', null);

    if (error) {
      throw error;
    }

    const categories = {
      contentTypes: new Set<string>(),
      audiences: new Set<string>(),
      updateCategories: new Set<string>()
    };

    entries?.forEach(entry => {
      if (entry.content_type) categories.contentTypes.add(entry.content_type);
      if (entry.target_audience) categories.audiences.add(entry.target_audience);
    });

    // Add common update categories
    const commonCategories = [
      'major_release',
      'feature_update', 
      'bug_fix',
      'security_update',
      'performance_improvement',
      'integration_update'
    ];
    commonCategories.forEach(cat => categories.updateCategories.add(cat));

    return NextResponse.json({
      success: true,
      categories: {
        contentTypes: Array.from(categories.contentTypes),
        audiences: Array.from(categories.audiences),
        updateCategories: Array.from(categories.updateCategories)
      }
    });

  } catch (error) {
    console.error('Error getting changelog categories:', error);
    return NextResponse.json(
      { error: 'Failed to get changelog categories' },
      { status: 500 }
    );
  }
}

async function markEntryViewed(entryId: string, userId?: string) {
  try {
    // In a real implementation, you would track user views
    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      message: 'Entry marked as viewed'
    });

  } catch (error) {
    console.error('Error marking entry as viewed:', error);
    return NextResponse.json(
      { error: 'Failed to mark entry as viewed' },
      { status: 500 }
    );
  }
}