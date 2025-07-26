'use client';

import { useState } from 'react';
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
  Building
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

export default function DashboardPage() {
  // AI Assistant state
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Mock quick stats
  const quickStats: QuickStat[] = [
    {
      label: 'Active Agents',
      value: '8',
      change: '0%',
      icon: Bot,
      color: '#6366f1',
      trend: 'stable'
    },
    {
      label: 'Weekly Meetings',
      value: '16',
      change: '+25%',
      icon: MessageSquare,
      color: '#f59e0b',
      trend: 'up'
    },
    {
      label: 'Insights Generated',
      value: '42',
      change: '+18%',
      icon: Lightbulb,
      color: '#10b981',
      trend: 'up'
    },
    {
      label: 'Stories Completed',
      value: '18',
      change: '+25%',
      icon: CheckCircle,
      color: '#10b981',
      trend: 'up'
    }
  ];

  // Mock recent insights
  const recentInsights: RecentInsight[] = [
    {
      id: '1',
      title: 'High-value deal stalled in negotiation',
      description: 'MarketingCorp deal ($45K) has been in negotiation stage for 12 days. Consider follow-up.',
      type: 'sales',
      priority: 'high',
      timestamp: '2 hours ago',
      source: 'HubSpot Pipeline'
    },
    {
      id: '2',
      title: 'Positive sentiment spike in customer meetings',
      description: 'Recent Grain recordings show 85% positive sentiment, up from 72% last week.',
      type: 'meetings',
      priority: 'medium',
      timestamp: '4 hours ago',
      source: 'Grain Analysis'
    },
    {
      id: '3',
      title: 'Competitor pricing change detected',
      description: 'Salesforce announced 15% price increase for enterprise plans effective Feb 1st.',
      type: 'competitive',
      priority: 'high',
      timestamp: '6 hours ago',
      source: 'Pricing Monitor Agent'
    },
    {
      id: '4',
      title: 'Support ticket volume decreasing',
      description: 'Weekly support tickets down 15% with faster resolution times. Customer satisfaction improving.',
      type: 'support',
      priority: 'medium',
      timestamp: '8 hours ago',
      source: 'Support Analytics'
    },
    {
      id: '5',
      title: 'New feature adoption accelerating',
      description: 'Dashboard analytics feature seeing 68% adoption rate among active users.',
      type: 'product',
      priority: 'medium',
      timestamp: '12 hours ago',
      source: 'Product Analytics'
    }
  ];

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
        window.location.href = '/customers';
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
      case 'product': return Zap;
      case 'customer': return Users;
      default: return Lightbulb;
    }
  };

  return (
    <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 className="calendly-h1">AI Customer Intelligence</h1>
            <p className="calendly-body">Analyze customer data, track trends, and generate insights with AI-powered tools</p>
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
                  <p className="calendly-body-sm">AI-generated insights from your data</p>
                </div>
              </div>
              <Link href="/insights" className="calendly-btn-secondary flex items-center space-x-2">
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {recentInsights.map((insight) => {
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
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/customers" className="calendly-card cursor-pointer transition-all duration-200 hover:shadow-md">
              <div className="flex items-center space-x-3" style={{ marginBottom: '16px' }}>
                <Building className="w-6 h-6" style={{ color: '#4285f4' }} />
                <h3 className="calendly-h3" style={{ marginBottom: 0 }}>Accounts</h3>
              </div>
              <p className="calendly-body-sm" style={{ marginBottom: '12px' }}>
                Manage accounts and assign to workflows
              </p>
              <div className="flex items-center space-x-2">
                <span className="calendly-label-sm" style={{ color: '#4285f4' }}>Manage accounts</span>
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

            <Link href="/competitors" className="calendly-card cursor-pointer transition-all duration-200 hover:shadow-md">
              <div className="flex items-center space-x-3" style={{ marginBottom: '16px' }}>
                <Target className="w-6 h-6" style={{ color: '#f59e0b' }} />
                <h3 className="calendly-h3" style={{ marginBottom: 0 }}>Competitors</h3>
              </div>
              <p className="calendly-body-sm" style={{ marginBottom: '12px' }}>
                Monitor competitive intelligence and analysis
              </p>
              <div className="flex items-center space-x-2">
                <span className="calendly-label-sm" style={{ color: '#f59e0b' }}>View analysis</span>
                <ArrowRight className="w-4 h-4" style={{ color: '#f59e0b' }} />
              </div>
            </Link>

            <Link href="/agents" className="calendly-card cursor-pointer transition-all duration-200 hover:shadow-md">
              <div className="flex items-center space-x-3" style={{ marginBottom: '16px' }}>
                <Bot className="w-6 h-6" style={{ color: '#6366f1' }} />
                <h3 className="calendly-h3" style={{ marginBottom: 0 }}>AI Agents</h3>
              </div>
              <p className="calendly-body-sm" style={{ marginBottom: '12px' }}>
                Manage intelligent monitoring agents
              </p>
              <div className="flex items-center space-x-2">
                <span className="calendly-label-sm" style={{ color: '#6366f1' }}>Manage agents</span>
                <ArrowRight className="w-4 h-4" style={{ color: '#6366f1' }} />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}