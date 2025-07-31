'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Webhook,
  Settings,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Play,
  Pause,
  Filter,
  Zap,
  FileText,
  MessageSquare,
  Calendar,
  ArrowRight
} from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumb';

interface WebhookEndpoint {
  id: string;
  name: string;
  description: string;
  url: string;
  type: 'jira' | 'grain' | 'slack' | 'zapier';
  status: 'active' | 'inactive' | 'error';
  lastTriggered?: string;
  totalRequests: number;
  successRate: number;
  configPath?: string;
}

export default function WebhookConfigPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);

  const breadcrumbItems = [
    { label: 'Admin Settings', href: '/admin/settings' },
    { label: 'Webhook Configuration', current: true }
  ];

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      // In a real app, this would fetch from your database
      // For now, we'll use static webhook data
      const mockWebhooks: WebhookEndpoint[] = [
        {
          id: 'jira-webhook',
          name: 'JIRA Webhook',
          description: 'Receives JIRA story completion updates for changelog generation',
          url: 'https://customer-intelligence-platform-skotter-1947s-projects.vercel.app/api/jira-webhook',
          type: 'jira',
          status: 'active',
          lastTriggered: '2024-01-15T10:30:00Z',
          totalRequests: 156,
          successRate: 98.7,
          configPath: '/admin/jira-filters'
        },
        {
          id: 'grain-webhook',
          name: 'Grain Webhook',
          description: 'Receives meeting recordings and transcripts from Grain platform',
          url: 'https://customer-intelligence-platform-skotter-1947s-projects.vercel.app/api/grain-webhook',
          type: 'grain',
          status: 'active',
          lastTriggered: '2024-01-14T15:45:00Z',
          totalRequests: 89,
          successRate: 95.5
        },
        {
          id: 'zapier-test',
          name: 'Zapier Test Webhook',
          description: 'General purpose webhook for testing Zapier integrations',
          url: 'https://customer-intelligence-platform-skotter-1947s-projects.vercel.app/api/zapier-test',
          type: 'zapier',
          status: 'inactive',
          lastTriggered: '2024-01-10T08:20:00Z',
          totalRequests: 23,
          successRate: 91.3
        }
      ];
      
      setWebhooks(mockWebhooks);
      setLoading(false);
    } catch (error) {
      console.error('Error loading webhooks:', error);
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'jira': return FileText;
      case 'grain': return Calendar;
      case 'slack': return MessageSquare;
      case 'zapier': return Zap;
      default: return Webhook;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-100 border-green-200';
      case 'inactive': return 'text-gray-700 bg-gray-100 border-gray-200';
      case 'error': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'inactive': return Pause;
      case 'error': return AlertCircle;
      default: return Pause;
    }
  };

  const copyWebhookUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    // Could add a toast notification here
  };

  const testWebhook = async (webhookId: string) => {
    // In a real app, this would send a test payload to the webhook
    console.log(`Testing webhook: ${webhookId}`);
    // Could show a loading state and result
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-4" style={{ background: '#f8fafc' }}>
        <div className="p-4">
          <div className="max-w-7xl mx-auto">
            <Breadcrumb items={breadcrumbItems} />
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Settings className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="calendly-body text-gray-600">Loading webhook configuration...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-4" style={{ background: '#f8fafc' }}>
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb items={breadcrumbItems} />

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="calendly-h2">Webhook Configuration</h1>
              <p className="calendly-body text-gray-600 mt-2">
                Manage webhook endpoints for external integrations and data synchronization.
              </p>
            </div>
          </div>

          {/* Webhooks Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {webhooks.map((webhook) => {
              const TypeIcon = getTypeIcon(webhook.type);
              const StatusIcon = getStatusIcon(webhook.status);
              
              return (
                <div key={webhook.id} className="calendly-card">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <TypeIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="calendly-h3">{webhook.name}</h3>
                        <p className="calendly-body-sm text-gray-600">{webhook.description}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full border text-sm flex items-center space-x-1 ${getStatusColor(webhook.status)}`}>
                      <StatusIcon className="w-3 h-3" />
                      <span className="capitalize">{webhook.status}</span>
                    </div>
                  </div>

                  {/* Webhook URL */}
                  <div className="mb-4">
                    <label className="calendly-label font-medium mb-2 block">Webhook URL</label>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 p-3 bg-gray-50 border rounded-lg text-sm font-mono break-all">
                        {webhook.url}
                      </code>
                      <button
                        onClick={() => copyWebhookUrl(webhook.url)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Copy webhook URL"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{webhook.totalRequests}</div>
                      <div className="text-xs text-gray-600">Total Requests</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{webhook.successRate}%</div>
                      <div className="text-xs text-gray-600">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">{formatDate(webhook.lastTriggered)}</div>
                      <div className="text-xs text-gray-600">Last Triggered</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => testWebhook(webhook.id)}
                        className="px-3 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <Play className="w-3 h-3" />
                        <span>Test</span>
                      </button>
                      
                      <button
                        onClick={() => window.open(webhook.url, '_blank')}
                        className="px-3 py-2 text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    </div>

                    {webhook.configPath && (
                      <button
                        onClick={() => router.push(webhook.configPath!)}
                        className="px-3 py-2 text-sm bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <Filter className="w-3 h-3" />
                        <span>Configure Filters</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {webhooks.length === 0 && (
            <div className="text-center py-12">
              <Webhook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="calendly-h3 text-gray-600 mb-2">No webhooks configured</h3>
              <p className="calendly-body text-gray-500 mb-4">
                Webhook endpoints will appear here once they're configured.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}