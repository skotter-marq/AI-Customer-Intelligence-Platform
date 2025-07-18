import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface MonitoringMetrics {
  timestamp: string;
  uptime: number;
  memory_usage: {
    used: number;
    total: number;
    percentage: number;
  };
  database: {
    status: string;
    response_time: number;
    connections: number;
  };
  api: {
    total_requests: number;
    average_response_time: number;
    error_rate: number;
  };
  cache: {
    hit_rate: number;
    miss_rate: number;
    total_operations: number;
  };
}

interface AlertConfig {
  memory_threshold: number;
  response_time_threshold: number;
  error_rate_threshold: number;
  database_response_threshold: number;
}

const DEFAULT_ALERT_CONFIG: AlertConfig = {
  memory_threshold: 85,
  response_time_threshold: 2000,
  error_rate_threshold: 5,
  database_response_threshold: 1000
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'metrics';
    
    switch (type) {
      case 'metrics':
        return await getMetrics();
      case 'alerts':
        return await getAlerts();
      case 'health':
        return await getDetailedHealth();
      default:
        return NextResponse.json(
          { error: 'Invalid monitoring type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Monitoring API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...params } = body;
    
    switch (action) {
      case 'log_metric':
        return await logMetric(params);
      case 'trigger_alert':
        return await triggerAlert(params);
      case 'update_config':
        return await updateAlertConfig(params);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Monitoring POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getMetrics(): Promise<NextResponse> {
  try {
    // Get system metrics
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    // Test database performance
    const dbStartTime = Date.now();
    const { data: dbTest, error: dbError } = await supabase
      .from('generated_content')
      .select('id')
      .limit(1);
    const dbResponseTime = Date.now() - dbStartTime;
    
    // Get mock API metrics (in production, this would come from actual metrics)
    const apiMetrics = await getApiMetrics();
    
    // Get cache metrics (mock data)
    const cacheMetrics = await getCacheMetrics();
    
    const metrics: MonitoringMetrics = {
      timestamp: new Date().toISOString(),
      uptime: uptime,
      memory_usage: {
        used: memoryUsage.heapUsed / 1024 / 1024,
        total: memoryUsage.heapTotal / 1024 / 1024,
        percentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
      },
      database: {
        status: dbError ? 'error' : 'healthy',
        response_time: dbResponseTime,
        connections: 5 // Mock data
      },
      api: apiMetrics,
      cache: cacheMetrics
    };
    
    return NextResponse.json({
      success: true,
      metrics
    });
    
  } catch (error) {
    console.error('Error getting metrics:', error);
    return NextResponse.json(
      { error: 'Failed to get metrics' },
      { status: 500 }
    );
  }
}

async function getAlerts(): Promise<NextResponse> {
  try {
    const metrics = await getMetrics();
    const metricsData = await metrics.json();
    
    if (!metricsData.success) {
      throw new Error('Failed to get metrics for alerts');
    }
    
    const alerts = checkAlerts(metricsData.metrics, DEFAULT_ALERT_CONFIG);
    
    return NextResponse.json({
      success: true,
      alerts,
      alert_count: alerts.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting alerts:', error);
    return NextResponse.json(
      { error: 'Failed to get alerts' },
      { status: 500 }
    );
  }
}

async function getDetailedHealth(): Promise<NextResponse> {
  try {
    const healthChecks = await Promise.all([
      checkDatabaseHealth(),
      checkApiHealth(),
      checkMemoryHealth(),
      checkDiskHealth()
    ]);
    
    const overallHealth = healthChecks.every(check => check.status === 'healthy');
    
    return NextResponse.json({
      success: true,
      status: overallHealth ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: healthChecks,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV
    });
    
  } catch (error) {
    console.error('Error getting detailed health:', error);
    return NextResponse.json(
      { error: 'Failed to get health status' },
      { status: 500 }
    );
  }
}

async function getApiMetrics() {
  // In production, this would come from actual request logging
  return {
    total_requests: 1250,
    average_response_time: 145,
    error_rate: 2.3
  };
}

async function getCacheMetrics() {
  // In production, this would come from Redis or your cache system
  return {
    hit_rate: 87.5,
    miss_rate: 12.5,
    total_operations: 5670
  };
}

function checkAlerts(metrics: MonitoringMetrics, config: AlertConfig) {
  const alerts = [];
  
  // Memory usage alert
  if (metrics.memory_usage.percentage > config.memory_threshold) {
    alerts.push({
      type: 'memory_high',
      severity: 'warning',
      message: `Memory usage is at ${metrics.memory_usage.percentage.toFixed(1)}%`,
      threshold: config.memory_threshold,
      current_value: metrics.memory_usage.percentage,
      timestamp: new Date().toISOString()
    });
  }
  
  // Database response time alert
  if (metrics.database.response_time > config.database_response_threshold) {
    alerts.push({
      type: 'database_slow',
      severity: 'warning',
      message: `Database response time is ${metrics.database.response_time}ms`,
      threshold: config.database_response_threshold,
      current_value: metrics.database.response_time,
      timestamp: new Date().toISOString()
    });
  }
  
  // API response time alert
  if (metrics.api.average_response_time > config.response_time_threshold) {
    alerts.push({
      type: 'api_slow',
      severity: 'warning',
      message: `API response time is ${metrics.api.average_response_time}ms`,
      threshold: config.response_time_threshold,
      current_value: metrics.api.average_response_time,
      timestamp: new Date().toISOString()
    });
  }
  
  // Error rate alert
  if (metrics.api.error_rate > config.error_rate_threshold) {
    alerts.push({
      type: 'error_rate_high',
      severity: 'critical',
      message: `Error rate is ${metrics.api.error_rate}%`,
      threshold: config.error_rate_threshold,
      current_value: metrics.api.error_rate,
      timestamp: new Date().toISOString()
    });
  }
  
  // Database status alert
  if (metrics.database.status !== 'healthy') {
    alerts.push({
      type: 'database_unhealthy',
      severity: 'critical',
      message: 'Database is not responding properly',
      threshold: 'healthy',
      current_value: metrics.database.status,
      timestamp: new Date().toISOString()
    });
  }
  
  return alerts;
}

async function checkDatabaseHealth() {
  try {
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('generated_content')
      .select('id')
      .limit(1);
    const responseTime = Date.now() - startTime;
    
    return {
      name: 'database',
      status: error ? 'unhealthy' : 'healthy',
      response_time: responseTime,
      message: error ? error.message : 'Database is responding normally'
    };
  } catch (error) {
    return {
      name: 'database',
      status: 'unhealthy',
      response_time: 0,
      message: error instanceof Error ? error.message : 'Database connection failed'
    };
  }
}

async function checkApiHealth() {
  try {
    // Check internal API endpoints
    const endpoints = [
      '/api/health',
      '/api/changelog',
      '/api/approval'
    ];
    
    const checks = await Promise.all(
      endpoints.map(async (endpoint) => {
        try {
          const startTime = Date.now();
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${endpoint}`);
          const responseTime = Date.now() - startTime;
          
          return {
            endpoint,
            status: response.ok ? 'healthy' : 'unhealthy',
            response_time: responseTime,
            status_code: response.status
          };
        } catch (error) {
          return {
            endpoint,
            status: 'unhealthy',
            response_time: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );
    
    const allHealthy = checks.every(check => check.status === 'healthy');
    
    return {
      name: 'api',
      status: allHealthy ? 'healthy' : 'unhealthy',
      checks,
      message: allHealthy ? 'All API endpoints are responding' : 'Some API endpoints are not responding'
    };
  } catch (error) {
    return {
      name: 'api',
      status: 'unhealthy',
      checks: [],
      message: error instanceof Error ? error.message : 'API health check failed'
    };
  }
}

async function checkMemoryHealth() {
  const memoryUsage = process.memoryUsage();
  const percentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
  
  return {
    name: 'memory',
    status: percentage > 90 ? 'unhealthy' : percentage > 75 ? 'warning' : 'healthy',
    usage_percentage: percentage,
    used_mb: memoryUsage.heapUsed / 1024 / 1024,
    total_mb: memoryUsage.heapTotal / 1024 / 1024,
    message: `Memory usage is at ${percentage.toFixed(1)}%`
  };
}

async function checkDiskHealth() {
  // Mock disk health check - in production, you'd check actual disk usage
  return {
    name: 'disk',
    status: 'healthy',
    usage_percentage: 45,
    free_gb: 25.6,
    total_gb: 50,
    message: 'Disk usage is within normal limits'
  };
}

async function logMetric(params: any) {
  // In production, this would log to a metrics database or service
  console.log('Metric logged:', params);
  
  return NextResponse.json({
    success: true,
    message: 'Metric logged successfully'
  });
}

async function triggerAlert(params: any) {
  // In production, this would send alerts via email, Slack, etc.
  console.log('Alert triggered:', params);
  
  return NextResponse.json({
    success: true,
    message: 'Alert triggered successfully'
  });
}

async function updateAlertConfig(params: any) {
  // In production, this would update alert configuration in database
  console.log('Alert config updated:', params);
  
  return NextResponse.json({
    success: true,
    message: 'Alert configuration updated successfully'
  });
}