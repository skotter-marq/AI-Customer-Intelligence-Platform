// app/api/monitoring/route.js
/**
 * Real-time Monitoring API Routes
 * Provides real-time monitoring data and control endpoints
 */

import { NextResponse } from 'next/server';
const { supabase } = require('../../../lib/supabase-client');

// Global monitor instance
let monitorInstance = null;

// Initialize monitor instance
async function getMonitor() {
  if (!monitorInstance) {
    const { default: PipelineMonitor } = await import('../../../lib/pipeline-monitor.js');
    monitorInstance = new PipelineMonitor();
  }
  return monitorInstance;
}

/**
 * GET /api/monitoring
 * Get monitoring data and status
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';
    const component = searchParams.get('component');
    const timeframe = searchParams.get('timeframe') || '1h';

    const monitor = await getMonitor();

    switch (action) {
      case 'status':
        const status = monitor.getStatus();
        return NextResponse.json({
          success: true,
          data: {
            ...status,
            timestamp: new Date().toISOString(),
            health_summary: generateHealthSummary(status)
          }
        });

      case 'metrics':
        const metrics = monitor.getMetrics();
        return NextResponse.json({
          success: true,
          data: {
            ...metrics,
            historical_data: await getHistoricalMetrics(timeframe)
          }
        });

      case 'component':
        if (!component) {
          return NextResponse.json({
            success: false,
            error: 'Component name is required'
          }, { status: 400 });
        }
        
        const componentMetrics = monitor.getComponentMetrics(component);
        if (!componentMetrics) {
          return NextResponse.json({
            success: false,
            error: `Component '${component}' not found`
          }, { status: 404 });
        }
        
        return NextResponse.json({
          success: true,
          data: componentMetrics
        });

      case 'alerts':
        const alerts = await getRecentAlerts();
        return NextResponse.json({
          success: true,
          data: {
            alerts: alerts,
            alert_summary: generateAlertSummary(alerts),
            timestamp: new Date().toISOString()
          }
        });

      case 'health':
        // Perform immediate health check
        await monitor.performHealthCheck();
        const healthStatus = monitor.getStatus();
        
        return NextResponse.json({
          success: true,
          data: {
            overall_status: healthStatus.components ? 
              calculateOverallStatus(healthStatus.components) : 'unknown',
            components: healthStatus.components || {},
            health_score: calculateHealthScore(healthStatus.components || {}),
            timestamp: new Date().toISOString()
          }
        });

      case 'performance':
        const performanceData = await getPerformanceMetrics(timeframe);
        return NextResponse.json({
          success: true,
          data: performanceData
        });

      case 'dashboard':
        const dashboardData = await getDashboardData();
        return NextResponse.json({
          success: true,
          data: dashboardData
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: status, metrics, component, alerts, health, performance, dashboard'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Monitoring API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * POST /api/monitoring
 * Control monitoring operations
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    const monitor = await getMonitor();

    switch (action) {
      case 'start':
        await monitor.startMonitoring();
        return NextResponse.json({
          success: true,
          message: 'Monitoring started',
          timestamp: new Date().toISOString()
        });

      case 'stop':
        monitor.stopMonitoring();
        return NextResponse.json({
          success: true,
          message: 'Monitoring stopped',
          timestamp: new Date().toISOString()
        });

      case 'restart':
        monitor.stopMonitoring();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await monitor.startMonitoring();
        return NextResponse.json({
          success: true,
          message: 'Monitoring restarted',
          timestamp: new Date().toISOString()
        });

      case 'health-check':
        await monitor.performHealthCheck();
        const status = monitor.getStatus();
        return NextResponse.json({
          success: true,
          message: 'Health check completed',
          data: {
            components: status.components,
            health_score: calculateHealthScore(status.components || {}),
            timestamp: new Date().toISOString()
          }
        });

      case 'collect-metrics':
        await monitor.collectMetrics();
        const metrics = monitor.getMetrics();
        return NextResponse.json({
          success: true,
          message: 'Metrics collected',
          data: metrics
        });

      case 'clear-alerts':
        // Clear alert history
        monitor.alertHistory = [];
        return NextResponse.json({
          success: true,
          message: 'Alerts cleared',
          timestamp: new Date().toISOString()
        });

      case 'update-thresholds':
        if (params.thresholds) {
          Object.assign(monitor.config.alertThresholds, params.thresholds);
          return NextResponse.json({
            success: true,
            message: 'Thresholds updated',
            data: monitor.config.alertThresholds
          });
        }
        return NextResponse.json({
          success: false,
          error: 'Thresholds parameter is required'
        }, { status: 400 });

      case 'simulate-alert':
        const alertType = params.type || 'test';
        const alertData = params.data || { message: 'Test alert' };
        
        monitor.addAlert({
          id: `test-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: alertType,
          severity: 'warning',
          message: alertData.message,
          component: alertData.component || 'test'
        });
        
        return NextResponse.json({
          success: true,
          message: 'Alert simulated',
          data: { type: alertType, ...alertData }
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: start, stop, restart, health-check, collect-metrics, clear-alerts, update-thresholds, simulate-alert'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Monitoring Control API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Generate health summary
 */
function generateHealthSummary(status) {
  const components = status.components || {};
  const total = Object.keys(components).length;
  const healthy = Object.values(components).filter(c => c.status === 'healthy').length;
  const warning = Object.values(components).filter(c => c.status === 'warning').length;
  const error = Object.values(components).filter(c => c.status === 'error').length;
  
  return {
    total_components: total,
    healthy_components: healthy,
    warning_components: warning,
    error_components: error,
    health_percentage: total > 0 ? (healthy / total) * 100 : 0,
    status: total > 0 ? (healthy / total >= 0.8 ? 'healthy' : healthy / total >= 0.5 ? 'warning' : 'critical') : 'unknown'
  };
}

/**
 * Calculate overall status
 */
function calculateOverallStatus(components) {
  const total = Object.keys(components).length;
  if (total === 0) return 'unknown';
  
  const healthy = Object.values(components).filter(c => c.status === 'healthy').length;
  const healthPercentage = healthy / total;
  
  if (healthPercentage >= 0.8) return 'healthy';
  if (healthPercentage >= 0.5) return 'warning';
  return 'critical';
}

/**
 * Calculate health score
 */
function calculateHealthScore(components) {
  const total = Object.keys(components).length;
  if (total === 0) return 0;
  
  const healthy = Object.values(components).filter(c => c.status === 'healthy').length;
  return (healthy / total) * 100;
}

/**
 * Generate alert summary
 */
function generateAlertSummary(alerts) {
  const total = alerts.length;
  const critical = alerts.filter(a => a.severity === 'critical').length;
  const warning = alerts.filter(a => a.severity === 'warning').length;
  const info = alerts.filter(a => a.severity === 'info').length;
  
  // Group by type
  const byType = alerts.reduce((acc, alert) => {
    acc[alert.type] = (acc[alert.type] || 0) + 1;
    return acc;
  }, {});
  
  // Recent alerts (last hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recent = alerts.filter(a => new Date(a.timestamp) > oneHourAgo).length;
  
  return {
    total_alerts: total,
    critical_alerts: critical,
    warning_alerts: warning,
    info_alerts: info,
    recent_alerts: recent,
    alerts_by_type: byType
  };
}

/**
 * Get historical metrics
 */
async function getHistoricalMetrics(timeframe) {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    const hours = parseTimeframe(timeframe);
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    // Get content metrics from database
    const { data: contentMetrics } = await supabase
      .from('generated_content')
      .select('quality_score, readability_score, engagement_prediction, content_type, status, created_at')
      .gte('created_at', startTime.toISOString())
      .order('created_at', { ascending: true });
    
    // Process metrics into time series
    const timeSeries = processTimeSeriesData(contentMetrics || [], hours);
    
    return {
      timeframe: timeframe,
      data_points: contentMetrics?.length || 0,
      time_series: timeSeries,
      summary: {
        avg_quality: contentMetrics?.length > 0 ? 
          contentMetrics.reduce((sum, c) => sum + (c.quality_score || 0), 0) / contentMetrics.length : 0,
        content_count: contentMetrics?.length || 0,
        approval_rate: contentMetrics?.length > 0 ? 
          contentMetrics.filter(c => c.status === 'approved').length / contentMetrics.length : 0
      }
    };
  } catch (error) {
    console.error('Error fetching historical metrics:', error);
    return {
      timeframe: timeframe,
      data_points: 0,
      time_series: [],
      summary: { avg_quality: 0, content_count: 0, approval_rate: 0 }
    };
  }
}

/**
 * Get recent alerts
 */
async function getRecentAlerts() {
  try {
    const monitor = await getMonitor();
    return monitor.alertHistory || [];
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
}

/**
 * Get performance metrics
 */
async function getPerformanceMetrics(timeframe) {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    const hours = parseTimeframe(timeframe);
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    // Get system performance data
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    // Get pipeline performance from database
    const { data: pipelineData } = await supabase
      .from('generated_content')
      .select('created_at, status')
      .gte('created_at', startTime.toISOString())
      .order('created_at', { ascending: true });
    
    return {
      system: {
        uptime: uptime,
        memory_usage: {
          heap_used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heap_total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024)
        },
        node_version: process.version,
        platform: process.platform
      },
      pipeline: {
        total_requests: pipelineData?.length || 0,
        successful_requests: pipelineData?.filter(p => p.status === 'approved').length || 0,
        failed_requests: pipelineData?.filter(p => p.status === 'rejected').length || 0,
        success_rate: pipelineData?.length > 0 ? 
          (pipelineData.filter(p => p.status === 'approved').length / pipelineData.length) * 100 : 0
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return {
      system: { uptime: 0, memory_usage: {}, node_version: '', platform: '' },
      pipeline: { total_requests: 0, successful_requests: 0, failed_requests: 0, success_rate: 0 },
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Get dashboard data
 */
async function getDashboardData() {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      throw new Error('Database connection not available');
    }

    const monitor = await getMonitor();
    const status = monitor.getStatus();
    const metrics = monitor.getMetrics();
    const alerts = monitor.alertHistory || [];
    
    // Get recent content data
    const { data: recentContent } = await supabase
      .from('generated_content')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(100);
    
    return {
      overview: {
        monitoring_active: status.monitoring,
        total_components: Object.keys(status.components || {}).length,
        healthy_components: Object.values(status.components || {}).filter(c => c.status === 'healthy').length,
        active_alerts: alerts.filter(a => a.severity === 'critical').length,
        uptime: status.uptime || 0
      },
      metrics: {
        content_generated_today: recentContent?.length || 0,
        avg_quality_score: recentContent?.length > 0 ? 
          recentContent.reduce((sum, c) => sum + (c.quality_score || 0), 0) / recentContent.length : 0,
        approval_rate: recentContent?.length > 0 ? 
          (recentContent.filter(c => c.status === 'approved').length / recentContent.length) * 100 : 0,
        avg_processing_time: 2500 // Mock value
      },
      components: status.components || {},
      recent_alerts: alerts.slice(0, 10),
      content_distribution: groupContentByType(recentContent || []),
      performance_trend: await getPerformanceTrend(),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      overview: { monitoring_active: false, total_components: 0, healthy_components: 0, active_alerts: 0, uptime: 0 },
      metrics: { content_generated_today: 0, avg_quality_score: 0, approval_rate: 0, avg_processing_time: 0 },
      components: {},
      recent_alerts: [],
      content_distribution: {},
      performance_trend: [],
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Parse timeframe string to hours
 */
function parseTimeframe(timeframe) {
  const unit = timeframe.slice(-1);
  const value = parseInt(timeframe.slice(0, -1));
  
  switch (unit) {
    case 'h': return value;
    case 'd': return value * 24;
    case 'w': return value * 24 * 7;
    default: return 1;
  }
}

/**
 * Process time series data
 */
function processTimeSeriesData(data, hours) {
  const buckets = Math.min(hours, 24); // Max 24 data points
  const bucketSize = hours / buckets;
  const timeSeries = [];
  
  for (let i = 0; i < buckets; i++) {
    const bucketStart = new Date(Date.now() - (hours - i * bucketSize) * 60 * 60 * 1000);
    const bucketEnd = new Date(Date.now() - (hours - (i + 1) * bucketSize) * 60 * 60 * 1000);
    
    const bucketData = data.filter(d => {
      const date = new Date(d.created_at);
      return date >= bucketStart && date < bucketEnd;
    });
    
    timeSeries.push({
      timestamp: bucketEnd.toISOString(),
      count: bucketData.length,
      avg_quality: bucketData.length > 0 ? 
        bucketData.reduce((sum, d) => sum + (d.quality_score || 0), 0) / bucketData.length : 0
    });
  }
  
  return timeSeries;
}

/**
 * Group content by type
 */
function groupContentByType(content) {
  return content.reduce((acc, item) => {
    acc[item.content_type] = (acc[item.content_type] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Get performance trend
 */
async function getPerformanceTrend() {
  try {
    // Mock performance trend data
    const trend = [];
    for (let i = 23; i >= 0; i--) {
      trend.push({
        hour: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
        response_time: Math.random() * 1000 + 500,
        throughput: Math.random() * 100 + 50,
        error_rate: Math.random() * 0.05
      });
    }
    return trend;
  } catch (error) {
    return [];
  }
}