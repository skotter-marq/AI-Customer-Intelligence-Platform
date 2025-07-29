import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase-client';

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
  settings: any;
  createdAt: string;
  updatedAt: string;
  versionId: string;
}

interface N8nExecution {
  id: string;
  finished: boolean;
  mode: string;
  retryOf?: string;
  retrySuccessId?: string;
  startedAt: string;
  stoppedAt?: string;
  workflowData: any;
}

// Helper function to make n8n API requests
async function makeN8nRequest(endpoint: string, options: RequestInit = {}) {
  const n8nUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
  const apiKey = process.env.N8N_API_KEY;
  
  if (!apiKey) {
    throw new Error('N8N_API_KEY environment variable is required');
  }

  const response = await fetch(`${n8nUrl}/api/v1${endpoint}`, {
    ...options,
    headers: {
      'X-N8N-API-KEY': apiKey,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`n8n API error: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const limit = searchParams.get('limit') || '50';

    // Fetch workflows from n8n
    let n8nWorkflows: N8nWorkflow[] = [];
    try {
      n8nWorkflows = await makeN8nRequest('/workflows');
    } catch (error) {
      console.warn('⚠️ n8n API not available, using database workflows only:', error);
    }

    // Fetch workflow metadata from our database
    let query = supabase
      .from('workflows')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(parseInt(limit));

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: dbWorkflows, error } = await query;

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch workflows', details: error.message },
        { status: 500 }
      );
    }

    // Merge n8n data with database metadata
    const mergedWorkflows = (dbWorkflows || []).map(dbWorkflow => {
      const n8nWorkflow = n8nWorkflows.find(nw => nw.id === dbWorkflow.n8n_workflow_id);
      
      return {
        ...dbWorkflow,
        // n8n specific data
        n8n_active: n8nWorkflow?.active || false,
        n8n_nodes: n8nWorkflow?.nodes || [],
        n8n_updated_at: n8nWorkflow?.updatedAt,
        node_count: n8nWorkflow?.nodes?.length || 0,
        
        // Calculate complexity score based on nodes and connections
        complexity_score: calculateComplexityScore(n8nWorkflow),
        
        // Enhanced status
        actual_status: n8nWorkflow ? (n8nWorkflow.active ? 'active' : 'inactive') : 'disconnected'
      };
    });

    // Add workflows that exist in n8n but not in our database
    const orphanedWorkflows = n8nWorkflows
      .filter(nw => !dbWorkflows?.some(dw => dw.n8n_workflow_id === nw.id))
      .map(nw => ({
        id: `n8n-${nw.id}`,
        name: nw.name,
        n8n_workflow_id: nw.id,
        status: nw.active ? 'active' : 'inactive',
        category: 'unassigned',
        n8n_active: nw.active,
        n8n_nodes: nw.nodes,
        n8n_updated_at: nw.updatedAt,
        node_count: nw.nodes?.length || 0,
        complexity_score: calculateComplexityScore(nw),
        actual_status: nw.active ? 'active' : 'inactive',
        created_at: nw.createdAt,
        updated_at: nw.updatedAt,
        description: 'Imported from n8n',
        is_orphaned: true
      }));

    const allWorkflows = [...mergedWorkflows, ...orphanedWorkflows];

    // Fetch execution statistics for each workflow
    const workflowsWithStats = await Promise.all(
      allWorkflows.map(async (workflow) => {
        if (!workflow.n8n_workflow_id) return workflow;

        try {
          const executions = await makeN8nRequest(
            `/executions?workflowId=${workflow.n8n_workflow_id}&limit=10`
          );
          
          const recentExecutions = executions.data || [];
          const successful = recentExecutions.filter((e: N8nExecution) => e.finished && !e.retryOf).length;
          const failed = recentExecutions.filter((e: N8nExecution) => !e.finished && !e.retryOf).length;
          
          return {
            ...workflow,
            recent_executions: recentExecutions.slice(0, 5),
            executions_this_week: recentExecutions.length,
            success_rate: recentExecutions.length > 0 ? (successful / recentExecutions.length) * 100 : 0,
            last_execution: recentExecutions[0]?.startedAt || null
          };
        } catch (error) {
          console.warn(`⚠️ Failed to fetch executions for workflow ${workflow.id}:`, error);
          return workflow;
        }
      })
    );

    return NextResponse.json({
      success: true,
      workflows: workflowsWithStats,
      total: workflowsWithStats.length,
      n8n_connected: n8nWorkflows.length > 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Workflows API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      category,
      n8n_instance_url,
      n8n_workflow_id,
      webhook_url,
      auth_method,
      api_key,
      username,
      password,
      trigger_type,
      is_active,
      timeout,
      retry_on_failure,
      max_retries,
      response_mode,
      response_format,
      environment
    } = body;

    // Validation
    if (!name || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, category' },
        { status: 400 }
      );
    }

    // If n8n_workflow_id is provided, verify it exists in n8n
    let n8nWorkflow = null;
    if (n8n_workflow_id) {
      try {
        n8nWorkflow = await makeN8nRequest(`/workflows/${n8n_workflow_id}`);
      } catch (error) {
        return NextResponse.json(
          { error: `n8n workflow not found: ${n8n_workflow_id}` },
          { status: 404 }
        );
      }
    }

    // Create workflow in database
    const { data: newWorkflow, error } = await supabase
      .from('workflows')
      .insert([{
        name,
        description,
        category,
        n8n_instance_url,
        n8n_workflow_id,
        webhook_url,
        auth_method: auth_method || 'none',
        api_key: auth_method === 'api_key' ? api_key : null,
        username: auth_method === 'basic_auth' ? username : null,
        password: auth_method === 'basic_auth' ? password : null,
        trigger_type: trigger_type || 'webhook',
        status: is_active ? 'active' : 'inactive',
        timeout: timeout || 120,
        retry_on_failure: retry_on_failure || true,
        max_retries: max_retries || 3,
        response_mode: response_mode || 'last_node',
        response_format: response_format || 'json',
        environment: environment || 'development',
        created_by: 'api' // In a real app, this would be the authenticated user
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to create workflow:', error);
      return NextResponse.json(
        { error: 'Failed to create workflow', details: error.message },
        { status: 500 }
      );
    }

    // If we have n8n workflow data, include it in the response
    const responseWorkflow = {
      ...newWorkflow,
      n8n_active: n8nWorkflow?.active || false,
      node_count: n8nWorkflow?.nodes?.length || 0,
      complexity_score: calculateComplexityScore(n8nWorkflow)
    };

    return NextResponse.json({
      success: true,
      workflow: responseWorkflow,
      message: 'Workflow created successfully',
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Create workflow error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Workflow ID is required' },
        { status: 400 }
      );
    }

    // Update workflow in database
    const { data: updatedWorkflow, error } = await supabase
      .from('workflows')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to update workflow:', error);
      return NextResponse.json(
        { error: 'Failed to update workflow', details: error.message },
        { status: 500 }
      );
    }

    // If workflow has n8n_workflow_id, try to sync status with n8n
    if (updatedWorkflow.n8n_workflow_id && body.status) {
      try {
        const isActive = body.status === 'active';
        await makeN8nRequest(`/workflows/${updatedWorkflow.n8n_workflow_id}/${isActive ? 'activate' : 'deactivate'}`, {
          method: 'POST'
        });
      } catch (error) {
        console.warn('⚠️ Failed to sync status with n8n:', error);
      }
    }

    return NextResponse.json({
      success: true,
      workflow: updatedWorkflow,
      message: 'Workflow updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Update workflow error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Workflow ID is required' },
        { status: 400 }
      );
    }

    // Get workflow details before deletion
    const { data: workflow } = await supabase
      .from('workflows')
      .select('n8n_workflow_id')
      .eq('id', id)
      .single();

    // Delete from database
    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Failed to delete workflow:', error);
      return NextResponse.json(
        { error: 'Failed to delete workflow', details: error.message },
        { status: 500 }
      );
    }

    // Note: We don't delete from n8n automatically as it might be used elsewhere
    // This could be a configuration option in the future

    return NextResponse.json({
      success: true,
      message: 'Workflow deleted successfully',
      note: workflow?.n8n_workflow_id ? 'n8n workflow was not deleted and may still be active' : null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Delete workflow error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate workflow complexity
function calculateComplexityScore(n8nWorkflow: N8nWorkflow | null): number {
  if (!n8nWorkflow || !n8nWorkflow.nodes) return 0;
  
  const nodeCount = n8nWorkflow.nodes.length;
  const connectionCount = Object.keys(n8nWorkflow.connections || {}).length;
  
  // Simple complexity formula: nodes + connections, normalized to 0-1 scale
  const rawScore = nodeCount + connectionCount;
  return Math.min(rawScore / 50, 1); // Normalize to max of 1
}