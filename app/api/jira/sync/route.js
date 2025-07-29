import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    console.log('🔄 Starting JIRA sync...');

    // Since we're using MCP in development, for production we'll create a webhook-based approach
    // This endpoint will be called by JIRA webhooks or scheduled tasks
    
    // For now, return the current product updates from our database
    const { data: updates, error } = await supabase
      .from('product_updates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Database error:', error);
      return Response.json({ error: 'Database error' }, { status: 500 });
    }

    return Response.json({
      success: true,
      message: `Found ${updates?.length || 0} product updates`,
      data: updates || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ JIRA sync error:', error);
    return Response.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('📥 JIRA webhook received:', body);

    // Process JIRA webhook payload
    if (body.webhookEvent === 'jira:issue_updated') {
      const issue = body.issue;
      
      // Check if this is a customer-impacting story
      const isCustomerImpacting = issue.fields.labels?.some(label => 
        label.name.toLowerCase().includes('customer') || 
        label.name.toLowerCase().includes('public')
      );

      if (isCustomerImpacting && issue.fields.status.name === 'Done') {
        // Insert/update product update in database
        const updateData = {
          jira_issue_key: issue.key,
          title: issue.fields.summary,
          description: issue.fields.description || '',
          status: 'pending_review',
          reporter: issue.fields.reporter?.displayName || '',
          assignee: issue.fields.assignee?.displayName || '',
          completed_at: new Date().toISOString(),
          raw_jira_data: issue
        };

        const { data, error } = await supabase
          .from('product_updates')
          .upsert(updateData, { 
            onConflict: 'jira_issue_key',
            returning: true
          });

        if (error) {
          console.error('❌ Database insert error:', error);
          return Response.json({ error: 'Database error' }, { status: 500 });
        }

        console.log('✅ Product update created:', data);
        return Response.json({ 
          success: true, 
          message: 'Product update processed',
          data: data 
        });
      }
    }

    return Response.json({ 
      success: true, 
      message: 'Webhook processed (no action needed)' 
    });

  } catch (error) {
    console.error('❌ JIRA webhook error:', error);
    return Response.json({ 
      error: 'Webhook processing error',
      message: error.message 
    }, { status: 500 });
  }
}