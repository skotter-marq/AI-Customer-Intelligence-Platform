'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  GitBranch,
  Play,
  Pause,
  Edit3,
  ExternalLink,
  Settings,
  Clock,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Bot,
  Users,
  Package,
  Calendar,
  TrendingUp,
  Eye,
  Zap,
  DollarSign,
  Target,
  MessageSquare,
  BarChart3,
  RefreshCw,
  Download,
  Code,
  Database,
  Globe,
  Mail,
  Webhook,
  FileText,
  Layers,
  ChevronRight
} from 'lucide-react';

interface WorkflowParameter {
  name: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'date';
  required: boolean;
  description: string;
  options?: string[];
  defaultValue?: any;
}

interface ConnectedAgent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'paused' | 'error';
  lastRun: string;
  successRate: number;
}

interface ExecutionRecord {
  id: string;
  startTime: string;
  endTime: string;
  status: 'success' | 'failed' | 'running';
  duration: number;
  triggeredBy: string;
  inputData?: any;
  outputData?: any;
  errorMessage?: string;
}

interface WorkflowProfile {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  category: 'customer-health' | 'competitive-intel' | 'content-generation' | 'automation' | 'lead-management';
  version: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  n8n_workflow_id: string;
  trigger_type: 'webhook' | 'schedule' | 'manual' | 'form';
  
  // Configuration
  parameters: WorkflowParameter[];
  
  // Performance metrics
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  avg_execution_time: number;
  last_executed: string;
  
  // Connected resources
  connected_agents: ConnectedAgent[];
  connected_apps: string[];
  
  // Technical details
  webhook_url?: string;
  has_interface_node: boolean;
  node_count: number;
  complexity_score: number;
  
  // Recent executions
  recent_executions: ExecutionRecord[];
  
  // Usage statistics
  executions_this_week: number;
  executions_this_month: number;
  peak_usage_time: string;
}

export default function WorkflowProfilePage() {
  const router = useRouter();
  const params = useParams();
  const workflowId = params?.id as string;
  const [workflow, setWorkflow] = useState<WorkflowProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'executions' | 'agents'>('overview');

  useEffect(() => {
    loadWorkflowProfile();
  }, [workflowId]);

  const loadWorkflowProfile = async () => {
    try {
      setLoading(true);
      
      // Mock workflow profile data
      const mockWorkflow: WorkflowProfile = {
        id: workflowId,
        name: workflowId === 'wf-001' 
          ? 'Customer Health Analysis Pipeline'
          : workflowId === 'wf-002'
          ? 'Competitive Intelligence Monitor'
          : workflowId === 'wf-003'
          ? 'Content Generation Engine'
          : 'Advanced Lead Scoring Engine',
        description: workflowId === 'wf-001'
          ? 'Comprehensive customer health scoring workflow that analyzes multiple data points including usage patterns, support interactions, and engagement metrics to generate actionable insights and risk assessments.'
          : workflowId === 'wf-002'
          ? 'Automated competitor tracking workflow that monitors pricing changes, product updates, and market movements across multiple sources to provide real-time competitive intelligence.'
          : workflowId === 'wf-003'
          ? 'AI-powered content creation workflow that generates personalized marketing materials, email campaigns, and customer communications based on audience segments and brand guidelines.'
          : 'Multi-factor lead scoring workflow with behavioral analysis and predictive modeling to identify high-value prospects and optimize sales team efficiency.',
        status: 'active',
        category: workflowId === 'wf-001' ? 'customer-health' : workflowId === 'wf-002' ? 'competitive-intel' : workflowId === 'wf-003' ? 'content-generation' : 'lead-management',
        version: '2.1.0',
        created_at: '2023-11-15T09:00:00Z',
        updated_at: '2024-01-15T14:30:00Z',
        created_by: 'Admin User',
        n8n_workflow_id: `n8n-${workflowId}-main`,
        trigger_type: workflowId === 'wf-001' ? 'webhook' : workflowId === 'wf-002' ? 'schedule' : 'form',
        
        parameters: workflowId === 'wf-001' ? [
          {
            name: 'customerSegment',
            type: 'select',
            required: true,
            description: 'Target customer segment for health analysis',
            options: ['Enterprise', 'Growth', 'Startup', 'All Segments']
          },
          {
            name: 'healthThreshold',
            type: 'number',
            required: false,
            description: 'Minimum health score threshold (0-100)',
            defaultValue: 70
          },
          {
            name: 'analysisDate',
            type: 'date',
            required: true,
            description: 'Start date for the health analysis period'
          },
          {
            name: 'includeActionPlans',
            type: 'boolean',
            required: false,
            description: 'Generate AI-powered action recommendations',
            defaultValue: true
          },
          {
            name: 'contactEmail',
            type: 'text',
            required: true,
            description: 'Email address to receive the health analysis report'
          }
        ] : [
          {
            name: 'scoringModel',
            type: 'select',
            required: true,
            description: 'Choose the lead scoring methodology to apply',
            options: ['Standard Scoring', 'AI-Enhanced Scoring', 'Custom Weighted Model', 'Predictive Scoring']
          },
          {
            name: 'minimumScore',
            type: 'number',
            required: false,
            description: 'Minimum score threshold for lead qualification (0-100)',
            defaultValue: 65
          },
          {
            name: 'lookbackDays',
            type: 'number',
            required: true,
            description: 'Number of days to analyze for behavioral scoring',
            defaultValue: 30
          }
        ],
        
        total_executions: 247,
        successful_executions: 232,
        failed_executions: 15,
        avg_execution_time: 45.2,
        last_executed: '2024-01-15T10:30:00Z',
        
        connected_agents: [
          {
            id: 'pricing-monitor',
            name: 'Pricing Monitor',
            type: 'pricing',
            status: 'active',
            lastRun: '2024-01-15T08:00:00Z',
            successRate: 0.94
          },
          {
            id: 'feature-tracker',
            name: 'Feature Tracker',
            type: 'features',
            status: 'active',
            lastRun: '2024-01-14T10:00:00Z',
            successRate: 0.87
          }
        ],
        
        connected_apps: ['HubSpot CRM', 'Slack', 'Email Service'],
        
        webhook_url: workflowId === 'wf-001' ? 'https://n8n.marqai.com/webhook/customer-health' : undefined,
        has_interface_node: true,
        node_count: 12,
        complexity_score: 7.5,
        
        recent_executions: [
          {
            id: 'exec-001',
            startTime: '2024-01-15T10:30:00Z',
            endTime: '2024-01-15T10:31:15Z',
            status: 'success',
            duration: 75,
            triggeredBy: 'Scheduled'
          },
          {
            id: 'exec-002',
            startTime: '2024-01-15T08:30:00Z',
            endTime: '2024-01-15T08:31:02Z',
            status: 'success',
            duration: 62,
            triggeredBy: 'Webhook'
          },
          {
            id: 'exec-003',
            startTime: '2024-01-14T15:45:00Z',
            endTime: '2024-01-14T15:46:30Z',
            status: 'failed',
            duration: 45,
            triggeredBy: 'Manual',
            errorMessage: 'Connection timeout to external API'
          }
        ],
        
        executions_this_week: 28,
        executions_this_month: 156,
        peak_usage_time: '09:00 - 11:00 AM'
      };

      setWorkflow(mockWorkflow);
    } catch (error) {
      console.error('Error loading workflow profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'calendly-badge-success';
      case 'inactive': return 'calendly-badge-danger';
      case 'draft': return 'calendly-badge-warning';
      default: return 'calendly-badge-info';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'customer-health': return Activity;
      case 'competitive-intel': return Target;
      case 'content-generation': return FileText;
      case 'automation': return Zap;
      case 'lead-management': return Users;
      default: return GitBranch;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'customer-health': return { bg: '#fee2e2', color: '#ef4444' };
      case 'competitive-intel': return { bg: '#fef3c7', color: '#f59e0b' };
      case 'content-generation': return { bg: '#e0e7ff', color: '#6366f1' };
      case 'automation': return { bg: '#d1fae5', color: '#10b981' };
      case 'lead-management': return { bg: '#dbeafe', color: '#3b82f6' };
      default: return { bg: '#f1f5f9', color: '#6b7280' };
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'webhook': return Webhook;
      case 'schedule': return Clock;
      case 'manual': return Play;
      case 'form': return FileText;
      default: return Settings;
    }
  };

  const getExecutionStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAgentTypeIcon = (type: string) => {
    switch (type) {
      case 'pricing': return DollarSign;
      case 'features': return Package;
      case 'news': return Globe;
      case 'hiring': return Users;
      case 'social': return MessageSquare;
      default: return Bot;
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const successRate = workflow ? (workflow.successful_executions / workflow.total_executions * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#4285f4' }}></div>
                <p className="calendly-body mt-4">Loading workflow profile...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <GitBranch className="w-16 h-16 mx-auto mb-4" style={{ color: '#a0aec0' }} />
                <h1 className="calendly-h1" style={{ marginBottom: '8px' }}>Workflow Not Found</h1>
                <p className="calendly-body" style={{ marginBottom: '24px' }}>The workflow you're looking for doesn't exist.</p>
                <button
                  onClick={() => router.push('/workflows')}
                  className="calendly-btn-primary"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(workflow.category);
  const categoryColors = getCategoryColor(workflow.category);
  const TriggerIcon = getTriggerIcon(workflow.trigger_type);

  return (
    <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
      {/* Navigation */}
      <div className="calendly-card-static border-b" style={{ margin: '0 24px 24px 24px', padding: '16px 24px', borderRadius: '0' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/workflows')}
              className="p-2 rounded-lg"
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
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => router.push('/workflows')}
                className="calendly-body-sm"
                style={{ color: '#718096' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#4285f4';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#718096';
                }}
              >
                Workflows
              </button>
              <span style={{ color: '#a0aec0' }}>›</span>
              <span className="calendly-body-sm font-medium" style={{ color: '#1a1a1a' }}>{workflow.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="calendly-card-static" style={{ marginBottom: '24px', padding: '24px' }}>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-16 h-16 rounded-lg flex items-center justify-center"
                  style={{ background: categoryColors.bg }}
                >
                  <CategoryIcon 
                    className="w-8 h-8"
                    style={{ color: categoryColors.color }}
                  />
                </div>
                <div>
                  <h1 className="calendly-h1" style={{ marginBottom: '8px' }}>{workflow.name}</h1>
                  <div className="flex items-center space-x-3">
                    <span className={`calendly-badge ${getStatusColor(workflow.status)}`}>
                      {workflow.status}
                    </span>
                    <span className="calendly-body-sm" style={{ color: '#64748b' }}>
                      Version {workflow.version}
                    </span>
                    <span className="calendly-body-sm" style={{ color: '#64748b' }}>
                      {workflow.category.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="ml-auto flex items-center space-x-3">
                <button
                  onClick={() => window.open(`https://n8n.marqai.com/workflow/${workflow.n8n_workflow_id}`, '_blank')}
                  className="calendly-btn-secondary flex items-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Edit in n8n</span>
                </button>
                <button
                  onClick={() => router.push(`/agents/create?workflow=${workflow.id}`)}
                  className="calendly-btn-primary flex items-center space-x-2"
                >
                  <Bot className="w-4 h-4" />
                  <span>Create Agent</span>
                </button>
              </div>
            </div>
            <div className="mt-4">
              <p className="calendly-body">{workflow.description}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6" style={{ marginBottom: '24px' }}>
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Total Executions</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>{workflow.total_executions}</p>
                </div>
                <Play className="w-8 h-8" style={{ color: '#4285f4' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Success Rate</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>{Math.round(successRate)}%</p>
                </div>
                <CheckCircle className="w-8 h-8" style={{ color: '#10b981' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Avg Duration</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>{workflow.avg_execution_time}s</p>
                </div>
                <Clock className="w-8 h-8" style={{ color: '#f59e0b' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Connected Agents</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>{workflow.connected_agents.length}</p>
                </div>
                <Bot className="w-8 h-8" style={{ color: '#6366f1' }} />
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="calendly-card-static" style={{ marginBottom: '24px' }}>
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: 'overview', label: 'Overview', icon: Eye },
                  { key: 'executions', label: 'Executions', icon: Activity },
                  { key: 'agents', label: 'Connected Agents', icon: Bot }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {activeTab === 'overview' && (
                <>
                  {/* Workflow Details */}
                  <div className="calendly-card">
                    <h2 className="calendly-h2" style={{ marginBottom: '16px' }}>Workflow Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Type</label>
                        <div className="flex items-center space-x-2">
                          <TriggerIcon className="w-4 h-4" style={{ color: '#6b7280' }} />
                          <span className="calendly-body">{workflow.trigger_type}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Node Count</label>
                        <span className="calendly-body">{workflow.node_count} nodes</span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Complexity Score</label>
                        <span className="calendly-body">{workflow.complexity_score}/10</span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Interface Node</label>
                        <span className={`calendly-body ${workflow.has_interface_node ? 'text-green-600' : 'text-gray-500'}`}>
                          {workflow.has_interface_node ? '✓ Enabled' : '✗ Disabled'}
                        </span>
                      </div>
                    </div>

                    {workflow.webhook_url && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                        <div className="flex items-center space-x-2">
                          <code className="flex-1 px-3 py-2 bg-white border rounded text-sm">
                            {workflow.webhook_url}
                          </code>
                          <button
                            onClick={() => navigator.clipboard.writeText(workflow.webhook_url!)}
                            className="calendly-btn-secondary"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Performance Metrics */}
                  <div className="calendly-card">
                    <h2 className="calendly-h2" style={{ marginBottom: '16px' }}>Performance Metrics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{workflow.successful_executions}</p>
                        <p className="text-sm text-green-700">Successful</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{workflow.failed_executions}</p>
                        <p className="text-sm text-red-700">Failed</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{workflow.executions_this_week}</p>
                        <p className="text-sm text-blue-700">This Week</p>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="calendly-body-sm">Peak usage: {workflow.peak_usage_time}</p>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'executions' && (
                <div className="calendly-card">
                  <h2 className="calendly-h2" style={{ marginBottom: '16px' }}>Recent Executions</h2>
                  <div className="space-y-4">
                    {workflow.recent_executions.map((execution) => (
                      <div key={execution.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getExecutionStatusColor(execution.status)}`}>
                              {execution.status}
                            </span>
                            <span className="calendly-body-sm">
                              Triggered by {execution.triggeredBy}
                            </span>
                          </div>
                          <span className="calendly-label-sm">
                            {formatDuration(execution.duration)}
                          </span>
                        </div>
                        <p className="calendly-body-sm" style={{ color: '#64748b' }}>
                          Started: {formatDate(execution.startTime)}
                        </p>
                        {execution.errorMessage && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                            {execution.errorMessage}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'agents' && (
                <div className="calendly-card">
                  <h2 className="calendly-h2" style={{ marginBottom: '16px' }}>Connected Agents</h2>
                  {workflow.connected_agents.length > 0 ? (
                    <div className="space-y-4">
                      {workflow.connected_agents.map((agent) => {
                        const AgentIcon = getAgentTypeIcon(agent.type);
                        return (
                          <div 
                            key={agent.id}
                            onClick={() => router.push(`/agents/${agent.id}`)}
                            className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                  <AgentIcon className="w-5 h-5" style={{ color: '#4285f4' }} />
                                </div>
                                <div>
                                  <h3 className="font-medium text-gray-900">{agent.name}</h3>
                                  <p className="text-sm text-gray-500">{agent.type} agent</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`calendly-badge ${agent.status === 'active' ? 'calendly-badge-success' : agent.status === 'paused' ? 'calendly-badge-warning' : 'calendly-badge-danger'}`}>
                                  {agent.status}
                                </span>
                                <p className="text-sm text-gray-500 mt-1">
                                  {Math.round(agent.successRate * 100)}% success
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Bot className="w-12 h-12 mx-auto mb-4" style={{ color: '#a0aec0' }} />
                      <p className="calendly-body" style={{ marginBottom: '16px' }}>No agents connected</p>
                      <button
                        onClick={() => router.push(`/agents/create?workflow=${workflow.id}`)}
                        className="calendly-btn-primary"
                      >
                        Create Agent
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Workflow Info */}
              <div className="calendly-card">
                <h3 className="calendly-h3" style={{ marginBottom: '16px' }}>Workflow Info</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                    <p className="calendly-body-sm">{formatDate(workflow.created_at)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                    <p className="calendly-body-sm">{formatDate(workflow.updated_at)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                    <p className="calendly-body-sm">{workflow.created_by}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Executed</label>
                    <p className="calendly-body-sm">{formatDate(workflow.last_executed)}</p>
                  </div>
                </div>
              </div>

              {/* Connected Apps */}
              <div className="calendly-card">
                <h3 className="calendly-h3" style={{ marginBottom: '16px' }}>Connected Apps</h3>
                {workflow.connected_apps.length > 0 ? (
                  <div className="space-y-2">
                    {workflow.connected_apps.map((app) => (
                      <div key={app} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <Package className="w-4 h-4" style={{ color: '#6b7280' }} />
                        <span className="calendly-body-sm">{app}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="calendly-body-sm" style={{ color: '#64748b' }}>No external apps connected</p>
                )}
              </div>

              {/* Actions */}
              <div className="calendly-card">
                <h3 className="calendly-h3" style={{ marginBottom: '16px' }}>Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => window.open(`https://n8n.marqai.com/workflow/${workflow.n8n_workflow_id}`, '_blank')}
                    className="w-full calendly-btn-secondary flex items-center space-x-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Workflow</span>
                  </button>
                  <button
                    onClick={() => router.push(`/agents/create?workflow=${workflow.id}`)}
                    className="w-full calendly-btn-secondary flex items-center space-x-2"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Create Agent</span>
                  </button>
                  <button className="w-full calendly-btn-secondary flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>Test Workflow</span>
                  </button>
                  <button className="w-full calendly-btn-secondary flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Export Data</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}