import { NextRequest, NextResponse } from 'next/server';
import { n8nIntegration } from '../../../../lib/n8n-integration';
import type { AgentWorkflowConfig } from '../../../../lib/n8n-integration';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      agentId,
      agentType, 
      name,
      schedule,
      customerQuery,
      competitorIds,
      emailTemplates,
      settings
    } = body;

    console.log('Creating n8n workflow for agent:', { agentId, agentType, name });

    // Build the workflow configuration
    const workflowConfig: AgentWorkflowConfig = {
      agentId,
      agentType,
      name,
      schedule,
      customerQuery,
      competitorIds,
      emailTemplates,
      settings
    };

    // Create the workflow in n8n
    const workflowId = await n8nIntegration.createAgentWorkflow(workflowConfig);

    console.log(`Successfully created n8n workflow: ${workflowId}`);

    return NextResponse.json({
      success: true,
      workflowId,
      message: 'Workflow created successfully'
    });

  } catch (error) {
    console.error('Error creating n8n workflow:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create workflow',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Agent workflow creation endpoint is ready',
    timestamp: new Date().toISOString()
  });
}