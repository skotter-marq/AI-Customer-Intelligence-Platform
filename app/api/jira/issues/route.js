// This route provides JIRA issues data for the frontend
// Uses the Atlassian MCP integration for development, webhook data for production

import { createClient } from '@supabase/supabase-js';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

export async function GET(request) {
  try {
    if (!supabase) {
      return Response.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const project = searchParams.get('project') || 'PRESS';
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log(`🔍 Fetching JIRA issues for project: ${project}`);

    // Get product updates from database (populated by webhooks)
    let query = supabase
      .from('product_updates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: updates, error } = await query;

    if (error) {
      console.error('❌ Database error:', error);
      return Response.json({ error: 'Database error' }, { status: 500 });
    }

    // Transform data for frontend
    const issues = updates?.map(update => ({
      key: update.jira_issue_key,
      title: update.title,
      description: update.description,
      status: update.status,
      reporter: update.reporter,
      assignee: update.assignee,
      completedAt: update.completed_at,
      createdAt: update.created_at,
      rawData: update.raw_jira_data
    })) || [];

    return Response.json({
      success: true,
      project,
      total: issues.length,
      issues,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ JIRA issues API error:', error);
    return Response.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, issueKey, data } = body;

    console.log(`📝 JIRA action: ${action} for issue: ${issueKey}`);

    if (action === 'update_status') {
      const { data: updated, error } = await supabase
        .from('product_updates')
        .update({ 
          status: data.status,
          updated_at: new Date().toISOString()
        })
        .eq('jira_issue_key', issueKey)
        .select();

      if (error) {
        console.error('❌ Update error:', error);
        return Response.json({ error: 'Update failed' }, { status: 500 });
      }

      return Response.json({
        success: true,
        message: 'Issue status updated',
        data: updated
      });
    }

    return Response.json({ 
      error: 'Invalid action' 
    }, { status: 400 });

  } catch (error) {
    console.error('❌ JIRA issues POST error:', error);
    return Response.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
}