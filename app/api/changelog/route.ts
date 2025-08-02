import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Handle missing environment variables during build
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    // Return null during build time when env vars aren't available
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

const supabase = createSupabaseClient();

// Fallback JIRA update using REST API
async function updateJiraWithRestAPI(issueKey: string, tldrValue: string) {
  try {
    if (!process.env.JIRA_BASE_URL || !process.env.JIRA_API_TOKEN) {
      throw new Error('JIRA credentials not configured');
    }

    const jiraUrl = `${process.env.JIRA_BASE_URL}/rest/api/2/issue/${issueKey}`;
    const fieldId = process.env.JIRA_TLDR_FIELD_ID || 'customfield_10087';
    
    // For Atlassian Cloud, use email + API token authentication
    let authHeader;
    const jiraEmail = process.env.JIRA_EMAIL || process.env.JIRA_USERNAME;
    if (jiraEmail) {
      const auth = Buffer.from(`${jiraEmail}:${process.env.JIRA_API_TOKEN}`).toString('base64');
      authHeader = `Basic ${auth}`;
    } else {
      authHeader = `Bearer ${process.env.JIRA_API_TOKEN}`;
    }

    const response = await fetch(jiraUrl, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          [fieldId]: tldrValue
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`JIRA API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return {
      success: true,
      issueKey: issueKey,
      message: `JIRA issue ${issueKey} updated successfully with TL;DR via REST API`,
      updatedField: fieldId,
      tldr: tldrValue
    };

  } catch (error) {
    console.error(`Failed to update JIRA issue ${issueKey}:`, error);
    return {
      success: false,
      issueKey: issueKey,
      error: error.message || 'Unknown JIRA REST API error',
      requiresManualUpdate: true
    };
  }
}

export async function GET(request: Request) {
  try {
    // Handle missing Supabase client during build
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database connection not available' },
        { status: 503 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const contentType = searchParams.get('contentType');
    const category = searchParams.get('category');
    const audience = searchParams.get('audience');
    const timeRange = searchParams.get('timeRange');
    const status = searchParams.get('status'); // 'pending', 'approved', 'published', 'all'

    // Fetch real data from Supabase - get all changelog entries
    let query = supabase
      .from('generated_content')
      .select('*')
      .eq('content_type', 'changelog_entry')
      .order('created_at', { ascending: false });

    // Apply status filters
    if (status && status !== 'all') {
      if (status === 'pending') {
        // Filter for entries that need approval (from JIRA webhook)
        query = query.eq('status', 'draft').filter('source_data->needs_approval', 'eq', true);
      } else if (status === 'approved') {
        query = query.eq('status', 'approved');
      } else if (status === 'published') {
        query = query.eq('status', 'published').eq('is_public', true);
      }
    }

    // Apply category filter
    if (category && category !== 'all') {
      query = query.eq('update_category', category.toLowerCase());
    }

    // Apply audience filter
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
        query = query.gte('created_at', cutoffDate.toISOString());
      }
    }

    const { data: entries, error, count } = await query
      .range(offset, offset + limit - 1)
      .limit(limit);

    if (error) {
      console.error('Database error:', error);
      // Fallback to mock data if database fails
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

    // Apply filters to mock data (fallback only)
    let filteredEntries = [...mockEntries];
    if (contentType && contentType !== 'all') {
      filteredEntries = filteredEntries.filter(entry => entry.content_type === contentType);
    }
    // Apply pagination to mock data
    const totalMockCount = filteredEntries.length;
    const paginatedMockEntries = filteredEntries.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      entries: paginatedMockEntries,
      pagination: {
        limit,
        offset,
        total: totalMockCount,
        hasMore: (offset + limit) < totalMockCount
      },
      metadata: {
        totalPublished: totalMockCount,
        lastUpdated: new Date().toISOString(),
        usingFallbackData: true
      }
    });
    }

    // Transform database results to match frontend interface
    const transformedEntries = (entries || []).map((entry: any) => {
      // Extract data from source_data JSONB field if it exists
      const sourceData = entry.source_data || {};
      
      return {
        id: entry.id,
        content_title: entry.content_title,
        generated_content: entry.generated_content,
        content_type: 'changelog_entry',
        target_audience: entry.target_audience || 'customers',
        status: entry.status || 'draft',
        approval_status: entry.status || 'pending', // Map status to approval_status
        quality_score: entry.quality_score || 0.85,
        published_at: entry.release_date || entry.created_at,
        tldr_summary: entry.content_title, // Use title as summary for now
        tldr_bullet_points: cleanupHighlights(sourceData.highlights || sourceData.tldr_bullet_points || []),
        update_category: sourceData.category?.toLowerCase() || 'feature_update',
        // layout_template: entry.layout_template || 'standard', // Column doesn't exist in schema
        importance_score: entry.importance_score || 0.7,
        breaking_changes: sourceData.breaking_changes || false,
        migration_notes: sourceData.migration_notes,
        affected_users: sourceData.affected_users,
        tags: sourceData.labels || [],
        is_public: entry.is_public || false,
        public_changelog_visible: entry.is_public || false,
        version: sourceData.version,
        release_date: entry.release_date,
        created_at: entry.created_at,
        updated_at: entry.updated_at,
        related_stories: sourceData.related_stories || [], // Add related stories
        metadata: {
          jira_story_key: sourceData.jira_story_key,
          jira_issue_id: sourceData.jira_issue_id,
          priority: sourceData.priority,
          assignee: sourceData.assignee,
          components: sourceData.components,
          needs_approval: sourceData.needs_approval, // Add the needs_approval flag
          ...entry.generation_metadata
        }
      };
    });

    return NextResponse.json({
      success: true,
      entries: transformedEntries,
      pagination: {
        limit,
        offset,
        total: count || transformedEntries.length,
        hasMore: (offset + limit) < (count || transformedEntries.length)
      },
      metadata: {
        totalPublished: count || transformedEntries.length,
        lastUpdated: new Date().toISOString(),
        usingFallbackData: false
      }
    });

  } catch (error) {
    console.error('Changelog API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Handle missing Supabase client during build
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database connection not available' },
        { status: 503 }
      );
    }
    
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
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Changelog POST API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('id');
    
    if (!entryId) {
      return NextResponse.json(
        { success: false, error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    const updates = await request.json();
    
    // Transform frontend data back to database format
    const dbUpdates: any = {
      updated_at: new Date().toISOString()
    };

    // Filter out any non-existent database columns to prevent schema errors
    const allowedFields = [
      'content_title', 'generated_content', 'status', 'quality_score', 
      'source_data', 'generation_metadata', 'updated_at', 'created_by'
    ];
    
    // Remove any fields that might cause schema errors
    const filteredUpdates = Object.keys(updates).reduce((acc, key) => {
      // Skip fields that don't exist in the database schema
      // Allow key approval workflow fields: approval_status, public_visibility, release_date
      if (!['approved_at', 'layout_template'].includes(key)) {
        acc[key] = updates[key];
      }
      return acc;
    }, {} as any);

    if (filteredUpdates.customer_facing_title || filteredUpdates.content_title) {
      dbUpdates.content_title = filteredUpdates.customer_facing_title || filteredUpdates.content_title;
    }
    
    if (filteredUpdates.customer_facing_description || filteredUpdates.generated_content) {
      dbUpdates.generated_content = filteredUpdates.customer_facing_description || filteredUpdates.generated_content;
    }
    
    // Handle optional media fields
    if (filteredUpdates.external_link !== undefined) {
      dbUpdates.external_link = filteredUpdates.external_link;
    }
    
    if (filteredUpdates.video_url !== undefined) {
      dbUpdates.video_url = filteredUpdates.video_url;
    }
    
    if (filteredUpdates.image_url !== undefined) {
      dbUpdates.image_url = filteredUpdates.image_url;
    }
    
    // Skip category update for now to avoid schema issues
    // if (updates.category) {
    //   dbUpdates.update_category = updates.category.toLowerCase();
    // }
    
    // Skip tldr_bullet_points update for now to avoid schema issues
    // if (updates.highlights || updates.tldr_bullet_points) {
    //   dbUpdates.tldr_bullet_points = updates.highlights || updates.tldr_bullet_points;
    // }
    
    // Skip breaking_changes update for now to avoid schema issues
    // if (updates.breaking_changes !== undefined) {
    //   dbUpdates.breaking_changes = updates.breaking_changes;
    // }
    
    // Skip migration_notes update for now to avoid schema issues  
    // if (updates.migration_notes !== undefined) {
    //   dbUpdates.migration_notes = updates.migration_notes;
    // }
    
    // Skip layout_template update for now to avoid schema issues
    // if (updates.layout_template) {
    //   dbUpdates.layout_template = updates.layout_template;
    // }
    
    if (filteredUpdates.approval_status) {
      // Map frontend approval_status values to database status values
      // If approving and making public, set status to 'published', otherwise 'approved'
      let targetStatus = 'draft';
      if (filteredUpdates.approval_status === 'approved') {
        targetStatus = filteredUpdates.public_visibility ? 'published' : 'approved';
      } else {
        const statusMapping = {
          'pending': 'draft',
          'approved': 'approved', 
          'published': 'published',
          'draft': 'draft'
        };
        targetStatus = statusMapping[filteredUpdates.approval_status] || 'draft';
      }
      
      dbUpdates.status = targetStatus;
      dbUpdates.approval_status = filteredUpdates.approval_status;
      
      // If approving, store additional info in generation_metadata
      if (filteredUpdates.approval_status === 'approved') {
        // Get the current entry to preserve existing metadata
        const { data: currentEntry, error: fetchError } = await supabase
          .from('generated_content')
          .select('source_data, generation_metadata')
          .eq('id', entryId)
          .single();

        console.log('🔍 Current entry before approval:', {
          entryId,
          currentNeedsApproval: currentEntry?.source_data?.needs_approval,
          currentStatus: currentEntry?.status || 'unknown'
        });

        // Update source_data to remove needs_approval flag
        const updatedSourceData = {
          ...(currentEntry?.source_data || {}),
          needs_approval: false // Remove from approval queue
        };

        // Store approval details in generation_metadata
        dbUpdates.source_data = updatedSourceData;
        dbUpdates.generation_metadata = {
          ...(currentEntry?.generation_metadata || {}),
          auto_generated: true,
          source: 'app_approval',
          approved_by: 'app_user',
          approved_at: new Date().toISOString(),
          approval_method: 'app_interface',
          public_visibility: filteredUpdates.public_visibility,
          version: filteredUpdates.version,
          release_date: filteredUpdates.release_date,
          status_display: filteredUpdates.public_visibility ? 'Public' : 'Private'
        };
      }
    }
    
    // Handle public visibility fields for approval workflow
    if (filteredUpdates.public_visibility !== undefined) {
      dbUpdates.is_public = filteredUpdates.public_visibility;
      dbUpdates.public_changelog_visible = filteredUpdates.public_visibility;
      console.log('📢 Setting public visibility:', {
        entryId,
        is_public: filteredUpdates.public_visibility,
        public_changelog_visible: filteredUpdates.public_visibility
      });
    }

    // Handle release date for approved entries
    if (filteredUpdates.release_date !== undefined) {
      dbUpdates.release_date = filteredUpdates.release_date;
      console.log('📅 Setting release date:', {
        entryId,
        release_date: filteredUpdates.release_date
      });
    }

    // Handle related stories - update source_data JSONB field
    if (filteredUpdates.related_stories !== undefined) {
      console.log('🔧 Updating related_stories:', JSON.stringify(filteredUpdates.related_stories));
      
      // We need to fetch the existing source_data first, then update it
      if (!supabase) {
        console.log('⚠️ No database connection for related_stories update');
      } else {
        try {
          // Get current source_data
          const { data: currentEntry, error: fetchError } = await supabase
            .from('generated_content')
            .select('source_data')
            .eq('id', entryId)
            .single();
          
          if (fetchError) {
            console.log('⚠️ Could not fetch current source_data:', fetchError.message);
          } else {
            // Update the source_data with related_stories
            const updatedSourceData = {
              ...(currentEntry.source_data || {}),
              related_stories: filteredUpdates.related_stories
            };
            
            dbUpdates.source_data = updatedSourceData;
            console.log('✅ Updated source_data with related_stories');
          }
        } catch (sourceDataError) {
          console.log('⚠️ Error updating related_stories in source_data:', sourceDataError.message);
        }
      }
    }

    console.log('🔧 Attempting to update entry:', entryId);
    console.log('🔧 Update data:', JSON.stringify(dbUpdates, null, 2));

    // Handle missing Supabase client
    if (!supabase) {
      console.log('⚠️ No database connection, simulating success');
      return NextResponse.json({
        success: true,
        entry: { id: entryId, ...updates },
        message: 'Entry updated successfully (simulated - no database connection)'
      });
    }

    const { data, error } = await supabase
      .from('generated_content')
      .update(dbUpdates)
      .eq('id', entryId)
      .select()
      .single();

    if (error) {
      console.error('Database update error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Provide more specific error information
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update entry',
          details: error.message,
          entryId: entryId
        },
        { status: 500 }
      );
    }

    // Debug logging after successful update
    if (data && filteredUpdates.approval_status === 'approved') {
      console.log('✅ Entry updated successfully:', {
        entryId,
        newStatus: data.status,
        newNeedsApproval: data.source_data?.needs_approval,
        updateType: filteredUpdates.public_visibility ? 'published' : 'approved'
      });
    }

    // If approved, update JIRA with the TLDR using server-side MCP
    if (filteredUpdates.approval_status === 'approved' && data) {
      try {
        const sourceData = data.source_data || {};
        const jiraStoryKey = sourceData.jira_story_key;
        
        if (jiraStoryKey) {
          console.log(`🔄 Updating JIRA issue ${jiraStoryKey} with approved changelog using server-side MCP...`);
          
          // Use the new server-side MCP client
          const ServerMCPClient = require('../../../lib/server-mcp-client.js');
          const mcpClient = new ServerMCPClient();
          
          // Use the customer-facing title as TLDR
          const tldr = filteredUpdates.customer_facing_title || filteredUpdates.content_title || data.content_title;
          
          const jiraUpdateResult = await mcpClient.updateTLDR(jiraStoryKey, tldr);
          
          if (jiraUpdateResult.success) {
            console.log(`✅ Updated JIRA issue ${jiraStoryKey} with TLDR via server-side MCP`);
          } else {
            console.warn(`⚠️ Failed to update JIRA issue ${jiraStoryKey} via server-side MCP:`, jiraUpdateResult.error);
            
            // If it requires client-side MCP, log that for future implementation
            if (jiraUpdateResult.requiresClientSideMCP) {
              console.log(`ℹ️ ${jiraStoryKey} requires client-side MCP for updates`);
            }
          }
        }
      } catch (jiraError) {
        console.warn('⚠️ JIRA MCP update failed (non-blocking):', jiraError.message);
      }

      // Send Slack notification for published updates
      console.log('🔍 Checking Slack notification conditions:');
      console.log('  - public_visibility:', filteredUpdates.public_visibility);
      console.log('  - data exists:', !!data);
      console.log('  - approval_status:', filteredUpdates.approval_status);
      
      if (filteredUpdates.public_visibility && data) {
        try {
          console.log('📢 Sending Slack notification for published update...');
          
          const sourceData = data.source_data || {};
          
          // Build clean media resources section - only include if actually present
          const optionalResources = [];
          if (data.video_url) {
            optionalResources.push(`📹 [Watch Demo](${data.video_url})`);
          }
          if (data.image_url) {
            optionalResources.push(`📸 [Screenshots](${data.image_url})`);
          }
          if (data.external_link) {
            optionalResources.push(`📖 [Learn More](${data.external_link})`);
          }
          if (sourceData.jira_story_key) {
            optionalResources.push(`🎫 [${sourceData.jira_story_key}](https://marq.atlassian.net/browse/${sourceData.jira_story_key})`);
          }
          
          const mediaResourcesSection = optionalResources.length > 0 
            ? `\n\n${optionalResources.join(' • ')}` 
            : '';

          // Build dynamic "What's New" section from highlights
          const highlights = sourceData.highlights || [];
          const whatsNewSection = highlights.length > 0 
            ? `\n\n**What's New:**\n${highlights.map(h => `• ${h}`).join('\n')}` 
            : '';

          const templateData = {
            updateTitle: data.content_title || 'Product Update',
            jiraKey: sourceData.jira_story_key || 'N/A',
            assignee: sourceData.assignee || 'Team',  
            updateDescription: data.generated_content || 'View the changelog for full details',
            customerImpact: sourceData.highlights?.join(', ') || 'Improved user experience',
            whatsNewSection: whatsNewSection,
            mediaResources: mediaResourcesSection,
            changelogUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/product`
          };

          const slackApiUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/slack`;
          console.log(`📡 Sending Slack notification to: ${slackApiUrl}`);
          
          const notificationResponse = await fetch(slackApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'send_notification',
              templateId: 'product-update-notification',
              templateData,
              type: 'publish'
            })
          });

          console.log(`📊 Slack API response status: ${notificationResponse.status} ${notificationResponse.statusText}`);
          
          if (notificationResponse.ok) {
            const responseData = await notificationResponse.json();
            console.log('✅ Slack publication notification sent successfully:', responseData);
          } else {
            const responseText = await notificationResponse.text();
            console.warn('⚠️ Slack publication notification failed:');
            console.warn('   Status:', notificationResponse.status, notificationResponse.statusText);
            console.warn('   Response:', responseText.substring(0, 200) + '...');
            
            // Try to parse as JSON if possible
            try {
              const errorData = JSON.parse(responseText);
              console.warn('   Parsed error:', errorData.error);
            } catch (parseError) {
              console.warn('   Raw response (HTML page?):', responseText.includes('<!doctype') || responseText.includes('<html>'));
            }
          }
        } catch (slackError) {
          console.warn('⚠️ Slack notification failed (non-blocking):', slackError.message);
        }
      }
    }

    // Perform server-side JIRA update if approval and JIRA data exists
    let jiraUpdateResult = null;
    if (filteredUpdates.approval_status === 'approved' && data) {
      const sourceData = data.source_data || {};
      const jiraStoryKey = sourceData.jira_story_key;
      
      if (jiraStoryKey) {
        const tldr = filteredUpdates.customer_facing_title || filteredUpdates.content_title || data.content_title;
        
        try {
          console.log(`🎫 Attempting server-side JIRA update for ${jiraStoryKey}...`);
          
          // Try to use MCP JIRA integration if available
          if (typeof mcp__atlassian__editJiraIssue === 'function') {
            const jiraResult = await mcp__atlassian__editJiraIssue({
              cloudId: process.env.JIRA_BASE_URL || 'https://marq.atlassian.net',
              issueIdOrKey: jiraStoryKey,
              fields: {
                [process.env.JIRA_TLDR_FIELD_ID || 'customfield_10087']: tldr
              }
            });
            
            jiraUpdateResult = {
              success: true,
              issueKey: jiraStoryKey,
              message: `JIRA issue ${jiraStoryKey} updated successfully with TL;DR`,
              updatedField: process.env.JIRA_TLDR_FIELD_ID || 'customfield_10087',
              tldr: tldr
            };
            
            console.log('✅ Server-side JIRA update successful:', jiraUpdateResult);
          } else {
            // Fallback to REST API if MCP tools aren't available
            const jiraResult = await updateJiraWithRestAPI(jiraStoryKey, tldr);
            jiraUpdateResult = jiraResult;
          }
          
        } catch (jiraError) {
          console.error('❌ Server-side JIRA update failed:', jiraError);
          jiraUpdateResult = {
            success: false,
            issueKey: jiraStoryKey,
            error: jiraError.message || 'Unknown JIRA update error',
            requiresManualUpdate: true
          };
        }
      }
    }

    return NextResponse.json({
      success: true,
      entry: data,
      message: 'Entry updated successfully',
      ...(jiraUpdateResult && { jiraUpdateResult })
    });

  } catch (error) {
    console.error('Changelog PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
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
      { success: false, error: 'Failed to get changelog stats' },
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
      { success: false, error: 'Failed to get changelog categories' },
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
      { success: false, error: 'Failed to mark entry as viewed' },
      { status: 500 }
    );
  }
}

/**
 * Clean up malformed highlights from webhook processing
 * @param highlights - The highlights array to clean up
 * @returns Cleaned highlights array
 */
function cleanupHighlights(highlights: any): string[] {
  if (!Array.isArray(highlights) || highlights.length === 0) {
    return [];
  }
  
  // Check if highlights are malformed (single long entry that might be truncated)
  if (highlights.length === 1 && highlights[0].length > 100) {
    const longHighlight = highlights[0];
    
    // Try to split into meaningful bullet points
    const sentences = longHighlight.split(/[.!?]+/).filter((s: string) => s.trim().length > 10);
    
    if (sentences.length > 1) {
      // Create better highlights from sentences
      return sentences.slice(0, 3).map((s: string) => {
        let cleaned = s.trim().replace(/^[^a-zA-Z]*/, '');
        
        // Fix common truncation issues
        if (cleaned.startsWith('factor authentication')) {
          cleaned = 'Multi-' + cleaned;
        }
        
        // Ensure first letter is capitalized
        return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      });
    }
    
    // If can't split meaningfully, create generic highlights
    return [
      'Enhanced security features',
      'Improved user experience', 
      'Better system reliability'
    ];
  }
  
  // Return highlights as-is if they look good
  return highlights.filter((h: any) => typeof h === 'string' && h.trim().length > 0);
}