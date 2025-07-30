'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  Filter,
  Users,
  FolderOpen,
  Tag,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumb';

interface JIRAFilter {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  projects: string[];
  teams: string[];
  statuses: string[];
  issueTypes: string[];
  assignees: string[];
  labels: string[];
  notificationTemplate: string;
  slackChannel: string;
}

export default function JIRAFiltersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<JIRAFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const breadcrumbItems = [
    { label: 'Admin Settings', href: '/admin/settings' },
    { label: 'JIRA Notification Filters', current: true }
  ];

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      // In a real app, this would fetch from your database
      // For now, we'll use default filters
      const defaultFilters: JIRAFilter[] = [
        {
          id: 'product-updates',
          name: 'Product Updates',
          description: 'Notify when product features are completed',
          enabled: true,
          projects: ['PRESS', 'PROD'],
          teams: ['Engineering', 'Product'],
          statuses: ['Done', 'Deployed', 'Released'],
          issueTypes: ['Story', 'Feature', 'Epic'],
          assignees: [],
          labels: ['customer-facing', 'product-update'],
          notificationTemplate: 'product-update-notification',
          slackChannel: '#product-updates'
        },
        {
          id: 'customer-requests',
          name: 'Customer Requests',
          description: 'Notify when customer-requested features are completed',
          enabled: true,
          projects: ['PRESS', 'SUPPORT'],
          teams: ['Engineering', 'Customer Success'],
          statuses: ['Done', 'Resolved'],
          issueTypes: ['Story', 'Bug', 'Task'],
          assignees: [],
          labels: ['customer-request', 'urgent'],
          notificationTemplate: 'customer-insight-alert',
          slackChannel: '#customer-insights'
        }
      ];
      
      setFilters(defaultFilters);
      setLoading(false);
    } catch (error) {
      console.error('Error loading JIRA filters:', error);
      setMessage({ type: 'error', text: 'Failed to load JIRA filters' });
      setLoading(false);
    }
  };

  const saveFilters = async () => {
    setSaving(true);
    try {
      // In a real app, this would save to your database
      console.log('Saving JIRA filters:', filters);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'JIRA filters saved successfully!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving JIRA filters:', error);
      setMessage({ type: 'error', text: 'Failed to save JIRA filters' });
    } finally {
      setSaving(false);
    }
  };

  const addFilter = () => {
    const newFilter: JIRAFilter = {
      id: `filter-${Date.now()}`,
      name: 'New Filter',
      description: 'Description for new filter',
      enabled: true,
      projects: [],
      teams: [],
      statuses: [],
      issueTypes: [],
      assignees: [],
      labels: [],
      notificationTemplate: 'product-update-notification',
      slackChannel: '#product-updates'
    };
    
    setFilters([...filters, newFilter]);
  };

  const removeFilter = (filterId: string) => {
    setFilters(filters.filter(f => f.id !== filterId));
  };

  const updateFilter = (filterId: string, updates: Partial<JIRAFilter>) => {
    setFilters(filters.map(f => f.id === filterId ? { ...f, ...updates } : f));
  };

  const updateArrayField = (filterId: string, field: keyof JIRAFilter, value: string) => {
    const filter = filters.find(f => f.id === filterId);
    if (!filter) return;

    const currentArray = filter[field] as string[];
    const newArray = value.split(',').map(v => v.trim()).filter(v => v.length > 0);
    
    updateFilter(filterId, { [field]: newArray });
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
                <p className="calendly-body text-gray-600">Loading JIRA filters...</p>
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
              <h1 className="calendly-h2">JIRA Notification Filters</h1>
              <p className="calendly-body text-gray-600 mt-2">
                Configure which JIRA updates trigger Slack notifications based on projects, teams, status, and more.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={addFilter}
                className="calendly-button calendly-button-secondary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Filter</span>
              </button>
              <button
                onClick={saveFilters}
                disabled={saving}
                className="calendly-button calendly-button-primary flex items-center space-x-2"
              >
                {saving ? (
                  <Settings className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg border flex items-center space-x-3 ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="calendly-body">{message.text}</span>
            </div>
          )}

          {/* Filters */}
          <div className="space-y-6">
            {filters.map((filter) => (
              <div key={filter.id} className="calendly-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Filter className="w-5 h-5 text-blue-600" />
                    <input
                      type="text"
                      value={filter.name}
                      onChange={(e) => updateFilter(filter.id, { name: e.target.value })}
                      className="calendly-h3 bg-transparent border-none outline-none"
                      placeholder="Filter name"
                    />
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filter.enabled}
                        onChange={(e) => updateFilter(filter.id, { enabled: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="calendly-label-sm text-gray-600">Enabled</span>
                    </label>
                  </div>
                  <button
                    onClick={() => removeFilter(filter.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-4">
                  <textarea
                    value={filter.description}
                    onChange={(e) => updateFilter(filter.id, { description: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none calendly-body"
                    rows={2}
                    placeholder="Description of when this filter should trigger notifications"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Projects */}
                  <div>
                    <label className="flex items-center space-x-2 mb-2">
                      <FolderOpen className="w-4 h-4 text-gray-600" />
                      <span className="calendly-label font-medium">Projects</span>
                    </label>
                    <input
                      type="text"
                      value={filter.projects.join(', ')}
                      onChange={(e) => updateArrayField(filter.id, 'projects', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg calendly-body"
                      placeholder="PRESS, PROD, SUPPORT"
                    />
                  </div>

                  {/* Teams */}
                  <div>
                    <label className="flex items-center space-x-2 mb-2">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="calendly-label font-medium">Teams</span>
                    </label>
                    <input
                      type="text"
                      value={filter.teams.join(', ')}
                      onChange={(e) => updateArrayField(filter.id, 'teams', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg calendly-body"
                      placeholder="Engineering, Product, Design"
                    />
                  </div>

                  {/* Statuses */}
                  <div>
                    <label className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-gray-600" />
                      <span className="calendly-label font-medium">Trigger Statuses</span>
                    </label>
                    <input
                      type="text"
                      value={filter.statuses.join(', ')}
                      onChange={(e) => updateArrayField(filter.id, 'statuses', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg calendly-body"
                      placeholder="Done, Deployed, Released"
                    />
                  </div>

                  {/* Issue Types */}
                  <div>
                    <label className="flex items-center space-x-2 mb-2">
                      <Tag className="w-4 h-4 text-gray-600" />
                      <span className="calendly-label font-medium">Issue Types</span>
                    </label>
                    <input
                      type="text"
                      value={filter.issueTypes.join(', ')}
                      onChange={(e) => updateArrayField(filter.id, 'issueTypes', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg calendly-body"
                      placeholder="Story, Feature, Epic, Bug"
                    />
                  </div>

                  {/* Labels */}
                  <div>
                    <label className="flex items-center space-x-2 mb-2">
                      <Tag className="w-4 h-4 text-gray-600" />
                      <span className="calendly-label font-medium">Required Labels</span>
                    </label>
                    <input
                      type="text"
                      value={filter.labels.join(', ')}
                      onChange={(e) => updateArrayField(filter.id, 'labels', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg calendly-body"
                      placeholder="customer-facing, product-update, urgent"
                    />
                  </div>

                  {/* Slack Channel */}
                  <div>
                    <label className="flex items-center space-x-2 mb-2">
                      <span className="calendly-label font-medium">Slack Channel</span>
                    </label>
                    <select
                      value={filter.slackChannel}
                      onChange={(e) => updateFilter(filter.id, { slackChannel: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg calendly-body"
                    >
                      <option value="#product-updates">#product-updates</option>
                      <option value="#customer-insights">#customer-insights</option>
                      <option value="#content-approvals">#content-approvals</option>
                      <option value="#content-pipeline">#content-pipeline</option>
                    </select>
                  </div>
                </div>

                {/* Notification Template */}
                <div className="mt-4">
                  <label className="flex items-center space-x-2 mb-2">
                    <span className="calendly-label font-medium">Notification Template</span>
                  </label>
                  <select
                    value={filter.notificationTemplate}
                    onChange={(e) => updateFilter(filter.id, { notificationTemplate: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg calendly-body"
                  >
                    <option value="product-update-notification">Product Update Published</option>
                    <option value="customer-insight-alert">Customer Insight Alert</option>
                    <option value="approval-request">Content Approval Request</option>
                    <option value="daily-summary">Daily Summary</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          {filters.length === 0 && (
            <div className="text-center py-12">
              <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="calendly-h3 text-gray-600 mb-2">No JIRA filters configured</h3>
              <p className="calendly-body text-gray-500 mb-4">
                Add filters to control which JIRA updates trigger Slack notifications.
              </p>
              <button
                onClick={addFilter}
                className="calendly-button calendly-button-primary flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Filter</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}