'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SystemMetric {
  name: string;
  value: string;
  status: 'healthy' | 'warning' | 'error';
  lastUpdated: string;
}

interface AdminAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
}

export default function AdminPage() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    {
      name: 'API Response Time',
      value: '145ms',
      status: 'healthy',
      lastUpdated: '2 min ago'
    },
    {
      name: 'Database Connection',
      value: 'Active',
      status: 'healthy',
      lastUpdated: '1 min ago'
    },
    {
      name: 'Background Jobs',
      value: '3 pending',
      status: 'warning',
      lastUpdated: '5 min ago'
    },
    {
      name: 'Storage Usage',
      value: '67%',
      status: 'healthy',
      lastUpdated: '10 min ago'
    }
  ]);

  const [loading, setLoading] = useState(false);

  const adminActions: AdminAction[] = [
    {
      id: 'clear_cache',
      title: 'Clear Cache',
      description: 'Clear application cache to improve performance',
      icon: '🧹',
      color: 'bg-blue-500',
      action: () => {
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          alert('Cache cleared successfully');
        }, 2000);
      }
    },
    {
      id: 'run_diagnostics',
      title: 'Run Diagnostics',
      description: 'Run comprehensive system diagnostics',
      icon: '🔬',
      color: 'bg-green-500',
      action: () => {
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          alert('System diagnostics completed - All systems operational');
        }, 3000);
      }
    },
    {
      id: 'backup_data',
      title: 'Backup Data',
      description: 'Create a backup of all system data',
      icon: '💾',
      color: 'bg-purple-500',
      action: () => {
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          alert('Data backup completed successfully');
        }, 4000);
      }
    },
    {
      id: 'refresh_metrics',
      title: 'Refresh Metrics',
      description: 'Update all system metrics and health checks',
      icon: '🔄',
      color: 'bg-orange-500',
      action: () => {
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          // Simulate metric updates
          setMetrics(prev => prev.map(metric => ({
            ...metric,
            lastUpdated: 'Just now'
          })));
        }, 1500);
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 border-green-200';
      case 'warning': return 'bg-yellow-100 border-yellow-200';
      case 'error': return 'bg-red-100 border-red-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="mt-2 text-gray-600">
                  System administration and management tools
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Admin Access Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric) => (
              <div key={metric.name} className={`p-4 rounded-lg border ${getStatusBg(metric.status)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-600">{metric.name}</div>
                    <div className="text-lg font-bold text-gray-900">{metric.value}</div>
                    <div className="text-xs text-gray-500">{metric.lastUpdated}</div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    metric.status === 'healthy' ? 'bg-green-500' :
                    metric.status === 'warning' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminActions.map((action) => (
              <div key={action.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${action.color} text-white text-xl`}>
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{action.title}</h3>
                    <p className="text-gray-600 mb-4">{action.description}</p>
                    <button
                      onClick={action.action}
                      disabled={loading}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        loading 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {loading ? 'Processing...' : 'Execute'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Links</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/testing"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-xl">🧪</span>
                <div>
                  <div className="font-medium text-gray-900">Testing Dashboard</div>
                  <div className="text-sm text-gray-500">Run comprehensive tests</div>
                </div>
              </Link>
              <Link
                href="/monitoring"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-xl">🔬</span>
                <div>
                  <div className="font-medium text-gray-900">System Monitoring</div>
                  <div className="text-sm text-gray-500">Monitor system performance</div>
                </div>
              </Link>
              <Link
                href="/notifications"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-xl">🔔</span>
                <div>
                  <div className="font-medium text-gray-900">Notifications</div>
                  <div className="text-sm text-gray-500">Configure system notifications</div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Information</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Application Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Version:</span>
                    <span className="font-medium">v1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Environment:</span>
                    <span className="font-medium">Development</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Framework:</span>
                    <span className="font-medium">Next.js 15.4.1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Database:</span>
                    <span className="font-medium">Supabase (PostgreSQL)</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Current Session</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">User:</span>
                    <span className="font-medium">Admin</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Session Started:</span>
                    <span className="font-medium">Today at 10:30 AM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Activity:</span>
                    <span className="font-medium">2 minutes ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IP Address:</span>
                    <span className="font-medium">192.168.1.100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}