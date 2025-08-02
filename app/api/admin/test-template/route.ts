import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { templateType, templateId, templateData, sampleData, useRealData } = await request.json();
    
    if (!templateType || !templateData) {
      return NextResponse.json(
        { success: false, error: 'Template type and data are required' },
        { status: 400 }
      );
    }

    let testResult: any = {
      success: true,
      message: 'Template test completed successfully',
      preview: '',
      details: {}
    };

    switch (templateType) {
      case 'slack_template':
        testResult = await testSlackTemplate(templateData, sampleData, useRealData);
        break;
      case 'ai_analysis':
        testResult = await testAIPrompt(templateData);
        break;
      case 'content_generation':
        testResult = await testContentTemplate(templateData);
        break;
      case 'system_message':
        testResult = await testSystemMessage(templateData, sampleData);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Unsupported template type' },
          { status: 400 }
        );
    }

    return NextResponse.json(testResult);

  } catch (error) {
    console.error('Template test error:', error);
    return NextResponse.json(
      { success: false, error: 'Template test failed', details: error.message },
      { status: 500 }
    );
  }
}

async function testSlackTemplate(templateData: any, sampleData?: any, useRealData?: boolean) {
  const { message_template, variables = [], channel } = templateData;
  
  // Default sample data for Slack templates - comprehensive coverage
  const defaultSampleData = {
    // Product update variables
    updateTitle: '🧪 TEST - Sample Product Update',
    updateDescription: 'This is a test of the notification system with sample content.',
    whatsNewSection: '\n\n**What\'s New:**\n• Enhanced user interface\n• Improved performance\n• Bug fixes and stability improvements',
    mediaResources: '\n\n📹 [Demo Video](https://example.com/demo) • 📖 [Documentation](https://example.com/docs)',
    
    // JIRA and content variables
    jiraKey: 'TEST-12345',
    contentTitle: '🧪 TEST - Sample Changelog Entry',
    category: 'feature_update',
    contentSummary: 'This is a test of the changelog entry template with sample data.',
    assignee: 'John Doe (Test)',
    qualityScore: '92',
    
    // Customer and meeting variables
    customerName: 'Acme Corporation',
    meetingTitle: 'Q4 Strategy Review',
    priorityScore: '8',
    insightSummary: 'Customer expressed strong interest in expanding their usage of our platform.',
    actionItems: '• Schedule follow-up meeting\n• Prepare pricing proposal\n• Share technical documentation',
    
    // Additional common variables
    contentType: 'changelog_entry',
    createdDate: new Date().toLocaleDateString(),
    contentUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/ai-prompts`,
    dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/ai-prompts`,
    
    // URL variables - Fixed to include proper links
    meetingUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/meetings/test-123`,
    jiraCreateUrl: 'https://marq.atlassian.net/secure/CreateIssue.jspa',
    contentUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/product?tab=approval`,
    dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/product?tab=approval`,
    jiraUrl: 'https://marq.atlassian.net/browse/TEST-12345',
    
    // Quote variables
    customerQuote: 'This feature would really help streamline our workflow and save us hours each week.',
    
    // Insight types
    insightType: 'Feature Request'
  };

  // 🚀 NEW: Fetch real JIRA data if requested
  let finalTestData = { ...defaultSampleData, ...sampleData };
  
  if (useRealData) {
    try {
      const realJiraData = await fetchSampleJiraData();
      if (realJiraData) {
        finalTestData = { ...finalTestData, ...realJiraData };
      }
    } catch (error) {
      console.warn('Failed to fetch real JIRA data, using default test data:', error.message);
    }
  }
  
  try {
    // Process template variables
    let processedMessage = message_template;
    let usedVariables: string[] = [];
    let missingVariables: string[] = [];
    
    // Replace variables and track usage
    variables.forEach((variable: string) => {
      const placeholder = `{${variable}}`;
      if (processedMessage.includes(placeholder)) {
        const value = finalTestData[variable] || `[${variable}]`;
        processedMessage = processedMessage.replace(new RegExp(placeholder, 'g'), value);
        usedVariables.push(variable);
      }
    });
    
    // Check for unreplaced variables
    const unreplacedVariables = processedMessage.match(/\{[^}]+\}/g) || [];
    unreplacedVariables.forEach(placeholder => {
      const variable = placeholder.replace(/[{}]/g, '');
      if (!variables.includes(variable)) {
        missingVariables.push(variable);
      }
    });
    
    // Clean up any remaining unreplaced variables
    processedMessage = processedMessage.replace(/\{[^}]+\}/g, '');
    
    // Validate message length (Slack has limits)
    const messageLength = processedMessage.length;
    const isWithinLimits = messageLength <= 4000; // Slack text limit
    
    // 🚀 NEW: Actually send the test message to Slack!
    let slackResult = null;
    let slackError = null;
    
    try {
      // Determine webhook URL based on channel
      const SLACK_WEBHOOKS = {
        approvals: process.env.SLACK_WEBHOOK_APPROVALS,
        updates: process.env.SLACK_WEBHOOK_UPDATES,
        insights: process.env.SLACK_WEBHOOK_INSIGHTS,
        content: process.env.SLACK_WEBHOOK_CONTENT
      };
      
      let webhookUrl = SLACK_WEBHOOKS.updates; // default
      if (channel && channel.includes('approval')) webhookUrl = SLACK_WEBHOOKS.approvals;
      if (channel && channel.includes('insight')) webhookUrl = SLACK_WEBHOOKS.insights;
      if (channel && channel.includes('content')) webhookUrl = SLACK_WEBHOOKS.content;
      
      // Add test indicator to message
      const testMessage = `🧪 **TEMPLATE TEST**\n\n${processedMessage}\n\n_This is a test message from the admin template testing system._`;
      
      // Create Slack message object
      const slackMessage = {
        text: testMessage,
        username: 'Template Test Bot',
        icon_emoji: ':test_tube:'
      };
      
      // Send directly to webhook
      if (webhookUrl && !webhookUrl.includes('undefined') && webhookUrl.length > 10) {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(slackMessage)
        });
        
        if (response.ok) {
          slackResult = {
            sent: true,
            channel: channel || '#general',
            webhookUrl: webhookUrl.substring(0, 50) + '...',
            mockMode: false
          };
        } else {
          const errorText = await response.text();
          slackError = `Webhook error: ${response.status} ${response.statusText} - ${errorText}`;
        }
      } else {
        // Mock mode - webhook not configured
        console.log('Mock Slack message (webhook not configured):', slackMessage);
        slackResult = {
          sent: true,
          channel: channel || '#general',
          webhookUrl: 'mock-mode',
          mockMode: true
        };
      }
      
    } catch (error) {
      slackError = `Failed to send to Slack: ${error.message}`;
      console.error('Slack test error:', error);
    }
    
    // Build response message
    let responseMessage = 'Slack template test completed!';
    if (slackResult?.sent) {
      responseMessage += ` Message sent to ${slackResult.channel}`;
      if (slackResult.mockMode) {
        responseMessage += ' (mock mode - webhook not configured)';
      }
    } else if (slackError) {
      responseMessage += ` (Preview only - Slack send failed: ${slackError})`;
    }
    
    return {
      success: true,
      message: responseMessage,
      preview: processedMessage,
      details: {
        channel: channel || '#general',
        messageLength,
        isWithinLimits,
        usedVariables,
        missingVariables,
        totalVariables: variables.length,
        slackResult,
        slackError,
        warnings: [
          ...(!isWithinLimits ? ['Message exceeds Slack character limit (4000)'] : []),
          ...(missingVariables.length > 0 ? [`Undefined variables found: ${missingVariables.join(', ')}`] : []),
          ...(slackError ? [`Slack delivery failed: ${slackError}`] : [])
        ]
      }
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'Slack template test failed',
      error: error.message
    };
  }
}

async function testAIPrompt(templateData: any) {
  const { user_prompt_template, system_instructions, variables = [], parameters = {} } = templateData;
  
  try {
    // Validate prompt structure
    const validations = {
      hasTemplate: !!user_prompt_template && user_prompt_template.trim().length > 0,
      hasSystemInstructions: !!system_instructions && system_instructions.trim().length > 0,
      templateLength: user_prompt_template?.length || 0,
      instructionsLength: system_instructions?.length || 0,
      variableCount: variables.length,
      hasParameters: Object.keys(parameters).length > 0
    };
    
    // Check for required variables in template
    const variablesInTemplate = variables.filter((variable: string) => 
      user_prompt_template?.includes(`{${variable}}`)
    );
    
    // Check template quality
    const qualityChecks = {
      hasInstructions: validations.hasSystemInstructions,
      adequateLength: validations.templateLength >= 100,
      hasVariables: validations.variableCount > 0,
      variablesUsed: variablesInTemplate.length > 0,
      hasParameters: validations.hasParameters,
      hasJsonFormat: user_prompt_template?.includes('JSON') || user_prompt_template?.includes('json'),
      hasExamples: user_prompt_template?.includes('example') || user_prompt_template?.includes('Example')
    };
    
    const qualityScore = Object.values(qualityChecks).filter(Boolean).length / Object.keys(qualityChecks).length;
    
    // Generate recommendations
    const recommendations = [];
    if (!qualityChecks.hasInstructions) recommendations.push('Add system instructions to define AI behavior');
    if (!qualityChecks.adequateLength) recommendations.push('Consider adding more detail to the prompt template');
    if (!qualityChecks.variablesUsed) recommendations.push('Ensure template variables are actually used in the prompt');
    if (!qualityChecks.hasJsonFormat) recommendations.push('Consider specifying JSON output format for structured responses');
    if (!qualityChecks.hasExamples) recommendations.push('Adding examples can improve AI response quality');
    
    return {
      success: true,
      message: `AI prompt validation completed! Quality score: ${(qualityScore * 100).toFixed(0)}%`,
      preview: `Template: ${validations.templateLength} chars\nVariables: ${variablesInTemplate.length}/${validations.variableCount} used\nQuality: ${(qualityScore * 100).toFixed(0)}%`,
      details: {
        validations,
        qualityChecks,
        qualityScore,
        variablesInTemplate,
        recommendations,
        estimatedTokens: Math.ceil((validations.templateLength + validations.instructionsLength) / 4)
      }
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'AI prompt test failed',
      error: error.message
    };
  }
}

async function testContentTemplate(templateData: any) {
  const { message_template, variables = [] } = templateData;
  
  try {
    // Basic content validation
    const wordCount = message_template?.split(/\s+/).length || 0;
    const characterCount = message_template?.length || 0;
    const hasFormatting = /(\*\*|__|`|#)/.test(message_template || '');
    const hasVariables = variables.length > 0;
    
    return {
      success: true,
      message: 'Content template validation passed!',
      preview: `${wordCount} words, ${characterCount} characters`,
      details: {
        wordCount,
        characterCount,
        hasFormatting,
        hasVariables,
        variableCount: variables.length,
        readabilityLevel: wordCount < 50 ? 'concise' : wordCount < 150 ? 'moderate' : 'detailed'
      }
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'Content template test failed',
      error: error.message
    };
  }
}

async function testSystemMessage(templateData: any, sampleData?: any) {
  const { message_template, variables = [] } = templateData;
  
  // Default sample data for system messages
  const defaultSampleData = {
    jiraKey: 'PRESS-12345',
    error: 'Connection timeout',
    qualityScore: '92',
    content: 'changelog entries',
    action: 'delete this item',
    details: 'validation failed'
  };
  
  const testData = { ...defaultSampleData, ...sampleData };
  
  try {
    // Process template with sample data
    let processedMessage = message_template;
    variables.forEach((variable: string) => {
      const placeholder = `{${variable}}`;
      const value = testData[variable] || `[${variable}]`;
      processedMessage = processedMessage.replace(new RegExp(placeholder, 'g'), value);
    });
    
    // Clean up unreplaced variables
    processedMessage = processedMessage.replace(/\{[^}]+\}/g, '');
    
    return {
      success: true,
      message: 'System message test completed!',
      preview: processedMessage,
      details: {
        messageLength: processedMessage.length,
        variableCount: variables.length,
        isAppropriateLength: processedMessage.length <= 200 // System messages should be concise
      }
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'System message test failed',
      error: error.message
    };
  }
}

// Function to fetch real JIRA data for testing
async function fetchSampleJiraData() {
  try {
    // Check if JIRA credentials are available
    if (!process.env.JIRA_BASE_URL || !process.env.JIRA_API_TOKEN) {
      console.log('JIRA credentials not configured, skipping real data fetch');
      return null;
    }

    // Fetch a recent completed story for realistic test data
    const auth = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64');
    
    const response = await fetch(`${process.env.JIRA_BASE_URL}/rest/api/2/search?jql=status=Done AND type=Story ORDER BY updated DESC&maxResults=1`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn('Failed to fetch JIRA data:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    
    if (!data.issues || data.issues.length === 0) {
      console.log('No JIRA issues found');
      return null;
    }

    const issue = data.issues[0];
    const fields = issue.fields;
    
    // Transform JIRA data to template variables
    return {
      jiraKey: issue.key,
      contentTitle: `✨ ${fields.summary}`,
      category: determineCategory(fields.issuetype?.name, fields.labels),
      contentSummary: fields.description ? 
        fields.description.substring(0, 200) + (fields.description.length > 200 ? '...' : '') :
        `${fields.summary} - Real data from ${issue.key}`,
      assignee: fields.assignee?.displayName || 'Unassigned',
      qualityScore: Math.floor(Math.random() * 20 + 80).toString(), // Random score 80-100
      updateTitle: `📋 ${fields.summary}`,
      updateDescription: fields.description || `Completed story: ${fields.summary}`,
      jiraUrl: `${process.env.JIRA_BASE_URL}/browse/${issue.key}`,
      contentUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/product?tab=approval&jira=${issue.key}`,
      dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/product?tab=approval`,
      createdDate: new Date().toLocaleDateString(),
      contentType: 'jira_story'
    };

  } catch (error) {
    console.error('Error fetching JIRA data:', error);
    return null;
  }
}

// Helper function to determine category from JIRA issue type and labels
function determineCategory(issueType: string, labels: any[] = []) {
  const labelNames = labels.map(l => l.toLowerCase());
  
  if (labelNames.includes('bug') || issueType?.toLowerCase().includes('bug')) {
    return 'fixed';
  }
  if (labelNames.includes('security') || labelNames.includes('auth')) {
    return 'security';
  }
  if (issueType?.toLowerCase().includes('story') || issueType?.toLowerCase().includes('feature')) {
    return 'added';
  }
  if (labelNames.includes('improvement') || labelNames.includes('enhancement')) {
    return 'improved';
  }
  
  return 'improved'; // default
}