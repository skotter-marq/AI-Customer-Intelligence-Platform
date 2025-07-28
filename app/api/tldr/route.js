// app/api/tldr/route.js
/**
 * TLDR Generator API Routes
 * Provides intelligent summarization services
 */

import { NextResponse } from 'next/server';
const { supabase } = require('../../../lib/supabase-client');

// Initialize TLDR generator
async function getTLDRGenerator() {
  const { default: TLDRGenerator } = await import('../../../lib/tldr-generator.js');
  return new TLDRGenerator();
}

/**
 * GET /api/tldr
 * Get TLDR configuration and available options
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'config';
    const contentId = searchParams.get('contentId');

    const tldrGenerator = await getTLDRGenerator();

    switch (action) {
      case 'config':
        return NextResponse.json({
          success: true,
          data: {
            available_styles: tldrGenerator.getAvailableStyles(),
            config: tldrGenerator.getConfig(),
            templates: Object.keys(tldrGenerator.summaryTemplates),
            max_length: tldrGenerator.config.maxSummaryLength,
            max_bullet_points: tldrGenerator.config.maxBulletPoints
          }
        });

      case 'templates':
        return NextResponse.json({
          success: true,
          data: {
            templates: tldrGenerator.summaryTemplates,
            available_types: Object.keys(tldrGenerator.summaryTemplates)
          }
        });

      case 'styles':
        return NextResponse.json({
          success: true,
          data: {
            styles: tldrGenerator.config.summaryStyles,
            available_styles: tldrGenerator.getAvailableStyles()
          }
        });

      case 'content':
        if (!contentId) {
          return NextResponse.json({
            success: false,
            error: 'Content ID is required'
          }, { status: 400 });
        }

        const content = await getContentById(contentId);
        if (!content) {
          return NextResponse.json({
            success: false,
            error: 'Content not found'
          }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          data: {
            content: content,
            suggested_template: tldrGenerator.getTLDRTemplate(content.content_type),
            estimated_reading_time: Math.ceil(content.content?.length / 200) || 0
          }
        });

      case 'recent':
        const recentSummaries = await getRecentTLDRSummaries();
        return NextResponse.json({
          success: true,
          data: {
            recent_summaries: recentSummaries,
            summary_count: recentSummaries.length
          }
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: config, templates, styles, content, recent'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('TLDR API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * POST /api/tldr
 * Generate TLDR summaries
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    const tldrGenerator = await getTLDRGenerator();

    switch (action) {
      case 'generate':
        return await handleSingleGeneration(tldrGenerator, params);

      case 'bulk':
        return await handleBulkGeneration(tldrGenerator, params);

      case 'regenerate':
        return await handleRegeneration(tldrGenerator, params);

      case 'optimize':
        return await handleOptimization(tldrGenerator, params);

      case 'analyze':
        return await handleAnalysis(tldrGenerator, params);

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: generate, bulk, regenerate, optimize, analyze'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('TLDR Generation API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Handle single TLDR generation
 */
async function handleSingleGeneration(tldrGenerator, params) {
  try {
    const {
      content,
      contentId,
      style = 'executive',
      maxLength = 500,
      includeMetrics = true,
      includeActionItems = true,
      contextType = 'general',
      targetAudience = 'executives',
      saveResult = false
    } = params;

    // Validate input
    if (!content && !contentId) {
      return NextResponse.json({
        success: false,
        error: 'Either content or contentId must be provided'
      }, { status: 400 });
    }

    let contentToSummarize = content;
    
    // Fetch content if contentId provided
    if (contentId && !content) {
      contentToSummarize = await getContentById(contentId);
      if (!contentToSummarize) {
        return NextResponse.json({
          success: false,
          error: 'Content not found'
        }, { status: 404 });
      }
    }

    // Generate TLDR
    const result = await tldrGenerator.generateTLDR(contentToSummarize, {
      style,
      maxLength,
      includeMetrics,
      includeActionItems,
      contextType,
      targetAudience
    });

    // Save result if requested
    if (saveResult) {
      await saveTLDRResult(result, contentId, params);
    }

    return NextResponse.json({
      success: true,
      data: result,
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
 * Handle bulk TLDR generation
 */
async function handleBulkGeneration(tldrGenerator, params) {
  try {
    const {
      contentIds = [],
      contents = [],
      style = 'executive',
      maxLength = 500,
      includeMetrics = true,
      includeActionItems = true,
      contextType = 'general',
      targetAudience = 'executives',
      saveResults = false
    } = params;

    // Validate input
    if (contentIds.length === 0 && contents.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Either contentIds or contents array must be provided'
      }, { status: 400 });
    }

    let contentsToSummarize = contents;

    // Fetch contents if contentIds provided
    if (contentIds.length > 0) {
      contentsToSummarize = await getContentsByIds(contentIds);
    }

    // Generate bulk TLDR
    const result = await tldrGenerator.generateBulkTLDR(contentsToSummarize, {
      style,
      maxLength,
      includeMetrics,
      includeActionItems,
      contextType,
      targetAudience
    });

    // Save results if requested
    if (saveResults) {
      await saveBulkTLDRResults(result, params);
    }

    return NextResponse.json({
      success: true,
      data: result,
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
 * Handle TLDR regeneration with different parameters
 */
async function handleRegeneration(tldrGenerator, params) {
  try {
    const {
      originalContent,
      originalContentId,
      newStyle,
      newMaxLength,
      newTargetAudience,
      adjustments = {}
    } = params;

    let contentToSummarize = originalContent;

    if (originalContentId && !originalContent) {
      contentToSummarize = await getContentById(originalContentId);
    }

    if (!contentToSummarize) {
      return NextResponse.json({
        success: false,
        error: 'Content not found for regeneration'
      }, { status: 404 });
    }

    // Generate new TLDR with updated parameters
    const result = await tldrGenerator.generateTLDR(contentToSummarize, {
      style: newStyle || 'executive',
      maxLength: newMaxLength || 500,
      targetAudience: newTargetAudience || 'executives',
      ...adjustments
    });

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        regenerated: true,
        original_content_id: originalContentId
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
 * Handle summary optimization
 */
async function handleOptimization(tldrGenerator, params) {
  try {
    const {
      summary,
      targetLength,
      optimizationGoals = ['readability', 'conciseness', 'actionability']
    } = params;

    if (!summary) {
      return NextResponse.json({
        success: false,
        error: 'Summary is required for optimization'
      }, { status: 400 });
    }

    // Optimize the summary
    const optimizedSummary = tldrGenerator.optimizeSummary(summary, targetLength || 400);

    // Calculate optimization metrics
    const originalMetrics = tldrGenerator.calculateSummaryMetrics(summary, '');
    const optimizedMetrics = tldrGenerator.calculateSummaryMetrics(optimizedSummary, '');

    return NextResponse.json({
      success: true,
      data: {
        original_summary: summary,
        optimized_summary: optimizedSummary,
        optimization_metrics: {
          length_reduction: summary.content.length - optimizedSummary.content.length,
          readability_improvement: optimizedMetrics.readability_score - originalMetrics.readability_score,
          completeness_maintained: optimizedMetrics.completeness_score >= originalMetrics.completeness_score * 0.9
        },
        goals_achieved: optimizationGoals.map(goal => ({
          goal,
          achieved: true // Simplified - would need more complex logic
        }))
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
 * Handle content analysis for TLDR potential
 */
async function handleAnalysis(tldrGenerator, params) {
  try {
    const { content, contentId } = params;

    let contentToAnalyze = content;

    if (contentId && !content) {
      contentToAnalyze = await getContentById(contentId);
    }

    if (!contentToAnalyze) {
      return NextResponse.json({
        success: false,
        error: 'Content not found for analysis'
      }, { status: 404 });
    }

    // Extract content and analyze
    const extractedContent = tldrGenerator.extractContent(contentToAnalyze);
    const keyInfo = tldrGenerator.extractKeyInformation(extractedContent);

    // Determine best summarization approach
    const summaryStructure = tldrGenerator.determineSummaryStructure(contentToAnalyze, 'auto');

    // Calculate analysis metrics
    const analysisResult = {
      content_analysis: {
        length: extractedContent.length,
        word_count: extractedContent.split(/\s+/).length,
        estimated_reading_time: Math.ceil(extractedContent.length / 200 * 60), // seconds
        complexity_score: calculateComplexityScore(extractedContent),
        summarization_potential: calculateSummarizationPotential(extractedContent, keyInfo)
      },
      key_information: {
        topics: keyInfo.topics.slice(0, 10),
        important_sentences: keyInfo.important_sentences?.slice(0, 3) || [],
        action_items: keyInfo.actions.slice(0, 5),
        metrics: keyInfo.metrics.slice(0, 5),
        stakeholders: keyInfo.stakeholders.slice(0, 5)
      },
      recommendations: {
        best_style: recommendBestStyle(contentToAnalyze, keyInfo),
        suggested_length: Math.min(Math.max(extractedContent.length * 0.2, 200), 500),
        template_type: summaryStructure.structure.join(', '),
        include_metrics: keyInfo.metrics.length > 0,
        include_action_items: keyInfo.actions.length > 0
      }
    };

    return NextResponse.json({
      success: true,
      data: analysisResult,
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
 * Get content by ID
 */
async function getContentById(contentId) {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    const { data: content } = await supabase
      .from('generated_content')
      .select('*')
      .eq('id', contentId)
      .single();

    return content;
  } catch (error) {
    console.error('Error fetching content:', error);
    return null;
  }
}

/**
 * Get contents by IDs
 */
async function getContentsByIds(contentIds) {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    const { data: contents } = await supabase
      .from('generated_content')
      .select('*')
      .in('id', contentIds);

    return contents || [];
  } catch (error) {
    console.error('Error fetching contents:', error);
    return [];
  }
}

/**
 * Get recent TLDR summaries
 */
async function getRecentTLDRSummaries() {
  try {
    // In a real implementation, you would have a TLDR summaries table
    // For now, we'll return mock data
    return [
      {
        id: 'tldr-1',
        title: 'Q4 Board Meeting Summary',
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        style: 'executive',
        compression_ratio: 0.75
      },
      {
        id: 'tldr-2',
        title: 'Product Launch Analysis',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        style: 'marketing',
        compression_ratio: 0.68
      }
    ];
  } catch (error) {
    console.error('Error fetching recent summaries:', error);
    return [];
  }
}

/**
 * Save TLDR result
 */
async function saveTLDRResult(result, contentId, params) {
  try {
    // In a real implementation, you would save to a TLDR summaries table
    console.log('TLDR result saved (placeholder):', {
      content_id: contentId,
      summary_length: result.summary.content.length,
      compression_ratio: result.metadata.compression_ratio,
      style: params.style
    });
  } catch (error) {
    console.error('Error saving TLDR result:', error);
  }
}

/**
 * Save bulk TLDR results
 */
async function saveBulkTLDRResults(results, params) {
  try {
    // In a real implementation, you would save to a TLDR summaries table
    console.log('Bulk TLDR results saved (placeholder):', {
      total_summaries: results.successful_summaries,
      batch_id: results.batch_id,
      style: params.style
    });
  } catch (error) {
    console.error('Error saving bulk TLDR results:', error);
  }
}

/**
 * Calculate complexity score for content
 */
function calculateComplexityScore(content) {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.length > 0);
  
  const avgWordsPerSentence = words.length / sentences.length;
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const vocabularyComplexity = uniqueWords.size / words.length;
  
  // Normalize to 0-1 scale
  const sentenceComplexity = Math.min(avgWordsPerSentence / 30, 1);
  const wordComplexity = Math.min(avgWordLength / 10, 1);
  
  return (sentenceComplexity + wordComplexity + vocabularyComplexity) / 3;
}

/**
 * Calculate summarization potential
 */
function calculateSummarizationPotential(content, keyInfo) {
  let potential = 0;
  
  // Length factor - longer content has higher potential
  if (content.length > 1000) potential += 0.3;
  else if (content.length > 500) potential += 0.2;
  else if (content.length > 200) potential += 0.1;
  
  // Information density
  if (keyInfo.topics.length > 5) potential += 0.2;
  if (keyInfo.metrics.length > 2) potential += 0.2;
  if (keyInfo.actions.length > 1) potential += 0.2;
  
  // Structure indicators
  if (keyInfo.important_sentences && keyInfo.important_sentences.length > 2) potential += 0.1;
  
  return Math.min(potential, 1);
}

/**
 * Recommend best summarization style
 */
function recommendBestStyle(content, keyInfo) {
  // Simple heuristic-based recommendation
  if (keyInfo.metrics.length > 3) return 'executive';
  if (keyInfo.actions.length > 3) return 'sales';
  if (content.content_type === 'technical') return 'technical';
  return 'marketing';
}