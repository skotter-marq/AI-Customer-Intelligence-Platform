import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ApprovalAction {
  action: 'approve' | 'reject' | 'request_changes' | 'get_pending' | 'get_history';
  contentId?: string;
  reviewerId?: string;
  comments?: string;
  changes?: string[];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const reviewerId = searchParams.get('reviewer_id');
    
    // Get pending approvals
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
        created_at,
        updated_at,
        tldr_summary,
        approval_status,
        reviewer_id,
        review_comments,
        review_date
      `)
      .eq('approval_status', status)
      .order('created_at', { ascending: false });

    if (reviewerId) {
      query = query.eq('reviewer_id', reviewerId);
    }

    const { data: pendingContent, error } = await query;

    if (error) {
      console.error('Error fetching pending approvals:', error);
      return NextResponse.json(
        { error: 'Failed to fetch pending approvals' },
        { status: 500 }
      );
    }

    // Get approval statistics
    const { data: stats } = await supabase
      .from('generated_content')
      .select('approval_status, status')
      .not('approval_status', 'is', null);

    const approvalStats = {
      pending: stats?.filter(s => s.approval_status === 'pending').length || 0,
      approved: stats?.filter(s => s.approval_status === 'approved').length || 0,
      rejected: stats?.filter(s => s.approval_status === 'rejected').length || 0,
      changes_requested: stats?.filter(s => s.approval_status === 'changes_requested').length || 0,
      total: stats?.length || 0
    };

    return NextResponse.json({
      success: true,
      content: pendingContent || [],
      stats: approvalStats,
      metadata: {
        status_filter: status,
        reviewer_filter: reviewerId,
        total_items: pendingContent?.length || 0
      }
    });

  } catch (error) {
    console.error('Approval GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: ApprovalAction = await request.json();
    const { action, contentId, reviewerId, comments, changes } = body;

    switch (action) {
      case 'approve':
        return await approveContent(contentId!, reviewerId, comments);
      
      case 'reject':
        return await rejectContent(contentId!, reviewerId, comments);
      
      case 'request_changes':
        return await requestChanges(contentId!, reviewerId, comments, changes);
      
      case 'get_pending':
        return await getPendingApprovals(reviewerId);
      
      case 'get_history':
        return await getApprovalHistory(contentId);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Approval POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function approveContent(contentId: string, reviewerId?: string, comments?: string) {
  try {
    const { data, error } = await supabase
      .from('generated_content')
      .update({
        approval_status: 'approved',
        status: 'published',
        reviewer_id: reviewerId || 'anonymous',
        review_comments: comments || '',
        review_date: new Date().toISOString(),
        published_at: new Date().toISOString()
      })
      .eq('id', contentId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log approval action
    await logApprovalAction(contentId, 'approved', reviewerId, comments);

    // Send notification (mock)
    await sendApprovalNotification(data, 'approved', reviewerId, comments);
    
    // Send notification through routing system
    await sendNotificationViaRouting({
      type: 'content_published',
      priority: 'medium',
      recipients: ['user1', 'user2'],
      message: {
        subject: `Content Approved: ${data.content_title}`,
        body: `Content "${data.content_title}" has been approved by ${reviewerId} and is now published.`,
        data: { contentId, reviewerId, action: 'approved' }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Content approved and published',
      content: data
    });

  } catch (error) {
    console.error('Error approving content:', error);
    return NextResponse.json(
      { error: 'Failed to approve content' },
      { status: 500 }
    );
  }
}

async function rejectContent(contentId: string, reviewerId?: string, comments?: string) {
  try {
    const { data, error } = await supabase
      .from('generated_content')
      .update({
        approval_status: 'rejected',
        status: 'rejected',
        reviewer_id: reviewerId || 'anonymous',
        review_comments: comments || '',
        review_date: new Date().toISOString()
      })
      .eq('id', contentId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log approval action
    await logApprovalAction(contentId, 'rejected', reviewerId, comments);

    // Send notification (mock)
    await sendApprovalNotification(data, 'rejected', reviewerId, comments);
    
    // Send notification through routing system
    await sendNotificationViaRouting({
      type: 'content_rejected',
      priority: 'high',
      recipients: ['user1', 'user2'],
      message: {
        subject: `Content Rejected: ${data.content_title}`,
        body: `Content "${data.content_title}" has been rejected by ${reviewerId}. ${comments ? `Reason: ${comments}` : ''}`,
        data: { contentId, reviewerId, action: 'rejected', comments }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Content rejected',
      content: data
    });

  } catch (error) {
    console.error('Error rejecting content:', error);
    return NextResponse.json(
      { error: 'Failed to reject content' },
      { status: 500 }
    );
  }
}

async function requestChanges(contentId: string, reviewerId?: string, comments?: string, changes?: string[]) {
  try {
    const { data, error } = await supabase
      .from('generated_content')
      .update({
        approval_status: 'changes_requested',
        status: 'draft',
        reviewer_id: reviewerId || 'anonymous',
        review_comments: comments || '',
        review_date: new Date().toISOString(),
        requested_changes: changes || []
      })
      .eq('id', contentId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log approval action
    await logApprovalAction(contentId, 'changes_requested', reviewerId, comments);

    // Send notification (mock)
    await sendApprovalNotification(data, 'changes_requested', reviewerId, comments);

    return NextResponse.json({
      success: true,
      message: 'Changes requested',
      content: data
    });

  } catch (error) {
    console.error('Error requesting changes:', error);
    return NextResponse.json(
      { error: 'Failed to request changes' },
      { status: 500 }
    );
  }
}

async function getPendingApprovals(reviewerId?: string) {
  try {
    let query = supabase
      .from('generated_content')
      .select('*')
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: false });

    if (reviewerId) {
      query = query.eq('reviewer_id', reviewerId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      pending_approvals: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error('Error getting pending approvals:', error);
    return NextResponse.json(
      { error: 'Failed to get pending approvals' },
      { status: 500 }
    );
  }
}

async function getApprovalHistory(contentId?: string) {
  try {
    // Mock approval history - in a real implementation, this would be from an approval_history table
    const mockHistory = [
      {
        id: '1',
        content_id: contentId,
        action: 'submitted',
        reviewer_id: 'system',
        comments: 'Content submitted for review',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        content_id: contentId,
        action: 'assigned',
        reviewer_id: 'marketing_team',
        comments: 'Assigned to marketing team for review',
        timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      history: mockHistory,
      count: mockHistory.length
    });

  } catch (error) {
    console.error('Error getting approval history:', error);
    return NextResponse.json(
      { error: 'Failed to get approval history' },
      { status: 500 }
    );
  }
}

async function logApprovalAction(contentId: string, action: string, reviewerId?: string, comments?: string) {
  try {
    // In a real implementation, this would log to an approval_history table
    console.log(`Approval action logged: ${action} for content ${contentId} by ${reviewerId || 'anonymous'}`);
    
    // Mock logging
    const logEntry = {
      content_id: contentId,
      action,
      reviewer_id: reviewerId || 'anonymous',
      comments: comments || '',
      timestamp: new Date().toISOString()
    };

    console.log('Approval log entry:', logEntry);

  } catch (error) {
    console.error('Error logging approval action:', error);
  }
}

async function sendApprovalNotification(content: any, action: string, reviewerId?: string, comments?: string) {
  try {
    // Mock notification system
    const notification = {
      to: 'content-team@company.com',
      subject: `Content ${action}: ${content.content_title}`,
      body: `
        Content has been ${action} by ${reviewerId || 'anonymous'}.
        
        Title: ${content.content_title}
        Type: ${content.content_type}
        Quality Score: ${content.quality_score}
        
        ${comments ? `Comments: ${comments}` : ''}
        
        View content: ${process.env.NEXT_PUBLIC_BASE_URL}/admin/content/${content.id}
      `,
      timestamp: new Date().toISOString()
    };

    console.log('Approval notification sent:', notification);

  } catch (error) {
    console.error('Error sending approval notification:', error);
  }
}

async function sendNotificationViaRouting(params: {
  type: string;
  priority: string;
  recipients: string[];
  message: {
    subject: string;
    body: string;
    data?: any;
  };
}) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send',
        ...params
      })
    });

    if (response.ok) {
      console.log('Notification sent via routing system');
    } else {
      console.error('Failed to send notification via routing system');
    }
  } catch (error) {
    console.error('Error sending notification via routing system:', error);
  }
}

async function sendSlackNotification(params: { message: string; channel: string; type: string }) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/slack`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send_notification',
        ...params
      })
    });

    if (response.ok) {
      console.log('Slack notification sent successfully');
    } else {
      console.error('Failed to send Slack notification');
    }
  } catch (error) {
    console.error('Error sending Slack notification:', error);
  }
}