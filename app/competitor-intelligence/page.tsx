'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp,
  TrendingDown,
  Target,
  Eye,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  ExternalLink,
  BarChart3,
  Users,
  DollarSign,
  Activity,
  Globe,
  MessageSquare,
  Send,
  Bell,
  Settings,
  Download,
  Share2,
  Plus,
  Edit,
  Trash2,
  Building,
  MapPin,
  Zap,
  Shield,
  Award,
  Briefcase,
  LineChart,
  PieChart
} from 'lucide-react';

interface CompetitorNews {
  id: string;
  title: string;
  summary: string;
  date: string;
  source: string;
  url: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

interface FinancialMetrics {
  revenue: string;
  profit_margin: number;
  revenue_growth: number;
  burn_rate?: string;
  runway?: string;
}

interface SocialMetrics {
  linkedin_followers: number;
  twitter_followers: number;
  glassdoor_rating: number;
  employee_sentiment: 'positive' | 'neutral' | 'negative';
}

interface MarketTrend {
  period: string;
  value: number;
  competitor_id: string;
  metric_type: 'market_share' | 'revenue' | 'growth_rate' | 'employee_count';
}

interface SlackNotification {
  id: string;
  type: 'insight' | 'alert' | 'report';
  title: string;
  message: string;
  channels: string[];
  scheduled_time?: string;
  sent: boolean;
  created_at: string;
}

interface IntelligenceAgent {
  id: string;
  name: string;
  type: 'pricing' | 'features' | 'news' | 'hiring' | 'social' | 'funding' | 'products';
  status: 'active' | 'paused' | 'error' | 'stopped';
  competitor_ids: string[];
  schedule: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'on_trigger';
  last_run: string;
  next_run: string;
  success_rate: number;
  total_insights: number;
  configuration: AgentConfiguration;
  created_at: string;
  updated_at: string;
}

interface AgentConfiguration {
  sources: string[]; // websites, APIs, social media, etc.
  keywords: string[];
  price_threshold?: number;
  sentiment_tracking?: boolean;
  deep_analysis?: boolean;
  notification_triggers: string[];
  data_retention_days: number;
}

interface AgentResult {
  id: string;
  agent_id: string;
  competitor_id: string;
  data_type: string;
  raw_data: any;
  processed_insights: string[];
  confidence_score: number;
  timestamp: string;
  source_url?: string;
}

interface CompetitorProfile {
  id: string;
  name: string;
  logo: string;
  industry: string;
  marketCap: string;
  employees: string;
  founded: string;
  status: 'active' | 'monitoring' | 'inactive';
  threat_level: 'high' | 'medium' | 'low';
  last_updated: string;
  website: string;
  location: string;
  description: string;
  recent_funding: string;
  valuation: string;
  growth_rate: number;
  market_share: number;
  key_products: string[];
  strengths: string[];
  weaknesses: string[];
  recent_news: CompetitorNews[];
  financial_metrics: FinancialMetrics;
  social_metrics: SocialMetrics;
}

interface CompetitorInsight {
  id: string;
  competitor: string;
  type: 'pricing' | 'feature' | 'marketing' | 'hiring' | 'funding';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  timestamp: string;
  source: string;
  url?: string;
}

interface IntelligenceMetrics {
  total_competitors: number;
  active_monitoring: number;
  high_threat: number;
  new_insights: number;
  market_share_change: number;
}

export default function CompetitorIntelligencePage() {
  const [competitors, setCompetitors] = useState<CompetitorProfile[]>([]);
  const [insights, setInsights] = useState<CompetitorInsight[]>([]);
  const [agents, setAgents] = useState<IntelligenceAgent[]>([]);
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [slackNotifications, setSlackNotifications] = useState<SlackNotification[]>([]);
  const [metrics, setMetrics] = useState<IntelligenceMetrics>({
    total_competitors: 0,
    active_monitoring: 0,
    high_threat: 0,
    new_insights: 0,
    market_share_change: 0
  });
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [insightFilter, setInsightFilter] = useState<'all' | 'pricing' | 'feature' | 'marketing' | 'hiring' | 'funding'>('all');
  const [selectedCompetitor, setSelectedCompetitor] = useState<CompetitorProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'profiles' | 'agents' | 'analytics' | 'communications'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompetitorData();
  }, []);

  const fetchCompetitorData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API calls
      const mockCompetitors: CompetitorProfile[] = [
        {
          id: '1',
          name: 'Salesforce',
          logo: '🏢',
          industry: 'CRM & Sales',
          marketCap: '$248B',
          employees: '79,000',
          founded: '1999',
          status: 'active',
          threat_level: 'high',
          last_updated: '2024-01-15T10:30:00Z',
          website: 'salesforce.com',
          location: 'San Francisco, CA',
          description: 'Leading cloud-based CRM platform with AI-powered sales and marketing tools',
          recent_funding: 'IPO 2004',
          valuation: '$248B',
          growth_rate: 24.3,
          market_share: 23.8,
          key_products: ['Sales Cloud', 'Service Cloud', 'Marketing Cloud', 'Einstein AI'],
          strengths: ['Market leader', 'Comprehensive platform', 'Strong AI integration'],
          weaknesses: ['High complexity', 'Expensive for SMBs', 'Steep learning curve'],
          recent_news: [
            {
              id: 'n1',
              title: 'Salesforce announces new AI features for Sales Cloud',
              summary: 'Enhanced predictive analytics and automated lead scoring capabilities',
              date: '2024-01-15',
              source: 'TechCrunch',
              url: 'https://techcrunch.com/salesforce-ai',
              sentiment: 'positive'
            }
          ],
          financial_metrics: {
            revenue: '$31.4B',
            profit_margin: 2.1,
            revenue_growth: 11.2
          },
          social_metrics: {
            linkedin_followers: 1200000,
            twitter_followers: 890000,
            glassdoor_rating: 4.4,
            employee_sentiment: 'positive'
          }
        },
        {
          id: '2',
          name: 'HubSpot',
          logo: '🎯',
          industry: 'Marketing & Sales',
          marketCap: '$31B',
          employees: '7,000',
          founded: '2006',
          status: 'active',
          threat_level: 'high',
          last_updated: '2024-01-15T09:15:00Z',
          website: 'hubspot.com',
          location: 'Cambridge, MA',
          description: 'Inbound marketing, sales, and customer service platform with integrated CRM',
          recent_funding: 'IPO 2014',
          valuation: '$31B',
          growth_rate: 32.1,
          market_share: 12.4,
          key_products: ['Marketing Hub', 'Sales Hub', 'Service Hub', 'CMS Hub'],
          strengths: ['User-friendly interface', 'Strong inbound methodology', 'Integrated platform'],
          weaknesses: ['Limited enterprise features', 'Pricing complexity', 'Reporting limitations'],
          recent_news: [
            {
              id: 'n2',
              title: 'HubSpot launches AI-powered content assistant',
              summary: 'New AI writing tools integrated across marketing and sales workflows',
              date: '2024-01-14',
              source: 'MarTech Today',
              url: 'https://martech.hubspot.com/ai-content',
              sentiment: 'positive'
            }
          ],
          financial_metrics: {
            revenue: '$1.7B',
            profit_margin: -2.3,
            revenue_growth: 25.1
          },
          social_metrics: {
            linkedin_followers: 980000,
            twitter_followers: 455000,
            glassdoor_rating: 4.3,
            employee_sentiment: 'positive'
          }
        },
        {
          id: '3',
          name: 'Pipedrive',
          logo: '⚡',
          industry: 'Sales CRM',
          marketCap: '$2.1B',
          employees: '1,000',
          founded: '2010',
          status: 'monitoring',
          threat_level: 'medium',
          last_updated: '2024-01-14T14:22:00Z'
        },
        {
          id: '4',
          name: 'Zendesk',
          logo: '💬',
          industry: 'Customer Support',
          marketCap: '$13B',
          employees: '6,000',
          founded: '2007',
          status: 'active',
          threat_level: 'medium',
          last_updated: '2024-01-14T11:45:00Z'
        }
      ];

      const mockInsights: CompetitorInsight[] = [
        {
          id: '1',
          competitor: 'Salesforce',
          type: 'pricing',
          title: 'New Enterprise Tier Pricing Released',
          description: 'Salesforce introduced a new enterprise pricing tier with advanced AI features at $300/user/month',
          impact: 'high',
          timestamp: '2024-01-15T08:30:00Z',
          source: 'Salesforce.com',
          url: 'https://salesforce.com/pricing'
        },
        {
          id: '2',
          competitor: 'HubSpot',
          type: 'feature',
          title: 'AI-Powered Lead Scoring Launch',
          description: 'HubSpot launched advanced AI lead scoring capabilities, competing directly with our ML features',
          impact: 'high',
          timestamp: '2024-01-14T15:45:00Z',
          source: 'HubSpot Blog',
          url: 'https://blog.hubspot.com'
        },
        {
          id: '3',
          competitor: 'Pipedrive',
          type: 'marketing',
          title: 'Aggressive SMB Marketing Campaign',
          description: 'Pipedrive launched a major marketing campaign targeting small businesses with 50% off first year',
          impact: 'medium',
          timestamp: '2024-01-13T12:20:00Z',
          source: 'LinkedIn Ads',
        },
        {
          id: '4',
          competitor: 'Zendesk',
          type: 'hiring',
          title: 'Engineering Team Expansion',
          description: 'Zendesk posted 25+ new engineering positions, suggesting major product development',
          impact: 'medium',
          timestamp: '2024-01-12T09:10:00Z',
          source: 'LinkedIn Jobs',
        }
      ];

      // Mock AI Agents data
      const mockAgents: IntelligenceAgent[] = [
        {
          id: 'agent1',
          name: 'Pricing Monitor',
          type: 'pricing',
          status: 'active',
          competitor_ids: ['1', '2'],
          schedule: 'daily',
          last_run: '2024-01-15T08:00:00Z',
          next_run: '2024-01-16T08:00:00Z',
          success_rate: 94.2,
          total_insights: 127,
          configuration: {
            sources: ['competitor websites', 'pricing pages', 'product demos'],
            keywords: ['pricing', 'cost', 'subscription', 'enterprise'],
            price_threshold: 10,
            sentiment_tracking: false,
            deep_analysis: true,
            notification_triggers: ['price_change', 'new_tier'],
            data_retention_days: 90
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T10:30:00Z'
        },
        {
          id: 'agent2',
          name: 'Feature Tracker',
          type: 'features',
          status: 'active',
          competitor_ids: ['1', '2', '3', '4'],
          schedule: 'weekly',
          last_run: '2024-01-14T12:00:00Z',
          next_run: '2024-01-21T12:00:00Z',
          success_rate: 89.1,
          total_insights: 84,
          configuration: {
            sources: ['product pages', 'release notes', 'changelogs', 'documentation'],
            keywords: ['new feature', 'update', 'launch', 'beta', 'AI'],
            sentiment_tracking: true,
            deep_analysis: true,
            notification_triggers: ['new_feature', 'major_update'],
            data_retention_days: 120
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-14T15:00:00Z'
        },
        {
          id: 'agent3',
          name: 'News & Social Monitor',
          type: 'news',
          status: 'active',
          competitor_ids: ['1', '2'],
          schedule: 'hourly',
          last_run: '2024-01-15T10:00:00Z',
          next_run: '2024-01-15T11:00:00Z',
          success_rate: 96.8,
          total_insights: 312,
          configuration: {
            sources: ['tech news sites', 'social media', 'press releases', 'blogs'],
            keywords: ['acquisition', 'funding', 'partnership', 'executive'],
            sentiment_tracking: true,
            deep_analysis: false,
            notification_triggers: ['negative_news', 'major_announcement'],
            data_retention_days: 60
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        }
      ];

      // Mock Market Trends data
      const mockMarketTrends: MarketTrend[] = [
        { period: '2024-01', value: 23.8, competitor_id: '1', metric_type: 'market_share' },
        { period: '2024-02', value: 23.5, competitor_id: '1', metric_type: 'market_share' },
        { period: '2024-03', value: 24.1, competitor_id: '1', metric_type: 'market_share' },
        { period: '2024-01', value: 12.1, competitor_id: '2', metric_type: 'market_share' },
        { period: '2024-02', value: 12.3, competitor_id: '2', metric_type: 'market_share' },
        { period: '2024-03', value: 12.4, competitor_id: '2', metric_type: 'market_share' },
        { period: '2024-01', value: 24.1, competitor_id: '1', metric_type: 'revenue_growth' },
        { period: '2024-02', value: 23.8, competitor_id: '1', metric_type: 'revenue_growth' },
        { period: '2024-03', value: 24.3, competitor_id: '1', metric_type: 'revenue_growth' },
        { period: '2024-01', value: 31.2, competitor_id: '2', metric_type: 'revenue_growth' },
        { period: '2024-02', value: 32.5, competitor_id: '2', metric_type: 'revenue_growth' },
        { period: '2024-03', value: 32.1, competitor_id: '2', metric_type: 'revenue_growth' }
      ];

      // Mock Slack Notifications data
      const mockSlackNotifications: SlackNotification[] = [
        {
          id: 'slack1',
          type: 'alert',
          title: 'Salesforce Price Increase Alert',
          message: 'Salesforce increased Enterprise tier pricing by 15% - immediate competitor analysis recommended',
          channels: ['#competitive-intel', '#sales-team'],
          sent: true,
          created_at: '2024-01-15T08:30:00Z'
        },
        {
          id: 'slack2',
          type: 'insight',
          title: 'Weekly Competitive Intelligence Report',
          message: 'HubSpot launched new AI features, Pipedrive acquired new integration partner',
          channels: ['#competitive-intel', '#product-team'],
          scheduled_time: '2024-01-16T09:00:00Z',
          sent: false,
          created_at: '2024-01-15T10:00:00Z'
        }
      ];

      setCompetitors(mockCompetitors);
      setInsights(mockInsights);
      setAgents(mockAgents);
      setMarketTrends(mockMarketTrends);
      setSlackNotifications(mockSlackNotifications);
      
      // Calculate metrics
      const newMetrics: IntelligenceMetrics = {
        total_competitors: mockCompetitors.length,
        active_monitoring: mockCompetitors.filter(c => c.status === 'active').length,
        high_threat: mockCompetitors.filter(c => c.threat_level === 'high').length,
        new_insights: mockInsights.filter(i => new Date(i.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
        market_share_change: -2.3 // Mock percentage change
      };
      
      setMetrics(newMetrics);
    } catch (error) {
      console.error('Error fetching competitor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompetitors = selectedFilter === 'all' ? competitors : competitors.filter(c => c.threat_level === selectedFilter);
  const filteredInsights = insightFilter === 'all' ? insights : insights.filter(i => i.type === insightFilter);

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'monitoring': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pricing': return DollarSign;
      case 'feature': return Target;
      case 'marketing': return TrendingUp;
      case 'hiring': return Users;
      case 'funding': return BarChart3;
      default: return Eye;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading competitor intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Competitor Intelligence</h1>
                <p className="text-gray-600">Monitor competitive landscape and market insights</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>Add Competitor</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Export Report</span>
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Competitors</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.total_competitors}</p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Monitoring</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.active_monitoring}</p>
                </div>
                <Eye className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Threat</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.high_threat}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Insights</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.new_insights}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Market Share</p>
                  <p className="text-2xl font-bold text-gray-900 flex items-center">
                    {metrics.market_share_change > 0 ? '+' : ''}{metrics.market_share_change}%
                    {metrics.market_share_change > 0 ? 
                      <TrendingUp className="w-4 h-4 text-green-600 ml-1" /> : 
                      <TrendingDown className="w-4 h-4 text-red-600 ml-1" />
                    }
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Agents</p>
                  <p className="text-2xl font-bold text-gray-900">{agents.filter(a => a.status === 'active').length}</p>
                </div>
                <Zap className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-2">
              <div className="flex items-center space-x-1">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'profiles', label: 'Competitor Profiles', icon: Building },
                  { id: 'agents', label: 'AI Agents', icon: Zap },
                  { id: 'analytics', label: 'Market Analytics', icon: LineChart },
                  { id: 'communications', label: 'Communications', icon: MessageSquare }
                ].map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                      }`}
                    >
                      <TabIcon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Competitors Section */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50">
                <div className="p-6 border-b border-gray-200/50">
                  <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Competitor Profiles</h2>
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value as any)}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Threats</option>
                      <option value="high">High Threat</option>
                      <option value="medium">Medium Threat</option>
                      <option value="low">Low Threat</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200/50 max-h-96 overflow-y-auto">
                {filteredCompetitors.map((competitor) => (
                  <div key={competitor.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center text-2xl">
                          {competitor.logo}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{competitor.name}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getThreatColor(competitor.threat_level)}`}>
                              {competitor.threat_level.toUpperCase()}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(competitor.status)}`}>
                              {competitor.status.toUpperCase()}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{competitor.industry}</p>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Market Cap: {competitor.marketCap}</span>
                            <span>Employees: {competitor.employees}</span>
                            <span>Founded: {competitor.founded}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Search className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-xl text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights Section */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50">
              <div className="p-6 border-b border-gray-200/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Insights</h2>
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <select
                      value={insightFilter}
                      onChange={(e) => setInsightFilter(e.target.value as any)}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Types</option>
                      <option value="pricing">Pricing</option>
                      <option value="feature">Features</option>
                      <option value="marketing">Marketing</option>
                      <option value="hiring">Hiring</option>
                      <option value="funding">Funding</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200/50 max-h-96 overflow-y-auto">
                {filteredInsights.map((insight) => {
                  const TypeIcon = getTypeIcon(insight.type);
                  
                  return (
                    <div key={insight.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                          <TypeIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900 text-sm">{insight.title}</h3>
                            <span className={`text-xs font-medium ${getImpactColor(insight.impact)}`}>
                              {insight.impact.toUpperCase()}
                            </span>
                          </div>
                          
                          <p className="text-xs text-gray-600 mb-3">{insight.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <span className="font-medium">{insight.competitor}</span>
                              <span>•</span>
                              <span>{insight.source}</span>
                              <span>•</span>
                              <span>{formatDate(insight.timestamp)}</span>
                            </div>
                            
                            {insight.url && (
                              <a
                                href={insight.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}