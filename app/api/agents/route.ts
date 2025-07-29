import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase-client';

interface Agent {
  id: string;
  name: string;
  description: string;
  agent_type: string;
  model: string;
  temperature: number;
  max_tokens: number;
  system_prompt: string;
  capabilities: string[];
  tools: string[];
  available_functions: string[];
  webhook_url?: string;
  api_endpoint?: string;
  auth_method: 'none' | 'api_key' | 'bearer' | 'basic';
  auth_token?: string;
  total_conversations: number;
  successful_completions: number;
  average_response_time: number;
  success_rate: number;
  status: 'active' | 'inactive' | 'training' | 'error' | 'maintenance';
  version: string;
  created_by: string;
  tags: string[];
  use_cases: string[];
  target_audience: string;
  business_value: string;
  created_at: string;
  updated_at: string;
  last_active_at?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const agent_type = searchParams.get('agent_type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const include_analytics = searchParams.get('include_analytics') === 'true';
    const include_conversations = searchParams.get('include_conversations') === 'true';

    // Build base query
    let query = supabase
      .from('agents')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(limit);

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (agent_type && agent_type !== 'all') {
      query = query.eq('agent_type', agent_type);
    }

    const { data: agents, error } = await query;

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch agents', details: error.message },
        { status: 500 }
      );
    }

    // Enhance agents with additional data if requested
    let enhancedAgents = agents || [];

    if (include_analytics) {
      // Fetch recent analytics for each agent
      enhancedAgents = await Promise.all(
        (agents || []).map(async (agent) => {
          const { data: analytics } = await supabase
            .from('agent_analytics')
            .select('*')
            .eq('agent_id', agent.id)
            .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
            .order('date', { ascending: false });

          const recentAnalytics = analytics || [];
          const totalConversations = recentAnalytics.reduce((sum, a) => sum + (a.conversation_count || 0), 0);
          const avgResponseTime = recentAnalytics.length > 0 
            ? recentAnalytics.reduce((sum, a) => sum + (a.average_response_time || 0), 0) / recentAnalytics.length 
            : 0;
          const avgRating = recentAnalytics.length > 0 
            ? recentAnalytics.reduce((sum, a) => sum + (a.average_user_rating || 0), 0) / recentAnalytics.length 
            : 0;

          return {
            ...agent,
            recent_analytics: {
              conversations_this_week: totalConversations,
              average_response_time: Math.round(avgResponseTime),
              average_rating: Math.round(avgRating * 10) / 10,
              analytics_data: recentAnalytics.slice(0, 7) // Last 7 days
            }
          };
        })
      );
    }

    if (include_conversations) {
      // Fetch recent conversations for each agent
      enhancedAgents = await Promise.all(
        enhancedAgents.map(async (agent) => {
          const { data: conversations } = await supabase
            .from('agent_conversations')
            .select('id, user_message, agent_response, status, created_at, user_feedback, response_time_ms')
            .eq('agent_id', agent.id)
            .order('created_at', { ascending: false })
            .limit(5);

          return {
            ...agent,
            recent_conversations: conversations || []
          };
        })
      );
    }

    // Get deployment status for each agent
    const agentsWithDeployment = await Promise.all(
      enhancedAgents.map(async (agent) => {
        const { data: deployment } = await supabase
          .from('agent_deployments')
          .select('environment, deployment_status, health_status, last_health_check')
          .eq('agent_id', agent.id)
          .order('deployed_at', { ascending: false })
          .limit(1)
          .single();

        return {
          ...agent,
          deployment: deployment || {
            environment: 'none',
            deployment_status: 'inactive',
            health_status: 'unknown',
            last_health_check: null
          }
        };
      })
    );

    // Calculate summary statistics
    const summary = {
      total_agents: agentsWithDeployment.length,
      active_agents: agentsWithDeployment.filter(a => a.status === 'active').length,
      total_conversations: agentsWithDeployment.reduce((sum, a) => sum + (a.total_conversations || 0), 0),
      average_success_rate: agentsWithDeployment.length > 0 
        ? agentsWithDeployment.reduce((sum, a) => sum + (a.success_rate || 0), 0) / agentsWithDeployment.length 
        : 0,
      agents_by_type: agentsWithDeployment.reduce((acc: Record<string, number>, agent) => {
        acc[agent.agent_type] = (acc[agent.agent_type] || 0) + 1;
        return acc;
      }, {}),
      agents_by_status: agentsWithDeployment.reduce((acc: Record<string, number>, agent) => {
        acc[agent.status] = (acc[agent.status] || 0) + 1;
        return acc;
      }, {})
    };

    return NextResponse.json({
      success: true,
      agents: agentsWithDeployment,
      summary,
      total: agentsWithDeployment.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Agents API error:', error);
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
      agent_type,
      model = 'gpt-4',
      temperature = 0.7,
      max_tokens = 2000,
      system_prompt,
      capabilities = [],
      tools = [],
      available_functions = [],
      webhook_url,
      api_endpoint,
      auth_method = 'none',
      auth_token,
      use_cases = [],
      target_audience,
      business_value,
      tags = [],
      status = 'inactive'
    } = body;

    // Validation
    if (!name || !description || !agent_type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, agent_type' },
        { status: 400 }
      );
    }

    // Create agent in database
    const { data: newAgent, error } = await supabase
      .from('agents')
      .insert([{
        name,
        description,
        agent_type,
        model,
        temperature,
        max_tokens,
        system_prompt,
        capabilities,
        tools,
        available_functions,
        webhook_url,
        api_endpoint,
        auth_method,
        auth_token: auth_method !== 'none' ? auth_token : null,
        use_cases,
        target_audience,
        business_value,
        tags,
        status,
        created_by: 'api' // In a real app, this would be the authenticated user
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to create agent:', error);
      return NextResponse.json(
        { error: 'Failed to create agent', details: error.message },
        { status: 500 }
      );
    }

    // Create initial deployment record
    await supabase
      .from('agent_deployments')
      .insert([{
        agent_id: newAgent.id,
        environment: 'development',
        deployment_status: 'inactive',
        health_status: 'unknown',
        deployed_by: 'api'
      }]);

    return NextResponse.json({
      success: true,
      agent: newAgent,
      message: 'Agent created successfully',
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Create agent error:', error);
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
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    // Update agent in database
    const { data: updatedAgent, error } = await supabase
      .from('agents')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to update agent:', error);
      return NextResponse.json(
        { error: 'Failed to update agent', details: error.message },
        { status: 500 }
      );
    }

    // If status changed to active, update deployment
    if (body.status === 'active') {
      await supabase
        .from('agent_deployments')
        .update({
          deployment_status: 'active',
          health_status: 'healthy',
          last_health_check: new Date().toISOString()
        })
        .eq('agent_id', id);
    }

    return NextResponse.json({
      success: true,
      agent: updatedAgent,
      message: 'Agent updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Update agent error:', error);
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
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    // Get agent details before deletion
    const { data: agent } = await supabase
      .from('agents')
      .select('name, total_conversations')
      .eq('id', id)
      .single();

    // Delete from database (cascades to related tables)
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Failed to delete agent:', error);
      return NextResponse.json(
        { error: 'Failed to delete agent', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Agent deleted successfully',
      deleted_agent: {
        name: agent?.name,
        conversations_archived: agent?.total_conversations || 0
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Delete agent error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}