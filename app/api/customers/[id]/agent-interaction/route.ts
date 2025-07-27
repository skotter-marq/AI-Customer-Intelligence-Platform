import { NextRequest, NextResponse } from 'next/server';

interface AgentInteractionRequest {
  agentId: string;
  action: string;
  result: 'sent' | 'delivered' | 'opened' | 'clicked' | 'responded' | 'bounced' | 'failed';
  data?: {
    emailType?: string;
    template?: string;
    subject?: string;
    errorMessage?: string;
    responseContent?: string;
    [key: string]: any;
  };
}

// Mock customer interactions storage (in real app, this would be a database)
const customerInteractions: { [customerId: string]: any[] } = {};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params;
    const body: AgentInteractionRequest = await request.json();
    const { agentId, action, result, data = {} } = body;

    console.log(`Logging interaction for customer ${customerId}:`, { agentId, action, result });

    // Create interaction record
    const interaction = {
      id: `interaction-${Date.now()}`,
      customer_id: customerId,
      agent_id: agentId,
      action,
      result,
      data,
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    // Store interaction
    if (!customerInteractions[customerId]) {
      customerInteractions[customerId] = [];
    }
    customerInteractions[customerId].push(interaction);

    // Update customer engagement score based on interaction
    const updatedScore = await updateCustomerEngagementScore(customerId, interaction);

    // Generate follow-up actions if needed
    const followUpActions = generateFollowUpActions(interaction, result);

    console.log(`Interaction logged successfully for customer ${customerId}`);

    return NextResponse.json({
      success: true,
      interaction_id: interaction.id,
      updated_engagement_score: updatedScore,
      follow_up_actions: followUpActions,
      message: 'Interaction logged successfully'
    });

  } catch (error) {
    console.error('Error logging agent interaction:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params;
    const interactions = customerInteractions[customerId] || [];

    // Sort by timestamp (most recent first)
    const sortedInteractions = interactions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      success: true,
      data: sortedInteractions,
      total: sortedInteractions.length,
      customer_id: customerId
    });

  } catch (error) {
    console.error('Error getting customer interactions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateCustomerEngagementScore(customerId: string, interaction: any): Promise<number> {
  // Get current customer interactions
  const interactions = customerInteractions[customerId] || [];
  
  // Calculate engagement score based on interaction history
  let score = 50; // Base score
  
  // Recent interactions boost score
  const recentInteractions = interactions.filter(i => {
    const daysSince = (Date.now() - new Date(i.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 30;
  });
  
  recentInteractions.forEach(i => {
    switch (i.result) {
      case 'responded':
        score += 15;
        break;
      case 'clicked':
        score += 10;
        break;
      case 'opened':
        score += 5;
        break;
      case 'delivered':
        score += 2;
        break;
      case 'bounced':
      case 'failed':
        score -= 5;
        break;
    }
  });

  // Cap the score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // In a real app, you would update the customer record in the database here
  console.log(`Updated engagement score for customer ${customerId}: ${score}`);

  return score;
}

function generateFollowUpActions(interaction: any, result: string): string[] {
  const actions: string[] = [];

  switch (result) {
    case 'responded':
      actions.push('schedule_follow_up_call');
      actions.push('update_crm_opportunity');
      actions.push('notify_account_manager');
      break;
      
    case 'clicked':
      actions.push('send_follow_up_email');
      actions.push('track_product_interest');
      break;
      
    case 'opened':
      actions.push('wait_for_response');
      actions.push('schedule_follow_up_in_3_days');
      break;
      
    case 'bounced':
      actions.push('update_contact_information');
      actions.push('try_alternative_contact');
      break;
      
    case 'failed':
      actions.push('investigate_delivery_issue');
      actions.push('retry_with_different_approach');
      break;
      
    default:
      actions.push('monitor_engagement');
  }

  // Add agent-specific actions
  if (interaction.action === 'renewal_email_sent') {
    actions.push('track_renewal_interest');
    if (result === 'responded') {
      actions.push('prepare_renewal_proposal');
    }
  } else if (interaction.action === 'health_check_sent') {
    actions.push('monitor_health_improvement');
    if (result === 'responded') {
      actions.push('schedule_health_review_call');
    }
  }

  return actions;
}

// Endpoint to get interaction analytics
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params;
    const interactions = customerInteractions[customerId] || [];

    // Generate analytics
    const analytics = {
      total_interactions: interactions.length,
      success_rate: interactions.length > 0 ? 
        (interactions.filter(i => ['responded', 'clicked', 'opened'].includes(i.result)).length / interactions.length) * 100 : 0,
      response_rate: interactions.length > 0 ?
        (interactions.filter(i => i.result === 'responded').length / interactions.length) * 100 : 0,
      last_interaction: interactions.length > 0 ? interactions[interactions.length - 1] : null,
      interaction_types: interactions.reduce((acc: any, i) => {
        acc[i.action] = (acc[i.action] || 0) + 1;
        return acc;
      }, {}),
      results_breakdown: interactions.reduce((acc: any, i) => {
        acc[i.result] = (acc[i.result] || 0) + 1;
        return acc;
      }, {})
    };

    return NextResponse.json({
      success: true,
      customer_id: customerId,
      analytics
    });

  } catch (error) {
    console.error('Error generating interaction analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}