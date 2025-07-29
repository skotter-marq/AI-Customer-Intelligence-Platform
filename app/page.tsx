'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bot,
  TrendingUp,
  Users,
  MessageSquare,
  Target,
  Activity,
  BarChart3,
  Calendar,
  DollarSign,
  Send,
  Lightbulb,
  ArrowRight,
  Eye,
  Clock,
  AlertCircle,
  Zap,
  CheckCircle,
  Building,
  GitBranch,
  Package,
  ThumbsUp,
  Star,
  FileText,
  Settings,
  ExternalLink,
  Edit,
  RefreshCw
} from 'lucide-react';

interface QuickStat {
  label: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend: 'up' | 'down' | 'stable';
}

interface RecentInsight {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  source: string;
}

interface ChangelogEntry {
  id: string;
  version: string;
  title: string;
  category: 'Added' | 'Fixed' | 'Improved' | 'Security' | 'Deprecated';
  description: string;
  release_date: string;
  approval_status: 'pending' | 'approved' | 'published';
  view_count: number;
  upvotes: number;
  jira_story_key?: string;
}

export default function DashboardPage() {
  // AI Assistant state
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Live data state
  const [quickStats, setQuickStats] = useState<QuickStat[]>([]);
  const [recentInsights, setRecentInsights] = useState<RecentInsight[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);

  // Load live dashboard data
  useEffect(() => {
    loadDashboardStats();
    loadDashboardInsights();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setIsLoadingStats(true);
      const response = await fetch('/api/dashboard-stats');
      const data = await response.json();
      
      if (data.success) {
        const liveStats: QuickStat[] = [
          {
            label: 'Content Posts Created',
            value: data.stats.contentPosts.total.toString(),
            change: data.stats.contentPosts.change,
            icon: FileText,
            color: '#4285f4',
            trend: data.stats.contentPosts.change.includes('+') ? 'up' : data.stats.contentPosts.change.includes('-') ? 'down' : 'stable'
          },
          {
            label: 'Total Meetings',
            value: data.stats.meetings.total.toString(),
            change: data.stats.meetings.change,
            icon: MessageSquare,
            color: '#f59e0b',
            trend: data.stats.meetings.change.includes('+') ? 'up' : data.stats.meetings.change.includes('-') ? 'down' : 'stable'
          },
          {
            label: 'AI Insights',
            value: data.stats.insights.total.toString(),
            change: data.stats.insights.change,
            icon: Lightbulb,
            color: '#10b981',
            trend: data.stats.insights.change.includes('+') ? 'up' : data.stats.insights.change.includes('-') ? 'down' : 'stable'
          },
          {
            label: 'Product Updates',
            value: data.stats.productUpdates.total.toString(),
            change: data.stats.productUpdates.change,
            icon: Package,
            color: '#6366f1',
            trend: data.stats.productUpdates.change.includes('+') ? 'up' : data.stats.productUpdates.change.includes('-') ? 'down' : 'stable'
          }
        ];
        setQuickStats(liveStats);
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      // Fallback to default stats if API fails
      setQuickStats([
        {
          label: 'Content Posts Created',
          value: '0',
          change: '+0%',
          icon: FileText,
          color: '#4285f4',
          trend: 'stable'
        },
        {
          label: 'Total Meetings',
          value: '0',
          change: '+0%',
          icon: MessageSquare,
          color: '#f59e0b',
          trend: 'stable'
        },
        {
          label: 'AI Insights',
          value: '0',
          change: '+0%',
          icon: Lightbulb,
          color: '#10b981',
          trend: 'stable'
        },
        {
          label: 'Product Updates',
          value: '0',
          change: '+0%',
          icon: Package,
          color: '#6366f1',
          trend: 'stable'
        }
      ]);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadDashboardInsights = async () => {
    try {
      setIsLoadingInsights(true);
      const response = await fetch('/api/dashboard-insights');
      const data = await response.json();
      
      if (data.success) {
        setRecentInsights(data.insights);
      }
    } catch (error) {
      console.error('Failed to load dashboard insights:', error);
      // Fallback insight if API fails
      setRecentInsights([
        {
          id: 'system-ready',
          title: 'Intelligence system ready',
          description: 'Your AI customer intelligence platform is configured and ready to analyze data.',
          type: 'system',
          priority: 'low',
          timestamp: 'Just now',
          source: 'System Status'
        }
      ]);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  // Recent changelog entries - kept for reference but could be made dynamic too
  const recentChangelogEntries: ChangelogEntry[] = [
    {
      id: 'changelog-live-data',
      version: 'v3.0.0',
      title: 'Live Dashboard Data Integration',
      category: 'Added',
      description: 'Dashboard now displays real-time statistics from HubSpot, meeting insights, and product updates.',
      release_date: new Date().toISOString(),
      approval_status: 'published',
      view_count: 1,
      upvotes: 1,
      jira_story_key: 'LIVE-001'
    }
  ];

  // Recent insights are now loaded dynamically from the API

  const handleAIQuery = async () => {
    if (!aiQuery.trim()) return;

    setIsAiLoading(true);
    setAiResponse('');

    try {
      const response = await fetch('/api/cs-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: aiQuery }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      setAiResponse(data.response || 'No response received');
    } catch (error) {
      console.error('AI query error:', error);
      setAiResponse('Sorry, I encountered an error processing your request. Please try again.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAIQuery();
    }
  };

  const handleInsightClick = (insight: RecentInsight) => {
    // Navigate to relevant source based on insight type
    switch (insight.type) {
      case 'sales':
        window.location.href = '/meetings';
        break;
      case 'meetings':
        window.location.href = '/meetings';
        break;
      case 'competitive':
        window.location.href = '/competitors';
        break;
      case 'support':
        window.location.href = '/support';
        break;
      case 'product':
        window.location.href = '/product';
        break;
      default:
        window.location.href = '/insights';
        break;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'calendly-badge-danger';
      case 'medium': return 'calendly-badge-warning';
      case 'low': return 'calendly-badge-success';
      default: return 'calendly-badge-info';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sales': return Target;
      case 'meetings': return MessageSquare;
      case 'competitive': return Activity;
      case 'support': return AlertCircle;
      case 'product': return Package;
      case 'customer': return Users;
      default: return Lightbulb;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Added': return '🆕';
      case 'Improved': return '⚡';
      case 'Fixed': return '🔧';
      case 'Security': return '🔒';
      case 'Deprecated': return '⚠️';
      default: return '📝';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Added': return 'bg-green-100 text-green-800 border-green-300';
      case 'Improved': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Fixed': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Security': return 'bg-red-100 text-red-800 border-red-300';
      case 'Deprecated': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="calendly-h1">AI Customer Intelligence</h1>
                <p className="calendly-body">Analyze customer data, track trends, and generate insights with AI-powered tools</p>
              </div>
              <button
                onClick={() => {
                  loadDashboardStats();
                  loadDashboardInsights();
                }}
                disabled={isLoadingStats || isLoadingInsights}
                className="calendly-btn-secondary flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${(isLoadingStats || isLoadingInsights) ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
              </button>
            </div>
          </div>


          {/* AI Assistant Section */}
          <div className="calendly-card" style={{ marginBottom: '32px' }}>
            <div className="flex items-center space-x-3" style={{ marginBottom: '24px' }}>
              <div className="p-3 rounded-lg" style={{ background: '#dbeafe' }}>
                <Bot className="w-6 h-6" style={{ color: '#4285f4' }} />
              </div>
              <div>
                <h2 className="calendly-h2" style={{ marginBottom: '4px' }}>AI Assistant</h2>
                <p className="calendly-body-sm">Ask questions about your customer data, trends, and insights</p>
              </div>
            </div>

            {/* AI Query Input */}
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your customers, deals, meetings, or competitive intelligence..."
                  className="w-full p-4 pr-12 calendly-body-sm rounded-lg resize-none transition-all duration-200"
                  style={{ 
                    border: '1px solid #e2e8f0',
                    background: 'white',
                    minHeight: '100px'
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
                <button
                  onClick={handleAIQuery}
                  disabled={!aiQuery.trim() || isAiLoading}
                  className="absolute bottom-3 right-3 p-2 rounded-lg transition-all duration-200 disabled:opacity-50"
                  style={{ 
                    background: aiQuery.trim() && !isAiLoading ? '#4285f4' : '#e2e8f0',
                    color: aiQuery.trim() && !isAiLoading ? 'white' : '#718096'
                  }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* AI Response */}
              {isAiLoading && (
                <div className="flex items-center space-x-3 p-4 rounded-lg" style={{ background: '#f8fafc' }}>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: '#4285f4' }}></div>
                  <span className="calendly-body-sm">Analyzing your request...</span>
                </div>
              )}

              {aiResponse && (
                <div className="p-4 rounded-lg" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div className="flex items-start space-x-3">
                    <Bot className="w-5 h-5 mt-1" style={{ color: '#4285f4' }} />
                    <div className="flex-1">
                      <p className="calendly-body whitespace-pre-wrap">{aiResponse}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" style={{ marginBottom: '32px' }}>
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="calendly-card">
                  <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                    <div>
                      <p className="calendly-label" style={{ marginBottom: '4px' }}>{stat.label}</p>
                      <p className="calendly-h2" style={{ marginBottom: 0 }}>{stat.value}</p>
                    </div>
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex items-center space-x-2">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : stat.trend === 'down' ? (
                      <TrendingUp className="w-4 h-4 rotate-180 text-red-500" />
                    ) : (
                      <div className="w-4 h-4 border-t-2" style={{ borderColor: '#718096' }}></div>
                    )}
                    <span className="calendly-label-sm" style={{ 
                      color: stat.trend === 'up' ? '#10b981' : stat.trend === 'down' ? '#ef4444' : '#718096' 
                    }}>
                      {stat.change} from last week
                    </span>
                  </div>
                </div>
              );
            })}
          </div>


          {/* Recent Insights */}
          <div className="calendly-card" style={{ marginBottom: '32px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
              <div className="flex items-center space-x-3">
                <Lightbulb className="w-6 h-6" style={{ color: '#4285f4' }} />
                <div>
                  <h2 className="calendly-h2" style={{ marginBottom: '4px' }}>Recent Insights</h2>
                  <p className="calendly-body-sm">AI-generated insights from your customer data and product analytics</p>
                </div>
              </div>
              <Link href="/product" className="calendly-btn-secondary flex items-center space-x-2">
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {isLoadingInsights ? (
                // Loading skeleton for insights
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="calendly-card animate-pulse">
                    <div className="flex items-start justify-between" style={{ marginBottom: '12px' }}>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-48" style={{ marginBottom: '4px' }}></div>
                          <div className="h-3 bg-gray-200 rounded w-32"></div>
                        </div>
                      </div>
                      <div className="w-16 h-6 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-full" style={{ marginBottom: '8px' }}></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))
              ) : recentInsights.length === 0 ? (
                <div className="calendly-card text-center py-8">
                  <Lightbulb className="w-12 h-12 mx-auto text-gray-400" style={{ marginBottom: '16px' }} />
                  <h3 className="calendly-h3 text-gray-600" style={{ marginBottom: '8px' }}>No insights yet</h3>
                  <p className="calendly-body-sm text-gray-500">
                    Start syncing your data to generate AI-powered insights
                  </p>
                </div>
              ) : (
                recentInsights.map((insight) => {
                const TypeIcon = getTypeIcon(insight.type);
                return (
                  <div 
                    key={insight.id} 
                    className="calendly-card cursor-pointer transition-all duration-200 hover:shadow-md"
                    onClick={() => handleInsightClick(insight)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)';
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between" style={{ marginBottom: '12px' }}>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" 
                             style={{ background: '#f1f5f9' }}>
                          <TypeIcon className="w-5 h-5" style={{ color: '#4285f4' }} />
                        </div>
                        <div className="flex-1">
                          <h3 className="calendly-body font-medium text-gray-900 line-clamp-1">
                            {insight.title}
                          </h3>
                          <p className="calendly-label-sm text-gray-500">
                            {insight.timestamp} • {insight.source}
                          </p>
                        </div>
                      </div>
                      <span className={`calendly-badge ${getPriorityColor(insight.priority)}`}>
                        {insight.priority}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="calendly-body-sm text-gray-600 line-clamp-2" style={{ marginBottom: '12px' }}>
                      {insight.description}
                    </p>
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full" style={{ 
                          background: insight.priority === 'high' ? '#ef4444' : 
                                     insight.priority === 'medium' ? '#f59e0b' : '#10b981' 
                        }}></div>
                        <span className="calendly-label-sm text-gray-500 capitalize">
                          {insight.type} Intelligence
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                );
                })
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/meetings" className="calendly-card cursor-pointer transition-all duration-200 hover:shadow-md">
              <div className="flex items-center space-x-3" style={{ marginBottom: '16px' }}>
                <MessageSquare className="w-6 h-6" style={{ color: '#4285f4' }} />
                <h3 className="calendly-h3" style={{ marginBottom: 0 }}>Meetings</h3>
              </div>
              <p className="calendly-body-sm" style={{ marginBottom: '12px' }}>
                Review meeting recordings and AI-generated insights
              </p>
              <div className="flex items-center space-x-2">
                <span className="calendly-label-sm" style={{ color: '#4285f4' }}>View meetings</span>
                <ArrowRight className="w-4 h-4" style={{ color: '#4285f4' }} />
              </div>
            </Link>

            <Link href="/meetings" className="calendly-card cursor-pointer transition-all duration-200 hover:shadow-md">
              <div className="flex items-center space-x-3" style={{ marginBottom: '16px' }}>
                <MessageSquare className="w-6 h-6" style={{ color: '#10b981' }} />
                <h3 className="calendly-h3" style={{ marginBottom: 0 }}>Meetings</h3>
              </div>
              <p className="calendly-body-sm" style={{ marginBottom: '12px' }}>
                Review Grain call recordings and insights
              </p>
              <div className="flex items-center space-x-2">
                <span className="calendly-label-sm" style={{ color: '#10b981' }}>View recordings</span>
                <ArrowRight className="w-4 h-4" style={{ color: '#10b981' }} />
              </div>
            </Link>

            <Link href="/product" className="calendly-card cursor-pointer transition-all duration-200 hover:shadow-md">
              <div className="flex items-center space-x-3" style={{ marginBottom: '16px' }}>
                <Package className="w-6 h-6" style={{ color: '#f59e0b' }} />
                <h3 className="calendly-h3" style={{ marginBottom: 0 }}>Product Updates</h3>
              </div>
              <p className="calendly-body-sm" style={{ marginBottom: '12px' }}>
                Manage changelog entries and product roadmap
              </p>
              <div className="flex items-center space-x-2">
                <span className="calendly-label-sm" style={{ color: '#f59e0b' }}>Manage updates</span>
                <ArrowRight className="w-4 h-4" style={{ color: '#f59e0b' }} />
              </div>
            </Link>

            <Link href="/competitors" className="calendly-card cursor-pointer transition-all duration-200 hover:shadow-md">
              <div className="flex items-center space-x-3" style={{ marginBottom: '16px' }}>
                <Target className="w-6 h-6" style={{ color: '#6366f1' }} />
                <h3 className="calendly-h3" style={{ marginBottom: 0 }}>Competitors</h3>
              </div>
              <p className="calendly-body-sm" style={{ marginBottom: '12px' }}>
                Monitor competitive intelligence and analysis
              </p>
              <div className="flex items-center space-x-2">
                <span className="calendly-label-sm" style={{ color: '#6366f1' }}>View analysis</span>
                <ArrowRight className="w-4 h-4" style={{ color: '#6366f1' }} />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}