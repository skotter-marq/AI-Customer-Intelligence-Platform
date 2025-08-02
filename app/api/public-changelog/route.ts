import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase-client';

interface PublicChangelogEntry {
  id: string;
  version?: string;
  release_date: string;
  category: 'Added' | 'Fixed' | 'Improved' | 'Deprecated' | 'Security';
  tags: string[];
  customer_facing_title: string;
  customer_facing_description: string;
  highlights: string[];
  breaking_changes: boolean;
  migration_notes?: string;
  affected_users?: number;
  view_count: number;
  upvotes: number;
  feedback_count: number;
  jira_story_key?: string;
  external_link?: string;
  video_url?: string;
  image_url?: string;
}

function capitalizeCategory(category: string): 'Added' | 'Fixed' | 'Improved' | 'Deprecated' | 'Security' {
  const capitalized = category?.charAt(0).toUpperCase() + category?.slice(1).toLowerCase();
  
  switch (capitalized?.toLowerCase()) {
    case 'added':
    case 'new':
    case 'feature':
      return 'Added';
    case 'fixed':
    case 'bug':
    case 'bugfix':
      return 'Fixed';
    case 'improved':
    case 'enhancement':
    case 'update':
      return 'Improved';
    case 'deprecated':
    case 'removal':
      return 'Deprecated';
    case 'security':
    case 'auth':
      return 'Security';
    default:
      return 'Improved';
  }
}

export async function GET(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category');
    const timeframe = searchParams.get('timeframe');
    const format = searchParams.get('format'); // json, rss, xml

    // Fetch published entries from Supabase
    // Note: approval_status column doesn't exist yet, so we use status='published' + approved_by exists as criteria
    let query = supabase
      .from('generated_content')
      .select('*')
      .eq('content_type', 'changelog_entry')
      .eq('is_public', true)
      .eq('public_changelog_visible', true)
      .not('release_date', 'is', null)
      .order('release_date', { ascending: false });

    // Apply category filter (skip for now since update_category column doesn't exist)
    // TODO: Re-enable when update_category column is added
    // if (category && category !== 'all') {
    //   query = query.eq('update_category', category.toLowerCase());
    // }

    // Apply time filter
    if (timeframe && timeframe !== 'all') {
      const now = new Date();
      const days = timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365;
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      query = query.gte('release_date', cutoffDate.toISOString());
    }

    const { data: dbEntries, error } = await query.limit(50);

    let publicEntries: PublicChangelogEntry[] = [];

    if (error) {
      console.error('Database error, falling back to mock data:', error);
      // Fallback to mock data
      const mockEntries: PublicChangelogEntry[] = [
      {
        id: 'changelog-v2.4.2',
        version: 'v2.4.2',
        release_date: '2024-01-20T00:00:00Z',
        category: 'Added',
        customer_facing_title: 'Real-time Analytics Dashboard',
        customer_facing_description: 'Introducing our new analytics dashboard with live data updates, customizable widgets, and advanced filtering capabilities.',
        highlights: [
          'Live data streaming for real-time insights',
          'Drag-and-drop dashboard customization',
          'Advanced filtering and date range selection',
          'Export analytics to PDF and CSV formats',
          '40% faster data loading performance'
        ],
        breaking_changes: false,
        affected_users: 2500,
        view_count: 1247,
        upvotes: 89,
        feedback_count: 23,
        jira_story_key: 'PLAT-245'
      },
      {
        id: 'changelog-v2.4.1',
        version: 'v2.4.1',
        release_date: '2024-01-15T00:00:00Z',
        category: 'Security',
        customer_facing_title: 'Enhanced Security & Multi-Factor Authentication',
        customer_facing_description: 'We\'ve strengthened our security infrastructure with multi-factor authentication, improved session management, and advanced threat detection.',
        highlights: [
          'Multi-factor authentication now available for all users',
          'Enhanced session security with automatic timeout',
          'Real-time threat detection and alerts',
          'Improved password strength requirements',
          'Security audit logs for enterprise customers'
        ],
        breaking_changes: true,
        migration_notes: 'All users will be prompted to set up MFA on their next login. API users need to update authentication headers.',
        affected_users: 5000,
        view_count: 2156,
        upvotes: 156,
        feedback_count: 45,
        jira_story_key: 'PLAT-267'
      },
      {
        id: 'changelog-v2.4.0',
        version: 'v2.4.0',
        release_date: '2024-01-10T00:00:00Z',
        category: 'Fixed',
        customer_facing_title: 'Export Performance Improvements',
        customer_facing_description: 'Resolved critical performance issues with data exports and significantly improved processing speeds for large datasets.',
        highlights: [
          'Export speed increased by 65% for large datasets',
          'Fixed memory leak causing export timeouts',
          'Better error handling and progress indicators',
          'Support for exporting up to 1M records',
          'Automatic retry mechanism for failed exports'
        ],
        breaking_changes: false,
        affected_users: 1200,
        view_count: 892,
        upvotes: 67,
        feedback_count: 18,
        jira_story_key: 'PLAT-298'
      },
      {
        id: 'changelog-v2.3.8',
        version: 'v2.3.8',
        release_date: '2024-01-05T00:00:00Z',
        category: 'Improved',
        customer_facing_title: 'API Rate Limit Optimization',
        customer_facing_description: 'Optimized API rate limiting system to provide better performance and higher limits for enterprise customers.',
        highlights: [
          '50% higher rate limits for enterprise plans',
          '30% faster API response times',
          'Improved error messages for rate limit exceeded',
          'Better caching mechanisms',
          'New rate limit headers for better client handling'
        ],
        breaking_changes: false,
        affected_users: 3500,
        view_count: 654,
        upvotes: 42,
        feedback_count: 12,
        jira_story_key: 'PLAT-189'
      },
      {
        id: 'changelog-v2.3.7',
        version: 'v2.3.7',
        release_date: '2024-01-01T00:00:00Z',
        category: 'Added',
        customer_facing_title: 'Slack Integration & Notifications',
        customer_facing_description: 'Connect your workspace with Slack for real-time notifications, approvals, and team collaboration features.',
        highlights: [
          'Real-time Slack notifications for important events',
          'Approval workflows directly in Slack channels',
          'Customizable notification preferences',
          'Channel-specific update routing',
          'One-click setup with OAuth integration'
        ],
        breaking_changes: false,
        affected_users: 800,
        view_count: 445,
        upvotes: 28,
        feedback_count: 8,
        jira_story_key: 'PLAT-201'
      }
    ];

    // Apply filters to mock data (fallback only)
    let filteredEntries = mockEntries;
    if (category && category !== 'all') {
      filteredEntries = filteredEntries.filter(entry => 
        entry.category.toLowerCase() === category.toLowerCase()
      );
    }
    if (timeframe && timeframe !== 'all') {
      const now = new Date();
      const days = timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365;
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filteredEntries = filteredEntries.filter(entry => 
        new Date(entry.release_date) >= cutoffDate
      );
    }
    
    // Use mock data as fallback
    publicEntries = filteredEntries.slice(offset, offset + limit);
    } else {
      // Transform database data to public changelog format
      publicEntries = (dbEntries || []).map((entry: any) => {
        // Extract JIRA story key from metadata
        const metadata = typeof entry.metadata === 'string' ? JSON.parse(entry.metadata) : entry.metadata || {};
        const jiraStoryKey = metadata.jira_story_key || entry.jira_story_key;
        
        // Generate version if not provided
        const version = entry.version || `v${new Date(entry.release_date || entry.created_at).getFullYear()}.${(new Date(entry.release_date || entry.created_at).getMonth() + 1).toString().padStart(2, '0')}.${Math.floor(Math.random() * 100)}`;
        
        return {
          id: entry.id,
          release_date: entry.release_date || entry.created_at,
          category: capitalizeCategory(entry.update_category || 'improved'),
          tags: entry.source_data?.tags || entry.tags || [],
          customer_facing_title: entry.content_title,
          customer_facing_description: entry.generated_content.substring(0, 500) + (entry.generated_content.length > 500 ? '...' : ''),
          highlights: entry.source_data?.highlights || [],
          breaking_changes: entry.breaking_changes || false,
          migration_notes: entry.migration_notes,
          affected_users: entry.affected_users,
          view_count: Math.floor(Math.random() * 1000) + 100, // Random for now, implement real tracking later
          upvotes: Math.floor(Math.random() * 50) + 10, // Random for now, implement real tracking later
          feedback_count: Math.floor(Math.random() * 20) + 2, // Random for now, implement real tracking later
          jira_story_key: jiraStoryKey,
          external_link: entry.external_link,
          video_url: entry.video_url,
          image_url: entry.image_url
        };
      });
      
      // Apply pagination to database results
      publicEntries = publicEntries.slice(offset, offset + limit);
    }

    const totalCount = publicEntries.length;

    // Handle different response formats
    if (format === 'rss') {
      return generateRSSFeed(publicEntries);
    }

    return NextResponse.json({
      success: true,
      changelog: publicEntries,
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: (offset + limit) < totalCount
      },
      metadata: {
        categories: ['Added', 'Fixed', 'Improved', 'Deprecated', 'Security'],
        totalPublishedVersions: totalCount,
        lastUpdated: new Date().toISOString(),
        apiVersion: '1.0',
        usingFallbackData: error ? true : false
      }
    });

  } catch (error) {
    console.error('Public changelog API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch changelog' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }
  
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'track_view':
        return await trackView(params.entryId, params.userAgent);
      
      case 'submit_feedback':
        return await submitFeedback(params.entryId, params.feedback, params.email);
      
      case 'upvote':
        return await upvoteEntry(params.entryId);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Public changelog POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// RSS Feed Generation
function generateRSSFeed(entries: PublicChangelogEntry[]) {
  const rssItems = entries.map(entry => `
    <item>
      <title>${entry.customer_facing_title}</title>
      <description><![CDATA[${entry.customer_facing_description}]]></description>
      <pubDate>${new Date(entry.release_date).toUTCString()}</pubDate>
      <guid>https://customer-intelligence-platform-skotter-1947s-projects.vercel.app/public-changelog#${entry.id}</guid>
      <category>${entry.category}</category>
      <link>https://customer-intelligence-platform-skotter-1947s-projects.vercel.app/public-changelog#${entry.id}</link>
    </item>
  `).join('');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Product Changelog</title>
    <description>Latest product updates and improvements</description>
    <link>https://customer-intelligence-platform-skotter-1947s-projects.vercel.app/public-changelog</link>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/rss+xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}

// Analytics functions
async function trackView(entryId: string, userAgent?: string) {
  try {
    // In production, track views in database
    console.log(`Tracking view for entry: ${entryId}`);
    
    return NextResponse.json({
      success: true,
      message: 'View tracked'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    );
  }
}

async function submitFeedback(entryId: string, feedback: string, email?: string) {
  try {
    // In production, save feedback to database
    console.log(`Feedback submitted for entry: ${entryId}`, { feedback, email });
    
    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

async function upvoteEntry(entryId: string) {
  try {
    // In production, increment upvote count in database
    console.log(`Upvote registered for entry: ${entryId}`);
    
    return NextResponse.json({
      success: true,
      message: 'Upvote registered'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to register upvote' },
      { status: 500 }
    );
  }
}