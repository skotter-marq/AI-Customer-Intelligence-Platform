import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { templateType, templateId, templateData, sampleData } = await request.json();
    
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
        testResult = await testSlackTemplate(templateData, sampleData);
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

async function testSlackTemplate(templateData: any, sampleData?: any) {
  const { message_template, variables = [], channel } = templateData;
  
  // Realistic test data that covers all common template variables
  const defaultSampleData = {
    // Product update variables
    updateTitle: 'Enhanced Dashboard Analytics & User Insights',
    updateDescription: 'We\'ve rolled out major improvements to the dashboard with real-time analytics, advanced filtering, and personalized user insights to help you make data-driven decisions faster.',
    whatsNewSection: '\n\n**What\'s New:**\n• Real-time analytics with live data updates\n• Advanced filtering and search capabilities\n• Personalized user insights and recommendations\n• Improved mobile responsiveness\n• Export functionality for reports',
    mediaResources: '\n\n📹 [Demo Video](https://youtu.be/demo123) • 📖 [User Guide](https://docs.marq.com/dashboard-v2) • 🎯 [Feature Tutorial](https://help.marq.com/analytics)',
    
    // JIRA and content variables  
    jiraKey: 'PRESS-1847',
    contentTitle: 'Enhanced Dashboard Analytics & User Insights',
    category: 'improved',
    contentSummary: 'Major dashboard overhaul introducing real-time analytics, advanced filtering capabilities, and AI-powered user insights. This update significantly improves the user experience by providing actionable data visualization and personalized recommendations based on usage patterns.',
    assignee: 'Sarah Johnson',
    qualityScore: '94',
    
    // Customer and meeting variables
    customerName: 'Acme Enterprise Solutions',
    meetingTitle: 'Q1 Product Roadmap Review',
    priorityScore: '9',
    insightSummary: 'Customer highlighted the critical need for better analytics and reporting capabilities. They specifically mentioned that real-time data insights would help their team make faster decisions and improve overall productivity by 25-30%.',
    actionItems: '• Schedule technical demo of new analytics features\n• Prepare custom dashboard configuration proposal\n• Share beta access for advanced user insights\n• Follow up on integration requirements',
    
    // Additional comprehensive variables
    contentType: 'feature_release',
    createdDate: new Date().toLocaleDateString(),
    
    // Properly configured URLs
    contentUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/product?tab=approval&id=PRESS-1847`,
    dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/product?tab=approval`,
    meetingUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/meetings/acme-q1-review`,
    jiraUrl: 'https://marq.atlassian.net/browse/PRESS-1847',
    jiraCreateUrl: 'https://marq.atlassian.net/secure/CreateIssue.jspa',
    
    // Quote and feedback variables
    customerQuote: 'The new analytics dashboard is exactly what we needed. The real-time insights have already helped us identify optimization opportunities we never saw before.',
    
    // Classification variables
    insightType: 'Product Enhancement',
    priority: 'High',
    impact: 'High',
    
    // Team and process variables
    reporter: 'Product Team',
    reviewedBy: 'Engineering Leadership',
    approvedBy: 'Product Manager'
  };

  const finalTestData = { ...defaultSampleData, ...sampleData };
  
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

