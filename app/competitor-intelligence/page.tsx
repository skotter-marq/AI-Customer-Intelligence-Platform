'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  PieChart,
  X,
  ArrowLeft
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab');
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
  const [activeTab, setActiveTab] = useState<'overview' | 'profiles' | 'agents' | 'analytics' | 'communications'>(
    (tabParam === 'profiles' || tabParam === 'agents' || tabParam === 'analytics' || tabParam === 'communications') ? tabParam : 'overview'
  );
  const [loading, setLoading] = useState(true);
  const [showDatabaseSetupNotice, setShowDatabaseSetupNotice] = useState(false);

  useEffect(() => {
    fetchCompetitorData();
  }, []);

  useEffect(() => {
    // Update active tab when URL parameter changes
    if (tabParam === 'profiles' || tabParam === 'agents' || tabParam === 'analytics' || tabParam === 'communications') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const fetchCompetitorData = async () => {
    try {
      setLoading(true);
      
      // Fetch real competitor data from API
      const competitorsResponse = await fetch('/api/competitors');
      let competitorsData = [];
      
      if (competitorsResponse.ok) {
        const result = await competitorsResponse.json();
        competitorsData = result.competitors.map((competitor: any) => ({
          id: competitor.id,
          name: competitor.name,
          logo: `https://logo.clearbit.com/${competitor.domain || 'example.com'}`,
          industry: competitor.industry || 'Technology',
          marketCap: competitor.annual_revenue ? `$${(competitor.annual_revenue / 1e9).toFixed(1)}B` : 'N/A',
          employees: competitor.employee_count?.toLocaleString() || 'N/A',
          founded: competitor.last_funding_date?.split('-')[0] || 'N/A',
          status: competitor.status,
          threat_level: competitor.threat_level,
          last_updated: competitor.updated_at,
          website: competitor.domain,
          location: competitor.location || 'N/A',
          description: competitor.description || 'No description available',
          recent_funding: competitor.funding_stage || 'Unknown',
          valuation: competitor.annual_revenue ? `$${(competitor.annual_revenue / 1e9).toFixed(1)}B` : 'N/A',
          growth_rate: Math.random() * 50, // Placeholder - would come from actual metrics
          market_share: Math.random() * 30, // Placeholder - would come from actual metrics
          key_products: competitor.key_differentiators || [],
          strengths: competitor.key_differentiators || [],
          weaknesses: [], // Would extract from notes or separate field
          recent_news: [] // Would fetch from signals API
        }));
        console.log(`✅ Successfully fetched ${competitorsData.length} competitors from database`);
      } else {
        console.warn('⚠️ Database not yet configured - using mock data. To use real data:');
        console.warn('   1. Go to Supabase SQL Editor');
        console.warn('   2. Execute: database/03_competitive_intelligence_schema.sql');
        console.warn('   3. Refresh the page');
      }
      
      // If no data from API, fall back to mock data
      const usingMockData = competitorsData.length === 0;
      const mockCompetitors: CompetitorProfile[] = competitorsData.length > 0 ? competitorsData : [
        {
          id: '1',
          name: 'Salesforce',
          logo: 'https://logo.clearbit.com/salesforce.com',
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
          logo: 'https://logo.clearbit.com/hubspot.com',
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
          logo: 'https://logo.clearbit.com/pipedrive.com',
          industry: 'Sales CRM',
          marketCap: '$2.1B',
          employees: '1,000',
          founded: '2010',
          status: 'monitoring',
          threat_level: 'medium',
          last_updated: '2024-01-14T14:22:00Z',
          website: 'pipedrive.com',
          location: 'Tallinn, Estonia',
          description: 'Sales-focused CRM designed for small to medium businesses.',
          recent_funding: '$90M Series B',
          valuation: '$2.1B',
          growth_rate: 15.2,
          market_share: 8.5,
          key_products: ['Sales CRM', 'Pipeline Management', 'Email Sync', 'Mobile App'],
          strengths: ['Simple interface', 'Visual pipeline', 'Affordable pricing'],
          weaknesses: ['Limited marketing features', 'Basic reporting', 'Fewer integrations'],
          recent_news: [
            {
              id: 'p1',
              title: 'Pipedrive Launches New AI Features',
              summary: 'Enhanced sales forecasting and lead scoring capabilities.',
              date: '2024-01-12T00:00:00Z',
              source: 'TechCrunch',
              url: '#',
              sentiment: 'positive'
            }
          ],
          financial_metrics: {
            revenue: '$142M ARR',
            profit_margin: 18.5,
            revenue_growth: 22.8
          },
          social_metrics: {
            linkedin_followers: 75000,
            twitter_followers: 45000,
            glassdoor_rating: 4.1,
            employee_sentiment: 'positive'
          }
        },
        {
          id: '4',
          name: 'Zendesk',
          logo: 'https://logo.clearbit.com/zendesk.com',
          industry: 'Customer Support',
          marketCap: '$13B',
          employees: '6,000',
          founded: '2007',
          status: 'active',
          threat_level: 'medium',
          last_updated: '2024-01-14T11:45:00Z',
          website: 'zendesk.com',
          location: 'San Francisco, CA',
          description: 'Customer service platform with ticketing, knowledge base, and chat support.',
          recent_funding: 'Public Company',
          valuation: '$13B',
          growth_rate: 12.1,
          market_share: 18.3,
          key_products: ['Support Suite', 'Guide', 'Chat', 'Talk', 'Explore'],
          strengths: ['Market leader', 'Comprehensive platform', 'Strong integrations', 'Scalable'],
          weaknesses: ['Complex pricing', 'Steep learning curve', 'Expensive for SMBs'],
          recent_news: [
            {
              id: 'z1',
              title: 'Zendesk Expands AI Capabilities',
              summary: 'New Answer Bot features and improved automation tools.',
              date: '2024-01-10T00:00:00Z',
              source: 'Business Wire',
              url: '#',
              sentiment: 'positive'
            }
          ],
          financial_metrics: {
            revenue: '$1.67B ARR',
            profit_margin: 14.2,
            revenue_growth: 16.8
          },
          social_metrics: {
            linkedin_followers: 320000,
            twitter_followers: 185000,
            glassdoor_rating: 4.2,
            employee_sentiment: 'positive'
          }
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
        { period: '2024-01', value: 24.1, competitor_id: '1', metric_type: 'growth_rate' },
        { period: '2024-02', value: 23.8, competitor_id: '1', metric_type: 'growth_rate' },
        { period: '2024-03', value: 24.3, competitor_id: '1', metric_type: 'growth_rate' },
        { period: '2024-01', value: 31.2, competitor_id: '2', metric_type: 'growth_rate' },
        { period: '2024-02', value: 32.5, competitor_id: '2', metric_type: 'growth_rate' },
        { period: '2024-03', value: 32.1, competitor_id: '2', metric_type: 'growth_rate' }
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

      setCompetitors(competitorsData.length > 0 ? competitorsData : mockCompetitors);
      setInsights(mockInsights);
      setAgents(mockAgents);
      setMarketTrends(mockMarketTrends);
      setSlackNotifications(mockSlackNotifications);
      setShowDatabaseSetupNotice(usingMockData);
      
      // Calculate metrics
      const finalCompetitors = competitorsData.length > 0 ? competitorsData : mockCompetitors;
      const newMetrics: IntelligenceMetrics = {
        total_competitors: finalCompetitors.length,
        active_monitoring: finalCompetitors.filter(c => c.status === 'active').length,
        high_threat: finalCompetitors.filter(c => c.threat_level === 'high').length,
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

  // Generate company-specific brand colors and patterns
  const getBrandColors = (companyName: string) => {
    const brandPalettes: Record<string, any> = {
      'salesforce': {
        primary: '#00A1E0',
        secondary: '#032E61',
        accent: '#FF6B35',
        gradient: 'from-blue-500 via-blue-600 to-blue-700',
        pattern: 'salesforce'
      },
      'hubspot': {
        primary: '#FF5C35',
        secondary: '#FF7A59',
        accent: '#FFA07A',
        gradient: 'from-orange-500 via-orange-600 to-red-600',
        pattern: 'hubspot'
      },
      'pipedrive': {
        primary: '#00AC69',
        secondary: '#009F5F',
        accent: '#7ED321',
        gradient: 'from-green-500 via-green-600 to-emerald-600',
        pattern: 'pipedrive'
      },
      'zendesk': {
        primary: '#17494D',
        secondary: '#03363D',
        accent: '#F79A3E',
        gradient: 'from-teal-700 via-slate-700 to-gray-800',
        pattern: 'zendesk'
      },
    };

    const key = companyName.toLowerCase();
    if (brandPalettes[key]) {
      return brandPalettes[key];
    }

    // Fallback: generate colors based on company name hash
    const hash = companyName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const hue = Math.abs(hash) % 360;
    return {
      primary: `hsl(${hue}, 70%, 50%)`,
      secondary: `hsl(${hue}, 80%, 40%)`,
      accent: `hsl(${(hue + 60) % 360}, 60%, 60%)`,
      gradient: `from-blue-500 via-purple-600 to-indigo-700`,
      pattern: 'default'
    };
  };

  const getBrandPattern = (patternType: string, colors: any) => {
    const patterns = {
      salesforce: (
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0">
              <defs>
                <pattern id="salesforce-clouds" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="8" fill="white" opacity="0.1"/>
                  <circle cx="32" cy="12" r="6" fill="white" opacity="0.15"/>
                  <circle cx="8" cy="28" r="5" fill="white" opacity="0.1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#salesforce-clouds)"/>
            </svg>
          </div>
        </div>
      ),
      hubspot: (
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-4 right-8 w-8 h-8 border-2 border-white/20 rounded-full"></div>
            <div className="absolute top-12 left-12 w-6 h-6 bg-white/10 rounded-full"></div>
            <div className="absolute bottom-8 right-16 w-4 h-4 bg-white/15 rounded-full"></div>
            <div className="absolute bottom-16 left-8 w-12 h-12 border border-white/10 rounded-full"></div>
          </div>
        </div>
      ),
      pipedrive: (
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-25">
            <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0">
              <defs>
                <pattern id="pipedrive-pipeline" x="0" y="0" width="20" height="40" patternUnits="userSpaceOnUse">
                  <rect x="8" y="0" width="4" height="40" fill="white" opacity="0.1"/>
                  <circle cx="10" cy="10" r="3" fill="white" opacity="0.2"/>
                  <circle cx="10" cy="30" r="3" fill="white" opacity="0.2"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#pipedrive-pipeline)"/>
            </svg>
          </div>
        </div>
      ),
      zendesk: (
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-6 left-6 w-3 h-3 bg-white/20 transform rotate-45"></div>
            <div className="absolute top-4 right-12 w-2 h-2 bg-white/15 transform rotate-45"></div>
            <div className="absolute bottom-8 left-16 w-4 h-4 bg-white/10 transform rotate-45"></div>
            <div className="absolute bottom-12 right-6 w-3 h-3 bg-white/25 transform rotate-45"></div>
            <div className="absolute top-16 left-1/2 w-2 h-2 bg-white/15 transform rotate-45"></div>
          </div>
        </div>
      ),
      default: (
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 right-6 w-6 h-6 border border-white/20 rounded"></div>
            <div className="absolute bottom-6 left-4 w-4 h-4 bg-white/15 rounded"></div>
            <div className="absolute top-12 left-8 w-3 h-3 bg-white/10 rounded-full"></div>
          </div>
        </div>
      )
    };

    return patterns[patternType as keyof typeof patterns] || patterns.default;
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
                <button 
                  onClick={() => router.push('/competitor-intelligence/add-competitor')}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Competitor</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm">
                  <Download className="w-4 h-4" />
                  <span>Export Report</span>
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Competitors</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.total_competitors}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Monitoring</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.active_monitoring}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Threat</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.high_threat}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Insights</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.new_insights}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-4">
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
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Agents</p>
                  <p className="text-2xl font-bold text-gray-900">{agents.filter(a => a.status === 'active').length}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-1">
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
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
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
              {/* Enhanced Competitor Profiles Overview */}
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50">
                <div className="p-6 border-b border-gray-200/50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Top Competitors</h2>
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
                
                <div className="divide-y divide-gray-200/50 max-h-80 overflow-y-auto">
                  {filteredCompetitors.slice(0, 4).map((competitor) => (
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
                            </div>
                            
                            {competitor.financial_metrics && (
                              <div className="grid grid-cols-2 gap-3 mt-3">
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <p className="text-xs text-gray-500">Revenue</p>
                                  <p className="text-sm font-semibold text-gray-900">{competitor.financial_metrics.revenue}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <p className="text-xs text-gray-500">Growth</p>
                                  <p className="text-sm font-semibold text-green-600">+{competitor.financial_metrics.revenue_growth}%</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => setSelectedCompetitor(competitor)}
                          className="p-2 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Insights */}
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50">
                <div className="p-6 border-b border-gray-200/50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Latest Intelligence</h2>
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
                
                <div className="divide-y divide-gray-200/50 max-h-80 overflow-y-auto">
                  {filteredInsights.slice(0, 6).map((insight) => {
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

              {/* Market Trends Chart */}
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50">
                <div className="p-6 border-b border-gray-200/50">
                  <h2 className="text-xl font-semibold text-gray-900">Market Share Trends</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {competitors.slice(0, 3).map((competitor) => {
                      const trendData = marketTrends.filter(t => t.competitor_id === competitor.id && t.metric_type === 'market_share');
                      const latestTrend = trendData[trendData.length - 1];
                      const previousTrend = trendData[trendData.length - 2];
                      const change = latestTrend && previousTrend ? latestTrend.value - previousTrend.value : 0;
                      
                      return (
                        <div key={competitor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{competitor.logo}</span>
                            <div>
                              <p className="font-semibold text-gray-900">{competitor.name}</p>
                              <p className="text-sm text-gray-500">{latestTrend?.value.toFixed(1)}% market share</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                            </span>
                            {change >= 0 ? 
                              <TrendingUp className="w-4 h-4 text-green-600" /> : 
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            }
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Active AI Agents Summary */}
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50">
                <div className="p-6 border-b border-gray-200/50">
                  <h2 className="text-xl font-semibold text-gray-900">AI Agent Status</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {agents.filter(a => a.status === 'active').slice(0, 3).map((agent) => (
                      <div key={agent.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{agent.name}</p>
                            <p className="text-sm text-gray-500">
                              {agent.total_insights} insights • {agent.success_rate}% success rate
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ACTIVE
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Competitor Profiles Tab */}
          {activeTab === 'profiles' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {competitors.map((competitor) => {
                  const brandColors = getBrandColors(competitor.name);
                  
                  return (
                    <div
                      key={competitor.id}
                      onClick={() => router.push(`/competitor-intelligence/add-competitor?edit=${competitor.id}`)}
                      className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl hover:border-blue-300 hover:bg-white transition-all duration-300 group h-[580px] flex flex-col cursor-pointer"
                    >
                      {/* Featured Header Section - LinkedIn-style profile */}
                      <div className="relative h-48 overflow-hidden flex-shrink-0">
                        {/* Cover Image Background - Dynamic Brand Colors */}
                        <div className={`w-full h-32 bg-gradient-to-br ${brandColors.gradient} relative overflow-hidden`}>
                          {/* Brand-specific patterns */}
                          {getBrandPattern(brandColors.pattern, brandColors)}
                          
                          {/* Subtle overlay for depth */}
                          <div className="absolute inset-0 bg-black/5"></div>
                          
                          {/* Threat level indicator */}
                          <div className={`absolute top-0 left-0 right-0 h-1 ${
                            competitor.threat_level === 'high' ? 'bg-red-500' : 
                            competitor.threat_level === 'medium' ? 'bg-yellow-500' : 
                            'bg-green-500'
                          }`}></div>

                          {/* Status badges - positioned on cover with better contrast */}
                          <div className="absolute top-4 right-4 flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${getThreatColor(competitor.threat_level)} backdrop-blur-sm bg-white/90 shadow-sm`}>
                              <Target className="w-3 h-3 mr-1" />
                              {competitor.threat_level.toUpperCase()}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(competitor.status)} backdrop-blur-sm bg-white/90 shadow-sm`}>
                              <Activity className="w-3 h-3 mr-1" />
                              {competitor.status.toUpperCase()}
                            </span>
                          </div>
                        </div>

                      {/* Profile Section - LinkedIn style */}
                      <div className="relative h-16 bg-white px-6">
                        {/* Company Logo - overlapping cover image */}
                        <div className="absolute -top-8 left-6">
                          <div className="w-16 h-16 bg-white rounded-lg shadow-lg border-2 border-white flex items-center justify-center overflow-hidden">
                            {/* Try to render actual logo if URL provided, otherwise use emoji */}
                            {competitor.logo && competitor.logo.startsWith('http') ? (
                              <img 
                                src={competitor.logo} 
                                alt={`${competitor.name} logo`}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  // Fallback to emoji if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.parentElement!.innerHTML = `<span class="text-2xl font-bold text-gray-600">${competitor.name.charAt(0)}</span>`;
                                }}
                              />
                            ) : (
                              <span className="text-2xl font-bold text-gray-600">
                                {competitor.logo || competitor.name.charAt(0)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Company Info - LinkedIn style layout */}
                        <div className="pt-4 pl-20">
                          <h3 className="text-lg font-bold text-gray-900 truncate">{competitor.name}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>{competitor.industry}</span>
                            <span>•</span>
                            <span>{competitor.employees} employees</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content Section - matches content pipeline structure */}
                    <div className="p-6 flex-1 flex flex-col">
                      {/* Company Info */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Globe className="w-4 h-4" />
                          <span className="truncate">{competitor.website}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{competitor.location?.split(',')[0]}</span>
                        </div>
                      </div>

                      {/* Key Competitive Metrics */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">Market Share</p>
                            {competitor.market_share >= 20 ? 
                              <TrendingUp className="w-3 h-3 text-red-500" /> :
                              competitor.market_share >= 10 ?
                              <TrendingUp className="w-3 h-3 text-yellow-500" /> :
                              <TrendingUp className="w-3 h-3 text-green-500" />
                            }
                          </div>
                          <p className="text-sm font-bold text-gray-900">{competitor.market_share}%</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">Growth</p>
                            {competitor.growth_rate >= 25 ? 
                              <TrendingUp className="w-3 h-3 text-red-500" /> :
                              <TrendingUp className="w-3 h-3 text-green-600" />
                            }
                          </div>
                          <p className="text-sm font-bold text-gray-900">+{competitor.growth_rate}%</p>
                        </div>
                      </div>

                      {/* Company Info Section - matches content pipeline style */}
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-xs text-blue-600">Valuation</p>
                            <p className="text-sm font-bold text-blue-900">{competitor.valuation}</p>
                          </div>
                          <div>
                            <p className="text-xs text-blue-600">Employees</p>
                            <p className="text-sm font-bold text-blue-900">{competitor.employees}</p>
                          </div>
                          <div>
                            <p className="text-xs text-blue-600">Founded</p>
                            <p className="text-sm font-bold text-blue-900">{competitor.founded}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Key Products - matches content pipeline tags style */}
                      {competitor.key_products && competitor.key_products.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-2">Key Products</p>
                          <div className="flex gap-1 h-6 overflow-hidden">
                            {competitor.key_products.slice(0, 2).map((product, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg whitespace-nowrap flex-shrink-0">
                                {product.length > 12 ? `${product.substring(0, 12)}...` : product}
                              </span>
                            ))}
                            {competitor.key_products.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg whitespace-nowrap flex-shrink-0">
                                +{competitor.key_products.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Competitive Intelligence - Fixed height for consistency */}
                      <div className="h-16 mb-4">
                        <div className="grid grid-cols-2 gap-3">
                          {competitor.strengths && competitor.strengths.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Top Strength</p>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">
                                {competitor.strengths[0].length > 15 ? `${competitor.strengths[0].substring(0, 15)}...` : competitor.strengths[0]}
                              </span>
                            </div>
                          )}
                          {competitor.weaknesses && competitor.weaknesses.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Key Weakness</p>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-700">
                                {competitor.weaknesses[0].length > 15 ? `${competitor.weaknesses[0].substring(0, 15)}...` : competitor.weaknesses[0]}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Monitoring Status - matches content pipeline metrics */}
                      <div className="h-8 mb-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 h-full">
                          <div className="flex items-center space-x-1">
                            <Activity className="w-3 h-3" />
                            <span className="text-xs">Updated {formatDate(competitor.last_updated)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-xs">Active</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions - matches content pipeline style */}
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center space-x-3">
                          {/* Monitoring Toggle Switch - matches content pipeline published toggle */}
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Monitoring</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Toggle monitoring status
                                console.log('Toggle monitoring for', competitor.name);
                              }}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                competitor.status === 'active' ? 'bg-green-600' : 'bg-gray-300'
                              }`}
                              title={competitor.status === 'active' ? 'Click to pause monitoring' : 'Click to resume monitoring'}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  competitor.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/competitor-intelligence/add-competitor?edit=${competitor.id}`);
                            }}
                            className="p-2 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                            title="Edit competitor"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(competitor.website.startsWith('http') ? competitor.website : `https://${competitor.website}`, '_blank');
                            }}
                            className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Visit website"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
                })}
              </div>
            </div>
          )}

          {/* AI Agents Tab */}
          {activeTab === 'agents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">AI Agent Management</h2>
                <button 
                  onClick={() => router.push('/competitor-intelligence/create-agent')}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Agent</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {agents.map((agent) => (
                  <div key={agent.id} className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                            <p className="text-sm text-gray-500 capitalize">{agent.type} monitoring</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          agent.status === 'active' ? 'bg-green-100 text-green-800' :
                          agent.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                          agent.status === 'error' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {agent.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Success Rate</p>
                          <p className="text-lg font-bold text-green-600">{agent.success_rate}%</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Total Insights</p>
                          <p className="text-lg font-bold text-blue-600">{agent.total_insights}</p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Schedule</p>
                          <p className="text-sm font-medium text-gray-900 capitalize">{agent.schedule}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Next Run</p>
                          <p className="text-sm font-medium text-gray-900">{formatDate(agent.next_run)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Monitoring</p>
                          <p className="text-sm font-medium text-gray-900">{agent.competitor_ids.length} competitors</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-2">
                          <button className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 transition-colors">
                            <Clock className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <Settings className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Market Analytics</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Market Share Analysis */}
                <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50">
                  <div className="p-6 border-b border-gray-200/50">
                    <h3 className="text-xl font-semibold text-gray-900">Market Share Distribution</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {competitors.slice(0, 4).map((competitor) => {
                        const shareData = marketTrends.filter(t => t.competitor_id === competitor.id && t.metric_type === 'market_share');
                        const latestShare = shareData[shareData.length - 1]?.value || 0;
                        
                        return (
                          <div key={competitor.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-lg">{competitor.logo}</span>
                                <span className="font-medium text-gray-900">{competitor.name}</span>
                              </div>
                              <span className="text-sm font-semibold text-gray-900">{latestShare.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" 
                                style={{ width: `${Math.min(latestShare * 4, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Growth Rate Comparison */}
                <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50">
                  <div className="p-6 border-b border-gray-200/50">
                    <h3 className="text-xl font-semibold text-gray-900">Revenue Growth Rates</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {competitors.filter(c => c.financial_metrics).map((competitor) => (
                        <div key={competitor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{competitor.logo}</span>
                            <div>
                              <p className="font-semibold text-gray-900">{competitor.name}</p>
                              <p className="text-sm text-gray-500">{competitor.financial_metrics?.revenue}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              +{competitor.financial_metrics?.revenue_growth}%
                            </p>
                            <p className="text-xs text-gray-500">YoY Growth</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Threat Level Analysis */}
                <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50">
                  <div className="p-6 border-b border-gray-200/50">
                    <h3 className="text-xl font-semibold text-gray-900">Competitive Threat Analysis</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-red-50 rounded-xl">
                        <p className="text-2xl font-bold text-red-600">{competitors.filter(c => c.threat_level === 'high').length}</p>
                        <p className="text-sm text-red-700">High Threat</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-xl">
                        <p className="text-2xl font-bold text-yellow-600">{competitors.filter(c => c.threat_level === 'medium').length}</p>
                        <p className="text-sm text-yellow-700">Medium Threat</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-xl">
                        <p className="text-2xl font-bold text-green-600">{competitors.filter(c => c.threat_level === 'low').length}</p>
                        <p className="text-sm text-green-700">Low Threat</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Insights Trends */}
                <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50">
                  <div className="p-6 border-b border-gray-200/50">
                    <h3 className="text-xl font-semibold text-gray-900">Intelligence Activity</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {['pricing', 'feature', 'marketing', 'hiring', 'funding'].map((type) => {
                        const count = insights.filter(i => i.type === type).length;
                        const TypeIcon = getTypeIcon(type);
                        
                        return (
                          <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                <TypeIcon className="w-4 h-4 text-blue-600" />
                              </div>
                              <span className="font-medium text-gray-900 capitalize">{type}</span>
                            </div>
                            <span className="text-lg font-bold text-blue-600">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Communications Tab */}
          {activeTab === 'communications' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Communication Management</h2>
                <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>Schedule Notification</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Slack Notifications */}
                <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50">
                  <div className="p-6 border-b border-gray-200/50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-900">Slack Notifications</h3>
                      <MessageSquare className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200/50">
                    {slackNotifications.map((notification) => (
                      <div key={notification.id} className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              notification.type === 'alert' ? 'bg-red-100' :
                              notification.type === 'insight' ? 'bg-blue-100' :
                              'bg-green-100'
                            }`}>
                              {notification.type === 'alert' ? (
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                              ) : notification.type === 'insight' ? (
                                <Star className="w-4 h-4 text-blue-600" />
                              ) : (
                                <BarChart3 className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            notification.sent ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {notification.sent ? 'SENT' : 'SCHEDULED'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span>Channels: {notification.channels.join(', ')}</span>
                            <span>•</span>
                            <span>{formatDate(notification.created_at)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-1 rounded text-gray-400 hover:text-blue-600 transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-1 rounded text-gray-400 hover:text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Communication Settings */}
                <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50">
                  <div className="p-6 border-b border-gray-200/50">
                    <h3 className="text-xl font-semibold text-gray-900">Notification Settings</h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Alert Triggers</h4>
                      <div className="space-y-3">
                        {[
                          { label: 'Price Changes', enabled: true },
                          { label: 'New Product Launches', enabled: true },
                          { label: 'Funding Announcements', enabled: false },
                          { label: 'Key Personnel Changes', enabled: true },
                          { label: 'Market Share Shifts', enabled: true }
                        ].map((trigger, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="text-sm font-medium text-gray-900">{trigger.label}</span>
                            <div className={`w-12 h-6 rounded-full ${trigger.enabled ? 'bg-green-500' : 'bg-gray-300'} relative transition-colors`}>
                              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${trigger.enabled ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Default Channels</h4>
                      <div className="space-y-2">
                        {['#competitive-intel', '#sales-team', '#product-team', '#executives'].map((channel, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                            <input type="checkbox" className="w-4 h-4 text-purple-600 rounded" defaultChecked={index < 2} />
                            <span className="text-sm font-medium text-gray-900">{channel}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Report Schedule</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                          <option>Daily Summary</option>
                          <option>Weekly Report</option>
                          <option>Monthly Analysis</option>
                        </select>
                        <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                          <option>9:00 AM</option>
                          <option>12:00 PM</option>
                          <option>5:00 PM</option>
                        </select>
                      </div>
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