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
  ExternalLink
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
  type: 'pricing' | 'features' | 'news' | 'hiring' | 'social' | 'funding' | 'products';
  status: 'active' | 'paused' | 'error' | 'stopped';
  competitor_ids: string[];
  schedule: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'on_trigger';
  success_rate: number;
  total_insights: number;
  insights_this_week: number;
  last_run: string;
  next_run: string;
  configuration: AgentConfiguration;
  created_date: string;
  performance_trend: 'up' | 'down' | 'stable';
}

export default function AgentsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<IntelligenceAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'pricing' | 'features' | 'news' | 'hiring' | 'social' | 'funding' | 'products'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'error' | 'stopped'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'success_rate' | 'insights'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Mock agents data
  const mockAgents: IntelligenceAgent[] = [
    {
      id: 'pricing-monitor',
      name: 'Pricing Monitor',
      description: 'Tracks competitor pricing changes and promotional activities across multiple channels.',
      type: 'pricing',
      status: 'active',
      competitor_ids: ['salesforce', 'hubspot', 'pipedrive'],
      schedule: 'daily',
      success_rate: 0.94,
      total_insights: 247,
      insights_this_week: 12,
      last_run: '2024-01-15T08:00:00Z',
      next_run: '2024-01-16T08:00:00Z',
      configuration: {
        keywords: ['pricing', 'discount', 'promotion', 'free trial'],
        sources: ['website', 'pricing_pages', 'press_releases'],
        frequency: 'daily',
        notification_threshold: 0.15,
        data_retention_days: 90
      },
      created_date: '2023-11-15',
      performance_trend: 'up'
    },
    {
      id: 'feature-tracker',
      name: 'Feature Tracker',
      description: 'Monitors new feature announcements and product updates from key competitors.',
      type: 'features',
      status: 'active',
      competitor_ids: ['salesforce', 'hubspot'],
      schedule: 'weekly',
      success_rate: 0.87,
      total_insights: 156,
      insights_this_week: 8,
      last_run: '2024-01-14T10:00:00Z',
      next_run: '2024-01-21T10:00:00Z',
      configuration: {
        keywords: ['new feature', 'product update', 'announcement', 'release'],
        sources: ['blog', 'changelog', 'social_media'],
        frequency: 'weekly',
        notification_threshold: 0.20,
        data_retention_days: 120
      },
      created_date: '2023-10-20',
      performance_trend: 'stable'
    },
    {
      id: 'news-sentinel',
      name: 'News Sentinel',
      description: 'Aggregates news coverage and media mentions of competitors for market intelligence.',
      type: 'news',
      status: 'active',
      competitor_ids: ['salesforce', 'hubspot', 'pipedrive'],
      schedule: 'hourly',
      success_rate: 0.76,
      total_insights: 892,
      insights_this_week: 34,
      last_run: '2024-01-15T14:00:00Z',
      next_run: '2024-01-15T15:00:00Z',
      configuration: {
        keywords: ['acquisition', 'funding', 'partnership', 'expansion'],
        sources: ['news_sites', 'press_releases', 'industry_publications'],
        frequency: 'hourly',
        notification_threshold: 0.10,
        data_retention_days: 60
      },
      created_date: '2023-09-10',
      performance_trend: 'up'
    },
    {
      id: 'hiring-insights',
      name: 'Hiring Insights',
      description: 'Analyzes competitor job postings to understand strategic hiring and expansion plans.',
      type: 'hiring',
      status: 'paused',
      competitor_ids: ['salesforce', 'hubspot'],
      schedule: 'weekly',
      success_rate: 0.91,
      total_insights: 203,
      insights_this_week: 0,   
      last_run: '2024-01-08T12:00:00Z',
      next_run: '2024-01-22T12:00:00Z',
      configuration: {
        keywords: ['engineer', 'sales', 'product manager', 'remote'],
        sources: ['linkedin', 'company_careers', 'job_boards'],
        frequency: 'weekly',
        notification_threshold: 0.25,
        data_retention_days: 180
      },
      created_date: '2023-12-01',
      performance_trend: 'down'
    },
    {
      id: 'social-pulse',
      name: 'Social Pulse',
      description: 'Monitors social media sentiment and engagement patterns for competitive analysis.',
      type: 'social',
      status: 'active',
      competitor_ids: ['salesforce', 'hubspot', 'pipedrive'],
      schedule: 'daily',
      success_rate: 0.83,
      total_insights: 445,
      insights_this_week: 18,
      last_run: '2024-01-15T06:00:00Z',
      next_run: '2024-01-16T06:00:00Z',
      configuration: {
        keywords: ['customer', 'review', 'complaint', 'praise'],
        sources: ['twitter', 'linkedin', 'reddit', 'review_sites'],
        frequency: 'daily',
        notification_threshold: 0.30,
        data_retention_days: 45
      },
      created_date: '2023-11-30',
      performance_trend: 'stable'
    },
    {
      id: 'funding-radar',
      name: 'Funding Radar',
      description: 'Tracks funding rounds and investment activities in the competitive landscape.',
      type: 'funding',
      status: 'error',
      competitor_ids: ['pipedrive'],
      schedule: 'monthly',
      success_rate: 0.62,
      total_insights: 28,
      insights_this_week: 0,
      last_run: '2024-01-01T00:00:00Z',
      next_run: '2024-02-01T00:00:00Z',
      configuration: {
        keywords: ['funding', 'investment', 'series', 'venture'],
        sources: ['crunchbase', 'techcrunch', 'venture_databases'],
        frequency: 'monthly',
        notification_threshold: 0.50,
        data_retention_days: 365
      },
      created_date: '2023-08-15',
      performance_trend: 'down'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setAgents(mockAgents);
      setLoading(false);
    }, 1000);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pricing': return DollarSign;
      case 'features': return Package;
      case 'news': return Globe;
      case 'hiring': return Users;
      case 'social': return MessageSquare;
      case 'funding': return TrendingUp;
      case 'products': return Zap;
      default: return Bot;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pricing': return { bg: '#f0fdf4', color: '#10b981' };
      case 'features': return { bg: '#f0f4ff', color: '#4285f4' };
      case 'news': return { bg: '#fef3c7', color: '#f59e0b' };
      case 'hiring': return { bg: '#e9d5ff', color: '#8b5cf6' };
      case 'social': return { bg: '#fce7f3', color: '#ec4899' };
      case 'funding': return { bg: '#ecfccb', color: '#65a30d' };
      case 'products': return { bg: '#fef2e2', color: '#ea580c' };
      default: return { bg: '#f1f5f9', color: '#6b7280' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'calendly-badge-success';
      case 'paused': return 'calendly-badge-warning';
      case 'error': return 'calendly-badge-danger';
      case 'stopped': return 'calendly-badge-info';
      default: return 'calendly-badge-info';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return Play;
      case 'paused': return Pause;
      case 'error': return AlertTriangle;
      case 'stopped': return StopCircle;
      default: return Clock;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return () => <TrendingUp className="rotate-180" />;
      case 'stable': return () => <div className="w-4 h-4 border-t-2 border-gray-400"></div>;
      default: return BarChart3;
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

  const handleAgentAction = (agentId: string, action: 'start' | 'pause' | 'stop' | 'edit') => {
    // Simulate agent action
    console.log(`${action} agent ${agentId}`);
  };

  const handleAgentClick = (agentId: string) => {
    router.push(`/agents/${agentId}`);
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
              <button className="calendly-btn-secondary flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button className="calendly-btn-primary flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>New Agent</span>
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
                    <option value="pricing">Pricing</option>
                    <option value="features">Features</option>
                    <option value="news">News</option>
                    <option value="hiring">Hiring</option>
                    <option value="social">Social</option>
                    <option value="funding">Funding</option>
                    <option value="products">Products</option>
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
                    <option value="paused">Paused</option>
                    <option value="error">Error</option>
                    <option value="stopped">Stopped</option>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => {
                const TypeIcon = getTypeIcon(agent.type);
                const StatusIcon = getStatusIcon(agent.status);
                const typeColors = getTypeColor(agent.type);
                const TrendIcon = getTrendIcon(agent.performance_trend);
                
                return (
                  <div
                    key={agent.id}
                    onClick={() => handleAgentClick(agent.id)}
                    className="calendly-card cursor-pointer transition-all duration-200"
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
                    <div className="flex items-start justify-between" style={{ marginBottom: '16px' }}>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: typeColors.bg }}>
                          <TypeIcon className="w-6 h-6" style={{ color: typeColors.color }} />
                        </div>
                        <div>
                          <h3 className="calendly-h3" style={{ marginBottom: '2px' }}>{agent.name}</h3>
                          <p className="calendly-label-sm">{agent.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className={`calendly-badge ${getStatusColor(agent.status)} flex items-center space-x-1`}>
                          <StatusIcon className="w-3 h-3" />
                          <span>{agent.status}</span>
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="calendly-body-sm line-clamp-2" style={{ marginBottom: '16px' }}>
                      {agent.description}
                    </p>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-3" style={{ marginBottom: '16px' }}>
                      <div className="text-center">
                        <p className="calendly-h3" style={{ marginBottom: '2px' }}>{agent.total_insights}</p>
                        <p className="calendly-label-sm">Insights</p>
                      </div>
                      <div className="text-center">
                        <p className="calendly-h3" style={{ marginBottom: '2px' }}>{Math.round(agent.success_rate * 100)}%</p>
                        <p className="calendly-label-sm">Success</p>
                      </div>
                      <div className="text-center">
                        <p className="calendly-h3" style={{ marginBottom: '2px' }}>{agent.insights_this_week}</p>
                        <p className="calendly-label-sm">This Week</p>
                      </div>
                    </div>

                    {/* Footer with trend and actions */}
                    <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                      <div className="flex items-center space-x-2">
                        <TrendIcon className="w-4 h-4" style={{ 
                          color: agent.performance_trend === 'up' ? '#10b981' : 
                                 agent.performance_trend === 'down' ? '#ef4444' : '#718096' 
                        }} />
                        <span className="calendly-label-sm">{agent.schedule}</span>
                      </div>
                      <div className="flex items-center space-x-1">
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
                          <td>{agent.type.replace('_', ' ')}</td>
                          <td>
                            <span className={`calendly-badge ${getStatusColor(agent.status)} flex items-center space-x-1`}>
                              <StatusIcon className="w-3 h-3" />
                              <span>{agent.status}</span>
                            </span>
                          </td>
                          <td>{agent.schedule}</td>
                          <td>{Math.round(agent.success_rate * 100)}%</td>
                          <td>{agent.total_insights}</td>
                          <td>{agent.insights_this_week}</td>
                          <td>
                            <div className="flex items-center space-x-1">
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
              <button className="calendly-btn-primary">
                Create Agent
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}