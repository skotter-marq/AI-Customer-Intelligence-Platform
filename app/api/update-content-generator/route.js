// app/api/update-content-generator/route.js
/**
 * Update Content Generator API Routes
 * Provides automated content generation services for product updates
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize update content generator
async function getUpdateContentGenerator() {
  const { default: UpdateContentGenerator } = await import('../../../lib/update-content-generator.js');
  return new UpdateContentGenerator();
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET /api/update-content-generator
 * Get generator status, configuration, and statistics
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';
    const updateId = searchParams.get('updateId');

    const generator = await getUpdateContentGenerator();

    switch (action) {
      case 'status':
        return NextResponse.json({
          success: true,
          data: {
            statistics: generator.getStatistics(),
            configuration: generator.getConfiguration(),
            is_monitoring: generator.isMonitoring,
            supported_content_types: generator.config.supportedContentTypes
          }
        });

      case 'config':
        return NextResponse.json({
          success: true,
          data: {
            configuration: generator.getConfiguration(),
            update_categories: Object.keys(generator.updateCategories),
            content_rules: Object.keys(generator.contentRules),
            audience_mapping: generator.config.audienceMapping
          }
        });

      case 'statistics':
        return NextResponse.json({
          success: true,
          data: {
            ...generator.getStatistics(),
            uptime: generator.isMonitoring ? Date.now() - (generator.startTime || Date.now()) : 0
          }
        });

      case 'analyze':
        if (!updateId) {
          return NextResponse.json({
            success: false,
            error: 'Update ID is required for analysis'
          }, { status: 400 });
        }

        const updateToAnalyze = await getUpdateById(updateId);
        if (!updateToAnalyze) {
          return NextResponse.json({
            success: false,
            error: 'Update not found'
          }, { status: 404 });
        }

        const analysis = await generator.analyzeUpdate(updateToAnalyze);
        const contentTypes = generator.determineContentTypes(analysis);
        const shouldGenerate = generator.shouldGenerateContent(analysis);

        return NextResponse.json({
          success: true,
          data: {
            update: updateToAnalyze,
            analysis: analysis,
            recommended_content_types: contentTypes,
            should_generate_content: shouldGenerate,
            estimated_generation_time: contentTypes.length * 30 // seconds
          }
        });

      case 'recent':
        const recentUpdates = await getRecentUpdates();
        return NextResponse.json({
          success: true,
          data: {
            recent_updates: recentUpdates,
            total_updates: recentUpdates.length
          }
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: status, config, statistics, analyze, recent'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Update Content Generator API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * POST /api/update-content-generator
 * Control generator operations and manual content generation
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    const generator = await getUpdateContentGenerator();

    switch (action) {
      case 'start_monitoring':
        return await handleStartMonitoring(generator, params);

      case 'stop_monitoring':
        return await handleStopMonitoring(generator, params);

      case 'generate_manual':
        return await handleManualGeneration(generator, params);

      case 'scan_updates':
        return await handleScanUpdates(generator, params);

      case 'update_config':
        return await handleUpdateConfig(generator, params);

      case 'clear_cache':
        return await handleClearCache(generator, params);

      case 'generate_bulk':
        return await handleBulkGeneration(generator, params);

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: start_monitoring, stop_monitoring, generate_manual, scan_updates, update_config, clear_cache, generate_bulk'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Update Content Generator API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Handle start monitoring
 */
async function handleStartMonitoring(generator, params) {
  try {
    const {
      monitoringInterval = 300000, // 5 minutes
      autoGenerateContent = true,
      minImportanceScore = 0.6
    } = params;

    // Update configuration if provided
    if (params.configuration) {
      generator.updateConfiguration({
        monitoringInterval,
        autoGenerateContent,
        minImportanceScore,
        ...params.configuration
      });
    }

    // Start monitoring
    generator.startMonitoring();

    return NextResponse.json({
      success: true,
      data: {
        monitoring_started: true,
        configuration: generator.getConfiguration(),
        message: 'Update content generator monitoring started'
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * Handle stop monitoring
 */
async function handleStopMonitoring(generator, params) {
  try {
    const statistics = generator.getStatistics();
    generator.stopMonitoring();

    return NextResponse.json({
      success: true,
      data: {
        monitoring_stopped: true,
        final_statistics: statistics,
        message: 'Update content generator monitoring stopped'
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * Handle manual content generation
 */
async function handleManualGeneration(generator, params) {
  try {
    const {
      updateId,
      contentTypes = [],
      forceGeneration = false,
      approvalRequired = null
    } = params;

    if (!updateId) {
      return NextResponse.json({
        success: false,
        error: 'Update ID is required for manual generation'
      }, { status: 400 });
    }

    // Override approval requirements if specified
    if (approvalRequired !== null) {
      Object.keys(generator.contentRules).forEach(contentType => {
        if (contentTypes.length === 0 || contentTypes.includes(contentType)) {
          generator.contentRules[contentType].approval_required = approvalRequired;
        }
      });
    }

    // Generate content
    const result = await generator.generateContentManually(updateId, contentTypes);

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        manual_generation: true,
        forced: forceGeneration,
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
 * Handle scan for updates
 */
async function handleScanUpdates(generator, params) {
  try {
    const {
      lookbackHours = 24,
      forceReprocess = false
    } = params;

    if (forceReprocess) {
      generator.clearProcessedCache();
    }

    // Perform scan
    await generator.scanForNewUpdates();

    const statistics = generator.getStatistics();

    return NextResponse.json({
      success: true,
      data: {
        scan_completed: true,
        lookback_hours: lookbackHours,
        statistics: statistics,
        message: 'Update scan completed successfully'
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
async function handleUpdateConfig(generator, params) {
  try {
    const { configuration } = params;

    if (!configuration || typeof configuration !== 'object') {
      return NextResponse.json({
        success: false,
        error: 'Configuration object is required'
      }, { status: 400 });
    }

    // Update configuration
    generator.updateConfiguration(configuration);

    return NextResponse.json({
      success: true,
      data: {
        configuration_updated: true,
        new_configuration: generator.getConfiguration(),
        message: 'Configuration updated successfully'
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
async function handleClearCache(generator, params) {
  try {
    const statisticsBefore = generator.getStatistics();
    generator.clearProcessedCache();
    const statisticsAfter = generator.getStatistics();

    return NextResponse.json({
      success: true,
      data: {
        cache_cleared: true,
        statistics_before: statisticsBefore,
        statistics_after: statisticsAfter,
        message: 'Processed updates cache cleared'
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
 * Handle bulk content generation
 */
async function handleBulkGeneration(generator, params) {
  try {
    const {
      updateIds = [],
      contentTypes = [],
      batchSize = 5,
      approvalRequired = null
    } = params;

    if (updateIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Update IDs array is required for bulk generation'
      }, { status: 400 });
    }

    const results = [];
    const errors = [];

    // Process in batches
    for (let i = 0; i < updateIds.length; i += batchSize) {
      const batch = updateIds.slice(i, i + batchSize);
      
      for (const updateId of batch) {
        try {
          const result = await generator.generateContentManually(updateId, contentTypes);
          results.push({
            update_id: updateId,
            success: result.success,
            content_generated: result.content ? result.content.length : 0,
            result: result
          });
        } catch (error) {
          errors.push({
            update_id: updateId,
            error: error.message
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        bulk_generation_completed: true,
        total_processed: updateIds.length,
        successful_generations: results.filter(r => r.success).length,
        failed_generations: errors.length,
        results: results,
        errors: errors,
        batch_size: batchSize,
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
 * Get update by ID
 */
async function getUpdateById(updateId) {
  try {
    const { data: update } = await supabase
      .from('product_updates')
      .select('*')
      .eq('id', updateId)
      .single();

    return update;
  } catch (error) {
    console.error('Error fetching update:', error);
    return null;
  }
}

/**
 * Get recent updates
 */
async function getRecentUpdates() {
  try {
    const { data: updates } = await supabase
      .from('product_updates')
      .select('*')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
      .order('created_at', { ascending: false })
      .limit(50);

    return updates || [];
  } catch (error) {
    console.error('Error fetching recent updates:', error);
    return [];
  }
}