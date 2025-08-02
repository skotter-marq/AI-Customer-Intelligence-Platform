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
  
  // Default sample data for Slack templates
  const defaultSampleData = {
    updateTitle: 'Sample Product Update',
    updateDescription: 'This is a test of the notification system with sample content.',
    whatsNewSection: '\n\n**What\'s New:**\n• Enhanced user interface\n• Improved performance\n• Bug fixes and stability improvements',
    mediaResources: '\n\n📹 [Demo Video](https://example.com/demo) • 📖 [Documentation](https://example.com/docs)',
    jiraKey: 'PRESS-12345',
    contentTitle: 'Sample Changelog Entry',
    category: 'feature_update',
    contentSummary: 'This is a sample summary of the changelog entry for testing purposes.',
    assignee: 'John Doe',
    qualityScore: '92',
    customerName: 'Acme Corporation',
    meetingTitle: 'Q4 Strategy Review',
    priorityScore: '8',
    insightSummary: 'Customer expressed strong interest in expanding their usage of our platform.',
    actionItems: '• Schedule follow-up meeting\n• Prepare pricing proposal\n• Share technical documentation'
  };
  
  const testData = { ...defaultSampleData, ...sampleData };
  
  try {
    // Process template variables
    let processedMessage = message_template;
    let usedVariables: string[] = [];
    let missingVariables: string[] = [];
    
    // Replace variables and track usage
    variables.forEach((variable: string) => {
      const placeholder = `{${variable}}`;
      if (processedMessage.includes(placeholder)) {
        const value = testData[variable] || `[${variable}]`;
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
    
    return {
      success: true,
      message: 'Slack template test completed!',
      preview: processedMessage,
      details: {
        channel: channel || '#general',
        messageLength,
        isWithinLimits,
        usedVariables,
        missingVariables,
        totalVariables: variables.length,
        warnings: [
          ...(!isWithinLimits ? ['Message exceeds Slack character limit (4000)'] : []),
          ...(missingVariables.length > 0 ? [`Undefined variables found: ${missingVariables.join(', ')}`] : [])
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