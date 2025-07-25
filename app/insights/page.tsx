'use client';

import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Users,
  Target,
  DollarSign,
  MessageSquare,
  Clock,
  Star,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Eye,
  Download,
  Calendar,
  ArrowUpDown,
  Grid3X3,
  List,
  Zap,
  Brain,
  Settings,
  RefreshCw
} from 'lucide-react';

interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'sales' | 'customer' | 'product' | 'competitive' | 'support' | 'marketing';
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  impact_score: number;
  generated_at: string;
  data_sources: string[];
  key_metrics: {
    metric: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'stable';
  }[];
  recommendations: string[];
  affected_entities: string[];
  actionable: boolean;
  status: 'new' | 'reviewing' | 'implemented' | 'dismissed';
  assigned_to?: string;
}

interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
  last_updated: string;
}

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'sales' | 'customer' | 'product' | 'competitive' | 'executive';
  format: 'pdf' | 'excel' | 'powerpoint';
  generated_at: string;
  frequency: 'weekly' | 'monthly' | 'quarterly';
  next_generation: string;
  recipients: string[];
  size: string;
  status: 'generating' | 'ready' | 'sent';
}

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState<'insights' | 'analytics' | 'reports'>('insights');
  const [insights, setInsights] = useState<Insight[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Insights filters
  const [typeFilter, setTypeFilter] = useState<'all' | string>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | string>('all');
  
  // Analytics filters
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all');
  const [trendFilter, setTrendFilter] = useState<'all' | 'up' | 'down' | 'stable'>('all');
  
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Mock insights data
  const mockInsights: Insight[] = [
    {
      id: 'insight-001',
      title: 'Sales Pipeline Velocity Declining',
      description: 'Average deal closure time has increased by 23% over the past month, indicating potential bottlenecks in the sales process.',
      type: 'sales',
      priority: 'high',
      confidence: 0.89,
      impact_score: 8.2,
      generated_at: '2024-01-15T09:30:00Z',
      data_sources: ['HubSpot CRM', 'Sales Team Reports'],
      key_metrics: [
        { metric: 'Avg Deal Time', value: '34 days', change: '+23%', trend: 'up' },
        { metric: 'Pipeline Value', value: '$2.4M', change: '-5%', trend: 'down' },
        { metric: 'Conversion Rate', value: '18%', change: '-3%', trend: 'down' }
      ],
      recommendations: [
        'Review qualification process in early stages',
        'Implement automated follow-up sequences',
        'Increase sales training on objection handling'
      ],
      affected_entities: ['Sales Team', 'Q1 Revenue Goals'],
      actionable: true,
      status: 'new'
    },
    {
      id: 'insight-002',
      title: 'Customer Satisfaction Trending Positive',
      description: 'Recent meetings show 85% positive sentiment, up from 72% last week. Customer feedback indicates strong product satisfaction.',
      type: 'customer',
      priority: 'medium',
      confidence: 0.92,
      impact_score: 7.1,
      generated_at: '2024-01-15T08:15:00Z',
      data_sources: ['Grain Recordings', 'Support Tickets', 'Customer Surveys'],
      key_metrics: [
        { metric: 'Positive Sentiment', value: '85%', change: '+13%', trend: 'up' },
        { metric: 'NPS Score', value: '42', change: '+8', trend: 'up' },
        { metric: 'Resolution Time', value: '4.2h', change: '-0.8h', trend: 'down' }
      ],
      recommendations: [
        'Share success stories with marketing team',
        'Identify key drivers of satisfaction for replication',
        'Consider customer advocacy program'
      ],
      affected_entities: ['Customer Success', 'Marketing Team'],
      actionable: true,
      status: 'reviewing',
      assigned_to: 'Jennifer Park'
    },
    {
      id: 'insight-003',
      title: 'Competitive Pricing Pressure Detected',
      description: 'Salesforce announced 15% price increase. This presents an opportunity to capture price-sensitive customers.',
      type: 'competitive',
      priority: 'high',
      confidence: 0.95,
      impact_score: 8.7,
      generated_at: '2024-01-14T16:45:00Z',
      data_sources: ['Pricing Monitor Agent', 'Industry Reports'],
      key_metrics: [
        { metric: 'Price Advantage', value: '28%', change: '+15%', trend: 'up' },
        { metric: 'Market Share', value: '12%', change: '+2%', trend: 'up' },
        { metric: 'Competitor Churn', value: '8%', change: '+3%', trend: 'up' }
      ],
      recommendations: [
        'Launch targeted competitive campaigns',
        'Update sales battlecards with pricing advantages',
        'Reach out to Salesforce customers in pipeline'
      ],
      affected_entities: ['Sales Team', 'Marketing', 'Product Marketing'],
      actionable: true,
      status: 'implemented',
      assigned_to: 'Marketing Team'
    }
  ];

  // Mock analytics metrics
  const mockMetrics: AnalyticsMetric[] = [
    { id: 'metric-001', name: 'Monthly Recurring Revenue', value: 485000, unit: '$', change: 12.5, trend: 'up', category: 'Revenue', last_updated: '2024-01-15T10:00:00Z' },
    { id: 'metric-002', name: 'Customer Acquisition Cost', value: 250, unit: '$', change: -8.2, trend: 'down', category: 'Sales', last_updated: '2024-01-15T09:30:00Z' },
    { id: 'metric-003', name: 'Net Promoter Score', value: 42, unit: '', change: 5.1, trend: 'up', category: 'Customer', last_updated: '2024-01-15T08:45:00Z' },
    { id: 'metric-004', name: 'Average Deal Size', value: 28500, unit: '$', change: 15.3, trend: 'up', category: 'Sales', last_updated: '2024-01-15T11:15:00Z' },
    { id: 'metric-005', name: 'Support Ticket Volume', value: 156, unit: '', change: -12.8, trend: 'down', category: 'Support', last_updated: '2024-01-15T07:30:00Z' },
    { id: 'metric-006', name: 'Feature Adoption Rate', value: 68, unit: '%', change: 8.7, trend: 'up', category: 'Product', last_updated: '2024-01-15T12:00:00Z' }
  ];

  // Mock reports data
  const mockReports: Report[] = [
    {
      id: 'report-001',
      name: 'Executive Dashboard - Weekly',
      description: 'Comprehensive executive overview of key business metrics and insights',
      type: 'executive',
      format: 'pdf',
      generated_at: '2024-01-15T08:00:00Z',
      frequency: 'weekly',
      next_generation: '2024-01-22T08:00:00Z',
      recipients: ['CEO', 'CRO', 'VP Sales'],
      size: '2.4 MB',
      status: 'ready'
    },
    {
      id: 'report-002',
      name: 'Sales Performance Analysis',
      description: 'Detailed analysis of sales pipeline, conversion rates, and rep performance',
      type: 'sales',
      format: 'excel',
      generated_at: '2024-01-14T18:00:00Z',
      frequency: 'weekly',
      next_generation: '2024-01-21T18:00:00Z',
      recipients: ['Sales Team', 'Sales Managers'],
      size: '1.8 MB',
      status: 'sent'
    },
    {
      id: 'report-003',
      name: 'Customer Health Scorecard',
      description: 'Customer satisfaction metrics, churn risk analysis, and success opportunities',
      type: 'customer',
      format: 'powerpoint',
      generated_at: '2024-01-15T12:30:00Z',
      frequency: 'monthly',
      next_generation: '2024-02-15T12:30:00Z',
      recipients: ['Customer Success Team'],
      size: '5.2 MB',
      status: 'generating'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setInsights(mockInsights);
      setMetrics(mockMetrics);
      setReports(mockReports);
      setLoading(false);
    }, 1000);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'calendly-badge-danger';
      case 'high': return 'calendly-badge-warning';
      case 'medium': return 'calendly-badge-info';
      case 'low': return 'calendly-badge-success';
      default: return 'calendly-badge-info';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'calendly-badge-info';
      case 'reviewing': return 'calendly-badge-warning';
      case 'implemented': return 'calendly-badge-success';
      case 'dismissed': return 'calendly-badge-info';
      default: return 'calendly-badge-info';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sales': return Target;
      case 'customer': return Users;
      case 'product': return Settings;
      case 'competitive': return Activity;
      case 'support': return MessageSquare;
      case 'marketing': return TrendingUp;
      default: return Lightbulb;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      case 'stable': return () => <div className="w-4 h-4 border-t-2 border-gray-400"></div>;
      default: return BarChart3;
    }
  };

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case 'generating': return 'calendly-badge-warning';
      case 'ready': return 'calendly-badge-success';
      case 'sent': return 'calendly-badge-info';
      default: return 'calendly-badge-info';
    }
  };

  const filteredInsights = insights.filter(insight => {
    const matchesSearch = !searchQuery || 
      insight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      insight.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || insight.type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || insight.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || insight.status === statusFilter;
    
    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  const filteredMetrics = metrics.filter(metric => {
    const matchesSearch = !searchQuery || 
      metric.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      metric.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || metric.category === categoryFilter;
    const matchesTrend = trendFilter === 'all' || metric.trend === trendFilter;
    
    return matchesSearch && matchesCategory && matchesTrend;
  });

  const filteredReports = reports.filter(report => {
    const matchesSearch = !searchQuery || 
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const handleInsightClick = (insightId: string) => {
    console.log('View insight:', insightId);
  };

  const handleReportDownload = (reportId: string) => {
    console.log('Download report:', reportId);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#4285f4' }}></div>
                <p className="calendly-body mt-4">Loading insights...</p>
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
              <h1 className="calendly-h1">Insights</h1>
              <p className="calendly-body">AI-generated insights, analytics, and automated reports</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="calendly-btn-secondary flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button className="calendly-btn-secondary flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{ marginBottom: '24px' }}>
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Total Insights</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>{insights.length}</p>
                </div>
                <Brain className="w-8 h-8" style={{ color: '#4285f4' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>High Priority</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>
                    {insights.filter(i => i.priority === 'high' || i.priority === 'critical').length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8" style={{ color: '#ef4444' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Actionable</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>
                    {insights.filter(i => i.actionable).length}
                  </p>
                </div>
                <Zap className="w-8 h-8" style={{ color: '#f59e0b' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Avg Confidence</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>
                    {Math.round(insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length * 100)}%
                  </p>
                </div>
                <Star className="w-8 h-8" style={{ color: '#10b981' }} />
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="calendly-card" style={{ marginBottom: '24px', padding: 0 }}>
            <div className="flex border-b" style={{ borderColor: '#e2e8f0' }}>
              <button
                onClick={() => setActiveTab('insights')}
                className="py-4 px-6 border-b-2 calendly-body-sm font-medium transition-colors"
                style={activeTab === 'insights' ? {
                  borderBottomColor: '#4285f4',
                  color: '#4285f4'
                } : {
                  borderBottomColor: 'transparent',
                  color: '#718096'
                }}
              >
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4" />
                  <span>AI Insights</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className="py-4 px-6 border-b-2 calendly-body-sm font-medium transition-colors"
                style={activeTab === 'analytics' ? {
                  borderBottomColor: '#4285f4',
                  color: '#4285f4'
                } : {
                  borderBottomColor: 'transparent',
                  color: '#718096'
                }}
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className="py-4 px-6 border-b-2 calendly-body-sm font-medium transition-colors"
                style={activeTab === 'reports' ? {
                  borderBottomColor: '#4285f4',
                  color: '#4285f4'
                } : {
                  borderBottomColor: 'transparent',
                  color: '#718096'
                }}
              >
                <div className="flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Reports</span>
                </div>
              </button>
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
                    placeholder={
                      activeTab === 'insights' ? "Search insights, recommendations, or metrics..." :
                      activeTab === 'analytics' ? "Search metrics or categories..." :
                      "Search reports or descriptions..."
                    }
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
                {activeTab === 'insights' ? (
                  <>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                      style={{ border: '1px solid #e2e8f0', background: 'white' }}
                    >
                      <option value="all">All Types</option>
                      <option value="sales">Sales</option>
                      <option value="customer">Customer</option>
                      <option value="product">Product</option>
                      <option value="competitive">Competitive</option>
                      <option value="support">Support</option>
                      <option value="marketing">Marketing</option>
                    </select>

                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                      style={{ border: '1px solid #e2e8f0', background: 'white' }}
                    >
                      <option value="all">All Priorities</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                      style={{ border: '1px solid #e2e8f0', background: 'white' }}
                    >
                      <option value="all">All Status</option>
                      <option value="new">New</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="implemented">Implemented</option>
                      <option value="dismissed">Dismissed</option>
                    </select>
                  </>
                ) : activeTab === 'analytics' ? (
                  <>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                      style={{ border: '1px solid #e2e8f0', background: 'white' }}
                    >
                      <option value="all">All Categories</option>
                      <option value="Revenue">Revenue</option>
                      <option value="Sales">Sales</option>
                      <option value="Customer">Customer</option>
                      <option value="Support">Support</option>
                      <option value="Product">Product</option>
                    </select>

                    <select
                      value={trendFilter}
                      onChange={(e) => setTrendFilter(e.target.value as any)}
                      className="px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                      style={{ border: '1px solid #e2e8f0', background: 'white' }}
                    >
                      <option value="all">All Trends</option>
                      <option value="up">Trending Up</option>
                      <option value="down">Trending Down</option>
                      <option value="stable">Stable</option>
                    </select>
                  </>
                ) : null}

                {/* View Mode Toggle for insights and analytics */}
                {activeTab !== 'reports' && (
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
                )}
              </div>
            </div>
          </div>

          {/* Content Display */}
          {activeTab === 'insights' ? (
            viewMode === 'cards' ? (
              <div className="space-y-6">
                {filteredInsights.map((insight) => {
                  const TypeIcon = getTypeIcon(insight.type);
                  return (
                    <div
                      key={insight.id}
                      onClick={() => handleInsightClick(insight.id)}
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
                      {/* Insight Header */}
                      <div className="flex items-start justify-between" style={{ marginBottom: '16px' }}>
                        <div className="flex items-center space-x-3">
                          <TypeIcon className="w-6 h-6" style={{ color: '#4285f4' }} />
                          <div className="flex-1">
                            <h3 className="calendly-h3" style={{ marginBottom: '4px' }}>{insight.title}</h3>
                            <p className="calendly-label-sm">
                              {formatDistanceToNow(new Date(insight.generated_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1 ml-4">
                          <span className={`calendly-badge ${getPriorityColor(insight.priority)}`}>
                            {insight.priority}
                          </span>
                          <span className={`calendly-badge ${getStatusColor(insight.status)}`}>
                            {insight.status}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="calendly-body-sm" style={{ marginBottom: '16px' }}>
                        {insight.description}
                      </p>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-3 gap-4" style={{ marginBottom: '16px' }}>
                        {insight.key_metrics.map((metric, index) => {
                          const TrendIcon = getTrendIcon(metric.trend);
                          return (
                            <div key={index} className="text-center">
                              <p className="calendly-label-sm">{metric.metric}</p>
                              <p className="calendly-h4" style={{ marginBottom: '4px' }}>{metric.value}</p>
                              <div className="flex items-center justify-center space-x-1">
                                <TrendIcon className="w-3 h-3" style={{ 
                                  color: metric.trend === 'up' ? '#10b981' : 
                                         metric.trend === 'down' ? '#ef4444' : '#718096' 
                                }} />
                                <span className="calendly-label-sm" style={{ 
                                  color: metric.trend === 'up' ? '#10b981' : 
                                         metric.trend === 'down' ? '#ef4444' : '#718096' 
                                }}>
                                  {metric.change}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Recommendations */}
                      <div style={{ marginBottom: '16px' }}>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations</h4>
                        <ul className="space-y-1">
                          {insight.recommendations.slice(0, 2).map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="calendly-body-sm">{rec}</span>
                            </li>
                          ))}
                          {insight.recommendations.length > 2 && (
                            <li className="calendly-body-sm text-gray-600 ml-6">
                              +{insight.recommendations.length - 2} more recommendations
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4" style={{ color: '#f59e0b' }} />
                            <span className="calendly-label-sm">{Math.round(insight.confidence * 100)}% confidence</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Target className="w-4 h-4" style={{ color: '#4285f4' }} />
                            <span className="calendly-label-sm">Impact: {insight.impact_score}/10</span>
                          </div>
                        </div>
                        {insight.actionable && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Actionable
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Insights Table View */
              <div className="calendly-card" style={{ padding: 0 }}>
                <div className="overflow-x-auto">
                  <table className="calendly-table">
                    <thead>
                      <tr>
                        <th>Insight</th>
                        <th>Type</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Confidence</th>
                        <th>Impact</th>
                        <th>Generated</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInsights.map((insight) => {
                        const TypeIcon = getTypeIcon(insight.type);
                        return (
                          <tr key={insight.id} className="cursor-pointer" onClick={() => handleInsightClick(insight.id)}>
                            <td>
                              <div className="flex items-center space-x-3">
                                <TypeIcon className="w-5 h-5" style={{ color: '#4285f4' }} />
                                <div>
                                  <div className="font-medium">{insight.title}</div>
                                  <div className="text-sm text-gray-600 line-clamp-1">{insight.description}</div>
                                </div>
                              </div>
                            </td>
                            <td>{insight.type}</td>
                            <td>
                              <span className={`calendly-badge ${getPriorityColor(insight.priority)}`}>
                                {insight.priority}
                              </span>
                            </td>
                            <td>
                              <span className={`calendly-badge ${getStatusColor(insight.status)}`}>
                                {insight.status}
                              </span>
                            </td>
                            <td>{Math.round(insight.confidence * 100)}%</td>
                            <td>{insight.impact_score}/10</td>
                            <td>{formatDistanceToNow(new Date(insight.generated_at), { addSuffix: true })}</td>
                            <td>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleInsightClick(insight.id);
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
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : activeTab === 'analytics' ? (
            viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMetrics.map((metric) => {
                  const TrendIcon = getTrendIcon(metric.trend);
                  return (
                    <div key={metric.id} className="calendly-card">
                      <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                        <div>
                          <p className="calendly-label" style={{ marginBottom: '4px' }}>{metric.name}</p>
                          <p className="calendly-h2" style={{ marginBottom: 0 }}>
                            {metric.unit === '$' ? '$' : ''}{metric.value.toLocaleString()}{metric.unit === '%' ? '%' : ''}
                          </p>
                        </div>
                        <BarChart3 className="w-8 h-8" style={{ color: '#4285f4' }} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <TrendIcon className="w-4 h-4" style={{ 
                            color: metric.trend === 'up' ? '#10b981' : 
                                   metric.trend === 'down' ? '#ef4444' : '#718096' 
                          }} />
                          <span className="calendly-label-sm" style={{ 
                            color: metric.trend === 'up' ? '#10b981' : 
                                   metric.trend === 'down' ? '#ef4444' : '#718096' 
                          }}>
                            {metric.change > 0 ? '+' : ''}{metric.change}%
                          </span>
                        </div>
                        <span className="calendly-label-sm">{metric.category}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Analytics Table View */
              <div className="calendly-card" style={{ padding: 0 }}>
                <div className="overflow-x-auto">
                  <table className="calendly-table">
                    <thead>
                      <tr>
                        <th>Metric</th>
                        <th>Value</th>
                        <th>Change</th>
                        <th>Trend</th>
                        <th>Category</th>
                        <th>Last Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMetrics.map((metric) => {
                        const TrendIcon = getTrendIcon(metric.trend);
                        return (
                          <tr key={metric.id}>
                            <td className="font-medium">{metric.name}</td>
                            <td>
                              {metric.unit === '$' ? '$' : ''}{metric.value.toLocaleString()}{metric.unit === '%' ? '%' : ''}
                            </td>
                            <td style={{ 
                              color: metric.change > 0 ? '#10b981' : metric.change < 0 ? '#ef4444' : '#718096' 
                            }}>
                              {metric.change > 0 ? '+' : ''}{metric.change}%
                            </td>
                            <td>
                              <div className="flex items-center space-x-2">
                                <TrendIcon className="w-4 h-4" style={{ 
                                  color: metric.trend === 'up' ? '#10b981' : 
                                         metric.trend === 'down' ? '#ef4444' : '#718096' 
                                }} />
                                <span>{metric.trend}</span>
                              </div>
                            </td>
                            <td>{metric.category}</td>
                            <td>{formatDistanceToNow(new Date(metric.last_updated), { addSuffix: true })}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            /* Reports Display */
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div key={report.id} className="calendly-card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3" style={{ marginBottom: '8px' }}>
                        <Download className="w-5 h-5" style={{ color: '#4285f4' }} />
                        <h3 className="calendly-h3" style={{ marginBottom: 0 }}>{report.name}</h3>
                        <span className={`calendly-badge ${getReportStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="calendly-body-sm" style={{ marginBottom: '12px' }}>
                        {report.description}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="calendly-label-sm">Type</p>
                          <p className="calendly-body-sm font-medium">{report.type}</p>
                        </div>
                        <div>
                          <p className="calendly-label-sm">Format</p>
                          <p className="calendly-body-sm font-medium">{report.format.toUpperCase()}</p>
                        </div>
                        <div>
                          <p className="calendly-label-sm">Frequency</p>
                          <p className="calendly-body-sm font-medium">{report.frequency}</p>
                        </div>
                        <div>
                          <p className="calendly-label-sm">Size</p>
                          <p className="calendly-body-sm font-medium">{report.size}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {report.status === 'ready' && (
                        <button
                          onClick={() => handleReportDownload(report.id)}
                          className="calendly-btn-secondary flex items-center space-x-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {((activeTab === 'insights' && filteredInsights.length === 0) || 
            (activeTab === 'analytics' && filteredMetrics.length === 0) ||
            (activeTab === 'reports' && filteredReports.length === 0)) && (
            <div className="calendly-card text-center py-12">
              {activeTab === 'insights' ? (
                <Brain className="w-16 h-16 mx-auto mb-4" style={{ color: '#a0aec0' }} />
              ) : activeTab === 'analytics' ? (
                <BarChart3 className="w-16 h-16 mx-auto mb-4" style={{ color: '#a0aec0' }} />
              ) : (
                <Download className="w-16 h-16 mx-auto mb-4" style={{ color: '#a0aec0' }} />
              )}
              <h3 className="calendly-h3" style={{ marginBottom: '8px' }}>
                No {activeTab} found
              </h3>
              <p className="calendly-body" style={{ marginBottom: '24px' }}>
                {searchQuery || (activeTab === 'insights' && (typeFilter !== 'all' || priorityFilter !== 'all'))
                  ? 'Try adjusting your search or filters' 
                  : `${activeTab === 'insights' ? 'AI insights' : activeTab === 'analytics' ? 'Analytics metrics' : 'Reports'} will appear here`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}