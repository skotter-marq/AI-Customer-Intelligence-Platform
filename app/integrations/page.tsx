'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Settings,
  ExternalLink,
  Activity,
  Database,
  MessageSquare,
  FileText,
  BarChart3,
  Users,
  RefreshCw,
  Link as LinkIcon,
  Zap,
  Shield,
  Globe
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  type: 'crm' | 'communication' | 'database' | 'analytics' | 'productivity' | 'security';
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  last_sync: string;
  data_points: number;
  health_score: number;
  setup_url?: string;
  manage_url?: string;
  docs_url?: string;
  features: string[];
  metrics: {
    requests_today: number;
    success_rate: number;
    avg_response_time: number;
  };
}

interface IntegrationMetrics {
  total_integrations: number;
  active_integrations: number;
  total_requests: number;
  average_health: number;
  error_rate: number;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [metrics, setMetrics] = useState<IntegrationMetrics>({
    total_integrations: 0,
    active_integrations: 0,
    total_requests: 0,
    average_health: 0,
    error_rate: 0
  });
  const [filter, setFilter] = useState<'all' | 'connected' | 'disconnected' | 'error'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'crm' | 'communication' | 'database' | 'analytics' | 'productivity' | 'security'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API calls
      const mockIntegrations: Integration[] = [
        {
          id: '1',
          name: 'HubSpot CRM',
          type: 'crm',
          status: 'connected',
          description: 'Customer relationship management and sales pipeline',
          icon: Users,
          color: 'orange',
          last_sync: '2024-01-15T10:30:00Z',
          data_points: 12847,
          health_score: 98,
          setup_url: '/integrations/hubspot/setup',
          manage_url: '/integrations/hubspot',
          docs_url: 'https://developers.hubspot.com',
          features: ['Contacts Sync', 'Deals Pipeline', 'Custom Properties', 'Webhooks'],
          metrics: {
            requests_today: 347,
            success_rate: 99.2,
            avg_response_time: 245
          }
        },
        {
          id: '2',
          name: 'Supabase',
          type: 'database',
          status: 'connected',
          description: 'Primary database for customer intelligence data',
          icon: Database,
          color: 'green',
          last_sync: '2024-01-15T10:35:00Z',
          data_points: 45623,
          health_score: 100,
          setup_url: '/integrations/supabase/setup',
          manage_url: '/integrations/supabase',
          docs_url: 'https://supabase.com/docs',
          features: ['Real-time Database', 'Edge Functions', 'Storage', 'Authentication'],
          metrics: {
            requests_today: 892,
            success_rate: 100,
            avg_response_time: 89
          }
        },
        {
          id: '3',
          name: 'Slack',
          type: 'communication',
          status: 'connected',
          description: 'Team notifications and content approval workflows',
          icon: MessageSquare,
          color: 'purple',
          last_sync: '2024-01-15T10:25:00Z',
          data_points: 156,
          health_score: 95,
          setup_url: '/integrations/slack/setup',
          manage_url: '/slack',
          docs_url: 'https://api.slack.com',
          features: ['Notifications', 'Slash Commands', 'Approval Workflows', 'Daily Summaries'],
          metrics: {
            requests_today: 23,
            success_rate: 95.7,
            avg_response_time: 312
          }
        },
        {
          id: '4',
          name: 'JIRA',
          type: 'productivity',
          status: 'syncing',
          description: 'Project management and product update tracking',
          icon: FileText,
          color: 'blue',
          last_sync: '2024-01-15T10:20:00Z',
          data_points: 892,
          health_score: 87,
          setup_url: '/integrations/jira/setup',
          manage_url: '/integrations/jira',
          docs_url: 'https://developer.atlassian.com/cloud/jira',
          features: ['Issue Tracking', 'Sprint Data', 'Custom Fields', 'Webhooks'],
          metrics: {
            requests_today: 156,
            success_rate: 87.3,
            avg_response_time: 567
          }
        },
        {
          id: '5',
          name: 'Grain',
          type: 'analytics',
          status: 'connected',
          description: 'Meeting recordings and conversation intelligence',
          icon: Activity,
          color: 'indigo',
          last_sync: '2024-01-15T09:45:00Z',
          data_points: 234,
          health_score: 92,
          setup_url: '/integrations/grain/setup',
          manage_url: '/integrations/grain',
          docs_url: 'https://grain.com/api',
          features: ['Meeting Transcripts', 'AI Insights', 'Recording Analysis', 'Webhooks'],
          metrics: {
            requests_today: 12,
            success_rate: 91.7,
            avg_response_time: 1234
          }
        },
        {
          id: '6',
          name: 'Vercel',
          type: 'productivity',
          status: 'error',
          description: 'Application hosting and deployment pipeline',
          icon: Globe,
          color: 'gray',
          last_sync: '2024-01-15T08:15:00Z',
          data_points: 45,
          health_score: 45,
          setup_url: '/integrations/vercel/setup',
          manage_url: '/integrations/vercel',
          docs_url: 'https://vercel.com/docs',
          features: ['Deployment Webhooks', 'Analytics', 'Performance Monitoring'],
          metrics: {
            requests_today: 8,
            success_rate: 62.5,
            avg_response_time: 2156
          }
        }
      ];

      setIntegrations(mockIntegrations);
      
      // Calculate metrics
      const connected = mockIntegrations.filter(i => i.status === 'connected').length;
      const totalRequests = mockIntegrations.reduce((sum, i) => sum + i.metrics.requests_today, 0);
      const avgHealth = mockIntegrations.reduce((sum, i) => sum + i.health_score, 0) / mockIntegrations.length;
      const errorRate = mockIntegrations.filter(i => i.status === 'error').length / mockIntegrations.length * 100;
      
      setMetrics({
        total_integrations: mockIntegrations.length,
        active_integrations: connected,
        total_requests: totalRequests,
        average_health: Math.round(avgHealth),
        error_rate: Math.round(errorRate * 10) / 10
      });
      
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshIntegrations = async () => {
    setRefreshing(true);
    await fetchIntegrations();
    setRefreshing(false);
  };

  const filteredIntegrations = integrations
    .filter(integration => filter === 'all' || integration.status === filter)
    .filter(integration => typeFilter === 'all' || integration.type === typeFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'syncing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return CheckCircle;
      case 'disconnected': return XCircle;
      case 'error': return AlertCircle;
      case 'syncing': return RefreshCw;
      default: return Clock;
    }
  };

  const getIntegrationColor = (color: string) => {
    const colorMap = {
      orange: 'bg-orange-100 text-orange-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      blue: 'bg-blue-100 text-blue-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      gray: 'bg-gray-100 text-gray-600'
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-100 text-gray-600';
  };

  const getHealthColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-20">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Integrations</h1>
              <p className="text-gray-600">Manage your connected services and data sources</p>
            </div>
            <button
              onClick={refreshIntegrations}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Integrations</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.total_integrations}</p>
                </div>
                <LinkIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.active_integrations}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Requests Today</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.total_requests)}</p>
                </div>
                <Activity className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Health</p>
                  <p className={`text-2xl font-bold ${getHealthColor(metrics.average_health)}`}>{metrics.average_health}%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Error Rate</p>
                  <p className={`text-2xl font-bold ${metrics.error_rate > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {metrics.error_rate}%
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-8">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <div className="flex space-x-2">
                  {['all', 'connected', 'disconnected', 'error'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilter(status as any)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                        filter === status
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Type:</span>
                <div className="flex space-x-2">
                  {['all', 'crm', 'communication', 'database', 'analytics', 'productivity'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type as any)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                        typeFilter === type
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => {
              const StatusIcon = getStatusIcon(integration.status);
              const IntegrationIcon = integration.icon;
              
              return (
                <div
                  key={integration.id}
                  className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-xl ${getIntegrationColor(integration.color)} flex items-center justify-center`}>
                          <IntegrationIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                          <p className="text-sm text-gray-600">{integration.type}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {integration.status}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{formatNumber(integration.data_points)}</p>
                        <p className="text-xs text-gray-600">Data Points</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-lg font-bold ${getHealthColor(integration.health_score)}`}>
                          {integration.health_score}%
                        </p>
                        <p className="text-xs text-gray-600">Health Score</p>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="bg-gray-50 rounded-xl p-3 mb-4">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{integration.metrics.requests_today}</p>
                          <p className="text-xs text-gray-600">Requests</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{integration.metrics.success_rate}%</p>
                          <p className="text-xs text-gray-600">Success</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{integration.metrics.avg_response_time}ms</p>
                          <p className="text-xs text-gray-600">Response</p>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-700 mb-2">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {integration.features.slice(0, 3).map((feature, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg">
                            {feature}
                          </span>
                        ))}
                        {integration.features.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">
                            +{integration.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Last Sync */}
                    <p className="text-xs text-gray-500 mb-4">
                      Last sync: {formatDate(integration.last_sync)}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {integration.manage_url && (
                          <button
                            onClick={() => window.open(integration.manage_url, '_blank')}
                            className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        )}
                        {integration.docs_url && (
                          <button
                            onClick={() => window.open(integration.docs_url, '_blank')}
                            className="p-2 rounded-xl text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <button
                        onClick={() => alert(`Testing ${integration.name} connection...`)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Test
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}