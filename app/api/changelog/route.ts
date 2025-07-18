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

    // Build query
    let query = supabase
      .from('generated_content')
      .select(`
        id,
        content_title,
        generated_content,
        content_type,
        target_audience,
        status,
        quality_score,
        published_at,
        tldr_summary,
        tldr_bullet_points,
        tldr_key_takeaways,
        tldr_action_items,
        created_at,
        updated_at
      `)
      .eq('status', 'published')
      .eq('approval_status', 'approved')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false });

    // Apply filters
    if (contentType && contentType !== 'all') {
      query = query.eq('content_type', contentType);
    }

    if (audience && audience !== 'all') {
      query = query.eq('target_audience', audience);
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
        query = query.gte('published_at', cutoffDate.toISOString());
      }
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: entries, error } = await query;

    if (error) {
      console.error('Error fetching changelog entries:', error);
      return NextResponse.json(
        { error: 'Failed to fetch changelog entries' },
        { status: 500 }
      );
    }

    // Enhance entries with additional metadata
    const enhancedEntries = await Promise.all(
      (entries || []).map(async (entry) => {
        // Get source data for context
        const { data: sourceData } = await supabase
          .from('content_data_sources')
          .select('*')
          .eq('content_id', entry.id)
          .limit(1);

        // Determine update category and importance from source data
        let updateCategory = 'feature_update';
        let importanceScore = 0.5;
        let breakingChanges = false;

        if (sourceData && sourceData.length > 0) {
          const source = sourceData[0];
          
          // Analyze source data to determine category
          if (source.source_type === 'product_update') {
            const description = source.data_excerpt?.toLowerCase() || '';
            
            if (description.includes('major') || description.includes('release')) {
              updateCategory = 'major_release';
              importanceScore = 0.8;
            } else if (description.includes('bug') || description.includes('fix')) {
              updateCategory = 'bug_fix';
              importanceScore = 0.6;
            } else if (description.includes('security')) {
              updateCategory = 'security_update';
              importanceScore = 0.9;
            } else if (description.includes('performance')) {
              updateCategory = 'performance_improvement';
              importanceScore = 0.7;
            } else if (description.includes('integration') || description.includes('api')) {
              updateCategory = 'integration_update';
              importanceScore = 0.6;
            }
            
            // Check for breaking changes
            if (description.includes('breaking') || description.includes('deprecated')) {
              breakingChanges = true;
              importanceScore = Math.max(importanceScore, 0.8);
            }
          }
        }

        return {
          ...entry,
          update_category: updateCategory,
          importance_score: importanceScore,
          breaking_changes: breakingChanges,
          tags: entry.content_type ? [entry.content_type] : []
        };
      })
    );

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('generated_content')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
      .eq('approval_status', 'approved')
      .not('published_at', 'is', null);

    return NextResponse.json({
      success: true,
      entries: enhancedEntries,
      pagination: {
        limit,
        offset,
        total: totalCount || 0,
        hasMore: (offset + limit) < (totalCount || 0)
      },
      metadata: {
        totalPublished: totalCount || 0,
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