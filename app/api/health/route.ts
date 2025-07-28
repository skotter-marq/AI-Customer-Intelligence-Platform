import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase-client';

export async function GET() {
  try {
    // Handle missing Supabase client during build
    if (!supabase) {
      return NextResponse.json({
        status: 'degraded',
        timestamp: new Date().toISOString(),
        services: {
          database: { status: 'unavailable', message: 'Connection not configured' },
          api: { status: 'ok' }
        }
      });
    }
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: 'unknown',
        api: 'healthy',
        memory: {
          used: process.memoryUsage().heapUsed / 1024 / 1024,
          total: process.memoryUsage().heapTotal / 1024 / 1024
        }
      }
    };

    // Test database connection
    try {
      const { data, error } = await supabase
        .from('generated_content')
        .select('id')
        .limit(1);
      
      if (error) {
        health.services.database = 'error';
        health.status = 'degraded';
      } else {
        health.services.database = 'healthy';
      }
    } catch (error) {
      health.services.database = 'error';
      health.status = 'degraded';
    }

    // Check memory usage
    const memoryUsagePercent = (health.services.memory.used / health.services.memory.total) * 100;
    if (memoryUsagePercent > 90) {
      health.status = 'degraded';
    }

    // Return appropriate status code
    const statusCode = health.status === 'healthy' ? 200 : 503;
    
    return NextResponse.json(health, { status: statusCode });

  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}