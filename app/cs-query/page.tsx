'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface SearchResult {
  type: 'customer' | 'interaction';
  id: string;
  name?: string;
  email?: string;
  company?: string;
  subject?: string;
  customer_name?: string;
  match_score: number;
  match_reason: string;
  status: string;
  last_interaction?: string;
  created_at?: string;
}

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  segment: string;
  status: string;
  created_at: string;
  last_interaction: string;
  total_interactions: number;
  satisfaction_score: number;
  tags: string[];
  custom_fields: Record<string, any>;
}

interface CustomerInteraction {
  id: string;
  type: string;
  channel: string;
  direction: string;
  subject: string;
  summary: string;
  sentiment: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  agent_name?: string;
  satisfaction_rating?: number;
  tags: string[];
}

interface CustomerInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  confidence: number;
  priority: string;
  actionable: boolean;
  recommendations: string[];
  generated_at: string;
}

interface CustomerProductImpact {
  id: string;
  customer_id: string;
  product_update_id: string;
  jira_story_key: string;
  update_title: string;
  update_description: string;
  impact_level: 'low' | 'medium' | 'high';
  impact_type: 'bug_fix' | 'feature_enhancement' | 'new_feature' | 'performance_improvement';
  completion_date: string;
  published_at?: string;
  notification_sent: boolean;
  notification_channels: string[];
  notes?: string;
  status: 'pending_review' | 'approved' | 'published' | 'archived';
  priority: 'low' | 'medium' | 'high';
  labels: string[];
}

interface CustomerContext {
  customer_id: string;
  profile: CustomerProfile;
  current_status: {
    active_tickets: number;
    last_interaction: string;
    satisfaction_score: number;
    health_score: string;
    risk_level: string;
  };
  quick_stats: {
    total_interactions: number;
    avg_resolution_time: number;
    escalation_rate: number;
    satisfaction_trend: string;
  };
  recent_activity: Array<{
    type: string;
    title: string;
    date: string;
    agent: string;
  }>;
  ai_insights: Array<{
    type: string;
    title: string;
    confidence: number;
    priority: string;
  }>;
  suggested_actions: string[];
}

export default function CSQueryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [customerContext, setCustomerContext] = useState<CustomerContext | null>(null);
  const [interactions, setInteractions] = useState<CustomerInteraction[]>([]);
  const [insights, setInsights] = useState<CustomerInsight[]>([]);
  const [productImpacts, setProductImpacts] = useState<CustomerProductImpact[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'customer' | 'interactions' | 'insights' | 'product-impact'>('search');
  const [searchType, setSearchType] = useState<'quick' | 'detailed'>('quick');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/cs-query?action=quick_search&query=${encodeURIComponent(searchQuery)}&limit=10`);
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results);
      } else {
        console.error('Search failed');
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = async (customerId: string) => {
    setSelectedCustomer(customerId);
    setActiveTab('customer');
    
    try {
      setLoading(true);
      
      // Load customer context
      const contextResponse = await fetch(`/api/cs-query?action=get_context&customer_id=${customerId}`);
      if (contextResponse.ok) {
        const contextData = await contextResponse.json();
        setCustomerContext(contextData.context);
      }
      
      // Load interactions
      const interactionsResponse = await fetch(`/api/cs-query?action=get_interactions&customer_id=${customerId}&limit=20`);
      if (interactionsResponse.ok) {
        const interactionsData = await interactionsResponse.json();
        setInteractions(interactionsData.interactions);
      }
      
      // Load insights
      const insightsResponse = await fetch(`/api/cs-query?action=get_insights&customer_id=${customerId}`);
      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json();
        setInsights(insightsData.insights);
      }
      
      // Load product impacts
      const productImpactResponse = await fetch(`/api/cs-query?action=get_product_impact&customer_id=${customerId}&limit=20`);
      if (productImpactResponse.ok) {
        const productImpactData = await productImpactResponse.json();
        setProductImpacts(productImpactData.product_impacts);
      }
      
    } catch (error) {
      console.error('Error loading customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-600';
      case 'resolved': return 'text-green-600';
      case 'closed': return 'text-gray-600';
      case 'open': return 'text-blue-600';
      case 'in_progress': return 'text-yellow-600';
      case 'urgent': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 border-green-200';
      case 'resolved': return 'bg-green-100 border-green-200';
      case 'closed': return 'bg-gray-100 border-gray-200';
      case 'open': return 'bg-blue-100 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 border-yellow-200';
      case 'urgent': return 'bg-red-100 border-red-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      case 'urgent': return 'text-red-800';
      default: return 'text-gray-600';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'customer': return '👤';
      case 'interaction': return '💬';
      case 'ticket': return '🎫';
      case 'call': return '📞';
      case 'email': return '📧';
      case 'chat': return '💬';
      case 'meeting': return '🤝';
      case 'risk': return '⚠️';
      case 'opportunity': return '💡';
      case 'behavior': return '📊';
      case 'preference': return '⭐';
      case 'issue': return '🔧';
      default: return '📋';
    }
  };

  const getHealthScoreColor = (score: string) => {
    switch (score.toLowerCase()) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-green-500';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getImpactLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getImpactLevelBgColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bug_fix': return '🐛';
      case 'feature_enhancement': return '⚡';
      case 'new_feature': return '✨';
      case 'performance_improvement': return '🚀';
      default: return '📋';
    }
  };

  const getImpactTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bug_fix': return 'Bug Fix';
      case 'feature_enhancement': return 'Feature Enhancement';
      case 'new_feature': return 'New Feature';
      case 'performance_improvement': return 'Performance Improvement';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Customer Service Query Interface</h1>
                <p className="mt-2 text-gray-600">
                  Search customers, view interactions, and access AI-powered insights
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  {searchResults.length > 0 && `${searchResults.length} results found`}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">System Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search customers by name, email, company, or ticket..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as 'quick' | 'detailed')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="quick">Quick Search</option>
                <option value="detailed">Detailed Search</option>
              </select>
              <button
                onClick={handleSearch}
                disabled={loading || !searchQuery.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <span>Search</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'search', label: 'Search Results', icon: '🔍' },
              { key: 'customer', label: 'Customer Profile', icon: '👤', disabled: !selectedCustomer },
              { key: 'interactions', label: 'Interactions', icon: '💬', disabled: !selectedCustomer },
              { key: 'insights', label: 'AI Insights', icon: '🧠', disabled: !selectedCustomer },
              { key: 'product-impact', label: 'Product Impact', icon: '🚀', disabled: !selectedCustomer }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                disabled={tab.disabled}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : tab.disabled
                    ? 'border-transparent text-gray-400 cursor-not-allowed'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Results Tab */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            {searchResults.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-center">
                  <div className="text-gray-400 text-4xl mb-4">🔍</div>
                  <p className="text-gray-600">Enter a search query to find customers or interactions</p>
                </div>
              </div>
            ) : (
              searchResults.map((result) => (
                <div key={result.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-xl">{getTypeIcon(result.type)}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBgColor(result.status)}`}>
                          {result.type}
                        </span>
                        <span className="text-sm text-gray-500">
                          Match: {(result.match_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      
                      {result.type === 'customer' ? (
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">{result.name}</h3>
                          <p className="text-sm text-gray-600 mb-1">{result.email}</p>
                          {result.company && (
                            <p className="text-sm text-gray-600 mb-1">{result.company}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            Last interaction: {result.last_interaction ? formatDistanceToNow(new Date(result.last_interaction), { addSuffix: true }) : 'Never'}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">{result.subject}</h3>
                          <p className="text-sm text-gray-600 mb-1">Customer: {result.customer_name}</p>
                          <p className="text-xs text-gray-500">
                            Created: {result.created_at ? formatDistanceToNow(new Date(result.created_at), { addSuffix: true }) : 'Unknown'}
                          </p>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500 mt-2">
                        Match reason: {result.match_reason}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBgColor(result.status)}`}>
                        {result.status}
                      </span>
                      {result.type === 'customer' && (
                        <button
                          onClick={() => handleCustomerSelect(result.id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Customer Profile Tab */}
        {activeTab === 'customer' && customerContext && (
          <div className="space-y-6">
            {/* Customer Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">{customerContext.profile.name}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBgColor(customerContext.profile.status)}`}>
                      {customerContext.profile.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-1">{customerContext.profile.email}</p>
                  <p className="text-gray-600 mb-1">{customerContext.profile.company}</p>
                  <p className="text-sm text-gray-500">
                    Account Manager: {customerContext.profile.custom_fields.account_manager}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Health Score</div>
                  <div className={`text-lg font-semibold ${getHealthScoreColor(customerContext.current_status.health_score)}`}>
                    {customerContext.current_status.health_score}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">Risk Level</div>
                  <div className={`text-lg font-semibold ${getRiskLevelColor(customerContext.current_status.risk_level)}`}>
                    {customerContext.current_status.risk_level}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-3xl mb-2">🎫</div>
                <div className="text-2xl font-bold text-gray-900">{customerContext.current_status.active_tickets}</div>
                <div className="text-sm text-gray-600">Active Tickets</div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-3xl mb-2">💬</div>
                <div className="text-2xl font-bold text-gray-900">{customerContext.quick_stats.total_interactions}</div>
                <div className="text-sm text-gray-600">Total Interactions</div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-3xl mb-2">⭐</div>
                <div className="text-2xl font-bold text-gray-900">{customerContext.current_status.satisfaction_score}</div>
                <div className="text-sm text-gray-600">Satisfaction Score</div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-3xl mb-2">⏱️</div>
                <div className="text-2xl font-bold text-gray-900">{customerContext.quick_stats.avg_resolution_time}m</div>
                <div className="text-sm text-gray-600">Avg Resolution Time</div>
              </div>
            </div>

            {/* Recent Activity & Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {customerContext.recent_activity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="text-lg">{getTypeIcon(activity.type)}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(activity.date), { addSuffix: true })} • {activity.agent}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">AI Insights</h3>
                <div className="space-y-3">
                  {customerContext.ai_insights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="text-lg">{getTypeIcon(insight.type)}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{insight.title}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                            insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {insight.priority}
                          </span>
                          <span className="text-xs text-gray-500">
                            {(insight.confidence * 100).toFixed(0)}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggested Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Suggested Actions</h3>
              <div className="space-y-2">
                {customerContext.suggested_actions.map((action, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Interactions Tab */}
        {activeTab === 'interactions' && (
          <div className="space-y-4">
            {interactions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-center">
                  <div className="text-gray-400 text-4xl mb-4">💬</div>
                  <p className="text-gray-600">No interactions found for this customer</p>
                </div>
              </div>
            ) : (
              interactions.map((interaction) => (
                <div key={interaction.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-xl">{getTypeIcon(interaction.type)}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBgColor(interaction.status)}`}>
                          {interaction.type}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBgColor(interaction.priority)}`}>
                          {interaction.priority}
                        </span>
                        <span className={`text-sm ${getSentimentColor(interaction.sentiment)}`}>
                          {interaction.sentiment}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{interaction.subject}</h3>
                      <p className="text-sm text-gray-600 mb-2">{interaction.summary}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          {formatDistanceToNow(new Date(interaction.created_at), { addSuffix: true })}
                        </span>
                        {interaction.agent_name && (
                          <span>Agent: {interaction.agent_name}</span>
                        )}
                        {interaction.satisfaction_rating && (
                          <span>Rating: {interaction.satisfaction_rating}/5</span>
                        )}
                      </div>
                      
                      {interaction.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {interaction.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBgColor(interaction.status)}`}>
                        {interaction.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-4">
            {insights.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-center">
                  <div className="text-gray-400 text-4xl mb-4">🧠</div>
                  <p className="text-gray-600">No AI insights available for this customer</p>
                </div>
              </div>
            ) : (
              insights.map((insight) => (
                <div key={insight.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-xl">{getTypeIcon(insight.type)}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          insight.priority === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                          insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-green-100 text-green-800 border-green-200'
                        }`}>
                          {insight.priority}
                        </span>
                        <span className="text-sm text-gray-500">
                          {(insight.confidence * 100).toFixed(0)}% confidence
                        </span>
                        {insight.actionable && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            Actionable
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{insight.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                      
                      {insight.recommendations.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations:</h4>
                          <ul className="space-y-1">
                            {insight.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                                <span className="text-sm text-gray-700">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500 mt-3">
                        Generated: {formatDistanceToNow(new Date(insight.generated_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Product Impact Tab */}
        {activeTab === 'product-impact' && (
          <div className="space-y-4">
            {productImpacts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-center">
                  <div className="text-gray-400 text-4xl mb-4">🚀</div>
                  <p className="text-gray-600">No product impact data available for this customer</p>
                </div>
              </div>
            ) : (
              <>
                {/* Impact Summary */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Product Impact Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{productImpacts.length}</div>
                      <div className="text-sm text-gray-600">Total Updates</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {productImpacts.filter(i => i.impact_level === 'high').length}
                      </div>
                      <div className="text-sm text-gray-600">High Impact</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {productImpacts.filter(i => i.notification_sent).length}
                      </div>
                      <div className="text-sm text-gray-600">Notified</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {productImpacts.filter(i => i.impact_type === 'new_feature').length}
                      </div>
                      <div className="text-sm text-gray-600">New Features</div>
                    </div>
                  </div>
                </div>

                {/* Impact List */}
                {productImpacts.map((impact) => (
                  <div key={impact.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-xl">{getImpactTypeIcon(impact.impact_type)}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactLevelBgColor(impact.impact_level)}`}>
                            {impact.impact_level.toUpperCase()} IMPACT
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {getImpactTypeLabel(impact.impact_type)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {impact.jira_story_key}
                          </span>
                          {impact.notification_sent && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                              Notified
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{impact.update_title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{impact.update_description}</p>
                        
                        {impact.notes && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-gray-900 mb-1">Customer Context:</h4>
                            <p className="text-sm text-gray-700 italic">{impact.notes}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>
                            Completed: {formatDistanceToNow(new Date(impact.completion_date), { addSuffix: true })}
                          </span>
                          {impact.published_at && (
                            <span>
                              Published: {formatDistanceToNow(new Date(impact.published_at), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                        
                        {impact.notification_channels.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium text-gray-900 mb-1">Notification Channels:</h4>
                            <div className="flex flex-wrap gap-2">
                              {impact.notification_channels.map((channel, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                  {channel}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {impact.labels.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {impact.labels.map((label, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                {label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBgColor(impact.status)}`}>
                          {impact.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}