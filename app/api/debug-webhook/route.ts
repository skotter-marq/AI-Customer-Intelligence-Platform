import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    console.log('🔗 Debug webhook received:', JSON.stringify(payload, null, 2));
    
    // Test if the payload matches expected format
    const hasWebhookEvent = payload.webhookEvent === 'jira:issue_updated';
    const hasIssue = payload.issue && payload.issue.key;
    const hasChangelog = payload.changelog && payload.changelog.items;
    
    // Check if status changed to Done
    const statusChanges = payload.changelog?.items?.filter((item: any) => 
      item.field === 'status' && 
      (item.toString?.toLowerCase().includes('done') || 
       item.toString?.toLowerCase().includes('deployed') ||
       item.toString?.toLowerCase().includes('released'))
    );
    
    // Check customer-facing criteria
    const isCustomerFacing = 
      payload.issue?.fields?.customfield_10000 === 'Customer Facing' ||
      payload.issue?.fields?.labels?.some((label: string) =>
        ['customer-facing', 'public-feature', 'changelog', 'user-visible', 'external']
          .some(cfLabel => label.toLowerCase().includes(cfLabel.toLowerCase()))
      ) ||
      payload.issue?.fields?.components?.some((component: any) =>
        ['Frontend', 'UI/UX', 'API', 'Dashboard', 'Mobile App'].includes(component.name)
      );
    
    const debug = {
      hasWebhookEvent,
      hasIssue,
      hasChangelog,
      statusChangeCount: statusChanges?.length || 0,
      statusChanges: statusChanges?.map((sc: any) => ({
        from: sc.fromString,
        to: sc.toString
      })) || [],
      isCustomerFacing,
      customerFacingReasons: {
        customField: payload.issue?.fields?.customfield_10000,
        labels: payload.issue?.fields?.labels || [],
        components: payload.issue?.fields?.components?.map((c: any) => c.name) || []
      },
      shouldProcess: hasWebhookEvent && hasIssue && statusChanges && statusChanges.length > 0 && isCustomerFacing
    };
    
    return NextResponse.json({
      success: true,
      debug,
      payload: {
        webhookEvent: payload.webhookEvent,
        issueKey: payload.issue?.key,
        summary: payload.issue?.fields?.summary,
        status: payload.issue?.fields?.status?.name
      }
    });
    
  } catch (error: any) {
    console.error('Debug webhook error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}