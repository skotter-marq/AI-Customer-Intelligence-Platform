// app/api/content-pipeline/route.js
/**
 * Content Pipeline API Routes
 * Exposes the integrated content pipeline functionality
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Import the orchestrator (dynamic import for API routes)
async function getOrchestrator() {
  const { default: ContentPipelineOrchestrator } = await import('../../../lib/content-pipeline-orchestrator.js');
  return new ContentPipelineOrchestrator();
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET /api/content-pipeline
 * Get pipeline health status
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'health';

    const orchestrator = await getOrchestrator();

    switch (action) {
      case 'health':
        const health = await orchestrator.getPipelineHealth();
        return NextResponse.json({
          success: true,
          data: health,
          timestamp: new Date().toISOString()
        });

      case 'initialize':
        const initResult = await orchestrator.initializePipeline();
        return NextResponse.json({
          success: initResult.success,
          data: initResult,
          timestamp: new Date().toISOString()
        });

      case 'analytics':
        const analytics = await getPipelineAnalytics();
        return NextResponse.json({
          success: true,
          data: analytics,
          timestamp: new Date().toISOString()
        });

      case 'templates':
        const templates = await getAvailableTemplates();
        return NextResponse.json({
          success: true,
          data: templates,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: health, initialize, analytics, templates'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Content Pipeline API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * POST /api/content-pipeline
 * Execute content generation pipeline
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, ...requestData } = body;

    const orchestrator = await getOrchestrator();

    switch (action) {
      case 'generate':
        return await handleContentGeneration(orchestrator, requestData);

      case 'batch':
        return await handleBatchGeneration(orchestrator, requestData);

      case 'validate':
        return await handleValidation(orchestrator, requestData);

      case 'enhance':
        return await handleEnhancement(orchestrator, requestData);

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: generate, batch, validate, enhance'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Content Pipeline API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Handle single content generation
 */
async function handleContentGeneration(orchestrator, requestData) {
  try {
    // Validate request
    const validation = validateContentRequest(requestData);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: `Invalid request: ${validation.errors.join(', ')}`,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Execute pipeline
    const result = await orchestrator.executeContentPipeline(requestData);

    // Format response
    const response = {
      success: result.success,
      data: {
        pipeline_id: result.pipeline_id,
        content: result.content,
        validation: {
          is_valid: result.validation?.isValid || false,
          quality_score: result.metadata?.quality_score || 0,
          warnings: result.validation?.warnings || [],
          suggestions: result.validation?.suggestions || []
        },
        insights: result.insights,
        performance: result.performance,
        metadata: result.metadata
      },
      timestamp: new Date().toISOString()
    };

    if (!result.success) {
      response.error = result.error;
      return NextResponse.json(response, { status: 500 });
    }

    return NextResponse.json(response);

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Handle batch content generation
 */
async function handleBatchGeneration(orchestrator, requestData) {
  try {
    const { requests } = requestData;

    if (!Array.isArray(requests) || requests.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid batch request: requests must be a non-empty array',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Validate each request
    for (const [index, request] of requests.entries()) {
      const validation = validateContentRequest(request);
      if (!validation.isValid) {
        return NextResponse.json({
          success: false,
          error: `Invalid request at index ${index}: ${validation.errors.join(', ')}`,
          timestamp: new Date().toISOString()
        }, { status: 400 });
      }
    }

    // Execute batch pipeline
    const result = await orchestrator.executeBatchPipeline(requests);

    // Format response
    const response = {
      success: result.success,
      data: {
        batch_id: result.batch_id,
        total_requests: result.total_requests,
        successful_requests: result.successful_requests,
        failed_requests: result.failed_requests,
        results: result.results.map(r => ({
          success: r.success,
          pipeline_id: r.pipeline_id,
          content_id: r.content?.id,
          quality_score: r.metadata?.quality_score || 0,
          ai_enhanced: r.metadata?.ai_enhanced || false,
          error: r.error
        })),
        performance: result.performance
      },
      timestamp: new Date().toISOString()
    };

    if (!result.success) {
      response.error = result.error;
    }

    return NextResponse.json(response);

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Handle content validation
 */
async function handleValidation(orchestrator, requestData) {
  try {
    const { content, templateId } = requestData;

    if (!content) {
      return NextResponse.json({
        success: false,
        error: 'Content is required for validation',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Create a mock template object for validation
    const template = {
      template_name: 'Validation Template',
      template_type: 'validation',
      template_content: content,
      template_variables: extractVariablesFromContent(content),
      target_audience: requestData.targetAudience || 'prospects'
    };

    // Validate using the template validator
    const validation = await orchestrator.templateValidator.validateTemplate(template);

    return NextResponse.json({
      success: true,
      data: {
        is_valid: validation.isValid,
        scores: validation.scores,
        errors: validation.errors,
        warnings: validation.warnings,
        suggestions: validation.suggestions,
        metadata: validation.metadata,
        performance: validation.performance
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Handle content enhancement
 */
async function handleEnhancement(orchestrator, requestData) {
  try {
    const { content, validationResult } = requestData;

    if (!content) {
      return NextResponse.json({
        success: false,
        error: 'Content is required for enhancement',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Create mock content result for enhancement
    const mockContentResult = {
      content: {
        id: 'enhancement-' + Date.now(),
        generated_content: content,
        content_type: requestData.contentType || 'general',
        target_audience: requestData.targetAudience || 'prospects'
      },
      quality_metrics: {
        quality_score: validationResult?.scores?.overall_score || 0.5,
        readability_score: validationResult?.scores?.readability_score || 0.5,
        engagement_prediction: validationResult?.scores?.engagement_prediction || 0.5
      },
      variables_used: extractVariablesFromContent(content)
    };

    // Mock validation result if not provided
    const mockValidation = validationResult || {
      isValid: false,
      errors: ['Content needs improvement'],
      warnings: ['Quality below threshold'],
      suggestions: ['Add more engaging content'],
      scores: { overall_score: 0.5 }
    };

    // Enhance content
    const enhancedContent = await orchestrator.enhanceContentQuality(mockContentResult, mockValidation);

    return NextResponse.json({
      success: true,
      data: {
        original_content: content,
        enhanced_content: enhancedContent?.generated_content || content,
        enhancement_applied: !!enhancedContent,
        enhancement_timestamp: enhancedContent?.enhancement_timestamp || new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Validate content generation request
 */
function validateContentRequest(request) {
  const validation = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Check required fields
  if (!request.contentType && !request.templateId) {
    validation.errors.push('Either contentType or templateId must be specified');
    validation.isValid = false;
  }

  // Check content type format
  if (request.contentType && typeof request.contentType !== 'string') {
    validation.errors.push('contentType must be a string');
    validation.isValid = false;
  }

  // Check data sources
  if (request.dataSources && !Array.isArray(request.dataSources)) {
    validation.errors.push('dataSources must be an array');
    validation.isValid = false;
  }

  // Check custom variables
  if (request.customVariables && typeof request.customVariables !== 'object') {
    validation.errors.push('customVariables must be an object');
    validation.isValid = false;
  }

  // Check target audience
  const validAudiences = ['prospects', 'customers', 'internal_team', 'media'];
  if (request.targetAudience && !validAudiences.includes(request.targetAudience)) {
    validation.warnings.push(`targetAudience should be one of: ${validAudiences.join(', ')}`);
  }

  return validation;
}

/**
 * Extract variables from content
 */
function extractVariablesFromContent(content) {
  const variables = {};
  const matches = content.match(/\{\{([^}]+)\}\}/g) || [];
  
  matches.forEach(match => {
    const variableName = match.replace(/\{\{|\}\}/g, '').trim();
    variables[variableName] = 'string';
  });

  return variables;
}

/**
 * Get pipeline analytics
 */
async function getPipelineAnalytics() {
  try {
    const { data: generatedContent } = await supabase
      .from('generated_content')
      .select('quality_score, readability_score, engagement_prediction, content_type, status, created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    const analytics = {
      total_content: generatedContent?.length || 0,
      content_by_type: {},
      content_by_status: {},
      average_quality_score: 0,
      average_readability_score: 0,
      average_engagement_prediction: 0,
      quality_distribution: {
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0
      },
      recent_activity: []
    };

    if (generatedContent && generatedContent.length > 0) {
      // Calculate averages
      analytics.average_quality_score = generatedContent.reduce((sum, c) => sum + (c.quality_score || 0), 0) / generatedContent.length;
      analytics.average_readability_score = generatedContent.reduce((sum, c) => sum + (c.readability_score || 0), 0) / generatedContent.length;
      analytics.average_engagement_prediction = generatedContent.reduce((sum, c) => sum + (c.engagement_prediction || 0), 0) / generatedContent.length;

      // Group by type and status
      generatedContent.forEach(content => {
        // By type
        analytics.content_by_type[content.content_type] = (analytics.content_by_type[content.content_type] || 0) + 1;
        
        // By status
        analytics.content_by_status[content.status] = (analytics.content_by_status[content.status] || 0) + 1;

        // Quality distribution
        const qualityScore = content.quality_score || 0;
        if (qualityScore >= 0.9) analytics.quality_distribution.excellent++;
        else if (qualityScore >= 0.7) analytics.quality_distribution.good++;
        else if (qualityScore >= 0.5) analytics.quality_distribution.fair++;
        else analytics.quality_distribution.poor++;
      });

      // Recent activity (last 10 items)
      analytics.recent_activity = generatedContent.slice(0, 10).map(content => ({
        content_type: content.content_type,
        status: content.status,
        quality_score: content.quality_score,
        created_at: content.created_at
      }));
    }

    return analytics;

  } catch (error) {
    console.error('Error fetching pipeline analytics:', error);
    return {
      total_content: 0,
      content_by_type: {},
      content_by_status: {},
      average_quality_score: 0,
      average_readability_score: 0,
      average_engagement_prediction: 0,
      quality_distribution: { excellent: 0, good: 0, fair: 0, poor: 0 },
      recent_activity: []
    };
  }
}

/**
 * Get available templates
 */
async function getAvailableTemplates() {
  try {
    const { data: templates } = await supabase
      .from('content_templates')
      .select('id, template_name, template_type, template_category, template_description, target_audience, validation_score')
      .eq('is_active', true)
      .order('template_name');

    return {
      templates: templates || [],
      total_templates: templates?.length || 0,
      categories: [...new Set(templates?.map(t => t.template_category).filter(Boolean))] || [],
      types: [...new Set(templates?.map(t => t.template_type).filter(Boolean))] || []
    };

  } catch (error) {
    console.error('Error fetching templates:', error);
    return {
      templates: [],
      total_templates: 0,
      categories: [],
      types: []
    };
  }
}