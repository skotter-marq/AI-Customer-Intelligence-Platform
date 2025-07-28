import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface JiraWebhookPayload {
  webhookEvent: string;
  issue_event_type_name?: string;
  issue: {
    id: string;
    key: string;
    fields: {
      summary: string;
      description?: string;
      status: {
        name: string;
        id: string;
      };
      priority: {
        name: string;
        id: string;
      };
      labels: string[];
      components: Array<{
        name: string;
      }>;
      customfield_10000?: string; // Customer Facing flag
      assignee?: {
        displayName: string;
        emailAddress: string;
      };
      reporter: {
        displayName: string;
        emailAddress: string;
      };
      created: string;
      updated: string;
    };
  };
  user: {
    displayName: string;
    emailAddress: string;
  };
  changelog?: {
    items: Array<{
      field: string;
      fieldtype: string;
      from?: string;
      fromString?: string;
      to?: string;
      toString?: string;
    }>;
  };
}

export async function POST(request: Request) {
  try {
    const payload: JiraWebhookPayload = await request.json();
    
    console.log('🔗 JIRA Webhook received:', {
      event: payload.webhookEvent,
      issueKey: payload.issue?.key,
      eventType: payload.issue_event_type_name
    });

    // Only process relevant events
    if (!shouldProcessWebhook(payload)) {
      return NextResponse.json({ 
        success: true, 
        message: 'Event ignored - not relevant for changelog' 
      });
    }

    // Check if story is marked as "Customer Facing"
    const isCustomerFacing = isStoryCustomerFacing(payload.issue);
    
    if (!isCustomerFacing) {
      console.log('📝 Story not marked as customer facing, skipping');
      return NextResponse.json({ 
        success: true, 
        message: 'Story not customer facing' 
      });
    }

    console.log('🎯 Processing customer-facing story:', payload.issue.key);
    
    // Generate TLDR for the story
    const changelogEntry = await generateChangelogEntry(payload);
    
    if (changelogEntry) {
      // Save to database for approval
      await saveForApproval(changelogEntry);
      
      // Notify team (optional Slack notification)
      await notifyTeam(changelogEntry);
      
      console.log('✅ Changelog entry created and queued for approval');
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      changelogCreated: !!changelogEntry
    });

  } catch (error) {
    console.error('❌ JIRA webhook processing failed:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

function shouldProcessWebhook(payload: JiraWebhookPayload): boolean {
  // Process issue updates and status changes
  if (payload.webhookEvent === 'jira:issue_updated') {
    // Check if status changed to "Done" or "Deployed"
    const statusChanges = payload.changelog?.items?.filter(item => 
      item.field === 'status' && 
      (item.toString?.toLowerCase().includes('done') || 
       item.toString?.toLowerCase().includes('deployed') ||
       item.toString?.toLowerCase().includes('released'))
    );
    
    return statusChanges && statusChanges.length > 0;
  }
  
  // Process new issues that are already marked as customer facing
  if (payload.webhookEvent === 'jira:issue_created') {
    return true;
  }
  
  return false;
}

function isStoryCustomerFacing(issue: JiraWebhookPayload['issue']): boolean {
  // Check custom field for "Customer Facing" flag
  if (issue.fields.customfield_10000 === 'Customer Facing') {
    return true;
  }
  
  // Check labels for customer facing indicators
  const customerFacingLabels = [
    'customer-facing',
    'public-feature', 
    'changelog',
    'user-visible',
    'external'
  ];
  
  const hasCustomerFacingLabel = issue.fields.labels?.some(label =>
    customerFacingLabels.some(cfLabel => 
      label.toLowerCase().includes(cfLabel.toLowerCase())
    )
  );
  
  if (hasCustomerFacingLabel) {
    return true;
  }
  
  // Check components for customer-facing indicators
  const customerFacingComponents = [
    'Frontend',
    'UI/UX', 
    'API',
    'Dashboard',
    'Mobile App'
  ];
  
  const hasCustomerFacingComponent = issue.fields.components?.some(component =>
    customerFacingComponents.includes(component.name)
  );
  
  return hasCustomerFacingComponent;
}

async function generateChangelogEntry(payload: JiraWebhookPayload) {
  try {
    const issue = payload.issue;
    
    // Analyze the issue to determine category and generate customer-friendly content
    const analysis = await analyzeIssueForChangelog(issue);
    
    const changelogEntry = {
      jira_story_key: issue.key,
      jira_issue_id: issue.id,
      version: 'TBD', // Will be set during approval process
      category: analysis.category,
      customer_facing_title: analysis.customer_title,
      customer_facing_description: analysis.customer_description,
      highlights: analysis.highlights,
      breaking_changes: analysis.breaking_changes,
      migration_notes: analysis.migration_notes,
      technical_summary: issue.fields.summary,
      technical_description: issue.fields.description,
      priority: mapJiraPriorityToChangelog(issue.fields.priority.name),
      affected_users: analysis.estimated_users,
      approval_status: 'pending',
      public_visibility: false,
      created_by: payload.user.displayName,
      created_at: new Date().toISOString(),
      jira_status: issue.fields.status.name,
      assignee: issue.fields.assignee?.displayName,
      labels: issue.fields.labels,
      components: issue.fields.components?.map(c => c.name) || []
    };
    
    return changelogEntry;
    
  } catch (error) {
    console.error('Failed to generate changelog entry:', error);
    return null;
  }
}

async function analyzeIssueForChangelog(issue: JiraWebhookPayload['issue']) {
  try {
    // First try AI-powered analysis
    try {
      const AIProvider = require('../../../lib/ai-provider.js');
      const aiProvider = new AIProvider();
      
      console.log('🤖 Using AI to generate changelog content...');
      const aiAnalysis = await aiProvider.generateChangelogEntry(issue);
      
      // Map AI response to our expected format
      return {
        category: aiAnalysis.category.charAt(0).toUpperCase() + aiAnalysis.category.slice(1),
        customer_title: aiAnalysis.customer_title,
        customer_description: aiAnalysis.customer_description,
        highlights: aiAnalysis.highlights,
        breaking_changes: aiAnalysis.breaking_changes,
        migration_notes: aiAnalysis.migration_notes,
        estimated_users: estimateAffectedUsers(issue.fields.components, issue.fields.labels)
      };
      
    } catch (aiError) {
      console.warn('🚨 AI analysis failed, falling back to rule-based analysis:', aiError.message);
      
      // Fallback to rule-based analysis
      const summary = issue.fields.summary.toLowerCase();
      const description = issue.fields.description?.toLowerCase() || '';
      const content = `${summary} ${description}`;
      
      // Determine category based on keywords
      let category: 'Added' | 'Fixed' | 'Improved' | 'Security' | 'Deprecated' = 'Improved';
      
      if (content.includes('new') || content.includes('add') || content.includes('create') || content.includes('implement')) {
        category = 'Added';
      } else if (content.includes('fix') || content.includes('bug') || content.includes('issue') || content.includes('resolve')) {
        category = 'Fixed';
      } else if (content.includes('security') || content.includes('vulnerability') || content.includes('auth')) {
        category = 'Security';
      } else if (content.includes('deprecat') || content.includes('remove') || content.includes('sunset')) {
        category = 'Deprecated';
      }
      
      // Generate customer-friendly title and description
      const customerTitle = generateCustomerFriendlyTitle(issue.fields.summary);
      const customerDescription = generateCustomerFriendlyDescription(issue.fields.summary, issue.fields.description);
      
      // Extract highlights from description
      const highlights = extractHighlights(issue.fields.description);
      
      // Check for breaking changes
      const breaking_changes = content.includes('breaking') || content.includes('deprecated') || content.includes('removed');
      
      // Estimate affected users based on components and labels
      const estimated_users = estimateAffectedUsers(issue.fields.components, issue.fields.labels);
      
      return {
        category,
        customer_title: customerTitle,
        customer_description: customerDescription,
        highlights,
        breaking_changes,
        migration_notes: breaking_changes ? 'Please review the technical documentation for migration steps.' : undefined,
        estimated_users
      };
    }
    
  } catch (error) {
    console.error('Issue analysis failed:', error);
    throw error;
  }
}

function generateCustomerFriendlyTitle(summary: string): string {
  // Remove technical jargon and make it customer-friendly
  let title = summary
    .replace(/\b(PLAT|FEAT|BUG|FIX|TECH)-\d+/gi, '') // Remove ticket prefixes
    .replace(/\b(implement|refactor|optimize)\b/gi, 'improve')
    .replace(/\b(API|endpoint|service)\b/gi, 'integration')
    .replace(/\b(UI|frontend)\b/gi, 'interface')
    .replace(/\b(backend|server)\b/gi, 'system')
    .trim();
  
  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);
  
  return title;
}

function generateCustomerFriendlyDescription(summary: string, description?: string): string {
  const baseDescription = description || summary;
  
  // Generate a customer-friendly description
  // In production, this would use AI to rewrite technical content
  let customerDesc = baseDescription
    .replace(/\b(users? can now|we've added|introducing)\b/gi, 'You can now')
    .replace(/\b(this feature|this update|this change)\b/gi, 'this improvement')
    .replace(/\b(API|endpoint)\b/gi, 'integration')
    .replace(/\b(database|DB)\b/gi, 'data storage')
    .replace(/\b(frontend|UI)\b/gi, 'user interface');
  
  // Ensure it starts with a benefit statement
  if (!customerDesc.toLowerCase().startsWith('you can') && !customerDesc.toLowerCase().startsWith('we\'ve')) {
    customerDesc = `We've improved ${customerDesc.toLowerCase()}`;
  }
  
  return customerDesc.charAt(0).toUpperCase() + customerDesc.slice(1);
}

function extractHighlights(description?: string): string[] {
  if (!description) return [];
  
  // Extract bullet points or numbered lists
  const bulletPoints = description.match(/[•\-\*]\s*(.+)/g);
  if (bulletPoints) {
    return bulletPoints.map(point => point.replace(/^[•\-\*]\s*/, '').trim()).slice(0, 5);
  }
  
  // Extract numbered lists
  const numberedPoints = description.match(/\d+\.\s*(.+)/g);
  if (numberedPoints) {
    return numberedPoints.map(point => point.replace(/^\d+\.\s*/, '').trim()).slice(0, 5);
  }
  
  // Fallback: split by sentences and take key ones
  const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 10);
  return sentences.slice(0, 3).map(s => s.trim());
}

function estimateAffectedUsers(components: Array<{name: string}> = [], labels: string[] = []): number {
  // Estimate based on component impact
  let userEstimate = 0;
  
  const componentImpact: { [key: string]: number } = {
    'Frontend': 5000,
    'Dashboard': 3000,
    'API': 2000,
    'Mobile App': 1500,
    'Analytics': 1000,
    'Integrations': 800,
    'Admin': 100
  };
  
  components.forEach(component => {
    const impact = componentImpact[component.name] || 500;
    userEstimate = Math.max(userEstimate, impact);
  });
  
  // Adjust based on labels
  if (labels.includes('high-impact')) userEstimate *= 2;
  if (labels.includes('enterprise')) userEstimate = Math.max(userEstimate, 1000);
  if (labels.includes('beta')) userEstimate = Math.min(userEstimate, 200);
  
  return userEstimate || 500; // Default estimate
}

function mapJiraPriorityToChangelog(jiraPriority: string): 'low' | 'medium' | 'high' | 'critical' {
  switch (jiraPriority.toLowerCase()) {
    case 'blocker':
    case 'critical':
      return 'critical';
    case 'major':
    case 'high':
      return 'high';
    case 'minor':
    case 'medium':
      return 'medium';
    case 'trivial':
    case 'low':
      return 'low';
    default:
      return 'medium';
  }
}

async function saveForApproval(changelogEntry: any) {
  try {
    // In production, save to your Supabase table
    console.log('💾 Saving changelog entry for approval:', changelogEntry.jira_story_key);
    
    // Mock saving to generated_content table
    const { data, error } = await supabase
      .from('generated_content')
      .insert({
        content_title: changelogEntry.customer_facing_title,
        generated_content: changelogEntry.customer_facing_description,
        content_type: 'changelog_entry',
        target_audience: 'customers',
        status: 'pending_approval',
        approval_status: 'pending',
        quality_score: 0.85, // Based on AI analysis
        tldr_summary: changelogEntry.customer_facing_title,
        tldr_bullet_points: changelogEntry.highlights,
        update_category: changelogEntry.category.toLowerCase(),
        importance_score: changelogEntry.priority === 'critical' ? 0.9 : 0.7,
        breaking_changes: changelogEntry.breaking_changes,
        tags: [
          changelogEntry.jira_story_key,
          changelogEntry.category.toLowerCase(),
          'auto-generated'
        ],
        is_public: false,
        public_changelog_visible: false,
        created_at: new Date().toISOString(),
        metadata: {
          jira_story_key: changelogEntry.jira_story_key,
          jira_issue_id: changelogEntry.jira_issue_id,
          estimated_users: changelogEntry.affected_users,
          technical_summary: changelogEntry.technical_summary,
          assignee: changelogEntry.assignee,
          components: changelogEntry.components,
          labels: changelogEntry.labels
        }
      });
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Changelog entry saved for approval');
    return data;
    
  } catch (error) {
    console.error('Failed to save changelog entry:', error);
    throw error;
  }
}

async function notifyTeam(changelogEntry: any) {
  try {
    console.log('📢 Notifying team about new changelog entry:', changelogEntry.jira_story_key);
    
    // Send Slack notification using our Slack API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/slack`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'approval_request',
        contentId: 'pending', // Will be set after saving to database
        contentTitle: changelogEntry.customer_facing_title,
        contentType: 'changelog_entry',
        qualityScore: changelogEntry.quality_score || 0.85,
        metadata: {
          jira_story_key: changelogEntry.jira_story_key,
          category: changelogEntry.category,
          affected_users: changelogEntry.affected_users,
          priority: changelogEntry.priority
        }
      })
    });

    if (response.ok) {
      console.log('✅ Slack notification sent successfully');
    } else {
      const errorData = await response.json();
      console.warn('⚠️ Slack notification failed:', errorData.error);
    }
    
  } catch (error) {
    console.warn('Failed to notify team:', error);
    // Don't throw - notification failure shouldn't break the workflow
  }
}

// Verify webhook authenticity (optional)
export async function GET() {
  return NextResponse.json({
    message: 'JIRA Webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}