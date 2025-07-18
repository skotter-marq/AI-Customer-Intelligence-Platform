'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

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

interface Alert {
  type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  threshold: number | string;
  current_value: number | string;
  timestamp: string;
}

interface HealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'unhealthy';
  message: string;
  response_time?: number;
  usage_percentage?: number;
  checks?: any[];
}

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState<MonitoringMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadMonitoringData();
    
    if (autoRefresh) {
      const interval = setInterval(loadMonitoringData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadMonitoringData = async () => {
    try {
      // Load metrics
      const metricsResponse = await fetch('/api/monitoring?type=metrics');
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData.metrics);
      }

      // Load alerts
      const alertsResponse = await fetch('/api/monitoring?type=alerts');
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData.alerts);
      }

      // Load health checks
      const healthResponse = await fetch('/api/monitoring?type=health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setHealthChecks(healthData.checks);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 border-green-200';
      case 'warning': return 'bg-yellow-100 border-yellow-200';
      case 'unhealthy': return 'bg-red-100 border-red-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading monitoring dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Production Monitoring</h1>
                <p className="mt-2 text-gray-600">
                  Real-time system health and performance monitoring
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Auto-refresh</label>
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                {lastUpdate && (
                  <div className="text-sm text-gray-500">
                    Last updated: {formatDistanceToNow(lastUpdate, { addSuffix: true })}
                  </div>
                )}
                <button
                  onClick={loadMonitoringData}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">🚨 Active Alerts</h3>
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{alert.type.replace('_', ' ')}</h4>
                      <p className="text-sm mt-1">{alert.message}</p>
                      <p className="text-xs mt-1 opacity-75">
                        Threshold: {alert.threshold} | Current: {alert.current_value}
                      </p>
                    </div>
                    <span className="text-xs opacity-75">
                      {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Overview */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="text-3xl">⏱️</div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{formatUptime(metrics.uptime)}</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="text-3xl">🧠</div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{metrics.memory_usage.percentage.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Memory Usage</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="text-3xl">🗄️</div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-green-600">{metrics.database.response_time}ms</div>
                  <div className="text-sm text-gray-600">DB Response</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="text-3xl">🔄</div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-blue-600">{metrics.api.total_requests}</div>
                  <div className="text-sm text-gray-600">API Requests</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Health Checks */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthChecks.map((check) => (
              <div key={check.name} className={`p-4 rounded-lg border ${getStatusBgColor(check.status)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 capitalize">{check.name}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(check.status)}`}>
                    {check.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{check.message}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  {check.response_time && (
                    <span>Response: {check.response_time}ms</span>
                  )}
                  {check.usage_percentage && (
                    <span>Usage: {check.usage_percentage.toFixed(1)}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">API Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Requests</span>
                  <span className="text-sm font-medium text-gray-900">{metrics.api.total_requests}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Average Response Time</span>
                  <span className="text-sm font-medium text-gray-900">{metrics.api.average_response_time}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Error Rate</span>
                  <span className={`text-sm font-medium ${metrics.api.error_rate > 5 ? 'text-red-600' : 'text-green-600'}`}>
                    {metrics.api.error_rate}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cache Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hit Rate</span>
                  <span className="text-sm font-medium text-green-600">{metrics.cache.hit_rate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Miss Rate</span>
                  <span className="text-sm font-medium text-yellow-600">{metrics.cache.miss_rate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Operations</span>
                  <span className="text-sm font-medium text-gray-900">{metrics.cache.total_operations}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Memory Usage Details */}
        {metrics && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Memory Usage</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{metrics.memory_usage.used.toFixed(1)} MB</div>
                <div className="text-sm text-gray-600">Used</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{metrics.memory_usage.total.toFixed(1)} MB</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${metrics.memory_usage.percentage > 80 ? 'text-red-600' : 'text-green-600'}`}>
                  {metrics.memory_usage.percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Usage</div>
              </div>
            </div>
            
            {/* Memory usage bar */}
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full ${metrics.memory_usage.percentage > 80 ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${metrics.memory_usage.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}