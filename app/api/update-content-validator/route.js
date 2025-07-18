// app/api/update-content-validator/route.js
/**
 * Update Content Validator API Routes
 * Provides comprehensive content validation services
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize update content validator
async function getUpdateContentValidator() {
  const { default: UpdateContentValidator } = await import('../../../lib/update-content-validator.js');
  return new UpdateContentValidator();
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET /api/update-content-validator
 * Get validator status, configuration, and statistics
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';
    const contentId = searchParams.get('contentId');

    const validator = await getUpdateContentValidator();

    switch (action) {
      case 'status':
        return NextResponse.json({
          success: true,
          data: {
            statistics: validator.getStatistics(),
            configuration: validator.getConfiguration(),
            cache_statistics: validator.getCacheStatistics(),
            validation_rules: Object.keys(validator.validationRules)
          }
        });

      case 'config':
        return NextResponse.json({
          success: true,
          data: {
            configuration: validator.getConfiguration(),
            validation_rules: validator.validationRules,
            brand_guidelines: validator.brandGuidelines,
            performance_thresholds: validator.performanceThresholds
          }
        });

      case 'statistics':
        return NextResponse.json({
          success: true,
          data: {
            ...validator.getStatistics(),
            cache_info: validator.getCacheStatistics()
          }
        });

      case 'rules':
        return NextResponse.json({
          success: true,
          data: {
            validation_rules: validator.validationRules,
            critical_rules: validator.config.criticalValidationRules,
            rule_count: Object.keys(validator.validationRules).length
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
            validation_suggestions: getValidationSuggestions(content),
            estimated_validation_time: estimateValidationTime(content)
          }
        });

      case 'cache':
        return NextResponse.json({
          success: true,
          data: validator.getCacheStatistics()
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: status, config, statistics, rules, content, cache'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Update Content Validator API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * POST /api/update-content-validator
 * Validate content and manage validator operations
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    const validator = await getUpdateContentValidator();

    switch (action) {
      case 'validate':
        return await handleValidateContent(validator, params);

      case 'validate_bulk':
        return await handleValidateBulk(validator, params);

      case 'validate_with_fixes':
        return await handleValidateWithFixes(validator, params);

      case 'update_config':
        return await handleUpdateConfig(validator, params);

      case 'clear_cache':
        return await handleClearCache(validator, params);

      case 'test_validation':
        return await handleTestValidation(validator, params);

      case 'get_recommendations':
        return await handleGetRecommendations(validator, params);

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: validate, validate_bulk, validate_with_fixes, update_config, clear_cache, test_validation, get_recommendations'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Update Content Validator API Error:', error);
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
async function handleValidateContent(validator, params) {
  try {
    const {
      content,
      contentId,
      options = {}
    } = params;

    // Validate input
    if (!content && !contentId) {
      return NextResponse.json({
        success: false,
        error: 'Either content or contentId must be provided'
      }, { status: 400 });
    }

    let contentToValidate = content;

    // Fetch content if contentId provided
    if (contentId && !content) {
      contentToValidate = await getContentById(contentId);
      if (!contentToValidate) {
        return NextResponse.json({
          success: false,
          error: 'Content not found'
        }, { status: 404 });
      }
    }

    // Validate content
    const validationResult = await validator.validateContent(contentToValidate, options);

    return NextResponse.json({
      success: true,
      data: {
        ...validationResult,
        validation_summary: {
          passed: validationResult.passed,
          overall_score: validationResult.overall_score,
          critical_issues: validationResult.critical_issues.length,
          total_issues: getTotalIssues(validationResult.rule_results),
          fixes_applied: validationResult.applied_fixes.length,
          recommendations: validationResult.recommendations.length
        }
      }
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
 * Handle bulk content validation
 */
async function handleValidateBulk(validator, params) {
  try {
    const {
      contentIds = [],
      contents = [],
      options = {},
      batchSize = 10
    } = params;

    // Validate input
    if (contentIds.length === 0 && contents.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Either contentIds or contents array must be provided'
      }, { status: 400 });
    }

    let contentsToValidate = contents;

    // Fetch contents if contentIds provided
    if (contentIds.length > 0) {
      contentsToValidate = await getContentsByIds(contentIds);
    }

    // Process in batches
    const results = [];
    const errors = [];

    for (let i = 0; i < contentsToValidate.length; i += batchSize) {
      const batch = contentsToValidate.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (content) => {
        try {
          const validationResult = await validator.validateContent(content, options);
          return {
            content_id: content.id,
            success: true,
            result: validationResult
          };
        } catch (error) {
          return {
            content_id: content.id,
            success: false,
            error: error.message
          };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            results.push(result.value);
          } else {
            errors.push(result.value);
          }
        } else {
          errors.push({
            content_id: batch[index].id,
            success: false,
            error: result.reason.message
          });
        }
      });
    }

    // Calculate summary statistics
    const passedValidations = results.filter(r => r.result.passed).length;
    const totalIssues = results.reduce((sum, r) => sum + getTotalIssues(r.result.rule_results), 0);
    const totalFixes = results.reduce((sum, r) => sum + r.result.applied_fixes.length, 0);
    const averageScore = results.length > 0 ? 
      results.reduce((sum, r) => sum + r.result.overall_score, 0) / results.length : 0;

    return NextResponse.json({
      success: true,
      data: {
        bulk_validation_completed: true,
        total_processed: contentsToValidate.length,
        successful_validations: results.length,
        failed_validations: errors.length,
        passed_validations: passedValidations,
        summary: {
          success_rate: (results.length / contentsToValidate.length) * 100,
          pass_rate: results.length > 0 ? (passedValidations / results.length) * 100 : 0,
          average_score: averageScore,
          total_issues: totalIssues,
          total_fixes: totalFixes
        },
        results: results,
        errors: errors,
        timestamp: new Date().toISOString()
      }
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
 * Handle validation with automatic fixes
 */
async function handleValidateWithFixes(validator, params) {
  try {
    const {
      content,
      contentId,
      options = {},
      maxFixAttempts = 3
    } = params;

    // Validate input
    if (!content && !contentId) {
      return NextResponse.json({
        success: false,
        error: 'Either content or contentId must be provided'
      }, { status: 400 });
    }

    let contentToValidate = content;

    // Fetch content if contentId provided
    if (contentId && !content) {
      contentToValidate = await getContentById(contentId);
      if (!contentToValidate) {
        return NextResponse.json({
          success: false,
          error: 'Content not found'
        }, { status: 404 });
      }
    }

    // Enable auto-fix
    const fixOptions = { ...options, autoFix: true };
    
    let attempts = 0;
    let currentContent = contentToValidate;
    let validationResult;
    const fixHistory = [];

    do {
      attempts++;
      validationResult = await validator.validateContent(currentContent, fixOptions);
      
      if (validationResult.applied_fixes.length > 0) {
        fixHistory.push({
          attempt: attempts,
          fixes_applied: validationResult.applied_fixes.length,
          score_improvement: attempts > 1 ? 
            validationResult.overall_score - fixHistory[fixHistory.length - 1].score : 0,
          score: validationResult.overall_score
        });
        
        currentContent = validationResult.fixed_content;
      } else {
        break;
      }
    } while (attempts < maxFixAttempts && !validationResult.passed);

    return NextResponse.json({
      success: true,
      data: {
        ...validationResult,
        fix_attempts: attempts,
        fix_history: fixHistory,
        final_content: currentContent,
        improvement_summary: {
          total_fixes: fixHistory.reduce((sum, h) => sum + h.fixes_applied, 0),
          score_improvement: fixHistory.length > 0 ? 
            fixHistory[fixHistory.length - 1].score - (fixHistory[0].score || 0) : 0,
          attempts_needed: attempts
        }
      }
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
 * Handle configuration update
 */
async function handleUpdateConfig(validator, params) {
  try {
    const { configuration } = params;

    if (!configuration || typeof configuration !== 'object') {
      return NextResponse.json({
        success: false,
        error: 'Configuration object is required'
      }, { status: 400 });
    }

    // Update configuration
    validator.updateConfiguration(configuration);

    return NextResponse.json({
      success: true,
      data: {
        configuration_updated: true,
        new_configuration: validator.getConfiguration(),
        message: 'Validation configuration updated successfully'
      }
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
 * Handle cache clearing
 */
async function handleClearCache(validator, params) {
  try {
    const statisticsBefore = validator.getCacheStatistics();
    validator.clearCache();
    const statisticsAfter = validator.getCacheStatistics();

    return NextResponse.json({
      success: true,
      data: {
        cache_cleared: true,
        statistics_before: statisticsBefore,
        statistics_after: statisticsAfter,
        message: 'Validation cache cleared successfully'
      }
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
 * Handle test validation
 */
async function handleTestValidation(validator, params) {
  try {
    const {
      testType = 'basic',
      customContent = null
    } = params;

    let testContent;

    switch (testType) {
      case 'basic':
        testContent = {
          id: 'test-basic',
          content_title: 'Basic Test Content',
          generated_content: 'This is a basic test content for validation testing.',
          content_type: 'test',
          target_audience: 'general'
        };
        break;

      case 'grammar':
        testContent = {
          id: 'test-grammar',
          content_title: 'Grammar Test Content',
          generated_content: 'This content has  double spaces and recieve instead of receive.',
          content_type: 'test',
          target_audience: 'general'
        };
        break;

      case 'seo':
        testContent = {
          id: 'test-seo',
          content_title: 'SEO',
          generated_content: 'keyword keyword keyword keyword keyword keyword keyword keyword keyword',
          content_type: 'test',
          target_audience: 'general'
        };
        break;

      case 'custom':
        if (!customContent) {
          return NextResponse.json({
            success: false,
            error: 'Custom content is required for custom test type'
          }, { status: 400 });
        }
        testContent = customContent;
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid test type. Supported types: basic, grammar, seo, custom'
        }, { status: 400 });
    }

    // Run validation
    const validationResult = await validator.validateContent(testContent, { autoFix: true });

    return NextResponse.json({
      success: true,
      data: {
        test_type: testType,
        test_content: testContent,
        validation_result: validationResult,
        test_summary: {
          passed: validationResult.passed,
          score: validationResult.overall_score,
          issues_found: getTotalIssues(validationResult.rule_results),
          fixes_applied: validationResult.applied_fixes.length,
          test_duration: validationResult.validation_duration
        }
      }
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
 * Handle get recommendations
 */
async function handleGetRecommendations(validator, params) {
  try {
    const {
      content,
      contentId,
      contentType = 'general',
      targetAudience = 'general'
    } = params;

    // Validate input
    if (!content && !contentId) {
      return NextResponse.json({
        success: false,
        error: 'Either content or contentId must be provided'
      }, { status: 400 });
    }

    let contentToAnalyze = content;

    // Fetch content if contentId provided
    if (contentId && !content) {
      contentToAnalyze = await getContentById(contentId);
      if (!contentToAnalyze) {
        return NextResponse.json({
          success: false,
          error: 'Content not found'
        }, { status: 404 });
      }
    }

    // Get recommendations without full validation
    const recommendations = generateContentRecommendations(contentToAnalyze, contentType, targetAudience);

    return NextResponse.json({
      success: true,
      data: {
        content_id: contentToAnalyze.id,
        content_type: contentType,
        target_audience: targetAudience,
        recommendations: recommendations,
        recommendation_categories: categorizeRecommendations(recommendations),
        priority_recommendations: recommendations.filter(r => r.priority === 'high'),
        generated_at: new Date().toISOString()
      }
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
 * Get validation suggestions for content
 */
function getValidationSuggestions(content) {
  const suggestions = [];

  if (!content.content_title) {
    suggestions.push({
      type: 'structure',
      message: 'Add a descriptive title',
      priority: 'high'
    });
  }

  if (!content.generated_content || content.generated_content.length < 100) {
    suggestions.push({
      type: 'structure',
      message: 'Content appears to be too short',
      priority: 'medium'
    });
  }

  if (content.content_type === 'product_announcement') {
    suggestions.push({
      type: 'brand',
      message: 'Ensure product announcement follows brand guidelines',
      priority: 'high'
    });
  }

  return suggestions;
}

/**
 * Estimate validation time
 */
function estimateValidationTime(content) {
  const baseTime = 2000; // 2 seconds base
  const contentLength = content.generated_content ? content.generated_content.length : 0;
  const lengthFactor = Math.min(contentLength / 1000, 5); // Max 5x multiplier

  return Math.round(baseTime + (lengthFactor * 1000));
}

/**
 * Get total issues from rule results
 */
function getTotalIssues(ruleResults) {
  if (!ruleResults) return 0;
  
  return Object.values(ruleResults).reduce((sum, result) => {
    return sum + (result.issues ? result.issues.length : 0);
  }, 0);
}

/**
 * Generate content recommendations
 */
function generateContentRecommendations(content, contentType, targetAudience) {
  const recommendations = [];

  // Structure recommendations
  if (!content.content_title || content.content_title.length < 30) {
    recommendations.push({
      category: 'structure',
      type: 'title_optimization',
      message: 'Optimize title length for better SEO (30-60 characters)',
      priority: 'medium',
      actionable: true
    });
  }

  // Content length recommendations
  const contentLength = content.generated_content ? content.generated_content.length : 0;
  if (contentLength < 300) {
    recommendations.push({
      category: 'content',
      type: 'content_length',
      message: 'Consider expanding content for better engagement',
      priority: 'low',
      actionable: true
    });
  }

  // Audience-specific recommendations
  if (targetAudience === 'customers') {
    recommendations.push({
      category: 'audience',
      type: 'customer_focus',
      message: 'Ensure content addresses customer pain points',
      priority: 'high',
      actionable: true
    });
  }

  // Content type recommendations
  if (contentType === 'product_announcement') {
    recommendations.push({
      category: 'compliance',
      type: 'legal_review',
      message: 'Consider legal review for product announcements',
      priority: 'high',
      actionable: false
    });
  }

  return recommendations;
}

/**
 * Categorize recommendations
 */
function categorizeRecommendations(recommendations) {
  const categories = {};

  recommendations.forEach(rec => {
    if (!categories[rec.category]) {
      categories[rec.category] = [];
    }
    categories[rec.category].push(rec);
  });

  return categories;
}