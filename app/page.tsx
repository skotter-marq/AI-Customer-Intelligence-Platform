'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Search,
  User,
  Mail,
  Building,
  Phone,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  MessageCircle,
  Brain,
  ChevronDown,
  ChevronUp,
  BarChart3,
  LineChart,
  PieChart,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Target,
  Zap,
  Lightbulb,
  Eye,
  Filter,
  AlertTriangle,
  MessageSquare,
  ArrowRight,
  Send,
  Bot
} from 'lucide-react';

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

export default function CustomerIntelPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [customerContext, setCustomerContext] = useState<CustomerContext | null>(null);
  const [interactions, setInteractions] = useState<CustomerInteraction[]>([]);
  const [insights, setInsights] = useState<CustomerInsight[]>([]);
  const [productImpacts, setProductImpacts] = useState<CustomerProductImpact[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedInteraction, setExpandedInteraction] = useState<string | null>(null);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [filterSegment, setFilterSegment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'grain' | 'hubspot' | 'support' | 'product' | 'insights'>('overview');
  const [tabSearchQuery, setTabSearchQuery] = useState('');
  const [expandedInsights, setExpandedInsights] = useState<string[]>([]);
  
  // AI Assistant state
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Tab-specific filters
  const [grainFilters, setGrainFilters] = useState({
    sentiment: 'all',
    dateRange: 'all',
    customer: 'all'
  });
  
  const [hubspotFilters, setHubspotFilters] = useState({
    stage: 'all',
    valueRange: 'all',
    timeFrame: 'all'
  });
  
  const [supportFilters, setSupportFilters] = useState({
    priority: 'all',
    status: 'all',
    channel: 'all',
    timeFrame: 'all'
  });
  
  const [productFilters, setProductFilters] = useState({
    impactLevel: 'all',
    impactType: 'all',
    dateRange: 'all'
  });
  
  const [insightsFilters, setInsightsFilters] = useState({
    type: 'all',
    priority: 'all',
    confidence: 'all'
  });

  // Load customers on component mount
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/cs-query?action=get_customers&limit=50');
        
        if (response.ok) {
          const data = await response.json();
          setCustomers(data.customers || []);
        } else {
          console.error('Failed to load customers');
        }
      } catch (error) {
        console.error('Error loading customers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  const handleCustomerSelect = async (customerId: string) => {
    setSelectedCustomer(customerId);
    
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

  const handleAiQuery = async () => {
    if (!aiQuery.trim()) return;
    
    setIsAiLoading(true);
    
    // Simulate AI response - in production, this would call your AI service
    setTimeout(() => {
      const mockResponses = [
        "Based on the current data, I see that API performance issues are affecting 65% of your enterprise customers. The main pattern is rate limiting during peak hours (9-5 EST). I recommend implementing burst capacity handling and adding proactive monitoring.",
        "Looking at the sales pipeline, there's a common theme of pricing objections in enterprise deals. 67% of stalled deals cite pricing concerns. Consider developing an ROI calculator and competitive analysis to address these objections.",
        "The support data shows onboarding complexity is generating 40% of new customer tickets. The API key generation process and documentation gaps are the main pain points. A guided setup wizard could significantly reduce support load.",
        "I notice feature discoverability is a key issue - customers frequently ask about existing features. 31% of feature requests are for capabilities you already have. Redesigning navigation and adding in-app tours could improve adoption.",
        "Customer satisfaction trends show a positive correlation with response time improvements. The 1.2h reduction in average response time correlates with a 0.2 point increase in satisfaction scores."
      ];
      
      setAiResponse(mockResponses[Math.floor(Math.random() * mockResponses.length)]);
      setIsAiLoading(false);
    }, 1500);
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

  const getSegmentColor = (segment: string) => {
    switch (segment.toLowerCase()) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'growth': return 'bg-blue-100 text-blue-800';
      case 'startup': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const toggleInsightExpansion = (insightId: string) => {
    setExpandedInsights(prev => 
      prev.includes(insightId) 
        ? prev.filter(id => id !== insightId)
        : [...prev, insightId]
    );
  };

  const getHealthScoreIcon = (score: string) => {
    switch (score.toLowerCase()) {
      case 'excellent': return CheckCircle;
      case 'good': return CheckCircle;
      case 'fair': return AlertCircle;
      case 'poor': return AlertCircle;
      default: return Clock;
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

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = !searchQuery || 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSegment = filterSegment === 'all' || customer.segment === filterSegment;
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    
    return matchesSearch && matchesSegment && matchesStatus;
  });

  const mockChartData = {
    interactionTrends: [
      { month: 'Jan', interactions: 45 },
      { month: 'Feb', interactions: 52 },
      { month: 'Mar', interactions: 38 },
      { month: 'Apr', interactions: 61 },
      { month: 'May', interactions: 55 },
      { month: 'Jun', interactions: 47 }
    ],
    satisfactionTrends: [
      { month: 'Jan', score: 4.2 },
      { month: 'Feb', score: 4.1 },
      { month: 'Mar', score: 4.3 },
      { month: 'Apr', score: 4.0 },
      { month: 'May', score: 4.4 },
      { month: 'Jun', score: 4.5 }
    ],
    productImpactDistribution: [
      { type: 'Bug Fixes', count: 15, color: 'bg-red-500' },
      { type: 'Features', count: 8, color: 'bg-blue-500' },
      { type: 'Enhancements', count: 12, color: 'bg-green-500' },
      { type: 'Performance', count: 6, color: 'bg-yellow-500' }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* AI Assistant Section */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                <Bot className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">AI Assistant</h2>
                <p className="text-gray-600">Ask questions about your customer data, trends, and insights</p>
              </div>
            </div>
            
            <div className="flex space-x-4 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Ask me anything about your customers, support trends, or product insights..."
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAiQuery()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleAiQuery}
                disabled={isAiLoading || !aiQuery.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
              >
                {isAiLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Ask AI</span>
              </button>
            </div>
            
            {/* Quick suggestion buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                "What are the top customer pain points?",
                "Which customers are at risk of churning?",
                "What features are most requested?",
                "How can we improve support response times?"
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setAiQuery(suggestion)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            
            {/* AI Response */}
            {aiResponse && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-start space-x-3">
                  <div className="p-1 bg-purple-100 rounded-full">
                    <Bot className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 leading-relaxed">{aiResponse}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Primary Tabbed Interface */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200/50">
              <nav className="flex space-x-8 px-6 py-4 overflow-x-auto justify-center">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === 'overview'
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Overview</span>
                </button>
                <button
                  onClick={() => setActiveTab('grain')}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === 'grain'
                      ? 'bg-green-100 text-green-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Phone className="w-5 h-5" />
                  <span>Grain Calls</span>
                </button>
                <button
                  onClick={() => setActiveTab('hubspot')}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === 'hubspot'
                      ? 'bg-orange-100 text-orange-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Building className="w-5 h-5" />
                  <span>HubSpot</span>
                </button>
                <button
                  onClick={() => setActiveTab('support')}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === 'support'
                      ? 'bg-purple-100 text-purple-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Support</span>
                </button>
                <button
                  onClick={() => setActiveTab('product')}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === 'product'
                      ? 'bg-indigo-100 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Zap className="w-5 h-5" />
                  <span>Product Impact</span>
                </button>
                <button
                  onClick={() => setActiveTab('insights')}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === 'insights'
                      ? 'bg-pink-100 text-pink-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Brain className="w-5 h-5" />
                  <span>AI Insights</span>
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Overview Tab - High-Level Product Impact Insights */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Marq Product Impact Overview</h3>
                        <p className="text-gray-600">High-level insights affecting product and user experience</p>
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Overall Health Score</p>
                          <p className="text-2xl font-semibold text-gray-900">4.3</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">↑ 0.2 from last month</p>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Target className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Feature Adoption</p>
                          <p className="text-2xl font-semibold text-gray-900">78%</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">↑ 5% from last month</p>
                    </div>

                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Active Issues</p>
                          <p className="text-2xl font-semibold text-gray-900">12</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">↓ 8 from last month</p>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Zap className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Product Updates</p>
                          <p className="text-2xl font-semibold text-gray-900">8</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">Released this month</p>
                    </div>
                  </div>

                  {/* Key Insights with Expandable Details */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Key Product Impact Insights</h4>
                    
                    {[
                      {
                        id: 'api-performance',
                        title: 'API Performance Issues Trending',
                        impact: 'High',
                        theme: 'Performance',
                        summary: '65% of support tickets relate to API rate limiting and performance',
                        metrics: {
                          'Affected Customers': '12 Enterprise',
                          'Avg Resolution Time': '4.2 hours',
                          'Impact on NPS': '-0.3 points'
                        },
                        details: [
                          'Rate limiting affecting 3 major enterprise customers',
                          'Peak usage during business hours (9-5 EST)',
                          'Database query optimization needed',
                          'Load balancer configuration requires adjustment'
                        ],
                        actions: [
                          'Implement burst capacity handling',
                          'Add monitoring for API response times',
                          'Create performance optimization roadmap'
                        ]
                      },
                      {
                        id: 'feature-adoption',
                        title: 'Low Analytics Dashboard Adoption',
                        impact: 'Medium',
                        theme: 'User Experience',
                        summary: 'Only 34% of customers actively use analytics features',
                        metrics: {
                          'Feature Usage': '34%',
                          'User Engagement': '2.1 sessions/week',
                          'Churn Risk': '23% higher'
                        },
                        details: [
                          'Complex onboarding process for analytics',
                          'Lack of guided tutorials and documentation',
                          'Mobile experience needs improvement',
                          'Custom metrics configuration too complex'
                        ],
                        actions: [
                          'Simplify analytics onboarding flow',
                          'Create video tutorial series',
                          'Improve mobile responsive design'
                        ]
                      },
                      {
                        id: 'support-channels',
                        title: 'Email Support Overload',
                        impact: 'Medium',
                        theme: 'Support Experience',
                        summary: '78% of support requests come via email, causing delays',
                        metrics: {
                          'Email Volume': '78%',
                          'Avg Response Time': '8.4 hours',
                          'First Contact Resolution': '62%'
                        },
                        details: [
                          'Live chat usage very low (12%)',
                          'Knowledge base search not effective',
                          'Complex issues require multiple email exchanges',
                          'Customers prefer self-service options'
                        ],
                        actions: [
                          'Improve live chat visibility and functionality',
                          'Enhance knowledge base search capabilities',
                          'Implement smart routing for complex issues'
                        ]
                      }
                    ].map((insight) => (
                      <div key={insight.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              insight.impact === 'High' ? 'bg-red-100' :
                              insight.impact === 'Medium' ? 'bg-yellow-100' :
                              'bg-gray-100'
                            }`}>
                              {insight.impact === 'High' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                              {insight.impact === 'Medium' && <TrendingUp className="w-5 h-5 text-yellow-600" />}
                              {insight.impact === 'Low' && <BarChart3 className="w-5 h-5 text-gray-600" />}
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900">{insight.title}</h5>
                              <p className="text-sm text-gray-600">{insight.theme}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              insight.impact === 'High' ? 'bg-red-100 text-red-800' :
                              insight.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {insight.impact} Impact
                            </span>
                            <button
                              onClick={() => toggleInsightExpansion(insight.id)}
                              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              {expandedInsights.includes(insight.id) ? (
                                <ChevronUp className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">{insight.summary}</p>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          {Object.entries(insight.metrics).map(([key, value]) => (
                            <div key={key} className="text-center">
                              <p className="text-lg font-semibold text-gray-900">{value}</p>
                              <p className="text-xs text-gray-500">{key}</p>
                            </div>
                          ))}
                        </div>

                        {expandedInsights.includes(insight.id) && (
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                            <div>
                              <h6 className="font-medium text-gray-900 mb-2">Root Causes</h6>
                              <ul className="space-y-1">
                                {insight.details.map((detail, index) => (
                                  <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                                    <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                                    <span>{detail}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h6 className="font-medium text-gray-900 mb-2">Recommended Actions</h6>
                              <ul className="space-y-1">
                                {insight.actions.map((action, index) => (
                                  <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                                    <ArrowRight className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <span>{action}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grain Calls Tab */}
              {activeTab === 'grain' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Phone className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Grain Call Recordings</h3>
                        <p className="text-gray-600">Customer meetings and call insights</p>
                      </div>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search calls by customer, topic, or content..."
                            value={tabSearchQuery}
                            onChange={(e) => setTabSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={grainFilters.sentiment}
                          onChange={(e) => setGrainFilters({...grainFilters, sentiment: e.target.value})}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="all">All Sentiments</option>
                          <option value="positive">Positive</option>
                          <option value="neutral">Neutral</option>
                          <option value="negative">Negative</option>
                        </select>
                        <select
                          value={grainFilters.dateRange}
                          onChange={(e) => setGrainFilters({...grainFilters, dateRange: e.target.value})}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="all">All Time</option>
                          <option value="week">Last Week</option>
                          <option value="month">Last Month</option>
                          <option value="quarter">Last Quarter</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Grain Calls List */}
                  <div className="space-y-4">
                    {[
                      {
                        id: 'grain_001',
                        title: 'Product Demo - Tech Corp',
                        customer: 'John Smith',
                        date: '2024-01-15T14:30:00Z',
                        duration: '45 min',
                        sentiment: 'positive',
                        attendees: ['John Smith', 'Sarah Johnson', 'Mike Chen'],
                        summary: 'Successful product demo showcasing new analytics features. Customer expressed high interest in enterprise tier.',
                        keyTopics: ['Product Demo', 'Analytics', 'Enterprise Features'],
                        actionItems: [
                          'Send detailed pricing for enterprise tier',
                          'Schedule technical deep-dive session',
                          'Provide analytics dashboard mockups'
                        ]
                      },
                      {
                        id: 'grain_002',
                        title: 'Technical Support Call - Innovation Inc',
                        customer: 'Jane Doe',
                        date: '2024-01-14T16:00:00Z',
                        duration: '30 min',
                        sentiment: 'neutral',
                        attendees: ['Jane Doe', 'Tom Wilson'],
                        summary: 'Addressed API integration challenges and provided technical guidance. Customer needs additional documentation.',
                        keyTopics: ['API Integration', 'Technical Support', 'Documentation'],
                        actionItems: [
                          'Send updated API documentation',
                          'Create integration example repository',
                          'Schedule follow-up in 1 week'
                        ]
                      },
                      {
                        id: 'grain_003',
                        title: 'Support Escalation - Global Solutions',
                        customer: 'Bob Johnson',
                        date: '2024-01-13T16:00:00Z',
                        duration: '25 min',
                        sentiment: 'neutral',
                        attendees: ['Bob Johnson', 'Tom Wilson', 'Sarah Johnson'],
                        summary: 'Addressed recent performance issues and discussed compensation options. Customer appreciated quick response.',
                        keyTopics: ['Performance Issues', 'Service Credit', 'Infrastructure'],
                        actionItems: [
                          'Apply service credit to account',
                          'Implement additional monitoring',
                          'Weekly check-ins for next month'
                        ]
                      },
                      {
                        id: 'grain_004',
                        title: 'Quarterly Business Review - Startup Labs',
                        customer: 'Alice Brown',
                        date: '2024-01-12T11:00:00Z',
                        duration: '60 min',
                        sentiment: 'positive',
                        attendees: ['Alice Brown', 'Mike Chen', 'Lisa Wang'],
                        summary: 'Reviewed usage metrics and growth trajectory. Discussed scaling plans and additional feature needs.',
                        keyTopics: ['Usage Review', 'Growth Planning', 'Feature Roadmap'],
                        actionItems: [
                          'Prepare scaling recommendations',
                          'Review pricing for growth plan',
                          'Schedule monthly check-ins'
                        ]
                      }
                    ].map((meeting) => (
                      <div key={meeting.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Phone className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{meeting.title}</h4>
                              <p className="text-sm text-gray-600">{meeting.customer} • {formatDistanceToNow(new Date(meeting.date), { addSuffix: true })}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              meeting.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                              meeting.sentiment === 'neutral' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {meeting.sentiment}
                            </span>
                            <span className="text-sm text-gray-500">{meeting.duration}</span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">{meeting.summary}</p>

                        <div className="space-y-3">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900 mb-1">Key Topics</h5>
                            <div className="flex flex-wrap gap-2">
                              {meeting.keyTopics.map((topic, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h5 className="text-sm font-medium text-gray-900 mb-1">Action Items</h5>
                            <ul className="space-y-1">
                              {meeting.actionItems.map((item, index) => (
                                <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                                  <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h5 className="text-sm font-medium text-gray-900 mb-1">Attendees</h5>
                            <div className="flex space-x-2">
                              {meeting.attendees.map((attendee, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                  {attendee}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HubSpot Tab */}
              {activeTab === 'hubspot' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Building className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">HubSpot Pipeline Health</h3>
                        <p className="text-gray-600">Sales insights and revenue trends impacting Marq</p>
                      </div>
                    </div>
                  </div>

                  {/* Pipeline Health Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Building className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Pipeline Value</p>
                          <p className="text-2xl font-semibold text-gray-900">$412K</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">↑ 18% from last month</p>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Close Rate</p>
                          <p className="text-2xl font-semibold text-gray-900">68%</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">↑ 12% from last month</p>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Target className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Avg Deal Size</p>
                          <p className="text-2xl font-semibold text-gray-900">$51K</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">↑ 23% from last month</p>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Clock className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Sales Cycle</p>
                          <p className="text-2xl font-semibold text-gray-900">47 days</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">↓ 8 days from last month</p>
                    </div>
                  </div>

                  {/* Sales Insights Affecting Product */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Sales Insights Impacting Product Strategy</h4>
                    
                    {[
                      {
                        id: 'pricing-objections',
                        title: 'Pricing Objections in Enterprise Deals',
                        impact: 'High',
                        theme: 'Pricing Strategy',
                        summary: '67% of stalled enterprise deals cite pricing as primary concern',
                        metrics: {
                          'Stalled Deals': '8 of 12',
                          'Avg Objection Stage': 'Proposal',
                          'Revenue at Risk': '$340K'
                        },
                        details: [
                          'Competitors offering 20-30% lower pricing',
                          'ROI justification challenging for mid-market',
                          'Feature-to-price ratio questioned',
                          'Annual vs monthly pricing confusion'
                        ],
                        actions: [
                          'Develop ROI calculator for enterprise features',
                          'Create competitive pricing analysis',
                          'Implement tiered pricing structure'
                        ]
                      },
                      {
                        id: 'feature-requests',
                        title: 'Common Feature Requests in Sales Cycle',
                        impact: 'Medium',
                        theme: 'Product Development',
                        summary: 'Analytics dashboard and API improvements requested in 85% of deals',
                        metrics: {
                          'Feature Requests': '17 of 20',
                          'Most Requested': 'Analytics',
                          'Deal Acceleration': '+15%'
                        },
                        details: [
                          'Advanced analytics dashboard (85% of deals)',
                          'API rate limit increases (70% of deals)',
                          'Custom reporting capabilities (60% of deals)',
                          'Mobile app for key metrics (45% of deals)'
                        ],
                        actions: [
                          'Prioritize analytics dashboard enhancements',
                          'Create product roadmap for sales team',
                          'Develop feature request tracking system'
                        ]
                      },
                      {
                        id: 'onboarding-concerns',
                        title: 'Implementation Concerns Delaying Closes',
                        impact: 'Medium',
                        theme: 'Customer Success',
                        summary: 'Technical onboarding complexity causing 3-week average delays',
                        metrics: {
                          'Delayed Closes': '6 deals',
                          'Avg Delay': '3.2 weeks',
                          'Implementation Concerns': '78%'
                        },
                        details: [
                          'API integration complexity concerns',
                          'Technical team bandwidth limitations',
                          'Data migration timeline uncertainty',
                          'Training requirements for end users'
                        ],
                        actions: [
                          'Simplify API integration documentation',
                          'Offer white-glove onboarding option',
                          'Create implementation timeline templates'
                        ]
                      }
                    ].map((insight) => (
                      <div key={insight.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              insight.impact === 'High' ? 'bg-red-100' :
                              insight.impact === 'Medium' ? 'bg-yellow-100' :
                              'bg-gray-100'
                            }`}>
                              {insight.impact === 'High' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                              {insight.impact === 'Medium' && <TrendingUp className="w-5 h-5 text-yellow-600" />}
                              {insight.impact === 'Low' && <BarChart3 className="w-5 h-5 text-gray-600" />}
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900">{insight.title}</h5>
                              <p className="text-sm text-gray-600">{insight.theme}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              insight.impact === 'High' ? 'bg-red-100 text-red-800' :
                              insight.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {insight.impact} Impact
                            </span>
                            <button
                              onClick={() => toggleInsightExpansion(insight.id)}
                              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              {expandedInsights.includes(insight.id) ? (
                                <ChevronUp className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">{insight.summary}</p>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          {Object.entries(insight.metrics).map(([key, value]) => (
                            <div key={key} className="text-center">
                              <p className="text-lg font-semibold text-gray-900">{value}</p>
                              <p className="text-xs text-gray-500">{key}</p>
                            </div>
                          ))}
                        </div>

                        {expandedInsights.includes(insight.id) && (
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                            <div>
                              <h6 className="font-medium text-gray-900 mb-2">Detailed Analysis</h6>
                              <ul className="space-y-1">
                                {insight.details.map((detail, index) => (
                                  <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                                    <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                                    <span>{detail}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h6 className="font-medium text-gray-900 mb-2">Recommended Actions</h6>
                              <ul className="space-y-1">
                                {insight.actions.map((action, index) => (
                                  <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                                    <ArrowRight className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
                                    <span>{action}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Support Tab */}
              {activeTab === 'support' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <MessageSquare className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Support Health Overview</h3>
                        <p className="text-gray-600">Support trends and issues affecting Marq user experience</p>
                      </div>
                    </div>
                  </div>

                  {/* Support Health Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <MessageSquare className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Avg Response Time</p>
                          <p className="text-2xl font-semibold text-gray-900">4.2h</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">↓ 1.2h from last month</p>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Resolution Rate</p>
                          <p className="text-2xl font-semibold text-gray-900">94%</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">↑ 3% from last month</p>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Star className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Satisfaction Score</p>
                          <p className="text-2xl font-semibold text-gray-900">4.5</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">↑ 0.2 from last month</p>
                    </div>

                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Active Issues</p>
                          <p className="text-2xl font-semibold text-gray-900">18</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">↓ 5 from last month</p>
                    </div>
                  </div>

                  {/* Support Insights Affecting User Experience */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Support Insights Affecting User Experience</h4>
                    
                    {[
                      {
                        id: 'api-issues',
                        title: 'API Performance Issues Dominating Support',
                        impact: 'High',
                        theme: 'Technical Issues',
                        summary: '65% of support tickets are API-related, indicating systemic performance issues',
                        metrics: {
                          'API-Related Tickets': '65%',
                          'Avg Resolution Time': '6.2 hours',
                          'Customer Satisfaction': '3.8/5'
                        },
                        details: [
                          'Rate limiting errors affecting enterprise customers',
                          'Authentication timeouts during peak hours',
                          'Slow response times for data-heavy endpoints',
                          'Unclear error messages confusing customers'
                        ],
                        actions: [
                          'Implement proactive API monitoring',
                          'Improve error message clarity',
                          'Create API status page for transparency'
                        ]
                      },
                      {
                        id: 'onboarding-confusion',
                        title: 'Onboarding Process Generating Support Load',
                        impact: 'Medium',
                        theme: 'User Experience',
                        summary: '40% of new customer tickets relate to onboarding and setup confusion',
                        metrics: {
                          'New Customer Tickets': '40%',
                          'Setup-Related Issues': '28 tickets',
                          'Time to First Success': '3.2 days'
                        },
                        details: [
                          'Complex API key generation process',
                          'Documentation gaps for common use cases',
                          'Integration examples not comprehensive',
                          'Lack of guided setup wizard'
                        ],
                        actions: [
                          'Simplify API key generation flow',
                          'Create interactive onboarding guide',
                          'Add more integration examples'
                        ]
                      },
                      {
                        id: 'feature-discoverability',
                        title: 'Feature Discovery Issues',
                        impact: 'Medium',
                        theme: 'Product Usage',
                        summary: 'Users frequently ask about features that already exist, indicating poor discoverability',
                        metrics: {
                          'Feature Inquiry Tickets': '23%',
                          'Existing Feature Requests': '31%',
                          'Feature Adoption Rate': '34%'
                        },
                        details: [
                          'Analytics features hidden in complex menus',
                          'No in-app feature announcements',
                          'Limited tooltips and help text',
                          'Power user features not discoverable'
                        ],
                        actions: [
                          'Redesign navigation for better feature discovery',
                          'Implement in-app feature tours',
                          'Add contextual help and tooltips'
                        ]
                      }
                    ].map((insight) => (
                      <div key={insight.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              insight.impact === 'High' ? 'bg-red-100' :
                              insight.impact === 'Medium' ? 'bg-yellow-100' :
                              'bg-gray-100'
                            }`}>
                              {insight.impact === 'High' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                              {insight.impact === 'Medium' && <MessageSquare className="w-5 h-5 text-yellow-600" />}
                              {insight.impact === 'Low' && <BarChart3 className="w-5 h-5 text-gray-600" />}
                            </div>
                            <div>
                              <h5 className="font-semibold text-gray-900">{insight.title}</h5>
                              <p className="text-sm text-gray-600">{insight.theme}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              insight.impact === 'High' ? 'bg-red-100 text-red-800' :
                              insight.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {insight.impact} Impact
                            </span>
                            <button
                              onClick={() => toggleInsightExpansion(insight.id)}
                              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              {expandedInsights.includes(insight.id) ? (
                                <ChevronUp className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">{insight.summary}</p>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          {Object.entries(insight.metrics).map(([key, value]) => (
                            <div key={key} className="text-center">
                              <p className="text-lg font-semibold text-gray-900">{value}</p>
                              <p className="text-xs text-gray-500">{key}</p>
                            </div>
                          ))}
                        </div>

                        {expandedInsights.includes(insight.id) && (
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                            <div>
                              <h6 className="font-medium text-gray-900 mb-2">Common Issues</h6>
                              <ul className="space-y-1">
                                {insight.details.map((detail, index) => (
                                  <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                                    <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                                    <span>{detail}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h6 className="font-medium text-gray-900 mb-2">Recommended Actions</h6>
                              <ul className="space-y-1">
                                {insight.actions.map((action, index) => (
                                  <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                                    <ArrowRight className="w-3 h-3 text-purple-500 mt-0.5 flex-shrink-0" />
                                    <span>{action}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Impact Tab */}
              {activeTab === 'product' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Zap className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Product Impact</h3>
                        <p className="text-gray-600">JIRA updates and features affecting customers</p>
                      </div>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Search by title, JIRA key, or description..."
                            value={tabSearchQuery}
                            onChange={(e) => setTabSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <select
                          value={productFilters.impactLevel}
                          onChange={(e) => setProductFilters({...productFilters, impactLevel: e.target.value})}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="all">All Impact Levels</option>
                          <option value="high">High Impact</option>
                          <option value="medium">Medium Impact</option>
                          <option value="low">Low Impact</option>
                        </select>
                        <select
                          value={productFilters.impactType}
                          onChange={(e) => setProductFilters({...productFilters, impactType: e.target.value})}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="all">All Types</option>
                          <option value="bug_fix">Bug Fixes</option>
                          <option value="new_feature">New Features</option>
                          <option value="feature_enhancement">Enhancements</option>
                          <option value="performance_improvement">Performance</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        id: 'product_001',
                        jira_key: 'PROJ-456',
                        title: 'API Rate Limiting Optimization',
                        description: 'Increased API rate limits for enterprise customers by 50% and added burst capacity handling',
                        impact_level: 'high',
                        impact_type: 'performance_improvement',
                        affected_customers: ['Tech Corp', 'Global Solutions', 'Innovation Inc'],
                        completion_date: '2024-01-15T16:00:00Z',
                        published_date: '2024-01-15T18:00:00Z',
                        notification_status: 'sent',
                        labels: ['api', 'performance', 'enterprise']
                      },
                      {
                        id: 'product_002',
                        jira_key: 'PROJ-457',
                        title: 'Dashboard Loading Performance Fix',
                        description: 'Resolved slow loading times in customer dashboard by optimizing database queries - reduces page load time by 70%',
                        impact_level: 'high',
                        impact_type: 'bug_fix',
                        affected_customers: ['Innovation Inc', 'Startup Labs'],
                        completion_date: '2024-01-14T14:00:00Z',
                        published_date: '2024-01-14T16:00:00Z',
                        notification_status: 'sent',
                        labels: ['dashboard', 'performance', 'bug-fix']
                      },
                      {
                        id: 'product_003',
                        jira_key: 'PROJ-458',
                        title: 'Bulk Data Export Feature',
                        description: 'Added bulk data export functionality for compliance reporting with CSV and JSON formats',
                        impact_level: 'medium',
                        impact_type: 'new_feature',
                        affected_customers: ['Startup Labs', 'Enterprise Co'],
                        completion_date: '2024-01-13T12:00:00Z',
                        published_date: '2024-01-13T14:00:00Z',
                        notification_status: 'sent',
                        labels: ['export', 'compliance', 'new-feature']
                      }
                    ].map((update) => (
                      <div key={update.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              update.impact_type === 'bug_fix' ? 'bg-red-100' :
                              update.impact_type === 'new_feature' ? 'bg-green-100' :
                              update.impact_type === 'feature_enhancement' ? 'bg-blue-100' :
                              'bg-purple-100'
                            }`}>
                              {update.impact_type === 'bug_fix' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                              {update.impact_type === 'new_feature' && <Zap className="w-5 h-5 text-green-600" />}
                              {update.impact_type === 'feature_enhancement' && <TrendingUp className="w-5 h-5 text-blue-600" />}
                              {update.impact_type === 'performance_improvement' && <TrendingUp className="w-5 h-5 text-purple-600" />}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{update.title}</h4>
                              <p className="text-sm text-gray-600">{update.jira_key} • {formatDistanceToNow(new Date(update.completion_date), { addSuffix: true })}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              update.impact_level === 'high' ? 'bg-red-100 text-red-800' :
                              update.impact_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {update.impact_level} impact
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              update.notification_status === 'sent' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {update.notification_status === 'sent' ? 'Notified' : 'Pending'}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">{update.description}</p>

                        <div className="space-y-3">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Affected Customers</h5>
                            <div className="flex flex-wrap gap-2">
                              {update.affected_customers.map((customer, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {customer}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                            <div className="flex flex-wrap gap-2">
                              {update.labels.map((label, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                  {label}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center space-x-2">
                              {update.notification_status === 'sent' ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <Clock className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Insights Tab */}
              {activeTab === 'insights' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <Brain className="w-6 h-6 text-pink-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">AI Insights</h3>
                        <p className="text-gray-600">Generated insights and recommendations for all customers</p>
                      </div>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Search insights, customers, or recommendations..."
                            value={tabSearchQuery}
                            onChange={(e) => setTabSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <select
                          value={insightsFilters.type}
                          onChange={(e) => setInsightsFilters({...insightsFilters, type: e.target.value})}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                          <option value="all">All Types</option>
                          <option value="risk">Risk Assessment</option>
                          <option value="opportunity">Opportunities</option>
                          <option value="behavior">Behavioral Insights</option>
                        </select>
                        <select
                          value={insightsFilters.priority}
                          onChange={(e) => setInsightsFilters({...insightsFilters, priority: e.target.value})}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                          <option value="all">All Priorities</option>
                          <option value="high">High Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="low">Low Priority</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        id: 'insight_001',
                        customer: 'Tech Corp',
                        contact: 'John Smith',
                        type: 'opportunity',
                        title: 'Premium Tier Upsell Opportunity',
                        description: 'Customer is consistently hitting API rate limits and has expressed interest in premium features during recent calls.',
                        confidence: 0.92,
                        priority: 'high',
                        category: 'Revenue Growth',
                        generated_date: '2024-01-15T12:00:00Z',
                        recommendations: [
                          'Schedule premium tier demo call',
                          'Prepare ROI analysis for enterprise features',
                          'Offer 30-day premium trial'
                        ],
                        potential_value: '$125,000'
                      },
                      {
                        id: 'insight_002',
                        customer: 'Global Solutions',
                        contact: 'Bob Johnson',
                        type: 'risk',
                        title: 'Churn Risk - Performance Issues',
                        description: 'Customer has experienced multiple performance issues in the past month with declining satisfaction scores.',
                        confidence: 0.78,
                        priority: 'high',
                        category: 'Customer Retention',
                        generated_date: '2024-01-14T10:00:00Z',
                        recommendations: [
                          'Schedule immediate customer success call',
                          'Implement proactive monitoring',
                          'Offer service credits for recent issues'
                        ],
                        potential_value: '-$50,000'
                      }
                    ].map((insight) => (
                      <div key={insight.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${
                              insight.type === 'opportunity' ? 'bg-green-100' :
                              insight.type === 'risk' ? 'bg-red-100' :
                              'bg-blue-100'
                            }`}>
                              {insight.type === 'opportunity' && <Lightbulb className="w-5 h-5 text-green-600" />}
                              {insight.type === 'risk' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                              {insight.type === 'behavior' && <Brain className="w-5 h-5 text-blue-600" />}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                              <p className="text-sm text-gray-600">{insight.customer} • {insight.contact}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                              insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {insight.priority} priority
                            </span>
                            <span className="px-2 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-800">
                              {Math.round(insight.confidence * 100)}% confidence
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">{insight.description}</p>

                        <div className="space-y-3">
                          <div>
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Recommendations</h5>
                            <ul className="space-y-1">
                              {insight.recommendations.map((rec, index) => (
                                <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                                  <ArrowRight className="w-3 h-3 text-pink-500 mt-0.5 flex-shrink-0" />
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                            <span className="text-sm text-gray-600">{insight.category}</span>
                            <span className={`text-sm font-medium ${
                              insight.potential_value.startsWith('-') ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {insight.potential_value}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customer Detail Modal/View */}
          {selectedCustomer && customerContext && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-semibold text-lg">
                      {customerContext.profile.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{customerContext.profile.name}</h2>
                      <p className="text-gray-600">{customerContext.profile.company}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Customer health metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-600 font-medium">Health Score</p>
                      <p className="text-lg font-semibold text-blue-900">{customerContext.current_status.health_score}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-600 font-medium">Interactions</p>
                      <p className="text-lg font-semibold text-green-900">{customerContext.quick_stats.total_interactions}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <p className="text-sm text-yellow-600 font-medium">Satisfaction</p>
                      <p className="text-lg font-semibold text-yellow-900">{customerContext.current_status.satisfaction_score}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-sm text-red-600 font-medium">Open Tickets</p>
                      <p className="text-lg font-semibold text-red-900">{customerContext.current_status.active_tickets}</p>
                    </div>
                  </div>

                  {/* Suggested Actions */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Suggested Actions</h4>
                    <div className="space-y-2">
                      {customerContext.suggested_actions.map((action, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <ArrowRight className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-700">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}