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
  CheckCircle,
  Globe,
  Target,
  Copy,
  ExternalLink
} from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumb';
import MultiSelect from './components/MultiSelect';

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
  // Essential filtering options
  customerFacingOnly: boolean;
  changelogCategory: 'Added' | 'Fixed' | 'Changed' | 'Deprecated' | 'Removed';
}

export default function JIRAFiltersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<JIRAFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // JIRA metadata state
  const [jiraMetadata, setJiraMetadata] = useState<any>(null);
  const [metadataLoading, setMetadataLoading] = useState(true);
  
  // Slack channels state
  const [slackChannels, setSlackChannels] = useState<any[]>([]);
  const [slackLoading, setSlackLoading] = useState(true);

  const breadcrumbItems = [
    { label: 'Admin Settings', href: '/admin/settings' },
    { label: 'JIRA Notification Filters', current: true }
  ];

  useEffect(() => {
    loadFilters();
    loadJiraMetadata();
    loadSlackChannels();
  }, []);

  const loadJiraMetadata = async () => {
    try {
      console.log('🔍 Loading JIRA metadata...');
      const response = await fetch('/api/jira/metadata');
      const data = await response.json();
      
      if (data.success) {
        setJiraMetadata(data.data);
        console.log('✅ JIRA metadata loaded:', Object.keys(data.data));
      } else {
        console.warn('⚠️ Using fallback metadata:', data.error);
        setJiraMetadata(data.data); // Fallback data
      }
    } catch (error) {
      console.error('❌ Failed to load JIRA metadata:', error);
      // Set minimal fallback data
      setJiraMetadata({
        projects: [],
        statuses: [],
        issueTypes: [],
        priorities: [],
        users: [],
        customFields: [],
        statusCategories: []
      });
    } finally {
      setMetadataLoading(false);
    }
  };

  const loadSlackChannels = async () => {
    try {
      console.log('🔍 Loading Slack channels...');
      const response = await fetch('/api/slack/channels');
      const data = await response.json();
      
      if (data.success || data.data) {
        setSlackChannels(data.data);
        console.log('✅ Slack channels loaded:', data.data.length);
      }
    } catch (error) {
      console.error('❌ Failed to load Slack channels:', error);
      setSlackChannels([]);
    } finally {
      setSlackLoading(false);
    }
  };

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
          slackChannel: '#product-updates',
          // Essential fields
          customerFacingOnly: true,
          changelogCategory: 'Added'
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
      slackChannel: '#product-updates',
      // Essential field defaults
      customerFacingOnly: true,
      changelogCategory: 'Added'
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

  if (loading || metadataLoading || slackLoading) {
    return (
      <div className="min-h-screen pt-4" style={{ background: '#f8fafc' }}>
        <div className="p-4">
          <div className="max-w-7xl mx-auto">
            <Breadcrumb items={breadcrumbItems} />
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Settings className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="calendly-body text-gray-600">Loading JIRA filters, workspace data, and Slack channels...</p>
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
              <h1 className="calendly-h2">JIRA Webhook Filters</h1>
              <p className="calendly-body text-gray-600 mt-2">
                Control which completed JIRA stories trigger changelog entries and Slack notifications.
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
                  {/* Filter Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${filter.enabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
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

                {/* Description & Webhook URL */}
                <div className="mb-6 space-y-3">
                  <textarea
                    value={filter.description}
                    onChange={(e) => updateFilter(filter.id, { description: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none calendly-body"
                    rows={2}
                    placeholder="Description of when this filter should trigger notifications"
                  />
                  
                  {/* Webhook URL */}
                  <div className="bg-gray-50 rounded-lg p-3 border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                        <ExternalLink className="w-4 h-4" />
                        <span>Webhook Endpoint</span>
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('https://customer-intelligence-platform-skotter-1947s-projects.vercel.app/api/jira-webhook');
                          // Could add a toast notification here
                        }}
                        className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Copy webhook URL"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <code className="text-xs text-gray-600 bg-white px-2 py-1 rounded border font-mono break-all">
                      https://customer-intelligence-platform-skotter-1947s-projects.vercel.app/api/jira-webhook
                    </code>
                    <p className="text-xs text-gray-500 mt-1">
                      Configure this URL in your JIRA webhook settings or Zapier integration
                    </p>
                  </div>
                </div>

                {/* Filter Criteria */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                    <Filter className="w-4 h-4" />
                    <span>Filter Criteria</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Projects */}
                    <div>
                      <label className="flex items-center space-x-2 mb-2">
                        <FolderOpen className="w-4 h-4 text-gray-600" />
                        <span className="calendly-label font-medium">Projects</span>
                      </label>
                      <MultiSelect
                        options={jiraMetadata?.projects?.map((p: any) => ({
                          value: p.key,
                          label: `${p.key} - ${p.name}`,
                          description: p.projectTypeKey
                        })) || []}
                        selected={filter.projects}
                        onChange={(selected) => updateFilter(filter.id, { projects: selected })}
                        placeholder="Select projects..."
                      />
                    </div>

                    {/* Teams/Components */}
                    <div>
                      <label className="flex items-center space-x-2 mb-2">
                        <Users className="w-4 h-4 text-gray-600" />
                        <span className="calendly-label font-medium">Product Teams</span>
                      </label>
                      <MultiSelect
                        options={jiraMetadata?.components?.map((comp: string) => ({
                          value: comp,
                          label: comp,
                          description: `${comp} team`
                        })) || []}
                        selected={filter.teams}
                        onChange={(selected) => updateFilter(filter.id, { teams: selected })}
                        placeholder="Select product teams..."
                      />
                    </div>

                    {/* Issue Types */}
                    <div>
                      <label className="flex items-center space-x-2 mb-2">
                        <Tag className="w-4 h-4 text-gray-600" />
                        <span className="calendly-label font-medium">Issue Types</span>
                      </label>
                      <MultiSelect
                        options={jiraMetadata?.issueTypes?.map((it: any) => ({
                          value: it.name,
                          label: it.name,
                          description: it.description,
                          iconUrl: it.iconUrl
                        })) || []}
                        selected={filter.issueTypes}
                        onChange={(selected) => updateFilter(filter.id, { issueTypes: selected })}
                        placeholder="Select issue types..."
                      />
                    </div>

                    {/* Labels */}
                    <div>
                      <label className="flex items-center space-x-2 mb-2">
                        <Tag className="w-4 h-4 text-gray-600" />
                        <span className="calendly-label font-medium">Required Labels</span>
                      </label>
                      <MultiSelect
                        options={jiraMetadata?.labels?.map((label: string) => ({
                          value: label,
                          label: label,
                          description: `Filter by ${label} label`
                        })) || []}
                        selected={filter.labels}
                        onChange={(selected) => updateFilter(filter.id, { labels: selected })}
                        placeholder="Select labels..."
                        maxDisplayed={5}
                      />
                    </div>
                  </div>
                </div>

                {/* Trigger Conditions */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>Trigger Conditions</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* When Status Changes To */}
                    <div>
                      <label className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-gray-600" />
                        <span className="calendly-label font-medium">When Status Changes To</span>
                      </label>
                      <MultiSelect
                        options={jiraMetadata?.statuses?.filter((status: any) => status.statusCategory.key === 'done')?.map((status: any) => ({
                          value: status.name,
                          label: status.name,
                          description: status.description || 'Completion status'
                        })) || [
                          { value: 'Done', label: 'Done', description: 'Story completed' },
                          { value: 'Closed', label: 'Closed', description: 'Issue closed' },
                          { value: 'Deployed', label: 'Deployed', description: 'Feature deployed' },
                          { value: 'Released', label: 'Released', description: 'Feature released' }
                        ]}
                        selected={filter.statuses}
                        onChange={(selected) => updateFilter(filter.id, { statuses: selected })}
                        placeholder="Select completion statuses..."
                      />
                    </div>

                    {/* Customer Facing + Changelog Category */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <Globe className="w-5 h-5 text-blue-600" />
                        <div className="flex-1">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={filter.customerFacingOnly}
                              onChange={(e) => updateFilter(filter.id, { customerFacingOnly: e.target.checked })}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="calendly-label font-medium text-blue-800">Customer Facing Only</span>
                          </label>
                        </div>
                      </div>
                      
                      <div>
                        <label className="calendly-label font-medium mb-2 block">Changelog Category</label>
                        <select
                          value={filter.changelogCategory}
                          onChange={(e) => updateFilter(filter.id, { changelogCategory: e.target.value as any })}
                          className="w-full p-3 border border-gray-300 rounded-lg calendly-body"
                        >
                          <option value="Added">Added</option>
                          <option value="Fixed">Fixed</option>
                          <option value="Changed">Changed</option>
                          <option value="Deprecated">Deprecated</option>
                          <option value="Removed">Removed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>


                {/* Notification Settings */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Notification Settings</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        {slackChannels.map((channel) => (
                          <option key={channel.id} value={channel.name}>
                            {channel.name}
                            {channel.purpose && ` - ${channel.purpose}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Notification Template */}
                    <div>
                      <label className="flex items-center space-x-2 mb-2">
                        <span className="calendly-label font-medium">Notification Template</span>
                      </label>
                      <select
                        value={filter.notificationTemplate}
                        onChange={(e) => updateFilter(filter.id, { notificationTemplate: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg calendly-body"
                      >
                        <option value="slack-jira-story-completed">JIRA Story Completed</option>
                        <option value="product-update-notification">Product Update Published</option>
                        <option value="customer-insight-alert">Customer Insight Alert</option>
                        <option value="approval-request">Content Approval Request</option>
                        <option value="daily-summary">Daily Summary</option>
                      </select>
                    </div>
                  </div>
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