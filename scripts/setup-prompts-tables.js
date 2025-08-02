#!/usr/bin/env node

/**
 * Setup script to create tables and insert seed data for prompts system
 * Uses Supabase client directly for table operations
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function setupPromptsTables() {
  console.log('🚀 Setting up prompts and templates system...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test connection
    console.log('🔗 Testing Supabase connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('customers')
      .select('id')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Connection failed:', connectionError.message);
      process.exit(1);
    }
    
    console.log('✅ Supabase connection successful');
    
    // Check if prompts tables exist by trying to query them
    console.log('🔍 Checking for existing prompts tables...');
    
    const tableChecks = [
      { name: 'ai_prompts', exists: false },
      { name: 'slack_templates', exists: false },
      { name: 'system_messages', exists: false }
    ];
    
    for (const table of tableChecks) {
      try {
        const { data, error } = await supabase
          .from(table.name)
          .select('id')
          .limit(1);
        
        if (!error) {
          table.exists = true;
          console.log(`  ✅ ${table.name}: exists`);
        }
      } catch (error) {
        console.log(`  ⚠️ ${table.name}: does not exist`);
      }
    }
    
    // Insert seed data for tables that exist
    const existingTables = tableChecks.filter(t => t.exists);
    
    if (existingTables.length === 0) {
      console.log('❌ No prompts tables found. Please create them via Supabase SQL editor first.');
      console.log('\n📋 To create tables, run the following SQL in Supabase SQL editor:');
      console.log('   1. Go to your Supabase project > SQL Editor');  
      console.log('   2. Copy and paste the contents of database/schema-prompts-templates.sql');
      console.log('   3. Execute the SQL');
      console.log('   4. Then run this script again');
      process.exit(1);
    }
    
    // Seed the existing tables
    console.log('🌱 Seeding prompts and templates data...');
    
    // Seed AI prompts
    if (tableChecks.find(t => t.name === 'ai_prompts')?.exists) {
      console.log('  📝 Seeding AI prompts...');
      
      // Check if data already exists
      const { data: existingPrompts } = await supabase
        .from('ai_prompts')
        .select('id')
        .limit(1);
      
      if (!existingPrompts || existingPrompts.length === 0) {
        const aiPrompts = [
          {
            id: 'meeting-analysis',
            name: 'Meeting Transcript Analysis',
            description: 'Extracts customer insights, pain points, and opportunities from meeting transcripts',
            category: 'Meeting Analysis',
            type: 'ai_analysis',
            system_instructions: 'You are an expert customer intelligence analyst focused on extracting actionable business insights from meeting conversations.',
            user_prompt_template: `You are an expert customer intelligence analyst. Analyze the following meeting transcript and extract key insights.

MEETING CONTEXT:
- Company: {company}
- Meeting Type: {meetingType}
- Date: {date}
- Participants: {participants}

TRANSCRIPT:
{transcript}

ANALYSIS INSTRUCTIONS:
Please analyze this transcript and provide insights in the following JSON format:

{
  "insights": [
    {
      "type": "pain_point|feature_request|sentiment|opportunity|risk",
      "title": "Brief descriptive title",
      "description": "Detailed description of the insight",
      "sentiment_score": -1.0 to 1.0,
      "confidence_score": 0.0 to 1.0,
      "priority": "high|medium|low",
      "tags": ["tag1", "tag2", "tag3"],
      "quotes": ["relevant quote from transcript"]
    }
  ],
  "overall_sentiment": -1.0 to 1.0,
  "key_topics": ["topic1", "topic2", "topic3"],
  "recommended_actions": [
    {
      "action": "Brief action description",
      "priority": "high|medium|low",
      "owner": "suggested team/person",
      "timeline": "immediate|short_term|long_term"
    }
  ],
  "summary": "Brief 2-3 sentence summary of the meeting and key takeaways"
}`,
            variables: JSON.stringify(['company', 'meetingType', 'date', 'participants', 'transcript']),
            parameters: JSON.stringify({ temperature: 0.3, maxTokens: 2000, model: 'claude-3-5-sonnet-20241022' }),
            used_in: JSON.stringify(['Grain webhook processing', 'Manual meeting analysis', 'Customer insight extraction']),
            version: '2.1',
            enabled: true,
            usage_count: 347,
            last_used_at: new Date().toISOString(),
            created_by: 'system'
          },
          {
            id: 'changelog-generation',
            name: 'JIRA Changelog Generation',
            description: 'Transforms JIRA tickets into customer-friendly changelog entries for product updates',
            category: 'Content Generation',
            type: 'ai_analysis',
            system_instructions: 'You are an expert technical writer who specializes in creating customer-facing product update communications.',
            user_prompt_template: `Transform this JIRA ticket into a customer-friendly changelog entry.

JIRA TICKET DETAILS:
- Key: {jiraKey}
- Title: {title}
- Description: {description}
- Status: {status}
- Priority: {priority}
- Components: {components}
- Labels: {labels}
- Assignee: {assignee}

REQUIREMENTS:
Create a changelog entry with the following structure:

{
  "customer_title": "Customer-facing title (concise, benefit-focused)",
  "customer_description": "2-3 sentences explaining what changed and why customers should care",
  "highlights": ["Key benefit 1", "Key benefit 2", "Key benefit 3"],
  "breaking_changes": false,
  "migration_notes": "If applicable, what customers need to do",
  "affected_users": "all|enterprise|specific_plan|beta_users",
  "category": "feature_update|bug_fix|performance_improvement|security_update",
  "importance_score": 0.0 to 1.0,
  "customer_impact": "Brief description of how this affects customer workflow"
}

Focus on benefits, not technical implementation details.`,
            variables: JSON.stringify(['jiraKey', 'title', 'description', 'status', 'priority', 'components', 'labels', 'assignee']),
            parameters: JSON.stringify({ temperature: 0.2, maxTokens: 1000, model: 'claude-3-5-sonnet-20241022' }),
            used_in: JSON.stringify(['JIRA webhook automation', 'Manual changelog creation', 'Product update workflows']),
            version: '2.0',
            enabled: true,
            usage_count: 156,
            last_used_at: new Date().toISOString(),
            created_by: 'system'
          }
        ];
        
        const { error: promptsError } = await supabase
          .from('ai_prompts')
          .insert(aiPrompts);
        
        if (promptsError) {
          console.warn('⚠️ Some AI prompts may already exist:', promptsError.message);
        } else {
          console.log('    ✅ AI prompts inserted');
        }
      } else {
        console.log('    ✅ AI prompts already exist');
      }
    }
    
    // Seed Slack templates
    if (tableChecks.find(t => t.name === 'slack_templates')?.exists) {
      console.log('  💬 Seeding Slack templates...');
      
      const { data: existingTemplates } = await supabase
        .from('slack_templates')
        .select('id')
        .limit(1);
      
      if (!existingTemplates || existingTemplates.length === 0) {
        const slackTemplates = [
          {
            id: 'product-update-notification',
            name: 'Product Update Published',
            description: 'Slack notification sent when product updates are published via JIRA webhooks',
            category: 'notification',
            channel: '#int-product-updates',
            message_template: `📋 **CHANGELOG UPDATE**

**{updateTitle}** is now live

{updateDescription}{whatsNewSection}

👉 *View Details*

{mediaResources}`,
            variables: JSON.stringify(['updateTitle', 'updateDescription', 'whatsNewSection', 'mediaResources']),
            trigger_event: 'product_update_published',
            webhook_type: 'updates',
            enabled: true,
            usage_count: 445,
            last_used_at: new Date().toISOString(),
            created_by: 'system'
          },
          {
            id: 'approval-request',
            name: 'Content Approval Request',
            description: 'Message for requesting approval on changelog entries',
            category: 'approval',
            channel: '#product-changelog-approvals',
            message_template: `📋 **Changelog Entry Ready for Review**

**{jiraKey}** has been completed and needs changelog approval.

**Title:** {contentTitle}
**Category:** {category}
**Summary:** {contentSummary}

👉 **Review & Approve in Dashboard**

Click the link above to review, edit, and approve this changelog entry.`,
            variables: JSON.stringify(['jiraKey', 'contentTitle', 'category', 'contentSummary', 'qualityScore', 'contentId']),
            trigger_event: 'changelog_approval_needed',
            webhook_type: 'approvals',
            enabled: true,
            usage_count: 234,
            last_used_at: new Date().toISOString(),
            created_by: 'system'
          },
          {
            id: 'customer-insight-alert',
            name: 'High-Priority Customer Insight Alert',
            description: 'Slack alert for important customer insights detected from meeting analysis',
            category: 'alert',
            channel: '#product-meeting-insights',
            message_template: `🚨 **High-Priority Customer Insight Detected**

**Customer:** {customerName}
**Meeting:** {meetingTitle}
**Priority Score:** {priorityScore}/10

**Key Insight:**
> {insightSummary}

**Recommended Actions:**
{actionItems}

[View Full Analysis]({meetingUrl}) | [Create JIRA Ticket]({jiraCreateUrl})`,
            variables: JSON.stringify(['customerName', 'meetingTitle', 'priorityScore', 'insightSummary', 'actionItems', 'meetingUrl', 'jiraCreateUrl']),
            trigger_event: 'high_priority_insight',
            webhook_type: 'insights',
            enabled: true,
            usage_count: 178,
            last_used_at: new Date().toISOString(),
            created_by: 'system'
          }
        ];
        
        const { error: templatesError } = await supabase
          .from('slack_templates')
          .insert(slackTemplates);
        
        if (templatesError) {
          console.warn('⚠️ Some Slack templates may already exist:', templatesError.message);
        } else {
          console.log('    ✅ Slack templates inserted');
        }
      } else {
        console.log('    ✅ Slack templates already exist');
      }
    }
    
    // Seed system messages
    if (tableChecks.find(t => t.name === 'system_messages')?.exists) {
      console.log('  💬 Seeding system messages...');
      
      const { data: existingMessages } = await supabase
        .from('system_messages')
        .select('id')
        .limit(1);
      
      if (!existingMessages || existingMessages.length === 0) {
        const systemMessages = [
          {
            id: 'api-success-general',
            name: 'General API Success',
            description: 'Generic success message for API responses',
            category: 'success',
            message_template: 'Operation completed successfully',
            variables: JSON.stringify([]),
            context: 'api_response',
            enabled: true,
            created_by: 'system'
          },
          {
            id: 'api-error-general',
            name: 'General API Error',
            description: 'Generic error message for API failures',
            category: 'error',
            message_template: 'An error occurred while processing your request',
            variables: JSON.stringify([]),
            context: 'api_response',
            enabled: true,
            created_by: 'system'
          },
          {
            id: 'api-error-database',
            name: 'Database Connection Error',
            description: 'Error when database is unavailable',
            category: 'error',
            message_template: 'Database connection not available',
            variables: JSON.stringify([]),
            context: 'api_response',
            enabled: true,
            created_by: 'system'
          },
          {
            id: 'approval-success',
            name: 'Approval Success',
            description: 'Message when content is successfully approved',
            category: 'success',
            message_template: 'Changelog entry approved and published successfully! JIRA issue {jiraKey} has been updated with the TL;DR in real-time.',
            variables: JSON.stringify(['jiraKey']),
            context: 'ui_alert',
            enabled: true,
            created_by: 'system'
          }
        ];
        
        const { error: messagesError } = await supabase
          .from('system_messages')
          .insert(systemMessages);
        
        if (messagesError) {
          console.warn('⚠️ Some system messages may already exist:', messagesError.message);
        } else {
          console.log('    ✅ System messages inserted');
        }
      } else {
        console.log('    ✅ System messages already exist');
      }
    }
    
    // Test the PromptService
    console.log('🧪 Testing PromptService...');
    const { promptService } = require('../lib/prompt-service.js');
    
    const testResults = {};
    
    try {
      const aiPrompt = await promptService.getAIPrompt('meeting-analysis');
      testResults.aiPrompt = !!aiPrompt;
    } catch (error) {
      testResults.aiPrompt = false;
    }
    
    try {
      const slackTemplate = await promptService.getSlackTemplate('product-update-notification');
      testResults.slackTemplate = !!slackTemplate;
    } catch (error) {
      testResults.slackTemplate = false;
    }
    
    try {
      const systemMessage = await promptService.getSystemMessage('api-success-general');
      testResults.systemMessage = !!systemMessage;
    } catch (error) {
      testResults.systemMessage = false;
    }
    
    console.log('🧪 Test results:');
    console.log(`  AI Prompt: ${testResults.aiPrompt ? '✅' : '❌'}`);
    console.log(`  Slack Template: ${testResults.slackTemplate ? '✅' : '❌'}`);
    console.log(`  System Message: ${testResults.systemMessage ? '✅' : '❌'}`);
    
    console.log('\n🎉 Prompts system setup completed!');
    console.log('\n📝 Next steps:');
    console.log('  1. Continue updating hardcoded prompts to use PromptService');
    console.log('  2. Test admin UI functionality');
    console.log('  3. Monitor system performance');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

setupPromptsTables().catch(error => {
  console.error('❌ Setup script failed:', error);
  process.exit(1);
});