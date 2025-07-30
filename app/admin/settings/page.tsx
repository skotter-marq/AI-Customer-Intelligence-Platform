'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings,
  Slack,
  Eye,
  Download,
  Plus,
  Bot,
  MessageSquare,
  Users,
  Lock,
  Database,
  Webhook,
  Key,
  Bell,
  Shield,
  Globe,
  FileText,
  Zap,
  ArrowRight
} from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumb';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  actions: SettingAction[];
  category: 'integrations' | 'content' | 'permissions' | 'system';
}

interface SettingAction {
  id: string;
  label: string;
  description: string;
  href?: string;
  onClick?: () => void;
  icon: React.ComponentType<{ className?: string }>;
  status?: 'active' | 'inactive' | 'pending';
}

export default function AdminSettingsPage() {
  const router = useRouter();

  const settingSections: SettingSection[] = [
    {
      id: 'integrations',
      title: 'Integrations & Notifications',
      description: 'Configure external services and notification settings',
      icon: Zap,
      category: 'integrations',
      actions: [
        {
          id: 'slack-config',
          label: 'Configure Slack (Legacy)',
          description: 'Legacy Slack template configuration - use AI Prompts instead',
          href: '/slack/configuration',
          icon: Slack,
          status: 'inactive'
        },
        {
          id: 'meeting-prompts',
          label: 'Meeting AI Prompts (Legacy)',
          description: 'Legacy meeting prompts - use AI Prompts instead',
          href: '/meetings/ai-prompts',
          icon: Bot,
          status: 'inactive'
        },
        {
          id: 'webhook-config',
          label: 'Webhook Configuration',
          description: 'Manage JIRA and other webhook integrations',
          icon: Webhook,
          status: 'active'
        },
        {
          id: 'jira-filters',
          label: 'JIRA Notification Filters',
          description: 'Configure which JIRA projects and teams trigger notifications',
          href: '/admin/jira-filters',
          icon: FileText,
          status: 'active'
        },
        {
          id: 'ai-prompts',
          label: 'AI Prompt Management',
          description: 'Centralized management of all AI prompts and content generation',
          href: '/admin/ai-prompts',
          icon: Bot,
          status: 'active'
        }
      ]
    },
    {
      id: 'content-management',
      title: 'Content Management',
      description: 'Configure content pipeline and publication settings',
      icon: FileText,
      category: 'content',
      actions: [
        {
          id: 'public-view',
          label: 'View Public Changelog',
          description: 'Preview how your changelog appears to customers',
          onClick: () => window.open('/changelog/public', '_blank'),
          icon: Eye,
          status: 'active'
        },
        {
          id: 'export-data',
          label: 'Export Data',
          description: 'Export product updates and analytics data',
          onClick: () => router.push('/product?action=export'),
          icon: Download,
          status: 'active'
        },
        {
          id: 'create-entry',
          label: 'Create New Entry',
          description: 'Add a new product update or changelog entry',
          onClick: () => router.push('/product?action=new'),
          icon: Plus,
          status: 'active'
        }
      ]
    },
    {
      id: 'user-permissions',
      title: 'User & Permissions',
      description: 'Manage user access and team permissions',
      icon: Shield,
      category: 'permissions',
      actions: [
        {
          id: 'user-management',
          label: 'User Management',
          description: 'Add, remove, and manage user accounts',
          icon: Users,
          status: 'pending'
        },
        {
          id: 'api-keys',
          label: 'API Keys',
          description: 'Manage API keys and authentication tokens',
          icon: Key,
          status: 'pending'
        },
        {
          id: 'permissions',
          label: 'Role Permissions',
          description: 'Configure role-based access controls',
          icon: Lock,
          status: 'pending'
        }
      ]
    },
    {
      id: 'system-config',
      title: 'System Configuration',
      description: 'Advanced system settings and database management',
      icon: Database,
      category: 'system',
      actions: [
        {
          id: 'database-config',
          label: 'Database Settings',
          description: 'Configure database connections and backups',
          icon: Database,
          status: 'active'
        },
        {
          id: 'notification-settings',
          label: 'Global Notifications',
          description: 'Configure system-wide notification preferences',
          icon: Bell,
          status: 'active'
        },
        {
          id: 'public-settings',
          label: 'Public Site Settings',
          description: 'Configure public changelog appearance and domains',
          icon: Globe,
          status: 'active'
        }
      ]
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'integrations': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'content': return 'text-green-600 bg-green-50 border-green-200';
      case 'permissions': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'system': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleActionClick = (action: SettingAction) => {
    if (action.href) {
      router.push(action.href);
    } else if (action.onClick) {
      action.onClick();
    }
  };

  return (
    <div className="min-h-screen pt-4" style={{ background: '#f8fafc' }}>
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div style={{ marginBottom: '16px' }}>
            <h1 className="calendly-h2">Admin Settings</h1>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {settingSections.map((section) => {
              const SectionIcon = section.icon;
              
              return (
                <div key={section.id} className="calendly-card">
                  <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(section.category)}`}>
                        <SectionIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="calendly-h3">{section.title}</h3>
                        <p className="calendly-body-sm text-gray-600">{section.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {section.actions.map((action) => {
                      const ActionIcon = action.icon;
                      
                      return (
                        <button
                          key={action.id}
                          onClick={() => handleActionClick(action)}
                          className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-left"
                          disabled={action.status === 'pending'}
                        >
                          <div className="flex items-center space-x-3">
                            <ActionIcon className="w-5 h-5 text-gray-600" />
                            <div>
                              <h4 className="calendly-body font-medium">{action.label}</h4>
                              <p className="calendly-label-sm text-gray-600">{action.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            {action.status && (
                              <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(action.status)}`}>
                                {action.status}
                              </span>
                            )}
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </button>
                      );
                    })}
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