import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Handle missing environment variables during build
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

const supabase = createSupabaseClient();

// GET /api/admin/prompts - Fetch all prompts and templates
export async function GET(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database connection not available' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'ai_prompts', 'slack_templates', 'email_templates', 'system_messages', 'all'
    const category = searchParams.get('category');
    const enabled = searchParams.get('enabled');

    let results: any = {};

    // Fetch AI prompts
    if (!type || type === 'ai_prompts' || type === 'all') {
      let aiQuery = supabase.from('ai_prompts').select('*').order('category', { ascending: true });
      
      if (category) aiQuery = aiQuery.eq('category', category);
      if (enabled !== null) aiQuery = aiQuery.eq('enabled', enabled === 'true');
      
      const { data: aiPrompts, error: aiError } = await aiQuery;
      
      if (aiError) {
        console.error('Error fetching AI prompts:', aiError);
      } else {
        results.ai_prompts = aiPrompts || [];
      }
    }

    // Fetch Slack templates
    if (!type || type === 'slack_templates' || type === 'all') {
      let slackQuery = supabase.from('slack_templates').select('*').order('category', { ascending: true });
      
      if (category) slackQuery = slackQuery.eq('category', category);
      if (enabled !== null) slackQuery = slackQuery.eq('enabled', enabled === 'true');
      
      const { data: slackTemplates, error: slackError } = await slackQuery;
      
      if (slackError) {
        console.error('Error fetching Slack templates:', slackError);
      } else {
        results.slack_templates = slackTemplates || [];
      }
    }

    // Fetch Email templates
    if (!type || type === 'email_templates' || type === 'all') {
      let emailQuery = supabase.from('email_templates').select('*').order('category', { ascending: true });
      
      if (category) emailQuery = emailQuery.eq('category', category);
      if (enabled !== null) emailQuery = emailQuery.eq('enabled', enabled === 'true');
      
      const { data: emailTemplates, error: emailError } = await emailQuery;
      
      if (emailError) {
        console.error('Error fetching Email templates:', emailError);
      } else {
        results.email_templates = emailTemplates || [];
      }
    }

    // Fetch System messages
    if (!type || type === 'system_messages' || type === 'all') {
      let systemQuery = supabase.from('system_messages').select('*').order('category', { ascending: true });
      
      if (category) systemQuery = systemQuery.eq('category', category);
      if (enabled !== null) systemQuery = systemQuery.eq('enabled', enabled === 'true');
      
      const { data: systemMessages, error: systemError } = await systemQuery;
      
      if (systemError) {
        console.error('Error fetching System messages:', systemError);
      } else {
        results.system_messages = systemMessages || [];
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      metadata: {
        total_ai_prompts: results.ai_prompts?.length || 0,
        total_slack_templates: results.slack_templates?.length || 0,
        total_email_templates: results.email_templates?.length || 0,
        total_system_messages: results.system_messages?.length || 0,
        fetched_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Admin prompts GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/prompts - Create new prompt/template
export async function POST(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database connection not available' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { table, data } = body;

    if (!table || !data) {
      return NextResponse.json(
        { success: false, error: 'Table and data are required' },
        { status: 400 }
      );
    }

    // Validate table name
    const validTables = ['ai_prompts', 'slack_templates', 'email_templates', 'system_messages'];
    if (!validTables.includes(table)) {
      return NextResponse.json(
        { success: false, error: 'Invalid table name' },
        { status: 400 }
      );
    }

    // Add timestamps and defaults
    const insertData = {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'admin_user' // Could be enhanced with actual user tracking
    };

    const { data: result, error } = await supabase
      .from(table)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error(`Error creating ${table}:`, error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `${table.replace('_', ' ')} created successfully`
    });

  } catch (error) {
    console.error('Admin prompts POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/prompts - Update existing prompt/template
export async function PUT(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database connection not available' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { table, id, data } = body;

    if (!table || !id || !data) {
      return NextResponse.json(
        { success: false, error: 'Table, ID, and data are required' },
        { status: 400 }
      );
    }

    // Validate table name
    const validTables = ['ai_prompts', 'slack_templates', 'email_templates', 'system_messages'];
    if (!validTables.includes(table)) {
      return NextResponse.json(
        { success: false, error: 'Invalid table name' },
        { status: 400 }
      );
    }

    // Update data (updated_at will be set by trigger)
    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    };

    const { data: result, error } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating ${table}:`, error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `${table.replace('_', ' ')} updated successfully`
    });

  } catch (error) {
    console.error('Admin prompts PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/prompts - Delete prompt/template
export async function DELETE(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database connection not available' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');
    const id = searchParams.get('id');

    if (!table || !id) {
      return NextResponse.json(
        { success: false, error: 'Table and ID are required' },
        { status: 400 }
      );
    }

    // Validate table name
    const validTables = ['ai_prompts', 'slack_templates', 'email_templates', 'system_messages'];
    if (!validTables.includes(table)) {
      return NextResponse.json(
        { success: false, error: 'Invalid table name' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting from ${table}:`, error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${table.replace('_', ' ')} deleted successfully`
    });

  } catch (error) {
    console.error('Admin prompts DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}