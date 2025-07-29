'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bot,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Eye,
  Settings,
  Download,
  ChevronDown,
  Plus,
  Edit,
  Zap,
  Activity,
  BarChart3,
  TrendingUp,
  Play,
  Pause,
  StopCircle,
  RefreshCw,
  Target,
  Bell,
  Globe,
  MessageSquare,
  DollarSign,
  Users,
  Package,
  ArrowUpDown,
  Grid3X3,
  List,
  ExternalLink,
  Trash2
} from 'lucide-react';

interface AgentConfiguration {
  keywords: string[];
  sources: string[];
  frequency: string;
  notification_threshold: number;
  data_retention_days: number;
}

interface IntelligenceAgent {
  id: string;
  name: string;
  description: string;
  agent_type: string;
  status: 'active' | 'inactive' | 'training' | 'error' | 'maintenance';
  model: string;
  temperature: number;
  max_tokens: number;
  system_prompt?: string;
  capabilities: string[];
  tools: string[];
  available_functions: string[];
  webhook_url?: string;
  api_endpoint?: string;
  auth_method: string;
  total_conversations: number;
  successful_completions: number;
  average_response_time: number;
  success_rate: number;
  version: string;
  created_by: string;
  tags: string[];
  use_cases: string[];
  target_audience: string;
  business_value?: string;
  created_at: string;
  updated_at: string;
  last_active_at?: string;
  deployment?: {
    environment: string;
    deployment_status: string;
    health_status: string;
    last_health_check?: string;
  };
  recent_analytics?: {
    conversations_this_week: number;
    average_response_time: number;
    average_rating: number;
    analytics_data: any[];
  };
  recent_conversations?: any[];
}

export default function AgentsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<IntelligenceAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'customer-support' | 'research-analysis' | 'content-creation' | 'lead-qualification' | 'meeting-analysis' | 'feedback-analysis'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'training' | 'error' | 'maintenance'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'success_rate' | 'insights'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

  // Export functionality
  const [showExportMenu, setShowExportMenu] = useState(false);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('agent_type', typeFilter);
      params.append('include_analytics', 'true');
      params.append('include_conversations', 'true');
      
      const response = await fetch(`/api/agents?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setAgents(data.agents);
      } else {
        console.error('Failed to load agents:', data.error);
        setAgents([]);
      }
    } catch (error) {
      console.error('Error loading agents:', error);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, [statusFilter, typeFilter]);


  // Generate Agent Performance Summary data
  const generatePerformanceSummary = (agents: IntelligenceAgent[]) => {
    return agents.map(agent => ({
      'Agent Name': agent.name,
      'Type': agent.agent_type.toUpperCase(),
      'Status': agent.status.toUpperCase(),
      'Model': agent.model,
      'Success Rate': `${Math.round(agent.success_rate * 100)}%`,
      'Total Conversations': agent.total_conversations,
      'Successful Completions': agent.successful_completions,
      'Average Response Time': `${agent.average_response_time}ms`,
      'Conversations This Week': agent.recent_analytics?.conversations_this_week || 0,
      'Target Audience': agent.target_audience,
      'Deployment Status': agent.deployment?.deployment_status || 'Unknown',
      'Health Status': agent.deployment?.health_status || 'Unknown',
      'Created Date': new Date(agent.created_at).toLocaleDateString(),
      'Last Active': agent.last_active_at ? new Date(agent.last_active_at).toLocaleDateString() : 'Never'
    }));
  };

  // Generate Detailed Agent Configuration data
  const generateDetailedConfiguration = (agents: IntelligenceAgent[]) => {
    return agents.map(agent => ({
      'Agent Name': agent.name,
      'Description': agent.description,
      'Type': agent.agent_type.toUpperCase(),
      'Status': agent.status.toUpperCase(),
      'Model': agent.model,
      'Temperature': agent.temperature,
      'Max Tokens': agent.max_tokens,
      'Capabilities': agent.capabilities.join('; '),
      'Tools': agent.tools.join('; '),
      'Available Functions': agent.available_functions.join('; '),
      'Use Cases': agent.use_cases.join('; '),
      'Target Audience': agent.target_audience,
      'Auth Method': agent.auth_method,
      'Webhook URL': agent.webhook_url || 'Not configured',
      'API Endpoint': agent.api_endpoint || 'Not configured',
      'Version': agent.version,
      'Created By': agent.created_by,
      'Tags': agent.tags.join('; '),
      'Created Date': new Date(agent.created_at).toLocaleDateString(),
      'Updated Date': new Date(agent.updated_at).toLocaleDateString()
    }));
  };

  // Generate Agent Activity Report data
  const generateActivityReport = (agents: IntelligenceAgent[]) => {
    return agents.map(agent => ({
      'Agent Name': agent.name,
      'Type': agent.agent_type.toUpperCase(),
      'Current Status': agent.status.toUpperCase(),
      'Model': agent.model,
      'Temperature': agent.temperature,
      'Total Conversations': agent.total_conversations,
      'Successful Completions': agent.successful_completions,
      'Recent Activity (7 days)': agent.recent_analytics?.conversations_this_week || 0,
      'Average Response Time': `${agent.average_response_time}ms`,
      'Success Rate': `${Math.round(agent.success_rate * 100)}%`,
      'Deployment Environment': agent.deployment?.environment || 'Unknown',
      'Health Status': agent.deployment?.health_status || 'Unknown',
      'Last Active': agent.last_active_at ? new Date(agent.last_active_at).toLocaleString() : 'Never',
      'Configuration Last Updated': new Date(agent.updated_at).toLocaleDateString()
    }));
  };

  // Generate Performance Analytics data
  const generatePerformanceAnalytics = (agents: IntelligenceAgent[]) => {
    const analytics = agents.map(agent => {
      const conversationEfficiency = agent.total_conversations / Math.max(1, Math.floor((new Date().getTime() - new Date(agent.created_at).getTime()) / (1000 * 60 * 60 * 24)));
      const weeklyGrowthRate = agent.recent_analytics?.conversations_this_week && agent.total_conversations > 0 ? 
        ((agent.recent_analytics.conversations_this_week / (agent.total_conversations - agent.recent_analytics.conversations_this_week)) * 100) : 0;
      
      return {
        'Agent Name': agent.name,
        'Type Category': agent.agent_type.toUpperCase(),
        'Success Rate': `${Math.round(agent.success_rate * 100)}%`,
        'Conversation Rate': `${conversationEfficiency.toFixed(2)} per day`,
        'Weekly Growth': `${weeklyGrowthRate.toFixed(1)}%`,
        'Total Conversations': agent.total_conversations,
        'Recent Performance': agent.recent_analytics?.conversations_this_week || 0,
        'Efficiency Score': Math.round(agent.success_rate * conversationEfficiency * 10),
        'Capabilities Count': agent.capabilities.length,
        'Tools Count': agent.tools.length,
        'Functions Count': agent.available_functions.length,
        'Average Rating': agent.recent_analytics?.average_rating || 0,
        'ROI Indicator': agent.success_rate > 0.8 && (agent.recent_analytics?.conversations_this_week || 0) > 5 ? 'HIGH' : agent.success_rate > 0.6 ? 'MEDIUM' : 'LOW'
      };
    });
    
    return analytics.sort((a, b) => parseInt(String(b['Efficiency Score'])) - parseInt(String(a['Efficiency Score'])));
  };

  // Generate Agent Health & Monitoring data
  const generateHealthMonitoring = (agents: IntelligenceAgent[]) => {
    return agents.map(agent => {
      const daysSinceActive = agent.last_active_at ? 
        Math.floor((new Date().getTime() - new Date(agent.last_active_at).getTime()) / (1000 * 60 * 60 * 24)) : null;
      const healthScore = agent.status === 'active' && agent.success_rate > 0.7 ? 'HEALTHY' : 
                         agent.status === 'inactive' ? 'INACTIVE' : 
                         agent.status === 'error' ? 'CRITICAL' : 'WARNING';
      
      return {
        'Agent Name': agent.name,
        'Current Status': agent.status.toUpperCase(),
        'Health Score': healthScore,
        'Deployment Status': agent.deployment?.deployment_status || 'Unknown',
        'Deployment Health': agent.deployment?.health_status || 'Unknown',
        'Success Rate': `${Math.round(agent.success_rate * 100)}%`,
        'Days Since Last Active': daysSinceActive || 'Never active',
        'Error Rate': `${Math.round((1 - agent.success_rate) * 100)}%`,
        'Model Configuration': agent.model,
        'Temperature Setting': agent.temperature,
        'Max Tokens': agent.max_tokens,
        'Auth Method': agent.auth_method,
        'Capabilities Count': agent.capabilities.length,
        'Tools Count': agent.tools.length,
        'Version': agent.version,
        'Last Health Check': agent.deployment?.last_health_check ? new Date(agent.deployment.last_health_check).toLocaleDateString() : 'Never',
        'System Recommendation': healthScore === 'CRITICAL' ? 'IMMEDIATE ATTENTION' : 
                               healthScore === 'WARNING' ? 'REVIEW REQUIRED' : 'OPERATING NORMALLY'
      };
    });
  };

  // Convert array of objects to CSV
  const arrayToCSV = (data: any[], filename: string) => {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in values
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  // Download file
  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Export handlers
  const handleExportCSV = (dataType: 'performance' | 'configuration' | 'activity' | 'analytics' | 'health') => {
    const timestamp = new Date().toISOString().split('T')[0];
    let data: any[] = [];
    let filename = '';

    switch (dataType) {
      case 'performance':
        data = generatePerformanceSummary(filteredAgents);
        filename = `agent-performance-summary-${timestamp}.csv`;
        break;
      case 'configuration':
        data = generateDetailedConfiguration(filteredAgents);
        filename = `agent-detailed-configuration-${timestamp}.csv`;
        break;
      case 'activity':
        data = generateActivityReport(filteredAgents);
        filename = `agent-activity-report-${timestamp}.csv`;
        break;
      case 'analytics':
        data = generatePerformanceAnalytics(filteredAgents);
        filename = `agent-performance-analytics-${timestamp}.csv`;
        break;
      case 'health':
        data = generateHealthMonitoring(filteredAgents);
        filename = `agent-health-monitoring-${timestamp}.csv`;
        break;
    }

    const csvContent = arrayToCSV(data, filename);
    downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
    setShowExportMenu(false);
  };

  const handleExportJSON = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const exportData = {
      export_date: new Date().toISOString(),
      total_agents: filteredAgents.length,
      performance_summary: generatePerformanceSummary(filteredAgents),
      detailed_configuration: generateDetailedConfiguration(filteredAgents),
      activity_report: generateActivityReport(filteredAgents),
      performance_analytics: generatePerformanceAnalytics(filteredAgents),
      health_monitoring: generateHealthMonitoring(filteredAgents)
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    downloadFile(jsonContent, `agent-intelligence-${timestamp}.json`, 'application/json');
    setShowExportMenu(false);
  };

  const handleExportAll = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Export all as separate CSV files
    handleExportCSV('performance');
    setTimeout(() => handleExportCSV('configuration'), 100);
    setTimeout(() => handleExportCSV('activity'), 200);
    setTimeout(() => handleExportCSV('analytics'), 300);
    setTimeout(() => handleExportCSV('health'), 400);
    
    setShowExportMenu(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'customer-support': return Users;
      case 'research-analysis': return BarChart3;
      case 'content-creation': return Edit;
      case 'lead-qualification': return Target;
      case 'meeting-analysis': return MessageSquare;
      case 'feedback-analysis': return Star;
      default: return Bot;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'customer-support': return { bg: '#f0fdf4', color: '#10b981' };
      case 'research-analysis': return { bg: '#f0f4ff', color: '#4285f4' };
      case 'content-creation': return { bg: '#fef3c7', color: '#f59e0b' };
      case 'lead-qualification': return { bg: '#e9d5ff', color: '#8b5cf6' };
      case 'meeting-analysis': return { bg: '#fce7f3', color: '#ec4899' };
      case 'feedback-analysis': return { bg: '#ecfccb', color: '#65a30d' };
      default: return { bg: '#f1f5f9', color: '#6b7280' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'calendly-badge-success';
      case 'inactive': return 'calendly-badge-info';
      case 'training': return 'calendly-badge-warning';
      case 'error': return 'calendly-badge-danger';
      case 'maintenance': return 'calendly-badge-warning';
      default: return 'calendly-badge-info';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return Play;
      case 'inactive': return Pause;
      case 'training': return RefreshCw;
      case 'error': return AlertTriangle;
      case 'maintenance': return Settings;
      default: return Clock;
    }
  };


  const filteredAgents = agents.filter(agent => {
    const matchesSearch = !searchQuery || 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || agent.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAgentAction = async (agentId: string, action: 'start' | 'pause' | 'stop' | 'edit') => {
    if (action === 'edit') {
      router.push(`/agents/${agentId}/edit`);
    } else {
      try {
        const newStatus = action === 'start' ? 'active' : action === 'pause' ? 'inactive' : 'maintenance';
        const response = await fetch(`/api/agents?id=${agentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
          // Reload agents to get updated status
          loadAgents();
        } else {
          console.error('Failed to update agent status');
        }
      } catch (error) {
        console.error('Error updating agent:', error);
      }
    }
  };

  const handleDeleteAgent = async (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/agents?id=${agentId}`, { 
          method: 'DELETE' 
        });
        
        if (response.ok) {
          // Remove from local state
          setAgents(prev => prev.filter(agent => agent.id !== agentId));
        } else {
          const data = await response.json();
          console.error('Failed to delete agent:', data.error);
          alert('Failed to delete agent. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting agent:', error);
        alert('Failed to delete agent. Please try again.');
      }
    }
  };

  const handleAgentClick = (agentId: string) => {
    router.push(`/agents/${agentId}`);
  };

  const handleSelectAgent = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedAgents.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedAgents.length} agent${selectedAgents.length !== 1 ? 's' : ''}? This action cannot be undone.`)) {
      try {
        const promises = selectedAgents.map(id => 
          fetch(`/api/agents?id=${id}`, { method: 'DELETE' })
        );
        
        await Promise.all(promises);
        
        // Remove from local state
        setAgents(prev => prev.filter(a => !selectedAgents.includes(a.id)));
        setSelectedAgents([]);
      } catch (error) {
        console.error('Error bulk deleting agents:', error);
        alert('Failed to delete agents. Please try again.');
      }
    }
  };

  const handleBulkStatusChange = async (newStatus: 'active' | 'inactive' | 'maintenance') => {
    if (selectedAgents.length === 0) return;
    
    try {
      // Update local state optimistically
      setAgents(prev => prev.map(agent => 
        selectedAgents.includes(agent.id) 
          ? { ...agent, status: newStatus }
          : agent
      ));
      
      setSelectedAgents([]);
      
      // Here you would make API calls to update the status
      console.log(`Updated ${selectedAgents.length} agents to ${newStatus}`);
    } catch (error) {
      console.error('Error bulk updating agents:', error);
      alert('Failed to update agents. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#4285f4' }}></div>
                <p className="calendly-body mt-4">Loading agents...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
            <div>
              <h1 className="calendly-h1">AI Agents</h1>
              <p className="calendly-body">Manage and monitor intelligent agents for competitive intelligence</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Export Menu */}
              <div className="relative">
                <button 
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="calendly-btn-secondary flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Export Agent Intelligence</h3>
                      
                      {/* CSV Exports */}
                      <div className="space-y-2 mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">CSV Reports</h4>
                        <button
                          onClick={() => handleExportCSV('performance')}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">Performance Summary</div>
                            <div className="text-xs text-gray-500">Success rates & insight metrics</div>
                          </div>
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportCSV('configuration')}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">Detailed Configuration</div>
                            <div className="text-xs text-gray-500">Complete agent setup & settings</div>
                          </div>
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportCSV('activity')}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">Activity Report</div>
                            <div className="text-xs text-gray-500">Scheduling & operational insights</div>
                          </div>
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportCSV('analytics')}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">Performance Analytics</div>
                            <div className="text-xs text-gray-500">Data-driven optimization insights</div>
                          </div>
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportCSV('health')}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">Health & Monitoring</div>
                            <div className="text-xs text-gray-500">System reliability & error tracking</div>
                          </div>
                          <Download className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Complete Export</h4>
                        <button
                          onClick={handleExportJSON}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center justify-between mb-2"
                        >
                          <div>
                            <div className="font-medium">JSON Data Export</div>
                            <div className="text-xs text-gray-500">All data in structured format</div>
                          </div>
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleExportAll}
                          className="w-full text-left px-3 py-2 text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">Export All (CSV)</div>
                            <div className="text-xs text-indigo-600">Download all 5 CSV reports</div>
                          </div>
                          <Package className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                        Exporting {filteredAgents.length} agents
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Click outside to close */}
                {showExportMenu && (
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowExportMenu(false)}
                  />
                )}
              </div>
              <button 
                onClick={() => router.push('/agents/create')}
                className="calendly-btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Agent</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{ marginBottom: '24px' }}>
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Total Agents</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>{agents.length}</p>
                </div>
                <Bot className="w-8 h-8" style={{ color: '#4285f4' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Active Agents</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>{agents.filter(a => a.status === 'active').length}</p>
                </div>
                <Play className="w-8 h-8" style={{ color: '#10b981' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Total Insights</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>{agents.reduce((sum, a) => sum + a.total_insights, 0).toLocaleString()}</p>
                </div>
                <Eye className="w-8 h-8" style={{ color: '#4285f4' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Avg Success Rate</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>{Math.round(agents.reduce((sum, a) => sum + a.success_rate, 0) / agents.length * 100)}%</p>
                </div>
                <Target className="w-8 h-8" style={{ color: '#10b981' }} />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="calendly-card" style={{ marginBottom: '24px' }}>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#718096' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search agents by name, type, or description..."
                    className="w-full pl-12 pr-4 py-3 calendly-body-sm transition-all duration-200"
                    style={{ 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: 'white'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4285f4';
                      e.target.style.boxShadow = '0 0 0 3px rgba(66, 133, 244, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4" style={{ color: '#718096' }} />
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                    className="px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                    style={{ border: '1px solid #e2e8f0', background: 'white' }}
                  >
                    <option value="all">All Types</option>
                    <option value="customer-support">Customer Support</option>
                    <option value="research-analysis">Research & Analysis</option>
                    <option value="content-creation">Content Creation</option>
                    <option value="lead-qualification">Lead Qualification</option>
                    <option value="meeting-analysis">Meeting Analysis</option>
                    <option value="feedback-analysis">Feedback Analysis</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4" style={{ color: '#718096' }} />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                    style={{ border: '1px solid #e2e8f0', background: 'white' }}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="training">Training</option>
                    <option value="error">Error</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`p-2 transition-all duration-200 ${viewMode === 'cards' ? 'text-white' : 'calendly-body-sm'}`}
                    style={viewMode === 'cards' ? { background: '#4285f4' } : { color: '#718096' }}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 transition-all duration-200 ${viewMode === 'table' ? 'text-white' : 'calendly-body-sm'}`}
                    style={viewMode === 'table' ? { background: '#4285f4' } : { color: '#718096' }}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Agents Display */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => {
                const TypeIcon = getTypeIcon(agent.agent_type);
                const StatusIcon = getStatusIcon(agent.status);
                const typeColors = getTypeColor(agent.agent_type);
                
                return (
                  <div
                    key={agent.id}
                    onClick={() => handleAgentClick(agent.id)}
                    className="calendly-card cursor-pointer transition-all duration-200 h-[520px] flex flex-col"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)';
                    }}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: typeColors.bg }}>
                          <TypeIcon className="w-6 h-6" style={{ color: typeColors.color }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{agent.name}</h3>
                          <p className="text-sm text-gray-600 truncate">{agent.agent_type.replace('-', ' ').replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1 ml-3">
                        <span className={`calendly-badge text-xs ${getStatusColor(agent.status)} flex items-center space-x-1`}>
                          <StatusIcon className="w-3 h-3" />
                          <span>{agent.status}</span>
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="bg-gray-50 p-3 rounded-lg mb-4 flex-1">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Agent Description</h4>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {agent.description}
                      </p>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <div className="flex items-center justify-center text-blue-700 mb-1">
                          <MessageSquare className="w-4 h-4 mr-1" />
                        </div>
                        <p className="text-lg font-semibold text-blue-900">{agent.total_conversations}</p>
                        <p className="text-xs text-blue-600">Conversations</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <div className="flex items-center justify-center text-green-700 mb-1">
                          <CheckCircle className="w-4 h-4 mr-1" />
                        </div>
                        <p className="text-lg font-semibold text-green-900">{Math.round(agent.success_rate * 100)}%</p>
                        <p className="text-xs text-green-600">Success Rate</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg text-center">
                        <div className="flex items-center justify-center text-purple-700 mb-1">
                          <Calendar className="w-4 h-4 mr-1" />
                        </div>
                        <p className="text-lg font-semibold text-purple-900">{agent.recent_analytics?.conversations_this_week || 0}</p>
                        <p className="text-xs text-purple-600">This Week</p>
                      </div>
                    </div>

                    {/* Model & Configuration */}
                    <div className="bg-gray-100 p-3 rounded-lg mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Model Configuration</span>
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">{agent.version}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{agent.model}</span>
                        <span>Temperature: {agent.temperature}</span>
                      </div>
                      {agent.status === 'active' && agent.recent_analytics && (
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-xs text-gray-600">Health: {agent.deployment?.health_status || 'Unknown'}</span>
                          </div>
                          <span className="text-xs text-gray-600">Rating: {agent.recent_analytics.average_rating || 0}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-3 mt-auto border-t border-gray-100">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAgentAction(agent.id, 'edit');
                          }}
                          className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                          title="Configure agent"
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Configure
                        </button>
                        <button
                          onClick={(e) => handleDeleteAgent(agent.id, e)}
                          className="flex items-center text-red-600 hover:text-red-800 font-medium text-sm"
                          title="Delete agent"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAgentAction(agent.id, agent.status === 'active' ? 'pause' : 'start');
                        }}
                        className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          agent.status === 'active' 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {agent.status === 'active' ? (
                          <>
                            <Pause className="w-4 h-4 mr-1" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            Start
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="calendly-card" style={{ padding: 0 }}>
              <div className="overflow-x-auto">
                <table className="calendly-table">
                  <thead>
                    <tr>
                      <th>Agent</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Schedule</th>
                      <th>Success Rate</th>
                      <th>Insights</th>
                      <th>This Week</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAgents.map((agent) => {
                      const TypeIcon = getTypeIcon(agent.type);
                      const StatusIcon = getStatusIcon(agent.status);
                      const typeColors = getTypeColor(agent.type);
                      
                      return (
                        <tr key={agent.id} className="cursor-pointer" onClick={() => handleAgentClick(agent.id)}>
                          <td>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: typeColors.bg }}>
                                <TypeIcon className="w-4 h-4" style={{ color: typeColors.color }} />
                              </div>
                              <span className="font-medium">{agent.name}</span>
                            </div>
                          </td>
                          <td>{agent.agent_type.replace('-', ' ').replace('_', ' ')}</td>
                          <td>
                            <span className={`calendly-badge ${getStatusColor(agent.status)} flex items-center space-x-1`}>
                              <StatusIcon className="w-3 h-3" />
                              <span>{agent.status}</span>
                            </span>
                          </td>
                          <td>{agent.model}</td>
                          <td>
                            <div className="flex items-center space-x-2">
                              <span>{Math.round(agent.success_rate * 100)}%</span>
                              {agent.recent_analytics && (
                                <span className="text-xs text-gray-500">
                                  {agent.recent_analytics.average_response_time}ms
                                </span>
                              )}
                            </div>
                          </td>
                          <td>{agent.total_conversations}</td>
                          <td>
                            <div className="flex items-center space-x-2">
                              <span>
                                {agent.recent_analytics?.conversations_this_week || 0}
                              </span>
                              {agent.deployment?.health_status && (
                                <div className={`w-2 h-2 rounded-full ${
                                  agent.deployment.health_status === 'healthy' ? 'bg-green-500' :
                                  agent.deployment.health_status === 'unhealthy' ? 'bg-red-500' : 'bg-yellow-500'
                                }`}></div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={(e) => handleDeleteAgent(agent.id, e)}
                                className="p-1 rounded transition-colors"
                                style={{ color: '#718096' }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#fef2f2';
                                  e.currentTarget.style.color = '#ef4444';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent';
                                  e.currentTarget.style.color = '#718096';
                                }}
                                title="Delete agent"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAgentAction(agent.id, 'edit');
                                }}
                                className="p-1 rounded transition-colors"
                                style={{ color: '#718096' }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#f1f5f9';
                                  e.currentTarget.style.color = '#4285f4';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent';
                                  e.currentTarget.style.color = '#718096';
                                }}
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAgentAction(agent.id, agent.status === 'active' ? 'pause' : 'start');
                                }}
                                className="p-1 rounded transition-colors"
                                style={{ color: '#718096' }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#f1f5f9';
                                  e.currentTarget.style.color = '#4285f4';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent';
                                  e.currentTarget.style.color = '#718096';
                                }}
                              >
                                {agent.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredAgents.length === 0 && (
            <div className="calendly-card text-center py-12">
              <Bot className="w-16 h-16 mx-auto mb-4" style={{ color: '#a0aec0' }} />
              <h3 className="calendly-h3" style={{ marginBottom: '8px' }}>No agents found</h3>
              <p className="calendly-body" style={{ marginBottom: '24px' }}>
                {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Get started by creating your first AI agent'}
              </p>
              <button 
                onClick={() => router.push('/agents/create')}
                className="calendly-btn-primary"
              >
                Create Agent
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}